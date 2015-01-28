## Implementation Notes

The model is designed using a modelViewTransform. In the model the origin is set at the center of the screen
For the scale factor, the height of the layout bounds is set to be 5 meters.

In the model, the charge of a particle is 1 for a positive article and -1 for a negative particle.
One Observable array is used to monitor all the comning ang going of all the charges. A second observable 
array stores all the electric field sensors.

An equipotential line is represented by a series of positions. The view is responsible
for linking these points into a series of line segments. The code contains model and view elements
to generate electric field lines. They can be turn on by setting 'isBasicsVersion' to false.
