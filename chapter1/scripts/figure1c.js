// adds new stuff to state
state.items = state.items.concat(
[
		{	
			type:"barrier",
			id:'toppinhole',
			position:[0.025,0.04+0.03,0.025,0.04+0.3], 
			ui: {xlock:true, ylock:true},
            style:{strokeWeight:4}
		},
		{	
			type:"barrier",
			id:'bottompinhole',
			position:[0.025,0.04-0.03,0.025,0.04-0.3], 
			ui: {xlock:true, ylock:true},
            style:{strokeWeight:4}
		},

    ]
)
state.figure = 'figure2'
