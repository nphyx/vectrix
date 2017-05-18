"use strict";
import * as matrices from "../src/vectrix.matrices.js";
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
	it("should create a matrix using a buffer", function() {
		let values = [0,1,2,3,4,5];
		let buffer = new ArrayBuffer(2*3*4+4); // 2 rows x 3 cols x 4 bytes per entry + 1 offset
		let mat = matrices.create(2, 3, values, buffer, 4);
		mat.buffer.should.eql(buffer);
		[].slice.apply(mat).should.eql(values);
	});
	it("should produce an array representation of itself", function() {
		let mat = matrices.create(2,2,[0,1,2,3]);
		mat.toArray().should.eql([0,1,2,3]);
	});
	it("should produce a string representation of itself", function() {
		let mat = matrices.create(2,2,[13,1, 1,12]);
		mat.toString().should.eql("matrix(13.00,  1.00\n        1.00, 12.00)");
		let iden = matrices.create(4,4,[1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
		iden.toString().should.eql("matrix(1.00, 0.00, 0.00, 0.00\n       0.00, 1.00, 0.00, 0.00\n       0.00, 0.00, 1.00, 0.00\n       0.00, 0.00, 0.00, 1.00)");
	});
	it("should be able to return its rows", function() {
		let create = matrices.create, mat = create(3,3,[0,1,2,3,4,5,6,7,8]);
		mat.row(0).should.eql(create(1,3,([0,1,2])));
		mat.row(1).should.eql(create(1,3,([3,4,5])));
		mat.row(2).should.eql(create(1,3,([6,7,8])));
	});
	it("should be able to return its columns", function() {
		let create = matrices.create, mat = create(3,3,[0,1,2,3,4,5,6,7,8]);
		mat.col(0).should.eql(create(3,1,([0,3,6])));
		mat.col(1).should.eql(create(3,1,([1,4,7])));
		mat.col(2).should.eql(create(3,1,([2,5,8])));
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
		let plus = matrices.plus;
		let mat1 = matrices.create(2,2,[1,1,1,1]);
		let mat2 = matrices.create(2,2,[2,2,2,2]);
		let mat3 = matrices.create(2,2,[1,2,3,4]);
		let out1 = plus(mat1, mat2);
		mat1.toArray().should.eql([1,1,1,1]);
		mat2.toArray().should.eql([2,2,2,2]);
		out1.toArray().should.eql([3,3,3,3]);
		plus(mat1, mat3).toArray().should.eql([2,3,4,5]);
		let scalar = 2;
		plus(mat1, scalar);
		scalar.should.eql(2);
	});
	it("should mutate its first operand during a mutating add", function() {
		let mut_plus = matrices.mut_plus;
		let mat1 = matrices.create(2,2,[1,1,1,1]);
		let mat2 = matrices.create(2,2,[2,2,2,2]);
		let out1 = mut_plus(mat1, mat2);
		mat1.should.equal(out1);
		out1.toArray().should.eql([3,3,3,3]);
		mat2.toArray().should.eql([2,2,2,2]);
		let out2 = mut_plus(mat2, mat1);
		out2.should.eql(mat2);
		out2.toArray().should.eql([5,5,5,5]);
		out1.toArray().should.eql([3,3,3,3]);
		let scalar = 2;
		out1 = mut_plus(mat1, scalar);
		mat1.should.equal(out1);
		mat1.toArray().should.eql([5,5,5,5]);
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
	it("should mutate its first operand during a mutating subtract", function() {
		let mut_minus = matrices.mut_minus;
		let mat1 = matrices.create(2,2,[1,1,1,1]);
		let mat2 = matrices.create(2,2,[2,2,2,2]);
		let out1 = mut_minus(mat1, mat2);
		mat1.should.equal(out1);
		out1.toArray().should.eql([-1,-1,-1,-1]);
		mat2.toArray().should.eql([2,2,2,2]);
		let out2 = mut_minus(mat2, mat1);
		out2.should.eql(mat2);
		out2.toArray().should.eql([3,3,3,3]);
		out1.toArray().should.eql([-1,-1,-1,-1]);
		let scalar = 2;
		out1 = mut_minus(mat1, scalar);
		mat1.should.equal(out1);
		mat1.toArray().should.eql([-3,-3,-3,-3]);
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
	it("should find the dot product of two compatible matrices", function() {
		let dot = matrices.dot, 
			mat1 = matrices.create(1,2,[0,1]),
			mat2 = matrices.create(2,1,[0,1]),
			mat3 = matrices.create(2,2,[1,2, 3,4]),
			mat4 = matrices.create(3,2,[-2,2, 0,-2, -6,3]),
			mat5 = matrices.create(2,2,[-6,2, -4,-2]);
		dot(mat1, mat2).toArray().should.eql([1]);
		dot(mat2, mat1).toArray().should.eql([0,0,0,1]);
		dot(mat1, mat3).toArray().should.eql([3,4]);
		dot(mat4, mat5).toArray().should.eql([4,-8, 8,4, 24,-18]); // larger matrices
		dot(dot(mat1, mat3), mat2).toArray().should.eql([4]); // chaining
	});
	it("should not mutate operands during a dot operation", function() {
		let dot = matrices.dot, 
			mat1 = matrices.create(2,2,[1,1,1,1]),
			mat2 = matrices.create(2,2,[2,2,2,2]);
		dot(mat1, mat2);
		mat1.toArray().should.eql([1,1,1,1]);
		mat2.toArray().should.eql([2,2,2,2]);
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
		let dot = matrices.dot;
		let trans = matrices.create.translation([3,2]);
		let mat = matrices.create(3,1,[-5,2,1]);
		dot(trans, mat).toArray().should.eql([-2,4,1]);
		// with buffer
		let buffer = new ArrayBuffer(3*3*4);
		trans = matrices.create.translation([3,2], buffer);
		trans.buffer.should.equal(buffer);
		dot(trans, mat).toArray().should.eql([-2,4,1]);

		// with buffer + offset
		buffer = new ArrayBuffer(3*3*4+4);
		trans = matrices.create.translation([3,2], buffer, 4);
		trans.buffer.should.equal(buffer);
		dot(trans, mat).toArray().should.eql([-2,4,1]);
	});
	it("should create a translation for 3d vectors and translate them correctly", function() {
		let dot = matrices.dot;
		let trans = matrices.create.translation([-5,7,13]);
		let mat = matrices.create(4,1,[6,-5,2,1]);
		dot(trans, mat).toArray().should.eql([1,2,15,1]);

		// with buffer
		let buffer = new ArrayBuffer(4*4*4);
		trans = matrices.create.translation([-5,7,13], buffer);
		trans.buffer.should.equal(buffer);
		dot(trans, mat).toArray().should.eql([1,2,15,1]);

		// with buffer + offset
		buffer = new ArrayBuffer(4*4*4+4);
		trans = matrices.create.translation([-5,7,13], buffer, 4);
		trans.buffer.should.equal(buffer);
		dot(trans, mat).toArray().should.eql([1,2,15,1]);
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
		ident = matrices.create.identity(8);
		ident.toArray().should.eql([1,0,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,0,1,0,0,0,0,0, 
		                            0,0,0,1,0,0,0,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,1,0,0, 
																0,0,0,0,0,0,1,0, 0,0,0,0,0,0,0,1]);
		// with buffer
		let buffer = new ArrayBuffer(8*8*4);
		ident = matrices.create.identity(8, buffer);
		ident.toArray().should.eql([1,0,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,0,1,0,0,0,0,0, 
		                            0,0,0,1,0,0,0,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,1,0,0, 
																0,0,0,0,0,0,1,0, 0,0,0,0,0,0,0,1]);
		ident.buffer.should.equal(buffer);
		// buffer + offset
		buffer = new ArrayBuffer(8*8*4+4);
		ident = matrices.create.identity(8, buffer, 4);
		ident.toArray().should.eql([1,0,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,0,1,0,0,0,0,0, 
		                            0,0,0,1,0,0,0,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,1,0,0, 
																0,0,0,0,0,0,1,0, 0,0,0,0,0,0,0,1]);
		ident.buffer.should.equal(buffer);
	});
});
describe("rotation matrices", function() {
	let create = matrices.create, dot = matrices.dot;
	let r90 = 90*Math.PI/180; // 90 degrees in radians
	let rx = create.rotateX(r90); // do a 90 degree rotation
	let ry = create.rotateY(r90); // do a 90 degree rotation
	let rz = create.rotateZ(r90); // do a 90 degree rotation
	let x = create(3,1,Float32Array.of(1,0,0));
	let y = create(3,1,Float32Array.of(0,1,0));
	let z = create(3,1,Float32Array.of(0,0,1));
	it("should produce a rx matrix that rotates 3d vectors around the x axis", function() {
		dot(rx,x).toArray().should.be.nearly([1,0,0], 1.0e-16);
		dot(ry,x).toArray().should.be.nearly([0,0,-1], 1.0e-16);
		dot(rz,x).toArray().should.be.nearly([0,1,0], 1.0e-16);
	});
	it("should produce a ry matrix that rotates 3d vectors around the y axis", function() {
		dot(ry,y).toArray().should.be.nearly([0,1,0], 1.0e-16);
		dot(rx,y).toArray().should.be.nearly([0,0,1], 1.0e-16);
		dot(rz,y).toArray().should.be.nearly([-1,0,0], 1.0e-16);
	});
	it("should produce a rz matrix that rotates 3d vectors around the z axis", function() {
		dot(rz,z).toArray().should.be.nearly([0,0,1], 1.0e-16);
		dot(rx,z).toArray().should.be.nearly([0,-1,0], 1.0e-16);
		dot(ry,z).toArray().should.be.nearly([1,0,0], 1.0e-16);
	});
	it("should produce correct outputs when rotations are chained using dot", function() {
		let zyx = dot(dot(rz,ry),rx);
		let yzx = dot(dot(ry,rz),rx);
		let xzy = dot(dot(rx,rz),ry);

		dot(zyx,x).toArray().should.be.nearly([0,0,-1], 1.0e-6); //[1,0,0], 1.0e-6);
		dot(zyx,y).toArray().should.be.nearly([0,1,0], 1.0e-6); //[1,0,0], 1.0e-6);
		dot(zyx,z).toArray().should.be.nearly([1,0,0], 1.0e-6); //[1,0,0], 1.0e-6);

		dot(yzx,x).toArray().should.be.nearly([0,1,0], 1.0e-6);
		dot(yzx,y).toArray().should.be.nearly([1,0,0], 1.0e-6);
		dot(yzx,z).toArray().should.be.nearly([0,0,-1], 1.0e-6);

		dot(xzy,x).toArray().should.be.nearly([0,1,0], 1.0e-6); //[0,1,0], 1.0e-6);
		dot(xzy,y).toArray().should.be.nearly([-1,0,0], 1.0e-6); //[0,1,0], 1.0e-6);
		dot(xzy,z).toArray().should.be.nearly([0,0,1], 1.0e-6); //[0,1,0], 1.0e-6);
	});
});
describe("utility methods", function() {
	it("should flatten arrays", function() {
		let flatten = matrices.flatten;
		flatten(1).should.eql(1);
		flatten([0,1,2,3,4,5]).should.eql([0,1,2,3,4,5]);
		flatten([[0,1,2],[3,4,5]]).should.eql([0,1,2,3,4,5]);
		flatten([[0,[1,2]],[[3,4],5]]).should.eql([0,1,2,3,4,5]);
	});
});
