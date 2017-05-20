"use strict";
import * as quats from "../src/vectrix.quaternions";
import {toArray} from "../src/vectrix.matrices";
require("./helpers/should.nearly.js");

describe("quaternions", function() {
	it("should create a quaternion when given valid arguments", function() {
		toArray(quats.create()).should.eql([0,0,0,1]); // default = identity quaternion
		toArray(quats.create(12,4,8,16)).should.eql([12,4,8,16]);
		toArray(quats.create([12,1,3],3)).should.eql([12,1,3,3]);
		toArray(quats.create(12,1,3,3)).should.eql([12,1,3,3]);
	});
	it("should create quaterions with pre-supplied buffers", function() {
		let buffer, quat;
		buffer = new ArrayBuffer(4*4);
		quat = quats.create(buffer); // with only buffer 
		toArray(quat).should.eql([0,0,0,1]);
		quat.buffer.should.eql(buffer);
		buffer = new ArrayBuffer(4*4+4);
		quat = quats.create([1.1, 2.2, 3.3, 4.4], buffer); // with buffer and values
		toArray(quat).should.be.nearly([1.1, 2.2, 3.3, 4.4], 1e-6);
		quat.buffer.should.eql(buffer);
		buffer = new ArrayBuffer(4*4+4);
		quat = quats.create(buffer, 4); // with buffer and offset 
		quat.buffer.should.eql(buffer);
		quat.buffer.byteLength.should.eql(4*4+4);
		quat.byteLength.should.eql(4*4);
		toArray(quat).should.eql([0,0,0,1]);
		quat = quats.create([2.3, 0.1, 0.3, 12.4], buffer, 4); // with values, buffer and offset 
		quat.buffer.should.eql(buffer);
		quat.buffer.byteLength.should.eql(4*4+4);
		quat.byteLength.should.eql(4*4);
		toArray(quat).should.be.nearly([2.3,0.1,0.3,12.4], 1e-6);
	});
	it("should return a string representation of itself", function() {
		let q = quats.create([12,4,8,16]);
		quats.toString(q).should.eql("quaternion(12.00, 4.00, 8.00, 16.00)");
	});
	it("should correctly perform spherical linear interpolations (slerp)", function() {
		let slerp = quats.slerp, create = quats.create;
		let a = create([0.3,-0.6,-0.4,0.2]);
		let b = create([0.6,0.8,0.5,0.7]);
		let c = create([1.3,-1.0,1.3,1.0]);
		let t = 0.4;
		let out = slerp(a, b, t);
		let expectedab = [0.7455354, 0.0098910, -0.0184220, 0.7221679];
		toArray(out).should.be.nearly(expectedab, 1.0e-7);
		// test for cosHalfTheta > 1.0 branch
		out = slerp(b, c, t);
		toArray(out).should.eql(toArray(b));
		// support for out parameter
		slerp(a, b, t, out).should.be.nearly(expectedab, 1.0e-7);
		slerp(a, b, t, out).should.equal(out);
	});
	it("should normalize a quaternion", function() {
		let create = quats.create, normalize = quats.normalize;
		let quat = create(16, 92, 73, 1);
		let out = create();
		normalize(quat).should.be.nearly(Float32Array.of(0.134984, 0.776157, 0.615864, 0.00843649), 1.0e-6);
		// out parameter support
		normalize(quat, out).should.be.nearly(Float32Array.of(0.134984, 0.776157, 0.615864, 0.00843649), 1.0e-6);
		normalize(quat, out).should.equal(out);
	});
	it("should create an identity quaternion", function() {
		toArray(quats.create.identity()).should.eql([0.0, 0.0, 0.0, 1.0]);
	});
	it("should invert quaternions", function() {
		let create = quats.create, normalize = quats.normalize, invert = quats.invert;
		let q = create(4.0, 10.0, 3.0, 1.0);
		let nrm = normalize(q);
		console.log(quats.toString(nrm));
		let out = create();
		toArray(invert(q)).should.eql([-nrm[0], -nrm[1], -nrm[2], nrm[3]]);
		// check a pre-normalized quat
		toArray(invert(nrm, false)).should.eql([-nrm[0], -nrm[1], -nrm[2], nrm[3]]);
		// with out param
		toArray(invert(q, true, out)).should.eql([-nrm[0], -nrm[1], -nrm[2], nrm[3]]);
		invert(q, true, out).should.equal(out);
		// check pre-normalized + out parameter
		toArray(invert(nrm, false, out)).should.eql([-nrm[0], -nrm[1], -nrm[2], nrm[3]]);
		invert(nrm, false, out).should.equal(out);
	});
	it("should create a quaternion from a set of euler angles", function() {
		let angles = [1.3089969389957472,1.1344640137963142,0.2617993877991494];
		let expected = [0.41162504419345125, 0.5646709629264821, 0.3556063499916332, 0.6206896571283002];
		let buffer = new ArrayBuffer(4*4*4+4);
		let offset = 4;
		let out = quats.create.fromEulerAngles(angles);
		toArray(out).should.be.nearly(expected, 1.0e-7);
		// with buffer
		out = quats.create.fromEulerAngles(angles, buffer);
		toArray(out).should.be.nearly(expected, 1.0e-7);
		out.buffer.should.equal(buffer);
		// with buffer + offset
		out = quats.create.fromEulerAngles(angles, buffer, offset);
		toArray(out).should.be.nearly(expected, 1.0e-7);
		out.buffer.should.equal(buffer);

	});
	it("should create a quaternion from an axis-angle rotation", function() {
		let axis = [1.0, 0.0, 0.0];
		let angle = 90*Math.PI/180;
		let expected = [0.7071068, 0, 0, 0.7071068];
		let buffer = new ArrayBuffer(4*4*4+4);
		let offset = 4;
		let out = quats.create.fromAxisAngle(axis, angle);
		toArray(out).should.be.nearly(expected, 1.0e-7);
		// with buffer
		out = quats.create.fromAxisAngle(axis, angle, buffer);
		toArray(out).should.be.nearly(expected, 1.0e-7);
		out.buffer.should.equal(buffer);
		// with buffer + offset
		out = quats.create.fromAxisAngle(axis, angle, buffer, offset);
		toArray(out).should.be.nearly(expected, 1.0e-7);
		out.buffer.should.equal(buffer);
	});
});
describe("wrapped quaternions", function() {
	it("should support x,y,z,w aliases", function() {
		let q = quats.wrap(quats.create([12,4,8,16]));
		q.x.should.eql(12);
		q.y.should.eql(4);
		q.z.should.eql(8);
		q.w.should.eql(16);
		// test a couple, basically same code from vectors so "should" work
		q.zw.should.eql([8,16]);
		q.yxw.should.eql([4,12,16]);
		q.wyzx.should.eql([16,4,8,12]);
	});
	it("should support quaternion functions as methods", function() {
		let create = quats.create, wrap = quats.wrap;
		let b = create([0.6,0.8,0.5,0.7]);
		let t = 0.4;
		function checkMethods(q) {
			q.toString().should.eql("quaternion(0.30, -0.60, -0.40, 0.20)");	
			q.toArray().should.be.nearly([0.3,-0.6,-0.4,0.2], 1.0e-6);
			q.slerp(b, t).toArray().should.be.nearly([0.7455354, 0.0098910, -0.0184220, 0.7221679], 1.0e-6);
		}
		let q = wrap(create([0.3,-0.6,-0.4,0.2]));
		checkMethods(q);
	});
});
