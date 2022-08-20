angular.module('conferenceApp')
    .component('startPage', {
        templateUrl: 'src/component/startPage.htm',
        controller: function startPageController($scope, apiCallout, $cookies, $error,$location) {
            console.log('TTT');
        }
    });