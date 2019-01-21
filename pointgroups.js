var express = require('express');
var app = express();

//set up handlebars
var handlebars = require('express-handlebars')

        .create({ defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));

app.use('/css', express.static('css'));

app.set ('port', process.env.PORT || 3000);

app.get('/', function(req, res) {
	res.render('home');
});
app.get('/about', function(req, res) {
	res.render('about');
});
app.get('/search', function(req, res) {
	res.render('search');
});
app.get('/create', function(req, res) {
	res.render('create');
});
app.get('/contact', function(req, res) {
	res.render('contact');
});


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
