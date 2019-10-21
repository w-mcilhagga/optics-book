(function() {
	
	let state = {
			w: 520,
			h: 260,
			origin: [330, 130],
			background: [0,61,93],
			ppm: 300,
			renderer: 'svg',
			items: [
				{
					type: 'thinlens',
					id: 'L#1',
					power: 2.5,
					aperture: 0.4,
					axis: [1,0],
					position: [0,0],
					ui: { xlock: true, ylock: true}
				},
				{
					type: 'divergent light',
					position: v2.scale(1.8,[-0.5,0.1]),
					id: 'D#1',
					target: [0,0],
					spread: 0,
					raycount: 1,
					style: {
						stroke: [200, 200, 0],
						strokeWeight: 2,
						arrows: [{pt:[-0.2,0], dir:[0,1]}, {pt: [0.2,0],dir:[0,1]}]
					}
				},
				{
					type: 'divergent light',
					position: v2.scale(1.8,[-0.5,-0.1]),
					id: 'D#2',
					target: [0,0],
					spread: 0,
					raycount: 1,
					style: {
						stroke: [200, 200, 0],
						strokeWeight: 2,
						arrows: [{pt:[-0.2,0], dir:[0,1]}, {pt: [0.2,0],dir:[0,1]}]
					}
				},
				{
					type: 'barrier',
					position: [0.5,-0.2, 0.5, 0.2],
					id: 'B#1',
					ui: {ylock: true, xlock: true },
					style: {
						strokeWeight: 4,
						stroke: [190,190,190]
					}
				},
				{
					type: 'dimension',
					start: [0, 0.25],
					end: [0.5, 0.25],
					label: 'd',
					style: {
						stroke: [255,255,255],
						textAlign: ['left', 'bottom'],
						textOffset: [0, 10],
						textSize: 14
					}
				},
				{
					type: 'dimension',
					start: [0.53, 0.1],
					end: [0.53, -0.1],
					label: 'h',
					style: {
						stroke: [255,255,255],
						arrows: ['0%', '100%'],
						textAlign: ['left', 'center'],
						textOffset: [5, 0],
						textSize: 14
					}
				}
			]
		}

	new p5(makeP5App(state), 'figure5img')

})()