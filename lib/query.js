var Triple = require( './triple' )
var Variable = require( './variable' )

/**
 * Detects if a given value is a Number
 * @param  {Mixed} value
 * @return {Boolean}
 */
function isNumber( value ) {
  return Number.isFinite( value )
}

/**
 * Query Constructor
 * Creates a query description from a triple pattern
 * @param  {Triple} pattern
 * @param  {Object} options
 *   @property {Number} offset
 *   @property {Number} limit
 *   @property {Boolean} reverse
 * @return {Query}
 */
function Query( pattern, options ) {
  
  if( !(this instanceof Query) )
    return new Query( pattern, options )
  
  options = options != null ?
    options : {}
  
  this.triple = Triple.create( pattern )
  this.identity = this.triple.getPattern()
  
  this.fillCache = true
  this.highWaterMark = 16
  this.reverse = !!options.reverse
  
  this.offset = isNumber( options.offset ) ? offset : 0
  this.limit = isNumber( options.limit ) ? limit : -1
  
  this.start = this.reverse ?
    this.identity + '\xff' :
    this.identity
  
  this.end = this.reverse ?
    this.identity :
    this.identity + '\xff'
  
  var self = this
  
  this.variables = Object.keys( this.triple )
    .reduce( function( vars, key ) {
      if( self.triple[ key ] instanceof Variable )
        vars[ self.triple[ key ].name ] = key
      return vars
    }, {})
  
}

/**
 * Query Prototype
 * @type {Object}
 */
Query.prototype = {
  
  constructor: Query,
  
  bindTo: function( solution ) {
    
    var self = this
    
    Object.keys( this.variables )
      .forEach( function( name ) {
        solution.define( self, name )
      })
    
    return this
    
  },
  
}

// Exports
module.exports = Query
