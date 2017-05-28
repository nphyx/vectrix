"use strict";
import * as matrices from "../src/vectrix.matrices.js";
require("./helpers/should.nearly.js");
const {toArray} = matrices;

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
		matrices.toArray(mat).should.eql([0,1,2,3]);
	});
	it("should produce a string representation of itself", function() {
		let rowvec = matrices.create(1,3,[12,1,0]);
		matrices.toString(rowvec).should.eql("matrix(12.00,  1.00,  0.00)");
		let mat = matrices.create(2,2,[13,1, 1,12]);
		matrices.toString(mat).should.eql("matrix(13.00,  1.00\n        1.00, 12.00)");
		let iden = matrices.create(4,4,[1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
		matrices.toString(iden).should.eql("matrix(1.00, 0.00, 0.00, 0.00\n       0.00, 1.00, 0.00, 0.00\n       0.00, 0.00, 1.00, 0.00\n       0.00, 0.00, 0.00, 1.00)");
	});
	it("should be able to return its rows", function() {
		let row = matrices.row, create = matrices.create, 
				mat = create(3,3,[0,1,2,3,4,5,6,7,8]);
		row(mat, 0).should.eql(create(1,3,([0,1,2])));
		row(mat, 1).should.eql(create(1,3,([3,4,5])));
		row(mat, 2).should.eql(create(1,3,([6,7,8])));
	});
	it("should be able to return its columns", function() {
		let col = matrices.col, create = matrices.create, 
				mat = create(3,3,[0,1,2,3,4,5,6,7,8]);
		col(mat, 0).should.eql(create(3,1,([0,3,6])));
		col(mat, 1).should.eql(create(3,1,([1,4,7])));
		col(mat, 2).should.eql(create(3,1,([2,5,8])));
	});
	it("should add like matrices", function() {
		let mat1 = matrices.create(2,2,[1,1,1,1]);
		let mat2 = matrices.create(2,2,[2,2,2,2]);
		toArray(matrices.plus(mat1, mat2)).should.eql([3,3,3,3]);
		let out = matrices.create(2,2);
		// support for out params
		matrices.plus(mat1,mat2,out).should.equal(out);
	});
	it("should add scalars to matrices", function() {
		let plus_scalar = matrices.plus_scalar;
		let mat1 = matrices.create(3,3).fill(4);
		toArray(plus_scalar(mat1, 2)).should.eql(new Array(9).fill(6));
		let out = matrices.create(3,3);
		// support for out params
		plus_scalar(mat1,2,out).should.equal(out);
	});
	it("should not mutate any of its operands during an add", function() {
		let plus = matrices.plus, plus_scalar = matrices.plus_scalar;
		let mat1 = matrices.create(2,2,[1,1,1,1]);
		let mat2 = matrices.create(2,2,[2,2,2,2]);
		let mat3 = matrices.create(2,2,[1,2,3,4]);
		let out1 = plus(mat1, mat2);
		toArray(mat1).should.eql([1,1,1,1]);
		toArray(mat2).should.eql([2,2,2,2]);
		toArray(out1).should.eql([3,3,3,3]);
		toArray(plus(mat1, mat3)).should.eql([2,3,4,5]);
		let scalar = 2;
		plus_scalar(mat1, scalar);
		scalar.should.eql(2);
	});
	it("should mutate its first operand during a mutating add", function() {
		let mut_plus = matrices.mut_plus, mut_plus_scalar = matrices.mut_plus_scalar;
		let mat1 = matrices.create(2,2,[1,1,1,1]);
		let mat2 = matrices.create(2,2,[2,2,2,2]);
		let out1 = mut_plus(mat1, mat2);
		mat1.should.equal(out1);
		toArray(out1).should.eql([3,3,3,3]);
		toArray(mat2).should.eql([2,2,2,2]);
		let out2 = mut_plus(mat2, mat1);
		out2.should.eql(mat2);
		toArray(out2).should.eql([5,5,5,5]);
		toArray(out1).should.eql([3,3,3,3]);
		let scalar = 2;
		out1 = mut_plus_scalar(mat1, scalar);
		mat1.should.equal(out1);
		toArray(mat1).should.eql([5,5,5,5]);
		scalar.should.eql(2);
	});
	it("should subtract like matrices", function() {
		let mat1 = matrices.create(2,2,[1,1,1,1]);
		let mat2 = matrices.create(2,2,[2,2,2,2]);
		let mat3 = matrices.create(2,2,[1,2,3,4]);
		toArray(matrices.minus(mat1,mat2)).should.eql([-1,-1,-1,-1]);
		toArray(matrices.minus(mat3,mat1)).should.eql([0,1,2,3]);
		// support for out params
		let out = matrices.create(2,2);
		matrices.minus(mat1,mat2,out).should.equal(out);
	});
	it("should subtract scalars from matrices", function() {
		let minus_scalar = matrices.minus_scalar;
		let mat1 = matrices.create(3,3).fill(4);
		toArray(minus_scalar(mat1,2)).should.eql(new Array(9).fill(2));
		let out = matrices.create(3,3);
		minus_scalar(mat1,2,out).should.equal(out);
	});
	it("should not mutate any of its operands during a subtract", function() {
		let minus = matrices.minus, minus_scalar = matrices.minus_scalar;
		let mat1 = matrices.create(2,2,[1,1,1,1]);
		let mat2 = matrices.create(2,2,[2,2,2,2]);
		let out1 = minus(mat1, mat2);
		let out2 = minus(out1, mat1);
		toArray(mat1).should.eql([1,1,1,1]);
		toArray(mat2).should.eql([2,2,2,2]);
		toArray(out1).should.eql([-1,-1,-1,-1]);
		toArray(out2).should.eql([-2,-2,-2,-2]);
		let scalar = 2;
		minus_scalar(mat1, scalar);
		scalar.should.eql(2);
	});
	it("should mutate its first operand during a mutating subtract", function() {
		let mut_minus = matrices.mut_minus, mut_minus_scalar = matrices.mut_minus_scalar;
		let mat1 = matrices.create(2,2,[1,1,1,1]);
		let mat2 = matrices.create(2,2,[2,2,2,2]);
		let out1 = mut_minus(mat1, mat2);
		mat1.should.equal(out1);
		toArray(out1).should.eql([-1,-1,-1,-1]);
		toArray(mat2).should.eql([2,2,2,2]);
		let out2 = mut_minus(mat2, mat1);
		out2.should.eql(mat2);
		toArray(out2).should.eql([3,3,3,3]);
		toArray(out1).should.eql([-1,-1,-1,-1]);
		let scalar = 2;
		out1 = mut_minus_scalar(mat1, scalar);
		mat1.should.equal(out1);
		toArray(mat1).should.eql([-3,-3,-3,-3]);
		scalar.should.eql(2);
	});
	it("should reject unlike matrices during add and subtract", function() {
		let plus = matrices.plus, minus = matrices.minus;
		let mat1 = matrices.create(2,3,[3,3,3,3,3,3]);
		let mat2 = matrices.create(3,2,[3,3,3,3,3,3]);
		let mat3 = matrices.create(1,4,[1,1,1,1]);
		(plus(mat1, mat2) === undefined).should.eql(true);
		(plus(mat1, mat3) === undefined).should.eql(true);
		(minus(mat1, mat2) === undefined).should.eql(true);
		(minus(mat1, mat3) === undefined).should.eql(true);
	});
	it("should find the dot product of two compatible matrices", function() {
		let dot = matrices.dot, 
			mat1 = matrices.create(1,2,[0,1]),
			mat2 = matrices.create(2,1,[0,1]),
			mat3 = matrices.create(2,2,[1,2, 3,4]),
			mat4 = matrices.create(3,2,[-2,2, 0,-2, -6,3]),
			mat5 = matrices.create(2,2,[-6,2, -4,-2]);
		toArray(dot(mat1, mat2)).should.eql([1]);
		toArray(dot(mat2, mat1)).should.eql([0,0,0,1]);
		toArray(dot(mat1, mat3)).should.eql([3,4]);
		toArray(dot(mat4, mat5)).should.eql([4,-8, 8,4, 24,-18]); // larger matrices
		toArray(dot(dot(mat1, mat3), mat2)).should.eql([4]); // chaining
		// support for out params
		let out = matrices.create(2,2);
		dot(mat2,mat1,out).should.equal(out);
	});
	it("should not mutate operands during a dot operation", function() {
		let dot = matrices.dot, 
			mat1 = matrices.create(2,2,[1,1,1,1]),
			mat2 = matrices.create(2,2,[2,2,2,2]);
		dot(mat1, mat2);
		toArray(mat1).should.eql([1,1,1,1]);
		toArray(mat2).should.eql([2,2,2,2]);
	});
	it("should multiply matrices by scalars", function() {
		let multiply_scalar = matrices.multiply_scalar;
		let mat4 = matrices.create(3,2,[-2,2, 0,-2, -6,3]);
		toArray(multiply_scalar(mat4,3)).should.eql([-6,6, 0,-6, -18,9]);
		// support for out params
		let out = matrices.create(3,2);
		multiply_scalar(mat4,3,out).should.equal(out);
	});
	it("should not mutate its operands during a scalar multiply", function() {
		let multiply_scalar = matrices.multiply_scalar;
		let mat4 = matrices.create(3,2,[-2,2, 0,-2, -6,3]);
		let out = matrices.create(3,2);
		multiply_scalar(mat4, 3, out);
		toArray(out).should.eql([-6,6, 0,-6, -18,9]);
		toArray(mat4).should.eql([-2,2, 0,-2, -6,3]);
	});
	it("should mutate its first operand during a mutating scalar multiply", function() {
		let mut_multiply_scalar = matrices.mut_multiply_scalar;
		let mat4 = matrices.create(3,2,[-2,2, 0,-2, -6,3]);
		toArray(mut_multiply_scalar(mat4,3)).should.eql([-6,6, 0,-6, -18,9]);
		toArray(mat4).should.eql([-6,6, 0,-6, -18,9]);
	});
	it("should reject incompatible matrices", function() {
		let dot = matrices.dot;
		let mat1 = matrices.create(1,3);
		let mat2 = matrices.create(1,3);
		(dot(mat1, mat2) === undefined).should.eql(true);
	});
	it("should wrap a matrix with vectrix methods", function() {
		// checks that methods exist and seem to work
		let mat2 = matrices.create(2,2,[2,2,2,2]);
		function checkMethods(mat) {
			mat.toArray.should.be.a.Function();
			mat.toArray().should.eql([-5,2,1,4]);
			mat.toString.should.be.a.Function();
			mat.toString().should.eql("matrix(-5.00,  2.00\n        1.00,  4.00)");
			mat.col.should.be.a.Function();
			toArray(mat.col(0)).should.eql([-5,1]);
			mat.row.should.be.a.Function();
			toArray(mat.row(0)).should.eql([-5,2]);
			mat.plus.should.be.a.Function();
			toArray(mat.plus(mat2)).should.eql([-3,4,3,6]);
			mat.plus_scalar.should.be.a.Function();
			toArray(mat.plus_scalar(3)).should.eql([-2,5,4,7]);
			mat.minus.should.be.a.Function();
			toArray(mat.minus(mat2)).should.eql([-7,0,-1,2]);
			mat.minus_scalar.should.be.a.Function();
			toArray(mat.minus_scalar(3)).should.eql([-8,-1,-2,1]);
			mat.dot.should.be.a.Function();
			toArray(mat.dot(mat)).should.eql([27,-2,-1,18]);
			mat.multiply_scalar.should.be.a.Function();
			toArray(mat.multiply_scalar(0)).should.eql([0,0,0,0]);
		}
		let mat = matrices.create(2,2,[-5,2,1,4]);
		matrices.wrap(mat);
		checkMethods(mat);
		mat = [-5,2,1,4];
		matrices.wrap(mat, 2, 2);
		checkMethods(mat);
		mat = Float32Array.of(-5,2,1,4);
		matrices.wrap(mat, 2, 2);
		checkMethods(mat);
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
		toArray(dot(trans, mat)).should.eql([-2,4,1]);
		// with buffer
		let buffer = new ArrayBuffer(3*3*4);
		trans = matrices.create.translation([3,2], buffer);
		trans.buffer.should.equal(buffer);
		toArray(dot(trans, mat)).should.eql([-2,4,1]);

		// with buffer + offset
		buffer = new ArrayBuffer(3*3*4+4);
		trans = matrices.create.translation([3,2], buffer, 4);
		trans.buffer.should.equal(buffer);
		toArray(dot(trans, mat)).should.eql([-2,4,1]);
	});
	it("should create a translation for 3d vectors and translate them correctly", function() {
		let dot = matrices.dot;
		let trans = matrices.create.translation([-5,7,13]);
		let mat = matrices.create(4,1,[6,-5,2,1]);
		toArray(dot(trans, mat)).should.eql([1,2,15,1]);

		// with buffer
		let buffer = new ArrayBuffer(4*4*4);
		trans = matrices.create.translation([-5,7,13], buffer);
		trans.buffer.should.equal(buffer);
		toArray(dot(trans, mat)).should.eql([1,2,15,1]);

		// with buffer + offset
		buffer = new ArrayBuffer(4*4*4+4);
		trans = matrices.create.translation([-5,7,13], buffer, 4);
		trans.buffer.should.equal(buffer);
		toArray(dot(trans, mat)).should.eql([1,2,15,1]);
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
		toArray(ident).should.eql([1,0, 0,1]);
		ident = matrices.create.identity(3);
		toArray(ident).should.eql([1,0,0, 0,1,0, 0,0,1]);
		ident = matrices.create.identity(4);
		toArray(ident).should.eql([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
		ident = matrices.create.identity(8);
		toArray(ident).should.eql([1,0,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,0,1,0,0,0,0,0, 
		                            0,0,0,1,0,0,0,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,1,0,0, 
																0,0,0,0,0,0,1,0, 0,0,0,0,0,0,0,1]);
		// with buffer
		let buffer = new ArrayBuffer(8*8*4);
		ident = matrices.create.identity(8, buffer);
		toArray(ident).should.eql([1,0,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,0,1,0,0,0,0,0, 
		                            0,0,0,1,0,0,0,0, 0,0,0,0,1,0,0,0, 0,0,0,0,0,1,0,0, 
																0,0,0,0,0,0,1,0, 0,0,0,0,0,0,0,1]);
		ident.buffer.should.equal(buffer);
		// buffer + offset
		buffer = new ArrayBuffer(8*8*4+4);
		ident = matrices.create.identity(8, buffer, 4);
		toArray(ident).should.eql([1,0,0,0,0,0,0,0, 0,1,0,0,0,0,0,0, 0,0,1,0,0,0,0,0, 
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
	console.log(rx.toString());
	let x = create(3,1,Float32Array.of(1,0,0));
	let y = create(3,1,Float32Array.of(0,1,0));
	let z = create(3,1,Float32Array.of(0,0,1));
	it("should create appropriate matrices for rotation", function() {
		toArray(rx).should.be.nearly([1,0,0,0,0,-1,0,1,0], 1.0e-16);
		toArray(ry).should.be.nearly([0,0,1,0,1,0,-1,0,0], 1.0e-16);
		toArray(rz).should.be.nearly([0,-1,0,1,0,0,0,0,1], 1.0e-16);
		// with pre-supplied buffer
		let buffer = new ArrayBuffer(3*3*4+4);
		create.rotateX(r90,buffer).buffer.should.equal(buffer);
		toArray(create.rotateX(r90,buffer)).should.be.nearly([1,0,0,0,0,-1,0,1,0], 1.0e-16);
		create.rotateY(r90,buffer).buffer.should.equal(buffer);
		toArray(create.rotateY(r90,buffer)).should.be.nearly([0,0,1,0,1,0,-1,0,0], 1.0e-16);
		create.rotateZ(r90,buffer).buffer.should.equal(buffer);
		toArray(create.rotateZ(r90,buffer)).should.be.nearly([0,-1,0,1,0,0,0,0,1], 1.0e-16);
		// with buffer + offset
		create.rotateX(r90,buffer,4).buffer.should.equal(buffer);
		toArray(create.rotateX(r90,buffer,4)).should.be.nearly([1,0,0,0,0,-1,0,1,0], 1.0e-16);
		create.rotateY(r90,buffer,4).buffer.should.equal(buffer);
		toArray(create.rotateY(r90,buffer,4)).should.be.nearly([0,0,1,0,1,0,-1,0,0], 1.0e-16);
		create.rotateZ(r90,buffer,4).buffer.should.equal(buffer);
		toArray(create.rotateZ(r90,buffer,4)).should.be.nearly([0,-1,0,1,0,0,0,0,1], 1.0e-16);
	});
	it("should produce a rx matrix that rotates 3d vectors around the x axis", function() {
		toArray(dot(rx,x)).should.be.nearly([1,0,0], 1.0e-16);
		toArray(dot(rx,y)).should.be.nearly([0,0,1], 1.0e-16);
		toArray(dot(rx,z)).should.be.nearly([0,-1,0], 1.0e-16);
	});
	it("should produce a ry matrix that rotates 3d vectors around the y axis", function() {
		toArray(dot(ry,y)).should.be.nearly([0,1,0], 1.0e-16);
		toArray(dot(ry,x)).should.be.nearly([0,0,-1], 1.0e-16);
		toArray(dot(ry,z)).should.be.nearly([1,0,0], 1.0e-16);
	});
	it("should produce a rz matrix that rotates 3d vectors around the z axis", function() {
		toArray(dot(rz,x)).should.be.nearly([0,1,0], 1.0e-16);
		toArray(dot(rz,y)).should.be.nearly([-1,0,0], 1.0e-16);
		toArray(dot(rz,z)).should.be.nearly([0,0,1], 1.0e-16);
	});
	it("should produce correct outputs when rotations are chained using dot", function() {
		let zyx = dot(dot(rz,ry),rx);
		let yzx = dot(dot(ry,rz),rx);
		let xzy = dot(dot(rx,rz),ry);

		toArray(dot(zyx,x)).should.be.nearly([0,0,-1], 1.0e-6); //[1,0,0], 1.0e-6);
		toArray(dot(zyx,y)).should.be.nearly([0,1,0], 1.0e-6); //[1,0,0], 1.0e-6);
		toArray(dot(zyx,z)).should.be.nearly([1,0,0], 1.0e-6); //[1,0,0], 1.0e-6);

		toArray(dot(yzx,x)).should.be.nearly([0,1,0], 1.0e-6);
		toArray(dot(yzx,y)).should.be.nearly([1,0,0], 1.0e-6);
		toArray(dot(yzx,z)).should.be.nearly([0,0,-1], 1.0e-6);

		toArray(dot(xzy,x)).should.be.nearly([0,1,0], 1.0e-6); //[0,1,0], 1.0e-6);
		toArray(dot(xzy,y)).should.be.nearly([-1,0,0], 1.0e-6); //[0,1,0], 1.0e-6);
		toArray(dot(xzy,z)).should.be.nearly([0,0,1], 1.0e-6); //[0,1,0], 1.0e-6);
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
