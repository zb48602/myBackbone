define(['cUtilPath', 'cCoreInherit', 'cAbstractApp', 'cHybridShell'], function(path, cCoreInherit, APP, cHybridShell){
  var targetModeMap = {'refresh':0, 'app':1, 'h5':2, 'browser':3, 'open':4, 'open_relative':5};
  return cCoreInherit.Class(APP, {
    bindEvents: function($super) {      
      $super();
      $(window).bind('hashchange', _.bind(function(e){        
        if (!this.stopListening) this.loadFromRoute(this._getCurrentView(), 0); 
        Orange.__fakeViewNode && Orange.__fakeViewNode.remove();
      }, this));      
    },
    
    start: function()
    {      
      this.startUrl = this._getCurrentView();
      this.loadFromRoute(this.startUrl, 1);      
    },
    
    loadFromRoute: function(landingpath, landingpage)    
    {
      var localRouteRet = Orange.localRoute.mapUrl(landingpath);
      if (localRouteRet) {
        requirejs([localRouteRet], _.bind(function(text) {
          if (landingpath == this._getCurrentView())
          {
            this.loadView(landingpath, text, {pushState: false, renderAt: Orange.renderAt, landingpage: landingpage});  
          } else {
            console.log('fast click back!!!');
          }       
        }, this));
      }
    },
    
    _getCurrentView: function()
    {
      var landingpath = decodeURIComponent(window.location.hash);
      if (landingpath.indexOf('#') == 0)
      {
        landingpath = landingpath.substr(1);
      }
      else
      {
        landingpath = Orange.localRoute.config.defaultView || _.first(_.keys(Orange.localRoute.config));
      }
      return landingpath;
    },
    
    
    /**
     * Hybrid下的页面跳转方法
     * @param {String|url} URL信息
     * @param {Object|opt} 设置信息
     * @method Orange.goTo
     * @example
     * Orange.goTo(Orange.appBaseUrl + 'osd/osdindex', {targetModel: 'open', pageName: 'webViewOsd'})
     * 新开WebView的方式打开 osd/osdindex webView的名称指定为webViewOsd
     * Orange.goTo(Orange.appBaseUrl + 'osd/osdindex') 在同一个webView中直接跳转到osd/osdindex
     × Orange.goTo('', {pageName: 'webViewOsd'})  直接跳转到之前打开的webView名称为webViewOsd的webView
     */
    goTo: function(url, opt)
    {
      if ((opt && opt.targetModel) || Orange.targetModel) {
        var fn = new cHybridShell.Fn('open_url'), 
            targetModel = opt?opt.targetModel:Orange.targetModel, 
            pageName = (opt && opt.pageName)?opt.pageName:url;
        if (_.indexOf(['open', 'open_relative'], targetModel) > -1) {
          url = Orange.appBaseUrl.substr(8) + 'index.html#' + url;
        } 
        fn.run(url, targetModeMap[targetModel], document.title,  pageName);
      } else if (opt && opt.pageName) {
        var fn = new cHybridShell.Fn('back_to_page');
        fn.run(opt.pageName);
      }
      else {
        this.endObserver();      
        window.location.hash = encodeURIComponent(url); 
        if (opt && opt.viewName && Orange.viewHtmlMap[opt.viewName])
        {
          this.loadView(url, Orange.viewHtmlMap[opt.viewName], {pushState: false});
          return;
        }
        else
        {
          this.loadFromRoute(url, 0); 
        }
        setTimeout(_.bind(this.startObserver, this), 1);  
      }      
    },
    
    
    /**
     * Hybrid下的页面回退方法
     * @param {String|url} URL信息 
     * @param {Object|opt} 设置信息
     * @method Orange.goBack
     * @example
     * Orange.goBack() 简单页面回退 框架会判断如果是webview最先打开的页面会直接回退到上一个native页
     * Orange.goBack(Orange.appBaseUrl + 'osd/osdindex', {targetModel: 'open', pageName: 'webViewOsd'}) 同Orange.goTo(Orange.appBaseUrl + 'osd/osdindex', {targetModel: 'open', pageName: 'webViewOsd'})
     */
    goBack: function()
    {
      if (arguments.length == 0)
      {
        var prelocation = window.location.hash;
        history.back();
        setTimeout(_.bind(function(){
          if (prelocation == window.location.hash) {
            var fn = new cHybridShell.Fn('back_to_last_page');
            fn.run("", false);  
          }
        }, this), 100); 
      } else {
        this.goTo.apply(this, arguments);
      }
    },
    
    startObserver: function () {
      this.stopListening = false;
    },

    endObserver: function () {
      this.stopListening = true;
    },
    
    judgeForward: function(url)
    {
      if (window.location.hash)
      {
        return url == decodeURIComponent(window.location.hash).substr(1);
      }
      else
      {
        return url == (Orange.localRoute.config.defaultView || _.first(_.keys(Orange.localRoute.config)));
      }
    }
  })
})