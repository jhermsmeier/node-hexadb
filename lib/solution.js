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
  
  // Make sure error handler for piped streams
  // is called in own context
  this._onError = this._onError.bind( this )
  
  this.on( 'pipe', this._onPipe )
  this.on( 'unpipe', this._onUnpipe )
  
}

/**
 * Solution Prototype
 * @type {Object}
 */
Solution.prototype = {
  
  constructor: Solution,
  
  _onError: function( error ) {
    this.emit( 'error', error )
  },
  
  _onPipe: function( src ) {
    var self = this
    src.on( 'error', this._onError )
  },
  
  _onUnpipe: function( src ) {
    src.removeListener( 'error', this._onError )
  },
  
  _transform: function( data, encoding, next ) {
    next( null, data )
  },
  
}

inherit( Solution, Stream.Transform )
// Exports
module.exports = Solution
