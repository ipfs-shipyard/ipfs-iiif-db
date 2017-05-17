'use strict'
global.setImmediate = require('timers').setImmediate;

const DB = require('../../../')

const $startButton = document.getElementById('start')
const $stopButton = document.getElementById('stop')
const $errors = document.getElementById('errors')
const $wrapper = document.querySelector('.wrapper')
const $header = document.querySelector('.header')
const $body = document.querySelector('body')
const $idContainer = document.querySelector('.id-container')
const $addressesContainer = document.querySelector('.addresses-container')
const $details = document.getElementById('details')
const $allDisabledButtons = document.querySelectorAll('button:disabled')
const $allDisabledInputs = document.querySelectorAll('input:disabled')
const $value = document.getElementById('value')
const $addButton = document.getElementById('add')
const $removeButton = document.getElementById('remove')

const original = require('./samples/original')
const annotations = require('./samples/annotations')

let db
let annotationList

/*
 * Start and stop the IPFS node
 */

function start () {
  if (!db) {
    db = DB()

    annotationList = db.annotationList('id', original)
    updateValue(annotationList)

    annotationList.on('mutation', (event) => {
      console.log('MUTATION:', event)
      updateValue(annotationList)
    })

    updateView('starting')
  }
}

function stop () {
  window.location.href = window.location.href // refresh page
}


/*
 * UI functions
 */

function add () {
  const annotation = annotations[Math.floor(Math.random() * annotations.length)]
  console.log('going to push annotation', annotation)
  annotationList.pushResource(annotation)
}

function remove () {
  const resources = annotationList.getResources()
  const lastPos = resources.length - 1
  if (lastPos >= 0) {
    annotationList.deleteResourceAt(lastPos)
  }
}

function updateValue (annotationList) {
  console.log('updateValue', annotationList)
  $value.innerHTML = JSON.stringify(annotationList.toJSON(), null, '\t')
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
    $idContainer.innerText = peerInfo.id
    $addressesContainer.innerHTML = addressesHtml
    $allDisabledButtons.forEach(b => { b.disabled = false })
    $allDisabledInputs.forEach(b => { b.disabled = false })
    $peers.className = ''
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
  $addButton.addEventListener('click', add)
  $removeButton.addEventListener('click', remove)
}

startApplication()
