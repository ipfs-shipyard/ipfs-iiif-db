'use strict'

const IPFS = require('ipfs')

const bootstrap = require('./bootstrap')
const annotationList = require('./annotation-list')

module.exports = (options) => {
  const ipfsOptions = Object.assign({
    repo: repoPath(),
    config: {
      Addresses: {
        Swarm: [
          '/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss'
        ]
      },
      Discovery: {
        webRTCStar: {
          Enabled: true
        }
      }
    },
    EXPERIMENTAL: {
      pubsub: true
    }
  }, options && options.ipfs)

  const ipfs = new IPFS(ipfsOptions)

  return {
    ipfs: ipfs,
    annotationList : bootstrap(annotationList, ipfs, options || {})
  }
}

function repoPath () {
  // TODO: shouldnt need a new repo on every instance
  return 'temp/ipfs-y/' + Math.random()
}
