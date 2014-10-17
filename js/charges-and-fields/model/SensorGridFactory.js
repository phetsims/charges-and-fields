// Copyright 2002-2014, University of Colorado Boulder

/**
 * Model of a grid of Sensor Elements
 *
 * @author Martin Veillette (Berea College)
 */

define( function( require ) {
  'use strict';

  // modules

  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var SensorElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/SensorElement' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @constructor
   */
  function SensorGridFactory( options ) {
    options = _.extend( {
      location: new Vector2( 0, 0 ),/// in the middle
      size: new Dimension2( 6.5, 4 ),/// in meters
      numberOfHorizontalSensors: 10,
      numberOfVerticalSensors: 10,
      electricFieldInitialization: false,
      electricPotentialInitialization: false,
      userControlled: false
    } );

    this.size = options.size;
    this.location = options.location;
    this.numberOfHorizontalSensors = options.numberOfHorizontalSensors;
    this.numberOfVerticalSensors = options.numberOfVerticalSensors;

    // convenience coordinates
    this.left = this.location.x - this.size.width / 2;
    this.right = this.left + this.size.width;
    this.bottom = this.location.y - this.size.height / 2;
    this.top = this.bottom + this.size.height;

    //unit cell
    this.horizontalLatticeSpacing = this.size.width / (this.numberOfHorizontalSensors);
    this.verticalLatticeSpacing = this.size.width / (this.numberOfVerticalSensors );

    this.unitCellCenter = new Vector2( this.horizontalLatticeSpacing / 2, this.verticalLatticeSpacing / 2 );   /// in meters


    this.sensorGrid = new ObservableArray();
    var position = new Vector2();
    var electricField = new Vector2();
    var electricPotential;
    var i;
    var j;
    for ( i = 0; i < this.numberOfHorizontalSensors; i++ ) {
      for ( j = 0; j < this.numberOfVerticalSensors; j++ ) {

        position.x = this.left + this.unitCellCenter.x + i * this.horizontalLatticeSpacing;
        position.y = this.bottom + this.unitCellCenter.y + j * this.verticalLatticeSpacing;

        if ( options.electricFieldInitialization ) {
          electricField = thisModel.getElectricField( position );
        }
        if ( options.electricPotentialInitialization ) {
          electricPotential = thisModel.getElectricPotential( position );
        }
        this.sensorGrid.push( new SensorElement( {position: position, electricField: electricField, electricPotential: electricPotential, userControlled: options.userControlled} ) );
      }
    }
  }

  return inherit( Object, SensorGridFactory );
} );
