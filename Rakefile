require 'rake/clean'
require 'net/http'

CLEAN.include('build/jspp')
CLOBBER.include('build')

task :default => :userjs

task :userjs do
  mkdir 'build' unless File.directory? 'build'
  jspp = File.new 'build/jspp', 'w'
  Net::HTTP.start 'github.com', 80 do |http|
    jspp.write http.get('/NV/js-preprocessor/raw/gh-pages/bin/jspp').body
  end
  jspp.chmod 0755
  jspp.close
  system 'build/jspp src/github-markdown-preview.js > build/github-markdown-preview.user.js'
  puts 'build/github-markdown-preview.user.js done'
end

task :upload do
  require 'net/github-upload'
  file = File.read 'build/github-markdown-preview.user.js'
  version = file.match(%r{// *@version *(.+?)$})[1]
  description = file.match(%r{// *@description *(.+?)$})[1]
  gh = Net::GitHub::Upload.new(
    :login => `git config github.user`.chomp,
    :token => `git config github.token`.chomp
  )
  direct_link = gh.upload(
    :repos => 'github-live-preview',
    :file  => 'build/github-markdown-preview.user.js',
    :name => "github-markdown-preview-v#{version}.user.js",
    :description => description
  )
  puts direct_link
end
