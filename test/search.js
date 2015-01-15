var HexaDB = require( '..' )
var assert = require( 'assert' )

var db = new HexaDB( require( 'memdb' )() )

// Thanks to 'levelgraph' for this test case,
// I took the liberty of stealing it. Shame on me.
var triples = [{
  subject: 'matteo',
  predicate: 'friend',
  object: 'daniele'
},{
  subject: 'daniele',
  predicate: 'friend',
  object: 'matteo'
},{
  subject: 'daniele',
  predicate: 'friend',
  object: 'marco'
},{
  subject: 'lucio',
  predicate: 'friend',
  object: 'matteo'
},{
  subject: 'lucio',
  predicate: 'friend',
  object: 'marco'
},{
  subject: 'marco',
  predicate: 'friend',
  object: 'davide'
}]

var query = [{
  subject: 'matteo',
  predicate: 'friend',
  object: HexaDB.Variable( 'x' )
},{
  subject: HexaDB.Variable( 'x' ),
  predicate: 'friend',
  object: HexaDB.Variable( 'y' )
},{
  subject: HexaDB.Variable( 'y' ),
  predicate: 'friend',
  object: 'davide'
}]

describe( 'Search', function() {
  
  it( 'prepare', function() {
    // Since we're using MemDB for testing here,
    // we omit checking for errors, or waiting for the callback
    // (we can omit checking for errors, because the primitive ops
    // test should catch those types of errors anyway)
    triples.forEach( function( triple ) {
      db.put( triple, Function.prototype )
    })
  })
  
  it( 'db#searchStream()', function( done ) {
    
    var result = []
    
    db.searchStream( query )
      .on( 'error', done )
      .on( 'readable', function() {
        var value = null
        while( value = this.read() ) {
          console.log( value )
          result.push( value )
        }
      })
      .on( 'end', function() {
        // TODO: Check result
        done()
      })
    
  })
  
  it.skip( 'db#search()', function( done ) {
    
    db.search( query, function( error, result ) {
      // TODO: Check result
      done( error, result )
    })
    
  })
  
})
