"use strict";
/**
The quaternions module focuses on quaternion operations that are useful for performing 3-dimensional rotations. Quaternions inherit from [[vectrix.vectors#vec4|4d-vectors]], which in turn inherit from [[vectrix.matrices|matrices]], so most of the operations supported by vec4 and generic matrices are supported by quats (TODO: remove the ones that don't make sense for quaternions)

Note that in the examples quaternions outputs are displayed as they would be by quaternion.toString(), which rounds to the nearest 2 decimal points for brevity. Actual values will be accurate to at least 1.0e-7 (the minimum accuracy required by the unit tests).

Vectrix quaternions store their scalar component in the last place, so all quaternion functions that accept an array as a parameter expect it as [x,y,z,w] rather than [w,x,y,z]. This for consistency with the vectors module.

```javascript
const quaternions = require("vectrix.quaternions");
let q = quaternion.create([0.4, 1.0, 2.1, 1.0]); // quaternion(0.40, 1.00, 2.10, 1.0);
```
Quaternion values are aliased to x, y, z, and w, and can be accessed in any combination
as with GLSL:
```javascript
q.xy; // [0.4, 1.0]
q.zyx; // [2.1, 1.0, 0.4]
q.zw; // [2.1, 1.0]
// etc
```
@module vectrix/quaternions
*/

import * as vectors from "./vectrix.vectors";
const vecNrm = vectors.normalize;
const {abs, sin, cos, acos, sqrt} = Math;

/**
 * @private
 */
let aliasCombos = [];
	
["xyzw", "xyz", "xzw", "xyw", "yzw", "xy", "xw", "xz", "yz", "yw", "zw"].forEach((props) => {
	permutations(props.split("")).forEach((combo) => {
		aliasCombos.push(combo);
	});
});

/**
 * Util function to help generate permutations of property alias sets
 * @private
 */
function permutations(list) {
	// Empty list has one permutation
	if (list.length === 0) return [[]];
	var result = [];
	for (var i=0; i<list.length; i++) {
		var copy = list.slice();
		var head = copy.splice(i, 1);
		var rest = permutations(copy);
		for (var j=0; j<rest.length; j++) {
			var next = head.concat(rest[j]);
			result.push(next);
		}
	}
	return result;
}
/**
 * @private
 */
function getAliasCombo(combo) {
	return combo.map((p) => this[p]);
}

/**
 * Adds x,y,z,w aliases to a quaternion.
 * @private
 */
function defineAliases(q) {
	Object.defineProperties(q, {
		x:{get:function() {return this[0]}},
		y:{get:function() {return this[1]}},
		z:{get:function() {return this[2]}},
		w:{get:function() {return this[3]}}
	});
	for(let i = 0, len = aliasCombos.length; i < len; ++i) {
		Object.defineProperty(q, aliasCombos[i].join(""), {
			get:getAliasCombo.bind(q, aliasCombos[i])
		});
	}
}

/**
 * Create a string representation of a quaternion.
 * @example
 * // functional style
 * quaternions.quatToString(quaternions.create()); // quaternion(0.00, 0.00, 0.00, 1.00)
 * // OO style
 * quaternions.create().toString(); // quaternion(0.00, 0.00, 0.00, 1.00)
 * @param {quaternion} a quaternion to stringify
 * @return {string}
 */
export function quatToString(a) {
	let strings = a.toArray().map((cur) => cur.toFixed(2));
	return "quaternion("+strings.join(", ")+")";
}

/**
 * Performs a spherical linear interpolation between a and b.
 * @example
 * let q1 = quaternions.create([0.3,-0.6,-0.4,0.2]);
 * let q2 = quaternions.create([0.6,0.8,0.5,0.7]);
 * slerp(q1, q2, 0.4); // quaternion(0.75, 0.01, -0.02, 0.72);
 * @param {quaternion|array(4)} a origin quaternion
 * @param {quaternion|array(4)} b destination quaternion
 * @param {float} t interval [0...1]
 * @return {quaternion}
 */ 
export const slerp = (function() {
	let ax = 0.0, bx = 0.0, ay = 0.0, by = 0.0,
		  az = 0.0, bz = 0.0, aw = 0.0, bw = 0.0,
			cosHalfTheta = 0.0, sinHalfTheta = 0.0,
			halfTheta = 0.0,
			ratioA = 0.0, ratioB = 0.0;
	return function slerp(a, b, t, out = undefined) {
		ax = a[0];
		bx = b[0];
		ay = a[1];
		by = b[1];
		az = a[2];
		bz = b[2];
		aw = a[3];
		bw = b[3];
		cosHalfTheta = ax * bx + ay * by + az * bz + aw * bw;
		out = out||create();
		if (abs(cosHalfTheta) >= 1.0) {
			out[0] = ax;
			out[1] = ay;
			out[2] = az;
			out[3] = aw;
			return out;
		}
		halfTheta = acos(cosHalfTheta);
		sinHalfTheta = sqrt(1.0 - cosHalfTheta * cosHalfTheta);
		ratioA = sin((1 - t) * halfTheta) / sinHalfTheta;
		ratioB = sin(t * halfTheta) / sinHalfTheta;

		out[0] = ax * ratioA + bx * ratioB;
		out[1] = ay * ratioA + by * ratioB;
		out[2] = az * ratioA + bz * ratioB;
		out[3] = aw * ratioA + bw * ratioB;
		return out;
	}
})();

/**
 * Normalize a quaternion.
 * @example
 * // functional style
 * quaternions.normalize([4.0, 10.0, 3.0, 1.0]).toString(); // quaternion(0.36, 0.89, 0.27, 0.09);
 * // OO style
 * quaternions.create([4.0, 10.0, 3.0, 1.0]).normalize(); // quaternion(0.36, 0.89, 0.27, 0.09);
 * @param {quaternion|array(4)} a quaternion to normalize
 * @param {quaternion} out (optional) out parameter
 * @return {quaternion}
 */
export function normalize(a, out = undefined) {
	// this function only exists to override the out parameter, so pass down
	// to the vector version of normalize afterward
	out = out||create();
	let out2 = vecNrm(a, out);
	return out2;
}

/**
 * Finds the inverse of a quaternion by normalizing then inverting the quat. Normalization
 * can be skipped by setting normalize = false if the quat is known to be normal already.
 * Be careful, since floating point errors will often de-normalize your quats!
 * @example
 * // functional
 * quaternions.invert([4.0,7.0,5.0,1.0]); // quaternion(-0.36, -0.89, -0.27, 0.09)
 * // OO
 * quaternions.create([4.0,7.0,5.0,1.0]).invert(); // quaternion(-0.36, -0.89, -0.27, 0.09)
 * @param {quaternion|array(4)} a the input quaternion
 * @param {quaternion} (optional) out out parameter
 * @param {bool} norm (default true) whether to normalize the quaternion before inverting
 * @return {quaternion}
 */
export const invert = (function() {
	return function invert(a, norm = true, out = undefined) {
		out = out||create();
		if(norm) normalize(a, out);
		else out.set(a);
		out[0] = -out[0];
		out[1] = -out[1];
		out[2] = -out[2];
		return out;
	}
})();

/**
 * Factory for creating quaternions. Quaternions are represented as 4 member arrays
 * of (x,y,z,w) where x,y,z are the vector component and w is the scalar component.
 * @example
 * quaternions.create([0.4, 32.1, 9.0, 1.0]); // quaternion(0.40, 32.10, 9.00, 1.00)
 * @param {array(4)} vals [x,y,z,w] (default [0,0,0,1] = identity quaternion)
 * @param {ArrayBuffer} buffer (optional) an array buffer to create the vector on 
 * @param {offset} offset (optional) offset for the buffer, ignored if buffer is not supplied 

 * @return {quaternion}
 */
export function create() {
	let identity = [0,0,0,1];
	let params = Array.prototype.slice.apply(arguments), len = params.length;
	if(len === 0) { // just create an identity quaternion 
		params = identity;
	}
	else {
		if(params[len-1] instanceof ArrayBuffer) { // supplied buffer, no offset
			if(len === 1) params = identity.concat(params).concat([0]);
			else params = params.concat([0]);
		}
		else if(params[len-2] instanceof ArrayBuffer) { // supplied buffer + offset
			if(len === 2) params = identity.concat(params);
		}
	}
	let q = vectors.create.apply(null, [4].concat(params));
	defineAliases(q);
	q.slerp = slerp.bind(null, q);
	q.normalize = normalize.bind(null, q);
	q.invert = invert.bind(null, q);
	q.toString = quatToString.bind(null, q);
	return q;
}

/**
 * Creates an identity quaternion [0,0,0,1].
 * @example 
 * quaternions.create.identity(); // quaternion(0.00, 0.00, 0.00, 1.00)
 * @param {ArrayBuffer} buffer (optional) an array buffer to create the vector on 
 * @param {offset} offset (optional) offset for the buffer, ignored if buffer is not supplied 
 * @return {quaternion}
 */
create.identity = function() {
	return create();
}

/**
 * Creates a quaternion from Euler angles (in radians).
 * @example
 * quaternions.create.fromEulerAngles([75*Math.PI/180, 65*Math.PI/180, 15*Math.PI/180]); // quaternion(0.412, 0.56, 0.36, 0.62)
 * @param {array(3)} a [yaw,pitch,roll] in radians 
 * @param {ArrayBuffer} buffer (optional) an array buffer to create the vector on 
 * @param {offset} offset (optional) offset for the buffer, ignored if buffer is not supplied 
 * @return {quaternion}
 */
create.fromEulerAngles = (function() {
	let yawh = 0.0, pitchh = 0.0, rollh = 0.0, c1 = 0.0, s1 = 0.0,
		c2 = 0.0, s2 = 0.0, c3 = 0.0, s3 = 0.0, c1c2 = 0.0, s1s2 = 0.0;
	return function(a, buffer = undefined, offset = undefined) {
		let out = create(buffer, offset);
		yawh = a[0]/2;
		pitchh = a[1]/2;
		rollh = a[2]/2;
		c1 = cos(yawh);
		s1 = sin(yawh);
		c2 = cos(pitchh);
		s2 = sin(pitchh);
		c3 = cos(rollh);
		s3 = sin(rollh);
		c1c2 = c1*c2;
		s1s2 = s1*s2;
		out[0] = c1c2*s3 + s1s2*c3;
		out[1] = s1*c2*c3 + c1*s2*s3;
		out[2] = c1*s2*c3 - s1*c2*s3;
		out[3] = c1c2*c3 - s1s2*s3;
		return out;
	}
})();

/**
 * Creates a quaternion from an axis-angle rotation.
 * @example
 * quaternions.create.fromAxisAngle([1,0,0],90*Math.PI/180); // quaternion(0.70, 0.00, 0.00, 0.70)
 * @param {array(3)} axis of rotation
 * @param {float} angle of rotation as radian
 * @param {ArrayBuffer} buffer (optional) an array buffer to create the vector on 
 * @param {offset} offset (optional) offset for the buffer, ignored if buffer is not supplied 
 * @return {quaternion}
 */
create.fromAxisAngle = (function() {
	let a = 0.0, angleh = 0.0;
	return function fromAxisAngle(axis, angle, buffer = undefined, offset = undefined) {
		let out = create(buffer, offset);
		a = vecNrm(axis);
		angleh = angle/2;
		out[0] = a[0] * sin(angleh);
		out[1] = a[1] * sin(angleh);
		out[2] = a[2] * sin(angleh);
		out[3] = cos(angleh);
		return out;
	}
})();
