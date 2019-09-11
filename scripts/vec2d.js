// 2d vector calculations. A 2d vector is just [x,y]

let m2 = { // 2D matrices in row-major form
	copy(A) {
		return [[...A[0]],[...A[1]]]
	},
	multbyvec(A,b) {
		return [ A[0][0]*b[0]+A[0][1]*b[1], A[1][0]*b[0]+A[1][1]*b[1] ]
	},
	solve(A,b) {
		// solves A*beta = b & returns beta; overwrites A & b
		if (Math.abs(A[0][0])<Math.abs(A[1][0])) {
			A = [A[1],A[0]]
			b = [b[1],b[0]]
		}
		let f = A[1][0]/A[0][0]
		A[1] = [0, A[1][1]-f*A[0][1]]
		b[1] = b[1] - f*b[0]
		return this.backsub(A,b)
	},
	backsub(A,b) {
		let beta = [0,0]
		beta[1] = b[1]/A[1][1]
		beta[0] = (b[0]-A[0][1]*beta[1])/A[0][0]
		return beta
	}
}

let v2 = {
	// make a vector from length & angle
	polar(len, theta) { return [len*Math.cos(theta), len*Math.sin(theta)] },
	// dot product
	dot(a,b) { return a[0]*b[0]+a[1]*b[1] },
	// squared norm
	norm2(a) { return this.dot(a,a) },
	// norm
	norm(a)  { return Math.sqrt(this.norm2(a)) },
	// cross product
	cross(a,b) { return a[0]*b[1] - a[1]*b[0] },
	// cosine of angle between two vectors, rotating from a towards b
	cos(a,b) { return this.dot(a,b)/this.norm(a)/this.norm(b) },
	// sine of angle between two vectors, rotating from a towards b
	sin(a,b) { return this.cross(a,b)/this.norm(a)/this.norm(b) },
	// angle the vector makes with x-axis
	angle(a) { return Math.atan2(a[1], a[0]) },
	// angle conversions
	deg(r) { return r*180/Math.PI },
	rad(d) { return d*Math.PI/180 },
	
	// add two vectors together
	add(a,b) { return [a[0]+b[0], a[1]+b[1]] },
	// subtract two vectors
	sub(a,b) { return [a[0]-b[0], a[1]-b[1]] },
	// scale a vector by a scalar
	scale(s,a) { return [s*a[0], s*a[1]] },
	// normalize a vector
	normalize(a) { return this.scale(1/this.norm(a), a) },
	// rotate a vector by 90 degrees
	rot90(a) { return [-a[1], a[0]] },
	// rotate by 180
	rot180(a) { return [-a[0], -a[1]] },
	// rotate 270
	rot270(a) { return [a[1], -a[0]] },
	// general rotation
	rotate(a, d) {
		let c = Math.cos(d), s = Math.sin(d)
		return [c*a[0]-s*a[1], s*a[0]+c*a[1]]
	},
	// find part of a parallel to 'onto'
	parallel_part(a, onto) { return this.scale(this.dot(a,onto)/this.norm2(onto), onto) },
	// find part of a perpendicular to 'onto'
	perp_part(a, onto) { return this.sub(a, this.parallel_part(a, onto)) },
	// split a into parallel, perpendicular components
	decompose(a, onto) {
		let p = this.parallel_part(a, onto)
		return [p, this.sub(a, p)]
	},
	// give vector as coordinates in a space defined by x axis
	coords(a, xaxis) {
		return [this.dot(a,xaxis), this.dot(a,this.rot90(xaxis))]
	},
	
	// geometry, mainly intersections
	dist2(a,b) {
		return this.norm2(this.sub(a,b))
	},
	dist(a,b) {
		return this.norm(this.sub(a,b))
	},
	ray_point(start, dir, pt, limit) {
		// the point on the ray (start + alpha*dir), alpha>0, which is closest to pt
		let alpha = this.dot(this.sub(pt, start), dir)/this.dot(dir,dir)
		if (alpha<0) { return start }
		if (limit && alpha>limit) { return v2.add(start, v2.scale(limit, dir)) }
		return this.add(start, this.scale(alpha, dir))
	},
	line_point(start, dir, pt, limit) {
		// the point on the line (start + alpha*dir) which is closest to pt
		let alpha = this.dot(this.sub(pt, start), dir)/this.dot(dir,dir)
		return this.add(start, this.scale(alpha, dir))
	},
	line_line(start1, dir1, start2, dir2) {
		// the unconstrained intersection between (start1 + c1*dir1) & (start2 + c2*dir2)
		// Returns c1, c2, and (start1 + c1*dir1)
		let c = m2.solve([[-dir1[0],dir2[0]],[-dir1[1],dir2[1]]], v2.sub(start1, start2))
		return {c, pt: v2.scale(1/2, 
			v2.add(v2.add(start1,v2.scale(c[0],dir1)), 
			       v2.add(start2,v2.scale(c[1],dir2)))
			)}
	},
	ray_segment(start, dir, pt1, pt2) {
		// the intersection between the ray (start + alpha*dir) and segment (pt1, pt2), if any
		let L = v2.line_line(start, dir, pt1, v2.sub(pt2,pt1))
		if (L.c[1]<0 || L.c[1]>1 || L.c[0]<0) { return undefined }
		return L.pt
	},
	ray_circle(start, dir, centre, r) {
		// intersections between ray & circle, if any
		// not sure if i need this
		let del = v2.sub(start, centre),
			a = v2.norm2(dir),
			b = 2*v2.dot(dir, del),
			c = v2.norm2(del)-r**2,
			det = b**2-4*a*c
		if (det<0) {
			return {c:[]}
		} else {
			c = [(-b+Math.sqrt(det))/2/a, (-b-Math.sqrt(det))/2/a]
			return {c, pts:[ v2.add(start, v2.scale(c[0],dir)), v2.add(start, v2.scale(c[1],dir))]}
		}
	}
		
}