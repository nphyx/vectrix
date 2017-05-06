"use strict";
import * as quats from "../src/vectrix.quaternions";
require("./helpers/should.nearly.js");
describe("quaternions", function() {
	it("should create a quaternion when given valid arguments", function() {
		quats.create().toArray().should.eql([0,0,0,1]); // default = identity quaternion
		quats.create(12,4,8,16).toArray().should.eql([12,4,8,16]);
		quats.create([12,1,3],3).toArray().should.eql([12,1,3,3]);
	});
	it("should support x,y,z,w aliases", function() {
		let q = quats.create([12,4,8,16]);
		q.x.should.eql(12);
		q.y.should.eql(4);
		q.z.should.eql(8);
		q.w.should.eql(16);
		// test a couple, basically same code from vectors so "should" work
		q.zw.should.eql([8,16]);
		q.yxw.should.eql([4,12,16]);
		q.wyzx.should.eql([16,4,8,12]);
	});
	it("should return a string representation of itself", function() {
		let q = quats.create([12,4,8,16]);
		q.toString().should.eql("quaternion(12.00, 4.00, 8.00, 16.00)");
	});
	it("should correctly perform spherical linear interpolations (slerp)", function() {
		let a = quats.create([0.3,-0.6,-0.4,0.2]);
		let b = quats.create([0.6,0.8,0.5,0.7]);
		let c = quats.create([1.3,-1.0,1.3,1.0]);
		a.slerp(b, 0.4).toArray().should.be.nearly(
			[0.7455354, 0.0098910, -0.0184220, 0.7221679],
			1.0e-7);
		// test for cosHalfTheta > 1.0 branch
		b.slerp(c, 0.4).toArray().should.eql(b.toArray());
	});
	it("should invert quaternions", function() {
		let q = quats.create(4.0, 10.0, 3.0, 1.0);
		let nrm = q.normalize();
		q.invert().toArray().should.eql([-nrm.x, -nrm.y, -nrm.z, nrm.w]);
		// check a pre-normalized quat
		nrm.invert(false).toArray().should.eql([-nrm.x, -nrm.y, -nrm.z, nrm.w]);
	});
	it("should create an identity quaternion", function() {
		quats.create.identity().toArray().should.eql([0.0, 0.0, 0.0, 1.0]);
	});
	it("should create a quaternion from a set of euler angles", function() {
		quats.create.fromEulerAngles(
			[1.3089969389957472,1.1344640137963142,0.2617993877991494]
		).toArray().should.be.nearly(
			[0.41162504419345125, 0.5646709629264821, 0.3556063499916332, 0.6206896571283002],
			1.0e-7
		);
	});
	it("should create a quaternion from an axis-angle rotation", function() {
		quats.create.fromAxisAngle([1,0,0], 90*Math.PI/180).toArray().should.be.nearly(
			[0.7071068, 0, 0, 0.7071068], 1.0e-7
		);
	});
});
