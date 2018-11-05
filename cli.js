#!/usr/bin/env node

const proc = require('process');
const mri = require('mri');
const set = require('set-value');
const mixinDeep = require('mixin-deep');

const defaults = require('./src/defaults');
const pkg = require('./package.json');
const charlike = require('./index');

function showHelp() {
  return `  charlike v${pkg.version}
  ${pkg.description}

  Usage: charlike [name] [description] [flags]

  Common Flags:
    -h, --help                Display this help.
    -v, --version             Display current version.

  Flags:
    -n, --name                Project's name.
    -d, --desc                Project description, short for "--project.description".
    -o, --owner               Usually your GitHub username or organization.
    -t, --templates           Source templates directory.
    --engine                  Engine to be used in the template files.
    --locals                  Locals for the template files. Support dot notation.
    --project                 Project metadata like name, description, author
    --project.name            Project name.
    --project.description     Project description.
    --project.author.name     Project's author name.
    --cwd                     Folder to be used as current working dir.
    --ly                      Set --locals.license.year, just a shortcut.

  Examples:
    charlike --project.name foobar --project.author 'John Snow'
    charlike foobar --project.author.name 'John Snow'
    charlike foobar --locals.license 'Apache-2.0' --locals.foo bar
    charlike foobar 'This is description'
    charlike foobar --project.description 'Some description here'
    charlike foobar --desc 'Some description here'
    charlike foobar 'Awesome description' --owner tunnckoCoreLabs
    charlike --project.name qux --desc 'Yeah descr' --owner tunnckoCore
  `;
}

const argv = mri(proc.argv.slice(2), {
  alias: {
    v: 'version',
    h: 'help',
    o: 'owner',
    d: 'desc',
    t: 'templates',
  },
});

const options = Object.keys(argv).reduce((acc, key) => {
  set(acc, key, argv[key]);
  return acc;
}, {});

const name = argv._[0] || options.name;
const desc = argv._[1] || options.desc;

options.locals = mixinDeep({}, defaults.locals, options.locals);
options.locals.license.year = argv.ly || options.locals.license.year;
options.project = mixinDeep(
  {},
  defaults.project,
  options.locals.project,
  options.project,
  { name, desc, description: desc },
);
options.project.owner = options.owner || options.project.owner;

if (!options.project.name) {
  console.error('At least project name is required.');
  console.error(showHelp());
  proc.exit(1);
}

if (argv.help) {
  console.log(showHelp());
  proc.exit(0);
}

if (argv.version) {
  console.log(pkg.version);
  proc.exit(0);
}

/* eslint-disable promise/always-return */

charlike(options)
  .then(({ project = {} } = {}) => {
    console.log('Project is generated at', project.dest);
  })
  .catch((err) => {
    console.error('Oooh! Some error occured.');
    console.error(argv.verbose ? err.stack : err.message);
    proc.exit(1);
  });
