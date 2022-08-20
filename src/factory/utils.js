angular.module('conferenceApp')
    .factory('utils', function() {
        var utils = {
            validatePassword: function(password) {
                var passwordPolicy = new RegExp('^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,64})');
                if (passwordPolicy.test(password)) {
                    return true;
                }
                return false;
            },
            prepareRequest: function(uri, body, header) {
                var request = {};
                if (uri !== undefined) {
                    request.uri = window.__env.baseURL + uri;
                }
                if (body !== undefined) {
                    request.body = body;
                }
                if (header !== undefined) {
                    request.header = { 'headers': { 'authorization': 'Bearer ' + header.token } };
                }
                return request;
            },

            formatDate : function(date, format) {
                var current_datetime = XDate(date).addMinutes(XDate(date).getTimezoneOffset()).toDate();
                var month = current_datetime.getMonth() + 1;
                var day = current_datetime.getDate();
                var year = current_datetime.getFullYear();
                if (month < 10)
                    month = '0' + month.toString();
                if (day < 10)
                    day = '0' + day.toString();
                    switch(format) {
                        case "yyyy-mm-dd": {
                            var formatedDate = year + '-' + month + '-' + day;
                            break;
                        }
                        case "dd/mm/yyyy": {
                            var formatedDate = day + '/' + month + '/' + year;
                            break;
                        }
                        case "mm-dd-yyyy": {
                            var formatedDate = month +  '-' + day + '-' + year;
                            break;
                        } 
                        case "mm/dd/yyyy": {
                            var formatedDate = month +  '/' + day + '/' + year;
                            break;
                        }   
                        case "toLocalString" :{
                            formatedDate = date.toLocaleString('en-us', { month: 'long' }) + ' ' + date.getDate() + ', ' + date.getFullYear();
                            break;
                        } 
                        default:
                            var formatedDate = month + '/' + day + '/' + year;
                    }
                return formatedDate;
            },

            caluclateNumberOfDays : function(arrivalDate) {
                const todayDate =  this.formatDate(new Date(), 'yyyy-mm-dd');
                const  arrivalDateOfReservation= new Date(arrivalDate);
                const  todaysDate = new Date(todayDate);
                const result = Math.abs(arrivalDateOfReservation - todaysDate) / 1000;
                const noOfDays = Math.floor(result / 86400);
                return noOfDays;
            },

            dateConversion : function(date, format) {
                date.setHours(0, 0, 0, 0);
                var month = date.getMonth() + 1;
                var day = date.getDate();
                var year = date.getFullYear();
                if (month < 10)
                    month = '0' + month.toString();
                if (day < 10)
                    day = '0' + day.toString();
                    switch(format) {
                        case "yyyy-mm-dd": {
                            var formatedDate = year + '-' + month + '-' + day;
                            break;
                        }
                        case "dd/mm/yyyy": {
                            var formatedDate = day + '/' + month + '/' + year;
                            break;
                        }
                        case "dd-mm-yyyy": {
                            var formatedDate = day + '-' + month + '-' + year;
                            break;
                        }
                        case "mm-dd-yyyy": {
                            var formatedDate = month +  '-' + day + '-' + year;
                            break;
                        }    
                        default:
                            var formatedDate = month + '/' + day + '/' + year;
                    }
                return formatedDate;
            },
            daysBetween :function( date1, date2 ) {
                var one_day=1000*60*60*24;
                var date1_ms = date1.getTime();
                var date2_ms = date2.getTime();
                var difference_ms = date2_ms - date1_ms;
                return Math.round(difference_ms/one_day);
            },
            daysBetweenV2 :function( date1, date2 ) {
                date1.setHours(0, 0, 0, 0);
                date2.setHours(0, 0, 0, 0);
                var one_day=1000*60*60*24;
                var date1_ms = date1.getTime();
                var date2_ms = date2.getTime();
                var difference_ms = date2_ms - date1_ms;
                return Math.floor(difference_ms/one_day);
            }
        }
        return utils;
    })