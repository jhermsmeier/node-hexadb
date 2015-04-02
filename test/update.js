var HexaDB = require( '..' )
var assert = require( 'assert' )

suite( 'Update', function() {
  
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
  
  setup( function() {
    triples.forEach( function( triple ) {
      db.put( triple, Function.prototype )
    })
  })
  
  test( 'db#update', function( next ) {
    
    var replacement = {
      subject: 'jonas',
      predicate: 'owner',
      object: 'computer',
    }
    
    db.update( triples[0], replacement, function( error ) {
      if( error ) return next( error )
      db.get({ s: 'jonas', p: 'owner' }, function( error, result ) {
        if( error ) return next( error )
        assert.deepEqual( result[0], replacement )
        next()
      })
    })
    
  })
  
  test( 'db#updateStream' )
  
})
