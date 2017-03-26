/*=====================================================
 *
 *	LokiFSCipherAdapter : File System Adapter for LokiJS with data encryption
 *	(c) Naveen Kumar 2017
 *
 ======================================================*/
/*=====================================================
 *	LokiFSCipherAdapter Object Constructor
 =============================*/
;(function (root, factory) {
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory();
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define([], factory);
	}
	else {
		// Global (browser)
		root.LokiFSCipherAdapter = factory();
	}
}(this, function () {
	var LokiFSCipherAdapter = function LokiFSCipherAdapter(opts) {
		this.options = {
			filePrefix : 'loki_cipher',
			password : 'a711f194-113f-11e7-93ae-92361f002671'
		};
		opts = opts || {};
		var that = this;
		Object.keys(opts).forEach(function(key) {
			that.options[key] = opts[key];
		});
		return this;
	};

	/*=====================================================
	 *	_ Prototype Functions
	 ============================*/
	LokiFSCipherAdapter.prototype = {
		/*=====================================================
		 *	Save DataBase : Encrypt the string before writing it to a file
		=============================*/
		saveDatabase: function(dbname, dbstring, callback) {
			var that = this;
			console.log("Save Database Started!");
			this.readFile(dbname, function (fileEntry) {
				fileEntry.createWriter(function (fileWriter) {
					fileWriter.onwriteend = function () {
						if (fileWriter.length === 0) {
							// Encrypt the data before writing it to file
							dbstring = CryptoJS.AES.encrypt(dbstring, that.options.password).toString();
							var blob = that.toBlob(dbstring, "text/plain");
							fileWriter.write(blob);
							console.log("Save Database Completed!");
							callback();
						}
					};
					fileWriter.truncate(0);
				}, function (err) {
					console.error("Error saving data to Database file :: ", err);
					throw new Error("Error saving data to Database file :: " + JSON.stringify(err));
				});
			}, function (err) {
				console.error("Error reading Database file :: ", err);
				throw new Error("Error reading Database file :: " + JSON.stringify(err));
			});
		},
		/*=====================================================
		 *	Load DataBase : Load data from Database file and decrypt it
		=============================*/
		loadDatabase: function(dbname, callback) {
			var that = this;
			console.log("Loading Database from file!");
			this.readFile(dbname, function (fileEntry) {
				fileEntry.file(function (file) {
					var reader = new FileReader();
					reader.onloadend = function (event) {
						var contents = event.target.result;
						if (contents.length === 0) {
							console.warn("Database File does not exists, New database file will be created!");
							callback(null);
						} else {
							// Decrypt the database by using the provided key
							var bytes = CryptoJS.AES.decrypt(contents, that.options.password)
							try {
								if (bytes.sigBytes < 0) {
									callback(new Error("Wrong Password for Database!"));
								} else {
									contents = bytes.toString(CryptoJS.enc.Utf8);
									callback(contents);
									console.log("Database Loaded Successfully from file!");
								}
							} catch(error) {
								callback(new Error("Wrong Password for Database!"));
							}
						}
					};
					reader.readAsText(file);
				}, function (err) {
					console.error("Error loading data from Database file :: ", err);
					callback(new Error("Error loading data from Database file :: " + err.message));
				});
			}, function (err) {
				console.error("Error reading Database file :: ", err);
				callback(new Error("Error reading Database file :: " + err.message));
			});
		},
		/*=====================================================
		 *	Delete DataBase : Delete Database file
		=============================*/
		deleteDatabase: function(dbname, callback) {
			var that = this;
			console.log("Database Delete Started!");
			window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dir) {
				var fileName = that.options.filePrefix + "__" + dbname;
				dir.getFile(fileName, { create: true }, function(fileEntry) {
					fileEntry.remove(function() {
					  callback();
					}, function (err) {
						console.error("Error deleting Database file :: ", err);
						throw "Error deleting Database file :: " + JSON.stringify(err);
					});
				}, function (err) {
					console.error("Error deleting Database file :: ", err);
					throw "Error deleting Database file :: " + JSON.stringify(err)	;
				});
			}, function (err) {
				throw new Error("Unable to resolve local file system URL" + JSON.stringify(err));
			});
		},
		/*=====================================================
		 *	Read File : Cordova API to read file from application data directory
		=============================*/
		readFile: function(name, handleSuccess, handleError) {
			var that = this;
			window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dir) {
				var fileName = that.options.filePrefix + "__" + name;
				dir.getFile(fileName, { create: true }, handleSuccess, handleError);
			}, function (err) {
				throw "Unable to resolve local file system URL" + JSON.stringify(err);
			});
		},
		/*=====================================================
		 *	toBlob : Convert String to Blob
		=============================*/
		toBlob: function(data, datatype) {
			var blob;
			try {
				blob = new Blob([data], {type: datatype});
			}
			catch (err) {
				window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;

				if (err.name === "TypeError" && window.BlobBuilder) {
					var bb = new window.BlobBuilder();
					bb.append(data);
					blob = bb.getBlob(datatype);
				}
				else if (err.name === "InvalidStateError") {
					blob = new Blob([data], {type: datatype});
				}
				else {
					throw "Unable to create blob" + JSON.stringify(err);
				}
			}
			return blob;
		}
	};
	return LokiFSCipherAdapter;
}));