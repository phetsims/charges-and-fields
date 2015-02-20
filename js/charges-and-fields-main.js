//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 */
define( function( require ) {
  'use strict';

  // modules
  var CanvasWarningNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/CanvasWarningNode' );
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var ChargesAndFieldsGlobals = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsGlobals' );
  var ChargesAndFieldsScreen = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsScreen' );
  var GlobalOptionsNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/GlobalOptionsNode' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  var simTitle = require( 'string!CHARGES_AND_FIELDS/charges-and-fields.name' );

  var isBasicsVersion = false; // Do you want to be able to draw electric Field Lines?

  var simOptions = {
    credits: {

      // all credits fields are optional
      leadDesign: 'Amy Rouinfar, Michael Dubson',
      softwareDevelopment: 'Martin Veillette, Michael Dubson',
      designTeam: 'Ariel Paul, Amy Rouinfar, Kathy Perkins'
    },
    optionsNode: new GlobalOptionsNode( isBasicsVersion ),
    homeScreenWarningNode: ChargesAndFieldsGlobals.useWebGL ? null : new CanvasWarningNode()
  };

  ChargesAndFieldsGlobals.projectorColorsProperty.link( function( useProjectorColors ) {
    if ( useProjectorColors ) {
      ChargesAndFieldsColors.applyProfile( 'projector' );
    }
    else {
      ChargesAndFieldsColors.applyProfile( 'default' );
    }
  } );

  // Appending '?dev' to the URL will enable developer-only features.
  if ( phet.chipper.getQueryParameter( 'dev' ) ) {
    simOptions = _.extend( {
      // add dev-specific options here
    }, simOptions );
  }

  SimLauncher.launch( function() {
    var sim = new Sim( simTitle, [ new ChargesAndFieldsScreen() ], simOptions );
    sim.start();
  } );
} );