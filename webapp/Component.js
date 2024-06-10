/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sda/glpostingapp2/model/models",
    "sap/ui/model/odata/v4/ODataModel"
],
    function (UIComponent, Device, models, ODataModel) {
        "use strict";

        return UIComponent.extend("sda.glpostingapp2.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                /* // Create and set the OData V4 model
                var oModel = new ODataModel({
                    serviceUrl: "/odata/v4/journal-entries-post/"
                });
                this.setModel(oModel); */

/*                 // Create and set the OData V4 model
                var oModel = new ODataModel({
                    serviceUrl: "/odata/v4/journal-entries-post/",
                    synchronizationMode: "None",
                    operationMode: "Server"
                });
                this.setModel(oModel); */

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
            }
        });
    }
);