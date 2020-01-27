var fig1p5

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
        260,
        125
    ],
    ppm: 200,
    background: [0, 61, 92],
	
    items: [
		{
			type: 'p5',
			draw(p5, vbox, ppm) {
				p5.noStroke()
				p5.fill([190*0.25,190*0.25,255*0.25])
				p5.rect(0,vbox[2]-2,vbox[1]-vbox[0]+10,vbox[3]-vbox[2]+10)
			}
		},
        {
            type: 'divergent light',
            id: 'light#1',
            position: [-1, 0.5],
            target: [0,0],
            raycount: 6,
			spread: 25,
            ui: {ylock:false},
            style: {
                stroke: [190,190,255],
				strokeWidth: 1,
				arrows: ['60%',0.9]
            }
        },
		{
			type: 'mirror',
			id: 'mirror#1',
			position: [0,0],
			axis: [1,0],
			aperture: 2,
			power: 0,
			ui: {ylock:true, xlock:true},
            style: {
				stroke:[255,255,255],
				strokeWeight:3,
				z_order: 2,
				virtualStroke: [190, 190, 0]
			}
		},
		{
			type:'virtual image',
			id:'vi',
			light: 'light#1',
			lens: 'mirror#1',
			style: {
				stroke: [190*0.8,190*0.8,255*0.8],
				strokeDash: [5,5],
				visible: false
			}
		},
		{
			type: 'control',
			controlType: 'checkbox',
			position: [-5, -5],
			params: ['Show virtual rays', false],
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
		}
    ]
}

	state = Object.assign(state, data)
    
	let actions = {
		toggle(s) {
			s.decorate = s.decorate=='ui'?false:'ui'
		},
        anim(s) {
			let L = findObject(s,'light#1')
			if (L.position[0]<-0.5) {
				L.position[0] += 0.005
				setTimeout(()=>actions.anim(s), 0.01)
			}
        }			
	}

	fig1p5 = new p5(makeP5App(state, actions), 'figure1image')
	popout.openButton('Figure1')
	popout.addhelp('Figure1', actions.toggle)

})(typeof data=='undefined'?{}:data)