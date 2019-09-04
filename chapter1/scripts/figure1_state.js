f3_state = {
    dragtarget: false,
    oldpt: [
        -1.03,
        0.13
    ],
    renderer: "p2d",
    w: 520,
    h: 300,
    origin: [
        305,
        180
    ],
    ppm: 200,
    background: [0, 61, 92],
	
	figure: 'figure1',
	
    items: [
		{
			type: 'p5',
			position: [-0.3, 0.82],
			id: 'the main light source plus two rays',
			style: {
				z_order: 2
			},
			draw: function(p5, vbox, ppm) {
				let d = findObject(f3_state,'light#1'),
					r = {type:'ray', path:[this.position, d.position], style:{color:[255,255,255],strokeWeight:2, arrows:['70%']}, 'from':d}
				plugins.ray.draw.call(r, p5, vbox, ppm)
				d = findObject(f3_state,'light#2')
				r = {type:'ray', path:[this.position, d.position], style:{color:[255,255,255], strokeWeight:2, arrows:['70%']}, 'from':d}
				plugins.ray.draw.call(r, p5, vbox, ppm)
				p5.noStroke()
				p5.fill(255)
				p5.circle(...v2.scale(ppm, this.position), 20)
			}
		},
        {
            type: 'image',
            id: 'apple',
            position: [-1.5+0.1,0.25-0.05,0.5-0.1,0.5-0.1],
            image: 'scripts/apple.png'
        },
        {
            type: 'divergent light',
            id: 'light#2',
            position: [-1.05, 0.135],
            target: [0.025,0.04],
            spread: 50,
            raycount: 9,
            ui: {xlock: true, ylock:[-0.125, 0.135]},
            style: {
                stroke: [255,150,100,200],
				strokeWeight: 2,
                'arrows': [{pt:[-0.3,0], dir:[0,1]},'']
            }
        },
        {
            type: 'divergent light',
            id: 'light#1',
            position: [-1.035, -0.125],
            target: [0.025,0.04],
            spread: 50,
            raycount: 9,
            ui: {xlock:true, ylock:[-0.125, 0.135]},
            style: {
				stroke: [255,255,150,200],
                strokeWeight: 2,
                'arrows': [{pt:[-0.5,0], dir:[0,1]},'']
            }
        },
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
			// work out position
			if (f3_state.figure!=='figure1') {
				let b = blurstats(findObject(f3_state, 'screen'), 'light#1')
				if (!b) return
				this.position = b.median
			}
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
			if (f3_state.figure!=='figure1') {
				let b = blurstats(findObject(f3_state, 'screen'), 'light#2')
				if (!b) return
				this.position = b.median
			}
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
}


function blurstats(B, id) {
	// returns mean, median, range of intersections of light id with barrier B
	let b = B.temp.blur
	b = b && b[id]
	if (!b) return
	let x = [], y = []
	b.map(x=>x.pt).forEach(function(p) { x.push(p[0]); y.push(p[1]) })
	x.sort()
	y.sort()
	let mid = Math.floor(x.length/2), 
		median = [], 
		mean = [0,0], 
		range = []
	median[0] = x.length % 2 !== 0 ? x[mid] : (x[mid - 1] + x[mid]) / 2
	median[1] = y.length % 2 !== 0 ? y[mid] : (y[mid - 1] + y[mid]) / 2
	range[0] = x[x.length-1]-x[0]
	range[1] = y[y.length-1]-y[0]
	for (let i=0; i<x.length; i++) {
		mean = v2.add(mean, [x[i],y[i]])
	}
	mean = v2.scale(1/x.length, mean)
	return {mean, median, range, 'from':b[0]['from']}
}
