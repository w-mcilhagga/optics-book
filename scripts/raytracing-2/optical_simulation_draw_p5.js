/*
draw routines.
*/

/*
To do:
2. declarative calculations
3. decorations throughout
*/

plugins.base.decorate = function(p5, ppm, decorations) {
	// adds movement decoration to the object.
	let center = v2.scale(ppm, this.center()),
	    gap = 7,
		linelen = 20
		arrowlen = 10,
		arrowwidth = 7
	
	p5.style({
		stroke: [255, 0, 0],
		fill: false,
		strokeWeight: 5,
		strokeCap: p5.SQUARE
	})

	if (decorations && decorations.indexOf('ui')>=0) {
		if (!this.ui || (this.ui && this.ui.xlock!=true)) {
			p5.line(center[0]+gap, center[1], center[0]+gap+linelen, center[1])
			p5.line(center[0]-gap, center[1], center[0]-gap-linelen, center[1])
		}
		
		if (!this.ui || (this.ui && this.ui.ylock!=true)) {
			p5.line(center[0], center[1]-gap, center[0], center[1]-gap-linelen)
			p5.line(center[0], center[1]+gap, center[0], center[1]+gap+linelen)
		}
		
		p5.strokeCap(p5.ROUND)
		if (!this.ui || (this.ui && this.ui.xlock!=true)) {
			p5.arrow(center[0]+gap+linelen, center[1], 1, 0, arrowlen, arrowwidth)
			p5.arrow(center[0]-gap-linelen, center[1], -1, 0, arrowlen, arrowwidth)
		}
		if (!this.ui || (this.ui && this.ui.ylock!=true)) {
			p5.arrow(center[0], center[1]-gap-linelen, 0, -1, arrowlen, arrowwidth)
			p5.arrow(center[0], center[1]+gap+linelen, 0, 1, arrowlen, arrowwidth)
		}
	}
}

plugins.image = {
	moveself: plugins.base.moveself,
	move: plugins.base.move,
	moveto: plugins.base.moveto,
	decorate: plugins.base.decorate,
	
	align: ['left', 'top'], // says where position[0,1] relates to the image
	
	init(state) {
	},
	
	center() {
		return this.centerpos
	},
	
    draw(p5, vbox, ppm) {
        let img = p5.imgCache[this.image] = p5.imgCache[this.image] || p5.loadImage(this.image, redraw),
			topleft = [],
			w = this.position[2] || img.width/ppm,
			h = this.position[3] || img.height/ppm,
			align = this.align,
			frac = {left:0, top: 0, center:0.5, right: 1, bottom: 1}
		
		if (align == 'center') { align = ['center', 'center'] }
		align[0] = typeof align[0]=='string'?frac[align[0]]:align[0]
		align[1] = typeof align[1]=='string'?frac[align[1]]:align[1]
		
		// this is just the top-left
		topleft[0] = this.position[0] - align[0]*w
		topleft[1] = this.position[1] + align[1]*h
		
		// this is used for decorate
		this.centerpos = [topleft[0]+0.5*w, topleft[1]-0.5*h]
		this.topleft = topleft
		
		if (this.position.length==2) {
			p5.yup_image(img, ppm * topleft[0], ppm * topleft[1])
		} else {
			// position[2,3] give w, h in metres			
			p5.yup_image(img, ppm * topleft[0], ppm * topleft[1], ppm * w, ppm * h)
		}
    },
	
    distanceTo(pt, p5, state) { 
		// a hit-test on opaque parts of the image
        let pixel = [pt[0]-this.topleft[0], this.topleft[1]-pt[1]],
		    img = p5.imgCache[this.image]
        if (this.position[2]) {
			pixel[0] = pixel[0]/this.position[2]*img.width
			pixel[1] = pixel[1]/this.position[3]*img.height
		} else {
			pixel = v2.scale(state.ppm, pixel)
		}
		if (pixel[0]<0 || pixel[0]>=img.width || pixel[1]<0 || pixel[1]>=img.height) {
			return
		}
		let rgba = img.get(pixel[0], pixel[1])
		return rgba[3]!=0 ? 0 : false 
    }
}

// optical objects

plugins.ray.style = { // ray style is default for light.
	z_order: 0,
    strokeWeight: 1,
    stroke: [255, 255, 255],
	fill: false,
    arrows: '50%',
    arrowLength: 6,
    arrowWidth: 3
}

/*
The Arrows style.
style.arrows is either an array of arrow styles, or an arrow style.
an arrow style is either a string (a percentage or ''), a number (offset from start or end)
or an object, or an array of them

Any semi-infinite rays ignore percentage arrow positions
 */

plugins.ray.draw = function (p5, vbox, ppm) {

    let style = Object.assign({}, plugins.ray.style, this.style, this['from'].style)
	p5.style(style)

	p5.beginShape()

	for (let i = 0; i < this.path.length; i++) {
		p5.vertex(...v2.scale(ppm, this.path[i]))
	}

	if (this.direction) { 
		// we have a half-infinite ray to deal with
		let start = this.path[this.path.length - 1],
			dir = this.direction,
			clip = []
		if (start[0]>vbox[0]/ppm) {
			clip.push((vbox[0] / ppm - start[0]) / dir[0])
		}
		if (start[0]<vbox[1]/ppm) {
			clip.push((vbox[1] / ppm - start[0]) / dir[0])
		}
		if (start[1]>vbox[2]/ppm) {
			clip.push((vbox[2] / ppm - start[1]) / dir[1])
		}
		if (start[1]<vbox[3]/ppm) {
			clip.push((vbox[3] / ppm - start[1]) / dir[1])
		}
		clip = clip.filter(x => x > 0)
		clip = Math.min(...clip)
		// break shape if change of colour
		
		p5.vertex(...v2.scale(ppm, v2.add(start, v2.scale(clip, dir))))
	}

	p5.endShape()

	// draw arrows.
	p5.strokeDash([])
	p5.strokeCap(p5.SQUARE)
	
	let arrows = style.arrows

	if (!arrows) { return }
	if (!Array.isArray(arrows)) { arrows = [arrows] }
	if (arrows.length == 0) { return }

	let arrowWidth = style.arrowWidth + (style.strokeWeight - 1) * 0.5,
		arrowLength = style.arrowLength * arrowWidth / style.arrowWidth
	

	function drawPercent(start, direction, pos) {
		// draws an arrow at a certain percentage of the ray length;
		// for finite rays only
		let pt = v2.add(start, v2.scale(parseFloat(pos) / 100, direction))
			direction = v2.normalize(direction)
			p5.arrow(...v2.scale(ppm, pt), ...direction, arrowLength, arrowWidth)
	}

	function drawOffset(start, direction, pos, length) {
		// draws an arrow offset by a particular distance from
		// the start or end of the ray
		let pt
		length = length || v2.norm(direction)
		direction = v2.normalize(direction)
		if (pos > 0) {
			pt = v2.add(start, v2.scale(pos, direction))
		} else if (isFinite(length)) {
			pt = v2.add(start, v2.scale(length + pos, direction))
		} else {
			return // no arrow possible
		}
		p5.arrow(...v2.scale(ppm, pt), ...direction, arrowLength, arrowWidth)
		return true
	}

	function drawIntersection(start, direction, line, length) {
		// draws the arrow where the ray intersects the line
		length = length || v2.norm(direction)
		direction = v2.normalize(direction)
		let isect = v2.line_line(start, direction, line.pt, line.dir)
		if (isect.c[0] > 0 && isect.c[0] < length) {
			direction = v2.normalize(direction)
			p5.arrow(...v2.scale(ppm, isect.pt), ...direction, arrowLength, arrowWidth)
			return true
		}
	}

	// draw for each ray except the last
	for (let i = 1; i < this.path.length; i++) {
		let arrowstyle = arrows[Math.min(i - 1, arrows.length - 1)]
		
		arrowstyle = [].concat(arrowstyle)
		let ray_dir = v2.sub(this.path[i], this.path[i - 1])
		for (let j = 0; j < arrowstyle.length; j++) {
			let finished = false
			switch (typeof arrowstyle[j]) {
				case 'string':
					if (arrowstyle[j] !== '') {
						drawPercent(this.path[i - 1], ray_dir, arrowstyle[j])
						finished = true
					}
					break
				case 'number':
					finished = drawOffset(this.path[i - 1], ray_dir, arrowstyle[j])
					break
				case 'object':
					finished = drawIntersection(this.path[i - 1], ray_dir, arrowstyle[j])
					break
			}
			if (finished) { break }
		}
	}

	// and on the last infinite ray
	if (this.direction) {
		let ray_dir = this.direction,
			pt = this.path[this.path.length - 1],
			arrowstyle = arrows[Math.min(this.path.length - 1, arrows.length - 1)]
		arrowstyle = [].concat(arrowstyle)
		for (let j = 0; j < arrowstyle.length; j++) {
			let finished = false
			switch (typeof arrowstyle[j]) {
				case 'number':
					finished = drawOffset(pt, ray_dir, arrowstyle[j], Infinity)
					break
				case 'object':
					finished = drawIntersection(pt, ray_dir, arrowstyle[j], Infinity)
					break
			}
			if (finished) { break }
		}
	}
}

plugins.thinlens.style = {
    strokeWeight: 2,
    stroke: [255, 255, 255],
	fill: false,
    arrowLength: 6,
    arrowWidth: 3
}

plugins.thinlens.draw = function (p5, box, ppm) {
    let style = Object.assign({}, plugins.thinlens.style, this.style),
        ends = this.ends()

	// draw the double-headed arrow symbol
	p5.style(style)
	p5.line(...v2.scale(ppm, ends[0]), ...v2.scale(ppm, ends[1]))
	let arrowLength = Math.sign(this.power) * style.arrowLength
	if (this.power !== 0) {
		p5.arrow(...v2.scale(ppm, ends[0]), ...v2.rot90(this.axis), arrowLength, style.arrowWidth)
		p5.arrow(...v2.scale(ppm, ends[1]), ...v2.rot270(this.axis), arrowLength, style.arrowWidth)
	}
}

plugins.surface.draw = plugins.thinlens.draw // temporary

plugins.barrier.style = {
    strokeWeight: 2,
    stroke: [190, 190, 190],
	fill: false
}

plugins.barrier.draw = function (p5, box, ppm) {

    let style = Object.assign({}, plugins.barrier.style, this.style),
		ends = this.ends()
	p5.style(style)
	p5.line(...v2.scale(ppm, ends[0]), ...v2.scale(ppm, ends[1]))

    // draw blur lines if this is set.
}

plugins.arc.style = Object.assign({}, plugins.barrier.style)

plugins.arc.draw = function(p5, box, ppm) {
	
    let style = Object.assign({}, plugins.arc.style, this.style),
		center = v2.scale(ppm, this.position),
	    midangle = v2.angle(this.axis)
	p5.style(style)
	p5.arc(...center, ppm*this.r[0]*2, ppm*this.r[1]*2, 
		midangle-p5.radians(this.width/2), midangle+p5.radians(this.width/2), style.ellipseMode)
}


// p5 controls
/*
	properties are:
	controlType: slider, checkbox, etc.
	position: the position in the viewbox (y-up) but not in world space
	width: used if a slider
	checked: used if a checkbox: 
	params: the parameters to pass to the initialization routine for the control
	bind: object or array of objects giving what item of state the object is bound to
*/

plugins.control = {
	
	init(state) { 
		this.state = state 
	},
	
	get(obj, path) {
		path.forEach(x=>obj=obj[x])
		return obj
	},
	
	set(obj, path, value) {
		path.slice(0,-1).forEach(x=>obj=obj[x])
		obj[path[path.length-1]]=value
	},
	
	value(x) {
		// get/set value of bound object
		let obj = findObject(this.state, this.bind.id)
		// if prop includes position, should move rather than assign
		if (arguments.length==0) {
			return this.get(obj, this.bind.property)
		} else {
			this.set(obj, this.bind.property, x)
		}
	},
	
	draw(p5, box, ppm) {
		let self = this,
			w = box[1]-box[0],
			h = box[3]-box[2],
			ratio = ppm/this.state.ppm,
			position = [...v2.scale(ratio, this.position)]
		switch (this.controlType) {
			
			case 'slider':
				this.control = this.control || p5.createSlider(...this.params) 
				this.width && this.control.style('width', this.width*ratio+'px')
				// work out position: -w is same as right, -h is same as bottom
				if (position[0]<0) position[0] += w-this.width*ratio
				if (position[1]<0) position[1] += h-this.control.elt.offsetHeight
				this.control.position(...position) // normal units
				this.control.elt.oninput = function() { 
					self.value(self.control.value())
					p5.redraw()
				}
				this.control.value(this.value()) // initial value
				switch (this.direction) {
					case 'up':
						this.control.style('transform-origin', 'left center')
						this.control.style('transform', 'rotate(-90deg)')
						break
					case 'down':
						this.control.style('transform-origin', 'left center')
						this.control.style('transform', 'rotate(90deg)')
						break
				}
				break
				
			case 'checkbox':
				if (!this.control) {
					this.control = p5.createCheckbox(...this.params) // label, checked
					this.bound = [].concat(this.bind)
				}
				// work out position: -w is same as right, -h is same as bottom
				this.control.position(0,0)
				for (let k in this.style||{}) {
					this.control.style(k,this.style[k])
				}
				if (position[0]<0) position[0] += w-this.control.elt.offsetWidth
				if (position[1]<0) position[1] += h-this.control.elt.offsetHeight
				this.control.position(...position) // normal units
				this.control.elt.onchange = function() {
					let value = self.control.checked()?'yes':'no'
					self.bound.forEach(function(b) {
						self.bind = b
						self.value(self.bind[value])
					})
					p5.redraw()
				}
				this.control.elt.onchange() // initial value

				break
				
			case 'span':
				this.control = this.control || p5.createSpan(this.params)
				this.control.html(this.text)
				for (let k in this.style||{}) {
					this.control.style(k,this.style[k])
				}				
				this.control.position(0,0) // normal units
				// work out position: -w is same as right, -h is same as bottom
				if (position[0]<0) position[0] += w - this.control.elt.offsetWidth
				if (position[1]<0) position[1] += h - this.control.elt.offsetHeight
				this.control.position(...position) // normal units

				break
		}
	}
}

plugins.dimension = {
	
	init(state) {
		this.state = state
		if (typeof this.start=='string') {
			this.startpt = [...findObject(state, this.start).center()]
		} else if (this.start) {
			this.startpt = [...this.start]
		}
		if (typeof this.end=='string') {
			this.endpt = [...findObject(state, this.end).center()]
		} else if (this.end) {
			this.endpt = [...this.end]
		}
	},
	
	style: { // need to break it up into text style & line style
		textAlign: ['center', 'top'],
		arrowLength: 6,
		arrowWidth: 3,
		arrows: ['100%'],
		labelat: '50%',
		dp: 3,
		offset: [[0,0],[0,0]],
		textOffset: [0,-10]
	},
	
	draw(p5, vbox, ppm) {
		this.init(this.state)
		if (this.xcoord) {
			this.startpt[0] = this.endpt[0] = this.xcoord
		}
		if (this.ycoord) {
			this.startpt[1] = this.endpt[1] = this.ycoord
		}
		let style = Object.assign({}, plugins.dimension.style, this.style),
			vec = v2.sub(this.endpt, this.startpt)
		style.stroke && p5.stroke(style.stroke)
		style.strokeWeight && p5.strokeWeight(style.strokeWeight)
		style.strokeDash && p5.strokeDash(style.strokeDash)
		
		let ends = [v2.add(v2.scale(ppm, this.startpt),style.offset[0]),
					v2.add(v2.scale(ppm, this.endpt),style.offset[1])]
		if (this.xsign && this.xsign!==Math.sign(ends[1][0]-ends[0][0])) { return }
		if (this.ysign && this.ysign!==Math.sign(ends[1][1]-ends[0][1])) { return }
		
		p5.line(...ends[0], ...ends[1])
		
		style.arrows = [].concat(style.arrows)
		let dir = v2.normalize(vec)
		if (style.arrows.indexOf('100%')>=0) {
			p5.arrow(...ends[1], ...dir, style.arrowLength, style.arrowWidth)
		}
		if (style.arrows.indexOf('0%')>=0) {
			p5.arrow(...ends[0], ...v2.scale(-1,dir), style.arrowLength, style.arrowWidth)
		}
		
		let len = v2.norm(vec)
		if (typeof style.labelat == 'string') { // says *where* the label goes
			style.labelat = parseFloat(style.labelat)/100
		} else {
			style.labelat /= len
		}
		if (!style.absolute) {
			// work out sign of the length
			if (Math.abs(vec[0])>Math.abs(vec[1])) {
				len = Math.sign(vec[0])*len
			} else {
				len = Math.sign(vec[1])*len
			}
		}
		
		let pos = v2.add(this.startpt, v2.scale(style.labelat, vec))
		
		p5.noStroke()
		style.stroke && p5.fill(style.stroke)
		style.fill && p5.fill(style.fill)
		style.textSize && p5.textSize(style.textSize)
		p5.textAlign(...style.textAlign)
		p5.yup_text(this.label || len.toFixed(style.dp)+'m', 
			...v2.add([ppm*pos[0], ppm*pos[1]], style.textOffset)
		)
	}
}

plugins.text = {
	style: {
		stroke: false,
		textAlign: ['center', 'top'],
		fill: [255,255,255],
		textSize: 12
	},
	
	offset: [0,0],
	
	init(state) {
		if (this.attach) {
			this.position = [...findObject(state,this.attach).center()]
		}
	},
	
	draw(p5, vbox, ppm) {
		let style = Object.assign({}, plugins.text.style, this.style)
		p5.style(style)
		p5.yup_text(this.text, ...v2.scale(ppm, v2.add(this.position, this.offset)))
	}
}


plugins.copy = {
	
	init(state) {
		this.copy = [].concat(this.copy)
		this.copy.forEach( function(x) {
			x.sourceObject = findObject(state, x.source)
			x.destObject = findObject(state, x.dest)
		})
	},
	
	kind(a) {
		return Array.isArray(a)?'array':typeof a
	},
	
	equal(a,b) {
		//equality test
		if (a===b) { return true }
		if (this.kind(a) !== this.kind(b)) { return false }
		switch (this.kind(a)) {
			case 'array':
				if (a.length!=b.length) { return false }
				for (let i=0; i<a.length; i++) {
					if (!this.equal(a[i], b[i])) { return false }
				}
				return true
			case 'object':
				if (Array.isArray(a)!=Array.isArray(b)) { return false }
				if (!this.equal(Object.keys(a), Object.keys(b))) { return false }
				for (let k in a) {
					if (!this.equal(a[k],b[k])) { return false }
				}
				return true
			default:
				return a==b
		}
	},
	
	draw(p5, vbox, ppm) {
		let draw = false,
			self = this
		this.copy.forEach(function(x) {
			let s = plugins.control.get(x.sourceObject, x.sourceProperty),
				d = plugins.control.get(x.destObject, x.destProperty)
			if (!self.equal(s,d)) {
				console.log('redraw')
				plugins.control.set(x.destObject, x.destProperty, s)
				draw = true
			}
		})
		draw && setTimeout(()=>p5.redraw())
	}
}

// Top-level drawing routines in p5

function makeP5App(state, actions) {
    // state is the state object describing the optical setup (no functions).
    // actions functions take a state as their first parameter, and this is curried out

    let {w, h, ppm} = state,
		origin = [...state.origin] // keep the original state size

	actions = actions || {}
	
    return render
	
	function render(p5) {

        // pass to new p5() to create a drawing
        // call as render(window) to make it global.

        // wrap actions
        for (let k in actions) {
			let oldaction = actions[k]
			actions[k] = function(...args) {
				let r = oldaction(state, ...args)
				p5.redraw()
				return r
			}
		}

        let cv,      // p5 canvas
			onResize // returned by customsetup

        p5.imgCache = {}
        // the instance image cache

        p5.preload = function () {
            // loads all images first
            for (obj of state.items) if (obj.type == 'image') {
				p5.imgCache[obj.image] = p5.loadImage(obj.image)
			}
        }

        function size(cv) {
            // size scales the canvas according to the width of the containing div
            let domwidth = parseInt(window.getComputedStyle(cv.parent()).width),
				ratio = domwidth / state.w
			if (state.minWidth>domwidth) {
				ratio = state.minWidth /state.w
			}
			if (state.maxWidth<domwidth) {
				ratio = state.maxWidth /state.w
			}
			w = ratio * state.w
			h = ratio * state.h
			ppm = ratio * state.ppm
			origin.length > 0 && (origin = v2.scale(ratio, state.origin))
        }

        p5.setup = function () {
			cv = p5.createCanvas(state.w, state.h, state.renderer || p5.P2D)
			// patch canvas.parent for svg renderer
			if (state.renderer == 'svg') {
				cv.parent = function() {
					return cv.elt.svg.parentNode 
					// this ends up not resizing at all when called within size(), 
					// which is a good thing for SVG renders
				}
			}
			size(cv)
			p5.resizeCanvas(w, h)
            p5.noLoop()
        }

        p5.windowResized = function () {
            size(cv)
            p5.resizeCanvas(w, h)
        }

        p5.draw = function () {
            p5.background(state.background)
			origin.length == 0 ? p5.setOrigin('centre') : p5.setOrigin(...origin)

			let viewbox = [...p5.yup_xlimits(), ...p5.yup_ylimits()],
				worldbox = [viewbox[0] / ppm, viewbox[1] / ppm, viewbox[2] / ppm, viewbox[3] / ppm],
                rays = simulate(state, worldbox)
				items = state.items.slice(),

            items.sort((a, b) => -((a.style && a.style.z_order || 0) - (b.style && b.style.z_order || 0)))

			for (let obj of items) if ((obj.style && obj.style.z_order || 0) >= 0) {
				if (obj.draw && (obj.style && obj.style.visible)!=false) {
					p5.push()
					obj.draw(p5, viewbox, ppm)
					p5.pop()
				}
			}

			for (let R of rays) { // z_order = 0
				let light = R['from']
				if ((light.style && light.style.visible)!=false) {
					p5.push()
					R.draw(p5, viewbox, ppm)
					p5.pop()
				}
			}

			for (let obj of items) if ((obj.style && obj.style.z_order || 0) < 0) {
				if (obj.draw && (obj.style && obj.style.visible)!=false) {
					p5.push()
					obj.draw(p5, viewbox, ppm)
					p5.pop()
				}
			}
			
			for (let obj of items) if (obj.decorate && (obj.style && obj.style.visible)!=false) {
				p5.push()
				obj.decorate(p5, ppm, state.decorate)
				p5.pop()
			}	
        }

        // dragging

        function findhit(items, mx, my, pxtol) {
            // returns the closest hit object, if close enough
            // if outside canvas, mx & my are NaN & hit is always false
            let hits = []

            for (let obj of items) {
				if (!obj.ui ||
					(obj.ui.selectable!=false 
					&& !(obj.ui.xlock == true && obj.ui.ylock == true)
					&& (obj.style && obj.style.visible)!=false) ) {
					let d = obj.distanceTo && obj.distanceTo([mx, my], p5, state)
					if (typeof d == 'number' && !isNaN(d)) {
						hits.push({d,obj})
					}
                }
            }

            hits = hits.sort((a, b) => a.d - b.d)[0]
			return hits && hits.d < pxtol && hits.obj
			
        }

        p5.mousePressed = function (e) {
            let[mx, my] = [p5.yup_mouseX() / ppm, p5.yup_mouseY() / ppm]
            if (isNaN(mx * my)) { return }
			state.dragtarget = findhit(state.items, mx, my, 20 / ppm)
			if (state.dragtarget) {
				state.oldpt = [mx, my]
				//p5.redraw() // in case we draw a selection box or something
			}
        }

        p5.touchStarted = function (e) {
            p5.mousePressed(e)
        }

        p5.mouseReleased = function () {
            // nothing
        }

        p5.touchEnded = function () {
            // nothing
        }

        p5.mouseDragged = function (e) {
            let[mx, my] = [p5.yup_mouseX() / ppm, p5.yup_mouseY() / ppm]
            if (isNaN(mx * my)) { return true }
			if (state.dragtarget) {
				state.dragtarget.move(mx - state.oldpt[0], my - state.oldpt[1])
				state.oldpt = [mx, my]
				p5.redraw()
				return false // drag target not page
			}
        }

        p5.mouseReleased = function () {
            state.dragtarget = false
            let[mx, my] = [p5.yup_mouseX() / ppm, p5.yup_mouseY() / ppm]
            if (isNaN(mx * my)) { return } // outside the canvas
            p5.redraw() // in case we draw a selection box or something
        }

    }
}
