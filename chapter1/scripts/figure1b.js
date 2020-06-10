state.items = state.items.concat(
		[
		{	
			type:'barrier',
			id:'screen',
			position:[0.97,-0.32,0.97,0.44], 
			ui: {xlock:true, ylock:true},
			style:{strokeWeight:4},
			blur: ['light#1', 'light#2']
		},
	{
		type: 'p5',
		position: [0.96, 0.185],
		style: {
			z_order: 2
		},
		draw: function(p5, vbox, ppm) {

			p5.noStroke()
			p5.fill(255)
			p5.textSize(15)
			p5.textAlign(p5.RIGHT)
			p5.yup_text('A', ...v2.scale(ppm, v2.add(this.position, [-0.02,0.03])))
			p5.strokeWeight(2)
			p5.stroke(255)
			p5.noFill()
			p5.circle(...v2.scale(ppm, this.position), 10)
		}
	},
	{
		type: 'p5',
		position: [0.96, -0.035],
		style: {
			z_order: 2
		},
		draw: function(p5, vbox, ppm) {

			p5.noStroke()
			p5.textSize(15)
			p5.fill(255)
			p5.textAlign(p5.RIGHT)
			p5.yup_text('B', ...v2.scale(ppm, v2.add(this.position, [-0.02,0.03])))
			p5.strokeWeight(2)
			p5.stroke(255)
			p5.noFill()
			p5.circle(...v2.scale(ppm, this.position), 10)
		}
	},
    ]
)

