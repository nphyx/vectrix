Vectrix 0.2.0
=============
Vectrix is a matrix math library for javascript aimed at allowing the developer
to make conscious tradeoffs between performance, flexibility, and expressiveness. 
Compared to alternatives, it is:

* more expressive and generalized than gl-matrix, but around 1.25 to 10x slower depending on operation and usage
* less general and less powerful than Math.js but easier to use and up to 30x faster

Vectrix is still a work in progress and is not recommended for production.

Usage
=====
Vectrix supports commonjs modules:
```javascript
const matrices = require("dist/vectrix.js").matrices;
const vectors = require("dist/vectrix.js").vectors;
const quaternions = require("dist/vectrix.js").quaternions;
```

It also supports ES6 modules, via the babel preprocessor
```javascript
import {matrices, vectors, quaternions} from "src/vectrix";
```

Create vectors:
```javascript
let xy = vectors.create.vec2(0,1); // 2d vector
let xyz = vectors.create.vec3(1,0,1); // 3d vector
let xyzw = vectors.create.vec4(1,0,0,1); // 4d vector
```

Create matrices:
```javascript
let xyz = vectors.create.vec3(4,3,11);
let trans = matrices.create.translation(xyz); // a translation matrix
let rotX = matrices.create.rotateX(3.24); // a rotation matrix (angle in radians)
```

Create quaternions:
```javascript
let q = quaternions.create.identity(); // quaternion(1.0,1.0,1.0,0.0);
```

Vectrix uses a functional style:
```javascript
// add something to xy
vectors.plus(xy, [7,3]); // vec2(7,4)
// find the dot product of two vectors
vectors.dot(xy, [6,3]); // 3
// do a linear interpolation
vectors.lerp(xy, [4,5], 0.3); // vec2(1.2000000476837158, 2.200000047683716)
// multiply a vector by a rotation matrix to rotate it
vectors.dot(rotX, xyz); // vec3(-3.6859018802642822,-3.3784799575805664,11)
```

It doesn't mutate its operands:
```javascript
vectors.plus(xy, [7,3]); // vec2(7,4)
xy; // vec2(0,1)
```

... except when you ask it to:
```javascript
vectors.mut_plus(xy, [7,3]);
xy; // vec2(7,4)
```

... and it supports optional out parameters if you need to save on memory and garbage collection:
```javascript
let out = vectors.create.vec2();
vectors.plus(xy, [7,3], out); // vec2(7,4)
out; // vec2(7,4)
vectors.plus(xy, [7,3], out) === out; // true
```

In fact, if you use out parameters wherever they're supported vectrix will almost _never_ allocate memory, because it pre-allocates everything it needs during library initialization (and don't worry, it's a really small footprint).

Vectors, matrices, and quaternions can be wrapped as objects for more expressive usage,
at the cost of performance:
```javascript
// alternatively,
xy = vectors.wrap(xy);
xy.plus([7,3]).toArray(); // [7,4]
// wrapped objects also support GLSL-style aliases: 
xy.yx; // vec2(1,0);
```

When performance really matters, use the functional style with out parameters. When you need it to be easier to reason about and manipulate, the object oriented wrappers are helpful.

[See the wiki for complete documentation](https://github.com/nphyx/vectrix/wiki)*

_*currently out of date, sorry_

Install
-------
```bash
npm install --only=production
```

Build
-----
```bash
gulp
```

Testing
-------
```bash
npm install --only=dev .
gulp test # test all modules
gulp test:vectors # only test vectors
gulp test:matrices # only test matrices
gulp test:quaterions # only test quaternions 
gulp test:coverage # run a coverage test with istanbul, lcov reports go in /coverage
```

License
-------
MIT
