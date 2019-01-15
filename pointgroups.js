var app = express();

app.use(express.static(_dirname + '/public'));

//set up handlebars
var handlebars = require('express3-handlebars')
	.create({ defaultLayout: 'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');


