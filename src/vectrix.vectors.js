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
let {sqrt, min, max} = Math;

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
 * @param {vector} vector
 * @param {function} method
 * @private
 */
function asMethod(method, vector) {
	return function() {
		let res = method.apply(null, [vector].concat(Array.prototype.slice.apply(arguments)));
		if(!(res instanceof Float32Array)) return res;
		switch(res.length) {
			case 2: return create.vec2(res);
			case 3: return create.vec3(res);
			case 4: return create.vec4(res);
			default: return create(res.length, res);
		}
	}
}

/*
 * End ugly code for generating aliases.
 */

/**
 * Homogenous coordinates for a vector. Note this does not return
 * a vector because it's not really useful to do so.
 *
 * @function homogenous
 * @param {vector} a input vector
 * @return {matrix}
 */
export function homogenous(a) {
	return Float32Array.from(Array.prototype.concat.call(Array.prototype.slice.call(a), [1]));
	//return matrices.create(a.length+1,1,a.toArray().concat(1));
}

/**
 * Normalize a vector.
 *
 * @example
 * normalize(vector); // function style
 * vector.normalize(); // method style
 *
 * @function normalize
 * @param {vector} a vector to normalize
 * @return {vector}
 */
export function normalize(a) {
	let sum = a.map((cur) => cur*cur).reduce((prev, cur) => prev+cur, 0);
	return a.map((cur) => cur*1/sqrt(sum));
}

/**
 * Perform a linear interpolation between two vectors.
 * @function lerp
 * @param {vector} a first operand
 * @param {vector} b second operand
 * @param {float} t interval
 * @return {vector}
 */
export function lerp(a, b, t) {
	return a.map((cur, i) => a[i]+t*(b[i]-a[i]));
}

/**
 * Perform a cubic bezier interpolation
 * @function cubic
 * @param {vector} a start point
 * @param {vector} b first control point
 * @param {vector} c second control point
 * @param {vector} d end point
 * @param {float} t interval
 * @return {vector}
 */
export function cubic(a, b, c, d, t) {
	/* parametric cubic bezier, faster than dec */
	let inv = 1-t,
			inv2 = inv*inv,
			fs = t*t,
			f0 = inv2 * inv,
			f1 = 3 * t * inv2,
			f2 = 3 * fs * inv,
			f3 = fs * t;
	return a.map((cur, i) => a[i]*f0 + b[i]*f1 + c[i]*f2 + d[i]*f3);	
}

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
export var times = (() => {
	let i = 0|0, len = 0|0, scratch = new Float32Array(4), sum = 0.0;
	return function(a, b, out) {
		out = out||new Float32Array(a.length);
		if(typeof(b) === "number") {
			for(i = 0, len = a.length; i < len; ++i) {
				out[i] = a[i] * b;
			}
			return out;
		}
		else {
			len = a.length;
			for(i = 0; i < len; ++i) {
				scratch[i] = a[i] * b[i];
			}
			sum = 0.0;
			for(i = 0; i < len; ++i) {
				sum += scratch[i];
			}
			return (out = sum);
		}
	}
})();

/**
 * Mutating version of [times](#times).
 * Note that non-scalar values of b will mutate a to a scalar, be careful!
 *
 * @function times
 * @param {vector} a first operand
 * @param {vector|float} b second operand
 * @return {matrix|float} product of a and b 
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
export function angle(a, b) {
	let anorm = normalize(a);
	let bnorm = normalize(b);
	var cos = times(anorm, bnorm);
	return cos < 1.0?Math.acos(cos):0;
}


/**
 * Find the distance between two vectors.
 * @function distance
 * @param {vector} a first operand
 * @param {vector} b second operand
 * @return {float} distance
 */
export function distance(a, b) {
	let dist = a.map((cur, i) => b[i] - a[i]);
	return sqrt(dist.map((cur) => cur*cur).reduce((p, c) => p + c), 0);
}


/**
 * Vector cross products are technically only defined for 3D, but 2D can be
 * crossed with implicit z=0
 * @function cross
 * @param {vector} a first operand
 * @param {vector|float} b second operand
 * @return {vector} cross product
 */
export function cross(a, b) {
	if(a.length > 3 || b.length > 3 || a.length < 2 || b.length < 2) return undefined;
	if(a.length == 2) a = [a[0], a[1], 0];
	if(b.length == 2) b = [b[0], b[1], 0];
	return Float32Array.of(
		a[1]*b[2] - a[2]*b[1],
		a[2]*b[0] - a[0]*b[2],
		a[0]*b[1] - a[1]*b[0]
	);
}


/**
 * Restricts vector values to a range.
 * @example
 * let v = vectors.create.vec3([-5,100, -22]); // vec3(-5,100, -22)
 * clamp(v, -10, 10); // vec3(-5, 10, -10);
 *
 * @function clamp
 * @param {vector} a vector to clamp
 * @param {float} minv minimum value
 * @param {float} maxv maximum value
 * @param {vector} out output vector
 * @return {vector} clamped vector
 */
export var clamp = (() => {
	let i = 0|0, len = 0|0;
	return function(a, minv, maxv, out) {
		out = out||new Float32Array(a.length);
		for(i = 0, len = a.length; i < len; ++i) {
			out[i] = max(min(a[i], maxv), minv);
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
 * vecToString(vectors.create.vec2([23,1])); // vec2(23.00, 1.00)
 * @param {vector} a input vector
 * @return {string}
 */
export function vecToString(a) {
	let strings = a.toArray().map((cur) => cur.toFixed(2));
	return "vec"+a.length+"("+strings.join(", ")+")";
}

/**  
 * Creates a new vector. Note that vectors created directly with this function
 * will not have convenience aliases, meaning they're initialized faster but...
 * ah, less convenient.
 * @function create
 * @param {int} len [2...4] vector length
 * @param {mixed} args values in any combination of array-like and scalar values
 * @return {vector}
 */
export function create(len, args) {
	let params = Array.prototype.slice.apply(args);
	let vals = [];
	if(params.length === 0) vals = new Array(len).fill(0);
	else vals = args;
	let vec = matrices.create(len,1,vals);
	// define vector-specific methods
	vec.homogenous = asMethod(homogenous, vec);
	vec.times = asMethod(times, vec);
	vec.normalize = asMethod(normalize, vec);
	vec.lerp = asMethod(lerp, vec);
	vec.cubic = asMethod(cubic, vec);
	vec.angle = asMethod(angle, vec);
	vec.distance = asMethod(distance, vec);
	vec.toString = asMethod(vecToString, vec);
	return vec;
}

/**
 * Creates a 2d vector.
 * @function create.vec2
 * @return {vector}
 */
export const vec2 = create.vec2 = function() {
	let vec = create(2, arguments);
	vec.cross = asMethod(cross, vec);
	defineAliases(vec);
	return vec;
}

/** 
 * Creates a 3d vector.
 * @function create.vec3
 * @return {vector}
 */
export const vec3 = create.vec3 = function() {
	let vec = create(3, arguments);
	vec.cross = asMethod(cross, vec);
	defineAliases(vec);
	return vec;
}

/** 
 * Creates a 4d vector.
 * @function create.vec4
 * @return {vector}
 */
export const vec4 = create.vec4 = function() {
	let vec = create(4, arguments);
	defineAliases(vec);
	return vec;
}

