!function(a,b){"function"==typeof define&&(define.cmd||define.amd)?define(function(){return b()}):a.formFilter=b()}(this,function(){function Field(a){$.extend({require:!1},a),this.params=a,this.config=a.config,this.el=a.el,this.$el=a.$el,this.parent=a.parent,this.callback=this.config.callback||function(){},this.ruleStatus={},this.checked=!1,this._interrupt=!1,this._init()}var pubsub={_handlers:"",on:function(a,b){return"object"!=typeof this._handlers&&(this._handlers=[]),this._handlers[a]||(this._handlers[a]=[]),"function"==typeof b&&this._handlers[a].push(b),this},emit:function(a){for(var b=Array.prototype.slice.call(arguments,1),c=this._handlers[a]||[],d=0,e=c.length;e>d;d++)c[d].apply(null,b);return this}},formFilter=function(){var a,b,c=arguments,d=c.length;d>=2?(b=c[0],a=c[1]):1==d&&(b="body",a=c[0]),this.$el="object"==typeof b?b:$(b),a=a||{},this.fieldArr=[],this.fieldObj={},this._init(a)};$.extend(formFilter.prototype,pubsub,{version:"0.0.1",_init:function(a){"object"==typeof a&&this._traversal(a)},_traversal:function(a){var b=this,c=0;$.each(a,function(a,d){var e=new Field({el:a.replace(/^\s*|\s*$/gi,""),$el:b.get$Obj(a),config:d,groupField:b.fieldObj,parent:b});b.fieldObj[a]=e,b.fieldArr.push(e),c++}),b.fieldLength=c},get$Obj:function(a){return this.$el.find(a)},check:function(){var a=this,b=0;return $.each(a.fieldObj,function(a,c){c.checked||b++}),!b},serialize:function(){var a=this,b=[];return $.each(a.fieldObj,function(a,c){var d={};d[c.getFieldName()]=c.getData(),b.push(d)}),b},submit:function(a){var b=this,c=0,d=function(){"function"==typeof a&&a(!b.check(),b.serialize())},e=function(a){var f=b.fieldArr[a];f.todoRule(!0,function(){return c++,c>=b.fieldLength?void d():void e(c)})};e(c)}});var ruleStr=["ff_length","ff_exp","ff_equal","_require","ff_remote"];$.extend(Field.prototype,{},{_init:function(){this.config.require&&(this.config[ruleStr[3]]=[/\S+/i,1]),this.rules=this._extRule(),this.emitEvn(),this.todoRule("")},_extRule:function(){var a=this,b=[];return $.each(ruleStr,function(c,d){var e={},f=a.$el.attr(d);f=$.trim(f),f.length>0&&(e[d]=f);var g=a.config[d];if(g&&(e[d]=g),!$.isEmptyObject(e))for(var h in e)b.push([h,e[h]])}),b},getData:function(){return this.$el.val().replace(/$\s*|\s*$/gi,"")},getFieldName:function(){return this.$el.attr("name")},emitEvn:function(){var a=this;this.$el.on("blur",function(){a.todoRule(!0)}).on("focus",function(){a._focus(),a.parent.emit("focus",a.$el,a)}).on("keyup",function(){a._keyup(),a.parent.emit("keyup",a.$el,a)})},_focus:function(){"function"==typeof this.config.focus&&this.config.focus()},_keyup:function(){"function"==typeof this.config.keyup&&this.config.keyup()},todoRule:function(a,b){var c=this,d=c.rules,e=d.length,f=0,g=function(h){var i=d[h];return i?void c.distRule(i[0],i[1],function(d,h,i){var j=c.fieldVerify(d,h,i,a);return++f>=e?void(b&&b()):void(j?g(f):e>f&&b&&b())}):void(b&&b())};g(f)},fieldVerify:function(a,b,c,d){var e=this,f=e.rules,g=0,h=0;if(e.ruleStatus[b]=a,a)return d&&e.callback(!0,c.tips,e),e.checked=!1,!1;for(var i=0,j=f.length;j>i;i++){var k=e.ruleStatus[f[i][0]];"boolean"!=typeof k||k!==!1?h+=1:g+=1}return g!=f.length&&e._interrupt||(d&&e.callback(!1,c.tips,e),e.checked=!0),!0},distRule:function(a,b,c){var d,e=this;a==ruleStr[3]?d=new verRepExp(b):a==ruleStr[0]?d=new lengthVer(b):a==ruleStr[1]?d=new verRepExp(b):a==ruleStr[2]?d=new verEqual(b,e):a==ruleStr[4]&&(d=new verRemote(b,e)),e.set_callback(d,a,c)},set_callback:function(a,b,c){var d=this;return a.callback=function(e){e?(d._interrupt=!0,c.call(d,!0,b,a)):(d._interrupt=!1,c.call(d,!1,b,a))},a.valiData(d.getData())}});var lengthVer=function(a){var b,c=$.type(a);"array"==c?b=a:"string"==c&&(b=a.split(",")),this.tips="",this.valArr=b,this.callback=null};lengthVer.prototype.valiData=function(a){var b=this.valArr;b.length>=2?this.tips=b[2]?b[2]:"":1==b.length&&(b[1]=b[0]);var c=new RegExp("^.{"+b[0]+","+b[1]+"}$");return c.test(a)?(this.callback(!1),!0):(this.callback(!0),!1)};var verRepExp=function(regStr){var strType=$.type(regStr),regArr=null;"array"==strType?regArr=regStr:"string"==strType&&(regArr=eval("("+regStr+")")),this.tips=regArr[1],this.callback=null,this.regstr=regArr[0]};verRepExp.prototype.valiData=function(a){var b=this.regstr;return b.test(a)?(this.callback(!1),!0):(this.callback(!0),!1)};var verEqual=function(regStr,field){var strType=$.type(regStr),regArr=null;"array"==strType?regArr=regStr:"string"==strType&&(regArr=eval("("+regStr+")"));var groups=field.params.groupField;this.relFeld=groups[regArr[0]],this.tips=regArr[1]?regArr[1]:"",this.callback=null};verEqual.prototype.valiData=function(a){var b=this.relFeld.getData();return b!==a?(this.callback(!0),!1):(this.callback(!1),!0)};var verRemote=function(remoteparam,field){var strType=$.type(remoteparam),regArr=null;"array"==strType?regArr=remoteparam:"string"==strType&&(regArr=eval("("+remoteparam+")")),this.remote=regArr[0],this.verFn=regArr[1],this.tips=regArr[2],this.htxType=regArr[3]||"get",this.pdata=regArr[4]||{},this.datatype=regArr[5]||"json",this.filedName=field.$el.attr("name"),this.callback=null};return verRemote.prototype.valiData=function(a){var b=this,c={};c[b.filedName]=a,$.extend(c,this.pdata),$.ajax({type:this.htxType,url:this.remote,data:c,dataType:this.datatype,success:function(a){b.callback(b.verFn(a)?!1:!0)},error:function(a,b){console&&console.log(a,b)}})},function(){var a=arguments.length;return 0==a?new formFilter({}):1==a?new formFilter(arguments[0]):new formFilter(arguments[0],arguments[1])}});