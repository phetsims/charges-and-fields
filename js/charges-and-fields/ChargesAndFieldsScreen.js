// Copyright 2014-2019, University of Colorado Boulder

/**
 * Charges and Fields main Screen
 */

import Screen from '../../../joist/js/Screen.js';
import chargesAndFields from '../chargesAndFields.js';
import ChargesAndFieldsColorProfile from './ChargesAndFieldsColorProfile.js';
import ChargesAndFieldsModel from './model/ChargesAndFieldsModel.js';
import ChargesAndFieldsScreenView from './view/ChargesAndFieldsScreenView.js';

class ChargesAndFieldsScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {
    const options = {
      backgroundColorProperty: ChargesAndFieldsColorProfile.backgroundProperty,
      tandem: tandem
    };

    super(
      () => new ChargesAndFieldsModel( tandem.createTandem( 'model' ) ),
      model => new ChargesAndFieldsScreenView( model, tandem.createTandem( 'view' ) ),
      options );
  }
}

chargesAndFields.register( 'ChargesAndFieldsScreen', ChargesAndFieldsScreen );
export default ChargesAndFieldsScreen;