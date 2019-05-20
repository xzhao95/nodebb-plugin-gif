'use strict';

var controllers = require('./lib/controllers');
var meta = require.main.require('./src/meta');
var winston = require.main.require('winston');

var request = require('request');

var plugin = {
	_settings: {
		key: null,
	},
};

plugin.init = function (params, callback) {
	var router = params.router;
	var hostMiddleware = params.middleware;

	router.get('/admin/plugins/tenor-gif', hostMiddleware.admin.buildHeader, controllers.renderAdminPage);
	router.get('/api/admin/plugins/tenor-gif', controllers.renderAdminPage);

	plugin.refreshSettings(callback);
};

plugin.appendConfig = function(config, callback) {
	meta.settings.get('gif', function(err, settings) {
		if (err) {
			return callback(null, config);
		}

		config['gif'] = settings;
		callback(null, config);
	});
};

plugin.addAdminNavigation = function (header, callback) {
	header.plugins.push({
		route: '/plugins/tenor-gif',
		icon: 'fa-tint',
		name: 'GIF',
	});

	callback(null, header);
};

plugin.refreshSettings = function (callback) {
	meta.settings.get('gif', function (err, settings) {
		Object.assign(plugin._settings, settings);

		callback(err);
	});
};

plugin.registerFormatting = function (payload, callback) {
	payload.options.push({ name: 'gif', className: 'fa fa-tenor-gif', title: 'Insert GIF' });
	callback(null, payload);
};

module.exports = plugin;
