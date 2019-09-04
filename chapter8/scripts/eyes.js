
function buildEye(frontVertex, radii, gaps, indices) {
	// builds a 4 surface eye based on radii, gaps, and refractive indices
	// frontVertex [x,y] position of front of cornea
	// radii = [front cornea, back cornea, front lens, back lens, retina]
	// gaps = [corneal thickness, aqueous, lens, vitreous]
	// indices = [cornea, aqueous, lens, vitreous]
	//
	// all dimensions in mm
	
	indices = indices || [1.377, 1.336, 1.42, 1.336]
	
	let cornea1 = { r: radii[0]/1000, lhs: frontVertex[0] },
		cornea2 = { r: radii[1]/1000, lhs: cornea1.lhs+gaps[0]/1000 },
		lens1   = { r: radii[2]/1000, lhs: cornea2.lhs+gaps[1]/1000 },
		lens2   = { r: radii[3]/1000, rhs: lens1.lhs+gaps[2]/1000}, // r <0
		sclera  = { r: radii[4]/1000, rhs: lens2.rhs+gaps[3]/1000 }, // r<0
		y = frontVertex[1],
		eyeclr = [242*0.9,90*0.9,46*0.9],
		optclr = [180,180,255],
		dkoptclr = [180*0.8, 180*0.8, 255*0.8]

	cornea1.center = [cornea1.lhs+cornea1.r, y]
	cornea2.center = [cornea2.lhs+cornea2.r, y]
	lens1.center = [lens1.lhs+lens1.r, y]
	lens2.center = [lens2.rhs+lens2.r, y]
	sclera.center = [sclera.rhs+sclera.r, y]
	
	// fix signs of r for makeArc calls
	lens2.r = -lens2.r
	sclera.r = -sclera.r
	
	let EYE = [
		Object.assign(
			makeArc(cornea1.center, cornea1.r, sclera.center, sclera.r, 'difference'),
			{
				type: 'snell arc',
				id: 'front cornea',
				n_in: 1,
				n_out: indices[0],
				ui: {xlock: true, ylock: true},
				style: {
					stroke: optclr,
					fill: optclr,
					ellipseMode: 'open'
				}
			}
		),
		{
			type: 'image',
			image: 'eyebg.png',
			ui: {xlock: true, ylock: true},
			position: [...sclera.center, sclera.r*2, sclera.r*2],
			align: ['center', 'center']
		},
		Object.assign(
			makeArc(cornea2.center, cornea2.r, sclera.center, sclera.r, 'difference'),
			{
				type: 'snell arc',
				id: 'back cornea',
				n_in: indices[0], 
				n_out: indices[1],
				ui: {xlock: true, ylock: true},
				style: {
					stroke: optclr,
					fill: dkoptclr,
					ellipseMode: 'open'
				}
			}
		),
		Object.assign(
			makeArc(sclera.center, sclera.r, cornea2.center, cornea2.r, 'difference'),
			{
				type: 'arc',
				id: 'retina',
				ui: {xlock: true, ylock: true},
				style: {
					stroke: [255,255,255],
					fill: false,
					ellipseMode: 'open',
					strokeWeight: 3
				}
			}
		),		
		Object.assign(
			makeArc(lens1.center, lens1.r, lens2.center, lens2.r, 'intersection'),
			{
				type: 'snell arc',
				id: 'front lens',
				n_in: indices[1],
				n_out: indices[2],
				ui: {xlock: true, ylock: true},
				style: {
					stroke: optclr,
					fill: optclr,
					ellipseMode: 'open'
				}
			}
		),
		{
			type: 'data',
			id: 'lens front vertex',
			position: [lens1.lhs, y]
		},
		Object.assign(
			makeArc(lens2.center, lens2.r, lens1.center, lens1.r, 'intersection'),
			{
				type: 'snell arc',
				id: 'back lens',
				n_in: indices[3],
				n_out: indices[2],
				ui: {xlock: true, ylock: true},
				style: {
					stroke: optclr,
					fill: optclr,
					ellipseMode: 'open'
				}
			}
		)]
	findObject({items:EYE}, 'front lens').position[0]+=0.00005 // to get rid of the thin gap inside the lens
	
	return EYE
}

function makePupil(eye, diam) {
	// computes location of pupil barriers
	let ret = findObject({items:eye}, 'retina'),
		c = plugins.arc.ends.call(ret),
		x = c[0][0]
		y = Math.abs(c[0][1])
	
	return [
		{
			type: 'barrier',
			id: 'pupil top',
			position: [x, diam/1000/2, x, y],
			style: {strokeWeight: 3, stroke: [0,0,0], z_order: -1 },
			ui: {xlock: true, ylock: true}
		},
		{
			type: 'barrier',
			id: 'pupil bottom',
			position: [x, -diam/1000/2, x, -y],
			style: {strokeWeight: 3, stroke: [0,0,0], z_order: -1 },
			ui: {xlock: true, ylock: true}
		},
	]
}



function Gullstrand(frontVertex, accom) {
	//accommodated (accom=1) or unaccomodated (accom=0) gullstrand eye
	let r0 = [7.8, 6.5, 10.2, -6, -11.2],
	    r1 = [7.8, 6.5, 6, -5.5, -11.2],
		g0 = [0.55, 3.05, 4, 16.6-0.3],
		g1 = [0.55, 2.65, 4.5, 16.5-0.3],
		r=[],
		g=[]
	
	for (let i=0; i<r0.length; i++) {
		r[i] = (1-accom)*r0[i]+accom*r1[i]
	}
	
	for (let i=0; i<g0.length; i++) {
		g[i] = (1-accom)*g0[i]+accom*g1[i]
	}
	
	return buildEye(frontVertex, r, g, [1.377, 1.336, 1.42, 1.336])
}

