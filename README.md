
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
map.addLayer( new L.LayerJSON({ url: 'search.php?format=json&lat1={minlat}&lat2={maxlat}&lon1={minlon}&lon2={maxlon} }) );

```