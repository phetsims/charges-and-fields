// Copyright 2014-2022, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import PreferencesModel from '../../joist/js/preferences/PreferencesModel.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import ChargesAndFieldsScreen from './charges-and-fields/ChargesAndFieldsScreen.js';
import ChargesAndFieldsStrings from './ChargesAndFieldsStrings.js';

const chargesAndFieldsTitleStringProperty = ChargesAndFieldsStrings[ 'charges-and-fields' ].titleStringProperty;

const tandem = Tandem.ROOT;

const simOptions = {
  credits: {

    // all credits fields are optional
    leadDesign: 'Michael Dubson, Amy Rouinfar',
    softwareDevelopment: 'Andrew Adare, Michael Dubson, Jonathan Olson, Martin Veillette',
    team: 'Ariel Paul, Kathy Perkins',
    qualityAssurance: 'Steele Dalton, Amanda Davis, Bryce Griebenow, Elise Morgan, Oliver Orejola, Ben Roberts, Bryan Yoelin'
  },

  webgl: true,
  preferencesModel: new PreferencesModel( {
    visualOptions: {
      supportsProjectorMode: true
    }
  } )
};

simLauncher.launch( () => {
  const sim = new Sim( chargesAndFieldsTitleStringProperty, [
    new ChargesAndFieldsScreen( tandem.createTandem( 'chargesAndFieldsScreen' ) )
  ], simOptions );
  sim.start();
} );