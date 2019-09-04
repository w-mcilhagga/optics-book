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
				strokeWeight: 3,
				virtualStrokeDash: [3, 8]
			},
			virtual: ['light#1'],
			z_order: 2
		},
		{
			type: 'js',
			init(state) {
				let u = findObject(state,'light#1').position[0],
					v = 1/((1/u)-4)
				findObject(state,'dimensions').position = [u,v]
				findObject(state,'light#2').position[0] = v
			}
		},
		{
			type: 'divergent light',
			id: 'light#1',
			position: [-0.5, 0],
			target: 'lens#1',
			spread: 'fill*0.8',
			ui: {xlock:[-2,-0.01],ylock:true},
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
			type: 'p5',
			id: 'dimensions',
			position: [-0.5, -0.167],
			toparrow: true,
			draw(p5, viewbox, ppm) {
				p5.stroke(255)
				p5.strokeWeight(1)
				let lensh = 0.3/2
				if (this.toparrow) {
					p5.line(0, ppm*lensh, ppm*this.position[0], ppm*0.3/2)
					p5.arrow(ppm*this.position[0], ppm*lensh, -1, 0, 6, 3)
				}
				// virtual
				let vimg = 1/(1/(-0.5)-4)
				p5.line(0, -ppm*lensh, ppm*this.position[1], -ppm*lensh)
				p5.arrow(ppm*this.position[1], -ppm*lensh, -1, 0, 6, 3)
				// labels
				p5.noStroke()
				p5.fill(255)
				p5.textSize(16)
				p5.textAlign(p5.CENTER)
				this.toparrow && p5.yup_text(Math.abs(this.position[0]).toFixed(3)+' m', 
					ppm*this.position[0]/2, ppm*lensh+10)
				p5.textAlign(p5.CENTER, p5.TOP)
				p5.yup_text(Math.abs(this.position[1]).toFixed(3)+' m', ppm*this.position[1]/2, -ppm*lensh-10)
				
			}
		}
	]
}

let fig3_actions = {
	toggle(state, n) {
		// n=1 is the negative lens, n=2 is the object
		findObject(state,'light#'+n).raycount=6
		findObject(state,'light#'+(3-n)).raycount=0	
		if (n==1) {
			findObject(state,'lens#1').style.stroke=[255,255,255]
			findObject(state,'dimensions').toparrow = true
		} else {
			findObject(state,'lens#1').style.stroke=[255,255,255,50]
			findObject(state,'dimensions').toparrow = false
		}
	},
	decorate(state, d) {
		if (fig3_n==2) return
		let L = findObject(state, 'light#1')
		L.style = L.style || {}
		L.style.decoration = d
	}
}

let fig3_n = 1

function fig3_controls(p5, state, w, h, ppm) {
	// makes the controls for figure 2
	co = p5.createButton('Switch')
	
	
	function resize(p5, state, w, h, ppm) {
		co.position(10, h-30)
	}
	
	co.elt.onclick = function() {
		fig3_n = 3-fig3_n
		fig3_actions.toggle(fig3_n)
	}

	resize(p5, state, w, h, ppm)
	return resize
}


new p5(makeP5App(state, fig3_controls, fig3_actions), document.getElementById('Figure3 image'))
fig3_actions.toggle(1)

  d = document.getElementById('fig3handle')
  d.onmousedown = function() {fig3_actions.decorate('ui')}
  d.onmouseup = function() {fig3_actions.decorate()}
  d.addEventListener("touchstart", ()=>{fig3_actions.decorate('ui');return false}, false);
  d.addEventListener("touchend", ()=>{fig3_actions.decorate();return false}, false);

})()