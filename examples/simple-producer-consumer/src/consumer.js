global.setImmediate = require('timers').setImmediate;

$text = document.querySelector('#text')
$getButton = document.querySelector('#get')
$errors = document.querySelector('#errors')

const docId = 'simple-producer-consumer-example'

const DB = require('../../../')
const db = DB()

db.start((err) => {
  if (err) {
    return reportError(err)
  }

  $getButton.addEventListener('click', get)

  db.onChange(docId, (text) => {
    $text.innerHTML = text
  })
})

function get () {
  db.get(docId, (err, doc) => {
    console.log('GOT')
    if (err) {
      return reportError(err)
    }
    console.log('got doc')
    $text.innerHTML = doc
  })
}

function reportError (err) {
  $errors.innerHTML = '<span class="error">' + err.message + '</span>'
  $errors.className = 'error visible'
}
