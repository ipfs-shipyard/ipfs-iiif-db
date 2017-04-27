'use strict'

const waterfall = require('async/waterfall')
const eachSeries = require('async/eachSeries')
const topicName = require('./topic-name')
const localStore = require('./local-store')
const Peers = require('./peers')

module.exports = (ipfs) => {
  const peers = Peers(ipfs)
  peers.on('change', onPeersChange)

  return {
    put: put
  }

  function put (name, value, callback) {
    const data = {
      name: name,
      value: value
    }

    const topic = topicName(name)

    waterfall(
      [
        (callback) => {
          ipfs.object.put({
            Data: new Buffer(JSON.stringify(data)),
            Links: [] // fix
          }, {enc: 'json'}, callback)
        },

        (node, callback) => {
          const mh = node.multihash
          localStore.setHead(topic, mh, (err) => {
            callback(err, mh)
          })
        },

        (mh, callback) => {
          ipfs.pubsub.publish(topic, mh, callback)
        }
      ],
      callback
    )
  }

  function onPeersChange () {
    console.log('peers changed')
    localStore.topics((err, topics) => {
      if (err) {
        throw err
      }
      eachSeries(
        topics,
        (topic, callback) => {
          ipfs.pubsub.publish(topic, localStore.headForTopic(topic), callback)
        },
        (err) => {
          if (err) {
            throw err
          }
        })
    })
  }
}
