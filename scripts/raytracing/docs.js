/*
The objects in the scene have a set of properties held in a plain javascript object,
and a set of methods which are held in a plugins object, keyed by object type.
*/

// Example of thin lens object

TL = {
	type: 'thinlens',   // required
	id: 'name',         // optional, I think
	position: [x, y],   // the centre of the lens, in metres
	axis:     [vx, vy], // a vector which points to the positive direction along the optic axis.
	aperture: a,        // the aperture of the lens in metres
	power:    F,        // the power of the lens, in dioptres
	style: {            // the style object, the properties below are defaults
		strokeWidth: 2,
		color: [255, 255, 255],
		arrowlen: 6,
		arrowwidth: 3  // these last two define the size of the arrows
	},
	ui: {               // interaction control, only put in as required
		selectable: tf, // true if the user can select it
		xlock: tf,      // true if the x coordinate of position is locked
		ylock: tf       // true if the y coordinate of position is locked
	},
	virtual: []         // a list of light id's that need to be tracked to create virtual images
}

// Example of a barrier object

B = {
	position: [x1,y1,x2,y2], // the endpoints of a straight line forming the barrier
	style: {            // the style object, the properties below are defaults
		strokeWidth: 2,
		color: [190, 190, 190]		
	},
	blur: ['light#1']   // a list of light id's that need to be tracked to create blur discs
}

// Ray style

RS = {
	style: { // this is the style for rays that come from the light
		strokeWidth: 1, 
		color: [255,255,255],
		arrows: [...], // arrow specifications that apply to each ray segment.
		// '30%' - draw an arrow 30% along the length of the ray
		//  n    - draw an arrow n metres from start (if negative, from end) of ray
		// These don't apply to the last ray
		// 
		// {pt:[x,y], dir:[x,y]} - draw an arrow where the ray intersects the line
		// If you want % or dist to apply to all rays, give it without being in an array
		// This obvs. takes a bit of parsing
		arrowlen: 6,
		arrowwidth: 3  // these last two define the size of the arrows		
	}
}