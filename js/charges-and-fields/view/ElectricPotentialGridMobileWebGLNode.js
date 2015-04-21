// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the electric potential Grid Node that displays a two dimensional grid of rectangles that represent the
 * electric potential field, rendering in WebGL.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
    'use strict';

    // modules
    var ChargesAndFieldsColors = require( 'CHARGES_AND_FIELDS/charges-and-fields/ChargesAndFieldsColors' );
    var inherit = require( 'PHET_CORE/inherit' );
    var Matrix3 = require( 'DOT/Matrix3' );
    var ShaderProgram = require( 'SCENERY/util/ShaderProgram' );
    var WebGLNode = require( 'SCENERY/nodes/WebGLNode' );

    // higher values support more particles, but may compromise performance
    var MAX_PARTICLES_LIMIT = 32;

    /**
     *
     * @param {ObservableArray.<ChargedParticle>} chargedParticles
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Property.<boolean>} isVisibleProperty
     * @constructor
     */
    function ElectricPotentialGridMobileWebGLNode( chargedParticles,
                                                   modelViewTransform,
                                                   isVisibleProperty ) {
      var self = this;

      this.chargedParticles = chargedParticles;
      this.modelViewTransform = modelViewTransform;
      this.isVisibleProperty = isVisibleProperty;

      WebGLNode.call( this, {
        layerSplit: true, // ensure we're on our own layer
        webglScale: 1 / 16
      } );

      // if our color scheme changes, make sure we update
      ChargesAndFieldsColors.on( 'profileChanged', function() {
        self.invalidatePaint();
      } );

      // we handle visibility in our rendering process
      isVisibleProperty.link( function() {
        self.invalidatePaint();
      } );

      this.positionListener = this.onParticleMoved.bind( this );

      //TODO: need to add/remove particles only when they are active/inactive
      chargedParticles.addItemAddedListener( this.onParticleAdded.bind( this ) );
      chargedParticles.addItemRemovedListener( this.onParticleRemoved.bind( this ) );

      this.invalidatePaint();
    }

    return inherit( WebGLNode, ElectricPotentialGridMobileWebGLNode, {
      onParticleAdded: function( particle ) {
        this.invalidatePaint();

        particle.positionProperty.lazyLink( this.positionListener );
      },

      onParticleMoved: function() {
        this.invalidatePaint();
      },

      onParticleRemoved: function( particle ) {
        this.invalidatePaint();

        particle.positionProperty.unlink( this.positionListener );
      },

      initializeWebGLDrawable: function( drawable ) {
        var gl = drawable.gl;

        var otherVectorCount = 7; // colors, matrix and one extra to be safe
        var maxVertexUniforms = gl.getParameter( gl.MAX_VERTEX_UNIFORM_VECTORS );
        drawable.maximumNumParticles = Math.min( MAX_PARTICLES_LIMIT, maxVertexUniforms - otherVectorCount );

        // make sure we get repainted
        this.invalidatePaint();

        var particleIndices = _.range( drawable.maximumNumParticles );

        // shader for the display of the data
        drawable.displayShaderProgram = new ShaderProgram( gl, [
          // vertex shader
          'attribute vec3 aPosition;', // vertex attribute
          'varying vec2 vPosition;',
          'void main() {',
          '  vPosition = aPosition.xy;',
          '  gl_Position = vec4( aPosition, 1 );',
          '}'
        ].join( '\n' ), [
          // fragment shader
          'precision mediump float;',
          'varying vec2 vPosition;',
          'uniform vec3 uZeroColor;',
          'uniform vec3 uPositiveColor;',
          'uniform vec3 uNegativeColor;',
          'uniform mat3 uMatrixInverse;', // matrix to transform from normalized-device-coordinates to the model
          'const float kConstant = 9.0;',
          // 'uniform vec3 charge0;', etc.
          _.map( particleIndices, function( n ) {
            return 'uniform vec3 charge' + n + ';';
          } ).join( '\n' ),
          'void main() {',
          // homogeneous model-view transformation
          '  vec2 modelPosition = ( uMatrixInverse * vec3( vPosition, 1 ) ).xy;',

          // compute the total, not worrying about div by zero (will be covered up by charge icon)
          '  float voltage = 0.0;',
          _.map( particleIndices, function( n ) {
            return '  voltage += charge' + n + '.z * kConstant / length( modelPosition - charge' + n + '.xy );';
          } ).join( '\n' ),

          // rules to color pulled from ChangesAndFieldsScreenView
          '  if ( voltage > 0.0 ) {',
          '    voltage = min( voltage / 40.0, 1.0 );', // clamp to [0,1]
          '    gl_FragColor = vec4( uPositiveColor * voltage + uZeroColor * ( 1.0 - voltage ), 1.0 );',
          '  } else {',
          '    voltage = min( -voltage / 40.0, 1.0 );', // clamp to [0,1]
          '    gl_FragColor = vec4( uNegativeColor * voltage + uZeroColor * ( 1.0 - voltage ), 1.0 );',
          '  }',
          // '  gl_FragColor = vec4( charge0.x, charge0.y, 0.0, 1.0 );',
          '}'
        ].join( '\n' ), {
          attributes: [ 'aPosition' ],
          uniforms: [ 'uMatrixInverse', 'uZeroColor', 'uPositiveColor', 'uNegativeColor' ].concat(
            _.map( particleIndices, function( n ) { return 'charge' + n; } ) )
        } );

        // we only need one vertex buffer with the same contents for all three shaders!
        drawable.vertexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, drawable.vertexBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( [
          -1, -1,
          -1, +1,
          +1, -1,
          +1, +1
        ] ), gl.STATIC_DRAW );
      },

      // does the actual painting
      paintWebGLDrawable: function( drawable, matrix ) {
        var gl = drawable.gl;
        var displayShaderProgram = drawable.displayShaderProgram;

        // If we're not visible, clear everything and exit. Our layerSplit above guarantees this won't clear other
        // node's renderings.
        if ( !this.isVisibleProperty.get() ) {
          var backgroundColor = ChargesAndFieldsColors.background;
          gl.clearColor( backgroundColor.r / 255, backgroundColor.g / 255, backgroundColor.b / 255, 1 );
          gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
          return;
        }

        displayShaderProgram.use();

        // TODO: reduce allocations
        var projectionMatrixInverse = new Matrix3().setArray( drawable.webGLBlock.projectionMatrixArray ).invert();
        var matrixInverse = this.modelViewTransform.getInverse().timesMatrix( matrix.inverted().multiplyMatrix( projectionMatrixInverse ) );
        var matrixInverseEntries = new Float32Array( matrixInverse.entries );
        gl.uniformMatrix3fv( displayShaderProgram.uniformLocations.uMatrixInverse, false, matrixInverseEntries );

        // tell the shader our colors / scale
        var zeroColor = ChargesAndFieldsColors.electricPotentialGridZero;
        var positiveColor = ChargesAndFieldsColors.electricPotentialGridSaturationPositive;
        var negativeColor = ChargesAndFieldsColors.electricPotentialGridSaturationNegative;
        gl.uniform3f( displayShaderProgram.uniformLocations.uZeroColor, zeroColor.red / 255, zeroColor.green / 255, zeroColor.blue / 255 );
        gl.uniform3f( displayShaderProgram.uniformLocations.uPositiveColor, positiveColor.red / 255, positiveColor.green / 255, positiveColor.blue / 255 );
        gl.uniform3f( displayShaderProgram.uniformLocations.uNegativeColor, negativeColor.red / 255, negativeColor.green / 255, negativeColor.blue / 255 );

        // update uniforms for the particle location
        for ( var i = 0; i < drawable.maximumNumParticles; i++ ) {
          var particle = this.chargedParticles.get( i );
          var uniformLocation = displayShaderProgram.uniformLocations[ 'charge' + i ];

          if ( particle ) {
            gl.uniform3f( uniformLocation, particle.position.x, particle.position.y, particle.charge );
          }
          else {
            gl.uniform3f( uniformLocation, -7.52432, 0, 0 ); // zero charge, magic constant
          }
        }

        // data to draw 2 triangles that cover the screen
        gl.bindBuffer( gl.ARRAY_BUFFER, drawable.vertexBuffer );
        gl.vertexAttribPointer( displayShaderProgram.attributeLocations.aPosition, 2, gl.FLOAT, false, 0, 0 );

        // actually draw it
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

        displayShaderProgram.unuse();
      },

      disposeWebGLDrawable: function( drawable ) {
        // clears all of our resources
        drawable.displayShaderProgram.dispose();
        drawable.gl.deleteBuffer( drawable.vertexBuffer );

        drawable.displayShaderProgram = null;
      }
    } );
  }
);
