# ipfs-iiif-db

> IIIF annotations JS client over IPFS

# Instructions

## Install

```sh
$ npm install ipfs-iiif-db --save
```

## Import


In thr browser environment, you can either use this library by including it and bundling your app together with it (using browserify or webpack, for instance), or you can

### in Node.js or in a browser with a bundler:

```js
const DB = require('ipfs-iiif-db')
```

### Using a script tag in a browser

```html
<!-- loading the minified version -->
<script src="https://unpkg.com/ipfs-iiif-db/dist/index.min.js"></script>

<!-- loading the human-readable (not minified) version -->
<script src="https://unpkg.com/ipfs-iiif-db/dist/index.js"></script>
```

Now you can access this library using the `IpfsIiifDb` on the global namespace. (In this case, replace `DB` on the examples below with `IpfsIiifDb`).

## instantiate

```js
const db = DB([options])
```

This constructor takes one optional argument: a [js-ipfs options object](https://github.com/ipfs/js-ipfs#advanced-options-when-creating-an-ipfs-node).

## start


```js
db.start([callback])
```

## produce a change

```js
db.put(id, value, callback)
```

The id needs to be a string, but the value can be any JS object that can be represented in JSON.

## get latest

```
db.get(id, callback)
```

#### Listen for changes

To listen for changes you must pass a second argument to `get` with the value `true`. This will return a changes feed you can listen on:

```js
const changes = db.get(id, true, (value) => {
  console.log('new value is: %j', newValue)
})

changes.on('change', (newValue) => {
  console.log('new value is: %j', newValue)
})
```

You can close this changes feed:

```js
changes.close()
```


### stop


```js
db.stop([callback])
```


# License

MIT

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/pgte/ipfs-iiif-db/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

[MIT](LICENSE)
