let state

(function() {
state = {
    dragtarget: false,
    oldpt: [
        -1.03,
        0.13
    ],
    renderer: "p2d",
    w: 520,
    h: 220,
    origin: [
        70,
        100
    ],
    ppm: 200,
    background: [0, 61, 92],
	
    items: [
        {
            type: 'parallel light',
            id: 'light#1',
            position: [-1, 0],
            target: 'lens#1',
            spread: 'fill*0.9',
            raycount: 9,
            ui: {},
            style: {
                color: [255,255,255],
				strokeWidth: 1,
				arrows: ['','30%']
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
			draw(p5, P, vbox, ppm) {
				p5.noStroke()
				p5.fill(...state.background)
				p5.rect(-state.origin[0], -100, state.origin[0], 200)
			},
			style: {
				z_order: 1.5
			}
		},
		{
			type: 'barrier',
			id: 'barrier#1',
			ui: {ylock:true, xlock:true},
			position:[1/2,-3,1/2,3],
			style: { 
				stroke: [0,0,0,0]
			}
		}
    ]
}

let items = state.items

function f4_controls(p5, state, w, h, ppm) {
	
	let barriershift = 0
	
	let lens = findObject(state,'lens#1'),
		v = lens.power,
		s = p5.createSlider(0.5,2*v,v,0),
		c = p5.createCheckbox('continue rays',false),
		lo = p5.createSpan(),
		hi = p5.createSpan()
		
	
	s.elt.oninput = function() {
		let lens = findObject(state,'lens#1'),
			barrier = findObject(state,'barrier#1'),
			conv = s.value()
		lens.power = conv
		let barrierx = Math.max(Math.min(1/conv, p5.yup_xlimits()[1]/ppm+0.01), barriershift)
		barrier.position = [barrierx, -3, barrierx, 3]
		p5.redraw()
	}
	s.style('margin','0px')
	s.style('transform-origin', 'bottom left')
	
	c.elt.onchange = function() {
		let barrier = findObject(state,'barrier#1'),
		barriershift = c.checked()?p5.yup_xlimits()[1]/ppm+0.01:0
		let conv = s.value(),
			barrierx = Math.max(Math.min(1/conv, p5.yup_xlimits()[1]/ppm+0.01), barriershift)
		barrier.position = [barrierx, -3, barrierx, 3]
		p5.redraw()
	}
	
	c.style('color','white')
	c.style('width','120px')
	c.style('font','10pt Arial, sans-serif')
	
	lo.html('Low convergence')
	lo.style('color','white')
	lo.style('font','10pt Arial, sans-serif')

	hi.html('High convergence')
	hi.style('color','white')
	hi.style('font','10pt Arial, sans-serif')
	
	function sizer(p5, state, w, h, ppm) {
		s.style('width', h-40+'px')
		s.position(25, h-41)
		s.style('transform', 'rotate(-90deg)')
		c.position(w-120, h-25)
		lo.position(2,h-15)
		hi.position(2,2)
	}
	
	sizer(p5, state, w, h, ppm)
	
	return sizer
}

findObject(state, 'lens#1').draw = drawOvalLens
new p5(makeP5App(state, f4_controls), document.getElementById('Figure4 image'))
})()
