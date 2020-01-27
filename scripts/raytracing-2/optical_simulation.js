/*

Runs an optical simulation
Uses vec2d.js

 */

// Optical components

let plugins = {
	
	plainproto: Object.getPrototypeOf({}), // the prototype of a plain object

	setproto(proto, instance) {
		return Object.assign(Object.create(proto), instance)
	},
	
	create(instance) {
		// attaches a prototype to the plain javascript 'object'
		if (Object.getPrototypeOf(instance)==this.plainproto) {
			// object doesn't have a prototype
			if (this[instance.type]) {
				return Object.assign(Object.create(this[instance.type]), instance)
			}
		}
		return instance 
	}
}

// ray of light

plugins.ray = function(light, direction, pt) { 
	// creates a ray from the light in the direction. If the light center isn't ok, add
	// the actual point.
	return plugins.create({
		type: 'ray',
		'from': light,
		path: [pt || light.position],
		direction
	})
}



// base for objects defined by centre position & aperture & axis (at 90 deg to surface)

plugins.base = {
	
    init(state) { // called on all objects before simulation - state is the full thing, not just items
		this.temp = {}
    },

    center() {  // returns the center of the object
        return [...this.position]
    },

    ends() { // returns the two endpoints of the object, assuming it's linear
        let surf = v2.scale(this.aperture/2, v2.rot90(this.axis))
        return [v2.add(this.position, surf), v2.sub(this.position, surf)]
    },

    boundingBox() { // returns a bounding box for the object based on the ends
        let ends = this.ends(),
			x = 0, y = 1
		
		return [Math.min(ends[0][x], ends[1][x]),
			Math.max(ends[0][x], ends[1][x]),
			Math.max(ends[0][y], ends[1][y]),
			Math.max(ends[0][y], ends[1][y])]
    },

    intersect(ray) { // intersects the ray with the object
        // check they are on the same plane
        if ((this.plane || 0) !== (ray['from'].plane || 0)) {
            return false
        }
        let ends = this.ends(), 
			{c, pt} = v2.line_line(ray.path[ray.path.length - 1], ray.direction, ends[0], 
				v2.sub(ends[1], ends[0]))
		if (!isFinite(c[0]) || !isFinite(c[1]) || c[0] < 0 || c[1] < 0 || c[1] > 1) {
			return false
		}
        return {
			pt,  // the actual point of intersection on the object
            distance: c[0], // the distance the ray has to travel to intersetc
            object: this  // the object itself
        }
    },
	
    distanceTo(pt) { // gives shortest distance to point [x, y]
        let ends = this.ends(),
			closest = v2.ray_point(ends[0], v2.sub(ends[1], ends[0]), pt, 1)
        return v2.norm(v2.sub(closest, pt))
    },

	move(dx, dy) {
		// moves self or delegates to parent group
		this.group ? this.group.move(dx, dy) : this.moveself(dx,dy)
	},
	
	moveto(x,y) {
		this.move(...v2.sub([x,y], this.center()))
	},
	
    moveself(dx, dy) { // changes the position of the object
        let xlock = this.ui && this.ui.xlock, 
			ylock = this.ui && this.ui.ylock
		if (!xlock) {
			this.position[0] += dx
		} else if (Array.isArray(xlock)) {
			this.position[0] += dx
			this.position[0] = Math.max(xlock[0], this.position[0])
			this.position[0] = Math.min(xlock[1], this.position[0])
		}
		if (!ylock) {
			this.position[1] += dy
		} else if (Array.isArray(ylock)) {
			this.position[1] += dy
			this.position[1] = Math.max(ylock[0], this.position[1])
			this.position[1] = Math.min(ylock[1], this.position[1])
		}
    }
}

// a group of objects that moves together. Has nothing else in common

plugins.group = {
	init(state) {
		// finds all referred objects in state
		if (!this.objects) {
			this.objects = this.children.map( function(x) {
				x = typeof x=='string'?x:x.id
				return findObject(state, x)
			})
			let self = this
			this.objects.forEach(x => x.group = self)
		}
	},
	
	moveself(dx, dy) {
		this.objects && this.objects.forEach(x=>x.moveself(dx,dy))
	},
	
	add(id) { // only useful after prototypes have been set
		this.children.push(id)
		delete this.objects
	},
	
	remove(id) { // only useful after prototypes have been set
		let i = this.children.findIndex(x=>x==id||x.id==id)
		if (i>=0) {
			this.children.splice(i,0)
			let obj = this.objects.splice(i,1)[0]
			delete obj.group
		}
	},
	
	move: plugins.base.move	
}

// paraxial surface, defined by the following properties:
// position: the centre of the surface
// aperture: the width of the surface
// n_in, n_out: the refractive indices
// power: the power of the surface, radius can be derived from n_in, n_out
// axis: the direction at 90 deg to surface, pointing towards n_out

plugins.surface = plugins.setproto(plugins.base, { // a paraxial surface

	optics(ray, n_in, n_out, dontwatch) {
		// the ray has intersected the surface at ray.points[-1] in direction
		// ray.direction, & return direction of refracted ray or false if none
		let axis = this.axis,
			[run, rise] = v2.coords(ray.direction, axis),
			surf = v2.rot90(axis)
		n_in = n_in || this.n_in
		n_out = n_out || this.n_out

		if (run < 0) { // turn the lens thru 180 degrees, refractive indices too
			[rise, run, n_in, n_out] = [-rise, -run, n_out, n_in]
			axis = v2.rot180(axis)
			surf = v2.rot180(surf)
		}
		let h1 = v2.dot(surf, v2.sub(ray.path[ray.path.length - 1], this.position)),
			h2 = h1,
			num = -this.power * h1 * run + n_in * rise,
			denom = n_out * run,
			direction
		if (Math.abs(denom) > Math.abs(num)) {
			// we just do things the normal way
			let s2 = num / denom
			direction = v2.normalize(v2.add(axis, v2.scale(s2, surf)))
		} else {
			// we do it with inverted slopes
			let invs2 = denom / num
			direction = v2.normalize(v2.add(v2.scale(Math.abs(invs2), axis),
						v2.scale(Math.sign(invs2), surf)))
		}

		// is ray.from on the compute list?
		!dontwatch && this.temp.watchers && this.temp.watchers.forEach(x=>x.watch(ray, direction))

		return direction
	}
})

// thin lens. Like a surface, but n_in & n_out are assumed equal to 1

plugins.thinlens = plugins.setproto(plugins.surface, {
	optics(ray) {
		return plugins.surface.optics.call(this, ray, 1, 1)
	}
})

// mirror

plugins.mirror = plugins.setproto(plugins.surface, {
	optics(ray) {
		// work out the ray as if it was a lens:
		let direction = plugins.surface.optics.call(this, ray, 1, 1, true),
			axis = this.axis,
			[run, rise] = v2.coords(ray.direction, axis)
		// reverse the direction wrt axis
		direction = v2.add(v2.scale(-run, axis), v2.scale(rise, v2.rot90(axis)))
		// fix watchers
		this.temp.watchers && this.temp.watchers.forEach(x=>x.watch(ray, direction))
		// return the direction as expected
		return direction
	}
})


// computational nodes

plugins.computeItem = {
	
	init(state) {
		// add self to list of notifications on the target object
		let t = findObject(state, this.lens).temp
		t.watchers = t.watchers || []
		t.watchers.push(this)
		this.rays = [] // all the rays being collected
		this.intersections = []
		this.position = [] // all the agglomerated points
	},
	
	watched(light) {
		// true if the ray is being watched
		return light.id==this.light || (light.group && this.watched(light.group))
	},
	
	watch(ray, direction) {
		if (this.watched(ray['from'])) {
			this.rays.push({
				pt: ray.path[ray.path.length - 1],
				entering: v2.sub(ray.path[ray.path.length - 1],ray.path[ray.path.length - 2]),
				leaving: direction,
				ray
			})
		}
		this.update()
	},
	
	tol: 1e-6,
	
	update() {
		let rays = this.rays,
			lastray = rays[rays.length-1],
			points = []
			
		if (rays.length==1) { return }

		
		// work out the points of intersection for new ray with all old rays
		for (let i = 0; i < rays.length-1; i++) {
			let isect = v2.line_line(rays[i].pt, rays[i].leaving, 
									 lastray.pt, lastray.leaving)
			if (this.ok(isect)) { 
				points.push({pt: isect.pt, rays: [i, rays.length-1]})
			}
		}
		
		// agglomerate the new intersection points if close enough to old ones
		let inters = this.intersections
		while (points.length > 0) {
			let seed = points.pop(),
				merged = false
			for (let inter of inters) {
				if (v2.dist2(seed.pt, inter.pt) < this.tol) {
					let n = inter.rays.size // old size
					inter.rays.add(seed.rays[0])
					inter.rays.add(seed.rays[1])
					n = inter.len
					inter.len+=1
					/*inter.pt = v2.scale(1/inter.rays.size, v2.add(
								v2.scale(inter.rays.size-n, seed.pt), 
								v2.scale(n, inter.pt)
							))*/
					inter.pt = v2.scale(1/inter.len, v2.add(
								v2.scale(inter.len-n, seed.pt), 
								v2.scale(n, inter.pt)
							))
					merged = true
					break
				}
			}
			if (!merged) {
				seed.rays = new Set(seed.rays)
				seed.len = 1
				inters.push(seed) // new intersection
			}
		}
		
		// sort them & copy the biggest to position
		//inters.sort((a,b)=>b.rays.size-a.rays.size)
		inters.sort((a,b)=>b.rays.len-a.rays.len)
		inters.length>0 && (this.position = inters[0].pt)
	},
	
	center: plugins.base.center
}

plugins['virtual image'] = plugins.setproto(plugins.computeItem, {
	
	style: {
		strokeDash: [5, 8]
	},
	
	ok(isect) {
		// valid virtual ray intersection	
		function lo(n, limit) {
			return Math.abs(n) < (limit || 1000000)
		}
		
		return lo(isect.c[0]) && lo(isect.c[1]) && isect.c[0] < 0 && isect.c[1] < 0
	},
	
	draw(p5, vbox, ppm) {
		let inters = this.intersections
		// virtual ray styles should be influenced by lens style parameters
		let step = this.step || 1
		for (let i = 0; i < inters.length; i++) {
			let v = inters[i]
			v.rays = [...v.rays.values()]
			for (let j = 0; j < v.rays.length; j+=step) {
				// change style for each ray
				let r = this.rays[v.rays[j]]
				let style = Object.assign({}, 
						plugins.ray.style, 
						r.style,
						r.ray['from'].style, 
						plugins['virtual image'].style, 
						this.style)
				if (style.visible==true) {
					p5.stroke(style.stroke)
					p5.strokeWeight(style.strokeWeight)
					p5.strokeDash(style.strokeDash)
					p5.line(...v2.scale(ppm, r.pt), ...v2.scale(ppm, v.pt))
				}
			}
		}
	}

})

plugins['real image'] = plugins.setproto(plugins.computeItem, {
	ok(isect) {
		// valid virtual ray intersection	
		function lo(n, limit) {
			return Math.abs(n) < (limit || 1000000)
		}
		
		return lo(isect.c[0]) && lo(isect.c[1]) && isect.c[0] > 0 && isect.c[1] > 0
	},
})


plugins['blur disc'] = {
	
	init(state) {
		// add self to list of notifications on the target object
		let t = findObject(state, this.barrier).temp
		t.watchers = t.watchers || []
		t.watchers.push(this)
		this.blurbox = false // [xmin, xmax, ymin, ymax]
	},
	
	watch(ray) {
		if (ray['from'].id==this.light) {
			let pt = ray.path[ray.path.length-1],
				box = [pt[0], pt[0], pt[1], pt[1]]
			
			if (this.blurbox) {
				this.blurbox[0] = Math.min(this.blurbox[0], box[0])
				this.blurbox[1] = Math.max(this.blurbox[1], box[1])
				this.blurbox[2] = Math.min(this.blurbox[2], box[2])
				this.blurbox[3] = Math.max(this.blurbox[3], box[3])
				this.raycount++
			} else {
				this.blurbox = box
				this.raycount = 1
			}
		}
	}
}

// a barrier simply stops a ray. A barrier is defined by
// position: [x1, y1, x2, y2] - the ends of the line

plugins.barrier = plugins.setproto(plugins.base, {
	ends() {
		return [[this.position[0], this.position[1]], [this.position[2], this.position[3]]]
	},

	center() {
		return v2.scale(0.5, v2.add(...this.ends()))
	},

	moveself(dx, dy) {
		// xlock, ylock ranges depend on the center of the barrier
        let xlock = this.ui && this.ui.xlock, 
			ylock = this.ui && this.ui.ylock,
			c = this.center()
		if (!xlock) {
			this.position[0] += dx
			this.position[2] += dx
		} else if (Array.isArray(xlock)) {
			dx = Math.max(xlock[0], Math.min(xlock[1], c[0]+dx))-c[0]
			this.position[0] += dx
			this.position[2] += dx
		}
		if (!ylock) {
			this.position[1] += dy
			this.position[3] += dy
		} else if (Array.isArray(ylock)) {
			dy = Math.max(ylock[0], Math.min(ylock[1], c[1]+dy))-c[1]
			this.position[1] += dy
			this.position[3] += dy
		}
	},

	optics(ray) {
		// is ray.from on the compute list?
		this.temp.watchers && this.temp.watchers.forEach(x=>x.watch(ray))
		return false
	}

})

plugins.snellrefract = function(ray, normal, partial) {
	// get the directions right - normal should point towards the refractive side
	if (v2.dot(ray.direction, normal)<0) {
		[n_in, n_out] = [n_out, n_in]
		normal = v2.rot180(normal)
	}
	let norm90 = v2.rot90(normal),
		sin_theta_in = v2.sin(axis, ray.direction),
		sin_theta_out = n_in*sin_theta_in/n_out
	// work out reflected ray
	let cos_theta_in = Math.sqrt(1-sin_theta_in**2),
		reflected = v2.add(
			v2.scale(cos_theta_in, normal),
			v2.scale(sin_theta_in, norm90)
		)
	// work out the refracted ray, if any
	let refracted
	if (sin_theta_out<1) {
		let cos_theta_out = Math.sqrt(1-sin_theta_out**2)
		refracted = v2.add(
			v2.scale(cos_theta_out, normal),
			v2.scale(sin_theta_out, norm90)
		)
	} else {
		refracted = false
	}
	return [refracted, reflected] // and what about the transmission??
}


plugins['snell surface'] = plugins.setproto(plugins.barrier, {
	// a flat surface defined by two ends and n_in, n_out. The n_out side
	// is to the left of the direction ends[0]->ends[1], so the normal points there
	partial: true,
	
	optics(ray) {
		let ends = this.ends(),
			normal = v2.rot270(v2.normalize(v2.sub(ends[1], ends[0])))
		return plugins.snellrefract(ray, normal, this.partial)
	}
})


plugins.arc = plugins.setproto(plugins.base, {
	
	// position: [x,y]
	// r : r, or [half-horizontal-axis, half-vertical-axis]
	// axis: [x,y] points from centre of circle to center of arc
	// width: w the angular width of the arc in degrees
	
	boundingBox() { // conservative bounding box
		return [this.position[0]-this.r[0], this.position[0]+this.r[0],
			this.position[1]-this.r[1], this.position[1]+this.r[1]]
    },
	
	ends() {
		// returns the two chord points
		let axis_angle = v2.angle(this.axis),
			w = this.width/180*Math.PI,
			lo = axis_angle-w/2,
			len_lo = 1/Math.sqrt((Math.cos(lo)/this.r[0])**2+(Math.sin(lo)/this.r[0])**2),
			hi = axis_angle+w/2,
			len_hi = 1/Math.sqrt((Math.cos(hi)/this.r[0])**2+(Math.sin(hi)/this.r[0])**2)
			
		return [v2.add(v2.polar(len_hi, hi),this.position),
				v2.add(v2.polar(len_lo, lo),this.position) ]
	},
	
	_line_ellipse(h, v, a, b, c) { // does line ax+by=c & (x/h)^2+(y/v)^2=1 intersection
	
		function quadsolve(a,b,c) { // solve a quadratic
			let det = b**2-4*a*c
			if (det<0) return []
			if (a==0) {
				return [-c/b]
			}
			det = Math.sqrt(det)
			return [(-b-det)/2/a, (-b+det)/2/a ]
		}
		
		if (Math.abs(b)>Math.abs(a)) {
			// try y = (-a/b)x+(c/b) = mx+z
			// then subst into ellipse to get a quadratic in x
			let m = -a/b, 
				z = c/b,
				x = quadsolve(1/h**2+(m/v)**2, 2*m*z/v**2, (z/v)**2-1)
				return x.map(xx => [xx, m*xx+z])
		} else {
			// try x = (-b/a)y+(c/b) = my+z
			let m = -b/a, 
				z = c/a,
				y = quadsolve(1/v**2+(m/h)**2, 2*m*z/h**2, (z/h)**2-1)
				return y.map(yy => [m*yy+z, yy])
		}

	},
	
	intersect(ray) { 
        if ((this.plane || 0) !== (ray['from'].plane || 0)) {
            return false
        }
		
		let d = ray.direction, // line is p+alpha*d
			p = v2.sub(ray.path[ray.path.length - 1], this.position),
			a = d[1],
			b = -d[0],
			c = d[1]*p[0] - d[0]*p[1],
			x = this._line_ellipse(this.r[0], this.r[1], a, b, c)
		// order the intersection points in distance from p
		let alphas = x.map(x=>v2.dot(v2.sub(x,p), d)).filter(x=>x>=0)
		alphas.sort()
		
		for (let alpha of alphas) {
			let pt = v2.add(ray.path[ray.path.length - 1], v2.scale(alpha, d)),
			    s = v2.cos(v2.sub(pt, this.position), this.axis)
			s = Math.acos(s)*180/Math.PI
			if (Math.abs(s)<this.width/2) {
				return {
					pt,  // the actual point of intersection on the object
					distance: alpha/v2.norm(d), // the distance the ray has to travel to intersect
					object: this  // the object itself
				}
			}
		}
		return false
	}
})

plugins['snell arc'] = plugins.setproto(plugins.arc, {
	// n_in, n_out are indices inside & outside the arc
	
	optics(ray) {
		let pt = v2.sub(ray.path[ray.path.length-1], this.position),
			normal = v2.normalize([-pt[0]/this.r[0]**2, -pt[1]/this.r[1]**2]),
			// normal always points towards the inside
			{n_in, n_out} = this
		
		if (v2.dot(normal, ray.direction)<0) {
			[n_in, n_out] = [n_out, n_in]
			normal = v2.rot180(normal)
		}
		let sin_theta_in = v2.sin(ray.direction, normal),
		    sin_theta_out = n_in*sin_theta_in/n_out,
			direction = v2.rotate(normal, -Math.asin(sin_theta_out))
			
		// is ray.from on the compute list?
		this.temp.watchers && this.temp.watchers.forEach(x=>x.watch(ray, direction))
		
		return direction
	}
})

plugins['mirror arc'] = plugins.setproto(plugins['snell arc'], {
	// n_in, n_out are indices inside & outside the arc
	
	optics(ray) {
		let pt = v2.sub(ray.path[ray.path.length-1], this.position),
			normal = v2.normalize([-pt[0]/this.r[0]**2, -pt[1]/this.r[1]**2]),
			// normal always points towards the inside
			{n_in, n_out} = this
		
		if (v2.dot(normal, ray.direction)<0) {
			[n_in, n_out] = [n_out, n_in]
			normal = v2.rot180(normal)
		}
		let sin_theta_in = v2.sin(ray.direction, normal),
		    sin_theta_out = -sin_theta_in,
			direction = v2.rotate(normal, -Math.asin(sin_theta_out))
		
		// reverse the direction of the ray
		direction = v2.scale(-1, direction)
		
		// is ray.from on the compute list?
		this.temp.watchers && this.temp.watchers.forEach(x=>x.watch(ray, direction))
		
		return direction
	}
})


// CSG functions to create arcs from intersections/differences of circles

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

plugins['divergent light'] = plugins.setproto(plugins.base, {
	intersect: false,

	distanceTo(pt) {
		return v2.norm(v2.sub(this.position, pt))
	},

	emit(objects, box, target) {
		let rays = []
		target = target==undefined ? this.target : target

		if (this.off) { return rays }

		switch (typeof target) {
			case 'number':
				// aimed at a fixed direction in degrees, spread is a number
				for (let i = 0; i < this.raycount; i++) {
					let a = this.raycount == 1 ? target : target - this.spread / 2 + (this.spread / (this.raycount - 1)) * i,
					direction = v2.polar(1, v2.rad(a))
						rays.push(plugins.ray(this, direction))
				}
				return rays

			case 'object': // actually an [x,y] point in space
				// Convert target to an angle & recalculate
				return this.emit(objects, box, v2.deg(v2.angle(v2.sub(this.target, this.position))))

			case 'string': // aimed at an object, spread must be a number or 'fill' or 'fill*factor'
				target = objects[this.target]
				let pos = target.center()
				
				if (typeof this.spread == 'number' || this.raycount == 1) {
					// aim ray(s) at the object position
					return this.emit(objects, box, pos)
				}
				// otherwise, rays hit the target at equal points
				let ends = target.ends(),
					fillfactor = parseFloat(this.spread.split('*')[1])
				if (!isNaN(fillfactor)) {
					let dir = v2.scale((1 + fillfactor) / 2, v2.sub(ends[1], ends[0]))
					ends[0] = v2.add(ends[0], dir)
					ends[1] = v2.sub(ends[1], dir)
				}
				let step = v2.scale(1 / (this.raycount - 1), v2.sub(ends[1], ends[0]))
				for (let i = 0; i < this.raycount; i++) {
					let pt = v2.add(ends[0], v2.scale(i * 0.999 + 0.0005, step))
						rays.push( plugins.ray(this, v2.normalize(v2.sub(pt, this.position))) )
				}
				return rays
		}
	}
})

plugins['parallel light'] = plugins.setproto(plugins.base, {
	intersect: false,
	
	// need moveself
	init(state) {
		this.temp = {pt: state.oldpt}
	},
	
	distanceTo(pt) {
		// looks at the distance to the *first* ray in a sequence
		// remember that the first ray begins at infinity
		let rays = this.temp.rays,
		    mindist = Infinity
		
		if (rays) for (let r of rays) {
			let d
			if (r.path.length>1) {
				// consider ray from path[1] in opposite direction
				d = v2.ray_point(r.path[1], v2.sub(r.path[0],r.path[1]), pt)
			} else {
				d = v2.line_point(r.path[0], r.direction, pt)
			}
			mindist = Math.min(mindist, v2.dist(d, pt))
		}
		this.temp.pt = pt
		return mindist
	},
	
	moveself(dx, dy) {
		let target = this.temp.target || this.target,
		    pt = this.temp.pt
		switch (typeof target) {
			case 'number': // direction
				plugins.base.moveself.call(this, dx, dy)
				break
			case 'object': // [x,y], we rotate position by the amount that pt rotates
				let a0 = v2.angle(v2.sub(pt, target)),
					a1 = v2.angle(v2.sub(v2.add(pt, [dx, dy]), target)),
					dir = v2.sub(this.position, target)
				dir = v2.rotate(dir, a1-a0)
				let newpos = v2.add(dir, target)
				plugins.base.moveself.call(this, ...v2.sub(newpos, this.position))
				break
		}
	},
	
	emit(objects, box, target, spread) {
		let rays = [],
			direction,
			perp,
			ends,
			step

		target = target==undefined ? this.target : target
		spread = spread==undefined ? this.spread : spread
		
		if (this.off) { return rays }
		
		switch (typeof target) {
			case 'number':
				// aimed at a fixed direction in degrees, spread is a number
				direction = v2.polar(1, v2.rad(target))
				if (this.raycount == 1) { // not really parallel is it?
					rays.push(plugins.ray(this, direction))
				} else {
					perp = v2.scale(spread / 2, v2.rot90(direction))
					ends = [v2.add(this.position, perp), v2.sub(this.position, perp)]
					step = v2.scale(1 / (this.raycount - 1), v2.sub(ends[1], ends[0]))
					
					for (let i = 0; i < this.raycount; i++) {
						let start = v2.add(ends[0], v2.scale(i, step))
						// backtrack start so it is outside the box
						let clip = Infinity
						if (Math.abs(direction[0]) > 1e-10) {
							clip = Math.min((box[0] - start[0]) / direction[0],
									(box[1] - start[0]) / direction[0])
						}
						if (Math.abs(direction[1]) > 1e-10) {
							clip = Math.min(clip, (box[2] - start[1]) / direction[1],
									(box[3] - start[1]) / direction[1])
						}
						rays.push(plugins.ray(this, direction, 
							v2.add(start, v2.scale(clip, direction)))
						)
					}
				}
				// copy the rays into temp (for hit tests) & return them
				this.temp.rays = rays
				return rays

				case 'object': // detects an [x,y] point in space
					this.temp.target = [...target]
					return this.emit(objects, box, 
						v2.deg(v2.angle(v2.sub(target, this.position))))

				case 'string': // aimed at an object, spread is a number or 'fill'
					target = objects[target]
					let pos = target.center(),
					    fillfactor
					direction = v2.normalize(v2.sub(pos, this.position))
					if (typeof spread == 'string') {
						fillfactor = parseFloat(this.spread.split('*')[1])
						if (isNaN(fillfactor)) { fillfactor = 1 }
						ends = target.ends()
						spread = Math.abs(v2.dot(v2.sub(ends[1], ends[0]), v2.rot90(direction)) * fillfactor)
					}
					this.temp.target = [...pos]
					return this.emit(objects, box, v2.deg(v2.angle(direction)), spread)
		}
	}
})



// find an object by id in the state.items list

function findObject(state, id) {
    for (obj of state.items) {
        if (obj.id == id)
            return obj
    }
}

// functions to simulate optics

function indexScene(scene, lights, objects) {
	// lights, objects index the lights/objects by id.
	// If they don't have an id, they are indexed by a random number
    lights = lights || {}
    objects = objects || {}
	
    for (let obj of scene) { 
        if (obj.emit) {
            lights[obj.id || Math.random()] = obj
        } else if (obj.intersect) {
            objects[obj.id || Math.random()] = obj // not all objects have ids
        }
    }
    return { lights, objects }
}

function boundingBox(objects, box, s) {
    // box [xmin, xmax, ymin, ymax] is initally set up to be the space covered by the viewbox
    // s is the slop around the box that it should be expanded by
    s = s || 0

    function mergeboxes(b1, b2) {
        return [Math.min(b1[0], b2[0]), Math.max(b1[1], b2[1]), Math.min(b1[2], b2[2]), Math.max(b1[3], b2[3])]
    }

    for (obj of objects) {
        let b = obj.boundingBox(obj)
        box = b?mergeboxes(box, b):box
    }
    return [box[0] - s, box[1] + s, box[2] - s, box[3] + s]
}

function raytrace(r, objects, lasthit) {
    let hits = [],
		isect

    for (let obj of objects) {
        if (obj !== lasthit && (isect = obj.intersect(r))) { // intersectable
            hits.push(isect)
        }
    }
    // find first hit, if any
    hits = hits.sort((a, b) => a.distance - b.distance)[0]

	if (!hits) {
		return r
	} // ray hits nothing & continues in direction given

	r.path.push(hits.pt)
	let newdir = hits.object.optics && hits.object.optics(r)
	// newdir can be an array, when there is both refraction & reflection
	if (newdir) {
		r.direction = newdir
		return raytrace(r, objects, hits.object)
	} else {
		delete r.direction // ray is absorbed because no optics function provided
		return r
	}
}

function simulate(state, box) {
    // scene is an array of objects & lights,
    // box is the dimensions of the arena in which to simulate,
    // used mainly to decide where to start parallel rays from
    // (i.e. outside the box)
	
	// ensure every object is properly prototyped
	state.items = state.items.map(x => plugins.create(x))
	
    let {lights,objects} = indexScene(state.items),
		objectarray = Object.values(objects)
		bbox = boundingBox(objectarray, box, 0.01),
		rays = []

	// initialize every object
    state.items.forEach(x => x.init && x.init(state))
	
    // create all light rays
    for (let id in lights) {
		lights[id].rays = lights[id].emit(objects, bbox)
    }
	
	// trace all light rays
    for (let id in lights) {
		lights[id].rays.forEach(r => rays.push(raytrace(r, objectarray)))
    }
	
    return rays
}
