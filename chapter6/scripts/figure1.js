(function() {
	
	function blurlum(width, rays, minwidth, maxrays) {
		// relative blur luminance 
		width = Math.max(width, minwidth)
		let r = ((rays-1)/(maxrays-1))/(width/minwidth)
		return r**0.6
	}
	
	let focus = 1/(1/(-1.5-(-0.25))+2.5)-0.25,
		scrn = 40/300,
		state = {
			w: 520,
			h: 260,
			origin: [200, 130],
			background: [0,61,93],
			ppm: 300,
			items: [
				{
					type: 'thinlens',
					id: 'L#1',
					power: 2.5,
					aperture: 0.4,
					axis: [1,0],
					position: [-0.25,0],
					ui: { xlock: true, ylock: true}
				},
				{
					type: 'divergent light',
					position: [-1.5,0],
					id: 'D#1',
					target: 'L#1',
					spread: 'fill*0.9',
					raycount: 6,
					style: {
						arrows: [{pt:[-0.4,0], dir:[0,1]}, {pt: [-0.05,0],dir:[0,1]}]
					}
				},
				{
					type: 'barrier',
					position: [focus,-scrn, focus, scrn],
					id: 'B#1',
					ui: {ylock: true, xlock: [focus-0.35, focus+0.35] },
					style: {
						strokeWeight: 4,
						stroke: [190,190,190]
					}
				},
				{
					type: 'blur disc',
					barrier: 'B#1',
					light: 'D#1',
					id: 'BD#1'
				},
				{
					// draw the screen & blur circle
					type: 'p5',
					init(state) {
						this.blur = findObject(state, 'BD#1')
					},
					draw(p5, vbox, ppm) {
						let box = this.blur.blurbox,
							d = box[3]-box[2],
							lum = blurlum(d, this.blur.raycount, 0.01, 6)
						p5.noStroke()
						p5.fill(0)
						p5.rect(vbox[1]-2*ppm*scrn-10, -ppm*scrn, 2*ppm*scrn, 2*ppm*scrn)
						p5.fill(255,255,255,255*lum)
						p5.circle(vbox[1]-ppm*scrn-10,0,ppm*d+3) // 320 is max x coord
					}
				}
			]
		}

	let actions = {
		toggle(s) {
			s.decorate = s.decorate=='ui'?false:'ui'
		}		
	}
	
	new p5(makeP5App(state, actions), 'figure1img')
	
	popout.openButton('Figure1')
	popout.addhelp('Figure1', actions.toggle)
})()