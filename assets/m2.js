/* Buổi 2 — Khung chính sách và pháp luật về Chính phủ số (Bài 2)
   Năm tab: bốn tầng văn bản · dòng thời gian 2015–2026 · tra cứu hiệu lực và lỗi viện dẫn ·
   bản đồ căn cứ pháp lý · chỉ tiêu đến 2030. Dữ liệu: LAB.data.van_ban (40 văn bản thật),
   LAB.data.kpi / ho_so / thu_tuc / he_thong / egdi của Phường Mẫu (giả lập, trừ egdi).
   Mọi văn bản, điều khoản, con số lấy từ _build/CANCU.md. */
(function () { "use strict";
const { h, ui, chart } = LAB;

/* ============================ dùng chung cho cả mô-đun ============================ */
/* Bốn tầng theo slide; tầng 3 gộp hai nhóm "Chiến lược/chương trình" và "Nghị định/thông tư" của dữ liệu */
const TANG = [
  { n: 1, ten: "Chủ trương của Đảng", data: ["Chủ trương"], coquan: "Bộ Chính trị, Ban Chấp hành Trung ương", loai: "Nghị quyết, chỉ thị, kết luận", giatri: "Định hướng chính trị; không phải văn bản quy phạm pháp luật", kind: "ct", nham: [0] },
  { n: 2, ten: "Luật của Quốc hội", data: ["Luật"], coquan: "Quốc hội", loai: "Luật, nghị quyết", giatri: "Bắt buộc chung với mọi chủ thể; cao nhất sau Hiến pháp", kind: "key", nham: [0] },
  { n: 3, ten: "Chính phủ, Thủ tướng Chính phủ", data: ["Chiến lược/chương trình", "Nghị định/thông tư"], coquan: "Chính phủ, Thủ tướng Chính phủ", loai: "Nghị định, nghị quyết, quyết định", giatri: "Quy định chi tiết thi hành luật; chiến lược, chương trình; giao nhiệm vụ cụ thể", kind: "aqua", nham: [1, 2] },
  { n: 4, ten: "Bộ và cơ quan ngang bộ", data: ["Văn bản của Bộ"], coquan: "Bộ Khoa học và Công nghệ và các bộ", loai: "Thông tư, quyết định", giatri: "Hướng dẫn chuyên môn, tiêu chuẩn, khung kiến trúc", kind: "pt", nham: [2] },
];
const NHAM_LAN = [
  { t: "Coi nghị quyết của Đảng là văn bản quy phạm pháp luật", r: "Nghĩa vụ của người dân chỉ phát sinh từ luật và nghị định." },
  { t: "Coi nghị quyết của Chính phủ ngang với nghị định", r: "Nghị quyết giao nhiệm vụ; nghị định đặt quy tắc bắt buộc." },
  { t: "Coi quyết định của Thủ tướng và của bộ trưởng cùng một cấp", r: "Quyết định của bộ trưởng không được trái quyết định của Thủ tướng." },
];
const LANE = ["Chủ trương", "Luật", "Chiến lược/chương trình", "Nghị định/thông tư", "Văn bản của Bộ"];
const VB = LAB.data.van_ban || [];
const tangCua = vb => TANG.find(t => t.data.includes(vb.tang)) || TANG[2];
const parseNgay = s => (s ? LAB.date.parse(s) : null);
const fmtNgay = s => (!s ? "—" : /\//.test(s) ? s : String(s));
const sachKyHieu = s => String(s || "").replace(/\(.*?\)/g, "").trim();
const timVB = kh => { const k = sachKyHieu(kh); return k ? VB.find(v => v.ky_hieu === k) : null; };
const KHOA_LOC = LAB.khongDau;
/* Trạng thái hiệu lực của một văn bản tại một ngày (mặc định: hôm nay).
   Trả về {code:'chua'|'con'|'het'|'ketthuc', text, kind, thay} */
function trangThai(vb, ngay) {
  const d = ngay || new Date();
  const batDau = parseNgay(vb.hieu_luc_tu) || parseNgay(vb.ngay_ban_hanh);
  const tt = vb.tinh_trang || "";
  const thay = timVB(vb.van_ban_thay_the_sua_doi);
  const m = /(\d{2})\/(\d{2})\/(\d{4})/.exec(tt);
  let het = m ? new Date(+m[3], +m[2] - 1, +m[1]) : null;
  if (!het && /Được thay thế/.test(tt) && thay) het = parseNgay(thay.ngay_ban_hanh);
  if (batDau && d < batDau) return { code: "chua", text: "Chưa có hiệu lực (từ " + fmtNgay(vb.hieu_luc_tu) + ")", kind: "key", thay };
  if (het && d >= het) {
    const tu = /Bị bãi bỏ/.test(tt) ? "Bị bãi bỏ từ " : /Được thay thế/.test(tt) ? "Được thay thế từ " : "Hết hiệu lực từ ";
    return { code: "het", text: tu + LAB.date.vn(het), kind: "eve", thay };
  }
  if (/Kết thúc giai đoạn|Đã hoàn thành giai đoạn/.test(tt)) {
    const nam = /(\d{4})\s*$/.exec(tt); const cuoi = nam ? new Date(+nam[1], 11, 31) : null;
    if (!cuoi || d > cuoi) return { code: "ketthuc", text: "Giai đoạn đã kết thúc", kind: "mut", thay };
  }
  let text = "Còn hiệu lực";
  if (/sửa đổi/.test(vb.van_ban_thay_the_sua_doi || "") && thay) { const hl = parseNgay(thay.hieu_luc_tu); if (hl && d >= hl) text += " (đã sửa đổi bởi " + thay.ky_hieu + ")"; }
  return { code: "con", text, kind: "ok", thay };
}
const tagTT = st => ui.tag(st.code === "het" ? "Hết hiệu lực" : st.code === "chua" ? "Chưa có hiệu lực" : st.code === "ketthuc" ? "Hết giai đoạn" : "Còn hiệu lực", st.kind === "mut" ? "mut" : st.kind);
/* Thẻ chi tiết một văn bản (dùng ở tab 2 và 3) */
function theVanBan(vb, ngay) {
  const st = trangThai(vb, ngay); const t = tangCua(vb);
  const kv = h("dl", { class: "kv" });
  const add = (k, v) => { if (v == null || v === "") return; kv.append(h("dt", null, k), h("dd", null, v)); };
  add("Tên", vb.ten_ngan); add("Tầng", "Tầng " + t.n + " · " + t.ten + " (" + vb.tang + ")"); add("Cơ quan ban hành", vb.co_quan_ban_hanh);
  add("Ngày ban hành", fmtNgay(vb.ngay_ban_hanh)); add("Hiệu lực từ", fmtNgay(vb.hieu_luc_tu)); add("Tình trạng", h("span", null, st.text, " ", tagTT(st)));
  if (vb.van_ban_thay_the_sua_doi) add(/sửa đổi/.test(vb.van_ban_thay_the_sua_doi) ? "Sửa đổi bởi" : "Thay thế bởi", st.thay ? st.thay.ky_hieu + " — " + st.thay.ten_ngan + " (" + fmtNgay(st.thay.ngay_ban_hanh) + ")" : vb.van_ban_thay_the_sua_doi);
  add("Ghi chú", vb.ghi_chu);
  const card = h("div", { class: "panel stack" }, h("div", { class: "row", style: { alignItems: "center", gap: "8px" } }, h("b", null, vb.ky_hieu), ui.tag("Tầng " + t.n, t.kind), tagTT(st)), kv);
  if (st.code === "het") card.appendChild(ui.note("<b>Không được viện dẫn như quy định đang áp dụng.</b> " + st.text + (st.thay ? ". Dẫn thay bằng <b>" + st.thay.ky_hieu + "</b> (" + st.thay.ten_ngan + ")." : "."), "eve"));
  if (st.code === "chua") card.appendChild(ui.note("Văn bản đã ban hành nhưng chưa tới ngày thi hành; chỉ dẫn với tư cách văn bản sắp có hiệu lực.", "key"));
  if (st.code === "ketthuc") card.appendChild(ui.note("Văn bản của giai đoạn trước: chỉ dẫn khi nói về nền móng, lịch sử. Chỉ tiêu giai đoạn 2026–2030 lấy từ QĐ 1266/QĐ-TTg.", "mut"));
  if (/Bộ Thông tin và Truyền thông/.test(vb.co_quan_ban_hanh)) card.appendChild(ui.note("Cơ quan ban hành nay là <b>Bộ Khoa học và Công nghệ</b> (trước 01/3/2025 là Bộ Thông tin và Truyền thông) — NĐ 55/2025/NĐ-CP.", "key"));
  return card;
}
const segSet = (el, v) => { const w = el.classList && el.classList.contains("seg") ? el : el.querySelector(".seg"); if (w && w.set) w.set(v); };
const quyTiep = (q, n) => { const m = /^(\d{4})-Q(\d)$/.exec(q); if (!m) return "—"; let y = +m[1], k = +m[2] - 1 + n; y += Math.floor(k / 4); k = k % 4; return y + "-Q" + (k + 1); };

LAB.module({
  id: "m2",
  tabs: [
    /* ======================================================= TAB 1 ======================================================= */
    { id: "bontang", title: "Bốn tầng văn bản",
      intro: "Bốn tầng văn bản điều chỉnh Chính phủ số (slide Bài 2): bấm một tầng trên sơ đồ để xem ai ban hành, giá trị pháp lý và danh mục văn bản thật của tầng đó trong 40 văn bản đã kiểm chứng.",
      build(pane) {
        /* Sơ đồ kim tự tháp 4 tầng vẽ bằng SVG; danh mục tính từ LAB.data.van_ban */
        const S = { tang: 2, loc: "all" };
        const { root, ctrl, view } = ui.sim();
        const segTang = ui.seg({ id: "m2bt-tang", label: "Tầng văn bản", options: TANG.map(t => [String(t.n), "Tầng " + t.n]), value: "2", onChange: v => { S.tang = +v; draw(); } });
        const segLoc = ui.seg({ id: "m2bt-loc", label: "Lọc theo hiệu lực (tại hôm nay)", options: [["all", "Tất cả"], ["con", "Còn hiệu lực"], ["het", "Hết hiệu lực"]], value: "all", onChange: v => { S.loc = v; draw(); } });
        ctrl.append(segTang, segLoc,
          ui.presets([{ label: "Tầng luật", apply: () => { S.tang = 2; S.loc = "all"; segSet(segTang, "2"); segSet(segLoc, "all"); draw(); } },
            { label: "Nghị định hết hiệu lực", apply: () => { S.tang = 3; S.loc = "het"; segSet(segTang, "3"); segSet(segLoc, "het"); draw(); } },
            { label: "Làm lại", apply: () => { S.tang = 2; S.loc = "all"; segSet(segTang, "2"); segSet(segLoc, "all"); draw(); } }]),
          ui.cancu("Luật Ban hành văn bản quy phạm pháp luật — nguyên tắc thứ bậc (slide Bài 2)", "Tầng trên định hướng cho tầng dưới; tầng dưới không được trái tầng trên. Chỉ tầng 2 và tầng 3 đặt nghĩa vụ trực tiếp cho người dân."),
          ui.cancu("Nghị định 55/2025/NĐ-CP ngày 02/3/2025 của Chính phủ", "Từ 01/3/2025 hợp nhất Bộ Thông tin và Truyền thông với Bộ Khoa học và Công nghệ thành <b>Bộ Khoa học và Công nghệ</b>; văn bản tầng 4 về lĩnh vực này nay do Bộ KH&amp;CN thực hiện."));
        const svgSlot = ui.slot(), info = ui.slot(), bang = ui.slot(), nham = ui.slot();
        view.append(svgSlot, info, bang, nham);
        function veKimTuThap(counts) {
          const W = 640, top = 8, hh = 66, gap = 6;
          const half = [[80, 150], [150, 220], [220, 290], [290, 316]];
          const svg = LAB.svg("svg", { class: "diag", viewBox: "0 0 " + W + " " + (top + 4 * (hh + gap)), role: "img", "aria-label": "Sơ đồ bốn tầng văn bản" });
          TANG.forEach((t, i) => {
            const y0 = top + i * (hh + gap), y1 = y0 + hh, [a, b] = half[i], cx = W / 2;
            const on = S.tang === t.n;
            const g = LAB.svg("g", { style: "cursor:pointer" });
            g.appendChild(LAB.svg("polygon", { points: [cx - a, y0, cx + a, y0, cx + b, y1, cx - b, y1].join(" "), fill: on ? "var(--" + t.kind + "-bg)" : "var(--sunk)", stroke: on ? "var(--" + t.kind + ")" : "var(--line)", "stroke-width": on ? 3 : 1.2, rx: 4 }));
            g.appendChild(LAB.svg("text", { x: cx, y: y0 + 26, "text-anchor": "middle", style: "font-weight:600;font-size:14px" }, "Tầng " + t.n + " · " + t.ten));
            g.appendChild(LAB.svg("text", { x: cx, y: y0 + 46, "text-anchor": "middle", class: "lbl" }, t.loai + " · " + counts[i] + " văn bản"));
            g.appendChild(LAB.svg("title", null, t.giatri));
            g.addEventListener("click", () => { S.tang = t.n; segSet(segTang, String(t.n)); draw(); });
            svg.appendChild(g);
          });
          return svg;
        }
        function draw() {
          const now = new Date();
          const counts = TANG.map(t => VB.filter(v => tangCua(v) === t).length);
          svgSlot.render(veKimTuThap(counts), h("div", { class: "small", style: { color: "var(--faint)" } }, "Đọc từ trên xuống: chủ trương chính trị dần được cụ thể hoá thành việc làm. Bấm vào một tầng để xem danh mục."));
          const t = TANG[S.tang - 1];
          let rows = VB.filter(v => tangCua(v) === t);
          const stMap = new Map(rows.map(v => [v.ky_hieu, trangThai(v, now)]));
          const nCon = rows.filter(v => stMap.get(v.ky_hieu).code === "con").length, nHet = rows.filter(v => stMap.get(v.ky_hieu).code === "het").length, nKT = rows.filter(v => stMap.get(v.ky_hieu).code === "ketthuc").length;
          if (S.loc === "con") rows = rows.filter(v => stMap.get(v.ky_hieu).code === "con");
          if (S.loc === "het") rows = rows.filter(v => stMap.get(v.ky_hieu).code === "het");
          rows.sort((a, b) => (parseNgay(a.ngay_ban_hanh) || 0) - (parseNgay(b.ngay_ban_hanh) || 0));
          info.render(ui.title("Tầng " + t.n + " — " + t.ten),
            h("dl", { class: "kv" }, h("dt", null, "Cơ quan ban hành"), h("dd", null, t.coquan), h("dt", null, "Loại văn bản"), h("dd", null, t.loai), h("dt", null, "Giá trị pháp lý"), h("dd", null, t.giatri)),
            ui.readouts([{ k: "Văn bản trong tầng", v: LAB.num(rows.length) + (S.loc !== "all" ? " / " + stMap.size : ""), kind: t.kind, big: true }, { k: "Còn hiệu lực", v: LAB.num(nCon), kind: "ok" }, { k: "Hết hiệu lực / bị thay thế", v: LAB.num(nHet), kind: "eve" }, { k: "Giai đoạn đã kết thúc", v: LAB.num(nKT), kind: "key" }]),
            t.n === 4 ? ui.note("Trước 01/3/2025 phần lớn văn bản tầng 4 do Bộ Thông tin và Truyền thông ban hành; nay do <b>Bộ Khoa học và Công nghệ</b> thực hiện. Khi viện dẫn, viết tên bộ mới và chú thích tên cũ.", "key") : null,
            t.n === 1 ? ui.note("Nghị quyết của Đảng là <b>định hướng chính trị</b>, không phải văn bản quy phạm pháp luật. Dẫn NQ 52-NQ/TW khi nói về nền móng; dẫn <b>NQ 57-NQ/TW</b> khi nói về giai đoạn hiện nay.", "key") : null);
          const tb = rows.length ? ui.table(["Ký hiệu", "Tên", "Cơ quan ban hành", "Ngày BH", "Hiệu lực từ", "Tình trạng (hôm nay)", "Thay thế / sửa đổi bởi", "Ghi chú"],
            rows.map(v => { const st = stMap.get(v.ky_hieu); return [h("b", null, v.ky_hieu), v.ten_ngan, v.co_quan_ban_hanh, fmtNgay(v.ngay_ban_hanh), fmtNgay(v.hieu_luc_tu), h("span", null, tagTT(st), " ", h("span", { class: "small" }, st.text)), v.van_ban_thay_the_sua_doi || "—", v.ghi_chu || ""]; }),
            { cls: "wrap", rowCls: r => (r[5].querySelector(".tag.eve") ? "bad" : null) }) : ui.note("Không có văn bản nào của tầng này khớp bộ lọc.", "mut");
          bang.render(ui.title("Danh mục văn bản tầng " + t.n, rows.length + " văn bản"), tb);
          nham.render(ui.title("Ba nhầm lẫn thường gặp về giá trị pháp lý", "tô đậm: liên quan trực tiếp tới tầng đang xem"),
            ui.steps(NHAM_LAN.map((x, i) => ({ t: "<b>Nhầm lẫn " + (i + 1) + ":</b> " + x.t, r: x.r, hi: t.nham.includes(i) }))));
        }
        draw(); pane.appendChild(root);
      } },

    /* ======================================================= TAB 2 ======================================================= */
    { id: "dongthoigian", title: "Dòng thời gian 2015–2026",
      intro: "Bốn mươi văn bản xếp theo ngày ban hành trên trục 2015–2026, tô màu theo tình trạng hiệu lực; bốn mốc tổ chức bộ máy (CANCU mục E) đánh dấu bằng vạch đứng. Di chuột để xem nhanh, bấm vào một điểm để xem chi tiết.",
      build(pane) {
        /* Trục thời gian SVG: 5 làn (tầng 3 tách hai làn), điểm = văn bản, màu = tình trạng tại ngày xem */
        const S = { tang: new Set([1, 2, 3, 4]), moc: true, nhan: false, chon: null, ngay: LAB.date.iso(new Date()) };
        const MOC = [
          { d: "2025-03-01", t: "Hợp nhất Bộ TT&TT vào Bộ Khoa học và Công nghệ (NĐ 55/2025/NĐ-CP)" },
          { d: "2025-07-01", t: "Chính quyền địa phương 2 cấp; không duy trì Cổng Dịch vụ công cấp tỉnh (NĐ 118/2025/NĐ-CP)" },
          { d: "2026-03-01", t: "Không duy trì Cổng Dịch vụ công cấp bộ; Cổng DVC quốc gia là điểm một cửa số duy nhất" },
          { d: "2026-07-01", t: "Luật An ninh mạng 116/2025/QH15 có hiệu lực; Luật 86/2015 và Luật 24/2018 hết hiệu lực" },
        ];
        const { root, ctrl, view } = ui.sim();
        const tiles = ui.tiles({ items: TANG.map(t => ({ id: String(t.n), title: "Tầng " + t.n, sub: t.ten, kind: t.kind })), value: ["1", "2", "3", "4"], multi: true, cls: "narrow", onChange: v => { S.tang = new Set(v.map(Number)); draw(); } });
        const fNgay = ui.field({ id: "m2dt-ngay", label: "Xem tình trạng tại ngày", type: "date", value: S.ngay, hint: "Đổi ngày để thấy văn bản còn/chưa/hết hiệu lực tại thời điểm đó.", onChange: v => { S.ngay = v; draw(); } });
        ctrl.append(h("div", { class: "fld" }, h("label", null, h("b", null, "Lọc theo tầng")), tiles), fNgay,
          ui.check({ id: "m2dt-moc", label: "Hiện mốc tổ chức bộ máy", value: true, onChange: v => { S.moc = v; draw(); } }),
          ui.check({ id: "m2dt-nhan", label: "Hiện ký hiệu trên trục", value: false, onChange: v => { S.nhan = v; draw(); } }),
          ui.presets([{ label: "Bảy mốc chính sách lớn", apply: () => { S.tang = new Set([1, 3]); tiles.set(["1", "3"]); S.ngay = LAB.date.iso(new Date()); fNgay.input.value = S.ngay; draw(); } },
            { label: "Nhìn từ 01/5/2025", apply: () => { S.ngay = "2025-05-01"; fNgay.input.value = S.ngay; draw(); } },
            { label: "Làm lại", apply: () => { S.tang = new Set([1, 2, 3, 4]); tiles.set(["1", "2", "3", "4"]); S.ngay = LAB.date.iso(new Date()); fNgay.input.value = S.ngay; S.chon = null; draw(); } }]),
          h("div", { class: "row small" }, ui.tag("Còn hiệu lực", "ok"), ui.tag("Chưa có hiệu lực", "key"), ui.tag("Hết hiệu lực", "eve"), ui.tag("Hết giai đoạn", "mut")),
          ui.cancu("Nghị định 118/2025/NĐ-CP ngày 09/6/2025 của Chính phủ", "Từ 01/7/2025 không duy trì Cổng Dịch vụ công cấp tỉnh; từ 01/3/2026 không duy trì Cổng Dịch vụ công cấp bộ. Cổng Dịch vụ công quốc gia là điểm một cửa số tập trung, duy nhất."));
        const svgSlot = ui.slot(), chiTiet = ui.slot(), danhSach = ui.slot();
        view.append(svgSlot, chiTiet, danhSach);
        const T0 = new Date(2015, 0, 1).getTime(), T1 = new Date(2027, 0, 1).getTime();
        function draw() {
          const ngay = parseNgay(S.ngay) || new Date();
          const lanes = LANE.map((l, i) => ({ ten: l, tang: i < 2 ? i + 1 : i < 4 ? 3 : 4 })).filter(l => S.tang.has(l.tang));
          const rows = VB.filter(v => S.tang.has(tangCua(v).n) && parseNgay(v.ngay_ban_hanh)).sort((a, b) => parseNgay(a.ngay_ban_hanh) - parseNgay(b.ngay_ban_hanh));
          const W = 960, L = 128, R = 12, topPad = S.moc ? 34 : 14, LH = 64, axisH = 28;
          const H = topPad + lanes.length * LH + axisH;
          const X = t => L + (t - T0) / (T1 - T0) * (W - L - R);
          const svg = LAB.svg("svg", { class: "diag", viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Dòng thời gian văn bản" });
          for (let y = 2015; y <= 2027; y++) { const x = X(new Date(y, 0, 1).getTime()); svg.appendChild(LAB.svg("line", { x1: x, y1: topPad, x2: x, y2: H - axisH, stroke: "var(--grid)" })); if (y < 2027) svg.appendChild(LAB.svg("text", { x: X(new Date(y, 6, 1).getTime()), y: H - 10, "text-anchor": "middle", class: "lbl" }, String(y))); }
          lanes.forEach((l, i) => {
            const y0 = topPad + i * LH; const t = TANG[l.tang - 1];
            svg.appendChild(LAB.svg("rect", { x: L, y: y0, width: W - L - R, height: LH, fill: i % 2 ? "var(--sunk)" : "none", opacity: 0.6 }));
            svg.appendChild(LAB.svg("line", { x1: L, y1: y0 + LH, x2: W - R, y2: y0 + LH, stroke: "var(--line)" }));
            svg.appendChild(LAB.svg("text", { x: 6, y: y0 + 26, style: "font-weight:600;font-size:12px;fill:var(--" + t.kind + ")" }, "Tầng " + l.tang + (l.tang === 3 ? (l.ten === "Luật" ? "" : l.ten.startsWith("Chiến") ? "a" : "b") : "")));
            svg.appendChild(LAB.svg("text", { x: 6, y: y0 + 42, class: "lbl", style: "font-size:11px" }, l.ten.length > 18 ? l.ten.slice(0, 18) + "…" : l.ten));
          });
          if (S.moc) MOC.forEach((m, i) => { const x = X(parseNgay(m.d).getTime()); svg.appendChild(LAB.svg("line", { x1: x, y1: 22, x2: x, y2: H - axisH, stroke: "var(--aqua)", "stroke-dasharray": "4 4", "stroke-width": 1.5 })); svg.appendChild(LAB.svg("circle", { cx: x, cy: 14, r: 9, fill: "var(--aqua)" })); svg.appendChild(LAB.svg("text", { x, y: 18, "text-anchor": "middle", style: "font-size:11px;font-weight:700;fill:var(--knock)" }, String(i + 1))); svg.appendChild(LAB.svg("title", null, LAB.date.vn(m.d) + " — " + m.t)); });
          const placed = new Map();
          rows.forEach(v => {
            const li = lanes.findIndex(l => l.ten === v.tang); if (li < 0) return;
            const x = X(parseNgay(v.ngay_ban_hanh).getTime());
            const arr = placed.get(li) || []; const lvl = arr.filter(px => Math.abs(px - x) < 16).length; arr.push(x); placed.set(li, arr);
            const cy = topPad + li * LH + LH - 16 - lvl * 13, st = trangThai(v, ngay);
            const col = st.kind === "mut" ? "var(--faint)" : "var(--" + st.kind + ")";
            const on = S.chon === v.ky_hieu;
            const g = LAB.svg("g", { style: "cursor:pointer" });
            g.appendChild(LAB.svg("circle", { cx: x, cy, r: on ? 8 : 6, fill: col, stroke: on ? "var(--ink)" : "var(--panel)", "stroke-width": 2 }));
            if (S.nhan || on) g.appendChild(LAB.svg("text", { x: x + 8, y: cy - 6, style: "font-size:9.5px;fill:var(--soft)" }, v.ky_hieu.replace(/\/NĐ-CP|\/QĐ-TTg|\/NQ-CP|\/QH\d+/, "")));
            g.appendChild(LAB.svg("title", null, v.ky_hieu + " — " + v.ten_ngan + "\nBan hành " + fmtNgay(v.ngay_ban_hanh) + " · " + v.co_quan_ban_hanh + "\n" + st.text));
            g.addEventListener("click", () => { S.chon = v.ky_hieu; draw(); });
            svg.appendChild(g);
          });
          svgSlot.render(svg, S.moc ? h("ol", { class: "small", style: { margin: "0", paddingLeft: "18px", color: "var(--soft)" } }, MOC.map(m => h("li", null, h("b", null, LAB.date.vn(m.d)), " — ", m.t))) : null,
            ui.readouts([{ k: "Văn bản đang hiện", v: LAB.num(rows.length), kind: "pt" }, { k: "Còn hiệu lực tại " + LAB.date.vn(ngay), v: LAB.num(rows.filter(v => trangThai(v, ngay).code === "con").length), kind: "ok" }, { k: "Hết hiệu lực / thay thế", v: LAB.num(rows.filter(v => trangThai(v, ngay).code === "het").length), kind: "eve" }, { k: "Chưa có hiệu lực", v: LAB.num(rows.filter(v => trangThai(v, ngay).code === "chua").length), kind: "key" }]));
          const vb = S.chon ? VB.find(v => v.ky_hieu === S.chon) : null;
          chiTiet.render(vb ? theVanBan(vb, ngay) : ui.note("Bấm vào một điểm trên trục để xem chi tiết văn bản.", "mut"));
          danhSach.render(ui.title("Theo thứ tự ban hành", rows.length + " văn bản"),
            h("ul", { class: "timeline" }, rows.map(v => { const st = trangThai(v, ngay); return h("li", { class: st.kind === "mut" ? "" : st.kind, style: { cursor: "pointer" }, onclick: () => { S.chon = v.ky_hieu; draw(); } }, h("span", { class: "d" }, fmtNgay(v.ngay_ban_hanh)), " ", h("b", null, v.ky_hieu), " — ", v.ten_ngan, " ", tagTT(st)); })));
        }
        draw(); pane.appendChild(root);
      } },

    /* ======================================================= TAB 3 ======================================================= */
    { id: "tracuu", title: "Tra cứu hiệu lực và lỗi viện dẫn",
      intro: "Tra cứu nhanh 40 văn bản theo ký hiệu hoặc tên (không cần gõ dấu), xem tình trạng tại một ngày bất kỳ; sau đó làm bài \"Câu viện dẫn này đúng hay sai?\" theo bốn lỗi viện dẫn thường gặp của slide Bài 2.",
      build(pane) {
        /* Ô tìm kiếm không dấu + thẻ kết quả; bài tập 10 câu đúng/sai có chấm điểm, lưu và tải CSV */
        const S = { q: "", ngay: LAB.date.iso(new Date()), tl: {}, cham: false, ten: "" };
        const CAU = [
          { c: "\"Theo Nghị định 47/2020/NĐ-CP hiện hành về quản lý, kết nối và chia sẻ dữ liệu số, Phường Mẫu đề nghị tỉnh chia sẻ dữ liệu…\"", dung: false, loi: "Lỗi 1 — dẫn văn bản đã hết hiệu lực", gt: "NĐ 47/2020/NĐ-CP hết hiệu lực từ 22/10/2025 (Điều 23 NĐ 278/2025/NĐ-CP). Dẫn Nghị định 278/2025/NĐ-CP ngày 22/10/2025 của Chính phủ." },
          { c: "\"Bộ Thông tin và Truyền thông ban hành Khung Kiến trúc Chính phủ số Việt Nam phiên bản 4.0.\"", dung: false, loi: "Lỗi 3 — gọi tên cơ quan không còn đúng", gt: "Khung 4.0 ban hành theo Quyết định 292/QĐ-BKHCN ngày 25/3/2025 của Bộ Khoa học và Công nghệ (trước 01/3/2025 là Bộ Thông tin và Truyền thông), thay QĐ 2568/QĐ-BTTTT về Khung 3.0." },
          { c: "\"Luật Dữ liệu số 60/2024/QH15 được Quốc hội thông qua ngày 30/11/2024, có hiệu lực từ ngày 01/7/2025.\"", dung: true, loi: "Viết đúng — phân biệt ngày thông qua và ngày hiệu lực", gt: "Đúng cả hai mốc. Ngày thông qua và ngày hiệu lực là hai mốc khác nhau, phải phân biệt khi viện dẫn." },
          { c: "\"Kế hoạch tháng 10/2026 của Phường Mẫu: bảo đảm an toàn hệ thống theo Luật An toàn thông tin mạng số 86/2015/QH13 đang có hiệu lực.\"", dung: false, loi: "Lỗi 1 — dẫn văn bản đã hết hiệu lực", gt: "Luật 86/2015/QH13 và Luật An ninh mạng 24/2018/QH14 đều hết hiệu lực từ 01/7/2026 (khoản 2 Điều 44 Luật 116/2025/QH15). Phần đang áp dụng dẫn Luật An ninh mạng số 116/2025/QH15." },
          { c: "\"Căn cứ Nghị định 1266/QĐ-TTg của Chính phủ ban hành Chiến lược quốc gia về chuyển đổi số giai đoạn 2026–2030.\"", dung: false, loi: "Lỗi 2 — dẫn sai loại văn bản và cơ quan ban hành", gt: "Đúng là Quyết định số 1266/QĐ-TTg ngày 14/7/2026 của Thủ tướng Chính phủ. Nghị định do Chính phủ ban hành; quyết định 749, 942, 06, 1266 do Thủ tướng Chính phủ ban hành." },
          { c: "\"Căn cứ Nghị quyết số 57-NQ/TW ngày 22/12/2024 của Bộ Chính trị về đột phá phát triển khoa học, công nghệ, đổi mới sáng tạo và chuyển đổi số quốc gia.\"", dung: true, loi: "Viết đúng — đủ bốn thành phần: loại, số hiệu, ngày, cơ quan", gt: "Đây là căn cứ chính trị cao nhất hiện nay; mọi kế hoạch chuyển đổi số giai đoạn 2026–2030 đều mở đầu bằng văn bản này." },
          { c: "\"Năm 2026, người dân Phường Mẫu nộp hồ sơ trực tuyến trên Cổng Dịch vụ công cấp tỉnh.\"", dung: false, loi: "Lỗi 3 — dẫn thiết chế không còn tồn tại", gt: "Từ 01/7/2025 không duy trì Cổng Dịch vụ công cấp tỉnh; hồ sơ nộp trên Cổng Dịch vụ công quốc gia — điểm một cửa số tập trung, duy nhất (NĐ 118/2025/NĐ-CP)." },
          { c: "\"Bộ phận Một cửa bảo vệ dữ liệu cá nhân của người dân theo Nghị định 13/2023/NĐ-CP hiện hành.\"", dung: false, loi: "Lỗi 1 — dẫn văn bản đã hết hiệu lực", gt: "NĐ 13/2023/NĐ-CP hết hiệu lực từ 01/01/2026 (khoản 2 Điều 42 NĐ 356/2025/NĐ-CP). Dẫn Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 và Nghị định 356/2025/NĐ-CP ngày 31/12/2025." },
          { c: "\"Căn cứ Nghị định số 118/2025/NĐ-CP ngày 09/6/2025 của Chính phủ về thực hiện thủ tục hành chính theo cơ chế một cửa, một cửa liên thông tại Bộ phận Một cửa và Cổng Dịch vụ công quốc gia.\"", dung: true, loi: "Viết đúng — nghị định sát nhất với Bộ phận Một cửa", gt: "Đúng số hiệu, ngày và cơ quan ban hành. Kế hoạch thực hiện nghị định này là Quyết định 1356/QĐ-TTg ngày 26/6/2025 của Thủ tướng Chính phủ." },
          { c: "\"Theo Nghị quyết 71/NQ-CP ngày 01/4/2025 của Chính phủ, dịch vụ công trực tuyến toàn trình đạt 90% vào năm 2030.\"", dung: true, loi: "Viết đúng — dẫn bản chương trình hành động đã cập nhật", gt: "NQ 71/NQ-CP sửa đổi, bổ sung Chương trình hành động thực hiện NQ 57-NQ/TW (hơn 180 nhiệm vụ). Khi dẫn chương trình hành động phải dẫn bản đã cập nhật." },
        ];
        const { root, ctrl, view } = ui.sim();
        const fQ = ui.field({ id: "m2tc-q", label: "Tìm theo ký hiệu hoặc tên", placeholder: "vd: 47/2020, an ninh mang, khung kien truc", hint: "Gõ không dấu cũng được; nhiều từ cách nhau bằng dấu cách.", onInput: v => { S.q = v; drawKQ(); } });
        const fNgay = ui.field({ id: "m2tc-ngay", label: "Tình trạng tại ngày", type: "date", value: S.ngay, onChange: v => { S.ngay = v; drawKQ(); } });
        ctrl.append(fQ, fNgay,
          ui.presets([["47/2020", "47/2020"], ["an ninh mang", "an ninh mạng"], ["khung kien truc", "khung kiến trúc"], ["du lieu ca nhan", "dữ liệu cá nhân"], ["mot cua", "một cửa"]].map(([q, l]) => ({ label: l, apply: () => { S.q = q; fQ.input.value = q; drawKQ(); } })), "Gợi ý tra cứu"),
          ui.steps([{ t: "<b>Phạm vi điều chỉnh</b> — văn bản nói về việc gì" }, { t: "<b>Đối tượng áp dụng</b> — áp dụng cho ai" }, { t: "<b>Hiệu lực thi hành</b> — đã có và còn hiệu lực chưa", hi: true }, { t: "<b>Điều khoản chuyển tiếp</b> — hồ sơ dở dang xử lý thế nào" }, { t: "<b>Văn bản bị thay thế</b> — có văn bản mình định dẫn không", hi: true }, { t: "<b>Trách nhiệm thi hành</b> — đơn vị mình có tên không" }]),
          ui.cancu("Luật An ninh mạng 116/2025/QH15, Điều 44 khoản 2", "Luật An toàn thông tin mạng 86/2015/QH13 và Luật An ninh mạng 24/2018/QH14 hết hiệu lực từ 01/7/2026."),
          ui.cancu("Nghị định 278/2025/NĐ-CP, Điều 23 khoản 2", "\"Nghị định số 47/2020/NĐ-CP … hết hiệu lực thi hành kể từ ngày Nghị định này có hiệu lực thi hành\" (22/10/2025)."));
        const kq = ui.slot(), bai = ui.slot();
        view.append(kq, h("hr", { style: { border: "0", borderTop: "1px solid var(--line)", margin: "4px 0" } }), bai);
        function drawKQ() {
          const ngay = parseNgay(S.ngay) || new Date();
          const toks = KHOA_LOC(S.q).split(/\s+/).filter(Boolean);
          if (!toks.length) { kq.render(ui.title("Kết quả tra cứu"), ui.note("Nhập ký hiệu (vd <b>118/2025</b>) hoặc từ khoá (vd <b>du lieu</b>). Kết quả hiện tình trạng tại ngày đã chọn, văn bản thay thế và cảnh báo đỏ nếu hết hiệu lực.", "mut")); return; }
          const hit = VB.filter(v => { const s = KHOA_LOC([v.ky_hieu, v.ten_ngan, v.co_quan_ban_hanh, v.ghi_chu, v.tang].join(" ")); return toks.every(t => s.includes(t)); });
          kq.render(ui.title("Kết quả tra cứu", hit.length + " văn bản khớp"),
            hit.length ? null : ui.note("Không tìm thấy văn bản nào trong danh mục 40 văn bản đã kiểm chứng. Thử từ khoá ngắn hơn, hoặc kiểm tra số hiệu trên vbpl.vn / chinhphu.vn.", "eve"),
            hit.slice(0, 8).map(v => theVanBan(v, ngay)),
            hit.length > 8 ? ui.note("Còn " + (hit.length - 8) + " kết quả nữa — thu hẹp từ khoá để xem.", "mut") : null);
        }
        /* --- bài tập đúng/sai --- */
        const luu = LAB.store.get("m2.tracuu", null);
        if (luu && luu.tl) { S.tl = luu.tl; S.ten = luu.ten || ""; S.cham = !!luu.cham; }
        const fTen = ui.field({ id: "m2tc-ten", label: "Họ tên học viên", value: S.ten, placeholder: "Nguyễn Văn A", onInput: v => { S.ten = v; } });
        const segs = [];
        function drawBai() {
          const diem = CAU.reduce((s, c, i) => s + ((S.tl[i] === "dung") === c.dung && S.tl[i] != null ? 1 : 0), 0);
          const daTL = CAU.filter((c, i) => S.tl[i] != null).length;
          const list = CAU.map((c, i) => {
            const seg = ui.seg({ id: "m2tc-c" + i, options: [["dung", "Đúng"], ["sai", "Sai"]], value: S.tl[i], onChange: v => { S.tl[i] = v; } });
            segs[i] = seg;
            const dungSai = S.cham && S.tl[i] != null ? ((S.tl[i] === "dung") === c.dung) : null;
            return h("li", { class: dungSai === true ? "hi" : null }, h("span", { class: "i" }, String(i + 1)),
              h("div", { class: "stack", style: { gap: "6px" } }, h("div", { class: "t" }, c.c), h("div", { class: "row", style: { alignItems: "center", gap: "8px" } }, seg, S.cham && S.tl[i] != null ? ui.tag(dungSai ? "Chính xác" : "Chưa đúng", dungSai ? "ok" : "eve") : null),
                S.cham ? ui.note("<b>Đáp án: " + (c.dung ? "Đúng" : "Sai") + ".</b> " + c.loi + ". " + c.gt, dungSai ? "ok" : "eve") : null));
          });
          const nut = h("div", { class: "row" },
            ui.btn("Chấm điểm", () => { if (CAU.some((c, i) => S.tl[i] == null)) { S.cham = false; drawBai(); bai.insertBefore(ui.note("Còn câu chưa trả lời — hãy chọn Đúng/Sai cho đủ 10 câu rồi chấm.", "eve"), bai.firstChild.nextSibling); return; } S.cham = true; LAB.store.set("m2.tracuu", { ten: S.ten, tl: S.tl, cham: true, luc: new Date().toISOString() }); drawBai(); }, "pri"),
            ui.btn("Tải CSV bài làm", () => LAB.csv.download("bai2_vien_dan_dung_sai.csv", ["Họ tên", "STT", "Câu viện dẫn", "Trả lời", "Đáp án", "Kết quả", "Loại lỗi", "Giải thích"], CAU.map((c, i) => [S.ten, i + 1, c.c, S.tl[i] === "dung" ? "Đúng" : S.tl[i] === "sai" ? "Sai" : "", c.dung ? "Đúng" : "Sai", S.tl[i] == null ? "" : ((S.tl[i] === "dung") === c.dung ? "Chính xác" : "Chưa đúng"), c.loi, c.gt]))),
            ui.btn("Lưu tạm", () => { LAB.store.set("m2.tracuu", { ten: S.ten, tl: S.tl, cham: S.cham, luc: new Date().toISOString() }); }),
            ui.btn("Làm lại", () => { S.tl = {}; S.cham = false; LAB.store.del("m2.tracuu"); drawBai(); }));
          bai.render(ui.title("Bài tập: câu viện dẫn này đúng hay sai?", "10 câu — dựa trên bốn lỗi viện dẫn thường gặp"),
            h("div", { class: "grp" }, fTen, ui.readouts([{ k: "Đã trả lời", v: daTL + "/10", kind: "pt" }, { k: S.cham ? "Điểm" : "Điểm (sau khi chấm)", v: S.cham ? diem + "/10" : "—", kind: S.cham ? (diem >= 8 ? "ok" : diem >= 5 ? "key" : "eve") : "mut", big: true }])),
            S.cham ? h("div", { class: "row", style: { alignItems: "center", gap: "14px" } }, ui.score(diem, "/ 10 câu", 10), ui.note(diem >= 8 ? "Phần căn cứ của anh chị sẽ được thẩm định nhanh. Nhớ ba việc kiểm tra trước khi nộp: đối chiếu số hiệu với bản gốc, kiểm tra hiệu lực, rà soát tên cơ quan." : "Hãy đọc lại giải thích từng câu. Lỗi hay gặp không phải thiếu văn bản mà là dẫn nhầm tầng, nhầm cơ quan hoặc dẫn văn bản đã hết hiệu lực.", diem >= 8 ? "ok" : "key")) : null,
            h("ol", { class: "steps" }, list), nut,
            ui.cancu("Quy tắc viết một trích dẫn chuẩn (slide Bài 2)", "Loại văn bản + số hiệu + ngày ban hành + cơ quan ban hành; khi dựa vào quy định cụ thể ghi thêm điều, khoản. Ví dụ: Nghị định số 118/2025/NĐ-CP ngày 09/6/2025 của Chính phủ."));
        }
        drawKQ(); drawBai(); pane.appendChild(root);
      } },

    /* ======================================================= TAB 4 ======================================================= */
    { id: "bando", title: "Bản đồ căn cứ pháp lý",
      intro: "Bài thực hành chính của Buổi 2: chọn một nhiệm vụ chuyển đổi số của UBND Phường Mẫu, viết một câu mô tả, chọn văn bản từ danh mục xếp vào bốn tầng, ghi điều khoản làm chỗ dựa, rồi \"Kiểm tra gợi ý\". Bộ gợi ý do giảng viên lập từ CANCU — chỉ là gợi ý, học viên vẫn phải tự kiểm tra hiệu lực trên vbpl.vn.",
      build(pane) {
        /* Năm bước lập bản đồ căn cứ pháp lý; lưu LAB.store m2.bando; tải CSV */
        const NV = [
          { id: "ckso", ten: "Triển khai chữ ký số cho cán bộ, công chức", mota: "Cấp và sử dụng chữ ký số cho 100% cán bộ, công chức UBND Phường Mẫu để ký hồ sơ, văn bản điện tử trong năm 2027.",
            goiy: [["NQ 57-NQ/TW", "Định hướng đột phá về chuyển đổi số quốc gia (vai trò: chủ trương)"], ["QĐ 1266/QĐ-TTg", "Chỉ tiêu 2030: trên 70% dân số từ 18 tuổi có chữ ký số (vai trò: chỉ tiêu)"], ["Luật 20/2023/QH15", "Công nhận giá trị pháp lý của thông điệp dữ liệu và chữ ký điện tử (vai trò: giá trị pháp lý)"], ["NĐ 69/2024/NĐ-CP", "Định danh và xác thực điện tử; đã sửa đổi bởi NĐ 320/2026/NĐ-CP (vai trò: định danh)"], ["NĐ 118/2025/NĐ-CP", "Giải quyết thủ tục hành chính, trả kết quả điện tử (vai trò: quy trình)"]] },
          { id: "dvc", ten: "Cung cấp dịch vụ công trực tuyến toàn trình", mota: "Nâng các thủ tục hộ tịch, chứng thực của Phường Mẫu lên mức toàn trình trên Cổng Dịch vụ công quốc gia trong giai đoạn 2026–2027.",
            goiy: [["NQ 57-NQ/TW", "Chủ trương đột phá về chuyển đổi số quốc gia"], ["NQ 71/NQ-CP", "Chỉ tiêu dịch vụ công trực tuyến toàn trình đạt 90% vào 2030"], ["QĐ 1266/QĐ-TTg", "100% hồ sơ, kết quả TTHC được số hoá; 99% hài lòng"], ["Luật 20/2023/QH15", "Giá trị pháp lý của hồ sơ điện tử, chữ ký điện tử"], ["NĐ 42/2022/NĐ-CP", "Phân loại dịch vụ công trực tuyến toàn trình / một phần"], ["NĐ 45/2020/NĐ-CP", "Thực hiện TTHC trên môi trường điện tử (đã sửa đổi bởi NĐ 310/2026/NĐ-CP)"], ["NĐ 118/2025/NĐ-CP", "Một cửa, một cửa liên thông; Cổng DVC quốc gia là điểm một cửa số duy nhất"]] },
          { id: "dancu", ten: "Kết nối Cơ sở dữ liệu quốc gia về dân cư để không hỏi lại giấy tờ", mota: "Khai thác dữ liệu dân cư qua Nền tảng chia sẻ, điều phối dữ liệu để Bộ phận Một cửa Phường Mẫu không yêu cầu người dân nộp lại giấy tờ đã có dữ liệu.",
            goiy: [["NQ 57-NQ/TW", "Chủ trương đột phá về chuyển đổi số quốc gia"], ["QĐ 06/QĐ-TTg", "Đề án 06: phát triển ứng dụng dữ liệu dân cư, định danh và xác thực điện tử"], ["Luật 60/2024/QH15", "Điều 11 khoản 2 điểm b: dữ liệu có trong các CSDL được kết nối, chia sẻ thì không thu thập lại"], ["NĐ 194/2025/NĐ-CP", "Điều 16 khoản 4: không được yêu cầu cung cấp thông tin tương đương bằng văn bản giấy khi dữ liệu chủ đã được chia sẻ"], ["NĐ 278/2025/NĐ-CP", "Điều 3 khoản 5, Điều 4 khoản 2: kết nối, chia sẻ bắt buộc qua Nền tảng chia sẻ, điều phối dữ liệu"], ["NĐ 165/2025/NĐ-CP", "Điều 23 khoản 5 điểm c: không yêu cầu khai báo, cung cấp lại thông tin đã có trong CSDL tổng hợp quốc gia"], ["NĐ 320/2026/NĐ-CP", "Sửa khoản 4 Điều 4 NĐ 69/2024: không được yêu cầu nộp giấy tờ khi dữ liệu đã được tích hợp"], ["QĐ 11/2026/QĐ-TTg", "Danh mục 20 CSDL quốc gia; CSDL quốc gia về dân cư do Bộ Công an chủ quản"]] },
          { id: "dlmo", ten: "Công bố dữ liệu mở của Phường", mota: "Công bố danh mục và tập dữ liệu mở về điểm phục vụ công cộng của Phường Mẫu trên cổng dữ liệu của tỉnh và Cổng dữ liệu quốc gia trong năm 2027.",
            goiy: [["NQ 57-NQ/TW", "Chủ trương đột phá về chuyển đổi số quốc gia"], ["Luật 104/2016/QH13", "Quyền tiếp cận thông tin của công dân; minh bạch thông tin"], ["Luật 60/2024/QH15", "Điều 3 khoản 4 (dữ liệu mở); Điều 21 khoản 4: cơ quan nhà nước công bố danh mục dữ liệu mở và tổ chức công khai"], ["NĐ 165/2025/NĐ-CP", "Điều 10: công khai dữ liệu mở; gửi Bộ Công an tổng hợp, đăng tải trên Cổng dữ liệu quốc gia"], ["NĐ 194/2025/NĐ-CP", "Chương IV, Điều 26–29: Công bố mở, định dạng mở, cập nhật không quá 03 tháng, Cổng dữ liệu quốc gia là đầu mối"]] },
          { id: "thue", ten: "Thuê dịch vụ công nghệ thông tin", mota: "Thuê dịch vụ phần mềm quản lý điểm phục vụ công cộng bằng kinh phí chi thường xuyên của Phường Mẫu, giai đoạn 2027–2029.",
            goiy: [["NQ 57-NQ/TW", "Chủ trương đột phá về chuyển đổi số quốc gia"], ["QĐ 1266/QĐ-TTg", "100% bộ, ngành, địa phương dùng thống nhất nền tảng số dùng chung quốc gia — ưu tiên dùng chung trước khi thuê riêng"], ["Luật 67/2006/QH11", "Luật Công nghệ thông tin — ứng dụng CNTT trong cơ quan nhà nước"], ["NĐ 45/2026/NĐ-CP", "Quản lý đầu tư ứng dụng CNTT dùng ngân sách nhà nước; ba hình thức, gồm thuê dịch vụ CNTT (hiệu lực 01/3/2026, thay NĐ 73/2019)"], ["QĐ 292/QĐ-BKHCN", "Khung Kiến trúc Chính phủ số 4.0 — hệ thống thuê phải phù hợp khung kiến trúc số cấp tỉnh"]] },
          { id: "dlcn", ten: "Bảo vệ dữ liệu cá nhân tại Bộ phận Một cửa", mota: "Rà soát việc thu thập, lưu trữ, chia sẻ dữ liệu cá nhân của người dân tại Bộ phận Một cửa Phường Mẫu theo quy định mới từ 01/01/2026.",
            goiy: [["NQ 57-NQ/TW", "Chủ trương đột phá về chuyển đổi số quốc gia"], ["Luật 91/2025/QH15", "Điều 3: 6 nguyên tắc; Điều 4 khoản 1: 6 nhóm quyền của chủ thể dữ liệu; Điều 23: thông báo vi phạm"], ["NĐ 356/2025/NĐ-CP", "Điều 3, Điều 4: danh mục dữ liệu cá nhân cơ bản và nhạy cảm; thay NĐ 13/2023 từ 01/01/2026"], ["Luật 116/2025/QH15", "Luật An ninh mạng mới, hiệu lực 01/7/2026 (thay Luật 86/2015 và Luật 24/2018)"], ["NĐ 331/2026/NĐ-CP", "Bảo vệ an ninh mạng đối với hệ thống thông tin theo cấp độ"], ["Luật 60/2024/QH15", "Điều 15: quản trị dữ liệu an toàn, bảo mật"], ["NĐ 118/2025/NĐ-CP", "Quy trình tiếp nhận, giải quyết hồ sơ tại Bộ phận Một cửa"]] },
        ];
        const BUOC = ["Mô tả nhiệm vụ", "Tìm văn bản", "Chỉ đúng điều khoản", "Kiểm tra hiệu lực", "Ghi vào kế hoạch"];
        const luu = LAB.store.get("m2.bando", null);
        const S = { ten: "", nv: "ckso", mota: "", chon: [], loc: "all", kt: null, daLuu: false };
        if (luu) { S.ten = luu.ten || ""; S.nv = NV.some(n => n.id === luu.nv) ? luu.nv : "ckso"; S.mota = luu.mota || ""; S.chon = Array.isArray(luu.chon) ? luu.chon.filter(c => timVB(c.ky_hieu)) : []; S.daLuu = true; }
        const { root, ctrl, view } = ui.sim();
        const fTen = ui.field({ id: "m2bd-ten", label: "Họ tên học viên", value: S.ten, placeholder: "Nguyễn Văn A", onInput: v => { S.ten = v; } });
        const selNV = ui.select({ id: "m2bd-nv", label: "Nhiệm vụ chuyển đổi số của đơn vị", options: NV.map(n => [n.id, n.ten]), value: S.nv, onChange: v => { S.nv = v; S.kt = null; drawMap(); } });
        const fMota = ui.field({ id: "m2bd-mota", label: "Bước 1 — một câu mô tả: làm gì, cho ai, trong thời gian nào", type: "textarea", value: S.mota, rows: 3, onInput: v => { S.mota = v; drawWizard(); } });
        const segLoc = ui.seg({ id: "m2bd-loc", label: "Bước 2 — lọc danh mục theo tầng", options: [["all", "Tất cả"], ...TANG.map(t => [String(t.n), "Tầng " + t.n])], value: "all", onChange: v => { S.loc = v; drawCat(); } });
        const luuBai = () => { LAB.store.set("m2.bando", { ten: S.ten, nv: S.nv, mota: S.mota, chon: S.chon, luc: new Date().toISOString() }); S.daLuu = true; drawWizard(); };
        ctrl.append(fTen, selNV, fMota, segLoc,
          h("div", { class: "row" }, ui.btn("Kiểm tra gợi ý", () => { kiemTra(); }, "pri"), ui.btn("Lưu bài", luuBai), ui.btn("Tải CSV bản đồ", taiCSV), ui.btn("Làm lại", () => { S.chon = []; S.mota = ""; S.kt = null; fMota.input.value = ""; LAB.store.del("m2.bando"); S.daLuu = false; drawMap(); })),
          ui.presets([{ label: "Bảng mẫu: chữ ký số cho cán bộ", apply: () => { const n = NV[0]; S.nv = n.id; selNV.input.value = n.id; S.mota = n.mota; fMota.input.value = n.mota; S.chon = n.goiy.map(([k, d]) => ({ ky_hieu: k, dieu_khoan: d.replace(/\s*\(vai trò:.*\)$/, "") })); S.kt = null; drawMap(); } },
            { label: "Bẫy: dẫn văn bản cũ", apply: () => { const n = NV[2]; S.nv = n.id; selNV.input.value = n.id; S.mota = n.mota; fMota.input.value = n.mota; S.chon = [{ ky_hieu: "NQ 52-NQ/TW", dieu_khoan: "" }, { ky_hieu: "QĐ 749/QĐ-TTg", dieu_khoan: "" }, { ky_hieu: "NĐ 47/2020/NĐ-CP", dieu_khoan: "Điều 5 khoản 2" }, { ky_hieu: "NĐ 47/2024/NĐ-CP", dieu_khoan: "" }, { ky_hieu: "QĐ 2568/QĐ-BTTTT", dieu_khoan: "" }]; S.kt = null; drawMap(); kiemTra(); } }]),
          ui.cancu("Năm bước lập bản đồ căn cứ pháp lý (slide Bài 2)", "Mô tả nhiệm vụ → tìm văn bản trên vbpl.vn → chỉ đúng điều, khoản → kiểm tra hiệu lực → ghi vào kế hoạch với trích dẫn đầy đủ. <b>Bỏ bước kiểm tra hiệu lực là nguyên nhân phổ biến nhất của lỗi viện dẫn.</b>"),
          ui.warn("Bộ gợi ý là của giảng viên, lập từ CANCU; kế hoạch thật của đơn vị phải tra lại từng văn bản trên vbpl.vn."));
        const wiz = ui.slot(), cat = ui.slot(), map = ui.slot(), kq = ui.slot();
        view.append(wiz, cat, map, kq);
        const nvHienTai = () => NV.find(n => n.id === S.nv) || NV[0];
        function drawWizard() {
          const now = new Date();
          const done = [S.mota.trim().length > 10, S.chon.length > 0, S.chon.length > 0 && S.chon.every(c => (c.dieu_khoan || "").trim()), !!S.kt && S.kt.het === 0, S.daLuu && S.chon.length > 0];
          const cur = done.findIndex(x => !x);
          wiz.render(ui.title("Bản đồ căn cứ pháp lý — " + nvHienTai().ten),
            h("div", { class: "wizard" }, BUOC.map((b, i) => h("span", { class: "st" + (done[i] ? " done" : i === cur ? " on" : "") }, (i + 1) + ". " + b))),
            ui.readouts([{ k: "Văn bản đã chọn", v: LAB.num(S.chon.length), kind: "pt", big: true }, { k: "Có điều khoản / chỗ dựa", v: LAB.num(S.chon.filter(c => (c.dieu_khoan || "").trim()).length), kind: "key" }, { k: "Hết hiệu lực (hôm nay)", v: LAB.num(S.chon.filter(c => trangThai(timVB(c.ky_hieu), now).code === "het").length), kind: "eve" }, { k: "Tầng đã phủ", v: new Set(S.chon.map(c => tangCua(timVB(c.ky_hieu)).n)).size + "/4", kind: "aqua" }]));
        }
        let tiles;
        function drawCat() {
          const items = VB.filter(v => S.loc === "all" || tangCua(v).n === +S.loc).sort((a, b) => tangCua(a).n - tangCua(b).n || (parseNgay(a.ngay_ban_hanh) || 0) - (parseNgay(b.ngay_ban_hanh) || 0))
            .map(v => ({ id: v.ky_hieu, title: v.ky_hieu, sub: v.ten_ngan.length > 58 ? v.ten_ngan.slice(0, 58) + "…" : v.ten_ngan, kind: tangCua(v).kind }));
          tiles = ui.tiles({ items, value: S.chon.map(c => c.ky_hieu), multi: true, onChange: (ids, it) => {
            if (S.chon.some(c => c.ky_hieu === it.id)) S.chon = S.chon.filter(c => c.ky_hieu !== it.id); else S.chon.push({ ky_hieu: it.id, dieu_khoan: "" });
            S.kt = null; drawWizard(); drawTang(); kq.render();
          } });
          cat.render(ui.title("Bước 2 — chọn văn bản từ danh mục", items.length + " văn bản · bấm để chọn/bỏ; tình trạng hiệu lực không hiện sẵn, anh chị tự kiểm tra ở bước 4"), tiles);
        }
        function drawTang() {
          const now = new Date();
          map.render(ui.title("Bước 3 — xếp vào bốn tầng và ghi điều, khoản làm chỗ dựa"),
            TANG.map(t => {
              const ds = S.chon.filter(c => tangCua(timVB(c.ky_hieu)) === t);
              return h("div", { class: "panel stack", style: { borderLeft: "3px solid var(--" + t.kind + ")" } },
                h("div", { class: "row", style: { alignItems: "center", gap: "8px" } }, h("b", null, "Tầng " + t.n + " · " + t.ten), ui.tag(t.loai, t.kind), h("span", { class: "small", style: { color: "var(--faint)" } }, t.coquan)),
                ds.length ? ds.map(c => { const v = timVB(c.ky_hieu), st = trangThai(v, now);
                  const f = ui.field({ id: "m2bd-dk-" + c.ky_hieu.replace(/[^A-Za-z0-9]/g, ""), label: "Điều, khoản / nội dung làm chỗ dựa", value: c.dieu_khoan || "", placeholder: "vd: Điều 11 khoản 2 điểm b", onInput: val => { c.dieu_khoan = val; S.kt = null; }, onChange: () => drawWizard() });
                  return h("div", { class: "stack", style: { gap: "4px", padding: "6px 0", borderTop: "1px dashed var(--line)" } },
                    h("div", { class: "row", style: { alignItems: "center", gap: "8px" } }, h("b", null, v.ky_hieu), h("span", { class: "small" }, v.ten_ngan + " · " + v.co_quan_ban_hanh + " · " + fmtNgay(v.ngay_ban_hanh)), tagTT(st), ui.btn("Bỏ", () => { S.chon = S.chon.filter(x => x !== c); S.kt = null; tiles.set(S.chon.map(x => x.ky_hieu)); drawWizard(); drawTang(); kq.render(); }, "sm")),
                    st.code === "het" ? ui.note(st.text + (st.thay ? " — thay bằng <b>" + st.thay.ky_hieu + "</b>." : ".") + " Không được dẫn như quy định đang áp dụng.", "eve") : null, f); })
                  : h("div", { class: "small", style: { color: "var(--faint)" } }, "Chưa chọn văn bản tầng này."));
            }));
        }
        function kiemTra() {
          const now = new Date(); const n = nvHienTai();
          const goiy = new Map(n.goiy);
          const trung = S.chon.filter(c => goiy.has(c.ky_hieu)), thieu = n.goiy.filter(([k]) => !S.chon.some(c => c.ky_hieu === k)), ngoai = S.chon.filter(c => !goiy.has(c.ky_hieu));
          const het = S.chon.filter(c => trangThai(timVB(c.ky_hieu), now).code === "het"), ketthuc = S.chon.filter(c => trangThai(timVB(c.ky_hieu), now).code === "ketthuc");
          const thieuDK = S.chon.filter(c => !(c.dieu_khoan || "").trim());
          S.kt = { het: het.length }; drawWizard();
          const pct = n.goiy.length ? Math.round(100 * trung.length / n.goiy.length) : 0;
          kq.render(ui.title("Kết quả kiểm tra so với bộ gợi ý", "gợi ý của giảng viên, không phải đáp án duy nhất"),
            !S.mota.trim() ? ui.note("<b>Bước 1 còn trống:</b> viết một câu mô tả nhiệm vụ (làm gì, cho ai, trong thời gian nào) trước khi chọn căn cứ.", "eve") : null,
            h("div", { class: "row", style: { alignItems: "center", gap: "14px" } }, ui.score(pct, "% gợi ý đã phủ", 100),
              ui.readouts([{ k: "Trùng gợi ý", v: trung.length + "/" + n.goiy.length, kind: "ok" }, { k: "Ngoài gợi ý", v: LAB.num(ngoai.length), kind: "key" }, { k: "Hết hiệu lực", v: LAB.num(het.length), kind: "eve" }, { k: "Thiếu điều khoản", v: LAB.num(thieuDK.length), kind: thieuDK.length ? "eve" : "ok" }])),
            het.length ? ui.note("<b>Lỗi 1 — dẫn văn bản đã hết hiệu lực:</b> " + het.map(c => { const st = trangThai(timVB(c.ky_hieu), now); return "<b>" + c.ky_hieu + "</b> (" + st.text + (st.thay ? "; thay bằng " + st.thay.ky_hieu : "") + ")"; }).join("; ") + ". Bỏ khỏi phần căn cứ hoặc chỉ nhắc với tư cách văn bản nền.", "eve") : ui.note("Không có văn bản hết hiệu lực trong bản đồ — bước 4 đạt.", "ok"),
            ketthuc.length ? ui.note("<b>Văn bản của giai đoạn trước:</b> " + ketthuc.map(c => c.ky_hieu).join(", ") + " — chỉ dẫn khi nói về nền móng; chỉ tiêu 2026–2030 lấy từ QĐ 1266/QĐ-TTg và NQ 57-NQ/TW.", "key") : null,
            thieuDK.length ? ui.note("<b>Lỗi 4 — dẫn cả văn bản mà không chỉ điều, khoản:</b> " + thieuDK.map(c => c.ky_hieu).join(", ") + ". Người thẩm định không tìm được chỗ dựa cụ thể, kế hoạch dễ bị trả lại.", "key") : null,
            ui.steps(n.goiy.map(([k, d]) => { const v = timVB(k); const co = S.chon.some(c => c.ky_hieu === k); return { t: (co ? "✓ " : "✗ ") + "<b>" + k + "</b> — " + (v ? v.ten_ngan : "") + (co ? "" : " <i>(chưa chọn)</i>"), r: "Gợi ý chỗ dựa: " + d, hi: co }; })),
            ngoai.length ? ui.note("<b>Ngoài bộ gợi ý:</b> " + ngoai.map(c => c.ky_hieu).join(", ") + ". Không hẳn sai — nếu giữ lại, hãy ghi rõ điều, khoản liên quan trực tiếp tới nhiệm vụ; bỏ văn bản không liên quan.", "mut") : null,
            thieu.length ? ui.note("<b>Gợi ý còn thiếu:</b> " + thieu.map(([k]) => k).join(", ") + ".", "key") : ui.note("Bản đồ đã phủ đủ bộ gợi ý. Bấm <b>Lưu bài</b> và <b>Tải CSV bản đồ</b> để nộp.", "ok"));
        }
        function taiCSV() {
          const now = new Date(); const n = nvHienTai();
          LAB.csv.download("bai2_ban_do_can_cu_phap_ly.csv", ["Họ tên", "Nhiệm vụ", "Mô tả", "Tầng", "Ký hiệu", "Tên văn bản", "Cơ quan ban hành", "Ngày ban hành", "Hiệu lực từ", "Tình trạng (hôm nay)", "Thay thế / sửa đổi bởi", "Điều khoản / chỗ dựa", "Trong bộ gợi ý"],
            S.chon.map(c => { const v = timVB(c.ky_hieu), t = tangCua(v), st = trangThai(v, now); return [S.ten, n.ten, S.mota, "Tầng " + t.n + " - " + t.ten, v.ky_hieu, v.ten_ngan, v.co_quan_ban_hanh, fmtNgay(v.ngay_ban_hanh), fmtNgay(v.hieu_luc_tu), st.text, v.van_ban_thay_the_sua_doi || "", c.dieu_khoan || "", n.goiy.some(([k]) => k === c.ky_hieu) ? "Có" : "Không"]; }));
          S.daLuu = true; drawWizard();
        }
        function drawMap() { drawWizard(); drawCat(); drawTang(); kq.render(); }
        drawMap(); pane.appendChild(root);
      } },

    /* ======================================================= TAB 5 ======================================================= */
    { id: "chitieu2030", title: "Chỉ tiêu đến 2030",
      intro: "Chỉ tiêu đến năm 2030 của Quyết định 1266/QĐ-TTg, Nghị quyết 57-NQ/TW và Nghị quyết 71/NQ-CP (đúng con số trong CANCU) đối chiếu với hiện trạng Phường Mẫu tính từ bộ số liệu KPI theo quý, sổ hồ sơ và kiểm kê hệ thống (giả lập). Chỉ tiêu quốc gia không có số liệu cấp xã được ghi rõ.",
      build(pane) {
        /* Bảng chỉ tiêu + thanh khoảng cách + biểu đồ cột; chọn quý và nhóm chỉ tiêu */
        const KPI = (LAB.data.kpi || []).slice().sort((a, b) => a.quy < b.quy ? -1 : 1);
        const HS = LAB.data.ho_so || [], TT = LAB.data.thu_tuc || [], HT = LAB.data.he_thong || [], EG = (LAB.data.egdi || []).slice().sort((a, b) => +a.ky_khao_sat - +b.ky_khao_sat);
        const S = { nhom: "all", quy: KPI.length ? KPI[KPI.length - 1].quy : "" };
        const kpiCol = (col, ten, ghi) => ctx => ({ v: +ctx.k[col], text: LAB.pc(+ctx.k[col]), ghi: ten + (ghi ? " — " + ghi : ""), col });
        /* Danh mục chỉ tiêu: con số lấy nguyên văn từ CANCU mục A và C */
        const CT = [
          { nhom: "Chính phủ số", ct: "Hồ sơ, kết quả giải quyết TTHC được số hoá", muc: "100%", so: 100, nguon: "QĐ 1266/QĐ-TTg", local: kpiCol("ty_le_ket_qua_so_hoa_pct", "Tỉ lệ kết quả số hoá (KPI quý)") },
          { nhom: "Chính phủ số", ct: "Người dân, doanh nghiệp hài lòng khi dùng dịch vụ công trực tuyến", muc: "99%", so: 99, nguon: "QĐ 1266/QĐ-TTg", local: ctx => { const rated = ctx.hs.filter(r => r.hai_long_1_5 !== "" && r.hai_long_1_5 != null); if (!rated.length) return { v: null, text: "—", ghi: "Quý này chưa có đánh giá trong sổ hồ sơ; điểm hài lòng KPI " + LAB.num(+ctx.k.diem_hai_long_tren_5, 2) + "/5" }; const v = 100 * LAB.stat.rate(rated, r => +r.hai_long_1_5 >= 4); return { v, text: LAB.pc(v), ghi: "Tỉ lệ đánh giá ≥ 4/5 trong " + LAB.num(rated.length) + " hồ sơ có đánh giá; điểm TB KPI " + LAB.num(+ctx.k.diem_hai_long_tren_5, 2) + "/5" }; } },
          { nhom: "Chính phủ số", ct: "Bộ, ngành, địa phương dùng thống nhất nền tảng số dùng chung quốc gia", muc: "100%", so: 100, nguon: "QĐ 1266/QĐ-TTg", local: ctx => { const dd = ctx.ht.filter(s => s.tinh_trang === "Đang dùng"); const v = dd.length ? 100 * LAB.stat.rate(dd, s => s.ket_noi_nen_tang_chia_se === "Có") : null; return { v, text: LAB.pc(v), ghi: "Đối chiếu gần đúng: " + dd.filter(s => s.ket_noi_nen_tang_chia_se === "Có").length + "/" + dd.length + " hệ thống đang dùng đã kết nối nền tảng chia sẻ (kiểm kê hệ thống)" }; } },
          { nhom: "Chính phủ số", ct: "Thứ hạng chính phủ điện tử theo Liên Hợp Quốc (EGDI)", muc: "Nhóm 50 nước dẫn đầu", so: null, nguon: "QĐ 1266/QĐ-TTg", local: () => { const e = EG[EG.length - 1]; return e ? { v: null, text: e.thu_hang_tren_193 + "/193 (" + e.ky_khao_sat + ")", ghi: "Số liệu quốc gia: điểm EGDI " + String(e.diem_egdi).replace(".", ",") + ", nhóm " + e.nhom + "; cần tăng " + (e.thu_hang_tren_193 - 50) + " bậc" } : null; } },
          { nhom: "Chính phủ số", ct: "Dịch vụ công trực tuyến toàn trình", muc: "90%", so: 90, nguon: "NQ 71/NQ-CP", local: ctx => { const r = kpiCol("ty_le_ho_so_toan_trinh_pct", "Tỉ lệ hồ sơ toàn trình (KPI quý)")(ctx); const tt = ctx.tt.length ? 100 * LAB.stat.rate(ctx.tt, t => t.muc_do === "Toàn trình") : null; r.ghi += "; " + LAB.pc(tt, 0) + " thủ tục của Phường ở mức toàn trình (" + ctx.tt.filter(t => t.muc_do === "Toàn trình").length + "/" + ctx.tt.length + ")"; return r; } },
          { nhom: "Kinh tế số", ct: "Tỉ trọng kinh tế số trong GDP", muc: "Tối thiểu 30%", so: 30, nguon: "QĐ 1266/QĐ-TTg; NQ 57-NQ/TW", local: null },
          { nhom: "Kinh tế số", ct: "Doanh nghiệp nhỏ và vừa được hỗ trợ chuyển đổi số", muc: "Trên 500.000", so: null, nguon: "QĐ 1266/QĐ-TTg", local: null },
          { nhom: "Kinh tế số", ct: "Doanh thu thương mại điện tử trong tổng mức bán lẻ", muc: "15–17%", so: null, nguon: "QĐ 1266/QĐ-TTg", local: null },
          { nhom: "Kinh tế số", ct: "Doanh nghiệp nhỏ và vừa tiếp cận nền tảng, giải pháp trí tuệ nhân tạo", muc: "Trên 40%", so: 40, nguon: "QĐ 1266/QĐ-TTg", local: null },
          { nhom: "Kinh tế số", ct: "Giao dịch không dùng tiền mặt", muc: "80%", so: 80, nguon: "NQ 57-NQ/TW", local: kpiCol("ty_le_thanh_toan_truc_tuyen_pct", "Tỉ lệ hồ sơ thanh toán lệ phí trực tuyến (KPI quý)", "đối chiếu gần đúng") },
          { nhom: "Xã hội số", ct: "Hộ gia đình được phủ cáp quang băng rộng", muc: "100%", so: 100, nguon: "QĐ 1266/QĐ-TTg", local: null },
          { nhom: "Xã hội số", ct: "Dân số từ 15 tuổi có tài khoản ngân hàng", muc: "Trên 95%", so: 95, nguon: "QĐ 1266/QĐ-TTg", local: null },
          { nhom: "Xã hội số", ct: "Dân số từ 18 tuổi có chữ ký số", muc: "Trên 70%", so: 70, nguon: "QĐ 1266/QĐ-TTg", local: kpiCol("ty_le_can_bo_co_chu_ky_so_pct", "Tỉ lệ cán bộ Phường có chữ ký số (KPI quý)", "đối chiếu gần đúng, không phải dân số") },
          { nhom: "Xã hội số", ct: "Lượt người lao động được đào tạo kỹ năng số cơ bản", muc: "10 triệu", so: null, nguon: "QĐ 1266/QĐ-TTg", local: ctx => ({ v: null, text: LAB.pc(+ctx.k.ty_le_can_bo_hoan_thanh_boi_duong_pct), ghi: "Tham khảo: tỉ lệ cán bộ Phường hoàn thành bồi dưỡng kỹ năng số (KPI quý)" }) },
          { nhom: "Nguồn lực (NQ 57)", ct: "Chi ngân sách hằng năm cho phát triển khoa học, công nghệ", muc: "Ít nhất 3%", so: 3, nguon: "NQ 57-NQ/TW", local: null },
          { nhom: "Nguồn lực (NQ 57)", ct: "Kinh phí nghiên cứu và phát triển (R&D) trên GDP", muc: "2% (trong đó từ xã hội hơn 60%)", so: null, nguon: "NQ 57-NQ/TW", local: null },
          { nhom: "Nguồn lực (NQ 57)", ct: "Phủ sóng 5G; đô thị thông minh ở các thành phố trực thuộc Trung ương", muc: "Toàn quốc; hoàn thành", so: null, nguon: "NQ 57-NQ/TW", local: null },
          { nhom: "Nguồn lực (NQ 57)", ct: "Năng lực cạnh tranh số", muc: "Nhóm 50 nước đứng đầu; nhóm 3 Đông Nam Á", so: null, nguon: "NQ 57-NQ/TW", local: null },
          { nhom: "Nguồn lực (NQ 57)", ct: "Nhân lực nghiên cứu khoa học; tổ chức KH&CN xếp hạng", muc: "12/1 vạn dân; 40–50 tổ chức", so: null, nguon: "NQ 57-NQ/TW", local: null },
          { nhom: "Nguồn lực (NQ 57)", ct: "Tổ chức, doanh nghiệp công nghệ hàng đầu thế giới đặt trụ sở/đầu tư", muc: "Ít nhất 3", so: null, nguon: "NQ 57-NQ/TW", local: null },
        ];
        const CANCU = {
          "Chính phủ số": ["Quyết định 1266/QĐ-TTg ngày 14/7/2026 của Thủ tướng Chính phủ — chỉ tiêu Chính phủ số đến 2030", "100% hồ sơ, kết quả giải quyết TTHC được số hoá; 99% người dân, doanh nghiệp hài lòng khi sử dụng DVC trực tuyến; 100% bộ, ngành, địa phương sử dụng thống nhất nền tảng số dùng chung quốc gia; Việt Nam thuộc nhóm 50 nước dẫn đầu về chính phủ điện tử. Nghị quyết 71/NQ-CP ngày 01/4/2025: DVC trực tuyến toàn trình đạt 90% vào 2030."],
          "Kinh tế số": ["Quyết định 1266/QĐ-TTg — chỉ tiêu Kinh tế số; Nghị quyết 57-NQ/TW", "Kinh tế số đạt tối thiểu 30% GDP; hỗ trợ trên 500.000 doanh nghiệp nhỏ và vừa chuyển đổi số; thương mại điện tử chiếm 15–17% tổng mức bán lẻ; trên 40% doanh nghiệp nhỏ và vừa tiếp cận trí tuệ nhân tạo; tỉ lệ giao dịch không dùng tiền mặt 80% (NQ 57)."],
          "Xã hội số": ["Quyết định 1266/QĐ-TTg — chỉ tiêu Xã hội số", "Cáp quang băng rộng phủ tới 100% hộ gia đình; trên 95% dân số từ 15 tuổi có tài khoản ngân hàng; trên 70% dân số từ 18 tuổi có chữ ký số; 10 triệu lượt người lao động được đào tạo kỹ năng số cơ bản."],
          "Nguồn lực (NQ 57)": ["Nghị quyết 57-NQ/TW ngày 22/12/2024 của Bộ Chính trị — chỉ tiêu đến 2030", "Ít nhất 3% tổng chi ngân sách hằng năm cho khoa học, công nghệ; R&D đạt 2% GDP, trong đó từ xã hội hơn 60%; phủ sóng 5G toàn quốc; thu hút ít nhất 3 tổ chức, doanh nghiệp công nghệ hàng đầu thế giới; 12 nhân lực nghiên cứu/1 vạn dân; 40–50 tổ chức KH&CN xếp hạng khu vực/thế giới."],
        };
        const { root, ctrl, view } = ui.sim();
        const segNhom = ui.seg({ id: "m2ct-nhom", label: "Nhóm chỉ tiêu", options: [["all", "Tất cả"], ["Chính phủ số", "Chính phủ số"], ["Kinh tế số", "Kinh tế số"], ["Xã hội số", "Xã hội số"], ["Nguồn lực (NQ 57)", "Nguồn lực (NQ 57)"]], value: "all", onChange: v => { S.nhom = v; draw(); } });
        const selQuy = ui.select({ id: "m2ct-quy", label: "Quý hiện trạng của Phường Mẫu", options: KPI.map(k => [k.quy, k.quy]), value: S.quy, onChange: v => { S.quy = v; draw(); } });
        ctrl.append(segNhom, selQuy,
          ui.presets([{ label: "Chính phủ số, quý gần nhất", apply: () => { S.nhom = "Chính phủ số"; S.quy = KPI[KPI.length - 1].quy; segSet(segNhom, S.nhom); selQuy.input.value = S.quy; draw(); } },
            { label: "Một năm trước", apply: () => { S.quy = KPI[Math.max(0, KPI.length - 5)].quy; selQuy.input.value = S.quy; draw(); } },
            { label: "Làm lại", apply: () => { S.nhom = "all"; S.quy = KPI[KPI.length - 1].quy; segSet(segNhom, "all"); selQuy.input.value = S.quy; draw(); } }]),
          ui.note("Chỉ tiêu quốc gia không phải chỉ tiêu của từng đơn vị; đơn vị phải chuyển hoá thành chỉ tiêu của mình (Buổi 7–8). Cột \"Hiện trạng\" chỉ là đối chiếu gần đúng từ số liệu giả lập của Phường Mẫu.", "key"),
          ui.warn());
        const cc = ui.slot(), tong = ui.slot(), bang = ui.slot();
        const box = chart.box(b => { if (S.chart) chart.bars(b, S.chart); });
        view.append(cc, tong, box, bang);
        function uocDat(col, v, muc) {
          if (!col || v == null || !isFinite(v)) return "—";
          if (v >= muc) return "Đã đạt";
          const i = KPI.findIndex(k => k.quy === S.quy); const seq = KPI.slice(0, i + 1);
          if (seq.length < 2) return "—";
          const slope = (+seq[seq.length - 1][col] - +seq[0][col]) / (seq.length - 1);
          if (slope <= 0) return "Không tăng";
          const n = Math.ceil((muc - v) / slope); const q = quyTiep(S.quy, n);
          return (q > "2030-Q4" ? "Sau 2030" : q) + " (" + LAB.num(slope, 1) + " điểm %/quý)";
        }
        function draw() {
          const k = KPI.find(x => x.quy === S.quy) || KPI[KPI.length - 1] || {};
          const ctx = { k, hs: HS.filter(r => LAB.date.quy(r.ngay_nop) === S.quy), tt: TT, ht: HT };
          const rows = CT.filter(c => S.nhom === "all" || c.nhom === S.nhom);
          const nhoms = S.nhom === "all" ? Object.keys(CANCU) : [S.nhom];
          cc.render(nhoms.map(n => ui.cancu(CANCU[n][0], CANCU[n][1])));
          const tinh = rows.map(c => { const r = c.local ? c.local(ctx) : null; return { c, r }; });
          const coSo = tinh.filter(x => x.r && x.r.v != null && isFinite(x.r.v) && x.c.so != null);
          const dat = coSo.filter(x => x.r.v >= x.c.so).length;
          tong.render(ui.readouts([{ k: "Chỉ tiêu đang xem", v: LAB.num(rows.length), kind: "key" }, { k: "Có số liệu đối chiếu của Phường", v: LAB.num(tinh.filter(x => x.r && x.r.text !== "—").length), kind: "pt" }, { k: "Đã đạt mức 2030 (" + S.quy + ")", v: dat + "/" + coSo.length, kind: dat === coSo.length && coSo.length ? "ok" : "eve", big: true }, { k: "Khoảng cách TB (điểm %)", v: coSo.length ? LAB.num(LAB.stat.mean(coSo.map(x => Math.max(0, x.c.so - x.r.v))), 1) : "—", kind: "aqua" }]));
          S.chart = coSo.length ? { labels: coSo.map(x => x.c.ct.length > 26 ? x.c.ct.slice(0, 26) + "…" : x.c.ct), series: [{ name: "Chỉ tiêu 2030", color: "key", values: coSo.map(x => x.c.so) }, { name: "Phường Mẫu " + S.quy, color: "pt", values: coSo.map(x => +x.r.v.toFixed(1)) }], ylabel: "%", ymax: 100, fmtY: v => v + " %", fmtTip: v => LAB.pc(v), title: "Chỉ tiêu 2030 so với hiện trạng Phường Mẫu (chỉ các chỉ tiêu có số liệu đối chiếu)", aspect: 0.42 } : null;
          box.style.display = S.chart ? "" : "none"; box.draw();
          bang.render(ui.title("Bảng đối chiếu", "mức 2030 đúng con số trong CANCU; hiện trạng tính từ dữ liệu Phường Mẫu quý " + S.quy),
            ui.table(["Nhóm", "Chỉ tiêu đến 2030", "Mức", "Nguồn", "Hiện trạng Phường Mẫu", "Khoảng cách", "Ước đạt (theo đà KPI)"],
              tinh.map(({ c, r }) => {
                const coV = r && r.v != null && isFinite(r.v) && c.so != null;
                const kind = !coV ? "mut" : r.v >= c.so ? "ok" : r.v >= 0.8 * c.so ? "key" : "eve";
                return [c.nhom, c.ct, h("b", null, c.muc), h("span", { class: "small" }, c.nguon),
                  r ? h("div", { class: "stack", style: { gap: "2px" } }, h("b", null, r.text), h("span", { class: "small", style: { color: "var(--faint)" } }, r.ghi)) : h("span", { class: "small", style: { color: "var(--faint)" } }, "Chỉ tiêu quốc gia — không có số liệu cấp xã"),
                  coV ? ui.bar({ value: r.v, max: c.so, kind, text: LAB.pc(r.v) + " / " + c.so + " %" }) : "—",
                  coV ? uocDat(r.col, r.v, c.so) : "—"];
              }), { cls: "wrap", rowCls: (row, i) => { const x = tinh[i]; return x.r && x.r.v != null && x.c.so != null ? (x.r.v >= x.c.so ? "good" : null) : null; } }));
        }
        draw(); pane.appendChild(root);
      } },
  ]
});
})();
