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
  var injson = {
    "UserID": null,
    "UserFirstName": req.body.FirstName,
    "UserLastName":  req.body.LastName,
    "UserEmail":  req.body.Email,
    "UserPhoneNumber":  req.body.Phone,
    "UserPassword":  req.body.Password,
    "UserEmailLogin": req.body.UserEmailLogin,
    "UserPasswordLogin": req.body.UserPasswordLogin
  }
console.log(injson);
    // query the database
    session = req.session;
    if(req.body.UserEmailLogin == 'admin'){
      if(req.body.UserEmailLogin == 'admin' && req.body.UserPasswordLogin == 'admin'){
        session.uniqueID = req.body.username;
      }
      res.redirect('/redirects')
    }else{
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
    }
});

app.get('/redirects', function(req, res){
  if(session.uniqueID){
    res.redirect('/admin');
  }else{
    res.end('Not an admin');
  }
});

app.post('/addEvent', function(req, res){
  var injson = {
    "eventID": null,
    "eventDate": req.body.datepicker,
    "eventName": req.body.EventName,
    "EventDescription": req.body.EventDescription
  }
    console.log(injson);

  con.query("INSERT INTO EventInfo (eventDate,eventName,EventDescription) VALUES ('" + req.body.datepicker + "', '" + req.body.EventName + "', '" + req.body.EventDescription + "');", injson, function(err, rows, fields) {

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

    res.redirect('calendar');
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

      res.redirect('groups?ID=' + rows.insertID);
    });
});

function removeUser(userid, groupid, cb){
  var sql = "DELETE FROM GroupCreate WHERE UserInfo_UserID = " + userid + " AND GroupInfo_GroupID = " + groupid;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Number of records deleted: " + result.affectedRows);
    cb();
  });
  }


app.post('/deleteUser', function (req, res) {
  console.log(req.body.userID + " " + req.body.groupID);
  removeUser(req.body.userID, req.body.groupID, function(){
     res.send({ success: true })
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

app.get('/addUser', function(req, res) {
  res.render('addUser',
  {
    page: "AddUser",
    title: "PPUclubs",
  }
);
});


app.get('/calendar', function (req, res) {

var sqlQuery = con.query('Select * from EventInfo where eventDate = ' + req.body.eventDate );

  con.query(sqlQuery, function(error, results, fields){
    if(error) throw error;

    res.render('groups', {
      title: "Example Database - Is this working??",
      results: results
    });
    console.log(results);
  });

	res.render('calendar',
  {
    page:  "calendar",
    title: "Calendar",
    isCalendar: true,
  }
)
});



app.get('/groups', function(req, res){

  var sqlQuery = 'SELECT * FROM GroupCreate LEFT JOIN UserInfo ON UserInfo.UserID = GroupCreate.UserInfo_UserID LEFT JOIN GroupInfo ON GroupInfo.GroupID = GroupCreate.GroupInfo_GroupID Where GroupID = ' + req.query.ID;

  con.query(sqlQuery, function(error, results, fields){
    if(error) throw error;

    res.render('groups', {
      title: "Example Database - Is this working??",
      results: results,
      groupName: results[0].GroupName
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
