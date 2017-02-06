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
    result: null,
    varName: "EasyParkModule",
    idMenu: "easyParkMenu",

    refreshMenu: function () {
        if ($("#" + EasyParkModule.idMenu).length == 0) {
            $("#indexPage").append("<div id=\"" + EasyParkModule.idMenu + "\" class=\"commonHalfMenu\"></div>")
        }
        ViewManager.render(EasyParkModule.results, "#" + EasyParkModule.idMenu, "js/modules/easyParkModule/easyParkMenu.mst.html");
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
        $("#" + EasyParkModule.idMenu).css({ 'z-index': '1001' });
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
                EasyParkModule.expandBusRoutesMenu();
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

    //callBack
    successQuery: function (response) {
        //SearchManager.startAutoSearch(EasyParkModule.varName);
        EasyParkModule.results = response;
        EasyParkModule.refreshMenu();
        EasyParkModule.show();
        MapManager.addGeoJSONLayerWithoutArea(response);
        //MapManager.addGeoJSONLayer(response);
        EasyParkModule.resetSearch();
    },

    //callBack
    errorQuery: function(error) {
        navigator.notification.alert(Globalization.alerts.servicesServerError.message, function() {}, Globalization.alerts.servicesServerError.title);
    },

    resetSearch: function () {
        QueryManager.resetMaxDists();
        Loading.hideAutoSearchLoading();
    },

}