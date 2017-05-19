/**
Require the module:
```javascript
const matrices = require("vectrix.matrices.js");
```

Create a 2x2 matrix using `create(rows, columns, values)`:
```javascript
let mat = matrices.create(2,2,[0,1, 2,3]);
```

Add two matrices using `a.plus(b)`:
```javascript
let first =  matrices.create(2,2,[1,2, 3,4]);
let second = matrices.create(2,2,[3,4, 5,6]);
let sum = first.plus(second);
```

Subtract two matrices with `a.minus(b)`:
```javascript
let diff = second.minus(first);
```

Get the dot product of two matrices via `a.dot(b)`:
```javascript
let prod = first.dot(second);
```

Dot can also multiply a matrix by a scalar:
```javascript
let scalarProd = first.dot(3);
```

All matrix and vector methods produce a new object from their operands, creating and
returning a new object as a result.
```javascript
sum.toArray(); // [4,6,8,10]
diff.toArray(); // [2,2,2,2]
product.toArray(); // [13,16,29,26]
first.toArray(); // [1,2,3,4]
second.toArray(); // [3,4,5,6]
scalarProd; // [3,6,9,12]
```

This means matrix operations are composable in an intuitive left-to-right fashion:
```javascript
first.sub(second).dot(diff).toArray(); // [8,8,8,8]
```

But keep in mind that you must follow matrix operation rules! Operating on two
incompatible matrices returns undefined:
```javascript
let third = matrices.create(1,2,[0,1]);
first.add(third); // undefined
```

It turned out to be useful to get a single row or column from a matrix, so you can
do that too using `mat.row(N)` and `mat.col(N)`:
```javascript
first.row(0); // matrix(2,1,[1,2])
first.col(1); // matrix(1,2,[2,4])
```
@module vectrix/matrices
*/

"use strict";
// set the max size for certain matrix operations, used in creating scratch memory
const ROW_MAX = 20, COL_MAX = 20;
const {cos, sin} = Math;

/**
 * Flattens an array. Used for flattening arguments passed to factories. 
 * @function flatten
 * @param {mixed} a an array, array-like, or object that can be flattened
 * @return {mixed} flat version of input
 */
export function flatten(a) {
	// cheap array-like check, may not always be reliable
	if(a instanceof Object && typeof a.length == "number") {
		let i = 0, len = a.length, out = [];
		for(;i < len; ++i) {
			out = out.concat(flatten(a[i]));
		}
		return out;
	}
	else return a;
}

/**
 * Add two matrices together.
 * @example
 * plus(matrix, anotherMatrix); // function
 * matrix.plus(anotherMatrix); // method
 * @function plus
 * @param {matrix} a first matrix
 * @param {matrix} b second matrix
 * @param {matrix} out out value (optional)
 * @return {matrix}
 */
export const plus = (function() {
	let i = 0|0, len = 0|0;
	return function plus(a, b, out) {
		if(typeof(b) === "number") {
			out = out||create(a.rows, a.cols);
			for(i = 0, len = a.length; i < len; ++i) {
				out[i] = a[i] + b;
			}
			return out;
		}
		else if ((a.cols === b.cols) && (a.rows === b.rows)) { 
			out = out||create(a.rows, a.cols);
			for(i = 0, len = a.length; i < len; ++i) {
				out[i] = a[i] + b[i]
			}
			return out;
		}
		else return undefined;
	}
})();

/**
 * Mutating version of [plus](#plus).
 *
 * @function mut_plus
 * @param {matrix} a first matrix
 * @param {matrix} b second matrix
 * @param {matrix} out out value (optional)
 * @return {matrix}
 */
export function mut_plus(a, b) {
	return plus(a, b, a);
}

/**
 * Subtract matrices.
 * @example
 * minus(matrix, anotherMatrix); // function
 * matrix.minus(anotherMatrix); // method
 * @param {matrix} a first matrix
 * @param {matrix} b second matrix
 * @return {matrix}
 */
export const minus = (function() {
	let i = 0|0, len = 0|0;
	return function minus(a, b, out) {
		if(typeof(b) === "number") {
			out = out||create(a.rows, a.cols);
			for(i = 0, len = a.length; i < len; ++i) {
				out[i] = a[i] - b;
			}
			return out;
		}
		else if((a.cols === b.cols) && (a.rows === b.rows)) { 
			out = out||create(a.rows, a.cols);
			for(i = 0, len = a.length; i < len; ++i) {
				out[i] = a[i] - b[i]
			}
			return out;
		}
		else return undefined;
	}
})();

/**
 * Mutating version of [minus](#minus).
 *
 * @function mut_minus
 * @param {matrix} a first matrix
 * @param {matrix} b second matrix
 * @param {matrix} out out value (optional)
 * @return {matrix}
 */
export function mut_minus(a, b) {
	return minus(a, b, a);
}

/**
 * Get a single column from a matrix.
 * @example
 * col(matrix, 2); // function
 * matrix.col(2); // method
 * @param {matrix} a source matrix
 * @param {n} column number (zero indexed)
 * @param {matrix} out (optional) out parameter, same rows, 1 column
 * @return {matrix} a single column from the source matrix
 */
export const col = (function() {
	let i = 0|0, len = 0|0;
	return function col(a, n, out) {
		out = out||create(a.rows, 1);
		let cols = a.cols;
		for(i = 0, len = a.rows; i < len; ++i) {
			out[i] = a[i*cols+n]
		}
		return out;
	}
})();

/**
 * Get a single row from a matrix.
 * @example
 * row(matrix, 2); // function
 * matrix.row(2); // method
 * @param {matrix} a source matrix
 * @param {n} row number (zero indexed)
 * @param {matrix} out (optional) out parameter with rows = a.cols, cols = 1 
 * @return {matrix} a single row from the source matrix
 */
export const row = (function() {
	let i = 0|0, len = 0|0;
	return function row(a, n, out) {
		out = out||create(1, a.cols);
		let cols = a.cols;
		for(i = 0, len = a.cols; i < len; ++i) {
			out[i] = a[cols*n+i]
		}
		return out;
	}
})();

/**
 * Multiply matrices. Supports up to ROW_MAX x COL_MAX matrices for now.
 * @example
 * dot(matrix, anotherMatrix); // function 
 * matrix.dot(anotherMatrix); // method
 * @param {matrix} a first matrix
 * @param {matrix} b second matrix
 * @param {matrix} out (optional) out parameter 
 * @return {matrix}
 */
export const dot = (function() {
	let rowscratch = new Float32Array(ROW_MAX), 
		  colscratch = new Float32Array(COL_MAX);
	let i = 0|0, len = 0|0, j = 0|0, jl = 0|0, k = 0|0, kl = 0|0, 
	    m = 0|0, ml = 0|0, sum = 0.0;
	return function dot(a, b, out) {
		if(typeof(b) === "number") {
			out = out||create(a.rows, a.cols);
			for(i = 0, len = a.length; i < len; ++i) {
				out[i] = a[i] * b;
			}
			return out;
		}
		else if(a.cols === b.rows) {
			jl = a.rows;
			kl = b.cols;
			ml = b.rows;
			out = out||create(jl, kl);
			for(j = 0; j < jl; ++j) { // row loop
				row(a, j, rowscratch);
				for(k = 0; k < kl; ++k) { // column loop
					col(b, k, colscratch);
					sum = 0.0;
					for(m = 0; m < ml; ++m) { // sum loop
						sum = sum + rowscratch[m]*colscratch[m];
					}
					out[(j * kl) + k] = sum;
				}
			}
			return out;
		}
		else return undefined;
	}
})();


/**
 * Get the basic array representation of a matrix.
 * @example
 * toArray(matrix); // function
 * matrix.toArray(); // method
 * @param {matrix} a
 * @return {array} values as flat array
 */
export function toArray(a) {
	return Array.prototype.slice.apply(a);
}

/**
 * Get a nicely formatted string representation of a matrix.
 * @example
 * matToString(matrix); // function
 * matrix.toString(); // method
 * @param {matrix} a
 * @return {string}
 */
export const toString = (function() {
	let label = "matrix(", string = "", c = 0|0, r = 0|0, i = 0|0, len = 0|0,
		strings, colWidth, row;
	function padLeft(l,s) {
		return ((" ").repeat(l)+s).slice(-l);
	}
	function makeStrings(a) {
		return a.toArray().map((cur) => cur.toFixed(2));
	}
	return function toString(a) {
		c = a.cols|0;
		r = a.rows|0;
		string = label;
		strings = makeStrings(a);
		colWidth = strings.reduce((a, b) => Math.max(a, b.length), 0);
		for(i = 0; i < r; ++i) {
			row = strings.slice(i*c, 2*(i+1)*c);
		}
		for(i = 0, len = strings.length; i < len; ++i) {
			strings[i] = padLeft(colWidth, strings[i]);
			if(i > 0) {
				if(i % c === 0) string += "\n       ";
				else string += ", ";
			}
			string += strings[i];
		}
		return string + ")";
	}
})();

/*
 * Matrix factories
 */

/**
 * Factory for creating generic matrices.
 * @function create
 * @param {int} rows matrix rows
 * @param {int} cols matrix columns
 * @param {mixed} values (optional) matrix values as an array-like object
 * @param {ArrayBuffer} buffer (optional) pre-supplied ArrayBuffer
 * @param {int} offset (optional) offset for buffer
 * @return {matrix}
 */
export function create(rows, cols, values = [], buffer = undefined, offset = 0) {
	var matrix;
	if(buffer) {
		matrix = new Float32Array(buffer, offset, cols * rows);
	}
	else {
		matrix = new Float32Array(cols * rows);
	}
	var vals = flatten(values);
	matrix.rows = rows;
	matrix.cols = cols;
	if(vals.length) matrix.set(vals);
	else matrix.fill(0.0); // just in case it was a previously used buffer
	matrix.toArray = toArray.bind(null, matrix);
	matrix.toString = toString.bind(null, matrix);
	matrix.col = col.bind(null, matrix);
	matrix.row = row.bind(null, matrix);
	matrix.wrap = wrap.bind(null, matrix);
	return matrix;
}

export function wrap(matrix) {
	matrix.plus = plus.bind(null, matrix);
	matrix.minus = minus.bind(null, matrix);
	matrix.dot = dot.bind(null, matrix);
	return matrix;
}

/**
 * Creates an identity matrix of arbitrary dimensions.
 * @example
 * matrices.create.identity(4); // a 4x4 identity matrix
 * @param {int} n dimensions of the matrix
 * @param {ArrayBuffer} buffer (optional) pre-supplied ArrayBuffer
 * @param {int} offset (optional) offset for buffer
 * @return {matrix} identity matrix 
 */
create.identity = (function() {
	let i = 0|0, len = 0|0, j = 0|0;
	return function identity(n, buffer = undefined, offset = 0) {
		n = n|0;
		let m = create(n, n, undefined, buffer, offset);
		for(i = 0|0, len = n*n, j = n+1|0; i < len; i+=j) m[i] = 1.0;
		return m;
	}
})();

/**
 * Creates a translation matrix for a homogenous coordinate in 2D or 3D space. 
 * @example
 * let vec = vectors.create.vec3(3,4,5).toHomogenous();
 * matrices.create.identity(vec); // translates by 3x, 4y, 5z
 * @param {vector} v vector representing the distance to translate 
 * @return {matrix} 3x3 or 4x4 matrix
 */
create.translation = (function() {
	let v2 = Float32Array.from([1.0,0.0,0.0,
															0.0,1.0,0.0,
															0.0,0.0,1.0]); 
	let v3 = Float32Array.from([1.0,0.0,0.0,0.0,
														  0.0,1.0,0.0,0.0, 
															0.0,0.0,1.0,0.0, 
															0.0,0.0,0.0,1.0]);
	return function translation(v, buffer = undefined, offset = 0) {
		switch(v.length) {
			case 2: 
				v2[2] = v[0];
				v2[5] = v[1];
				return create(3, 3, v2, buffer, offset);
			case 3: 
				v3[3]  = v[0];
				v3[7]  = v[1];
				v3[11] = v[2];
				return create(4, 4, v3, buffer, offset);
			default: return undefined;
		}
	}
})();

/**
 * Creates a rotation matrix around absolute X axis of angle r.
 * @example
 * matrices.create.rotateX(1.5708); // 90 degree rotation around X axis
 * @param {radian} r angle as a radian
 * @return {matrix} 3x3 matrix
 */
create.rotateX = (function() {
	let cosr = 0.0, sinr = 0.0, scratch = Float32Array.from([
		1.0,0.0,0.0,
		0.0,1.0,0.0,
		0.0,0.0,1.0
	]);
	return function rotateX(r, buffer = undefined, offset = 0) {
		cosr = cos(r);
		sinr = sin(r);
		scratch[4] = cosr;
		scratch[5] = -sinr;
		scratch[7] = sinr;
		scratch[8] = cosr;
		return create(3, 3, scratch, buffer, offset);
	}
})();

/**
 * Creates a rotation matrix around absolute Y axis of angle r.
 * @example
 * matrices.create.rotateY(1.5708); // 90 degree rotation around Y axis
 * @param {radian} r angle as a radian
 * @return {matrix} 3x3 matrix
 */
create.rotateY = (function() {
	let cosr = 0.0, sinr = 0.0, scratch = Float32Array.from([
		1.0,0.0,0.0,
		0.0,1.0,0.0,
		0.0,0.0,1.0
	]);
	return function rotateY(r, buffer = undefined, offset = 0) {
		cosr = cos(r);
		sinr = sin(r);
		scratch[0] = cosr;
		scratch[2] = sinr;
		scratch[6] = -sinr;
		scratch[8] = cosr;
		return create(3, 3, scratch, buffer, offset);
	}
})();

/**
 * Creates a rotation matrix around absolute Z axis of angle r.
 * @example
 * matrices.create.rotateZ(1.5708); // 90 degree rotation around Z axis
 * @param {radian} r angle as a radian
 * @return {matrix} 3x3 matrix
 */
create.rotateZ = (function() {
	let cosr = 0.0, sinr = 0.0, scratch = Float32Array.from([
		1.0,0.0,0.0,
		0.0,1.0,0.0,
		0.0,0.0,1.0
	]);
	return function rotateZ(r, buffer = undefined, offset = 0) {
		cosr = cos(r);
		sinr = sin(r);
		scratch[0] = cosr;
		scratch[1] = -sinr;
		scratch[3] = sinr;
		scratch[4] = cosr;
		return create(3, 3, scratch, buffer, offset);
	}
})();
