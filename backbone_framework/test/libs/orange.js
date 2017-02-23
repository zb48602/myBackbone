Orange.VERSION = '1.0.0';//版本
Orange.$ = $;
//出让对Orange命名空间的所有权
Orange.noConflict = function() {
};

//Events事件
var Events = Orange.Events = Backbone.Events;
_.extend(Orange, Events);

/*
*headView头部根据配置文件展示和响应
*@param options 
*@param {"left":{"isOverwrite":isOverwrite,"callback":backFunc},
*@param "center":{"title":title},
*@param "right":{"type": "localImage","value":imgUrl, "callback":"funcStr();"}}
*@param type可以有[text|localImage|remoteImage]三种类型	
*/
var HeaderView = Orange.HeaderView = function(options){
	this.titleOptions = options||{};
};
_.extend(HeaderView.prototype, Events, {

	//设置头部
	setHeader : function(){
		if(this.titleOptions.left){
			if(this.titleOptions.left.isOverwrite){
				App.setKeyEventListener(function(event) {
					if (event == 'backpress') {
					this.titleOptions.left.callback();
				}
			});
				// true返回键绑定，由JavaScript来处理事件；false表示WebView返回上一个页面
				App.overrideBackPressed(true);	
			}else{
				App.overrideBackPressed(false);	
			}
		}
		
		if(this.titleOptions.center){
			App.setTitle(this.titleOptions.center);
		}

		if(this.titleOptions.right){
			App.setTopRightBar({
			"type": this.titleOptions.right.type,
			"value": this.titleOptions.right.value
			});
			if(typeof this.titleOptions.right.callback == "function"){
				document.removeEventListener("topBarClick");
				document.addEventListener("topBarClick", this.titleOptions.right.callback, false);
			}
		}		
	}
});

//Model模型
var Model = Orange.Model = Backbone.Model = function(attributes, options) {
};
_.extend(Model.prototype, Events, {
});
//Collection集合
var Collection = Orange.Collection = Backbone.Collection = function(models, options) {
};
_.extend(Collection.prototype, Events, {
});
//View视图
var View = Orange.View = Backbone.View = function(options) {
};
_.extend(View.prototype, Events, {
});
//sync同步方法
Orange.sync = Backbone.sync = function(method, model, options) {
};
//贴出只是为了佐证Backbone的ajax是使用jQuery的ajax,而不是像Angular.js那样实现自己的$http
Orange.ajax =Backbone.ajax = function() {
  return Backbone.$.ajax.apply(Backbone.$, arguments);
};
//Router路由
var Router = Orange.Router = Backbone.Router = function(options) {
};
_.extend(Router.prototype, Events, {	
});
//History浏览历史(window.history)
var History = Orange.History = Backbone.History = function() {
};
_.extend(History.prototype, Events, {
});
Backbone.history = new History;
//在underscore基础上实现的关键性的继承方法,这个也很关键
var extend = function(protoProps, staticProps) {
});
Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;