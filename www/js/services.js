// Initialize Firebase
// mangan
var config = {
	apiKey: "AIzaSyCQz7kgKgqjOo6ptPdvEGJLxOCBKUPZEoY",
	authDomain: "project-1449647215698534337.firebaseapp.com",
	databaseURL: "https://project-1449647215698534337.firebaseio.com",
	storageBucket: "project-1449647215698534337.appspot.com"
};

// ryou
// var config = {
// 	apiKey: "AIzaSyBvDJSC5qe1AfnNbEZOiqw3GUFjvb4i3go",
//     authDomain: "project-7791088175021720001.firebaseapp.com",
//     databaseURL: "https://project-7791088175021720001.firebaseio.com",
//     storageBucket: "project-7791088175021720001.appspot.com",
// };

// hamzah ManganBak
// var config = {
//     apiKey: "AIzaSyB1U7icSEQX4ZTCdsRHxDUFieD-r7sDFKA",
//     authDomain: "manganbak.firebaseapp.com",
//     databaseURL: "https://manganbak.firebaseio.com",
//     storageBucket: "manganbak.appspot.com",
//     messagingSenderId: "374536724800"
// };

firebase.initializeApp(config);

var kategori = firebase.database().ref('kategori');
var restoran = firebase.database().ref('dataResto');
var menu = firebase.database().ref('dataMenu');
var review = firebase.database().ref('reviewRating');
var search = firebase.database().ref('searching');
var keyword = firebase.database().ref('keywordResto');
var slider = firebase.database().ref('slider');
var promo = firebase.database().ref('promo');
var version = firebase.database().ref('version');
var refUser = firebase.database().ref('user');
var transaksi = firebase.database().ref('transaksi');
var queue = firebase.database().ref('status').child('queue');
var ongkir = firebase.database().ref('ongkir');
var settings = firebase.database().ref('settings');
var appVersion = firebase.database().ref('appVersion');

angular.module('app.services', [])

.service('Services', function($q, $localStorage) {
	$localStorage = $localStorage.$default({
		indexes: [],
		maxSaved: 30,
		token: null,
		location: null, // default location,
		welcome: null,
		indexUser: ''
	});

	this.getVersion = function() {
		return promiseValue(
			appVersion.child('android/version')
			);
	}

	this.getCategories = function() {
		return promiseValue(
			getRefKota('kategori').child('jenis')
			);
	}

	this.getRestoranKeyword = function() {
		return promiseValue(
			getRefKota('keywordResto')
			);
	}

	this.getRestoranCategory = function(category) {
		return promiseValue(
			getRefKota('kategori').child(category)
			);
	}

	this.getNewRestorans = function(startDate) {
		return promiseValue(
			getRefKota('dataResto').orderByChild('tglInput').limitToLast(12)
			);
	}

	this.getAllRestorans = function(startDate) {
		return promiseValue(
			getRefKota('dataResto').orderByChild('tglInput').endAt(startDate).limitToLast(10)
			);
	}

	this.getRestoranDetails = function(id) {
		return promiseAdded(
			getRefKota('dataResto').orderByChild('index').equalTo(id)
			);
	}

	this.getRestoranMenus = function(id) {
		return promiseValue(
			getRefKota('dataMenu').child(id)
			);
	}

	this.getRestoranReviews = function(id) {
		return promiseValue(
			review.child(id).orderByChild('tglReview')
			);
	}

	this.getJmlSad = function(id) {
		return promiseValue(
			getRefKota('dataResto').child(id +'/jmlSad')
			);
	}

	this.getJmlHappy = function(id) {
		return promiseValue(
			getRefKota('dataResto').child(id +'/jmlHappy')
			);
	}

	this.getJmlFavorite = function(id) {
		return promiseValue(
			getRefKota('dataResto').child(id +'/jmlFavorite')
			);
	}

	this.getRestoransByLocation = function(lon1, lon2) {
		return promiseValue(
			getRefKota('dataResto').orderByChild('map/long').startAt(lon1).endAt(lon2)
			);
	}

	this.getSavedRestorans = function() {
		return $localStorage.indexes;
	}

	this.checkSavedRestoran = function(id) {
		if($localStorage.indexes.indexOf(id) >= 0) {
			return true;
		} return false;
	}

	/////////////////////////////////////////
	//
	// rs-1 = berhasil
	// rs-0 = sudah ada, shouldn't ever happen
	// rs-1 = 
	// rs-0 = max
	//
	//////////////////////////////////////////
	this.saveRestoran = function(id) {
		var promise = $q.defer();

		if($localStorage.indexes.length < 30) {
			if(!this.checkSavedRestoran(id)) {
				$localStorage.indexes.push(id);
				promise.resolve(true);
			} else {
				promise.resolve(false);
			}
		} else {
			promise.reject(false);
		}

		return promise.promise;
	}

	this.deleteRestoran = function(id) {
		var promise = $q.defer();

		$localStorage.indexes.splice($localStorage.indexes.indexOf(id), 1);
		if(!this.checkSavedRestoran(id)) {
			promise.resolve(true);
		} else {
			promise.reject(false);
		}

		return promise.promise;
	}

	this.getRatingReview = function(resto, user) {
		console.log('try get ratrev');
		var promise = $q.defer();

		firebase.database().ref('reviewRating/'+ resto +'/'+ user).on('value', function(data) {
			promise.resolve(data.val());
		});

		return promise.promise;
	}

	this.updateRatingReview = function(userIndex, resto, user, userPhotoUrl, userRating, titleReview, userReview, emoji) {
		var promise = $q.defer();
		review.child(resto).push({
			'indexUser': userIndex,
			'rating': userRating || null,
			'titleReview': titleReview || null,
			'review' : userReview || null,
			'username': user,
			'userPhotoUrl': userPhotoUrl,
			'emoji': emoji || 'happy',
			'tglReview': firebase.database.ServerValue.TIMESTAMP
		}).then(function() {
			promise.resolve(true);
		});
		return promise.promise;
	}

	this.updateJmlSad = function(resto) {
		var promise = $q.defer();

		getRefKota('dataResto').child(resto +'/jmlSad').once('value', function(jml) {
			var jmlSad = jml.val();
			if(typeof jmlSad === 'number' && jmlSad >= 1) {
				jmlSad++;
			} else {
				jmlSad = 1;
			}

			getRefKota('dataResto').child(resto +'/jmlSad').set(jmlSad).then(function() {
				promise.resolve(true);
			});
		});

		return promise.promise;
	}

	this.updateJmlHappy = function(resto, jmlHappy) {
		var promise = $q.defer();

		getRefKota('dataResto').child(resto +'/jmlHappy').once('value', function(jml) {
			var jmlHappy = jml.val();
			if(typeof jmlHappy === 'number' && jmlHappy >= 1) {
				jmlHappy++;
			} else {
				jmlHappy = 1;
			}

			getRefKota('dataResto').child(resto +'/jmlHappy').set(jmlHappy).then(function() {
				promise.resolve(true);
			});
		});

		return promise.promise;
	}

	this.updateJmlFavorite = function(resto, jmlFavorite) {
		var promise = $q.defer();

		getRefKota('dataResto').child(resto +'/jmlFavorite').once('value', function(jml) {
			var jmlFavorite = jml.val();
			if(typeof jmlFavorite === 'number' && jmlFavorite >= 1) {
				jmlFavorite++;
			} else {
				jmlFavorite = 1;
			}

			getRefKota('dataResto').child(resto +'/jmlFavorite').set(jmlFavorite).then(function() {
				promise.resolve(true);
			});
		});

		return promise.promise;
	}

	this.searchQuery = function(query) {
		var promise = $q.defer();

		var logged = firebase.auth().currentUser;
		if(logged) {
			refUser.child($localStorage.indexUser +"/search").push({
				'keyword': query,
				'timestamp': firebase.database.ServerValue.TIMESTAMP
			});
		}

		getRefKota('searching').child('all').push({
			'keyword': query,
			'timestamp': firebase.database.ServerValue.TIMESTAMP
		}).then(function() {
			promise.resolve(true);
		});

		return promise.promise;
	}

	this.searchRestorans = function(keyword) {
		return promiseValue(
			getRefKota('dataResto').orderByChild('keyword').startAt(keyword)//.endAt(keyword)
			);
	}

	this.getSliders = function() {
		return promiseValue(
			getRefKota('slider')
		);
	}

	this.getPromos = function() {
		return promiseValue(
			getRefKota('promo')
		);
	}

	this.cekUserData = function(email) {
		return promiseValue(
			refUser.orderByChild('email').equalTo(email)
		)
	}

	this.getProfileByUid = function(uid) {
		return promiseValue(
			refUser.child(uid)
		)
	}

	this.getSettingsDelivery = function(){
		return promiseValue(
			getRefKota('settings').child('delivery')
		);
	}

	this.getSettingsLocation = function() {
		return promiseValue(
			settings.child('location')
			);
	}

	this.isUserHasPickLocation = function(uid) {
		return promiseValue(
			refUser.child(uid +"/pickLocation")
			);
	}

	this.getUserPickLocation = function(uid) {
		console.log(uid +"/pickLocation/"+ $localStorage.location);
		return promiseValue(
			refUser.child(uid +"/pickLocation/"+ $localStorage.location)
			);
	}

	this.getRecomendation = function(slide) {
		return promiseValue(
			getRefKota('kategori/rekomendasi').orderByChild('slide').equalTo(slide)
			);
	}

	this.getRecomendations = function() {
		return promiseValue(getRefKota('kategori/rekomendasi'));
	}

	this.setUserPickLocation = function(uid) {
		var promise = $q.defer();

		refUser.child(uid +"/pickLocation/"+ $localStorage.location).set(
			true
		).then(function() {
			promise.resolve(true);
			console.log('brasil');
			getRefKota('jmlUser').once('value', function(jml) {
				var jmlUser = jml.val();
				if(typeof jmlUser === 'number' && jmlUser >= 1) {
					jmlUser++;
				} else {
					jmlUser = 1;
				}

				getRefKota('jmlUser').set(jmlUser).then(function() {
					console.log("add jml user");
				});
			});
		}, function() {
			console.log('galgal');
			promise.reject(false);
		});

		return promise.promise;
	}

	this.addUserData = function(dataUser, user) {
		console.log('SERVICES, user.uid : '+ user.uid);
		var promise = $q.defer();

		refUser.child(dataUser.id).set({
			'uid': user.uid,
			'index': dataUser.id,
			'email': dataUser.email || null,
			'fb_id': dataUser.id,
			'name': dataUser.name,
			'photoUrl': dataUser.picture.data.url || null,
			'device_token' : $localStorage.token,
			'dateRegister': firebase.database.ServerValue.TIMESTAMP,
			'dateUpdatedData': firebase.database.ServerValue.TIMESTAMP
		}).then(function() {
			promise.resolve(true);
		});

		return promise.promise;
	}

	this.updateUserData = function(userData) {
		var promise = $q.defer();

		refUser.child(userData.index).update({
			'dateUpdatedData' : firebase.database.ServerValue.TIMESTAMP,
			'noTelpUser' : userData.noTelpUser,
			'name' : userData.name,
			'photoUrl' : userData.photoUrl || userData.picture.data.url || userData.picture || null,
			'device_token' : $localStorage.token,
			'lineUsername' : userData.lineUsername
		}).then(function(result) {
			promise.resolve(true);
		});

		return promise.promise;
	}

	this.updateUserDataLoginGoogle = function(userData, user) {
		var promise = $q.defer();

		refUser.child(userData.id).update({
			'uid' : user.uid,
			'dateUpdatedData' : firebase.database.ServerValue.TIMESTAMP,
			'name' : userData.name,
			'photoUrl' : userData.photoUrl ||  userData.picture || null,
			'device_token' : $localStorage.token
		}).then(function(result) {
			promise.resolve(true);
		});

		return promise.promise;
	}

	this.updateUserDataLoginFb = function(userData, user) {
		var promise = $q.defer();

		refUser.child(userData.id).update({
			'uid' : user.uid,
			'dateUpdatedData' : firebase.database.ServerValue.TIMESTAMP,
			'name' : userData.name,
			'photoUrl' : userData.photoUrl || userData.picture.data.url || null,
			'device_token' : $localStorage.token
		}).then(function(result) {
			promise.resolve(true);
		});

		return promise.promise;
	}

	this.addUserDataByGoogle = function(dataUser, user) {
		var promise = $q.defer();

		refUser.child(dataUser.id).set({
			'uid': user.uid,
			'index': dataUser.id,
			'email': dataUser.email,
			'gpluslink': dataUser.link || null,
			'name': dataUser.name,
			'photoUrl': dataUser.picture || null,
			'device_token' : $localStorage.token,
			'dateRegister': firebase.database.ServerValue.TIMESTAMP,
			'dateUpdatedData': firebase.database.ServerValue.TIMESTAMP
		}).then(function() {
			promise.resolve(true);
		});

		return promise.promise;
	}

	this.addTransaction = function(kurir, idTransaksi, dataTransaksi) {
		var promise = $q.defer();

		transaksi.child(kurir +'/'+ idTransaksi).set({
			'indexUser' : dataTransaksi.indexUser,
			'alamat' : dataTransaksi.alamat,
			'alamatUser' : dataTransaksi.alamatUser,
			'alamatUserDetail' : dataTransaksi.alamatUserDetail || null,
			'feedelivery' : dataTransaksi.feedelivery,
			'indexResto' : dataTransaksi.indexResto,
			'gambarResto' : dataTransaksi.gambarResto,
			'keteranganBuka' :dataTransaksi.keteranganBuka,
			'indexTransaksi' : dataTransaksi.indexTransaksi,
			'jumlah' : dataTransaksi.jumlah,
			'kurir' : dataTransaksi.kurir,
			'map' : {
				'lat' : dataTransaksi.map.lat,
				'long' : dataTransaksi.map.long
			},
			'mapUser' : {
				'lat' : dataTransaksi.mapUser.lat,
				'long' : dataTransaksi.mapUser.long
			},
			'namaResto' : dataTransaksi.namaResto,
			'namaUser' : dataTransaksi.namaUser,
			'noTelpUser' : dataTransaksi.noTelpUser,
			// to not use angular.copy, pleasee use trackby on ng-repeat
			'pesanan' : angular.copy(dataTransaksi.pesanan),
			'status' : dataTransaksi.status,
			'processBy' : dataTransaksi.processBy,
			'tgl' : dataTransaksi.tgl,
			'totalHarga' : dataTransaksi.totalHarga,
			'userPhotoUrl' : dataTransaksi.userPhotoUrl,
			'username' : dataTransaksi.username,
			'lineUsername' : dataTransaksi.lineUsername || null,
			'tambahan' : dataTransaksi.tambahan || null,
			'device_token' : $localStorage.token
		}).then(function(result) {
			promise.resolve(true);
		});

		return promise.promise;
	}

	this.addQueue = function(kurir, idTransaksi) {
		var promise = $q.defer();

		queue.child(kurir +'/'+ idTransaksi).set({
			'indexTransaksi' : idTransaksi
		}).then(function(result) {
			promise.resolve(true);
		});

		return promise.promise;
	}

	this.addHistory = function(index, idTransaksi, kurir) {
		var promise = $q.defer();

		refUser.child(index +'/transaksi/'+ idTransaksi).set({
			'indexTransaksi' : idTransaksi,
			'kurir' : kurir
		}).then(function(result) {
			promise.resolve(true);
		});

		return promise.promise;
	}

	this.getHistory = function(index) {
		console.log("nilai index uid : "+index);
		return promiseValue(
			refUser.child(index +'/transaksi')
		);
	}

	this.getTransaksiDetails = function(kurir, index) {
		return promiseValue(
			transaksi.child(kurir +'/'+ index)
		);
	}

	this.changeStatus = function(kurir, index) {
		var promise = $q.defer();

		transaksi.child(kurir +'/'+ index).update({
			'userCancel' : true,
			'status' : "cancel",
			'statusUserCancel' : firebase.database.ServerValue.TIMESTAMP
		}).then(function() {
			promise.resolve(true);
		});

		return promise.promise;
	}

	// delete entri in queue list
	this.deleteQueue = function(kurir, index) {
		var promise = $q.defer();

		queue.child(kurir +'/'+ index).remove().then(function() {
			promise.resolve(true);
		});

		return promise.promise;
	}

	this.addCancel = function(indexUser, indexTransaksi) {
		var promise = $q.defer();

		refUser.child(indexUser +'/cancel/'+indexTransaksi).set({
			'indexTransaksi' : indexTransaksi,
			'timestamp' : firebase.database.ServerValue.TIMESTAMP
		})
	}

	this.getFeeDelivery = function(kurir) {
		return promiseValue(
			ongkir.child(kurir)
		);
	}

	this.getKurir = function() {
		return promiseValue(
			ongkir
		);
	}

	this.getKurirDetail = function(kurir) {
		return promiseValue(
			ongkir.child(kurir)
		);	
	}

	// wizard registrasi
	this.addWizardData = function(uid, dateOfBirth, gender, phone) {
		var promise = $q.defer();
		var date = new Date(dateOfBirth);
		firebase.database().ref('user/'+ uid +'/dateOfBirth').set(date.getTime()).then(function(result) {
			console.log("success add dateOfBirth: "+ dateOfBirth);
			firebase.database().ref('user/'+ uid +'/gender').set(gender).then(function() {
				console.log("success add gender: "+ gender);
				promise.resolve(true);
			});

			firebase.database().ref('user/'+ uid +'/noTelpUser').set("+62"+phone);
			refUser.child(uid).update({
				'dateUpdatedData' : firebase.database.ServerValue.TIMESTAMP,
				'device_token' : $localStorage.token
			});
		}, function(reason) {
			console.log("why "+ reason);
		});

		return promise.promise;
	}

	// DAFTAR& REKOMENDASI
	this.daftarResto = function(data) {
		var promise = $q.defer();

		firebase.database().ref('daftar').push({
			'namaResto': data.namaResto,
			'namaPemilik': data.namaPemilik,
			'alamat': data.alamat,
			'kontak': data.kontak,
			'deskripsi': data.deskripsi
		}).then(function() {
			promise.resolve(true)
		});

		return promise.promise;
	}

	this.rekomendasiResto = function(data) {
		var promise = $q.defer();

		firebase.database().ref('rekomendasi').push({
			'namaResto': data.namaResto,
			'alamat': data.alamat,
			'jenis': data.jenis,
			'kontak': data.kontak,
			'alasan': data.alasan
		}).then(function() {
			promise.resolve(true)
		});

		return promise.promise;
	}

	function restoranKota()
	{
		return restoran;

		if($localStorage.location == 'Surakarta') {
			return firebase.database().ref('dataResto');
		} else if($localStorage.location == 'Yogyakarta') {
			return firebase.database().ref('yogyakarta/dataRestoJogja');
		} else {
			return firebase.database().ref('dataResto');
		}
	}

	function getRefKota(ref) {
		var newRef = "";
		if($localStorage.location == 'Surakarta') {
			newRef = ref;
		} else if($localStorage.location == 'Yogyakarta') {
			newRef = "yogyakarta/"+ ref;
		} else {
			newRef = ref;
		}

		return firebase.database().ref(newRef);
	}

	function promiseAdded(obj) {
		var promise = $q.defer();

		obj.on('child_added', function(data) {
			promise.resolve(data.val());
		}, function(err) {
			promise.reject(null);
			console.log("Error fetch data");
		});

		return promise.promise;
	}

	function promiseValue(obj) {
		var promise = $q.defer();

		obj.on('value', function(data) {
			promise.resolve(data.val());
		}, function(err) {
			promise.reject(null);
			console.log("Error fetch data");
		});

		return promise.promise;
	}
})

.service('Analytics', function() {
	// ABOUT ANALYTICS
	// Start from v 1.4.3 this Analytics is called appLogs and will saved at appLogs 'parent'
	// appLogs track the use of this apps by collecting datas below :
	//// logView: how much is 'a' view viewed by user - this is a total value. Used to measure how important is that view
	//// logEvent: how much 'an' event is triggered by user - this is a total value. Used to measure how important is that action
	//// logUser: track how 'a single' user use this apps. User may have 2 identifier, token if they aren't logged in, or index if they are logged in
	//// logMerchant: track how much 'a' merchant gain activity generated by user. Used to inform the merchant what user do on their information.
	// HOW ABOUT ADS
	//// The ads, or something that have relationship with that, tracked on logEvent
	// HOW ABOUT push notification?
	//// Same as ads.

	this.logView = function(viewName) {
		// addValue('trackView/'+ viewName);
		var branch = [];
		branch.push(viewName);
		this.logViewArr(branch);
	}

	this.logEvent = function(category, action, label) {
		var branch = [];
		branch.push(category);
		branch.push(action);
		if(label) {
			branch.push(label);
		}
		this.logEventArr(branch);
	}

	this.logUser = function(category, action, label) {
		var branch = [];
		branch.push(category);
		branch.push(action);
		if (label) {
			branch.push(label);
		}

		this.logUserArr(branch);
	}

	this.logMerchant = function(category, action, label) {
		var branch = [];
		branch.push(category);
		branch.push(action);
		if (label) {
			branch.push(label);
		}

		this.logMerchantArr(branch);
	}

	this.logViewArr = function(branch) {
		addValueArr('trackView', branch);
	}

	this.logEventArr = function(branch) {
		addValueArr('trackEvent', branch);
	}

	this.logUserArr = function(branch) {
		addValueArr('trackUser', branch);
	}

	this.logMerchantArr = function(branch) {
		addValueArr('trackMerchant', branch);
	}
	
	function addValue(branch) {
		firebase.database().ref('appLogs/'+ branch).once('value', function(_value) {
			var newValue = _value.val();
			if(typeof newValue === 'number' && newValue >= 1) {
				newValue++;
			} else {
				newValue = 1;
			}
			firebase.database().ref('appLogs/'+ branch).set(newValue);
		});
	}

	function addValueArr(trackName, branch) {
		var path = trackName;
		for (var i = 0; i < branch.length; i++) {
			var sub = "/"+ branch[i];
			path += sub;
		}
		firebase.database().ref('appLogs/'+ path).once('value', function(_value) {
			var newValue = _value.val();
			if(typeof newValue === 'number' && newValue >= 1) {
				newValue++;
			} else {
				newValue = 1;
			}
			firebase.database().ref('appLogs/'+ path).set(newValue);
		});
	}
})

.service('ManganAds', function() {
	this.getAdsUrl = function() {
		return "https://i.ytimg.com/vi/8yLDH51NTPU/hqdefault.jpg";
	}
})

