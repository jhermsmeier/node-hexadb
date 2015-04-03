var HexaDB = require( '..' )
var assert = require( 'assert' )

describe( 'Search', function() {
  
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
  
  before( 'prepare', function() {
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
          result.push( value )
        }
      })
      .on( 'end', function() {
        // console.log( 'RESULT', result )
        assert.equal( result.length, 1 )
        assert.deepEqual( result.shift(), { x: 'daniele', y: 'marco' } )
        done()
      })
    
  })
  
  it( 'db#search()', function( done ) {
    
    db.search( query, function( error, result ) {
      assert.equal( result.length, 1 )
      assert.deepEqual( result.shift(), { x: 'daniele', y: 'marco' } )
      done( error, result )
    })
    
  })
  
})
