f5_state = {
    dragtarget: false,
    oldpt: [
        -1.03,
        0.13
    ],
    w: 520,
    h: 220,
    origin: [
        520-60,
        100
    ],
    ppm: 200,
    background: [0, 61, 92],
	
    items: [
        {
            type: 'divergent light',
            id: 'light#1',
            position: [-1, 0],
            target: 'lens#1',
            spread: 'fill*0.9',
            raycount: 9,
            ui: {xlock:true, ylock:true},
            style: {
                color: [255,255,255],
				strokeWidth: 1,
				arrows: ['60%']
            }
        },
		{
			type: 'thinlens',
			id: 'lens#1',
			position: [0,0],
			axis: [1,0],
			aperture: 0.6,
			power: 2,
			ui: {xlock:true, ylock:true},
            style: {
				color:[180,180,255],
				z_order: 2
			}
		},
		{
			type: 'p5',
			draw(p5, vbox, ppm) {
				p5.noStroke()
				p5.fill(...f5_state.background)
				p5.rect(0,-100,100,200)
			},
			style: {
				z_order: 1.5
			}
		}
    ]
}


function f5_controls(p5, state, w, h, ppm) {
	
	let light = findObject(state,'light#1'),
		s = p5.createSlider(0.5,2*2,1,0),
		lo = p5.createSpan(),
		hi = p5.createSpan()
		
	
	s.elt.oninput = function() {
		let light = findObject(state,'light#1'),
			conv = s.value()
		light.position[0] = -1/conv
		p5.redraw()
	}
	s.style('margin','0px')
	s.style('transform-origin', 'bottom left')

	lo.html('Low divergence')
	lo.style('color','white')
	lo.style('font','10pt Arial, sans-serif')

	hi.html('High divergence')
	hi.style('color','white')
	hi.style('font','10pt Arial, sans-serif')

	function sizer(p5, state, w, h, ppm) {
		s.style('width', h-40+'px')
		s.position(25, h-41)
		s.style('transform', 'rotate(-90deg)')
		lo.position(2,h-15)
		hi.position(2,2)
	}
	
	sizer(p5, state, w, h, ppm)
	
	return sizer
}


findObject(f5_state, 'lens#1').draw = drawOvalLens
new p5(makeP5App(f5_state, f5_controls), document.getElementById('Figure5 image'))
