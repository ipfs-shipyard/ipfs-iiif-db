global.setImmediate = require('timers').setImmediate;
const DB = require('../../../')

const db = DB()

db.start((err) => {
  if (err) {
    reportError(err)
  }
})

$saveButton = document.querySelector('#save')
$text = document.querySelector('#text')
$errors = document.querySelector('#errors')

$saveButton.addEventListener('click', save)

function save () {
  const value = $text.value
  console.log('save', value)
  db.put('simple-producer-consumer-example', value, (err) => {
    console.log('SAVED')
    if (err) {
      reportError(err)
    }
  })
}

function reportError (err) {
  $errors.innerHTML = '<span class="error">' + err.message + '</span>'
  $errors.className = 'error visible'
}
