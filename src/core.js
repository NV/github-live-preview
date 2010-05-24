var makeHtml = (new Showdown.converter).makeHtml,
    gravatar_url = $('#header .avatarname img').attr('src'),
    comment_preview,
    comment_body,
    comments_form = $('#comments > form');

function build_wikistyle_comment_preview(){
  return $('<div class="comment wikistyle comment-preview">\
    <div class="meta">\
      <a href="/'+ github_user +'"><img alt="" class="gravatar" height="16" src="'+ gravatar_url.replace('-20', '-16').replace('s=20', 's=16') +'" width="16" /></a>\
      <span>\
        <b><a href="/'+ github_user +'">'+ github_user +'</a></b>\
      </span>\
    </div>\
    <div class="body"><p></p></div>\
  </div>');
}

if (comments_form.length) {
  // Commit comments
  comment_preview = build_wikistyle_comment_preview();
  comment_body = comment_preview.children('.body');
  comments_form.before(comment_preview);
  comments_form.children('textarea').bind('input', function input_handler(){
    comment_body.html( makeHtml(this.value) );
  });
  comments_form.find('.formatting').prepend('<a class="preview-link" href="http://github.com/NV/github-live-preview">Github Markdown Preview</a> &middot; ');
} else if ($('#issue_list').length) {
  // Issues
  $('#issue_list .new_issue_comment').each(function(i, comments_form){
    var prev = comments_form.previousElementSibling;
    if (prev && prev.className && prev.className.indexOf('comment-preview') > -1) return null;
    comments_form = $(comments_form);
    var comment_preview = build_wikistyle_comment_preview();
    comments_form.before(comment_preview);
    var comment_preview_body = comment_preview.children('.body');
    comments_form.children('textarea').bind('input', function input_handler(){
      comment_preview_body.html( makeHtml(this.value) );
    });
  });
} else if ($('#reply').length) {
  // Inbox reply
  comments_form = $('#reply');
  comment_preview = $('<div class="comment-preview">\
    <div class="header">\
      <div class="gravatar">\
        <img width="30" height="30" src="'+ gravatar_url.replace('-20', '-30').replace('s=20', 's=30') +'" alt=""/>\
      </div>\
      <div class="info">\
        <div class="title ">\
          <a href="/'+ github_user +'">'+ github_user +'</a>\
        </div>\
      </div>\
    </div>\
    <div class="body wikistyle"></div>\
  </div>');
  comment_body = comment_preview.children('.body');
  comments_form.parent().before(comment_preview);
  comments_form.children('textarea').bind('input', function input_handler(){
    comment_body.html( makeHtml(this.value) );
  });
  comments_form.find('.formatting').prepend('<a class="preview-link" href="http://github.com/NV/github-live-preview">Github Markdown Preview</a> &middot; ')
} else if (GitHub.hasWriteAccess && $('#readme .wikistyle').length && $('#file-edit-link').length) {
  // Markdown files
  comment_body = $('#readme .wikistyle');
  document.body.className += ' edit-preview';
  $('#file-edit-link').addClass('minibutton').wrapInner('<span></span>');
  $('#files textarea[name=value]').live('input', function input_handler(){
    comment_body.html( makeHtml(this.value) );
  });
}

// add event listener to 'Create Issue' button
if ($("button.create_issue").length) {
  $("button.create_issue").click(function() {
    if ($('#new_issue').length) {
      comments_form = $('#new_issue');
      comment_preview = $('<div class="issue summary read open">\
        <div class="summary">\
          <div class="meta">\
            <h3 id="title">&nbsp;</h3>\
            <span class="info">by <a href="/'+ github_user +'">'+ github_user +'</a></span>\
          </div>\
        </div>\
        <div class="body wikistyle"><p></p></div>\
      </div>');
      comment_title = comment_preview.children('.summary').children('.meta').children('#title');
      comment_body = comment_preview.children('.body');
      comments_form.before(comment_preview);
      comments_form.children('#issue_title').bind('input', function input_handler(){
        comment_title.html( this.value );
      });
      comments_form.children('textarea').bind('input', function input_handler(){
        comment_body.html( makeHtml(this.value) );
      });
    }
  });
}

