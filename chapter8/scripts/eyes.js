

function buildEye(frontVertex, radii, gaps, indices) {
	// builds a 4 surface eye based on radii, gaps, and refractive indices
	// frontVertex [x,y] position of front of cornea
	// radii = [front cornea, back cornea, front lens, back lens, sclera]
	// or radii = [front cornea, back cornea, front lens, back lens, [sclera_h, sclera_v]]
	//    if we have an elliptical sclera/retina
	// gaps = [corneal thickness, aqueous, lens, vitreous]
	// indices = [cornea, aqueous, lens, vitreous]
	//
	// all dimensions in mm
	
	indices = indices || [1.377, 1.336, 1.42, 1.336]
	
	let [x,y] = frontVertex,
		// some colours
		eyeclr = [242*0.9,90*0.9,46*0.9],
		optclr = [180,180,255],
		dkoptclr = [180*0.8, 180*0.8, 255*0.8],
		// each component
		cornea1 = {r: radii[0]/1000}, 
		cornea2 = {r: radii[1]/1000}, 
		lens1 = {r: radii[2]/1000}, 
		lens2 = {r: radii[3]/1000}, 
		sclera_r = typeof radii[4]=='number'?[radii[4],radii[4]]:radii[4],
		sclera = {r: v2.scale(1/1000,sclera_r)}
	
	gaps = gaps.map(x=>x/1000) // mm -> metres
	
	cornea1.center = [x+cornea1.r, y]
	cornea2.center = [x+gaps[0]+cornea2.r, y]
	lens1.center   = [x+gaps[0]+gaps[1]+lens1.r, y]
	lens2.center   = [x+gaps[0]+gaps[1]+gaps[2]+lens2.r, y]
	sclera.center  = [x+gaps[0]+gaps[1]+gaps[2]+gaps[3]+sclera.r[0], y]
	
	// make radii positive
	lens2.r = -lens2.r
	sclera.r[0] = -sclera.r[0]

	let EYE = [
		Object.assign(
			makeArc(cornea1.center, cornea1.r, cornea1.r, 
					sclera.center, ...sclera.r, 'difference'),
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
			position: [...sclera.center, sclera.r[0]*2, sclera.r[1]*2],
			align: ['center', 'center']
		},
		Object.assign(
			makeArc(cornea2.center, cornea2.r, cornea2.r, 
					sclera.center, ...sclera.r, 'difference'),
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
			makeArc(sclera.center, ...sclera.r, 
					cornea2.center, cornea2.r, cornea2.r, 'difference'),
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
			style: {strokeWeight: 3 },
			ui: {xlock: true, ylock: true}
		},
		{
			type: 'barrier',
			id: 'pupil bottom',
			position: [x, -diam/1000/2, x, -y],
			style: {strokeWeight: 3 },
			ui: {xlock: true, ylock: true}
		},
	]
}



function Gullstrand(frontVertex, accom, params) {
	//accommodated (accom=1) or unaccomodated (accom=0) gullstrand eye
	params = params || {}
	
	let r0 = Object.assign([7.8, 6.5, 10.2, -6, [-11.2, 11.2]], params.r0),
	    r1 = Object.assign([7.8, 6.5, 6, -5.5, [-11.2, 11.2]], params.r1||params.r0),
		g0 = [0.55, 3.05, 4, 16.4+2*(-11.2-r0[4][0])],
		g1 = [0.55, 2.65, 4.5, 16.4+2*(-11.2-r1[4][0])],
		r = [...r0],
		g = [...g0]

	for (let i=0; i<r0.length-1; i++) {
		r[i] = (1-accom)*r0[i]+accom*r1[i]
	}
	
	for (let i=0; i<g0.length; i++) {
		g[i] = (1-accom)*g0[i]+accom*g1[i]
	}
	
	return buildEye(frontVertex, r, g, Object.assign([1.377, 1.336, 1.42, 1.336], params.indices))
}
