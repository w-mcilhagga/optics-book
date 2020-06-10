let fig3actions

(function() {
	
	let power = 4,
		state = {
			w: 520,
			h: 260,
			origin: [270, 130],
			background: [0,61,93],
			ppm: 300,
			items: [
				// real lens and fake one
				{
					type: 'thinlens',
					id: 'fake',
					power: 3,
					aperture: 0.5,
					plane: 2,
					axis: [1,0],
					position: [0,0.001],
					ui: { xlock: true, ylock: true},
					style: {
						strokeWeight: 3
					}
				},
				{
					type: 'thinlens',
					id: 'L#1',
					power,
					aperture: 10,
					axis: [1,0],
					position: [0,0],
					ui: { xlock: true, ylock: true},
					style: {
						strokeDash: [3, 10],
						stroke: [255,255,255,100]
					}
				},
				// three rays
				{
					type: 'divergent light',
					position: [-0.8,0.2],
					id: 'rule1',
					target: 0,
					spread: 0,
					raycount: 1,
					ui: {xlock:[-Infinity, -1/power]},
					off: false,
					style: {
						arrows: ['50%',''],
						strokeWeight: 2,
						stroke: [255, 50, 50],
					}
				},
				{
					type: 'js', // fixes rule 2
					init(state) {
						// changes rule 2 depending on the object position
						let obj = findObject(state, 'rule2')
						if (obj.position[0]>-1/power) {
							// switch target to an angle 
							obj.target = (180/Math.PI)*v2.angle(
									v2.sub(obj.position,[-1/power, 0]))
						} else {
							obj.target = [-1/power, 0]
						}
						findObject(state, 'rule2dim').style.visible = !obj.off
					}
				},
				{
					type: 'divergent light',
					position: [-0.8,0.2],
					id: 'rule2',
					target: [-1/power,0],
					spread: 0,
					raycount: 1,
					ui: {xlock:[-Infinity, -1/power]},
					off: false,
					style: {
						stroke: [0,255,0],
						strokeWeight: 2,
						arrows: ['50%','']
					}
				},
				{ 
					type: 'dimension',
					id: 'rule2dim',
					start: 'rule2',
					end: [-1/power, 0],
					label: ' ',
					arrows: [],
					style: {
						stroke: [0,255,0],
						strokeWeight: 1,
						strokeDash: [4, 4],
						visible: true
					}
				},
				{
					type: 'divergent light',
					position: [-0.8,0.2],
					id: 'rule3',
					off: true,
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
				{
					type: 'group',
					id: 'object-top',
					children: ['rule1', 'rule2', 'rule3']
				},
				{
					type: 'virtual image',
					light: 'object-top',
					lens: 'L#1'
				},
				// object & image
				{
					type: 'js',
					init(state) {
						let p = findObject(state, 'rule1').position
						findObject(state,'object').start = [p[0],0]
						findObject(state,'object').end = [...p]
						let img = 1/(1/p[0]+power)
						findObject(state,'image').start = [img,0]
						findObject(state,'image').end = [img, p[1]*img/p[0]]
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
					type: 'js',
					init(state) {
						let r1 = !findObject(state, 'rule1').off,
							r2 = !findObject(state, 'rule2').off,
							r3 = !findObject(state, 'rule3').off
						findObject(state, 'image').style.visible = (r1+r2+r3)>1
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
				// controls for each rule
				{
					type: 'control',
					controlType: 'checkbox',
					id: 'rule1check',
					params: ['rule 1', true],
					position: [10, -50],
					style: {
						color: 'rgb(255,50,50)'
					},
					bind: { id: 'rule1', property: ['off'], yes: false, no: true}
				},
				{
					type: 'control',
					controlType: 'checkbox',
					id: 'rule2check',
					params: ['rule 2', true],
					position: [10, -30],
					style: {
						color: 'rgb(0,255,0)'
					},
					bind: { id: 'rule2', property: ['off'], yes: false, no: true}
				},
				{
					type: 'control',
					controlType: 'checkbox',
					params: ['rule 3', false],
					position: [10, -10],
					style: {
						color: 'rgb(220,220,0)'
					},
					bind: { id: 'rule3', property: ['off'], yes: false, no: true}
				},
				// focal points
				{
					type: 'p5',
					draw(p5, vbox, ppm) {
						p5.noStroke()
						p5.fill(255)
						p5.circle(ppm/power, 0, 10)
						p5.circle(-ppm/power, 0, 10)
					}
				}
				
			]
		}

	fig3actions = {
		
		toggle(s) {
			s.decorate = s.decorate=='ui'?false:'ui'
		},
		
		check(state, ruleid) {
			let box = findObject(state, ruleid)
			box.control.checked(!box.control.checked())
			box.control.elt.onchange()
		}
	}
	
	new p5(makeP5App(state, fig3actions), 'interactimg')
	
	popout.addhelp('Interact', fig3actions.toggle)
})()