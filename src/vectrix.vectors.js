(function() {
	/**
	 * Treat vectors as column matrixes, makes this easy.
	 */
	const matrix = require("./vectrix.matrices.js");

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


	function defineAliases(vec) {
		let factory;
		let map;
		let combos;
		if(vec.length === 2) {
			factory = vec2;
			map = aliases2d;
			combos = aliasCombos2d;
		}
		else if(vec.length === 3) {
			factory = vec3;
			map = aliases3d;
			combos = aliasCombos2d.concat(aliasCombos3d);
		}
		else { // it's 4 because nothing else is supported or requested
			factory = vec4;
			map = aliases4d;
			combos = aliasCombos2d.concat(aliasCombos3d, aliasCombos4d);
		}
		for(let i = 0, len = map.length; i < len; ++i) {
			let set = (function(i, val) {this[i] = val}).bind(vec, map[i].i); 
			let get = (function(i) {return this[i]}).bind(vec, map[i].i);
			for(let n = 0, len = map[i].names.length; n < len; ++n) {
				Object.defineProperty(vec, map[i].names[n], {
					set:set,
					get:get
				});
			}
		}
		for(let i = 0, len = combos.length; i < len; ++i) {
			Object.defineProperty(vec, combos[i].join(""), {
				get:(function(factory, combo) {
					let vals = combo.map((p) => this[p]);
					return factory(vals);
				}).bind(vec, factory, combos[i])
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
		return matrix.create(vec.length+1,1,vec.toArray().concat(1));
	}

	function create(len, args) {
		let params = [].slice.apply(args);	
		let vals = [];
		if(params.length === 0) vals = new Array(len).fill(0);
		else if(params.length === 1 && params[0].length === len) vals = params[0];
		else if(params.length === len) vals = params;
		else throw new Error("Invalid argument length when creating a vector");
		let vec = matrix.create(len,1,vals);
		// define vector-specific methods
		vec.homogenous = homogenous.bind(null, vec);
		return vec;
	}

	function vec2() {
		let vec = create(2, arguments);
		defineAliases(vec);
		return vec;
	}

	function vec3() {
		let vec = create(3, arguments);
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
