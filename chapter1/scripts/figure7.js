

let P = 2

f7_state = {
    dragtarget: false,
    oldpt: [
        -1.03,
        0.13
    ],
    origin: [
        90,
        130
    ],
    w: 700,
    h: 320,
    origin: [
        600,
        135
    ],
    ppm: 470,
    background: [0, 61, 92],
	
    items: [
		{
			type: 'p5',
			id: 'focal pt',
			position:[0,0],
			center() { return this.position },
			init(state, ) {
				P = findObject(state,'lens#1').power
				this.position = [-1/P, 0]
			},
			draw(p5, vbox, ppm) {
				p5.fill([190,190,0])
				p5.circle(-ppm/P, 0, 8)
			}
		},
		{
			type: 'text',
			id: 'label2',
			position: [(350+200/2-600+10)/470, 110/470],
			init(state) {
				this.text = 'F = '+P.toFixed(1)+' D'
			},
			text: 'F = '+P.toFixed(1)+' D',
			style: {
				textSize: 18,
				textAlign: ['left', 'top'],
			}
		},
		{
			type: 'text',
			id: 'label2',
			position: [1/P+0.05, 0],
			text: 'focal point',
			style: {
				textSize: 18,
				textAlign: ['left', 'middle']
			}
		},
		{
			type: 'dimension',
			id: 'label1',
			start: 'lens#1',
			end: 'focal pt',
			dp: 3,
			ycoord: -0.2,
			style: {
				textSize: 18,
				stroke: [255,255,255],
				//absolute: true
			}
		},
        {
            type: 'divergent light',
            id: 'light#1',
            position: [-1/P, 0],
            target: 'lens#1',
            spread: 'fill*0.9',
            raycount: 7,
            ui: {ylock:true},
            style: {
                color: [255,255,255],
				strokeWidth: 1,
				arrows: ['50%', '60%']
            }
        },
		{
			type: 'thinlens',
			id: 'lens#1',
			position: [0,0],
			axis: [1,0],
			aperture: 0.3,
			power: P,
			ui: {xlock:true, ylock:true},
            style: {
				color:[255,255,255],
				strokeWeight:3,
				z_order: 2
			}
		},
		{
			type:'control',
			controlType:'slider',
			position: [350-200/2,20],
			width: 200,
			params: [1,10,2,0.5],
			bind: {id:'lens#1', property:['power']}
		}
    ]
}

let f7_actions = {
	toggle(s) {
		s.decorate = s.decorate=='ui' ? false : 'ui'
	}		
}

new p5(makeP5App(f7_state, f7_actions), document.getElementById('Figure7 image'))


popout.addhelp('Figure7', f7_actions.toggle)
//popout.openButton('Figure7')