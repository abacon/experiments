var fnv = require('fnv-plus')

var fnvDec = function (item) {
  var h1 = fnv.hash(item, 32).dec()
  var h2 = fnv.hash(h1, 32).dec()
  var makePos = function (int) {
    return (int << 1) >>> 1
  }
  return [h1, h2].map(makePos)
}

class ArrayBloom {
  constructor (size) {
    this.filter = [0, 0]
    this.size = size
  }

  insert (item) {
    var hashed = fnvDec(item)
    this.filter = this.filter.map(function (word, idx) {
      return word | hashed[idx]
    })
  }

  check (item) {
    var hash = fnvDec(item)
    return this.filter.map(function (word, idx) {
      return (word & hash[idx]) === hash[idx]
    }).every(function (it) {
      return !!it
    })
  }
}

module.exports = { ArrayBloom }
