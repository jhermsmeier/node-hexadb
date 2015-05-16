var msgp = require( 'msgpack5' )()
var crypto = require( 'crypto' )
var Variable = require( './variable' )

/**
 * Triple Constructor
 * @return {Triple}
 */
function Triple( s, p, o ) {
  
  if( !(this instanceof Triple) )
    return new Triple( s, p, o )
  
  this.subject = s
  this.predicate = p
  this.object = o
  
}

Triple.indices = [ 'spo','sop','pos','pso','ops','osp' ]

Triple.indexMap = {
  spo: [ 'subject', 'predicate', 'object' ],
  sop: [ 'subject', 'object', 'predicate' ],
  pos: [ 'predicate', 'object', 'subject' ],
  pso: [ 'predicate', 'subject', 'object' ],
  ops: [ 'object', 'predicate', 'subject' ],
  osp: [ 'object', 'subject', 'predicate' ],
}

Triple.create = function( value ) {
  if( value == null )
    return new Triple()
  return Array.isArray( value ) ?
    Triple.fromArray( value ) :
    Triple.fromObject( value )
}

Triple.fromArray = function( value ) {
  return new Triple( value[0], value[1], value[2] )
}

Triple.fromObject = function( value ) {
  return new Triple(
    value.subject != null ?
      value.subject : value.s,
    value.predicate != null ?
      value.predicate : value.p,
    value.object != null ?
      value.object : value.o
  )
}

// Hash a given value; primarily
// the triple's properties
// TODO: Use 'farmhash' when it's fixed on Windows
Triple.hash = function( value ) {
  return crypto.createHash( 'sha1' )
    .update( value )
    .digest( 'hex' )
}

// Make sure to cast 'undefined'
// to 'null', since msgpack doesn't
// have a type def for 'undefined'
Triple.hashencode = function( value ) {
  value = value != null ? value : null
  return Triple.hash( msgp.encode( value ) )
}

/**
 * Creates a hashed triple
 * @param  {Triple} triple
 * @return {Triple}
 */
Triple.getHash = function( triple ) {
  return new Triple(
    Triple.hashencode( triple.subject ),
    Triple.hashencode( triple.predicate ),
    Triple.hashencode( triple.object )
  )
}

/**
 * Determines if a triple has holes
 * @param  {Triple} triple
 * @return {Boolean}
 */
Triple.isSparse = function( triple ) {
  
  var hasHoles = triple.subject == null ||
    triple.predicate == null ||
    triple.object == null
  
  var hasVariables = triple.subject instanceof Variable ||
    triple.predicate instanceof Variable ||
    triple.object instanceof Variable
  
  return hasHoles || hasVariables
  
}

/**
 * Builds the search pattern for a given triple
 * @param  {Triple} triple
 * @return {String}
 */
Triple.getPattern = function( triple ) {
  
  // Determine triple order
  var keys = Object.keys( triple )
    .filter( function( key ) {
      return triple[ key ] != null &&
        !( triple[ key ] instanceof Variable )
    })
  
  // Build start of triple order index
  var index = keys
    .map( function( k ) { return k[0] } )
    .join( '' )
  
  // Determine a triple order index to search with
  for( var i = 0; i < Triple.indices.length; i++ ) {
    if( Triple.indices[i].indexOf( index ) === 0 ) {
      index = Triple.indices[i]
      break
    }
  }
  
  // Build search pattern
  return [ index ].concat( keys.map( function( k ) {
    return Triple.hashencode( triple[k] )
  })).join( '\x00' )
  
}

/**
 * Returns the six indices of a given triple
 * @param  {Triple} triple
 * @return {Array}
 */
Triple.generateKeys = function( triple ) {
  
  var subject = Triple.hashencode( triple.subject )
  var predicate = Triple.hashencode( triple.predicate )
  var object = Triple.hashencode( triple.object )
  
  return [
    [ 'spo', subject, predicate, object ].join( '\x00' ),
    [ 'sop', subject, object, predicate ].join( '\x00' ),
    [ 'pos', predicate, object, subject ].join( '\x00' ),
    [ 'pso', predicate, subject, object ].join( '\x00' ),
    [ 'ops', object, predicate, subject ].join( '\x00' ),
    [ 'osp', object, subject, predicate ].join( '\x00' ),
  ]
  
}

/**
 * Converts a given triple to an
 * Array of the form (spo)
 * @param  {Triple} triple
 * @return {Array}
 */
Triple.toArray = function( triple ) {
  return [
    triple.subject,
    triple.predicate,
    triple.object
  ]
}

// Exports
module.exports = Triple
