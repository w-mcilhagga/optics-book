# Ray Tracing

## State & Ray-Tracing
State is an object consisting of the following properties:
* ```w, h``` : the proposed width and height of the scene
* ```origin``` : a vector giving the origin of the world space within the scene. Default is ```[w/2, h/2]```. World space is always y-upwards
* ```ppm``` : pixels-per-metre, the scale of the scene
* ```items``` : the list of items in the scene.

The items can be of many types. The following properties and methods are used in ray-tracing:

* ```id``` : (optional) a string giving the id of the item. Defaults to a random number.
* ```type``` : (optional) a string giving the item type. This is used to connect the item to a prototype with methods defined.
* ```plane``` : (optional) gives the z-plane the item is in. Defaults to 0. Items will only interact with other items on the same plane.
* ```init(state)```: initialize the item prior to a run of ray-tracing.
* ```boundingBox()``` : returns ```xmin, xmax, ymin, ymax]``` the bounding box of the item
* ```emit(items, boundingbox)``` : (for light sources only) generates an array of rays from the light source. ```items``` is a dictionary of items (defined as items with an ```intersect``` method) in the scene indexed by ```id```, and ```boundingBox``` is the box containing all items. 
* ```intersect(ray)``` : returns the intersection of a ray with the item. The intersection is an object with the following properties:
    * ```pt```: the point ```[x, y]``` of intersection
    * ```distance``` : the distance the ray has to travel to hit the item
    * ```object``` : the item itself.
* ```optics(ray)``` : returns the new direction vector of a ray which has intersected the item

The ray tracing function requires ```emit``` to be defined for light sources and ```intersect``` for all objects that interact with light rays. If they change the direction of the ray, rather than merely absorb it, they also need an ```optics``` method.

Before any ray-tracing, the ```boundingBox``` and ```init``` methods are called on all objects that have them defined. ```init``` is called in order of item definition.

Quite a few items will also have the following defined:

* ```center()``` : returns the center of the item
* ```ends()``` : returns ```[[x0,y0], [x1,y1]]```, the two ends of the item, for linear items such as barriers and lenses. 
* ```distanceTo(pt)``` : the shortest distance from the item to the point ```[x,y]```
* ```move(dx, dy)``` : changes the location of the item by an amount ```dx,dy```

## Rays
The ray object has the following properties:
* ```path``` : an array giving a list of points where the ray changes direction
* ```direction``` : if present, the ray continues to infinity in this direction from ```path[path.lengt-`]```.

Whe lights ```emit``` rays, they return an array of rays which will consist of a single ```path``` point (namely where the ray starts) and a direction.

# Drawing

The items in the state can be drawn if they have the following method:

* ```draw(p5, viewbox, ppm)``` : ```p5``` is the p5.js instance, ```viewbox``` is ```[left, right, bottom, top]``` pixels of the viewport (in y-upwards coordinates), and ```ppm``` is pixels per metre, for scaling the item. Note that the ```ppm``` value is there to dissociate the object size from say the stroke width when it is being drawn.
* ```decorate(p5, ppm)``` : called if the item has some decoration on it (e.g. selection boxes). This needas to be formalized.

Items can have a ```style``` object defined (or use the default defined by their type). Style objects have the following properties:
* ```stroke``` : for p5
* ```strokeWeight``` : for p5
* ```fill``` : for p5
* ```z_order``` : (optional) controls the order that items are drawn. Default is 0. Rays always have a z order of 1, regardless of the plane, although their z order should reflect the plane.

# Dragging etc.
If the item has ```distanceTo``` and ```move``` methods it can be selected and moved by the user interface. The selectability of an item can be controlled by a ```ui``` object on the item with the following optional properties:
* ```selectable``` : set to false if the item can't be selected
* ```xlock``` : set true if the item's x-coordinate is fixed. Set to an arrray ```[low, high]``` if its x-coordinate is restricted.
* ```ylock``` : set to true if the items y-coordinate is fixed. Set to an arrray ```[low, high]``` if its y-coordinate is restricted.
