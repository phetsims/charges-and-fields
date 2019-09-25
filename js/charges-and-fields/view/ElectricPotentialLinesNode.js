// Copyright 2015-2019, University of Colorado Boulder

/**
 * Scenery Node responsible for layering ElectricPotentialLineView related Nodes.
 * TODO: Should this use a Group to hold ElectricPotentialLineView? Yes, though they don't need to be in state
 * @author Martin Veillette (Berea College)
 */
define( require => {
  'use strict';

  // modules
  const chargesAndFields = require( 'CHARGES_AND_FIELDS/chargesAndFields' );
  const ElectricPotentialLineView = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/ElectricPotentialLineView' );
  const Node = require( 'SCENERY/nodes/Node' );

  // if set to true will show the (model and view) positions use in the calculation of the electric potential lines
  const IS_DEBUG = phet.chipper.queryParameters.dev;

  class ElectricPotentialLinesNode extends Node {

    /**
     * @param {ObservableArray.<ElectricPotentialLine>} electricPotentialLines - array of models of electricPotentialLine
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Property.<boolean>} areValuesVisibleProperty - control the visibility of the voltage labels
     * @param {Tandem} tandem
     */
    constructor( electricPotentialLines, modelViewTransform, areValuesVisibleProperty, tandem ) {

      // call the super constructor
      super( { tandem: tandem } );

      // Create and add the parent node for all the lines (paths)
      const pathsNode = new Node();
      this.addChild( pathsNode );

      // Create and add the parent node for the circles (used in DEBUG mode)
      let circlesNode;
      if ( IS_DEBUG ) {
        circlesNode = new Node();
        this.addChild( circlesNode );
      }

      // Create and add the parent node for the label nodes
      const labelsNode = new Node();
      this.addChild( labelsNode );

      // Monitor the electricPotentialLineArray and create a path and label for each electricPotentialLine
      electricPotentialLines.addItemAddedListener( function updateView( electricPotentialLine ) {
        const electricPotentialLineView = new ElectricPotentialLineView( electricPotentialLine, modelViewTransform );

        pathsNode.addChild( electricPotentialLineView.path );
        labelsNode.addChild( electricPotentialLineView.voltageLabel );

        // add the circles and text
        if ( IS_DEBUG ) {
          circlesNode.addChild( electricPotentialLineView.circles );
        }

        const modelDisposeListener = () => electricPotentialLineView.dispose();
        electricPotentialLine.disposeEmitter.addListener( modelDisposeListener );

        // try again next time we changed
        electricPotentialLine.chargeChangedEmitter.addListener( function chargeChangedListener() {

          // tear down and recreate the view on change
          modelDisposeListener();
          updateView( electricPotentialLine );

          electricPotentialLine.disposeEmitter.removeListener( modelDisposeListener );
          electricPotentialLine.chargeChangedEmitter.removeListener( chargeChangedListener );
        } );
      } );

      // Control the visibility of the value (voltage) labels
      // no need to unlink present for the lifetime of the sim
      areValuesVisibleProperty.linkAttribute( labelsNode, 'visible' );
    }
  }

  return chargesAndFields.register( 'ElectricPotentialLinesNode', ElectricPotentialLinesNode );
} );

