Leaflet Dynamic JSON Layer
============

Simple way for transform any JSON data source in a Leaflet Layer!

A Dynamic Leaflet Layer that load JSON data in layer in the form of markers with attributes

and minimize remote requests with caching system

Tested in Leaflet 0.7


How to use
------

```
var l = new L.LayerJSON({url: "search.php?lat1={lat1}&lat2={lat2}&lon1={lon1}&lon2={lon2}" });
map.addLayer(l);
```

Options
------

Data Source:
* **url** remote url,
* **jsonpParam** callback parameter name for jsonp request append to url
* **callData** alternative function that return data (if use *$.ajax()* set async=false)

Filtering:
* **propertyItems** json property used contains data items
* **propertyLoc** json property used as Latlng of marker, if is array: *['lat','lon']* select double fields
* **locAsGeoJSON** interpret location data as [lon, lat] value pair instead of [lat, lon]
* **propertyTitle** json property used as title in marker
* **filterData** function for pre-filter data

Rendering:
* **dataToMarker** function that will be used for creating markers from json points
* **onEachMarker** function called on each marker created, similar to option onEachFeature of L.GeoJSON
* **layerTarget** pre-existing layer to add markers(*L.LayerGroup*, *L.MarkerClusterGroup*)
* **buildPopup** function popup builder
* **optsPopup** popup options
* **buildIcon** function icon builder

Caching:
* **minShift** min shift for update data(in meters)
* **updateOutBounds** request new data only if current bounds higher than last bounds
* **precision** number of digit send to server for lat,lng precision

Where
------

**Demos:**

[http://labs.easyblog.it/maps/leaflet-layerjson](http://labs.easyblog.it/maps/leaflet-layerjson/)

**Source:**

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

