

plugins.bar = {
	// bar is like a passive slider which shows a value
	// needs position, width, height, (all pixels) value (which must be set)
	// and style has bgcolor, color, border
	init(state) { 
		this.state = state 
	},
	
	draw(p5, box, ppm) {
		let self = this,
			w = box[1]-box[0],
			h = box[3]-box[2],
			ratio = ppm/this.state.ppm, // strech factor
			position
		
		// draw background bar
		p5.noStroke()
		p5.fill(...this.style.bgcolor)
		// work out position
		position = [...this.position]
		if (position[0]>0) {
			position[0] += box[0]
		} else {
			position[0] += box[1]-this.width*ratio
		}
		if (position[1]>0) {
			position[1] += box[2]
		} else {
			position[1] += box[3]-this.height*ratio
		}
		// draw value bar
		let barw = this.width*ratio,
		    barh = this.height*ratio
		p5.rect(...position, barw, barh)
		if (barw<barh) {
			barh = (this.value-this.range[0])/(this.range[1]-this.range[0])*barh
		} else {
			barw = (this.value-this.range[0])/(this.range[1]-this.range[0])*barw
		}
		p5.fill(...this.style.color)
		p5.rect(...position, barw, barh)
		// draw border
		if (this.style.stroke) {
			p5.stroke(...this.style.stroke)
			p5.noFill()
			p5.rect(...position, this.width*ratio, this.height*ratio)
		}
		
	}
}

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
            ui: {xlock:false, ylock:true},
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
			type: 'bar',
			position: [15, 30],
			width: 15,
			height: 220-60,
			value: 10,
			range: [0,100],
			style: { bgcolor: [80,80,80], color: [255,255,100], stroke: [0,0,0]},
			init(state) {
				this.state = state
				let pt = findObject(state, 'light#1').position
				this.value = Math.min(Math.abs(-50/pt[0])**0.75, 100)
			}
		},
		{
			type: 'p5',
			draw(p5, vbox, ppm) {
				p5.noStroke()
				p5.fill(...f5_state.background)
				p5.rect(0,-200,100,400)
			},
			style: {
				z_order: 1.5
			}
		}
    ]
}


let f5_controls = function(p5, state, w, h, ppm) {
	
	let lo = p5.createSpan(),
		hi = p5.createSpan()

	lo.html('Low divergence')
	lo.style('color','white')
	lo.style('font','10pt Arial, sans-serif')

	hi.html('High divergence')
	hi.style('color','white')
	hi.style('font','10pt Arial, sans-serif')

	function sizer(p5, state, w, h, ppm) {
		lo.position(2,h-15)
		hi.position(2,2)
	}
	
	sizer(p5, state, w, h, ppm)
	
	return sizer
}

let f5_actions = {
	decorate: function(state, decoration) {
		findObject(state,'light#1').style.decoration = decoration
	}
}

findObject(f5_state, 'lens#1').draw = drawOvalLens
new p5(makeP5App(f5_state, f5_controls, f5_actions), document.getElementById('Figure5 image'))

