require 'rake/clean'
require 'net/http'

CLEAN.include('build/jspp')
CLOBBER.include('build')

USERJS = 'build/github-markdown-preview.user.js'

task :default => :userjs

task :userjs do
  mkdir 'build' unless File.directory? 'build'
  jspp = File.new 'build/jspp', 'w'
  Net::HTTP.start 'github.com', 80 do |http|
    jspp.write http.get('/NV/js-preprocessor/raw/gh-pages/bin/jspp').body
  end
  jspp.chmod 0755
  jspp.close
  tag, commit = `git describe`.split('-')
  tag.slice! 0
  system "build/jspp src/github-markdown-preview.js > #{USERJS}"
  file = File.read USERJS
  file.sub!(%r{^// *@version *$}, '\0' << tag << '.' << commit)
  File.open USERJS, 'w' do |f|
    f.puts file
  end
  puts 'build/github-markdown-preview.user.js done'
end

task :upload do
  require 'net/github-upload'
  file = File.read USERJS
  version = file.match(%r{// *@version *(.+?)$})[1]
  description = file.match(%r{// *@description *(.+?)$})[1]
  gh = Net::GitHub::Upload.new(
    :login => `git config github.user`.chomp,
    :token => `git config github.token`.chomp
  )
  direct_link = gh.upload(
    :repos => 'github-live-preview',
    :file  => USERJS,
    :name => "github-markdown-preview-v#{version}.user.js",
    :content_type => 'text/javascript',
    :description => description
  )
  puts direct_link
end
