var HexaDB = require( '..' )
var assert = require( 'assert' )

describe( 'Put', function() {
  
  var db = new HexaDB( require( 'memdb' )() )
  
  it( 'db#put', function( next ) {
    
    var triple = {
      subject: 'door',
      predicate: 'state',
      object: 'open',
    }
    
    db.put( triple, function( error ) {
      if( error ) return next( error )
      db.get([ 'door' ], function( error, result ) {
        if( error ) return next( error )
        assert.equal( result.length, 1 )
        assert.deepEqual( result[0], triple )
        next()
      })
    })
    
  })
  
  it( 'db#putStream', function( next ) {
    
    var ps = db.putStream()
    
    ps.once( 'finish', function() {
      db.get([ 'door' ], function( error, result ) {
        if( error ) return next( error )
        assert.equal( result.length, 4 )
        next()
      })
    })
    
    ps.write([ 'door', 'state', 'closed' ])
    ps.write([ 'door', 'state', 'half-closed' ])
    ps.write([ 'door', 'state', 'half-open' ])
    ps.end()
    
  })
  
})
