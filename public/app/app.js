/*Main angular service that has mainCtrl and authService as dependencies*/
angular.module('MyApp', ['appRoutes','mainCtrl', 'authService', 'userCtrl', 'userService', 'storyCtrl', 'storyService', 'reverseDirective'])
	.config(function($httpProvider)
	{
		/*$httpProvider.interceptors lets you push a servie factory on every 
		http req/res which let you return a config on an http req or a rsponse obj
		on a http res*/
		$httpProvider.interceptors.push('AuthInterceptor');
	})