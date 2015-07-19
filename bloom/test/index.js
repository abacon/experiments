require('babel/register')

var test = require('./bloom.js')
var filters = require('../src/bloom.js')

var bloomClasses = ['ArrayBloom']

bloomClasses.forEach(function (t) {
  test(filters[t])
})
