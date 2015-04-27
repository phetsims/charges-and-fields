// Copyright 2002-2015, University of Colorado Boulder

/**
 * Model of the charges and fields simulation
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var ElectricFieldLine = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ElectricFieldLine' );
  var ElectricPotentialLine = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ElectricPotentialLine' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var PropertySet = require( 'AXON/PropertySet' );
  var SensorElement = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/SensorElement' );
  var SensorGrid = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/SensorGrid' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var K_CONSTANT = ChargesAndFieldsConstants.K_CONSTANT;
  var HEIGHT = ChargesAndFieldsConstants.HEIGHT;
  var WIDTH = ChargesAndFieldsConstants.WIDTH;
  var ELECTRIC_FIELD_SENSOR_SPACING = ChargesAndFieldsConstants.ELECTRIC_FIELD_SENSOR_SPACING;
  var ELECTRIC_POTENTIAL_SENSOR_SPACING = ChargesAndFieldsConstants.ELECTRIC_POTENTIAL_SENSOR_SPACING;

  /**
   * Main constructor for ChargesAndFieldsModel, which contains all of the model logic for the entire sim screen.
   * @constructor
   */
  function ChargesAndFieldsModel() {

    var thisModel = this;

    // For performance reasons there are two visibility properties that are strongly tied to the model hence the reason they appear here.
    // The other visibility properties can be found in the ChargesAndFieldsScreenView file
    PropertySet.call( thisModel, {
      isElectricFieldGridVisible: false, // control the visibility of a grid of arrows representing the local electric field
      isElectricPotentialGridVisible: false, // control the visibility of the electric potential field, a.k.a. rectangular grid
      isPlayAreaCharged: false // is there at least one active charged particle on the board
    } );

    //----------------------------------------------------------------------------------------
    // Initialize variables
    //----------------------------------------------------------------------------------------

    // @public read-only
    this.bounds = new Bounds2( -WIDTH / 2, -HEIGHT / 2, WIDTH / 2, HEIGHT / 2 ); // bounds of the model (for the nominal view)

    // @public read-only
    this.enlargedBounds = new Bounds2( -1.5 * WIDTH / 2, this.bounds.minY, 1.5 * WIDTH / 2, 3 * HEIGHT / 2 ); // bounds of the model (for the enlarged view)

    // @public read-only
    // all distances are in meter
    this.chargeAndSensorEnclosureBounds = new Bounds2( -1.25, -2.30, 1.25, -1.70 );

    // Observable array of all draggable electric charges
    // @public
    this.chargedParticles = new ObservableArray(); // {ObservableArray.<ChargedParticle>}

    // Observable array of all active electric charges (i.e. isActive is true for the chargeParticle(s) in this array)
    // This is the relevant array to calculate the electric field, and electric potential
    // @public
    this.activeChargedParticles = new ObservableArray(); //  {ObservableArray.<ChargedParticle>}

    // Observable array of all draggable electric field sensors
    // @public
    this.electricFieldSensors = new ObservableArray(); // {ObservableArray.<SensorElement>}

    // electric potential sensor
    var position = new Vector2( 0, 0 ); // position of the crosshair on the electric potential sensor, initial value will be reset by the view
    this.electricPotentialSensor = new SensorElement( position );

    // electric Field Sensor Grid
    // @public read-only
    this.electricFieldSensorGrid = new SensorGrid( this.bounds, this.enlargedBounds, {
      spacing: ELECTRIC_FIELD_SENSOR_SPACING,
      onOrigin: true // the origin (0,0) is also the location of a sensor
    } ); //{Array.<StaticSensorElement>}

    // electric potential Sensor Grid, a.k.a in physics as the electric potential 'field'
    // @public read-only
    this.electricPotentialSensorGrid = new SensorGrid( this.bounds, this.enlargedBounds, {
      spacing: ELECTRIC_POTENTIAL_SENSOR_SPACING,
      onOrigin: false // the origin is equidistant from the four nearest neighbor sensors.
    } ); //{Array.<StaticSensorElement>}

    // observable array that contains the model of electricPotential line, each element is an electricPotential line
    // @public read-only
    this.electricPotentialLinesArray = new ObservableArray(); // {ObservableArray.<ElectricPotentialLine>}

    // observable array that contains the model of electricPotential line, each element is an electric field line
    // @public read-only
    this.electricFieldLinesArray = new ObservableArray(); // {ObservableArray.<ElectricFieldLine>}

    //----------------------------------------------------------------------------------------
    //
    // Hook up all the listeners the model
    //
    //----------------------------------------------------------------------------------------

    //------------------------
    // Position Listener on the electric potential Sensor
    //------------------------

    // update the Electric Potential Sensor upon a change of position
    this.electricPotentialSensor.positionProperty.link( function( position ) {
      thisModel.electricPotentialSensor.electricPotential = thisModel.getElectricPotential( position );
    } );

    //------------------------
    // isElectricFieldGridVisible Listener  (update all the electric field grid sensors a.k.a. grid of arrows)
    //------------------------

    // for performance reason, the electric field of the sensors on the grid is calculated and updated only if the
    // visibility of the grid is set to true
    this.isElectricFieldGridVisibleProperty.link( function( isVisible ) {
      if ( isVisible ) {
        thisModel.updateElectricFieldSensorGrid();
      }
    } );

    //------------------------
    // isElectricPotentialGridVisible Listener  (update all the grid of electric potential sensors a.k.a. the electric potential field)
    //------------------------

    // for performance reason, the electric potential is calculated and updated only if it is set to visible
    this.isElectricPotentialGridVisibleProperty.link( function( isVisible ) {
      if ( isVisible ) {
        thisModel.updateElectricPotentialSensorGrid();
      }
    } );

    //------------------------
    // AddItem Added Listener on the charged Particles Observable Array
    //------------------------

    // the following logic is the crux of the simulation
    this.chargedParticles.addItemAddedListener( function( chargedParticle ) {

      chargedParticle.isUserControlledProperty.link( function( isUserControlled ) {
        // determine if the charge particle is no longer controlled by the user and is inside the enclosure
        if ( !isUserControlled && thisModel.chargeAndSensorEnclosureBounds.containsPoint( chargedParticle.position ) ) {
          chargedParticle.isActive = false; // charge is no longer active, (effectively) equivalent to set its model charge to zero
          chargedParticle.animate(); // animate the charge to its destination position
        }
      } );

      chargedParticle.isActiveProperty.lazyLink( function( isActive ) {
        // clear all electricPotential lines, i.e. remove all elements from the electricPotentialLinesArray
        thisModel.clearElectricPotentialLines();
        // clear all electric field lines, i.e. remove all elements from the electricFieldLinesArray
        thisModel.clearElectricFieldLines();
        // update the two grid sensors (if they are set to visible), the electric fields sensors and the electricPotential sensor
        thisModel.updateAllVisibleSensors();
        if ( isActive ) {
          // we know for sure that there is a least one active charge
          thisModel.isPlayAreaCharged = true;
          // add particle to the activeChargedParticle observable array
          // use for the webGlNode
          thisModel.activeChargedParticles.push( chargedParticle );
        }
        else {
          // update the status of the isPlayAreaCharged,  to find is there is at least one active charge particle on board
          thisModel.updateIsPlayAreaCharged();
          // remove particle from the activeChargeParticle array
          thisModel.activeChargedParticles.remove( chargedParticle );
        }
      } );

      chargedParticle.positionProperty.link( function( position, oldPosition ) {

        // verify that the charge isActive before doing any charge-dependent updates to the model
        if ( chargedParticle.isActive ) {
          // remove electricPotential lines and electric field lines when the position of a charged particle changes and the charge isActive
          thisModel.clearElectricPotentialLines();
          thisModel.clearElectricFieldLines();

          // if oldPosition doesn't exist then calculate the sensor properties from the charge configurations (from scratch)
          if ( oldPosition === null ) {
            thisModel.updateAllVisibleSensors();
          }
          // if oldPosition exists calculate the sensor properties from the delta contribution
          // this should help performance if there are many charged particles on the board
          else {
            // convenience variable
            var charge = chargedParticle.charge;

            // update the Electric Potential Sensor by calculating the change in the electric potential
            thisModel.electricPotentialSensor.electricPotential += thisModel.getElectricPotentialChange(
              thisModel.electricPotentialSensor.position, position, oldPosition, charge );

            // update the Electric Field Sensors  by calculating the change in the electric field due to the motion of the chargeParticle
            thisModel.electricFieldSensors.forEach( function( sensorElement ) {
              // electricField is a property that is being listened to. We want a new vector allocation when the electric field gets updated
              sensorElement.electricField = sensorElement.electricField.plus( thisModel.getElectricFieldChange( sensorElement.position, position, oldPosition, charge ) );
            } );

            // update the Electric Field Grid Sensors, but only if the electric Field grid is visible
            if ( thisModel.isElectricFieldGridVisible === true ) {
              thisModel.electricFieldSensorGrid.forEach( function( sensorElement ) {
                // let's calculate the change in the electric field due to the change in position of one charge
                sensorElement.electricField.add( thisModel.getElectricFieldChange( sensorElement.position, position, oldPosition, charge ) );
              } );
              // send a signal that the electric field grid has been updated,
              thisModel.trigger( 'electricFieldGridUpdated' );
            }

            // update the Electric Potential Grid Sensors but only if the electric potential grid is visible
            if ( thisModel.isElectricPotentialGridVisible === true ) {
              thisModel.electricPotentialSensorGrid.forEach( function( sensorElement ) {
                // calculating the change in the electric potential due to the change in position of one charge
                sensorElement.electricPotential += thisModel.getElectricPotentialChange( sensorElement.position, position, oldPosition, charge );
              } );
              // send a signal that the electric potential grid has been updated,
              thisModel.trigger( 'electricPotentialGridUpdated' );
            }
          }// end of else statement
        }// end of if(isActive) statement
      } );
    } );

    //------------------------
    // AddItem Removed Listener on the charged Particles Observable Array
    //------------------------

    // if any charge is removed, we need to update all the sensors
    this.chargedParticles.addItemRemovedListener( function( chargeParticle ) {
      // check that the particle was active before updating charge dependent model components
      if ( chargeParticle.isActive ) {
        // Remove electricPotential lines and electric field lines
        thisModel.clearElectricPotentialLines();
        thisModel.clearElectricFieldLines();
        // Update all the visible sensors
        thisModel.updateAllVisibleSensors();

        // remove particle from the activeChargedParticles array
        thisModel.activeChargedParticles.remove( chargeParticle );
      }

      // update  the property isPlayAreaCharged to see if is there at least one active charge on the board
      thisModel.updateIsPlayAreaCharged();
    } );

    //------------------------
    // AddItem Added Listener on the electric Field Sensors Observable Array
    //------------------------

    this.electricFieldSensors.addItemAddedListener( function( electricFieldSensor ) {
      // update the Electric Field Sensors upon a change of its own position
      electricFieldSensor.positionProperty.link( function( position ) {
        electricFieldSensor.electricField = thisModel.getElectricField( position );
      } );

      electricFieldSensor.isUserControlledProperty.link( function( isUserControlled ) {
        // determine if the sensor is no longer controlled by the user and is inside the enclosure
        if ( !isUserControlled && thisModel.chargeAndSensorEnclosureBounds.containsPoint( electricFieldSensor.position ) ) {
          electricFieldSensor.isActive = false;
          electricFieldSensor.animate();
        }
      } );
    } );
  }

  return inherit( PropertySet, ChargesAndFieldsModel, {
      /**
       * Reset function
       * @public
       */
      reset: function() {
        this.chargedParticles.clear(); // clear all the charges
        this.electricFieldSensors.clear(); // clear all the electric field sensors
        this.electricPotentialLinesArray.clear(); // clear the electricPotential 'lines'
        this.electricFieldLinesArray.clear(); // clear the electric field 'lines'
        this.electricPotentialSensor.reset(); // reposition the electricPotentialSensor
        this.updateElectricFieldSensorGrid(); // will reset the grid to zero
        this.updateElectricPotentialSensorGrid(); // will reset the grid to zero.
        PropertySet.prototype.reset.call( this ); // reset the visibility of (some) check boxes
      },

      /**
       * Function that determines if there are active charges on the board
       * @private
       */
      updateIsPlayAreaCharged: function() {
        var isActiveChargePresentOnBoard = false;

        this.chargedParticles.forEach( function( chargedParticle ) {
          isActiveChargePresentOnBoard = isActiveChargePresentOnBoard || chargedParticle.isActive;
        } );

        this.isPlayAreaCharged = isActiveChargePresentOnBoard;
      },

      /**
       * Update the four types of sensors
       * @private
       */
      updateAllSensors: function() {
        this.updateElectricPotentialSensor();
        this.updateElectricPotentialSensorGrid();
        this.updateElectricFieldSensors();
        this.updateElectricFieldSensorGrid();
      },

      /**
       * Update all the visible sensors
       * @private
       */
      updateAllVisibleSensors: function() {
        if ( this.isElectricPotentialGridVisible === true ) {
          this.updateElectricPotentialSensorGrid();
        }
        if ( this.isElectricFieldGridVisible === true ) {
          this.updateElectricFieldSensorGrid();
        }
        // the following sensors may not be visible or active but
        // it is very inexpensive to update them ( updating them avoid putting extra logic to handle
        // the transition visible/invisible)
        this.updateElectricPotentialSensor();
        this.updateElectricFieldSensors();
      },

      /**
       * Update the Electric Field Sensors
       * @private
       */
      updateElectricFieldSensors: function() {
        var thisModel = this;
        this.electricFieldSensors.forEach( function( sensorElement ) {
          sensorElement.electricField = thisModel.getElectricField( sensorElement.position );
        } );
      },
      /**
       * Update the Electric Potential Sensor
       * @private
       */
      updateElectricPotentialSensor: function() {
        this.electricPotentialSensor.electricPotential = this.getElectricPotential( this.electricPotentialSensor.position );
      },

      /**
       * Update the Electric Potential Grid Sensors
       * @private
       */
      updateElectricPotentialSensorGrid: function() {
        var thisModel = this;
        this.electricPotentialSensorGrid.forEach( function( sensorElement ) {
          sensorElement.electricPotential = thisModel.getElectricPotential( sensorElement.position );

        } );
        // send a signal that the electric potential grid has just been updated
        this.trigger( 'electricPotentialGridUpdated' );
      },

      /**
       * Update the Electric Field Grid Sensors
       * @private
       */
      updateElectricFieldSensorGrid: function() {
        var thisModel = this;
        this.electricFieldSensorGrid.forEach( function( sensorElement ) {
          sensorElement.electricField = thisModel.getElectricField( sensorElement.position );
        } );
        // send a signal that the electric field grid has just been updated
        this.trigger( 'electricFieldGridUpdated' );
      },

      /**
       * Function for adding an instance of a modelElement to this model when the user creates them, generally by clicking on some
       * some sort of creator node. The function add the type to an observable Array
       * @public
       * @param {Type} modelElement - the particular types that are of interest are ChargedParticle, SensorElement, ModelElement
       * @param {ObservableArray} observableArray - e.g. this.chargedParticles, this.electricFieldSensors
       */
      addUserCreatedModelElementToObservableArray: function( modelElement, observableArray ) {
        observableArray.push( modelElement );
        modelElement.on( 'returnedToOrigin', function() {
          // the observable array can removed the model element when the model element has returned to its origin
          observableArray.remove( modelElement );
        } );
      },


      /**
       * Return the change in the electric field at position Position due to the motion of a
       * charged particle from oldChargePosition to  newChargePosition.
       * @private
       * @param {Vector2} position
       * @param {Vector2} newChargePosition
       * @param {Vector2} oldChargePosition
       * @param {number} particleCharge - allowed values are +1 or -1
       * @returns {{x:number,y:number}}
       */
      getElectricFieldChange: function( position, newChargePosition, oldChargePosition, particleCharge ) {
        var newDistancePowerCube = Math.pow( newChargePosition.distanceSquared( position ), 1.5 );
        var oldDistancePowerCube = Math.pow( oldChargePosition.distanceSquared( position ), 1.5 );

        // For performance reason, we don't want to generate more vector allocations
        // Here is the original code
        //var newFieldVector = ( position.minus( newChargePosition )).divideScalar( newDistancePowerCube );
        //var oldFieldVector = ( position.minus( oldChargePosition )).divideScalar( oldDistancePowerCube );
        //var electricFieldChange = (newFieldVector.subtract( oldFieldVector )).multiplyScalar( particleCharge * K_CONSTANT );
        return {
          x: ((position.x - newChargePosition.x) / ( newDistancePowerCube ) -
              (position.x - oldChargePosition.x) / ( oldDistancePowerCube )) *
             ( particleCharge * K_CONSTANT ),
          y: ((position.y - newChargePosition.y) / ( newDistancePowerCube ) -
              (position.y - oldChargePosition.y) / ( oldDistancePowerCube )) *
             ( particleCharge * K_CONSTANT )
        };
      },

      /**
       * Return the change in the electric potential at location 'position' due to the motion of a
       * charged particle from oldChargePosition to newChargePosition.
       * @private
       * @param {Vector2} position
       * @param {Vector2} newChargePosition
       * @param {Vector2} oldChargePosition
       * @param {number} particleCharge
       * @returns {number} electricPotentialChange
       */
      getElectricPotentialChange: function( position, newChargePosition, oldChargePosition, particleCharge ) {
        var newDistance = newChargePosition.distance( position );
        var oldDistance = oldChargePosition.distance( position );
        return particleCharge * K_CONSTANT * (1 / newDistance - 1 / oldDistance);
      },

      /**
       * Return the electric field ( a vector) at a location 'position'
       * @private
       * @param {Vector2} position
       * @returns {Vector2} electricField
       */
      getElectricField: function( position ) {
        var electricField = new Vector2( 0, 0 );
        this.chargedParticles.forEach( function( chargedParticle ) {
          if ( chargedParticle.isActive ) {
            var distanceSquared = chargedParticle.position.distanceSquared( position );
            var distancePowerCube = Math.pow( distanceSquared, 1.5 );
            // For performance reason, we don't want to generate more vector allocations
            var electricFieldContribution = {
              x: (position.x - chargedParticle.position.x) * (chargedParticle.charge) / distancePowerCube,
              y: (position.y - chargedParticle.position.y) * (chargedParticle.charge) / distancePowerCube
            };
            electricField.add( electricFieldContribution );
          }
        } );
        electricField.multiplyScalar( K_CONSTANT ); // prefactor depends on units
        return electricField;
      },

      /**
       * Return the electric potential at a location 'position' due to the configuration of charges on the board.
       * @public read-Only
       * @param {Vector2} position
       * @returns {number} electricPotential
       */
      getElectricPotential: function( position ) {
        var electricPotential = 0;
        this.chargedParticles.forEach( function( chargedParticle ) {
          if ( chargedParticle.isActive ) {
            var distance = chargedParticle.position.distance( position );
            electricPotential += (chargedParticle.charge) / distance;
          }
        } );
        electricPotential *= K_CONSTANT; // prefactor depends on units
        return electricPotential;
      },

      /**
       * Push an electricPotentialLine to an observable array
       * The drawing of the electricPotential line is handled in the view (electricPotentialLineNode)
       * @public
       * @param {Vector2} [position] - optional argument: starting point to calculate the electricPotential line
       */
      addElectricPotentialLine: function( position ) {

        var electricPotentialLinePosition = {};
        if ( position ) {
          electricPotentialLinePosition = position;
        }
        else {
          // use the location of the electric Potential Sensor as default position
          electricPotentialLinePosition = this.electricPotentialSensor.position;
        }

        var electricPotentialLine = new ElectricPotentialLine(
          electricPotentialLinePosition,
          this.enlargedBounds,
          this.activeChargedParticles,
          this.getElectricPotential.bind( this ),
          this.getElectricField.bind( this ),
          this.isPlayAreaChargedProperty );

        // make sure the positionArray is not null
        if ( electricPotentialLine.isLinePresent ) {
          this.electricPotentialLinesArray.push( electricPotentialLine );
        }
      },

      /**
       * Push an electricFieldLine to an observable array
       * The drawing of the electricField Line is handled in the view.
       * @public
       * @param {Vector2} position - starting point to calculate the electric field line
       */
      addElectricFieldLine: function( position ) {
        // electric field lines don't exist in a vacuum of charges

        var electricFieldLine = new ElectricFieldLine(
          position,
          this.enlargedBounds,
          this.activeChargedParticles,
          this.getElectricField.bind( this ),
          this.isPlayAreaChargedProperty );

        if ( electricFieldLine.isLinePresent ) {
          this.electricFieldLinesArray.push( electricFieldLine );
        }
      },

      /**
       * Push many electric Potential Lines to an observable array
       * The drawing of the electric Potential Lines is handled in the view.
       * @param {number} numberOfLines
       * USED IN DEBUGGING MODE
       */
      addManyElectricPotentialLines: function( numberOfLines ) {
        var i;
        for ( i = 0; i < numberOfLines; i++ ) {
          var position = new Vector2( WIDTH * (Math.random() - 0.5), HEIGHT * (Math.random() - 0.5) ); // a random position on the graph
          this.addElectricPotentialLine( position );
        }
      },

      /**
       * Push many electric Field Lines to an observable array
       * The drawing of the electric Field Lines and electric Potential Lines is handled in the view.

       * @param {number} numberOfLines
       * USED IN DEBUGGING MODE
       */
      addManyElectricFieldLines: function( numberOfLines ) {
        var i;
        for ( i = 0; i < numberOfLines; i++ ) {
          var position = new Vector2( WIDTH * (Math.random() - 0.5), HEIGHT * (Math.random() - 0.5) ); // a random position on the graph
          this.addElectricFieldLine( position );
        }
      },

      /**
       * Function that clears the Equipotential Lines Observable Array
       * @public
       */
      clearElectricPotentialLines: function() {
        this.electricPotentialLinesArray.clear();
      },

      /**
       * Function that clears the Electric Field Lines Observable Array
       * @public
       */
      clearElectricFieldLines: function() {
        this.electricFieldLinesArray.clear();
      }

    }
  )
    ;
} )
;

