const fetch = require('isomorphic-fetch');

const sc2 = {
  baseURL: 'https://v2.steemconnect.com',
  app: '',
  callbackURL: '',
};

sc2.init = (params) => {
  params.baseURL && sc2.setBaseURL(params.baseURL);
  params.app && sc2.setApp(params.app);
  params.callbackURL && sc2.setCallbackURL(params.callbackURL);
  params.accessToken && sc2.setAccessToken(params.accessToken);
};

sc2.setBaseURL = (baseURL) => sc2.baseURL = baseURL;
sc2.setApp = (app) => sc2.app = app;
sc2.setCallbackURL = (callbackURL) => sc2.callbackURL = callbackURL;
sc2.setAccessToken = (accessToken) => sc2.accessToken = accessToken;

sc2.getLoginURL = (callbackURL) => {
  const redirectUri = callbackURL || sc2.callbackURL;
  return `${sc2.baseURL}/oauth2/authorize?client_id=${sc2.app}&redirect_uri=${encodeURIComponent(redirectUri)}`;
};

sc2.send = (route, body, cb) => {
  const url = `${sc2.baseURL}/api/${route}`;
  const retP = fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: sc2.accessToken,
    },
    body: JSON.stringify(body)
  }).then((res) => {
    if (res.status >= 400) {
      throw new Error(`SteemConnect API call failed with ${res.status}`);
    }
    return res.json();
  });

  if (!cb) return retP;

  return retP.then((ret) => {
    cb(null, ret);
  }, (err) => {
    cb(err);
  });
};

sc2.broadcast = (operations, cb) => sc2.send('broadcast', { operations }, cb);
sc2.me = (cb) => sc2.send('me', {}, cb);

sc2.vote = (voter, author, permlink, weight, cb) => {
  const params = {
    voter,
    author,
    permlink,
    weight,
  };
  return sc2.broadcast([['vote', params]], cb);
};

sc2.comment = (parentAuthor, parentPermlink, author, permlink, title, body, jsonMetadata, cb) => {
  const params = {
    parent_author: parentAuthor,
    parent_permlink: parentPermlink,
    author,
    permlink,
    title,
    body,
    json_metadata: jsonMetadata,
  };
  return sc2.broadcast([['comment', params]], cb);
};

exports = module.exports = sc2;
