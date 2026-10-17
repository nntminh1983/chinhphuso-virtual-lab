# -*- coding: utf-8 -*-
"""Chuyển core.js của Phòng Lab Mã hóa thành core.js của Phòng mô phỏng Chính phủ số (chạy một lần)."""
import pathlib, re
ROOT = pathlib.Path(__file__).resolve().parent.parent
p = ROOT / "assets" / "core.js"
s = p.read_text(encoding="utf-8")

s = s.replace("""/* COM608 — Phòng Lab Mã hóa — thư viện lõi
   Cung cấp: LAB.h (tạo phần tử), LAB.ui (điều khiển, bảng, bit, bước tính), LAB.math (số học modulo, BigInt),
   LAB.txt (chữ cái A–Z), LAB.chart (đường, cột, có tooltip), LAB.module (đăng ký mô-đun + tab), điều hướng và giao diện. */""",
"""/* Phòng mô phỏng Chính phủ số — thư viện lõi
   Cung cấp: LAB.h (tạo phần tử), LAB.ui (điều khiển, bảng, bước, thẻ), LAB.chart (đường, cột, radar, có tooltip),
   LAB.data (truy cập dữ liệu giả lập trong assets/data.js), LAB.csv (xuất CSV), LAB.module (đăng ký mô-đun + tab), điều hướng, giao diện. */""")

# bỏ khối chữ cái + số học mật mã, thay bằng tiện ích hành chính
a = s.index("/* ============================ chữ cái ============================ */")
b = s.index("/* PRNG có mầm (mulberry32)")
NEW = r'''/* ============================ tiện ích số liệu hành chính ============================ */
LAB.vnd = n => (n == null || n === "" || !isFinite(+n)) ? "—" : (+n === 0 ? "Không thu" : Math.round(+n).toLocaleString("vi-VN") + " đ");
LAB.num = (n, d = 0) => (n == null || n === "" || !isFinite(+n)) ? "—" : (+n).toLocaleString("vi-VN", { minimumFractionDigits: d, maximumFractionDigits: d });
LAB.pc = (v, d = 1) => (v == null || !isFinite(+v)) ? "—" : LAB.num(+v, d) + " %";
/* ngày ISO yyyy-mm-dd ↔ dd/mm/yyyy */
LAB.date = {
  parse: s => { if (!s) return null; const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s); if (m) return new Date(+m[1], +m[2] - 1, +m[3]); const n = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s); if (n) return new Date(+n[3], +n[2] - 1, +n[1]); const d = new Date(s); return isNaN(d) ? null : d; },
  vn: s => { const d = s instanceof Date ? s : LAB.date.parse(s); return d ? String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear() : "—"; },
  iso: d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"),
  quy: s => { const d = s instanceof Date ? s : LAB.date.parse(s); return d ? d.getFullYear() + "-Q" + (Math.floor(d.getMonth() / 3) + 1) : "—"; },
  thang: s => { const d = s instanceof Date ? s : LAB.date.parse(s); return d ? d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") : "—"; },
  days: (a, b) => Math.round((LAB.date.parse(b) - LAB.date.parse(a)) / 86400000),
  /* ngày làm việc giữa hai ngày (bỏ T7, CN; không tính ngày lễ) */
  workdays: (a, b) => { let d = LAB.date.parse(a); const e = LAB.date.parse(b); if (!d || !e) return null; let n = 0; const sgn = e >= d ? 1 : -1; while (sgn > 0 ? d < e : d > e) { d = new Date(d.getTime() + sgn * 86400000); if (d.getDay() !== 0 && d.getDay() !== 6) n += sgn; } return n; },
};
/* thống kê gọn */
LAB.stat = {
  sum: a => a.reduce((s, v) => s + (+v || 0), 0),
  mean: a => a.length ? LAB.stat.sum(a) / a.length : NaN,
  median: a => { const b = a.map(Number).filter(isFinite).sort((x, y) => x - y); if (!b.length) return NaN; const m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; },
  /* nhóm theo khoá: groupBy(rows, r => r.linh_vuc) → Map */
  groupBy: (rows, key) => { const m = new Map(); rows.forEach(r => { const k = typeof key === "function" ? key(r) : r[key]; if (!m.has(k)) m.set(k, []); m.get(k).push(r); }); return m; },
  count: (rows, key) => { const m = new Map(); rows.forEach(r => { const k = typeof key === "function" ? key(r) : r[key]; m.set(k, (m.get(k) || 0) + 1); }); return m; },
  rate: (rows, pred) => rows.length ? rows.filter(pred).length / rows.length : NaN,
  uniq: (rows, key) => [...new Set(rows.map(r => typeof key === "function" ? key(r) : r[key]))],
};
/* dữ liệu giả lập: window.CPS_DATA (assets/data.js, dạng gọn {h:[cột], r:[[giá trị]]}).
   LAB.data.ho_so, LAB.data.dan_cu, … trả về BẢN SAO mảng object (mỗi dòng một object, khoá = tên cột) để mô-đun tự do lọc/sắp xếp.
   LAB.data.meta (mô tả bộ dữ liệu), LAB.data.ky_nang (mảng tên cột kỹ năng) trả về nguyên trạng. */
const dataCache = {};
LAB.data = new Proxy({}, { get: (_, k) => {
  const D = window.CPS_DATA || {}; const v = D[k]; if (v == null) return undefined;
  if (v && Array.isArray(v.h) && Array.isArray(v.r)) { if (!dataCache[k]) dataCache[k] = v.r.map(row => { const o = {}; v.h.forEach((c, i) => { o[c] = row[i]; }); return o; }); return dataCache[k].map(o => Object.assign({}, o)); }
  return Array.isArray(v) ? v.slice() : v;
} });
LAB.dataHeaders = k => { const v = (window.CPS_DATA || {})[k]; return v && v.h ? v.h.slice() : []; };
/* xuất CSV (UTF-8 có BOM để Excel đọc tiếng Việt): LAB.csv.download("ten.csv", headers, rows) ; rows là mảng mảng hoặc mảng object */
LAB.csv = {
  text: (headers, rows) => { const esc = v => { const s = v == null ? "" : String(v); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }; const body = rows.map(r => (Array.isArray(r) ? r : headers.map(k => r[k])).map(esc).join(",")); return "﻿" + [headers.join(","), ...body].join("\r\n"); },
  download: (name, headers, rows) => { const blob = new Blob([LAB.csv.text(headers, rows)], { type: "text/csv;charset=utf-8" }); const a = h("a", { href: URL.createObjectURL(blob), download: name }); document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); },
  downloadText: (name, text, type) => { const blob = new Blob([text], { type: type || "text/plain;charset=utf-8" }); const a = h("a", { href: URL.createObjectURL(blob), download: name }); document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); },
};
/* lưu/đọc bài làm của học viên trên máy (localStorage) — khoá tiền tố "cps." */
LAB.store = {
  get: (k, dflt) => { try { const v = localStorage.getItem("cps." + k); return v == null ? dflt : JSON.parse(v); } catch (e) { return dflt; } },
  set: (k, v) => { try { localStorage.setItem("cps." + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  del: k => { try { localStorage.removeItem("cps." + k); } catch (e) { /* bỏ qua */ } },
};
/* bỏ dấu tiếng Việt để tìm kiếm: LAB.khongDau("Nghị định") → "nghi dinh" */
LAB.khongDau = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

'''
s = s[:a] + NEW + s[b:]

# khoá localStorage và nhãn
s = s.replace('"com608.', '"cps.')
s = s.replace('MÔ-ĐUN ', 'BUỔI ')
s = s.replace('"Lỗi khi dựng mô phỏng: "', '"Lỗi khi dựng mô phỏng: "')

# thêm thanh tiến độ, thẻ chọn, radar vào ui/chart (chèn trước phần biểu đồ canvas)
c = s.index("/* ============================ biểu đồ canvas ============================ */")
UI_EXT = r'''/* thanh mức độ 0–100: ui.bar({label, value, max, kind, text}) */
ui.bar = o => { const pct = Math.max(0, Math.min(100, 100 * (o.value || 0) / (o.max || 100))); return h("div", { class: "bar" + (o.kind ? " " + o.kind : "") }, o.label != null ? h("div", { class: "bl" }, h("span", null, o.label), h("span", { class: "bv" }, o.text != null ? o.text : LAB.num(o.value, 0))) : null, h("div", { class: "bt" }, h("div", { class: "bf", style: { width: pct + "%" } }))); };
/* thẻ bấm chọn (lưới): ui.tiles({items:[{id,title,sub,kind}], value, onChange, multi}) → .get()/.set() */
ui.tiles = o => {
  let cur = o.multi ? new Set(o.value || []) : o.value;
  const wrap = h("div", { class: "tiles" + (o.cls ? " " + o.cls : "") });
  const els = o.items.map(it => { const b = h("button", { type: "button", class: "tile" + (it.kind ? " " + it.kind : ""), onclick: () => { if (o.multi) { cur.has(it.id) ? cur.delete(it.id) : cur.add(it.id); } else cur = it.id; paint(); if (o.onChange) o.onChange(o.multi ? [...cur] : cur, it); } }, h("b", null, it.title), it.sub ? h("span", null, it.sub) : null); b.dataset.id = it.id; return b; });
  const paint = () => els.forEach(b => b.classList.toggle("on", o.multi ? cur.has(b.dataset.id) : b.dataset.id === String(cur)));
  els.forEach(b => wrap.appendChild(b)); paint();
  wrap.get = () => o.multi ? [...cur] : cur; wrap.set = v => { cur = o.multi ? new Set(v || []) : v; paint(); };
  return wrap;
};
/* khối trích dẫn văn bản QPPL: ui.cancu("Luật Dữ liệu 60/2024/QH15, Điều 11 khoản 2 điểm b", "nguyên văn…") */
ui.cancu = (vb, noidung) => h("div", { class: "cancu" }, h("div", { class: "vb" }, "Căn cứ: ", vb), noidung ? h("div", { class: "nd", html: noidung }) : null);
/* dải cảnh báo mô phỏng */
ui.warn = text => h("div", { class: "note eve" }, h("b", null, "Môi trường mô phỏng. "), text || "Mọi tên người, địa danh, số liệu đều hư cấu và không có giá trị pháp lý.");
/* điểm số dạng vòng: ui.score(72, "điểm", 100) */
ui.score = (v, label, max) => { const pct = Math.max(0, Math.min(1, (v || 0) / (max || 100))); return h("div", { class: "score", style: { "--p": (pct * 100).toFixed(1) } }, h("div", { class: "sv" }, LAB.num(v, Number.isInteger(v) ? 0 : 1)), label ? h("div", { class: "sl" }, label) : null); };

'''
s = s[:c] + UI_EXT + s[c:]

# radar chart: chèn trước chart.box
d = s.index("/* hộp biểu đồ tự vẽ lại khi đổi kích thước/chủ đề")
RADAR = r'''/* chart.radar(box, {axes:[tên], series:[{name,color,values:[0..max]}], max, title}) */
chart.radar = function (box, o) {
  box.classList.add("chartbox");
  if (o.title && !box.querySelector(".ttl")) box.insertBefore(h("div", { class: "ttl" }, o.title), box.firstChild);
  const { cv, ctx, W, H } = setupCanvas(box, o.aspect || 0.72);
  const C = LAB.colors(); const n = o.axes.length, max = o.max || 5;
  const cx = W / 2, cy = H / 2 + 6, R = Math.min(W, H) / 2 - 46;
  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.font = "11px " + getComputedStyle(document.body).getPropertyValue("--f-mono"); ctx.fillStyle = C.faint;
  const ang = i => -Math.PI / 2 + i * 2 * Math.PI / n;
  for (let lv = 1; lv <= (o.levels || max); lv++) { const r = R * lv / (o.levels || max); ctx.beginPath(); for (let i = 0; i < n; i++) { const x = cx + r * Math.cos(ang(i)), y = cy + r * Math.sin(ang(i)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); ctx.stroke(); if (lv === (o.levels || max) || lv % 2 === 1) { ctx.textAlign = "left"; ctx.textBaseline = "bottom"; ctx.fillText(String(+(max * lv / (o.levels || max)).toFixed(1)), cx + 3, cy - r - 1); } }
  ctx.strokeStyle = C.line; for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + R * Math.cos(ang(i)), cy + R * Math.sin(ang(i))); ctx.stroke(); }
  ctx.fillStyle = C.soft; ctx.font = "12px " + getComputedStyle(document.body).getPropertyValue("--f-body");
  o.axes.forEach((a, i) => { const x = cx + (R + 14) * Math.cos(ang(i)), y = cy + (R + 14) * Math.sin(ang(i)); ctx.textAlign = Math.abs(Math.cos(ang(i))) < 0.2 ? "center" : (Math.cos(ang(i)) > 0 ? "left" : "right"); ctx.textBaseline = Math.abs(Math.sin(ang(i))) < 0.2 ? "middle" : (Math.sin(ang(i)) > 0 ? "top" : "bottom"); const lines = String(a).split("\n"); lines.forEach((ln, k) => ctx.fillText(ln, x, y + (k - (lines.length - 1) / 2) * 13)); });
  o.series.forEach(sr => { const col = C[sr.color] || sr.color || C.pt; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2; ctx.beginPath(); sr.values.forEach((v, i) => { const r = R * Math.max(0, Math.min(max, +v || 0)) / max; const x = cx + r * Math.cos(ang(i)), y = cy + r * Math.sin(ang(i)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.save(); ctx.globalAlpha = 0.15; ctx.fill(); ctx.restore(); ctx.stroke(); sr.values.forEach((v, i) => { const r = R * Math.max(0, Math.min(max, +v || 0)) / max; ctx.beginPath(); ctx.arc(cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i)), 3.5, 0, 2 * Math.PI); ctx.fill(); }); });
  if (o.series.length > 1 && o.legend !== false) { let lg = box.querySelector(".clegend"); if (!lg) lg = box.appendChild(h("div", { class: "clegend" })); LAB.clear(lg); o.series.forEach(sr => lg.appendChild(h("span", { style: { "--c": C[sr.color] || sr.color } }, sr.name))); }
};
'''
s = s[:d] + RADAR + s[d:]
p.write_text(s, encoding="utf-8")
print("core.js:", len(s), "ký tự")

# style.css: đổi phần mô tả đầu + thêm lớp mới
q = ROOT / "assets" / "style.css"
t = q.read_text(encoding="utf-8")
t = t.replace("""/* COM608 — Phòng Lab Mã hóa
   Layout: cố định thanh điều hướng trái (6 mô-đun), mỗi mô-đun là một trang có các tab mô phỏng.
   Màu theo vai trò trong một hệ mật: bản rõ (xanh dương), khóa (đồng thau), bản mã (tím),
   kẻ tấn công (đỏ), kết quả đúng (lục), kênh/phụ (lam ngọc). */""",
"""/* Phòng mô phỏng Chính phủ số
   Layout: thanh điều hướng trái (8 buổi học), mỗi buổi là một trang có các tab mô phỏng.
   Màu theo vai trò: người dân / dịch vụ (xanh dương, --pt), văn bản pháp luật & chỉ tiêu (đồng thau, --key),
   dữ liệu (tím, --ct), rủi ro / lỗi / cảnh báo (đỏ, --eve), đạt / đúng (lục, --ok), cơ quan nhà nước / hạ tầng (lam ngọc, --aqua). */""")
t += r'''

/* ---------- bổ sung cho Chính phủ số ---------- */
.bar{display:flex;flex-direction:column;gap:3px;min-width:0}
.bar .bl{display:flex;justify-content:space-between;gap:8px;font-size:12.5px;color:var(--soft)}
.bar .bv{font-family:var(--f-mono);color:var(--ink);font-weight:600}
.bar .bt{height:8px;background:var(--sunk);border:1px solid var(--line2);border-radius:5px;overflow:hidden}
.bar .bf{height:100%;background:var(--pt);border-radius:5px;transition:width .25s}
.bar.key .bf{background:var(--key)} .bar.ct .bf{background:var(--ct)} .bar.eve .bf{background:var(--eve)} .bar.ok .bf{background:var(--ok)} .bar.aqua .bf{background:var(--aqua)}
.tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:8px}
.tiles.narrow{grid-template-columns:repeat(auto-fill,minmax(130px,1fr))}
.tile{display:flex;flex-direction:column;gap:3px;text-align:left;background:var(--sunk);border:1px solid var(--line);border-radius:7px;padding:9px 11px;cursor:pointer;color:var(--ink);min-width:0}
.tile b{font-weight:600;font-size:13.5px;line-height:1.3}
.tile span{font-size:12px;color:var(--faint);line-height:1.35}
.tile:hover{border-color:var(--faint)}
.tile.on{border-color:var(--key);background:var(--key-bg);box-shadow:inset 0 0 0 1px var(--key)}
.tile.pt.on{border-color:var(--pt);background:var(--pt-bg);box-shadow:inset 0 0 0 1px var(--pt)}
.tile.ok.on{border-color:var(--ok);background:var(--ok-bg);box-shadow:inset 0 0 0 1px var(--ok)}
.tile.eve.on{border-color:var(--eve);background:var(--eve-bg);box-shadow:inset 0 0 0 1px var(--eve)}
.tile.ct.on{border-color:var(--ct);background:var(--ct-bg);box-shadow:inset 0 0 0 1px var(--ct)}
.tile.aqua.on{border-color:var(--aqua);background:var(--aqua-bg);box-shadow:inset 0 0 0 1px var(--aqua)}
.cancu{border:1px solid var(--key);border-left-width:4px;border-radius:6px;padding:9px 12px;background:var(--panel);font-size:13.5px}
.cancu .vb{font-weight:600;color:var(--key);font-size:12.5px;letter-spacing:.01em}
.cancu .nd{margin-top:4px;color:var(--ink);font-style:italic}
.score{--p:0;width:92px;height:92px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:conic-gradient(var(--key) calc(var(--p)*1%),var(--sunk) 0);position:relative;flex:0 0 auto}
.score::before{content:"";position:absolute;inset:8px;border-radius:50%;background:var(--panel)}
.score .sv{position:relative;font-family:var(--f-mono);font-weight:700;font-size:20px;color:var(--ink)}
.score .sl{position:relative;font-size:10.5px;color:var(--faint);text-transform:uppercase;letter-spacing:.06em}
.score.ok{background:conic-gradient(var(--ok) calc(var(--p)*1%),var(--sunk) 0)} .score.eve{background:conic-gradient(var(--eve) calc(var(--p)*1%),var(--sunk) 0)} .score.pt{background:conic-gradient(var(--pt) calc(var(--p)*1%),var(--sunk) 0)}
.timeline{list-style:none;margin:0;padding:0 0 0 18px;border-left:2px solid var(--line);display:flex;flex-direction:column;gap:10px}
.timeline li{position:relative;padding-left:10px;font-size:13.5px}
.timeline li::before{content:"";position:absolute;left:-24px;top:5px;width:10px;height:10px;border-radius:50%;background:var(--key);border:2px solid var(--panel)}
.timeline li.pt::before{background:var(--pt)} .timeline li.eve::before{background:var(--eve)} .timeline li.ok::before{background:var(--ok)} .timeline li.ct::before{background:var(--ct)} .timeline li.aqua::before{background:var(--aqua)}
.timeline .d{font-family:var(--f-mono);font-size:11.5px;color:var(--faint)}
.wizard{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:12.5px;color:var(--faint)}
.wizard .st{padding:4px 9px;border-radius:14px;border:1px solid var(--line);background:var(--sunk)}
.wizard .st.on{border-color:var(--key);color:var(--key);background:var(--key-bg);font-weight:600}
.wizard .st.done{border-color:var(--ok);color:var(--ok);background:var(--ok-bg)}
.quad{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:6px;min-height:280px}
.quad > div{border:1px dashed var(--line);border-radius:6px;padding:8px;background:var(--sunk);min-height:120px}
.quad .qt{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);margin-bottom:6px}
.pill{display:inline-block;padding:3px 9px;border-radius:12px;font-size:12.5px;background:var(--panel);border:1px solid var(--line);margin:2px;cursor:pointer}
.pill.on{border-color:var(--pt);background:var(--pt-bg);color:var(--pt);font-weight:600}
.docform{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
.docform .auto input,.docform .auto select{background:var(--pt-bg);border-style:dashed;border-color:var(--pt)}
.docform .auto .hint{color:var(--pt)}
.heat{display:grid;gap:3px}
.heat .hc{height:30px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-family:var(--f-mono);font-size:12px;color:var(--ink)}
@media (max-width:520px){.quad{grid-template-columns:1fr;grid-template-rows:auto}}
'''
q.write_text(t, encoding="utf-8")
print("style.css:", len(t), "ký tự")

# jscheck: 8 mô-đun
j = ROOT / "_build" / "jscheck.py"
u = j.read_text(encoding="utf-8")
u = u.replace('<section class="mod" id="m0"></section><section class="mod" id="m1"></section><section class="mod" id="m2"></section><section class="mod" id="m3"></section><section class="mod" id="m4"></section><section class="mod" id="m5"></section><section class="mod" id="m6"></section>',
              "".join(f'<section class="mod" id="m{i}"></section>' for i in range(9)))
u = u.replace('<script src="{core}"></script>', '<script src="{core}"></script>\n<script src="{(ROOT / "assets" / "data.js").as_uri()}"></script>')
j.write_text(u, encoding="utf-8")
print("jscheck.py đã cập nhật")
