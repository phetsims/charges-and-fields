// Copyright 2002-2015, University of Colorado Boulder

/**
 * Scenery Node depicting a sensor panel that can generate or delete an electric potential field lines.
 * The sensor has a readout of the electric potential at a given position.
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var EraserButton = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/EraserButton' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LayoutBox = require( 'SCENERY/nodes/LayoutBox' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PencilButton = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/PencilButton' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  var equipotentialString = require( 'string!CHARGES_AND_FIELDS/equipotential' );

  // images
  var electricPotentialLinePanelOutlineImage = require( 'image!CHARGES_AND_FIELDS/electricPotentialPanelOutline.png' );

  /**
   * @param {Function} clearElectricPotentialLines - A function for deleting all electric potential lines in the model
   * @param {Function} addElectricPotentialLine - A function for adding an electric potential line to the model
   * @param {Object} [options] scenery options for rendering the Electric Potential Sensor Panel, see the constructor for options.
   * @constructor
   */
  function ElectricPotentialSensorBodyNode( clearElectricPotentialLines, addElectricPotentialLine, options ) {

    var self = this;

    Node.call( this );

    // Create the text node above the readout
    var electricPotentialPanelTitleText = new Text( equipotentialString, {
      font: ChargesAndFieldsConstants.DEFAULT_FONT
    } );

    // Create the button that allows the board to be cleared of all lines.
    var clearButton = new EraserButton( {
      iconWidth: 26, // width of eraser icon, used for scaling, the aspect ratio will determine height
      listener: function() {
        clearElectricPotentialLines();
      }
    } );

    // Create the button that allows to plot the ElectricPotential Lines
    var plotElectricPotentialLineButton = new PencilButton( {
      iconWidth: 26, // width of pencil icon, used for scaling, the aspect ratio will determine height
      listener: function() {
        // TODO: get rid of timing
        var initialTime = new Date().getTime();
        addElectricPotentialLine();
        var finalTime = new Date().getTime();
        var deltaTime = finalTime - initialTime;
        console.log( 'Time to plot eq line: ', deltaTime, 'ms' );
      }
    } );

    // The clear and plot buttons
    var buttons = new LayoutBox( {
      orientation: 'horizontal',
      spacing: 20,
      children: [ clearButton, plotElectricPotentialLineButton ],
      pickable: true
    } );

    // Create the voltage Reading reading
    this.voltageReading = new Text( '0.000 V', {
      font: ChargesAndFieldsConstants.DEFAULT_FONT
    } );

    // Create the background rectangle behind the voltage Reading
    var backgroundRectangle = new Rectangle( 0, 0, buttons.width, this.voltageReading.height * 1.5, 5, 5 );

    // Organize the content of the control panel
    var content = new LayoutBox( {
      spacing: 10,
      children: [ electricPotentialPanelTitleText, backgroundRectangle, buttons ],
      pickable: true
    } );

    // Create the body of the sensor
    var outlineImage = new Image( electricPotentialLinePanelOutlineImage );

    // Add the nodes
    this.addChild( outlineImage ); // must go first
    this.addChild( content );
    this.addChild( this.voltageReading ); // must be last

    // layout all the remaining nodes
    outlineImage.scale( 1.2 * content.width / outlineImage.width );
    outlineImage.centerX = content.centerX;
    outlineImage.top = content.top - 15;
    this.voltageReading.centerX = content.centerX;
    this.voltageReading.centerY = backgroundRectangle.centerY;

    // hookup the colors

    // Link the stroke color for the default/projector mode
    ChargesAndFieldsColors.link( 'buttonBaseColor', function( color ) {
      clearButton.baseColor = color;
      plotElectricPotentialLineButton.baseColor = color;
    } );

    // Link the fill color for the default/projector mode
    ChargesAndFieldsColors.link( 'electricPotentialPanelTitleText', function( color ) {
      electricPotentialPanelTitleText.fill = color;
    } );

    ChargesAndFieldsColors.link( 'electricPotentialSensorBorder', function( color ) {
      self.stroke = color;
    } );

    ChargesAndFieldsColors.link( 'electricPotentialSensorBackgroundFill', function( color ) {
      self.fill = color;
    } );

    ChargesAndFieldsColors.link( 'electricPotentialSensorTextPanelTextFill', function( color ) {
      self.voltageReading.fill = color;
    } );

    ChargesAndFieldsColors.link( 'electricPotentialSensorTextPanelBorder', function( color ) {
      backgroundRectangle.stroke = color;
    } );

    ChargesAndFieldsColors.link( 'electricPotentialSensorTextPanelBackground', function( color ) {
      backgroundRectangle.fill = color;
    } );

  }

  return inherit( Node, ElectricPotentialSensorBodyNode );
} );
