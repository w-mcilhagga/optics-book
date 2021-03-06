(function() {
let pclr = [80, 120, 130]

let state = {
    w: 600,
    h: 300,
    origin: [
        300,
        150
    ],
    ppm: 200,
    background: [0, 61, 92],
	
    items: [
		{
			type: 'p5',
			draw(p5, vbox, ppm) {
				p5.noStroke()
				p5.fill(pclr)
				p5.beginShape()
				p5.vertex(0, 0.55625*ppm)
				p5.vertex(0.56525*ppm, -0.55625*ppm)
				p5.vertex(-0.56525*ppm, -0.55625*ppm)
				p5.endShape(p5.CLOSE)
			}
		},
        {
            type: 'divergent light',
            id: 'light#1',
            position: [-1.3, -0.4],
            target: [-0.25,0],
            raycount: 3,
			spread: 10,
            ui: {ylock:false, xlock:[-3,0]},
            style: {
                stroke: [190,190,255],
				strokeWidth: 1,
				arrows: ['50%']
            }
        },	
		{
			type: 'surface',
			id: 'prism#1',
			position: [-0.284,0],
			axis: [0.89, -0.45],
			aperture: 1.25,
			power: 0,
			n_in: 1,
			n_out:1.8,
			ui: {ylock:true, xlock:true},
            style: {
				stroke:pclr,
				strokeWeight:3,
				z_order: 2,
				virtualStroke: [190, 190, 0]
			}
		},	
		{
			type: 'surface',
			id: 'prism#2',
			position: [0.284,0],
			axis: [-0.89, -0.45],
			aperture: 1.25,
			power: 0,
			n_in: 1,
			n_out:1.8,
			ui: {ylock:true, xlock:true},
            style: {
				stroke:pclr,
				strokeWeight:3,
				z_order: 2,
				virtualStroke: [190, 190, 0]
			}
		},
		{
			type:'virtual image',
			id:'vi',
			light: 'light#1',
			lens: 'prism#2',
			style: {
				stroke: [190*0.8,190*0.8,255*0.8],
				strokeDash: [5,5],
				visible: true
			}
		},
		{
			type: 'control',
			controlType: 'checkbox',
			position: [-5, -1],
			params: ['Show virtual rays', true],
			style: {
				color: 'rgb(255,255,255)',
				font: '10pt Arial, sans-serif'
			},
			bind: {
				id: 'vi',
				property: ['style','visible'],
				yes: true,
				no: false
			}
		},	
		{
			type: 'surface',
			id: 'prism#3',
			position: [0,-0.5563],
			axis: [0,1],
			aperture: 2*0.5652,
			power: 0,
			n_in: 1,
			n_out:1.8,
			ui: {ylock:true, xlock:true},
            style: {
				stroke:pclr,
				strokeWeight:3,
				z_order: 2,
				virtualStroke: [190, 190, 0]
			}
		}
    ]
}
    
let actions = {
	toggle(s) {
		s.decorate = s.decorate=='ui'?false:'ui'
	}			
}


	fig1p5 = new p5(makeP5App(state, actions), 'figure2image')
	//popout.openButton('Figure2')
	popout.addhelp('Figure2', actions.toggle)
	

})()