
var img = {

	// get this party started

	initialize: function() {
		
		this.getParams();
		this.colors();
		this.sliders();
		this.radios();
		this.listen();
		this.keyboard();
		this.presets();
		this.controlsToggle();
		
		if($.browser.mozilla) $('#blurfield').show();
		
		$("#randosubmit").click();

	},
	
	
	// set all vars
	
	vars: function() {

		this.url		= $("#imageurl").val();
		this.imagesize	= $("#imagesize").val() || 600;
		this.tilesize	= parseInt($("#tilesize").val()) || this.imagesize;
		this.intilesize	= $.browser.mozilla ? this.tilesize * 3 : this.tilesize;
			
		this.tilemargin	= $("#tilemargin").val() || 0;
		this.tiletint	= $("#tiletint").val();
		this.tiletintop	= $("#tiletintop").val();
		this.blur		= $("#blur").val();
		this.rotate		= $("#rotate").val();
		this.random		= $("input[name=random]:checked").val();
		this.opjitter	= $("input[name=opjitter]:checked").val();
		this.radius		= $("#radius").val();
		this.inradius	= $.browser.mozilla ? 0 : this.radius;
			
		this.rows 		= this.imagesize / this.tilesize;
		this.columns	= this.imagesize / this.tilesize;
		this.totalwidth	= parseInt(this.imagesize) + (this.columns * this.tilemargin);
		
		this.chunks = [];
		this.opacity = 1;
		this.blurclass = "";
		this.bgsize = "";
		this.width = "";
		this.height = "";
		this.html = document.createElement("div");
		this.tmp_img = $('<img />');
		
	},
	
	
	// listen for form submit
	
	listen: function() {
		$("#randoform").submit(function(){
		
			// get all the form values	
			img.vars();
			
			// set url params
			img.setParams();
			
			// if image is cached go ahead and build, otherwise wait for it to load, then build		
			if(util.cached(img.url)) {
				$(img.tmp_img).attr("src", img.url)
				img.width	= img.tmp_img[0].naturalWidth
				img.height	= img.tmp_img[0].naturalHeight;
				img.build();
			}
			else {
				$(img.tmp_img).attr("src", img.url).imagesLoaded(function() {
					img.width 	= img.tmp_img[0].naturalWidth;
					img.height	= img.tmp_img[0].naturalHeight;
					img.build();
				});
			}
			
			return false;
			
		});
	},
	
	
	getParams: function() {
		var pairs = window.location.hash.replace("#","").split("&");
		var params = {};
		
		for(var i=0; i < pairs.length; i++) {
			var pair = pairs[i].split("=");
			params[pair[0]] = pair[1];
		}
		
		console.log(params);
		
		var sliders = ["imageurl", "imagesize", "tilesize", "tilemargin", "radius", "tiletint", "tiletintop", "rotate", "blur"];
		var radios = ["opjitter", "random"];
		
		for(var i = 0; i < sliders.length; i++) {
			if(params[sliders[i]]) {
				$("#" + sliders[i]).val(params[sliders[i]]).prev("label").children(".count").text(params[sliders[i]]);
			}
		}
		
		/*
		for(var i = 0; i < radios.length; i++) {
			
			console.log(params[radios[i]]);
			console.log(radios[i]);
		

				if (params[radios[i]] == "on") {
					$("#" + radios[i] + "on").attr('checked', true);
					$("#" + radios[i] + "off").attr('checked', false);
				}
				else {
					$("#" + radios[i] + "on").attr('checked', false);
					$("#" + radios[i] + "off").attr('checked', true);
				}

		}
		*/
		

		
		if(params.opjitter)	{
			if (params.opjitter == "on") $("#opjitteron").attr('checked', true);
			else $("#opjitteroff").attr('checked', true);
		}
		if(params.random)	{
			if (params.random == "on") $("#randomon").attr('checked', true);
			else $("#randomoff").attr('checked', true);
		}
		


	},
	
	
	setParams: function() {
		
		var params = [
			{ key: "imageurl",		val: this.url },
			{ key: "imagesize",		val: this.imagesize	},
			{ key: "tilesize",		val: this.tilesize },
			{ key: "tilemargin",	val: this.tilemargin },
			{ key: "radius",		val: this.radius },
			{ key: "tiletint",		val: this.tiletint },
			{ key: "tiletintop",	val: this.tiletintop },
			{ key: "rotate",		val: this.rotate },
			{ key: "blur", 			val: this.blur },
			{ key: "opjitter",		val: this.opjitter },
			{ key: "random",		val: this.random }
		];

		var paramStr = "";
		
		for (var i=0; i<params.length; i++) {
			if(i>0 ) paramStr += "&";
			paramStr += params[i].key + "=" + params[i].val;
		}
		
		window.location.hash = paramStr;
		
	},
	
	
	// set up controls toggle button
	
	controlsToggle: function() {
		$('#control_toggle').click(function() {
			$("body").toggleClass("closed");
		});
	},
	
	
	// populate presets menu
	
	presets: function() {
		$("#more_list ul li a").click(function() {
			$("#imageurl").val($(this).attr("href"));
			return false;
		});
	},
	
	
	// set enter to trigger build
	
	keyboard: function() {
		$(document).keypress(function(e) {
			var code = (e.keyCode ? e.keyCode : e.which);
			if(code == 13) {
				$("#randosubmit").click();
			}
		});	
	},
	
	// set up sliders
	
	sliders: function() {
		
		$("#margin_slider").slider({
			value: $("#tilemargin").val() || 0,
			min: -50,
			max: 50,
			step: 1,
			slide: function( event, ui ) {
				$("#tilemargin").val(ui.value).prev("label").children(".count").text(ui.value);
			}
		});
		
		$("#radius_slider").slider({
			value: $("#radius").val() || 0,
			min: 0,
			max: 100,
			step: 5,
			slide: function( event, ui ) {
				$("#radius").val(ui.value).prev("label").children(".count").text(ui.value);
			}
		});
		
		$("#tiletintop_slider").slider({
			value: $("#tiletintop").val() || 0,
			min: 0,
			max: 1,
			step: 0.1,
			slide: function( event, ui ) {
				$("#tiletintop").val(ui.value).parent().children("label").children(".count").text((ui.value * 100) + "%" );
			}
		});
		
		$("#rotate_slider").slider({
			value: $("#rotate").val() || 0,
			min: 0,
			max: 360,
			step: 15,
			slide: function( event, ui ) {
				$("#rotate").val(ui.value).prev("label").children(".count").text(ui.value);
			}
		});
		
		$("#blur_slider").slider({
			value: $("#blur").val() || 0,
			min: 0,
			max: 50,
			step: 1,
			slide: function( event, ui ) {
				$("#blur").val(ui.value).prev("label").children(".count").text(ui.value);
			}
		});
			
	},
	

	// set up radio buttons

	radios: function() {
		$(".buttonset").buttonset();
	},
	
	
	// initialize simple color picker dropdown
	
	colors: function() {
		$("#tiletint").miniColors({
			letterCase: 'uppercase',
			change: function(hex, rgb) {}
		});
	},
	
	
	// build image
	
	build: function() {
	
		// build image tiles array
		
		for(var i=0; i < this.rows; i++) {
			for(var n=0; n < this.columns; n++) {
				var xpos = n * this.tilesize;
				var ypos = i * this.tilesize;
				this.chunks.push({x:xpos,y:ypos});
			}	
		}
		
		
		
		// figure out if image is landscape or portrait and set background-size accordingly
		
		if 	(this.width <= this.height)	this.bgsize = this.imagesize + "px auto";
		else 							this.bgsize	= "auto " + this.imagesize + "px";
		
		
		// option: randomize tiles
		
		if(this.random == "on") util.shuffle(this.chunks);
		

		// option: blur (firefox only)
		
		if(parseInt(this.blur) > 0) {			
			this.blurclass = "blur";
			$("#svgblur").html('\
				<svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="height:0;">\
					<defs>\
						<filter id="f1" x="0" y="0">\
							<feGaussianBlur in="SourceGraphic" stdDeviation="'+this.blur+'" id="GaussianBlur" />\
						</filter>\
					</defs>\
				</svg>\
				<style type="text/css">.blur { filter: url(#f1); }</style>\
			');
		}
		
		
		// build image tiles
		
		$(this.html).addClass("img_wrap").css({
			"width" 		: this.totalwidth + "px",
			"padding-left"	: this.tilemargin + "px"
		})
		
		
		for(var i=0; i < this.chunks.length; i++) {
	
			if(img.opjitter == "on") img.opacity = Math.random();
			
			var tile = document.createElement("div"),
				tilebg = document.createElement("div"),
				tint = document.createElement("span");
			
			$(tile).addClass("tile").css({
				"opacity"			: img.opacity,
				"width"				: img.tilesize + "px",
				"height"			: img.tilesize + "px",
				"border-radius"		: img.radius + "px",
				"margin" 			: "0 " + img.tilemargin + "px " + img.tilemargin + "px 0",
				"-webkit-transform" : "rotate(" + img.rotate + "deg)",
				"-moz-transform" 	: "rotate(" + img.rotate + "deg)"
			});
			
			$(tilebg).addClass("tilebg").addClass(img.blurclass).css({
				"background"		: "url(" + img.url + ") -" + this.chunks[i].x + "px -" + this.chunks[i].y + "px",
				"background-size"	: img.bgsize,
				"width"				: img.intilesize + "px",
				"height"			: img.intilesize + "px",
				"border-radius"		: img.inradius + "px"
			});
			
			if(img.tiletintop > 0) {		
				$(tint).addClass("tint").css({
					"background"	: img.tiletint,
					"opacity"		: img.tiletintop,
					"width"			: img.tilesize + "px",
					"height"		: img.tilesize + "px",
					"border-radius"	: img.radius + "px"
				});
				$(tilebg).append(tint);
			}
			
			$(tile).append(tilebg);
			$(img.html).append(tile);
			
		}
		
		// write it to the page
		
		$("#randomized").html(this.html);
	
	}
		
};