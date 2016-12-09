angular.module('storyCtrl', ['storyService'])
	
	.controller('StoryController', 

		function(Story, socketio)
		{
			var vm = this;

			/*If we are able to get the stories from the DB, then res.json(stories)
			will pass it to the data object which we will then save to vm.stories obj*/
			Story.allStory()
				.then(function(data)
				{
					vm.stories = data.data; 
					console.log("StoryCtrl data: " + vm.stories);
				});
			/*createStory method to call .create from StoryService and call the .post api
			which will post data to the DB*/
			vm.createStory = function()
			{
				vm.message = '';
				Story.create(vm.storyData)
					.then(function(data)
					{
						//clear up the form
						vm.storyData = '';
						vm.message = data.message;
					});
			};
			/*.on('story', fn(data[aka newStory])) method listens to the .emit('story', newStory),
			which is executed in the post user story api, and grabs the data (newStory) obj 
			sent back from the .emit('story', newStory). Data is then pushed to the view using
			the .push() method*/

			/*socketio.on helps us push the data in real time (when a post is written) 
			to the server and into the view*/
			socketio.on('story', function(data)
			{
				/*push the stories to the data array obj so we can see 
				it in an instance of data*/
				console.log("socketio data: " + JSON.stringify(data));
				vm.stories.push(data);
			})

		})

	.controller('AllStoriesController', 
		
		function(stories, socketio)
		{
			var vm = this;

			vm.stories = stories.data;

			/*socketio.on helps us push the data in real time (when a post is written) 
			to the server and into the view*/
			socketio.on('story', function(data)
			{
				/*push the stories to the data array obj so we can see 
				it in an instance of data*/
				console.log("socketio data: " + JSON.stringify(data));
				vm.stories.push(data);
			})


		})