var MemDB = require( 'memdb' )
var HexaDB = require( '..' )
var tape = require( 'tape' )

var db = new MemDB()
var graph = new HexaDB( db )

tape( 'HexaDB', function( t ) {
  
  var triple = [ 'a', 'b', 'c' ]
  
  t.test( 'graph#put()', function( t ) {
    t.plan( 1 )
    graph.put( triple, function( error ) {
      t.error( error, 'put it in' )
    })
  })
  
  t.test( 'graph#get()', function( t ) {
    t.plan( 1 )
    graph.get( [ 'a', 'b' ], function( error, data ) {
      t.error( error, 'get it out' )
      console.log( 'data', data )
    })
  })
  
  t.test( 'graph#get()', function( t ) {
    t.plan( 1 )
    graph.get( [ 'a', null, 'c' ], function( error, data ) {
      t.error( error, 'get it out' )
      console.log( 'data', data )
    })
  })
  
  t.test( 'graph#delete()', function( t ) {
    t.plan( 1 )
    graph.delete( triple, function( error ) {
      t.error( error, 'drop it off' )
    })
  })
  
  t.test( 'graph#get()', function( t ) {
    t.plan( 1 )
    graph.get( null, function( error, data ) {
      t.error( error, 'get nothing out' )
      console.log( 'data', data )
    })
  })
  
})
