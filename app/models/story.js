//calling the moongose package
var mongoose = require('mongoose');

//create an instance of the moongose schema method
var Schema = mongoose.Schema;

//create a story schema 
var StorySchema = new Schema({

	/*
	in Mongo DB the only way to refer a schema to another schema we 
	have to link the schemas
	*/

	// Mongo DB automatically creates an id for each user that you can reference
	creator: {type: Schema.Types.ObjectId, ref: 'User'}, 
	content: String,
	//Date is a default javascript object
	created: {type: Date, default: Date.now()}	
});

//export your model names 'Story'
module.exports = mongoose.model('Story', StorySchema);

