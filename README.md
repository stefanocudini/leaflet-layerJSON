Leaflet Generic JSON Layer
============

What
------

Simple way for transform any JSON data source in a Leaflet Layer!

A generic Leaflet Layer that load JSON data in layer in the form of markers with attributes

and minimize remote requests with caching system

Tested in Leaflet 0.6


Demos:
------
http://labs.easyblog.it/maps/leaflet-layerjson


How
------

Adding the layer to the map:

```
map.addLayer( new L.LayerJSON({ url: 'search.php?format=json&lat1={minlat}&lat2={maxlat}&lon1={minlon}&lon2={maxlon} }) );

```

Where
------

Source code:

https://github.com/stefanocudini/leaflet-layerJSON

https://bitbucket.org/zakis_/leaflet-layerJSON
