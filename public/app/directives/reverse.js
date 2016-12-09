/*Custome Angular directive that will reverse the order of the data*/


angular.module('reverseDirective', [])

	/*.filter is how u specify Angular directive
	.filter(nameOfFilter, fn(inputValue)*/
	.filter('reverse',
	 	function()
		{
			//items - the array of objs
			return function(items)
			{
				//.slice() returns the selected elements in an array as a new array obj
				//.reverse() reverses the order of the elements in an array
				console.log("items: " + items);
				if(!items)
				{
					return;
				}
				return items.slice().reverse();
			}
		});