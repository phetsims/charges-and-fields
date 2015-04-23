// Copyright 2002-2015, University of Colorado Boulder

/**
 * Scenery node responsible for the drawing of the electric field lines
 *
 * @author Martin Veillette (Berea College)
 */
define( function ( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );

  /**
   *
   * @param {ObservableArray.<ElectricFieldLine>} electricFieldLinesArray
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   * @constructor
   */
  function ElectricFieldLineNode( electricFieldLinesArray, modelViewTransform, options ) {

    Node.call( this );

    options = _.extend( {
      stroke: 'orange',
      lineWidth: 2
    }, options );

    var electricFieldLineNode = this;

    electricFieldLinesArray.addItemAddedListener( function ( electricFieldLine ) {
      var electricFieldLinePath = new Path( modelViewTransform.modelToViewShape( electricFieldLine.getShape() ), options );
      electricFieldLineNode.addChild( electricFieldLinePath );

      electricFieldLinesArray.addItemRemovedListener( function removalListener( removedElectricFieldLine ) {
        if ( removedElectricFieldLine === electricFieldLine ) {
          electricFieldLineNode.removeChild( electricFieldLinePath );
          electricFieldLinesArray.removeItemRemovedListener( removalListener );
        }
      } );
    } );
  }

  return inherit( Node, ElectricFieldLineNode );
} );