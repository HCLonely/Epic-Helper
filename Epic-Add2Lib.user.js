"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// ==UserScript==
// @name               Epic-Add2Lib
// @namespace          Epic-Add2Lib
// @version            1.0.1
// @description        Epic 快速领取免费游戏
// @author             HCLonely
// @license            MIT
// @iconURL            https://auto-task-test.hclonely.com/img/favicon.ico
// @homepage           https://github.com/HCLonely/Epic-Helper/
// @supportURL         https://github.com/HCLonely/Epic-Helper/issues/
// @updateURL          https://raw.githubusercontent.com/HCLonely/Epic-Helper/master/Epic-Add2Lib.user.js
// @downloadURL        https://raw.githubusercontent.com/HCLonely/Epic-Helper/master/Epic-Add2Lib.user.js
// @include            *://keylol.com/*
// @grant              GM_addStyle
// @grant              GM_xmlhttpRequest
// @grant              unsafeWindow
// @require            https://cdn.jsdelivr.net/npm/jquery@3.4.1/dist/jquery.slim.min.js
// @require            https://cdn.jsdelivr.net/npm/regenerator-runtime@0.13.7/runtime.min.js
// @require            https://cdn.jsdelivr.net/npm/sweetalert2@9
// @require            https://cdn.jsdelivr.net/npm/promise-polyfill@8.1.3/dist/polyfill.min.js
// @require            https://greasyfork.org/scripts/418102-tm-request/code/TM_request.js?version=902218
// @connect            www.epicgames.com
// @connect            store-content.ak.epicgames.com
// @connect            payment-website-pci.ol.epicgames.com
// @run-at             document-end
// @noframes
// ==/UserScript==
(function () {
  function addButton() {
    var _iterator = _createForOfIteratorHelper($('a[href^="https://www.epicgames.com/store/"]:not(".Epic-add2lib")')),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var el = _step.value;
        var $this = $(el).addClass('Epic-add2lib');
        var href = $this.attr('href');

        if (/^https?:\/\/www\.epicgames\.com\/store\/.*?\/p\/.*/.test(href)) {
          $this.after("<a class=\"add-to-library\" href=\"javascript:void(0)\" onclick=\"addToEpicLibrary(this)\" data-href=\"".concat(href, "\" data-type=\"store\" target=\"_self\">\u9886\u53D6</a>"));
        }

        if (/^https?:\/\/www\.epicgames\.com\/store\/purchase.*/.test(href) && href.includes('namespace') && href.includes('offers')) {
          $this.after("<a class=\"add-to-library\" href=\"javascript:void(0)\" onclick=\"addToEpicLibrary(this)\" data-href=\"".concat(href, "\" data-type=\"purchase\" target=\"_self\">\u9886\u53D6</a>"));
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }

  function getGameInfo(href) {
    Swal.fire({
      title: '正在获取游戏信息...',
      text: href,
      icon: 'info'
    });
    var name = new URL(href).pathname.replace(/\/store\/(.*?)\/p\//, '');
    return TM_request({
      url: 'https://store-content.ak.epicgames.com/api/zh-CN/content/products/' + name,
      method: 'GET',
      responseType: 'json',
      anonymous: true,
      timeout: 30000,
      retry: 3
    }).then(function (response) {
      if (!response.response) {
        console.error(response);
        return null;
      }

      var offers = [];

      var _iterator2 = _createForOfIteratorHelper(response.response.pages),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _page$data, _page$data$editions, _page$data2, _page$data2$dlc, _page$offer;

          var page = _step2.value;
          var editions = ((_page$data = page.data) === null || _page$data === void 0 ? void 0 : (_page$data$editions = _page$data.editions) === null || _page$data$editions === void 0 ? void 0 : _page$data$editions.editions) || [];
          var dlcs = ((_page$data2 = page.data) === null || _page$data2 === void 0 ? void 0 : (_page$data2$dlc = _page$data2.dlc) === null || _page$data2$dlc === void 0 ? void 0 : _page$data2$dlc.dlc) || [];

          if ((_page$offer = page.offer) !== null && _page$offer !== void 0 && _page$offer.id) {
            offers.push(page.offer.id);
          }

          for (var _i = 0, _arr = [].concat(_toConsumableArray(editions), _toConsumableArray(dlcs)); _i < _arr.length; _i++) {
            var info = _arr[_i];
            offers.push(info.offerId);
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      var namespace = response.response.namespace;
      offers = _toConsumableArray(new Set(offers));
      return {
        namespace: namespace,
        offers: offers
      };
    })["catch"](function (error) {
      console.error(error);
      return null;
    });
  }

  function getDiscountInfo(href, gameInfo) {
    Swal.update({
      title: '正在获取折扣信息...',
      text: href,
      icon: 'info'
    });
    var namespace = gameInfo.namespace,
        offers = gameInfo.offers;
    var data = [];

    var _iterator3 = _createForOfIteratorHelper(offers),
        _step3;

    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var offer = _step3.value;
        data.push({
          query: 'query catalogQuery($productNamespace: String!, $offerId: String!, $locale: String, $country: String!) {\n  Catalog {\n    catalogOffer(namespace: $productNamespace, id: $offerId, locale: $locale) {\n      title\n      id\n      namespace\n      description\n      effectiveDate\n      expiryDate\n      isCodeRedemptionOnly\n      seller {\n        id\n        name\n      }\n      productSlug\n      urlSlug\n      url\n      price(country: $country) {\n        totalPrice {\n          discountPrice\n          originalPrice\n          discount\n          }\n      }\n    }\n  }\n}\n',
          variables: {
            productNamespace: namespace,
            offerId: offer,
            locale: 'zh-CN',
            country: 'CN',
            lineOffers: [{
              offerId: offer,
              quantity: 1
            }],
            calculateTax: false,
            includeSubItems: true
          }
        });
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }

    return TM_request({
      url: 'https://www.epicgames.com/graphql',
      method: 'POST',
      responseType: 'json',
      data: JSON.stringify(data),
      nocache: true,
      headers: {
        'content-type': 'application/json;charset=UTF-8'
      },
      timeout: 30000,
      retry: 3
    }).then(function (response) {
      if (response.status === 200) {
        var _response$response;

        Swal.update({
          title: '获取折扣信息成功！',
          text: href,
          icon: 'success'
        });
        var freeOffers = [];

        if (((_response$response = response.response) === null || _response$response === void 0 ? void 0 : _response$response.length) > 0) {
          var _iterator4 = _createForOfIteratorHelper(response.response),
              _step4;

          try {
            for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
              var _info$data, _info$data$Catalog, _info$data$Catalog$ca, _info$data$Catalog$ca2, _info$data$Catalog$ca3;

              var info = _step4.value;
              var price = info === null || info === void 0 ? void 0 : (_info$data = info.data) === null || _info$data === void 0 ? void 0 : (_info$data$Catalog = _info$data.Catalog) === null || _info$data$Catalog === void 0 ? void 0 : (_info$data$Catalog$ca = _info$data$Catalog.catalogOffer) === null || _info$data$Catalog$ca === void 0 ? void 0 : (_info$data$Catalog$ca2 = _info$data$Catalog$ca.price) === null || _info$data$Catalog$ca2 === void 0 ? void 0 : (_info$data$Catalog$ca3 = _info$data$Catalog$ca2.totalPrice) === null || _info$data$Catalog$ca3 === void 0 ? void 0 : _info$data$Catalog$ca3.discountPrice;

              if (price === 0) {
                freeOffers.push({
                  title: info.data.Catalog.catalogOffer.title,
                  id: info.data.Catalog.catalogOffer.id
                });
              }
            }
          } catch (err) {
            _iterator4.e(err);
          } finally {
            _iterator4.f();
          }
        }

        return freeOffers;
      } else {
        console.error(response);
        Swal.update({
          title: '获取折扣信息失败！',
          text: href,
          icon: 'error'
        });
        return null;
      }
    });
  } // TODO: 未完成


  function authenticate(_x) {
    return _authenticate.apply(this, arguments);
  }

  function _authenticate() {
    _authenticate = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(referer) {
      var result;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              Swal.fire({
                title: '正在进行身份验证...',
                text: '',
                icon: 'info'
              });
              _context3.next = 3;
              return TM_request({
                url: 'https://www.epicgames.com/id/api/authenticate',
                method: 'GET',
                nocache: true,
                timeout: 30000,
                retry: 3,
                headers: {
                  'x-epic-event-action': null,
                  'x-epic-event-category': null,
                  'x-epic-strategy-flags': 'guardianEmailVerifyEnabled=false;minorPreRegisterEnabled=false;guardianKwsFlowEnabled=false',
                  referer: referer
                }
              }).then(function (response) {
                if (response.status === 200) {
                  return true;
                } else {
                  console.error(response);
                  Swal.update({
                    title: '身份验证失败！',
                    html: '<a href="https://www.epicgames.com/id/login" target="_blank">点此登录</a>',
                    icon: 'error'
                  });
                  return false;
                }
              });

            case 3:
              result = _context3.sent;

              if (result) {
                _context3.next = 6;
                break;
              }

              return _context3.abrupt("return", false);

            case 6:
              _context3.next = 8;
              return TM_request({
                url: 'https://www.epicgames.com/id/api/csrf',
                method: 'GET',
                nocache: true,
                timeout: 30000,
                retry: 3,
                headers: {
                  'x-epic-event-action': 'login',
                  'x-epic-event-category': 'login',
                  'x-epic-strategy-flags': 'guardianEmailVerifyEnabled=false;minorPreRegisterEnabled=false;guardianKwsFlowEnabled=false',
                  referer: referer
                }
              }).then(function (response) {
                if (response.status >= 200 && response.status < 300) {
                  return true;
                } else {
                  console.error(response);
                  Swal.update({
                    title: '身份验证失败！',
                    html: '<a href="https://www.epicgames.com/id/login" target="_blank">点此登录</a>',
                    icon: 'error'
                  });
                  return false;
                }
              });

            case 8:
              return _context3.abrupt("return", _context3.sent);

            case 9:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));
    return _authenticate.apply(this, arguments);
  }

  function requestOrderPage(namespace, offer, title) {
    var times = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var url = "https://www.epicgames.com/store/purchase?namespace=".concat(namespace, "&offers=").concat(offer);
    Swal.fire({
      title: '正在请求下单页面...',
      text: url,
      icon: 'info'
    });
    return TM_request({
      url: url,
      method: 'GET',
      nocache: true,
      timeout: 30000,
      retry: 3
    }).then( /*#__PURE__*/function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(response) {
        var _response$responseTex, _response$responseTex2, XQW, dfpSessionId, _JSON$parse, _response$responseTex3;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(response.status === 200 && response.responseText)) {
                  _context.next = 26;
                  break;
                }

                if (!response.finalUrl.includes('www.epicgames.com/id/login')) {
                  _context.next = 15;
                  break;
                }

                if (!(times === 0)) {
                  _context.next = 12;
                  break;
                }

                _context.next = 5;
                return authenticate(url);

              case 5:
                if (!_context.sent) {
                  _context.next = 9;
                  break;
                }

                return _context.abrupt("return", requestOrderPage(namespace, offer, title, 1));

              case 9:
                return _context.abrupt("return", null);

              case 10:
                _context.next = 15;
                break;

              case 12:
                console.error(response);
                Swal.fire({
                  title: '请先登录！',
                  html: '<a href="https://www.epicgames.com/id/login" target="_blank">点此登录</a>',
                  icon: 'error'
                });
                return _context.abrupt("return", null);

              case 15:
                XQW = (_response$responseTex = response.responseText.match(/id="purchaseToken"[\s]*?value="(.*?)"/)) === null || _response$responseTex === void 0 ? void 0 : _response$responseTex[1];
                dfpSessionId = (_response$responseTex2 = response.responseText.match(/window\.dfpSessionId[\s]*?=[\s]*?'(.*?)'/)) === null || _response$responseTex2 === void 0 ? void 0 : _response$responseTex2[1];

                if (!title) {
                  try {
                    title = (_JSON$parse = JSON.parse((_response$responseTex3 = response.responseText.match(new RegExp("\"".concat(offer, "\":({.*?)},\"offers\"")))) === null || _response$responseTex3 === void 0 ? void 0 : _response$responseTex3[1])) === null || _JSON$parse === void 0 ? void 0 : _JSON$parse.title;
                  } catch (e) {
                    console.error(e);
                  }
                }

                if (!(XQW && dfpSessionId)) {
                  _context.next = 22;
                  break;
                }

                return _context.abrupt("return", {
                  XQW: XQW,
                  dfpSessionId: dfpSessionId,
                  title: title
                });

              case 22:
                Swal.update({
                  title: '获取Token失败！',
                  text: url,
                  icon: 'error'
                });
                return _context.abrupt("return", null);

              case 24:
                _context.next = 29;
                break;

              case 26:
                console.error(response);
                Swal.update({
                  title: '请求下单页面失败！',
                  text: url,
                  icon: 'error'
                });
                return _context.abrupt("return", null);

              case 29:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function (_x2) {
        return _ref.apply(this, arguments);
      };
    }());
  }

  function orderPreview(_x3, _x4, _x5) {
    return _orderPreview.apply(this, arguments);
  }

  function _orderPreview() {
    _orderPreview = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(namespace, offer, title) {
      var url, data, XQW, dfpSessionId;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              url = "https://www.epicgames.com/store/purchase?namespace=".concat(namespace, "&offers=").concat(offer);
              _context4.next = 3;
              return requestOrderPage(namespace, offer, title);

            case 3:
              data = _context4.sent;

              if (data) {
                _context4.next = 6;
                break;
              }

              return _context4.abrupt("return", null);

            case 6:
              XQW = data.XQW, dfpSessionId = data.dfpSessionId;
              Swal.update({
                title: '正在获取syncToken...',
                text: url,
                icon: 'info'
              });
              return _context4.abrupt("return", TM_request({
                url: 'https://payment-website-pci.ol.epicgames.com/purchase/order-preview',
                method: 'POST',
                responseType: 'json',
                nocache: true,
                data: JSON.stringify({
                  // 没有发出去
                  useDefault: true,
                  setDefault: false,
                  orderId: null,
                  namespace: namespace,
                  country: null,
                  countryName: null,
                  orderComplete: null,
                  orderError: null,
                  orderPending: null,
                  offers: [offer],
                  offerPrice: ''
                }),
                headers: {
                  'content-type': 'application/json;charset=UTF-8',
                  origin: 'https://www.epicgames.com',
                  referer: url,
                  'x-requested-with': XQW
                },
                timeout: 30000,
                retry: 3
              }).then(function (response) {
                if (response.status === 200 && response.response) {
                  if (!response.response.message && response.response.syncToken) {
                    Swal.update({
                      title: '获取syncToken成功！',
                      text: offer,
                      icon: 'success'
                    });
                    return {
                      XQW: XQW,
                      dfpSessionId: dfpSessionId,
                      syncToken: response.response.syncToken,
                      title: title || data.title
                    };
                  } else {
                    console.error(response);
                    Swal.update({
                      title: response.response.message || '获取syncToken失败！',
                      text: offer,
                      icon: 'error'
                    });
                    return null;
                  }
                } else {
                  console.error(response);
                  Swal.update({
                    title: '获取syncToken失败！',
                    text: offer,
                    icon: 'error'
                  });
                  return null;
                }
              }));

            case 9:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));
    return _orderPreview.apply(this, arguments);
  }

  function confirmOrder(namespace, id, title, XQW, dfpSessionId, syncToken) {
    var times = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 0;
    return TM_request({
      url: 'https://payment-website-pci.ol.epicgames.com/purchase/confirm-order',
      method: 'POST',
      responseType: 'json',
      nocache: true,
      data: JSON.stringify({
        useDefault: true,
        setDefault: false,
        orderId: null,
        namespace: namespace,
        country: 'CN',
        countryName: 'China',
        orderComplete: false,
        orderError: false,
        orderPending: false,
        offers: [id],
        includeAccountBalance: false,
        totalAmount: 0,
        affiliateId: '',
        creatorSource: '',
        threeDSToken: '',
        voucherCode: null,
        eulaId: null,
        lineOffers: [{
          offerId: id,
          title: title,
          namespace: namespace,
          upgradePathId: null
        }],
        useDefaultBillingAccount: true,
        syncToken: syncToken,
        canQuickPurchase: true
      }),
      headers: {
        'content-type': 'application/json',
        dfpdccode: 'uswest',
        dfpsessionid: dfpSessionId,
        origin: 'https://www.epicgames.com',
        referer: "https://www.epicgames.com/store/purchase?namespace=".concat(namespace, "&offers=").concat(id),
        'x-requested-with': XQW
      },
      timeout: 30000,
      retry: 3
    }).then(function (response) {
      if (response.status === 200 && response.response) {
        if (!response.response.message && !response.response.errorCode) {
          Swal.update({
            title: '领取成功！',
            text: "".concat(title, "(").concat(id, ")"),
            icon: 'success'
          });
          return true;
        } else if (response.response.syncToken && response.response.errorCode === 'errors.com.epicgames.purchase.purchase.captcha.challenge') {
          if (times === 0) {
            return confirmOrder(namespace, id, title, XQW, dfpSessionId, response.response.syncToken, 1);
          } else {
            console.error(response);
            Swal.update({
              title: '领取失败！',
              text: "".concat(title, "(").concat(id, ")"),
              icon: 'error'
            });
            return null;
          }
        } else {
          console.error(response);
          Swal.update({
            title: response.response.message,
            text: "".concat(title, "(").concat(id, ")"),
            icon: 'info'
          });
          return null;
        }
      } else {
        console.error(response);
        Swal.update({
          title: response.response.message || '领取失败！',
          text: "".concat(title, "(").concat(id, ")"),
          icon: 'error'
        });
        return null;
      }
    });
  }

  function getGame(_x6, _x7) {
    return _getGame.apply(this, arguments);
  }

  function _getGame() {
    _getGame = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(_ref2, namespace) {
      var title, id, data, XQW, dfpSessionId, syncToken;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              title = _ref2.title, id = _ref2.id;
              _context5.next = 3;
              return orderPreview(namespace, id, title);

            case 3:
              data = _context5.sent;

              if (data) {
                _context5.next = 6;
                break;
              }

              return _context5.abrupt("return", null);

            case 6:
              XQW = data.XQW, dfpSessionId = data.dfpSessionId, syncToken = data.syncToken;
              Swal.update({
                title: '正在领取...',
                text: "".concat(title, "(").concat(id, ")"),
                icon: 'info'
              });
              _context5.next = 10;
              return confirmOrder(namespace, id, title || data.title, XQW, dfpSessionId, syncToken, 0);

            case 10:
              return _context5.abrupt("return", _context5.sent);

            case 11:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }));
    return _getGame.apply(this, arguments);
  }

  unsafeWindow.addToEpicLibrary = /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(el) {
      var href, searchParams, namespace, offers, gameInfo, freeOffers, _iterator5, _step5, freeOffer;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              href = typeof el === 'string' ? el : $(el).attr('data-href');

              if (!($(el).attr('data-type') === 'purchase')) {
                _context2.next = 8;
                break;
              }

              searchParams = new URL(href).searchParams;
              namespace = searchParams.get('namespace');
              offers = searchParams.get('offers');
              _context2.next = 7;
              return getGame({
                id: offers
              }, namespace);

            case 7:
              return _context2.abrupt("return", _context2.sent);

            case 8:
              _context2.next = 10;
              return getGameInfo(href);

            case 10:
              gameInfo = _context2.sent;

              if (gameInfo) {
                _context2.next = 14;
                break;
              }

              Swal.update({
                title: '获取游戏信息失败...',
                text: href,
                icon: 'error'
              });
              return _context2.abrupt("return", null);

            case 14:
              _context2.next = 16;
              return getDiscountInfo(href, gameInfo);

            case 16:
              freeOffers = _context2.sent;

              if (freeOffers) {
                _context2.next = 21;
                break;
              }

              return _context2.abrupt("return", null);

            case 21:
              if (freeOffers.length === 0) {
                Swal.update({
                  title: '没有获取到免费游戏！',
                  text: href,
                  icon: 'warning'
                });
              }

            case 22:
              _iterator5 = _createForOfIteratorHelper(freeOffers);
              _context2.prev = 23;

              _iterator5.s();

            case 25:
              if ((_step5 = _iterator5.n()).done) {
                _context2.next = 31;
                break;
              }

              freeOffer = _step5.value;
              _context2.next = 29;
              return getGame(freeOffer, gameInfo.namespace);

            case 29:
              _context2.next = 25;
              break;

            case 31:
              _context2.next = 36;
              break;

            case 33:
              _context2.prev = 33;
              _context2.t0 = _context2["catch"](23);

              _iterator5.e(_context2.t0);

            case 36:
              _context2.prev = 36;

              _iterator5.f();

              return _context2.finish(36);

            case 39:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[23, 33, 36, 39]]);
    }));

    return function (_x8) {
      return _ref3.apply(this, arguments);
    };
  }();

  GM_addStyle('.add-to-library{margin-left:10px;}');
  addButton();
  var observer = new MutationObserver(addButton);
  observer.observe(document.documentElement, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true
  });
})();
