require 'rake/clean'
require 'open-uri'
require 'jspp'

CLEAN.include('build/jspp')
CLOBBER.include('build')

USERJS = 'build/github-markdown-preview.user.js'

task :default => :userjs

task :userjs do
  git_describe_tags = `git describe --tags`
  tag = git_describe_tags.split('-').first || git_describe_tags
  tag.strip!
  commit = `git rev-list --full-history #{tag}.. -- src/ | wc -l`.strip
  file = JSPP 'src/github-markdown-preview.js'
  tag.slice! 0
  file.sub!(%r{^// *@version *$}, '\0' << tag << '.' << commit)
  File.open USERJS, 'w' do |f|
    f.puts file
  end
  puts 'build/github-markdown-preview.user.js done'
end

task :chrome do
  mkdir 'chrome' unless File.directory? 'chrome'
  file = JSPP 'src/chrome.js'
  File.open 'chrome/github-markdown-preview.js', 'w' do |f|
    f.puts file
  end
  copy 'src/core.css', 'chrome/'
  puts 'chrome/ done'
end

task :upload do
  require 'net/github-upload'
  file = File.read USERJS
  version = file[%r{// *@version *(.+?)$}, 1]
  description = file[%r{// *@description *(.+?)$}, 1]
  gh = Net::GitHub::Upload.new(
    :login => `git config github.user`.chomp,
    :token => `git config github.token`.chomp
  )
  puts gh.upload(
    :repos => 'github-live-preview',
    :file  => USERJS,
    :name => "github-markdown-preview-v#{version}.user.js",
    :content_type => 'text/javascript',
    :description => description
  )
end
