/*Angular Login Controller*/

angular.module('mainCtrl', [])

	/*
	controller is a way to manipulate the data so you can give it to view so it 
	can render the data
	*/
	.controller('MainController',

		/*
		@param $rootScope - glue between application controller and view
		@param $location - set the path of where to go
		@param Auth - grabbing the Auth factory
		*/
		function($rootScope, $location, Auth)
		{	
			//this refers to this controller
			var vm = this;

			/*
			setting the loggedIn object to the Auth.isLoggedIn() method which stores 
			the token in LS
			*/
			vm.loggedIn = Auth.isLoggedIn();

			/*
			In every request if the route is changing then we want to check 
			if the user is logged in
			@param $routeChangeStart - Event Listener that broadcasts a route change
			On every request/route change we are retrieving the users information 
			*/
			$rootScope.$on('$routeChangeStart', 
				function()
				{
					//sets the object to true/false depending on the Auth.isLoggedIn() method
					vm.loggedIn = Auth.isLoggedIn();
					console.log("Is user loggedIn: " + vm.loggedIn);
					/*
					getting the data from the user if Auth.getUser() succeeds
					the .getUser() methods checks if there is a token stored in 
					the LS if not it rejects the promise with $q.reject() and
					this part of the code is not executed
					*/
					Auth.getUser()
						/*if the Auth.getUser() method is executed successfully
						then the /me api gets executed which grabs the decoded
						payload from the req.decoded obj and passes it on 
						to the respons obj (res.json()) which in turn can be
						used here*/
						.then(function(data)
						{
							//sets the user data to the vm.user object
							vm.user = data.data;
							//console.log("rootScope data.data.username: " + data.data.username);
						});
				});

			/*
			whenever the user clicks submit we need to put this method in our 
			html tag later on
			*/
			vm.doLogin = function()
			{
				//validation 
				vm.processing = true;

				vm.error = '';
				/*
				Auth factory login which returns a promise object if success
				return the token data
				*/
				Auth.login(vm.loginData.username, vm.loginData.password)
					//if our Auth.login() is success continue with the callback fn
					.then(function(data)
					{
						vm.processing = false;
						/*if the Auth.getUser() method is executed successfully
						then the /me api gets executed which grabs the decoded
						payload from the req.decoded obj and passes it on 
						to the respons obj (res.json()) which in turn can be
						used here*/
						Auth.getUser()
							.then(function(data)
							{
								vm.user = data.data;
								console.log("vm.doLogin data.data.username: " + data.data.username);
							});

						//if data.success is true then route the user to the home page
						if(data.success)
						{
							$location.path('/');
						}
						else
						{
							/*
							if our login api throws an error it will pass that 
							error to our angular login service, and we will fetch 
							that error message here
							*/
							vm.error = data.message;
						}
					});
			}

			//method that logouts the user
			vm.doLogout = function()
			{
				//auth logout service that resets our token to null
				Auth.logout();
				//routes the path to /logout
				$location.path('/logout');
			}
		});