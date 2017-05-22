// initialize Y.js mix-ins
const Y = require('yjs')
require('y-memory')(Y)
require('y-indexeddb')(Y)
require('y-ipfs-connector')(Y)
require('y-array')(Y)
require('y-map')(Y)

module.exports = require('./index')
