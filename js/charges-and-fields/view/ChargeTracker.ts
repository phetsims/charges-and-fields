// Copyright 2016-2025, University of Colorado Boulder

/**
 * Tracks movement of particles, so that efficient deltas can be computed for Canvas/WebGL display of the electric
 * potential.
 *
 * We add queue entries for particles that have changed, and queue items are in one of three states:
 * - New and old positions: The charge moved from the old position to the new position.
 * - New position: The charge was added, and is now at the new position.
 * - Old position: The charge has been removed, and was last at the old position.
 *
 * ChargeTracker will ensure there is only one queue element per particle that has changed (collapses together multiple
 * moves before things are updated, etc.)
 *
 * Generally create it, and to handle updates:
 * 1. Iterate through the queue, applying changes
 * 2. Call clear()
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargedParticle from '../model/ChargedParticle.js';

// Type for queue items
type QueueItem = {
  charge: number;
  oldPosition: Vector2 | null;
  newPosition: Vector2 | null;
};

// Type for position listeners with particle reference
type PositionListener = ( ( newPosition: Vector2, oldPosition: Vector2 ) => void ) & {
  particle: ChargedParticle;
};

export default class ChargeTracker {

  private readonly chargedParticles: ObservableArray<ChargedParticle>;

  // Functions to be called back when particle positions change, tagged with listener.particle = particle
  private readonly positionListeners: PositionListener[];

  private readonly particleAddedListener: ( particle: ChargedParticle ) => void;
  private readonly particleRemovedListener: ( particle: ChargedParticle ) => void;

  // Queued changes that will accumulate. oldPosition === null means "add it", newPosition === null means "remove it".
  // We'll apply these graphical deltas at the next rendering.
  public readonly queue: QueueItem[];

  /**
   * @param chargedParticles - only chargedParticles that are active in this array
   */
  public constructor( chargedParticles: ObservableArray<ChargedParticle> ) {

    this.chargedParticles = chargedParticles;
    this.positionListeners = [];
    this.particleAddedListener = this.onParticleAdded.bind( this );
    this.particleRemovedListener = this.onParticleRemoved.bind( this );

    // Listen to the charged particles individually
    this.chargedParticles.addItemAddedListener( this.particleAddedListener );
    this.chargedParticles.addItemRemovedListener( this.particleRemovedListener );

    this.queue = [];

    // Queue up changes that will initialize things properly.
    this.rebuild();
  }

  /**
   * Clears the queue, essentially saying "the external state is now up-to-date with the changes"
   */
  public clear(): void {
    while ( this.queue.length ) {
      this.queue.pop();
    }
  }

  /**
   * Clears the queue and adds all current particle positions, as if our external state has been reset to neutral.
   */
  public rebuild(): void {
    this.clear();

    for ( let i = 0; i < this.chargedParticles.length; i++ ) {
      this.addParticle( this.chargedParticles.get( i ) );
    }
  }

  /**
   * Called when this ChargeTracker won't be used anymore. Removes all listeners.
   */
  public dispose(): void {
    // Remove add/remove listeners
    this.chargedParticles.removeItemAddedListener( this.particleAddedListener );
    this.chargedParticles.removeItemRemovedListener( this.particleRemovedListener );

    // Remove position listeners
    while ( this.positionListeners.length ) {
      const positionListener = this.positionListeners.pop()!;
      positionListener.particle.positionProperty.unlink( positionListener );
    }
  }

  /**
   * Handle adding a particle with the queue.
   */
  private addParticle( particle: ChargedParticle ): void {
    this.queue.push( {
      charge: particle.charge,
      oldPosition: null,
      newPosition: particle.positionProperty.get().copy()
    } );
  }

  /**
   * Called when the particle is added to the model's list of charged particles. Hooks up listeners and the queue.
   */
  private onParticleAdded( particle: ChargedParticle ): void {
    this.addParticle( particle );

    // add the position listener (need a reference to the particle with the listener, so we can't use the same one)
    const positionListener = this.onParticleMoved.bind( this, particle ) as PositionListener;
    positionListener.particle = particle;
    this.positionListeners.push( positionListener );
    particle.positionProperty.lazyLink( positionListener );
  }

  /**
   * Called when our listener to the particle's position is fired. We see if we can reposition it, or create a new
   * entry.
   */
  private onParticleMoved( particle: ChargedParticle, newPosition: Vector2, oldPosition: Vector2 ): void {
    // Check to see if we can update an add/move for the same particle to a new position instead of creating
    // multiple queue entries for a single particle. This will help collapse multiple moves of the same particle in
    // one frame.
    let modified = false;
    for ( let i = 0; i < this.queue.length; i++ ) {
      const item = this.queue[ i ];
      if ( item.newPosition && item.newPosition.equals( oldPosition ) && item.charge === particle.charge ) {
        item.newPosition = newPosition;
        // console.log( 'update ' + particle.charge + ' ' + newPosition.toString() );
        modified = true;
        break;
      }
    }

    if ( !modified ) {
      this.queue.push( {
        charge: particle.charge,
        oldPosition: oldPosition.copy(),
        newPosition: newPosition.copy()
      } );
      // console.log( 'move ' + particle.charge + ' ' + oldPosition.toString() + ' to ' + newPosition.toString() );
    }
  }

  /**
   * Called when the particle is removed from the model's list of charged particles. Removes listeners, etc.
   */
  private onParticleRemoved( particle: ChargedParticle ): void {
    // See if we can update an already-in-queue item with a null position.
    let modified = false;
    for ( let i = 0; i < this.queue.length; i++ ) {
      const item = this.queue[ i ];
      if ( item.newPosition && item.newPosition.equals( particle.positionProperty.get() ) && item.charge === particle.charge ) {
        item.newPosition = null;

        // remove the item from the list if we would add-remove it
        if ( item.oldPosition === null ) {
          this.queue.splice( i, 1 );
          // console.log( 'remove ' + particle.charge + ' ' + particle.position.toString() );
        }
        modified = true;
        break;
      }
    }

    if ( !modified ) {
      this.queue.push( {
        charge: particle.charge,
        oldPosition: particle.positionProperty.get().copy(),
        newPosition: null
      } );
      // console.log( 'remove ' + particle.charge + ' ' + particle.position.toString() );
    }

    // remove the position listener
    for ( let k = 0; k < this.positionListeners.length; k++ ) {
      if ( this.positionListeners[ k ].particle === particle ) {
        particle.positionProperty.unlink( this.positionListeners[ k ] );
        this.positionListeners.splice( k, 1 );
        break;
      }
    }
  }
}

chargesAndFields.register( 'ChargeTracker', ChargeTracker );