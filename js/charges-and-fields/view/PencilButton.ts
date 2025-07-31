// Copyright 2015-2025, University of Colorado Boulder

/**
 * RectangularPushButton with a pencil icon.
 *
 * @author Martin Veillette (Berea College)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import RectangularPushButton, { RectangularPushButtonOptions } from '../../../../sun/js/buttons/RectangularPushButton.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import pencil_png from '../../../mipmaps/pencil_png.js';
import chargesAndFields from '../../chargesAndFields.js';

type SelfOptions = {
  iconWidth?: number;
  iconHeight?: number;
};

type PencilButtonOptions = SelfOptions & RectangularPushButtonOptions;

export default class PencilButton extends RectangularPushButton {

  public constructor( tandem: Tandem, providedOptions?: PencilButtonOptions ) {

    const options = optionize<PencilButtonOptions, SelfOptions, RectangularPushButtonOptions>()( {
      iconWidth: 26,
      iconHeight: 20,
      tandem: tandem
    }, providedOptions );

    // pencil icon
    options.content = new Image( pencil_png, { tandem: options.tandem.createTandem( 'pencilButtonImage' ) } );
    options.content.scale( options.iconWidth / options.content.width, options.iconHeight / options.content.height );

    super( options );
  }
}

chargesAndFields.register( 'PencilButton', PencilButton );