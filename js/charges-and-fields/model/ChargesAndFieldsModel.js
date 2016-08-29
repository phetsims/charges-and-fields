// Copyright 2014-2015, University of Colorado Boulder

/**
 * Model of the charges and fields simulation
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var ChargedParticle = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ChargedParticle' );
  var ElectricFieldSensor = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ElectricFieldSensor' );
  var ElectricPotentialLine = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ElectricPotentialLine' );
  var ElectricPotentialSensor = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ElectricPotentialSensor' );
  var MeasuringTape = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/MeasuringTape' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Vector2 = require( 'DOT/Vector2' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );

  // phet-io modules
  var TBoolean = require( 'ifphetio!PHET_IO/types/TBoolean' );
  var TChargedParticle = require( 'ifphetio!PHET_IO/simulations/charges-and-fields/TChargedParticle' );

  // constants
  var K_CONSTANT = ChargesAndFieldsConstants.K_CONSTANT;
  var HEIGHT = ChargesAndFieldsConstants.HEIGHT;
  var WIDTH = ChargesAndFieldsConstants.WIDTH;

  // To avoid bugs, do not try to compute E-field at length scales smaller than MIN_DISTANCE_SCALE
  var MIN_DISTANCE_SCALE = 1e-9;

  /**
   * Main constructor for ChargesAndFieldsModel, which contains all of the model logic for the entire sim screen.
   * @constructor
   *
   * @param {Tandem} tandem
   */
  function ChargesAndFieldsModel( tandem ) {

    this.chargedParticleGroupTandem = tandem.createGroupTandem( 'chargedParticle' );
    this.electricFieldSensorGroupTandem = tandem.createGroupTandem( 'electricFieldSensor' );

    var thisModel = this;

    // For performance reasons there are two visibility properties that are strongly tied to the model hence the reason they appear here.
    // The other visibility properties can be found in the ChargesAndFieldsScreenView file
    PropertySet.call( thisModel, {
      isElectricFieldVisible: true, // control the visibility of a grid of arrows representing the local electric field
      isElectricFieldDirectionOnly: false, // controls the color shading in the fill of the electric field arrows
      isElectricPotentialVisible: false, // control the visibility of the electric potential field, a.k.a. rectangular grid
      areValuesVisible: false, // control the visibility of many numerical values ( e field sensors, electricPotential lines, etc)
      isGridVisible: false, // control the visibility of the simple grid with minor and major axes
      isPlayAreaCharged: false, // is there at least one active charged particle on the board

      allowNewPositiveCharges: true, // whether adding positive charges is allowed (and displayed) in general
      allowNewNegativeCharges: true, // whether adding negative charges is allowed (and displayed) in general
      allowNewElectricFieldSensors: true, // whether adding electric field sensors is allowed (and displayed) in general

      hideTogglingElectricFieldVisibility: false,
      hideTogglingElectricFieldDirectionOnly: false,
      hideTogglingElectricPotentialVisibility: false,
      hideTogglingValuesVisibility: false,
      hideTogglingGridVisibility: false,

      chargesAndSensorsEnclosureBounds: new Bounds2( -1.25, -2.30, 1.25, -1.70 ) // meters
    }, {
      tandemSet: {
        isElectricFieldVisible: tandem.createTandem( 'isElectricFieldVisibleProperty' ),
        isElectricFieldDirectionOnly: tandem.createTandem( 'isElectricFieldDirectionOnlyProperty' ),
        isElectricPotentialVisible: tandem.createTandem( 'isElectricPotentialVisibleProperty' ),
        areValuesVisible: tandem.createTandem( 'areValuesVisibleProperty' ),
        isGridVisible: tandem.createTandem( 'isGridVisibleProperty' ),

        allowNewPositiveCharges: tandem.createTandem( 'allowNewPositiveChargesProperty' ),
        allowNewNegativeCharges: tandem.createTandem( 'allowNewNegativeChargesProperty' ),
        allowNewElectricFieldSensors: tandem.createTandem( 'allowNewElectricFieldSensorsProperty' ),

        hideTogglingElectricFieldVisibility: tandem.createTandem( 'hideTogglingElectricFieldVisibilityProperty' ),
        hideTogglingElectricFieldDirectionOnly: tandem.createTandem( 'hideTogglingElectricFieldDirectionOnlyProperty' ),
        hideTogglingElectricPotentialVisibility: tandem.createTandem( 'hideTogglingElectricPotentialVisibilityProperty' ),
        hideTogglingValuesVisibility: tandem.createTandem( 'hideTogglingValuesVisibilityProperty' ),
        hideTogglingGridVisibility: tandem.createTandem( 'hideTogglingGridVisibilityProperty' )
      },
      phetioValueTypeSet: {
        isElectricFieldVisible: TBoolean,
        isElectricFieldDirectionOnly: TBoolean,
        isElectricPotentialVisible: TBoolean,
        areValuesVisible: TBoolean,
        isGridVisible: TBoolean,

        allowNewPositiveCharges: TBoolean,
        allowNewNegativeCharges: TBoolean,
        allowNewElectricFieldSensors: TBoolean,

        hideTogglingElectricFieldVisibility: TBoolean,
        hideTogglingElectricFieldDirectionOnly: TBoolean,
        hideTogglingElectricPotentialVisibility: TBoolean,
        hideTogglingValuesVisibility: TBoolean,
        hideTogglingGridVisibility: TBoolean
      }
    } );

    //----------------------------------------------------------------------------------------
    // Initialize variables
    //----------------------------------------------------------------------------------------

    this.isResetting = false; // is the model being reset, necessary flag to address performance issues in the reset process

    // @public read-only
    this.bounds = new Bounds2( -WIDTH / 2, -HEIGHT / 2, WIDTH / 2, HEIGHT / 2 ); // bounds of the model (for the nominal view)

    // @public read-only
    this.enlargedBounds = new Bounds2( -1.5 * WIDTH / 2, -HEIGHT / 2, 1.5 * WIDTH / 2, 3 * HEIGHT / 2 ); // bounds of the model (for the enlarged view)

    // Observable array of all draggable electric charges
    // @public
    this.chargedParticles = new ObservableArray( {
      tandem: tandem.createTandem( 'chargedParticles' ),
      phetioValueType: TChargedParticle
    } ); // {ObservableArray.<ChargedParticle>}
    var chargedParticles = this.chargedParticles;

    // Observable array of all active electric charges (i.e. isActive is true for the chargeParticle(s) in this array)
    // This is the relevant array to calculate the electric field, and electric potential
    // @public
    this.activeChargedParticles = new ObservableArray(); // {ObservableArray.<ChargedParticle>}

    // @public - Observable array of all draggable electric field sensors
    this.electricFieldSensors = new ObservableArray(); // {ObservableArray.<ElectricFieldSensor>}
    var electricFieldSensors = this.electricFieldSensors;

    // @public - electric potential sensor
    this.electricPotentialSensor = new ElectricPotentialSensor( this.getElectricPotential.bind( this ),
      tandem.createTandem( 'electricPotentialSensor' ) );

    this.measuringTape = new MeasuringTape( tandem.createTandem( 'measuringTape' ) );

    // observable array that contains the model of electricPotential line, each element is an electricPotential line
    // @public read-only
    this.electricPotentialLines = new ObservableArray(); // {ObservableArray.<ElectricPotentialLine>}

    //----------------------------------------------------------------------------------------
    //
    // Hook up all the listeners the model
    //
    //----------------------------------------------------------------------------------------

    //------------------------
    // AddItem Added Listener on the charged Particles Observable Array
    //------------------------

    // the following logic is the crux of the simulation
    this.chargedParticles.addItemAddedListener( function( addedChargedParticle ) {

      var userControlledListener = function( isUserControlled ) {

        // determine if the charge particle is no longer controlled by the user and is inside the enclosure
        if ( !isUserControlled && thisModel.chargesAndSensorsEnclosureBounds.containsPoint( addedChargedParticle.position ) ) {
          addedChargedParticle.isActive = false; // charge is no longer active, (effectively) equivalent to set its model charge to zero
          addedChargedParticle.animate(); // animate the charge to its destination position
        }
      };

      addedChargedParticle.isUserControlledProperty.link( userControlledListener );

      var isActiveListener = function( isActive ) {

        // clear all electricPotential lines, i.e. remove all elements from the electricPotentialLines
        thisModel.clearElectricPotentialLines();

        if ( isActive ) {
          // add particle to the activeChargedParticle observable array
          // use for the webGlNode
          thisModel.activeChargedParticles.push( addedChargedParticle );
        } else {
          // remove particle from the activeChargeParticle array
          thisModel.activeChargedParticles.remove( addedChargedParticle );
        }
        // update the status of the isPlayAreaCharged,  to find is there is at least one active charge particle on board
        thisModel.updateIsPlayAreaCharged();

        // update the two grid sensors (if they are set to visible), the electric fields sensors and the electricPotential sensor
        thisModel.updateAllSensors();
      };


      addedChargedParticle.isActiveProperty.lazyLink( isActiveListener );

      // position and oldPosition refer to a charged particle
      var positionListener = function( position, oldPosition ) {

        thisModel.updateIsPlayAreaCharged();

        // verify that the charge isActive before doing any charge-dependent updates to the model
        if ( addedChargedParticle.isActive ) {

          // remove electricPotential lines and electric field lines when the position of a charged particle changes and the charge isActive
          thisModel.clearElectricPotentialLines();

          // if oldPosition doesn't exist then calculate the sensor properties from the charge configurations (from scratch)
          if ( oldPosition === null ) {
            thisModel.updateAllSensors();
          }
          // if oldPosition exists calculate the sensor properties from the delta contribution
          // this should help performance if there are many charged particles on the board
          else {
            // convenience variable
            var charge = addedChargedParticle.charge;

            // update the Electric Potential Sensor by calculating the change in the electric potential
            thisModel.electricPotentialSensor.electricPotential += thisModel.getElectricPotentialChange(
              thisModel.electricPotentialSensor.position, position, oldPosition, charge );

            // The getElectricFieldChange function has a bug with distances near zero.
            // see https://github.com/phetsims/charges-and-fields/issues/82#issuecomment-239898320
            // Instead, use the less efficient, but less buggy approach here instead.
            thisModel.updateAllSensors();

            // // update electric field sensor
            // thisModel.electricFieldSensors.forEach( function( sensorElement ) {

            //   // electricField is a property that is being listened to.
            //   // We want a new vector allocation when the electric field gets updated
            //   // update the Electric Field Sensors  by calculating the change in the electric field due to the motion of the chargeParticle
            //   var eField = sensorElement.electricField;
            //   if ( eField.magnitude() < ChargesAndFieldsConstants.MAX_EFIELD_MAGNITUDE ) {
            //     var deltaE = thisModel.getElectricFieldChange( sensorElement.position, position, oldPosition, charge );
            //     sensorElement.electricField = eField.plus( deltaE );
            //   } else {
            //     sensorElement.electricField = thisModel.getElectricField( sensorElement.position );
            //   }
            // } );
          } // end of else statement
        } // end of if (isActive) statement
      };

      addedChargedParticle.positionProperty.link( positionListener );

      // remove listeners when a chargedParticle is removed
      chargedParticles.addItemRemovedListener( function removalListener( removedChargeParticle ) {
        if ( removedChargeParticle === addedChargedParticle ) {
          addedChargedParticle.isUserControlledProperty.unlink( userControlledListener );
          addedChargedParticle.isActiveProperty.unlink( isActiveListener );
          addedChargedParticle.positionProperty.unlink( positionListener );
          chargedParticles.removeItemRemovedListener( removalListener );
        }
      } );
    } );

    //------------------------
    // AddItem Removed Listener on the charged Particles Observable Array
    //------------------------

    this.chargedParticles.addItemRemovedListener( function( removedChargeParticle ) {
      // check that the particle was active before updating charge dependent model components
      if ( removedChargeParticle.isActive && !thisModel.isResetting ) {

        // Remove electricPotential lines and electric field lines
        thisModel.clearElectricPotentialLines();

        // Update all the visible sensors
        thisModel.updateAllSensors();

      }

      // remove particle from the activeChargedParticles array
      thisModel.activeChargedParticles.remove( removedChargeParticle );

      // update the property isPlayAreaCharged to see if is there at least one active charge on the board
      thisModel.updateIsPlayAreaCharged();
    } );

    //------------------------
    // AddItem Added Listener on the electric Field Sensors Observable Array
    //------------------------

    this.electricFieldSensors.addItemAddedListener( function( addedElectricFieldSensor ) {

      // Listener for sensor position changes
      var positionListener = function( position ) {
        addedElectricFieldSensor.electricField = thisModel.getElectricField( position );
      };

      // update the Electric Field Sensors upon a change of its own position
      addedElectricFieldSensor.positionProperty.link( positionListener );

      var userControlledListener = function( isUserControlled ) {

        // determine if the sensor is no longer controlled by the user and is inside the enclosure
        if ( !isUserControlled && thisModel.chargesAndSensorsEnclosureBounds.containsPoint( addedElectricFieldSensor.position ) ) {
          addedElectricFieldSensor.isActive = false;
          addedElectricFieldSensor.animate();
        }
      };

      addedElectricFieldSensor.isUserControlledProperty.link( userControlledListener );

      // remove listeners when an electricFieldSensor is removed
      electricFieldSensors.addItemRemovedListener( function removalListener( removedElectricFieldSensor ) {
        if ( removedElectricFieldSensor === addedElectricFieldSensor ) {
          addedElectricFieldSensor.isUserControlledProperty.unlink( userControlledListener );
          addedElectricFieldSensor.positionProperty.unlink( positionListener );
          electricFieldSensors.removeItemRemovedListener( removalListener );
          removedElectricFieldSensor.dispose();
        }
      } );
    } );

    tandem.addInstance( this );
  }

  chargesAndFields.register( 'ChargesAndFieldsModel', ChargesAndFieldsModel );

  return inherit( PropertySet, ChargesAndFieldsModel, {
    /**
     * Reset function
     * @public
     */
    reset: function() {
      // we want to avoid the cost of constantly re-updating the grids when emptying the chargedParticles array
      // so we set the flag isResetting to true.
      this.isResetting = true;
      PropertySet.prototype.reset.call( this ); // reset the visibility of (some) check boxes
      this.chargedParticles.clear(); // clear all the charges
      this.activeChargedParticles.clear(); // clear all the active charges
      this.electricFieldSensors.clear(); // clear all the electric field sensors
      this.electricPotentialLines.clear(); // clear the electricPotential 'lines'
      this.electricPotentialSensor.reset(); // reposition the electricPotentialSensor
      this.measuringTape.reset();

      this.isResetting = false; // done with the resetting process
    },

    /**
     * Adds an element to a particular array (ChargedParticle/ElectricFieldSensor to
     * chargedParticles/electricFieldSensors), and sets it up for removal when returned to the panel.
     * @private
     *
     * @param {ChargedParticle | ElectricFieldSensor} element
     * @param {ObservableArray.<ChargedParticle> | ObservableArray.<ElectricFieldSensor>} observableArray
     */
    addModelElement: function( element, observableArray ) {
      observableArray.push( element );
      element.once( 'returnedToOrigin', function() {
        observableArray.remove( element );
      } );
      return element; // for chaining
    },

    /**
     * Adds a positive charge to the model, and returns it.
     * @public
     *
     * @returns {ChargedParticle}
     */
    addPositiveCharge: function( tandem ) {
      return this.addModelElement( new ChargedParticle( 1, tandem ), this.chargedParticles );
    },

    /**
     * Adds a negative charge to the model, and returns it.
     * @public
     *
     * @returns {ChargedParticle}
     */
    addNegativeCharge: function( tandem ) {
      return this.addModelElement( new ChargedParticle( -1, tandem ), this.chargedParticles );
    },

    /**
     * Adds an electric field sensor to the model, and returns it.
     * @public
     *
     * @returns {ElectricFieldSensor}
     */
    addElectricFieldSensor: function( tandem ) {
      return this.addModelElement( new ElectricFieldSensor( this.getElectricField.bind( this ), tandem ), this.electricFieldSensors );
    },

    /**
     * Function that determines if there is at least one active and "uncompensated" charge
     * on the board. If this is not the case, it implies that the E-field is zero everywhere
     * (see https://github.com/phetsims/charges-and-fields/issues/46)
     * @private
     */
    updateIsPlayAreaCharged: function() {
      var netElectricCharge = 0; // {number} Total electric charge on screen
      var numberActiveChargedParticles = 0; // {number} Total active charged particles on screen

      this.activeChargedParticles.forEach( function( chargedParticle ) {
        numberActiveChargedParticles++;
        netElectricCharge += chargedParticle.charge;
      } );

      // If net charge is nonzero, there must be an electric field (by Gauss's law)
      if ( netElectricCharge !== 0 ) {
        this.isPlayAreaCharged = true;
      }

      // No charged particles on screen, hence no electric field
      else if ( numberActiveChargedParticles === 0 ) {
        this.isPlayAreaCharged = false;
      }

      // If this is a pair, it must be a +- pair. If charges are co-located, don't show field.
      else if ( numberActiveChargedParticles === 2 ) {

        // {boolean} indicator for a co-located pair
        var colocated = this.activeChargedParticles.get( 1 ).position
          .minus( this.activeChargedParticles.get( 0 ).position )
          .magnitude() < MIN_DISTANCE_SCALE;

        this.isPlayAreaChargedProperty.set( colocated ? false : true );

        if ( colocated ) {
          this.electricField = Vector2.ZERO;
        }
      }

      // Check for two compensating pairs
      else if ( numberActiveChargedParticles === 4 ) {
        var positiveChargePositionArray = [];
        var negativeChargePositionArray = [];
        this.activeChargedParticles.forEach( function( chargedParticle ) {
          if ( chargedParticle.charge === 1 ) {
            positiveChargePositionArray.push( chargedParticle.position );
          } else {
            negativeChargePositionArray.push( chargedParticle.position );
          }
        } );

        if (
          ( negativeChargePositionArray[ 0 ].equals( positiveChargePositionArray[ 0 ] ) &&
            negativeChargePositionArray[ 1 ].equals( positiveChargePositionArray[ 1 ] ) ) ||
          ( negativeChargePositionArray[ 0 ].equals( positiveChargePositionArray[ 1 ] ) &&
            negativeChargePositionArray[ 1 ].equals( positiveChargePositionArray[ 0 ] ) ) ) {
          this.isPlayAreaCharged = false;
          this.electricField = Vector2.ZERO;
        } else {
          this.isPlayAreaCharged = true;
        }
      }
      // for more than six charges
      else {
        // there are cases with six charges (and above) that can be compensated
        // however it is quite expensive to make this type of check as well as
        // incredibly unlikely to be the case in the first place.
        this.isPlayAreaCharged = true;
      }
    },

    /**
     * Update all sensors
     * @private
     */
    updateAllSensors: function() {
      this.electricPotentialSensor.update();
      for ( var i = 0; i < this.electricFieldSensors.length; i++ ) {
        this.electricFieldSensors.get( i ).update();
      }
    },

    /**
     * Return the change in the electric field at position Position due to the motion of a
     * charged particle from oldChargePosition to  newChargePosition.
     * @private
     * @param {Vector2} position - sensor location
     * @param {Vector2} newChargePosition - charged particle location
     * @param {Vector2} oldChargePosition - previous charged particle location
     * @param {number} particleCharge - allowed values are +1 or -1
     * @returns {{x:number,y:number}}
     */
    getElectricFieldChange: function( position, newChargePosition, oldChargePosition, particleCharge ) {
      var newDistancePowerCube = Math.pow( newChargePosition.distanceSquared( position ), 1.5 );
      var oldDistancePowerCube = Math.pow( oldChargePosition.distanceSquared( position ), 1.5 );

      // Avoid bugs stemming from large or infinite fields (such as #82, #84, #85)
      if ( newDistancePowerCube < MIN_DISTANCE_SCALE || oldDistancePowerCube < MIN_DISTANCE_SCALE ) {
        return { x: 0, y: 0 };
      }

      // For performance reasons, we don't want to generate more vector allocations
      // Here is the original code
      // var newFieldVector = ( position.minus( newChargePosition )).divideScalar( newDistancePowerCube );
      // var oldFieldVector = ( position.minus( oldChargePosition )).divideScalar( oldDistancePowerCube );
      // var electricFieldChange = (newFieldVector.subtract( oldFieldVector )).multiplyScalar( particleCharge * K_CONSTANT );
      // @formatter:off
      return {
        x: ( ( position.x - newChargePosition.x ) / ( newDistancePowerCube ) -
          ( position.x - oldChargePosition.x ) / ( oldDistancePowerCube ) ) * ( particleCharge * K_CONSTANT ),
        y: ( ( position.y - newChargePosition.y ) / ( newDistancePowerCube ) -
          ( position.y - oldChargePosition.y ) / ( oldDistancePowerCube ) ) * ( particleCharge * K_CONSTANT )
      };
      // @formatter:on
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
      return particleCharge * K_CONSTANT * ( 1 / newDistance - 1 / oldDistance );
    },

    /**
     * Return the electric field (a vector) at a location 'position'
     * @private
     * @param {Vector2} position - location of sensor
     * @returns {Vector2} electricField
     */
    getElectricField: function( position ) {
      var electricField = new Vector2( 0, 0 );

      if ( !this.isPlayAreaChargedProperty.get() ) {
        return electricField;
      }

      this.activeChargedParticles.forEach( function( chargedParticle ) {
        var distanceSquared = chargedParticle.position.distanceSquared( position );

        // Avoid bugs stemming from large or infinite fields (#82, #84, #85).
        // Assign the E-field an angle of zero and a magnitude well above the maximum allowed value.
        if ( distanceSquared < MIN_DISTANCE_SCALE ) {
          electricField.x = 10 * ChargesAndFieldsConstants.MAX_EFIELD_MAGNITUDE;
          electricField.y = 0;
          return;
        }

        var distancePowerCube = Math.pow( distanceSquared, 1.5 );

        // For performance reasons, we don't want to generate more vector allocations
        var electricFieldContribution = {
          x: ( position.x - chargedParticle.position.x ) * ( chargedParticle.charge ) / distancePowerCube,
          y: ( position.y - chargedParticle.position.y ) * ( chargedParticle.charge ) / distancePowerCube
        };
        electricField.add( electricFieldContribution );
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

      if ( !this.isPlayAreaChargedProperty.get() ) {
        return electricPotential;
      }

      this.activeChargedParticles.forEach( function( chargedParticle ) {
        var distance = chargedParticle.position.distance( position );
        electricPotential += ( chargedParticle.charge ) / distance;
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
      // Do not try to add an equipotential line if there are no charges.
      if ( !this.isPlayAreaCharged ) {
        return;
      }

      // use the location of the electric Potential Sensor as default position
      if ( !position ) {
        position = this.electricPotentialSensor.position;
      }

      // If we are too close to a charged particle, also bail out.
      var isTooCloseToParticle = _.some( _.map( this.activeChargedParticles.getArray(), function( chargedParticle ) {
        // in model coordinates, should be less than the radius (in the view) of a charged particle
        return chargedParticle.position.distance( position ) < 0.03;
      } ) );
      if ( isTooCloseToParticle ) {
        return;
      }

      var electricPotentialLine = new ElectricPotentialLine(
        position,
        this.enlargedBounds,
        this.activeChargedParticles,
        this.getElectricPotential.bind( this ),
        this.getElectricField.bind( this ),
        this.isPlayAreaChargedProperty );

      this.electricPotentialLines.push( electricPotentialLine );
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
        var position = new Vector2(
          WIDTH * ( phet.joist.random() - 0.5 ),
          HEIGHT * ( phet.joist.random() - 0.5 ) ); // a random position on the graph

        this.addElectricPotentialLine( position );
      }
    },

    /**
     * Function that clears the Equipotential Lines Observable Array
     * @public
     */
    clearElectricPotentialLines: function() {
      this.electricPotentialLines.clear();
    }
  } );
} );

