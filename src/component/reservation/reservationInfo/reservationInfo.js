angular.module('conferenceApp')
    .component('reservationInfo', {
        templateUrl: 'src/component/reservation/reservationInfo/reservationInfo.htm',
        controller: function reservationInfoController($scope,utils, $rootScope, $compile, apiCallout, blockUI, $error,$cookies,$state, $location, $rootScope) {
            setInterval(myTimer, 420000);
            function myTimer() {
                var isActive =  document.getElementById("isActiveMainDiv");
                var isRequest =  document.getElementById("isRequestMainDiv");
                if(!isActive && !isRequest && !$scope.showPayment){
                    window.location.reload();
                }
            }

            $scope.showPayment = false;
            
            $scope.memberInfo = {};
            $scope.pageSize = "10";
            $scope.getMemberInfo = function() {
                apiCallout.get('/member').then(function(response) {
                    if (!response.success) {
                        blockUI.stop();
                        $error.showError(response.message);
                        return;
                    }
                    $scope.memberInfo = response.data;
                    if ($scope.memberInfo.RV_Site_Days_Advance_Reserve__c) {
                        var date = new Date();
                        date.setDate(date.getDate() + Number($scope.memberInfo.RV_Site_Days_Advance_Reserve__c));
                        $scope.memberInfo.Advance_up_to__c = date.toLocaleString('en-us', { month: 'long' }) + ' ' + date.getDate() + ' ' + date.getFullYear();
                    }  
                }, function(response) {
                    blockUI.stop();
                    $error.showError(response.message);
                    return;
                });
            }

            $scope.getReservations = function() {
                $scope.successMessage = null;
                $scope.rows = [];
                apiCallout.get('/reservation/history').then(function(response) {
                    if (!response.success) {
                        $scope.errorMessage = response.message;
                        return;
                    }
                    $scope.allRecords = response.data.reservations;
                    $scope.creditCardType = response.data.resortWithPaymentType;
                    $scope.totalRecordsCount = response.data.reservations.length;
                    $scope.getTableData(0);
                    return;
                }, function(response) {
                    $scope.errorMessage = response.message;
                    return;
                });
            }

            $scope.getTableData = function(page) {
                $scope.rows = [];
                $scope.allRecord = null;
                var offset = (page - 1) * $scope.pageSize;
                if (offset < 0) offset = 0; // if off set in negative vale then set 0
                $scope.allRecord = angular.copy($scope.allRecords);
                var recordsToShow = $scope.allRecord.slice(offset);
                for (var index = 0; index < $scope.pageSize; index++) {
                    if (recordsToShow.length - 1 >= index) {
                        recordsToShow[index].Arrival_Date__c = utils.formatDate(new Date(recordsToShow[index].Arrival_Date__c), "mm-dd-yyyy");
                        recordsToShow[index].Departure_Date__c = utils.formatDate(new Date(recordsToShow[index].Departure_Date__c), "mm-dd-yyyy");
                        $scope.rows.push(recordsToShow[index]);
                    }
                }
                $scope.$broadcast("tableData", $scope.rows);
                $scope.setPage(page, $scope.totalRecordsCount);
            }

            $scope.$on('cancelReservation', function(event, record) {
                if (record.Reservation_Status__c === 'Active' || record.Reservation_Status__c === 'Request' || record.Reservation_Status__c === 'Wait List'){
                     var cancellationScreen = angular.element('<cancel-reservation></cancel-reservation>');
                     cancellationScreen = $compile(cancellationScreen)($rootScope);
                     $rootScope.reservationRecord = record;
                     $('.' + $rootScope.callerClass).hide();
                     $('body').append(cancellationScreen);
                     return cancellationScreen;
                  }
            });

            //sets pagenation for table
            $scope.setPage = function(iPage, iTotalCount) {
                $scope.pageCount = Math.ceil(((iTotalCount) ? (iTotalCount == $scope.rows.length) ? $scope.rows.length : iTotalCount : $scope.rows.length) / $scope.pageSize);

                if ($scope.pageCount == 0) {
                    $scope.currentPage = 1;
                    $scope.pageCount = 1;
                    return;
                }
                if (iPage > $scope.pageCount)
                    iPage = $scope.pageCount;
                else if (iPage <= 0)
                    iPage = 1;
                if ($scope.pageCount == 0)
                    $scope.pageCount = 1;
                if (iPage > 0 && iPage <= $scope.pageCount) { $scope.currentPage = iPage; }
            }

            $scope.addPage = function(iCount) {
                $scope.checkPaginationEndPoint($scope.currentPage + iCount);
            }

            $scope.checkPaginationEndPoint = function(page) {
                if (page <= 0) { $scope.currentPage = 1; return; }
                if (page >= $scope.pageCount + 1) { $scope.currentPage = $scope.pageCount; return; }
                if ($scope.currentPage == page) { $scope.currentPage = page; return; }
                $scope.getTableData(page);
            }

            $scope.columns = [
                { name: 'Name', label: 'Reservation', template: '', templateUrl: '', width: 15 },
                { name: 'Arrival_Date__c', label: 'Arriving', template: '', templateUrl: '', width: 15 },
                { name: 'Departure_Date__c', label: 'Leaving', template: '', templateUrl: '', width: 15 },
                { name: 'Reservation_Resort__c', label: 'Resort', template: '', templateUrl: '', width: 15 },
                { name: 'Reservation_Unit_Type__c', label: 'Unit Type', template: '', templateUrl: '', width: 15 },
                { name: 'Reservation_Status__c', label: 'Status', template: '', templateUrl: '', width: 15 },
                { name: '', label: 'Action', template: '<div><a  ng-If ="record.Reservation_Status__c == \'Active\' || record.Reservation_Status__c == \'Request\' || record.Reservation_Status__c == \'Wait List\'"  href="" ng-click="cancelReservation(record)">Cancel</a> <a  ng-If ="record.Reservation_Status__c == \'Temporary\'"  href="" ng-click="payDeposite(record)">Pay Deposit</a> <div ng-If ="record.Reservation_Status__c == \'Cancelled\' || record.Reservation_Status__c == \'Checked In\' || record.Reservation_Status__c == \'Checked Out\' || record.Reservation_Status__c == \'No Show\'||record.Reservation_Status__c == \'Planned\'||record.Reservation_Status__c == \'Moved\' || record.Reservation_Status__c == \'Marketing Request\'">Cancel</div></div>', templateUrl: '' }
            ];
            var token = $cookies.get('token')
            if (token === undefined || token === null) {
                $state.go('login');
            } else {
                $scope.getMemberInfo();
                $scope.getReservations();
            }

            $scope.activeReservation = function() {
                for (var prop in $rootScope) {
                    if (prop.substring(0,1) !== '$') {
                        delete $rootScope[prop];
                    }
                }
                $location.path('/home/activeReservation');
            }

            $scope.requestReservation = function() {
                    $location.path('/home/requestReservation');
            }

            $scope.$on('payDeposite', function(event, record) {
                $scope.cardTypes = angular.copy($scope.creditCardType);
                $scope.cardTypes = $scope.cardTypes.filter(function (resort) {
                    return resort.Id === record.Resort__c;
                });
                $scope.cardType = [];
                $scope.cardTypes[0].Payment_Types__r.forEach(function(paymentType) {
                    $scope.cardType.push(paymentType.Name);
                });
                if(record.Invoice_Items__r && record.Invoice__c && record.Id && $scope.cardType) {
                    $scope.activeReservationRslt= [];
                    $scope.activeReservationRslt.push({'Invoice_Item__c': record.Invoice_Items__r});
                    $scope.activeReservationRslt.push({'Invoice__c': {id:record.Invoice__c}});
                    $scope.activeReservationRslt.push({'Reservation__c':{id:record.Id}})
                    $rootScope.reservationRecord = $scope.activeReservationRecord;
                    $rootScope.activeReservationRslt =  $scope.activeReservationRslt;
                    $rootScope.creditCardType = $scope.cardType;
                    $rootScope.resort = record.Resort__c;
                    $rootScope.deposit = record.Pay_Deposit_by_Member_Portal__c;
                    $location.path('/home/payment');
                }
            });

            //Added below methods ( setCreditCardSpecifications(), creditCardTypeChanged(), payAndCancelReservation(), cancelPayment()) to pay and cancel Active RV Reservation.
            $rootScope.$on('payAndCancel', function(event, requestData, reservationRecord, deposite) {
                $scope.reservationRecord = reservationRecord;
                $scope.requestData = requestData;
                $scope.deposit = deposite;
                $scope.showPayment = true;
                $scope.setCreditCardSpecifications();
            });

            $scope.setCreditCardSpecifications = function() {
                $scope.cardTypes = angular.copy($scope.creditCardType);
                $scope.cardTypes = $scope.cardTypes.filter(function (resort) {
                    return resort.Id === $scope.reservationRecord.Resort__c;
                });
                $scope.cardType = [];
                $scope.cardTypes[0].Payment_Types__r.forEach(function(paymentType) {
                    $scope.cardType.push(paymentType.Name);
                });

                $scope.creditCardNumberDigits = 16;
                $scope.cvvDigits = 3;
                $scope.years = [];
                var  currentYear= new Date().getFullYear();
                $scope.years.push(currentYear);
                for(var index = 1; index < 10 ; index ++){
                    $scope.years.push(currentYear + index);
                }
                $scope.months= [];
                var  currentYear= new Date().getFullYear();
                for(var index = 1; index <= 12 ; index ++){
                    $scope.months.push(index);
                }
                document.getElementById("Name_on_Credit_Card__c").required = true; 
                document.getElementById("Credit_Card_Type__c").required = true;
                document.getElementById("Credit_Card_Number__c").required = true;
                document.getElementById("expM").required = true;
                document.getElementById("expY").required = true; 
                document.getElementById("CVV").required = true;
                document.getElementById("zipcode").required = true;
            }

            $scope.creditCardTypeChanged = function() {
                $scope.Credit_Card_Number__c = undefined;
                $scope.Credit_Card_CVV__c = undefined;
                if ($scope.Credit_Card_Type__c == 'American Express') {
                    $scope.creditCardNumberDigits = 15;
                    $scope.cvvDigits = 4;
                } else {
                    $scope.creditCardNumberDigits = 16;
                    $scope.cvvDigits = 3;
                }
            }

            $scope.payAndCancelReservation = function(){
                $scope.errorMessage = undefined;
                var currentDate = new Date();
                var currentMonth = currentDate.getMonth()+1;
                var currentYear = currentDate.getFullYear();
                var ccMonth = Number($scope.Credit_Card_Exp_Month__c); 
                var ccYear = Number($scope.Credit_Card_Exp_Year__c); 
                if(ccYear < currentYear || (ccYear === currentYear &&  ccMonth < currentMonth)){
                    $scope.errorMessage = 'The credit card has expired.';
                    return;
                }

                var amount = Number($scope.deposit.replace(/[^0-9.-]+/g,""));
                $scope.payment ={
                    'Credit_Card_CVV__c': $scope.Credit_Card_CVV__c,
                    'Credit_Card_Exp_Month__c': $scope.Credit_Card_Exp_Month__c,
                    'Credit_Card_Exp_Year__c': $scope.Credit_Card_Exp_Year__c,
                    'Credit_Card_Number__c': $scope.Credit_Card_Number__c,
                    'Credit_Card_Type__c': $scope.Credit_Card_Type__c,
                    'Amount__c': +amount,
                    'Name_on_Credit_Card__c': $scope.Name_on_Credit_Card__c,
                    'Postal_Code__c': $scope.Postal_Code__c,
                    'Resort': $scope.reservationRecord.Resort__c
                }

                $scope.payAndCancelRequestBody = {
                    'Id': $scope.requestData.Id,
                    'Cancellation_Reason__c': $scope.requestData.Cancellation_Reason__c,
                    'paymentDetails':$scope.payment
                }
                $rootScope.$broadcast("processing", "Processing Transaction");
                apiCallout.put($scope.payAndCancelRequestBody, '/reservation/cancel', { 'token': $cookies.get("token") }).then(function(response) {
                    if (!response.success) {
                        $rootScope.$broadcast("stopProcessing");
                        $scope.errorMessage = response.message;
                        return;
                    }
                    $rootScope.$broadcast("stopProcessing"); 
                    $error.showSuccess(response.message);
                    window.location.reload();
                }, function(response) {
                    $rootScope.$broadcast("stopProcessing");
                    $scope.errorMessage = response.message;
                    return;
                });
            }

            $scope.cancelPayment = function() {
                window.location.reload();
            }
        }
    })