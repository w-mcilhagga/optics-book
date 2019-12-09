


function figure3(p5) {
	let circ = make_ngon(200),
		p_on=true,
		state = {w:540, h:350},
		cv, w, h, ratio, cvparent,
		cam,
		button, c1, orientation, distance, orbitOn=true,
		olabel, dlabel

	function size(cv) {
		// size scales the canvas according to the width of the containing div
		let domwidth = parseInt(window.getComputedStyle(cvparent).width);
		ratio = domwidth / state.w
		w = ratio * state.w
		h = ratio * state.h
	}
	
	p5.preload = function() {
	  roboto = p5.loadFont('scripts/Roboto/Roboto-Bold.ttf');
	}
		
	p5.setup = function() {
	  cv = p5.createCanvas(state.w, state.h, p5.WEBGL);
	  cvparent = cv.parent()
	  size(cv)
	  p5.resizeCanvas(w, h)
	  p5.setAttributes('antialias', true);
	  cam = p5.createCamera()
	  p5.ortho(-w/2, w/2, -h/2, h/2, -4*w, 4*w)
	  // controls
	  button = p5.createButton('Reset');
	  button.position(10, p5.height-50);
	  button.mousePressed(()=>{cam.camera();orientation.value(0)});
	  c1 = p5.createCheckbox('Show planes', p_on)
	  c1.position(110, p5.height-50)
	  c1.style('color', 'white')
	  c1.changed(()=>p_on=c1.checked())	  
	  orientation = p5.createSlider(0,90,0,1)
	  orientation.position(110, p5.height-25)
	  orientation.style('width','70px')
	  orientation.mouseMoved(()=>false)
	  distance = p5.createSlider(100,300,250,1)
	  distance.position(300, p5.height-25)
	  distance.style('width','70px')
	  for (elem of [orientation, distance]) {
		elem.mousePressed(()=>{orbitOn=false})
		elem.mouseReleased(()=>{orbitOn=true})
	  }
	  olabel = p5.createDiv('Rotate lens:')
	  olabel.position(10, p5.height-25)
	  olabel.style('color', 'white')
	  dlabel = p5.createDiv('Move screen:')
	  dlabel.position(200, p5.height-25)
	  dlabel.style('color', 'white')
	  
	  p5.textFont(roboto)
	  p5.textSize(20)
	}
	
	p5.windowResized = function () {
		size(cv)
		p5.resizeCanvas(w, h)
		button.position(10, h-50);
	    c1.position(110, p5.height-50)
	    orientation.position(110, p5.height-25)
		distance.position(300, p5.height-25)
	    olabel.position(10, p5.height-25)
	    dlabel.position(200, p5.height-25)
	  
	    p5.ortho(-w/2, w/2, -h/2, h/2, -4*w, 4*w)
	}
	
	p5.draw = function() {
	  orbitOn && p5.orbitControl()
	  p5.background(0, 61, 93)
	  p5.translate(-20*ratio,-30*ratio,0) // shifts the drawing up a bit
	  // lens
	  p5.fill(200, 200, 255)
	  p5.strokeWeight(4)
	  p5.stroke(200, 200, 255)
	  showobj(0, 0, 0, 150*ratio, circ)
	  // rays
	  p5.stroke(255, 255, 255, 100)
	  p5.strokeWeight(1)
	  p5.noFill()
	  p5.blendMode(p5.ADD)
	  let r = orientation.value()
	  let d = distance.value()
	  let params = {n:7, pos:[0,0,0], Fy:1/250, Fz:1/150, d:d, aperture:150, rotation:r}
	  let limits = rays(params)
	  // screen
	  p5.fill(180)
	  p5.stroke(180)
	  p5.strokeWeight(3);
	  showobj(d*ratio,0,0, 250*ratio, make_ngon(4))
	  // images
	  p5.noFill()
	  p5.stroke(255,0,0)
	  if (Math.abs(d-1/params.Fy)<5 || Math.abs(d-1/params.Fz)<5) {
		limits = limits.sort((a,b)=>-(a[3]-b[3]))
		let xcoord = limits[0][0]-1*ratio
		p5.line(xcoord, limits[0][1], limits[0][2], xcoord, -limits[0][1], -limits[0][2])
	  }
	  if (Math.abs(d-2/(params.Fy+params.Fz))<5) {
		limits = limits.sort((a,b)=>-(a[3]-b[3]))
		let xcoord = limits[0][0]-1*ratio, 
		    r = limits[0][3]**0.5
		showobj(xcoord, 0, 0, 2*r, circ)
	  }
	  // planes
	  let lim = 150*0.5*ratio
	  p5.noStroke()
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
	
	function rot(angle, x, y) {
		// rotates x & y by a specific angle
		let c = Math.cos(angle*Math.PI/180),
			s = Math.sin(angle*Math.PI/180)
		return [c*x-s*y, s*x+c*y]
	}

	function sumv(a,b) { return [a[0]+b[0], a[1]+b[1]]}
	
	function rays(params) {
		// generates 3d lines going through a thin lens centred at (x,y,z)
		// with diameter d in y & z directions.
		// params: {n:5, pos:[0,0,0], Fy:1/200, Fz:1/200, d:250, aperture:150}
		let n = params.n,
			a = linspace(-params.aperture*0.45, params.aperture*0.45, n),
			[x0,y0,z0] = params.pos || [0,0,0],
			d = params.d,
			r = -(params.rotation || 0)
		
		let limits = []
		for (yi=0; yi<n; yi++) {
			for (zi=0; zi<n; zi++) {
				let y = a[yi],
					z = a[zi]
				// get the yz coordinates in the rotated  principal meridians.
				let [yr, zr] = rot(r,y,z)
				// work out the point where they hit the screen
				yr *= (1-d*params.Fy)
				zr *= (1-d*params.Fz)
				// work out the point in unrotated coordinates
				;[yr,zr] = sumv(rot(-r,yr,0), rot(-r,0,zr))
				if ((y**2+z**2)<=(params.aperture/2)**2) {
					p5.beginShape()
					p5.vertex((x0-200)*ratio, y*ratio, z*ratio)
					p5.vertex(x0*ratio, y*ratio, z*ratio)
					p5.vertex((x0+d)*ratio, yr*ratio, zr*ratio)
					p5.endShape()
					limits.push([(x0+d)*ratio, yr*ratio, zr*ratio, yr**2+zr**2])
				}
			}
		}
		return limits		
	}
	
	p5.mouseDragged = function() {
		if (p5.mouseY>=0 && p5.mouseY<(h-25)) { return false } // eliminate page scrolling
	}
	
	
}

new p5(figure3,'figure3img')
popout.openButton('Figure3')
popout.addhelp('Figure3', ()=>false)
