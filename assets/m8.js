/* Phòng mô phỏng Chính phủ số — Mô-đun m8: Buổi 8 (gộp Bài 9 "Quản trị thực thi và đo lường" + Bài 10 "Xây dựng chiến lược tại đơn vị").
   Sáu tab: bảng điều khiển KPI theo quý; đo đầu ra hay đo kết quả; lập khung KPI; năng lực số của cán bộ;
   ma trận tác động – khả thi; mẫu Kế hoạch chuyển đổi số 2026–2030 kèm rubric.
   Dữ liệu: LAB.data.kpi, LAB.data.khao_sat, LAB.data.ho_so, LAB.data.he_thong (giả lập, UBND Phường Mẫu). */
(function () { "use strict";
const { h, ui, chart } = LAB;

/* ============================ dùng chung ============================ */
const KPI = LAB.data.kpi || [];
const LAST = KPI[KPI.length - 1] || {};
const CUNGKY = KPI[KPI.length - 5] || {};          /* cùng kỳ năm trước (4 quý trước) */
const QUY2CAP = "2025-Q3";                          /* chính quyền địa phương 2 cấp từ 01/7/2025 */
const qLabel = q => { const m = /^(\d{4})-Q(\d)$/.exec(q || ""); return m ? "Q" + m[2] + "/" + m[1].slice(2) : String(q); };
/* danh mục chỉ số trong LAB.data.kpi: mục tiêu 2030 chỉ ghi khi có căn cứ trong CANCU; hài lòng quy đổi 99 % → 4,95/5 là GIẢ ĐỊNH */
const CHISO = [
  { key: "ty_le_ho_so_truc_tuyen_pct", ten: "Hồ sơ nộp trực tuyến", dv: "%", tot: "tang", muc: null, cc: "" },
  { key: "ty_le_ho_so_toan_trinh_pct", ten: "Hồ sơ toàn trình", dv: "%", tot: "tang", muc: 90, cc: "NQ 71/NQ-CP (01/4/2025): DVC trực tuyến toàn trình 90 % vào 2030" },
  { key: "ty_le_dung_han_pct", ten: "Hồ sơ đúng hạn", dv: "%", tot: "tang", muc: null, cc: "" },
  { key: "ty_le_thanh_toan_truc_tuyen_pct", ten: "Thanh toán trực tuyến", dv: "%", tot: "tang", muc: null, cc: "" },
  { key: "ty_le_ket_qua_so_hoa_pct", ten: "Kết quả được số hoá", dv: "%", tot: "tang", muc: 100, cc: "QĐ 1266/QĐ-TTg (14/7/2026): 100 % hồ sơ, kết quả giải quyết TTHC được số hoá" },
  { key: "diem_hai_long_tren_5", ten: "Điểm hài lòng", dv: "điểm/5", tot: "tang", muc: 4.95, cc: "QĐ 1266/QĐ-TTg: 99 % hài lòng — quy đổi giả định 99 % × 5 = 4,95/5" },
  { key: "ty_le_can_bo_co_chu_ky_so_pct", ten: "Cán bộ có chữ ký số", dv: "%", tot: "tang", muc: 100, cc: "Mục tiêu của đơn vị quy từ QĐ 1266/QĐ-TTg (trên 70 % dân số từ 18 tuổi có chữ ký số)" },
  { key: "so_su_co_attt", ten: "Sự cố an toàn thông tin", dv: "sự cố/quý", tot: "giam", muc: 0, cc: "Mục tiêu của đơn vị (không có mốc quốc gia)" },
  { key: "ty_le_can_bo_hoan_thanh_boi_duong_pct", ten: "Cán bộ hoàn thành bồi dưỡng", dv: "%", tot: "tang", muc: 100, cc: "Mục tiêu của đơn vị quy từ QĐ 1266/QĐ-TTg (10 triệu lượt người lao động được đào tạo kỹ năng số)" },
  { key: "so_lan_di_lai_tb_moi_ho_so", ten: "Số lần đi lại mỗi hồ sơ", dv: "lần", tot: "giam", muc: null, cc: "" },
];
const csByKey = k => CHISO.find(c => c.key === k);
const fmtVal = (c, v) => v == null || v === "" || !isFinite(+v) ? "—" : c.dv === "%" ? LAB.pc(v, 1) : c.dv === "điểm/5" ? LAB.num(v, 2) + "/5" : c.dv === "lần" ? LAB.num(v, 2) : LAB.num(v, 0);
const mucText = c => c.muc == null ? "—" : fmtVal(c, c.muc);
const KYNANG = LAB.data.ky_nang || [];
const TEN_KN = { su_dung_he_thong_mot_cua: "Sử dụng hệ thống một cửa", ky_so_van_ban: "Ký số văn bản", xu_ly_van_ban_dien_tu: "Xử lý văn bản điện tử", khai_thac_csdl_quoc_gia: "Khai thác CSDL quốc gia", bao_mat_thong_tin: "Bảo mật thông tin", dung_tro_ly_ao_ai: "Dùng trợ lý ảo AI", phan_tich_so_lieu: "Phân tích số liệu", huong_dan_nguoi_dan_dvctt: "Hướng dẫn người dân DVC trực tuyến" };
const tenKN = k => TEN_KN[k] || k;
/* ô nhập nhỏ đặt trong bảng (không nằm trong .fld nên tự tô kiểu bằng biến màu) */
function inp(o) {
  const e = h("input", { type: o.type || "text", placeholder: o.placeholder || null, title: o.title || null, min: o.min, max: o.max, step: o.step,
    style: { width: (o.w || 90) + "px", maxWidth: "100%", background: o.auto ? "var(--pt-bg)" : "var(--sunk)", border: "1px " + (o.auto ? "dashed var(--pt)" : "solid var(--line)"), borderRadius: "5px", padding: "4px 6px", color: "var(--ink)", fontFamily: "var(--f-mono)", fontSize: "12.5px" } });
  e.value = o.value == null ? "" : o.value;
  if (o.onInput) e.addEventListener("input", () => o.onInput(e.value, e));
  return e;
}
function selEl(options, value, onChange) {
  const s = h("select", { style: { background: "var(--sunk)", border: "1px solid var(--line)", borderRadius: "5px", padding: "4px 6px", color: "var(--ink)", fontSize: "12.5px" } },
    options.map(op => { const [v, l] = Array.isArray(op) ? op : [op, op]; const e = h("option", { value: v }, l); if (String(v) === String(value)) e.selected = true; return e; }));
  s.addEventListener("change", () => onChange(s.value)); return s;
}
const tagMuc = m => ui.tag(m, m === "Đầu vào" ? "mut" : m === "Đầu ra" ? "pt" : m === "Kết quả" ? "ok" : "ct");
const CANCU_1266 = () => ui.cancu("Quyết định 1266/QĐ-TTg ngày 14/7/2026 của Thủ tướng Chính phủ", "Chiến lược quốc gia về chuyển đổi số giai đoạn 2026–2030, định hướng đến 2045. Đến 2030: <b>100 %</b> hồ sơ, kết quả giải quyết TTHC được số hoá; <b>99 %</b> người dân, doanh nghiệp hài lòng khi dùng dịch vụ công trực tuyến; <b>100 %</b> bộ, ngành, địa phương dùng thống nhất nền tảng số dùng chung; <b>trên 70 %</b> dân số từ 18 tuổi có chữ ký số; <b>10 triệu</b> lượt người lao động được đào tạo kỹ năng số cơ bản.");

LAB.module({
  id: "m8",
  tabs: [
    /* ============================ TAB 1: BẢNG ĐIỀU KHIỂN KPI ============================ */
    { id: "bangkpi", title: "Bảng điều khiển KPI Phường Mẫu",
      intro: "Mười chỉ số chuyển đổi số của UBND Phường Mẫu theo quý (2024-Q1 → 2026-Q3, dữ liệu giả lập). Chọn 1–3 chỉ số để xem xu hướng, mốc chính quyền 2 cấp (01/7/2025) và khoảng cách tới mục tiêu 2030 theo Quyết định 1266/QĐ-TTg, Nghị quyết 71/NQ-CP (Bài 9, phần Đo lường).",
      build(pane) {
        /* Tab 1: chọn chỉ số → biểu đồ đường theo quý, vạch dọc 2025-Q3, vạch ngang mục tiêu 2030, ô số đọc và nhận xét tự động */
        const S = { sel: ["ty_le_ket_qua_so_hoa_pct", "ty_le_ho_so_toan_trinh_pct"], truc: "goc", mt: true };
        const { root, ctrl, view } = ui.sim();
        const msg = ui.slot();
        const tiles = ui.tiles({ items: CHISO.map(c => ({ id: c.key, title: c.ten, sub: c.dv + (c.muc != null ? " · đích 2030: " + mucText(c) : "") })), value: S.sel, multi: true, cls: "narrow",
          onChange: v => { if (!v.length || v.length > 3) { tiles.set(S.sel); msg.render(ui.note(v.length ? "Chỉ chọn tối đa 3 chỉ số để biểu đồ còn đọc được." : "Cần chọn ít nhất một chỉ số.", "eve")); return; } S.sel = v; msg.render(); draw(); } });
        ctrl.append(
          h("div", { class: "fld" }, h("label", null, h("b", null, "Chọn 1–3 chỉ số")), tiles), msg,
          ui.seg({ id: "m8bk-truc", label: "Trục tung", options: [["goc", "Giá trị gốc"], ["pct", "% so với mục tiêu 2030"]], value: S.truc, onChange: v => { S.truc = v; draw(); } }),
          ui.check({ id: "m8bk-mt", label: "Vẽ vạch mục tiêu 2030", value: S.mt, onChange: v => { S.mt = v; draw(); } }),
          ui.presets([
            { label: "Ba chỉ tiêu QĐ 1266", apply: () => { S.sel = ["ty_le_ket_qua_so_hoa_pct", "diem_hai_long_tren_5", "ty_le_can_bo_co_chu_ky_so_pct"]; tiles.set(S.sel); S.truc = "pct"; draw(); } },
            { label: "Phục vụ người dân", apply: () => { S.sel = ["ty_le_ho_so_truc_tuyen_pct", "ty_le_dung_han_pct", "so_lan_di_lai_tb_moi_ho_so"]; tiles.set(S.sel); S.truc = "goc"; draw(); } },
            { label: "Nhân lực và an toàn", apply: () => { S.sel = ["ty_le_can_bo_hoan_thanh_boi_duong_pct", "so_su_co_attt"]; tiles.set(S.sel); S.truc = "goc"; draw(); } },
          ]),
          ui.btn("Làm lại", () => { S.sel = ["ty_le_ket_qua_so_hoa_pct", "ty_le_ho_so_toan_trinh_pct"]; tiles.set(S.sel); S.truc = "goc"; S.mt = true; draw(); }, "sm"),
          ui.cancu("Nghị quyết 71/NQ-CP ngày 01/4/2025 của Chính phủ", "Cập nhật Chương trình hành động thực hiện Nghị quyết 57-NQ/TW: dịch vụ công trực tuyến <b>toàn trình đạt 90 %</b> vào năm 2030."),
          ui.note("Mục tiêu <b>4,95/5</b> cho điểm hài lòng là quy đổi <b>giả định</b> từ chỉ tiêu 99 % (99 % × 5). Chỉ số không có mốc quốc gia thì đơn vị tự đặt mục tiêu và ghi rõ là mục tiêu của đơn vị.", "mut"));
        const ro = ui.slot(), nx = ui.slot(), tb = ui.slot();
        const box = chart.box(b => chart.line(b, S.chart));
        view.append(ro, box, nx, ui.title("Toàn bộ số liệu theo quý", "dòng tô màu: quý bắt đầu chính quyền 2 cấp"), tb);
        const cols = ["pt", "ct", "key"];
        function draw() {
          const sel = S.sel.map(csByKey);
          const pctMode = S.truc === "pct";
          const bo = [];
          const series = []; const hl = [];
          sel.forEach((c, i) => {
            if (pctMode && (c.muc == null || c.tot !== "tang" || !c.muc)) { bo.push(c.ten); return; }
            series.push({ name: c.ten + (pctMode ? " (% mục tiêu)" : " (" + c.dv + ")"), color: cols[i], marker: true, points: KPI.map((r, j) => [j, pctMode ? 100 * r[c.key] / c.muc : +r[c.key]]) });
            if (S.mt && c.muc != null && !pctMode) hl.push({ y: c.muc, label: "Đích 2030 · " + c.ten + ": " + mucText(c), color: LAB.colors()[cols[i]] });
          });
          if (pctMode && S.mt && series.length) hl.push({ y: 100, label: "Đạt mục tiêu 2030 (100 %)" });
          const allPct = sel.every(c => c.dv === "%");
          S.chart = { series, xticks: KPI.map((_, j) => j), fmtX: j => qLabel((KPI[j] || {}).quy), fmtY: v => pctMode || allPct ? LAB.num(v, 0) + " %" : LAB.num(v, v < 10 ? 1 : 0), fmtTip: v => LAB.num(v, 2),
            ymin: 0, ymax: pctMode ? 110 : allPct ? 100 : undefined, ylabel: pctMode ? "% so với mục tiêu 2030" : allPct ? "%" : "giá trị", xlabel: "Quý",
            vlines: [{ x: KPI.findIndex(r => r.quy === QUY2CAP), label: "01/7/2025 · chính quyền 2 cấp", color: LAB.colors().eve }], hlines: hl, aspect: 0.5, title: "Diễn biến theo quý (UBND Phường Mẫu, giả lập)" };
          box.draw();
          /* ô số đọc: quý gần nhất và thay đổi so với cùng kỳ */
          const items = [];
          sel.forEach((c, i) => { const v = +LAST[c.key], p = +CUNGKY[c.key], d = v - p; const tot = c.tot === "tang" ? d >= 0 : d <= 0;
            items.push({ k: c.ten + " · " + qLabel(LAST.quy), v: fmtVal(c, v), kind: cols[i], big: true },
              { k: "So với cùng kỳ " + qLabel(CUNGKY.quy), v: (d >= 0 ? "+" : "−") + fmtVal(c, Math.abs(d)).replace("/5", ""), kind: tot ? "ok" : "eve" }); });
          ro.render(ui.readouts(items), bo.length ? ui.note("Không vẽ ở chế độ % mục tiêu (không có mốc quốc gia hoặc là chỉ số càng thấp càng tốt): " + bo.join("; ") + ".", "eve") : null);
          /* nhận xét tự động */
          const xa = CHISO.filter(c => c.muc != null && c.tot === "tang").map(c => ({ c, rel: (c.muc - LAST[c.key]) / c.muc })).sort((a, b) => b.rel - a.rel);
          const tangNhieu = CHISO.filter(c => c.tot === "tang").map(c => ({ c, d: LAST[c.key] - CUNGKY[c.key] })).sort((a, b) => b.d - a.d)[0];
          const i2 = KPI.findIndex(r => r.quy === QUY2CAP); const c0 = sel[0];
          const tocDo = (a, b) => (KPI[b][c0.key] - KPI[a][c0.key]) / (b - a);
          const truoc = tocDo(0, i2 - 1), sau = tocDo(i2 - 1, KPI.length - 1);
          const lis = [
            h("li", null, "Chỉ số xa mục tiêu 2030 nhất: ", h("b", null, xa[0].c.ten), " — hiện " + fmtVal(xa[0].c, LAST[xa[0].c.key]) + ", đích " + mucText(xa[0].c) + " (còn thiếu " + LAB.pc(100 * xa[0].rel, 1) + " của đích). Căn cứ: " + xa[0].c.cc + "."),
            h("li", null, "Tiến bộ nhiều nhất so với cùng kỳ: ", h("b", null, tangNhieu.c.ten), " (+" + fmtVal(tangNhieu.c, tangNhieu.d).replace("/5", "") + ")."),
            h("li", null, "Với ", h("b", null, c0.ten), ": tốc độ thay đổi bình quân mỗi quý trước 01/7/2025 là " + LAB.num(truoc, 2) + ", sau đó là " + LAB.num(sau, 2) + " " + (c0.dv === "%" ? "điểm %" : c0.dv) + "/quý" + (Math.abs(sau) > Math.abs(truoc) ? " — nhanh hơn sau khi vận hành chính quyền 2 cấp." : " — chậm lại sau khi vận hành chính quyền 2 cấp; cần xem nguyên nhân.")),
            h("li", null, "Sự cố an toàn thông tin quý gần nhất: " + LAB.num(LAST.so_su_co_attt) + "; số lần đi lại mỗi hồ sơ: " + LAB.num(LAST.so_lan_di_lai_tb_moi_ho_so, 2) + " lần (càng thấp càng tốt — đây là chỉ số đo từ phía người dân)."),
          ];
          nx.render(ui.panel("Nhận xét tự động từ số liệu", h("ul", { class: "small", style: { margin: 0, paddingLeft: "18px" } }, lis)));
          tb.render(ui.table(["Quý", ...CHISO.map(c => c.ten + " (" + c.dv + ")")], KPI.map(r => [r.quy, ...CHISO.map(c => ({ html: fmtVal(c, r[c.key]).replace("/5", ""), cls: "r" }))]), { mono: true, cls: "tight", rowCls: r => r[0] === QUY2CAP ? "hi" : null }));
        }
        draw(); pane.appendChild(root);
      } },

    /* ============================ TAB 2: ĐO ĐẦU RA HAY ĐO KẾT QUẢ ============================ */
    { id: "dauravaketqua", title: "Đo đầu ra hay đo kết quả",
      intro: "Bốn mức đo lường theo Bài 9: đầu vào – đầu ra – kết quả – tác động. Xếp 12 chỉ tiêu vào đúng mức, đối chiếu bảng \"cùng một việc, hai cách đo\" và nhận diện bệnh thành tích.",
      build(pane) {
        /* Tab 2: bài tập xếp 12 chỉ tiêu vào 4 mức, chấm điểm, lưu và tải CSV */
        const MUC = ["Đầu vào", "Đầu ra", "Kết quả", "Tác động"];
        const BT = [
          { t: "Số lớp tập huấn kỹ năng số đã mở", m: 1, g: "Đếm việc cơ quan đã làm; chưa cho biết cán bộ có làm được việc hay không." },
          { t: "Số máy tính, máy quét đã mua cho Bộ phận Một cửa", m: 0, g: "Thiết bị đã bỏ ra là nguồn lực đầu vào." },
          { t: "Tỉ lệ hồ sơ trễ hạn giảm so với năm trước", m: 2, g: "Thay đổi thật trong việc giải quyết hồ sơ cho người dân." },
          { t: "Số thủ tục hành chính đã đưa lên Cổng Dịch vụ công quốc gia", m: 1, g: "Số thủ tục đã đưa lên là sản phẩm của cơ quan, chưa chắc người dân dùng." },
          { t: "Điểm hài lòng của người dân khi dùng dịch vụ công trực tuyến", m: 3, g: "Cảm nhận của người dân là tác động cuối cùng (slide: \"người dân hài lòng hơn\")." },
          { t: "Kinh phí đã chi thuê dịch vụ công nghệ thông tin trong năm", m: 0, g: "Tiền đã bỏ ra là đầu vào." },
          { t: "Tỉ lệ hồ sơ do người dân tự nộp trực tuyến thành công", m: 2, g: "Đo người dân thực sự tự nộp, không phải cán bộ nhập hộ." },
          { t: "Số lượt đi lại người dân tiết kiệm được mỗi năm", m: 3, g: "Chi phí xã hội giảm là tác động." },
          { t: "Số cán bộ đã được cấp chữ ký số", m: 1, g: "Đã cấp là đầu ra; có dùng để ký không mới là kết quả." },
          { t: "Tỉ lệ văn bản đi được ký số trên tổng số văn bản", m: 2, g: "Chữ ký số được dùng thật trong công việc." },
          { t: "Số hồ sơ giấy đã quét (số hoá)", m: 1, g: "Số hồ sơ đã quét là đầu ra; tỉ lệ tái dùng dữ liệu đã số hoá mới là kết quả." },
          { t: "Số công chức được phân công theo dõi chuyển đổi số", m: 0, g: "Con người bố trí cho việc là đầu vào." },
        ];
        const KEY = "m8.dauravaketqua";
        const sv = LAB.store.get(KEY, {});
        const S = { hoten: sv.hoten || "", tl: Array.isArray(sv.tl) && sv.tl.length === BT.length ? sv.tl : BT.map(() => -1), cham: !!sv.cham };
        const { root, ctrl, view } = ui.sim();
        const save = () => LAB.store.set(KEY, S);
        ctrl.append(
          ui.field({ id: "m8dr-hoten", label: "Họ tên học viên", value: S.hoten, onInput: v => { S.hoten = v; save(); } }),
          ui.steps([{ t: "<b>Đầu vào</b> — bao nhiêu tiền, bao nhiêu người, bao nhiêu thiết bị đã bỏ ra" }, { t: "<b>Đầu ra</b> — bao nhiêu dịch vụ đã đưa lên trực tuyến, bao nhiêu phần mềm đã xong" }, { t: "<b>Kết quả</b> — bao nhiêu người dân thực sự nộp trực tuyến, thời gian giải quyết giảm bao nhiêu", hi: true }, { t: "<b>Tác động</b> — người dân hài lòng hơn, chi phí xã hội giảm, niềm tin với cơ quan nhà nước tăng", hi: true }]),
          ui.note("Báo cáo chỉ dừng ở đầu vào và đầu ra là báo cáo nửa vời. <b>Đầu ra là phương tiện; kết quả mới là mục đích.</b>", "key"),
          h("div", { class: "row" },
            ui.btn("Chấm điểm", () => { S.cham = true; save(); draw(); }, "pri"),
            ui.btn("Làm lại", () => { S.tl = BT.map(() => -1); S.cham = false; save(); draw(); }, "sm"),
            ui.btn("Tải CSV", () => LAB.csv.download("m8_bon_muc_do_luong.csv", ["ho_ten", "chi_tieu", "muc_da_chon", "muc_dung", "ket_qua"], BT.map((b, i) => [S.hoten, b.t, S.tl[i] >= 0 ? MUC[S.tl[i]] : "", MUC[b.m], S.tl[i] === b.m ? "Đúng" : "Sai"])), "sm")),
          ui.presets([{ label: "Ví dụ: xếp 3 chỉ tiêu đầu", apply: () => { S.tl = BT.map(() => -1); [0, 1, 2].forEach(i => { S.tl[i] = BT[i].m; }); S.cham = false; save(); draw(); } }], "Ví dụ mẫu"),
          CANCU_1266());
        const out = ui.slot(), kq = ui.slot();
        view.append(out, kq,
          ui.title("Cùng một việc, hai cách đo", "theo slide Bài 9"),
          ui.table(["Việc", "Đo đầu ra", "Đo kết quả"], [
            ["Dịch vụ công trực tuyến", "Số thủ tục đã đưa lên", { html: "Tỉ lệ hồ sơ nộp trực tuyến thành công", cls: "mono" }],
            ["Số hoá hồ sơ", "Số hồ sơ đã quét", { html: "Tỉ lệ hồ sơ tái dùng được dữ liệu đã số hoá", cls: "mono" }],
            ["Chữ ký số", "Số chữ ký số đã cấp", { html: "Tỉ lệ văn bản được ký số trên tổng số", cls: "mono" }],
            ["Đào tạo kỹ năng số", "Số lượt cán bộ đi học", { html: "Tỉ lệ cán bộ tự xử lý hồ sơ trên mạng", cls: "mono" }],
            ["Nền tảng dùng chung", "Số nền tảng đã kết nối", { html: "Tỉ lệ giao dịch đi qua nền tảng đó", cls: "mono" }]], { cls: "wrap" }),
          ui.panel("Vì sao chỉ đo đầu ra sinh bệnh thành tích",
            ui.note("<b>Tình huống thảo luận (Bài 9):</b> UBND Phường Mẫu báo cáo đã đưa 100 % thủ tục hành chính lên trực tuyến, nhưng cả năm chỉ có 7 % hồ sơ do người dân tự nộp; phần còn lại do cán bộ Một cửa nhập hộ. Con số 100 % là <b>đầu ra</b>; 7 % mới là <b>kết quả</b>.", "eve"),
            h("div", { class: "cols" },
              h("div", null, h("b", null, "Cơ chế sinh bệnh"), h("ul", { class: "small", style: { margin: "4px 0 0", paddingLeft: "18px" } }, h("li", null, "Chỉ tiêu dễ đạt thì ai cũng đạt; báo cáo đẹp nhưng thực tế không đổi"), h("li", null, "Cán bộ nhập hộ hồ sơ cho người dân để đủ tỉ lệ trực tuyến"), h("li", null, "Cấp trên khen theo con số, cấp dưới tối ưu con số thay vì tối ưu việc"))),
              h("div", null, h("b", null, "Ba cách phòng"), h("ul", { class: "small", style: { margin: "4px 0 0", paddingLeft: "18px" } }, h("li", null, "Mỗi chỉ tiêu đầu ra đi kèm ít nhất một chỉ tiêu kết quả"), h("li", null, "Nguồn số liệu lấy tự động từ hệ thống, không lấy từ báo cáo tay"), h("li", null, "Có một chỉ tiêu lấy từ phía người dân, ví dụ mức độ hài lòng")))),
            ui.note("DTI đo việc làm, PAR Index đo cải cách, SIPAS đo cảm nhận người dân. DTI theo Quyết định 405/QĐ-BKHCN ngày 03/4/2025: ba cấp (tỉnh, bộ, quốc gia), thang <b>1.000 điểm</b>; cấp tỉnh gồm 3 trụ cột chính quyền số – kinh tế số – xã hội số, <b>8 chỉ số chính, 47 chỉ số thành phần</b>.", "mut")));
        function draw() {
          const rows = BT.map((b, i) => {
            const chon = S.tl[i]; const dung = chon === b.m;
            return [String(i + 1), b.t, selEl([[-1, "— chọn mức —"], ...MUC.map((m, k) => [k, m])], chon, v => { S.tl[i] = +v; S.cham = false; save(); draw(); }),
              S.cham ? h("span", null, ui.tag(dung ? "Đúng" : "Sai → " + MUC[b.m], dung ? "ok" : "eve"), " ", h("span", { class: "small" }, b.g)) : (chon >= 0 ? tagMuc(MUC[chon]) : "")];
          });
          const soDung = BT.filter((b, i) => S.tl[i] === b.m).length, daChon = S.tl.filter(v => v >= 0).length;
          const dem = MUC.map((m, k) => S.tl.filter(v => v === k).length);
          const sc = ui.score(S.cham ? soDung : daChon, S.cham ? "đúng / 12" : "đã xếp / 12", 12); if (S.cham) sc.classList.add(soDung >= 9 ? "ok" : soDung >= 6 ? "" : "eve");
          out.render(h("div", { class: "row", style: { alignItems: "flex-start" } }, sc, h("div", { class: "stack", style: { flex: "1 1 240px" } },
            ui.readouts(MUC.map((m, k) => ({ k: "Xếp vào " + m, v: LAB.num(dem[k]), kind: ["mut", "pt", "ok", "ct"][k] }))),
            S.cham ? ui.note(soDung === 12 ? "Xuất sắc: phân biệt đúng cả bốn mức." : soDung >= 9 ? "Tốt. Xem lại các dòng Sai: ranh giới hay nhầm nhất là giữa đầu ra (việc cơ quan đã làm) và kết quả (thay đổi phía người dân)." : "Cần ôn lại: đầu vào là thứ bỏ ra, đầu ra là thứ cơ quan làm xong, kết quả là thay đổi ở người dân, tác động là hệ quả lâu dài.", soDung >= 9 ? "ok" : "eve") : (daChon < 12 ? ui.note("Còn " + (12 - daChon) + " chỉ tiêu chưa xếp. Xếp xong bấm <b>Chấm điểm</b>.", "mut") : ui.note("Đã xếp đủ 12 chỉ tiêu. Bấm <b>Chấm điểm</b> để xem đáp án.", "key")))));
          kq.render(ui.table(["#", "Chỉ tiêu", "Mức đo", S.cham ? "Đáp án và giải thích" : "Đã chọn"], rows, { cls: "wrap" }));
        }
        draw(); pane.appendChild(root);
      } },

    /* ============================ TAB 3: LẬP KHUNG KPI ============================ */
    { id: "khungkpi", title: "Lập khung KPI cho đơn vị",
      intro: "Bài thực hành chính của Bài 9: chọn 8–10 chỉ tiêu từ thư viện, điền hiện tại – mục tiêu 2027 – mục tiêu 2030 – nguồn số liệu – người chịu trách nhiệm. Bộ kiểm tra chất lượng chấm theo bảy nguyên tắc chọn KPI. Giá trị hiện tại được gợi ý từ số liệu quý gần nhất của Phường Mẫu khi khớp.",
      build(pane) {
        /* Tab 3: thư viện KPI → chọn → bảng điền → kiểm tra chất lượng → lưu LAB.store, tải CSV; preset đúng bảng KPI mẫu của slide */
        const HS = LAB.data.ho_so || [], HT = LAB.data.he_thong || [];
        const hsQ = HS.filter(r => LAB.date.quy(r.ngay_nop) === LAST.quy);
        const hsTra = (hsQ.length ? hsQ : HS).filter(r => r.trang_thai === "Đã trả kết quả" && r.ngay_tra);
        const tgBQ = hsTra.length ? LAB.stat.mean(hsTra.map(r => LAB.date.workdays(r.ngay_nop, r.ngay_tra)).filter(v => v != null && v >= 0)) : NaN;
        const kpiV = (k, d) => isFinite(+LAST[k]) ? LAB.num(+LAST[k], d == null ? 1 : d).replace(".", "") : "";
        /* thư viện ~26 KPI: id, tên, mức, đơn vị, nguồn gợi ý, chỉ tiêu quốc gia liên kết, gợi ý hiện tại từ dữ liệu, cờ "đo từ phía người dân" */
        const LIB = [
          { id: "so_hoa", ten: "Hồ sơ, kết quả giải quyết TTHC được số hoá", muc: "Đầu ra", dv: "%", nguon: "Hệ thống một cửa", qg: "QĐ 1266: 100 %", goiy: () => kpiV("ty_le_ket_qua_so_hoa_pct"), g30: "100" },
          { id: "toan_trinh", ten: "Hồ sơ nộp trực tuyến toàn trình", muc: "Kết quả", dv: "%", nguon: "Cổng DVC quốc gia", qg: "NQ 71: 90 %", goiy: () => kpiV("ty_le_ho_so_toan_trinh_pct"), g30: "90" },
          { id: "tu_nop", ten: "Hồ sơ do người dân tự nộp trực tuyến thành công", muc: "Kết quả", dv: "%", nguon: "Cổng DVC quốc gia (tài khoản người nộp)", qg: "", goiy: () => kpiV("ty_le_ho_so_truc_tuyen_pct"), dan: true },
          { id: "hai_long", ten: "Người dân hài lòng khi dùng dịch vụ công trực tuyến", muc: "Tác động", dv: "%", nguon: "Khảo sát, SIPAS", qg: "QĐ 1266: 99 %", goiy: () => isFinite(+LAST.diem_hai_long_tren_5) ? LAB.num(20 * LAST.diem_hai_long_tren_5, 0) : "", gy: "quy đổi giả định từ điểm/5 × 20", g30: "99", dan: true },
          { id: "thoi_gian", ten: "Thời gian giải quyết bình quân", muc: "Kết quả", dv: "ngày", nguon: "Hệ thống một cửa", qg: "", goiy: () => isFinite(tgBQ) ? LAB.num(tgBQ, 1) : "", gy: "tính từ sổ hồ sơ (ngày làm việc) quý gần nhất", dan: true },
          { id: "dung_han", ten: "Hồ sơ giải quyết đúng hạn", muc: "Kết quả", dv: "%", nguon: "Hệ thống một cửa", qg: "", goiy: () => kpiV("ty_le_dung_han_pct") },
          { id: "di_lai", ten: "Số lần đi lại trung bình mỗi hồ sơ", muc: "Tác động", dv: "lần", nguon: "Khảo sát người nộp hồ sơ", qg: "", goiy: () => kpiV("so_lan_di_lai_tb_moi_ho_so", 2), dan: true },
          { id: "thanh_toan", ten: "Hồ sơ thanh toán phí trực tuyến", muc: "Kết quả", dv: "%", nguon: "Cổng DVC quốc gia (thanh toán)", qg: "", goiy: () => kpiV("ty_le_thanh_toan_truc_tuyen_pct") },
          { id: "ky_so_vb", ten: "Văn bản đi được ký số", muc: "Kết quả", dv: "%", nguon: "Quản lý văn bản", qg: "", goiy: () => "" },
          { id: "cks_cb", ten: "Cán bộ, công chức có chữ ký số cá nhân", muc: "Đầu ra", dv: "%", nguon: "Sổ cấp phát chữ ký số", qg: "QĐ 1266: trên 70 % dân số từ 18 tuổi", goiy: () => kpiV("ty_le_can_bo_co_chu_ky_so_pct"), g30: "100" },
          { id: "ky_nang_co_ban", ten: "Cán bộ có kỹ năng số cơ bản (hoàn thành bồi dưỡng)", muc: "Đầu ra", dv: "%", nguon: "Sổ theo dõi đào tạo", qg: "QĐ 1266: 10 triệu lượt đào tạo kỹ năng số", goiy: () => kpiV("ty_le_can_bo_hoan_thanh_boi_duong_pct"), g30: "100" },
          { id: "tu_xu_ly", ten: "Cán bộ tự xử lý hồ sơ trên mạng, không nhờ người khác", muc: "Kết quả", dv: "%", nguon: "Bài kiểm tra thao tác", qg: "", goiy: () => "" },
          { id: "nen_tang_chung", ten: "Dùng nền tảng số dùng chung (thủ tục tiếp nhận qua Cổng DVC quốc gia)", muc: "Đầu ra", dv: "%", nguon: "Báo cáo kỹ thuật", qg: "QĐ 1266: 100 % dùng nền tảng dùng chung", goiy: () => "", g30: "100" },
          { id: "trung_cn", ten: "Hệ thống trùng chức năng còn tồn tại", muc: "Đầu ra", dv: "hệ thống", nguon: "Kiểm kê hệ thống thông tin", qg: "", goiy: () => String(HT.filter(r => r.tinh_trang === "Trùng chức năng").length), gy: "đếm từ bảng kiểm kê" },
          { id: "cap_do_attt", ten: "Hệ thống đã xác định cấp độ an toàn thông tin", muc: "Đầu ra", dv: "%", nguon: "Kiểm kê hệ thống thông tin", qg: "", goiy: () => HT.length ? LAB.num(100 * LAB.stat.rate(HT, r => +r.cap_do_attt_da_xac_dinh > 0), 0) : "", gy: "tính từ bảng kiểm kê" },
          { id: "su_co", ten: "Sự cố an toàn thông tin mỗi quý", muc: "Kết quả", dv: "sự cố", nguon: "Nhật ký sự cố", qg: "", goiy: () => kpiV("so_su_co_attt", 0) },
          { id: "chi_cds", ten: "Chi cho chuyển đổi số trên tổng chi", muc: "Đầu vào", dv: "%", nguon: "Dự toán đơn vị", qg: "NQ 57: ít nhất 3 % tổng chi ngân sách cho KH&CN", goiy: () => "", g30: "≥3" },
          { id: "lop_th", ten: "Số lớp tập huấn kỹ năng số đã mở", muc: "Đầu ra", dv: "lớp", nguon: "Sổ theo dõi đào tạo", qg: "", goiy: () => "" },
          { id: "bdhvs", ten: "Lượt cán bộ tham gia Bình dân học vụ số", muc: "Đầu ra", dv: "lượt", nguon: "Nền tảng học trực tuyến", qg: "QĐ 1266: 10 triệu lượt đào tạo kỹ năng số", goiy: () => "" },
          { id: "thiet_bi", ten: "Máy tính, máy quét trang bị cho Bộ phận Một cửa", muc: "Đầu vào", dv: "bộ", nguon: "Sổ tài sản", qg: "", goiy: () => "" },
          { id: "kinh_phi_thue", ten: "Kinh phí thuê dịch vụ công nghệ thông tin hằng năm", muc: "Đầu vào", dv: "triệu đồng", nguon: "Dự toán, hợp đồng thuê", qg: "", goiy: () => HT.length ? LAB.num(LAB.stat.sum(HT.map(r => r.chi_phi_nam_trieu_dong)), 0) : "", gy: "tổng chi phí năm trong bảng kiểm kê" },
          { id: "tai_dung", ten: "Hồ sơ tái dùng dữ liệu đã số hoá, không yêu cầu nộp lại giấy tờ", muc: "Kết quả", dv: "%", nguon: "Hệ thống một cửa", qg: "", goiy: () => "" },
          { id: "bo_sung", ten: "Hồ sơ phải yêu cầu bổ sung", muc: "Kết quả", dv: "%", nguon: "Hệ thống một cửa", qg: "", goiy: () => hsQ.length ? LAB.num(100 * LAB.stat.rate(hsQ, r => +r.so_lan_bo_sung > 0), 1) : "", gy: "tính từ sổ hồ sơ quý gần nhất" },
          { id: "du_lieu_sach", ten: "Bản ghi dữ liệu dân cư đã làm sạch", muc: "Đầu ra", dv: "%", nguon: "Báo cáo làm sạch dữ liệu", qg: "", goiy: () => "" },
          { id: "ho_tro", ten: "Lượt người dân được hướng dẫn tại điểm hỗ trợ", muc: "Đầu ra", dv: "lượt", nguon: "Sổ điểm hỗ trợ, tổ công nghệ số cộng đồng", qg: "", goiy: () => "" },
          { id: "tthc_online", ten: "Thủ tục đã đưa lên trực tuyến", muc: "Đầu ra", dv: "thủ tục", nguon: "Cổng DVC quốc gia", qg: "", goiy: () => "" },
        ];
        const lib = id => LIB.find(x => x.id === id);
        const MUC = ["Đầu vào", "Đầu ra", "Kết quả", "Tác động"];
        const KEY = "m8.khungkpi";
        const sv = LAB.store.get(KEY, {});
        const S = { hoten: sv.hoten || "", donvi: sv.donvi || "UBND Phường Mẫu", loc: "Tất cả", rows: Array.isArray(sv.rows) ? sv.rows.filter(r => lib(r.id)) : [] };
        const save = () => LAB.store.set(KEY, { hoten: S.hoten, donvi: S.donvi, rows: S.rows });
        const them = id => { if (S.rows.find(r => r.id === id)) { S.rows = S.rows.filter(r => r.id !== id); } else { const L = lib(id); const g = L.goiy(); S.rows.push({ id, hienTai: g, auto: !!g, m2027: "", m2030: L.g30 || "", nguon: L.nguon, nguoi: "" }); } save(); draw(); };
        const noiSuy = (a, b) => { const x = parseFloat(String(a).replace(",", ".")), y = parseFloat(String(b).replace(/[^\d.,]/g, "").replace(",", ".")); return isFinite(x) && isFinite(y) ? LAB.num(x + (y - x) * 3 / 7, 1) : ""; };
        const PRESET = [["so_hoa", "62", "100", "Hệ thống một cửa", "Chánh Văn phòng"], ["toan_trinh", "35", "90", "Cổng DVC quốc gia", "Bộ phận Một cửa"], ["hai_long", "84", "99", "Khảo sát, SIPAS", "Phó Chủ tịch"], ["ky_nang_co_ban", "70", "100", "Sổ theo dõi đào tạo", "Chánh Văn phòng"], ["ky_so_vb", "88", "100", "Quản lý văn bản", "Chánh Văn phòng"], ["nen_tang_chung", "40", "100", "Báo cáo kỹ thuật", "Công chức CĐS"], ["thoi_gian", "5,0", "2,5", "Hệ thống một cửa", "Trưởng bộ phận"], ["chi_cds", "1,8", "≥3", "Dự toán đơn vị", "Kế toán trưởng"]];
        const { root, ctrl, view } = ui.sim();
        const stt = ui.slot();
        ctrl.append(
          ui.field({ id: "m8kk-hoten", label: "Họ tên học viên", value: S.hoten, onInput: v => { S.hoten = v; save(); } }),
          ui.field({ id: "m8kk-donvi", label: "Tên đơn vị", value: S.donvi, onInput: v => { S.donvi = v; save(); } }),
          ui.seg({ id: "m8kk-loc", label: "Lọc thư viện theo mức đo", options: [["Tất cả", "Tất cả"], ...MUC.map(m => [m, m])], value: S.loc, onChange: v => { S.loc = v; draw(); } }),
          ui.presets([{ label: "Bảng KPI mẫu đã điền (UBND Phường Mẫu)", apply: () => { S.donvi = "UBND Phường Mẫu"; S.rows = PRESET.map(p => ({ id: p[0], hienTai: p[1], auto: false, m2027: noiSuy(p[1], p[2]), m2030: p[2], nguon: p[3], nguoi: p[4] })); save(); draw(); stt.render(ui.note("Đã nạp 8 dòng theo slide Bài 9 (cột \"Hiện tại\" là số giả định của phường mẫu). Mốc 2027 do công cụ nội suy tuyến tính — anh/chị tự điều chỉnh.", "key")); } }]),
          h("div", { class: "row" },
            ui.btn("Làm lại", () => { S.rows = []; save(); draw(); stt.render(); }, "sm"),
            ui.btn("Tải CSV", () => LAB.csv.download("m8_khung_kpi.csv", ["ho_ten", "don_vi", "chi_tieu", "muc_do", "don_vi_tinh", "hien_tai", "muc_tieu_2027", "muc_tieu_2030", "nguon_so_lieu", "chiu_trach_nhiem", "chi_tieu_quoc_gia"],
              S.rows.map(r => { const L = lib(r.id); return [S.hoten, S.donvi, L.ten, L.muc, L.dv, r.hienTai, r.m2027, r.m2030, r.nguon, r.nguoi, L.qg]; })), "sm pri")),
          stt,
          ui.panel("Bảy nguyên tắc chọn KPI (Bài 9)", h("ol", { class: "small", style: { margin: 0, paddingLeft: "18px" } },
            ["Đo được: có công thức rõ, hai người tính ra cùng một con số", "Có nguồn số liệu: nêu đích danh hệ thống hoặc sổ sách sẽ lấy số", "Gắn với chỉ tiêu quốc gia: ít nhất một phần ba bám mốc năm 2030", "Không quá 10 chỉ tiêu: nhiều hơn thì không ai theo dõi nổi", "Có cả đầu ra và kết quả, không chỉ đếm việc đã làm", "Có người chịu trách nhiệm: ghi chức danh, không ghi \"tập thể\"", "Có mốc trung gian cho từng năm, không chỉ đặt đích năm 2030"].map(x => h("li", null, x)))),
          CANCU_1266(),
          ui.cancu("Nghị quyết 57-NQ/TW ngày 22/12/2024 của Bộ Chính trị", "Bố trí <b>ít nhất 3 %</b> tổng chi ngân sách hằng năm cho phát triển khoa học, công nghệ; người đứng đầu trực tiếp phụ trách, chỉ đạo và chịu trách nhiệm về kết quả."));
        const thuVien = ui.slot(), bang = ui.slot(), kiem = ui.slot();
        view.append(ui.title("Thư viện chỉ tiêu gợi ý", "bấm để chọn / bỏ chọn; chọn 8–10 chỉ tiêu"), thuVien, ui.title("Khung KPI đã chọn", "ô viền đứt là giá trị gợi ý từ dữ liệu Phường Mẫu, sửa được"), bang, ui.title("Kiểm tra chất lượng khung"), kiem);
        function draw() {
          thuVien.render(h("div", null, LIB.filter(L => S.loc === "Tất cả" || L.muc === S.loc).map(L => h("span", { class: "pill" + (S.rows.find(r => r.id === L.id) ? " on" : ""), title: "Mức: " + L.muc + " · Đơn vị: " + L.dv + " · Nguồn: " + L.nguon + (L.qg ? " · " + L.qg : ""), onclick: () => them(L.id) }, L.ten, L.qg ? " ★" : ""))),
            h("div", { class: "small", style: { color: "var(--faint)" } }, "★ có chỉ tiêu quốc gia liên kết (QĐ 1266/QĐ-TTg, NQ 71/NQ-CP, NQ 57-NQ/TW)."));
          const rows = S.rows.map((r, i) => { const L = lib(r.id); const upd = (k, v) => { r[k] = v; if (k === "hienTai") r.auto = false; save(); kiemTra(); };
            return [String(i + 1), h("div", null, L.ten, " ", tagMuc(L.muc), L.qg ? h("div", { class: "small", style: { color: "var(--key)" } }, L.qg) : null), L.dv,
              h("div", null, inp({ value: r.hienTai, w: 70, auto: r.auto, title: r.auto ? "Gợi ý từ dữ liệu: " + (L.gy || "quý " + LAST.quy) : null, onInput: v => upd("hienTai", v) }), r.auto && L.gy ? h("div", { class: "small", style: { color: "var(--pt)" } }, L.gy) : null),
              inp({ value: r.m2027, w: 64, onInput: v => upd("m2027", v) }), inp({ value: r.m2030, w: 64, onInput: v => upd("m2030", v) }),
              inp({ value: r.nguon, w: 160, placeholder: "tên hệ thống / sổ", onInput: v => upd("nguon", v) }), inp({ value: r.nguoi, w: 140, placeholder: "chức danh", onInput: v => upd("nguoi", v) }),
              ui.btn("✕", () => them(r.id), "sm")]; });
          bang.render(S.rows.length ? ui.table(["#", "Chỉ tiêu", "Đơn vị", "Hiện tại", "2027", "2030", "Nguồn số liệu", "Chịu trách nhiệm", ""], rows, { cls: "wrap" }) : ui.note("Chưa chọn chỉ tiêu nào. Bấm vào thư viện ở trên hoặc nạp <b>Bảng KPI mẫu đã điền</b>.", "mut"));
          kiemTra();
        }
        function kiemTra() {
          const n = S.rows.length, Ls = S.rows.map(r => lib(r.id));
          const kq = Ls.filter(L => L.muc === "Kết quả" || L.muc === "Tác động").length, dv = Ls.filter(L => L.muc === "Đầu vào").length, qg = Ls.filter(L => L.qg).length;
          const coNguon = S.rows.every(r => r.nguon.trim() && !/ước tính|uoc tinh/i.test(LAB.khongDau(r.nguon) + r.nguon));
          const coMoc = S.rows.every(r => String(r.m2027).trim() && String(r.m2030).trim());
          const coNguoi = S.rows.every(r => r.nguoi.trim() && !/tap the/.test(LAB.khongDau(r.nguoi)));
          const tuDan = Ls.some(L => L.dan);
          const TC = [
            { t: "Số lượng 8–10 chỉ tiêu", ok: n >= 8 && n <= 10, d: 15, r: n + " chỉ tiêu" },
            { t: "Có ít nhất 3 chỉ tiêu mức Kết quả hoặc Tác động", ok: kq >= 3, d: 20, r: kq + " chỉ tiêu" },
            { t: "Không quá 2 chỉ tiêu mức Đầu vào", ok: n > 0 && dv <= 2, d: 10, r: dv + " chỉ tiêu đầu vào" },
            { t: "Mọi chỉ tiêu nêu đích danh nguồn số liệu, không ghi \"ước tính\"", ok: n > 0 && coNguon, d: 15, r: coNguon ? "đủ" : "còn thiếu / ghi ước tính" },
            { t: "Ít nhất một phần ba gắn chỉ tiêu quốc gia (QĐ 1266, NQ 71, NQ 57)", ok: n > 0 && qg * 3 >= n, d: 15, r: qg + "/" + n },
            { t: "Mọi chỉ tiêu có mốc 2027 và 2030 (mốc trung gian)", ok: n > 0 && coMoc, d: 10, r: coMoc ? "đủ" : "còn ô trống" },
            { t: "Mọi chỉ tiêu ghi chức danh chịu trách nhiệm, không ghi \"tập thể\"", ok: n > 0 && coNguoi, d: 10, r: coNguoi ? "đủ" : "còn thiếu" },
            { t: "Có chỉ tiêu lấy từ phía người dân (hài lòng, đi lại, thời gian…)", ok: tuDan, d: 5, r: tuDan ? "có" : "chưa có" },
          ];
          const diem = TC.reduce((s, t) => s + (t.ok ? t.d : 0), 0);
          const sc = ui.score(diem, "điểm / 100", 100); sc.classList.add(diem >= 80 ? "ok" : diem >= 50 ? "" : "eve");
          kiem.render(h("div", { class: "row", style: { alignItems: "flex-start" } }, sc, h("div", { style: { flex: "1 1 260px", minWidth: 0 } },
            ui.table(["Tiêu chí", "Kết quả", "Điểm"], TC.map(t => [t.t, h("span", null, ui.tag(t.ok ? "Đạt" : "Chưa", t.ok ? "ok" : "eve"), " ", h("span", { class: "small" }, t.r)), { html: (t.ok ? t.d : 0) + "/" + t.d, cls: "r mono" }]), { cls: "tight wrap" }))),
            diem >= 80 ? ui.note("Khung KPI đạt yêu cầu. Mang sang tab <b>Kế hoạch chuyển đổi số 2026–2030</b> (mục IV sẽ tự điền).", "ok") : ui.note("Khung chưa đạt: xem các tiêu chí \"Chưa\". Lưu ý quy tắc tối đa 10 chỉ tiêu và mỗi chỉ tiêu đầu ra phải đi kèm ít nhất một chỉ tiêu kết quả.", "eve"));
        }
        draw(); pane.appendChild(root);
      } },

    /* ============================ TAB 4: NĂNG LỰC SỐ CỦA CÁN BỘ ============================ */
    { id: "nangluc", title: "Năng lực số của cán bộ",
      intro: "Khảo sát 50 cán bộ UBND Phường Mẫu về 8 kỹ năng số (thang 1–5, giả lập). Đọc bản đồ nhiệt theo nhóm cán bộ, lọc theo nhóm tuổi, rồi lập kế hoạch bồi dưỡng theo ba nhóm năng lực của Bài 9 và phong trào \"Bình dân học vụ số\".",
      build(pane) {
        /* Tab 4: bản đồ nhiệt nhóm × kỹ năng, biểu đồ cột, công cụ lập kế hoạch bồi dưỡng theo quý, tải CSV */
        const KS = LAB.data.khao_sat || [];
        const NHOM = LAB.stat.uniq(KS, "nhom"), TUOI = ["Tất cả", ...LAB.stat.uniq(KS, "nhom_tuoi").sort()];
        const KEY = "m8.nangluc";
        const sv = LAB.store.get(KEY, {});
        const S = { tuoi: "Tất cả", nhom: "Tất cả", nguong: sv.nguong || 3, hinhThuc: sv.hinhThuc || "Bình dân học vụ số", batDau: sv.batDau || "2027-Q1", moiQuy: sv.moiQuy || 2 };
        const save = () => LAB.store.set(KEY, { nguong: S.nguong, hinhThuc: S.hinhThuc, batDau: S.batDau, moiQuy: S.moiQuy, uuTien: S.uuTien || [] });
        const { root, ctrl, view } = ui.sim();
        const QUY = ["2027-Q1", "2027-Q2", "2027-Q3", "2027-Q4", "2028-Q1", "2028-Q2", "2028-Q3", "2028-Q4"];
        ctrl.append(
          ui.select({ id: "m8nl-tuoi", label: "Lọc theo nhóm tuổi", options: TUOI.map(x => [x, x]), value: S.tuoi, onChange: v => { S.tuoi = v; draw(); } }),
          ui.select({ id: "m8nl-nhom", label: "Nhóm cán bộ (biểu đồ cột)", options: [["Tất cả", "Tất cả"], ...NHOM.map(x => [x, x])], value: S.nhom, onChange: v => { S.nhom = v; draw(); } }),
          ui.range({ id: "m8nl-nguong", label: "Ngưỡng cần bồi dưỡng (điểm <)", min: 2, max: 4, step: 0.5, value: S.nguong, fmt: v => LAB.num(v, 1), onInput: v => { S.nguong = v; save(); draw(); } }),
          ui.seg({ id: "m8nl-ht", label: "Hình thức bồi dưỡng", options: ["Bình dân học vụ số", "Lớp tại chỗ", "Trực tuyến"], value: S.hinhThuc, onChange: v => { S.hinhThuc = v; save(); draw(); } }),
          ui.select({ id: "m8nl-bd", label: "Quý bắt đầu", options: QUY.map(q => [q, q]), value: S.batDau, onChange: v => { S.batDau = v; save(); draw(); } }),
          ui.range({ id: "m8nl-mq", label: "Số kỹ năng mỗi quý", min: 1, max: 4, step: 1, value: S.moiQuy, onInput: v => { S.moiQuy = v; save(); draw(); } }),
          ui.presets([
            { label: "Cán bộ 46–60, ngưỡng 3", apply: () => { S.tuoi = "46–60"; S.nhom = "Tất cả"; S.nguong = 3; S.hinhThuc = "Lớp tại chỗ"; sync(); draw(); } },
            { label: "Toàn thể, Bình dân học vụ số", apply: () => { S.tuoi = "Tất cả"; S.nhom = "Tất cả"; S.nguong = 3; S.hinhThuc = "Bình dân học vụ số"; sync(); draw(); } },
          ]),
          h("div", { class: "row" }, ui.btn("Làm lại", () => { S.tuoi = "Tất cả"; S.nhom = "Tất cả"; S.nguong = 3; S.hinhThuc = "Bình dân học vụ số"; S.batDau = "2027-Q1"; S.moiQuy = 2; sync(); save(); draw(); }, "sm"),
            ui.btn("Tải CSV kế hoạch", () => LAB.csv.download("m8_ke_hoach_boi_duong.csv", ["ky_nang", "diem_tb", "so_nguoi_can_hoc", "hinh_thuc", "quy", "nhom_tuoi_loc", "san_sang_truc_tuyen_pct"], S.plan || []), "sm pri")),
          ui.cancu("Kế hoạch 01-KH/BCĐTW ngày 21/3/2025 của Ban Chỉ đạo Trung ương", "Phong trào <b>\"Bình dân học vụ số\"</b>; Thủ tướng Chính phủ phát động toàn dân ngày 26/3/2025. Cán bộ, công chức, viên chức là nhóm phải đi trước, làm gương; kết quả đào tạo là dữ liệu đầu vào cho chỉ số nhân lực số của đơn vị."),
          CANCU_1266());
        const ro = ui.slot(), heat = ui.slot(), plan = ui.slot();
        const box = chart.box(b => chart.bars(b, S.chart));
        view.append(ro, ui.title("Bản đồ nhiệt: nhóm cán bộ × kỹ năng", "điểm trung bình 1–5; ô viền đỏ: dưới ngưỡng"), heat, box,
          ui.panel("Ba nhóm năng lực số trong một cơ quan (Bài 9)", ui.table(["Nhóm", "Năng lực cần có", "Nhóm khảo sát tương ứng"], [
            ["(a) Lãnh đạo", "Hiểu bản chất chuyển đổi số; ra quyết định dựa trên dữ liệu; đặt hàng đúng nhu cầu; chịu trách nhiệm về kết quả", "Lãnh đạo"],
            ["(b) Cán bộ chuyên trách", "Quản lý dự án, hợp đồng; lập đề cương, dự toán; quản trị dữ liệu, an toàn; giám sát nhà thầu", "Chuyên trách CNTT"],
            ["(c) Toàn thể cán bộ", "Ký số, xử lý hồ sơ trên mạng; khai thác dữ liệu dùng chung; hướng dẫn được người dân; tự bảo vệ trên môi trường số", "Công chức chuyên môn; không chuyên trách; hợp đồng/hỗ trợ"]], { cls: "wrap" }),
            ui.note("Ba nhóm cần <b>ba chương trình đào tạo khác nhau</b>, không gộp chung một lớp; khi lập kế hoạch, tách ba dòng kinh phí. Đào tạo ngay trên hồ sơ thật của đơn vị; đưa kỹ năng số vào tiêu chí đánh giá cán bộ hằng năm.", "key")),
          ui.title("Kế hoạch bồi dưỡng đề xuất", "kỹ năng có điểm trung bình dưới ngưỡng, xếp yếu nhất học trước"), plan);
        function sync() { ctrl.querySelector("#m8nl-tuoi").value = S.tuoi; ctrl.querySelector("#m8nl-nhom").value = S.nhom; ctrl.querySelector("#m8nl-bd").value = S.batDau; const sg = ctrl.querySelector("#m8nl-ht"); if (sg && sg.set) sg.set(S.hinhThuc); }
        const mean = (rows, k) => rows.length ? LAB.stat.mean(rows.map(r => +r[k])) : NaN;
        function draw() {
          const loc = S.tuoi === "Tất cả" ? KS : KS.filter(r => r.nhom_tuoi === S.tuoi);
          const locNhom = S.nhom === "Tất cả" ? loc : loc.filter(r => r.nhom === S.nhom);
          const tb = KYNANG.map(k => mean(locNhom, k));
          const yeu = KYNANG.map((k, i) => ({ k, v: tb[i] })).sort((a, b) => a.v - b.v);
          const ssTT = loc.length ? 100 * LAB.stat.rate(loc, r => r.san_sang_hoc_truc_tuyen === "Có") : NaN;
          ro.render(ui.readouts([{ k: "Cán bộ trong bộ lọc", v: LAB.num(locNhom.length) + "/" + LAB.num(KS.length), kind: "aqua" }, { k: "Kỹ năng yếu nhất", v: tenKN(yeu[0].k) + " (" + LAB.num(yeu[0].v, 2) + ")", kind: "eve", big: true }, { k: "Kỹ năng mạnh nhất", v: tenKN(yeu[yeu.length - 1].k) + " (" + LAB.num(yeu[yeu.length - 1].v, 2) + ")", kind: "ok" }, { k: "Sẵn sàng học trực tuyến", v: LAB.pc(ssTT, 0), kind: "pt" }]));
          /* bản đồ nhiệt: bọc trong .tw để cuộn ngang ở màn hình hẹp */
          const grid = h("div", { class: "heat", style: { gridTemplateColumns: "minmax(150px,1.6fr) repeat(" + KYNANG.length + ", minmax(64px,1fr))", minWidth: "700px" } });
          grid.append(h("div", { class: "small", style: { color: "var(--faint)" } }, "Nhóm \\ kỹ năng"), ...KYNANG.map(k => h("div", { class: "small", style: { color: "var(--soft)", fontSize: "11px", lineHeight: "1.2", alignSelf: "end" } }, tenKN(k))));
          [...NHOM, "Toàn đơn vị"].forEach(nh => {
            const rows = nh === "Toàn đơn vị" ? loc : loc.filter(r => r.nhom === nh);
            grid.append(h("div", { class: "small", style: { alignSelf: "center", fontWeight: nh === "Toàn đơn vị" ? "600" : "400" } }, nh + " (" + rows.length + ")"));
            KYNANG.forEach(k => { const v = mean(rows, k); const p = isFinite(v) ? Math.round(100 * (v - 1) / 4) : 0;
              grid.append(h("div", { class: "hc", title: nh + " · " + tenKN(k) + ": " + LAB.num(v, 2), style: { background: "color-mix(in srgb, var(--ct) " + p + "%, var(--sunk))", border: isFinite(v) && v < S.nguong ? "2px solid var(--eve)" : "1px solid transparent", color: p > 55 ? "var(--knock)" : "var(--ink)" } }, isFinite(v) ? LAB.num(v, 1) : "—")); });
          });
          heat.render(h("div", { class: "tw" }, grid));
          S.chart = { labels: KYNANG.map(k => tenKN(k).split(" ").slice(0, 2).join(" ")), series: [{ name: "Điểm trung bình", color: "ct", values: tb.map(v => +v.toFixed(2)), colors: tb.map(v => v < S.nguong ? "eve" : "ct") }], ymax: 5, ylabel: "điểm /5", fmtTip: v => LAB.num(v, 2), title: "Điểm trung bình theo kỹ năng — " + S.nhom + (S.tuoi === "Tất cả" ? "" : ", tuổi " + S.tuoi), aspect: 0.4, intY: false };
          box.draw();
          /* kế hoạch bồi dưỡng: kỹ năng dưới ngưỡng (theo bộ lọc tuổi, toàn nhóm), số người cần học = số người có điểm < ngưỡng */
          const uuTien = KYNANG.map(k => ({ k, v: mean(loc, k), n: loc.filter(r => +r[k] < S.nguong).length })).filter(x => x.v < S.nguong).sort((a, b) => a.v - b.v);
          S.uuTien = uuTien.map(x => x.k); save();
          let qi = Math.max(0, QUY.indexOf(S.batDau));
          const plans = uuTien.map((x, i) => { const q = QUY[Math.min(QUY.length - 1, qi + Math.floor(i / S.moiQuy))]; return [tenKN(x.k), LAB.num(x.v, 2), x.n, S.hinhThuc, q, S.tuoi, LAB.num(ssTT, 0)]; });
          S.plan = plans;
          const goiY = S.hinhThuc === "Trực tuyến" && ssTT < 60 ? ui.note("Chỉ " + LAB.pc(ssTT, 0) + " cán bộ trong bộ lọc sẵn sàng học trực tuyến — nên chọn lớp tại chỗ hoặc kèm cặp theo cặp (\"cầm tay chỉ việc\").", "eve") : S.hinhThuc === "Bình dân học vụ số" ? ui.note("Bình dân học vụ số: học trên nền tảng chung, triển khai tới tận tổ dân phố; kết quả học là dữ liệu cho chỉ tiêu \"cán bộ hoàn thành bồi dưỡng\" (hiện " + LAB.pc(LAST.ty_le_can_bo_hoan_thanh_boi_duong_pct, 1) + ").", "key") : null;
          plan.render(uuTien.length ? ui.table(["Kỹ năng ưu tiên", "Điểm TB", "Số người cần học", "Hình thức", "Quý", "Nhóm tuổi"], plans.map(p => [p[0], { html: p[1], cls: "r mono" }, { html: String(p[2]), cls: "r mono" }, p[3], p[4], p[5]]), { cls: "tight" }) : ui.note("Không có kỹ năng nào dưới ngưỡng " + LAB.num(S.nguong, 1) + " trong bộ lọc hiện tại. Hạ ngưỡng hoặc đổi nhóm tuổi.", "ok"),
            goiY, ui.note("Thí điểm ở một bộ phận, đo bằng bài kiểm tra thao tác trước – sau, rồi mới nhân rộng. Chọn người tiên phong mỗi bộ phận để kèm lại đồng nghiệp.", "mut"));
        }
        draw(); pane.appendChild(root);
      } },

    /* ============================ TAB 5: MA TRẬN TÁC ĐỘNG – KHẢ THI ============================ */
    { id: "matran", title: "Ma trận tác động – khả thi",
      intro: "Chấm tác động 1–5 và khả thi 1–5 cho từng sáng kiến, lấy mốc 3 điểm chia bốn ô (Bài 10). Ô \"Làm ngay\" chính là danh mục nhiệm vụ của năm đầu lộ trình. Thêm sáng kiến của đơn vị anh/chị, lưu và tải CSV.",
      build(pane) {
        /* Tab 5: danh mục sáng kiến có điểm tác động/khả thi → lưới 2×2 (SVG) + bốn ô; quản trị thay đổi và bảy rào cản theo slide */
        const MAU = [
          ["Số hoá hồ sơ ngay khi tiếp nhận tại Bộ phận Một cửa", 5, 4], ["Số hoá kết quả giải quyết còn tồn đọng trong kho giấy", 4, 2], ["Điểm hỗ trợ nộp DVC trực tuyến tại khu phố (tổ công nghệ số cộng đồng)", 4, 4],
          ["Bỏ phần mềm trùng chức năng, chuyển sang nền tảng của tỉnh", 3, 4], ["Ký số 100 % văn bản đi", 4, 5], ["Chatbot hướng dẫn thủ tục trên trang của phường", 2, 3],
          ["Kết nối phần mềm chuyên ngành với cơ sở dữ liệu đất đai", 5, 2], ["Làm sạch dữ liệu hộ tịch cũ còn trên sổ giấy", 5, 2], ["Làm lại giao diện trang thông tin điện tử của phường", 2, 4], ["Tự xây phần mềm riêng quản lý hộ kinh doanh", 1, 2]];
        const KEY = "m8.matran";
        const sv = LAB.store.get(KEY, {});
        const mauRows = () => MAU.map(m => ({ ten: m[0], td: m[1], kt: m[2] }));
        const S = { hoten: sv.hoten || "", rows: Array.isArray(sv.rows) && sv.rows.length ? sv.rows : mauRows(), moi: { ten: "", td: 3, kt: 3 } };
        const save = () => LAB.store.set(KEY, { hoten: S.hoten, rows: S.rows });
        const O = [{ id: "lamngay", ten: "Làm ngay", phu: "tác động cao, khả thi cao → năm đầu lộ trình, giao người chịu trách nhiệm", kind: "ok" }, { id: "chuanbi", ten: "Chuẩn bị kỹ (lập dự án)", phu: "tác động cao, khả thi thấp → xin chủ trương, bố trí kinh phí, tập huấn trước", kind: "key" }, { id: "vieknho", ten: "Làm nếu dư nguồn lực (việc nhỏ)", phu: "tác động thấp, khả thi cao → bộ phận tự làm, không xin kinh phí riêng", kind: "pt" }, { id: "gaclai", ten: "Gác lại (để sau)", phu: "tác động thấp, khả thi thấp → ghi phụ lục theo dõi", kind: "mut" }];
        const oCua = r => r.td >= 3 ? (r.kt >= 3 ? 0 : 1) : (r.kt >= 3 ? 2 : 3);
        const { root, ctrl, view } = ui.sim();
        const f = ui.field({ id: "m8mt-ten", label: "Thêm sáng kiến của đơn vị", value: "", placeholder: "ví dụ: lắp màn hình tra cứu tại trụ sở", onInput: v => { S.moi.ten = v; } });
        const err = ui.slot();
        ctrl.append(
          ui.field({ id: "m8mt-hoten", label: "Họ tên học viên", value: S.hoten, onInput: v => { S.hoten = v; save(); } }), f,
          h("div", { class: "grp" }, ui.range({ id: "m8mt-td", label: "Tác động", min: 1, max: 5, step: 1, value: 3, onInput: v => { S.moi.td = v; } }), ui.range({ id: "m8mt-kt", label: "Khả thi", min: 1, max: 5, step: 1, value: 3, onInput: v => { S.moi.kt = v; } })),
          h("div", { class: "row" }, ui.btn("Thêm", () => { const t = S.moi.ten.trim(); if (!t) { err.render(ui.note("Nhập tên sáng kiến trước khi thêm.", "eve")); return; } if (S.rows.length >= 20) { err.render(ui.note("Tối đa 20 sáng kiến — danh mục dài hơn nguồn lực thì phải cắt bớt.", "eve")); return; } S.rows.push({ ten: t, td: S.moi.td, kt: S.moi.kt }); S.moi.ten = ""; f.input.value = ""; err.render(); save(); draw(); }, "pri"),
            ui.btn("Tải CSV", () => LAB.csv.download("m8_ma_tran_uu_tien.csv", ["ho_ten", "sang_kien", "tac_dong", "kha_thi", "o"], S.rows.map(r => [S.hoten, r.ten, r.td, r.kt, O[oCua(r)].ten])), "sm")), err,
          ui.presets([{ label: "Ví dụ chấm điểm của Phường Mẫu", apply: () => { S.rows = mauRows(); save(); draw(); } }, { label: "Xoá điểm, tự chấm", apply: () => { S.rows = MAU.map(m => ({ ten: m[0], td: 3, kt: 3 })); save(); draw(); } }]),
          ui.btn("Làm lại", () => { S.rows = mauRows(); S.hoten = ""; ctrl.querySelector("#m8mt-hoten").value = ""; save(); draw(); }, "sm"),
          ui.panel("Vì sao phải xếp thứ tự ưu tiên", h("ul", { class: "small", style: { margin: 0, paddingLeft: "18px" } }, h("li", null, "Danh mục mong muốn luôn dài hơn nguồn lực thật nhiều lần"), h("li", null, "Làm dàn trải thì việc nào cũng dở dang, không có kết quả rõ"), h("li", null, h("b", null, "Tác động"), ": giảm được bao nhiêu thời gian, công sức cho người dân"), h("li", null, h("b", null, "Khả thi"), ": có căn cứ, có kinh phí, có người làm, làm trong 12 tháng"), h("li", null, "Chấm điểm tập thể tại cuộc họp, không để một người tự chấm"))),
          CANCU_1266());
        const ro = ui.slot(), svgSlot = ui.slot(), quad = ui.slot(), bang = ui.slot();
        view.append(ro, h("div", { class: "cols" }, svgSlot, quad), ui.title("Danh mục sáng kiến và điểm", "điểm 3 tính là \"cao\" (lấy mốc 3 chia bốn ô)"), bang,
          ui.panel("Quản trị thay đổi: thí điểm nhỏ rồi mới nhân rộng (Bài 10)",
            ui.steps([{ t: "<b>Chọn phạm vi nhỏ</b> — một thủ tục, một bộ phận, trong một tháng" }, { t: "<b>Thí điểm làm thật</b> — ghi nhật ký vướng mắc hằng ngày" }, { t: "<b>Đánh giá bằng số</b> — so với cách cũ: thời gian, sai sót, hài lòng", hi: true }, { t: "<b>Điều chỉnh</b> — sửa quy trình, biểu mẫu, phân công" }, { t: "<b>Nhân rộng</b> — ban hành quy chế, tập huấn toàn đơn vị" }]),
            ui.note("Kháng cự là phản ứng bình thường, không phải thái độ chống đối. Năm nguyên nhân: sợ mất việc, sợ bị giám sát, sợ làm sai, ngại học cái mới, đã quen cách cũ. Người đứng đầu phải là người dùng hệ thống đầu tiên; chọn người tiên phong được đồng nghiệp tin ở mỗi bộ phận.", "key"),
            ui.title("Bảy rào cản phổ biến và cách xử lý"),
            ui.table(["Rào cản", "Dấu hiệu nhận biết", "Cách xử lý"], [
              ["Thiếu cam kết của người đứng đầu", "Kế hoạch ký xong rồi để đó, họp giao ban không nhắc", "Đưa chỉ tiêu vào đánh giá người đứng đầu; báo cáo tiến độ hằng tháng"],
              ["Dữ liệu bẩn", "Cùng một người có nhiều cách ghi tên, ngày sinh khác nhau", "Làm sạch theo lô nhỏ; đặt quy tắc nhập liệu; gắn trách nhiệm cập nhật"],
              ["Không có kinh phí vận hành sau đầu tư", "Mua xong rồi hết tiền thuê đường truyền, hết tiền bảo trì", "Lập dự toán trọn vòng đời; ưu tiên thuê dịch vụ thay vì mua đứt"],
              ["Hệ thống không kết nối được với nhau", "Cán bộ phải nhập cùng một thông tin vào hai, ba phần mềm", "Yêu cầu tuân thủ Khung Kiến trúc Chính phủ số 4.0 ngay từ khi đặt hàng"],
              ["Cán bộ chưa đủ kỹ năng số", "Hồ sơ trực tuyến vẫn phải nhờ một, hai người làm hộ", "Bồi dưỡng theo vị trí việc làm; kèm cặp tại chỗ; đo bằng bài kiểm tra thao tác"],
              ["Người dân chưa quen dịch vụ trực tuyến", "Người dân vẫn đến trụ sở rồi nhờ cán bộ nộp giúp", "Bố trí điểm hỗ trợ tại Bộ phận Một cửa; hướng dẫn qua tổ công nghệ số cộng đồng"],
              ["Đo sai, chạy theo thành tích", "Báo cáo chỉ nêu số hồ sơ trực tuyến, không nêu mức hài lòng", "Đo kết quả phục vụ: thời gian thực tế, số lần đi lại, tỉ lệ hài lòng"]], { cls: "wrap" })));
        function veSVG() {
          const W = 460, H = 380, p = { l: 46, r: 14, t: 26, b: 44 }; const X = v => p.l + (v - 1) / 4 * (W - p.l - p.r), Y = v => H - p.b - (v - 1) / 4 * (H - p.t - p.b);
          const s = LAB.svg; const g = s("svg", { class: "diag", viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Ma trận tác động – khả thi" });
          const bg = [[3, 5, 3, 5, "var(--ok-bg)", "LÀM NGAY"], [1, 3, 3, 5, "var(--key-bg)", "CHUẨN BỊ KỸ"], [3, 5, 1, 3, "var(--pt-bg)", "LÀM NẾU DƯ NGUỒN LỰC"], [1, 3, 1, 3, "var(--sunk)", "GÁC LẠI"]];
          bg.forEach(b => { g.append(s("rect", { x: X(b[0]), y: Y(b[3]), width: X(b[1]) - X(b[0]), height: Y(b[2]) - Y(b[3]), fill: b[4], stroke: "var(--line)" }), s("text", { x: X(b[0]) + 8, y: Y(b[3]) + 16, class: "lbl", "font-size": "11", "letter-spacing": ".08em" }, b[5])); });
          for (let v = 1; v <= 5; v++) { g.append(s("text", { x: X(v), y: H - p.b + 16, "text-anchor": "middle" }, String(v)), s("text", { x: p.l - 8, y: Y(v) + 4, "text-anchor": "end" }, String(v))); }
          g.append(s("text", { x: (p.l + W - p.r) / 2, y: H - 6, class: "lbl", "text-anchor": "middle" }, "Mức độ khả thi (thấp → cao)"), s("text", { x: 14, y: (p.t + H - p.b) / 2, class: "lbl", "text-anchor": "middle", transform: "rotate(-90 14 " + (p.t + H - p.b) / 2 + ")" }, "Mức độ tác động (thấp → cao)"));
          const seen = {};
          S.rows.forEach((r, i) => { const k = r.td + "-" + r.kt; const n = seen[k] = (seen[k] || 0) + 1; const dx = ((n - 1) % 3) * 18 - (n > 1 ? 18 : 0), dy = Math.floor((n - 1) / 3) * 18; const col = ["var(--ok)", "var(--key)", "var(--pt)", "var(--faint)"][oCua(r)];
            g.append(s("circle", { cx: X(r.kt) + dx, cy: Y(r.td) + dy, r: 10, fill: col, stroke: "var(--panel)", "stroke-width": 2 }), s("text", { x: X(r.kt) + dx, y: Y(r.td) + dy + 4, "text-anchor": "middle", fill: "var(--knock)", "font-size": "11", "font-weight": "700", style: "fill:var(--knock)" }, String(i + 1)), s("title", null, i + 1 + ". " + r.ten + " — tác động " + r.td + ", khả thi " + r.kt)); });
          return g;
        }
        function draw() {
          const dem = [0, 0, 0, 0]; S.rows.forEach(r => dem[oCua(r)]++);
          ro.render(ui.readouts(O.map((o, i) => ({ k: o.ten, v: LAB.num(dem[i]) + " sáng kiến", kind: o.kind === "mut" ? undefined : o.kind, big: i === 0 }))));
          svgSlot.render(veSVG());
          quad.render(h("div", { class: "quad" }, [1, 0, 3, 2].map(i => h("div", null, h("div", { class: "qt" }, O[i].ten), h("div", { class: "small", style: { color: "var(--faint)", marginBottom: "4px" } }, O[i].phu), h("ul", { class: "small", style: { margin: 0, paddingLeft: "16px" } }, S.rows.map((r, j) => oCua(r) === i ? h("li", null, (j + 1) + ". " + r.ten) : null))))));
          bang.render(ui.table(["#", "Sáng kiến", "Tác động", "Khả thi", "Ô", ""], S.rows.map((r, i) => [String(i + 1), r.ten, selEl([1, 2, 3, 4, 5], r.td, v => { r.td = +v; save(); draw(); }), selEl([1, 2, 3, 4, 5], r.kt, v => { r.kt = +v; save(); draw(); }), ui.tag(O[oCua(r)].ten, O[oCua(r)].kind), ui.btn("✕", () => { S.rows.splice(i, 1); save(); draw(); }, "sm")]), { cls: "wrap" }),
            dem[0] ? ui.note("Ô <b>Làm ngay</b> có " + dem[0] + " sáng kiến → đưa vào năm 2026 của lộ trình (tab <b>Kế hoạch chuyển đổi số</b> sẽ tự điền mục V và lộ trình).", "ok") : ui.note("Chưa có sáng kiến nào ở ô Làm ngay. Năm đầu lộ trình sẽ trống — xem lại cách chấm.", "eve"));
        }
        draw(); pane.appendChild(root);
      } },

    /* ============================ TAB 6: KẾ HOẠCH CHUYỂN ĐỔI SỐ 2026–2030 ============================ */
    { id: "kehoach", title: "Kế hoạch chuyển đổi số 2026–2030",
      intro: "Mẫu Kế hoạch chuyển đổi số cấp đơn vị tám mục (I–VIII) theo Bài 10, lộ trình theo năm và rubric tự chấm của hội đồng lớp. Các mục IV, V và lộ trình tự điền từ khung KPI, ma trận ưu tiên và kế hoạch bồi dưỡng đã làm ở các tab trước.",
      build(pane) {
        /* Tab 6: biểu mẫu 8 mục + lộ trình (Gantt đơn giản) + rubric → điểm; tải Markdown và CSV lộ trình; tám bước hoạch định dạng .wizard */
        const MUC = [
          { id: "I", ten: "Căn cứ pháp lý", goi: "Danh mục văn bản của Đảng, luật, chiến lược, nghị định, văn bản của địa phương — ghi đúng số hiệu và ngày ban hành." },
          { id: "II", ten: "Đánh giá hiện trạng", goi: "Kết quả bốn khảo sát (nghiệp vụ, dữ liệu, hạ tầng, năng lực), có số liệu; nêu rõ mặt được và điểm nghẽn. Câu \"cơ bản đáp ứng yêu cầu\" không có giá trị." },
          { id: "III", ten: "Quan điểm và tầm nhìn", goi: "4–5 quan điểm chỉ đạo, mỗi câu một nguyên tắc (bám: người dân, doanh nghiệp là trung tâm); một đoạn tầm nhìn 3–5 câu tả đơn vị năm 2030." },
          { id: "IV", ten: "Mục tiêu và chỉ tiêu", goi: "Mục tiêu tổng quát; bảng chỉ tiêu có con số, mốc năm, nguồn số liệu; chỉ rõ chỉ tiêu quốc gia tương ứng (QĐ 1266, NQ 71, NQ 57)." },
          { id: "V", ten: "Nhiệm vụ và giải pháp", goi: "Nhóm nhiệm vụ: thể chế, dữ liệu, dịch vụ, nhân lực, an toàn. Mỗi nhiệm vụ gồm: tên việc, người chủ trì, thời hạn, sản phẩm nộp." },
          { id: "VI", ten: "Lộ trình theo năm", goi: "Bảng phân việc 2026–2030 ở dưới; mỗi năm có sản phẩm cụ thể; năm đầu chỉ nhận việc ở ô Làm ngay." },
          { id: "VII", ten: "Kinh phí và nguồn lực", goi: "Tách phần đầu tư ban đầu và phần chi vận hành hằng năm; ba hình thức: đầu tư hệ thống, mua sắm thiết bị, thuê dịch vụ (Nghị định 45/2026/NĐ-CP)." },
          { id: "VIII", ten: "Tổ chức thực hiện", goi: "Phân công đến từng bộ phận, người chủ trì; chế độ báo cáo hằng quý, sơ kết giữa kỳ, tổng kết cuối kỳ; một đầu mối theo dõi số liệu." },
        ];
        const NAM = [2026, 2027, 2028, 2029, 2030];
        const RUB = [["Căn cứ pháp lý đúng và đầy đủ", 15], ["Đánh giá hiện trạng có bằng chứng", 15], ["Mục tiêu đo được, gắn chỉ tiêu quốc gia", 15], ["Nhiệm vụ khả thi với nguồn lực thực", 10], ["Lộ trình theo năm hợp lý", 10], ["Có phương án quản trị thay đổi", 10], ["Có khung đo lường", 15], ["Trình bày và phản biện", 10]];
        const BUOC = ["Phân tích bối cảnh", "Xác định tầm nhìn", "Đặt mục tiêu", "Xác định nhiệm vụ", "Xây dựng lộ trình", "Bố trí nguồn lực", "Tổ chức thực hiện", "Đo lường và điều chỉnh"];
        const LT_MAU = [["Ban hành kế hoạch, khảo sát hiện trạng", [1, 0, 0, 0, 0]], ["Số hoá hồ sơ ngay khi tiếp nhận", [1, 1, 0, 0, 0]], ["Tập huấn kỹ năng số, cấp chữ ký số", [1, 1, 0, 0, 0]], ["Chuẩn hoá, làm sạch dữ liệu hộ tịch", [0, 1, 1, 0, 0]], ["Thí điểm 2 thủ tục rồi nhân rộng toàn đơn vị", [0, 1, 1, 0, 0]], ["Kết nối, chia sẻ dữ liệu", [0, 0, 1, 1, 0]], ["Tái cấu trúc quy trình", [0, 0, 0, 1, 0]], ["Sơ kết giữa kỳ; tổng kết, xây dựng kế hoạch mới", [0, 0, 0, 1, 1]]];
        const MAU_TXT = {
          I: "Nghị quyết 57-NQ/TW ngày 22/12/2024 của Bộ Chính trị; Luật Giao dịch điện tử 20/2023/QH15; Luật Dữ liệu 60/2024/QH15; Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15; Luật An ninh mạng 116/2025/QH15; Quyết định 1266/QĐ-TTg ngày 14/7/2026; Nghị quyết 03/NQ-CP ngày 09/01/2025; Nghị quyết 71/NQ-CP ngày 01/4/2025; Nghị định 118/2025/NĐ-CP ngày 09/6/2025; Nghị định 278/2025/NĐ-CP ngày 22/10/2025; Nghị định 45/2026/NĐ-CP ngày 26/01/2026; Quyết định 292/QĐ-BKHCN ngày 25/3/2025; nghị quyết, kế hoạch của cấp tỉnh.",
          II: "Tiếp nhận 5 nhóm thủ tục; ba thủ tục nhiều hồ sơ nhất là hộ tịch, chứng thực, đất đai; dữ liệu hộ tịch cũ còn trên sổ giấy. Quý " + LAST.quy + ": hồ sơ trực tuyến " + LAB.pc(LAST.ty_le_ho_so_truc_tuyen_pct, 1) + ", toàn trình " + LAB.pc(LAST.ty_le_ho_so_toan_trinh_pct, 1) + ", kết quả số hoá " + LAB.pc(LAST.ty_le_ket_qua_so_hoa_pct, 1) + ", hài lòng " + LAB.num(LAST.diem_hai_long_tren_5, 2) + "/5, cán bộ có chữ ký số " + LAB.pc(LAST.ty_le_can_bo_co_chu_ky_so_pct, 1) + ". Điểm nghẽn: một người kiêm nhiệm CNTT; 2 phần mềm trùng chức năng.",
          III: "Quan điểm: lấy người dân làm trung tâm; làm từ việc nhỏ có kết quả rõ; dữ liệu đúng, đủ, sạch, sống trước khi nói tới hệ thống mới; dùng nền tảng dùng chung trước, phần mềm riêng sau; người đứng đầu trực tiếp chỉ đạo.\nTầm nhìn: Năm 2030, người dân Phường Mẫu làm phần lớn thủ tục tại nhà, đến trụ sở chỉ khi pháp luật bắt buộc.",
          IV: "100 % hồ sơ số hoá ngay khi tiếp nhận (QĐ 1266: 100 %); 90 % hồ sơ toàn trình (NQ 71: 90 %); 100 % cán bộ có chữ ký số; hài lòng từ 99 % (QĐ 1266: 99 %); chi cho chuyển đổi số ≥ 3 % (NQ 57).",
          V: "Dịch vụ: số hoá hồ sơ tại Bộ phận Một cửa (Bộ phận Một cửa chủ trì, 2026). Dữ liệu: làm sạch dữ liệu hộ tịch theo lô (Tư pháp – hộ tịch, 2027–2028). Nhân lực: bồi dưỡng kỹ năng số theo vị trí việc làm, chọn người tiên phong mỗi bộ phận (Văn phòng, 2026–2027). Thể chế: quy chế xử lý hồ sơ điện tử (Chủ tịch ký, quý 1/2026). An toàn: sao lưu, xử lý sự cố, bảo vệ dữ liệu cá nhân.",
          VI: "2026 số hoá và tập huấn; 2027–2028 làm sạch dữ liệu, thí điểm rồi nhân rộng; 2029–2030 sơ kết và hoàn thành chỉ tiêu.",
          VII: "Kinh phí từ ngân sách phường và nguồn hỗ trợ của tỉnh; ưu tiên thuê dịch vụ công nghệ thông tin (đơn vị không có đội kỹ thuật); tách phần đầu tư ban đầu (máy quét, chữ ký số) và phần vận hành hằng năm (đường truyền, thuê dịch vụ) theo Nghị định 45/2026/NĐ-CP.",
          VIII: "Chủ tịch UBND trực tiếp chỉ đạo, làm Trưởng ban chỉ đạo; công chức được phân công theo dõi chuyển đổi số là đầu mối số liệu; báo cáo hằng quý, sơ kết giữa kỳ 2028, tổng kết 2030." };
        const KEY = "m8.kehoach";
        const sv = LAB.store.get(KEY, {});
        const S = { hoten: sv.hoten || "", donvi: sv.donvi || "UBND Phường Mẫu", muc: Object.assign({}, sv.muc || {}), lotrinh: Array.isArray(sv.lotrinh) ? sv.lotrinh : [], rubric: Array.isArray(sv.rubric) && sv.rubric.length === 8 ? sv.rubric : RUB.map(() => 0), auto: {} };
        const save = () => LAB.store.set(KEY, { hoten: S.hoten, donvi: S.donvi, muc: S.muc, lotrinh: S.lotrinh, rubric: S.rubric });
        const { root, view } = ui.sim({ wide: true });
        const wiz = ui.slot(), form = ui.slot(), lt = ui.slot(), rub = ui.slot(), tb = ui.slot();
        const fHoten = ui.field({ id: "m8kh-hoten", label: "Họ tên học viên / nhóm", value: S.hoten, onInput: v => { S.hoten = v; save(); } });
        const fDonvi = ui.field({ id: "m8kh-donvi", label: "Tên đơn vị", value: S.donvi, onInput: v => { S.donvi = v; save(); } });
        const fNV = ui.field({ id: "m8kh-nv", label: "Thêm nhiệm vụ vào lộ trình", value: "", placeholder: "tên việc…" });
        /* đọc bài làm ở các tab khác qua LAB.store */
        const docKhac = () => { const kk = LAB.store.get("m8.khungkpi", {}), mt = LAB.store.get("m8.matran", {}), nl = LAB.store.get("m8.nangluc", {});
          const kpiRows = Array.isArray(kk.rows) ? kk.rows : []; const lamNgay = (Array.isArray(mt.rows) ? mt.rows : []).filter(r => r.td >= 3 && r.kt >= 3).map(r => r.ten); const uuTien = (Array.isArray(nl.uuTien) ? nl.uuTien : []).map(tenKN); return { kpiRows, lamNgay, uuTien, hinhThuc: nl.hinhThuc }; };
        const KPI_TEN = { so_hoa: "Hồ sơ, kết quả giải quyết TTHC được số hoá", toan_trinh: "Hồ sơ nộp trực tuyến toàn trình", tu_nop: "Hồ sơ do người dân tự nộp trực tuyến", hai_long: "Người dân hài lòng", thoi_gian: "Thời gian giải quyết bình quân", dung_han: "Hồ sơ đúng hạn", di_lai: "Số lần đi lại mỗi hồ sơ", thanh_toan: "Thanh toán trực tuyến", ky_so_vb: "Văn bản đi được ký số", cks_cb: "Cán bộ có chữ ký số", ky_nang_co_ban: "Cán bộ có kỹ năng số cơ bản", tu_xu_ly: "Cán bộ tự xử lý hồ sơ trên mạng", nen_tang_chung: "Dùng nền tảng số dùng chung", trung_cn: "Hệ thống trùng chức năng", cap_do_attt: "Hệ thống đã xác định cấp độ ATTT", su_co: "Sự cố an toàn thông tin mỗi quý", chi_cds: "Chi cho chuyển đổi số trên tổng chi", lop_th: "Số lớp tập huấn", bdhvs: "Lượt tham gia Bình dân học vụ số", thiet_bi: "Máy tính, máy quét", kinh_phi_thue: "Kinh phí thuê dịch vụ CNTT", tai_dung: "Hồ sơ tái dùng dữ liệu đã số hoá", bo_sung: "Hồ sơ phải bổ sung", du_lieu_sach: "Bản ghi dữ liệu dân cư đã làm sạch", ho_tro: "Lượt người dân được hướng dẫn", tthc_online: "Thủ tục đã đưa lên trực tuyến" };
        function dienTuTab() {
          const d = docKhac(); const ghi = [];
          if (d.kpiRows.length) { const txt = d.kpiRows.map(r => "- " + (KPI_TEN[r.id] || r.id) + ": hiện " + (r.hienTai || "?") + " → 2027: " + (r.m2027 || "?") + " → 2030: " + (r.m2030 || "?") + " (nguồn: " + (r.nguon || "?") + "; " + (r.nguoi || "chưa ghi người chịu trách nhiệm") + ")").join("\n"); S.muc.IV = (S.muc.IV ? S.muc.IV + "\n" : "") + txt; S.auto.IV = true; ghi.push("mục IV: " + d.kpiRows.length + " chỉ tiêu từ khung KPI"); }
          if (d.lamNgay.length || d.uuTien.length) { const txt = (d.lamNgay.length ? "Nhiệm vụ Làm ngay (từ ma trận): " + d.lamNgay.map(x => "- " + x).join("\n").replace(/^/, "\n") : "") + (d.uuTien.length ? "\nNhân lực: bồi dưỡng kỹ năng ưu tiên " + d.uuTien.join(", ") + (d.hinhThuc ? " (hình thức: " + d.hinhThuc + ")" : "") : ""); S.muc.V = (S.muc.V ? S.muc.V + "\n" : "") + txt.trim(); S.auto.V = true; ghi.push("mục V: " + d.lamNgay.length + " nhiệm vụ Làm ngay, " + d.uuTien.length + " kỹ năng ưu tiên"); }
          d.lamNgay.forEach(t => { if (!S.lotrinh.find(x => x.ten === t)) S.lotrinh.push({ ten: t, nam: [1, 0, 0, 0, 0] }); });
          if (d.uuTien.length && !S.lotrinh.find(x => /bồi dưỡng kỹ năng/i.test(x.ten))) S.lotrinh.push({ ten: "Bồi dưỡng kỹ năng số: " + d.uuTien.slice(0, 3).join(", "), nam: [0, 1, 1, 0, 0] });
          save(); draw();
          tb.render(ghi.length ? ui.note("Đã điền từ các tab khác: " + ghi.join("; ") + ". Lộ trình đã thêm nhiệm vụ Làm ngay vào năm 2026.", "ok") : ui.note("Chưa có bài làm ở tab Khung KPI / Ma trận / Năng lực số để điền. Làm các tab đó trước rồi quay lại.", "eve"));
        }
        function mdText() {
          let s = "# KẾ HOẠCH CHUYỂN ĐỔI SỐ GIAI ĐOẠN 2026–2030\n\n**Đơn vị:** " + S.donvi + "  \n**Người lập:** " + S.hoten + "  \n**Ngày xuất:** " + LAB.date.vn(new Date()) + "\n\n";
          MUC.forEach(m => { s += "## " + m.id + ". " + m.ten + "\n\n" + (S.muc[m.id] || "_(chưa viết)_") + "\n\n"; if (m.id === "VI" && S.lotrinh.length) { s += "| Nhiệm vụ | " + NAM.join(" | ") + " |\n|---|" + NAM.map(() => "---").join("|") + "|\n" + S.lotrinh.map(r => "| " + r.ten + " | " + r.nam.map(v => v ? "●" : "").join(" | ") + " |").join("\n") + "\n\n"; } });
          const tong = S.rubric.reduce((a, b) => a + b, 0);
          s += "## Tự chấm theo rubric\n\n| Tiêu chí | Điểm | Tối đa |\n|---|---|---|\n" + RUB.map((r, i) => "| " + r[0] + " | " + S.rubric[i] + " | " + r[1] + " |").join("\n") + "\n| **Tổng** | **" + tong + "** | 100 |\n\nQuy về thang 10: " + LAB.num(tong / 10, 1) + " — " + (tong >= 50 ? "Đạt" : "Chưa đạt (dưới 50 điểm phải chỉnh sửa và bảo vệ lại)") + ".\n\n_Mọi tên người, địa danh, số liệu của Phường Mẫu là hư cấu._\n";
          return s;
        }
        view.append(ui.title("Tám bước hoạch định", "bước sáng là bước đang làm; bước xanh đã có nội dung"), wiz,
          h("div", { class: "cols" }, fHoten, fDonvi,
            h("div", { class: "fld" }, h("label", null, h("b", null, "Thao tác")), h("div", { class: "row" }, ui.btn("Điền từ các tab khác", dienTuTab, "pri"), ui.btn("Ví dụ mẫu: UBND Phường Mẫu", () => { S.donvi = "UBND Phường Mẫu"; fDonvi.input.value = S.donvi; S.muc = Object.assign({}, MAU_TXT); S.auto = {}; S.lotrinh = LT_MAU.map(x => ({ ten: x[0], nam: x[1].slice() })); save(); draw(); tb.render(ui.note("Đã nạp ví dụ tóm tắt của UBND Phường Mẫu theo slide Bài 10 — mức chi tiết tối thiểu cho một trang tóm tắt; bản thuyết minh đầy đủ phải triển khai từng mục có số liệu.", "key")); }, "sm"), ui.btn("Làm lại", () => { S.muc = {}; S.auto = {}; S.lotrinh = []; S.rubric = RUB.map(() => 0); save(); draw(); tb.render(); }, "sm")))),
          tb,
          ui.cancu("Quyết định 1266/QĐ-TTg ngày 14/7/2026 của Thủ tướng Chính phủ", "Quan điểm: \"Người dân và doanh nghiệp là trung tâm, là chủ thể và là đối tượng thụ hưởng chính của chuyển đổi số\". Chỉ tiêu quốc gia là đích chung; kế hoạch của đơn vị phải nói rõ phần đóng góp cụ thể của mình vào từng chỉ tiêu."),
          ui.note("Mục I <b>không dẫn</b> Luật An toàn thông tin mạng 86/2015/QH13 và Luật An ninh mạng 24/2018/QH14 ", "eve"),
          form,
          ui.title("Mục VI. Lộ trình theo năm", "bấm vào ô để đánh dấu năm thực hiện; năm đầu chỉ nhận việc ở ô Làm ngay"), lt,
          ui.title("Rubric tự chấm (hội đồng lớp)", "thang 100, quy về thang 10; đạt từ 50 điểm"), rub);
        /* hoàn thiện câu cảnh báo hết hiệu lực bằng thẻ (không dùng innerHTML cho phần thẻ) */
        const warnEl = view.querySelector(".note.eve"); warnEl.append(ui.tag("Hết hiệu lực 01/7/2026", "eve"), " — thay bằng Luật An ninh mạng 116/2025/QH15. Nghị định 73/2019/NĐ-CP đã được thay bằng Nghị định 45/2026/NĐ-CP (hiệu lực 01/3/2026).");
        function draw() {
          const done = [!!S.muc.II, !!S.muc.III, !!S.muc.IV, !!S.muc.V, S.lotrinh.some(r => r.nam.some(Boolean)), !!S.muc.VII, !!S.muc.VIII, S.rubric.some(v => v > 0)];
          const on = done.indexOf(false);
          wiz.render(h("div", { class: "wizard" }, BUOC.map((b, i) => h("span", { class: "st" + (done[i] ? " done" : i === on ? " on" : "") }, (i + 1) + ". " + b))));
          form.render(h("div", { class: "cols" }, MUC.map(m => { const f = ui.field({ id: "m8kh-" + m.id, label: "Mục " + m.id + ". " + m.ten, type: "textarea", rows: 5, value: S.muc[m.id] || "", hint: m.goi, onInput: v => { S.muc[m.id] = v; S.auto[m.id] = false; save(); drawWiz(); } }); if (S.auto[m.id]) { f.input.style.borderStyle = "dashed"; f.input.style.borderColor = "var(--pt)"; } return f; })));
          const rows = S.lotrinh.map((r, i) => [r.ten, ...NAM.map((n, k) => h("button", { type: "button", class: "btn sm" + (r.nam[k] ? " on" : ""), title: n + (r.nam[k] ? ": có" : ": không"), onclick: () => { r.nam[k] = r.nam[k] ? 0 : 1; save(); draw(); } }, r.nam[k] ? "●" : "·")), ui.btn("✕", () => { S.lotrinh.splice(i, 1); save(); draw(); }, "sm")]);
          const tai = NAM.map((n, k) => S.lotrinh.filter(r => r.nam[k]).length);
          const maxTai = Math.max(...tai, 0);
          lt.render(S.lotrinh.length ? ui.table(["Nhiệm vụ", ...NAM.map(String), ""], rows, { cls: "tight" }) : ui.note("Chưa có nhiệm vụ. Bấm <b>Điền từ các tab khác</b>, nạp <b>Ví dụ mẫu</b> hoặc thêm bằng ô dưới.", "mut"),
            h("div", { class: "row", style: { alignItems: "flex-end" } }, fNV, ui.btn("Thêm nhiệm vụ", () => { const t = fNV.input.value.trim(); if (!t) { tb.render(ui.note("Nhập tên nhiệm vụ trước.", "eve")); return; } S.lotrinh.push({ ten: t, nam: [0, 0, 0, 0, 0] }); fNV.input.value = ""; save(); draw(); }, "sm pri"),
              ui.btn("Tải CSV lộ trình", () => LAB.csv.download("m8_lo_trinh_2026_2030.csv", ["don_vi", "nhiem_vu", ...NAM.map(n => "nam_" + n)], S.lotrinh.map(r => [S.donvi, r.ten, ...r.nam.map(v => v ? "x" : "")])), "sm"),
              ui.btn("Tải kế hoạch (Markdown)", () => LAB.csv.downloadText("m8_ke_hoach_cds_2026_2030.md", mdText(), "text/markdown;charset=utf-8"), "sm pri")),
            S.lotrinh.length ? h("div", { class: "cols" }, NAM.map((n, k) => ui.bar({ label: "Khối lượng " + n, value: tai[k], max: Math.max(1, S.lotrinh.length), text: tai[k] + " việc", kind: maxTai && tai[k] === maxTai && tai[k] > S.lotrinh.length / 2 ? "eve" : "aqua" }))) : null,
            maxTai > S.lotrinh.length / 2 && S.lotrinh.length >= 3 ? ui.note("Một năm đang gánh hơn nửa số nhiệm vụ — slide Bài 10: \"rải nhiệm vụ ra từng năm, không dồn hết vào năm đầu\".", "eve") : null);
          drawRub();
        }
        function drawWiz() { const done = [!!S.muc.II, !!S.muc.III, !!S.muc.IV, !!S.muc.V, S.lotrinh.some(r => r.nam.some(Boolean)), !!S.muc.VII, !!S.muc.VIII, S.rubric.some(v => v > 0)]; const on = done.indexOf(false); wiz.render(h("div", { class: "wizard" }, BUOC.map((b, i) => h("span", { class: "st" + (done[i] ? " done" : i === on ? " on" : "") }, (i + 1) + ". " + b)))); }
        function drawRub() {
          const tong = S.rubric.reduce((a, b) => a + b, 0);
          const sc = ui.score(tong, "điểm / 100", 100); sc.classList.add(tong >= 80 ? "ok" : tong >= 50 ? "" : "eve");
          rub.render(h("div", { class: "row", style: { alignItems: "flex-start" } }, sc, h("div", { class: "stack", style: { flex: "1 1 300px" } },
            ui.readouts([{ k: "Quy về thang 10", v: LAB.num(tong / 10, 1), kind: "key", big: true }, { k: "Kết luận", v: tong >= 50 ? "Đạt" : "Chưa đạt — chỉnh sửa, bảo vệ lại", kind: tong >= 50 ? "ok" : "eve" }, { k: "Tỉ trọng đồ án", v: "30 % điểm môn", kind: "mut" }]),
            h("div", { class: "cols" }, RUB.map((r, i) => ui.range({ id: "m8kh-rub" + i, label: r[0], min: 0, max: r[1], step: 1, value: S.rubric[i], fmt: v => v + "/" + r[1], onInput: v => { S.rubric[i] = v; save(); drawWiz(); const t = S.rubric.reduce((a, b) => a + b, 0); const s2 = ui.score(t, "điểm / 100", 100); s2.classList.add(t >= 80 ? "ok" : t >= 50 ? "" : "eve"); sc.replaceWith(s2); } }))),
            ui.note("Đồ án: thuyết minh 8–12 trang A4 kèm phụ lục bốn phiếu khảo sát; slide 12–15 phút; phản biện 7 phút; nộp trước buổi bảo vệ 48 giờ. Nhóm 4–6 học viên; tên cá nhân và đơn vị thay bằng tên mẫu.", "mut"))));
        }
        draw(); pane.appendChild(root);
      } },
  ]
});
})();
