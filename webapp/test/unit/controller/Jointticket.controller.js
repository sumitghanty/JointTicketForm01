/*global QUnit*/

sap.ui.define([
	"combglapp/jointticketform/controller/Jointticket.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Jointticket Controller");

	QUnit.test("I should test the Jointticket controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
