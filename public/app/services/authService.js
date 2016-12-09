/*Angular services */

/*
Call the auth api and '/me' route api for the payload
Angular will call all the JSON values from the server and render it to html
Fetch all the data from the node apis and pass it to the controller so that
it can pass it to a route and route will render the view as in index.html
*/

//creates an angular module named authService
angular.module('authService', [])
	//factory is a function which returns any object
	//method that fetch api from the server
	.factory('Auth', 
		/*
		@param $http-service which facilitates communication with http servers
		@param $q-service which helps you run fns async and use their return values
		@param AuthToken - will be another .factory
		*/
		function($http, $q, AuthToken)
		{
			/*
			all of the api routes that we call using $http will be put into 
			this variable
			*/
			var authFactory = {};
			/*
			method to log in the user and set the token
			fn to fetch the data (username/password) from our login api to use 
			at front end
			*/
			authFactory.login = function(username, password)
			{   
				/*
				using $http.post since our api uses .post 
				route is /api/login since that is the route our api points to 
				send the username and password to this api
				$http.post(url, data, [config])
				*/
				return $http.post('/api/login', 
				{
					/*sending the username and password (given to us by the 
					MainController.doLogin) in the req obj to the login api*/
					username: username,
					password: password


				})
				/*
				if our http request is a success then set token to data.token and return
				When we log in we use a token, .then is a promise fn acting like 
				callback fn if route is success then execute the fn. 
				*/
				.then(
					//promise data obj grabs data from response obj (res.json())
					function(data)
					{
						/*
						setting the token to the promise obj data.token then return 
						the obj data
						*/
						console.log("LoginApi created the token");
						AuthToken.setToken(data.data.token);
						console.log("success: " + data.data.success);
						console.log("message: " + data.data.message);
						console.log("data.token: " + data.data.token);
						console.log("data: " + data.data);
						return data.data;

					});
			}
			//method to clear the token
			authFactory.logout = function()
			{
					//sends an empty string to the .setToken method 
					AuthToken.setToken();
			}
			//method that checks in every http request wether the user has a token
			//fn to check if the user is logged in
			//in every http request sent we need to check if we have the token or not
			//like the middleware but for our front end 
			authFactory.isLoggedIn = function()
			{
				//if the .getToken returns true then return true else false
				if(AuthToken.getToken()) 
					return true;
				else
					return false;
			}
			//method that gets all the user information. id, name, username, password
			authFactory.getUser = function()
			{
				//if we have the token
				if(AuthToken.getToken())
				{
					//fetch the '/me' api 
					return $http.get('/api/me');
				}
				else
				{
					//if token doesnt exist then it will reject you with a message
					return $q.reject({message: "User has no token"})
						.catch(function(error)
						{
							console.log("There is no token");
							return "User has no token";
						});
				}
			}

			return authFactory;

		})

	//factory to set set and get the token from local storage
	.factory('AuthToken', 
		//@param - $window references the brower's window obj
		function($window)
		{
			var authTokenFactory = {};
			//method to get the token from local storage
			authTokenFactory.getToken = function()
			{
				//Fetching the token from local storage key-value token
				//var lsToken = $window.localStorage.getItem('token');
				console.log("Got token from LS: ");
				return $window.localStorage.getItem('token');
				
			}
			//method to set the token to key-value token in local storage
			authTokenFactory.setToken = function(token)
			{
				console.log("AuthToken.setToken: " + token);
				//If the token exists then set the token to the token key-value
				if(token)
				{
					console.log("token does exist");
					//set the token value from our login api? To token key-value in LS
					$window.localStorage.setItem('token', token);
				}
				else
				{
					console.log("token does not exist");
					//remove the key-value token from LS
					$window.localStorage.removeItem('token');
				}
			}

			return authTokenFactory;
		})

	//Checks every http request to see wether we have our valid token
	.factory('AuthInterceptor', 
		function($q, $location, AuthToken)
		{
			var interceptorFactory = {};

			//request to check if the token exists
			interceptorFactory.request = function(config)
			{
				//sets token variable to the true or false depending on the getToken() method
				var token = AuthToken.getToken();
				console.log("AuthInterceptor token: " + token);
				//if token exists in LS set the conig.headers x-access-token to token value
				if(token)
				{
					//sets the header value (postman) to token
					config.headers['x-access-token']  = token;
					console.log("header[x-access-token]: " + config.headers['x-access-token']);
				}
				// return the config object
				return config; 
			}

			/*
			method to intercept and redirect a request if no token is set
			ex) if the user is trying to bypass the login page and go to the home page
			*/
			interceptorFactory.responseError = function(response)
			{	
				//if the response status is 403 forbidden then redirect user to login page
				if(response.status == 403)
				{
					$location.path('/login');
				}
				//promise with the response obj representing the rejection reason
				return $q.reject(response);
			}

			return interceptorFactory;
		});