'use strict'

const waterfall = require('async/waterfall')
const each = require('async/each')
const multihashes = require('multihashes')
const topicName = require('./topic-name')
const Peers = require('./peers')

module.exports = (store, ipfs, node) => {
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
          console.log('ipfs.object.put')
          ipfs.object.put({
            Data: new Buffer(JSON.stringify(data)),
            Links: [] // fix
          }, {enc: 'json'}, callback)
        },

        (node, callback) => {
          const mh = multihashes.toB58String(node.multihash)
          console.log('setting head of %s to', topic, mh)
          store.setHead(topic, mh, (err) => {
            callback(err, mh)
          })
        },

        (mh, callback) => {
          // TODO: we shouldn't need to keep publishing
          const value = new Buffer(mh)
          setInterval(() => ipfs.pubsub.publish(topic, value, (err) => {
            console.log('PUBLISHING topic %s', topic, mh)
            if (err) {
              // TODO: handle error
              throw err
            }
          }), 1000)
          callback()
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
}

function pubSubDelays () {
  // TODO: this is ugly:
  return [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000]
}
