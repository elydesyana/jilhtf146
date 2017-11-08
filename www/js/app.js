// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.services', 'app.directives', 'ngCordova', 'ngStorage', 'ionic-ratings', 'ionicLazyLoad', 'ionMDRipple', 'ngCordovaOauth', 'ionic.native', 'aCarousel', 'ion-gallery', 'ion-floating-menu','plgn.ionic-segment'])

.run(function($ionicPlatform, $ionicPopup, Services, $localStorage, $timeout, $cordovaDeeplinks, $state, Analytics, $ionicHistory) {
	$ionicPlatform.ready(function() {
		$cordovaDeeplinks.route({
			'/kuliner/:restoranId': {
				target: 'restoran',
				parent: 'kuliner' 
			}
		}).subscribe(function(match) {
			console.log('match : '+JSON.stringify(match));
			$timeout(function() {
				$state.go('tabsController.restoran', {index: match.$args.restoranId});
			}, 100);
		}, function(nomatch) {
			console.log('nomatch : '+JSON.stringify(nomatch));
		});

		if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			cordova.plugins.Keyboard.disableScroll(true);
		}
		if (window.StatusBar) {
			StatusBar.styleDefault();
		}

		window.FirebasePlugin.getToken(function(token) {
			$localStorage.token = token;
			console.log('device token : '+token);
		}, function(err) {
			console.log('err get token : '+err);
		})

		window.FirebasePlugin.onTokenRefresh(function(token) {
			$localStorage.token = token;
			console.log('device token refresh : '+token);
		}, function(err) {
			console.log('err get token : '+err);
		})

		window.FirebasePlugin.onNotificationOpen(function(notification) {
			console.log(notification.index);
			if (notification.body) {
				Analytics.logEvent('Ads', 'Notification', notification.index || 'empty');
				Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Ads',
					'Notification',
					notification.index || 'default'
					]);
				if (notification.tap == false) {
					$ionicPopup.alert({
						title: notification.title,
						template: notification.body,
						okText: 'OK',
						okType: 'button-oren'
					}).then(function(res) {
						if (res && notification.restoran) {
							$state.go('tabsController.restoran', {'index': notification.restoran});
						}
					});
				}
				else if(notification.tap == true) {
					$ionicPopup.alert({
						title: notification.title,
						template: notification.body,
						okText: 'OK',
						okType: 'button-oren'
					}).then(function(res) {
						if (res && notification.restoran) {
							$state.go('tabsController.restoran', {'index': notification.restoran});
						}
					});
				}
			} else {
				console.log('wild notification content :'+JSON.stringify(notification));
			}
		}, function(err) {
			console.log(err);
		})

		window.FirebasePlugin.subscribe("mangan");
		Analytics.logEvent('Subscribe', 'mangan');

		function _waitForAnalytics(){
			if(typeof analytics !== 'undefined'){
				analytics.startTrackerWithId(config.analytics);
			}
			else{
				setTimeout(function(){
					_waitForAnalytics();
				},10000);
			}
		};
		_waitForAnalytics();
	})

	if (ionic.Platform.isIOS()) {
		window.FirebasePlugin.grantPermission();
		console.log("iOS permission granted");
	}

	$ionicPlatform.registerBackButtonAction(function (event) {
		if ($ionicHistory.currentStateName() === 'wizard' || $ionicHistory.currentStateName() === 'registration'){
			event.preventDefault();
		} else if($ionicHistory.currentStateName() === 'tabsController.jelajah') {
			navigator.app.exitApp();
		}else {
			$ionicHistory.goBack();
		}
	}, 100);
})

.config(function($ionicConfigProvider) {
	$ionicConfigProvider.navBar.alignTitle('center');
	// $ionicConfigProvider.scrolling.jsScrolling(false);
})

.filter('orderObjectBy', function() {
    return function(items, field, reverse) {
      // console.log(field);
      // console.log(items);
      // console.log(reverse);
      // console.log('wwwwww');
      var filtered = [];
      angular.forEach(items, function(item) {
        filtered.push(item);
      });
      filtered.sort(function (a,b) {
        // console.log(a[field] +"|"+ b[field] + "|"+ a[field]>b[field]);
        return (a[field] > b[field] ? 1: -1);
      });
      if(reverse) filtered.reverse();
      return filtered;
    };
})