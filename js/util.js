// Utility functions

var util = {
	
	cached: function(url) {
		var test = document.createElement("img");
		test.src = url;
		return test.complete || test.width+test.height > 0;
	},
	
	shuffle: function(o) {
		for(var j, x, i = o.length; i; 
			j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
		return o;
	}
	
};


$.fn.imagesLoaded = function(callback){
	
	var elems = this.filter('img'),
		len   = elems.length;
		
	elems.bind('load',function(){ if (--len <= 0) callback.call(elems,this); }).each(function(){
		if (this.complete || this.complete === undefined){
			var src = this.src;
			this.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
			this.src = src;
		}
	});
	return this;
};