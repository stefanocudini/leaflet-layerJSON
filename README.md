Leaflet Dynamic JSON Layer
============

What
------
Simple way for transform any JSON data source in a Leaflet Layer!

A Dynamic Leaflet Layer that load JSON data in layer in the form of markers with attributes

and minimize remote requests with caching system

Tested in Leaflet 0.7


Demos:
------
[http://labs.easyblog.it/maps/leaflet-layerjson](http://labs.easyblog.it/maps/leaflet-layerjson/)


Where
------
Source code:

[Github](https://github.com/stefanocudini/leaflet-layerjson)  
[Bitbucket](https://bitbucket.org/zakis_/leaflet-layerjson)  
[NPM](https://npmjs.org/package/leaflet-layerjson)  
[Atmosphere](https://atmosphere.meteor.com/package/leaflet-layerjson)


Build
------
This plugin support [Grunt](http://gruntjs.com/) for building process.
Therefore the deployment require [NPM](https://npmjs.org/) installed in your system.

After you've made sure to have npm working, run this in command line:
```
npm install
grunt
```

How to use
------
Adding the layer to the map:

```
var l = new L.LayerJSON({url: "search.php?format=json&lat1={minlat}&lat2={maxlat}&lon1={minlon}&lon2={maxlon}" });
map.addLayer(l);
```

**Options:**
* **url** remote url,
* **jsonpParam** callback parameter name for jsonp request append to url
* **callData** alternative function that return data (if use $.ajax() set async=false)
* **propertyLoc** json property used as Latlng of marker, if is array like: ['lat','lon'] select double fields
* **propertyTitle** json property used as title(popup, marker, icon)
* **filterData** function that filter marker by its data, run before onEachMarker
* **dataToMarker** function that will be used for creating markers from json points
* **onEachMarker** function called on each marker created, similar to option onEachFeature of L.GeoJSON
* **layerTarget** pre-existing layer to add markers(L.LayerGroup, L.MarkerClusterGroup)
* **buildPopup** function popup builder
* **optsPopup** popup options
* **buildIcon** function icon builder
* **minShift** min shift for update data(in meters)
* **updateOutBounds** request new data only if current bounds higher than last bounds
* **precision** number of digit send to server for lat,lng precision
```
