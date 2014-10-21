// Copyright 2002-2014, University of Colorado Boulder

/**
 * Control panel.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules

  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );

  //strings

  var equipotentialString = require( 'string!CHARGES_AND_FIELDS/equipotential' );
  var voltageString = require( 'string!CHARGES_AND_FIELDS/voltage' );


  /**
   *
   * @param {Model} model
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options] scenery options for rendering the control panel, see the constructor for options.
   * @constructor
   */
  function ElectricPotentialSensorPanel( model, modelViewTransform, options ) {

    this.model = model;
    this.modelViewTransform = modelViewTransform;
    // Demonstrate a common pattern for specifying options and providing default values.
    options = _.extend( {
        xMargin: 10,
        yMargin: 10,
        stroke: 'blue',
        lineWidth: 3
      },
      options );

    var plotElectricPotentialLineButton = new TextPushButton( 'Plot V', {
      font: new PhetFont( 16 ),
      baseColor: 'green',
      xMargin: 10,
      listener: function() {
        model.addElectricPotentialLine();
      }
    } );
    var plotElectricFieldLineButton = new TextPushButton( 'Plot E', {
      font: new PhetFont( 16 ),
      baseColor: 'orange',
      xMargin: 10,
      listener: function() {
        model.addElectricFieldLine();
        //     model.addManyLine();
      }
    } );
    var clearButton = new TextPushButton( 'Clear', {
      font: new PhetFont( 16 ),
      baseColor: 'pink',
      xMargin: 10,
      listener: function() {
        model.clearEquipotentialLines = true;
        model.clearElectricFieldLines = true;
      }
    } );

    var equipotential = new Text( equipotentialString, {
      font: new PhetFont( 16 ),
      fill: 'grey',
      xMargin: 10
    } );


    this.voltageReading = new Text( '?', {
      font: new PhetFont( 16 ),
      fill: 'grey',
      xMargin: 10
    } );


    var voltage = new Text( voltageString, {
      font: new PhetFont( 16 ),
      fill: 'grey',
      xMargin: 10
    } );

    // The contents of the control panel
    var content = new VBox( {
      align: 'center',
      spacing: 10,
      children: [plotElectricPotentialLineButton, plotElectricFieldLineButton, clearButton, equipotential, this.voltageReading, voltage],
      pickable: true } );

    Panel.call( this, content, {backgroundPickable: true} );
  }

  return inherit( Panel, ElectricPotentialSensorPanel );
} );
