// Copyright 2015-2020, University of Colorado Boulder

/**
 * View object, with a variety of Nodes stored on it to be added by the parent container. Responsible for the drawing
 * of one electricPotentialLine and its accompanying voltage labels
 *
 * A debug option can enabled the view of the (model) position points used to calculate the electric potential line.
 * The (pruned) position points that are used to draw the electric potential line can also be displayed.
 *
 * @author Martin Veillette (Berea College)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import chargesAndFieldsStrings from '../../charges-and-fields-strings.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargesAndFieldsColorProfile from '../ChargesAndFieldsColorProfile.js';
import ChargesAndFieldsConstants from '../ChargesAndFieldsConstants.js';

const pattern0Value1UnitsString = chargesAndFieldsStrings.pattern[ '0value' ][ '1units' ];
const voltageUnitString = chargesAndFieldsStrings.voltageUnit;

// constants
// if set to true will show the (model and view) positions use in the calculation of the electric potential lines
const IS_DEBUG = phet.chipper.queryParameters.dev;

class ElectricPotentialLineView extends PhetioObject {

  /**
   * @param {ElectricPotentialLine} electricPotentialLine
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Tandem} tandem
   */
  constructor( electricPotentialLine, modelViewTransform, tandem ) {
    super( {
      tandem: tandem,
      phetioDynamicElement: true,
      phetioType: ReferenceIO
    } );

    // @public (read-only) {Node} - the path of the potential line
    this.path = new Path( modelViewTransform.modelToViewShape( electricPotentialLine.getShape() ), {
      stroke: ChargesAndFieldsColorProfile.electricPotentialLineProperty
    } );

    // @public (read-only) {Node} - label that says the voltage
    this.voltageLabel = new VoltageLabel( electricPotentialLine, modelViewTransform, tandem.createTandem( 'voltageLabel' ) );

    // @public (read-only) {Node|null} - if running in development mode, then display each sample point on the potential line
    this.circles = null;

    if ( IS_DEBUG ) {

      // create all the circles corresponding to the positions calculated in the model
      const electricPotentialModelCircles = new Circles( electricPotentialLine.positionArray, modelViewTransform, {
        fill: 'pink',
        radius: 1
      } );

      // create all the circles corresponding to the positions used to create the shape of the electric potential line
      const electricPotentialViewCircles = new Circles(
        electricPotentialLine.getPrunedPositionArray( electricPotentialLine.positionArray ),
        modelViewTransform, { fill: 'orange' } );

      // no translatable strings, for debug only
      const text = new Text( 'model=' + electricPotentialLine.positionArray.length +
                             '    view=' + electricPotentialLine.getPrunedPositionArray( electricPotentialLine.positionArray ).length, {
        center: modelViewTransform.modelToViewPosition( electricPotentialLine.position ),
        fill: 'green',
        font: ChargesAndFieldsConstants.VOLTAGE_LABEL_FONT
      } );

      this.circles = new Node( {
        children: [
          electricPotentialModelCircles,
          electricPotentialViewCircles,
          text
        ]
      } );
    }
  }

  /**
   * @public
   */
  dispose() {
    this.path.dispose();
    this.voltageLabel.dispose();
    this.circles && this.circles.dispose();
    super.dispose();
  }
}

class VoltageLabel extends Node {

  /**
   * Function that generates a voltage label for the electricPotential line
   * @param {ElectricPotentialLine} electricPotentialLine
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Tandem} tandem
   */
  constructor( electricPotentialLine, modelViewTransform, tandem ) {

    super( { cursor: 'pointer' } );

    const electricPotential = electricPotentialLine.electricPotential;
    const position = electricPotentialLine.position;

    const movableDragHandler = new DragListener( {
      applyOffset: false,
      positionProperty: electricPotentialLine.voltageLabelLocationProperty,
      tandem: tandem.createTandem( 'dragListener' ),
      transform: modelViewTransform,
      start: event => {

        // Move the label to the front of this layer when grabbed by the user.
        this.moveToFront();
      }
    } );
    this.addInputListener( movableDragHandler );

    // a smaller electric potential should have more precision
    const electricPotentialValueString = ( Math.abs( electricPotential ) < 1 ) ?
                                         Utils.toFixed( electricPotential, 2 ) :
                                         Utils.toFixed( electricPotential, 1 );

    // Create the voltage label for the electricPotential line
    const voltageLabelString = StringUtils.format( pattern0Value1UnitsString, electricPotentialValueString, voltageUnitString );
    const voltageLabelText = new Text( voltageLabelString, {
      font: ChargesAndFieldsConstants.VOLTAGE_LABEL_FONT,
      center: modelViewTransform.modelToViewPosition( position ),
      fill: ChargesAndFieldsColorProfile.electricPotentialLineProperty,
      tandem: tandem.createTandem( 'voltageLabelText' )
    } );

    // Create a background rectangle for the voltage label
    const backgroundRectangle = new Rectangle( 0, 0, voltageLabelText.width * 1.2, voltageLabelText.height * 1.2, 3, 3, {
      center: modelViewTransform.modelToViewPosition( position ),
      fill: ChargesAndFieldsColorProfile.voltageLabelBackgroundProperty
    } );

    this.addChild( backgroundRectangle ); // must go first
    this.addChild( voltageLabelText );

    // finds the closest location on positionArray to the position of the cursor
    const locationFunction = cursorLocation => {
      let smallestDistanceSquared = Number.POSITIVE_INFINITY;
      let closestLocation; // {Vector2}
      electricPotentialLine.positionArray.forEach( position => {
        const distanceSquared = position.distanceSquared( cursorLocation );
        if ( distanceSquared < smallestDistanceSquared ) {
          smallestDistanceSquared = distanceSquared;
          closestLocation = position;
        }
      } );
      if ( closestLocation ) {
        this.center = modelViewTransform.modelToViewPosition( closestLocation );
      }
    };

    electricPotentialLine.voltageLabelLocationProperty.link( locationFunction );

    // create a dispose function to unlink the color functions
    this.disposeVoltageLabel = () => {
      electricPotentialLine.voltageLabelLocationProperty.unlink( locationFunction );
      movableDragHandler.dispose();
      voltageLabelText.dispose();
      backgroundRectangle.dispose();
    };
  }

  dispose() {
    this.disposeVoltageLabel();
    super.dispose();
  }
}

class Circles extends Node {

  /**
   * Function that generates an array of Circles with their centers determined by the position array
   * @param {Array.<Vector2>} positionArray
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( positionArray, modelViewTransform, options ) {

    super();

    options = merge( {
      radius: 2
    }, options );

    // create and add all the circles
    positionArray.forEach( position => {
      const circle = new Circle( options.radius, options );
      circle.center = modelViewTransform.modelToViewPosition( position );
      this.addChild( circle );
    } );
  }
}


chargesAndFields.register( 'ElectricPotentialLineView', ElectricPotentialLineView );
export default ElectricPotentialLineView;