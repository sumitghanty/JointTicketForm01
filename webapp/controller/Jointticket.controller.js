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
    "com/bgl/app/jointticketform/model/models"
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
                    return oReturnModel;

                } else {
                    MessageBox.error("No Data fetch. Empty Dataset");
                }
            }).catch((err) => {
                //console.error("Error fetching data: ", err);
                MessageBox.error("An error occurred while fetching data. Please try again.");
            });
        }

    });
});