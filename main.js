var choice = 2;
var path;

drawnpath = [];
strokeColor = "rgb(0, 0, 0)";
var colorPicker = new iro.ColorPicker(".colorPicker", {
	// color picker options
	// Option guide: https://iro.js.org/guide.html#color-picker-options
	width: 100,
	color: "rgb(0, 0, 0)",
	borderWidth: 1,
	borderColor: "#fff",
  });

var pressure = 0;
Pressure.set('canvas', {
  	change: function(force, event){
	pressure = force;
  }
});

var simplify = document.getElementById("simplify");
var strength = document.getElementById("strength");
var simplify_value = simplify.value;
var strength_value = strength.value;
var values = document.getElementById("values");

paper.install(window);
window.onload = function() {
    paper.setup('canvas');
	// Create a simple drawing tool:
	var tool = new Tool();
	tool.minDistance = 1;
	tool.maxDistance = 45;
	// Define a mousedown and mousedrag handler
	tool.onMouseDown = function(event) {
		path = new Path();
		path.strokeColor = strokeColor;
		path.add(event.point);
	}

	tool.onMouseDrag = function(event) {
		switch (choice) 
		{
		  case 1: brush_1(event);
				  break;
		  case 2: brush_2(event);
				  break;    
		}
	}

	tool.onMouseUp = function(event){
		path.simplify(simplify_value);
		drawnpath.push(path);
	}

	tool.onKeyDown = function(event){

		if(event.key == 'c' || event.key == 'C')
		{
			paper.project.activeLayer.removeChildren();
			paper.view.draw();
		}
		if(event.key == 'z' || event.key == 'Z')
		{
			var len = drawnpath.length;
			console.log(drawnpath[len - 1].removeSegments())
		}

	}

	function brush_1(event){
		path.closed = false;  
		path.add(event.point);
	}

	function brush_2(event){

		path.fillColor = {
			saturation: 1,
			brightness: 1,
				  };
		
		path.fillColor 	= strokeColor;	  
		path.closed = true;
		
		var step = event.delta;
		step.x = step.x/strength_value;
		step.y = step.y/strength_value; 

		step.angle += 45 + (pressure * 40);

		var top = event.middlePoint;
		top.x = event.middlePoint.x + step.x
		top.y = event.middlePoint.y + step.y

		var bottom = event.middlePoint;
		bottom.x = event.middlePoint.x - step.x
		bottom.y = event.middlePoint.y - step.y

		path.add(top);
		path.insert(0, bottom);

	}
}


function brushChoice(value){
	choice = value;
}


colorPicker.on(["color:init", "color:change"], function(color){
	strokeColor= color.rgbString 
});


// Update the current slider value (each time you drag the slider handle)
simplify.oninput = function() {
	simplify_value = this.value;
  }

  // Update the current slider value (each time you drag the slider handle)
strength.oninput = function() {
	strength_value = this.value;
  }


  

