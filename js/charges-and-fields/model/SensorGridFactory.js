// Copyright 2002-2015, University of Colorado Boulder

/**
 * Model of a grid of Sensor Elements
 *
 * @author Martin Veillette (Berea College)
 */

define( function( require ) {
  'use strict';

  // modules

  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var StaticSensorElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/StaticSensorElement' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   *
   * @param {Object} [options]
   * @constructor
   */
  function SensorGridFactory( options ) {
    options = _.extend( {
      spacing: 0.5 // separation in model coordinates between the sensors
    } );

    //var minX = -ChargesAndFieldsConstants.WIDTH / 2;
    var maxX = ChargesAndFieldsConstants.WIDTH / 2;
    //var minY = -ChargesAndFieldsConstants.HEIGHT / 2;
    var maxY = ChargesAndFieldsConstants.HEIGHT / 2;

    ObservableArray.call( this );

    var x;
    var y;


    this.add( new StaticSensorElement( new Vector2( 0, 0 ) ) );

    for ( x = options.spacing; x < maxX; x += options.spacing ) {
      var positiveXAxisPosition = new Vector2( x, 0 );
      var negativeXAxisPosition = new Vector2( -x, 0 );

      this.addAll(
        [
          new StaticSensorElement( positiveXAxisPosition ),
          new StaticSensorElement( negativeXAxisPosition )
        ] );
    }

    for ( y = options.spacing; y < maxY; y += options.spacing ) {
      var positiveYAxisPosition = new Vector2( 0, y );
      var negativeYAxisPosition = new Vector2( 0, -y );

      this.addAll(
        [
          new StaticSensorElement( positiveYAxisPosition ),
          new StaticSensorElement( negativeYAxisPosition )
        ] );
    }

    for ( x = options.spacing; x < maxX; x += options.spacing ) {
      for ( y = options.spacing; y < maxY; y += options.spacing ) {
        var quadrant1Position = new Vector2( x, y );
        var quadrant2Position = new Vector2( -x, y );
        var quadrant3Position = new Vector2( -x, -y );
        var quadrant4Position = new Vector2( x, -y );

        this.addAll(
          [
            new StaticSensorElement( quadrant1Position ),
            new StaticSensorElement( quadrant2Position ),
            new StaticSensorElement( quadrant3Position ),
            new StaticSensorElement( quadrant4Position )
          ] );
      }
    }
  }

  return inherit( ObservableArray, SensorGridFactory );
} );
