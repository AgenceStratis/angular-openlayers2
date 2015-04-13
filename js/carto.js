angular.module("carto", ["cartoControllers"])
    /**
     * Controler of stratis carto : Store the default value for the map
     * and provide method to add layers
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
                    layer = new OpenLayers.Layer.Markers(name, {});
                    break;
                case "kml":
                    layer = new OpenLayers.Layer.Vector(name, {});
                    break;
                default:
                    throw "Unknown type of layer"

            }
            this.map.addLayer(layer);
            return layer;
        };


    })

    .directive("stratisCarto", function () {
        //Second div exist to contains child elements
        var template = "<div class='container-carto max'></div><div ng-transclude=''></div>";
        return {
            restrict: 'E',
            template: template,
            require: "stratisCarto",
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

        /**
         * Create a icon marker use on the map
         * @param width
         * @param height
         * @param iconPath
         * @returns {OpenLayers.Icon}
         */
        this.createIconMarker = function (width, height, iconPath) {
            //Replace undefined values with default values
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
                throw "One or more values are not defined (width : " + width + ", height : " + height + ", icon : " + iconPath + ")";
            }
            var sizeMarker = new OpenLayers.Size(width, height);
            var offsetMarker = new OpenLayers.Pixel(-(sizeMarker.w / 2), -sizeMarker.h);
            return new OpenLayers.Icon(iconPath, sizeMarker, offsetMarker);
        };

        /**
         * Add a marker on the map and return it.
         * @param longitude
         * @param latitude
         * @param icon
         * @returns {OpenLayers.Marker}
         */
        this.addMarker = function (longitude, latitude, icon) {
            var position = new OpenLayers.LonLat(longitude, latitude);
            var projection = position.transform($scope.projFrom, $scope.projTo);

            var marker = new OpenLayers.Marker(projection, icon.clone())
            this.layer.addMarker(marker);
            return marker;
        };
        /**
         * Remove a marker from the map
         * @param marker
         */
        this.removeMarker = function (marker) {
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
                //Utilization of pre-link function due to AngularJS resolution order.
                //If it's a post-link function, values aren't available in the child link functions.
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
                post: function ($scope, element, attrs, ctrls) {
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
    .controller("kmlLayerCtrl", function ($scope, $http, $q) {
        var self = this;
        $scope.projFrom = new OpenLayers.Projection("EPSG:4326");
        $scope.projTo = new OpenLayers.Projection("EPSG:900913");


        /**
         * Update style of KML with style function provided
         * @param feature
         * @param functionStyle
         */
        this.updateFeatureStyle= function(feature, functionStyle) {
            if(typeof functionStyle !== 'undefined'){
                functionStyle(feature);
            }
        };

        /**
         * Add KML on the map from URL
         * @param kmlUrl
         * @param functionStyle
         * @returns {deferred.promise|{then, catch, finally}|l.promise}
         */
        this.addKML = function (kmlUrl, functionStyle) {
            var deferred = $q.defer();
            $http.get(kmlUrl).then(
                function (result) {
                    var kml = self.getFeaturesFromKMLString(result.data);
                    self.updateFeatureStyle(kml[0], functionStyle);
                    self.layer.addFeatures(kml);
                    deferred.resolve(kml);
                },
                function (error) {
                    console.log(error);
                    deferred.reject(error);

                }
            );
            return deferred.promise;
        };

        /**
         * Remove a KML from the Map
         * @param kml
         */
        this.removeKML = function (kml) {
            self.layer.removeFeatures(kml);
        };

        /**
         * Create a vecotr feature from the content of a KML file
         * @param strKML
         * @returns {*}
         */
        this.getFeaturesFromKMLString = function (strKML) {
            var format = new OpenLayers.Format.KML({
                'internalProjection': $scope.projTo,
                'externalProjection': $scope.projFrom,
                'extractStyles': true
            });
            return format.read(strKML);
        };


    })
    .directive("stratisKmlLayer", function () {
        var template = "<div ng-transclude></div>"
        return {
            restrict: 'E',
            require: ['^stratisCarto', 'stratisKmlLayer'],
            transclude: true,
            controller: "kmlLayerCtrl",
            template: template,
            scope: {},
            link: {
                //Utilization of pre-link function due to AngularJS resolution order.
                //If it's a post-link function, values aren't available in the child link functions.
                pre: function ($scope, element, attrs, ctrls) {
                    var cartoCtrl = ctrls[0];
                    var layerCtrl = ctrls[1];

                    layerCtrl.layer = cartoCtrl.addLayer("kml");
                },
                post: function ($scope, element, attrs, ctrls) {
                    var cartoCtrl = ctrls[0];
                    var layerCtrl = ctrls[1];


                    element.bind('$destroy', function () {
                        cartoCtrl.map.removeLayer(layerCtrl.layer)
                    });
                }

            }

        }
    })
    .directive("stratisKml", function () {
        return {
            restrict: 'E',
            require: '^stratisKmlLayer',
            transclude: true,
            scope: {
                url: "@",
                overrideStyleFunction:"="
            },
            link: function ($scope, element, attrs, layerCtrl) {
                layerCtrl.addKML($scope.url, $scope.overrideStyleFunction).then(
                    function (kml) {
                        element.bind('$destroy', function () {
                            layerCtrl.removeKML(kml);
                        });
                    }
                );


            }
        }
    })
;