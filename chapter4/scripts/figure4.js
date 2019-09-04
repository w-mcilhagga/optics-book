(function() {

state = {
    dragtarget: false,
    oldpt: [
        -1.03,
        0.13
    ],
    w: 520,
    h: 250,
    origin: [
        360,
        120
    ],
    ppm: 600,
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
				let Vin1  = L1.n_in/(D.position[0]-L1.position[0]),
					Vout1 = Vin1+L1.power,
					img1  = L1.n_out/Vout1,
					Vin2  = 1/(img1-(L2.position[0]-L1.position[0])),
					Vout2 = L2.n_in*Vin2 + L2.power,
					img2 = L2.n_out/Vout2
				
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
				
				// draw the zones of different refractive indices
				p5.fill(0,90,140) 
				p5.noStroke()
				p5.rect(vbox[0], vbox[2], ppm*L1.position[0]-vbox[0], vbox[3]-vbox[2])
				
				p5.fill(100, 100,100) 
				p5.noStroke()
				p5.rect(ppm*L2.position[0], vbox[2], vbox[1]-ppm*L1.position[0], vbox[3]-vbox[2])
				
				// label the powers
				p5.fill(255)
				p5.noStroke()
				p5.textSize(16)
				p5.textAlign(p5.RIGHT,p5.BOTTOM)
				p5.yup_text('+'+L1.power.toFixed(1)+' D', ppm*L1.position[0]-10, ppm*(L1.position[1]+L1.aperture/2)+15)
				p5.textAlign(p5.LEFT,p5.BOTTOM)
				p5.yup_text(L2.power.toFixed(1)+' D', ppm*L2.position[0]+10, ppm*(L2.position[1]+L1.aperture/2)+15)
				
				// label the gap
				p5.stroke(255)
				p5.line(ppm*L1.position[0], ppm*bottom-10, ppm*L2.position[0], ppm*bottom-10)
				p5.arrow(ppm*L1.position[0], ppm*bottom-10, -1, 0, 6, 3)
				p5.arrow(ppm*L2.position[0], ppm*bottom-10, 1, 0, 6, 3)
				p5.fill(255)
				p5.noStroke()
				p5.textSize(12)
				p5.textAlign(p5.CENTER,p5.TOP)
				p5.yup_text(gap.toFixed(3)+'m', ppm*(L1.position[0]+L2.position[0])/2, ppm*bottom-15)
								
				// label the distance to object
				p5.noFill()
				p5.stroke(255)
				let odist = Math.max(this.object.position[0], vbox[0]/ppm)
				p5.line(ppm*L1.position[0]-4, ppm*bottom-10, ppm*odist, ppm*bottom-10)
				p5.arrow(ppm*odist, ppm*bottom-10, -1, 0, 6, 3)
				p5.fill(255)
				p5.noStroke()
				p5.textSize(12)
				p5.textAlign(p5.CENTER,p5.TOP)
				let objdist = this.object.position[0] - L1.position[0]
				p5.yup_text(objdist.toFixed(3)+'m', ppm*(L1.position[0]-0.1), ppm*bottom-15)
				
				// label the distance to the image
				let img = this.B.position[0],
				    imgdist = img - L2.position[0] - (this.B.barrieroff?2:0)
				if (imgdist!=2.345 && imgdist>0) {
					p5.noFill()
					p5.stroke(255)
					let idist = Math.min((L2.position[0]+imgdist), vbox[1]/ppm)
					p5.line(ppm*L2.position[0]+4, ppm*bottom-10, ppm*idist, ppm*bottom-10)
					p5.arrow(ppm*idist, ppm*bottom-10, 1, 0, 6, 3)
					p5.fill(255)
					p5.noStroke()
					p5.textSize(12)
					p5.textAlign(p5.CENTER,p5.TOP)
					p5.yup_text(imgdist.toFixed(3)+'m', 
						ppm*(L2.position[0]+0.1), 
						ppm*bottom-15)
				}
				
			}
		},
        {
            type: 'divergent light',
            id: 'light#1',
            position: [-0.8, 0],
            target: 'lens#1',
            spread: 'fill*0.8',
            raycount: 6,
            ui: {ylock:true},
            style: {
                stroke: [190,190,255],
				strokeWidth: 1,
				arrows: ['60%','',{pt:[0.1,0], dir:[0,1]}]
            }
        },
		{
			type: 'surface',
			id: 'lens#1',
			position: [0,0],
			axis: [1,0],
			aperture: 0.2,
			power: 6.8,
			n_in: 1.33,
			n_out: 1.5,
			ui: {ylock:true},
            style: {
				stroke:[255,255,255],
				strokeWeight:3,
				z_order: 2,
				virtualStroke: [190, 190, 0]
			},
			//virtual: ['light#1']
		},		{
			type: 'surface',
			id: 'lens#2',
			position: [0.05,0],
			axis: [1,0],
			aperture: 0.18,
			power: -2.5,
			n_in: 1.5,
			n_out: 1,
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
			position: [1.5, -0.3, 1.5, 0.3],
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
}*/

new p5(makeP5App(state, ()=>false, {}), document.getElementById('Figure4 image'))

/*  d = document.getElementById('fig2handle')
  d.onmousedown = function() {actions.decorate('ui')}
  d.onmouseup = function() {actions.decorate()}
  d.addEventListener("touchstart", ()=>actions.decorate('ui'), false);
  d.addEventListener("touchend", actions.decorate, false);
*/
})()