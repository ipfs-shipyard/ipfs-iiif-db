'use strict'

const Emitter = require('events')

const PEER_POLL_INTERVAL = 1000

module.exports = (ipfs) => {
  const emitter = new Emitter()
  let peers = []
  const pollInterval = setInterval(pollPeers, PEER_POLL_INTERVAL)

  ipfs.once('stop', () => {
    clearInterval(pollInterval)
  })

  pollPeers()

  return emitter

  function pollPeers () {
    ipfs.swarm.peers((err, peerInfos) => {
      if (err) {
        throw err
      }

      const newPeers = peerInfos.map(peerInfoToAddr).sort()
      if (peersChanged(newPeers)) {
        peers = newPeers
        emitter.emit('changed')
      }
    })
  }

  function peersChanged (newPeers) {
    if (newPeers.length !== peers.length) {
      return true
    }

    for (let i = 0; i < newPeers.length; i++) {
      if (newPeers[i] !== peers[i]) {
        return true
      }
    }
  }
}

function peerInfoToAddr (peerInfo) {
  return peerInfo.addr.toString()
}
