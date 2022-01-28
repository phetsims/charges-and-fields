// Copyright 2015-2022, University of Colorado Boulder

/**
 * RectangularPushButton with a pencil icon.
 *
 * @author Martin Veillette (Berea College)
 */

import merge from '../../../../phet-core/js/merge.js';
import { Image } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import pencil_png from '../../../mipmaps/pencil_png.js';
import chargesAndFields from '../../chargesAndFields.js';

class PencilButton extends RectangularPushButton {

  /**
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( tandem, options ) {
    options = merge( {
      iconWidth: 26,
      iconHeight: 20,
      tandem: tandem
    }, options );

    // pencil icon
    options.content = new Image( pencil_png, { tandem: options.tandem.createTandem( 'pencilButtonImage' ) } );
    options.content.scale( options.iconWidth / options.content.width, options.iconHeight / options.content.height );

    super( options );
  }
}

chargesAndFields.register( 'PencilButton', PencilButton );
export default PencilButton;