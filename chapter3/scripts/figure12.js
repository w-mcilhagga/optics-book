

f11_state = {
    dragtarget: false,
    oldpt: [],
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
			type:'p5',
			id:'labels',
			values: [0,1],
			position: [0,0.4],
			draw(p5, vbox, ppm) {
				p5.fill(76,84,116)
				p5.noStroke()
				p5.rect(vbox[0],vbox[2],(vbox[1]-vbox[0])/2, vbox[3]-vbox[2])
				p5.fill(180,180,180)
				p5.rect((vbox[1]+vbox[0])/2,vbox[2],(vbox[1]-vbox[0])/2, vbox[3]-vbox[2])
			}
		},
        {
            type: 'divergent light',
            id: 'light#1',
            position: [-1, 0],
            target: [0,0],
            spread: 30,
            raycount: 6,
            ui: {},
            style: {
                stroke: [255,255,255],
				strokeWeight: 2,
				arrows: ['',0.3]
            }
        },
		{
			type: 'surface',
			id: 'surface#1',
			position: [0,0],
			axis: [1,0],
			aperture: 3,
			power: 0,
			n_in: 1.5,
			n_out: 1,
			ui: {xlock:true, ylock:true},
            style: {
				stroke:[255,255,255,0],
				strokeWeight:3,
				z_order: 2,
				virtualStrokeDash: [4, 8]
			},
			virtual: ['light#1']
		},
		/*{
			type: 'barrier',
			id: 'barrier#1',
			position: [1.5, -0.3, 1.5, 0.3],
			barrieroff: false,
			style: { 
				stroke: [0,0,0,0]
			}
		}*/
    ]
}

function f7_controls(p5, state, w, h, ppm) {
	
	let barriershift = 0
	
	let barrier = findObject(state,'barrier#1'),
		c = p5.createCheckbox('continue rays',false)
	
	c.elt.onchange = function() {
		barrier.barrieroff = c.checked()
		p5.redraw()
	}
	
	c.style('color','white')
	c.style('width','150px')
	c.style('font','10pt Arial, sans-serif')
	
	function sizer(p5, state, w, h, ppm) {
		c.position(w-150, h-25)
	}
	
	sizer(p5, state, w, h, ppm)
	
	return sizer
}

let f11_actions = {
	decorate: function(state, decoration) {
		findObject(state,'light#1').style.decoration = decoration
	}
}

new p5(makeP5App(f11_state,()=>0, f11_actions), document.getElementById('Figure11 image'))