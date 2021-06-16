[object Promise]

/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import chargesAndFieldsStrings from './chargesAndFieldsStrings.js';
import ChargesAndFieldsScreen from './charges-and-fields/ChargesAndFieldsScreen.js';
import GlobalOptionsNode from './charges-and-fields/view/GlobalOptionsNode.js';

const chargesAndFieldsTitleString = chargesAndFieldsStrings[ 'charges-and-fields' ].title;

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

simLauncher.launch( () => {
  const sim = new Sim( chargesAndFieldsTitleString, [
    new ChargesAndFieldsScreen( tandem.createTandem( 'chargesAndFieldsScreen' ) )
  ], simOptions );
  sim.start();
} );