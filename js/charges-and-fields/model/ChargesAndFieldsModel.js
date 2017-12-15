// Copyright 2014-2017, University of Colorado Boulder

/**
 * Model of the charges and fields simulation
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Bounds2IO = require( 'DOT/Bounds2IO' );
  var ChargedParticle = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ChargedParticle' );
  var chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var ElectricFieldSensor = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ElectricFieldSensor' );
  var ElectricPotentialLine = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ElectricPotentialLine' );
  var ElectricPotentialSensor = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ElectricPotentialSensor' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MeasuringTape = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/MeasuringTape' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var ObservableArrayIO = require( 'AXON/ObservableArrayIO' );
  var Property = require( 'AXON/Property' );
  var PropertyIO = require( 'AXON/PropertyIO' );
  var Vector2 = require( 'DOT/Vector2' );

  // phet-io modules
  var ChargedParticleIO = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ChargedParticleIO' );
  var ChargesAndFieldsModelIO = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ChargesAndFieldsModelIO' );
  var ElectricFieldSensorIO = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ElectricFieldSensorIO' );
  var ElectricPotentialLineIO = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ElectricPotentialLineIO' );

  // constants
  var GRID_MINOR_SPACING = ChargesAndFieldsConstants.GRID_MAJOR_SPACING / ChargesAndFieldsConstants.MINOR_GRIDLINES_PER_MAJOR_GRIDLINE;
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

    // @public
    this.chargedParticleGroupTandem = tandem.createGroupTandem( 'chargedParticle' );

    // @public
    this.electricFieldSensorGroupTandem = tandem.createGroupTandem( 'electricFieldSensor' );

    var self = this;

    // @public (read-write) {function} - supplied by the view to indicate when the charges and sensors panel is visible
    // used to determine if charges can be dropped in the toolbox, see https://github.com/phetsims/phet-io/issues/915
    this.isChargesAndSensorsPanelDisplayed = null;

    // For performance reasons there are two visibility properties that are strongly tied to the model hence the reason they appear here.
    // The other visibility properties can be found in the ChargesAndFieldsScreenView file

    // @public {Property.<boolean>} control the visibility of a grid of arrows representing the local electric field
    this.isElectricFieldVisibleProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'isElectricFieldVisibleProperty' )
    } );

    // @public {Property.<boolean>} controls the color shading in the fill of the electric field arrows
    this.isElectricFieldDirectionOnlyProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isElectricFieldDirectionOnlyProperty' )
    } );

    // @public {Property.<boolean>} control the visibility of the electric potential field, a.k.a. rectangular grid
    this.isElectricPotentialVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isElectricPotentialVisibleProperty' )
    } );

    // @public {Property.<boolean>} control the visibility of many numerical values ( e field sensors, electricPotential lines, etc)
    this.areValuesVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'areValuesVisibleProperty' )
    } );

    // @public {Property.<boolean>} control the visibility of the simple grid with minor and major axes
    this.isGridVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isGridVisibleProperty' )
    } );

    // @public {Property.<boolean>} should we snap the position of model elements to the grid (minor or major)
    this.snapToGridProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'snapToGridProperty' )
    } );

    // @public {Property.<boolean>} is there at least one active charged particle on the board
    this.isPlayAreaChargedProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isPlayAreaChargedProperty' )
    } );

    // @public {Property.<boolean>} whether adding positive charges is allowed (and displayed) in general
    this.allowNewPositiveChargesProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'allowNewPositiveChargesProperty' )
    } );

    // @public {Property.<boolean>} whether adding negative charges is allowed (and displayed) in general
    this.allowNewNegativeChargesProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'allowNewNegativeChargesProperty' )
    } );

    // @public {Property.<boolean>} whether adding electric field sensors is allowed (and displayed) in general
    this.allowNewElectricFieldSensorsProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'allowNewElectricFieldSensorsProperty' )
    } );

    // @public {Property.<Bounds2>} in meters
    this.chargesAndSensorsEnclosureBoundsProperty = new Property(
      new Bounds2( -1.25, -2.30, 1.25, -1.70 ), {
        tandem: tandem.createTandem( 'chargesAndSensorsEnclosureBoundsProperty' ),
        phetioType: PropertyIO( Bounds2IO )
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
      phetioType: ObservableArrayIO( ChargedParticleIO )
    } ); // {ObservableArray.<ChargedParticle>}
    var chargedParticles = this.chargedParticles;

    // Observable array of all active electric charges (i.e. isActive is true for the chargeParticle(s) in this array)
    // This is the relevant array to calculate the electric field, and electric potential
    // @public
    this.activeChargedParticles = new ObservableArray( {
      phetioType: PropertyIO( ChargedParticleIO )
    } ); // {ObservableArray.<ChargedParticle>}

    // @public - Observable array of all draggable electric field sensors
    this.electricFieldSensors = new ObservableArray( {
      phetioType: PropertyIO( ElectricFieldSensorIO )
    } ); // {ObservableArray.<ElectricFieldSensor>}
    var electricFieldSensors = this.electricFieldSensors;

    // @public - electric potential sensor
    this.electricPotentialSensor = new ElectricPotentialSensor( this.getElectricPotential.bind( this ),
      tandem.createTandem( 'electricPotentialSensor' ) );

    this.measuringTape = new MeasuringTape( tandem.createTandem( 'measuringTape' ) );

    // observable array that contains the model of electricPotential line, each element is an electricPotential line
    // @public read-only
    this.electricPotentialLines = new ObservableArray( {
      tandem: tandem.createTandem( 'electricPotentialLines' ),
      phetioType: ObservableArrayIO( ElectricPotentialLineIO )
    } ); // {ObservableArray.<ElectricPotentialLine>}

    //----------------------------------------------------------------------------------------
    //
    // Hook up all the listeners the model
    //
    //----------------------------------------------------------------------------------------

    this.snapToGridProperty.link( function( snapToGrid ) {
      if ( snapToGrid ) {
        self.snapAllElements();
      }
    } );

    //------------------------
    // AddItem Added Listener on the charged Particles Observable Array
    //------------------------

    // the following logic is the crux of the simulation
    this.chargedParticles.addItemAddedListener( function( addedChargedParticle ) {

      var userControlledListener = function( isUserControlled ) {

        // determine if the charge particle is no longer controlled by the user and is inside the enclosure
        if ( !isUserControlled &&

             // only drop in if the toolbox is showing (may be hidden by phet-io)
             self.isChargesAndSensorsPanelDisplayed && self.isChargesAndSensorsPanelDisplayed() &&
             self.chargesAndSensorsEnclosureBoundsProperty.get().containsPoint( addedChargedParticle.positionProperty.get() ) ) {
          addedChargedParticle.isActiveProperty.set( false ); // charge is no longer active, (effectively) equivalent to set its model charge to zero
          addedChargedParticle.animate(); // animate the charge to its destination position
        }
      };

      addedChargedParticle.isUserControlledProperty.link( userControlledListener );

      var isActiveListener = function( isActive ) {

        // clear all electricPotential lines, i.e. remove all elements from the electricPotentialLines
        self.clearElectricPotentialLines();

        if ( isActive ) {
          // add particle to the activeChargedParticle observable array
          // use for the webGlNode
          self.activeChargedParticles.push( addedChargedParticle );
        }
        else {
          // remove particle from the activeChargeParticle array
          self.activeChargedParticles.remove( addedChargedParticle );
        }
        // update the status of the isPlayAreaCharged,  to find is there is at least one active charge particle on board
        self.updateIsPlayAreaCharged();

        // update the two grid sensors (if they are set to visible), the electric fields sensors and the electricPotential sensor
        self.updateAllSensors();
      };

      addedChargedParticle.isActiveProperty.lazyLink( isActiveListener );

      // position and oldPosition refer to a charged particle
      var positionListener = function( position, oldPosition ) {

        self.updateIsPlayAreaCharged();

        // verify that the charge isActive before doing any charge-dependent updates to the model
        if ( addedChargedParticle.isActiveProperty.get() ) {

          // remove electricPotential lines when the position of a charged particle changes and the charge isActive
          self.clearElectricPotentialLines();

          // update the electricPotential and electricField sensors
          self.updateAllSensors();

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
          removedChargeParticle.dispose();
        }
      } );
    } );

    //------------------------
    // AddItem Removed Listener on the charged Particles Observable Array
    //------------------------

    this.chargedParticles.addItemRemovedListener( function( removedChargeParticle ) {
      // check that the particle was active before updating charge dependent model components
      if ( removedChargeParticle.isActiveProperty.get() && !self.isResetting ) {

        // Remove electricPotential lines
        self.clearElectricPotentialLines();

        // Update all the visible sensors
        self.updateAllSensors();

      }

      // remove particle from the activeChargedParticles array
      self.activeChargedParticles.remove( removedChargeParticle );

      // update the property isPlayAreaCharged to see if is there at least one active charge on the board
      self.updateIsPlayAreaCharged();
    } );

    //------------------------
    // AddItem Added Listener on the electric Field Sensors Observable Array
    //------------------------

    this.electricFieldSensors.addItemAddedListener( function( addedElectricFieldSensor ) {

      // Listener for sensor position changes
      var positionListener = function( position ) {
        addedElectricFieldSensor.electricField = self.getElectricField( position );
      };

      // update the Electric Field Sensors upon a change of its own position
      addedElectricFieldSensor.positionProperty.link( positionListener );

      var userControlledListener = function( isUserControlled ) {

        // determine if the sensor is no longer controlled by the user and is inside the enclosure
        if ( !isUserControlled &&

             // only drop in if the toolbox is showing (may be hidden by phet-io)
             self.isChargesAndSensorsPanelDisplayed && self.isChargesAndSensorsPanelDisplayed() &&
             self.chargesAndSensorsEnclosureBoundsProperty.get().containsPoint( addedElectricFieldSensor.positionProperty.get() ) ) {
          addedElectricFieldSensor.isActiveProperty.set( false );
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
        }
      } );
    } );

    this.electricPotentialLineTandemGroup = tandem.createGroupTandem( 'electricPotentialLines' );

    tandem.addInstance( this, { phetioType: ChargesAndFieldsModelIO } );
  }

  chargesAndFields.register( 'ChargesAndFieldsModel', ChargesAndFieldsModel );

  return inherit( Object, ChargesAndFieldsModel, {
    /**
     * Reset function
     * @public
     */
    reset: function() {
      // we want to avoid the cost of constantly re-updating the grids when emptying the chargedParticles array
      // so we set the flag isResetting to true.
      this.isResetting = true;

      this.isElectricFieldVisibleProperty.reset();
      this.isElectricFieldDirectionOnlyProperty.reset();
      this.isElectricPotentialVisibleProperty.reset();
      this.areValuesVisibleProperty.reset();
      this.isGridVisibleProperty.reset();
      this.isPlayAreaChargedProperty.reset();
      this.allowNewPositiveChargesProperty.reset();
      this.allowNewNegativeChargesProperty.reset();
      this.allowNewElectricFieldSensorsProperty.reset();
      this.chargesAndSensorsEnclosureBoundsProperty.reset();

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
      element.returnedToOriginEmitter.addListener( function() {
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
      return this.addModelElement( new ChargedParticle( 1, { tandem: tandem } ), this.chargedParticles );
    },

    /**
     * Adds a negative charge to the model, and returns it.
     * @public
     *
     * @returns {ChargedParticle}
     */
    addNegativeCharge: function( tandem ) {
      return this.addModelElement( new ChargedParticle( -1, { tandem: tandem } ), this.chargedParticles );
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
        this.isPlayAreaChargedProperty.set( true );
      }

      // No charged particles on screen, hence no electric field
      else if ( numberActiveChargedParticles === 0 ) {
        this.isPlayAreaChargedProperty.set( false );
      }

      // If this is a pair, it must be a +- pair. If charges are co-located, don't show field.
      else if ( numberActiveChargedParticles === 2 ) {

        // {boolean} indicator for a co-located pair
        var colocated = this.activeChargedParticles.get( 1 ).positionProperty.get()
                          .minus( this.activeChargedParticles.get( 0 ).positionProperty.get() )
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
            positiveChargePositionArray.push( chargedParticle.positionProperty.get() );
          }
          else {
            negativeChargePositionArray.push( chargedParticle.positionProperty.get() );
          }
        } );

        if (
          ( negativeChargePositionArray[ 0 ].equals( positiveChargePositionArray[ 0 ] ) &&
            negativeChargePositionArray[ 1 ].equals( positiveChargePositionArray[ 1 ] ) ) ||
          ( negativeChargePositionArray[ 0 ].equals( positiveChargePositionArray[ 1 ] ) &&
            negativeChargePositionArray[ 1 ].equals( positiveChargePositionArray[ 0 ] ) ) ) {
          this.isPlayAreaChargedProperty.set( false );
          this.electricField = Vector2.ZERO;
        }
        else {
          this.isPlayAreaChargedProperty.set( true );
        }
      }
      // for more than six charges
      else {
        // there are cases with six charges (and above) that can be compensated
        // however it is quite expensive to make this type of check as well as
        // incredibly unlikely to be the case in the first place.
        this.isPlayAreaChargedProperty.set( true );
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
        var distanceSquared = chargedParticle.positionProperty.get().distanceSquared( position );

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
          x: ( position.x - chargedParticle.positionProperty.get().x ) * ( chargedParticle.charge ) / distancePowerCube,
          y: ( position.y - chargedParticle.positionProperty.get().y ) * ( chargedParticle.charge ) / distancePowerCube
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

      var netChargeOnSite = this.getCharge( position ); // the net charge at position

      if ( netChargeOnSite > 0 ) {
        return Number.POSITIVE_INFINITY;
      }
      else if ( netChargeOnSite < 0 ) {
        return Number.NEGATIVE_INFINITY;
      }
      else {
        this.activeChargedParticles.forEach( function( chargedParticle ) {
          var distance = chargedParticle.positionProperty.get().distance( position );

          if ( distance > 0 ) {
            electricPotential += ( chargedParticle.charge ) / distance;
          }
        } );

        electricPotential *= K_CONSTANT; // prefactor depends on units
        return electricPotential;
      }
    },

    /**
     * get local charge at this position
     * @private
     * @param {Vector2} position
     * @returns {number}
     */
    getCharge: function( position ) {
      var charge = 0;
      this.activeChargedParticles.forEach( function( chargedParticle ) {
        if ( chargedParticle.positionProperty.value.equals( position ) ) {
          charge += chargedParticle.charge;
        }
      } );
      return charge;
    },

    /**
     * Push an electricPotentialLine to an observable array
     * The drawing of the electricPotential line is handled in the view (electricPotentialLineNode)
     * @public
     * @param {Vector2} [position] - optional argument: starting point to calculate the electricPotential line
     * @param {Tandem} [tandem] - tandem to use (if undefined a new tandem from the group will be used), necessary to recreate state from a saved PhET-iO state
     */
    addElectricPotentialLine: function( position, tandem ) {
      // Do not try to add an equipotential line if there are no charges.
      if ( !this.isPlayAreaChargedProperty.get() ) {
        return;
      }

      // use the location of the electric Potential Sensor as default position
      if ( !position ) {
        position = this.electricPotentialSensor.positionProperty.get();
      }

      // If we are too close to a charged particle, also bail out.
      var isTooCloseToParticle = _.some( _.map( this.activeChargedParticles.getArray(), function( chargedParticle ) {
        // in model coordinates, should be less than the radius (in the view) of a charged particle
        return chargedParticle.positionProperty.get().distance( position ) < 0.03;
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
        this.isPlayAreaChargedProperty,
        tandem || this.electricPotentialLineTandemGroup.createNextTandem()
      );

      this.electricPotentialLines.push( electricPotentialLine );

      return electricPotentialLine; // for chaining and for PhET-iO restore state
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
          WIDTH * ( phet.joist.random.nextDouble() - 0.5 ),
          HEIGHT * ( phet.joist.random.nextDouble() - 0.5 ) ); // a random position on the graph

        this.addElectricPotentialLine( position );
      }
    },

    /**
     * Function that clears the Equipotential Lines Observable Array
     * @public
     */
    clearElectricPotentialLines: function() {
      this.electricPotentialLines.clear();
    },

    /**
     * snap the position to the minor gridlines
     * @param {Property.<Vector2>} positionProperty
     * @public
     */
    snapToGridLines: function( positionProperty ) {
      if ( this.snapToGridProperty.value && this.isGridVisibleProperty.value ) {
        positionProperty.set( positionProperty.get()
          .dividedScalar( GRID_MINOR_SPACING )
          .roundedSymmetric()
          .timesScalar( GRID_MINOR_SPACING ) );
      }
    },

    snapAllElements: function() {
      var self = this;

      this.activeChargedParticles.forEach( function( chargedParticles ) {
        self.snapToGridLines( chargedParticles.positionProperty );
      } );

      this.electricFieldSensors.forEach( function( electricFieldSensor ) {
        self.snapToGridLines( electricFieldSensor.positionProperty );
      } );

      self.snapToGridLines( this.electricPotentialSensor.positionProperty );
      self.snapToGridLines( this.measuringTape.basePositionProperty );
      self.snapToGridLines( this.measuringTape.tipPositionProperty );

    }
  } );
} );

