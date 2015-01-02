var HexaDB = require( '..' )
var assert = require( 'assert' )

var db = new HexaDB( require( 'memdb' )() )

describe( 'Primitive Operations', function() {
  
  it( 'db#put([ a, b, c ])', function( done ) {
    db.put([ 'a', 'b', 'c' ], done )
  })
  
  it( 'db#put([ a, f, c ])', function( done ) {
    db.put([ 'a', 'f', 'c' ], done )
  })
  
  it( 'db#get([ a, null, c ])', function( done ) {
    db.get([ 'a', null, 'c' ], function( error, data ) {
      assert.ifError( error )
      assert.equal( data.length, 2 )
      assert.equal( data[0].predicate, 'f' )
      assert.equal( data[1].predicate, 'b' )
      done()
    })
  })
  
  it( 'db#get([ a, b, c ])', function( done ) {
    db.get([ 'a', 'b', 'c' ], function( error, data ) {
      assert.ifError( error )
      assert.equal( data.length, 1 )
      assert.equal( data[0].predicate, 'b' )
      done()
    })
  })
  
  it( 'db#delete([ a, f, c ])', function( done ) {
    db.delete([ 'a', 'f', 'c' ], function( error ) {
      assert.ifError( error )
      db.get([ 'a', null, 'c' ], function( error, data ) {
        assert.ifError( error )
        assert.equal( data.length, 1 )
        assert.equal( data[0].predicate, 'b' )
        done()
      })
    })
  })
  
  it( 'db#update([ a, b, c ], [ a, b, abc ])', function( done ) {
    db.update([ 'a', 'b', 'c' ], [ 'a', 'b', 'abc' ], function( error ) {
      assert.ifError( error )
      db.get([ 'a', 'b' ], function( error, data ) {
        assert.ifError( error )
        assert.equal( data.length, 1 )
        assert.equal( data[0].object, 'abc' )
        done()
      })
    })
  })
  
})
