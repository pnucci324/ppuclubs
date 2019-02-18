var express = require('express');
var app = express();
var jquery = require('jquery');

var http = require("http");
var mysql = require("mysql");
var credentials = require("./credentials");
var qs = require("querystring");
var session = require('express-session');

//set up handlebars
var handlebars = require('express-handlebars')

        .create({ defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));

app.use('/css', express.static('css'));

app.use('/img', express.static('img'));

app.use('/js', express.static('js'));

app.set ('port', process.env.PORT || 3000);

app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({
	resave: false,
	saveUninitialized: false,
	secret: credentials.cookieSecret
}));

function addGroup(req, res){
	var body = "";
	req.on("data", function (data) {
		body += data;
	//le6 ==! * Math.pow(10, 6) ===1 * 1000000 ~~~ 1MB
	if(body.length > 1e6){
		//FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
		req.connection.destroy();
	}
})
req.on("end", function(){
	var injson = JSON.parse(body);
	var conn = mysql.createConnection(credentials.connection);
	//connect to datatbase
	conn.connect(function (err){
		if (err){
			console.error("ERROR: connot connect: " + e);
			return;
		}
		//query the database
		con.query("INSERT INTO THE USER (GROUP) VALUE (?)", [injson.name], function (err, row, fields){
			//build json result object
			var outjson = {};
			if (err){
				//query failed
				outjson.success = false;
				outjson.message = "Query failed: " + err;
			}
			else {
				//query successful
				outjson.success = true;
				outjson.message = "Query successful!";
			}
			//return json object that contains the result of the query
			sendResponse(req, res, outjson);
		});
	});
});
}



function addUser(req, res){
        var body = "";
        req.on("data", function (data) {
                body += data;
        //le6 ==! * Math.pow(10, 6) ===1 * 1000000 ~~~ 1MB
        if(body.length > 1e6){
                //FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
                req.connection.destroy();
        }
})
req.on("end", function(){
        var injson = JSON.parse(body);
        var conn = mysql.createConnection(credentials.connection);
        //connect to datatbase
        conn.connect(function (err){
                if (err){
                        console.error("ERROR: connot connect: " + e);
                        return;
                }
                //query the database
                con.query("INSERT INTO THE USER (GROUP) VALUE (?)", [injson.name], function (err, row, fields){
                        //build json result object
                        var outjson = {};
                        if (err){
                                //query failed
                                outjson.success = false;
                                outjson.message = "Query failed: " + err;
                        }
                        else {
                                //query successful
                                outjson.success = true;
                                outjson.message = "Query successful!";
                        }
                        //return json object that contains the result of the query
                        sendResponse(req, res, outjson);
                });
        });
});
}

app.get('/', function(req, res) {
	res.render('home',
		{
			page: "home",
			title: "PPUclubs",
		}
	);
});
app.get('/about', function(req, res) {
	res.render('about',
		{
			page: "about",
			title: "About",
			isAbout: true,
		}
	);
});
app.get('/search', function(req, res) {
	res.render('search',
		{
			page: "search",
			title: "Search",
			isSearch: true,
		}
	);
});

app.get('/login', function(req, res) {
	res.render('login',
		{
			page: "login",
			title: "login",
			isLogin: true,
		}
	);
});
app.get('/create', function(req, res) {
	res.render('create',
		{
			page: "create",
			title: "Create",
			isCreate: true,
		}
	);
});
app.get('/contact', function(req, res) {
	res.render('contact',
		{
			page: "contact",
			title: "Contact",
			isContact: true,
		}
	);
});
//Sessions for login or group make
/*app.post('/process',function(req, res){
	if(req.xhr || req.accepts('json,html') === 'json'){
		res.send({ success: true });
		loginCounter += 1;
		req.session.user = {
			username: req.body.username,
			password: req.body.password,
		};
		console.log('test');
		verifyUser(req.session.user, function(result){
			console.log('Successful login!');
		} else {
			console.log('Unsussessufl login attempt!');
		}
	})
}
});*/



//custom 404 page
app.use(function(req,res){
	res.type('text/plain');
	res.status(404);
	res.send('404-Not Found');
});

//custom 500 page
app.use(function(err,req,res,next){
	console.error(err.stack);
	res.type('text/plain');
	res.status(500);
	res.send('500 - Sever Error');
});

app.listen(app.get('port'), function(){
	console.log( 'Express started on http://localhost: ' +
		app.get('port') + '; press Ctrl-C to terminate.');
});
