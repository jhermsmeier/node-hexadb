var Triple = require( './triple' )

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
  
  this.pattern = pattern
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
  
}

/**
 * Query Prototype
 * @type {Object}
 */
Query.prototype = {
  
  constructor: Query,
  
}

// Exports
module.exports = Query
