// Copyright 2002-2015, University of Colorado Boulder

/**
 * Location for most colors of the simulation (especially those that could be tweaked)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var extend = require( 'PHET_CORE/extend' );
  var PropertySet = require( 'AXON/PropertySet' );

  // constants
  var BLACK = new Color( 0, 0, 0 );
  var WHITE = new Color( 255, 255, 255 );
  var RED = new Color( 255, 0, 0 );
  var BLUE = new Color( 0, 0, 255 );

  var colors = {
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
    checkBox: {
      default: new Color( 230, 230, 230 ),
      projector: BLACK
    },
    checkBoxBackground: {
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

  };

  // initial properties object, to load into the PropertySet (so reset works nicely)
  var initialProperties = {};
  for ( var key in colors ) {
    initialProperties[ key ] = colors[ key ].default;
  }

  var ChargesAndFieldsColors = extend( new PropertySet( initialProperties ), {
    /*
     * Applies all colors for the specific named color scheme, ignoring colors that aren't specified for it.
     *
     * @param {string} profileName - one of 'default', 'basics' or 'projector'
     */
    applyProfile: function( profileName ) {
      assert && assert( profileName === 'default' || profileName === 'projector' );

      for ( var key in colors ) {
        if ( profileName in colors[ key ] ) {
          var oldColor = this[ key ];
          var newColor = colors[ key ][ profileName ];
          if ( !newColor.equals( oldColor ) ) {
            this[ key ] = newColor;
            reportColor( key );
          }
        }
      }
      this.trigger( 'profileChanged' );
    }
  } );

  /*---------------------------------------------------------------------------*
   * Iframe communication
   *----------------------------------------------------------------------------*/

  // sends iframe communication to report the current color for the key name
  function reportColor( key ) {
    var hexColor = ChargesAndFieldsColors[ key ].toNumber().toString( 16 );
    while ( hexColor.length < 6 ) {
      hexColor = '0' + hexColor;
    }

    window.parent && window.parent.postMessage( JSON.stringify( {
      type: 'reportColor',
      name: key,
      value: '#' + hexColor
    } ), '*' );
  }

  // initial communication
  for ( var colorName in colors ) {
    reportColor( colorName );
  }

  // receives iframe communication to set a color
  window.addEventListener( 'message', function( evt ) {
    var data = JSON.parse( evt.data );
    if ( data.type === 'setColor' ) {
      ChargesAndFieldsColors[ data.name ] = new Color( data.value );
    }
  } );

  return ChargesAndFieldsColors;
} );

