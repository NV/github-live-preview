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
  tag = `git describe --tags`.split('-').first
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
