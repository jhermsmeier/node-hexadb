var inherit = require( 'bloodline' )
var Stream = require( 'stream' )

/**
 * Solution Constructor
 * @return {Solution}
 */
function Solution( options ) {
  
  if( !(this instanceof Solution) )
    return new Solution( options )
  
  options = options != null ?
    options : {}
  
  options.objectMode = true
  // Since we're piping in multiple streams,
  // which build up the solution over time,
  // we don't want this stream to 'end' prematurely,
  // until the solution is complete
  // NOTE: We have to call .end() manually, once done.
  options.end = false
  
  Stream.Transform.call( this, options )
  
  this.on( 'pipe', this._onPipe )
  this.on( 'unpipe', this._onUnpipe )
  
}

/**
 * Solution Prototype
 * @type {Object}
 */
Solution.prototype = {
  
  constructor: Solution,
  
  _onPipe: function( src ) {
    
  },
  
  _onUnpipe: function( src ) {
    
  },
  
  _transform: function( data, encoding, next ) {
    next()
  },
  
}

inherit( Solution, Stream.Transform )
// Exports
module.exports = Solution
