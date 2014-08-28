$(function(){
	$(document).on('DOMMouseScroll mousewheel', scrollPublisher.handleScroll);
});

/*************************************************
*****************  Publisher  *******************
*************************************************/
//Generic Publisher
var publisher = {
	subscribers:{
		any: []
	},
	subscribe: function(fn, type){
		//add a subscriber to the according array
		var subtype = type || 'any';

		if(typeof this.subscribers[subtype] === "undefined"){
			this.subscribers[subtype] = [];
		}

		this.subscribers[subtype].push(fn);
	},
	unSubscribe: function(fn, type){
		//remove a subscriber from the array
		this.visitSubscribers('unsubscribe', fn, type);
	},
	publish: function(publication, type){
		//loop through subscribers and execute the method given
		this.visitSubscribers('publish', publication, type);
	},
	visitSubscribers : function(action, args, type){
		//initialization
		var pubtype = type || 'any',
		subscribers_list = this.subscribers[pubtype],
		i,
		max = subscribers_list.length;

		//operations
		//1.perform operation based on action type
		for(i=0; i<max; i += 1){
			if(action === 'publish'){
				//publish, execute functions on the list
				subscribers_list[i](args);
			}else{
				//unsubscribe
				if(subscribers_list[i] === args){
					subscribers_list.splice(i, 1);
				}
				
			}
		}
	}
};

//A generic mathod that turns any object into a publisher
function MakePublisher(o){
	for(var i in publisher){
		if(!o.hasOwnProperty(i)){
			o[i] = publisher[i];
		}
	}
	o.subscribers = {any:[]};
}

/**
* Constructor Function for Publisher
* Parallax Publisher inherits all the methods from the Generic Publisher object.
* It keeps track of the frame change with a private object.
* It contains a private function to process the wheelDelta in the given mousewheel event.
* It publishes the current frame to it's subscribers.
* It contains a public function as an event handler to the document.onmousewheel event.
*/
function ParallaxPublisher(){
	var self = this;
	//private members
	var parallax = {
		currentOffset : 0,
		previousOffset : 0
	};

	function wheelDistance(e) {
	    e = typeof e.wheelDelta !== "undefined" ? e : typeof e.originalEvent !== "undefined" ? e.originalEvent : event;
	    var w = e.wheelDelta, d = e.detail;
	    if (d) {
	        if (w) return w / d / 40 * d > 0 ? 1 : -1; // Opera
	        else return -d / 3; // Firefox;        
	    } else return w / 120; // IE/Safari/Chrome 
	}
	
	function scroll(currentFrame){
		self.publish(currentFrame);
	}

	//public members
	self.handleScroll = function(e) {
		e.preventDefault();
	    var delta = wheelDistance(e);
	    parallax.currentOffset = parallax.previousOffset + (delta * 100);
	    parallax.previousOffset = parallax.currentOffset;
	    console.log(parallax.currentOffset);
	    scroll(parallax.currentOffset);
	}
}


/*************************************************
*****************  Subscriber  *******************
*************************************************/
//Constructor function for subscriber.
//Each subscriber represents a DOM element. Each subscriber has it's start and end point, aka. life span, 
// and a list of css styles to chagne during its life span.
function ParallaxSubscriber(options){
	this.id = options.id || null;
	var elem = $(this.id),
		styles = options.styles || {},
		start = options.start || 0,
		end = options.end || 0;

	this.play = function(currentFrame){
		if(currentFrame>=start && currentFrame<=end){
			for(var i in styles){
				var style = styles[i];
				elem.css(style.name, function(){
					var ratio = (currentFrame - start)/(end - start);
					var full_length = style.end-style.start;//600-0
					var currentValue = style.start + ratio*full_length;
					return currentValue;
				});
			}
		}
	};
}

/****************************************************************
************************ Client Code ****************************
*****************************************************************/

//Create instance of publisher
var scrollPublisher = new ParallaxPublisher();

MakePublisher(scrollPublisher);

//Create Subscriber instances
var elevator = new ParallaxSubscriber({
	id: '#elevator',
	styles: [{
		name: 'top',
		start: -250,
		end: 450
	}],
	start: 0,
	end: 2000
});

var cloud = new ParallaxSubscriber({
	id: '#cloud',
	styles: [{
		name: 'left',
		start: 500,
		end: 0
	}],
	start: 0,
	end: 2000
});

var plane = new ParallaxSubscriber({
	id: '#plane',
	styles: [{
		name: 'left',
		start: 0,
		end: 1500
	},{
		name: 'height',
		start: 36,
		end: 150
	}],
	start: 0,
	end: 2000
});

//add all the subscriber instances to the publisher's subscriber list
scrollPublisher.subscribe(elevator.play);
scrollPublisher.subscribe(cloud.play);
scrollPublisher.subscribe(plane.play);