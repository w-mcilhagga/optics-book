<script>
	
	let power = 4,
		state = {
			w: 520,
			maxWidth:520,
			h: 260,
			origin: [270, 130],
			background: [0,61,93],
			renderer: 'svg',
			ppm: 300,
			items: [
				// real lens and fake one
				{
					type: 'thinlens',
					id: 'L#1',
					power: 3,
					aperture: 0.5,
					axis: [1,0],
					position: [0,0.001],
					ui: { xlock: true, ylock: true},
					style: {
						strokeWeight: 3
					}
				},
				// a ray
				{
					type: 'divergent light',
					position: [-0.6,0.3],
					id: 'rule3',
					off: false,
					target: [0,0],
					spread: 0,
					raycount: 1,
					ui: {xlock:[-Infinity, -1/power]},
					style: {
						stroke: [220,220,0],
						strokeWeight: 2,
						arrows: ['50%','']
					}
				},
				// object & image
				{
					type: 'js',
					init(state) {
						let p = findObject(state, 'rule3').position
						findObject(state,'object').start = [p[0],0]
						findObject(state,'object').end = [...p]
						let img = 1/(1/p[0]+power)
						findObject(state,'image').start = [img,0]
						findObject(state,'image').end = [img, p[1]*img/p[0]]
						findObject(state, 'end').position = [img,-5,img,5]
					}
				},
				{
					type: 'barrier',
					id: 'end',
					position: [1,-5, 1, 5],
					style: {
						visible:false
					}
				},
				{
					type: 'dimension',
					id: 'object',
					start: [],
					end: [],
					label: ' ',
					style: {
						stroke: [255, 255, 255],
						strokeWeight: 5,
						arrowLength: 10,
						arrowWidth: 5,
						z_order:-1
					}				
				},
				{
					type: 'dimension',
					id: 'image',
					start: [],
					end: [],
					label: ' ',
					style: {
						stroke: [200, 200, 255],
						strokeWeight: 5,
						arrowLength: 10,
						arrowWidth: 5,
						z_order:-1,
						visible: true
					}				
				},
				// optic axis
				{
					type: 'dimension',
					start: [-2,0],
					end: [2,0],
					label: ' ',
					style: {
						stroke: [255, 255, 255],
						strokeDash: [5,5]
					}
				},

			]
		};
	
	makeP5App(state)(window)
</script>