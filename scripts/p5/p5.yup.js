// p5.yup.js - y-up coordinate system

// Internal functions preceded by _yup

p5.prototype._yup_set_matrix = function(cx, cy, s) {
	// puts a y-up matrix on the p5 instance
	cx = cx||0
	cy = cy||0
	s  = s||1
	this._yup_matrix = {cx, cy, s}
}

p5.prototype._yup_canvasX_2_yup = function(x) {
	return (x-this._yup_matrix.cx)/this._yup_matrix.s
}
	
p5.prototype._yup_canvasY_2_yup = function(y) {
	return (this._yup_matrix.cy-y)/this._yup_matrix.s
}

// public-facing functions

p5.prototype.setOrigin = function(cx, cy) {
	// need to call this before anything else
	if (cx == undefined) {
		cx = (this._yup_matrix && this._yup_matrix.cx) || this.width/2
		cy = (this._yup_matrix && this._yup_matrix.cy) || this.height/2
		this.setOrigin(cx, cy)
	} else if (typeof cx == 'string') {
		switch (cx) {
			case 'center': case 'centre': case '':
				this.setOrigin(this.width/2, this.height/2)
				break;
			case 'lowerleft':
				this.setOrigin(0, this.height)
		}
	} else {
		//console.log(cx, cy, this.width, this.height)
		let s = this._yup_matrix?this._yup_matrix.s:1
		this._yup_set_matrix(cx, cy, s)
		this.resetMatrix()
		this.applyMatrix(s, 0, 0, -s, cx, cy)
	}
}

p5.prototype.moveOrigin = function(dx, dy) {
	let {cx, cy} = this._yup_matrix
	dx = dx/this._yup_matrix.s
	dy = -dy/this._yup_matrix.s
	this.setOrigin(cx+dx, cy+dy)
	console.log(this._yup_matrix)
}

p5.prototype.yup_xlimits = function() {
	return [this._yup_canvasX_2_yup(0), this._yup_canvasX_2_yup(this.width-1)]
}

p5.prototype.yup_ylimits = function() {
	return [this._yup_canvasY_2_yup(this.height-1), this._yup_canvasY_2_yup(0)]
}

p5.prototype.yup_mouseX = function() {
	let mx = this.mouseX
	if (mx<0 || mx>=this.width) { return NaN}
	return this._yup_canvasX_2_yup(mx)
}
	
p5.prototype.yup_mouseY = function() {
	let my = this.mouseY
	if (my<0 || my>=this.height) { return NaN}
	return this._yup_canvasY_2_yup(my)
}

p5.prototype.yup_text = function(s, x, y, ...args) {
	this.push()
	this.translate(x,y)
	this.scale(1,-1)
	this.text(s,0,0, ...args)
	this.pop()
}
	
p5.prototype.yup_image = function(img, x, y, w, h) {
	// needed for image blitting
	this.push()
	this.translate(x,y)
	this.scale(w<0?-1:1,-1)
	this.image(img,0,0, Math.abs(w), h)
	this.pop()
}

