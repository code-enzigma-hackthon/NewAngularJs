angular.module('conferenceApp')
.component('activeReservation', {
    templateUrl: 'src/component/reservation/activeReservation/activeReservation.htm',
    controller: function activeReservationController($scope, $location, utils, apiCallout, blockUI, $error,$cookies,$rootScope) {
        $scope.showPayment = false;
        var todasDate = new Date();
        var arivalMinDate = utils.formatDate(todasDate, "yyyy-mm-dd");
        var arivalMin = document.getElementById('arivalId');
        arivalMin.setAttribute('min', arivalMinDate);
        var tomoravailabelUnitTypeDate = new Date();
        tomoravailabelUnitTypeDate.setDate(tomoravailabelUnitTypeDate.getDate() + 1);
        var departureMinDate = utils.formatDate(tomoravailabelUnitTypeDate, "yyyy-mm-dd");
        var departureMin = document.getElementById('departureId');
        departureMin.setAttribute('min', departureMinDate);

        $scope.departureMinimumDate = new Date();
        $scope.departureMinimumDateRv = new Date();

        $scope.availabelUnitType = [];
        $scope.errorMessage = null;
        $scope.rvErrorMessage = null;
        $scope.petErrorMessage = null;
        $scope.ocpResorts = [];
        $scope.gatawayResorts = [];
        $scope.Reservation_Member_Type__c = "Member";
        $scope.isCancel = false;
        $scope.isReservationCreated = false;
        $scope.petRequireErrorMessage = null;
        $scope.ConfirmReservation = false;
        $scope.reservationInfo = false;
        $scope.reservationErrorMessage = null;
        $scope.showAvailabilitybtn = false;
        $scope.isWaitList = false;
        $scope.blockDateSelected = false;
        $scope.blockDateError = null;
        $rootScope.maxRVDate = $cookies.get('maxRVDate')
        $rootScope.maxRVShowDate = $cookies.get('depRVShowMax')
        $rootScope.maxRVShowDateArrival = $cookies.get('arrivalShowMax')
        if($rootScope.maxRVDate && $rootScope.maxRVShowDate && $rootScope.maxRVShowDateArrival){
            $scope.maxRVDate = $rootScope.maxRVDate;
            $scope.maxRVDateShow = $rootScope.maxRVShowDate;
            $scope.maxRVShowDateArrival = $rootScope.maxRVShowDateArrival;
        }      
        if($rootScope.showPaymentToCollectDeposit == true){
            $scope.showPayment = true;
            $scope.collectDeposit = true;
            $scope.activeReservationRecord = angular.copy($rootScope.activeReservationRecord);
        }
        window.onhashchange = function() {
            var url = $location.url();
            if(!(url.includes("activeReservation"))){
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

        $(function() {
            function availableRvDept(date) {
                if($scope.departureMinimumDateRv >= date) {
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
            $scope.departureMinimumDateRv = new Date(this.value);
            if($scope.Departure_Date__c) {
                if($scope.Arrival_Date__c >= $scope.Departure_Date__c) {
                    $scope.Departure_Date__c = null;
                    document.getElementById("departureId").value = "";
                }
            }
            $scope.showGrid = false;
            angular.element($("#arivalId")).scope().searchCriteriaChanged();
            $scope.$apply();
            });

            $("#departureId" ).datepicker({
                dateFormat:"mm/dd/yy",
                minDate: new Date(),
                beforeShowDay: availableRvDept
            });
            $("#departureId").on("change", function (e) {
            $scope.Departure_Date__c = new Date(this.value);
            $scope.showGrid = false;
            $scope.$apply();
            });
        });
        /*RV Date Picker */
        $(function() {
            function availableArrival(date) {
                dmy = date.getDate() + "-" + (date.getMonth()+1) + "-" + date.getFullYear();
                if ($.inArray(dmy, $scope.availableDates) != -1) {
                    return [true, "custom-css-available","Available"];
                }else if ($.inArray(dmy, $scope.blockedDates) != -1) {
                    return [false, "custom-css-blocked","Dates are blocked"];
                }else if ($.inArray(dmy, $scope.notAvailableDates) != -1) {
                    return [true, "custom-css-not-available","Unavailable"];
                }else {
                    return [false,"custom-css-invalid","Unavailable"];
                }
            }
            function availableDept(date) {
                if($scope.departureMinimumDate >= date) {
                    return [false, "custom-css-available","Unavailable"];
                }
                nxtDay = new Date().getDate() + "-" + (new Date().getMonth()+1) + "-" + new Date().getFullYear();
                dmy = date.getDate() + "-" + (date.getMonth()+1) + "-" + date.getFullYear();
                if(nxtDay === dmy && $.inArray(dmy, $scope.availableDates) != -1){
                    return [false,"custom-css-invalid","Available"];
                }else if ($.inArray(dmy, $scope.availableDates) != -1) {
                    return [true, "custom-css-available","Available"];
                }else if ($.inArray(dmy, $scope.blockedDates) != -1) {
                    return [false, "custom-css-blocked","Dates are blocked"];
                }else if ($.inArray(dmy, $scope.notAvailableDates) != -1) {
                    return [true, "custom-css-not-available","Unavailable"];
                } else {
                    return [false,"custom-css-invalid","Unavailable"];
                }           
            }
            $( "#rvArivalId" ).datepicker({ 
                minDate: new Date(),
                maxDate: new Date($scope.maxRVShowDateArrival),
                beforeShowDay: availableArrival
            });
            $("#rvArivalId").on("change", function (e) {
                $scope.RV_Arrival_Date__c = new Date(this.value);
                $scope.departureMinimumDate = new Date(this.value);
                if($scope.RV_Departure_Date__c) {
                    if($scope.RV_Arrival_Date__c >= $scope.RV_Departure_Date__c) {
                        $scope.RV_Departure_Date__c = null;
                        document.getElementById("rvDepartureId").value = "";
                    }
                }
                angular.element($("#rvArivalId")).scope().rvDateCheck();
                $scope.$apply();
            });
            $( "#rvDepartureId" ).datepicker({ 
                minDate: new Date(new Date().setDate(new Date().getDate() + 1)),
                maxDate: new Date($scope.maxRVDateShow), 
                beforeShowDay: availableDept
            });
            $("#rvDepartureId").on("change", function (e) {
                $scope.RV_Departure_Date__c = new Date(this.value);
                angular.element($("#rvDepartureId")).scope().rvDateCheck();
                $scope.$apply();
            });
        });

        $scope.getResort = function() {
            apiCallout.get('/resort?reservationType=active').then(function(response) {
                if (!response.success) {
                    blockUI.stop();
                    $error.showError(response.message);
                    return;
                }
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
                $scope.memberInfo = angular.copy(response.data);
                $scope.rvMemberInfo = angular.copy(response.data);
                if ($scope.memberInfo.RV_Site_Days_Advance_Reserve__c) {
                    var date = new Date();
                    date.setDate(date.getDate() + Number($scope.memberInfo.RV_Site_Days_Advance_Reserve__c));
                    var arivalMaxDate = utils.formatDate(date, "yyyy-mm-dd");
                    var arivalMax = document.getElementById('arivalId');
                    arivalMax.setAttribute('max', arivalMaxDate);                  
                    var advanceDays = new Date();
                    advanceDays.setDate(advanceDays.getDate() + Number($scope.memberInfo.RV_Site_Days_Advance_Reserve__c));
                    $scope.memberInfo.Advance_up_to__c = advanceDays.toLocaleString('en-us', { month: 'long' }) + ' ' + advanceDays.getDate() + ' ' + advanceDays.getFullYear();
                    $scope.rvMemberInfo.Advance_up_to__c = advanceDays.toLocaleString('en-us', { month: 'long' }) + ' ' + advanceDays.getDate() + ' ' + advanceDays.getFullYear();
                }                    
            }, function(response) {
                blockUI.stop();
                $error.showError(response.message);
                return;
            });
        }
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
        $scope.unitTypeChanged = function() {
            document.getElementById("confirmRVWaitList").required = false;   
            $scope.isWaitList = false;
            $scope.rvErrorMessage = false;
            $scope.blockDateSelected = false;
            $scope.blockDateError = null;
            $scope.RV_Arrival_Date__c = null;
            $scope.RV_Departure_Date__c = null;
            document.getElementById('rvArivalId').value="";
            document.getElementById('rvDepartureId').value="";
            $scope.rvInfoShow = false;
            $scope.UnitTypeshow = false;
            $scope.reservationNotes = undefined; 
            $scope.Pull_Out__c = false;
            $scope.Pull_In__c = false;
            $scope.showPayment = false;
            $scope.Require_Disability_Unit__c = undefined;
            $scope.Pet__c = undefined;
            $scope.displayStorage = false;
            $scope.storage = "no";
            document.getElementById('pets').selectedIndex=0;
            document.getElementById('disabilityUnits').selectedIndex=0;
            document.getElementById('storageId').selectedIndex=0;
            $scope.errorAlert = null;
            $scope.errorMessage = null;
            $scope.storageChanged();
            $scope.Request_Pull_Through__c = false;
            $scope.memberInfo = angular.copy($scope.rvMemberInfo);
            if($scope.UnitTypes&& $scope.Accommodation_Type__c){
                $scope.selectedUnitType = $scope.UnitTypes.filter(function (unit) {
                    return unit.Id === $scope.Accommodation_Type__c
                });
                if($scope.selectedUnitType && $scope.selectedUnitType[0].Reservation_Accommodation_Type__c) {
                    $scope.Reservation_Unit_Type__c = $scope.selectedUnitType[0].Reservation_Accommodation_Type__c;
                }
                if($scope.Reservation_Unit_Type__c == "RV Site"){
                    document.getElementById("rvArivalId").required = true; 
                    document.getElementById("rvDepartureId").required = true; 
                    $scope.showAvailabilitybtn = true;
                    $scope.showGrid = false;
                }else{
                    $scope.showAvailabilitybtn = false;
                    $scope.showGrid = false;
                    document.getElementById("rvArivalId").required = false; 
                    document.getElementById("rvDepartureId").required = false; 
                }
                if($scope.showAvailabilitybtn){
                    $scope.newArrivalDate = utils.dateConversion(new Date(), "dd/mm/yyyy");
                    $scope.searchFieldRecord = {
                        'Reservation_Resort__c': $scope.Reservation_Resort__c,
                        'Arrival_Date__c': $scope.newArrivalDate,
                        'Departure_Date__c': $scope.maxRVDate,
                        'Unit_Type__c': $scope.Accommodation_Type__c
                    }
                    $scope.showAvailability();
                }
            }
        }
        $scope.resortChanged = function() {
            $scope.Accommodation_Unit__c = null;
            $scope.showunit = false;
            $scope.hideResunit = true;
            $scope.rvInfoShow = false;
            $scope.UnitTypeshow = false;
            $scope.errorMessage = null;
            $scope.paymentTypes = [];
            $scope.showAvailabilitybtn = false;
            $scope.showGrid = false;
            $scope.UnitTypesForSelResort = $scope.UnitTypes.filter(function (unit) {
                return unit.Resort__c === $scope.Reservation_Resort__c;
            });
            if(!$scope.UnitTypesForSelResort.length) {
                $scope.errorAlert = 'No Unit Types are available for this Resort.';
                document.getElementById("unitType").required = false;
                return;
            };               
            $scope.resorts.forEach(function(record) {
                if (record.Id ===  $scope.Reservation_Resort__c) {
                    if(record.Payment_Types__r){
                        record.Payment_Types__r.forEach(function(type) {
                            $scope.paymentTypes.push(type.Name);
                        })
                    }
                }
            });  
            $scope.showunit =true;
            document.getElementById("unitType").required = true;
            $scope.hideResunit = false;
            $scope.errorAlert = null;
        }
        $scope.changeUnitType = function(){
            $scope.storage = "";
            if($scope.availabelUnits){
                if($scope.Reservation_Unit_Type__c) {
                    if ($scope.Reservation_Unit_Type__c == "RV Site") {                   
                        $scope.rvInfoShow = true;
                        if ($scope.storage == "yes") {
                            $scope.displayStorage = true;
                        } else {
                            $scope.displayStorage = false;
                        }
                        $scope.UnitTypeshow = false;
                    } else {
                        $scope.rvInfoShow = false;
                        $scope.UnitTypeshow = true;
                        document.getElementById('pets').selectedIndex=0;
                        document.getElementById('disabilityUnits').selectedIndex=0;
                    }
                }
            }
        }
        $scope.checkAvailability = function() {
            $scope.unitTypeChanged();
            $scope.newDate = new Date();
            $scope.newDate.setHours(0, 0, 0, 0);   
            $scope.isCancel = false;  
            document.getElementById("confirmRVWaitList").required = false;   
            $scope.isWaitList = false;               
            if ($scope.Arrival_Date__c < $scope.newDate) {
                $scope.errorMessage = "Arrival date must be greater than today.";
                return;
            }
            if ($scope.Departure_Date__c <= $scope.Arrival_Date__c) {
                $scope.errorMessage = "Departure date must be greater than Arrival date";
                return;
            }           
            $scope.arrivalDate = utils.dateConversion($scope.Arrival_Date__c, "dd/mm/yyyy");
            $scope.departureDate = utils.dateConversion($scope.Departure_Date__c, "dd/mm/yyyy");
            $scope.searchFieldRecord = {
                'Reservation_Resort__c': $scope.Reservation_Resort__c,
                'Arrival_Date__c': $scope.arrivalDate,
                'Departure_Date__c': $scope.departureDate,
                'Unit_Type__c': $scope.Accommodation_Type__c
            }
            apiCallout.post($scope.searchFieldRecord, '/reservation/checkAvailability', { 'token': $cookies.get("token") }).then(function(response) {
                if (!response.success) {
                    blockUI.stop();
                    $scope.errorMessage = response.message;
                    return;
                }if(response.data.length > 0){
                    response.data.forEach(function(unit) {
                        if(!unit.standardMemberUnitPrice){
                            unit.standardMemberUnitPrice = 0.00;
                        }
                    });
                }
                $scope.availabelUnits = angular.copy(response.data);
                $scope.unitsAvailableWithRates = angular.copy(response.data);
                $scope.changeUnitType();
                $scope.errorMessage = null;
                $scope.petErrorMessage = null;
                $scope.errorAlert = null;
            }, function(response) {
                blockUI.stop();
                $scope.errorMessage = response.message;
                return;
            });
        }
        $scope.searchCriteriaChanged = function() {
            $scope.rvInfoShow = false;
            $scope.UnitTypeshow = false;
            $scope.availabelUnits = [];
            $scope.errorMessage = null;
            $scope.errorAlert = null;
        }
        $scope.rvDateCheck = function() {
            document.getElementById("confirmRVWaitList").required = false;   
            $scope.isWaitList = false;
            $scope.rvErrorMessage = false;
            $scope.blockDateSelected = false;
            $scope.blockDateError = null;           
            $scope.newDate = new Date();
            $scope.newDate.setHours(0, 0, 0, 0); 
            if($scope.RV_Arrival_Date__c && $scope.RV_Departure_Date__c){
                if($scope.memberInfo.Max_Days_In__c) {
                    days = utils.daysBetween($scope.RV_Arrival_Date__c,$scope.RV_Departure_Date__c)
                    if( days > $scope.memberInfo.Max_Days_In__c ) {
                        $scope.errorMessage = "Your membership type allows you to make max RV stays for " + $scope.memberInfo.Max_Days_In__c + " days. Please makes changes in the dates to create a reservation.";
                        $scope.rvInfoShow = false;
                        return;
                    }
                } 
                if ($scope.RV_Arrival_Date__c < $scope.newDate) {
                    $scope.errorMessage = "Arrival date must be greater than today.";
                    return;
                }               
                if ($scope.RV_Departure_Date__c <= $scope.RV_Arrival_Date__c) {
                    $scope.errorMessage = "Departure date must be greater than Arrival date";
                    $scope.rvInfoShow = false;
                    return;
                }else{
                    $scope.errorMessage = null;
                    $scope.rvInfoShow = true;
                }
                $scope.date = {
                    startDate: $scope.RV_Arrival_Date__c,
                    departureDate : $scope.RV_Departure_Date__c
                }    
                $scope.checkForWaitListReservation($scope.record,$scope.date); 
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
        $scope.createRVActiveReservation = function() {
            if($scope.blockDateSelected && $scope.blockDateError) {
                var blockDateId = document.getElementById("rvDepartureId").focus();
                return;
            }
            $scope.errorMessage = null;
            if($scope.isCancel === true){
                return;
            }
            var party = document.getElementById("party").value;
            if(party < 0){
                $scope.errorMessage = "People in party cannot be negative";
               $scope.rvInfoShow = false;
                return;
            }
            if(party > 999){
                $scope.errorMessage = "No more than 999 people are allowed for the party";
                $scope.rvInfoShow = false;
                return;
            }
            if(!$scope.RV_Arrival_Date__c || !$scope.RV_Departure_Date__c){
                $scope.errorMessage = "Arrival Date and Deparature Date are required";
                return;
            }
            $scope.rvArrivalDate = utils.dateConversion($scope.RV_Arrival_Date__c, "dd/mm/yyyy");
            $scope.rvDepartureDate = utils.dateConversion($scope.RV_Departure_Date__c, "dd/mm/yyyy");
            $scope.activeRVReservationRecord = {
                'Reservation_Member_Type__c': $scope.Reservation_Member_Type__c,
                'How_Many_People__c': $scope.How_Many_People__c,
                'Arrival_Date__c': $scope.rvArrivalDate,
                'Departure_Date__c': $scope.rvDepartureDate,
                'Reservation_Resort__c': $scope.Reservation_Resort__c,
                'Reservation_Unit_Type__c': $scope.Reservation_Unit_Type__c,
                'Accommodation_Type__c': $scope.Accommodation_Type__c,
                'Reservation_Notes__c' : $scope.reservationNotes 
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
                }else if($scope.memberInfo.RV_Electrical__c == "30amp"){
                    $scope.Request_50_Amp_Service__c = false;
                }
                if($scope.isWaitList == true){
                    $scope.activeRVReservationRecord.Reservation_Status__c = 'Wait List';
                }
                $scope.activeRVReservationRecord.Request_Pull_Through__c = $scope.Request_Pull_Through__c;
                $scope.activeRVReservationRecord.Request_50_Amp_Service__c = $scope.Request_50_Amp_Service__c;
                $scope.activeRVReservationRecord.Pull_Out__c = $scope.Pull_Out__c;
                $scope.activeRVReservationRecord.Pull_In__c = $scope.Pull_In__c;
                $scope.activeRVReservationRecord.No_of_Slide_Outs__c = $scope.memberInfo.No_of_Slide_Outs__c;
                $scope.activeRVReservationRecord.RV_Length__c = $scope.memberInfo.RV_Length__c;
                $scope.activeRVReservationRecord.RV_Type__c = $scope.memberInfo.RV_Type__c;
                $scope.activeRVReservationRecord.RV_Electrical__c = $scope.memberInfo.RV_Electrical__c;
                $scope.activeRVReservationRecord.Vehicle_Plate__c = $scope.memberInfo.Vehicle_Plate__c;
            } 
            apiCallout.post($scope.activeRVReservationRecord, '/reservation/active', { 'token': $cookies.get("token") }).then(function(response) {
                if (!response.success) {
                    blockUI.stop();
                    if(response.message){
                        if(response.message.includes("This Unit Type is not available for these date ranges")){
                            $scope.errorMessage = "There is no availability for this unit type during these dates. Please choose a different unit type or change your dates.";
                        }else{
                            $scope.errorMessage = response.message;
                        }
                    }
                    return;
                }
                $error.showSuccess(response.message);
                $location.path('/home/reservationInfo');
            }, function(response) {
                blockUI.stop();
                $scope.errorMessage = response.message;
                return;
            });
        }
        $scope.cancelRVActiveReservation = function() {
            $scope.isCancel = true;
            $scope.activeRVReservationRecord = undefined;
            $scope.How_Many_People__c = undefined;
            $scope.Accommodation_Type__c = undefined;
            $scope.errorMessage = undefined;
            $scope.storage = "no";
            $scope.displayStorage = false;
            document.getElementById('storageId').selectedIndex=0;
            $scope.storageChanged();
            $scope.rvInfoShow = false;
            $scope.showGrid = false;
            $scope.Pull_Out = false;
            $scope.Pull_In = false;
            $scope.Request_Pull_Through__c = false;
            $scope.reservationNotes = undefined;
            $scope.memberInfo = angular.copy($scope.rvMemberInfo);           
            $location.path('/home/reservationInfo');
        }
        $scope.imageControl = function(imageId, publicLinks, count) {
            if(publicLinks.length == 1) {
                return;
            } else {
                var unitImage = document.getElementById(imageId);
                var index = publicLinks.indexOf(unitImage.src);
                document.getElementById(imageId).src='';
                if(count==1 && index<(publicLinks.length-1)){
                    document.getElementById(imageId).src=publicLinks[index+1];  
                }
                if(count==-1 && index>0) {
                    document.getElementById(imageId).src=publicLinks[index-1];   
                }
                if(count==1 && index==(publicLinks.length-1)){
                    document.getElementById(imageId).src=publicLinks[0];  
                }
                if(count==-1 && index==0){
                    document.getElementById(imageId).src=publicLinks[publicLinks.length-1];                        
                }
            }
        }
        $scope.bringingPet = function() {
            $scope.petRequireErrorMessage = null;
            if ($scope.pet == "yes") {
                $scope.Pet__c = true;
            } else {
                $scope.Pet__c = false;
            }
            if($scope.Pet__c){
                $scope.availabelUnits = $scope.unitsAvailableWithRates.filter(function (unit) {
                    return unit.PetsNotAllowed === false
                });
            }
            if($scope.Pet__c === false){
                $scope.availabelUnits = $scope.unitsAvailableWithRates;
            }
            if(!($scope.availabelUnits.length > 0)){
                $scope.petErrorMessage = "Pet friendly / Pet non-friendly "+$scope.Reservation_Unit_Type__c+"s are not available";
                return;
            }else
                $scope.petErrorMessage = null;
        };
        $scope.disabilityUnit = function() {
            if ($scope.disabilityUnits == "yes") {
                $scope.Require_Disability_Unit__c = true;
            } else {
                $scope.Require_Disability_Unit__c = false;
            }
        };
        $("#pets").change(function(){
            if ($scope.pet == "yes")
                $scope.Pet__c = true;
            else
                $scope.Pet__c = false;
            if($scope.Pet__c){
                $scope.availabelUnits = $scope.unitsAvailableWithRates.filter(function (unit) {
                    return unit.PetsNotAllowed === false
                });
            }
            if($scope.Pet__c === false){
                $scope.availabelUnits = $scope.unitsAvailableWithRates;
            }
            if(!($scope.availabelUnits.length > 0)){
                $scope.petErrorMessage = "Pet friendly / Pet non-friendly "+$scope.Reservation_Unit_Type__c+"s are not available";
                return;
            }else
                $scope.petErrorMessage = null;                     
        });
        $("#disabilityUnits").change(function(){
            if ($scope.disabilityUnits == "yes") {
                $scope.Require_Disability_Unit__c = true;
            } else {
                $scope.Require_Disability_Unit__c = false;
            }         
        });

        $("#arivalId").keydown(function (event) { 
            event.preventDefault(); 
        });
        $("#departureId").keydown(function (event) { 
            event.preventDefault(); 
        });

        $("#confirmCheckbox").mouseover(function(){
            if(!$scope.ConfirmReservation) {
                $("#confirmCheckbox").addClass('checkboxActive');
                $("#confirmCheckbox").removeClass('checkboxInactive');
            }
        });
        $("#confirmCheckbox").mouseout(function(){
            if(!$scope.ConfirmReservation) {
                $("#confirmCheckbox").addClass('checkboxInactive');
                $("#confirmCheckbox").removeClass('checkboxActive');
            }
        });
        $scope.selectUnit = function(unit){
            var party = document.getElementById("party").value;
            if(party < 0){
                $scope.errorMessage = "People in party cannot be negative";
                $scope.UnitTypeshow = false;
                return;
            }
            if(party > 999){
                $scope.errorMessage = "No more than 999 people are allowed for the party";
                $scope.UnitTypeshow = false;
                return;
            }
            $scope.petRequireErrorMessage = null;
            var pets = document.getElementById("pets").value;
            if(!pets || pets===''){
                $scope.petRequireErrorMessage = "Please select the 'Are you bringing a pet?'";
                $('#pets').focus();
                return;
            }

            if(unit){                 
                $scope.reservationPaymentDetails = {};
                if($scope.resorts){
                    $scope.resorts.forEach(function(resort) {
                        if (resort.Id ===  $scope.Reservation_Resort__c) {
                            $scope.resortName = resort.Name
                        }
                    });                   
                    $scope.reservationPaymentDetails.resortName = $scope.resortName;   
                }  
                if(unit.Name){
                    $scope.reservationPaymentDetails.unitName = unit.Name;
                } 
                if(unit.standardMemberUnitPrice !== null){
                    $scope.reservationPaymentDetails.Deposit = unit.standardMemberUnitPrice;
                } else{
                    $scope.reservationPaymentDetails.Deposit = 0.00;
                } 
                if($scope.Reservation_Unit_Type__c){
                    $scope.reservationPaymentDetails.Reservation_Unit_Type__c = $scope.Reservation_Unit_Type__c;   
                } 
                if($scope.Arrival_Date__c){
                    $scope.reservationPaymentDetails.reservationArrivalDate = utils.formatDate($scope.Arrival_Date__c, "toLocalString");
                }
                if($scope.Departure_Date__c){
                    $scope.reservationPaymentDetails.reservationDepartureDate = utils.formatDate($scope.Departure_Date__c, "toLocalString");;
                }  
                if($scope.paymentTypes.length){
                    $scope.reservationPaymentDetails.paymentType = $scope.paymentTypes;
                }                    
                if ($scope.Reservation_Accommodation_Type__c !== "RV Site") {
                    $scope.activeReservationRecord = {
                        'Reservation_Member_Type__c': $scope.Reservation_Member_Type__c,
                        'How_Many_People__c': $scope.How_Many_People__c,
                        'Arrival_Date__c': $scope.arrivalDate,
                        'Departure_Date__c': $scope.departureDate,
                        'Reservation_Resort__c':  $scope.Reservation_Resort__c,
                        'Reservation_Unit_Type__c': $scope.Reservation_Unit_Type__c,
                        'Accommodation_Type__c': $scope.Accommodation_Type__c,
                        'Reservation_Notes__c' : $scope.reservationNotes,
                        'Pet__c':$scope.Pet__c,
                        'Accommodation_Unit__c':unit.value,
                        'Require_Disability_Unit__c': $scope.Require_Disability_Unit__c
                    }  
                    if($scope.Pet__c === true){
                        $scope.inventoryRates = {
                            'Accommodation_Type__c': $scope.Accommodation_Type__c,
                            'Accommodation_Unit__c':unit.value,
                            'Reservation_Resort__c':  $scope.Reservation_Resort__c,
                            'Pet__c':$scope.Pet__c
                        }
                        apiCallout.post($scope.inventoryRates, '/reservation/inventoryRates', { 'token': $cookies.get("token") }).then(function(response) {
                            if (!response.success) {
                                $scope.showPayment = false;
                                $error.showError(response.message);
                                return;
                            }else{
                                $scope.inventoryRates= response.data;
                                if(Object.keys($scope.inventoryRates).length){
                                    $scope.reservationPaymentDetails.InventoryName = $scope.inventoryRates.Name;
                                    $scope.reservationPaymentDetails.InventoryRate = $scope.inventoryRates.Rate__c;
                                    
                                    if($scope.reservationPaymentDetails.Deposit || $scope.reservationPaymentDetails.Deposit == 0){
                                        $scope.reservationPaymentDetails.unitRates = $scope.reservationPaymentDetails.Deposit;
                                        $scope.unitRates = ($scope.reservationPaymentDetails.Deposit).toFixed(2);
                                    }
                                    if($scope.reservationPaymentDetails.InventoryRate){
                                        $scope.reservationPaymentDetails.Deposit = $scope.reservationPaymentDetails.Deposit + $scope.reservationPaymentDetails.InventoryRate;
                                        $scope.deposit = ($scope.reservationPaymentDetails.Deposit).toFixed(2);
                                        $scope.invntRates = '$'+($scope.reservationPaymentDetails.InventoryRate).toFixed(2);
                                        $scope.invntRatesName = $scope.reservationPaymentDetails.InventoryName + ' Rate:';
                                    }else{
                                        $scope.deposit = ($scope.reservationPaymentDetails.unitRates).toFixed(2);
                                    }
                                    if($scope.reservationPaymentDetails.paymentType){
                                        $scope.creditCardType = $scope.reservationPaymentDetails.paymentType;
                                    }
                                    $scope.reservationPaymentDetails.showRates = false;
                                    $scope.collectDeposit = false;
                                }
                                $scope.showPayment = true;        
                           }                                        
                        }, function(response) {
                            blockUI.stop();
                            $error.showError(response.message);
                            return;
                        });  
                    }else{
                        $scope.reservationPaymentDetails.showRates = false;
                        $scope.showPayment = true;     
                        $scope.collectDeposit = false;   
                    }
                                                     
                }
            }
            
            if($scope.reservationPaymentDetails.Deposit || $scope.reservationPaymentDetails.Deposit == 0){
                $scope.reservationPaymentDetails.unitRates = $scope.reservationPaymentDetails.Deposit;
                $scope.unitRates = ($scope.reservationPaymentDetails.Deposit).toFixed(2)
            }
            if($scope.reservationPaymentDetails.InventoryRate){
                $scope.reservationPaymentDetails.Deposit = $scope.reservationPaymentDetails.Deposit + $scope.reservationPaymentDetails.InventoryRate;
                $scope.deposit = ($scope.reservationPaymentDetails.Deposit).toFixed(2);
                $scope.invntRates = '$'+($scope.reservationPaymentDetails.InventoryRate).toFixed(2);
                $scope.invntRatesName = $scope.reservationPaymentDetails.InventoryName + ' Rate:';
            }else{
                $scope.deposit = ($scope.reservationPaymentDetails.unitRates).toFixed(2);
            }
            if($scope.reservationPaymentDetails.paymentType){
                $scope.creditCardType = $scope.reservationPaymentDetails.paymentType;
            }
        }
        $scope.createReservation = function() {
            $scope.reservationErrorMessage = null;
            if($scope.activeReservationRecord){
                if($scope.activeReservationRecord.Reservation_Unit_Type__c !== "RV Site" && $scope.deposit){
                    $scope.activeReservationRecord['Pay_Deposit_by_Member_Portal__c'] = $scope.deposit;
                }
                apiCallout.post($scope.activeReservationRecord, '/reservation/active', { 'token': $cookies.get("token") }).then(function(response) {
                    if (!response.success) {
                        blockUI.stop();
                        $scope.reservationErrorMessage = response.message;
                        return;
                    }
                    $error.showSuccess(response.message);
                    $scope.activeReservationRslt = angular.copy(response.data);
                    $rootScope.resort = $scope.activeReservationRecord.Reservation_Resort__c;
                    $rootScope.activeReservationRslt =  $scope.activeReservationRslt;
                    $rootScope.creditCardType = $scope.creditCardType;
                    $rootScope.deposit = $scope.deposit;
                    $location.path('/home/payment');
                }, function(response) {
                    blockUI.stop();
                    $scope.reservationErrorMessage = response.message;
                    return;
                });
            }
        }
        $scope.cancelReservation = function() {
            $scope.reservationErrorMessage = null;
            $scope.showPayment = false;
            $scope.inventoryRates = undefined;
            $scope.invntRates = undefined;
            $scope.invntRatesName = undefined;
            $scope.ConfirmReservation = false;
        }
        $scope.invalidChars = ["-","+","e"];          
        party.addEventListener("keydown", function(e) {
            if ($scope.invalidChars.includes(e.key)) {
                e.preventDefault();
            }
        });
        $rootScope.$on('cancelReservation', function(event, record) {
            $scope.showPayment = false;
            $scope.Require_Disability_Unit__c = $scope.Require_Disability_Unit__c;
            $scope.Pet__c = $scope.Pet__c;
            $scope.availabelUnits = $scope.unitsAvailableWithRates;
            $scope.reservationPaymentDetails = $rootScope.reservationPaymentDetails;
        });
        $scope.rvUnitTypeNotAvailable = function(){
            $scope.rvErrorMessage = true;
            document.getElementById("confirmRVWaitList").required = true;
        }
        
        document.addEventListener("scroll", function() {
            document.activeElement.blur();
        });

        $scope.updateRvInfo = function(){
            $rootScope.updateRVInfo = true;
            $location.path('/home/memberInfo');
        }

        var token = $cookies.get('token')
        if (token === undefined || token === null) {
            $location.path('/login');
        } else { 
            if(!$rootScope.showPaymentToCollectDeposit){
                $scope.getResort()
            }  
        }

        $scope.showAvailability = function(){  
            if($scope.searchFieldRecord){
                if($scope.memberInfo.RV_Site_Days_Advance_Reserve__c === undefined || $rootScope.maxRVDate === null){
                    $scope.errorMessage = 'Your membership does not contains RV Advanced Day Reservations.';
                    $scope.rvInfoShow = false;
                    return;
                }
                if($scope.memberInfo.Max_Days_In__c === undefined || $scope.memberInfo.Max_Days_In__c === null){
                    $scope.errorMessage = 'Your membership does not contains RV Max Days Reservations.';
                    $scope.rvInfoShow = false;
                    return;
                }
                apiCallout.post($scope.searchFieldRecord, '/reservation/rvAvailability', { 'token': $cookies.get("token") }).then(function(response) {
                    if (!response.success) {
                        blockUI.stop();
                        $scope.errorMessage = response.message;
                        $scope.showGrid = false;
                        $scope.rvInfoShow = false;
                        return;
                    }if(response.data){
                        $scope.record = JSON.parse(response.data);
                        if($scope.record.length){
                            $scope.showGrid = true;
                            $scope.rvInfoShow = true;
                            $scope.availableDates = [];
                            $scope.notAvailableDates = [];
                            $scope.blockedDates = [];
                            $scope.record.forEach(function(record) {
                                var date = new Date(record.Date.slice(0,-1));
                                var dateAvailable = date.getDate() + "-" + (date.getMonth()+1) + "-" + date.getFullYear();
                                if(record.AvailableCount !== 0 && record.AvailableCount > 0 ){
                                    $scope.availableDates.push(dateAvailable);
                                }else if (record.AvailableCount == -1){
                                    $scope.blockedDates.push(dateAvailable);
                                } else {
                                    $scope.notAvailableDates.push(dateAvailable);
                                }
                            });
                            $scope.unitTypeName = $scope.UnitTypesForSelResort.filter(function (unitType) {
                                if(unitType.Id === $scope.Accommodation_Type__c){
                                    return unitType.Name;
                                }
                            });
                        }   
                    }                   
                }, function(response) {
                    blockUI.stop();
                    $scope.errorMessage = response.message;
                    $scope.showGrid = false;
                    $scope.rvInfoShow = false;
                    return;
                });
            }
        }
        // Function added by removing grid for Wait-List
        $scope.checkForWaitListReservation = function(record,dates){
            $scope.rvAvailabilityRslt = record;
            var isArrival = dates.startDate.setHours(0,0,0,0);
            var isDeparature = dates.departureDate.setHours(0,0,0,0);
            $scope.notUnitAvailableCount = 0;
            $scope.blockDateSelected = false;
            $scope.blockDateError = null;
            $scope.rvAvailabilityRslt.forEach(function(record) {
                var date = new Date(record.Date.slice(0,-1)).setHours(0,0,0,0);
                if(date > isArrival && isDeparature > date && record.AvailableCount === -1){
                    $scope.blockDateSelected = true;
                    $scope.notUnitAvailableCount = 0;
                    $scope.rvErrorMessage = false;
                    $scope.blockDateError = 'You cannot do reservations on Block dates. Please try different Date range.';
                    return;
                }
                if(date === isArrival || isDeparature == date || (date > isArrival && isDeparature > date)) {
                    if(record.AvailableCount === 0){
                        $scope.notUnitAvailableCount ++;
                    }
                }
            });
            if($scope.notUnitAvailableCount > 0 && !$scope.blockDateSelected){                          
                $scope.rvErrorMessage = true;
                $scope.blockDateSelected = false;
                $scope.blockDateError = null;
                document.getElementById("confirmRVWaitList").required = true;                
            }        
        }
    }
})