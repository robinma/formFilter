/**
 * a form verfiy tool
 *
 *
 * Author by robinma
 */

(function(root, factory) {
  //set up formFilter appropriately for the enviroment.
  if (typeof define === 'function' && (define.cmd || define.amd)) {
    return factory();
  } else {
    //as a browser global
    root.formFilter = factory();
  }

})(this, function() {


  //formFilter constracter
  var formFilter = function() {
    
  };

  //formFilter version Number
  formFilter.version = '0.0.0';

  //extend method
  $.extend(formFilter, {}, {
    _init: function() {

    },


  });
  /**
   *  field function prototype
   */

  function Field(params) {
    $.extend({

    },params);

    this.el = param.el;

    this.on_suc = params.suc;
    this.on_error = params.err;
    this.checked = false;
  }

  //extend method of Field
  $.extend(Field.prototype, {}, {

    _init: function() {

    }
  });


  //长度验证的验证器类

  var lengthVer=function(){
    
  }

return function(params){
  return new formFilter(params)
}
});