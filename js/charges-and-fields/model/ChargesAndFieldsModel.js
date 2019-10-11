// Copyright 2014-2019, University of Colorado Boulder

/**
 * Model of the charges and fields simulation
 *
 * @author Martin Veillette (Berea College)
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const Bounds2IO = require( 'DOT/Bounds2IO' );
  const ChargedParticle = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ChargedParticle' );
  const ChargedParticleIO = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ChargedParticleIO' );
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  const ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  const ElectricFieldSensor = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ElectricFieldSensor' );
  const ElectricPotentialLine = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ElectricPotentialLine' );
  const ElectricPotentialLineIO = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ElectricPotentialLineIO' );
  const ElectricPotentialSensor = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ElectricPotentialSensor' );
  const Emitter = require( 'AXON/Emitter' );
  const Group = require( 'TANDEM/Group' );
  const GroupIO = require( 'TANDEM/GroupIO' );
  const MeasuringTape = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/MeasuringTape' );
  const ModelElementIO = require( 'CHARGES_AND_FIELDS/charges-and-fields/model/ModelElementIO' );
  const ObservableArray = require( 'AXON/ObservableArray' );
  const PhetioObject = require( 'TANDEM/PhetioObject' );
  const Property = require( 'AXON/Property' );
  const PropertyIO = require( 'AXON/PropertyIO' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const GRID_MINOR_SPACING = ChargesAndFieldsConstants.GRID_MAJOR_SPACING / ChargesAndFieldsConstants.MINOR_GRIDLINES_PER_MAJOR_GRIDLINE;
  const K_CONSTANT = ChargesAndFieldsConstants.K_CONSTANT;
  const HEIGHT = ChargesAndFieldsConstants.HEIGHT;
  const WIDTH = ChargesAndFieldsConstants.WIDTH;

  // To avoid bugs, do not try to compute E-field at length scales smaller than MIN_DISTANCE_SCALE
  const MIN_DISTANCE_SCALE = 1e-9;

  class ChargesAndFieldsModel extends PhetioObject {

    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {

      super( {
        tandem: tandem,
        phetioState: false
      } );

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
      // @public {Group.<ChargedParticle>}
      this.chargedParticles = ChargedParticle.createGroup( tandem.createTandem( 'chargedParticles' ) );
      const chargedParticles = this.chargedParticles;

      // Observable array of all active electric charges (i.e. isActive is true for the chargeParticle(s) in this array)
      // This is the relevant array to calculate the electric field, and electric potential
      // @public {ObservableArray.<ChargedParticle>}
      this.activeChargedParticles = new ObservableArray( {
        phetioType: PropertyIO( ChargedParticleIO )
      } );

      // @public - Observable array of all draggable electric field sensors
      this.electricFieldSensors = new Group( 'electricFieldSensor', {
        prototype: {
          create: ( tandem, prototypeName, initialPosition ) => {
            const sensor = new ElectricFieldSensor( this.getElectricField.bind( this ), initialPosition, tandem );
            sensor.returnedToOriginEmitter.addListener( () => this.electricFieldSensors.disposeGroupMember( sensor ) );
            return sensor;
          }
        }
      }, {
        tandem: tandem.createTandem( 'electricFieldSensors' ),
        phetioType: GroupIO( ModelElementIO )
      } ); // {ObservableArray.<ElectricFieldSensor>}
      const electricFieldSensors = this.electricFieldSensors;

      // @public - electric potential sensor
      this.electricPotentialSensor = new ElectricPotentialSensor( this.getElectricPotential.bind( this ),
        tandem.createTandem( 'electricPotentialSensor' ) );

      this.measuringTape = new MeasuringTape( tandem.createTandem( 'measuringTape' ) );

      // @public - emits whenever the charge model changes, i.e. charges added/removed/moved
      this.chargeConfigurationChangedEmitter = new Emitter();

      // Contains the model of electricPotential line, each element is an electricPotential line
      // @public read-only
      this.electricPotentialLines = new Group( 'electricPotentialLine', {
        prototype: {
          create: ( tandem, prototypeName, position ) => {

            assert && assert( position instanceof Vector2, 'position should be Vector2' );
            assert && assert( tandem instanceof Tandem, 'tandem should be a Tandem' );

            // for chaining and for PhET-iO restore state
            return new ElectricPotentialLine( this, position, tandem );
          },
          defaultArguments: [ this.electricPotentialSensor.positionProperty.get() ]
        }
      }, {
        tandem: tandem.createTandem( 'electricPotentialLines' ),
        phetioType: GroupIO( ElectricPotentialLineIO )
      } );

      //----------------------------------------------------------------------------------------
      //
      // Hook up all the listeners the model
      //
      //----------------------------------------------------------------------------------------

      this.snapToGridProperty.link( snapToGrid => {
        if ( snapToGrid ) {
          this.snapAllElements();
        }
      } );

      //------------------------
      // AddItem Added Listener on the charged Particles Observable Array
      //------------------------

      // the following logic is the crux of the simulation
      this.chargedParticles.memberCreatedEmitter.addListener( addedChargedParticle => {

        const userControlledListener = isUserControlled => {

          // determine if the charge particle is no longer controlled by the user and is inside the enclosure
          if ( !isUserControlled &&

               // only drop in if the toolbox is showing (may be hidden by phet-io)
               this.isChargesAndSensorsPanelDisplayed && this.isChargesAndSensorsPanelDisplayed() &&
               this.chargesAndSensorsEnclosureBoundsProperty.get().containsPoint( addedChargedParticle.positionProperty.get() ) ) {
            addedChargedParticle.isActiveProperty.set( false ); // charge is no longer active, (effectively) equivalent to set its model charge to zero
            addedChargedParticle.animate(); // animate the charge to its destination position
          }
        };

        addedChargedParticle.isUserControlledProperty.link( userControlledListener );

        const isActiveListener = isActive => {

          // clear all electricPotential lines, i.e. remove all elements from the electricPotentialLines
          this.clearElectricPotentialLines();

          if ( isActive ) {
            // add particle to the activeChargedParticle observable array
            // use for the webGlNode
            this.activeChargedParticles.push( addedChargedParticle );
          }
          else {
            // remove particle from the activeChargeParticle array
            this.activeChargedParticles.remove( addedChargedParticle );
          }
          // update the status of the isPlayAreaCharged,  to find is there is at least one active charge particle on board
          this.updateIsPlayAreaCharged();

          // update the two grid sensors (if they are set to visible), the electric fields sensors and the electricPotential sensor
          this.updateAllSensors();
          this.chargeConfigurationChangedEmitter.emit();
        };

        addedChargedParticle.isActiveProperty.lazyLink( isActiveListener );

        // position and oldPosition refer to a charged particle
        const positionListener = ( position, oldPosition ) => {

          this.updateIsPlayAreaCharged();

          // verify that the charge isActive before doing any charge-dependent updates to the model
          if ( addedChargedParticle.isActiveProperty.get() ) {

            // remove electricPotential lines when the position of a charged particle changes and the charge isActive
            this.clearElectricPotentialLines();

            // update the electricPotential and electricField sensors
            this.updateAllSensors();

          } // end of if (isActive) statement
          this.chargeConfigurationChangedEmitter.emit();
        };

        addedChargedParticle.positionProperty.link( positionListener );

        // remove listeners when a chargedParticle is removed
        chargedParticles.memberDisposedEmitter.addListener( function removalListener( removedChargeParticle ) {
          if ( removedChargeParticle === addedChargedParticle ) {
            addedChargedParticle.isUserControlledProperty.unlink( userControlledListener );
            addedChargedParticle.isActiveProperty.unlink( isActiveListener );
            addedChargedParticle.positionProperty.unlink( positionListener );
            chargedParticles.memberDisposedEmitter.removeListener( removalListener );
          }
        } );
      } );

      //------------------------
      // AddItem Removed Listener on the charged Particles Observable Array
      //------------------------

      this.chargedParticles.memberDisposedEmitter.addListener( removedChargeParticle => {
        // check that the particle was active before updating charge dependent model components
        if ( removedChargeParticle.isActiveProperty.get() && !this.isResetting ) {

          // Remove electricPotential lines
          this.clearElectricPotentialLines();

          // Update all the visible sensors
          this.updateAllSensors();
        }

        // remove particle from the activeChargedParticles array
        this.activeChargedParticles.remove( removedChargeParticle );

        // update the property isPlayAreaCharged to see if is there at least one active charge on the board
        this.updateIsPlayAreaCharged();
        this.chargeConfigurationChangedEmitter.emit();
      } );

      //------------------------
      // AddItem Added Listener on the electric Field Sensors Observable Array
      //------------------------

      this.electricFieldSensors.memberCreatedEmitter.addListener( addedElectricFieldSensor => {

        // Listener for sensor position changes
        const positionListener = position => {
          addedElectricFieldSensor.electricField = this.getElectricField( position );
        };

        // update the Electric Field Sensors upon a change of its own position
        addedElectricFieldSensor.positionProperty.link( positionListener );

        const userControlledListener = isUserControlled => {

          // determine if the sensor is no longer controlled by the user and is inside the enclosure
          if ( !isUserControlled &&

               // only drop in if the toolbox is showing (may be hidden by phet-io)
               this.isChargesAndSensorsPanelDisplayed && this.isChargesAndSensorsPanelDisplayed() &&
               this.chargesAndSensorsEnclosureBoundsProperty.get().containsPoint( addedElectricFieldSensor.positionProperty.get() ) ) {
            addedElectricFieldSensor.isActiveProperty.set( false );
            addedElectricFieldSensor.animate();
          }
        };

        addedElectricFieldSensor.isUserControlledProperty.link( userControlledListener );

        // remove listeners when an electricFieldSensor is removed
        electricFieldSensors.memberDisposedEmitter.addListener( function removalListener( removedElectricFieldSensor ) {
          if ( removedElectricFieldSensor === addedElectricFieldSensor ) {
            addedElectricFieldSensor.isUserControlledProperty.unlink( userControlledListener );
            addedElectricFieldSensor.positionProperty.unlink( positionListener );
            electricFieldSensors.memberDisposedEmitter.removeListener( removalListener );
          }
        } );
      } );
    }

    /**
     * Reset function
     * @public
     */
    reset() {
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
    }

    /**
     * Adds a positive charge to the model, and returns it.
     * @public
     *
     * @returns {ChargedParticle}
     */
    addPositiveCharge() {
      return this.chargedParticles.createNextGroupMember( 1 );
    }

    /**
     * Adds a negative charge to the model, and returns it.
     * @public
     *
     * @returns {ChargedParticle}
     */
    addNegativeCharge() {
      return this.chargedParticles.createNextGroupMember( -1 );
    }

    /**
     * Adds an electric field sensor to the model, and returns it.
     * @public
     */
    addElectricFieldSensor() {
      return this.electricFieldSensors.createNextGroupMember();
    }

    /**
     * Function that determines if there is at least one active and "uncompensated" charge
     * on the board. If this is not the case, it implies that the E-field is zero everywhere
     * (see https://github.com/phetsims/charges-and-fields/issues/46)
     * @private
     */
    updateIsPlayAreaCharged() {
      let netElectricCharge = 0; // {number} Total electric charge on screen
      let numberActiveChargedParticles = 0; // {number} Total active charged particles on screen

      this.activeChargedParticles.forEach( chargedParticle => {
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
        const colocated = this.activeChargedParticles.get( 1 ).positionProperty.get()
                            .minus( this.activeChargedParticles.get( 0 ).positionProperty.get() )
                            .magnitude < MIN_DISTANCE_SCALE;

        this.isPlayAreaChargedProperty.set( colocated ? false : true );

        if ( colocated ) {
          this.electricField = Vector2.ZERO;
        }
      }

      // Check for two compensating pairs
      else if ( numberActiveChargedParticles === 4 ) {
        const positiveChargePositionArray = [];
        const negativeChargePositionArray = [];
        this.activeChargedParticles.forEach( chargedParticle => {
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
    }

    /**
     * Update all sensors
     * @private
     */
    updateAllSensors() {
      this.electricPotentialSensor.update();
      for ( let i = 0; i < this.electricFieldSensors.length; i++ ) {
        this.electricFieldSensors.array[ i ].update();
      }
    }

    /**
     * Return the electric field (a vector) at a location 'position'
     * @private
     * @param {Vector2} position - location of sensor
     * @returns {Vector2} electricField
     */
    getElectricField( position ) {
      const electricField = new Vector2( 0, 0 );

      this.activeChargedParticles.forEach( chargedParticle => {
        const distanceSquared = chargedParticle.positionProperty.get().distanceSquared( position );

        // Avoid bugs stemming from large or infinite fields (#82, #84, #85).
        // Assign the E-field an angle of zero and a magnitude well above the maximum allowed value.
        if ( distanceSquared < MIN_DISTANCE_SCALE ) {
          electricField.x = 10 * ChargesAndFieldsConstants.MAX_EFIELD_MAGNITUDE;
          electricField.y = 0;
          return;
        }

        const distancePowerCube = Math.pow( distanceSquared, 1.5 );

        // For performance reasons, we don't want to generate more vector allocations
        const electricFieldContribution = {
          x: ( position.x - chargedParticle.positionProperty.get().x ) * ( chargedParticle.charge ) / distancePowerCube,
          y: ( position.y - chargedParticle.positionProperty.get().y ) * ( chargedParticle.charge ) / distancePowerCube
        };
        electricField.add( electricFieldContribution );
      } );
      electricField.multiplyScalar( K_CONSTANT ); // prefactor depends on units
      return electricField;
    }

    /**
     * Return the electric potential at a location 'position' due to the configuration of charges on the board.
     * @public read-Only
     * @param {Vector2} position
     * @returns {number} electricPotential
     */
    getElectricPotential( position ) {
      let electricPotential = 0;

      if ( !this.isPlayAreaChargedProperty.get() ) {
        return electricPotential;
      }

      const netChargeOnSite = this.getCharge( position ); // the net charge at position

      if ( netChargeOnSite > 0 ) {
        return Number.POSITIVE_INFINITY;
      }
      else if ( netChargeOnSite < 0 ) {
        return Number.NEGATIVE_INFINITY;
      }
      else {
        this.activeChargedParticles.forEach( chargedParticle => {
          const distance = chargedParticle.positionProperty.get().distance( position );

          if ( distance > 0 ) {
            electricPotential += ( chargedParticle.charge ) / distance;
          }
        } );

        electricPotential *= K_CONSTANT; // prefactor depends on units
        return electricPotential;
      }
    }

    /**
     * get local charge at this position
     * @private
     * @param {Vector2} position
     * @returns {number}
     */
    getCharge( position ) {
      let charge = 0;
      this.activeChargedParticles.forEach( chargedParticle => {
        if ( chargedParticle.positionProperty.value.equals( position ) ) {
          charge += chargedParticle.charge;
        }
      } );
      return charge;
    }

    canAddElectricPotentialLine( position ) {


      // Do not try to add an equipotential line if there are no charges.
      if ( !this.isPlayAreaChargedProperty.get() ) {
        return false;
      }

      // If we are too close to a charged particle, also bail out.
      const isTooCloseToParticle = _.some( _.map( this.activeChargedParticles.getArray(), chargedParticle => {
        // in model coordinates, should be less than the radius (in the view) of a charged particle
        return chargedParticle.positionProperty.get().distance( position ) < 0.03;
      } ) );
      return !isTooCloseToParticle;
    }

    /**
     * Push an electricPotentialLine to an observable array
     * The drawing of the electricPotential line is handled in the view (ElectricPotentialLineView)
     * @public
     * @param {Vector2} [position] - optional argument: starting point to calculate the electricPotential line
     */
    addElectricPotentialLine(
      position = this.electricPotentialSensor.positionProperty.get() // use the Potential Sensor as default position
    ) {

      // TODO: perhaps we want this, but it seems like isPlayAreaChargedProperty is not being kept up and in sync.
      // assert && assert( !this.isPlayAreaChargedProperty.get() );

      // Do not try to add an equipotential line if there are no charges.
      if ( !this.isPlayAreaChargedProperty.get() ) {
        return;
      }

      // If we are too close to a charged particle, also bail out.
      const isTooCloseToParticle = _.some( _.map( this.activeChargedParticles.getArray(), chargedParticle => {

        // in model coordinates, should be less than the radius (in the view) of a charged particle
        return chargedParticle.positionProperty.get().distance( position ) < 0.03;
      } ) );
      if ( isTooCloseToParticle ) {
        return;
      }
      this.electricPotentialLines.createNextGroupMember( position );
    }

    /**
     * Push many electric Potential Lines to an observable array
     * The drawing of the electric Potential Lines is handled in the view.
     * @param {number} numberOfLines
     * USED IN DEBUGGING MODE
     */
    addManyElectricPotentialLines( numberOfLines ) {
      for ( let i = 0; i < numberOfLines; i++ ) {
        const position = new Vector2(
          WIDTH * ( phet.joist.random.nextDouble() - 0.5 ),
          HEIGHT * ( phet.joist.random.nextDouble() - 0.5 ) ); // a random position on the graph

        this.canAddElectricPotentialLine( position ) && this.addElectricPotentialLine( position );
      }
    }

    /**
     * Function that clears the Equipotential Lines Observable Array
     * @public
     */
    clearElectricPotentialLines() {
      const isSettingState = _.hasIn( window, 'phet.phetIo.phetioEngine' ) && phet.phetIo.phetioEngine.phetioStateEngine.isSettingState;

      // Clear lines without disrupting phet-io state
      if ( !isSettingState ) {
        this.electricPotentialLines.clear();
      }
    }

    /**
     * snap the position to the minor gridlines
     * @param {Property.<Vector2>} positionProperty
     * @public
     */
    snapToGridLines( positionProperty ) {
      if ( this.snapToGridProperty.value && this.isGridVisibleProperty.value ) {
        positionProperty.set( positionProperty.get()
          .dividedScalar( GRID_MINOR_SPACING )
          .roundedSymmetric()
          .timesScalar( GRID_MINOR_SPACING ) );
      }
    }

    snapAllElements() {
      this.activeChargedParticles.forEach( chargedParticle => this.snapToGridLines( chargedParticle.positionProperty ) );
      this.electricFieldSensors.array.forEach( electricFieldSensor => this.snapToGridLines( electricFieldSensor.positionProperty ) );

      this.snapToGridLines( this.electricPotentialSensor.positionProperty );
      this.snapToGridLines( this.measuringTape.basePositionProperty );
      this.snapToGridLines( this.measuringTape.tipPositionProperty );
    }
  }

  return chargesAndFields.register( 'ChargesAndFieldsModel', ChargesAndFieldsModel );
} );