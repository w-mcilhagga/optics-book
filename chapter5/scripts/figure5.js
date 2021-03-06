let fig5actions

(function() {
	
	let power = 2.5,
		position = [-0.6/power,0.1]
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
					position: [...position],
					id: 'rule1',
					target: 0,
					spread: 0,
					raycount: 1,
					off: true,
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
					position: [...position],
					id: 'rule2',
					target: [-1/power,0],
					spread: 0,
					raycount: 1,
					off: true,
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
					end: [-1/power,0],
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
					position: [...position],
					id: 'rule3',
					off: true,
					target: [0,0],
					spread: 0,
					raycount: 1,
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
					id: 'virtualrays',
					light: 'object-top',
					lens: 'L#1',
					style: {
						visible: false
					}
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
						z_order:-10,
						visible: false
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
					params: ['rule 1', false],
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
					params: ['rule 2 (amended)', false],
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
				{
					type: 'control',
					controlType: 'checkbox',
					params: ['virtual rays', false],
					position: [-10, -10],
					style: {
						color: 'white'
					},
					bind: [
						{ id: 'virtualrays', property: ['style','visible'], yes: true, no: false},
						{ id: 'image', property: ['style','visible'], yes: true, no: false}
					]
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
				},
				// image visibility
				{
					type: 'js',
					id: 'code',
					vis: true,
					init(state) {
						this.target = findObject(state, 'image')
						let r1 = !findObject(state, 'rule1').off,
							r2 = !findObject(state, 'rule2').off,
							r3 = !findObject(state, 'rule3').off,
							virt = findObject(state, 'virtualrays').style.visible
						this.vis = ((r1+r2+r3)>1) && virt
					},
					draw() {
						this.target.style.visible = this.vis
					},
					style: {
						z_order: -5
					}
				},
				
			]
		}

	fig5actions = {
		
		toggle(s) {
			s.decorate = s.decorate=='ui'?false:'ui'
		},
		
		check(state, ruleid) {
			let box = findObject(state, ruleid)
			box.control.checked(!box.control.checked())
			box.control.elt.onchange()
		}
	}
	
	new p5(makeP5App(state, fig5actions), 'figure5img')
	
	popout.openButton('Figure5')
	popout.addhelp('Figure5', fig5actions.toggle)

  setTimeout(function() {
	fig5actions.check('rule2check')
  }, 1500)

})()