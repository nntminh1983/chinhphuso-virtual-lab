/* Buổi 4 — Kiến trúc Chính phủ số: Khung Kiến trúc Chính phủ số Việt Nam 4.0 (Bài 4)
   Nguồn: _build/bai4.py (slide), _build/CANCU.md mục D và H, _build/nguon/khung40.txt (QĐ 292/QĐ-BKHCN, 25/3/2025).
   Dữ liệu chính: LAB.data.he_thong (18 hệ thống của UBND Phường Mẫu, Tỉnh Mẫu — hư cấu). */
(function () { "use strict";
const { h, ui, chart } = LAB;

/* ----------------------------- dùng chung cho cả mô-đun ----------------------------- */
const CC_QD292 = "Quyết định 292/QĐ-BKHCN ngày 25/3/2025 của Bộ Khoa học và Công nghệ";
const CC_KHUNG = "Khung Kiến trúc Chính phủ số Việt Nam, phiên bản 4.0 (QĐ 292/QĐ-BKHCN, 25/3/2025)";
const HT = () => LAB.data.he_thong || [];
/* màu theo loại hệ thống (vai trò): nền tảng dùng chung = đạt (lục), của tỉnh = cơ quan (lam ngọc), tự mua = dữ liệu rời (tím), công cộng = rủi ro (đỏ) */
const LOAI_KIND = { "Nền tảng dùng chung quốc gia": "ok", "Hệ thống của tỉnh": "aqua", "Hệ thống đơn vị tự mua": "ct", "Ứng dụng công cộng": "eve" };
const kindOf = r => LOAI_KIND[r.loai] || "pt";
/* 20 cơ sở dữ liệu quốc gia theo Quyết định 11/2026/QĐ-TTg (CANCU mục H4) */
const CSDLQG = [["Cơ sở dữ liệu tổng hợp quốc gia", "Bộ Công an"], ["Về dân cư", "Bộ Công an"], ["Định danh địa điểm", "Bộ Công an"], ["Danh tính điện tử", "Bộ Công an"],
  ["Về xuất nhập cảnh", "Bộ Công an"], ["Về xử lý vi phạm hành chính", "Bộ Công an"], ["Về trí tuệ nhân tạo", "Bộ Công an"], ["Về tài chính", "Bộ Tài chính"],
  ["Về đăng ký doanh nghiệp", "Bộ Tài chính"], ["Về bảo hiểm", "Bộ Tài chính"], ["Về đất đai", "Bộ Nông nghiệp và Môi trường"], ["Về biến đổi khí hậu", "Bộ Nông nghiệp và Môi trường"],
  ["Về cán bộ, công chức, viên chức", "Bộ Nội vụ"], ["Về an sinh xã hội", "Bộ Nội vụ"], ["Tài liệu lưu trữ Phông lưu trữ nhà nước Việt Nam", "Bộ Nội vụ"], ["Về thủ tục hành chính", "Bộ Tư pháp"],
  ["Về hoạt động xây dựng", "Bộ Xây dựng"], ["Về y tế", "Bộ Y tế"], ["Về giáo dục và đào tạo", "Bộ Giáo dục và Đào tạo"], ["Về kiểm soát tài sản, thu nhập", "Thanh tra Chính phủ"]];
const CC_CSDL = "Quyết định 11/2026/QĐ-TTg ngày 28/3/2026 của Thủ tướng Chính phủ (Danh mục cơ sở dữ liệu quốc gia, hiệu lực 19/5/2026)";
const trieu = n => LAB.num(n) + " triệu đồng/năm";
const tenHT = ma => { const r = HT().find(x => x.ma === ma); return r ? r.ten_he_thong : ma; };
const now = () => LAB.date.vn(new Date());
/* ô nhập trong bảng: chuỗi người dùng nhập đi qua .value, không qua innerHTML */
const cellInput = (id, value, onInput, o = {}) => { const i = h("input", { id, type: "text", placeholder: o.placeholder, list: o.list, style: { width: (o.w || 160) + "px" } }); i.value = value || ""; i.addEventListener("input", () => onInput(i.value)); return i; };
const cellSelect = (id, options, value, onChange, w) => { const s = h("select", { id, style: { width: (w || 170) + "px" } }, options.map(([v, l]) => { const e = h("option", { value: v }, l); if (String(v) === String(value)) e.selected = true; return e; })); s.addEventListener("change", () => onChange(s.value)); return s; };

LAB.module({
  id: "m4",
  tabs: [

  /* =====================================================================================
     TAB 1 — Có và không có kiến trúc tổng thể
     Từ kiểm kê 18 hệ thống: nối từng đôi (n(n−1)/2) so với nối qua nền tảng (n); trùng chức năng, chi phí, cấp độ ATTT. */
  { id: "cokhong", title: "Có và không có kiến trúc tổng thể",
    intro: "Bản quy hoạch cho hệ thống thông tin gọi là <b>kiến trúc tổng thể</b>. Bật công tắc để thấy 18 hệ thống của Phường Mẫu khi <i>mỗi hệ thống tự nối từng đôi</i> và khi <i>nối qua một nền tảng chia sẻ</i> (slide Bài 4, phần 1).",
    build(pane) {
      const S = { mode: "khong", n: 18 };
      const rows = HT();
      const { root, ctrl, view } = ui.sim();
      const seg = ui.seg({ id: "m4ck-mode", label: "Cách tổ chức hệ thống", options: [["khong", "Không có kiến trúc"], ["co", "Có kiến trúc"]], value: S.mode, onChange: v => { S.mode = v; draw(); } });
      const rng = ui.range({ id: "m4ck-n", label: "Số hệ thống cần liên thông", min: 3, max: 40, step: 1, value: S.n, fmt: v => v + " hệ thống", hint: "18 = đúng kiểm kê Phường Mẫu; kéo để thấy số kết nối từng đôi tăng nhanh thế nào.", onInput: v => { S.n = v; draw(); } });
      ctrl.append(seg, rng,
        ui.presets([
          { label: "Phường Mẫu hôm nay (18, chưa có kiến trúc)", apply: () => { S.mode = "khong"; S.n = 18; seg.querySelector(".seg").set("khong"); rng.set(18); draw(); } },
          { label: "Phường Mẫu theo khung kiến trúc", apply: () => { S.mode = "co"; S.n = 18; seg.querySelector(".seg").set("co"); rng.set(18); draw(); } },
          { label: "Một tỉnh có 40 hệ thống", apply: () => { S.mode = "khong"; S.n = 40; seg.querySelector(".seg").set("khong"); rng.set(40); draw(); } }]),
        ui.btn("Làm lại", () => { S.mode = "khong"; S.n = 18; seg.querySelector(".seg").set("khong"); rng.set(18); draw(); }, "sm"),
        ui.cancu(CC_KHUNG + " — Chương 1, Mục I.2", "Tăng cường khả năng kết nối, chia sẻ dữ liệu, dùng chung các tài nguyên công nghệ thông tin…; tăng cường khả năng giám sát, đánh giá đầu tư công nghệ thông tin; hướng tới triển khai Chính phủ số đồng bộ, lộ trình phù hợp, <b>hạn chế trùng lặp</b>."));
      const out = ui.slot(), svgSlot = ui.slot(), kho = ui.slot(), tinhHuong = ui.slot();
      const box = chart.box(b => chart.line(b, S.chart));
      view.append(out, svgSlot, box, kho, tinhHuong);

      /* vẽ mạng lưới (từng đôi) hoặc hình sao (qua nền tảng) */
      function veSVG() {
        const n = S.n, W = 520, Hh = 420, cx = 260, cy = 212, R = 168;
        const svg = LAB.svg("svg", { class: "diag", viewBox: "0 0 " + W + " " + Hh, role: "img", "aria-label": "Sơ đồ kết nối giữa các hệ thống" });
        const pts = []; for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / n; pts.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]); }
        const real = n === rows.length;
        const trung = i => real && rows[i].tinh_trang === "Trùng chức năng";
        if (S.mode === "khong") {
          for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) svg.appendChild(LAB.svg("line", { x1: pts[i][0], y1: pts[i][1], x2: pts[j][0], y2: pts[j][1], stroke: "var(--eve)", "stroke-opacity": n > 24 ? 0.25 : 0.45, "stroke-width": 1 }));
        } else {
          for (let i = 0; i < n; i++) if (!trung(i)) svg.appendChild(LAB.svg("line", { x1: cx, y1: cy, x2: pts[i][0], y2: pts[i][1], stroke: "var(--ok)", "stroke-width": 1.6 }));
          svg.appendChild(LAB.svg("rect", { x: cx - 92, y: cy - 26, width: 184, height: 52, rx: 8, fill: "var(--ok-bg)", stroke: "var(--ok)", "stroke-width": 2 }));
          svg.appendChild(LAB.svg("text", { x: cx, y: cy - 6, "text-anchor": "middle", class: "lbl", style: "font-weight:600" }, "Nền tảng chia sẻ,"));
          svg.appendChild(LAB.svg("text", { x: cx, y: cy + 11, "text-anchor": "middle", class: "lbl", style: "font-weight:600" }, "điều phối dữ liệu"));
        }
        pts.forEach((p, i) => {
          const r = real ? rows[i] : null, kind = r ? kindOf(r) : "aqua", bo = trung(i) && S.mode === "co";
          const g = LAB.svg("g", { opacity: bo ? 0.3 : 1 });
          g.appendChild(LAB.svg("circle", { cx: p[0], cy: p[1], r: n > 24 ? 7 : 10, fill: "var(--" + kind + ")", stroke: "var(--panel)", "stroke-width": 2, "stroke-dasharray": trung(i) && S.mode === "khong" ? "3 2" : null }));
          g.appendChild(LAB.svg("title", null, r ? r.ma + " — " + r.ten_he_thong + " (" + r.loai + (r.tinh_trang !== "Đang dùng" ? "; " + r.tinh_trang : "") + ")" : "Hệ thống " + (i + 1)));
          if (n <= 24) { const dx = p[0] - cx, dy = p[1] - cy, L = Math.hypot(dx, dy) || 1; g.appendChild(LAB.svg("text", { x: p[0] + dx / L * 20, y: p[1] + dy / L * 20 + 4, "text-anchor": "middle", style: "font-size:10.5px" }, r ? r.ma : "HT" + String(i + 1).padStart(2, "0"))); }
          if (bo) g.appendChild(LAB.svg("text", { x: p[0], y: p[1] + 4, "text-anchor": "middle", style: "font-size:11px;fill:var(--eve);font-weight:700" }, "×"));
          svg.appendChild(g);
        });
        return svg;
      }
      function draw() {
        const n = S.n, co = S.mode === "co";
        const ketNoi = co ? n : n * (n - 1) / 2;
        const trung = rows.filter(r => r.tinh_trang === "Trùng chức năng");
        const tuMua = rows.filter(r => r.loai === "Hệ thống đơn vị tự mua");
        const chiPhi = LAB.stat.sum(rows.map(r => r.chi_phi_nam_trieu_dong));
        const chiPhiTrung = LAB.stat.sum(trung.map(r => r.chi_phi_nam_trieu_dong));
        const chuaCapDo = rows.filter(r => +r.cap_do_attt_da_xac_dinh === 0);
        out.render(ui.readouts([
          { k: "Số kết nối phải xây dựng, duy trì", v: LAB.num(ketNoi) + (co ? " (= n)" : " (= n(n−1)/2)"), kind: co ? "ok" : "eve", big: true },
          { k: "Hệ thống trùng chức năng (kiểm kê)", v: co ? "0 — đã hợp nhất " + trung.length : String(trung.length), kind: co ? "ok" : "eve" },
          { k: "Chi phí tự mua phần mềm", v: trieu(co ? chiPhi - chiPhiTrung : chiPhi), kind: co ? "ok" : "ct" },
          { k: "Hệ thống chưa xác định cấp độ ATTT", v: co ? "0 — kiến trúc ATTT yêu cầu xác định" : String(chuaCapDo.length), kind: co ? "ok" : "eve" }]),
          ui.note(co
            ? "<b>Có kiến trúc:</b> mỗi hệ thống chỉ cần <b>một</b> đường nối vào Nền tảng chia sẻ, điều phối dữ liệu (ở cấp tỉnh là Nền tảng tích hợp, chia sẻ dữ liệu cấp tỉnh); kiến trúc ứng dụng liệt kê danh mục nên hai phần mềm trùng chức năng bị phát hiện và hợp nhất; kiến trúc an toàn thông tin buộc mọi hệ thống phải xác định cấp độ."
            : "<b>Không có kiến trúc:</b> muốn " + LAB.num(n) + " hệ thống nói chuyện được với nhau phải xây và nuôi <b>" + LAB.num(ketNoi) + "</b> đường nối riêng, mỗi đường một chuẩn; không ai nhìn thấy bức tranh chung nên phần mềm trùng nhau, dữ liệu nhập đi nhập lại, hệ thống tự mua không được xác định cấp độ an toàn.", co ? "ok" : "eve"));
        svgSlot.render(h("div", { class: "row small" }, Object.keys(LOAI_KIND).map(k => h("span", { class: "pill" }, h("span", { style: { display: "inline-block", width: "9px", height: "9px", borderRadius: "50%", background: "var(--" + LOAI_KIND[k] + ")", marginRight: "5px" } }), k + " (" + rows.filter(r => r.loai === k).length + ")"))), veSVG(),
          n !== rows.length ? h("div", { class: "small" }, "Đang xem số hệ thống giả định; các ô trùng chức năng, chi phí, cấp độ vẫn tính từ kiểm kê 18 hệ thống của Phường Mẫu.") : null);
        const pts1 = [], pts2 = []; for (let k = 2; k <= 40; k++) { pts1.push([k, k * (k - 1) / 2]); pts2.push([k, k]); }
        S.chart = { title: "Số kết nối theo số hệ thống", series: [{ name: "Nối từng đôi: n(n−1)/2", color: "eve", points: pts1 }, { name: "Nối qua nền tảng: n", color: "ok", points: pts2 }], xlabel: "số hệ thống (n)", ylabel: "số kết nối", xmin: 2, xmax: 40, ymin: 0, aspect: 0.4, vlines: [{ x: n, label: "n = " + n, color: "var(--key)" }], fmtX: v => String(Math.round(v)), fmtY: v => LAB.num(v), xticks: [2, 5, 10, 15, 20, 25, 30, 35, 40] };
        box.draw();
        /* kho dữ liệu trùng: cùng một đối tượng nằm ở nhiều hệ thống + đã có cơ sở dữ liệu quốc gia */
        const chuDe = [["Hộ kinh doanh", ["ho kinh doanh"], "Về đăng ký doanh nghiệp"], ["Cán bộ, công chức", ["can bo"], "Về cán bộ, công chức, viên chức"], ["Hồ sơ thủ tục hành chính", ["ho so tthc", "ho so"], "Về thủ tục hành chính"]];
        kho.render(ui.title("Cùng một dữ liệu, nằm ở mấy nơi?", "tính từ cột nghiệp vụ và dữ liệu chính của kiểm kê"),
          ui.table(["Đối tượng dữ liệu", "Hệ thống đang giữ ở Phường Mẫu", "Số kho", "Cơ sở dữ liệu quốc gia đã có (QĐ 11/2026/QĐ-TTg)", co ? "Theo kiến trúc dữ liệu" : "Hệ quả"],
            chuDe.map(([ten, keys, csdl]) => { const hs = rows.filter(r => keys.some(k => LAB.khongDau(r.du_lieu_chinh + " " + r.nghiep_vu_phuc_vu).includes(k))); const soKho = hs.length + 1;
              return [ten, hs.map(r => r.ma + " " + r.ten_he_thong).join("; "), { html: "<b>" + soKho + "</b>", cls: "c" }, csdl, co ? { html: "Một nguồn gốc: dùng lại " + csdl + " qua nền tảng; các kho còn lại chỉ là bản sao có đồng bộ", cls: "ok-c" } : { html: "Nhập " + soKho + " lần, " + soKho + " kiểu ghi khác nhau; dân vẫn phải nộp lại giấy tờ", cls: "eve-c" }]; }), { cls: "wrap" }));
        tinhHuong.render(ui.title("Ba tình huống quen thuộc và gốc rễ của chúng", "bảng theo slide Bài 4"),
          ui.table(["Tình huống ở cơ quan", "Gốc rễ về kiến trúc", "Khung kiến trúc xử lý thế nào", "Ở Phường Mẫu"], [
            ["Hai phần mềm cùng quản lý một loại hồ sơ", "Không có danh mục ứng dụng chung", "Kiến trúc ứng dụng liệt kê và hợp nhất danh mục", trung.map(r => r.ma + " " + r.ten_he_thong).join("; ")],
            ["Tên đơn vị hành chính mỗi nơi ghi một kiểu", "Không dùng danh mục dùng chung", "Kiến trúc dữ liệu chuẩn hoá danh mục, mã số", "Hệ thống danh mục điện tử dùng chung (mã đơn vị hành chính)"],
            ["Không biết dữ liệu nào đang có, ai giữ", "Không có danh mục dữ liệu", "Kiến trúc dữ liệu mô tả danh mục đối tượng quản lý", LAB.stat.uniq(rows, "du_lieu_chinh").length + " loại dữ liệu chính rải ở " + rows.length + " hệ thống"],
            ["Mua máy chủ rồi để không, nơi khác lại thiếu", "Không có bức tranh hạ tầng chung", "Kiến trúc công nghệ mô tả hạ tầng toàn cơ quan", rows.filter(r => r.noi_dat === "Máy chủ tại đơn vị").length + " hệ thống chạy trên máy chủ riêng tại đơn vị (" + tuMua.length + " hệ thống tự mua)"]], { cls: "wrap" }),
          ui.note("Tất cả đều là hậu quả của việc <b>xây trước, quy hoạch sau</b>. Khi đơn vị đề xuất một dự án công nghệ thông tin, người thẩm định sẽ hỏi: <i>dự án này nằm ở đâu trong khung kiến trúc?</i>", "key"));
      }
      draw(); pane.appendChild(root);
    } },

  /* =====================================================================================
     TAB 2 — Sơ đồ Khung Kiến trúc 4.0 (SVG tương tác) + bốn phiên bản + so sánh 3.0/4.0 */
  { id: "sodo40", title: "Sơ đồ Khung Kiến trúc 4.0",
    intro: "Sơ đồ khái quát Khung Kiến trúc Chính phủ số Việt Nam 4.0 (Chương 3). Bấm vào từng khối để đọc mô tả theo văn bản và xem hệ thống nào của Phường Mẫu đang nằm ở khối đó.",
    build(pane) {
      const rows = HT();
      const by = pred => rows.filter(pred).map(r => r.ma);
      /* các khối của sơ đồ: id, tầng, nhãn (mảng dòng), mô tả theo Khung 4.0 Chương 3 Mục II, hệ thống Phường Mẫu tương ứng */
      const TANG = [["nsd", "Người sử dụng"], ["kenh", "Kênh giao tiếp"], ["ungdung", "Ứng dụng và dữ liệu"], ["nentang", "Nền tảng tích hợp, chia sẻ dữ liệu"], ["hatang", "Hạ tầng kỹ thuật – công nghệ"]];
      const K = [
        { id: "nd", t: "nsd", l: ["Người dân"], mo: "Tác nhân sử dụng dịch vụ Chính phủ số (Mục II.1). Ở Phường Mẫu: người nộp hồ sơ, người phản ánh hiện trường.", ht: [] },
        { id: "dn", t: "nsd", l: ["Doanh nghiệp,", "hộ kinh doanh"], mo: "Doanh nghiệp và đại diện của doanh nghiệp; ở cấp xã chủ yếu là hộ kinh doanh đăng ký, thay đổi nội dung đăng ký.", ht: [] },
        { id: "cb", t: "nsd", l: ["Cán bộ, công chức,", "viên chức"], mo: "Người dùng nội bộ: tiếp nhận, xử lý hồ sơ, ký số, báo cáo.", ht: [] },
        { id: "cq", t: "nsd", l: ["Cơ quan, tổ chức", "liên quan"], mo: "Các cơ quan, tổ chức, cá nhân liên quan: công an, cơ sở y tế, bảo hiểm… phối hợp dữ liệu với phường.", ht: [] },
        { id: "cdvc", t: "kenh", l: ["Cổng Dịch vụ công", "quốc gia"], mo: "Cổng Dịch vụ công trực tuyến: ở quốc gia là Cổng Dịch vụ công quốc gia; từ 01/7/2025 là điểm một cửa số duy nhất, không còn Cổng Dịch vụ công cấp tỉnh (Mục II.2 và II.8).", ht: by(r => r.ma === "HT02") },
        { id: "vneid", t: "kenh", l: ["Ứng dụng di động", "(VNeID, VssID…)"], mo: "Ứng dụng trên nền tảng thiết bị di động như Ứng dụng Định danh điện tử (VNeID), Ứng dụng Bảo hiểm xã hội số (VssID) (Mục II.2).", ht: [] },
        { id: "cong", t: "kenh", l: ["Cổng/Trang thông tin", "điện tử; Cổng dữ liệu"], mo: "Cổng/Trang thông tin điện tử các cơ quan nhà nước; Cổng dữ liệu (Mục II.2).", ht: by(r => r.ma === "HT10") },
        { id: "tongdai", t: "kenh", l: ["Tổng đài, SMS,", "thư điện tử"], mo: "Ngoài Internet: điện thoại (Tổng đài hỗ trợ), SMS; thư điện tử (Mục II.2).", ht: by(r => r.ma === "HT11") },
        { id: "mxh", t: "kenh", l: ["Mạng xã hội được", "phép cung cấp thông tin"], mo: "Mạng xã hội do cơ quan nhà nước cho phép cung cấp thông tin trên môi trường mạng theo quy định (Mục II.2) — chỉ để <b>cung cấp thông tin</b>, không phải nơi chuyển hồ sơ của người dân.", ht: by(r => r.ma === "HT16"), canhbao: "Nhóm Zalo điều hành (HT16) đang chứa ảnh hồ sơ: không thuộc kênh được kiến trúc an toàn thông tin kiểm soát." },
        { id: "motcua", t: "kenh", l: ["Bộ phận Một cửa,", "Trung tâm phục vụ HCC"], mo: "Trực tiếp tại Trung tâm phục vụ hành chính công hoặc Bộ phận Một cửa (Mục II.2).", ht: by(r => r.ma === "HT17") },
        { id: "tthc", t: "ungdung", l: ["HTTT giải quyết TTHC", "cấp bộ, cấp tỉnh"], mo: "Hợp nhất Cổng Dịch vụ công và Hệ thống một cửa điện tử cấp tỉnh để tiếp nhận, giải quyết, theo dõi thủ tục hành chính (Mục II.20.d).", ht: by(r => r.ma === "HT01") },
        { id: "qlvb", t: "ungdung", l: ["Hệ thống quản lý văn bản", "và điều hành"], mo: "Tin học hoá quy trình tác nghiệp, văn bản điện tử thay văn bản giấy (Mục II.20.c).", ht: by(r => r.ma === "HT03") },
        { id: "baocao", t: "ungdung", l: ["HTTT báo cáo", "bộ, ngành, địa phương"], mo: "Thu thập, tích hợp, chia sẻ dữ liệu báo cáo; kết nối Hệ thống thông tin báo cáo Chính phủ (Mục II.10 và II.20.b).", ht: by(r => r.ma === "HT15") },
        { id: "chuyennganh", t: "ungdung", l: ["HTTT, CSDL chuyên ngành", "của bộ, tỉnh, đơn vị"], mo: "Hệ thống phục vụ nghiệp vụ chuyên ngành theo phạm vi quản lý (Mục II.20.a). Đây là nơi phần mềm tự mua của đơn vị phải được <b>liệt kê trong kiến trúc ứng dụng</b>.", ht: by(r => ["HT06", "HT07", "HT08", "HT09", "HT13", "HT14", "HT18"].includes(r.ma)) },
        { id: "csdlqg", t: "ungdung", l: ["Các cơ sở dữ liệu", "quốc gia"], mo: "Danh mục theo pháp luật hiện hành (Mục II.18) — nay là 20 cơ sở dữ liệu quốc gia theo QĐ 11/2026/QĐ-TTg. Phường Mẫu dùng lại: dân cư, đất đai, đăng ký doanh nghiệp, an sinh xã hội, thủ tục hành chính.", ht: [] },
        { id: "htqg", t: "ungdung", l: ["Các hệ thống thông tin", "quốc gia, nền tảng dùng chung"], mo: "Nền tảng định danh và xác thực điện tử, kho dữ liệu tổng hợp, Cổng dữ liệu quốc gia data.gov.vn, các nền tảng số quy mô từ Trung ương đến địa phương (Mục II.19).", ht: by(r => ["HT04", "HT05"].includes(r.ma)) },
        { id: "danhmuc", t: "ungdung", l: ["Hệ thống danh mục", "điện tử dùng chung"], mo: "Mã đơn vị hành chính, định danh cơ quan nhà nước, mã ngành nghề kinh doanh… dùng thống nhất toàn quốc (Mục II.15). Đây là lời giải cho 'tên đơn vị hành chính mỗi nơi ghi một kiểu'.", ht: [] },
        { id: "khodl", t: "ungdung", l: ["Kho dữ liệu dùng chung,", "Cổng dữ liệu cấp tỉnh"], mo: "Kho dữ liệu dùng chung và Nền tảng tổng hợp, phân tích dữ liệu cấp tỉnh; Cổng dữ liệu cấp tỉnh tích hợp với Cổng dữ liệu quốc gia (Mục II.20.e, g).", ht: [] },
        { id: "ntqg", t: "nentang", l: ["Nền tảng tích hợp, chia sẻ", "dữ liệu quốc gia"], mo: "Do Bộ Khoa học và Công nghệ chủ trì; tích hợp, chia sẻ dữ liệu giữa các bộ, ngành, địa phương theo hình thức kết nối tập trung và kết nối trực tiếp phân tán (Mục II.6). Tên gọi cũ: NDXP.", ht: [] },
        { id: "ntdp", t: "nentang", l: ["Nền tảng chia sẻ, điều phối", "dữ liệu (TTDL quốc gia)"], mo: "<b>Khái niệm mới theo Luật Dữ liệu 60/2024/QH15</b>: hạ tầng kết nối, tích hợp, chia sẻ và điều phối dữ liệu giữa Trung tâm dữ liệu quốc gia với các cơ quan, tổ chức, cá nhân (Mục II.6). Theo NĐ 278/2025/NĐ-CP, mọi kết nối, chia sẻ bắt buộc phải qua nền tảng này, chậm nhất 31/12/2026.", ht: [] },
        { id: "nttinh", t: "nentang", l: ["Nền tảng tích hợp, chia sẻ", "dữ liệu cấp bộ, cấp tỉnh"], mo: "Chia sẻ, tích hợp các hệ thống trong nội bộ tỉnh và nối lên nền tảng quốc gia (Mục II.7). Tên gọi cũ: LGSP. Ở Phường Mẫu: các hệ thống có cột 'kết nối nền tảng chia sẻ' = Có.", ht: by(r => r.ket_noi_nen_tang_chia_se === "Có") },
        { id: "ttdlqg", t: "hatang", l: ["Trung tâm dữ liệu", "quốc gia"], mo: "Do Chính phủ xây dựng, vận hành; hình thành kho dữ liệu về con người và kho dữ liệu tổng hợp (Mục II.3). Cơ sở dữ liệu quốc gia phải dùng hạ tầng của Trung tâm (Luật Dữ liệu, Điều 30 khoản 2).", ht: by(r => r.noi_dat === "Trung ương") },
        { id: "ttdltinh", t: "hatang", l: ["Trung tâm dữ liệu", "cấp bộ, cấp tỉnh"], mo: "Phục vụ các hệ thống của tỉnh và phân hệ cơ sở dữ liệu quốc gia tại địa phương (Mục II.3).", ht: by(r => r.noi_dat === "Trung tâm dữ liệu tỉnh") },
        { id: "cloud", t: "hatang", l: ["Nền tảng điện toán", "đám mây"], mo: "Phần mềm hệ thống: nền tảng điện toán đám mây, phần mềm lớp giữa (Mục II.3). Nguyên tắc g: ứng dụng hiệu quả điện toán đám mây theo lộ trình phù hợp.", ht: by(r => /Đám mây/.test(r.noi_dat)), canhbao: "Đám mây công cộng (HT16) khác với đám mây của cơ quan nhà nước." },
        { id: "mtsl", t: "hatang", l: ["Mạng truyền số liệu", "chuyên dùng"], mo: "Các hệ thống Chính phủ số dùng Mạng truyền số liệu chuyên dùng của các cơ quan Đảng, Nhà nước, kết hợp hạ tầng mạng khác (Mục II.3).", ht: [] },
        { id: "maychu", t: "hatang", l: ["Máy chủ, lưu trữ,", "máy trạm tại đơn vị"], mo: "Hạ tầng công nghệ thông tin: máy chủ, thiết bị lưu trữ, sao lưu, mạng, máy tính trạm (Mục II.3). Kiến trúc công nghệ phải mô tả cả máy chủ riêng của đơn vị.", ht: by(r => /Máy chủ tại đơn vị|Máy tính cá nhân/.test(r.noi_dat)) },
        { id: "pki", t: "hatang", l: ["Hạ tầng khoá", "công khai"], mo: "Hạ tầng khoá công khai phục vụ chữ ký số (Mục II.3). Ở Phường Mẫu: ký số văn bản trên HT03.", ht: by(r => /ký số/.test(r.nghiep_vu_phuc_vu)) },
        { id: "attt", t: "doc", l: ["An toàn thông tin mạng,", "an ninh mạng"], mo: "Chạy xuyên suốt mọi tầng (Mục II.4): hệ thống hỗ trợ giám sát, phòng chống tấn công mạng; Hệ thống SOC quốc gia; thực thi theo Mô hình tham chiếu SRM. Ở Phường Mẫu mới " + rows.filter(r => +r.cap_do_attt_da_xac_dinh > 0).length + "/" + rows.length + " hệ thống đã xác định cấp độ.", ht: by(r => +r.cap_do_attt_da_xac_dinh === 0), nhan: "chưa xác định cấp độ" },
        { id: "chidao", t: "doc", l: ["Chỉ đạo,", "chính sách"], mo: "Chỉ đạo, quản lý, tổ chức, hướng dẫn, đào tạo, môi trường pháp lý, truyền thông bảo đảm điều kiện triển khai (Mục II.5). Ở phường: Ban Chỉ đạo chuyển đổi số, kế hoạch hằng năm, bồi dưỡng cán bộ.", ht: [] }];
      const DUONG = ["nd", "vneid", "cdvc", "tthc", "nttinh", "ntqg", "csdlqg", "htqg", "ttdltinh", "ttdlqg", "attt"];
      const S = { sel: null, to: "thanhphan", duong: false };
      const { root, ctrl, view } = ui.sim();
      const sel = ui.select({ id: "m4sd-khoi", label: "Chọn khối trên sơ đồ", options: [["", "— bấm vào sơ đồ hoặc chọn —"], ...K.map(k => [k.id, k.l.join(" ")])], value: "", onChange: v => { S.sel = v || null; S.duong = false; draw(); } });
      const to = ui.seg({ id: "m4sd-to", label: "Tô màu khối", options: [["thanhphan", "Theo tầng"], ["phuong", "Có hệ thống của Phường Mẫu"]], value: S.to, onChange: v => { S.to = v; draw(); } });
      ctrl.append(sel, to,
        ui.presets([{ label: "Đường đi của một hồ sơ khai sinh trực tuyến", apply: () => { S.duong = true; S.sel = null; sel.input.value = ""; draw(); } },
          { label: "Khối mới của phiên bản 4.0", apply: () => { S.duong = false; S.sel = "ntdp"; sel.input.value = "ntdp"; draw(); } }]),
        ui.btn("Làm lại", () => { S.sel = null; S.duong = false; S.to = "thanhphan"; sel.input.value = ""; to.querySelector(".seg").set("thanhphan"); draw(); }, "sm"),
        ui.cancu(CC_KHUNG + " — Chương 3, Mục I", "Sơ đồ khái quát cung cấp bức tranh tổng thể về các thành phần chính…; là cơ sở để xây dựng, triển khai Khung kiến trúc số cấp bộ và Khung kiến trúc số cấp tỉnh bảo đảm đồng bộ, hiệu quả, kết nối."),
        ui.note("Khung 4.0 còn dẫn Nghị định 47/2020/NĐ-CP về kết nối, chia sẻ dữ liệu — văn bản này " + ui.tag("Hết hiệu lực", "eve").outerHTML + " từ 22/10/2025, thay bằng Nghị định 278/2025/NĐ-CP.", "eve"));
      const svgSlot = ui.slot(), mota = ui.slot(), bang = ui.slot();
      view.append(svgSlot, mota, bang);
      const tangKind = { nsd: "pt", kenh: "pt", ungdung: "ct", nentang: "ok", hatang: "aqua", doc: "key" };
      function veSoDo() {
        const W = 960, Hh = 600;
        const svg = LAB.svg("svg", { class: "diag", viewBox: "0 0 " + W + " " + Hh, role: "img", "aria-label": "Sơ đồ khái quát Khung Kiến trúc Chính phủ số Việt Nam 4.0" });
        const X0 = 92, X1 = 868, ys = { nsd: [8, 78], kenh: [96, 90], ungdung: [196, 190], nentang: [396, 86], hatang: [492, 100] };
        const dim = id => (S.duong && !DUONG.includes(id)) || (S.sel && S.sel !== id) ? 0.38 : 1;
        TANG.forEach(([t, ten]) => { const [y, hh] = ys[t]; svg.appendChild(LAB.svg("rect", { x: X0, y, width: X1 - X0, height: hh, rx: 8, fill: "var(--sunk)", stroke: "var(--line)" })); svg.appendChild(LAB.svg("text", { x: X0 + 10, y: y + 15, class: "lbl", style: "font-size:11px;letter-spacing:.08em;text-transform:uppercase;fill:var(--faint)" }, ten)); });
        const block = (k, x, y, w, hh) => {
          const kind = S.to === "phuong" ? (k.ht.length ? "key" : "pt") : tangKind[k.t];
          const chon = S.sel === k.id || (S.duong && DUONG.includes(k.id));
          const g = LAB.svg("g", { opacity: dim(k.id), style: "cursor:pointer" });
          g.appendChild(LAB.svg("rect", { x, y, width: w, height: hh, rx: 6, fill: S.to === "phuong" && !k.ht.length ? "var(--panel)" : "var(--" + kind + "-bg)", stroke: chon ? "var(--key)" : "var(--" + kind + ")", "stroke-width": chon ? 3 : 1.2 }));
          k.l.forEach((ln, i) => g.appendChild(LAB.svg("text", { x: x + w / 2, y: y + hh / 2 + (i - (k.l.length - 1) / 2) * 14 + 4, "text-anchor": "middle", class: "lbl", style: "font-size:11.5px;fill:var(--ink)" }, ln)));
          if (k.ht.length) { g.appendChild(LAB.svg("circle", { cx: x + w - 11, cy: y + 11, r: 9, fill: "var(--key)" })); g.appendChild(LAB.svg("text", { x: x + w - 11, y: y + 15, "text-anchor": "middle", style: "font-size:10.5px;fill:var(--knock);font-weight:700" }, String(k.ht.length))); }
          g.appendChild(LAB.svg("title", null, k.l.join(" ") + (k.ht.length ? " — " + k.ht.length + " hệ thống của Phường Mẫu" : "")));
          g.addEventListener("click", () => { S.sel = S.sel === k.id ? null : k.id; S.duong = false; sel.input.value = S.sel || ""; draw(); });
          svg.appendChild(g);
        };
        const hang = (t, ids, y, hh) => { const ks = ids.map(id => K.find(k => k.id === id)); const gap = 8, w = (X1 - X0 - 20 - gap * (ks.length - 1)) / ks.length; ks.forEach((k, i) => block(k, X0 + 10 + i * (w + gap), y, w, hh)); };
        hang("nsd", ["nd", "dn", "cb", "cq"], 28, 50);
        hang("kenh", ["cdvc", "vneid", "cong", "tongdai", "mxh", "motcua"], 118, 60);
        hang("ungdung", ["tthc", "qlvb", "baocao", "chuyennganh"], 220, 72);
        hang("ungdung", ["csdlqg", "htqg", "danhmuc", "khodl"], 304, 72);
        hang("nentang", ["ntqg", "ntdp", "nttinh"], 418, 56);
        hang("hatang", ["ttdlqg", "ttdltinh", "cloud", "mtsl", "maychu", "pki"], 514, 70);
        /* hai cột dọc xuyên suốt */
        [["attt", 6], ["chidao", 880]].forEach(([id, x]) => { const k = K.find(q => q.id === id), chon = S.sel === id || (S.duong && DUONG.includes(id));
          const g = LAB.svg("g", { opacity: dim(id), style: "cursor:pointer" });
          g.appendChild(LAB.svg("rect", { x, y: 8, width: 74, height: 584, rx: 8, fill: "var(--key-bg)", stroke: chon ? "var(--key)" : "var(--line)", "stroke-width": chon ? 3 : 1.2 }));
          k.l.forEach((ln, i) => g.appendChild(LAB.svg("text", { x: x + 30 + i * 16, y: 300, "text-anchor": "middle", class: "lbl", transform: "rotate(-90 " + (x + 30 + i * 16) + " 300)", style: "font-size:12px;fill:var(--ink);font-weight:600" }, ln)));
          if (k.ht.length && id === "attt") { g.appendChild(LAB.svg("circle", { cx: x + 37, cy: 580, r: 10, fill: "var(--eve)" })); g.appendChild(LAB.svg("text", { x: x + 37, y: 584, "text-anchor": "middle", style: "font-size:10.5px;fill:var(--knock);font-weight:700" }, String(k.ht.length))); }
          g.appendChild(LAB.svg("title", null, k.l.join(" ")));
          g.addEventListener("click", () => { S.sel = S.sel === id ? null : id; S.duong = false; sel.input.value = S.sel || ""; draw(); });
          svg.appendChild(g); });
        /* mũi tên đường đi hồ sơ */
        if (S.duong) { const pathY = [[480, 28 + 50], [480, 118], [480, 118 + 60], [480, 220], [480, 292], [480, 304 + 72], [480, 418], [480, 474], [480, 514]]; for (let i = 0; i + 1 < pathY.length; i += 2) svg.appendChild(LAB.svg("line", { x1: pathY[i][0], y1: pathY[i][1], x2: pathY[i + 1][0], y2: pathY[i + 1][1], stroke: "var(--key)", "stroke-width": 3, "stroke-dasharray": "6 4" })); }
        return svg;
      }
      function draw() {
        svgSlot.render(veSoDo(), h("div", { class: "small" }, "Số trong vòng tròn: số hệ thống trong kiểm kê Phường Mẫu thuộc khối đó (cột an toàn thông tin: số hệ thống chưa xác định cấp độ). Tên các khối theo Khung 4.0, Chương 3, Mục II."));
        if (S.duong) {
          mota.render(ui.title("Đường đi của một hồ sơ khai sinh trực tuyến"), ui.steps([
            { t: "<b>Người dân</b> đăng nhập bằng tài khoản định danh điện tử trên <b>VNeID</b> hoặc <b>Cổng Dịch vụ công quốc gia</b> (kênh giao tiếp)." },
            { t: "Hồ sơ chuyển về <b>Hệ thống thông tin giải quyết thủ tục hành chính cấp tỉnh</b> (HT01), cán bộ phường tiếp nhận." },
            { t: "Hệ thống hỏi dữ liệu dân cư, hộ tịch qua <b>Nền tảng tích hợp, chia sẻ dữ liệu cấp tỉnh</b> → <b>Nền tảng tích hợp, chia sẻ dữ liệu quốc gia</b> (các hệ thống đặt tại Trung tâm dữ liệu quốc gia nối qua <b>Nền tảng chia sẻ, điều phối dữ liệu</b>).", hi: true },
            { t: "<b>Cơ sở dữ liệu quốc gia về dân cư</b> trả thông tin cha mẹ; <b>Phần mềm hộ tịch điện tử dùng chung</b> (HT04) ghi khai sinh — người dân không phải nộp lại giấy tờ Nhà nước đã có (Luật Dữ liệu 60/2024/QH15, Điều 11 khoản 2 điểm b)." },
            { t: "Mọi bước chạy trên <b>Trung tâm dữ liệu tỉnh / quốc gia</b>, dưới sự giám sát của cột <b>An toàn thông tin mạng, an ninh mạng</b>." }]));
        } else if (S.sel) {
          const k = K.find(q => q.id === S.sel); const hs = rows.filter(r => k.ht.includes(r.ma));
          mota.render(ui.title(k.l.join(" "), TANG.concat([["doc", "Thành phần xuyên suốt"]]).find(t => t[0] === k.t)[1]), ui.note(k.mo, "key"),
            k.canhbao ? ui.note(k.canhbao, "eve") : null,
            hs.length ? ui.table(["Mã", "Hệ thống của Phường Mẫu" + (k.nhan ? " — " + k.nhan : ""), "Loại", "Cấp độ ATTT", "Kết nối nền tảng", "Tình trạng"], hs.map(r => [r.ma, r.ten_he_thong, ui.tag(r.loai, kindOf(r)), +r.cap_do_attt_da_xac_dinh ? "Cấp " + r.cap_do_attt_da_xac_dinh : ui.tag("Chưa xác định", "eve"), r.ket_noi_nen_tang_chia_se, r.tinh_trang === "Đang dùng" ? r.tinh_trang : ui.tag(r.tinh_trang, "eve")]), { cls: "tight" })
              : ui.note("Trong kiểm kê 18 hệ thống của Phường Mẫu chưa có hệ thống nào ghi nhận ở khối này — đây là chỗ cần hỏi khi phác thảo kiến trúc hiện trạng.", "mut"));
        } else mota.render(ui.note("Bấm một khối để đọc mô tả. Hai thành phần chạy suốt sơ đồ: <b>an toàn thông tin mạng, an ninh mạng</b> và <b>chỉ đạo, chính sách</b>.", "mut"));
        const vb = [["1.0", "Văn bản 1178/BTTTT-THH", "21/4/2015", "Lần đầu có khung kiến trúc Chính phủ điện tử", "eve"],
          ["2.0", "Quyết định 2323/QĐ-BTTTT", "31/12/2019", "Bổ sung mô hình tham chiếu, nền tảng chia sẻ", "eve"],
          ["3.0", "Quyết định 2568/QĐ-BTTTT", "29/12/2023", "Hướng tới Chính phủ số; sửa đổi bởi Quyết định 1729/QĐ-BTTTT ngày 09/10/2024", "eve"],
          ["4.0", "Quyết định 292/QĐ-BKHCN", "25/3/2025", "Khung Kiến trúc Chính phủ số; thay thế Quyết định 2568/QĐ-BTTTT", "ok"]];
        bang.render(ui.title("Bốn phiên bản khung kiến trúc của Việt Nam", "số hiệu theo CANCU mục D"),
          ui.table(["Phiên bản", "Văn bản ban hành", "Ngày", "Điểm nhấn", "Hiệu lực"], vb.map(r => [{ html: "<b>" + r[0] + "</b>", cls: "c" }, r[1], r[2], r[3], ui.tag(r[4] === "ok" ? "Đang áp dụng" : "Đã thay thế", r[4])]), { cls: "wrap", rowCls: (r, i) => i === 3 ? "good" : null }),
          ui.note("Từ phiên bản 4.0, cơ quan ban hành là <b>Bộ Khoa học và Công nghệ</b> (Bộ Thông tin và Truyền thông hợp nhất vào Bộ Khoa học và Công nghệ theo Nghị định 55/2025/NĐ-CP ngày 02/3/2025).", "key"),
          ui.title("Khung 3.0 và Khung 4.0 khác nhau ở đâu", "theo slide Bài 4; Khung 4.0 Chương 1 Mục III.1"),
          ui.table(["Nội dung", "Khung 3.0 (2023)", "Khung 4.0 (2025)"], [
            ["Tên gọi", "Khung Kiến trúc Chính phủ điện tử Việt Nam 3.0", { html: "<b>Khung Kiến trúc Chính phủ số Việt Nam 4.0</b>" }],
            ["Cơ quan ban hành", "Bộ Thông tin và Truyền thông", "Bộ Khoa học và Công nghệ"],
            ["Cấp bộ", "Kiến trúc Chính phủ điện tử cấp bộ", "Khung kiến trúc số cấp bộ 4.0 (Luật Giao dịch điện tử 20/2023/QH15, Điều 42 khoản 5)"],
            ["Cấp tỉnh", "Kiến trúc Chính quyền điện tử cấp tỉnh", "Khung kiến trúc số cấp tỉnh 4.0 — gọi là 'Khung kiến trúc Chính quyền số' + tên tỉnh"],
            ["Nền tảng dữ liệu", "Chưa có Nền tảng chia sẻ, điều phối dữ liệu", { html: "<b>Bổ sung Nền tảng chia sẻ, điều phối dữ liệu</b> theo Luật Dữ liệu 60/2024/QH15" }],
            ["Nguyên tắc", "Chưa cập nhật Nghị quyết 57-NQ/TW", "Bổ sung nguyên tắc theo Nghị quyết 57-NQ/TW ngày 22/12/2024"]], { cls: "wrap" }));
      }
      draw(); pane.appendChild(root);
    } },

  /* =====================================================================================
     TAB 3 — Năm mô hình tham chiếu: giải thích, bài tập phân loại 15 mục, năm miền BRM */
  { id: "thamchieu", title: "Năm mô hình tham chiếu",
    intro: "Mô hình tham chiếu giống khổ giấy A4 hay mã bưu chính: ai cũng theo một chuẩn nên dùng chung được. Khung 4.0 có năm mô hình: BRM, DRM, ARM, TRM, SRM (Chương 2). Hãy gán 15 mục dưới đây vào đúng mô hình.",
    build(pane) {
      const MH = [
        { id: "BRM", ten: "Mô hình tham chiếu nghiệp vụ", kind: "pt", dung: "Khung chung các nghiệp vụ phổ biến của cơ quan nhà nước, mô tả độc lập với cấu trúc tổ chức. Cơ sở để xây dựng Kiến trúc nghiệp vụ.", cau: "Ba mức: Miền nghiệp vụ → Nhóm nghiệp vụ → Loại nghiệp vụ.", vd: "Quản lý hộ tịch nằm ở Nhóm 'Quốc tịch, hộ tịch, cư trú và định danh xác thực điện tử', Miền 'Xã hội'.", pl: "Phụ lục I" },
        { id: "DRM", ten: "Mô hình tham chiếu dữ liệu", kind: "ct", dung: "Khung chung mô tả các thành phần dữ liệu cơ bản dựa trên nghiệp vụ; chỉ ra khả năng chia sẻ, dùng lại dữ liệu. Cơ sở để xây dựng Kiến trúc dữ liệu.", cau: "Ba mức song song với BRM: Miền dữ liệu → Mục dữ liệu → Tiểu mục dữ liệu.", vd: "Mỗi dữ liệu ghi rõ mức độ chia sẻ: công khai, bảo mật hoặc không chia sẻ.", pl: "Phụ lục II" },
        { id: "ARM", ten: "Mô hình tham chiếu ứng dụng", kind: "key", dung: "Khung chung mô tả các thành phần ứng dụng phục vụ nghiệp vụ; cho phép xác định khả năng hợp nhất, tích hợp ứng dụng. Cơ sở để xây dựng Kiến trúc ứng dụng.", cau: "Bảy miền chức năng: giao tiếp công dân; tự động hoá quy trình; quản lý nghiệp vụ; quản lý dữ liệu điện tử; phân tích nghiệp vụ; hỗ trợ nội bộ; cộng tác và hỗ trợ.", vd: "Nhờ ARM mà hai đơn vị biết mình đang mua trùng một loại phần mềm.", pl: "Phụ lục III" },
        { id: "TRM", ten: "Mô hình tham chiếu công nghệ", kind: "aqua", dung: "Khung chung mô tả các tiêu chuẩn và công nghệ để hỗ trợ triển khai các thành phần ứng dụng. Cơ sở để xây dựng Kiến trúc công nghệ.", cau: "Bốn miền dịch vụ: truy cập và phân phối dịch vụ; nền tảng và cơ sở hạ tầng dịch vụ; khung phát triển ứng dụng, dịch vụ; giao diện và tích hợp.", vd: "Gồm cả điện toán đám mây, dữ liệu lớn và trí tuệ nhân tạo.", pl: "Phụ lục IV" },
        { id: "SRM", ten: "Mô hình tham chiếu an toàn thông tin mạng, an ninh mạng", kind: "eve", dung: "Khung chung mô tả các thành phần bảo đảm an toàn thông tin mạng, an ninh mạng khi phát triển Chính phủ số. Cơ sở để xây dựng Kiến trúc an toàn thông tin mạng, an ninh mạng.", cau: "Ba thành phần: Mục tiêu (quy định pháp lý, tổ chức thực thi, mô hình bốn lớp); Rủi ro (nguy cơ và biện pháp kiểm soát); Kiểm soát (kiểm tra tuân thủ, hiệu quả).", vd: "Bảo vệ theo cấp độ, kiểm tra đánh giá, giám sát, ứng cứu sự cố.", pl: "Phụ lục V" }];
      const MUC = [
        ["Danh mục nghiệp vụ hộ tịch (khai sinh, kết hôn, khai tử…)", "BRM", "Danh mục việc cơ quan làm → Kiến trúc nghiệp vụ, tra theo BRM."],
        ["Từ điển dữ liệu dân cư (họ tên, ngày sinh, số định danh…)", "DRM", "Mô tả thành phần dữ liệu và cách chia sẻ → DRM."],
        ["Phần mềm một cửa (Hệ thống thông tin giải quyết TTHC)", "ARM", "Một ứng dụng phục vụ nghiệp vụ → danh mục ứng dụng theo ARM."],
        ["Máy chủ tại trung tâm dữ liệu tỉnh", "TRM", "Hạ tầng, thiết bị, công nghệ → TRM."],
        ["Phương án bảo đảm an toàn thông tin cấp độ 2", "SRM", "Phương án bảo vệ theo cấp độ → SRM."],
        ["Nhóm nghiệp vụ 'Quốc tịch, hộ tịch, cư trú và định danh xác thực điện tử'", "BRM", "Đây là một Nhóm nghiệp vụ trong Phụ lục I (BRM)."],
        ["Mức độ chia sẻ dữ liệu: công khai / bảo mật / không chia sẻ", "DRM", "DRM ghi rõ khả năng chia sẻ của từng dữ liệu."],
        ["Hệ thống quản lý văn bản và điều hành", "ARM", "Ứng dụng hỗ trợ nội bộ → ARM."],
        ["Mạng truyền số liệu chuyên dùng", "TRM", "Hạ tầng mạng → TRM."],
        ["Giám sát, ứng cứu sự cố an toàn thông tin", "SRM", "Biện pháp kiểm soát rủi ro → SRM."],
        ["Danh mục mã đơn vị hành chính, mã định danh cơ quan (danh mục dùng chung)", "DRM", "Danh mục dữ liệu dùng chung, chuẩn hoá mã số → DRM (kiến trúc dữ liệu)."],
        ["Nền tảng điện toán đám mây", "TRM", "Công nghệ nền tảng và cơ sở hạ tầng dịch vụ → TRM."],
        ["Miền chức năng 'Giao tiếp công dân'", "ARM", "Một trong bảy miền chức năng ứng dụng của ARM."],
        ["Quy trình chi trả trợ cấp xã hội hằng tháng", "BRM", "Việc cơ quan làm cho người dân → nghiệp vụ (BRM), chưa nói đến phần mềm nào."],
        ["Mô hình bảo đảm an toàn thông tin bốn lớp", "SRM", "Thuộc thành phần Mục tiêu của SRM."]];
      const KEY = "m4.thamchieu";
      const saved = LAB.store.get(KEY, {});
      const S = { ten: saved.ten || "", tl: Array.isArray(saved.tl) ? saved.tl.slice(0, MUC.length) : MUC.map(() => ""), xem: "BRM", cham: false };
      while (S.tl.length < MUC.length) S.tl.push("");
      const { root, ctrl, view } = ui.sim();
      const tenF = ui.field({ id: "m4tc-ten", label: "Họ tên học viên", value: S.ten, placeholder: "Nguyễn Văn A", onInput: v => { S.ten = v; luu(); } });
      const tiles = ui.tiles({ items: MH.map(m => ({ id: m.id, title: m.id, sub: m.ten, kind: m.kind })), value: S.xem, cls: "narrow", onChange: v => { S.xem = v; veMoHinh(); } });
      const sels = [];
      ctrl.append(tenF, h("div", { class: "fld" }, h("label", null, h("b", null, "Xem giải thích mô hình")), tiles),
        ui.presets([{ label: "Điền đáp án mẫu", apply: () => { S.tl = MUC.map(m => m[1]); sels.forEach((s, i) => { s.value = S.tl[i]; }); S.cham = true; luu(); veBaiTap(); } }], "Ví dụ mẫu"),
        h("div", { class: "row" }, ui.btn("Chấm điểm", () => { S.cham = true; luu(); veBaiTap(); }, "pri"), ui.btn("Làm lại", () => { S.tl = MUC.map(() => ""); S.cham = false; sels.forEach(s => { s.value = ""; }); luu(); veBaiTap(); }, "sm"),
          ui.btn("Tải CSV", () => LAB.csv.download("bai4_mo_hinh_tham_chieu.csv", ["ho_ten", "stt", "muc", "tra_loi", "dap_an", "dung", "giai_thich"], MUC.map((m, i) => [S.ten, i + 1, m[0], S.tl[i], m[1], S.tl[i] === m[1] ? "Có" : "Không", m[2]])), "sm")),
        ui.cancu(CC_KHUNG + " — Chương 2, Mục I", "Mô hình tham chiếu bao gồm danh mục các thành phần cơ bản đã được chuẩn hoá sẽ giúp cho việc xây dựng nội dung Khung kiến trúc số cấp bộ, cấp tỉnh… được đồng bộ, thống nhất, tăng khả năng kết nối, liên thông, chia sẻ, sử dụng lại."));
      const moHinh = ui.slot(), baiTap = ui.slot(), brm = ui.slot();
      view.append(moHinh, baiTap, brm);
      function luu() { LAB.store.set(KEY, { ten: S.ten, tl: S.tl, luc: now() }); }
      function veMoHinh() { const m = MH.find(x => x.id === S.xem);
        moHinh.render(ui.title(m.ten + " (" + m.id + ")", "Khung 4.0, Chương 2 Mục II và " + m.pl), h("div", { class: "cols" },
          ui.panel("Dùng để làm gì", h("div", null, m.dung)), ui.panel("Cấu trúc", h("div", null, m.cau)), ui.panel("Ví dụ cụ thể", h("div", null, m.vd)))); }
      function veBaiTap() {
        const dung = MUC.filter((m, i) => S.tl[i] === m[1]).length, daTl = S.tl.filter(Boolean).length;
        const opts = [["", "— chọn —"], ...MH.map(m => [m.id, m.id + " — " + m.ten])];
        sels.length = 0;
        const tb = ui.table(["#", "Mục cần xếp", "Thuộc mô hình", S.cham ? "Kết quả" : "Gợi ý"], MUC.map((m, i) => { const s = cellSelect("m4tc-s" + i, opts, S.tl[i], v => { S.tl[i] = v; luu(); if (S.cham) veBaiTap(); }, 230); sels.push(s);
          return [String(i + 1), m[0], s, S.cham ? (S.tl[i] === m[1] ? h("span", null, ui.tag("Đúng", "ok"), " ", m[2]) : h("span", null, ui.tag(S.tl[i] ? "Sai" : "Bỏ trống", "eve"), " Đáp án " + m[1] + ": " + m[2])) : h("span", { class: "small" }, "Hỏi: đây là việc làm, dữ liệu, phần mềm, thiết bị hay biện pháp bảo vệ?")]; }),
          { cls: "wrap", rowCls: (r, i) => S.cham ? (S.tl[i] === MUC[i][1] ? "good" : "bad") : null });
        const sc = ui.score(S.cham ? dung : daTl, S.cham ? "/ 15 đúng" : "/ 15 đã chọn", 15); if (S.cham) sc.classList.add(dung >= 12 ? "ok" : dung >= 8 ? "pt" : "eve");
        baiTap.render(ui.title("Bài tập: xếp 15 mục vào đúng mô hình tham chiếu"), h("div", { class: "row" }, sc, ui.readouts([{ k: "Đã trả lời", v: daTl + " / 15", kind: "pt" }, { k: "Điểm", v: S.cham ? dung + " / 15" : "— (bấm Chấm điểm)", kind: S.cham ? (dung >= 12 ? "ok" : "eve") : "mut" }, { k: "Lưu lúc", v: LAB.store.get(KEY, {}).luc || "—" }])), tb,
          S.cham && dung < 15 ? ui.note("Mẹo phân biệt: <b>việc cơ quan làm</b> → BRM; <b>thông tin, danh mục, mã số</b> → DRM; <b>phần mềm, dịch vụ ứng dụng</b> → ARM; <b>máy móc, mạng, công nghệ nền</b> → TRM; <b>biện pháp bảo vệ, cấp độ, giám sát</b> → SRM.", "key") : null);
        if (!S.cham) sels.forEach((s, i) => { s.value = S.tl[i]; });
      }
      brm.render(ui.title("Năm miền nghiệp vụ trong mô hình BRM", "Phụ lục I — Khung 4.0"),
        ui.table(["Mã", "Miền nghiệp vụ", "Bao gồm dịch vụ cung cấp cho ai", "Ở Phường Mẫu"], [
          ["BRM001", "Kinh tế – Xã hội", "Doanh nghiệp và đại diện của doanh nghiệp", "Đăng ký hộ kinh doanh"],
          ["BRM002", "Xã hội", "Người dân", "Hộ tịch, cư trú, an sinh xã hội, giáo dục"],
          ["BRM003", "Đối ngoại, Quốc phòng và An ninh, trật tự an toàn xã hội", "Người dân, doanh nghiệp, tổ chức trong và ngoài nước", "An ninh trật tự khu vực một cửa"],
          ["BRM004", "Hỗ trợ hoạt động của cơ quan nhà nước", "Xây dựng, ban hành chính sách, pháp luật", "Văn bản, báo cáo, họp trực tuyến"],
          ["BRM005", "Quản lý nguồn lực", "Nội bộ cơ quan: nhân lực, tài chính, trang thiết bị", "Kế toán, quản lý cán bộ"]], { cls: "wrap" }),
        ui.note("Cấu trúc ba mức của BRM: <b>Miền nghiệp vụ</b> → <b>Nhóm nghiệp vụ</b> → <b>Loại nghiệp vụ</b>. Ví dụ: Quản lý hộ tịch thuộc Nhóm 'Quốc tịch, hộ tịch, cư trú và định danh xác thực điện tử' của Miền 'Xã hội'.", "mut"));
      veMoHinh(); veBaiTap(); pane.appendChild(root);
    } },

  /* =====================================================================================
     TAB 4 — Phác thảo kiến trúc nghiệp vụ mức 1 (bài thực hành chính) */
  { id: "nghiepvu", title: "Phác thảo kiến trúc nghiệp vụ mức 1",
    intro: "Bài thực hành của Bài 4: chọn một lĩnh vực của đơn vị, liệt kê <b>Nhóm nghiệp vụ → Nghiệp vụ → Dữ liệu sử dụng → Ứng dụng hỗ trợ → Cơ sở dữ liệu quốc gia liên quan</b>. Kết quả lưu trên máy và tải được CSV để nộp.",
    build(pane) {
      const LV = ["Hộ tịch", "Cư trú", "Đất đai", "Kinh doanh", "An sinh xã hội", "Xây dựng", "Giáo dục", "Chứng thực"];
      /* gợi ý theo lĩnh vực: nhóm nghiệp vụ (chỉ ghi tên theo Phụ lục I khi slide đã nêu), ứng dụng trong kiểm kê, CSDL quốc gia */
      const GOIY = { "Hộ tịch": { nhom: "Quốc tịch, hộ tịch, cư trú và định danh xác thực điện tử", ud: ["HT04", "HT01"], csdl: "Về dân cư", cq: "Công an; cơ sở y tế; bảo hiểm" },
        "Cư trú": { nhom: "Quốc tịch, hộ tịch, cư trú và định danh xác thực điện tử", ud: ["HT01"], csdl: "Về dân cư", cq: "Công an" },
        "Đất đai": { nhom: "", ud: ["HT06"], csdl: "Về đất đai", cq: "Văn phòng đăng ký đất đai; cơ quan thuế" },
        "Kinh doanh": { nhom: "", ud: ["HT07", "HT01"], csdl: "Về đăng ký doanh nghiệp", cq: "Cơ quan thuế; cơ quan đăng ký kinh doanh" },
        "An sinh xã hội": { nhom: "", ud: ["HT08"], csdl: "Về an sinh xã hội", cq: "Bảo hiểm xã hội; ngân hàng chi trả" },
        "Xây dựng": { nhom: "", ud: ["HT09"], csdl: "Về hoạt động xây dựng", cq: "Cơ quan quản lý xây dựng cấp tỉnh" },
        "Giáo dục": { nhom: "", ud: ["HT01"], csdl: "Về giáo dục và đào tạo", cq: "Nhà trường; Sở Giáo dục và Đào tạo" },
        "Chứng thực": { nhom: "", ud: ["HT05"], csdl: "Danh tính điện tử", cq: "Cơ quan tư pháp" } };
      const MAU_HT = [ /* đúng bảng "Ví dụ mẫu đã điền: lĩnh vực hộ tịch" trong slide */
        { nv: "Đăng ký khai sinh", dl: "Dân cư; hộ tịch; giấy chứng sinh", ud: "Hệ thống thông tin giải quyết TTHC (một cửa điện tử) cấp tỉnh; Phần mềm hộ tịch điện tử dùng chung", csdl: "Về dân cư", cq: "Công an; cơ sở y tế; bảo hiểm" },
        { nv: "Đăng ký kết hôn", dl: "Dân cư; hộ tịch; tình trạng hôn nhân", ud: "Cổng Dịch vụ công quốc gia (kết nối); Phần mềm hộ tịch điện tử dùng chung", csdl: "Về dân cư", cq: "Công an; cơ quan tư pháp" },
        { nv: "Đăng ký khai tử", dl: "Dân cư; hộ tịch; giấy báo tử", ud: "Phần mềm hộ tịch điện tử dùng chung; Hệ thống quản lý văn bản và điều hành", csdl: "Về dân cư", cq: "Công an; cơ sở y tế; bảo hiểm" },
        { nv: "Cấp trích lục hộ tịch", dl: "Hộ tịch điện tử; định danh điện tử", ud: "Cổng Dịch vụ công quốc gia (kết nối)", csdl: "Danh tính điện tử", cq: "Công an (định danh VNeID)" }];
      const KEY = "m4.nghiepvu", rows = HT(), tt = LAB.data.thu_tuc || [];
      const saved = LAB.store.get(KEY, {});
      const S = { ten: saved.ten || "", lv: LV.includes(saved.lv) ? saved.lv : "Hộ tịch", rows: Array.isArray(saved.rows) ? saved.rows : [], ghichu: saved.ghichu || "" };
      const newRow = (o = {}) => ({ nhom: o.nhom || "", nv: o.nv || "", dl: o.dl || "", ud: o.ud || "", csdl: o.csdl || "", cq: o.cq || "" });
      const { root, ctrl, view } = ui.sim();
      const dlist = h("datalist", { id: "m4nv-apps" }, rows.map(r => h("option", { value: r.ten_he_thong })), h("option", { value: "Còn làm trên giấy / sổ" }));
      const tenF = ui.field({ id: "m4nv-ten", label: "Họ tên học viên", value: S.ten, placeholder: "Nguyễn Văn A", onInput: v => { S.ten = v; luu(); } });
      const lvF = ui.select({ id: "m4nv-lv", label: "Lĩnh vực", options: LV.map(x => [x, x]), value: S.lv, onChange: v => { S.lv = v; luu(); veTable(); } });
      const ghiF = ui.field({ id: "m4nv-ghichu", label: "Ba dòng ghi chú: chỗ đang thiếu dữ liệu hoặc thiếu kết nối", type: "textarea", value: S.ghichu, placeholder: "1. …\n2. …\n3. …", onInput: v => { S.ghichu = v; luu(); } });
      ctrl.append(tenF, lvF,
        h("div", { class: "row" },
          ui.btn("Gợi ý nghiệp vụ từ danh mục thủ tục", () => { const g = GOIY[S.lv] || {}; const them = tt.filter(t => t.linh_vuc === S.lv && !S.rows.some(r => r.nv === t.ten)).map(t => newRow({ nhom: g.nhom, nv: t.ten, ud: (g.ud || []).map(tenHT).join("; "), csdl: g.csdl, cq: g.cq })); if (!them.length) { thongBao.render(ui.note("Danh mục thủ tục của Phường Mẫu không còn thủ tục nào thuộc lĩnh vực này chưa có trong bảng.", "eve")); return; } S.rows.push(...them); thongBao.render(ui.note("Đã thêm " + them.length + " nghiệp vụ từ danh mục thủ tục hành chính (ô Ứng dụng và CSDL quốc gia là <b>gợi ý</b>, anh/chị sửa theo thực tế đơn vị).", "ok")); luu(); veTable(); }, "sm pri"),
          ui.btn("Thêm dòng trống", () => { S.rows.push(newRow({ nhom: (GOIY[S.lv] || {}).nhom })); luu(); veTable(); }, "sm")),
        ui.presets([{ label: "Ví dụ mẫu đã điền: lĩnh vực hộ tịch", apply: () => { S.lv = "Hộ tịch"; lvF.input.value = "Hộ tịch"; S.rows = MAU_HT.map(m => newRow(Object.assign({ nhom: GOIY["Hộ tịch"].nhom }, m))); thongBao.render(null); luu(); veTable(); } }]),
        h("div", { class: "row" }, ui.btn("Làm lại", () => { S.rows = []; S.ghichu = ""; ghiF.input.value = ""; thongBao.render(null); luu(); veTable(); }, "sm"),
          ui.btn("Tải CSV", () => LAB.csv.download("bai4_kien_truc_nghiep_vu_muc1.csv", ["ho_ten", "linh_vuc", "nhom_nghiep_vu", "nghiep_vu", "du_lieu_su_dung", "ung_dung_ho_tro", "csdl_quoc_gia", "co_quan_phoi_hop", "ghi_chu"], S.rows.map(r => [S.ten, S.lv, r.nhom, r.nv, r.dl, r.ud, r.csdl, r.cq, S.ghichu])), "sm")),
        ghiF,
        ui.cancu(CC_KHUNG + " — Chương 1, Mục III.2", "Kiến trúc nghiệp vụ: Liệt kê và mô tả danh mục hoạt động nghiệp vụ và mô tả khái quát các ứng dụng công nghệ thông tin sẽ hỗ trợ hoạt động nghiệp vụ."),
        ui.cancu(CC_CSDL, "Danh mục 20 cơ sở dữ liệu quốc gia và cơ quan chủ quản (CANCU mục H4). Hộ tịch điện tử là cơ sở dữ liệu chuyên ngành của Bộ Tư pháp, không nằm trong danh mục này."), dlist);
      const thongBao = ui.slot(), tong = ui.slot(), bang = ui.slot();
      view.append(thongBao, tong, bang);
      function luu() { LAB.store.set(KEY, { ten: S.ten, lv: S.lv, rows: S.rows, ghichu: S.ghichu, luc: now() }); }
      function phanTich() {
        const giay = S.rows.filter(r => /giấy|sổ/i.test(r.ud) || !r.ud.trim()).length;
        const dungCSDL = S.rows.filter(r => r.csdl).length;
        const trung = S.rows.filter(r => rows.some(x => x.tinh_trang === "Trùng chức năng" && r.ud && LAB.khongDau(r.ud).includes(LAB.khongDau(x.ten_he_thong)))).length;
        const congCong = S.rows.filter(r => rows.some(x => x.loai === "Ứng dụng công cộng" && r.ud && LAB.khongDau(r.ud).includes(LAB.khongDau(x.ten_he_thong)))).length;
        const thieu = S.rows.filter(r => !r.nv.trim() || !r.dl.trim()).length;
        return { giay, dungCSDL, trung, congCong, thieu };
      }
      function veTong() {
        const p = phanTich(); const n = S.rows.length;
        tong.render(ui.readouts([{ k: "Số nghiệp vụ đã liệt kê", v: String(n) + (n >= 4 && n <= 6 ? " (đủ 4–6 theo yêu cầu)" : n ? " (yêu cầu 4–6)" : ""), kind: n >= 4 ? "ok" : "pt", big: true },
          { k: "Còn làm giấy / chưa có ứng dụng", v: String(p.giay), kind: p.giay ? "eve" : "ok" }, { k: "Nghiệp vụ dùng lại CSDL quốc gia", v: p.dungCSDL + " / " + n, kind: "ct" }, { k: "Dòng còn thiếu nghiệp vụ hoặc dữ liệu", v: String(p.thieu), kind: p.thieu ? "eve" : "ok" }]),
          p.trung ? ui.note(p.trung + " nghiệp vụ đang dựa vào phần mềm <b>trùng chức năng</b> trong kiểm kê — kiến trúc ứng dụng sẽ đề nghị hợp nhất; hãy ghi vào ba dòng ghi chú.", "eve") : null,
          p.congCong ? ui.note(p.congCong + " nghiệp vụ dựa vào <b>ứng dụng công cộng</b> (nhóm chat) để chuyển hồ sơ — không nằm trong kiến trúc an toàn thông tin của cơ quan.", "eve") : null,
          n && p.dungCSDL < n ? ui.note((n - p.dungCSDL) + " nghiệp vụ chưa ghi cơ sở dữ liệu quốc gia liên quan. Hỏi: dữ liệu nghiệp vụ này đang có sẵn trong CSDL quốc gia nào? Nếu có thì <b>không thu thập lại</b> (Luật Dữ liệu 60/2024/QH15, Điều 11 khoản 2 điểm b).", "key") : null);
      }
      function veTable() {
        const g = GOIY[S.lv] || {};
        const csdlOpts = [["", "— không / chưa rõ —"], ...CSDLQG.map(c => [c[0], c[0] + " (" + c[1] + ")"])];
        const body = S.rows.map((r, i) => [String(i + 1),
          cellInput("m4nv-nhom" + i, r.nhom, v => { r.nhom = v; luu(); }, { w: 190, placeholder: g.nhom ? "" : "ghi theo Phụ lục I nếu tra được" }),
          cellInput("m4nv-nv" + i, r.nv, v => { r.nv = v; luu(); veTong(); }, { w: 200, placeholder: "việc đơn vị thực sự làm" }),
          cellInput("m4nv-dl" + i, r.dl, v => { r.dl = v; luu(); veTong(); }, { w: 200, placeholder: "dữ liệu nào, ai đang giữ" }),
          cellInput("m4nv-ud" + i, r.ud, v => { r.ud = v; luu(); veTong(); }, { w: 240, list: "m4nv-apps", placeholder: "chọn hệ thống trong kiểm kê hoặc nhập; nhiều thì cách bằng ;" }),
          cellSelect("m4nv-csdl" + i, csdlOpts, r.csdl, v => { r.csdl = v; luu(); veTong(); }, 210),
          cellInput("m4nv-cq" + i, r.cq, v => { r.cq = v; luu(); }, { w: 170, placeholder: "phải hỏi / gửi dữ liệu cho ai" }),
          ui.btn("Xoá", () => { S.rows.splice(i, 1); luu(); veTable(); }, "sm")]);
        bang.render(ui.title("Kiến trúc nghiệp vụ mức 1 — lĩnh vực " + S.lv, "Miền BRM: " + (["Kinh doanh"].includes(S.lv) ? "BRM001 Kinh tế – Xã hội" : "BRM002 Xã hội") + (g.nhom ? "; Nhóm: " + g.nhom : "; Nhóm nghiệp vụ: tra Phụ lục I")),
          S.rows.length ? ui.table(["#", "Nhóm nghiệp vụ", "Nghiệp vụ cụ thể", "Dữ liệu sử dụng", "Ứng dụng hỗ trợ", "CSDL quốc gia liên quan", "Cơ quan phối hợp", ""], body, { cls: "tight" })
            : ui.note("Chưa có dòng nào. Bấm <b>Gợi ý nghiệp vụ từ danh mục thủ tục</b> để lấy các thủ tục của lĩnh vực này trong Phường Mẫu, hoặc <b>Thêm dòng trống</b> để tự điền, hoặc xem <b>Ví dụ mẫu</b>.", "mut"),
          h("div", { class: "small" }, "Lưu tự động trên máy này (" + (LAB.store.get(KEY, {}).luc || "chưa lưu") + "). Cột 'Ứng dụng hỗ trợ' gõ để chọn tên trong kiểm kê 18 hệ thống; ghi rõ 'Còn làm trên giấy / sổ' nếu chưa có phần mềm."));
        veTong();
      }
      veTable(); pane.appendChild(root);
    } },

  /* =====================================================================================
     TAB 5 — Phân tích khoảng cách và lộ trình: quyết định cho từng hệ thống, năm thực hiện 2026–2030 */
  { id: "khoangcach", title: "Phân tích khoảng cách và lộ trình",
    intro: "Hiện trạng → mục tiêu → khoảng cách → kế hoạch, lộ trình (Khung 4.0, Chương 1 Mục III.2.g). Với từng hệ thống của Phường Mẫu, hãy quyết định <b>Giữ / Nâng cấp / Thay bằng nền tảng dùng chung / Loại bỏ</b> và năm thực hiện.",
    build(pane) {
      const QD = ["Giữ", "Nâng cấp", "Thay bằng nền tảng dùng chung", "Loại bỏ"], NAM = [2026, 2027, 2028, 2029, 2030];
      const QD_KIND = { "Giữ": "mut", "Nâng cấp": "key", "Thay bằng nền tảng dùng chung": "ok", "Loại bỏ": "eve" };
      const rows = HT(), KEY = "m4.khoangcach";
      /* gợi ý tự động theo cột kiểm kê */
      function goiY(r) {
        if (r.loai === "Ứng dụng công cộng") return { qd: "Loại bỏ", nam: 2026, ly: "Ứng dụng công cộng đang chứa ảnh hồ sơ của người dân, cơ quan không kiểm soát được; chuyển việc trao đổi hồ sơ sang hệ thống quản lý văn bản và hệ thống giải quyết thủ tục hành chính." };
        if (r.tinh_trang === "Trùng chức năng") return { qd: "Thay bằng nền tảng dùng chung", nam: 2026, ly: "Trùng chức năng với hệ thống đã có; nguyên tắc e 'Nền tảng là giải pháp đột phá': kiểm tra nền tảng dùng chung, cơ sở dữ liệu quốc gia (" + (/hộ kinh doanh/i.test(r.du_lieu_chinh) ? "đăng ký doanh nghiệp" : "cán bộ, công chức, viên chức") + ") trước khi chi tiền." };
        if (r.loai === "Hệ thống đơn vị tự mua" && r.tinh_trang === "Ít dùng") return { qd: "Thay bằng nền tảng dùng chung", nam: 2027, ly: "Bảng tính rời trên máy cá nhân, không xác định cấp độ, ít dùng; đưa nghiệp vụ vào hệ thống giải quyết thủ tục hành chính của tỉnh." };
        if (+r.cap_do_attt_da_xac_dinh === 0) return { qd: "Nâng cấp", nam: 2026, ly: "Chưa xác định cấp độ an toàn hệ thống thông tin; kiến trúc an toàn thông tin (SRM) yêu cầu xác định cấp độ và phương án bảo vệ trước." };
        if (r.loai === "Hệ thống của tỉnh" && r.ket_noi_nen_tang_chia_se === "Không") return { qd: "Nâng cấp", nam: 2027, ly: "Chưa kết nối Nền tảng tích hợp, chia sẻ dữ liệu cấp tỉnh; theo NĐ 278/2025/NĐ-CP mọi kết nối, chia sẻ bắt buộc phải qua Nền tảng chia sẻ, điều phối dữ liệu chậm nhất 31/12/2026." };
        return { qd: "Giữ", nam: "", ly: r.loai === "Nền tảng dùng chung quốc gia" ? "Nền tảng dùng chung quốc gia: dùng tiếp, không đầu tư trùng." : "Đã xác định cấp độ, đã kết nối nền tảng: giữ và duy trì." };
      }
      const saved = LAB.store.get(KEY, {});
      const S = { ten: saved.ten || "", qd: saved.qd && typeof saved.qd === "object" ? saved.qd : {} };
      rows.forEach(r => { if (!S.qd[r.ma]) S.qd[r.ma] = { qd: "", nam: "" }; });
      const refs = {};
      const { root, ctrl, view } = ui.sim();
      const tenF = ui.field({ id: "m4kc-ten", label: "Họ tên học viên", value: S.ten, placeholder: "Nguyễn Văn A", onInput: v => { S.ten = v; luu(); } });
      const apDung = m => { rows.forEach(r => { const g = m(r); S.qd[r.ma] = { qd: g.qd, nam: g.nam }; if (refs[r.ma]) { refs[r.ma].qd.value = g.qd; refs[r.ma].nam.value = g.nam; } }); luu(); draw(); };
      ctrl.append(tenF,
        ui.presets([{ label: "Phương án gợi ý tự động", apply: () => apDung(goiY) }, { label: "Giữ nguyên tất cả (không làm gì)", apply: () => apDung(() => ({ qd: "Giữ", nam: "" })) }]),
        h("div", { class: "row" }, ui.btn("Làm lại", () => apDung(() => ({ qd: "", nam: "" })), "sm"),
          ui.btn("Tải CSV", () => LAB.csv.download("bai4_khoang_cach_lo_trinh.csv", ["ho_ten", "ma", "he_thong", "loai", "cap_do_attt", "ket_noi_nen_tang", "tinh_trang", "chi_phi_nam_trieu_dong", "quyet_dinh", "nam_thuc_hien", "goi_y_he_thong", "ly_do_goi_y"],
            rows.map(r => { const g = goiY(r); return [S.ten, r.ma, r.ten_he_thong, r.loai, r.cap_do_attt_da_xac_dinh, r.ket_noi_nen_tang_chia_se, r.tinh_trang, r.chi_phi_nam_trieu_dong, S.qd[r.ma].qd, S.qd[r.ma].nam, g.qd + (g.nam ? " " + g.nam : ""), g.ly]; })), "sm")),
        ui.cancu(CC_KHUNG + " — Chương 1, Mục III.2.g", "Phân tích khoảng cách từ khung kiến trúc hiện trạng đến khung kiến trúc mục tiêu; xác định kế hoạch, lộ trình triển khai các nhiệm vụ… trong đó nêu rõ những giải pháp về nguồn lực để bảo đảm khả thi, hiệu quả đầu tư."),
        ui.cancu(CC_QD292 + " — Chương 1, Mục III.3, điểm e", "Nền tảng là giải pháp đột phá. Xây dựng và dùng chung các nền tảng số quốc gia, vùng, bảo đảm hoạt động thống nhất, liên thông… Các nền tảng, ứng dụng và dịch vụ quy mô quốc gia phải được làm trước, làm tốt, làm tập trung."));
      const kq = ui.slot(), bang = ui.slot(), nguyenTac = ui.slot();
      const boxSo = chart.box(b => chart.bars(b, S.chartSo)), boxChi = chart.box(b => chart.line(b, S.chartChi));
      view.append(kq, bang, h("div", { class: "cols" }, boxSo, boxChi), nguyenTac);
      function luu() { LAB.store.set(KEY, { ten: S.ten, qd: S.qd, luc: now() }); }
      function veBang() {
        const qdOpts = [["", "— chọn —"], ...QD.map(q => [q, q])], namOpts = [["", "—"], ...NAM.map(n => [n, String(n)])];
        bang.render(ui.title("Từng hệ thống: hiện trạng → quyết định", "kiểm kê 18 hệ thống của Phường Mẫu"),
          ui.table(["Mã", "Hệ thống", "Hiện trạng", "Chi phí/năm", "Quyết định", "Năm", "Gợi ý của hệ thống"], rows.map(r => { const g = goiY(r), st = S.qd[r.ma];
            const qdS = cellSelect("m4kc-qd-" + r.ma, qdOpts, st.qd, v => { st.qd = v; if (v === "Giữ") { st.nam = ""; refs[r.ma].nam.value = ""; } else if (!st.nam) { st.nam = g.nam || 2026; refs[r.ma].nam.value = st.nam; } luu(); draw(); }, 200);
            const namS = cellSelect("m4kc-nam-" + r.ma, namOpts, st.nam, v => { st.nam = v ? +v : ""; luu(); draw(); }, 80); refs[r.ma] = { qd: qdS, nam: namS };
            return [r.ma, h("span", null, r.ten_he_thong, h("div", { class: "small" }, r.nghiep_vu_phuc_vu + " · " + r.noi_dat + " · từ " + r.nam_dua_vao_su_dung)),
              h("span", { class: "row" }, ui.tag(r.loai, kindOf(r)), +r.cap_do_attt_da_xac_dinh ? ui.tag("ATTT cấp " + r.cap_do_attt_da_xac_dinh, "ok") : ui.tag("Chưa cấp độ", "eve"), r.ket_noi_nen_tang_chia_se === "Có" ? ui.tag("Đã kết nối", "ok") : ui.tag("Chưa kết nối", "mut"), r.tinh_trang !== "Đang dùng" ? ui.tag(r.tinh_trang, "eve") : null),
              { html: r.chi_phi_nam_trieu_dong ? LAB.num(r.chi_phi_nam_trieu_dong) + " tr" : "—", cls: "r" }, qdS, namS, h("span", { class: "small" }, ui.tag(g.qd + (g.nam ? " " + g.nam : ""), QD_KIND[g.qd]), " ", g.ly)]; }),
            { cls: "wrap", rowCls: r => { const st = S.qd[r[0]]; return !st.qd ? null : st.qd === "Loại bỏ" || st.qd === "Thay bằng nền tảng dùng chung" ? "hi" : null; } }));
      }
      function draw() {
        const daQd = rows.filter(r => S.qd[r.ma].qd), chuaNam = daQd.filter(r => S.qd[r.ma].qd !== "Giữ" && !S.qd[r.ma].nam);
        const bo = rows.filter(r => ["Loại bỏ", "Thay bằng nền tảng dùng chung"].includes(S.qd[r.ma].qd));
        const tietKiem = LAB.stat.sum(bo.map(r => r.chi_phi_nam_trieu_dong)), tongChi = LAB.stat.sum(rows.map(r => r.chi_phi_nam_trieu_dong));
        const conLai = rows.length - bo.length;
        const chuaCapDoGiu = rows.filter(r => +r.cap_do_attt_da_xac_dinh === 0 && S.qd[r.ma].qd === "Giữ");
        const trungGiu = rows.filter(r => r.tinh_trang === "Trùng chức năng" && ["Giữ", "Nâng cấp"].includes(S.qd[r.ma].qd));
        const congCongGiu = rows.filter(r => r.loai === "Ứng dụng công cộng" && S.qd[r.ma].qd && S.qd[r.ma].qd !== "Loại bỏ");
        const theoNam = NAM.map(n => QD.slice(1).map(q => rows.filter(r => S.qd[r.ma].qd === q && +S.qd[r.ma].nam === n).length));
        const chiTheoNam = NAM.map(n => tongChi - LAB.stat.sum(bo.filter(r => +S.qd[r.ma].nam && +S.qd[r.ma].nam <= n).map(r => r.chi_phi_nam_trieu_dong)));
        kq.render(ui.readouts([{ k: "Đã quyết định", v: daQd.length + " / " + rows.length, kind: daQd.length === rows.length ? "ok" : "pt" },
          { k: "Hệ thống còn vận hành đến 2030", v: LAB.num(conLai) + " (hiện " + rows.length + ")", kind: "aqua", big: true },
          { k: "Chi phí tự mua tiết kiệm", v: trieu(tietKiem) + " / " + LAB.num(tongChi) + " tr", kind: tietKiem ? "ok" : "ct" },
          { k: "Chưa cấp độ ATTT mà vẫn giữ nguyên", v: String(chuaCapDoGiu.length), kind: chuaCapDoGiu.length ? "eve" : "ok" }]),
          chuaNam.length ? ui.note(chuaNam.length + " hệ thống đã chọn quyết định nhưng chưa chọn năm thực hiện: lộ trình phải nói rõ làm gì trước, gì sau.", "eve") : null,
          chuaCapDoGiu.length ? ui.note("Giữ nguyên " + chuaCapDoGiu.map(r => r.ma).join(", ") + " trong khi chưa xác định cấp độ an toàn hệ thống thông tin — kiến trúc an toàn thông tin mục tiêu không thể có hệ thống 'không cấp độ'.", "eve") : null,
          trungGiu.length ? ui.note("Giữ hoặc nâng cấp " + trungGiu.map(r => r.ma).join(", ") + " là tiếp tục đầu tư trùng lặp — trái mục đích 'hạn chế trùng lặp' của Khung 4.0 (Chương 1, Mục I.2.b).", "eve") : null,
          congCongGiu.length ? ui.note("Ứng dụng công cộng " + congCongGiu.map(r => r.ma).join(", ") + " không thể 'nâng cấp' hay 'thay bằng nền tảng' — nó không phải hệ thống của cơ quan; chỉ có thể dừng dùng cho hồ sơ.", "eve") : null,
          daQd.length === rows.length && !chuaNam.length && !chuaCapDoGiu.length && !trungGiu.length && !congCongGiu.length ? ui.note("<b>Lộ trình đã đủ và nhất quán.</b> Hiện trạng " + rows.length + " hệ thống → mục tiêu " + conLai + " hệ thống, tiết kiệm " + trieu(tietKiem) + ". Nhớ kèm giải pháp về nguồn lực (ai làm, kinh phí từ đâu, bồi dưỡng cán bộ) để lộ trình khả thi.", "ok") : null);
        S.chartSo = { title: "Số hệ thống phải xử lý theo năm", labels: NAM.map(String), series: QD.slice(1).map((q, j) => ({ name: q, color: QD_KIND[q], values: theoNam.map(v => v[j]) })), ylabel: "hệ thống", intY: true, aspect: 0.55, fmtTip: v => v + " hệ thống" };
        S.chartChi = { title: "Chi phí tự mua phần mềm còn phải trả mỗi năm", series: [{ name: "Theo lộ trình đã chọn", color: "ok", points: NAM.map((n, i) => [n, chiTheoNam[i]]), marker: true, area: true }, { name: "Nếu giữ nguyên hiện trạng", color: "eve", points: NAM.map(n => [n, tongChi]), dash: [4, 4] }], xlabel: "năm", ylabel: "triệu đồng/năm", xmin: 2026, xmax: 2030, ymin: 0, ymax: Math.max(10, tongChi * 1.15), xticks: NAM, fmtX: v => String(Math.round(v)), fmtY: v => LAB.num(v), fmtTip: v => LAB.num(v) + " triệu đồng/năm", aspect: 0.55 };
        boxSo.draw(); boxChi.draw();
      }
      nguyenTac.render(ui.title("Nguyên tắc cơ bản trong xây dựng Khung kiến trúc số", "Khung 4.0 — Chương 1, Mục III.3; soi vào từng quyết định ở trên"),
        ui.steps([
          { i: "a", t: "Phù hợp với <b>Khung kiến trúc Chính phủ số Việt Nam</b> và các văn bản hướng dẫn liên quan." },
          { i: "b", t: "Phù hợp với định hướng, mục tiêu ứng dụng công nghệ thông tin, phát triển Chính phủ số của quốc gia." },
          { i: "c", t: "Phù hợp với chiến lược, mục tiêu phát triển kinh tế – xã hội của đất nước, của các bộ, ngành, địa phương." },
          { i: "d", t: "Bảo đảm việc đầu tư triển khai Chính phủ số <b>hiệu quả</b>." },
          { i: "đ", t: "Phát triển hạ tầng số trên nguyên tắc <b>'hiện đại, đồng bộ, an ninh, an toàn, hiệu quả, tránh lãng phí'</b>." },
          { i: "e", t: "<b>Nền tảng là giải pháp đột phá.</b> Xây dựng và dùng chung các nền tảng số quốc gia, vùng; kết hợp mô hình tập trung và phân tán; nền tảng quy mô quốc gia phải được làm trước, làm tốt, làm tập trung.", hi: true },
          { i: "g", t: "Đẩy mạnh ứng dụng và phát triển công nghệ số: điện toán đám mây, trí tuệ nhân tạo… theo lộ trình phù hợp." },
          { i: "h", t: "Triển khai giải pháp bảo mật, an toàn thông tin mạng, an ninh mạng ở các thành phần của khung kiến trúc mục tiêu." },
          { i: "i", t: "Tuân thủ quy chuẩn, tiêu chuẩn bắt buộc áp dụng, quy định kỹ thuật về ứng dụng công nghệ thông tin, phát triển Chính phủ số." },
          { i: "k", t: "<b>Dữ liệu là tài nguyên mới</b>; làm giàu, khai thác tối đa tiềm năng của dữ liệu, đưa dữ liệu thành tư liệu sản xuất chính.", hi: true },
          { i: "l", t: "Phát triển dữ liệu số tạo nền tảng cho Chính phủ số; chia sẻ dữ liệu thông suốt giữa các cơ quan nhà nước; cung cấp dữ liệu mở có chất lượng." }]),
        ui.note("Trước khi xin kinh phí làm phần mềm riêng, hãy kiểm tra xem đã có <b>nền tảng dùng chung</b> nào làm được việc đó chưa. Bảy nội dung của một Khung kiến trúc số: tầm nhìn; mục tiêu; phạm vi áp dụng; nguyên tắc; khung kiến trúc hiện trạng; khung kiến trúc mục tiêu; tổ chức triển khai.", "key"));
      veBang(); draw(); pane.appendChild(root);
    } }
  ]
});
})();
