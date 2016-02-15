"use strict";
require("should");
const matrix = require("../src/jsmatrix.matrix.js");

describe("an arbitrary matrix", function() {
	it("should create a matrix", function() {
		let mat = matrix.create(2, 3);
		mat.rows.should.eql(2);
		mat.cols.should.eql(3);
		mat.length.should.eql(6);
		mat = matrix.create(4, 4);
		mat.rows.should.eql(4);
		mat.cols.should.eql(4);
		mat.length.should.eql(16);

		let values = [0,1,2,3,4,5];
		mat = matrix.create(2, 3, values);
		[].slice.apply(mat).should.eql(values);
	});
	it("should be able to produce an array from itself", function() {
		let mat = matrix.create(2,2,[0,1,2,3]);
		mat.toArray().should.eql([0,1,2,3]);
	});
	it("should be able to return its rows", function() {
		let mat = matrix.create(3,3,[0,1,2,3,4,5,6,7,8]);
		mat.row(0).should.eql(new Float32Array([0,1,2]));
		mat.row(1).should.eql(new Float32Array([3,4,5]));
		mat.row(2).should.eql(new Float32Array([6,7,8]));
	});
	it("should be able to return its columns", function() {
		let mat = matrix.create(3,3,[0,1,2,3,4,5,6,7,8]);
		mat.col(0).should.eql(new Float32Array([0,3,6]));
		mat.col(1).should.eql(new Float32Array([1,4,7]));
		mat.col(2).should.eql(new Float32Array([2,5,8]));
	});
	it("should add like matrices", function() {
		let mat1 = matrix.create(2,2,[1,1,1,1]);
		let mat2 = matrix.create(2,2,[2,2,2,2]);
		let out = mat1.add(mat2);
		out.toArray().should.eql([3,3,3,3]);
		out = mat1.add(mat2,out);
		out.toArray().should.eql([6,6,6,6]);
	});
	it("should add scalars to matrices", function() {
		let mat1 = matrix.create(3,3).fill(4);
		mat1.add(2).toArray().should.eql(new Array(9).fill(6));
	});
	it("should not mutate any of its operands during an add", function() {
		let mat1 = matrix.create(2,2,[1,1,1,1]);
		let mat2 = matrix.create(2,2,[2,2,2,2]);
		let mat3 = matrix.create(2,2,[1,2,3,4]);
		let out1 = mat1.add(mat2);
		let out2 = mat1.add(mat2,out1);
		mat1.toArray().should.eql([1,1,1,1]);
		mat2.toArray().should.eql([2,2,2,2]);
		out1.toArray().should.eql([3,3,3,3]);
		out2.toArray().should.eql([6,6,6,6]);
		mat1.add(mat3).toArray().should.eql([2,3,4,5]);
		let scalar = 2;
		mat1.add(scalar);
		scalar.should.eql(2);
	});
	it("should subtract like matrices", function() {
		let mat1 = matrix.create(2,2,[1,1,1,1]);
		let mat2 = matrix.create(2,2,[2,2,2,2]);
		let mat3 = matrix.create(2,2,[1,2,3,4]);
		let out = mat1.sub(mat2);
		out.toArray().should.eql([-1,-1,-1,-1]);
		out = mat1.sub(mat2,out);
		out.toArray().should.eql([-2,-2,-2,-2]);
		mat3.sub(mat1).toArray().should.eql([0,1,2,3]);
	});
	it("should subtract scalars from matrices", function() {
		let mat1 = matrix.create(3,3).fill(4);
		mat1.sub(2).toArray().should.eql(new Array(9).fill(2));
	});
	it("should not mutate any of its operands during a sub", function() {
		let mat1 = matrix.create(2,2,[1,1,1,1]);
		let mat2 = matrix.create(2,2,[2,2,2,2]);
		let out1 = mat1.sub(mat2);
		let out2 = mat1.sub(mat2,out1);
		mat1.toArray().should.eql([1,1,1,1]);
		mat2.toArray().should.eql([2,2,2,2]);
		out1.toArray().should.eql([-1,-1,-1,-1]);
		out2.toArray().should.eql([-2,-2,-2,-2]);
		let scalar = 2;
		mat1.sub(scalar);
		scalar.should.eql(2);
	});
	it("should reject unlike matrices during add and sub", function() {
		let mat1 = matrix.create(2,3,[3,3,3,3,3,3]);
		let mat2 = matrix.create(3,2,[3,3,3,3,3,3]);
		let mat3 = matrix.create(1,4,[1,1,1,1]);
		(mat1.add(mat2) === undefined).should.eql(true);
		(mat1.add(mat3) === undefined).should.eql(true);
		(mat1.add(mat1,mat2) === undefined).should.eql(true);
		(mat1.add(mat2,mat1) === undefined).should.eql(true);
		(mat1.add(mat2,mat3) === undefined).should.eql(true);
		(mat1.sub(mat2) === undefined).should.eql(true);
		(mat1.sub(mat3) === undefined).should.eql(true);
		(mat1.sub(mat1,mat2) === undefined).should.eql(true);
		(mat1.sub(mat2,mat1) === undefined).should.eql(true);
		(mat1.sub(mat2,mat3) === undefined).should.eql(true);
	});
	it("should multiply two compatible matrixes", function() {
		let mat1 = matrix.create(1,2,[0, 1]);
		let mat2 = matrix.create(2,1,[0,1]);
		let mat3 = matrix.create(2,2,[1,2, 3,4]);
		let mat4 = matrix.create(3,2,[-2,2, 0,-2, -6,3]);
		let mat5 = matrix.create(2,2,[-6,2, -4,-2]);
		mat1.mul(mat2).toArray().should.eql([1]);
		mat2.mul(mat1).toArray().should.eql([0,0,0,1]);
		mat1.mul(mat3).toArray().should.eql([3,4]);
		mat4.mul(mat5).toArray().should.eql([4,-8, 8,4, 24,-18]); // larger matrices
		mat1.mul(mat3).mul(mat2).toArray().should.eql([4]); // chaining
	});
	it("should multiply matrixes by scalars", function() {
		let mat4 = matrix.create(3,2,[-2,2, 0,-2, -6,3]);
		mat4.mul(3).toArray().should.eql([-6,6, 0,-6, -18,9]);
	});
	it("should reject incompatible matrixes", function() {
		let mat1 = matrix.create(1,3);
		let mat2 = matrix.create(1,3);
		(mat1.mul(mat2) === undefined).should.eql(true);
	});
});
