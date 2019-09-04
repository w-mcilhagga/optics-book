

function fresnel(props) {
	// app state
	let state = Object.assign({
		w: 600,
		h: 300, // max canvas size
		controlw: 100,
		n_in: 1,
		n_out: 3, // initial refractive indices
		nplates: 5,
		normals: [], // Fresnel plate normals
		// UI flags, data
		dense: [50,60,100],    // the colour for n=2
		bg:    [180,180,180],  // the colour for n=1
		sliders: []
	}, props)

	var success = false

	for (let i=0; i<state.nplates; i++) {
		state.normals[i] = v2.polar(1,-(i+1-3)/5)
	}

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
			cv = p5.createCanvas(state.w-state.controlw, state.h)
			size(cv)
			p5.resizeCanvas(state.w-state.controlw, state.h)
			p5.background(0)
			
			// fresnel segment controls
			let alim = 0.75*Math.PI/2
			for (let i=0; i<state.nplates; i++) {
				let a = alim*Math.random()-alim/2,
					s = state.sliders[i] = p5.createSlider(-alim, alim, 0, 0)
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
			// need to rescale the surface positions; as they are defined by
			// an angular tilt, the rays will shift on or off the target as the 
			// canvas is resized.
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

		p5.draw = function() {
			// transform to y-up coordinates 
			p5.setOrigin(state.w/3,state.h/2)
			let xlim = p5.yup_xlimits(),
				ylim = p5.yup_ylimits()
			
			for (let i=0; i<state.nplates; i++) {
				state.normals[i] = v2.polar(1,-state.sliders[i].value())
			}
			
			// background for left medium
			p5.background(180, 180, 180)
			
			// work out Fresnel plate boundaries on y-axis
			let ybound = []
			for (let i=0; i<=state.nplates; i++) {
				ybound[i] = i*(ylim[1]-ylim[0])/state.nplates+ylim[0]
			}
			let segments = []
			for (let i=0; i<state.nplates; i++) {
				segments[i] = fresnelsegment(ybound.slice(i,i+2), state.normals[i])
			}
			
			// right medium with fresnel plates, assumes angle not too extreme
			p5.fill(76,84,116)
			p5.noStroke()
			p5.beginShape()
			for (let i=0; i<segments.length; i++) {
				p5.vertex(...segments[i][0])
				p5.vertex(...segments[i][1])
			}
			p5.vertex(xlim[1], ylim[1])
			p5.vertex(xlim[1], ylim[0])
			p5.endShape(p5.CLOSE)
			
			// draw the target focus
			p5.fill(220,220,0)
			p5.circle(170,0,10)
			
			// draw the incoming rays
			p5.stroke(255)
			p5.strokeWeight(2)
			p5.strokeDash()
			let hitcount = 0
			for (let i=0; i<segments.length; i++) {
				let seg = segments[i],
					cx = (seg[0][0]+seg[1][0])/2,
					cy = (seg[0][1]+seg[1][1])/2
				// work out refraction
				let {v_out} = do_refract(Object.assign({},state,{v_in:[1,0],normal:state.normals[i]}))
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
				p5.arrow(xlim[0]+60, cy, 1, 0)
				// draw refracted ray
				let len = (xlim[1]-cx)/v_out[0]
				p5.line(cx, cy, ...v2.add([cx,cy], v2.scale(len, v_out)))
				p5.arrow( ...v2.add([cx,cy], v2.scale(90, v_out)), ...v_out)
				// draw ray bundles as needed
				if ([].includes(i)) {
					for (j=-2; j<=2; j++) if (j!==0) {
						let start = [xlim[0], cy+j*(segments[i][1][1]-segments[i][0][1])/6],
							dir = [1,0],
							pt = v2.ray_segment(start, dir, segments[i][0], segments[i][1])
						p5.stroke(255,255,255,128)
						p5.line(...start, ...pt)
						p5.line(...pt, ...v2.add(pt, v2.scale(500,v_out)))
					}
				}
			}
			
			return
			
			
			// the surface normal
			if (state.annotate.includes('all') || state.annotate.includes('normal')) {
				stroke(0,0,0)
				strokeWeight(1)
				strokeDash([5, 15])
				line(...v2.scale(180,state.normal), ...v2.scale(-180, state.normal))
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