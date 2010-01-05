var makeHtml = (new Showdown.converter).makeHtml,
    gravatar_url = $('#header .avatarname img').attr('src'),
    comment_preview,
    comment_body,
    comments_form = $('#comments > form');

if (comments_form.length) {
  // Commit comments
  comment_preview = $('<div class="comment wikistyle" id="comment_preview">\
    <div class="meta">\
      <a href="/'+ github_user +'"><img alt="" class="gravatar" height="16" src="'+ gravatar_url.replace('-20', '-16').replace('s=20', 's=16') +'" width="16" /></a>\
      <span>\
        <b><a href="/'+ github_user +'">'+ github_user +'</a></b>\
      </span>\
    </div>\
    <div class="body"><p></p></div>\
  </div>');
  comment_body = comment_preview.children('.body');
  comments_form.before(comment_preview);
  comments_form.children('textarea').bind('input', function input_handler(){
    comment_body.html( makeHtml(this.value) );
  });
  comments_form.find('.formatting').prepend('<a class="preview-link" href="/NV/github-live-preview">Github Markdown Preview</a> &middot; ')
} else if ($('#reply').length) {
  // Inbox reply
  comments_form = $('#reply');
  comment_preview = $('<div id="comment_preview">\
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
  comments_form.find('.formatting').prepend('<a class="preview-link" href="/NV/github-live-preview">Github Markdown Preview</a> &middot; ')
} else if ($('#readme .wikistyle').length && $('#file-edit-link').length) {
  // Markdown files
  comment_body = $('#readme .wikistyle');
  document.body.className += ' edit-preview';
  $('#file-edit-link').addClass('minibutton').wrapInner('<span></span>');
  $('#files').bind('DOMNodeInserted', function(e){
    if (e.target.className === 'blob-editor') {
      var textarea = $(e.target).find('textarea[name=value]');
      if (textarea.length) {
        e.target.className += ' github-preview-blob';
        $('#files').unbind('DOMNodeInserted');
        textarea.bind('input', function input_handler(){
          comment_body.html( makeHtml(this.value) );
        });
      }
    }
  });
}
