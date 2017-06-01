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
const $value = document.getElementById('value')

const original = 'http://wellcomelibrary.org/iiif/b18035723/manifest' //require('./samples/original')
const annotations = require('./samples/annotations')

let db
let annotationList
let peerInfo

/*
 * Start and stop the IPFS node
 */

function start () {
  db = DB({ store: 'memory' })

  db.ipfs.once('ready', () => {
    db.ipfs.id((err, _peerInfo) => {
      if (err) {
        throw err
      }
      peerInfo = _peerInfo
      updateView('ready')
    })

  })

  annotationList = db.annotationList(original)

  annotationList.room.on('peer joined', updateRoomPeers)
  annotationList.room.on('peer left', updateRoomPeers)

  annotationList.on('mutation', (event) => {
    console.log('mutation event:', event)
    updateValue()
  })

  annotationList.once('started', updateValue)

  updateView('starting')
  updateValue()

  setInterval(() => {
    const ann = annotations.shift()
    if (ann) {
      annotationList.pushResource(ann)
    }
  }, 2000)
}

function stop () {
  window.location.href = window.location.href // refresh page
}


/*
 * UI functions
 */

function add () {
  const annotation = annotations[Math.floor(Math.random() * annotations.length)]
  annotationList.pushResource(annotation)
}

function remove () {
  const resources = annotationList.getResources()
  const lastPos = resources.length - 1
  if (lastPos >= 0) {
    annotationList.deleteResourceAt(lastPos)
  }
}

function updateValue () {
  $value.innerHTML = annotationList && JSON.stringify(annotationList.toJSON(), null, '\t')
}

function updateRoomPeers () {
  if (!annotationList) {
    return
  }
  console.log('€€€€ updateRoomPeers')
  $roomId.innerHTML = annotationList.room.id()
  $peers.innerHTML = annotationList.room.peers().map((peer) => {
    return '<li><span class="address">' + peer + '</span></li>'
  }).join('')
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
