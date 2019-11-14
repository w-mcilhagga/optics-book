var s
(function() {
	
let mode='10D axial',
	k = 1/0.89,
	divlight = false,
	hypercheck = false,
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
	h: 340,
	//maxWidth: 700,
	ppm: 4000,
	origin: [510-370, 240],
	background: [0, 61, 93],
	items: [
		...translate(EYE, 0, offset),
		...translate(pupil, 0, offset),
		{
			type: 'parallel light',
			position: [-0.04,offset],
			id: 'PL',
			target: 'front cornea_t',
			target_spread: 0.012,
			spread: 0.01,
			raycount: 9,
			ui: {ylock:true, xlock:true},
			style: {
				arrows: ['']
			}
		},
		{
			type: 'thinlens',
			position: [-0.06, offset],
			id: 'converger',
			aperture: 0.02,
			ui: {ylock:true, xlock:true},
			axis: [1,0],
			power: 1/(0.06+0.08)+0.1
		},
		{
			type: 'real image', // for the actual image
			id: 'shell',
			light: 'PL',
			lens: 'back lens_t',
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
			type: 'thinlens',
			position: [-0.0001, offset],
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
			type: 'dimension',
			start: 'contact',
			end: 'farpoint',
			ycoord: 1.9*7.8/1000+offset,
			style: {
				labelat: 0.02,
				stroke: 255,
				fill: 255,
				textSize: 16,
				textOffset: [0,10],
				textAlign: ['center', 'bottom']
			}
		},
		...EYE,
		...pupil,
		{
			type: 'parallel light',
			position: [-0.04,0],
			id: 'PL2',
			target: 'front cornea',
			target_spread: 0.012,
			spread: 0.01,
			raycount: 9,
			ui: {ylock:true, xlock:true},
			style: {
				arrows: ['']
			}
		},
		{
			type: 'thinlens',
			position: [-0.02, 0],
			id: 'specs',
			aperture: 0.02,
			ui: {ylock:true, xlock:false},
			axis: [1,0],
			power: 1/0.09
		},
		{
			type: 'real image', // for the actual image
			id: 'shell',
			light: 'PL2',
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
			type: 'real image', // for the focal pt
			id: 'focalpt',
			light: 'PL2',
			lens: 'specs',
			draw(p5, vbox, ppm) {
				p5.fill(255)
				p5.circle(...v2.scale(ppm, this.position), 8, 8)
			},
			style: {
				visible: true,
				z_order: -10
			}
		},
		{
			type: 'real image', // for the focal point
			id: 'farpt2',
			light: 'PL2',
			lens: 'specs',
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
			type: 'dimension',
			start: 'specs',
			end: 'focalpt',
			ycoord: +1.9*7.8/1000-0.002,
			label: 'f = 0.09m',
			style: {
				labelat: '50%',
				stroke: 255,
				fill: 255,
				textSize: 16,
				textOffset: [0,8],
				textAlign: ['center', 'bottom']
			}
		},		
		{
			type: 'dimension',
			start: 'specs',
			end: 'contact',
			ycoord: -1.9*7.8/1000+0.002,
			style: {
				labelat: '50%',
				stroke: 255,
				fill: 255,
				textSize: 16,
				textOffset: [0,-10],
				textAlign: ['center', 'top']
			}
		},		
		/*		{
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
		}*/
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