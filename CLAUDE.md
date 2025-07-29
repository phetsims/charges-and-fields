# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

**Development workflow:**
- `grunt type-check` - Run TypeScript type checking
- `grunt lint --fix` - Run ESLint
- Run the sim to see if it crashes on startup: Use the playwright MCP and launch http://localhost/charges-and-fields/charges-and-fields_en.html?brand=phet&ea&debugger
  - NOTE: PhET uses canvas/svg/webgl and a Parallel DOM (PDOM) so you cannot interact with it in the ususal way!

## Architecture Overview

This is a PhET Interactive Simulation built on the PhET framework:

**Core Structure:**
- **Main entry**: `js/charges-and-fields-main.js` - Uses simLauncher and creates single screen sim
- **Screen**: `js/charges-and-fields/ChargesAndFieldsScreen.js` - Creates model and view
- **Model**: `js/charges-and-fields/model/ChargesAndFieldsModel.js` - Core simulation logic
- **View**: `js/charges-and-fields/view/ChargesAndFieldsScreenView.js` - Main view coordination

**Key PhET Dependencies:**
- `axon/` - Observable Properties, Emitters, and arrays for reactive programming
- `scenery/` - Scene graph for UI rendering
- `joist/` - Simulation framework (Screen, Sim classes)
- `dot/` - Mathematical utilities (Vector2, Bounds2)
- `sun/` - UI components (buttons, panels, controls)
- `tandem/` - PhET-iO instrumentation system

**Model Architecture:**
- Uses modelViewTransform with origin at screen center, 8-meter width scale
- Observable arrays track: all charges, active charges, electric field sensors
- Performance-optimized electric field/potential calculations with delta updates
- WebGL rendering for electric potential with canvas fallback

**View Architecture:**
- Canvas-based rendering for electric field arrows and potential
- WebGL implementation with mobile fallback for floating-point texture support
- Color theming via ChargesAndFieldsColors (default/projector modes)
- Drag bounds constrained by extended screen bounds

**Key Model Classes:**
- `ChargedParticle` - Movable positive/negative charges
- `ElectricFieldSensor` - Measures E-field at a point
- `ElectricPotentialSensor` - Measures potential at a point
- `ElectricPotentialLine` - Equipotential line representation
- `MeasuringTape` - Distance measurement tool

**Key View Classes:**
- `ElectricFieldCanvasNode` - Renders field arrow grid
- `ElectricPotentialWebGLNode` - WebGL potential field rendering
- `ChargedParticleNode` - Draggable charge representations
- Various sensor and control panel nodes

## Dependencies Management

This simulation requires many PhET sibling repositories. The `dependencies.json` file tracks exact SHAs for all dependencies. When working across repositories, ensure changes are compatible with the dependency versions specified.

## File Structure Notes

- `js/ChargesAndFieldsStrings.ts` - Internationalized strings
- `charges-and-fields-strings_en.json` - English string definitions
- `doc/implementation-notes.md` - Detailed technical implementation notes
- `mipmaps/` - Optimized images and their TypeScript definitions
- Uses TypeScript with `tsconfig.json` configuration

## Environment

- This is developed as part of a monorepo. If you need details for any dependencies, you can follow the import paths
  imports. You will be approved to read files outside our working directory.
- If you would like to see how it was done in other simulations, you can search for patterns in '../' and you will be
  approved to read the code in those directories.
- When getting the contents of a file, it probably has a *.ts suffix even though it is imported as *.js.
- Read ./doc/model.md and ./doc/implementation-notes.md when you need more context about the simulation.

## Code Style

- Use TypeScript with explicit typing for all properties and parameters
- Access modifiers (`public`, `private`) required for class members
- Class names: PascalCase, Files: kebab-case, Variables/Methods: camelCase
- Properties use PhET's Property system (NumberProperty, BooleanProperty)
- Boolean properties begin with verbs (`is`, `has`, `show`)
- Model classes should never import from view
- Use parameter destructuring for object configs
- Include JSDoc comments for all methods and classes
- Add tandem parameters for PhET-IO integration
- Use explicit file extensions in imports (.js)