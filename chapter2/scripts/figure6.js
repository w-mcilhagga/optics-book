
(function() {
let light = {
	type: 'divergent light',
	target: [0.5,0],
	spread: 0,
	raycount: 1,
	style: {
		color: [255,255,255],
		strokeWidth: 1,
		arrows: [{pt:[-0.2,0], dir:[0,1]}, {pt:[1,0], dir:[0,1]}]
	}
},

state = {
    dragtarget: false,
    oldpt: [
        -1.03,
        0.13
    ],
    w: 520,
    h: 250,
    origin: [
        150,
        130
    ],
    ppm: 200,
    background: [0, 61, 92],
	
    items: [
		{
			type: 'js',
			init(state) {
				// work out where the lights should be put
				let L = findObject(state, 'lens#1'),
					a = L.aperture*0.9/2,
					target = [-1/L.power, 0],
					pts = []
				findObject(state,'labels').value = -1/L.power
				for (let i=0; i<6; i++) {
					let DL = findObject(state, 'light#1.'+i)
					DL.target = target
					let lenspt = v2.add(v2.scale((i-2.5)*a/2.5, [0,1]), L.position),
						dir = v2.scale(4,v2.normalize(v2.sub(lenspt,target)))
					DL.position = v2.add(target, dir)
					pts.push(lenspt)
				}
				findObject(state,'labels').lenspts = pts
			}
		},		
		{
			type:'p5',
			id:'labels',
			value: 0,
			lenspts: [],
			style: {
				z_order: 2
			},
			draw(p5, vbox, ppm) {
				let xlim = p5.yup_xlimits(),
					ylim = p5.yup_ylimits()
				// hide part of rays
				p5.fill(...state.background)
				p5.noStroke()
				p5.rect(xlim[0], ylim[0], ppm*0.18, ylim[1]-ylim[0])
				// focal pt
				p5.noStroke()
				p5.fill(190,190,0)
				p5.circle(ppm*this.value, 0, 8)
				// dimension line
				p5.textSize(16)
				p5.textAlign(p5.CENTER, p5.TOP)
				p5.stroke(190,190,0)
				p5.line(2,-ppm*0.35,ppm*this.value,-ppm*0.35)
				p5.arrow(ppm*this.value,-ppm*0.35,1,0,6,3)
				p5.noStroke()
				p5.fill(190,190,0)
				p5.yup_text(this.value.toFixed(3)+'m', ...v2.sub(v2.scale(ppm,[this.value/2,-0.4]),[0,5]))
				p5.textAlign(p5.LEFT, p5.TOP)
				p5.fill(255)
				p5.yup_text('Power = '+findObject(state, 'lens#1').power.toFixed(2)+'D', 
					xlim[0]+2, ylim[1]-3)
				// virtual rays
				p5.stroke(190,190,0)
				p5.strokeDash([5,8])
				for (i=0; i<this.lenspts.length; i++) {
					p5.line(...v2.scale(ppm,this.lenspts[i]), ppm*this.value, 0)
				}
			}
		},
		// the individual lights
		...[0,1,2,3,4,5].map(function(i) {
					return Object.assign({
					id: 'light#1.'+i,
					position: [-1, 0.2*(i-2.5)],			
				}, light)
		}),
		{
			type: 'thinlens',
			id: 'lens#1',
			position: [0,0],
			axis: [1,0],
			aperture: 0.5,
			power: -2,
			ui: {xlock:true, ylock:true},
            style: {
				color:[255,255,255],
				strokeWeight:3,
				z_order: 2
			},
			//virtual: ['light#1']
		},
    ]
}

function controls(p5, state, w, h, ppm) {
	
	let lens = findObject(state,'lens#1'),
		s = p5.createSlider(-10,-0.75,lens.power,0.25)		
	
	s.elt.oninput = function() {
		let lens = findObject(state,'lens#1')
		lens.power = s.value()
		p5.redraw()
	}
	s.style('margin','0px')
	s.style('transform-origin', 'bottom left')

	function sizer(p5, state, w, h, ppm) {
		s.style('width', h-40+'px')
		s.position(25, h-41)
		s.style('transform', 'rotate(-90deg)')
		//lo.position(2,h-15)
		//hi.position(2,2)
	}
	
	sizer(p5, state, w, h, ppm)
	
	return sizer
}

new p5(makeP5App(state,controls), document.getElementById('Figure6 image'))

})()