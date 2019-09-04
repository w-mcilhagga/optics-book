// generates a refraction diagram

function refract(props, actions) {
	
	// default app state
	let state = Object.assign({
		w: 600,
		h: 300, // max canvas size
		v_in: v2.polar(1,0.5), // incident ray direction vector
		normal: [1,0], // normal points towards n_out medium
		n_in: 1,
		n_out: 1.5, // initial refractive indices
		// UI flags, data
		controls: true,
		drawReflect: true, // draw Fresnel reflections
		annotate: 'all', // string consisting of all, or combination of normal arcs angles indices
		drag: 'incident', // what the mouse drags, 'incident' or 'surface'
		dense: [76,84,116],    // the colour for n=2
		bg:    [180,180,180],  // the colour for n=1
		n_in_slider: null, 
		n_out_slider: null, // refractive index controls
		check: null	
	}, props)

	if (state.theta_in!=undefined) {
		// work out the vector inwards
		state.v_in = v2.polar(1, state.theta_in*Math.PI/180)
		delete state.theta_in
	}
	
	if (state.drag!=='incident') state.normal = v2.polar(1,-15*Math.PI/180)

	actions = actions || {}

	function mix(m, v1, v2) {
		// colour mixer
		return [m*v1[0]+(1-m)*v2[0], m*v1[1]+(1-m)*v2[1], m*v1[2]+(1-m)*v2[2] ]
	}
	
	function anglebetween(a,b) {
		//the total angle from a to b anticlockwise
		if (a<b) {
			return b - a
		}
		return b + (Math.PI*2-a)
	}


	
	return function(p5) {
		
		// copy desired functions out to exports
		for (let func in actions) {
			let oldfunc = actions[func]
			actions[func] = function(...args) {
				let rval = oldfunc(state, ...args)
				p5.redraw()
				return rval
			}
		}
		
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
			p5.resizeCanvas(state.w, state.h)
			p5.noLoop()
			p5.background(0)
		}

		p5.windowResized = function() {
			size(cv)
			p5.resizeCanvas(state.w, state.h)
			p5.redraw()
		}
		
		function arcbetween(cx, cy, w, startv, stopv, mode) {
			// draws arc centred on [cx, cy] between the two vectors, drawn anticlockwise
			let start = v2.angle(startv),
				stop = v2.angle(stopv)
			if (anglebetween(start, stop)>Math.PI) {
				[start, stop] = [stop, start]
			}
			let aa = anglebetween(start, stop)
			if (aa>Math.PI || aa<1/57) { return }
			p5.arc(cx, cy, w, w, start, stop, mode)
		}
		
		p5.draw = function() {
			// get refractive indices
			let n_in  = state.controls?state.n_in_slider.value():state.n_in,
				n_out = state.controls?state.n_out_slider.value():state.n_out
			
			Object.assign(state, {n_in, n_out})
			// transform to y-up coordinates 
			p5.setOrigin('center')
			
			// background for left medium
			p5.background(n_in==1?state.bg:state.dense)
			
			// right medium, assumes angle not too extreme
			p5.fill(n_out==1?state.bg:state.dense)
			p5.noStroke()
			let surf = v2.rot90(state.normal),
				rad = Math.sqrt(state.w**2+state.h**2),
				v_1 = v2.scale(rad, surf),
				v_2 = v2.add(v_1, v2.scale(2*rad, state.normal)),
				v_3 = v2.add(v_2, v2.scale(-2*rad, surf)),
				v_4 = v2.sub(v_3, v2.scale(2*rad, state.normal))
			p5.quad(...v_1, ...v_2, ...v_3, ...v_4)
			
			// the surface normal
			if (state.annotate.includes('all') || state.annotate.includes('normal')) {
				p5.stroke(0,0,0)
				p5.strokeWeight(1)
				p5.strokeDash([5, 15])
				p5.line(...v2.scale(180,state.normal), ...v2.scale(-180, state.normal))
			}
			
			// the incident ray
			p5.strokeDash()
			p5.strokeWeight(3)
			p5.stroke(255)
			p5.line(0, 0, ...v2.scale(-500, state.v_in))
			p5.arrow(...v2.scale(-38, state.v_in), ...state.v_in)
			
			if (state.decorate=='ui' && state.drag!=='surface') {
				// put a spot on the incoming ray
				p5.push()
				p5.fill(255,0,0,128)
				p5.stroke(255,0,0)
				p5.strokeWeight(2)
				p5.circle(...v2.scale(-120, state.v_in), 20)
				p5.pop()
			}
			if (state.decorate=='ui' && state.drag=='surface') {
				p5.push()
				p5.fill(255,0,0,128)
				p5.stroke(255,0,0)
				p5.strokeWeight(2)
				let n = v2.rot270(state.normal)
				p5.circle(...v2.scale(-50/n[1], n), 20)
				p5.pop()
			}
			
			// the refracted/reflected rays
			let {theta_out, v_out, R, v_reflect} = do_refract(state)
			if (v_out) {
				p5.stroke(255, 255*(1-R))
				p5.line(0, 0, ...v2.scale(500, v_out))
				p5.arrow(...v2.scale(48, v_out), ...v_out)
			} 
			if (state.drawReflect || !v_out) {
				p5.stroke(255, 255*R)
				p5.line(0, 0, ...v2.scale(500, v_reflect))
				p5.arrow(...v2.scale(48, v_reflect), ...v_reflect)
			}
			
			if (state.annotate=='all' || state.annotate.includes('indices')) {
				// refractive index labels. 
				p5.strokeWeight(0)
				p5.textSize(14)
				p5.fill(255)
				p5.yup_text('n = '+state.n_in.toFixed(2),-state.w/2+10,state.h/2-20)
				p5.textAlign(RIGHT)
				p5.yup_text('n = '+state.n_out.toFixed(2), state.w/2-10,state.h/2-20)
				p5.textAlign(LEFT)
			}
			
			// incident arc + text
			let do_angles = state.annotate.includes('all') || state.annotate.includes('angles'),
				do_arcs = 	state.annotate.includes('all') || state.annotate.includes('arcs')
			if (do_angles || do_arcs) {
				p5.strokeWeight(0)
				p5.textSize(10)
				p5.fill(255)
				let split = v2.normalize(v2.add(state.normal, state.v_in))
				do_angles && Math.abs(theta_in)>1/57 && p5.yup_text( Math.abs(theta_in*180/Math.PI).toFixed(1), 
					...v2.scale(-100, split) )
				p5.fill([255, 0, 0, 50])
				do_arcs && arcbetween(0,0, 150, v2.rot180(state.normal), v2.scale(-1, state.v_in))
				// refracted/reflected arc + text
				p5.fill(255)
				if (v_out) {
					split = v2.normalize(v2.add(state.normal, v_out))
					do_angles && Math.abs(theta_out)>1/57 && p5.yup_text( Math.abs(theta_out*180/Math.PI).toFixed(1), 
						...v2.scale(80, split) )
					p5.fill([0, 255, 0, 50])
					do_arcs && arcbetween(0,0, 150, state.normal, v_out)
				} else {
					split = v2.normalize(v2.add(v2.scale(-1, state.normal), v_reflect))
					do_angles && Math.abs(theta_in)>1/57 && p5.yup_text( Math.abs(theta_in*180/Math.PI).toFixed(1), 
						...v2.scale(100, split) )
					p5.fill([0, 255, 0, 50])
					do_arcs && arcbetween(0,0, 150, v2.rot180(state.normal), v_reflect)
				}
			}
			
		}

		// move the incident ray
		function inframe() {
			return p5.mouseX>=0 && p5.mouseX<state.w &&
				p5.mouseY>=0 && p5.mouseY<state.h
		}
		
		p5.mousePressed = function()  { 
			p5.mouseDragged() 
		}

		p5.touchStarted = function()  { 
			p5.mouseDragged() 
		}

		p5.mouseClicked = function()  { 
			p5.mouseDragged()
		}

		p5.touchMoved = function() {
			p5.mouseDragged()
		}

		p5.mouseDragged = function(evt) {
			if (!inframe()) return
			
			let [tmouseX, tmouseY] = [p5.yup_mouseX(), p5.yup_mouseY()]
			
			if (!isNaN(tmouseX) && !isNaN(tmouseY)) {
				if (state.drag=='incident' && v2.dot([tmouseX, tmouseY], state.normal)<1) {
					state.v_in = v2.normalize([-tmouseX, -tmouseY])
				}
				if (state.drag=='surface') {
					let surf = v2.rot90(state.normal)
					if (v2.dot([tmouseX,tmouseY], surf)<0) {
						[tmouseX, tmouseY] = [-tmouseX, -tmouseY]
					}
					if (v2.dot(state.v_in, v2.rot270([tmouseX, tmouseY]))>0) {
						state.normal = v2.rot270(v2.normalize([tmouseX, tmouseY]))
					} 
				}
			}

			p5.redraw()
		}
	}
}
