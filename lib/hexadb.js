var async = require( 'async' )
var msgpack5 = require( 'msgpack5' )
var sublevel = require( 'level-sublevel' )

/**
 * HexaDB Constructor
 * @return {HexaDB}
 */
function HexaDB( db, options ) {
  
  if( !(this instanceof HexaDB) )
    return new HexaDB( db, options )
  
  this.db = sublevel( db )
  this.format = msgpack5()
  this.encoding = {
    encode: this.format.encode,
    decode: this.format.decode,
    buffer: true,
    type: 'msgpack',
  }
  
  // Maps (s,p,o) hashes to each other
  this.graph = this.db.sublevel( 'graph', {
    keyEncoding: 'utf8',
    valueEncoding: 'utf8',
  })
  
  // Maps values to hashes
  this.data = this.db.sublevel( 'data', {
    keyEncoding: 'utf8',
    valueEncoding: this.encoding
  })
  
}

HexaDB.Triple = require( './triple' )

HexaDB.TripleStream = require( './triple-stream' )

/**
 * HexaDB Prototype
 * @type {Object}
 */
HexaDB.prototype = {
  
  constructor: HexaDB,
  
  _buildQuery: function( pattern, options ) {
    
    var triple = HexaDB.Triple.create( pattern )
    var key = triple.getPattern()
    
    var query = {
      fillCache: true,
      limit: typeof options.limit === 'number' ? limit : -1,
      highWaterMark: 16,
      valueEncoding: 'binary',
    }
    
    query.reverse = !!options.reverse
    query.start = query.reverse ? key + '\xff' : key
    query.end = query.reverse ? key : key + '\xff'
    
    return query
    
  },
  
  /**
   * Register a type with the msgpack encoder
   * @param  {Number}   type
   * @param  {Function} ctor
   * @param  {Function} encode( object )
   * @param  {Function} decode( buffer )
   * @return {HexaDB}
   */
  registerType: function( type, ctor, encode, decode ) {
    this.format.register( type, ctor, encode, decode )
    return this
  },
  
  get: function( pattern, options, callback ) {
    
    if( typeof options === 'function' ) {
      callback = options
      options = null
    }
    
    options = options != null ?
      options : {}
    
    var self = this
    var done = callback.bind( this )
    var values = []
    
    var tripleStream = new HexaDB.TripleStream( this )
    var stream = this.graph.createValueStream(
      this._buildQuery( pattern, options )
    )
    
    stream.pipe( tripleStream )
    
    tripleStream.on( 'error', done )
    tripleStream.on( 'readable', function() {
      var value, data = null
      while( value = this.read() ) {
        values.push( value )
      }
    })
    
    tripleStream.on( 'end', function() {
      done( null, values )
    })
    
  },
  
  put: function( triple, callback ) {
    
    var self = this
    var done = callback.bind( this )
    var triple = HexaDB.Triple.create( triple )
    var tripleHash = triple.getHash()
    
    // Determine which hashes have to be inserted, and
    // only insert data that's not in the data store yet
    async.reject([
      tripleHash.subject,
      tripleHash.predicate,
      tripleHash.object,
    ], this.data.get, function( result ) {
      
      var batch = []
      
      // Only add missing data to the batch op
      if( !~result.indexOf( tripleHash.subject ) )
        batch.push({ type: 'put', key: tripleHash.subject, value: triple.subject })
      if( !~result.indexOf( tripleHash.predicate ) )
        batch.push({ type: 'put', key: tripleHash.predicate, value: triple.predicate })
      if( !~result.indexOf( tripleHash.object ) )
        batch.push({ type: 'put', key: tripleHash.object, value: triple.object })
      
      self.data.batch( batch, function( error ) {
        
        if( error != null )
          return done( error )
        
        // Generate all six permutation indices
        var keys = triple.generateKeys()
        // The SPO index = identity index,
        // used for triple data retrieval in .get()
        // NOTE: By using a single identity for all six
        // indices, we allow for good compression of values
        var identity = keys[0]
        // Generate the batch ops
        var batch = keys.map( function( key ) {
          return { type: 'put', key: key, value: identity }
        })
        
        self.graph.batch( batch, done )
        
      })
      
    })
    
    return this
    
  },
  
  delete: function( triples, callback ) {
    var done = callback.bind( this )
    done( new Error( 'Not implemented' ) )
  },
  
  update: function( triples, callback ) {
    var done = callback.bind( this )
    done( new Error( 'Not implemented' ) )
  },
  
  search: function( triples, callback ) {
    var done = callback.bind( this )
    done( new Error( 'Not implemented' ) )
  },
  
  navigate: function( start ) {
    // return new Navigator( this, start )
  },
  
  getStream: function( options ) {
    var done = callback.bind( this )
    done( new Error( 'Not implemented' ) )
  },
  
  putStream: function( options ) {
    var done = callback.bind( this )
    done( new Error( 'Not implemented' ) )
  },
  
  deleteStream: function( options ) {
    var done = callback.bind( this )
    done( new Error( 'Not implemented' ) )
  },
  
  searchStream: function( options ) {
    var done = callback.bind( this )
    done( new Error( 'Not implemented' ) )
  },
  
}

// Exports
module.exports = HexaDB

