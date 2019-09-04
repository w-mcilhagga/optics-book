function do_refract(state) {
	// state has n_in, n_out, v_in. Assumes ray hits surf at [0,0]
	// returns v_out, Reff, Teff
	
	let sin_theta_in = v2.sin(state.normal, state.v_in), // from normal to v_in
		sin_theta_out = state.n_in*sin_theta_in/state.n_out,
		theta_out,
		v_out,
		T, R
	
	if (Math.abs(sin_theta_out)<1) {
		// we have (some) refraction
		theta_out = Math.asin(sin_theta_out) // from normal to v_out
		v_out = v2.rotate(state.normal,theta_out)
		// work out Fresnel reflections
		let cos_theta_in = Math.sqrt(1-sin_theta_in**2),
			nrat = (state.n_in*sin_theta_in/state.n_out)**2,
			n1cos = state.n_in*cos_theta_in,
			n2sqrt = state.n_out*Math.sqrt(1-nrat),
			Rs = ( (n1cos-n2sqrt)/(n1cos+n2sqrt) )**2,
			n1sqrt = state.n_in*Math.sqrt(1-nrat),
			n2cos = state.n_out*cos_theta_in,
			Rp = ( (n1sqrt-n2cos)/(n1sqrt+n2cos) )**2
		R = (Rs+Rp)/2
	} else {
		R = 1
	}
	// compute reflected ray
	let v = v2.decompose(state.v_in, state.normal)
	    v_reflect = v2.sub(v[1], v[0]),
		theta_in = Math.asin(sin_theta_in)
	
	return {theta_in, theta_out, v_out, R, v_reflect}
}