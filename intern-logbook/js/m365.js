// Microsoft 365 storage: keeps attendance entries in a SharePoint list via Microsoft Graph.
// Sign-in uses MSAL (vendor/msal-browser.min.js) with a popup, so the page never navigates away.
window.M365 = (() => {
  const GRAPH = 'https://graph.microsoft.com/v1.0';
  const SCOPES = ['Sites.ReadWrite.All'];   // read/write list items
  const MANAGE = ['Sites.Manage.All'];      // only needed once, to create the list
  const FIELDS = ['Title', 'Intern', 'InternSlot', 'WorkDate', 'TimeIn', 'TimeOut', 'Hours', 'Signature'];

  let pca = null, pcaKey = '', account = null;
  let siteId = null, listId = null, targetKey = '';

  const available = () => typeof msal !== 'undefined' && /^https?:$/.test(location.protocol);
  const configured = (cfg) => !!(cfg && cfg.clientId && cfg.siteUrl && cfg.listName);

  // (Re)create the MSAL client when the app registration changes; returns true if someone is signed in.
  async function init(cfg) {
    if (!available() || !configured(cfg)) { account = null; return false; }
    const key = cfg.clientId + '|' + (cfg.tenant || '');
    if (key !== pcaKey) {
      pca = new msal.PublicClientApplication({
        auth: {
          clientId: cfg.clientId,
          authority: 'https://login.microsoftonline.com/' + (cfg.tenant || 'organizations'),
          redirectUri: new URL('blank.html', location.href).href,
        },
        cache: { cacheLocation: 'localStorage' },
      });
      await pca.initialize();
      pcaKey = key;
    }
    const tk = cfg.siteUrl + '|' + cfg.listName;
    if (tk !== targetKey) { siteId = listId = null; targetKey = tk; }
    account = pca.getActiveAccount() || pca.getAllAccounts()[0] || null;
    if (account) pca.setActiveAccount(account);
    return !!account;
  }

  async function signIn() {
    const r = await pca.loginPopup({ scopes: SCOPES, prompt: 'select_account' });
    account = r.account;
    pca.setActiveAccount(account);
  }

  async function signOut() {
    if (pca && account) await pca.clearCache({ account });
    account = null; siteId = listId = null;
  }

  async function token(scopes) {
    try {
      return (await pca.acquireTokenSilent({ account, scopes })).accessToken;
    } catch (e) {
      if (e instanceof msal.InteractionRequiredAuthError) return (await pca.acquireTokenPopup({ account, scopes })).accessToken;
      throw e;
    }
  }

  async function graph(method, path, body, scopes = SCOPES) {
    const headers = { Authorization: 'Bearer ' + await token(scopes) };
    if (body) headers['Content-Type'] = 'application/json';
    const res = await fetch(path.startsWith('http') ? path : GRAPH + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    if (res.status === 204) return null;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error?.message || `${res.status} ${res.statusText}`);
      err.status = res.status;
      throw err;
    }
    return data;
  }

  // https://contoso.sharepoint.com/sites/Interns/SitePages/Home.aspx -> /sites/contoso.sharepoint.com:/sites/Interns
  function sitePath(url) {
    const u = new URL(url);
    const segs = u.pathname.split('/').filter(Boolean);
    const rel = /^(sites|teams)$/i.test(segs[0] || '') && segs[1] ? `/${segs[0]}/${segs[1]}` : '';
    return rel ? `/sites/${u.hostname}:${rel}` : `/sites/${u.hostname}`;
  }

  // Finds the site and list. Returns { site, list } names; list is null if it doesn't exist yet.
  async function resolve(cfg) {
    const site = await graph('GET', sitePath(cfg.siteUrl) + '?$select=id,displayName');
    siteId = site.id;
    const lists = await graph('GET', `/sites/${siteId}/lists?$select=id,displayName&$top=999`);
    const want = cfg.listName.trim().toLowerCase();
    const found = lists.value.find((l) => l.displayName.toLowerCase() === want);
    listId = found ? found.id : null;
    return { site: site.displayName, list: found ? found.displayName : null };
  }

  async function createList(cfg) {
    const l = await graph('POST', `/sites/${siteId}/lists`, {
      displayName: cfg.listName.trim(),
      list: { template: 'genericList' },
      columns: [
        { name: 'Intern', text: {} },
        { name: 'InternSlot', number: { decimalPlaces: 'none' } },
        { name: 'WorkDate', text: {} },
        { name: 'TimeIn', text: {} },
        { name: 'TimeOut', text: {} },
        { name: 'Hours', number: { decimalPlaces: 'two' } },
        { name: 'Signature', text: { allowMultipleLines: true, textType: 'plain' } },
      ],
    }, MANAGE);
    listId = l.id;
  }

  const itemsPath = () => `/sites/${siteId}/lists/${listId}/items`;

  function fromItem(it) {
    const f = it.fields || {};
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.WorkDate || '') || !f.TimeIn || !f.TimeOut) return null;
    return {
      id: 'sp' + it.id, spId: it.id,
      intern: Math.min(1, Math.max(0, (Number(f.InternSlot) || 1) - 1)),
      date: f.WorkDate, in: f.TimeIn, out: f.TimeOut,
      hours: Number(f.Hours) || 0, sig: f.Signature || '',
    };
  }

  async function load() {
    const out = [];
    let url = `${itemsPath()}?$expand=fields($select=${FIELDS.join(',')})&$top=500`;
    while (url) {
      const page = await graph('GET', url);
      out.push(...page.value);
      url = page['@odata.nextLink'];
    }
    return out.map(fromItem).filter(Boolean);
  }

  async function add(e, internName) {
    const r = await graph('POST', itemsPath(), {
      fields: {
        Title: `${internName} – ${e.date}`, Intern: internName, InternSlot: e.intern + 1,
        WorkDate: e.date, TimeIn: e.in, TimeOut: e.out, Hours: e.hours, Signature: e.sig,
      },
    });
    return r.id;
  }

  const remove = (spId) => graph('DELETE', `${itemsPath()}/${spId}`);

  return {
    available, configured, init, signIn, signOut, resolve, createList, load, add, remove,
    get user() { return account ? (account.name || account.username) : ''; },
    get ready() { return !!(account && siteId && listId); },
  };
})();
