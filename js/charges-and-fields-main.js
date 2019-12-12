// Copyright 2014-2019, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const ChargesAndFieldsScreen = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsScreen' );
  const GlobalOptionsNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/GlobalOptionsNode' );
  const Sim = require( 'JOIST/Sim' );
  const SimLauncher = require( 'JOIST/SimLauncher' );
  const Tandem = require( 'TANDEM/Tandem' );

  // strings
  const chargesAndFieldsTitleString = require( 'string!CHARGES_AND_FIELDS/charges-and-fields.title' );

  const tandem = Tandem.ROOT;

  const simOptions = {
    credits: {

      // all credits fields are optional
      leadDesign: 'Michael Dubson, Amy Rouinfar',
      softwareDevelopment: 'Andrew Adare, Michael Dubson, Jonathan Olson, Martin Veillette',
      team: 'Ariel Paul, Kathy Perkins',
      qualityAssurance: 'Steele Dalton, Amanda Davis, Bryce Griebenow, Elise Morgan, Oliver Orejola, Ben Roberts, Bryan Yoelin'
    },
    createOptionsDialogContent: tandem => new GlobalOptionsNode( tandem ),
    webgl: true
  };

  SimLauncher.launch( () => {
    const sim = new Sim( chargesAndFieldsTitleString, [
      new ChargesAndFieldsScreen( tandem.createTandem( 'chargesAndFieldsScreen' ) )
    ], simOptions );
    sim.start();
  } );
} );

