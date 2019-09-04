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
	
    moveself(dx, dy) { // changes the position of the object
        let xlock = this.ui && this.ui.xlock, // should be checked outside this function
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
		this.children = this.children.map( function(x) {
			x = typeof x=='string'?x:x.id
			return findObject(state, x)
		})
		let self = this
		this.children.forEach(x => x.group = self)
	},
	
	moveself(dx, dy) {
		this.children && this.children.forEach(x=>x.moveself(dx,dy))
	},
	
	add(id) { // only useful after prototypes have been set
		this.children.push(id)
	},
	
	remove(id) { // only useful after prototypes have been set
		let i = this.children.findIndex(x=>x==id||x.id==id)
		if (i>=0) {
			let obj = this.children.splice(i,1)[0]
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

	optics(ray, n_in, n_out) {
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

		// is ray.from on the virtualization list?
		if (this.virtual && this.virtual.includes(ray['from'].id)) {
			let id = ray['from'].id
			this.temp.virtual = this.temp.virtual || {}
			this.temp.virtual[id] = this.temp.virtual[id] || []
			this.temp.virtual[id].push({
				pt: ray.path[ray.path.length - 1],
				direction,
				ray
			})
		}

		return direction
	}
})

// thin lens. Like a surface, but n_in & n_out are assumed equal to 1

plugins.thinlens = plugins.setproto(plugins.surface, {
	optics(ray) {
		return plugins.surface.optics.call(this, ray, 1, 1)
	}
})

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
		if (!this.ui || !this.ui.xlock) {
			this.position[0] += dx
			this.position[2] += dx
		}
		if (!this.ui || !this.ui.ylock) {
			this.position[1] += dy
			this.position[3] += dy
		}
	},

	optics(ray) {
		if (this.watch && this.watch.includes(ray['from'].id)) {
			let id = ray['from'].id
				this.temp.watch = this.temp.watch || {}
			this.temp.watch[id] = this.temp.watch[id] || []
				this.temp.watch[id].push({
					pt: ray.path[ray.path.length - 1],
					'from': ray['from']
				})
		}

		if (this.blur && this.blur.includes(ray['from'].id)) {
			let id = ray['from'].id
				this.temp.blur = this.temp.blur || {}
			this.temp.blur[id] = this.temp.blur[id] || []
				this.temp.blur[id].push({
					pt: ray.path[ray.path.length - 1],
					ray
				})
		}

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


plugins.snellsurface = plugins.setproto(plugins.barrier, {
	// a flat surface defined by two ends and n_in, n_out. The n_out side
	// is to the left of the direction ends[0]->ends[1], so the normal points there
	partial: true,
	
	optics(ray) {
		let ends = this.ends(),
			normal = v2.rot270(v2.normalize(v2.sub(ends[1], ends[0])))
		return plugins.snellrefract(ray, normal, this.partial)
	}
})

/*

Divergent Light properties:

position: [x,y] where the light originates from
target:   where the light is pointing. This can be
1) an angle in degrees
2) a point in space
3) an object, in which case it points at the object centre
raycount: the number of rays leaving the light source
spread: This can be
1) a number, which indicates the degrees that the fan of rays covers
2) 'fill', which indicates that it fills the target object
Note that 'fill' can only be used when the target is an object.
style:  an object giving the style of the light and the rays

Divergent light ray styles are taken from the light style. The light style can contain the
following properties:

strokeWidth: the weight of the ray strokes (default 1)
color: the colour of the rays (default 255)
arrow: specifies where the arrows are to be drawn on the rays.

 */

plugins['divergent light'] = plugins.setproto(plugins.base, {
	intersect: false,

	distanceTo(pt) {
		return v2.norm(v2.sub(this.position, pt))
	},

	emit(objects, box, target) {
		let rays = []
		target = target==undefined ? this.target : target

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

/*

Parallel Light properties:

position: [x,y] is a point in space which is in the middle of the beam
target:   where the light is pointing. This can be
1) an angle in degrees
2) a point in space
3) an object, in which case it points at the object centre
raycount: the number of rays leaving the light source
spread: This can be
1) a number, which indicates the width of the beam in metres
2) 'fill', which indicates that it fills the target object
Note that 'fill' can only be used when the target is an object.
style:  an object giving the style of the light and the rays

 */

plugins['parallel light'] = plugins.setproto(plugins.base, {
	intersect: false,
	distanceTo: false, // needs to be redone
	
	emit(objects, box, target, spread) {
		let rays = [],
			direction,
			perp,
			ends,
			step
		
		target = target==undefined ? this.target : target
		spread = spread==undefined ? this.spread : spread
		
		switch (typeof target) {
			case 'number':
				// aimed at a fixed direction in degrees, spread is a number
				direction = v2.polar(1, v2.rad(target))
				if (this.raycount == 1) { // not really parallel is it?
					rays.push(plugins.ray(L, direction))
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
				return rays

				case 'object': // detects an [x,y] point in space
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
	// initialize every object that does so
    state.items.forEach(x => x.init && x.init(state))
	
    let {lights,objects} = indexScene(state.items),
		objectarray = Object.values(objects)
		bbox = boundingBox(objectarray, box, 0.01),
		rays = []

    // create and trace all light rays
    for (let id in lights) {
		lights[id].emit(objects, bbox).forEach(r => rays.push(raytrace(r, objectarray)))
    }
	
    return rays
}
