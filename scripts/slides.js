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
	
	let S = document.getElementsByClassName('slideshow-container'),
		R = document.getElementsByClassName('slideshow-remote')
	
	function moveSlide(container, slides, step) {
			let vis = +container.dataset.slideNumber
			slides[vis].style.display = 'none'
			vis = (vis + step + slides.length) % slides.length
			slides[vis].style.display = 'block'
			container.dataset.slideNumber = vis		
	}
	
	for (let i=0; i<S.length; i++) {
		
		let container = S.item(i),
			slides = container.children
			
		// initialize each slideshow
		for (let j=0; j<slides.length; j++) {
			slides[j].style.display = 'none'
		}
		container.dataset.slideNumber = 0
		slides[0].style.display = 'block'
		
		// add the event handler to the slideshow container
		let nextSlide = () => moveSlide(container, slides, 1),
			prevSlide = () => moveSlide(container, slides, -1)
		container.addEventListener('click', nextSlide)
		
		// add the event handler to any remote controllers
		for (let j=0; j<R.length; j++) if (R.item(j).dataset.slideshowId == container.id) {
			R.item(j).addEventListener('click', 
				R.item(j).dataset.slideshowDirection=='reverse'?prevSlide:nextSlide
			)
		}
	}
}