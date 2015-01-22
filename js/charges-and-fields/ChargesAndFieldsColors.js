//  Copyright 2002-2015, University of Colorado Boulder

/**
 * Location for all colors (especially those that could be tweaked)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var extend = require( 'PHET_CORE/extend' );
  var Color = require( 'SCENERY/util/Color' );
  var PropertySet = require( 'AXON/PropertySet' );

  var colors = {
    background: {
      default: new Color( 0, 0, 0 ),
      projector: new Color( 255, 255, 255 )
    },
    controlPanelBorder: {
      default: new Color( 210, 210, 210 ),
      projector: new Color( 0, 0, 0 )
    },
    controlPanelFill: {
      default: new Color( 10, 10, 10 ),
      projector: new Color( 240, 240, 240 )
    },
    controlPanelText: {
      default: new Color( 255, 255, 255 ),
      projector: new Color( 0, 0, 0 )
    },
    enclosureText: {
      default: new Color( 255, 255, 255 ),
      projector: new Color( 0, 0, 0 )
    },
    enclosureFill: {
      default: new Color( 10, 10, 10 ),
      projector: new Color( 240, 240, 240 )
    },
    enclosureBorder: {
      default: new Color( 210, 210, 210 ),
      projector: new Color( 0, 0, 0 )
    },
    checkBox: {
      default: new Color( 230, 230, 230 ),
      projector: new Color( 0, 0, 0 )
    },
    checkBoxDisabled: {
      default: new Color( 100, 100, 100 ),
      projector: new Color( 128, 128, 128 )
    },
    checkBoxBackground: {
      default: new Color( 30, 30, 30 ),
      projector: new Color( 255, 255, 255 )
    },
    negativeCharge: {
      default: new Color( 0, 0, 205 ),
      projector: new Color( 0, 0, 255 )
    },
    positiveCharge: {
      default: new Color( 205, 0, 0 ),
      projector: new Color( 255, 0, 0 )
    },
    voltageLabel: {
      default: new Color( 255, 255, 255 ),
      projector: new Color( 255, 25, 255 )
    },
    equipotentialLine: {
      default: new Color( 50, 255, 100 ),
      projector: new Color( 255, 25, 255 )
    },
    measuringTapeText: {
      default: new Color( 255, 255, 255 ),
      projector: new Color( 0, 0, 0 )
    },
    electricFieldSensorCircleFill: {
      default: new Color( 255, 189, 0 ),
      projector: new Color( 255, 155, 55 )
    },
    electricFieldSensorCircleStroke: {
      default: new Color( 255, 255, 255 ),
      projector: new Color( 0, 0, 0 )
    },
    electricFieldSensorArrow: {
      default: new Color( 255, 0, 0 ),
      projector: new Color( 0, 0, 255 )
    },
    electricFieldSensorLabel: {
      default: new Color( 255, 255, 255 ),
      projector: new Color( 0, 0, 0 )
    },
    gridStroke: {
      default: new Color( 50, 50, 50 ),
      projector: new Color( 200, 200, 200 )
    },
    gridLengthScaleArrowStroke: {
      default: new Color( 255, 255, 255 ),
      projector: new Color( 0, 0, 0 )
    },
    gridLengthScaleArrowFill: {
      default: new Color( 255, 255, 255 ),
      projector: new Color( 0, 0, 0 )
    },
    gridTextFill: {
      default: new Color( 255, 255, 255 ),
      projector: new Color( 0, 0, 0 )
    },
    electricPotentialSensorCircleStroke: {
      default: new Color( 255, 255, 255 ),
      projector: new Color( 0, 0, 0 )
    },
    electricPotentialSensorCrosshairStroke: {
      default: new Color( 255, 255, 255 ),
      projector: new Color( 0, 0, 0 )
    },
    buttonBaseColor: {
      default: new Color( 200, 200, 200 ),
      projector: new Color( 60, 60, 60 )
    },
    electricPotentialPanelTitleText: {
      default: new Color( 255, 255, 255 ),
      projector: new Color( 0, 0, 0 )
    },
    electricPotentialSensorTextPanelTextFill: {
      default: new Color( 0, 0, 0 ),
      projector: new Color( 255, 255, 255 )
    },
    electricPotentialSensorTextPanelBorder: {
      default: new Color( 0, 0, 0 ),
      projector: new Color( 250, 250, 250 )
    },

    electricPotentialSensorTextPanelBackground: {
      default: new Color( 255, 255, 255 ),
      projector: new Color( 0, 0, 0 )
    },
    electricPotentialSensorBorder: {
      default: new Color( 255, 255, 255 ),
      projector: new Color( 0, 0, 0 )
    },
    electricPotentialSensorBackgroundFill: {
      default: new Color( 40, 90, 255 ),
      projector: new Color( 50, 150, 255 )
    },
    electricFieldGridSaturationPositive: {
      default: new Color( 255, 255, 255 ),
      projector: new Color( 0, 0, 0 )
    },
    electricFieldGridZero: {
      default: new Color( 0, 0, 0 ),
      projector: new Color( 255, 255, 255 )
    },
    electricPotentialGridSaturationPositive: {
      default: new Color( 255, 0, 0 ),
      projector: new Color( 255, 0, 0 )
    },
    electricPotentialGridZero: {
      default: new Color( 0, 0, 0 ),
      projector: new Color( 255, 255, 255 )
    },
    electricPotentialGridSaturationNegative: {
      default: new Color( 0, 0, 255 ),
      projector: new Color( 0, 0, 255 )
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

