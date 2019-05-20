'use strict';

/* globals $, document, window, socket, bootbox, config */
$(document).ready(function () {
	var Tenor = {};

	$(window).on('action:composer.enhanced', function () {
		Tenor.prepareFormattingTools();
		console.log('setting:', config['gif'])
	});

	$(window).on('action:redactor.load', function () {
		Tenor.initRedactor.apply(this, arguments);
	});

	$(window).on('action:composer.loaded', function () {
		if ($.Redactor) {
			$.Redactor.opts.plugins.push('tenor-gif');
		}


	});

	Tenor.prepareFormattingTools = function () {
		require([
			'composer/formatting',
			'composer/controls',
		], function (formatting, controls) {
			if (formatting && controls) {
				formatting.addButtonDispatch('gif', function (textarea, selectionStart, selectionEnd) {
					Tenor.showModal(function (url, query) {
						Tenor.select(textarea, selectionStart, selectionEnd, url, query);
					});
				});
			}
		});
	};

	Tenor.initRedactor = function () {
		$.Redactor.prototype['tenor-gif'] = function () {
			return {
				init: function () {
					var self = this;
					var button = self.button.add('tenor-gif', 'Insert GIF');
					self.button.setIcon(button, '<i class="fa fa-tenor-gif"></i>');
					self.button.addCallback(button, self['tenor-gif'].onClick);
				},
				onClick: function () {
					var self = this;
					Tenor.showModal(function (url, query) {
						var code = self.code.get();
						code += '<p><img src="' + url + '" alt="' + query + '" /></p>';

						self.code.set(code);
					});
				},
			};
		};
	};

	Tenor.populateDOM = function (resultsEl, gifs) {
		require(['benchpress'], function (Benchpress) {
			Benchpress.parse('partials/tenor-gif/list', {
				gifs: gifs,
			}, function (html) {
				resultsEl.html(html);
			});
		});
	};

	Tenor.addDOM = function (resultsEl, gifs) {
		require(['benchpress'], function (Benchpress) {
			Benchpress.parse('partials/tenor-gif/list', {
				gifs: gifs,
			}, function (html) {
				resultsEl.append(html);
			});
		});
	};


	Tenor.showModal = function (callback) {
		require(['translator', 'benchpress'], function (translator, Benchpress) {
			Benchpress.parse('plugins/tenor-gif/modal', {}, function (html) {
				var modal = bootbox.dialog({
					title: 'Insert GIF',
					message: html,
					className: 'tenor-gif-modal',
					onEscape: true,
				});

				var queryEl = modal.find('#gif-query');
				var resultsEl = modal.find('#gif-results');
				var searchBtn = modal.find('#gif-search');

				var queryTimeout;

				modal.on('shown.bs.modal', function () {
					queryEl.focus();
				});

				var query, page, noData;
				searchBtn.on('click', function () {
					page = 1;
					noData = false;
					query = queryEl.val();
					if (config['gif'].code && config['gif'].code.length > 0) {
						settingCode(query, page, callback);
					} else {
						send(query, page).then(callback)
					}
					function callback(res) {
						if (res.gifs.length <= 0) {
							noData = true;
							Tenor.populateDOM(resultsEl, []);
						} else {
							Tenor.populateDOM(resultsEl, res.gifs);
						}
					}

				});

				queryEl.on('keyup', function () {
					if (event.keyCode == "13") {
						//回车执行查询
						$(searchBtn).click();
					}
				})
				resultsEl.on('click', 'img[data-url]', function () {
					callback(this.getAttribute('data-url'), queryEl.val());
					modal.modal('hide');
				});

				$(resultsEl).scroll(function () {
					var content = document.getElementById('gif-results');
					var scrollHeight = content.scrollHeight;
					var scrollTop = content.scrollTop;
					var height = content.offsetHeight;

					if ((scrollTop + height) == scrollHeight && !noData) {
						page++;
						if (config['gif'].code && config['gif'].code.length > 0) {
							settingCode(query, page, callback);
						} else {
							send(query, page).then(callback)
						}
						function callback(res) {
							if (res.gifs.length <= 0) {
								noData = true;
							} else {
								Tenor.addDOM(resultsEl, res.gifs);
							}
						}

					}
				})

			});
		});
	};

	Tenor.select = function (textarea, selectionStart, selectionEnd, url, query) {
		require([
			'composer/formatting',
			'composer/controls',
		], function (formatting, controls) {
			if (selectionStart === selectionEnd) {
				controls.insertIntoTextarea(textarea, '![' + query + '](' + url + ')');
				controls.updateTextareaSelection(textarea, selectionStart + query.length + 4, selectionEnd + query.length + url.length + 4);
			} else {
				var wrapDelta = controls.wrapSelectionInTextareaWith(textarea, '![', '](' + url + ')');
				controls.updateTextareaSelection(textarea, selectionEnd + 4 - wrapDelta[1], selectionEnd + url.length + 4 - wrapDelta[1]);
			}
		});
	};

	function settingCode(query, page, callback) {
		var promise = (new Function('query', 'page',  config['gif'].code))(query, page)
		promise.then((res) => {
			callback(res);
		})
	}

	var APP_ID = 'b05b585673334bc081493f069510d6ad';
	function send(query, page) {
		return new Promise((resolve, rejects) => {
			var params = {
				q: query,
				fs: 'medium',
				ssl_res: false,
				p: page,
				size: 20
			};
			var names = [];
			for (var key in params) {
				names.push(key)
			}

			//通用参数
			var url = 'https://open-api.biaoqingmm.com/open-api/gifs/search';
			var timestamp = new Date().getTime();
			names.push('app_id');
			params['app_id'] = APP_ID;
			names.push('timestamp');
			params['timestamp'] = timestamp;
			var signUrl = url.replace("https", "http");
			var signature = _genSignature(signUrl, names, params);
			params['signature'] = signature;
			var referrer = 'http://open.biaoqingmm.com/api/search/'
			//提交
			$.ajax({
				type: "GET",
				data: params,
				url: url,
				success: function (data) {
					resolve(data);
				},
				error: function (data) {
					$("#result").html(data.responseText);
				},
				dataType: "json"
			});
		})
	}

	function _genSignature(url, names, params) {
		var paramString = url
		names.sort();
		for (var nameIndex in names) {
			var key = names[nameIndex];
			var value = params[key];
			paramString += nameIndex == 0 ? '' : '&';
			paramString += key + '=' + value;
		}
		return window.md5(paramString).toUpperCase();
	}
});
