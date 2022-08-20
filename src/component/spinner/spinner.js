angular.module('conferenceApp')
    .component('spinner', {
        templateUrl: 'src/component/spinner/spinner.htm',
        controller: function spinnerController($scope) {
            $scope.$on("processing", function (evt, data) {
                $scope.showProcessing(data);
            });
            $scope.$on("stopProcessing", function (evt, data) {
                $scope.hideProcessing();
            });
            
            $scope.showProcessing = function(spanText){
                if (spanText) {
                    document.getElementById("spanText").innerHTML = spanText;
                }
                $('#spinnerContainer').fadeIn();
            } 
            $scope.hideProcessing = function(spanText){
                $('#spinnerContainer').fadeOut();
            }                  
        }
    });
