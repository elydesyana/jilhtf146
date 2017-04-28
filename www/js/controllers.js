angular.module('app.controllers', [])

.controller('mainCtrl', function($scope, $stateParams, $localStorage, Analytics) {
	$localStorage.badge = 0;
	$scope.badge = $localStorage.badge;
})

.controller('restoransCtrl', function($scope, $stateParams, Services, $ionicLoading, $cordovaToast, $ionicTabsDelegate, $cordovaSocialSharing, $timeout, Analytics, $state, $localStorage, $ionicSlideBoxDelegate) {
	var loadFlag = false;
	$scope.nodata = false;
	$scope.notersimpan = false;
	$ionicLoading.show({
      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>'
    });

    $timeout(function() {
    	$ionicLoading.hide();
    	if(!loadFlag) {
    		$scope.nodata = true;
    		makeToast('Koneksi tidak stabil');
    		console.log('timeout');
    	}
    }, 10000);

	$scope.category = $stateParams.name;

	var category = $stateParams.category;
	var flag = new Date().getTime();
	var flag2 = flag;
	var failCounter = 0;

	$scope.$on('$ionicView.enter', function() {
		// Analytics.logView('Kategori'+ $scope.category);
		// console.log('trackView, Kategori, '+$scope.category);

		// trackView
		Analytics.logViewArr(['Kategori', $scope.category]);

		// trackEvent
		Analytics.logEvent('Kategori', $scope.category, 'Seen');
		Analytics.logEvent('Jelajah', 'Kategori', $scope.category);

		// trackUser view
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackView',
					'Kategori',
					$scope.category
				]);
		// trackUser event
		Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Kategori",
				$scope.category,
				"Seen"
			]);
		Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Jelajah",
				"Kategori",
				$scope.category,
			]);

		failCounter = 0;
	});

	$scope.getRestorans = function() {
		loadFlag = false;
		$scope.nodata = false;
		$scope.notersimpan = false;

	    $timeout(function() {
	    	$scope.$broadcast('scroll.refreshComplete');
	    	if(!loadFlag) {
	    		$scope.nodata = true;
	    		makeToast('Koneksi tidak stabil');
	    		console.log('timeout - reload');
	    	}
	    }, 10000);
		flag = new Date().getTime();
		flag2 = flag;
		failCounter = 0;
		loadResto();
	}

	loadResto();

	$scope.saveRestoran = function(index) {
		if(Services.checkSavedRestoran(index)) {
			Services.deleteRestoran(index).then(function() {
				// analytics.trackEvent('Simpan Kuliner', 'Hapus Simpan', index, 5);
				// trackEvent
				Analytics.logEvent('Simpan Kuliner', 'Hapus Simpan');
				Analytics.logEvent('Kategori', $scope.category, 'Unsave');
				Analytics.logMerchant(index, 'Unsave');

				// trackUser Event
				Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					"trackEvent",
					"Kategori",
					$scope.category,
					"Unsave"
				]);
				Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					"trackEvent",
					"Simpan Kuliner",
					"Hapus Simpan"
				]);
				// trackUser Merchant
				Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					"trackMerchant",
					index,
					"Unsave"
				]);

				makeToast('Restoran tersimpan telah dihapus', 1500, 'bottom');
			});
		} else {
			Services.saveRestoran(index).then(function(result) {
				if(result) {
					// trackEvent
					Analytics.logEvent('Simpan Kuliner', 'Simpan');
					Analytics.logEvent('Kategori', $scope.category, 'Save');
					// trackMerchant
					Analytics.logMerchant(index, 'Save');

					// trackUser Event
					Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						"trackEvent",
						"Kategori",
						$scope.category,
						"Save"
					]);
					Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						"trackEvent",
						"Simpan Kuliner",
						"Simpan"
					]);
					// trackUser Merchant
					Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						"trackMerchant",
						index,
						"Save"
					]);
					makeToast('Restoran berhasil disimpan', 1500, 'bottom');
				} else {
					makeToast('Restoran gagal disimpan', 1500, 'bottom');
					console.log('this should not ever happen.');
				}
			}, function(reason) {
				// trackEvent
				Analytics.logEvent('Simpan Kuliner', 'Simpan Penuh');
				// trackUser Event
				Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					"trackEvent",
					"Simpan Kuliner",
					"Simpan Penuh"
				]);
				console.log('trackEvent, Simpan Penuh');
				makeToast('Penyimpanan restoran penuh (max. 30)', 1500, 'bottom');
			});
		}
	}

	$scope.shareRestoran = function(index) {
		/////////////////////////////////////////////////////////////////////
		//
		// get data resto
		//
		//////////////////////////////////////////////////////////////////////
		var resto = null;
		for(var id in $scope.restorans) {
			if($scope.restorans[id].index == index) {
				resto = $scope.restorans[id];
				break;
			}
		}

		var link = "Buka di aplikasi MANGAN untuk info selengkapnya, https://mobilepangan.com/kuliner/"+index;
		var gambar = null;
		var textshared = resto.namaResto+" - "+resto.keteranganResto;

		$cordovaSocialSharing.share(textshared, resto.namaResto, gambar, link)
		.then(function(result) {
			// trackMerchant
			Analytics.logMerchant(index, 'Share');
			// trackEvent
			Analytics.logEvent('Kategori', $scope.category, 'Share');
			Analytics.logEvent('Share', 'Kuliner', 'Success');

			// trackUser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Kategori",
				$scope.category,
				"Share"
			]);
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Share",
				"Kuliner",
				"Success"
			]);
			// trackUser Merchant
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackMerchant",
				index,
				"Share"
			]);
			makeToast('Berhasil membagikan', 1500, 'bottom');
			console.log('trackEvent, Share, '+index);
		}, function(err) {
			// trackEvent
			Analytics.logEvent('Share', 'Kuliner', 'Error');
			// trackUser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Share",
				"Kuliner",
				"Error"
			]);
			makeToast('Gagal membagikan', 1500, 'bottom');
			console.log('error');
		});
	}

	$scope.checkSavedRestoran = function(index) {
		return Services.checkSavedRestoran(index);
	}

	$scope.loadMoreResto = function() {
		loadResto();
	}

	$scope.canLoadResto = function() {
		return (failCounter < 3);
	}

	function loadResto() {
		switch(category) {
			case 'terbaru': {
				Services.getNewRestorans(flag).then(function(restorans) {
					if(restorans) {
						loadFlag = true;
						$scope.nodata = false;

						$scope.restorans = restorans;
						$ionicLoading.hide();
						$scope.$broadcast('scroll.refreshComplete');
					}
				}, function(reason) {
					console.log('error fetch data');
					makeToast('Koneksi tidak stabil', 1500, 'bottom');
					$ionicLoading.hide();
					$scope.$broadcast('scroll.refreshComplete');
				}).finally(function() {
					$scope.$broadcast('scroll.refreshComplete');
				});
				failCounter = 3;
			} break;
			case 'delivery' : {
				Services.getAllRestorans(flag).then(function(restorans) {
					if(!$scope.restorans) {
						$scope.restorans = {};
					}
					if(restorans) {
						loadFlag = true;
						$scope.nodata = false;
						var n = 0;
						for(var id in restorans) {
							if(restorans[id].delivery) {
								n++;
							} else {
								console.log(restorans[id].namaResto);
								delete restorans[id];
							}
						}

						var i=0;
						for(var id in restorans) {
							if(!(id in $scope.restorans)) {
								$scope.restorans[id] = restorans[id];
							}

							if(restorans[id].tglInput < flag) {
								flag = restorans[id].tglInput;
							}
						}
					} else if ($scope.restorans.length <= 0) {
						$scope.nodata = true;
					}
					
					$ionicLoading.hide();
					$scope.$broadcast('scroll.infiniteScrollComplete');
					$scope.$broadcast('scroll.refreshComplete');

					if(flag >= flag2) {
						flag--;
						failCounter++;
					} else {
						failCounter = 0;
					}
					flag2 = flag;
				}, function(reason) {
					$scope.nodata = true;

					console.log('error fetch data');
					makeToast('Koneksi tidak stabil');
					$ionicLoading.hide();
					$scope.$broadcast('scroll.infiniteScrollComplete');
					$scope.$broadcast('scroll.refreshComplete');
				}).finally(function() {
					$scope.$broadcast('scroll.infiniteScrollComplete');
					$scope.$broadcast('scroll.refreshComplete');
				});
			} break;
			case 'all' : {
				Services.getAllRestorans(flag).then(function(restorans) {
					if(!$scope.restorans) {
						$scope.restorans = {};
					}

					if(restorans) {
						console.log("adaresto");
						loadFlag = true;
						$scope.nodata = false;

						var n = 0;
						for(var id in restorans) {
							n++;
							// console.log(id);
						}

						var i=0;
						for(var id in restorans) {
							if(!(id in $scope.restorans)) {
								$scope.restorans[id] = restorans[id];
							}
							// console.log(restorans[id].tglInput);
              
							if(restorans[id].tglInput < flag) {
								flag = restorans[id].tglInput;
							}
						}
					} else if ($scope.restorans.length <= 0) {
						console.log("gaada resto");
						$scope.nodata = true;
					}
					
					$ionicLoading.hide();
					$scope.$broadcast('scroll.infiniteScrollComplete');
					$scope.$broadcast('scroll.refreshComplete');

					if(flag >= flag2) {
						flag--;
						failCounter++;
					} else {
						failCounter = 0;
					}
					flag2 = flag;
				}, function(reason) {
					$scope.nodata = true;

					console.log('error fetch data');
					makeToast('Koneksi tidak stabil');
					$ionicLoading.hide();
					$scope.$broadcast('scroll.infiniteScrollComplete');
					$scope.$broadcast('scroll.refreshComplete');
				}).finally(function() {
					$scope.$broadcast('scroll.infiniteScrollComplete');
					$scope.$broadcast('scroll.refreshComplete');
				});
			} break;
			default: {
				Services.getRestoranCategory(category).then(function(restorans) {
					if(restorans) {
						loadFlag = true;

						$scope.restorans = {};

						for(var r in restorans) {
							Services.getRestoranDetails(r).then(function(restoran) {
								// $scope.restorans.push(restoran);
								$scope.restorans[restoran.index] = restoran;

								$ionicLoading.hide();
								$scope.$broadcast('scroll.refreshComplete');
							}, function(reason) {
								console.log('error fetch data');
								makeToast('Koneksi tidak stabil', 1500, 'bottom');
								$scope.$broadcast('scroll.refreshComplete');
							});
						}

					}
				}, function(reason) {
					console.log('error fetch data');
					makeToast('Koneksi tidak stabil', 1500, 'bottom');
					$ionicLoading.hide();
					$scope.$broadcast('scroll.refreshComplete');
				}).finally(function() {
					$scope.$broadcast('scroll.refreshComplete');
				});

				failCounter = 3;
			} break;
		}
	}

	$scope.openRestoran = function(index, image) {
		if (image) {
			// trackEvent
			Analytics.logEventArr(['Buka Restoran', 'Click Gambar']);
			Analytics.logEventArr(['Kategori', $scope.category, 'Buka Restoran', 'Click Gambar']);
			// trackUser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Buka Restoran",
				"Click Gambar"
			]);
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Kategori",
				$scope.category,
				"Buka Restoran",
				'Click Gambar'
			]);
		} else {
			// trackEvent
			Analytics.logEventArr(['Buka Restoran', 'Click Icon More']);
			Analytics.logEventArr(['Kategori', $scope.category, 'Buka Restoran', 'Click Icon More']);
			// trackUser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Buka Restoran",
				"Click Icon More"
			]);
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Kategori",
				$scope.category,
				"Buka Restoran",
				'Click Icon More'
			]);
		}
		$state.go('tabsController.restoran', {index: index});
	}

	function makeToast(_message) {
		window.plugins.toast.showWithOptions({
			message: _message,
			duration: 1500,
			position: 'bottom',
			addPixelsY: -40
		});
	}

	$scope.next = function() {
    $ionicSlideBoxDelegate.next();
  	};
  	$scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
  	};

  	// Called each time the slide changes
  	$scope.slideChanged = function(index) {
    $scope.slideIndex = index;
  }
})

.controller('restoranCtrl', function($scope, $stateParams, Services, $ionicLoading, $cordovaToast, $ionicModal, $state, $ionicPopup, $timeout, Analytics, $cordovaSocialSharing, $ionicHistory, $ionicPopup, $cordovaAppVersion, $localStorage, $ionicSlideBoxDelegate) {
	///////////////////////////////////////////////////////////
	//
	// MODAL SECTION
	//
	///////////////////////////////////////////////////////////
	$ionicModal.fromTemplateUrl('templates/ulasanResto.html', {
		scope: $scope,
		animation: 'slide-in-up' 
	}).then(function(modal) { $scope.modalReview = modal; });

	$ionicModal.fromTemplateUrl('templates/ulasanMenu.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) { $scope.modalMenu = modal; });

	$ionicModal.fromTemplateUrl('templates/gambarMenu.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) { $scope.modalMenuGambar = modal; });

	$ionicModal.fromTemplateUrl('templates/rating.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) { $scope.modalRating = modal; });

	$ionicModal.fromTemplateUrl('templates/facility.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) { $scope.modalFacility = modal; });

	var loadFlag = false;
	var loadingIndicator = $ionicLoading.show({
      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>'
    });

    $timeout(function() {
    	$ionicLoading.hide();
    	if(!loadFlag) {
    		makeToast('Koneksi tidak stabil');
    	}
    }, 10000);

	$scope.$on('$ionicView.enter', function() {
		// trackView
		Analytics.logView('Kuliner');

		// trackMerchant
		Analytics.logMerchant($stateParams.index, 'Seen');

		// trackUser View
		Analytics.logUser(
			$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
			'trackView',
			'Kuliner'
		);
		// trackUser Merchant
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackMerchant',
					$stateParams.index,
					'Seen'
				])
	});

	$scope.restoran = null;
	$scope.restoranImg = null;
	$scope.menus = null;
	$scope.reviews = null;
	$scope.user = {
		rating: 5
	};

	$scope.getRestoran = function() {
		Services.getRestoranDetails($stateParams.index).then(function(restoran) {
			if(restoran) {
				$scope.restoran = restoran;
				$scope.restoranImg = restoran.gambar;
				console.log(JSON.stringify(restoran.gambar));
				loadFlag = true;
				$scope.loadFlag = true;
				$ionicSlideBoxDelegate.update();

				Services.getRestoranMenus($stateParams.index).then(function(menus) {
					if(menus) {
						$scope.menus = menus;
						refreshRatingReview();
					} else {
						makeToast('Error, tidak ada menu', 1500, 'bottom');
						console.log('gaada menu');
					}

					$ionicLoading.hide();
				}, function(reason) {
					makeToast('Koneksi tidak stabil', 1500, 'bottom');
					console.log('error fetching data');
					$ionicLoading.hide();
				});
			} else {
				$ionicLoading.hide();
			}
		}, function(reason) {
			makeToast('Koneksi tidak stabil', 1500, 'bottom');
			console.log('gabisa ambil resto');
			$ionicLoading.hide();
		}).finally(function() {
			$scope.$broadcast('scroll.refreshComplete');
		});
	}

	$scope.getRestoran();

	///////////////////////////////////////////////////////////
	//
	// RATING SECTION
	//
	///////////////////////////////////////////////////////////
	$scope.ratingsObject = {
		iconOn: 'ion-ios-star',
		iconOff: 'ion-ios-star-outline',
		iconOnColor: 'orangered',
		iconOffColor: 'grey',
		rating: $scope.user.rating,
		minRating: 1,
		callback: function(rating) {
			$scope.ratingsCallback(rating);
		}
	};

	$scope.ratingsCallback = function(rating) {
		$scope.user.rating = rating;
	};

	$scope.saveRatingReview = function() {
		var user = firebase.auth().currentUser;
		if (user) {
			user.providerData.forEach(function(profile) {
				Services.getProfileByUid(profile.uid).then(function(dataUser) {
					if (dataUser) {
						$scope.dataUser = dataUser;
						console.log(JSON.stringify(dataUser));
						Services.updateRatingReview(
							$scope.restoran.index, 
							$scope.dataUser.name, 
							$scope.dataUser.photoUrl,
							$scope.user.rating,
							$scope.user.titleReview,
							$scope.user.review
						).then(function(result) {
							$scope.reviews = null;

							Services.updateJmlSad($scope.restoran.index).then(function(result) {
								refreshRatingReview();
							});
							refreshRatingReview();
							// trackMerchant
							Analytics.logMerchant($stateParams.index, 'Rating Review');
							// trackUser Merchant
							Analytics.logUserArr([
										$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
										'trackMerchant',
										$stateParams.index,
										'Rating Review'
									]);
						}, function(reason) {
							console.log('gagal review');
						});
					} else {
						console.log('profil no dataUser found with uid:'+uid);
					}
				});
			});
		} else {
			$ionicPopup.alert({
				title: 'Belum login',
				template: '<center>Kamu harus login dulu</center>',
				okText: 'OK',
				okType: 'button-oren'
			});
			$state.go('login');
		};

		$scope.modalRating.hide();
	};

	function refreshRatingReview() {
		Services.getRestoranReviews($stateParams.index).then(function(reviews) {
			if(reviews) {
				for(var r in reviews) {
					if(reviews[r].review == undefined || reviews[r].review == null) {
						delete reviews[r];
					}
				}
				$scope.reviews = reviews;

				console.log('success');
			}
		}, function(reason) {
			console.log(JSON.stringify(reason));
			console.log('gagal');
		});
	}

	$scope.openReview = function() {
		// trackView
		Analytics.logView('Ulasan Kuliner');
		// trackEvent
		Analytics.logEvent('Ulasan', 'Ulasan Kuliner', $stateParams.index);

		// trackUser View
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackView',
					'Ulasan Kuliner'
				]);
		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Ulasan',
					'Ulasan Kuliner',
					$stateParams.index
				]);
		$scope.modalReview.show();
	};

	$scope.closeReview = function() {
		$scope.modalReview.hide();
	};

	$scope.openMenu = function(index, indexmenu) {
		// trackView
		Analytics.logView('Ulasan Menu');
		// trackEvent
		Analytics.logEvent('Kuliner', 'Ulasan Menu');

		// trackUser View
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackView',
					'Ulasan Menu'
				]);
		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Kuliner',
					'Ulasan Menu'
				]);

		$scope.selectedMenu = $scope.menus[index]? $scope.menus[index] : $scope.menus[indexmenu];

		// trackMerchant
		// Analytics.logMerchant($stateParams.index, 'Ulasan Menu', $scope.selectedMenu.indexmenu);
		Analytics.logMerchant($stateParams.index, 'Ulasan Menu', indexmenu);

		// trackUser Merchant
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackMerchant',
					$stateParams.index,
					'Ulasan Menu',
					// $scope.selectedMenu.indexmenu
					indexmenu
				]);
		if (!$scope.selectedMenu.review) {
			// $scope.modalMenuGambar.show();
		}else{
			// $scope.modalMenu.show();
			$state.go('tabsController.ulasanMenu', {'selectedMenu': $scope.selectedMenu});
		}
	};

	$scope.closeMenu = function() {
		$scope.modalMenu.hide();
	};

	$scope.closeMenuGambar = function() {
		$scope.modalMenuGambar.hide();
	};

	$scope.pesan = function() {
		console.log('Pesan');
		// trackMerchant
		Analytics.logMerchant($stateParams.index, 'Tombol Pesan');
		// trackEvent
		Analytics.logEvent('Kuliner', 'Tombol Pesan');

		// trackUser Merchant
		Analytics.logUserArr([
			$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
			"trackMerchant",
			$stateParams.index,
			"Tombol Pesan"
		]);
		// trackUser Event
		Analytics.logUserArr([
			$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
			"trackEvent",
			"Kuliner",
			'Tombol Pesan'
		]);

	    Services.getVersion().then(function(version) {
	    	console.log('Version :'+version);
	    	if (version) {
	    		// if (config.version < version) {
	    		$cordovaAppVersion.getVersionCode().then(function(currentVersion) {
					$ionicLoading.hide();

	    			if (parseInt(currentVersion) < version) {
				    	$ionicPopup.alert({
							title: 'Update Aplikasi',
							template: '<center>Update Aplikasi untuk melanjutkan</center>',
							okText: 'Update',
							okType: 'button-oren',
						}).then(function(res) {
							if(res) {
								// trackEvent
								Analytics.logEvent('Pesan Antar', 'Alert', 'Update Aplikasi');
								// trackUser Event
								Analytics.logUserArr([
									$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
									"trackEvent",
									"Pesan Antar",
									"Alert",
									'Update Aplikasi'
								]);
								window.open('https://play.google.com/store/apps/details?id=com.manganindonesia.mangan', '_system', 'location=yes');
							}
						});
		    		} else {
						Services.getSettingsDelivery().then(function(settings) {
							if (settings) {
								if (settings.status) {
									// trackEvent
									Analytics.logEvent('Pesan Antar', 'Tombol Pesan');
									// trackUser Event
									Analytics.logUserArr([
										$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
										"trackEvent",
										"Pesan Antar",
										"Tombol Pesan"
									]);

									///////////////////
									// fitur pesan
									if ($scope.restoran.delivery) {
										var user = firebase.auth().currentUser;
										if (user) {
											$state.go('tabsController.pesan', {'index': $scope.restoran.index});
										} else {
											// trackEvent
											Analytics.logEvent('Pesan Antar', 'Alert', 'Login');
											// trackUser Event
											Analytics.logUserArr([
												$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
												"trackEvent",
												"Pesan Antar",
												"Alert",
												'Login'
											]);
											$state.go('login');
										}
									} else {
										//////////////////
										// tidak mendukung pesan antar
										// trackEvent
										Analytics.logEvent('Pesan Antar', 'Alert', 'Tidak Mendukung');
										// trackUser Event
										Analytics.logUserArr([
											$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
											"trackEvent",
											"Pesan Antar",
											"Alert",
											'Tidak Mendukung'
										]);
										$ionicPopup.alert({
											title: 'Oops',
											template: '<center>Maaf kuliner ini belum mendukung pesan antar</center>',
											okText: 'OK',
											okType: 'button-oren'
										});
									}
								} else {
									// trackEvent
									Analytics.logEvent('Pesan Antar', 'Alert', 'Tutup');
									// trackUser Event
									Analytics.logUserArr([
										$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
										"trackEvent",
										"Pesan Antar",
										"Alert",
										'Tutup'
									]);
									$ionicPopup.alert({
										title: 'Pemberitahuan',
										template: '<center>'+settings.message+'</center>',
										okText: 'OK',
										okType: 'button-oren'
									});
								}
							}
						})
		    		}
	    		}, function(error) {
	    			console.log('error get version: '+ error);
	    		});
	    	} else {
	    		console.log('error get version');
	    		$ionicLoading.hide();
	    	}
	    }, function(err) {
	    	console.log('error get version');
	    	console.log(err);
	    });
	};

	$scope.ulasanPengguna = function(compose) {
		var user = firebase.auth().currentUser;
		if (!user && compose) {
			// trackEvent
			Analytics.logEvent('Ulasan Pengguna', 'Alert', 'Login');
			// trackUser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Ulasan Pengguna",
				"Alert",
				'Login'
			]);
			$state.go('login');
		} else {
			if (compose) {
				// trackEvent
				Analytics.logEvent('Ulasan Pengguna', 'Icon Tulis Ulasan');		
				Analytics.logEvent('Kuliner', 'Icon Tulis Ulasan');	
				// trackUser Event
				Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					"trackEvent",
					"Ulasan Pengguna",
					"Icon Tulis Ulasan"
				]);
				Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					"trackEvent",
					"Kuliner",
					'Icon Tulis Ulasan'
				]);	
			} else if(!compose) {
				// trackEvent
				Analytics.logEvent('Ulasan Pengguna', 'Button Tulis Ulasan');	
				Analytics.logEvent('Kuliner', 'Tombol Tulis Ulasan');
				// trackUser Event
				Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					"trackEvent",
					"Ulasan Pengguna",
					"Button Tulis Ulasan"
				]);
				Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					"trackEvent",
					"Kuliner",
					'Button Tulis Ulasan'
				]);	
			}
			// trackMerchant
			Analytics.logMerchant($scope.restoran.index, 'Ulasan Pengguna');
			// trackUser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackMerchant",
				$scope.restoran.index,
				"Ulasan Pengguna"
			]);
			$state.go('tabsController.ulasanPengguna', {'namaResto': $scope.restoran.namaResto, 'indexResto': $scope.restoran.index, 'compose': compose});			
		}
	}

	$scope.shareRestoran = function(index) {
		var resto = $scope.restoran;
		var link = "Buka di aplikasi MANGAN untuk info selengkapnya, https://mobilepangan.com/kuliner/"+index;
		var gambar = null;
		var textshared = resto.namaResto+" - "+resto.keteranganResto+" Buka di aplikasi MANGAN untuk info selengkapnya.";

		$cordovaSocialSharing.share(textshared, resto.namaResto, gambar, link)
		.then(function(result) {
			// trackEvent
			Analytics.logEvent('Share', 'Kuliner', 'Success');
			Analytics.logEvent('Kuliner', 'Share');
			// trackMerchant
			Analytics.logMerchant($stateParams.index, 'Share');

			// trackUser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Kuliner",
				"Share"
			]);
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Share",
				"Kuliner",
				"Success"
			]);
			// trackUser Merchant
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackMerchant",
				$stateParams.index,
				"Share"
			]);
			makeToast('Berhasil membagikan', 1500, 'bottom');
		}, function(err) {
			// trackEvent
			Analytics.logEvent('Share', 'Kuliner', 'Error');
			// trackUser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Share",
				"Kuliner",
				"Error"
			]);
			makeToast('Gagal membagikan', 1500, 'bottom');
		});
	}

	$scope.saveRestoran = function(index) {
		if(Services.checkSavedRestoran(index)) {
			Services.deleteRestoran(index).then(function() {
				// trackEvent
				Analytics.logEvent('Simpan Kuliner', 'Hapus Simpan');
				Analytics.logEvent('Kuliner', 'Unsave');
				// trackMerchant
				Analytics.logMerchant($stateParams.index, 'Unsave');
				// trackuser Event
				Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					"trackEvent",
					"Simpan Kuliner",
					"Hapus Simpan"
				]);
				Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					"trackEvent",
					"Kuliner",
					"Unsave"
				]);
				// trackUser Merchant
				Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					"trackMerchant",
					$stateParams.index,
					"Unsave"
				]);
				makeToast('Restoran telah dihapus', 1500, 'bottom');
			});
		} else {
			Services.saveRestoran(index).then(function(result) {
				if(result) {
					// trackEvent
					Analytics.logEvent('Simpan Kuliner', 'Simpan');
					Analytics.logEvent('Kuliner', 'Simpan');
					// trackMerchant
					Analytics.logMerchant($stateParams.index, 'Save');
					// trackuser Event
					Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						"trackEvent",
						"Simpan Kuliner",
						"Simpan"
					]);
					Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						"trackEvent",
						"Kuliner",
						"Save"
					]);
					// trackUser Merchant
					Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						"trackMerchant",
						$stateParams.index,
						"Save"
					]);
					makeToast('Restoran berhasil disimpan', 1500, 'bottom');
				} else {
					makeToast('Restoran gagal disimpan', 1500, 'bottom');
					console.log('this should not ever happen.');
				}
			}, function(reason) {
				// trackEvent
				Analytics.logEvent('Simpan Kuliner', 'Simpan Penuh');
				// trackUser Event
				Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					"trackEvent",
					"Simpan Kuliner",
					"Simpan Penuh"
				]);
				makeToast('Penyimpanan restoran penuh (max. 5)', 1500, 'bottom');
			});
		}
	}

	$scope.checkSavedRestoran = function(index) {
		return Services.checkSavedRestoran(index);
	}

	$scope.call = function(tel) {
		if (tel) {
			// trackMerchant
			Analytics.logMerchant($stateParams.index, 'Call');
			// trackEvet
			Analytics.logEvent('Kuliner', 'Call');
			// trackuser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Kuliner",
				"Call"
			]);
			// trackUser Merchant
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackMerchant",
				$stateParams.index,
				"Call"
			]);
			window.open('tel:'+tel, '_system', 'location=yes');			
		} else {
			// trackMerchant
			Analytics.logMerchant($stateParams.index, 'Tombol Call');
			// trackEvent
			Analytics.logEvent('Kuliner', 'Tombol Call Tidak Tersedia');
			// trackuser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Kuliner",
				"Tombol Call Tidak Tersedia"
			]);
			// trackUser Merchant
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackMerchant",
				$stateParams.index,
				"Tombol Call"
			]);
			$ionicPopup.alert({
				title: 'Perhatian',
				template: '<center>Nomor telepon tidak tersedia</center>',
				okText: 'OK',
				okType: 'button-oren'
			});
		}
	}

	$scope.navigate = function(index) {
		if ($scope.restoran.map) {
			// trackEvent
			Analytics.logEvent('Kuliner', 'Tombol Lokasi');
			// trackMerchant
			Analytics.logMerchant($stateParams.index, 'Tombol Lokasi');
			// trackuser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Kuliner",
				"Tombol Lokasi"
			]);
			// trackUser Merchant
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackMerchant",
				$stateParams.index,
				"Tombol Lokasi"
			]);
			$state.go('tabsController.peta', { 'index': index } )			
		} else {
			// trackEvent
			Analytics.logEvent('Kuliner', 'Tombol Lokasi Tidak Tersedia');
			// trackMerchant
			Analytics.logMerchant($stateParams.index, 'Tombol Lokasi');
			// trackuser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Kuliner",
				"Tombol Lokasi Tidak Tersedia"
			]);
			// trackUser Merchant
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackMerchant",
				$stateParams.index,
				"Tombol Lokasi"
			]);
			$ionicPopup.alert({
				title: 'Perhatian',
				template: '<center>Lokasi tidak tersedia</center>',
				okText: 'OK',
				okType: 'button-oren'
			});
		}
	}

	$scope.openMenuBook = function(index, delivery) {
		// trackMerchant
		Analytics.logMerchant(index, 'Buku Menu');
		// trackEvent
		Analytics.logEvent('Kuliner', 'Buku Menu');
		// trackuser Event
		Analytics.logUserArr([
			$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
			"trackEvent",
			"Kuliner",
			"Buku Menu"
		]);
		// trackUser Merchant
		Analytics.logUserArr([
			$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
			"trackMerchant",
			index,
			"Buku Menu"
		]);
		$state.go('tabsController.menus', {'index': index, 'delivery': delivery});
	}

	$scope.showFacility = function() {
		if ($scope.restoran.fasilitas) {
			Analytics.logMerchant($scope.restoran.indexResto, 'Fasilitas');
			// trackEvent
			Analytics.logEvent('Kuliner', 'Fasilitas');
			// trackuser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Kuliner",
				"Fasilitas"
			]);
			// trackUser Merchant
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackMerchant",
				$scope.restoran.indexResto,
				"Fasilitas"
			]);
			$scope.modalFacility.show();			
		}
	}

	function makeToast(_message) {
		window.plugins.toast.showWithOptions({
			message: _message,
			duration: 1500,
			position: 'bottom',
			addPixelsY: -40
		});
	}
})

.controller('menusCtrl', function($scope, $stateParams, Services, $ionicModal, $ionicLoading, $cordovaToast, $ionicPopup, $state, $timeout, Analytics, $cordovaAppVersion, $localStorage) {
	var loadFlag = false;
	$scope.loadFlag = false;
	var loadingIndicator = $ionicLoading.show({
      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
    });

    $timeout(function() {
    	$ionicLoading.hide();
    	if(!loadFlag) {
    		makeToast('Koneksi tidak stabil');
    	}
    }, 2500);

    $scope.$on('$ionicView.enter', function() {
    	$scope.getMenus();
    	// trackView
    	Analytics.logView('Buku Menu');

    	// trackUser View
    	Analytics.logUserArr([
    				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
    	    		'trackView',
    	    		'Buku Menu'
    	    	]);
    });

    $scope.getMenus = function() {
		Services.getRestoranMenus($stateParams.index).then(function(menus) {
			if(menus) {
				loadFlag = true;
				$scope.loadFlag = true;
				$scope.menus = menus;
			} else {
				makeToast('Error, tidak ada menu', 1500, 'bottom');
				console.log('Error menu tidak ada');
			}
		}, function(err) {
			makeToast('Koneksi tidak stabil', 1500, 'bottom');
			console.log('Error fetch data');
		}).finally(function() {
			$scope.$broadcast('scroll.refreshComplete');
		});
    }

	$scope.pesan = function() {
		// trackMerchant
		Analytics.logMerchant($stateParams.index, 'Tombol Pesan');
		// trackEvent
		Analytics.logEvent('Buku Menu', 'Tombol Pesan');
		// trackuser Event
		Analytics.logUserArr([
			$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
			"trackEvent",
			"Buku Menu",
			"Tombol Pesan"
		]);
		// trackUser Merchant
		Analytics.logUserArr([
			$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
			"trackMerchant",
			$stateParams.index,
			"Tombol Pesan"
		]);
	    Services.getVersion().then(function(version) {
	    	if (version) {
	    		// if (config.version < version) {
	    		$cordovaAppVersion.getVersionCode().then(function(currentVersion) {
					$ionicLoading.hide();

	    			if (parseInt(currentVersion) < version) {
				    	$ionicPopup.alert({
							title: 'Update Aplikasi',
							template: '<center>Update Aplikasi untuk melanjutkan</center>',
							okText: 'Update',
							okType: 'button-oren',
						}).then(function(res) {
							if(res) {
								// trackEvent
								Analytics.logEvent('Update', 'Tombol Update', 'Pesan Antar');
								// trackuser Event
								Analytics.logUserArr([
									$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
									"trackEvent",
									"Update",
									"Tombol Update",
									"Pesan Antar"
								]);
								window.open('https://play.google.com/store/apps/details?id=com.manganindonesia.mangan', '_system', 'location=yes');
							}
						});
		    		} else {
						Services.getSettingsDelivery().then(function(settings) {
							if (settings) {
								if (settings.status) {
									// trackEvent
									Analytics.logEvent('Pesan Antar', 'Tombol Pesan');
									// trackUser Event
									Analytics.logUserArr([
										$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
										"trackEvent",
										"Pesan Antar",
										"Tombol Pesan"
									]);

									///////////////////
									// fitur pesan
									if ($stateParams.delivery) {
										var user = firebase.auth().currentUser;
										if (user) {
											$state.go('tabsController.pesan', {'index': $stateParams.index});
										} else {
											$state.go('login');
										}
									} else {
										//////////////////
										// tidak mendukung pesan antar
										$ionicPopup.alert({
											title: 'Oops',
											template: '<center>Maaf kuliner ini belum mendukung pesan antar</center>',
											okText: 'OK',
											okType: 'button-oren'
										});
									}
								} else {
									$ionicPopup.alert({
										title: 'Pemberitahuan',
										template: '<center>'+settings.message+'</center>',
										okText: 'OK',
										okType: 'button-oren'
									});
								}
							}
						})
		    		}
	    		}, function(error) {
	    			console.log('error get version: '+ error);
	    		});
	    	} else {
	    		console.log('error get version');
	    		$ionicLoading.hide();
	    	}
	    }, function(err) {
	    	console.log(err);
	    });
	};

	function makeToast(_message) {
		window.plugins.toast.showWithOptions({
			message: _message,
			duration: 1500,
			position: 'bottom',
			addPixelsY: -40
		});
	}
})
  
.controller('jelajahCtrl', function($scope, $ionicSlideBoxDelegate, Services, $state, $ionicLoading, $cordovaToast, $cordovaGoogleAnalytics, $ionicPopup, $cordovaAppVersion, $cordovaGeolocation, $http, $ionicHistory, Analytics, $ionicModal, $localStorage, $stateParams) {
	$ionicLoading.show({
      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
      duration: 3000
    });

	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			user.providerData.forEach(function(profile) {
				if (profile.providerId === "facebook.com") {
					$scope.getProfileByUid(profile.uid);
				} else if (profile.providerId === "google.com") {
					$scope.getProfileByUid(profile.uid);
				} else {
					console.log('logged in with another provider');
				}
				if ($scope.queue == 'undefined' || $scope.process == 'undefined') {
					$scope.getOrder(profile.uid);
				} else {
					$scope.queue.$destroy();
					$scope.process.$destroy();
					$scope.getOrder(profile.uid);
				}
			});
		} else {
			$scope.dataUser = {
				'photoUrl' : 'img/manganstd.png'
			};
		}
	})

    Services.getVersion().then(function(version) {
    	if (version) {
    		$cordovaAppVersion.getVersionCode().then(function(currentVersion) {
    			if (parseInt(currentVersion) < version) {
			    	$ionicPopup.confirm({
						title: 'Update Aplikasi',
						template: '<center>Versi baru aplikasi tersedia di play store</center>',
						okText: 'OK',
						cancelText: 'Nanti',
						okType: 'button-oren',
						cancelType: 'button-clear'
					}).then(function(res) {
						if(res) {
							// trackEvent
							Analytics.logEvent('Jelajah', 'Update', 'Update');
							// trackUser Event
							Analytics.logUserArr([
										$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
										'trackEvent',
										'Jelajah',
										'Update',
										'Update'
									]);
							window.open('https://play.google.com/store/apps/details?id=com.manganindonesia.mangan', '_system', 'location=yes');
						} else {
							// trackEvent
							Analytics.logEvent('Jelajah', 'Update', 'Nanti');
							// trackUser Event
							Analytics.logUserArr([
										$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
										'trackEvent',
										'Jelajah',
										'Update',
										'Nanti'
									]);
						}
					});
	    		} else {
	    			console.log("version match");
	    		}
    		}, function(error) {
    			console.log('error get version: '+ error);
    		});
    	} else {
    		console.log('error get version');
    	}
    }, function(err) {
    	console.log(err);
    });

    $scope.$on('$ionicView.enter', function() {
		if ($stateParams.changeCity) {
			$scope.getRecomendation();
		}
    	$scope.selectedCity = $localStorage.location;
		$scope.user = {};
		$scope.queue = [];
		$scope.process = [];

		// trackView
    	Analytics.logView('Jelajah');

    	// trackUSer View
    	Analytics.logUserArr([
    				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
    	    		'trackView',
    	    		'Jelajah'
    	    	]);

    	// check current user and get data transaksi
		var user = firebase.auth().currentUser;
		if (user) {
			user.providerData.forEach(function(profile) {
				if (profile.providerId === "facebook.com") {
					$scope.getProfileByUid(profile.uid);
				} else if (profile.providerId === "google.com") {
					$scope.getProfileByUid(profile.uid);
				} else {
					console.log('logged in with another provider');
				}
				$scope.queue = [];
				$scope.process = [];
				$scope.getOrder(profile.uid);
			});
		} else {
			console.log('not logged in');
			$scope.dataUser = "";
		}

		$scope.greeting();

		if ($localStorage.wizard == null) {
			console.log('wizard: '+$localStorage.welcome);
			$state.go('wizard');
		} else {
			Services.getSettingsLocation().then(function(result) {
				if (result) {
					$scope.locSettings = result.status;
					if (result.status == true) {
						// alert("bisa pilih!");
						if (!$localStorage.location) {
							$state.go('kota');
						}
					} else {
						// alert("blm bisa pilih...");
					}
				}
			}, function(reason) {
				console.log('Error get setting location');
			});
		}
    });

    // set slider option
	$scope.sliderOptions = {
		loop: false,
		autoplay: true,
		speed: 1000,
		// pagination: false

		onInit: function() {
			console.log('init slider');
			$scope.initSlide();
		},

		onSlideChangeEnd: function(index) {
			$scope.slideChange(index);
		}
	};

	// start Slider
	$scope.initSlide = function() {
		Services.getSliders().then(function(sliders) {
			$scope.slider
			if (sliders) {
				$scope.slidersArr = [];
				for(var r in sliders) {
					$scope.slidersArr.push(sliders[r]);
				}
				// trackEvent
				Analytics.logEventArr(['Ads', 'Slider', $scope.slidersArr[0].index, 'View']);
				// trackUser Event
				Analytics.logUserArr([
							$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
							'trackEvent',
							'Ads',
							'Slider',
							$scope.slidersArr[0].index,
							'View'
						]);
			} else {
				console.log('no slider');
			}
		});
	}

	// listen to slider change
	$scope.slideChange = function(index) {
		// trackEvent
		var branchEvent = [];
			branchEvent.push('Ads');
			branchEvent.push('Slider');
			branchEvent.push($scope.slidersArray[index.activeIndex].index);
			branchEvent.push('View');
		Analytics.logEventArr(branchEvent);

		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Ads',
					'Slider',
					$scope.slidersArray[index.activeIndex].index,
					'View'
				]);
	}

	// get data of current user
	$scope.getProfileByUid = function(uid) {
		Services.getProfileByUid(uid).then(function(dataUser) {
			if (dataUser) {
				$localStorage.indexUser = dataUser.index;
				$scope.dataUser = dataUser;
			} else {
				$scope.dataUser = "";
			}
		})
	}

	// search
	$scope.searchQuery = function() {
		if ($scope.user.query == null) {
			console.log($scope.user.query);
		} else {
			// trackEvent
			Analytics.logEvent('Jelajah', 'Pencarian');

			// trackUser Event
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Jelajah',
						'Pencarian'
					]);
			$state.go('tabsController.pencarian', {'query': $scope.user.query});
			delete $scope.user.query;
		}
	};

	// give recomendation
	$scope.rekomendasikan = function() {
		// trackEvent
		Analytics.logEvent('Jelajah', 'Tombol Rekomendasi Restoran');

		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Jelajah',
					'Tombol Rekomendasi Restoran'
				]);
		$state.go("tabsController.rekomendasi"); 
	}

	// registration
	$scope.daftar = function() {
		// trackEvent
		Analytics.logEvent('Jelajah', 'Tombol Daftar Restoran');

		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Jelajah',
					'Tombol Daftar Restoran'
				]);
		$state.go("tabsController.daftar");
	}

	// go to transaksi
	$scope.transaksi = function() {
		// trackEvent
		Analytics.logEvent('Jelajah', 'Notifikasi Transaksi');

		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Jelajah',
					'Notifikasi Transaksi'
				]);
		$state.go('tabsController.transaksi');
	}

	// get Sliders
	$scope.getSliders = function() {
		Services.getSliders().then(function(sliders) {
			$scope.sliders = null;
			if (sliders) {
				$scope.sliders = sliders;
				$scope.slidersArray = [];
				var image = [];
				for(var r in sliders) {
					image.push(sliders[r].url);
					$scope.slidersArray.push(sliders[r]);
				}
				$scope.image = image;
				// trackView
				Analytics.logView('Slider');
				// trackEvent
				Analytics.logEvent('Ads', 'Slider', 'Loaded');

				// trackMerchant View
				Analytics.logUserArr([
				    				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
									'trackView',
									'Slider'
								]);
				// trackMerchant Event
				Analytics.logUserArr([
				    				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
									'trackEvent',
									'Ads',
									'Slider',
									'Loaded'
								]);
			} else {
				// trackEvent
				Analytics.logEvent('Ads', 'Slider', 'Not Load');
				// trackUser Event
				Analytics.logUserArr([
							$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
							'trackEvent',
							'Ads',
							'Slider',
							'Not Load'
						]);
				console.log('Tidak ada slider');
			}
		}, function(err) {
			// trackEvent
			Analytics.logEvent('Ads', 'Slider', 'Not Load');
			// trackUser Event
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Ads',
						'Slider',
						'Not Load'
					]);
			makeToast('Error koneksi tidak stabil', 1500, 'bottom');
			console.log(err);
		});
	}

	// get location and weather
	$scope.greeting = function() {
		var coords = {
			latitude: -7.569527,
			longitude: 110.830289
		};

		var options = {
			timeout: 10000,
			enableHighAccuracy: false
		};

		// if found, pop up a confirmation to use current location. If yes, set the localStorage.location
		$cordovaGeolocation.getCurrentPosition(options).then(function(position) {
			if(position) {
				coords = position.coords;
			}
			$http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng="+coords.latitude+","+coords.longitude+"&key=AIzaSyDcTH7G919_ydCKS_wvqoCkyH9lFMDvhgQ").success(function(result) {
				$scope.lokasiUser = result.results[0].address_components[2].short_name+', '+result.results[0].address_components[3].short_name;
			}).error(function(error) {
				console.log('data error : '+error);
			});
		}, function(error) {
			console.log("could not get location");
		});
	}

	// getOrder List
	$scope.getOrder = function(uid) {
		console.log('get order');
		$scope.queue = [];
		$scope.process = [];
		var date = new Date();
		var currentDate = date.getTime() ;
		var lastDayTimestamp = currentDate - 604800000;
		Services.getHistory(uid).then(function(transactions) {
			if (transactions) {
				for (var id in transactions) {
					Services.getTransaksiDetails(transactions[id].kurir, transactions[id].indexTransaksi).then(function(transaksi) {
						if (transaksi) {
							if(transaksi.status == "queue") {
								if (transaksi.tgl >= lastDayTimestamp) {
									$scope.queue.push(transaksi);
								}
							} else if (transaksi.status == "process") {
								if (transaksi.tgl >= lastDayTimestamp) {
									$scope.process.push(transaksi);
								}
							}
						}
					});
				}
				$ionicLoading.hide();
			}
		}, function(err) {
			console.log('error get transactions :'+err);
			$ionicLoading.hide();
		})
	}

	// banner action
	$scope.gotoURL = function(index, url, tel) {
		if (url) {
			// trackEvent
			Analytics.logEventArr(['Ads', 'Slider', index, 'Click']);
			// trackUser Event
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Ads',
						'Slider',
						index,
						'Click'
					]);
			window.open(url, '_system', 'location=yes');
		} else if(tel){
			// trackEvent
			Analytics.logEventArr(['Ads', 'Slider', index, 'Click']);
			// trackUser Event
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Ads',
						'Slider',
						index,
						'Click'
					]);
			window.open('tel:'+tel, '_system', 'location=yes');
		} else {
			console.log('ads clicked');
		}
	}

	// go to newest Kuliner
	$scope.jelajah = function() {
		// trackEvent
		Analytics.logEvent('Jelajah', 'Tombol Jelajah');
		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Jelajah',
					'Tombol Jelajah'
				]);
		$state.go('tabsController.restorans', {category: 'all', 'name': 'Terbaru'});
	}

	// to login page
	$scope.login = function() {
		// trackEvent
		Analytics.logEvent('Jelajah', 'Tombol Login');
		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Jelajah',
					'Tombol Login'
				]);
		$state.go("login");
	}

	// i'm typing....
	$scope.typeSearch = function() {
		// trackEvent
		Analytics.logEvent('Jelajah', 'Ketik Pencarian');
		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Jelajah',
					'Ketik Pencarian'
				]);
	}

	$scope.getCategories = function() {
		Services.getCategories().then(function(category) {
			$scope.category = category;
		})
	}

	// fetch recomendation on jelajah
	$scope.getRecomendation = function() {
		$scope.slideRestorans = [];
		$scope.showRecomendation = false;
		Services.getRecomendations().then(function(restorans) {
			if (restorans) {
				var slideCount = 0;
				var i = 0;
				for (r in restorans) {
					console.log('r: '+ r);
					Services.getRestoranDetails(r).then(function(restoran) {
						console.log('slide: '+ slideCount +' | i: '+ i +' | '+ restoran.index);
						if (!$scope.slideRestorans[slideCount]) {
							var slideRestoran = {};
							$scope.slideRestorans[slideCount] = slideRestoran;
						}
						$scope.slideRestorans[slideCount][restoran.index] = restoran;

						i++;
						if (i==3) {
							i = 0;
							slideCount++;
							$ionicSlideBoxDelegate.update();
						}
					}, function(reason) {
						console.log('error fetch data');
					});
				}
				$ionicSlideBoxDelegate.update();
				$scope.showRecomendation = true;
			}
		});
	}

	$scope.pickCity = function(kota) {
		$state.go("kota");
	}

	$scope.dataUserPage = function(dataUser) {
		$state.go("dataUser");
	}

	$scope.openRestoran = function(index) {
		// trackEvent
		Analytics.logEventArr(['Buka Restoran', 'Rekomendasi Jelajah']);
		Analytics.logEventArr(['Jelajah', index, 'Buka Restoran', 'Rekomendasi Jelajah']);
		// trackUser Event
		Analytics.logUserArr([
			$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
			"trackEvent",
			"Buka Restoran",
			"Rekomendasi Jelajah"
		]);
		Analytics.logUserArr([
			$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
			"trackEvent",
			"Jelajah",
			index,
			"Buka Restoran",
			'Rekomendasi Jelajah'
		]);
		$state.go('tabsController.restoran', {index: index});
	}

	$scope.openAll = function() {
		$state.go('tabsController.restorans', {category: 'all', name: 'Semua Kuliner'});
	}

	$scope.getRecomendation();
	$scope.getSliders();
	$scope.getCategories();

	// toast function
	function makeToast(_message) {
		window.plugins.toast.showWithOptions({
			message: _message,
			duration: 1500,
			position: 'bottom',
			addPixelsY: -40
		});
	}

	// // carousel
	// $scope.next = function() {
	// 	$ionicSlideBoxDelegate.next();
	// };

	// $scope.previous = function() {
	// 	$ionicSlideBoxDelegate.previous();
	// };

	// // Called each time the slide changes
	// $scope.slideChanged = function(index) {
	// 	$scope.slideIndex = index;
	// };

	// // from quora well, lets try
	// function splitIntoRows(items, itemsPerRow) {
	//     var rslt = [];
	//     items.forEach(function(item, index) {
	//         var rowIndex = Math.floor(index / itemsPerRow),
	//             colIndex = index % itemsPerRow;
	//         if (!rslt[rowIndex]) {
	//             rslt[rowIndex] = [];
	//         }
	//         rslt[rowIndex][colIndex] = item;
	//     });
	//     return rslt;
	// }

	///////////////////////////////////////////////////////////////////
	//
	// USED FOR DYNAMIC CATEGORIES
	//
	///////////////////////////////////////////////////////////////////

	// Services.getCategories().then(function(categories) {
	// 	if(categories) {
	// 		// for(var category in categories) {
	// 		// 	// categories[category].namaUp = categories[category].nama.toUpperCase();
	// 		// 	console.log(categories[category]);
	// 		// }
	// 		$scope.categories = categories;
	// 	}

	// 	$ionicLoading.hide();
	// });
})

.controller('pencarianCtrl', function($scope, $stateParams, $ionicLoading, $state, Services, $cordovaToast, $cordovaSocialSharing, $timeout, Analytics, $localStorage) {
	$scope.category = 'Pencarian';
	$scope.user = {};
	$scope.user.query = $stateParams.query;
	$scope.notfound = false;

    $scope.$on('$ionicView.enter', function() {
    	// trackView
    	Analytics.logView('Pencarian');
    	// trackUser View
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackView',
					'Pencarian'
				]);
    	$scope.notfound = false;
    });
	
    $scope.searchQuery = function() {
    	// trackEvent
    	Analytics.logEvent('Pencarian', 'Query', $scope.user.query || 'empty');
		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Pencarian',
					'Query',
					$scope.user.query || 'empty'
				]);
		var loadFlag = false;
		$ionicLoading.show({
	      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>'
	    });

	    $timeout(function() {
	    	$ionicLoading.hide();
	    	if(!loadFlag) {
	    		$scope.notfound = true;
	    		makeToast('Koneksi tidak stabil');
	    	}
	    }, 10000);

		Services.searchQuery($scope.user.query).then(function(inputQuery) {
			// console.log($scope.user.query);
			if(inputQuery) {
				// console.log(result);

				Services.getRestoranKeyword().then(function(result) {
					if(result) {
						loadFlag = true;
						$scope.notfound = false;
						$scope.restorans = [];

						var restoransNSorted = [];
						var isFound = false;

						var ta = 0; // total all restoran
						for(var id in result) {
							ta++;
						}

						var ia = 0,
							ir = 0,
							tr = 0; // total restoran matches found
						for(var id in result) {
							console.log(id)
							if(result[id].keyword.indexOf($scope.user.query) >= 0) {
								isFound = true;
								tr++;
								Services.getRestoranDetails(id).then(function(result) {
									$scope.restorans.push(result);
									$ionicLoading.hide();
								});
							}

							ia++;
						}
						// console.log('isFound: '+ isFound);
						if(!isFound) {
							delete $scope.restorans;
							$ionicLoading.hide();
							$scope.notfound = true;
							// trackEvent
							Analytics.logEvent('Pencarian', 'Tidak Ditemukan');
							// trackUser Event
							Analytics.logUserArr([
										$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
										'trackEvent',
										'Pencarian',
										'Tidak Ditemukan'
									]);
							makeToast('Tidak ditemukan kuliner', 1500, 'bottom');
						}
					} else {
						makeToast('Tidak ditemukan kuliner', 1500, 'bottom');
						console.log("No result");
						// trackEvent
						Analytics.logEvent('Pencarian', 'Tidak Ditemukan');
						// trackUser Event
						Analytics.logUserArr([
									$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
									'trackEvent',
									'Pencarian',
									'Tidak Ditemukan'
								]);
						$scope.notfound = true;
					}
				}, function(reason) {
					$scope.notfound = true;
					// trackEvent
					Analytics.logEvent('Pencarian', 'Tidak Ditemukan');
					// trackUser Event
					Analytics.logUserArr([
								$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
								'trackEvent',
								'Pencarian',
								'Tidak Ditemukan'
							]);
					makeToast('Tidak ditemukan kuliner', 1500, 'bottom');
				});
			}
		});
	}

	$scope.rekomendasikan = function() {
		// trackEvent
		Analytics.logEvent('Pencarian', 'Tombol Rekomendasi Restoran');
		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Pencarian',
					'Tombol Rekomendasi Restoran'
				]);
		$state.go('tabsController.rekomendasi');
		return false;
	}

	function sortRestorans(rs) {
		$scope.restorans = [];

		var i = 0;
		var nrs = [];

		for(var id in rs) {
			nrs[i++] = rs[id];
			// console.log(nrs[i-1].namaResto);
		}

		nrs.sort(function(x,y) {
			return x.tglInput < y.tglInput;
		});

		for(var i = 0; i < nrs.length; i++) {
			$scope.restorans.push(nrs[i]);
		}
	}

	$scope.checkSavedRestoran = function(index) {
		return Services.checkSavedRestoran(index);
	}

	$scope.saveRestoran = function(index) {
		if(Services.checkSavedRestoran(index)) {
			Services.deleteRestoran(index).then(function() {
				// analytics.trackEvent('Simpan Kuliner', 'Hapus Simpan', index, 5);
				// trackEvent
				Analytics.logEvent('Simpan Kuliner', 'Hapus Simpan');
				Analytics.logEvent('Pencarian', 'Unsave');
				Analytics.logMerchant(index, 'Unsave');
				// trackuser Event
				Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					"trackEvent",
					"Simpan Kuliner",
					"Hapus Simpan"
				]);
				Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					"trackEvent",
					"Pencarian",
					"Unsave"
				]);
				// trackUser Merchant
				Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					"trackMerchant",
					index,
					"Unsave"
				]);

				makeToast('Restoran telah dihapus', 1500, 'bottom');
			});
		} else {
			Services.saveRestoran(index).then(function(result) {
				if(result) {
					// trackEvent
					Analytics.logEvent('Simpan Kuliner', 'Simpan');
					Analytics.logEvent('Pencarian', 'Save');
					// trackMerchant
					Analytics.logMerchant(index, 'Save');
					// trackUser Event
					Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						"trackEvent",
						"Pencarian",
						"Save"
					]);
					Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						"trackEvent",
						"Simpan Kuliner",
						"Simpan"
					]);
					// trackUser Merchant
					Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						"trackMerchant",
						index,
						"Save"
					]);
					makeToast('Restoran berhasil disimpan', 1500, 'bottom');
				} else {
					makeToast('Restoran gagal disimpan', 1500, 'bottom');
					console.log('this should not be done.');
				}
			}, function(reason) {
				// trackEvent
				Analytics.logEvent('Simpan Kuliner', 'Simpan Penuh');
				// trackUser Event
				Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					"trackEvent",
					"Simpan Kuliner",
					"Simpan Penuh"
				]);
				makeToast('Penyimpanan restoran penuh (max. 5)', 1500, 'bottom');
			});
		}
	}

	$scope.shareRestoran = function(index) {
		var resto = null;
		for(var id in $scope.restorans) {
			console.log($scope.restorans[id].index +" | "+ index)
			if($scope.restorans[id].index == index) {
				resto = $scope.restorans[id];
				break;
			}
		}

		var link = "Buka di aplikasi MANGAN untuk info selengkapnya, https://mobilepangan.com/kuliner/"+index;
		var gambar = null;
		var textshared = resto.namaResto+" - "+resto.keteranganResto+" Buka di aplikasi MANGAN untuk info selengkapnya.";

		if(resto.gambar[3]) {
			gambar = resto.gambar[3];
		}

		$cordovaSocialSharing.share(textshared, resto.namaResto, gambar, link)
		.then(function(result) {
			makeToast('Berhasil membagikan', 1500, 'bottom');
			// trackMerchant
			Analytics.logMerchant(index, 'Share');
			// trackEvent
			Analytics.logEvent('Share', 'Kuliner', 'Success');
			Analytics.logEvent('Pencarian', 'Share');
			// trackUser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Pencarian",
				"Share"
			]);
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Share",
				"Kuliner",
				"Success"
			]);
			// trackUser Merchant
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackMerchant",
				index,
				"Share"
			]);
		}, function(err) {
			// trackEvent
			Analytics.logEvent('Share', 'Kuliner', 'Error');
			// trackUser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Share",
				"Kuliner",
				"Error"
			]);
			makeToast('Gagal membagikan', 1500, 'bottom');
			console.log('error');
		});
	}

    $scope.searchQuery();

	$scope.openRestoran = function(index, image) {
		if (image) {
			// trackEvent
			Analytics.logEventArr(['Buka Restoran', 'Click Gambar']);
			Analytics.logEventArr(['Pencarian', 'Buka Restoran', 'Click Gambar']);
			// trackUser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Buka Restoran",
				"Click Gambar"
			]);
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Pencarian",
				"Buka Restoran",
				'Click Gambar'
			]);
		} else {
			// trackEvent
			Analytics.logEventArr(['Buka Restoran', 'Click Icon More']);
			Analytics.logEventArr(['Pencarian', 'Buka Restoran', 'Click Icon More']);
			// trackUser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Buka Restoran",
				"Click Icon More"
			]);
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Pencarian",
				"Buka Restoran",
				'Click Icon More'
			]);
		}
		$state.go('tabsController.restoran', {index: index});
	}

    function makeToast(_message) {
		window.plugins.toast.showWithOptions({
			message: _message,
			duration: 1500,
			position: 'bottom',
			addPixelsY: -40
		});
	}
})
   
.controller('tersimpanCtrl', function($scope, Services, $cordovaToast, $state, $cordovaSocialSharing, $ionicLoading, $timeout, $localStorage, $http, $ionicHistory, Analytics, $localStorage, $ionicPopover) {
	var loadFlag = false;
	var savedRestorans = [];
	$scope.category = 'Tersimpan';
	$scope.nodata = false;
	$scope.notersimpan = false;
	$scope.restorans = [];

	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			user.providerData.forEach(function(profile) {
				if (profile.providerId === "facebook.com") {
					$scope.getProfileByUid(profile.uid);
					Analytics.trackEvent('Auth', 'Sign In', 'Facebook');
				} else if (profile.providerId === "google.com") {
					$scope.getProfileByUid(profile.uid);
					Analytics.trackEvent('Auth', 'Sign In', 'Google');
				} else {
					console.log('logged in with another provider');
				}
			});
		} else {
			$scope.dataUser = "";
		}
	})

	$scope.$on('$ionicView.enter', function() {
		loadFlag = false;
		$scope.nodata = false;
		$scope.notersimpan = false;
		$ionicLoading.show({
	      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>'
	    });

	    $timeout(function() {
	    	$ionicLoading.hide();
	    	if(!loadFlag && !$scope.notersimpan) {
				if ($scope.restorans.length == 0) {
					loadFlag = true;
					$scope.notersimpan = true;
					console.log('kok jalan');
				}
	    		console.log('loadFlag :'+loadFlag, '$scope.notersimpan : '+$scope.notersimpan);
	    		$scope.nodata = true;
	    		makeToast('Koneksi tidak stabil');
	    		console.log('timeout');
	    	}
	    }, 10000);

	 	// trackViwe
	 	Analytics.logView('Tersimpan');
    	// trackUser View
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackView',
					'Tersimpan'
				]);

		var temp = Services.getSavedRestorans();
		savedRestorans = temp.slice(0);
		savedRestorans.reverse();
		updateSavedRestorans(savedRestorans);

		var user = firebase.auth().currentUser;
		if (user) {
			user.providerData.forEach(function(profile) {
				if (profile.providerId === "facebook.com") {
					$scope.getProfileByUid(profile.uid);
				} else if (profile.providerId === "google.com") {
					$scope.getProfileByUid(profile.uid);
				} else {
					console.log('logged in with another provider');
				}
			});
		} else {
			console.log('not logged in');
			$scope.dataUser = "";
		}
	});

	$scope.getRestorans = function() {
		$scope.nodata = false;
		$scope.notersimpan = false;

		var temp = Services.getSavedRestorans();
		savedRestorans = temp.slice(0);
		savedRestorans.reverse();

		$ionicLoading.show({
	      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>'
	    });

	    $timeout(function() {
	    	$ionicLoading.hide();
	    	if(!loadFlag && !$scope.notersimpan) {
	    		console.log('loadFlag :'+loadFlag, '$scope.notersimpan : '+$scope.notersimpan);
	    		$scope.nodata = true;
				if ($scope.restorans.length == 0) {
					loadFlag = true;
					$scope.notersimpan = true;
					console.log('kok jalan');
				}
	    		makeToast('Koneksi tidak stabil');
	    		console.log('timeout');
	    	}
	    }, 10000);

		updateSavedRestorans(savedRestorans);
		$scope.$broadcast('scroll.refreshComplete');
	}

	$scope.saveRestoran = function(index) {
		Services.deleteRestoran(index).then(function() {
			// trackEvent
			Analytics.logEvent('Simpan Kuliner', 'Hapus Simpan');
			Analytics.logEvent('Tersimpan', 'Unsave');
			Analytics.logMerchant(index, 'Unsave');
			// trackuser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Simpan Kuliner",
				"Hapus Simpan"
			]);
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Tersimpan",
				"Unsave"
			]);
			// trackUser Merchant
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackMerchant",
				index,
				"Unsave"
			]);

			window.plugins.toast.showWithOptions({
				message: 'Restoran berhasil dihapus',
				duration: 1500,
				position: 'bottom',
				addPixelsY: -40
			});
			$state.go($state.current, {}, {reload: true});
		});
	}

	$scope.shareRestoran = function(index) {
		var resto = null;
		for(var id in $scope.restorans) {
			console.log($scope.restorans[id].index +" | "+ index)
			if($scope.restorans[id].index == index) {
				resto = $scope.restorans[id];
				break;
			}
		}

		var link = "Buka di aplikasi MANGAN untuk info selengkapnya, https://mobilepangan.com/kuliner/"+index;
		var gambar = null;
		var textshared = resto.namaResto+" - "+resto.keteranganResto;

		if(resto.gambar[3]) {
			gambar = resto.gambar[3];
		}

		$cordovaSocialSharing.share(textshared, resto.namaResto, gambar, link)
		.then(function(result) {
			makeToast('Berhasil membagikan', 1500, 'bottom');
			// trackEvent
			Analytics.logEvent('Tersimpan', 'Share')
			Analytics.logEvent('Share', 'Kuliner', 'Success');
			// trackMerchant
			Analytics.logMerchant(index, 'Share');
			// trackUser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Tersimpan",
				"Share"
			]);
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Share",
				"Kuliner",
				"Success"
			]);
			// trackUser Merchant
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackMerchant",
				index,
				"Share"
			]);
		}, function(err) {
			// trackEvent
			Analytics.logEvent('Share', 'Kuliner', 'Error');
			// trackUser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Share",
				"Kuliner",
				"Error"
			]);
			makeToast('Gagal membagikan', 1500, 'bottom');
		});
	}

	$scope.checkSavedRestoran = function(index) {
		return Services.checkSavedRestoran(index);
	}

	function updateSavedRestorans(news) {
		var finishedLoadFlag = false;
		console.log('update');
		savedRestorans = news;
		$scope.restorans = [];
		if(news && news.length > 0) {
			$scope.notersimpan = false;
			var savedGallery = [];
			for(var i=0; i<news.length; i++) {
				Services.getRestoranDetails(news[i]).then(function(restoran) {
					if(restoran) {
						loadFlag = true;
						$scope.nodata = false;
						$scope.restorans.push(restoran);
						var data = {
							"src": restoran.gambar[0],
							"index": restoran.index
						}
						savedGallery.push(data);
						finishedLoadFlag = true;
						console.log('success');
					} else {
						console.log('failure');
					}
					$ionicLoading.hide();
				}, function(err) {
					console.log('ra ktm kcng');
				});
			}
			$scope.savedGallery = savedGallery;
		} else {
			$scope.notersimpan = true;
			$ionicLoading.hide();
		}
	}

	$scope.savedGallery = [];

	// get Profile User by UID
	$scope.getProfileByUid = function(uid) {
		Services.getProfileByUid(uid).then(function(dataUser) {
			if (dataUser) {
				$scope.dataUser = dataUser
			} else {
				console.log("tersimpan no dataUser found with uid: "+uid);
			}
		})
	}

	$scope.openProfile = function(photo) {
		if (photo) {
			// trackEvent
			Analytics.logEvent('Tersimpan', 'Klik Profile');
			// trackUser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Tersimpan",
				"Klik Profile"
			]);
		} else {
			// trackEvent
			Analytics.logEvent('Tersimpan', 'Tombol Profile');
			// trackUser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Tersimpan",
				"Tombol Profile"
			]);
		}
		$state.go('tabsController.profil');
	}

	$scope.openTransaksi = function() {
		// trackEvent
		Analytics.logEvent('Tersimpan', 'Tombol Transaksi');
		// trackUser Event
		Analytics.logUserArr([
			$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
			"trackEvent",
			"Tersimpan",
			"Tombol Transaksi"
		]);
		$state.go('tabsController.transaksi');
	}

	$scope.login = function() {
		// trackEvent
		Analytics.logEvent('Tersimpan', 'Tombol Login');
		// trackUser Event
		Analytics.logUserArr([
			$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
			"trackEvent",
			"Tersimpan",
			"Tombol Login"
		]);
		$state.go('login');
	}

	$scope.jelajah = function() {
		// trackEvent
		Analytics.logEvent('Tersimpan', 'Tombol Jelajah');
		// trackUser Event
		Analytics.logUserArr([
			$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
			"trackEvent",
			"Tersimpan",
			"Tombol Jelajah"
		]);
		$state.go('tabsController.restorans', {category: 'all', 'name': 'Terbaru'});
	}

	$scope.openRestoran = function(index, image) {
		console.log(index, image);
		if (image) {
			// trackEvent
			Analytics.logEvent('Buka Restoran', 'Click Gambar');
			Analytics.logEvent('Tersimpan', 'Buka Restoran', 'Click Gambar');
			// trackUser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Buka Restoran",
				"Click Gambar"
			]);
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Tersimpan",
				"Buka Restoran",
				'Click Gambar'
			]);
		} else {
			// trackEvent
			Analytics.logEvent('Buka Restoran', 'Click Icon More');
			Analytics.logEvent('Tersimpan', 'Buka Restoran', 'Click Icon More');
			// trackUser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Buka Restoran",
				"Click Icon More"
			]);
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Tersimpan",
				"Buka Restoran",
				'Click Icon More'
			]);
		}
		$state.go('tabsController.restoran', {index: index});
	}

	$scope.clicked = function() {
		console.log('gallery img clicked');
	}

	$scope.openRestoranGallery = function(index, image) {
		console.log(index, image);
		if (image) {
			// trackEvent
			Analytics.logEvent('Buka Restoran', 'Click Gambar');
			Analytics.logEvent('Tersimpan', 'Buka Restoran', 'Click Gambar');
			// trackUser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Buka Restoran",
				"Click Gambar"
			]);
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Tersimpan",
				"Buka Restoran",
				'Click Gambar'
			]);
		} else {
			// trackEvent
			Analytics.logEvent('Buka Restoran', 'Click Icon More');
			Analytics.logEvent('Tersimpan', 'Buka Restoran', 'Click Icon More');
			// trackUser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Buka Restoran",
				"Click Icon More"
			]);
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Tersimpan",
				"Buka Restoran",
				'Click Icon More'
			]);
		}
		$state.go('tabsController.restoran', {index: index});
	}

	function makeToast(_message) {
		window.plugins.toast.showWithOptions({
			message: _message,
			duration: 1500,
			position: 'bottom',
			addPixelsY: -40
		});
	}
})

.controller('petaCtrl', function($scope, $state, $stateParams, Services, $cordovaToast, $cordovaGeolocation, $ionicPopup, Analytics, $localStorage) {
	$scope.category = 'Peta';
	var options = {timeout: 10000, enableHighAccuracy: true};

	$scope.$on('$ionicView.enter', function() {
		// trackView
		Analytics.logView('Peta');
		// trackMerchant
		Analytics.logMerchant($stateParams.index, 'Lihat Peta');
    	// trackUser View
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackView',
					'Peta'
				]);
    	// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackMerchant',
					$stateParams.index,
					'Lihat Peta'
				]);
	});

	Services.getRestoranDetails($stateParams.index).then(function(restoran) {
		if(restoran) {
			$scope.restoran = restoran;
			var restoLat = restoran.map.lat;
			var restoLng = restoran.map.long;

			var latLng = new google.maps.LatLng(restoLat, restoLng); 
			console.log(restoran.map.lat);
			console.log(restoran.map.long); 

			var mapOptions = {
				center: latLng,
				zoom: 15,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};

			$scope.map = new google.maps.Map(document.getElementById("mangan-peta"), mapOptions);
			google.maps.event.addListenerOnce($scope.map, 'idle', function(){
				var marker = new google.maps.Marker({
					map: $scope.map,
					animation: google.maps.Animation.DROP,
					position: latLng,
					icon: 'img/marker.png'
				});

				var contentString = '<div style="width: 200px; font-size: 14px;"><center><p><b>'+restoran.namaResto+'</b></p><p>'+restoran.keteranganBuka+'</p><a href="tel:'+restoran.noTelp+'" style="color:blue; text-decoration:none;">Hubungi</a></center></div>';

				var infoWindow = new google.maps.InfoWindow({
					content: contentString,
					maxWidth: 500
				});

				google.maps.event.addListener(marker, 'click', function () {
					infoWindow.open($scope.map, marker);
				});

				infoWindow.open($scope.map, marker);
			});

			$scope.openUrl = function() {
				// trackEvent
				Analytics.logEvent('Peta','Tombol Navigasikan');
				Analytics.logEvent('Kuliner','Navigasikan');
				// trackMerchant
				Analytics.logMerchant($stateParams.index, 'Navigate');
				// trackUser Event
				Analytics.logUserArr([
							$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
							'trackEvent',
							'Peta',
							'Tombol Navigasikan'
						]);
				Analytics.logUserArr([
							$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
							'trackEvent',
							'Kuliner',
							'Navigasikan'
						]);
				// trackUser Merchant
				Analytics.logUserArr([
							$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
							'trackMerchant',
							$stateParams.index,
							'Navigate'
						]);
				$cordovaGeolocation.getCurrentPosition(options).then(function(position){
					var lat = position.coords.latitude;
					var lng = position.coords.longitude;
					window.open('http://maps.google.com/maps?saddr=+'+lat+'+,+'+lng+'+&daddr=+'+restoLat+'+,+'+restoLng+'+&dirflg=d', '_system', 'location=yes');
					return false;
				}, function(error){
					console.log("Could not get location");
					window.open('http://maps.google.com/maps?saddr=Current+Location&daddr=+'+restoLat+'+,+'+restoLng+'+&dirflg=d', '_system', 'location=yes');
				});
			}
		} else {
			makeToast('Koneksi tidak stabil', 1500, 'bottom');
			console.log('failure');
		}
	}, function(reason) {	
		$scope.restoran = null;
		makeToast('Koneksi tidak stabil', 1500, 'bottom');
		console.log('error');
	});

	function makeToast(_message) {
		window.plugins.toast.showWithOptions({
			message: _message,
			duration: 1500,
			position: 'bottom',
			addPixelsY: -40
		});
	}
})

.controller('terdekatCtrl', function($scope, $state, $stateParams, Services, $cordovaGeolocation, $ionicPopup, $ionicLoading, Analytics, $http, $localStorage) {
	//////////////////////////////////////////////////////////////////
	//
	// load map, use current location, if not available, use default
	//
	//////////////////////////////////////////////////////////////////
	$scope.category = 'Terdekat';
	if ($localStorage.location == "Yogyakarta") {
		// default location yogyakarta, 0 KM
		var coords = {latitude: -7.8011929, longitude: 110.3640875};
	} else {
		//  default location, Surakarta
		var coords = {latitude: -7.569527, longitude: 110.830289};
	}
	var options = {timeout: 10000, enableHighAccuracy: true};
	var openedInfo = null;

	$ionicLoading.show({
		template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
		timeout: 10000
	});

	$scope.$on('$ionicView.enter', function() {
		$ionicLoading.show({
			template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
			timeout: 1000
		});

		$scope.restoranList = {};
		$scope.nodata = null;
		coords = {}

		if ($localStorage.location == "Yogyakarta") {
			coords = {latitude: -7.8011929, longitude: 110.3640875};
		} else {
			coords = {latitude: -7.569527, longitude: 110.830289};
		}
		// trackView
		Analytics.logView('Terdekat');
		// trackUser View
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackView',
					'Terdekat'
				]);
		$scope.getTerdekat();
	});
	
	$scope.getTerdekat = function() {
		$cordovaGeolocation.getCurrentPosition(options).then(function(position) {
			if(position) {
				// trackEvent
				Analytics.logEvent('Terdekat', 'GPS', 'Found');
				// trackUser Event
				Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					"trackEvent",
					"Terdekat",
					"GPS",
					'Found'
				]);
				console.log('position aru');
				coords = position.coords;
			}
			showMap();
		}, function(error) {
			console.log("could not get location");
			// trackEvent
			Analytics.logEvent('Terdekat', 'GPS', 'Not Found');
			// trackUser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Terdekat",
				"GPS",
				'Not Found'
			]);
			$ionicLoading.hide();

			$ionicPopup.alert({
				title: 'Error',
				template: 'Tidak dapat menemukan sinyal GPS!',
				okText: 'OK',
				okType: 'button-oren'
			});
			showMap();
		});
	}

	function showMap() {
		var latlon = new google.maps.LatLng(coords.latitude, coords.longitude);
		$http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng="+coords.latitude+","+coords.longitude+"&key=AIzaSyDcTH7G919_ydCKS_wvqoCkyH9lFMDvhgQ").success(function(result) {
			$scope.currentLocation = result.results[0].address_components[2].short_name+', '+result.results[0].address_components[3].short_name;
			console.log($scope.currentLocation);
		}).error(function(error) {
			console.log('data error : '+error);
		});

		var mapOptions = {
			center: latlon,
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};

		$scope.map = new google.maps.Map(document.getElementById('mangan-peta'), mapOptions);
		$scope.markers = [];

		// wait till map loaded
		google.maps.event.addListener($scope.map, 'idle', function() {
			// trackEvent
			Analytics.logEvent('Terdekat', 'Load Maps');
			// trackUser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Terdekat",
				"Load Maps"
			]);
			var userMarker = new google.maps.Marker({
				map: $scope.map,
				icon: '',
				position: latlon
			});
			addMarkers();
		});
	}

	function addMarkers() {
		var bounds = $scope.map.getBounds();
		var ne = bounds.getNorthEast();
		var sw = bounds.getSouthWest();
		Services.getRestoransByLocation(sw.lng(), ne.lng()).then(function(restorans) {
			if(restorans) {
				for(var r in restorans) {
					var location = restorans[r].map;
					if(location.lat < sw.lat() || location.lat > ne.lat()) {
						delete restorans[r];
					}
				}

				$scope.restorans = restorans;

				var i = 0, j = 0;
				for(var r in restorans) {
					i++;
					if(restorans[r].map) {
						var lat = restorans[r].map.lat;
						var lon = restorans[r].map.long;

						if(lat && lon) {
							var rLatlon = new google.maps.LatLng(lat, lon);

							var marker = new google.maps.Marker({
								map: $scope.map,
								position: rLatlon,
								icon: 'img/marker.png'
							});

							var contentString = restorans[r].namaResto;
							addInfoWindow(marker, contentString, restorans[r].index);

							$scope.markers.push(marker);

							j++;
						} else {
							console.log('...');
						}
					}
				}

				for (var key in restorans) {
					if (restorans.hasOwnProperty(key)) {
						$scope.restoranList[key] = restorans[key];
						var oLat = coords.latitude;
						var oLong = coords.longitude;
						var dLat = restorans[key].map.lat;
						var dLong = restorans[key].map.long;
						getDistanceMatrix(oLat, oLong, dLat, dLong, key);
					}
				}

				if (i == 0) {
					$scope.nodata = false;
				} else {
					$scope.nodata = true;
				}
			} else {
				$scope.nodata = false;
			}
			$ionicLoading.hide();
		}, function(reason) {
			$scope.nodata = false;
			$ionicLoading.hide();
		});
	}

	function getDistanceMatrix(oLat, oLong, dLat, dLong, keyResto) {
		var url = 'https://maps.googleapis.com/maps/api/distancematrix/';
		var type = 'json';
		var key = 'AIzaSyDcTH7G919_ydCKS_wvqoCkyH9lFMDvhgQ';
		$http.get(url+type+'?origins='+oLat+','+oLong+'&destinations='+dLat+','+dLong+'&key='+key).success(function(result) {
			$scope.restoranList[keyResto].jarak = result.rows[0].elements[0].distance.value;
		}).error(function(error) {
			$scope.restoranList[keyResto].jarak = getDistance(oLat, oLong, dLat,dLong);
		});
	}

	function rad(x) {
		return x * Math.PI / 180;
	};

	function getDistance(lat1, lon1, lat2, lon2) {
		var R = 6378137; // Earth’s mean radius in meter
		var dLat = rad(lat2 - lat1);
		var dLong = rad(lon2 - lon1);
		var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(rad(lat1)) * Math.cos(rad(lat2)) *
		Math.sin(dLong / 2) * Math.sin(dLong / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var d = R * c;
		return d; // returns the distance in meter
	};

	function addInfoWindow(marker, message, index) {
		var infoWindow = new google.maps.InfoWindow({
			content: '<div style="width: auto; font-size: 14px;""><center><a href="#/page1/tab1/restoran/'+ index +'" style="text-decoration: none; color:black; font-weight: 300;"><b>'+ message +'</b><p>Lihat</p></a></center></div>',
			maxWidth: 150
		});

		google.maps.event.addListener(marker, 'click', function () {
			// trackEvent
			Analytics.logEvent('Terdekat', 'Marker', 'Click');
			// trackUser Event
			Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				"trackEvent",
				"Terdekat",
				"Marker",
				'Click'
			]);
			if(openedInfo) {
				openedInfo.close();
			}
			openedInfo = infoWindow;
			
			infoWindow.open($scope.map, marker);
		});

		addInfoListener(infoWindow, message);
	}

	function addInfoListener(infoWindow, message) {
		google.maps.event.addDomListener(infoWindow, 'click', function() {
			console.log(message);
		});
	}

	$scope.openRestoran = function(index) {
		// trackEvent
		Analytics.logEventArr(['Buka Restoran', 'Terdekat']);
		Analytics.logEventArr(['Terdekat', 'Buka Restoran']);
		// trackUser Event
		Analytics.logUserArr([
			$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
			"trackEvent",
			"Buka Restoran",
			"Terdekat"
		]);
		Analytics.logUserArr([
			$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
			"trackEvent",
			"Terdekat",
			"Buka Restoran"
		]);
		$state.go('tabsController.restoran', {index: index});
	}

	$scope.jelajahi = function() {
		// trackEvent
		Analytics.logEvent('Terdekat', 'Tombol Jelajahi');

		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Terdekat',
					'Tombol Jelajahi'
				]);
		$state.go('tabsController.restorans', {category: 'all', 'name': 'Terbaru'});
	}

	$scope.getFoundCount = function(restoranList) {
		if (restoranList) {
			var size = Object.keys(restoranList).length;
			return size;
		}
		return null;
	}
})
 
.controller('ulasanMenuCtrl', function($scope, $state, $stateParams, Services, Analytics, $localStorage) {
	$scope.getMenu = function() {
		$scope.selectedMenu = $stateParams.selectedMenu;
		console.log('ulasanMenu');
		$scope.$broadcast('scroll.refreshComplete');
	}

	$scope.getMenu();
})

.controller('promoCtrl', function($scope, $state, $ionicLoading, $cordovaToast, Services, $timeout, $localStorage, Analytics, $ionicModal, $cordovaSocialSharing) {
	var loadFlag = false;
	var loadingIndicator = $ionicLoading.show({
      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>'
    });

	$ionicModal.fromTemplateUrl('templates/promoModal.html', {
		scope: $scope,
		animation: 'slide-in-up' 
	}).then(function(modal) { $scope.modal = modal; });

    $timeout(function() {
    	$ionicLoading.hide();
    	if(!loadFlag) {
    		makeToast('Koneksi tidak stabil');
    	}
    }, 10000);

	$scope.$on('$ionicView.enter', function() {
		// trackView
		Analytics.logView('Promo');
		// trackUser View
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackView',
					'Promo'
				]);

		$scope.getPromos();
	});

	$scope.openPromo = function(index) {
		// trackEvent
		Analytics.logEvent('Promo', index, 'Click');
		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Promo',
					index,
					'Click'
				]);
		$state.go('tabsController.restoran', {'index': index});
	}

	$scope.getPromos = function() {
    	$scope.promos = null;
	    Services.getPromos().then(function(promos) {
	    	loadFlag = true;
	    	if (promos) {
		    	$scope.promos = promos;
		    	$ionicLoading.hide();
	    	} else {
	    		makeToast('Nantikan Promo Menarik', 1500, 'bottom');
	    		console.log('Error fetch data');
	    		$ionicLoading.hide();
	    	}
	    }, function(err) {
			makeToast('Koneksi tidak stabil', 1500, 'bottom');
	    	console.log(err);
	    }).finally(function() {
			$scope.$broadcast('scroll.refreshComplete');
	    });
	}

	$scope.openModal = function(index) {
		// trackView
		Analytics.logView('Detail Promo');
		// trackEvent
		Analytics.logEvent('Promo', index, 'Click');
		// trackUser View
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackView',
					'Detail Promo'
				]);
		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Promo',
					index,
					'Click'
				]);
		$scope.selectedPromo = $scope.promos[index];
		$scope.modal.show();
	}

	$scope.sharePromo = function(selectedPromo) {
		console.log('Promo, Share, '+selectedPromo.index);
		var link = selectedPromo.extUrl;
		var gambar = selectedPromo.sharedImg;
		var textshared = selectedPromo.namaPromo+' - '+selectedPromo.keterangan+" - Valid hingga : "+selectedPromo.valid+" Nantikan promo menarik lainnya di Aplikasi MANGAN";

		$cordovaSocialSharing.share(textshared, selectedPromo.keterangan, gambar, link)
		.then(function(result) {
			// trackEvent
			Analytics.logEvent('Promo', selectedPromo.index, 'Share');
			Analytics.logEvent('Share', 'Promo', 'Success');

			// trackUser Event
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Promo',
						selectedPromo.index,
						'Share'
					]);
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Share',
						'Promo',
						'Success'
					]);
			makeToast('Berhasil membagikan', 1500, 'bottom');
		}, function(err) {
			// trackEvent
			Analytics.logEvent('Share', 'Promo', 'Error');
			// trackUser Event
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Share',
						'Promo',
						'Error'
					]);
			makeToast('Gagal membagikan', 1500, 'bottom');
		});
	}

	$scope.gotoUrl = function(selectedPromo) {
		if (selectedPromo.extUrl) {
			// trackEvent
			Analytics.logEvent('Promo', selectedPromo.index, 'OpenUrl');
			// trackUser Event
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Promo',
						selectedPromo.index,
						'OpenUrl'
					]);
			window.open(selectedPromo.extUrl, '_system', 'location=yes');		
		}
	}

	$scope.restoran = function(selectedPromo) {
		// trackEvent
		Analytics.logEvent('Promo', selectedPromo.index, 'OpenRestoran');
		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Promo',
					selectedPromo.index,
					'OpenRestoran'
				]);
		$state.go('tabsController.restoran', {'index': selectedPromo.indexResto});
		$scope.modal.hide();
	}

	$scope.getPromos();

	function makeToast(_message) {
		window.plugins.toast.showWithOptions({
			message: _message,
			duration: 1500,
			position: 'bottom',
			addPixelsY: -40
		});
	}
})

.controller('loginCtrl', function($scope, $state, $ionicLoading, Services, $ionicHistory, $cordovaOauth, $localStorage, $http, Analytics, $ionicPopup, $cordovaToast) {
	// trackView
	Analytics.logView('Auth');
	// trackUser View
	Analytics.logUserArr([
				$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
				'trackView',
				'Auth'
			]);

	$scope.fblogin = function() {
		// trackEvent
		Analytics.logEvent('Auth', 'Tombol', 'Facebook');
		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Auth',
					'Tombol',
					'Facebook'
				]);
		$cordovaOauth.facebook(1764800933732733, ["email", "user_birthday", "user_location"]).then(function(result) {
			console.log(result.access_token);
			$localStorage.fbaccesstoken = result.access_token;
			var credential = firebase.auth.FacebookAuthProvider.credential($localStorage.fbaccesstoken);
			firebase.auth().signInWithCredential(credential).catch(function(error) {
				if (error.code === "auth/account-exists-with-different-credential") {
					alert('Email telah digunakan dengan metode lain');
				}
			});
			$ionicLoading.show({
		      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>'
		    });
		}, function(err) {
			console.log('Error oAuth facebook: '+err);
		})
	}

	$scope.googlelogin = function() {
		// trackEvent
		Analytics.logEvent('Auth', 'Tombol', 'Google');
		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Auth',
					'Tombol',
					'Google'
				]);
		$cordovaOauth.google("1054999345220-m4vlisv7o0na684cgcg13s1tj2t4v447.apps.googleusercontent.com", ["email", "profile"]).then(function(result) {
			$localStorage.googleidtoken = result.id_token;
			$localStorage.googleaccesstoken = result.access_token;
			var credential = firebase.auth.GoogleAuthProvider.credential($localStorage.googleidtoken);
			firebase.auth().signInWithCredential(credential).catch(function(error) {
				console.log("Error : "+JSON.stringify(error));
			});
			$ionicLoading.show({
		      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>'
		    });
		}, function(err) {
			console.log('Error oAuth google: '+err);
		})
	}

	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			console.log("uid: "+user.uid);
			$scope.user = user;
			user.providerData.forEach(function(profile) {
				if (profile.providerId === "facebook.com") {
					Services.getProfileByUid(profile.uid).then(function(user) {
						if (user) {
							Analytics.logEvent('Auth', 'Sign In', 'Facebook');
							// trackUser Event
							Analytics.logUserArr([
										$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
										'trackEvent',
										'Auth',
										'Sign In',
										'Facebook'
									]);
							makeToast('Berhasil Login');
							$http.get("https://graph.facebook.com/v2.8/me?fields=name,location,birthday,gender,picture.type(large){url},age_range,email,about", {params :{
								access_token : $localStorage.fbaccesstoken,
								format : "json"
							}}).then(function(result) {
								$localStorage.indexUser = result.data.id;
								$scope.dataUser = result.data;
								Services.updateUserDataLoginFb($scope.dataUser, $scope.user);
							});
						} else {
							Analytics.logEvent('Auth', 'Sign Up', 'Facebook');
							Analytics.logUserArr([
										$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
										'trackEvent',
										'Auth',
										'Sign Up',
										'Facebook'
									]);
							$http.get("https://graph.facebook.com/v2.8/me?fields=name,location,birthday,gender,picture.type(large){url},age_range,email,about", {params :{
								access_token : $localStorage.fbaccesstoken,
								format : "json"
							}}).then(function(result) {
								$localStorage.indexUser = result.data.id;
								$scope.dataUser = result.data;
								Services.addUserData($scope.dataUser, $scope.user).then(function(user) {
									makeToast('Berhasil Login');
									console.log(user);
								}, function(err) {
									firebase.auth().signOut().then(function() {
										makeToast('Login gagal, coba dengan email lain');
									});
								})
							});
						}
					}, function(err) {
						Analytics.logEvent('Auth', 'Auth Failed');
						Analytics.logUserArr([
									$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
									'trackEvent',
									'Auth',
									'Auth Failed'
								]);
						firebase.auth().signOut();
						makeToast('Login gagal, koneksi tidak stabil');
					})
					checkWizardData();
				} else if (profile.providerId === "google.com") {
					Services.getProfileByUid(profile.uid).then(function(user) {
						if (user) {
							Analytics.logEvent('Auth', 'Sign In', 'Google');
							Analytics.logUserArr([
										$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
										'trackEvent',
										'Auth',
										'Sign In',
										'Google'
									]);
							makeToast('Berhasil Login');
							$http.get("https://www.googleapis.com/userinfo/v2/me?fields=email,family_name,gender,given_name,hd,id,link,locale,name,picture,verified_email", {
								headers :{
									"Authorization" : "Bearer "+$localStorage.googleaccesstoken
								}
							}).then(function(result) {
								$localStorage.indexUser = result.data.id;
								$scope.dataUser = result.data;
								Services.updateUserDataLoginGoogle($scope.dataUser, $scope.user);
							});
						} else {
							Analytics.logEvent('Auth', 'Sign Up', 'Google');
							Analytics.logUserArr([
										$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
										'trackEvent',
										'Auth',
										'Sign Up',
										'Google'
									]);
							$http.get("https://www.googleapis.com/userinfo/v2/me?fields=email,family_name,gender,given_name,hd,id,link,locale,name,picture,verified_email", {
								headers :{
									"Authorization" : "Bearer "+$localStorage.googleaccesstoken
								}
							}).then(function(result) {
								$localStorage.indexUser = result.data.id;
								$scope.dataUser = result.data;
								Services.addUserDataByGoogle($scope.dataUser, $scope.user).then(function(user) {
									makeToast('Berhasil Login');
								}, function(err) {
									firebase.auth().signOut().then(function() {
										makeToast('Login gagal, coba dengan email lain');
									});
								})
							});
						}
					}, function(err) {
						// trackEvent
						Analytics.logEvent('Auth', 'Auth Failed');
						// trackUser Event
						Analytics.logUserArr([
									$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
									'trackEvent',
									'Auth',
									'Auth Failed'
								]);
						firebase.auth().signOut();
						makeToast('Login gagal, koneksi tidak stabil');
					})
					checkWizardData();
				}  else {
					// trackEvent
					Analytics.logEvent('Auth', 'Auth Failed');
					// trackUser Event
					Analytics.logUserArr([
								$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
								'trackEvent',
								'Auth',
								'Auth Failed'
							]);
					firebase.auth().signOut();
					makeToast('Login gagal, coba dengan email lain');
					$ionicLoading.hide();
					$ionicHistory.goBack();
				}
			});
		}
	});

	function checkWizardData() {
		var indexUser = $localStorage.indexUser ? $localStorage.indexUser : $localStorage.token;
		Services.getProfileByUid(indexUser).then(function(result) {
			if (!(result && result.hasOwnProperty('gender') && result.hasOwnProperty('dateOfBirth'))) {
				$ionicLoading.hide();	
				$state.go('registration');
			} else {
				$ionicLoading.hide();
				$ionicHistory.goBack();
			}
		}, function(reason) {
			console.log("cannto retrieve profile");
			$ionicLoading.hide();
			$ionicHistory.goBack();
		});
	}

	function makeToast(_message) {
		window.plugins.toast.showWithOptions({
			message: _message,
			duration: 1500,
			position: 'bottom',
			addPixelsY: -40
		});
	};
})

.controller('profilCtrl', function($scope, $state, $ionicLoading, Services, $http, $localStorage, $ionicHistory, $ionicModal, $cordovaGeolocation, $ionicPopup, $cordovaToast, Analytics) {
	$ionicLoading.show({
      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
      duration: 5000
    });

	$scope.$on('$ionicView.enter', function() {
		// trackView
		Analytics.logView('Profil');
		// trackUser View
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackView',
					'Profil'
				]);
		var user = firebase.auth().currentUser;
		if (user) {
			user.providerData.forEach(function(profile) {
				if (profile.providerId === "facebook.com") {
					$scope.getProfileByUid(profile.uid);
				} else if (profile.providerId === "google.com") {
					$scope.getProfileByUid(profile.uid);
				} else {
					console.log('logged in with another provider');
				}
			});
		} else {
			$state.go('tabsController.tersimpan');
		}
	});

	$scope.getProfileByUid = function(uid) {
		Services.getProfileByUid(uid).then(function(dataUser) {
			if (dataUser) {
				$scope.dataUser = dataUser;
				$ionicLoading.hide();
			} else {
				console.log('profil no dataUser found with uid:'+uid);
				makeToast('Data tidak ditemukan');
			}
		})
	} 

	$scope.updateUserData = function() {
		// trackEvent
		Analytics.logEvent('Profil', 'Tombol Update');
		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Profil',
					'Tombol Update'
				]);
		$ionicLoading.show({
	      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
	      duration: 5000
	    });

		Services.updateUserData($scope.dataUser).then(function(result) {
			$ionicLoading.hide();
			// trackEvent
			Analytics.logEvent('Profil', 'Update');
			// trackUser Event
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Profil',
						'Update'
					]);
			makeToast('Data berhasil diperbarui');
		}, function(err) {
			console.log('error');
			$ionicLoading.hide();
		});
	}

	$scope.signOut = function() {
		firebase.auth().signOut().then(function() {
			// trackEvent
			Analytics.logEvent('Auth', 'Sign Out');
			Analytics.logEvent('Profil', 'Tombol Sign Out')
			// trackUser Event
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Auth',
						'Sign Out'
					]);
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Profil',
						'Tombol Sign Out'
					]);
			$state.go('tabsController.tersimpan');
			$ionicHistory.removeBackView();
		}, function(error) {
			console.log(error);
		});
	}

	$scope.getDate = function(timestamp) {
		var x = new Date(timestamp);
		var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		var year = x.getFullYear();
		var month = months[x.getMonth()];
		var date = x.getDate();
		var time = date + ' ' + month + ' ' + year;
		return time;
	}

	function makeToast(_message) {
		window.plugins.toast.showWithOptions({
			message: _message,
			duration: 1500,
			position: 'bottom',
			addPixelsY: -40
		});
	}
})

.controller('pesanCtrl', function($scope, $stateParams, Services, $ionicModal, $ionicLoading, $cordovaToast, $ionicPopup, $state, $timeout, $ionicHistory, Analytics, $localStorage, $ionicPlatform) {
    $scope.tambahan = {};

	var loadingIndicator = $ionicLoading.show({
      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>'
    });

    $timeout(function() {
    	$ionicLoading.hide();
    	if(!loadFlag) {
    		makeToast('Koneksi tidak stabil');
    	}
    }, 10000);

    $scope.$on('$ionicView.enter', function() {
    	// trackView
    	Analytics.logView('Pesan');
	    // trackMerchant
	    Analytics.logMerchant($stateParams.index, 'Pilih Menu');
	    // trackUser View
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackView',
					'Pesan'
				]);
		// trackUser Merchant
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackMerchant',
					$stateParams.index,
					'Pilih Menu'
				]);
    });

	$scope.$on('$ionicView.leave', function() {
		var forwardView = $ionicHistory.forwardView();
		if (forwardView) {
			if (forwardView.title != "Invoice") {
				// trackEvent
				Analytics.logEvent('Pesan', 'Batal');
				Analytics.logEvent('Pesan Antar', 'Batal Pesan');
				// trackUser Event
				Analytics.logUserArr([
							$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
							'trackEvent',
							'Pesan',
							'Batal'
						]);
				Analytics.logUserArr([
							$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
							'trackEvent',
							'Pesan Antar',
							'Batal Pesan'
						]);
				$ionicPopup.alert({
					title: 'Pesanan Dibatalkan',
					template: '<center>Dengan Meninggalkan Halaman Tadi, Maka Daftar Pesanan Kamu Telah Dibatalkan</center>',
					okText: 'OK',
					okType: 'button-oren'
				});
			}
		}
    });

    Services.getRestoranDetails($stateParams.index).then(function(restoran) {
    	if (restoran) {
    		$scope.restoran = restoran;
    	} else {
    		console.log('Error fetch data restoran');
    	};
    })

    $scope.getMenus = function() {
		Services.getRestoranMenus($stateParams.index).then(function(menus) {
			if(menus) {
				loadFlag = true;
				$scope.menus = menus;
				for(var id in $scope.menus) {
					$scope.menus[id].quantity = 0;
				}
				$ionicLoading.hide();
			} else {
				makeToast('Error, tidak ada menu', 1500, 'bottom');
				console.log('Error menu tidak ada');
			}
		}, function(err) {
			makeToast('Koneksi tidak stabil', 1500, 'bottom');
			console.log('Error fetch data');
		}).finally(function() {
			$scope.$broadcast('scroll.refreshComplete');
		});
    }

	$scope.minQuantity = function(index, quantity) {
		if (quantity > 0) {
			$scope.menus[index].quantity = quantity - 1;
			// trackEvent
			Analytics.logEvent('Pesan', 'Menu', 'Kurangi');
			Analytics.logEvent('Pesan Antar', 'Kurangi Menu');
			// trackUser Event
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Pesan',
						'Menu',
						'Kurangi'
					]);
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Pesan Antar',
						'Kurangi Menu'
					]);
		} else {
			$scope.menus[index].quantity = 0;
		}
	}

	$scope.addQuantity = function(index, quantity) {
		if (quantity >= 0) {
			$scope.menus[index].quantity = quantity + 1;
			// trackEvent
			Analytics.logEvent('Pesan', 'Menu', 'Tambah');
			Analytics.logEvent('Pesan Antar', 'Tambah Menu');
			// trackUser Event
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Pesan',
						'Menu',
						'Tambah'
					]);
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Pesan Antar',
						'Tambah Menu'
					]);
		} else {
			$scope.menus[index].quantity = 0;
		}
	}

	$scope.invoice = function() {
		$scope.selectedMenus = [];
		for(var id in $scope.menus) {
			if ($scope.menus[id].quantity > 0) {
				$scope.selectedMenus.push($scope.menus[id]);
			}
		}
		if ($scope.selectedMenus == "") {
			// trackEvent
			Analytics.logEvent('Pesan', 'Alert', 'Minimal Menu');
			// trackUser Event
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Pesan',
						'Alert',
						'Minimal Menu'
					]);
			$ionicPopup.alert({
				title: 'Pilih pesanan',
				template: '<center>Kamu harus memilih pesanan minimal 1</center>',
				okText: 'OK',
				okType: 'button-oren'
			});
		} else if($scope.selectedMenus !== ""){
			var user = firebase.auth().currentUser;
			if (user) {
				user.providerData.forEach(function(profile) {
					$scope.uid = profile.uid
				});
			} else {
				// trackEvent
				Analytics.logEvent('Pesan', 'Alert', 'Login');
				// trackUser Event
				Analytics.logUserArr([
							$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
							'trackEvent',
							'Pesan',
							'Alert',
							'Login'
						]);
				$ionicPopup.alert({
					title: 'Belum login',
					template: '<center>Kamu harus login dulu</center>',
					okText: 'OK',
					okType: 'button-oren'
				});
				$state.go('login');
			}

			$ionicLoading.show({
		      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
		      duration: 5000
		    });

			Services.getProfileByUid($scope.uid).then(function(dataUser) {
				if (dataUser) {
					Services.getRestoranDetails($stateParams.index).then(function(restoran) {
						if (restoran) {
							console.log(restoran.gambar);
							if ($scope.transaksi) {
								$scope.transaksi.pesanan = $scope.selectedMenus;
							} else {
								$scope.transaksi = {
									'indexUser' : dataUser.index,
									'alamat' : restoran.alamat,
									'alamatUser' : null,
									'feedelivery' : 0,
									'indexResto' : restoran.index,
									'keteranganBuka' : restoran.keteranganBuka,
									'gambarResto' : restoran.gambar[0],
									'indexTransaksi' : Date.now()+$scope.uid+restoran.index,
									'jumlah' : null,
									'kurir' : null,
									'map' : {
										'lat' : restoran.map.lat,
										'long' : restoran.map.long
									},
									'mapUser' : {
										'lat' : null,
										'long' : null
									},
									'namaResto' : restoran.namaResto,
									'namaUser' : dataUser.name,
									'noTelpUser' : dataUser.noTelpUser,
									'pesanan' : $scope.selectedMenus,
									'status' : 'queue',
									'processBy' : null,
									'tgl' : firebase.database.ServerValue.TIMESTAMP,
									'totalHarga' : null,
									'userPhotoUrl' : dataUser.photoUrl,
									'username' : $scope.uid,
									'lineUsername' : dataUser.lineUsername || null,
									'tambahan' : $scope.tambahan.catatan || null,
									'device_token' : $localStorage.token
								}
							}
							$ionicLoading.hide();
							// trackEvent
							Analytics.logEvent('Pesan', 'Tombol Lanjutkan');
							Analytics.logEvent('Pesan Antar', 'Invoice');
							// trackUser Event
							Analytics.logUserArr([
										$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
										'trackEvent',
										'Pesan',
										'Tombol Lanjutkan',
									]);
							Analytics.logUserArr([
										$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
										'trackEvent',
										'Pesan Antar',
										'Invoice'
									]);
							$state.go('tabsController.invoice', {'transaksi': $scope.transaksi});
						}
					});
				}
			});
		}
	}

    $scope.getMenus();

	function makeToast(_message) {
		window.plugins.toast.showWithOptions({
			message: _message,
			duration: 1500,
			position: 'bottom',
			addPixelsY: -40
		});
	}
})

.controller('invoiceCtrl', function($scope, $state, $stateParams, Services, $ionicHistory, $ionicModal, $ionicPopup, $cordovaGeolocation, $http, $ionicLoading, Analytics, $localStorage){
	$scope.invoice = function() {
		$scope.transaksi = $stateParams.transaksi;
		$scope.transaksi.jumlah = jumlah();
		$scope.transaksi.totalHarga = totalHarga();
	}

	$scope.getKurir = function(){
		Services.getKurir().then(function(listKurir) {
			$scope.listKurir = [];
			for(var r in listKurir){
				if (listKurir[r].show) {
					$scope.listKurir.push(listKurir[r]);
					console.log("listKurir[r] adalah :"+JSON.stringify(listKurir[r]));
				}
			}
		})
	}

	$scope.$on('$ionicView.enter', function() {
    	$scope.invoice();
		$scope.getKurir();
		// trackView
		Analytics.logView('Invoice');
		// trackMerchant
		Analytics.logMerchant($scope.transaksi.indexResto, 'Invoice');

		// trackUser View
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackView',
					'Invoice'
				]);
		// trackUser Merchant
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackMerchant',
					$scope.transaksi.indexResto,
					'Invoice'
				]);
    });

	function jumlah() {
		var jumlah = 0;
		var hnq = 0;
		for(var id in $scope.transaksi.pesanan) {
			hnq = $scope.transaksi.pesanan[id].harga*$scope.transaksi.pesanan[id].quantity;
			jumlah += hnq;
			hnq = 0;
		}
		return jumlah;
	}

	function totalHarga() {
		var total = 0;
		var total = jumlah();
		total += $scope.transaksi.feedelivery;
		return total;
	}

	$scope.minQuantity = function(index, quantity) {
		console.log(index, quantity);
		if (quantity > 1) {
			$scope.transaksi.pesanan[index].quantity = quantity - 1;
			// trackEvent
			Analytics.logEvent('Invoice', 'Menu', 'Kurangi');
			Analytics.logEvent('Pesan Antar', 'Kurangi Menu');
			// trackUser Event
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Invoice',
						'Menu',
						'Kurangi'
					]);
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Pesan Antar',
						'Kurangi Menu'
					]);
		} else {
			$scope.transaksi.pesanan[index].quantity = 1;
		}
		$scope.transaksi.jumlah = jumlah();
		$scope.transaksi.totalHarga = totalHarga();
	}

	$scope.addQuantity = function(index, quantity) {
		console.log(index, quantity);
		if (quantity >= 1) {
			$scope.transaksi.pesanan[index].quantity = quantity + 1;
			// trackEvent
			Analytics.logEvent('Invoice', 'Menu', 'Tambah');
			Analytics.logEvent('Pesan Antar', 'Tambah Menu');
			// trackUser Event
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Invoice',
						'Menu',
						'Tambah'
					]);
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Pesan Antar',
						'Tambah Menu'
					]);
		} else {
			$scope.transaksi.pesanan[index].quantity = 1;
		}
		$scope.transaksi.jumlah = jumlah();
		$scope.transaksi.totalHarga = totalHarga();
	}

	$scope.addOrder = function() {
		// trackEvent
		Analytics.logEvent('Invoice', 'Tambah Order');
		Analytics.logEvent('Pesan Antar', 'Tambah Order Kembali');
		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Invoice',
					'Tambah Order'
				]);
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Pesan Antar',
					'Tambah Order Kembali'
				]);
		$ionicHistory.goBack();
	}

	$scope.pickLocation = function() {
		// trackEvent
		Analytics.logEvent('Invoice', 'Lokasi', 'Pilih Lokasi');
		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Invoice',
					'Lokasi',
					'Pilih Lokasi'
				]);
		var coords = {};
		var options = { timeout: 5000, enableHighAccuracy: true };
		$cordovaGeolocation.getCurrentPosition(options).then(function(position) {
			if(position) {
				coords = position.coords;
				// trackEvent
				Analytics.logEvent('Invoice', 'Lokasi', 'Lokasi Ditemukan');
				// trackUser Event
				Analytics.logUserArr([
							$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
							'trackEvent',
							'Invoice',
							'Lokasi',
							'Lokasi Ditemukan'
						]);
			}
			showMap();
		}, function(error) {
			$ionicPopup.alert({
				title: 'Lokasi Tidak Ditemukan',
				template: '<center>Nyalakan setting GPS anda atau gunakan pencarian lokasi</center>',
				okText: 'OK',
				okType: 'button-oren'
			});
			// trackEvent
			Analytics.logEvent('Invoice', 'Lokasi', 'Lokasi Tidak Ditemukan');
			// trackUser Event
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Invoice',
						'Lokasi',
						'Lokasi Tidak Ditemukan'
					]);
			showMap();
		});

		function showMap() {
			console.log('pusat: '+ coords.latitude, coords.longitude);
			if (coords.latitude && coords.longitude) {
				var latlon = new google.maps.LatLng(coords.latitude, coords.longitude);
			} else {
				var latlon = new google.maps.LatLng(-7.569527, 110.830289);
			}

			var mapOptions = { center: latlon, zoom: 15, mapTypeId: google.maps.MapTypeId.ROADMAP };
			
			$scope.map = new google.maps.Map(document.getElementById('mangan-peta'), mapOptions);

			// create input search
			var input = (document.getElementById('pac-input'));
			var autocomplete = new google.maps.places.Autocomplete(input);
			autocomplete.bindTo('bounds', $scope.map);
			// $scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

			var infowindow = new google.maps.InfoWindow();
			var marker = new google.maps.Marker({
				map: $scope.map
			});

			google.maps.event.addListener(marker, 'click', function() {
				infowindow.open($scope.map, marker);
			});

			google.maps.event.addListener(autocomplete, 'place_changed', function() {
				// trackEvent
				Analytics.logEvent('Invoice', 'Lokasi', 'Cari Lokasi');
				// trackUser Event
				Analytics.logUserArr([
							$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
							'trackEvent',
							'Invoice',
							'Lokasi',
							'Cari Lokasi'
						]);
				infowindow.close();
				var place = autocomplete.getPlace();
				if (!place.geometry) {
					return;
				}

				if (place.geometry.viewport) {
					$scope.map.fitBounds(place.geometry.viewport);
				} else {
					$scope.map.setCenter(place.geometry.location);
					$scope.map.setZoom(17);
				}

				coords = {};
				coords.latitude = place.geometry.location.lat();
				coords.longitude = place.geometry.location.lng();

				showMap();
			});

			if (coords.latitude && coords.longitude) {
				var userMarker = new google.maps.Marker({
					map: $scope.map,
					icon: 'img/marker.png',
					position: latlon,
					draggable: true
				})

				$scope.mapUser = {
					'lat' : coords.latitude,
					'long' : coords.longitude
				}

				$scope.getAddress(coords.latitude, coords.longitude);
				$scope.transaksi.mapUser = $scope.mapUser;

				var infoWindow = new google.maps.InfoWindow({
					content: '<div id="content">Lokasi Anda Sekarang</div>',
					maxWidth: 500
				});

				infoWindow.open($scope.mapUser, userMarker);

				$http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng="+coords.latitude+","+coords.longitude+"&key=AIzaSyDcTH7G919_ydCKS_wvqoCkyH9lFMDvhgQ").success(function(result) {
					$scope.alamatUser = result.results[0].formatted_address;
					$scope.transaksi.alamatUser = $scope.alamatUser;
					infoWindow.setContent($scope.transaksi.alamatUser);
				}).error(function(error) {
					console.log('data error : '+error);
				});

				google.maps.event.addListener(userMarker, 'dragend', function(evt) {
					$scope.mapUser = {
						'lat' : evt.latLng.lat(),
						'long' : evt.latLng.lng()
					}
					$scope.getAddress(evt.latLng.lat(), evt.latLng.lng());
					updateInfoWindow();
					$scope.transaksi.mapUser = $scope.mapUser;
				})
				// });

				function updateInfoWindow() {
					infoWindow.setContent($scope.transaksi.alamatUser);
				}
			}
		}
		$scope.maps.show();
		// trackView
		Analytics.logView('Pilih Lokasi Pengiriman');
		// trackUser View
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackView',
					'Pilih Lokasi Pengiriman'
				]);
	}

    $scope.disableTap = function() {
	    var input = event.target;

	    // Get the predictions element
	    var container = document.getElementsByClassName('pac-container');
	    container = angular.element(container);

	    // Apply css to ensure the container overlays the other elements, and
	    // events occur on the element not behind it
	    container.css('z-index', '5000');
	    container.css('pointer-events', 'auto');

	    // Disable ionic data tap
	    container.attr('data-tap-disabled', 'true');

	    // Leave the input field if a prediction is chosen
	    container.on('click', function(){
	        input.blur();
	    });
    };

	$scope.checkout = function() {
		// trackEvent
		Analytics.logEvent('Invoice', 'Tombol Checkout');
		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Invoice',
					'Tombol Checkout'
				]);
		$scope.maps.remove();

		var user = firebase.auth().currentUser;
		if (user) {
			user.providerData.forEach(function(profile) {
				$scope.uid = profile.uid
			});
		} else {
			$ionicPopup.alert({
				title: 'Belum login',
				template: '<center>Kamu harus login dulu</center>',
				okText: 'OK',
				okType: 'button-oren'
			});
			// trackEvent
			Analytics.logEvent('Invoice', 'Alert', 'Login');
			// trackUser Event
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Invoice',
						'Alert',
						'Login'
					]);
			$state.go('login');
		}

		if ($scope.transaksi.namaUser == ""
			|| $scope.transaksi.alamatUser == "" 
			|| $scope.transaksi.noTelpUser == ""
			|| $scope.transaksi.kurir == ""
			|| $scope.transaksi.namaUser == null
			|| $scope.transaksi.alamatUser == null 
			|| $scope.transaksi.noTelpUser == null
			|| $scope.transaksi.kurir == null
			|| $scope.transaksi.mapUser.lat == null
			|| $scope.transaksi.mapUser.long == null) {
			$ionicPopup.alert({
				title: 'Data tidak lengkap',
				template: '<center>Mohon lengkapi data pemesanan</center>',
				okText: 'OK',
				okType: 'button-oren'
			});
		// trackEvent
		Analytics.logEvent('Invoice', 'Alert', 'Tidak Lengkap');
		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Invoice',
					'Alert',
					'Tidak Lengkap'
				]);
		} else {
			$ionicPopup.confirm({
				title: 'Konfirmasi Pesan',
				template: '<center>Apakah anda akan memesan?</center>',
				okText: 'Ya',
				cancelText: 'Tidak',
				okType: 'button-oren',
				cancelType: 'button-clear'
			}).then(function(res) {
				if(res) {
					// trackEvent
					Analytics.logEvent('Invoice', 'Konfirmasi', 'Ya');
					// trackUser Event
					Analytics.logUserArr([
								$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
								'trackEvent',
								'Invoice',
								'Konfirmasi',
								'Ya'
							]);
					$ionicLoading.show({
				      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
				      duration: 10000
				    });

					// trackEvent
					Analytics.logEvent('Pesan Antar', 'Checkout');
					// trackMerchant
					Analytics.logMerchant($scope.transaksi.indexResto, 'Transaksi');
					// trackUser Event
					Analytics.logUserArr([
								$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
								'trackEvent',
								'Pesan Antar',
								'Checkout'
							]);
					// trackUser Merchant
					Analytics.logUserArr([
								$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
								'trackMerchant',
								$scope.transaksi.indexResto,
								'Transaksi'
							]);
					Services.addTransaction($scope.transaksi.kurir, $scope.transaksi.indexTransaksi, $scope.transaksi).then(function() {
						Services.addQueue($scope.transaksi.kurir, $scope.transaksi.indexTransaksi).then(function() {
							var notificationData = {
								"notification":{
									"title":"Order Baru",
									"body":"Dari "+$scope.transaksi.namaUser+" ke "+$scope.transaksi.namaResto,
									"sound":"default",
									"icon":"fcm_push_icon"
								},
								"data":{
									"title": "Order Baru",
									"body": "Dari "+$scope.transaksi.namaUser+" ke "+$scope.transaksi.namaResto,
									"indexTransaksi": $scope.transaksi.indexTransaksi
								},
								"to":"/topics/"+$scope.transaksi.kurir,
								"priority":"high"
							}

							$http.post('https://fcm.googleapis.com/fcm/send', notificationData, {
								headers: {
									"Content-Type" : "application/json",
									"Authorization" : "key=AIzaSyD-AE-K7XNFFfwl-VWnmKW0PHMTHJBtQKo"
								}
							}).then(function(result) {
								console.log(JSON.stringify(result));
							}, function(err) {
								console.log(err);
							})

							Services.addHistory($scope.uid, $scope.transaksi.indexTransaksi, $scope.transaksi.kurir).then(function(){
								console.log('complete add history');
							});

							$ionicHistory.nextViewOptions({
								disableBack: true
							}, function(err) {
								console.log('fail '+err);
							});

							$ionicLoading.hide();
							$state.go('tabsController.jelajah');
							$ionicPopup.alert({
								title: 'Terima Kasih',
								template: '<center>Pesanan Kamu Akan Diproses</center>',
								okText: 'OK',
								okType: 'button-oren'
							}).then(function(res) {
								$state.go('tabsController.transaksi');
							})
						})
					}, function(err) {
						$ionicPopup.alert({
							title: 'Transaksi Gagal Diproses',
							template: '<center>Pastikan ada jaringan internet atau restart aplikasi</center>',
							okText: 'OK',
							okType: 'button-oren'
						});
						console.log(err);
					})
				} else {
					// trackEvent
					Analytics.logEvent('Invoice', 'Konfirmasi', 'Tidak');
					// trackUser Event
					Analytics.logUserArr([
								$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
								'trackEvent',
								'Invoice',
								'Konfirmasi',
								'Tidak'
							]);
				}
			});
		}
	}

	$scope.getAddress = function(lat, lng) {
		console.log(lat, lng);
		$ionicLoading.show({
	      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
	      duration: 2000
	    });

		$http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng="+lat+","+lng+"&key=AIzaSyDcTH7G919_ydCKS_wvqoCkyH9lFMDvhgQ").success(function(result) {
			$scope.alamatUser = result.results[0].formatted_address;
			$scope.transaksi.alamatUser = $scope.alamatUser;
			console.log($scope.alamatUser);
			$ionicLoading.hide();
		}).error(function(error) {
			console.log('data error : '+error);
			$scope.alamatUser = "";
			$ionicLoading.hide();
		});
	}

	$scope.setFeeDelivery = function(kurir) {
		Services.getKurirDetail(kurir).then(function(kurirDetail) {
			$scope.kurirDetail = kurirDetail;
			console.log(kurirDetail);
			// trackEvent
			Analytics.logEvent('Kurir', $scope.kurirDetail.index, 'Pilih');
			Analytics.logEvent('Invoice', 'Pilih Kurir');
			// trackUser Event
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Kurir',
						$scope.kurirDetail.index,
						'Pilih'
					]);
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Invoice',
						'Pilih Kurir'
					]);
		});

		Services.getFeeDelivery(kurir).then(function(ongkir) {
			$scope.transaksi.feedelivery = ongkir.ongkir;
			$scope.transaksi.totalHarga = $scope.transaksi.jumlah+$scope.transaksi.feedelivery;
		});
	}

	$scope.tambahCatatan = function() {
		// trackEvent
		Analytics.logEvent('Invoice', 'Tambah Catatan');
		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Invoice',
					'Tambah Catatan'
				]);
	}

	$ionicModal.fromTemplateUrl('templates/maps.html', {
		scope: $scope,
		animation: 'slide-in-up' 
	}).then(function(modal) { $scope.maps = modal; });
})

.controller('transaksiCtrl', function($scope, $state, $stateParams, Services, $ionicHistory, $ionicLoading, Analytics, $localStorage) {
	$scope.$on('$ionicView.enter', function() {
		// trackView
		Analytics.logView('Transaksi');
		// trackUser View
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackView',
					'Transaksi'
				]);
		var user = firebase.auth().currentUser;
		if (user) {
			user.providerData.forEach(function(profile) {
				$scope.uid = profile.uid;
				$scope.getHistory(profile.uid);
			});
		} else {
			$state.go('tabsController.tersimpan');
		}
	});

	$scope.getHistory = function(uid) {
		$scope.transactions = [];
		Services.getHistory(uid).then(function(transactions) {
			for (var id in transactions) {
				Services.getTransaksiDetails(transactions[id].kurir, transactions[id].indexTransaksi).then(function(transaksi) {
					var date = new Date();
					var currentDate = date.getTime() ;
					var lastDayTimestamp = currentDate - 604800000;
					console.log("Current Date "+currentDate);
					console.log("Date Transaksi "+transaksi.tgl);
					if (transaksi.tgl >= lastDayTimestamp) {
						console.log(transaksi.tgl);
						$scope.transactions.push(transaksi);
					}
				});
			}
			$scope.$broadcast('scroll.refreshComplete');
		}, function(err) {
			console.log('error get transactions :'+err);
			$scope.$broadcast('scroll.refreshComplete');
		})
	}

	$scope.rincianTransaksi = function(kurir, indexTransaksi) {
		// trackEvent
		Analytics.logEvent('Transaksi', 'Lihat Transaksi');
		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Transaksi',
					'Lihat Transaksi'
				]);
		$state.go('tabsController.rincianTransaksi', {kurir: kurir, indexTransaksi: indexTransaksi});
	}

	$scope.getDate = function(timestamp) {
		var x = new Date(timestamp);
		var hours  = x.getHours();
		var minute = "0"+x.getMinutes();
		var time = hours+'.'+minute.substr(-2);
		return time;
	}
})

.controller('ulasanPenggunaCtrl', function($scope, $state, $stateParams, $ionicLoading, $ionicModal, $timeout, Services, Analytics, $localStorage) {
	var loadFlag = false;
	var loadingIndicator = $ionicLoading.show({
      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>'
    });

    $timeout(function() {
    	$ionicLoading.hide();
    	if(!loadFlag) {
    		makeToast('Koneksi tidak stabil');
    	}
    }, 10000);

	$scope.$on('$ionicView.enter', function() {
		if ($stateParams.compose || $stateParams.compose != null) {
			$scope.openRating();
		}
		// trackView
		Analytics.logView('Ulasan Pengguna');
		// trackMerchant
		Analytics.logMerchant($stateParams.indexResto, 'Ulasan Pengguna');
		// trackUser View
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackView',
					'Ulasan Pengguna'
				]);
		// trackUser Merchant
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackMerchant',
					$stateParams.indexResto,
					'Ulasan Pengguna'
				]);
	});

	$scope.namaResto = $stateParams.namaResto;
	$scope.indexResto = $stateParams.indexResto;
	$scope.jmlSad = 0;
	$scope.jmlHappy = 0;
	$scope.jmlFavorite = 0;
	$scope.jmlReview = 0;
	$scope.sadSelected = false;
	$scope.happySelected = true;
	$scope.favoriteSelected = false;
	$scope.reviews = null;
	$scope.user = {
		rating: 5
	};

	$scope.ratingsObject = {
		iconOn: 'ion-ios-star',
		iconOff: 'ion-ios-star-outline',
		iconOnColor: 'orangered',
		iconOffColor: 'grey',
		rating: $scope.user.rating,
		minRating: 1,
		callback: function(rating) {
			$scope.ratingsCallback(rating);
		}
	};

	$scope.ratingsCallback = function(rating) {
		$scope.user.rating = rating;
	};

	$scope.sadFeedbackCallback = function() {
		console.log('sad');
		$scope.sadSelected = true;
		$scope.happySelected = false;
		$scope.favoriteSelected = false;
		$scope.user.rating = 1;
		$scope.user.emoji = 'sad';
	};

	$scope.happyFeedbackCallback = function() {
		console.log('happy');
		$scope.sadSelected = false;
		$scope.happySelected = true;
		$scope.favoriteSelected = false;
		$scope.user.rating = 3;
		$scope.user.emoji = 'happy';
	};

	$scope.favoriteFeedbackCallback = function() {
		console.log('favorite');
		$scope.sadSelected = false;
		$scope.happySelected = false;
		$scope.favoriteSelected = true;
		$scope.user.rating = 5;
		$scope.user.emoji = 'favorite';
	};

	$scope.saveRatingReview = function() {
		// trackEvent
		Analytics.logEvent('Ulasan Pengguna', 'Tombol Simpan Ulasan');
		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Ulasan Pengguna',
					'Tombol Simpan Ulasan'
				]);
		if ($scope.user.rating == null 
			&& $scope.user.emoji == null 
			&& $scope.user.titleReview == null
			&& $scope.user.review == null) {
			$ionicPopup.alert({
				title: 'Ups',
				template: '<center><p>Kamu harus mengisi rating atau review</p></center>',
				okText: 'OK',
				okType: 'button-oren'
			});
		} else {
			var user = firebase.auth().currentUser;
			if (user) {
				user.providerData.forEach(function(profile) {
					Services.getProfileByUid(profile.uid).then(function(dataUser) {
						if (dataUser) {
							$scope.dataUser = dataUser;
							console.log(JSON.stringify(dataUser));
							Services.updateRatingReview(
								$scope.dataUser.index,
								$scope.indexResto, 
								$scope.dataUser.name, 
								$scope.dataUser.photoUrl,
								$scope.user.rating,
								$scope.user.titleReview,
								$scope.user.review,
								$scope.user.emoji
							).then(function(result) {
								if($scope.sadSelected) {
									Services.updateJmlSad($scope.indexResto).then(function(result) {
										$scope.refreshRatingReview();
									});
								} else if($scope.happySelected) {
									Services.updateJmlHappy($scope.indexResto).then(function(result) {
										$scope.refreshRatingReview();
									});
								} else if($scope.favoriteSelected) {
									Services.updateJmlFavorite($scope.indexResto).then(function(result) {
										$scope.refreshRatingReview();
									});
								}

								$scope.refreshRatingReview();
								$scope.user = null;
								// trackMerchant
								Analytics.logMerchant($stateParams.indexResto, 'Diulas Pengguna');
								// trackUser Merchant
								Analytics.logUserArr([
											$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
											'trackMerchant',
											$stateParams.indexResto,
											'Diulas Pengguna'
										]);
							}, function(reason) {
								console.log('gagal review');
								makeToast('Gagal menambahkan ulasan');
							});
						} else {
							console.log('profil no dataUser found with uid:'+uid);
						}
					});
				});
			} else {
				$ionicPopup.alert({
					title: 'Belum login',
					template: '<center>Kamu harus login dulu</center>',
					okText: 'OK',
					okType: 'button-oren'
				});
				$state.go('login');
			};
		}
		$scope.modalRating.hide();
	};

	$scope.refreshRatingReview = function() {
		$scope.jmlReview = 0;
		Services.getRestoranReviews($stateParams.indexResto).then(function(reviews) {
			if(reviews) {
				for(var r in reviews) {
					if(reviews[r].review == undefined || reviews[r].review == null) {
						delete reviews[r];
					} else {
						$scope.jmlReview++;
					}
				}
				$scope.reviews = reviews;

				Services.getJmlSad($stateParams.indexResto).then(function(jml) {
					if(typeof jml === 'number' && jml >= 0)
						$scope.jmlSad = jml;
					else
						$scope.jmlSad = 0;
				});

				Services.getJmlHappy($stateParams.indexResto).then(function(jml) {
					if(typeof jml === 'number' && jml >= 0)
						$scope.jmlHappy = jml;
					else
						$scope.jmlHappy = 0;
				});

				Services.getJmlFavorite($stateParams.indexResto).then(function(jml) {
					if(typeof jml === 'number' && jml >= 0)
						$scope.jmlFavorite = jml;
					else
						$scope.jmlFavorite = 0;
				});

				console.log('success');
				loadFlag = true;
			}

			$ionicLoading.hide();
		}, function(reason) {
			console.log(JSON.stringify(reason));
			console.log('gagal');
			$ionicLoading.hide();
		});
		$scope.$broadcast('scroll.refreshComplete');
	};
	$scope.refreshRatingReview();


	///////////////////////////////////////////////////////////
	//
	// MODAL SECTION
	//
	///////////////////////////////////////////////////////////

	$ionicModal.fromTemplateUrl('templates/rating.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) { $scope.modalRating = modal; });

	$scope.openRating = function() {
		var user = firebase.auth().currentUser;
		if (user) {
			// trackView
			Analytics.logView('Tulis Ulasan');
			// trackEvent
			Analytics.logEvent('Ulasan Pengguna', 'Tulis Ulasan');
			// trackUser View
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackView',
						'Tulis Ulasan'
					]);
			// trackUser Event
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Ulasan Pengguna',
						'Tulis Ulasan'
					]);
			$scope.modalRating.show();
		} else {
			$state.go('login');
		}
	}

	function makeToast(_message) {
		window.plugins.toast.showWithOptions({
			message: _message,
			duration: 1500,
			position: 'bottom',
			addPixelsY: -40
		});
	}
})

.controller('rekomendasiCtrl', function($scope, $state, $stateParams, Services, $http, $ionicPopup, Analytics, $localStorage){
	$scope.data = [];

	$scope.$on('$ionicView.enter', function() {
		// trackView
		Analytics.logView('Rekomendasi Restoran');
		// trackUser View
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackView',
					'Rekomendasi Restoran'
				]);
	});

	$scope.rekomendasikan = function() {
		if ($scope.data.namaResto == "" ||
			$scope.data.alamat == "" ||
			$scope.data.jenis == "" ||
			$scope.data.namaResto == null ||
			$scope.data.alamat == null ||
			$scope.data.jenis == null) {
			// trackEvent
			Analytics.logEvent('Rekomendasi', 'Tidak Lengkap');
			// trackUser Event
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Rekomendasi',
						'Tidak Lengkap'
					]);
			$ionicPopup.alert({
				title: 'Lengkapi Data',
				template: '<center>Data belum lengkap</center>',
				okText: 'OK',
				okType: 'button-oren'
			});
		} else {
			$http.post("https://mobilepangan.com/mangan/sendMailRecomendation?nama="+$scope.data.namaResto+"&alamat="+$scope.data.alamat+"&jenis="+$scope.data.jenis+"&kontak="+$scope.data.kontak+"&alasan="+$scope.data.alasan+"&token=717mangan"
			).success(function(data) {
				console.log(data);
			}).error(function(error, status) {
				console.log(error, status);
			});
			Services.rekomendasiResto($scope.data);
			// trackEvent
			Analytics.logEvent('Rekomendasi', 'Rekomendasi');
			// trackUser Event
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Rekomendasi',
						'Rekomendasi'
					]);

			$ionicPopup.alert({
				title: 'Terima Kasih',
				template: '<center>Terima kasih telah memberikan rekomendasi</center>',
				okText: 'OK',
				okType: 'button-oren'
			});

			$state.go("tabsController.jelajah");
		}
	}
})

.controller('daftarCtrl', function($scope, $state, $stateParams, Services, $http, $ionicPopup, Analytics, $localStorage){
	$scope.data = [];
	$scope.$on('$ionicView.enter', function() {
		// trackView
		Analytics.logView('Daftar Restoran');
		// trackUser View
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackView',
					'Daftar Restoran'
				]);
	});

	$scope.daftar = function() {
		if ($scope.data.namaResto == "" ||
			$scope.data.namaPemilik == "" ||
			$scope.data.alamat == "" ||
			$scope.data.kontak == "" ||
			$scope.data.namaResto == null ||
			$scope.data.namaPemilik == null ||
			$scope.data.alamat == null ||
			$scope.data.kontak == null) {
			// trackEvent
			Analytics.logEvent('Daftar Restoran', 'Tidak Lengkap');
			// trackUser Event
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Daftar Restoran',
						'Tidak Lengkap'
					]);
			$ionicPopup.alert({
				title: 'Lengkapi Data',
				template: '<center>Data belum lengkap</center>',
				okText: 'OK',
				okType: 'button-oren'
			});
		} else {
			$http.post("https://mobilepangan.com/mangan/sendMailRegister?nama="+$scope.data.namaResto+"&namapemilik="+$scope.data.namaPemilik+"&alamat="+$scope.data.alamat+"&kontak="+$scope.data.kontak+"&deskripsi="+$scope.data.deskripsi+"&token=717mangan"
			).success(function(data) {
				console.log(data);
			}).error(function(error, status) {
				console.log(error, status);
			});
			Services.daftarResto($scope.data);
			// trackEvent
			Analytics.logEvent('Daftar Restoran', 'Daftar');
			// trackUser Event
			Analytics.logUserArr([
						$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
						'trackEvent',
						'Daftar Restoran',
						'Daftar'
					]);

			$ionicPopup.alert({
				title: 'Mendaftar',
				template: '<center>Kami akan segera menghubungi anda</center>',
				okText: 'OK',
				okType: 'button-oren'
			});

			$state.go("tabsController.jelajah");
		}		
	}
})

.controller('rincianTransaksiCtrl', function($scope, $state, $stateParams, Services, $ionicLoading, $ionicPopup, $ionicHistory, Analytics, $localStorage){
	$ionicLoading.show({
      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
      duration: 5000
    });

	$scope.$on('$ionicView.enter', function() {
		// trackView
		Analytics.logView('Rincian Transaksi');
		// trackUser View
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackView',
					'Rincian Transaksi'
				]);
		$scope.getTransaksiDetails();
	});

    $scope.getTransaksiDetails = function() {
    	Services.getTransaksiDetails($stateParams.kurir, $stateParams.indexTransaksi).then(function(detailTransaksi) {
    		$scope.detailTransaksi = detailTransaksi;
	    	$scope.$broadcast('scroll.refreshComplete');
    	}, function(err) {
    		console.log(err);
    	});
    }

    $scope.cancelTransaction = function() {
    	// trackEvent
		Analytics.logEvent('Rincian Transaksi', 'Tombol Batalkan');
		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Rincian Transaksi',
					'Tombol Batalkan'
				]);
    	$ionicPopup.confirm({
			title: 'Batalkan Pesanan',
			template: '<center>Apakah anda yakin ingin membatalkan pesanan anda?</center>',
			okText: 'Ya',
			cancelText: 'Tidak',
			okType: 'button-clear',
			cancelType: 'button-oren'
		}).then(function(res) {
			if(res) {
				// trackEvent
				Analytics.logEvent('Transaksi', 'Dibatalkan');
				Analytics.logEvent('Rincian Transaksi', 'Konfirmasi Batal', 'Ya');
				Analytics.logEvent('Pesan Antar', 'Dibatalkan');
				// trackUser Event
				Analytics.logUserArr([
							$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
							'trackEvent',
							'Transaksi',
							'Dibatalkan'
						]);
				Analytics.logUserArr([
							$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
							'trackEvent',
							'Rincian Transaksi',
							'Konfirmasi Batal',
							'Ya'
						]);
				Analytics.logUserArr([
							$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
							'trackEvent',
							'Pesan Antar',
							'Dibatalkan'
						]);
				Services.getTransaksiDetails($stateParams.kurir, $stateParams.indexTransaksi).then(function(detailTransaksi) {
					if (detailTransaksi.status == "process" || detailTransaksi.status == "done" || detailTransaksi.status == "cancel") {
						$ionicPopup.alert({
							title: 'Gagal',
							template: '<center>Sepertinya pesanan kamu telah diproses kurir, silahkan hubungi kurir untuk membatalkan</center>',
							okText: 'OK',
							okType: 'button-oren'
						});
					} else {
						Services.changeStatus($scope.detailTransaksi.kurir, $scope.detailTransaksi.indexTransaksi).then(function() {
							Services.deleteQueue($scope.detailTransaksi.kurir, $scope.detailTransaksi.indexTransaksi).then(function() {
								Services.addCancel($scope.detailTransaksi.indexUser, $scope.detailTransaksi.indexTransaksi);
								$ionicPopup.alert({
									title: 'Dibatalkan',
									template: '<center>Pesanan berhasil dibatalkan</center>',
									okText: 'OK',
									okType: 'button-oren'
								}).then(function() {
									$ionicHistory.goBack();
								});
								console.log('order cancel');
							}, function(err) {
								console.log(err);
							});
						}, function(err) {
							console.log('error change status : '+err);
						});
					}
				})
			} else {
				// trackEvent
				Analytics.logEvent('Rincian Transaksi', 'Konfirmasi Batal', 'Tidak');
				// trackUser Event
				Analytics.logUserArr([
							$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
							'trackEvent',
							'Rincian Transaksi',
							'Konfirmasi Batal',
							'Tidak'
						]);
			}
		});
    }

    $scope.call = function(tel) {
    	// trackEvent
    	Analytics.logEvent('Transaksi', 'Hubungi Kurir');
    	Analytics.logEvent('Kurir', $stateParams.kurir, 'Call');
    	// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Transaksi',
					'Hubungi Kurir'
				]);
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Kurir',
					$stateParams.kurir,
					'Call'
				]);
		window.open('tel:'+tel, '_system', 'location=yes');
    }

	$scope.getDate = function(timestamp) {
		var x = new Date(timestamp);
		var hours  = x.getHours();
		var minute = "0"+x.getMinutes();
		var time = hours+'.'+minute.substr(-2);
		return time;
	}
	
	$scope.getTime = function(timestamp){
	  var a = new Date(timestamp);
	  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	  var days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
	  var day = days[a.getDay()];
	  var year = a.getFullYear();
	  var month = months[a.getMonth()];
	  var date = a.getDate();
	  var hour = a.getHours();
	  var min = a.getMinutes();
	  var sec = a.getSeconds();
	  var time = day+', '+date + ' ' + month + ' ' + year ;
	  return time;
	}
})

.controller('adsController', function($scope, $state, Analytics, $localStorage, ManganAds) {
	$scope.adsCounter = 5;
	
	$scope.showRowAds = function(isShow) {
		if(isShow)
		{
			var adsUrl = ManganAds.getAdsUrl();
			return adsUrl;
		}

		return null;
	}
})

.controller('profilKurirCtrl', function($scope, $state, $stateParams, Services, Analytics, $localStorage){
})

.controller('kotaCtrl', function($scope, $state, $stateParams, Services, Analytics, $localStorage, $ionicHistory, $ionicLoading){
	$scope.$on('$ionicView.enter', function() {
		Analytics.logView('City');
	});

	$scope.pilihKota = function(kota) {
		$ionicLoading.show({
	      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
	      duration: 3000
	    });

		$localStorage.location = kota;
		var indexUser = $localStorage.indexUser ? $localStorage.indexUser : $localStorage.token;
		Services.getUserPickLocation(indexUser).then(function(result) {
			console.log(result);
			if (!result && typeof result !== "boolean") {
				Services.setUserPickLocation(indexUser).then(function(result) {
					console.log('berhasil');
					$state.go('tabsController.jelajah', { changeCity: true });
				},function(reason) {
					console.log('gagal');
					$state.go('tabsController.jelajah', { changeCity: true });
				});
			} else {
				$state.go('tabsController.jelajah', { changeCity: true });
			}
		}, function(reason) {
			console.log(reason);
			$state.go('tabsController.jelajah', { changeCity: true });
		});
	}
})

.controller('wizardCtrl', function($scope, $state, $ionicSlideBoxDelegate, $localStorage, $cordovaOauth, Services, $ionicLoading, $http, $cordovaToast, $ionicPlatform, $ionicHistory, Analytics) {
	$scope.$on('$ionicView.enter', function() {
		Analytics.logView('Wizard');
		if ($localStorage.wizard) {
			$state.go('tabsController.jelajah');
			return;
		}
	});

	firebase.auth().signOut().then(function() {
		Analytics.logEventArr([
			'Wizard',
			'Auth',
			'Sign Out'
		])
		console.log('SIGNED OUT');
	});

	$scope.$on("$ionicView.beforeLeave", function(){
		console.log('LEAVE');
		Analytics.logEventArr([
			'Wizard',
			'Leave'
			])
		$localStorage.wizard = true;
	});

	$scope.slideChanged = function(index) {
		Analytics.logEventArr([
			'Wizard',
			'SlideChange'
		])
		console.log(index);
		$scope.slideIndex = index;
	};

	$scope.endWizard = function() {
		Analytics.logEventArr([
			'Wizard',
			'Skip'
		])
		$state.go('tabsController.jelajah', {changeCity: true});
	}

	$scope.fblogin = function() {
		// trackEvent
		Analytics.logEvent('Wizard', 'Tombol', 'Facebook');
		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Wizard',
					'Tombol',
					'Facebook'
				]);
		$cordovaOauth.facebook(1764800933732733, ["email", "user_birthday", "user_location"]).then(function(result) {
			console.log(result.access_token);
			$localStorage.fbaccesstoken = result.access_token;
			var credential = firebase.auth.FacebookAuthProvider.credential($localStorage.fbaccesstoken);
			firebase.auth().signInWithCredential(credential).catch(function(error) {
				console.log('Error : '+JSON.stringify(error));
			});
			$ionicLoading.show({
		      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
		      duration: 5000
		    });
			// $ionicHistory.goBack();
		}, function(err) {
			console.log('Error oAuth facebook: '+err);
		})
	}

	$scope.googlelogin = function() {
		// trackEvent
		Analytics.logEvent('Wizard', 'Tombol', 'Google');
		// trackUser Event
		Analytics.logUserArr([
					$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
					'trackEvent',
					'Wizard',
					'Tombol',
					'Google'
				]);
		$cordovaOauth.google("1054999345220-m4vlisv7o0na684cgcg13s1tj2t4v447.apps.googleusercontent.com", ["email", "profile"]).then(function(result) {
			$localStorage.googleidtoken = result.id_token;
			$localStorage.googleaccesstoken = result.access_token;
			var credential = firebase.auth.GoogleAuthProvider.credential($localStorage.googleidtoken);
			firebase.auth().signInWithCredential(credential).catch(function(error) {
				console.log("Error : "+JSON.stringify(error));
			});
			$ionicLoading.show({
		      template: '<ion-spinner icon="spiral" class="spinner-balanced"></ion-spinner>',
		      duration: 5000
		    });
			// $ionicHistory.goBack();
		}, function(err) {
			console.log('Error oAuth google: '+err);
		})
	}

	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			console.log("uid: "+user.uid);
			$scope.user = user;
			user.providerData.forEach(function(profile) {
				if (profile.providerId === "facebook.com") {
					Services.getProfileByUid(profile.uid).then(function(user) {
						if (user) {
							// trackEvent
							Analytics.logEvent('Auth', 'Sign In', 'Facebook');
							// trackUser Event
							Analytics.logUserArr([
										$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
										'trackEvent',
										'Auth',
										'Sign In',
										'Facebook'
									]);
							makeToast('Berhasil Login');
							$http.get("https://graph.facebook.com/v2.8/me?fields=name,location,birthday,gender,picture.type(large){url},age_range,email,about", {params :{
								access_token : $localStorage.fbaccesstoken,
								format : "json"
							}}).then(function(result) {
								$localStorage.indexUser = result.data.id;
								$scope.dataUser = result.data;
								Services.updateUserDataLoginFb($scope.dataUser, $scope.user);
								checkWizardData($localStorage.indexUser);
							});
						} else {
							// trackEvent
							Analytics.logEvent('Auth', 'Sign Up', 'Facebook');
							// trackUser Event
							Analytics.logUserArr([
										$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
										'trackEvent',
										'Auth',
										'Sign Up',
										'Facebook'
									]);
							$http.get("https://graph.facebook.com/v2.8/me?fields=name,location,birthday,gender,picture.type(large){url},age_range,email,about", {params :{
								access_token : $localStorage.fbaccesstoken,
								format : "json"
							}}).then(function(result) {
								$localStorage.indexUser = result.data.id;
								$scope.dataUser = result.data;
								Services.addUserData($scope.dataUser, $scope.user).then(function(user) {
									makeToast('Berhasil Login');
									console.log(user);
									checkWizardData($localStorage.indexUser);
								}, function(err) {
									firebase.auth().signOut().then(function() {
										makeToast('Login gagal, coba dengan email lain');
									});
								})
							});
						}
					}, function(err) {
						// trackEvent
						Analytics.logEvent('Auth', 'Auth Failed');
						// trackUser Event
						Analytics.logUserArr([
									$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
									'trackEvent',
									'Auth',
									'Auth Failed'
								]);
						firebase.auth().signOut();
						makeToast('Login gagal, koneksi tidak stabil');
					})
					checkWizardData($localStorage.indexUser);
				} else if (profile.providerId === "google.com") {
					Services.getProfileByUid(profile.uid).then(function(user) {
						if (user) {
							// trackEvent
							Analytics.logEvent('Auth', 'Sign In', 'Google');
							// trackUser Event
							Analytics.logUserArr([
										$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
										'trackEvent',
										'Auth',
										'Sign In',
										'Google'
									]);
							makeToast('Berhasil Login');
							$http.get("https://www.googleapis.com/userinfo/v2/me?fields=email,family_name,gender,given_name,hd,id,link,locale,name,picture,verified_email", {
								headers :{
									"Authorization" : "Bearer "+$localStorage.googleaccesstoken
								}
							}).then(function(result) {
								$localStorage.indexUser = result.data.id;
								$scope.dataUser = result.data;
								Services.updateUserDataLoginGoogle($scope.dataUser, $scope.user);
								checkWizardData($localStorage.indexUser);
							});
						} else {
							// trackEvent
							Analytics.logEvent('Auth', 'Sign Up', 'Google');
							// trackUser Event
							Analytics.logUserArr([
										$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
										'trackEvent',
										'Auth',
										'Sign Up',
										'Google'
									]);
							$http.get("https://www.googleapis.com/userinfo/v2/me?fields=email,family_name,gender,given_name,hd,id,link,locale,name,picture,verified_email", {
								headers :{
									"Authorization" : "Bearer "+$localStorage.googleaccesstoken
								}
							}).then(function(result) {
								$localStorage.indexUser = result.data.id;
								$scope.dataUser = result.data;
								Services.addUserDataByGoogle($scope.dataUser, $scope.user).then(function(user) {
									makeToast('Berhasil Login');
									checkWizardData($localStorage.indexUser);
								}, function(err) {
									firebase.auth().signOut().then(function() {
										makeToast('Login gagal, coba dengan email lain');
									});
								})
							});
						}
					}, function(err) {
						// trackEvent
						Analytics.logEvent('Auth', 'Auth Failed');
						// trackUser Event
						Analytics.logUserArr([
									$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
									'trackEvent',
									'Auth',
									'Auth Failed'
								]);
						firebase.auth().signOut();
						makeToast('Login gagal, koneksi tidak stabil');
					});
				}  else {
					// trackEvent
					Analytics.logEvent('Auth', 'Auth Failed');
					// trackUser Event
					Analytics.logUserArr([
								$localStorage.indexUser? $localStorage.indexUser : $localStorage.token,
								'trackEvent',
								'Auth',
								'Auth Failed'
							]);
					firebase.auth().signOut();
					makeToast('Login gagal, coba dengan email lain');
					$ionicLoading.hide();
					$ionicHistory.goBack();
				}
			});
		}
	});

	function checkWizardData(indexUser) {
		console.log('check wizard data :'+indexUser);
		Services.getProfileByUid(indexUser).then(function(result) {
			console.log(indexUser);
			console.log(JSON.stringify(result));
			if (!(result && result.hasOwnProperty('gender') && result.hasOwnProperty('dateOfBirth'))) {
				$ionicLoading.hide();	
				$state.go('registration', {wizard: true});
			} else {
				$ionicLoading.hide();
				$state.go('tabsController.jelajah', {changeCity: true});
				console.log("we're done");
			}
		}, function(reason) {
			console.log("cannto retrieve profile");
			$ionicLoading.hide();
			$state.go('tabsController.jelajah', {changeCity: true});
		});
	}

	function makeToast(_message) {
		window.plugins.toast.showWithOptions({
			message: _message,
			duration: 1500,
			position: 'bottom',
			addPixelsY: -40
		});
	};
})

.controller('registrationCtrl', function($state, $scope, $localStorage, $stateParams, $ionicHistory, Services, Analytics){
	$scope.$on('$ionicView.enter', function() {
		Analytics.logView('Registration');
	});

	$scope.user = {
		dateOfBirth: new Date(0),
		gender: null,
		phone: null
	};

	$scope.complete = function() {
		Analytics.logEventArr([
			'Registration',
			'Button',
			'Complete'
		])
		if (!($scope.user.dateOfBirth && $scope.user.gender)) {
			Analytics.logEventArr([
				'Registration',
				'Not Complete'
			]);
			alert('Tanggal lahir dan gender wajib diisi!');
		} else {
			var indexUser = $localStorage.indexUser ? $localStorage.indexUser : $localStorage.token;
			Services.addWizardData(indexUser, $scope.user.dateOfBirth, $scope.user.gender, $scope.user.phone).then(function(result) {
				console.log("scuccess add wizard data");
				Analytics.logEventArr([
					'Registration',
					'Complete',
					'Success'
				]);
				$ionicHistory.goBack();
			}, function(reason) {
				Analytics.logEventArr([
					'Registration',
					'Complete',
					'Failed'
				]);
				console.log("failed add wizard data");
				$ionicHistory.goBack();
			});
		}
	}
});
