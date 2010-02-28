require 'rake/clean'
require 'open-uri'

CLEAN.include('build/jspp')
CLOBBER.include('build')

USERJS = 'build/github-markdown-preview.user.js'

task :default => :userjs

task :jspp do
  mkdir 'build' unless File.directory? 'build'
  jspp = File.new 'build/jspp', 'w'
  jspp.write open('http://nv.github.com/js-preprocessor/bin/jspp').read
  jspp.chmod 0755
  jspp.close
end

task :userjs => :jspp do
  git_describe_tags = `git describe --tags`
  tag = git_describe_tags.split('-').first || git_describe_tags
  tag.strip!
  commit = `git rev-list --full-history #{tag}.. -- src/ | wc -l`.strip
  system "build/jspp src/github-markdown-preview.js > #{USERJS}"
  file = File.read USERJS
  tag.slice! 0
  file.sub!(%r{^// *@version *$}, '\0' << tag << '.' << commit)
  File.open USERJS, 'w' do |f|
    f.puts file
  end
  puts 'build/github-markdown-preview.user.js done'
end

task :chrome => :jspp do
  mkdir 'chrome' unless File.directory? 'chrome'
  system 'build/jspp src/chrome.js > chrome/github-markdown-preview.js'
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
