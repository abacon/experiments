var fnv = require('fnv-plus')

/* Create any number of hashes
 *
 * From http://willwhim.wpengine.com/2011/09/03/producing-n-hash-functions-by-hashing-only-once/
 */
var makeHash = function (a, b, i) {
  return (a + b) * (i + 1) % 0xFFFFFFFF
}

var fnvDec = function (item, numBuckets) {
  var h = fnv.hash(item, 64).dec()
  var h1 = parseInt(h.slice(0, 9), 10)
  var h2 = parseInt(h.slice(10, 20), 10)
  var res = []
  for (var i = 0; i < numBuckets; i++) {
    res.push(makeHash(h1, h2, i))
  }

  // ???????
  var makePos = function (int) {
    return (int << 1) >>> 1
  }
  return res.map(makePos)
}

var pCollision = function (n, k, m) {
  return Math.pow(1 - Math.pow(Math.E, ((-k * n) / m)), k)
}

class ArrayBloom {
  constructor (size = 10) {
    this.numBuckets = 10
    this.size = size

    this.filter = []
    for (let i = 0; i < this.numBuckets; i++) {
      this.filter.push(0)
    }
  }

  insert (item) {
    var hashed = fnvDec(item, this.numBuckets)
    this.filter = this.filter.map(function (word, idx) {
      return word | hashed[idx]
    })
  }

  check (item) {
    var hash = fnvDec(item, this.numBuckets)
    return this.filter.map(function (word, idx) {
      return (word & hash[idx]) === hash[idx]
    }).every(function (it) {
      return !!it
    })
  }
}

module.exports = { ArrayBloom }
