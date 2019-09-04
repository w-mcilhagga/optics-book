(function() {

let vgap = 250/700

state = {
    dragtarget: false,
    oldpt: [
        -1.03,
        0.13
    ],
    w: 520,
    h: 500,
    origin: [
        500,
        120
    ],
    ppm: 700,
    background: [0, 61, 92],
	
    items: [
		{
			type: 'js',
			init(state) {
				return
				// place barrier at right location
				let D = findObject(state, 'light#1'),
					L1 = findObject(state, 'lens#1'),
					L2 = findObject(state, 'lens#2'),
					B = findObject(state, 'barrier#1')
				
				// swap around
				if (L1.position[0]>L2.position[0]) {
					[L1, L2] = [L2, L1]
				}
				let Vin1  = 1/(D.position[0]-L1.position[0]),
					Vout1 = Vin1+L1.power,
					img1  = 1/Vout1,
					Vin2  = 1/(img1-(L2.position[0]-L1.position[0])),
					Vout2 = Vin2 + L2.power,
					img2 = 1/Vout2
				
				if (img2<0) {
					img2 = 2.345
				}
				B.position[0] = B.position[2] = L2.position[0]+img2
				if (B.barrieroff) {
					B.position[0] += 2
					B.position[2] += 2
				}
			}
		},
		{
			type:'p5',
			id:'labels',
			init(state) {
				// occurs after js item, so we can read out values & save them
				this.L1 = findObject(state,'lens#1')
				this.L2 = findObject(state,'lens#2')
				this.object = findObject(state, 'light#1')
				this.B = findObject(state, 'barrier#1')
			},
			draw(p5, vbox, ppm) {
				// draw the gap between the two lenses
				let L1 = this.L1,
					L2 = this.L2,
					gap = Math.abs(L1.position[0]-L2.position[0]),
					bottom = Math.min(L1.position[1]-this.L1.aperture/2, L2.position[1]-this.L2.aperture/2)
				
				// swap lenses around
				if (L1.position[0]>L2.position[0]) {
					[L1, L2] = [L2, L1]
				}
				
				// label the powers
				p5.fill(255)
				p5.noStroke()
				p5.textSize(16)
				p5.textAlign(p5.CENTER,p5.BOTTOM)
				p5.textStyle(p5.ITALIC)
				let s = p5.createSpan('<em>F<sub>1</sub></em>'),
				    pos = [ppm*L1.position[0], ppm*(L1.position[1]+L1.aperture/2)+25]
				pos = [state.origin[0]+pos[0], state.origin[1]-pos[1]]
				s.position(...pos)
				s.class('note')
				
				s = p5.createSpan('<em>F<sub>2</sub></em>'),
				pos = [ppm*L2.position[0], ppm*(L2.position[1]+L2.aperture/2)+25]
				pos = [state.origin[0]+pos[0], state.origin[1]-pos[1]]
				s.position(...pos)
				s.class('note')
				
				// label the gap
				p5.stroke(255)
				p5.line(ppm*L1.position[0], ppm*bottom-10, ppm*L2.position[0], ppm*bottom-10)
				p5.arrow(ppm*L1.position[0], ppm*bottom-10, -1, 0, 6, 3)
				p5.arrow(ppm*L2.position[0], ppm*bottom-10, 1, 0, 6, 3)
				p5.fill(255)
				p5.noStroke()
				p5.textSize(12)
				p5.textAlign(p5.CENTER,p5.TOP)
				p5.yup_text('d', ppm*(L1.position[0]+L2.position[0])/2, ppm*bottom-15)
				
				// label the distance to the image
				let img = this.B.position[0],
				    imgdist = img - L2.position[0]
				if (imgdist!=2.345 && imgdist>0) {
					p5.noFill()
					p5.stroke(255)
					p5.line(ppm*L2.position[0]+4, ppm*bottom-10, ppm*(L2.position[0]+imgdist), ppm*bottom-10)
					p5.arrow(ppm*(L2.position[0]+imgdist), ppm*bottom-10, 1, 0, 6, 3)
					p5.fill(255)
					p5.noStroke()
					p5.textSize(12)
					p5.textAlign(p5.CENTER,p5.TOP)
					p5.yup_text('1 / BVP', 
						ppm*(L2.position[0]+imgdist/2), 
						ppm*bottom-15)
					p5.textAlign(p5.LEFT,p5.BOTTOM)
					p5.textStyle(p5.NORMAL)
					p5.yup_text('focal point', ppm*img+10, 0)
				}
				
			}
		},		
		{
			type:'p5',
			id:'labels.1',
			init(state) {
				// occurs after js item, so we can read out values & save them
				this.L1 = findObject(state,'lens#1.1')
				this.L2 = findObject(state,'lens#2.1')
				this.object = findObject(state, 'light#1.1')
				this.B = findObject(state, 'barrier#1.1')
			},
			draw(p5, vbox, ppm) {
				// draw the gap between the two lenses
				let L1 = this.L1,
					L2 = this.L2,
					gap = Math.abs(L1.position[0]-L2.position[0]),
					bottom = Math.min(L1.position[1]-this.L1.aperture/2, L2.position[1]-this.L2.aperture/2)
				
				// swap lenses around
				if (L1.position[0]>L2.position[0]) {
					[L1, L2] = [L2, L1]
				}
				
				// label the powers
				p5.fill(255)
				p5.noStroke()
				p5.textSize(16)
				p5.textAlign(p5.CENTER,p5.BOTTOM)
				p5.textStyle(p5.ITALIC)
				let s = p5.createSpan('<em>F<sub>1</sub></em>'),
				    pos = [ppm*L1.position[0], ppm*(L1.position[1]+L1.aperture/2)+25]
				pos = [state.origin[0]+pos[0], state.origin[1]-pos[1]]
				s.position(...pos)
				s.class('note')
				
				s = p5.createSpan('<em>F<sub>2</sub></em>'),
				pos = [ppm*L2.position[0], ppm*(L2.position[1]+L2.aperture/2)+25]
				pos = [state.origin[0]+pos[0], state.origin[1]-pos[1]]
				s.position(...pos)
				s.class('note')
				
				// label the gap
				p5.stroke(255)
				p5.line(ppm*L1.position[0], ppm*bottom-10, ppm*L2.position[0], ppm*bottom-10)
				p5.arrow(ppm*L1.position[0], ppm*bottom-10, -1, 0, 6, 3)
				p5.arrow(ppm*L2.position[0], ppm*bottom-10, 1, 0, 6, 3)
				p5.fill(255)
				p5.noStroke()
				p5.textSize(12)
				p5.textAlign(p5.CENTER,p5.TOP)
				p5.yup_text('d', ppm*(L1.position[0]+L2.position[0])/2, ppm*bottom-15)
				
				// label the distance to the image
				let img = this.B.position[0],
				    imgdist = img - L1.position[0]
				if (imgdist!=2.345) {
					p5.noFill()
					p5.stroke(255)
					p5.line(ppm*L1.position[0]+4, ppm*bottom-10, ppm*(L1.position[0]+imgdist), ppm*bottom-10)
					p5.arrow(ppm*(L1.position[0]+imgdist), ppm*bottom-10, -1, 0, 6, 3)
					p5.fill(255)
					p5.noStroke()
					p5.textSize(12)
					p5.textAlign(p5.CENTER,p5.TOP)
					p5.yup_text('1 / FVP', 
						ppm*(L1.position[0]+imgdist/2), 
						ppm*bottom-15)
					p5.textAlign(p5.RIGHT,p5.BOTTOM)
					p5.textStyle(p5.NORMAL)
					p5.yup_text('focal point', ppm*img-10, -vgap*ppm)
				}
				
			}
		},
        {
            type: 'parallel light',
            id: 'light#1',
            position: [-1, 0],
            target: 'lens#1',
            spread: 'fill*0.8',
            raycount: 6,
            ui: {ylock:true},
            style: {
                stroke: [190,190,255],
				strokeWidth: 1,
				arrows: ['60%','50%','30%'],
				arrowlen: 6
            }
        },
		{
			type: 'thinlens',
			id: 'lens#1',
			position: [-0.4,0],
			axis: [1,0],
			aperture: 0.2,
			power: 2,
			ui: {ylock:true},
            style: {
				stroke:[255,255,255],
				strokeWeight:3
			},
		},		
        {
            type: 'parallel light',
            id: 'light#1.1',
            position: [1, -vgap],
            target: 'lens#2.1',
            spread: 'fill*0.8',
            raycount: 6,
            ui: {ylock:true},
            style: {
                stroke: [190,190,255],
				strokeWidth: 1,
				arrows: [-0.15,'50%','30%'],
				arrowlen: -6
            }
        },
		{
			type: 'thinlens',
			id: 'lens#1.1',
			position: [-0.4,-vgap],
			axis: [1,0],
			aperture: 0.2,
			power: 2,
			ui: {ylock:true},
            style: {
				stroke:[255,255,255],
				strokeWeight:3
			},
		},
		{
			type: 'thinlens',
			id: 'lens#2',
			position: [-0.25,0],
			axis: [1,0],
			aperture: 0.2,
			power: 3,
			ui: {ylock:true},
            style: {
				stroke:[255,255,255],
				strokeWeight:3,
				z_order: 2,
				virtualStroke: [190, 190, 0]
			},
			//virtual: ['light#1']
		},
		{
			type: 'thinlens',
			id: 'lens#2.1',
			position: [-0.25,-vgap],
			axis: [1,0],
			aperture: 0.2,
			power: 3,
			ui: {ylock:true},
            style: {
				stroke:[255,255,255],
				strokeWeight:3,
				z_order: 2,
				virtualStroke: [190, 190, 0]
			},
			//virtual: ['light#1']
		},
		{
			type: 'barrier',
			id: 'barrier#1',
			position: [1/(2/(1-0.15*2)+3)+-0.25, -0.1, 1/(2/(1-0.15*2)+3)+-0.25, 0.1],
			barrieroff: false,
			style: { 
				stroke: [0,0,0,0]
			}
		},
		{
			type: 'barrier',
			id: 'barrier#1.1',
			position: (function() {
				let FVP = 3/(1-0.15*3)+2
				return [-0.4-1/FVP, -0.1-vgap, -0.4-1/FVP, 0.1-vgap]
			})(),
			barrieroff: false,
			style: { 
				stroke: [0,0,0,0]
			}
		}
    ]
}

function controls(p5, state, w, h, ppm) {
	
	let c = p5.createCheckbox('continue rays',false)
	
	c.elt.onchange = function() {
		findObject(state,'barrier#1').barrieroff = c.checked()
		p5.redraw()
	}
	
	c.style('color','white')
	c.style('width','150px')
	c.style('font','10pt Arial, sans-serif')
	
	function sizer(p5, state, w, h, ppm) {
		c.position(w-100, h-25)
	}
	
	sizer(p5, state, w, h, ppm)
	
	return sizer
}

/*
let actions = {
	decorate: function(state, decoration) {
		findObject(state,'light#1').style.decoration = decoration
		findObject(state,'lens#1').style.decoration = decoration
		findObject(state,'lens#2').style.decoration = decoration
		return false
	}
}
*/

new p5(makeP5App(state, ()=>false, {}), document.getElementById('Figure5 image'))
/*
  d = document.getElementById('fig2handle')
  d.onmousedown = function() {actions.decorate('ui')}
  d.onmouseup = function() {actions.decorate()}
  d.addEventListener("touchstart", ()=>actions.decorate('ui'), false);
  d.addEventListener("touchend", actions.decorate, false);
*/
})()