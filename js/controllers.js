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



        $scope.currentLayer = "orange";
    })
;