//importing installed packages, require = import
var express  = require('express'); // fast minimal web framework
var bodyParser = require('body-parser'); // body parsing middleware
var morgan = require('morgan'); // HTTP request logger middleware

//importing config.js variables/functions 
var config = require('./config');

//importing middleware to connect to  database
var mongoose = require('mongoose');

//creating a new instance app of the express object
var app = express();

/*setting up your Socket io for Real Time Capability*/
//HTTP server that takes in the express initialized 'app' as a function handler
var http = require('http').Server(app);
//initialize a new instance of socket.io by passing the http (HTTP server) obj
var io = require('socket.io')(http);


mongoose.Promise = global.Promise;
/*
connect to dabase - mongoose.connect(uri(s),[options],[callback])
@param config.databse grabs the uri from config.js
@param callback function checking for errors
*/
mongoose.connect(config.database,
	function(err)
	{
		if(err)
		{
			console.log(err);
		}
		else
		{
			console.log("Connected to database");
		}
	});



//adding middlewares

/*
Any values on the specific route can be images/videos/strings
for true if false it will parse only strings

Parses the text as URL encoded data (which is how browsers 
tend to send form data from regular forms set to POST) and 
exposes the resulting object (containing the keys and values)
on req.body.
 */
app.use(bodyParser.urlencoded({extended:true}));

/*
Parses the text as JSON and exposes the resulting object 
on req.body.
*/
app.use(bodyParser.json());

// route morgan so we can log incoming traffic such as req/res to the server
app.use(morgan('dev'));

/*
Middleware to render all our public static files
Any images, css, html, javascipt files in the public folder will be rendered 
so that you can use them at the front end
Without this middleware there is no way for your index.html file to render
css or javascript files
*/
app.use(express.static(__dirname + '/public'));

//creates an instance of the api.js and allows api.js to use app and express variables from server.js
//update: passing the param io for socket.io real time capability
var api = require('./app/routes/api')(app, express, io);

//routes '/api' as a prefix to use api.js so it would be localhost:3000/api/signup to use api
app.use('/api', api);
/*
Routes HTTP GET requests to the specified path with the
specified callback function(s) - can add multiple funtions
@param * any path will use the callback function 
ex)localhost:3000 or localhost:3000/contacts will work
@param callback function transfers index.html as a response
*/
app.get('*', 
	function(req,res)
	{
		res.sendFile(__dirname + '/public/app/views/index.html');
	});

/*
Calls the .listen function from express to listen for a connection on a port
@param config.port imports the variable port from config.js
@param function(err) callback function to check if the port is listening if not err is thrown
*/

/*listen on the config.port(port 3000) for incoming sockets and log it to
the console*/
http.listen(config.port, 
	function(err)
	{
		if(err)
		{
			console.log(err);
		}
		else
		{
			console.log("Listening on port " + config.port);
		}
	});