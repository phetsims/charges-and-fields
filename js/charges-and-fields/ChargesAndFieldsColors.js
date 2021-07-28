// Copyright 2015-2021, University of Colorado Boulder

/**
 * Location for most colors of the simulation (especially those that could be tweaked)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Martin Veillette (Berea College)
 * @author Andrew Adare <andrew.adare@colorado.edu>
 */

import Color from '../../../scenery/js/util/Color.js';
import ProfileColorProperty from '../../../scenery/js/util/ProfileColorProperty.js';
import chargesAndFields from '../chargesAndFields.js';

// constants
const BLACK = new Color( 0, 0, 0 );
const WHITE = new Color( 255, 255, 255 );
const RED = new Color( 255, 0, 0 );
const BLUE = new Color( 0, 0, 255 );

const ChargesAndFieldsColors = {
  backgroundProperty: new ProfileColorProperty( 'background', {
    default: BLACK,
    projector: WHITE
  } ),
  reversedBackgroundProperty: new ProfileColorProperty( 'reversedBackground', {
    default: WHITE,
    projector: BLACK
  } ),
  controlPanelBorderProperty: new ProfileColorProperty( 'controlPanelBorder', {
    default: new Color( 210, 210, 210 ),
    projector: new Color( 192, 192, 192 )
  } ),
  controlPanelFillProperty: new ProfileColorProperty( 'controlPanelFill', {
    default: new Color( 10, 10, 10 ),
    projector: new Color( 238, 238, 238 )
  } ),
  controlPanelTextProperty: new ProfileColorProperty( 'controlPanelText', {
    default: new Color( 229, 229, 126 ),
    projector: BLACK
  } ),
  enclosureTextProperty: new ProfileColorProperty( 'enclosureText', {
    default: WHITE,
    projector: BLACK
  } ),
  enclosureFillProperty: new ProfileColorProperty( 'enclosureFill', {
    default: new Color( 10, 10, 10 ),
    projector: new Color( 238, 238, 238 )
  } ),
  enclosureBorderProperty: new ProfileColorProperty( 'enclosureBorder', {
    default: new Color( 210, 210, 210 ),
    projector: new Color( 192, 192, 192 )
  } ),
  checkboxProperty: new ProfileColorProperty( 'checkbox', {
    default: new Color( 230, 230, 230 ),
    projector: BLACK
  } ),
  checkboxBackgroundProperty: new ProfileColorProperty( 'checkboxBackground', {
    default: new Color( 30, 30, 30 ),
    projector: WHITE
  } ),
  voltageLabelProperty: new ProfileColorProperty( 'voltageLabel', {
    default: WHITE,
    projector: BLACK
  } ),
  voltageLabelBackgroundProperty: new ProfileColorProperty( 'voltageLabelBackground', {
    default: new Color( 0, 0, 0, 0.5 ),
    projector: new Color( 255, 255, 255, 0.5 )
  } ),
  electricPotentialLineProperty: new ProfileColorProperty( 'electricPotentialLine', {
    default: new Color( 50, 255, 100 ),
    projector: BLACK
  } ),
  measuringTapeTextProperty: new ProfileColorProperty( 'measuringTapeText', {
    default: WHITE,
    projector: BLACK
  } ),
  electricFieldSensorCircleFillProperty: new ProfileColorProperty( 'electricFieldSensorCircleFill', {
    default: new Color( 255, 255, 0 ),
    projector: new Color( 255, 153, 0 )
  } ),
  electricFieldSensorCircleStrokeProperty: new ProfileColorProperty( 'electricFieldSensorCircleStroke', {
    default: new Color( 128, 120, 133 ),
    projector: BLACK
  } ),
  electricFieldSensorArrowProperty: new ProfileColorProperty( 'electricFieldSensorArrow', {
    default: RED,
    projector: RED
  } ),
  electricFieldSensorLabelProperty: new ProfileColorProperty( 'electricFieldSensorLabel', {
    default: new Color( 229, 229, 126 ),
    projector: BLACK
  } ),
  gridStrokeProperty: new ProfileColorProperty( 'gridStroke', {
    default: new Color( 50, 50, 50 ),
    projector: new Color( 255, 204, 51 )
  } ),
  gridLengthScaleArrowStrokeProperty: new ProfileColorProperty( 'gridLengthScaleArrowStroke', {
    default: WHITE,
    projector: RED
  } ),
  gridLengthScaleArrowFillProperty: new ProfileColorProperty( 'gridLengthScaleArrowFill', {
    default: WHITE,
    projector: new Color( 255, 153, 0 )
  } ),
  gridTextFillProperty: new ProfileColorProperty( 'gridTextFill', {
    default: WHITE,
    projector: BLACK
  } ),
  electricPotentialSensorCircleStrokeProperty: new ProfileColorProperty( 'electricPotentialSensorCircleStroke', {
    default: WHITE,
    projector: BLACK
  } ),
  electricPotentialSensorCrosshairStrokeProperty: new ProfileColorProperty( 'electricPotentialSensorCrosshairStroke', {
    default: WHITE,
    projector: BLACK
  } ),
  electricPotentialPanelTitleTextProperty: new ProfileColorProperty( 'electricPotentialPanelTitleText', {
    default: WHITE,
    projector: WHITE
  } ),
  electricPotentialSensorTextPanelTextFillProperty: new ProfileColorProperty( 'electricPotentialSensorTextPanelTextFill', {
    default: BLACK,
    projector: BLACK
  } ),
  electricPotentialSensorTextPanelBorderProperty: new ProfileColorProperty( 'electricPotentialSensorTextPanelBorder', {
    default: BLACK,
    projector: new Color( 250, 250, 250 )
  } ),
  electricPotentialSensorTextPanelBackgroundProperty: new ProfileColorProperty( 'electricPotentialSensorTextPanelBackground', {
    default: WHITE,
    projector: WHITE
  } ),
  electricFieldGridSaturationProperty: new ProfileColorProperty( 'electricFieldGridSaturation', {
    default: WHITE,
    projector: RED
  } ),
  electricFieldGridSaturationStrokeProperty: new ProfileColorProperty( 'electricFieldGridSaturationStroke', {
    default: BLACK,
    projector: BLACK
  } ),
  electricFieldGridZeroProperty: new ProfileColorProperty( 'electricFieldGridZero', {
    default: BLACK,
    projector: WHITE
  } ),
  electricPotentialGridSaturationPositiveProperty: new ProfileColorProperty( 'electricPotentialGridSaturationPositive', {
    default: new Color( 210, 0, 0 ),
    projector: new Color( 210, 0, 0 )
  } ),
  electricPotentialGridZeroProperty: new ProfileColorProperty( 'electricPotentialGridZero', {
    default: BLACK,
    projector: WHITE
  } ),
  electricPotentialGridSaturationNegativeProperty: new ProfileColorProperty( 'electricPotentialGridSaturationNegative', {
    default: BLUE,
    projector: BLUE
  } )
};

chargesAndFields.register( 'ChargesAndFieldsColors', ChargesAndFieldsColors );

export default ChargesAndFieldsColors;