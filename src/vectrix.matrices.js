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
