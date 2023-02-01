// Copyright 2015-2023, University of Colorado Boulder

/**
 * Type responsible for creating an electric potential line
 *
 * @author Martin Veillette (Berea College)
 */

import Emitter from '../../../../axon/js/Emitter.js';
import dot from '../../../../dot/js/dot.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import chargesAndFields from '../../chargesAndFields.js';

// constants
// see getEquipotentialPositionArray to find how these are used
const MAX_STEPS = 5000; // {number} integer, the maximum number of steps in the search for a closed path
const MIN_STEPS = 1000; // {number} integer, the minimum number of steps it will do while searching for a closed path
const MAX_EPSILON_DISTANCE = 0.05; // {number} maximum step length along electricPotential in meters
const MIN_EPSILON_DISTANCE = 0.01; // {number} minimum step length along electricPotential in meters

class ElectricPotentialLine extends PhetioObject {

  /**
   * @param {ChargesAndFieldsModel} model
   * @param {Vector2} position
   * @param {Tandem} tandem
   */
  constructor( model, position, tandem ) {

    super( {
      tandem: tandem,
      phetioType: ElectricPotentialLine.ElectricPotentialLineIO,
      phetioDynamicElement: true
    } );

    this.model = model;
    this.position = position; // {Vector2} @public read-only static

    // @public - the position of where the user is trying to drag the voltage label, in model coordinates
    this.voltageLabelPositionProperty = new Vector2Property( position, {
      tandem: tandem.createTandem( 'voltageLabelPositionProperty' ),
      valueComparisonStrategy: 'equalsFunction'
    } );

    this.chargeChangedEmitter = new Emitter();

    // On startup and whenever the charge configuration changes, update the state of this line
    this.chargeChangedListener = () => {
      this.electricPotential = model.getElectricPotential( position ); // {number} @public read-only static - value in volts

      this.isLineClosed = false; // @private - value will be updated by  this.getEquipotentialPositionArray
      this.isEquipotentialLineTerminatingInsideBounds = true; // @private - value will be updated by this.getEquipotentialPositionArray

      // TODO: the conditional here is to support mutating this potential line, let's do this better.
      const hasElectricField = this.model.getElectricField( position ).magnitude !== 0;
      this.positionArray = hasElectricField ? this.getEquipotentialPositionArray( position ) : []; // @public read-only

      if ( !this.isDisposed ) {
        this.chargeChangedEmitter.emit();
      }
    };
    this.chargeChangedListener();
    this.model.chargeConfigurationChangedEmitter.addListener( this.chargeChangedListener );
  }

  /**
   * Releases references
   * @public
   * @override
   */
  dispose() {
    this.model.chargeConfigurationChangedEmitter.removeListener( this.chargeChangedListener );
    this.voltageLabelPositionProperty.dispose();
    this.chargeChangedEmitter.dispose();
    super.dispose();
  }

  /**
   * Given an (initial) position, find a position with the targeted electric potential within a distance 'deltaDistance'
   * This finds the next position with a precision of  ('deltaDistance')^2. There are other algorithms
   * that are more precise however, this is globally quite precise since it keeps track of the targeted electric potential
   * and therefore there is no electric potential drift over large distance. The drawback of this approach is that
   * there is no guarantee that the next position is within a delta distance from the initial point.
   * see https://github.com/phetsims/charges-and-fields/issues/5
   *
   * @private
   * @param {Vector2} position
   * @param {number} electricPotential
   * @param {number} deltaDistance - a distance in meters, can be positive or negative
   * @returns {Vector2} finalPosition
   */
  getNextPositionAlongEquipotentialWithElectricPotential( position, electricPotential, deltaDistance ) {
    /*
     * General Idea: Given the electric field at point position, find an intermediate point that is 90 degrees
     * to the left of the electric field (if deltaDistance is positive) or to the right (if deltaDistance is negative).
     * A further correction is applied since this intermediate point will not have the same electric potential
     * as the targeted electric potential. To find the final point, the electric potential offset between the targeted
     * and the electric potential at the intermediate point is found. By knowing the electric field at the intermediate point
     * the next point should be found (approximately) at a distance epsilon equal to (Delta V)/|E| of the intermediate point.
     */
    const initialElectricField = this.model.getElectricField( position ); // {Vector2}
    assert && assert( initialElectricField.magnitude !== 0, 'the magnitude of the electric field is zero: initial Electric Field' );
    const electricPotentialNormalizedVector = initialElectricField.normalize().rotate( Math.PI / 2 ); // {Vector2} normalized Vector along electricPotential
    const midwayPosition = ( electricPotentialNormalizedVector.multiplyScalar( deltaDistance ) ).add( position ); // {Vector2}
    const midwayElectricField = this.model.getElectricField( midwayPosition ); // {Vector2}
    assert && assert( midwayElectricField.magnitude !== 0, 'the magnitude of the electric field is zero: midway Electric Field ' );
    const midwayElectricPotential = this.model.getElectricPotential( midwayPosition ); //  {number}
    const deltaElectricPotential = midwayElectricPotential - electricPotential; // {number}
    const deltaPosition = midwayElectricField.multiplyScalar( deltaElectricPotential / midwayElectricField.magnitudeSquared ); // {Vector2}

    // if the second order correction is larger than the first, use a more computationally expensive but accurate method.
    if ( deltaPosition.magnitude > Math.abs( deltaDistance ) ) {

      // use a fail safe method
      return this.getNextPositionAlongEquipotentialWithRK4( position, deltaDistance );
    }
    else {
      return midwayPosition.add( deltaPosition ); // {Vector2} finalPosition
    }
  }

  /**
   * Given an (initial) position, find a position with the same (ideally) electric potential within a distance deltaDistance
   * of the initial position. This is locally precise to (deltaDistance)^4 and guaranteed to be within a distance deltaDistance
   * from the starting point.
   *
   * This uses a standard RK4 algorithm generalized to 2D
   * http://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods
   * @private
   * @param {Vector2} position
   * @param {number} deltaDistance - a distance in meters, can be positive or negative
   * @returns {Vector2} finalPosition
   */
  getNextPositionAlongEquipotentialWithRK4( position, deltaDistance ) {
    const initialElectricField = this.model.getElectricField( position ); // {Vector2}
    assert && assert( initialElectricField.magnitude !== 0, 'the magnitude of the electric field is zero: initial Electric Field' );
    const k1Vector = this.model.getElectricField( position ).normalize().rotate( Math.PI / 2 ); // {Vector2} normalized Vector along electricPotential
    const k2Vector = this.model.getElectricField( position.plus( k1Vector.timesScalar( deltaDistance / 2 ) ) ).normalize().rotate( Math.PI / 2 ); // {Vector2} normalized Vector along electricPotential
    const k3Vector = this.model.getElectricField( position.plus( k2Vector.timesScalar( deltaDistance / 2 ) ) ).normalize().rotate( Math.PI / 2 ); // {Vector2} normalized Vector along electricPotential
    const k4Vector = this.model.getElectricField( position.plus( k3Vector.timesScalar( deltaDistance ) ) ).normalize().rotate( Math.PI / 2 ); // {Vector2} normalized Vector along electricPotential
    const deltaDisplacement =
      {
        x: deltaDistance * ( k1Vector.x + 2 * k2Vector.x + 2 * k3Vector.x + k4Vector.x ) / 6,
        y: deltaDistance * ( k1Vector.y + 2 * k2Vector.y + 2 * k3Vector.y + k4Vector.y ) / 6
      };
    return position.plus( deltaDisplacement ); // {Vector2} finalPosition
  }

  /**
   * This method returns an array of points {Vector2} with the same electric potential as the electric potential
   * at the initial position. The array is ordered with position points going counterclockwise.
   *
   * This function has side effects and updates this.isEquipotentialLineTerminatingInsideBounds and
   * this.isLineClosed.
   *
   * @private
   * @param {Vector2} position - initial position
   * @returns {Array.<Vector2>} a series of positions with the same electric Potential as the initial position
   */
  getEquipotentialPositionArray( position ) {

    if ( this.model.activeChargedParticles.length === 0 ) {
      return [];
    }

    /*
     * General Idea of this algorithm
     *
     * The electricPotential line is found using two searches. Starting from an initial point, we find the electric
     * field at this position and define the point to the left of the electric field as the counterclockwise point,
     * whereas the point that is 90 degree right of the electric field is the clockwise point. The points are stored
     * in a counterclockwise and clockwise array. The search of the clockwise and counterclockwise points done
     * concurrently. The search stops if (1) the number of searching steps exceeds a large number and (2) either the
     * clockwise or counterClockwise point is very far away from the origin. A third condition to bailout of the
     * search is that the clockwise and counterClockwise position are very close to one another in which case we have
     * a closed electricPotential line. Note that if the conditions (1) and (2) are fulfilled the electricPotential
     * line is not going to be a closed line but this is so far away from the screenview that the end user will simply
     * see the line going beyond the screen.
     *
     * After the search is done, the function returns an array of points ordered in a counterclockwise direction,
     * i.e. after joining all the points, the directed line would be made of points that have an electric field
     * pointing clockwise (yes  clockwise) to the direction of the line.
     */
    let stepCounter = 0; // {number} integer

    let nextClockwisePosition; // {Vector2}
    let nextCounterClockwisePosition; // {Vector2}
    let currentClockwisePosition = position; // {Vector2}
    let currentCounterClockwisePosition = position; // {Vector2}
    const clockwisePositionArray = [];
    const counterClockwisePositionArray = [];

    // initial epsilon distance for the two heads.
    let clockwiseEpsilonDistance = MIN_EPSILON_DISTANCE;
    let counterClockwiseEpsilonDistance = -clockwiseEpsilonDistance;

    while ( ( stepCounter < MAX_STEPS ) && !this.isLineClosed &&
            ( this.isEquipotentialLineTerminatingInsideBounds || ( stepCounter < MIN_STEPS ) ) ) {

      nextClockwisePosition = this.getNextPositionAlongEquipotentialWithElectricPotential(
        currentClockwisePosition,
        this.electricPotential,
        clockwiseEpsilonDistance );
      nextCounterClockwisePosition = this.getNextPositionAlongEquipotentialWithElectricPotential(
        currentCounterClockwisePosition,
        this.electricPotential,
        counterClockwiseEpsilonDistance );

      clockwisePositionArray.push( nextClockwisePosition );
      counterClockwisePositionArray.push( nextCounterClockwisePosition );

      currentClockwisePosition = nextClockwisePosition;
      currentCounterClockwisePosition = nextCounterClockwisePosition;

      stepCounter++;

      // after three steps, the epsilon distance is adaptative, i.e. large distance when 'easy', small when 'difficult'
      if ( stepCounter > 3 ) {

        // adaptative epsilon distance
        clockwiseEpsilonDistance = this.getAdaptativeEpsilonDistance( clockwiseEpsilonDistance, clockwisePositionArray, true );
        counterClockwiseEpsilonDistance = this.getAdaptativeEpsilonDistance( counterClockwiseEpsilonDistance, counterClockwisePositionArray, false );

        assert && assert( clockwiseEpsilonDistance > 0 ); // sanity check
        assert && assert( counterClockwiseEpsilonDistance < 0 );

        // distance between the two searching heads
        const approachDistance = currentClockwisePosition.distance( currentCounterClockwisePosition );

        // logic to stop the while loop when the two heads are getting closer
        if ( approachDistance < clockwiseEpsilonDistance + Math.abs( counterClockwiseEpsilonDistance ) ) {

          // we want to perform more steps as the two head get closer but we want to avoid the two heads to pass
          // one another. Let's reduce the epsilon distance
          clockwiseEpsilonDistance = approachDistance / 3;
          counterClockwiseEpsilonDistance = -clockwiseEpsilonDistance;
          if ( approachDistance < 2 * MIN_EPSILON_DISTANCE ) {

            // if the clockwise and counterclockwise points are close to one another, set this.isLineClosed to true to get out of this while loop
            this.isLineClosed = true;
          }
        }
      } // end of if (stepCounter>3)

      // is at least one current head inside the bounds?
      this.isEquipotentialLineTerminatingInsideBounds =
        ( this.model.enlargedBounds.containsPoint( currentClockwisePosition ) || this.model.enlargedBounds.containsPoint( currentCounterClockwisePosition ) );

    } // end of while()

    if ( !this.isLineClosed && this.isEquipotentialLineTerminatingInsideBounds ) {

      // see https://github.com/phetsims/charges-and-fields/issues/1
      // this is very difficult to come up with such a scenario. so far this
      // was encountered only with a pure quadrupole configuration.
      // let's redo the entire process but starting a tad to the right so we don't get stuck in our search
      const weeVector = new Vector2( 0.00031415, 0.00027178 ); // (pi, e)
      return this.getEquipotentialPositionArray( position.plus( weeVector ) );
    }

    // let's order all the positions (including the initial point) in an array in a counterclockwise fashion
    const reversedArray = clockwisePositionArray.reverse();

    // let's return the entire array, i.e. the reversed clockwise array, the initial position, and the counterclockwise array
    return reversedArray.concat( position, counterClockwisePositionArray );
  }

  /**
   * Function that prunes points from a positionArray. The goal of this method is to
   * speed up the laying out the line by passing to scenery the minimal number of points
   * in the position array while being visually equivalent.
   * For instance this method would remove the middle point of three consecutive collinear points.
   * More generally, if the middle point is a distance less than maxOffset of the line connecting the two
   * neighboring points, then it is removed.
   *
   * @private
   * @param {Array.<Vector2>} positionArray
   * @returns {Array.<Vector2>}
   */
  getPrunedPositionArray( positionArray ) {
    const length = positionArray.length;
    const prunedPositionArray = []; // {Array.<Vector2>}

    if ( length === 0 ) {
      return [];
    }

    // push first data point
    prunedPositionArray.push( positionArray[ 0 ] );

    const maxOffset = 0.001; // in model coordinates, the threshold of visual acuity when rendered on the screen
    let lastPushedIndex = 0; // index of the last positionArray element pushed into prunedPosition

    for ( let i = 1; i < length - 1; i++ ) {
      const lastPushedPoint = prunedPositionArray[ prunedPositionArray.length - 1 ];

      for ( let j = lastPushedIndex; j < i + 1; j++ ) {
        const distance = this.getDistanceFromLine( lastPushedPoint, positionArray[ j + 1 ], positionArray[ i + 1 ] );
        if ( distance > maxOffset ) {
          prunedPositionArray.push( positionArray[ i ] );
          lastPushedIndex = i;
          break; // breaks out of the inner for loop
        }
      }
    }

    // push last data point
    prunedPositionArray.push( positionArray[ length - 1 ] );
    return prunedPositionArray;
  }

  /**
   * Function that returns the smallest distance between the midwayPoint and
   * a straight line that would connect initialPoint and finalPoint.
   * see http://mathworld.wolfram.com/Point-LineDistance2-Dimensional.html
   * @private
   * @param {Vector2} initialPoint
   * @param {Vector2} midwayPoint
   * @param {Vector2} finalPoint
   * @returns {number}
   */
  getDistanceFromLine( initialPoint, midwayPoint, finalPoint ) {
    const midwayDisplacement = midwayPoint.minus( initialPoint );
    const finalDisplacement = finalPoint.minus( initialPoint );
    return Math.abs( midwayDisplacement.crossScalar( finalDisplacement.normalized() ) );
  }

  /**
   * Function that returns the an updated epsilonDistance based on the three last points
   * of positionArray
   * @private
   * @param {number} epsilonDistance
   * @param {Array.<Vector2>} positionArray
   * @param {boolean} isClockwise
   * @returns {number}
   */
  getAdaptativeEpsilonDistance( epsilonDistance, positionArray, isClockwise ) {
    const deflectionAngle = this.getRotationAngle( positionArray ); // non negative number in radians
    if ( deflectionAngle === 0 ) {

      // pedal to metal
      epsilonDistance = MAX_EPSILON_DISTANCE;
    }
    else {

      // shorten the epsilon distance in tight turns, longer steps in straighter stretch
      // 360 implies that a perfect circle could be generated by 360 points, i.e. a rotation of 1 degree doesn't change epsilonDistance.
      epsilonDistance *= ( 2 * Math.PI / 360 ) / deflectionAngle;
    }
    // clamp the value of epsilonDistance to be within this range
    epsilonDistance = dot.clamp( Math.abs( epsilonDistance ), MIN_EPSILON_DISTANCE, MAX_EPSILON_DISTANCE );
    epsilonDistance = isClockwise ? epsilonDistance : -epsilonDistance;
    return epsilonDistance;
  }

  /**
   * Function that returns the rotation angle between the three last points of a position array
   *
   * @private
   * @param {Array.<Vector2>} positionArray
   * @returns {number}
   */
  getRotationAngle( positionArray ) {
    assert && assert( positionArray.length > 2, 'the positionArray must contain at least three elements' );
    const length = positionArray.length;
    const newDeltaPosition = positionArray[ length - 1 ].minus( positionArray[ length - 2 ] );
    const oldDeltaPosition = positionArray[ length - 2 ].minus( positionArray[ length - 3 ] );
    return newDeltaPosition.angleBetween( oldDeltaPosition ); // a positive number
  }

  /**
   * Returns the Shape of the electric potential line
   * @public read-only
   * @returns {Shape}
   */
  getShape() {
    const shape = new Shape();
    if ( this.model.activeChargedParticles.lengthProperty.value === 0 ) {
      return shape; // to support mutable potential lines and PhET-iO state
    }
    const prunedPositionArray = this.getPrunedPositionArray( this.positionArray );
    return this.positionArrayToStraightLine( shape, prunedPositionArray, { isClosedLineSegments: this.isLineClosed } );
  }

  /**
   * Function that returns an appended shape with lines between points.
   * @private
   * @param {Shape} shape
   * @param {Array.<Vector2>} positionArray
   * @param {Object} [options]
   * @returns {Shape}
   */
  positionArrayToStraightLine( shape, positionArray, options ) {
    options = merge( {
      // is the resulting shape forming a close path
      isClosedLineSegments: false
    }, options );

    // if the line is open, there is one less segments than point vectors
    const segmentsNumber = ( options.isClosedLineSegments ) ? positionArray.length : positionArray.length - 1;

    shape.moveToPoint( positionArray[ 0 ] );
    for ( let i = 1; i < segmentsNumber + 1; i++ ) {
      shape.lineToPoint( positionArray[ ( i ) % positionArray.length ] );
    }
    return shape;
  }
}

ElectricPotentialLine.ElectricPotentialLineIO = new IOType( 'ElectricPotentialLineIO', {
  valueType: ElectricPotentialLine,
  documentation: 'The vector that shows the charge strength and direction.',
  toStateObject: electricPotentialLine => ( {
    position: Vector2.Vector2IO.toStateObject( electricPotentialLine.position )
  } ),
  stateSchema: {
    position: Vector2.Vector2IO
  },
  stateObjectToCreateElementArguments: stateObject => [ Vector2.Vector2IO.fromStateObject( stateObject.position ) ]
} );

chargesAndFields.register( 'ElectricPotentialLine', ElectricPotentialLine );
export default ElectricPotentialLine;
