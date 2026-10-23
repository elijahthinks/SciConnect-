import * as db from './data';

// Answers /api requests from the example data in ./data.js when no API is
// reachable, so SciConnect can be shown from a static host.

const GUEST_ID = 1;
let demoMode = null; // null = not checked yet
let probe = null;

export const isDemo = () => demoMode === true;

const clone = (value) => JSON.parse(JSON.stringify(value));

const withAuthor = (post) => {
  const { userId, ...rest } = post;
  return { media: [], likes: [], comments: 0, shares: 0, visibility: 'public', mediaType: null, ...rest, userId, author: db.brief(userId) };
};

const popularTags = (list) => {
  const counts = {};
  list.forEach((p) => p.tags.forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
};

const hasTags = (post, tags) => !tags || tags.split(',').every((t) => post.tags.includes(t));
const matches = (text, q) => !q || text.toLowerCase().includes(q.toLowerCase());
const userMatches = (u, q) => matches(`${u.name} ${u.username} ${u.institution || ''} ${u.fieldOfStudy || ''}`, q);
const others = () => db.users.filter((u) => u.id !== GUEST_ID);

const factCheck = (fc) => ({ ...fc, author: db.brief(fc.authorId) });
const collaboration = (c) => ({ ...c, user: db.brief(c.userId) });
const comment = (c, postId) => ({ ...c, postId, author: db.brief(c.authorId), replies: (c.replies || []).map((r) => comment(r, postId)) });

const group = (g) => ({ ...g, currentMemberCount: g.memberIds.length, isMember: g.memberIds.includes(GUEST_ID) });
const groupMessage = (m) => ({ ...m, type: 'text', sender: db.brief(m.senderId) });

const conversation = (c) => {
  const last = c.messages[c.messages.length - 1];
  return {
    id: c.id,
    conversationId: c.id,
    otherParticipant: db.brief(c.otherId),
    lastMessage: last || null,
    lastMessageAt: last ? last.createdAt : new Date().toISOString(),
    unreadCount: c.messages.filter((m) => m.senderId !== GUEST_ID && !m.read).length,
  };
};
const chatMessage = (m, conversationId, otherId) => ({
  ...m,
  conversationId,
  receiverId: m.senderId === GUEST_ID ? otherId : GUEST_ID,
  status: 'read',
  sender: db.brief(m.senderId),
});

const reactionsFor = (id) => {
  const entry = db.reactions[id] || {};
  return Object.fromEntries(Object.entries(entry).map(([type, ids]) => [type, ids.map((uid) => ({ user: db.brief(uid) }))]));
};

const uploadsOff = () => {
  const error = new Error('Uploads are turned off in the demo.');
  error.response = { status: 400, data: { message: 'Uploads are turned off in the demo.' } };
  throw error;
};

const now = () => new Date().toISOString();

// [method, path pattern, handler({ params, query, body })]
const routes = [
  ['get', /^\/api\/auth\/me$/, () => ({ user: db.byId(GUEST_ID) })],

  ['get', /^\/api\/posts\/tags\/popular$/, () => popularTags(db.posts)],
  ['get', /^\/api\/posts$/, ({ query }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const list = db.posts.filter((p) => hasTags(p, query.tags)).map(withAuthor);
    return list.slice((page - 1) * limit, page * limit);
  }],
  ['post', /^\/api\/posts\/upload\/media$/, uploadsOff],
  ['post', /^\/api\/posts$/, ({ body }) => {
    const post = { id: db.newId(), userId: GUEST_ID, content: body.content, tags: body.tags || [], visibility: body.visibility || 'public', createdAt: now() };
    db.posts.unshift(post);
    return withAuthor(post);
  }],
  ['delete', /^\/api\/posts\/(\d+)$/, ({ params }) => {
    const i = db.posts.findIndex((p) => p.id === +params[0]);
    if (i >= 0) db.posts.splice(i, 1);
    return { message: 'Post deleted' };
  }],

  ['get', /^\/api\/research\/tags\/popular$/, () => popularTags(db.researchPosts)],
  ['get', /^\/api\/research$/, ({ query }) => {
    const page = Number(query.page) || 1;
    const list = db.researchPosts
      .filter((p) => hasTags(p, query.tags))
      .filter((p) => !query.researchType || p.researchType === query.researchType)
      .filter((p) => !query.factCheckStatus || p.factCheckStatus === query.factCheckStatus)
      .filter((p) => matches(`${p.content} ${p.methodology || ''} ${p.results || ''}`, query.search))
      .map(withAuthor);
    return { posts: list.slice((page - 1) * 10, page * 10), total: list.length };
  }],
  ['post', /^\/api\/research$/, ({ body }) => {
    const post = { citations: [], tags: [], factCheckStatus: 'pending', ...body, id: db.newId(), userId: GUEST_ID, createdAt: now() };
    db.researchPosts.unshift(post);
    return withAuthor(post);
  }],
  ['delete', /^\/api\/research\/(\d+)$/, ({ params }) => {
    const i = db.researchPosts.findIndex((p) => p.id === +params[0]);
    if (i >= 0) db.researchPosts.splice(i, 1);
    return { message: 'Research post deleted' };
  }],
  ['get', /^\/api\/research\/(\d+)\/fact-checks$/, ({ params }) => (db.factChecks[params[0]] || []).map(factCheck)],
  ['post', /^\/api\/research\/(\d+)\/fact-checks$/, ({ params, body }) => {
    const fc = { citations: [], ...body, id: db.newId(), status: 'pending', voteScore: 0, authorId: GUEST_ID, createdAt: now() };
    (db.factChecks[params[0]] ||= []).unshift(fc);
    return factCheck(fc);
  }],
  ['post', /^\/api\/research\/fact-checks\/(\d+)\/vote$/, ({ params, body }) => {
    const fc = Object.values(db.factChecks).flat().find((f) => f.id === +params[0]);
    if (fc) fc.voteScore += body.vote === 'down' || body.vote < 0 ? -1 : 1;
    return { voteScore: fc ? fc.voteScore : 0 };
  }],
  ['get', /^\/api\/research\/(\d+)\/collaborations$/, ({ params }) => (db.collaborations[params[0]] || []).map(collaboration)],
  ['post', /^\/api\/research\/(\d+)\/collaborations$/, ({ params, body }) => {
    const c = { expertise: [], ...body, id: db.newId(), status: 'pending', invitedAt: now() };
    (db.collaborations[params[0]] ||= []).unshift(c);
    return collaboration(c);
  }],
  ['put', /^\/api\/research\/collaborations\/(\d+)\/respond$/, ({ params, body }) => {
    const c = Object.values(db.collaborations).flat().find((x) => x.id === +params[0]);
    if (c) c.status = body.status;
    return c ? collaboration(c) : {};
  }],

  ['get', /^\/api\/users\/search$/, ({ query }) => others().filter((u) => userMatches(u, query.q)).map((u) => db.brief(u.id))],

  ['get', /^\/api\/comments\/post\/(\d+)$/, ({ params }) => (db.comments[params[0]] || []).map((c) => comment(c, +params[0]))],
  ['post', /^\/api\/comments$/, ({ body }) => {
    const c = { id: db.newId(), authorId: GUEST_ID, content: body.content, createdAt: now(), replies: [] };
    const list = (db.comments[body.postId] ||= []);
    const parent = body.parentId && list.find((x) => x.id === body.parentId);
    if (parent) parent.replies.push(c); else list.push(c);
    return comment(c, body.postId);
  }],
  ['delete', /^\/api\/comments\/(\d+)$/, ({ params }) => {
    Object.values(db.comments).forEach((list) => {
      const i = list.findIndex((c) => c.id === +params[0]);
      if (i >= 0) list.splice(i, 1);
    });
    return { message: 'Comment deleted' };
  }],

  ['get', /^\/api\/reactions\/\w+\/(\d+)$/, ({ params }) => reactionsFor(params[0])],
  ['post', /^\/api\/reactions\/\w+\/(\d+)$/, ({ params, body }) => {
    const entry = (db.reactions[params[0]] ||= {});
    const had = (entry[body.type] || []).includes(GUEST_ID);
    Object.keys(entry).forEach((t) => { entry[t] = entry[t].filter((id) => id !== GUEST_ID); });
    if (!had) (entry[body.type] ||= []).push(GUEST_ID);
    return { message: had ? 'Reaction removed' : 'Reaction added' };
  }],

  ['get', /^\/api\/social\/suggestions$/, () => ({ users: others().filter((u) => !db.following.includes(u.id)).map((u) => db.brief(u.id)) })],
  ['get', /^\/api\/social\/users$/, ({ query }) => ({ users: others().filter((u) => userMatches(u, query.q || query.search)).map((u) => db.brief(u.id)) })],
  ['get', /^\/api\/social\/status\/(\d+)$/, ({ params }) => {
    const id = +params[0];
    const isSelf = id === GUEST_ID;
    return {
      isFollowing: db.following.includes(id),
      followerCount: isSelf ? db.followers.length : 3 + (id % 5),
      followingCount: isSelf ? db.following.length : 2 + (id % 4),
    };
  }],
  ['get', /^\/api\/social\/(\d+)\/followers$/, () => db.followers.map(db.brief)],
  ['get', /^\/api\/social\/(\d+)\/following$/, () => db.following.map(db.brief)],
  ['post', /^\/api\/social\/follow\/(\d+)$/, ({ params }) => {
    if (!db.following.includes(+params[0])) db.following.push(+params[0]);
    return { message: 'Followed' };
  }],
  ['delete', /^\/api\/social\/unfollow\/(\d+)$/, ({ params }) => {
    const i = db.following.indexOf(+params[0]);
    if (i >= 0) db.following.splice(i, 1);
    return { message: 'Unfollowed' };
  }],

  ['get', /^\/api\/profile\/(\d+)$/, ({ params }) => db.byId(+params[0]) || db.byId(GUEST_ID)],
  ['put', /^\/api\/profile$/, ({ body }) => {
    const me = db.byId(GUEST_ID);
    Object.assign(me, body);
    me.name = `${me.firstName} ${me.lastName}`;
    return me;
  }],
  ['post', /^\/api\/profile\/avatar$/, uploadsOff],

  ['get', /^\/api\/groups$/, () => db.groups.filter((g) => g.memberIds.includes(GUEST_ID)).map(group)],
  ['get', /^\/api\/groups\/discover$/, ({ query }) => ({ groups: db.groups.filter((g) => matches(`${g.name} ${g.description} ${g.tags.join(' ')}`, query.search)).map(group) })],
  ['post', /^\/api\/groups$/, ({ body }) => {
    const g = { tags: [], type: 'public', ...body, id: db.newId(), memberIds: [GUEST_ID] };
    db.groups.unshift(g);
    return group(g);
  }],
  ['post', /^\/api\/groups\/(\d+)\/join$/, ({ params }) => {
    const g = db.groups.find((x) => x.id === +params[0]);
    if (g && !g.memberIds.includes(GUEST_ID)) g.memberIds.push(GUEST_ID);
    return { message: 'Joined group' };
  }],
  ['get', /^\/api\/groups\/(\d+)\/messages$/, ({ params }) => (db.groupMessages[params[0]] || []).map(groupMessage)],
  ['post', /^\/api\/groups\/(\d+)\/messages$/, ({ params, body }) => {
    const m = { id: db.newId(), senderId: GUEST_ID, content: body.content, createdAt: now() };
    (db.groupMessages[params[0]] ||= []).push(m);
    return groupMessage(m);
  }],

  ['get', /^\/api\/chat\/conversations$/, () => db.conversations.map(conversation)],
  ['post', /^\/api\/chat\/conversations$/, ({ body }) => {
    const otherId = +(body.participantId || body.userId);
    let c = db.conversations.find((x) => x.otherId === otherId);
    if (!c) {
      c = { id: db.newId(), otherId, messages: [] };
      db.conversations.unshift(c);
    }
    return conversation(c);
  }],
  ['get', /^\/api\/chat\/conversations\/(\d+)\/messages$/, ({ params }) => {
    const c = db.conversations.find((x) => x.id === +params[0]);
    return c ? c.messages.map((m) => chatMessage(m, c.id, c.otherId)) : [];
  }],
  ['post', /^\/api\/chat\/conversations\/(\d+)\/messages$/, ({ params, body }) => {
    const c = db.conversations.find((x) => x.id === +params[0]);
    if (!c) return {};
    const m = { id: db.newId(), senderId: GUEST_ID, content: body.content, createdAt: now() };
    c.messages.push(m);
    return chatMessage(m, c.id, c.otherId);
  }],
  ['put', /^\/api\/chat\/conversations\/(\d+)\/read$/, ({ params }) => {
    const c = db.conversations.find((x) => x.id === +params[0]);
    c?.messages.forEach((m) => { m.read = true; });
    return { message: 'Marked as read' };
  }],
  ['post', /^\/api\/chat\/media$/, uploadsOff],

  ['get', /^\/api\/notifications$/, () => db.notifications],
  ['put', /^\/api\/notifications\/read-all$/, () => {
    db.notifications.forEach((n) => { n.read = true; });
    return { message: 'All read' };
  }],
  ['put', /^\/api\/notifications\/(\d+)\/read$/, ({ params }) => {
    const n = db.notifications.find((x) => x.id === +params[0]);
    if (n) n.read = true;
    return n || {};
  }],

  ['get', /^\/api\/online-status\/me$/, () => ({ userId: GUEST_ID, isOnline: true, lastActive: now() })],
  ['get', /^\/api\/online-status\/online$/, () => [2, 5, 7].map(db.brief)],
  ['get', /^\/api\/online-status\/user\/(\d+)$/, ({ params }) => ({ userId: +params[0], isOnline: [1, 2, 5, 7].includes(+params[0]), lastActive: db.ago(+params[0] * 600000) })],
  ['post', /^\/api\/online-status\/users$/, ({ body }) => (body.userIds || []).map((id) => ({ userId: id, isOnline: [1, 2, 5, 7].includes(id), lastActive: db.ago(id * 600000) }))],
];

const parseBody = (data) => {
  if (!data || typeof data !== 'string') return {};
  try { return JSON.parse(data); } catch { return {}; }
};

async function demoAdapter(config) {
  const url = new URL(config.url, 'http://demo.local');
  const query = { ...Object.fromEntries(url.searchParams), ...(config.params || {}) };
  const method = (config.method || 'get').toLowerCase();

  // A short pause so loading states behave like a real network
  await new Promise((resolve) => setTimeout(resolve, 120));

  for (const [m, pattern, handler] of routes) {
    const match = m === method && url.pathname.match(pattern);
    if (match) {
      const data = handler({ params: match.slice(1), query, body: parseBody(config.data) });
      return { data: clone(data), status: 200, statusText: 'OK', headers: { 'content-type': 'application/json' }, config, request: {} };
    }
  }

  // Anything not modelled: an empty list for reads, a plain OK for writes
  return { data: method === 'get' ? [] : { message: 'OK' }, status: 200, statusText: 'OK', headers: {}, config, request: {} };
}

const isApi = (config) => typeof config?.url === 'string' && config.url.startsWith('/api');
const isHtml = (response) => (response?.headers?.['content-type'] || '').includes('text/html');

// Decide once whether a real API is reachable.
function checkForApi(axios) {
  if (!probe) {
    probe = axios
      .get('/api/health', { adapter: undefined, __demoProbe: true, timeout: 5000 })
      .then((res) => { demoMode = isHtml(res); })
      .catch(() => { demoMode = true; });
  }
  return probe;
}

export function installDemoFallback(axios) {
  axios.interceptors.request.use((config) => {
    if (demoMode === true && isApi(config)) config.adapter = demoAdapter;
    return config;
  });

  axios.interceptors.response.use(
    async (response) => {
      // A static host answers unknown paths with the app's HTML page
      if (isApi(response.config) && !response.config.__demoProbe && isHtml(response)) {
        await checkForApi(axios);
        if (demoMode) return demoAdapter(response.config);
        throw new Error('Unexpected HTML response from the API');
      }
      return response;
    },
    async (error) => {
      const config = error.config;
      const status = error.response?.status;
      if (isApi(config) && !config.__demoProbe && (!error.response || status === 404 || status >= 502)) {
        await checkForApi(axios);
        if (demoMode) return demoAdapter(config);
      }
      throw error;
    },
  );
}
