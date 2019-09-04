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
        350,
        125
    ],
    ppm: 200,
    background: [0, 61, 92],
	
    items: [
		{
			type: 'js',
			init(state) {
				// place barrier at right location
				let D = findObject(state, 'light#1'),
					L = findObject(state, 'lens#1'),
					B = findObject(state, 'barrier#1'),
					Vin = 1/(D.position[0]-L.position[0]),
					Vout = Vin+L.power
				findObject(state, 'labels').values = [-(D.position[0]-L.position[0]), 
					1/Vout]
				if (Vout<0) Vout = 0.001
				B.position[0] = B.position[2] = B.barrieroff?1.3:Math.min(1.3,1/Vout)
				B.position[1] = B.position[0]==1.3?-10:-0.3
				B.position[3] = -B.position[1]
			}
		},
		{
			type:'p5',
			id:'labels',
			values: [0,1],
			position: [0,0.4],
			draw(p5, vbox, ppm) {
				let [d1, d2] = this.values
				p5.fill(255)
				p5.textSize(16)
				p5.textAlign(p5.CENTER)
				p5.stroke(255)
				p5.line(-2,ppm*0.35,-ppm*d1,ppm*0.35)
				p5.arrow(-ppm*d1,ppm*0.35,-1,0,6,3)
				p5.noStroke()
				p5.yup_text('-'+d1.toFixed(3)+'m', 
					...v2.scale(ppm,v2.add(this.position,[-d1/2,0])))
				if (d2>0) {
					p5.stroke(255)
					p5.line(2,ppm*0.35,ppm*d2,ppm*0.35)
					p5.arrow(ppm*d2,ppm*0.35,1,0,6,3)
					p5.noStroke()
					p5.yup_text(d2.toFixed(3)+'m', 80, ppm*0.4)
				}
				if (d2<0) {
					p5.stroke(190, 190, 0)
					p5.line(2,-ppm*0.35,ppm*d2,-ppm*0.35)
					p5.arrow(ppm*d2,-ppm*0.35,-1,0,6,3)
					p5.noStroke()
					p5.fill(190, 190, 0)
					p5.textAlign(p5.CENTER, p5.TOP)
					p5.yup_text(d2.toFixed(3)+'m', -80, -ppm*0.4)
				}
			}
		},
        {
            type: 'divergent light',
            id: 'light#1',
            position: [-1, 0],
            target: 'lens#1',
            spread: 'fill*0.8',
            raycount: 6,
            ui: {ylock:true, xlock:[-1.7,0]},
            style: {
                color: [255,255,255],
				strokeWidth: 1,
				arrows: ['60%','60%']
            }
        },
		{
			type: 'thinlens',
			id: 'lens#1',
			position: [0,0],
			axis: [1,0],
			aperture: 0.6,
			power: 1.25,
			ui: {xlock:true, ylock:true},
            style: {
				color:[255,255,255],
				strokeWeight:3,
				z_order: 2,
				virtualStroke: [190, 190, 0]
			},
			virtual: ['light#1']
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

/*function controls(p5, state, w, h, ppm) {
	
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
}*/

let actions = {
	decorate: function(state, decoration) {
		findObject(state,'light#1').style.decoration = decoration
	}
}

new p5(makeP5App(state, ()=>false, actions), document.getElementById('Figure7 image'))

  d = document.getElementById('fig7handle')
  d.onmousedown = function() {actions.decorate('ui')}
  d.onmouseup = function() {actions.decorate()}
  d.addEventListener("touchstart", ()=>{actions.decorate('ui');return false}, false);
  d.addEventListener("touchend", ()=>{actions.decorate();return false}, false);

})()