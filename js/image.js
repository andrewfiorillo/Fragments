// utility functions

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


function shuffle(o) { 
	for(var j, x, i = o.length; i; 
	    j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
}


function cached(url){
    var test = document.createElement("img");
    test.src = url;
    return test.complete || test.width+test.height > 0;
}


// main 

function build(width,height,imageurl) {

	var	imagesize	= $("#imagesize").val() || 600,
		tilesize	= parseInt($("#tilesize").val()) || imagesize,
		intilesize	= $.browser.mozilla ? tilesize * 3 : tilesize,
		
		tilemargin	= $("#tilemargin").val() || 0,
		tiletint	= $("#tiletint").val(),
		tiletintop	= $("#tiletintop").val(),
		blur		= $("#blur").val(),
		rotate		= $("#rotate").val(),
		random		= $("input[name=random]:checked").val(),
		opjitter	= $("input[name=opjitter]:checked").val(),
		radius		= $("#radius").val(),
		inradius	= $.browser.mozilla ? 0 : radius,
		
		rows 		= imagesize / tilesize,
		columns		= imagesize / tilesize,
		totalwidth	= parseInt(imagesize) + (columns * tilemargin),
		
		chunks		= [],
		opacity		= 1,
		blurclass	= "",
		bgsize		= "",
		html 		= document.createElement("div");
	
	// figure out if image is landscape or portrait and set background-size acordingly
	
	if 	(width <= height)	bgsize = imagesize + "px auto";
	else 					bgsize	= "auto " + imagesize + "px";
	
	// build image tiles array
	
	for(var i=0; i < rows; i++) {
		for(var n=0; n < columns; n++) {
			xpos = n * tilesize;
			ypos = i * tilesize;
			chunks.push({x:xpos,y:ypos});
		}	
	}
	
	// option: randomize tiles
	
	if(random == "on") shuffle(chunks);
	
	// option: blur (firefox only)
	
	if(parseInt(blur) > 0) {			
		blurclass = "blur";
		$("#svgblur").html('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="height:0;"><defs><filter id="f1" x="0" y="0"><feGaussianBlur in="SourceGraphic" stdDeviation="'+blur+'" id="GaussianBlur" /></filter></defs></svg><style type="text/css">.blur { filter: url(#f1); }</style>');
	}
	
	// build image
	
	$(html).addClass("img_wrap").css({
		"width" 		: totalwidth + "px",
		"padding-left"	: tilemargin + "px"
	})

	$(chunks).each(function(i,chunk) {

		if(opjitter == "on") opacity = Math.random();
		
		var tile = document.createElement("div"),
			tilebg = document.createElement("div"),
			tint = document.createElement("span");
		
		$(tile).addClass("tile").css({
			"opacity"			: opacity,
			"width"				: tilesize + "px",
			"height"			: tilesize + "px",
			"border-radius"		: radius + "px",
			"margin" 			: "0 " + tilemargin + "px " + tilemargin + "px 0",
			"-webkit-transform" : "rotate(" + rotate + "deg)",
			"-moz-transform" 	: "rotate(" + rotate + "deg)"
		});
		
		$(tilebg).addClass("tilebg").addClass(blurclass).css({
			"background"		: "url(" + imageurl + ") -" + chunk.x + "px -" + chunk.y + "px",
			"background-size"	: bgsize,
			"width"				: intilesize + "px",
			"height"			: intilesize + "px",
			"border-radius"		: inradius + "px"
		});
		
		if(tiletintop > 0) {		
			$(tint).addClass("tint").css({
				"background"	: tiletint,
				"opacity"		: tiletintop,
				"width"			: tilesize + "px",
				"height"		: tilesize + "px",
				"border-radius"	: radius + "px"
			});
			$(tilebg).append(tint);
		}
		
		$(tile).append(tilebg);
		$(html).append(tile);
		
	});
	
	// write it to the page
	
	$("#randomized").html(html);
	
}

$(document).ready(function(){

	// listen for form submit to run
	
	$("#randoform").submit(function(){

		var imageurl = $("#imageurl").val();
		
		if(cached(imageurl)) {
			var tmp_img = $("<img/>").attr("src", imageurl),
				width 	= tmp_img[0].naturalWidth,
				height 	= tmp_img[0].naturalHeight;
			build(width,height,imageurl);
		}
		else {		
			$("<img/>").attr("src", imageurl).imagesLoaded(function() {
				var width 	= this[0].naturalWidth,
					height 	= this[0].naturalHeight;
				build(width,height,imageurl);
			});
		}
		return false;
	});	
	
	// toggle controls
	
	$('#control_toggle').click(function() {
		$("body").toggleClass("closed");
	});
	
	// populate image url field with a preset when clicked
	
	$("#more_list ul li a").click(function() {
		$("#imageurl").val($(this).attr("href"));
		return false;
	});
	
	// run when you hit enter
	
	$(document).keypress(function(e) {
		var code = (e.keyCode ? e.keyCode : e.which);
		if(code == 13) {
			$("#randosubmit").click();
		}
	});
	
	// tint color picker
	
	$("#tiletint").miniColors({
		letterCase: 'uppercase',
		change: function(hex, rgb) {}
	});
	
	// sliders
	
	$("#margin_slider").slider({
		value: 0,
		min: -50,
		max: 50,
		step: 1,
		slide: function( event, ui ) {
			$("#tilemargin").val(ui.value).prev("label").children(".count").text(ui.value);
		}
	});
	
	$("#radius_slider").slider({
		value: 0,
		min: 0,
		max: 100,
		step: 5,
		slide: function( event, ui ) {
			$("#radius").val(ui.value).prev("label").children(".count").text(ui.value);
		}
	});
	
	$("#tiletintop_slider").slider({
		value: $(this).val(),
		min: 0,
		max: 1,
		step: 0.1,
		slide: function( event, ui ) {
			$("#tiletintop").val(ui.value).parent().children("label").children(".count").text((ui.value * 100) + "%" );
		}
	});
	
	$("#rotate_slider").slider({
		value: 0,
		min: 0,
		max: 360,
		step: 15,
		slide: function( event, ui ) {
			$("#rotate").val(ui.value).prev("label").children(".count").text(ui.value);
		}
	});
	
	$("#blur_slider").slider({
		value: 0,
		min: 0,
		max: 50,
		step: 1,
		slide: function( event, ui ) {
			$("#blur").val(ui.value).prev("label").children(".count").text(ui.value);
		}
	});
	
	// radio buttons
	
	$(".buttonset").buttonset();
	
	// show blur option for firefox
	
	if($.browser.mozilla) {
		$('#blurfield').show();
	}
	
	// run on page load
	
	$("#randosubmit").click();
	
});