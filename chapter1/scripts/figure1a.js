let state = {
    dragtarget: false,
    oldpt: [
        -1.03,
        0.13
    ],
    renderer: "svg",
    w: 700,
    h: 400,
    origin: [
        405,
        242
    ],
    ppm: 270,
    background: [0, 61, 92],
	
	figure: 'figure1',
	
    items: [
		{
			type: 'p5',
			position: [-0.3, 0.82],
			id: 'the main light source plus two rays',
			style: {
				z_order: -2
			},
			draw: function(p5, vbox, ppm) {
				let d = findObject(state,'light#1'),
					r = {type:'ray', 
						path:[this.position, d.position], 
						style:{
							stroke:[255,255,255],
							strokeWeight:2, 
							arrows:['70%']
						}, 
						'from':{} // dummy source
					}
				plugins.ray.draw.call(r, p5, vbox, ppm)
				d = findObject(state,'light#2')
				r = {type:'ray', 
					 path:[this.position, d.position], 
					 style:{
						stroke:[255,255,255], 
						strokeWeight:2, 
						arrows:['70%']
					}, 
					 'from':{}
				}
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
            image: 'apple.png',
			ui: {xlock:true, ylock:true},
			style: {z_order: -10}
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
    ]
}
