/*
 * copyright 2013 stefano.cudini@gmail.com
 *
 */
(function() {

var getJSON = function (url, cb) {

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
		ajaxCall: getJSON,	//funzione per richiesta ajax
		attribution: null,
		oneUpdate: false,		//aggiorna dati solo una volta quando si aggiunge il layer	
		url: "search.php?lat1={minlat}&lat2={maxlat}&lng1={minlon}&lng2={maxlon}",
		buildPopup: null,		//funzione che costruisce il popup
		buildIcon: null		//funzione che costruisce il popup
	},
    
	initialize: function(options) {
		L.FeatureGroup.prototype.initialize.call(this, []);
		
		L.Util.setOptions(this, options);
		this._buildPopup = this.options.buildPopup || this._defaultBuildPopup;
		this._buildIcon = this.options.buildIcon || this._defaultBuildIcon;
		//this._layer = new L.LayerGroup();
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
		this._map.off('moveend', this.update, this);
	},	
	
	getAttribution: function() {
		return this.options.attribution;
	},
	
	_defaultBuildPopup: function(data) {	//default popup builder
		var ret = '<h4>'+ data.nome +'</h4>';
		delete data.nome;
		for(var i in data)
			ret += '<b>'+i+':</b> '+data[i]+'<br>';
		return ret;
	},
	
	_defaultBuildIcon: function(label) {
		label = label || '';
		return new L.DivIcon({
			iconSize: new L.Point(30, 35),
			iconAnchor: new L.Point(14, 35),
			popupAnchor: new L.Point(0, -35),
			//html: '<span class="climbo-icon-label">'+label+'</span>',
			className: 'climbo-icon'
		});
	},
	
	addNewMarker: function(ll, data) {
		var title = data.nome,
			icon = this._buildIcon(title),
			marker = new L.Marker(ll, L.Util.extend({icon: icon}, data) );
		
		marker.bindPopup( this._buildPopup( data ) );
		
		this.fire('markeradded', {marker: marker});

		this.addLayer(marker);
	},
    
	update: function() {
	
		var bb = this._map.getBounds(),
			sw = bb.getSouthWest(),
			ne = bb.getNorthEast(),
			url = L.Util.template(this.options.url, {minlat: sw.lat, maxlat: ne.lat, minlon: sw.lng, maxlon: ne.lng});

		if(this.sourceRequest)
			this.sourceRequest.abort();	//blocca l'ultima richiesta di dati

		var that = this;
		this.sourceRequest = this.options.ajaxCall(url, function(json) {

			that.sourceRequest = null;

			var data = {};
			
			if(json.ok)
				data = json.results;

			that.fire('dataloaded', {data: data});
			
			that.clearLayers();

			for(var k in data)
				that.addNewMarker( data[k].loc, data[k] );
		});
	}
});

}).call(this);

