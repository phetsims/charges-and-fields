// Copyright 2015-2019, University of Colorado Boulder

/**
 * Global options shown in the "Options" dialog from the PhET Menu.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  const ChargesAndFieldsColorProfile = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColorProfile' );
  const LayoutBox = require( 'SCENERY/nodes/LayoutBox' );
  const merge = require( 'PHET_CORE/merge' );
  const OptionsDialog = require( 'JOIST/OptionsDialog' );
  const ProjectorModeCheckbox = require( 'JOIST/ProjectorModeCheckbox' );

  class GlobalOptionsNode extends LayoutBox {

    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {

      const projectorCheckbox = new ProjectorModeCheckbox( ChargesAndFieldsColorProfile, {
        tandem: tandem.createTandem( 'projectorCheckbox' ),
        phetioDocumentation: 'The checkbox that toggles if projector mode is enabled.'
      } );

      super( merge( {
        children: [ projectorCheckbox ],
        spacing: OptionsDialog.DEFAULT_SPACING,
        align: 'left',
        tandem: tandem
      } ) );
    }
  }

  return chargesAndFields.register( 'GlobalOptionsNode', GlobalOptionsNode );
} );
