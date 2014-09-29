var msgpack = require( 'msgpack5' )()

/**
 * Graph Constructor
 * @return {Graph}
 */
function Graph( db, options ) {
  
  if( !(this instanceof Graph) )
    return new Graph( db, options )
  
  options = options != null ?
    options : {}
  
  this.db = db
  
}

Graph.Triple = require( './triple' )
// Graph.Variable = require( './variable' )
// Graph.FilterStream = require( './filter-stream' )

Graph.Action = function Action( type, key, value ) {
  this.type = type
  this.key = key
  this.value = value
}

Graph.generateBatch = function( action, triple ) {
  
  var keys = triple.generateKeys()
  var actions = []
  
  for( var i = 0; i < keys.length; i++ ) {
    actions.push( new Graph.Action( action, keys[i], triple.pack() ) )
  }
  
  return actions
  
}

/**
 * Graph Prototype
 * @type {Object}
 */
Graph.prototype = {
  
  constructor: Graph,
  
  buildQuery: function( pattern, options ) {
    
    var triple = Graph.Triple.create( pattern )
    var index = triple.findIndex( options.index )
    var key = triple.generateKey( index )
    
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
  
  get: function( pattern, options, callback ) {
    
    pattern = pattern != null ?
      pattern : {}
    
    if( typeof options === 'function' ) {
      callback = options
      options = null
    }
    
    options = options != null ?
      options : {}
    
    callback = typeof callback === 'function' ?
      callback.bind( this ) : Function.prototype
    
    var values = []
    var query = this.buildQuery( pattern, options )
    
    return this.db.createValueStream( query )
      .on( 'error', callback )
      .on( 'readable', function() {
        var value, data = null
        while( value = this.read() ) {
          data = msgpack.decode( value )
          values.push( Graph.Triple.create( data ) )
        }
      })
      .on( 'end', function() {
        callback( null, values )
      })
    
  },
  
  put: function( values, callback ) {
    
    callback = typeof callback === 'function' ?
      callback.bind( this ) : Function.prototype
    
    var actions = []
    var triples = Array.isArray( values ) ?
      values : [ values ]
    
    for( var i = 0; i < triples.length; i++ ) {
      actions = actions.concat( Graph.generateBatch( 'put', triples[i] ) )
    }
    
    console.log( 'actions', actions )
    this.db.batch( actions, callback )
    
    return this
    
  },
  
  delete: function( values, callback ) {
    
    callback = typeof callback === 'function' ?
      callback.bind( this ) : Function.prototype
    
    var actions = []
    var triples = Array.isArray( values ) ?
      values : [ values ]
    
    for( var i = 0; i < triples.length; i++ ) {
      actions = actions.concat( Graph.generateBatch( 'del', triples[i] ) )
    }
    
    this.db.batch( actions, callback )
    
    return this
    
  },
  
  update: function( triples, callback ) {
    // ...
  },
  
  search: function( triples, callback ) {
    // ...
  },
  
  navigate: function( start ) {
    // return new Graph.Navigator( this, start )
  },
  
  getStream: function( options ) {
    // ...
  },
  
  putStream: function( options ) {
    // ...
  },
  
  deleteStream: function( options ) {
    // ...
  },
  
  searchStream: function( options ) {
    // ...
  },
  
  close: function( callback ) {
    // ...
  },
  
}

// Exports
module.exports = Graph
