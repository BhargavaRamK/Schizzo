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

    var brush = new InkBrush(paper.project)

    tool.onMouseDown = brush.onMouseDown;
    tool.onMouseUp = brush.onMouseUp;
    tool.onMouseDrag = brush.onMouseDrag;
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




