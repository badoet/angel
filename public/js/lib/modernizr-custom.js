/*! modernizr 3.1.0 (Custom Build) | MIT *
 * http://modernizr.com/download/?-ambientlight-cssremunit-csstransforms-csstransforms3d-devicemotion_deviceorientation-fileinput-history-localstorage-placeholder-preserve3d-requestanimationframe-sessionstorage-touchevents-vibrate-webp-webpalpha-webpanimation-webplossless_webp_lossless-willchange !*/
!function(e,n,t){function r(e,n){return typeof e===n}function i(){var e,n,t,i,o,a,s;for(var A in y){if(e=[],n=y[A],n.name&&(e.push(n.name.toLowerCase()),n.options&&n.options.aliases&&n.options.aliases.length))for(t=0;t<n.options.aliases.length;t++)e.push(n.options.aliases[t].toLowerCase());for(i=r(n.fn,"function")?n.fn():n.fn,o=0;o<e.length;o++)a=e[o],s=a.split("."),1===s.length?Modernizr[s[0]]=i:(!Modernizr[s[0]]||Modernizr[s[0]]instanceof Boolean||(Modernizr[s[0]]=new Boolean(Modernizr[s[0]])),Modernizr[s[0]][s[1]]=i),w.push((i?"":"no-")+s.join("-"))}}function o(e){var n=b.className,t=Modernizr._config.classPrefix||"";if(T&&(n=n.baseVal),Modernizr._config.enableJSClass){var r=new RegExp("(^|\\s)"+t+"no-js(\\s|$)");n=n.replace(r,"$1"+t+"js$2")}Modernizr._config.enableClasses&&(n+=" "+t+e.join(" "+t),T?b.className.baseVal=n:b.className=n)}function a(){return"function"!=typeof n.createElement?n.createElement(arguments[0]):T?n.createElementNS.call(n,"http://www.w3.org/2000/svg",arguments[0]):n.createElement.apply(n,arguments)}function s(e){return e.replace(/([a-z])-([a-z])/g,function(e,n,t){return n+t.toUpperCase()}).replace(/^-/,"")}function A(e,n){if("object"==typeof e)for(var t in e)_(e,t)&&A(t,e[t]);else{e=e.toLowerCase();var r=e.split("."),i=Modernizr[r[0]];if(2==r.length&&(i=i[r[1]]),"undefined"!=typeof i)return Modernizr;n="function"==typeof n?n():n,1==r.length?Modernizr[r[0]]=n:(!Modernizr[r[0]]||Modernizr[r[0]]instanceof Boolean||(Modernizr[r[0]]=new Boolean(Modernizr[r[0]])),Modernizr[r[0]][r[1]]=n),o([(n&&0!=n?"":"no-")+r.join("-")]),Modernizr._trigger(e,n)}return Modernizr}function l(){var e=n.body;return e||(e=a(T?"svg":"body"),e.fake=!0),e}function u(e,t,r,i){var o,s,A,u,f="modernizr",d=a("div"),c=l();if(parseInt(r,10))for(;r--;)A=a("div"),A.id=i?i[r]:f+(r+1),d.appendChild(A);return o=a("style"),o.type="text/css",o.id="s"+f,(c.fake?c:d).appendChild(o),c.appendChild(d),o.styleSheet?o.styleSheet.cssText=e:o.appendChild(n.createTextNode(e)),d.id=f,c.fake&&(c.style.background="",c.style.overflow="hidden",u=b.style.overflow,b.style.overflow="hidden",b.appendChild(c)),s=t(d,e),c.fake?(c.parentNode.removeChild(c),b.style.overflow=u,b.offsetHeight):d.parentNode.removeChild(d),!!s}function f(e,n){return!!~(""+e).indexOf(n)}function d(e,n){return function(){return e.apply(n,arguments)}}function c(e,n,t){var i;for(var o in e)if(e[o]in n)return t===!1?e[o]:(i=n[e[o]],r(i,"function")?d(i,t||n):i);return!1}function p(e){return e.replace(/([A-Z])/g,function(e,n){return"-"+n.toLowerCase()}).replace(/^ms-/,"-ms-")}function m(n,r){var i=n.length;if("CSS"in e&&"supports"in e.CSS){for(;i--;)if(e.CSS.supports(p(n[i]),r))return!0;return!1}if("CSSSupportsRule"in e){for(var o=[];i--;)o.push("("+p(n[i])+":"+r+")");return o=o.join(" or "),u("@supports ("+o+") { #modernizr { position: absolute; } }",function(e){return"absolute"==getComputedStyle(e,null).position})}return t}function v(e,n,i,o){function A(){u&&(delete O.style,delete O.modElem)}if(o=r(o,"undefined")?!1:o,!r(i,"undefined")){var l=m(e,i);if(!r(l,"undefined"))return l}for(var u,d,c,p,v,h=["modernizr","tspan"];!O.style;)u=!0,O.modElem=a(h.shift()),O.style=O.modElem.style;for(c=e.length,d=0;c>d;d++)if(p=e[d],v=O.style[p],f(p,"-")&&(p=s(p)),O.style[p]!==t){if(o||r(i,"undefined"))return A(),"pfx"==n?p:!0;try{O.style[p]=i}catch(g){}if(O.style[p]!=v)return A(),"pfx"==n?p:!0}return A(),!1}function h(e,n,t,i,o){var a=e.charAt(0).toUpperCase()+e.slice(1),s=(e+" "+D.join(a+" ")+a).split(" ");return r(n,"string")||r(n,"undefined")?v(s,n,i,o):(s=(e+" "+k.join(a+" ")+a).split(" "),c(s,n,t))}function g(e,n,r){return h(e,t,t,n,r)}var w=[],b=n.documentElement,y=[],S={_version:"3.1.0",_config:{classPrefix:"",enableClasses:!0,enableJSClass:!0,usePrefixes:!0},_q:[],on:function(e,n){var t=this;setTimeout(function(){n(t[e])},0)},addTest:function(e,n,t){y.push({name:e,fn:n,options:t})},addAsyncTest:function(e){y.push({name:null,fn:e})}},Modernizr=function(){};Modernizr.prototype=S,Modernizr=new Modernizr,Modernizr.addTest("history",function(){var n=navigator.userAgent;return-1===n.indexOf("Android 2.")&&-1===n.indexOf("Android 4.0")||-1===n.indexOf("Mobile Safari")||-1!==n.indexOf("Chrome")||-1!==n.indexOf("Windows Phone")?e.history&&"pushState"in e.history:!1}),Modernizr.addTest("willchange","willChange"in b.style),Modernizr.addTest("devicemotion","DeviceMotionEvent"in e),Modernizr.addTest("deviceorientation","DeviceOrientationEvent"in e),Modernizr.addTest("localstorage",function(){var e="modernizr";try{return localStorage.setItem(e,e),localStorage.removeItem(e),!0}catch(n){return!1}}),Modernizr.addTest("sessionstorage",function(){var e="modernizr";try{return sessionStorage.setItem(e,e),sessionStorage.removeItem(e),!0}catch(n){return!1}});var T="svg"===b.nodeName.toLowerCase(),x=S._config.usePrefixes?" -webkit- -moz- -o- -ms- ".split(" "):[];S._prefixes=x,Modernizr.addTest("cssremunit",function(){var e=a("a").style;try{e.fontSize="3rem"}catch(n){}return/rem/.test(e.fontSize)}),Modernizr.addTest("placeholder","placeholder"in a("input")&&"placeholder"in a("textarea")),Modernizr.addTest("fileinput",function(){if(navigator.userAgent.match(/(Android (1.0|1.1|1.5|1.6|2.0|2.1))|(Windows Phone (OS 7|8.0))|(XBLWP)|(ZuneWP)|(w(eb)?OSBrowser)|(webOS)|(Kindle\/(1.0|2.0|2.5|3.0))/))return!1;var e=a("input");return e.type="file",!e.disabled});var B=function(e){function t(n,t){var i;return n?(t&&"string"!=typeof t||(t=a(t||"div")),n="on"+n,i=n in t,!i&&r&&(t.setAttribute||(t=a("div")),t.setAttribute(n,""),i="function"==typeof t[n],t[n]!==e&&(t[n]=e),t.removeAttribute(n)),i):!1}var r=!("onblur"in n.documentElement);return t}();S.hasEvent=B,Modernizr.addTest("ambientlight",B("devicelight",e));var C="CSS"in e&&"supports"in e.CSS,Q="supportsCSS"in e;Modernizr.addTest("supports",C||Q);var _;!function(){var e={}.hasOwnProperty;_=r(e,"undefined")||r(e.call,"undefined")?function(e,n){return n in e&&r(e.constructor.prototype[n],"undefined")}:function(n,t){return e.call(n,t)}}(),S._l={},S.on=function(e,n){this._l[e]||(this._l[e]=[]),this._l[e].push(n),Modernizr.hasOwnProperty(e)&&setTimeout(function(){Modernizr._trigger(e,Modernizr[e])},0)},S._trigger=function(e,n){if(this._l[e]){var t=this._l[e];setTimeout(function(){var e,r;for(e=0;e<t.length;e++)(r=t[e])(n)},0),delete this._l[e]}},Modernizr._q.push(function(){S.addTest=A}),Modernizr.addAsyncTest(function(){var e=new Image;e.onerror=function(){A("webpalpha",!1,{aliases:["webp-alpha"]})},e.onload=function(){A("webpalpha",1==e.width,{aliases:["webp-alpha"]})},e.src="data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAABBxAR/Q9ERP8DAABWUDggGAAAADABAJ0BKgEAAQADADQlpAADcAD++/1QAA=="}),Modernizr.addAsyncTest(function(){function e(e,n,t){function r(n){var r=n&&"load"===n.type?1==i.width:!1,o="webp"===e;A(e,o?new Boolean(r):r),t&&t(n)}var i=new Image;i.onerror=r,i.onload=r,i.src=n}var n=[{uri:"data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=",name:"webp"},{uri:"data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAABBxAR/Q9ERP8DAABWUDggGAAAADABAJ0BKgEAAQADADQlpAADcAD++/1QAA==",name:"webp.alpha"},{uri:"data:image/webp;base64,UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA",name:"webp.animation"},{uri:"data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=",name:"webp.lossless"}],t=n.shift();e(t.name,t.uri,function(t){if(t&&"load"===t.type)for(var r=0;r<n.length;r++)e(n[r].name,n[r].uri)})}),Modernizr.addAsyncTest(function(){var e=new Image;e.onerror=function(){A("webplossless",!1,{aliases:["webp-lossless"]})},e.onload=function(){A("webplossless",1==e.width,{aliases:["webp-lossless"]})},e.src="data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA="}),Modernizr.addAsyncTest(function(){var e=new Image;e.onerror=function(){A("webpanimation",!1,{aliases:["webp-animation"]})},e.onload=function(){A("webpanimation",1==e.width,{aliases:["webp-animation"]})},e.src="data:image/webp;base64,UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA"});var U=S.testStyles=u;Modernizr.addTest("touchevents",function(){var t;if("ontouchstart"in e||e.DocumentTouch&&n instanceof DocumentTouch)t=!0;else{var r=["@media (",x.join("touch-enabled),("),"heartz",")","{#modernizr{top:9px;position:absolute}}"].join("");U(r,function(e){t=9===e.offsetTop})}return t});var R="Moz O ms Webkit",D=S._config.usePrefixes?R.split(" "):[];S._cssomPrefixes=D;var E=function(n){var r,i=x.length,o=e.CSSRule;if("undefined"==typeof o)return t;if(!n)return!1;if(n=n.replace(/^@/,""),r=n.replace(/-/g,"_").toUpperCase()+"_RULE",r in o)return"@"+n;for(var a=0;i>a;a++){var s=x[a],A=s.toUpperCase()+"_"+r;if(A in o)return"@-"+s.toLowerCase()+"-"+n}return!1};S.atRule=E;var k=S._config.usePrefixes?R.toLowerCase().split(" "):[];S._domPrefixes=k;var P={elem:a("modernizr")};Modernizr._q.push(function(){delete P.elem});var O={style:P.elem.style};Modernizr._q.unshift(function(){delete O.style}),S.testAllProps=h;var z=S.prefixed=function(e,n,t){return 0===e.indexOf("@")?E(e):(-1!=e.indexOf("-")&&(e=s(e)),n?h(e,n,t):h(e,"pfx"))};Modernizr.addTest("vibrate",!!z("vibrate",navigator)),Modernizr.addTest("requestanimationframe",!!z("requestAnimationFrame",e),{aliases:["raf"]}),S.testAllProps=g,Modernizr.addTest("csstransforms",function(){return-1===navigator.userAgent.indexOf("Android 2.")&&g("transform","scale(1)",!0)}),Modernizr.addTest("csstransforms3d",function(){var e=!!g("perspective","1px",!0),n=Modernizr._config.usePrefixes;if(e&&(!n||"webkitPerspective"in b.style)){var t;Modernizr.supports?t="@supports (perspective: 1px)":(t="@media (transform-3d)",n&&(t+=",(-webkit-transform-3d)")),t+="{#modernizr{left:9px;position:absolute;height:5px;margin:0;padding:0;border:0}}",U(t,function(n){e=9===n.offsetLeft&&5===n.offsetHeight})}return e}),Modernizr.addTest("preserve3d",g("transformStyle","preserve-3d")),i(),o(w),delete S.addTest,delete S.addAsyncTest;for(var J=0;J<Modernizr._q.length;J++)Modernizr._q[J]();e.Modernizr=Modernizr}(window,document);