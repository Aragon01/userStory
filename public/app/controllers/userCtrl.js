/*Angular Service that creates two controllers one for getting the 
user stories called userCtrl and one for signing up the user called 
UserCreateController*/

/*Angular service named userCtrl with a dependency from userService which
is a factory*/
angular.module('userCtrl', ['userService'])
	/*controller that fetches the data from the server*/
	.controller('UserController', 
		function(User)
		{
			var vm = this;
			/*if the method User.all() succeeds then carry out the callback
			function to get the data from the server and assign it to 
			controllers vm.users object*/
			User.all()
				/*User.all() method calls the /user api which fetches all the users 
				from the DB and passes it to the response objc (res.json(users)).
				Which we can then access here by passing the data as a paramater
				in our callbackSuccess function*/
				.then(function(data)
				{
					vm.users = data;
				});
		})
	/*controller that calls the User factory to create a user */
	.controller('UserCreateController', 
		function(User, $location, $window)
		{
			var vm = this;

			vm.signupUser = function()
			{
				vm.message = '';
				/*Call the .create method from the User factory
				and if that's a success then clear the userData 
				store the response messge in vm.message object and
				set the token in the Local Storage, then redirects you 
				to the '/' route (home.html).
				vm.userData is coming from the singup.html and will consists of
				userData.name, userData.username, and userData.password*/
				User.create(vm.userData)
					/*response param will contain the whole response obj,
					including response.data, response.status,
					response.headers. In our case we will just call the 
					response.data to get the data (res.json())*/
					.then(function(response)
					{
						//clear the form once we sign up for the next singup
						vm.userData = {};
						vm.message = response.data.message;
						/*Setting the token for when we sign up we wil store
						the token in our localStorage*/
						$window.localStorage.setItem('token', response.data.token);
						//redirecting to home page once signup is done
						$location.path('/');
					})
			}
		})