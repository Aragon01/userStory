//import mongoose
var mongoose = require('mongoose');

//grab mongoose schema method
var Schema = mongoose.Schema;

//import the bcrypt library
var bcrypt = require('bcrypt-nodejs');

//create a schema object
var UserSchema = new Schema({
	name: String,
	//username of type string, required, has to be a unique username value
	username: {type: String, required: true, index: {unique: true}},
	/*
	password of type string, required, select set to true if this path
	should always be included in the results, false if it should be 
	excluded by default
	*/
	password: {type: String, required: true, select: false}
});

/*
Hash the schema user password before we save the password to the database
@param save method used to save to databse
@param function(next) passes control to the next middleware
*/
UserSchema.pre('save',
	function(next)
	{
		var user = this; // 'this' refers to UserSchema obj

		//if user password is not modified then go to the next matching route
		if(!user.isModified('password')) return next();

		/*
		.hash method to asynchronously generate a hash for the user 
		schema password
		@param user.password the string to hash
		@param null salt length to generate/use
		@param null callback function(error, string=) receiving the 
		error, if any, and the resulting hash
		@param progressCallback function(number)
		*/
		bcrypt.hash(user.password, null, null, 
			function(err, hash) 
			{
				//next(err) jumps to any error middleware if any
				if(err) return next(err); 
				//hashes the password
				user.password = hash;
				//routes to the next middleware
				next(); 
			});
	});

/*
Compares a password that the user types in with a password in 
the database
*/
//creates a new schema method comparePassword
UserSchema.methods.comparePassword = 
	function(password) // function takes in password as param
	{
		var user = this; // this refers to the UserSchema obj

		/*
		use the bycrypt method compareSync to compare the 
		inputted password with the pasword in the database
		*/
		return bcrypt.compareSync(password, user.password);
	}	

/*
exporting the model
The first argument is the singular name of the collection your model is 
for. Mongoose automatically looks for the plural version of your model 
name. Thus, for the example, the model User is for the users
collection in the database. The .model() function makes a copy of schema.
*/
module.exports = mongoose.model('User', UserSchema);