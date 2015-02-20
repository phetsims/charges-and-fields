## Implementation Notes

The model is designed using a modelViewTransform. In the model the origin is set at the center of the screen
For the scale factor, the height of the layout bounds is set to be 5 meters.

In the model, the charge of a particle is 1 for a positive article and -1 for a negative particle.
One observable array is used to monitor all the coming ang going of all the charges. A second observable
array stores all the electric field sensors. The electric field grid arrays and electric potential (field) grid
are represented in the model an array of StaticSensorElement(s). For performance reasons, the electric field and
electric potential arrays are updated solely when they are toggled as visible. In addition, the electric field
and electric potential are updated through delta (changes) to reduce the computational demand. Much effort has been
made to reduce the number of vector allocations for the electric field calculations. In the scene graph, the electric
potential array is represented as a webGL node with a canvas fallback.

An equipotential line is represented by a series of positions. The view is responsible
for linking these points into a series of line segments. The code contains model and view elements
to generate electric field lines. They can be turn on by setting 'isBasicsVersion' to false.
