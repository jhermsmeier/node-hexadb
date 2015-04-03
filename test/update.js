var HexaDB = require( '..' )
var assert = require( 'assert' )

describe( 'Update', function() {
  
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
  
  it( 'db#update', function( next ) {
    
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
  
  it( 'db#updateStream', function( next ) {
    
    var us = db.updateStream()
    var replace = {
      old: [ 'jonas', 'owner', 'computer' ],
      new: [ 'jonas', 'friend', 'computer' ],
    }
    
    us.once( 'finish', function() {
      db.get({ p: 'friend' }, function( error, result ) {
        if( error ) return next( error )
        assert( result.length, 2 )
        next()
      })
    })
    
    us.write( replace )
    us.end()
    
  })
  
})
