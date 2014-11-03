module.exports = serialize;

var async = require('async');

function _serializeObject(object, mapping, callback) {
	object = object.toJSON();
	var keys = Object.keys(object);
	async.map(keys, function(key, done) {
		serialize(object[key], mapping && mapping.properties[key] || {}, done);
	}, function(err, results) {
		var serialized = {};

		if(err) return callback(err);
		for(var i = 0; i < results.length; i++) {
			if(typeof results[i] !== 'undefined') {
				serialized[keys[i]] = results[i];
			}
		}
		callback(null, serialized);
	});
}

function serialize(model, mapping, callback) {
  if (mapping.properties && model) {
    if (Array.isArray(model)) {
	return async.map(model, function(object, done) {
		_serializeObject(object, mapping, done);
	}, callback);
    } else {
      return _serializeObject(model, mapping, callback);
    }
  } else {
    if (mapping.cast && typeof(mapping.cast) !== 'function')
      callback(new Error('es_cast must be a function'));
	if(mapping.cast) {
		mapping.cast(model, function(err, model) {
			if(err) return callback(err);

			    if (typeof model === 'object' && model !== null) {
			      var name = model.constructor.name;
			      if (name === 'ObjectID') {
				return callback(null, model.toString());
			      } else if (name === 'Date') {
				return callback(null, new Date(model).toJSON());
			      } else {
				return callback(null, model);
			      }
			    } else {
			      return callback(null, model);
			    }

			
		});

	} else {
    if (typeof model === 'object' && model !== null) {
      var name = model.constructor.name;
      if (name === 'ObjectID') {
        return callback(null, model.toString());
      } else if (name === 'Date') {
        return callback(null, new Date(model).toJSON());
      }
	return callback(null, model);
    } else {
      return callback(null, model);
    }

	}
  }
}
