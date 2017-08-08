Package.describe({
	name: 'stefcud:leaflet-layerjson',
	version: '0.2.2',
	summary: "Leaflet JSON Layer",
	git: "https://github.com/stefanocudini/leaflet-layerjson.git"	
});

Package.on_use(function (api, where) {
	api.addFiles('dist/leaflet-layerjson.min.js', 'client');
});
