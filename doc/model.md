## Description of the model used in charges and fields

The model treats the electric charges as point charges of one nano Coulomb. Although the
three dimensional Maxwell's equations are used, the charges are confined to move
along a two dimensional surface. The electric potential falls off as 1/r away
from a charge and the electric field falls off as 1/r^2. The numerical value for the
electric potential and electric field involve a sum over all charges of their individual
potential (or field) contributions.

An equipotential line is found by a modified midpoint method algorithm. On rare occasions,
the equipotential lines may not form closed lines due to the finite number of steps in the
equipotential line algorithm.