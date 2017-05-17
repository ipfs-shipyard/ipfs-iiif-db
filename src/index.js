'use strict'

const IPFS = require('ipfs')

// initialize Y.js mix-ins
const Y = require('yjs')
require('y-memory')(Y)
require('y-ipfs')(Y)
require('y-array')(Y)
require('y-map')(Y)

const annotationList = require('./annotation-list')

module.exports = (options) => {
  const ipfsOptions = Object.assign({
    repo: repoPath(),
    config: {
      Addresses: {
        Swarm: [
          '/libp2p-webrtc-star/dns4/127.0.0.1:9090/ws'
        ]
      }
    },
    EXPERIMENTAL: {
      pubsub: true
    }
  }, options && options.ipfs)

  const ipfs = new IPFS(ipfsOptions)

  return {
    ipfs: ipfs,
    annotationList : annotationList(ipfs)
  }
}

function repoPath () {
  // TODO: shouldnt need a new repo on every instance
  return 'temp/ipfs-y/' + Math.random()
}
