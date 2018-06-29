<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/214063/23213764/78ade038-f90c-11e6-8208-4fcade5f3832.png" width="60%">
</p>

This is a guide through the ami build system. It is based on Webpack v3 in combination with Babel.

# How it works

The build system is based on Webpack v3 and Webpack-dev-server. Basicly pipeline runs as follows:
* `ami.js`, `example` or `lesson` source and all if its dependencies it references gets read in by webpack to an one big file.

* at same time it gets read in it runs through the configured loaders:
  * Javascript: runs through Babel.js where all "modern" Javascript will get transpiled "down" to the Javascript abilities of the set target browsers (IE11, Safari 10, Firefox ESR, Edge 12, Google Chrome 54). Example: IE 11 does not support Arrow Functions `sum = (a, b) => { return a + b; }` so it gets transpiled to ES5 style functions `function sum(a, b) { return a + b; }`. Another word you might already heard of for such a replacement is `polyfill`. If all that browsers support a feature then the native implementation of the browser is used.
  * css/sass/less Webpack in capable not only bundling javascript but also other kinds of files. In fact, everthing there is a loader available. When css/sass/less files are referenced in the source javascript, then they will get extracted out of the javascript bundle, sass/less gets "compiled" to css and then also bundled to a seperate css file bundle. If you want to dive in to that topic I highly recommend the [Webpack docs](https://webpack.js.org/concepts/)

* in `development` mode then all things get written to files in the output directory and thats it. In `production` mode there are a couple of things that happen additionally:
  * the javascript code gets `uglyfied`. That means that it will modified to minimal file size. Every not needed character (including linefeed) gets stripped out, variable and function names gets replaced by single or very short generic names like `a` or `f1`. That minified version of the library is getting saved as `min.js` like `ami.min.js`
  * In case of `ami.js` the minified bundle gets additinally zipped with gunzip to shrink down the file size even more. Most modern browsers and servers support zipped files. 

* When the webpack-dev-server is running everthing gets run through like with webpack except one detail. An express.js mini-http server is launched to serve the contents of a directory or bunch of files, normally including the created bundle. It also runs in `hot` or `HMR` mode, means it watches the source of the bundle and refeshes the bundle and the browser when something changes. 
  * Side note: the bundle, created by webpack-dev-server are `not` written to the filesystem. It "lives" only in Memory (RAM) as long the webpack-dev-server is running.

* on `examples` and `lessons` it works the same. Just not the AMI Library gets build but the javascript files of the `examples/lessons`. Depending on if a deployment is running it happens "in place" or in the deployment folder `dist`.

# package.json scripts
Every `package.json` script will be explaned here.

## AMI
### Build

To build AMI.js run the following command:
```bash
yarn build:ami
```
It creates the files `ami.js` and `ami.js.map` in the `lib` folder.

---

For a production build run 
```bash
yarn build:ami:prod
````
This creates a minified version of AMI `ami.min.js` as well as a gunzipped version `ami.min.js.gz`.

---

### Clean

 The following commands are deleting the target directory `lib`.

 ```bash
yarn build:clean
 ```
 or
 ```bash
yarn build:clean:hot
 ````
 This script will only delete hot.update.js files which webpack creates in lesson mode. This runs automaticly and you have not to bother this script.

---

The following script deletes the `dist` directory, in preparation for an AMI deployment.

```bash
yarn dist:clean
```

and finally this combines both the `lib` and the `dist` clean.

```bash
yarn clean
```

---

This script starts a running webpack instance that watches continuously the AMI sources and creates a new bundle when the sources have been changed. The script is used by other scripts in order to develop the library (more on development below).

```bash
yarn dev:ami
```

---

### deploy

To deploy the AMI library run the following script

```bash
yarn dist:ami
```

It runs a combination of `clean` and `build` including a "production" version of AMI. In addition the that some automated documentation is generated (see below)

to create a full deployment run 
```bash
yarn deploy
```

full means that
* the directories (`lib` & `dist`) gets cleaned
* build AMI (including docs)
* build & deploy `examples` into the `dist` folder

---

### Docs
```bash
yarn doc
```

With this script some automated documentation are generated based on the source. Target directory is `dist`.

---

### Linter & Tests
Tests are implemented with `Karma`. It imports some of the source code and run tests on it to ensure functionality when the source changes and don't break things. 

```bash
yarn test
```

A Linter is used to ensure that the source code matches a set of rules. These rules expand from source code formatting up to forbidding or enforcing use of specific language features/commands.

```bash
yarn lint
```

### Analze `ami.js` bundle

It is possible to analize the content of the `ami.js` bundle both "normal" built as well as "production" built. After creation of the bundle the browser gets opened and shows the content of it including other additional information like the size.

```bash
yarn analize:ami
```

and for production

```bash
yarn analize:ami:prod
```

## Examples & Lessons
The AMI library comes with a set of examples and lessons to teach, demonstrate and develop the AMI library. 

### Examples

The `examples` directory consists of examples of different aspects of the library. An example folder contains a entry html, javascript and css file.

to run an example execute

```bash
yarn example [name of example folder]

yarn example geometries_slice
```

It starts a webpack-dev-server on the example folder and opens a Browser to load the example. Now the example can be edited and webpack-dev-server will automaticly reload the page. 

However webpack-dev-server is only "watching" the created bundle (living only in memory). Files that are part of the app/example but not of the bundle, like html and css files, will served through webpack-dev-server but not "hot-reloaded". For that matter there is a free plugin/addon called "LiveReload". It fills the gap and "hot-reloads" all other files except the bundle. 

---

The html files are based on sample html files. They're placed directly in the `examples` parent directory. With the following script the `index.html` files are generated in the example sub folders. This is only necessary when the html files are missing or the sample has changed. There should already be an existing set of `index.html` files. These are mandatory in order to run the examples.

```bash
yarn gen:index:examples

yarn gen:index:examples:ga
``` 

The second script adds optional google analytics to the html files.

On AMI deployment these examples are copied to the `dist` folder and are processed with webpack.

Side note: the examples are using AMI by import of sources. This is the recommended way of using AMI but the use of a bundler like Webpack or Browserify is mandatory. That way only the used part of AMI gets bundled and that lowers the final file size.

### Lessons

Same like with examples these are server with webpack-dev-server. Unlike examples the lessons are not copied to `dist` folder on AMI deployment. 

Side note: Unlike the examples are using the lessons the full AMI bundle as UMD Module directly from the `lib` folder. That why a second webpack instance is running on lessons which observes the AMI sources.

To run a lesson

```bash
yarn lesson [name of lesson]

yarn lesson 01
```

Like Examples the `index.html` files are generated by samples. the following scripts are generating these files.

```bash
yarn gen:index:lessons

yarn gen:index:lessons:cdn
```

Second script generates `index.html` files with CDN Links to the public AMI library instead of the local bundle.
