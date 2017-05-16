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
// frequently used scratch values (!cannot be used with loops containing nested functions that also contain global loops!)
let ROW_MAX = 10;
let COL_MAX = 10;
/**
 * Flattens an array. Used for flattening arguments passed to factories. 
 * @private
 */
export const flatten = function(input) {
	if(typeof(input) !== "object") return input;
	let i = 0, len = input.length, out = [];
	for(;i < len; ++i) {
		out = out.concat(flatten(input[i]));
	}
	return out;
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
			out = create(jl, kl);
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
export function matToString(a) {
	let string = "matrix(",
			c = a.cols,
			r = a.rows,
	    padLeft = function(l,s) {return Array(l-s.length+1).join(" ")+s},
	    strings = a.toArray().map((cur) => cur.toFixed(2)),
	    colWidths = new Array(c).fill(0);
	for(let i = 0; i < r; ++i) {
		let row = strings.slice(i*c, 2*(i+1)*c);
		for(let n = 0; n < c; ++n) {
			let strLen = row[n].length;
			colWidths[i] = strLen > colWidths[i]?strLen:colWidths[i];
		}
	}
	for(let i = 0, len = strings.length; i < len; ++i) {
		strings[i] = padLeft(colWidths[i%c], strings[i]);
		if(i > 0) {
			if(i % c === 0) string += "\n       ";
			else string += ", ";
		}
		string += strings[i];
	}
	return string + ")";
}

const cos = Math.cos;
const sin = Math.sin;

/*
 * Matrix factories
 */

/**
 * Factory for creating generic matrices.
 * @function create
 * @param {int} rows matrix rows
 * @param {int} cols matrix columsn
 * @param {array-like} values matrix values as an array
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
	matrix.plus = plus.bind(null, matrix);
	matrix.minus = minus.bind(null, matrix);
	matrix.dot = dot.bind(null, matrix);
	matrix.col = col.bind(null, matrix);
	matrix.row = row.bind(null, matrix);
	matrix.toArray = toArray.bind(null, matrix);
	matrix.toString = matToString.bind(null, matrix);
	return matrix;
}

/**
 * Creates an identity matrix of arbitrary dimensions.
 * @example
 * matrices.create.identity(4); // a 4x4 identity matrix
 * @param {int} n dimensions of the matrix
 * @return {matrix} identity matrix 
 */
create.identity = function(n) {
	// predefine common cases to save needless work
	switch(n) {
	case 2: return this(2, 2, [1,0,     0,1]);
	case 3: return this(3, 3, [1,0,0,   0,1,0,   0,0,1]);
	case 4: return this(4, 4, [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
	default:
		let arr = new Array(n*n);
		arr.fill(0);
		for(let i = 0, len = arr.length, j = n+1; i < len; i+=j) arr[i] = 1;
		return create(n, n, arr);
	}
}

/**
 * Creates a translation matrix for a homogenous coordinate in 2D or 3D space. 
 * @example
 * let vec = vectors.create.vec3(3,4,5).toHomogenous();
 * matrices.create.identity(vec); // translates by 3x, 4y, 5z
 * @param {vector} v vector representing the distance to translate 
 * @return {matrix} 3x3 or 4x4 matrix
 */
create.translation = function(v) {
	switch(v.length) {
		case 2: return create(3, 3, [1,0,  v[0], 0,1,  v[1], 0,0,1]);
		case 3: return create(4, 4, [1,0,0,v[0], 0,1,0,v[1], 0,0,1,v[2], 0,0,0,1]);
		default: return undefined;
	}
}

/**
 * Creates a rotation matrix around absolute Y axis of angle r.
 * @example
 * matrices.create.rotateY(1.5708); // 90 degree rotation around Y axis
 * @param {radian} r angle as a radian
 * @return {matrix} 3x3 matrix
 */
create.rotateY = function(r) {
	return this(3, 3, [cos(r),0,sin(r), 0,1,0, -sin(r),sin(r),-cos(r)]);
}

/**
 * Creates a rotation matrix around absolute X axis of angle r.
 * @example
 * matrices.create.rotateX(1.5708); // 90 degree rotation around X axis
 * @param {radian} r angle as a radian
 * @return {matrix} 3x3 matrix
 */
create.rotateX = function(r) {
	return this(3, 3, [cos(r),-sin(r),0, sin(r),cos(r),0, 0,0,1]);
}

/**
 * Creates a rotation matrix around absolute Z axis of angle r.
 * @example
 * matrices.create.rotateZ(1.5708); // 90 degree rotation around Z axis
 * @param {radian} r angle as a radian
 * @return {matrix} 3x3 matrix
 */
create.rotateZ = function(r) {
	return this(3, 3, [1,0,0, 0,cos(r),-sin(r), 0,sin(r),cos(r)]);
}
