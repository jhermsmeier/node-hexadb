var HexaDB = require( '..' )
var assert = require( 'assert' )
var Triple = HexaDB.Triple

describe( 'Triple', function() {
  
  it( 'detect sparse triples', function() {
    var t = new Triple({ p: 'friend' })
    assert.ok( Triple.isSparse( t ) )
    var t = new Triple({ s: 'herbert', p: 'friend' })
    assert.ok( Triple.isSparse( t ) )
    var t = new Triple({ s: 'herbert' })
    assert.ok( Triple.isSparse( t ) )
    var t = new Triple({ s: 'herbert', o: 'hildegard' })
    assert.ok( Triple.isSparse( t ) )
    var t = new Triple({ o: 'hildegard' })
    assert.ok( Triple.isSparse( t ) )
  })
  
})
