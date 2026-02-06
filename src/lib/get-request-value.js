const type_flag = '_type',
	generators = {
		literal: function (request) {
			'use strict';
			return request.value;
		},
		size: function (request) {
			'use strict';
		const size = parseInt(request.size, 10);
		if (!Number.isFinite(size) || size < 0 || !request.template || typeof request.template !== 'string') {
			return false;
		}
		let value = request.template;
		while (value.length < size) {
			value += request.template;
		}
		return value.substring(0, size);
		}
	};
module.exports = function getRequestValue(request) {
	'use strict';
	if (!request) {
		return false;
	}
	const generator = generators[request[type_flag]];
	if (!generator) {
		return false;
	}
	return generator(request);
};
