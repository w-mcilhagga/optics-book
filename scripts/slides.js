/*
Slideshow maker.

Markup:
<span class='slideshow-container' id='a'>
<img src='a.jpg'/>
<img src='b.jpg'/>
<img src='c.jpg'/>
</span>

<button class='slideshow-remote' data-slideshow-id='a' data-slideshow-direction='reverse'>Reverse</button>
Code:
slideshow()

- This runs through all elements with class 'slideshow-container' and enables a slideshow on their
children. 
- It also runs through all elements with class 'slideshow-remote' and enables a click on them to advance or reverse the slideshow. To decide which slideshow & direction, supply
data-slideshow-id (which is the id of the slideshow to control) and data-slideshow-direction (which is 'reverse' or can be left out)
*/

function slideshow() {
	
	let S = document.getElementsByClassName('slideshow-container'), // all the container elems
		R = document.getElementsByClassName('slideshow-remote') // all the remote-control elems
	
	function moveSlide(container, step) {
			let vis = +container.dataset.slideNumber
				slides = container.children
			slides[vis].style.display = 'none'
			vis += step
			if (vis<0) vis = 0
			if (vis>=slides.length) vis=slides.length-1
			slides[vis].style.display = 'block'
			container.dataset.slideNumber = vis		
	}
	
	function wrapImage(elem, prev, next) {
		if (elem.tagName=='IMG') {
			let p = elem.parentNode,
				d = document.createElement('div')
			d.style.position = 'relative'
			p.replaceChild(d, elem)
			d.appendChild(elem)
			if (prev) {
				let arrow = document.createElement('div')
				arrow.style.position='absolute'
				arrow.style.left='5px'
				arrow.style.bottom='12px'
				arrow.style.color = 'white'
				arrow.style.fontSize = '25px'
				arrow.innerHTML = '&#10094;'
				arrow.style.cursor = 'pointer'
				arrow.onclick = prev
				d.appendChild(arrow)
			}
			if (next) {
				arrow = document.createElement('div')
				arrow.style.position='absolute'
				arrow.style.right='5px'
				arrow.style.bottom='12px'
				arrow.style.color = 'white'
				arrow.style.fontSize = '25px'
				arrow.innerHTML = '&#10095;'
				arrow.style.cursor = 'pointer'
				arrow.onclick = next
				d.appendChild(arrow)
			}
		} else {
			// look for the img tag
			for (let j=0; j<elem.children.length; j++) {
				wrapImage(elem.children[j], prev, next)
			}
		}
	}
	
	for (let i=0; i<S.length; i++) {
		// enable slideshow on all children of the containers
		let container = S.item(i),
			slides = container.children
			nextSlide = () => moveSlide(container, 1),
			prevSlide = () => moveSlide(container, -1)
			
		// adjust the children so the images are wrapped in their own div
		// and receive the onclick handlers
		for (let j=0; j<slides.length; j++) {
			wrapImage(slides[j], j!=0 && prevSlide, j<(slides.length-1) && nextSlide)
		}
		slides = container.children // because this might have changed from wrapping
		
		// initialize each slideshow
		for (let j=0; j<slides.length; j++) {
			slides[j].style.display = 'none'			
		}
		container.dataset.slideNumber = 0
		slides[0].style.display = 'block'
		
		//container.addEventListener('click', nextSlide)
		
		// add the event handler to any remote controllers
		for (let j=0; j<R.length; j++) if (R.item(j).dataset.slideshowId == container.id) {
			R.item(j).addEventListener('click', 
				R.item(j).dataset.slideshowDirection=='reverse'?prevSlide:nextSlide
			)
		}
	}
}