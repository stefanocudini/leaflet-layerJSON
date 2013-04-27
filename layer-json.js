/*
 * Leaflet Generic JSON Layer 1.0.0
 * http://labs.easyblog.it/maps/leaflet-layerjson
 *
 * https://github.com/stefanocudini/leaflet-layerJSON
 * https://bitbucket.org/zakis_/leaflet-layerJSON
 *
 * Copyright 2013, Stefano Cudini - stefano.cudini@gmail.com
 * Licensed under the MIT license.
 */
(function() {

L.LayerJSON = L.FeatureGroup.extend({

	includes: L.Mixin.Events,
	//
	//Managed Events:
	//	Event			Data passed		Description
	//  dataloading		{url}			fired before ajax/jsonp reques(useful for show gif loader)
	//	dataloaded		{data}			fired on ajax/jsonp request success
	//
	
	//TODO implement markers caching using index: lat+''+lng
	options: {
		url: 'search.php?lat1={minlat}&lat2={maxlat}&lon1={minlon}&lon2={maxlon}',
		jsonpParam: null,			//callback parameter name for jsonp request append to url
		dataCall: null,				//alternative function that return data (if use $.ajax() set async=false)
		propertyLoc: 'loc', 		//json property used as Latlng of marker
		propertyTitle: 'title', 	//json property used as title(popup, marker, icon)
		filter: null,				//function that will be used to decide whether to add or not marker, run before onEachMarker
		onEachMarker: null,			//function called on each marker created, similar to option onEachFeature of L.GeoJSON
		layerTarget: null,			//pre-existing layer for contents, is a LayerGroup or L.MarkerClusterGroup http://goo.gl/tvmu0
		buildPopup: null,			//function popup builder
		optsPopup: null,			//popup options
		buildIcon: null,			//function icon builder
		minShift: 8000,				//min shift for update data(in meters)
		cache: true,				//caching marker, indexing by latlng
		attribution: ''				//attribution text
	},
    
	initialize: function(options) {			
		L.FeatureGroup.prototype.initialize.call(this, []);
		L.Util.setOptions(this, options);
		this._buildPopup = this.options.buildPopup || this._defaultBuildPopup;
		this._buildIcon = this.options.buildIcon || this._defaultBuildIcon;
		this._dataRequest = null;		
		this._dataUrl = this.options.url;
		this._center = null;
		if(this.options.jsonpParam)
		{
			this._dataUrl += '&'+this.options.jsonpParam+'=';
			this._dataCall = this.getJsonp;
		}
		else
			this._dataCall = this.options.dataCall || this.getAjax;
		this._cacheData = {};//used for caching
	},

	onAdd: function(map) { //console.info('onAdd');
		
		L.FeatureGroup.prototype.onAdd.call(this, map);		//set this._map
		this._center = map.getCenter();

		map.on('moveend', function(e) {
			if( this._center.distanceTo( map.getCenter()) < this.options.minShift )
				return false;
			this._center = map.getCenter();
			this.update();
		}, this);
			
		this.update();
	},
    
	onRemove: function(map) { //console.info('onRemove');
		
		map.off('moveend', this.update, this); //FIXME not work!
		
		L.FeatureGroup.prototype.onRemove.call(this, map);	

		for (var i in this._layers) {
			if (this._layers.hasOwnProperty(i)) {
				L.FeatureGroup.prototype.removeLayer.call(this, this._layers[i]);
			}
		}		
	},
	
	getAttribution: function() {
		return this.options.attribution;
	},

	addLayer: function (layer) {
		if(this.options.layerTarget)
			this.options.layerTarget.addLayer.call(this.options.layerTarget, layer);
		else
			L.FeatureGroup.prototype.addLayer.call(this, layer);
		return this;
	},
	
	removeLayer: function (layer) {
		if(this.options.layerTarget)
			this.options.layerTarget.removeLayer.call(this.options.layerTarget, layer);
		else
			L.FeatureGroup.prototype.removeLayer.call(this, layer);
		return this;
	},
	
	clearLayers: function () {
		if(this.options.layerTarget)
			this.options.layerTarget.clearLayers.call(this.options.layerTarget);
		else
			L.FeatureGroup.prototype.clearLayers.call(this);
		return this;
	},
	
	_defaultBuildPopup: function(marker, data) {	//default popup builder
		var html = '';
		
		if(data.hasOwnProperty(this.options.propertyTitle))
		{
			html += '<h4>'+ data[this.options.propertyTitle] +'</h4>';
			delete data[this.options.propertyTitle];
		}
		data[this.options.propertyLoc] = data[this.options.propertyLoc].join();
		for(var i in data)
			html += '<b>'+i+':</b> '+data[i]+'<br>';
		
		return html;
	},
	
	_defaultBuildIcon: function() {
		return new L.Icon.Default();
	},
	
//	dataToMarker: function(data) {
//	//TODO	
//	},
	
	addMarker: function(data) {
		
		var latlng = data[ this.options.propertyLoc ],
			title = data[ this.options.propertyTitle ],
			//TODO check propertyLoc and propertyTitle in addMarker
			icon = this._buildIcon(title, data),
			markerOpts = L.Util.extend({icon: icon}, data),
			marker = new L.Marker(latlng, markerOpts );
		
		marker.bindPopup( this._buildPopup(marker, data), this.options.optsPopup );
		
		if(this.options.onEachMarker)
			this.options.onEachMarker(marker, data);

		//console.log('addMarker '+ marker.options.id);

		this.addLayer(marker);

		return marker;
	},
    
	update: function(e) {		//populate target layer
	
		var bb = this._map.getBounds(),
			sw = bb.getSouthWest(),
			ne = bb.getNorthEast(),
			//aggiungi margine bbox piu piccolo della mappa
			//TODO coords sended precision .toFixed(6)
			url = L.Util.template(this._dataUrl, {minlat: sw.lat, maxlat: ne.lat, minlon: sw.lng, maxlon: ne.lng}),
			cacheIndex = '';

		if(this._dataRequest)
			this._dataRequest.abort();	//block last data request

		var that = this;
		that.fire('dataloading', {url: url});		
		this._dataRequest = this._dataCall(url, function(json) {//using always that inside function

			that._dataRequest = null;

			that.fire('dataloaded', {data: json});
			//console.clear();

			that.clearLayers();
			for(var k in json)
			{
				if(that.options.filter && !that.options.filter(data)) continue;
				
				if(that.options.cache)
				{
					cacheIndex = json[k][that.options.propertyLoc][0]+'_'+json[k][that.options.propertyLoc][1];

					if( !that._cacheData[cacheIndex] )//if not cached
						that._cacheData[cacheIndex]= that.addMarker.call(that, json[k] );
						//TODO replace with dataToMarker() when implemented
					else
						that.addLayer( that._cacheData[cacheIndex] );
				}
				else
					that.addMarker.call(that, json[k] );
			}
		});
	},

/////////////////ajax jsonp methods

	getAjax: function(url, cb) {	//default ajax request

		if (window.XMLHttpRequest === undefined) {
			window.XMLHttpRequest = function() {
				try {
					return new ActiveXObject("Microsoft.XMLHTTP.6.0");
				}
				catch  (e1) {
					try {
						return new ActiveXObject("Microsoft.XMLHTTP.3.0");
					}
					catch (e2) {
						throw new Error("XMLHttpRequest is not supported");
					}
				}
			};
		}
		var request = new XMLHttpRequest(),
			response = {};

		request.open("GET", url);
		request.onreadystatechange = function() {
		    if (request.readyState === 4 && request.status === 200) {
		    	if(window.JSON) {
		            response = JSON.parse(request.responseText);
		    	} else {
		    		response = eval("("+ request.responseText + ")");
		    	}
		        cb(response);
		    }
		};
		request.send();
		return request;   
	},
	
	getJsonp: function(url, cb) {  //extract searched records from remote jsonp service
		var body = document.getElementsByTagName('body')[0],
			script = L.DomUtil.create('script','layerjson-jsonp', body );

		L.LayerJSON.callJsonp = function(data) {	//jsonp callback
			//TODO data = filterJSON.apply(that,[data]);
			cb(data);
			body.removeChild(script);
		}
		script.type = 'text/javascript';
		script.src = url+'L.LayerJSON.callJsonp';
	}	
});

}).call(this);

