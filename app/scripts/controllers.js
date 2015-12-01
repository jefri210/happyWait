/**
 * Created by jefri on 27/09/15.
 */
angular.module('starter.controller', ['ngCordova'])
  .controller('AppCtrl', ['$scope', '$timeout', 'api', function ($scope, $timeout, api) {
    console.log("app");
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
  }])
  .controller('MapCtrl', ['$scope', '$timeout', '$compile', '$ionicLoading', '$ionicPlatform', '$cordovaGeolocation', 'spots',
    function ($scope, $timeout, $compile, $ionicLoading, $ionicPlatform, $cordovaGeolocation, spots) {
      console.log('mapa');

      var myLatlng;
      var posOptions = {enableHighAccuracy: false};
      var directionsDisplay;
      var directionsService = new google.maps.DirectionsService();
      var map;
      $scope.loadMap = true;
      $scope.mapTraza = {
        center: {
          latitude: -12.1291651,
          longitude: -77.0717616
        }
      };
      $scope.controlMap = {
        _constructor: function () {
          var self = this;
          if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
            $cordovaGeolocation
              .getCurrentPosition(posOptions)
              .then(function (position) {
                //myLatlng = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
                //self.ejecMap();
                //for(var i in spots){
                //
                //}
                self.route(position.coords.latitude, position.coords.longitude, spots[1].lat, spots[1].lng);
                $ionicLoading.hide();
              }, function (err) {
                // error
                alert('Unable to get location: ' + error.message);
              });
          } else {
            navigator.geolocation.getCurrentPosition(function (pos) {
              console.log("web", pos);
              //alert(pos.coords.latitude);
              //alert(pos.coords.longitude);
              //myLatlng = new google.maps.LatLng(pos.coords.latitude,pos.coords.longitude);
              //$scope.loading.hide();
              //self.ejecMap();
              for (var i = 0; i < spots.length; i++) {
                self.route(pos.coords.latitude, pos.coords.longitude, spots[i].lat, spots[i].lng);
              }
              $ionicLoading.hide();
            }, function (error) {
              alert('Unable to get location: ' + error.message);
            });
          }
        },
        ejecMap: function () {
          var mapOptions = {
            //center: myLatlng,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          var map = new google.maps.Map(document.getElementById("map"), mapOptions);

          //Marker + infowindow + angularjs compiled ng-click
          var contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
          var compiled = $compile(contentString)($scope);

          var infowindow = new google.maps.InfoWindow({
            content: compiled[0]
          });

          var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title: 'Uluru (Ayers Rock)'
          });

          google.maps.event.addListener(marker, 'click', function () {
            infowindow.open(map, marker);
          });

          $scope.map = map;
        },
        centerOnMe: function () {
          if (!$scope.map) {
            return;
          }
          $ionicLoading.show({
            content: 'Getting current location...',
            showBackdrop: false
          });
          if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
            var posOptions = {enableHighAccuracy: false};
            $cordovaGeolocation
              .getCurrentPosition(posOptions)
              .then(function (position) {
                $scope.map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
                $ionicLoading.hide();
              }, function (err) {
                // error
                alert('Unable to get location: ' + error.message);
              });
          } else {
            navigator.geolocation.getCurrentPosition(function (pos) {
              //console.log(pos);
              //alert(pos.coords.latitude);
              //alert(pos.coords.longitude);
              $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
              //$scope.loading.hide();
              $ionicLoading.hide();
            }, function (error) {
              alert('Unable to get location: ' + error.message);
            });
          }
        },
        route: function (s_lat, s_lng, e_lat, e_lng) {
          directionsDisplay = new google.maps.DirectionsRenderer();
          map = new google.maps.Map(document.getElementById('map'));
          var start = new google.maps.LatLng(s_lat, s_lng);
          var end = new google.maps.LatLng(e_lat, e_lng);
          var bounds = new google.maps.LatLngBounds();

          bounds.extend(start);
          bounds.extend(end);
          map.fitBounds(bounds);
          var request = {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.DRIVING
          };
          directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
              directionsDisplay.setDirections(response);
              directionsDisplay.setMap(map);
            } else {
              alert("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
            }
            $('.mapLoad').css('display', 'none');
            $scope.loadMap = false;
          });
          var image = {
            url: 'images/unmsm.jpg',
            // This marker is 20 pixels wide by 32 pixels high.
            size: new google.maps.Size(50, 40),
            // The origin for this image is (0, 0).
            origin: new google.maps.Point(0, 5),
            // The anchor for this image is the base of the flagpole at (0, 32).
            anchor: new google.maps.Point(0, 32)
          };
          var marker = new google.maps.Marker({
            position: {
              lat: e_lat,
              lng: e_lng
            },
            map: map,
            icon: image,
            title: 'BCP'
            //,zIndex: 100
          });

          $scope.map = map;
        }
      };
      //google.maps.event.addDomListener(window, 'load', initialize);
      $timeout(function () {
        $scope.controlMap._constructor();
      });
    }])
  .controller('HomeCtrl', ['$scope', 'api', 'spots', function ($scope, api, spots) {
    console.log("app", spots);
    console.log("home");
    $scope.spots = spots;
    $scope.account.checkState();
  }])
  .controller('entitiesCtrl', ['$scope', '$stateParams', 'api', '$state', 'spot',
    function ($scope, $stateParams, api, $state, spot) {
      console.log("entities");
      $scope.entitiesPart = {
        entities: {},
        _constructor: function () {
          this.entities = spot;
          console.log(spot);
        }
      };

      $scope.entitiesPart._constructor();

      //descripcion: "Cola de peticion de libros"
      //fechaCreacion: "2015-11-04T01:22:20.000Z"
      //fechaModificacion: "2015-11-04T01:22:20.000Z"
      //idEstablecimiento: 2
      //idQueue: 3
    }])
  .controller('entityCtrl', ['$scope', '$stateParams', 'api', '$state', 'spot', function ($scope, $stateParams, api, $state, spot) {

    $scope.entityPart = {
      entity: {},
      idQueue: $stateParams.idQueue,
      _constructor: function () {
        console.log($stateParams.idQueue);
        this.entity = spot;
        //api.base.one('spot').one($stateParams.id).get()
        //.then(function (res){
        //  this.entity=res;
        //  console.log(this.entity);
        //}.bind(this));
      },
      goQueue: function () {
        $state.go('queueCtrl', {idEstablecimiento: '2', 'idQueue': '4'})
      }
    };
    $scope.entityPart._constructor();
    console.log("entity");
  }])
  .controller('queueCtrl', ['$scope', '$interval', 'api', '$stateParams','$cordovaLocalNotification', 'userApp',
    function ($scope, $interval, api, $stateParams,$cordovaLocalNotification,userApp) {
    console.log("queue");
    $scope.ctrlQueue = {
      percentTime: 0,
      interval: null,
      entity: {},
      turno:{},
      user:userApp.getUser(),
      _constructor: function () {
        var self = this;

        console.log('cola');
        if($scope.queueCola.motivo){

          api.base.one('queue').one($stateParams.idQueue).one('user').customPOST({dni:self.user.dni}).then(function (res) {
            console.log('resT',res);
            self.currentActualQueque();
          }.bind(this), function (err) {
            if(err.status==400){
              self.currentActualQueque();
            }
          }.bind(this));
        }else{
          self.currentActualQueque();
        }

        api.base.one('spot').one($stateParams.idQueue).get()
          .then(function (res) {
            $scope.safeApply(function () {
              self.entity = res;
            });
          }.bind(this));

        self.interval = $interval(function () {
          $scope.safeApply(function () {
            //self.percentTime = self.percentTime - 1;
            self.currentActualQueque();
            self.sendNotification(self.percentTime);
          });
        }, 2000);
      },
      currentActualQueque:function(){
        api.base.one('queue').one($stateParams.idQueue).one('user').get().then(function (resG) {
          console.log('resG',resG);
          this.turno=resG;
          for(var i=0;i<resG.length;i++){
            if(resG[i].dni==this.user.dni){
              this.percentTime=this.turno.length;
            }
          }
          //this.percentTime=this.turno.length;
        }.bind(this));
      },
      exitQueue:function(){
        api.base.one('queue').one($stateParams.idQueue).one('user').one(this.user.dni).remove().then(function (res) {
          console.log('resT',res);
          //self.currentActualQueque();
        }.bind(this), function (err) {
          console.log(err);
          if(err.status==400){
            //self.currentActualQueque();
          }
        }.bind(this));
      },
      sendNotification: function (current) {
        if(current==7 || current==3){
          var text='Su reservacion espera';
          switch (current){
            case 3:
              text='faltan solo 3 personas';
              break;
            case 7:
              text='Acercarse faltan solo 7';
              break;
          }
          console.log(text);
          $cordovaLocalNotification.schedule({
            id: 1,
            title: 'Happy Wait',
            text: text
          }).then(function (result) {
          });
        }
      }
    };
    $scope.ctrlQueue._constructor();
  }])
  .controller('loginCtrl', ['$scope', '$timeout', '$ionicModal', 'api','userApp', '$ionicPopup','$localstorage'
    , function ($scope, $timeout, $ionicModal, api, userApp, $ionicPopup,$localstorage) {
      $scope.login = {
        user: {
          name: null,
          dni: null
        },
        register: {
          name: null,
          dni: null
        },
        modalRegister: null,
        invalidRegister: false,
        invalidRegisterDni:false,
        openRegister: function () {
          console.log('open',userApp);
          var self = this;
          $ionicModal.fromTemplateUrl('my-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
          }).then(function (modal) {
            self.modalRegister = modal;
            self.openModal();
          });
        },
        closeModal: function () {
          this.modalRegister.hide();
        },
        openModal: function () {
          this.modalRegister.show();
        },
        CreateUser: function (user) {
          //console.log(user);
          this.invalidRegister=false;
          //console.log(user.dni,user.dni.toString().length);
          if(user.name==null || user.dni==null){
            $scope.safeApply(function () {
              this.invalidRegister=false;
            }.bind(this));
          }else{
            api.base.one('user').customPOST({dni:user.dni,nombres:user.name}).then(function (res) {
              this.closeModal();
              $localstorage.set('name',res.nombres);
              $scope.account.saveDni(res.dni);
            }.bind(this), function (err) {
              if(err.status==400){
                $ionicPopup.alert({
                  title: 'Error',
                  template: err.data.message
                });
              }
            });
          }
        }
      };
    }])
  .controller('userCtrl', function($scope,userApp,$ionicHistory,$window,$state) {
    console.log(userApp);
    $scope.profileApp = {
      user: userApp.user,
      closeSession: function () {
        $window.localStorage.clear();
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();
        $state.go('app.login');
      },
      closeApp: function () {
        ionic.Platform.exitApp();
      }
    };
  });
