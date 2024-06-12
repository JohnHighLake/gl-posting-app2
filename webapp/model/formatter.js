sap.ui.define([], () => {
	"use strict";

	return {
		formatStatusText: function (sapError) {
            return sapError ? "Error" : "Success";
        },
        
        formatStatusColor: function (sapError) {
            return sapError ? "redText" : "greenText";
        }
	};
});