// ==UserScript==
// @name        GitHub Markdown Preview
// @namespace   nv.github.com/github-live-preview
// @include     http://github.com/*/commit/*
// @include     https://github.com/*/commit/*
// @include     http://github.com/*/*/issues*
// @include     https://github.com/*/*/issues*
// @include     http://github.com/inbox/*
// @include     https://github.com/inbox/*
// @include     http://github.com/*/*/blob/*/*.md
// @include     http://github.com/*/*/blob/*/*.markdown
// @include     http://github.com/*/*/blob/*/*.mdown
// @include     https://github.com/*/*/blob/*/*.md
// @include     https://github.com/*/*/blob/*/*.markdown
// @include     https://github.com/*/*/blob/*/*.mdown
// @description Live Markdown preview for commit’s comments, markdown files, and inbox messages
// @version     
// @copyright   2009+, Nikita Vasilyev
// @licence     BSD
// ==/UserScript==

(function init(){

var markdown_preview = '(' + function markdown_preview () {

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
script.appendChild(document.createTextNode(markdown_preview));
document.body.appendChild(script);

})();