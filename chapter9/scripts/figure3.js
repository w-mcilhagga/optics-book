
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
			light: divlight?'DL':'PL',
			lens: 'back lens',
			draw(p5, vbox, ppm) {
				//console.log(Math.abs(this.position[0]-0.0284))
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
			type: 'divergent light',
			position: [-0.09,0],
			id: 'DL',
			target: 'front cornea',
			spread: 'fill*0.8',
			off:!divlight,
			raycount: 9,
			ui: {ylock:true},
			style: {
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
			start: 'front vertex',
			end: 'DL',
			ycoord: 1.1*7.8/1000,
			style: {
				stroke: 255,
				fill: 255,
				textSize: 16,
				textOffset: [0,10],
				textAlign: ['center', 'bottom']
			}
		},
		/*
		{
			type: 'control',
			controlType: 'slider',
			params: [0,1,0,0],
			position:[10,-10],
			bind: {id: 'data', property:['accom']}
		}*/
	]
}

	let fig3actions = {
		
		toggle(s) {
			s.decorate = s.decorate=='ui'?false:'ui'
		}
	}
new p5(makeP5App(gstate=state, fig3actions), 'figure3img')
	popout.openButton('Figure3')
	popout.addhelp('Figure3', fig3actions.toggle)
})()