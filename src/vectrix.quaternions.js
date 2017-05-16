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
 * Performs a spherical linear interpolation between a and b.
 * @example
 * let q1 = quaternions.create([0.3,-0.6,-0.4,0.2]);
 * let q2 = quaternions.create([0.6,0.8,0.5,0.7]);
 * slerp(q1, q2, 0.4); // quaternion(0.75, 0.01, -0.02, 0.72);
 * @param {quaternion|array(4)} origin quaternion
 * @param {quaternion|array(4)} destination quaternion
 * @param {float} t interval [0...1]
 * @return {quaternion}
 */ 
function slerp(a, b, t) {
	let ax = a[0], bx = b[0], ay = a[1], by = b[1], 
	    az = a[2], bz = b[2], aw = a[3], bw = b[3];
	let cosHalfTheta = ax * bx + ay * by + az * bz + aw * bw;
	if (Math.abs(cosHalfTheta) >= 1.0) {
		return create([ax, ay, az, aw]);
	}
	let halfTheta = Math.acos(cosHalfTheta);
	let sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);
	let ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
	let ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

	return create([
		(ax * ratioA + bx * ratioB),
		(ay * ratioA + by * ratioB),
		(az * ratioA + bz * ratioB),
		(aw * ratioA + bw * ratioB)
	]);
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
 * @param {bool} normalize (default true)
 * @return {quaternion}
 */
function invert(a, normalize = true) {
	if(normalize) a = a.normalize();
	return create([-a[0], -a[1], -a[2], a[3]]);
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
 * Normalize a quaternion.
 * @example
 * // functional style
 * quaternions.normalize([4.0, 10.0, 3.0, 1.0]).toString(); // quaternion(0.36, 0.89, 0.27, 0.09);
 * // OO style
 * quaternions.create([4.0, 10.0, 3.0, 1.0]).normalize(); // quaternion(0.36, 0.89, 0.27, 0.09);
 * @param {quaternion|array(4)} a quaternion to normalize
 * @return {quaternion}
 */
function normalize(a) {
	return create(vecNrm(a));
}

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
 * quaternions.create.identity(); // quaternion(0.00, 0.00, 0.00, 0.01)
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
 * @return {quaternion}
 */
create.fromEulerAngles = function(a) {
	let yaw = a[0], pitch = a[1], roll = a[2],
	    c1 = Math.cos(yaw/2),
	    s1 = Math.sin(yaw/2),
	    c2 = Math.cos(pitch/2),
	    s2 = Math.sin(pitch/2),
	    c3 = Math.cos(roll/2),
	    s3 = Math.sin(roll/2),
	    c1c2 = c1*c2,
	    s1s2 = s1*s2,
	    x = c1c2*s3 + s1s2*c3,
	    y = s1*c2*c3 + c1*s2*s3,
	    z = c1*s2*c3 - s1*c2*s3,
	    w = c1c2*c3 - s1s2*s3;
	return create([x,y,z,w]);
}

/**
 * Creates a quaternion from an axis-angle rotation.
 * @param {array(3)} axis of rotation
 * @param {float} angle of rotation as radian
 * @example
 * quaternions.create.fromAxisAngle([1,0,0],90*Math.PI/180); // quaternion(0.70, 0.00, 0.00, 0.70)
 * @return {quaternion}
 */
create.fromAxisAngle = function(axis, angle) {
	let a = vectors.normalize(axis);
	return create([
			a[0] * Math.sin(angle/2),
	    a[1] * Math.sin(angle/2),
	    a[2] * Math.sin(angle/2),
	    Math.cos(angle/2)
	]);
}
