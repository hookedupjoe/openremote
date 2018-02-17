var _aj=window.XMLHttpRequest?(new XMLHttpRequest()):(new ActiveXObject('Microsoft.XMLHTTP'));

App = {
	//inRun (don't do anything right now when set)
	ir:false,
	addClass : function(theO,theC){
		if(typeof(theO)=='string'){
			theO=App.get(theO);
		}
		theO.ac(theC);
	},
	removeClass : function(theO,theC){
		if(typeof(theO)=='string'){
			theO=App.get(theO);
		}
		theO.rc(theC);
	},
	//disableButton
	dBtn : function(theButton){
		App.addClass(theButton, 'dis');		
	},
	//enableButton
	eBtn : function(theButton){		
		App.removeClass(theButton, 'dis');
	},
	//openHome
	om : function(theName){
	   App.run('m','&p=home');
	},
	ajax : function(theURL){
		if(App.ir){return;}
		if(_aj.readyState==0 || _aj.readyState==4){
			App.dis();
			_aj.open('GET',theURL,true);
			_aj.send(null);
		}
	},
	//setOutput
	so : function(theV){
		App.html('oa',theV);
	},
	//clearOutput
	co : function(theV){
		App.so('');
	},
	//appendChild to output area
	aoo : function(theO){
		App.appcld('oa', theO)
	},
	//appendChild
	appcld : function(theID,theO){
		App.get(theID).appendChild(theO);
	},
	html : function(theID,theV){
		App.get(theID).innerHTML = theV;
	},
	//disable Actions
	dis : function(theItems){
		App.addClass(App.oa,'dis');
		App.addClass(App.nb,'dis');
		App.ir = true; 
	},
	//enable Actions
	en : function(theItems){
		App.removeClass(App.oa,'dis');
		App.removeClass(App.nb,'dis');
		App.ir = false; 
	},
	//load structured items
	loadItems : function(theItems){
		App.co();
		for( var i = 0 ; i < theItems.length ; i++ ){
			var aItem = theItems[i];
			var tmpItem = App.ce(aItem.tag);
			for( aFN in aItem ){
				var tmpFV = aItem[aFN];
				if(aFN!='tag'&&aFN!='html'){
					tmpItem.sa(aFN,tmpFV);
				}
			}
			if( aItem.html ){
				tmpItem.innerHTML = aItem.html;
			}
			App.aoo(tmpItem);
		}
	},
	//replaceAll
	ra : function(theVal,theFind,theReplace){
		return theVal.replace(new RegExp(theFind, 'g'), theReplace);
	},
	//colorDialogClicked
	dlgColCl : function(){
		var tmpRGB = dlgCol.details();
		if(!tmpRGB){return};
		if(tmpRGB.rgb){
			tmpRGB = App.ra(tmpRGB.rgb,',','-')
		};
		App.run('setcol','&p=' + tmpRGB);		
	},
	//colorDialogOK
	dlgColOK : function(){
		console.log('dlgColCl');
		var tmpRGB = dlgCol.details();
		if(!tmpRGB){return};
		if(tmpRGB.rgb){
			tmpRGB = App.ra(tmpRGB.rgb,',','-')
			console.log(tmpRGB);
		};
		App.run('setcol','&p=' + tmpRGB);		
	},
	//runs on page load
	load : function(){
		App.oa = App.get('oa');		
		App.oa.addEventListener("click", App.oac, false);
		App.nb = App.get('nb');		
		window.dlgCol = new CDlg({ok:App.dlgColOK,click:App.dlgColCl});
		
		App.run('m','&p=home',true);
	},
	//getAction and if not disabled, run it
	oac : function(e){
		var tmpT = e.target || e.srcElement 
		var tmpAct=tmpT.ga('act');
		if( tmpAct && tmpAct != null ){ //&& !tmpT.ga('onclick') ???
			e.stopPropagation();
			if(tmpT.hc('dis')){
				return;
			}
			App.act(tmpAct,tmpT);
		}
	},
	//getParams
	getps : function(elem){
		var tmpRet = '';
		for (var i = 0; i < elem.attributes.length; i++) {
			var attrib = elem.attributes[i];
			if (attrib.specified) {
				if( attrib.name.substr(0,2)=='p-' ){
					tmpRet += '&' + attrib.name.substr(2) + "=" + attrib.value;
				}
			}		
		}
		return tmpRet;
	},
	//menu system
	menus : {},
	menusAt : -1,
	addToMenus : function(theAction, theParams){
		App.menusAt++;
		App.menus[App.menusAt] = {a: theAction, p: theParams};
	},
	home : function(){
		App.run('m','&p=home');
		return false;
	},
	back : function(){
		App.menusAt--;
		if( App.menusAt < 0 ){
			App.dBtn('btnBack');
			App.run('m','&p=home',true);
			return false;
		}
		var tmpDetails = App.menus[App.menusAt];
		if( tmpDetails && tmpDetails.a ){
			App.run(tmpDetails.a,tmpDetails.p || '',true);
		}
		return false;
	},
	//run API Action
	run : function(theAction,theParams,theIsGoingBack){	   
	   var tmpURL = '/api?a=' + theAction + theParams;
	   if( theAction == 'm' ){
			if( theIsGoingBack !== true ){
				App.addToMenus(theAction, theParams);
			}
	   }
	   App.ajax(tmpURL);
	},
	//run Action
	act : function(theAction,theElem){
	   var tmpPs = App.getps(theElem);
	   App.run(theAction,tmpPs);
	},
	//ajax is back
	rsc : function(){
	 if(_aj.readyState==4 && _aj.status==200){
	   var tmpResponse = _aj.responseText;
	   App.en();
	   var tmpO = JSON.parse(tmpResponse);
	   if( tmpResponse != "" && tmpO && tmpO.details && tmpO.details.items ){
			App[tmpO.details.isHome?'dBtn':'eBtn']('btnHome');
			if( App.menusAt >= 0){
				App.eBtn('btnBack');
			}
			App.loadItems(tmpO.details.items);
	   } else {
		console.log('unknown reply');
		console.log(tmpO);
	   }
	 }
	}
};

App.get = p.get;
App.ce = p.ce;


_aj.onreadystatechange=App.rsc;

domready(App.load);

function rgbToHex(R,G,B) {return toHex(R)+toHex(G)+toHex(B)};
function toHex(n) {
  n = parseInt(n,10);
  if (isNaN(n)) return "00";
  n = Math.max(0,Math.min(n,255));
  return "0123456789ABCDEF".charAt((n-n%16)/16)  + "0123456789ABCDEF".charAt(n%16);
};

