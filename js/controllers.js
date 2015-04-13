angular.module("cartoControllers", ["cartoServices"])
    .controller("PageCtrl", function ($scope, $http) {
        $scope.orange = [
            {longitude: "5", latitude: "43"},
            {longitude: "24", latitude: "20"},
            {longitude: "34", latitude: "43"},
            {longitude: "2.92", latitude: "3"}
        ];

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
            //feature.style.fontColor = "red";
            //feature.style.labelXOffset = 10;
            //feature.style.labelYOffset = -10;
        }
    })
;