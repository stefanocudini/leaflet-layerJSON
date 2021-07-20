Leaflet JSON Layer
============

[![npm version](https://badge.fury.io/js/leaflet-layerjson.svg)](https://badge.fury.io/js/leaflet-layerjson)

Simple way for transform any JSON data source in a Leaflet Layer!

A Dynamic Leaflet Layer that load JSON data in layer in the form of markers with attributes

and minimize remote requests with caching system

Tested in Leaflet 0.7 and 1.1

# Options
| Option		| Data	  | Description                       |
| ------------- | --------| ----------------------------------------- |
| url           | String  | remote url                                |
| jsonpParam    | String  | callback parameter name for jsonp request append to url |
| jsonpParam    | String  | callback parameter name for jsonp request append to url |
| callData	    | Function  | custom function for data source, params: (req: url|bbox, callback: func), return {abort: func} or jQuery jqXHR Object |
| **Filtering**   |         |   |                                      
| propertyItems	| String  | json property used contains data items |
| propertyLoc	| String  | json property used as Latlng of marker, if is array: *['lat','lon']* select double fields |
| locAsGeoJSON	| String  | interpret location data as [lon, lat] value pair instead of [lat, lon] |
| propertyTitle	| String  | json property used as title in marker |
| filterData	| Function  | function for pre-filter data |
| **Rendering**   |         |   |
| dataToMarker	| Function  | function that will be used for creating markers from json points |
| layerTarget	| L.Layer  | pre-existing layer to add markers(*L.LayerGroup*, *L.MarkerClusterGroup*) |
| buildPopup	| Function  | function popup builder |
| optsPopup	    | String  | popup options |
| buildIcon	    | Function  | function icon builder |
| **Caching**     |         |  |
| minZoom       | Number  	| min zoom for call data |
| caching       | Boolean   | remote requests caching |
| cacheId       | Function  | function to generate id used to uniquely identify data items in cache |
| minShift	    | Number | min shift for update data(in meters) |
| precision	    | Number | number of digit send to server for lat,lng precision |
| updateOutBounds| String | request new data only if current bounds higher than last bounds |
| updateMarkers | Boolean | update all markers in map to last results of callData |

# Events
| Event			 | Data			  | Description                               |
| ---------------------- | ---------------------- | ----------------------------------------- |
| 'dataloading' | {req: url|bbox} | fired before ajax/jsonp request, req is bbox if url option is null |
| 'dataloaded'	| {data: json}	  | fired on ajax/jsonp request success |

# Usage

```
var l = new L.LayerJSON({url: "search.php?lat1={lat1}&lat2={lat2}&lon1={lon1}&lon2={lon2}" });
map.addLayer(l);
```

# Where

**Demos:**

[https://opengeo.tech/maps/leaflet-layerjson](https://opengeo.tech/maps/leaflet-layerjson/)

**Source:**

[Github](https://github.com/stefanocudini/leaflet-layerjson) 

[Atmosphere](https://atmosphere.meteor.com/package/leaflet-layerjson)


# Build

This plugin support [Grunt](https://gruntjs.com/) for building process.
Therefore the deployment require [NPM](https://npmjs.org/) installed in your system.

After you've made sure to have npm working, run this in command line:
```
npm install
grunt
```

