
(function() {
let EYE = Gullstrand([0,0], 0),
    pupil = makePupil(EYE, 3)
console.log('x')
let c=[-0.2,0],
    state = {
	w: 520,
	h: 300,
	//maxWidth: 520,
	ppm: 10000,
	origin: [220, 150],
	background: [0, 61, 93],
	items: [
		...EYE,
		...pupil,
		{
			type: 'real image',
			id: 'shell',
			light: 'L1',
			lens: 'back lens',
			shell: [],
			draw(p5, vbox, ppm) {
				this.shell.push(this.position)
				p5.noFill()
				p5.stroke(0)
				p5.strokeWeight(3)
				p5.beginShape(p5.POINTS)
				this.shell.forEach(x=>p5.vertex(...v2.scale(ppm,x)))
				p5.endShape()
				p5.fill(255)
				p5.strokeWeight(1)
				p5.circle(...v2.scale(ppm, this.position), 8, 8)
			},
			style: {
				visible: true
			}
		},
		{
			type: 'parallel light',
			position: [-10/1000,0],
			id: 'L1',
			target: [0+7.8/1000,0],
			raycount: 30+1,
			spread: 0.0041*2,
			ui: {xlock: true},
			style: {
				arrows: ['']
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
