/*Angular Service that routes our requests to the desired pages*/

//ngRoute is a dependecy on our module that we need to inject into our html file
angular.module('appRoutes', ['ngRoute'])

	/*
	configure your current application
	@param $routeProvider - ngRoute specific object to display the page when user routes somewhere
	@param $locationProvider - ngRoute specific object
	*/
	.config(function($routeProvider, $locationProvider)
	{
		/*
		.when is a chaining method
		when we go to this route '/' then direct your page to home.html
		home.html will be our main page all other pages will be under the home page
		*/
		$routeProvider
		.when('/', 
		{
			templateUrl: 'app/views/pages/home.html',
			controller: 'MainController',
			controllerAs: 'main'
		})
		.when('/login',
		{
			templateUrl: 'app/views/pages/login.html'
		})
		.when('/logout',
		{
			templateUrl: 'app/views/pages/home.html'
		})
		.when('/signup',
		{
			templateUrl: 'app/views/pages/signup.html'
		})
		.when('/allStories', 
		{
			templateUrl: 'app/views/pages/allStories.html',
			/*we can inject the controller straight into the html w/o 
			having to do ng-controller in the html*/
			controller: 'AllStoriesController',
			controllerAs: 'story',
			/*resolve is useful when we need to load data upfront before the
			controller initializes and renders the view.
			It executes the fn (goes directly to the Story factory and exectues .allStories
			and returns with the res.json(stories) obj containing the stories saved in the
			stories method/var which can then be passed on to the AllStoriesController as a param*/
			resolve:
			{
				stories: function(Story)
				{
					return Story.allStories();
				}
			}
		})

		/*
		HTML5 History API which allows Angular to change the routing and Urls
		of our pages without refreshing the page. 
		*/
		$locationProvider.html5Mode(true);
	});