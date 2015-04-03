var HexaDB = require( '..' )
var assert = require( 'assert' )

describe( 'Delete', function() {
  
  var db = new HexaDB( require( 'memdb' )() )

  var triples = [{
    subject: 'jonas',
    predicate: 'friend',
    object: 'computer',
  },{
    subject: 'computer',
    predicate: 'friend',
    object: 'jonas',
  }]
  
  before( function() {
    triples.forEach( function( triple ) {
      db.put( triple, Function.prototype )
    })
  })
  
  it( 'db#delete', function( next ) {
    
    db.delete( triples[0], function( error ) {
      if( error ) return next( error )
      db.get({ p: 'friend' }, function( error, result ) {
        if( error ) return next( error )
        assert.equal( result.length, 1 )
        assert.deepEqual( result[0], triples[1] )
        next()
      })
    })
    
  })
  
  it( 'db#deleteStream' )
  
})
