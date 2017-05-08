'use strict'

const waterfall = require('async/waterfall')
const each = require('async/each')
const multihashes = require('multihashes')
const topicName = require('./topic-name')
const Peers = require('./peers')
const Broadcaster = require('./broadcaster')

module.exports = (store, ipfs, node) => {
  const peers = Peers(ipfs)
  peers.on('changed', onPeersChange)

  const broadcasters = {}

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

        (node, callback) => callback(null, multihashes.toB58String(node.multihash)),

        (mh, callback) => {
          store.getHead(topic, (err, head) => {
            if (err) {
              callback(err)
              return //early
            }

            ensureBroadcaster(topic)
            store.setHead(topic, head ? head.version + 1 : 0, mh, callback)
          })
        }
      ],
      callback
    )
  }

  function onPeersChange (peers) {
    node.emit('peers changed', peers)
  }

  // function onPeersChange () {
  //   store.topics((err, topics) => {
  //     if (err) {
  //       console.error('peer poller: error getting topics', err)
  //       return // early
  //     }
  //     each(
  //       topics,
  //       (topic, callback) => {
  //         each(
  //           pubSubDelays(),
  //           publishWithDelay.bind(null, topic),
  //           callback
  //         )
  //       },
  //       (err) => {
  //         if (err) {
  //           console.error('peer poller: error head for topics', err)
  //         }
  //       }
  //     )

  //     function publishWithDelay (topic, delay, callback) {
  //       // fix: do I really need a delay?
  //       setTimeout(() => {
  //         store.headForTopic(topic, (err, head) => {
  //           if (err) {
  //             callback(err)
  //           } else {
  //             console.log('(2) PUBLISHING topic %s', topic, head)
  //             ipfs.pubsub.publish(topic, head, callback)
  //           }
  //         })
  //       }, delay)
  //     }
  //   })
  // }

  function ensureBroadcaster (topic) {
    let broadcaster = broadcasters[topic]
    if (!broadcaster) {
      broadcaster = broadcasters[topic] = Broadcaster(topic, ipfs, store)
    }
  }
}

function pubSubDelays () {
  // TODO: this is ugly:
  return [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000]
}
