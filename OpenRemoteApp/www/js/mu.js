(function(){var CDlgMU = '<div id="coldlg" class="dlg" style="display:none;"><canvas id="cpk" var="1" width="340px" height="300px"></canvas><div class="ctls"><div><button onclick="dlgCol.selectColor();" class="btn fw">OK</button></div><div><button onclick="dlgCol.hide();" class="btn fw wb">Cancel</button></div><div><label>Color</label><span id="pVal" /></span></div><div class="po-s"><label>Number</label><span type="text" id="pNum" />0</span></div><div class="po-h"><label>RGB</label><span type="text" id="pRGB" />255,0,0</span></div><input type="hidden" id="hexVal" /><input type="hidden" id="rgbVal" /></div></div>'
var tmpNew = (p.ce('div'));
tmpNew.innerHTML = CDlgMU;
document.getElementsByTagName('body')[0].appendChild(tmpNew);
})();
/*!
  * domready (c) Dustin Diaz 2014 - License MIT
  */
!function (name, definition) {

  if (typeof module != 'undefined') module.exports = definition()
  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
  else this[name] = definition()

}('domready', function () {

  var fns = [], listener
    , doc = document
    , hack = doc.documentElement.doScroll
    , domContentLoaded = 'DOMContentLoaded'
    , loaded = (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState)


  if (!loaded)
  doc.addEventListener(domContentLoaded, listener = function () {
    doc.removeEventListener(domContentLoaded, listener)
    loaded = 1
    while (listener = fns.shift()) listener()
  })

  return function (fn) {
    loaded ? setTimeout(fn, 0) : fns.push(fn)
  }

});
