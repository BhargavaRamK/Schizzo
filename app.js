paper.install(window);
paper.setup('canvas');

// var tool = new Tool();

var app = new Vue({
    el: '#app',
    data: {
	brush: new InkBrush(paper.project),
	brushColor: '#000000',
	pressureFactor: 50,
	brushOpacity: 100,
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
	var app = this;
	// paper.setup('canvas');

	var canvas = document.querySelector('canvas');
	canvas.style.width ='100%';
	canvas.style.height='100%';
	
	canvas.width  = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;
	this.$nextTick(function () {
	    this.tool = new Tool();
	    
	    this.brushColor = Cookies.get('brushColor');
	    
	    this.pressureFactor = Cookies.get('pressureFactor');
	    this.brushOpacity = Cookies.get('brushOpacity');
	    
	    this.setBrushType(Cookies.get('brushType') ? Cookies.get('brushType') : 'sharpie');
	    
	    this.frenchCurve = new FrenchCurve();
	    
	    $(canvas).on('lineFinish', function(e) {
	        // app.frenchCurve.breakAtAngle(e.detail, app);	    
	        console.log('here')
	    })
	    // $(canvas).off("lineFinish")
	})
	// $(canvas).off()
    },
    methods: {
	setBrushType: function (type) {
	    var setBrush = {
		'inkBrush': () => new InkBrush(paper.project),
		'sharpie':  () => new Sharpie(paper.project),
		'eraser':   () => new Eraser(paper.project),
	    };
	    Cookies.set('brushType', type);
	    console.log(type);
	    var brush = setBrush[type]();

	    this.brush = brush;
	    
    	    this.tool.onMouseDown = brush.onMouseDown;
    	    this.tool.onMouseUp = brush.onMouseUp;
    	    this.tool.onMouseDrag = brush.onMouseDrag;
	},
	setBrushColor: function (event) {
	    this.brushColor = $(event.target).css('background-color')
	},
	centerline: function(){
	    var paths = this.paper.project.getItems({ recursive: true }).filter( i => i.className.match(/Path/) )
	    var path = paths[0];
	    var fat = fattenPath(path, 20)
	    centerline(fat);
	    fat.remove()
	},
	
	mergeLines: function(){
	    var paths = this.paper.project.getItems({ recursive: true }).filter( i => i.className.match(/Path/) )
	    var points = [];

	    paths.forEach(p => {
		var u = fattenPath(p)
		u.strokeColor = 'Yellow';
		u.strokeWidth = 3;
	    })
	}
    },
    watch: {
	brushColor: function (val) { Cookies.set('brushColor', val) },
	pressureFactor: function (val) { Cookies.set('pressureFactor', val) },
	brushOpacity: function (val) { Cookies.set('brushOpacity', val) }
    }
})
		  
		  
