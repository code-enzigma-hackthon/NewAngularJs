angular.module('conferenceApp')
    .service('apiCallout', function($http, $q, utils, $cookies) {

        //POST request function
        this.post = function(body, uri, header) {
            var request = utils.prepareRequest(uri, body, header);
            var deferred = $q.defer();
            $http.post(request.uri, request.body, request.header)
                .then(function(response) {
                    deferred.resolve(response.data);
                }, function(error) {
                    deferred.reject(error.data);
                });
            return deferred.promise;
        };

        //GET request function
        this.get = function(uri) {
            var request = utils.prepareRequest(uri, body = undefined, { 'token': $cookies.get("token") });
            var deferred = $q.defer();
            $http.get(request.uri, request.header)
                .then(function(response) {
                    deferred.resolve(response.data);
                }, function(error) {
                    deferred.reject(error.data);
                });
            return deferred.promise;
        }

        //PUT request function
        this.put = function(body, uri) {
            var request = utils.prepareRequest(uri, body, { 'token': $cookies.get("token") });
            var deferred = $q.defer();
            $http.put(request.uri, request.body, request.header)
                .then(function(response) {
                    deferred.resolve(response.data);
                }, function(error) {
                    deferred.reject(error.data);
                });
            return deferred.promise;
        };

        //DELETE request function
        this.delete = function(body, uri) {
            var request = utils.prepareRequest(uri, body, { 'token': $cookies.get("token") });
            var deferred = $q.defer();
            $http.delete(request.uri, request.body, request.header)
                .then(function(response) {
                    deferred.resolve(response.data);
                }, function(error) {
                    deferred.reject(error.data);
                });
            return deferred.promise;
        };
    });
    