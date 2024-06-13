sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
],
    function (Controller, JSONModel, Filter, FilterOperator, Fragment, MessageToast) {
        "use strict";

        return Controller.extend("sda.glpostingapp2.controller.Main", {
            onInit: function () {
                // Initialize the line counter model
                var oViewModel = new JSONModel({
                    lineCounter: "0/0"
                });
                this.getView().setModel(oViewModel, "lineCounterModel");
                //this._updateTotalCount();

                const oMainData = {
                    templateType: "Expense Template",
                    journalEntriesPost : {
                       ID : "",
                       createdBy: "",
                       postingStatus: "",
                       simulationMode: ""
                    }
                };
                const oMainModel = new JSONModel(oMainData);
                this.getView().setModel(oMainModel, "Main");

                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.attachRouteMatched(this._onRouteMatched, this);
            },

            _onRouteMatched: function (oEvent) {
                var sRouteName = oEvent.getParameter("name");
                if (sRouteName === "RouteMain") {
                  this._refreshTable();
                }
            },

            onSearch: function (oEvent) {
                var sQuery = oEvent.getParameter("query");
                var aFilters = [];

                if (sQuery && sQuery.length > 0) {
                    aFilters.push(new Filter({
                        filters: [
                            new Filter("fileName", FilterOperator.Contains, sQuery),
                            new Filter("mode", FilterOperator.Contains, sQuery),
                            new Filter("createdBy", FilterOperator.Contains, sQuery),
                            new Filter("postingStatus", FilterOperator.Contains, sQuery),
                            new Filter("template", FilterOperator.Contains, sQuery)
                        ],
                        and: false
                    }));
                }

                // Get the table binding and apply the filter
                var oTable = this.byId("journalEntriesTable");
                var oBinding = oTable.getBinding("items");
                oBinding.filter(aFilters);
            },

            onDataReceived: function (oEvent) {
                var oBinding = oEvent.getSource();
                var iRetrieved = oBinding.getLength();

                // Only load the data if it hasn't been loaded yet
                if (!this._bTotalCountLoaded) {
                    this._updateTotalCount();
                    this._bTotalCountLoaded = true;
                }

                var oViewModel = this.getView().getModel("lineCounterModel");
                // Update the line counter in the view model
                oViewModel.setProperty("/lineCounter", iRetrieved + "/" + this._iTotalCount);
            },

            _updateTotalCount: function () {
                var that = this;
                var sServiceUrl = "/odata/v4/journal-entries-post/JournalEntriesPost/$count";

                jQuery.ajax({
                    url: sServiceUrl,
                    method: "GET",
                    success: function (iTotalCount) {
                        that._iTotalCount = iTotalCount;
                        var oViewModel = that.getView().getModel("lineCounterModel");
                        var oTable = that.byId("journalEntriesTable");
                        var iRetrieved = oTable.getBinding("items") ? oTable.getBinding("items").getLength() : 0;
                        oViewModel.setProperty("/lineCounter", iRetrieved + "/" + iTotalCount);
                    },
                    error: function (oError) {
                        console.error("Error updating total count", oError);
                    }
                });
            },


            /*  _updateTotalCount: function () {
                 var oModel = this.getView().getModel();
                 var that = this;
                 oModel.bindList("/JournalEntriesPost")..requestCount().then(function (iTotalCount) {
                     that._iTotalCount = iTotalCount;
                     //var oViewModel = that.getView().getModel("lineCounterModel");
                     //var iRetrieved = that.byId("journalEntriesTable").getBinding("items").getLength();
                     //oViewModel.setProperty("/lineCounter", iRetrieved + "/" + iTotalCount);
                 });
             }, */

            onFilterModeLoadItems: function (oEvent) {
                var oComboBox = oEvent.getSource();
                // Only load the data if it hasn't been loaded yet
                if (!this._bModeDataLoaded) {
                    this._loadModeValues();
                    this._bModeDataLoaded = true;
                }
            },

            _loadModeValues: function () {
                var oModel = this.getView().getModel();
                if (!oModel) {
                    console.error("Model not found");
                    return;
                }

                var oModeModel = new JSONModel();
                var that = this;

                var oListBinding = oModel.bindList("/JournalEntriesPost");
                oListBinding.requestContexts().then(function (aContexts) {
                    var aModes = aContexts.map(function (oContext) {
                        return oContext.getObject().Mode;
                    }).filter(function (value, index, self) {
                        return value !== undefined && self.indexOf(value) === index;
                    });

                    oModeModel.setData(aModes.map(function (mode) {
                        return { Mode: mode };
                    }));

                    that.getView().setModel(oModeModel, "modeModel");
                }).catch(function (oError) {
                    console.error("Error loading mode values", oError);
                });
            },

            onFilterChange: function (oEvent) {
                var sSelectedKey = oEvent.getParameter("selectedItem").getKey();
                console.log("Selected filter value", sSelectedKey);
                var aFilters = [];

                if (sSelectedKey && sSelectedKey !== "All") {
                    aFilters.push(new Filter("mode", FilterOperator.EQ, sSelectedKey));
                }

                // Get the table binding and apply the filter
                var oTable = this.byId("journalEntriesTable");
                var oBinding = oTable.getBinding("items");
                oBinding.filter(aFilters);
            },

            onInitiatorFilterLoadItems: function (oEvent) {
                var oComboBox = oEvent.getSource();
                // Only load the data if it hasn't been loaded yet
                if (!this._bInitiatorDataLoaded) {
                    this._loadInitiatoreValues();
                    this._bInitiatorDataLoaded = true;
                }
            },

            _loadInitiatoreValues: function () {
                var oModel = this.getView().getModel();
                if (!oModel) {
                    console.error("Model not found");
                    return;
                }

                var oInitiatorModel = new JSONModel();
                var that = this;

                var oListBinding = oModel.bindList("/JournalEntriesPost");
                oListBinding.requestContexts().then(function (aContexts) {
                    var aInitiators = aContexts.map(function (oContext) {
                        return oContext.getObject().createdBy;
                    }).filter(function (value, index, self) {
                        return value !== undefined && self.indexOf(value) === index;
                    });

                    oInitiatorModel.setData(aInitiators.map(function (createdBy) {
                        return { createdBy: createdBy };
                    }));

                    that.getView().setModel(oInitiatorModel, "initiatorModel");
                }).catch(function (oError) {
                    console.error("Error loading mode values", oError);
                });
            },

            onInitiatorFilterChange: function (oEvent) {
                var sSelectedKey = oEvent.getParameter("selectedItem").getKey();
                console.log("Selected initiator filter value", sSelectedKey);
                var aFilters = [];

                if (sSelectedKey && sSelectedKey !== "All") {
                    aFilters.push(new Filter("createdBy", FilterOperator.EQ, sSelectedKey));
                }

                // Get the table binding and apply the filter
                var oTable = this.byId("journalEntriesTable");
                var oBinding = oTable.getBinding("items");
                oBinding.filter(aFilters);
            },

            onOpenUploadDialog: function () {
                //this.getOwnerComponent().getRouter().navTo("Details");

                if (!this._oUploadDialog) {
                    Fragment.load({
                        id: this.getView().getId(),
                        name: "sda.glpostingapp2.view.UploadDialog",
                        controller: this
                    }).then(function (oDialog) {
                        this._oUploadDialog = oDialog;
                        this.getView().addDependent(this._oUploadDialog);
                        this._oUploadDialog.open();
                    }.bind(this));
                } else {
                    this._oUploadDialog.open();
                }
            },

            onUploadPress: function () {
                var oFileUploader = this.byId("fileUploader");
                var oFile = oFileUploader.oFileUpload.files[0];
    
                if (!oFile) {
                    MessageToast.show("Please choose a file first.");
                    return;
                }
    
                var createdByUser = this.byId("createdByUser").getValue();
                var templateType = this.getView().getModel("Main").getProperty("/templateType");
                // Retrieve other parameters as needed
    
                var oFormData = new FormData();
                oFormData.append("excelFile", oFile);
                oFormData.append("createdByUser", createdByUser);
                oFormData.append("template", templateType);
                oFormData.append("mode", "online");
                // Append other parameters to FormData
    
                $.ajax({
                    url: "https://journalentry-api-nice-jackal-tb.cfapps.us10.hana.ondemand.com/v1/journalentry/upload",
                    //url: "https://journalentry-api-nice-jackal-tb.cfapps.us10.hana.ondemand.com/v1/sap/journalentry/post",
                    type: "POST",
                    data: oFormData,
                    processData: false,
                    contentType: false,
                    success: function (response) {
                        MessageToast.show("File uploaded successfully.");
                        this._oUploadDialog.close();
                        this._refreshTable();
                    }.bind(this),
                    error: function (error) {
                        MessageToast.show("File upload failed.");
                    }
                });
            },

            _refreshTable: function () {
                // Assuming the table is bound to an OData model
                var oTable = this.byId("journalEntriesTable");
                var oBinding = oTable.getBinding("items");
                oBinding.refresh();
            },

            onClosePress: function () {
                this._oUploadDialog.close();
            },

            onRowPress: function (oEvent) {
                /* var oItem = oEvent.getSource();
                var oBindingContext = oItem.getBindingContext();
                var sPath = oBindingContext.getPath();
                var sIndex = sPath.split("/").pop(); // Get the index from the binding path
                console.log("Selected index: ", sIndex);
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Details", {
                    index: sIndex
                });  */

               var oItem = oEvent.getSource();
               console.log("Selected ID in Main view: ", oItem.getBindingContext().getProperty("ID"));
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Details", {
                    journalEntriesPostId: oItem.getBindingContext().getProperty("ID")
                }); 
            },

            onSelectChange: function (oEvent) {
                // Get the selected item
                var oSelectedItem = oEvent.getParameter("selectedItem");
    
                // Get the key of the selected item
                var sSelectedKey = oSelectedItem.getKey();

                this.getView().getModel("Main").setProperty("/templateType", sSelectedKey);
    
                // Log the selected key
                console.log("Selected key:", sSelectedKey);
    
                // Perform any additional logic based on the selected key
                // For example, updating a model property or triggering another action
            }
        });
    });
