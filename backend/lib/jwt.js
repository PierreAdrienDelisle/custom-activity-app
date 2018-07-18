'use strict';

module.exports = (body, secret, cb) => {
    if (!body) {
        console.log('ERROR BODY');
		return cb(new Error('invalid jwtdata'));
	}

    require('jsonwebtoken').verify(body.toString('utf8'), secret, {
		algorithm: 'HS256'
    }, cb);
};
