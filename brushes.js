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
    constructor(project, options, callbacks) {
	this.project = project;
	this.options = options;

	var _this = this;
	Pressure.set(this.project.view.element, { change: function(f, event){ _this.force = f } });
	// this.path.data.points = [];
    }

    initPath(project) {
	this.path = new Path();
	this.path.name = createUUIDv4();
	this.path.addTo(this.project);
	this.path.data.startTime = (new Date).getTime();
	this.path.data.points = [];
    }
    
    addPoint(point, data) {
	data = data ? data : {};
	var p = {
	    point: point,
	    time: ((new Date).getTime() - this.path.data.startTime),
	    pressure: (Math.round(this.force * 1000) / 1000) 
	};
	p = {...p, ...data};
	this.path.data.points.push(p);
    }

    lineStartEvent(d)  { return new CustomEvent('lineStart', { detail: d }) }
    linePointEvent(d)  { return new CustomEvent('linePoint', { detail: d }) }
    lineFinishEvent(d) { return new CustomEvent('lineFinish', { detail: d }) }    
    lineEditEvent(d)   { return new CustomEvent('lineEdit', { detail: d }) }
    lineDeleteEvent(d) { return new CustomEvent('lineDelete', { detail: d }) }
}

class InkBrush extends Brush {
    constructor(project, options) {
	super(project, options)
	var app = this;
	Pressure.set(app.project.view.element, { change: function(f, event){ app.force = f } });
    }

    startLine(point) {
	this.path.add(point);
	super.addPoint(point)
    }
    
    get onMouseDown() {
	var app = this;

	var somd = super.onMouseDown;
	
	return function(event){
	    // ---------------------------------------------
	    // initialization stuff needs to happen here
	    // ---------------------------------------------
	    
	    if (app.path) { app.path.selected = false }

	    app.initPath(app.project);

	    // --------------------------
	    // color etc. setup
	    // this is probably bad
	    // --------------------------

	    var color          =  new Color(Cookies.get('brushColor') || '#222222aa');
	    color.alpha        = (Cookies.get('brushOpacity') / 100) || 0.66;
	    var pressureFactor = Cookies.get('pressureFactor') || 10;

	    app.path.strokeColor = undefined;
	    app.path.fillColor   = color;
	    app.pressureFactor   = pressureFactor;
	    app.startLine(event.point, app.force);
	}
    }

    addPoint(point, middlePoint, force){
	var lastPoint = this.path.data.points[this.path.data.points.length-1].point;
	var delta     = point.subtract(lastPoint);
	var step      = delta.normalize().multiply(force * this.pressureFactor);

	step.angle += 90;

	middlePoint = middlePoint || point.add(delta.divide(2));
	
	var top =    middlePoint.add(step);
	var bottom = middlePoint.subtract(step);

	this.path.add(top.round());
	this.path.insert(0, bottom.round());
	
	this.path.smooth();

	super.addPoint(point, { middlePoint: middlePoint } )
    }
    
    get onMouseDrag() {
	var app = this;

	return function(event){
	    // -----------------------------------------------
	    // force should be [a basis] + [a factor] * force
	    // -----------------------------------------------

	    // -----------------------------------------------
	    // NB: using + and - directly doesn't
	    // seem to work in plain Javascript
	    // -----------------------------------------------
	    
	    app.addPoint(event.point, event.middlePoint, app.force)
	}
    }

    lastPoint(point) {
	this.path.add(point);
	this.path.closed = true;
	this.path.smooth();
	super.addPoint(point)
    }
    
    get onMouseUp(){
	var app = this;
	return function(event){
	    app.lastPoint(event.point);
	    app.path.project.view.element.dispatchEvent(app.lineFinishEvent(app.path));
	}
    }

    fromPoints(points) {
	console.log(points);
	
	var p = points.slice();

	this.initPath(this.project);
	this.startLine(p.shift().point);

	while (p.length > 1) {
	    var e = p.shift()
	    this.addPoint(e.point, e.middlePoint, e.pressure)
	}
	this.lastPoint(p.shift().point);
	console.log(this.path.data.points);
	// this.path.fillColor = 'Blue';
	return this.path
    }
}

class Sharpie extends Brush {
    get onMouseDown() {
	var app = this;
	
	return function(event){
	    if (app.path) { app.path.selected = false }

	    app.initPath(app.project);
	    
	    app.path.strokeColor       = Cookies.get('brushColor') || 'black';
	    app.path.strokeColor.alpha = (Cookies.get('brushOpacity') / 100) || 0.8;
	    app.path.strokeWidth       = Cookies.get('pressureFactor') || 10;

	    app.addPoint(event.point)
	    // app.path.add(event.point);
	};
    }

    addPoint(point) {
	this.path.add(point);
	super.addPoint(point)
    }
    
    get onMouseDrag() {
	var app = this;
	return function(event){
	    // app.path.add(event.point);
	    app.addPoint(event.point)
	}
    };

    lastPoint(point){
	this.path.add(point);
	this.addPoint(point)
	this.path.simplify();
	
	var offset = -1 + this.path.strokeWidth / 2;
	
	var outerPath = OffsetUtils.offsetPath(this.path, offset);
	var innerPath = OffsetUtils.offsetPath(this.path, -offset);
	
	innerPath.strokeColor = this.path.strokeColor;
	
	outerPath.reverse();
	
	innerPath.join(outerPath);
	innerPath.closePath()
	innerPath.fillColor = this.path.strokeColor;
	innerPath.insertBelow(this.path);
	innerPath.data = this.path.data;
	innerPath.name = this.path.name;
	
	this.path.remove();
	this.path = innerPath;
    }
    
    get onMouseUp() {
	var app = this;
	return function(event){
	    app.lastPoint(event.point)
	    app.path.project.view.element.dispatchEvent(app.lineFinishEvent(app.path));
	}
    }

    fromPoints(points) {
	console.log(points);
	
	var p = points.slice();
	
	this.initPath(this.project);

	this.path.strokeWidth = 12;
	this.addPoint(p.shift().point);

	while (p.length > 1) { this.addPoint(p.shift().point) }
	this.lastPoint(p.shift().point);
	return this.path
    }
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
			// app.socket.send(JSON.stringify({ paperItem: project.getItem({ name: uuid}).toJSON() }));
		    } else {
			// app.socket.send(JSON.stringify({ paperCommand: 'project.getItem({ name: "' + uuid + '"}).remove()' }))
		    }
		}
		app.changedItems = {};
	    }
	}
    }
};
