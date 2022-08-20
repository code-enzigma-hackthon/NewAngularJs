angular.module('conferenceApp')
    .component('requestReservation', {

        templateUrl: 'src/component/reservation/requestReservation/requestReservation.htm',
        controller: function requestReservationController($scope,$rootScope, $cookies, apiCallout, utils, $location, blockUI, $error) {
            window.onhashchange = function() {
                var url = $location.url();
                if(!(url.includes("requestReservation"))){
                    $("#ui-datepicker-div").remove();
                } else {
                    var element =  document.getElementById("arivalId");
                    if(element) {
                        $("#ui-datepicker-div").hide();
                    }else {
                        $("#ui-datepicker-div").remove();
                    }
                    var cancelWindow =  document.getElementById("mobileCancelRes");
                    if(cancelWindow) {
                        $rootScope.removeCancelReservationScreen();
                    } 
                }
            }

            $("#arivalId").keydown(function (event) { 
                event.preventDefault(); 
            });
            $("#departureId").keydown(function (event) { 
                event.preventDefault(); 
            });

            $rootScope.updateRVInfo = false;
            $scope.displayStorage = false;
            $scope.UnitTypeshow = false;
            $scope.rvInfoShow = false;
            $scope.showGuest = false;
            $scope.showunit = false;
            $scope.errorAlert = null;
            $scope.hideResunit = true;
            $scope.addDetails = '';
            $scope.reservationNotes = '';
            $scope.notes='';
            var arrMin = new Date();
            var arivalMinDate = utils.formatDate(new Date(), "yyyy-mm-dd");
            var arivalMin = document.getElementById('arivalId');
            arivalMin.setAttribute('min', arivalMinDate);
            var tomorrowsDate = new Date();
            tomorrowsDate.setDate(tomorrowsDate.getDate() + 1);
            var departureMinDate = utils.formatDate(tomorrowsDate, "yyyy-mm-dd");
            var departureMin = document.getElementById('departureId');
            departureMin.setAttribute('min', departureMinDate);
            $scope.rvPickList = [];

            $scope.RVInfoIncomplete = false;
            $scope.departureMinDate = new Date();

            $(function() {
                function availableDept(date) {
                    if($scope.departureMinDate >= date) {
                        return [false, "custom-css-available","Unavailable"];
                    } else {
                        return [true, "custom-css-available","Available"];
                    }
                }
                $( "#arivalId" ).datepicker({
                    dateFormat:"mm/dd/yy",
                    minDate: new Date()
                });
            
                $("#arivalId").on("change", function (e) {
                $scope.Arrival_Date__c = new Date(this.value);
                $scope.departureMinDate = new Date(this.value);
                if($scope.Departure_Date__c) {
                    if($scope.Arrival_Date__c >= $scope.Departure_Date__c) {
                        $scope.Departure_Date__c = null;
                        document.getElementById("departureId").value = "";
                    }
                }
                $scope.$apply();
                });
    
                $("#departureId" ).datepicker({
                    dateFormat:"mm/dd/yy",
                    minDate: new Date(new Date().setDate(new Date().getDate() + 1)),
                    beforeShowDay: availableDept
                });

                $("#departureId").on("change", function (e) {
                    $scope.Departure_Date__c = new Date(this.value);
                    $scope.$apply();
                });
            });

            $scope.getResort = function() {
                apiCallout.get('/resort').then(function(response) {
                    if (!response.success) {
                        blockUI.stop();
                        $error.showError(response.message);
                        return;
                    };
                    $scope.resorts = response.data.Resorts;
                    $scope.ReservationMemberTypes = response.data.ReservationMemberType;
                    $scope.UnitTypes = response.data.UnitTypes;
                    $scope.getMemberInfo();
                    $scope.getRVInfo();
                }, function(response) {
                    blockUI.stop();
                    $error.showError(response.message);
                    return;
                });
            }

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
                        var arivalMaxDate = utils.formatDate(date, "yyyy-mm-dd");
                        var arivalMax = document.getElementById('arivalId');
                        arivalMax.setAttribute('max', arivalMaxDate);

                        var advanceDays = new Date();
                        advanceDays.setDate(advanceDays.getDate() + Number($scope.memberInfo.RV_Site_Days_Advance_Reserve__c));
                        $scope.memberInfo.Advance_up_to__c = advanceDays.toLocaleString('en-us', { month: 'long' }) + ' ' + advanceDays.getDate() + ', ' + advanceDays.getFullYear();
                    }
                    $scope.copyMemInfo = angular.copy(response.data);                 
                }, function(response) {
                    blockUI.stop();
                    $error.showError(response.message);
                    return;
                });
            }

            $scope.createreservation = function() {
                $scope.errorMessage = null;
                $scope.addDetails = '';
                $scope.notes = '';
                $scope.reservationReqRecord = {};
                $scope.errorAlert = null;
                var newDate = new Date();
                newDate.setHours(0, 0, 0, 0);

                if(!$scope.Arrival_Date__c || !$scope.Departure_Date__c){
                    $scope.errorMessage = "Arrival Date and Deparature Date are required";
                    return;
                }
                
                if ($scope.Arrival_Date__c < newDate) {
                    $scope.errorMessage = "Arrival date must be greater than today.";
                    return;
                }
                if ($scope.Departure_Date__c <= $scope.Arrival_Date__c) {
                    $scope.errorMessage = "Departure date must be greater than Arrival date";
                    return;
                }
                if (!$scope.Accommodation_Type__c) {
                    $scope.errorMessage = "No Unit Types are available for this Resort.";
                    return;
                }
                if($scope.memberInfo.Max_Days_In__c) {
                    var millisecondsPerDay = 1000 * 60 * 60 * 24;
                    var millisBetween = $scope.Departure_Date__c.getTime() - $scope.Arrival_Date__c.getTime();
                    var days = millisBetween / millisecondsPerDay;
                    if( days > $scope.memberInfo.Max_Days_In__c ) {
                        $scope.errorMessage = "Your membership type allows you to make max RV stays for " + $scope.memberInfo.Max_Days_In__c + " days. Please makes changes in the dates to create a reservation.";
                        return;
                     }
                }
                $scope.arrivalDate = utils.dateConversion($scope.Arrival_Date__c, "dd/mm/yyyy");
                $scope.departureDate = utils.dateConversion($scope.Departure_Date__c, "dd/mm/yyyy");
                if($scope.reservationNotes){
                    $scope.notes = ' -Notes:'+$scope.reservationNotes
                }               
                $scope.reservationReqRecord = {
                    'Reservation_Member_Type__c': $scope.Reservation_Member_Type__c,
                    'How_Many_People__c': $scope.How_Many_People__c,
                    'Arrival_Date__c': $scope.arrivalDate,
                    'Departure_Date__c': $scope.departureDate,
                    'Reservation_Resort__c': $scope.Reservation_Resort__c,
                    'Reservation_Unit_Type__c': $scope.Reservation_Unit_Type__c,
                    'Accommodation_Type__c': $scope.Accommodation_Type__c,
                }
                if ($scope.Reservation_Unit_Type__c === "RV Site") {
                    if(!($scope.memberInfo.RV_Type__c&&$scope.memberInfo.RV_Length__c&&$scope.memberInfo.No_of_Slide_Outs__c&&$scope.memberInfo.RV_Electrical__c)) {
                        $scope.errorMessage = "Your RV Information is Incomplete. Please update it before proceeding.";
                        return;
                    }
                    if($scope.displayStorage && $scope.Pull_Out){
                        $scope.Pull_Out__c = true;
                    }
                    if($scope.displayStorage && $scope.Pull_In){
                        $scope.Pull_In__c = true;
                    }
                    if($scope.memberInfo.RV_Electrical__c == "50amp"){
                        $scope.Request_50_Amp_Service__c = true;
                        $scope.addDetails =  $scope.addDetails +'-Amperage Requested:50 Amp'
                    }else if($scope.memberInfo.RV_Electrical__c == "30amp"){
                        $scope.Request_50_Amp_Service__c = false;
                        $scope.addDetails =  $scope.addDetails +'-Amperage Requested:30 Amp'
                    }
                    if($scope.Request_Pull_Through__c){
                        $scope.addDetails =  $scope.addDetails+' -Requested Pull-Through:Yes';
                    }     
                    if($scope.displayStorage){
                        $scope.addDetails = $scope.addDetails +' -RV in the Resort Storage:Yes';
                    }                                                   
                    $scope.reservationReqRecord.Request_Pull_Through__c = $scope.Request_Pull_Through__c;
                    $scope.reservationReqRecord.Request_50_Amp_Service__c = $scope.Request_50_Amp_Service__c;
                    $scope.reservationReqRecord.Pull_Out__c = $scope.Pull_Out__c;
                    $scope.reservationReqRecord.Pull_In__c = $scope.Pull_In__c;
                    $scope.reservationReqRecord.No_of_Slide_Outs__c = $scope.memberInfo.No_of_Slide_Outs__c;
                    $scope.reservationReqRecord.RV_Length__c = $scope.memberInfo.RV_Length__c;
                    $scope.reservationReqRecord.RV_Type__c = $scope.memberInfo.RV_Type__c;
                    $scope.reservationReqRecord.Vehicle_Plate__c = $scope.memberInfo.Vehicle_Plate__c;
                    $scope.reservationReqRecord.RV_Electrical__c = $scope.memberInfo.RV_Electrical__c;
                    $scope.reservationReqRecord.Reservation_Notes__c = $scope.addDetails + $scope.notes;
                } else {
                    if($scope.Require_Disability_Unit__c){
                        $scope.addDetails =  $scope.addDetails+'-Disability Unit:Yes';
                    }               
                    $scope.reservationReqRecord.Pet__c = $scope.Pet__c,
                    $scope.reservationReqRecord.Require_Disability_Unit__c = $scope.Require_Disability_Unit__c;
                    $scope.reservationReqRecord.Reservation_Notes__c = $scope.addDetails + $scope.notes;
                }
                if($scope.Member_Associate_Guest_Name__c && $scope.showGuest) {
                    $scope.reservationReqRecord['Member_Associate_Guest_Name__c'] = $scope.Member_Associate_Guest_Name__c;
                };
                apiCallout.post($scope.reservationReqRecord, '/reservation/request', { 'token': $cookies.get("token") }).then(function(response) {
                    if (!response.success) {
                        blockUI.stop();
                        if(response.message.includes("FIELD_CUSTOM_VALIDATION_EXCEPTION") && response.message.includes("ZIP")) {
                            response.message = "We cannot find ZIP code for Reciprocal Type. Kindly, contact to Member Service Team at  888-567-5941.";
                        }
                        $scope.errorMessage = response.message;
                        return;
                    }
                    $error.showSuccess(response.message);
                    $location.path('/home/reservationInfo');
                }, function(response) {
                    blockUI.stop();
                    if(response.message.includes("FIELD_CUSTOM_VALIDATION_EXCEPTION") && response.message.includes("ZIP")) {
                        response.message = "We cannot find ZIP code for Reciprocal Type. Kindly, contact to Member Service Team at  888-567-5941.";
                    }
                    $scope.errorMessage = response.message;
                    return;
                });
            }

            $scope.memberTypeChanged = function() {
                $scope.addDetails = '';
                $scope.notes = '';
                if($scope.Reservation_Member_Type__c === "Associate" || $scope.Reservation_Member_Type__c === "Guest") {
                    if(!$scope.memberInfo.Member_Associate_Guest_Reciprocal__r) {
                        blockUI.stop();
                        $error.showWarning('No guest found.');
                        $scope.showGuest = false;
                    } else {
                        $scope.showGuest = true;
                        document.getElementById("guest").required = true;
                    }
                }else{
                    $scope.showGuest = false;
                    document.getElementById("guest").required = false;
                } 
            }

            $scope.cancelReservation = function() {
                $location.path('/home/reservationInfo');
            }

            $scope.resortChanged = function() {
                $scope.Accommodation_Unit__c = null;
                $scope.showunit = false;
                $scope.hideResunit = true;
                $scope.rvInfoShow = false;
                $scope.UnitTypeshow = false;
                $scope.errorMessage = null;
                $scope.UnitTypesForSelResort = $scope.UnitTypes.filter(function (unit) {
                    return unit.Resort__c === $scope.Reservation_Resort__c;
                });
                if(!$scope.UnitTypesForSelResort.length) {
                    $scope.errorAlert = 'No Unit Types are available for this Resort.';
                    document.getElementById("unitType").required = false;
                    return;
                };
                $scope.Pet__c = undefined;
                $scope.Pull_Out = undefined;
                $scope.Pull_In = undefined;
                $scope.Require_Disability_Unit__c = undefined;
                $scope.storage = undefined;
                $scope.displayStorage = false;
                $scope.Request_Pull_Through__c = undefined;
                $scope.Request_50_Amp_Service__c = undefined;
                document.getElementById('storage').selectedIndex=0;
                document.getElementById('pets').selectedIndex=0;
                document.getElementById('disabilityUnits').selectedIndex=0;
                $scope.pet = undefined;
                $scope.disabilityUnits = undefined;
                $scope.reservationNotes = undefined;
                $scope.showunit =true;
                document.getElementById("unitType").required = true;
                $scope.hideResunit = false;
                $scope.errorAlert = null;
                if($scope.copyMemInfo.RV_Electrical__c){
                    $scope.memberInfo.RV_Electrical__c = $scope.copyMemInfo.RV_Electrical__c;
                }
            }

            $scope.unitTypeChanged = function() {             
                $scope.Pet__c = undefined;
                $scope.Pull_Out = undefined;
                $scope.Pull_In = undefined;
                $scope.Require_Disability_Unit__c = undefined;
                $scope.storage = undefined;
                $scope.displayStorage = false;
                $scope.Request_Pull_Through__c = undefined;
                $scope.Request_50_Amp_Service__c = undefined;
                document.getElementById('storage').selectedIndex=0;
                document.getElementById('pets').selectedIndex=0;
                document.getElementById('disabilityUnits').selectedIndex=0;
                $scope.pet = undefined;
                $scope.disabilityUnits = undefined;
                $scope.reservationNotes = undefined;    
                if($scope.UnitTypes&& $scope.Accommodation_Type__c){
                    $scope.selectedUnitType = $scope.UnitTypes.filter(function (unit) {
                        return unit.Id === $scope.Accommodation_Type__c
                    });
                    if($scope.selectedUnitType && $scope.selectedUnitType[0].Reservation_Accommodation_Type__c) {
                        $scope.Reservation_Unit_Type__c = $scope.selectedUnitType[0].Reservation_Accommodation_Type__c;
                    }
                    $scope.errorAlert = null;
                    $scope.errorMessage = null;
                    if($scope.Reservation_Unit_Type__c) {
                        if ($scope.Reservation_Unit_Type__c == "RV Site") {                   
                            $scope.rvInfoShow = true;
                            if ($scope.storage == "yes") {
                                $scope.displayStorage = true;
                            } else {
                                $scope.displayStorage = false;
                                $scope.Pull_Out = false;
                                $scope.Pull_In = false;
                            }
                            $scope.UnitTypeshow = false;
                        } else {
                            $scope.rvInfoShow = false;
                            $scope.UnitTypeshow = true;
                        }
                    }
                }
            }
            $scope.storageChanged = function() {
                if ($scope.storage == "yes") {
                    $scope.displayStorage = true;
                } else {
                    $scope.displayStorage = false;
                    $scope.Pull_Out = false;
                    $scope.Pull_In = false;
                }
            };
            $scope.bringingPet = function() {
                if ($scope.pet == "yes") {
                    $scope.Pet__c = true;
                } else {
                    $scope.Pet__c = false;
                }
            };
            $scope.disabilityUnit = function() {
                if ($scope.disabilityUnits == "yes") {
                    $scope.Require_Disability_Unit__c = true;
                } else {
                    $scope.Require_Disability_Unit__c = false;
                }
            };
            $scope.amperage = function() {
                if ($scope.memberInfo.RV_Electrical__c == "50amp") {
                    $scope.Request_50_Amp_Service__c = true;
                } else  if ($scope.memberInfo.RV_Electrical__c == "30amp"){
                    $scope.Request_50_Amp_Service__c = false;
                }
            };

            $scope.getRVInfo = function() {
                var describeObject = [{
                        objectName: 'Account',
                        fields: ['RV_Type__c','RV_Electrical__c']
                    }
                ]
                apiCallout.post(describeObject, '/metadata/describeObject', { 'token': $cookies.get("token") }).then(function(response) {
                    if (response.success) {
                        if (response.data.length > 0) {
                            $scope.desObj = angular.copy(response.data);
                            $scope.getPickListValues();
                        }
                    } else {
                        $error.showError(response.message);
                        return;
                    }
                }, function(response) {
                    $error.showError(response.message);
                    return;
                });
            }

            $scope.getPickListValues = function() {
                $scope.desObj.forEach(function(objects) {
                    if (objects.Account) {
                        if (objects.Account.RV_Type__c) {
                            if (objects.Account.RV_Type__c.picklistValues) {
                                $scope.rvPickList = objects.Account.RV_Type__c.picklistValues;
                            }
                        }
                        if (objects.Account.RV_Electrical__c) {
                            if (objects.Account.RV_Electrical__c.picklistValues) {
                                $scope.rvElectrical = objects.Account.RV_Electrical__c.picklistValues;
                            }
                        }
                    }
                });
            }
            $scope.updateRvInfo = function(){
                $rootScope.updateRVInfo = true;
                $location.path('/home/memberInfo');
            }
            document.addEventListener("scroll", function() {
                document.activeElement.blur();
            });
            $scope.invalidChars = ["-","+","e"];          
            party.addEventListener("keydown", function(e) {
                if ($scope.invalidChars.includes(e.key)) {
                    e.preventDefault();
                }
            });
            var token = $cookies.get('token')
            if (token === undefined || token === null) {
                $location.path('/login');
            } else {
                $scope.getResort()
            }
        }
    });