var s
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

function translate(obj, dx, dy) {
	return [...obj].map(function(x) {
		let y = plugins.create(Object.assign({},x))
		y.position = [...x.position]
		y.ui = {xlock: false, ylock: false}
		y.move(dx, dy)
		y.ui = Object.assign({},x.ui)
		y.id = y.id+'_t'
		return y
	})
}

let c=[-0.2,0],
    offset = 35/1000,
    state = {
	w: 510,
	h: 320,
	//maxWidth: 700,
	ppm: 4000,
	origin: [380, 220],
	background: [0, 61, 93],
	items: [
		...EYE,
		...pupil,
		...translate(EYE, 0, offset),
		...translate(pupil, 0, offset),
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
			id: 'shell_t',
			light: 'DL',
			lens: 'back lens_t',
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
			position: [-0.04,0],
			power: 0,
			aperture: 0.015,
			axis: [1,0],
			ui: {ylock: true, xlock:[-5,-0.0024]},
			style: {visible: false}
		},
		{
			type: 'virtual image',
			id: 'specsf',
			light: 'PL',
			lens: 'specs',
			step: 2,
			style: {
				stroke: [255, 255, 0],
				strokeDash: [],
				visible: true
			}
		},
		// the far-point light
		{
			type: 'divergent light',
			position: [-0.064,offset],
			id: 'DL',
			target: 'front cornea_t',
			spread: 'fill*1.1',
			raycount: 11,
			ui: {ylock:true, xlock:true},
			off: false,
			style: {
				visible: true,
				arrows: ['']
			}
		},
		{
			type: 'barrier',
			id: 'front vertex', // used for dimensions
			position: [0,-1,0,1],
			plane: 3,
			style: {visible: false},
			ui: {xlock:true, ylock:true}
		},
		// specs dimensions
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
				visible: false
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
				visible: false
			}
		},
		// far point dimension
		{
			type: 'dimension',
			start: 'front vertex',
			end: 'DL',
			id: 'farpoint',
			ycoord: 1.3*7.8/1000+offset,
			style: {
				stroke: 255,
				fill: 255,
				textSize: 16,
				textOffset: [0,10],
				textAlign: ['center', 'bottom'],
				offset: [[0,0],[0,0]],
				visible: true
			}
		},
		
		{
			type: 'control',
			controlType: 'checkbox',
			params: ['Spectacle lens', false],
			position:[10,-10],
			bind: [
				{id: 'specs', property: ['style','visible'], 'no':false, 'yes':true},
				{id: 'specs', property: ['power'], 'no':0, 'yes':-20},
				{id: 'specdist', property: ['style','visible'], 'no':false, 'yes':true},
				{id: 'focallen', property: ['style','visible'], 'no':false, 'yes':true},
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
	s = state
})()