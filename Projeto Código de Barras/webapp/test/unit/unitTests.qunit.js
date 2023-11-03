/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"z549/buscaproduto/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});