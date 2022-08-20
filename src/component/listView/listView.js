angular.module('conferenceApp')
    .directive('listViewRow', function() {
        return {
            restrict: 'AE',
            template: '',
            controller: function($scope, $element, $compile) {
                var strTemplate = '';
                $scope.record;
                angular.forEach($scope.columns, function(column, index) {
                    if (column.template)
                        strTemplate += '<td id=' + $scope.record.Id + '_' + column.name.split('.')[0] + ' data-th=' + column.label + '><span>' + column.template + '</span></td>';
                    else
                        strTemplate += '<td id=' + $scope.record.Id + '_' + column.name.split('.')[0] + ' data-th=' + column.label + '><span>' + (eval('$scope.record.' + column.name.split('.')[0]) != undefined ? eval('$scope.record.' + column.name) : '') + '</span></td>';
                });
                $element.append(strTemplate);
                $compile($element.contents())($scope);
            }
        }
    })
    .component('listView', {
        templateUrl: 'src/component/listView/listView.htm',
        controller: function($scope) {

            $scope.setTableData = function() {
                $scope.columns = $scope.$parent.columns;
                $scope.$on("tableData", function(evt,rows){ 
                    $scope.rows = rows;
                });
            }

            $scope.cancelReservation = function(record) {
                $scope.$emit('cancelReservation', record);
            }
            $scope.payDeposite = function(record) {
                $scope.$emit('payDeposite', record);
            }
            
            $scope.setTableData();
        }
    })