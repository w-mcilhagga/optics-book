
  function sketch(p5) {
  
	let images = [], 
		slider,
		w = 500, 
		h = 250, 
		imscale = 1
	
	function getSize() {
		w = document.getElementById('figure6img').clientWidth
		imscale = Math.min(w, 500)/500,
		h = 232*imscale+30
	}
	
	p5.preload = function() {
		for (let i=1; i<16; i++) {
			images.push(p5.loadImage('media/blur '+i+'.png'))
		}
	}
	
	p5.setup = function() {
		getSize()
		p5.createCanvas(w, h);
		slider = p5.createSlider(0,14,0,1)
	}
	
	p5.windowResized = function() {
		getSize()
		p5.resizeCanvas(w,h)
	}
	
	p5.draw = function() {
		p5.background(0);
		let imleft = Math.max(0,(w-500*imscale)/2)
		p5.image(images[slider.value()], imleft, 0, 500*imscale, 232*imscale);
		let sw = Math.round(Math.min(100, w/5))
		slider.position((w-sw)/2,h-30);
		slider.style('width', sw+'px');
		p5.textSize(16*imscale)
		p5.fill(255)
		p5.text('Blur diameter = '+2*(slider.value()+1), (w+sw)/2+10, h-10)
	}
  }
  
  let myP5 = new p5(sketch, 'figure6img')

