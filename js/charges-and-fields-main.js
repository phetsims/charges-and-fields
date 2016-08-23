// Copyright 2014-2015, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var ChargesAndFieldsGlobals = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsGlobals' );
  var ChargesAndFieldsScreen = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsScreen' );
  var GlobalOptionsNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/GlobalOptionsNode' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );
  var Tandem = require( 'TANDEM/Tandem' );

  // If running as phet-io, load the API
  require( 'ifphetio!PHET_IO/simulations/charges-and-fields/charges-and-fields-api' );

  // strings
  var chargesAndFieldsTitleString = require( 'string!CHARGES_AND_FIELDS/charges-and-fields.title' );

  var tandem = Tandem.createRootTandem();

  var simOptions = {
    credits: {

      // all credits fields are optional
      leadDesign: 'Amy Rouinfar, Michael Dubson',
      softwareDevelopment: 'Martin Veillette, Jonathan Olson, Michael Dubson, Andrew Adare',
      team: 'Ariel Paul, Kathy Perkins',
      qualityAssurance: 'Steele Dalton, Elise Morgan, Oliver Orejola, Bryan Yoelin, Amanda Davis'
    },
    optionsNode: new GlobalOptionsNode( tandem.createTandem( 'options' ) )
  };

  ChargesAndFieldsGlobals.projectorColorsProperty.link( function( useProjectorColors ) {
    if ( useProjectorColors ) {
      ChargesAndFieldsColors.applyProfile( 'projector' );
    } else {
      ChargesAndFieldsColors.applyProfile( 'default' );
    }
  } );

  SimLauncher.launch( function() {
    var sim = new Sim( chargesAndFieldsTitleString, [ new ChargesAndFieldsScreen( tandem.createTandem( 'chargesAndFieldsScreen' ) ) ], simOptions );
    sim.start();
  } );
} );

