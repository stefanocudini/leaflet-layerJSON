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

var getJSON = function (url, cb) {	//default ajax request

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
};

L.LayerJSON = L.FeatureGroup.extend({

	includes: L.Mixin.Events,
	
	options: {
		url: "search.php?lat1={minlat}&lat2={maxlat}&lon1={minlon}&lon2={maxlon}",
		ajaxCall: getJSON,		//default function for load data
		propertyLoc: 'loc', 	//json property used as Latlng of marker
		propertyTitle: 'title', //json property used as title(popup, marker, icon)		
		oneUpdate: false,		//request data only at startup
		buildPopup: null,		//function popup builder
		buildIcon: null,		//function icon builder
		attribution: ''			//attribution text		
	},
    
	initialize: function(options) {
		L.FeatureGroup.prototype.initialize.call(this, []);
		L.Util.setOptions(this, options);
		this._buildPopup = this.options.buildPopup || this._defaultBuildPopup;
		this._buildIcon = this.options.buildIcon || this._defaultBuildIcon;
		this.sourceRequest = null;
	},

	onAdd: function(map) {
		L.FeatureGroup.prototype.onAdd.call(this, map);		//set this._map

		this._icon = this._buildIcon();
		
		if(this.options.oneUpdate===false)
			this._map.on('moveend', this.update, this);
		
		this.update();
	},
    
	onRemove: function(map) {
		L.FeatureGroup.prototype.onRemove.call(this, map);		
		map.off('moveend', this.update, this);
	},	
	
	getAttribution: function() {
		return this.options.attribution;
	},
	
	_defaultBuildPopup: function(data) {	//default popup builder
		var html = '';
		
		if(data.hasOwnProperty(this.options.propertyTitle))
		{
			html += '<h4>'+ data[this.options.propertyTitle] +'</h4>';
			delete data[this.options.propertyTitle];
		}
		delete data[this.options.propertyLoc];
		for(var i in data)
			html += '<b>'+i+':</b> '+data[i]+'<br>';
		
		return html;
	},
	
	_defaultBuildIcon: function() {
		return new L.Icon.Default();
	},
	
	addNewMarker: function( data ) {
		var latlng = data[ this.options.propertyLoc ],
			title = data[ this.options.propertyTitle ],
			//TODO check propertyLoc and propertyTitle in addNewMarker
			icon = this._buildIcon(title),
			markerOpts = L.Util.extend({icon: icon}, data),
			marker = new L.Marker(latlng, markerOpts );
		
		marker.bindPopup( this._buildPopup( data ) );
		
		this.fire('markeradded', {marker: marker});

		this.addLayer(marker);
	},
    
	update: function() {
	
		var bb = this._map.getBounds(),

			sw = bb.getSouthWest(),
			ne = bb.getNorthEast(),
			url = L.Util.template(this.options.url, {minlat: sw.lat, maxlat: ne.lat, minlon: sw.lng, maxlon: ne.lng});
		//TODO	.toFixed(6)
		if(this.sourceRequest)
			this.sourceRequest.abort();	//block last data request

		var that = this;
		this.sourceRequest = this.options.ajaxCall(url, function(json) {

			that.sourceRequest = null;

			that.fire('dataloaded', {data: json});
			
			that.clearLayers();

			for(var k in json)
				that.addNewMarker( json[k] );
		});
	}
});

}).call(this);

