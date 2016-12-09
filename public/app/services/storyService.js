/*Angular service factory which will have a method to create/get stories*/
angular.module('storyService', [])

	.factory('Story', 
		function($http)
		{
			var storyFactory = {};

			storyFactory.allStories = function()
			{
				return $http.get('/api/all_stories');
			}
			//Method to create a story
			storyFactory.create = function(storyData)
			{
				return $http.post('/api', storyData)
			}
			//Method to return the stories written from all the users in the DB
			storyFactory.allStory = function()
			{
				return $http.get('/api');
			}

			return storyFactory;
		})

	.factory('socketio', 
		function($rootScope) 
		{
			var socket = io.connect();
			//return the function itself (socketio.on and socketio.emit)
			return {
				/*socketio.on method that will take an eventName and callback function to */
				on: function(eventName, callback) {
					socket.on(eventName, function() {
						var args = arguments;
						$rootScope.$apply(function() {
							callback.apply(socket, args);
						});
					});
				
				},

				emit: function(eventName, data, callback) {
					socket.emit(eventName, data, function() {
						var args = arguments;
						$rootScope.apply(function() {
							if(callback) {
								callback.apply(socket, args);
							}
						});
					});
				}
			};
		});