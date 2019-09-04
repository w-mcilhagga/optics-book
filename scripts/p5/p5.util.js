// various p5.js utilities


function queryParameters(params) {
	// get parameters from page URL
	let u = new URL(location.href).searchParams,
		convert = s => JSON.parse('{"a":'+s+'}').a
		
	params = params || {}
	
	for (let p of u) {
		params[p[0]] = convert(p[1])
	}
	return params
}


// These are now part of p5:

p5.prototype.strokeDash = function(p) {
	// sets dashing parameters in similar style to weight
	//console.log(this.drawingContext)
	if (!this.drawingContext.setLineDash) {
		// guessing it is SVG
		this.drawingContext.lineDash = (p.length==0 || !p)?null:p
	} else {
		this.drawingContext.setLineDash(p || [])
	}
}

p5.prototype.arrow = function(x, y, dx, dy, len, w) {
	// adds an arrow drawing routine to p5
	len = len||10
	w = w||5
	this.beginShape()
	this.line(x-len*dx - w*dy, y-len*dy +w*dx , x, y)
	this.line(x, y, x-len*dx + w*dy, y-len*dy -w*dx)
	this.endShape()
}

p5.prototype.style = function(s) {
	// applies various styles to p5
	// stroke & fill are special cases
	if (s.stroke==false) {
		this.noStroke()
	}
	if (s.stroke) {
		this.stroke(...[].concat(s.stroke))
	}
	if (s.fill==false) {
		this.noFill()
	}
	if (s.fill) {
		this.fill(...[].concat(s.fill))
	}
	// other style properties
	let p5 = this;
	['strokeWeight', 'strokeDash', 'strokeCap', 
	 'strokeJoin', 'blendMode'].forEach( 
		k => s[k] && p5[k](s[k]) 
	);
	['textAlign', 'textSize', 'textStyle'].forEach( k => s[k] && p5[k](...[].concat(s[k])) )
}