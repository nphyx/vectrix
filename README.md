Vectrix
=======
A new library for working with matrix and vector math in javascript, frontend and backend.
This is an alpha build, and not yet feature complete. I still have some code to write to
support all the normal vector operations. The basic matrix operations (add, subtract, dot) are in and working, as are vector add, sub, dot, and cross. 

Why
---
To date the best matrix math libraries are Toji's gl-matrix and Math.js. They work
perfectly well, but I found myself frustrated with the fact that they didn't do things 
in a functional way. I want matrix math that is composable, expressive, and efficient. I
want support for commonjs modules. Solution? Reinvent the wheel!

Mutability
----------
The internal array representation is a Float32Array. They are currently mutable, but 
probably won't stay that way when I can figure out a good way to make them static. Treat 
them as if they are immutable when using the library.

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
let mat = matrices.create(2,2,[0,1, 2,3]);
```

Add two matrices using `a.add(b)`:
```javascript
let first =  matrices.create(2,2,[1,2, 3,4]);
let second = matrices.create(2,2,[3,4, 5,6]);
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

Dot can also multiply a matrix by a scalar:
```javascript
let scalarProd = first.dot(3);
```

All matrix and vector methods produce a new object from their operands, creating and
returning a new object as a result.
```javascript
sum.toArray(); // [4,6,8,10]
diff.toArray(); // [2,2,2,2]
product.toArray(); // [13,16,29,26]
first.toArray(); // [1,2,3,4]
second.toArray(); // [3,4,5,6]
scalarProd; // [3,6,9,12]
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

It turned out to be useful to get a single row or column from a matrix, so you can
do that too using `mat.row(N)` and `mat.col(N)`:
```javascript
first.row(0); // matrix(2,1,[1,2])
first.col(1); // matrix(1,2,[2,4])
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
do. 
```javascript
second.add(second).toArray(); // [6,14]
third.sub(second).toArray(); // [11,-3]

const matrices = require("vectrix.matrices.js");
let identity = matrices.create(2,2,[1,0, 0,1]);
identity.dot(second).toArray(); // [3,7]
let scale2x = matrixes.create(2,2,[2,0, 0,2]);
scale2x.dot(third).toArray(); // [34,8]
```

Vector dot products are a special case. As in vector math, multplying two vectors
produces a scalar:
```javascript
let first = vec2(2,2);
let second = vec2([2,2]);
first.dot(second); // 8
let third = vec2(1,0);
let fourth = vec2(0,1);
third.dot(fourth); // 0
```

They also have some of their own useful properties.

You can find the cross product of two 3d vectors using `vec.cross()`:
```javascript
let first = vec3(1,2,1);
let second = vec3(2,-2,2);
first.cross(second).toArray(); // [6,0,-6]
```
Cross can be called on 2d vectors, with z implicitly being zero:
```javascript
let first = vec2(2,4);
let second = vec2(1,3);
first.cross(second).toArray(); // [0,0,2]
```

If you cross a vec2 with a vec3 for whatever reason, vec2.z is implicitly zero:
```javascript
let first = vec3(1,2,1);
let second = vec2(1,3);
first.cross(second).toArray(); // [-3,1,1]
```

Most vector operations are duck typed and make few assumptions internally, so you 
can just pass in anything array-like of the correct length if you want:
```javascript
let first = vec3(1,2,1);
first.cross([2,-2,2]).toArray(); // [6,0,-6]
```
Just beware weird behavior might result if it looks like a duck and quacks like a duck
but it's actually a trick-or-treating platypus.

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
```
...and so on - all aliases and combinations thereof for the xyzw and rgba sets
are available. vec2s only support x/y because r/g is not useful.

Notes & Development
===================

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

Coverage
--------
All statements, functions and lines have 100% coverage. Branch coverage shoots for >90%
due to a couple unreachable else conditions. No fancy badges for now.

Requests & Contributions
------------------------
I'm relatively new to matrix math and libraries for doing it. As such I don't know
exactly what is and isn't useful or expected. I'm happy to accept feature requests,
bug reports, and better yet pull requests for new features or fixes. The only thing
I ask is that pull requets are unit tested with good coverage (for which mocha and
istanbul are included in the dev dependencies and gulp file).

Roadmap
-------
I'll be continuing work on this for the forseeable future, adding features as I need
them for other projects (mostly concerning WebGL). I do have a few things slated for
the immediate future including some predefined matrices that I've already written and
only need to port (mat2, mat3, mat4, identity, vector projection, vector rotation), and
finishing up basic vector ops (dot, cross, etc, casting vectors to other vector types).

I also need to provide methods for matrix row operations and for producing column-major
rows for pushing to GLSL uniforms. Those will probably happen pretty soon.

The one thing I don't plan to solve any time soon is matrix inversion, because I need
to understand it better, select an appropriate algorith, and figure out how to implement
it in javascript. If you know how to do it and would like to contribute a reasonably
fast solution, please do!

Performance
-----------
I have not yet performance tuned these, but they're sanely written and should be fast
enough for typical usage. Some overhead is always created by using Babel to polyfill
ES6 functionality, which I use pretty extensively here. That should solve itself over
time, but if there are any serious performance hitches please report them as bugs with
a test case and I'll see what I can do about it.

SIMD
----
Will make more sense when it's supported natively. I don't want this library to have
any dependencies for normal use (not counting build tools). It already uses Float32Arrays
internally, so turning those into SIMD and making things officially immutable won't be
a huge step.


License
-------
MIT
