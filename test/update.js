var HexaDB = require( '..' )
var assert = require( 'assert' )

var db = new HexaDB( require( 'memdb' )() )

var triples = [{
  s: 'jonas',
  p: 'friend',
  o: 'computer',
},{
  s: 'computer',
  p: 'friend',
  o: 'jonas'
}]

suite( 'Update', function() {
  
  setup( function() {
    triples.forEach( function( triple ) {
      db.put( triple, Function.prototype )
    })
  })
  
  test( 'db#update', function( next ) {
    
    var replacement = {
      s: 'jonas',
      p: 'owner',
      o: 'computer'
    }
    
    db.update( triples[0], replacement, function( error ) {
      if( error ) return next( error )
      db.get({ s: 'jonas', p: 'owner' }, function( error, result ) {
        if( error ) return next( error )
        assert.equal( result[0].predicate, 'owner' )
        next()
      })
    })
    
  })
  
  test( 'db#updateStream' )
  
})
