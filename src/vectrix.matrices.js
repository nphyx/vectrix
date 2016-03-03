(function() {
	"use strict";

	/**
   * Flattens an array. Used for flattening arguments passed to factories. 
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
	 * @param a first matrix
	 * @param b second matrix
	 * @return sum matrix
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
	 * @param a first matrix
	 * @param b second matrix
	 * @return difference matrix
	 */
	function minus(a, b) {
		if(typeof(b) === "number") return create(a.rows, a.cols, a.map((cur) => cur - b));
		else if((a.rows === b.rows) && (a.cols === b.cols)) return create(a.rows, a.cols, a.map((cur, i) => cur - b[i]));
		else return undefined;
	}

	/**
	 * Multiply multiple matrices.
	 * @param a first matrix
	 * @param b second matrix
	 * @return matrix dot product
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
	 * @param matrix
	 * @param n column number (zero indexed)
	 * @return a single column from a matrix
	 */
	function col(mat, n) {
		let out = new Float32Array(mat.rows);
		for(let i = 0; i < mat.rows; i++) {
			out[i] = mat[i*mat.cols+n]
		}
		return out;
	}

	/**
	 * @param matrix
	 * @param n row number (zero indexed)
	 * @return a single row from a matrix
	 */
	function row(mat, n) {
		let out = new Float32Array(mat.cols);
		for(let i = 0; i < mat.cols; i++) {
			out[i] = mat[mat.cols*n+i]
		}
		return out;
	}

	/**
	 * @return matrix values as flat array
	 */
	function toArray(mat) {
		return [].slice.apply(mat);
	}

	const cos = Math.cos;
	const sin = Math.sin;

	/*
	 * Matrix factories
	 */

	/**
	 * Factory for creating generic matrices.
	 * @param rows matrix rows
	 * @param cols matrix columsn
	 * @param values matrix values as an array
	 * @return matrix
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
	 * @param n dimensions of the matrix
	 * @return identity matrix
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
	 * @param v vector representing the distance to translate 
	 * @return 3x3 or 4x4 matrix
	 */
	create.translation = function(v) {
		switch(v.length) {
			case 2: return this(3, 3, [1,0,  v[0], 0,1,  v[1], 0,0,1]);
			case 3: return this(4, 4, [1,0,0,v[0], 0,1,0,v[1], 0,0,1,v[2], 0,0,0,1]);
			default: return undefined;
		}
	}

	/**
	 * Creates a rotation matrix around absolute Z axis of angle r.
	 * @param r angle as a radian
	 * @return a 3x3 matrix
	 */
	create.rotateY = function(r) {
		return this(3, 3, [cos(r),0,sin(r), 0,1,0, -sin(r),sin(r),-cos(r)]);
	}

	/**
	 * Creates a rotation matrix around absolute Z axis of angle r.
	 * @param r angle as a radian
	 * @return a 3x3 matrix for rotating a vector
	 */
	create.rotateX = function(r) {
		return this(3, 3, [cos(r),-sin(r),0, sin(r),cos(r),0, 0,0,1]);
	}

	/**
	 * Creates a rotation matrix around absolute Z axis of angle r.
	 * @param r angle as a radian
	 * @return a 3x3 matrix for rotating a vector
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
})();
