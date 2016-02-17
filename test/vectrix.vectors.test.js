"use strict";
require("should");
const vectors = require("../src/vectrix.vectors.js");
const matrices = require("../src/vectrix.matrices.js");
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
	it("should created a populated vector when given two arguments", function() {
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
		vec.x = 3;
		vec.y = 4;
		vec.xy.toArray().should.eql([3,4]);
		vec.yx.toArray().should.eql([4,3]);
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
	it("should created a populated vector when given three arguments", function() {
		let vec = vectors.vec3(4,5,6);
		vec.toArray().should.eql([4,5,6]);
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
	it("should created a populated vector when given four arguments", function() {
		let vec = vectors.vec4(5,6,7,8);
		vec.toArray().should.eql([5,6,7,8]);
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
	it("should produce correct dot products for scalars, arrays, vectors, and matrices", function() {
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
		vec.dot(vec).should.eql(3, "should produce a correct scalar product when two vectors are multiplied");
		vec.dot(arr).should.eql(3, "should accept a plain array instead of a vector and produce a vector dot product");
		vec.dot(typed).should.eql(3, "should accept a typed array instead of a vector and produce a vector dot product");
		right.dot(left).should.eql(0, "prove the product is zero when vectors at right angles are multiplied");
		twodee.dot(twodee).should.eql(5, "should work on two-dimensional vectors");
		fourdee.dot(fourdee).should.eql(7, "should work on a four-dimensional vector");
		vec.dot(scalar).toArray().should.eql([2,2,2], "should produce a scaled vector when a vector is multiplied by a scalar");
		matrix.dot(vec).toArray().should.eql([2,2,2], "should return a vector multiplied by a matrix");
	});
});
