// routines to turn every figure with a p5 drawing into a popout, and add a
// decoration button.

/*
(function() {
	let figs = document.getElementsByClassName('canvas-div')
	// install handlers on each one
	for (let f of figs) {
		// add button-like anchor to open the figure in a new window
		let cap = f.parentNode.getElementsByTagName('figcaption'),
		    link = f.parentNode.id+'.html'
		cap[0].innerHTML += `<a href="${link}" target="_blank" class="view">View Larger</a>`
		// add button to right of canvas-div to show ui decorations on all movable objects
		cap[0].innerHTML += '<div class="decorate"></div>'
		cap[0].onmousedown = decorate
	}
	
	function decorate(e) {
		let cv = e.target.parentNode.parentNode.getElementsByClassName('canvas-div')
		console.log(cv.dataset)
	}
})()
*/

function mknode(s) {
	let parent = document.createElement('div')
	parent.innerHTML = s
	return parent.children[0]
}

let popout = {
	openButton(id, url) {
		// opens new window
		url = url || id+'.html'
		let caption = document.getElementById(id).getElementsByTagName('figcaption')[0]
		caption.appendChild(mknode( `<a href="${url}" target="_blank" class="view">View Larger</a>`))
	},
	
	addhelp(id, f) {
		// if openbutton comes after addhep, it seems to wreck the actions, probably because innerHTML drops all
		// the event handlers as it goes
		let caption = document.getElementById(id).getElementsByTagName('figcaption')[0]
		caption.appendChild(mknode('<div class="decorate"></div>'))
		let helpdiv = caption.getElementsByClassName('decorate')[0]
		
		helpdiv.onmousedown = ()=>f(true)
		helpdiv.onmouseup   = ()=>f(false)
		helpdiv.addEventListener("touchstart", ()=>f(true), false);
		helpdiv.addEventListener("touchend", ()=>f(false), false);
	}
}