/**
The vectors module contains functions and objects related to 2d, 3d, and 4d vectors.

Vectors are composed from columnar matrices, so they support all the methods that
[[vectrix.matrices|matrices]] do.

Require the vector module:
```javascript
const vectors = require("vectrix.vectors.js");
const vec2 = vectors.create.vec2;
const vec3 = vectors.create.vec3;
const vec4 = vectors.create.vec4;
```


You can construct them with vec2, vec3, and vec4, passing zero, one or N arguments
where N is the vector size. Do whatever is convenient.
```javascript
let first = vec2(); // passing no arguments will give you a vector filled with zeroes
first.toArray(); // [0,0]
let second = vec2([3,7]); // you can pass an array-like object
second.toArray(); // [3,7] 
let third = vec2(17,4); // or just pass the components as arguments
third.toArray(); // [14,4] 
let fourth = vec3(1,2,3); // and so on with 3d and 4d vectors
fourth.toArray(); // [1,2,3]
```

Vector functions will operate on any array-like object, returning a plain Float32Array when the result is another vector. Creating vector objects is somewhat expensive, so when you're doing a lot of operations and performance really counts, use the functions for calculations and then use the vector factories on your final result.
```javascript
const lerp = vectors.lerp;
let res = lerp([0.1, 0.3], [0.3, 0.7], .5); // Float32Array(0.2, 0.5)
create.vec2(res); // vec2(0.2,0.5);
```

Vectors are composed from columnar matrices, so they can do the things that matrices
do. 
```javascript
second.add(second).toArray(); // [6,14]
third.sub(second).toArray(); // [11,-3]

const matrices = require("vectrix.matrices.js");
let identity = matrices.create(2,2,[1,0, 0,1]);
identity.dot(second).toArray(); // [3,7]
let scale2x = matrixes.create(2,2,[2,0, 0,2]);
scale2x.dot(third).toArray(); // [34,8]
```

Vector dot products are a special case. As in vector math, multplying two vectors
produces a scalar:
```javascript
let first = vec2(2,2);
let second = vec2([2,2]);
first.dot(second); // 8
let third = vec2(1,0);
let fourth = vec2(0,1);
third.dot(fourth); // 0
```

They also have some of their own useful properties.

You can find the cross product of two 3d vectors using `vec.cross()`:
```javascript
let first = vec3(1,2,1);
let second = vec3(2,-2,2);
first.cross(second).toArray(); // [6,0,-6]
```
Cross can be called on 2d vectors, with z implicitly being zero:
```javascript
let first = vec2(2,4);
let second = vec2(1,3);
first.cross(second).toArray(); // [0,0,2]
```

If you cross a vec2 with a vec3 for whatever reason, vec2.z is implicitly zero:
```javascript
let first = vec3(1,2,1);
let second = vec2(1,3);
first.cross(second).toArray(); // [-3,1,1]
```

Most vector operations are duck typed and make few assumptions internally, so you 
can just pass in anything array-like of the correct length if you want:
```javascript
let first = vec3(1,2,1);
first.cross([2,-2,2]).toArray(); // [6,0,-6]
```
Just beware weird behavior might result if it looks like a duck and quacks like a duck
but it's actually a trick-or-treating platypus.

You can produce a homogenous coordinate for matrix multiplication using `vec.homogenous()`:
```javascript
first.homogenous().toArray(); // [0,0,1]
```

Which lets you do a few useful matrix-vector ops more easily:
```javascript
const matrices = require("vectrix.matrices.js");
const vectors = require("vectrix.vectors.js");
let myVec = vectors.vec2([22,9]); 
let translate = matrices.create(3,3,[1,0,5, 0,1,6, 0,0,1]);
translate.dot(myVec.homogenous()).toArray(); // [27,15,1]
```
Making this more intuitive is on the roadmap.

Last but not least, they have a whole bunch of virtual properties that you might
be used to in GLSL. Once I used them I couldn't live without.
```javascript
let position = vectors.vec3([0,-0.5,0.5]);
position.x; // 0
position.y; // -0.5
position.z; // 0.5
position.xy; // vec2(0,-0.5)
position.zx; // vec2(0.5,0)
position.yzx; // vec3(-0.5,0.5,0)
let color = vectors.vec4(255,128,64,0.1)
color.rgb; // vec3(255,128,64)
color.bgr; // vec3(64,128,255)
```
...and so on - all aliases and combinations thereof for the xyzw and rgba sets
are available. vec2s only support x/y because r/g is not useful.
@module vectrix/vectors
*/
"use strict";
import * as matrices from "./vectrix.matrices";
let flatten = matrices.flatten;
let {sqrt, min, max, acos} = Math;

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

export const aliasCombos2d = [];
export const aliasCombos3d = [];
export const aliasCombos4d = [];

export const aliases2d = [
	{names:["x"], i:0},
	{names:["y"],i:1}
];

export const aliases3d = [
	{names:["x","r"],i:0},
	{names:["y","g"],i:1},
	{names:["z","b"],i:2}
];

export const aliases4d = [
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
 * @private
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

/**
 * @private
 */
function getAlias(i) {
	/* jshint validthis:true */
	return this[i];
}

/**
 * Generic function wrapper for vector combo aliases (e.g. vector.xy)
 * @private
 */
function getAliasCombo(factory, combo) {
	let vals = combo.map((p) => this[p]);
	return factory(vals);
}

/**
 * Defines vector aliases for a vector based on its length.
 * @private
 */
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
			case 2:factory = create.vec2; break;
			case 3:factory = create.vec3; break;
			case 4:factory = create.vec4; break;
		}
		Object.defineProperty(vec, combos[i].join(""), {
			get:getAliasCombo.bind(vec, factory, combos[i])
		});
	}
}

/**
 * Turns a vector function into a method by wrapping its result in a create()
 * statement.
 * @param {function} method
 * @param {vector} vector
 * @private
 */
function asMethod(method, vector) {
	return function() {
		let res = method.apply(null, [vector].concat(Array.prototype.slice.apply(arguments)));
		if(!(res instanceof Float32Array)) return res;
		switch(res.length) {
			case 2: return wrap(create.vec2(res));
			case 3: return wrap(create.vec3(res));
			case 4: return wrap(create.vec4(res));
			default: return wrap(create(res.length, res));
		}
	}
}

/*
 * End ugly code for generating aliases.
 */


/**
 * @private
 * used in [lerp](#lerp)
 */
function lerp_element(a, b, t) {
	return a+t*(b-a);
}

/**
 * @private
 * used in [cubic](#cubic)
 */
function cubic_step(a, b, c, d, f0, f1, f2, f3) {
	return a*f0 + b*f1 + c*f2 + d*f3;
}

/**
 * Copies values from second operand into first.
 * @example
 * let v = vec3(1,2,3);
 * let v2 = vec2(31,6);
 * copy(v, v2); // vec3(31,6,3);
 *
 * @mutates
 * @function mut_copy
 * @param {vector} a vector to copy into
 * @param {vector} b vector to copy from
 * @return {vector} a, with copied values
 */
export const mut_copy = (() => {
	let i = 0|0, alen = 0|0, blen = 0|0;
	return function mut_copy(a, b) {
		for(i = 0, alen = a.length, blen = b.length;
			i < alen && i < blen; ++i) {
			a[i] = b[i];
		}
		return a;
	}
})();


/**
 * Homogenous coordinates for a vector. 
 *
 * @function homogenous
 * @param {vector} a input vector
 * @param {vector} out (optional) out parameter of one higher dimension than a
 * @return {matrix}
 */
export const homogenous = (function() {
	let i = 0|0, len = 0|0;
	return function homogenous(a, out = undefined) {
		len = a.length;
		out = out||create(a.length+1);
		for(i = 0|0; i < len; ++i) {
			out[i] = a[i];
		}
		out[i] = 1.0;
		return out;
	}
})();

/**
 * Calculate the magnitude of a vector.
 * @example
 * magnitude(vec3(2,3,6)); // ~6.16
 *
 * @function magnitude
 * @param {vector} a operand
 * @return {float} magnitude of a
 */
export const magnitude = (function() {
	let scratch = 0.0, cur = 0.0, i = 0|0, len = 0|0;
	return function magnitude(a) {
		scratch = 0.0;
		for(i = 0, len = a.length; i < len; ++i) {
			cur = a[i];
			scratch = scratch + cur * cur;	
		}
		return sqrt(scratch);
	}
})();

/**
 * Normalize a vector.
 *
 * @example
 * normalize(vector); // function style
 * vector.normalize(); // method style
 *
 * @function normalize
 * @param {vector} a vector to normalize
 * @param {vector} out (optional) a vector of the same dimensions as a
 * @return {vector}
 */
export const normalize = (function() {
	let scale = 0.0, i = 0|0, len = 0|0;
	return function normalize(a, out = undefined) {
		len = a.length;
		out = out||create(len);
		scale = 1/magnitude(a);
		/*
		for(i = 0|0; i < len; ++i) {
			cur = a[i]; // cut out one reference
			sum = sum+cur*cur;
		}
		*/
		for(i = 0; i < len; ++i) {
			out[i] = a[i]*scale;
		}
		return out;
	}
})();

/**
 * Mutating version of [normalize](#normalize).
 * @function mut_normalize
 * @param {vector} a input vector
 * @return {matrix}
 */
export function mut_normalize(a) {
	return normalize(a, a);
}

/**
 * Perform a linear interpolation between two vectors.
 * @function lerp
 * @param {vector} a first operand
 * @param {vector} b second operand
 * @param {float} t interval
 * @param {vector} out (optional) vector of same dimensions as a & b
 * @return {vector}
 */
export const lerp = (function() {
	let i = 0|0, len = 0|0;
	return function lerp(a, b, t, out) {
		len = a.length;
		out = out||create(len);
		for(i = 0|0; i < len; ++i) {
			out[i] = lerp_element(a[i], b[i], t);
		}
		return out;
	}
})();

/**
 * Mutating version of [lerp](#lerp).
 * @function lerp
 * @param {vector} a first operand
 * @param {vector} b second operand
 * @param {float} t interval
 * @param {vector} out (optional) vector of same dimensions as a & b
 * @return {vector}
 */
export function mut_lerp(a, b, t) {
	return lerp(a, b, t, a);
}

/**
 * Perform a cubic bezier interpolation.
 * @function cubic
 * @param {vector} a start point
 * @param {vector} b first control point
 * @param {vector} c second control point
 * @param {vector} d end point
 * @param {float} t interval
 * @param {vector} out (optional) vector of same dimensions as start point 
 * @return {vector}
 */
export const cubic = (function() {
	let i = 0|0, len = 0|0, inv = 0.0, inv2 = 0.0, 
			fs = 0.0, f0 = 0.0, f1 = 0.0, f2 = 0.0, f3 = 0.0;
	return function cubic(a, b, c, d, t, out = undefined) {
		len = a.length;
		out = out||create(len);
		/* parametric cubic bezier, faster than dec */
		inv = 1-t;
		inv2 = inv*inv;
		fs = t*t;
		f0 = inv2 * inv;
		f1 = 3 * t * inv2;
		f2 = 3 * fs * inv;
		f3 = fs * t;
		for(i = 0|0; i < len; ++i) {
			out[i] = cubic_step(a[i], b[i], c[i], d[i], f0, f1, f2, f3);
		}
		return out;
	}
})();

/**
 * Mutating version of [cubic](#cubic).
 * @function mut_cubic
 * @param {vector} a start point
 * @param {vector} b first control point
 * @param {vector} c second control point
 * @param {vector} d end point
 * @param {float} t interval
 * @return {vector} interpolated a
 */
export function mut_cubic(a, b, c, d, t) {
	return cubic(a, b, c, d, t, a);
}


export const dot = (function() {
	let i = 0|0, sum = 0.0;
	return function dot(a, b) {
		sum = 0.0;
		i = a.length;
		while(i--) {
			sum = sum + a[i] * b[i];
		}
		return sum;
	}
})();

/**
 * Vector product for matching vector types. Accepts vectors or generic arrays, 
 * or defaults up to the matrix product if the vectors don't match (which supports
 * vector*matrix and scalar products).
 * @function times
 * @param {vector} a first operand
 * @param {vector|float} b second operand
 * @param {vector} out out vector 
 * @return {matrix|float} product of a and b 
 */
export var times = (function() {
	let i = 0|0;//, len = 0|0;
	return function(a, b, out) {
		i = a.length-1;
		if(typeof b === "number") {
			out = out||new Float32Array(i+1);
			for(;i >= 0; --i) {
				out[i] = a[i] * b;
			}
			return out;
		}
		else return dot(a, b);
	}
})();

/**
 * Mutating version of [times](#times). Note that a is mutated only when a is a vector
 * and b is a scalar.
 *
 * @function times
 * @param {vector} a first operand
 * @param {vector|float} b second operand
 * @return {matrix|float} mutated a, product of a and b 
 */
export function mut_times(a, b) {
	return times(a, b, a);
}


/**
 * Find the angle between two vectors in radians.
 * @function angle
 * @param {vector} a first operand
 * @param {vector} b second operand
 * @return {vector}
 */
export const angle = (function() {
	let anorm, bnorm;
	return function angle(a, b) {
		anorm = normalize(a);
		bnorm = normalize(b);
		return acos(times(anorm, bnorm));
	}
})();


/**
 * Find the distance between two vectors.
 * @function distance
 * @param {vector} a first operand
 * @param {vector} b second operand
 * @return {float} distance
 */
export const distance = (function() {
	let i = 0|0, len = 0|0, sum = 0.0, tmp = 0.0;
	return function distance(a, b) {
		sum = 0.0;
		len = a.length;
		for(i = 0|0; i < len; ++i) {
			tmp = b[i] - a[i];
			sum = sum + tmp*tmp;
		}
		return sqrt(sum);
	}
})();


/**
 * Vector cross products are technically only defined for 3D, but 2D can be
 * crossed with implicit z=0
 * @function cross
 * @param {vector} a first operand
 * @param {vector|float} b second operand
 * @param {vec3} out parameter
 * @return {Float32Array(3)} cross product
 */
export const cross = (function() {
	let a0 = 0.0; let a1 = 0.0; let a2 = 0.0;
	let b0 = 0.0; let b1 = 0.0; let b2 = 0.0;
	return function cross(a, b, out) {
		if(a.length > 3 || b.length > 3 || a.length < 2 || b.length < 2) return undefined;
		out = out||create(3);
		a0 = a[0]; a1 = a[1]; a2 = a[2]||0.0;
		b0 = b[0]; b1 = b[1]; b2 = b[2]||0.0;
		out[0] = a1*b2 - a2*b1;
		out[1] = a2*b0 - a0*b2;
		out[2] = a0*b1 - a1*b0;
		/*
		mut_copy(scratcha, a);
		mut_copy(scratchb, b);
		if(a.length === 2) scratcha[2] = 0;
		if(b.length === 2) scratchb[2] = 0;
		out[0] = scratcha[1]*scratchb[2] - scratcha[2]*scratchb[1];
		out[1] = scratcha[2]*scratchb[0] - scratcha[0]*scratchb[2];
		out[2] = scratcha[0]*scratchb[1] - scratcha[1]*scratchb[0];
		*/
		return out;
	}
})();

/**
 * Restricts scalar or vector values to a range.
 * @example
 * let v = vectors.create.vec3([-5,100, -22]); // vec3(-5,100, -22)
 * clamp(v, -10, 10); // vec3(-5, 10, -10);
 * let s = 23.0;
 * clamp(s, 0, 5); // 5
 *
 * @function clamp
 * @param {vector} a vector or scalar to clamp
 * @param {float} minv minimum value
 * @param {float} maxv maximum value
 * @param {vector} out output vector
 * @return {vector} clamped vector
 */
export var clamp = (() => {
	let i = 0|0, len = 0|0;
	function clamp_s(a, minv, maxv) {
		return max(min(a, maxv), minv)
	}
	return function(a, minv, maxv, out) {
		if(typeof(a) === "number") return clamp_s(a, minv, maxv);
		out = out||new Float32Array(a.length);
		for(i = 0, len = a.length; i < len; ++i) {
			out[i] = clamp(a[i], minv, maxv);
		}
		return out;
	}
})();

/**
 * Mutating version of [clamp](#clamp).
 * @return {vector} the mutated vector
 */
export function mut_clamp(a, min, max) {
	return clamp(a, min, max, a);
}

/**
 * Get a string representation of a vector.
 * @example
 * vectors.create.vec2([23,1]).toString(); // vec2(23.00, 1.00)
 * vectors.toString(vectors.create.vec2([23,1])); // vec2(23.00, 1.00)
 * @param {vector} a input vector
 * @return {string}
 */
export function toString(a) {
	let strings = a.toArray().map((cur) => cur.toFixed(2));
	return "vec"+a.length+"("+strings.join(", ")+")";
}

/**  
 * Creates a new vector. Note that vectors created directly with this function
 * will not have convenience aliases, meaning they're initialized faster but...
 * ah, less convenient. Can be supplied with an optional arraybuffer view and optional
 * offset to that view as the last or last two parameters.
 * @example
 * create(2); // vector[0,0]
 * create(2, 3.3, 3.2); // vector[3.3,3.2]
 * create(2, [3.3, 3.2]); // vector[3.3,3.2] from an array
 * create(2, 3.3, 3.2, new ArrayBuffer(2*4)); // vector[3.3,3.2] as view of ArrayBuffer
 * create(2, 3.3, 3.2, new ArrayBuffer(3*4), 4); // vector[3.3,3.2] as view of ArrayBuffer, offset by 4 bytes
 * create(2, [3.3, 3.2], new ArrayBuffer(3*4), 4); // vector[3.3,3.2] as view of ArrayBuffer, offset by 4 bytes, from an array
 *
 * @function create
 * @param {int} len [2...4] vector length
 * @param {mixed} args values in any combination of array-like and scalar values
 * @param {ArrayBuffer} buffer (optional) an array buffer to create the vector on 
 * @param {offset} offset (optional) offset for the buffer, ignored if buffer is not supplied 
 * @return {vector}
 */
export function create() {
	var len = arguments.length, vec;
	if(len === 0) throw new Error("vectors.create requires at least one argument");
	else if(len === 1) {
		vec = new Float32Array(arguments[0]);
	}
	else {
		let params = Array.prototype.slice.apply(arguments), buffer, offset = 0, size = params.shift(), len = params.length;
		if((len > 0) && params[len-1] instanceof ArrayBuffer) { // supplied buffer, no offset
			offset = 0;
			buffer = params.pop();
		}
		else if((len > 1) && params[len-2] instanceof ArrayBuffer) { // supplied buffer + offset
			offset = params.pop();
			buffer = params.pop();
		}
		if(buffer !== undefined) {
			vec = new Float32Array(buffer, offset, size);
		}
		else vec = new Float32Array(size);
		if(params.length > 0) vec.set(flatten(params));
	}
	return vec;
}

/**
 * Wraps a vector or array-like object with vector functions as methods.
 * @param {array-like} vec the vector to wrap
 * @return {vector} the wrapped vector
 */
export function wrap(vec) {
	// define vector-specific methods
	matrices.wrap(vec, vec.length, 1);
	vec.toString = asMethod(toString, vec);
	vec.homogenous = asMethod(homogenous, vec);
	vec.times = asMethod(times, vec);
	vec.lerp = asMethod(lerp, vec);
	vec.cubic = asMethod(cubic, vec);
	vec.dot = asMethod(dot, vec);
	vec.clamp = asMethod(clamp, vec);
	vec.angle = angle.bind(null, vec);
	vec.magnitude = magnitude.bind(null, vec);
	vec.distance = distance.bind(null, vec);
	vec.normalize = asMethod(normalize, vec);
	vec.mut_normalize = asMethod(mut_normalize, vec);
	vec.mut_times = asMethod(mut_times, vec);
	vec.mut_lerp = asMethod(mut_lerp, vec);
	vec.mut_cubic = asMethod(mut_cubic, vec);
	vec.mut_clamp = asMethod(mut_clamp, vec);
	vec.mut_copy = asMethod(mut_copy, vec);
	if(vec.length === 2 || vec.length === 3) vec.cross = asMethod(cross, vec);
	defineAliases(vec);
	return vec;
}

/**
 * Creates a 2d vector. Curried version of [create](#create) with first argument presupplied.
 * @function create.vec2
 * @return {vector}
 */
export const vec2 = create.vec2 = create.bind(null, 2);
/** 
 * Creates a 3d vector. Curried version of [create](#create) with first argument presupplied.
 * @function create.vec3
 * @return {vector}
 */
export const vec3 = create.vec3 = create.bind(null, 3);
/** 
 * Creates a 4d vector. Curried version of [create](#create) with first argument presupplied.
 * @function create.vec4
 * @return {vector}
 */
export const vec4 = create.vec4 = create.bind(null, 4);
