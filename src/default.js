const year = require('year');
const gitUserName = require('git-user-name');
const gitUserEmail = require('git-user-email');

module.exports = {
  project: {
    owner: 'tunnckoCore',
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
