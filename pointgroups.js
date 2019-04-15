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
  database: 'ppuclubs',
  multipleStatements: true
});

con.connect(function (err) {
  if (!err)
  console.log("Connection made with the database")
  else
  console.log("DB connection failed \n Error:" + JSON.stringify(err, undefined, 2));
});

// functions


function removeUser(userid, groupid, cb){
  var sql = "DELETE FROM GroupCreate WHERE UserInfo_UserID = " + userid + " AND GroupInfo_GroupID = " + groupid;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Number of records deleted: " + result.affectedRows);
    cb();
  });
}

function joingroup(userid, groupid, cb){
  var sql = "insert into GroupCreate (UserInfo_UserID, GroupInfo_GroupID, AdminStatus) values ('" + userid + "','" + groupid + "', 0);"
  con.query(sql, function (err, result){
    if (err) throw err;
    console.log("UserID: " + userid + " was inserted into " + groupid);
    cb();
  });
}

// app.post

app.post('/CreateAccount', function (req, res) {
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
    "GroupDescription": req.body.GroupDescription,
    "GroupType": req.body.selectpicker
  };
  console.log(injson);
  // query the database
  con.query("INSERT INTO GroupInfo (GroupName,GroupDescription,GroupType) VALUES ('" + req.body.GroupName + "', '" + req.body.GroupDescription + "', '" + req.body.selectpicker + "');", injson, function(err, rows, fields) {
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


app.post('/deleteUser', function (req, res) {
  console.log(req.body.userID + " " + req.body.groupID);
  removeUser(req.body.userID, req.body.groupID, function(){
    res.send({ success: true })
  });
});

app.post('/joingroup', function(req, res) {
  console.log(req.body.UserID + " " + req.body.GroupID);
  joingroup(req.body.UserID, req.body.GroupID, function(){
    res.send({ success: true })
  });
});

app.post('/login', function(req, res) {


  var sql = "Select * from UserInfo where UserEmail = '"+ req.body.UserEmailLogin +"'";
  con.query(sql, function(error, results, fields){
    if(error){
      console.log(error);
    }else if(req.body.UserPasswordLogin != results[0].UserPassword){
      console.log("Wrong password entered. User entered " + req.body.UserPasswordLogin + " and actual password is " + results[0].UserPassword);
      res.redirect(req.originalUrl);
    }else{
      console.log(results);
      req.session.ID = results[0].UserID;
      res.redirect('profile?ID=' + results[0].UserID);
    }
  })
});


// app.get

app.get('/search', function(req, res){
  console.log('inside of app.get for the home page');
  var tmp = req.session.ID;
  var sqlQuery = 'select UserID, GroupID, GroupName, GroupDescription from GroupInfo, UserInfo where UserID = ' + tmp + ';'

  con.query(sqlQuery, function(error, results, fields){
    if(error) throw error;


    res.render('search', {
      title: "Example Database - Is this working??",
      results: results,
      UserID: results.UserID
    });
    console.log(tmp);
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

  var sqlQuery = 'Select * from EventInfo;'

  con.query(sqlQuery, function(error, results, fields){
    if(error) throw error;

    res.render('calendar',
    {
      page:  "calendar",
      title: "Calendar",
      isCalendar: true,
      results: results
    })
    console.log(results);
  });

});



app.get('/groups', function(req, res){

  console.log("Current Session ID = " + req.session.ID);
  console.log(req.session);

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

app.get('/profile', function(req, res){
  var tmp = req.query.ID;
  var tmp = parseInt(tmp);
  console.log("Your session ID = " + req.session.ID);
  console.log(tmp);

  var sqlQuery = //'Select UserID, UserFirstName, UserLastName from UserInfo where UserID = ' + req.query.ID; +
  '  SELECT * FROM GroupCreate LEFT JOIN UserInfo ON UserInfo.UserID = GroupCreate.UserInfo_UserID LEFT JOIN GroupInfo ON GroupInfo.GroupID = GroupCreate.GroupInfo_GroupID Where UserInfo_UserID = ' + tmp + ';' +
  ' Select * from GroupInfo where GroupType = "Sports";'
  con.query(sqlQuery, function(error, results, fields){
    if(results[0].length === 0){
      console.log("User is not in any group");
      res.redirect('search')
    }else{

      res.render('profile', {
        title: "Profile",
        //results: results[0],
        results1: results[0],
        results2: results[1],
        Username: results[0][0].UserFirstName + " " + results[0][0].UserLastName
      });
      console.log(results[0]);

    }

  });

});

/*app.get('/profile', function(req, res){

var sqlQuery = 'Select UserID, UserFirstName, UserLastName from UserInfo where UserID = 1';
+ ' SELECT * FROM GroupCreate LEFT JOIN UserInfo ON UserInfo.UserID = GroupCreate.UserInfo_UserID LEFT JOIN GroupInfo ON GroupInfo.GroupID = GroupCreate.GroupInfo_GroupID Where UserInfo_UserID = 1';
+ ' Select * from GroupInfo where GroupType = "Sports";'
con.query(sqlQuery, function(error, results, fields){
if(error) throw error;

res.render('profile', {
title: "Profile",
results: results[0],
results1: results[1],
results2: results[2],
Username: results[0].UserFirstName + " " + results[0].UserLastName
});
console.log(results[0]);
console.log(results[1]);
console.log(results[2]);
});

});*/


app.get('/about', function(req, res) {
  res.render('about',
  {
    page: "about",
    title: "About",
    isAbout: true,
  }
);
});

app.get('/login', function(req, res){
  res.render('login');
})

app.get('/CreateAccount', function(req, res) {
  res.render('CreateAccount',
  {
    page: "Register",
    title: "Register",
    isCreateAccount: true,
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
