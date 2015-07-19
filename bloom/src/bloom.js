var MD5 = require('crypto-js/MD5')
// var SHA256 = require('crypto-js/SHA256')
// var AES = require('crypto-js/AES')

var bin = function (int) { return (+int).toString(2) }
class ArrayBloom {
  constructor (size) {
    this.filter = [0, 0, 0, 0]
    this.size = size
//    this.hashFns = [
//      MD5, SHA256, AES
//    ]
  }

  insert (item) {
    var hashed = MD5(item).words
    this.filter = this.filter.map(function (word, idx) {
      return word | hashed[idx]
    })

//    for (let hash of this.hashFns) {
//      let hashed = hash(item)
//      hashed.
  }

  check (item) {
    console.log(`${item} (${MD5(item).words.map(bin)}) in ${this.filter.toString(2)}?`)
    var hash = MD5(item).words
    return this.filter.map(function (word, idx) {
      console.log((word & hash[idx]) === hash[idx])
      return (word & hash[idx]) === hash[idx]
    }).every(function (it) {
      return !!it
    })
  }
}

module.exports = { ArrayBloom }
