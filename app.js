paper.install(window);
paper.setup('canvas');

// var tool = new Tool();

var app = new Vue({
    el: '#app',
    data: {
	brush: new InkBrush(paper.project),
	brushColor: '#000000',
	pressureFactor: 0.5,
	brushOpacity: 1,
	paper: paper,
	colors: [
	    "#FFFFFF",
	    "#BFBFBF",
	    "#808080",
	    "#404040",
	    "#000000",
	    "#6699FF",
	    "#3366CC",
	    "#003399",
	    "#99CC33",
	    "#00CC00",
	    "#669900",
	    "#FFCC00",
	    "#FF9900",
	    "#FF6600",
	    "#CC0000"
	]
    },
    mounted: function () {
	paper.setup('canvas');
    },
    methods: {
	setBrushType: function (type) {
	    var setBrush = {
		'inkBrush': () => new InkBrush(paper.project),
		'sharpie':  () => new Sharpie(paper.project),
		'eraser':   () => new Eraser(paper.project),
	    };

	    var brush = setBrush[type]();

    	    tool.onMouseDown = brush.onMouseDown;
    	    tool.onMouseUp = brush.onMouseUp;
    	    tool.onMouseDrag = brush.onMouseDrag;
	},
	setBrushColor: function (event) {
	    this.brushColor = $(event.target).css('background-color')
	}
    },
    watch: {
	brushColor: function (val) { Cookies.set('brushColor', val) },
	pressureFactor: function (val) { Cookies.set('pressureFactor', val) },
	brushOpacity: function (val) { Cookies.set('brushOpacity', val) }
    }
})
		  
		  
