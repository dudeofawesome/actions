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

# create new specific tag
puts tag(version)

# delete old major version tag
puts `git tag --delete 'v#{semver[1]}'`
puts `git push --delete origin 'v#{semver[1]}'`

# create new major version tag
puts tag("v#{semver[1]}")
puts `git push origin 'v#{semver[1]}'`
