"use strict";
require("should");
require("./helpers/should.nearly.js");
import * as vectors from "../src/vectrix.vectors";
import * as matrices from "../src/vectrix.matrices";
const toArray = matrices.toArray;

describe("vector functions", function() {
	it("should all exist", function() {
		vectors.create.should.be.a.Function();
		vectors.create.vec2.should.be.a.Function();
		vectors.create.vec3.should.be.a.Function();
		vectors.create.vec4.should.be.a.Function();
		vectors.cross.should.be.a.Function();
		vectors.homogenous.should.be.a.Function();
		vectors.times.should.be.a.Function();
		vectors.mut_times.should.be.a.Function();
		vectors.normalize.should.be.a.Function();
		vectors.mut_normalize.should.be.a.Function();
		vectors.lerp.should.be.a.Function();
		vectors.mut_lerp.should.be.a.Function();
		vectors.clamp.should.be.a.Function();
		vectors.mut_clamp.should.be.a.Function();
		vectors.magnitude.should.be.a.Function();
		vectors.mut_copy.should.be.a.Function();
		vectors.cubic.should.be.a.Function();
		vectors.mut_cubic.should.be.a.Function();
		vectors.angle.should.be.a.Function();
		vectors.distance.should.be.a.Function();
		vectors.toString.should.be.a.Function();
	});
	it("should support cross with 2d or 3d vectors", function() {
		let cross = vectors.cross;
		let a = Float32Array.of(1,2);
		let b = Float32Array.of(2,1);
		let c = Float32Array.of(2,-2,2);
		toArray(cross(a, b)).should.eql([0,0,-3]);
		toArray(cross(a, c)).should.eql([4,-2,-6]);
		toArray(cross(c, a)).should.eql([-4,2,6]);
		(typeof(cross(a, Float32Array.of(0))) === "undefined").should.be.true();
		(typeof(cross(a, Float32Array.of(1,2,3,4))) === "undefined").should.be.true();
	});
	it("should support homogenization of vectors", function() {
		let homogenous = vectors.homogenous;
		let vec2 = Float32Array.of(7,4);
		let vec3 = Float32Array.of(7,4,5);
		let vec4 = Float32Array.of(7,4,5,-2);
		let out = Array(5);
		toArray(homogenous(vec2)).should.eql([7,4,1]);
		toArray(homogenous(vec3)).should.eql([7,4,5,1]);
		toArray(homogenous(vec4)).should.eql([7,4,5,-2,1]);
		// with out parameter
		homogenous(vec4, out).should.eql([7,4,5,-2,1]);
		homogenous(vec4, out).should.equal(out);
	});
	it("should not mutate a vector when producing a homogenous version", function() {
		let homogenous = vectors.homogenous;
		let vec4 = Float32Array.of(7,4,5,-2);
		toArray(homogenous(vec4)).should.eql([7,4,5,-2,1]);
		vec4.should.eql(Float32Array.of(7,4,5,-2));
	});
	it("should produce correct products for scalars, arrays, and vectors", function() {
		let times = vectors.times;
		let vec = Float32Array.of(1,1,1);
		let scalar = 2;
		let arr = [1,1,1];
		let typed = Float32Array.of(1,1,1);
		let right = Float32Array.of(0,0,1);
		let left = Float32Array.of(0,0,0);
		let twodee = Float32Array.of(2,1);
		let fourdee = Float32Array.of(2,1,1,1);
		times(vec, vec).should.eql(3, "should produce a correct scalar product when two vectors are multiplied");
		times(vec, arr).should.eql(3, "should accept a plain array instead of a vector and produce a vector product");
		times(vec, typed).should.eql(3, "should accept a typed array instead of a vector and produce a vector product");
		times(right, left).should.eql(0, "prove the product is zero when vectors at right angles are multiplied");
		times(twodee, twodee).should.eql(5, "should work on two-dimensional vectors");
		times(fourdee, fourdee).should.eql(7, "should work on a four-dimensional vector");
		times(vec, scalar).should.eql(Float32Array.of(2,2,2), "should produce a scaled vector when a vector is multiplied by a scalar");
	});
	it("should not mutate operands when multiplying", function() {
		let times = vectors.times;
		let a = Float32Array.of(2,1,1,1);
		let b = Float32Array.of(3,4,5,6);
		times(a,b);
		a.should.eql(Float32Array.of(2,1,1,1));
		b.should.eql(Float32Array.of(3,4,5,6));
	});
	it("should mutate only the first operand when mutably multiplying an array by a scalar", function() {
		let mut_times = vectors.mut_times, toArray = matrices.toArray;
		let a = Float32Array.of(2,1,1,1);
		let b = Float32Array.of(3,4,5,6);
		let out = mut_times(a,b);
		out.should.not.eql(a);
		a.should.eql(Float32Array.of(2,1,1,1));
		b.should.eql(Float32Array.of(3,4,5,6));
		out = mut_times(a, 2);
		toArray(out).should.eql([4,2,2,2]);
		out.should.eql(a);
	});
	it("should normalize a vector of any length", function() {
		let normalize = vectors.normalize;
		let vec2 = Float32Array.of(21, 4);
		let vec3 = Float32Array.of(9, 18, 27);
		let vec4 = Float32Array.of(16, 92, 73, 1);
		normalize(vec2).should.be.nearly(Float32Array.of(0.982339, 0.187112), 1.0e-6);
		normalize(vec3).should.be.nearly(Float32Array.of(0.267261, 0.534522, 0.801784), 1.0e-6);
		normalize(vec4).should.be.nearly(Float32Array.of(0.134984, 0.776157, 0.615864, 0.00843649), 1.0e-6);
		// out param support
		let out = vectors.create.vec4();
		normalize(vec4, out).should.be.nearly(Float32Array.of(0.134984, 0.776157, 0.615864, 0.00843649), 1.0e-6);
		normalize(vec4, out).should.equal(out);
	});
	it("should not mutate its operand when normalizing a vector", function() {
		let normalize = vectors.normalize;
		let vec4 = Float32Array.of(16, 92, 73, 1);
		normalize(vec4);
		vec4.should.eql(Float32Array.of(16, 92, 73, 1));
	});
	it("should mutate its operand during a mutating normalize operation", function() {
		let mut_normalize = vectors.mut_normalize;
		let vec4 = Float32Array.of(16, 92, 73, 1);
		mut_normalize(vec4);
		vec4.should.be.nearly(Float32Array.of(0.134984, 0.776157, 0.615864, 0.00843649), 1.0e-6);
	});
	it("should perform linear interpolations correctly on like vectors", function() {
		let lerp = vectors.lerp;
		let vec2 = Float32Array.of(2,3);
		let vec3 = Float32Array.of(4,8,16);
		let vec4 = Float32Array.of(9,18,27,1);
		let t = 0.5;
		let out = new Array(4);
		toArray(lerp(vec2, Float32Array.of(4,6), t)).should.eql([3,4.5]);
		toArray(lerp(vec3, Float32Array.of(2,4,8), t)).should.eql([3,6,12]);
		toArray(lerp(vec4, Float32Array.of(0,0,0,0), 0.666666)).should
			.be.nearly([3,6,9,0.3333], 1.0e-3);
		// extrapolation should work too
		toArray(lerp(vec2, Float32Array.of(4,6),  0)).should.eql([2,3]);
		toArray(lerp(vec2, Float32Array.of(4,6), -1)).should.eql([0,0]);
		toArray(lerp(vec2, Float32Array.of(4,6),  1)).should.eql([4,6]);
		toArray(lerp(vec2, Float32Array.of(4,6),  2)).should.eql([6,9]);
		// support for out parameter
		lerp(vec4, Float32Array.of(0,0,0,0), 0.666666, out).should.be.nearly([3,6,9,0.3333], 1.0e-3);
		lerp(vec4, Float32Array.of(0,0,0,0), 0.666666, out).should.equal(out);
	});
	it("should not mutate operands during lerp", function() {
		let lerp = vectors.lerp;
		let a = Float32Array.of(2,3);
		let b = Float32Array.of(4,6);
		let t = 0.5;
		toArray(lerp(a, b, t)).should.eql([3,4.5]);
		a.should.eql(Float32Array.of(2,3));
		b.should.eql(Float32Array.of(4,6));
		t.should.eql(0.5);
	});
	it("should mutate only the first operand during a mutating linear interpolation", function() {
		let a = Float32Array.of(2,3);
		let b = Float32Array.of(4,6);
		let t = 0.5;
		vectors.mut_lerp(a, b, t).should.eql(a);
		b.should.eql(Float32Array.of(4,6));
		t.should.eql(0.5);
	});
	it("should perform cubic interpolations correctly on like vectors", function() {
		// can only verify 2d with precalculated values for lack of good source for 3d or 
		// 4d, but "should" work for 3d and 4d vectors too :/
		let cubic = vectors.cubic;
		let a = Float32Array.of(5,6);
		let b = Float32Array.of(9,7);
		let c = Float32Array.of(4,4);
		let d = Float32Array.of(10,8);
		let t = 0.5;
		let out = cubic(a, b, c, d, t);
		toArray(out).should.eql([6.75,5.875]);
		// with out param
		toArray(cubic(a, b, c, d, t, out)).should.eql([6.75,5.875]);
		cubic(a, b, c, d, t, out).should.eql(out);
	});
	it("should not mutate operands during cubic interpolation", function() {
		let cubic = vectors.cubic;
		let a = Float32Array.of(5,6);
		let b = Float32Array.of(9,7);
		let c = Float32Array.of(4,4);
		let d = Float32Array.of(10,8);
		let t = 0.5;
		toArray(cubic(a, b, c, d, t)).should.eql([6.75,5.875]);
		a.should.eql(Float32Array.of(5,6));
		b.should.eql(Float32Array.of(9,7));
		c.should.eql(Float32Array.of(4,4));
		d.should.eql(Float32Array.of(10,8));
		t.should.eql(0.5);
	});
	it("should mutate only the first operand during a mutating cubic interpolation", function() {
		let a = Float32Array.of(5,6);
		let b = Float32Array.of(9,7);
		let c = Float32Array.of(4,4);
		let d = Float32Array.of(10,8);
		let t = 0.5;
		vectors.mut_cubic(a, b, c, d, t).should.eql(a);
		b.should.eql(Float32Array.of(9,7));
		c.should.eql(Float32Array.of(4,4));
		d.should.eql(Float32Array.of(10,8));
		t.should.eql(0.5);
	});
	it("should find the angle between any two like vectors", function() {
		let angle = vectors.angle;
		angle(Float32Array.of(1,0), Float32Array.of(0,1)).should.eql(90*Math.PI/180);
		angle(Float32Array.of(1,1,0), Float32Array.of(0,0,1)).should.eql(90*Math.PI/180);
		angle(Float32Array.of(1,1,1,0), Float32Array.of(0,0,0,1)).should.eql(90*Math.PI/180);
		angle(Float32Array.of(0.5,0.5,0.5,0), Float32Array.of(0,0,0,1)).should.eql(90*Math.PI/180);
	});
	it("should find the distance between any two like vectors", function() {
		let distance = vectors.distance;
		distance(Float32Array.of(0,0), Float32Array.of(3,4)).should.eql(5);
		distance(Float32Array.of(0,0,0), Float32Array.of(0,6,8)).should.eql(10);
		distance(Float32Array.of(0,0,0,0), Float32Array.of(0,0,8,15)).should.eql(17);
	});
	it("should clamp vectors and scalars", function() {
		let clamp = vectors.clamp, mut_clamp = vectors.mut_clamp;
		clamp(10, 1, 5).should.eql(5);
		clamp(-10, 1, 5).should.eql(1);
		clamp(4, 1, 5).should.eql(4);
		clamp(Float32Array.of(-5,10), 1, 10).should.eql(Float32Array.of(1,10));
		clamp(Float32Array.of(-5,10,15), 1, 10).should.eql(Float32Array.of(1,10,10));
		clamp(Float32Array.of(-20,-5,10,15), 1, 10).should.eql(Float32Array.of(1,1,10,10));
		let vec = Float32Array.of(-20,-5,10,15); 
		let out = mut_clamp(vec, 1, 10);
		out.should.eql(Float32Array.of(1,1,10,10));
		out.should.eql(vec);
	});
	it("should copy values", function() {
		let copy = vectors.mut_copy;
		let v2 = Float32Array.of(2, 2);
		let v3 = Float32Array.of(3, 3, 3);
		let v4 = Float32Array.of(4, 4, 4, 4);
		copy(v3, v2).should.eql(Float32Array.of(2,2,3));
		copy(v2, v4).should.eql(Float32Array.of(4,4));
		copy(v4, v3).should.eql(Float32Array.of(2,2,3,4));
		copy(v2, v4).should.eql(Float32Array.of(2,2));
	});
	it("should take the magnitude of a vector", function() {
		let mag = vectors.magnitude;
		mag(Float32Array.of(3,4)).should.eql(5);
		mag(Float32Array.of(2, 3, 5)).should.be.approximately(6.16441400297, 1.0e-6);
		mag(Float32Array.of(2, 3, 4, 5)).should.be.approximately(7.34846922835, 1.0e-6);
	});
	it("should throw an error when create is used with no parameters", function() {
		(function() {vectors.create()}).should.throwError();
	});
});
describe("a 2d vector", function() {
	it("should create a vector [0,0] when given no arguments", function() {
		let vec = vectors.vec2();
		toArray(vec).should.eql([0,0]);
		vec.rows.should.eql(2);
		vec.cols.should.eql(1);
	});
	it("should create a populated vector when given one argument with length 2", function() {
		let initial = [1,2];
		let vec = vectors.vec2(initial);
		toArray(vec).should.eql(initial);
	});
	it("should create a populated vector when given two arguments", function() {
		let vec = vectors.vec2(3,4);
		toArray(vec).should.eql([3,4]);
	});
	it("should create vectors with pre-supplied buffers", function() {
		let buffer, vec;
		// 2d vectors
		buffer = new ArrayBuffer(2*4+4);
		vec = vectors.vec2(buffer); // with only buffer 
		toArray(vec).should.eql([0,0]);
		vec.buffer.should.eql(buffer);
		vec = vectors.vec2(buffer, 4); // with buffer and offset 
		vec.buffer.should.eql(buffer);
		vec.buffer.byteLength.should.eql(2*4+4);
		vec.byteLength.should.eql(2*4);
		toArray(vec).should.eql([0,0]);
		vec = vectors.vec2([2.3, 0.1], buffer, 4); // with values, buffer and offset 
		vec.buffer.should.eql(buffer);
		vec.buffer.byteLength.should.eql(2*4+4);
		vec.byteLength.should.eql(2*4);
		toArray(vec).should.be.nearly([2.3,0.1], 1e-6);
		// 3d vectors
		buffer = new ArrayBuffer(3*4+4);
		vec = vectors.vec3(buffer, 4); // with buffer and offset 
		vec.buffer.should.eql(buffer);
		vec.buffer.byteLength.should.eql(3*4+4);
		vec.byteLength.should.eql(3*4);
		toArray(vec).should.eql([0,0,0]);
		vec = vectors.vec3([2.3, 0.1, 1.2], buffer, 4); // with values, buffer and offset 
		vec.buffer.should.eql(buffer);
		vec.buffer.byteLength.should.eql(3*4+4);
		vec.byteLength.should.eql(3*4);
		toArray(vec).should.be.nearly([2.3, 0.1, 1.2], 1e-6);
		// 4d vectors
		buffer = new ArrayBuffer(4*4+4);
		vec = vectors.vec4(buffer, 4); // with buffer and offset 
		vec.buffer.should.eql(buffer);
		vec.buffer.byteLength.should.eql(4*4+4);
		vec.byteLength.should.eql(4*4);
		toArray(vec).should.eql([0,0,0,0]);
		vec = vectors.vec4([2.4, 0.1, 1.2, 6.3], buffer, 4); // with values, buffer and offset 
		vec.buffer.should.eql(buffer);
		vec.buffer.byteLength.should.eql(4*4+4);
		vec.byteLength.should.eql(4*4);
		toArray(vec).should.be.nearly([2.4, 0.1, 1.2, 6.3], 1e-6);
	});
	it("should throw an error when given any other number of arguments", function() {
		(function() {vectors.vec2(1, 2, 3)}).should.throwError();
	});
	it("should produce a copy of itself when multiplied by an identity matrix", function() {
		let vec = vectors.vec2(7,4);
		let matrix = matrices.create(2,2,[1,0, 0,1]);
		toArray(matrices.dot(matrix, vec)).should.eql([7,4]);
	});
	it("should be scaled by a scaling matrix", function() {
		let vec = vectors.vec2(7,4);
		let matrix = matrices.create(2,2,[2,0, 0,2]);
		toArray(matrices.dot(matrix, vec)).should.eql([14,8]);
	});
	it("should be translated by a translation matrix", function() {
		let vec = vectors.vec2(7,4);
		let matrix = matrices.create(3,3,[1,0,-9, 0,1,4, 0,0,1]);
		toArray(matrices.dot(matrix, vectors.homogenous(vec))).should.eql([-2,8,1]);
	});
});
describe("a 3d vector", function() {
	it("should create a vector [0,0,0] when given no arguments", function() {
		let vec = vectors.vec3();
		toArray(vec).should.eql([0,0,0]);
		vec.rows.should.eql(3);
		vec.cols.should.eql(1);
	});
	it("should create a populated vector when given one argument with length 3", function() {
		let initial = [1,2,3];
		let vec = vectors.vec3(initial);
		toArray(vec).should.eql(initial);
	});
	it("should create a populated vector when given three arguments", function() {
		let vec = vectors.vec3(4,5,6);
		toArray(vec).should.eql([4,5,6]);
	});
	it("should create a 3d vector given a 2d vector-like object and a z value", function() {
		let vec = vectors.vec3([0,1], 1);
		toArray(vec).should.eql([0,1,1]);
		vec = vectors.vec3(vectors.vec2(4,3), 6);
		toArray(vec).should.eql([4,3,6]);
		vec = vectors.vec3(matrices.create(1,2, [0,5]), 3);
		toArray(vec).should.eql([0,5,3]);
	});
	it("should create vectors with pre-supplied buffers", function() {
		let buffer, vec;
		buffer = new ArrayBuffer(3*4);
		vec = vectors.vec3(buffer); // with only buffer 
		toArray(vec).should.eql([0,0,0]);
		vec.buffer.should.eql(buffer);
		buffer = new ArrayBuffer(3*4+4);
		vec = vectors.vec3(buffer, 4); // with buffer and offset 
		vec.buffer.should.eql(buffer);
		vec.buffer.byteLength.should.eql(3*4+4);
		vec.byteLength.should.eql(3*4);
		toArray(vec).should.eql([0,0,0]);
		vec = vectors.vec3([3.3, 0.1, 2.2], buffer, 4); // with values, buffer and offset 
		vec.buffer.should.eql(buffer);
		vec.buffer.byteLength.should.eql(3*4+4);
		vec.byteLength.should.eql(3*4);
		toArray(vec).should.be.nearly([3.3,0.1,2.2], 1e-6);
	});
	it("should throw an error when given any other number of arguments", function() {
		(function() {vectors.vec2(1, 2, 3, 4)}).should.throwError();
	});
	it("should produce a copy of itself when multiplied by an identity matrix", function() {
		let vec = vectors.vec3(7,4,13);
		let matrix = matrices.create(3,3,[1,0,0, 0,1,0, 0,0,1]);
		toArray(matrices.dot(matrix, vec)).should.eql([7,4,13]);
	});
	it("should be scaled by a scaling matrix", function() {
		let vec = vectors.vec3(7,4,5);
		let matrix = matrices.create(3,3,[2,0,0, 0,2,0, 0,0,2]);
		toArray(matrices.dot(matrix, vec)).should.eql([14,8,10]);
	});
	it("should be translated by a translation matrix", function() {
		let vec = vectors.vec3(7,4,5);
		let matrix = matrices.create(4,4,[1,0,0,-9, 0,1,0,4, 0,0,1,-6, 0,0,0,1]);
		toArray(matrices.dot(matrix, vectors.homogenous(vec))).should.eql([-2,8,-1,1]);
	});
});
describe("a 4d vector", function() {
	it("should create a vector [0,0,0,0] when given no arguments", function() {
		let vec = vectors.vec4();
		toArray(vec).should.eql([0,0,0,0]);
		vec.rows.should.eql(4);
		vec.cols.should.eql(1);
	});
	it("should create a populated vector when given one argument with length 4", function() {
		let initial = [1,2,3,4];
		let vec = vectors.vec4(initial);
		toArray(vec).should.eql(initial);
	});
	it("should create a populated vector when given four arguments", function() {
		let vec = vectors.vec4(5,6,7,8);
		toArray(vec).should.eql([5,6,7,8]);
	});
	it("should create a 4d vector from a combination of vector-like objects and remaining components", function() {
		let vec = vectors.vec4([0,1], 1, 3);
		toArray(vec).should.eql([0,1,1,3]);
		vec = vectors.vec4(vectors.vec3(4,3,6),7);
		toArray(vec).should.eql([4,3,6,7]);
		vec = vectors.vec4(vectors.vec2(4,3), [2,2]);
		toArray(vec).should.eql([4,3,2,2]);
		vec = vectors.vec4(matrices.create(1,2, [0,5]), 3, 2);
		toArray(vec).should.eql([0,5,3,2]);
		vec = vectors.vec4([9], [7], [7,2]);
		toArray(vec).should.eql([9,7,7,2]);
	});
	it("should create vectors with pre-supplied buffers", function() {
		let buffer, vec;
		buffer = new ArrayBuffer(4*4);
		vec = vectors.vec4(buffer); // with only buffer 
		toArray(vec).should.eql([0,0,0,0]);
		vec.buffer.should.eql(buffer);
		buffer = new ArrayBuffer(4*4+4);
		vec = vectors.vec4(buffer, 4); // with buffer and offset 
		vec.buffer.should.eql(buffer);
		vec.buffer.byteLength.should.eql(4*4+4);
		vec.byteLength.should.eql(4*4);
		toArray(vec).should.eql([0,0,0,0]);
		vec = vectors.vec4([4.3, 0.1, 2.2, 4.4], buffer, 4); // with values, buffer and offset 
		vec.buffer.should.eql(buffer);
		vec.buffer.byteLength.should.eql(4*4+4);
		vec.byteLength.should.eql(4*4);
		toArray(vec).should.be.nearly([4.3,0.1,2.2,4.4], 1e-6);
	});
	it("should throw an error when given any other number of arguments", function() {
		(function() {vectors.vec2(1, 2, 3, 4, 5)}).should.throwError();
	});
	it("should produce a copy of itself when multiplied by an identity matrix", function() {
		let vec = vectors.vec4(7,4,13,-2);
		let matrix = matrices.create(4,4,[1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
		toArray(matrices.dot(matrix, vec)).should.eql([7,4,13,-2]);
	});
	it("should be scaled by a scaling matrix", function() {
		let vec = vectors.vec4(7,4,5,-2);
		let matrix = matrices.create(4,4,[2,0,0,0, 0,2,0,0, 0,0,2,0, 0,0,0,2]);
		toArray(matrices.dot(matrix, vec)).should.eql([14,8,10,-4]);
	});
	it("should be translated by a translation matrix", function() {
		let vec = vectors.vec4(7,4,5,-2);
		let matrix = matrices.create(5,5,[1,0,0,0,-9, 0,1,0,0,4, 0,0,1,0,-6, 0,0,0,1,17, 0,0,0,0,1]);
		toArray(matrices.dot(matrix, vectors.homogenous(vec))).should.eql([-2,8,-1,15,1]);
	});
});
/*
describe("vector methods", function() {
	it("should return the correct types for vector products", function() {
		let times = vectors.times;
		let vec2 = vectors.vec2([1,1]);
		let vec3 = vectors.vec3([1,1,1]);
		let vec4 = vectors.vec4([1,1,1,1]);
		let scalar = 2;
		times(vec3, vec3).should.eql(3);
		times(vec2, scalar).should.deepEqual(Float32Array.of(2,2));
		times(vec3, scalar).should.deepEqual(Float32Array.of(2,2,2));
		times(vec4, scalar).should.deepEqual(Float32Array.of(2,2,2,2));
	});
	it("should return vectors from normalize", function() {
		let vec2 = vectors.vec2([21, 4]);
		let vec3 = vectors.vec3([9, 18, 27]);
		let vec4 = vectors.vec4([16, 92, 73, 1]);
		// duck type them by checking their aliases 
		vec2.normalize().should.have.property("xy");
		vec2.normalize().should.not.have.property("xyz");
		vec3.normalize().should.have.property("rgb");
		vec3.normalize().should.not.have.property("rgba");
		vec4.normalize().should.have.property("xyzw");
	});
	it("should return vectors from lerp", function() {
		let vec2 = vectors.vec2([2,3]);
		let vec3 = vectors.vec3([4,8,16]);
		let vec4 = vectors.vec4([9,18,27,1]);
		// duck type them by checking their aliases 
		vec2.lerp([0.1,1.0],0.5).should.have.property("xy");
		vec2.lerp([0.1,1.0],0.5).should.not.have.property("xyz");
		vec3.lerp([0.1,1.0,3.0],0.5).should.have.property("rgb");
		vec3.lerp([0.1,1.0,3.0],0.5).should.not.have.property("rgba");
		vec4.lerp([0.1,1.0,1.0,1.0],0.5).should.have.property("xyzw");
	});
	it("should return vectors from cubic", function() {
		let vec2 = vectors.vec2([5,6]);
		let vec3 = vectors.vec3([4,8,16]);
		let vec4 = vectors.vec4([9,18,27,1]);
		// duck type them by checking their aliases 
		vec2.cubic([9,7],[4,4],[10,8],0.5).should.have.property("xy");
		vec2.cubic([9,7],[4,4],[10,8],0.5).should.not.have.property("rgb");
		vec3.cubic([9,7,6],[4,4,1],[10,8,17],0.5).should.have.property("rgb");
		vec3.cubic([9,7,6],[4,4,1],[10,8,16],0.5).should.not.have.property("rgba");
		vec4.cubic([9,7,3,1],[4,4,5,6],[10,8,1,19],0.5).should.have.property("xyzw");
	});
	it("should produce representations of themselves", function() {
		let toString = vectors.toString;
		toString(vectors.vec2([13,1])).should.eql("vec2(13.00, 1.00)");
		toString(vectors.vec3([13,1,22])).should.eql("vec3(13.00, 1.00, 22.00)");
		toString(vectors.vec4([13,1,22,123])).should.eql("vec4(13.00, 1.00, 22.00, 123.00)");
		vectors.vec2([13,1]).toString().should.eql("vec2(13.00, 1.00)");
		vectors.vec3([13,1,22]).toString().should.eql("vec3(13.00, 1.00, 22.00)");
		vectors.vec4([13,1,22,123]).toString().should.eql("vec4(13.00, 1.00, 22.00, 123.00)");
	});
});
*/
describe("a wrapped 2d vector", function() {
	it("should have all the 2d vector aliases", function() {
		function checkAliases(vec) {
			vec.x.should.equal(1);
			vec.y.should.equal(2);
			vectors.aliases2d.forEach((aliases) => {
				aliases.names.forEach((name) => {
					vec.hasOwnProperty(name).should.eql(true, "has alias "+name);
				});
			});
			vectors.aliasCombos2d.forEach((combo) => {
				let name = combo.join("");
				vec.hasOwnProperty(name).should.eql(true, "has alias combo "+name);
			});
		}
		let vec = vectors.wrap(vectors.vec2([1,2]));
		checkAliases(vec);
	});
	it("should have all the common vector and matrix functions as working methods", function() {
		let wrap = vectors.wrap;
		let mat = matrices.wrap(matrices.create(2,2, [-5,2,1,4]));
		function checkMethods(vec) {
			vec.toArray.should.be.a.Function();
			vec.toArray().should.eql([-5,2]);
			vec.toString.should.be.a.Function();
			vec.toString().should.eql("vec2(-5.00, 2.00)");
			vec.col.should.be.a.Function();
			toArray(vec.col(0)).should.eql([-5,2]);
			vec.row.should.be.a.Function();
			toArray(vec.row(1)).should.eql([2]);
			vec.plus.should.be.a.Function();
			toArray(vec.plus(3)).should.eql([-2,5]);
			vec.minus.should.be.a.Function();
			toArray(vec.minus(3)).should.eql([-8,-1]);
			vec.dot.should.be.a.Function();
			mat.dot(vec).should.eql(matrices.dot(mat, vec));
			vec.cross.should.be.a.Function();
			toArray(vec.cross(Float32Array.of(-3,7))).should.eql(
				toArray(vectors.cross(vec, Float32Array.of(-3,7)))
			);
			vec.homogenous.should.be.a.Function();
			toArray(vec.homogenous()).should.eql([-5,2,1]);
			vec.times.should.be.a.Function();
			toArray(vec.times(3)).should.eql([-15,6]);
			vec.normalize.should.be.a.Function();
			toArray(vec.normalize()).should.be.nearly([-0.928476,0.371391], 1.0e-6);
			vec.clamp.should.be.a.Function();
			toArray(vec.clamp(1, 1)).should.eql([1,1]);
			vec.magnitude.should.be.a.Function();
			vec.magnitude().should.eql(vectors.magnitude(vec));
			vec.angle.should.be.a.Function();
			vec.angle([13,6]).should.eql(vectors.angle(vec, [13,6]));
			vec.distance.should.be.a.Function();
			vec.distance([1,3]).should.eql(vectors.distance(vec,[1,3]));

			// if it returns an equal value vector in these interpolations it's doing what it's
			// supposed to, we assume
			vec.lerp.should.be.a.Function();
			toArray(vec.lerp(vec, 1)).should.eql([-5,2]);
			vec.cubic.should.be.a.Function();
			toArray(vec.cubic(vec, vec, vec, 1)).should.eql([-5,2]);

			// mutables
			vec.mut_times.should.be.a.Function();
			vec.mut_times(3);
			toArray(vec).should.eql([-15,6]);
			vec.mut_clamp.should.be.a.Function();
			vec.mut_clamp(-5,2);
			toArray(vec).should.eql([-5,2]);
			vec.mut_copy.should.be.a.Function();
			vec.mut_copy([1,2]);
			toArray(vec).should.eql([1,2]);
			vec.mut_normalize.should.be.a.Function();
			vec.mut_normalize();
			toArray(vec).should.be.nearly([0.4472135,0.8944271], 1.0e-6);
			vec.mut_lerp.should.be.a.Function();
			vec.mut_lerp(vec, 1);
			toArray(vec).should.be.nearly([0.4472135,0.8944271], 1.0e-6);
			vec.mut_cubic.should.be.a.Function();
			vec.mut_cubic(vec, vec, vec, 1);
			toArray(vec).should.be.nearly([0.4472135,0.8944271], 1.0e-6);
		}
		let vec = wrap(Float32Array.of(-5, 2));
		checkMethods(vec);
		vec = wrap(vectors.vec2(-5, 2));
		checkMethods(vec);
		vec = wrap([-5, 2]);
		checkMethods(vec);
	});
});
describe("a wrapped 3d vector", function() {
	it("should have all the 3d vector aliases", function() {
		// test a few of them just to make sure the mapping is good
		function checkAliases(vec) {
			vec.x.should.equal(1);
			vec.y.should.equal(2);
			vec.z.should.equal(3);
			toArray(vec.yz).should.eql([2,3]);
			toArray(vec.xyz).should.eql([1,2,3]);
			toArray(vec.zyx).should.eql([3,2,1]);
			toArray(vec.rgb).should.eql([1,2,3]);
			toArray(vec.rbg).should.eql([1,3,2]);
			toArray(vec.bgr).should.eql([3,2,1]);
			// skim the rest to make sure they're there
			vectors.aliases3d.forEach((aliases) => {
				aliases.names.forEach((name) => {
					vec.hasOwnProperty(name).should.eql(true, "has alias "+name);
				});
			});
			vectors.aliasCombos2d.concat(vectors.aliasCombos3d).forEach((combo) => {
				let name = combo.join("");
				vec.hasOwnProperty(name).should.eql(true, "has alias combo "+name);
			});
		}
		let vec = vectors.wrap(vectors.vec3([1,2,3]));
		checkAliases(vec);
	});
	it("should have all the common vector and matrix functions as working methods", function() {
		let wrap = vectors.wrap;
		let mat = matrices.wrap(matrices.create(3,3, [-5,2,6,1,4,2]));
		function checkMethods(vec) {
			vec.toArray.should.be.a.Function();
			vec.toArray().should.eql([-5,2,1]);
			vec.toString.should.be.a.Function();
			vec.toString().should.eql("vec3(-5.00, 2.00, 1.00)");
			vec.col.should.be.a.Function();
			toArray(vec.col(0)).should.eql([-5,2,1]);
			vec.row.should.be.a.Function();
			toArray(vec.row(2)).should.eql([1]);
			vec.plus.should.be.a.Function();
			toArray(vec.plus(3)).should.eql([-2,5,4]);
			vec.minus.should.be.a.Function();
			toArray(vec.minus(3)).should.eql([-8,-1,-2]);
			vec.dot.should.be.a.Function();
			mat.dot(vec).should.eql(matrices.dot(mat, vec));
			vec.cross.should.be.a.Function();
			toArray(vec.cross(Float32Array.of(-3,7,3))).should.eql(
				toArray(vectors.cross(vec, Float32Array.of(-3,7,3)))
			);
			vec.homogenous.should.be.a.Function();
			toArray(vec.homogenous()).should.eql([-5,2,1,1]);
			vec.times.should.be.a.Function();
			toArray(vec.times(3)).should.eql([-15,6,3]);
			vec.normalize.should.be.a.Function();
			toArray(vec.normalize()).should.be.nearly([-0.912870,0.365148,0.182574], 1.0e-6);
			vec.clamp.should.be.a.Function();
			toArray(vec.clamp(1, 1)).should.eql([1,1,1]);
			vec.magnitude.should.be.a.Function();
			vec.magnitude().should.eql(vectors.magnitude(vec));
			vec.angle.should.be.a.Function();
			vec.angle([13,6,2]).should.eql(vectors.angle(vec, [13,6,2]));
			vec.distance.should.be.a.Function();
			vec.distance([1,3,7]).should.eql(vectors.distance(vec,[1,3,7]));

			// if it returns an equal value vector in these interpolations it's doing what it's
			// supposed to, we assume
			vec.lerp.should.be.a.Function();
			toArray(vec.lerp(vec, 1)).should.eql([-5,2,1]);
			vec.cubic.should.be.a.Function();
			toArray(vec.cubic(vec, vec, vec, 1)).should.eql([-5,2,1]);

			// mutables
			vec.mut_times.should.be.a.Function();
			vec.mut_times(3);
			toArray(vec).should.eql([-15,6,3]);
			vec.mut_clamp.should.be.a.Function();
			vec.mut_clamp(-5,2);
			toArray(vec).should.eql([-5,2,2]);
			vec.mut_copy.should.be.a.Function();
			vec.mut_copy([1,2,7]);
			toArray(vec).should.eql([1,2,7]);
			vec.mut_normalize.should.be.a.Function();
			vec.mut_normalize();
			toArray(vec).should.be.nearly([0.136082,0.272165,0.952579], 1.0e-6);
			vec.mut_lerp.should.be.a.Function();
			vec.mut_lerp(vec, 1);
			toArray(vec).should.be.nearly([0.136082,0.272165,0.952579], 1.0e-6);
			vec.mut_cubic.should.be.a.Function();
			vec.mut_cubic(vec, vec, vec, 1);
			toArray(vec).should.be.nearly([0.136082,0.272165,0.952579], 1.0e-6);
		}
		let vec = wrap(Float32Array.of(-5, 2, 1));
		checkMethods(vec);
		vec = wrap(vectors.vec3(-5, 2, 1));
		checkMethods(vec);
		vec = wrap([-5, 2, 1]);
		checkMethods(vec);
	});
});
describe("a wrapped 4d vector", function() {
	it("should have all the 4d vector aliases", function() {
		function checkAliases(vec) {
			vec.x.should.equal(1);
			vec.y.should.equal(2);
			vec.z.should.equal(3);
			// test a few of them just to make sure the mapping is good
			toArray(vec.xyzw).should.eql([1,2,3,4]);
			toArray(vec.zyxw).should.eql([3,2,1,4]);
			toArray(vec.rgba).should.eql([1,2,3,4]);
			toArray(vec.rabg).should.eql([1,4,3,2]);
			toArray(vec.abgr).should.eql([4,3,2,1]);
			// skim the rest to make sure they're there
			vectors.aliases4d.forEach((aliases) => {
				aliases.names.forEach((name) => {
					vec.hasOwnProperty(name).should.eql(true, "has alias "+name);
				});
			});
			vectors.aliasCombos2d.concat(vectors.aliasCombos3d, vectors.aliasCombos4d).forEach((combo) => {
				let name = combo.join("");
				vec.hasOwnProperty(name).should.eql(true, "has alias combo "+name);
			});
		}
		let vec = vectors.wrap(vectors.vec4([1,2,3,4]));
		checkAliases(vec);
	});
	it("should have all the common vector and matrix functions as working methods", function() {
		let wrap = vectors.wrap;
		let mat = matrices.wrap(matrices.create(4,4, [-5,2,6,2,1,4,2,7]));
		function checkMethods(vec) {
			vec.toArray.should.be.a.Function();
			vec.toArray().should.eql([-5,2,1,7]);
			vec.toString.should.be.a.Function();
			vec.toString().should.eql("vec4(-5.00, 2.00, 1.00, 7.00)");
			vec.col.should.be.a.Function();
			toArray(vec.col(0)).should.eql([-5,2,1,7]);
			vec.row.should.be.a.Function();
			toArray(vec.row(2)).should.eql([1]);
			vec.plus.should.be.a.Function();
			toArray(vec.plus(3)).should.eql([-2,5,4,10]);
			vec.minus.should.be.a.Function();
			toArray(vec.minus(3)).should.eql([-8,-1,-2,4]);
			vec.dot.should.be.a.Function();
			mat.dot(vec).should.eql(matrices.dot(mat, vec));
			vec.homogenous.should.be.a.Function();
			toArray(vec.homogenous()).should.eql([-5,2,1,7,1]);
			vec.times.should.be.a.Function();
			toArray(vec.times(3)).should.eql([-15,6,3,21]);
			vec.normalize.should.be.a.Function();
			toArray(vec.normalize()).should.be.nearly(
				[-0.562543,0.225017,0.112508,0.787561], 1.0e-6);
			vec.clamp.should.be.a.Function();
			toArray(vec.clamp(1, 1)).should.eql([1,1,1,1]);
			vec.magnitude.should.be.a.Function();
			vec.magnitude().should.eql(vectors.magnitude(vec));
			vec.angle.should.be.a.Function();
			vec.angle([13,6,2,-2]).should.eql(vectors.angle(vec, [13,6,2,-2]));
			vec.distance.should.be.a.Function();
			vec.distance([1,3,7,11]).should.eql(vectors.distance(vec,[1,3,7,11]));

			// if it returns an equal value vector in these interpolations it's doing what it's
			// supposed to, we assume
			vec.lerp.should.be.a.Function();
			toArray(vec.lerp(vec, 1)).should.eql([-5,2,1,7]);
			vec.cubic.should.be.a.Function();
			toArray(vec.cubic(vec, vec, vec, 1)).should.eql([-5,2,1,7]);

			// mutables
			vec.mut_times.should.be.a.Function();
			vec.mut_times(3);
			toArray(vec).should.eql([-15,6,3,21]);
			vec.mut_clamp.should.be.a.Function();
			vec.mut_clamp(-5,2);
			toArray(vec).should.eql([-5,2,2,2]);
			vec.mut_copy.should.be.a.Function();
			vec.mut_copy([1,2,7,11]);
			toArray(vec).should.eql([1,2,7,11]);
			vec.mut_normalize.should.be.a.Function();
			vec.mut_normalize();
			toArray(vec).should.be.nearly(
				[0.075592,0.151185,0.529150,0.831521], 1.0e-6);
			vec.mut_lerp.should.be.a.Function();
			vec.mut_lerp(vec, 1);
			toArray(vec).should.be.nearly(
				[0.075592,0.151185,0.529150,0.831521], 1.0e-6);
			vec.mut_cubic.should.be.a.Function();
			vec.mut_cubic(vec, vec, vec, 1);
			toArray(vec).should.be.nearly(
				[0.075592,0.151185,0.529150,0.831521], 1.0e-6);
		}
		let vec = wrap(Float32Array.of(-5, 2, 1, 7));
		checkMethods(vec);
		vec = wrap(vectors.vec4(-5, 2, 1, 7));
		checkMethods(vec);
		vec = wrap([-5, 2, 1, 7]);
		checkMethods(vec);
	});
});
