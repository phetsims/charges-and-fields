// Copyright 2014-2015, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargesAndFieldsColorProfile = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColorProfile' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var ChargesAndFieldsGlobals = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsGlobals' );
  var ChargesAndFieldsScreen = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsScreen' );
  var GlobalOptionsNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/GlobalOptionsNode' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );
  var Tandem = require( 'TANDEM/Tandem' );

  // strings
  var chargesAndFieldsTitleString = require( 'string!CHARGES_AND_FIELDS/charges-and-fields.title' );

  var tandem = Tandem.createRootTandem();

  var simOptions = {
    credits: {

      // all credits fields are optional
      leadDesign: 'Michael Dubson, Amy Rouinfar',
      softwareDevelopment: 'Andrew Adare, Michael Dubson, Jonathan Olson, Martin Veillette',
      team: 'Ariel Paul, Kathy Perkins',
      qualityAssurance: 'Steele Dalton, Amanda Davis, Bryce Griebenow, Elise Morgan, Oliver Orejola, Ben Roberts, Bryan Yoelin'
    },
    optionsNode: new GlobalOptionsNode( ChargesAndFieldsConstants.GLOBALS_TANDEM.createTandem( 'options' ) )
  };

  ChargesAndFieldsGlobals.projectorColorsProperty.link( function( useProjectorColors ) {
    ChargesAndFieldsColorProfile.profileNameProperty.set( useProjectorColors ? 'projector' : 'default' );
  } );

  SimLauncher.launch( function() {
    var sim = new Sim( chargesAndFieldsTitleString, [
      new ChargesAndFieldsScreen( tandem.createTandem( 'chargesAndFieldsScreen' ) )
    ], simOptions );
    sim.start();
  } );
} );

