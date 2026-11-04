// Backup PDF dos clientes (sem senhas). Usado no admin (navegador) e nos testes (node).
(function (root) {
  const fd = d => { if (!d) return '—'; const x = new Date(d); return isNaN(x) ? '—' : x.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }); };
  const fp = p => { p = String(p || '').replace(/\D/g, ''); return p.length >= 10 ? `(${p.slice(-11, -9) || p.slice(0, 2)}) ${p.slice(-9, -4)}-${p.slice(-4)}` : (p || '—'); };
  // clients não tem e-mail: busca no chat ligado ao cliente (chats.client_id) ou no teste com o mesmo usuário
  function backupRows(S) {
    const chats = S.chats || [], tests = S.tests || [];
    return (S.clients || []).map(c => {
      const ch = chats.find(x => x.client_id === c.id && x.email);
      const t = c.username && tests.find(x => (x.username || '').toLowerCase() === c.username.toLowerCase() && x.email);
      return { nome: c.name || '—', email: c.email || ch?.email || t?.email || '—', tel: fp(c.phone), user: c.username || '—', exp: c.exp || null };
    }).sort((a, b) => (a.exp ? Date.parse(a.exp) : Infinity) - (b.exp ? Date.parse(b.exp) : Infinity));
  }
  function backupPdf(jsPDF, S, title) {
    const rows = backupRows(S), doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
    const cols = [['Nome', 14, 62], ['E-mail', 78, 72], ['Telefone', 152, 36], ['Usuário', 190, 50], ['Vencimento', 242, 30]];
    const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    let y = 0, page = 0;
    const head = () => {
      page++; if (page > 1) doc.addPage();
      doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.text(`${title || 'SDTV'} — Backup de clientes`, 14, 14);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text(`Gerado em ${now} · Total: ${rows.length} cliente(s) · ordenado por vencimento`, 14, 20);
      doc.setFillColor(255, 122, 0); doc.rect(12, 24, W - 24, 7, 'F'); doc.setTextColor(255); doc.setFont('helvetica', 'bold');
      cols.forEach(([n, x]) => doc.text(n, x, 29)); doc.setTextColor(0); doc.setFont('helvetica', 'normal'); y = 36;
    };
    head();
    rows.forEach((r, i) => {
      if (y > H - 14) head();
      if (i % 2) { doc.setFillColor(245, 245, 245); doc.rect(12, y - 4.5, W - 24, 6.5, 'F'); }
      const late = r.exp && Date.parse(r.exp) < Date.now(); 
      [r.nome, r.email, r.tel, r.user, fd(r.exp)].forEach((v, k) => { if (k === 4 && late) doc.setTextColor(200, 0, 0); doc.text(doc.splitTextToSize(String(v), cols[k][2] - 2)[0], cols[k][1], y); doc.setTextColor(0); });
      y += 6.5;
    });
    if (!rows.length) doc.text('Nenhum cliente cadastrado.', 14, y);
    const n = doc.getNumberOfPages();
    for (let p = 1; p <= n; p++) { doc.setPage(p); doc.setFontSize(8); doc.text(`Página ${p}/${n} · sem senhas`, W - 14, H - 6, { align: 'right' }); }
    return doc;
  }
  root.backupRows = backupRows; root.backupPdf = backupPdf;
  if (typeof module !== 'undefined') module.exports = { backupRows, backupPdf };
})(typeof window !== 'undefined' ? window : globalThis);
