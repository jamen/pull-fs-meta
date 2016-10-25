var pull = require('pull-stream')
var glob = require('pull-glob')
var mkdirp = require('mkdirp')
var path = require('path')
var fs = require('fs')

module.exports = fsm

// Initialize the fsm functions
function fsm (options) {
  options = options || {}

  // Array of metadata. (Optionally some preloaded)
  var meta = Array.isArray(options.meta) ? cloneMeta(options.meta) : []

  /**
   * Read files, returning contents and stashing metadata info.
   *
   * ```js
   * file.read('app/scripts/*.js', { base: 'app' })
   * ```
   */
  function read (pattern, options) {
    options = Object.assign({
      base: process.cwd(),
      clear: true
    }, options || {})

    // Clear metadata before reading
    if (options.clear) meta = []

    return pull(
      // Resolve glob pattern to paths
      glob(pattern),
      // Map file paths to file contents and metadata
      pull.asyncMap((filePath, done) => {
        fs.readFile(filePath, (err, buf) => {
          if (err) return done(err)
          // Get string contents from buffer
          var contents = buf.toString()
          // Push metadata onto array.
          meta.push([filePath, options.base])
          // Return contents in pipeline
          done(null, contents)
        })
      })
    )
  }

  /**
   * Write contents to their respective metadata paths, with `directory` as the base.
   *
   * ```js
   * file.write('out')
   * ```
   */
  function write (directory) {
    var index = 0

    return pull.asyncMap(function (contents, cb) {
      // Get metadata
      var metadata = meta[index]
      // Create new path
      var newPath = path.join(directory, path.relative(metadata[1], metadata[0]))
      // Write file to system
      mkdirp(path.dirname(newPath), (err) => {
        if (err) return cb(err)
        fs.writeFile(newPath, contents, cb)
      })

      index++
    })
  }

  /**
   * Change metadata of files.
   *
   * For example after compiling, you want to change the file extension:
   * ```js
   * fs.files({ ext: '.html' })
   * ```
   */
  function files (options) {
    options = options || {}
    // Pass data unchanged
    return pull.through(function () {
      // Map if passed a function
      if (typeof options === 'function') {
        return Object.assign(meta, meta.map(options))
      }

      // Change extname of all files.
      if (options.ext) {
        for (var i = 0, max = meta.length; i < max; i++) {
          var metadata = meta[i]
          var ext = path.extname(metadata[0])
          metadata[0] = metadata[0].slice(0, -ext.length) + options.ext
        }
      }

      // Clear files from meta array
      if (options.clear) meta = []
    })
  }

  // Return functions
  return { read, write, files }
}

/**
 * Clone a meta array.
 */
function cloneMeta (originalMeta) {
  var meta = originalMeta.slice()
  for (var i = 0, max = meta.length; i < max; i++) {
    meta[i] = meta[1].slice()
  }
  return meta
}
