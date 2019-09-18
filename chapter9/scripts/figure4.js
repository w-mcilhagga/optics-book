
(function() {
	
let mode='10D axial',
	divlight = true,
	k = 0.89,
	EYE

switch (mode) {
	case 'emmetrope':
		EYE = Gullstrand([0,0], 0)
		break
	case '10D axial':
		EYE = Gullstrand([0,0], 0, {r0:[k*7.8, k*6.5,,,[-13.4,11.2]]})
		break
	case '5D refractive':
		
		EYE = Gullstrand([0,0], 0, {r0:[k*7.8, k*6.5]})
		break
}	

let pupil = makePupil(EYE, 4)

let c=[-0.2,0],
    state = {
	w: 510,
	h: 200,
	//maxWidth: 700,
	ppm: 4000,
	origin: [380, 100],
	background: [0, 61, 93],
	items: [
		{
			type: 'data',
			id: 'data',
			accom: 0,
			pupildiam: 2,
			init(state) {
				return;
				EYE = Gullstrand([0,0], this.accom)
				pupil = makePupil(EYE, this.pupildiam)
				// update state by copying components of eye and retina into items array
				Object.assign(
					findObject(state,'front lens'), 
					findObject({items:EYE},'front lens')
				)
				Object.assign(
					findObject(state,'back lens'), 
					findObject({items:EYE},'back lens')
				)
				Object.assign(
					findObject(state,'pupil top'), 
					findObject({items:EYE},'pupil top')
				)
				Object.assign(
					findObject(state,'pupil bottom'), 
					findObject({items:EYE},'pupil bottom')
				)
			},
			style: {z_order:100}
		},
		...EYE,
		...pupil,
		{
			type: 'real image',
			id: 'shell',
			light: 'PL',
			lens: 'back lens',
			draw(p5, vbox, ppm) {
				if (Math.abs(this.position[0]-0.0284)<0.0002) {
					p5.fill(0,255,0)
				} else {
					p5.fill(255,0,0)
				}
				p5.circle(...v2.scale(ppm, this.position), 8, 8)
			},
			style: {
				visible: true,
				z_order: -10
			}
		},
		{
			type: 'real image',
			id: 'shell',
			light: 'DL',
			lens: 'back lens',
			draw(p5, vbox, ppm) {
				if (Math.abs(this.position[0]-0.0284)<0.0002) {
					p5.fill(0,255,0)
				} else {
					p5.fill(255,0,0)
				}
				p5.circle(...v2.scale(ppm, this.position), 8, 8)
			},
			style: {
				visible: true,
				z_order: -10
			}
		},

		{
			type: 'parallel light',
			position: [-0.09,0],
			id: 'PL',
			target: [0,0],
			spread: 0.01,
			raycount: 11,
			ui: {ylock:true, xlock:true},
			style: {
				arrows: ['']
			}
		},
		{
			type: 'thinlens',
			id: 'specs',
			position: [-0.02,0],
			power: -20,
			aperture: 0.015,
			axis: [1,0],
			ui: {ylock: true, xlock:[-5,-0.004]}
		},
		{
			type: 'virtual image',
			id: 'specsf',
			light: 'PL',
			lens: 'specs',
			step: 2,
			style: {
				stroke: [255, 255, 0],
				strokeDash: []
			}
		},
		{
			type: 'divergent light',
			position: [-0.064,0],
			id: 'DL',
			target: 'front cornea',
			spread: 'fill*1.1',
			raycount: 11,
			ui: {ylock:true, xlock:false},
			off: true,
			style: {
				visible: false,
				arrows: ['']
			}
		},
		{
			type: 'barrier',
			id: 'front vertex',
			position: [0,-1,0,1],
			plane: 3,
			style: {visible: false},
			ui: {xlock:true, ylock:true}
		},
		{
			type: 'dimension',
			start: 'specs',
			end: 'front vertex',
			id: 'specdist',
			ycoord: -1.3*7.8/1000,
			style: {
				stroke: 255,
				fill: 255,
				textSize: 16,
				textOffset: [0,-10],
				textAlign: ['center', 'top'],
				offset: [[3,0],[0,0]],
			}
		},
		{
			type: 'dimension',
			start: 'specs',
			end: 'specsf',
			id: 'focallen',
			ycoord: -1.3*7.8/1000,
			//label: '1/F',
			style: {
				stroke: 255,
				fill: 255,
				textSize: 16,
				textOffset: [0,-10],
				textAlign: ['center', 'top'],
				offset: [[-3,0],[0,0]],
			}
		},
		{
			type: 'dimension',
			start: 'front vertex',
			end: 'DL',
			id: 'farpoint',
			ycoord: 1.3*7.8/1000,
			style: {
				stroke: 255,
				fill: 255,
				textSize: 16,
				textOffset: [0,10],
				textAlign: ['center', 'bottom'],
				offset: [[0,0],[0,0]],
				visible: false
			}
		},
		{
			type: 'dimension',
			start: 'front vertex',
			end: 'PL',
			ycoord: 1.1*7.8/1000,
			ui: {xlock:true, ylock:true},
			style: {
				stroke: 255,
				fill: 255,
				textSize: 16,
				textOffset: [0,10],
				textAlign: ['center', 'bottom'],
				visible: false
			}
		},
		
		
		{
			type: 'control',
			controlType: 'checkbox',
			params: ['Object', false],
			position:[10,-10],
			bind: [
				{id: 'specs', property: ['style','visible'], 'yes':false, 'no':true},
				{id: 'specs', property: ['power'], 'yes':0, 'no':-20},
				{id: 'specdist', property: ['style','visible'], 'yes':false, 'no':true},
				{id: 'focallen', property: ['style','visible'], 'yes':false, 'no':true},
				{id: 'PL', property: ['off'], 'yes':true, 'no':false},
				{id: 'DL', property: ['off'], 'yes':false, 'no':true},
				{id: 'DL', property: ['style','visible'], 'yes':true, 'no':false},
				{id: 'farpoint', property: ['style','visible'], 'yes':true, 'no':false},
			],
			style: {color:'white'}
		}
	]
}

	let fig4actions = {
		
		toggle(s) {
			s.decorate = s.decorate=='ui'?false:'ui'
		}
	}
new p5(makeP5App(gstate=state, fig4actions), 'figure4img')
	popout.openButton('Figure4')
	popout.addhelp('Figure4', fig4actions.toggle)
})()