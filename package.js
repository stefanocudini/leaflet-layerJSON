Package.describe({
	name: 'leaflet-layerjson',
	version: '0.1.7',
	summary: "Leaflet Dynamic JSON Layer"
});

Package.on_use(function (api, where) {
	api.add_files('dist/leaflet-layerjson.min.js', 'client');
	//TODO server-side methods...	
});

Package.describe({
	summary: "Leaflet Control plugin for tracking gps position, with more options",
	name: "stefcud:leaflet-gps",
	version: "1.0.2",
	summary: "Leaflet Control GPS",
	git: "https://github.com/stefanocudini/leaflet-gps.git"
});

Package.on_use(function (api, where) {
	api.addFiles('dist/leaflet-layerjson.min.js', 'client');
});
