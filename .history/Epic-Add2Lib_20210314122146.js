// ==UserScript==
// @name               Epic-Add2Lib
// @namespace          Epic-Add2Lib
// @version            1.0.6
// @description        indiegala 快速领取免费游戏
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
  function addButton () {
    for (const el of $('a[href^="https://www.epicgames.com/store/"]:not(".Epic-add2lib")')) {
      const $this = $(el).addClass('Epic-add2lib')
      const href = $this.attr('href')
      if (/^https?:\/\/www\.epicgames\.com\/store\/.*?\/p\/.*/.test(href)) {
        $this.after(`<a class="add-to-library" href="javascript:void(0)" onclick="addToEpicLibrary(this)" data-href="${href}" data-type="store" target="_self">领取</a>`)
      }
      if (/^https?:\/\/www\.epicgames\.com\/store\/purchase.*/.test(href) && href.includes('namespace') && href.includes('offers')) {
        $this.after(`<a class="add-to-library" href="javascript:void(0)" onclick="addToEpicLibrary(this)" data-href="${href}" data-type="purchase" target="_self">领取</a>`)
      }
    }
  }
  function getGameInfo (href) {
    Swal.fire({
      title: '正在获取游戏信息...',
      text: href,
      icon: 'info'
    })
    const name = new URL(href).pathname.replace(/\/store\/(.*?)\/p\//, '')
    return TM_request({
      url: 'https://store-content.ak.epicgames.com/api/zh-CN/content/products/' + name,
      method: 'GET',
      responseType: 'json',
      anonymous: true,
      timeout: 30000,
      retry: 3
    })
      .then(response => {
        if (!response.response) {
          console.error(response)
          return null
        }
        let offers = []
        for (const page of response.response.pages) {
          const editions = page.data.editions.editions || []
          const dlcs = page.data.dlc.dlc || []
          for (const info of [...editions, ...dlcs]) {
            offers.push(info.offerId)
          }
        }
        const namespace = response.response.namespace
        offers = [...new Set(offers)]
        return { namespace, offers }
      })
      .catch(error => {
        console.error(error)
        return null
      })
  }
  function getDiscountInfo (href, gameInfo) {
    Swal.update({
      title: '正在获取折扣信息...',
      text: href,
      icon: 'info'
    })
    const { namespace, offers } = gameInfo
    const data = []
    for (const offer of offers) {
      data.push({
        query: 'query catalogQuery($productNamespace: String!, $offerId: String!, $locale: String, $country: String!) {\n  Catalog {\n    catalogOffer(namespace: $productNamespace, id: $offerId, locale: $locale) {\n      title\n      id\n      namespace\n      description\n      effectiveDate\n      expiryDate\n      isCodeRedemptionOnly\n      seller {\n        id\n        name\n      }\n      productSlug\n      urlSlug\n      url\n      price(country: $country) {\n        totalPrice {\n          discountPrice\n          originalPrice\n          discount\n          }\n      }\n    }\n  }\n}\n',
        variables: {
          productNamespace: namespace,
          offerId: offer,
          locale: 'zh-CN',
          country: 'CN',
          lineOffers: [
            {
              offerId: offer,
              quantity: 1
            }
          ],
          calculateTax: false,
          includeSubItems: true
        }
      })
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
    })
      .then(response => {
        if (response.status === 200) {
          Swal.update({
            title: '获取折扣信息成功！',
            text: href,
            icon: 'success'
          })
          const freeOffers = []
          if (response.response?.length > 0) {
            for (const info of response.response) {
              const price = info.data.Catalog.catalogOffer.price.totalPrice.discountPrice
              if (price === 0) {
                freeOffers.push({ title: info.data.Catalog.catalogOffer.title, id: info.data.Catalog.catalogOffer.id })
              }
            }
          }
          return freeOffers
        } else {
          console.error(response)
          Swal.update({
            title: '获取折扣信息失败！',
            text: href,
            icon: 'error'
          })
          return null
        }
      })
  }
  function requestOrderPage (namespace, offer, title) {
    const url = `https://www.epicgames.com/store/purchase?namespace=${namespace}&offers=${offer}`
    Swal.update({
      title: '正在请求下单页面...',
      text: url,
      icon: 'info'
    })
    return TM_request({
      url,
      method: 'GET',
      nocache: true,
      timeout: 30000,
      retry: 3
    })
      .then(response => {
        if (response.status === 200 && response.responseText) {
          if (response.finalUrl.includes('www.epicgames.com/id/login')) {
            console.error(response)
            Swal.fire({
              title: '请先登录！',
              html: '<a href="https://www.epicgames.com/login" target="_blank">点此登录</a>',
              icon: 'error'
            })
            return null
          }
          const XQW = response.responseText.match(/id="purchaseToken"[\s]*?value="(.*?)"/)?.[1]
          const dfpSessionId = response.responseText.match(/window\.dfpSessionId[\s]*?=[\s]*?'(.*?)'/)?.[1]
          if (!title) {
            try {
              title = JSON.parse(response.responseText.match(new RegExp(`"${offer}":(\{.*?)\},"offers"`))?.[1])?.title
            } catch (e) {
              console.error(e)
            }
          }
          if (XQW && dfpSessionId) {
            return { XQW, dfpSessionId, title }
          } else {
            Swal.update({
              title: '获取Token失败！',
              text: url,
              icon: 'error'
            })
            return null
          }
        } else {
          console.error(response)
          Swal.update({
            title: '请求下单页面失败！',
            text: url,
            icon: 'error'
          })
          return null
        }
      })
  }
  async function orderPreview (namespace, offer, title) {
    const url = `https://www.epicgames.com/store/purchase?namespace=${namespace}&offers=${offer}`
    const data = await requestOrderPage(namespace, offer, title)
    if (!data) return null
    const { XQW, dfpSessionId } = data
    Swal.update({
      title: '正在获取syncToken...',
      text: url,
      icon: 'info'
    })
    return TM_request({
      url: 'https://payment-website-pci.ol.epicgames.com/purchase/order-preview',
      method: 'POST',
      responseType: 'json',
      nocache: true,
      data: JSON.stringify({ // 没有发出去
        useDefault: true,
        setDefault: false,
        orderId: null,
        namespace,
        country: null,
        countryName: null,
        orderComplete: null,
        orderError: null,
        orderPending: null,
        offers: [
          offer
        ],
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
    })
      .then(response => {
        if (response.status === 200 && response.response) {
          if (!response.response.message && response.response.syncToken) {
            Swal.update({
              title: '获取syncToken成功！',
              text: offer,
              icon: 'success'
            })
            return { XQW, dfpSessionId, syncToken: response.response.syncToken, title: title || data.title }
          } else {
            console.error(response)
            Swal.update({
              title: response.response.message || '获取syncToken失败！',
              text: offer,
              icon: 'error'
            })
            return null
          }
        } else {
          console.error(response)
          Swal.update({
            title: '获取syncToken失败！',
            text: offer,
            icon: 'error'
          })
          return null
        }
      })
  }
  async function getGame ({ title, id }, namespace) {
    const data = await orderPreview(namespace, id, title)
    if (!data) return null
    const { XQW, dfpSessionId, syncToken } = data
    Swal.update({
      title: '正在领取...',
      text: id,
      icon: 'info'
    })
    // return console.log({ XQW, dfpSessionId, syncToken, title, id, namespace })
    return TM_request({
      url: 'https://payment-website-pci.ol.epicgames.com/purchase/confirm-order',
      method: 'POST',
      responseType: 'json',
      nocache: true,
      data: JSON.stringify({
        useDefault: true,
        setDefault: false,
        orderId: null,
        namespace,
        country: 'CN',
        countryName: 'China',
        orderComplete: false,
        orderError: false,
        orderPending: false,
        offers: [
          id
        ],
        includeAccountBalance: false,
        totalAmount: 0,
        affiliateId: '',
        creatorSource: '',
        threeDSToken: '',
        voucherCode: null,
        eulaId: null,
        lineOffers: [
          {
            offerId: id,
            title: title || data.title,
            namespace,
            upgradePathId: null
          }
        ],
        useDefaultBillingAccount: true,
        syncToken: syncToken,
        canQuickPurchase: true
      }),
      headers: {
        'content-type': 'application/json',
        dfpdccode: 'uswest',
        dfpsessionid: dfpSessionId,
        origin: 'https://www.epicgames.com',
        referer: `https://www.epicgames.com/store/purchase?namespace=${namespace}&offers=${id}`,
        'x-requested-with': XQW
      },
      timeout: 30000,
      retry: 3
    })
      .then(response => {
        if (response.status === 200 && response.response) {
          if (!response.response.message) {
            Swal.update({
              title: '领取成功！',
              text: id,
              icon: 'success'
            })
          } else {
            console.error(response)
            Swal.update({
              title: response.response.message,
              text: id,
              icon: 'info'
            })
          }
        } else {
          console.error(response)
          Swal.update({
            title: response.response.message || '领取失败！',
            text: id,
            icon: 'error'
          })
          return null
        }
      })
  }
  unsafeWindow.addToEpicLibrary = async function (el) {
    const href = typeof el === 'string' ? el : $(el).attr('data-href')

    if ($(el).attr('data-type') === 'purchase') {
      const searchParams = new URL(href).searchParams
      const namespace = searchParams.get('namespace')
      const offers = searchParams.get('offers')
      return await getGame({ id: offers }, namespace)
    }

    const gameInfo = await getGameInfo(href)
    if (!gameInfo) {
      Swal.update({
        title: '获取游戏信息失败...',
        text: href,
        icon: 'error'
      })
      return null
    }
    const freeOffers = await getDiscountInfo(href, gameInfo)
    if (!freeOffers) {
      return null
    } else if (freeOffers.length === 0) {
      Swal.update({
        title: '没有获取到免费游戏！',
        text: href,
        icon: 'warning'
      })
    }
    for (const freeOffer of freeOffers) {
      await getGame(freeOffer, gameInfo.namespace)
    }
  }
  GM_addStyle('.add-to-library{margin-left:10px;}')
  addButton()
  const observer = new MutationObserver(addButton)
  observer.observe(document.documentElement, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true
  })
})()
