define([Orange.isHybrid?'cHybridApp':'cWebApp', 'cBusinessCommon'], function(Orange, readyFunc){
  var oHtml = $.fn.html;
  $.fn.html = function(html){
    if(html === undefined ){
      return (this.length > 0 ? this[0].innerHTML : null);
    } else {
      return  oHtml.call(this,html)
    }
  };
  
  function createOrangeins()
  {
    if (Orange.pdConfig)
    {
      require(Orange.pdConfig, function(){
        _createOrangeIns();                     
      }); 
    }
    else
    {
      _createOrangeIns();    
    }
  }
  
  function _createOrangeIns()
  {
    Orange.instance = new Orange({});
    for (var n in Orange.instance.interface()) {
      Orange[n] = $.proxy(Orange.instance.interface()[n], Orange.instance);
    }
    readyFunc();
  }
  
  return createOrangeins; 
})