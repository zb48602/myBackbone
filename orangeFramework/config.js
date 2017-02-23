define(function () {
  //TODO jquery 加载判断
  var libs = Orange.dir + '3rdlibs/zepto';
  var iswinphone = window.navigator.userAgent.indexOf('IEMobile') > -1;
  if (iswinphone) {
    version = window.navigator.userAgent.match(/IEMobile\/\d+/);
    if (version.length > 0) {
      version = version[0].split('/');
      version = version[1];
    }
    ;
  }
  ;
  /*by wxj start*/
  if (!('__proto__' in {}) || (iswinphone && version < 10))
  /*by wxj end*/
  {
    //if ( (isie && !iswinphone) || (iswinphone && version < 10)){
    libs = Orange.dir + '3rdlibs/jquery';
  }

  require.config({
    shim: {
      $: {
        exports: 'zepto'
      },
      _: {
        exports: '_'
      },
      B: {
        deps: ['_', '$'],
        exports: 'Backbone'
      },
      F: {
        deps: ['$'],
        exports: 'Fastclick'
      },
      libs: {
        deps: ['_', '$', 'B'],
        exports: 'libs'
      },
      common: {
        deps: ['libs']
      },
      cAjax: {
        exports: 'cAjax'
      },
      UIView: {
        deps: ['B'],
        exports: 'UIView'
      },
      cServiceGuider: {
        deps: ['_'],
        exports: 'cServiceGuider'
      }
    },
    "paths": {
      "json2": Orange.dir + "3rdlibs/json2",
      "bridge": Orange.dir + "3rdlibs/bridge",
      "R": Orange.dir + "3rdlibs/require",
      '$': libs,
      "_": Orange.dir + "3rdlibs/underscore",
      "B": Orange.dir + "3rdlibs/backbone",
      "F": Orange.dir + "3rdlibs/fastclick",
      "libs": Orange.dir + "3rdlibs/libs",
      "text": Orange.dir + "3rdlibs/require.text",
      "cCoreInherit": Orange.dir + "common/c.class.inherit",

      "cBusinessCommon": Orange.dir + "app/c.app.interface",

      "cMessageCenter": Orange.dir + "common/c.message.center",
      "cAjax": Orange.dir + "common/c.ajax",
      "cImgLazyload": Orange.dir + "common/c.img.lazyload",

      "cUtil": Orange.dir + "util/c.util",
      "cUtilCacheView": Orange.dir + "util/c.util.cacheview",
      "cUtilCommon": Orange.dir + "util/c.util.common",
      "cUtilDate": Orange.dir + "util/c.util.date",
      "cUtilHybrid": Orange.dir + "util/c.util.hybrid",
      "cUtilObject": Orange.dir + "util/c.util.object",
      "cUtilPath": Orange.dir + "util/c.util.path",
      "cUtilPerformance": Orange.dir + "util/c.util.performance",
      "cUtilValidate": Orange.dir + "util/c.util.validate",
      "cUtilCryptBase64": Orange.dir + "util/crypt/c.crypt.base64",
      "cUtilCryptRSA": Orange.dir + "util/crypt/c.crypt.rsa",

      "cPageParser": Orange.dir + "app/c.page.parser",
      "cParserUtil": Orange.dir + "app/c.parser.util",
      "cPageModelProcessor": Orange.dir + "app/c.page.model.processor",

      "cPageView": Orange.dir + "page/c.page.view",
      "cPageList": Orange.dir + "page/c.page.list",

      "cAbstractModel": Orange.dir + "data/model/c.abstract.model",
      "cModel": Orange.dir + "data/model/c.model",
      "cUserModel": Orange.dir + "data/model/c.user.model",

      "cAbstractStore": Orange.dir + "data/store/c.abstract.store",
      "cLocalStore": Orange.dir + "data/store/c.local.store",
      "cSessionStore": Orange.dir + "data/store/c.session.store",
      "cMemoryStore": Orange.dir + "data/store/c.memory.store",
      "cCommonStore": Orange.dir + "data/store/c.common.store",
      "cHeadStore": Orange.dir + "data/store/common/c.head.store",
      "cUserStore": Orange.dir + "data/store/common/c.user.store",
      "cMarketStore": Orange.dir + "data/store/common/c.market.store",

      "cAbstractStorage": Orange.dir + "data/storage/c.abstract.storage",
      "cLocalStorage": Orange.dir + "data/storage/c.local.storage",
      "cSessionStorage": Orange.dir + "data/storage/c.session.storage",
      "cMemoryStorage": Orange.dir + "data/storage/c.memory.storage",

      "cUIInputClear": Orange.dir + "ui/c.ui.input.clear",
      "cUIBase": Orange.dir + "ui/c.ui.base",

      //新UI组件
      'UIView': Orange.dir + 'ui/ui.abstract.view',
      'UILayer': Orange.dir + 'ui/ui.layer',
      'UIAlert': Orange.dir + 'ui/ui.alert',
      'UIMask': Orange.dir + 'ui/ui.mask',
      'UILoadingLayer': Orange.dir + 'ui/ui.loading.layer',
      'UIToast': Orange.dir + 'ui/ui.toast',
      'UIInlineView': Orange.dir + 'ui/ui.inline.view',
      'UINum': Orange.dir + 'ui/ui.num',
      'UISwitch': Orange.dir + 'ui/ui.switch',
      'UIBubbleLayer': Orange.dir + 'ui/ui.bubble.layer',
      'UITab': Orange.dir + 'ui/ui.tab',
      'UIScroll': Orange.dir + 'ui/ui.scroll',
      'UIScrollLayer': Orange.dir + 'ui/ui.scroll.layer',
      'UIRadioList': Orange.dir + 'ui/ui.radio.list',
      'UISelect': Orange.dir + 'ui/ui.select',
      'UIGroupSelect': Orange.dir + 'ui/ui.group.select',
      'UIGroupList': Orange.dir + 'ui/ui.group.list',
      'UICalendar': Orange.dir + 'ui/ui.calendar',
      'UISlider': Orange.dir + 'ui/ui.slider',
      'UIImageSlider': Orange.dir + 'ui/ui.image.slider',
      'UIWarning404': Orange.dir + 'ui/ui.warning404',
      'UIHeader': Orange.dir + 'ui/ui.header',

      'UIIdentitycard': Orange.dir + 'ui/ui.identitycard',
      'UILayerList': Orange.dir + 'ui/ui.layer.list',
      'UIAnimation': Orange.dir + 'ui/c.ui.animation',

      //所有模板在此
//      'UITemplates': Orange.dir + 'ui/ui.templates',

      "cGeoService": Orange.dir + "service/c.service.geo",
      "cMemberService": Orange.dir + "service/c.service.member",
      "cGuiderService": Orange.dir + "service/c.service.guider",

      "cHybridMember": Orange.dir + "service/hybrid/c.hybrid.memberService",
      "cHybridGuider": Orange.dir + "service/hybrid/c.hybrid.guider",
      "cHybridGeolocation": Orange.dir + "service/hybrid/c.hybrid.geolocation",
      "cGeoHelper": Orange.dir + "service/web/c.geo.helper",
      "cWebMember": Orange.dir + "service/web/c.web.memberService",
      "cWebGuider": Orange.dir + "service/web/c.web.guider",
      "cWebGeolocation": Orange.dir + "service/web/c.web.geolocation",

      "cStatic": Orange.dir + "app/web/c.web.static",
      "cBaseInit": Orange.dir + "app/c.base.init",
      "cAbstractApp": Orange.dir + "app/c.abstract.app",
      "cWebApp": Orange.dir + "app/web/c.web.app",
      "cHybridApp": Orange.dir + "app/hybrid/c.hybrid.app",
      "cWebViewApp": Orange.dir + "app/hybrid/c.webview.app",
      "cHybridFacade": Orange.dir + "app/hybrid/c.hybrid.facade",
      "cHybridShell": Orange.dir + "app/hybrid/c.hybrid.shell",
      //"cHybridHeader": Orange.dir + "app/hybrid/c.hybrid.header",
      "cHybridAppInit": Orange.dir + "app/hybrid/c.hybrid.init",
      "cWebAppInit": Orange.dir + "app/web/c.web.init"
    },
    "map": {
      "*": {
        "cUtility": "cUtilCommon",
        "cStore": "cLocalStore",
        "cGuider": "cGuiderService",
        "CommonStore":"cCommonStore"
      }
    }
  }); 
})