angular.module('conferenceApp')
    .component('welcome', {

        templateUrl: 'src/component/welcome/welcome.htm',
        controller: function welcome($scope, $sce) {          

            // if (window.FB) {
            //     window.FB.XFBML.parse();
            // }
            // FB.init({
            //     appId      : '{fb-root}',
            //     status     : true,
            //     xfbml      : true,
            //     version    : 'v2.7' 
            //   });
        }
    });