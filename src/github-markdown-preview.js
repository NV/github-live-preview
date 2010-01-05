// ==UserScript==
// @name        GitHub markdown preview
// @namespace   nv.github.com/github-preview
// @include     http://github.com/*/commit/*
// @include     https://github.com/*/commit/*
// @include     http://github.com/inbox/*
// @include     https://github.com/inbox/*
// @include     http://github.com/*/*/blob/*/*.md
// @include     http://github.com/*/*/blob/*/*.markdown
// @include     http://github.com/*/*/blob/*/*.mdown
// @include     https://github.com/*/*/blob/*/*.md
// @include     https://github.com/*/*/blob/*/*.markdown
// @include     https://github.com/*/*/blob/*/*.mdown
// @description Live Markdown preview for commit’s comments, markdown files, and inbox messages
// @version     0.1
// @copyright   2009+, Nikita Vasilyev (http://github.com/NV/github-live-preview)
// @licence     BSD
// ==/UserScript==

(function init(){

var comments_preview = '(' + function comments_preview () {

/*> gfm-showdown.js */

/*> core.js */

} + ')();';

function addStyle (css) {
  var head = document.getElementsByTagName('head')[0];
  if (!head) {
    return null;
  }
  var style = document.createElement("style");
  style.type = "text/css";
  style.appendChild(document.createTextNode(css));
  head.appendChild(style);
  return style;
}
addStyle("/*> core.css */");

var script = document.createElement('script');
script.appendChild(document.createTextNode(comments_preview));
document.body.appendChild(script);

})();