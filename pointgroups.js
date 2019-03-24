var express = require('express');
var app = express();
var jquery = require('jquery');
var fs = require('fs');
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

//app.set('views', __dirname + '/views');

app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({
  resave: false,
  saveUninitialized: false,
  secret: credentials.cookieSecret
}));

app.use(function( req, res, next) {
  console.log(req.url);
  next();
})

var con = mysql.createConnection({
  host: "db.it.pointpark.edu",
  user: 'ppuclubs',
  password: 'ppuclubs',
  database: 'ppuclubs'
});

con.connect(function (err) {
  if (!err)
  console.log("Connection made with the database")
  else
  console.log("DB connection failed \n Error:" + JSON.stringify(err, undefined, 2));
});





app.get('/search', function(req, res){
  console.log('inside of app.get for the home page');

  var sqlQuery = 'select GroupID, GroupName, GroupDescription from GroupInfo';

  con.query(sqlQuery, function(error, results, fields){
    if(error) throw error;

    console.log("here are the results for your query: ");
    console.log(results);

    res.render('search', {
      title: "Example Database - Is this working??",
      results: results
    });
  });
});

app.post('/login', function (req, res) {
  console.log("working");



  var injson = {
    "UserID": null,
    "UserFirstName": req.body.FirstName,
    "UserLastName":  req.body.LastName,
    "UserEmail":  req.body.Email,
    "UserPhoneNumber":  req.body.Phone,
    "UserPassword":  req.body.Password
  }

console.log(injson);
    // query the database
    con.query("INSERT INTO UserInfo (UserFirstName,UserLastName,UserPhoneNumber,UserEmail,UserPassword) VALUES ('" + req.body.FirstName + "', '" + req.body.LastName + "', '" + req.body.Phone + "', '" + req.body.Email + "', '" + req.body.Password + "');", injson, function(err, rows, fields) {

      // build json result object
      var outjson = {};
      if (err) {
        // query failed
        console.log(err);
        outjson.success = false;
        outjson.message = "Query failed: " + err;
      }
      else {
        // query successful
        outjson.success = true;
        outjson.message = "Query successful!";
      }
      // return json object that contains the result of the query


      res.redirect('login');
    });
});

app.post('/create', function (req, res) {
  console.log("working");
  var injson = {
    "GroupID": null,
    "GroupName":req.body.GroupName,
    "GroupDescription": req.body.GroupDescription
};
console.log(injson);
    // query the database
    con.query("INSERT INTO GroupInfo (GroupName,GroupDescription) VALUES ('" + req.body.GroupName + "', '" + req.body.GroupDescription + "');", injson, function(err, rows, fields) {
      // build json result object
      var outjson = {};
      if (err) {
        // query failed
        console.log(err);
        outjson.success = false;
        outjson.message = "Query failed: " + err;
      }
      else {
        // query successful
        console.log(rows);
        outjson.success = true;
        outjson.message = "Query successful!";
      }
      // return json object that contains the result of the query
          console.log(req.body.GroupName);

      res.redirect('groups?ID=' + rows.insertId);
    });
});


app.get('/', function(req, res) {
  res.render('home',
  {
    page: "home",
    title: "PPUclubs",
  }
);
});


app.get('/calendar', function (req, res) {
	res.render('calendar',
  {
    page:  "calendar",
    title: "Calendar",
    isCalendar: true,
  }
)
});

app.get('/events',function(req,res){
	res.render('events',
	{
		page: 'events',
		title: 'Events',
		isEvents: true,
	}
)
});


app.get('/groups', function(req, res){

  var sqlQuery = 'SELECT * FROM GroupCreate LEFT JOIN UserInfo ON UserInfo.UserID = GroupCreate.UserInfo_UserID LEFT JOIN GroupInfo ON GroupInfo.GroupID = GroupCreate.GroupInfo_GroupID Where GroupID = ' + req.query.ID;

  con.query(sqlQuery, function(error, results, fields){
    if(error) throw error;

    res.render('groups', {
      title: "Example Database - Is this working??",
      results: results
    });
    console.log(results);
  });
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

app.get('/events', function(req, res){
  res.render('events');
});

app.get('/addEvent', function(req, res){
  res.render('addEvent');
});

//users
function users(req,res){
        var conn = mysql.createConenction(credentials.conenction);
        //connect to database
        conn.connect(function (err){
                if (err){
                        console.error("ERROR: connot connect: " + err);
                        return;
                }
                //query the database
                conn.query("SELECT * FROM USERS", function (err, rows, fields){
                        //build json result object
                        var outjson = {};
                        if (err){
                                //query failed
                                outjson.success = false;
                                outjson.message = "Query failed: " + err;
                        }
                        else{
                                //query successful
                                outjson.success = true;
                                outjson.message = "Query sucessful!";
                                outjson.data = rows;
                        }
                        //return json object that contains the result of the query
                        conn.end();
                        sendResponse(req,res,outjson);
                });
        });
}
//addUser
/*function addUser(req,res){
	var body= "";
	req.on('data', function(data){
		body += data;
		//1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
		if(body.length > 1e6){
			//FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
			req.connection.destroy();
		}
	})
	req.on('end', function(){
		var injson = JSON.parse(body);
		var conn = mysql.createConnection(credentials.connection)[
		//connect to database
		conn.connect(function (err){
			if(err){
				console.error("ERROR: cannot conect: " + e);
				return;
			}
			//query the database
			conn.query("INSERT INTO USER(NAME) VALUE(?)", [injon.name], function(err, rows, fields){
				//build json resut object
				var outjson = {};
				if(err){
					//query failed
					outjson.success = false;
					outjson.message = "Query failed: " + err;
				}else{
					//query successful
					outjson.success = true;
					ousjson.message = "Query sucessful!";
				}
				//return json object that contains the resutl fo the query
				sendResponse(req, res, outjson);
			});
			conn.end();
		});
	});
}*/


//verify user





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
  res.send('500 - Server Error');
});

app.listen(app.get('port'), function(){
  console.log( 'Express started on http://localhost: ' +
  app.get('port') + '; press Ctrl-C to terminate.');
});
