// Copyright 2015-2025, University of Colorado Boulder

/**
 * View for the electric potential Grid Node that displays a two dimensional grid of rectangles that represent the
 * electric potential field, rendering in WebGL.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import WebGLNode, { WebGLNodePainter, WebGLNodePainterResult } from '../../../../scenery/js/nodes/WebGLNode.js';
import ShaderProgram from '../../../../scenery/js/util/ShaderProgram.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargesAndFieldsColors from '../ChargesAndFieldsColors.js';
import ChargedParticle from '../model/ChargedParticle.js';

// higher values support more particles, but may compromise performance
const MAX_PARTICLES_LIMIT = 32;
const scratchFloatArray = new Float32Array( 9 );

class ElectricPotentialMobileWebGLNode extends WebGLNode {

  public readonly chargedParticles: ObservableArray<ChargedParticle>;
  public readonly modelViewTransform: ModelViewTransform2;
  public readonly isVisibleProperty: Property<boolean>;

  /**
   * @param chargedParticles - all the chargedParticles in this array are active
   * @param modelViewTransform
   * @param isVisibleProperty
   */
  public constructor( chargedParticles: ObservableArray<ChargedParticle>, modelViewTransform: ModelViewTransform2, isVisibleProperty: Property<boolean> ) {

    super( ElectricPotentialMobilePainter, {
      layerSplit: true, // ensure we're on our own layer
      webglScale: 1 / 16
    } );

    this.chargedParticles = chargedParticles;
    this.modelViewTransform = modelViewTransform;
    this.isVisibleProperty = isVisibleProperty;

    // Invalidate paint on a bunch of changes
    const invalidateSelfListener = this.invalidatePaint.bind( this );
    ChargesAndFieldsColors.electricPotentialGridZeroProperty.link( invalidateSelfListener );
    ChargesAndFieldsColors.electricPotentialGridSaturationPositiveProperty.link( invalidateSelfListener );
    ChargesAndFieldsColors.electricPotentialGridSaturationNegativeProperty.link( invalidateSelfListener );
    isVisibleProperty.link( invalidateSelfListener ); // visibility change

    // particle added
    // TODO: I've seen this pattern elsewhere in the code https://github.com/phetsims/charges-and-fields/issues/203
    chargedParticles.addItemAddedListener( ( particle: ChargedParticle ) => particle.positionProperty.link( invalidateSelfListener ) );

    // particle removed
    chargedParticles.addItemRemovedListener( ( particle: ChargedParticle ) => {
      invalidateSelfListener();
      particle.positionProperty.unlink( invalidateSelfListener );
    } );
  }

  /**
   * Detection for how many particles we can support.
   */
  public static getNumberOfParticlesSupported(): number {
    const canvas = document.createElement( 'canvas' );
    const gl = canvas.getContext( 'webgl' );
    return ElectricPotentialMobileWebGLNode.particlesSupportedForContext( gl! );
  }

  /**
   * @param gl
   */
  public static particlesSupportedForContext( gl: WebGLRenderingContext ): number {
    const otherVectorCount = 7; // colors, matrix and one extra to be safe
    const maxVertexUniforms = gl.getParameter( gl.MAX_VERTEX_UNIFORM_VECTORS );
    return Math.min( MAX_PARTICLES_LIMIT, maxVertexUniforms - otherVectorCount );
  }
}

chargesAndFields.register( 'ElectricPotentialMobileWebGLNode', ElectricPotentialMobileWebGLNode );

class ElectricPotentialMobilePainter implements WebGLNodePainter {

  private readonly gl: WebGLRenderingContext;
  private readonly node: ElectricPotentialMobileWebGLNode;
  private readonly maximumNumParticles: number;
  private displayShaderProgram: ShaderProgram;
  private readonly vertexBuffer: WebGLBuffer;

  /**
   * @param gl
   * @param node
   */
  public constructor( gl: WebGLRenderingContext, node: ElectricPotentialMobileWebGLNode ) {
    this.gl = gl;
    this.node = node;
    this.maximumNumParticles = ElectricPotentialMobileWebGLNode.particlesSupportedForContext( gl );

    const particleIndices = _.range( this.maximumNumParticles );

    // shader for the display of the data
    this.displayShaderProgram = new ShaderProgram( gl, [
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
      particleIndices.map( n => `uniform vec3 charge${n};` ).join( '\n' ),
      'void main() {',
      // homogeneous model-view transformation
      '  vec2 modelPosition = ( uMatrixInverse * vec3( vPosition, 1 ) ).xy;',

      // compute the total, not worrying about div by zero (will be covered up by charge icon)
      '  float voltage = 0.0;',
      particleIndices.map( n => `  voltage += charge${n}.z * kConstant / length( modelPosition - charge${n}.xy );` ).join( '\n' ),

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
        particleIndices.map( n => `charge${n}` ) )
    } );

    // we only need one vertex buffer with the same contents for all three shaders!
    this.vertexBuffer = gl.createBuffer()!;
    gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( [
      -1, -1,
      -1, +1,
      +1, -1,
      +1, +1
    ] ), gl.STATIC_DRAW );
  }

  /**
   * @param modelViewMatrix
   * @param projectionMatrix
   * @returns - WebGLNode.PAINTED_NOTHING or WebGLNode.PAINTED_SOMETHING.
   */
  public paint( modelViewMatrix: Matrix3, projectionMatrix: Matrix3 ): WebGLNodePainterResult {
    const gl = this.gl;
    const displayShaderProgram = this.displayShaderProgram;

    // If we're not visible, clear everything and exit. Our layerSplit above guarantees this won't clear other
    // node's renderings.
    if ( !this.node.isVisibleProperty.get() ) {
      return WebGLNode.PAINTED_NOTHING;
    }

    displayShaderProgram.use();

    // TODO: reduce allocations https://github.com/phetsims/charges-and-fields/issues/203
    const projectionMatrixInverse = new Matrix3().set( projectionMatrix ).invert();
    const matrixInverse = this.node.modelViewTransform.getInverse().timesMatrix( modelViewMatrix.inverted().multiplyMatrix( projectionMatrixInverse ) );
    gl.uniformMatrix3fv( displayShaderProgram.uniformLocations.uMatrixInverse, false, matrixInverse.copyToArray( scratchFloatArray ) );

    // tell the shader our colors / scale
    const zeroColor = ChargesAndFieldsColors.electricPotentialGridZeroProperty.get();
    const positiveColor = ChargesAndFieldsColors.electricPotentialGridSaturationPositiveProperty.get();
    const negativeColor = ChargesAndFieldsColors.electricPotentialGridSaturationNegativeProperty.get();
    gl.uniform3f( displayShaderProgram.uniformLocations.uZeroColor, zeroColor.red / 255, zeroColor.green / 255, zeroColor.blue / 255 );
    gl.uniform3f( displayShaderProgram.uniformLocations.uPositiveColor, positiveColor.red / 255, positiveColor.green / 255, positiveColor.blue / 255 );
    gl.uniform3f( displayShaderProgram.uniformLocations.uNegativeColor, negativeColor.red / 255, negativeColor.green / 255, negativeColor.blue / 255 );

    // update uniforms for the particle position
    const chargedParticleQuantity = this.node.chargedParticles.length;
    for ( let i = 0; i < this.maximumNumParticles; i++ ) {
      const particle = i < chargedParticleQuantity ? this.node.chargedParticles.get( i ) : null;
      const uniformLocation = displayShaderProgram.uniformLocations[ `charge${i}` ];

      if ( particle ) {
        gl.uniform3f( uniformLocation, particle.positionProperty.get().x, particle.positionProperty.get().y, particle.charge );
      }
      else {
        gl.uniform3f( uniformLocation, -7.52432, 0, 0 ); // zero charge, magic constant
      }
    }

    // data to draw 2 triangles that cover the screen
    gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
    gl.vertexAttribPointer( displayShaderProgram.attributeLocations.aPosition, 2, gl.FLOAT, false, 0, 0 );

    // actually draw it
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

    displayShaderProgram.unuse();

    return WebGLNode.PAINTED_SOMETHING;
  }

  /**
   * Releases references
   */
  public dispose(): void {
    // clears all of our resources
    this.displayShaderProgram.dispose();
    this.gl.deleteBuffer( this.vertexBuffer );
  }
}

export default ElectricPotentialMobileWebGLNode;