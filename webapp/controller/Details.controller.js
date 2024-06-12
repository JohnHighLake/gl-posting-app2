sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
],
    function (Controller, History, JSONModel, Fragment, MessageToast) {
        "use strict";

        return Controller.extend("sda.glpostingapp2.controller.Details", {
            onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("Details").attachPatternMatched(this._onObjectMatched, this);
            },

            onNavBack: function () {
                var oHistory, sPreviousHash;

                oHistory = History.getInstance();
                sPreviousHash = oHistory.getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    this.getOwnerComponent().getRouter().navTo("RouteMain", {}, true /*no history*/);
                }
            },


            /*  _onObjectMatched: function (oEvent) {
                 var sObjectId = oEvent.getParameter("arguments").index;
                 console.log("The passed in ID in Details View: ", sObjectId);
                 var oModel = this.getView().getModel();
                 var that = this;
             } */

            _onObjectMatched: function (oEvent) {
                var sObjId = oEvent.getParameter("arguments").journalEntriesPostId;
                console.log("Received JournalEntriesPost ID: ", sObjId);
                //var oTable = this.byId("journalEntriesTable");
                //oTable.bindElement("/JournalEntriesPost(" + sObjId + ")");
                this._fetchAndBindData(sObjId);
            },

            onViewSAPMessage: function (oEvent) {
                var oButton = oEvent.getSource();
                var oBindingContext = oButton.getBindingContext();
                var sapMessage = oBindingContext.getProperty("sapError");
    
                if (!this._oSAPMessagePopup) {
                    Fragment.load({
                        id: this.getView().getId(),
                        name: "sda.glpostingapp2.view.SAPMessagePopup",
                        controller: this
                    }).then(function (oDialog) {
                        this._oSAPMessagePopup = oDialog;
                        this.getView().addDependent(this._oSAPMessagePopup);
                        this._oSAPMessagePopup.open();
                        this.byId("sapMessage").setText(sapMessage);
                    }.bind(this));
                } else {
                    this._oSAPMessagePopup.open();
                    this.byId("sapMessage").setText(sapMessage);
                }
            },

            _fetchAndBindData: function (sJournalEntryId) {
                var oModel = this.getOwnerComponent().getModel();
                var oInputTable = this.byId("inputFileInfoTable");
                var oPostingTable = this.byId("sapPostingTable");
                var oJSONModel = new JSONModel();
                var that = this;

                // Bind the context for the JournalEntriesPost
                var oContextBinding = oModel.bindContext("/JournalEntriesPost(" + sJournalEntryId + ")");

                // Once the context is available, fetch JournalEntries and JournalEntryItems
                oContextBinding.requestObject().then(function (oContextData) {
                    if (oContextData) {
                        oModel.bindList("/JournalEntriesPost(" + sJournalEntryId + ")/JournalEntries", null, null, null, {
                            "$expand": "JournalEntryItems"
                        }).requestContexts().then(function (aJournalEntryContexts) {
                            var aFlattenedData = [];

                            aJournalEntryContexts.forEach(function (oJournalEntryContext) {
                                var oJournalEntry = oJournalEntryContext.getObject();
                                oJournalEntry.JournalEntryItems.forEach(function (oItem) {
                                    aFlattenedData.push({
                                        ID: oJournalEntry.ID,
                                        companyCode: oJournalEntry.companyCode,
                                        journalEntryType: oJournalEntry.journalEntryType,
                                        businessTransactionType: oJournalEntry.businessTransactionType,
                                        originalReferenceDocumentType: oJournalEntry.originalReferenceDocumentType,
                                        journalEntryDate: oJournalEntry.journalEntryDate,
                                        PostingDate: oJournalEntry.PostingDate,
                                        documentHeaderText: oJournalEntry.documentHeaderText,
                                        transactionCurrency: oJournalEntry.transactionCurrency,
                                        referenceDocumentNumber: oJournalEntry.referenceDocumentNumber,
                                        accountingDocument: oJournalEntry.accountingDocument,
                                        fiscalYear: oJournalEntry.fiscalYear,
                                        sapError: oJournalEntry.sapError,
                                        itemID: oItem.ID,
                                        glaccount: oItem.glaccount,
                                        itemText: oItem.itemText,
                                        debit: oItem.debit,
                                        credit: oItem.credit,
                                        costCenter: oItem.costCenter
                                    });
                                });
                            });

                            oJSONModel.setData(aFlattenedData);
                            oInputTable.setModel(oJSONModel);
                            oInputTable.bindItems({
                                path: "/",
                                template: new sap.m.ColumnListItem({
                                    cells: [
                                        new sap.m.Text({ text: "{journalEntryType}" }),
                                        new sap.m.Text({ text: "{journalEntryDate}" }),
                                        new sap.m.Text({ text: "{PostingDate}" }),
                                        new sap.m.Text({ text: "{documentHeaderText}" }),
                                        new sap.m.Text({ text: "{companyCode}" })
                                    ]
                                })
                            });

                            oPostingTable.setModel(oJSONModel);
                            oPostingTable.bindItems({
                                path: "/",
                                template: new sap.m.ColumnListItem({
                                    cells: [
                                        //new sap.m.Text({ text: "{dump}" }),
                                        new sap.m.Text({ 
                                            text: { 
                                                parts: ["sapError"], 
                                                formatter: function (sapError) {
                                                    return sapError ? "Error" : "Success";
                                                }
                                            },
                                            customData: [
                                                new sap.ui.core.CustomData({
                                                    key: "sapError",
                                                    value: "{sapError}"
                                                })
                                            ]
                                        }).addStyleClass("{= ${sapError} ? 'errorText' : 'successText'}"),
                                        
                                        new sap.m.Text({ text: "{referenceDocumentNumber}" }),
                                        new sap.m.Text({ text: "{journalEntryType}" }),
                                        new sap.m.Text({ text: "{companyCode}" }),
                                        new sap.m.Text({ text: "{journalEntryDate}" }),
                                        new sap.m.Text({ text: "{PostingDate}" }),
                                        new sap.m.Text({ text: "{glaccount}" }),
                                        new sap.m.Text({ text: "{itemText}" }),
                                        
                                        //new sap.m.Text({ text: "{sapError}" }),
                                        new sap.m.Button({ text: "View", type: "Unstyled", press:that.onViewSAPMessage.bind(that)}).addStyleClass("sapUiSmallMarginBegin customButton"),

                                        new sap.m.Text({ text: "{accountingDocument}" }),
                                        new sap.m.Text({ text: "{fiscalYear}" })
                                    ]
                                })
                            });

                        });
                    }
                });
            },

            onCloseSAPMessagePopup: function () {
                this._oSAPMessagePopup.close();
            },

            onSimulatePress: function (oEvent) {
                var sBaseUrl = "https://journalentry-api-nice-jackal-tb.cfapps.us10.hana.ondemand.com/v1/sap/journalentry/simulate";
                var sOrderId = "45d561d5-72a7-4d04-8a14-439ec34b8288";
                var sUrl = sBaseUrl + "/" + sOrderId;

                var oFormData = new FormData();
                oFormData.append("updatedByUser", "John");

                $.ajax({
                    url: sUrl,
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

                /*
                var oPayload = {
                    updatedByUser: "John"
                };
                
                $.ajax({
                    url: sUrl,
                    type: "POST",
                    data: JSON.stringify(oPayload),
                    processData: false,
                    contentType: false,
                    success: function (response) {
                        MessageToast.show("API call successful: " + data);
                        //this._oUploadDialog.close();
                        //this._refreshTable();
                    }.bind(this),
                    error: function (error) {
                        MessageToast.show("API call failed: " + error);
                    }
                });
                */
                /*
                $.ajax({
                    url: sUrl,
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(oPayload),
                    success: function (data) {
                        MessageToast.show("API call successful: " + data);
                        console.log(data); // Handle the response data as needed
                    },
                    error: function (error) {
                        MessageToast.show("API call failed: " + error);
                        console.error(error); // Handle the error as needed
                    }
                });
                */
            },

            onPostPress: function () {
                /*
                var oFileUploader = this.byId("fileUploader");
                var oFile = oFileUploader.oFileUpload.files[0];
    
                if (!oFile) {
                    MessageToast.show("Please choose a file first.");
                    return;
                }
    
                var createdByUser = this.byId("createdByUser").getValue();
                // Retrieve other parameters as needed
    
                var oFormData = new FormData();
                oFormData.append("excelFile", oFile);
                oFormData.append("createdByUser", createdByUser);
                oFormData.append("template", "expense");
                oFormData.append("mode", "online");
                // Append other parameters to FormData
    
                $.ajax({
                    url: "https://journalentry-api-nice-jackal-tb.cfapps.us10.hana.ondemand.com/v1/journalentry/upload",
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
                */
            }
        });
    });
