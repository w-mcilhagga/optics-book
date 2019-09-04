(function() {
	
	let state = {
			w: 520,
			h: 260,
			origin: [250, 130],
			background: [0,61,93],
			ppm: 250,
			items: [
			{
				type: 'parallel light',
				position: [-1,0],
				target: 0,
				raycount: 19,
				spread: 0.9,
				style:{
					arrows:[{pt:[-0.8,0], dir:[0,1]}],
					stroke: [255,255,255,190]
				}
			},
			/*{
				type: 'arc',
				position: [0,0],
				axis: [1,0],
				r: 0.3,
				width: 45
			},*/
			
			{
				type: 'snell arc',
				position: [0,0],
				axis: [-1,0],
				r: 0.5,
				width: 150,
				n_in: 1,
				n_out: 1.5,
				style: {
					strokeWeight: 3
				}
			},
			{
				type: 'barrier',
				position: [-0.5,-0.8,-0.5,-0.4],
				init(state) {
					plugins.barrier.init(state)
					let x = findObject(state,'r').r
					this.position[3]=-x
				}
			},
			{
				type: 'barrier',
				position: [-0.5,0.8,-0.5,0.4],
				init(state) {
					plugins.barrier.init(state)
					let x = findObject(state,'r').r
					this.position[3]=x
				}
			},
			{
				type: 'control',
				controlType: 'slider',
				id: 'checkit',
				params: [0.15, 0.5, 0.5, 0],
				position: [-60,-10],
				width: 120,
				bind: {id: 'r', property: ['r']}
			},
			{
				type: 'control',
				controlType: 'span',
				position: [-60,-30],
				text: 'Aperture Slider',
				style: {
					color: 'white'
				}
			},
			{
				type: 'code',
				id: 'r',
				r: 0.5
			}
			]
		}

	new p5(makeP5App(state), 'figure8img')
	popout.openButton('Figure8')
	
})()