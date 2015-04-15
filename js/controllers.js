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
            setTimeout(1, function(){
                $scope.currentDatas = "";
            });

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

        $scope.onClick = function (olMarker, datas, markers) {
            for (var marker in markers) {
                angular.element(markers[marker].icon.imageDiv).removeClass("selected")
            }
            angular.element(olMarker.icon.imageDiv).addClass("selected");
            $scope.currentDatas = datas;
            $scope.$apply(); //Called from outside of Angular, so whe must explictly called $apply to update scope
            $scope.open();
        };

        $scope.changeSource();
    })
;