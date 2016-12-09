/* Angular service to create a user and return all the stories*/

angular.module('userService', [])

.factory('User', function($http)
{
	var userFactory = {};

	/*Create method that takes in user data then posts that userData to our
	signup api for further processing*/
	userFactory.create = function(userData)
	{
		/*sending the userData (given to us by UserCreateController.signupUser) 
		in the req obj to the signup api. userData includes name, username, password*/
		return $http.post('/api/signup', userData);
	}

	//Get method to get all of the user stories from our api users
	userFactory.all = function()
	{
		return $http.get('/api/users');
	}

	return userFactory
});