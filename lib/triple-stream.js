var inherit = require( 'bloodline' )
var Stream = require( 'stream' )
var async = require( 'async' )

/**
 * TripleStream Constructor
 * @return {TripleStream}
 */
function TripleStream( db, options ) {
  
  if( !(this instanceof TripleStream) )
    return new TripleStream( db, options )
  
  options = options != null ?
    options : {}
  
  options.objectMode = true
  
  Stream.Transform.call( this, options )
  
  this.db = db
  this.decode = this.db.format.decode
  
}

TripleStream.Triple = require( './triple' )

/**
 * TripleStream Prototype
 * @type {Object}
 */
TripleStream.prototype = {
  
  constructor: TripleStream,
  
  _transform: function( data, encoding, next ) {
    
    var keys = data.toString().split( '\x00' )
    void keys.shift()
    
    async.parallel([
      this.db.data.get.bind( this.db.data, keys.shift() ),
      this.db.data.get.bind( this.db.data, keys.shift() ),
      this.db.data.get.bind( this.db.data, keys.shift() ),
    ], function( error, result ) {
      var triple = error == null ?
        TripleStream.Triple.create( result ) :
        void 0
      next( error, triple )
    })
    
  },
  
}

// Inherit from Transform stream
inherit( TripleStream, Stream.Transform )
// Exports
module.exports = TripleStream
