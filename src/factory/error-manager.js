angular.module('conferenceApp')
    .factory('$error', function(toaster, $compile, $rootScope) {
        var $error = {
            showError: function(message, title, trusted, timeout) {
                toaster.pop('error', title, message, 3000, (trusted) ? 'trustedHtml' : '');
            },
            showWarning: function(message, title, trusted) {
                toaster.pop('warning', title, message, 5000, (trusted) ? 'trustedHtml' : '');
            },
            showInfo: function(message, title, trusted) {
                toaster.pop('info', title, message, 5000, (trusted) ? 'trustedHtml' : '');
            },
            showSuccess: function(message, title, trusted) {
                toaster.pop('success', title, message, 3000, (trusted) ? 'trustedHtml' : '');
            },
        };
        if ($(document).children('toaster-container').length <= 0) {
            var toasterContainer = angular.element('<toaster-container toaster-options="{\'time-out\': 3000, \'close-button\':true}"></toaster-container>');
            toasterContainer = $compile(toasterContainer)($rootScope);
            $error.scope = toasterContainer.scope();
            $('body').append(toasterContainer);
        }
        return $error;
    })