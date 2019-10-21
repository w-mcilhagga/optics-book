(function() {
	
	let state = {
			w: 520,
			h: 300,
			origin: [250, 150],
			background: [0,61,93],
			ppm: 200,
			minWidth:400,
			maxWidth:700,
			items: [
			{
				type: 'parallel light',
				position: [-0.5-0.3,0.3],
				target: [-0.5,0],
				raycount: 9,
				spread: 0.26,
				ui: {xlock: true},
				style:{
					arrows:[{pt:[-0.7,0], dir:[0,1]}],
					stroke: [255,255,255,190]
				}
			},
			
			{
				type: 'snell arc',
				position: [0,0],
				axis: [-1,0],
				r: [0.5, 0.5],
				width: 160,
				n_in: 1,
				n_out: 1.5,
				ui: {xlock: true, ylock: true},
				style: {
					strokeWeight: 3,
					fill: [100,100,200],
					ellipseMode: 'open'
				}
			},/*
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
				position: [-120,-30],
				width: 100,
				bind: {id: 'r', property: ['r']}
			},
			{
				type: 'control',
				controlType: 'span',
				position: [-120,-50],
				text: 'Aperture Slider',
				style: {
					color: 'white'
				}
			},
			{
				type: 'code',
				id: 'r',
				r: 0.5
			}*/

			]
		}
		
	let actions = {
		toggle(s) {
			s.decorate = s.decorate=='ui'?false:'ui'
		}		
	}
	
	new p5(makeP5App(state, actions), 'figure9img')
	popout.openButton('Figure9')
	popout.addhelp('Figure9', actions.toggle)
})()