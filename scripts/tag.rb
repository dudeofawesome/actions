#!/usr/bin/env ruby

def tag(version)
  `git tag \
    --annotate \
    --sign \
    '#{version}' \
    --message=''
  `
end

version=ARGV[0].start_with?('v') ? ARGV[0] : "v#{ARGV[0]}"
semver=version.match(/^v(\d+)\.(\d+)\.(\d+)$/)

puts tag(version)
puts `git tag --delete 'v#{semver[1]}'`
puts tag("v#{semver[1]}")
