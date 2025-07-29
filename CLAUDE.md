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

## TypeScript Conversion Rules

When converting JavaScript files to TypeScript in PhET projects:

1. **File Renaming**: Use `git mv filename.js filename.ts` to preserve git history
2. **Required Imports**: 
   - Add `import Tandem from '../../../../tandem/js/Tandem.js';` for tandem parameters
   - Add `import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';` when you need `any` types
   - Import `PhetioObjectOptions` when extending PhetioObject: `import PhetioObject, { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';`
3. **Property Declarations**: All class properties must be declared with explicit types and access modifiers:
   ```typescript
   public readonly electricFieldProperty: Vector2Property;
   private readonly computeElectricField: ( position: Vector2 ) => Vector2;
   ```
4. **Constructor Parameters**: Must have explicit types and public access modifier:
   ```typescript
   public constructor( computeElectricField: ( position: Vector2 ) => Vector2, initialPosition: Vector2, tandem: Tandem )
   ```
5. **Method Access Modifiers**: All methods require explicit access modifiers (`public`, `private`)
6. **Override Methods**: Methods overriding base class methods need `override` modifier:
   ```typescript
   public override dispose(): void
   ```
7. **Remove JSDoc Type Annotations**: Remove `@param {Type}` and `@public` JSDoc comments - use TypeScript types instead
8. **Property Documentation**: Document properties at declaration site, not assignment site in constructor
   - Add blank lines before line comments for better readability
9. **Validation Commands**: Always run `grunt type-check` and `grunt lint --fix` after conversion
10. **Liberal @ts-expect-error**: Use `@ts-expect-error` for unresolved issues to focus on one file at a time

## Common TypeScript Patterns in PhET

1. **Property Types**:
   - `Vector2Property` for position/vector properties
   - `Property<number>` for numeric values
   - `BooleanProperty` for boolean flags
   
2. **Import Pattern**:
   - Always use `.js` extension in imports even for TypeScript files
   - Common imports needed: `import Tandem from '../../../../tandem/js/Tandem.js';`

3. **Property Patterns**:
   - Use `readonly` for properties that shouldn't be reassigned

4. **Static IOType Pattern**:
   - Declare static IOType property in class: `public static ModelElementIO: IOType<ModelElement, IntentionalAny>;`
   - Assign after class definition: `ModelElement.ModelElementIO = new IOType<ModelElement, IntentionalAny>(...);`
   - Cannot use `readonly` for static IOType properties that are assigned after class definition

5. **Handling Legacy Code**:
   - Use `IntentionalAny` instead of `any` to satisfy lint rules
   - Add `// eslint-disable-next-line phet/bad-typescript-text` before `merge` function calls
   - Remove redundant type assertions (e.g., `instanceof` checks) when TypeScript already enforces the type
   - Use non-null assertion (`!`) for required options like tandem: `const tandem = options.tandem!;`

6. **Global Variables**:
   - Keep `/* global TWEEN */` comments when code uses global libraries

## Conversion Process Summary

1. `git mv file.js file.ts` (preserves git history)
2. Run `grunt type-check` and `grunt lint --fix` to see all issues
3. Add necessary imports (especially Tandem)
4. Add property declarations with types and access modifiers
5. Fix constructor parameters and add access modifier
6. Fix method access modifiers and add `override` where needed
7. Remove JSDoc type annotations
8. Add blank lines before line comments
9. Run validation commands again to verify