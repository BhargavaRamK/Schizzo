/*

- dealing with points should happen at the super-class level
- points shoud record x, y, pressure, time

*/

function createUUIDv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
	return v.toString(16);
    });
}

class Brush {
    constructor(project, options) {
	this.project = project;
	this.options = options;
	this.path = new Path();
	this.path.data.points = [];
    }

    
    get onMouseDown() {
	return function(event){
	    // console.log(event);
	}
    }

    get onMouseDrag() {
	return function(event){
	    // console.log(event);
	}
    }

    get onMouseUp(){
	return function(event){
	    // console.log(event);
	}
    }
}

class InkBrush extends Brush {
    constructor(project, options) {
	super(project, options)
	var app = this;
	
	Pressure.set(app.project.view.element, {
	    change: function(f, event){ app.force = f }
	});
    }

    
    get onMouseDown() {
	var app = this;
	
	return function(event){
	    if (app.path) { app.path.selected = false }

	    app.path = new Path()

	    app.path.strokeColor = undefined;

	    // this is bad
	    app.path.fillColor   = Cookies.get('brushColor') || '#222222aa';

	    app.path.fillColor.alpha = 0.66;

	    app.path.add(event.point);
	    app.path.name = createUUIDv4();
	    app.path.addTo(app.project);

	    app.path.data.points = [];
	    app.path.data.points.push(event.point);
	}
    }

    get onMouseDrag() {
	var app = this;

	return function(event){
	    // -----------------------------------------------
	    // force should be [a basis] + [a factor] * force
	    // -----------------------------------------------

	    var step = event.delta.normalize().multiply(app.force * 10);
	    step.angle += 90;

	    // -----------------------------------------------
	    // NB: using + and - directly doesn't
	    // seem to work in plain Javascript
	    // -----------------------------------------------

	    var top =    event.middlePoint.add(step);
	    var bottom = event.middlePoint.subtract(step);
	    
	    app.path.add(top.round());
	    app.path.insert(0, bottom.round());
	    
	    app.path.smooth();
	    app.path.data.points.push(event.point);
	}
    }

    get onMouseUp(){
	var app = this;
	
	return function(event){
	    app.path.add(event.point);

	    app.path.closed = true;
	    app.path.smooth();

	    app.path.data.points.push(event.point);

	    console.log(app.path.data.points);
	    
	}
    }
}

class Sharpie extends Brush {

    get onMouseDown() {
	var app = this;
	
	return function(event){
	    if (app.path) { app.path.selected = false }

	    app.path = new Path()
	    app.path.strokeColor = Cookies.get('brushColor') || 'black';
	    app.path.strokeColor.alpha = 0.8;
	    app.path.strokeWidth = 10;
	    app.path.add(event.point);
	    app.path.name = createUUIDv4();
	    app.path.addTo(app.project);	
	};
    }
    
    get onMouseDrag() {
	var app = this;
	return function(event){
	    app.path.add(event.point);
	}
    };
	
    get onMouseUp() {
	var app = this;
	return function(event){
	    app.path.simplify();
	    var outerPath = OffsetUtils.offsetPath(app.path, 4);

	    
	    var innerPath = OffsetUtils.offsetPath(app.path, -4);
	    innerPath.strokeColor = app.path.strokeColor;

	    outerPath.reverse();

	    innerPath.join(outerPath);
	    innerPath.closePath()
	    innerPath.fillColor = app.path.strokeColor;
	    innerPath.insertBelow(app.path);

	    app.path.remove();
	    app.path = innerPath;
	    app.path.name = createUUIDv4();
	}
    };
}

class Eraser extends Brush {
    constructor(project, options) {
	super(project, options)

	this.eraseCircle = undefined;
	this.changedItems = {};
    }

    get onMouseDown() {
	var app = this;
	return function(event) {
	    app.eraseCircle = new Path.Circle(event.point, 12)
	    app.eraseCircle.fillColor = "#ffffff88";
	    app.eraseCircle.name = "eraser";
	    app.changedItems = {};
	}
    }
    
    // ---------------------------------------------------------
    // 1. keep track of changed (added, removed) items
    // 2. for every added item, send a creation command
    // 3. for every deleted command, send a delete command
    // ---------------------------------------------------------
    // How would it work if it sent the path of the eraser?
    // ---------------------------------------------------------
    
    get onMouseDrag() {
	var app = this;
	return function(event) {
	    app.eraseCircle.position = event.point
	    var intersects = app.project.getItems( { recursive: true, overlapping: app.eraseCircle.bounds })
		.filter(item => { return item.id !== app.eraseCircle.id && item.className !== "Layer" })
	    ;
	    
	    intersects.forEach(i => {
		if (i.intersects(app.eraseCircle) || i.isInside(app.eraseCircle)) {
		    var uuid = createUUIDv4()

		    
		    var erased = i.subtract(app.eraseCircle, { insert: true })
		    erased.name = uuid;

		    if (i.data.points && i.data.points.length) {
			console.log(i.data.points);
			erased.data.points = JSON.parse(JSON.stringify(i.data.points));
			console.log(erased.data.points);
			
		    } else if (i.data.points && i.data.points.length == 0) {
			console.log('empty points');
			
			erased.data.points = [];
		    } else {
			console.log('no points');
			console.log(i.name);
			console.log(i.visible);
			console.log(i);
			erased.data.points = [];
		    }
		    
		    app.changedItems[uuid] = 'added';
		    app.changedItems[i.name] = 'removed';
		    
		    i.remove();
		} else if (false) {
		    
		}
	    })
	}
    }
	
    get onMouseUp() {
	var app = this;
	return function(event) {
	    app.project.getItems({ recursive: true }).forEach(i => {
		var bounds = i.bounds
		if (bounds.width * bounds.height < 1) {
		    // changedItems[i.name] = 'removed'
		    i.remove()
		}
	    })
	    app.eraseCircle.remove()
	    if (true) {
		console.log(app.changedItems);
		for (var uuid in app.changedItems) {
		    if (app.project.getItems({ name: uuid }).length) {
			app.socket.send(JSON.stringify({ paperItem: project.getItem({ name: uuid}).toJSON() }));
		    } else {
			app.socket.send(JSON.stringify({ paperCommand: 'project.getItem({ name: "' + uuid + '"}).remove()' }))
		    }
		}
		app.changedItems = {};
	    }
	}
    }
};

class Vectorizer extends Brush {
    get onMouseDown() {
	var app = this;
	return function(event){
	    var hits = app.project.hitTestAll(event.point).map(h => h.item);
	    hits.forEach(h => {
		var path = new Path({ strokeColor: 'black', strokeWidth: 3 });
		h.data.points.forEach(p => { path.add(p) })
		path.simplify();

		var cleanPath = new Path({ strokeColor: 'black', strokeWidth: 3 });
		cleanPath.strokeWidth = 3;
		var step = 0.5;
		var points = [ ...Array(Math.ceil(path.length) + 1).keys() ]
		    .map(i => {
			var r = ((i > path.length) ?
				 path.getPointAt(path.length) : 
				 path.getPointAt(i));
			return r
		    } )
		
		points.forEach(p => {
		    if (h.contains(p)) {
			cleanPath.add(p)
		    } else if (p.getDistance(h.getNearestPoint(p)) < 2) {
			cleanPath.add(p)
		    } else {
			cleanPath.simplify()
			cleanPath = new Path({ strokeColor: 'black', strokeWidth: 3 });
			cleanPath.strokeWidth = 3;
		    }
		})
		cleanPath.simplify()
		// var voronoi =  new Voronoi();
		// console.log(cleanPath.exportSVG().getAttribute('d'));
		// var bez = Bezier.SVGtoBeziers(cleanPath.exportSVG().getAttribute('d'));

		// console.log(bez.curves.map(c => { return c.arcs().map(a => a) }))
		// var p =  PathItem.create(bez.offset(16).curves.map(c => c.toSVG()).join(' '));
		// p.strokeColor = 'black';
		// p.addTo(project)
		path.remove()
	    })
	};
    }
}

class Clipper extends Brush {
    constructor(project, options) {
	super(project, options)
	this.lineIds = {};
	this.lines = [];
	
	this.intersectingLines = function(lines){
	    var app = this;
	    return lines.filter(l => {
		return l.getIntersections && l.getIntersections(app.eraseCircle.toPath(false)).length && l.closed == false;
	    })
	} 
	
	this.getFirstLine = function(){
	    var app = this;
	    if (app.firstPath === undefined) {
		var lines = project.getItems({ recursive: true })
		lines = app.intersectingLines(lines)
		lines.forEach(l => {
		    if (!app.lineIds[l.id]) {
			app.lineIds[l.id] = app.lineIds[l.id] == undefined ? 1 : app.lineIds[l.id] + 1;
			app.lines.push(l);
		    }
		})
	    }
	}
    }
    
    get onMouseDown() {
	var app = this;
	return function(event) {
	    app.eraseCircle = new Shape.Circle(event.point, 12)
	    app.eraseCircle.fillColor = "#ffffff88";
	    app.eraseCircle.name = "eraser";
	    // app.callbackId = window.setInterval(function(){
	    // 	app.eraseCircle.radius++
	    // }, 100);

	    
	}
    }
    get onMouseDrag() {
	var app = this;
	return function(event) {
	    app.eraseCircle.position = event.point
	    app.getFirstLine()
	    // console.log(app.lines.map(l => l.id ));
	    // console.log(app.lineIds);
	}
    }    
    
    get onMouseUp() {
	var app = this;
	return function() {
	    window.clearInterval(app.callbackId)
	    var lines = app.lines;
	    
	    var crossings = [
		lines[0].getCrossings(lines[1]),
		lines[1].getCrossings(lines[0])
	    ];

	    var stubs = [];
	    var trunks = [];
	    
	    if (crossings[0].length) {
	    	var p = lines[0].splitAt(crossings[0][0])
		stubs.push(p.length > lines[0].length ? lines[0] : p)
		trunks.push(p.length <= lines[0].length ? lines[0] : p)
	    }

	    if (crossings[1].length) {
	    	var p = lines[1].splitAt(crossings[1][0])
		stubs.push(p.length > lines[1].length ? lines[1] : p)
		trunks.push(p.length <= lines[1].length ? lines[1] : p)
	    }

	    // trunks[0].closed = false;
	    // trunks[1].closed = false;

	    // trunks[0].join(trunks[1])
	    // trunks[0].strokeColor = "white";
	    // trunks[0].closed = false;
	    
	    stubs.forEach(l => l.remove());
	    
	    app.eraseCircle.remove()
	    app.lineIds = {};
	    app.lines = [];
	}
    }
}
