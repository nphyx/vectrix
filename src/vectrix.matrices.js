(function() {
	"use strict";
	/**
	 * The generic matrix type, upon which other matrices are built.
	 */

	/**
	 * Add two matrices together.
	 */
	function add(a, b) {
		if(typeof(b) === "number") return create(a.rows,a.cols, a.map((cur) => cur + b));
		else if ((a.cols === b.cols) && (a.rows === b.rows)) { 
			return create(a.rows, a.cols, a.map((cur, i) => cur + b[i]))
		}
		else return undefined;
	}

	/**
	 * Subtract matrices. Subtraction isn't commutative so you can't do multiple subtracts.
	 */
	function sub(a, b) {
		if(typeof(b) === "number") return create(a.rows, a.cols, a.map((cur) => cur - b));
		else if((a.rows === b.rows) && (a.cols === b.cols)) return create(a.rows, a.cols, a.map((cur, i) => cur - b[i]));
		else return undefined;
	}

	/**
	 * Multiply multiple matrices.
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

	function col(mat, n) {
		let out = new Float32Array(mat.rows);
		for(let i = 0; i < mat.rows; i++) {
			out[i] = mat[i*mat.cols+n]
		}
		return out;
	}

	function row(mat, n) {
		let out = new Float32Array(mat.cols);
		for(let i = 0; i < mat.cols; i++) {
			out[i] = mat[mat.cols*n+i]
		}
		return out;
	}

	function toArray(mat) {
		return [].slice.apply(mat);
	}

	/**
	 * Factory for creating matrices.
	 */
	function create(rows, cols, values = []) {
		var matrix = new Float32Array(cols * rows);	
		matrix.cols = cols;
		matrix.rows = rows;
		if(values.length > 0) matrix.set(values);
		matrix.add = add.bind(null, matrix);
		matrix.sub = sub.bind(null, matrix);
		matrix.dot = dot.bind(null, matrix);
		matrix.col = col.bind(null, matrix);
		matrix.row = row.bind(null, matrix);
		matrix.toArray = toArray.bind(null, matrix);
		return matrix;
	}

	const cos = Math.cos;
	const sin = Math.sin;

	/**
	 * Matrix factories
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

	create.translation = function(vec) {
		switch(vec.length) {
			case 2: return this(3, 3, [1,0,  vec[0], 0,1,  vec[1], 0,0,1]);
			case 3: return this(4, 4, [1,0,0,vec[0], 0,1,0,vec[1], 0,0,1,vec[2], 0,0,0,1]);
			default: return undefined;
		}
	}
	create.rotateY = function(r) {
		return this(3, 3, [cos(r),0,sin(r), 0,1,0, -sin(r),sin(r),-cos(r)]);
	}

	create.rotateX = function(r) {
		return this(3, 3, [cos(r),-sin(r),0, sin(r),cos(r),0, 0,0,1]);
	}

	create.rotateZ = function(r) {
		console.log("r", r, "cos", cos(r), "sin", sin(r));
		return this(3, 3, [1,0,0, 0,cos(r),-sin(r), 0,sin(r),cos(r)]);
	}

	if(typeof("module") !== "undefined") {
		module.exports = {
			create:create,
			add:add,
			sub:sub,
			dot:dot
		}
	}
})();
