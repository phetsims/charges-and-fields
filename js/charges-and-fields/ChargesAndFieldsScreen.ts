// Copyright 2014-2025, University of Colorado Boulder

/**
 * Charges and Fields main Screen
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import Screen from '../../../joist/js/Screen.js';
import Tandem from '../../../tandem/js/Tandem.js';
import chargesAndFields from '../chargesAndFields.js';
import ChargesAndFieldsColors from './ChargesAndFieldsColors.js';
import ChargesAndFieldsModel from './model/ChargesAndFieldsModel.js';
import ChargesAndFieldsScreenView from './view/ChargesAndFieldsScreenView.js';

export default class ChargesAndFieldsScreen extends Screen<ChargesAndFieldsModel, ChargesAndFieldsScreenView> {

  public constructor( tandem: Tandem ) {
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