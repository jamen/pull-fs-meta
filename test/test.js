var test = require('tape')
var fsm = require('../')
var fsn = require('fs')
var pull = require('pull-stream')
var rimraf = require('rimraf')

// Clean output files
function clean () { rimraf.sync(`${__dirname}/output*`) }
test.onFinish(clean)
clean()

test('reading files', function (t) {
  var fs = fsm()

  pull(
    fs.read(`${__dirname}/files/**/*.txt`),
    pull.collect(function (err, data) {
      t.same(data, ['Hello world!\n', 'This is a test file.\n'], 'reads file contents')
      t.end(err)
    })
  )
})

test('reading and writing files', function (t) {
  var fs = fsm()

  pull(
    fs.read(`${__dirname}/files/**/*.txt`, { base: `${__dirname}/files` }),
    fs.write(`${__dirname}/output`),
    pull.collect(function (err) {
      t.false(err, 'did not error')

      fsn.stat(`${__dirname}/output/foo.txt`, function (err, stat) {
        if (err) return t.end(err)
        t.true(stat.isFile(), 'file changed and created')
        t.end()
      })
    })
  )
})

test('reading, changing, and writing files', function (t) {
  var fs = fsm()

  pull(
    fs.read(`${__dirname}/files/**/*.txt`, { base: `${__dirname}/files` }),
    pull.map(contents => contents.split('').reverse().join('')),
    fs.files({ ext: '.log' }),
    fs.write(`${__dirname}/output`),
    pull.collect(function (err) {
      t.false(err, 'did not error')

      fsn.stat(`${__dirname}/output/foo.log`, function (err, stat) {
        if (err) return t.end(err)
        t.true(stat.isFile(), 'file changed and created')
        t.end()
      })
    })
  )
})

test('reading multiple times without meta conflict', function (t) {
  var fs = fsm()

  pull(
    fs.read(`${__dirname}/files/**/*.txt`),
    pull.collect(function (err, data) {
      if (err) return t.end(err)
      t.same(data, ['Hello world!\n', 'This is a test file.\n'], 'reads first contents')

      pull(
        fs.read(`${__dirname}/files/**/*.js`),
        pull.collect(function (err, data) {
          t.same(data, [ 'module.exports = 2\n', 'module.exports = 1\n' ], 'reads second contents')
          t.end(err)
        })
      )
    })
  )
})
