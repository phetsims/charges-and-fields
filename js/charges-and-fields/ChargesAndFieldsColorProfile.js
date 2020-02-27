// Copyright 2015-2019, University of Colorado Boulder

/**
 * Location for most colors of the simulation (especially those that could be tweaked)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Martin Veillette (Berea College)
 * @author Andrew Adare <andrew.adare@colorado.edu>
 */

import ColorProfile from '../../../scenery-phet/js/ColorProfile.js';
import Color from '../../../scenery/js/util/Color.js';
import chargesAndFields from '../chargesAndFields.js';

// constants
const BLACK = new Color( 0, 0, 0 );
const WHITE = new Color( 255, 255, 255 );
const RED = new Color( 255, 0, 0 );
const BLUE = new Color( 0, 0, 255 );

const ChargesAndFieldsColorProfile = new ColorProfile( [ 'default', 'projector' ], {
  background: {
    default: BLACK,
    projector: WHITE
  },
  reversedBackground: {
    default: WHITE,
    projector: BLACK
  },
  controlPanelBorder: {
    default: new Color( 210, 210, 210 ),
    projector: new Color( 192, 192, 192 )
  },
  controlPanelFill: {
    default: new Color( 10, 10, 10 ),
    projector: new Color( 238, 238, 238 )
  },
  controlPanelText: {
    default: new Color( 229, 229, 126 ),
    projector: BLACK
  },
  enclosureText: {
    default: WHITE,
    projector: BLACK
  },
  enclosureFill: {
    default: new Color( 10, 10, 10 ),
    projector: new Color( 238, 238, 238 )
  },
  enclosureBorder: {
    default: new Color( 210, 210, 210 ),
    projector: new Color( 192, 192, 192 )
  },
  checkbox: {
    default: new Color( 230, 230, 230 ),
    projector: BLACK
  },
  checkboxBackground: {
    default: new Color( 30, 30, 30 ),
    projector: WHITE
  },
  voltageLabel: {
    default: WHITE,
    projector: BLACK
  },
  voltageLabelBackground: {
    default: new Color( 0, 0, 0, 0.5 ),
    projector: new Color( 255, 255, 255, 0.5 )
  },
  electricPotentialLine: {
    default: new Color( 50, 255, 100 ),
    projector: BLACK
  },
  measuringTapeText: {
    default: WHITE,
    projector: BLACK
  },
  electricFieldSensorCircleFill: {
    default: new Color( 255, 255, 0 ),
    projector: new Color( 255, 153, 0 )
  },
  electricFieldSensorCircleStroke: {
    default: new Color( 128, 120, 133 ),
    projector: BLACK
  },
  electricFieldSensorArrow: {
    default: RED,
    projector: RED
  },
  electricFieldSensorLabel: {
    default: new Color( 229, 229, 126 ),
    projector: BLACK
  },
  gridStroke: {
    default: new Color( 50, 50, 50 ),
    projector: new Color( 255, 204, 51 )
  },
  gridLengthScaleArrowStroke: {
    default: WHITE,
    projector: RED
  },
  gridLengthScaleArrowFill: {
    default: WHITE,
    projector: new Color( 255, 153, 0 )
  },
  gridTextFill: {
    default: WHITE,
    projector: BLACK
  },
  electricPotentialSensorCircleStroke: {
    default: WHITE,
    projector: BLACK
  },
  electricPotentialSensorCrosshairStroke: {
    default: WHITE,
    projector: BLACK
  },
  electricPotentialPanelTitleText: {
    default: WHITE,
    projector: WHITE
  },
  electricPotentialSensorTextPanelTextFill: {
    default: BLACK,
    projector: BLACK
  },
  electricPotentialSensorTextPanelBorder: {
    default: BLACK,
    projector: new Color( 250, 250, 250 )
  },
  electricPotentialSensorTextPanelBackground: {
    default: WHITE,
    projector: WHITE
  },
  electricFieldGridSaturation: {
    default: WHITE,
    projector: RED
  },
  electricFieldGridSaturationStroke: {
    default: BLACK,
    projector: BLACK
  },
  electricFieldGridZero: {
    default: BLACK,
    projector: WHITE
  },
  electricPotentialGridSaturationPositive: {
    default: new Color( 210, 0, 0 ),
    projector: new Color( 210, 0, 0 )
  },
  electricPotentialGridZero: {
    default: BLACK,
    projector: WHITE
  },
  electricPotentialGridSaturationNegative: {
    default: BLUE,
    projector: BLUE
  }
} );

chargesAndFields.register( 'ChargesAndFieldsColorProfile', ChargesAndFieldsColorProfile );

export default ChargesAndFieldsColorProfile;