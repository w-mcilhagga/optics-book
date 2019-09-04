/*
draw routines.
*/

// objects that have draw & init functions, but not emit or intersect, are used to calculate 
// what's going on with the scene or insert p5 drawing calculations into the stream

plugins.image = {
	moveself: plugins.base.moveself,
	move: plugins.base.move,
	
	init(state) {
	},
	
    draw(p5, vbox, ppm) {
        p5.imgCache[this.image] = p5.imgCache[this.image] || p5.loadImage(this.image, redraw)
		if (this.position.length==2) {
			// take image w, h, position is ?? left-top ??
			p5.yup_image(p5.imgCache[this.image], ppm * this.position[0], ppm * this.position[1])
		} else {
			// position[2,3] give w, h in metres
			p5.yup_image(p5.imgCache[this.image], ppm * this.position[0], ppm * this.position[1], 
						ppm * this.position[2], ppm * this.position[3])
		}
    },
	
    distanceTo(pt, p5, state) { 
		// a hit-test on opaque parts of the image
        let pixel = [pt[0]-this.position[0], this.position[1]-pt[1]],
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
    },
	
	decorate(p5, ppm) {
		// this is used when style.decorate has been set
		let decoration = this.style && this.style.decoration
		if (!decoration) { return }
		let img = p5.imgCache[this.image]
		switch (decoration) {
			case 'ui': // show user-interface
				if (!this.ui) { return }
				if (this.ui.xlock !== false || this.ui.ylock !== false) {
					// it can be moved
					p5.fill(255, 0, 0, 128)
					p5.stroke(255, 0, 0)
					p5.strokeWeight(2)
					let centre = [ppm*this.position[0], ppm*this.position[1]]
					if (this.position[2]) {
						centre[0] += ppm*this.position[2]/2
						centre[1] -= ppm*this.position[3]/2
					} else {
						centre[0] += img.width/2
						centre[1] -= img.height/2
					}
					p5.circle(...centre, 20)
				}
				break
		}
	}
}

// optical objects

plugins.ray.style = { // ray style is default for light.
    strokeWeight: 1,
    stroke: [255, 255, 255],
    arrows: '50%',
    arrowlen: 6,
    arrowwidth: 3
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
	p5.strokeWeight(style.strokeWeight)
	p5.stroke(...style.stroke)

	p5.noFill()
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
		p5.vertex(...v2.scale(ppm, v2.add(start, v2.scale(clip, dir))))
	}

	p5.endShape()

	// draw arrows.
	let arrows = style.arrows

	if (!arrows) { return }
	if (!Array.isArray(arrows)) { arrows = [arrows] }
	if (arrows.length == 0) { return }

	let arrowwidth = style.arrowwidth + (style.strokeWeight - 1) * 0.5,
		arrowlen = style.arrowlen * arrowwidth / style.arrowwidth
	
	p5.strokeCap(p5.SQUARE)

	function drawPercent(start, direction, pos) {
		// draws an arrow at a certain percentage of the ray length;
		// for finite rays only
		let pt = v2.add(start, v2.scale(parseFloat(pos) / 100, direction))
			direction = v2.normalize(direction)
			p5.arrow(...v2.scale(ppm, pt), ...direction, arrowlen, arrowwidth)
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
		p5.arrow(...v2.scale(ppm, pt), ...direction, arrowlen, arrowwidth)
		return true
	}

	function drawIntersection(start, direction, line, length) {
		// draws the arrow where the ray intersects the line
		let isect = v2.line_line(start, direction, line.pt, line.dir)
		length = length || v2.norm(direction)
		if (isect.c[0] > 0 && isect.c[0] < length) {
			direction = v2.normalize(direction)
			p5.arrow(...v2.scale(ppm, isect.pt), ...direction, arrowlen, arrowwidth)
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
	
	p5.strokeCap(p5.ROUND)

}

plugins.thinlens.style = {
    strokeWeight: 2,
    stroke: [255, 255, 255],
    arrowlen: 6,
    arrowwidth: 3
}

plugins.thinlens.draw = function (p5, box, ppm) {
    let style = Object.assign({}, plugins.thinlens.style, this.style),
        ends = this.ends()

	// draw the double-headed arrow symbol
	p5.strokeWeight(style.strokeWeight)
	p5.stroke(...style.stroke)
	p5.line(...v2.scale(ppm, ends[0]), ...v2.scale(ppm, ends[1]))
	let arrowlen = Math.sign(this.power) * style.arrowlen
	if (this.power !== 0) {
		p5.arrow(...v2.scale(ppm, ends[0]), ...v2.rot90(this.axis), arrowlen, style.arrowwidth)
		p5.arrow(...v2.scale(ppm, ends[1]), ...v2.rot270(this.axis), arrowlen, style.arrowwidth)
	}

	// draw virtual rays. For each light source, work out if the rays diverge from
	// anywhere, then create a whole load of rays from that point & draw them (using dotted lines)
    function ok(n, limit) {
        return Math.abs(n) < (limit || 1000000)
    }

    if (this.temp.virtual) {
        for (id in this.temp.virtual) {
            let hits = this.temp.virtual[id],
				points = []
            // work out the points of intersection for all pairs of lines
			for (let i = 0; i < hits.length; i++) {
				for (let j = 0; j < i; j++)
					if (j !== i) {
						let isect = v2.line_line(hits[i].pt, hits[i].direction, 
							hits[j].pt, hits[j].direction)
						if (ok(isect.c[0]) && ok(isect.c[1]) && isect.c[0] < 0 && isect.c[1] < 0) {
							points.push({pt: isect.pt, hits: [i, j]})
						}
					}
			}

			// agglomerate the points if close enough
			let inters = []
			while (points.length > 0) {
				let seed = points.shift()
				for (let i = points.length - 1; i >= 0; i--) {
					if (v2.dist2(seed.pt, points[i].pt) < 1e-5) {
						seed.pt = v2.scale(0.5, v2.add(seed.pt, points[i].pt))
							seed.hits.push(...points[i].hits)
							points.splice(i, 1)
					}
				}
				seed.hits = [...(new Set(seed.hits).values())]
				inters.push(seed)
			}

			inters = inters.filter(x => x.hits.length > 1)
			style = Object.assign({}, plugins.ray.style, hits[0].ray.style,
				hits[0].ray['from'].style)
			// virtual ray styles can be influenced by lens style parameters
			p5.stroke(...(this.style.virtualStroke || style.stroke))
			p5.strokeWeight(this.style.virtualStrokeWeight || style.strokeWeight)
			p5.strokeDash(this.style.virtualStrokeDash || style.strokeDash || [8, 5])
			for (let i = 0; i < inters.length; i++) {
				let v = inters[i]
				for (let j = 0; j < v.hits.length; j++) {
					p5.line(...v2.scale(ppm, hits[v.hits[j]].pt), ...v2.scale(ppm, v.pt))
				}
			}
        }
    }
}

plugins.thinlens.decorate = function (p5, ppm) {
    // this is used when style.decorate has been set
    let decoration = this.style && this.style.decoration
    if (!decoration) { return }
	switch (decoration) {
		case 'ui': // show user-interface
			if (!this.ui) { return }
			if (this.ui.xlock !== false || this.ui.ylock !== false) {
				// it can be moved
				p5.fill(255, 0, 0, 128)
				p5.stroke(255, 0, 0)
				p5.strokeWeight(2)
				p5.circle(ppm * this.position[0], ppm * this.position[1], 20)
			}
			break
	}
}

plugins.surface.draw = plugins.thinlens.draw // temporary

plugins['divergent light'].decorate = function (p5, ppm) {
    // this is used when style.decorate has been set
    let decoration = this.style && this.style.decoration
	if (!decoration) { return }
	switch (decoration) {
		case 'ui':
			// show user-interface
			if (!this.ui)
				return
				if (this.ui.xlock !== false || this.ui.ylock !== false) {
					// it can be moved
					p5.fill(255, 0, 0, 128)
					p5.stroke(255, 0, 0)
					p5.strokeWeight(2)
					p5.circle(ppm * this.position[0], ppm * this.position[1], 20)
				}
			break
	}
}

plugins.barrier.style = {
    strokeWeight: 2,
    stroke: [190, 190, 190]
}

plugins.barrier.draw = function (p5, box, ppm) {

    let style = Object.assign({}, plugins.barrier.style, this.style),
		ends = this.ends()
	p5.strokeWeight(style.strokeWeight)
	p5.stroke(...style.stroke)
	p5.line(...v2.scale(ppm, ends[0]), ...v2.scale(ppm, ends[1]))

    // draw blur lines if this is set.
}

// Top-level drawing routines in p5

function makeP5App(state, customSetup, actions) {
    // state is the state object describing the optical setup (no functions).
    // resizer (optional) is a function which, given the current windowsize & state, works out
    // new state parameters. Assumes we start with original parameters for w, h, ppm
    // call as resizer(state, width, height)

    // actions functions take a state as their first parameter, and this is curried out

    let {w, h, ppm} = state,
		origin = [...state.origin]// keep the original state size

    actions = actions || {}

    return function render(p5) {

        // pass to new p5() to create a drawing
        // call as render(div-id) to make it global.

        let div_id
        if (typeof p5 == 'string') {
            [div_id, p5] = [p5, window]
        }

        // wrap actions
        for (let func in actions) {
			let oldfunc = actions[func]
		    actions[func] = function (...args) {
                let rval = oldfunc(state, ...args)
                    p5.redraw()
                    return rval
            }
        }

        let cv, // p5 canvas
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
            // size scales the canvas according to the WIDTH of the containing div
            let domwidth = parseInt(window.getComputedStyle(cv.parent()).width),
				ratio = domwidth / state.w
			if (state.minWidth) {
				ratio = domwidth / state.minWidth
			}
			w = ratio * state.w
			h = ratio * state.h
			ppm = ratio * state.ppm
			origin.length > 0 && (origin = v2.scale(ratio, state.origin))
        }

        p5.setup = function () {
			cv = p5.createCanvas(state.w, state.h, state.renderer || p5.P2D)
			div_id && cv.parent(div_id)
			size(cv)
			p5.resizeCanvas(w, h)
            onResize = customSetup && customSetup(p5, state, w, h, ppm)
			p5.noLoop()
        }

        p5.windowResized = function () {
            size(cv)
            p5.resizeCanvas(w, h)
            onResize && onResize(p5, state, w, h, ppm)
        }

        p5.draw = function () {
            p5.background(state.background)
			origin.length == 0 ? p5.setOrigin('centre') : p5.setOrigin(...origin)

			let viewbox = [...p5.yup_xlimits(), ...p5.yup_ylimits()],
				worldbox = [viewbox[0] / ppm, viewbox[1] / ppm, viewbox[2] / ppm, viewbox[3] / ppm],
                rays = simulate(state, worldbox)
				items = state.items.slice(),

            items.sort((a, b) => (a.style && a.style.z_order || 0) - (b.style && b.style.z_order || 0))

			for (let obj of items) if ((obj.style && obj.style.z_order || 0) <= 1) {
				p5.push()
				obj.draw && obj.draw(p5, viewbox, ppm)
				obj.decorate && obj.decorate(p5, ppm)
				p5.pop()
			}

			for (let R of rays) {
				p5.push()
				R.draw(p5, viewbox, ppm)
				p5.pop()
			}

			for (let obj of items) if ((obj.style && obj.style.z_order || 0) > 1) {
				p5.push()
				obj.draw && obj.draw(p5, viewbox, ppm) 
				obj.decorate && obj.decorate(p5, ppm)
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
					(obj.ui.selectable!=false && (obj.ui.xlock != false || obj.ui.ylock != false)) ) {
					let d = obj.distanceTo && obj.distanceTo([mx, my], p5, state)
					if (typeof d == 'number') {
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
				p5.redraw() // in case we draw a selection box or something
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
