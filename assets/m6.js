/* Mô-đun m6 — Buổi 6: Dịch vụ công trực tuyến và trải nghiệm người dân (Bài 6).
   Năm tab: toantrinh (phân loại theo NĐ 42/2022), santap (sàn tập hai vai), motcong (nhiều cổng về một),
   hanhtrinh (năm chặng, bảy điểm nghẽn, ngôn ngữ dễ hiểu), sohoso (phân tích sổ hồ sơ Phường Mẫu).
   Căn cứ chỉ lấy từ _build/CANCU.md; nội dung bám _build/bai6.py. Mọi nhân thân, phí, số liệu Phường Mẫu là hư cấu. */
(function () { "use strict";
const { h, ui, chart } = LAB;
const svg = LAB.svg;

/* ---------- tiện ích chung của mô-đun ---------- */
const ttByMa = ma => (LAB.data.thu_tuc || []).find(t => t.ma === ma) || { ma, ten: ma, muc_do: "", han_ngay: "", le_phi: 0 };
const pad2 = n => String(n).padStart(2, "0");
const gioStr = d => LAB.date.vn(d) + " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes());
const nowStr = () => gioStr(new Date());
const tagTrangThai = tt => ui.tag(tt, { "Chờ tiếp nhận": "mut", "Đã tiếp nhận": "pt", "Đang thẩm định": "ct", "Đã ký số": "key", "Đã trả kết quả": "ok", "Chờ bổ sung": "eve", "Từ chối": "eve" }[tt] || "mut");
const tagMucDo = m => ui.tag(m, m === "Toàn trình" ? "ok" : "key");
/* đoạn văn an toàn cho chuỗi người dùng nhập (không dùng innerHTML) */
const noteText = (kind, ...kids) => h("div", { class: "note " + (kind || "") }, ...kids);
const timeline = items => h("ul", { class: "timeline" }, items.map(it => h("li", { class: it.kind || null }, h("span", { class: "d" }, it.t + " · " + it.ai), h("div", null, it.nd))));

/* Sáu rào cản khi đưa dịch vụ lên toàn trình (slide "Sáu rào cản") */
const RAO_CAN = [
  { id: 1, nhom: "Pháp lý và nghiệp vụ", t: "Thủ tục còn đòi bản chính hoặc bản sao có chứng thực" },
  { id: 2, nhom: "Pháp lý và nghiệp vụ", t: "Quy trình nội bộ còn khâu ký tay, đóng dấu trên giấy" },
  { id: 3, nhom: "Dữ liệu", t: "Dữ liệu chưa kết nối nên vẫn phải hỏi lại người dân giấy tờ cũ" },
  { id: 4, nhom: "Dữ liệu", t: "Dữ liệu chưa đúng, chưa đủ nên hệ thống không tự điền được" },
  { id: 5, nhom: "Con người", t: "Người dân chưa có tài khoản định danh điện tử hoặc chữ ký số" },
  { id: 6, nhom: "Con người", t: "Cán bộ chưa quen thao tác và còn e ngại trách nhiệm khi ký số" },
];
const CANCU_42 = ui.cancu("Nghị định 42/2022/NĐ-CP ngày 24/6/2022 của Chính phủ, khoản 1 Điều 11",
  "Dịch vụ công trực tuyến <b>toàn trình</b>: cung cấp toàn bộ thông tin về thủ tục hành chính, việc thực hiện và giải quyết đều trên môi trường mạng; kết quả trả trực tuyến hoặc qua dịch vụ bưu chính công ích. <b>Một phần</b>: dịch vụ không bảo đảm đủ các điều kiện nói trên — chỉ cần một khâu buộc người dân đến trụ sở là rơi xuống một phần.");

/* =====================================================================================
   TAB 1 — Toàn trình hay một phần: 8 thủ tục của Phường Mẫu, học viên đánh dấu bước làm được trực tuyến
   ===================================================================================== */
const TT8 = [
  { ma: "HT01", buoc: [["Kê khai tờ khai đăng ký khai sinh trên Cổng", 1], ["Nộp giấy chứng sinh dưới dạng ảnh chụp/bản điện tử", 1], ["Không thu lệ phí — không có bước nộp phí", 1], ["Công chức hộ tịch kiểm tra, ký số kết quả", 1], ["Nhận bản điện tử Giấy khai sinh trên tài khoản", 1]] },
  { ma: "HT04", buoc: [["Kê khai yêu cầu cấp bản sao trích lục", 1], ["Xác thực bằng tài khoản định danh điện tử thay giấy tờ tuỳ thân", 1], ["Nộp lệ phí 8.000 đ trực tuyến", 1], ["Cán bộ trích xuất từ dữ liệu hộ tịch, ký số", 1], ["Nhận bản điện tử trích lục đã ký số", 1]] },
  { ma: "CT01", buoc: [["Đặt yêu cầu chứng thực trên mạng, tải ảnh giấy tờ", 1], ["Xuất trình bản chính tại quầy để đối chiếu", 0, 1], ["Nộp phí 2.000 đ (trực tuyến hoặc tại quầy)", 1], ["Cán bộ ký, đóng dấu lên bản sao giấy", 0, 2], ["Nhận bản chứng thực giấy tại quầy", 0, 2]] },
  { ma: "CR01", buoc: [["Kê khai tờ khai thay đổi thông tin cư trú", 1], ["Đính kèm ảnh chụp giấy tờ chứng minh chỗ ở hợp pháp", 1], ["Nộp lệ phí 7.000 đ trực tuyến", 1], ["Cơ quan đăng ký cư trú xác minh, cập nhật dữ liệu cư trú", 1], ["Nhận thông báo kết quả điện tử", 1]] },
  { ma: "KD01", buoc: [["Kê khai giấy đề nghị đăng ký hộ kinh doanh", 1], ["Nhân thân chủ hộ lấy từ định danh điện tử, không nộp bản sao", 1], ["Nộp lệ phí 50.000 đ trực tuyến", 1], ["Cơ quan đăng ký kinh doanh cấp xã xem xét, ký số", 1], ["Nhận Giấy chứng nhận điện tử đã ký số", 1]] },
  { ma: "HT02", buoc: [["Kê khai tờ khai đăng ký kết hôn trên mạng", 1], ["Nộp giấy xác nhận tình trạng hôn nhân (dữ liệu hộ tịch chưa kết nối)", 0, 3], ["Không thu lệ phí — không có bước nộp phí", 1], ["Hai bên có mặt, ký trực tiếp vào Sổ hộ tịch", 0, 1], ["Nhận Giấy chứng nhận kết hôn bản giấy ngay tại buổi ký", 0, 1]] },
  { ma: "DD01", buoc: [["Kê khai đơn đăng ký biến động trên mạng", 1], ["Nộp bản sao giấy tờ nhân thân vì dữ liệu chưa khớp địa chỉ mới", 0, 4], ["Nộp bản chính Giấy chứng nhận để xác nhận biến động", 0, 1], ["Cán bộ xác nhận biến động bằng bút, đóng dấu lên Giấy chứng nhận", 0, 2], ["Nhận lại Giấy chứng nhận bản giấy", 0, 2]] },
  { ma: "XD01", buoc: [["Kê khai đơn đề nghị cấp giấy phép xây dựng", 1], ["Chủ đầu tư ký đơn — chưa có chữ ký số công cộng nên ký giấy", 0, 5], ["Nộp lệ phí 75.000 đ trực tuyến", 1], ["Nộp bản vẽ thiết kế có đóng dấu đơn vị thiết kế trên giấy", 0, 2], ["Lãnh đạo chưa ký số, giấy phép ký tay rồi hẹn đến nhận", 0, 6]] },
];
const tabToanTrinh = {
  id: "toantrinh", title: "Toàn trình hay một phần",
  intro: "Với từng thủ tục của Phường Mẫu, đánh dấu những bước người dân <b>làm được trên môi trường mạng</b>. Hệ thống kết luận mức độ theo khoản 1 Điều 11 Nghị định 42/2022/NĐ-CP; đối chiếu đáp án và gọi tên rào cản (slide \"Sáu rào cản\"). Quy trình từng bước là mô phỏng của Phường Mẫu.",
  build(pane) {
    const KEY = "m6.toantrinh";
    const S = Object.assign({ hocvien: "", cur: "CT01", marks: {}, checked: {} }, LAB.store.get(KEY, {}));
    const save = () => LAB.store.set(KEY, { hocvien: S.hocvien, cur: S.cur, marks: S.marks, checked: S.checked });
    const { root, ctrl, view } = ui.sim();
    const getMarks = ma => { if (!S.marks[ma]) S.marks[ma] = TT8.find(t => t.ma === ma).buoc.map(() => false); return S.marks[ma]; };
    const ketLuan = ma => getMarks(ma).every(Boolean) ? "Toàn trình" : "Một phần";
    const tiles = ui.tiles({ id: "m6tt-tiles", cls: "narrow", value: S.cur, items: TT8.map(t => { const d = ttByMa(t.ma); return { id: t.ma, title: d.ten, sub: d.linh_vuc + " · hạn " + d.han_ngay + " ngày · " + LAB.vnd(d.le_phi), kind: "pt" }; }), onChange: v => { S.cur = v; save(); draw(); } });
    ctrl.append(
      ui.field({ id: "m6tt-hv", label: "Họ tên học viên", value: S.hocvien, placeholder: "để ghi vào bản nộp", onInput: v => { S.hocvien = v; save(); } }),
      h("div", { class: "fld" }, h("label", null, h("b", null, "Chọn thủ tục")), tiles),
      ui.presets([
        { label: "Ví dụ: chứng thực bản sao (thảo luận nhóm)", apply: () => { S.cur = "CT01"; tiles.set("CT01"); S.marks.CT01 = [true, false, true, false, false]; S.checked.CT01 = true; save(); draw(); } },
        { label: "Ví dụ: khai sinh toàn trình", apply: () => { S.cur = "HT01"; tiles.set("HT01"); S.marks.HT01 = [true, true, true, true, true]; S.checked.HT01 = true; save(); draw(); } },
      ]),
      h("div", { class: "row" },
        ui.btn("Đối chiếu đáp án", () => { S.checked[S.cur] = true; save(); draw(); }, "pri"),
        ui.btn("Làm lại thủ tục này", () => { delete S.marks[S.cur]; delete S.checked[S.cur]; save(); draw(); }),
        ui.btn("Làm lại tất cả", () => { S.marks = {}; S.checked = {}; save(); draw(); }, "sm"),
        ui.btn("Tải CSV", xuatCSV, "sm")),
      CANCU_42);
    const out = ui.slot(); const tong = ui.slot(); view.append(out, tong);
    function xuatCSV() {
      const rows = [];
      TT8.forEach(t => { const d = ttByMa(t.ma); const m = getMarks(t.ma); t.buoc.forEach((b, i) => rows.push([S.hocvien, t.ma, d.ten, b[0], m[i] ? "Trực tuyến" : "Phải đến trực tiếp", b[1] ? "Trực tuyến" : "Phải đến trực tiếp", b[2] ? RAO_CAN[b[2] - 1].t : "", ketLuan(t.ma), d.muc_do, S.checked[t.ma] ? (ketLuan(t.ma) === d.muc_do ? "Đúng" : "Sai") : "Chưa đối chiếu"])); });
      LAB.csv.download("m6_toan_trinh_mot_phan.csv", ["hoc_vien", "ma_thu_tuc", "thu_tuc", "buoc", "hoc_vien_danh_dau", "dap_an_buoc", "rao_can", "ket_luan_hoc_vien", "dap_an_muc_do", "ket_qua"], rows);
    }
    function draw() {
      const t = TT8.find(x => x.ma === S.cur); const d = ttByMa(t.ma); const m = getMarks(t.ma); const ck = !!S.checked[t.ma];
      const kl = ketLuan(t.ma);
      const list = h("div", { class: "stack" }, t.buoc.map((b, i) => {
        const row = h("div", { class: "steps" }, h("li", { class: ck && (m[i] !== !!b[1]) ? "hi" : null },
          h("span", { class: "i" }, i + 1),
          h("div", null, ui.check({ id: "m6tt-b-" + t.ma + "-" + i, label: b[0], value: m[i], onChange: v => { m[i] = v; delete S.checked[t.ma]; save(); draw(); } }),
            ck ? h("div", { class: "small", style: { marginTop: "4px" } }, b[1] ? ui.tag("Đáp án: làm được trực tuyến", "ok") : ui.tag("Đáp án: còn phải đến trực tiếp", "eve"), b[2] ? h("span", null, " Rào cản " + b[2] + " (" + RAO_CAN[b[2] - 1].nhom + "): " + RAO_CAN[b[2] - 1].t) : null, m[i] !== !!b[1] ? h("b", { class: "err" }, " — anh/chị đánh dấu khác đáp án") : null) : null)));
        return row;
      }));
      const nOn = m.filter(Boolean).length;
      const ro = [{ k: "Thủ tục", v: d.ten, kind: "pt" }, { k: "Bước trên mạng / tổng", v: nOn + " / " + m.length, kind: "aqua" }, { k: "Kết luận của anh/chị", v: kl, kind: kl === "Toàn trình" ? "ok" : "key", big: true }];
      if (ck) ro.push({ k: "Đáp án", v: d.muc_do, kind: kl === d.muc_do ? "ok" : "eve", big: true });
      const kids = [ui.title(d.ten, d.linh_vuc + " · hạn " + d.han_ngay + " ngày làm việc · lệ phí " + LAB.vnd(d.le_phi)), ui.readouts(ro),
        h("div", { class: "small" }, "Đánh dấu bước nào người dân làm được ngay trên môi trường mạng. Chỉ cần một bước bỏ trống, kết luận chuyển sang \"Một phần\"."), list];
      if (ck) {
        const rc = [...new Set(t.buoc.filter(b => !b[1]).map(b => b[2]))];
        kids.push(kl === d.muc_do ? ui.note("<b>Đúng.</b> " + (d.muc_do === "Toàn trình" ? "Cả năm bước đều nằm trên môi trường mạng, kết quả trả trực tuyến — toàn trình theo khoản 1 Điều 11 NĐ 42/2022." : "Còn khâu buộc người dân đến trụ sở nên là một phần. Muốn lên toàn trình phải gỡ từng rào cản bên dưới."), "ok")
          : ui.note("<b>Chưa khớp đáp án.</b> Xem lại các bước được tô vàng: " + (d.muc_do === "Toàn trình" ? "thủ tục này Phường Mẫu đã đưa toàn bộ lên mạng." : "vẫn còn bước người dân phải đến trực tiếp."), "eve"));
        if (rc.length) kids.push(ui.panel("Rào cản cần gỡ để lên toàn trình", ui.table(["Rào cản", "Nhóm", "Hướng xử lý gợi ý"], rc.map(id => [RAO_CAN[id - 1].t, RAO_CAN[id - 1].nhom, { "1": "Dùng bản điện tử đã ký số của cơ quan cấp thay cho bản chính (Điều 17 NĐ 118/2025: số hoá một lần, dùng lại nhiều lần)", "2": "Ký số kết quả bằng chữ ký số chuyên dùng công vụ; bản điện tử có giá trị như bản gốc (Điều 10 Luật Giao dịch điện tử 20/2023/QH15)", "3": "Kết nối, chia sẻ dữ liệu bắt buộc giữa cơ quan (NĐ 278/2025/NĐ-CP)", "4": "Làm sạch dữ liệu nền: đúng, đủ, sạch, sống (Buổi 5)", "5": "Hỗ trợ đăng ký định danh mức độ 2 ngay tại Bộ phận Một cửa; chữ ký số công cộng", "6": "Đào tạo lại, cầm tay chỉ việc; nhật ký xử lý bảo vệ cán bộ làm đúng" }[String(id)]]), { cls: "wrap" })));
      }
      out.render(kids);
      /* bảng tổng hợp 8 thủ tục */
      let dung = 0, daCham = 0;
      const rows = TT8.map(t2 => { const d2 = ttByMa(t2.ma); const c = !!S.checked[t2.ma]; const k2 = ketLuan(t2.ma); if (c) { daCham++; if (k2 === d2.muc_do) dung++; } return [d2.ten, getMarks(t2.ma).filter(Boolean).length + "/" + t2.buoc.length, k2, c ? tagMucDo(d2.muc_do) : "—", c ? (k2 === d2.muc_do ? ui.tag("Đúng", "ok") : ui.tag("Sai", "eve")) : ui.tag("Chưa đối chiếu", "mut")]; });
      tong.render(ui.panel("Tổng hợp 8 thủ tục", h("div", { class: "row" }, ui.score(dung, "đúng / 8", 8), h("div", { class: "small" }, "Đã đối chiếu " + daCham + "/8 thủ tục. Nghị quyết 71/NQ-CP ngày 01/4/2025: dịch vụ công trực tuyến toàn trình đạt 90 % vào năm 2030.")),
        ui.table(["Thủ tục", "Bước trên mạng", "Kết luận của anh/chị", "Đáp án", "Kết quả"], rows, { cls: "tight", rowCls: r => r[0] === d.ten ? "hi" : null })));
    }
    draw(); pane.appendChild(root);
  } };

/* =====================================================================================
   TAB 2 — Sàn tập Dịch vụ công: hai vai trên cùng một sổ hồ sơ lưu trong LAB.store (khoá m6.santap)
   ===================================================================================== */
const NHAN_THAN = [
  { id: "an", ho_ten: "Nguyễn Văn An", muc: 2, ngay_sinh: "12/03/1988", dinh_danh: "079088000101", dia_chi: "Số 12 đường Mẫu 1, Phường Mẫu, Tỉnh Mẫu", sdt: "0900 000 101" },
  { id: "binh", ho_ten: "Trần Thị Bình", muc: 2, ngay_sinh: "25/09/1992", dinh_danh: "079192000202", dia_chi: "Số 45 đường Mẫu 3, Phường Mẫu, Tỉnh Mẫu", sdt: "0900 000 202" },
  { id: "cuong", ho_ten: "Lê Minh Cường", muc: 1, ngay_sinh: "03/01/1975", dinh_danh: "079075000303", dia_chi: "Số 8 đường Mẫu 5, Phường Mẫu, Tỉnh Mẫu", sdt: "0900 000 303" },
];
const TT5 = ["HT01", "HT04", "CT01", "CR01", "KD01"];
/* thành phần hồ sơ mô phỏng; truc_tiep = thành phần buộc đến quầy (làm thủ tục rơi xuống một phần) */
const THANH_PHAN = {
  HT01: [{ t: "Tờ khai đăng ký khai sinh (điện tử)" }, { t: "Giấy chứng sinh (ảnh chụp/bản điện tử)" }, { t: "Giấy chứng nhận kết hôn của cha mẹ (lấy từ dữ liệu hộ tịch khi liên thông)" }],
  HT04: [{ t: "Tờ khai cấp bản sao trích lục hộ tịch (điện tử)" }, { t: "Giấy tờ tuỳ thân — thay bằng tài khoản định danh điện tử" }],
  CT01: [{ t: "Yêu cầu chứng thực (điện tử)" }, { t: "Bản chụp giấy tờ cần chứng thực" }, { t: "Bản chính xuất trình tại quầy để đối chiếu", truc_tiep: true }],
  CR01: [{ t: "Tờ khai thay đổi thông tin cư trú (điện tử)" }, { t: "Giấy tờ chứng minh chỗ ở hợp pháp (ảnh chụp)" }, { t: "Ý kiến đồng ý của chủ hộ (xác nhận điện tử)" }],
  KD01: [{ t: "Giấy đề nghị đăng ký hộ kinh doanh (điện tử)" }, { t: "Giấy tờ pháp lý của chủ hộ — thay bằng định danh điện tử" }, { t: "Hợp đồng thuê địa điểm kinh doanh (ảnh chụp, nếu có)", tuy_chon: true }],
};
const TRUONG_NT = [["ho_ten", "Họ và tên"], ["ngay_sinh", "Ngày sinh"], ["dinh_danh", "Số định danh cá nhân"], ["dia_chi", "Nơi cư trú"], ["sdt", "Số điện thoại"]];
const ACTS = {
  tiepnhan: { label: "Tiếp nhận", from: ["Chờ tiếp nhận"], to: "Đã tiếp nhận", ai: "Cán bộ Một cửa", nd: "Tiếp nhận hồ sơ: kiểm tra thành phần, số hoá giấy tờ, ký số bản sao chụp, cấp mã hồ sơ (Điều 17 NĐ 118/2025/NĐ-CP).", kind: "pt", cls: "pri" },
  thamdinh: { label: "Chuyển thẩm định", from: ["Đã tiếp nhận"], to: "Đang thẩm định", ai: "Cán bộ Một cửa", nd: "Chuyển hồ sơ tới cơ quan chuyên môn thẩm định (Điều 18, 19 NĐ 118/2025/NĐ-CP).", kind: "ct", cls: "pri" },
  kyso: { label: "Trình ký số", from: ["Đang thẩm định"], to: "Đã ký số", ai: "Lãnh đạo UBND Phường Mẫu", nd: "Ký số kết quả giải quyết bằng chữ ký số chuyên dùng công vụ (Luật Giao dịch điện tử 20/2023/QH15).", kind: "key", cls: "pri" },
  tra: { label: "Trả kết quả điện tử", from: ["Đã ký số"], to: "Đã trả kết quả", ai: "Cán bộ Một cửa", nd: "Trả kết quả điện tử đã ký số về tài khoản người dân (Điều 22 NĐ 118/2025/NĐ-CP).", kind: "ok", cls: "pri" },
  ghinhan: { label: "Ghi nhận đã bổ sung", from: ["Chờ bổ sung"], to: "Đã tiếp nhận", ai: "Cán bộ Một cửa", nd: "Ghi nhận người dân đã bổ sung đủ; tiếp tục xử lý.", kind: "pt", cls: "pri" },
  bosung: { label: "Yêu cầu bổ sung", from: ["Chờ tiếp nhận", "Đã tiếp nhận", "Đang thẩm định"], to: "Chờ bổ sung", ai: "Cán bộ Một cửa", kind: "eve", input: "Nội dung cần bổ sung — ghi rõ thiếu giấy gì, nộp bản điện tử hay bản chính, nộp ở đâu, trước ngày nào" },
  tuchoi: { label: "Từ chối", from: ["Chờ tiếp nhận", "Đã tiếp nhận", "Đang thẩm định", "Chờ bổ sung"], to: "Từ chối", ai: "Cán bộ Một cửa", kind: "eve", input: "Lý do từ chối — nêu rõ căn cứ" },
};
/* 10 hồ sơ mẫu có sẵn trong sổ tiếp nhận */
function hoSoMau() {
  const plan = [["HT01", "an", "Chờ tiếp nhận"], ["CT01", "binh", "Chờ tiếp nhận"], ["CR01", "cuong", "Chờ tiếp nhận"], ["HT04", "an", "Đã tiếp nhận"], ["KD01", "binh", "Đã tiếp nhận"], ["CR01", "an", "Đang thẩm định"], ["HT01", "binh", "Chờ bổ sung"], ["HT04", "cuong", "Đã trả kết quả"], ["KD01", "an", "Đã trả kết quả"], ["CT01", "cuong", "Từ chối"]];
  const chuoi = ["Chờ tiếp nhận", "Đã tiếp nhận", "Đang thẩm định", "Đã ký số", "Đã trả kết quả"];
  return plan.map((p, i) => {
    const d = new Date(Date.now() - (14 - i) * 86400000); d.setHours(8 + (i % 6), 10 + i * 3, 0, 0);
    const nt = NHAN_THAN.find(n => n.id === p[1]); const tt = ttByMa(p[0]);
    const nk = [{ t: gioStr(d), ai: "Người dân", nd: "Gửi hồ sơ trực tuyến qua Cổng Dịch vụ công quốc gia.", kind: "pt" }, { t: gioStr(d), ai: "Hệ thống", nd: "Kiểm tra tự động về kỹ thuật: đủ thành phần — phản hồi tự động xác nhận đã gửi thành công (NĐ 310/2026/NĐ-CP).", kind: "aqua" }];
    const buoc = (k, gioCong) => { const a = ACTS[k]; const d2 = new Date(d.getTime() + gioCong * 3600000); nk.push({ t: gioStr(d2), ai: a.ai, nd: a.nd, kind: a.kind }); };
    const idx = chuoi.indexOf(p[2]);
    if (idx >= 1) buoc("tiepnhan", 2); if (idx >= 2) buoc("thamdinh", 5); if (idx >= 3) buoc("kyso", 26); if (idx >= 4) buoc("tra", 27);
    if (p[2] === "Chờ bổ sung") { buoc("tiepnhan", 2); nk.push({ t: gioStr(new Date(d.getTime() + 4 * 3600000)), ai: "Cán bộ Một cửa", nd: "Yêu cầu bổ sung: ảnh giấy chứng sinh bị mờ, đề nghị chụp lại rõ nét và tải lên tại mục Đính kèm trước ngày " + LAB.date.vn(new Date(d.getTime() + 5 * 86400000)) + ".", kind: "eve" }); }
    if (p[2] === "Từ chối") { buoc("tiepnhan", 2); nk.push({ t: gioStr(new Date(d.getTime() + 3 * 3600000)), ai: "Cán bộ Một cửa", nd: "Từ chối: giấy tờ đề nghị chứng thực là bản chụp từ bản photo, không có bản chính để đối chiếu theo yêu cầu của thủ tục.", kind: "eve" }); }
    return { ma: "PM-" + String(d.getFullYear()).slice(2) + pad2(d.getMonth() + 1) + pad2(d.getDate()) + "-" + pad2(i + 1).padStart(4, "0"), tt: p[0], ten_tt: tt.ten, nhan: p[1], ho_ten: nt.ho_ten, hoc_vien: "(hồ sơ mẫu)", noi_dung: "Đề nghị giải quyết thủ tục " + tt.ten.toLowerCase() + ".", lien_thong: true, dinh_kem: THANH_PHAN[p[0]].map(x => x.t), phi: tt.le_phi, da_tt: tt.le_phi > 0, trang_thai: p[2], ngay_nop: gioStr(d), nhat_ky: nk, mau: true };
  });
}
const tabSanTap = {
  id: "santap", title: "Sàn tập Dịch vụ công",
  intro: "Cổng dịch vụ công <b>giả lập</b> của UBND Phường Mẫu. Vai <b>Người dân</b>: sáu bước từ đăng nhập định danh đến theo dõi hồ sơ. Vai <b>Cán bộ Một cửa</b>: sổ tiếp nhận, nhật ký xử lý và thao tác theo trạng thái. Hai vai dùng chung một sổ hồ sơ lưu trên máy của anh/chị (Nghị định 118/2025/NĐ-CP).",
  build(pane) {
    const KEY = "m6.santap";
    const St = LAB.store.get(KEY, null);
    const S = { vai: "dan", hocvien: St ? St.hocvien || "" : "", hoso: St && Array.isArray(St.hoso) ? St.hoso : hoSoMau(), seq: St ? St.seq || 11 : 11,
      buoc: 1, nhan: "an", tt: "HT01", lienthong: true, kekhai: {}, dinhkem: [], daTT: false, noidung: "", maMoi: null, xem: null, cb: { ma: null, act: null, text: "", reset: 0 } };
    const save = () => LAB.store.set(KEY, { hocvien: S.hocvien, hoso: S.hoso, seq: S.seq });
    const { root, view } = ui.sim({ wide: true });
    const nt = () => NHAN_THAN.find(n => n.id === S.nhan);
    const body = ui.slot();
    view.append(ui.warn("Cổng giả lập phục vụ đào tạo. Chỉ dùng ba nhân thân mẫu có sẵn; không nhập thông tin cá nhân thật. Mọi mức phí, thời hạn, kết quả đều là số mô phỏng, không có giá trị pháp lý."),
      h("div", { class: "row", style: { justifyContent: "space-between" } },
        h("div", { class: "row" }, h("b", null, "Vai: "), ui.seg({ id: "m6st-vai", options: [["dan", "Người dân"], ["cb", "Cán bộ Một cửa"]], value: S.vai, onChange: v => { S.vai = v; S.cb.act = null; draw(); } })),
        h("div", { class: "small" }, "Phiên bản đầy đủ nhiều người dùng: ", h("a", { href: "https://nntminh1983.github.io/boiduongkienthuccongngheso/", target: "_blank", rel: "noopener" }, "Sàn tập Dịch vụ công"), " (cổng giả lập dùng chung cho lớp — giảng viên cung cấp tại lớp)")),
      body);
    pane.appendChild(root);
    /* ---- ghi nhật ký và đổi trạng thái ---- */
    function ghi(hs, ai, nd, kind) { hs.nhat_ky.push({ t: nowStr(), ai, nd, kind }); hs.cap_nhat = nowStr(); save(); }
    function thaoTac(hs, k, text) { const a = ACTS[k]; if (!a.from.includes(hs.trang_thai)) return; hs.trang_thai = a.to; ghi(hs, a.ai, a.input ? a.label + ": " + text : a.nd, a.kind); }
    /* ================= VAI NGƯỜI DÂN ================= */
    const TEN_BUOC = ["Định danh", "Chọn thủ tục", "Kê khai", "Đính kèm", "Nộp phí", "Gửi và theo dõi"];
    function wizard() { return h("div", { class: "wizard" }, TEN_BUOC.map((t, i) => h("span", { class: "st" + (i + 1 === S.buoc ? " on" : i + 1 < S.buoc ? " done" : "") }, (i + 1) + ". " + t))); }
    const nav = (prev, next, nextLabel, disabled) => h("div", { class: "row" }, prev ? ui.btn("Quay lại", () => { S.buoc--; draw(); }) : null, next ? (() => { const b = ui.btn(nextLabel || "Tiếp tục", next, "pri"); b.disabled = !!disabled; return b; })() : null);
    function veNguoiDan() {
      const kids = [wizard()];
      const tt = ttByMa(S.tt);
      if (S.buoc === 1) {
        kids.push(ui.title("Bước 1 — Đăng nhập bằng định danh điện tử (mô phỏng)", "chọn một nhân thân mẫu"),
          ui.tiles({ id: "m6st-nhan", value: S.nhan, items: NHAN_THAN.map(n => ({ id: n.id, title: n.ho_ten, sub: "Tài khoản định danh mức độ " + n.muc + " · sinh " + n.ngay_sinh, kind: n.muc === 2 ? "ok" : "key" })), onChange: v => { S.nhan = v; S.kekhai = {}; draw(); } }),
          ui.field({ id: "m6st-hv", label: "Họ tên học viên (để giảng viên nhận diện bài làm, không phải người nộp)", value: S.hocvien, placeholder: "Nguyễn Văn X — nhóm 2", onInput: v => { S.hocvien = v; save(); } }),
          nt().muc === 1 ? ui.note("Tài khoản <b>mức độ 1</b> chỉ dùng cho dịch vụ đơn giản; phần lớn thủ tục hành chính cần <b>mức độ 2</b> (xác thực hai yếu tố). Sàn tập vẫn cho đi tiếp để anh/chị quan sát cảnh báo ở các bước sau.", "eve") : ui.note("Tài khoản định danh mức độ 2 — đủ điều kiện cho cả năm thủ tục mẫu. Tài khoản giao dịch điện tử để giải quyết thủ tục chính là danh tính điện tử dùng đăng nhập Cổng Dịch vụ công quốc gia (NĐ 310/2026/NĐ-CP).", "ok"),
          ui.cancu("Nghị định 69/2024/NĐ-CP ngày 25/6/2024 về định danh và xác thực điện tử; Nghị định 320/2026/NĐ-CP (hiệu lực 28/9/2026) sửa khoản 4 Điều 4", "Không được yêu cầu nộp giấy tờ khi dữ liệu đã được tích hợp trong hệ thống định danh và xác thực điện tử."),
          nav(false, () => { S.buoc = 2; draw(); }, "Đăng nhập và tiếp tục"));
      } else if (S.buoc === 2) {
        kids.push(ui.title("Bước 2 — Chọn thủ tục", "thời hạn và lệ phí lấy từ danh mục thủ tục của Phường Mẫu"),
          ui.tiles({ id: "m6st-tt", value: S.tt, items: TT5.map(ma => { const d = ttByMa(ma); return { id: ma, title: d.ten, sub: d.muc_do + " · hạn " + d.han_ngay + " ngày làm việc · " + LAB.vnd(d.le_phi), kind: d.muc_do === "Toàn trình" ? "ok" : "key" }; }), onChange: v => { S.tt = v; S.dinhkem = []; S.daTT = false; draw(); } }),
          tt.muc_do === "Một phần" ? ui.note("Thủ tục <b>một phần</b>: anh/chị đặt yêu cầu trên mạng nhưng vẫn phải mang <b>bản chính</b> đến quầy để đối chiếu (xem Bước 4).", "key") : ui.note("Thủ tục <b>toàn trình</b>: mọi bước trên môi trường mạng, kết quả là bản điện tử đã ký số.", "ok"),
          nav(true, () => { S.buoc = 3; draw(); }, "Kê khai hồ sơ"));
      } else if (S.buoc === 3) {
        const n = nt();
        const form = h("div", { class: "docform" }, TRUONG_NT.map(([k, lab]) => { const auto = S.lienthong; const f = ui.field({ id: "m6st-f-" + k, label: lab, value: auto ? n[k] : (S.kekhai[k] || ""), hint: auto ? "Điền tự động từ dữ liệu dân cư" : "Phải tự gõ lại", onInput: v => { S.kekhai[k] = v; } }); if (auto) { f.classList.add("auto"); f.input.readOnly = true; } return f; }));
        const soTuGo = S.lienthong ? 0 : TRUONG_NT.length;
        kids.push(ui.title("Bước 3 — Kê khai biểu mẫu", tt.ten),
          ui.check({ id: "m6st-lt", label: "Bật liên thông dữ liệu dân cư (nguyên tắc chỉ hỏi một lần)", value: S.lienthong, onChange: v => { S.lienthong = v; draw(); } }),
          ui.readouts([{ k: "Ô nhân thân phải tự gõ", v: String(soTuGo), kind: soTuGo ? "eve" : "ok", big: true }, { k: "Ô hệ thống tự điền", v: String(TRUONG_NT.length - soTuGo), kind: "pt", big: true }]),
          S.lienthong ? ui.note("Các ô nền xanh, viền nét đứt được lấy từ dữ liệu dân cư. Người dân chỉ khai phần thực sự mới.", "ok") : ui.note("<b>Không có liên thông</b>: người dân phải gõ lại " + TRUONG_NT.length + " ô mà Nhà nước đã có — mỗi ô là một cơ hội sai sót, nhân lên hàng triệu hồ sơ mỗi năm.", "key"),
          form,
          ui.field({ id: "m6st-nd", label: "Nội dung đề nghị giải quyết", type: "textarea", value: S.noidung, placeholder: "Ví dụ: đề nghị đăng ký khai sinh cho con là …", onInput: v => { S.noidung = v; } }),
          ui.cancu("Nghị định 278/2025/NĐ-CP ngày 22/10/2025 — kết nối, chia sẻ dữ liệu bắt buộc giữa các cơ quan; Luật Dữ liệu 60/2024/QH15"),
          nav(true, () => { S.buoc = 4; draw(); }, "Tiếp tục: đính kèm giấy tờ"));
      } else if (S.buoc === 4) {
        const tp = THANH_PHAN[S.tt];
        const thieu = tp.filter(x => !x.tuy_chon && !S.dinhkem.includes(x.t));
        const trucTiep = tp.filter(x => x.truc_tiep);
        kids.push(ui.title("Bước 4 — Đính kèm thành phần hồ sơ", "đánh dấu từng thành phần đã có bản điện tử"),
          h("div", { class: "stack" }, tp.map((x, i) => ui.check({ id: "m6st-dk-" + i, label: x.t + (x.tuy_chon ? " (tuỳ chọn)" : "") + (x.truc_tiep ? " — bước trực tiếp" : ""), value: S.dinhkem.includes(x.t), onChange: v => { S.dinhkem = v ? [...S.dinhkem, x.t] : S.dinhkem.filter(y => y !== x.t); draw(); } }))),
          thieu.length ? noteText("key", h("b", null, "Hồ sơ còn thiếu " + thieu.length + " thành phần: "), thieu.map(x => x.t).join("; "), ". Cảnh báo ngay lúc nộp rẻ hơn nhiều so với yêu cầu bổ sung sau đó.") : ui.note("Đủ thành phần hồ sơ. Cổng sẽ kiểm tra tự động về kỹ thuật khi anh/chị gửi (NĐ 310/2026/NĐ-CP).", "ok"),
          trucTiep.length ? ui.note("Thành phần <b>" + trucTiep[0].t + "</b> buộc người dân đến quầy — vì vậy thủ tục này là <b>một phần</b> theo NĐ 42/2022. Gợi ý xử lý: dùng bản điện tử đã ký số của cơ quan cấp hoặc trả kết quả qua bưu chính công ích để chỉ đi lại một lần.", "key") : null,
          nav(true, () => { S.buoc = 5; draw(); }, "Tiếp tục: nộp phí, lệ phí", thieu.length > 0));
      } else if (S.buoc === 5) {
        const phi = +tt.le_phi || 0;
        kids.push(ui.title("Bước 5 — Nộp phí, lệ phí", "Thông báo nghĩa vụ tài chính"),
          ui.table(["Khoản thu", "Số tiền", "Căn cứ"], [["Lệ phí " + tt.ten.toLowerCase(), LAB.vnd(phi), "Mức mô phỏng của Phường Mẫu"], ["Khoản thu ngoài quy định", "0 đ", "Khoản 5 Điều 4 NĐ 118/2025: không làm phát sinh chi phí ngoài quy định"]], { cls: "tight" }),
          phi === 0 ? ui.note("Thủ tục này <b>không thu lệ phí</b>. Không có bước thanh toán.", "ok")
            : S.daTT ? ui.note("<b>Đã thanh toán " + LAB.vnd(phi) + " (mô phỏng).</b> Biên lai điện tử số BL-" + S.seq + " đã cấp ngay sau khi nộp thành công.", "ok")
              : h("div", { class: "row" }, ui.btn("Thanh toán " + LAB.vnd(phi) + " (mô phỏng)", () => { S.daTT = true; draw(); }, "pri"), h("span", { class: "small" }, "Thanh toán trực tuyến là điều kiện bắt buộc của dịch vụ toàn trình.")),
          ui.cancu("Nghị định 118/2025/NĐ-CP ngày 09/6/2025, Điều 24", "Tổ chức, cá nhân nộp phí, lệ phí trực tuyến hoặc theo phương thức khác; cơ quan thông báo rõ số tiền, khoản thu, căn cứ thu và cấp biên lai điện tử."),
          nav(true, () => { S.buoc = 6; draw(); }, "Tiếp tục: gửi hồ sơ", phi > 0 && !S.daTT));
      } else {
        const n = nt();
        const kv = h("dl", { class: "kv" }, [["Người nộp", n.ho_ten + " (định danh mức " + n.muc + ")"], ["Thủ tục", tt.ten + " — " + tt.muc_do], ["Liên thông dữ liệu", S.lienthong ? "Bật — 5 ô tự điền" : "Tắt — người dân tự gõ 5 ô"], ["Thành phần đính kèm", S.dinhkem.length + " mục"], ["Lệ phí", +tt.le_phi ? LAB.vnd(tt.le_phi) + (S.daTT ? " — đã thanh toán" : " — chưa thanh toán") : "Không thu"], ["Thời hạn giải quyết", tt.han_ngay + " ngày làm việc"], ["Nội dung đề nghị", S.noidung || "(chưa ghi)"], ["Học viên", S.hocvien || "(chưa ghi)"]].flatMap(([k, v]) => [h("dt", null, k), h("dd", null, v)]));
        kids.push(ui.title("Bước 6 — Phiếu kiểm tra trước khi gửi"), kv,
          S.maMoi ? ui.note("<b>Đã gửi thành công.</b> Mã hồ sơ: <span class=\"hl\">" + S.maMoi + "</span>. Hãy chép lại mã này để dùng ở vai Cán bộ Một cửa. Cổng đã kiểm tra tự động về kỹ thuật và phản hồi tự động (NĐ 310/2026/NĐ-CP).", "ok")
            : h("div", { class: "row" }, ui.btn("Gửi hồ sơ", guiHoSo, "pri"), ui.btn("Quay lại", () => { S.buoc = 5; draw(); })),
          S.maMoi ? ui.btn("Nộp hồ sơ mới", () => { S.buoc = 2; S.maMoi = null; S.dinhkem = []; S.daTT = false; S.noidung = ""; draw(); }, "sm") : null);
      }
      /* bảng hồ sơ của tôi — hồ sơ do học viên tạo trên máy này */
      const cuaToi = S.hoso.filter(x => !x.mau);
      kids.push(ui.panel("Hồ sơ của tôi", cuaToi.length ? ui.table(["Mã hồ sơ", "Thủ tục", "Người nộp", "Ngày gửi", "Trạng thái", ""], cuaToi.slice().reverse().map(x => [{ text: x.ma, cls: "mono" }, x.ten_tt, x.ho_ten, x.ngay_nop, tagTrangThai(x.trang_thai), ui.btn(S.xem === x.ma ? "Đóng" : "Xem nhật ký", () => { S.xem = S.xem === x.ma ? null : x.ma; draw(); }, "sm")]), { cls: "tight" }) : h("div", { class: "small" }, "Chưa có hồ sơ nào. Hoàn tất sáu bước ở trên để gửi hồ sơ đầu tiên."),
        ...(() => { const x = cuaToi.find(y => y.ma === S.xem); if (!x) return []; const last = x.nhat_ky[x.nhat_ky.length - 1]; return [
          x.trang_thai === "Chờ bổ sung" ? noteText("eve", h("b", null, "Yêu cầu bổ sung: "), last.nd) : null,
          x.trang_thai === "Từ chối" ? noteText("eve", h("b", null, "Hồ sơ bị từ chối: "), last.nd) : null,
          x.trang_thai === "Đã trả kết quả" ? ui.note("<b>Kết quả điện tử đã ký số</b> đã có trong tài khoản. Bản điện tử có giá trị pháp lý như bản giấy (Điều 8–10 Luật Giao dịch điện tử 20/2023/QH15); không cần in ra đóng dấu.", "ok") : null,
          timeline(x.nhat_ky)]; })()));
      return kids;
    }
    function guiHoSo() {
      const tt = ttByMa(S.tt); const n = nt(); const d = new Date();
      const ma = "PM-" + String(d.getFullYear()).slice(2) + pad2(d.getMonth() + 1) + pad2(d.getDate()) + "-" + String(S.seq).padStart(4, "0"); S.seq++;
      const kk = {}; TRUONG_NT.forEach(([k]) => { kk[k] = S.lienthong ? n[k] : (S.kekhai[k] || ""); });
      const hs = { ma, tt: S.tt, ten_tt: tt.ten, nhan: S.nhan, ho_ten: n.ho_ten, hoc_vien: S.hocvien || "(chưa ghi tên)", noi_dung: S.noidung, lien_thong: S.lienthong, ke_khai: kk, dinh_kem: S.dinhkem.slice(), phi: +tt.le_phi || 0, da_tt: S.daTT, trang_thai: "Chờ tiếp nhận", ngay_nop: nowStr(), nhat_ky: [], mau: false };
      hs.nhat_ky.push({ t: nowStr(), ai: "Người dân", nd: "Gửi hồ sơ trực tuyến qua Cổng Dịch vụ công quốc gia" + (S.daTT ? "; đã nộp " + LAB.vnd(hs.phi) + " trực tuyến." : "."), kind: "pt" });
      hs.nhat_ky.push({ t: nowStr(), ai: "Hệ thống", nd: "Kiểm tra tự động về kỹ thuật: đủ " + S.dinhkem.length + " thành phần — phản hồi tự động xác nhận đã gửi thành công (NĐ 310/2026/NĐ-CP).", kind: "aqua" });
      S.hoso.push(hs); S.maMoi = ma; S.xem = ma; save(); draw();
    }
    /* ================= VAI CÁN BỘ MỘT CỬA ================= */
    function veCanBo() {
      const hs = S.hoso; const ketThuc = x => x.trang_thai === "Đã trả kết quả" || x.trang_thai === "Từ chối";
      const dang = hs.filter(x => !ketThuc(x) && x.trang_thai !== "Chờ bổ sung").length, bs = hs.filter(x => x.trang_thai === "Chờ bổ sung").length, tra = hs.filter(x => x.trang_thai === "Đã trả kết quả").length;
      const kids = [ui.readouts([{ k: "Tổng hồ sơ", v: LAB.num(hs.length), kind: "pt", big: true }, { k: "Đang xử lý", v: LAB.num(dang), kind: "ct", big: true }, { k: "Chờ bổ sung", v: LAB.num(bs), kind: "eve", big: true }, { k: "Tỉ lệ đã trả kết quả", v: LAB.pc(hs.length ? 100 * tra / hs.length : 0), kind: "ok", big: true }]),
        ui.note("Bốn ô trên đo <b>đầu ra</b> của bộ phận. Thước đo chất lượng theo khoản 1 Điều 4 NĐ 118/2025/NĐ-CP là <b>sự hài lòng của tổ chức, cá nhân</b> — xem tab Phân tích sổ hồ sơ.", "key"),
        ui.title("Sổ tiếp nhận", "bấm Mở để xem chi tiết; hồ sơ của học viên nằm cuối sổ"),
        ui.table(["Mã hồ sơ", "Thủ tục", "Người nộp", "Học viên", "Ngày gửi", "Lệ phí", "Trạng thái", ""], hs.map(x => [{ text: x.ma, cls: "mono" }, x.ten_tt, x.ho_ten, x.hoc_vien, x.ngay_nop, x.phi ? LAB.vnd(x.phi) + (x.da_tt ? " ✓" : "") : "Không thu", tagTrangThai(x.trang_thai), ui.btn(S.cb.ma === x.ma ? "Đóng" : "Mở", () => { S.cb.ma = S.cb.ma === x.ma ? null : x.ma; S.cb.act = null; S.cb.text = ""; draw(); }, "sm")]), { cls: "tight", rowCls: r => r[0].text === S.cb.ma ? "hi" : null })];
      const x = hs.find(y => y.ma === S.cb.ma);
      if (x) {
        const acts = Object.keys(ACTS).filter(k => ACTS[k].from.includes(x.trang_thai));
        const kk = x.ke_khai || {};
        const act = S.cb.act ? ACTS[S.cb.act] : null;
        kids.push(ui.panel("Chi tiết hồ sơ " + x.ma,
          h("div", { class: "row" }, tagTrangThai(x.trang_thai), tagMucDo(ttByMa(x.tt).muc_do), ui.tag("hạn " + ttByMa(x.tt).han_ngay + " ngày làm việc", "key")),
          h("dl", { class: "kv" }, [["Thủ tục", x.ten_tt], ["Người nộp", x.ho_ten + " — định danh mức " + (NHAN_THAN.find(n => n.id === x.nhan) || { muc: "?" }).muc], ["Kê khai nhân thân", x.lien_thong ? "Tự điền từ dữ liệu dân cư" : "Người dân tự gõ: " + TRUONG_NT.map(([k, l]) => l + " = " + (kk[k] || "(trống)")).join("; ")], ["Thành phần đính kèm", x.dinh_kem.length ? x.dinh_kem.join("; ") : "(không có)"], ["Nội dung đề nghị", x.noi_dung || "(trống)"], ["Lệ phí", x.phi ? LAB.vnd(x.phi) + (x.da_tt ? " — đã thanh toán trực tuyến" : " — chưa thanh toán") : "Không thu"]].flatMap(([k, v]) => [h("dt", null, k), h("dd", null, v)])),
          ui.title("Nhật ký xử lý", x.nhat_ky.length + " dòng — bằng chứng đã làm đúng, đúng lúc, đúng thẩm quyền"),
          timeline(x.nhat_ky),
          acts.length ? h("div", { class: "row" }, acts.map(k => ui.btn(ACTS[k].label, () => { if (ACTS[k].input) { S.cb.act = k; S.cb.text = ""; draw(); } else { thaoTac(x, k); draw(); } }, ACTS[k].cls || ""))) : ui.note("Hồ sơ đã kết thúc quy trình. Không còn thao tác nào.", "mut"),
          act ? h("div", { class: "stack" }, ui.field({ id: "m6st-act", label: act.label, type: "textarea", value: S.cb.text, placeholder: act.input, onInput: v => { S.cb.text = v; } }),
            S.cb.act === "bosung" ? ui.note("Viết sao cho người dân làm được ngay lần đầu: nêu đúng tên giấy tờ còn thiếu, nói rõ nộp bản điện tử hay bản chính, ghi thời hạn và nơi nộp. Yêu cầu bổ sung <b>một lần</b>, ghi rõ từng nội dung.", "key") : null,
            h("div", { class: "row" }, ui.btn("Xác nhận " + act.label.toLowerCase(), () => { const t = S.cb.text.trim(); if (t.length < 10) { S.cb.err = true; draw(); return; } S.cb.err = false; thaoTac(x, S.cb.act, t); S.cb.act = null; draw(); }, "pri"), ui.btn("Huỷ", () => { S.cb.act = null; draw(); })),
            S.cb.err ? ui.note("Nội dung quá ngắn (dưới 10 ký tự). Người dân cần biết cụ thể thiếu gì và phải làm gì.", "eve") : null) : null,
          ui.cancu("Nghị định 118/2025/NĐ-CP ngày 09/6/2025, Điều 17, 18, 19, 22, 23", "Tiếp nhận: kiểm tra, số hoá giấy tờ, ký số bản sao chụp, cấp mã hồ sơ. Sai sót, mất mát hồ sơ thuộc trách nhiệm của cơ quan, không đẩy cho người dân (Điều 23).")));
      }
      kids.push(h("div", { class: "row" }, ui.btn("Tải CSV sổ tiếp nhận", () => LAB.csv.download("m6_so_tiep_nhan.csv", ["ma_ho_so", "thu_tuc", "nguoi_nop", "hoc_vien", "ngay_gui", "le_phi_vnd", "da_thanh_toan", "lien_thong", "trang_thai", "so_dong_nhat_ky", "cap_nhat_cuoi"], hs.map(x => [x.ma, x.ten_tt, x.ho_ten, x.hoc_vien, x.ngay_nop, x.phi, x.da_tt ? "Có" : "Không", x.lien_thong ? "Bật" : "Tắt", x.trang_thai, x.nhat_ky.length, x.nhat_ky[x.nhat_ky.length - 1].t])), "sm"),
        ui.btn(S.cb.reset ? "Bấm lần nữa để xoá toàn bộ dữ liệu sàn tập" : "Xoá dữ liệu sàn tập (Làm lại)", () => { if (!S.cb.reset) { S.cb.reset = 1; draw(); setTimeout(() => { S.cb.reset = 0; if (root.isConnected) draw(); }, 4000); return; } S.hoso = hoSoMau(); S.seq = 11; S.cb = { ma: null, act: null, text: "", reset: 0 }; S.maMoi = null; S.xem = null; S.buoc = 1; save(); draw(); }, "sm")),
        ui.note("Ba điểm cổng thật phải có mà sàn tập đã lược bỏ: định danh điện tử và chữ ký số thật; kết nối dữ liệu dân cư, hộ tịch thật để tự điền; thanh toán thật, lưu vết và bảo vệ dữ liệu cá nhân.", "mut"));
      return kids;
    }
    function draw() { body.render(S.vai === "dan" ? veNguoiDan() : veCanBo()); }
    draw();
  } };

/* =====================================================================================
   TAB 3 — Từ nhiều cổng xuống một điểm duy nhất (sơ đồ SVG trước/sau, đếm điểm truy cập và tài khoản)
   ===================================================================================== */
const tabMotCong = {
  id: "motcong", title: "Từ nhiều cổng xuống một điểm duy nhất",
  intro: "Bật công tắc để so sánh cách người dân vào dịch vụ công <b>trước 01/7/2025</b> và <b>sau 01/7/2025 – 01/3/2026</b>: số cổng phải vào, số tài khoản phải nhớ, ai vận hành. Bốn thay đổi phải nhớ và tác động tới cán bộ cấp xã (Nghị định 118/2025/NĐ-CP; bối cảnh tổ chức bộ máy).",
  build(pane) {
    const S = { sau: false, viec: ["xa", "boA", "qg"] };
    const { root, ctrl, view } = ui.sim();
    const VIEC = [{ id: "xa", title: "Thủ tục thuộc chính quyền địa phương", sub: "hộ tịch, cư trú, chứng thực… — trước đây nộp ở cổng cấp tỉnh", cong: "Cổng DVC cấp tỉnh" }, { id: "boA", title: "Thủ tục thuộc bộ, ngành A", sub: "trước đây nộp ở cổng của bộ A", cong: "Cổng DVC bộ A" }, { id: "boB", title: "Thủ tục thuộc bộ, ngành B", sub: "trước đây nộp ở cổng của bộ B", cong: "Cổng DVC bộ B" }, { id: "qg", title: "Thủ tục đã tích hợp trên Cổng quốc gia", sub: "nộp tại dichvucong.gov.vn", cong: "Cổng DVC quốc gia" }];
    ctrl.append(
      h("div", { class: "fld" }, h("label", null, h("b", null, "Thời điểm")), ui.seg({ id: "m6mc-thoidiem", options: [["truoc", "Trước 01/7/2025"], ["sau", "Sau 01/7/2025 – 01/3/2026"]], value: "truoc", onChange: v => { S.sau = v === "sau"; draw(); } })),
      h("div", { class: "fld" }, h("label", null, h("b", null, "Trong năm, người dân cần làm những việc nào?")), ui.tiles({ id: "m6mc-viec", multi: true, cls: "narrow", value: S.viec, items: VIEC.map(v => ({ id: v.id, title: v.title, sub: v.sub, kind: "pt" })), onChange: v => { S.viec = v; draw(); } })),
      ui.presets([{ label: "Người dân làm 4 loại việc", apply: () => { S.viec = VIEC.map(v => v.id); S.sau = false; segSet("truoc"); tilesSet(); draw(); } }, { label: "Chỉ việc của địa phương", apply: () => { S.viec = ["xa"]; S.sau = false; segSet("truoc"); tilesSet(); draw(); } }]),
      ui.btn("Làm lại", () => { S.viec = ["xa", "boA", "qg"]; S.sau = false; segSet("truoc"); tilesSet(); draw(); }, "sm"),
      ui.cancu("Nghị định 118/2025/NĐ-CP ngày 09/6/2025, Điều 26 — Xây dựng Cổng Dịch vụ công quốc gia", "Cổng Dịch vụ công quốc gia là đầu mối cung cấp thông tin thủ tục hành chính của cả nước; cung cấp dịch vụ công trực tuyến của các bộ, ngành, địa phương; hỗ trợ thanh toán phí, lệ phí; theo dõi tình trạng giải quyết hồ sơ."));
    const segSet = v => { const sg = ctrl.querySelector("#m6mc-thoidiem"); if (sg && sg.set) sg.set(v); };
    const tilesSet = () => { const tl = ctrl.querySelector("#m6mc-viec"); if (tl && tl.set) tl.set(S.viec); };
    const out = ui.slot(); view.append(out);
    function soDo() {
      const W = 680, H = 300; const g = svg("svg", { class: "diag", viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Sơ đồ cổng dịch vụ công" });
      const box = (x, y, w, hh, t1, t2, col) => g.append(svg("rect", { x, y, width: w, height: hh, rx: 8, fill: "var(--panel)", stroke: col, "stroke-width": 2 }), svg("text", { x: x + w / 2, y: y + (t2 ? 20 : hh / 2 + 4), "text-anchor": "middle", "font-weight": "700" }, t1), t2 ? svg("text", { x: x + w / 2, y: y + 38, "text-anchor": "middle", class: "lbl" }, t2) : null);
      const line = (x1, y1, x2, y2, col, dash) => g.append(svg("path", { d: "M" + x1 + " " + y1 + " C " + (x1 + 60) + " " + y1 + ", " + (x2 - 60) + " " + y2 + ", " + x2 + " " + y2, fill: "none", stroke: col, "stroke-width": 2, "stroke-dasharray": dash || null }));
      /* người dân */
      g.append(svg("circle", { cx: 60, cy: H / 2, r: 26, fill: "var(--pt-bg)", stroke: "var(--pt)", "stroke-width": 2 }), svg("text", { x: 60, y: H / 2 + 4, "text-anchor": "middle" }, "Dân"), svg("text", { x: 60, y: H / 2 + 46, "text-anchor": "middle", class: "lbl" }, "người dân"));
      const sel = VIEC.filter(v => S.viec.includes(v.id));
      if (!S.sau) {
        const congs = [...new Set(sel.map(v => v.cong))];
        const step = congs.length ? Math.min(70, (H - 40) / congs.length) : 70; const y0 = H / 2 - step * (congs.length - 1) / 2;
        congs.forEach((c, i) => { const y = y0 + i * step - 24; box(300, y, 220, 48, c, "tài khoản riêng · giao diện riêng", c === "Cổng DVC quốc gia" ? "var(--key)" : "var(--eve)"); line(86, H / 2, 300, y + 24, "var(--eve)", "5 4"); g.append(svg("text", { x: 540, y: y + 28, class: "lbl" }, "biểu mẫu khác nhau")); });
        if (!congs.length) g.append(svg("text", { x: 300, y: H / 2, class: "lbl" }, "Chọn ít nhất một loại việc ở cột trái."));
      } else {
        box(250, H / 2 - 36, 230, 72, "Cổng Dịch vụ công quốc gia", "dichvucong.gov.vn · Bộ Công an vận hành", "var(--key)");
        line(86, H / 2, 250, H / 2, "var(--pt)");
        g.append(svg("rect", { x: 118, y: H / 2 - 30, width: 110, height: 22, rx: 11, fill: "var(--pt-bg)", stroke: "var(--pt)" }), svg("text", { x: 173, y: H / 2 - 15, "text-anchor": "middle", "font-size": "11" }, "một danh tính VNeID"));
        const dich = [["Trung tâm PVHCC cấp xã", "var(--aqua)"], ["Trung tâm PVHCC cấp tỉnh", "var(--aqua)"], ["Bộ phận TN&TKQ cấp bộ", "var(--aqua)"]];
        dich.forEach((d, i) => { const y = 40 + i * 90; box(520, y, 150, 44, d[0], "", d[1]); line(480, H / 2, 520, y + 22, "var(--aqua)"); });
        g.append(svg("text", { x: 595, y: H - 8, "text-anchor": "middle", class: "lbl" }, "hồ sơ chảy về Bộ phận Một cửa (Điều 7, 20)"));
      }
      return g;
    }
    function draw() {
      const sel = VIEC.filter(v => S.viec.includes(v.id)); const congs = [...new Set(sel.map(v => v.cong))];
      const diem = S.sau ? (sel.length ? 1 : 0) : congs.length, tk = diem;
      const kids = [ui.title(S.sau ? "Sau 01/7/2025 – 01/3/2026: một điểm một cửa số duy nhất" : "Trước 01/7/2025: nhiều cổng cùng tồn tại, người dân phải tự tìm"),
        ui.readouts([{ k: "Loại việc trong năm", v: String(sel.length), kind: "pt" }, { k: "Điểm truy cập phải vào", v: String(diem), kind: diem > 1 ? "eve" : "ok", big: true }, { k: "Tài khoản phải nhớ", v: String(tk), kind: tk > 1 ? "eve" : "ok", big: true }, { k: "Đơn vị vận hành cổng", v: S.sau ? "Bộ Công an" : "Nhiều cơ quan", kind: "aqua" }]),
        soDo(),
        S.sau ? ui.note("<b>Sau 01/7/2025</b> không duy trì Cổng Dịch vụ công cấp tỉnh; <b>sau 01/3/2026</b> không duy trì Cổng cấp bộ. 100 % dịch vụ công trực tuyến tích hợp lên Cổng quốc gia; đăng nhập bằng một danh tính điện tử (VNeID); Bộ Công an chủ trì vận hành, bảo đảm kỹ thuật, an ninh mạng (NĐ 310/2026/NĐ-CP).", "ok")
          : ui.note("Cổng quốc gia, cổng cấp bộ và cổng cấp tỉnh cùng tồn tại: người dân phải tự tìm đúng cổng, nhớ nhiều tài khoản, gặp nhiều kiểu biểu mẫu. Số tài khoản ở đây là mô phỏng theo giả định mỗi cổng một tài khoản.", "eve"),
        ui.panel("Bốn thay đổi phải nhớ", ui.steps([
          { t: "<b>Tổ chức chính quyền</b> — từ 01/7/2025 vận hành chính quyền địa phương 2 cấp: tỉnh và xã; cấp huyện chấm dứt hoạt động.", hi: S.sau },
          { t: "<b>Cổng dịch vụ công</b> — từ 01/7/2025 không duy trì Cổng DVC cấp tỉnh; từ 01/3/2026 không duy trì Cổng DVC cấp bộ.", hi: S.sau },
          { t: "<b>Một cửa số duy nhất</b> — Cổng Dịch vụ công quốc gia là điểm một cửa số tập trung, duy nhất.", hi: S.sau },
          { t: "<b>Tích hợp toàn bộ</b> — 100 % dịch vụ công trực tuyến của bộ, ngành, địa phương tích hợp lên Cổng quốc gia.", hi: S.sau }])),
        ui.panel("Tác động tới cán bộ cấp xã",
          ui.bar({ label: "Nhiệm vụ, quyền hạn cấp xã tiếp nhận (Kết luận 160-KL/TW)", value: 1060, max: 1248, kind: "aqua", text: "1.060 / 1.248 — " + LAB.pc(100 * 1060 / 1248) }),
          ui.note("Theo Kết luận 160-KL/TW của Bộ Chính trị, trong 1.248 nhiệm vụ, quyền hạn phân cấp, phân quyền về địa phương, <b>cấp xã tiếp nhận 1.060 nhiệm vụ, quyền hạn</b> (hộ tịch, đất đai, tài chính, giáo dục, y tế, xây dựng, an sinh xã hội…). <b>Lưu ý cách nói</b>: đây là \"nhiệm vụ, quyền hạn\", không phải \"thủ tục hành chính\".", "key"),
          ui.table(["Ba sức ép mới", "Ba điểm tựa"], [["Nắm phạm vi nghiệp vụ rộng hơn hẳn", "Quy trình chuẩn hoá thống nhất trên một cổng duy nhất"], ["Thao tác thành thạo trên hệ thống thay vì sổ giấy", "Dữ liệu dùng chung giúp giảm nhập lại thông tin"], ["Chịu trách nhiệm cá nhân khi ký số bản sao chụp", "Nhật ký xử lý ghi lại mọi thao tác, bảo vệ cán bộ làm đúng"]], { cls: "wrap" }),
          h("div", { class: "small" }, "Bộ phận Một cửa theo Điều 7 NĐ 118/2025: cấp bộ là Bộ phận Tiếp nhận và Trả kết quả; cấp tỉnh và cấp xã là Trung tâm Phục vụ hành chính công cùng cấp; tiếp nhận không phụ thuộc địa giới hành chính (Điều 20)."))];
      out.render(kids);
    }
    draw(); pane.appendChild(root);
  } };

/* =====================================================================================
   TAB 4 — Hành trình người dân năm chặng, bảy điểm nghẽn và thước đo ngôn ngữ dễ hiểu
   ===================================================================================== */
const CHANG = [["Biết", "Người dân biết mình cần làm thủ tục gì và làm ở đâu"], ["Tìm", "Tìm đúng thủ tục trên cổng, đọc hiểu yêu cầu hồ sơ"], ["Chuẩn bị", "Gom đủ giấy tờ, chụp ảnh, có tài khoản định danh điện tử"], ["Nộp", "Kê khai, đính kèm, nộp phí và bấm gửi hồ sơ"], ["Chờ và nhận", "Theo dõi tiến độ, nhận kết quả điện tử đã ký số"]];
/* [điểm nghẽn, chặng (1-5), cách xử lý đúng theo bảng slide, ba cách làm sai thường gặp] */
const NGHEN = [
  ["Không tìm thấy thủ tục", 2, "Đặt tên theo cách dân hay gọi, có tìm kiếm gợi ý", ["Đăng toàn văn quyết định công bố thủ tục lên cổng", "Giữ nguyên tên pháp lý để bảo đảm chính xác", "Yêu cầu người dân gọi tổng đài để được chỉ tên thủ tục"]],
  ["Không có tài khoản", 3, "Hỗ trợ đăng ký ngay tại Bộ phận Một cửa", ["Yêu cầu người dân tự đăng ký ở nhà rồi quay lại", "Chuyển sang nhận hồ sơ giấy, không tạo tài khoản", "Tạm dừng nhận hồ sơ của người chưa có tài khoản"]],
  ["Không rõ nộp giấy gì", 3, "Liệt kê hồ sơ kèm ảnh mẫu từng loại giấy tờ", ["Ghi \"thành phần hồ sơ theo quy định hiện hành\"", "Để cán bộ gọi điện hướng dẫn từng người", "Yêu cầu nộp mọi giấy tờ có thể liên quan cho chắc"]],
  ["Ảnh chụp quá nặng", 4, "Hướng dẫn chụp đúng cách, cho chụp bằng điện thoại", ["Bắt buộc dùng máy quét tại quầy", "Yêu cầu người dân ra tiệm quét ảnh", "Từ chối hồ sơ khi tệp vượt dung lượng"]],
  ["Không nộp được phí", 4, "Mở nhiều cách trả tiền, cho nộp tại quầy khi cần", ["Chỉ nhận chuyển khoản ngân hàng", "Cho nợ phí, thu khi trả kết quả", "Thu thêm phí dịch vụ để hỗ trợ thanh toán"]],
  ["Không biết hồ sơ ở đâu", 5, "Gửi thông báo mỗi lần hồ sơ đổi trạng thái", ["Người dân gọi điện hỏi cán bộ phụ trách", "Dán bảng thông báo tại trụ sở", "Hẹn người dân đến đúng ngày trả kết quả"]],
  ["Bị trả lại nhiều lần", 5, "Yêu cầu bổ sung một lần, ghi rõ từng nội dung", ["Phát hiện thiếu gì thì yêu cầu bổ sung ngay lúc đó", "Từ chối hồ sơ ngay lần đầu có sai sót", "Ghi \"hồ sơ chưa hợp lệ, đề nghị bổ sung theo quy định\""]],
];
const TU_KHO = [["chủ thể nộp hồ sơ", "anh/chị"], ["tổ chức, cá nhân", "anh/chị"], ["thực hiện đính kèm", "tải lên"], ["tài liệu số hoá", "ảnh chụp giấy tờ"], ["thực hiện nộp", "nộp"], ["chưa hợp lệ", "còn thiếu … (nêu rõ thiếu gì)"], ["theo quy định hiện hành", "nêu rõ tên giấy tờ, số lượng"], ["theo quy định", "ghi rõ quy định gì hoặc bỏ"], ["để biết thêm chi tiết", "ghi ngay số điện thoại và việc cần làm"], ["đề nghị bổ sung", "ghi rõ: bổ sung giấy gì, nộp ở đâu, trước ngày nào"]];
const VD_KHO = "Chủ thể nộp hồ sơ thực hiện đính kèm tài liệu số hoá theo quy định hiện hành và thực hiện nộp phí, lệ phí theo quy định; trường hợp hồ sơ chưa hợp lệ, hồ sơ sẽ được yêu cầu bổ sung theo quy định của NĐ 118/2025/NĐ-CP, tổ chức, cá nhân liên hệ Bộ phận Một cửa UBND để biết thêm chi tiết về TTHC và các thành phần hồ sơ cần thiết phải được cung cấp.";
const VD_DE = "Để đăng ký khai sinh cho con, anh/chị làm 3 bước:\n1. Chụp ảnh giấy chứng sinh bằng điện thoại.\n2. Vào Cổng Dịch vụ công quốc gia, chọn \"Đăng ký khai sinh\", tải ảnh lên ở bước 3.\n3. Bấm gửi. Không thu lệ phí. Kết quả có trong 1 ngày làm việc, gửi về tài khoản của anh/chị.";
function phanTichVanBan(text) {
  const cau = text.split(/(?<=[.!?;])\s+|\n+/).map(s => s.trim()).filter(s => s.length > 1);
  const tu = s => s.split(/\s+/).filter(Boolean);
  const dai = cau.filter(s => tu(s).length > 30);
  const abbr = [...new Set(text.match(/\b[A-ZĐ]{2,6}\b/g) || [])].filter(a => !new RegExp(a + "\\s*\\(|\\(\\s*" + a + "\\s*\\)").test(text));
  const biDong = cau.filter(s => /\b(được|bị|sẽ được)\s+(thực hiện|xem xét|tiếp nhận|xử lý|giải quyết|yêu cầu|trả|từ chối|gửi|cấp|nộp|đính kèm|cung cấp|bổ sung)/i.test(s));
  const low = text.toLowerCase();
  const kho = TU_KHO.filter(([k]) => low.includes(k));
  const quyTac = [["Viết theo thứ tự việc phải làm, đánh số từng bước", /(^|\n)\s*(bước\s*)?\d+[.):]/i.test(text)], ["Nói rõ cần mang gì / chuẩn bị gì", /(mang theo|cần có|chuẩn bị|chụp ảnh|giấy|ảnh)/i.test(text)], ["Nói rõ mất bao lâu", /(\d+\s*(ngày|giờ|phút)|trong ngày)/i.test(text)], ["Nói rõ hết bao nhiêu tiền", /(\d[\d.]*\s*(đ\b|đồng)|không thu|miễn phí)/i.test(text)]];
  const diem = Math.max(0, Math.min(100, 100 - 15 * dai.length - 6 * abbr.length - 8 * biDong.length - 6 * kho.length - 5 * quyTac.filter(q => !q[1]).length));
  return { cau, dai, abbr, biDong, kho, quyTac, diem, soTu: tu(text).length };
}
const tabHanhTrinh = {
  id: "hanhtrinh", title: "Hành trình người dân và bảy điểm nghẽn",
  intro: "Bản đồ hành trình <b>năm chặng</b> của người dân với <b>bảy điểm nghẽn</b> gắn vào từng chặng (slide \"Bảy điểm nghẽn và cách xử lý\"). Chọn biện pháp xử lý cho từng điểm nghẽn rồi chấm điểm; dùng thước đo <b>ngôn ngữ dễ hiểu</b> để soát một đoạn hướng dẫn của đơn vị (quy tắc đơn giản, không dùng trí tuệ nhân tạo).",
  build(pane) {
    const KEY = "m6.hanhtrinh";
    const S = Object.assign({ hocvien: "", chon: {}, cham: false, chang1: "", text: VD_KHO }, LAB.store.get(KEY, {}));
    const save = () => LAB.store.set(KEY, { hocvien: S.hocvien, chon: S.chon, cham: S.cham, chang1: S.chang1, text: S.text });
    const { root, ctrl, view } = ui.sim();
    /* xáo trộn phương án theo mầm cố định để đáp án không luôn đứng đầu */
    const OPTS = NGHEN.map((n, i) => { const r = LAB.rng(60 + i); const a = [n[2], ...n[3]].map((t, j) => ({ t, dung: j === 0 })); for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(r() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; });
    ctrl.append(
      ui.field({ id: "m6ht-hv", label: "Họ tên học viên", value: S.hocvien, onInput: v => { S.hocvien = v; save(); } }),
      ui.field({ id: "m6ht-c1", label: "Điểm nghẽn ở chặng 1 (Biết) tại đơn vị anh/chị", type: "textarea", value: S.chang1, placeholder: "Bảng slide chưa gắn điểm nghẽn cho chặng này — anh/chị tự bổ sung từ thực tế", onInput: v => { S.chang1 = v; save(); } }),
      ui.presets([{ label: "Điền đáp án mẫu (giảng viên)", apply: () => { NGHEN.forEach((n, i) => { S.chon[i] = OPTS[i].findIndex(o => o.dung); }); S.cham = true; save(); draw(); } }, { label: "Ví dụ: đoạn hướng dẫn khó hiểu", apply: () => { S.text = VD_KHO; save(); draw(); } }, { label: "Ví dụ: đã viết lại dễ hiểu", apply: () => { S.text = VD_DE; save(); draw(); } }]),
      h("div", { class: "row" }, ui.btn("Chấm điểm", () => { S.cham = true; save(); draw(); }, "pri"), ui.btn("Làm lại", () => { S.chon = {}; S.cham = false; save(); draw(); }), ui.btn("Tải CSV", xuat, "sm")),
      ui.cancu("Nghị định 45/2020/NĐ-CP ngày 08/4/2020 của Chính phủ, Điều 4; Nghị định 118/2025/NĐ-CP, khoản 1 Điều 4", "Lấy sự hài lòng của tổ chức, cá nhân là thước đo chất lượng và hiệu quả phục vụ. Hướng dẫn tốt là hướng dẫn mà người chưa từng làm vẫn làm được."));
    const out = ui.slot(); const out2 = ui.slot(); view.append(out, out2);
    function xuat() {
      const rows = NGHEN.map((n, i) => { const c = S.chon[i]; const o = c != null ? OPTS[i][c] : null; return [S.hocvien, "Chặng " + n[1] + " — " + CHANG[n[1] - 1][0], n[0], o ? o.t : "", n[2], o ? (o.dung ? "Đúng" : "Sai") : "Chưa chọn"]; });
      rows.push([S.hocvien, "Chặng 1 — Biết", "Điểm nghẽn tự bổ sung", S.chang1, "", ""]);
      const p = phanTichVanBan(S.text); rows.push([S.hocvien, "Ngôn ngữ dễ hiểu", "Điểm " + p.diem + "/100", "câu dài " + p.dai.length + "; viết tắt " + p.abbr.length + "; bị động " + p.biDong.length + "; từ khó " + p.kho.length, S.text.replace(/\s+/g, " "), ""]);
      LAB.csv.download("m6_hanh_trinh_diem_nghen.csv", ["hoc_vien", "chang", "diem_nghen", "bien_phap_da_chon", "dap_an", "ket_qua"], rows);
    }
    function draw() {
      let dung = 0, daChon = 0; NGHEN.forEach((n, i) => { const c = S.chon[i]; if (c != null) { daChon++; if (OPTS[i][c].dung) dung++; } });
      const map = h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "8px" } }, CHANG.map((c, i) => h("div", { class: "tile", style: { cursor: "default" } }, h("b", null, "Chặng " + (i + 1) + " — " + c[0]), h("span", null, c[1]), h("div", { class: "row", style: { marginTop: "4px" } }, NGHEN.filter(n => n[1] === i + 1).map((n, j) => { const idx = NGHEN.indexOf(n); const c2 = S.chon[idx]; return ui.tag(n[0], S.cham && c2 != null ? (OPTS[idx][c2].dung ? "ok" : "eve") : "eve"); }), i === 0 ? ui.tag(S.chang1 ? "điểm nghẽn tự bổ sung" : "chưa gắn điểm nghẽn", S.chang1 ? "key" : "mut") : null))));
      const cauHoi = NGHEN.map((n, i) => { const c = S.chon[i]; const o = c != null ? OPTS[i][c] : null; return h("div", { class: "panel stack" },
        h("div", { class: "row" }, ui.tag("Chặng " + n[1] + " · " + CHANG[n[1] - 1][0], "pt"), h("b", null, n[0])),
        ui.select({ id: "m6ht-q" + i, label: "Cách xử lý", options: [["", "— chọn biện pháp —"], ...OPTS[i].map((o2, j) => [String(j), o2.t])], value: c != null ? String(c) : "", onChange: v => { if (v === "") delete S.chon[i]; else S.chon[i] = +v; S.cham = false; save(); draw(); } }),
        S.cham && o ? (o.dung ? ui.note("<b>Đúng.</b> Mỗi điểm nghẽn là một chỗ người dân bỏ cuộc và quay lại nộp hồ sơ giấy; cách xử lý này giữ họ lại trên môi trường mạng.", "ok") : noteText("eve", h("b", null, "Chưa đúng. "), "Cách xử lý theo bảng slide: " + n[2] + ". Phương án đã chọn đẩy gánh nặng về phía người dân hoặc tạo thêm rào cản mới.")) : null); });
      out.render(ui.title("Bản đồ hành trình năm chặng", "mỗi điểm nghẽn là một chỗ người dân bỏ cuộc"), map,
        h("div", { class: "row" }, ui.score(dung, "đúng / 7", 7), h("div", { class: "small" }, S.cham ? "Đã chấm " + daChon + "/7 điểm nghẽn. Bảng này dùng làm phiếu tự kiểm cho cổng dịch vụ công của đơn vị." : "Chọn biện pháp cho cả bảy điểm nghẽn rồi bấm Chấm điểm.")),
        h("div", { class: "cols" }, cauHoi));
      /* thước đo ngôn ngữ dễ hiểu */
      const p = phanTichVanBan(S.text);
      const goiY = [];
      p.dai.forEach(s => goiY.push("Câu dài " + s.split(/\s+/).length + " từ: tách thành 2–3 câu, mỗi câu một ý, không quá hai dòng. (\"" + s.slice(0, 60) + "…\")"));
      if (p.abbr.length) goiY.push("Từ viết tắt chưa giải thích: " + p.abbr.join(", ") + " → viết đầy đủ lần đầu, ví dụ \"Uỷ ban nhân dân (UBND)\".");
      p.biDong.forEach(s => goiY.push("Câu bị động \"" + s.slice(0, 50) + "…\": nói rõ ai làm gì, ví dụ \"Cán bộ sẽ gửi yêu cầu bổ sung cho anh/chị\"."));
      p.kho.forEach(([k, v]) => goiY.push("\"" + k + "\" → \"" + v + "\"."));
      p.quyTac.filter(q => !q[1]).forEach(q => goiY.push("Thiếu quy tắc: " + q[0] + "."));
      out2.render(ui.panel("Thước đo ngôn ngữ dễ hiểu",
        ui.field({ id: "m6ht-text", label: "Dán một đoạn hướng dẫn của đơn vị", type: "textarea", rows: 5, value: S.text, onInput: v => { S.text = v; save(); draw2(); } }),
        ui.slot("m6ht-kq")));
      draw2();
      function draw2() {
        const q = phanTichVanBan(S.text); const slot = out2.querySelector(".m6ht-kq"); if (!slot) return;
        const gy = [];
        q.dai.forEach(s => gy.push("Câu dài " + s.split(/\s+/).length + " từ — tách thành 2–3 câu, mỗi câu một ý (\"" + s.slice(0, 60) + "…\")."));
        if (q.abbr.length) gy.push("Từ viết tắt chưa giải thích: " + q.abbr.join(", ") + " — viết đầy đủ lần đầu, ví dụ \"Uỷ ban nhân dân (UBND)\".");
        q.biDong.forEach(s => gy.push("Câu bị động \"" + s.slice(0, 50) + "…\" — nói rõ ai làm gì: \"Cán bộ sẽ gửi yêu cầu bổ sung cho anh/chị\"."));
        q.kho.forEach(([k, v]) => gy.push("Thay \"" + k + "\" bằng \"" + v + "\"."));
        q.quyTac.filter(r => !r[1]).forEach(r => gy.push("Thiếu quy tắc: " + r[0] + "."));
        const sc = ui.score(q.diem, "dễ hiểu", 100); sc.classList.add(q.diem >= 80 ? "ok" : q.diem >= 50 ? "" : "eve");
        slot.render(h("div", { class: "row" }, sc, ui.readouts([{ k: "Số câu / số từ", v: q.cau.length + " / " + q.soTu, kind: "pt" }, { k: "Câu dài > 30 từ", v: String(q.dai.length), kind: q.dai.length ? "eve" : "ok" }, { k: "Viết tắt chưa giải thích", v: String(q.abbr.length), kind: q.abbr.length ? "eve" : "ok" }, { k: "Câu bị động", v: String(q.biDong.length), kind: q.biDong.length ? "eve" : "ok" }, { k: "Từ chuyên môn", v: String(q.kho.length), kind: q.kho.length ? "eve" : "ok" }])),
          h("div", { class: "row" }, q.quyTac.map(r => ui.tag((r[1] ? "✓ " : "✗ ") + r[0], r[1] ? "ok" : "mut"))),
          gy.length ? h("div", null, h("b", null, "Gợi ý viết lại (" + gy.length + "):"), h("ul", { class: "small", style: { margin: "4px 0 0", paddingLeft: "18px" } }, gy.map(t => h("li", null, t)))) : ui.note("Không phát hiện lỗi theo các quy tắc đơn giản. Hãy đọc to cho một người chưa từng làm thủ tục nghe thử.", "ok"),
          h("div", { class: "small" }, "Quy tắc đếm đơn giản (câu > 30 từ, chữ in hoa 2–6 ký tự chưa có ngoặc giải thích, \"được/bị + động từ\", từ chuyên môn trong danh sách) — chỉ gợi ý, không thay người viết. Ví dụ trên slide: \"Chủ thể nộp hồ sơ thực hiện đính kèm tài liệu số hoá\" → \"Anh/chị chụp ảnh giấy tờ rồi tải lên ở bước 3\"."));
      }
    }
    draw(); pane.appendChild(root);
  } };

/* =====================================================================================
   TAB 5 — Phân tích sổ hồ sơ Phường Mẫu (LAB.data.ho_so, 1.500 hồ sơ 01/2025–09/2026)
   ===================================================================================== */
const tabSoHoSo = {
  id: "sohoso", title: "Phân tích sổ hồ sơ Phường Mẫu",
  intro: "Khai thác sổ hồ sơ thủ tục hành chính của UBND Phường Mẫu (1.500 hồ sơ giả lập, 01/2025–09/2026): lọc theo lĩnh vực, thủ tục, quý, kênh; đọc tám chỉ số; đối chiếu chỉ tiêu Quyết định 1266/QĐ-TTg và Nghị quyết 71/NQ-CP; nhận xét tự động.",
  build(pane) {
    const rows = LAB.data.ho_so || [];
    const S = { lv: "Tất cả", tt: "Tất cả", quy: "Tất cả", kenh: "Tất cả", tuoi: "Tất cả" };
    const { root, ctrl, view } = ui.sim();
    const lvs = ["Tất cả", ...LAB.stat.uniq(rows, "linh_vuc").sort()], quys = ["Tất cả", ...LAB.stat.uniq(rows, r => LAB.date.quy(r.ngay_nop)).sort()], kenhs = ["Tất cả", "Trực tuyến", "Trực tiếp", "Bưu chính"], tuois = ["Tất cả", ...LAB.stat.uniq(rows, "nhom_tuoi_nguoi_nop").sort()];
    const ttSlot = ui.slot();
    const veTT = () => { const src = S.lv === "Tất cả" ? rows : rows.filter(r => r.linh_vuc === S.lv); const tts = ["Tất cả", ...LAB.stat.uniq(src, "thu_tuc").sort()]; if (!tts.includes(S.tt)) S.tt = "Tất cả"; ttSlot.render(ui.select({ id: "m6sh-tt", label: "Thủ tục", options: tts.map(x => [x, x]), value: S.tt, onChange: v => { S.tt = v; draw(); } })); };
    const selLv = ui.select({ id: "m6sh-lv", label: "Lĩnh vực", options: lvs.map(x => [x, x]), value: S.lv, onChange: v => { S.lv = v; veTT(); draw(); } });
    const selQ = ui.select({ id: "m6sh-quy", label: "Quý nộp", options: quys.map(x => [x, x]), value: S.quy, onChange: v => { S.quy = v; draw(); } });
    const selK = ui.select({ id: "m6sh-kenh", label: "Kênh nộp", options: kenhs.map(x => [x, x]), value: S.kenh, onChange: v => { S.kenh = v; draw(); } });
    const selT = ui.select({ id: "m6sh-tuoi", label: "Nhóm tuổi người nộp", options: tuois.map(x => [x, x]), value: S.tuoi, onChange: v => { S.tuoi = v; draw(); } });
    veTT();
    const reset = () => { S.lv = S.tt = S.quy = S.kenh = S.tuoi = "Tất cả"; selLv.input.value = selQ.input.value = selK.input.value = selT.input.value = "Tất cả"; veTT(); draw(); };
    ctrl.append(selLv, ttSlot, selQ, selK, selT,
      ui.presets([{ label: "Chứng thực (nhiều thủ tục một phần)", apply: () => { reset(); S.lv = "Chứng thực"; selLv.input.value = S.lv; veTT(); draw(); } }, { label: "Người trên 60 tuổi", apply: () => { reset(); S.tuoi = "Trên 60"; selT.input.value = S.tuoi; draw(); } }, { label: "Quý gần nhất", apply: () => { reset(); S.quy = quys[quys.length - 1]; selQ.input.value = S.quy; draw(); } }]),
      h("div", { class: "row" }, ui.btn("Làm lại", reset), ui.btn("Tải CSV kết quả lọc", () => { const sel = loc(); LAB.csv.download("m6_so_ho_so_loc.csv", LAB.dataHeaders("ho_so"), sel); }, "sm")),
      ui.cancu("Quyết định 1266/QĐ-TTg ngày 14/7/2026 — Chiến lược quốc gia về chuyển đổi số 2026–2030; Nghị quyết 71/NQ-CP ngày 01/4/2025", "Đến 2030: 100 % hồ sơ, kết quả giải quyết thủ tục hành chính được số hoá; 99 % người dân, doanh nghiệp hài lòng khi dùng dịch vụ công trực tuyến; dịch vụ công trực tuyến toàn trình đạt 90 %."));
    const loc = () => rows.filter(r => (S.lv === "Tất cả" || r.linh_vuc === S.lv) && (S.tt === "Tất cả" || r.thu_tuc === S.tt) && (S.quy === "Tất cả" || LAB.date.quy(r.ngay_nop) === S.quy) && (S.kenh === "Tất cả" || r.kenh_nop === S.kenh) && (S.tuoi === "Tất cả" || r.nhom_tuoi_nguoi_nop === S.tuoi));
    const out = ui.slot(); const boxQ = chart.box(b => chart.bars(b, S.chartQ)); const boxLv = chart.box(b => chart.bars(b, S.chartLv)); const out2 = ui.slot();
    view.append(out, h("div", { class: "cols" }, boxQ, boxLv), out2);
    const pct = (a, pred) => a.length ? 100 * LAB.stat.rate(a, pred) : NaN;
    const chiSo = a => { const xong = a.filter(r => r.dung_han !== ""), thu = a.filter(r => r.thanh_toan_truc_tuyen !== "Không thu"), hl = a.map(r => +r.hai_long_1_5).filter(v => v >= 1); return { n: a.length, tt: pct(a, r => r.kenh_nop === "Trực tuyến"), toan: pct(a, r => r.muc_do_dvctt === "Toàn trình"), dung: pct(xong, r => r.dung_han === "Có"), tre: pct(xong, r => r.dung_han === "Không"), bs: pct(a, r => +r.so_lan_bo_sung > 0), ttt: pct(thu, r => r.thanh_toan_truc_tuyen === "Có"), nThu: thu.length, sh: pct(a, r => r.ket_qua_so_hoa === "Có"), hl: LAB.stat.mean(hl), hlOk: hl.length ? 100 * hl.filter(v => v >= 4).length / hl.length : NaN, nHl: hl.length, tc: pct(a, r => r.trang_thai === "Từ chối") }; };
    function draw() {
      const sel = loc(); const c = chiSo(sel);
      if (!sel.length) { out.render(ui.note("Không có hồ sơ nào khớp bộ lọc. Hãy nới bớt điều kiện.", "eve")); out2.render(); S.chartQ = { labels: ["—"], series: [{ name: "", color: "pt", values: [0] }] }; S.chartLv = S.chartQ; boxQ.draw(); boxLv.draw(); return; }
      const byQ = LAB.stat.groupBy(sel, r => LAB.date.quy(r.ngay_nop)); const labels = [...byQ.keys()].sort();
      S.chartQ = { title: "Theo quý: tỉ lệ nộp trực tuyến và tỉ lệ đúng hạn", labels: labels.map(q => q.replace("20", "")), series: [{ name: "Trực tuyến", color: "pt", values: labels.map(q => chiSo(byQ.get(q)).tt) }, { name: "Đúng hạn", color: "ok", values: labels.map(q => chiSo(byQ.get(q)).dung) }], ymax: 100, fmtY: v => v + " %", fmtTip: v => LAB.pc(v), intY: false };
      const byLv = LAB.stat.groupBy(sel, "linh_vuc"); const lvl = [...byLv.keys()].sort((a, b) => byLv.get(b).length - byLv.get(a).length);
      S.chartLv = { title: "Theo lĩnh vực: tỉ lệ nộp trực tuyến (số hồ sơ trong chú giải)", labels: lvl.map(l => l.replace("An sinh xã hội", "An sinh")), series: [{ name: "Trực tuyến", color: "pt", values: lvl.map(l => chiSo(byLv.get(l)).tt), colors: lvl.map(l => chiSo(byLv.get(l)).tt >= 50 ? "pt" : "eve") }], ymax: 100, fmtY: v => v + " %", fmtTip: (v, i) => LAB.pc(v) + " · " + byLv.get(lvl[i]).length + " hồ sơ", intY: false };
      out.render(ui.readouts([{ k: "Tổng hồ sơ", v: LAB.num(c.n), kind: "pt", big: true }, { k: "Tỉ lệ nộp trực tuyến", v: LAB.pc(c.tt), kind: "pt" }, { k: "Tỉ lệ toàn trình", v: LAB.pc(c.toan), kind: c.toan >= 90 ? "ok" : "key" }, { k: "Tỉ lệ đúng hạn", v: LAB.pc(c.dung), kind: c.dung >= 95 ? "ok" : "eve" }, { k: "Tỉ lệ phải bổ sung", v: LAB.pc(c.bs), kind: c.bs > 15 ? "eve" : "ok" }, { k: "Thanh toán trực tuyến (trong " + LAB.num(c.nThu) + " hồ sơ có thu)", v: LAB.pc(c.ttt), kind: "aqua" }, { k: "Kết quả được số hoá", v: LAB.pc(c.sh), kind: c.sh >= 100 ? "ok" : "key" }, { k: "Hài lòng trung bình (" + LAB.num(c.nHl) + " đánh giá)", v: isFinite(c.hl) ? LAB.num(c.hl, 2) + " / 5" : "—", kind: c.hl >= 4 ? "ok" : "eve" }]));
      boxQ.draw(); boxLv.draw();
      /* bảng thủ tục xếp theo tỉ lệ trễ hạn */
      const byTt = LAB.stat.groupBy(sel, "thu_tuc"); const ttRows = [...byTt.keys()].map(t => { const k = chiSo(byTt.get(t)); const d = byTt.get(t)[0]; return { t, lv: d.linh_vuc, md: d.muc_do_dvctt, k }; }).sort((a, b) => (b.k.tre || 0) - (a.k.tre || 0));
      const table = ui.table(["Thủ tục", "Lĩnh vực", "Mức độ", "Hồ sơ", "Trực tuyến", "Trễ hạn", "Bổ sung", "Từ chối", "Hài lòng"], ttRows.map(x => [x.t, x.lv, tagMucDo(x.md), { text: LAB.num(x.k.n), cls: "r" }, { text: LAB.pc(x.k.tt), cls: "r" }, { text: LAB.pc(x.k.tre), cls: "r" }, { text: LAB.pc(x.k.bs), cls: "r" }, { text: LAB.pc(x.k.tc), cls: "r" }, { text: isFinite(x.k.hl) ? LAB.num(x.k.hl, 2) : "—", cls: "r" }]), { cls: "tight", rowCls: (r, i) => ttRows[i].k.tre > 15 ? "bad" : (ttRows[i].k.tre === 0 ? "good" : null) });
      /* nhận xét tự động */
      const nx = [];
      const byTuoi = LAB.stat.groupBy(sel, "nhom_tuoi_nguoi_nop"); const gia = byTuoi.get("Trên 60");
      if (gia && gia.length >= 10) { const r60 = chiSo(gia).tt; if (r60 < c.tt - 10) nx.push(["eve", "Nhóm tuổi trên 60 nộp trực tuyến " + LAB.pc(r60) + ", thấp hơn mức chung " + LAB.pc(c.tt) + " → cần người hướng dẫn tại điểm tiếp nhận của cấp xã, giữ kênh trực tiếp và bưu chính, cho người thân nộp thay theo quy định về uỷ quyền."]); else nx.push(["ok", "Nhóm tuổi trên 60 nộp trực tuyến " + LAB.pc(r60) + ", không chênh đáng kể so với mức chung."]); }
      const tre = ttRows.filter(x => x.k.n >= 10 && x.k.tre > 15); if (tre.length) nx.push(["eve", "Thủ tục trễ hạn trên 15 %: " + tre.map(x => x.t + " (" + LAB.pc(x.k.tre) + ")").join("; ") + " → rà soát khâu thẩm định, phối hợp liên thông (Điều 19 NĐ 118/2025); nhật ký xử lý cho biết khâu nào nghẽn."]);
      const mp = ttRows.filter(x => x.md === "Một phần"); if (mp.length) nx.push(["key", mp.length + " thủ tục còn ở mức một phần chiếm " + LAB.pc(100 - c.toan) + " số hồ sơ; chỉ tiêu Nghị quyết 71/NQ-CP là 90 % toàn trình vào 2030 → ưu tiên gỡ rào cản cho thủ tục có nhiều hồ sơ nhất: " + mp.sort((a, b) => b.k.n - a.k.n)[0].t + "."]);
      if (c.nThu >= 10) nx.push([c.ttt < 60 ? "eve" : "ok", "Trong số hồ sơ có thu phí, " + LAB.pc(c.ttt) + " thanh toán trực tuyến" + (c.ttt < 60 ? " → mở thêm cách trả tiền, hướng dẫn tại quầy; thanh toán trực tuyến là điều kiện bắt buộc của toàn trình." : ".")]);
      if (c.bs > 15) nx.push(["eve", LAB.pc(c.bs) + " hồ sơ phải bổ sung → liệt kê thành phần hồ sơ kèm ảnh mẫu, cảnh báo thiếu ngay lúc nộp, yêu cầu bổ sung một lần ghi rõ từng nội dung."]);
      const online = sel.filter(r => r.kenh_nop === "Trực tuyến"), offline = sel.filter(r => r.kenh_nop !== "Trực tuyến");
      if (online.length >= 10 && offline.length >= 10) { const a = chiSo(online).hl, b = chiSo(offline).hl; if (isFinite(a) && isFinite(b)) nx.push([a >= b ? "ok" : "eve", "Hài lòng trung bình: nộp trực tuyến " + LAB.num(a, 2) + " so với kênh khác " + LAB.num(b, 2) + (a >= b ? " — trực tuyến đang được người dân đánh giá tốt hơn." : " → trải nghiệm trực tuyến đang kém hơn tại quầy; rà soát bảy điểm nghẽn.")]); }
      out2.render(ui.panel("Thủ tục xếp theo tỉ lệ trễ hạn", table, h("div", { class: "small" }, "Trễ hạn và đúng hạn tính trên hồ sơ đã có kết quả; hài lòng tính trên hồ sơ có đánh giá (thang 1–5).")),
        ui.panel("Đối chiếu chỉ tiêu quốc gia",
          ui.bar({ label: "Kết quả số hoá — chỉ tiêu QĐ 1266/QĐ-TTg: 100 % (2030)", value: c.sh, max: 100, kind: c.sh >= 100 ? "ok" : "key", text: LAB.pc(c.sh) }),
          ui.bar({ label: "Hài lòng (đánh giá 4–5 điểm) — chỉ tiêu QĐ 1266/QĐ-TTg: 99 % (2030)", value: c.hlOk, max: 100, kind: c.hlOk >= 99 ? "ok" : "key", text: LAB.pc(c.hlOk) }),
          ui.bar({ label: "Hồ sơ thuộc thủ tục toàn trình — chỉ tiêu NQ 71/NQ-CP: 90 % (2030)", value: c.toan, max: 100, kind: c.toan >= 90 ? "ok" : "key", text: LAB.pc(c.toan) }),
          h("div", { class: "small" }, "Khoảng cách tới chỉ tiêu: số hoá còn " + LAB.pc(Math.max(0, 100 - c.sh)) + "; hài lòng còn " + LAB.pc(Math.max(0, 99 - c.hlOk)) + "; toàn trình còn " + LAB.pc(Math.max(0, 90 - c.toan)) + ". Chỉ tiêu quốc gia tính trên thủ tục/hồ sơ cả nước; số ở đây là của Phường Mẫu (giả lập) để tập đọc.")),
        ui.panel("Nhận xét tự động", ...(nx.length ? nx.map(x => noteText(x[0], x[1])) : [ui.note("Chưa đủ dữ liệu để nhận xét (mỗi nhóm cần ít nhất 10 hồ sơ).", "mut")])));
    }
    draw(); pane.appendChild(root);
  } };

LAB.module({ id: "m6", tabs: [tabToanTrinh, tabSanTap, tabMotCong, tabHanhTrinh, tabSoHoSo] });
})();
