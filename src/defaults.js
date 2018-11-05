const path = require('path');
const proc = require('process');
const year = require('year');
const setValue = require('set-value');
const mixinDeep = require('mixin-deep');
const gitUserName = require('git-user-name');
const gitUserEmail = require('git-user-email');

const defaults = {
  engine: 'lodash',
  project: {
    owner: 'tunnckoCoreLabs',
  },
  locals: {
    deps: `${JSON.stringify({ esm: '^3.0.84' }, null, 4).slice(0, -1)}  }`,
    devDeps: `${JSON.stringify(
      {
        '@tunnckocore/config': '^0.5.1',
        '@tunnckocore/scripts': '^1.0.1',
        asia: '^0.19.7',
      },
      null,
      4,
    ).slice(0, -1)}  }`,
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

module.exports = (argv = {}) => {
  const options = Object.keys(argv).reduce((acc, key) => {
    setValue(acc, key, argv[key]);
    return acc;
  }, {});

  const name = (argv._ && argv._[0]) || options.name;
  const desc = (argv._ && argv._[1]) || options.description;

  const opts = mixinDeep(
    { project: { name, description: desc } },
    defaults,
    options,
  );

  if (typeof opts.project.dest !== 'string') {
    opts.project.dest = opts.project.name.startsWith('@')
      ? opts.project.name.split('/')[1]
      : opts.project.name;
  }

  opts.project.dest = path.join(opts.cwd || proc.cwd(), opts.project.dest);
  opts.project.repo = path.basename(opts.project.dest);
  opts.locals.repository = `${opts.project.owner}/${opts.project.repo}`;
  return opts;
};
