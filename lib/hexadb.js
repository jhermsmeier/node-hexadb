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
  
  this.db = db
  this.level = sublevel( this.db, {
    keyEncoding: 'utf8',
    valueEncoding: this.encoding,
  })
  
  // Maps (s,p,o) hashes to each other
  this.graph = this.level.sublevel( 'graph' )
  // Maps values to hashes
  this.data = this.level.sublevel( 'data' )
  
}

/**
 * Query Variable Constructor
 * @type {Function}
 */
HexaDB.Variable = require( './variable' )

/**
 * Triple Constructor
 * @type {Function}
 */
HexaDB.Triple = require( './triple' )

/**
 * TripleStream that converts decoded values
 * to instances of HexaDB.Triple
 * @type {Function}
 */
HexaDB.TripleStream = require( './triple-stream' )

/**
 * Query Constructor
 * @type {Function}
 */
HexaDB.Query = require( './query' )

/**
 * Solution Constructor
 * @type {Function}
 */
HexaDB.Solution = require( './solution' )

/**
 * HexaDB Prototype
 * @type {Object}
 */
HexaDB.prototype = {
  
  constructor: HexaDB,
  
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
  
  approximateSize: function( start, end, callback ) {
    
    var self = this
    var done = callback.bind( this )
    
    // TODO: Generate triple indices, and key range
    // to use as `start` & `end` to determine the approximate
    // size in bytes of the given triple range
    
    setImmediate( function() {
      done( new Error( 'Not implemented' ) )
    })
    
    return this
    
    // if( this.db.db && this.db.db.approximateSize ) {
    //   this.db.db.approximateSize( start, end )
    // }
    
  },
  
  /**
   * Retrieves triples matching the given triple pattern
   * @param  {Triple}   pattern
   * @param  {Object}   options
   * @param  {Function} callback
   * @return {HexaDB}
   */
  get: function( pattern, options, callback ) {
    
    if( typeof options === 'function' ) {
      callback = options
      options = null
    }
    
    var done = callback.bind( this )
    var values = []
    
    var tripleStream = this.getStream( pattern, options )
    
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
  
  /**
   * Stores a given triple in the database
   * @param  {Triple}   triple
   * @param  {Function} callback
   * @return {HexaDB}
   */
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
  
  /**
   * Deletes a given triple from the database
   * @param  {Triple}   triple
   * @param  {Function} callback
   * @return {HexaDB}
   */
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
  
  /**
   * Replaces a given triple with another triple
   * @param  {Triple}   oldTriple
   * @param  {Triple}   newTriple
   * @param  {Function} callback
   * @return {HexaDB}
   */
  update: function( oldTriple, newTriple, callback ) {
    
    var self = this
    var done = callback.bind( this )
    
    this.delete( oldTriple, function( error ) {
      if( error != null )
        return done( error )
      self.put( newTriple, done )
    })
    
    return this
    
  },
  
  /**
   * Searches witha given query
   * @param  {Array}    query
   * @param  {Object}   options
   * @param  {Function} callback
   * @return {HexaDB}
   */
  search: function( query, options, callback ) {
    
    if( typeof options === 'function' ) {
      callback = options
      options = null
    }
    
    var self = this
    var done = callback.bind( this )
    var result = []
    
    this.searchStream( query, options )
      .on( 'error', done )
      .on( 'readable', function() {
        var value = null
        while( value = this.read() ) {
          result.push( value )
        }
      })
      .on( 'end', function() {
        done( null, result )
      })
    
    return this
    
  },
  
  navigate: function( start ) {
    // return new Navigator( this, start )
  },
  
  getStream: function( pattern, options ) {
    
    options = options != null ?
      options : {}
    
    var query = !( pattern instanceof HexaDB.Query ) ?
      new HexaDB.Query( pattern, options ) :
      pattern
    
    var tripleStream = new HexaDB.TripleStream( this )
    var stream = this.graph.createValueStream( query )
    
    tripleStream.query = query
    
    return stream.pipe( tripleStream )
    
  },
  
  putStream: function( options ) {
    var done = callback.bind( this )
    done( new Error( 'Not implemented' ) )
  },
  
  deleteStream: function( options ) {
    var done = callback.bind( this )
    done( new Error( 'Not implemented' ) )
  },
  
  /**
   * Creates a search stream
   * @param  {Array}  query
   * @param  {Object} options
   * @return {Stream}
   */
  searchStream: function( query, options ) {
    
    var self = this
    var solution = new HexaDB.Solution()
    
    // Map triple patterns (query elements) to queries,
    // and immediately bind variables to solution
    var queries = query.map( function( pattern ) {
      return new HexaDB.Query( pattern, options )
    })
    
    // Order queries by approximate size (smallest first)
    // TODO: Maybe utilize db.approximateSize() (slower?)
    queries.sort( function( a, b ) {
      var x = Object.keys( a.variables ).length
      var y = Object.keys( b.variables ).length
      if( x < y ) return -1
      if( x > y ) return  1
      return 0
    })
    
    queries.forEach( function( query ) {
      query.bindTo( solution )
    })
    
    var iteration = 0
    
    // Run each query in series, piping each one into the solution
    async.eachSeries( queries, function iterator( query, next ) {
      
      var stream = self.getStream( query, options )
      
      // Automatically end() the solution with the
      // end of the last query
      stream.pipe( solution, {
        end: iteration++ === queries.length - 1
      })
      
      stream.on( 'error', next )
      stream.on( 'end', function() {
        this.unpipe( solution )
        next()
      })
      
    })
    
    return solution
    
  },
  
}

// Exports
module.exports = HexaDB

