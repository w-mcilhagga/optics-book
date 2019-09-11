
// drop-in replacement for the makeArc in optical_simulation.js

function intersectEllipses(h1, v1, d, h2, v2 ) {
	// h1 & v1 are the semi-axes for the ellipse centered at (0,0)
	// h2 & v2 are the semi-axes for the ellipse centered at (d,0),
	
	function zero(x) { return Math.abs(x)<1e-10 }
	
	// work out the solution for x as a quadratic ax**2+bx+c=0
	// which occurs when we set y**2 the same in both ellipses
	let a = (v2/h2)**2-(v1/h1)**2,
		b = -(2*d*v2**2)/h2**2,
		c = (d**2*v2**2)/h2**2-v2**2+v1**2,
		x
	
	// work out the x-coordinates of the intersections
	if (zero(a)) {
		x = zero(b)?[]:[-c/b]
	} else {
		let det = b**2-4*a*c
		if (det<0) {
			x = []
		} else {
			x = [(-b+Math.sqrt(det))/(2*a), (-b-Math.sqrt(det))/(2*a)]
		}
	}
	
	// work out the y-coordinates
	let pts = []
	for (let xi of x) {
		// work out y-coordinates of both ellipses
		let y1_sq = v1**2*(1-(xi/h1)**2),
			y2_sq = v2**2*(1-((xi-d)/h2)**2)
		if (y1_sq>=0 && y2_sq>=0) {
			let y1 = Math.sqrt(y1_sq)
			pts.push([xi,y1], [xi, -y1])
		}
	}
	
	return pts
}

function makeArc(...args) {
	// two cases:
	// makeArc(c1, r1, c2, r2, op) intersects two circles
	// makeArc(c1, h1, v1, c2, h2, v2, op) intersects two ellipses
	// In both cases, the difference is returned.
	// Note that c1[1] & c2[1] must be the same.
	
	let op = args.pop(), // intersect or difference
		c1, c2
	if (args.length==4) {  
		// c1, r1, c2, r2 -> r1, r1, d, r2, r2
		c1 = args[0]
		c2 = args[2]
		args = [args[1],args[1],c2[0]-c1[0],args[3],args[3]]
	} else {
		// c1, h1, v1, c2, h2, v2 -> h1, v1, d, h2, v2
		c1 = args[0]
		c2 = args[3]
		args = [args[1],args[2],c2[0]-c1[0],args[4],args[5]]
	}
	
	let pts = intersectEllipses(...args)
	
	if (pts.length!=2) { // can't handle anything except two points
		return false
	}
	
	let circ = 2*Math.PI,
		a_delta = (v2.angle(v2.sub(c2,c1)) + circ)%circ,
		a = Math.max(...pts.map(v2.angle))*180/Math.PI // because one is always +, one -
	
	let arc = { // the acr caused by 'inter'
		type: 'arc',
		position: [...c1], 
		r: [args[0], args[1]], 
		axis: v2.normalize(v2.sub(c2, c1)),
		width: 2*a
	}
	if (arc.axis[0]<0) { arc.width = 360-arc.width }
	
	if (op.indexOf('diff')==0){
		arc.width = 360-arc.width 
		arc.axis = v2.rot180(arc.axis)
	}
	
	return arc
}
