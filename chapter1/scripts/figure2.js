
let state = {
    dragtarget: false,
    oldpt: [
        -1.03,
        0.13
    ],
    renderer: "svg",
    w: 700,
    h: 290,
    origin: [
        95,
        135
    ],
    ppm: 270,
    background: [0, 61, 92],
	
    items: [
        {
            type: 'parallel light',
            id: 'light#1',
            position: [-1, 0],
            target: 'lens#1',
            spread: 'fill*0.9',
            raycount: 9,
            ui: {},
            style: {
                color: [255,255,255],
				strokeWidth: 1,
				arrows: ['','30%']
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
			draw(p5, P, vbox, ppm) {
				p5.noStroke()
				p5.fill(...state.background)
				p5.rect(-state.origin[0], -100, state.origin[0], 200)
			},
			style: {
				z_order: -1
			}
		},
		{
			type: 'barrier',
			id: 'barrier#1',
			ui: {ylock:true, xlock:true},
			position:[1/2,-3,1/2,3],
			style: { 
				stroke: [0,0,0,0]
			}
		},
		{
			type: 'dimension',
			id: 'label1',
			start: 'lens#1',
			end: 'barrier#1',
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
			position: [(350-95)/270,(290-135-40)/270],
			text: 'High Convergence',
			style: {
				textSize: 20
			}
		}
    ]
}



