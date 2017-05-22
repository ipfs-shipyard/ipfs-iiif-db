'use strict'

const Wrapper = require('./wrapper')

const ARRAY_KEYS = ['resources', 'hits']
const EVENT_PREFIXES = {
  resources: 'resource',
  hits: 'hit'
}

exports.share = {
  annotationList: 'Map', // y.share.annotationList is of type Y.Map
  resources: 'Array',
  hits: 'Array'
}

exports.update = (original, share) => {
  // resources
  const originalResources = original.resources || []
  originalResources.forEach((resource) => {
    share.resources.push([resource])
  })

  // hits
  const originalHits = original.hits || []
  originalHits.forEach((hit) => {
    share.hits.push([hit])
  })

  Object.keys(original).forEach((key) => {
    if (original.hasOwnProperty(key) && ARRAY_KEYS.indexOf(key) < 0) {
      share.annotationList.set(key, original[key])
    }
  })
}

exports.wrapper = class AnnotationListWrapper extends Wrapper {

  constructor (roomEmitter, originalValue) {
    super(roomEmitter)
    this._originalValue = originalValue || {}
  }

  _start (share) {
    this._originalValue = undefined
    this._share = share

    share.annotationList.observe((event) => {
      const ev = {
        type: event.type,
        name: event.name,
        value: event.value,
        oldValue: event.oldValue
      }
      this.emit(event.type, ev)
      this.emit('mutation', ev)
    })

    ARRAY_KEYS.forEach((key) => {
      const eventPrefix = eventPrefixFor(key)
      share[key].observe((event) => {
        let eventType = event.type === 'insert' ?  eventPrefix + ' inserted' : eventPrefix + ' deleted';
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

function eventPrefixFor (key) {
  return EVENT_PREFIXES[key]
}