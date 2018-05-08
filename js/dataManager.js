//####################################################
//               DATA ->
//####################################################

function registerDataFunctions(me, http, timeout){
	me._url = "https://api.github.com/graphql";
	me.anonymousAccessToken = null;
	me.getTokenForAnnonymous = function(){
		OAuth.popup('github').then(github => {
			console.log('github:', github);
			me.anonymousAccessToken =github.access_token;
			github.get('/user').then(data => {
			  console.log('self data:', data);
			  me.onUserLogIn(data);
			})
		});
	};
	me.getUserInfoAndLogin = function(code, status, after){
		
		var url = 'https://github.com/login/oauth/access_token?client_id=e770f3e7797381a5a74f&client_secret=b6803588acb1064c5b253df05a268914ff711424&code='+code+'&state=bdsdsew33434fdd&redirect_uri=https://caiovitullo.github.io/Xerpa/index.html'
		
		var ajaxConfig = { 
			url:url,
			headers:{
                "Content-Type": "application/json",
				"Authorization": "bearer 2e40c1132257a3d7ef30e3986120516820b1b2dc " 
			}
		};
		http(ajaxConfig).then(function (result, status) {
			console.log('é tetra!!!!',result);
			if(typeof(after) == 'function')
				after();
		}, function(result,status){
			me.toastOk('Oh No! we had a problem during the login process :(')
			console.log('error', result)
		})
	};
	me.getPageStatus = function(){
		return JSON.stringify(
			{
				'currentPageIndex':me.currentPageIndex,
				'searchTxt':me.searchTxt,
				'login':me.currentUser != null ? me.currentUser.login : null
			}
		);
	}
	me.retrievePageStatus = function(st){
		try{
			var obj = JSON.parse(decodeURIComponent(st));
			return obj
		}catch(e){
			return null;
		}
		
	};
	me.aut = function(){
		var st = me.getPageStatus();
		window.location.href = 'https://github.com/login/oauth/authorize?client_id=e770f3e7797381a5a74f&redirect_uri=https://caiovitullo.github.io/Xerpa/index.html&state=' + me.getPageStatus()
	}
	me.getAjax = function(){
		var ajaxConfig = { url:me._url , cache: false };
		ajaxConfig.method = 'POST';
		ajaxConfig.cache = false;
		ajaxConfig.headers= {
			"Content-Type": "application/json",
			"Authorization": "bearer "  + me.anonymousAccessToken
		};
		return ajaxConfig;
	}
	me.queryOauth = function(name, onSuccess, onError){
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
	me.getCredencial = function(){
		return {
			client_id:'e770f3e7797381a5a74f',
			client_secret:'b6803588acb1064c5b253df05a268914ff711424'
		};
	};
	me.getUserProfile = function(userName, onSuccess, onFail){
		http({
			url: 'https://api.github.com/users/' + userName,
			//method: "POST",
			data:me.getCredencial(),
		}).then(function successCallback(response) {
				if(typeof(onSuccess)=='function')
					onSuccess(response)
			}, function errorCallback(response) {
				if(typeof(onFail)=='function')
					onFail(response)
		});
	}
	me.query = function(userName, onSuccess, onFail){
		var user = null;
		me.loading = true;
		me.getUserProfile(userName, function(userResponse){
			user=userResponse.data;
			me.getUserStarredRepos(userName, function(repoResponse){
				me.loading = false;
				user.starredRepositories = repoResponse.data;
				if(typeof(onSuccess) == 'function')
					onSuccess(user);
			}, onFail);
		}, onFail)
	
	}
	me.getUserStarredRepos = function(userName, onSuccess, onFail){
		http({
			url:'https://api.github.com/users/' + userName +'/starred',
			//method: "POST",
			data:me.getCredencial(),
		}).then(function successCallback(response) {
				if(typeof(onSuccess)=='function')
					onSuccess(response)
			}, function errorCallback(response) {
				if(typeof(onFail)=='function')
					onFail(response)
		});
	
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