

function figure1(p5) {
	let circ = make_ngon(200),
		p_on = true,
		state = {w:540, h:350},
		cv, w, h, ratio, cvparent,
		button, c1, orient, olabel,
		orbitOn = true,
		cam

	function size(cvparent) {
		// size scales the canvas according to the width of the containing div
		let domwidth = parseInt(window.getComputedStyle(cvparent).width);
		ratio = domwidth / state.w
		w = ratio * state.w
		h = ratio * state.h
	}
		
	p5.setup = function() {
	  cv = p5.createCanvas(state.w, state.h, p5.WEBGL);
	  cvparent = cv.parent()
	  size(cvparent)
	  p5.resizeCanvas(w, h)
	  p5.setAttributes('antialias', true);
	  cam = p5.createCamera()
	  p5.ortho(-w/2, w/2, -h/2, h/2, -4*w, 4*w)
	  // controls
	  button = p5.createButton('Reset');
	  button.position(10, p5.height-50);
	  button.mousePressed(()=>{cam.camera(); orient.value(0)});
	  c1 = p5.createCheckbox('Show planes', p_on)
	  c1.position(110, p5.height-50)
	  c1.style('color', 'white')
	  c1.changed(()=>p_on=c1.checked())	  
	  orient = p5.createSlider(0,90,0,1)
	  orient.position(110, p5.height-25)
	  orient.mouseMoved(()=>{return false})
	  //orient.mousePressed(()=>{orbitOn = false})
	  //orient.mouseReleased(()=>{orbitOn = true})
	  olabel = p5.createDiv('Rotate lens:')
	  olabel.position(10, p5.height-25)
	  olabel.style('color', 'white')
	}
	
	p5.windowResized = function () {
		size(cvparent)
		p5.resizeCanvas(w, h)
		button.position(10, h-50);
	    c1.position(110,h-50)
	    orient.position(110, p5.height-25)
		olabel.position(10, p5.height-25)
	    p5.ortho(-w/2, w/2, -h/2, h/2, -4*w, 4*w)
	}
	
	p5.draw = function() {
	  p5.mouseY<(p5.height-50) && p5.orbitControl()
	  p5.background(0, 61, 93);
	  p5.translate(-20*ratio,-20*ratio,0) // shifts the drawing up a bit
	  // lens
	  p5.fill(200, 200, 255);
	  p5.strokeWeight(4);
	  p5.stroke(200, 200, 255);
	  showobj(0, 0, 0, 150*ratio, circ);
	  // rays
	  p5.stroke(255, 255, 255, 100)
	  p5.strokeWeight(2)
	  p5.noFill()
	  p5.blendMode(p5.ADD)
	  let r = orient.value()
	  // cheating here - no rotation because irrelevant
	  rays({n:5, pos:[0,0,0], Fy:1/250, Fz:1/250, d:250, rotation:0, aperture:150})
	  // screen
	  p5.fill(180)
	  p5.stroke(180)
	  p5.strokeWeight(3);
	  showobj(250*ratio,0,0, 250*ratio, make_ngon(4))
	  // planes
	  let lim = 150*0.5*ratio
	  p5.noStroke()
	  let d = 250
	  if (p_on) {
		  p5.fill(0,200,0, 100)
		  p5.beginShape()
		  p5.vertex(-200*ratio,...rot(r,0,lim))
		  p5.vertex(-200*ratio,...rot(r,0,-lim))
		  p5.vertex(d*ratio,...rot(r,0,-lim))
		  p5.vertex(d*ratio,...rot(r,0,lim))
		  p5.vertex(-200*ratio,...rot(r,0,lim))
		  p5.endShape()
	  }
	  if (p_on) {
		  p5.fill(100,100,190, 100)
		  p5.beginShape()
		  p5.vertex(-200*ratio,...rot(r,lim,0))
		  p5.vertex(-200*ratio,...rot(r,-lim,0))
		  p5.vertex(d*ratio,...rot(r,-lim,0))
		  p5.vertex(d*ratio,...rot(r,lim,0))
		  p5.vertex(-200*ratio,...rot(r,lim,0))
		  p5.endShape()
	  }
	}

	// for speed, generate the ngon sin/cos coords
	function make_ngon(n) {
		var rim = {x:[], y:[], z:[]}
		for (let i=0; i<n+1; i++) {
			rim.x.push(0)
			rim.y.push(p5.sin(p5.TWO_PI/n*i+p5.PI/4))
			rim.z.push(p5.cos(p5.TWO_PI/n*i+p5.PI/4))
		}
		return rim
	}

	function showobj(x, y, z, d, perimeter) {
	  p5.beginShape();
	  for (let i = 0; i < perimeter.x.length; i++) {
		p5.vertex(x+perimeter.x[i], y+perimeter.y[i]*d/2, z+perimeter.z[i]*d/2)
	  }
	  p5.endShape();
	}

	function linspace(start, finish, n) {
		let s = []
		for (let i=0; i<n; i++) {
			s.push(start+i*(finish-start)/(n-1))
		}
		return s
	}
	
	function rot(angle, x,y) {
		// rotates x & y by a specific angle
		let c = Math.cos(angle*p5.PI/180),
		    s = Math.sin(angle*p5.PI/180)
		return [c*x-s*y, s*x+c*y]
	}
	
	function rays(params) {
		// generates 3d lines going through a thin lens centred at (x,y,z)
		// with diameter d in y & z directions.
		// params: {n:5, pos:[0,0,0], Fy:1/200, Fz:1/200, d:250, aperture:150}
		let n = params.n,
			a = linspace(-params.aperture*0.45, params.aperture*0.45, n),
			[x0,y0,z0] = params.pos || [0,0,0],
			d = params.d,
			r = params.rotation || 0
		for (yi=0; yi<n; yi++) {
			for (zi=0; zi<n; zi++) {
				y = a[yi]
				z = a[zi]
				if ((y**2+z**2)<=(params.aperture/2)**2) {
					p5.beginShape()
					p5.vertex((x0-200)*ratio,...rot(r,(y0+y)*ratio,(z0+z)*ratio))
					p5.vertex(x0*ratio,...rot(r,(y0+y)*ratio,(z0+z)*ratio))
					p5.vertex((x0+d)*ratio,
						...rot(r,(y0+y*(1-d*params.Fy))*ratio,(z0+z*(1-d*params.Fz))*ratio))
					p5.endShape()
				}
			}
		}
	}
	
	
	p5.mouseDragged = function() {
		if (p5.mouseY>=0 && p5.mouseY<(h-25)) { return false } // eliminate page scrolling
	}
}

new p5(figure1,'figure1img')
popout.openButton('Figure1')
popout.addhelp('Figure1', ()=>false)