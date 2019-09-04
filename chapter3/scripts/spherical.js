function spherical(props) {
	// app state
	let state = Object.assign({
		w: 600,
		h: 250, // max canvas size
		controlw: 100,
		n_in: 1,
		n_out: 4, // initial refractive indices
		centre: [600, 0], // centre of the arc
		// UI flags, data
		dense: [50,60,100],    // the colour for n=2
		bg:    [180,180,180],  // the colour for n=1
		slider: undefined
	}, props )

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
			p5.resizeCanvas(state.w, state.h)
			p5.background(128)
			
			
			// points
			p5.setOrigin(state.w/2,state.h/2)
			
			// controls
			let s = state.slider = p5.createSlider(-1, 1, 0, 0)
			s.position(state.w/2-100, state.h-20)
			s.style('width', '200px')
			s.elt.oninput = ()=>p5.redraw()
			
			p5.createSpan('<em>n<sub>in</sub></em>').position(10,5).style('fontSize','14pt').style('color','white')
			state.leftlabel = p5.createSpan('<em>n<sub>out</sub></em>')
			state.leftlabel.position(state.w-50,5).style('fontSize','14pt').style('color','white')
			p5.noLoop()
		}

		p5.windowResized = function() {
			size(cv)
			p5.resizeCanvas(state.w, state.h)
			state.slider.position(state.w/2-100, state.h-20)
			state.leftlabel.position(state.w-30,10)
			p5.redraw()
		}
		
		p5.draw = function() {
			// transform to y-up coordinates 
			p5.setOrigin(state.w/2,state.h/2)
			let ylim = p5.yup_ylimits(),
				xlim = p5.yup_xlimits()

			// left medium
			p5.background(180,180,180)
			let s = state.slider.value()
			state.centre[0] = Math.sign(s)*(700-(700-90)*Math.abs(s))
			if (state.centre[0]==0) {
				state.centre[0] = 10000
			}
			
			// the curve & right medium
			p5.noStroke()
			p5.fill(76,84,116)
			if (state.centre[0]>=0) {
				p5.arc(...state.centre, 2*state.centre[0], 2*state.centre[0], 0.5*Math.PI, 1.5*Math.PI)
				p5.rect(state.centre[0]-10,ylim[0],xlim[1]-xlim[0],ylim[1]-ylim[0])
			} else {
				p5.rect(state.centre[0]+10,ylim[0],-state.centre[0] + xlim[1]-xlim[0],ylim[1]-ylim[0])
				p5.fill(mix(1, state.bg, state.dense))
				p5.arc(...state.centre, 2*state.centre[0], 2*state.centre[0], 1.5*Math.PI, 0.5*Math.PI)
			}
			
			// the radius ray
			if (Math.abs(state.centre[0])>=0) {
				p5.stroke(255,255,0)
				p5.strokeWeight(4)
				p5.line(0,0,...state.centre)
				p5.arrow(...state.centre, Math.sign(state.centre[0]), 0)
			}
			p5.noStroke()
			p5.fill(255,255,0)
			p5.textSize(15)
			p5.textAlign(p5.LEFT, p5.BOTTOM)
			p5.yup_text('r',Math.sign(state.centre[0])*20, 5)
			
			// the incoming rays
			p5.stroke(255)
			p5.strokeWeight(1)
			for (let i=-3; i<=3; i++) {
				let start = [xlim[0], i*20],
					dir = [1,0],
					hit = v2.ray_circle(start, dir, state.centre, Math.abs(state.centre[0]))
				if (hit.c.length>0) {
					let hitpt = Math.abs(hit.pts[0][0])<Math.abs(hit.pts[1][0])?hit.pts[0]:hit.pts[1]
					p5.line(...start,...hitpt)
					p5.arrow(...v2.add(start, [80,0]),1,0)
					// refracted line
					let normal = v2.normalize(v2.sub(state.centre,hitpt))
					if (normal[0]<0) { normal = v2.rot180(normal) }
					let ref = do_refract(Object.assign({},state,{v_in:[1,0], normal}))
					if (!isNaN(ref.theta_in)) {
						p5.line(...hitpt, ...v2.add(hitpt, v2.scale(500, ref.v_out)))
						p5.arrow(...v2.add(hitpt, v2.scale(60, ref.v_out)), ...ref.v_out)
					}
				}
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
