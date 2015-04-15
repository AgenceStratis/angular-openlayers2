angular.module("cartoControllers", ["cartoServices"])
    .controller("PageCtrl", function ($scope, $http) {

        $scope.newSource = true;
        $scope.first = true;

        $scope.changeSource = function () {
            if ($scope.first) {
                $scope.first = false;
            } else {
                $scope.close();
            }

            if ($scope.newSource) {
                $http.get("data2.json").then(function (result) {
                    $scope.layers = result.data;
                    $scope.currentLayer = result.data[0].name
                });
            } else {
                $http.get("data.json").then(function (result) {
                    $scope.layers = result.data;
                    $scope.currentLayer = result.data[0].name
                });
            }
            $scope.newSource = !$scope.newSource;
        };


        $scope.test = true;

        $scope.toggle = function () {
            var element = angular.element(document.getElementById("content"));
            if (element.hasClass("show")) {
                $scope.close();
            } else {
                $scope.open();
            }
        };

        $scope.close = function () {
            var element = angular.element(document.getElementById("content"));
            if (element.hasClass("show")) {
                element.removeClass("show");
                element.addClass("hide");
            }
            setTimeout(function(){
                $scope.currentDatas = "";
            }, 100);

        };

        $scope.open = function () {
            if($scope.currentDatas !== "") {
                var element = angular.element(document.getElementById("content"));
                element.addClass("show");
                element.removeClass("hide");
            }
        };

        $scope.currentLayer = "orange";

        $scope.style = function (feature) {
            feature.style.label = feature.attributes.name;
            feature.style.strokeColor = "pink";
        };

        $scope.currentDatas = "";

        $scope.onClick = function (event, olMarker, datas, markers) {
            var map = olMarker.map;
            map.panTo(olMarker.lonlat);
            var zoom = 4;
            if(map.getZoom() < zoom){
                setTimeout(function(){
                    map.zoomTo(zoom)
                }, 400);
            }
            $http.get("http://192.168.83.101:8888/carto-chateauroux/templates/test.php?id="+datas.id).then(
                function(result){
                    var element = angular.element(document.getElementById("content-container"));
                    element.html(result.data);
                    $scope.currentDatas = datas;

                    //$scope.$apply(); //Called from outside of Angular, so whe must explictly called $apply to update scope
                    $scope.open();
                }, function(error){
                    console.log(error);
                }
            );


        };

        $scope.changeSource();
    })
;