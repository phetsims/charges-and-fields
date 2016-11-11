// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'PHET_IO/assertions/assertInstanceOf' );
  var phetioNamespace = require( 'PHET_IO/phetioNamespace' );
  var phetioInherit = require( 'PHET_IO/phetioInherit' );
  var TModelElement = require( 'PHET_IO/simulations/charges-and-fields/TModelElement' );
  var TNumber = require( 'PHET_IO/types/TNumber' );
  var TVector2 = require( 'PHET_IO/types/dot/TVector2' );
  var TVoid = require( 'PHET_IO/types/TVoid' );
  var TObject = require( 'PHET_IO/types/TObject' );

  var TChargedParticle = function( instance, phetioID ) {
    assertInstanceOf( instance, phet.chargesAndFields.ChargedParticle );
    TModelElement.call( this, instance, phetioID );
  };

  phetioInherit( TModelElement, 'TChargedParticle', TChargedParticle, {
    setCharge: {
      returnType: TVoid,
      parameterTypes: [ TNumber() ],
      implementation: function( value ) {
        this.instance.charge = value.charge;
      },
      documentation: 'Set charge (in units of e)'
    },

    setValue: {
      returnType: TVoid,
      parameterTypes: [ TObject ],
      implementation: function( value ) {
        this.instance.charge = value.charge;
        this.instance.initialPosition = TVector2.fromStateObject( value.initialPosition );
      },
      documentation: 'Called by setState in the state wrapper.'
    }
  }, {

    /**
     * When the state is loaded back, create a ChargedParticle.
     * @param {string} id - the full phetioID to be registered with a tandem
     * @param {Object} value - the value that would be used with setValue, which can be used to customize the object creation.
     * @returns {ChargedParticle}
     */
    create: function( id, value ) {

      // In Charges and Fields, the model creates the charges and adds them to lists.
      var model = phetio.getInstance( 'chargesAndFields.chargesAndFieldsScreen.model' );
      if ( value.charge > 0 ) {
        return model.addPositiveCharge( new phet.tandem.Tandem( id ) );
      }
      else {
        return model.addNegativeCharge( new phet.tandem.Tandem( id ) );
      }
    },

    fromStateObject: function( stateObject ) {
      return stateObject;
    },

    toStateObject: function( value ) {
      return {
        charge: value.charge,
        initialPosition: value.initialPosition ? TVector2.toStateObject( value.initialPosition ) : null
      };
    }
  } );

  phetioNamespace.register( 'TChargedParticle', TChargedParticle );

  return TChargedParticle;
} );

