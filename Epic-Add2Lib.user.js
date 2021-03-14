"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// ==UserScript==
// @name               Epic-Add2Lib
// @namespace          Epic-Add2Lib
// @version            1.0.0
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
          var page = _step2.value;
          var editions = page.data.editions.editions || [];
          var dlcs = page.data.dlc.dlc || [];

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
              var info = _step4.value;
              var price = info.data.Catalog.catalogOffer.price.totalPrice.discountPrice;

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
  }

  function requestOrderPage(namespace, offer, title) {
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
    }).then(function (response) {
      if (response.status === 200 && response.responseText) {
        var _response$responseTex, _response$responseTex2;

        if (response.finalUrl.includes('www.epicgames.com/id/login')) {
          console.error(response);
          Swal.fire({
            title: '请先登录！',
            html: '<a href="https://www.epicgames.com/login" target="_blank">点此登录</a>',
            icon: 'error'
          });
          return null;
        }

        var XQW = (_response$responseTex = response.responseText.match(/id="purchaseToken"[\s]*?value="(.*?)"/)) === null || _response$responseTex === void 0 ? void 0 : _response$responseTex[1];
        var dfpSessionId = (_response$responseTex2 = response.responseText.match(/window\.dfpSessionId[\s]*?=[\s]*?'(.*?)'/)) === null || _response$responseTex2 === void 0 ? void 0 : _response$responseTex2[1];

        if (!title) {
          try {
            var _JSON$parse, _response$responseTex3;

            title = (_JSON$parse = JSON.parse((_response$responseTex3 = response.responseText.match(new RegExp("\"".concat(offer, "\":({.*?)},\"offers\"")))) === null || _response$responseTex3 === void 0 ? void 0 : _response$responseTex3[1])) === null || _JSON$parse === void 0 ? void 0 : _JSON$parse.title;
          } catch (e) {
            console.error(e);
          }
        }

        if (XQW && dfpSessionId) {
          return {
            XQW: XQW,
            dfpSessionId: dfpSessionId,
            title: title
          };
        } else {
          Swal.update({
            title: '获取Token失败！',
            text: url,
            icon: 'error'
          });
          return null;
        }
      } else {
        console.error(response);
        Swal.update({
          title: '请求下单页面失败！',
          text: url,
          icon: 'error'
        });
        return null;
      }
    });
  }

  function orderPreview(_x, _x2, _x3) {
    return _orderPreview.apply(this, arguments);
  }

  function _orderPreview() {
    _orderPreview = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(namespace, offer, title) {
      var url, data, XQW, dfpSessionId;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              url = "https://www.epicgames.com/store/purchase?namespace=".concat(namespace, "&offers=").concat(offer);
              _context2.next = 3;
              return requestOrderPage(namespace, offer, title);

            case 3:
              data = _context2.sent;

              if (data) {
                _context2.next = 6;
                break;
              }

              return _context2.abrupt("return", null);

            case 6:
              XQW = data.XQW, dfpSessionId = data.dfpSessionId;
              Swal.update({
                title: '正在获取syncToken...',
                text: url,
                icon: 'info'
              });
              return _context2.abrupt("return", TM_request({
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
              return _context2.stop();
          }
        }
      }, _callee2);
    }));
    return _orderPreview.apply(this, arguments);
  }

  function getGame(_x4, _x5) {
    return _getGame.apply(this, arguments);
  }

  function _getGame() {
    _getGame = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(_ref, namespace) {
      var title, id, data, XQW, dfpSessionId, syncToken;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              title = _ref.title, id = _ref.id;
              _context3.next = 3;
              return orderPreview(namespace, id, title);

            case 3:
              data = _context3.sent;

              if (data) {
                _context3.next = 6;
                break;
              }

              return _context3.abrupt("return", null);

            case 6:
              XQW = data.XQW, dfpSessionId = data.dfpSessionId, syncToken = data.syncToken;
              Swal.update({
                title: '正在领取...',
                text: id,
                icon: 'info'
              });
              return _context3.abrupt("return", TM_request({
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
                    title: title || data.title,
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
                  if (!response.response.message) {
                    Swal.update({
                      title: '领取成功！',
                      text: id,
                      icon: 'success'
                    });
                  } else {
                    console.error(response);
                    Swal.update({
                      title: response.response.message,
                      text: id,
                      icon: 'info'
                    });
                  }
                } else {
                  console.error(response);
                  Swal.update({
                    title: response.response.message || '领取失败！',
                    text: id,
                    icon: 'error'
                  });
                  return null;
                }
              }));

            case 9:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));
    return _getGame.apply(this, arguments);
  }

  unsafeWindow.addToEpicLibrary = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(el) {
      var href, searchParams, namespace, offers, gameInfo, freeOffers, _iterator5, _step5, freeOffer;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              href = typeof el === 'string' ? el : $(el).attr('data-href');

              if (!($(el).attr('data-type') === 'purchase')) {
                _context.next = 8;
                break;
              }

              searchParams = new URL(href).searchParams;
              namespace = searchParams.get('namespace');
              offers = searchParams.get('offers');
              _context.next = 7;
              return getGame({
                id: offers
              }, namespace);

            case 7:
              return _context.abrupt("return", _context.sent);

            case 8:
              _context.next = 10;
              return getGameInfo(href);

            case 10:
              gameInfo = _context.sent;

              if (gameInfo) {
                _context.next = 14;
                break;
              }

              Swal.update({
                title: '获取游戏信息失败...',
                text: href,
                icon: 'error'
              });
              return _context.abrupt("return", null);

            case 14:
              _context.next = 16;
              return getDiscountInfo(href, gameInfo);

            case 16:
              freeOffers = _context.sent;

              if (freeOffers) {
                _context.next = 21;
                break;
              }

              return _context.abrupt("return", null);

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
              _context.prev = 23;

              _iterator5.s();

            case 25:
              if ((_step5 = _iterator5.n()).done) {
                _context.next = 31;
                break;
              }

              freeOffer = _step5.value;
              _context.next = 29;
              return getGame(freeOffer, gameInfo.namespace);

            case 29:
              _context.next = 25;
              break;

            case 31:
              _context.next = 36;
              break;

            case 33:
              _context.prev = 33;
              _context.t0 = _context["catch"](23);

              _iterator5.e(_context.t0);

            case 36:
              _context.prev = 36;

              _iterator5.f();

              return _context.finish(36);

            case 39:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[23, 33, 36, 39]]);
    }));

    return function (_x6) {
      return _ref2.apply(this, arguments);
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
