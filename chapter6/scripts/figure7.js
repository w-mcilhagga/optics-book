(function() {
	
	function blurlum(width, rays, minwidth, maxrays) {
		// relative blur luminance 
		width = Math.max(width, minwidth)
		let r = ((rays-1)/(maxrays-1))/(width/minwidth)
		return r**0.6
	}

	let state = {
			w: 520,
			h: 260,
			origin: [360, 130],
			background: [0,61,93],
			ppm: 200,
			items: [
				{
					type: 'thinlens',
					id: 'L#1',
					power: 4,
					aperture: 0.6,
					axis: [1,0],
					position: [0,0],
					ui: { xlock: true, ylock: true}
				},
				{
					type: 'divergent light',
					position: v2.scale(0.5,[-1.25,0.35]),
					id: 'D#2',
					target: 'L#1',
					spread: 'fill*0.8',
					raycount: 6,
					ui: { xlock: true, ylock: true},
					style: {
						stroke: [255, 170, 0],
						arrows: [{pt:[-0.4,0], dir:[0,1]}, {pt: [-0.05,0],dir:[0,1]}]
					}
				},
				{
					type: 'divergent light',
					position: [-2.5,-0.9],
					id: 'D#3',
					target: 'L#1',
					spread: 'fill*0.8',
					raycount: 6,
					ui: { xlock: true, ylock: true},
					style: {
						stroke: [0, 255, 0],
						arrows: [{pt:[-0.4,0], dir:[0,1]}, {pt: [-0.05,0],dir:[0,1]}]
					}
				},
				{
					type: 'divergent light',
					position: [-1.25,0],
					id: 'D#1',
					target: 'L#1',
					spread: 'fill*0.8',
					raycount: 6,
					ui: { xlock: true, ylock: true},
					style: {
						stroke: [255, 255, 255],
						arrows: [{pt:[-0.4,0], dir:[0,1]}, {pt: [-0.05,0],dir:[0,1]}]
					}
				},
				{
					type: 'barrier',
					position: [1/2.4,-0.5, 1/2.4, 0.5],
					id: 'B#1',
					ui: {ylock: true, xlock: false },
					style: {
						strokeWeight: 4,
						stroke: [190,190,190],
						z_order: -1
					}
				},
				{
					type: 'blur disc',
					barrier: 'B#1',
					light: 'D#1',
					id: 'BD#1'
				},
				{
					type: 'blur disc',
					barrier: 'B#1',
					light: 'D#2',
					id: 'BD#2'
				},
				{
					type: 'blur disc',
					barrier: 'B#1',
					light: 'D#3',
					id: 'BD#3'
				},
				{
					// draw the screen & blur circle
					type: 'p5',
					init(state) {
						this.blur = [findObject(state, 'BD#1'),
							findObject(state, 'BD#2'),
							findObject(state, 'BD#3')]
						this.light = this.blur.map(x=>findObject(state, x.light))
					},
					draw(p5, vbox, ppm) {
						let w = 0.23
						p5.fill(0)
						p5.rect(vbox[1]-ppm*(w+0.02)-15, -ppm*0.4, ppm*(w+0.02)+10, 2*ppm*0.4)
						p5.noStroke()
						p5.blendMode(p5.ADD)
						for (let i=0; i<3; i++) {
							let B = this.blur[i],
								L = this.light[i].style.stroke,
								box = B.blurbox,
								d = box[3]-box[2],
								y = (box[3]+box[2])/2,
								//flux = (B.raycount/6)**2, //[0..1]
								//area = (d/0.15)**2+1,
								//lum = flux/area
								lum = blurlum(d, B.raycount, 0.01, 6)
							p5.fill(L[0], L[1], L[2], 255*lum)
							p5.circle(vbox[1]-ppm*w/2-10, ppm*y, ppm*d+3) // 320 is max x coord
						}
					}
				}
			]
		}
	let actions = {
		toggle(s) {
			s.decorate = s.decorate=='ui'?false:'ui'
		}		
	}
	
	new p5(makeP5App(state, actions), 'figure7img')
	popout.openButton('Figure7')
	popout.addhelp('Figure7', actions.toggle)
})()