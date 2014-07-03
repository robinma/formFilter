/**
 * a form verfiy tool
 *
 *
 * Author by robinma
 *
 *formFilter([form jQObj | seletor],fieldConfig)
 *
 *fieldConfig:
 *require:[false|true] imperactive
 */

(function(root, factory) {
  //set up formFilter appropriately for the enviroment.
  if (typeof define === 'function' && (define.cmd || define.amd)) {
    define(function() {
      return factory();
    });
  } else {
    //as a browser global
    root.formFilter = factory();
  }

})(this, function() {

  //formFilter constracter
  var formFilter = function() {
    var arg = arguments;
    var argLen = arg.length;
    var params;
    var el;
    if (argLen >= 2) {
      el = arg[0];
      params = arg[1];
    } else if (argLen == 1) {
      el = 'body';
      params = arg[0];
    }
    this.$el = (typeof el === 'object' ? el : $(el));
    params = params || {};
    //field array
    this.fieldArr = {};

    this._init(params);

  };

  //formFilter version Number
  formFilter.version = '0.0.0';

  //extend method
  $.extend(formFilter.prototype, {}, {
    //formFilter init
    _init: function(params) {
      if (typeof params === 'object') {
        this.traversal(params);
      }
    },
    //traversal user config and push field object to fieldArr
    traversal: function(params) {
      var __ = this;
      $.each(params, function(k, v) {
        var field = new Field({
          el: k,
          $el: __.get$Obj(k),
          config: v
        })
        __.fieldArr[k] = field;
      })
    },
    //get form input jquery Obj
    get$Obj: function(seletor) {
      return this.$el.find(seletor);
    }

  });

  var ruleStr = ['ff-length', 'ff-exp', 'ff-remote'];
  /**
   *  field function prototype
   */
  function Field(params) {
    $.extend({
      require: false, //imperative
      callback: ''

    }, params);
    //cache params
    this.params = params;
    //cache seletor
    this.el = params.el;
    //cache field jqueryObj
    this.$el = params.$el;

    this.callback = params.callback;
    this.checked = false;
    this._init();
  }

  //extend method of Field
  $.extend(Field.prototype, {}, {
    //init field
    _init: function() {
      this.rules = this._extRule();
      this.emitEvn()
      this._todoRule()
    },
    //extraction ruler string
    _extRule: function() {
      var __ = this;
      var rules = [];
      //get dom attr and config of rule
      $.each(ruleStr, function(inx, val) {
        var ruleTemp = {};
        var rule = __.$el.attr(val);
        rule = $.trim(rule);
        //dom rule isn't empty
        if (rule.length > 0) {
          ruleTemp[val] = rule;
        }
        //config rule isn't empty
        var crule = __.params[val];
        if (crule) {
          ruleTemp[val] = crule;
        }
        if ($.isEmptyObject(ruleTemp)) return;
        rules.push(ruleTemp)
      })

      return rules;
    },
    getData: function() {
      return this.$el.val();
    },
    //tigger events
    emitEvn: function() {
      var __=this;
      this.$el.on('blur',function(){
        __._todoRule()
      })
    },
    //traverse rule
    _todoRule: function() {
      var __=this;
      var rules=__.rules;
      var ruleLen=rules.length;
      var data=__.getData();
      $.each(rules,function(inx,rule){
        for(var i in rule){
          __.distRule(i,rule[i])
        }
      });
    },
    distRule:function(k,v,callback){
      console.log(k,v,callback)
    }
  });



  return function() {
    var argLen = arguments.length;
    if (argLen == 0) {
      return new formFilter({})
    } else if (argLen == 1) {
      return new formFilter(arguments[0])
    } else {
      return new formFilter(arguments[0], arguments[1])
    }
  }
});