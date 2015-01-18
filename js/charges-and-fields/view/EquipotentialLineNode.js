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
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ChargesAndFieldsColors' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  var pattern_0value_1units = require( 'string!CHARGES_AND_FIELDS/pattern.0value.1units' );
  var voltageUnitString = require( 'string!CHARGES_AND_FIELDS/voltageUnit' );

  /**
   *
   * @param {ObservableArray.<Object>} equipotentialLinesArray - array of models of equipotentialLine
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<boolean>} valueIsVisibleProperty - control the visibility of the voltage labels
   * @constructor
   */
  function EquipotentialLineNode( equipotentialLinesArray, modelViewTransform, valueIsVisibleProperty ) {

    Node.call( this );

    // Create and add the parent node for all the line nodes
    var lineNode = new Node();
    this.addChild( lineNode );

    // Create and add the parent node for the label nodes
    var labelNode = new Node();
    this.addChild( labelNode );

    // Monitor the equipotentialLineArray and create a path and label for each equipotentialLine
    equipotentialLinesArray.addItemAddedListener( function( equipotentialLine ) {
      var voltageLabel = labelElectricPotentialLine( equipotentialLine );
      var equipotentialLinePath = traceElectricPotentialLine( equipotentialLine );
      lineNode.addChild( equipotentialLinePath );
      labelNode.addChild( voltageLabel );
      equipotentialLinesArray.addItemRemovedListener( function removalListener( removedEquipotentialLine ) {
        if ( removedEquipotentialLine === equipotentialLine ) {
          lineNode.removeChild( equipotentialLinePath );
          labelNode.removeChild( voltageLabel );
          //TODO: memory leak: should one unlink the voltageLabel and colorFunction? and similarly for equipotentialLinePath
          equipotentialLinesArray.removeItemRemovedListener( removalListener );
        }
      } );
    } );

    // Control the visibility of the value (voltage) labels
    valueIsVisibleProperty.linkAttribute( labelNode, 'visible' );

    /**
     * Function that generates a label and a path/shape of the equipotential line
     * @param {Object} equipotentialLine - Object of the form {position, positionArray, electricPotential}
     */
    function traceElectricPotentialLine( equipotentialLine ) {

      // Create and add the equipotential line
      var shape = new Shape();
      shape.moveToPoint( equipotentialLine.positionArray [0] );
      equipotentialLine.positionArray.forEach( function( position ) {
        shape.lineToPoint( position );
      } );

      var equipotentialLinePath = new Path( modelViewTransform.modelToViewShape( shape ), {stroke: ChargesAndFieldsColors.equipotentialLine.toCSS()} );

      var colorFunction = function( color ) {
        equipotentialLinePath.stroke = color;
      };
      // Link the stroke color for the default/projector mode
      ChargesAndFieldsColors.link( 'equipotentialLine', colorFunction );

      return equipotentialLinePath;
    }

    /**
     * Function that generates a voltage label for the equipotential line
     * @param {Object} equipotentialLine - Object of the form {position, positionArray, electricPotential}
     */
    function labelElectricPotentialLine( equipotentialLine ) {

      //Create the voltage label for the equipotential line
      var voltageLabelText = StringUtils.format( pattern_0value_1units, equipotentialLine.electricPotential.toFixed( 1 ), voltageUnitString );
      var voltageLabel = new Text( voltageLabelText,
        {
          fill: ChargesAndFieldsColors.voltageLabel.toCSS(),
          font: ChargesAndFieldsConstants.VOLTAGE_LABEL_FONT,
          center: modelViewTransform.modelToViewPosition( equipotentialLine.position )
        } );

      // Link the fill color for the default/projector mode
      var colorFunction = function( color ) {
        voltageLabel.fill = color;
      };

      ChargesAndFieldsColors.link( 'voltageLabel', colorFunction );

      return voltageLabel;
    }
  }

  return inherit( Node, EquipotentialLineNode );
} );