angular.module('conferenceApp')
    .component('accountInfo', {
        templateUrl: 'src/component/member/accountInfo/accountInfo.htm',
        controller: function accountInfoController($scope, apiCallout, $error, blockUI, $cookies, $state) {
            $scope.accountInfo = {};
            $scope.formatAccountInfo = function(accountInfos) {
                if(accountInfos.Dues_Annual_Amount_Billed__c || accountInfos.Dues_Annual_Amount_Billed__c == 0){
                    $scope.accountInfo.Dues_Annual_Amount_Billed__c = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(parseFloat(accountInfos.Dues_Annual_Amount_Billed__c).toFixed(2));  
                } else {
                     $scope.accountInfo.Dues_Annual_Amount_Billed__c = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(parseFloat(0).toFixed(2));  
                }
                if(accountInfos.Dues_Current_Balance__c || accountInfos.Dues_Current_Balance__c == 0){
                    $scope.accountInfo.Dues_Current_Balance__c = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(parseFloat(accountInfos.Dues_Current_Balance__c).toFixed(2));  
                } else {
                    $scope.accountInfo.Dues_Current_Balance__c = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(parseFloat(0).toFixed(2));  
                }
                if(accountInfos.Dues_Past_Due_Amount__c || accountInfos.Dues_Past_Due_Amount__c == 0){
                    $scope.accountInfo.Dues_Past_Due_Amount__c = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(parseFloat(accountInfos.Dues_Past_Due_Amount__c).toFixed(2));  
                } else {
                    $scope.accountInfo.Dues_Past_Due_Amount__c = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(parseFloat(0).toFixed(2));  
                }
                if(accountInfos.Loan_Amount__c || accountInfos.Loan_Amount__c == 0){
                    $scope.accountInfo.Loan_Amount__c = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(parseFloat(accountInfos.Loan_Amount__c).toFixed(2));  
                } else {
                    $scope.accountInfo.Loan_Amount__c = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(parseFloat(0).toFixed(2));  
                }
                if(accountInfos.Loan_Current_Balance__c || accountInfos.Loan_Current_Balance__c == 0){
                    $scope.accountInfo.Loan_Current_Balance__c = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(parseFloat(accountInfos.Loan_Current_Balance__c).toFixed(2));  
                } else {
                    $scope.accountInfo.Loan_Current_Balance__c = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(parseFloat(0).toFixed(2));  
                }
                if(accountInfos.Loan_Regular_Payment_Amount__c || accountInfos.Loan_Regular_Payment_Amount__c == 0){
                    $scope.accountInfo.Loan_Regular_Payment_Amount__c = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(parseFloat(accountInfos.Loan_Regular_Payment_Amount__c).toFixed(2));  
                }else {
                    $scope.accountInfo.Loan_Regular_Payment_Amount__c = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(parseFloat(0).toFixed(2));  
                }
                if(accountInfos.Dues_Days_Delinquent__c == null || accountInfos.Dues_Days_Delinquent__c == undefined){
                    $scope.accountInfo.Dues_Days_Delinquent__c = 0;
                }
                if(accountInfos.Loan_No_Paymnts_Left__c == null || accountInfos.Loan_No_Paymnts_Left__c == undefined){
                    $scope.accountInfo.Loan_No_Paymnts_Left__c = 0;
                }
            }
            $scope.getAccountInfo = function() {
                apiCallout.get('/member').then(function(response) {
                    if (!response.success) {
                        blockUI.stop();
                        $error.showError(response.message);
                    }
                    $scope.accountInfo = response.data;
                    $scope.formatAccountInfo($scope.accountInfo);
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
                    blockUI.stop();
                });
            }
            var token = $cookies.get('token')
            if (token === undefined || token === null) {
                $state.go('login');
            } else {
                $scope.getAccountInfo();
            }
        }
    });