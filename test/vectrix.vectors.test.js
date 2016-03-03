"use strict";
require("should");
const vectors = require("../src/vectrix.vectors.js");
const matrices = require("../src/vectrix.matrices.js");
require("./helpers/should.nearly.js");

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
	it("should compute a cross product with (only) a 2d or 3d vector", function() {
		let a = vectors.vec2(1,2);
		let b = vectors.vec2(2,1);
		let c = vectors.vec3(2,-2,2);
		a.cross(b).toArray().should.eql([0,0,-3]);
		a.cross(c).toArray().should.eql([4,-2,-6]);
		(typeof(a.cross([0])) === "undefined").should.be.true();
		(typeof(a.cross([1,2,3,4])) === "undefined").should.be.true();
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
	it("should produce a correct homogenous coordinate", function() {
		let vec = vectors.vec2(7,4);
		vec.homogenous().toArray().should.eql([7,4,1]);
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
	it("should compute a cross product with (only) a 2d or 3d vector", function() {
		let a = vectors.vec3(1,2,1);
		let b = vectors.vec3(2,-2,2);
		let c = vectors.vec2(1,2);
		a.cross(b).toArray().should.eql([6,0,-6]);
		a.cross(c).toArray().should.eql([-2,1,0]);
		(typeof(a.cross([0])) === "undefined").should.be.true();
		(typeof(a.cross([1,2,3,4])) === "undefined").should.be.true();
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
	it("should produce a correct homogenous coordinate", function() {
		let vec = vectors.vec3(7,4,5);
		vec.homogenous().toArray().should.eql([7,4,5,1]);
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
		let vec = vectors.vec4(7,4,13,-6);
		let matrix = matrices.create(4,4,[1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
		matrix.dot(vec).toArray().should.eql([7,4,13,-6]);
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
	it("should produce a correct homogenous coordinate", function() {
		let vec = vectors.vec4(7,4,5,-2);
		vec.homogenous().toArray().should.eql([7,4,5,-2,1]);
	});
	it("should be translated by a translation matrix", function() {
		let vec = vectors.vec4(7,4,5,-2);
		let matrix = matrices.create(5,5,[1,0,0,0,-9, 0,1,0,0,4, 0,0,1,0,-6, 0,0,0,1,17, 0,0,0,0,1]);
		matrix.dot(vec.homogenous()).toArray().should.eql([-2,8,-1,15,1]);
	});
});
describe("any vector", function() {
	it("should produce correct products for scalars, arrays, vectors, and matrices", function() {
		let vec = vectors.vec3([1,1,1]);
		let scalar = 2;
		let matrix = matrices.create(3,3,[2,0,0, 0,2,0, 0,0,2]);
		let arr = [1,1,1];
		let typed = new Float32Array(3);
		typed.set([1,1,1]);
		let right = vectors.vec3([0,0,1]);
		let left = vectors.vec3([0,0,0]);
		let twodee = vectors.vec2([2,1]);
		let fourdee = vectors.vec4([2,1,1,1]);
		vec.times(vec).should.eql(3, "should produce a correct scalar product when two vectors are multiplied");
		vec.times(arr).should.eql(3, "should accept a plain array instead of a vector and produce a vector product");
		vec.times(typed).should.eql(3, "should accept a typed array instead of a vector and produce a vector product");
		right.times(left).should.eql(0, "prove the product is zero when vectors at right angles are multiplied");
		twodee.times(twodee).should.eql(5, "should work on two-dimensional vectors");
		fourdee.times(fourdee).should.eql(7, "should work on a four-dimensional vector");
		vec.times(scalar).toArray().should.eql([2,2,2], "should produce a scaled vector when a vector is multiplied by a scalar");
		matrix.dot(vec).toArray().should.eql([2,2,2], "should return a vector multiplied by a matrix");
	});
	it("should normalize a vector of any length", function() {
		let vec2 = vectors.vec2([21, 4]);
		let vec3 = vectors.vec3([9, 18, 27]);
		let vec4 = vectors.vec4([16, 92, 73, 1]);
		vec2.normalize().should.be.nearly([0.982339, 0.187112], 1.0e-6);
		vec3.normalize().should.be.nearly([0.267261, 0.534522, 0.801784], 1.0e-6);
		vec4.normalize().should.be.nearly([0.134984, 0.776157, 0.615864, 0.00843649], 1.0e-6);
	});
	it("should perform linear interpolations correctly on like vectors", function() {
		let vec2 = vectors.vec2([2,3]);
		let vec3 = vectors.vec3([4,8,16]);
		let vec4 = vectors.vec4([9,18,27,1]);
		vec2.lerp([4,6], 0.5).toArray().should.eql([3,4.5]);
		vec3.lerp([2,4,8], 0.5).toArray().should.eql([3,6,12]);
		vec4.lerp([0,0,0,0], 0.666666).toArray().should.be.nearly([3,6,9,0.3333], 1.0e-3);
		// extrapolation should work too
		vec2.lerp([4,6], 0).toArray().should.eql([2,3]);
		vec2.lerp([4,6], -1).toArray().should.eql([0,0]);
		vec2.lerp([4,6], 1).toArray().should.eql([4,6]);
		vec2.lerp([4,6], 2).toArray().should.eql([6,9]);
	});
	it("should perform cubic interpolations correctly on like vectors", function() {
		// can only verify 2d with precalculated values for lack of good source for 3d or 
		// 4d, but "should" work for 3d and 4d vectors too :/
		let vec2 = vectors.vec2([5,6]);
		vec2.cubic([9,7],[4,4],[10,8],0.5).toArray().should.eql([6.75,5.875]);
	});
	it("should find the angle between any two like vectors", function() {
		vectors.vec2([1,0]).angle([0,1]).should.eql(90*Math.PI/180);
		vectors.vec3([1,1,0]).angle([0,0,1]).should.eql(90*Math.PI/180);
		vectors.vec4([1,1,1,0]).angle([0,0,0,1]).should.eql(90*Math.PI/180);
	});
	it("should find the distance between any two like vectors", function() {
		vectors.vec2([0,0]).distance([3,4]).should.eql(5);
		vectors.vec3([0,0,0]).distance([0,6,8]).should.eql(10);
		vectors.vec4([0,0,0,0]).distance([0,0,8,15]).should.eql(17);
	});
	it("should produce a string representation of itself", function() {
		vectors.vec2([13,1]).toString().should.eql("vec2(13.00, 1.00)");
		vectors.vec3([13,1,22]).toString().should.eql("vec3(13.00, 1.00, 22.00)");
		vectors.vec4([13,1,22,123]).toString().should.eql("vec4(13.00, 1.00, 22.00, 123.00)");
	});
});
