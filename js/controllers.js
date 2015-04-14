angular.module("cartoControllers", ["cartoServices"])
    .controller("PageCtrl", function ($scope, $http) {

        $scope.newSource = true;

        $scope.changeSource = function(){
            if($scope.newSource){
                $http.get("data2.json").then(function(result){
                    $scope.layers = result.data;
                    $scope.currentLayer= result.data[0].name
                });
            } else {
                $http.get("data.json").then(function (result) {
                    $scope.layers = result.data;
                    $scope.currentLayer= result.data[0].name
                });
            }
            $scope.newSource = !$scope.newSource;
        };
        $scope.changeSource();

        $scope.test = true;

        $scope.toggle = function(){
            $scope.test = !$scope.test;
        };

        $scope.currentLayer = "orange";

        $scope.style = function(feature){
            feature.style.label = feature.attributes.name;
            feature.style.strokeColor="pink";
        };

        $scope.onClick = function(olMarker, datas, markers){
            for (var marker in markers) {
                angular.element(markers[marker].icon.imageDiv).removeClass("selected")
            }
            angular.element(olMarker.icon.imageDiv).addClass("selected");
            popup = new OpenLayers.Popup("chicken",
                olMarker.lonlat,
                new OpenLayers.Size(200,200),
                datas.name,
                true);
            olMarker.map.addPopup(popup, true);

        }
    })
;