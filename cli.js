#!/usr/bin/env node

const proc = require('process');
const mri = require('mri');
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
    'project.name': ['n', 'name'],
    'project.owner': ['o', 'owner'],
    'project.description': ['d', 'desc', 'description'],
    t: 'templates',
  },
});

argv.name = argv._[0] || argv.name;

if (!argv.name) {
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

argv.project = Object.assign({}, argv.project);

// const options = makeDefaults(argv);
charlike(argv)
  .then((result = {}) => {
    console.log(result);
    console.log('Project is generated at', result.project.dest);
  })
  .catch((err) => {
    console.error('Oooh! Some error occured.');
    console.error(argv.verbose ? err.stack : err.message);
    proc.exit(1);
  });
