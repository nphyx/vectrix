Vectrix
=======
A new library for working with matrix and vector math in javascript, frontend and backend.
This is an alpha build, and not yet feature complete. I still have some code to write to
support all the normal vector operations. The basic matrix operations (add, subtract, dot) are in and working. 

Why
---
To date the best matrix math libraries are Toji's gl-matrix and Math.js. They work
perfectly well, but I found myself frustrated with the fact that they didn't do things 
in a functional way. I want matrix math that is composable, expressive, and efficient. I
want support for commonjs modules. Solution? Reinvent the wheel!

Usage
=====

Matrices
--------
Require the module:
```javascript
const matrices = require("vectrix.matrices.js");
```

Create a 2x2 matrix using `create(rows, columns, values)`:
```javascript
let mat = matrices.create(2,2,[0,1,2,3]);
```

Add two matrices using `a.add(b)`:
```javascript
let first = matrices.create(2,2,[1,2,3,4]);
let second = matrices.create(2,2,[3,4,5,6]);
let sum = first.add(second);
```

Subtract two matrices with `a.sub(b)`:
```javascript
let diff = second.sub(first);
```

Get the dot product of two matrices via `a.dot(b)`:
```javascript
let prod = first.dot(second);
```

All matrix and vector methods produce a new object from their operands, creating and
returning a new object as a result.
```javascript
sum.toArray(); // [4,6,8,10]
diff.toArray(); // [2,2,2,2]
product.toArray(); // [13,16,29,26]
first.toArray(); // [1,2,3,4]
second.toArray(); // [3,4,5,6]
```

This means matrix operations are composable in an intuitive left-to-right fashion:
```javascript
first.sub(second).dot(diff).toArray(); // [8,8,8,8]
```

But keep in mind that you must follow matrix operation rules! Operating on two
incompatible matrices returns undefined:
```javascript
let third = matrices.create(1,2,[0,1]);
first.add(third); // undefined
```

Vectors
-------
Note: vectors aren't done yet.

Require the vector module:
```javascript
const vectors = require("vectrix.vectors.js");
const vec2 = vectors.vec2;
const vec3 = vectors.vec3;
const vec4 = vectors.vec4;
```
You can construct them with vec2, vec3, and vec4, passing zero, one or N arguments
where N is the vector size. Do whatever is convenient.
```javascript
let first = vec2(); // passing no arguments will give you a vector filled with zeroes
first.toArray(); // [0,0]
let second = vec2([3,7]); // you can pass an array-like object
second.toArray(); // [3,7] 
let third = vec2(17,4); // or just pass the components as arguments
third.toArray(); // [14,4] 
let fourth = vec3(1,2,3); // and so on with 3d and 4d vectors
fourth.toArray(); // [1,2,3]
```

Vectors are composed from columnar matrices, so they can do the things that matrices
do. I'm working on fixing special cases like vector dot products (should do a row-wise by
column-wise multiplication, otherwise they're incompatible), hang in there. 
```javascript
second.add(second).toArray(); // [6,14]
third.sub(second).toArray(); // [11,-3]

const matrices = require("vectrix.matrices.js");
let identity = matrices.create(2,2,[1,0, 0,1]);
identity.dot(second).toArray(); // [3,7]
let scale2x = matrixes.create(2,2,[2,0, 0,2]);
scale2x.dot(third).toArray(); // [34,8]
```

They also have some of their own useful properties.

You can produce a homogenous coordinate for matrix multiplication using `vec.homogenous()`:
```javascript
first.homogenous().toArray(); // [0,0,1]
```

Which lets you do a few useful matrix-vector ops more easily:
```javascript
const matrices = require("vectrix.matrices.js");
const vectors = require("vectrix.vectors.js");
let myVec = vectors.vec2([22,9]); 
let translate = matrices.create(3,3,[1,0,5, 0,1,6, 0,0,1]);
translate.dot(myVec.homogenous()).toArray(); // [27,15,1]
```
Making this more intuitive is on the roadmap.

Last but not least, they have a whole bunch of virtual properties that you might
be used to in GLSL. Once I used them I couldn't live without.
```javascript
let position = vectors.vec3([0,-0.5,0.5]);
position.x; // 0
position.y; // -0.5
position.z; // 0.5
position.xy; // vec2(0,-0.5)
position.zx; // vec2(0.5,0)
position.yzx; // vec3(-0.5,0.5,0)
let color = vectors.vec4(255,128,64,0.1)
color.rgb; // vec3(255,128,64)
color.bgr; // vec3(64,128,255)
// and so on - all aliases and combinations thereof for the xyzw and rgba sets
// are available. single-property aliases double as setters, but combination aliases
// only act as getters. I haven't decided whether allowing them to set values is
// a good idea yet.
```

Notes & Development
===================

Performance
-----------
I have not yet performance tuned these, but they're sanely written and should be fast
enough for typical usage. Some overhead is always created by using Babel to polyfill
ES6 functionality, which I use pretty extensively here. That should solve itself over
time, but if there are any serious performance hitches please report them as bugs with
a test case and I'll see what I can do about it.

Install
-------
```bash
npm install --only=production
```

Build
-----
I use some ES6 in here, so you'll need to build distributable files. There is not yet a built-in way to do that, so use babelify or whatever you prefer.

Testing
-------
You'll need to manually clone in babel-mocha to run tests because the author has removed
it from NPM. I'll work on switching to a different method for test running at some point.
Besides that problem, here's how you run tests:
```bash
npm install --only=dev .
gulp test
gulp test:coverage
```

License
-------
MIT
