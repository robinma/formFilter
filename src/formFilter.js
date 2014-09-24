/**
 * a form verfiy tool
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

  var objproto = Object.prototype;
  var tostring = objproto.toString;

  var pubsub = {
    _handlers: '',
    on: function(etype, handler) {
      if (typeof this._handlers !== 'object') {
        this._handlers = [];
      }
      if (!this._handlers[etype]) {
        this._handlers[etype] = []
      }
      if (typeof handler === 'function') {
        this._handlers[etype].push(handler)
      }
      return this;
    },
    emit: function(etype) {
      var args = Array.prototype.slice.call(arguments, 1)
      var handlers = this._handlers[etype] || [];
      for (var i = 0, l = handlers.length; i < l; i++) {
        handlers[i].apply(null, args)
      }
      return this;
    }
  };


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
    this.fieldArr = [];
    this.fieldObj = {};
    this._init(params);

  };

  //extend method
  $.extend(formFilter.prototype, pubsub, {
    //formFilter version Number
    version: '0.0.1',
    //formFilter init
    _init: function(params) {
      if (typeof params === 'object') {
        this._traversal(params);
      }
    },
    //traversal user config and push field object to fieldArr
    _traversal: function(params) {
      var __ = this,
        _paramLen = 0;
      $.each(params, function(k, v) {
        //new a field object
        var field = new Field({
            el: k.replace(/^\s*|\s*$/ig, ''),
            $el: __.get$Obj(k),
            config: v,
            groupField: __.fieldObj,
            parent:__
          })
          //push field Object to field array
        __.fieldObj[k] = field;

        __.fieldArr.push(field);

        _paramLen++;
      })
      //record field length
      __.fieldLength = _paramLen;
    },
    //get form input jquery Obj
    get$Obj: function(seletor) {
      return this.$el.find(seletor);
    },
    check: function(callback) {
      var __ = this,
        returnVal = 0;
      $.each(__.fieldObj, function(key, fobj) {
        if (!fobj.checked) {
          returnVal++;
        }
      });
      return !returnVal;
    },
    serialize: function() {
      var __ = this,
        returnVal = [];
      $.each(__.fieldObj, function(key, fobj) {
        var temp = {};
        temp[fobj.getFieldName()] = fobj.getData();
        returnVal.push(temp)
      });
      return returnVal;
    },
    submit: function(callback) {
      var __ = this,
        inx = 0;
      // final call it
      var finish = function() {
        if(typeof callback === 'function')callback(!__.check(), __.serialize());
      };

      var traverseFields = function(index) {
        var feild = __.fieldArr[index];
        feild.todoRule(true,function() {
          inx++;
          if (inx >= __.fieldLength) {
            finish()
            return;
          }
          traverseFields(inx);
        });
      };
      traverseFields(inx);
    }
  });

  var ruleStr = ['ff_length', 'ff_exp', 'ff_equal', '_require','ff_remote'];
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
    this.parent = params.parent;

    this.callback = this.config.callback || function() {};

    this.ruleStatus = {};

    this.checked = false;
    this._interrupt = false;
    this._init();
  }

  //extend method of Field
  $.extend(Field.prototype, {}, {
    //init field
    _init: function() {
      if(this.config.require){
        this.config[ruleStr[3]] = [/\S+/i,1];
      }
      this.rules = this._extRule();
      this.emitEvn()
      this.todoRule('')
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
        var crule = __.config[val];
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
    getFieldName: function() {
      return this.$el.attr('name');
    },
    //tigger events
    emitEvn: function() {
      var __ = this;
      this.$el.on('blur', function() {
        __.todoRule(true)
      }).on('focus', function() {
        __._focus();
        __.parent.emit('focus',__.$el,__);
      }).on('keyup', function(e) {
        __._keyup()
        __.parent.emit('keyup',__.$el,__);
      })
    },
    _focus: function() {
      if(typeof this.config.focus === 'function'){
        this.config.focus();
      }
    },
    _keyup:function(){
      if(typeof this.config.keyup === 'function'){
        this.config.keyup();
      }
    },
    //traverse rule
    //param {boolean} runcb, to run define callback
    todoRule: function(runcb,callback) {
      var __ = this,
        rules = __.rules,
        len = rules.length,
        inx = 0;

      //递归
      var todorule = function(index) {
        var rule = rules[index];
        if (!rule) {
          callback && callback();
          return;
        }
        //test each rule and go on next
        __.distRule(rule[0], rule[1], function(err, verClass, verObj) {
          //test the rule is end and ok
          var status = __.fieldVerify(err, verClass, verObj,runcb);
          if (++inx >= len) {
            callback && callback();
            return;
          }
          if (status) {
            todorule(inx);
          } else {
            if (inx < len) {
              callback && callback();
            }
          }

        });
      };

      todorule(inx);
    },
    //set gobel feild status
    fieldVerify: function(err, verfiyClass, verfiyObj, runcb) {
      var __ = this;
      var rules = __.rules;
      var finished = 0,
        notFinished = 0;
      //rule Status
      __.ruleStatus[verfiyClass] = err;
      if (err) {
        if(runcb)
        __.callback(true, verfiyObj.tips, __);
        __.checked = false;
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
      if (finished == rules.length || !__._interrupt) {
        if(runcb)
        __.callback(false, verfiyObj.tips, __);
        __.checked = true;
      }

      return true;

    },
    //dispatch verify rule
    distRule: function(k, v, callback) {
      var __ = this,
        valiData;
      //require verfiy
      if(k == ruleStr[3]){
        valiData = new verRepExp(v);
      }
      //字符长度验证
      else if (k == ruleStr[0]) {
        valiData = new lengthVer(v)
      }
      //正则验证
      else if (k == ruleStr[1]) {
        valiData = new verRepExp(v);
      }
      //是否相等
      else if (k == ruleStr[2]) {
        valiData = new verEqual(v, __);
      }
      //远程验证
      else if (k == ruleStr[4]) {
        valiData = new verRemote(v, __);
      }
      __.set_callback(valiData, k, callback);

    },
    //set verfiy plugin callback method
    set_callback: function(valiObj, verfiyClass, callback) {
      var __ = this;
      //set validata object callback method
      //when callback params err is true,
      //then verfiy plugin test result is error
      valiObj.callback = function(err) {
        if (err) {
          __._interrupt = true;
          callback.call(__, true, verfiyClass, valiObj);
        } else {
          __._interrupt = false;
          callback.call(__, false, verfiyClass, valiObj);

        }
      }
      //to do validata with input text
      return valiObj.valiData(__.getData())

    }
  });

  //verfiy string length
  var lengthVer = function(lenstr) {
    var strType = $.type(lenstr);
    var regArr;
    if (strType == 'array') {
      regArr = lenstr;
    } else if (strType == 'string') {
      regArr = lenstr.split(',');
    }
    this.tips = '';
    this.valArr = regArr;
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

    if (!exp.test(itxt)) {
      //exp not ok
      this.callback(true)
      return false;
    }
    //exp is ok
    this.callback(false)
    return true;

  }

  //verify regExp
  var verRepExp = function(regStr) {
    var strType = $.type(regStr);
    var regArr = null;

    if (strType == 'array') {
      regArr = regStr;
    } else if (strType == 'string') {
      regArr = eval('(' + regStr + ')');
    }
    this.tips= '';
   // this.callback = null;
   this.regArr = regArr;
  }
  verRepExp.prototype.valiData = function(itxt) {
    var self = this,testval;
     function testReg(exp,itxt){
      if(!exp.test(itxt)){
        self.callback(true);
        return false;
      }
      self.callback(false);
      return true;
    };

    if(tostring.call(self.regArr[0]) === '[object RegExp]'){
      self.tips = self.regArr[1];
      testval = testReg(self.regArr[0],itxt);
    }else{
      for(var i = 0,l = self.regArr.length;i<l;i++){
        var regexp = self.regArr[i].regexp;
        self.tips = self.regArr[i].label;
        testval = testReg(regexp,itxt);
        if(!testval){
          return testval;
        }
      }
    }
    return testval;


  };

  // verfiy equal field
  var verEqual = function(regStr, field) {
    var strType = $.type(regStr),
      regArr = null;

    if (strType == 'array') {
      regArr = regStr;
    } else if (strType == 'string') {
      regArr = eval('(' + regStr + ')');
    }
    var groups = field.params.groupField;
    this.relFeld = groups[regArr[0]];
    this.tips = regArr[1] ? regArr[1] : '';
    this.callback = null;
  };
  verEqual.prototype.valiData = function(itxt) {
    var inpVal = this.relFeld.getData();
    if (inpVal !== itxt) {
      this.callback(true)
      return false
    }
    this.callback(false)
    return true
  }

  //async verfiy module
  var verRemote = function(remoteparam, field) {
    var strType = $.type(remoteparam),
      regArr = null;

    if (strType == 'array') {
      regArr = remoteparam;
    } else if (strType == 'string') {
      regArr = eval('(' + remoteparam + ')');
    }
    this.remote = regArr[0];
    this.verFn = regArr[1];
    this.tips = regArr[2];
    this.htxType =  regArr[3] || 'get';
    this.pdata = regArr[4] || {};
    this.datatype = regArr[5] || 'json';
    this.filedName = field.$el.attr('name');
    this.callback = null;
  }
  verRemote.prototype.valiData = function(itxt) {
    var __ = this;
    var params = {};
    params[__.filedName] = itxt;
    $.extend(params,this.pdata);
    // $[this.htxType](this.remote, params, function(data) {
    //   if (!__.verFn(data)) {
    //     __.callback(true);
    //   } else {
    //     __.callback(false);
    //   }
    // }, 'json');

    $.ajax({
      type:this.htxType,
      url:this.remote,
      data:params,
      dataType:this.datatype,
      success:function(data){
        if (!__.verFn(data)) {
        __.callback(true);
      } else {
        __.callback(false);
      }
      },
      error:function(xhr,type){
        console && console.log(xhr,type);
      }
    })

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