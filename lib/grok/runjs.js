(function (window, document) {
define([], function () {

	// There are very few things declared at this scope to prevent pollution
	// of the eval() in scopedEval(): window, document, curl().
	var curl;

	// mock window and document, if necessary
	if (!document) document = {};
	if (!window) {
		window = {
			document: document
		};
	}

	return (function (scopedEval) {

		return function (source) {
			var config, includes, warnings, error, save;

			// these will be collected by the mock curl API
			config = {};
			includes = [];
			warnings = [];

			// save any existing curl and create mock one
			save = window.curl;
			window.curl = (curl = mockCurlApi());

			try {
				// evaluate source file
				scopedEval.call(window, source);
			}
			catch (ex) {
				error = ex;
			}
			finally {
				// restore
				window.curl = save;
			}

			return {
				config: config,
				includes: includes,
				warnings: warnings,
				error: error
			};

			// mock curl API
			function mockCurlApi () {

				function _curl () {
					var args;

					// parse params
					args = Array.prototype.slice.call(arguments);
					if (Object.prototype.toString.call(args[0]) == '[object Object]') {
						collectConfig(args.shift());
					}
					if (Object.prototype.toString.call(args[0]) == '[object Array]') {
						collectModules(args.shift());
					}
					if (typeof args[0] == 'function') {
						warn('Did not inspect curl() callback or errback.');
					}

					return {
						// warn when .then() is called
						then: function (cb, eb) {
							warn('Did not inspect .then() callback or errback.');
						},
						// warn if .next() is called
						next: function (modules) {
							warn('Did not include .next() modules: ' + modules);
						},
						config: collectConfig
					};
				}

				return _curl;
			}

			function collectConfig (cfg) {
				config = extend(config, cfg);
			}

			function collectModules (modules) {
				includes.concat(modules);
			}

			function warn (msg) {
				//(console.warn || console.log).apply(console, arguments);
				warnings.push(msg);
			}

		};

		function extend (ancestor, descendant) {
			var next, p;
			next = Object.create(ancestor);
			for (p in descendant) {
				if (typeof descendant[p] == 'object') {
					next[p] = extend(ancestor[p], descendant[p]);
				}
				else {
					next[p] = descendant[p];
				}
			}
		}

	}(
		// eval() function that runs in the same scope as mocked
		// window, document, and curl vars.
		function (source) { eval(source); }
	));

})
}(
	typeof window != 'undefined' && window,
	typeof document != 'undefined' && document
));