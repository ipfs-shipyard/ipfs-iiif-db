'use strict'
global.setImmediate = require('timers').setImmediate;

const DB = require('../../../')

const $startButton = document.querySelector('#start')
const $stopButton = document.querySelector('#stop')
const $peers = document.querySelector('#peers')
const $errors = document.querySelector('#errors')
const $idInput = document.querySelector('#iiifid')
const $multihashInput = document.querySelector('#multihash')
const $getHeadButton = document.querySelector('#get-head')
const $getButton = document.querySelector('#get')
const $connectPeer = document.querySelector('input.connect-peer')
const $connectPeerButton = document.querySelector('button.connect-peer')
const $wrapper = document.querySelector('.wrapper')
const $header = document.querySelector('.header')
const $body = document.querySelector('body')
const $idContainer = document.querySelector('.id-container')
const $addressesContainer = document.querySelector('.addresses-container')
const $details = document.querySelector('#details')
const $allDisabledButtons = document.querySelectorAll('button:disabled')
const $allDisabledInputs = document.querySelectorAll('input:disabled')
const $value = document.querySelector('#get-value')
const $publishId = document.querySelector('#publish-id')
const $publishValue = document.querySelector('#publish-value')
const $setButton = document.querySelector('#set')

let node
let peerInfo

/*
 * Start and stop the IPFS node
 */

function start () {
  if (!node) {
    node = DB()
    node.start((err) => {
      node.peerInfo((err, _peerInfo) => {
        if (err) {
          return onError(err)
        }
        peerInfo = _peerInfo
        updateView('ready', node)
        node.on('peers changed', refreshPeerList)
        $peers.innerHTML = '<h2>peers</h2><i>waiting for peers...</i>'
      })
    })

    updateView('starting', node)
  }
}

function stop () {
  window.location.href = window.location.href // refresh page
}

/*
 * Fetch files and display them to the user
 */

function createFileBlob (data, multihash) {
  const file = new window.Blob(data, {type: 'application/octet-binary'})
  const fileUrl = window.URL.createObjectURL(file)

  const listItem = document.createElement('div')
  const link = document.createElement('a')
  link.setAttribute('href', fileUrl)
  link.setAttribute('download', multihash)
  const date = (new Date()).toLocaleTimeString()

  link.innerText = date + ' - ' + multihash + ' - Size: ' + file.size
  listItem.appendChild(link)
  return listItem
}

function getHead () {
  const id = $idInput.value
  $multihashInput.value = 'Getting head for ' + id + ' ...'
  node.getHead(id, (err, head) => {
    if (err) {
      return onError(err)
    }
    $multihashInput.value = head
  })
}

function getValue () {
  const mh = $multihashInput.value

  $errors.className = 'hidden'

  if (!mh) {
    return console.log('no multihash was inserted')
  }

  $value.innerHTML = 'Getting ' + mh + ' ...'

  // files.get documentation
  // https://github.com/ipfs/interface-ipfs-core/tree/master/API/files#get
  node.getFromHash(mh, (err, value) => {
    if (err) {
      return onError(err)
    }
    $value.innerHTML = mh + ' = ' + value
  })
}

function setValue () {
  const id = $publishId.value
  const value = $publishValue.value

  $errors.className = 'hidden'

  if (!id) {
    return console.log('no id was inserted')
  }

  // files.get documentation
  // https://github.com/ipfs/interface-ipfs-core/tree/master/API/files#get
  node.put(id, value, (err) => {
    if (err) {
      return onError(err)
    }
    console.log('value of %s was set to %s', id, value)
  })
}



/*
 * Network related functions
 */

// Get peers from IPFS and display them

function refreshPeerList (peers) {
  const peersAsHtml = peers
    .map((addr) => {
      return '<li>' + addr + '</li>'
    }).join('')

  $peers.innerHTML = peers.length > 0
    ? '<h2>Remote Peers</h2><ul>' + peersAsHtml + '</ul>'
    : '<h2>Remote Peers</h2><i>Waiting for peers...</i>'
}

/*
 * UI functions
 */

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
  $getHeadButton.addEventListener('click', getHead)
  $getButton.addEventListener('click', getValue)
  $setButton.addEventListener('click', setValue)
}

startApplication()
