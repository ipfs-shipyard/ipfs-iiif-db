'use strict'

const IPFS = require('ipfs')

const DEFAULT_OPTIONS = {
  config: {
    Addresses: {
      Swarm: [
        '/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss'
      ]
    }
  },
  EXPERIMENTAL: {
    pubsub: true
  }
}

module.exports = function start (store, _options, _callback) {
  const options = Object.assign({
    repo: repoPath()
  }, DEFAULT_OPTIONS, _options)

  const ipfs = new IPFS(options)

  console.log('IPFS:', ipfs)

  ipfs.on('error', callback)
  ipfs.on('ready', onReady)

  return ipfs

  function callback (err) {
    ipfs.removeListener('error', callback)
    ipfs.removeListener('ready', onReady)
    _callback(err)
  }

  function onReady () {
    console.log('IPFS ready')
    store.start(callback)
  }
}

function repoPath () {
  return 'temp/ipfs-iifs-producer-' + Math.random()
}
