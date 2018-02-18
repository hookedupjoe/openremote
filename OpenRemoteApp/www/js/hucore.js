/*
 * Hookedup Core (c) 2015 All rights reserved.
   (at least until ready for official release)
 
 Uses code from: 
	templates and ajax from 140medley
      https://github.com/honza/140medley
 
 $ design pattern from jQuery, some code from picoCSS
	
 *
 */

_w = window;

_w.sz = function(){
	var tmpRet = {h:_w.innerHeight,w:_w.innerWidth-25};
	
	var tmpType = 4,
		tmpW = tmpRet.w;
		
	if( tmpW < 480 ){
		tmpType = 1;
	} else if( tmpW < 768 ){
		tmpType = 2;
	} else if( tmpW < 1024 ){
		tmpType = 3;
	}

	tmpRet.cs = tmpType; //client size

	return tmpRet;
}

_w.hu = {

};

// ==========================
// Element mods / shorthands
// ==========================

_sto = setTimeout;
_ud = 'undefined'
_d = document;

_he = typeof(HTMLElement) != _ud ? HTMLElement : Element;
_hep = _he.prototype;

_ra = function(theVal,theFind,theReplace){
   return theVal.replace(new RegExp(theFind, 'g'), theReplace);
}

	
//--- pass nothing to get, pass {h:100,w:100} object to ste
_hep.sz = function(theSize){

	if(theSize){
		if( this.tagName == 'CANVAS' ){
			this.width = theSize.w;
			this.height = theSize.h;
		} else {
			this.style.width = theSize.w + 'px';
			this.style.height = theSize.h + 'px';
		}
	}
	return {h:this.clientHeight,ho:this.offsetHeight,hs:this.scrollHeight, w:this.clientWidth,wo:this.offsetWidth,ws:this.scrollWidth};
}



//--- common utility functions
byId = function (theID) {
	return _d.getElementById(theID);		
}


//add event
var _aEvt = function(object, type, callback) {
	if (object == null || typeof(object) == 'undefined') return;
	if (object.addEventListener) {
		object.addEventListener(type, callback, false);
	} else if (object.attachEvent) {
		object.attachEvent("on" + type, callback);
	} else {
		object["on"+type] = callback;
	}
};

//create element
_ce = function(theTag){
	return _d.createElement(theTag)
}
//exists
function _is(o,t){
	if(typeof(t) == _ud){
		return(typeof(o)!== _ud)
	} else {
		return(typeof(o) == t)
	}
}
//isEmpty
function _ise(o){
	if( o==null) return true;
	if(!_is(o)) return true;
	if( _iss(o) ){ return o == ''};
	return false;
}

//isObject
function _iso(o){
	return _is(o,'object');
}

//isString
function _iss(o){
	return _is(o,'string');
}
//isFunction
function _isfn(o){
	return _is(o,'function');
}
//JSON to and from
_fromO = JSON.stringify;
_toO = JSON.parse;
	
//addRemoveClass
_hep.arc = function(string,ia) {
  if (!(string instanceof Array)) {
    string = string.split(' ');
  }
  for(var i = 0, len = string.length; i < len; ++i) {
	  if(ia){
		if (string[i] && !new RegExp('(\\s+|^)' + string[i] + '(\\s+|$)').test(this.className)) {
			this.className = this.className.trim() + ' ' + string[i];
		}
	  } else {
		this.className = this.className.replace(new RegExp('(\\s+|^)' + string[i] + '(\\s+|$)'), ' ').trim();
	  }
  }
  return this;
}

//addClass
_hep.ac = function(string) {
  return _hep.arc.call(this,string,true);
}
 
//removeClass
_hep.rc = function(string) {
  return _hep.arc.call(this,string,false);
}

//hasClass
_hep.hc = function(string) {
  return string && new RegExp('(\\s+|^)' + string + '(\\s+|$)').test(this.className);
}

//setStyle
_hep.css = function(theStyle, theSingleSetVal){
	var tmpList = [];
	if( _iss(theSingleSetVal) ){
		this.style[theStyle] = theSingleSetVal;
		return this;
	} else {
		tmpList = theStyle.split(';');
	}
	for( var i = 0 ; i < tmpList.length ; i++ ){
		var tmpStyle = tmpList[i];
		if(tmpStyle){
			var tmpSA = tmpStyle.split(':');
			if(tmpSA.length == 2){
				this.style[tmpSA[0]] = tmpSA[1];
			}
		}
	}
	return this;
}

		
_hep.on = function (type, fn) {
	_aEvt(this,type,fn);
	return this;
}

_hep.vis = function (isVis) {
	this.css('display',(isVis)?'':'none');
	return this;
}


_hep.html = function (v) {
	this.innerHTML = v;
	return this;
}
	
//-- Shorthands
_hep.sa = _hep.setAttribute;
_hep.ga = _hep.getAttribute;
_hep.apc = _hep.appendChild;

_hep.att = function(theName,theVal){
	this.sa(theName,theVal);
	return this;
}
//-- String Starts With
function _sw (string, prefix) {
    return string.slice(0, prefix.length) == prefix;
}

//replaceAll
function _ra(theVal,theFind,theReplace){
	return theVal.replace(new RegExp(theFind, 'g'), theReplace);
}

	
//-- Get Attributes with Prefix
_hep.gap = function(prefix){
	var tmpAttr = this.attributes;
	var tmpRet = {};
	for (var i = 0; i < tmpAttr.length; i++) {
		var attrib = tmpAttr[i];
		if (attrib.specified) {
			if( (prefix) && _sw(attrib.name, prefix) ){
				tmpRet[attrib.name.substr(prefix.length+1)] = attrib.value;
			}
		}
	}	
	return tmpRet;
};

_hep.getData = function(){
	return this.gap('data');
};



	
// ====================================================
// Base Functionality
// ====================================================
;(function(theCore){



	/*
	 * Templating
	 *
	 * Usage:
	 *  var hello = t("Hello, #{this.name || 'world'}!")
	 *
	 *  console.log( // => "Hello, Jed!"
	 *    hello({name: "Jed"})
	 *  )
	 *
	 * Copyright (C) 2011 Jed Schmidt <http://jed.is> - WTFPL
	 * More: https://gist.github.com/964762
	 */

	var t = function(
	  a, // the string source from which the template is compiled
	  b  // the default `with` context of the template (optional)
	){
	  this.cls = "template"; //WJF
	  return function(
		c, // the object called as `this` in the template
		d  // the `with` context of this template call (optional)
	  ){
		return a.replace(
		  /#{([^}]*)}/g, // a regexp that finds the interpolated code: "#{<code>}"
		  function(
			a, // not used, only positional
			e  // the code matched by the interpolation
		  ){
			return Function(
			  "x",
			  "with(x)return " + e // the result of the interpolated code
			).call(
			  c,    // pass the data object as `this`, with
			  d     // the most
			  || b  // specific
			  || {} // context.
			)
		  }
		)
	  }
	};




	//===================================
	// Extend core with public features
	//===================================
	//theCore.xhr = j;
	theCore.tpl = t;

	function sel(theSelector){
		return Array.prototype.slice.call(_d.querySelectorAll(theSelector));
	}
	theCore.sel = sel;


	//  NOT SURE IF WE NEED SOMETHING LIKE THIS - EXPOSE AS NEEDED
	/*
	function extend(obj) {
	    Array.prototype.slice.call(arguments, 1).forEach(function(source) {
			if (source) {
				for (var prop in source) {
					if (source[prop].constructor === Object) {
						if (!obj[prop] || obj[prop].constructor === Object) {
							obj[prop] = obj[prop] || {};
							extend(obj[prop], source[prop]);
						} else {
							obj[prop] = source[prop];
						}
					} else {
						obj[prop] = source[prop];
					}
				}
			}
		});
		return obj;
	}
	
	theCore.extend = extend;
*/

	//--- namespace
	theCore.ns = function(theNS){
		if(typeof theCore[theNS] != 'object'){
			theCore[theNS] = {};
		}
		return theCore[theNS];
	}

//===============================================


	//--- common utility functions
	theCore.byId = byId;
	
	//create element
	theCore.ce = theCore.createElement = _ce;
	//exists
	theCore.is = _is;
	//isEmpty
	theCore.ise = _ise;
	
	//isObject
	theCore.iso = _iso;

	//isString
	theCore.iss = _iss;
	//isFunction
	theCore.isfn = _isfn;
	//JSON to and from
	theCore.fromO = _fromO;
	theCore.toO = _toO;

	

//0000000000000000000000000000000000000000000000000000

	//Inhereit
	theCore.inh = function(theChild, theParent){
		//alert('inh theParent ' + typeof(theParent) + " ch " + typeof(theChild) ) 
		theChild.prototype = Object.create(theParent.prototype);
		theChild.prototype.constructor = theChild;
		//alert('inh theParent done')
	};
	
	//jQuery like selector
	theCore.select = function(theSelector){
		return new theCore.Selection(theSelector);
	}

	// call body() to get body
	// optionaly include theNewChild to append new child to body
	theCore.body = function(theNewChild){
		if( !theCore._body ) theCore._body = sel('body')[0];
		var tmpBody = theCore._body;
		if(theNewChild) tmpBody.apc(theNewChild);
		return tmpBody;
	}
	
	theCore.dbug = dbug;
	function dbug(theOut){
		console.log(theOut);
	}
	

	
	theCore.sv = sv;
	function sv(theSelect, theIsVis){
	//	console.log(theCore.select(theSelect));
		theCore.select(theSelect).vis(theIsVis);
	}

	//ajax request pending
	var _ajp = false;

	//--- override
	theCore.onGet = function(theStatusCode, theResponse){
		//not implemented
	}

	theCore.onGetInternal = function(theStatusCode, theResponse){
		_ajp = false;
		if( _isfn(this.onGet) ) this.onGet(theStatusCode, theResponse);
		console.log('no on get');
//		dbug('onGet Internal ' + theStatusCode + "\n\n" + theResponse);
	}
	
	//--- ajax GET
	theCore.get = function(theURL,theCB){
		if( _isfn(theCB) ){
			theCore.onGet = theCB;
		}
		if(_ajp){return false;}
		_ajp = true;		
		
		if(_aj.readyState==0 || _aj.readyState==4){
			_aj.open('GET',theURL,true);
			_aj.send(null);
		} 
		
		return true;
	}
	
	function rsc(){
		//dbug('status ' + _aj.status);
		//dbug('response ' + _aj.responseText || '');
		
		if(_aj.readyState==4 && _aj.status==200){
			var tmpResponse = _aj.responseText;
			theCore.onGetInternal(_aj.status,tmpResponse);
		}
	}

	
	

	//--- Singletons
	//theCore.ajax = j();

	var _aj=window.XMLHttpRequest?(new XMLHttpRequest()):(new ActiveXObject('Microsoft.XMLHTTP'));
	_aj.onreadystatechange = rsc;

})(hu);


// ====================================================
// Functionality for all objects in the system, 
//   includes simple templates
// ====================================================
;(function(theCore){
	
	function BaseClass(data,options){
		var me = this;
		var opt = options || {};
		var obj = data || {};
		me.data = obj;
		me.opt = opt;
	}
	
	var _pt = BaseClass.prototype;
	_pt.str = function(){
		this.opt = this.opt || {};
		if( this.opt.tpl ){
			if(!this._tpl) this._tpl = theCore.tpl(this.opt.tpl);
			return (this._tpl(this.data));
		} else {
			return theCore.fromO(this.data);
		}
	}
	
	theCore.Object = BaseClass;

})(hu);


// ====================================================
// Hookedup Element
// ====================================================
;(function(theCore){
	
	function BaseClass(selector,options){
		var me = this;
		
		me.sel = selector || '';
		me.opt = options || {};
		me.data = [];
		
		if( !(me.sel) ){return};

		me.data = theCore.sel(me.sel);
		//console.log(me.data);
	}
	var _pt = BaseClass.prototype;
	
	_pt.arc = function(theClassName, theIsAdd){
		return this.forEach(function(theEl){
			theEl.arc(theClassName, theIsAdd);
		});
	}
	_pt.addClass = function(theClassName){
		return this.arc(theClassName,true);
	}
	_pt.removeClass = function(theClassName){
		return this.arc(theClassName,false);
	}
	_pt.forEach = function(theFunction){
		for( var i = 0 ; i < this.data.length ; i++ ){
			var tmpEl = this.data[i];
			theFunction(tmpEl,i,this.data);
		}
		return this;
	}
	_pt.att = function (a, v) {
		return this.forEach(function(theEl){
			theEl.att(a,v);
		});
    },
	_pt.sz = function (theSize) {
		return this.forEach(function(theEl){
			theEl.sz(theSize);
		});
    },
    _pt.html = function (v) {
		return this.forEach(function(theEl){
			theEl.html(v);
		});
    },
    _pt.val = function (v) {
		return this.forEach(function(theEl){
			theEl.val(v);
		});
    },
    _pt.vis = function (v) {
		return this.forEach(function(theEl){
			theEl.vis(v);
		});
    },
    _pt.on = function (type, fn) {
		return this.forEach(function(theEl){
			theEl.on(type, fn);
		});
    },
	_pt.css = function(theStyle, theSingleSetVal){
		//--- Done here for performance reasons
		//--   if running on many nodes, this does the split only once
		var tmpList = [];
		if( theCore.iss(theSingleSetVal) ){
			tmpList.push(theStyle + ':' + theSingleSetVal);
		} else {
			tmpList = theStyle.split(';');
		}
		for( var i = 0 ; i < tmpList.length ; i++ ){
			var tmpStyle = tmpList[i];
			if(tmpStyle){
				var tmpSA = tmpStyle.split(':');
				if(tmpSA.length == 2){
					this.forEach(function(theEl){
						theEl.css(tmpSA[0], tmpSA[1]);
					});
				}
			}
		}
		return this;
	}
	
	theCore.Selection = BaseClass;

})(hu);


/*!
  * domready (c) Dustin Diaz 2014 - License MIT
  */
!function (name, definition) {
  if (typeof module != _ud) module.exports = definition()
  else if (hu.isfn('function') && hu.iso(define.amd)) define(definition)
  else this[name] = definition()

}('domready', function () {

  var fns = [], lst
    , hack = _d.documentElement.doScroll
    , dcm = 'DOMContentLoaded'
    , loaded = (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(_d.readyState)


  if (!loaded)
  _d.addEventListener(dcm, lst = function () {
    _d.removeEventListener(dcm, lst)
    loaded = 1
    while (lst = fns.shift()) lst()
  })

  return function (fn) {
    loaded ? _sto(fn, 0) : fns.push(fn)
  }

});



_w.$ = hu.select;