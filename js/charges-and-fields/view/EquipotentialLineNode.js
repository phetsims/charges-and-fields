// Copyright 2002-2015, University of Colorado Boulder

/**
 * Scenery Node responsible for the drawing of the equipotential lines and their accompanying voltage labels
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  var pattern_0value_1units = require( 'string!CHARGES_AND_FIELDS/pattern.0value.1units' );
  var voltageUnitString = require( 'string!CHARGES_AND_FIELDS/voltageUnit' );

  // constants
  var IS_DEBUG = false;

  /**
   *
   * @param {ObservableArray.<Object>} equipotentialLinesArray - array of models of equipotentialLine
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<boolean>} isValuesVisibleProperty - control the visibility of the voltage labels
   * @constructor
   */
  function EquipotentialLineNode( equipotentialLinesArray, modelViewTransform, isValuesVisibleProperty ) {

    Node.call( this );

    // Create and add the parent node for all the line nodes
    var lineNode = new Node();
    this.addChild( lineNode );

    // Create and add the parent node for the label nodes
    var labelNode = new Node();
    this.addChild( labelNode );

    var circleNode = new Node();
    this.addChild( circleNode );

    // Monitor the equipotentialLineArray and create a path and label for each equipotentialLine
    equipotentialLinesArray.addItemAddedListener( function( equipotentialLine ) {

      var voltageLabel = labelElectricPotentialLine( equipotentialLine );
      var rectangle = new Rectangle( 0, 0, voltageLabel.width * 1.5, voltageLabel.height * 1.5,
        {
          center: modelViewTransform.modelToViewPosition( equipotentialLine.position )
        } );

      // Link the fill color for the default/projector mode
      var rectangleColorFunction = function( color ) {
        rectangle.fill = color;
      };
      ChargesAndFieldsColors.link( 'background', rectangleColorFunction );

      var equipotentialLinePath = traceElectricPotentialLine( equipotentialLine );
      lineNode.addChild( equipotentialLinePath );
      labelNode.addChild( rectangle );
      labelNode.addChild( voltageLabel );

      if ( IS_DEBUG ) {
        var equipotentialCircle = dotElectricPotentialLine( equipotentialLine );
        circleNode.setChildren( equipotentialCircle );
      }

      equipotentialLinesArray.addItemRemovedListener( function removalListener( removedEquipotentialLine ) {
        if ( removedEquipotentialLine === equipotentialLine ) {
          lineNode.removeChild( equipotentialLinePath );
          labelNode.removeChild( rectangle );
          labelNode.removeChild( voltageLabel );
          if ( IS_DEBUG ) {
            circleNode.removeAllChildren();
          }
          ChargesAndFieldsColors.unlink( 'background', rectangleColorFunction );
          ChargesAndFieldsColors.unlink( 'equipotentialLine', equipotentialLinePath.colorFunction );
          ChargesAndFieldsColors.unlink( 'equipotentialLine', voltageLabel.colorFunction );

          equipotentialLinesArray.removeItemRemovedListener( removalListener );
        }
      } );

    } );

    // Control the visibility of the value (voltage) labels
    // no need to unlink present for the lifetime of the sim
    isValuesVisibleProperty.linkAttribute( labelNode, 'visible' );

    /**
     * Function that generates a path/shape of the equipotential line
     * @param {Object} equipotentialLine - Object of the form {position, positionArray, electricPotential}
     * @returns {Path}
     */
    function traceElectricPotentialLine( equipotentialLine ) {

      // Create and add the equipotential line
      var shape = new Shape();

      // Draw a quadratic curve through all the point in the array
      shape.moveToPoint( equipotentialLine.positionArray [ 0 ] );
      var length = equipotentialLine.positionArray.length;
      var i;
      for ( i = 1; i < length - 2; i++ ) {
        var xc = (equipotentialLine.positionArray[ i ].x + equipotentialLine.positionArray[ i + 1 ].x) / 2;
        var yc = (equipotentialLine.positionArray[ i ].y + equipotentialLine.positionArray[ i + 1 ].y) / 2;
        shape.quadraticCurveTo( equipotentialLine.positionArray[ i ].x, equipotentialLine.positionArray[ i ].y, xc, yc );
      }
      // curve through the last two points
      shape.quadraticCurveTo(
        equipotentialLine.positionArray[ i ].x,
        equipotentialLine.positionArray[ i ].y,
        equipotentialLine.positionArray[ i + 1 ].x,
        equipotentialLine.positionArray[ i + 1 ].y );

      // Simple and naive method to plot lines between all the points
      //shape.moveToPoint( equipotentialLine.positionArray [ 0 ] );
      //equipotentialLine.positionArray.forEach( function( position ) {
      //  shape.lineToPoint( position );
      //} );

      var equipotentialLinePath = new Path( modelViewTransform.modelToViewShape( shape ) );

      equipotentialLinePath.colorFunction = function( color ) {
        equipotentialLinePath.stroke = color;
      };
      // Link the stroke color for the default/projector mode
      ChargesAndFieldsColors.link( 'equipotentialLine', equipotentialLinePath.colorFunction );

      return equipotentialLinePath;
    }

    /**
     * Function that generates a label and a path/shape of the equipotential line
     * @param {Object} equipotentialLine - Object of the form {position, positionArray, electricPotential}
     * @returns {Path}
     */
    function dotElectricPotentialLine( equipotentialLine ) {

      var circleArray = [];

      //Simple and naive method to plot lines between all the points
      equipotentialLine.positionArray.forEach( function( position ) {
        var circle = new Circle( 1 );
        circle.center = modelViewTransform.modelToViewPosition( position );
        circleArray.push( circle );
      } );

      circleArray.colorFunction = function( color ) {
        circleArray.forEach( function( circle ) {
          circle.stroke = color;
        } );
      };
      // Link the stroke color for the default/projector mode
      ChargesAndFieldsColors.link( 'equipotentialLine', circleArray.colorFunction );

      return circleArray;
    }

    /**
     * Function that generates a voltage label for the equipotential line
     * @param {Object} equipotentialLine - Object of the form {position, positionArray, electricPotential}
     * @returns {Text}
     */
    function labelElectricPotentialLine( equipotentialLine ) {

      //Create the voltage label for the equipotential line
      var voltageLabelText = StringUtils.format( pattern_0value_1units, equipotentialLine.electricPotential.toFixed( 1 ), voltageUnitString );
      var voltageLabel = new Text( voltageLabelText,
        {
          font: ChargesAndFieldsConstants.VOLTAGE_LABEL_FONT,
          center: modelViewTransform.modelToViewPosition( equipotentialLine.position )
        } );

      // Link the fill color for the default/projector mode
      voltageLabel.colorFunction = function( color ) {
        voltageLabel.fill = color;
      };

      ChargesAndFieldsColors.link( 'equipotentialLine', voltageLabel.colorFunction );

      return voltageLabel;
    }
  }

  return inherit( Node, EquipotentialLineNode );
} );