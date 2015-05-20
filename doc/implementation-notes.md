## Implementation Notes

The model is designed using a modelViewTransform. In the model the origin is set at the center of the screen
For the scale factor, the width of the dev layout bounds is set to be 8 meters. The play area of
the simulation can be extended beyond the dev bounds of the simulation. 

In the model, the charge of a particle is +1 for a positive article and -1 for a negative particle. 
Charge can be active or inactive. An inactive charge has no effect on the electric field and potential sensors.
One observable array is used to monitor all the coming and going of all the charges. A second observable
array stores only the active charges. A third observable array stores all the electric field sensors. The electric 
field grid arrays and electric potential (field) grid are represented in the model as SensorGrid, that is
arrays of StaticSensorElements. For performance reasons, the electric field and electric potential grid arrays are 
updated solely when they are toggled as visible. In addition, the electric field and electric potential are updated
through delta (changes) to reduce the computational demand. Much effort has been made to reduce the number of
vector allocations for the electric field calculations, sometimes at the expense of readability. In the scene 
graph, the electric potential array (field) is represented as a webGL node with a canvas fallback. There are two webGL 
implementations, namely mobileWebGl and WebGL. The mobileWebGL is used as a fall back to the (full) webGL when the 
user device/browser cannot store floating-point data in a texture. The detection for webGL/mobileWebGL/canvas
is handled by the code.  

This simulation handles color properties using ChargesAndFieldsColors, and updates so that we can have the interactive 
color editor (charges-and-fields-colors.html), and switch between color schemes (projector or default).
  
All the movable object handled in the simulation are subject to drag bounds that are determined by the
extended bounds or the screen size bounds, whichever is smaller.

An equipotential line is represented by a series of positions. The view is responsible
for linking these points into a series of line segments. 