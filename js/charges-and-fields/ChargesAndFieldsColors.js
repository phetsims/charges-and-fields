// Copyright 2015-2022, University of Colorado Boulder

/**
 * Location for most colors of the simulation (especially those that could be tweaked)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Martin Veillette (Berea College)
 * @author Andrew Adare <andrew.adare@colorado.edu>
 */

import { Color, ProfileColorProperty } from '../../../scenery/js/imports.js';
import chargesAndFields from '../chargesAndFields.js';

// constants
const BLACK = new Color( 0, 0, 0 );
const WHITE = new Color( 255, 255, 255 );
const RED = new Color( 255, 0, 0 );
const BLUE = new Color( 0, 0, 255 );

const ChargesAndFieldsColors = {
  backgroundProperty: new ProfileColorProperty( chargesAndFields, 'background', {
    default: BLACK,
    projector: WHITE
  } ),
  reversedBackgroundProperty: new ProfileColorProperty( chargesAndFields, 'reversedBackground', {
    default: WHITE,
    projector: BLACK
  } ),
  controlPanelBorderProperty: new ProfileColorProperty( chargesAndFields, 'controlPanelBorder', {
    default: new Color( 210, 210, 210 ),
    projector: new Color( 192, 192, 192 )
  } ),
  controlPanelFillProperty: new ProfileColorProperty( chargesAndFields, 'controlPanelFill', {
    default: new Color( 10, 10, 10 ),
    projector: new Color( 238, 238, 238 )
  } ),
  controlPanelTextProperty: new ProfileColorProperty( chargesAndFields, 'controlPanelText', {
    default: new Color( 229, 229, 126 ),
    projector: BLACK
  } ),
  enclosureTextProperty: new ProfileColorProperty( chargesAndFields, 'enclosureText', {
    default: WHITE,
    projector: BLACK
  } ),
  enclosureFillProperty: new ProfileColorProperty( chargesAndFields, 'enclosureFill', {
    default: new Color( 10, 10, 10 ),
    projector: new Color( 238, 238, 238 )
  } ),
  enclosureBorderProperty: new ProfileColorProperty( chargesAndFields, 'enclosureBorder', {
    default: new Color( 210, 210, 210 ),
    projector: new Color( 192, 192, 192 )
  } ),
  checkboxProperty: new ProfileColorProperty( chargesAndFields, 'checkbox', {
    default: new Color( 230, 230, 230 ),
    projector: BLACK
  } ),
  checkboxBackgroundProperty: new ProfileColorProperty( chargesAndFields, 'checkboxBackground', {
    default: new Color( 30, 30, 30 ),
    projector: WHITE
  } ),
  voltageLabelProperty: new ProfileColorProperty( chargesAndFields, 'voltageLabel', {
    default: WHITE,
    projector: BLACK
  } ),
  voltageLabelBackgroundProperty: new ProfileColorProperty( chargesAndFields, 'voltageLabelBackground', {
    default: new Color( 0, 0, 0, 0.5 ),
    projector: new Color( 255, 255, 255, 0.5 )
  } ),
  electricPotentialLineProperty: new ProfileColorProperty( chargesAndFields, 'electricPotentialLine', {
    default: new Color( 50, 255, 100 ),
    projector: BLACK
  } ),
  measuringTapeTextProperty: new ProfileColorProperty( chargesAndFields, 'measuringTapeText', {
    default: WHITE,
    projector: BLACK
  } ),
  electricFieldSensorCircleFillProperty: new ProfileColorProperty( chargesAndFields, 'electricFieldSensorCircleFill', {
    default: new Color( 255, 255, 0 ),
    projector: new Color( 255, 153, 0 )
  } ),
  electricFieldSensorCircleStrokeProperty: new ProfileColorProperty( chargesAndFields, 'electricFieldSensorCircleStroke', {
    default: new Color( 128, 120, 133 ),
    projector: BLACK
  } ),
  electricFieldSensorArrowProperty: new ProfileColorProperty( chargesAndFields, 'electricFieldSensorArrow', {
    default: RED,
    projector: RED
  } ),
  electricFieldSensorLabelProperty: new ProfileColorProperty( chargesAndFields, 'electricFieldSensorLabel', {
    default: new Color( 229, 229, 126 ),
    projector: BLACK
  } ),
  gridStrokeProperty: new ProfileColorProperty( chargesAndFields, 'gridStroke', {
    default: new Color( 50, 50, 50 ),
    projector: new Color( 255, 204, 51 )
  } ),
  gridLengthScaleArrowStrokeProperty: new ProfileColorProperty( chargesAndFields, 'gridLengthScaleArrowStroke', {
    default: WHITE,
    projector: RED
  } ),
  gridLengthScaleArrowFillProperty: new ProfileColorProperty( chargesAndFields, 'gridLengthScaleArrowFill', {
    default: WHITE,
    projector: new Color( 255, 153, 0 )
  } ),
  gridTextFillProperty: new ProfileColorProperty( chargesAndFields, 'gridTextFill', {
    default: WHITE,
    projector: BLACK
  } ),
  electricPotentialSensorCircleStrokeProperty: new ProfileColorProperty( chargesAndFields, 'electricPotentialSensorCircleStroke', {
    default: WHITE,
    projector: BLACK
  } ),
  electricPotentialSensorCrosshairStrokeProperty: new ProfileColorProperty( chargesAndFields, 'electricPotentialSensorCrosshairStroke', {
    default: WHITE,
    projector: BLACK
  } ),
  electricPotentialPanelTitleTextProperty: new ProfileColorProperty( chargesAndFields, 'electricPotentialPanelTitleText', {
    default: WHITE,
    projector: WHITE
  } ),
  electricPotentialSensorTextPanelTextFillProperty: new ProfileColorProperty( chargesAndFields, 'electricPotentialSensorTextPanelTextFill', {
    default: BLACK,
    projector: BLACK
  } ),
  electricPotentialSensorTextPanelBorderProperty: new ProfileColorProperty( chargesAndFields, 'electricPotentialSensorTextPanelBorder', {
    default: BLACK,
    projector: new Color( 250, 250, 250 )
  } ),
  electricPotentialSensorTextPanelBackgroundProperty: new ProfileColorProperty( chargesAndFields, 'electricPotentialSensorTextPanelBackground', {
    default: WHITE,
    projector: WHITE
  } ),
  electricFieldGridSaturationProperty: new ProfileColorProperty( chargesAndFields, 'electricFieldGridSaturation', {
    default: WHITE,
    projector: RED
  } ),
  electricFieldGridSaturationStrokeProperty: new ProfileColorProperty( chargesAndFields, 'electricFieldGridSaturationStroke', {
    default: BLACK,
    projector: BLACK
  } ),
  electricFieldGridZeroProperty: new ProfileColorProperty( chargesAndFields, 'electricFieldGridZero', {
    default: BLACK,
    projector: WHITE
  } ),
  electricPotentialGridSaturationPositiveProperty: new ProfileColorProperty( chargesAndFields, 'electricPotentialGridSaturationPositive', {
    default: new Color( 210, 0, 0 ),
    projector: new Color( 210, 0, 0 )
  } ),
  electricPotentialGridZeroProperty: new ProfileColorProperty( chargesAndFields, 'electricPotentialGridZero', {
    default: BLACK,
    projector: WHITE
  } ),
  electricPotentialGridSaturationNegativeProperty: new ProfileColorProperty( chargesAndFields, 'electricPotentialGridSaturationNegative', {
    default: BLUE,
    projector: BLUE
  } )
};

chargesAndFields.register( 'ChargesAndFieldsColors', ChargesAndFieldsColors );

export default ChargesAndFieldsColors;