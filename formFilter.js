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
  var formFilter=function(){

  };

  //formFilter version Number
  formFilter.version='0.0.0';



});