/* SII-MOBILITY DEV KIT MOBILE APP KM4CITY.
 Copyright (C) 2016 DISIT Lab http://www.disit.org/6981 - University of Florence
 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU Affero General Public License
 as published by the Free Software Foundation.
 The interactive user interfaces in modified source and object code versions 
 of this program must display Appropriate Legal Notices, as required under 
 Section 5 of the GNU Affero GPL . In accordance with Section 7(b) of the 
 GNU Affero GPL , these Appropriate Legal Notices must retain the display 
 of the "Sii-Mobility Dev Kit Mobile App Km4City" logo. The Logo "Sii-Mobility
 Dev Kit Mobile App Km4City" must be a clickable link that leads directly to the
 Internet URL http://www.sii-mobility.org oppure a DISIT Lab., using 
 technology derived from  Http://www.km4city.org.
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 You should have received a copy of the GNU Affero General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA. 
 */
var EasyParkModule = {

    open: false,
    expanded: false,
    results: null,
    varName: "EasyParkModule",
    idMenu: "easyParkMenu",
    responseLength: 0,
    temporaryResponse: null,
    templateName: "js/modules/easyParkModule/EasyParkMenu.mst.html",
    
    reachLocation: function(lat, long){
      console.log("EASYPARK Location",lat,long);  
    },
    refreshMenu: function () {
        if ($("#" + EasyParkModule.idMenu).length == 0) {
            $("#indexPage").append("<div id=\"" + EasyParkModule.idMenu + "\" class=\"commonHalfMenu\"></div>")
        }
        ViewManager.render(EasyParkModule.results, "#" + EasyParkModule.idMenu,EasyParkModule.templateName );
        Utility.movingPanelWithTouch("#" + EasyParkModule.idMenu + "ExpandHandler",
                "#" + EasyParkModule.idMenu);
        if (EasyParkModule.expanded) {
            $("#" + EasyParkModule.idMenu + "Expand").hide();
        } else {
            $("#" + EasyParkModule.idMenu + "Collapse").hide();
        }
    },
    show: function () {
        application.resetInterface();
        MapManager.showMenuReduceMap("#" + EasyParkModule.idMenu);
        $("#" + EasyParkModule.idMenu + "Collapse").hide();
        EasyParkModule.open = true;
        InfoManager.addingMenuToManage(EasyParkModule.varName);
        application.addingMenuToCheck(EasyParkModule.varName);
        application.setBackButtonListener();
    },
    hide: function () {
        $("#" + EasyParkModule.idMenu).css({'z-index': '1001'});
        MapManager.reduceMenuShowMap("#" + EasyParkModule.idMenu);
        InfoManager.removingMenuToManage(EasyParkModule.varName);
        application.removingMenuToCheck(EasyParkModule.varName);
        EasyParkModule.open = false;
    },

    checkForBackButton: function () {
        if (EasyParkModule.open) {
            EasyParkModule.hide();
        }
    },

    refreshMenuPosition: function () {
        if (EasyParkModule.open) {
            MapManager.showMenuReduceMap("#" + EasyParkModule.idMenu);
            Utility.checkAxisToDrag("#" + EasyParkModule.idMenu);
            if (EasyParkModule.expanded) {
                EasyParkModule.expandEasyParkModule();
            }
        }
    },

    closeAll: function () {
        if (EasyParkModule.open) {
            EasyParkModule.hide();
        }
    },

    expandEasyParkModule: function () {
        Utility.expandMenu("#" + EasyParkModule.idMenu, "#" + EasyParkModule.idMenu + "Expand", "#" + EasyParkModule.idMenu + "Collapse");
        EasyParkModule.expanded = true;
    },

    collapseEasyParkModule: function () {
        Utility.collapseMenu("#" + EasyParkModule.idMenu, "#" + EasyParkModule.idMenu + "Expand", "#" + EasyParkModule.idMenu + "Collapse");
        EasyParkModule.expanded = false;
    },

    search: function () {
        // TODO: change search center on place selected by user
        var parkingQuery = QueryManager.createCategoriesQuery(['Car_park'], SearchManager.searchCenter, "user");
        APIClient.executeQuery(parkingQuery, EasyParkModule.searchInformationForEachFeature, EasyParkModule.errorQuery);
    },
    searchInformationForEachFeature(response) {
        for (var category in response) {
            if (response[category].features.length != 0) {
                EasyParkModule.responseLength = response[category].features.length;
                EasyParkModule.temporaryResponse = {
                    "Results": {
                        "features": [],
                        "fullCount": EasyParkModule.responseLength,
                        "type": "FeatureCollection",
                    }
                };
                Loading.showAutoSearchLoading();
                for (var i = 0; i < response[category].features.length; i++) {
                    var serviceQuery = QueryManager.createServiceQuery(response[category].features[i].properties.serviceUri, "app");
                    APIClient.executeQueryWithoutAlert(serviceQuery,
                            EasyParkModule.mergeResults,
                            EasyParkModule.decrementAndCheckRetrieved);
                }
            } else {
                SearchManager.startAutoSearch(EasyParkModule.varName);
            }
        }
    },

    mergeResults: function (response) {
        for (var category in response) {
            if (response[category].features != null) {
                if (response[category].features.length != 0) {
                    if (response.realtime != null) {
                        if (response.realtime.results != null) {
                            if (response.realtime.results.bindings[0] != null) {
                                if (response.realtime.results.bindings[0].freeParkingLots != null) {
                                    response[category].features[0].properties.freeParkingLots = response.realtime.results.bindings[0].freeParkingLots.value;
                                    if (response[category].features[0].properties.freeParkingLots > 20) {
                                        response[category].features[0].properties.freeParkingLotsColor = "green";
                                    } else if (response[category].features[0].properties.freeParkingLots > 0) {
                                        response[category].features[0].properties.freeParkingLotsColor = "orange";
                                    } else {
                                        response[category].features[0].properties.freeParkingLotsColor = "red";
                                    }
                                }
                            }
                        }
                    }
                    EasyParkModule.temporaryResponse["Results"].features.push(response[category].features[0]);
                }
            }
        }

        EasyParkModule.decrementAndCheckRetrieved();

    },

    decrementAndCheckRetrieved: function () {
        EasyParkModule.responseLength--;

        if (EasyParkModule.responseLength == 0) {
            EasyParkModule.successQuery(EasyParkModule.temporaryResponse);
            Loading.hideAutoSearchLoading();
        }
    },

    //callBack
    successQuery: function (response) {
        var responseObject = response;

        if (SearchManager.typeOfSearchCenter == "selectedServiceMarker") {
            MapManager.searchOnSelectedServiceMarker = true;
        }
        for (var i = 0; i < responseObject["Results"].features.length; i++) {
            responseObject["Results"].features[i].id = i;
            Utility.enrichService(responseObject["Results"].features[i], i);
        }
        if (responseObject["Results"].features[0].properties.distanceFromSearchCenter != null) {
            responseObject["Results"].features.sort(function (a, b) {
                return a.properties.distanceFromSearchCenter - b.properties.distanceFromSearchCenter
            });
        } else {
            responseObject["Results"].features.sort(function (a, b) {
                return a.properties.distanceFromGPS - b.properties.distanceFromGPS
            });
        }//SearchManager.startAutoSearch(EasyParkModule.varName);
        EasyParkModule.results = response["Results"];
        EasyParkModule.refreshMenu();
        EasyParkModule.show();
        MapManager.addGeoJSONLayerWithoutArea(response);
        //MapManager.addGeoJSONLayer(response);
        EasyParkModule.resetSearch();
    },

    //callBack
    errorQuery: function (error) {
        navigator.notification.alert(
                Globalization.alerts.servicesServerError.message,
                function () { },
                Globalization.alerts.servicesServerError.title);
    },

    resetSearch: function () {
        QueryManager.resetMaxDists();
        Loading.hideAutoSearchLoading();
    },

}