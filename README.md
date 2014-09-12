# formFilter #
----
## 一，简介 ##

此插件主要为了解决form表单不同类类的验证而编写，目前该库依赖jquery库。实现了对字符长度的限制，正则验证

### 1.1主要功能
-   表单字符长度验证 （`ff_length : "1,2,errString"`）
-   表单正则验证 （`ff_exp : [ReqExp,'errString']`）
-   相同验证，主要针对密码确认 (`ff_equal :['input[name="password"]','errString']`)
-   远程数据验证 （`ff_remote : ['remote uri','verfiy function,return true or false','errStrging']`）

### 1.2问题反馈

在使用过程中如有任何问题，欢迎反馈给我

- email:`ahmzj@163.com`
- QQ:`316933268`


## 二、 How to use ##

### 2.1 init to do ###
    //params
    formFilter([form jQObj | seletor],fieldConfig)

#### demo ####

    var formfilter = FormFilter('ul[node-type="form"]',{
    	'ff-exp':[/^(?!\d+$)(?![a-zA-Z]+$)[a-zA-Z0-9]{6,}$/i,'输入密码不正确'],
		require:true,
		callback:setStatu	
    })

### 2.2 field config list ###

- Boolen **{require}**  ---is or not imperactive 是否为必填项
- String|Array **{ff_length}** 常规字符串限制
- Array **{ff_exp}** 正则表达式验证
- Array **{ff_equal}** 验证与另一文本框相同，主要用于密码确认框
- Array **{ff_remote}** 远程验证，比如验证码
- Function **{callback}** 文本框回调执行方法
- Function **{focus}** when input focus to do it
- Function **{keyup}** when keyup on input to do it

###demo####
	var setStatus=function(err,txt,field){
		console.log(arguments)
		var tip=field.$el.parent('li').find('.tip');
		if(err){
			tip.text(txt);
		}else{
			tip.text('');
		}
	}
	var ffilter=formFilter('ul[node-type="form"]',{
		'input[name="name"]':{
			require:true,
			callback:setStatus,
			focus
		},
		'input[name="password"]':{
			'ff_exp':[/^(?!\d+$)(?![a-zA-Z]+$)[a-zA-Z0-9]{6,}$/i,'输入密码不正确'],
			//require:true,
			callback:setStatus
		},
		'input[name="repassword"]':{
			'ff_exp':[/^(?!\d+$)(?![a-zA-Z]+$)[a-zA-Z0-9]{6,}$/i,'输入密码不正确'],
			'ff_equal':['input[name="password"]','输入的内容不一致'],
			require:true,
			callback:setStatus
		},
		'input[name="phone"]':{
			require:true,
			'ff_exp':[/1{1}\d{2}\d{8}/i,'输入数据错误'],
			'ff_remote':'',
			callback:setStatus		
		},
		'input[name="vcode"]':{
			'ff_exp':[/^[a-zA-Z0-9]{4}$/i,'输入的验证码不正确'],
			'ff_remote':['/formFilter/demo/demo.php',function(data){
				data=eval('('+data+')');
				if(data.code == 1){
					return true;
				}else{
					return false;
				}
			},'验证码错误'],
			callback:setStatus
		}
	});


### 2.3 formFilter return Object method ###
---
**check this form whether qualified**

    formfilter.check();//return true|false

**serialize form Array of key value**

    formfilter.serialize();//return Array demo:[{name:'jim'},{email:'jim@gmail.com'},...]

**form submit method**

    formfilter.submit(function(err,serialize value){
		if(err){
			//can not submit
		}else{
			//can submit
		}	
	});


----------
project **[demo](http://htmlpreview.github.io/?https://github.com/robinma/formFilter/blob/master/demo/demo.html)**
