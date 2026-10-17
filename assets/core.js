/* Phòng mô phỏng Chính phủ số — thư viện lõi
   Cung cấp: LAB.h (tạo phần tử), LAB.ui (điều khiển, bảng, bước, thẻ), LAB.chart (đường, cột, radar, có tooltip),
   LAB.data (truy cập dữ liệu giả lập trong assets/data.js), LAB.csv (xuất CSV), LAB.module (đăng ký mô-đun + tab), điều hướng, giao diện. */
(function () {
"use strict";
const LAB = window.LAB = {};

/* ============================ tạo phần tử ============================ */
function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === "class") e.className = v;
    else if (k === "html") e.innerHTML = v;
    else if (k === "style" && typeof v === "object") { for (const p in v) { if (p.startsWith("--")) e.style.setProperty(p, v[p]); else e.style[p] = v[p]; } }
    else if (k.startsWith("on") && typeof v === "function") e.addEventListener(k.slice(2), v);
    else if (k === "dataset") Object.assign(e.dataset, v);
    else if (k in e && typeof v !== "string" && k !== "value") e[k] = v;
    else e.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    e.appendChild(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return e;
}
LAB.h = h;
const $ = s => document.querySelector(s);
LAB.$ = $;
LAB.clear = el => { while (el.firstChild) el.removeChild(el.firstChild); return el; };
LAB.svg = function (tag, attrs, ...kids) {
  const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
  if (attrs) for (const k in attrs) { if (attrs[k] != null) e.setAttribute(k, attrs[k]); }
  for (const kid of kids.flat(Infinity)) if (kid != null) e.appendChild(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  return e;
};

/* ============================ định dạng ============================ */
LAB.fmt = (v, d = 3) => (typeof v === "bigint") ? v.toString() : (isFinite(v) ? Number(v).toFixed(d) : "—");
LAB.bin = (n, w) => { let s = (typeof n === "bigint" ? n : BigInt(n)).toString(2); while (s.length < w) s = "0" + s; return s; };
LAB.hex = (n, w = 2) => { let s = (typeof n === "bigint" ? n : BigInt(n)).toString(16).toUpperCase(); while (s.length < w) s = "0" + s; return s; };
LAB.grp = (s, n = 4, sep = " ") => s.replace(new RegExp("(.{" + n + "})", "g"), "$1" + sep).trim();
LAB.pct = (v, d = 1) => isFinite(v) ? (100 * v).toFixed(d) + " %" : "—";

/* ============================ tiện ích số liệu hành chính ============================ */
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

/* PRNG có mầm (mulberry32) để kết quả tái lập được khi giảng */
LAB.rng = function (seed) { let a = (seed >>> 0) || 1; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };

/* ============================ màu chủ đề ============================ */
LAB.colors = function () {
  const s = getComputedStyle(document.documentElement); const g = n => s.getPropertyValue(n).trim();
  return { bg: g("--bg"), panel: g("--panel"), sunk: g("--sunk"), line: g("--line"), line2: g("--line2"), grid: g("--grid"), ink: g("--ink"), soft: g("--soft"), faint: g("--faint"), pt: g("--pt"), key: g("--key"), ct: g("--ct"), eve: g("--eve"), ok: g("--ok"), aqua: g("--aqua"), knock: g("--knock") };
};
const themeListeners = [];
LAB.onTheme = fn => themeListeners.push(fn);

/* ============================ giao diện ============================ */
const ui = LAB.ui = {};
/* ô nhập: {id,label,value,type:'text'|'number'|'textarea',mono,min,max,step,hint,onInput} → phần tử .fld có .input */
ui.field = function (o) {
  const inp = o.type === "textarea" ? h("textarea", { id: o.id, rows: o.rows || 3 }) : h("input", { id: o.id, type: o.type || "text", class: o.mono ? "mono" : null, min: o.min, max: o.max, step: o.step, placeholder: o.placeholder });
  inp.value = o.value == null ? "" : o.value;
  if (o.onInput) inp.addEventListener("input", () => o.onInput(inp.value, inp));
  if (o.onChange) inp.addEventListener("change", () => o.onChange(inp.value, inp));
  const f = h("div", { class: "fld" }, h("label", { for: o.id }, h("b", null, o.label), o.unit ? h("span", { class: "small" }, o.unit) : null), inp, o.hint ? h("div", { class: "hint" }, o.hint) : null);
  f.input = inp; return f;
};
/* thanh trượt với số đọc: {id,label,min,max,step,value,fmt,onInput} ; .set(v) để cập nhật */
ui.range = function (o) {
  const inp = h("input", { id: o.id, type: "range", min: o.min, max: o.max, step: o.step == null ? 1 : o.step });
  inp.value = o.value;
  const v = h("span", { class: "v" });
  const fmt = o.fmt || (x => x);
  const upd = () => { v.textContent = fmt(parseFloat(inp.value)); };
  inp.addEventListener("input", () => { upd(); if (o.onInput) o.onInput(parseFloat(inp.value)); });
  upd();
  const f = h("div", { class: "fld" }, h("label", { for: o.id }, h("b", null, o.label), v), inp, o.hint ? h("div", { class: "hint" }, o.hint) : null);
  f.input = inp; f.set = x => { inp.value = x; upd(); }; f.get = () => parseFloat(inp.value);
  return f;
};
ui.select = function (o) {
  const sel = h("select", { id: o.id }, o.options.map(op => { const [val, lab] = Array.isArray(op) ? op : [op, op]; const e = h("option", { value: val }, lab); if (String(val) === String(o.value)) e.selected = true; return e; }));
  if (o.onChange) sel.addEventListener("change", () => o.onChange(sel.value));
  const f = h("div", { class: "fld" }, h("label", { for: o.id }, h("b", null, o.label)), sel, o.hint ? h("div", { class: "hint" }, o.hint) : null);
  f.input = sel; return f;
};
ui.check = function (o) {
  const inp = h("input", { id: o.id, type: "checkbox" }); inp.checked = !!o.value;
  if (o.onChange) inp.addEventListener("change", () => o.onChange(inp.checked));
  const l = h("label", { class: "chk", for: o.id }, inp, o.label); l.input = inp; return l;
};
/* nhóm nút chọn một: {id,options:[[val,label]],value,onChange} */
ui.seg = function (o) {
  let cur = o.value;
  const wrap = h("div", { class: "seg", id: o.id, role: "group" });
  const btns = o.options.map(op => { const [val, lab] = Array.isArray(op) ? op : [op, op]; const b = h("button", { type: "button", class: String(val) === String(cur) ? "on" : null, onclick: () => { cur = val; btns.forEach(x => x.classList.toggle("on", x === b)); if (o.onChange) o.onChange(val); } }, lab); b.dataset.val = val; return b; });
  btns.forEach(b => wrap.appendChild(b));
  wrap.get = () => cur; wrap.set = v => { cur = v; btns.forEach(x => x.classList.toggle("on", String(x.dataset.val) === String(v))); };
  return o.label ? h("div", { class: "fld" }, h("label", null, h("b", null, o.label)), wrap) : wrap;
};
ui.btn = (label, onClick, cls) => h("button", { type: "button", class: "btn" + (cls ? " " + cls : ""), onclick: onClick }, label);
/* bộ ví dụ mẫu: [{label, apply}] */
ui.presets = (items, lbl) => h("div", { class: "presets" }, h("div", { class: "lbl" }, lbl || "Ví dụ trong bài giảng"), h("div", { class: "row" }, items.map(it => ui.btn(it.label, it.apply, "sm"))));
/* các ô số đọc: [{k, v, kind:'pt'|'key'|'ct'|'eve'|'ok'|'aqua', big}] */
ui.readouts = items => h("div", { class: "readouts" }, items.map(it => h("div", { class: "ro" + (it.kind ? " " + it.kind : "") + (it.big ? " big" : "") }, h("div", { class: "k" }, it.k), h("div", { class: "v" }, it.v))));
ui.tag = (t, kind) => h("span", { class: "tag " + (kind || "mut") }, t);
ui.note = (html, kind) => h("div", { class: "note" + (kind ? " " + kind : ""), html });
ui.title = (t, small) => h("div", { class: "ptitle" }, t, small ? h("small", null, small) : null);
/* danh sách bước: [{t: html mô tả, r: html kết quả, hi:boolean}] */
ui.steps = items => h("ol", { class: "steps" }, items.map((it, i) => h("li", { class: it.hi ? "hi" : null }, h("span", { class: "i" }, it.i == null ? (i + 1) : it.i), h("div", null, h("div", { class: "t", html: it.t }), it.r != null ? h("div", { class: "r", html: it.r }) : null))));
/* bảng: headers [string], rows [[cell]] ; cell có thể là chuỗi/số/Node/{html,cls}; opts {mono, cls, rowCls:(row,i)=>cls} */
ui.table = (headers, rows, opts = {}) => {
  const cell = (c, tag) => { if (c && typeof c === "object" && !(c instanceof Node)) return h(tag, { class: c.cls, html: c.html, colspan: c.colspan }, c.text); return h(tag, null, c); };
  const t = h("table", { class: "tb" + (opts.mono ? " mono" : "") + (opts.cls ? " " + opts.cls : "") },
    headers ? h("thead", null, h("tr", null, headers.map(x => cell(x, "th")))) : null,
    h("tbody", null, rows.map((r, i) => h("tr", { class: opts.rowCls ? opts.rowCls(r, i) : null }, r.map(c => cell(c, "td"))))));
  return h("div", { class: "tw" }, t);
};
/* dãy ô bit/ký tự: s chuỗi hoặc mảng; opts {group:n, kind:'pt'|..., kinds:[per-index kind], label, onClick(i), wide, dim:Set} */
ui.bits = (s, opts = {}) => {
  const arr = Array.isArray(s) ? s : String(s).split("");
  const w = h("div", { class: "bits" });
  if (opts.label) w.appendChild(h("span", { class: "lbl" }, opts.label));
  arr.forEach((ch, i) => {
    if (opts.group && i > 0 && i % opts.group === 0) w.appendChild(h("span", { class: "gap" }));
    const kind = opts.kinds ? opts.kinds[i] : opts.kind;
    const b = h("span", { class: "b" + (kind ? " " + kind : "") + (opts.wide ? " w" : "") + (opts.onClick ? " click" : "") + (opts.dim && opts.dim.has(i) ? " dim" : ""), title: opts.titles ? opts.titles[i] : null }, ch);
    if (opts.onClick) b.addEventListener("click", () => opts.onClick(i));
    w.appendChild(b);
  });
  return w;
};
/* ma trận hiển thị: rows [[v]], opts {cls:(i,j)=>'hi'|'pt'..., fmt} */
ui.matrix = (rows, opts = {}) => {
  const cols = rows[0].length;
  const m = h("div", { class: "mat", style: { gridTemplateColumns: "repeat(" + cols + ", auto)" } });
  rows.forEach((r, i) => r.forEach((v, j) => m.appendChild(h("span", { class: "c" + (opts.cls ? " " + (opts.cls(i, j, v) || "") : "") }, opts.fmt ? opts.fmt(v, i, j) : v))));
  return m;
};
/* khung mô phỏng chuẩn: trả về {root, ctrl, view} ; ctrl bên trái, view bên phải */
ui.sim = (opts = {}) => {
  const ctrl = h("div", { class: "ctrl" }), view = h("div", { class: "view" });
  const root = h("div", { class: "sim" + (opts.wide ? " wide" : "") }, opts.wide ? null : ctrl, view);
  return { root, ctrl, view };
};
ui.panel = (title, ...kids) => h("div", { class: "panel stack" }, title ? ui.title(title) : null, ...kids);
/* khu vực được vẽ lại: trả về phần tử và hàm render(fn) thay nội dung */
ui.slot = cls => { const e = h("div", { class: "stack " + (cls || "") }); e.render = (...kids) => { LAB.clear(e); kids.flat(Infinity).forEach(k => k != null && e.appendChild(k instanceof Node ? k : document.createTextNode(k))); return e; }; return e; };

/* thanh mức độ 0–100: ui.bar({label, value, max, kind, text}) */
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

/* ============================ biểu đồ canvas ============================ */
const chart = LAB.chart = {};
function setupCanvas(box, aspect) {
  const cv = box.querySelector("canvas") || box.appendChild(h("canvas"));
  const W = Math.max(280, box.clientWidth || 600), Hh = Math.round(W * (aspect || 0.5));
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = W * dpr; cv.height = Hh * dpr; cv.style.height = Hh + "px";
  const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { cv, ctx, W, H: Hh };
}
function niceTicks(min, max, n = 5, minStep = 0) {
  const span = max - min || 1, raw = Math.max(span / n, minStep || 0), mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const steps = [1, 2, 2.5, 5, 10]; let st = steps[0] * mag;
  for (const s of steps) { st = s * mag; if (span / st <= n && st >= (minStep || 0)) break; }
  if (minStep && st < minStep) st = minStep;
  const out = []; for (let v = Math.ceil(min / st) * st; v <= max + 1e-9; v += st) out.push(+v.toFixed(10)); return out;
}
/* chart.line(box, {series:[{name,color,points:[[x,y]],dash,marker,width}], xlabel,ylabel,xmin,xmax,ymin,ymax,aspect,ylog,fmtX,fmtY,title,vlines:[{x,label,color}], hlines})
   box: phần tử .chartbox ; vẽ lại khi gọi lại; tooltip theo x. */
chart.line = function (box, o) {
  box.classList.add("chartbox");
  if (o.title && !box.querySelector(".ttl")) box.insertBefore(h("div", { class: "ttl" }, o.title), box.firstChild);
  const { cv, ctx, W, H } = setupCanvas(box, o.aspect || 0.5);
  const C = LAB.colors();
  const pad = { l: 54, r: 16, t: 14, b: 40 };
  const all = o.series.flatMap(s => s.points).filter(p => isFinite(p[0]) && isFinite(p[1]));
  const xmin = o.xmin != null ? o.xmin : Math.min(...all.map(p => p[0])), xmax = o.xmax != null ? o.xmax : Math.max(...all.map(p => p[0]));
  let ymin = o.ymin != null ? o.ymin : Math.min(...all.map(p => p[1])), ymax = o.ymax != null ? o.ymax : Math.max(...all.map(p => p[1]));
  if (ymin === ymax) { ymin -= 1; ymax += 1; }
  const ylog = !!o.ylog;
  const ty = v => ylog ? Math.log10(Math.max(v, 1e-300)) : v;
  const Y0 = ty(ymin), Y1 = ty(ymax);
  const X = x => pad.l + (x - xmin) / (xmax - xmin || 1) * (W - pad.l - pad.r);
  const Y = y => H - pad.b - (ty(y) - Y0) / (Y1 - Y0 || 1) * (H - pad.t - pad.b);
  ctx.clearRect(0, 0, W, H);
  ctx.font = "11px " + getComputedStyle(document.body).getPropertyValue("--f-mono");
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.fillStyle = C.faint; ctx.textAlign = "center"; ctx.textBaseline = "top";
  const xt = o.xticks || niceTicks(xmin, xmax, 6);
  xt.forEach(v => { if (v < xmin - 1e-9 || v > xmax + 1e-9) return; ctx.beginPath(); ctx.moveTo(X(v), pad.t); ctx.lineTo(X(v), H - pad.b); ctx.stroke(); ctx.fillText(o.fmtX ? o.fmtX(v) : String(v), X(v), H - pad.b + 5); });
  ctx.textAlign = "right"; ctx.textBaseline = "middle";
  const yt = ylog ? (() => { const out = []; for (let e = Math.ceil(Y0); e <= Math.floor(Y1); e++) out.push(Math.pow(10, e)); return out; })() : niceTicks(ymin, ymax, 5);
  yt.forEach(v => { ctx.beginPath(); ctx.moveTo(pad.l, Y(v)); ctx.lineTo(W - pad.r, Y(v)); ctx.stroke(); ctx.fillText(o.fmtY ? o.fmtY(v) : (ylog ? v.toExponential(0).replace("e-", "e-").replace("e+0", "") : String(+v.toFixed(6))), pad.l - 6, Y(v)); });
  ctx.strokeStyle = C.line; ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, H - pad.b); ctx.lineTo(W - pad.r, H - pad.b); ctx.stroke();
  ctx.fillStyle = C.soft; ctx.font = "12px " + getComputedStyle(document.body).getPropertyValue("--f-body");
  if (o.xlabel) { ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.fillText(o.xlabel, (pad.l + W - pad.r) / 2, H - 4); }
  if (o.ylabel) { ctx.save(); ctx.translate(12, (pad.t + H - pad.b) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(o.ylabel, 0, 0); ctx.restore(); }
  (o.vlines || []).forEach(v => { ctx.save(); ctx.strokeStyle = v.color || C.faint; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X(v.x), pad.t); ctx.lineTo(X(v.x), H - pad.b); ctx.stroke(); ctx.restore(); if (v.label) { ctx.fillStyle = v.color || C.soft; ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillText(v.label, X(v.x) + 4, pad.t + 2); } });
  (o.hlines || []).forEach(v => { ctx.save(); ctx.strokeStyle = v.color || C.faint; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(pad.l, Y(v.y)); ctx.lineTo(W - pad.r, Y(v.y)); ctx.stroke(); ctx.restore(); if (v.label) { ctx.fillStyle = v.color || C.soft; ctx.textAlign = "right"; ctx.textBaseline = "bottom"; ctx.fillText(v.label, W - pad.r - 4, Y(v.y) - 2); } });
  ctx.save(); ctx.beginPath(); ctx.rect(pad.l, pad.t - 2, W - pad.l - pad.r, H - pad.t - pad.b + 4); ctx.clip();
  o.series.forEach(s => {
    const col = C[s.color] || s.color || C.pt;
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = s.width || 2; ctx.setLineDash(s.dash || []);
    if (s.area) { ctx.save(); ctx.globalAlpha = 0.12; ctx.beginPath(); s.points.forEach((p, i) => i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1]))); ctx.lineTo(X(s.points[s.points.length - 1][0]), H - pad.b); ctx.lineTo(X(s.points[0][0]), H - pad.b); ctx.closePath(); ctx.fill(); ctx.restore(); }
    if (!s.markerOnly) { ctx.beginPath(); let pen = false; s.points.forEach(p => { if (!isFinite(p[1]) || (ylog && p[1] <= 0)) { pen = false; return; } if (pen) ctx.lineTo(X(p[0]), Y(p[1])); else { ctx.moveTo(X(p[0]), Y(p[1])); pen = true; } }); ctx.stroke(); }
    if (s.marker || s.markerOnly) { ctx.setLineDash([]); s.points.forEach(p => { if (!isFinite(p[1])) return; ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), s.r || 4, 0, 2 * Math.PI); ctx.fill(); ctx.strokeStyle = C.panel; ctx.lineWidth = 2; ctx.stroke(); ctx.strokeStyle = col; }); }
    ctx.setLineDash([]);
  });
  ctx.restore();
  /* tooltip theo điểm gần nhất */
  let tip = box.querySelector(".tip"); if (!tip) tip = box.appendChild(h("div", { class: "tip" }));
  cv.onmousemove = ev => {
    const r = cv.getBoundingClientRect(); const mx = (ev.clientX - r.left) * (W / r.width), my = (ev.clientY - r.top) * (H / r.height);
    let best = null;
    o.series.forEach(s => s.points.forEach(p => { if (!isFinite(p[1])) return; const d = Math.hypot(X(p[0]) - mx, Y(p[1]) - my); if (!best || d < best.d) best = { d, s, p }; }));
    if (best && best.d < 28) { tip.style.display = "block"; tip.innerHTML = (best.s.name ? "<b>" + best.s.name + "</b><br>" : "") + (o.fmtX ? o.fmtX(best.p[0]) : (+best.p[0].toFixed(4))) + (o.xunit || "") + " → " + (o.fmtTip ? o.fmtTip(best.p[1]) : (o.fmtY ? o.fmtY(best.p[1]) : +best.p[1].toPrecision(4))); tip.style.left = Math.min(X(best.p[0]) + 10, W - 140) + "px"; tip.style.top = (Y(best.p[1]) - 30) + "px"; }
    else tip.style.display = "none";
  };
  cv.onmouseleave = () => { tip.style.display = "none"; };
  if (o.legend !== false && o.series.length > 1) { let lg = box.querySelector(".clegend"); if (!lg) lg = box.appendChild(h("div", { class: "clegend" })); LAB.clear(lg); o.series.forEach(s => lg.appendChild(h("span", { style: { "--c": C[s.color] || s.color } }, s.name))); }
  return { X, Y };
};
/* chart.bars(box, {labels:[], series:[{name,color,values:[]}], ylabel, ymax, aspect, fmtY, hi:index}) */
chart.bars = function (box, o) {
  box.classList.add("chartbox");
  if (o.title && !box.querySelector(".ttl")) box.insertBefore(h("div", { class: "ttl" }, o.title), box.firstChild);
  const { cv, ctx, W, H } = setupCanvas(box, o.aspect || 0.45);
  const C = LAB.colors();
  const pad = { l: 46, r: 10, t: 14, b: 34 };
  const n = o.labels.length, ns = o.series.length;
  const ymax = o.ymax != null ? o.ymax : Math.max(1e-9, ...o.series.flatMap(s => s.values));
  const ymin = o.ymin != null ? o.ymin : 0;
  const Y = y => H - pad.b - (y - ymin) / (ymax - ymin || 1) * (H - pad.t - pad.b);
  const slot = (W - pad.l - pad.r) / n, bw = Math.max(2, (slot * 0.78) / ns - 2);
  ctx.clearRect(0, 0, W, H);
  ctx.font = "11px " + getComputedStyle(document.body).getPropertyValue("--f-mono");
  ctx.strokeStyle = C.grid; ctx.fillStyle = C.faint; ctx.textAlign = "right"; ctx.textBaseline = "middle";
  const allInt = o.intY != null ? o.intY : o.series.every(s => s.values.every(v => Number.isInteger(v)));
  niceTicks(ymin, ymax, 4, allInt ? 1 : 0).forEach(v => { ctx.beginPath(); ctx.moveTo(pad.l, Y(v)); ctx.lineTo(W - pad.r, Y(v)); ctx.stroke(); ctx.fillText(o.fmtY ? o.fmtY(v) : String(+v.toFixed(6)), pad.l - 6, Y(v)); });
  ctx.strokeStyle = C.line; ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, H - pad.b); ctx.lineTo(W - pad.r, H - pad.b); ctx.stroke();
  ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillStyle = C.soft;
  const every = Math.ceil(n / Math.floor((W - pad.l - pad.r) / 26));
  o.labels.forEach((l, i) => { if (i % every === 0) ctx.fillText(String(l), pad.l + slot * (i + 0.5), H - pad.b + 5); });
  const rects = [];
  o.series.forEach((s, si) => {
    s.values.forEach((v, i) => {
      const x = pad.l + slot * i + (slot - (bw + 2) * ns) / 2 + si * (bw + 2), y = Y(v), hgt = (H - pad.b) - y;
      const col = (s.colors && s.colors[i]) ? (C[s.colors[i]] || s.colors[i]) : (C[s.color] || s.color || C.pt);
      ctx.fillStyle = col; ctx.globalAlpha = (o.hi != null && o.hi !== i) ? 0.45 : 1;
      ctx.beginPath(); const rr = Math.min(3, bw / 2); ctx.moveTo(x, H - pad.b); ctx.lineTo(x, y + rr); ctx.quadraticCurveTo(x, y, x + rr, y); ctx.lineTo(x + bw - rr, y); ctx.quadraticCurveTo(x + bw, y, x + bw, y + rr); ctx.lineTo(x + bw, H - pad.b); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1; rects.push({ x, y, w: bw, h: hgt, s, i, v });
    });
  });
  if (o.ylabel) { ctx.save(); ctx.fillStyle = C.soft; ctx.font = "12px " + getComputedStyle(document.body).getPropertyValue("--f-body"); ctx.translate(11, (pad.t + H - pad.b) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(o.ylabel, 0, 0); ctx.restore(); }
  let tip = box.querySelector(".tip"); if (!tip) tip = box.appendChild(h("div", { class: "tip" }));
  cv.onmousemove = ev => {
    const r = cv.getBoundingClientRect(); const mx = (ev.clientX - r.left) * (W / r.width), my = (ev.clientY - r.top) * (H / r.height);
    const hit = rects.find(q => mx >= q.x - 2 && mx <= q.x + q.w + 2 && my >= Math.min(q.y, H - pad.b) - 6);
    if (hit) { tip.style.display = "block"; tip.innerHTML = (ns > 1 ? "<b>" + hit.s.name + "</b> · " : "") + o.labels[hit.i] + " → " + (o.fmtTip ? o.fmtTip(hit.v, hit.i) : +hit.v.toPrecision(4)); tip.style.left = Math.min(hit.x + 8, W - 150) + "px"; tip.style.top = Math.max(0, hit.y - 30) + "px"; if (o.onHover) o.onHover(hit.i); }
    else tip.style.display = "none";
  };
  cv.onmouseleave = () => { tip.style.display = "none"; };
  if (ns > 1 && o.legend !== false) { let lg = box.querySelector(".clegend"); if (!lg) lg = box.appendChild(h("div", { class: "clegend" })); LAB.clear(lg); o.series.forEach(s => lg.appendChild(h("span", { style: { "--c": C[s.color] || s.color } }, s.name))); }
};
/* chart.radar(box, {axes:[tên], series:[{name,color,values:[0..max]}], max, title}) */
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
/* hộp biểu đồ tự vẽ lại khi đổi kích thước/chủ đề: LAB.chart.box(drawFn) → phần tử; drawFn(box) gọi chart.line/bars */
chart.box = function (draw, cls) {
  const box = h("div", { class: "chartbox " + (cls || "") });
  box.draw = () => { if (box.isConnected && box.clientWidth > 0) draw(box); };
  let t; const ro = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(box.draw, 60); }); ro.observe(box);
  LAB.onTheme(box.draw);
  return box;
};

/* ============================ mô-đun và tab ============================ */
const modules = {};
/* LAB.module({id:'m1', tabs:[{id, title, intro, build(pane)}]}) ; build được gọi lười khi mở tab lần đầu */
LAB.module = function (def) {
  modules[def.id] = def;
  const sec = document.getElementById(def.id); if (!sec) return;
  const tabs = h("div", { class: "tabs", role: "tablist" });
  const panes = h("div");
  def.tabs.forEach((t, i) => {
    const pane = h("div", { class: "tabpane", id: "pane-" + def.id + "-" + t.id, role: "tabpanel" });
    if (t.intro) pane.appendChild(h("p", { class: "intro", html: t.intro }));
    panes.appendChild(pane);
    const b = h("button", { type: "button", role: "tab", onclick: () => LAB.openTab(def.id, t.id, true) }, h("span", { class: "tn" }, String(i + 1)), t.title);
    b.dataset.tab = t.id; tabs.appendChild(b);
    t._pane = pane; t._btn = b;
  });
  sec.appendChild(tabs); sec.appendChild(panes);
};
LAB.openTab = function (mid, tid, push) {
  const def = modules[mid]; if (!def) return;
  let t = def.tabs.find(x => x.id === tid) || def.tabs[0];
  def.tabs.forEach(x => { x._pane.classList.toggle("on", x === t); x._btn.classList.toggle("on", x === t); x._btn.setAttribute("aria-selected", x === t); });
  if (!t._built) { t._built = true; try { t.build(t._pane); } catch (e) { t._pane.appendChild(h("div", { class: "err" }, "Lỗi khi dựng mô phỏng: " + e.message)); console.error(e); } }
  t._pane.querySelectorAll(".chartbox").forEach(b => b.draw && b.draw());
  if (push) { try { history.replaceState(null, "", "#" + mid + "-" + t.id); } catch (e) { /* bỏ qua */ } }
  try { localStorage.setItem("cps.tab." + mid, t.id); } catch (e) { /* bỏ qua */ }
};
LAB.openModule = function (mid, tid, push) {
  document.querySelectorAll(".mod").forEach(s => s.classList.toggle("on", s.id === mid));
  document.querySelectorAll(".railbtn").forEach(b => b.classList.toggle("on", b.dataset.mod === mid));
  if (modules[mid]) { let t = tid; if (!t) { try { t = localStorage.getItem("cps.tab." + mid); } catch (e) { /* bỏ qua */ } } LAB.openTab(mid, t, false); }
  if (push) { try { history.replaceState(null, "", "#" + mid + (tid ? "-" + tid : "")); } catch (e) { /* bỏ qua */ } }
  try { localStorage.setItem("cps.mod", mid); } catch (e) { /* bỏ qua */ }
  window.scrollTo({ top: 0 });
};
LAB.route = function () {
  const hsh = (location.hash || "").replace("#", "");
  let mid = "m0", tid = null;
  if (/^m\d/.test(hsh)) { const parts = hsh.split("-"); mid = parts[0]; tid = parts.slice(1).join("-") || null; }
  else { try { mid = localStorage.getItem("cps.mod") || "m0"; } catch (e) { /* bỏ qua */ } }
  if (!document.getElementById(mid)) mid = "m0";
  LAB.openModule(mid, tid, false);
};

/* ============================ khởi động ============================ */
LAB.boot = function (cards) {
  const rail = $("#rail"), grid = $("#cards");
  cards.forEach(c => {
    rail.appendChild(h("button", { type: "button", class: "railbtn", dataset: { mod: c.id }, onclick: () => LAB.openModule(c.id, null, true) }, h("span", { class: "n" }, c.n), h("span", { class: "t" }, c.title, h("span", { class: "l" }, c.lectures))));
    if (grid && c.id !== "m0") grid.appendChild(h("button", { type: "button", class: "card", onclick: () => LAB.openModule(c.id, null, true) }, h("span", { class: "num" }, "BUỔI " + c.n), h("h3", null, c.title), h("p", null, c.blurb), h("div", { class: "les" }, c.chips.map(x => h("span", { class: "chip k" }, x)))));
  });
  /* chủ đề */
  const tb = $("#theme");
  const label = () => { const d = document.documentElement.dataset.theme; tb.textContent = d === "dark" ? "Sáng" : d === "light" ? "Tối" : (matchMedia("(prefers-color-scheme: dark)").matches ? "Sáng" : "Tối"); };
  try { const sv = localStorage.getItem("cps.theme"); if (sv) document.documentElement.dataset.theme = sv; } catch (e) { /* bỏ qua */ }
  tb.addEventListener("click", () => {
    const isDark = document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = isDark ? "light" : "dark";
    try { localStorage.setItem("cps.theme", document.documentElement.dataset.theme); } catch (e) { /* bỏ qua */ }
    label(); themeListeners.forEach(f => { try { f(); } catch (e) { /* bỏ qua */ } });
  });
  label();
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { label(); themeListeners.forEach(f => { try { f(); } catch (e) { /* bỏ qua */ } }); });
  window.addEventListener("hashchange", LAB.route);
  LAB.route();
  /* tự kiểm tra (dùng khi build): mở #selftest để dựng mọi tab và ghi lỗi vào <pre id="selftest"> */
  if (location.hash === "#selftest") {
    const out = [];
    Object.values(modules).forEach(def => def.tabs.forEach(t => {
      document.querySelectorAll(".mod").forEach(s => s.classList.toggle("on", s.id === def.id));
      def.tabs.forEach(x => x._pane.classList.toggle("on", x === t));
      try { if (!t._built) { t._built = true; t.build(t._pane); } t._pane.querySelectorAll(".chartbox").forEach(b => b.draw && b.draw()); const errs = t._pane.querySelectorAll(".err").length;
        /* phần tử tràn ngang (kiểm tra bố cục ở màn hình hẹp) */
        const W = document.documentElement.clientWidth; const over = [];
        t._pane.querySelectorAll("*").forEach(el => { const r = el.getBoundingClientRect(); if (r.width > 0 && r.right > W + 1 && !el.closest(".tw, .chartbox")) over.push(Math.round(r.right - W) + "px " + el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.split(" ").join(".") : "")); });
        out.push("OK   " + def.id + "-" + t.id + (errs ? "  (có " + errs + " .err)" : "") + (over.length ? "  TRÀN(" + W + "px): " + over.slice(0, 4).join(" | ") : "")); }
      catch (e) { out.push("FAIL " + def.id + "-" + t.id + ": " + (e && e.stack || e)); }
    }));
    out.push("scrollWidth=" + document.documentElement.scrollWidth + " clientWidth=" + document.documentElement.clientWidth);
    document.body.appendChild(h("pre", { id: "selftest" }, out.join("\n")));
  }
};
})();
