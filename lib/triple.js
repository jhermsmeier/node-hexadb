var msgp = require( 'msgpack5' )()
var crypto = require( 'crypto' )

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
  
  value = value != null ?
    value : null
  
  return Triple.hash( msgp.encode( value ) )
  
}

/**
 * Triple Prototype
 * @type {Object}
 */
Triple.prototype = {
  
  constructor: Triple,
  
  get isSparse() {
    return this.subject == null ||
      this.predicate == null ||
      this.object == null
  },
  
  getHash: function() {
    return {
      subject: Triple.hashencode( this.subject ),
      predicate: Triple.hashencode( this.predicate ),
      object: Triple.hashencode( this.object ),
    }
  },
  
  getPattern: function() {
    
    var self = this
    
    // Determine triple order
    var keys = Object.keys( self )
      .filter( function( key ) {
        return self[ key ] != null
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
      return Triple.hashencode( self[k] )
    })).join( '\x00' )
    
  },
  
  generateKeys: function() {
    
    var subject = Triple.hashencode( this.subject )
    var predicate = Triple.hashencode( this.predicate )
    var object = Triple.hashencode( this.object )
    
    return [
      [ 'spo', subject, predicate, object ].join( '\x00' ),
      [ 'sop', subject, object, predicate ].join( '\x00' ),
      [ 'pos', predicate, object, subject ].join( '\x00' ),
      [ 'pso', predicate, subject, object ].join( '\x00' ),
      [ 'ops', object, predicate, subject ].join( '\x00' ),
      [ 'osp', object, subject, predicate ].join( '\x00' ),
    ]
    
  },
  
}

// Exports
module.exports = Triple
