// Copyright 2002-2014, University of Colorado Boulder

/**
 * Global settings and quality information
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var Property = require( 'AXON/Property' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Util = require( 'SCENERY/util/Util' );

  var ChargesAndFieldsGlobals = new PropertySet( {
    isElectricFieldLinesSupported: !!phet.chipper.getQueryParameter( 'electricFieldLines' ) || false,
    projectorColors: !!phet.chipper.getQueryParameter( 'projector' ) || false
  } );

  return _.extend( ChargesAndFieldsGlobals, {
    disallowWebGL : phet.chipper.getQueryParameter( 'webgl' ) === 'false',

    /*
     * Applies color changes to the material's color field, and also does so immediately upon being called.
     *
     * @param {THREE.Material} material
     * @param {Property.<Color>} colorProperty
     * @returns A callback that will unlink
     */
    linkColor: function( material, colorProperty ) {
      var colorListener = function( color ) {
        material.color.setHex( color.toNumber() );
      };
      colorProperty.link( colorListener );
      return function() {
        colorProperty.unlink( colorListener );
      };
    },

    /*
     * Applies color changes to the material's color and ambient fields, and also does so immediately upon being called.
     *
     * @param {THREE.Material} material
     * @param {Property.<Color>} colorProperty
     * @returns {Function} A callback that will unlink
     */
    linkColorAndAmbient: function( material, colorProperty ) {
      var colorListener = function( color ) {
        material.color.setHex( color.toNumber() );
        material.ambient.setHex( color.toNumber() );
      };
      colorProperty.link( colorListener );
      return function() {
        colorProperty.unlink( colorListener );
      };
    },

    /**
     * Returns a color property
     * @param {string||Color} color
     * @returns {Property.<Color>}
     */
    toColorProperty: function( color ) {
      // for now, cast it into place
      var colorProperty;
      if ( typeof color === 'string' ) {
        color = new Color( color );
      }
      if ( color instanceof Color ) {
        colorProperty = new Property( color );
      }
      else if ( color instanceof Property ) {
        colorProperty = color;
      }
      else {
        throw new Error( 'bad color passed to ChargesAndFieldsGlobals.toColorProperty' );
      }
      return colorProperty;
    }
  } );
} );