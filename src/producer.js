'use strict'

const waterfall = require('async/waterfall')
const eachSeries = require('async/eachSeries')
const topicName = require('./topic-name')
const localStore = require('./local-store')
const Peers = require('./peers')

const PUB_SUB_DELAY = 3000

module.exports = (ipfs) => {
  const peers = Peers(ipfs)
  peers.on('changed', onPeersChange)

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
    localStore.topics((err, topics) => {
      if (err) {
        console.error('peer poller: error getting topics', err)
        return // early
      }
      eachSeries(
        topics,
        (topic, callback) => {
          localStore.headForTopic(topic, (err, head) => {
            if (err) {
              callback(err)
            } else {
              // fix: do I really need a delay?
              setTimeout(() => ipfs.pubsub.publish(topic, head, callback), PUB_SUB_DELAY)
            }
          })
        },
        (err) => {
          if (err) {
            console.error('peer poller: error head for topics', err)
          }
        }
      )
    })
  }
}
