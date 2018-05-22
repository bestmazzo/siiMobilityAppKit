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
var OnStreetParkSearcher = {

    open: false,
    expanded: false,
    results: null,
    varName: "OnStreetParkSearcher",
    idMenu: "onStreetParkMenu",
    responseLength: 0,
    temporaryResponse: null,

    refreshMenu: function () {
        if ($("#" + OnStreetParkSearcher.idMenu).length == 0) {
            $("#indexPage").
                append("<div id=\"" + OnStreetParkSearcher.idMenu + "\" class=\"commonHalfMenu\"></div>");
        }
        ViewManager.render(OnStreetParkSearcher.results, "#" + OnStreetParkSearcher.idMenu, "js/modules/OnStreetPark/OnStreetParkMenu.mst.html");
        Utility.movingPanelWithTouch("#" + OnStreetParkSearcher.idMenu + "ExpandHandler", "#" + OnStreetParkSearcher.idMenu);
        if (OnStreetParkSearcher.expanded) {
            $("#" + OnStreetParkSearcher.idMenu + "Expand").hide();
        } else {
            $("#" + OnStreetParkSearcher.idMenu + "Collapse").hide();
        }
    },

    show: function () {
        application.resetInterface();
        MapManager.showMenuReduceMap("#" + OnStreetParkSearcher.idMenu);
        $("#" + OnStreetParkSearcher.idMenu + "Collapse").hide();
        OnStreetParkSearcher.open = true;
        InfoManager.addingMenuToManage(OnStreetParkSearcher.varName);
        application.addingMenuToCheck(OnStreetParkSearcher.varName);
        application.setBackButtonListener();
    },

    hide: function () {
        $("#" + OnStreetParkSearcher.idMenu).css({ 'z-index': '1001' });
        MapManager.reduceMenuShowMap("#" + OnStreetParkSearcher.idMenu);
        InfoManager.removingMenuToManage(OnStreetParkSearcher.varName);
        application.removingMenuToCheck(OnStreetParkSearcher.varName);
        OnStreetParkSearcher.open = false;
    },

    checkForBackButton: function () {
        if (OnStreetParkSearcher.open) {
            OnStreetParkSearcher.hide();
        }
    },

    refreshMenuPosition: function () {
        if (OnStreetParkSearcher.open) {
            MapManager.showMenuReduceMap("#" + OnStreetParkSearcher.idMenu);
            Utility.checkAxisToDrag("#" + OnStreetParkSearcher.idMenu);
            if (OnStreetParkSearcher.expanded) {
                OnStreetParkSearcher.expandBusRoutesMenu();
            }
        }
    },

    closeAll: function () {
        if (OnStreetParkSearcher.open) {
            OnStreetParkSearcher.hide();
        }
    },

    expandOnStreetParkSearcher: function () {
        Utility.expandMenu("#" + OnStreetParkSearcher.idMenu, "#" + OnStreetParkSearcher.idMenu + "Expand", "#" + OnStreetParkSearcher.idMenu + "Collapse");
        OnStreetParkSearcher.expanded = true;
    },

    collapseOnStreetParkSearcher: function () {
        Utility.collapseMenu("#" + OnStreetParkSearcher.idMenu, "#" + OnStreetParkSearcher.idMenu + "Expand", "#" + OnStreetParkSearcher.idMenu + "Collapse");
        OnStreetParkSearcher.expanded = false;
    },

    search: function(){
        var parkingQuery = QueryManager.createCategoriesQuery(['Car_park'], SearchManager.searchCenter, "user");
        APIClient.executeQuery(parkingQuery, OnStreetParkSearcher.searchInformationForEachFeature, OnStreetParkSearcher.errorQuery);
    },

    searchInformationForEachFeature: function (response) {
        for (var category in response) {
            if (response[category].features.length != 0) {
                OnStreetParkSearcher.responseLength = response[category].features.length;
                OnStreetParkSearcher.temporaryResponse = {
                    "Results": {
                        "features": [],
                        "fullCount": OnStreetParkSearcher.responseLength,
                        "type": "FeatureCollection",
                    }
                };
                Loading.showAutoSearchLoading();
                for (var i = 0; i < response[category].features.length; i++) {
                    var serviceQuery = QueryManager.createServiceQuery(response[category].features[i].properties.serviceUri, "app");
                    APIClient.executeQueryWithoutAlert(serviceQuery, OnStreetParkSearcher.mergeResults, OnStreetParkSearcher.decrementAndCheckRetrieved);
                }
            } else {
                SearchManager.startAutoSearch(OnStreetParkSearcher.varName);
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
                                /*if (response.realtime.results.bindings[0].freeParkingLots != null) {
                                    response[category].features[0].properties.freeParkingLots = response.realtime.results.bindings[0].freeParkingLots.value;
                                    if (response[category].features[0].properties.freeParkingLots > 20) {
                                        response[category].features[0].properties.freeParkingLotsColor = "green";
                                    } else if (response[category].features[0].properties.freeParkingLots > 0) {
                                        response[category].features[0].properties.freeParkingLotsColor = "orange";
                                    } else {
                                        response[category].features[0].properties.freeParkingLotsColor = "red";
                                    }
                                }*/
								/*response[category].features[0].properties.items = [];
								for (var i = 0; i < response.realtime.results.bindings.length; i++) {
									var item = response.realtime.results.bindings[i];
									response[category].features[0].properties.items.push(item);
								}*/
                                if (response.realtime.results.bindings[0].freeParkingLots != null) {
                                    response[category].features[0].properties.freeParkingLots = response.realtime.results.bindings[0].freeParkingLots.value;
                                    if (response[category].features[0].properties.freeParkingLots > 20) {
                                        response[category].features[0].properties.freeParkingLotsColor = "green";
                                    } else if (response[category].features[0].properties.freeParkingLots > 0) {
                                        response[category].features[0].properties.freeParkingLotsColor = "orange";
                                    } else {
                                        response[category].features[0].properties.freeParkingLotsColor = "red";
                                    }

                                    response[category].features[0].properties.capacity = response.realtime.results.bindings[0].capacity.value;

                                    var date = new Date(response.realtime.results.bindings[0].updating.value);
                                    var day = date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate();
                                    var monthIndex = (date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1);
                                    var year = date.getFullYear();
                                    var hours = date.getHours() < 10 ? ("0" + date.getHours()) : date.getHours();;
                                    var minutes = date.getMinutes() < 10 ? ("0" + date.getMinutes()) : date.getMinutes();;
                                    var seconds = date.getSeconds() < 10 ? ("0" + date.getSeconds()) : date.getSeconds();;
                                    response[category].features[0].properties.updating = day + "/" + monthIndex + "/" + year + " " + hours + ":" + minutes + ":" + seconds;

                                    response[category].features[0].properties.marker = "•";
                                }
                            }
                        }
                    }
                    OnStreetParkSearcher.temporaryResponse.Results.features.push(response[category].features[0]);
                }
            }
        }

        OnStreetParkSearcher.decrementAndCheckRetrieved();

    },

    decrementAndCheckRetrieved: function(){
        OnStreetParkSearcher.responseLength--;

        if (OnStreetParkSearcher.responseLength == 0) {
            OnStreetParkSearcher.successQuery(OnStreetParkSearcher.temporaryResponse);
            Loading.hideAutoSearchLoading();
        }
    },

    //success callBack
    successQuery: function (response) {
        var responseObject = response;

        // for (var i = 0; i < responseObject.Results.features.length; i++) {
        //     MapManager.updateGpsMarker(responseObject.Results.features[i].geometry.coordinates[1], responseObject.Results.features[i].geometry.coordinates[0]);
        // }

        if (SearchManager.typeOfSearchCenter == "selectedServiceMarker" && MapManager.activeModule !== 'OnStreetParkSearcher') {
            MapManager.searchOnSelectedServiceMarker = true;
        }
        for (var i = 0; i < responseObject.Results.features.length; i++) {
            responseObject.Results.features[i].id = i;
            Utility.enrichService(responseObject.Results.features[i], i);
        }

        if (MapManager.activeModule !== 'OnStreetParkSearcher') {
            if (responseObject.Results.features[0].properties.distanceFromSearchCenter != null) {
                responseObject.Results.features.sort(function (a, b) {
                    return a.properties.distanceFromSearchCenter - b.properties.distanceFromSearchCenter;
                });
            } else {
                responseObject.Results.features.sort(function (a, b) {
                    return a.properties.distanceFromGPS - b.properties.distanceFromGPS;
                });
            }
        }

        OnStreetParkSearcher.results = responseObject.Results;
        OnStreetParkSearcher.refreshMenu();
        OnStreetParkSearcher.show();
        MapManager.addGeoJSONLayer(responseObject);
        OnStreetParkSearcher.resetSearch();

        if (MapManager.activeModule === 'OnStreetParkSearcher' && responseObject.Results.features.length > 0) {
            MapManager.centerMapOnCoordinates(responseObject.Results.features[0].geometry.coordinates[1], responseObject.Results.features[0].geometry.coordinates[0]);
        }
    },

    //error callBack
    errorQuery: function(error) {
        navigator.notification.alert(
            Globalization.alerts.servicesServerError.message,
            function () { },
            Globalization.alerts.servicesServerError.title);
    },

    renderSingleService: function (singleService) {
        ViewManager.render(singleService, "#" + InfoManager.idMenu, "js/modules/OnStreetPark/OnStreetPark.mst.html");
        ViewManager.render(singleService.Service.features[0], "#infoMenuInnerDetailHeader", "ServiceDetailHeader");
        ViewManager.render(singleService.Service.features[0], "#infoMenuInnerDetails", "ServiceDetails");
        if (singleService.trends != null) {
            var chartObject = {};
            for (var i = 0; i < singleService.trends.length; i++) {
                if (typeof chartObject[singleService.trends[i].day] == "undefined") {
                    chartObject[singleService.trends[i].day] = { values: [], labels: [], colorsArea: [], colorsBorder: [], active: "" };
                }
                chartObject[singleService.trends[i].day].values.push(parseInt(singleService.trends[i].free));
                if (parseInt(singleService.trends[i].free) > 20) {
                    chartObject[singleService.trends[i].day].colorsArea.push('rgba(75, 192, 192, 0.2)');
                    chartObject[singleService.trends[i].day].colorsBorder.push('rgba(75, 192, 192, 1)');
                } else {
                    chartObject[singleService.trends[i].day].colorsArea.push('rgba(255, 159, 64, 0.2)');
                    chartObject[singleService.trends[i].day].colorsBorder.push('rgba(255, 159, 64, 1)');
                }
                chartObject[singleService.trends[i].day].labels.push(singleService.trends[i].hour.substring(0, 2));
            }

            var date = new Date();
            var currentWeekDay = date.getDay();

            for (var category in chartObject) {
                if (parseInt(category) == currentWeekDay) {
                    chartObject[category].active = "active";
                }
                if ($("#predictionTrendChart" + category).length == 0) {
                    $("#predictionTrendCarouselInner").
                    append("<div id=\"predictionTrendChart" + category + "\" class=\"item " + chartObject[category].active + "\" style=\"left: 5%; width: 90%;\"> <canvas height=\"180\"></canvas></div>")
                }


                var myChart = new Chart($("#predictionTrendChart" + category + " canvas"), {
                    type: 'bar',
                    data: {
                        labels: chartObject[category].labels,
                        datasets: [{
                            data: chartObject[category].values,
                            backgroundColor: chartObject[category].colorsArea,
                            borderColor: chartObject[category].colorsBorder,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        legend: { display: false }, title: { display: true, text: Globalization.labels.weekDay[category], position: "bottom" },
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                },
                            }]
                        }
                    }
                });
            }
        }
    },

    resetSearch: function () {
        QueryManager.resetMaxDists();
        Loading.hideAutoSearchLoading();
    },

    orderByFreeParkingLots: function () {
        OnStreetParkSearcher.results.features.sort(function (a, b) {
            if (a.properties.freeParkingLots == null) {
                return 1;
            } else if (b.properties.freeParkingLots == null) {
                return -1;
            }
            return b.properties.freeParkingLots - a.properties.freeParkingLots;
        });
        OnStreetParkSearcher.refreshMenu();
        $("#OnStreetParkSearcherMenuFreeParkingOrderImage").addClass('glyphicon-sort-by-attributes-alt');
        $("#OnStreetParkSearcherMenuGpsOrderImage").removeClass("glyphicon-sort-by-attributes");
        $("#OnStreetParkSearcherMenuSearchCenterOrderImage").removeClass("glyphicon-sort-by-attributes");

    },

    orderByDistanceFromGPS: function () {
        OnStreetParkSearcher.results.features.sort(function (a, b) {
            if (a.properties.distanceFromGPS == null) {
                return 1;
            } else if (b.properties.distanceFromGPS == null) {
                return -1;
            }
            return a.properties.distanceFromGPS - b.properties.distanceFromGPS;
        });
        OnStreetParkSearcher.refreshMenu();
        $("#OnStreetParkSearcherMenuGpsOrderImage").addClass('glyphicon-sort glyphicon-sort-by-attributes');
        $("#OnStreetParkSearcherMenuFreeParkingOrderImage").removeClass("glyphicon-sort-by-attributes-alt");
        $("#OnStreetParkSearcherMenuSearchCenterOrderImage").removeClass("glyphicon-sort-by-attributes");
    },

    orderByDistanceFromSearchCenter: function () {
        OnStreetParkSearcher.results.features.sort(function (a, b) {
            if (a.properties.distanceFromSearchCenter == null) {
                return 1;
            } else if (b.properties.distanceFromSearchCenter == null) {
                return -1;
            }
            return a.properties.distanceFromSearchCenter - b.properties.distanceFromSearchCenter;
        });
        OnStreetParkSearcher.refreshMenu();
        $("#OnStreetParkSearcherMenuSearchCenterOrderImage").addClass("glyphicon-sort-by-attributes");
        $("#OnStreetParkSearcherMenuGpsOrderImage").removeClass("glyphicon-sort-by-attributes");
        $("#OnStreetParkSearcherMenuFreeParkingOrderImage").removeClass("glyphicon-sort-by-attributes");
    },

};
