// ==UserScript==
// @id             iitc-plugin-maps-selector@eccenux
// @name           IITC plugin: Quick selector of maps
// @category       Misc
// @version        0.0.2
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @description    [0.0.2] This plugin provides extra toolbar allowing a quick change of map layers (Ingress, Roads, Hybrid, Terrain).
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @include        https://*.ingress.com/mission/*
// @include        http://*.ingress.com/mission/*
// @match          https://*.ingress.com/mission/*
// @match          http://*.ingress.com/mission/*
// @match          https://intel.ingress.com/*
// @grant          none
// @updateURL      https://github.com/Eccenux/iitc-plugin-maps-selector/raw/master/maps-selector.meta.js
// @downloadURL    https://github.com/Eccenux/iitc-plugin-maps-selector/raw/master/maps-selector.user.js
// ==/UserScript==

function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};


//PLUGIN START ////////////////////////////////////////////////////////

//use own namespace for plugin
window.plugin.mapsSelector = function() {};

// settings
window.plugin.mapsSelector.MAPS_TO_USE = {
	//"CartoDB Dark Matter" : '',
	//"CartoDB Positron" : '',
	//"Google Satellite" : 'S',
	"Google Default Ingress Map" : 'I',
	"Google Roads" : 'R',
	"Google Hybrid" : 'H',
	"Google Terrain" : 'T',
};

/**
 * Very simple logger.
 */
function LOG() {
	var args = Array.prototype.slice.call(arguments); // Make real array from arguments
	args.unshift("[mapsSelector] ");
	console.log.apply(console, args);
}
function LOGwarn() {
	var args = Array.prototype.slice.call(arguments); // Make real array from arguments
	args.unshift("[mapsSelector] ");
	console.warn.apply(console, args);
}

/**
 * Apply fix to Google Terrain map.
 * 
 * This fixes max zoom. See:
 * https://github.com/iitc-project/ingress-intel-total-conversion/issues/1258
 */
window.plugin.mapsSelector.fixTerrainZoom = function() {
	$.each(window.layerChooser._layers, function(ind, layer) {
		if(layer.name === "Google Terrain") {
			console.log(layer);
			layer.layer.options.maxZoom = 21;
			return false;
		}
	});
}

/**
 * Prepare map mappings.
 */
window.plugin.mapsSelector.prepareMapping = function() {
	if (this._prepareShowMapDone) {
		return this.layerMapping;
	}
	this._prepareShowMapDone = true;

	this.layerMapping = {};

	var me = this;
	var baseLayers = window.layerChooser.getLayers().baseLayers;
	$.each(baseLayers, function(ind, layer) {
		if (layer.name in me.MAPS_TO_USE){
			var key = me.MAPS_TO_USE[layer.name];
			me.layerMapping[key] = {
				key: key,
				layerId: layer.layerId,
				name: layer.name,
			};
		}
	});

	return this.layerMapping;
};

/**
 * Show map layer.
 */
window.plugin.mapsSelector.showMap = function(key) {
	this.prepareMapping();
	var id = this.layerMapping[key].layerId;
	window.layerChooser.showLayer(id);
};

/**
 * Setup always visible content.
 */
window.plugin.mapsSelector.setupContent = function() {
	var buttons = '';
	/**
	var mapping = this.prepareMapping();
	for (const key in mapping) {
		if (mapping.hasOwnProperty(key)) {
			const layer = mapping[key];
			buttons += `	<a href="#" onclick="plugin.mapsSelector.showMap('${key}'); return false" title="show '${layer.name}'">${layer.key}</a>`;
		}
	}
	/**/
	var mapping = this.MAPS_TO_USE;
	for (const name in mapping) {
		if (mapping.hasOwnProperty(name)) {
			const key = mapping[name];
			buttons += `	<a href="#" onclick="plugin.mapsSelector.showMap('${key}'); return false" title="show '${name}'">${key}</a>`;
		}
	}

	// leaflet (sidebar buttons)
	$('.leaflet-control-container .leaflet-top.leaflet-left').append(''
		+'<div class="leaflet-control-mapsSelector leaflet-bar leaflet-control">'
		+ buttons
		+'</div>'
	);
};

var setup = function() {
	window.plugin.mapsSelector.setupContent();
	window.plugin.mapsSelector.fixTerrainZoom();
};

//PLUGIN END //////////////////////////////////////////////////////////


setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);


