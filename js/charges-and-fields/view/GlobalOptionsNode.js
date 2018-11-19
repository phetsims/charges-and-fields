// Copyright 2015-2018, University of Colorado Boulder

/**
 * Global options shown in the "Options" dialog from the PhET Menu
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var ChargesAndFieldsGlobals = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsGlobals' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LayoutBox = require( 'SCENERY/nodes/LayoutBox' );
  var OptionsDialog = require( 'JOIST/OptionsDialog' );
  var ProjectorModeCheckbox = require( 'JOIST/ProjectorModeCheckbox' );

  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function GlobalOptionsNode( tandem ) {

    var projectorCheckbox = new ProjectorModeCheckbox( {
      projectorModeEnabledProperty: ChargesAndFieldsGlobals.projectorColorsProperty,
      tandem: tandem.createTandem( 'projectorCheckbox' ),
      phetioDocumentation: 'The checkbox that toggles if projector mode is enabled.'
    } );

    LayoutBox.call( this, _.extend( {
      children: [ projectorCheckbox ],
      spacing: OptionsDialog.DEFAULT_SPACING,
      align: 'left',
      tandem: tandem
    } ) );
  }

  chargesAndFields.register( 'GlobalOptionsNode', GlobalOptionsNode );

  return inherit( LayoutBox, GlobalOptionsNode );
} );
