
var mainApp = angular.module('mainApp', []).config(function($sceDelegateProvider, $httpProvider, $sceProvider) {
	
	
	$sceDelegateProvider.resourceUrlWhitelist([
	  // Allow same origin resource loads.
	  'self',
	  // Allow loading from our assets domain.  Notice the difference between * and **.
	  'https://github.com/login/oauth',
	  'https://github.com/login/',
	  'https://github.com/' ,
	  'http://github.com/' ,
	  'https://github.com/login/oauth/access_token'
	]);
  
	// The blacklist overrides the whitelist so the open redirect here is blocked.
	$sceDelegateProvider.resourceUrlBlacklist([
	 
	]);
  });

mainApp.controller('ctrl', function ($http, $scope, $timeout, $interval) {
	var me = $scope;
	registerDataFunctions(me, $http, $timeout);
//###########################################
//	ENUM
//###########################################
	me.keyCodes = {Enter:13, ESC:27};
	me.Status = {logOut:0, logIn:1};
//###########################################
//	PROPERTY
//###########################################
	me.searchTxt = window.location.href.indexOf("xerpa.dev.br") >=0 ? 'sindresorhus' : '';		//initial search text
	me.noUserFound = false;	// true if the search return no result <- shows the walking man at the bottom
	me.currentPageIndex = 0;
	me.currentUser = null;
	me.loading = false;		//request running
	me.searchTxtPlaceholder = 'Pesquise pelo nome/apelido do github'
	me.langTypes = null		// resume of repos languages
	me.colors = null;
	me.userStatus = me.Status.logOut;
//###########################################
//	INIT
//###########################################
	me.mainObjs = [];
	me.loadCtrl = function () {
		var code = queryString('code');
		if(code != null){
			var status = queryString('state')
			me.onLoginCallBack(code, status);
		}
		me.colors = me.getColors();
		$timeout(function(){
			skipIntroduction();
		},1000);
		
	};
	
//###########################################
//	EVENTS
//###########################################
	me.onLoginCallBack = function(code, status){
		me.getUserInfoAndLogin(code, status,function(){
			me.backToPastState(status);
		});
		
	};
	me.backToPastState = function(status){
		var pageStatusBefore = me.retrievePageStatus(status);
		if(pageStatusBefore != null){
			me.currentPageIndex = pageStatusBefore.currentPageIndex;
			me.searchTxt = pageStatusBefore.searchTxt;
			if(pageStatusBefore.login != null){
				me.searchTxt = pageStatusBefore.login;
				me.searchUserByName();
			}
		}
	}
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
	me.query(me.searchTxt,me.onFindUser, me.userHasNotBeenFound);
};
me.onFindUser = function(user, status){
	if(user == null){
		me.userHasNotBeenFound();
	}else{
		me.showUserResult(user);
	}
};
me.userHasNotBeenFound = function(){
	me.noUserFound = true;
	me.clean();
};
me.clean = function(){
	me.langTypes = null;
	me.currentUser = null;
	me.loading = false;
};
me.showUserResult = function(user){
	if(me.currentPageIndex == 0){
		$('#searchPage').slideUp('slow', function(){
			me.currentPageIndex = 1;
			if (!me.$$phase)
				me.$apply();
			$('#resultPage').slideDown('slow', function(){
				Materialize.updateTextFields()
			})
		});
	}
	
	me.currentUser = user;
	me.searchTxtPlaceholder = 'Busque por outro nome/apelido...'
	me.currentUser.nick = me.searchTxt;
	console.log(me.currentUser);
	//me.searchTxt='';
	me.countLangType();
}
me.countLangType = function(){
	var list = [];
	
	me.currentUser.starredRepositories.forEach(y => {
		if(isSafeToUse(y,'language'))
			list.push(y.language)
	});
	list = list.countDistinct().orderDescBy('count');
	me.langTypes = list.summaryze('count');
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

	if(me.userStatus == me.Status.logOut){
		me.toastOk('Please logIn before! - <a onclick="toastCallback()"> OK!</a>')
		return;
	}

	if(compareIfSafe(repo, 'starred', true)){
		me.removeStar(repo.id, 
			function(result){
				repo.starred=false;
				me.onStarOk(result);
				me.toastOk('Repo unStarred with success!  <a onclick="toastCallback()"> OK!</a>')
			} , 
			function(result){
				repo.starred=false;
				me.onStarNotOk(result);
				me.toastOk('Oh No!We got some problema.  <a onclick="toastCallback()"> OK!</a>')
			})
	
	}else{
		me.starRepo(repo.id, 
			function(result){
				repo.starred=true;
				me.onStarOk(result);
				me.toastOk('Repo starred with success!  <a onclick="toastCallback()"> OK!</a>')
			} , 
			function(result){
				repo.starred=false;
				me.onStarNotOk(result);
				me.toastOk('Oh No!We got some problema.  <a onclick="toastCallback()"> OK!</a>')
			})
	
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
me.toastOk = function(msg, time){
	time = (time != null ? time : 5);
	Materialize.toast(msg, time*1000, '', function(){}) ;
	window.setTimeout(function(){
		$('.toast').fadeOut();
	}, time * 1000)
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
//               DIRECTIVE ->
//####################################################

mainApp.directive('xerpaSearch', function(){
	return {
		replace:true,
		restrict:'E',
		link: function($scope, $element, attr, parentDirectCtrl){
			$($element).find('input').attr('id', 'inputSearch_' + attr.id)
			$($element).find('label').attr('for', 'inputSearch_' + attr.id)
		},
		template: `
			<div class="input-field w100">
			<div class="search-wrapper card w100">
				<input spellcheck="false" autocorrect="off" autocapitalize="off" autocomplete="off" tabindex="0"  ng-disabled="loading" class="bbn" type="text" ng-focus="inputOnFocus()" ng-keyup="onInputChange($event)" ng-model="searchTxt" >
				<i class="iconInside material-icons" ng-show="loading == false && searchTxt.length==0">search</i>
				<i class="iconInside material-icons" ng-show="loading == false && searchTxt.length>0" title="limpar" ng-click="searchTxt=''">clear</i>
				<i class="iconInside material-icons looping" ng-show="loading==true">sync</i>
				<label  style="left:10px;" ng-bind="searchTxtPlaceholder"></label>
			</div>
		</div>
			`
		 
	};
});

$(document).ready(function() {
	Materialize.updateTextFields();
	$('div[removeStyleOnLoad]').removeAttr('style');
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

function toastCallback(){
	$('.toast').fadeOut();
}