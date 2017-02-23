/**
 * @File c.abstract.app.js
 * Orange APP对象
 * @author wxj@ctrip.com/luwei@ctripcom
 * @version V2.1
 */
define(['cPageModelProcessor', 'cUtilPerformance', 'cUtilCommon', 'UILoadingLayer', 'UIHeader', 'UIWarning404', 'UIAlert', 'UIToast', 'cMessageCenter', 'UIAnimation', 'cPageParser'],
  function (callModels, cperformance, utils, Loading, Header, Warning404, Alert, Toast, MessageCenter, animation) {

    if (/\/html5\//i.test(location.href.replace(/[\?#].+$/, ''))) {
      $('<base/>').attr('href', location.href.replace(/\/html5\//i, '/webapp/')).prependTo($('head').eq(0));
    }

    //矫正Orange的两个静态属性 ;
    Orange.runAt = "client"; //运行在什么环境 html5还是webapp
    var renderAt = $('.main-viewport').attr('renderat');
    Orange.renderAt = 'server';
    if (!renderAt) Orange.renderAt = 'client'; //判断首屏渲染的环境v8还是brower

    function APP(options) {
      this.initialize(options)
    }

    APP.subclasses = [];

    APP.defaults = {
      "mainRoot": '#main',
      "header": 'header',
      "viewport": '.main-viewport',
      "animForwardName": 'slideleft',
      "animBackwardName": 'slideright',
      "isAnim": false,
      //是否开启动画
      "maxsize": 10
    };

    APP.prototype = {
      ctnrViewNames: ['OrangeHisCtnrView'],

      viewReady: function (handler) {
        //TODO subscribe viewReady message
        MessageCenter.subscribe('viewReady', handler);
      },

      initialize: function initialize(options) {
        // Orange.group();
        var opts = this.initProperty(options);
        this.options = opts;
        this.firstState = null;
        this.mainRoot = $(opts.mainRoot);
        this.header = $(opts.header);
        this.viewport = this.mainRoot.find(opts.viewport);
        this.curView = null;
        this.lastView = null;
        //实例化cathViews组件
        this.maxsize = opts.maxsize;
        this.animForwardName = opts.animForwardName;
        this.animBackwardName = opts.animBackwardName;
        this.isAnim = opts.isAnim || Orange.isAnim;
        this.animAPIs = animation;
        this.animatName = this.animForwardName;
        this._loading = new Loading();
        this._alert = new Alert();
        this._confirm = new Alert();
        this._toast = new Toast();
        this._warning404 = new Warning404();
        //是否开启hashchange,false为不开启
        this.observe = false;
        this.headerView = new Header({ 'root': $('#headerview') });
        if (Orange.isHybrid) {
          this.headerView.root.addClass('cm-header-hybird-wrap');
        } 
        this.bindEvents();
        this.views = {};
        this.start();
        MessageCenter.subscribe('switchview', function (inView, outView) {          
          inView.$el.show();
        }, this);
      },

      /**
       * 以弹出框的形式，弹出提示信息
       * @param {String|Object} 需要弹出的信息
       * @method Orange.showMessage
       * @example
       * //参数
       *  1."显示信息"
       *  2.{
       *    datamodel：
       *      {
       *        content："显示信息"，
       *        title："带标题",
       *        okTxt:"按钮文本",
       *      },
       *    okAction:function(){}   //按钮回调函数
       *  }
       */
      showMessage: function (params) {
        if (!params) params = {};
        if (typeof params == 'string') {
          params = {
            datamodel: {
              content: params
            }
          };
        }

        //每次需要重置属性，以防组件互相影响
        this._alert.resetDefaultProperty();
        this._alert.setOption(params);
        this._alert.refresh();
        this._alert.show();

      },

      /**
       * 隐藏由showMessage弹出的消息
       * @method Orange.hideMessage
       */
      hideMessage: function () {
        this._alert.hide();
      },

      /**
       * 以弹出框的形式，弹出确认信息
       * @param {String|Object} 需要弹出的信息
       * @method Orange.showConfirm
       * @example
       * //参数
       *  1."显示信息"
       *  2.{
       *    datamodel：
       *      {
       *        content："显示信息"，
       *        title："带标题",
       *         btns: [
       *              { name: '取消', className: 'cui-btns-cancel' },
       *              { name: '确定', className: 'cui-btns-ok' }
       *            ]//对应按钮
       *      },
       *    okAction:function(){},           //确认按钮回调
       *    cancleAction:function(){}       //取消按钮的回调
       *  }
       */
      showConfirm: function (params) {
        if (!params) params = {};
        if (typeof params == 'string') {
          params = {
            datamodel: {
              content: params
            }
          };
        }

        this._confirm.resetDefaultProperty();

        //与showMessage不一样的地方
        this._confirm.datamodel.btns = [
          { name: '取消', className: 'cui-btns-cancel' },
          { name: '确定', className: 'cui-btns-ok' }
        ];
        this._confirm.setOption(params);
        this._confirm.refresh();
        this._confirm.show();
      },

      /**
       * 隐藏由showConfirm 弹出的确认信息框
       * @method Orange.hideConfirm
       */
      hideConfirm: function () {
        this._confirm.hide();
      },

      /**
       * 全局单例的warning404
       * @param {Function|Object} 点击重试的回调或者弹出框的样式
       * @method Orange.showWarning404
       * @example
       * //参数
       * 1.function(){}   //点击重试的回调
       * 2.
       * {
       *   datamodel: {
       *     tel: '4000086666',
       *     loadFail: '加载失败，请稍后再试试吧',
       *     telText: '或者拨打携程客服电话',
       *     tryAgain: '重试',
       *     contact: '联系客服',
       *     showContact: true
       *    },
       *    callTelAction: function() {}, //拨打客服电话的回调
       *    retryAction: function(){}   // 点击重试按钮的回调
       * }
       */
      showWarning404: function (params, pageConfig, errorData) {
        var scope = this;

        if (!params) params = {};
        if (typeof params == 'function') {
          params = {
            retryAction: params
          };
        }

        //每次需要重置属性，以防组件互相影响
        this._warning404.resetDefaultProperty();
        this._warning404.setOption(params);
        this._warning404.refresh();

        Orange.showHisCtnrView(function () {
          if (scope._warning404) {
            scope._warning404.wrapper = this.$el;
            scope._warning404.show();
            errorData && this.headerview.set(errorData.headData);
          }
        }, function () {
          if (scope._warning404) scope._warning404.hide();
        }, {triggerHide: false, addToHistory: false, viewName: 'warning404', pageConfig: pageConfig});
      },

      /**
       * 关闭由showWarning404弹出的提示框
       * @method Orange.hideWarning404
       */
      hideWarning404: function () {
//        window.history.back();
      },

      /**
       * 显示提示信息，在一定时间内自动消失
       * @param {String|Object} 需要显示的消息或者样式的参数
       * @method Orange.showToast
       * @example
       * 1."提示文本信息"
       * 2.{
       *                datamodel:
       *                {
       *                    content: 'toast'
       *                 }
       *                hideAction: function() {}//关闭消息时执行的回调
       *     }
       */
      showToast: function (params) {
        if (!params) params = {};
        if (typeof params == 'string') {
          params = {
            datamodel: {
              content: params
            }
          };
        }

        this._toast.resetDefaultProperty();
        this._toast.setOption(params);
        this._toast.refresh();
        this._toast.show();
      },

      /**
       * 关闭有showToast弹出的消息
       * @method Orange.hideToast
       */
      hideToast: function () {
        this._toast.hide();
      },

      /**
       * 显示携程的loading 图标
       * @param {Object} 不传递参数或者传递改变样式参数
       * @method Orange.showLoading
       * @example
       * //参数
       *{
       *   datamodel:
       *   {
       *       closeBtn: false,//是否显示关闭按钮
       *       content: ''//是否显示文字
       *      },
       *  closeAction: function(){}//点击关闭按钮执行的回调
       *}
       */
      showLoading: function (params) {
        if (this._loading._showTimeout) {
          clearTimeout(this._loading._showTimeout);
          delete this._loading._showTimeout;
        }
        if (!params) params = {};

        this._loading.resetDefaultProperty();
        this._loading.setOption(params);
        this._loading.refresh();
        this._loading._showTimeout = setTimeout(_.bind(function(){
          this._loading.show();
          delete this._loading._showTimeout;
        }, this), Orange.showloadingtimeout || 200);
      },
      /**
       * 关闭携程的loading图标
       * @method Orange.hideLoading
       */
      hideLoading: function () {
        if (this._loading._showTimeout) {
          clearTimeout(this._loading._showTimeout);
          delete this._loading._showTimeout;
        }
        this._loading.hide();
      },

      initProperty: function initProperty(options) {
        var opts = _.extend({}, APP.defaults, options || {});
        return opts;
      },

      bindEvents: function () {
        //l_wang提升响应速度
        $.bindFastClick && $.bindFastClick();
        //处理a标签
        this._handleLink();
      },

      _handleLink: function _handleLink() {
        if (!Orange.isHybrid && !utils.isSupportPushState) return;
        $('body').on('click', $.proxy(function (e) {
            var el = $(e.target);
            var needhandle = false;

            while (true) {
              if (!el[0]) break;
              if (el[0].nodeName == 'BODY') break;
              if (el.hasClass('sub-viewport')) break;

              if (el[0].nodeName == 'A') {
                needhandle = true;
                break;
              }
              el = el.parent();
            }

            if (needhandle) {
              var href = el.attr('href');
              var opts = {};
              var Orange_data = el.attr('Orange-data');

              if ((el.attr('Orange-catch') == 'off') || (href && utils.isExternalLink(href))) {
                return true;
              }
              e.preventDefault();
              if (Orange_data) {
                opts.data = JSON.parse(Orange_data);
              }
              if (el.attr('data-jumptype') == 'back') {
                this.back(el.attr('href'), opts);
              } else if (el.attr('data-jumptype') == 'forward') {
                this.goTo(el.attr('href'), opts);
              }
            }
          },
          this));
      },

      start: function () {

      },

      loadView: function (url, html, options) {
        var uuidDomready = cperformance.getUuid();
        var uuidOnload = cperformance.getUuid();
        cperformance.group(uuidDomready, {
          name: "Domready",
          landingpage: (options.landingpage == 1) ? 1 : 0,
          url: url
        });
        cperformance.group(uuidOnload, {
          name: "Onload",
          landingpage: (options.landingpage == 1) ? 1 : 0,
          url: url
        });
        if ((Orange.config && Orange.config.isHideAllLoading) || options.hideloading) {
          this.hideLoading();
        }
        else {
          this.showLoading();
        }
        Orange.loadingView = true;

        if (url) {
          var view = this.curView || {
            hpageid: '',
            pageid: '',
            _getViewUrl: function () {
              return "";
            },
            _hybridUrl: function () {
              if (Orange.isHybrid) {
                return 'http://hybridm.ctrip.com' + url;
              } else {
                return ubtURL;
              }
            }
          };
          var ubtURL = window.location.protocol + '//' + window.location.host + (url.indexOf(Orange.appBaseUrl) == 0 ? url : Orange.appBaseUrl + url)
          if (!window.__bfi) window.__bfi = [];
          window.__bfi.push(['_unload', {
            page_id: Orange.isHybrid ? view.hpageid : view.pageid,
            url: view._hybridUrl(),
            refer: view.$el ? view._hybridUrl(window.location.protocol + '//' + window.location.host + view.$el.attr('page-url')) : document.referrer
          }]);
        }
        var pageConfig = Orange._initParser(url, html);
        callModels(pageConfig, _.bind(function (datas, pageConfig) {
          if (_.isFunction(this.judgeForward) && !this.judgeForward(url)) {
            return;
          }
          var uuidTemplateRender = cperformance.getUuid();
          cperformance.group(uuidTemplateRender, {
            name: "TemplateRender",
            url: url
          });
          var renderObj = Orange.render(pageConfig, datas);
          cperformance.groupEnd(uuidTemplateRender);
          if (!Orange.viewHtmlMap) {
            Orange.viewHtmlMap = {};
          }
          Orange.viewHtmlMap[renderObj.config.viewName] = html;
          this.headerView.set({title: $(renderObj.header).text(), back: true, events: {returnHandler: function(){Orange.goBack()}}});
          var renderNode = $('<DIV></DIV>').css({display: 'none'});
          if (options.renderAt == 'server') {
            this.hideLoading();
          } else {
            renderNode = $(renderObj.viewport).css({display: 'none'});
          }
          if (renderObj.config.showfake && (!this.views[renderObj.config.viewName] || this.views[renderObj.config.viewName].$el.attr('page-url') != url)) {
            if (_.isObject(renderObj.config.showfake) && renderObj.config.showfake.hideloading) {
              this.hideLoading();
            }
            Orange.__fakeViewNode = renderNode.appendTo(this.viewport);
            this.curView && this.curView.$el.hide();
          }
          require([renderObj.config.controller || 'cPageView'], _.bind(function (View) {
            if (_.isFunction(this.judgeForward) && !this.judgeForward(url)) {
              return;
            }
            if (this.curView) this.lastView = this.curView;
            if (renderObj.config.viewName && this.views[renderObj.config.viewName]) {
              this.curView = this.views[renderObj.config.viewName];
              if (this.curView.$el.attr('page-url') != url) {
                this.curView.$el.remove();
                !renderObj.config.showfake && renderNode.appendTo(this.viewport);
                this.curView.$el = renderNode;
                this.curView.onCreate && this.curView.onCreate();
                this.curView.delegateEvents();
              }
            }
            else {
              !renderObj.config.showfake && renderNode.appendTo(this.viewport);
              this.curView = new View({
                el: (options.renderAt == 'server') ? this.viewport.children().first() : renderNode
              });
              this.curView.$el.attr('page-url', url);
            }
            if (options.renderAt == 'server') renderNode.remove();
            Orange.__fakeViewNode = null;
            cperformance.groupEnd(uuidDomready);
            this.curView.text = html;
            _.extend(this.curView, _.pick(renderObj, ['datas', 'config', 'lizTmpl', 'lizParam']));
            if (this.curView && this.curView.switchByOut) {
              var self = this;
              this.curView.turning = function () {
                this.hideLoading();

                self.lastView && self.lastView.hide();
                MessageCenter.publish('switchview', [self.curView, self.lastView]);
                self.curView.$el.show();
              }
            }
            else {
              this.hideLoading();
              MessageCenter.publish('switchview', [this.curView, this.lastView]);
            }
            this.curView.lastViewId = this.curView.referrer = (this.lastView && this.lastView.config.viewName);
            this.switchView(this.curView, this.lastView);
            cperformance.groupEnd(uuidOnload);
            if (renderObj.config.viewName) {
              this.views[renderObj.config.viewName] = this.curView;
            }
          }, this))
        }, this), _.bind(function (datas, errorBack) {
          this.hideLoading();
          var errorData =
          {
            callback: function () {
              this.hideWarning404();
              Orange.goTo(url);
            },
            headData: {
              title: '网络不给力',
              back: true,
              events: {
                returnHandler: function () {
                  Orange.back();
                }
              }
            }
          };
          if (errorBack) errorData = _.extend(errorData, errorBack(datas));
          this.showWarning404(_.bind(errorData.callback, this), pageConfig, errorData);
        }, this));
      },

      switchView: function switchView(inView, outView) {
        if (outView && !document.getElementById(outView.id) && (inView && !inView.switchByOut)) {
          outView.$el.appendTo(this.viewport);
          outView.$el.hide();
        }
        if (inView && !document.getElementById(inView.id)) {
          inView.$el.appendTo(this.viewport);
          inView.$el.hide();
        }
        //inView.$el.show();
        //动画切换时执行的回调
        var switchFn;

        //此处有问题，如果inView不再的话，应该由firstState生成默认页面
        if (!inView) throw 'inview 未被实例化';

        //将T 、P的值重新设置回去
        Orange.T.lizTmpl = inView.lizTmpl;
        Orange.P.lizParam = inView.lizParam;

        //outView不存在的情况下就不释放动画接口
        if (outView) {
          outView.saveScrollPos();
          if (this.isAnim) {
            switchFn = this.animAPIs[this.animatName];
          }
          //switchFn = this.animAPIs[this.animatName];
          //未定义的话便使用默认的无动画
          //l_wang 此段代码需要做一个包裹，或者需要回调，否则不会执行应该执行的代码!!!
          inView.fromView = outView.config.viewName;
          if (_.indexOf(this.ctnrViewNames, inView.config.viewName) > -1) {
            MessageCenter.publish('showHisCtnrView');
            outView.hideWarning404 = _.bind(function () {
              if (this._warning404.status === 'show') {
                Orange.goBack();
              }
            }, this)
          }
          if (switchFn && _.isFunction(switchFn)) {
            switchFn(inView, outView, $.proxy(function (inView, outView) {
                this._onSwitchEnd(inView, outView);
              },
              this));
          } else {
            inView && !inView.switchByOut && outView.hide();
            inView.show();
            this._onSwitchEnd(inView, outView);
          }
        } else {
          //这里开始走view的逻辑，我这里不予关注
          if (_.indexOf(this.ctnrViewNames, inView.config.viewName) > -1) {
            MessageCenter.publish('showHisCtnrView');
          }
          inView.show();
          this._onSwitchEnd(inView, outView);
        }
      },
      //l_wang 既然使用消息机制，就应该全部使用，后期重构
      _onSwitchEnd: function (inView, outView) {
        _.each(this.viewport.children(), function(view){
          if (view != inView.$el[0]) $(view).hide();
        })
        if (outView != inView && !inView.switchByOut) {
          setTimeout(function () {
            outView && outView.$el && outView.$el.hide()
          }, 10);
        }
        inView.sendUbt(true);
        MessageCenter.publish('viewReady', [inView]);
      },

      showView: function (data) {
        this.loadView(data.url, data.text, data.options);
      },

      /**
       * 内部调用goTo,具体参考goTo方法
       * @param url
       * @param opt
       * @method Orange.forward
       */
      /**
       * 跳转到制定url的页面
       * @param {String} url
       * @param {Object|*} opt
       * @method Orange.goTo
       * @example
       * //参数：
       * url: Orange.appBaseUrl + url
       * opt:
       * {
       *   loading:false,        //不出现loading框
       *   viewName:"detail",    //onCreate, onShow都触发
       *   cache:true            // 第二次进入这个view的时候，直接调用缓存的view html,然后只触发下个view的onShow
       * }
       */
      goTo: function (url, opt) {

      },

      /**
       * 直接调用浏览器的back事件
       * @params {Object} 有参数时，内部调用goTo方法，参数详见goTo
       * @method  Orange.goBack
       * @example
       * Orange.goBack()
       * Orange.goBack({viewName:"detail"});
       */
      goBack: function () {

      },

      /**
       * 内部调用goTo,具体参考goTo方法
       * @param url
       * @param opt
       * @method Orange.go
       */
      go: function () {
      },

      /**
       * 显示一个全局遮盖层
       * @param {Function} 显示遮盖层时的回调
       * @param {Function} 隐藏遮盖层时的回调
       * @param {Object}   传入参数
       * @method Orange.showHisCtnrView
       */
      showHisCtnrView: function (onShow, onHide, options) {
        if (!this.curView && !options.pageConfig) return;
        if (!this.curView && options.pageConfig) options.addToHistory = false;
        var oldAnimFlag = this.isAnim, oldAnimName = this.animatName;
        if (this.curView) {
          this.curView.triggerShow = this.curView.triggerHide = options ? (!options.triggerFlag) : true;
          this.curView.triggerHide = options && ('triggerHide' in options) ? (options.triggerHide) : true;
        }
        this.isAnim = (options && options.isAnim) ? true : this.isAnim;
        if (this.isAnim) {
          this.animatName = this.animForwardName;
        }
        var config = _.clone(options.pageConfig ? options.pageConfig : this.curView.config);
        config.model.apis = [];
        config.view = { viewport: '' };
        config.controller = 'cPageView';
        config.viewName = options && options.viewName ? options.viewName : 'OrangeHisCtnrView';
        if (_.indexOf(this.ctnrViewNames, config.viewName) == -1) {
          this.ctnrViewNames.push(config.viewName);
        }
        var url = options.pageConfig ? options.pageConfig.pageUrl : this.curView.config.pageUrl;
        if (!options || options.addToHistory !== false) {
          if (Orange.isHybrid) {
            this.endObserver();
            window.location.hash = url;
          } else {
            history.pushState({url: url, text: ' <SCRIPT type="text/Orange-config">' + JSON.stringify(config) + '<' + '/SCRIPT>', options: {pushState: true}}, document.title, url);
          }
        }
        this.loadView(url, ' <SCRIPT type="text/Orange-config">' + JSON.stringify(config) + '<' + '/SCRIPT>', { pushState: true, hideloading: true });
        if (Orange.isHybrid) {
          setTimeout(_.bind(this.startObserver, this), 1);
        }
        var headData = {};
        MessageCenter.unsubscribe('showHisCtnrView');
        MessageCenter.subscribe('showHisCtnrView', function () {
          var self = this;
          this.OrangeHisCtnrView = this.curView;
          this.curView.onShow = function () {
            if (self.lastView && !_.isEmpty(self.lastView.header.datamodel)) {
              headData = _.clone(self.lastView.header.datamodel);
              if (!_.isObject(headData.events)) headData.events = {};
              headData.events.returnHandler = function () {
                history.back();
              };
            }
            this.header.set(headData);
            onShow && onShow.apply(this, arguments);
            setTimeout(function () {
              self.animatName = self.animBackwardName;
            }, 10);
          };
          this.curView.onHide = function () {
            onHide && onHide.apply(this, arguments);
            setTimeout(function () {
              self.isAnim = oldAnimFlag;
              self.animatName = oldAnimName;
            }, 10)
          };
          this.curView.show();
        }, this)
      },

      /**
       * 隐藏遮盖层
       * @method Orange.hideHisCtnrView
       */
      hideHisCtnrView: function () {
        history.back();
      },

      interface: function () {
        return {
          'viewReady': this.viewReady,
          'showMessage': this.showMessage,
          'hideMessage': this.hideMessage,
          'showConfirm': this.showConfirm,
          'hideConfirm': this.hideConfirm,
          'showWarning404': this.showWarning404,
          'hideWarning404': this.hideWarning404,
          'showToast': this.showToast,
          'hideToast': this.hideToast,
          'showLoading': this.showLoading,
          'hideLoading': this.hideLoading,
          'showHisCtnrView': this.showHisCtnrView,
          'hideHisCtnrView': this.hideHisCtnrView,
          "goTo": this.goTo,
          "goBack": this.goBack,
          "forward": this.goTo,
          "back": this.goBack,
          "go": this.go
        }
      }
    }

    return APP
  })