// Copyright 2002-2014, University of Colorado Boulder

/**
 * Model of a charged particle
 * The particle has a mutable position and charge.
 *
 * @author Martin Veillette (Berea College)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   *
   * @param {Vector2} position
   * @param {Number} charge (positive=+1 or negative=-1)
   * @constructor
   */
  function ChargedParticle( position, charge ) {

    PropertySet.call( this, {

      // @public
      position: position,
      // @public Flag that tracks whether the user is dragging this data point around. Should be set externally, generally by the a
      // view node.
      userControlled: false,

      // @public Flag that indicates whether this element is animating from one location to another, should not be set externally.
      animating: false

    } );

    assert && assert( charge === 1 || charge === -1, 'Charges should be +1 or -1' );

    // @public read-only
    this.charge = charge;

    // @public read-only
    //TODO Is it necessary?, using positionPropery.initial?
    this.initialPosition = position;
  }

  return inherit( PropertySet, ChargedParticle, {
    // @public
    reset: function() {
      PropertySet.prototype.reset.call( this );
    },

    // @public
    step: function( dt ) {
      if ( this.animating ) {
        this.animationStep( dt );
      }
    },
    // @private
    animationStep: function( dt ) {
      // perform any animation
      var distanceToDestination = this.position.distance( this.initialPosition );

      // TODO: ANIMATION_VELOCITY is set in the model: not the view... adapt for scaling factor
      if ( distanceToDestination > dt * 100 ) {
        // Move a step toward the position.
        var stepAngle = Math.atan2( this.initialPosition.y - this.position.y, this.initialPosition.x - this.position.x );
        var stepVector = Vector2.createPolar( 100 * dt, stepAngle );
        this.position = this.position.plus( stepVector );
      }
      else {
        // Less than one time step away, so just go to the initial position.
        this.position = this.initialPosition;
        this.animating = false;
        this.trigger( 'returnedToOrigin' );
      }
    }
  } );
} );
