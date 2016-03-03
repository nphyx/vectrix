"use strict";
const should = require("should");
const matrices = require("../src/vectrix.matrices.js");
require("./helpers/should.nearly.js");

describe("an arbitrary matrix", function() {
	it("should create a matrix", function() {
		let mat = matrices.create(2, 3);
		mat.rows.should.eql(2);
		mat.cols.should.eql(3);
		mat.length.should.eql(6);
		mat = matrices.create(4, 4);
		mat.rows.should.eql(4);
		mat.cols.should.eql(4);
		mat.length.should.eql(16);

		let values = [0,1,2,3,4,5];
		mat = matrices.create(2, 3, values);
		[].slice.apply(mat).should.eql(values);

		// check that case with no initial value is supported
		mat = matrices.create(3,3);
		mat.length.should.eql(9);
		mat.forEach((val) => val.should.eql(0));
	});
	it("should be able to produce an array from itself", function() {
		let mat = matrices.create(2,2,[0,1,2,3]);
		mat.toArray().should.eql([0,1,2,3]);
	});
	it("should be able to return its rows", function() {
		let mat = matrices.create(3,3,[0,1,2,3,4,5,6,7,8]);
		mat.row(0).should.eql(new Float32Array([0,1,2]));
		mat.row(1).should.eql(new Float32Array([3,4,5]));
		mat.row(2).should.eql(new Float32Array([6,7,8]));
	});
	it("should be able to return its columns", function() {
		let mat = matrices.create(3,3,[0,1,2,3,4,5,6,7,8]);
		mat.col(0).should.eql(new Float32Array([0,3,6]));
		mat.col(1).should.eql(new Float32Array([1,4,7]));
		mat.col(2).should.eql(new Float32Array([2,5,8]));
	});
	it("should add like matrices", function() {
		let mat1 = matrices.create(2,2,[1,1,1,1]);
		let mat2 = matrices.create(2,2,[2,2,2,2]);
		let out = mat1.plus(mat2);
		out.toArray().should.eql([3,3,3,3]);
	});
	it("should add scalars to matrices", function() {
		let mat1 = matrices.create(3,3).fill(4);
		mat1.plus(2).toArray().should.eql(new Array(9).fill(6));
	});
	it("should not mutate any of its operands during an add", function() {
		let mat1 = matrices.create(2,2,[1,1,1,1]);
		let mat2 = matrices.create(2,2,[2,2,2,2]);
		let mat3 = matrices.create(2,2,[1,2,3,4]);
		let out1 = mat1.plus(mat2);
		mat1.toArray().should.eql([1,1,1,1]);
		mat2.toArray().should.eql([2,2,2,2]);
		out1.toArray().should.eql([3,3,3,3]);
		mat1.plus(mat3).toArray().should.eql([2,3,4,5]);
		let scalar = 2;
		mat1.plus(scalar);
		scalar.should.eql(2);
	});
	it("should subtract like matrices", function() {
		let mat1 = matrices.create(2,2,[1,1,1,1]);
		let mat2 = matrices.create(2,2,[2,2,2,2]);
		let mat3 = matrices.create(2,2,[1,2,3,4]);
		let out = mat1.minus(mat2);
		out.toArray().should.eql([-1,-1,-1,-1]);
		mat3.minus(mat1).toArray().should.eql([0,1,2,3]);
	});
	it("should subtract scalars from matrices", function() {
		let mat1 = matrices.create(3,3).fill(4);
		mat1.minus(2).toArray().should.eql(new Array(9).fill(2));
	});
	it("should not mutate any of its operands during a subtract", function() {
		let mat1 = matrices.create(2,2,[1,1,1,1]);
		let mat2 = matrices.create(2,2,[2,2,2,2]);
		let out1 = mat1.minus(mat2);
		let out2 = out1.minus(mat1);
		mat1.toArray().should.eql([1,1,1,1]);
		mat2.toArray().should.eql([2,2,2,2]);
		out1.toArray().should.eql([-1,-1,-1,-1]);
		out2.toArray().should.eql([-2,-2,-2,-2]);
		let scalar = 2;
		mat1.minus(scalar);
		scalar.should.eql(2);
	});
	it("should reject unlike matrices during add and subtract", function() {
		let mat1 = matrices.create(2,3,[3,3,3,3,3,3]);
		let mat2 = matrices.create(3,2,[3,3,3,3,3,3]);
		let mat3 = matrices.create(1,4,[1,1,1,1]);
		(mat1.plus(mat2) === undefined).should.eql(true);
		(mat1.plus(mat3) === undefined).should.eql(true);
		(mat1.minus(mat2) === undefined).should.eql(true);
		(mat1.minus(mat3) === undefined).should.eql(true);
	});
	it("should multiply two compatible matrices", function() {
		let mat1 = matrices.create(1,2,[0, 1]);
		let mat2 = matrices.create(2,1,[0,1]);
		let mat3 = matrices.create(2,2,[1,2, 3,4]);
		let mat4 = matrices.create(3,2,[-2,2, 0,-2, -6,3]);
		let mat5 = matrices.create(2,2,[-6,2, -4,-2]);
		mat1.dot(mat2).toArray().should.eql([1]);
		mat2.dot(mat1).toArray().should.eql([0,0,0,1]);
		mat1.dot(mat3).toArray().should.eql([3,4]);
		mat4.dot(mat5).toArray().should.eql([4,-8, 8,4, 24,-18]); // larger matrices
		mat1.dot(mat3).dot(mat2).toArray().should.eql([4]); // chaining
	});
	it("should multiply matrices by scalars", function() {
		let mat4 = matrices.create(3,2,[-2,2, 0,-2, -6,3]);
		mat4.dot(3).toArray().should.eql([-6,6, 0,-6, -18,9]);
	});
	it("should reject incompatible matrices", function() {
		let mat1 = matrices.create(1,3);
		let mat2 = matrices.create(1,3);
		(mat1.dot(mat2) === undefined).should.eql(true);
	});
});

/** 
 * use a generic columnar matrix in the tests below so we're not dependent on 
 * the vector library before its tests run
 */
describe("a translation matrix", function() {
	it("should create a translation for 2d vectors and translate them correctly", function() {
		let trans = matrices.create.translation([3,2]);
		let vec = matrices.create(3,1,[-5,2,1]);
		trans.dot(vec).toArray().should.eql([-2,4,1]);
	});
	it("should create a translation for 3d vectors and translate them correctly", function() {
		let trans = matrices.create.translation([-5,7,13]);
		let vec = matrices.create(4,1,[6,-5,2,1]);
		trans.dot(vec).toArray().should.eql([1,2,15,1]);
	});
	it("should have an undefined value for unsupported parameters", function() {
		let trans = matrices.create.translation([1,1,1,1,1,1]);
		(trans === undefined).should.be.true();
		trans = matrices.create.translation([1]);
		(trans === undefined).should.be.true();
		trans = matrices.create.translation("nope");
		(trans === undefined).should.be.true();
		trans = matrices.create.translation(2);
		(trans === undefined).should.be.true();
	});
});
describe("an identity matrix", function() {
	it("should produce an identity matrix for any value of n", function() {
		let ident = matrices.create.identity(2);
		ident.toArray().should.eql([1,0, 0,1]);
		ident = matrices.create.identity(3);
		ident.toArray().should.eql([1,0,0, 0,1,0, 0,0,1]);
		ident = matrices.create.identity(4);
		ident.toArray().should.eql([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
		ident = matrices.create.identity(5);
		ident.toArray().should.eql([1,0,0,0,0, 0,1,0,0,0, 0,0,1,0,0, 0,0,0,1,0, 0,0,0,0,1]);
		ident = matrices.create.identity(6);
		ident.toArray().should.eql([1,0,0,0,0,0, 0,1,0,0,0,0, 0,0,1,0,0,0,
		                            0,0,0,1,0,0, 0,0,0,0,1,0, 0,0,0,0,0,1]);
		ident = matrices.create.identity(7);
		ident.toArray().should.eql([1,0,0,0,0,0,0, 0,1,0,0,0,0,0, 0,0,1,0,0,0,0, 
		                            0,0,0,1,0,0,0, 0,0,0,0,1,0,0, 0,0,0,0,0,1,0, 
																0,0,0,0,0,0,1]);
		ident = matrices.create.identity(8);
		ident.toArray().should.eql([1,0,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,0,1,0,0,0,0,0, 
		                            0,0,0,1,0,0,0,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,1,0,0, 
																0,0,0,0,0,0,1,0, 0,0,0,0,0,0,0,1]);
		// not gonna test any farther than that, it should be working
	});
});
describe("rotation matrices", function() {
	let r90 = 90*Math.PI/180; // 90 degrees in radians
	let rotateZ = matrices.create.rotateZ(r90); // do a 90 degree rotation
	let rotateY = matrices.create.rotateY(r90); // do a 90 degree rotation
	let rotateX = matrices.create.rotateX(r90); // do a 90 degree rotation
	let a = matrices.create(3,1,[0,0,1]);
	let b = matrices.create(3,1,[1,0,0]);
	it("should produce a rotateX matrix that rotates 3d vectors around the x axis", function() {
		// floating point precision will cause these to be just slightly off, but that's ok
		rotateX.dot(b).toArray().should.be.nearly([0,1,0], 1.0e-16);
	});
	it("should produce a rotateY matrix that rotates 3d vectors around the y axis", function() {
		rotateY.dot(a).toArray().should.be.nearly([1,0,0], 1.0e-16);
	});
	it("should produce a rotateZ matrix that rotates 3d vectors around the z axis", function() {
		rotateZ.dot(a).toArray().should.be.nearly([0,-1,0], 1.0e-16);
	});
	it("should produce correct outputs when rotations are chained using dot", function() {
		let zyx = rotateZ.dot(rotateY).dot(rotateX);
		let yzx = rotateY.dot(rotateZ).dot(rotateX);
		let xzy = rotateX.dot(rotateZ).dot(rotateY);
		zyx.dot(a).toArray().should.be.nearly([1,0,0], 1.0e-16);
		yzx.dot(a).toArray().should.be.nearly([0,-1,-1], 1.0e-16);
		xzy.dot(a).toArray().should.be.nearly([0,1,0], 1.0e-16);
	});
});

