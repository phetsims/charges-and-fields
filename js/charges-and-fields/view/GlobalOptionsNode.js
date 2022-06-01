// Copyright 2015-2022, University of Colorado Boulder

/**
 * Global options shown in the "Options" dialog from the PhET Menu.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import OptionsDialog from '../../../../joist/js/OptionsDialog.js';
import ProjectorModeCheckbox from '../../../../joist/js/ProjectorModeCheckbox.js';
import { VBox } from '../../../../scenery/js/imports.js';
import chargesAndFields from '../../chargesAndFields.js';

class GlobalOptionsNode extends VBox {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const projectorCheckbox = new ProjectorModeCheckbox( {
      tandem: tandem.createTandem( 'projectorCheckbox' ),
      phetioDocumentation: 'The checkbox that toggles if projector mode is enabled.'
    } );

    super( {
      children: [ projectorCheckbox ],
      spacing: OptionsDialog.DEFAULT_SPACING,
      align: 'left',
      tandem: tandem
    } );

    // @private
    this.disposeGlobalOptionsNode = () => {
      projectorCheckbox.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeGlobalOptionsNode();
    super.dispose();
  }
}

chargesAndFields.register( 'GlobalOptionsNode', GlobalOptionsNode );
export default GlobalOptionsNode;