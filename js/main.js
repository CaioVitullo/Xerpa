
var mainApp = angular.module('mainApp', []);

mainApp.controller('ctrl', function ($http, $scope, $timeout, $interval) {
	var me = $scope;
	registerDataFunctions(me, $http, $timeout);
//###########################################
//	ENUM
//###########################################
	me.keyCodes = {Enter:13, ESC:27};
//###########################################
//	PROPERTY
//###########################################
	me.searchTxt = 'sindresorhus';		//initial search text
	me.noUserFound = false;	// true if the search return no result <- shows the walking man at the bottom
	me.currentPageIndex = 0;
	me.currentUser = null;
	me.loading = false;		//request running
	me.searchTxtPlaceholder = 'Pesquise pelo nome/apelido do github'
	me.langTypes = null		// resume of repos languages
	me.colors = null;
//###########################################
//	INIT
//###########################################
	me.mainObjs = [];
	me.loadCtrl = function () {
		var code = queryString('code');
		if(code != null){
			me.getUserInfoAndLogin(code)
		}
		me.colors = me.getColors();
		$timeout(function(){
			skipIntroduction();
		},1000);
		
	};
	
//###########################################
//	EVENTS
//###########################################
	me.onInputChange = function(e){
		if(e.keyCode == me.keyCodes.ESC)
			me.searchTxt = '';
			
		if(e.keyCode == me.keyCodes.Enter)
			me.searchUserByName();
		
	};
	me.inputOnFocus = function(){
		me.noUserFound = false;
	};
//###########################################
//	METHODS
//###########################################
me.searchUserByName = function(){
	if(isNotSafeToUse(me, 'query')){
		console.warn('Error!!! Data interface has not been implemented')
		return false;
	}
	if(me.searchTxt.trim()==""){
		//TODO: ALERT
		return
	}
	if(me.loading ==true)
		return
	me.clean();
	me.query(me.searchTxt,me.onFindUser, me.onUserNotFound);
};
me.onFindUser = function(data, status){
	var result = data.data.data;
	console.log(result);
	if(result.user == null){
		me.userHasNotBeenFound();
	}else{
		me.showUserResult(result);
	}
};
me.userHasNotBeenFound = function(){
	me.noUserFound = true;
	me.clean();
};
me.clean = function(){
	me.langTypes = null;
	me.currentUser = null;
};
me.showUserResult = function(result){
	me.currentPageIndex = 1;
	me.currentUser = result.user;
	me.searchTxtPlaceholder = 'Busque por outro nome/apelido...'
	me.currentUser.nick = me.searchTxt;
	me.searchTxt='';
	me.countLangType();
}
me.countLangType = function(){
	var list = [];
	me.currentUser.starredRepositories.edges.forEach(y => {
		if(isSafeToUse(y,'node.primaryLanguage.name'))
			list.push(y.node.primaryLanguage.name)
	});
	list = list.countDistinct().orderDescBy('count');
	me.langTypes = list.summaryze('count');
};
me.onUserNotFound = function(result, status){
	me.currentUser = null;
};
me.startItem = function(repo){
	if(isNotSafeToUse(me, 'starRepo')){
		console.warn('Error!!! Data interface has not been implemented')
		return false;
	}
	if(isNotSafeToUse(repo, 'id')){
		//TODO: ALERT
		return
	}
	if(me.loading ==true)
		return

	if(compareIfSafe(repo, 'starred', true)){
		me.removeStar(repo.id, 
			function(result){repo.starred=false;me.onStarOk(result);} , 
			function(result){repo.starred=false;me.onStarNotOk(result);})
	
	}else{
		me.starRepo(repo.id, 
			function(result){repo.starred=true;me.onStarOk(result);} , 
			function(result){repo.starred=false;me.onStarNotOk(result);})
	
	}
	
};
me.onStarOk = function(result){
	console.log('ok', result);
};
me.onStarNotOk = function(result){
	console.log('not ok', result);
}
me.beautifyStr = function(str){
	if(typeof(str)=='string')
		return str.replace('https://', '').replace('http://', '')
	return str;
}
me.getCssForLang = function(lang, index){
	
	return me.colors[index % me.colors.length];
}
me.getColors = function(){
	return [
		'deep-purple',
		'deep-purple lighten-1','deep-purple lighten-2','deep-purple lighten-3','deep-purple lighten-4','deep-purple lighten-5',
		'deep-purple darken-1','deep-purple darken-2','deep-purple darken-3','deep-purple darken-4',
		'deep-purple accent-4','deep-purple accent-3','deep-purple accent-2','deep-purple accent-1',
'red lighten-5',
'red lighten-4',
'red lighten-3',
'red lighten-2',
'red lighten-1',
'red',
'red darken-1',
'red darken-2',
'red darken-3',
'red darken-4',
'red accent-1',
'red accent-2',
'red accent-3',
'red accent-4',
'pink lighten-5',
'pink lighten-4',
'pink lighten-3',
'pink lighten-2',
'pink lighten-1',
'pink',
'pink darken-1',
'pink darken-2',
'pink darken-3',
'pink darken-4',
'pink accent-1',
'pink accent-2',
'pink accent-3',
'pink accent-4',
'purple lighten-5',
'purple lighten-4',
'purple lighten-3',
'purple lighten-2',
'purple lighten-1',
'purple',
'purple darken-1',
'purple darken-2',
'purple darken-3',
'purple darken-4',
'purple accent-1',
'purple accent-2',
'purple accent-3',
'purple accent-4',
'indigo lighten-5',
'indigo lighten-4',
'indigo lighten-3',
'indigo lighten-2',
'indigo lighten-1',
'indigo',
'indigo darken-1',
'indigo darken-2',
'indigo darken-3',
'indigo darken-4',
'indigo accent-1',
'indigo accent-2',
'indigo accent-3',
'indigo accent-4',
'blue lighten-5',
'blue lighten-4',
'blue lighten-3',
'blue lighten-2',
'blue lighten-1',
'blue',
'blue darken-1',
'blue darken-2',
'blue darken-3',
'blue darken-4',
'blue accent-1',
'blue accent-2',
'blue accent-3',
'blue accent-4',
'light-blue lighten-5',
'light-blue lighten-4',
'light-blue lighten-3',
'light-blue lighten-2',
'light-blue lighten-1',
'light-blue',
'light-blue darken-1',
'light-blue darken-2',
'light-blue darken-3',
'light-blue darken-4',
'light-blue accent-1',
'light-blue accent-2',
'light-blue accent-3',
'light-blue accent-4',
'cyan lighten-5',
'cyan lighten-4',
'cyan lighten-3',
'cyan lighten-2',
'cyan lighten-1',
'cyan',
'cyan darken-1',
'cyan darken-2',
'cyan darken-3',
'cyan darken-4',
'cyan accent-1',
'cyan accent-2',
'cyan accent-3',
'cyan accent-4',
'teal lighten-5',
'teal lighten-4',
'teal lighten-3',
'teal lighten-2',
'teal lighten-1',
'teal',
'teal darken-1',
'teal darken-2',
'teal darken-3',
'teal darken-4',
'teal accent-1',
'teal accent-2',
'teal accent-3',
'teal accent-4',
'green lighten-5',
'green lighten-4',
'green lighten-3',
'green lighten-2',
'green lighten-1',
'green',
'green darken-1',
'green darken-2',
'green darken-3',
'green darken-4',
'green accent-1',
'green accent-2',
'green accent-3',
'green accent-4',
'light-green lighten-5',
'light-green lighten-4',
'light-green lighten-3',
'light-green lighten-2',
'light-green lighten-1',
'light-green',
'light-green darken-1',
'light-green darken-2',
'light-green darken-3',
'light-green darken-4',
'light-green accent-1',
'light-green accent-2',
'light-green accent-3',
'light-green accent-4',
'lime lighten-5',
'lime lighten-4',
'lime lighten-3',
'lime lighten-2',
'lime lighten-1',
'lime',
'lime darken-1',
'lime darken-2',
'lime darken-3',
'lime darken-4',
'lime accent-1',
'lime accent-2',
'lime accent-3',
'lime accent-4',
'yellow lighten-5',
'yellow lighten-4',
'yellow lighten-3',
'yellow lighten-2',
'yellow lighten-1',
'yellow',
'yellow darken-1',
'yellow darken-2',
'yellow darken-3',
'yellow darken-4',
'yellow accent-1',
'yellow accent-2',
'yellow accent-3',
'yellow accent-4',
'amber lighten-5',
'amber lighten-4',
'amber lighten-3',
'amber lighten-2',
'amber lighten-1',
'amber',
'amber darken-1',
'amber darken-2',
'amber darken-3',
'amber darken-4',
'amber accent-1',
'amber accent-2',
'amber accent-3',
'amber accent-4',
'orange lighten-5',
'orange lighten-4',
'orange lighten-3',
'orange lighten-2',
'orange lighten-1',
'orange',
'orange darken-1',
'orange darken-2',
'orange darken-3',
'orange darken-4',
'orange accent-1',
'orange accent-2',
'orange accent-3',
'orange accent-4',
'deep-orange lighten-5',
'deep-orange lighten-4',
'deep-orange lighten-3',
'deep-orange lighten-2',
'deep-orange lighten-1',
'deep-orange',
'deep-orange darken-1',
'deep-orange darken-2',
'deep-orange darken-3',
'deep-orange darken-4',
'deep-orange accent-1',
'deep-orange accent-2',
'deep-orange accent-3',
'deep-orange accent-4',
'brown lighten-5',
'brown lighten-4',
'brown lighten-3',
'brown lighten-2',
'brown lighten-1',
'brown',
'brown darken-1',
'brown darken-2',
'brown darken-3',
'brown darken-4',
'grey lighten-5',
'grey lighten-4',
'grey lighten-3',
'grey lighten-2',
'grey lighten-1',
'grey',
'grey darken-1',
'grey darken-2',
'grey darken-3',
'grey darken-4',
'blue-grey lighten-5',
'blue-grey lighten-4',
'blue-grey lighten-3',
'blue-grey lighten-2',
'blue-grey lighten-1',
'blue-grey',
'blue-grey darken-1',
'blue-grey darken-2',
'blue-grey darken-3',
'blue-grey darken-4'
	];
	
};
});

//####################################################
//               DATA ->
//####################################################
function registerDataFunctions(me, http, timeout){
	me._url = "https://api.github.com/graphql";
	
	me.getUserInfoAndLogin = function(code){
		var ajaxConfig = { 
			url:'https://github.com/login/oauth/access_token',//?client_id=e770f3e7797381a5a74f&client_secret=b6803588acb1064c5b253df05a268914ff711424&code='+code+'&state=bdsdsew33434fdd&redirect_uri=https://caiovitullo.github.io/Xerpa/index.html',
			cache: false 
		};
		ajaxConfig.method = 'POST';
		ajaxConfig.cache = false;
		 ajaxConfig.data = {
		 	client_id:'e770f3e7797381a5a74f',
		 	client_secret:'b6803588acb1064c5b253df05a268914ff711424',
		 	code:code,
		 	state:'bdsdsew33434fdd',
		 	redirect_uri:'https://caiovitullo.github.io/Xerpa/index.html'
		 };
		ajaxConfig.headers= {
			"Content-Type": "application/json"
		};
		http(ajaxConfig).then(function (result, status) {
			console.log(result)
		}, function(result,status){
			console.log(result)
		})
	};
	me.aut = function(){
		window.location.href = 'https://github.com/login/oauth/authorize?client_id=e770f3e7797381a5a74f&redirect_uri=https://caiovitullo.github.io/Xerpa/index.html&state=bdsdsew33434fdd';
	}
	me.getAjax = function(){
		var ajaxConfig = { url:me._url , cache: false };
		ajaxConfig.method = 'POST';
		ajaxConfig.cache = false;
		ajaxConfig.headers= {
			"Content-Type": "application/json",
			"Authorization": "bearer 3a262c0ca7c7204e4ce83b80cdc25d4bdbb0450f" 
		};
		return ajaxConfig;
	}
	me.query = function(name, onSuccess, onError){
		var data = {
		query: `query { 
			user(login:"` + name + `"){
				avatarUrl
				bio
				name
				id
				company
				email
				followers(last: 100) {
				totalCount
				}
				repositories(last:100){totalCount}
				location
				websiteUrl
				starredRepositories(last:100){
				edges{
					node{
					description
					id
					name
					descriptionHTML
					stargazers(last:100){totalCount}
					forkCount
					isPrivate
					isLocked
					isFork
					primaryLanguage{name}
					nameWithOwner
					
					}
				}
				}
			}
			}`
		};
		me.request(data, onSuccess, onError);
	}
	
	me.removeStar = function(idRepo, onSuccess, onError){
		var data = {
			query:`
			mutation {
				removeStar(input: {
				  clientMutationId: "MDQ6VXNlcjE3MDI3MA==", starrableId: "` + idRepo + `"}) {
				  clientMutationId
				}
			  }
			`
		};
		me.request(data, onSuccess, onError);
	};
	me.starRepo = function(idRepo, onSuccess, onError){
		var data = {
			query:`
			mutation {
				addStar(input: {
				  clientMutationId: "MDQ6VXNlcjE3MDI3MA==", starrableId: "` + idRepo + `"}) {
				  clientMutationId
				}
			  }
			  
			`
		};
		me.request(data, onSuccess, onError);
	};
	me.request = function(data, onSuccess, onError){
		me.loading = true;
		var ajaxConfig = me.getAjax()
		ajaxConfig.data = JSON.stringify(data);
		http(ajaxConfig).then(function (result, status) {
			me.loading = false;
			if(typeof(onSuccess) == 'function')
				onSuccess(result, status);
		}, function(result,status){
			me.loading = false;
			if(typeof(onError) == 'function')
				onError(result, status);
		})
	}
}

//####################################################
//               DIRECTIVE ->
//####################################################

mainApp.directive('xerpaSearch', function(){
	return {
		replace:true,
		restrict:'E',
		template:`
		<div class="input-field w100">
		<div class="search-wrapper card w100">
			<input tabindex="0" ng-disabled="loading" class="bbn" type="text" ng-focus="inputOnFocus()" ng-keyup="onInputChange($event)" ng-model="searchTxt" >
			<i class="iconInside material-icons" ng-show="loading == false && searchTxt.length==0">search</i>
			<i class="iconInside material-icons" ng-show="loading == false && searchTxt.length>0" title="limpar" ng-click="searchTxt=''">clear</i>
			<i class="iconInside material-icons looping" ng-show="loading==true">sync</i>
			<label for="icon_prefix" ng-click="setInputFocus()" style="left:10px;" ng-bind="searchTxtPlaceholder"></label>
		</div>
	</div>
		`
	};
});

function removeRotateGif() {
	$('.rotate').remove();
}

function removeCover(el) {
	$(el).find('.overCanvas').css('display', 'none');
}
function setCover(el) {
	$(el).find('.overCanvas').css('display', 'block');
}

function closeChartDialog(it) {
	$(it).parent().modal('close');
};

//####################################################
//               Common Function ->
//####################################################
function isSafeToUse(obj, prop) {
    try {
        if (obj == undefined || obj == null || prop == null || prop == '')
            return false;

        if (prop.indexOf('.') >= 0) {
            var s = prop.split('.');
            var k = obj;
            for (var i = 0; i < s.length; i++) {
                if (typeof (k[s[i]]) != 'undefined' && k[s[i]] != null) {
                    k = k[s[i]];
                } else {
                    return false;
                }
            }
            return true;
        } else {
            return typeof (obj[prop]) != 'undefined' && obj[prop] != null;
        }
    } catch (e) {
        return false;
    }

}
function queryString (name) {
	var url = window.location.href;
	if (url.indexOf('?') >= 0) {
		var parte = url.split('?')[1].split('#')[0];
		if (parte.indexOf('&') >= 0) {
			var retorno = '';
			$(parte.split('&')).each(function (index, item) {
				var chaveValor = item.split('=');
				if (chaveValor[0] == name) {
					retorno = chaveValor[1];
					return false;
				}
			});
			return retorno;
		} else {
			if (parte.indexOf('=') >= 0 && parte.split('=')[0] == name) {
				var str = parte.split('=')[1];
				return str.split('#')[0];
			}
		}
	}
}
function getPropertyByName(obj, prop, runFunction) {
    try {
        if (prop == '' || prop == null || prop == undefined) {
            if (obj != undefined && obj != null) {
                return obj;
            } else {
                return null;
            }
        }
        if (isSafeToUse(obj, prop)) {
            if (prop.indexOf('.') >= 0) {
                var s = prop.split('.');
                var k = obj;
                for (var i = 0; i < s.length; i++) {
                    if (k.hasOwnProperty(s[i])) {
                        k = k[s[i]];
                    } else {
                        return null;
                    }
                }
                return k;
            } else {
                if (typeof (obj[prop]) == 'function' && (runFunction == null || runFunction == true)) {
                    return obj[prop]();
                } else {
                    return obj[prop];
                }
            }
        }
        return null;
    } catch (e) {
        return null;
    }
};
Array.prototype.summaryze = function(countProperty){
	var _sum = this.select(countProperty).sum();
	for(var i=0;i<this.length;i++){
		this[i].percentage = (100 * this[i][countProperty]/_sum).toFixed(1);
	}
	return this;
}
Array.prototype.countDistinct = function(){
	var obj = {};
	this.forEach(y => { 
		if(obj.hasOwnProperty(y)){
			obj[y]+=1;
		}else{
			obj[y]=1;
		}
	});
	return objToArray(obj);
};
function objToArray(obj) {
    if (obj == null || Object.keys(obj).length == 0)
        return

    var a = [];
    obj.every(function (item, label) {
        if (typeof (item) == 'object' || typeof (item) == 'number' || typeof (item) == 'string') {
            a.push({label:label, count:item});
        } else if (typeof (item) == 'function') {
            a.push(item());
        }
    });

    return a;
}
if (Object.getOwnPropertyDescriptor(Object.prototype, 'every') == undefined) {
    Object.defineProperty(Object.prototype, "every", {
        enumerable: false,
        value: function (fn) {
            if (this == null || typeof (fn) != 'function')
                return;
            var keys = Object.keys(this);
            for (var i = 0; i < keys.length; i++) {
                fn(this[keys[i]], keys[i])
            }
        }
    });
}
Array.prototype.select = function (obj) {
    if (obj == undefined || obj == null || obj.length == 0)
        return [];

    var a = [];
    for (var i = 0; i < this.length; i++) {
        var item = this[i];
        var n = {};
        if (Array.isArray(obj)) {
            for (var j = 0; j < obj.length; j++) {
                if (item.hasOwnProperty(obj[j]))
                    n[obj[j]] = item[obj[j]];
            }
            a.push(n);
        } else if (typeof (obj) == 'string') {
            if (item.hasOwnProperty(obj)) {
                a.push(item[obj]);
            }

        } else {
            for (k in obj) {
                if (typeof (obj[k]) == 'function') {
                    n[k] = obj[k](item);
                } else if (typeof (obj[k]) == 'number') {
                    n[k] = obj[k];
                }
                else {
                    n[k] = item[obj[k]];
                }
            }
            a.push(n);
        }
    }

    return a;
};
Array.prototype.sum = function (prop) {
    if (this == null || this.length == 0)
        return 0;

    var s = 0;
    if (prop == null) {
        for (var i = 0; i < this.length; i++) {
            s += parseFloat(this[i]);
        }
    } else {
        for (var i = 0; i < this.length; i++) {
            if (this[i][prop] != null) {
                if (typeof (this[i][prop]) == 'function') {
                    s += parseFloat(this[i][prop]()||0);
                }else if (isNaN(this[i][prop]) == false) {
                    s += parseFloat(this[i][prop]);
                }
                    
            }
              
        }
    }

    return s;
};
Array.prototype.orderBy = function (prop) {
    if (this == null || this.length == 0)
        return this;

    if (prop == null)
        return this.sort(function (a, b) { return a - b });

    if (isNaN(this[0][prop])) {
        return this.sort(function (a, b) {
            return a[prop].localeCompare(b[prop]);
        });
    } else {
        return this.sort(function (a, b) {
            return a[prop] - b[prop];
        });
    }


};
Array.prototype.orderDescBy = function (prop) {
    if (this == null || this.length == 0)
        return this;

    if (prop == null)
        return this;


    if (isNaN(this[0][prop])) {
        return this.sort(function (a, b) {
            return b[prop].localeCompare(a[prop]);
        });
    } else {
        return this.sort(function (a, b) {
            return b[prop] - a[prop];
        });
    }

};
Array.prototype.sum= function(){
	var s = 0;
	this.forEach(y => s += y);
	return s;
}
function isNotSafeToUse(obj, prop) {
    return isSafeToUse(obj, prop) == false;
}
function compareIfSafe(obj, prop, value) {
    try {
        if (typeof (obj) == 'undefined')
            return false;

        var item = getPropertyByName(obj, prop);
        return item != null ? item == value : false;
    } catch (e) {
        return false;
    }

}

