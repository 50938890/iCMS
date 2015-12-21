/**
* iCMS - i Content Management System
* Copyright (c) 2007-2012 idreamsoft.com iiimon Inc. All rights reserved.
*
* @author coolmoo <idreamsoft@qq.com>
* @site http://www.idreamsoft.com
* @licence http://www.idreamsoft.com/license.php
* @version 6.1.0
* @$Id: iCMS.APP.js 176 2015-12.21 02:52:17Z cool.tea $
*/
(function(doc) {
  var root   = document.documentElement;
  var head   = document.getElementsByTagName("head")[0]; //HEAD元素

  iCMS = function(el) {
      return new iCMS.init(el)
  }

  iCMS.init = function(el) {
      this[0] = this.element = el
  }
  iCMS.fn = iCMS.prototype = iCMS.init.prototype

  iCMS.slice = window.dispatchEvent ? function(nodes, start, end) {
      return Array.prototype.slice.call(nodes, start, end)
  } : function(nodes, start, end) {
      var ret = [],
              n = nodes.length
      start = resetNumber(start, n)
      end = resetNumber(end, n, 1)
      for (var i = start; i < end; ++i) {
          ret[i - start] = nodes[i]
      }
      return ret
  }
  function resetNumber(a, n, end) { //用于模拟slice, splice的效果
      if ((a === +a) && !(a % 1)) { //如果是整数
          if (a < 0) {
              a = a * -1 >= n ? 0 : a + n
          } else {
              a = a > n ? n : a
          }
      } else {
          a = end ? n : 0
      }
      return a
  }

  iCMS.getpath = function(el) {
    var cur = getCurrentScript(true)
    if (!cur) { //处理window safari的Error没有stack的问题
        cur = iCMS.slice(document.scripts).pop().src
    }
    var url = cleanUrl(cur)
    return url.slice(0, url.lastIndexOf("/") + 1);
  }


  function cleanUrl(url) {
    return (url || "").replace(/[?#].*/, "")
  }
  function getCurrentScript(base) {
      // 参考 https://github.com/samyk/jiagra/blob/master/jiagra.js
      var stack
      try {
          a.b.c() //强制报错,以便捕获e.stack
      } catch (e) { //safari的错误对象只有line,sourceId,sourceURL
          stack = e.stack
          if (!stack && window.opera) {
              //opera 9没有e.stack,但有e.Backtrace,但不能直接取得,需要对e对象转字符串进行抽取
              stack = (String(e).match(/of linked script \S+/g) || []).join(" ")
          }
      }
      if (stack) {
          /**e.stack最后一行在所有支持的浏览器大致如下:
           *chrome23:
           * at http://113.93.50.63/data.js:4:1
           *firefox17:
           *@http://113.93.50.63/query.js:4
           *opera12:http://www.oldapps.com/opera.php?system=Windows_XP
           *@http://113.93.50.63/data.js:4
           *IE10:
           *  at Global code (http://113.93.50.63/data.js:4:1)
           *  //firefox4+ 可以用document.currentScript
           */
          stack = stack.split(/[@ ]/g).pop() //取得最后一行,最后一个空格或@之后的部分
          stack = stack[0] === "(" ? stack.slice(1, -1) : stack.replace(/\s/, "") //去掉换行符
          return stack.replace(/(:\d+)?:\d+$/i, "") //去掉行号与或许存在的出错字符起始位置
      }
      var nodes = document.getElementsByTagName("script") //只在head标签中寻找
      for (var i = nodes.length, node; node = nodes[--i]; ) {
          if (node.className === 'iCMS.APP.JS' && node.readyState === "interactive") {
              return node.className = node.src
          }
      }
  }

})(document);

var iCMS_PUBLIC_URL = iCMS.getpath();

requirejs.config({
  baseUrl: iCMS_PUBLIC_URL+'/js',
  paths: {
    jquery:[
        '//apps.bdimg.com/libs/jquery/1.11.3/jquery.min', //http://cdn.code.baidu.com/
        'libs/jquery-1.11.3.min'
    ],
    artdialog:'libs/artDialog/dialog-plus-min',//v6.0.4
    dialog:'iCMS.dialog-6.1.0',
    icms:'iCMS-6.1.0',
    user:'user-6.1.0.min',
    register:'register-6.1.0.min',
    login:'login-6.1.0.min',
    comment:'comment-6.1.0.min',
    poshytip:'jquery.poshytip.min',
    insertContent:'jquery.insertContent.min',
    // css:'style.css',
  },
  shim: {
    // 'poshytip': ['jquery'],
    // 'insertContent': ['jquery'],
    // 'jquery.scroll': {
    //     deps: ['jquery'],
    //     exports: 'jQuery.fn.scroll'
    // },
    'poshytip':{
      deps:['jquery'],
      exports:'jQuery.fn.poshytip'
    },
    'artdialog':{
      deps:['jquery'],
      exports:'window.dialog'
    }
  }
});
// iCMS 初始化
require(['jquery','icms'], function($,iCMS,dialog) {
  iCMS.init({PUBLIC:iCMS_PUBLIC_URL});
  console.log(iCMS.CONFIG);
  console.log(iCMS);
  // iCMS.init(iCMS_CONFIG);
  //iCMS.alert("asdasd");
  // $(".iCMS_search_btn").click(function(event) {
  //   event.preventDefault();
  //   require(['dialog'], function(d) {
  //     var box = document.getElementById("iCMS-login-box");
  //     d({title: '用户登陆',content:box,elemBack:'remove'});
  //   });
  // });
});

(function(r,iCMS){
  iCMS.alert = function(msg){
    require(['jquery','icms'], function($,a) {
      a.alert(msg);
    });
  }
})(require,iCMS);


// require(['jquery', 'iCMS'], function($,iCMS) {
//     console.log($);
// });
// require(['jquery'], function($) {
//   // var mod = require("insertContent");
//     // var cssUrl = require.toUrl("./style.css");
//     console.log(mod,$().jquery);
// });
// define(["jquery"],function($){
//     console.log($().jquery);
// });
