
(function() {
let EYE = Gullstrand([0,0], 0),
    pupil = makePupil(EYE, 3),
	ret = findObject({items:EYE}, 'retina')
	
ret = ret.position[0]+ret.r[0] // back of retina

let c=[-0.2,0],
    state = {
	w: 520,
	h: 380,
	ppm: 10000,
	origin: [220, 175],
	background: [0, 61, 93],
	items: [
		{
			type: 'data',
			id: 'data',
			accom: 0,
			pupildiam: 3,
			vergence: 0.1,
			init(state) {
				let EYE = Gullstrand([0,0], this.accom),
					pupil = makePupil(EYE, this.pupildiam)
				// update state
				Object.assign(
					findObject(state,'front lens'), 
					findObject({items:EYE},'front lens')
				)
				Object.assign(
					findObject(state,'back lens'), 
					findObject({items:EYE},'back lens')
				)
				findObject(state,'L1').position[0] = -1/this.vergence
			},
			style: {z_order:100}
		},
		...EYE,
		...pupil,
		{
			type: 'real image',
			id: 'shell',
			light: 'L1',
			lens: 'back lens',
			draw(p5, vbox, ppm) {
				if (Math.abs(this.position[0]-ret)<0.0001) {
					p5.fill(0,255,0)
				} else {
					p5.fill(255,0,0)
				}
				p5.strokeWeight(1)
				p5.circle(...v2.scale(ppm, this.position), 8, 8)
			},
			style: {
				visible: true,
				z_order: -10
			}
		},
		{
			type: 'divergent light',
			position: [-0.125,0],
			id: 'L1',
			target: 'front cornea',
			spread: 'fill*0.7',
			raycount: 10,
			off: true,
			style: {
				arrows: ['']
			}
		},
		// accommodation slider
		{
			type: 'control',
			controlType: 'span',
			position: [10, 5],
			text: 'Accommodation:',
			style: {color:'white'}
		},		
		{
			type: 'control',
			controlType: 'slider',
			params: [0,1.1,0,0], // slightly more that legrand accom
			position:[140,10],
			width: 150,
			bind: {id: 'data', property:['accom']}
		},
		{
			type: 'control',
			controlType: 'span',
			position: [140+150+10, 10],
			text: '0%',
			init(state) {
				this.state = state
				let v = findObject(state, 'data').accom
				this.text = (v/1.1*100).toFixed(0)+'%'
			},
			style: {color:'white'}
		},
		// object controls
		{
			type: 'control',
			controlType: 'span',
			position: [10, -10],
			text: 'Distance:',
			style: {color:'white'}
		},		
		{
			type: 'control',
			controlType: 'checkbox',
			params: ['Light on', false],
			position: [10, -35],
			style: {color:'white'},
			bind: {id: 'L1', property: ['off'], yes: false, no: true }
		},		
		{
			type: 'control',
			controlType: 'slider',
			params: [0.1,10,0.1,0],
			position:[90,-13],
			width: 150,
			bind: {id: 'data', property:['vergence']}
		},
		{
			type: 'control',
			controlType: 'span',
			position: [90+150+10,-10],
			text: (-1/0.1).toFixed(3)+' m',
			init(state) {
				this.state=state
				let v = findObject(state, 'data').vergence
				this.text = (1/v).toFixed(3)+' m'
			},
			style: {color:'white'}
		},
		
	]
}

new p5(makeP5App(state), 'figure7img')
popout.openButton('Figure7')
	
})()
