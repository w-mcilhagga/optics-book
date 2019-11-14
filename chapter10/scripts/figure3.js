
var s
(function() {
	
let mode='10D axial',
	k = 1/0.89,
	EYE

switch (mode) {
	case 'emmetrope':
		EYE = Gullstrand([0,0], 0)
		break
	case '10D axial':
		EYE = Gullstrand([0,0], 0, {r0:[k*7.8, k*6.5,,,[-10.0,11.2]]})
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
	origin: [510-420, 100],
	background: [0, 61, 93],
	items: [
		{
			type: 'data',
			id: 'data',
			accom: 0,
			pupildiam: 2,
			init(state) {
				let conv = findObject(state, 'converger'),
				    fc = findObject(state, 'front cornea'),
					fcpos = v2.scale(0.5, v2.add(...fc.ends())),
					light = findObject(state,'PL'),
					fpt = 1/conv.power,
					pos = conv.position,
					spread
				spread = fpt/(fpt-(fcpos[0]-conv.position[0]))*light.target_spread
				light.spread = spread	
			},
			style: {z_order:100}
		},
		...EYE,
		...pupil,
		{
			type: 'real image', // for the actual image
			id: 'shell',
			light: 'PL',
			lens: 'back lens',
			draw(p5, vbox, ppm) {
				if (Math.abs(this.position[0]-0.0213)<0.00015) {
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
			position: [-0.04,0],
			id: 'PL',
			target: 'front cornea',
			target_spread: 0.012,
			spread: 0.012,
			raycount: 9,
			ui: {ylock:true, xlock:true},
			style: {
				arrows: ['']
			}
		},
		{
			type: 'thinlens',
			position: [-0.035, 0],
			id: 'converger',
			aperture: 0.5,
			ui: {ylock:true, xlock:true},
			axis: [1,0],
			power: 2
		},		
		{
			type: 'thinlens',
			position: [-0.0001, 0],
			id: 'contact',
			aperture: 0.05,
			axis: [1,0],
			power: 0,
			ui: {ylock:true, xlock:true},
			style: {visible: false}
		},
		{
			type: 'real image', // for the far point
			id: 'farpoint',
			light: 'PL',
			lens: 'contact',
			draw(p5, vbox, ppm) {
				p5.fill(255)
				p5.circle(...v2.scale(ppm, this.position), 8, 8)
				p5.stroke(255)
				p5.strokeDash([3,5])
				p5.line(...v2.scale(ppm, this.rays[0].pt), ...v2.scale(ppm, this.position))
				p5.line(...v2.scale(ppm, this.rays[this.rays.length-1].pt), 
				...v2.scale(ppm, this.position))
			},
			style: {
				visible: true,
				z_order: -10
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
			end: 'farpoint',
			ycoord: 2.1*7.8/1000,
			style: {
				labelat: 0.02,
				stroke: 255,
				fill: 255,
				textSize: 16,
				textOffset: [0,10],
				textAlign: ['center', 'bottom']
			}
		},
		{
			type: 'control',
			controlType: 'slider',
			params: [2,15,2,0],
			position:[10,-10],
			bind: {id: 'converger', property:['power']}
		}
	]
}

	let fig3actions = {
		
		toggle(s) {
			s.decorate = s.decorate=='ui'?false:'ui'
		}
	}
new p5(makeP5App(gstate=state, ()=>{}), 'figure3img')
	popout.openButton('Figure3')
	s=state
})()