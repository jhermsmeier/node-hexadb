var inherit = require( 'bloodline' )
var Stream = require( 'stream' )

/**
 * FilterStream Constructor
 * @return {FilterStream}
 */
function FilterStream( options ) {
  
  if( !(this instanceof FilterStream) )
    return new FilterStream( options )
  
  options = options != null ?
    options : {}
  
  options.objectMode = true
  options.highWaterMark = 1
  
  Stream.Transform.call( this, options )
  
  // TODO: Pattern handling
  
}

/**
 * FilterStream Prototype
 * @type {Object}
 */
FilterStream.prototype = {
  
  constructor: FilterStream,
  
  _transform: function( value, encoding, next ) {
    next()
  },
  
}

inherit( FilterStream, Stream.Transform )
// Exports
module.exports = FilterStream

