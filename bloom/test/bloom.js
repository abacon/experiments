var test = require('tape')
var superb = require('superb')
var supervillains = require('supervillains')
var range = require('range').range

var wordsToAdd = range(0, 10).map(function () { return superb() })
var wordsNotToAdd = range(0, 10).map(function () { return supervillains.random() })

var bin = function (int) { return (+int).toString(2) }

var testBloomType = function (Type) {
  test('Can insert a value', function (assert) {

    var bf = new Type()
    for (let word of wordsToAdd) {
      bf.insert(word)
      assert.true(bf.check(word), `${word} in ${bf.filter.toString(2)}`)
    }
    assert.end()
  })

  test('Empty filters always return false', function (assert) {
    var bf = new Type()
    for (let word of wordsNotToAdd) {
      assert.false(bf.check(word), word)
    }
    assert.end()
  })

  test('This should fail pretty often?', function (assert) {
    var bf = new Type()
    for (let word of wordsToAdd) {
      bf.insert(word)
    }

    for (let word of wordsNotToAdd) {
      assert.false(bf.check(word), word)
    }
    assert.end()
  })
}

module.exports = testBloomType

