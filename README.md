# ipfs-iiif-db

> IIIF annotations JS client over IPFS

# Instructions

## Install

```sh
$ npm install ipfs-iiif-db --save
```

## Import


```js
const DB = require('ipfs-iiif-db')
```

## instantiate

```js
const db = DB()
```

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

```js
const subscription = db.onChange(id, (newValue) => {
  console.log('new value is: %j', newValue)
})
```

#### Cancel subscription

The consumer `onChange` function returns a subscription object that you can cancel:

```js
subscription.cancel()
```


### stop


```js
db.stop([callback])
```


# License

MIT

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs/js-ipfs-unixfs-engine/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

[MIT](LICENSE)
