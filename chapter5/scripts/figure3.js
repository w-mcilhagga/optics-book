(function() {
	
	let focus = 1/(1/(-1.5-(-0.25))+2.5)-0.25,
		scrn = 40/300,
		state = {
			w: 520,
			h: 260,
			origin: [200, 130],
			background: [0,61,93],
			ppm: 400,
			renderer: 'svg',
			items: [
				{
					type: 'barrier',
					position: [focus,-scrn, focus, scrn],
					id: 'B#2',
					plane: 2,
					ui: {ylock: true, xlock: true },
					style: {
						strokeWeight: 4,
						stroke: [190,190,190],
						z_order: 2,
						visible: false
					}
				},
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
					position: [focus+0.3,-scrn, focus+0.3, scrn],
					id: 'B#1',
					ui: {ylock: true, xlock: true },
					style: {
						strokeWeight: 4,
						stroke: [190,190,190],
						z_order: -1
					}
				},
				{
					type: 'dimension',
					label: 'd',
					start: 'L#1',
					end: 'B#2',
					ycoord: 0.25,
					style: {
						stroke: [255,255,255],
						fill: [255,255,255],
						textOffset: [0,5],
						textAlign: ['center', 'bottom'],
						textSize: 14,
						offset: [[0,0],[-2,0]]
					}
				},
				{
					type: 'dimension',
					label: 's',
					start: 'L#1',
					end: 'B#1',
					ycoord: -0.25,
					style: {
						stroke: [255,255,255],
						fill: [255,255,255],
						textOffset: [0,-5],
						textAlign: ['center', 'top'],
						textSize: 14
					}
				},
				{
					type: 'dimension',
					label: 's - d',
					start: 'B#1',
					end: 'B#2',
					ycoord: 0.25,
					style: {
						stroke: [255,255,255],
						fill: [255,255,255],
						textOffset: [0,5],
						textAlign: ['center', 'bottom'],
						textSize: 14,
						arrows: ['0%'],
						offset: [[0,0],[2,0]]
					}
				},
				{
					type: 'blur disc',
					barrier: 'B#1',
					light: 'D#1',
					id: 'BD#1'
				},
				{
					// copy blur disc size to a dimensions
					type: 'p5',
					init(state) {
						this.blur = findObject(state, 'BD#1')
						this.disc = findObject(state, 'blurdim')
					},
					draw(p5, vbox, ppm) {
						let box = this.blur.blurbox
						this.disc.startpt = [box[0], box[2]]
						this.disc.endpt = [box[1], box[3]]
					}
				},
				{
					type: 'dimension',
					label: 'b',
					id: 'blurdim',
					xcoord: focus+0.3+0.02,
					style: {
						stroke: [255,255,255],
						fill: [255,255,255],
						textOffset: [5, 0],
						textAlign: ['left', 'center'],
						textSize: 14,
						arrows: ['0%', '100%'],
						offset: [[0,0],[0,0]]
					}
				},
			]
		}

	new p5(makeP5App(state), 'figure3img')

})()