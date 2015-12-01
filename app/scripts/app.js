// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','starter.controller','ngCordova','config','restangular'])

.run(function($ionicPlatform,$rootScope,$localstorage,$state,Restangular,api,userApp,$ionicPopup) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
    var url;
    if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
      url='https://colas.localtunnel.me/'; // esta en mobile
    } else {
      url=''; //this is the browser // DESARROLLO EN BROWSER
    }

    // obtiene usuario si es que hay de local storage
    Restangular.setBaseUrl(url);

    $rootScope.safeApply = function (fn) {

      var phase = $rootScope.$$phase;
      if (phase === '$apply' || phase === '$digest') {
        if (fn && (typeof(fn) === 'function')) {
          fn();
        }
      } else {
        this.$apply(fn);
      }
    };

    $rootScope.account = {
      userDNI: null,
      invalidLogin:false,
      checkState: function(){
        var dni=$localstorage.get('dni');
        var name=$localstorage.get('name');
        //console.log("dni :",dni,dni==null || dni==undefined);
        if(dni==null || dni==undefined){
          //console.log('gooo');
          $state.go('app.login');
        }else{
          this.saveUser({dni:dni,name:name});
        }
      },
      saveUser: function (user) {
        var self=this;
        self.invalidLogin=false;
        if(user.dni!=null && user.name!=null){

          api.base.one('user').one(user.dni).get().then(function (res) {
            //console.log(res);
            $localstorage.set('name',user.name);
            userApp.setUser({dni:user.dni,name:user.name});
            self.saveDni(user.dni);
          },function(err){
            if(err.status==400){
              $ionicPopup.alert({
                title: 'Error',
                template: 'Usuario no registrado'
              });
            }
          });

        }else{
          self.invalidLogin=true;
        }
      },
      saveDni:function(dni){
        var self=this;
        $rootScope.safeApply(function(){
          self.userDNI = dni;
        });
        $localstorage.set('dni',dni);
        $state.go('app.home');
      }
    };

    $rootScope.account.checkState();

    $rootScope.queueCola={
      motivo:true,
      setMotivo: function (val) {
        this.motivo=val;
      }
    };

    //mobileConsole.show();
    //if (mobileConsole) {
    //  ////console.log("mobile console");
    //  mobileConsole.options({
    //    showOnError: true,
    //    proxyConsole: false,
    //    isCollapsed: true,
    //    catchErrors: true
    //  });
    //}
    //mobileConsole.show();
})
  .service('api', function (Restangular) {
    return {
      base: Restangular.one('api')
    };
  })
  .factory('$localstorage',['$window',function($window){
    return{
      set: function(key, value) {
        $window.localStorage[key] = value;
      },
      get: function(key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
      },
      setObject: function(key, value) {
        $window.localStorage[key] = JSON.stringify(value);
      },
      getObject: function(key) {
        return JSON.parse($window.localStorage[key] || '{}');
      }
    }
  }])
  .factory('userApp',function(api){
    return {
      user:{
        name: null,
        dni: null
      },
      getUser: function () {
        return this.user;
      },
      setUser:function(user){
        //console.log("setUser",user);
        this.user=user;
      }
    };
  })
  .filter('relativets', function() {
    return function(value) {
      var now = new Date();
      var diff = now - value;

      // ms units
      var second = 1000;
      var minute = second * 60;
      var hour = minute * 60;
      var day = hour * 24;
      var year =  day * 365;
      var month = day * 30;

      var unit = day;
      var unitStr = 'd';
      if(diff > year) {
        unit = year;
        unitStr = 'y';
      } else if(diff > day) {
        unit = day;
        unitStr = 'd';
      } else if(diff > hour) {
        unit = hour;
        unitStr = 'h';
      } else if(diff > minute) {
        unit = minute;
        unitStr = 'm';
      } else {
        unit = second;
        unitStr = 's';
      }

      var amt = Math.ceil(diff / unit);
      return amt + '' + unitStr;
    }
  })
  .config(function($stateProvider,$urlRouterProvider,$ionicConfigProvider,$httpProvider,RestangularProvider){
    $stateProvider
      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
      })

      .state('app.login', {
        url: '/login',
        views: {
          'menuContent' :{
            templateUrl: 'templates/login.html',
            controller: 'loginCtrl'
          }
        }
      })
      .state('app.user', {
        url: '/user',
        views: {
          'menuContent' :{
            templateUrl: 'templates/user.html',
            controller: 'userCtrl'
          }
        }
      })
      .state('app.home', {
        url: '/home',
        resolve: {
          spots: function ($stateParams, api) {
            return api.base.one('spot').get();
          }
        },
        views: {
          'menuContent' :{
            templateUrl: 'templates/home.html',
            controller: 'HomeCtrl'
          }
        }
      })
      .state('app.entities', {
        url: '/entities/:idEstablecimiento',
        resolve: {
          spot: function ($stateParams, api) {
            return api.base.one('spot').one($stateParams.idEstablecimiento).get();
          }
        },
        views: {
          'menuContent' :{
            templateUrl: 'templates/entities.html',
            controller: 'entitiesCtrl'
          }
        }
      })
      .state('app.entity', {
        url: '/entity/:idEstablecimiento/:idQueue',
        resolve: {
          spot: function ($stateParams, api) {
            return api.base.one('spot').one($stateParams.idEstablecimiento).get();
          }
        },
        views: {
          'menuContent' :{
            templateUrl: 'templates/entity.html',
            controller: 'entityCtrl'
          }
        }
      })
      .state('app.queue', {
        url: '/entities/:idEstablecimiento/:idQueue',
        views: {
          'menuContent': {
            templateUrl: 'templates/queue-wait.html',
            controller: 'queueCtrl'
          }
        }
      })
      .state('app.map', {
        url: '/map',
        resolve: {
          spots: function ($stateParams, api) {
            return api.base.one('spot').get();
          }
        },
        views: {
          'tab-maps' :{
            templateUrl: 'templates/map.html',
            controller: 'MapCtrl'
          }
        }
      });

    $urlRouterProvider.otherwise('/app/home');
    $ionicConfigProvider.views.maxCache(5);
    $ionicConfigProvider.backButton.text('').previousTitleText(false);
    $ionicConfigProvider.navBar.alignTitle('left');
    $ionicConfigProvider.tabs.position('bottom');
    $ionicConfigProvider.tabs.style('standard');
    RestangularProvider.setDefaultHttpFields({ cache: true });
    //$ionicConfigProvider.scrolling.jsScrolling(false);
  })
;
