# Changelog
All notable changes to this project will be documented in this file.

We may want to also add it to the Gtihub release information.

Note: We need this file so we can log new features while we are developing instead of having to do it all at once when release happens.

## 0.0.23-dev


### Big changes
- We now have a `ami.js` stack overflow tag - [#65](https://github.com/FNNDSC/ami/issues/65)

### API changes
- [helpers / segmentation lut](https://github.com/FNNDSC/ami/commit/c311a3e1f82d964ab6bebd368d2286dc104f6a2e) - Removed `segId` argument in constructor

### Added
- [shaders / contours]() - Add flag to control the opacity of a contour

### Changed
- Update `NPM` to `Yarn` in *README.md*
- Update command `npm run` to `yarn` in *package.json*
- [shader / single pass volume rendering](https://github.com/FNNDSC/ami/pull/213) - Improved volume rendering opacity

### Removed

### Fixed
- [parsers / nrrd](https://github.com/FNNDSC/ami/commit/6940c141dfbcee4612fef2acc3a6fc870e1c3c9d) - Wrong spacing parsing.
- [example / viewer compare](https://github.com/FNNDSC/ami/commit/4585cb39eedc33341c1f7f78d215770d1ce60924) - Incorrect layer orientation.
- [#212](https://github.com/FNNDSC/ami/issue/212) - Missing export for one `NODE_WEBPACK_TARGET` variable
## 0.0.22 - 2017-11-06
### Fixed
- [X]() - Fix typo in the Core.Utils export

## 0.0.21 - 2017-11-02
### Big changes
- DOCUMENT NEW BUILD WORKFLOW
### API changes
- DOCUMENT NEW API
### Added
- [Helpers: contours](https://github.com/FNNDSC/ami/blob/dev/src/helpers/helpers.contour.js)


Ref: https://github.com/olivierlacan/keep-a-changelog/blob/master/CHANGELOG.md
[Unreleased]: https://github.com/olivierlacan/keep-a-changelog/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.3.0...v1.0.0
