/* Phòng mô phỏng Chính phủ số — Buổi 7: Hạ tầng, nền tảng, công nghệ và an toàn thông tin (gộp Bài 7 + Bài 8).
   Sáu tab: xaythue (tự xây hay thuê), nentang (nền tảng dùng chung), troly (kiểm chứng trợ lý ảo),
   capdo (cấp độ hệ thống thông tin), ruiro (nhận diện lừa đảo, rủi ro), dlcn (ma trận rủi ro + checklist dữ liệu cá nhân).
   Căn cứ: CANCU.md mục C (NĐ 45/2026), mục E (bộ máy), mục I (Luật 116/2025, Luật 91/2025, NĐ 356/2025, NĐ 331/2026, Chỉ thị 14/CT-TTg, DGA-1-2-5-210).
   Mọi đơn giá, tên hệ thống, số liệu của Phường Mẫu là mô phỏng. */
(function () { "use strict";
const { h, ui, chart } = LAB;
const tr = v => LAB.num(v, 0) + " tr";                       // triệu đồng
const HT = () => LAB.data.he_thong;
const nameField = (id, S, cb) => ui.field({ id, label: "Họ tên học viên", value: S.ten || "", placeholder: "Nguyễn Văn A", onInput: v => { S.ten = v; if (cb) cb(); } });
const li = items => h("ul", { class: "small", style: { margin: "0", paddingLeft: "18px", color: "var(--ink)", fontSize: "13.5px" } }, items.map(x => h("li", { html: x })));

/* Cảnh báo hiệu lực dùng chung cho các tab Bài 8 (mục I0 CANCU.md) */
const noteHieuLuc = () => ui.note("<b>Lưu ý hiệu lực.</b> Luật An toàn thông tin mạng 86/2015/QH13 và Luật An ninh mạng 24/2018/QH14 <b>hết hiệu lực từ 01/7/2026</b> (khoản 2 Điều 44 Luật An ninh mạng số 116/2025/QH15). Nghị định 13/2023/NĐ-CP <b>hết hiệu lực từ 01/01/2026</b> (khoản 2 Điều 42 Nghị định 356/2025/NĐ-CP). Phần đang áp dụng dẫn Luật 116/2025/QH15, Luật 91/2025/QH15, Nghị định 356/2025/NĐ-CP và Nghị định 331/2026/NĐ-CP.", "eve");

LAB.module({
  id: "m7",
  tabs: [

  /* ============================================================ TAB 1: TỰ XÂY HAY THUÊ ============================================================ */
  { id: "xaythue", title: "Tự xây hay thuê dịch vụ",
    intro: "Máy tính chi phí nhiều năm: <b>tự đầu tư</b> phòng máy chủ và phần mềm so với <b>thuê dịch vụ công nghệ thông tin</b> (Bài 7, phần 2 và 5; Nghị định 45/2026/NĐ-CP). Kéo tham số để thấy chi phí luỹ kế và điểm hoà vốn. <b>Mọi đơn giá là số mô phỏng</b> để tập cách so sánh, không phải định mức.",
    build(pane) {
      // Chú thích: tính chi phí luỹ kế theo năm của hai phương án, tìm điểm hoà vốn; kèm ba nguyên tắc chọn đám mây và kiểm kê nơi đặt hệ thống.
      const DF = { nam: 5, tb: 120, pm: 150, bt: 15, ns: 60, dien: 24, kh: 5, thue: 90, tang: 5, kt: 30, cd: 20, dl: "cb" };
      const S = Object.assign({}, DF, LAB.store.get("m7.xaythue", {}));
      const { root, ctrl, view } = ui.sim();
      const R = {};
      const mk = (k, label, min, max, step, fmt, hint) => { R[k] = ui.range({ id: "m7xt-" + k, label, min, max, step, value: S[k], fmt: fmt || tr, hint, onInput: v => { S[k] = v; draw(); } }); return R[k]; };
      const set = o => { Object.assign(S, o); Object.keys(R).forEach(k => R[k].set(S[k])); draw(); };
      ctrl.append(
        ui.presets([
          { label: "Phần mềm quản lý hộ kinh doanh HT07", apply: () => set({ nam: 5, tb: 90, pm: 120, bt: 15, ns: 36, dien: 18, kh: 5, thue: 60, tang: 5, kt: 20, cd: 15 }) },
          { label: "Hệ thống lớn, nhiều người dùng", apply: () => set({ nam: 5, tb: 400, pm: 350, bt: 20, ns: 180, dien: 60, kh: 4, thue: 220, tang: 8, kt: 80, cd: 60 }) }]),
        ui.btn("Làm lại", () => set(DF), "sm"),
        ui.title("Phương án 1 · Đầu tư, tự vận hành", "đầu tư hệ thống, mua sắm thiết bị"),
        mk("tb", "Thiết bị, máy chủ (mua một lần)", 0, 600, 10),
        mk("pm", "Phần mềm, bản quyền (mua một lần)", 0, 600, 10),
        mk("bt", "Bảo trì, nâng cấp mỗi năm", 0, 30, 1, v => v + " % giá trị đầu tư"),
        mk("ns", "Nhân sự vận hành (mỗi năm)", 0, 300, 6),
        mk("dien", "Điện, phòng máy, đường truyền (mỗi năm)", 0, 100, 2),
        mk("kh", "Thời gian khấu hao thiết bị", 3, 8, 1, v => v + " năm", "Hết khấu hao phải mua thiết bị mới"),
        ui.title("Phương án 2 · Thuê dịch vụ công nghệ thông tin"),
        mk("thue", "Phí thuê dịch vụ (năm đầu)", 0, 500, 5),
        mk("tang", "Tăng giá mỗi năm", 0, 20, 1, v => v + " %", "Câu hỏi thứ 5 trước khi ký: chi phí năm thứ hai, thứ ba là bao nhiêu?"),
        mk("kt", "Phí khởi tạo, cài đặt (một lần)", 0, 200, 5),
        mk("cd", "Chi phí chuyển đổi dữ liệu (một lần)", 0, 200, 5),
        mk("nam", "Số năm so sánh", 3, 8, 1, v => v + " năm"),
        ui.cancu("Nghị định 45/2026/NĐ-CP ngày 26/01/2026 của Chính phủ (hiệu lực 01/3/2026), thay Nghị định 73/2019/NĐ-CP", "Quản lý đầu tư ứng dụng công nghệ thông tin sử dụng nguồn vốn ngân sách nhà nước. Ba hình thức triển khai: <b>đầu tư hệ thống; mua sắm thiết bị; thuê dịch vụ công nghệ thông tin</b>."),
        ui.warn("Đơn giá trong máy tính này là số mô phỏng để tập so sánh, không phải định mức hay báo giá thật."));

      const ro = ui.slot(), tbl = ui.slot(), kl = ui.slot(), verdict = ui.slot(), noidat = ui.slot();
      const box = chart.box(b => chart.line(b, S.chart));
      /* Dữ liệu nào được đưa lên đám mây công cộng — nguyên tắc 2 (vị trí đặt dữ liệu) */
      const DL = [
        { id: "ck", title: "Tin bài, văn bản công khai", sub: "Cổng thông tin điện tử của phường", kind: "ok", k: "ok", kq: "Có thể đặt trên đám mây, kể cả đám mây công cộng đặt trong nước. Vẫn phải có sao lưu và điều khoản bàn giao dữ liệu khi kết thúc hợp đồng." },
        { id: "cb", title: "Hồ sơ TTHC có dữ liệu cá nhân cơ bản", sub: "họ tên, số định danh, địa chỉ", kind: "key", k: "key", kq: "Chỉ đặt tại trung tâm dữ liệu của Nhà nước hoặc đám mây có hợp đồng ràng buộc: biết rõ nơi lưu, nơi sao lưu, ai truy cập; bên cho thuê không được tự khai thác; xuất được toàn bộ dữ liệu. Không chuyển hồ sơ qua ứng dụng công cộng (nhóm chat)." },
        { id: "nc", title: "Dữ liệu cá nhân nhạy cảm", sub: "ảnh thẻ căn cước, sức khoẻ, tài khoản ngân hàng", kind: "eve", k: "eve", kq: "<b>Không đưa lên đám mây công cộng.</b> Đặt tại trung tâm dữ liệu của Nhà nước; phải phân quyền giới hạn truy cập, có quy trình xử lý riêng và biện pháp bảo mật (khoản 2 Điều 4 Nghị định 356/2025/NĐ-CP)." },
        { id: "bm", title: "Bí mật nhà nước, bí mật công tác", sub: "văn bản mật, dự thảo chưa công bố", kind: "eve", k: "eve", kq: "<b>Tuyệt đối không</b> đưa lên đám mây công cộng hay dịch vụ bên ngoài; chỉ lưu, truyền trên hệ thống và mạng truyền số liệu chuyên dùng của cơ quan Đảng, Nhà nước. Cố ý làm lộ là hành vi bị nghiêm cấm (điểm c khoản 2 Điều 7 Luật 116/2025/QH15)." }];
      const tiles = ui.tiles({ items: DL, value: S.dl, onChange: v => { S.dl = v; drawDL(); } });
      view.append(ro, box, tbl,
        ui.panel("Ba nguyên tắc lựa chọn đám mây không được bỏ qua", ui.steps([
          { t: "<b>Chủ quyền dữ liệu.</b> Dữ liệu của cơ quan vẫn thuộc quyền quản lý của cơ quan; hợp đồng ghi rõ bên cho thuê không được tự khai thác." },
          { t: "<b>Vị trí đặt dữ liệu.</b> Phải biết dữ liệu lưu ở đâu, sao lưu ở đâu, ai truy cập; ưu tiên đặt trong nước; tuân thủ Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15." },
          { t: "<b>Đổi được nhà cung cấp.</b> Xuất được toàn bộ dữ liệu ra định dạng thông dụng; ghi vào hợp đồng điều khoản bàn giao khi kết thúc." }]),
          ui.cancu("Luật Dữ liệu 60/2024/QH15 (hiệu lực 01/7/2025); Luật An ninh mạng 116/2025/QH15 (hiệu lực 01/7/2026)", "Trung tâm dữ liệu quốc gia do Chính phủ xây dựng, quản lý, khai thác, vận hành; cung cấp hạ tầng cho cơ quan có nhu cầu — đơn vị có thể dùng hạ tầng tập trung thay vì tự đầu tư phòng máy chủ.")),
        ui.panel("Dữ liệu nào được đưa lên đám mây công cộng?", h("div", { class: "small" }, "Bấm chọn loại dữ liệu định đưa lên đám mây để xem kết luận theo nguyên tắc 2."), tiles, verdict),
        ui.panel("Kiểm kê Phường Mẫu: 18 hệ thống đang đặt ở đâu", noidat));

      function tinh() {
        const n = S.nam, rows = []; let a = 0, b = 0, hv = null;
        for (let y = 0; y <= n; y++) {
          let ca, cb;
          if (y === 0) { ca = S.tb + S.pm; cb = S.kt + S.cd; }
          else { ca = (S.tb + S.pm) * S.bt / 100 + S.ns + S.dien + ((y % S.kh === 0 && y < n) ? S.tb : 0); cb = S.thue * Math.pow(1 + S.tang / 100, y - 1); }
          const d0 = a - b; a += ca; b += cb; const d1 = a - b;
          if (hv == null && y > 0 && d0 * d1 < 0) hv = y - 1 + d0 / (d0 - d1);
          rows.push({ y, ca, cb, a, b });
        }
        return { rows, a, b, hv };
      }
      function draw() {
        LAB.store.set("m7.xaythue", S);
        const { rows, a, b, hv } = tinh(); const n = S.nam;
        const C = LAB.colors();
        S.chart = { title: "Chi phí luỹ kế theo năm (triệu đồng, mô phỏng)", xlabel: "Năm", ylabel: "Triệu đồng", xmin: 0, xmax: n, ymin: 0, xticks: rows.map(r => r.y), fmtX: v => "Năm " + Math.round(v), fmtY: v => LAB.num(v), fmtTip: tr,
          series: [{ name: "Đầu tư, tự vận hành", color: "aqua", points: rows.map(r => [r.y, r.a]), marker: true }, { name: "Thuê dịch vụ", color: "pt", points: rows.map(r => [r.y, r.b]), marker: true }],
          vlines: hv != null ? [{ x: hv, label: "Hoà vốn ≈ năm " + LAB.num(hv, 1), color: C.key }] : [] };
        const chenh = a - b, reHon = chenh > 0 ? "Thuê dịch vụ" : chenh < 0 ? "Tự đầu tư" : "Bằng nhau";
        let hvText, hvKind = "key";
        if (hv == null) { hvText = a > b ? "Thuê luôn rẻ hơn trong " + n + " năm" : "Đầu tư luôn rẻ hơn trong " + n + " năm"; }
        else { const sauDo = a > b ? "sau đó thuê rẻ hơn" : "sau đó đầu tư rẻ hơn"; hvText = "Năm " + LAB.num(hv, 1) + " — " + sauDo; }
        ro.render(ui.readouts([
          { k: "Tổng " + n + " năm · tự đầu tư", v: tr(a), kind: "aqua", big: true },
          { k: "Tổng " + n + " năm · thuê dịch vụ", v: tr(b), kind: "pt", big: true },
          { k: "Phương án rẻ hơn", v: reHon + " (" + tr(Math.abs(chenh)) + ")", kind: chenh === 0 ? "mut" : "ok" },
          { k: "Điểm hoà vốn", v: hvText, kind: hvKind },
          { k: "Bình quân mỗi năm", v: tr(a / n) + " / " + tr(b / n), kind: "ct" }]),
          ui.note("Đầu tư: trả một khoản lớn ở năm 0, mỗi năm thêm bảo trì " + S.bt + " %, nhân sự, điện; hết " + S.kh + " năm phải mua lại thiết bị. Thuê: trả đều theo năm, tăng " + S.tang + " %/năm; có phí khởi tạo và chuyển đổi dữ liệu lúc đầu. <b>Không có phương án đúng cho mọi trường hợp</b>, chỉ có phương án phù hợp năng lực vận hành của đơn vị.", "mut"));
        tbl.render(ui.table(["Năm", "Đầu tư · chi trong năm", "Đầu tư · luỹ kế", "Thuê · chi trong năm", "Thuê · luỹ kế", "Chênh lệch luỹ kế (đầu tư − thuê)"],
          rows.map(r => ["Năm " + r.y, { html: tr(r.ca), cls: "r mono" }, { html: tr(r.a), cls: "r mono" }, { html: tr(r.cb), cls: "r mono" }, { html: tr(r.b), cls: "r mono" }, { html: (r.a - r.b > 0 ? "+" : "") + tr(r.a - r.b), cls: "r mono" }]),
          { cls: "tight", rowCls: (r, i) => (hv != null && Math.floor(hv) + 1 === i) ? "hi" : null }));
        box.draw();
      }
      function drawDL() {
        LAB.store.set("m7.xaythue", S);
        const d = DL.find(x => x.id === S.dl) || DL[1];
        verdict.render(ui.note("<b>" + d.title + ":</b> " + d.kq, d.k));
      }
      function drawNoiDat() {
        const rows = HT(); const byN = LAB.stat.count(rows, "noi_dat");
        const bad = new Set(["Đám mây công cộng", "Máy tính cá nhân"]), warnN = new Set(["Máy chủ tại đơn vị"]);
        noidat.render(
          ui.readouts([...byN.entries()].sort((x, y) => y[1] - x[1]).map(([k, v]) => ({ k, v: String(v), kind: bad.has(k) ? "eve" : warnN.has(k) ? "key" : "aqua" }))),
          ui.table(["Mã", "Hệ thống", "Nơi đặt", "Loại", "Chi phí/năm (tr)", "Nhận xét"], rows.map(r => [r.ma, r.ten_he_thong, r.noi_dat, r.loai, { html: LAB.num(r.chi_phi_nam_trieu_dong), cls: "r mono" },
            bad.has(r.noi_dat) ? ui.tag(r.noi_dat === "Đám mây công cộng" ? "Không được chứa hồ sơ công dân" : "Không sao lưu, không ai bảo vệ", "eve") : warnN.has(r.noi_dat) ? ui.tag("Không người trực, không điện/mạng dự phòng", "key") : ui.tag("Dùng chung, có người trực", "ok")]),
            { cls: "tight", rowCls: r => bad.has(r[2]) ? "bad" : warnN.has(r[2]) ? "hi" : null }),
          ui.note("Câu hỏi không phải là <i>có máy chủ chưa</i>, mà là <b>đặt ở đâu thì an toàn, rẻ và liên thông được</b>. Ưu tiên dùng chung trung tâm dữ liệu tỉnh, quốc gia; giữ tại chỗ khi có lý do rõ ràng.", "key"));
      }
      draw(); drawDL(); drawNoiDat(); pane.appendChild(root);
    } },

  /* ============================================================ TAB 2: NỀN TẢNG DÙNG CHUNG ============================================================ */
  { id: "nentang", title: "Nền tảng dùng chung",
    intro: "Mô phỏng <b>N đơn vị mỗi nơi tự làm một phần mềm</b> so với <b>một nền tảng dùng chung</b> (Bài 7, phần 3: \"nền tảng là giải pháp đột phá\" — Khung Kiến trúc Chính phủ số 4.0, Quyết định 292/QĐ-BKHCN). Kéo số đơn vị để thấy từ bao nhiêu đơn vị thì dùng chung rẻ hơn. Đơn giá mô phỏng.",
    build(pane) {
      // Chú thích: chi phí riêng = N × (xây dựng + bảo trì × năm); chi phí chung = nền tảng + vận hành × năm + N × triển khai/đơn vị; vẽ đường theo N.
      const DF = { N: 95, cxd: 150, cbt: 30, nxd: 6000, nvh: 1200, ntk: 15, nam: 5 };
      const S = Object.assign({}, DF, LAB.store.get("m7.nentang", {}));
      const { root, ctrl, view } = ui.sim();
      const R = {};
      const mk = (k, label, min, max, step, fmt, hint) => { R[k] = ui.range({ id: "m7nt-" + k, label, min, max, step, value: S[k], fmt: fmt || tr, hint, onInput: v => { S[k] = v; draw(); } }); return R[k]; };
      const set = o => { Object.assign(S, o); Object.keys(R).forEach(k => R[k].set(S[k])); draw(); };
      ctrl.append(
        ui.presets([{ label: "Tỉnh Mẫu: 95 xã, phường", apply: () => set(DF) }, { label: "Cụm 12 phường thí điểm", apply: () => set({ N: 12, cxd: 150, cbt: 30, nxd: 2500, nvh: 500, ntk: 20, nam: 5 }) }, { label: "Toàn quốc ~3.300 xã (giới hạn 200)", apply: () => set({ N: 200, cxd: 150, cbt: 30, nxd: 12000, nvh: 2500, ntk: 10, nam: 5 }) }]),
        ui.btn("Làm lại", () => set(DF), "sm"),
        mk("N", "Số đơn vị (N)", 1, 200, 1, v => v + " đơn vị", "Ví dụ: số xã, phường của một tỉnh"),
        ui.title("Mỗi nơi tự làm"),
        mk("cxd", "Xây dựng một phần mềm riêng (mỗi nơi)", 20, 600, 10),
        mk("cbt", "Bảo trì mỗi nơi, mỗi năm", 0, 120, 2),
        ui.title("Một nền tảng dùng chung"),
        mk("nxd", "Xây dựng nền tảng (một lần)", 500, 20000, 100),
        mk("nvh", "Vận hành nền tảng, mỗi năm", 0, 5000, 50),
        mk("ntk", "Triển khai, tập huấn cho mỗi đơn vị (một lần)", 0, 80, 1),
        mk("nam", "Số năm so sánh", 3, 8, 1, v => v + " năm"),
        ui.cancu("Quyết định 292/QĐ-BKHCN ngày 25/3/2025 của Bộ Khoa học và Công nghệ — Khung Kiến trúc Chính phủ số Việt Nam 4.0", "Nguyên tắc: <b>nền tảng là giải pháp đột phá</b>; dùng chung nền tảng quốc gia; nền tảng quy mô quốc gia làm trước, làm tốt, làm tập trung; hạ tầng hiện đại, đồng bộ, an ninh, an toàn, hiệu quả, tránh lãng phí."),
        ui.cancu("Quyết định 1266/QĐ-TTg ngày 14/7/2026 của Thủ tướng Chính phủ", "Chỉ tiêu đến 2030: <b>100 %</b> bộ, ngành, địa phương sử dụng thống nhất, hiệu quả các nền tảng số dùng chung quốc gia."),
        ui.warn("Đơn giá mô phỏng để minh hoạ cơ chế chia sẻ chi phí."));
      const ro = ui.slot(), ss = ui.slot(), map = ui.slot();
      const box = chart.box(b => chart.line(b, S.chart));
      view.append(ro, box, ss,
        ui.panel("Bốn lý do dùng chung rẻ hơn và nhanh hơn", ui.table(["Lý do", "Nền tảng dùng chung", "Mỗi nơi tự làm"], [
          ["1. Chi phí", "Chi phí làm một lần được chia cho rất nhiều đơn vị cùng dùng", "Trả nhiều lần cho cùng một việc"],
          ["2. Thời gian", "Đăng ký là dùng được, không phải lập dự án đầu tư kéo dài", "Mỗi đơn vị một hợp đồng, một nhà cung cấp, một dự án"],
          ["3. Liên thông", "Cùng một nền tảng thì dữ liệu nối được với nhau ngay; người dân khai một lần", "Cán bộ nhập dữ liệu hai lần, số liệu lệch nhau"],
          ["4. Bảo trì và an toàn", "Quy định đổi thì cập nhật một lần cho tất cả các đơn vị", "Quy định thay đổi là phải sửa ở tất cả các nơi"]], { cls: "wrap" })),
        ui.panel("Nền tảng dùng chung đơn vị sẽ gặp", ui.table(["Nền tảng, hệ thống dùng chung", "Dùng để làm gì"], [
          ["Cổng Dịch vụ công quốc gia", "Điểm một cửa số tập trung, duy nhất để nhận hồ sơ (từ 05/8/2026 Bộ Công an chủ trì vận hành — Nghị định 310/2026/NĐ-CP)"],
          ["Nền tảng tích hợp, chia sẻ dữ liệu quốc gia", "Chia sẻ dữ liệu giữa các bộ, ngành, địa phương"],
          ["Nền tảng chia sẻ, điều phối dữ liệu", "Kết nối, điều phối dữ liệu với Trung tâm dữ liệu quốc gia"],
          ["Nền tảng chia sẻ dữ liệu cấp bộ, cấp tỉnh", "Kết nối hệ thống trong nội bộ bộ, tỉnh và nối ra ngoài"],
          ["Hệ thống danh mục điện tử dùng chung", "Cung cấp mã đơn vị hành chính và danh mục thống nhất"],
          ["Hệ thống thông tin báo cáo Chính phủ", "Gửi, tổng hợp báo cáo điện tử thay báo cáo giấy"],
          ["Hệ thống giám sát, đo lường dịch vụ Chính phủ số", "Đo mức độ cung cấp và sử dụng dịch vụ công trực tuyến"]], { cls: "wrap" }),
          ui.note("Không còn Cổng Dịch vụ công cấp tỉnh (từ 01/7/2025) và cấp bộ (từ 01/3/2026). Trước khi đề xuất phần mềm mới, phải hỏi: <b>đã có nền tảng chung chưa?</b>", "key")),
        ui.panel("Kiểm kê Phường Mẫu: hệ thống nào đã là nền tảng dùng chung quốc gia", map));

      const cost = (N, o) => ({ rieng: N * (o.cxd + o.cbt * o.nam), chung: o.nxd + o.nvh * o.nam + N * o.ntk });
      function draw() {
        LAB.store.set("m7.nentang", S);
        const c = cost(S.N, S); const den = (S.cxd + S.cbt * S.nam) - S.ntk;
        const nStar = den > 0 ? Math.ceil((S.nxd + S.nvh * S.nam) / den) : null;
        const pts = []; for (let n = 1; n <= 200; n++) pts.push(n);
        const C = LAB.colors();
        S.chart = { title: "Tổng chi phí " + S.nam + " năm theo số đơn vị (triệu đồng, mô phỏng)", xlabel: "Số đơn vị N", ylabel: "Triệu đồng", xmin: 1, xmax: 200, ymin: 0, fmtX: v => Math.round(v) + "", fmtY: v => LAB.num(v), fmtTip: tr,
          series: [{ name: "Mỗi nơi tự làm", color: "eve", points: pts.map(n => [n, cost(n, S).rieng]) }, { name: "Nền tảng dùng chung", color: "ok", points: pts.map(n => [n, cost(n, S).chung]) }],
          vlines: [{ x: S.N, label: "N = " + S.N, color: C.key }].concat(nStar && nStar <= 200 ? [{ x: nStar, label: "Dùng chung rẻ hơn từ N = " + nStar, color: C.ok }] : []) };
        const reHon = c.chung < c.rieng;
        ro.render(ui.readouts([
          { k: "Mỗi nơi tự làm · " + S.nam + " năm", v: tr(c.rieng), kind: "eve", big: true },
          { k: "Nền tảng dùng chung · " + S.nam + " năm", v: tr(c.chung), kind: "ok", big: true },
          { k: reHon ? "Dùng chung tiết kiệm" : "Dùng chung đắt hơn", v: tr(Math.abs(c.rieng - c.chung)), kind: reHon ? "ok" : "eve" },
          { k: "Dùng chung rẻ hơn từ", v: nStar ? "N ≥ " + nStar + " đơn vị" : "Không bao giờ (xem đơn giá)", kind: "key" },
          { k: "Chi phí cho mỗi đơn vị", v: tr(c.rieng / S.N) + " / " + tr(c.chung / S.N), kind: "ct" }]));
        ss.render(ui.table(["Tiêu chí", "Mỗi nơi tự làm", "Nền tảng dùng chung"], [
          ["Số phiên bản phần mềm phải nuôi", { html: LAB.num(S.N), cls: "r mono" }, { html: "1", cls: "r mono" }],
          ["Số lần sửa khi quy định thay đổi", { html: LAB.num(S.N) + " lần", cls: "r mono" }, { html: "1 lần", cls: "r mono" }],
          ["Số hợp đồng, nhà cung cấp phải quản lý", { html: LAB.num(S.N), cls: "r mono" }, { html: "1", cls: "r mono" }],
          ["Nơi lưu dữ liệu", { html: LAB.num(S.N) + " kho phân tán, số liệu lệch nhau", cls: "r" }, { html: "1 kho liên thông, người dân khai một lần", cls: "r" }],
          ["Thời gian để bắt đầu dùng", { html: LAB.num(S.N) + " dự án đầu tư", cls: "r" }, { html: "Đăng ký là dùng được", cls: "r" }]], { cls: "tight" }));
        box.draw();
      }
      function drawMap() {
        const rows = HT(); const byL = LAB.stat.count(rows, "loai");
        const kind = l => l === "Nền tảng dùng chung quốc gia" ? "ok" : l === "Hệ thống của tỉnh" ? "aqua" : l === "Hệ thống đơn vị tự mua" ? "eve" : "key";
        const trung = rows.filter(r => r.tinh_trang === "Trùng chức năng");
        map.render(
          ui.readouts([...byL.entries()].map(([k, v]) => ({ k, v: String(v), kind: kind(k) }))),
          ui.table(["Mã", "Hệ thống", "Nghiệp vụ", "Loại", "Kết nối nền tảng chia sẻ", "Tình trạng"], rows.map(r => [r.ma, r.ten_he_thong, r.nghiep_vu_phuc_vu, ui.tag(r.loai, kind(r.loai)), r.ket_noi_nen_tang_chia_se, r.tinh_trang === "Trùng chức năng" ? ui.tag("Trùng chức năng", "eve") : r.tinh_trang]),
            { cls: "tight", rowCls: r => r[5] instanceof Node ? "bad" : (r[3].textContent === "Nền tảng dùng chung quốc gia" ? "good" : null) }),
          ui.note("<b>" + trung.length + " hệ thống đơn vị tự mua trùng chức năng</b> với nền tảng dùng chung: " + trung.map(r => r.ma + " " + r.ten_he_thong + " (" + LAB.num(r.chi_phi_nam_trieu_dong) + " tr/năm)").join("; ") + ". Tổng " + tr(LAB.stat.sum(trung.map(r => r.chi_phi_nam_trieu_dong))) + "/năm đang trả cho việc đã có nền tảng chung làm thay.", "eve"));
      }
      draw(); drawMap(); pane.appendChild(root);
    } },

  /* ============================================================ TAB 3: KIỂM CHỨNG TRỢ LÝ ẢO ============================================================ */
  { id: "troly", title: "Kiểm chứng trợ lý ảo",
    intro: "Sáu câu trả lời mẫu của một trợ lý ảo về pháp luật Chính phủ số, mỗi câu có 1–3 lỗi cài sẵn kiểu thường gặp. <b>Bấm vào các mệnh đề anh chị nghi ngờ</b>, rồi bấm \"Kiểm chứng\" để đối chiếu với văn bản gốc (Bài 7, phần 4 và bài thực hành).",
    build(pane) {
      // Chú thích: mỗi câu trả lời chia thành mệnh đề bấm được; mệnh đề có e = lỗi cài sẵn; chấm điểm phát hiện; bảng ghi lỗi tự điền; lưu + CSV.
      const TL = [
        { q: "Phường muốn chia sẻ dữ liệu hộ tịch với cơ quan cấp tỉnh. Căn cứ pháp lý là gì?", c: [
          { t: "Việc kết nối, chia sẻ dữ liệu giữa UBND phường và các cơ quan cấp tỉnh là bắt buộc theo quy định hiện hành." },
          { t: "Căn cứ áp dụng là Nghị định 47/2020/NĐ-CP ngày 09/4/2020 của Chính phủ, hiện vẫn đang có hiệu lực.", e: { l: "Văn bản đã được thay thế", d: "Nghị định 47/2020/NĐ-CP hết hiệu lực từ 22/10/2025; thay bằng Nghị định 278/2025/NĐ-CP ngày 22/10/2025 (Điều 23) về kết nối, chia sẻ dữ liệu bắt buộc." } },
          { t: "Dữ liệu được chia sẻ qua nền tảng chia sẻ dữ liệu cấp tỉnh, không gửi tệp qua thư điện tử hay nhóm chat." },
          { t: "Hướng dẫn kỹ thuật kết nối do Bộ Thông tin và Truyền thông ban hành trong năm 2026.", e: { l: "Tên cơ quan không còn đúng", d: "Bộ Thông tin và Truyền thông đã hợp nhất vào Bộ Khoa học và Công nghệ từ 01/3/2025 (Nghị định 55/2025/NĐ-CP). Năm 2026 không còn cơ quan này." } }] },
        { q: "Trung tâm dữ liệu quốc gia được quy định ở đâu, phường có dùng được không?", c: [
          { t: "Luật Dữ liệu số 60/2024/QH15 được Quốc hội thông qua ngày 30/11/2024." },
          { t: "Luật có hiệu lực từ ngày 01/01/2025.", e: { l: "Sai ngày hiệu lực", d: "Luật Dữ liệu 60/2024/QH15 có hiệu lực từ 01/7/2025." } },
          { t: "Luật quy định Trung tâm dữ liệu quốc gia do Chính phủ xây dựng, quản lý, khai thác và vận hành." },
          { t: "Đơn vị cấp xã có thể dùng hạ tầng của trung tâm dữ liệu tập trung thay vì tự đầu tư phòng máy chủ." }] },
        { q: "Người dân Phường Mẫu nộp hồ sơ trực tuyến ở đâu, theo quy định nào?", c: [
          { t: "Người dân nộp hồ sơ trực tuyến qua Cổng Dịch vụ công quốc gia tại địa chỉ dichvucong.gov.vn." },
          { t: "Hoặc nộp qua Cổng Dịch vụ công cấp tỉnh của Tỉnh Mẫu; hai cổng này hoạt động song song.", e: { l: "Thiết chế không còn duy trì", d: "Từ 01/7/2025 không duy trì Cổng Dịch vụ công cấp tỉnh (từ 01/3/2026 không duy trì cấp bộ). Cổng Dịch vụ công quốc gia là điểm một cửa số tập trung, duy nhất." } },
          { t: "Thủ tục hành chính theo cơ chế một cửa tại Bộ phận Một cửa thực hiện theo Nghị định 118/2025/NĐ-CP ngày 09/6/2025." },
          { t: "Theo Điều 72 Nghị định 118/2025/NĐ-CP, mọi hồ sơ trực tuyến phải được trả kết quả trong 24 giờ.", e: { l: "Bịa điều khoản", d: "Không tìm thấy điều khoản này trong văn bản gốc; thời hạn giải quyết do từng thủ tục quy định. Số điều nghe rất thật nhưng không kiểm chứng được thì phải coi là bịa." } }] },
        { q: "Phường phải bảo đảm an toàn hệ thống thông tin theo luật nào?", c: [
          { t: "Theo Luật An toàn thông tin mạng số 86/2015/QH13 và Luật An ninh mạng số 24/2018/QH14; cả hai đang có hiệu lực.", e: { l: "Văn bản đã được thay thế", d: "Cả hai luật hết hiệu lực từ 01/7/2026 theo khoản 2 Điều 44 Luật An ninh mạng số 116/2025/QH15 (thông qua 10/12/2025, hiệu lực 01/7/2026)." } },
          { t: "Hệ thống thông tin được phân loại theo 5 cấp độ, từ cấp độ 1 đến cấp độ 5." },
          { t: "Chủ quản hệ thống thông tin dùng ngân sách phải chỉ định cá nhân, bộ phận phụ trách về an ninh mạng." },
          { t: "Cơ quan đầu mối quản lý nhà nước về an ninh mạng là Bộ Khoa học và Công nghệ.", e: { l: "Sai cơ quan", d: "Khoản 2 Điều 39 Luật 116/2025/QH15: Bộ Công an là cơ quan đầu mối. Điều 39 không nêu đích danh Bộ Khoa học và Công nghệ." } }] },
        { q: "Khi xử lý hồ sơ có dữ liệu cá nhân, cán bộ Một cửa cần tuân theo gì?", c: [
          { t: "Việc bảo vệ dữ liệu cá nhân thực hiện theo Nghị định 13/2023/NĐ-CP ngày 17/4/2023 của Chính phủ.", e: { l: "Văn bản đã được thay thế", d: "Nghị định 13/2023/NĐ-CP hết hiệu lực từ 01/01/2026 (khoản 2 Điều 42 Nghị định 356/2025/NĐ-CP). Đang áp dụng: Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 và Nghị định 356/2025/NĐ-CP." } },
          { t: "Ảnh chụp thẻ căn cước của người nộp hồ sơ là dữ liệu cá nhân nhạy cảm." },
          { t: "Người dân im lặng khi được hỏi thì được coi là đã đồng ý cho xử lý dữ liệu.", e: { l: "Nội dung trái văn bản gốc", d: "Điều 9 Luật 91/2025/QH15: \"Sự im lặng hoặc không phản hồi không được coi là sự đồng ý.\" Sự đồng ý phải rõ ràng, theo từng mục đích, in hoặc sao chép được." } },
          { t: "Khi phát hiện vi phạm có thể gây tổn hại, phải thông báo cho cơ quan chuyên trách bảo vệ dữ liệu cá nhân chậm nhất 72 giờ." }] },
        { q: "Phường muốn thuê dịch vụ công nghệ thông tin thay vì mua máy chủ. Làm theo văn bản nào?", c: [
          { t: "Thuê dịch vụ công nghệ thông tin dùng ngân sách nhà nước thực hiện theo Nghị định 73/2019/NĐ-CP.", e: { l: "Văn bản đã được thay thế", d: "Nghị định 73/2019/NĐ-CP đã được thay bằng Nghị định 45/2026/NĐ-CP ngày 26/01/2026 (hiệu lực 01/3/2026)." } },
          { t: "Nghị định hiện hành quy định ba hình thức: đầu tư hệ thống, mua sắm thiết bị, thuê dịch vụ công nghệ thông tin." },
          { t: "Chiến lược quốc gia về chuyển đổi số giai đoạn 2026–2030 được ban hành tại Nghị định 1266/2026/NĐ-CP của Chính phủ.", e: { l: "Sai loại văn bản, sai cơ quan", d: "Đúng là Quyết định 1266/QĐ-TTg ngày 14/7/2026 của Thủ tướng Chính phủ." } },
          { t: "Dự án đầu tư chuyển đổi số phải bố trí tối thiểu 15 % tổng kinh phí cho an ninh mạng." }] }];
      const TONG_LOI = TL.reduce((s, a) => s + a.c.filter(c => c.e).length, 0);
      const DF = { ten: "", sel: {}, kc: false, loi: [{ neu: "", goc: "", loai: "" }, { neu: "", goc: "", loai: "" }, { neu: "", goc: "", loai: "" }] };
      const S = Object.assign({}, DF, LAB.store.get("m7.troly", {}));
      const save = () => LAB.store.set("m7.troly", S);
      const { root, ctrl, view } = ui.sim();
      const scoreSlot = ui.slot(), list = ui.slot(), bangLoi = ui.slot();
      ctrl.append(nameField("m7tl-ten", S, save),
        ui.btn("Kiểm chứng", () => { S.kc = true; save(); draw(); }, "pri"),
        h("div", { class: "row" }, ui.btn("Làm lại", () => { S.sel = {}; S.kc = false; save(); draw(); }, "sm"), ui.btn("Ví dụ mẫu: nghi ngờ mọi câu dẫn văn bản", () => { S.sel = {}; TL.forEach((a, i) => a.c.forEach((c, j) => { if (/\d+\/\d{4}|Điều|Bộ |Cổng/.test(c.t)) S.sel[i + "-" + j] = true; })); S.kc = false; save(); draw(); }, "sm")),
        scoreSlot,
        ui.cancu("Bài 7 — Năm bước dùng trợ lý ảo an toàn", "Xác định việc (chỉ giao soạn thảo) → Làm sạch dữ liệu (bỏ hết thông tin cá nhân) → Hỏi trợ lý ảo (bắt nêu rõ căn cứ) → <b>Kiểm chứng</b> (đối chiếu trên vbpl.vn) → Người ký chịu trách nhiệm (biên tập rồi mới ký)."),
        ui.panel("Sáu quy tắc dùng trợ lý ảo an toàn", li(["Không dán thông tin cá nhân của công dân vào công cụ chung", "Không dán tài liệu mật, dự thảo chưa công bố, dữ liệu nội bộ; cần hỏi thì viết lại dưới dạng ẩn danh", "Luôn đối chiếu căn cứ pháp lý với văn bản gốc trên vbpl.vn", "Máy chỉ tạo bản nháp; con người biên tập và chịu trách nhiệm", "Quy chế nội bộ ghi rõ: việc nào được dùng, ai kiểm tra", "Ghi chú trong hồ sơ khi bản nháp có hỗ trợ của máy"])),
        h("div", { class: "row" }, ui.btn("Tải CSV kiểm chứng", xuatKC, "sm"), ui.btn("Tải CSV bảng lỗi", xuatLoi, "sm")));
      view.append(ui.note("Càng sai thì câu chữ càng trôi chảy, càng giống văn hành chính. Hỏi lại chính trợ lý ảo <b>không phải</b> là kiểm chứng; chỉ văn bản gốc trên vbpl.vn, chinhphu.vn mới là căn cứ.", "key"), list,
        ui.panel("Bảng ghi lỗi của trợ lý ảo (học viên tự điền theo mẫu slide)", bangLoi));

      function ketQua() {
        let dung = 0, sot = 0, nham = 0;
        TL.forEach((a, i) => a.c.forEach((c, j) => { const s = !!S.sel[i + "-" + j]; if (c.e && s) dung++; else if (c.e) sot++; else if (s) nham++; }));
        return { dung, sot, nham, diem: Math.max(0, Math.min(100, Math.round(100 * (dung - 0.5 * nham) / TONG_LOI))) };
      }
      function draw() {
        const kq = ketQua();
        scoreSlot.render(S.kc ? h("div", { class: "row" }, Object.assign(ui.score(kq.diem, "điểm phát hiện", 100), { className: "score " + (kq.diem >= 70 ? "ok" : kq.diem >= 40 ? "" : "eve") }),
          ui.readouts([{ k: "Lỗi đã phát hiện", v: kq.dung + "/" + TONG_LOI, kind: "ok" }, { k: "Lỗi bỏ sót", v: String(kq.sot), kind: "eve" }, { k: "Báo nhầm (câu đúng)", v: String(kq.nham), kind: "key" }]))
          : ui.note("Đã chọn <b>" + Object.keys(S.sel).filter(k => S.sel[k]).length + "</b> mệnh đề nghi ngờ. Tổng số lỗi cài sẵn: " + TONG_LOI + ".", "mut"));
        list.render(TL.map((a, i) => {
          const pills = h("div", { class: "row" }, a.c.map((c, j) => {
            const k = i + "-" + j, on = !!S.sel[k];
            const p = h("button", { type: "button", class: "pill" + (on ? " on" : ""), onclick: () => { if (S.kc) return; S.sel[k] = !on; save(); draw(); } }, (j + 1) + ". " + c.t);
            p.style.whiteSpace = "normal"; p.style.textAlign = "left"; p.style.maxWidth = "100%";
            return p;
          }));
          const kids = [ui.title("Câu " + (i + 1), a.q), pills];
          if (S.kc) kids.push(ui.table(["Mệnh đề", "Anh chị", "Kết quả", "Văn bản gốc nói gì"], a.c.map((c, j) => {
            const s = !!S.sel[i + "-" + j];
            const tag = c.e && s ? ui.tag("Lỗi — đã phát hiện", "ok") : c.e ? ui.tag("Lỗi — bỏ sót", "eve") : s ? ui.tag("Báo nhầm — câu này đúng", "key") : ui.tag("Đúng", "mut");
            return [(j + 1) + ". " + c.t, s ? "Nghi ngờ" : "—", tag, c.e ? { html: "<b>" + c.e.l + ".</b> " + c.e.d } : "Khớp với CANCU."];
          }), { cls: "wrap", rowCls: (r, j) => a.c[j].e ? (S.sel[i + "-" + j] ? "good" : "bad") : (S.sel[i + "-" + j] ? "hi" : null) }));
          return ui.panel(null, ...kids);
        }));
        drawLoi();
      }
      function drawLoi() {
        const rows = S.loi.map((r, i) => [h("div", { class: "fld" }, h("input", { type: "text", id: "m7tl-neu" + i, value: r.neu, placeholder: "Trợ lý ảo nêu…", oninput: e => { r.neu = e.target.value; save(); } })),
          h("div", { class: "fld" }, h("input", { type: "text", id: "m7tl-goc" + i, value: r.goc, placeholder: "Văn bản gốc ghi…", oninput: e => { r.goc = e.target.value; save(); } })),
          h("div", { class: "fld" }, h("select", { id: "m7tl-loai" + i, onchange: e => { r.loai = e.target.value; save(); } }, ["", "Sai loại văn bản, sai cơ quan", "Sai ngày hiệu lực", "Tên cơ quan không còn đúng", "Văn bản đã được thay thế", "Thiết chế không còn duy trì", "Bịa điều khoản", "Nội dung trái văn bản gốc"].map(o => { const op = h("option", { value: o }, o || "— chọn loại lỗi —"); if (o === r.loai) op.selected = true; return op; }))),
          ui.btn("Xoá", () => { S.loi.splice(i, 1); save(); drawLoi(); }, "sm")]);
        bangLoi.render(
          ui.table(["Trợ lý ảo nêu", "Văn bản gốc", "Loại lỗi", ""], rows, { cls: "tight" }),
          h("div", { class: "row" }, ui.btn("Thêm dòng", () => { S.loi.push({ neu: "", goc: "", loai: "" }); save(); drawLoi(); }, "sm"),
            ui.btn("Gợi ý điền từ kết quả kiểm chứng", () => { if (!S.kc) { bangLoi.appendChild(ui.note("Hãy bấm \"Kiểm chứng\" trước.", "eve")); return; } S.loi = []; TL.forEach(a => a.c.forEach(c => { if (c.e) S.loi.push({ neu: c.t, goc: c.e.d, loai: c.e.l }); })); save(); drawLoi(); }, "sm")),
          ui.note("Ví dụ mẫu trên slide: \"Nghị định 1266/2026/NĐ-CP của Chính phủ\" → Quyết định 1266/QĐ-TTg ngày 14/7/2026 của Thủ tướng (sai loại văn bản, sai cơ quan); \"Luật Dữ liệu hiệu lực từ 01/01/2025\" → 01/7/2025 (sai ngày hiệu lực); \"Bộ Thông tin và Truyền thông\" → Bộ Khoa học và Công nghệ từ 01/3/2025; \"Quyết định 2568/QĐ-BTTTT, Khung 3.0\" → Quyết định 292/QĐ-BKHCN, Khung 4.0; \"Cổng dịch vụ công cấp tỉnh\" → Cổng Dịch vụ công quốc gia.", "mut"));
      }
      function xuatKC() {
        const rows = []; TL.forEach((a, i) => a.c.forEach((c, j) => rows.push([S.ten, "Câu " + (i + 1), c.t, S.sel[i + "-" + j] ? "Có" : "Không", c.e ? "Có" : "Không", c.e ? c.e.l : "", c.e ? c.e.d : ""])));
        LAB.csv.download("m7_kiem_chung_tro_ly_ao.csv", ["Họ tên", "Câu", "Mệnh đề", "Học viên nghi ngờ", "Có lỗi cài sẵn", "Loại lỗi", "Văn bản gốc"], rows);
      }
      function xuatLoi() { LAB.csv.download("m7_bang_loi_tro_ly_ao.csv", ["Họ tên", "Trợ lý ảo nêu", "Văn bản gốc", "Loại lỗi"], S.loi.map(r => [S.ten, r.neu, r.goc, r.loai])); }
      draw(); pane.appendChild(root);
    } },

  /* ============================================================ TAB 4: CẤP ĐỘ HỆ THỐNG THÔNG TIN ============================================================ */
  { id: "capdo", title: "Xác định cấp độ hệ thống thông tin",
    intro: "Với từng hệ thống trong kiểm kê của Phường Mẫu, trả lời bốn câu hỏi để <b>đề xuất cấp độ</b>, rồi so với cấp độ đã xác định (0 = chưa xác định). Năm cấp độ: nền móng lịch sử Điều 21 Luật 86/2015/QH13 (hết hiệu lực 01/7/2026); hiện hành Điều 8 Luật 116/2025/QH15 và Nghị định 331/2026/NĐ-CP (giữ 5 cấp độ).",
    build(pane) {
      // Chú thích: 4 câu hỏi (phạm vi, dữ liệu, gián đoạn, lộ lọt) → điểm 0–3 → cấp độ đề xuất 1–4; cấp độ 5 chỉ với an ninh quốc gia đặc biệt nghiêm trọng (ngoài phạm vi cấp xã).
      const CAU = [
        { k: "pv", label: "1. Ai dùng, ai được phục vụ?", ops: ["Nội bộ một bộ phận", "Toàn đơn vị (phường)", "Người dân, doanh nghiệp trong phường", "Nhiều địa phương, toàn quốc"] },
        { k: "dl", label: "2. Dữ liệu chính của hệ thống?", ops: ["Thông tin công khai", "Dữ liệu nội bộ, dữ liệu cá nhân cơ bản", "Dữ liệu cá nhân nhạy cảm, bí mật công tác", "Bí mật nhà nước"] },
        { k: "gd", label: "3. Gián đoạn một ngày thì sao?", ops: ["Không đáng kể", "Chậm vài hồ sơ, vài người bị ảnh hưởng", "Dừng dịch vụ của cả phường", "Ảnh hưởng nhiều địa phương, lợi ích công cộng"] },
        { k: "ll", label: "4. Bị lộ lọt, sửa trái phép thì tổn hại tới…", ops: ["Quyền, lợi ích hợp pháp của tổ chức, cá nhân", "Nghiêm trọng tới tổ chức, cá nhân; hoặc tới lợi ích công cộng", "Đặc biệt nghiêm trọng tới tổ chức, cá nhân; nghiêm trọng tới lợi ích công cộng; tới an ninh quốc gia", "Đặc biệt nghiêm trọng tới lợi ích công cộng, trật tự an toàn xã hội"] }];
      const MAU = { HT07: { pv: 2, dl: 1, gd: 1, ll: 1 }, HT09: { pv: 0, dl: 1, gd: 0, ll: 0 }, HT13: { pv: 1, dl: 2, gd: 1, ll: 1 }, HT14: { pv: 1, dl: 2, gd: 0, ll: 1 }, HT16: { pv: 1, dl: 2, gd: 0, ll: 1 }, HT17: { pv: 0, dl: 1, gd: 0, ll: 0 } };
      const rows = HT();
      const DF = { ten: "", ma: "HT07", tl: {} };
      const S = Object.assign({}, DF, LAB.store.get("m7.capdo", {}));
      const save = () => LAB.store.set("m7.capdo", S);
      const deXuat = a => { if (!a || ["pv", "dl", "gd", "ll"].some(k => a[k] == null)) return null; let lv = Math.max(1, Math.min(4, Math.round((a.pv + a.dl + a.gd) / 3) + 1)); return Math.max(lv, a.ll + 1); };
      const { root, ctrl, view } = ui.sim();
      const qSlot = ui.slot(), kq = ui.slot(), tong = ui.slot();
      const box = chart.box(b => chart.bars(b, S.chart));
      const sel = ui.select({ id: "m7cd-ma", label: "Hệ thống thông tin", options: rows.map(r => [r.ma, r.ma + " · " + r.ten_he_thong]), value: S.ma, onChange: v => { S.ma = v; save(); draw(); } });
      ctrl.append(nameField("m7cd-ten", S, save), sel, qSlot,
        ui.presets([{ label: "Ví dụ mẫu: 6 hệ thống chưa xác định", apply: () => { Object.keys(MAU).forEach(m => { S.tl[m] = Object.assign({}, MAU[m]); }); S.ma = "HT07"; sel.input.value = "HT07"; save(); draw(); } }]),
        h("div", { class: "row" }, ui.btn("Làm lại", () => { S.tl = {}; save(); draw(); }, "sm"), ui.btn("Tải CSV", xuat, "sm")),
        ui.cancu("Điều 8 Luật An ninh mạng số 116/2025/QH15 (hiệu lực 01/7/2026); Nghị định 331/2026/NĐ-CP ngày 19/8/2026", "Phân loại hệ thống thông tin theo <b>5 cấp độ</b> căn cứ mức độ tổn hại khi bị sự cố hoặc có hành vi vi phạm pháp luật về an ninh mạng. Khoản 1 Điều 45: hệ thống đã xác định cấp độ theo Luật 86/2015 tiếp tục giữ cấp độ; trong 12 tháng kể từ 01/7/2026 phải đáp ứng yêu cầu của Luật mới."));
      view.append(kq, tong, box,
        ui.panel("Năm cấp độ hệ thống thông tin", ui.table(["Cấp độ", h("span", null, "Luật 86/2015/QH13, Điều 21 ", ui.tag("Hết hiệu lực 01/7/2026", "eve")), h("span", null, "Luật 116/2025/QH15, Điều 8 ", ui.tag("Đang áp dụng", "ok"))], [
          ["Cấp độ 1", "Tổn hại quyền, lợi ích hợp pháp của tổ chức, cá nhân", "Tổn hại tới quyền và lợi ích hợp pháp của tổ chức, cá nhân"],
          ["Cấp độ 2", "Tổn hại nghiêm trọng quyền, lợi ích hợp pháp của tổ chức, cá nhân hoặc tổn hại lợi ích công cộng", "Tổn hại nghiêm trọng tới quyền, lợi ích hợp pháp của tổ chức, cá nhân hoặc tổn hại tới lợi ích công cộng"],
          ["Cấp độ 3", "Tổn hại nghiêm trọng tới sản xuất, lợi ích công cộng, trật tự an toàn xã hội hoặc tổn hại tới quốc phòng, an ninh quốc gia", "Tổn hại đặc biệt nghiêm trọng tới tổ chức, cá nhân; nghiêm trọng tới lợi ích công cộng; tổn hại hoặc nghiêm trọng tới trật tự, an toàn xã hội; hoặc tổn hại tới an ninh quốc gia"],
          ["Cấp độ 4", "Tổn hại đặc biệt nghiêm trọng tới lợi ích công cộng, trật tự an toàn xã hội hoặc nghiêm trọng tới quốc phòng, an ninh quốc gia", "Tổn hại đặc biệt nghiêm trọng tới lợi ích công cộng, trật tự, an toàn xã hội hoặc nghiêm trọng tới an ninh quốc gia"],
          ["Cấp độ 5", "Tổn hại đặc biệt nghiêm trọng tới quốc phòng, an ninh quốc gia", "Tổn hại đặc biệt nghiêm trọng tới an ninh quốc gia"]], { cls: "wrap" }),
          ui.note("Luật 116/2025 xét tổn hại <b>khi bị sự cố hoặc có hành vi vi phạm</b> (rộng hơn Luật 86/2015 chỉ nói \"khi bị phá hoại\"). Cấp độ 1–2: làm đủ 6 nhiệm vụ khoản 1 Điều 10 và chọn biện pháp theo khả năng; cấp độ 3–4: bắt buộc thêm các biện pháp a, d, đ, e, g, h khoản 2 Điều 10. Nghị định 85/2016/NĐ-CP là văn bản hướng dẫn Luật 86/2015 đã hết hiệu lực; nội dung cấp độ nay theo Nghị định 331/2026/NĐ-CP.", "mut"),
          noteHieuLuc()),
        ui.panel("Trách nhiệm của chủ quản hệ thống thông tin", ui.table(["Trách nhiệm", "Căn cứ", "Ví dụ ở Phường Mẫu"], [
          ["Bảo vệ hệ thống thông tin đúng cấp độ đã được xác định", "Điều 40 khoản 1 điểm a Luật 116/2025/QH15", "Hệ thống chưa xác định cấp độ (0) là chưa làm nhiệm vụ thứ nhất của Điều 10"],
          ["Kết nối hệ thống giám sát an ninh mạng, phòng chống mã độc tập trung về Trung tâm An ninh mạng quốc gia (Bộ Công an) hoặc của tỉnh", "Điều 40 khoản 1 điểm b", "Máy chủ đặt tại trụ sở phường chưa kết nối giám sát là lỗ hổng"],
          ["Báo cáo sự cố an ninh mạng với cơ quan chuyên trách của Bộ Công an hoặc Bộ Quốc phòng", "Điều 40 khoản 1 điểm c", "Lãnh đạo phường báo lên cơ quan chủ quản của tỉnh để báo cáo"],
          ["Có phương án bảo đảm an ninh mạng được thẩm định khi thiết lập, mở rộng, nâng cấp (hệ thống dùng ngân sách)", "Điều 40 khoản 2 điểm a", "Mua phần mềm mới phải có hồ sơ cấp độ (câu hỏi 6 trước khi ký)"],
          ["Chỉ định cá nhân, bộ phận phụ trách về an ninh mạng", "Điều 40 khoản 2 điểm b", "Quyết định phân công một công chức phụ trách, ghi rõ trong quy chế"],
          ["Người trực tiếp quản trị, vận hành hệ thống cấp độ 3, 4, 5 phải được tập huấn chuyên sâu và cấp chứng nhận", "Điều 34 khoản 2", "Hệ thống của tỉnh cấp độ 3: cán bộ kỹ thuật của tỉnh phải có chứng nhận"],
          ["Bố trí tối thiểu 15 % kinh phí chương trình, đề án, dự án chuyển đổi số cho an ninh mạng", "Điều 38 khoản 1", "Dự án 1 tỷ đồng: ít nhất 150 triệu cho an ninh mạng (không phải 15 % toàn bộ ngân sách CNTT)"]], { cls: "wrap" })));

      function drawQ() {
        const a = S.tl[S.ma] || {};
        qSlot.render(CAU.map(c => ui.select({ id: "m7cd-" + c.k, label: c.label, options: [["", "— chưa trả lời —"]].concat(c.ops.map((o, i) => [i, o])), value: a[c.k] == null ? "" : a[c.k], onChange: v => { S.tl[S.ma] = S.tl[S.ma] || {}; if (v === "") delete S.tl[S.ma][c.k]; else S.tl[S.ma][c.k] = +v; save(); draw(false); } })));
      }
      function draw(rq = true) {
        if (rq) drawQ();
        const r = rows.find(x => x.ma === S.ma), a = S.tl[S.ma], dx = deXuat(a), da = +r.cap_do_attt_da_xac_dinh;
        const items = [{ k: "Hệ thống", v: r.ma, kind: "aqua" }, { k: "Loại", v: r.loai, kind: "ct" }, { k: "Nơi đặt", v: r.noi_dat, kind: r.noi_dat === "Đám mây công cộng" ? "eve" : "aqua" }, { k: "Cấp độ đã xác định", v: da ? "Cấp độ " + da : "Chưa xác định", kind: da ? "key" : "eve", big: true }, { k: "Cấp độ đề xuất", v: dx ? "Cấp độ " + dx : "Trả lời đủ 4 câu", kind: dx ? "pt" : "mut", big: true }];
        let note;
        if (r.loai === "Ứng dụng công cộng") note = ui.note("<b>" + r.ten_he_thong + "</b> là ứng dụng công cộng, không phải hệ thống thông tin do cơ quan làm chủ quản — không thể xác định cấp độ, không thể phân quyền hay ghi nhật ký. Đang dùng để chuyển ảnh hồ sơ công dân là <b>rủi ro lộ dữ liệu cá nhân</b>; chỉ nên dùng để nhắc việc.", "eve");
        else if (!dx) note = ui.note("Trả lời đủ bốn câu hỏi ở cột trái để có đề xuất cấp độ.", "mut");
        else if (!da) note = ui.note("<b>Chưa xác định cấp độ.</b> Đây là nhiệm vụ thứ nhất trong 6 nhiệm vụ tại khoản 1 Điều 10 Luật 116/2025/QH15. Đề xuất cấp độ " + dx + "; cần lập hồ sơ đề xuất cấp độ và chỉ định bộ phận phụ trách an ninh mạng (Điều 40).", "eve");
        else if (dx === da) note = ui.note("Đề xuất <b>khớp</b> với cấp độ đã xác định (cấp độ " + da + "). Trong 12 tháng kể từ 01/7/2026 phải bảo đảm biện pháp bảo vệ tương ứng theo Luật mới (khoản 1 Điều 45).", "ok");
        else note = ui.note("Đề xuất (cấp độ " + dx + ") <b>khác</b> cấp độ đã xác định (cấp độ " + da + "). Theo khoản 1 Điều 45, hệ thống tiếp tục giữ cấp độ đã xác định; nếu phạm vi hoặc dữ liệu đã thay đổi thì kiến nghị chủ quản xác định lại.", "key");
        kq.render(ui.readouts(items), h("div", { class: "small" }, "Nghiệp vụ: " + r.nghiep_vu_phuc_vu + " · Dữ liệu chính: " + r.du_lieu_chinh + " · Đưa vào dùng: " + r.nam_dua_vao_su_dung + " · Cung cấp: " + r.don_vi_cung_cap), note);
        /* bảng tổng và biểu đồ */
        const cntDa = [0, 0, 0, 0, 0, 0], cntDx = [0, 0, 0, 0, 0, 0]; let chuaXD = 0, daTL = 0;
        const trows = rows.map(x => { const d = +x.cap_do_attt_da_xac_dinh, p = deXuat(S.tl[x.ma]); cntDa[d]++; if (p) { cntDx[p]++; daTL++; } else cntDx[0]++; if (!d) chuaXD++;
          const nx = !d && !p ? ui.tag("Chưa xác định — chưa đánh giá", "eve") : !d && p ? ui.tag("Chưa xác định — đề xuất cấp " + p, "key") : p && p !== d ? ui.tag("Lệch: đề xuất " + p, "key") : p ? ui.tag("Khớp", "ok") : ui.tag("Đã xác định", "mut");
          return [x.ma, x.ten_he_thong, x.loai, d ? String(d) : "0", p ? String(p) : "—", nx]; });
        tong.render(ui.readouts([{ k: "Hệ thống chưa xác định cấp độ", v: chuaXD + "/" + rows.length, kind: "eve", big: true }, { k: "Đã đánh giá trong bài", v: daTL + "/" + rows.length, kind: "pt" }]),
          ui.table(["Mã", "Hệ thống", "Loại", "Đã XĐ", "Đề xuất", "Nhận xét"], trows, { cls: "tight", rowCls: r => r[0] === S.ma ? "hi" : r[3] === "0" ? "bad" : null }));
        S.chart = { title: "Số hệ thống theo cấp độ", labels: ["Chưa XĐ", "Cấp 1", "Cấp 2", "Cấp 3", "Cấp 4", "Cấp 5"], series: [{ name: "Đã xác định (kiểm kê)", color: "key", values: cntDa }, { name: "Đề xuất của học viên", color: "pt", values: cntDx }], ylabel: "Hệ thống", intY: true, fmtTip: v => LAB.num(v) + " hệ thống" };
        box.draw();
      }
      function xuat() { LAB.csv.download("m7_cap_do_he_thong.csv", ["Họ tên", "Mã", "Hệ thống", "Loại", "Nơi đặt", "Cấp độ đã xác định", "Phạm vi", "Dữ liệu", "Gián đoạn", "Lộ lọt", "Cấp độ đề xuất"], rows.map(x => { const a = S.tl[x.ma] || {}; const g = (c, k) => a[k] == null ? "" : c.ops[a[k]]; return [S.ten, x.ma, x.ten_he_thong, x.loai, x.noi_dat, x.cap_do_attt_da_xac_dinh, g(CAU[0], "pv"), g(CAU[1], "dl"), g(CAU[2], "gd"), g(CAU[3], "ll"), deXuat(a) || ""]; })); }
      draw(); pane.appendChild(root);
    } },

  /* ============================================================ TAB 5: NHẬN DIỆN LỪA ĐẢO VÀ RỦI RO ============================================================ */
  { id: "ruiro", title: "Nhận diện lừa đảo và rủi ro",
    intro: "Mười hai tình huống (gồm đủ <b>Bài A – sáu tình huống</b> và <b>bảy rủi ro thường gặp</b> của Bài 8). Với mỗi tình huống, chọn <b>phân loại</b> theo ba khái niệm và <b>hành động đúng</b>, rồi chấm điểm. Kèm \"30 phút đầu khi phát hiện sự cố\".",
    build(pane) {
      // Chú thích: mỗi tình huống: pl = phân loại đúng (có thể nhiều), hd = 4 hành động, dung = chỉ số hành động đúng; 1 điểm phân loại + 1 điểm hành động.
      const PL = [["attt", "An toàn thông tin mạng"], ["anm", "An ninh mạng"], ["dlcn", "Bảo vệ dữ liệu cá nhân"], ["ok", "Bình thường, không có rủi ro"]];
      const plName = k => (PL.find(p => p[0] === k) || [])[1] || k;
      const TH = [
        { g: "Bài A · 1", n: "Tin nhắn: \"Hồ sơ của ông/bà bị lỗi, vào dichvucong-vn.info bổ sung trong 24 giờ\".", pl: ["anm"], hd: ["Bấm vào đường dẫn để bổ sung cho kịp hạn", "Không bấm; tự gõ dichvucong.gov.vn để kiểm tra hồ sơ; báo bộ phận công nghệ thông tin", "Chuyển tiếp tin nhắn vào nhóm chat của tổ để hỏi", "Gọi lại số đã nhắn để xác minh"], dung: 1, gt: "Tên miền giả gần giống tên miền thật, kèm hối thúc thời hạn — dấu hiệu lừa đảo điển hình. Cổng Dịch vụ công quốc gia chỉ ở dichvucong.gov.vn.", cc: "Điểm e khoản 2 Điều 7 Luật 116/2025/QH15: nghiêm cấm giả mạo trang thông tin điện tử của cơ quan, tổ chức." },
        { g: "Bài A · 2", n: "Cuộc gọi xưng là cán bộ, yêu cầu cài một ứng dụng để \"nâng mức định danh\".", pl: ["anm"], hd: ["Cài ứng dụng theo hướng dẫn vì người gọi biết đúng tên mình", "Hỏi lại số điện thoại rồi cài sau", "Gác máy; tra số công bố chính thức của cơ quan rồi gọi lại để kiểm tra; không cài gì", "Chỉ cài nếu người gọi gửi được ảnh thẻ cán bộ"], dung: 2, gt: "Cơ quan nhà nước không gọi điện yêu cầu cài ứng dụng hay đọc mã xác thực. Ứng dụng lạ thường chiếm quyền điều khiển điện thoại.", cc: "Điểm đ khoản 2 Điều 7 Luật 116/2025/QH15: lừa đảo chiếm đoạt tài sản; khoản 4: phát tán chương trình tin học gây hại." },
        { g: "Bài A · 3", n: "Thư điện tử mang tên lãnh đạo, xin gấp danh sách cán bộ kèm số căn cước, \"gửi trong 15 phút\".", pl: ["dlcn", "anm"], hd: ["Gửi ngay vì lãnh đạo đang cần gấp", "Gửi nhưng bỏ bớt cột số căn cước", "Không gửi; xác nhận trực tiếp với lãnh đạo qua kênh khác; báo bộ phận công nghệ thông tin", "Trả lời thư yêu cầu lãnh đạo xác nhận lại"], dung: 2, gt: "Thư giả danh để lấy dữ liệu cá nhân của cả cơ quan. Dấu hiệu: hối thúc, kênh bất thường, yêu cầu dữ liệu nhạy cảm. Trả lời thư là trả lời kẻ gian.", cc: "Điều 7 Luật 91/2025/QH15: cấm chiếm đoạt, cố ý làm lộ dữ liệu cá nhân; điểm h khoản 2 Điều 7 Luật 116/2025/QH15." },
        { g: "Bài A · 4", n: "Trang có giao diện quen thuộc; thanh địa chỉ hiện đúng dichvucong.gov.vn.", pl: ["ok"], hd: ["Thoát ra ngay vì mọi trang đều có thể giả", "Dùng bình thường bằng tài khoản định danh của mình; vẫn không đọc mã xác thực cho ai", "Gửi địa chỉ vào nhóm chat để mọi người kiểm tra giúp", "Chỉ dùng khi có cán bộ công nghệ thông tin ngồi cạnh"], dung: 1, gt: "Địa chỉ đúng của Cổng Dịch vụ công quốc gia; đây là tình huống an toàn. Thói quen đúng: luôn nhìn thanh địa chỉ trước khi đăng nhập.", cc: "Cổng Dịch vụ công quốc gia (dichvucong.gov.vn) là điểm một cửa số tập trung, duy nhất; Bộ Công an chủ trì vận hành từ 05/8/2026 (Nghị định 310/2026/NĐ-CP)." },
        { g: "Bài A · 5", n: "Tin nhắn báo hồ sơ đã có kết quả, không kèm đường dẫn, không hỏi thông tin gì.", pl: ["ok"], hd: ["Chặn số vì mọi tin nhắn đều đáng ngờ", "Nhắn lại số căn cước để xác nhận", "Tra cứu trạng thái hồ sơ trên Cổng Dịch vụ công quốc gia bằng tài khoản của mình, hoặc đến nhận theo giấy hẹn", "Gọi tổng đài ghi trong tin nhắn"], dung: 2, gt: "Tin nhắn thông báo không kèm đường dẫn, không xin thông tin là bình thường. Cách kiểm tra an toàn là tự tra cứu trên kênh chính thức.", cc: "Nghị định 310/2026/NĐ-CP: Cổng Dịch vụ công quốc gia kiểm tra tự động và phản hồi tự động cho người nộp." },
        { g: "Bài A · 6", n: "Người xưng nhân viên bưu điện, đọc đúng tên và địa chỉ, xin mã xác thực \"để giao kết quả\".", pl: ["anm"], hd: ["Đọc mã vì họ biết đúng tên và địa chỉ", "Không đọc mã; việc giao kết quả không cần mã xác thực; báo cơ quan nếu có dấu hiệu lộ thông tin", "Đọc một nửa mã để thử", "Hẹn đọc mã sau khi nhận hàng"], dung: 1, gt: "Mã xác thực là chìa khoá tài khoản. Biết đúng tên, địa chỉ không chứng minh được gì vì dữ liệu này có thể đã bị lộ.", cc: "Khoản 2 Điều 42 Luật 116/2025/QH15: người dùng có trách nhiệm bảo mật thông tin tài khoản số của mình." },
        { g: "Rủi ro 1", n: "Xuất hiện trang web giả mạo UBND Phường Mẫu, kêu gọi người dân nộp phí vào một tài khoản lạ.", pl: ["anm"], hd: ["Bỏ qua vì không phải trang của phường làm", "Báo công an và bộ phận công nghệ thông tin; đăng cảnh báo trên kênh chính thức của phường", "Tự vào trang giả để kiểm tra và bình luận cảnh báo", "Nhắn cho người thân biết là đủ"], dung: 1, gt: "Giả mạo trang thông tin điện tử của cơ quan là hành vi xâm phạm an ninh mạng; việc phải làm là báo công an để ngăn chặn, xử lý hành vi.", cc: "Điểm e khoản 2 Điều 7 Luật 116/2025/QH15; khoản 3 Điều 42: kịp thời cung cấp thông tin về hành vi xâm phạm cho cơ quan có thẩm quyền." },
        { g: "Rủi ro 2", n: "Cả tổ dùng chung một tài khoản hệ thống một cửa; mật khẩu dán trên màn hình.", pl: ["attt"], hd: ["Giữ nguyên cho tiện, chỉ cần không cho người ngoài vào", "Đổi mật khẩu mạnh hơn nhưng vẫn dùng chung", "Mỗi người một tài khoản, bật xác thực hai bước, gỡ giấy ghi mật khẩu", "Chỉ cho tổ trưởng giữ mật khẩu"], dung: 2, gt: "Dùng chung tài khoản thì không truy được ai sửa hồ sơ; một người lộ là cả tổ lộ. Mỗi người một tài khoản để có nhật ký truy cập.", cc: "Khoản 2 Điều 42 Luật 116/2025/QH15: bảo mật thông tin đăng ký, mở, quản lý, sử dụng tài khoản số; dùng tài khoản để vi phạm thì bị xử lý kỷ luật, hành chính hoặc hình sự." },
        { g: "Rủi ro 3 + 7", n: "Để hỏi đồng nghiệp, cán bộ chụp màn hình hồ sơ khai sinh còn nguyên tên, số định danh và ảnh thẻ căn cước, gửi vào nhóm Zalo của tổ.", pl: ["dlcn"], hd: ["Được, vì nhóm chỉ có người trong tổ", "Được, nếu xoá tin nhắn sau khi hỏi xong", "Không chụp; chuyển hồ sơ trên hệ thống nghiệp vụ; nếu buộc minh hoạ thì che hết dữ liệu; thu hồi ảnh đã gửi", "Gửi riêng cho từng người thay vì gửi nhóm"], dung: 2, gt: "Ảnh thẻ căn cước là dữ liệu cá nhân nhạy cảm; ảnh ra khỏi hệ thống là không thu hồi được. Nhóm chat chỉ để nhắc việc.", cc: "Điểm i khoản 1 Điều 4 Nghị định 356/2025/NĐ-CP (hình ảnh thẻ căn cước là dữ liệu nhạy cảm); khoản 7 Điều 7 Luật 91/2025/QH15 (cố ý làm lộ, làm mất dữ liệu cá nhân)." },
        { g: "Rủi ro 4", n: "Chép danh sách hộ nghèo (có số tài khoản nhận trợ cấp) ra USB để tối về nhà làm báo cáo.", pl: ["dlcn", "attt"], hd: ["Chép bình thường, báo cáo gấp là việc chung", "Chép nhưng đặt mật khẩu cho tệp Excel", "Làm trên hệ thống của cơ quan; nếu buộc phải mang về thì phải được lãnh đạo cho phép và có biện pháp bảo vệ", "Gửi tệp qua thư điện tử cá nhân thay vì USB"], dung: 2, gt: "Mất USB là mất cả danh sách; máy ở nhà không ai bảo vệ. Thông tin tài khoản, tài chính là dữ liệu nhạy cảm.", cc: "Điểm k khoản 1 Điều 4 Nghị định 356/2025/NĐ-CP; khoản 4 Điều 3 Luật 91/2025/QH15: đồng bộ biện pháp thể chế, kỹ thuật, con người." },
        { g: "Rủi ro 5", n: "Tải một phần mềm gộp tệp PDF miễn phí trên mạng về cài trên máy tính của Bộ phận Một cửa.", pl: ["attt"], hd: ["Cài vì phần mềm miễn phí, nhiều người dùng", "Cài rồi quét vi-rút sau", "Không cài; chỉ dùng phần mềm do bộ phận công nghệ thông tin duyệt; nếu đã cài thì gỡ và báo ngay", "Cài trên máy của đồng nghiệp để thử trước"], dung: 2, gt: "Mã độc theo phần mềm không rõ nguồn vào máy, gửi dữ liệu ra ngoài hoặc khoá hồ sơ.", cc: "Khoản 4 Điều 7 Luật 116/2025/QH15: cấm phát tán chương trình tin học gây hại; Điều 23 điểm a: cơ quan nhà nước phải có quy chế sử dụng mạng máy tính nội bộ." },
        { g: "Rủi ro 6", n: "Đang mở hồ sơ trên máy thì có việc, cán bộ để nguyên màn hình đăng nhập rồi rời quầy 15 phút.", pl: ["attt"], hd: ["Bình thường vì quầy có camera", "Nhờ người dân đứng gần trông giúp", "Khoá màn hình mỗi lần rời bàn; đặt máy tự khoá sau vài phút", "Tắt màn hình nhưng vẫn để đăng nhập"], dung: 2, gt: "Ai cũng xem, chụp, sửa được dưới tên đăng nhập của mình; mọi thao tác sẽ ghi vào nhật ký với tên cán bộ đó.", cc: "Khoản 2 Điều 42 Luật 116/2025/QH15 (bảo mật tài khoản số); Chỉ thị 14/CT-TTg: cán bộ là lực lượng tại chỗ, lớp bảo vệ thứ nhất." }];
      const DF = { ten: "", tl: {}, cham: false };
      const S = Object.assign({}, DF, LAB.store.get("m7.ruiro", {}));
      const save = () => LAB.store.set("m7.ruiro", S);
      const { root, ctrl, view } = ui.sim();
      const scoreSlot = ui.slot(), list = ui.slot();
      ctrl.append(nameField("m7rr-ten", S, save),
        ui.btn("Chấm điểm", () => { S.cham = true; save(); draw(); }, "pri"),
        h("div", { class: "row" }, ui.btn("Làm lại", () => { S.tl = {}; S.cham = false; save(); draw(); }, "sm"),
          ui.btn("Ví dụ mẫu: trả lời tình huống 1–3", () => { S.tl = {}; [0, 1, 2].forEach(i => { S.tl[i] = { pl: TH[i].pl[0], hd: TH[i].dung }; }); S.cham = false; save(); draw(); }, "sm"), ui.btn("Tải CSV", xuat, "sm")),
        scoreSlot,
        ui.cancu("Luật An ninh mạng số 116/2025/QH15 (hiệu lực 01/7/2026), Điều 7 khoản 2 điểm e, Điều 42", "Nghiêm cấm giả mạo trang thông tin điện tử của cơ quan, tổ chức, cá nhân. Người sử dụng không gian mạng có trách nhiệm bảo mật tài khoản số của mình; kịp thời cung cấp thông tin về nguy cơ, hành vi xâm phạm an ninh mạng cho cơ quan có thẩm quyền."),
        ui.cancu("Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 (hiệu lực 01/01/2026), Điều 7 và Điều 23", "Cấm chiếm đoạt, cố ý làm lộ, làm mất dữ liệu cá nhân. Khi phát hiện vi phạm có thể gây tổn hại, phải thông báo cho cơ quan chuyên trách bảo vệ dữ liệu cá nhân chậm nhất <b>72 giờ</b> kể từ khi phát hiện; lập biên bản xác nhận."),
        noteHieuLuc());
      view.append(ui.panel("Ba khái niệm — bảo vệ ba thứ khác nhau", ui.table(["Khái niệm", "Bảo vệ điều gì", "Luật đang áp dụng"], [
        [ui.tag("An toàn thông tin mạng", "aqua"), "Hệ thống thông tin và dữ liệu; chống sự cố, chống tấn công; giữ cho hệ thống chạy đúng", "Luật An ninh mạng số 116/2025/QH15"],
        [ui.tag("An ninh mạng", "eve"), "An ninh quốc gia, trật tự và an toàn xã hội trên mạng; chống hành vi xâm phạm (giả mạo, lừa đảo)", "Luật An ninh mạng số 116/2025/QH15"],
        [ui.tag("Bảo vệ dữ liệu cá nhân", "ct"), "Quyền của con người đối với dữ liệu về chính mình; người dân là chủ thể dữ liệu", "Luật số 91/2025/QH15, hiệu lực 01/01/2026"]], { cls: "wrap" })),
        list,
        ui.panel("Ba mươi phút đầu khi phát hiện sự cố", ui.steps([
          { t: "<b>Dừng thao tác.</b> Không tắt máy, không khởi động lại, không cài thêm gì." },
          { t: "<b>Ngắt kết nối mạng</b> nếu nghi nhiễm mã độc, nhưng giữ máy đang bật." },
          { t: "<b>Ghi lại</b> thời điểm, hiện tượng và việc mình vừa làm trước đó." },
          { t: "<b>Báo ngay</b> lãnh đạo trực tiếp và bộ phận phụ trách công nghệ thông tin." },
          { t: "<b>Đổi mật khẩu từ một máy khác</b> nếu nghi tài khoản bị chiếm." }]),
          h("div", { class: "cols" },
            ui.panel("Báo cho ai, theo thứ tự", li(["Lãnh đạo trực tiếp và bộ phận phụ trách công nghệ thông tin", "Cơ quan chủ quản báo cáo sự cố với cơ quan chuyên trách của Bộ Công an (Điều 40 Luật 116/2025/QH15)", "Vi phạm dữ liệu cá nhân: thông báo cơ quan chuyên trách chậm nhất 72 giờ, lập biên bản (Điều 23 Luật 91/2025/QH15)"])),
            ui.panel("Ba việc không được làm", li(["<b>Không</b> tự ý xoá tệp, xoá nhật ký, định dạng lại ổ đĩa \"cho sạch máy\" — mất dấu vết điều tra", "<b>Không</b> làm theo yêu cầu của người lạ đang liên hệ về sự cố", "<b>Không</b> đưa tin về sự cố lên mạng xã hội hay nhóm chat ngoài cơ quan"]))),
          ui.note("Báo sớm một giờ giảm rất nhiều thiệt hại; giấu sự cố luôn nặng thêm. Cán bộ vừa là lớp phòng thủ thứ nhất (Chỉ thị 14/CT-TTg ngày 07/6/2019: lực lượng tại chỗ), vừa là mắt xích dễ bị đánh lừa nhất.", "key")));

      function cham() { let pl = 0, hd = 0, tl = 0; TH.forEach((t, i) => { const a = S.tl[i]; if (!a) return; tl++; if (a.pl && t.pl.includes(a.pl)) pl++; if (a.hd === t.dung) hd++; }); return { pl, hd, tl, diem: Math.round(100 * (pl + hd) / (2 * TH.length)) }; }
      function draw() {
        const k = cham();
        scoreSlot.render(S.cham ? h("div", { class: "row" }, Object.assign(ui.score(k.diem, "điểm", 100), { className: "score " + (k.diem >= 75 ? "ok" : k.diem >= 50 ? "" : "eve") }),
          ui.readouts([{ k: "Phân loại đúng", v: k.pl + "/" + TH.length, kind: "pt" }, { k: "Hành động đúng", v: k.hd + "/" + TH.length, kind: "ok" }]))
          : ui.note("Đã trả lời <b>" + k.tl + "/" + TH.length + "</b> tình huống.", "mut"));
        list.render(TH.map((t, i) => {
          const a = S.tl[i] || {};
          const seg = ui.seg({ id: "m7rr-pl" + i, label: "Phân loại", options: PL, value: a.pl || "", onChange: v => { S.tl[i] = Object.assign({}, S.tl[i], { pl: v }); save(); if (S.cham) draw(); } });
          const tiles = ui.tiles({ items: t.hd.map((x, j) => ({ id: String(j), title: String.fromCharCode(65 + j) + ". " + x, kind: S.cham ? (j === t.dung ? "ok" : "eve") : "pt" })), value: a.hd == null ? null : String(a.hd), onChange: v => { S.tl[i] = Object.assign({}, S.tl[i], { hd: +v }); save(); if (S.cham) draw(); } });
          const kids = [ui.title(t.g, t.pl.includes("ok") ? "tình huống an toàn" : null), h("p", { style: { margin: "0", fontSize: "14px" } }, t.n), seg, h("div", { class: "small" }, "Hành động đúng là gì?"), tiles];
          if (S.cham) {
            const okPl = a.pl && t.pl.includes(a.pl), okHd = a.hd === t.dung;
            kids.push(h("div", { class: "row" }, ui.tag(okPl ? "Phân loại đúng" : "Phân loại: " + t.pl.map(plName).join(" / "), okPl ? "ok" : "eve"), ui.tag(okHd ? "Hành động đúng" : "Hành động đúng: " + String.fromCharCode(65 + t.dung), okHd ? "ok" : "eve")),
              ui.note(t.gt, okPl && okHd ? "ok" : "eve"), ui.cancu(t.cc));
          }
          return ui.panel(null, ...kids);
        }));
      }
      function xuat() { LAB.csv.download("m7_nhan_dien_rui_ro.csv", ["Họ tên", "Tình huống", "Nội dung", "Phân loại của học viên", "Phân loại đúng", "Hành động của học viên", "Hành động đúng", "Căn cứ"], TH.map((t, i) => { const a = S.tl[i] || {}; return [S.ten, t.g, t.n, plName(a.pl || ""), t.pl.map(plName).join(" / "), a.hd == null ? "" : t.hd[a.hd], t.hd[t.dung], t.cc]; })); }
      draw(); pane.appendChild(root);
    } },

  /* ============================================================ TAB 6: MA TRẬN RỦI RO VÀ CHECKLIST DỮ LIỆU CÁ NHÂN ============================================================ */
  { id: "dlcn", title: "Ma trận rủi ro và checklist dữ liệu cá nhân",
    intro: "(a) <b>Ma trận 5×5 khả năng × hậu quả</b> cho 10 rủi ro mẫu của Phường Mẫu, theo bốn bước quản lý rủi ro (Hướng dẫn quản lý rủi ro cho Chính phủ số DGA-1-2-5-210, bản 1.0, 29/11/2022). (b) <b>Checklist 15 điểm</b> bảo vệ dữ liệu cá nhân khi xử lý hồ sơ tại Bộ phận Một cửa (Luật 91/2025/QH15, Nghị định 356/2025/NĐ-CP).",
    build(pane) {
      // Chú thích: điểm rủi ro = khả năng × hậu quả (1–25); vùng theo ma trận slide; chiến lược xử lý: tránh, giảm thiểu, chuyển giao, chấp nhận; checklist đánh dấu → điểm.
      const KN = ["", "1 Hiếm", "2 Khó xảy ra", "3 Có thể", "4 Rất có khả năng", "5 Gần như chắc chắn"], HQ = ["", "1 Không đáng kể", "2 Nhỏ", "3 Vừa", "4 Lớn", "5 Nghiêm trọng"];
      const CL = ["", "Tránh", "Giảm thiểu", "Chuyển giao", "Chấp nhận"];
      const RR0 = [
        { t: "Gửi ảnh hồ sơ công dân qua nhóm chat cá nhân", k: 4, q: 4 }, { t: "Dùng chung tài khoản hệ thống một cửa", k: 3, q: 4 }, { t: "Máy tính Bộ phận Một cửa nhiễm mã độc", k: 2, q: 4 },
        { t: "Mất USB chứa danh sách đối tượng bảo trợ xã hội", k: 2, q: 4 }, { t: "Người dân bị lừa bởi trang web giả mạo phường", k: 3, q: 3 }, { t: "Cán bộ rời bàn không khoá màn hình", k: 4, q: 2 },
        { t: "Máy chủ đặt tại trụ sở hỏng, không có sao lưu", k: 2, q: 5 }, { t: "Mất điện, mất mạng kéo dài tại trụ sở", k: 3, q: 2 }, { t: "Giữ bản sao hồ sơ quá thời hạn, không xoá", k: 4, q: 2 }, { t: "Cài phần mềm miễn phí không rõ nguồn", k: 3, q: 3 }];
      const CK = [
        ["Tiếp nhận", "Chỉ nhận đúng thành phần hồ sơ đã công bố; không yêu cầu giấy tờ mà dữ liệu đã có trong hệ thống định danh", "Nghị định 320/2026/NĐ-CP (sửa khoản 4 Điều 4 NĐ 69/2024): không được yêu cầu nộp giấy tờ khi dữ liệu đã được tích hợp"],
        ["Tiếp nhận", "Chỉ thu thập dữ liệu cần cho đúng thủ tục đó, không hỏi thêm \"cho chắc\"", "Khoản 2 Điều 3 Luật 91/2025/QH15: đúng phạm vi, mục đích cụ thể, rõ ràng"],
        ["Tiếp nhận", "Người dân được biết dữ liệu của mình dùng để làm gì, ai xử lý, lưu tới bao giờ", "Điểm a khoản 1 Điều 4 Luật 91/2025/QH15: quyền được biết"],
        ["Tiếp nhận", "Khi cần sự đồng ý ngoài phạm vi thủ tục: đồng ý rõ ràng, theo từng mục đích, in hoặc sao chép được; không coi im lặng là đồng ý", "Điều 9 Luật 91/2025/QH15; Điều 19: phục vụ quản lý nhà nước không cần đồng ý nhưng phải có cơ chế giám sát"],
        ["Số hoá", "Quét hồ sơ trên máy của cơ quan; không dùng điện thoại cá nhân chụp hồ sơ", "Khoản 7 Điều 7 Luật 91/2025/QH15: cấm cố ý làm lộ, làm mất dữ liệu cá nhân"],
        ["Số hoá", "Hồ sơ có dữ liệu nhạy cảm (ảnh thẻ căn cước, sức khoẻ, tài khoản ngân hàng) được đánh dấu, phân quyền giới hạn truy cập", "Khoản 2 Điều 4 Nghị định 356/2025/NĐ-CP"],
        ["Số hoá", "Mỗi cán bộ dùng tài khoản riêng, bật xác thực hai bước, không chia sẻ mật khẩu", "Khoản 2 Điều 42 Luật 116/2025/QH15"],
        ["Xử lý", "Chuyển hồ sơ cho đồng nghiệp trên hệ thống nghiệp vụ; không qua nhóm chat, thư điện tử cá nhân", "Điểm c khoản 2 Điều 7 Luật 116/2025/QH15; khoản 7 Điều 7 Luật 91/2025/QH15"],
        ["Xử lý", "Không chụp màn hình hồ sơ; nếu buộc minh hoạ thì che hết dữ liệu định danh", "Điểm i khoản 1 Điều 4 Nghị định 356/2025/NĐ-CP (ảnh thẻ căn cước là dữ liệu nhạy cảm)"],
        ["Xử lý", "Khoá màn hình mỗi khi rời bàn; đặt tự khoá sau vài phút", "Chỉ thị 14/CT-TTg: lực lượng tại chỗ là lớp bảo vệ thứ nhất"],
        ["Xử lý", "Không chép dữ liệu ra USB, máy cá nhân; nếu bắt buộc phải được lãnh đạo cho phép và có biện pháp bảo vệ", "Khoản 4 Điều 3 Luật 91/2025/QH15: đồng bộ biện pháp thể chế, kỹ thuật, con người"],
        ["Trả kết quả", "Trả kết quả đúng người (xác minh danh tính) hoặc qua tài khoản của chính người dân trên Cổng Dịch vụ công quốc gia", "Nghị định 310/2026/NĐ-CP: tài khoản giao dịch điện tử là danh tính điện tử do hệ thống định danh tạo lập"],
        ["Trả kết quả", "Hướng dẫn người dân về quyền xem, chỉnh sửa, yêu cầu xoá dữ liệu và nơi phản ánh", "Khoản 1 Điều 4 Luật 91/2025/QH15; khoản 2 Điều 19: cơ chế tiếp nhận, xử lý phản ánh"],
        ["Lưu trữ, xoá", "Bản sao ngoài hệ thống được xoá khi xong việc; lưu trữ đúng thời hạn phù hợp với mục đích", "Khoản 3 Điều 3 Luật 91/2025/QH15: lưu trữ trong khoảng thời gian phù hợp với mục đích"],
        ["Lưu trữ, xoá", "Biết quy trình báo sự cố: lãnh đạo và bộ phận CNTT ngay; vi phạm dữ liệu cá nhân thông báo cơ quan chuyên trách chậm nhất 72 giờ", "Điều 23 Luật 91/2025/QH15; Điều 40 Luật 116/2025/QH15"]];
      const DF = { ten: "", rr: RR0.map(r => ({ k: r.k, q: r.q, cl: 0 })), ck: CK.map(() => false) };
      const S = Object.assign({}, DF, LAB.store.get("m7.dlcn", {}));
      if (!Array.isArray(S.rr) || S.rr.length !== RR0.length) S.rr = DF.rr; if (!Array.isArray(S.ck) || S.ck.length !== CK.length) S.ck = DF.ck;
      const save = () => LAB.store.set("m7.dlcn", S);
      const vung = (k, q) => k >= 3 && q >= 3 ? { t: "Ưu tiên xử lý ngay", s: "Hay xảy ra và thiệt hại lớn: phải có biện pháp bắt buộc (tránh hoặc giảm thiểu)", kind: "eve", cl: [1, 2] }
        : k >= 3 ? { t: "Theo dõi thường xuyên", s: "Hay xảy ra nhưng thiệt hại nhỏ: xử lý bằng quy trình và nhắc nhở (giảm thiểu)", kind: "key", cl: [2] }
        : q >= 3 ? { t: "Phòng ngừa, diễn tập", s: "Ít xảy ra nhưng thiệt hại lớn: lập phương án ứng phó, diễn tập (giảm thiểu hoặc chuyển giao)", kind: "ct", cl: [2, 3] }
        : { t: "Chấp nhận và ghi nhận", s: "Ít xảy ra, thiệt hại nhỏ: ghi vào sổ rủi ro, rà soát định kỳ (chấp nhận)", kind: "ok", cl: [4] };
      const { root, view } = ui.sim({ wide: true });
      const head = h("div", { class: "row" }, nameField("m7dl-ten", S, save), ui.btn("Ví dụ mẫu", () => { S.rr = RR0.map(r => ({ k: r.k, q: r.q, cl: vung(r.k, r.q).cl[0] })); S.ck = CK.map((c, i) => i % 3 !== 1); save(); draw(); }, "sm"), ui.btn("Làm lại", () => { S.rr = RR0.map(r => ({ k: r.k, q: r.q, cl: 0 })); S.ck = CK.map(() => false); save(); draw(); }, "sm"), ui.btn("Tải CSV ma trận", xuatRR, "sm"), ui.btn("Tải CSV checklist", xuatCK, "sm"));
      head.style.alignItems = "flex-end";
      const roA = ui.slot(), heat = ui.slot(), bang = ui.slot(), roB = ui.slot(), ckl = ui.slot();
      view.append(head,
        ui.panel("(a) Bước 2 — đánh giá: ma trận khả năng × hậu quả",
          ui.steps([{ t: "<b>Nhận diện:</b> đi theo vòng đời hồ sơ, mỗi khâu hỏi \"ở đây có thể xảy ra chuyện gì\"; ghi vào sổ rủi ro." }, { t: "<b>Đánh giá:</b> hai câu hỏi cho mỗi rủi ro — khả năng xảy ra cao hay thấp; nếu xảy ra thì thiệt hại nặng hay nhẹ.", hi: true }, { t: "<b>Xử lý:</b> tránh, giảm thiểu, chuyển giao, chấp nhận." }, { t: "<b>Theo dõi:</b> cập nhật sổ rủi ro, ghi rõ người chịu trách nhiệm; đặt chỉ số cảnh báo sớm (số lần đăng nhập sai, số phản ánh)." }]),
          roA, h("div", { class: "cols" }, heat, ui.slot().render(ui.note("<b>Cách đọc.</b> Hàng là khả năng xảy ra (5 trên cùng), cột là hậu quả (5 bên phải). Ô càng đậm thì điểm (khả năng × hậu quả) càng cao. Số trong ô là thứ tự rủi ro đang nằm ở đó. Chọn mức ở bảng dưới để các ô, điểm và thứ tự ưu tiên đổi ngay.", "mut"), ui.cancu("Hướng dẫn quản lý rủi ro cho Chính phủ số, DGA-1-2-5-210, bản 1.0 ngày 29/11/2022 (bản dịch tiếng Việt)", "Thang khả năng 5 mức (Hiếm → Gần như chắc chắn); thang tác động 5 mức (Không đáng kể → Nghiêm trọng). Bốn chiến lược xử lý: <b>tránh, giảm thiểu, chuyển giao, chấp nhận</b>. Công cụ: sổ đăng ký rủi ro và chỉ số rủi ro chính làm hệ thống cảnh báo sớm."))), bang),
        ui.panel("(b) Checklist bảo vệ dữ liệu cá nhân khi xử lý hồ sơ tại Bộ phận Một cửa", roB, ckl,
          ui.cancu("Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15, Điều 3 (sáu nguyên tắc), Điều 4 (quyền của chủ thể), Điều 9 (sự đồng ý); Nghị định 356/2025/NĐ-CP, Điều 3 và Điều 4 (dữ liệu cơ bản, nhạy cảm)", "Dữ liệu cá nhân cơ bản (11 nhóm, Điều 3 NĐ 356): họ tên, ngày sinh, giới tính, nơi thường trú, số định danh, số điện thoại, tình trạng hôn nhân, quan hệ gia đình, tài khoản số… Dữ liệu nhạy cảm (13 điểm, khoản 1 Điều 4): sức khoẻ, sinh trắc học, tội phạm, <b>hình ảnh thẻ căn cước</b>, tài khoản ngân hàng, đời sống riêng tư… Cơ quan giải quyết TTHC thường là <b>bên kiểm soát và xử lý</b> (Điều 2, Điều 37 khoản 3): chịu trách nhiệm cả hai vai, kể cả khi thuê đơn vị ngoài số hoá."),
          noteHieuLuc()));

      function draw() {
        /* (a) ma trận */
        const items = S.rr.map((r, i) => Object.assign({ i, t: RR0[i].t, diem: r.k * r.q, v: vung(r.k, r.q) }, r));
        const sorted = items.slice().sort((a, b) => b.diem - a.diem || b.q - a.q);
        const nCao = items.filter(x => x.v.t === "Ưu tiên xử lý ngay").length, daCL = items.filter(x => x.cl).length, hopCL = items.filter(x => x.cl && x.v.cl.includes(x.cl)).length;
        roA.render(ui.readouts([{ k: "Rủi ro ưu tiên xử lý ngay", v: String(nCao), kind: "eve", big: true }, { k: "Điểm cao nhất", v: sorted[0].diem + " · " + sorted[0].t, kind: "key" }, { k: "Đã chọn chiến lược xử lý", v: daCL + "/" + items.length, kind: "pt" }, { k: "Chiến lược hợp với vùng", v: hopCL + "/" + daCL, kind: "ok" }]));
        const grid = h("div", { class: "heat", style: { gridTemplateColumns: "minmax(70px,auto) repeat(5, minmax(0,1fr))" } });
        for (let k = 5; k >= 1; k--) {
          grid.appendChild(h("div", { class: "small", style: { display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "6px", fontSize: "11px" } }, KN[k]));
          for (let q = 1; q <= 5; q++) { const here = items.filter(x => x.k === k && x.q === q); const pct = Math.round(8 + (k * q) / 25 * 72);
            grid.appendChild(h("div", { class: "hc", title: KN[k] + " × " + HQ[q] + " = " + (k * q) + (here.length ? " — " + here.map(x => x.t).join("; ") : ""), style: { background: "color-mix(in srgb, var(--eve) " + pct + "%, var(--sunk))", fontWeight: here.length ? "700" : "400" } }, here.length ? here.map(x => x.i + 1).join(",") : String(k * q))); }
        }
        grid.appendChild(h("div")); for (let q = 1; q <= 5; q++) grid.appendChild(h("div", { class: "small", style: { textAlign: "center", fontSize: "11px" } }, HQ[q]));
        heat.render(h("div", { class: "small", style: { textAlign: "center" } }, "Khả năng xảy ra ↓ · Hậu quả →"), grid);
        bang.render(ui.table(["Ưu tiên", "Rủi ro", "Khả năng", "Hậu quả", "Điểm", "Vùng (ma trận slide)", "Chiến lược xử lý"], sorted.map((x, rank) => {
          const selK = h("select", { id: "m7dl-k" + x.i, onchange: e => { S.rr[x.i].k = +e.target.value; save(); draw(); } }, KN.slice(1).map((o, j) => { const op = h("option", { value: j + 1 }, o); if (j + 1 === x.k) op.selected = true; return op; }));
          const selQ = h("select", { id: "m7dl-q" + x.i, onchange: e => { S.rr[x.i].q = +e.target.value; save(); draw(); } }, HQ.slice(1).map((o, j) => { const op = h("option", { value: j + 1 }, o); if (j + 1 === x.q) op.selected = true; return op; }));
          const selC = h("select", { id: "m7dl-c" + x.i, onchange: e => { S.rr[x.i].cl = +e.target.value; save(); draw(); } }, CL.map((o, j) => { const op = h("option", { value: j }, o || "— chọn —"); if (j === x.cl) op.selected = true; return op; }));
          const clOk = !x.cl ? null : x.v.cl.includes(x.cl);
          return [{ html: String(rank + 1), cls: "c mono" }, (x.i + 1) + ". " + x.t, h("div", { class: "fld" }, selK), h("div", { class: "fld" }, selQ), { html: String(x.diem), cls: "c mono" }, h("div", null, ui.tag(x.v.t, x.v.kind), h("div", { class: "small" }, x.v.s)), h("div", { class: "fld" }, selC, clOk == null ? null : h("div", { class: "hint", style: { color: clOk ? "var(--ok)" : "var(--eve)" } }, clOk ? "Hợp với vùng" : "Gợi ý: " + x.v.cl.map(c => CL[c]).join(" hoặc ")))];
        }), { cls: "tight", rowCls: (r, i) => sorted[i].v.t === "Ưu tiên xử lý ngay" ? "bad" : sorted[i].v.t === "Chấp nhận và ghi nhận" ? "good" : null }));
        /* (b) checklist */
        const done = S.ck.filter(Boolean).length, diem = Math.round(100 * done / CK.length);
        roB.render(h("div", { class: "row" }, Object.assign(ui.score(diem, "điểm checklist", 100), { className: "score " + (diem >= 80 ? "ok" : diem >= 50 ? "" : "eve") }), ui.readouts([{ k: "Đã làm", v: done + "/" + CK.length, kind: "ok" }, { k: "Chưa làm", v: String(CK.length - done), kind: "eve" }, { k: "Khâu yếu nhất", v: khauYeu(), kind: "key" }])));
        const byStage = LAB.stat.groupBy(CK.map((c, i) => ({ i, st: c[0], t: c[1], cc: c[2] })), "st");
        ckl.render([...byStage.entries()].map(([st, arr]) => ui.panel(st + " (" + arr.filter(x => S.ck[x.i]).length + "/" + arr.length + ")", arr.map(x => h("div", { class: "stack", style: { gap: "2px" } }, ui.check({ id: "m7dl-ck" + x.i, label: (x.i + 1) + ". " + x.t, value: S.ck[x.i], onChange: v => { S.ck[x.i] = v; save(); draw(); } }), h("div", { class: "small", style: { paddingLeft: "26px" } }, "Căn cứ: " + x.cc))))));
      }
      function khauYeu() { const m = new Map(); CK.forEach((c, i) => { if (!m.has(c[0])) m.set(c[0], [0, 0]); m.get(c[0])[1]++; if (!S.ck[i]) m.get(c[0])[0]++; }); let best = null; m.forEach((v, k) => { if (!best || v[0] / v[1] > best.r) best = { k, r: v[0] / v[1], n: v[0] }; }); return best && best.n ? best.k + " (" + best.n + " chưa làm)" : "Không có"; }
      function xuatRR() { LAB.csv.download("m7_ma_tran_rui_ro.csv", ["Họ tên", "Rủi ro", "Khả năng", "Hậu quả", "Điểm", "Vùng", "Chiến lược xử lý"], S.rr.map((r, i) => { const v = vung(r.k, r.q); return [S.ten, RR0[i].t, KN[r.k], HQ[r.q], r.k * r.q, v.t, CL[r.cl]]; })); }
      function xuatCK() { LAB.csv.download("m7_checklist_du_lieu_ca_nhan.csv", ["Họ tên", "Khâu", "Điểm kiểm tra", "Đã làm", "Căn cứ"], CK.map((c, i) => [S.ten, c[0], c[1], S.ck[i] ? "Có" : "Không", c[2]])); }
      draw(); pane.appendChild(root);
    } }
  ]
});
})();
