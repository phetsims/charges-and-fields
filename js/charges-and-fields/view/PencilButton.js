// Copyright 2015-2017, University of Colorado Boulder

/**
 * RectangularPushButton with a pencil icon.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  const Image = require( 'SCENERY/nodes/Image' );
  const inherit = require( 'PHET_CORE/inherit' );
  const RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );

  // images
  const pencilImage = require( 'mipmap!CHARGES_AND_FIELDS/pencil.png,level=5' );

  /**
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function PencilButton( tandem, options ) {

    options = _.extend( {
      iconWidth: 26,
      iconHeight: 20,
      tandem: tandem
    }, options );

    // pencil icon
    options.content = new Image( pencilImage, { tandem: options.tandem.createTandem( 'pencilButtonImage' ) } );
    options.content.scale( options.iconWidth / options.content.width, options.iconHeight / options.content.height );

    RectangularPushButton.call( this, options );
  }

  chargesAndFields.register( 'PencilButton', PencilButton );

  return inherit( RectangularPushButton, PencilButton );
} );