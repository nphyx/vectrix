Vectrix
=======
A new library for working with matrix and vector math in javascript, frontend and backend.
This is an alpha build, and not yet feature complete.

Usage
=====
Vectrix supports commonjs modules:
```javascript
const matrices = require("vectrix.matrices.js");
const vectors = require("vectrix.vectors.js");
```

Create vectors:
```javascript
let xy = vectors.create.vec2([0,1]); // 2d vector
let xyz = vectors.create.vec3([1,0,1]); // 3d vector
let xyzw = vectors.create.vec4([1,0,0,1]); // 4d vector
```

Create matrices:
```javascript
let xyz = vectors.create.vec3([4,3,11]);
let trans = matrices.create.translation(xyz); // a translation matrix
let rotX = matrices.create.rotateX(3.24); // a rotation matrix
```

Do stuff with them:
```javascript
// add something to xy
xy.plus([7,3]).toArray(); // [7,4]
// check out these aliases, and by the way, add didn't mutate it!
xy.yx; // vec2(1,0);
// find the dot product of two vectors
xy.dot([6,3]); // 3
// do a linear interpolation!
xy.lerp([4,5],0.3); // vec2(1.2000000476837158, 2.200000047683716)
// multiply a vector by a rotation matrix to rotate it
rotX.dot(xyz); // vec3(-3.6859018802642822,-3.3784799575805664,11)
// other stuff
```

[See the wiki for complete documentation](https://github.com/nphyx/vectrix/wiki)

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
You'll need to manually clone in babel-mocha to run tests because the author has removed
it from NPM. I'll work on switching to a different method for test running at some point.
Besides that problem, here's how you run tests:
```bash
npm install --only=dev .
gulp test # test all modules
gulp test:vectors # only test vectors
gulp test:matrices # only test matrices
gulp test:coverage # run a coverage test with istanbul, lcov reports go in /coverage
```

License
-------
MIT
