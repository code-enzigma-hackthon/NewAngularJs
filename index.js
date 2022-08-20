var memberPortalApp = angular.module('memberPortalApp', ['ui.router', 'ngCookies', 'toaster', 'blockUI']);
memberPortalApp.config(function($stateProvider, $urlRouterProvider, $locationProvider, $windowProvider) {
    $urlRouterProvider.otherwise('/home/welcome');
    $stateProvider.state('login', {
            url: '/login',
            template: '<login></login>'
        })
        .state('forgotpassword', {
            url: '/forgotpassword',
            template: '<forgot-password></forgot-password>'
        })
        .state('home', {
            url: '/home',
            template: '<home></home>'
        })
        .state('verifyEmail', {
            url: '/verifyEmail',
            template: '<verify-email></verify-email>'
        })
        .state('resetPassword', {
            url: '/resetPassword',
            template: '<reset-password></reset-password>'
        })
        .state('register', {
            url: '/register',
            template: '<register></register>'
        })
        .state('updateEmail', {
            url: '/updateEmail',
            template: '<update-email></update-email>'
        })
        .state('help', {
            url: '/help',
            template: '<help></help>'
        })
})