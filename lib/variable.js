/**
 * Variable Constructor
 * @return {Variable}
 */
function Variable( name ) {
  
  if( !(this instanceof Variable) )
    return new Variable( name )
  
  if( typeof name !== 'string' )
    throw new TypeError( 'Variable name must be a string' )
  
  this.name = name
  
}

/**
 * Variable Prototype
 * @type {Object}
 */
Variable.prototype = {
  
  constructor: Variable,
  
}

// Exports
module.exports = Variable
