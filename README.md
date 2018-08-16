# About capture_the_paiza


# build
```
yarn run pack
```

# Release
事前作業として、githubのreleasesページに、draft状態のreleseを作ってください。  
tagは、package.jsonのバージョンに合わせてください。  
例えば、package.jsonのversionが1.0.1なら、github側のtagは、v1.0.1としてください。
(そうすることで、自動的にアップロードされます。)

## Note for Appveyor
please encrypt GH_TOKEN(Github Personal Accesstoken) on
https://ci.appveyor.com/tools/encrypt
and append it to appveyor.yml

## Note for Tavis-CI
please encrypt GH_TOKEN(Github Personal Accesstoken) by
https://docs.travis-ci.com/user/encryption-keys/
and append it to .travis.yml
