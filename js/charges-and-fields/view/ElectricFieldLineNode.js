// Copyright 2002-2015, University of Colorado Boulder

/**
 * Scenery node responsible for the drawing of the electric field lines
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );

  /**
   *
   * @param {ObservableArray.<Object>} electricFieldLinesArray
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function ElectricFieldLineNode( electricFieldLinesArray, modelViewTransform ) {

    Node.call( this );

    var electricFieldLineNode = this;

    electricFieldLinesArray.addItemAddedListener( function( electricFieldLine ) {
      var electricFieldLinePath = traceElectricFieldLine( electricFieldLine );
      electricFieldLineNode.addChild( electricFieldLinePath );

      electricFieldLinesArray.addItemRemovedListener( function removalListener( removedElectricFieldLine ) {
        if ( removedElectricFieldLine === electricFieldLine ) {
          electricFieldLineNode.removeChild( electricFieldLinePath );
          electricFieldLinesArray.removeItemRemovedListener( removalListener );
        }
      } );
    } );

    /**
     * Function that returns a Scenery Path for an electric Field Line model
     * @param {Object} electricFieldLine
     */
    function traceElectricFieldLine( electricFieldLine ) {

      //draw the electricField line

      var arrayLength = electricFieldLine.positionArray.length;
      var arrayIndex;
      var arrowHeadLength = 6; // length of the arrow head in scenery coordinates
      var arrowHeadInternalAngle = Math.PI * 6.5 / 8; // half the internal angle (in radians) form in the arrow head i.e >
      var numberOfSegmentsPerArrow = 50; // number of segment intervals between arrows

      var shape = new Shape();
      shape.moveToPoint( modelViewTransform.modelToViewPosition( electricFieldLine.positionArray [ 0 ] ) );

      for ( arrayIndex = 0; arrayIndex < arrayLength; arrayIndex++ ) {
        var isArrowSegment = ( arrayIndex % numberOfSegmentsPerArrow === Math.floor( numberOfSegmentsPerArrow / 2 ) );  // modulo is arbitrarily, just not 0
        var position = modelViewTransform.modelToViewPosition( electricFieldLine.positionArray[ arrayIndex ] );
        if ( isArrowSegment ) {
          var angle = position.minus( shape.getRelativePoint() ).angle(); // angle of the electric field
          shape
            .lineToPointRelative( {
              x: arrowHeadLength * Math.cos( angle + arrowHeadInternalAngle ),
              y: arrowHeadLength * Math.sin( angle + arrowHeadInternalAngle )
            } )
            .lineToPointRelative( {
              x: 2 * arrowHeadLength * Math.sin( arrowHeadInternalAngle ) * Math.sin( angle ),
              y: -2 * arrowHeadLength * Math.sin( arrowHeadInternalAngle ) * Math.cos( angle )
            } )
            .lineToPointRelative( {
              x: -arrowHeadLength * Math.cos( angle - arrowHeadInternalAngle ),
              y: -arrowHeadLength * Math.sin( angle - arrowHeadInternalAngle )
            } );
        }
        shape.lineToPoint( modelViewTransform.modelToViewPosition( electricFieldLine.positionArray[ arrayIndex ] ) );
      }

      return new Path( shape, { stroke: 'orange', lineWidth: 2 } );
    }

  }

  return inherit( Node, ElectricFieldLineNode );
} );