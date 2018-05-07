
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

