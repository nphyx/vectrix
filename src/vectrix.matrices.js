/**
Matrices
========

Usage
-----
Require the module:
```javascript
const matrices = require("vectrix.matrices.js");
```

Create a 2x2 matrix using `create(rows, columns, values)`:
```javascript
let mat = matrices.create(2,2,[0,1, 2,3]);
```

Add two matrices using `a.add(b)`:
```javascript
let first =  matrices.create(2,2,[1,2, 3,4]);
let second = matrices.create(2,2,[3,4, 5,6]);
let sum = first.add(second);
```

Subtract two matrices with `a.sub(b)`:
```javascript
let diff = second.sub(first);
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
/**
 * Flattens an array. Used for flattening arguments passed to factories. 
 * @private
 */
var flatten = function(input) {
	if(typeof(input) !== "object") return input;
	let out = [];
	for(let i = 0, len = input.length; i < len; ++i) {
		out = out.concat(flatten(input[i]));
	}
	return out;
}

/**
 * Add two matrices together.
 * @example
 * plus(matrix, anotherMatrix); // function
 * matrix.plus(anotherMatrix); // method
 * @param {matrix} a first matrix
 * @param {matrix} b second matrix
 * @return {matrix}
 */
function plus(a, b) {
	if(typeof(b) === "number") return create(a.rows,a.cols, a.map((cur) => cur + b));
	else if ((a.cols === b.cols) && (a.rows === b.rows)) { 
		return create(a.rows, a.cols, a.map((cur, i) => cur + b[i]))
	}
	else return undefined;
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
function minus(a, b) {
	if(typeof(b) === "number") return create(a.rows, a.cols, a.map((cur) => cur - b));
	else if((a.rows === b.rows) && (a.cols === b.cols)) return create(a.rows, a.cols, a.map((cur, i) => cur - b[i]));
	else return undefined;
}

/**
 * Multiply matrices.
 * @example
 * dot(matrix, anotherMatrix); // function 
 * matrix.dot(anotherMatrix); // method
 * @param {matrix} a first matrix
 * @param {matrix} b second matrix
 * @return {matrix}
 */
function dot(a, b) {
	if(typeof(b) === "number") return create(a.rows, a.cols, a.map((cur) => cur*b));
	else if(a.cols === b.rows) {
		let out = [];
		for(let i = 0; i < a.rows; i++) {
			let row = a.row(i);
			for(let n = 0; n < b.cols; n++) {
				let col = b.col(n);
				let sum = 0;
				for(let m = 0; m < col.length; m++) {
					sum += col[m]*row[m];
				}
				out.push(sum);
			}
		}
		return create(a.rows, b.cols, out);
	}
	else return undefined;
}

/**
 * Get a single column from a matrix.
 * @example
 * col(matrix, 2); // function
 * matrix.col(2); // method
 * @param {matrix} a source matrix
 * @param {n} column number (zero indexed)
 * @return {matrix} a single column from the source matrix
 */
function col(a, n) {
	let out = new Float32Array(a.rows);
	for(let i = 0; i < a.rows; i++) {
		out[i] = a[i*a.cols+n]
	}
	return out;
}

/**
 * Get a single row from a matrix.
 * @example
 * row(matrix, 2); // function
 * matrix.row(2); // method
 * @param {matrix} a source matrix
 * @param {n} row number (zero indexed)
 * @return {matrix} a single row from the source matrix
 */
function row(a, n) {
	let out = new Float32Array(a.cols);
	for(let i = 0; i < a.cols; i++) {
		out[i] = a[a.cols*n+i]
	}
	return out;
}

/**
 * Get the basic array representation of a matrix.
 * @example
 * toArray(matrix); // function
 * matrix.toArray(); // method
 * @param {matrix} a
 * @return {array} values as flat array
 */
function toArray(a) {
	return [].slice.apply(a);
}

const cos = Math.cos;
const sin = Math.sin;

/*
 * Matrix factories
 */

/**
 * Factory for creating generic matrices.
 * @param {int} rows matrix rows
 * @param {int} cols matrix columsn
 * @param {array-like} values matrix values as an array
 * @return {matrix}
 */
function create(rows, cols, values = []) {
	var matrix = new Float32Array(cols * rows);	
	var vals = flatten(values);
	matrix.cols = cols;
	matrix.rows = rows;
	if(vals.length) matrix.set(vals);
	matrix.plus = plus.bind(null, matrix);
	matrix.minus = minus.bind(null, matrix);
	matrix.dot = dot.bind(null, matrix);
	matrix.col = col.bind(null, matrix);
	matrix.row = row.bind(null, matrix);
	matrix.toArray = toArray.bind(null, matrix);
	return matrix;
}

/**
 * Creates an identity matrix of arbitrary dimensions.
 * @name create.identity
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
		return this(n, n, arr);
	}
}

/**
 * Creates a translation matrix for a homogenous coordinate in 2D or 3D space. 
 * @name create.translation
 * @example
 * let vec = vectors.create.vec3(3,4,5).toHomogenous();
 * matrices.create.identity(vec); // translates by 3x, 4y, 5z
 * @param {vector} v vector representing the distance to translate 
 * @return {matrix} 3x3 or 4x4 matrix
 */
create.translation = function(v) {
	switch(v.length) {
		case 2: return this(3, 3, [1,0,  v[0], 0,1,  v[1], 0,0,1]);
		case 3: return this(4, 4, [1,0,0,v[0], 0,1,0,v[1], 0,0,1,v[2], 0,0,0,1]);
		default: return undefined;
	}
}

/**
 * Creates a rotation matrix around absolute Y axis of angle r.
 * @name create.rotateY
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
 * @name create.rotateX
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
 * @name create.rotateZ
 * @example
 * matrices.create.rotateZ(1.5708); // 90 degree rotation around Z axis
 * @param {radian} r angle as a radian
 * @return {matrix} 3x3 matrix
 */
create.rotateZ = function(r) {
	return this(3, 3, [1,0,0, 0,cos(r),-sin(r), 0,sin(r),cos(r)]);
}

if(typeof("module") !== "undefined") {
	module.exports = {
		create:create,
		plus:plus,
		minus:minus,
		dot:dot
	}
}
