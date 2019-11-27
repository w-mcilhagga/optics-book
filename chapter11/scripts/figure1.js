
let cam

function figure1(p5) {
	let circ = make_ngon(200),
		p1on=true,
		p2on=true,
		state = {w:540, h:350},
		cv, w, h, ratio, cvparent,
		button, c1, c2

	function size(cv) {
		// size scales the canvas according to the width of the containing div
		let domwidth = parseInt(window.getComputedStyle(cvparent).width);
		ratio = domwidth / state.w
		w = ratio * state.w
		h = ratio * state.h
	}
		
	p5.setup = function() {
	  cv = p5.createCanvas(state.w, state.h, p5.WEBGL);
	  cvparent = cv.parent()
	  size(cv)
	  p5.resizeCanvas(w, h)
	  p5.setAttributes('antialias', true);
	  cam = p5.createCamera()
	  p5.ortho(-w/2, w/2, -h/2, h/2, -600, 600)
	  // controls
	  button = p5.createButton('Reset');
	  button.position(19, p5.height-25);
	  button.mousePressed(()=>cam.camera());
	  c1 = p5.createCheckbox('horizontal plane', p1on)
	  c1.position(229,p5.height-25)
	  c1.style('color', 'white')
	  c1.changed(()=>p1on=c1.checked())	  
	  c2 = p5.createCheckbox('vertical plane', p2on)
	  c2.position(99,p5.height-25)
	  c2.style('color', 'white')
	  c2.changed(()=>p2on=c2.checked())
	}
	
	p5.windowResized = function () {
		size(cv)
		p5.resizeCanvas(w, h)
		button.position(19, h-25);
	    c1.position(229,h-25)
		c2.position(99,h-25)
	    p5.ortho(-w/2, w/2, -h/2, h/2, -600, 600)
	}
	
	p5.draw = function() {
	  p5.orbitControl()
	  p5.background(0, 61, 93);
	  // lens
	  p5.fill(200, 200, 255);
	  p5.strokeWeight(4);
	  p5.stroke(200, 200, 255);
	  showobj(0, 0, 0, 150*ratio, circ);
	  // rays
	  p5.stroke(255, 255, 255, 150)
	  p5.strokeWeight(2)
	  p5.noFill()
	  rays(0,0,0,150*ratio)
	  // screen
	  p5.fill(180)
	  p5.stroke(180)
	  p5.strokeWeight(3);
	  showobj(250*ratio,0,0, 250*ratio, make_ngon(4))
	  // planes
	  let lim = 150*0.5*ratio
	  p5.noStroke()
	  if (p1on) {
		  p5.fill(200,0,0, 100)
		  p5.beginShape()
		  p5.vertex(-200*ratio,0,lim)
		  p5.vertex(-200*ratio,0,-lim)
		  p5.vertex(0,0,-lim)
		  p5.vertex(250*ratio,0,0)
		  p5.vertex(0,0,lim)
		  p5.vertex(-200*ratio,0,lim)
		  p5.endShape()
	  }
	  if (p2on) {
		  p5.fill(0,100,0, 100)
		  p5.beginShape()
		  p5.vertex(-200*ratio,lim,0)
		  p5.vertex(-200*ratio,-lim,0)
		  p5.vertex(0,-lim,0)
		  p5.vertex(250*ratio,0,0)
		  p5.vertex(0,lim,0)
		  p5.vertex(-200*ratio,lim,0)
		  p5.endShape()
	  }
	}

	function mouseClicked() {

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

	function rays(x0, y0, z0, d) {
		// generates 3d lines going through a thin lens centred at (x,y,z)
		// with diameter d in y & z directions.
		let n=5,
			del = linspace(-d*0.45, d*0.45, n)
		for (yi=0; yi<n; yi++) {
			for (zi=0; zi<n; zi++) {
				y = y0+del[yi]
				z = z0+del[zi]
				if ((y**2+z**2)<=(d/2)**2) {
					p5.beginShape()
					p5.vertex(x0-200*ratio,y,z)
					p5.vertex(x0,y,z)
					p5.vertex(x0+250*ratio,0,0)
					p5.endShape()
				}
			}
		}

	}
}

new p5(figure1,'figure1img')
