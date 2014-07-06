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

  //extend method
  $.extend(formFilter.prototype, {}, {
    //formFilter version Number
    version: '0.0.0',
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
          el: k.replace(/^\s*|\s*$/ig, ''),
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

    }, params);
    //cache params
    this.params = params;
    this.config = params.config;
    //cache seletor
    this.el = params.el;
    //cache field jqueryObj
    this.$el = params.$el;

    this.callback = this.config.callback;

    this.ruleStatus = {};

    this.checked = false;
    this._init();
  }

  //extend method of Field
  $.extend(Field.prototype, {}, {
    //init field
    _init: function() {
      this.rules = this._extRule();
      this.emitEvn()
      // this._todoRule()
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
        for (var i in ruleTemp) {
          rules.push([i, ruleTemp[i]])
        }
      })

      return rules;
    },
    getData: function() {
      return this.$el.val().replace(/$\s*|\s*$/gi, '');
    },
    //tigger events
    emitEvn: function() {
      var __ = this;
      this.$el.on('blur', function() {
        __._todoRule()
      })
    },
    //traverse rule
    _todoRule: function() {
      var __ = this;
      var rules = __.rules;
      for (var i = 0, l = rules.length; i < l; i++) {
        var rule = rules[i];
        var resule = __.distRule(rule[0], rule[1], __.fieldVerify)
        if (!resule) break;
      }

    },
    //set gobel feild status
    fieldVerify: function(err, verfiyClass, verfiyObj) {
      var __ = this;
      var rules = __.rules;
      var finished = 0,
        notFinished = 0;
      //rule Status
      console.log(__, __.ruleStatus,err)
      __.ruleStatus[verfiyClass] = err;

      if (err) {
        __.callback(true, verfiyObj.tips, __);
        return false;
      }
      //check finish info
      for (var i = 0, l = rules.length; i < l; i++) {
        var cstatus = __.ruleStatus[rules[i][0]];
        if (!(typeof cstatus === 'boolean' && cstatus === false)) {
          notFinished += 1;
        } else {
          finished += 1;
        }
      }
      //verfiy finished,to do it
      if (finished == rules.length) {
        __.callback(false, verfiyObj.tips, __);
      }

    },
    //dispatch verify rule
    distRule: function(k, v, callback) {
      var __ = this,
        valiData;
      //字符长度验证
      if (k == 'ff-length') {
        valiData = new lengthVer(v)

        return __.set_callback(valiData, k, callback);
      }


    },
    //set verfiy plugin callback method
    set_callback: function(valiObj, verfiyClass, callback) {
      var __ = this;
      //set validata object callback method
      valiObj.callback = function(err) {
        if (err) {
          __.checked = false;
          callback.call(__, true, verfiyClass,valiObj);
        } else {
          __.checked = true;
          callback.call(__, false, verfiyClass,valiObj);

        }
      }
      //to do validata with input text
      return valiObj.valiData(__.getData())

    }
  });

  //verfiy string length
  var lengthVer = function(lenstr) {
    this.valArr = lenstr.split(',');
    this.tips = '';
    this.callback = null;

  }
  lengthVer.prototype.valiData = function(itxt) {
    var valArr = this.valArr;
    if (valArr.length >= 2) {
      this.tips = valArr[2] ? valArr[2] : '';
    } else if (valArr.length == 1) {
      valArr[1] = valArr[0];
    }
    var exp = new RegExp('^\.{' + valArr[0] + ',' + valArr[1] + '}$');
    console.log(exp)
    if (!exp.test(itxt)) {
      //exp not ok
      this.callback(true)
      return false;
    }
    //exp is ok
    this.callback(false)
    return true;

  }

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