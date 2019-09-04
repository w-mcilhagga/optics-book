
(function() {
let state = {
    dragtarget: false,
    oldpt: [
        -1.03,
        0.13
    ],
    w: 520,
    h: 250,
    origin: [
        350,
        130
    ],
    ppm: 200,
    background: [0, 61, 92],
	
    items: [
		{
			type: 'js',
			init(state) {
				// place barrier at right location
				let L = findObject(state, 'lens#1'),
					B = findObject(state, 'barrier#1')
				findObject(state, 'labels').value = 1/L.power
				//B.position[0] = B.position[2] = 1/L.power
				//B.position[1] = -1
				//B.position[3] = -B.position[1]
			}
		},		
		{
			type:'p5',
			id:'labels',
			value: 0,
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
				p5.arrow(ppm*this.value,-ppm*0.35,-1,0,6,3)
				p5.noStroke()
				p5.fill(190,190,0)
				p5.yup_text(this.value.toFixed(3)+'m', ...v2.sub(v2.scale(ppm,[this.value/2,-0.4]),[0,5]))
				p5.textAlign(p5.LEFT, p5.TOP)
				p5.fill(255)
				p5.yup_text('Power = '+findObject(state, 'lens#1').power.toFixed(2)+'D', 
					xlim[0]+2, ylim[1]-3)
			}
		},
        {
            type: 'parallel light',
            id: 'light#1',
            position: [-1, 0],
            target: 'lens#1',
            spread: 'fill*0.8',
            raycount: 6,
            ui: {ylock:true},
            style: {
                color: [255,255,255],
				strokeWidth: 1,
				arrows: [-0.9, {pt:[0.4,0], dir:[0,1]}]
            }
        },
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
				z_order: 2,
				virtualStroke: [190, 190, 0]
			},
			virtual: ['light#1']
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

new p5(makeP5App(state,controls), document.getElementById('Figure5 image'))

})()