(function (a) {
  a.fn.extend({
    autocomplete: function (d, b) {
      var c = typeof d == "string";
      b = a.extend({},
      a.Autocompleter.defaults, {
        url: c ? d : null,
        data: c ? null : d,
        delay: c ? a.Autocompleter.defaults.delay : 10,
        max: b && !b.scroll ? 10 : 150
      },
      b);
      b.highlight = b.highlight ||
      function (e) {
        return e
      };
      return this.each(function () {
        new a.Autocompleter(this, b)
      })
    },
    result: function (d) {
      return this.bind("result", d)
    },
    search: function (d) {
      return this.trigger("search", [d])
    },
    flushCache: function () {
      return this.trigger("flushCache")
    },
    setOptions: function (d) {
      return this.trigger("setOptions", [d])
    },
    unautocomplete: function () {
      return this.trigger("unautocomplete")
    }
  });
  a.Autocompleter = function (d, b) {
    var c = {
      UP: 38,
      DOWN: 40,
      DEL: 46,
      TAB: 9,
      RETURN: 13,
      ESC: 27,
      COMMA: 188,
      PAGEUP: 33,
      PAGEDOWN: 34
    },
      e = a(d).attr("autocomplete", "off").addClass(b.inputClass),
      f, g = "",
      h = a.Autocompleter.Cache(b),
      i = 0,
      m, j = {
      mouseDownOnSelect: false
    },
      n = a.Autocompleter.Select(b, d, l, j);
    e.keydown(function (o) {
      m = o.keyCode;
      switch (o.keyCode) {
      case c.UP:
        o.preventDefault();
        n.visible() ? n.prev() : k(0, true);
        break;
      case c.DOWN:
        o.preventDefault();
        n.visible() ? n.next() : k(0, true);
        break;
      case c.PAGEUP:
        o.preventDefault();
        n.visible() ? n.pageUp() : k(0, true);
        break;
      case c.PAGEDOWN:
        o.preventDefault();
        n.visible() ? n.pageDown() : k(0, true);
        break;
      case b.multiple && a.trim(b.multipleSeparator) == "," && c.COMMA:
      case c.TAB:
      case c.RETURN:
        l() && o.preventDefault();
        break;
      case c.ESC:
        n.hide();
        break;
      default:
        clearTimeout(f);
        f = setTimeout(k, b.delay);
        break
      }
    }).keypress(function () {}).focus(function () {
      i++
    }).blur(function () {
      i = 0;
      j.mouseDownOnSelect || v()
    }).click(function () {
      i++>1 && !n.visible() && k(0, true)
    }).bind("search", function () {
      var o = arguments.length > 1 ? arguments[1] : null;

      function q(x, s) {
        var A;
        if (s && s.length) for (var z = 0; z < s.length; z++) if (s[z].result.toLowerCase() == x.toLowerCase()) {
          A = s[z];
          break
        }
        typeof o == "function" ? o(A) : e.trigger("result", A && [A.data, A.value])
      }
      a.each(r(e.val()), function (x, s) {
        t(s, q, q)
      })
    }).bind("flushCache", function () {
      h.flush()
    }).bind("setOptions", function (o, q) {
      a.extend(b, q);
      "data" in q && h.populate()
    }).bind("unautocomplete", function () {
      n.unbind();
      e.unbind()
    });

    function l() {
      var o = n.selected();
      if (!o) return false;
      var q = o.result;
      g = q;
      if (b.multiple) {
        var x = r(e.val());
        if (x.length > 1) q = x.slice(0, x.length - 1).join(b.multipleSeparator) + b.multipleSeparator + q;
        q += b.multipleSeparator
      }
      e.val(q);
      y();
      e.trigger("result", [o.data, o.value]);
      return true
    }
    function k(o, q) {
      if (m == c.DEL) n.hide();
      else {
        o = e.val();
        if (! (!q && o == g)) {
          g = o;
          o = u(o);
          if (o.length >= b.minChars) {
            e.addClass(b.loadingClass);
            b.matchCase || (o = o.toLowerCase());
            t(o, p, y)
          } else {
            C();
            n.hide()
          }
        }
      }
    }
    function r(o) {
      if (!o) return [""];
      o = o.split(a.trim(b.multipleSeparator));
      var q = [];
      a.each(o, function (x, s) {
        if (a.trim(s)) q[x] = a.trim(s)
      });
      return q
    }
    function u(o) {
      if (!b.multiple) return o;
      o = r(o);
      return o[o.length - 1]
    }
    function w(o, q) {
      if (b.autoFill && u(e.val()).toLowerCase() == o.toLowerCase() && m != 8) {
        e.val(e.val() + q.substring(u(g).length));
        a.Autocompleter.Selection(d, g.length, g.length + q.length)
      }
    }
    function v() {
      clearTimeout(f);
      f = setTimeout(y, 200)
    }
    function y() {
      n.hide();
      clearTimeout(f);
      C();
      b.mustMatch && e.search(function (o) {
        o || e.val("")
      })
    }
    function p(o, q) {
      if (q && q.length && i) {
        C();
        n.display(q, o);
        w(o, q[0].value);
        n.show()
      } else y()
    }
    function t(o, q, x) {
      b.matchCase || (o = o.toLowerCase());
      var s = h.load(o);
      if (s && s.length) q(o, s);
      else if (typeof b.url == "string" && b.url.length > 0) {
        var A = {};
        a.each(b.extraParams, function (z, D) {
          A[z] = typeof D == "function" ? D() : D
        });
        a.ajax({
          mode: "abort",
          port: "autocomplete" + d.name,
          dataType: b.dataType,
          url: b.url,
          data: a.extend({
            q: u(o),
            limit: b.max
          },
          A),
          success: function (z) {
            z = b.parse && b.parse(z) || B(z);
            h.add(o, z);
            q(o, z)
          }
        })
      } else x(o)
    }
    function B(o) {
      var q = [];
      o = o.split("\n");
      for (var x = 0; x < o.length; x++) {
        var s = a.trim(o[x]);
        if (s) {
          s = s.split("|");
          q[q.length] = {
            data: s,
            value: s[0],
            result: b.formatResult && b.formatResult(s, s[0]) || s[0]
          }
        }
      }
      return q
    }
    function C() {
      e.removeClass(b.loadingClass)
    }
  };
  a.Autocompleter.defaults = {
    inputClass: "ac_input",
    resultsClass: "ac_results",
    loadingClass: "ac_loading",
    minChars: 1,
    delay: 400,
    matchCase: false,
    matchSubset: true,
    matchContains: false,
    cacheLength: 10,
    max: 100,
    mustMatch: false,
    extraParams: {},
    selectFirst: true,
    formatItem: function (d) {
      return d[0]
    },
    autoFill: false,
    width: 0,
    multiple: false,
    multipleSeparator: ", ",
    highlight: function (d, b) {
      return d.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + b.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi, "\\$1") + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>")
    },
    scroll: true,
    scrollHeight: 180,
    attachTo: "body"
  };
  a.Autocompleter.Cache = function (d) {
    var b = {},
      c = 0;

    function e(i, m) {
      d.matchCase || (i = i.toLowerCase());
      i = i.indexOf(m);
      if (i == -1) return false;
      return i == 0 || d.matchContains
    }
    function f(i, m) {
      c > d.cacheLength && h();
      b[i] || c++;
      b[i] = m
    }
    function g() {
      if (!d.data) return false;
      var i = {},
        m = 0;
      if (!d.url) d.cacheLength = 1;
      i[""] = [];
      for (var j = 0, n = d.data.length; j < n; j++) {
        var l = d.data[j];
        l = typeof l == "string" ? [l] : l;
        var k = d.formatItem(l, j + 1, d.data.length);
        if (k !== false) {
          var r = k.charAt(0).toLowerCase();
          i[r] || (i[r] = []);
          l = {
            value: k,
            data: l,
            result: d.formatResult && d.formatResult(l) || k
          };
          i[r].push(l);
          m++<d.max && i[""].push(l)
        }
      }
      a.each(i, function (u, w) {
        d.cacheLength++;
        f(u, w)
      })
    }
    setTimeout(g, 25);

    function h() {
      b = {};
      c = 0
    }
    return {
      flush: h,
      add: f,
      populate: g,
      load: function (i) {
        if (!d.cacheLength || !c) return null;
        if (!d.url && d.matchContains) {
          var m = [];
          for (var j in b) if (j.length > 0) {
            var n = b[j];
            a.each(n, function (l, k) {
              e(k.value, i) && m.push(k)
            })
          }
          return m
        } else if (b[i]) return b[i];
        else if (d.matchSubset) for (j = i.length - 1; j >= d.minChars; j--) if (n = b[i.substr(0, j)]) {
          m = [];
          a.each(n, function (l, k) {
            if (e(k.value, i)) m[m.length] = k
          });
          return m
        }
        return null
      }
    }
  };
  a.Autocompleter.Select = function (d, b, c, e) {
    var f = {
      ACTIVE: "ac_over"
    },
      g, h = -1,
      i, m = "",
      j = true,
      n, l;

    function k() {
      if (j) {
        n = a("<div/>").hide().addClass(d.resultsClass).css("position", "absolute").appendTo(d.attachTo);
        l = a("<ul>").appendTo(n).mouseover(function (p) {
          if (r(p).nodeName && r(p).nodeName.toUpperCase() == "LI") {
            h = a("li", l).removeClass(f.ACTIVE).index(r(p));
            a(r(p)).addClass(f.ACTIVE)
          }
        }).click(function (p) {
          a(r(p)).addClass(f.ACTIVE);
          c();
          b.focus();
          return false
        }).mousedown(function () {
          e.mouseDownOnSelect = true
        }).mouseup(function () {
          e.mouseDownOnSelect = false
        });
        d.width > 0 && n.css("width", d.width);
        j = false
      }
    }
    function r(p) {
      for (p = p.target; p && p.tagName != "LI";) p = p.parentNode;
      if (!p) return [];
      return p
    }
    function u(p) {
      g.slice(h, h + 1).removeClass();
      w(p);
      p = g.slice(h, h + 1).addClass(f.ACTIVE);
      if (d.scroll) {
        var t = 0;
        g.slice(0, h).each(function () {
          t += this.offsetHeight
        });
        if (t + p[0].offsetHeight - l.scrollTop() > l[0].clientHeight) l.scrollTop(t + p[0].offsetHeight - l.innerHeight());
        else t < l.scrollTop() && l.scrollTop(t)
      }
    }
    function w(p) {
      h += p;
      if (h < 0) h = g.size() - 1;
      else if (h >= g.size()) h = 0
    }
    function v(p) {
      return d.max && d.max < p ? d.max : p
    }
    function y() {
      l.empty();
      for (var p = v(i.length), t = 0; t < p; t++) if (i[t]) {
        var B = d.formatItem(i[t].data, t + 1, p, i[t].value, m);
        if (B !== false) {
          B = a("<li>").html(d.highlight(B, m)).addClass(t % 2 == 0 ? "ac_even" : "ac_odd").appendTo(l)[0];
          a.data(B, "ac_data", i[t])
        }
      }
      g = l.find("li");
      if (d.selectFirst) {
        g.slice(0, 1).addClass(f.ACTIVE);
        h = 0
      }
      l.bgiframe()
    }
    return {
      display: function (p, t) {
        k();
        i = p;
        m = t;
        y()
      },
      next: function () {
        u(1)
      },
      prev: function () {
        u(-1)
      },
      pageUp: function () {
        h != 0 && h - 8 < 0 ? u(-h) : u(-8)
      },
      pageDown: function () {
        h != g.size() - 1 && h + 8 > g.size() ? u(g.size() - 1 - h) : u(8)
      },
      hide: function () {
        n && n.hide();
        h = -1
      },
      visible: function () {
        return n && n.is(":visible")
      },
      current: function () {
        return this.visible() && (g.filter("." + f.ACTIVE)[0] || d.selectFirst && g[0])
      },
      show: function () {
        var p = a(b).offset();
        n.css({
          width: typeof d.width == "string" || d.width > 0 ? d.width : a(b).width(),
          top: p.top + b.offsetHeight,
          left: p.left
        }).show();
        if (d.scroll) {
          l.scrollTop(0);
          l.css({
            maxHeight: d.scrollHeight,
            overflow: "auto"
          });
          if (a.browser.msie && typeof document.body.style.maxHeight === "undefined") {
            var t = 0;
            g.each(function () {
              t += this.offsetHeight
            });
            p = t > d.scrollHeight;
            l.css("height", p ? d.scrollHeight : t);
            p || g.width(l.width() - parseInt(g.css("padding-left")) - parseInt(g.css("padding-right")))
          }
        }
      },
      selected: function () {
        var p = g && g.filter("." + f.ACTIVE).removeClass(f.ACTIVE);
        return p && p.length && a.data(p[0], "ac_data")
      },
      unbind: function () {
        n && n.remove()
      }
    }
  };
  a.Autocompleter.Selection = function (d, b, c) {
    if (d.createTextRange) {
      var e = d.createTextRange();
      e.collapse(true);
      e.moveStart("character", b);
      e.moveEnd("character", c);
      e.select()
    } else if (d.setSelectionRange) d.setSelectionRange(b, c);
    else if (d.selectionStart) {
      d.selectionStart = b;
      d.selectionEnd = c
    }
    d.focus()
  }
})(jQuery);
(function (a) {
  a.fn.autosaveField = function (d) {
    var b = a.extend({},
    a.fn.autosaveField.defaults, d);
    return this.each(function () {
      var c = a(this),
        e = c.find(":text"),
        f = c.find(".error"),
        g = c.find(".success"),
        h = c.attr("data-action"),
        i = c.attr("data-name"),
        m = e.val();

      function j() {
        e.spin();
        a.ajax({
          url: h,
          type: "POST",
          data: {
            _method: b.method,
            field: i,
            value: e.val()
          },
          success: function () {
            e.stopSpin();
            g.show();
            m = e.val()
          },
          error: function () {
            e.stopSpin();
            f.show()
          }
        })
      }
      e.blur(function () {
        a(this).val() != m && j()
      });
      e.keyup(function () {
        f.hide();
        g.hide()
      })
    })
  };
  a.fn.autosaveField.defaults = {
    method: "put"
  }
})(jQuery);
(function (a) {
  a.fn.bgIframe = a.fn.bgiframe = function (d) {
    if (a.browser.msie && /6.0/.test(navigator.userAgent)) {
      d = a.extend({
        top: "auto",
        left: "auto",
        width: "auto",
        height: "auto",
        opacity: true,
        src: "javascript:false;"
      },
      d || {});
      var b = function (e) {
        return e && e.constructor == Number ? e + "px" : e
      },
        c = '<iframe class="bgiframe"frameborder="0"tabindex="-1"src="' + d.src + '"style="display:block;position:absolute;z-index:-1;' + (d.opacity !== false ? "filter:Alpha(Opacity='0');" : "") + "top:" + (d.top == "auto" ? "expression(((parseInt(this.parentNode.currentStyle.borderTopWidth)||0)*-1)+'px')" : b(d.top)) + ";left:" + (d.left == "auto" ? "expression(((parseInt(this.parentNode.currentStyle.borderLeftWidth)||0)*-1)+'px')" : b(d.left)) + ";width:" + (d.width == "auto" ? "expression(this.parentNode.offsetWidth+'px')" : b(d.width)) + ";height:" + (d.height == "auto" ? "expression(this.parentNode.offsetHeight+'px')" : b(d.height)) + ';"/>';
      return this.each(function () {
        a("> iframe.bgiframe", this).length == 0 && this.insertBefore(document.createElement(c), this.firstChild)
      })
    }
    return this
  }
})(jQuery);
jQuery.cookie = function (a, d, b) {
};
(function (a) {
  a.dimensions = {
    version: "@VERSION"
  };
  a.each(["Height", "Width"], function (b, c) {
    a.fn["inner" + c] = function () {
      if (this[0]) {
        var e = c == "Height" ? "Top" : "Left",
        f = c == "Height" ? "Bottom" : "Right";
        return this.css("display") != "none" ? this[0]["client" + c] : d(this, c.toLowerCase()) + d(this, "padding" + e) + d(this, "padding" + f)
      }
    };
    a.fn["outer" + c] = function (e) {
      if (this[0]) {
        var f = c == "Height" ? "Top" : "Left",
        g = c == "Height" ? "Bottom" : "Right";
        e = a.extend({
          margin: false
        },
        e || {});
        var h = this.css("display") != "none" ? this[0]["offset" + c] : d(this, c.toLowerCase()) + d(this, "border" + f + "Width") + d(this, "border" + g + "Width") + d(this, "padding" + f) + d(this, "padding" + g);
        return h + (e.margin ? d(this, "margin" + f) + d(this, "margin" + g) : 0)
      }
    }
  });
  a.each(["Left", "Top"], function (b, c) {
    a.fn["scroll" + c] = function (e) {
      if (this[0]) return e != undefined ? this.each(function () {
        this == window || this == document ? window.scrollTo(c == "Left" ? e : a(window).scrollLeft(), c == "Top" ? e : a(window).scrollTop()) : (this["scroll" + c] = e)
      }) : this[0] == window || this[0] == document ? self[c == "Left" ? "pageXOffset" : "pageYOffset"] || a.boxModel && document.documentElement["scroll" + c] || document.body["scroll" + c] : this[0]["scroll" + c]
    }
  });
  a.fn.extend({
    position: function () {
      var b = this[0],
        c, e, f;
      if (b) {
        f = this.offsetParent();
        c = this.offset();
        e = f.offset();
        c.top -= d(b, "marginTop");
        c.left -= d(b, "marginLeft");
        e.top += d(f, "borderTopWidth");
        e.left += d(f, "borderLeftWidth");
        c = {
          top: c.top - e.top,
          left: c.left - e.left
        }
      }
      return c
    },
    offsetParent: function () {
      for (var b = this[0].offsetParent; b && !/^body|html$/i.test(b.tagName) && a.css(b, "position") == "static";) b = b.offsetParent;
      return a(b)
    }
  });

  function d(b, c) {
    return parseInt(a.curCSS(b.jquery ? b[0] : b, c, true)) || 0
  }
})(jQuery);
(function () {
  jQuery.fn.fancyZoom = function (a) {
    if ($(this).length != 0) {
      function d() {
        $.browser.msie && $.browser.version >= 7 && c("png")
      }
      function b() {
        $.browser.msie && parseFloat($.browser.version) >= 7 && c("gif")
      }
      function c(n) {
        $("#zoom_table td").each(function () {
          var r = $(this).css("background-image").replace(/\.(png|gif|none)\"\)$/, "." + n + '")');
          $(this).css("background-image", r)
        });
        var l = m.children("img"),
          k = l.attr("src").replace(/\.(png|gif|none)$/, "." + n);
        l.attr("src", k)
      }
      function e() {
        if (h) return false;
        h = true;
        $("#zoom").unbind("click");
        b();
        m.attr("scaleImg") != "true" && j.html("");
        m.hide();
        $("#zoom").animate({
          top: m.attr("curTop") + "px",
          left: m.attr("curLeft") + "px",
          opacity: "hide",
          width: "1px",
          height: "1px"
        },
        500, null, function () {
          m.attr("scaleImg") == "true" && j.html("");
          d();
          h = false
        });
        return false
      }
      function f(n) {
        if (h) return false;
        h = true;
        var l = $($(this).attr("href")),
          k = a.width,
          r = a.height,
          u = window.innerWidth || window.document.documentElement.clientWidth || window.document.body.clientWidth,
          w = window.innerHeight || window.document.documentElement.clientHeight || window.document.body.clientHeight,
          v = window.pageXOffset || window.document.documentElement.scrollLeft || window.document.body.scrollLeft,
          y = window.pageYOffset || window.document.documentElement.scrollTop || window.document.body.scrollTop;
        v = {
          width: u,
          height: w,
          x: v,
          y: y
        };
        u = (k || l.width()) + 60;
        w = (r || l.height()) + 60;
        k = v;
        y = Math.max(k.height / 2 - w / 2 + y, 0);
        k = k.width / 2 - u / 2;
        r = n.pageY;
        n = n.pageX;
        m.attr("curTop", r);
        m.attr("curLeft", n);
        m.attr("scaleImg", a.scaleImg ? "true" : "false");
        $("#zoom").hide().css({
          position: "absolute",
          top: r + "px",
          left: n + "px",
          width: "1px",
          height: "1px"
        });
        b();
        m.hide();
        a.closeOnClick && $("#zoom").click(e);
        if (a.scaleImg) {
          j.html(l.html());
          $("#zoom_content img").css("width", "100%")
        } else j.html("");
        $("#zoom").animate({
          top: y + "px",
          left: k + "px",
          opacity: "show",
          width: u,
          height: w
        },
        500, null, function () {
          a.scaleImg != true && j.html(l.html());
          d();
          m.show();
          h = false
        });
        return false
      }
      var g = (a = a || {}) && a.directory ? a.directory : "images",
      h = false;
      if ($("#zoom").length == 0) {
        var i = $.browser.msie ? "gif" : "png";
        g = '<div id="zoom" style="display:none;">         <table id="zoom_table" style="border-collapse:collapse; width:100%; height:100%;">         <tbody>         <tr>         <td class="tl" style="background:url(' + g + "/tl." + i + ') 0 0 no-repeat; width:20px; height:20px; overflow:hidden;" />         <td class="tm" style="background:url(' + g + "/tm." + i + ') 0 0 repeat-x; height:20px; overflow:hidden;" />         <td class="tr" style="background:url(' + g + "/tr." + i + ') 100% 0 no-repeat; width:20px; height:20px; overflow:hidden;" />         </tr>         <tr>         <td class="ml" style="background:url(' + g + "/ml." + i + ') 0 0 repeat-y; width:20px; overflow:hidden;" />         <td class="mm" style="background:#fff; vertical-align:top; padding:10px;">         <div id="zoom_content">         </div>         </td>         <td class="mr" style="background:url(' + g + "/mr." + i + ') 100% 0 repeat-y;  width:20px; overflow:hidden;" />         </tr>         <tr>         <td class="bl" style="background:url(' + g + "/bl." + i + ') 0 100% no-repeat; width:20px; height:20px; overflow:hidden;" />         <td class="bm" style="background:url(' + g + "/bm." + i + ') 0 100% repeat-x; height:20px; overflow:hidden;" />         <td class="br" style="background:url(' + g + "/br." + i + ') 100% 100% no-repeat; width:20px; height:20px; overflow:hidden;" />         </tr>         </tbody>         </table>         <a href="#" title="Close" id="zoom_close" style="position:absolute; top:0; left:0;">         <img src="' + g + "/closebox." + i + '" alt="Close" style="border:none; margin:0; padding:0;" />         </a>         </div>';
        $("body").append(g);
        $("html").click(function (n) {
          $(n.target).parents("#zoom:visible").length == 0 && e()
        });
        $(document).keyup(function (n) {
          n.keyCode == 27 && $("#zoom:visible").length > 0 && e()
        });
        $("#zoom_close").click(e)
      }
      $("#zoom");
      $("#zoom_table");
      var m = $("#zoom_close"),
        j = $("#zoom_content");
      $("td.ml,td.mm,td.mr");
      return $(this).click(f)
    }
  }
})();
(function (a) {
  a.fn.enticeToRegister = function (d) {
    a.extend({},
    a.fn.enticeToRegister.defaults, d);
    return this.each(function () {
      var b = a(this);
      b.addClass("entice");
      b.attr("title", "You must be logged in to use this feature");
      b.tipsy();
      this.onclick = function () {
        return false
      }
    })
  };
  a.fn.enticeToRegister.defaults = {}
})(jQuery);
(function (a) {
  a.fn.repoInlineEdit = function (d) {
    var b = a.extend({},
    a.fn.repoInlineEdit.defaults, d);
    return this.each(function () {
      var c = a(this),
        e = a("#" + c.attr("rel"));

      function f() {
        if (a.trim(c.text()) == "") b.is_owner ? c.html('<p><em class="placeholder">click here to add a ' + b.name + "</em></p>") : c.remove();
        else b.is_owner && c.find("p:last-child").append(' <em class="placeholder edit-text">click to edit</em>')
      }
      f();
      if (b.is_owner) {
        c.addClass("editable-text");
        c.click(function (g) {
          if (!a(g.target).is("a")) {
            c.hide();
            e.show()
          }
        });
        e.find(".cancel").click(function () {
          c.show();
          e.hide()
        });
        e.find("form").submit(function () {
          a.fn.repoInlineEdit.load();
          e.css({
            opacity: 0.4
          });
          var g = a(this),
            h = g.serialize();
          a.post(g.attr("action"), h, function (i, m) {
            if (m == "success") {
              if (b.name == "homepage") {
                m = i.match(/^https?:/) ? i : "http://" + i;
                i = '<a href="' + m + '" rel="nofollow">' + i + "</a>"
              }
              c.html(a.simpleFormat(i));
              f();
              e.hide();
              c.show();
              a.fn.repoInlineEdit.endLoad()
            }
            e.css({
              opacity: 1
            })
          });
          return false
        })
      }
    })
  };
  a.fn.repoInlineEdit.defaults = {
    is_owner: false,
    name: "description"
  };
  a.fn.repoInlineEdit.load = function () {
    a("#repo_details_loader").show()
  };
  a.fn.repoInlineEdit.endLoad = function () {
    a("#repo_details_loader").hide()
  };
  a.simpleFormat = function (d) {
    d = d.replace(/\r\n?/, "\n");
    d = d.replace(/\n\n+/, "</p>\n\n<p>");
    d = d.replace(/([^\n]\n)(?=[^\n])/, "<br />");
    return "<p>" + d + "</p>"
  }
})(jQuery);
(function (a) {
  a.fn.repoList = function (d) {
    var b = a.extend({},
    a.fn.repoList.defaults, d);
    return this.each(function () {
      var c = a(this),
        e = c.find(".repo_list"),
        f = c.find(".show-more"),
        g = c.find(".filter_input").val(""),
        h = g.val(),
        i = f.length == 0 ? true : false,
      m = null,
      j = false;
      g[0] && typeof g[0].onsearch == "object" && g.addClass("native");
      f.click(function () {
        if (j) return false;
        var k = f.spin();
        j = true;
        a(b.selector).load(b.ajaxUrl, function () {
          i = true;
          k.parents(".repos").find(".filter_selected").click();
          k.stopSpin()
        });
        k.hide();
        return false
      });

      function n() {
        var k = e.find("li");
        if (m) {
          k.hide();
          e.find("li." + m).show()
        } else k.show();
        g.val() != "" && k.filter(":not(:Contains('" + g.val() + "'))").hide()
      }
      c.find(".repo_filter").click(function () {
        var k = a(this);
        c.find(".repo_filterer a").removeClass("filter_selected");
        k.addClass("filter_selected");
        m = k.attr("rel");
        i ? n() : f.click();
        return false
      });

      function l() {
        g.val() == "" ? g.addClass("placeholder") : g.removeClass("placeholder")
      }
      g.bind("keyup blur click", function () {
        if (this.value != h) {
          h = this.value;
          i ? n() : f.click();
          l()
        }
      });
      l()
    })
  };
  a.fn.repoList.defaults = {
    selector: "#repo_listing",
    ajaxUrl: "/dashboard/ajax_your_repos"
  }
})(jQuery);
(function (a) {
  a.fn.editable = function (d, b) {
    var c = {
      target: d,
      name: "value",
      id: "id",
      type: "text",
      width: "auto",
      height: "auto",
      event: "click",
      onblur: "cancel",
      loadtype: "GET",
      loadtext: "Loading...",
      placeholder: "Click to edit",
      submittype: "post",
      loaddata: {},
      submitdata: {}
    };
    b && a.extend(c, b);
    var e = a.editable.types[c.type].plugin ||
    function () {},
      f = a.editable.types[c.type].submit ||
    function () {},
      g = a.editable.types[c.type].buttons || a.editable.types.defaults.buttons,
      h = a.editable.types[c.type].content || a.editable.types.defaults.content,
      i = a.editable.types[c.type].element || a.editable.types.defaults.element,
      m = c.callback ||
    function () {};
    a.isFunction(a(this)[c.event]) || (a.fn[c.event] = function (j) {
      return j ? this.bind(c.event, j) : this.trigger(c.event)
    });
    a(this).attr("title", c.tooltip);
    c.autowidth = "auto" == c.width;
    c.autoheight = "auto" == c.height;
    return this.each(function () {
      a.trim(a(this).html()) || a(this).html(c.placeholder);
      a(this)[c.event](function () {
        var j = this;
        if (!j.editing) {
          function n() {
            a(j).html(j.revert);
            j.editing = false;
            a.trim(a(j).html()) || a(j).html(c.placeholder)
          }
          a(j).css("visibility", "hidden");
          if (c.width != "none") c.width = c.autowidth ? a(j).width() : c.width;
          if (c.height != "none") c.height = c.autoheight ? a(j).height() : c.height;
          a(this).css("visibility", "");
          a(this).html().toLowerCase().replace(/;/, "") == c.placeholder.toLowerCase().replace(/;/, "") && a(this).html("");
          j.editing = true;
          j.revert = a(j).html();
          a(j).html("");
          var l = a("<form/>");
          if (c.cssclass)"inherit" == c.cssclass ? l.attr("class", a(j).attr("class")) : l.attr("class", c.cssclass);
          if (c.style) if ("inherit" == c.style) {
            l.attr("style", a(j).attr("style"));
            l.css("display", a(j).css("display"))
          } else l.attr("style", c.style);
          var k = i.apply(l, [c, j]),
            r;
          if (c.loadurl) {
            var u = setTimeout(function () {
              k.disabled = true;
              h.apply(l, [c.loadtext, c, j])
            },
            100),
              w = {};
            w[c.id] = j.id;
            a.isFunction(c.loaddata) ? a.extend(w, c.loaddata.apply(j, [j.revert, c])) : a.extend(w, c.loaddata);
            a.ajax({
              type: c.loadtype,
              url: c.loadurl,
              data: w,
              async: false,
              success: function (v) {
                window.clearTimeout(u);
                r = v;
                k.disabled = false
              }
            })
          } else if (c.data) {
            r = c.data;
            if (a.isFunction(c.data)) r = c.data.apply(j, [j.revert, c])
          } else r = j.revert;
          h.apply(l, [r, c, j]);
          k.attr("name", c.name);
          g.apply(l, [c, j]);
          e.apply(l, [c, j]);
          a(j).append(l);
          a(":input:visible:enabled:first", l).focus();
          c.select && k.select();
          k.keydown(function (v) {
            if (v.keyCode == 27) {
              k.blur();
              v.preventDefault();
              n()
            }
          });
          if ("cancel" == c.onblur) k.blur(function () {
            u = setTimeout(n, 500)
          });
          else if ("submit" == c.onblur) k.blur(function () {
            l.submit()
          });
          else a.isFunction(c.onblur) ? k.blur(function () {
            c.onblur.apply(j, [k.val(), c])
          }) : k.blur(function () {});
          l.submit(function (v) {
            u && clearTimeout(u);
            v.preventDefault();
            f.apply(l, [c, j]);
            if (a.isFunction(c.target)) {
              v = c.target.apply(j, [k.val(), c]);
              a(j).html(v);
              j.editing = false;
              m.apply(j, [j.innerHTML, c]);
              a.trim(a(j).html()) || a(j).html(c.placeholder)
            } else {
              v = {};
              v[c.name] = k.val();
              v[c.id] = j.id;
              a.isFunction(c.submitdata) ? a.extend(v, c.submitdata.apply(j, [j.revert, c])) : a.extend(v, c.submitdata);
              a(j).html(c.indicator);
              a.ajax({
                type: c.submittype,
                url: c.target,
                data: v,
                success: function (y) {
                  a(j).html(y);
                  j.editing = false;
                  m.apply(j, [j.innerHTML, c]);
                  a.trim(a(j).html()) || a(j).html(c.placeholder)
                }
              })
            }
            return false
          });
          a(j).bind("reset", n)
        }
      })
    })
  };
  a.editable = {
    types: {
      defaults: {
        element: function () {
          var d = a('<input type="hidden">');
          a(this).append(d);
          return d
        },
        content: function (d) {
          a(":input:first", this).val(d)
        },
        buttons: function (d, b) {
          if (d.submit) {
            var c = a('<input type="submit">');
            c.val(d.submit);
            a(this).append(c)
          }
          if (d.cancel) {
            c = a('<input type="button">');
            c.val(d.cancel);
            a(this).append(c);
            a(c).click(function () {
              a(b).html(b.revert);
              b.editing = false
            })
          }
        }
      },
      text: {
        element: function (d) {
          var b = a("<input>");
          d.width != "none" && b.width(d.width);
          d.height != "none" && b.height(d.height);
          b.attr("autocomplete", "off");
          a(this).append(b);
          return b
        }
      },
      textarea: {
        element: function (d) {
          var b = a("<textarea>");
          d.rows ? b.attr("rows", d.rows) : b.height(d.height);
          d.cols ? b.attr("cols", d.cols) : b.width(d.width);
          a(this).append(b);
          return b
        }
      },
      select: {
        element: function () {
          var d = a("<select>");
          a(this).append(d);
          return d
        },
        content: function (d) {
          if (String == d.constructor) {
            eval("var json = " + d);
            for (var b in json) if (json.hasOwnProperty(b)) if ("selected" != b) {
              d = a("<option>").val(b).append(json[b]);
              a("select", this).append(d)
            }
          }
          a("select", this).children().each(function () {
            a(this).val() == json.selected && a(this).attr("selected", "selected")
          })
        }
      }
    },
    addInputType: function (d, b) {
      a.editable.types[d] = b
    }
  }
})(jQuery);
(function (a) {
  a.extend(a.fn, {
    livequery: function (b, c, e) {
      var f = this,
        g;
      if (a.isFunction(b)) {
        e = c;
        c = b;
        b = undefined
      }
      a.each(a.livequery.queries, function (h, i) {
        if (f.selector == i.selector && f.context == i.context && b == i.type && (!c || c.$lqguid == i.fn.$lqguid) && (!e || e.$lqguid == i.fn2.$lqguid)) return (g = i) && false
      });
      g = g || new a.livequery(this.selector, this.context, b, c, e);
      g.stopped = false;
      a.livequery.run(g.id);
      return this
    },
    expire: function (b, c, e) {
      var f = this;
      if (a.isFunction(b)) {
        e = c;
        c = b;
        b = undefined
      }
      a.each(a.livequery.queries, function (g, h) {
        if (f.selector == h.selector && f.context == h.context && (!b || b == h.type) && (!c || c.$lqguid == h.fn.$lqguid) && (!e || e.$lqguid == h.fn2.$lqguid) && !this.stopped) a.livequery.stop(h.id)
      });
      return this
    }
  });
  a.livequery = function (b, c, e, f, g) {
    this.selector = b;
    this.context = c || document;
    this.type = e;
    this.fn = f;
    this.fn2 = g;
    this.elements = [];
    this.stopped = false;
    this.id = a.livequery.queries.push(this) - 1;
    f.$lqguid = f.$lqguid || a.livequery.guid++;
    if (g) g.$lqguid = g.$lqguid || a.livequery.guid++;
    return this
  };
  a.livequery.prototype = {
    stop: function () {
      var b = this;
      if (this.type) this.elements.unbind(this.type, this.fn);
      else this.fn2 && this.elements.each(function (c, e) {
        b.fn2.apply(e)
      });
      this.elements = [];
      this.stopped = true
    },
    run: function () {
      if (!this.stopped) {
        var b = this,
          c = this.elements,
          e = a(this.selector, this.context),
          f = e.not(c);
        this.elements = e;
        if (this.type) {
          f.bind(this.type, this.fn);
          c.length > 0 && a.each(c, function (g, h) {
            a.inArray(h, e) < 0 && a.event.remove(h, b.type, b.fn)
          })
        } else {
          f.each(function () {
            b.fn.apply(this)
          });
          this.fn2 && c.length > 0 && a.each(c, function (g, h) {
            a.inArray(h, e) < 0 && b.fn2.apply(h)
          })
        }
      }
    }
  };
  a.extend(a.livequery, {
    guid: 0,
    queries: [],
    queue: [],
    running: false,
    timeout: null,
    checkQueue: function () {
      if (a.livequery.running && a.livequery.queue.length) for (var b = a.livequery.queue.length; b--;) a.livequery.queries[a.livequery.queue.shift()].run()
    },
    pause: function () {
      a.livequery.running = false
    },
    play: function () {
      a.livequery.running = true;
      a.livequery.run()
    },
    registerPlugin: function () {
      a.each(arguments, function (b, c) {
        if (a.fn[c]) {
          var e = a.fn[c];
          a.fn[c] = function () {
            var f = e.apply(this, arguments);
            a.livequery.run();
            return f
          }
        }
      })
    },
    run: function (b) {
      if (b != undefined) a.inArray(b, a.livequery.queue) < 0 && a.livequery.queue.push(b);
      else a.each(a.livequery.queries, function (c) {
        a.inArray(c, a.livequery.queue) < 0 && a.livequery.queue.push(c)
      });
      a.livequery.timeout && clearTimeout(a.livequery.timeout);
      a.livequery.timeout = setTimeout(a.livequery.checkQueue, 20)
    },
    stop: function (b) {
      b != undefined ? a.livequery.queries[b].stop() : a.each(a.livequery.queries, function (c) {
        a.livequery.queries[c].stop()
      })
    }
  });
  a.livequery.registerPlugin("append", "prepend", "after", "before", "wrap", "attr", "removeAttr", "addClass", "removeClass", "toggleClass", "empty", "remove");
  a(function () {
    a.livequery.play()
  });
  var d = a.prototype.init;
  a.prototype.init = function (b, c) {
    var e = d.apply(this, arguments);
    if (b && b.selector) {
      e.context = b.context;
      e.selector = b.selector
    }
    if (typeof b == "string") {
      e.context = c || document;
      e.selector = b
    }
    return e
  };
  a.prototype.init.prototype = a.prototype
})(jQuery);

function definePrimer(a) {
  function d(b, c, e, f) {
    this.container = b;
    this.width = c;
    this.height = e;
    this.primer = this;
    this.useGlobalMouseMove = f;
    this.actions = [];
    this.init();
    this.autoDraw = true
  }
  d.prototype = {
    init: function () {
      a("html head").append("<style>.primer_text { position: absolute; margin: 0; padding: 0; line-height: normal; z-index: 0;}</style>");
      var b = a(this.container).eq(0);
      b.append('<div id="primer_text"></div>');
      var c = a("#primer_text", b).eq(0);
      c.css("position", "relative");
      this.element = c;
      c = document.createElement("canvas");
      c.width = this.width;
      c.height = this.height;
      c.style.zIndex = "0";
      if (c.getContext) b.append(c);
      else window.G_vmlCanvasManager && window.G_vmlCanvasManager.initElement(a(c).appendTo(b).get(0));
      b = a("canvas", b);
      var e = b[0];
      this.context = e.getContext("2d");
      this.root = new d.Layer;
      this.root.bind(this);
      this.setupExt();
      var f = this;
      this.useGlobalMouseMove ? a("body").bind("mousemove", function (g) {
        if (a(g.target).parents().find(this.container)) {
          var h = a(e);
          h = h.offset();
          g.localX = g.pageX - h.left;
          g.localY = g.pageY - h.top;
          f.ghost(g)
        } else f.outOfBounds()
      }) : b.eq(0).bind("mousemove", function (g) {
        var h = a(g.currentTarget).offset();
        g.localX = g.pageX - h.left;
        g.localY = g.pageY - h.top;
        f.ghost(g)
      })
    },
    getX: function () {
      return 0
    },
    getY: function () {
      return 0
    },
    getGlobalX: function () {
      return 0
    },
    getGlobalY: function () {
      return 0
    },
    addChild: function (b) {
      b.bind(this);
      this.root.addChild(b);
      this.draw()
    },
    removeChild: function (b) {
      this.root.removeChild(b);
      this.draw()
    },
    draw: function (b) {
      if (b || this.autoDraw) {
        this.context.clearRect(0, 0, this.width, this.height);
        a(".primer_text", this.element).remove();
        this.setupExt();
        this.root.draw()
      }
    },
    ghost: function (b) {
      this.root.ghost(b);
      for (var c in this.actions) {
        b = this.actions[c];
        b[0](b[1])
      }
      this.actions = []
    },
    outOfBounds: function () {},
    setupExt: function () {
      this.context.ext = {
        textAlign: "left",
        font: "10px sans-serif"
      }
    }
  };
  d.Layer = function () {
    this.element = this.context = this.primer = null;
    this.children = [];
    this.calls = [];
    this.yVal = this.xVal = 0;
    this.visibleVal = true;
    this.mouseoverVal = function () {};
    this.mouseoutVal = function () {};
    this.mouseWithin = false
  };
  d.Layer.prototype = {
    bind: function (b) {
      this.parent = b;
      this.primer = b.primer;
      this.context = this.primer.context;
      this.element = this.primer.element;
      for (var c in this.children) this.children[c].bind(this)
    },
    getX: function () {
      return this.xVal
    },
    setX: function (b) {
      this.xVal = b;
      this.primer && this.primer.draw()
    },
    getY: function () {
      return this.yVal
    },
    setY: function (b) {
      this.yVal = b;
      this.primer && this.primer.draw()
    },
    getGlobalX: function () {
      return this.getX() + this.parent.getGlobalX()
    },
    getGlobalY: function () {
      return this.getY() + this.parent.getGlobalY()
    },
    getVisible: function () {
      return this.visibleVal
    },
    setVisible: function (b) {
      this.visibleVal = b;
      this.primer && this.primer.draw()
    },
    addChild: function (b) {
      b.bind(this);
      this.children.push(b);
      this.primer && this.primer.draw()
    },
    removeChild: function (b) {
      for (var c = [], e = 0; e < this.children.length; e++) {
        var f = this.children[e];
        f != b && c.push(f)
      }
      this.children = c
    },
    mouseover: function (b) {
      this.mouseoverVal = b
    },
    mouseout: function (b) {
      this.mouseoutVal = b
    },
    setFillStyle: function (b) {
      this.calls.push(["fillStyle", b])
    },
    setStrokeStyle: function (b) {
      this.calls.push(["strokeStyle", b])
    },
    setLineWidth: function (b) {
      this.calls.push(["lineWidth", b])
    },
    beginPath: function () {
      this.calls.push(["beginPath"])
    },
    moveTo: function (b, c) {
      this.calls.push(["moveTo", b, c])
    },
    lineTo: function (b, c) {
      this.calls.push(["lineTo", b, c])
    },
    quadraticCurveTo: function (b, c, e, f) {
      this.calls.push(["quadraticCurveTo", b, c, e, f])
    },
    arc: function (b, c, e, f, g, h) {
      this.calls.push(["arc", b, c, e, f, g, h])
    },
    fill: function () {
      this.calls.push(["fill"])
    },
    stroke: function () {
      this.calls.push(["stroke"])
    },
    fillRect: function (b, c, e, f) {
      this.calls.push(["fillRect", b, c, e, f])
    },
    fillText: function (b, c, e, f, g) {
      this.calls.push(["fillText", b, c, e, f, g])
    },
    setTextAlign: function (b) {
      this.calls.push(["textAlign", b])
    },
    setFont: function (b) {
      this.calls.push(["font", b])
    },
    rect: function (b, c, e, f) {
      this.beginPath();
      this.moveTo(b, c);
      this.lineTo(b + e, c);
      this.lineTo(b + e, c + f);
      this.lineTo(b, c + f);
      this.lineTo(b, c)
    },
    roundedRect: function (b, c, e, f, g) {
      this.beginPath();
      this.moveTo(b, c + g);
      this.lineTo(b, c + f - g);
      this.quadraticCurveTo(b, c + f, b + g, c + f);
      this.lineTo(b + e - g, c + f);
      this.quadraticCurveTo(b + e, c + f, b + e, c + f - g);
      this.lineTo(b + e, c + g);
      this.quadraticCurveTo(b + e, c, b + e - g, c);
      this.lineTo(b + g, c);
      this.quadraticCurveTo(b, c, b, c + g)
    },
    fillRoundedRect: function (b, c, e, f, g) {
      this.roundedRect(b, c, e, f, g);
      this.fill()
    },
    draw: function () {
      if (this.getVisible()) {
        this.context.save();
        this.context.translate(this.getX(), this.getY());
        for (var b in this.calls) {
          var c = this.calls[b];
          switch (c[0]) {
          case "strokeStyle":
            this.context.strokeStyle = c[1];
            break;
          case "lineWidth":
            this.context.lineWidth = c[1];
            break;
          case "fillStyle":
            this.context.fillStyle = c[1];
            break;
          case "fillRect":
            this.context.fillRect(c[1], c[2], c[3], c[4]);
            break;
          case "beginPath":
            this.context.beginPath();
            break;
          case "moveTo":
            this.context.moveTo(c[1], c[2]);
            break;
          case "lineTo":
            this.context.lineTo(c[1], c[2]);
            break;
          case "quadraticCurveTo":
            this.context.quadraticCurveTo(c[1], c[2], c[3], c[4]);
            break;
          case "arc":
            this.context.arc(c[1], c[2], c[3], c[4], c[5], c[6]);
            break;
          case "fill":
            this.context.fill();
            break;
          case "stroke":
            this.context.stroke();
            break;
          case "fillText":
            this.extFillText(c[1], c[2], c[3], c[4], c[5]);
            break;
          case "textAlign":
            this.context.ext.textAlign = c[1];
          case "font":
            this.context.ext.font = c[1]
          }
        }
        for (b = 0; b < this.children.length; b++) this.children[b].draw();
        this.context.restore()
      }
    },
    extFillText: function (b, c, e, f, g) {
      var h = "";
      h += "left: " + (this.getGlobalX() + c) + "px;";
      h += "top: " + (this.getGlobalY() + e) + "px;";
      h += "width: " + f + "px;";
      h += "text-align: " + this.context.ext.textAlign + ";";
      h += "color: " + this.context.fillStyle + ";";
      h += "font: " + this.context.ext.font + ";";
      this.element.append('<p class="primer_text ' + g + '" style="' + h + '">' + b + "</p>")
    },
    ghost: function (b) {
      if (this.getVisible()) {
        this.context.save();
        this.context.translate(this.getX(), this.getY());
        for (var c in this.calls) {
          var e = this.calls[c];
          switch (e[0]) {
          case "fillRect":
            this.ghostFillRect(b, e[1], e[2], e[3], e[4]);
            break;
          case "beginPath":
            this.context.beginPath();
            break;
          case "moveTo":
            this.context.moveTo(e[1], e[2]);
            break;
          case "lineTo":
            this.context.lineTo(e[1], e[2]);
            break;
          case "quadraticCurveTo":
            this.context.quadraticCurveTo(e[1], e[2], e[3], e[4]);
            break;
          case "arc":
            this.context.arc(e[1], e[2], e[3], e[4], e[5], e[6]);
            break;
          case "fill":
            this.ghostFill(b);
            break
          }
        }
        if (!jQuery.browser.safari) {
          b.localX -= this.getX();
          b.localY -= this.getY()
        }
        for (c in this.children) this.children[c].ghost(b);
        if (!jQuery.browser.safari) {
          b.localX += this.getX();
          b.localY += this.getY()
        }
        this.context.restore()
      }
    },
    ghostDetect: function (b) {
      if (jQuery.browser.safari) {
        testX = b.localX;
        testY = b.localY
      } else {
        testX = b.localX - this.getX();
        testY = b.localY - this.getY()
      }
      if (this.context.isPointInPath(testX, testY)) {
        this.mouseWithin || this.primer.actions.push([this.mouseoverVal, b]);
        this.mouseWithin = true
      } else {
        this.mouseWithin && this.primer.actions.push([this.mouseoutVal, b]);
        this.mouseWithin = false
      }
    },
    ghostFillRect: function (b, c, e, f, g) {
      this.context.beginPath();
      this.context.moveTo(c, e);
      this.context.lineTo(c + f, e);
      this.context.lineTo(c + f, e + g);
      this.context.lineTo(c, e + g);
      this.context.lineTo(c, e);
      this.ghostDetect(b)
    },
    ghostFill: function (b) {
      this.ghostDetect(b)
    }
  };
  return d
}
var Primer = definePrimer(window.jQuery);
(function (a) {
  a.put = function (d, b, c, e) {
    if (jQuery.isFunction(b)) {
      c = b;
      b = {}
    }
    return jQuery.ajax({
      type: "PUT",
      url: d,
      data: b,
      success: c,
      dataType: e
    })
  };
  a.del = function (d, b, c, e) {
    if (jQuery.isFunction(b)) {
      c = b;
      b = {}
    }
    return jQuery.ajax({
      type: "DELETE",
      url: d,
      data: b,
      success: c,
      dataType: e
    })
  }
})(jQuery);
(function (a) {
  a.smartPoller = function (d, b) {
    if (a.isFunction(d)) {
      b = d;
      d = 1000
    } (function c() {
      setTimeout(function () {
        b.call(this, c)
      },
      d);
      d *= 1.5
    })()
  }
})(jQuery);
(function (a) {
  a.fn.spamjax = function (d, b) {
    if (a.isFunction(b)) {
      var c = d;
      d = b;
      b = c
    }
    b = b || {};
    c = {};
    if (!a.facebox) b.facebox = null;
    c.complete = function (e, f) {
      d.call(this, e.responseText, f)
    };
    if (b.confirmation) c.beforeSubmit = function () {
      var e = confirm(b.confirmation);
      if (!e) return false;
      b.facebox && a.facebox.loading()
    };
    else if (b.facebox) c.beforeSubmit = a.facebox.loading;
    return a(this).ajaxForm(a.extend(b, c))
  }
})(jQuery);
(function (a) {
  a.fn.tipsy = function (d) {
    d = a.extend({
      fade: false,
      gravity: "n",
      title: "title",
      fallback: ""
    },
    d || {});
    this.hover(function () {
      a.data(this, "cancel.tipsy", true);
      var b = a.data(this, "active.tipsy");
      if (!b) {
        b = a('<div class="tipsy"><div class="tipsy-inner"/></div>');
        b.css({
          position: "absolute",
          zIndex: 100000
        });
        a.data(this, "active.tipsy", b)
      }
      if (this.hasAttribute("title") || !this.hasAttribute("original-title")) a(this).attr("original-title", a(this).attr("title") || "").removeAttr("title");
      var c;
      if (typeof d.title == "string") c = a(this).attr(d.title == "title" ? "original-title" : d.title);
      else if (typeof d.title == "function") c = d.title.call(this);
      b.find(".tipsy-inner").text(c || d.fallback);
      c = a.extend({},
      a(this).offset(), {
        width: this.offsetWidth,
        height: this.offsetHeight
      });
      b.get(0).className = "tipsy";
      b.remove().css({
        top: 0,
        left: 0,
        visibility: "hidden",
        display: "block"
      }).appendTo(document.body);
      var e = b[0].offsetWidth,
        f = b[0].offsetHeight,
        g = typeof d.gravity == "function" ? d.gravity.call(this) : d.gravity;
      switch (g.charAt(0)) {
      case "n":
        b.css({
          top: c.top + c.height,
          left: c.left + c.width / 2 - e / 2
        }).addClass("tipsy-north");
        break;
      case "s":
        b.css({
          top: c.top - f,
          left: c.left + c.width / 2 - e / 2
        }).addClass("tipsy-south");
        break;
      case "e":
        b.css({
          top: c.top + c.height / 2 - f / 2,
          left: c.left - e
        }).addClass("tipsy-east");
        break;
      case "w":
        b.css({
          top: c.top + c.height / 2 - f / 2,
          left: c.left + c.width
        }).addClass("tipsy-west");
        break
      }
      d.fade ? b.css({
        opacity: 0,
        display: "block",
        visibility: "visible"
      }).animate({
        opacity: 0.8
      }) : b.css({
        visibility: "visible"
      })
    },


    function () {
      a.data(this, "cancel.tipsy", false);
      var b = this;
      setTimeout(function () {
        if (!a.data(this, "cancel.tipsy")) {
          var c = a.data(b, "active.tipsy");
          d.fade ? c.stop().fadeOut(function () {
            a(this).remove()
          }) : c.remove()
        }
      },
      100)
    });
    this.bind("tipsy.reload", function () {
      if (this.hasAttribute("title")) a(this).attr("original-title", a(this).attr("title") || "").removeAttr("title");
      var b;
      if (typeof d.title == "string") b = a(this).attr(d.title == "title" ? "original-title" : d.title);
      else if (typeof d.title == "function") b = d.title.call(this);
      var c = a.data(this, "active.tipsy");
      c.find(".tipsy-inner").text(b || d.fallback);
      b = a.extend({},
      a(this).offset(), {
        width: this.offsetWidth,
        height: this.offsetHeight
      });
      var e = c[0].offsetWidth,
        f = c[0].offsetHeight,
        g = typeof d.gravity == "function" ? d.gravity.call(this) : d.gravity;
      switch (g.charAt(0)) {
      case "n":
        c.css({
          top: b.top + b.height,
          left: b.left + b.width / 2 - e / 2
        });
        break;
      case "s":
        c.css({
          top: b.top - f,
          left: b.left + b.width / 2 - e / 2
        });
        break;
      case "e":
        c.css({
          top: b.top + b.height / 2 - f / 2,
          left: b.left - e
        });
        break;
      case "w":
        c.css({
          top: b.top + b.height / 2 - f / 2,
          left: b.left + b.width
        });
        break
      }
    })
  };
  a.fn.tipsy.autoNS = function () {
    return a(this).offset().top > a(document).scrollTop() + a(window).height() / 2 ? "s" : "n"
  }
})(jQuery);
jQuery.fn.truncate = function (a, d) {
  d = jQuery.extend({
    chars: /\s/,
    trail: ["...", ""]
  },
  d);
  var b = {},
    c = $.browser.msie;

  function e(f) {
    c && f.style.removeAttribute("filter")
  }
  return this.each(function () {
    for (var f = jQuery(this), g = f.html().replace(/\r\n/gim, ""), h = g, i = /<\/?[^<>]*\/?>/gim, m, j = {}, n = $("*").index(this);
    (m = i.exec(h)) != null;) j[m.index] = m[0];
    h = jQuery.trim(h.split(i).join(""));
    if (h.length > a) {
      for (; a < h.length;) {
        m = h.charAt(a);
        if (m.match(d.chars)) {
          h = h.substring(0, a);
          break
        }
        a--
      }
      if (g.search(i) != -1) {
        i = 0;
        for (eachEl in j) {
          h = [h.substring(0, eachEl), j[eachEl], h.substring(eachEl, h.length)].join("");
          if (eachEl < h.length) i = h.length
        }
        f.html([h.substring(0, i), h.substring(i, h.length).replace(/<(\w+)[^>]*>.*<\/\1>/gim, "").replace(/<(br|hr|img|input)[^<>]*\/?>/gim, "")].join(""))
      } else f.html(h);
      b[n] = g;
      f.html(["<div class='truncate_less'>", f.html(), d.trail[0], "</div>"].join("")).find(".truncate_show", this).click(function () {
        f.find(".truncate_more").length == 0 && f.append(["<div class='truncate_more' style='display: none;'>", b[n], d.trail[1], "</div>"].join("")).find(".truncate_hide").click(function () {
          f.find(".truncate_more").css("background", "#fff").fadeOut("normal", function () {
            f.find(".truncate_less").css("background", "#fff").fadeIn("normal", function () {
              e(this);
              $(this).css("background", "none")
            });
            e(this)
          });
          return false
        });
        f.find(".truncate_less").fadeOut("normal", function () {
          f.find(".truncate_more").fadeIn("normal", function () {
            e(this)
          });
          e(this)
        });
        jQuery(".truncate_show", f).click(function () {
          f.find(".truncate_less").css("background", "#fff").fadeOut("normal", function () {
            f.find(".truncate_more").css("background", "#fff").fadeIn("normal", function () {
              e(this);
              $(this).css("background", "none")
            });
            e(this)
          });
          return false
        });
        return false
      })
    }
  })
};
GitHub.gravatar = function (a, d) {
  d = d || 35;
  var b = location.protocol == "https:" ? "https://secure.gravatar.com" : "http://gravatar.com",
  c = location.protocol == "https:" ? "https" : "http";
  return '<img src="' + b + "/avatar/" + a + "?s=" + d + "&d=" + c + "%3A%2F%2Fgithub.com%2Fimages%2Fgravatars%2Fgravatar-" + d + '.png" />'
};
GitHub.rename_confirmation = function () {
  return "Read the following before clicking OK:\n\n* This may take a few minutes.\n* We won't setup any redirects from your old name. This includes repository urls, your profile, any feeds, etc. In other words, if you have a popular project, you're probably going to upset a lot of people.\n* You'll need to update any .git/config's to point to your new name if you have local copies of your repo(s).\n\nReady to proceed?"
};
Function.prototype.delay = function (a) {
  return setTimeout(this, a)
};
String.prototype.capitalize = function () {
  return this.replace(/\w+/g, function (a) {
    return a.charAt(0).toUpperCase() + a.substr(1).toLowerCase()
  })
};
jQuery.expr[":"].Contains = function (a, d, b) {
  return (a.textContent || a.innerText || "").toLowerCase().indexOf(b[3].toLowerCase()) >= 0
};
$.fn.scrollTo = function (a, d) {
  var b;
  if (typeof a == "number" || !a) {
    d = a;
    b = this;
    a = "html,body"
  } else {
    b = a;
    a = this
  }
  b = $(b).offset().top - 30;
  $(a).animate({
    scrollTop: b
  },
  d || 1000);
  return this
};
$.gitbox = function (a) {
  $.facebox(function () {
    $.get(a, function (d) {
      $.facebox(d, "nopad");
      $("#facebox .footer").hide()
    })
  })
};
$.fn.spin = function () {
  return this.after('<img src="/images/modules/ajax/indicator.gif" id="spinner"/>')
};
$.fn.stopSpin = function () {
  this.next().remove();
  return this
};
$(function () {
  $(".flash .close").click(function () {
    $(this).closest(".flash").fadeOut(300)
  });
  $(".tooltipped").each(function () {
    var b = $(this),
      c = b.hasClass("downwards") ? "n" : "s";
    c = b.hasClass("rightwards") ? "w" : c;
    c = b.hasClass("leftwards") ? "e" : c;
    b.tipsy({
      gravity: c
    })
  });
  $(".toggle_link").click(function () {
    $($(this).attr("href")).toggle();
    return false
  });
  $(".hide_alert").livequery("click", function () {
    $("#site_alert").slideUp();
    $.cookie("hide_alert_vote", "t", {
      expires: 7,
      path: "/"
    });
    return false
  });
  $(".hide_div").click(function () {
    $(this).parents("div:first").fadeOut();
    return false
  });
  $("#login_field").focus();
  $("#versions_select").change(function () {
    location.href = this.value
  });
  $(document).bind("loading.facebox", function () {
    $(".clippy").hide()
  });
  $(document).bind("close.facebox", function () {
    $(".clippy").show()
  });
  $.fn.facebox && $("a[rel*=facebox]").facebox();
  $.fn.fancyZoom && $("a[rel*=fancyzoom]").fancyZoom({
    directory: "images/fancyzoom"
  });
  $.fn.truncate && $(".truncate").bind("truncate", function () {
    $(this).truncate(50, {
      chars: /.*/
    })
  }).trigger("truncate");
  $.fn.relatizeDate && $(".relatize").relatizeDate();
  $('a[href=#][alt^=""]').hover(function () {
    window.status = $(this).attr("alt")
  },


  function () {
    window.status = ""
  });
  var a = $(".topsearch input[name=q]").enhancedField();
  $.hotkey("s", function () {
    a.val("").focus()
  });
  $.repoAutocomplete = function () {
    var b = ".repo_autocompleter";
    if (! (!$.fn.autocomplete || !github_user || $(b) == 0)) {
      $(b).autocomplete("/users/ajax_repo_search", {
        delay: 10,
        width: 210,
        selectFirst: false
      });
      $(b).result(function (c, e) {
        window.location = "/" + e[0];
        return false
      });
      $(b).keydown(function (c) {
        if (!/\//.test($(b).val()) && c.keyCode == 9) if (c = $(".ac_results li:first").text()) {
          $(b).val(c);
          window.location = "/" + c;
          return false
        }
      })
    }
  };
  $.repoAutocomplete();
  $.userAutocomplete = function () {
    if (! (!$.fn.autocomplete || $(".autocompleter").length == 0)) {
      $(".autocompleter").autocomplete("/users/ajax_search", {
        formatItem: function (b) {
          b = b[0].split(" ");
          return GitHub.gravatar(b[1], 24) + " " + b[0]
        },
        formatResult: function (b) {
          return b[0].split(" ")[0]
        }
      });
      $(".autocompleter").result(function () {
        $(this).addClass("accept")
      });
      $(".autocompleter").keypress(function () {
        $(this).removeClass("accept")
      })
    }
  };
  $.userAutocomplete();
  if ($("#csrf_token").length > 0) {
    var d = "&request_uri=" + window.location.pathname + "&authenticity_token=" + $("#csrf_token").text();
    $.ajaxSetup({
      beforeSend: function (b, c) {
        b.setRequestHeader("Accept", "text/javascript");
        if (typeof c.data == "string") c.data += d;
        else if (!c.data) c.data = d
      }
    })
  } else $.ajaxSetup({
    beforeSend: function (b) {
      b.setRequestHeader("Accept", "text/javascript")
    }
  });
  $("button, .minibutton").mousedown(function () {
    $(this).addClass("mousedown")
  }).bind("mouseup mouseleave", function () {
    $(this).removeClass("mousedown")
  })
});

function clippyCopiedCallback(a) {
  var d = $("#clippy_tooltip_" + a);
  if (d.length != 0) {
    d.attr("title", "copied!").trigger("tipsy.reload");
    setTimeout(function () {
      d.attr("title", "copy to clipboard")
    },
    500)
  }
};
GitHub.highlightLines = function (a) {
  var d;
  if (a) {
    $(".line").css("background-color", "transparent");
    d = $(this).attr("rel");
    if (a.shiftKey) d = window.location.hash.replace(/-\d+/, "") + "-" + d.replace(/\D/g, "");
    window.location.hash = d
  } else d = window.location.hash;
  if (a = d.match(/#?(?:L|-)(\d+)/g)) {
    a = $.map(a, function (b) {
      return parseInt(b.replace(/\D/g, ""))
    });
    if (a.length == 1) return $("#LC" + a[0]).css("background-color", "#ffc");
    for (d = a[0]; d <= a[1]; d++) $("#LC" + d).css("background-color", "#ffc");
    $("#LC" + a[0]).scrollTo(1)
  }
  return false
};
GitHub.scrollToHilightedLine = function () {
  var a;
  a = window.location.hash;
  if (a = a.match(/^#?(?:L|-)(\d+)$/g)) {
    a = $.map(a, function (d) {
      return parseInt(d.replace(/\D/g, ""))
    });
    $("#LID" + a[0]).scrollTo(1)
  }
};
$(function () {
  GitHub.scrollToHilightedLine();
  GitHub.highlightLines();
  $(".line_numbers span").mousedown(GitHub.highlightLines);
  if (GitHub.hasWriteAccess && GitHub.currentRef) {
    $("#file-edit-link").show().click(function () {
      var a = $(this).attr("rel").replace("__ref__", GitHub.currentRef);
      $("#readme").hide();
      $("#files").children().hide().end().append('<div class="blob-editor"><img src="/images/modules/browser/loading.gif"/></div>');
      // http://github.com/NV/github-live-preview/file-edit/gh-pages/README.md
      $(".blob-editor").html('<div id="files">\
 <form action="/NV/github-live-preview/tree-save/gh-pages/README.md" method="post">\
  <input type="hidden" name="commit" value="ac6bed93fccd0339336ec3de635748f018f366a5">\
  <textarea cols="120" rows="20" name="value"># Github Markdown Preview\n\
Install [github-markdown-preview.user.js](http://userscripts.org/scripts/source/65788.user.js)\n\
\n\
Tested on Firefox 3.5, Google Chrome 4, Opera 10, and Safari GreaseKit\
</textarea> \
  <label class="standard" for="message">Commit Message:</label>\
  <textarea cols="80" rows="3" name="message"></textarea> \
  <br/> <br/> \
  <input type="submit" value="Commit"/>\
  <a href="#" class="action" id="cancel-blob-editing">cancel</a> \
 </form> \
</div>');
      $("#files").scrollTo(500);
      $("#files textarea:first").focus();
      return false
    });
    $("#cancel-blob-editing").livequery("click", function () {
      $(".blob-editor").remove();
      $("#readme").show();
      $("#files").children().show();
      return false
    })
  }
});
GitHub.Commit = {
  currentBubble: null,
  dumpEmptyClass: function () {
    $(this).removeClass("empty")
  },
  addEmptyClass: function () { ! $(this).data("clicked") && $(this).text() == "0" && $(this).addClass("empty")
  },
  highlightLine: function () {
    $(this).parent().css("background", "#ffc")
  },
  unhighlightLine: function () {
    $(this).data("clicked") || $(this).parent().css("background", "")
  },
  jumpToHashFile: function () {
    if (window.location.hash && !/diff-\d+/.test(window.location.hash)) {
      var a = window.location.hash;
      if (position = a.match(/-P(\d+)/)) {
        a = a.replace(position[0], "");
        position = position[1]
      }
      a = $('#toc a:contains("' + a.replace("#", "") + '")');
      if (a.length > 0) {
        var d = a.attr("href");
        $(d).scrollTo(1);
        position && setTimeout(function () {
          GitHub.Commit.highlightLine.call($(d + " .cp-" + position))
        },
        50)
      }
    }
  },
  observeHash: function () {
    if (window.location.hash != GitHub.Commit.oldHash) {
      GitHub.Commit.oldHash = window.location.hash;
      GitHub.Commit.jumpToHashFile()
    }
  }
};
$(function () {
  GitHub.Commit.jumpToHashFile();
  GitHub.Commit.oldHash = window.location.hash;
  setInterval(GitHub.Commit.observeHash, 50);

  function a() {
    if (GitHub.Commit.hovered) {
      GitHub.Commit.addEmptyClass.call(GitHub.Commit.hovered);
      GitHub.Commit.unhighlightLine.call(GitHub.Commit.hovered);
      GitHub.Commit.hovered = null
    }
  }
  $("#files").mouseout(function (d) {
    d = $(d.target);
    d = d.is(".bubble") ? d : d.parent();
    d.is(":not(.faux-bubble)") && a()
  });
  $("#files").mouseover(function (d) {
    d = $(d.target);
    d = d.is(".bubble") ? d : d.parent();
    if (d.is(".bubble")) {
      GitHub.Commit.hovered = d;
      d.is(".empty") && GitHub.Commit.dumpEmptyClass.call(d);
      d.is(":not(.faux-bubble)") && GitHub.Commit.highlightLine.call(d)
    }
  });
  $("#files").click(function (d) {
    var b = $(d.target);
    b = b.is(".bubble") ? b : b.parent();
    if (b.is(".bubble")) {
      b.data("clicked", true);
      GitHub.currentBubble = b;
      d = window.location.pathname.replace("commit", "comments");
      d += "/" + $.trim(b.parents(".file").find(".meta .info").text());
      if (b.is(":not(.faux-bubble)")) {
        var c = parseInt(b.attr("class").match(/cp-(\d+)/)[1]);
        d += "?position=" + c
      }
      if (c) {
        b = parseInt(b.parents("tbody").find(".line_numbers:first > a:first").text());
        d += "&line=" + (b + c - 1)
      }
      $.gitbox(d)
    }
  });
  $(document).bind("close.facebox", function () {
    if (GitHub.currentBubble) {
      var d = GitHub.currentBubble;
      $(d).data("clicked", false);
      GitHub.Commit.unhighlightLine.call(d);
      GitHub.Commit.addEmptyClass.call(d)
    }
  });
  $(".add_comment").livequery("click", function () {
    var d = $.trim($("#commit_comment_form textarea").val());
    if (d == "") $("#commit_comments .inner").scrollTo("#commit_comment_form");
    else {
      $(".actions :button").attr("disabled", true);
      $(".add_comment").spin();
      $.post($("#commit_comment_form").attr("action"), {
        body: d
      },


      function (b) {
        $(".no_one").remove();
        $(".comment_list .previewed").remove();
        $(".comment_list").append(b);
        $("#commit_comment_form textarea").val("");
        $(".actions :button").attr("disabled", false).stopSpin();
        GitHub.currentBubble.addClass("commented");
        b = GitHub.currentBubble.find("span");
        b.text(parseInt(b.text()) + 1)
      })
    }
  });
  $("#preview_comment").livequery("click", function () {
    $(".actions :button").attr("disabled", true);
    $(".add_comment").spin();
    var d = $("#commit_comment_form").attr("action").replace("create", "preview"),
      b = $.trim($("#commit_comment_form textarea").val());
    $.post(d, {
      body: b
    },


    function (c) {
      $(".no_one").remove();
      $(".comment_list .previewed").remove();
      $(".comment_list").append('<div class="previewed">' + c + "</div>");
      $(".actions :button").attr("disabled", false).stopSpin()
    })
  });
  $(".delete_comment").click(function () {
    var d = this;
    $(this).spin();
    $.post(this.href, {
      _method: "delete"
    },


    function () {
      $(d).next().remove();
      $(d).parents(".comment").hide()
    });
    return false
  });
  $("#add_comment_button").click(function () {
    var d = this;
    $(d).spin().attr("disabled", true);
    setTimeout(function () {
      $(d).parents("form").submit()
    },
    10)
  });
  $.each(["line", "file", "all"], function (d, b) {
    var c = b + "_link";
    $("a." + c).livequery("click", function () {
      $(".links a").show();
      $("h1 span").hide();
      $("span." + c).show();
      $("a." + c).hide();
      $("span." + b + "_header").show();
      $(".comment_list").hide();
      $("#comments_for_" + b).toggle();
      return false
    })
  })
});
GitHub.Commits = {
  elements: [],
  current: null,
  selected: function () {
    return $(this.elements).eq(this.current)
  },
  select: function (a) {
    this.current = a;
    $(".selected").removeClass("selected");
    return this.elements.eq(a).addClass("selected")
  },
  next: function () {
    if (this.current !== null) {
      if (this.elements.length - 1 != this.current) {
        var a = this.select(++this.current);
        a.offset().top - $(window).scrollTop() + 50 > $(window).height() && a.scrollTo(200)
      }
    } else this.select(0)
  },
  prev: function () {
    if (!this.current) {
      this.elements.eq(0).removeClass("selected");
      return this.current = null
    }
    var a = this.select(--this.current);
    a.offset().top - $(window).scrollTop() < 0 && a.scrollTo(200)
  },
  link: function (a) {
    if (GitHub.Commits.current === null) return false;
    window.location = GitHub.Commits.selected().find("[hotkey=" + a + "]").attr("href")
  }
};
$(function () {
  GitHub.Commits.elements = $(".commit");
  $.hotkeys({
    c: function () {
      GitHub.Commits.link("c")
    },
    p: function () {
      GitHub.Commits.link("p")
    },
    t: function () {
      GitHub.Commits.link("t")
    },
    j: function () {
      GitHub.Commits.next()
    },
    k: function () {
      GitHub.Commits.prev()
    }
  });
  $("#invite_link > a").click(function () {
    var a = location.pathname.match(/(.+\/commits)(\/|$)/)[1] + "/invitees";
    $.post(a, {},


    function (d) {
      if (d.length == 0) {
        $("#invitee_box > p").text("Everyone is already a GitHub user and/or there weren't any valid emails");
        $("#invitee_box input").attr("disabled", "disabled")
      } else {
        for (var b in d) {
          var c = '<li><label><input name="emails[]" value="' + d[b][0] + '" type="checkbox" /> ';
          c += d[b][1] + " <small> - " + d[b][0] + "</label></li>";
          $("#invitees").append(c)
        }
        $("#invitee_box > p").hide()
      }
    },
    "json");
    $(this).hide();
    $("#invitee_box").show();
    return false
  });
  $("#invite_form").submit(function () {
    $(this).find("input[type=submit]").attr("value", "Sending Invites...").attr("disabled", "disabled");
    $.post($(this).attr("action"), $(this).serialize(), function () {
      $("#invitee_box").html("<h3>Thanks!</h3>Your invites have been sent.")
    });
    return false
  });
  $("#invitee_box span a").click(function () {
    $("#invitee_box").hide();
    return false
  })
});
$(function () {
  var a = $(".contextswitch"),
    d = a.find(".toggle");
  d.click(function () {
    a.hasClass("nochoices") || a.toggleClass("activated")
  })
});
$(function () {
  $("#your_repos").repoList({
    selector: "#repo_listing",
    ajaxUrl: "/dashboard/ajax_your_repos"
  });
  $("#watched_repos").repoList({
    selector: "#watched_repo_listing",
    ajaxUrl: "/dashboard/ajax_watched_repos"
  });
  $(".reveal_commits, .hide_commits").live("click", function () {
    var d = $(this).parents(".details");
    d.find(".reveal, .hide_commits, .commits").toggle();
    return false
  });
  var a = false;
  $(".ajax_paginate a").live("click", function () {
    if (a) return false;
    a = true;
    var d = $(this).parent();
    $(this).html('<img src="/images/modules/ajax/indicator.gif"/>');
    $.get(this.href, function (b) {
      d.replaceWith(b);
      $(".relatize").relatizeDate();
      a = false
    });
    return false
  })
});
$(function () {
  var a = $("#repo_details");
  if (a.length != 0) {
    var d = github_user == GitHub.currentRepoOwner,
      b = GitHub.watchingRepo,
      c = GitHub.hasForked,
      e = $("#repository_description"),
      f = $("#repository_homepage");
    $(".pledgie").length > 0 && $("#repo_details").addClass("pledgified");
    $(".repohead input[type=search]").enhancedField();
    if (d) {
      $(".editable-only").show();
      $(".for-owner").show()
    }
    c ? $(".for-forked").show() : $(".for-notforked").show();
    if (github_user) if (GitHub.hasForkOfRepo != null && GitHub.hasForkOfRepo != "") {
      $(".for-hasfork").show();
      $("#your_fork_button").attr("href", "/" + GitHub.hasForkOfRepo)
    }
    $("#download_button").attr("href", GitHub.downloadRepo);
    e.repoInlineEdit({
      name: "description",
      is_owner: d
    });
    f.repoInlineEdit({
      name: "homepage",
      is_owner: d
    });
    if (a.hasClass("shortmetabox") && $.trim(e.text()) == "" && $.trim(f.text()) == "") {
      a.remove();
      $(".repohead").addClass("emptyrepohead")
    }
    if (b) {
      $("#unwatch_button").show();
      $("ul.repo-stats li.watchers").addClass("watching").attr("title", "Watchers \u2014 You're Watching")
    } else $("#watch_button").show();
    if (!github_user) {
      $("#watch_button").enticeToRegister();
      $("#fork_button").enticeToRegister()
    }
    a = function () {
      var g = $(".mirror-flag, .fork-flag");
      if (g.length > 0) {
        var h = g.offset().left - g.offsetParent().offset().left;
        if (g.length > 0) h += parseInt(g.get(0).offsetWidth);
        var i = $(".pagehead ul.actions").get(0).offsetWidth + 50;
        h = 970 - h - i;
        if (h < 0) {
          h = Math.ceil(-1 * h / 5) + 3;
          i = $.trim(g.text());
          if (h > i.length) g.find(".text").remove();
          else {
            var m = g.find("a").attr("href");
            g.find(".text").html('<a href="' + m + '">' + i.substr(0, i.length - h) + "...</a>").attr("title", i).tipsy()
          }
        }
      }
    };
    setTimeout(a, 100);
    a = $("#private_clone_url");
    GitHub.hasWriteAccess || a.remove();
    if (github_user) if (GitHub.hasWriteAccess) {
      a.show();
      $("#pull_request_item").show()
    }
  }
});
$(function () {
  var a = $("#url_box");
  if (a.length != 0) {
    a = a.find("ul.clone-urls a");
    var d = $("#url_field"),
      b = $("#url_description strong"),
      c = $("#url_box_clippy"),
      e = $();
    a.click(function () {
      var f = $(this);
      d.val(f.attr("href"));
      c.text(f.attr("href"));
      b.text(f.attr("data-permissions"));
      e.removeClass("selected");
      e = f.parent("li").addClass("selected");
      return false
    });
    $(a[0]).click();
    d.mouseup(function () {
      this.select()
    })
  }
});
$(function () {
  $("#downloads .delete").click(function () {
    confirm("Are you sure you want to delete this?") && $(this).hide().parents("form").append("deleting&hellip;").submit();
    return false
  })
});
GitHub.editableGenerator = function (a) {
  return function (d, b) {
    var c = {
      id: "field",
      tooltip: "Click to edit!",
      indicator: "Saving...",
      data: function (e) {
        return $(b).attr("data") || e
      },
      style: "display: inline",
      onblur: "submit",
      callback: function () {
        (function () {
          $(b).attr("data") && $(b).attr("data", $(b).text());
          $(b).trigger("truncate").next().show();
          $(b).trigger("afterSave.editableGenerator")
        }).delay(20)
      }
    };
    return $(this).editable($(this).attr("rel"), $.extend({},
    c, a))
  }
};
$(function () {
  $(".edit_link").click(function () {
    $(this).prev().trigger("click");
    return false
  })
});
$(function () {
  var a = {
    success: function () {
      $.smartPoller(3000, function (b) {
        $.getJSON($("#new_import").attr("action") + "/grab_authors", {},


        function (c) {
          if (c == null) return b();
          $("#wait").hide();
          $("#import_repo").show();
          if (c.length == 0) {
            $("#new_import input[type=submit]").attr("disabled", "").val("Import SVN Authors").show();
            alert("No authors were returned, please try a different URL")
          } else {
            $("#authors").show();
            $.each(c, function (e, f) {
              e = $('<tr><td><input type="text" disabled="disabled" value="' + f + '" name="svn_authors[]" /></td><td><input size="40" type="text" name="git_authors[]"/></td></tr>');
              e.appendTo("#authors-list")
            });
            $("#import-submit").show()
          }
        })
      })
    },
    beforeSubmit: function (b, c) {
      b = b[0].value;
      if (!b.match(/^https?:\/\//) && !b.match(/^svn:\/\//)) {
        alert("Please enter a valid subversion url");
        return false
      }
      c.find("input[type=submit]").hide();
      $("#import_repo").hide();
      $("#wait").show()
    }
  };
  $("#new_import").ajaxForm(a);
  $("#import-submit").click(function () {
    $(this).attr("disabled", "disabled");
    var b = $(this).parent().parent();
    b.find('input[name="svn_authors[]"]').attr("disabled", "");
    b.submit()
  });
  $("#private-clone-url > a").bind("contextmenu", function () {
    var b = $(this).text().length;
    $(this).hide().next().attr("size", b).show().focus().get(0).select();
    return false
  });

  function d() {
    $(this).hide().prev().show()
  }
  $("#private-clone-url > :input").mouseout(d).blur(d);
  $(".git_url_facebox").click(function () {
    $.facebox($($(this).attr("rel")).html(), "tip");
    return false
  });
  $(".repo span.edit").each(GitHub.editableGenerator({
    width: "350px"
  }));
  $(".repo span.editarea").each(GitHub.editableGenerator({
    type: "textarea",
    width: "550px",
    height: "100px",
    cancel: "Cancel",
    submit: "OK"
  }));
  $("span.edit, span.editarea").click(function () {
    $(this).next().hide()
  });
  $("#run_postreceive_test").click(function () {
    $.post(location.href + "/test_postreceive", {});
    $.facebox($("#postreceive_test").text());
    return false
  });
  $("#repository_postreceive_url").bind("afterSave.editableGenerator", function () {
    $("#repository_postreceive_url").text().slice(0, 4) == "http" ? $("#run_postreceive_test").show() : $("#run_postreceive_test").hide()
  });
  $(".toggle_watch").click(function () {
    if (!github_user) return true;
    $("#watch_button, #unwatch_button").toggle();
    $.post($(this).attr("href"), {});
    return false
  });
  $("#donate_activate_toggle a").click(function () {
    $(this).parent().hide();
    $("#donate_activate").show();
    return false
  });
  $("#donation_creation_in_progress").length > 0 && $("#activate_pledgie_button").attr("title", "We're creating your Pledgie account. We'll PM you when it's ready!").find("span").text("Creating account...");
  $("#pledgie_deactivate").click(function () {
    $("#paypal").val("");
    return true
  });
  $(".btn-pull-request").click(function () {
    var b = location.pathname,
      c = b.split("/")[4] || "master",
      e = b.split("/").slice(0, 3).join("/");
    $.facebox(function () {
      $.get(e + "/pull_request/" + c, function (f) {
        $.facebox(f, "nopad");
        $("#facebox .footer").hide();
        $.userAutocomplete()
      })
    });
    return false
  });
  $(".repo_toggle").click(function () {
    var b = {};
    b.field = this.id;
    b.value = this.checked ? "1" : "0";
    var c = window.location.pathname.replace(/\/edit$/, "/update");
    $.post(c, b);
    $("#rubygem_save").show()
  });
  $(".test_hook").click(function () {
    var b = $(this).spin().siblings(".right").remove().end(),
      c = location.href.replace(/hooks/, "test_service");
    $.post(c, {
      name: b.attr("rel") || ""
    },


    function () {
      b.next().remove();
      b.next().after('<div class="right"><em>Payload deployed</em></div>')
    });
    return false
  });
  $(".postreceive_hook_help").click(function () {
    $("#postreceive_urls-help").toggle();
    return false
  });
  $(".hook_edit_toggle").click(function () {
    $(".service-hook").hide();
    $("#" + this.id.replace("-toggle", "")).show();
    var b = $("#" + this.id.replace("-toggle", "-help"));
    if (!b.is(":visible")) {
      b.show();
      b.html("<pre>Loading...</pre>");
      var c = "/pjhyett/github-services/tree/master/docs/" + b.attr("id").replace("-help", "");
      $.get(c, {
        raw: "true"
      },


      function (e) {
        b.html("<pre>" + e + "</pre>")
      })
    }
    return false
  });
  $("#close_facebox").livequery("click", function () {
    $(document).trigger("close.facebox");
    return false
  });
  $("#pull_request .select_all").livequery("click", function () {
    $("#facebox :checkbox").attr("checked", true);
    return false
  });
  $("#pull_request .add_recipient").livequery("click", function () {
    var b = $(this).prev().val();
    $(this).prev().val("").css("background", "Window");
    if ($.trim(b)) {
      var c = $("#pull_request .recipients ul"),
        e = c.find("li").map(function () {
        return $.trim($(this).text())
      });
      if ($.inArray(b, e) >= 0) return c.find("li:contains(" + b + ") :checkbox").attr("checked", true);
      $("#pull_request .recipients ul").prepend('<li><label><input type="checkbox" name="message[to][]" value="' + b + '"/> ' + b + "</label>").end().find(":checkbox:first").attr("checked", true)
    }
  });
  $("#pull_request_form").livequery("submit", function () {
    var b = [],
      c = $(this).find("input[name='message[to][]']");
    c.each(function () {
      if ($(this).is(":checkbox") && !$(this).attr("checked") || $(this).is(":text") && $(this).val() == "") b.push($(this))
    });
    b.length == c.length ? $("#pull_request_error").show().text("Please select at least one recipient.") : $(this).ajaxSubmit(function () {
      $("#pull_request_error").remove();
      $("#pull_request").find("h1").text("Sent!").end().find(".pull_request_inside").empty().append("<p>Your pull request was sent.</p>").end().find(".actions span").remove().end().find("#close_facebox").text("Close");
      var e = setTimeout(function () {
        $(document).trigger("close.facebox")
      },
      2500);
      $(document).one("close.facebox", function () {
        clearTimeout(e)
      })
    });
    return false
  });
  $(".add_postreceive_url").livequery("click", function () {
    var b = $(this).parent(),
      c = b.clone(),
      e = $(this).parents("fieldset");
    c.find("input").val("");
    e.find("p:last").before(c);
    c = e.find(".remove_postreceive_url:first").clone();
    b.find("a").after(c.show());
    b.find("a:first").remove();
    return false
  });
  $(".remove_postreceive_url").livequery("click", function () {
    $(this).parent().remove();
    return false
  });
  $(".unlock_branch").click(function () {
    var b = location.pathname.split("/");
    b = "/" + b[1] + "/" + b[2] + "/unlock_branch/" + b[4];
    var c = $(this).parents(".notification");
    $(this).spin().remove();
    $.post(b, function () {
      c.hide()
    });
    return false
  });
  $("form#rebuild_latest_rubygems").livequery("submit", function () {
    location.pathname.split("/");
    var b = "/" + GitHub.currentRepoOwner + "/" + GitHub.currentRepo + "/gem/rebuild",
      c = $(this).find(".spin"),
      e = $(this).find(".status");
    c.show();
    $.post(b, [], function (f) {
      c.hide();
      f.error ? e.text("Request failed").removeClass("success").addClass("failure").show() : e.text("Queued for rebuild").removeClass("failure").addClass("success").show()
    },
    "json");
    return false
  });
  if ($("#edit_repo").length > 0) {
    $("#master_branch").change(function () {
      var b = window.location.href.replace(/edit$/, "update");
      $.put(b, {
        field: "repository_master_branch",
        value: $(this).val()
      });
      $(this).parent().find("span").show();
      return false
    });
    $(".features :checkbox").change(function () {
      var b = this,
        c = window.location.pathname.replace(/edit\/?$/, "update"),
        e = {
        field: this.name,
        value: this.checked
      };
      $(b).siblings(".flash").remove();
      $(b).siblings("label").spin();
      $.put(c, e, function () {
        $(b).siblings(".flash").remove();
        $(b).siblings("label").stopSpin().after(' <span class="flash">Updated!</span>')
      });
      return false
    });
    $("#add_new_member_link").click(function () {
      $("#add_new_member_link").parent().hide();
      $("#add_new_member").show();
      $("#add_member").focus();
      return false
    });
    $("#add_member_cancel").click(function () {
      $("#add_new_member").hide().find("input[type=text]").val("");
      $("#add_new_member_link").parent().show();
      return false
    });
    $("#add_new_member form").submit(function () {
      $("#add_member_cancel").spin();
      $("#add_new_member :submit").attr("disabled", true);
      $.post(this.action, {
        member: $("#add_member").val()
      },


      function (b) {
        $.inArray($(b).find("a:first").text(), $(".members li a:not(.action)").map(function () {
          return $(this).text()
        })) == -1 && $(".members").append(b);
        $("#add_member").val("").css("background-color", "").focus();
        $("#add_new_member :submit").attr("disabled", false);
        $("#spinner").remove()
      });
      return false
    });
    $(".revoke_member").click(function () {
      $.post(this.href, "", function (b) {
        console.log(b)
      });
      $(this).parent().parent().remove();
      return false
    });
    $(".toggle_permission").click(function () {
      if ($(".repo").is(":not(.public)") && !confirm("Are you POSITIVE you want to make this private repository public?")) return false;
      $(".public_repo, .private_repo, .public_security, .private_security").toggle();
      $(".repo").is(".public") ? $(".repo").removeClass("public").addClass("private") : $(".repo").removeClass("private").addClass("public");
      $.post(this.href, "");
      return false
    });
    $("#copy_permissions ul li a").click(function () {
      $(this).parents("form").submit();
      return false
    });
    $("#delete_repo").click(function () {
      var b = "Are you sure you want to delete this repository?  There is no going back.";
      return confirm(b)
    });
    $("#reveal_delete_repo_info").click(function () {
      $(this).toggle();
      $("#delete_repo_info").toggle();
      return false
    });
    $("#repo_rename > input[type=submit]").click(function () {
      if (!confirm(GitHub.rename_confirmation())) return false
    });
    $("#remove_auto_responder").livequery("click", function () {
      $.ajax({
        async: true,
        type: "PUT",
        url: window.location.pathname.replace("edit", "update_pull_request_auto_response")
      });
      $("#auto_responder_details").html('<a href="#" id="add_auto_responder">Add auto-responder</a>');
      return false
    });
    $("#add_auto_responder").livequery("click", function () {
      $.facebox({
        div: "#auto_response_editor"
      },
      "nopad");
      $("#facebox .footer").hide();
      return false
    });
    $(".cancel_auto_response_action").livequery("click", function () {
      $.facebox.close();
      return false
    });
    $(".auto_response_form").livequery("submit", function () {
      var b = this,
        c;
      $(b).ajaxSubmit(function () {
        $.facebox.close();
        c = $(b).find("textarea").val().slice(0, 40);
        if (c.length >= 40) c += "...";
        $("#auto_responder_details").html("<em>" + c + '</em> (<a href="#" id="remove_auto_responder">Remove auto-responder</a>)')
      });
      return false
    })
  }
});
GitHub.Fluid = {
  init: function () {
    if (window.fluid) {
      GitHub.Fluid.setDockCount();
      GitHub.Fluid.addMenuItems()
    }
  },
  setDockCount: function () {
    if (window.fluid.dockBadge) window.fluid.dockBadge = $(".inbox strong a").text()
  },
  addMenuItems: function () {
    with(GitHub.Fluid) {
      addDockJump("My Account", "/account");
      addDockJump("News", "/news");
      addDockJump("Repositories", "/repositories");
      addDockJump("Popular Watched", "/popular/watched");
      addDockJump("Popular Forked", "/popular/forked")
    }
  },
  addDockJump: function (a, d) {
    window.fluid.addDockMenuItem && window.fluid.addDockMenuItem(a, function () {
      window.location = "http://github.com" + d
    })
  }
};
$(GitHub.Fluid.init);
$(function () {
  $("#forkqueue #head-sha").text();
  $("#forkqueue .untested:first").each(function () {
    a()
  });

  function a() {
    var c = $("#forkqueue .untested").length,
      e = $("#head-sha").text();
    if (c > 0) {
      var f = $("#forkqueue .untested:first");
      c = f.attr("name");
      $(".icons", f).html('<img src="/images/modules/ajax/indicator.gif" alt="Processing" />');
      $.get("forkqueue/applies/" + e + "/" + c, function (g) {
        f.removeClass("untested");
        if (g == "NOPE") {
          f.addClass("unclean");
          $(".icons", f).html("")
        } else if (g == "YUP") {
          f.addClass("clean");
          $(".icons", f).html("")
        } else $(".icons", f).html("err");
        a()
      })
    }
  }
  $(".action-choice").change(function () {
    var c = $(this).attr("value");
    if (c == "ignore") {
      c = $(this).parents("form").contents().find("input:checked");
      c.each(function (e, f) {
        e = $(f).attr("ref");
        $(f).parents("tr").children(".icons").html("ignoring...");
        $.post("forkqueue/ignore/" + e, {});
        $(f).parents("tr").fadeOut("normal", function () {
          $(this).remove()
        })
      })
    } else if (c == "apply") {
      c = $(this).parents("form");
      c.submit()
    }
    $(this).children(".default").attr("selected", 1)
  });
  var d = [];
  $("#forkqueue input[type=checkbox]").click(function (c) {
    var e = $(this).attr("class").match(/^r-(\d+)-(\d+)$/),
      f = parseInt(e[1]);
    e = parseInt(e[2]);
    if (c.shiftKey && d.length > 0) {
      c = d[d.length - 1];
      var g = c.match(/^r-(\d+)-(\d+)$/);
      c = parseInt(g[1]);
      g = parseInt(g[2]);
      if (f == c) {
        c = $(this).attr("checked") == true;
        g = [e, g].sort();
        e = g[0];
        g = g[1];
        for (e = e; e < g; e++) c == true ? $("#forkqueue input.r-" + f + "-" + e).attr("checked", "true") : $("#forkqueue input.r-" + f + "-" + e).removeAttr("checked")
      }
    }
    d.push($(this).attr("class"))
  });
  $("#forkqueue a.select_all").click(function () {
    $(this).removeClass("select_all");
    var c = $(this).attr("class");
    $(this).addClass("select_all");
    $("#forkqueue tr." + c + " input[type=checkbox]").attr("checked", "true");
    d = [];
    return false
  });
  $("#forkqueue a.select_none").click(function () {
    $(this).removeClass("select_none");
    var c = $(this).attr("class");
    $(this).addClass("select_none");
    $("#forkqueue tr." + c + " input[type=checkbox]").removeAttr("checked");
    d = [];
    return false
  });
  $("table#queue tr.not-applied:first").each(function () {
    b()
  });
  $("#change-branch").click(function () {
    $("#int-info").hide();
    $("#int-change").show();
    return false
  });
  $("#change-branch-nevermind").click(function () {
    $("#int-change").hide();
    $("#int-info").show();
    return false
  });

  function b() {
    var c = $("table#queue tr.not-applied").length,
      e = $("#head-sha").text();
    if (c > 0) {
      var f = $("#total-commits").text();
      $("#current-commit").text(f - c + 1);
      var g = $("table#queue tr.not-applied:first");
      c = g.attr("name");
      $(".date", g).html("applying");
      $(".icons", g).html('<img src="/images/modules/ajax/indicator.gif" alt="Processing" />');
      $.post("patch/" + e + "/" + c, function (h) {
        g.removeClass("not-applied");
        if (h == "NOPE") {
          g.addClass("unclean_failure");
          $(".date", g).html("failed");
          $(".icons", g).html('<img src="/images/icons/exclamation.png" alt="Failed" />')
        } else {
          $("#head-sha").text(h);
          g.addClass("clean");
          $(".date", g).html("applied");
          $(".apply-status", g).attr("value", "1");
          $(".icons", g).html('<img src="/images/modules/dashboard/news/commit.png" alt="Applied" />')
        }
        b()
      })
    } else {
      $("#new-head-sha").attr("value", e);
      $("#finalize").show()
    }
  }
  $("#refresh-network-data").each(function () {
    $.post("network_meta", function () {
      $("#fq-refresh").show();
      $("#fq-notice").hide()
    })
  })
});
$(function () {
  if ($(".business .logos").length > 0) {
    var a = [
      ["Shopify", "shopify.png", "http://shopify.com/"],
      ["CustomInk", "customink.png", "http://customink.com/"],
      ["Pivotal Labs", "pivotallabs.png", "http://pivotallabs.com/"],
      ["FiveRuns", "fiveruns.png", "http://fiveruns.com/"],
      ["PeepCode", "peepcode.png", "http://peepcode.com/"],
      ["Frogmetrics", "frogmetrics.png", "http://frogmetrics.com/"],
      ["Upstream", "upstream.png", "http://upstream-berlin.com/"],
      ["Terralien", "terralien.png", "http://terralien.com/"],
      ["Planet Argon", "planetargon.png", "http://planetargon.com/"],
      ["Tightrope Media Systems", "tightropemediasystems.png", "http://trms.com/"],
      ["Rubaidh", "rubaidh.png", "http://rubaidh.com/"],
      ["Iterative Design", "iterativedesigns.png", "http://iterativedesigns.com/"],
      ["GiraffeSoft", "giraffesoft.png", "http://giraffesoft.com/"],
      ["Evil Martians", "evilmartians.png", "http://evilmartians.com/"],
      ["Crimson Jet", "crimsonjet.png", "http://crimsonjet.com/"],
      ["Alonetone", "alonetone.png", "http://alonetone.com/"],
      ["EntryWay", "entryway.png", "http://entryway.net/"],
      ["Fingertips", "fingertips.png", "http://fngtps.com/"],
      ["Run Code Run", "runcoderun.png", "http://runcoderun.com/"],
      ["Be a Magpie", "beamagpie.png", "http://be-a-magpie.com/"],
      ["Rocket Rentals", "rocketrentals.png", "http://rocket-rentals.de/"],
      ["Connected Flow", "connectedflow.png", "http://connectedflow.com/"],
      ["Dwellicious", "dwellicious.png", "http://dwellicious.com/"],
      ["Assay Depot", "assaydepot.png", "http://www.assaydepot.com/"],
      ["Centro", "centro.png", "http://www.centro.net/"],
      ["Debuggable Ltd.", "debuggable.png", "http://debuggable.com/"],
      ["Blogage.de", "blogage.png", "http://blogage.de/"],
      ["ThoughtBot", "thoughtbot.png", "http://www.thoughtbot.com/"],
      ["Viget Labs", "vigetlabs.png", "http://www.viget.com/"],
      ["RateMyArea", "ratemyarea.png", "http://www.ratemyarea.com/"],
      ["Abloom", "abloom.png", "http://abloom.at/"],
      ["LinkingPaths", "linkingpaths.png", "http://www.linkingpaths.com/"],
      ["MIKAMAI", "mikamai.png", "http://mikamai.com/"],
      ["BEKK", "bekk.png", "http://www.bekk.no/"],
      ["Reductive Labs", "reductivelabs.png", "http://www.reductivelabs.com/"],
      ["Sexbyfood", "sexbyfood.png", "http://www.sexbyfood.com/"],
      ["Factorial, LLC", "yfactorial.png", "http://yfactorial.com/"],
      ["SnapMyLife", "snapmylife.png", "http://www.snapmylife.com/"],
      ["Scrumy", "scrumy.png", "http://scrumy.com/"],
      ["TinyMassive", "tinymassive.png", "http://www.tinymassive.com/"],
      ["SOCIALTEXT", "socialtext.png", "http://www.socialtext.com/"],
      ["All-Seeing Interactive", "allseeinginteractive.png", "http://allseeing-i.com/"],
      ["Howcast", "howcast.png", "http://www.howcast.com/"],
      ["Relevance Inc", "relevance.png", "http://thinkrelevance.com/"],
      ["Nitobi Software Inc", "nitobi.png", "http://www.nitobi.com/"],
      ["99designs", "99designs.png", "http://99designs.com/"],
      ["EdgeCase, LLC", "edgecase.png", "http://edgecase.com"],
      ["Plinky", "plinky.png", "http://www.plinky.com/"],
      ["One Design Company", "onedesigncompany.png", "http://onedesigncompany.com/"],
      ["CollectiveIdea", "collectiveidea.png", "http://collectiveidea.com/"],
      ["Stateful Labs", "statefullabs.png", "http://stateful.net/"],
      ["High Groove Studios", "highgroove.png", "http://highgroove.com/"],
      ["Exceptional", "exceptional.png", "http://www.getexceptional.com/"],
      ["DealBase", "dealbase.png", "http://www.dealbase.com/"],
      ["Silver Needle", "silverneedle.png", "http://silverneedlesoft.com/"],
      ["No Kahuna", "nokahuna.png", "http://nokahuna.com/"],
      ["Double Encore", "doubleencore.png", "http://www.doubleencore.com/"],
      ["Yahoo", "yahoo.gif", "http://yahoo.com/"],
      ["EMI Group Limited", "emi.png", "http://emi.com/"],
      ["TechCrunch", "techcrunch.png", "http://techcrunch.com/"],
      ["WePlay", "weplay.png", "http://weplay.com/"]],
      d = function () {
      var b = $(".business .logos table");
      $.each(a, function (g, h) {
        b.append('<tr><td><a href="' + h[2] + '"><img src="http://assets' + g % 4 + ".github.com/images/modules/home/customers/" + h[1] + '" alt="' + h[0] + '" /></a></td></tr>')
      });
      parseInt($(".business .slide").css("top"));
      var c = $(".business .logos td").length - 4,
        e = 0;

      function f() {
        e += 1;
        var g = parseInt($(".business .slide").css("top"));
        if (Math.abs(g + c * 75) < 25) {
          $(".business .slide").css("top", 0);
          e = 0
        } else $(".business .slide").animate({
          top: "-" + e * 75 + "px"
        },
        1500)
      }
      setInterval(f, 3000)
    };
    setTimeout(d, 1000)
  }
});
$(function () {
  $(".cancel-compose").click(function () {
    window.location = "/inbox";
    return false
  });
  $("#inbox .del a").click(function () {
    var a = this;
    $.ajax({
      url: $(this).attr("rel"),
      data: {
        _method: "delete"
      },
      type: "POST",
      success: function () {
        $(a).parents(".item").hide()
      }
    });
    return false
  });
  $("#message .del a").click(function () {
    $.ajax({
      url: window.location.href,
      data: {
        _method: "delete"
      },
      type: "POST",
      success: function () {
        window.location = "/inbox"
      }
    });
    return false
  });
  $("#reveal_deleted").click(function () {
    $(this).parent().hide();
    $(".hidden_message").show();
    return false
  })
});
$(function () {
  $("#impact_graph").length > 0 && GitHub.ImpactGraph.drawImpactGraph()
});
GitHub.ImpactGraph = {
  colors: null,
  data: null,
  chunkVerticalSpace: 2,
  initColors: function (a) {
    seedColors = [
      [222, 0, 0],
      [255, 141, 0],
      [255, 227, 0],
      [38, 198, 0],
      [0, 224, 226],
      [0, 33, 226],
      [218, 0, 226]];
    this.colors = [];
    var d = 0;
    for (var b in a) {
      var c = seedColors[d % 7];
      if (d > 6) c = [this.randColorValue(c[0]), this.randColorValue(c[1]), this.randColorValue(c[2])];
      this.colors.push(c);
      d += 1
    }
  },
  drawImpactGraph: function () {
    var a = {},
      d = $("#impact_graph").attr("rel"),
      b = this;
    $.getJSON("/" + d + "/graphs/impact_data", function (c) {
      b.initColors(c.authors);
      var e = b.createCanvas(c);
      c = b.padChunks(c);
      b.data = c;
      $.each(c.buckets, function (f, g) {
        b.drawBucket(a, g, f)
      });
      b.drawAll(e, c, a);
      b.authorHint()
    })
  },
  createCanvas: function (a) {
    var d = a.buckets.length * 50 * 2 - 50,
      b = 0;
    for (var c in a.buckets) {
      var e = a.buckets[c],
        f = 0;
      for (var g in e.i) {
        var h = e.i[g];
        f += this.normalizeImpact(h[1]) + this.chunkVerticalSpace
      }
      if (f > b) b = f
    }
    $("#impact_graph div").remove();
    a = $("#impact_graph");
    a.height(b + 50).css("border", "1px solid #aaa");
    $("#caption").show();
    a.append('<canvas width="' + d + '" height="' + (b + 30) + '"></canvas>');
    d = $("#impact_graph canvas")[0];
    return d.getContext("2d")
  },
  padChunks: function (a) {
    for (var d in a.authors) {
      var b = this.findFirst(d, a),
        c = this.findLast(d, a);
      for (b = b + 1; b < c; b++) this.bucketHasAuthor(a.buckets[b], d) || a.buckets[b].i.push([d, 0])
    }
    return a
  },
  bucketHasAuthor: function (a, d) {
    for (var b = 0; b < a.i.length; b++) if (a.i[b][0] == parseInt(d)) return true;
    return false
  },
  findFirst: function (a, d) {
    for (var b = 0; b < d.buckets.length; b++) if (this.bucketHasAuthor(d.buckets[b], a)) return b
  },
  findLast: function (a, d) {
    for (var b = d.buckets.length - 1; b >= 0; b--) if (this.bucketHasAuthor(d.buckets[b], a)) return b
  },
  colorFor: function (a) {
    a = this.colors[a];
    return "rgb(" + a[0] + "," + a[1] + "," + a[2] + ")"
  },
  randColorValue: function (a) {
    var d = Math.round(Math.random() * 100) - 50;
    a = a + d;
    if (a > 255) a = 255;
    if (a < 0) a = 0;
    return a
  },
  drawBucket: function (a, d, b) {
    var c = 0,
      e = this;
    $.each(d.i, function (f, g) {
      f = g[0];
      var h = e.normalizeImpact(g[1]);
      a[f] || (a[f] = []);
      a[f].push([b * 100, c, 50, h, g[1]]);
      c = c + h + e.chunkVerticalSpace
    })
  },
  normalizeImpact: function (a) {
    return a <= 9 ? a + 1 : a <= 5000 ? Math.round(10 + a / 50) : Math.round(100 + Math.log(a) * 10)
  },
  drawAll: function (a, d, b) {
    this.drawStreams(a, b, null);
    this.drawDates(d)
  },
  drawStreams: function (a, d, b) {
    a.clearRect(0, 0, 10000, 500);
    $(".activator").remove();
    for (var c in d) c != b && this.drawStream(c, d, a, true);
    b != null && this.drawStream(b, d, a, false)
  },
  drawStream: function (a, d, b, c) {
    b.fillStyle = this.colorFor(a);
    chunks = d[a];
    for (var e = 0; e < chunks.length; e++) {
      var f = chunks[e];
      b.fillRect(f[0], f[1], f[2], f[3]);
      c && this.placeActivator(a, d, b, f[0], f[1], f[2], f[3], f[4]);
      if (e != 0) {
        b.beginPath();
        b.moveTo(previousChunk[0] + 50, previousChunk[1]);
        b.bezierCurveTo(previousChunk[0] + 75, previousChunk[1], f[0] - 25, f[1], f[0], f[1]);
        b.lineTo(f[0], f[1] + f[3]);
        b.bezierCurveTo(f[0] - 25, f[1] + f[3], previousChunk[0] + 75, previousChunk[1] + previousChunk[3], previousChunk[0] + 50, previousChunk[1] + previousChunk[3]);
        b.fill()
      }
      previousChunk = f
    }
  },
  drawStats: function (a, d) {
    chunks = d[a];
    for (a = 0; a < chunks.length; a++) {
      d = chunks[a];
      var b = d[4];
      b > 10 && this.drawStat(b, d[0], d[1] + d[3] / 2)
    }
  },
  drawStat: function (a, d, b) {
    var c = "";
    c += "position: absolute;";
    c += "left: " + d + "px;";
    c += "top: " + b + "px;";
    c += "width: 50px;";
    c += "text-align: center;";
    c += "color: #fff;";
    c += "font-size: 9px;";
    c += "z-index: 0;";
    $("#impact_graph").append('<p class="stat" style="' + c + '">' + a + "</p>")
  },
  drawDate: function (a, d, b) {
    b += 3;
    var c = "";
    c += "position: absolute;";
    c += "left: " + d + "px;";
    c += "top: " + b + "px;";
    c += "width: 50px;";
    c += "text-align: center;";
    c += "color: #888;";
    c += "font-size: 9px;";
    $("#impact_graph").append('<p style="' + c + '">' + a + "</p>")
  },
  placeActivator: function (a, d, b, c, e, f, g) {
    e += 5;
    var h = "";
    h += "position: absolute;";
    h += "left: " + c + "px;";
    h += "top: " + e + "px;";
    h += "width: " + f + "px;";
    h += "height: " + g + "px;";
    h += "z-index: 100;";
    h += "cursor: pointer;";
    c = "a" + c + "-" + e;
    $("#impact_graph").append('<div class="activator" id="' + c + '" style="' + h + '">&nbsp;</div>');
    var i = this;
    $("#" + c).mouseover(function (m) {
      $(m.target).css("background-color", "black").css("opacity", "0.08");
      i.drawAuthor(a)
    }).mouseout(function (m) {
      $(m.target).css("background-color", "transparent");
      i.clearAuthor();
      i.authorHint()
    }).mousedown(function () {
      $(".stat").remove();
      i.clearAuthor();
      i.drawStreams(b, d, a);
      i.drawStats(a, d);
      i.drawSelectedAuthor(a);
      i.authorHint()
    })
  },
  drawDates: function (a) {
    var d = this;
    $.each(a.buckets, function (b, c) {
      var e = 0;
      $.each(c.i, function (h, i) {
        e += d.normalizeImpact(i[1]) + 1
      });
      var f = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
        g = new Date;
      g.setTime(c.d * 1000);
      c = "" + g.getDate() + " " + f[g.getMonth()] + " " + g.getFullYear();
      d.drawDate(c, b * 100, e + 7)
    })
  },
  authorText: function (a, d, b) {
    var c = null;
    c = b < 25 ? "selected_author_text" : "author_text";
    var e = "";
    e += "position: absolute;";
    e += "left: " + d + "px;";
    e += "top: " + b + "px;";
    e += "width: 920px;";
    e += "color: #444;";
    e += "font-size: 18px;";
    $("#impact_legend").append('<p id="' + c + '" style="' + e + '">' + a + "</p>")
  },
  authorHint: function () {
    this.authorText('<span style="color: #aaa;">mouse over the graph for more details</span>', 0, 30)
  },
  drawAuthor: function (a) {
    this.clearAuthor();
    var d = $("#impact_legend canvas")[0].getContext("2d");
    d.fillStyle = this.colorFor(a);
    d.strokeStyle = "#888888";
    d.fillRect(0, 30, 20, 20);
    d.strokeRect(0.5, 30.5, 19, 19);
    a = this.data.authors[a].n;
    this.authorText(a + ' <span style="color: #aaa;">(click for more info)</span>', 25, 30)
  },
  drawSelectedAuthor: function (a) {
    this.clearSelectedAuthor();
    var d = $("#impact_legend canvas")[0].getContext("2d");
    d.fillStyle = this.colorFor(a);
    d.strokeStyle = "#000000";
    d.fillRect(0, 0, 20, 20);
    d.strokeRect(0.5, 0.5, 19, 19);
    var b = this.data.authors[a];
    a = b.n;
    d = b.c;
    var c = b.a;
    b = b.d;
    this.authorText(a + " (" + d + " commits, " + c + " additions, " + b + " deletions)", 25, 0)
  },
  clearAuthor: function () {
    var a = $("#impact_legend canvas")[0].getContext("2d");
    a.clearRect(0, 30, 920, 20);
    $("#author_text").remove()
  },
  clearSelectedAuthor: function () {
    var a = $("#impact_legend canvas")[0].getContext("2d");
    a.clearRect(0, 0, 920, 20);
    $("#selected_author_text").remove()
  }
};
GitHub.Issues = {
  active: null,
  repoURL: null,
  list: [],
  currentListHash: "list",
  init: function () {
    var a, d;
    GitHub.Issues.repoURL = "/NV/github-live-preview/issues/";
    if (window.location.hash && (d = window.location.hash.match(/sort=(\w+)/))) setTimeout(function () {
      $("#sort_by_" + d[1]).click()
    },
    100);
    if (window.location.hash && (a = window.location.hash.match(/issue\/(\d+)/))) {
      var b, c;
      if (c = window.location.hash.match(/comment\/(\d+)/)) b = c[1];
      if ($("#issue_" + a[1]).size() == 0) {
        c = window.location.pathname.match(/^\/[^\/]+\/[^\/]+\/issues/)[0] + "/";
        c = c + a[1] + "/find";
        if (b) c = c + "?comment=" + b;
        window.location = c;
        return false
      }
      GitHub.Issues.showIssue(a[1]);
      $("#issues .loading").hide();
      $("#issues #issue_list").show();
      b && GitHub.Issues.adjustViewForComment(b)
    } else {
      $("#issues #issue_list .issue").show();
      $("#issues .loading").hide();
      $("#issues #issue_list").show();
      GitHub.Issues.adjustViewForTarget()
    }
    GitHub.Issues.Dragger.updateHandles();
    GitHub.Issues.Nav.init()
  },
  adjustViewForComment: function (a) {
    a = $("#comment_" + a);
    a.size() && a.scrollTo(10)
  },
  toggleCreateIssueForm: function () {
    $(".create_issue").hasClass("disabled") ? this.hideCreateIssueForm() : this.showCreateIssueForm()
  },
  showCreateIssueForm: function () {
    $("#new_issue").show().find("input[type=text]").val("").focus();
    $("#issues .display .empty").hide();
    $("#issues .display .sortbar").hide();
    $("#issue_list").hide();
    $("#action_list").hide();
    $(".create_issue img").attr("src", "/images/modules/issues/create_issue_disabled_button.png");
    $(".create_issue").addClass("disabled")
  },
  hideCreateIssueForm: function () {
    $("#new_issue").hide();
    $("#issues .display .empty").show();
    $("#issues .display .sortbar").show();
    $("#issue_list").show();
    $("#action_list").show();
    $(".create_issue img").attr("src", "/images/modules/issues/create_issue_button.png");
    $(".create_issue").removeClass("disabled")
  },
  ajaxifyEditIssueForm: function (a) {
    var d = $(a).parents(".issue:first");
    a.ajaxForm({
      type: "PUT",
      dataType: "json",
      success: function (b) {
        d.find(".issue_title").html(b.title);
        d.find(".body:first").html(b.body);
        GitHub.Issues.hideEditIssueForm()
      }
    });
    a.addClass("ajaxified")
  },
  showEditIssueForm: function () {
    var a = $("#issue_" + this.active),
      d = a.find(".edit_issue");
    d.is(":not(.ajaxified)") && this.ajaxifyEditIssueForm(d);
    a.find(".meta").hide();
    a.find(".details").hide();
    d.show()
  },
  hideEditIssueForm: function () {
    var a = $("#issue_" + this.active);
    a.find(".meta").show();
    a.find(".details").show();
    a.find(".edit_issue").hide()
  },
  showEditCommentForm: function (a) {
    a.find("form").is(":not(.ajaxified)") && this.ajaxifyEditCommentForm(a);
    a.find(".body, form").toggle()
  },
  ajaxifyEditCommentForm: function (a) {
    var d = a.find("form"),
      b = a.find(".body");
    d.ajaxForm({
      type: "PUT",
      dataType: "json",
      success: function (c) {
        b.html(c.body);
        GitHub.Issues.hideEditCommentForm(a)
      }
    });
    d.addClass("ajaxified")
  },
  hideEditCommentForms: function () {
    var a = $("#issue_" + this.active);
    a.find(".body").show();
    a.find(".edit_issue_comment_form").hide()
  },
  hideEditCommentForm: function (a) {
    a.find(".body").show();
    a.find("form").hide()
  },
  validateComment: function (a) {
    a = $(a);
    if (a.find("textarea").val().replace(/\s+$/, "").match(/.+/)) return true;
    else {
      var d = a.find(".status");
      d.text("Comment must not be empty").show();
      setTimeout(function () {
        d.fadeOut("normal")
      },
      3000);
      return false
    }
  },
  disableSortable: function () {
    GitHub.Issues.collab && $("#issues").removeClass("collab")
  },
  enableSortable: function () {
    GitHub.Issues.collab && $("#issues").addClass("collab")
  },
  showIssue: function (a) {
    GitHub.Issues.active = a;
    GitHub.Issues.Nav.setHash("issue/" + a);
    $("#issues .display .sortbar").hide();
    var d = null;
    $("#issues .display .list .issue").each(function () {
      var b = $(this);
      if (b.attr("id") == "issue_" + a) {
        b.addClass("active");
        b.show();
        d = b
      } else b.hide()
    });
    this.targetNone();
    d.removeClass("closed").addClass("open");
    d.find(".details").css("display", "block");
    d.find(".info .actions").show();
    if (github_user != null) {
      GitHub.Issues.collab && d.find(".label .remove").show();
      if (!d.hasClass("read")) {
        d.addClass("read");
        GitHub.Issues.decrementUnreadCount();
        $.post(this.repoURL + a + "/read", {})
      }
    }
    $("#issues .admin .back_link").show().parent().find(".selectors").hide();
    GitHub.Issues.adjustViewForTarget()
  },
  markAsRead: function (a) {
    a = a instanceof jQuery ? a : $("#issue_" + a);
    var d = a.attr("id").split("_")[1];
    if (!a.hasClass("read")) {
      a.addClass("read");
      $.post(this.repoURL + d + "/read", {})
    }
    GitHub.Issues.decrementUnreadCount()
  },
  markAsUnread: function (a) {
    a = a instanceof jQuery ? a : $("#issue_" + a);
    var d = a.attr("id").split("_")[1];
    if (a.hasClass("read")) {
      a.removeClass("read");
      $.post(this.repoURL + d + "/unread", {})
    }
    GitHub.Issues.incrementUnreadCount()
  },
  changeUnreadCount: function (a) {
    var d = $("#unread_count").text();
    a = (d = d.match(/\((\d+)\)/)) ? parseInt(d[1]) + a : a < 0 ? 0 : 1;
    a == 0 ? $("#unread_count").text("") : $("#unread_count").text("(" + a + ")")
  },
  decrementUnreadCount: function () {
    this.changeUnreadCount(-1)
  },
  incrementUnreadCount: function () {
    this.changeUnreadCount(1)
  },
  changeOpenCount: function (a) {
    var d = $(".repohead ul.tabs li a.selected").text();
    d = d.match(/Issues \((\d+)\)/);
    a = parseInt(d[1]) + a;
    $(".repohead ul.tabs li a.selected").text("Issues (" + a + ")");
    a == 0 ? $("#open_count").text("") : $("#open_count").text("(" + a + ")")
  },
  decrementOpenCount: function () {
    this.changeOpenCount(-1)
  },
  incrementOpenCount: function () {
    this.changeOpenCount(1)
  },
  hideIssue: function () {
    this.hideEditCommentForms();
    this.hideEditIssueForm();
    this.targetIssue(this.active);
    GitHub.Issues.active = null;
    GitHub.Issues.Nav.setHash(GitHub.Issues.listHash());
    $("#issues .display .sortbar").show();
    $("#issues .admin .back_link").hide().parent().find(".selectors").show();
    var a = $("#issues .display .list .active");
    a.find(".label .remove").hide();
    a.find(".details").hide();
    a.find(".info .actions").hide();
    a.removeClass("open").addClass("closed").removeClass("active");
    $("#issues #issue_list .issue").show();
    GitHub.Issues.adjustViewForTarget()
  },
  openIssue: function (a) {
    if (GitHub.Issues.active) {
      a = GitHub.Issues.active;
      GitHub.Issues.hideIssue()
    }
    var d = $("#issue_" + a);
    GitHub.Issues.target()[0].id == d[0].id && GitHub.Issues.targetNext();
    d.remove();
    GitHub.Issues.incrementOpenCount();
    $.post(GitHub.Issues.repoURL + a + "/open", {})
  },
  closeIssue: function (a) {
    if (GitHub.Issues.active) {
      a = GitHub.Issues.active;
      GitHub.Issues.hideIssue()
    }
    var d = $("#issue_" + a);
    GitHub.Issues.target()[0].id == d[0].id && GitHub.Issues.targetNext();
    d.remove();
    GitHub.Issues.decrementOpenCount();
    $.post(GitHub.Issues.repoURL + a + "/close", {})
  },
  moveIssueToTop: function (a) {
    a = $("#issue_" + a);
    var d = {
      target: a
    };
    GitHub.Issues.Dragger.startDrag(d);
    a.remove();
    $("#issue_list").prepend(a);
    a.find(".meta").click(GitHub.Issues.issueRowClickHandler);
    a.find(".top.handle").click(GitHub.Issues.issueRowClickHandler);
    GitHub.Issues.Dragger.stopDrag(d)
  },
  issueRowClickHandler: function (a) {
    a = $(a.target);
    var d = a.is(".issue") ? a : a.parents(".issue");
    d = d.attr("id").split("_")[1];
    if (a.is(".top") || a.parents(".top").length > 0) {
      GitHub.Issues.moveIssueToTop(d);
      return false
    }
    if (a.is(":input") || a.is("a:not(.issue_title)")) return true;
    GitHub.Issues.showIssue(d);
    return false
  },
  createIssue: function () {
    $(".create_issue:first").click()
  },
  createLabel: function () {
    $(".create_label").click()
  },
  backToInbox: function () {
    if (GitHub.Issues.active) {
      var a = $("#open_issues_link").attr("href");
      if (window.location.pathname == a) {
        $(".back_link").click();
        /sort=/.test(window.location.hash) && $("#sort_by_priority").click()
      } else window.location = a
    }
  },
  backToIssues: function () {
    GitHub.Issues.active && $(".back_link").click()
  },
  markSelectedAsRead: function () {
    $(".selected").each(function () {
      GitHub.Issues.markAsRead($(this))
    })
  },
  markSelectedAsUnread: function () {
    $(".selected").each(function () {
      GitHub.Issues.markAsUnread($(this))
    })
  },
  closeSelected: function () {
    $("#issues #action_list").get(0).selectedIndex = 1;
    $("#issues #action_list").change()
  },
  removeLabelFromSelected: function () {
    console.log("not implemented")
  },
  removeSelectedFromView: function () {
    /\/labels\//.test(location.pathname) ? GitHub.Issues.removeLabelFromSelected() : GitHub.Issues.closeSelected()
  },
  targetNext: function () {
    var a = GitHub.Issues.target();
    a.next().length > 0 ? a.next().addClass("target") : a.prev().addClass("target")
  },
  targetIssue: function (a) {
    this.targetNone();
    $("#issue_" + a).addClass("target")
  },
  targetNone: function () {
    GitHub.Issues.target().removeClass("target")
  },
  targetFirst: function () {
    this.targetNone();
    $(".issue:first").addClass("target")
  },
  moveTargetDown: function () {
    if (GitHub.Issues.active) {
      var a = $("#issue_" + GitHub.Issues.active).next();
      if (a.size()) {
        a.addClass("target");
        GitHub.Issues.showTarget()
      } else GitHub.Issues.backToIssues()
    } else {
      $("#issue_list li").not(":last").filter(".target").removeClass("target").next().addClass("target");
      GitHub.Issues.adjustViewForTarget()
    }
  },
  moveTargetUp: function () {
    if (GitHub.Issues.active) {
      var a = $("#issue_" + GitHub.Issues.active).prev();
      if (a.size()) {
        a.addClass("target");
        GitHub.Issues.showTarget()
      } else GitHub.Issues.backToIssues()
    } else {
      $("#issue_list li").not(":first").filter(".target").removeClass("target").prev().addClass("target");
      GitHub.Issues.adjustViewForTarget()
    }
  },
  adjustViewForTarget: function () {
    var a = GitHub.Issues.target();
    if (a.offset()) if (a.offset().top - $(window).scrollTop() + 20 > $(window).height()) a.scrollTo(10);
    else a.offset().top - $(window).scrollTop() < 0 && $("html,body").animate({
      scrollTop: a.offset().top - $(window).height()
    },
    10)
  },
  showTarget: function () {
    GitHub.Issues.showIssue(GitHub.Issues.target().attr("id").split("_")[1])
  },
  toggleSelectTarget: function () {
    var a = GitHub.Issues.target().find(":checkbox");
    a.attr("checked") ? a.attr("checked", false) : a.attr("checked", true);
    a.change()
  },
  target: function () {
    return $(".target")
  },
  focusIssuesSearch: function () {
    $("#issues .searchbar").focus()
  },
  showHotkeyHelp: function () {
    if (GitHub.Issues.keyboardShortcuts) return $.facebox(GitHub.Issues.keyboardShortcuts);
    $.facebox(function () {
      $.get("/javascripts/github/issues.js", function (a) {
        var d = [],
          b = "";
        a = a.replace(/[\s\S]*hotkeys\({([\s\S]+?)}\)[\s\S]*/mg, "$1");
        $.each(a.split("\n"), function (c, e) {
          e = e.replace(/[\':,]/g, "");
          e = e.replace("GitHub.Issues.", "");
          if (e = $.trim(e)) {
            e = e.split(" ");
            b = e[1].replace(/([A-Z])/g, " $1").toLowerCase();
            b = b.slice(0, 1).toUpperCase() + b.slice(1, b.length);
            d.push("  " + e[0] + " " + b)
          }
        });
        GitHub.Issues.keyboardShortcuts = "<h2>Keyboard Shortcuts</h2><pre>" + d.join("\n") + "</pre>";
        $.facebox(GitHub.Issues.keyboardShortcuts)
      })
    })
  },
  addLabels: function (a, d, b) {
    for (var c, e = [], f = 0; f < a.length; f++) {
      var g = a[f];
      c = "issue_" + g + "_label_" + d;
      if ($("#" + c).size() == 0) {
        var h = "";
        h += '<div id="' + c + '" class="label label' + d + '">';
        h += '  <div class="labeli">';
        h += '    <div class="name">';
        h += "      <span>" + b + "</span>";
        h += '      <div class="remove" style="display: none;">x</div>';
        h += "    </div>";
        h += "  </div>";
        h += "</div>";
        h = $(h);
        $("#issue_" + g + " .issue_title").before(h);
        if (c = labels["label" + d]) GitHub.Issues.Labels.setLabelColors(h, c);
        GitHub.Issues.active != null && $("#issue_" + g + " .label .remove").show();
        e.push(g)
      }
    }
    e.length > 0 && $.post($("#new_label").attr("action") + "/" + d + "/append", {
      issues: e.join(",")
    })
  },
  selected: function () {
    var a = [];
    return a = GitHub.Issues.active != null ? ["" + GitHub.Issues.active] : $("#issues .list").find("input:checked").serializeArray().map(function (d) {
      return d.value
    })
  },
  setListHash: function (a) {
    GitHub.Issues.currentListHash = a;
    GitHub.Issues.Nav.setHash(a)
  },
  listHash: function () {
    return GitHub.Issues.currentListHash
  },
  find: function (a) {
    a = parseInt(a);
    var d = $.grep(GitHub.Issues.list, function (b) {
      return b.id == a
    });
    return d[0]
  }
};
GitHub.Issues.Issue = function (a, d, b, c) {
  this.id = a;
  this.priority = d;
  this.updated = c;
  this._votes = b;
  GitHub.Issues.list.push(this)
};
GitHub.Issues.Issue.prototype = {
  element: function () {
    return $("#issue_" + this.id)
  },
  addVote: function () {
    this.setVotes(this.votes() + 1)
  },
  removeVote: function () {
    this.setVotes(this.votes() - 1)
  },
  votes: function () {
    return this._votes
  },
  setVotes: function (a) {
    a = parseInt(a);
    var d = a + " vote",
      b = a > this._votes,
      c = b ? "/vote" : "/unvote";
    this._votes = a;
    this.element().find(".vote .show").text(d + (a == 1 ? "" : "s"));
    d = this.element().find(".voting_box .act a");
    b ? d.removeClass("enabled").find("img").attr("src", "/images/modules/issues/upvote_disabled.png") : d.addClass("enabled").find("img").attr("src", "/images/modules/issues/upvote.png");
    $.post(GitHub.Issues.repoURL + this.id + c, {});
    return a
  }
};
GitHub.Issues.Dragger = {
  dragging: 0,
  startingPosition: -1,
  sortDrag: function (a) {
    if (this.dragging < 5) {
      $(a.target).parents(".issue").addClass("floating");
      this.dragging += 1
    }
  },
  startDrag: function (a) {
    if (/labels/.test(location.pathname)) {
      a = $(a.target);
      a = a.is("li") ? a : a.parents("li");
      var d = $.makeArray($("#issue_list li"));
      this.startingPosition = $.inArray(a[0], d)
    }
  },
  stopDrag: function (a) {
    var d, b = [];
    $("#issues .display .list .issue").removeClass("floating");
    if (this.startingPosition > -1) {
      var c = GitHub.Issues.repoURL + "sort_label",
        e = {
        actor: null,
        neighbor: null,
        direction: null
      };
      a = $(a.target);
      a = a.is("li") ? a : a.parents("li");
      var f = $.map($("#issue_list li"), function (h) {
        return h.id
      }),
        g = $.inArray(a[0].id, f);
      e.direction = g > this.startingPosition ? "down" : "up";
      e.neighbor = e.direction == "up" ? f[g + 1] : f[g - 1];
      e.neighbor = e.neighbor.split("_")[1];
      e.actor = a[0].id.split("_")[1]
    } else {
      c = GitHub.Issues.repoURL + "sort";
      e = {
        sorting: null
      };
      $("#issue_list>li").each(function (h) {
        d = this.id.split("_")[1];
        GitHub.Issues.find(d).priority = h;
        b.push(d)
      });
      e.sorting = b.join(",")
    }
    GitHub.Issues.Dragger.updateHandles();
    $.post(c, e);
    this.dragging = 0
  },
  updateHandles: function () {
    $("#issue_list .handles .top.handle").show();
    $("#issue_list .handles .top.handle:first").hide()
  }
};
GitHub.Issues.Labels = {
  init: function () {},
  sortedLabelInsert: function (a, d) {
    d = d == undefined ? "" : "label" + d;
    var b = GitHub.Issues.repoURL + "labels/" + a,
      c = "";
    c += "<li>";
    c += '  <div rel="' + d + '" class="label dropdown ' + d + '">';
    c += '    <div class="labeli">';
    c += '      <div class="name">';
    c += "        <span>&#9662;</span>";
    c += "      </div>";
    c += "    </div>";
    c += "  </div>";
    c += '  <a href="' + b + '">' + a + "</a>";
    c += "</li>";
    var e = $(c),
      f = false;
    d = $(".labels .list li");
    d.each(function (g, h) {
      g = $(h).find("a").text();
      if (!f && a < g) {
        $(h).before(e);
        f = true
      }
    });
    f || $(".labels .list").append(e)
  },
  setLabelColors: function (a, d) {
    var b = GitHub.Color.hex2rgb(d);
    d = GitHub.Color.rgb2hsb(b);
    var c = null;
    c = d.b < 50 ? {
      h: d.h,
      s: d.s,
      b: d.b * 1.4
    } : {
      h: d.h,
      s: d.s,
      b: d.b * 0.8
    };
    var e = null;
    e = d.b < 50 ? {
      h: d.h,
      s: d.s,
      b: d.b * 1.8
    } : {
      h: d.h,
      s: d.s,
      b: d.b * 0.4
    };
    a.css("backgroundColor", GitHub.Color.rgb2hex(b));
    var f = "white";
    if (d.b > 60 && d.s < 40 || d.b > 70 && d.h > 30 && d.h < 200) f = "black";
    a.css("borderColor", GitHub.Color.hsb2hex(c));
    a.find(".labeli").css("borderColor", GitHub.Color.hsb2hex(c));
    a.find(".labeli .remove").css("borderLeftColor", f);
    a.find(".labeli .remove").hover(function () {
      $(this).css("backgroundColor", GitHub.Color.hsb2hex(e))
    },


    function () {
      $(this).css("backgroundColor", GitHub.Color.rgb2hex(b))
    });
    a.find("span").css("color", f);
    a.find(".labeli .remove").css("color", f)
  }
};
GitHub.Issues.Labels.Editor = {
  chooser: function () {
    return $(".labels .list li .chooser")
  },
  isOpen: function () {
    return this.chooser().length > 0
  },
  close: function () {
    this.chooser().remove()
  },
  currentId: function () {
    var a = this.chooser().parent().find(".label.dropdown").attr("rel");
    return a.match(/^label(\d+)$/)[1]
  },
  currentName: function () {
    return this.chooser().parent().find("> a").text()
  },
  apply: function () {
    var a = GitHub.Issues.selected(),
      d = this.currentId(),
      b = this.currentName();
    GitHub.Issues.addLabels(a, d, b);
    this.close()
  },
  saveColor: function () {
    var a = this.currentId(),
      d = this.chooser().find(".colorpicker_hex input").val(),
      b = labels["label" + a] || "#ededed";
    b = b.replace(/#/g, "");
    if (d != b) {
      labels["label" + a] = d;
      GitHub.Issues.Labels.setLabelColors($("div[rel=label" + a + "]"), d);
      GitHub.Issues.Labels.setLabelColors($("div.label" + a), d);
      a = $("#new_label").attr("action") + "/" + a + "/set_color";
      b = GitHub.Issues.active ? '<input type="hidden" name="issue" value="' + GitHub.Issues.active + '" />' : "";
      var c = $('<form method="post" action="' + a + '" style="display:none">' + b + '<input type="hidden" name="color" value="' + d + '" /></form>');
      $("#new_label").before(c);
      c.ajaxSubmit(function () {
        c.remove()
      })
    }
  },
  rename: function () {
    var a = this.chooser(),
      d = this.currentId(),
      b = $("#new_label").attr("action") + "/" + d + "/rename",
      c = a.find(".rename_label input[type=text]").val();
    $.post(b, "name=" + c);
    a.parents("li").remove();
    GitHub.Issues.Labels.sortedLabelInsert(c, d);
    $(".display .label" + d + " span").text(c);
    $("#issues #action_list option[value=" + d + "]").html("&nbsp;&nbsp;" + c);
    this.close()
  },
  remove: function () {
    if (confirm("Are you sure?")) {
      var a = this.currentId(),
        d = $("#new_label").attr("action") + "/" + a;
      $.post(d, "_method=delete");
      this.chooser().parents("li").remove();
      $(".display .label" + a).remove();
      $("#issues #action_list option[value=" + a + "]").remove();
      this.close()
    }
  }
};
GitHub.Color = {
  hex2rgb: function (a) {
    a = a.toLowerCase().replace(/#/, "");
    var d = {};
    if (a.length == 6) {
      d.r = parseInt(a.substr(0, 2), 16);
      d.g = parseInt(a.substr(2, 2), 16);
      d.b = parseInt(a.substr(4, 2), 16)
    } else if (a.length == 3) {
      d.r = parseInt(a.substr(0, 1) + a.substr(0, 1), 16);
      d.g = parseInt(a.substr(1, 1) + a.substr(1, 1), 16);
      d.b = parseInt(a.substr(2, 2) + a.substr(2, 2), 16)
    }
    return d
  },
  rgb2hsb: function (a) {
    var d, b;
    a.r = parseFloat(a.r);
    a.g = parseFloat(a.g);
    a.b = parseFloat(a.b);
    var c = a.r > a.g ? a.r : a.g;
    if (a.b > c) c = a.b;
    var e = a.r < a.g ? a.r : a.g;
    if (a.b < e) e = a.b;
    b = c / 255;
    d = c != 0 ? (c - e) / c : 0;
    if (d == 0) a = 0;
    else {
      var f = (c - a.r) / (c - e),
        g = (c - a.g) / (c - e);
      e = (c - a.b) / (c - e);
      a = a.r == c ? e - g : a.g == c ? 2 + f - e : 4 + g - f;
      a /= 6;
      if (a < 0) a += 1
    }
    return {
      h: Math.round(a * 360),
      s: Math.round(d * 100),
      b: Math.round(b * 100)
    }
  },
  rgb2hex: function (a) {
    return "rgb(" + a.r + "," + a.g + "," + a.b + ")"
  },
  hsb2hex: function (a) {
    return this.rgb2hex(this.hsb2rgb(a))
  },
  hsb2rgb: function (a) {
    var d = {},
      b = Math.round(a.h),
      c = Math.round(a.s * 255 / 100),
      e = Math.round(a.b * 255 / 100);
    if (c == 0) d.r = d.g = d.b = e;
    else {
      a = e;
      c = (255 - c) * e / 255;
      e = (a - c) * (b % 60) / 60;
      if (b == 360) b = 0;
      if (b < 60) {
        d.r = a;
        d.b = c;
        d.g = c + e
      } else if (b < 120) {
        d.g = a;
        d.b = c;
        d.r = a - e
      } else if (b < 180) {
        d.g = a;
        d.r = c;
        d.b = c + e
      } else if (b < 240) {
        d.b = a;
        d.r = c;
        d.g = a - e
      } else if (b < 300) {
        d.b = a;
        d.g = c;
        d.r = c + e
      } else if (b < 360) {
        d.r = a;
        d.g = c;
        d.b = a - e
      } else {
        d.r = 0;
        d.g = 0;
        d.b = 0
      }
    }
    return {
      r: Math.round(d.r),
      g: Math.round(d.g),
      b: Math.round(d.b)
    }
  }
};
GitHub.Issues.Nav = {
  currentHash: null,
  ignoreHashChange: false,
  interval: null,
  init: function () {
    this.currentHash = window.location.hash;
    this.interval = setInterval(this.checkHash, 50)
  },
  setHash: function (a) {
    this.ignoreHashChange = true;
    window.location.hash = a
  },
  checkHash: function () {
    var a = GitHub.Issues.Nav;
    if (window.location.hash != a.currentHash) if (a.ignoreHashChange) {
      a.ignoreHashChange = false;
      a.currentHash = window.location.hash
    } else {
      window.location.reload();
      clearInterval(a.interval)
    }
  }
};
$(function () {
  if ($("#issues").length != 0) {
    function a(c, e) {
      $(".loading").show();
      var f = $("#issue_list");
      e = e ||
      function (g, h) {
        return g[c] > h[c] ? 1 : -1
      };
      e = GitHub.Issues.list.sort(e);
      $.each(e, function () {
        f.prepend(this.element())
      });
      $("#sort_by_" + c).parents("span").find("a").show().end().find("strong").hide();
      $("#sort_by_" + c).hide().next("strong").show();
      GitHub.Issues.targetFirst();
      $(".loading").hide();
      return false
    }
    GitHub.Issues.init();
    $.hotkeys({
      c: GitHub.Issues.createIssue,
      l: GitHub.Issues.createLabel,
      i: GitHub.Issues.backToInbox,
      u: GitHub.Issues.backToIssues,
      I: GitHub.Issues.markSelectedAsRead,
      U: GitHub.Issues.markSelectedAsUnread,
      e: GitHub.Issues.closeSelected,
      y: GitHub.Issues.removeSelectedFromView,
      j: GitHub.Issues.moveTargetDown,
      k: GitHub.Issues.moveTargetUp,
      o: GitHub.Issues.showTarget,
      x: GitHub.Issues.toggleSelectTarget,
      "?": GitHub.Issues.showHotkeyHelp,
      "/": GitHub.Issues.focusIssuesSearch,
      enter: GitHub.Issues.showTarget
    });
    $("#issues a.internal").click(function () {
      var c = $(this).attr("href").match(/issue\/(\d+)/);
      GitHub.Issues.showIssue(c[1]);
      GitHub.Issues.targetIssue(c[1]);
      return false
    });
    $(".issue.closed .meta").livequery("click", function (c) {
      return GitHub.Issues.issueRowClickHandler(c)
    });
    $(".issue.closed .top.handle").livequery("click", function (c) {
      return GitHub.Issues.issueRowClickHandler(c)
    });
    $(".create_issue").click(function () {
      GitHub.Issues.toggleCreateIssueForm();
      return false
    });
    $(".cancel_issue").click(function () {
      GitHub.Issues.hideCreateIssueForm();
      return false
    });
    $(".issue .edit").click(function () {
      GitHub.Issues.showEditIssueForm();
      return false
    });
    $(".issue .edit_issue .cancels").click(function () {
      GitHub.Issues.hideEditIssueForm();
      return false
    });
    $(".new_issue_comment").submit(function () {
      if (GitHub.Issues.validateComment(this)) {
        $(this).find(":button, :submit").attr("disabled", true);
        $(this).find(":button").spin();
        return true
      } else return false
    });
    $(".comment .edit_issue_comment").click(function () {
      GitHub.Issues.showEditCommentForm($(this).parents(".comment:first"));
      return false
    });
    $(".comment .edit_issue_comment_form .cancels").click(function () {
      GitHub.Issues.hideEditCommentForm($(this).parents(".comment:first"));
      return false
    });
    $(".delete_issue_comment").click(function () {
      var c = $(this).parents(".comment:first");
      $.del(this.href, function () {
        c.remove()
      });
      return false
    });
    $(".save_comment_and_close_issue").click(function () {
      var c = $(this).parents("form");
      if (GitHub.Issues.validateComment(c)) {
        $(this).spin();
        c.find(":button, :submit").attr("disabled", true);
        c.ajaxSubmit(function () {
          GitHub.Issues.closeIssue()
        });
        return false
      }
    });
    $("#issues .back_link").click(function () {
      GitHub.Issues.hideIssue();
      return false
    });
    $("#issues #action_list").change(function () {
      var c = $(this).val();
      if (c == "gh-actions" || c == "gh-labels") {
        $(this).val("gh-actions");
        return $(this).blur()
      } else if (c == "new_label") {
        $(this).val("gh-actions");
        $(".create_label").trigger("click");
        return $(this).blur()
      }
      var e = GitHub.Issues.selected();
      if (e.length == 0) {
        alert("Please select an issue first");
        $(this).val("gh-actions");
        return $(this).blur()
      }
      var f = $(this).parent().find("option:selected").text();
      f = f.slice(2, f.length);
      var g = false;
      $.each(e, function (h, i) {
        if (f == "Open") GitHub.Issues.openIssue(i);
        else if (f == "Close") GitHub.Issues.closeIssue(i);
        else if (f == "Mark as Read") GitHub.Issues.markAsRead(i);
        else if (f == "Mark as Unread") GitHub.Issues.markAsUnread(i);
        else g = true
      });
      g && GitHub.Issues.addLabels(e, c, f);
      $(this).val("gh-actions");
      return $(this).blur()
    });
    $(".voting_box .act a").click(function () {
      var c = $(this).parents(".issue").attr("id").match(/\d+$/)[0];
      c = GitHub.Issues.find(c);
      var e = $(this).hasClass("enabled");
      e ? c.addVote() : c.removeVote();
      return false
    });
    $(".comment_toggle").click(function () {
      var c = $(this).parents(".issue").attr("id").replace("issue_", "");
      GitHub.Issues.showIssue(c);
      $(".comments:visible").scrollTo(500);
      return false
    });
    $("#issues .remove").livequery("click", function () {
      var c = $(this).parents("li").attr("id").replace("issue_", ""),
        e = $(this).parents("div.label"),
        f = e.attr("id").match(/label_(\d+)/)[1];
      e.remove();
      $.post($("#new_label").attr("action") + "/" + f + "/unappend", {
        issues: c
      })
    });
    $("#sort_by_priority").click(function () {
      GitHub.Issues.setListHash("list");
      GitHub.Issues.enableSortable();
      return a("priority", function (c, e) {
        return c.priority < e.priority ? 1 : -1
      })
    });
    $("#sort_by_votes").click(function () {
      GitHub.Issues.setListHash("sort=votes");
      GitHub.Issues.disableSortable();
      return a("votes", function (c, e) {
        return c.votes() > e.votes() ? 1 : -1
      })
    });
    $("#sort_by_updated").click(function () {
      GitHub.Issues.setListHash("sort=updated");
      GitHub.Issues.disableSortable();
      return a("updated")
    });
    $("body").click(function () {
      GitHub.Issues.Labels.Editor.isOpen() && GitHub.Issues.Labels.Editor.close()
    });
    $(".create_label").click(function () {
      $("#new_label .error").hide();
      $("#new_label").toggle().find("input[type=text]").focus();
      return false
    });
    $(".cancel_label").click(function () {
      $("#new_label").toggle();
      $("#new_label .error").hide();
      $("#new_label input[type=text]").val("").blur();
      return false
    });
    $("#new_label").submit(function () {
      var c = $(this).find("input[type=text]"),
        e = c.val();
      if (!e.match(/\S/)) {
        c = $("#new_label .error");
        c.text("Label can't be blank");
        c.show();
        return false
      }
      c.val("");
      GitHub.Issues.Labels.sortedLabelInsert(e);
      $.post($(this).attr("action"), {
        label: e
      },


      function (f) {
        var g = $('<option value="' + f + '">&nbsp;&nbsp;' + e + "</option>");
        $("#issues #action_list").append(g);
        $(".labels .list li .label.dropdown[rel=]").attr("rel", "label" + f)
      });
      $("#new_label").toggle();
      $("#new_label .error").hide();
      c.blur();
      return false
    });
    $(".labels .list .label.dropdown").livequery("click", function (c) {
      if (GitHub.Issues.collab && $(this).parent().find(".chooser").length == 0) {
        c.stopPropagation();
        var e = $(".labels .chooser").clone();
        e.click(function (g) {
          g.stopPropagation()
        });
        c = $(this).attr("rel");
        var f = labels[c];
        if (f == null) f = "#ededed";
        e.find(".label").addClass(c);
        e.find(".picker").ColorPicker({
          flat: true,
          color: f,
          onChange: function (g, h) {
            GitHub.Issues.Labels.setLabelColors(e.find(".label"), h)
          }
        });
        e.prependTo($(this).parent()).show()
      }
    });
    $("#issues .labels .chooser .apply.action").livequery("click", function () {
      GitHub.Issues.Labels.Editor.apply();
      return false
    });
    $("#issues .labels .color").livequery("click", function () {
      $("#issues .labels .list .change_color").show();
      return false
    });
    $("#issues .labels .change_color .cancel_color_change").livequery("click", function () {
      $("#issues .labels .list .change_color").hide();
      return false
    });
    $("#issues .labels .change_color form").livequery("submit", function () {
      GitHub.Issues.Labels.Editor.saveColor();
      GitHub.Issues.Labels.Editor.close();
      return false
    });
    $("#issues .labels .rename").livequery("click", function () {
      $("#issues .labels .list .rename_label").show().find("input[type=text]").focus();
      return false
    });
    $("#issues .labels .list .rename_label .cancel_label_rename").livequery("click", function () {
      $("#issues .labels .list .rename_label").hide().find("input[type=text]").val("");
      return false
    });
    $("#issues .labels .list .rename_label").livequery("submit", function () {
      GitHub.Issues.Labels.Editor.rename();
      return false
    });
    $("#issues .labels .delete").livequery("click", function () {
      GitHub.Issues.Labels.Editor.remove();
      return false
    });
    $("#issues .select_all").click(function () {
      $(this).parents(".display").find(".list input[type=checkbox]").attr("checked", "checked").change();
      return false
    });
    $("#issues .select_none").click(function () {
      $(this).parents(".display").find(".list input[type=checkbox]").removeAttr("checked").change();
      return false
    });
    $("#issues .list input[type=checkbox]").change(function () {
      $(this).attr("checked") ? $(this).parents(".issue").addClass("selected") : $(this).parents(".issue").removeClass("selected")
    });
    var d = [],
      b = function () {
      $("#issues .display .list input[type=checkbox]").each(function (c, e) {
        $(e).attr("rel", "r-1-" + c)
      })
    };
    b();
    $("#issues .display .list input[type=checkbox]").click(function (c) {
      var e = $(this).attr("rel").match(/^r-(\d+)-(\d+)$/),
        f = parseInt(e[1]);
      e = parseInt(e[2]);
      if (c.shiftKey && d.length > 0) {
        c = d[d.length - 1];
        var g = c.match(/^r-(\d+)-(\d+)$/);
        c = parseInt(g[1]);
        g = parseInt(g[2]);
        if (f == c) {
          c = $(this).attr("checked") == true;
          e = [e, g].sort();
          g = e[0];
          e = e[1];
          for (g = g; g < e; g++) {
            var h = $("#issues .display .list input[rel=r-" + f + "-" + g + "]");
            if (c == true) {
              h.attr("checked", "true");
              h.parents("li").addClass("selected")
            } else {
              h.removeAttr("checked");
              h.parents("li").removeClass("selected")
            }
          }
        }
      }
      d.push($(this).attr("rel"))
    });
    $("#issues .display .list a.select_all").click(function () {
      $(this).removeClass("select_all");
      var c = $(this).attr("class");
      $(this).addClass("select_all");
      $("#issues .display .list tr." + c + " input[type=checkbox]").attr("checked", "true");
      d = [];
      return false
    });
    $("#issues .display .list a.select_none").click(function () {
      $(this).removeClass("select_none");
      var c = $(this).attr("class");
      $(this).addClass("select_none");
      $("#issues .display .list tr." + c + " input[type=checkbox]").removeAttr("checked");
      d = [];
      return false
    });
    GitHub.Issues.collab && $("#issues .display .list").sortable({
      axis: "y",
      containment: "#issues",
      handle: ".drag.handle",
      cancel: ".open, .voting_box",
      update: b,
      sort: GitHub.Issues.Dragger.sortDrag,
      start: GitHub.Issues.Dragger.startDrag,
      stop: GitHub.Issues.Dragger.stopDrag
    });
    $("#issues .list input[type=checkbox]").change()
  }
});
$(function () {
  $("#add_key_action").click(function () {
    $(this).toggle();
    $("#new_key_form_wrap").toggle().find(":text").focus();
    return false
  });
  $(".edit_key_action").livequery("click", function () {
    $.gitbox($(this).attr("href"));
    return false
  });
  $("#cancel_add_key").click(function () {
    $("#add_key_action").toggle();
    $("#new_key_form_wrap").toggle().find("textarea").val("");
    $("#new_key").find(":text").val("");
    $("#new_key .object_error").remove();
    return false
  });
  $(".cancel_edit_key").livequery("click", function () {
    $.facebox.close();
    $("#new_key .object_error").remove();
    return false
  });
  $(".delete_key").livequery("click", function () {
    if (confirm("Are you sure you want to delete this key?")) {
      $.ajax({
        type: "POST",
        data: {
          _method: "delete"
        },
        url: $(this).attr("href")
      });
      var a = $(this).parents("ul");
      $(this).parent().remove();
      a.find("li").length == 0 && $("#no_keys_note").show()
    }
    return false
  });
  $(".key_editing").livequery("submit", function () {
    var a = this;
    $(a).find(".object_error").remove();
    $(a).find(":submit").attr("disabled", true).spin();
    $(a).ajaxSubmit(function (d) {
      if (d.substring(0, 3) == "<li") {
        if ($(a).attr("id").substring(0, 4) == "edit") {
          $("#" + $(a).attr("id").substring(5)).replaceWith(d);
          $.facebox.close()
        } else {
          $("#no_keys_note").hide();
          $("ul.public_keys").append(d);
          $("#add_key_action").toggle();
          $("#new_key_form_wrap").toggle()
        }
        $(a).find("textarea").val("");
        $(a).find(":text").val("")
      } else $(a).append(d);
      $(a).find(":submit").attr("disabled", false).stopSpin()
    });
    return false
  })
});
$(function () {
  if ($("#network .out_of_date").length != 0) {
    function a() {
      $("#network .out_of_date").addClass("up_to_date").text("This graph has new data available. Reload to see it.")
    }
    var d = $("#network .out_of_date").attr("rel");
    $.smartPoller(function (b) {
      $.getJSON("/cache/network_current/" + d, function (c) {
        c.current ? a() : b()
      })
    })
  }
});
$(function () {
  if (!$("body").hasClass("page-account")) return false;
  var a = $("#add_email_action a"),
    d = $("#cancel_add_email"),
    b = $("#add_email_form_wrap"),
    c = $(".add-emails-form .error_box");
  $("ul.inline-tabs").tabs();
  a.click(function () {
    $(this).toggle();
    b.fadeIn(200).find(":text").focus();
    return false
  });
  d.click(function () {
    a.toggle();
    b.hide().find(":text").val("");
    c.hide();
    return false
  });
  $(".delete_email").livequery("click", function () {
    if ($("ul.user_emails li.email").length == 1) {
      $.facebox("You must always have at least one email address.  If you want to delete this address, add a new one first.");
      return false
    }
    $.post($(this).attr("href"), {
      email: $(this).prev().text()
    });
    $(this).parent().remove();
    return false
  });
  $("ul.user_emails li.email").length > 0 && $("#add_email_form").submit(function () {
    $("#add_email_form :submit").attr("disabled", true).spin();
    var e = this;
    $(this).ajaxSubmit(function (f) {
      f ? $("ul.user_emails").append(f) : c.show();
      $("#add_email_form :submit").attr("disabled", false).stopSpin();
      $(e).find(":text").val("").focus()
    });
    return false
  });
  $(".user_toggle").click(function () {
    var e = {};
    e[this.name] = this.checked ? "1" : "0";
    e._method = "put";
    $.post("/account", e);
    $("#notify_save").show();
    setTimeout("$('#notify_save').fadeOut()", 1000)
  });
  $("dl.form.autosave").autosaveField();
  $("button.dummy").click(function () {
    $(this).prev(".success").show().fadeOut(5000);
    return false
  })
});
$(function () {
  if (!$("body").hasClass("page-billing")) return false;
  var a = $("table.upgrades"),
    d = {
    wrapper: $("#planchange"),
    heading: $("#change_heading"),
    cost: $("#plan_cost"),
    plan: $("#plan"),
    button: $("#cc_submit")
  },
    b = {
    repos: $("#plan_repos"),
    collab: $("#plan_collab"),
    space: $("#plan_space"),
    ssl: $("#plan_ssl")
  },
    c = $("#just_change_plan"),
    e = $("#credit_card_fields"),
    f = $("#free_fields"),
    g = !$(".creditcard").hasClass(".invalid"),
    h = null,
    i = null,
    m = d.button.text();

  function j(k) {
    k = $(k);
    return k = {
      name: k.attr("data-name"),
      cost: parseInt(k.attr("data-cost")),
      repos: parseInt(k.attr("data-repos")),
      collab: parseInt(k.attr("data-collab")),
      space: k.attr("data-space"),
      ssl: k.attr("data-ssl")
    }
  }
  h = j(a.find("tr.current"));

  function n(k) {
    i = j(k);
    a.find("tr.selected").removeClass("selected");
    k.addClass("selected");
    if (i.name == h.name) {
      a.removeClass("selected");
      d.wrapper.fadeOut(300)
    } else {
      a.addClass("selected");
      d.wrapper.fadeIn(300)
    }
    d.button.find("span").text("Change Plan & " + m);
    g && c.show();
    d.plan.val(i.name);
    d.cost.text("$" + i.cost);
    k = "You are ";
    k += i.cost > h.cost ? "upgrading to " : i.cost < h.cost ? "downgrading to " : "currently on ";
    if (i.name == h.name) {
      d.button.find("span").text(m);
      c.hide()
    }
    k += "the " + i.name.capitalize() + " plan";
    d.heading.text(k);
    if (i.name == "free") {
      e.hide();
      f.show()
    } else {
      e.show();
      f.hide()
    }
    b.repos.text(i.repos);
    b.collab.text(i.collab);
    b.space.text(i.space);
    i.ssl == "Yes" ? b.ssl.show() : b.ssl.hide()
  }
  function l(k) {
    if (k == null) k = true;
    var r = a.find(".cancel_button");
    r.find("span").text(r.attr("originalText"));
    r.attr("originalText", "").removeClass("cancel_button");
    k && n(a.find("tr.current"))
  }
  a.find(".choose_plan").click(function () {
    var k = $(this);
    if (k.attr("originalText") == undefined || k.attr("originalText") == "") {
      l(false);
      n($(this).closest("tr"));
      k.attr("originalText", k.find("span").text()).addClass("cancel_button").find("span").text("Cancel")
    } else l();
    return false
  });
  $("#cancel_ccform").click(function () {
    l();
    return false
  });
  $("#update_card").click(function () {
    d.wrapper.fadeIn(300);
    return false
  });
  c.click(function () {
    $("#update_cc_form").submit();
    return false
  });
  $("#coupon_button").click(function () {
    $("#coupon_form").show();
    $(this).hide();
    return false
  })
});
$(function () {
  if (!$("body").hasClass("page-profile")) return false;
  var a = $("ul.repositories>li"),
    d = $(".repo-filter input").enhancedField().val(""),
    b = d.val();

  function c() {
    a.show();
    d.val() != "" && a.filter(":not(:Contains('" + d.val() + "'))").hide()
  }
  d.bind("keyup blur click", function () {
    if (this.value != b) {
      b = this.value;
      c()
    }
  });
  $("ul.repositories>li.simple").each(function () {
    var e = $(this),
      f = e.find("p.description").text();
    $.trim(f) != "" && e.find("h3").attr("title", f).tipsy({
      gravity: "w"
    })
  })
});
$(function () {
  $(".graph .bars").each(function () {
    var a = this;
    if ($(a).is(":visible")) {
      var d = function (c) {
        new ParticipationGraph(a, c)
      },
        b = $(this).attr("rel");
      $.get(b, null, d, "text")
    }
  })
});
ParticipationGraph = function (a, d) {
  this.BAR_WIDTH = 7;
  this.ownerCommits = this.allCommits = null;
  this.primer = new Primer(a, 416, 20);
  this.data = d;
  this.readData();
  this.draw()
};
ParticipationGraph.prototype = {
  readData: function () {
    var a = this.data.split("\n");
    this.allCommits = a[0] ? this.base64BytesToIntArray(a[0]) : "";
    this.ownerCommits = a[1] ? this.base64BytesToIntArray(a[1]) : ""
  },
  max: function (a) {
    for (var d = a[0], b = 1; b < a.length; b++) if (a[b] > d) d = a[b];
    return d
  },
  integerize: function (a) {
    for (var d = [], b = 0; b < a.length; b++) d.push(parseInt(a[b]));
    return d
  },
  base64ByteToInt: function (a) {
    var d = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!-";
    return d.indexOf(a)
  },
  base64BytesToIntArray: function (a) {
    for (var d = [], b, c = 0; c < a.length; c++) if (c % 2 == 0) b = 64 * this.base64ByteToInt(a.charAt(c));
    else {
      b += this.base64ByteToInt(a.charAt(c));
      d.push(b)
    }
    return d
  },
  draw: function () {
    var a = this.max(this.allCommits);
    a = a >= 20 ? 19 / a : 1;
    var d = new Primer.Layer;
    d.bind(this.primer);
    for (var b = 0; b < this.allCommits.length; b++) {
      var c = new Primer.Layer;
      c.bind(this.primer);
      c.setFillStyle("#CACACA");
      var e = this.allCommits[b] * a;
      c.fillRect(b * (this.BAR_WIDTH + 1), 20 - e, this.BAR_WIDTH, e);
      d.addChild(c)
    }
    var f = new Primer.Layer;
    f.bind(this.primer);
    for (b = 0; b < this.ownerCommits.length; b++) {
      c = new Primer.Layer;
      c.bind(this.primer);
      c.setFillStyle("#336699");
      e = this.ownerCommits[b] * a;
      c.fillRect(b * (this.BAR_WIDTH + 1), 20 - e, this.BAR_WIDTH, e);
      f.addChild(c)
    }
    this.primer.addChild(d);
    this.primer.addChild(f)
  }
};
$(function () {
  $("#signup_form").submit(function () {
    $("#signup_button").attr("disabled", true).val("Creating your GitHub account...")
  })
});
GitHub.spy = function (a) {
  var d = {
    path: "/",
    expires: 1
  };
  a = a.repo;
  if (a != "") {
    $.cookie("spy_repo", a, d);
    $.cookie("spy_repo_at", new Date, d)
  }
};
jQuery.fn.tabs = function () {
  function a(b) {
    return /#([a-z][\w.:-]*)$/i.exec(b)[1]
  }
  var d = window.location.hash.substr(1);
  return this.each(function () {
    var b = null,
      c = null;
    $(this).find("li a").each(function () {
      var e = $("#" + a(this.href));
      if (e != []) {
        e.hide();
        $(this).click(function () {
          c && c.hide();
          b && b.removeClass("selected");
          c = e.show();
          b = $(this).addClass("selected");
          return false
        });
        $(this).hasClass("selected") && $(this).click()
      }
    });
    $(this).find("li a[href='#" + d + "']").click();
    c == null && $($(this).find("li a")[0]).click()
  })
};
GitHub.CachedCommitDataPoller = function () {
  $.smartPoller(2000, function (a) {
    var d, b, c, e = "/" + GitHub.nameWithOwner + "/commit/",
      f = "/" + GitHub.nameWithOwner + "/cache/commits/" + GitHub.currentTreeSHA + "?path=" + GitHub.currentPath + "&commit_sha=" + GitHub.commitSHA;
    $.getJSON(f, function (g) {
      if (g.nothing) return a();
      $("#browser tr").each(function () {
        if ((d = $(this).find(".content a").attr("id")) && g[d]) {
          $(this).find(".age").html('<span class="drelatize">' + g[d].date + "</span>");
          b = $(this).find(".message");
          b.html(g[d].message);
          b.html().length > 50 && b.html(b.html().slice(0, 47) + "...");
          b.html('<a href="' + e + d + '" class="message">' + b.html() + "</a>");
          c = g[d].login ? '<a href="/' + g[d].login + '">' + g[d].login + "</a>" : g[d].author;
          b.html(b.html() + " [" + c + "]")
        }
      });
      $.fn.relatizeDate && $(".drelatize").relatizeDate()
    })
  })
};
$(function () {
  $("#readme").length > 0 && $("#read_more").show();
  $("#download_button").click(function () {
    $.gitbox($(this).attr("href"));
    return false
  });
  $(".archive_link a").livequery("click", function () {
    $(".popup .inner").hide();
    $(".popup .wait").show();
    var c = $(this).attr("rel"),
      e = 0;
    $.smartPoller(function (f) {
      $.getJSON(c, function (g) {
        if (e > 60) return false;
        else if (g.ready) $(document).trigger("close.facebox");
        else {
          e += 1;
          f()
        }
      })
    })
  });
  $(".other_archive_link").livequery("click", function () {
    $.gitbox($(this).attr("href"));
    return false
  });
  $("#loading_commit_data").length > 0 && GitHub.CachedCommitDataPoller();
  if (GitHub && GitHub.currentRef && GitHub.commitSHA != GitHub.currentRef) {
    var a, d = GitHub.currentPath ? GitHub.currentPath + "/" : "",
    b = "/" + GitHub.nameWithOwner;
    $("#browser .content a").each(function () {
      a = /\/blob\//.test(this.href) ? "/blob/" : "/tree/";
      this.href = b + a + GitHub.currentRef + "/" + d + $(this).text()
    })
  }
});
$(function () {
  GitHub.UFO = {
    drawFont: function () {
      var a = document.getElementById("ufo");
      a = a.getContext("2d");
      for (var d = 0; d < glifs.length; d++) {
        a.save();
        var b = d % 9 * 100,
          c = Math.floor(d / 9) * 100;
        a.translate(b + 10, c + 80);
        a.scale(0.1, -0.1);
        b = new GitHub.UFO.Glif(a, glifs[d]);
        b.draw();
        a.restore()
      }
    }
  };
  GitHub.UFO.Glif = function (a, d) {
    this.ctx = a;
    this.contours = d
  };
  GitHub.UFO.Glif.prototype = {
    draw: function () {
      this.ctx.beginPath();
      for (var a = 0; a < this.contours.length; a++) this.drawContour(this.contours[a]);
      this.ctx.fillStyle = "black";
      this.ctx.fill()
    },
    drawContour: function (a) {
      for (var d = 0; d < a.length; d++) d == 0 ? this.moveVertex(a[d]) : this.drawVertex(a[d]);
      this.drawVertex(a[0])
    },
    moveVertex: function (a) {
      this.ctx.moveTo(a[0], a[1])
    },
    drawVertex: function (a) {
      if (a.length == 2) this.ctx.lineTo(a[0], a[1]);
      else if (a.length == 4) this.ctx.quadraticCurveTo(a[2], a[3], a[0], a[1]);
      else a.length == 6 && this.ctx.bezierCurveTo(a[2], a[3], a[4], a[5], a[0], a[1])
    }
  };
  $("#ufo").length > 0 && GitHub.UFO.drawFont();
  $(".glif_diff").each(function () {
    var a = $(this).attr("rel"),
      d = this.getContext("2d");
    a = eval("glif_" + a);
    a = new GitHub.UFO.Glif(d, a);
    d.translate(0, 240);
    d.scale(0.333, -0.333);
    a.draw()
  })
});
$(function () {
  $("a.follow").click(function () {
    $.post(this.href, {});
    $(this).parent().find(".follow").toggle();
    return false
  });
  $("#inline_visible_repos").click(function () {
    var a = $(this).spin(),
      d = window.location + "/ajax_public_repos";
    $(".projects").load(d, function () {
      a.stopSpin();
      $(".relatize").relatizeDate()
    });
    a.hide();
    return false
  });
  GitHub.editableGenerator && $("#dashboard span.edit").each(GitHub.editableGenerator({
    width: "200px",
    submittype: "put"
  }));
  $("#edit_user .info .rename").click(function () {
    $("#edit_user .username").toggle();
    $("#user_rename").toggle();
    return false
  });
  $("#user_rename > input[type=submit]").click(function () {
    if (!confirm(GitHub.rename_confirmation())) return false
  });
  $("#reveal_cancel_info").click(function () {
    $(this).toggle();
    $("#cancel_info").toggle();
    return false
  });
  $("#cancel_plan").submit(function () {
    var a = "Are you POSITIVE you want to delete your account? There is absolutely NO going back. All your repositories, comments, wiki pages - everything will be gone. Please consider downgrading your plan.";
    return confirm(a)
  });
  window.location.href.match(/account\/upgrade$/) && $("#change_plan_toggle").click()
});
$(function () {
  $("#see-more-elsewhere").click(function () {
    $(".seen-elsewhere").show();
    $(this).remove();
    return false
  })
});