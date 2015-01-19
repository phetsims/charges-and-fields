// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the equipotential Lines
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
    'use strict';

    // modules

    var inherit = require( 'PHET_CORE/inherit' );
    var Node = require( 'SCENERY/nodes/Node' );
    var Rectangle = require( 'SCENERY/nodes/Rectangle' );
//  var RectangleWebGLDrawable = require( 'SCENERY/nodes/drawable/RectangleWebGLDrawable' );
//    var LinearGradient = require( 'SCENERY/util/LinearGradient' );

//  var WebGLNode = require( 'SCENERY/nodes/WebGLNode' );
//  var WebGLLayer = require( 'SCENERY/layers/WebGLLayer' );


    /**
     *
     * @param {ObservableArray.<SensorElement>} electricPotentialGrid
     * @param {Function} getColorElectricPotential - A function that maps a color to a value of the electric potential
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Property.<boolean>} isVisibleProperty
     * @constructor
     */
    function ElectricPotentialFieldNode( electricPotentialGrid, getColorElectricPotential, modelViewTransform, isVisibleProperty ) {

        var electricPotentialFieldNode = this;
        // Call the super constructor
        Node.call( this );

        // find the distance between two adjacent electric Potential Sensors
        var vectorDisplacement = electricPotentialGrid[2].position.minus( electricPotentialGrid[1].position );
        var unitDistance = modelViewTransform.modelToViewDelta( vectorDisplacement ).magnitude();

        electricPotentialGrid.forEach( function( electricPotentialSensor ) {
            var positionInModel = electricPotentialSensor.position;
            var positionInView = modelViewTransform.modelToViewPosition( positionInModel );
            var rect = new Rectangle( 0, 0, unitDistance, unitDistance );
            rect.center = positionInView;
            electricPotentialFieldNode.addChild( rect );

            electricPotentialSensor.electricPotentialProperty.link( function( electricPotential ) {
                var specialColor = getColorElectricPotential( positionInModel, electricPotential );
                rect.fill = specialColor;
                rect.stroke = specialColor;
            } );

        } );

        isVisibleProperty.link( function( isVisible ) {
            electricPotentialFieldNode.visible = isVisible;
        } );

    }

    return inherit( Node, ElectricPotentialFieldNode );
} );