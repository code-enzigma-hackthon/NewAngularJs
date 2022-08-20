angular.module('conferenceApp')
    .component('verifyEmail', {
        templateUrl: 'src/component/member/verifyEmail/verifyEmail.htm',
        controller: function verifyEmailController($scope,$cookies, $error, $state, apiCallout) {
            $scope.columns = [
                {
                    "label":"6 AM",
                    "value": "6"
                },
                {
                    "label":"7 AM",
                    "value": "7"
                },
                {
                    "label":"8 AM",
                    "value": "8"
                },
                {
                    "label":"9 AM",
                    "value": "9"
                },
                {
                    "label":"10 AM",
                    "value": "10"
                }
            ]
            $scope.rows = [
                {
                    "conference":"Conference 1",
                    "data":[
                        {
                            "startTime":"6 AM",
                            "endTime":"7 AM",
                            "BookBy":"Baban",
                            "status":"busy"
                        },
                        {
                            "startTime":"7 AM",
                            "endTime":"8 AM",
                            "BookBy":"BabanS",
                            "status":"busy"
                        }
                    ]
                },
                {
                    "conference":"Conference 2",
                    "data":[
                        {
                            "startTime":"6 AM",
                            "endTime":"7 AM",
                            "BookBy":"Archi",
                            "status":"busy"
                        },
                        {
                            "startTime":"7 AM",
                            "endTime":"8 AM",
                            "BookBy":"Archi J",
                            "status":"busy"
                        }
                    ]
                }
            ]
            console.log('$scope.data'+$scope.data)
        }
        
    });