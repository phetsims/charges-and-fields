// Copyright 2014-2021, University of Colorado Boulder

/**
 * Charges and Fields main Screen
 */

import Screen from '../../../joist/js/Screen.js';
import chargesAndFields from '../chargesAndFields.js';
import ChargesAndFieldsColors from './ChargesAndFieldsColors.js';
import ChargesAndFieldsModel from './model/ChargesAndFieldsModel.js';
import ChargesAndFieldsScreenView from './view/ChargesAndFieldsScreenView.js';

class ChargesAndFieldsScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {
    const options = {
      backgroundColorProperty: ChargesAndFieldsColors.backgroundProperty,
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