angular.module("carto", ["cartoControllers"])
/**
 * Controller of stratis-carto
 */
    .controller("CartoCtrl", function ($scope) {
        this.map = new OpenLayers.Map();
        this.baseLayer = new OpenLayers.Layer.OSM("Simple OSM Map");

        this.map.addLayer(this.baseLayer);

        this.widthMarkers = $scope.widthMarkers;
        this.heightMarkers = $scope.heightMarkers;
        this.iconMarkers = $scope.iconMarkers;

        this.addLayer = function (type, name) {
            if (typeof type === "undefined") {
                type = "marker"
            }
            var layer;
            switch (type) {
                case "marker":
                    layer = new OpenLayers.Layer.Markers(name);
                    break;
                case "kml":
                    break;
                case "map":
                    break;
                default:
                    throw "Unknown type of layer"

            }
            this.map.addLayer(layer);
            return layer;
        };


    })
    .directive("stratisCarto", function () {
        var template = "<div class='container-carto max'></div><div ng-transclude=''></div>";
        return {
            restrict: 'E',
            template: template,
            require:"stratisCarto",
            transclude: true,
            controller: "CartoCtrl",
            scope: {
                widthMarkers: "@",
                heightMarkers: "@",
                iconMarkers: "@"
            },
            link: function ($scope, element, attrs, ctrl) {
                ctrl.map.render(element.children()[0]);
                ctrl.map.zoomToMaxExtent();
            }
        }
    })
    .controller("MarkerLayerCtrl", function ($scope) {
        $scope.projFrom = new OpenLayers.Projection("EPSG:4326");
        $scope.projTo = new OpenLayers.Projection("EPSG:900913");


        this.createIconMarker = function (width, height, iconPath) {
            if (typeof width === 'undefined') {
                width = this.widthMarkers;
            }
            if (typeof height === 'undefined') {
                height = this.heightMarkers;
            }
            if (typeof iconPath === 'undefined') {
                iconPath = this.iconMarkers;

            }
            if (typeof width === 'undefined' || typeof height === 'undefined' || typeof iconPath === 'undefined') {
                throw "One value are not defined (width : " + width + ", height : " + height + ", icon : " + iconPath + ")";
            }
            var sizeMarker = new OpenLayers.Size(width, height);
            var offsetMarker = new OpenLayers.Pixel(-(sizeMarker.w / 2), -sizeMarker.h);
            return new OpenLayers.Icon(iconPath, sizeMarker, offsetMarker);
        };

        this.addMarker = function (longitude, latitude, icon) {
            var position = new OpenLayers.LonLat(longitude, latitude);
            var projection = position.transform($scope.projFrom, $scope.projTo);

            var marker = new OpenLayers.Marker(projection, icon.clone())
            this.layer.addMarker(marker);
            return marker;
        };
        this.removeMarker = function(marker){
            this.layer.removeMarker(marker);
        }
    })
    .directive("stratisMarkerLayer", function () {
        var template = "<div ng-transclude></div>";
        return {
            restrict: 'E',
            require: ["^stratisCarto", "stratisMarkerLayer"],
            transclude: true,
            controller: "MarkerLayerCtrl",
            template: template,
            scope: {
                layerName: "@",
                widthMarkers: "@",
                heightMarkers: "@",
                iconMarkers: "@"
            },
            link: {
                pre: function ($scope, element, attrs, ctrls) {
                    var cartoCtrl = ctrls[0];
                    var layerCtrl = ctrls[1];

                    //If layer defaults values are not defined, took defaults values of map
                    if (typeof $scope.widthMarkers === 'undefined' || $scope.widthMarkers == "") {
                        layerCtrl.widthMarkers = cartoCtrl.widthMarkers;
                    } else {
                        layerCtrl.widthMarkers = $scope.widthMarkers
                    }
                    if (typeof $scope.heightMarkers === 'undefined' || $scope.heightMarkers == "") {
                        layerCtrl.heightMarkers = cartoCtrl.heightMarkers;
                    } else {
                        layerCtrl.heightMarkers = $scope.heightMarkers
                    }
                    if (typeof $scope.iconMarkers === 'undefined' || $scope.iconMarkers == "") {
                        layerCtrl.iconMarkers = cartoCtrl.iconMarkers;
                    } else {
                        layerCtrl.iconMarkers = $scope.iconMarkers
                    }
                    layerCtrl.layer = cartoCtrl.addLayer("marker");
                },
                post : function($scope, element, attrs, ctrls) {
                    var cartoCtrl = ctrls[0];
                    var layerCtrl = ctrls[1];

                    element.bind('$destroy', function () {
                        cartoCtrl.map.removeLayer(layerCtrl.layer)
                    });
                }
            }
        }
    })
    .directive("stratisMarker", function () {
        return {
            require: "^stratisMarkerLayer",
            restrict: 'E',
            scope: {
                width: "=",
                height: "=",
                longitude: "=",
                latitude: "=",
                icon: "@"
            },
            link: function ($scope, element, attrs, layerCtrl) {
                var iconMarker = layerCtrl.createIconMarker($scope.width, $scope.height, $scope.icon);
                var marker = layerCtrl.addMarker($scope.longitude, $scope.latitude, iconMarker);

                element.bind('$destroy', function () {
                    layerCtrl.removeMarker(marker);
                });
            }
        }
    })

;