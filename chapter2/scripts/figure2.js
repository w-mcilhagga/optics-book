(function() {

let co, cn, ta

let state = {
    dragtarget: false,
    oldpt: [
        -1.03,
        0.13
    ],
    renderer: 'p2d',
    w: 520,
    h: 300,
    origin: [
        350,
        140
    ],
    ppm: 500,
    background: [0, 61, 92],
	
    items: [
		{
			type: 'thinlens',
			id: 'lens#1',
			position: [0,0],
			aperture: 0.25,
			axis: [1,0],
			power: -4,
			ui: {xlock:true, ylock:true},
			style: {
				strokeWeight: 3
			},
			z_order: 2
		},
		{
			type: 'p5',
			id: 'text',
			text: "No, it's a negative lens",
			draw(p5, viewbox, ppm) {
				p5.noStroke()
				p5.fill(255)
				p5.textSize(16)
				p5.textAlign(p5.LEFT)
				p5.yup_text(this.text, viewbox[0]+30, viewbox[2]+120)
			}
		},
		{
			type: 'divergent light',
			id: 'light#1',
			position: [-0.5, 0],
			target: 'lens#1',
			spread: 'fill*0.8',
			ui: {xlock:true, ylock:true},
			raycount: 6,
			style: {
				strokeWeight: 2,
				stroke: [200, 200, 100],
				arrows: ['', {pt:[0.2,0], dir:[0,1]}]
			}
		},
		{
			type: 'divergent light',
			id: 'light#2',
			position: [-1/6, 0],
			target: 'lens#1',
			spread: 'fill*0.8',
			ui: {xlock:true, ylock:true},
			raycount: 6,
			style: {
				strokeWeight: 2,
				stroke: [200, 200, 100],
				arrows: [{pt:[0.2,0], dir:[0,1]}]
			},
			plane: 1
		},
		{
			type: 'js',
			id: 'raise',
			raiseby: 0,
			init(state) {
				let maxoffset = state.h/state.ppm-10/200
				if (this.raiseby) {
					let c = findObject(state,'curtain')
					if ((c.offset >= maxoffset) && this.raiseby>0) {
						this.raiseby = 0
						ta.elt.disabled = false
					} 
					if (c.offset<=0 && this.raiseby<0) {
						// dropped curtain all the nway
						cn.elt.disabled = co.elt.disabled = true
						this.raiseby = 0
						ta.elt.disabled = true
						cn.elt.disabled = co.elt.disabled = false
						c.offset = 0
					}
					c.offset = Math.min(Math.max(c.offset+this.raiseby,0),maxoffset)
				} 
			},
			draw(p5) {
				if (this.raiseby) {
					p5.loop()
				} else {
					p5.noLoop()
				}
			}
		},
		{
			type: 'image',
			id: 'curtain',
			position: [0,0],
			offset: 0, 
			image: 'scripts/curtain.jpg',
			draw(p5, vbox, ppm) {
				// adjust the position of the image
				let img = p5.imgCache[this.image],
					w = img.width/ppm,
					h = img.height/ppm,
					ylim = p5.yup_ylimits()
				this.position = [0.1-w, ylim[0]/ppm+h+this.offset]
				plugins.image.draw.call(this, p5, vbox, ppm)
			},
			style: {z_order:3},
		}
		
	]
}

let fig2_actions = {
	toggle(state, n) {
		// n=1 is the negative lens, n=2 is the object
		findObject(state,'light#'+n).raycount=6
		findObject(state,'light#'+(3-n)).raycount=0	
		if (n==1) {
			findObject(state,'lens#1').style.stroke=[255,255,255]
		} else {
			findObject(state,'lens#1').style.stroke=[255,255,255,0]
		}
	},
	raiseby(state, n) {
		findObject(state,'raise').raiseby = n
	},
	reset(state) {
		findObject(state,'curtain').curtain_bottom = 0
	}
}


function fig2_controls(p5, state, w, h, ppm) {
	// makes the controls for figure 2
	co = p5.createButton('Object'),
	cn = p5.createButton('Negative Lens')
	ta = p5.createButton('Try Again')
	ta.elt.disabled = true
	
	function resize(p5, state, w, h, ppm) {
		co.position(20, h-30)
		cn.position(100, h-30)
		ta.position(270, h-30)
	}
	
	co.elt.onclick = function() {
		fig2_actions.toggle(1)
		fig2_actions.raiseby(2/200)
		findObject(state,'text').text = "No, it's a negative lens"
		cn.elt.disabled = co.elt.disabled = true
	}
	
	cn.elt.onclick = function() {
		fig2_actions.toggle(2)
		fig2_actions.raiseby(2/200)
		findObject(state,'text').text = "No, it's an object"
		cn.elt.disabled = co.elt.disabled = true
	}
	
	ta.elt.onclick = function() {
		fig2_actions.raiseby(-4/200)
	}

	
	resize(p5, state, w, h, ppm)
	return resize
}


new p5(makeP5App(state, fig2_controls, fig2_actions), document.getElementById('Figure2 image'))

})()
