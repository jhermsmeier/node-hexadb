# Hexa DB
[![npm](https://img.shields.io/npm/v/hexadb.svg?style=flat-square)](https://npmjs.com/package/hexadb)
[![npm](https://img.shields.io/npm/l/hexadb.svg?style=flat-square)](https://npmjs.com/package/hexadb)
[![npm downloads](https://img.shields.io/npm/dm/hexadb.svg?style=flat-square)](https://npmjs.com/package/hexadb)
[![build status](https://img.shields.io/travis/jhermsmeier/node-hexadb.svg?style=flat-square)](https://travis-ci.org/jhermsmeier/node-hexadb)

## Install via [npm](https://npmjs.com)

```sh
$ npm install --save hexadb
```

## Performance

These are just very rough figures, obtained with the [UWN](http://www.mpi-inf.mpg.de/yago-naga/uwn/) dataset
on an `i5-4278U @ 2.6 GHz`, running `io.js 2.2.1` on Windows 10.

Read
```
Read 128561 triples
Speed: 8000 triples/sec
Speed: 0.13 ms/triple
```

Write
```
HDD:
Inserted 128561 triples
Speed: 2000 triples/sec
Speed: 0.50 ms/triple

SSD:
Inserted 128561 triples
Speed: 2308 triples/sec
Speed: 0.40 ms/triple
```

## Usage

```js
var level = require( 'level' )
var HexaDB = require( 'hexadb' )
```

```js
// Create a new instance
var db = new HexaDB( level( path ) )
```

#### Triples

```js
// Triples can be Arrays in (spo) order
var triple = [ 'subject', 'predicate', 'object' ]
// Or Objects, either with short or long keys
var triple = { s: 'something',  p: 'else', o: 'is happening' }
// This is the form in which HexaDB returns them in results
var triple = {
  subject: 'something',
  predicate: 'else',
  object: 'is happening',
}
```

#### Variables

```js
// A triple with variables can be used for
// search queries (also for get queries, but
// variables won't be bound)
var triple = {
  // This is what a variable is made of
  s: new HexaDB.Variable( 'varname' ),
  p: 'hasStars',
  // And this is the shortcut to it
  o: db.v( 'shortvar' )
}
```

#### Query Options

```js
var options = {
  offset: 0,
  limit: -1,
  fillCache: true,
  reverse: false,
}
```

## API

### Methods

- [get](#get)
- [put](#put)
- [update](#update)
- [delete](#delete)
- [search](#search)
- [getStream](#getstream)
- [putStream](#putstream)
- [updateStream](#updatestream)
- [deleteStream](#deletestream)
- [searchStream](#searchstream)

#### Get

```js
db.get( triple, options, function( error, result ) {
  // ...
})
```

#### Put

```js
db.put( triple, function( error ) {
  // ...
})
```

#### Update

```js
db.update( oldTriple, newTriple, function( error ) {
  // ...
})
```

#### Delete

```js
db.delete( triple, function( error ) {
  // ...
})
```

#### Search

```js
db.search( query, options, function( error, result ) {
  // ...
})
```

#### GetStream

```js
var stream = db.getStream( pattern, options )
```

#### PutStream

```js
var stream = db.putStream()
```

#### UpdateStream

```js
var stream = db.updateStream()
```

#### DeleteStream

```js
var stream = db.deleteStream()
```

#### SearchStream

```js
var search = db.searchStream( query, options )
```
