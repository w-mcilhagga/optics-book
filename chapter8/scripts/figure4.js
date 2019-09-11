(function(){

let state = {
	w: 520,
	h: 250,
	maxWidth: 700,
	ppm: 300,
	origin: [260, 125],
	background: [0, 61, 93],
	items: [
		{
			type: 'thinlens',
			id: 'L1',
			position: [0,0],
			axis: [1,0],
			aperture: 0.4,
			power: 1.5,
			ui: {xlock:true, ylock:true}
		},
		{
			type: 'parallel light',
			position: [-0.5,0],
			id: 'P1',
			target: 'L1',
			raycount: 10,
			spread: 'fill*0.9',
			ui: {xlock: true},
			style: {
				arrows: ['']
			}
		},
		{
			type: 'real image',
			id: 'shell',
			light: 'P1',
			lens: 'L1',
			shell: [],
			draw(p5, vbox, ppm) {
				this.shell.push(this.position)
				this.shell.sort((a,b) => a[1]-b[1])
				p5.noFill()
				p5.stroke([255,255,0])
				p5.beginShape(p5.POINTS)
				this.shell.forEach(x=>p5.vertex(...v2.scale(ppm,x)))
				p5.endShape()
				p5.fill(255)
				p5.circle(...v2.scale(ppm, this.position), 8, 8)
			},
			style: {
				visible: true,
			}
		},
	]
}
	let fig4actions = {
		
		toggle(s) {
			s.decorate = s.decorate=='ui'?false:'ui'
		}
	}
	
new p5(makeP5App(state, fig4actions), 'figure4img')
	//popout.openButton('Figure4')
	popout.addhelp('Figure4', fig4actions.toggle)
})()
