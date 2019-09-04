// this is the draw function for figure 3, maybe use elsewhere too.

function drawOvalLens(p5, box, ppm) {
	let style = Object.assign({}, plugins.thinlens.style, this.style),
		ends = this.ends(),
		chord = this.aperture*ppm // in pixels
		sag = 5,
		lenscentre = v2.scale(ppm, this.position)
		radius = ((chord/2)**2+sag**2)/(2*sag)
	
	p5.strokeWeight(style.strokeWeight)
	p5.stroke(...style.color)
	p5.fill(...style.color)
	
	// draw two arcs
	let centre = v2.add(lenscentre, [radius-sag,0]),
		angle = Math.atan2(chord/2, radius-sag)
	p5.arc(...v2.add(lenscentre, [radius-sag,0]), 2*radius, 2*radius, p5.PI-angle, p5.PI+angle, p5.CHORD)
	p5.arc(...v2.sub(lenscentre, [radius-sag,0]), 2*radius, 2*radius, 2*p5.PI-angle, 2*p5.PI+angle, p5.CHORD)
}