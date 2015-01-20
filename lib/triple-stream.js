var inherit = require( 'bloodline' )
var Stream = require( 'stream' )
var async = require( 'async' )
var Triple = require( './triple' )

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

/**
 * TripleStream Prototype
 * @type {Object}
 */
TripleStream.prototype = {
  
  constructor: TripleStream,
  
  _transform: function( data, encoding, next ) {
    
    this.db.data.get( data, function( error, value ) {
      
      if( error != null ) {
        return !error.notFound ?
          void next( error ) :
          void next()
      }
      
      next( null, Triple.create( value ) )
      
    })
    
  },
  
}

// Inherit from Transform stream
inherit( TripleStream, Stream.Transform )
// Exports
module.exports = TripleStream
