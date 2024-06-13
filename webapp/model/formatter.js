sap.ui.define([], () => {
	"use strict";

	return {
		formatStatusText: function (sapError) {
            //var appMode = this.getOwnerComponent().getModel("app").getProperty("/CurrentStatus/mode");
            //console.log("Current Mode: " + appMode);
            
            /*
            if (appMode !== "InProgress") {
                return sapError ? "Error" : "Success";
            }
            */

            var oPostingStatus = this.getView().getModel("Details").getProperty("/journalEntriesPost/postingStatus");
            var oSimulationMode = this.getView().getModel("Details").getProperty("/journalEntriesPost/simulationMode");
            //console.log("Current Posting Status: " + oPostingStatus);

            if (oSimulationMode !== null) {
                if ((oSimulationMode === true && oPostingStatus === "Error") || (oSimulationMode === false && oPostingStatus === "Completed")) {
                    return sapError ? "Error" : "Success";
                }
            }

            //return sapError ? "Error" : "Success";
        },
        
        formatStatusColor: function (sapError) {
            return sapError ? "redText" : "greenText";
        }
	};
});