
class FrenchCurve {
    constructor(options) {
	this.options = options;
	console.log('FrenchCurve ok')
    }

    centerLine() {
	console.log('centerline');
    }

    straighten(d, app) {
	var u = new Path(d.data.points.map(p => p.point));

	var uLength = u.length;
	var p = new Path(d.data.points[0].point, d.data.points[d.data.points.length - 1].point);
	var pLength = p.length;

	// ------------------------------------
	// probably preserve time and so on
	// ------------------------------------
	
	var offsets = d.data.points.map(q => {
	    return {
		point: p.getPointAt(u.getOffsetOf(q.point) / uLength * pLength),
		pressure: q.pressure
	    }
	} );
	
	p.strokeColor = 'Yellow';
	p.strokeWidth = 3;

	p.remove()
	// var p = new Path(d.data.points);

	// var path = app.brush.fromPoints(d.data.points);
	var path = app.brush.fromPoints(offsets);
	path.fillColor = d.fillColor;
	path.name = d.name
	d.remove()
    }

    merge(){
	
    }
    breakAtAngle(d, app){
	var angle = 90;

	var u = new Path(d.data.points.map(p => p.point));

	var lastAngle = Number.NEGATIVE_INFINITY;
	for (var p = 0; p <= u.length; p++) {
	    var t = u.getTangentAt(p)
	    if (!(t.angle % 90) && (t.angle != lastAngle)) {
		// console.log(t.angle, p)

		lastAngle = t.angle
		var path = new Path.Circle(u.getPointAt(p), 10);
		path.strokeColor = 'black';
		path.fillColor = 'black';
		path.addTo(d.project);
	    } else {
		lastAngle = t.angle
	    }
	    
	}
    }

}
/*

- check if line is y or y oriented, or neither
- chop line into curves at tangent 0 or 90

*/
