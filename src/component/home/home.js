angular.module('conferenceApp')

.config(function($stateProvider) {
    $stateProvider.state('home.welcome', {
            url: '/welcome',
            template: '<welcome></welcome>'
        })
        .state('home.startPage', {
            url: '/startPage',
            template: '<start-page></start-page>',
        })
        .state('home.memberInfo', {
            url: '/memberInfo',
            template: '<member-info></member-info>',
        })
        .state('home.reservationInfo', {
            url: '/reservationInfo',
            template: '<reservation-info></reservation-info>'
        })
        .state('home.rightSideBar', {
            url: '/rightSideBar',
            template: ' <right-sidebar></right-sidebar>'
        })
        .state('home.requestReservation', {
            url: '/requestReservation',
            template: ' <request-reservation></request-reservation>'
        })
        .state('home.accountInfo', {
            url: '/accountInfo',
            template: ' <account-info></account-info>'
        })
        .state('home.checkInbox', {
            url: '/checkInbox',
            template: '<check-inbox></check-inbox>'
        })
        .state('home.activeReservation', {
            url: '/activeReservation',
            template: ' <active-reservation></active-reservation>'
        })
        .state('home.payment', {
            url: '/payment',
            template: ' <v2payment></v2payment>'
        })
})

.run(function($location, $window) {

    var $window = $window.location;
    if ($window.hash) {
        if ($window.hash === '') {
            $location.path('/home');
        } else {
            if (!$window.hash.includes('register') && !$window.hash.includes('resetPassword') && !$window.hash.includes('updateEmail'))
                $location.path($window.hash.substr(2));
        }
    }
})

.component('home', {
    templateUrl: 'src/component/home/home.htm',
    controller: function home($scope, apiCallout, $error, blockUI,utils, $cookies,$state,$rootScope) {
        $scope.memberInfo = {};
        $scope.todaysDate = new Date();
        $scope.year = $scope.todaysDate.getFullYear();
        $scope.getMemberInfo = function() {
            apiCallout.get('/member').then(function(response) {
                if (!response.success) {
                    blockUI.stop();
                    $error.showError(response.message);
                }
                $scope.memberInfo = response.data;
                if ($scope.memberInfo.Member_Since__c) {
                    $scope.memberInfo.MemberSince = 'Since ' + new Date($scope.memberInfo.Member_Since__c).getFullYear();
                }
                if($scope.memberInfo.Dues_Current_Balance__c || $scope.memberInfo.Dues_Current_Balance__c == 0){
                    $scope.memberInfo.Dues_Current_Balance__c = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(parseFloat($scope.memberInfo.Dues_Current_Balance__c).toFixed(2));
                } else {
                    $scope.memberInfo.Dues_Current_Balance__c = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(parseFloat(0).toFixed(2));
                }
                if($scope.memberInfo.Loan_Current_Balance__c || $scope.memberInfo.Loan_Current_Balance__c == 0){
                    $scope.memberInfo.Loan_Current_Balance__c = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(parseFloat($scope.memberInfo.Loan_Current_Balance__c).toFixed(2));        
                } else {
                    $scope.memberInfo.Loan_Current_Balance__c = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(parseFloat(0).toFixed(2));
                }
                if ($scope.memberInfo.RV_Site_Days_Advance_Reserve__c) {
                    var advanceDays = new Date();
                    advanceDays.setDate(advanceDays.getDate() + Number($scope.memberInfo.RV_Site_Days_Advance_Reserve__c));
                    $scope.arrivalShowMax = utils.dateConversion(advanceDays,"mm-dd-yyyy")
                    //$scope.arrivalShowMax  = (advanceDays.getMonth()+1)+'/'+advanceDays.getDate()+'/'+advanceDays.getFullYear();
                    $cookies.put("arrivalShowMax", $scope.arrivalShowMax);
                    var newAdvanceDays = new Date();
                    $scope.newRVMax = $scope.memberInfo.RV_Site_Days_Advance_Reserve__c+$scope.memberInfo.Max_Days_In__c-1;
                    newAdvanceDays.setDate(newAdvanceDays.getDate() + Number($scope.newRVMax));
                    $scope.maxRVDate  = utils.dateConversion(newAdvanceDays,"dd/mm/yyyy");
                    //newAdvanceDays.getDate()+'/'+(newAdvanceDays.getMonth()+1)+'/'+newAdvanceDays.getFullYear();
                    $scope.maxRVShowDate  = utils.dateConversion(newAdvanceDays,"mm/dd/yyyy")
                    //(newAdvanceDays.getMonth()+1)+'/'+newAdvanceDays.getDate()+'/'+newAdvanceDays.getFullYear();
                    $cookies.put("maxRVDate", $scope.maxRVDate);
                    $cookies.put("depRVShowMax", $scope.maxRVShowDate);
                }  
            }, function(response) {
                if (response.statusCode === 404 || response.statusCode === 401) {
                    $cookies.remove("token", { path: '/' });
                    $cookies.remove("maxRVDate", { path: '/' });
                    $cookies.remove("depRVShowMax", { path: '/' });
                    $cookies.remove("arrivalShowMax", { path: '/' });
                    $state.go('login');
                }
                blockUI.stop();
                $error.showError(response.message);
            });
        }
        $scope.$on("memberInfo", function(evt, info) {
            $scope.memberInfo = angular.copy(info)
            if ($scope.memberInfo.Member_Since__c) {
                $scope.memberInfo.MemberSince = 'Since ' + new Date($scope.memberInfo.Member_Since__c).getFullYear();
            }
            if($scope.memberInfo.Dues_Current_Balance__c || $scope.memberInfo.Dues_Current_Balance__c == 0){
                $scope.memberInfo.Dues_Current_Balance__c = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(parseFloat($scope.memberInfo.Dues_Current_Balance__c).toFixed(2));
            } else {
                $scope.memberInfo.Dues_Current_Balance__c = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(parseFloat(0).toFixed(2));
            }
            if($scope.memberInfo.Loan_Current_Balance__c || $scope.memberInfo.Loan_Current_Balance__c == 0){
                $scope.memberInfo.Loan_Current_Balance__c = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(parseFloat($scope.memberInfo.Loan_Current_Balance__c).toFixed(2));        
            } else {
                $scope.memberInfo.Loan_Current_Balance__c = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(parseFloat(0).toFixed(2));
            }
        });
        $scope.onToggle = function(){
            var toggle = document.getElementById("navbarSupportedContent").style.display;
            if(toggle!="none" && (toggle || toggle == "block")){
                document.getElementById("navbarSupportedContent").style.display = "none";
            } else{
                document.getElementById("navbarSupportedContent").style.display = "block";
            }
        }
        var token = $cookies.get('token')
        if (token === undefined || token === null) {
            $state.go('startPage');
        } else {
            $scope.getMemberInfo();
        }
        $scope.logout = function() {
            $cookies.remove("token", { path: '/' });
            $cookies.remove("maxRVDate", { path: '/' });
            $cookies.remove("depRVShowMax", { path: '/' });
            $cookies.remove("arrivalShowMax", { path: '/' });
            $state.go('login');
        }
    }
});