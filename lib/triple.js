var msgpack = require( 'msgpack5' )()

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

Triple.indices = {
  spo: [ 'subject', 'predicate', 'object' ],
  sop: [ 'subject', 'object', 'predicate' ],
  pos: [ 'predicate', 'object', 'subject' ],
  pso: [ 'predicate', 'subject', 'object' ],
  ops: [ 'object', 'predicate', 'subject' ],
  osp: [ 'object', 'subject', 'predicate' ],
}

Triple.indexKeys = Object.keys( Triple.indices )

Triple.create = function( value ) {
  return Array.isArray( value ) ?
    Triple.fromArray( value ) :
    Triple.fromObject( value )
}

Triple.fromArray = function( value ) {
  return new Triple( value[0], value[1], value[2] )
}

Triple.fromObject = function( value ) {
  return new Triple(
    value.subject || value.s,
    value.predicate || value.p,
    value.object || value.o
  )
}

/**
 * Triple Prototype
 * @type {Object}
 */
Triple.prototype = {
  
  constructor: Triple,
  
  generateKey: function( index ) {
    
    var key = [ index ]
    var order = Triple.indices[ index ]
    var value, i = 0
    
    while( ( value = this[ order[i] ] ) != null ) {
      key.push( value )
      i++
    }
    
    return msgpack.encode( key ).slice()
    
  },
  
  generateKeys: function() {
    
    var keys = []
    
    for( var i = 0; i < Triple.indexKeys.length; i++ ) {
      keys.push( this.generateKey( Triple.indexKeys[i], this ) )
    }
    
    return keys
    
  },
  
  getTypes: function() {
    var self = this
    return Object.keys( self )
      .filter( function( key ) {
        switch( key ) {
          case 'subject': return !!self.subject
          case 'predicate': return !!self.predicate
          case 'object': return !!self.object
          default: return false
        }
      })
  },
  
  findIndex: function( preferredIndex ) {
    throw new Error( 'Not implemented' )
  },
  
  toArray: function( order ) {
    switch( order ) {
      case 'sop': return [ this.subject, this.object, this.predicate ]
      case 'pos': return [ this.predicate, this.object, this.subject ]
      case 'pso': return [ this.predicate, this.subject, this.object ]
      case 'ops': return [ this.object, this.predicate, this.subject ]
      case 'osp': return [ this.object, this.subject, this.predicate ]
      default:    return [ this.subject, this.predicate, this.object ]
    }
  },
  
  pack: function( order ) {
    return msgpack.encode( this.toArray( order ) ).slice()
  },
  
}

// Exports
module.exports = Triple
