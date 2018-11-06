const path = require('path');
const proc = require('process');
const year = require('year');
const setValue = require('set-value');
const mixinDeep = require('mixin-deep');
const gitUserName = require('git-user-name');
const gitUserEmail = require('git-user-email');
const packageJson = require('@tunnckocore/package-json');

const get = async (name, field) => (await packageJson(name))[field];

const defaults = {
  engine: 'lodash',
  project: {
    owner: 'tunnckoCoreLabs',
  },
  locals: {
    version: '0.0.0',
    author: {
      name: gitUserName(),
      // TODO: remove the fallback when `git-user-email` PR#4 is merged,
      // because currently it always returns `null`
      email: gitUserEmail() || 'mameto2011@gmail.com',
      login: 'tunnckoCore',
      username: 'tunnckoCore',
      twitter: 'tunnckoCore',
      github: 'tunnckoCore',
      url: 'https://tunnckocore.com',
      avatar: 'https://avatars3.githubusercontent.com/u/5038030?v=4',
    },
    license: { name: 'Apache-2.0', year: year() },
  },
};

module.exports = async (argv = {}) => {
  const options = Object.keys(argv).reduce((acc, key) => {
    setValue(acc, key, argv[key]);
    return acc;
  }, {});

  const name = (argv._ && argv._[0]) || options.name;
  const desc = (argv._ && argv._[1]) || options.description;

  const opts = mixinDeep(
    { project: { name, description: desc } },
    defaults,
    { locals: await latestDeps(argv.pkg) },
    options,
  );

  let { repo } = opts.project;
  if (typeof repo !== 'string') {
    repo = opts.project.name.startsWith('@')
      ? opts.project.name.split('/')[1]
      : opts.project.name;
  }

  opts.dest = opts.dest || path.join(opts.cwd || proc.cwd(), repo);
  opts.project.repo = repo;

  const repository = `${opts.project.owner}/${opts.project.repo}`;
  opts.locals.repository = repository;

  const home = opts.project.homepage || `https://github.com/${repository}`;
  opts.project.homepage = home;

  return opts;
};

async function latestDeps(pkg = {}) {
  const deps = Object.assign({}, pkg.dependencies, {
    esm: `^${await get('esm', 'version')}`,
  });

  const latestConfig = await get('@tunnckocore/config', 'version');
  const latestScripts = await get('@tunnckocore/scripts', 'version');
  const devDeps = Object.assign({}, pkg.devDependencies, {
    '@tunnckocore/config': `^${latestConfig}`,
    '@tunnckocore/scripts': `^${latestScripts}`,
    asia: `^${await get('asia', 'version')}`,
  });

  return {
    deps: stringify(deps),
    devDeps: stringify(devDeps),
  };
}

function stringify(val) {
  return `${JSON.stringify(val, null, 4).slice(0, -1)}  }`;
}
