(function() {
	"use strict";
	/**
	 * The generic matrix type, upon which other matrices are built.
	 */

	/**
	 * Do an operation on any number of matrices.
	 * @param matrices
	 * @param check callback(a,b) function that checks whether a and b are compatible for this op, must return true or false
	 * @param cb callback(a,b) function for the operation, returns a new matrix
	 */
	function op(matrices, check, cb) {
		matrices = [].slice.apply(matrices); // convert args to array
		let a = matrices.shift();
		if(a === undefined || matrices.length === 0) return a;
		let b = op(matrices, check, cb);
		if(b === undefined) return undefined;
		if(!check(a, b)) return undefined;
		return cb(a, b);
	}

	/**
	 * Add multiple matrices together.
	 */
	function add() {
		return op(arguments, 
			(a, b) => a !== undefined && ((typeof(b) === "number") || ((a.cols === b.cols) && (a.rows === b.rows))),
			(a, b) => {
				if(typeof(b) === "number") b = create(a.rows,a.cols).fill(b);
				return create(a.rows, a.cols, a.map((cur, i) => cur + b[i]))
			}
		);
	}

	/**
	 * Subtract multiple matrices.
	 */
	function sub() {
		return op(arguments, 
			(a, b) => a !== undefined && ((typeof(b) === "number") || ((a.cols === b.cols) && (a.rows === b.rows))),
			(a, b) => {
				if(typeof(b) === "number") b = create(a.rows,a.cols).fill(b);
				return create(a.rows, a.cols, a.map((cur, i) => cur - b[i]))
			}
		);
	}

	/**
	 * Multiply multiple matrices.
	 */
	function dot() {
		return op(arguments,
			(a, b) => typeof(b) === "number" || a.cols === b.rows,
			(a, b) => {
				if(typeof(b) === "number") return create(a.rows, a.cols, a.map((cur) => cur*b));
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
		);
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
	if(typeof("module") !== "undefined") {
		module.exports = {
			create:create,
			add:add,
			sub:sub,
			dot:dot
		}
	}
	else {
	}
})();
