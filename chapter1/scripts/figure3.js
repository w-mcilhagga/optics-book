state = {
    dragtarget: false,
    w: 700,
    h: 290,
    origin: [
        620,
        135
    ],
    ppm: 270,
    background: [0, 61, 92],
	renderer: 'svg',
	
    items: [
        {
            type: 'divergent light',
            id: 'light#1',
            position: [-0.5, 0],
            target: 'lens#1',
            spread: 'fill*0.9',
            raycount: 9,
            ui: {xlock:true, ylock:true},
            style: {
                color: [255,255,255],
				strokeWidth: 1,
				arrows: [-0.1]
            }
        },
		{
			type: 'thinlens',
			id: 'lens#1',
			position: [0,0],
			axis: [1,0],
			aperture: 0.6,
			power: 2,
			ui: {xlock:true, ylock:true},
            style: {
				color:[180,180,255],
				z_order: -2
			},
			draw: drawOvalLens
		},
		{
			type: 'p5',
			draw(p5, vbox, ppm) {
				p5.noStroke()
				p5.fill(...state.background)
				p5.rect(0,-100,100,200)
			},
			style: {
				z_order: -1.5
			}
		},
		{
			type: 'dimension',
			id: 'label1',
			start: 'lens#1',
			end: 'light#1',
			ycoord: -0.4,
			label: 'short distance',
			
			style: {
				textSize: 20,
				stroke: [255,255,255]
			}
		},
		{
			type: 'text',
			id: 'label2',
			position: [(350-620)/270,(290-135-40)/270],
			text: 'High Divergence',
			style: {
				textSize: 20
			}
		}
    ]
}


