// Copyright 2002-2013, University of Colorado Boulder

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


  /**
   *
   * @param model
   * @param modelViewTransform
   * @param bounds
   * @param showResolutionProperty
   * @constructor
   */
  function ElectricPotentialFieldNode( model, modelViewTransform, showResolutionProperty ) {

    var electricPotentialFieldNode = this;
    // Call the super constructor
    Node.call( this );

    var vectorDisplacement = model.electricPotentialGrid.get( 2 ).location.minus( model.electricPotentialGrid.get( 1 ).location );
    var unitDistance = modelViewTransform.modelToViewDelta( vectorDisplacement ).magnitude();


    model.electricPotentialGrid.forEach( function( electricPotentialSensor ) {
      var positionInModel = electricPotentialSensor.location;
      //  var electricPotential = electricPotentialSensor.electricPotential;
      var locationInView = modelViewTransform.modelToViewPosition( positionInModel );
      var rect = new Rectangle( 0, 0, unitDistance, unitDistance );
      rect.center = locationInView;


      electricPotentialSensor.electricPotentialProperty.link( function( electricPotential ) {
        var specialColor = model.getColorElectricPotential( positionInModel, electricPotential );
        rect.fill = specialColor;
      } );
      electricPotentialFieldNode.addChild( rect );
    } );

    showResolutionProperty.link( function( isVisible ) {
      electricPotentialFieldNode.visible = isVisible;

      // for performance reason, the electric potential is calculated and updated only if the check is set to visible
      if ( isVisible ) {
        model.electricPotentialGrid.forEach( function( sensorElement ) {
          sensorElement.electricPotential = model.getElectricPotential( sensorElement.location );
        } );
      }
    } );

  }


  return inherit( Node, ElectricPotentialFieldNode );
} );