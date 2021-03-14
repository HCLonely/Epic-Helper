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
// @grant              GM_registerMenuCommand
// @grant              unsafeWindow

// @require            https://cdn.jsdelivr.net/npm/jquery@3.4.1/dist/jquery.slim.min.js
// @require            https://cdn.jsdelivr.net/npm/regenerator-runtime@0.13.7/runtime.min.js
// @require            https://cdn.jsdelivr.net/npm/sweetalert2@9
// @require            https://cdn.jsdelivr.net/npm/promise-polyfill@8.1.3/dist/polyfill.min.js
// @require            https://greasyfork.org/scripts/418102-tm-request/code/TM_request.js?version=902218
// @connect            www.epicgames.com
// @connect            store-content.ak.epicgames.com
// @run-at             document-end
// @noframes
// ==/UserScript==

/* global addToEpicLibrary, syncEpicLib */
(function () {
  function addButton() {
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
  function getGameInfo(href) {
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
        /*
        if (response.responseText.includes('href="/login"')) {
          console.error(response)
          Swal.fire({
            title: '请先登录！',
            html: `<a href="https://www.epicgames.com/login" target="_blank">点此登录</a>`,
            icon: 'error'
          })
          return null
        }
        */
        let offers = []
        for (let page of response.response.pages) {
          const editions = page.data.editions.editions || []
          const dlcs = page.data.dlc.dlc || []
          for (let info of [...editions, ...dlcs]) {
            offers.push(offerId)
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
  function getDiscountInfo(gameInfo) {
    Swal.update({
      title: '正在获取折扣信息...',
      text: href,
      icon: 'info'
    })
    const { namespace, offers } = gameInfo
    const data = []
    for (const offer of offers) {
      data.push({
        'query': 'query catalogQuery($productNamespace: String!, $offerId: String!, $locale: String, $country: String!) {\n  Catalog {\n    catalogOffer(namespace: $productNamespace, id: $offerId, locale: $locale) {\n      title\n      id\n      namespace\n      description\n      effectiveDate\n      expiryDate\n      isCodeRedemptionOnly\n      seller {\n        id\n        name\n      }\n      productSlug\n      urlSlug\n      url\n      price(country: $country) {\n        totalPrice {\n          discountPrice\n          originalPrice\n          discount\n          }\n      }\n    }\n  }\n}\n',
        "variables": {
          "productNamespace": namespace,
          "offerId": offer,
          "locale": "zh-CN",
          "country": "CN",
          "lineOffers": [
            {
              "offerId": offer,
              "quantity": 1
            }
          ],
          "calculateTax": false,
          "includeSubItems": true
        }
      })
    }
    return TM_request({
      url: 'https://www.epicgames.com/graphql',
      method: 'POST',
      responseType: 'json',
      data,
      nocache: true,
      headers: {
        'content-type': 'application/json;charset=UTF-8'
      },
      timeout: 30000,
      retry: 3
    })
      .then(response => {
        return
        if (response.response?.status === 'ok') {
          Swal.update({
            title: '领取成功！',
            text: href,
            icon: 'success'
          })
          if (syncEpicLib) {
            syncEpicLib(false, false).then(allGames => {
              for (const el of $('a[href*=".indiegala.com/"]')) {
                const $this = $(el).addClass('Epic-checked')
                const href = $this.attr('href')
                if (/^https?:\/\/[\w\d]+?\.indiegala\.com\/.+$/.test(href) && allGames.includes(new URL(href).pathname.replace(/\//g, ''))) {
                  $this.addClass('Epic-owned')
                }
              }
            })
          }
          return true
        } else if (response.response?.status === 'added') {
          Swal.update({
            title: '已在库中！',
            text: href,
            icon: 'warning'
          })
          return true
        } else if (response.response?.status === 'login' || response.response?.status === 'auth') {
          Swal.fire({
            title: '请先登录！',
            icon: 'error',
            showCancelButton: true,
            confirmButtonText: '登录',
            cancelButtonText: '关闭'
          }).then(({ value }) => {
            if (value) {
              window.open('https://www.indiegala.com/login', '_blank')
            }
          })
          return false
        } else {
          console.error(response)
          Swal.update({
            title: '领取失败！',
            text: href,
            icon: 'error'
          })
          return null
        }
      })
  }
  unsafeWindow.addToEpicLibrary = async function (el) {
    const href = typeof el === 'string' ? el : $(el).attr('data-href')
    /*
    if ($(el).attr('data-type') === "purchase"){
      const namespace =
    }
    */
    const gameInfo = await getGameInfo(href)
    if (!gameInfo) {
      Swal.update({
        title: '获取游戏信息失败...',
        text: href,
        icon: 'error'
      })
      return null
    }
    return await getDiscountInfo(href, gameInfo)
    Swal.update({
      title: '正在领取...',
      text: href,
      icon: 'info'
    })
    return TM_request({
      url,
      method: 'POST',
      responseType: 'json',
      nocache: true,
      headers: {
        'content-type': 'application/json'
      },
      timeout: 30000,
      retry: 3
    })
      .then(response => {
        if (response.response?.status === 'ok') {
          Swal.update({
            title: '领取成功！',
            text: href,
            icon: 'success'
          })
          if (syncEpicLib) {
            syncEpicLib(false, false).then(allGames => {
              for (const el of $('a[href*=".indiegala.com/"]')) {
                const $this = $(el).addClass('Epic-checked')
                const href = $this.attr('href')
                if (/^https?:\/\/[\w\d]+?\.indiegala\.com\/.+$/.test(href) && allGames.includes(new URL(href).pathname.replace(/\//g, ''))) {
                  $this.addClass('Epic-owned')
                }
              }
            })
          }
          return true
        } else if (response.response?.status === 'added') {
          Swal.update({
            title: '已在库中！',
            text: href,
            icon: 'warning'
          })
          return true
        } else if (response.response?.status === 'login' || response.response?.status === 'auth') {
          Swal.fire({
            title: '请先登录！',
            icon: 'error',
            showCancelButton: true,
            confirmButtonText: '登录',
            cancelButtonText: '关闭'
          }).then(({ value }) => {
            if (value) {
              window.open('https://www.indiegala.com/login', '_blank')
            }
          })
          return false
        } else {
          console.error(response)
          Swal.update({
            title: '领取失败！',
            text: href,
            icon: 'error'
          })
          return null
        }
      })
  }
  GM_registerMenuCommand('领取所有', async () => {
    const links = $.makeArray($('a.add-to-library')).map((e, i) => {
      return $(e).prev().hasClass('Epic-owned') ? null : $(e).attr('data-href')
    }).filter(e => e)
    const newLinks = [...new Set(links)]
    const failedLinks = []
    for (const link of newLinks) {
      const result = await addToIndiegalaLibrary(link)
      if (result === false) {
        break
      } else if (!result) {
        failedLinks.push(`<a href="${link}" target=_blank">${link}</a>`)
      }
    }
    if (failedLinks.length === 0) {
      Swal.fire({
        title: '全部任务完成！',
        icon: 'success'
      })
    } else {
      Swal.fire({
        title: '以下任务未完成！',
        icon: 'warning',
        html: failedLinks.join('<br/>')
      })
    }
  })
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
