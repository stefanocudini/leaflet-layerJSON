
(function() {

L.LayerJSON = L.FeatureGroup.extend({

	includes: L.Mixin.Events,
	//
	//Managed Events:
	//	Event			Data passed		Description
	//  dataloading		{url}			fired before ajax/jsonp reques(useful for show gif loader)
	//	dataloaded		{data}			fired on ajax/jsonp request success
	//
	options: {
		url: 'search.php?lat1={minlat}&lat2={maxlat}&lon1={minlon}&lon2={maxlon}',
		jsonpParam: null,			//callback parameter name for jsonp request append to url
		callData: null,				//alternative function that return data (if use $.ajax() set async=false)
		propertyLoc: 'loc', 		//json property used as Latlng of marker
		//if propertyLoc is array like: ['latname','lonname'] for select double fields(ex. ['lat','lon'] )
		propertyTitle: 'title', 	//json property used as title(popup, marker, icon)
		filterData: null,				//function that filter marker by its data, run before onEachMarker
		dataToMarker: null,			//function that will be used for creating markers from json points, similar to pointToLayer of L.GeoJSON
		onEachMarker: null,			//function called on each marker created, similar to option onEachFeature of L.GeoJSON
		layerTarget: null,			//pre-existing layer to add markers, is a LayerGroup or L.MarkerClusterGroup http://goo.gl/tvmu0
		buildPopup: null,			//function popup builder
		optsPopup: null,			//popup options
		buildIcon: null,			//function icon builder
		minShift: 8000,				//min shift for update data(in meters)
		updateOutBounds: true,		//request new data only if current bounds higher than last bounds
		precision: 6,				//number of digit send to server for lat,lng precision
		attribution: ''				//attribution text
		//TODO option: enabled, if false 
		//TODO methods: enable()/disable()
	},
    
	initialize: function(options) {			
		L.FeatureGroup.prototype.initialize.call(this, []);
		L.Util.setOptions(this, options);
		this._dataToMarker = this.options.dataToMarker || this._defaultDataToMarker;
		this._buildIcon = this.options.buildIcon || this._defaultBuildIcon;
		this._filterData = this.options.filterData || null;
		this._dataRequest = null;
		this._dataUrl = this.options.url;
		this._center = null;
		this._maxBounds = null;
		this._markers = {};	//used for caching _dataToMarker builds
		if(this.options.jsonpParam)
		{
			this._dataUrl += '&'+this.options.jsonpParam+'=';
			this._callData = this.getJsonp;
		}
		else
			this._callData = this.options.callData || this.getAjax;
	},

	onAdd: function(map) { //console.info('onAdd');
		
		L.FeatureGroup.prototype.onAdd.call(this, map);		//set this._map
		this._center = map.getCenter();
		this._maxBounds = map.getBounds();

		map.on('moveend', this._onMove, this);
			
		this.update();
	},
    
	onRemove: function(map) { //console.info('onRemove');
		
		map.off('moveend', this._onMove, this); //FIXME not work!
		
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
		{
			this.options.layerTarget.addLayer.call(this.options.layerTarget, layer);
			return this.fire('layeradd', {layer: layer});
		}
		else
			L.FeatureGroup.prototype.addLayer.call(this, layer);
		return this;
	},
	
	removeLayer: function (layer) {
		if(this.options.layerTarget)
		{
			this.options.layerTarget.removeLayer.call(this.options.layerTarget, layer);
			return this.fire('layerremove', {layer: layer});
		}
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
	
	_defaultBuildIcon: function(data, title) {
		return new L.Icon.Default();
	},
	
	_defaultDataToMarker: function(data, latlng) {	//make marker from data

		var title = data[ this.options.propertyTitle ],
			//TODO check propertyLoc and propertyTitle in addMarker
			markerOpts = L.Util.extend({icon: this._buildIcon(data,title), title: title }, data),
			marker = new L.Marker(latlng, markerOpts ),
			htmlPopup = null;
		
		if(this.options.buildPopup && (htmlPopup = this.options.buildPopup(data, marker)))
			marker.bindPopup(htmlPopup, this.options.optsPopup );
		
		return marker;
	},
	
	addMarker: function(data) {
		//TODO empty this._markers sooner or later

		var latlng, hash, propLoc = this.options.propertyLoc;

		if( L.Util.isArray(propLoc) )
			latlng = L.latLng( parseFloat(data[propLoc[0]]), parseFloat(data[propLoc[1]]) );
		else
			latlng = L.latLng( data[propLoc] );

		hash = [latlng.lat,latlng.lng].join() + data[this.options.propertyTitle];

		if(!this._markers[hash])
			this._markers[hash] = this._dataToMarker(data, latlng);

		if(this.options.onEachMarker)//maybe useless
			this.options.onEachMarker(data, this._markers[hash]);

		this.addLayer( this._markers[hash] );
	},

	_updateMarkersCached: function(bounds) {
		for(var i in this._markers)
			if( bounds.contains(this._markers[i].getLatLng()) )
				this.addLayer(this._markers[i]);
			else
				this.removeLayer(this._markers[i]);
	},
	
	_onMove: function(e) {

		var newCenter = this._map.getCenter(),
			newBounds = this._map.getBounds();

			console.log(newCenter);

		if( this.options.minShift && this._center.distanceTo(newCenter) < this.options.minShift )
			return false;
		else
			this._center = newCenter;

		if( this.options.updateOutBounds && this._maxBounds.contains(newBounds) )//bounds not incremented
		{
			this._updateMarkersCached(newBounds);
			//TODO maybe execute this ever
			return false;
		}
		else
			this._maxBounds.extend(newBounds);
		
		this.update();
	},
	
	update: function(clear) {	//populate target layer
	
		var //clear = clear || false,
			bb = this._map.getBounds(),
			sw = bb.getSouthWest(),
			ne = bb.getNorthEast(),
			//TODO send map bounds decremented
			p = this.options.precision,
			url = L.Util.template(this._dataUrl, {
					minlat: sw.lat.toFixed(p), maxlat: ne.lat.toFixed(p), 
					minlon: sw.lng.toFixed(p), maxlon: ne.lng.toFixed(p)
				});

		if(this._dataRequest)
			this._dataRequest.abort();	//prevent parallel requests

		var that = this;
		that.fire('dataloading', {url: url });	
		this._dataRequest = this._callData(url, function(json) {//using always that inside function

			that._dataRequest = null;

			if(that._filterData)
				json = that._filterData(json);

			that.fire('dataloaded', {data: json});
			
			//that.clearLayers();
			for(var k in json)
				that.addMarker.call(that, json[k]);
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
		var request = new XMLHttpRequest();
		request.open('GET', url);
		request.onreadystatechange = function() {
			var response = {};
		    if (request.readyState === 4 && request.status === 200) {
		    	try {
					if(window.JSON) {
				        response = JSON.parse(request.responseText);
					} else {
						response = eval("("+ request.responseText + ")");
					}
		    	} catch(err) {
		    		console.info(err);
		    		response = {};
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
		return {abort: function() { script.parentNode.removeChild(script); } };
	}
});

}).call(this);

