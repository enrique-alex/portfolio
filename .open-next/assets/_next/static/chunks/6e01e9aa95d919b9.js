(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,93844,(e,t,i)=>{e.e,t.exports=function(){"use strict";return function(e){function t(e,t){var i=e.__state.conversionName.toString(),o=Math.round(e.r),n=Math.round(e.g),r=Math.round(e.b),a=e.a,s=Math.round(e.h),l=e.s.toFixed(1),u=e.v.toFixed(1);if(t||"THREE_CHAR_HEX"===i||"SIX_CHAR_HEX"===i){for(var c=e.hex.toString(16);c.length<6;)c="0"+c;return"#"+c}return"CSS_RGB"===i?"rgb("+o+","+n+","+r+")":"CSS_RGBA"===i?"rgba("+o+","+n+","+r+","+a+")":"HEX"===i?"0x"+e.hex.toString(16):"RGB_ARRAY"===i?"["+o+","+n+","+r+"]":"RGBA_ARRAY"===i?"["+o+","+n+","+r+","+a+"]":"RGB_OBJ"===i?"{r:"+o+",g:"+n+",b:"+r+"}":"RGBA_OBJ"===i?"{r:"+o+",g:"+n+",b:"+r+",a:"+a+"}":"HSV_OBJ"===i?"{h:"+s+",s:"+l+",v:"+u+"}":"HSVA_OBJ"===i?"{h:"+s+",s:"+l+",v:"+u+",a:"+a+"}":"unknown format"}function i(e,t,i){Object.defineProperty(e,t,{get:function(){return"RGB"===this.__state.space||U.recalculateRGB(this,t,i),this.__state[t]},set:function(e){"RGB"!==this.__state.space&&(U.recalculateRGB(this,t,i),this.__state.space="RGB"),this.__state[t]=e}})}function o(e,t){Object.defineProperty(e,t,{get:function(){return"HSV"===this.__state.space||U.recalculateHSV(this),this.__state[t]},set:function(e){"HSV"!==this.__state.space&&(U.recalculateHSV(this),this.__state.space="HSV"),this.__state[t]=e}})}function n(e){if("0"===e||b.isUndefined(e))return 0;var t=e.match(B);return b.isNull(t)?0:parseFloat(t[1])}function r(e){var t=e.toString();return t.indexOf(".")>-1?t.length-t.indexOf(".")-1:0}function a(e,t,i,o){e.style.background="",b.each(j,function(n){e.style.cssText+="background: "+n+"linear-gradient("+t+", "+i+" 0%, "+o+" 100%); "})}function s(e,t,i){var o=document.createElement("li");return t&&o.appendChild(t),i?e.__ul.insertBefore(o,i):e.__ul.appendChild(o),e.onResize(),o}function l(e){P.unbind(window,"resize",e.__resizeHandler),e.saveToLocalStorageIfPossible&&P.unbind(window,"unload",e.saveToLocalStorageIfPossible)}function u(e,t){var i=e.__preset_select[e.__preset_select.selectedIndex];i.innerHTML=t?i.value+"*":i.value}function c(e,t){var i=e.getRoot(),o=i.__rememberedObjects.indexOf(t.object);if(-1!==o){var n=i.__rememberedObjectIndecesToControllers[o];if(void 0===n&&(n={},i.__rememberedObjectIndecesToControllers[o]=n),n[t.property]=t,i.load&&i.load.remembered){var r=i.load.remembered,a=void 0;if(r[e.preset])a=r[e.preset];else{if(!r[Q])return;a=r[Q]}if(a[o]&&void 0!==a[o][t.property]){var s=a[o][t.property];t.initialValue=s,t.setValue(s)}}}}function d(e,t,i,o){if(void 0===t[i])throw Error('Object "'+t+'" has no property "'+i+'"');var n=void 0;n=o.color?new Y(t,i):W.apply(e,[t,i].concat(o.factoryArgs)),o.before instanceof F&&(o.before=o.before.__li),c(e,n),P.addClass(n.domElement,"c");var r=document.createElement("span");P.addClass(r,"property-name"),r.innerHTML=n.property;var a=document.createElement("div");a.appendChild(r),a.appendChild(n.domElement);var l=s(e,a,o.before);return P.addClass(l,eo.CLASS_CONTROLLER_ROW),n instanceof Y?P.addClass(l,"color"):P.addClass(l,A(n.getValue())),function(e,t,i){if(i.__li=t,i.__gui=e,b.extend(i,{options:function(t){if(arguments.length>1){var o=i.__li.nextElementSibling;return i.remove(),d(e,i.object,i.property,{before:o,factoryArgs:[b.toArray(arguments)]})}if(b.isArray(t)||b.isObject(t)){var n=i.__li.nextElementSibling;return i.remove(),d(e,i.object,i.property,{before:n,factoryArgs:[t]})}},name:function(e){return i.__li.firstElementChild.firstElementChild.innerHTML=e,i},listen:function(){return i.__gui.listen(i),i},remove:function(){return i.__gui.remove(i),i}}),i instanceof X){var o=new G(i.object,i.property,{min:i.__min,max:i.__max,step:i.__step});b.each(["updateDisplay","onChange","onFinishChange","step"],function(e){var t=i[e],n=o[e];i[e]=o[e]=function(){var e=Array.prototype.slice.call(arguments);return n.apply(o,e),t.apply(i,e)}}),P.addClass(t,"has-slider"),i.domElement.insertBefore(o.domElement,i.domElement.firstElementChild)}else if(i instanceof G){var n=function(t){if(b.isNumber(i.__min)&&b.isNumber(i.__max)){var o=i.__li.firstElementChild.firstElementChild.innerHTML,n=i.__gui.__listening.indexOf(i)>-1;i.remove();var r=d(e,i.object,i.property,{before:i.__li.nextElementSibling,factoryArgs:[i.__min,i.__max,i.__step]});return r.name(o),n&&r.listen(),r}return t};i.min=b.compose(n,i.min),i.max=b.compose(n,i.max)}else i instanceof I?(P.bind(t,"click",function(){P.fakeEvent(i.__checkbox,"click")}),P.bind(i.__checkbox,"click",function(e){e.stopPropagation()})):i instanceof V?(P.bind(t,"click",function(){P.fakeEvent(i.__button,"click")}),P.bind(t,"mouseover",function(){P.addClass(i.__button,"hover")}),P.bind(t,"mouseout",function(){P.removeClass(i.__button,"hover")})):i instanceof Y&&(P.addClass(t,"color"),i.updateDisplay=b.compose(function(e){return t.style.borderLeftColor=i.__color.toString(),e},i.updateDisplay),i.updateDisplay());i.setValue=b.compose(function(t){return e.getRoot().__preset_select&&i.isModified()&&u(e.getRoot(),!0),t},i.setValue)}(e,l,n),e.__controllers.push(n),n}function f(e,t){return document.location.href+"."+t}function h(e,t,i){var o=document.createElement("option");o.innerHTML=t,o.value=t,e.__preset_select.appendChild(o),i&&(e.__preset_select.selectedIndex=e.__preset_select.length-1)}function _(e,t){t.style.display=e.useLocalStorage?"block":"none"}function m(e,t){e.domElement.style.width=t+"px",e.__save_row&&e.autoPlace&&(e.__save_row.style.width=t+"px"),e.__closeButton&&(e.__closeButton.style.width=t+"px")}function p(e,t){var i={};return b.each(e.__rememberedObjects,function(o,n){var r={},a=e.__rememberedObjectIndecesToControllers[n];b.each(a,function(e,i){r[i]=t?e.initialValue:e.getValue()}),i[n]=r}),i}var v=Array.prototype.forEach,g=Array.prototype.slice,b={BREAK:{},extend:function(e){return this.each(g.call(arguments,1),function(t){(this.isObject(t)?Object.keys(t):[]).forEach((function(i){this.isUndefined(t[i])||(e[i]=t[i])}).bind(this))},this),e},defaults:function(e){return this.each(g.call(arguments,1),function(t){(this.isObject(t)?Object.keys(t):[]).forEach((function(i){this.isUndefined(e[i])&&(e[i]=t[i])}).bind(this))},this),e},compose:function(){var e=g.call(arguments);return function(){for(var t=g.call(arguments),i=e.length-1;i>=0;i--)t=[e[i].apply(this,t)];return t[0]}},each:function(e,t,i){if(e){if(v&&e.forEach&&e.forEach===v)e.forEach(t,i);else if(e.length===e.length+0){var o=void 0,n=void 0;for(o=0,n=e.length;o<n;o++)if(o in e&&t.call(i,e[o],o)===this.BREAK)return}else for(var r in e)if(t.call(i,e[r],r)===this.BREAK)return}},defer:function(e){setTimeout(e,0)},debounce:function(e,t,i){var o=void 0;return function(){var n=this,r=arguments,a=i||!o;clearTimeout(o),o=setTimeout(function(){o=null,i||e.apply(n,r)},t),a&&e.apply(n,r)}},toArray:function(e){return e.toArray?e.toArray():g.call(e)},isUndefined:function(e){return void 0===e},isNull:function(e){return null===e},isNaN:function(e){function t(t){return e.apply(this,arguments)}return t.toString=function(){return e.toString()},t}(function(e){return isNaN(e)}),isArray:Array.isArray||function(e){return e.constructor===Array},isObject:function(e){return e===Object(e)},isNumber:function(e){return e===e+0},isString:function(e){return e===e+""},isBoolean:function(e){return!1===e||!0===e},isFunction:function(e){return"[object Function]"===Object.prototype.toString.call(e)}},x=[{litmus:b.isString,conversions:{THREE_CHAR_HEX:{read:function(e){var t=e.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);return null!==t&&{space:"HEX",hex:parseInt("0x"+t[1].toString()+t[1].toString()+t[2].toString()+t[2].toString()+t[3].toString()+t[3].toString(),0)}},write:t},SIX_CHAR_HEX:{read:function(e){var t=e.match(/^#([A-F0-9]{6})$/i);return null!==t&&{space:"HEX",hex:parseInt("0x"+t[1].toString(),0)}},write:t},CSS_RGB:{read:function(e){var t=e.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);return null!==t&&{space:"RGB",r:parseFloat(t[1]),g:parseFloat(t[2]),b:parseFloat(t[3])}},write:t},CSS_RGBA:{read:function(e){var t=e.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);return null!==t&&{space:"RGB",r:parseFloat(t[1]),g:parseFloat(t[2]),b:parseFloat(t[3]),a:parseFloat(t[4])}},write:t}}},{litmus:b.isNumber,conversions:{HEX:{read:function(e){return{space:"HEX",hex:e,conversionName:"HEX"}},write:function(e){return e.hex}}}},{litmus:b.isArray,conversions:{RGB_ARRAY:{read:function(e){return 3===e.length&&{space:"RGB",r:e[0],g:e[1],b:e[2]}},write:function(e){return[e.r,e.g,e.b]}},RGBA_ARRAY:{read:function(e){return 4===e.length&&{space:"RGB",r:e[0],g:e[1],b:e[2],a:e[3]}},write:function(e){return[e.r,e.g,e.b,e.a]}}}},{litmus:b.isObject,conversions:{RGBA_OBJ:{read:function(e){return!!(b.isNumber(e.r)&&b.isNumber(e.g)&&b.isNumber(e.b)&&b.isNumber(e.a))&&{space:"RGB",r:e.r,g:e.g,b:e.b,a:e.a}},write:function(e){return{r:e.r,g:e.g,b:e.b,a:e.a}}},RGB_OBJ:{read:function(e){return!!(b.isNumber(e.r)&&b.isNumber(e.g)&&b.isNumber(e.b))&&{space:"RGB",r:e.r,g:e.g,b:e.b}},write:function(e){return{r:e.r,g:e.g,b:e.b}}},HSVA_OBJ:{read:function(e){return!!(b.isNumber(e.h)&&b.isNumber(e.s)&&b.isNumber(e.v)&&b.isNumber(e.a))&&{space:"HSV",h:e.h,s:e.s,v:e.v,a:e.a}},write:function(e){return{h:e.h,s:e.s,v:e.v,a:e.a}}},HSV_OBJ:{read:function(e){return!!(b.isNumber(e.h)&&b.isNumber(e.s)&&b.isNumber(e.v))&&{space:"HSV",h:e.h,s:e.s,v:e.v}},write:function(e){return{h:e.h,s:e.s,v:e.v}}}}}],E=void 0,y=void 0,T=function(){y=!1;var e=arguments.length>1?b.toArray(arguments):arguments[0];return b.each(x,function(t){if(t.litmus(e))return b.each(t.conversions,function(t,i){if(E=t.read(e),!1===y&&!1!==E)return y=E,E.conversionName=i,E.conversion=t,b.BREAK}),b.BREAK}),y},w=void 0,S={hsv_to_rgb:function(e,t,i){var o=Math.floor(e/60)%6,n=e/60-Math.floor(e/60),r=i*(1-t),a=i*(1-n*t),s=i*(1-(1-n)*t),l=[[i,s,r],[a,i,r],[r,i,s],[r,a,i],[s,r,i],[i,r,a]][o];return{r:255*l[0],g:255*l[1],b:255*l[2]}},rgb_to_hsv:function(e,t,i){var o=Math.min(e,t,i),n=Math.max(e,t,i),r=n-o,a=void 0,s=void 0;return 0===n?{h:NaN,s:0,v:0}:(s=r/n,(a=(e===n?(t-i)/r:t===n?2+(i-e)/r:4+(e-t)/r)/6)<0&&(a+=1),{h:360*a,s:s,v:n/255})},rgb_to_hex:function(e,t,i){var o=this.hex_with_component(0,2,e);return o=this.hex_with_component(o,1,t),o=this.hex_with_component(o,0,i)},component_from_hex:function(e,t){return e>>8*t&255},hex_with_component:function(e,t,i){return i<<(w=8*t)|e&~(255<<w)}},A="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},R=function(e,t){if(!(e instanceof t))throw TypeError("Cannot call a class as a function")},C=function(){function e(e,t){for(var i=0;i<t.length;i++){var o=t[i];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}return function(t,i,o){return i&&e(t.prototype,i),o&&e(t,o),t}}(),D=function e(t,i,o){null===t&&(t=Function.prototype);var n=Object.getOwnPropertyDescriptor(t,i);if(void 0===n){var r=Object.getPrototypeOf(t);return null===r?void 0:e(r,i,o)}if("value"in n)return n.value;var a=n.get;if(void 0!==a)return a.call(o)},L=function(e,t){if("function"!=typeof t&&null!==t)throw TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)},N=function(e,t){if(!e)throw ReferenceError("this hasn't been initialised - super() hasn't been called");return t&&("object"==typeof t||"function"==typeof t)?t:e},U=function(){function e(){if(R(this,e),this.__state=T.apply(this,arguments),!1===this.__state)throw Error("Failed to interpret color arguments");this.__state.a=this.__state.a||1}return C(e,[{key:"toString",value:function(){return t(this)}},{key:"toHexString",value:function(){return t(this,!0)}},{key:"toOriginal",value:function(){return this.__state.conversion.write(this)}}]),e}();U.recalculateRGB=function(e,t,i){if("HEX"===e.__state.space)e.__state[t]=S.component_from_hex(e.__state.hex,i);else{if("HSV"!==e.__state.space)throw Error("Corrupted color state");b.extend(e.__state,S.hsv_to_rgb(e.__state.h,e.__state.s,e.__state.v))}},U.recalculateHSV=function(e){var t=S.rgb_to_hsv(e.r,e.g,e.b);b.extend(e.__state,{s:t.s,v:t.v}),b.isNaN(t.h)?b.isUndefined(e.__state.h)&&(e.__state.h=0):e.__state.h=t.h},U.COMPONENTS=["r","g","b","h","s","v","hex","a"],i(U.prototype,"r",2),i(U.prototype,"g",1),i(U.prototype,"b",0),o(U.prototype,"h"),o(U.prototype,"s"),o(U.prototype,"v"),Object.defineProperty(U.prototype,"a",{get:function(){return this.__state.a},set:function(e){this.__state.a=e}}),Object.defineProperty(U.prototype,"hex",{get:function(){return this.__state.space,this.__state.hex=S.rgb_to_hex(this.r,this.g,this.b),this.__state.hex},set:function(e){this.__state.space="HEX",this.__state.hex=e}});var F=function(){function e(t,i){R(this,e),this.initialValue=t[i],this.domElement=document.createElement("div"),this.object=t,this.property=i,this.__onChange=void 0,this.__onFinishChange=void 0}return C(e,[{key:"onChange",value:function(e){return this.__onChange=e,this}},{key:"onFinishChange",value:function(e){return this.__onFinishChange=e,this}},{key:"setValue",value:function(e){return this.object[this.property]=e,this.__onChange&&this.__onChange.call(this,e),this.updateDisplay(),this}},{key:"getValue",value:function(){return this.object[this.property]}},{key:"updateDisplay",value:function(){return this}},{key:"isModified",value:function(){return this.initialValue!==this.getValue()}}]),e}(),k={};b.each({HTMLEvents:["change"],MouseEvents:["click","mousemove","mousedown","mouseup","mouseover"],KeyboardEvents:["keydown"]},function(e,t){b.each(e,function(e){k[e]=t})});var B=/(\d+(\.\d+)?)px/,P={makeSelectable:function(e,t){void 0!==e&&void 0!==e.style&&(e.onselectstart=t?function(){return!1}:function(){},e.style.MozUserSelect=t?"auto":"none",e.style.KhtmlUserSelect=t?"auto":"none",e.unselectable=t?"on":"off")},makeFullscreen:function(e,t,i){var o=i,n=t;b.isUndefined(n)&&(n=!0),b.isUndefined(o)&&(o=!0),e.style.position="absolute",n&&(e.style.left=0,e.style.right=0),o&&(e.style.top=0,e.style.bottom=0)},fakeEvent:function(e,t,i,o){var n=i||{},r=k[t];if(!r)throw Error("Event type "+t+" not supported.");var a=document.createEvent(r);switch(r){case"MouseEvents":var s=n.x||n.clientX||0,l=n.y||n.clientY||0;a.initMouseEvent(t,n.bubbles||!1,n.cancelable||!0,window,n.clickCount||1,0,0,s,l,!1,!1,!1,!1,0,null);break;case"KeyboardEvents":var u=a.initKeyboardEvent||a.initKeyEvent;b.defaults(n,{cancelable:!0,ctrlKey:!1,altKey:!1,shiftKey:!1,metaKey:!1,keyCode:void 0,charCode:void 0}),u(t,n.bubbles||!1,n.cancelable,window,n.ctrlKey,n.altKey,n.shiftKey,n.metaKey,n.keyCode,n.charCode);break;default:a.initEvent(t,n.bubbles||!1,n.cancelable||!0)}b.defaults(a,o),e.dispatchEvent(a)},bind:function(e,t,i,o){return e.addEventListener?e.addEventListener(t,i,o||!1):e.attachEvent&&e.attachEvent("on"+t,i),P},unbind:function(e,t,i,o){return e.removeEventListener?e.removeEventListener(t,i,o||!1):e.detachEvent&&e.detachEvent("on"+t,i),P},addClass:function(e,t){if(void 0===e.className)e.className=t;else if(e.className!==t){var i=e.className.split(/ +/);-1===i.indexOf(t)&&(i.push(t),e.className=i.join(" ").replace(/^\s+/,"").replace(/\s+$/,""))}return P},removeClass:function(e,t){if(t)if(e.className===t)e.removeAttribute("class");else{var i=e.className.split(/ +/),o=i.indexOf(t);-1!==o&&(i.splice(o,1),e.className=i.join(" "))}else e.className=void 0;return P},hasClass:function(e,t){return RegExp("(?:^|\\s+)"+t+"(?:\\s+|$)").test(e.className)||!1},getWidth:function(e){var t=getComputedStyle(e);return n(t["border-left-width"])+n(t["border-right-width"])+n(t["padding-left"])+n(t["padding-right"])+n(t.width)},getHeight:function(e){var t=getComputedStyle(e);return n(t["border-top-width"])+n(t["border-bottom-width"])+n(t["padding-top"])+n(t["padding-bottom"])+n(t.height)},getOffset:function(e){var t=e,i={left:0,top:0};if(t.offsetParent)do i.left+=t.offsetLeft,i.top+=t.offsetTop,t=t.offsetParent;while(t)return i},isActive:function(e){return e===document.activeElement&&(e.type||e.href)}},I=function(e){function t(e,i){R(this,t);var o=N(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e,i));return o.__prev=o.getValue(),o.__checkbox=document.createElement("input"),o.__checkbox.setAttribute("type","checkbox"),P.bind(o.__checkbox,"change",function(){o.setValue(!o.__prev)},!1),o.domElement.appendChild(o.__checkbox),o.updateDisplay(),o}return L(t,F),C(t,[{key:"setValue",value:function(e){var i=D(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"setValue",this).call(this,e);return this.__onFinishChange&&this.__onFinishChange.call(this,this.getValue()),this.__prev=this.getValue(),i}},{key:"updateDisplay",value:function(){return!0===this.getValue()?(this.__checkbox.setAttribute("checked","checked"),this.__checkbox.checked=!0,this.__prev=!0):(this.__checkbox.checked=!1,this.__prev=!1),D(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"updateDisplay",this).call(this)}}]),t}(),M=function(e){function t(e,i,o){R(this,t);var n=N(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e,i)),r=o;if(n.__select=document.createElement("select"),b.isArray(r)){var a={};b.each(r,function(e){a[e]=e}),r=a}return b.each(r,function(e,t){var i=document.createElement("option");i.innerHTML=t,i.setAttribute("value",e),n.__select.appendChild(i)}),n.updateDisplay(),P.bind(n.__select,"change",function(){var e=this.options[this.selectedIndex].value;n.setValue(e)}),n.domElement.appendChild(n.__select),n}return L(t,F),C(t,[{key:"setValue",value:function(e){var i=D(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"setValue",this).call(this,e);return this.__onFinishChange&&this.__onFinishChange.call(this,this.getValue()),i}},{key:"updateDisplay",value:function(){return P.isActive(this.__select)?this:(this.__select.value=this.getValue(),D(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"updateDisplay",this).call(this))}}]),t}(),z=function(e){function t(e,i){function o(){r.setValue(r.__input.value)}R(this,t);var n=N(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e,i)),r=n;return n.__input=document.createElement("input"),n.__input.setAttribute("type","text"),P.bind(n.__input,"keyup",o),P.bind(n.__input,"change",o),P.bind(n.__input,"blur",function(){r.__onFinishChange&&r.__onFinishChange.call(r,r.getValue())}),P.bind(n.__input,"keydown",function(e){13===e.keyCode&&this.blur()}),n.updateDisplay(),n.domElement.appendChild(n.__input),n}return L(t,F),C(t,[{key:"updateDisplay",value:function(){return P.isActive(this.__input)||(this.__input.value=this.getValue()),D(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"updateDisplay",this).call(this)}}]),t}(),H=function(e){function t(e,i,o){R(this,t);var n=N(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e,i)),a=o||{};return n.__min=a.min,n.__max=a.max,n.__step=a.step,b.isUndefined(n.__step)?0===n.initialValue?n.__impliedStep=1:n.__impliedStep=Math.pow(10,Math.floor(Math.log(Math.abs(n.initialValue))/Math.LN10))/10:n.__impliedStep=n.__step,n.__precision=r(n.__impliedStep),n}return L(t,F),C(t,[{key:"setValue",value:function(e){var i=e;return void 0!==this.__min&&i<this.__min?i=this.__min:void 0!==this.__max&&i>this.__max&&(i=this.__max),void 0!==this.__step&&i%this.__step!=0&&(i=Math.round(i/this.__step)*this.__step),D(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"setValue",this).call(this,i)}},{key:"min",value:function(e){return this.__min=e,this}},{key:"max",value:function(e){return this.__max=e,this}},{key:"step",value:function(e){return this.__step=e,this.__impliedStep=e,this.__precision=r(e),this}}]),t}(),G=function(e){function t(e,i,o){function n(){l.__onFinishChange&&l.__onFinishChange.call(l,l.getValue())}function r(e){var t=u-e.clientY;l.setValue(l.getValue()+t*l.__impliedStep),u=e.clientY}function a(){P.unbind(window,"mousemove",r),P.unbind(window,"mouseup",a),n()}R(this,t);var s=N(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e,i,o));s.__truncationSuspended=!1;var l=s,u=void 0;return s.__input=document.createElement("input"),s.__input.setAttribute("type","text"),P.bind(s.__input,"change",function(){var e=parseFloat(l.__input.value);b.isNaN(e)||l.setValue(e)}),P.bind(s.__input,"blur",function(){n()}),P.bind(s.__input,"mousedown",function(e){P.bind(window,"mousemove",r),P.bind(window,"mouseup",a),u=e.clientY}),P.bind(s.__input,"keydown",function(e){13===e.keyCode&&(l.__truncationSuspended=!0,this.blur(),l.__truncationSuspended=!1,n())}),s.updateDisplay(),s.domElement.appendChild(s.__input),s}return L(t,H),C(t,[{key:"updateDisplay",value:function(){var e;return this.__input.value=this.__truncationSuspended?this.getValue():Math.round(this.getValue()*(e=Math.pow(10,this.__precision)))/e,D(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"updateDisplay",this).call(this)}}]),t}(),X=function(e){function t(e,i,o,n,r){function a(e){e.preventDefault();var t,i,o,n,r=d.__background.getBoundingClientRect();return d.setValue((t=e.clientX,i=r.left,o=r.right,(n=d.__min)+(t-i)/(o-i)*(d.__max-n))),!1}function s(){P.unbind(window,"mousemove",a),P.unbind(window,"mouseup",s),d.__onFinishChange&&d.__onFinishChange.call(d,d.getValue())}function l(e){var t,i,o,n=e.touches[0].clientX,r=d.__background.getBoundingClientRect();d.setValue((t=r.left,i=r.right,(o=d.__min)+(n-t)/(i-t)*(d.__max-o)))}function u(){P.unbind(window,"touchmove",l),P.unbind(window,"touchend",u),d.__onFinishChange&&d.__onFinishChange.call(d,d.getValue())}R(this,t);var c=N(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e,i,{min:o,max:n,step:r})),d=c;return c.__background=document.createElement("div"),c.__foreground=document.createElement("div"),P.bind(c.__background,"mousedown",function(e){document.activeElement.blur(),P.bind(window,"mousemove",a),P.bind(window,"mouseup",s),a(e)}),P.bind(c.__background,"touchstart",function(e){1===e.touches.length&&(P.bind(window,"touchmove",l),P.bind(window,"touchend",u),l(e))}),P.addClass(c.__background,"slider"),P.addClass(c.__foreground,"slider-fg"),c.updateDisplay(),c.__background.appendChild(c.__foreground),c.domElement.appendChild(c.__background),c}return L(t,H),C(t,[{key:"updateDisplay",value:function(){var e=(this.getValue()-this.__min)/(this.__max-this.__min);return this.__foreground.style.width=100*e+"%",D(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"updateDisplay",this).call(this)}}]),t}(),V=function(e){function t(e,i,o){R(this,t);var n=N(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e,i));return n.__button=document.createElement("div"),n.__button.innerHTML=void 0===o?"Fire":o,P.bind(n.__button,"click",function(e){return e.preventDefault(),n.fire(),!1}),P.addClass(n.__button,"button"),n.domElement.appendChild(n.__button),n}return L(t,F),C(t,[{key:"fire",value:function(){this.__onChange&&this.__onChange.call(this),this.getValue().call(this.object),this.__onFinishChange&&this.__onFinishChange.call(this,this.getValue())}}]),t}(),Y=function(e){function t(e,i){function o(e){c(e),P.bind(window,"mousemove",c),P.bind(window,"touchmove",c),P.bind(window,"mouseup",r),P.bind(window,"touchend",r)}function n(e){d(e),P.bind(window,"mousemove",d),P.bind(window,"touchmove",d),P.bind(window,"mouseup",s),P.bind(window,"touchend",s)}function r(){P.unbind(window,"mousemove",c),P.unbind(window,"touchmove",c),P.unbind(window,"mouseup",r),P.unbind(window,"touchend",r),u()}function s(){P.unbind(window,"mousemove",d),P.unbind(window,"touchmove",d),P.unbind(window,"mouseup",s),P.unbind(window,"touchend",s),u()}function l(){var e=T(this.value);!1!==e?(_.__color.__state=e,_.setValue(_.__color.toOriginal())):this.value=_.__color.toString()}function u(){_.__onFinishChange&&_.__onFinishChange.call(_,_.__color.toOriginal())}function c(e){-1===e.type.indexOf("touch")&&e.preventDefault();var t=_.__saturation_field.getBoundingClientRect(),i=e.touches&&e.touches[0]||e,o=i.clientX,n=i.clientY,r=(o-t.left)/(t.right-t.left),a=1-(n-t.top)/(t.bottom-t.top);return a>1?a=1:a<0&&(a=0),r>1?r=1:r<0&&(r=0),_.__color.v=a,_.__color.s=r,_.setValue(_.__color.toOriginal()),!1}function d(e){-1===e.type.indexOf("touch")&&e.preventDefault();var t=_.__hue_field.getBoundingClientRect(),i=1-((e.touches&&e.touches[0]||e).clientY-t.top)/(t.bottom-t.top);return i>1?i=1:i<0&&(i=0),_.__color.h=360*i,_.setValue(_.__color.toOriginal()),!1}R(this,t);var f,h=N(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e,i));h.__color=new U(h.getValue()),h.__temp=new U(0);var _=h;h.domElement=document.createElement("div"),P.makeSelectable(h.domElement,!1),h.__selector=document.createElement("div"),h.__selector.className="selector",h.__saturation_field=document.createElement("div"),h.__saturation_field.className="saturation-field",h.__field_knob=document.createElement("div"),h.__field_knob.className="field-knob",h.__field_knob_border="2px solid ",h.__hue_knob=document.createElement("div"),h.__hue_knob.className="hue-knob",h.__hue_field=document.createElement("div"),h.__hue_field.className="hue-field",h.__input=document.createElement("input"),h.__input.type="text",h.__input_textShadow="0 1px 1px ",P.bind(h.__input,"keydown",function(e){13===e.keyCode&&l.call(this)}),P.bind(h.__input,"blur",l),P.bind(h.__selector,"mousedown",function(){P.addClass(this,"drag").bind(window,"mouseup",function(){P.removeClass(_.__selector,"drag")})}),P.bind(h.__selector,"touchstart",function(){P.addClass(this,"drag").bind(window,"touchend",function(){P.removeClass(_.__selector,"drag")})});var m=document.createElement("div");return b.extend(h.__selector.style,{width:"122px",height:"102px",padding:"3px",backgroundColor:"#222",boxShadow:"0px 1px 3px rgba(0,0,0,0.3)"}),b.extend(h.__field_knob.style,{position:"absolute",width:"12px",height:"12px",border:h.__field_knob_border+(h.__color.v<.5?"#fff":"#000"),boxShadow:"0px 1px 3px rgba(0,0,0,0.5)",borderRadius:"12px",zIndex:1}),b.extend(h.__hue_knob.style,{position:"absolute",width:"15px",height:"2px",borderRight:"4px solid #fff",zIndex:1}),b.extend(h.__saturation_field.style,{width:"100px",height:"100px",border:"1px solid #555",marginRight:"3px",display:"inline-block",cursor:"pointer"}),b.extend(m.style,{width:"100%",height:"100%",background:"none"}),a(m,"top","rgba(0,0,0,0)","#000"),b.extend(h.__hue_field.style,{width:"15px",height:"100px",border:"1px solid #555",cursor:"ns-resize",position:"absolute",top:"3px",right:"3px"}),(f=h.__hue_field).style.background="",f.style.cssText+="background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);",f.style.cssText+="background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);",f.style.cssText+="background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);",f.style.cssText+="background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);",f.style.cssText+="background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);",b.extend(h.__input.style,{outline:"none",textAlign:"center",color:"#fff",border:0,fontWeight:"bold",textShadow:h.__input_textShadow+"rgba(0,0,0,0.7)"}),P.bind(h.__saturation_field,"mousedown",o),P.bind(h.__saturation_field,"touchstart",o),P.bind(h.__field_knob,"mousedown",o),P.bind(h.__field_knob,"touchstart",o),P.bind(h.__hue_field,"mousedown",n),P.bind(h.__hue_field,"touchstart",n),h.__saturation_field.appendChild(m),h.__selector.appendChild(h.__field_knob),h.__selector.appendChild(h.__saturation_field),h.__selector.appendChild(h.__hue_field),h.__hue_field.appendChild(h.__hue_knob),h.domElement.appendChild(h.__input),h.domElement.appendChild(h.__selector),h.updateDisplay(),h}return L(t,F),C(t,[{key:"updateDisplay",value:function(){var e=T(this.getValue());if(!1!==e){var t=!1;b.each(U.COMPONENTS,function(i){if(!b.isUndefined(e[i])&&!b.isUndefined(this.__color.__state[i])&&e[i]!==this.__color.__state[i])return t=!0,{}},this),t&&b.extend(this.__color.__state,e)}b.extend(this.__temp.__state,this.__color.__state),this.__temp.a=1;var i=255*(this.__color.v<.5||this.__color.s>.5),o=255-i;b.extend(this.__field_knob.style,{marginLeft:100*this.__color.s-7+"px",marginTop:100*(1-this.__color.v)-7+"px",backgroundColor:this.__temp.toHexString(),border:this.__field_knob_border+"rgb("+i+","+i+","+i+")"}),this.__hue_knob.style.marginTop=100*(1-this.__color.h/360)+"px",this.__temp.s=1,this.__temp.v=1,a(this.__saturation_field,"left","#fff",this.__temp.toHexString()),this.__input.value=this.__color.toString(),b.extend(this.__input.style,{backgroundColor:this.__color.toHexString(),color:"rgb("+i+","+i+","+i+")",textShadow:this.__input_textShadow+"rgba("+o+","+o+","+o+",.7)"})}}]),t}(),j=["-moz-","-o-","-webkit-","-ms-",""],W=function(e,t){var i=e[t];return b.isArray(arguments[2])||b.isObject(arguments[2])?new M(e,t,arguments[2]):b.isNumber(i)?b.isNumber(arguments[2])&&b.isNumber(arguments[3])?b.isNumber(arguments[4])?new X(e,t,arguments[2],arguments[3],arguments[4]):new X(e,t,arguments[2],arguments[3]):b.isNumber(arguments[4])?new G(e,t,{min:arguments[2],max:arguments[3],step:arguments[4]}):new G(e,t,{min:arguments[2],max:arguments[3]}):b.isString(i)?new z(e,t):b.isFunction(i)?new V(e,t,""):b.isBoolean(i)?new I(e,t):null},K=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(e){setTimeout(e,1e3/60)},J=function(){function e(){R(this,e),this.backgroundElement=document.createElement("div"),b.extend(this.backgroundElement.style,{backgroundColor:"rgba(0,0,0,0.8)",top:0,left:0,display:"none",zIndex:"1000",opacity:0,WebkitTransition:"opacity 0.2s linear",transition:"opacity 0.2s linear"}),P.makeFullscreen(this.backgroundElement),this.backgroundElement.style.position="fixed",this.domElement=document.createElement("div"),b.extend(this.domElement.style,{position:"fixed",display:"none",zIndex:"1001",opacity:0,WebkitTransition:"-webkit-transform 0.2s ease-out, opacity 0.2s linear",transition:"transform 0.2s ease-out, opacity 0.2s linear"}),document.body.appendChild(this.backgroundElement),document.body.appendChild(this.domElement);var t=this;P.bind(this.backgroundElement,"click",function(){t.hide()})}return C(e,[{key:"show",value:function(){var e=this;this.backgroundElement.style.display="block",this.domElement.style.display="block",this.domElement.style.opacity=0,this.domElement.style.webkitTransform="scale(1.1)",this.layout(),b.defer(function(){e.backgroundElement.style.opacity=1,e.domElement.style.opacity=1,e.domElement.style.webkitTransform="scale(1)"})}},{key:"hide",value:function(){var e=this,t=function t(){e.domElement.style.display="none",e.backgroundElement.style.display="none",P.unbind(e.domElement,"webkitTransitionEnd",t),P.unbind(e.domElement,"transitionend",t),P.unbind(e.domElement,"oTransitionEnd",t)};P.bind(this.domElement,"webkitTransitionEnd",t),P.bind(this.domElement,"transitionend",t),P.bind(this.domElement,"oTransitionEnd",t),this.backgroundElement.style.opacity=0,this.domElement.style.opacity=0,this.domElement.style.webkitTransform="scale(1.1)"}},{key:"layout",value:function(){this.domElement.style.left=window.innerWidth/2-P.getWidth(this.domElement)/2+"px",this.domElement.style.top=window.innerHeight/2-P.getHeight(this.domElement)/2+"px"}}]),e}();({load:function(e,t){var i=t||document,o=i.createElement("link");o.type="text/css",o.rel="stylesheet",o.href=e,i.getElementsByTagName("head")[0].appendChild(o)},inject:function(e,t){var i=t||document,o=document.createElement("style");o.type="text/css",o.innerHTML=e;var n=i.getElementsByTagName("head")[0];try{n.appendChild(o)}catch{}}}).inject(function(e){if(e&&1){var t=document.createElement("style");return t.setAttribute("type","text/css"),t.innerHTML=e,document.head.appendChild(t),e}}(`.dg ul{list-style:none;margin:0;padding:0;width:100%;clear:both}.dg.ac{position:fixed;top:0;left:0;right:0;height:0;z-index:0}.dg:not(.ac) .main{overflow:hidden}.dg.main{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear}.dg.main.taller-than-window{overflow-y:auto}.dg.main.taller-than-window .close-button{opacity:1;margin-top:-1px;border-top:1px solid #2c2c2c}.dg.main ul.closed .close-button{opacity:1 !important}.dg.main:hover .close-button,.dg.main .close-button.drag{opacity:1}.dg.main .close-button{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear;border:0;line-height:19px;height:20px;cursor:pointer;text-align:center;background-color:#000}.dg.main .close-button.close-top{position:relative}.dg.main .close-button.close-bottom{position:absolute}.dg.main .close-button:hover{background-color:#111}.dg.a{float:right;margin-right:15px;overflow-y:visible}.dg.a.has-save>ul.close-top{margin-top:0}.dg.a.has-save>ul.close-bottom{margin-top:27px}.dg.a.has-save>ul.closed{margin-top:0}.dg.a .save-row{top:0;z-index:1002}.dg.a .save-row.close-top{position:relative}.dg.a .save-row.close-bottom{position:fixed}.dg li{-webkit-transition:height .1s ease-out;-o-transition:height .1s ease-out;-moz-transition:height .1s ease-out;transition:height .1s ease-out;-webkit-transition:overflow .1s linear;-o-transition:overflow .1s linear;-moz-transition:overflow .1s linear;transition:overflow .1s linear}.dg li:not(.folder){cursor:auto;height:27px;line-height:27px;padding:0 4px 0 5px}.dg li.folder{padding:0;border-left:4px solid rgba(0,0,0,0)}.dg li.title{cursor:pointer;margin-left:-4px}.dg .closed li:not(.title),.dg .closed ul li,.dg .closed ul li>*{height:0;overflow:hidden;border:0}.dg .cr{clear:both;padding-left:3px;height:27px;overflow:hidden}.dg .property-name{cursor:default;float:left;clear:left;width:40%;overflow:hidden;text-overflow:ellipsis}.dg .c{float:left;width:60%;position:relative}.dg .c input[type=text]{border:0;margin-top:4px;padding:3px;width:100%;float:right}.dg .has-slider input[type=text]{width:30%;margin-left:0}.dg .slider{float:left;width:66%;margin-left:-5px;margin-right:0;height:19px;margin-top:4px}.dg .slider-fg{height:100%}.dg .c input[type=checkbox]{margin-top:7px}.dg .c select{margin-top:5px}.dg .cr.function,.dg .cr.function .property-name,.dg .cr.function *,.dg .cr.boolean,.dg .cr.boolean *{cursor:pointer}.dg .cr.color{overflow:visible}.dg .selector{display:none;position:absolute;margin-left:-9px;margin-top:23px;z-index:10}.dg .c:hover .selector,.dg .selector.drag{display:block}.dg li.save-row{padding:0}.dg li.save-row .button{display:inline-block;padding:0px 6px}.dg.dialogue{background-color:#222;width:460px;padding:15px;font-size:13px;line-height:15px}#dg-new-constructor{padding:10px;color:#222;font-family:Monaco, monospace;font-size:10px;border:0;resize:none;box-shadow:inset 1px 1px 1px #888;word-wrap:break-word;margin:12px 0;display:block;width:440px;overflow-y:scroll;height:100px;position:relative}#dg-local-explain{display:none;font-size:11px;line-height:17px;border-radius:3px;background-color:#333;padding:8px;margin-top:10px}#dg-local-explain code{font-size:10px}#dat-gui-save-locally{display:none}.dg{color:#eee;font:11px 'Lucida Grande', sans-serif;text-shadow:0 -1px 0 #111}.dg.main::-webkit-scrollbar{width:5px;background:#1a1a1a}.dg.main::-webkit-scrollbar-corner{height:0;display:none}.dg.main::-webkit-scrollbar-thumb{border-radius:5px;background:#676767}.dg li:not(.folder){background:#1a1a1a;border-bottom:1px solid #2c2c2c}.dg li.save-row{line-height:25px;background:#dad5cb;border:0}.dg li.save-row select{margin-left:5px;width:108px}.dg li.save-row .button{margin-left:5px;margin-top:1px;border-radius:2px;font-size:9px;line-height:7px;padding:4px 4px 5px 4px;background:#c5bdad;color:#fff;text-shadow:0 1px 0 #b0a58f;box-shadow:0 -1px 0 #b0a58f;cursor:pointer}.dg li.save-row .button.gears{background:#c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;height:7px;width:8px}.dg li.save-row .button:hover{background-color:#bab19e;box-shadow:0 -1px 0 #b0a58f}.dg li.folder{border-bottom:0}.dg li.title{padding-left:16px;background:#000 url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.2)}.dg .closed li.title{background-image:url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==)}.dg .cr.boolean{border-left:3px solid #806787}.dg .cr.color{border-left:3px solid}.dg .cr.function{border-left:3px solid #e61d5f}.dg .cr.number{border-left:3px solid #2FA1D6}.dg .cr.number input[type=text]{color:#2FA1D6}.dg .cr.string{border-left:3px solid #1ed36f}.dg .cr.string input[type=text]{color:#1ed36f}.dg .cr.function:hover,.dg .cr.boolean:hover{background:#111}.dg .c input[type=text]{background:#303030;outline:none}.dg .c input[type=text]:hover{background:#3c3c3c}.dg .c input[type=text]:focus{background:#494949;color:#fff}.dg .c .slider{background:#303030;cursor:ew-resize}.dg .c .slider-fg{background:#2FA1D6;max-width:100%}.dg .c .slider:hover{background:#3c3c3c}.dg .c .slider:hover .slider-fg{background:#44abda}
`));var Q="Default",q=function(){try{return!!window.localStorage}catch{return!1}}(),Z=void 0,$=!0,ee=void 0,et=!1,ei=[],eo=function e(t){var i,o=this,n=t||{};this.domElement=document.createElement("div"),this.__ul=document.createElement("ul"),this.domElement.appendChild(this.__ul),P.addClass(this.domElement,"dg"),this.__folders={},this.__controllers=[],this.__rememberedObjects=[],this.__rememberedObjectIndecesToControllers=[],this.__listening=[],n=b.defaults(n,{closeOnTop:!1,autoPlace:!0,width:e.DEFAULT_WIDTH}),n=b.defaults(n,{resizable:n.autoPlace,hideable:n.autoPlace}),b.isUndefined(n.load)?n.load={preset:Q}:n.preset&&(n.load.preset=n.preset),b.isUndefined(n.parent)&&n.hideable&&ei.push(this),n.resizable=b.isUndefined(n.parent)&&n.resizable,n.autoPlace&&b.isUndefined(n.scrollable)&&(n.scrollable=!0);var r=q&&"true"===localStorage.getItem(f(this,"isLocal")),a=void 0,l=void 0;if(Object.defineProperties(this,{parent:{get:function(){return n.parent}},scrollable:{get:function(){return n.scrollable}},autoPlace:{get:function(){return n.autoPlace}},closeOnTop:{get:function(){return n.closeOnTop}},preset:{get:function(){return o.parent?o.getRoot().preset:n.load.preset},set:function(e){o.parent?o.getRoot().preset=e:n.load.preset=e,function(e){for(var t=0;t<e.__preset_select.length;t++)e.__preset_select[t].value===e.preset&&(e.__preset_select.selectedIndex=t)}(this),o.revert()}},width:{get:function(){return n.width},set:function(e){n.width=e,m(o,e)}},name:{get:function(){return n.name},set:function(e){n.name=e,l&&(l.innerHTML=n.name)}},closed:{get:function(){return n.closed},set:function(t){n.closed=t,n.closed?P.addClass(o.__ul,e.CLASS_CLOSED):P.removeClass(o.__ul,e.CLASS_CLOSED),this.onResize(),o.__closeButton&&(o.__closeButton.innerHTML=t?e.TEXT_OPEN:e.TEXT_CLOSED)}},load:{get:function(){return n.load}},useLocalStorage:{get:function(){return r},set:function(e){q&&(r=e,e?P.bind(window,"unload",a):P.unbind(window,"unload",a),localStorage.setItem(f(o,"isLocal"),e))}}}),b.isUndefined(n.parent)){if(n.closed=!1,P.addClass(this.domElement,e.CLASS_MAIN),P.makeSelectable(this.domElement,!1),q&&r){o.useLocalStorage=!0;var u=localStorage.getItem(f(this,"gui"));u&&(n.load=JSON.parse(u))}this.__closeButton=document.createElement("div"),this.__closeButton.innerHTML=e.TEXT_CLOSED,P.addClass(this.__closeButton,e.CLASS_CLOSE_BUTTON),n.closeOnTop?(P.addClass(this.__closeButton,e.CLASS_CLOSE_TOP),this.domElement.insertBefore(this.__closeButton,this.domElement.childNodes[0])):(P.addClass(this.__closeButton,e.CLASS_CLOSE_BOTTOM),this.domElement.appendChild(this.__closeButton)),P.bind(this.__closeButton,"click",function(){o.closed=!o.closed})}else{void 0===n.closed&&(n.closed=!0);var c=document.createTextNode(n.name);P.addClass(c,"controller-name"),l=s(o,c),P.addClass(this.__ul,e.CLASS_CLOSED),P.addClass(l,"title"),P.bind(l,"click",function(e){return e.preventDefault(),o.closed=!o.closed,!1}),n.closed||(this.closed=!1)}n.autoPlace&&(b.isUndefined(n.parent)&&($&&(ee=document.createElement("div"),P.addClass(ee,"dg"),P.addClass(ee,e.CLASS_AUTO_PLACE_CONTAINER),document.body.appendChild(ee),$=!1),ee.appendChild(this.domElement),P.addClass(this.domElement,e.CLASS_AUTO_PLACE)),this.parent||m(o,n.width)),this.__resizeHandler=function(){o.onResizeDebounced()},P.bind(window,"resize",this.__resizeHandler),P.bind(this.__ul,"webkitTransitionEnd",this.__resizeHandler),P.bind(this.__ul,"transitionend",this.__resizeHandler),P.bind(this.__ul,"oTransitionEnd",this.__resizeHandler),this.onResize(),n.resizable&&function(e){function t(t){return t.preventDefault(),e.width+=n-t.clientX,e.onResize(),n=t.clientX,!1}function i(){P.removeClass(e.__closeButton,eo.CLASS_DRAG),P.unbind(window,"mousemove",t),P.unbind(window,"mouseup",i)}function o(o){return o.preventDefault(),n=o.clientX,P.addClass(e.__closeButton,eo.CLASS_DRAG),P.bind(window,"mousemove",t),P.bind(window,"mouseup",i),!1}var n=void 0;e.__resize_handle=document.createElement("div"),b.extend(e.__resize_handle.style,{width:"6px",marginLeft:"-3px",height:"200px",cursor:"ew-resize",position:"absolute"}),P.bind(e.__resize_handle,"mousedown",o),P.bind(e.__closeButton,"mousedown",o),e.domElement.insertBefore(e.__resize_handle,e.domElement.firstElementChild)}(this),a=function(){q&&"true"===localStorage.getItem(f(o,"isLocal"))&&localStorage.setItem(f(o,"gui"),JSON.stringify(o.getSaveObject()))},this.saveToLocalStorageIfPossible=a,n.parent||(i=o.getRoot(),i.width+=1,b.defer(function(){i.width-=1}))};eo.toggleHide=function(){et=!et,b.each(ei,function(e){e.domElement.style.display=et?"none":""})},eo.CLASS_AUTO_PLACE="a",eo.CLASS_AUTO_PLACE_CONTAINER="ac",eo.CLASS_MAIN="main",eo.CLASS_CONTROLLER_ROW="cr",eo.CLASS_TOO_TALL="taller-than-window",eo.CLASS_CLOSED="closed",eo.CLASS_CLOSE_BUTTON="close-button",eo.CLASS_CLOSE_TOP="close-top",eo.CLASS_CLOSE_BOTTOM="close-bottom",eo.CLASS_DRAG="drag",eo.DEFAULT_WIDTH=245,eo.TEXT_CLOSED="Close Controls",eo.TEXT_OPEN="Open Controls",eo._keydownHandler=function(e){"text"===document.activeElement.type||72!==e.which&&72!==e.keyCode||eo.toggleHide()},P.bind(window,"keydown",eo._keydownHandler,!1),b.extend(eo.prototype,{add:function(e,t){return d(this,e,t,{factoryArgs:Array.prototype.slice.call(arguments,2)})},addColor:function(e,t){return d(this,e,t,{color:!0})},remove:function(e){this.__ul.removeChild(e.__li),this.__controllers.splice(this.__controllers.indexOf(e),1);var t=this;b.defer(function(){t.onResize()})},destroy:function(){if(this.parent)throw Error("Only the root GUI should be removed with .destroy(). For subfolders, use gui.removeFolder(folder) instead.");this.autoPlace&&ee.removeChild(this.domElement);var e=this;b.each(this.__folders,function(t){e.removeFolder(t)}),P.unbind(window,"keydown",eo._keydownHandler,!1),l(this)},addFolder:function(e){if(void 0!==this.__folders[e])throw Error('You already have a folder in this GUI by the name "'+e+'"');var t={name:e,parent:this};t.autoPlace=this.autoPlace,this.load&&this.load.folders&&this.load.folders[e]&&(t.closed=this.load.folders[e].closed,t.load=this.load.folders[e]);var i=new eo(t);this.__folders[e]=i;var o=s(this,i.domElement);return P.addClass(o,"folder"),i},removeFolder:function(e){this.__ul.removeChild(e.domElement.parentElement),delete this.__folders[e.name],this.load&&this.load.folders&&this.load.folders[e.name]&&delete this.load.folders[e.name],l(e);var t=this;b.each(e.__folders,function(t){e.removeFolder(t)}),b.defer(function(){t.onResize()})},open:function(){this.closed=!1},close:function(){this.closed=!0},onResize:function(){var e=this.getRoot();if(e.scrollable){var t=P.getOffset(e.__ul).top,i=0;b.each(e.__ul.childNodes,function(t){e.autoPlace&&t===e.__save_row||(i+=P.getHeight(t))}),window.innerHeight-t-20<i?(P.addClass(e.domElement,eo.CLASS_TOO_TALL),e.__ul.style.height=window.innerHeight-t-20+"px"):(P.removeClass(e.domElement,eo.CLASS_TOO_TALL),e.__ul.style.height="auto")}e.__resize_handle&&b.defer(function(){e.__resize_handle.style.height=e.__ul.offsetHeight+"px"}),e.__closeButton&&(e.__closeButton.style.width=e.width+"px")},onResizeDebounced:b.debounce(function(){this.onResize()},50),remember:function(){if(b.isUndefined(Z)&&((Z=new J).domElement.innerHTML=`<div id="dg-save" class="dg dialogue">

  Here's the new load parameter for your <code>GUI</code>'s constructor:

  <textarea id="dg-new-constructor"></textarea>

  <div id="dg-save-locally">

    <input id="dg-local-storage" type="checkbox"/> Automatically save
    values to <code>localStorage</code> on exit.

    <div id="dg-local-explain">The values saved to <code>localStorage</code> will
      override those passed to <code>dat.GUI</code>'s constructor. This makes it
      easier to work incrementally, but <code>localStorage</code> is fragile,
      and your friends may not see the same values you do.

    </div>

  </div>

</div>`),this.parent)throw Error("You can only call remember on a top level GUI.");var e=this;b.each(Array.prototype.slice.call(arguments),function(t){0===e.__rememberedObjects.length&&function(e){var t=e.__save_row=document.createElement("li");P.addClass(e.domElement,"has-save"),e.__ul.insertBefore(t,e.__ul.firstChild),P.addClass(t,"save-row");var i=document.createElement("span");i.innerHTML="&nbsp;",P.addClass(i,"button gears");var o=document.createElement("span");o.innerHTML="Save",P.addClass(o,"button"),P.addClass(o,"save");var n=document.createElement("span");n.innerHTML="New",P.addClass(n,"button"),P.addClass(n,"save-as");var r=document.createElement("span");r.innerHTML="Revert",P.addClass(r,"button"),P.addClass(r,"revert");var a=e.__preset_select=document.createElement("select");if(e.load&&e.load.remembered?b.each(e.load.remembered,function(t,i){h(e,i,i===e.preset)}):h(e,Q,!1),P.bind(a,"change",function(){for(var t=0;t<e.__preset_select.length;t++)e.__preset_select[t].innerHTML=e.__preset_select[t].value;e.preset=this.value}),t.appendChild(a),t.appendChild(i),t.appendChild(o),t.appendChild(n),t.appendChild(r),q){var s=document.getElementById("dg-local-explain"),l=document.getElementById("dg-local-storage");document.getElementById("dg-save-locally").style.display="block","true"===localStorage.getItem(f(e,"isLocal"))&&l.setAttribute("checked","checked"),_(e,s),P.bind(l,"change",function(){e.useLocalStorage=!e.useLocalStorage,_(e,s)})}var u=document.getElementById("dg-new-constructor");P.bind(u,"keydown",function(e){e.metaKey&&(67===e.which||67===e.keyCode)&&Z.hide()}),P.bind(i,"click",function(){u.innerHTML=JSON.stringify(e.getSaveObject(),void 0,2),Z.show(),u.focus(),u.select()}),P.bind(o,"click",function(){e.save()}),P.bind(n,"click",function(){var t=prompt("Enter a new preset name.");t&&e.saveAs(t)}),P.bind(r,"click",function(){e.revert()})}(e),-1===e.__rememberedObjects.indexOf(t)&&e.__rememberedObjects.push(t)}),this.autoPlace&&m(this,this.width)},getRoot:function(){for(var e=this;e.parent;)e=e.parent;return e},getSaveObject:function(){var e=this.load;return e.closed=this.closed,this.__rememberedObjects.length>0&&(e.preset=this.preset,e.remembered||(e.remembered={}),e.remembered[this.preset]=p(this)),e.folders={},b.each(this.__folders,function(t,i){e.folders[i]=t.getSaveObject()}),e},save:function(){this.load.remembered||(this.load.remembered={}),this.load.remembered[this.preset]=p(this),u(this,!1),this.saveToLocalStorageIfPossible()},saveAs:function(e){this.load.remembered||(this.load.remembered={},this.load.remembered[Q]=p(this,!0)),this.load.remembered[e]=p(this),this.preset=e,h(this,e,!0),this.saveToLocalStorageIfPossible()},revert:function(e){b.each(this.__controllers,function(t){this.getRoot().load.remembered?c(e||this.getRoot(),t):t.setValue(t.initialValue),t.__onFinishChange&&t.__onFinishChange.call(t,t.getValue())},this),b.each(this.__folders,function(e){e.revert(e)}),e||u(this.getRoot(),!1)},listen:function(e){var t=0===this.__listening.length;this.__listening.push(e),t&&function e(t){0!==t.length&&K.call(window,function(){e(t)}),b.each(t,function(e){e.updateDisplay()})}(this.__listening)},updateDisplay:function(){b.each(this.__controllers,function(e){e.updateDisplay()}),b.each(this.__folders,function(e){e.updateDisplay()})}});var en={Color:U,math:S,interpret:T},er={Controller:F,BooleanController:I,OptionController:M,StringController:z,NumberController:H,NumberControllerBox:G,NumberControllerSlider:X,FunctionController:V,ColorController:Y},ea={dom:P},es={GUI:eo};e.color=en,e.controllers=er,e.dom=ea,e.gui=es,e.GUI=eo,e.default={color:en,controllers:er,dom:ea,gui:es,GUI:eo},Object.defineProperty(e,"__esModule",{value:!0})}(i),function(e,t){var i;let o,n,r,a,s,l,u,c,d,f,h,_,m,p,v,g,b,x,E,y,T;function w(){this.id=-1,this.texcoordX=0,this.texcoordY=0,this.prevTexcoordX=0,this.prevTexcoordY=0,this.deltaX=0,this.deltaY=0,this.down=!1,this.moved=!1,this.color=[30,0,300]}eC(),t={IMMEDIATE:!0,TRIGGER:"hover",AUTO:!1,INTERVAL:3e3,SIM_RESOLUTION:128,DYE_RESOLUTION:1024,CAPTURE_RESOLUTION:512,DENSITY_DISSIPATION:1,VELOCITY_DISSIPATION:.2,PRESSURE:.8,PRESSURE_ITERATIONS:20,CURL:30,SPLAT_RADIUS:.25,SPLAT_FORCE:6e3,SPLAT_COUNT:Number.parseInt(20*Math.random())+5,SHADING:!0,COLORFUL:!0,COLOR_UPDATE_SPEED:10,PAUSED:!1,BACK_COLOR:{r:0,g:0,b:0},TRANSPARENT:!1,BLOOM:!0,BLOOM_ITERATIONS:8,BLOOM_RESOLUTION:256,BLOOM_INTENSITY:.8,BLOOM_THRESHOLD:.6,BLOOM_SOFT_KNEE:.7,SUNRAYS:!0,SUNRAYS_RESOLUTION:196,SUNRAYS_WEIGHT:1,...t};let S=[],A=[],R=[];S.push(new w);let{gl:C,ext:D}=(v={alpha:!0,depth:!1,stencil:!1,antialias:!1,preserveDrawingBuffer:!1},(b=!!(g=(i=e).getContext("webgl2",v)))||(g=i.getContext("webgl",v)||i.getContext("experimental-webgl",v)),b?(g.getExtension("EXT_color_buffer_float"),h=g.getExtension("OES_texture_float_linear")):(f=g.getExtension("OES_texture_half_float"),h=g.getExtension("OES_texture_half_float_linear")),g.clearColor(0,0,0,1),x=b?g.HALF_FLOAT:f.HALF_FLOAT_OES,b?(_=L(g,g.RGBA16F,g.RGBA,x),m=L(g,g.RG16F,g.RG,x),p=L(g,g.R16F,g.RED,x)):(_=L(g,g.RGBA,g.RGBA,x),m=L(g,g.RGBA,g.RGBA,x),p=L(g,g.RGBA,g.RGBA,x)),{gl:g,ext:{formatRGBA:_,formatRG:m,formatR:p,halfFloatTexType:x,supportLinearFiltering:h}});function L(e,t,i,o){var n,r,a,s;let l,u;if(n=e,r=t,a=i,s=o,l=n.createTexture(),n.bindTexture(n.TEXTURE_2D,l),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.NEAREST),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.texImage2D(n.TEXTURE_2D,0,r,4,4,0,a,s,null),u=n.createFramebuffer(),n.bindFramebuffer(n.FRAMEBUFFER,u),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,l,0),n.checkFramebufferStatus(n.FRAMEBUFFER)!==n.FRAMEBUFFER_COMPLETE)switch(t){case e.R16F:return L(e,e.RG16F,e.RG,o);case e.RG16F:return L(e,e.RGBA16F,e.RGBA,o);default:return null}return{internalFormat:t,format:i}}/Mobi|Android/i.test(navigator.userAgent)&&(t.DYE_RESOLUTION=512),D.supportLinearFiltering||(t.DYE_RESOLUTION=512,t.SHADING=!1,t.BLOOM=!1,t.SUNRAYS=!1);class N{constructor(e,t){this.uniforms={},this.program=U(e,t),this.uniforms=F(this.program)}bind(){C.useProgram(this.program)}}function U(e,t){let i=C.createProgram();if(C.attachShader(i,e),C.attachShader(i,t),C.linkProgram(i),!C.getProgramParameter(i,C.LINK_STATUS))throw C.getProgramInfoLog(i);return i}function F(e){let t=[],i=C.getProgramParameter(e,C.ACTIVE_UNIFORMS);for(let o=0;o<i;o++){let i=C.getActiveUniform(e,o).name;t[i]=C.getUniformLocation(e,i)}return t}function k(e,t,i){t=function(e,t){if(!t)return e;let i="";return t.forEach(e=>{i+=`#define ${e}
`}),i+e}(t,i);let o=C.createShader(e);if(C.shaderSource(o,t),C.compileShader(o),!C.getShaderParameter(o,C.COMPILE_STATUS))throw C.getShaderInfoLog(o);return o}let B=k(C.VERTEX_SHADER,`
    precision highp float;
    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform vec2 texelSize;
    void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`),P=k(C.VERTEX_SHADER,`
    precision highp float;
    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    uniform vec2 texelSize;
    void main () {
        vUv = aPosition * 0.5 + 0.5;
        float offset = 1.33333333;
        vL = vUv - texelSize * offset;
        vR = vUv + texelSize * offset;
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`),I=k(C.FRAGMENT_SHADER,`
    precision mediump float;
    precision mediump sampler2D;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    uniform sampler2D uTexture;
    void main () {
        vec4 sum = texture2D(uTexture, vUv) * 0.29411764;
        sum += texture2D(uTexture, vL) * 0.35294117;
        sum += texture2D(uTexture, vR) * 0.35294117;
        gl_FragColor = sum;
    }
`),M=k(C.FRAGMENT_SHADER,`
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    uniform sampler2D uTexture;
    void main () {
        gl_FragColor = texture2D(uTexture, vUv);
    }
`),z=k(C.FRAGMENT_SHADER,`
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    uniform sampler2D uTexture;
    uniform float value;
    void main () {
        gl_FragColor = value * texture2D(uTexture, vUv);
    }
`),H=k(C.FRAGMENT_SHADER,`
    precision mediump float;
    uniform vec4 color;
    void main () {
        gl_FragColor = color;
    }
`),G=k(C.FRAGMENT_SHADER,t.TRANSPARENT?`
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float aspectRatio;
    #define SCALE 25.0
    void main () {
        vec2 uv = floor(vUv * SCALE * vec2(aspectRatio, 1.0));
        float v = mod(uv.x + uv.y, 2.0);
        v = v * 0.1 + 0.8;
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    }
`:`
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float aspectRatio;
    #define SCALE 25.0
    void main () {
        vec2 uv = floor(vUv * SCALE * vec2(aspectRatio, 1.0));
        float v = mod(uv.x + uv.y, 2.0);
        v = v * 0.1 + 0.8;
        gl_FragColor = vec4(vec3(v), 1.0);
    }
`),X=`
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    uniform sampler2D uBloom;
    uniform sampler2D uSunrays;
    uniform sampler2D uDithering;
    uniform vec2 ditherScale;
    uniform vec2 texelSize;
    vec3 linearToGamma (vec3 color) {
        color = max(color, vec3(0));
        return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
    }
    void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
    #ifdef SHADING
        vec3 lc = texture2D(uTexture, vL).rgb;
        vec3 rc = texture2D(uTexture, vR).rgb;
        vec3 tc = texture2D(uTexture, vT).rgb;
        vec3 bc = texture2D(uTexture, vB).rgb;
        float dx = length(rc) - length(lc);
        float dy = length(tc) - length(bc);
        vec3 n = normalize(vec3(dx, dy, length(texelSize)));
        vec3 l = vec3(0.0, 0.0, 1.0);
        float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
        c *= diffuse;
    #endif
    #ifdef BLOOM
        vec3 bloom = texture2D(uBloom, vUv).rgb;
    #endif
    #ifdef SUNRAYS
        float sunrays = texture2D(uSunrays, vUv).r;
        c *= sunrays;
    #ifdef BLOOM
        bloom *= sunrays;
    #endif
    #endif
    #ifdef BLOOM
        float noise = texture2D(uDithering, vUv * ditherScale).r;
        noise = noise * 2.0 - 1.0;
        bloom += noise / 255.0;
        bloom = linearToGamma(bloom);
        c += bloom;
    #endif
        float a = max(c.r, max(c.g, c.b));
        gl_FragColor = vec4(c, a);
    }
`,V=k(C.FRAGMENT_SHADER,`
    precision mediump float;
    precision mediump sampler2D;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform vec3 curve;
    uniform float threshold;
    void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        float br = max(c.r, max(c.g, c.b));
        float rq = clamp(br - curve.x, 0.0, curve.y);
        rq = curve.z * rq * rq;
        c *= max(rq, br - threshold) / max(br, 0.0001);
        gl_FragColor = vec4(c, 0.0);
    }
`),Y=k(C.FRAGMENT_SHADER,`
    precision mediump float;
    precision mediump sampler2D;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    void main () {
        vec4 sum = vec4(0.0);
        sum += texture2D(uTexture, vL);
        sum += texture2D(uTexture, vR);
        sum += texture2D(uTexture, vT);
        sum += texture2D(uTexture, vB);
        sum *= 0.25;
        gl_FragColor = sum;
    }
`),j=k(C.FRAGMENT_SHADER,`
    precision mediump float;
    precision mediump sampler2D;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    uniform float intensity;
    void main () {
        vec4 sum = vec4(0.0);
        sum += texture2D(uTexture, vL);
        sum += texture2D(uTexture, vR);
        sum += texture2D(uTexture, vT);
        sum += texture2D(uTexture, vB);
        sum *= 0.25;
        gl_FragColor = sum * intensity;
    }
`),W=k(C.FRAGMENT_SHADER,`
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    void main () {
        vec4 c = texture2D(uTexture, vUv);
        float br = max(c.r, max(c.g, c.b));
        c.a = 1.0 - min(max(br * 20.0, 0.0), 0.8);
        gl_FragColor = c;
    }
`),K=k(C.FRAGMENT_SHADER,`
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float weight;
    #define ITERATIONS 16
    void main () {
        float Density = 0.3;
        float Decay = 0.95;
        float Exposure = 0.7;
        vec2 coord = vUv;
        vec2 dir = vUv - 0.5;
        dir *= 1.0 / float(ITERATIONS) * Density;
        float illuminationDecay = 1.0;
        float color = texture2D(uTexture, vUv).a;
        for (int i = 0; i < ITERATIONS; i++)
        {
            coord -= dir;
            float col = texture2D(uTexture, coord).a;
            color += col * illuminationDecay * weight;
            illuminationDecay *= Decay;
        }
        gl_FragColor = vec4(color * Exposure, 0.0, 0.0, 1.0);
    }
`),J=k(C.FRAGMENT_SHADER,`
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;
    void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
    }
`),Q=k(C.FRAGMENT_SHADER,`
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform vec2 dyeTexelSize;
    uniform float dt;
    uniform float dissipation;
    vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
        vec2 st = uv / tsize - 0.5;
        vec2 iuv = floor(st);
        vec2 fuv = fract(st);
        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
    }
    void main () {
    #ifdef MANUAL_FILTERING
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
        vec4 result = bilerp(uSource, coord, dyeTexelSize);
    #else
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        vec4 result = texture2D(uSource, coord);
    #endif
        float decay = 1.0 + dissipation * dt;
        gl_FragColor = result / decay;
    }`,D.supportLinearFiltering?null:["MANUAL_FILTERING"]),q=k(C.FRAGMENT_SHADER,`
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;
    void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) { L = -C.x; }
        if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; }
        if (vB.y < 0.0) { B = -C.y; }
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
`),Z=k(C.FRAGMENT_SHADER,`
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;
    void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
    }
`),$=k(C.FRAGMENT_SHADER,`
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;
    void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;
        vec2 vel = texture2D(uVelocity, vUv).xy;
        gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
    }
`),ee=k(C.FRAGMENT_SHADER,`
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float C = texture2D(uPressure, vUv).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
`),et=k(C.FRAGMENT_SHADER,`
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`),ei=(C.bindBuffer(C.ARRAY_BUFFER,C.createBuffer()),C.bufferData(C.ARRAY_BUFFER,new Float32Array([-1,-1,-1,1,1,1,1,-1]),C.STATIC_DRAW),C.bindBuffer(C.ELEMENT_ARRAY_BUFFER,C.createBuffer()),C.bufferData(C.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2,0,2,3]),C.STATIC_DRAW),C.vertexAttribPointer(0,2,C.FLOAT,!1,0,0),C.enableVertexAttribArray(0),e=>{C.bindFramebuffer(C.FRAMEBUFFER,e),C.drawElements(C.TRIANGLES,6,C.UNSIGNED_SHORT,0)}),eo=(E=C.createTexture(),C.bindTexture(C.TEXTURE_2D,E),C.texParameteri(C.TEXTURE_2D,C.TEXTURE_MIN_FILTER,C.LINEAR),C.texParameteri(C.TEXTURE_2D,C.TEXTURE_MAG_FILTER,C.LINEAR),C.texParameteri(C.TEXTURE_2D,C.TEXTURE_WRAP_S,C.REPEAT),C.texParameteri(C.TEXTURE_2D,C.TEXTURE_WRAP_T,C.REPEAT),C.texImage2D(C.TEXTURE_2D,0,C.RGB,1,1,0,C.RGB,C.UNSIGNED_BYTE,new Uint8Array([255,255,255])),y={texture:E,width:1,height:1,attach:e=>(C.activeTexture(C.TEXTURE0+e),C.bindTexture(C.TEXTURE_2D,E),e)},(T=new Image).onload=()=>{y.width=T.width,y.height=T.height,C.bindTexture(C.TEXTURE_2D,E),C.texImage2D(C.TEXTURE_2D,0,C.RGB,C.RGB,C.UNSIGNED_BYTE,T)},y),en=new N(P,I),er=new N(B,M),ea=new N(B,z),es=new N(B,H),el=new N(B,G),eu=new N(B,V),ec=new N(B,Y),ed=new N(B,j),ef=new N(B,W),eh=new N(B,K),e_=new N(B,J),em=new N(B,Q),ep=new N(B,q),ev=new N(B,Z),eg=new N(B,$),eb=new N(B,ee),ex=new N(B,et),eE=new class{constructor(e,t){this.vertexShader=e,this.fragmentShaderSource=t,this.programs=[],this.activeProgram=null,this.uniforms=[]}setKeywords(e){let t=0;for(let i=0;i<e.length;i++)t+=function(e){if(0===e.length)return 0;let t=0;for(let i=0;i<e.length;i++)t=(t<<5)-t+e.charCodeAt(i)|0;return t}(e[i]);let i=this.programs[t];if(!i){let o=k(C.FRAGMENT_SHADER,this.fragmentShaderSource,e);i=U(this.vertexShader,o),this.programs[t]=i}i!==this.activeProgram&&(this.uniforms=F(i),this.activeProgram=i)}bind(){C.useProgram(this.activeProgram)}}(B,X);function ey(){let e,i,d,f,h=eF(t.SIM_RESOLUTION),_=eF(t.DYE_RESOLUTION),m=D.halfFloatTexType,p=D.formatRGBA,v=D.formatRG,g=D.formatR,b=D.supportLinearFiltering?C.LINEAR:C.NEAREST;o=o?eS(o,_.width,_.height,p.internalFormat,p.format,m,b):ew(_.width,_.height,p.internalFormat,p.format,m,b),n=n?eS(n,h.width,h.height,v.internalFormat,v.format,m,b):ew(h.width,h.height,v.internalFormat,v.format,m,b),r=eT(h.width,h.height,g.internalFormat,g.format,m,C.NEAREST),a=eT(h.width,h.height,g.internalFormat,g.format,m,C.NEAREST),s=ew(h.width,h.height,g.internalFormat,g.format,m,C.NEAREST),function(){let e=eF(t.BLOOM_RESOLUTION),i=D.halfFloatTexType,o=D.formatRGBA,n=D.supportLinearFiltering?C.LINEAR:C.NEAREST;l=eT(e.width,e.height,o.internalFormat,o.format,i,n),R.length=0;for(let r=0;r<t.BLOOM_ITERATIONS;r++){let t=e.width>>r+1,a=e.height>>r+1;if(t<2||a<2)break;let s=eT(t,a,o.internalFormat,o.format,i,n);R.push(s)}}(),e=eF(t.SUNRAYS_RESOLUTION),i=D.halfFloatTexType,d=D.formatR,f=D.supportLinearFiltering?C.LINEAR:C.NEAREST,u=eT(e.width,e.height,d.internalFormat,d.format,i,f),c=eT(e.width,e.height,d.internalFormat,d.format,i,f)}function eT(e,t,i,o,n,r){C.activeTexture(C.TEXTURE0);let a=C.createTexture();C.bindTexture(C.TEXTURE_2D,a),C.texParameteri(C.TEXTURE_2D,C.TEXTURE_MIN_FILTER,r),C.texParameteri(C.TEXTURE_2D,C.TEXTURE_MAG_FILTER,r),C.texParameteri(C.TEXTURE_2D,C.TEXTURE_WRAP_S,C.CLAMP_TO_EDGE),C.texParameteri(C.TEXTURE_2D,C.TEXTURE_WRAP_T,C.CLAMP_TO_EDGE),C.texImage2D(C.TEXTURE_2D,0,i,e,t,0,o,n,null);let s=C.createFramebuffer();C.bindFramebuffer(C.FRAMEBUFFER,s),C.framebufferTexture2D(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_2D,a,0),C.viewport(0,0,e,t),C.clear(C.COLOR_BUFFER_BIT);let l=1/e,u=1/t;return{texture:a,fbo:s,width:e,height:t,texelSizeX:l,texelSizeY:u,attach:e=>(C.activeTexture(C.TEXTURE0+e),C.bindTexture(C.TEXTURE_2D,a),e)}}function ew(e,t,i,o,n,r){let a=eT(e,t,i,o,n,r),s=eT(e,t,i,o,n,r);return{width:e,height:t,texelSizeX:a.texelSizeX,texelSizeY:a.texelSizeY,get read(){return a},set read(O){a=O},get write(){return s},set write(O){s=O},swap(){let e=a;a=s,s=e}}}function eS(e,t,i,o,n,r,a){var s;let l;return e.width===t&&e.height===i||(s=e.read,l=eT(t,i,o,n,r,a),er.bind(),C.uniform1i(er.uniforms.uTexture,s.attach(0)),ei(l.fbo),e.read=l,e.write=eT(t,i,o,n,r,a),e.width=t,e.height=i,e.texelSizeX=1/t,e.texelSizeY=1/i),e}d=[],t.SHADING&&d.push("SHADING"),t.BLOOM&&d.push("BLOOM"),t.SUNRAYS&&d.push("SUNRAYS"),eE.setKeywords(d),ey(),t.IMMEDIATE&&eO(t.SPLAT_COUNT),setTimeout(function e(){t.AUTO&&t.INTERVAL&&!t.PAUSED&&A.push(t.SPLAT_COUNT),setTimeout(e,t.INTERVAL)},t.INTERVAL);let eA=Date.now(),eR=0;function eC(){let t=ek(e.clientWidth),i=ek(e.clientHeight);return(e.width!==t||e.height!==i)&&(e.width=t,e.height=i,!0)}function eO(e){for(let t=0;t<e;t++){let e=eU();e.r*=10,e.g*=10,e.b*=10,eD(Math.random(),Math.random(),1e3*(Math.random()-.5),1e3*(Math.random()-.5),e)}}function eD(i,r,a,s,l){var u;let c;C.viewport(0,0,n.width,n.height),e_.bind(),C.uniform1i(e_.uniforms.uTarget,n.read.attach(0)),C.uniform1f(e_.uniforms.aspectRatio,e.width/e.height),C.uniform2f(e_.uniforms.point,i,r),C.uniform3f(e_.uniforms.color,a,s,0),C.uniform1f(e_.uniforms.radius,(u=t.SPLAT_RADIUS/100,(c=e.width/e.height)>1&&(u*=c),u)),ei(n.write.fbo),n.swap(),C.viewport(0,0,o.width,o.height),C.uniform1i(e_.uniforms.uTarget,o.read.attach(0)),C.uniform3f(e_.uniforms.color,l.r,l.g,l.b),ei(o.write.fbo),o.swap()}function eL(t,i,o,n){t.id=i,t.down=!0,t.moved=!1,t.texcoordX=o/e.width,t.texcoordY=1-n/e.height,t.prevTexcoordX=t.texcoordX,t.prevTexcoordY=t.texcoordY,t.deltaX=0,t.deltaY=0,t.color=eU()}function eN(i,o,n){var r,a;let s,l;"click"===t.TRIGGER&&(i.moved=i.down),i.prevTexcoordX=i.texcoordX,i.prevTexcoordY=i.texcoordY,i.texcoordX=o/e.width,i.texcoordY=1-n/e.height,r=i.texcoordX-i.prevTexcoordX,(s=e.width/e.height)<1&&(r*=s),i.deltaX=r,a=i.texcoordY-i.prevTexcoordY,(l=e.width/e.height)>1&&(a/=l),i.deltaY=a,"hover"===t.TRIGGER&&(i.moved=Math.abs(i.deltaX)>0||Math.abs(i.deltaY)>0)}!function i(){var d,f,h,_,m,p,v,g,b,x,E;let y,T,w,L,N,U,F=(T=Math.min(T=((y=Date.now())-eA)/1e3,.016666),eA=y,T);eC()&&ey(),d=F,t.COLORFUL&&(eR+=d*t.COLOR_UPDATE_SPEED)>=1&&(f=eR,h=0,eR=0==(w=1)?0:(f-0)%w+0,S.forEach(e=>{e.color=eU()})),A.length>0&&eO(A.pop()),S.forEach(e=>{var i;let o,n;e.moved&&(e.moved=!1,o=(i=e).deltaX*t.SPLAT_FORCE,n=i.deltaY*t.SPLAT_FORCE,eD(i.texcoordX,i.texcoordY,o,n,i.color))}),t.PAUSED||function(e){C.disable(C.BLEND),C.viewport(0,0,n.width,n.height),ev.bind(),C.uniform2f(ev.uniforms.texelSize,n.texelSizeX,n.texelSizeY),C.uniform1i(ev.uniforms.uVelocity,n.read.attach(0)),ei(a.fbo),eg.bind(),C.uniform2f(eg.uniforms.texelSize,n.texelSizeX,n.texelSizeY),C.uniform1i(eg.uniforms.uVelocity,n.read.attach(0)),C.uniform1i(eg.uniforms.uCurl,a.attach(1)),C.uniform1f(eg.uniforms.curl,t.CURL),C.uniform1f(eg.uniforms.dt,e),ei(n.write.fbo),n.swap(),ep.bind(),C.uniform2f(ep.uniforms.texelSize,n.texelSizeX,n.texelSizeY),C.uniform1i(ep.uniforms.uVelocity,n.read.attach(0)),ei(r.fbo),ea.bind(),C.uniform1i(ea.uniforms.uTexture,s.read.attach(0)),C.uniform1f(ea.uniforms.value,t.PRESSURE),ei(s.write.fbo),s.swap(),eb.bind(),C.uniform2f(eb.uniforms.texelSize,n.texelSizeX,n.texelSizeY),C.uniform1i(eb.uniforms.uDivergence,r.attach(0));for(let e=0;e<t.PRESSURE_ITERATIONS;e++)C.uniform1i(eb.uniforms.uPressure,s.read.attach(1)),ei(s.write.fbo),s.swap();ex.bind(),C.uniform2f(ex.uniforms.texelSize,n.texelSizeX,n.texelSizeY),C.uniform1i(ex.uniforms.uPressure,s.read.attach(0)),C.uniform1i(ex.uniforms.uVelocity,n.read.attach(1)),ei(n.write.fbo),n.swap(),em.bind(),C.uniform2f(em.uniforms.texelSize,n.texelSizeX,n.texelSizeY),D.supportLinearFiltering||C.uniform2f(em.uniforms.dyeTexelSize,n.texelSizeX,n.texelSizeY);let i=n.read.attach(0);C.uniform1i(em.uniforms.uVelocity,i),C.uniform1i(em.uniforms.uSource,i),C.uniform1f(em.uniforms.dt,e),C.uniform1f(em.uniforms.dissipation,t.VELOCITY_DISSIPATION),ei(n.write.fbo),n.swap(),C.viewport(0,0,o.width,o.height),D.supportLinearFiltering||C.uniform2f(em.uniforms.dyeTexelSize,o.texelSizeX,o.texelSizeY),C.uniform1i(em.uniforms.uVelocity,n.read.attach(0)),C.uniform1i(em.uniforms.uSource,o.read.attach(1)),C.uniform1f(em.uniforms.dissipation,t.DENSITY_DISSIPATION),ei(o.write.fbo),o.swap()}(F),_=null,t.BLOOM&&function(e,i){if(R.length<2)return;let o=i;C.disable(C.BLEND),eu.bind();let n=t.BLOOM_THRESHOLD*t.BLOOM_SOFT_KNEE+1e-4,r=t.BLOOM_THRESHOLD-n;C.uniform3f(eu.uniforms.curve,r,2*n,.25/n),C.uniform1f(eu.uniforms.threshold,t.BLOOM_THRESHOLD),C.uniform1i(eu.uniforms.uTexture,e.attach(0)),C.viewport(0,0,o.width,o.height),ei(o.fbo),ec.bind();for(let e=0;e<R.length;e++){let t=R[e];C.uniform2f(ec.uniforms.texelSize,o.texelSizeX,o.texelSizeY),C.uniform1i(ec.uniforms.uTexture,o.attach(0)),C.viewport(0,0,t.width,t.height),ei(t.fbo),o=t}C.blendFunc(C.ONE,C.ONE),C.enable(C.BLEND);for(let e=R.length-2;e>=0;e--){let t=R[e];C.uniform2f(ec.uniforms.texelSize,o.texelSizeX,o.texelSizeY),C.uniform1i(ec.uniforms.uTexture,o.attach(0)),C.viewport(0,0,t.width,t.height),ei(t.fbo),o=t}C.disable(C.BLEND),ed.bind(),C.uniform2f(ed.uniforms.texelSize,o.texelSizeX,o.texelSizeY),C.uniform1i(ed.uniforms.uTexture,o.attach(0)),C.uniform1f(ed.uniforms.intensity,t.BLOOM_INTENSITY),C.viewport(0,0,i.width,i.height),ei(i.fbo)}(o.read,l),t.SUNRAYS&&(m=o.read,p=o.write,v=u,C.disable(C.BLEND),ef.bind(),C.uniform1i(ef.uniforms.uTexture,m.attach(0)),C.viewport(0,0,p.width,p.height),ei(p.fbo),eh.bind(),C.uniform1f(eh.uniforms.weight,t.SUNRAYS_WEIGHT),C.uniform1i(eh.uniforms.uTexture,p.attach(0)),C.viewport(0,0,v.width,v.height),ei(v.fbo),function(e,t,i){en.bind();for(let i=0;i<1;i++)C.uniform2f(en.uniforms.texelSize,e.texelSizeX,0),C.uniform1i(en.uniforms.uTexture,e.attach(0)),ei(t.fbo),C.uniform2f(en.uniforms.texelSize,0,e.texelSizeY),C.uniform1i(en.uniforms.uTexture,t.attach(0)),ei(e.fbo)}(u,c,1)),C.blendFunc(C.ONE,C.ONE_MINUS_SRC_ALPHA),C.enable(C.BLEND),L=(0,C.drawingBufferWidth),N=(0,C.drawingBufferHeight),C.viewport(0,0,L,N),U=null,t.TRANSPARENT||(b=U,x={r:(g=t.BACK_COLOR).r/255,g:g.g/255,b:g.b/255},es.bind(),C.uniform4f(es.uniforms.color,x.r,x.g,x.b,1),ei(b)),t.TRANSPARENT&&(E=U,el.bind(),C.uniform1f(el.uniforms.aspectRatio,e.width/e.height),ei(E)),function(e,i,n){if(eE.bind(),t.SHADING&&C.uniform2f(eE.uniforms.texelSize,1/i,1/n),C.uniform1i(eE.uniforms.uTexture,o.read.attach(0)),t.BLOOM){var r,a,s;C.uniform1i(eE.uniforms.uBloom,l.attach(1)),C.uniform1i(eE.uniforms.uDithering,eo.attach(2));let e=(r=eo,a=i,s=n,{x:a/r.width,y:s/r.height});C.uniform2f(eE.uniforms.ditherScale,e.x,e.y)}t.SUNRAYS&&C.uniform1i(eE.uniforms.uSunrays,u.attach(3)),ei(e)}(U,L,N),requestAnimationFrame(i)}();function eU(){let e=function(e,t,i){let o,n,r,a=Math.floor(6*e),s=6*e-a,l=0,u=+(1-s),c=+(1-(1-s)*1);switch(a%6){case 0:o=1,n=c,r=l;break;case 1:o=u,n=1,r=l;break;case 2:o=l,n=1,r=c;break;case 3:o=l,n=u,r=1;break;case 4:o=c,n=l,r=1;break;case 5:o=1,n=l,r=u}return{r:o,g:n,b:r}}(Math.random(),1,1);return e.r*=.15,e.g*=.15,e.b*=.15,e}function eF(e){let t=C.drawingBufferWidth/C.drawingBufferHeight;t<1&&(t=1/t);let i=Math.round(e),o=Math.round(e*t);return C.drawingBufferWidth>C.drawingBufferHeight?{width:o,height:i}:{width:i,height:o}}function ek(e){return Math.floor(e*(window.devicePixelRatio||1))}window.addEventListener("mousedown",e=>{let t=ek(e.clientX),i=ek(e.clientY),o=S.find(e=>-1===e.id);o||(o=new w),eL(o,-1,t,i)}),setTimeout(()=>{window.addEventListener("mousemove",e=>{let t=ek(e.clientX),i=ek(e.clientY);eN(S[0],t,i)})},500),window.addEventListener("mouseup",()=>{S[0].down=!1}),window.addEventListener("touchstart",e=>{e.preventDefault();let t=e.targetTouches;for(;t.length>=S.length;)S.push(new w);for(let e=0;e<t.length;e++){let i=ek(t[e].clientX),o=ek(t[e].clientY);eL(S[e+1],t[e].identifier,i,o)}}),window.addEventListener("touchmove",e=>{e.preventDefault();let t=e.targetTouches;for(let e=0;e<t.length;e++){let i=ek(t[e].clientX),o=ek(t[e].clientY);eN(S[e+1],i,o)}},!1),window.addEventListener("touchend",e=>{let t=e.changedTouches;for(let e=0;e<t.length;e++)S.find(i=>i.id===t[e].identifier).down=!1}),window.addEventListener("keydown",e=>{"KeyP"===e.code&&(t.PAUSED=!t.PAUSED)," "===e.key&&A.push(Number.parseInt(20*Math.random())+5)})}}()}]);