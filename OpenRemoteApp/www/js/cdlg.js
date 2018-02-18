var core = hu;

function flr(v){return Math.floor(v)};
function rgbToHex(R,G,B) {return toHex(R)+toHex(G)+toHex(B)}
function toHex(n) {
  n = parseInt(n,10);
  if (isNaN(n)) return "00";
  n = Math.max(0,Math.min(n,255));
  return "0123456789ABCDEF".charAt((n-n%16)/16)  + "0123456789ABCDEF".charAt(n%16);
}

function rgb2hsv(tr,tg,tb) {

		var rr, gg, bb,

		r = tr / 255,
		g = tg / 255,
		b = tb / 255,
		h, s,

		v = Math.max(r, g, b),
		df = v - Math.min(r, g, b),
		dc = function (c) {
			return (v - c) / 6 / df + 0.5;
		};

		if (df === 0) {
			h = s = 0;

		} else {
			s = df / v;

			rr = dc(r);
			gg = dc(g);
			bb = dc(b);

			if (r === v) {h = bb - gg}
			else if (g === v) {h = (0.3333333333) + rr - bb} 
			else if (b === v) {h = (0.6666666667) + gg - rr};
			if (h < 0) {h += 1}
			else if (h > 1) {h -= 1}
		}
		return {
			h: flr(h * 360),
			s: flr(s * 100),
			v: flr(v * 100)
		}
	};

	
(function(){var CDlgMU = '<div id="coldlg" class="dlg" style="display:none;"><canvas id="cpk" var="1" width="340px" height="300px"></canvas><div class="ctls"><div><button id="cdlgok" class="btn fw">OK</button></div><div><button id="cdlgcancel" class="btn fw wb">Cancel</button></div><div><label>Color</label><span id="pVal" /></span></div><div class="po-s"><label>Number</label><span type="text" id="pNum" />0</span></div><div class="po-h"><label>RGB</label><span type="text" id="pRGB" />255,0,0</span></div><input type="hidden" id="hexVal" /><input type="hidden" id="rgbVal" /></div></div>'
	var tmpNew = (_ce('div'));
	tmpNew.innerHTML = CDlgMU;
	document.getElementsByTagName('body')[0].appendChild(tmpNew);

})();

CDlg = function(cb) {
	this.show = show;
	function show(theIsPrimary){
		ipro = (theIsPrimary != false);
		rd();
		core.sv('.po-h',!ipro);
		core.sv('#coldlg',true);
	}
	this.hide = hide;
	function hide(){
		core.select('#coldlg').css('display:none');
	}
	this.selectColor = selectColor;
	function selectColor(){
		if(core.is(cb)){
			if(cb.ok)cb.ok.call()
		};
		hide();
	}

	cv = core.byId("cpk");
	console.log(cv);
	ctx = cv.getContext("2d");
	_aEvt(core.byId("cdlgcancel"), "click", this.hide);	

	
	this.details = function(){
		return {hex:_sc,rgb:_srb,hsv:_shv,num:_scm};
	}
	
	_sc = '#ff0000';
	_srb = '255,0,0';
	_shv = {h:0,s:1,v:1};
	_scm = 0;

	function dw(){
		var tmpSz = 300;
		var pos = (tmpSz / 2)-20;
		var x = pos ;
		var y = pos;
		var radius = (tmpSz / 2)-20;
		var counterClockwise = false;

		for(var angle=0; angle<=360; angle+=1){
			var startAngle = (angle-2)*Math.PI/180;
			var endAngle = angle * Math.PI/180;
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.arc(x, y, radius, startAngle, endAngle, counterClockwise);
			ctx.closePath();
			ctx.fillStyle = 'hsl('+angle+', 100%, 50%)';
			ctx.fill();
		}
		
	}

	ipro = true;


	function rd(){
		ctx.clearRect(0, 0, cv.width, cv.height);
		dw();
		refreshColorUI();
		drawFadeAmount();

	}

	function drawSwatches(){
		var tmpSz = 340;
		var tmpSzE = (340/3)-30;

		ctx.fillStyle="#000000";
		ctx.fillRect(tmpSz-60,10,30,tmpSzE);
		ctx.fillStyle="#ffffff";
		ctx.fillRect(tmpSz-60,10+tmpSzE,30,tmpSzE);
		ctx.fillStyle="#cccccc";
		ctx.fillRect(tmpSz-60,10+(tmpSzE*2),30,tmpSzE);

		ctx.font = "30px Arial";
		ctx.strokeText("C",tmpSz-57,10+(tmpSzE*2)+(tmpSzE/2+7));
	}

	function drawFadeAmount(){
		if( ipro ){
			drawSwatches();
			return;
		};
		
		var tmpSz = 340;
		
		var tmpG=ctx.createLinearGradient(tmpSz,40,tmpSz,tmpSz-105);
		tmpG.addColorStop(0,ipro?"black":_sc);
		tmpG.addColorStop(1,"black");
		ctx.fillStyle=tmpG;
		
		ctx.fillRect(tmpSz-30,10,30,tmpSz-75);

		tmpG=ctx.createLinearGradient(tmpSz,40,tmpSz,tmpSz-105);
		tmpG.addColorStop(0,ipro?"white":_sc);
		tmpG.addColorStop(1,"white");
		ctx.fillStyle=tmpG;

		ctx.fillRect(tmpSz-60,10,30,tmpSz-75);
	}

	rd();

	function colFromHSV(theHSV){
		if(theHSV.v==0){
			return 254;
		}
		if(theHSV.s==0){
			return 255;
		}
		return Math.floor(((theHSV.h/359)*250));
	}


	function refreshColorUI(){
	/*
		  core.select('#rgbVal').val(_srb);
		  core.select('#hexVal').val(_sc);
		  core.s('#pNum').html(_scm);
		  core.s('#pRGB').html(_srb);
*/			
		  core.select('#pVal').css('background-color:' + _sc + ';');
	}

	var gR,gG,gB;
	
	core.select('#cpk').on('click', function(event){
		  var x = event.pageX - this.offsetLeft;
		  var y = event.pageY - this.offsetTop;
		  
		  if(ipro&&x>309||y<6||y>262)return;
		  
		  var img_data = ctx.getImageData(x, y, 1, 1).data;
		  var R = img_data[0];
		  var G = img_data[1];
		  var B = img_data[2];

		  var hex = rgbToHex(R,G,B);
		  if(x<280 && hex == "000000"){
			return;
		  }
		  
		  if(ipro&&x>=280){
			if(hex == "000000"){
				R=G=B=0;
			} else if(hex == "FFFFFF"){
				R=G=B=255;
			}		
		  }

		  if(ipro&&x>=280&&y>170){
			_scm = 251;
			R=G=B=127;
		  } else {
			_scm = colFromHSV(_shv);
		  }
		  
		  var rgb = R + ',' + G + ',' + B;
		  hex = rgbToHex(R,G,B);
			_srb = R+','+G+','+B;
			_sc = '#' + hex;
			_shv = rgb2hsv(R,G,B);	  
			

		  refreshColorUI();
		  if(x<280){
			drawFadeAmount();
		  }
		  if(gR!=R||gG!=G||gB!=B){
			  //color changed
			if(hu.is(cb)){
				if(cb.click)cb.click.call()
			};
		  }
	  
	});

}	
	