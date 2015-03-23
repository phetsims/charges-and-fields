// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the electric potential Grid Node that displays a two dimensional grid of rectangles that represent the electric potential field
 *
 * @author Martin Veillette (Berea College)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
    'use strict';

    // modules
    var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
    var inherit = require( 'PHET_CORE/inherit' );
    var WebGLNode = require( 'SCENERY/nodes/WebGLNode' );
    var ShaderProgram = require( 'SCENERY/util/ShaderProgram' );

    /**
     *
     * @param model
     * @param {Array.<StaticSensorElement>} electricPotentialSensorGrid
     * @param {Function} update -  model.on.bind(model)
     * @param {Function} colorInterpolationFunction - a function that returns a color (as a string) given an electric potential
     * @param {Property.<Bounds2>} boundsProperty - bounds of the canvas in model units
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Property.<boolean>} isChargedParticlePresentProperty - is there at least one charged particle on the board
     * @param {Property.<boolean>} isVisibleProperty
     * @constructor
     */
    function ElectricPotentialGridWebGLNode( model,
                                             electricPotentialSensorGrid,
                                             update,
                                             colorInterpolationFunction,
                                             boundsProperty,
                                             modelViewTransform,
                                             isChargedParticlePresentProperty,
                                             isVisibleProperty ) {
      var self = this;

      this.model = model;
      this.modelViewTransform = modelViewTransform;

      WebGLNode.call( this, {} );

      // update the bounds when needed
      boundsProperty.link( function() {
        self.canvasBounds = boundsProperty.get();
      } );

      ChargesAndFieldsColors.on( 'profileChanged', function() {
        self.invalidatePaint();
      } );

      update( 'electricPotentialGridUpdated', function() {
        self.invalidatePaint();
      } );

      isVisibleProperty.link( function( isVisible ) {
        self.visible = isVisible;
      } );

      this.invalidatePaint();
    }

    return inherit( WebGLNode, ElectricPotentialGridWebGLNode, {
      initializeWebGLDrawable: function( drawable ) {
        var gl = drawable.gl;

        // we will need this extension
        gl.getExtension( 'OES_texture_float' );

        var vertexShaderSource = [
          // Position
          'attribute vec3 aPosition;',
          'attribute vec3 aColor;',
          'varying vec3 vColor;',
          'uniform mat3 uModelViewMatrix;',
          'uniform mat3 uProjectionMatrix;',

          'void main( void ) {',
          '  vColor = aColor;',
          // homogeneous model-view transformation
          '  vec3 view = uModelViewMatrix * vec3( aPosition.xy, 1 );',
          // homogeneous map to to normalized device coordinates
          '  vec3 ndc = uProjectionMatrix * vec3( view.xy, 1 );',
          // combine with the z coordinate specified
          '  gl_Position = vec4( ndc.xy, aPosition.z, 1.0 );',
          '}'
        ].join( '\n' );

        // Simple demo for custom shader
        var fragmentShaderSource = [
          'precision mediump float;',
          'varying vec3 vColor;',

          // Returns the color from the vertex shader
          'void main( void ) {',
          '  gl_FragColor = vec4( vColor, 1.0 );',
          '}'
        ].join( '\n' );

        drawable.shaderProgram = new ShaderProgram( gl, vertexShaderSource, fragmentShaderSource, {
          attributes: [ 'aPosition', 'aColor' ],
          uniforms: [ 'uModelViewMatrix', 'uProjectionMatrix' ]
        } );

        drawable.vertexBuffer = gl.createBuffer();

        this.positions = new Float32Array( [
          0, 0, 0.2,
          100, 0, 0.2,
          0, 100, 0.2
        ] );
        gl.bindBuffer( gl.ARRAY_BUFFER, drawable.vertexBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW );

        drawable.colorBuffer = gl.createBuffer();

        gl.bindBuffer( gl.ARRAY_BUFFER, drawable.colorBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( [
          1, 0, 0,
          0, 1, 0,
          0, 0, 1
        ] ), gl.STATIC_DRAW );
      },

      paintWebGLDrawable: function( drawable, matrix ) {
        var gl = drawable.gl;
        var shaderProgram = drawable.shaderProgram;

        if ( this.model.chargedParticles.length >= 1 ) {
          var p1 = this.modelViewTransform.modelToViewPosition( this.model.chargedParticles.get( 0 ).position );
          this.positions[0] = p1.x;
          this.positions[1] = p1.y;
        }
        if ( this.model.chargedParticles.length >= 2 ) {
          var p2 = this.modelViewTransform.modelToViewPosition( this.model.chargedParticles.get( 1 ).position );
          this.positions[3] = p2.x;
          this.positions[4] = p2.y;
        }
        if ( this.model.chargedParticles.length >= 3 ) {
          var p3 = this.modelViewTransform.modelToViewPosition( this.model.chargedParticles.get( 2 ).position );
          this.positions[6] = p3.x;
          this.positions[7] = p3.y;
        }
        gl.bindBuffer( gl.ARRAY_BUFFER, drawable.vertexBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW );


        shaderProgram.use();

        gl.uniformMatrix3fv( shaderProgram.uniformLocations.uModelViewMatrix, false, matrix.entries );
        gl.uniformMatrix3fv( shaderProgram.uniformLocations.uProjectionMatrix, false, drawable.webGLBlock.projectionMatrixArray );

        gl.bindBuffer( gl.ARRAY_BUFFER, drawable.vertexBuffer );
        gl.vertexAttribPointer( shaderProgram.attributeLocations.aPosition, 3, gl.FLOAT, false, 0, 0 );

        gl.bindBuffer( gl.ARRAY_BUFFER, drawable.colorBuffer );
        gl.vertexAttribPointer( shaderProgram.attributeLocations.aColor, 3, gl.FLOAT, false, 0, 0 );

        gl.drawArrays( gl.TRIANGLES, 0, 3 );

        shaderProgram.unuse();
      },

      disposeWebGLDrawable: function( drawable ) {
        drawable.shaderProgram.dispose();
        drawable.gl.deleteBuffer( drawable.vertexBuffer );

        drawable.shaderProgram = null;
      }
    } );
  }
);
