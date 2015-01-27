# Hexa DB
[![npm](http://img.shields.io/npm/v/hexadb.svg?style=flat)](https://npmjs.org/hexadb)
[![npm downloads](http://img.shields.io/npm/dm/hexadb.svg?style=flat)](https://npmjs.org/hexadb)
[![build status](http://img.shields.io/travis/jhermsmeier/node-hexadb.svg?style=flat)](https://travis-ci.org/jhermsmeier/node-hexadb)

## Install via [npm](https://npmjs.org)

```sh
$ npm install hexadb
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
- putStream (to be implemented)
- updateStream (to be implemented)
- deleteStream (to be implemented)
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

#### SearchStream

```js
var search = db.searchStream( query, options )
```
