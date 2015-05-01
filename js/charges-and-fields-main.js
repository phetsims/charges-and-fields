// Copyright 2002-2015, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 */
define( function( require ) {
  'use strict';

  // modules
  var CanvasWarningNode = require( 'SCENERY_PHET/CanvasWarningNode' );
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var ChargesAndFieldsGlobals = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsGlobals' );
  var ChargesAndFieldsScreen = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsScreen' );
  var GlobalOptionsNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/GlobalOptionsNode' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  var simTitle = require( 'string!CHARGES_AND_FIELDS/charges-and-fields.name' );

  // the enhanced version has the capability of drawing electric field lines by double clicking on the electric field sensor nodes
  var isEnhancedVersion = true;

  var simOptions = {
    credits: {

      // all credits fields are optional
      leadDesign: 'Amy Rouinfar, Michael Dubson',
      softwareDevelopment: 'Martin Veillette, Jonathan Olson, Micheal Dubson',
      team: 'Ariel Paul, Kathy Perkins',
      qualityAssurance: 'Steele Dalton, Oliver Orejola'
    },
    optionsNode: new GlobalOptionsNode( isEnhancedVersion ),
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