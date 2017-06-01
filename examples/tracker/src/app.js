'use strict'
global.setImmediate = require('timers').setImmediate;

const DB = require('../../../src/browser')

const $startButton = document.getElementById('start')
const $stopButton = document.getElementById('stop')
const $errors = document.getElementById('errors')
const $wrapper = document.querySelector('.wrapper')
const $header = document.querySelector('.header')
const $body = document.querySelector('body')
const $idContainer = document.querySelector('.id-container')
const $addressesContainer = document.querySelector('.addresses-container')
const $roomId = document.getElementById('room-id')
const $peersPanel = document.getElementById('peers-panel')
const $peers = document.getElementById('peers')
const $details = document.getElementById('details')
const $allDisabledButtons = document.querySelectorAll('button:disabled')
const $allDisabledInputs = document.querySelectorAll('input:disabled')
const $annotationListId = document.getElementById('annotationlistid')
const $log = document.getElementById('log')
const $latestLog = document.getElementById('latestlog')
const $addButton = document.getElementById('add')
const $removeButton = document.getElementById('remove')

let db
let annotationList
let peerInfo

const partition = 'iiif'

const topic = 'iiif:partition:' + partition

const TYPES = {
  AnnotationList: 'annotationList'
}

const tracking = {}

/*
 * Start and stop the IPFS node
 */

function start () {
  db = DB({ store: 'indexeddb' })

  db.ipfs.once('ready', () => {
    db.ipfs.id((err, _peerInfo) => {
      if (err) {
        throw err
      }
      peerInfo = _peerInfo
      updateView('ready')

    })

    db.ipfs.pubsub.subscribe(topic, (m) => {
      handle(decode(m.data))
    })
  })

  updateView('starting')

  function handle (message) {
    const type = TYPES[message.type]
    if (type) {
      const key = message.type + ':' + message.id
      let tracker = tracking[key]
      if (!tracker) {
        tracker = tracking[key] = db[type](message.id)
        tracker.on('mutation', (event) => {
          log(key, 'mutated (' + event.type + ')', tracker.toJSON())
        })

        tracker.once('started', () => {
          log(key, 'started', tracker.toJSON())
        })
        tracker.room.on('peer joined', () => updateRoomPeers(tracker))
        tracker.room.on('peer left', () => updateRoomPeers(tracker))
        updateRoomPeers(tracker)
        log(key, 'tracking')
      }
    }
  }

  function decode (data) {
    return JSON.parse(data.toString())
  }
}

function stop () {
  window.location.href = window.location.href // refresh page
}


/*
 * UI functions
 */

function log (key, m, value) {
  $annotationListId.innerHTML = key
  $latestLog.style.opacity = 0
  setTimeout(function() {
    $latestLog.innerHTML = m
    $latestLog.style.opacity = 1
  }, 1000)
  $log.innerHTML = key + ': ' + m + ': new value is ' + pprint(value) + '\n' + ($log.innerHTML || '')
}

function updateRoomPeers (tracker) {
  console.log('€€€€ updateRoomPeers')
  if (!tracker.room) {
    return
  }
  if (tracker.room.id) {
    $roomId.innerHTML = tracker.room.id()
  }
  if (tracker.room.peers) {
    $peers.innerHTML = tracker.room.peers().map((peer) => {
      return '<li><span class="address">' + peer + '</span></li>'
    }).join('')
  }
}

function onError (err) {
  let msg = 'An error occured, check the dev console'

  if (err.stack !== undefined) {
    msg = err.stack
  } else if (typeof err === 'string') {
    msg = err
  }

  $errors.innerHTML = '<span class="error">' + msg + '</span>'
  $errors.className = 'error visible'
}

window.onerror = onError

/*
 * App states
 */
const states = {
  ready: () => {
    const addressesHtml = peerInfo.addresses.map((address) => {
      return '<li><span class="address">' + address + '</span></li>'
    }).join('')
    $addressesContainer.innerHTML = addressesHtml
    $idContainer.innerHTML = peerInfo.id
    $allDisabledButtons.forEach(b => { b.disabled = false })
    $allDisabledInputs.forEach(b => { b.disabled = false })
    $peersPanel.className = ''
    $details.className = ''
    $stopButton.disabled = false
    $startButton.disabled = true
  },
  starting: () => {
    $startButton.disabled = true
  }
}

function updateView (state, ipfs) {
  if (states[state] !== undefined) {
    states[state]()
  } else {
    throw new Error('Could not find state "' + state + '"')
  }
}

/*
 * Boot this application!
 */
const startApplication = () => {
  // Setup event listeners

  $startButton.addEventListener('click', start)
  $stopButton.addEventListener('click', stop)
}

startApplication()

function pprint (tracker) {
  return JSON.stringify(tracker)
}
