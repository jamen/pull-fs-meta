# pull-fs-meta [![NPM version](https://badge.fury.io/js/pull-fs-meta.svg)](https://npmjs.org/package/pull-fs-meta) [![Build Status](https://travis-ci.org/jamen/pull-fs-meta.svg?branch=master)](https://travis-ci.org/jamen/pull-fs-meta) [![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

> File system functions with a separated metadata system.

```js
var pull = require('pull-stream')
var pug = require('pull-pug') // An example module
var fs = require('pull-fs-meta')() // Init pull-fs-meta

pull(
  // Reading pulls the file's contents as a string
  // and stashes the file's metadata on the `fs` object
  fs.read('app/**/*.pug'),

  // Use String -> String compiler
  pug(),

  // Change the file extensions before writing
  fs.files({ ext: 'html' }),

  // Write to an output folder.
  fs.write('output')
)
```

Modules like [`pull-vinyl`](https://github.com/jamen/pull-vinyl) or [`vinyl-fs`](https://github.com/gulpjs/gulpjs/vinyl-fs) (used in `gulp`) are based on top of the `Vinyl` object, which centralizes the metadata and contents in one location in the stream.  This isn't really appealing to things like compilers who only deal with data...  So you end up needing to create wrapper libraries like `gulp-pug`, `gulp-sass`, etc.

This module separates file structure from contents:
 1. Contents are streamed as strings so you can compile them easily with `String -> String` tools.
 2. Metadata is changed with `fs.files({ ...options })`, like extnames, clearing, etc.

## Installation

```sh
$ npm install --save pull-fs-meta
```

## API

### `fsm(options)` -> `fs`

Initialize the `pull-fs-meta` module.  This is the main export

 - `options` (`Object`): Options to initialize with
  - `meta` (`Array`): Optional meta to load beforehand

Easily done like this:
```js
var fs = require('pull-fs-meta')({ meta: [] })
// Or
var fs = require('pull-fs-meta')()
```

### `fs.read(pattern, [options])`

Read files' contents from the file system as a `String`.  It works as a [source pull stream](https://github.com/pull-stream/pull-stream/blob/master/docs/glossary.md#source).

 - `pattern`: A glob pattern resolved by [`pull-glob`](https://npmjs.com/pull-glob)
 - `options` get passed to `fs.files` (with `clear: true` by default).

```js
pull(
  fs.read('foo/**/*.js'),
  // ... transform contents
)
```

### `fs.write(directory)`

Write contents to the file system under a base directory, to their metadata paths.

 - `directory` (`String`): A path where you want to output the files.

```js
pull(
  fs.read('foo/**/*.js'),
  // ... transform contents
  // then write to `out` directory:
  fs.write('out')
)
```

### `fs.files(options)`

Change your files' metadata.

 - `options` (`Object`): Options to apply on your metadata.
  - `clear` (`Boolean`): Clear the metadata.
  - `ext` (`String`): Change the file's extnames.

```js
pull(
  fs.read('app/**/*.coffee'),
  // ... transform contents
  // update metadata:
  fs.files({ ext: '.js' })
  // write:
  fs.write('out')
)
```

## "Meta" and "Metadata"

"Meta" is private array created from `fms()`, it contains "metadata".

The "metedata" are also arrays. They contain info much like [`Vinyl`](https://github.com/gulpjs/vinyl) has; although, minus the content as that gets streamed.

## License

MIT © [Jamen Marz](https://github.com/jamen)
