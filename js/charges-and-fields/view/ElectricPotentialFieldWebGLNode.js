// Copyright 2002-2013, University of Colorado Boulder

/**
 * View for the equipotential Lines
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules

  var Bounds2 = require( 'DOT/Bounds2' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Matrix4 = require( 'DOT/Matrix4' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RectangleWebGLDrawable = require( 'SCENERY/nodes/drawables/RectangleWebGLDrawable' );
  var WebGLNode = require( 'SCENERY/nodes/WebGLNode' );
  var WebGLLayer = require( 'SCENERY/layers/WebGLLayer' );


  /**
   *
   * @param model
   * @param modelViewTransform
   * @param bounds
   * @param showResolutionProperty
   * @constructor
   */
  function ElectricPotentialFieldWebGLNode( model, modelViewTransform, showResolutionProperty ) {

    var electricPotentialFieldNode = this;
    // Call the super constructor
    //  WebGLNode.call( this, {canvasBounds: new Bounds2( 100, 100, 200, 200 )} );
    Node.call( this );

    var vectorDisplacement = model.electricPotentialGrid.get( 2 ).position.minus( model.electricPotentialGrid.get( 1 ).position );
    var unitDistance = modelViewTransform.modelToViewDelta( vectorDisplacement ).magnitude();


    model.electricPotentialGrid.forEach( function( electricPotentialSensor ) {
      var positionInModel = electricPotentialSensor.position;
      //  var electricPotential = electricPotentialSensor.electricPotential;
      var positionInView = modelViewTransform.modelToViewPosition( positionInModel );
      var rect1 = new Rectangle( 0, 0, unitDistance, unitDistance );
      var gl = document.getElementById( "canvas" ).getContext( "experimental-webgl" );
      var rect = new RectangleWebGLDrawable( gl, rect1 );
      rect.center = positionInView;

      electricPotentialSensor.electricPotentialProperty.link( function( electricPotential ) {
        var specialColor = model.getColorElectricPotential( positionInModel, electricPotential );

        rect.fill = specialColor;
        //    rect2.fill = specialColor;
        // rect.updateRectangle()
      } );
      electricPotentialFieldNode.addChild( rect );
    } );

    showResolutionProperty.link( function( isVisible ) {
      electricPotentialFieldNode.visible = isVisible;

      // for performance reason, the electric potential is calculated and updated only if the check is set to visible
      if ( isVisible ) {
        model.electricPotentialGrid.forEach( function( sensorElement ) {
          sensorElement.electricPotential = model.getElectricPotential( sensorElement.position );
        } );
      }
    } );

  }

  return inherit( Node, ElectricPotentialFieldWebGLNode, {
      initialize: function() {

        this.buffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.buffer );

        var centerX = 0;
        var centerY = 0;
        var radius = 0.5;

        // 40 makes a smooth circle, but we need enough samples to eliminate seams between the pie slices
        // Win8/Chrome starts to slow down around 1000000 samples
        var numSamples = 100;
        this.numSamples = numSamples;

        var vertices = [centerX, centerY];

        var indexToVertex = function( i ) {
          var angle = -Math.PI * 2 / numSamples * i;
          var x = radius * Math.cos( angle ) + centerX;
          var y = radius * Math.sin( angle ) + centerY;
          vertices.push( x );
          vertices.push( y );
        };

        //Go back to the first vertex, to make sure it is a closed circle
        for ( var i = 0; i <= numSamples; i++ ) {
          indexToVertex( i );
        }

        // Complete the circle
        this.vertices = vertices;

        // TODO: Once we are lazily handling the full matrix, we may benefit from DYNAMIC draw here, and updating the vertices themselves
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );
      }
    }
    // return inherit( WebGLNode, ElectricPotentialFieldWebGLNode
    //,
    //{
    //initialize: function( gl ) {
    //
    //  this.buffer = gl.createBuffer();
    //  gl.bindBuffer( gl.ARRAY_BUFFER, this.buffer );
    //
    //  var centerX = 0;
    //  var centerY = 0;
    //  var radius = 0.5;
    //
    //  // 40 makes a smooth circle, but we need enough samples to eliminate seams between the pie slices
    //  // Win8/Chrome starts to slow down around 1000000 samples
    //  var numSamples = 100;
    //  this.numSamples = numSamples;
    //
    //  var vertices = [centerX, centerY];
    //
    //  var indexToVertex = function( i ) {
    //    var angle = -Math.PI * 2 / numSamples * i;
    //    var x = radius * Math.cos( angle ) + centerX;
    //    var y = radius * Math.sin( angle ) + centerY;
    //    vertices.push( x );
    //    vertices.push( y );
    //  };
    //
    //  //Go back to the first vertex, to make sure it is a closed circle
    //  for ( var i = 0; i <= numSamples; i++ ) {
    //    indexToVertex( i );
    //  }
    //
    //  // Complete the circle
    //  this.vertices = vertices;
    //
    //  // TODO: Once we are lazily handling the full matrix, we may benefit from DYNAMIC draw here, and updating the vertices themselves
    //  gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );
    //},
    //
    //render: function( gl, shaderProgram, viewMatrix ) {
    //
    //  var angleBetweenSlices = Math.PI * 2 / this.numSamples;
    //  var radius = 685;
    //
    //  // If any slice is too small, then don't show it.  Use the same rules as the non-webgl pie chart, see #136
    //  var energy = Math.pow( radius / 0.4, 2 );
    //  var THRESHOLD = 1E-4;
    //  if ( energy < THRESHOLD ) {
    //    radius = 0;
    //  }
    //
    //  //Round to the nearest angle to prevent seams, see #263
    //  var startAngle = Math.round( 3 / angleBetweenSlices ) * angleBetweenSlices;
    //  var unroundedEndAngle = 6;
    //  var endAngle = Math.round( unroundedEndAngle / angleBetweenSlices ) * angleBetweenSlices;
    //
    //  var extent = endAngle - startAngle;
    //
    //  var scalingMatrix = Matrix4.scaling( radius * 2, radius * 2, 1 );
    //  var rotationMatrix = Matrix4.rotationZ( -startAngle );
    //  var uMatrix = viewMatrix.timesMatrix( scalingMatrix.timesMatrix( rotationMatrix ) );
    //
    //  // combine image matrix (to scale aspect ratios), the trail's matrix, and the matrix to device coordinates
    //  gl.uniformMatrix4fv( shaderProgram.uniformLocations.uModelViewMatrix, false, uMatrix.entries );
    //
    //  // Indicate the branch of logic to use in the ubershader.  In this case, a texture should be used for the image
    //  gl.uniform1i( shaderProgram.uniformLocations.uFragmentType, WebGLLayer.fragmentTypeFill );
    //  var color = Color.toColor( this.color );
    //  gl.uniform4f( shaderProgram.uniformLocations.uColor, color.r / 255, color.g / 255, color.b / 255, color.a );
    //
    //  gl.bindBuffer( gl.ARRAY_BUFFER, this.buffer );
    //  gl.vertexAttribPointer( shaderProgram.attributeLocations.aVertex, 2, gl.FLOAT, false, 0, 0 );
    //
    //  // To cut out a piece from the pie, just select the appropriate start/end vertices, then the call is still static.
    //  var numToDraw = Math.round( 2 + ( this.vertices.length / 2 - 2 ) * extent / ( 2 * Math.PI ) ); // linear between 2 and the maximum
    //  gl.drawArrays( gl.TRIANGLE_FAN, 0, numToDraw );
    //},
    //
    //step: function( dt ) {
    //
    //  // Mark the WebGL dirty flag as dirty, to ensure it will render.
    //  this.invalidatePaint();
    //},
    //
    //dispose: function( gl ) {
    //  gl.deleteBuffer( this.buffer );
    //}
//  }
  );
} );