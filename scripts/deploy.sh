#!/bin/sh

#
# Credits to https://dev.to/jeffreymfarley/deploy-atomically-with-travis--npm-68b
#

setup_git() {
  # Set the user name and email to match the API token holder
  # This will make sure the git commits will have the correct photo
  # and the user gets the credit for a checkin
  git config --global user.email "npm.rannou@gmail.com"
  git config --global user.name "NicolasRannou"
  git config --global push.default matching
  
  # Get the credentials from a file
  git config credential.helper "store --file=.git/credentials"
  
  # This associates the API Key with the account
  echo "https://${GITHUB_API_KEY}:@github.com" > .git/credentials
}

make_version() {
  # Make sure that the workspace is clean
  # It could be "dirty" if
  # 1. package-lock.json is not aligned with package.json
  # 2. npm install is run
  git checkout -- .
  
  # Echo the status to the log so that we can see it is OK
  git status
  
  # Run the deploy build and increment the package versions
  # %s is the placeholder for the created tag
  # Update pacakge.json
  VERSION=$(npm version minor --no-git-tag-version)

  # Update the build
  yarn dist:ami
  git commit -am "chore: update version ($VERSION)[skip ci]"

  # Tag the new build
  git tag $VERSION
}

upload_files() {
  # This make sure the current work area is pushed to the tip of the current branch
  git push origin HEAD:$TRAVIS_BRANCH
  
  # This pushes the new tag
  git push --tags
}

update_npm() {
  cp .npmrc.template $HOME/.npmrc
  npm publish . --tag next
}

update_ghpage() {
  yarn deploy
}

setup_git
make_version
upload_files
update_npm
# update_ghpage