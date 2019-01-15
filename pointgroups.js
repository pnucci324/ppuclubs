var app = express();
var express = require('express');

app.use(express.static(_dirname + '/public'));

app.set ('port', process.env.PORT || 3000);

//custom 404 page
app.use(function(req,res){
	res.type('text/plain');
	res.status(404);
	res.send('404-Not Found');
});

//custom 500 page
app.use(function(err,req,res,next){
	console.error(err.stack
	res.type('text/plain');
	res.status(500);
	res.send('500 - Sever Error);
});
//set up handlebars
var handlebars = require('express3-handlebars')
	.create({ defaultLayout: 'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');


