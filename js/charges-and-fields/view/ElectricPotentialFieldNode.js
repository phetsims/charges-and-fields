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
//  var RectangleWebGLDrawable = require( 'SCENERY/nodes/drawable/RectangleWebGLDrawable' );
  var Util = require( 'SCENERY/util/Util' );

//  var WebGLNode = require( 'SCENERY/nodes/WebGLNode' );
//  var WebGLLayer = require( 'SCENERY/layers/WebGLLayer' );


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

    var vectorDisplacement = model.electricPotentialGrid.get( 2 ).position.minus( model.electricPotentialGrid.get( 1 ).position );
    var unitDistance = modelViewTransform.modelToViewDelta( vectorDisplacement ).magnitude();


//    // Check to see if WebGL was prevented by a query parameter
//    var allowWebGL = window.phetcommon.getQueryParameter( 'webgl' ) !== 'false';
//
//    var webGLSupported = Util.isWebGLSupported && allowWebGL;
//
//    // Use WebGL where available, but not on IE, due to https://github.com/phetsims/energy-skate-park-basics/issues/277
//    // and https://github.com/phetsims/scenery/issues/285
//    var renderer = webGLSupported ? 'webgl' : 'svg';
//
////    var pieChartNode = renderer === 'webgl' ? new PieChartWebGLNode( model.skater, model.property( 'pieChartVisible' ), modelViewTransform ) :
////                       new PieChartNode( model.skater, model.property( 'pieChartVisible' ), modelViewTransform );
////    this.addChild( pieChartNode );



    model.electricPotentialGrid.forEach( function( electricPotentialSensor ) {
      var positionInModel = electricPotentialSensor.position;
      //  var electricPotential = electricPotentialSensor.electricPotential;
      var positionInView = modelViewTransform.modelToViewPosition( positionInModel );
      var rect = new Rectangle( 0, 0, unitDistance, unitDistance );
      rect.center = positionInView;


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
          sensorElement.electricPotential = model.getElectricPotential( sensorElement.position );
        } );
      }
    } );

  }


  return inherit( Node, ElectricPotentialFieldNode );
} );