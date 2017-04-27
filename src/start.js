'use strict'

const IPFS = require('ipfs')

module.exports = function start (_callback) {
  const options = {
    repo: repoPath(),
    config: {
      Addresses: {
        Swarm: [
          '/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss'
        ]
      }
    }
  }

  const ipfs = new IPFS(options)
  ipfs.on('error', callback)
  ipfs.on('ready', onReady)

  return ipfs

  function callback (err) {
    ipfs.removeListener('error', callback)
    ipfs.removeListener('ready', onReady)
    _callback(err)
  }

  function onReady () {
    callback()
  }
}

function repoPath () {
  return 'temp/ipfs-' + Math.random()
}
