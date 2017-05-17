'use strict'

const Y = require('yjs')
const EventEmitter = require('events')
const Wrapper = require('./wrapper')

const ARRAY_KEYS = ['resources', 'hits']

module.exports = (ipfs) => {
  let ready = false
  ipfs.once('ready', () => {
    ready = true
  })

  return (id, original) => {
    const roomEmitter = new EventEmitter()
    const wrapper = new AnnotationListWrapper(roomEmitter, original)

    const onceIpfsReady = () => {
      Y({
        db: {
          name: 'memory'
        },
        connector: {
          name: 'ipfs', // use the IPFS connector
          ipfs: ipfs,
          room: id,
          roomEmitter: roomEmitter
        },
        share: {
          annotationList: 'Map', // y.share.annotationList is of type Y.Map
          resources: 'Array',
          hits: 'Array'
        }
      }).then(function (y) {
        // resources
        const originalResources = original.resources || []
        originalResources.forEach((resource) => {
          y.share.resources.push([resource])
        })

        // hits
        const originalHits = original.hits || []
        originalHits.forEach((hit) => {
          y.share.hits.push([hit])
        })

        Object.keys(original).forEach((key) => {
          if (original.hasOwnProperty(key) && ARRAY_KEYS.indexOf(key) < 0) {
            y.share.annotationList.set(key, original[key])
          }
        })

        wrapper._start(y.share)
      })
    }

    if (ready) {
      onceIpfsReady()
    } else {
      ipfs.once('ready', onceIpfsReady)
    }

    return wrapper
  }
}

class AnnotationListWrapper extends Wrapper {

  constructor (roomEmitter, originalValue) {
    super(roomEmitter)
    this._originalValue = originalValue || {}
  }

  _start (share) {
    this._originalValue = undefined
    this._share = share

    share.annotationList.observe((event) => {
      const ev = {
        name: event.name,
        value: event.value,
        oldValue: event.oldValue
      }
      this.emit(event.type, ev)
      this.emit('mutation', ev)
    })

    ARRAY_KEYS.forEach((key) => {
      share[key].observe((event) => {
        let eventType = event.type === 'insert' ?  key + ' inserted' : key + ' deleted';
        (event.values || event.oldValues).forEach((value) => {
          const ev = {
            type: eventType,
            index: event.index,
            value: value
          }

          this.emit(eventType, ev)
          this.emit('mutation', ev)
        })
      })
    })

    this._started = true
    this.emit('started')
  }

  set (key, value) {
    this._queueMutation(() => this._share.annotationList.set(key, value))
  }

  pushResource (resource) {
    this._queueMutation(() => this._share.resources.push([resource]))
  }

  putResource (index, resource) {
    this._queueMutation(() => this._share.resources.insert(index, [resource]))
  }

  deleteResourceAt (index) {
    this._queueMutation(() => this._share.resources.delete(index))
  }

  getResources () {
    if (this._started) {
      return this._share.resources.toArray()
    } else {
      return this._originalValue.resources
    }
  }

  pushHit (hit) {
    this._queueMutation(() => this._share.hits.push([hit]))
  }

  putHit (index, hit) {
    this._queueMutation(() => this._share.hits.insert(index, [hit]))
  }

  deleteHitAt (index) {
    this._queueMutation(() => this.share.hits.delete(index))
  }

  getHits () {
    if (this._started) {
      return this._share.hits.toArray()
    } else {
      return this._originalValue.hits
    }
  }

  toJSON () {
    if (!this._started) {
      return this._originalValue
    }

    const ret = {}
    this._share.annotationList.keys().forEach((key) => {
      ret[key] = this._share.annotationList.get(key)
    })

    ARRAY_KEYS.forEach((key) => {
      ret[key] = this._share[key].toArray()
    })

    return ret
  }
}
