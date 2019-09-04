function curved(props) {
	// app state
	let state = Object.assign({
		w: 600,
		h: 250, // max canvas size
		controlw: 100,
		n_in: 1,
		n_out: 3, // initial refractive indices
		nplates: 5,
		cx: 0,
		normals: [], // spline normals
		// UI flags, data
		dense: [50,60,100],    // the colour for n=2
		bg:    [180,180,180],  // the colour for n=1
		sliders: []
	}, props)

	var success = false

	function mix(m, v1, v2) {
		// colour mixer
		return [m*v1[0]+(1-m)*v2[0], m*v1[1]+(1-m)*v2[1], m*v1[2]+(1-m)*v2[2] ]
	}

	return function(p5) {

		function size(cv) {
			// size scales the canvas according to the WIDTH of the containing div
			let domwidth = parseInt(window.getComputedStyle(cv.parent()).width),
			    ratio = domwidth/state.w
			if (state.minWidth) {
				ratio = domwidth/state.minWidth
			}
			state.w = ratio*state.w
			state.h = ratio*state.h
		}
		
		let cv
		
		p5.setup = function() {
			cv = p5.createCanvas(state.w,state.h)
			size(cv)
			p5.resizeCanvas(state.w-state.controlw, state.h)
			p5.background(128)
			
			// points
			p5.setOrigin(state.w/3,state.h/2)
			
			// slope controls
			let alim = 0.85*Math.PI/2
			for (let i=0; i<state.nplates; i++) {
				let s = state.sliders[i] = p5.createSlider(-alim, alim, 0, 0)
				s.position(state.w-state.controlw+5, state.h - (state.h/state.nplates)*(i+0.5)-15)
				s.style('width', state.controlw-5+'px')
				s.elt.oninput = ()=>p5.redraw()
			}
			p5.noLoop()
		}

		p5.windowResized = function() {
			size(cv)
			p5.resizeCanvas(state.w-state.controlw, state.h)
			for (let i=0; i<state.sliders.length; i++) {
				state.sliders[i].position(state.w-state.controlw+5, state.h - (state.h/state.nplates)*(i+0.5)-15)
			}
			// need to rescale the curved surface positions
			
			p5.redraw()
		}

		function fresnelsegment(ylims, normal) {
			// works out the beginning & end of the fresnel plate from
			// the y limits & the normal
			
			let cx = 0, 
				cy = (ylims[0]+ylims[1])/2,
				dvec = v2.rot90(normal),
				limits = [(ylims[0]-cy)/dvec[1], (ylims[1]-cy)/dvec[1]]
			return [ v2.add([cx,cy], v2.scale(limits[0], dvec)), v2.add([cx,cy], v2.scale(limits[1], dvec)) ]
		}

		let tanlen = 18

		p5.draw = function() {
			// transform to y-up coordinates 
			p5.setOrigin(state.w/3,state.h/2)
			let ylim = p5.yup_ylimits(),
				xlim = p5.yup_xlimits()
			
			// work out the points for the curve.
			for (let i=0; i<state.nplates; i++) {
				state.normals[i] = v2.polar(1,-state.sliders[i].value())
			}
			let ybound = [] // the boundary points between the fresnel segments
			for (let i=0; i<=state.nplates; i++) {
				ybound[i] = i*(ylim[1]-ylim[0])/state.nplates+ylim[0]
			}
			let segments = [] // the fresnel segments
			for (let i=0; i<state.nplates; i++) {
				segments[i] = fresnelsegment(ybound.slice(i,i+2), state.normals[i])
			}
			// now shift the segments so that they are continuous
			for (let i=1; i<state.nplates; i++) {
				let dx = segments[i-1][1][0] - segments[i][0][0]
				segments[i][0] = v2.add(segments[i][0],[dx,0])
				segments[i][1] = v2.add(segments[i][1],[dx,0])
			}
			// finally, move all segments so the middle segment is at (0,0)
			// NB requires odd number of segments
			let mid = Math.floor(state.nplates/2),
				dx = (segments[mid][0][0]+segments[mid][1][0])/2
			for (let i=0; i<state.nplates; i++) {
				segments[i][0] = v2.sub(segments[i][0],[dx,0])
				segments[i][1] = v2.sub(segments[i][1],[dx,0])
			}
			
			// work out anchor points for Bezier spline - midpoints of each segment
			let points = []
			for (let i=0; i<state.nplates; i++) {
				points[i] = v2.scale(0.5, v2.add(segments[i][0], segments[i][1]))
			}

			// left medium
			p5.background(180,180,180)

			p5.fill(76,84,116)
			p5.noStroke()
			p5.beginShape()
			let startpt = v2.add(points[0],v2.scale(100,v2.rot270(state.normals[0])))
			p5.vertex(...startpt)
			p5.vertex(...points[0]) // first bezier point
			let prevTangent = v2.scale(tanlen,v2.rot90(state.normals[0]))
			for (let i=1; i<points.length; i++) {
				// the control points are tangent to the curve at each point
				let chordlen = v2.norm(v2.sub(points[i],points[i-1])),
					tangent = v2.scale(tanlen,v2.rot270(state.normals[i]))
				p5.bezierVertex(...v2.add(points[i-1],prevTangent),...v2.add(points[i],tangent),...points[i])
				prevTangent = v2.rot180(tangent)
			}
			let endpt = v2.add(points[points.length-1],v2.scale(100,v2.rot90(state.normals[points.length-1])))
			p5.vertex(...endpt)
			p5.vertex(Math.max(endpt[0], 500), endpt[1])
			p5.vertex(Math.max(startpt[0], 500), startpt[1])
			p5.endShape(p5.CLOSE)

			// draw the target focus
			p5.fill(220,220,0)
			p5.circle(170,0,10)
			
			// draw the surface normals??
			p5.stroke(0,0,0)
			p5.strokeWeight(1)
			p5.strokeDash([2, 4])
			for (let i=0; i<points.length; i++) {
				p5.line(...v2.add(points[i], v2.scale(30, state.normals[i])), 
					...v2.add(points[i], v2.scale(-30, state.normals[i])))
			}
			
			// draw the rays
			p5.stroke(255)
			p5.strokeWeight(2)
			p5.strokeDash()
			let hitcount = 0
			for (let i=0; i<state.nplates; i++) {
				let [cx,cy] = points[i]
				// work out refraction
				let {v_out} = do_refract(Object.assign({},state,{v_in:[1,0], normal:state.normals[i]}))
				// check if refracted ray close to focus
				let near = v2.ray_point([cx,cy],v_out,[170,0]),
					dist = v2.norm2(v2.sub([170,0], near))
				if (Math.abs(dist)<25) { 
					p5.stroke(220,220,0)
					hitcount++
				} else {
					p5.stroke(255)
				}
				success = hitcount==state.nplates
				// draw incoming ray
				p5.line(xlim[0], cy, cx, cy)
				p5.arrow( xlim[0]+60, cy, 1, 0)
				// draw refracted ray
				let len = (xlim[1]-cx)/v_out[0]
				p5.line(cx, cy, ...v2.add([cx,cy], v2.scale(len, v_out)))
				p5.arrow( ...v2.add([cx,cy], v2.scale(90, v_out)), ...v_out)
			}
				
		}

		function inframe() {
			return p5.mouseX>=0 && p5.mouseX<state.w &&
				p5.mouseY>=0 && p5.mouseY<state.h
		}
		
		p5.mouseDragged = function() { inframe() && p5.redraw() }
		p5.mouseClicked = function() { inframe() && p5.redraw() }
		p5.touchStarted = function() { inframe() && p5.redraw() }
		p5.touchEnded = function() { inframe() && p5.redraw() }
	}
}