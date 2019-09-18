
(function() {

let state = {
	w: 520,
	h: 250,
	ppm: 10000,
	origin: [220, 100],
	background: [0, 61, 93],
	items: [
		{
			type: 'data',
			id: 'data',
			vergence: 0.1,
			init(state) {
				findObject(state,'L1').position[0] = -1/this.vergence
			},
			style: {z_order:100}
		},
		{
			type: 'divergent light',
			position: [-0.125,0],
			id: 'L1',
			target: 'lens1',
			spread: 'fill*0.7',
			raycount: 10,
			style: {
				arrows: ['']
			}
		},
		{
			type: 'thinlens',
			id: 'lens1',
			position: [0,0],
			aperture: 0.015,
			axis: [1,0],
			power: 45,
			ui: {ylock: true, xlock: [-Infinity, 0]}
		},
		{
			type: 'barrier',
			position: [1/45, -0.015/2, 1/45, 0.015/2],
			ui: {xlock: true, ylock: true}
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
		{
			type: 'real image',
			id: 'shell',
			light: 'L1',
			lens: 'lens1',
			draw(p5, vbox, ppm) {
				if (Math.abs(this.position[0]-1/45)<0.0001) {
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
	]
}

	let fig6actions = {
		toggle(s) {
			s.decorate = s.decorate=='ui'?false:'ui'
		}
	}

new p5(makeP5App(state, fig6actions), 'figure6img')
popout.addhelp('Figure6', fig6actions.toggle)
	
})()
