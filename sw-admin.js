// Service worker do admin: recebe Web Push e abre a conversa ao tocar
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch { d = { title: 'SDTV', body: e.data && e.data.text() }; }
  const title = d.title || 'SDTV Admin', base = { body: d.body || '', icon: '/icon-192.png', data: { url: d.url || '/' }, vibrate: [300, 100, 300, 100, 300], requireInteraction: true, silent: false };
  // iPhone/Safari: se a notificação falhar, o iOS cancela a inscrição. Tenta completa e cai para a mais simples.
  e.waitUntil(self.registration.showNotification(title, { ...base, badge: '/icon-192.png', tag: d.tag || 'sdtv-' + Date.now(), renotify: true }).catch(() => self.registration.showNotification(title, { body: base.body, data: base.data })));
});
self.addEventListener('notificationclick', e => {
  e.notification.close(); const url = new URL(e.notification.data?.url || '/', self.location.origin).href;
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) if (new URL(c.url).origin === self.location.origin) { await c.focus(); c.postMessage({ openChat: new URL(url).searchParams.get('chat') }); return; }
    return self.clients.openWindow(url);
  })());
});
