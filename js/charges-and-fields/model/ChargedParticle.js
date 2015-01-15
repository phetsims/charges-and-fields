// Copyright 2002-2015, University of Colorado Boulder

/**
 * Model of a charged particle
 * The particle has a mutable position and charge.
 *
 * @author Martin Veillette (Berea College)
 */

define(function (require) {
    'use strict';

    // modules
    var inherit = require('PHET_CORE/inherit');
    var PropertySet = require('AXON/PropertySet');
    var Vector2 = require('DOT/Vector2');

    /**
     *
     * @param {Vector2} position
     * @param {Number} charge - (positive=+1 or negative=-1)
     * @constructor
     */
    function ChargedParticle(position, charge) {

        PropertySet.call(this, {

            // @public
            position: position,

            // @public
            userControlled: false,

            // @public
            // Flag that indicates whether this element is animating from one location to another, should not be set externally.
            animating: false
        });

        assert && assert(charge === 1 || charge === -1, 'Charges should be +1 or -1');

        // @public read-only
        this.charge = charge;
    }

    return inherit(PropertySet, ChargedParticle, {
        // @public
        reset: function () {
            PropertySet.prototype.reset.call(this);
        },
        step: function (dt) {
            if (this.animating) {
                this.animationStep(dt);
            }
        },

        animationStep: function (dt) {

            // perform any animation
            var distanceToDestination = this.position.distance(this.positionProperty.initialValue);
            if (distanceToDestination > dt * 20) {
                // Move a step toward the position.
                var stepAngle = Math.atan2(this.positionProperty.initialValue.y - this.position.y, this.positionProperty.initialValue.x - this.position.x);
                var stepVector = Vector2.createPolar(20 * dt, stepAngle);
                this.position = this.position.plus(stepVector);
            }
            else {
                // Less than one time step away, so just go to the initial position.
                this.position = this.positionProperty.initialValue;
                this.animating = false;
                this.trigger('returnedToOrigin');
            }
        }

    });
});



