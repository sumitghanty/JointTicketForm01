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
], (Controller, JSONModel, Label, Filter, FilterOperator, PersonalizableInfo, MessageBox, exportLibrary, Spreadsheet, MessageToast, CustModels) => {
    "use strict";
    const EdmType = exportLibrary.EdmType;
    return Controller.extend("com.bgl.app.jointticketform.controller.Jointticket", {

        onInit() {
            //var sPath = jQuery.sap.getModulePath("com.bgl.app.jointticketform", "../model/model.json");
            //this.oModel.loadData(sap.ui.require.toUrl("model.json"), null, false);
            //this.oModel = new JSONModel(sPath);

            //this.getView().setModel(this.oModel);
            this.oModel = new JSONModel();

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
                        var arrayOfStrings = oControl.getId().split('-');
                        var oMessage = "";
                        var str = ["fromDate", "toDate"];
                        var found = arrayOfStrings.find(v => str.includes(v));
                        if (found == "fromDate") {
                            oMessage = "Please Fill in the compulsory From-Date Fields";
                        } else if (found == "toDate") {
                            oMessage = "Please Fill in the compulsory To-Date Fields";
                        } else {
                            oMessage = "Please Fill in the compulsory Fields";
                        }

                        MessageBox.error(oMessage);
                        return;
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
            var oTableJsonModel = this.getDataFromBackend(oUrl);

            // For extract From and To Date
            this.fromDate = aTableFilters[0];
            this.toDate = aTableFilters[1];
            // End

            /*this.oTable.bindItems({
                path: oUrl,
                template: that.oTable.getBindingInfo("items").template
            });*/
            //this.oTable.getBinding("items").filter(aTableFilters);
            //this.oTable.setShowOverlay(false);
        },
        getDataFromBackend: function (oUrl) {
            var oModel2 = this.getOwnerComponent().getModel();
            let aFilters = [
                //new sap.ui.model.Filter("EquipmentName", sap.ui.model.FilterOperator.EQ, "Valve - 4"),
                //new sap.ui.model.Filter("password", sap.ui.model.FilterOperator.EQ, password)
            ];
            let oBinding = oModel2.bindList(oUrl);
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
                            actions: ["Yes (Auto)", "No (Select)", sap.m.MessageBox.Action.CANCEL],
                            emphasizedAction: "Yes (Auto)",
                            onClose: function (sAction) {
                                if (sAction === "Yes (Auto)") {
                                    // Generate PDFs for all Functional Locations
                                    Object.keys(data).forEach(functionalLocation => {
                                        that.generatePdf(functionalLocation, data[functionalLocation]);
                                    });
                                } else if (sAction === "No (Select)") {
                                    // Show a selection dialog
                                    that.showSelectionDialog(data);
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
        generatePdf: function (functionalLocation, data) {
            var oCal = this.calculateData(data);
            var dateRange = {
                fromDate: this.fromDate,
                toDate: this.toDate
            };
            var oImageUrl = jQuery.sap.getModulePath("com.bgl.app.jointticketform", "/model/BGL_Logo.png");
            this.convertImgToBase64(oImageUrl, function (base64Image) {
                var that = this;
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
                                                                        { text: "(A joint venture of GAIL & HPCL)", fontSize: 8, bold: true, alignment: "center", margin: [0, 2, 0, 2] },
                                                                        { text: "Address: - BGL address\nAddress line 2", fontSize: 8, bold: true, alignment: "center", margin: [0, 0, 0, 0] },
                                                                        { text: `VAT/TIN:         PAN:        GSTIN: `, fontSize: 8, bold: true, alignment: "center", margin: [0, 2, 0, 2] },
                                                                        { text: "Email Id: invoice@bgsgas.com,    Website: www.bglgas.com", fontSize: 8, bold: true, alignment: "center", margin: [0, 0, 0, 0] }
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
                                                            [{ text: "", border: [true, false, false, false] }, { text: "", border: [false, false, false, false] }, { text: "", border: [false, false, false, false] }, { text: "Date: " + new Date().toLocaleDateString(), fontSize: 8, color: "red", alignment: "right", margin: [0, 0, 0, 10], border: [false, false, true, false] }],
                                                            [{ text: "Period", fontSize: 8, bold: false, border: [true, false, false, false] }, { text: "", border: [false, false, false, false] }, { text: "From: " + dateRange.fromDate, fontSize: 8, bold: false, border: [false, false, false, false] }, { text: "To: " + dateRange.toDate, fontSize: 8, bold: false, border: [false, false, true, false] }],
                                                            [
                                                                { text: "Location", fontSize: 8, bold: false, border: [true, false, false, false] },
                                                                { text: `${oCal.locationDescription}`, fontSize: 8, colSpan: 3, border: [false, false, true, false] }, "", ""
                                                            ],
                                                            [
                                                                { text: "Address", fontSize: 8, bold: false, border: [true, false, false, false] },
                                                                { text: "(Full Address, Street, House No, Postal Code and City)", fontSize: 8, colSpan: 3, border: [false, false, true, false] }, "", ""
                                                            ],
                                                            [{ text: "Dispenser no", fontSize: 8, bold: false, border: [true, false, false, false] }, { text: "", border: [false, false, false, false] }, { text: "", border: [false, false, false, false] }, { text: "", border: [false, false, true, false] }]
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
                                                                { text: item.MeterSerialNumber || "-", alignment: "center", fontSize: 8 },
                                                                { text: item.OpenDateRead, alignment: "center", fontSize: 8 },
                                                                { text: item.ClosedateRead, alignment: "center", fontSize: 8 },
                                                                { text: item.meter_corr_factor, alignment: "center", fontSize: 8 },
                                                                { text: `${oCal.totalGasConsumption}`, alignment: "center", fontSize: 8 }
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
                                                                { text: "Quantity used up in testing / calibration", fontSize: 8, bold: false, border: [true, false, true, false] },
                                                                { text: "-100.00", fontSize: 8, alignment: "right", border: [true, false, true, false] }
                                                            ],
                                                            [
                                                                { text: "", border: [true, false, true, false] },
                                                                { text: "Dispensed Quantity (Kg)", fontSize: 8, bold: false, border: [true, false, true, false] },
                                                                { text: `${oCal.dispensedQuantity}`, fontSize: 8, alignment: "right", border: [true, false, true, false] }
                                                            ],
                                                            [
                                                                { text: "", border: [true, false, true, true] },
                                                                { text: "Quantity Sold (Kg)", fontSize: 8, bold: false, border: [true, false, true, true] },
                                                                { text: `${oCal.quantitySold}`, fontSize: 8, alignment: "right", border: [true, false, true, true] }
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
                                                            [{ text: "Remarks / Note:", fontSize: 8, bold: true, border: [true, true, true, false] }],
                                                            [{ text: "", border: [true, false, true, true], margin: [0, 20, 0, 20] }]
                                                        ]
                                                    }
                                                },

                                                // { text: " ", margin: [0, 10, 0, 10] },
                                                {
                                                    table: {
                                                        widths: ["*"],
                                                        body: [
                                                            [{ text: "For Bhayanagar Gas Limited", fontSize: 8, alignment: "right", border: [true, false, true, false] }],
                                                            [{ text: "", margin: [0, 10, 0, 10], border: [true, false, true, false] }]
                                                        ]
                                                    }
                                                },
                                                // { text: "For Bhayanagar Gas Limited", fontSize: 8, alignment: "right", margin: [0, 20, 0, 0] },
                                                {
                                                    table: {
                                                        widths: ["*"],
                                                        body: [
                                                            [{ text: "System generated Invoice. Doesn't require signature.", fontSize: 8, italics: true, bold: true, alignment: "center", margin: [0, 0, 0, 0] }]
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

                pdfMake.createPdf(docDefinition).download(`${functionalLocation}-BGLReport.pdf`);

                sap.m.MessageToast.show("PDF downloaded successfully!");

            })

        },

    });
});