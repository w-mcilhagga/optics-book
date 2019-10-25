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
			h: 290,
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
					raycount: 10,
					style: {
						arrows: [{pt:[-0.4,0], dir:[0,1]}, {pt: [-0.05,0],dir:[0,1]}]
					}
				},
				{
					type: 'barrier',
					position: [focus-0.2,-scrn, focus-0.2, scrn],
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
							lum = blurlum(d, this.blur.raycount, 0.01, 10)
						p5.noStroke()
						p5.fill(0)
						p5.rect(vbox[1]-2*ppm*scrn-10, -ppm*scrn, 2*ppm*scrn, 2*ppm*scrn)
						p5.fill(255,255,255,255*lum)
						//p5.fill(255,255,255,255*((this.blur.raycount-1)/(d+1/400))**2/73**2)
						p5.circle(vbox[1]-ppm*scrn-10,0,ppm*d+3) // 320 is max x coord
					}
				},
				// the aperture stop
				{
					id: 'aperture',
					r: 0.2
				},
				{
					type: 'barrier',
					position: [-0.21, -0.3, -0.21, -this.r],
					id: 'stop1',
					style: {strokeWeight: 5, z_order:-2},
					init(state) {
						plugins.barrier.init.call(this,state)
						this.position[3] = -findObject(state,'aperture').r
					},
					ui: { xlock: true, ylock: true}
				},
				{
					type: 'barrier',
					position: [-0.21, 0.3, -0.21, this.r],
					id: 'stop2',
					style: {strokeWeight: 5, z_order:-2},
					init(state) {
						plugins.barrier.init.call(this,state)
						this.position[3] = findObject(state,'aperture').r
					},
					ui: { xlock: true, ylock: true}

				},
				{
					type: 'control',
					controlType: 'slider',
					params: [0.05, 0.2, 0.2, 0],
					position: [100,-10],
					width: 200,
					bind: {id: 'aperture', property: ['r'] }
				}
			]
		}

	let actions = {
		toggle(s) {
			s.decorate = s.decorate=='ui'?false:'ui'
		}		
	}
	
	new p5(makeP5App(state, actions), 'figure4img')
	popout.openButton('Figure4')
	popout.addhelp('Figure4', actions.toggle)
	
})()