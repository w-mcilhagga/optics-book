(function(data) {

let state = {
    dragtarget: false,
    oldpt: [
        -1.03,
        0.13
    ],
    w: 520,
    h: 250,
    origin: [
        225,
        120
    ],
    ppm: 200,
    background: [0, 61, 92],
	
    items: [
		{
			type: 'js',
			init(state) {
				// place barrier at right location
				let D = findObject(state, 'light#1'),
					L1 = findObject(state, 'lens#1'),
					L2 = findObject(state, 'lens#2'),
					B = findObject(state, 'barrier#1')
				
				// swap around
				if (L1.position[0]>L2.position[0]) {
					[L1, L2] = [L2, L1]
				}
				
				findObject(state, 'img dimension').start = L2.id
				
				let Vin1  = 1/(D.position[0]-L1.position[0]),
					Vout1 = Vin1+L1.power,
					img1  = 1/Vout1,
					Vin2  = 1/(img1-(L2.position[0]-L1.position[0])),
					Vout2 = Vin2 + L2.power,
					img2 = 1/Vout2
				
				if (img2<0) {
					B.plane = 1 //img2 = 2.345
				}
				B.position[0] = B.position[2] = L2.position[0]+img2
			}
		},
        {
            type: 'divergent light',
            id: 'light#1',
            position: [-1, 0],
            target: 'lens#1',
            spread: 'fill*0.8',
            raycount: 6,
            ui: {ylock:true},
            style: {
                stroke: [190,190,255],
				strokeWidth: 1,
				arrows: ['60%','60%']
            }
        },
		{
			type: 'thinlens',
			id: 'lens#1',
			position: [-0.25,0],
			axis: [1,0],
			aperture: 0.6,
			power: 2,
			ui: {ylock:true},
            style: {
				stroke:[255,255,255],
				strokeWeight:3,
				z_order: 2,
				virtualStroke: [190, 190, 0]
			}
		},
		{
			type: 'dimension',
			start: 'lens#1',
			end: 'light#1',
			ycoord: -0.35,
			style: {
				stroke: [255,255,255],
				fill: [255, 255, 255],
				textSize: 12,
				label: '50%',
				offset: [[-4,0],[0,0]]
			}			
		},
		{
			type: 'text',
			attach: 'lens#1',
			text: '+2D',
			style: {
				stroke: false,
				fill: [255, 255, 255],
				textSize: 16,
				textAlign: ['center', 'bottom']
			},
			offset: [0,0.3+0.03]
		},
		{
			type: 'text',
			attach: 'lens#2',
			text: '+3D',
			style: {
				stroke: false,
				fill: [255, 255, 255],
				textSize: 16,
				textAlign: ['center', 'bottom']
			},
			offset: [0,0.3+0.03]
		},
		{
			type: 'dimension',
			start: 'lens#1',
			end: 'lens#2',
			ycoord: -0.35,
			style: {
				stroke: [255,255,255],
				fill: [255, 255, 255],
				textSize: 12,
				label: '50%',
				arrows:['0%','100%']
			}			
		},
		{
			type: 'dimension',
			id: 'img dimension',
			start: 'lens#2',
			end: 'barrier#1',
			ycoord: -0.35,
			xsign: 1,
			style: {
				stroke: [255,255,255],
				fill: [255, 255, 255],
				textSize: 12,
				label: '50%',
				offset: [[4,0],[0,0]]
			}			
		},
		{
			type: 'thinlens',
			id: 'lens#2',
			position: [0.25,0],
			axis: [1,0],
			aperture: 0.6,
			power: 3,
			ui: {ylock:true},
            style: {
				stroke:[255,255,255],
				strokeWeight:3,
				z_order: 2,
				virtualStroke: [190, 190, 0]
			}
		},
		{
			type: 'barrier',
			id: 'barrier#1',
			plane: 0,
			position: [1.5, -0.3, 1.5, 0.3],
			style: { 
				stroke: [0,0,0,0]
			},
			ui: {ylock:true, xlock: true},
		},
		{
			type: 'control',
			controlType: 'checkbox',
			position: [-5, -5],
			params: ['continue rays', false],
			style: {
				color: 'rgb(255,255,255)',
				font: '10pt Arial, sans-serif'
			},
			bind: {
				id: 'barrier#1',
				property: ['plane'],
				yes: 1,
				no: 0
			}
		}
    ]
}

	state = Object.assign(state, data)

	let actions = {
		toggle(s) {
			s.decorate = s.decorate=='ui'?false:'ui'
		}		
	}

	new p5(makeP5App(state, actions), 'figure1image')
	popout.openButton('Figure1')
	popout.addhelp('Figure1', actions.toggle)

})(typeof data=='undefined'?{}:data)