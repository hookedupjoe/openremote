//--- Main Application Page
//--- hookedup, inc.  (c) 2015

;(function(){
	
	var tmpParent = hu.Object;
	
    var App = function(theData,theOptions){
	
		tmpParent.call(me,theData,theOptions);

		var me = this,
			dat = {menu:{}},
			btnHome, //Home
			btnBack, //Back
			outPage, //out for Pages
			outGraphics, //out for Graphics
			outCtx,// graphics out context 
			_ws = _w.sz(); //window size

			
		var menus = {},
			menusAt = -1;
			
		function addToMenus(theAction, theParams){
			menusAt++;
			menus[menusAt] = {a: theAction, p: theParams};
		}
		me.home = home;
		function home(){
			run('m','&p=home');
			return false;
		}



		me.showColDlg = showColDlg;
		function showColDlg(){
			dlgCol.show();
		}
		
	me.dlgColCl = dlgColCl;
	function dlgColCl(){
hu.dbug("dlgColCl");
	
		var tmpRGB = dlgCol.details();
		if(!tmpRGB){return};
		if(tmpRGB.rgb){
			tmpRGB = _ra(tmpRGB.rgb,',','-')
		};
		run('setcol','&p=' + tmpRGB);		
	}
	
	me.dlgColOK = dlgColOK;
	function dlgColOK (){
		console.log('dlgColCl');
		var tmpRGB = dlgCol.details();
		if(!tmpRGB){return};
		if(tmpRGB.rgb){
			tmpRGB = _ra(tmpRGB.rgb,',','-')
			console.log(tmpRGB);
		};
		run('setcol','&p=' + tmpRGB);		
	}
	
		me.back = back;
		function back(){
			menusAt--;
			if( menusAt < 0 ){
				backEnabled(false);

				run('m','&p=home',true);
				return false;
			}
			var tmpDetails = menus[menusAt];
			if( tmpDetails && tmpDetails.a ){
				run(tmpDetails.a,tmpDetails.p || '',true);
			}
			return false;
		}
		
		function cmdCallback(){
			console.log('comment done');
		}
		//run API Action
		function run(theAction,theParams,theIsGoingBack){	   
		   var tmpURL = '/api?a=' + theAction + theParams;
		   if( theAction == 'm' ){
				if( theIsGoingBack !== true ){

					addToMenus(theAction, theParams);
				}
				var tmpMenuName = (theParams || '').replace('&p=','');
				loadMenu(tmpMenuName);
				return;
		   }

		   hu.get(tmpURL, cmdCallback);
		   //TODO
		   //ajax(tmpURL);
		}
		
		function onActionClick(e){

			var tmpT = e.target || e.srcElement 
			var tmpAct=tmpT.ga('act');
			if( tmpAct && tmpAct != null ){ //&& !tmpT.ga('onclick') ???
				e.stopPropagation();
				if(tmpT.hc('dis')){
					return;
				}
				act(tmpAct,tmpT);
			}
		}

		
		//run Action
		function act(theAction,theElem){
		   var tmpPs = getps(theElem);
		   run(theAction,tmpPs);
		}
		
		function getps(elem){
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
		}

	
//=== Start Application		

//=== Private
		function dbug(theOut){
			hu.dbug(theOut);
		}
		function co(){
			outPage.html(' ');
		}
		
		function loadItems(theItems){
			co();
			for( var i = 0 ; i < theItems.length ; i++ ){
				var aItem = theItems[i];
				var tmpItem = hu.ce(aItem.tag);
				for( aFN in aItem ){
					var tmpFV = aItem[aFN];
					if(aFN!='tag'&&aFN!='html'){
						tmpItem.att(aFN,tmpFV);
					}
				}
				if( aItem.html ){
					tmpItem.html(aItem.html);
				}
				outPage.apc(tmpItem);
			}
		}

	
		function menuLoaded(theStatus,theResponse){
			if( theStatus != 200 ){
				console.log("Ajax error " + theStatus + " - " + theResponse || '');
				return;
			}
			var tmpResp = _toO(theResponse);
			var tmpID = tmpResp.details.id;
			dat.menu[tmpID] = tmpResp.details;
			loadMenuObj(dat.menu[tmpID]);
		}


		function setOutputToPages(){
			setOut(true);
		}
		function setOutputToGraphics(){
			setOut(false);
		}
		
		function loadMenuObj(theMenu){
			setOutputToPages();
			loadItems(theMenu.items);
			homeEnabled(!theMenu.isHome);
			backEnabled(menusAt>=0);
			//backEnabled(true);
		}
		function loadMenu(theName){
			if(dat.menu[theName]) return loadMenuObj(dat.menu[theName]);
			hu.onGet = menuLoaded;
			var tmpURL = './om/menu/' + theName + '.js';
			hu.get(tmpURL);			
		}

		
//=== Public
		//Elem Enabled
		function elemEnabled(theEl,isEnabled){
			theEl.arc('dis',!isEnabled);
		}
		//Home Enabled
		function homeEnabled(isEnabled){
			elemEnabled(btnHome,isEnabled);
		}
		//Back Enabled
		function backEnabled(isEnabled){
			elemEnabled(btnBack,isEnabled);
		}

		function setOut(theIsPage){
			outPage.vis(theIsPage);
			outGraphics.vis(!theIsPage);		
		}
		
		
		
		me.load = function() {
			_aEvt(window, "resize", me.resize);						
			
			outPage = hu.byId('op');
			outGraphics = hu.byId('og');
			_aEvt(outPage,"click",onActionClick);
			
			btnHome = hu.byId('btnHome');
			btnBack = hu.byId('btnBack');
			
			outCtx = outGraphics.getContext('2d');
			setOutputToPages();
			
			window.dlgCol = new CDlg({ok:dlgColOK,click:dlgColCl});
console.log(typeof window.dlgCol);
					
			loadMenu('home');
		}

		
		me.resize = function() {
			//_ws = _w.sz()
			//console.log('resize');			
		}

		
//=== End Application		
	};
	
	hu.inh(App, tmpParent);
	hu.App = App;	

})();