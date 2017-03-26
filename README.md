# loki-fs-cipher-adapter
File System Adapter for LokiJS with data encryption
# loki-cordova-fs-adapter [![npm version](https://badge.fury.io/js/loki-fs-cipher-adapter.svg)](https://badge.fury.io/js/loki-fs-cipher-adapter)

Cordova adapter for LokiJS with data encryption.

Dependency: https://github.com/apache/cordova-plugin-file

This adapter is dependent on [CryptoJS](https://github.com/brix/crypto-js) for data encryption & decryption.


```js
	var adapter = new LokiFSCipherAdapter({"password": "loki"});
	var db = new loki("testdb.db", {
		autoload: true,
		autoloadCallback : loadHandler,
		autosave: true,
		autosaveInterval: 1000,
		adapter: adapter
	});
	function loadHandler(err) {
		if (err && err instanceof Error) {
			console.log(err.message);
		} else {
			// if database did not exist it will be empty so I will intitialize here
			var users = db.getCollection('users');
			if (users === null) {
				users = db.addCollection('users');
			}
			users.insert({
				id: 'Naveen',
				age: 25,
				address: 'Germany'
			});
			console.log(users.find({}));
		}
	}
```

### NOTE: If you forget the pin, there is no way to recover the data.
