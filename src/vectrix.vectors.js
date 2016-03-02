(function() {
	/**
	 * Treat vectors as column matrixes, makes this easy.
	 */
	const matrices = require("./vectrix.matrices.js");

	/*
	 * All of the below is a dumb, slow workaround for the fact
	 * that TypedArrays can't be used as prototypes. What we're 
	 * doing here is creating property aliases so that we can use 
	 * vectors somewhat like GLSL, for example: 
	 *
	 * vec3([0,3,4]).zyx == vec3([4,3,0]); 
	 * 
	 * We do this programmatically because doing it be hand would 
	 * be even more tedious than this was. 
	 * 
	 * We precompute all the permutations of all the aliases and
	 * their definitions, then throw them in the aliasesXd objects.
	 * The individual vector factories then apply them during creation.
	 * 
	 * Hopefully this isn't too slow because I spend a heck of a lot
	 * of time making this happen.
	 */

	let aliasCombos2d = [];
	let aliasCombos3d = [];
	let aliasCombos4d = [];

	let aliases2d = [
		{names:["x"], i:0},
		{names:["y"],i:1}
	];

	let aliases3d = [
		{names:["x","r"],i:0},
		{names:["y","g"],i:1},
		{names:["z","b"],i:2}
	];

	let aliases4d = [
		{names:["w", "a"],i:3}
	].concat(aliases3d);

	permutations("xy".split("")).forEach((combo) => {
		aliasCombos2d.push(combo);
	});

	["xz","yz","xyz","rgb"].forEach((props) => {
		permutations(props.split("")).forEach((combo) => {
			aliasCombos3d.push(combo);
		});
	});

	["yxw","zxw","yzw","xyzw","rga","rba","gba","rgba"].forEach((props) => {
		permutations(props.split("")).forEach((combo) => {
			aliasCombos4d.push(combo);
		});
	});

	/**
   * Util function to help generate permutations of property alias
	 * sets
   */
	function permutations(list) {
		// Empty list has one permutation
		if (list.length === 0) return [[]];
		var result = [];

		for (var i=0; i<list.length; i++) {
			var copy = list.slice();
			var head = copy.splice(i, 1);
			var rest = permutations(copy);
			for (var j=0; j<rest.length; j++) {
				var next = head.concat(rest[j]);
				result.push(next);
			}
		}
		return result;
	}	

	function getAlias(i) {
		return this[i];
	}

	function getAliasCombo(factory, combo) {
		let vals = combo.map((p) => this[p]);
		return factory(vals);
	}


	function defineAliases(vec) {
		let factory;
		let map;
		let combos;
		if(vec.length === 2) {
			map = aliases2d;
			combos = aliasCombos2d;
		}
		else if(vec.length === 3) {
			map = aliases3d;
			combos = aliasCombos2d.concat(aliasCombos3d);
		}
		else { // it's 4 because nothing else is supported or requested
			map = aliases4d;
			combos = aliasCombos2d.concat(aliasCombos3d, aliasCombos4d);
		}
		for(let i = 0, len = map.length; i < len; ++i) {
			let get = getAlias.bind(vec, map[i].i);
			for(let n = 0, len = map[i].names.length; n < len; ++n) {
				Object.defineProperty(vec, map[i].names[n], {
					get:get
				});
			}
		}
		for(let i = 0, len = combos.length; i < len; ++i) {
			switch(combos[i].length) {
				case 2:factory = vec2; break;
				case 3:factory = vec3; break;
				case 4:factory = vec4; break;
			}
			Object.defineProperty(vec, combos[i].join(""), {
				get:getAliasCombo.bind(vec, factory, combos[i])
			});
		}
	}

	/*
   * End ugly code for generating aliases.
   */

	/**
   * Homogenous coordinates for a vector. Note this does not return
   * a vector because it's not really useful to do so.
   */
	function homogenous(vec) {
		return matrices.create(vec.length+1,1,vec.toArray().concat(1));
	}

	/**
	 * Normalize a vector.
	 * @param a vector to normalize
	 * @return vector
	 */
	function normalize(a) {
		let sqrt = Math.sqrt;
		let sum = a.map((cur) => cur*cur).reduce((prev, cur) => prev+cur, 0);
		return create(a.length, a.map((cur) => cur*1/sqrt(sum)));
	}

	/**
	 * Perform a linear interpolation between two vectors.
	 * @param a first operand
	 * @param b second operand
	 * @param t interval
	 * @return vector
	 */
	function lerp(a, b, t) {
		return create(a.length, a.map((cur, i) => a[i]+t*(b[i]-a[i])));
	}

	/**
	 * Perform a cubic bezier interpolation
	 * @param a start point
	 * @param b first control point
	 * @param c second control point
	 * @param d end point
	 * @param t interval
	 * @return vector
	 */
	function cubic(a, b, c, d, t) {
		/* parametric cubic bezier, faster than dec */
		let inv = 1-t,
				inv2 = inv*inv,
				fs = t*t,
				f0 = inv2 * inv,
				f1 = 3 * t * inv2,
				f2 = 3 * fs * inv,
				f3 = fs * t;
		return create(a.length, a.map((cur, i) => a[i]*f0 + b[i]*f1 + c[i]*f2 + d[i]*f3));	
	}

	/**
	 * Find the angle between two vectors in radians.
	 * @param a first operand
	 * @param b second operand
	 * @return vector
	 */
	function angle(a, b) {
		let anorm = normalize(a);
		let bnorm = normalize(b);
		var cos = anorm.dot(bnorm);
		return cos < 1.0?Math.acos(cos):0;
	}

	/**
	 * Find the distance between two vectors.
	 * @param a first operand
	 * @param b second operand
	 * @return distance
	 */
	function distance(a, b) {
		let dist = a.map((cur, i) => b[i] - a[i]);
		return Math.sqrt(dist.map((cur) => cur*cur).reduce((p, c) => p + c), 0);
	}

	/**
	 * Vector dot product for matching vector types. Accepts vectors or generic arrays, 
	 * or defaults up to the matrix dot product if the vectors don't match (which supports
	 * vector*matrix and scalar products).
	 * @param a first operand
	 * @param b second operand
	 * @return [matrix|scalar] dot product of a and b 
	 */
	function dot(a, b) {
		// let's duck type the two vectors so we can accept generic arrays too	
		if(
			((typeof(b.rows) === "undefined") && (a.length === b.length)) ||
			((a.rows === b.rows) && (a.cols === 1 && b.cols === 1))
		) {
			return a.map((cur, i) => cur * b[i]).reduce((prev, cur) => prev+cur, 0);
		}
		else return matrices.dot(a, b);
	}

	/**
	 * Vector cross products are technically only defined for 3D, but 2D can be
	 * crossed with implicit z=0
	 */
	function cross(a, b) {
		if(a.length > 3 || b.length > 3 || a.length < 2 || b.length < 2) return undefined;
		if(a.length == 2) a = [a[0], a[1], 0];
		if(b.length == 2) b = [b[0], b[1], 0];
		return vec3(
			a[1]*b[2] - a[2]*b[1],
			a[2]*b[0] - a[0]*b[2],
			a[0]*b[1] - a[1]*b[0]
		);
	}

	function create(len, args) {
		let params = [].slice.apply(args);
		let vals = [];
		if(params.length === 0) vals = new Array(len).fill(0);
		else vals = args;
		//else if(params.length === 1 && params[0].length === len) vals = params[0];
		//else if(params.length === len) vals = params;
		//else throw new Error("Invalid argument length when creating a vector");
		let vec = matrices.create(len,1,vals);
		// define vector-specific methods
		vec.homogenous = homogenous.bind(null, vec);
		vec.dot = dot.bind(null, vec);
		vec.normalize = normalize.bind(null, vec);
		vec.lerp = lerp.bind(null, vec);
		vec.cubic = cubic.bind(null, vec);
		vec.angle = angle.bind(null, vec);
		vec.distance = distance.bind(null, vec);
		return vec;
	}

	function vec2() {
		let vec = create(2, arguments);
		vec.cross = cross.bind(null, vec);
		defineAliases(vec);
		return vec;
	}

	function vec3() {
		let vec = create(3, arguments);
		vec.cross = cross.bind(null, vec);
		defineAliases(vec);
		return vec;
	}

	function vec4() {
		let vec = create(4, arguments);
		defineAliases(vec);
		return vec;
	}

	if(typeof("module") !== undefined) {
		module.exports = {
			create:create,
			vec2:vec2,
			vec3:vec3,
			vec4:vec4,
			// the following are exported mainly for testing purposes
			aliases2d:aliases2d,
			aliases3d:aliases3d,
			aliases4d:aliases4d,
			aliasCombos2d:aliasCombos2d,
			aliasCombos3d:aliasCombos3d,
			aliasCombos4d:aliasCombos4d,
		}
	}
})();
