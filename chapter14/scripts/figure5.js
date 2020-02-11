
(function() {
let EYE = Gullstrand([0,0], 0),
    pupil = makePupil(EYE, 3)

let c=[-0.2,0],
    state = {
	w: 520,
	h: 280,
	//maxWidth: 520,
	ppm: 8000,
	origin: [320, 140],
	background: [0, 61, 93],
	items: [
		...EYE,
		...pupil,
		{
			type: 'parallel light',
			position: [-10/1000,0],
			id: 'L1',
			target: [0+7.8/1000,0],
			raycount: 3,
			spread: 0.002,
			ui: {xlock: true},
			style: {
				stroke: [100,255,100],
				arrows: [-0.02,'']
			}
		},
		{
			type: 'real image',
			id: 'shell',
			light: 'L3',
			lens: 'back lens',
			shell: [],
			draw(p5, vbox, ppm) {
				// positions are:
				// L1: [0.02410327310274386, 0]
				// L2: [0.023941186804882376, -0.0018467135356172832]
				// L3: [0.023895511709945833, 0.0018407423061329773]
				console.log(this.position)
			},
			style: {
				visible: true
			}
		},
		{
			type: 'parallel light',
			position: [-10/1000,0.002],
			id: 'L2',
			target: [0+7.8/1000,0],
			raycount: 3,
			spread: 0.002,
			ui: {xlock: true},
			style: {
				stroke: [255,200,0],
				arrows: [-0.02,'']
			}
		},
		{
			type: 'parallel light',
			position: [-10/1000,-0.002],
			id: 'L3',
			target: [0+7.8/1000,0],
			raycount: 3,
			spread: 0.002,
			ui: {xlock: true},
			style: {
				stroke: [0,255,255],
				arrows: [-0.02,'']
			}
		},
	]
}

	let fig5actions = {
		
		toggle(s) {
			s.decorate = s.decorate=='ui'?false:'ui'
		}
	}

new p5(makeP5App(state, fig5actions), 'figure5img')
	popout.openButton('Figure5')
	popout.addhelp('Figure5', fig5actions.toggle)
})()
