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
    encode: function( value ) {
      return this.format.encode( value )
        .slice() // bl != instanceof Buffer
    }.bind( this ),
    decode: this.format.decode,
    buffer: true,
    type: 'msgpack',
  }
  
  // Maps (s,p,o) hashes to each other
  this.graph = this.db.sublevel( 'graph', {
    keyEncoding: 'utf8',
    valueEncoding: this.encoding,
  })
  
  // Maps values to hashes
  this.data = this.db.sublevel( 'data', {
    keyEncoding: 'utf8',
    valueEncoding: this.encoding,
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
    
    return this
    
  },
  
  put: function( triple, callback ) {
    
    var self = this
    var done = callback.bind( this )
    var triple = HexaDB.Triple.create( triple )
    
    if( triple.isSparse ) {
      return done( new Error( 'Triple must not be sparse' ) )
    }
    
    // Generate all six permutation indices
    var tripleKeys = triple.generateKeys()
    // The SPO index = identity index,
    // used for triple data retrieval in .get()
    // NOTE: By using a single identity for all six
    // indices, we allow for good compression of values
    var identity = tripleKeys[0]
    
    this.data.get( identity, function( error, value ) {
      
      if( error != null && !error.notFound )
        return done( error )
      
      async.series([
        function( next ) {
          if( error == null || !error.notFound )
            return next()
          self.data.put( identity, triple.toArray(), next )
        },
        function( next ) {
          self.graph.batch( tripleKeys.map( function( key ) {
            return { type: 'put', key: key, value: identity }
          }), next )
        }
      ], done )
      
    })
    
    return this
    
  },
  
  delete: function( triple, callback ) {
    
    var self = this
    var done = callback.bind( this )
    var triple = HexaDB.Triple.create( triple )
    
    if( triple.isSparse ) {
      return done( new Error( 'Triple must not be sparse' ) )
    }
    
    var tripleKeys = triple.generateKeys()
    var identity = tripleKeys[0]
    var batch = tripleKeys.map( function( key ) {
      return { type: 'del', key: key }
    })
    
    async.series([
      this.data.del.bind( this.data, identity ),
      this.graph.batch.bind( this.graph, batch )
    ], done )
    
    return this
    
  },
  
  update: function( triple, callback ) {
    var done = callback.bind( this )
    done( new Error( 'Not implemented' ) )
  },
  
  search: function( triple, callback ) {
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

