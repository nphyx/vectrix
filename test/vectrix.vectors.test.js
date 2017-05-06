"use strict";
require("should");
require("./helpers/should.nearly.js");
import * as vectors from "../src/vectrix.vectors";
import * as matrices from "../src/vectrix.matrices";

describe("vector functions", function() {
	it("should all exist", function() {
		vectors.create.should.be.a.Function();
		vectors.create.vec2.should.be.a.Function();
		vectors.create.vec3.should.be.a.Function();
		vectors.create.vec4.should.be.a.Function();
		vectors.cross.should.be.a.Function();
		vectors.homogenous.should.be.a.Function();
		vectors.times.should.be.a.Function();
		vectors.normalize.should.be.a.Function();
		vectors.lerp.should.be.a.Function();
		vectors.clamp.should.be.a.Function();
		vectors.cubic.should.be.a.Function();
		vectors.angle.should.be.a.Function();
		vectors.distance.should.be.a.Function();
		vectors.vecToString.should.be.a.Function();
	});
	it("should support cross with 2d or 3d vectors", function() {
		let cross = vectors.cross;
		let a = Float32Array.of(1,2);
		let b = Float32Array.of(2,1);
		let c = Float32Array.of(2,-2,2);
		cross(a, b).should.eql(Float32Array.of(0,0,-3));
		cross(a, c).should.eql(Float32Array.of(4,-2,-6));
		(typeof(cross(a, Float32Array.of(0))) === "undefined").should.be.true();
		(typeof(cross(a, Float32Array.of(1,2,3,4))) === "undefined").should.be.true();
	});
	it("should support homogenization of vectors", function() {
		let homogenous = vectors.homogenous;
		let vec2 = Float32Array.of(7,4);
		let vec3 = Float32Array.of(7,4,5);
		let vec4 = Float32Array.of(7,4,5,-2);
		homogenous(vec2).should.eql(Float32Array.of(7,4,1));
		homogenous(vec3).should.eql(Float32Array.of(7,4,5,1));
		homogenous(vec4).should.eql(Float32Array.of(7,4,5,-2,1));
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
	it("should normalize a vector of any length", function() {
		let normalize = vectors.normalize;
		let vec2 = Float32Array.of(21, 4);
		let vec3 = Float32Array.of(9, 18, 27);
		let vec4 = Float32Array.of(16, 92, 73, 1);
		normalize(vec2).should.be.nearly(Float32Array.of(0.982339, 0.187112), 1.0e-6);
		normalize(vec3).should.be.nearly(Float32Array.of(0.267261, 0.534522, 0.801784), 1.0e-6);
		normalize(vec4).should.be.nearly(Float32Array.of(0.134984, 0.776157, 0.615864, 0.00843649), 1.0e-6);
	});
	it("should perform linear interpolations correctly on like vectors", function() {
		let lerp = vectors.lerp;
		let vec2 = Float32Array.of(2,3);
		let vec3 = Float32Array.of(4,8,16);
		let vec4 = Float32Array.of(9,18,27,1);
		lerp(vec2, Float32Array.of(4,6), 0.5).should.eql(Float32Array.of(3,4.5));
		lerp(vec3, Float32Array.of(2,4,8), 0.5).should.eql(Float32Array.of(3,6,12));
		lerp(vec4, Float32Array.of(0,0,0,0), 0.666666).should.be.nearly(
			Float32Array.of(3,6,9,0.3333), 1.0e-3
		);
		// extrapolation should work too
		lerp(vec2, Float32Array.of(4,6), 0).should.eql(Float32Array.of(2,3));
		lerp(vec2, Float32Array.of(4,6), -1).should.eql(Float32Array.of(0,0));
		lerp(vec2, Float32Array.of(4,6), 1).should.eql(Float32Array.of(4,6));
		lerp(vec2, Float32Array.of(4,6), 2).should.eql(Float32Array.of(6,9));
	});
	it("should perform cubic interpolations correctly on like vectors", function() {
		// can only verify 2d with precalculated values for lack of good source for 3d or 
		// 4d, but "should" work for 3d and 4d vectors too :/
		let cubic = vectors.cubic;
		let vec2 = Float32Array.of(5,6);
		cubic(vec2, Float32Array.of(9,7),Float32Array.of(4,4),Float32Array.of(10,8),0.5).should.eql(Float32Array.of(6.75,5.875));
	});
	it("should find the angle between any two like vectors", function() {
		let angle = vectors.angle;
		angle(Float32Array.of(1,0), Float32Array.of(0,1)).should.eql(90*Math.PI/180);
		angle(Float32Array.of(1,1,0), Float32Array.of(0,0,1)).should.eql(90*Math.PI/180);
		angle(Float32Array.of(1,1,1,0), Float32Array.of(0,0,0,1)).should.eql(90*Math.PI/180);
	});
	it("should find the distance between any two like vectors", function() {
		let distance = vectors.distance;
		distance(Float32Array.of(0,0), Float32Array.of(3,4)).should.eql(5);
		distance(Float32Array.of(0,0,0), Float32Array.of(0,6,8)).should.eql(10);
		distance(Float32Array.of(0,0,0,0), Float32Array.of(0,0,8,15)).should.eql(17);
	});
	it("should clamp vectors", function() {
		let clamp = vectors.clamp;
		clamp(Float32Array.of(-5,10), 1, 10).should.eql(Float32Array.of(1,10));
		clamp(Float32Array.of(-5,10,15), 1, 10).should.eql(Float32Array.of(1,10,10));
		clamp(Float32Array.of(-20,-5,10,15), 1, 10).should.eql(Float32Array.of(1,1,10,10));
	});
	it("should produce a string representation of a vector", function() {
		let toString = vectors.vecToString;
		toString(vectors.vec2([13,1])).should.eql("vec2(13.00, 1.00)");
		toString(vectors.vec3([13,1,22])).should.eql("vec3(13.00, 1.00, 22.00)");
		toString(vectors.vec4([13,1,22,123])).should.eql("vec4(13.00, 1.00, 22.00, 123.00)");
	});
});

describe("a 2d vector", function() {
	it("should create a vector [0,0] when given no arguments", function() {
		let vec = vectors.vec2();
		vec.toArray().should.eql([0,0]);
		vec.rows.should.eql(2);
		vec.cols.should.eql(1);
	});
	it("should create a populated vector when given one argument with length 2", function() {
		let initial = [1,2];
		let vec = vectors.vec2(initial);
		vec.toArray().should.eql(initial);
	});
	it("should create a populated vector when given two arguments", function() {
		let vec = vectors.vec2(3,4);
		vec.toArray().should.eql([3,4]);
	});
	it("should throw an error when given any other number of arguments", function() {
		(function() {vectors.vec2(1, 2, 3)}).should.throwError();
	});
	it("should have all the 2d vector aliases", function() {
		let vec = vectors.vec2([1,2]);
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
	});
	it("should produce a copy of itself when multiplied by an identity matrix", function() {
		let vec = vectors.vec2(7,4);
		let matrix = matrices.create(2,2,[1,0, 0,1]);
		matrix.dot(vec).toArray().should.eql([7,4]);
	});
	it("should be scaled by a scaling matrix", function() {
		let vec = vectors.vec2(7,4);
		let matrix = matrices.create(2,2,[2,0, 0,2]);
		matrix.dot(vec).toArray().should.eql([14,8]);
	});
	it("should be translated by a translation matrix", function() {
		let vec = vectors.vec2(7,4);
		let matrix = matrices.create(3,3,[1,0,-9, 0,1,4, 0,0,1]);
		matrix.dot(vec.homogenous()).toArray().should.eql([-2,8,1]);
	});
});
describe("a 3d vector", function() {
	it("should create a vector [0,0,0] when given no arguments", function() {
		let vec = vectors.vec3();
		vec.toArray().should.eql([0,0,0]);
		vec.rows.should.eql(3);
		vec.cols.should.eql(1);
	});
	it("should create a populated vector when given one argument with length 3", function() {
		let initial = [1,2,3];
		let vec = vectors.vec3(initial);
		vec.toArray().should.eql(initial);
	});
	it("should create a populated vector when given three arguments", function() {
		let vec = vectors.vec3(4,5,6);
		vec.toArray().should.eql([4,5,6]);
	});
	it("should create a 3d vector given a 2d vector-like object and a z value", function() {
		let vec = vectors.vec3([0,1], 1);
		vec.toArray().should.eql([0,1,1]);
		vec = vectors.vec3(vectors.vec2(4,3), 6);
		vec.toArray().should.eql([4,3,6]);
		vec = vectors.vec3(matrices.create(1,2, [0,5]), 3);
		vec.toArray().should.eql([0,5,3]);
	});
	it("should throw an error when given any other number of arguments", function() {
		(function() {vectors.vec2(1, 2, 3, 4)}).should.throwError();
	});
	it("should have all the 3d vector aliases", function() {
		let vec = vectors.vec3([1,2,3]);
		// test a few of them just to make sure the mapping is good
		vec.x.should.equal(1);
		vec.y.should.equal(2);
		vec.z.should.equal(3);
		vec.yz.toArray().should.eql([2,3]);
		vec.xyz.toArray().should.eql([1,2,3]);
		vec.zyx.toArray().should.eql([3,2,1]);
		vec.rgb.toArray().should.eql([1,2,3]);
		vec.rbg.toArray().should.eql([1,3,2]);
		vec.bgr.toArray().should.eql([3,2,1]);
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
	});
	it("should produce a copy of itself when multiplied by an identity matrix", function() {
		let vec = vectors.vec3(7,4,13);
		let matrix = matrices.create(3,3,[1,0,0, 0,1,0, 0,0,1]);
		matrix.dot(vec).toArray().should.eql([7,4,13]);
	});
	it("should be scaled by a scaling matrix", function() {
		let vec = vectors.vec3(7,4,5);
		let matrix = matrices.create(3,3,[2,0,0, 0,2,0, 0,0,2]);
		matrix.dot(vec).toArray().should.eql([14,8,10]);
	});
	it("should be translated by a translation matrix", function() {
		let vec = vectors.vec3(7,4,5);
		let matrix = matrices.create(4,4,[1,0,0,-9, 0,1,0,4, 0,0,1,-6, 0,0,0,1]);
		matrix.dot(vec.homogenous()).toArray().should.eql([-2,8,-1,1]);
	});
});
describe("a 4d vector", function() {
	it("should create a vector [0,0,0,0] when given no arguments", function() {
		let vec = vectors.vec4();
		vec.toArray().should.eql([0,0,0,0]);
		vec.rows.should.eql(4);
		vec.cols.should.eql(1);
	});
	it("should create a populated vector when given one argument with length 4", function() {
		let initial = [1,2,3,4];
		let vec = vectors.vec4(initial);
		vec.toArray().should.eql(initial);
	});
	it("should create a populated vector when given four arguments", function() {
		let vec = vectors.vec4(5,6,7,8);
		vec.toArray().should.eql([5,6,7,8]);
	});
	it("should create a 4d vector from a combination of vector-like objects and remaining components", function() {
		let vec = vectors.vec4([0,1], 1, 3);
		vec.toArray().should.eql([0,1,1,3]);
		vec = vectors.vec4(vectors.vec3(4,3,6),7);
		vec.toArray().should.eql([4,3,6,7]);
		vec = vectors.vec4(vectors.vec2(4,3), [2,2]);
		vec.toArray().should.eql([4,3,2,2]);
		vec = vectors.vec4(matrices.create(1,2, [0,5]), 3, 2);
		vec.toArray().should.eql([0,5,3,2]);
		let vecb = vectors.vec3([9,7,2]);
		vec = vectors.vec4(vecb.x, vecb.y, vecb.yz);
		vec.toArray().should.eql([9,7,7,2]);
	});
	it("should throw an error when given any other number of arguments", function() {
		(function() {vectors.vec2(1, 2, 3, 4, 5)}).should.throwError();
	});
	it("should have all the 4d vector aliases", function() {
		let vec = vectors.vec4([1,2,3,4]);
		vec.x.should.equal(1);
		vec.y.should.equal(2);
		vec.z.should.equal(3);
		// test a few of them just to make sure the mapping is good
		vec.xyzw.toArray().should.eql([1,2,3,4]);
		vec.zyxw.toArray().should.eql([3,2,1,4]);
		vec.rgba.toArray().should.eql([1,2,3,4]);
		vec.rabg.toArray().should.eql([1,4,3,2]);
		vec.abgr.toArray().should.eql([4,3,2,1]);
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
	});
	it("should produce a copy of itself when multiplied by an identity matrix", function() {
		let vec = vectors.vec4(7,4,13,-2);
		let matrix = matrices.create(4,4,[1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
		matrix.dot(vec).toArray().should.eql([7,4,13,-2]);
	});
	it("should be scaled by a scaling matrix", function() {
		let vec = vectors.vec4(7,4,5,-2);
		let matrix = matrices.create(4,4,[2,0,0,0, 0,2,0,0, 0,0,2,0, 0,0,0,2]);
		matrix.dot(vec).toArray().should.eql([14,8,10,-4]);
	});
	it("should be translated by a translation matrix", function() {
		let vec = vectors.vec4(7,4,5,-2);
		let matrix = matrices.create(5,5,[1,0,0,0,-9, 0,1,0,0,4, 0,0,1,0,-6, 0,0,0,1,17, 0,0,0,0,1]);
		matrix.dot(vec.homogenous()).toArray().should.eql([-2,8,-1,15,1]);
	});
});
describe("vector methods", function() {
	it("should return the correct types for vector products", function() {
		let vec2 = vectors.vec2([1,1]);
		let vec3 = vectors.vec3([1,1,1]);
		let vec4 = vectors.vec4([1,1,1,1]);
		let scalar = 2;
		vec3.times(vec3).should.eql(3);
		vec2.times(scalar).should.deepEqual(vectors.vec2([2,2]));
		vec3.times(scalar).should.deepEqual(vectors.vec3([2,2,2]));
		vec4.times(scalar).should.deepEqual(vectors.vec4([2,2,2,2]));
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
		vectors.vec2([13,1]).toString().should.eql("vec2(13.00, 1.00)");
		vectors.vec3([13,1,22]).toString().should.eql("vec3(13.00, 1.00, 22.00)");
		vectors.vec4([13,1,22,123]).toString().should.eql("vec4(13.00, 1.00, 22.00, 123.00)");
	});
});

