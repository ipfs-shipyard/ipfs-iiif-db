'use strict'

const IPFS = require('ipfs')
const EventEmitter = require('events')
const Y = require('Y')

const creating = require('./creating')

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
  const ee = new EventEmitter()
  const yDefaultOptions = {
    db: options && options.store || 'memory',
    connector: {
      name: 'ipfs-connector',
      ipfs: ipfs
    }
  }

  return Object.assign(ee, {
    Y: Y,
    yDefaultOptions: yDefaultOptions,
    ipfs: ipfs,
    annotationList: creating.call(ee, 'AnnotationList')
  })
}

function repoPath () {
  // TODO: shouldnt need a new repo on every instance
  return 'temp/ipfs-y/' + Math.random()
}
