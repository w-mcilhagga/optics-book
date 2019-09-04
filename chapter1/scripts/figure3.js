// puts figure 3 state object into the div

findObject(f3_state, 'lens#1').draw = drawOvalLens
let f3_actions = {
	decorate: function(state, decoration) {
		findObject(state,'light#1').style.decoration = decoration
		findObject(state,'light#2').style.decoration = decoration
	}
}
new p5(makeP5App(f3_state,()=>false,f3_actions), document.getElementById('Figure3 image'))
