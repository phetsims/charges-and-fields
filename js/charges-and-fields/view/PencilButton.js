// Copyright 2015, University of Colorado Boulder

/**
 * RectangularPushButton with a pencil icon.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var inherit = require( 'PHET_CORE/inherit' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var Tandem = require( 'TANDEM/Tandem' );
  var TandemImage = require( 'TANDEM/scenery/nodes/TandemImage' );

  // images
  var pencilImage = require( 'mipmap!CHARGES_AND_FIELDS/pencil.png,level=5' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function PencilButton( options ) {

    options = _.extend( {
      iconWidth: 26,
      iconHeight: 20,
      tandem: Tandem.tandemRequired()
    }, options );

    // pencil icon
    options.content = new TandemImage( pencilImage, { tandem: options.tandem.createTandem( 'pencilButtonImage' ) } );
    options.content.scale( options.iconWidth / options.content.width, options.iconHeight / options.content.height );

    RectangularPushButton.call( this, options );
  }

  chargesAndFields.register( 'PencilButton', PencilButton );

  return inherit( RectangularPushButton, PencilButton );
} );