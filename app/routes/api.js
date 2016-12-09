/*Api written in express/node js*/

//importing the user file (schema file) has to be your model name
var User = require('../models/user');
//imports the Story model and saves it to the variable Story
var Story = require('../models/story');
//importing the config file
var config = require('../../config');
//grabbing and storing the secretKey from config to var secretKey
var secretKey = config.secretKey;
//importing the jason web token
var jsonwebtoken = require('jsonwebtoken');

//creating a cutom function for token creation
function createToken(user)
{
	//token will be created to include the user id, name, and username
	var token = jsonwebtoken.sign({
		id: user._id,
		name: user.name,
		username: user.username
		// secretKey is used to decode the token key, token expires 1440s
	}, secretKey,{expiresIn: 1440});

	//returns the token;
	return token;
}


/*
exports the function containing all the api to be used by our controller
update: added io param for socket.io real time capability
*/
module.exports = 
	function(app, express, io)
	{
		//creats a new router obj to be able to create the api
		var api = express.Router();

		api.get('/all_stories', 
			function(req, res)
			{
			//mongoose method that will find all the story objects in the database 
				Story.find({}, 
					function(err, stories)//fn(err, docs)
					{
						if(err)
						{
							res.send(err);
							return;
						}

						res.json(stories);
					});
			});

		//posting data to the server
		api.post('/signup', 
			function(req, res)
			{	
				//creating a new user obj referencing user.js data
				var user = new User({
						//body parser to parse the value in order to read the value from a website 
						name: req.body.name,
						username: req.body.username,
						password: req.body.password	
					});
				//create token when we sign up
				var token = createToken(user);
				//save the api to the database and return err message or json message sucess 
				user.save(
					function(err)
					{
						if(err)
						{
							res.send(err);
							return;
						}
						res.json({
							success: true,
							message: 'User has been created!',
							token: token
						});
					});
			});

		//Grabbing data from the server
		api.get('/users', 
			function(req,res)
			{
				//mongoose method that will find all the user objects in the database
				User.find({}, // {} holds a database query, empty in this case
					function(err, users)
					{
						if(err)
						{
							//Send error if problem occurs fetching the values from DB
							res.send(err);
							return;
						}
						//JSON object returning the users found
						res.json(users);
					});	
			});

		//Logs the user in and creates a token based authentication
		api.post('/login', 
			function(req, res)
			{
				//find a specific user object based on their username then select their name, username, and password
				User.findOne({username: req.body.username},'name username password',
					//user param coming from schema Model 'User'
					function(err, user)
					{	

						//error thrown if an error occurred
						if(err) throw err;
						//if user does not exist send 'user doesn't exit'
						if(!user)
						{
							res.send({message: "User doesn't exist"});
						}
						//if user exists validate the pass entered with the pass in the DB
						else if(user)
						{
							//custom method in user.js that compares pass entered with pass in DB
							var validPassword = user.comparePassword(req.body.password);
							//if invalid send 'invalid pasword' else create a token session 
							if(!validPassword)
							{
								res.send({message: "Invalid Password"});
								console.log("validPassword? " + validPassword);
							}
							else
							{
								// create token passing the user param
								console.log("validPassword? " + validPassword);
								var token = createToken(user);
								console.log("token: " + token);
								// create your json message with your token for later use
								res.json({
									success: true,
									message: "Successful login!",
									/*
									id, name, username is all encoded in the token
									in order to decode the token u need your secretKey
									*/
									token: token
								})
							}
						}
					});

			});

		/*
		custom api middleware to check if the user has an authorized token
		Since path defaults to “/”, middleware mounted without a path will be 
		executed for every request to the app. For example, this middleware function
		will be executed for every request to the app.
		*/
		api.use(
			function(req, res, next)
			{
				//Log a message in the console alerting a user just logged in
				console.log("Somebody just came in to our app!");

				//Grab the token from either the req.body, req.params, or req.headers
				console.log("=>req.body.token: " + req.body.token);
				console.log("=>req.params.token: " + req.params.token);
				console.log("=>req.headers: " + req.headers['x-access-token']);
				var token = req.body.token || req.params.token || req.headers['x-access-token'];

				//console.log("token: " + token);

				//check if token exists
				console.log("checking token: " + token);
				if(token)
				{
					/*
					json .verify method returns the payload decoded if successful
					@param token take from thed above HTTP requests
					@param secretKey take from the config file
					*/
					jsonwebtoken.verify(token, secretKey, 
						function(err, decoded)
						{
							if(err)
							{
								//throw a custom error message if there is an error
								res.status(403).send({success: false, message:"Failed to authenticate user"});
							}
							else
							{
								//passing the decoded payload to req.decoded
								console.log("***Token is being decoded and passed to req");
								req.decoded = decoded;
								//moving forward to the next route (api, middleware, etc..)
								next();
							}
						});
				}
				else
				{
					//throw a cutome error message if token does not exist
					//console.error(err.stack);
					res.status(403).send({sucess: false, message:"No Token Provided"});
				}
			});

		//Destination B - provide a legitimate token
		/*api.get('/', 
			function(req,res)
			{
				res.json("Hi There your token was legit");
			});
		*/

		//Multiple HTTP methods on a single route
		api.route('/') // '/' home route

			.post(function(req,res)
			{
				var story = new Story({
					/*
					Current user id from the logged in user 
					We are calling the id from the decoded payload 
					from our above middleware which decoded the token
					*/
					creator: req.decoded.id,
					content: req.body.content,
					//Date will default to the current date time
				});
				//saves the story with creator and content in the DB
				/*
				update: newStory param added as an instance of story so we can render it in real time
				schema.save(function([err],[documentToBeSaved],[numbOfRowsAffected])
				You can name the arguments however you want, you're not casting it to an object.
				It's simply a name that you want to use to refer it to in your function's body.*/
				story.save(function(err, newStory)
				{
					if(err)
					{
						res.send(err);
						return;
					}
					/*
					io.emit emits an event to all connected clients and allows you to send objects 
					.emit('message', data, callback)
					io.emit will send the story event (eventName) holding the newStory (data) to the server
					*/
					io.emit('story', newStory);
					console.log("newStory: " + newStory);
					res.json({message: 'New story created'});
				});
			})

			//Get all the stories created by the user
			.get(function(req,res)
			{
				//.find() finds all the fields related to the query
				Story.find({creator: req.decoded.id}, 
					//stories is the plural form of story
					function(err, stories)
					{
						if(err)
						{
							res.send(err);
							return;
						}
						//return all the stories obj with creator,content,created
						console.log("GetStories Success: " + stories);
						res.json(stories);
					});
			});

			/*
			Since the Middleware we created is not a route, we cannot access 
			the payload from it. This get api is for Angular (front end) to 
			be able to access the stored information (decoded payload).
			*/
			api.get('/me', 
				function(req, res)
				{
					//return the decoded payload in JSON
					res.json(req.decoded);
					console.log("/me api: " + req.decoded);
				});

		//returns all the api
		return api;
	}


//test api
		/*
		api.post('/test',
			function(req,res)
			{
				//second parameter is a select to specific field based on the query
				User.findOne({username: req.body.username}, 'name',
					function(err, user)
					{
						if(err)
						{
							res.send(err);
							return;
						}
						
						
						//json response can return the following fields 
						//but only the one selected above will be sent
						
						res.json({
							name: user.name,
							username: user.username
						});
						
					});
			});
		*/