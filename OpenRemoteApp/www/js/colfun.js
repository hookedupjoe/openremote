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
