angular.module('conferenceApp')
   .component('cancelReservation', {
        templateUrl: 'src/component/reservation/cancelReservation/cancelReservation.htm',
        controller: function cancelReservationController($scope, $element, apiCallout,  $error, $rootScope, blockUI, $location, $window, utils, $cookies) {
             $scope.isCancelModalOpen = true;
             $scope.cancellationReason ='';
             $scope.otherReason ='';
             $scope.errorMessage ='';
             $scope.noOfDays;
             $scope.reservationRecord =  $rootScope.reservationRecord;
             $scope.showPayAndCancelBtn = false;
             $scope.hideError = false;
             window.onhashchange = function() {
                $element.remove();
            }
            $rootScope.removeCancelReservationScreen = function(){
                $element.remove();
            }
            $scope.cancel = function() {
                $element.remove();
            }

            $scope.noOfDays = utils.daysBetweenV2(new Date(), new Date($scope.reservationRecord.Arrival_Date__c));
            if ($scope.reservationRecord.Reservation_Status__c == "Active" && $scope.reservationRecord.Reservation_Unit_Type__c == "RV Site" && $scope.reservationRecord.Reservation_Status__c != "Wait List" && $scope.noOfDays <= 2 ) {
                $scope.showPayAndCancelBtn = true;
                $scope.inventoryRates = {
                    Cancellation_Charges__c: true,
                    Reservation_Resort__c: $scope.reservationRecord.Resort__c
                }
                $scope.hideError = true;
                apiCallout.post($scope.inventoryRates, '/reservation/inventoryRates', { 'token': $cookies.get("token") }).then(function(response) {
                    if (!response.success) {
                        $scope.errorMessage = response.message;
                        $scope.hideError = false;
                        return;
                    }else{
                        $scope.errorMessage = null;
                        $scope.deposit = response.data.Rate__c;
                        if($scope.deposit && $scope.deposit != 0){
                            $scope.deposit = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(parseFloat($scope.deposit).toFixed(2));  
                        } else {
                            $scope.deposit = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(parseFloat(0).toFixed(2));  
                        }
                        $scope.hideError = true;   
                   }                                       
                }, function(response) {
                    blockUI.stop();
                    $scope.errorMessage = response.message;
                    $scope.hideError = false;
                    return;
                });
            }

            $scope.cancelReservation = function() {
                $scope.errorMessage = null;
                var requestData = {
                    Id: $scope.reservationRecord.Id,
                    Cancellation_Reason__c:  $scope.cancellationReason
                }

                if($scope.cancellationReason === 'Other'){
                    requestData.Cancellation_Reason__c = $scope.otherReason
                }

                $scope.noOfDays = utils.daysBetweenV2(new Date(), new Date($scope.reservationRecord.Arrival_Date__c));
                 if ($scope.noOfDays <= 2  && $scope.reservationRecord.Reservation_Status__c != "Wait List" && (($scope.reservationRecord.Reservation_Status__c === 'Active' && $scope.reservationRecord.Reservation_Unit_Type__c !== 'RV Site') || $scope.reservationRecord.Reservation_Status__c === 'Request')) {
                   return  $scope.errorMessage ='In order to cancel a reservation within 3 days from the arrival date, please call the OCP Reservations Team during business hours at (855) 872-1469.';
				 }
                 //Cancel Active RV Site reservation with cancellation charges.
                if ($scope.showPayAndCancelBtn && $scope.deposit) {
                    $scope.$emit('payAndCancel', requestData, $scope.reservationRecord, $scope.deposit);
                    $element.remove();
                    return;
                }

                apiCallout.put(requestData, '/reservation/cancel').then(function(response) {
                    if (response.success) {
                        if (response.data.length > 0) {
                            $error.showSuccess(response.message)
                             $element.remove();
                            window.location.reload();
                        }
                    } else {
                        $scope.errorMessage = response.message;
                        return;
                    }
                }, function(response) {
                    $scope.errorMessage = response.message;
                    return;
                });
            }
        }
    });
