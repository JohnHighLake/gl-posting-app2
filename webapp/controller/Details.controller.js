sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel"
],
    function (Controller, History, JSONModel) {
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
                                        new sap.m.Text({ text: "{companyCode}" }),
                                        new sap.m.Text({ text: "{dump}" }),
                                        new sap.m.Text({ text: "{dump}" })
                                    ]
                                })
                            });

                            oPostingTable.setModel(oJSONModel);
                            oPostingTable.bindItems({
                                path: "/",
                                template: new sap.m.ColumnListItem({
                                    cells: [
                                        new sap.m.Text({ text: "{dump}" }),
                                        new sap.m.Text({ text: "{referenceDocumentNumber}" }),
                                        new sap.m.Text({ text: "{journalEntryType}" }),
                                        new sap.m.Text({ text: "{companyCode}" }),
                                        new sap.m.Text({ text: "{journalEntryDate}" }),
                                        new sap.m.Text({ text: "{PostingDate}" }),
                                        new sap.m.Text({ text: "{glaccount}" }),
                                        //new sap.m.Text({ text: "{itemText}" }),
                                        new sap.m.Button({ text: "View", type: "Unstyled", press: "onViewPress"}).addStyleClass("sapUiSmallMarginBegin customButton"),
                                        new sap.m.Text({ text: "{dump}" }),
                                        new sap.m.Text({ text: "{sapError}" }),
                                        new sap.m.Text({ text: "{accountingDocument}" }),
                                        new sap.m.Text({ text: "{fiscalYear}" })
                                    ]
                                })
                            });

                        });
                    }
                });
            }
        });
    });
