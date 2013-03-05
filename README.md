Leaflet Generic JSON Layer
============

What
------

A generic Leaflet Layer that load JSON data in layer in the form of markers with attributes

Tested in Leaflet 0.5

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


Demos:

http://labs.easyblog.it/maps/leaflet-layerjson

