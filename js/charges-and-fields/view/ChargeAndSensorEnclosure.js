// Copyright 2002-2015, University of Colorado Boulder

/**
 * Scenery Node that contains an enclosure for a positive, a negative electric charge and an electric sensor
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
  var ChargesAndFieldsConstants = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var UserCreatorNode = require( 'CHARGES_AND_FIELDS/charges-and-fields/view/UserCreatorNode' );

  // strings
  var minusOneNanoCoulombString = require( 'string!CHARGES_AND_FIELDS/minusOneNanoC' );
  var plusOneNanoCoulombString = require( 'string!CHARGES_AND_FIELDS/plusOneNanoC' );
  var sensorsString = require( 'string!CHARGES_AND_FIELDS/sensors' );

  // constants
  var FONT = ChargesAndFieldsConstants.ENCLOSURE_LABEL_FONT;

  /**
   * Enclosure that contains the charges and sensor
   *
   * @param {Function} addUserCreatedModelElementToObservableArray
   * @param {ObservableArray} chargedParticles - observable array in the model that contains all the charged particles
   * @param {ObservableArray} electricFieldSensors - observable array in the model that contains all the electric field sensors
   * @param {number} numberChargesLimit
   * @param {Bounds2} enclosureBounds - model bounds of the outer enclosure
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<Bounds2>} availableModelBoundsProperty - dragBounds of the charges and sensors in view coordinates
   * @constructor
   */
  function ChargeAndSensorEnclosure( addUserCreatedModelElementToObservableArray,
                                     chargedParticles,
                                     electricFieldSensors,
                                     numberChargesLimit,
                                     enclosureBounds,
                                     modelViewTransform,
                                     availableModelBoundsProperty ) {

    Node.call( this );

    // width of the strings
    var minusTextWidth = (new Text( minusOneNanoCoulombString, { font: FONT } )).width;
    var plusTextWidth = (new Text( plusOneNanoCoulombString, { font: FONT } )).width;
    var sensorTextWidth = (new Text( sensorsString, { font: FONT } )).width;

    // maximum width of the three strings
    var maxTextWidth = Math.max( minusTextWidth, plusTextWidth, sensorTextWidth );

    // the width of each string should occupy less than 1/3 of width of the enclosure
    // translation of the strings could possibly violate this condition
    var minimumEnclosureModelWidth = modelViewTransform.viewToModelDeltaX( 3 * maxTextWidth );

    // if it is not the case, then increase the model Bounds of the enclosure
    if ( enclosureBounds.width < minimumEnclosureModelWidth ) {
      var centerX = enclosureBounds.centerX;
      enclosureBounds.minX = centerX - minimumEnclosureModelWidth / 2;
      enclosureBounds.maxX = centerX + minimumEnclosureModelWidth / 2;
    }

    // bounds of the enclosure in screenView coordinates
    var viewBounds = modelViewTransform.modelToViewBounds( enclosureBounds );

    // Create the background enclosure
    var rectangle = Rectangle.roundedBounds( viewBounds, 5, 5, { lineWidth: ChargesAndFieldsConstants.PANEL_LINE_WIDTH } );

    // Convenience variable to position the charges and sensor
    var positiveChargeCenterX = viewBounds.centerX - viewBounds.width / 3;
    var positiveChargeCenterY = viewBounds.centerY - viewBounds.height / 5;
    var negativeChargeCenterX = viewBounds.centerX;
    var negativeChargeCenterY = positiveChargeCenterY;
    var electricFieldSensorCenterX = viewBounds.centerX + viewBounds.width / 3;
    var electricFieldSensorCenterY = positiveChargeCenterY;

    // Create the charges and sensor
    var positiveCharge = new UserCreatorNode(
      addUserCreatedModelElementToObservableArray,
      chargedParticles,
      modelViewTransform,
      availableModelBoundsProperty,
      enclosureBounds,
      {
        element: 'positive',
        observableArrayLengthLimit: numberChargesLimit,
        centerX: positiveChargeCenterX,
        centerY: positiveChargeCenterY
      } );

    var negativeCharge = new UserCreatorNode(
      addUserCreatedModelElementToObservableArray,
      chargedParticles,
      modelViewTransform,
      availableModelBoundsProperty,
      enclosureBounds,
      {
        element: 'negative',
        observableArrayLengthLimit: numberChargesLimit,
        centerX: negativeChargeCenterX,
        centerY: negativeChargeCenterY
      } );

    var electricFieldSensor = new UserCreatorNode(
      addUserCreatedModelElementToObservableArray,
      electricFieldSensors,
      modelViewTransform,
      availableModelBoundsProperty,
      enclosureBounds,
      {
        element: 'electricFieldSensor',
        centerX: electricFieldSensorCenterX,
        centerY: electricFieldSensorCenterY
      } );

    // vertical Position for the text label
    var textCenterY = viewBounds.centerY + viewBounds.height / 4;

    // Create the three text labels
    var positiveChargeText = new Text( plusOneNanoCoulombString, {
      font: FONT,
      centerX: positiveChargeCenterX,
      centerY: textCenterY
    } );
    var negativeChargeText = new Text( minusOneNanoCoulombString, {
      font: FONT,
      centerX: negativeChargeCenterX,
      centerY: textCenterY
    } );
    var electricFieldSensorText = new Text( sensorsString, {
      font: FONT,
      centerX: electricFieldSensorCenterX,
      centerY: textCenterY
    } );

    // Add the nodes
    this.addChild( rectangle );
    this.addChild( positiveChargeText );
    this.addChild( negativeChargeText );
    this.addChild( electricFieldSensorText );
    this.addChild( positiveCharge );
    this.addChild( negativeCharge );
    this.addChild( electricFieldSensor );

    // update the colors on change of color scheme (projector vs default)
    // no need to unlink since the chargeEnclosure is present for the lifetime of the simulation
    ChargesAndFieldsColors.link( 'enclosureText', function( color ) {
      positiveChargeText.fill = color;
      negativeChargeText.fill = color;
      electricFieldSensorText.fill = color;
    } );

    ChargesAndFieldsColors.link( 'enclosureBorder', function( color ) {
      rectangle.stroke = color;
    } );

    ChargesAndFieldsColors.link( 'enclosureFill', function( color ) {
      rectangle.fill = color;
    } );
  }

  return inherit( Node, ChargeAndSensorEnclosure );

} )
;