var HexaDB = require( '..' )
var assert = require( 'assert' )

describe( 'Triple', function() {
  
  it( 'detect sparse triples', function() {
    var t = new HexaDB.Triple({ p: 'friend' })
    assert.ok( t.isSparse )
    var t = new HexaDB.Triple({ s: 'herbert', p: 'friend' })
    assert.ok( t.isSparse )
    var t = new HexaDB.Triple({ s: 'herbert' })
    assert.ok( t.isSparse )
    var t = new HexaDB.Triple({ s: 'herbert', o: 'hildegard' })
    assert.ok( t.isSparse )
    var t = new HexaDB.Triple({ o: 'hildegard' })
    assert.ok( t.isSparse )
  })
  
})
