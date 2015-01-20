var inherit = require( 'bloodline' )
var Stream = require( 'stream' )

/**
 * Solution Constructor
 * @return {Solution}
 */
function Solution() {
  
  if( !(this instanceof Solution) )
    return new Solution()
  
  // Inherit from transform stream
  Stream.Transform.call( this, {
    objectMode: true,
    highWaterMark: 1,
  })
  
  this.vars = {}
  
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
    this.query = src.query
  },
  
  _onUnpipe: function( src ) {
    this.query = null
  },
  
  define: function( query, varname ) {
    if( this.vars[ varname ] == null ) {
      // console.log( 'DEFINED', varname, 'FOR', query )
      this.vars[ varname ] = {
        query: query,
        data: [],
      }
    }
  },
  
  bindResult: function( data ) {
    
    var vars = this.query.variables
    
    return Object.keys( vars )
      .reduce( function( result, varname ) {
        result[ varname ] = data[ vars[ varname ] ]
        return result
      }, {})
    
  },
  
  isComplete: function( result ) {
    return Object.keys( result ).length ===
      Object.keys( this.vars ).length
  },
  
  _transform: function( data, encoding, next ) {
    
    // console.log( '' )
    
    var self = this
    // Bind the data to it's defined variables
    var result = this.bindResult( data )
    // Determine if a given result is complete,
    // in terms of bound variables
    var isComplete = this.isComplete( result )
    
    // Populate the variables
    Object.keys( this.query.variables ).forEach( function( varname ) {
      // Check if the variables where defined in the current query
      var isContained = ~self.vars[ varname ].data.indexOf( result[ varname ] )
      var isOriginQuery = self.vars[ varname ].query === self.query
      if( isOriginQuery && !isContained ) {
        // console.log( 'ADDING', varname, '=', result[ varname ] )
        self.vars[ varname ].data.push( result[ varname ] )
      } else if( !isContained ) {
        isComplete = false
      }
    })
    
    // console.log( 'DATA', data )
    // console.log( 'RESULT', result )
    // console.log( 'RESULT:COMPLETE', isComplete )
    
    // Don't emit uncomplete result sets
    // (they only populate variables)
    if( !isComplete ) next()
    else next( null, result )
    
  },
  
}

inherit( Solution, Stream.Transform )
// Exports
module.exports = Solution
