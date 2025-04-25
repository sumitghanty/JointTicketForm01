sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    'sap/m/Label',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/comp/smartvariants/PersonalizableInfo',
    'sap/m/MessageBox',
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
    "sap/m/MessageToast",
    "com/bgl/app/jointticketform/model/models",
    "sap/m/PDFViewer",
    "sap/m/Dialog",
    "sap/m/BusyIndicator",
    "sap/m/VBox",
    "sap/m/Text"
], (Controller, JSONModel, Label, Filter, FilterOperator, PersonalizableInfo, MessageBox, exportLibrary, Spreadsheet, MessageToast, CustModels, PDFViewer, Dialog, BusyIndicator, VBox, Text) => {
    "use strict";
    const EdmType = exportLibrary.EdmType;
    return Controller.extend("com.bgl.app.jointticketform.controller.Jointticket", {
        _pdfViewer: null,
        onInit() {
            //var sPath = jQuery.sap.getModulePath("com.bgl.app.jointticketform", "../model/model.json");
            //this.oModel.loadData(sap.ui.require.toUrl("model.json"), null, false);
            //this.oModel = new JSONModel(sPath);

            this._busyDialog = new Dialog({
                showHeader: false,
                content: new VBox({
                    justifyContent: "Center",
                    alignItems: "Center",
                    items: [
                        new BusyIndicator({ size: "2rem" }), // Spinner
                        new Text({ text: "Generating PDFs, please wait...", textAlign: "Center" }).addStyleClass("sapUiSmallMarginTop") // Centered Text
                    ]
                }),
                contentWidth: "200px",
                contentHeight: "100px",
                verticalScrolling: false,
                horizontalScrolling: false
            });

            //this.getView().setModel(this.oModel);
            this.oModel = new JSONModel();
            var oNewModel = this.getOwnerComponent().getModel("ZSB_JOINT_METER_READING");
            this._pdfViewer = new sap.m.PDFViewer({
                showDownloadButton: true
            });
            this.getView().addDependent(this._pdfViewer);

            sap.ui.getCore().setModel(this.oModel, "UIDataModel");
            sap.ui.getCore().getModel("UIDataModel").setProperty("/Visible", true);
            sap.ui.getCore().getModel("UIDataModel").setProperty("/Invisible", false);
            //this.applyData = this.applyData.bind(this);
            //this.fetchData = this.fetchData.bind(this);
            //this.getFiltersWithValues = this.getFiltersWithValues.bind(this);

            this.oSmartVariantManagement = this.getView().byId("svm");
            this.oExpandedLabel = this.getView().byId("expandedLabel");
            this.oSnappedLabel = this.getView().byId("snappedLabel");
            this.oFilterBar = this.getView().byId("filterbar");
            this.oTable = this.getView().byId("table");

            this.oFilterBar.registerFetchData(this.fetchData);
            this.oFilterBar.registerApplyData(this.applyData);
            this.oFilterBar.registerGetFiltersWithValues(this.getFiltersWithValues);

            var oPersInfo = new PersonalizableInfo({
                type: "filterBar",
                keyName: "persistencyKey",
                dataSource: "",
                control: this.oFilterBar
            });
            this.oSmartVariantManagement.addPersonalizableControl(oPersInfo);
            this.oSmartVariantManagement.initialise(function () { }, this.oFilterBar);

        },
        onDialogEquipmentNumber: function () {
            new CustModels();
        },

        onExit: function () {
            this.oModel = null;
            this.oSmartVariantManagement = null;
            this.oExpandedLabel = null;
            this.oSnappedLabel = null;
            this.oFilterBar = null;
            this.oTable = null;
        },
        onPressText: function () {
            this.oTable.removeSelections(true);
            var oModel = sap.ui.getCore().getModel("UIDataModel");
            oModel.setProperty('/Visible', !oModel.getProperty('/Visible'));
            oModel.setProperty('/Invisible', !oModel.getProperty('/Invisible'));
        },
        getDateFormatString: function (fullDate) {
            var oDate = fullDate.getDate();
            if (oDate < 10) {
                oDate = "0" + oDate.toString();
            }
            var oMonth = fullDate.getMonth() + 1;
            if (oMonth < 10) {
                oMonth = "0" + oMonth.toString();
            }
            var oYear = fullDate.getFullYear();

            var oDateStr = oYear + "-" + oMonth + "-" + oDate;
            return oDateStr;

        },
        onExport: function () {

            const oTable = this.oTable;
            const oBinding = oTable.getBinding("items");
            const aCols = this.createColumnConfig();
            const oSettings = {
                workbook: { columns: aCols },
                dataSource: oBinding
            };
            const oSheet = new Spreadsheet(oSettings);

            oSheet.build()
                .then(function () {
                    MessageToast.show("Spreadsheet export has finished");
                }).finally(function () {
                    oSheet.destroy();
                });
        },
        createColumnConfig: function () {
            return [
                {
                    label: "Meter Serial Number",
                    property: "MeterSerialNumber",
                    type: EdmType.Number,
                    scale: 0
                },
                {
                    label: "Measuring Point Category",
                    property: "MeasuringPointCategory",
                    type: EdmType.String
                },
                {
                    label: "Measuring Point Category Description",
                    property: "MeasuringPointCategoryDesc",
                    type: EdmType.String
                },
                {
                    label: "Functional Location Description",
                    property: "FunctionalLocDesc",
                    type: EdmType.String
                },
                {
                    label: "Equipment Description",
                    property: "EquipmentName",
                    type: EdmType.String
                },
                {
                    label: "Customer Code (Desc of Measuring Point)",
                    property: "MeasuringPointDescription",
                    type: EdmType.String
                },
                {
                    label: "Meter Correction Factor",
                    property: "meter_corr_factor",
                    type: EdmType.String
                },
                {
                    label: "Characterestic Unit (UOM)",
                    property: "CharcValueUnit",
                    type: EdmType.String
                },
                {
                    label: "Opening Date Reading",
                    property: "OpenDateRead",
                    type: EdmType.String
                },
                {
                    label: "Closing Date Reading",
                    property: "ClosedateRead",
                    type: EdmType.String
                },
                {
                    label: "Difference",
                    property: "Difference",
                    type: EdmType.String
                },
                {
                    label: "Actual Billable Quantity",
                    property: "ActualBillQty",
                    type: EdmType.String
                },
                {
                    label: "Profit Center (Annual Estimates)",
                    property: "ProfitCenter",
                    type: EdmType.String
                },
                {
                    label: "Equipment Number",
                    property: "Equipment",
                    type: EdmType.String
                },
                {
                    label: "Functional Location",
                    property: "FunctionalLocation",
                    type: EdmType.String
                },
                {
                    label: "Measuing Point",
                    property: "MeasuringPoint",
                    type: EdmType.String
                }];
        },
        onSearch: function () {
            var that = this;
            var aTableFilters = this.oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
                var oControl = oFilterGroupItem.getControl();
                if (oControl instanceof sap.m.DatePicker) {
                    var aSelectedKeys = oControl.getDateValue();
                    if (aSelectedKeys != null) {
                        var oDateStr = that.getDateFormatString(aSelectedKeys);
                        aResult.push(oDateStr);
                    } else {
                        // var arrayOfStrings = oControl.getId().split('-');
                        // var oMessage = "";
                        // var str = ["fromDate", "toDate"];
                        // var found = arrayOfStrings.find(v => str.includes(v));
                        // if (found == "fromDate") {
                        //     oMessage = "Please Fill in the compulsory From-Date Fields";
                        // } else if (found == "toDate") {
                        //     oMessage = "Please Fill in the compulsory To-Date Fields";
                        // }
                        // else {
                        //     oMessage = "Please Fill in the compulsory Fields";
                        // }

                        // MessageBox.error(oMessage);

                        // return;
                    }

                }
                //aSelectedKeys = oControl.getSelectedKeys(),
                /*aFilters = aSelectedKeys.map(function (sSelectedKey) {
                    return new Filter({
                        path: oFilterGroupItem.getName(),
                        operator: FilterOperator.Contains,
                        value1: sSelectedKey
                    });
                });
                
            if (oDate.length > 0) {
                aResult.push(new Filter({
                    filters: aFilters,
                    and: false
                }));
            }
*/
                return aResult;
            }, []);
            var oUrl = "/ZC_METER_READING_REPORT(pa_data_from=" + aTableFilters[0] + ",pa_data_to=" + aTableFilters[1] + ")/Set"

            // var oTableJsonModel = this.getDataFromBackend(oUrl);


            // For extract From and To Date
            this.fromDate = aTableFilters[0];
            this.toDate = aTableFilters[1];
            // End

            var oGlobalModel = this.getOwnerComponent().getModel("globalModel");
            oGlobalModel.setProperty("/fromDate", this.fromDate);
            oGlobalModel.setProperty("/toDate", this.toDate);

            this.getDataFromBackend2();


            /*this.oTable.bindItems({
                path: oUrl,
                template: that.oTable.getBindingInfo("items").template
            });*/
            //this.oTable.getBinding("items").filter(aTableFilters);
            //this.oTable.setShowOverlay(false);
        },
        _validateInputFields: function () {

            var inputFuncLoct = this.byId("idFunctionalLocationInput");
            var inputfromDate = this.byId("fromDate");
            var inputtoDate = this.byId("toDate");

            var inputFuncLoctValue = inputFuncLoct.getValue();

            var isValid = true;
            var message = '';

            if (!inputfromDate.getValue()) {
                inputfromDate.setValueState(sap.ui.core.ValueState.Error);
                isValid = false;
                message += 'From Date , ';
            } else {
                inputfromDate.setValueState(sap.ui.core.ValueState.None);
            }
            if (!inputtoDate.getValue()) {
                inputtoDate.setValueState(sap.ui.core.ValueState.Error);
                isValid = false;
                message += 'To Date , ';
            } else {
                inputtoDate.setValueState(sap.ui.core.ValueState.None);
            }
            if (!inputFuncLoct.getValue()) {
                inputFuncLoct.setValueState(sap.ui.core.ValueState.Error);
                isValid = false;
                message += 'Functional Location , ';
            } else {
                inputFuncLoct.setValueState(sap.ui.core.ValueState.None);
            }

            if (!isValid) {
                // Remove the last comma and space from the message
                // message = message.slice(0, -2);
                // sap.m.MessageBox.error("Please fill up the following fields: " + message);
                return false;
            }

            return true;
        },
        onDateChange: function () {
            var oFromDate = this.getView().byId("fromDate");
            var oToDate = this.getView().byId("toDate");

            var sFromDate = oFromDate.getDateValue();
            var sToDate = oToDate.getDateValue();

            if (sFromDate && sToDate) {
                if (sToDate < sFromDate) {
                    sap.m.MessageBox.error("To Date cannot be earlier than From Date.");
                    oToDate.setValue("");
                }
            }
        },
        hasData: function (value) {
            if (!value) return false;
            if (typeof value === "string" || Array.isArray(value)) {
                return value.length > 0;
            }
            if (typeof value === "object") {
                return Object.keys(value).length > 0;
            }
            return false;
        },
        getDataFromBackend2: function () {
            if (!this._validateInputFields()) {
                // Validation failed, return without fetching data
                return;
            }
            var that = this;
            var oGlobalModelData = this.getOwnerComponent().getModel("globalModel").getData();
            var oNewModel = this.getOwnerComponent().getModel("ZSB_JOINT_METER_READING");

            // Ensure Functional Locations exist
            var aFunctionalLocationIDArray = oGlobalModelData.selectedFunctionalLocationsID || [];

            // Convert Array to OData filter format
            // var sFilterQuery = "";
            // if (aFunctionalLocationIDArray.length > 0) {
            //     sFilterQuery = aFunctionalLocationIDArray
            //         .map(function (sLoc) {
            //             return "FunctionalLocation eq '" + sLoc + "'";
            //         })
            //         .join(" or "); // Join conditions with 'or'
            // }

            // var pUrl = "/ZC_JOINT_METER_READING(pa_date_from=datetime'" + oGlobalModelData.fromDate + "T00:00:00',pa_date_to=datetime'" + oGlobalModelData.toDate + "T23:59:59')/Set";

            // sap.ui.core.BusyIndicator.show();
            // oNewModel.read(pUrl, {
            //     // urlParameters: {
            //     //     // "sap-client": "100",
            //     //     "$filter": sFilterQuery
            //     // },
            //     filters: aFilters,
            //     success: function (response) {
            //         var oData = response.results;
            //         console.log(oData);

            //         // Set Table Data
            //         var oTableDataModel = that.getView().getModel("TableDataModel");
            //         oTableDataModel.setData(oData);

            //         // Set Data For Pdf Button Function
            //         var oPdfDataModel = that.getView().getModel("PdfDataModel");
            //         oPdfDataModel.setData(oData);

            //         sap.ui.core.BusyIndicator.hide();
            //     },
            //     error: function (error) {
            //         sap.ui.core.BusyIndicator.hide();
            //         console.log(error);

            //         var errorObject = JSON.parse(error.responseText);
            //         sap.m.MessageBox.warning(errorObject.error.message.value);

            //     }
            // });

            var maxBatchSize = 100; // Adjust this based on backend limit
            var aFilteredBatches = [];
            var aAllFetchedData = []; // Array to store all results
            var iCompletedRequests = 0; // Track completed requests
            var iTotalRequests = Math.ceil(aFunctionalLocationIDArray.length / maxBatchSize); // Total batches

            for (let i = 0; i < aFunctionalLocationIDArray.length; i += maxBatchSize) {
                aFilteredBatches.push(aFunctionalLocationIDArray.slice(i, i + maxBatchSize));
            }

            sap.ui.core.BusyIndicator.show();

            aFilteredBatches.forEach(batch => {
                let aFuncLocFilters = batch.map(loc =>
                    new sap.ui.model.Filter("FunctionalLocation", sap.ui.model.FilterOperator.EQ, loc)
                );

                let pUrl = "/ZC_JOINT_METER_READING(pa_date_from=datetime'" + oGlobalModelData.fromDate + "T00:00:00',pa_date_to=datetime'" + oGlobalModelData.toDate + "T23:59:59')/Set";

                oNewModel.read(pUrl, {
                    filters: [new sap.ui.model.Filter({ filters: aFuncLocFilters, and: false })],
                    success: function (response) {
                        aAllFetchedData = aAllFetchedData.concat(response.results); // Merge data

                        iCompletedRequests++; // Increment completed requests count

                        console.log("Data: ", aAllFetchedData)
                        if (iCompletedRequests === iTotalRequests) { // Check if all requests are done

                            aAllFetchedData.sort((a, b) => a.FunctionalLocation.localeCompare(b.FunctionalLocation));

                            var oTableDataModel = that.getView().getModel("TableDataModel");
                            oTableDataModel.setData(aAllFetchedData);
                            oTableDataModel.refresh(true);

                            var oPdfDataModel = that.getView().getModel("PdfDataModel");
                            oPdfDataModel.setData(aAllFetchedData);
                            oPdfDataModel.refresh(true);

                            sap.ui.core.BusyIndicator.hide();
                        }
                    },
                    error: function (error) {
                        sap.ui.core.BusyIndicator.hide();
                        console.log(error);

                        var errorObject = JSON.parse(error.responseText);
                        sap.m.MessageBox.warning(errorObject.error.message.value);
                    }
                });
            });

        },
        getDataFromBackend: function (oUrl) {
            // var oModel2 = this.getOwnerComponent().getModel();
            var oNewModel = this.getOwnerComponent().getModel("ZSB_JOINT_METER_READING");  // For EntitySet Name="ZC_JOINT_METER_READINGSet"
            let aFilters = [
                //new sap.ui.model.Filter("EquipmentName", sap.ui.model.FilterOperator.EQ, "Valve - 4"),
                //new sap.ui.model.Filter("password", sap.ui.model.FilterOperator.EQ, password)
            ];
            // let oBinding = oModel2.bindList(oUrl);
            let oBinding = oNewModel.bindList(oUrl);   // For EntitySet Name="ZC_JOINT_METER_READINGSet"
            oBinding.filter(aFilters);
            var that = this;


            oBinding.requestContexts(0, 100).then((aContexts) => {
                if (aContexts.length > 0) {
                    //that.oTable;
                    //that.oTable.setBindingContext(aContexts);
                    var oTabelData = [];
                    aContexts.forEach((oContext) => {
                        oTabelData.push(oContext.getObject());
                    });
                    // Navigate to the next view if credentials are valid
                    //sessionStorage.setItem("loggedIn", "true");
                    /*var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("Routelist_view_01", {
                        name: username,
                        pass: password
                    });*/
                    var oReturnModel = new JSONModel();
                    oReturnModel.setData(oTabelData);
                    that.oTable.setModel(oReturnModel, "dataModelTable");
                    // Set Data For Pdf Button Function
                    var oPdfDataModel = this.getView().getModel("PdfDataModel");
                    oPdfDataModel.setData(oTabelData);
                    // End
                    return oReturnModel;

                } else {
                    MessageBox.error("No Data fetch. Empty Dataset");
                }
            }).catch((err) => {
                //console.error("Error fetching data: ", err);
                MessageBox.error("An error occurred while fetching data. Please try again.");
            });
        },
        onPressPDFButton: function () {
            // if (!this._validateInputFields()) {
            //     // Validation failed, return without fetching data
            //     return;
            // }
            var oPdfDataModel = this.getView().getModel("PdfDataModel");
            var pdfData = oPdfDataModel.getData();
            var groupedData = this.groupByFunctionalLocation(pdfData);
            this._loadPdfMakeLibrary(groupedData);
        },
        groupByFunctionalLocation: function (data) {
            return data.reduce((acc, item) => {
                const key = item.FunctionalLocation || "No Functional Location";
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(item);
                return acc;
            }, {});
        },
        _loadPdfMakeLibrary: function (data) {

            var sPath = jQuery.sap.getModulePath("com.bgl.app.jointticketform", "/libs/pdfmake/pdfmake.min.js");
            var vfsPath = jQuery.sap.getModulePath("com.bgl.app.jointticketform", "/libs/pdfmake/vfs_fonts.js");
            var that = this;

            // this.generatedPdfUrls = [];
            this.generatedPdfDocs = [];

            jQuery.sap.includeScript(sPath, "pdfMakeScript", function () {
                console.log("pdfMake loaded successfully.");

                jQuery.sap.includeScript(vfsPath, "vfsFontsScript", function () {
                    console.log("vfs_fonts loaded successfully.");

                    if (typeof pdfMake !== "undefined") {

                        // Object.keys(data).forEach(functionalLocation => {
                        //     that.generatePdf(functionalLocation, data[functionalLocation]);
                        // });

                        // Ask user if they want all PDFs or select one
                        sap.m.MessageBox.confirm("Do you want to generate PDFs for all Functional Locations?", {
                            actions: ["Yes", sap.m.MessageBox.Action.CANCEL],
                            emphasizedAction: "Yes)",
                            onClose: function (sAction) {
                                if (sAction === "Yes") {
                                    // Generate PDFs for all Functional Locations
                                    // Object.keys(data).forEach(functionalLocation => {
                                    //     that.generatePdf(functionalLocation, data[functionalLocation]);
                                    // });


                                    // else if (sAction === "No (Select)") {
                                    //     // Show a selection dialog
                                    //     that.showSelectionDialog(data);
                                    // }
                                    sap.ui.core.BusyIndicator.show(0);
                                    that._busyDialog.open();
                                    var locations = Object.keys(data);
                                    var count = 0;

                                    // Generate PDFs for all locations
                                    // locations.forEach((functionalLocation) => {
                                    //     that.generatePdf(functionalLocation, data[functionalLocation], function () {
                                    //         count++;
                                    //         // When all PDFs are generated, open them in tabs
                                    //         if (count === locations.length) {
                                    //             that.generatedPdfUrls.forEach((url) => {

                                    //                 // var newWindow = window.open(url, "_blank");

                                    //                 var newWindow = window.open("", "_blank");
                                    //                 newWindow.document.write(`
                                    //                     <html>
                                    //                         <head>
                                    //                             <title>${url.pdfTitle}</title>
                                    //                         </head>
                                    //                         <body style="margin:0;">
                                    //                             <iframe src="${url.pdfUrl}" width="100%" height="100%" style="border:none;"></iframe>
                                    //                         </body>
                                    //                     </html>
                                    //                 `);

                                    //                 if (!newWindow) {
                                    //                     sap.m.MessageToast.show("Popup blocked! Please allow popups.");
                                    //                 }
                                    //             });
                                    //         }
                                    //     });
                                    // });

                                    Promise.all(locations.map(functionalLocation =>
                                        that.generatePdf(functionalLocation, data[functionalLocation])
                                    )).then((pdfDocs) => {
                                        that.generatedPdfDocs = pdfDocs;
                                        that.mergeAndPreviewPdfs();
                                    }).finally(() => {
                                        sap.ui.core.BusyIndicator.hide(); // Hide Busy Indicator after merging
                                    });
                                }
                            }

                        });

                    } else {
                        console.error("pdfMake is not defined even after script loading.");
                    }
                }, function () {
                    console.error("Error loading vfs_fonts.");
                });

            }, function () {
                console.error("Error loading pdfMake.");
            });

        },
        showSelectionDialog: function (data) {
            var aFunctionalLocations = Object.keys(data);
            var that = this;
            var oDialog = new sap.m.Dialog({
                title: "Select Functional Location",
                content: new sap.m.List({
                    items: aFunctionalLocations.map(location => new sap.m.StandardListItem({
                        title: location,
                        type: "Active",
                        press: function () {
                            oDialog.close();
                            that.generatePdf(location, data[location]);
                        }
                    }))
                }),
                beginButton: new sap.m.Button({
                    text: "Close",
                    press: function () {
                        oDialog.close();
                    }
                })
            });

            oDialog.open();
        },
        convertImgToBase64: function (url, callback) {
            var img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = function () {
                var canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                var dataURL = canvas.toDataURL('image/png');
                callback(dataURL);
            };
            img.onerror = function () {
                console.error("Failed to load image:", url);
            };
            img.src = url;
        },
        calculateData: function (data) {
            let totalGasConsumption = 0;
            let locationDescription;
            data.forEach(item => {
                totalGasConsumption += parseFloat((item.ClosedateRead - item.OpenDateRead) * item.meter_corr_factor);
                locationDescription = item.FunctionalLocDesc;
            })

            let dispensedQuantity = totalGasConsumption.toFixed(2);
            let quantitySold = (totalGasConsumption - 100).toFixed(2);

            return { dispensedQuantity, quantitySold, locationDescription, totalGasConsumption };
        },
        setAllDataProperty: function (aData) {
            var oGlobalModel = this.getOwnerComponent().getModel("globalModel");
            oGlobalModel.setProperty("/VAT_TIN", aData.VAT_TIN);
            oGlobalModel.setProperty("/GSTINNo", aData.GSTINNo);
            oGlobalModel.setProperty("/Location", aData.Location);
            oGlobalModel.setProperty("/StreetName", aData.StreetName);
            oGlobalModel.setProperty("/CityName", aData.CityName);
            oGlobalModel.setProperty("/PostalCode", aData.PostalCode);
            oGlobalModel.setProperty("/TelephoneNumber1", aData.TelephoneNumber1);
            oGlobalModel.setProperty("/Dispenser1", aData.Dispenser1);
            oGlobalModel.setProperty("/Dispenser2", aData.Dispenser2);
            oGlobalModel.setProperty("/Dispenser3", aData.Dispenser3);
            oGlobalModel.setProperty("/Dispenser4", aData.Dispenser4);
            oGlobalModel.setProperty("/ECCNo", aData.ECCNo);
            oGlobalModel.setProperty("/ResponsiblePersonName", aData.ResponsiblePersonName);
        },
        formatDate: function (dateStr) {
            var date = new Date(dateStr);
            var day = String(date.getDate()).padStart(2, '0');
            var month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
            var year = date.getFullYear();
            return `${day}/${month}/${year}`;
        },
        generatePdf: function (functionalLocation, data, callback) {
            var that = this;
            // Show Busy Indicator
            sap.ui.core.BusyIndicator.show(0);
            var oCal = this.calculateData(data);
            var dateRange = {
                fromDate: this.fromDate,
                toDate: this.toDate
            };
            var gstin = data[0].GSTINNo;
            var panNo = gstin.slice(0, 10);
            var oAddress;
            if (data[0].MaintenancePlanningPlant === "1000") {
                oAddress = "2nd Floor, APIDC Building, Parishram Bhavan, PO Box - Basheerbagh, Hyderabad - 500004";
            }
            else if (data[0].MaintenancePlanningPlant === "2000") {
                oAddress = "Vidyadharapuram, Near Y. V. Rao Estate,R.S. No. 70, Kottur-Tadepally Road, Vijayawada - 520012";
            }
            else if (data[0].MaintenancePlanningPlant === "3000") {
                oAddress = "Vakalapudi Industrial Park, Kakinada, Plot No. 24-B, Survey No. 249/1, Kakinada - 533005";
            }

            // Function to format date as dd/mm/yyyy
            var formattedFromDate = this.formatDate(this.fromDate);
            var formattedToDate = this.formatDate(this.toDate);
            var formattedCurrentDate = this.formatDate(new Date());

            this.setAllDataProperty(data[0]);
            var oGlobalModelData = this.getOwnerComponent().getModel("globalModel").getData();

            var oImageUrl = jQuery.sap.getModulePath("com.bgl.app.jointticketform", "/model/BGL_Logo.png");
            return new Promise((resolve) => {
                that.convertImgToBase64(oImageUrl, function (base64Image) {
                    var docDefinition = {
                        pageSize: "A4",
                        pageMargins: [30, 30, 30, 30],
                        content: [
                            {
                                table: {
                                    widths: ["*"],
                                    body: [
                                        [
                                            {
                                                stack: [
                                                    {
                                                        table: {
                                                            widths: [100, "*"],  //// border: [left, top, right, bottom]
                                                            body: [
                                                                [
                                                                    // { text: "Logo", alignment: "center", border: [true, true, false, true], margin: [30, 20, 0, 15] },
                                                                    {
                                                                        image: base64Image,
                                                                        width: 100,
                                                                        height: 60,
                                                                        alignment: 'center',
                                                                        border: [true, true, false, true],
                                                                        margin: [30, 20, 0, 15]
                                                                    },
                                                                    {
                                                                        stack: [
                                                                            { text: "BHAGYANAGAR GAS LIMITED", fontSize: 14, bold: true, color: "green", alignment: "center" },
                                                                            { text: "(A joint venture of GAIL & HPCL)", fontSize: 8, bold: true, alignment: "center", margin: [0, 4, 0, 4] },
                                                                            { text: `Address:   ${oAddress} `, fontSize: 8, bold: true, alignment: "center", margin: [0, 0, 0, 0] },
                                                                            { text: `CIN No : U40200TG2003PLCO41566     PAN No:  ${panNo}`, fontSize: 8, bold: true, alignment: "center", margin: [0, 4, 0, 4] },
                                                                            { text: "Email Id: invoice@bglgas.com,    Website: www.bglgas.com", fontSize: 8, bold: true, alignment: "center", margin: [0, 0, 0, 0] }
                                                                        ],
                                                                        border: [false, true, true, true],
                                                                        margin: [0, 10, 0, 10]
                                                                    }
                                                                ]
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        table: {
                                                            widths: ["*"],
                                                            body: [
                                                                [{ text: "Joint Meter Reading of CNG Dispenser (JMR)", bold: true, alignment: "center", fontSize: 12, border: [true, false, true, true] }]
                                                            ]
                                                        },
                                                        margin: [0, 0, 0, 0]
                                                    },
                                                    // { text: "Date: " + new Date().toLocaleDateString(), fontSize: 10, color: "red", alignment: "right", margin: [0, 0, 0, 10] },

                                                    {
                                                        table: {
                                                            widths: ["*", "*", "*", "*"],
                                                            body: [
                                                                [{ text: "", border: [true, false, false, false] }, { text: "", border: [false, false, false, false] }, { text: "", border: [false, false, false, false] }, { text: "Date: " + formattedCurrentDate, fontSize: 8, color: "red", alignment: "right", margin: [0, 0, 0, 10], border: [false, false, true, false] }],
                                                                [{ text: "Period:", fontSize: 10, bold: false, border: [true, false, false, false] }, { text: "From: " + formattedFromDate, fontSize: 10, bold: false, border: [false, false, false, false] }, { text: "To: " + formattedToDate, fontSize: 10, bold: false, border: [false, false, false, false] }, { text: "", border: [false, false, true, false] }],
                                                                [
                                                                    { text: "Location:", fontSize: 10, bold: false, border: [true, false, false, false] },
                                                                    { text: `${data[0].Location}`, fontSize: 10, colSpan: 3, border: [false, false, true, false] }, "", ""
                                                                ],
                                                                [
                                                                    { text: "Address:", fontSize: 10, bold: false, border: [true, false, false, false] },
                                                                    { text: `${data[0].StreetName}, ${data[0].CityName}, ${data[0].PostalCode}`, fontSize: 10, colSpan: 3, border: [false, false, true, false] }, "", ""
                                                                ],
                                                                [{ text: "Dispenser no 1:", fontSize: 10, bold: false, border: [true, false, false, false] }, { text: `${data[0].Dispenser1}`, fontSize: 10, colSpan: 3, border: [false, false, true, false] }, { text: "", border: [false, false, false, false] }, { text: "", border: [false, false, true, false] }],
                                                                [{ text: "Dispenser no 2:", fontSize: 10, bold: false, border: [true, false, false, false] }, { text: `${data[0].Dispenser2}`, fontSize: 10, colSpan: 3, border: [false, false, true, false] }, { text: "", border: [false, false, false, false] }, { text: "", border: [false, false, true, false] }],
                                                                [{ text: "Dispenser no 3:", fontSize: 10, bold: false, border: [true, false, false, false] }, { text: `${data[0].Dispenser3}`, fontSize: 10, colSpan: 3, border: [false, false, true, false] }, { text: "", border: [false, false, false, false] }, { text: "", border: [false, false, true, false] }],
                                                                [{ text: "Dispenser no 4:", fontSize: 10, bold: false, border: [true, false, false, false] }, { text: `${data[0].Dispenser4}`, fontSize: 10, colSpan: 3, border: [false, false, true, false] }, { text: "", border: [false, false, false, false] }, { text: "", border: [false, false, true, false] }]
                                                            ]
                                                        }
                                                    },

                                                    // { text: " ", margin: [0, 10, 0, 10] },

                                                    {
                                                        table: {
                                                            headerRows: 1,
                                                            widths: ["20%", "20%", "20%", "20%", "20%"],
                                                            body: [
                                                                [
                                                                    { text: "Meter No.", fontSize: 9, alignment: "center", bold: true },
                                                                    { text: "Opening Meter Reading", fontSize: 9, alignment: "center", bold: true },
                                                                    { text: "Closing Meter Reading", fontSize: 9, alignment: "center", bold: true },
                                                                    { text: "Correction Factor", fontSize: 9, alignment: "center", bold: true },
                                                                    { text: "Gas Consumption", fontSize: 9, alignment: "center", bold: true }

                                                                ],
                                                                ...data.map(item => [
                                                                    { text: item.MeterNo || "-", alignment: "center", fontSize: 10 },
                                                                    { text: item.OpenDateRead, alignment: "center", fontSize: 10 },
                                                                    { text: item.ClosedateRead, alignment: "center", fontSize: 10 },
                                                                    { text: item.meter_corr_factor, alignment: "center", fontSize: 10 },
                                                                    { text: ((item.ClosedateRead - item.OpenDateRead) * item.meter_corr_factor).toFixed(2), alignment: "center", fontSize: 10 }
                                                                ])
                                                            ]
                                                        }
                                                    },

                                                    // { text: " ", margin: [0, 10, 0, 10] },
                                                    {
                                                        table: {
                                                            widths: ["30%", "50%", "20%"],
                                                            body: [
                                                                [
                                                                    { text: "", border: [true, false, true, false] },
                                                                    { text: "Quantity used up in testing / calibration", fontSize: 10, bold: false, border: [true, false, true, false] },
                                                                    { text: `${parseFloat(data[0].Quantity).toFixed(2)}`, fontSize: 10, alignment: "right", border: [true, false, true, false] }
                                                                ],
                                                                [
                                                                    { text: "", border: [true, false, true, false] },
                                                                    { text: "Dispensed Quantity (Kg)", fontSize: 10, bold: false, border: [true, false, true, false] },
                                                                    { text: `${parseFloat(data[0].ActualBillQty).toFixed(2)}`, fontSize: 10, alignment: "right", border: [true, false, true, false] }
                                                                ],
                                                                [
                                                                    { text: "", border: [true, false, true, true] },
                                                                    { text: "Quantity Sold (Kg)", fontSize: 10, bold: false, border: [true, false, true, true] },
                                                                    { text: `${parseFloat(data[0].QuantitySold).toFixed(2)}`, fontSize: 10, alignment: "right", border: [true, false, true, true] }
                                                                ]
                                                            ]
                                                        }
                                                    },

                                                    // { text: " ", margin: [0, 10, 0, 10] },
                                                    {
                                                        table: {
                                                            widths: ["*"],
                                                            body: [
                                                                [{ text: "", alignment: "center", border: [true, false, true, false], margin: [0, 5, 0, 5] }]
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        table: {
                                                            widths: ["*"],
                                                            body: [
                                                                [{ text: "Remarks / Note:", fontSize: 10, bold: true, border: [true, true, true, false] }],
                                                                [{ text: "", border: [true, false, true, true], margin: [0, 20, 0, 20] }]
                                                            ]
                                                        }
                                                    },

                                                    // { text: " ", margin: [0, 10, 0, 10] },
                                                    {
                                                        table: {
                                                            widths: ["*"],
                                                            body: [
                                                                [{ text: "For Bhagyanagar Gas Limited", fontSize: 10, alignment: "right", border: [true, false, true, false] }],
                                                                [{ text: "", margin: [0, 10, 0, 10], border: [true, false, true, false] }]
                                                            ]
                                                        }
                                                    },
                                                    // { text: "For Bhagyanagar Gas Limited", fontSize: 8, alignment: "right", margin: [0, 20, 0, 0] },
                                                    {
                                                        table: {
                                                            widths: ["*"],
                                                            body: [
                                                                [{ text: "System generated Invoice. Doesn't require signature.", fontSize: 10, italics: true, bold: true, alignment: "center", margin: [0, 0, 0, 0] }]
                                                            ]
                                                        }
                                                    },
                                                    // { text: "System generated Invoice. Doesn't require signature.", fontSize: 10, italics: true, bold: true, alignment: "center", margin: [0, 20, 0, 0] }
                                                ],
                                                border: [false, false, false, false] // OUTER BORDER
                                            }
                                        ]
                                    ]
                                }
                            }
                        ]
                        // images: {
                        //     logo: 'https://www.bglgas.com/wp-content/uploads/2023/04/Ramadhan-Mubarak-5-e1682514739293.png'  // External URL for the image
                        // }
                    };

                    // pdfMake.createPdf(docDefinition).download(`${functionalLocation}-BGLReport.pdf`);
                    // Generate PDF and show preview in PDFViewer

                    // pdfMake.createPdf(docDefinition).getBlob((blob) => {

                    //     var pdfUrl = URL.createObjectURL(blob);
                    //     var pdfTitle = `${data[0].Location}_${data[0].FunctionalLocation}`;

                    //     // window.open(pdfUrl, "_blank");

                    //     // var newWindow = window.open("", "_blank");
                    //     // newWindow.document.write(`
                    //     //         <html>
                    //     //             <head>
                    //     //                 <title>${pdfTitle}</title>
                    //     //             </head>
                    //     //             <body style="margin:0;">
                    //     //                 <iframe src="${pdfUrl}" width="100%" height="100%" style="border:none;"></iframe>
                    //     //             </body>
                    //     //         </html>
                    //     //     `);

                    //     // var oPdfViewer = new sap.m.PDFViewer({
                    //     //     source: pdfUrl,
                    //     //     title: pdfTitle,
                    //     //     showDownloadButton: true
                    //     // });

                    //     // that.getView().addDependent(oPdfViewer);
                    //     // oPdfViewer.setTitle(pdfTitle);
                    //     // oPdfViewer.open();

                    // });

                    // pdfMake.createPdf(docDefinition).getBlob((blob) => {
                    //     var pdfTitle = `${data[0].Location}_${data[0].FunctionalLocation}`;
                    //     var pdfUrl = URL.createObjectURL(blob);
                    //     that.generatedPdfUrls.push({
                    //         pdfTitle: pdfTitle,
                    //         pdfUrl: pdfUrl
                    //     });

                    //     if (callback) callback();
                    // });

                    resolve(docDefinition);
                    // Hide Busy Indicator after PDF is generated
                    sap.ui.core.BusyIndicator.hide();

                });
            });

        },
        mergeAndPreviewPdfs: function () {
            var that = this;

            if (!this.generatedPdfDocs.length) {
                sap.m.MessageToast.show("No PDFs generated.");
                return;
            }
            // Show Busy Indicator before opening the PDF
            sap.ui.core.BusyIndicator.show(0);

            // // Combine all PDFs into a single document
            // var mergedDocDefinition = {
            //     pageSize: "A4",
            //     content: []
            // };

            // this.generatedPdfDocs.forEach((doc, index) => {
            //     mergedDocDefinition.content.push(...doc.content);
            //     // mergedDocDefinition.content.push({ text: "", pageBreak: "after" }); // Add a page break after each PDF
            //     if (index < this.generatedPdfDocs.length - 1) {
            //         mergedDocDefinition.content.push({ text: "", pageBreak: "after" }); // Add a page break after each PDF and Remove Blank Page At Last
            //     }
            // });

            // // Generate merged PDF
            // pdfMake.createPdf(mergedDocDefinition).getBlob((blob) => {
            //     var pdfUrl = URL.createObjectURL(blob);

            //     // Open merged PDF in a single preview tab with a Download button
            //     var newWindow = window.open("", "_blank");
            //     newWindow.document.write(`
            //         <html>
            //             <head>
            //                 <title>Joint Ticket Form Reports</title>
            //             </head>
            //             <body style="margin:0; text-align:center;">
            //                 <iframe id="pdfFrame" src="${pdfUrl}" width="100%" height="100%" style="border:none;"></iframe>
            //             </body>
            //         </html>
            //     `);
            // });
            // sap.ui.core.BusyIndicator.hide();

            var mergedDocDefinition = {
                pageSize: "A4",
                content: []
            };

            this.generatedPdfDocs.forEach((doc, index) => {
                mergedDocDefinition.content.push(...doc.content);
                if (index < this.generatedPdfDocs.length - 1) {
                    mergedDocDefinition.content.push({ text: "", pageBreak: "after" });
                }
            });

            // this._busyDialog.open();

            setTimeout(() => {
                pdfMake.createPdf(mergedDocDefinition).getBlob((blob) => {
                    var pdfUrl = URL.createObjectURL(blob);

                    var newWindow = window.open("", "_blank");

                    // **Close Busy Dialog immediately after new tab opens**
                    this._busyDialog.close();

                    if (!newWindow) {
                        MessageToast.show("Please allow pop-ups to view the PDF.");
                        return;
                    }

                    newWindow.document.write(`
                            <html>
                                <head>
                                    <title>Joint Ticket Form Reports</title>
                                </head>
                                <body style="margin:0; text-align:center;">
                                    <iframe id="pdfFrame" src="${pdfUrl}" width="100%" height="100%" style="border:none;"></iframe>
                                </body>
                            </html>
                        `);
                });
            }, 100);
        },

        onOpenFunctionalLocationDialog: function () {
            if (!this._oDialog) {
                this._oDialog = this.byId("idFunctionalLocationDialog");
            }
            this._oDialog.open();
        },
        onSelectFunctionalLocation: function () {
            var oGlobalModel = this.getOwnerComponent().getModel("globalModel");
            var oList = this.byId("idFunctionalLocationList");
            var aSelectedItems = oList.getSelectedItems();
            var aSelectedValues = [];
            var aSelectedID = [];

            // Extract selected Functional Locations
            aSelectedItems.forEach(function (oItem) {
                aSelectedValues.push(oItem.getTitle()); // FunctionalLocation Name
                aSelectedID.push(oItem.getDescription()); // FunctionalLocation ID
            });


            // Show selected values in Input field
            var sValue = aSelectedValues.join(", ");
            this.byId("idFunctionalLocationInput").setValue(sValue);

            oGlobalModel.setProperty("/selectedFunctionalLocationsID", aSelectedID);   // Store Array Functional Location Id

            /// Get Functional Location Input Value
            var sFunctionalLocationValues = this.byId("idFunctionalLocationInput").getValue(); // Comma-separated values

            var aFunctionalLocationArray = sFunctionalLocationValues.split(", "); // Convert to array
            // Store Functional Locations Name in Global Model
            oGlobalModel.setProperty("/selectedFunctionalLocations", aFunctionalLocationArray);  // Store Array Functional Location Name

            var oSearchField = this.byId("idFunctionalLocationSearchField");  // Remove Search Field
            oSearchField.setValue("");
            var oBinding = oList.getBinding("items");
            if (oBinding) {
                oBinding.filter([]); // Remove filters
            }

            oList.removeSelections(true); // Removes all List selections

            var oSelectAllCheckBox = this.byId("selectAllCheckBoxFunctionalLocation");
            if (oSelectAllCheckBox) {
                oSelectAllCheckBox.setSelected(false);
            }

            // Close the dialog
            this.byId("idFunctionalLocationDialog").close();
        },

        onCloseDialog: function () {
            this.byId("idFunctionalLocationDialog").close();
        },
        onFunctionalLocationClear: function (oEvent) {
            var sValue = oEvent.getParameter("value"); // Get the input value
            var oList = this.byId("idFunctionalLocationList"); // Get the list
            var oGlobalModel = this.getOwnerComponent().getModel("globalModel");

            if (!sValue) {    // If input is empty, clear selection
                oList.removeSelections(true); // Deselect all items
                oGlobalModel.setProperty("/selectedFunctionalLocationsID", "");
                oGlobalModel.setProperty("/selectedFunctionalLocations", "");
            }
        },
        onSearchFunctionalLocation: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue"); // Get search input
            var oList = this.byId("idFunctionalLocationList");
            if (!oList) {
                console.error("List not found!");
                return;
            }

            var oBinding = oList.getBinding("items"); // Get binding of the List
            if (!oBinding) {
                console.error("List binding not found!");
                return;
            }

            var aFilters = [];
            if (sQuery && sQuery.length > 0) {
                var oFilter1 = new sap.ui.model.Filter("FunctionalLocationName", sap.ui.model.FilterOperator.Contains, sQuery);
                var oFilter2 = new sap.ui.model.Filter("FunctionalLocation", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters.push(new sap.ui.model.Filter({
                    filters: [oFilter1, oFilter2],
                    and: false // Match either FunctionalLocationName or FunctionalLocation
                }));
            }

            // Apply the filters to the list binding
            oBinding.filter(aFilters);
        },
        onSelectAllChange: function (oEvent) {
            var bSelected = oEvent.getParameter("selected"); // CheckBox state
            var oList = this.byId("idFunctionalLocationList");
            if (!oList) {
                console.error("List not found!");
                return;
            }

            var aItems = oList.getItems(); // Get all list items

            // Select or Deselect all list items based on CheckBox state
            aItems.forEach(function (oItem) {
                oItem.setSelected(bSelected);
            });;
        }


    });
});