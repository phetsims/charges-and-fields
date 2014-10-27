//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Node responsible for the drawing of the equipotential lines
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules

  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Shape = require( 'KITE/Shape' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants

  var LABEL_COLOR = 'brown';
  var LABEL_FONT = new PhetFont( { size: 18, weight: 'bold' } );

  // strings

  var pattern_0value_1units = require( 'string!CHARGES_AND_FIELDS/pattern.0value.1units' );
  var voltageUnitString = require( 'string!CHARGES_AND_FIELDS/voltageUnit' );

  /**
   *
   * @param {model} model of the simulation
   * @param {ModelViewTransform2}  modelViewTransform
   * @constructor
   */
  function EquipotentialLineNode( model, modelViewTransform ) {

    Node.call( this );
    this.modelViewTransform = modelViewTransform;

    var equipotentialLineNode = this;

    // create and add the equipotentialLine node for the labels
    this.equipotentialLabelNode = new Node();
    this.addChild( this.equipotentialLabelNode );


    model.equipotentialLinesArray.addItemAddedListener( function( equipotentialLine ) {
      equipotentialLineNode.traceElectricPotentialLine( equipotentialLine );

//      model.equipotentialLinesArray.addItemRemovedListener( function removalListener( removedEquipotentialLine ) {
//          if ( removedEquipotentialLine === equipotentialLine ) {
//            equipotentialLineNode.removeChild(removedEquipotentialLine.path);
//            model.equipotentialLinesArray.removeItemRemovedListener( removalListener );
//          }
//        } );
    } );

    // remove the nodes and clear the array the equipotential lines
    model.clearEquipotentialLinesProperty.link( function() {
      equipotentialLineNode.equipotentialLabelNode.removeAllChildren();
      equipotentialLineNode.removeAllChildren();
      model.clearEquipotentialLines = false;
    } );


    // control the visibility of the number labels
    model.showNumbersIsVisibleProperty.link( function( isVisible ) {
      equipotentialLineNode.equipotentialLabelNode.visible = isVisible;
    } );
  }

  return inherit( Node, EquipotentialLineNode, {
    traceElectricPotentialLine: function( equipotentialLine ) {

      var modelViewTransform = this.modelViewTransform;

      //add and create the label for the equipotential line
      var voltageLabelText = StringUtils.format( pattern_0value_1units, equipotentialLine.electricPotential.toFixed( 1 ), voltageUnitString );
      var voltageLabel = new Text( voltageLabelText, { fill: LABEL_COLOR, font: LABEL_FONT, pickable: false} );
      voltageLabel.center = modelViewTransform.modelToViewPosition( equipotentialLine.position );
      this.equipotentialLabelNode.addChild( voltageLabel );

      //draw the equipotential line
      var shape = new Shape();
      shape.moveToPoint( modelViewTransform.modelToViewPosition( equipotentialLine.positionArray [0] ) );
      equipotentialLine.positionArray.forEach( function( position ) {
        shape.lineToPoint( modelViewTransform.modelToViewPosition( position ) );
      } );
      this.addChild( new Path( shape, {stroke: 'green', lineWidth: 1, pickable: false} ) );
    }
  } );
} );