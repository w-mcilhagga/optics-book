(function() {
	
	let focus = 1/(1/(-1.5-(-0.25))+2.5)-0.25,
		scrn = 60/300,
		state = {
			w: 520,
			h: 260,
			origin: [200, 130],
			background: [0,61,93],
			ppm: 300,
			items: [
			// red system
				{
					type: 'thinlens',
					id: 'LR',
					power: 2.2,
					aperture: 0.4,
					axis: [1,0],
					position: [-0.25,0],
					ui: { xlock: true, ylock: true},
					style: {visible: false}
				},
				{
					type: 'divergent light',
					position: [-1.5,0],
					id: 'DR',
					target: 'LR',
					spread: 'fill*0.9',
					raycount: 6,
					style: {
						stroke: [255,0,0],
						strokeWeight: 2,
						blendMode: "lighter",
						arrows: [{pt:[-0.4,0], dir:[0,1]}, '']
					}
				},
				{
					type: 'barrier',
					position: [focus,-scrn, focus, scrn],
					id: 'BR',
					ui: {ylock: true, xlock: [focus-0.35, focus+0.3] },
					style: {
						strokeWeight: 4,
						stroke: [190,190,190],
						visible: false
					}
				},
				{
					type: 'blur disc',
					barrier: 'BR',
					light: 'DR',
					id: 'BDR'
				},			// green system
				{
					type: 'thinlens',
					id: 'LG',
					power: 2.5,
					aperture: 0.4,
					axis: [1,0],
					position: [-0.25,0],
					plane: 1,
					ui: { xlock: true, ylock: true},
					style: {visible: false}
				},
				{
					type: 'divergent light',
					position: [-1.5,0],
					id: 'DG',
					target: 'LG',
					spread: 'fill*0.9',
					raycount: 6,
					plane: 1,
					style: {
						stroke: [0,255,0],
						strokeWeight: 2,
						blendMode: "lighter",
						arrows: [{pt:[-0.4,0], dir:[0,1]}, '']
					}
				},
				{
					type: 'barrier',
					position: [focus,-scrn, focus, scrn],
					id: 'BG',
					plane: 1,
					ui: {ylock: true, xlock: [focus-0.35, focus+0.3] },
					style: {
						strokeWeight: 4,
						stroke: [190,190,190],
						visible: false
					}
				},
				{
					type: 'blur disc',
					barrier: 'BG',
					light: 'DG',
					id: 'BDG'
				},
			// blue system
				{
					type: 'thinlens',
					id: 'LB',
					power: 3,
					aperture: 0.4,
					axis: [1,0],
					position: [-0.25,0],
					plane: 2,
					ui: { xlock: true, ylock: true},
					style: {z_order: -1}
				},
				{
					type: 'divergent light',
					position: [-1.5,0],
					id: 'DB',
					target: 'LB',
					spread: 'fill*0.9',
					raycount: 6,
					plane: 2,
					style: {
						stroke: [50,50,255],
						strokeWeight: 2,
						blendMode: "lighter",
						arrows: [{pt:[-0.4,0], dir:[0,1]},'']
					}
				},

				{
					type: 'barrier',
					position: [focus,-scrn, focus, scrn],
					id: 'BB',
					plane: 2,
					ui: {ylock: true, xlock: [focus-0.35, focus+0.3] },
					style: {
						strokeWeight: 4,
						stroke: [190,190,190],
						style: {z_order: 1}
					}
				},
				{
					type: 'blur disc',
					barrier: 'BB',
					light: 'DB',
					id: 'BDB'
				},
				// grouping of barrier
				{
					type: 'group',
					children: ['BR', 'BG', 'BB' ]
				},
				
				{
					// draw the screen & blur circle
					type: 'p5',
					init(state) {
						this.blur = [findObject(state, 'BDR'),
							findObject(state, 'BDG'),
							findObject(state, 'BDB')]
					},
					draw(p5, vbox, ppm) {
						p5.noStroke()
						p5.fill(0)
						p5.rect(vbox[1]-2*ppm*scrn-10, -ppm*scrn, 2*ppm*scrn, 2*ppm*scrn)
						p5.blendMode(p5.ADD)
						let clr = [[255,0,0], [0,255,0], [50, 50, 255]]
						for (let i=0; i<3; i++) {
							let box = this.blur[i].blurbox,
								d = box[3]-box[2],
								flux = (this.blur[i].raycount/6)**2, //[0..1]
								area = (d/0.15)**2+1,
								lum = flux/area
							p5.fill(clr[i][0]*lum, clr[i][1]*lum, clr[i][2]*lum)
							p5.circle(vbox[1]-ppm*scrn-10,0,ppm*d+3) 
						}
					}
				},
				
				// checkboxes to turn lights on/off
				{
					type: 'control',
					controlType: 'checkbox',
					params: ['red', true],
					position: [10, -10],
					bind: { 
						id: 'DR',
						property: ['off'],
						yes: false,
						no: true
					},
					style: {
						color: 'white'
					}
				},
				{
					type: 'control',
					controlType: 'checkbox',
					params: ['green', true],
					position: [60, -10],
					bind: { 
						id: 'DG',
						property: ['off'],
						yes: false,
						no: true
					},
					style: {
						color: 'white'
					}
				},
				{
					type: 'control',
					controlType: 'checkbox',
					params: ['blue', true],
					position: [120, -10],
					bind: { 
						id: 'DB',
						property: ['off'],
						yes: false,
						no: true
					},
					style: {
						color: 'white'
					}
				},				
			]
		}

	let actions = {
		toggle(s) {
			s.decorate = s.decorate=='ui'?false:'ui'
		}		
	}
	
	new p5(makeP5App(state, actions), 'figure11img')
	
	popout.openButton('Figure11')
	popout.addhelp('Figure11', actions.toggle)
})()