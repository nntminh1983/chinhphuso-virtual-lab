/* Buổi 5 — Dữ liệu số: quản trị, kết nối, chia sẻ và dữ liệu mở (Bài 5)
   Năm tab: chỉ hỏi một lần · 20 cơ sở dữ liệu quốc gia · làm sạch dữ liệu dân cư · dữ liệu bẩn khi liên thông · dữ liệu mở 5 sao.
   Dữ liệu dùng: LAB.data.dan_cu (408 bản ghi có gieo lỗi), diem_phuc_vu, thu_tuc, ho_so. Mọi căn cứ lấy từ _build/CANCU.md mục H. */
(function () {
"use strict";
const { h, ui, chart } = LAB;
const shared = { tyLeLoi: null };          // tab 3 ghi tỉ lệ bản ghi lỗi → tab 4 dùng
const HOM_NAY = new Date();

/* ============================ dùng chung: kiểm tra chất lượng dân cư ============================ */
const RULES = [
  { id: "trung", ten: "Trùng số định danh", chu: "SẠCH", loi: "Trùng bản ghi" },
  { id: "dinhdanh", ten: "Số định danh không đủ 12 chữ số", chu: "ĐÚNG", loi: "Sai định danh" },
  { id: "ngaysinh", ten: "Ngày sinh không hợp lệ (dd/mm/yyyy, tháng 1–12, ngày có thật, không ở tương lai)", chu: "ĐÚNG", loi: "Sai ngày tháng" },
  { id: "trong", ten: "Trường bắt buộc bỏ trống", chu: "ĐỦ", loi: "Thiếu trường bắt buộc" },
  { id: "diachi", ten: "Địa chỉ còn \"Quận\"/\"Huyện\" (chính quyền 2 cấp từ 01/7/2025)", chu: "SẠCH", loi: "Sai danh mục đơn vị hành chính" },
  { id: "gioitinh", ten: "Giới tính ngoài danh mục Nam/Nữ", chu: "SẠCH", loi: "Sai danh mục dùng chung" },
  { id: "sdt", ten: "Số điện thoại không đủ 10 chữ số", chu: "ĐÚNG", loi: "Sai số điện thoại" },
  { id: "cu", ten: "Chưa cập nhật từ trước 01/01/2021", chu: "SỐNG", loi: "Dữ liệu chết" },
];
const TRUONG_BAT_BUOC = ["ho_ten", "ngay_sinh", "gioi_tinh", "so_dinh_danh", "dia_chi", "so_dien_thoai", "tinh_trang_hon_nhan", "ngay_cap_nhat"];
const TEN_TRUONG = { ho_ten: "Họ và tên", ngay_sinh: "Ngày sinh", gioi_tinh: "Giới tính", so_dinh_danh: "Số định danh cá nhân", dia_chi: "Nơi thường trú", so_dien_thoai: "Số điện thoại", tinh_trang_hon_nhan: "Tình trạng hôn nhân", ngay_cap_nhat: "Ngày cập nhật" };
function ngaySinhHopLe(s) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s || ""); if (!m) return false;
  const d = +m[1], mo = +m[2], y = +m[3]; if (mo < 1 || mo > 12 || d < 1 || y < 1900) return false;
  const dt = new Date(y, mo - 1, d); return dt.getDate() === d && dt.getMonth() === mo - 1 && dt <= HOM_NAY;
}
function chuanGioiTinh(g) { const k = LAB.khongDau(g).trim(); if (["nam", "m", "1", "male"].includes(k)) return "Nam"; if (["nu", "f", "2", "female"].includes(k)) return "Nữ"; return g; }
function hoaDauTu(s) { return String(s || "").trim().split(/\s+/).map(w => w ? w.charAt(0).toLocaleUpperCase("vi") + w.slice(1).toLocaleLowerCase("vi") : w).join(" "); }
/* kiemTra(rows, bat:Set id quy tắc) → {loi: Map ma → [{id, chiTiet}], dem: {id: n}} */
function kiemTra(rows, bat) {
  const loi = new Map(), dem = {}; RULES.forEach(r => { dem[r.id] = 0; });
  const ghi = (ma, id, chiTiet) => { if (!bat.has(id)) return; if (!loi.has(ma)) loi.set(ma, []); loi.get(ma).push({ id, chiTiet }); dem[id]++; };
  const nhom = LAB.stat.groupBy(rows.filter(r => r.so_dinh_danh), "so_dinh_danh");
  nhom.forEach(g => { if (g.length > 1) { const s = g.slice().sort((a, b) => a.ma < b.ma ? -1 : 1); s.slice(1).forEach(r => ghi(r.ma, "trung", "Trùng số định danh với " + s[0].ma + " (" + s[0].ho_ten + ")")); } });
  rows.forEach(r => {
    if (r.so_dinh_danh && !/^\d{12}$/.test(r.so_dinh_danh)) ghi(r.ma, "dinhdanh", "Số định danh \"" + r.so_dinh_danh + "\" có " + r.so_dinh_danh.length + " ký tự");
    if (r.ngay_sinh && !ngaySinhHopLe(r.ngay_sinh)) ghi(r.ma, "ngaysinh", "Ngày sinh \"" + r.ngay_sinh + "\"");
    const thieu = TRUONG_BAT_BUOC.filter(k => !String(r[k] == null ? "" : r[k]).trim());
    if (thieu.length) ghi(r.ma, "trong", "Bỏ trống: " + thieu.map(k => TEN_TRUONG[k]).join(", "));
    if (r.dia_chi && /(^|,)\s*(Quận|Huyện|Thị xã)\s/i.test(r.dia_chi)) ghi(r.ma, "diachi", r.dia_chi);
    if (r.gioi_tinh && !["Nam", "Nữ"].includes(r.gioi_tinh)) ghi(r.ma, "gioitinh", "Giới tính \"" + r.gioi_tinh + "\"");
    if (r.so_dien_thoai && !/^0\d{9}$/.test(r.so_dien_thoai)) ghi(r.ma, "sdt", "Số \"" + r.so_dien_thoai + "\" có " + r.so_dien_thoai.length + " chữ số");
    const d = LAB.date.parse(r.ngay_cap_nhat); if (d && d < new Date(2021, 0, 1)) ghi(r.ma, "cu", "Cập nhật lần cuối " + r.ngay_cap_nhat);
  });
  return { loi, dem };
}
const CSV_BOM_NOTE = "Tệp CSV mã hoá UTF-8, mở được bằng Excel.";

/* ============================ danh mục 20 CSDL quốc gia (QĐ 11/2026/QĐ-TTg, hiệu lực 19/5/2026) ============================ */
const CSDL = [
  { so: "I", ten: "Cơ sở dữ liệu tổng hợp quốc gia", bo: "Bộ Công an", xa: "Tổng hợp từ các cơ sở dữ liệu quốc gia, chuyên ngành; dữ liệu trong đó có giá trị khai thác như dữ liệu gốc." },
  { so: "II", ten: "Về dân cư", bo: "Bộ Công an", xa: "Xác minh nhân thân, nơi cư trú của người đến nộp hồ sơ; thay bản sao giấy tờ tuỳ thân." },
  { so: "III", ten: "Định danh địa điểm", bo: "Bộ Công an", xa: "Mã địa điểm thống nhất cho trụ sở, điểm phục vụ, địa chỉ." },
  { so: "IV", ten: "Danh tính điện tử", bo: "Bộ Công an", xa: "Kiểm tra tài khoản định danh điện tử của người nộp hồ sơ trực tuyến." },
  { so: "V", ten: "Về xuất nhập cảnh", bo: "Bộ Công an", xa: "Thông tin hộ chiếu, xuất nhập cảnh khi giải quyết việc liên quan người nước ngoài, người Việt ở nước ngoài." },
  { so: "VI", ten: "Về xử lý vi phạm hành chính", bo: "Bộ Công an", xa: "Tra cứu tiền sử vi phạm, tình tiết tái phạm khi xử phạt tại phường." },
  { so: "VII", ten: "Về trí tuệ nhân tạo", bo: "Bộ Công an", xa: "Dữ liệu phục vụ phát triển, quản lý hệ thống trí tuệ nhân tạo." },
  { so: "VIII", ten: "Về tài chính", bo: "Bộ Tài chính", xa: "Thông tin thu, chi ngân sách, thuế; đối chiếu nghĩa vụ tài chính." },
  { so: "IX", ten: "Về đăng ký doanh nghiệp", bo: "Bộ Tài chính", xa: "Kiểm tra doanh nghiệp, hộ kinh doanh đã đăng ký; tránh trùng tên, trùng địa điểm." },
  { so: "X", ten: "Về bảo hiểm", bo: "Bộ Tài chính", xa: "Tra cứu quá trình tham gia bảo hiểm xã hội, y tế của người dân." },
  { so: "XI", ten: "Về đất đai", bo: "Bộ Nông nghiệp và Môi trường", xa: "Kiểm tra thửa đất, chủ sử dụng, tình trạng tranh chấp khi xác nhận tình trạng đất, nhà ở." },
  { so: "XII", ten: "Về biến đổi khí hậu", bo: "Bộ Nông nghiệp và Môi trường", xa: "Dữ liệu khí hậu, phát thải phục vụ quy hoạch, phòng chống thiên tai." },
  { so: "XIII", ten: "Về cán bộ, công chức, viên chức", bo: "Bộ Nội vụ", xa: "Hồ sơ cán bộ, công chức của phường; phục vụ quản lý biên chế, bồi dưỡng." },
  { so: "XIV", ten: "Về an sinh xã hội", bo: "Bộ Nội vụ", xa: "Xác định đối tượng bảo trợ xã hội, chi trả trợ cấp không dùng tiền mặt." },
  { so: "XV", ten: "Tài liệu lưu trữ Phông lưu trữ nhà nước Việt Nam", bo: "Bộ Nội vụ", xa: "Tài liệu lưu trữ lịch sử của Nhà nước." },
  { so: "XVI", ten: "Về thủ tục hành chính", bo: "Bộ Tư pháp", xa: "Thành phần hồ sơ, trình tự, phí của từng thủ tục; niêm yết tại Bộ phận Một cửa." },
  { so: "XVII", ten: "Về hoạt động xây dựng", bo: "Bộ Xây dựng", xa: "Giấy phép xây dựng, năng lực tổ chức, cá nhân hoạt động xây dựng." },
  { so: "XVIII", ten: "Về y tế", bo: "Bộ Y tế", xa: "Dữ liệu y tế, cơ sở khám chữa bệnh." },
  { so: "XIX", ten: "Về giáo dục và đào tạo", bo: "Bộ Giáo dục và Đào tạo", xa: "Dữ liệu trường, lớp, học sinh; phục vụ tuyển sinh đúng tuyến." },
  { so: "XX", ten: "Về kiểm soát tài sản, thu nhập", bo: "Thanh tra Chính phủ", xa: "Bản kê khai tài sản, thu nhập của người có nghĩa vụ kê khai." },
];
const BO_NGAN = { "Bộ Công an": "Công an", "Bộ Tài chính": "Tài chính", "Bộ Nội vụ": "Nội vụ", "Bộ Nông nghiệp và Môi trường": "NN và MT", "Bộ Tư pháp": "Tư pháp", "Bộ Xây dựng": "Xây dựng", "Bộ Y tế": "Y tế", "Bộ Giáo dục và Đào tạo": "GD và ĐT", "Thanh tra Chính phủ": "TTCP" };

LAB.module({
  id: "m5",
  tabs: [

  /* ============================ TAB 1: Chỉ hỏi một lần ============================ */
  /* Chọn thủ tục, bật/tắt liên thông dân cư → trường nhân thân tự điền, giấy tờ đã có trong CSDL biến mất. */
  { id: "motlan", title: "Chỉ hỏi một lần", intro: "Nguyên tắc <b>chỉ hỏi một lần</b> (once-only): dữ liệu đã có trong cơ sở dữ liệu được kết nối, chia sẻ thì không thu thập lại (Luật Dữ liệu Điều 11 khoản 2 điểm b). Bật công tắc liên thông để thấy biểu mẫu và danh sách giấy tờ thay đổi ra sao.",
    build(pane) {
      const THU_TUC = {
        HT01: { ten: "Đăng ký khai sinh", truong: [["Họ tên người đi khai", "ho_ten", "Dân cư"], ["Số định danh người đi khai", "so_dinh_danh", "Dân cư"], ["Ngày sinh người đi khai", "ngay_sinh", "Dân cư"], ["Nơi cư trú", "dia_chi", "Dân cư"], ["Số điện thoại", "so_dien_thoai", "Dân cư"], ["Họ tên cha", "_cha", "Hộ tịch điện tử"], ["Họ tên mẹ", "_me", "Hộ tịch điện tử"], ["Họ tên trẻ"], ["Ngày sinh trẻ"], ["Nơi sinh"], ["Giới tính trẻ"], ["Dân tộc, quốc tịch"]],
          giay: [["Giấy chứng sinh"], ["Giấy chứng nhận kết hôn của cha mẹ", "Hộ tịch điện tử"], ["Căn cước của người đi khai", "Dân cư"], ["Giấy tờ chứng minh nơi cư trú", "Dân cư"], ["Văn bản uỷ quyền (nếu không phải cha, mẹ)"]] },
        CR01: { ten: "Đăng ký thường trú", truong: [["Họ và tên", "ho_ten", "Dân cư"], ["Ngày sinh", "ngay_sinh", "Dân cư"], ["Giới tính", "gioi_tinh", "Dân cư"], ["Số định danh cá nhân", "so_dinh_danh", "Dân cư"], ["Nơi thường trú hiện nay", "dia_chi", "Dân cư"], ["Số điện thoại", "so_dien_thoai", "Dân cư"], ["Quan hệ với chủ hộ"], ["Địa chỉ đăng ký thường trú mới"], ["Lý do thay đổi"]],
          giay: [["Giấy tờ chứng minh chỗ ở hợp pháp", "Đất đai"], ["Giấy tờ chứng minh quan hệ với chủ hộ", "Hộ tịch điện tử"], ["Căn cước công dân", "Dân cư"], ["Ý kiến đồng ý của chủ hộ, chủ sở hữu chỗ ở"], ["Hợp đồng thuê, mượn nhà (nếu có)"]] },
        KD01: { ten: "Đăng ký hộ kinh doanh", truong: [["Họ tên chủ hộ kinh doanh", "ho_ten", "Dân cư"], ["Ngày sinh", "ngay_sinh", "Dân cư"], ["Số định danh cá nhân", "so_dinh_danh", "Dân cư"], ["Địa chỉ thường trú", "dia_chi", "Dân cư"], ["Số điện thoại", "so_dien_thoai", "Dân cư"], ["Tên hộ kinh doanh"], ["Địa điểm kinh doanh"], ["Ngành, nghề kinh doanh"], ["Vốn kinh doanh"], ["Số lao động"]],
          giay: [["Bản sao căn cước của chủ hộ", "Dân cư"], ["Giấy tờ về quyền sử dụng địa điểm kinh doanh", "Đất đai"], ["Biên bản họp thành viên hộ gia đình"], ["Văn bản uỷ quyền (nếu có)"]] },
      };
      const dc = LAB.data.dan_cu; const sach = kiemTra(dc, new Set(RULES.map(r => r.id))).loi;
      const nguoiMau = dc.filter(r => !sach.has(r.ma)).slice(0, 6);
      const GIA_DINH = { tuNhap: 1, xacNhan: 0.2, giayTo: 30 };   // phút: giả định mô phỏng, nêu rõ trong tab
      const S = { tt: "HT01", lienThong: false, saiLech: false, nguoi: nguoiMau[0] ? nguoiMau[0].ma : "" };
      const { root, ctrl, view } = ui.sim();
      const segTT = ui.seg({ id: "m5ml-tt", label: "Thủ tục hành chính", options: Object.keys(THU_TUC).map(k => [k, THU_TUC[k].ten]), value: S.tt, onChange: v => { S.tt = v; draw(); } });
      const chkLT = ui.check({ id: "m5ml-lienthong", label: "Liên thông dữ liệu dân cư (khai thác qua Nền tảng chia sẻ, điều phối dữ liệu)", value: S.lienThong, onChange: v => { S.lienThong = v; draw(); } });
      const chkSai = ui.check({ id: "m5ml-sailech", label: "Giả định bản ghi dân cư có sai lệch (ví dụ sai tên đệm) → phải xác minh", value: S.saiLech, onChange: v => { S.saiLech = v; draw(); } });
      const selNguoi = ui.select({ id: "m5ml-nguoi", label: "Người dân đến nộp (bản ghi mẫu hư cấu)", options: nguoiMau.map(r => [r.ma, r.ho_ten + " · " + r.ma]), value: S.nguoi, onChange: v => { S.nguoi = v; draw(); } });
      const setAll = (tt, lt, sai) => { S.tt = tt; S.lienThong = lt; S.saiLech = sai; segTT.querySelector(".seg").set(tt); chkLT.input.checked = lt; chkSai.input.checked = sai; draw(); };
      ctrl.append(segTT, chkLT, chkSai, selNguoi,
        ui.presets([{ label: "Trước liên thông (hồ sơ giấy)", apply: () => setAll("HT01", false, false) }, { label: "Sau liên thông", apply: () => setAll("HT01", true, false) }, { label: "Liên thông nhưng dữ liệu sai", apply: () => setAll("HT01", true, true) }]),
        ui.btn("Làm lại", () => setAll("HT01", false, false), "sm"),
        ui.note("Giả định mô phỏng: mỗi trường tự khai mất " + GIA_DINH.tuNhap + " phút, xác nhận một trường đã điền sẵn " + GIA_DINH.xacNhan + " phút, chuẩn bị một giấy tờ phải nộp (sao chụp, chứng thực, đi lại) " + GIA_DINH.giayTo + " phút.", "mut"),
        ui.cancu("Luật Dữ liệu số 60/2024/QH15, Điều 11 khoản 2 điểm b", "\"Dữ liệu có trong các cơ sở dữ liệu được kết nối, chia sẻ thì không thu thập lại\"."),
        ui.cancu("Nghị định 194/2025/NĐ-CP ngày 03/7/2025, Điều 16 khoản 4", "\"Cơ quan nhà nước được chia sẻ dữ liệu chủ trong cơ sở dữ liệu quốc gia… thì không được yêu cầu cơ quan, tổ chức, cá nhân cung cấp thông tin tương đương bằng văn bản giấy khi thực hiện các thủ tục hành chính, hoạt động hành chính, trừ trường hợp pháp luật có quy định khác.\""),
        ui.cancu("Nghị định 320/2026/NĐ-CP ngày 13/8/2026 (hiệu lực 28/9/2026), sửa Nghị định 69/2024/NĐ-CP", "Sửa khoản 4 Điều 4: không được yêu cầu nộp giấy tờ khi dữ liệu đã được tích hợp trong hệ thống định danh và xác thực điện tử; giấy tờ không thuộc bí mật nhà nước được tự động đồng bộ, cập nhật (Điều 8)."));
      const out = ui.slot(), form = ui.slot(), giay = ui.slot(), ss = ui.slot(); view.append(out, form, giay, ss,
        h("div", { class: "note eve" }, ui.tag("Hết hiệu lực 22/10/2025", "eve"), " ", h("b", null, "Nghị định 47/2020/NĐ-CP, Điều 5 khoản 2"), " là nền móng của nguyên tắc này: \"không được thu thập, tổ chức thu thập lại dữ liệu hoặc yêu cầu người dân, doanh nghiệp cung cấp thông tin, dữ liệu trong quá trình giải quyết các thủ tục hành chính nếu dữ liệu này đã được cơ quan nhà nước khác cung cấp, sẵn sàng cung cấp thông qua kết nối, chia sẻ dữ liệu\". Văn bản đã bị thay thế bởi Nghị định 278/2025/NĐ-CP (Điều 23 khoản 2); khi trích dẫn phải dùng Luật Dữ liệu và Nghị định 194/2025, 278/2025."),
        ui.note("Điều kiện để chỉ hỏi một lần vận hành được: dữ liệu phải <b>đúng</b> và <b>sống</b>. Nghị định 194/2025 Điều 7 khoản 3 điểm b cho phép yêu cầu cung cấp lại khi cần <i>xác minh, thẩm tra</i> — tức là dữ liệu sai thì buộc phải đòi giấy. Xem tab 3 để làm sạch dữ liệu.", "key"));
      function tinh(lt, sai) {
        const tt = THU_TUC[S.tt];
        const tuNhap = tt.truong.filter(f => !(lt && f[2])).length, xacNhan = tt.truong.length - tuNhap;
        const phaiNop = tt.giay.filter(g => !(lt && g[1] && !sai)).length;
        return { tuNhap, xacNhan, phaiNop, phut: tuNhap * GIA_DINH.tuNhap + xacNhan * GIA_DINH.xacNhan + phaiNop * GIA_DINH.giayTo };
      }
      function draw() {
        const tt = THU_TUC[S.tt], ng = dc.find(r => r.ma === S.nguoi) || {};
        const now = tinh(S.lienThong, S.saiLech), tat = tinh(false, false), bat = tinh(true, false);
        out.render(ui.readouts([
          { k: "Trường người dân phải tự nhập", v: now.tuNhap + " / " + tt.truong.length, kind: now.tuNhap === tt.truong.length ? "eve" : "pt", big: true },
          { k: "Giấy tờ phải nộp", v: now.phaiNop + " / " + tt.giay.length, kind: now.phaiNop === tt.giay.length ? "eve" : "ok", big: true },
          { k: "Thời gian chuẩn bị ước tính", v: LAB.num(now.phut, 0) + " phút", kind: "key" },
          { k: "Tiết kiệm so với không liên thông", v: LAB.num(tat.phut - now.phut, 0) + " phút", kind: tat.phut - now.phut > 0 ? "ok" : "mut" }]));
        const gia = { _cha: "(tra từ hộ tịch điện tử)", _me: "(tra từ hộ tịch điện tử)" };
        form.render(ui.title("Biểu mẫu điện tử: " + tt.ten, S.lienThong ? "ô viền đứt màu xanh = điền tự động từ cơ sở dữ liệu" : "liên thông đang tắt: người dân tự khai mọi trường"),
          h("div", { class: "docform" }, tt.truong.map((f, i) => {
            const auto = S.lienThong && !!f[2]; const val = auto ? (f[1] in gia ? gia[f[1]] : (ng[f[1]] || "")) : "";
            const fld = ui.field({ id: "m5ml-f" + i, label: f[0], value: val, placeholder: auto ? "" : "người dân tự khai", hint: auto ? "Tự động từ CSDL " + f[2] + (S.saiLech && f[2] === "Dân cư" ? " · cần xác minh" : "") : "Tự nhập · " + GIA_DINH.tuNhap + " phút" });
            if (auto) fld.classList.add("auto"); fld.input.readOnly = auto; return fld;
          })));
        giay.render(ui.title("Giấy tờ kèm theo", "theo quy định của thủ tục; cột trạng thái tính theo công tắc liên thông"),
          ui.table(["Giấy tờ", "Nguồn có thể khai thác", "Trạng thái"], tt.giay.map(g => {
            const coCSDL = !!g[1]; const bo = S.lienThong && coCSDL && !S.saiLech; const xm = S.lienThong && coCSDL && S.saiLech;
            return [g[0], coCSDL ? "CSDL " + g[1] : "— (chưa có trong CSDL kết nối)", bo ? ui.tag("Khai thác từ CSDL, không nộp", "ok") : xm ? ui.tag("Phải nộp để xác minh (dữ liệu sai lệch)", "eve") : ui.tag("Phải nộp", "eve")];
          }), { rowCls: r => (r[2].classList.contains("ok") ? "good" : "") }));
        ss.render(ui.title("So sánh hai trạng thái", "cùng thủ tục, cùng người dân"),
          ui.table(["", "Tắt liên thông", "Bật liên thông", "Chênh lệch"], [
            ["Trường tự nhập", tat.tuNhap, bat.tuNhap, { html: String(tat.tuNhap - bat.tuNhap), cls: "r" }],
            ["Giấy tờ phải nộp", tat.phaiNop, bat.phaiNop, { html: String(tat.phaiNop - bat.phaiNop), cls: "r" }],
            ["Phút chuẩn bị (ước tính)", LAB.num(tat.phut, 0), LAB.num(bat.phut, 0), { html: LAB.num(tat.phut - bat.phut, 0), cls: "r" }]], { cls: "tight" }),
          ui.note("Người dân cảm nhận cải cách qua số lần phải đi lại và số giấy phải nộp, không qua số hệ thống đã đầu tư. Tại quầy: cán bộ tra cứu, người dân chỉ xác nhận thông tin hiển thị.", "mut"));
      }
      draw(); pane.appendChild(root);
    } },

  /* ============================ TAB 2: 20 cơ sở dữ liệu quốc gia ============================ */
  /* Danh mục QĐ 11/2026 theo chủ quản, biểu đồ cột; bài tập 8 tình huống chọn CSDL cần khai thác, chấm điểm, lưu, tải CSV. */
  { id: "csdlqg", title: "20 cơ sở dữ liệu quốc gia", intro: "Danh mục cơ sở dữ liệu quốc gia hiện hành theo <b>Quyết định 11/2026/QĐ-TTg ngày 28/3/2026</b> (hiệu lực 19/5/2026), gồm 20 cơ sở dữ liệu. Bấm từng thẻ để xem chủ quản và cách dùng tại cấp xã; làm bài tập chọn cơ sở dữ liệu cần khai thác cho 8 tình huống ở Phường Mẫu.",
    build(pane) {
      const KEY = "m5.csdlqg";
      const TINH_HUONG = [
        { th: "Người dân đến đăng ký khai sinh cho con; cần xác minh nhân thân và nơi cư trú của người đi khai", dap: "II" },
        { th: "Xác nhận tình trạng đất, nhà ở: kiểm tra thửa đất có đúng chủ sử dụng, có tranh chấp không", dap: "XI" },
        { th: "Hộ kinh doanh xin đăng ký tên gọi; cần kiểm tra tên có trùng với doanh nghiệp đã đăng ký không", dap: "IX" },
        { th: "Người cao tuổi đề nghị trợ cấp; cần tra cứu người này có đang hưởng lương hưu, bảo hiểm xã hội không", dap: "X" },
        { th: "Cán bộ Một cửa cần biết đúng thành phần hồ sơ, phí của một thủ tục để niêm yết và hướng dẫn", dap: "XVI" },
        { th: "Rà soát danh sách đối tượng bảo trợ xã hội đang nhận chi trả hằng tháng tại phường", dap: "XIV" },
        { th: "Hồ sơ nộp trực tuyến; cần kiểm tra tài khoản định danh điện tử của người nộp có hợp lệ không", dap: "IV" },
        { th: "Trước khi xử phạt vi phạm trật tự xây dựng, cần biết người này đã bị xử phạt hành vi tương tự chưa", dap: "VI" },
      ];
      const saved = LAB.store.get(KEY, { ten: "", chon: {} });
      const S = { xem: "II", chon: Object.assign({}, saved.chon), ten: saved.ten || "", bo: "Tất cả" };
      const { root, view } = ui.sim({ wide: true });
      const byBo = LAB.stat.count(CSDL, "bo"); const bos = [...byBo.keys()];
      const box = chart.box(b => chart.bars(b, { labels: bos.map(x => BO_NGAN[x]), series: [{ name: "Số CSDL quốc gia", color: "aqua", values: bos.map(x => byBo.get(x)) }], ylabel: "số cơ sở dữ liệu", intY: true, aspect: 0.32, fmtTip: v => v + " cơ sở dữ liệu" }));
      const selBo = ui.select({ id: "m5cs-bo", label: "Lọc theo cơ quan chủ quản", options: [["Tất cả", "Tất cả (20)"], ...bos.map(b => [b, b + " (" + byBo.get(b) + ")"])], value: S.bo, onChange: v => { S.bo = v; veDanhMuc(); } });
      const dm = ui.slot(), chiTiet = ui.slot();
      view.append(
        h("div", { class: "row" }, ui.tag("Hiện hành: QĐ 11/2026/QĐ-TTg · 20 CSDL", "ok"), ui.tag("Hết hiệu lực 19/8/2025: NĐ 47/2024/NĐ-CP · 10 CSDL", "eve")),
        ui.note("<b>Danh mục cũ theo Nghị định 47/2024/NĐ-CP (10 cơ sở dữ liệu) đã bị bãi bỏ toàn bộ</b> từ 19/8/2025 (Nghị định 194/2025, Điều 40 khoản 2). So với danh mục cũ: bổ sung 10 cơ sở dữ liệu; chuyển chủ quản đăng ký doanh nghiệp và bảo hiểm về Bộ Tài chính, đất đai về Bộ Nông nghiệp và Môi trường, thủ tục hành chính về Bộ Tư pháp. Khung Kiến trúc CPS 4.0 chỉ nêu các cơ sở dữ liệu quốc gia <i>điển hình</i>, không phải danh mục đầy đủ.", "eve"),
        h("div", { class: "cols" }, h("div", { class: "stack" }, ui.title("Số cơ sở dữ liệu quốc gia theo cơ quan chủ quản"), box), h("div", { class: "stack" }, selBo, chiTiet)),
        dm);
      function veDanhMuc() {
        const ds = S.bo === "Tất cả" ? CSDL : CSDL.filter(c => c.bo === S.bo);
        dm.render(ui.title("Danh mục (bấm để xem)", ds.length + " cơ sở dữ liệu"), ui.tiles({ items: ds.map(c => ({ id: c.so, title: c.so + ". " + c.ten, sub: c.bo, kind: "aqua" })), value: S.xem, onChange: v => { S.xem = v; veChiTiet(); } }));
      }
      function veChiTiet() {
        const c = CSDL.find(x => x.so === S.xem);
        chiTiet.render(ui.panel(c.so + ". Cơ sở dữ liệu quốc gia " + (c.ten.startsWith("Về") ? c.ten.toLowerCase() : c.ten.toLowerCase()),
          h("dl", { class: "kv" }, h("dt", null, "Cơ quan chủ quản"), h("dd", null, c.bo), h("dt", null, "Gợi ý khai thác tại cấp xã"), h("dd", null, c.xa)),
          ui.note("Dữ liệu chủ trong cơ sở dữ liệu quốc gia có giá trị sử dụng chính thức, tương đương văn bản giấy (Nghị định 165/2025, Điều 14 khoản 4 điểm c).", "mut")));
      }
      veDanhMuc(); veChiTiet();
      /* so sánh và tiêu chí */
      view.append(h("div", { class: "cols" },
        ui.panel("Cơ sở dữ liệu quốc gia và cơ sở dữ liệu chuyên ngành", ui.table(["Cơ sở dữ liệu quốc gia", "Cơ sở dữ liệu chuyên ngành"], [
          ["Chứa dữ liệu chủ của quốc gia", "Phục vụ nghiệp vụ một ngành, lĩnh vực"], ["Nhiều bộ, ngành, địa phương khai thác", "Chủ yếu dùng trong phạm vi ngành đó"],
          ["Giá trị đối chiếu như giấy tờ gốc", "Đối chiếu ngược về dữ liệu quốc gia"], ["Bộ, ngành ở Trung ương chủ quản", "Bộ, ngành hoặc địa phương chủ quản"],
          ["Địa phương có thể có phân hệ tại chỗ", "Phải chia sẻ khi có yêu cầu hợp pháp"]], { cls: "wrap" })),
        ui.panel("Ba tiêu chí của cơ sở dữ liệu quốc gia", ui.steps([
          { t: "Có mục tiêu phục vụ <b>quản trị quốc gia</b>, hoặc giám sát, phân tích, nghiên cứu, hoạch định chính sách phát triển của quốc gia" },
          { t: "<b>Có chứa dữ liệu chủ</b>, trừ trường hợp đặc biệt là Cơ sở dữ liệu tổng hợp quốc gia" },
          { t: "Phạm vi khai thác <b>rộng rãi trên toàn quốc</b>, được kết nối, chia sẻ với bộ, ngành, địa phương phục vụ quản lý nhà nước, thủ tục hành chính, cải cách hành chính" }]),
          ui.cancu("Nghị định 194/2025/NĐ-CP ngày 03/7/2025, Điều 5 khoản 1", "Tiêu chí hiện hành, thay tiêu chí cũ của Nghị định 47/2020 Điều 12 và Nghị định 47/2024 Điều 6. Khoản 2, 4: Bộ Công an tổng hợp, đánh giá và trình Thủ tướng Chính phủ phê duyệt danh mục."))));
      /* bài tập */
      const tenHV = ui.field({ id: "m5cs-ten", label: "Họ tên học viên", value: S.ten, onInput: v => { S.ten = v; luu(); } });
      const kq = ui.slot(); const bang = ui.slot();
      function luu() { LAB.store.set(KEY, { ten: S.ten, chon: S.chon }); }
      function cham() {
        const dung = TINH_HUONG.filter((t, i) => S.chon[i] === t.dap).length, daChon = Object.keys(S.chon).filter(k => S.chon[k]).length;
        kq.render(h("div", { class: "row" }, (() => { const s = ui.score(dung, "đúng / " + TINH_HUONG.length, TINH_HUONG.length); s.classList.add(dung === TINH_HUONG.length ? "ok" : dung >= 5 ? "pt" : "eve"); return s; })(),
          ui.readouts([{ k: "Đã chọn", v: daChon + " / " + TINH_HUONG.length, kind: "pt" }, { k: "Chọn đúng", v: String(dung), kind: "ok" }, { k: "Chọn sai", v: String(daChon - dung), kind: "eve" }])));
        bang.render(ui.table(["#", "Tình huống tại Phường Mẫu", "Cơ sở dữ liệu quốc gia cần khai thác", "Kết quả"], TINH_HUONG.map((t, i) => {
          const sel = ui.select({ id: "m5cs-th" + i, label: "", options: [["", "— chọn —"], ...CSDL.map(c => [c.so, c.so + ". " + c.ten])], value: S.chon[i] || "", onChange: v => { S.chon[i] = v; luu(); cham(); } });
          sel.querySelector("label").remove();
          const c = S.chon[i]; const kqc = !c ? ui.tag("Chưa chọn", "mut") : c === t.dap ? ui.tag("Đúng", "ok") : ui.tag("Xem lại: đáp án " + t.dap, "eve");
          return [String(i + 1), { text: t.th, cls: "wrap" }, sel, kqc];
        }), { cls: "wrap", rowCls: (r, i) => !S.chon[i] ? "" : S.chon[i] === TINH_HUONG[i].dap ? "good" : "bad" }));
      }
      view.append(ui.panel("Bài tập: chọn cơ sở dữ liệu quốc gia cần khai thác", tenHV, kq, bang,
        h("div", { class: "row" },
          ui.btn("Ví dụ mẫu (điền đáp án 4 tình huống đầu)", () => { TINH_HUONG.slice(0, 4).forEach((t, i) => { S.chon[i] = t.dap; }); luu(); cham(); }, "sm"),
          ui.btn("Làm lại", () => { S.chon = {}; luu(); cham(); }, "sm"),
          ui.btn("Tải CSV bài làm", () => LAB.csv.download("bai5_csdl_quoc_gia_" + (LAB.khongDau(S.ten).replace(/\s+/g, "_") || "hoc_vien") + ".csv", ["stt", "tinh_huong", "csdl_chon", "csdl_dap_an", "ket_qua", "hoc_vien"],
            TINH_HUONG.map((t, i) => { const c = CSDL.find(x => x.so === S.chon[i]); return [i + 1, t.th, c ? c.so + ". " + c.ten : "", t.dap + ". " + CSDL.find(x => x.so === t.dap).ten, S.chon[i] === t.dap ? "Đúng" : "Sai", S.ten]; })), "sm pri")),
        ui.note("Bài làm được lưu trên máy này. " + CSV_BOM_NOTE, "mut")));
      cham(); pane.appendChild(root); box.draw();
    } },

  /* ============================ TAB 3: Làm sạch dữ liệu dân cư ============================ */
  /* 8 quy tắc bật/tắt trên 408 bản ghi; biểu đồ số lỗi, bảng bản ghi lỗi, điểm Đúng–Đủ–Sạch–Sống, phiếu nhận xét, tải CSV lỗi và CSV đã làm sạch. */
  { id: "chatluong", title: "Làm sạch dữ liệu dân cư", intro: "Thực hành chính: kiểm tra <b>trích xuất dân cư mẫu của Phường Mẫu</b> (408 bản ghi hư cấu, có gieo lỗi) bằng 8 quy tắc, chấm theo bốn chữ <b>đúng – đủ – sạch – sống</b>, ghi nguyên nhân và cách khắc phục, rồi xuất bản đã làm sạch.",
    build(pane) {
      const KEY = "m5.chatluong"; const rows = LAB.data.dan_cu;
      const saved = LAB.store.get(KEY, { ten: "", ghi: {}, bat: RULES.map(r => r.id) });
      const S = { ten: saved.ten || "", ghi: Object.assign({}, saved.ghi), bat: new Set(saved.bat || RULES.map(r => r.id)), loc: "Tất cả" };
      const { root, ctrl, view } = ui.sim();
      const checks = RULES.map(r => ui.check({ id: "m5cl-r-" + r.id, label: r.ten, value: S.bat.has(r.id), onChange: v => { v ? S.bat.add(r.id) : S.bat.delete(r.id); luu(); draw(); } }));
      const selLoc = ui.select({ id: "m5cl-loc", label: "Bảng bản ghi lỗi: lọc theo loại", options: [["Tất cả", "Tất cả loại lỗi"], ...RULES.map(r => [r.id, r.loi])], value: S.loc, onChange: v => { S.loc = v; veBang(); } });
      const tenHV = ui.field({ id: "m5cl-ten", label: "Họ tên học viên", value: S.ten, onInput: v => { S.ten = v; luu(); } });
      const setBat = ids => { S.bat = new Set(ids); checks.forEach((c, i) => { c.input.checked = S.bat.has(RULES[i].id); }); luu(); draw(); };
      ctrl.append(ui.title("Quy tắc kiểm tra", "bật/tắt từng quy tắc"), ...checks,
        ui.presets([{ label: "Bật cả 8 quy tắc", apply: () => setBat(RULES.map(r => r.id)) }, { label: "Chỉ kiểm tra khoá (trùng, định danh)", apply: () => setBat(["trung", "dinhdanh"]) }, { label: "Chỉ chữ SỐNG", apply: () => setBat(["cu"]) }]),
        h("div", { class: "row" }, ui.btn("Làm lại", () => { S.ghi = {}; S.loc = "Tất cả"; selLoc.input.value = "Tất cả"; setBat(RULES.map(r => r.id)); }, "sm")),
        selLoc, tenHV,
        ui.cancu("Luật Dữ liệu số 60/2024/QH15, Điều 15", "Quản trị, quản lý dữ liệu phải bảo đảm dữ liệu đầy đủ, chính xác, toàn vẹn, nhất quán, chuẩn hoá, an toàn, bảo mật, kịp thời."),
        ui.note("Cụm <b>\"đúng, đủ, sạch, sống\"</b> là cách nói sư phạm, không có trong văn bản. Thuộc tính pháp lý là <b>\"chính xác, nhất quán và đầy đủ\"</b> (Nghị định 165/2025/NĐ-CP, Điều 14 khoản 4 điểm b) và <b>\"đầy đủ, chính xác, cập nhật, chuẩn hoá\"</b> (Nghị định 278/2025/NĐ-CP, Điều 15 khoản 2 điểm d).", "key"));
      const ro = ui.slot(), diem = ui.slot(), bang = ui.slot(), phieu = ui.slot();
      let K = null; const box = chart.box(b => chart.bars(b, S.chart));
      view.append(ro, h("div", { class: "cols" }, h("div", { class: "stack" }, ui.title("Số bản ghi lỗi theo loại"), box), diem), bang, phieu,
        ui.panel("Lỗi thường gặp ở cấp xã và cách phòng", ui.table(["Lỗi", "Ví dụ", "Cách phòng ngừa"], [
          ["Sai chính tả tên", "Thiếu dấu, sai tên đệm", "Nhập theo đúng giấy tờ gốc, đọc soát lại"], ["Sai ngày tháng", "Nhầm ngày với tháng, sai năm sinh", "Chọn từ lịch, không gõ tay"],
          ["Trùng bản ghi", "Một người có hai hồ sơ", "Kiểm tra số định danh trước khi tạo mới"], ["Thiếu trường bắt buộc", "Bỏ trống nơi thường trú", "Không cho lưu khi còn trường trống"],
          ["Sai danh mục dùng chung", "Ghi tên đơn vị hành chính tự do", "Chọn trong danh mục, không gõ tay"], ["Dữ liệu chết", "Người đã chuyển đi vẫn còn tên", "Rà soát định kỳ, gắn trách nhiệm cập nhật"]], { cls: "wrap" }),
          ui.note("Phần lớn lỗi dữ liệu không phải do phần mềm mà do thói quen nhập liệu. Sửa dữ liệu phải sửa từ nơi tạo ra nó, không sửa ở nơi nhận về.", "mut")));
      function luu() { LAB.store.set(KEY, { ten: S.ten, ghi: S.ghi, bat: [...S.bat] }); }
      function banSach() {
        const seen = new Set(); const out = [];
        rows.slice().sort((a, b) => a.ma < b.ma ? -1 : 1).forEach(r => { if (r.so_dinh_danh && /^\d{12}$/.test(r.so_dinh_danh)) { if (seen.has(r.so_dinh_danh)) return; seen.add(r.so_dinh_danh); } out.push(Object.assign({}, r, { ho_ten: hoaDauTu(r.ho_ten), gioi_tinh: chuanGioiTinh(r.gioi_tinh) })); });
        return out;
      }
      function draw() {
        K = kiemTra(rows, S.bat); const nLoi = K.loi.size; shared.tyLeLoi = nLoi / rows.length;
        const tong = RULES.reduce((s, r) => s + K.dem[r.id], 0);
        ro.render(ui.readouts([{ k: "Bản ghi kiểm tra", v: LAB.num(rows.length), kind: "ct" }, { k: "Bản ghi có ít nhất một lỗi", v: LAB.num(nLoi), kind: "eve", big: true }, { k: "Tỉ lệ bản ghi lỗi", v: LAB.pc(100 * nLoi / rows.length), kind: "eve" }, { k: "Tổng lượt lỗi", v: LAB.num(tong), kind: "key" }, { k: "Quy tắc đang bật", v: S.bat.size + " / 8", kind: "pt" }]));
        S.chart = { labels: ["Trùng", "Định danh", "Ngày sinh", "Bỏ trống", "Địa chỉ cũ", "Giới tính", "SĐT", "Cũ"].slice(0, RULES.length), series: [{ name: "Số bản ghi", color: "eve", values: RULES.map(r => K.dem[r.id]), colors: RULES.map(r => S.bat.has(r.id) ? "eve" : "faint") }], ylabel: "bản ghi", intY: true, aspect: 0.5, fmtTip: (v, i) => RULES[i].ten + ": " + v + " bản ghi" + (S.bat.has(RULES[i].id) ? "" : " (quy tắc đang tắt)") }; box.draw();
        /* điểm 4 chữ: 100 × (1 − số bản ghi vi phạm chữ đó / tổng) */
        const CHU = ["ĐÚNG", "ĐỦ", "SẠCH", "SỐNG"], MO_TA = { "ĐÚNG": "khớp giấy tờ gốc: định danh, ngày sinh, số điện thoại đúng dạng", "ĐỦ": "không thiếu trường bắt buộc", "SẠCH": "không trùng, đúng danh mục dùng chung (giới tính, đơn vị hành chính)", "SỐNG": "cập nhật kịp thời (sau 01/01/2021)" };
        const viPham = {}; CHU.forEach(c => { viPham[c] = new Set(); });
        K.loi.forEach((ls, ma) => ls.forEach(l => viPham[RULES.find(r => r.id === l.id).chu].add(ma)));
        const diemChu = CHU.map(c => 100 * (1 - viPham[c].size / rows.length)); const tb = LAB.stat.mean(diemChu);
        const sc = ui.score(Math.round(tb), "điểm chất lượng", 100); sc.classList.add(tb >= 97 ? "ok" : tb >= 90 ? "pt" : "eve");
        diem.render(ui.title("Điểm chất lượng theo bốn chữ", "điểm mỗi chữ = 100 × (1 − bản ghi vi phạm / tổng bản ghi)"), h("div", { class: "row" }, sc, h("div", { class: "stack", style: { flex: "1 1 200px" } }, CHU.map((c, i) => ui.bar({ label: c + " · " + MO_TA[c], value: diemChu[i], max: 100, kind: diemChu[i] >= 97 ? "ok" : diemChu[i] >= 90 ? "pt" : "eve", text: LAB.num(diemChu[i], 1) + " (" + viPham[c].size + " bản ghi)" })))),
          ui.note("Hỏng một trong bốn chữ là dữ liệu mất giá trị khi liên thông. Ngoài bốn chữ, dữ liệu còn phải <b>có chủ</b> (rõ người phụ trách) và <b>truy vết</b> được (ai sửa, sửa khi nào).", "mut"));
        veBang(); vePhieu();
      }
      function veBang() {
        const ds = []; K.loi.forEach((ls, ma) => { const r = rows.find(x => x.ma === ma); ls.forEach(l => { if (S.loc === "Tất cả" || S.loc === l.id) ds.push([r.ma, r.ho_ten, r.so_dinh_danh, r.ngay_sinh, r.gioi_tinh, RULES.find(x => x.id === l.id).loi, l.chiTiet]); }); });
        ds.sort((a, b) => a[0] < b[0] ? -1 : 1);
        const tb = ui.table(["Mã", "Họ tên", "Số định danh", "Ngày sinh", "Giới tính", "Loại lỗi", "Chi tiết"], ds, { rowCls: () => "bad" });
        bang.render(ui.title("Bản ghi có lỗi", ds.length + " dòng" + (S.loc === "Tất cả" ? " (một bản ghi có thể xuất hiện ở nhiều loại)" : "")),
          ds.length ? h("div", { style: { maxHeight: "360px", overflowY: "auto", border: "1px solid var(--line)", borderRadius: "6px" } }, tb) : ui.note("Không có bản ghi nào vi phạm quy tắc đang bật.", "ok"),
          h("div", { class: "row" },
            ui.btn("Tải CSV danh sách bản ghi lỗi", () => { const all = []; K.loi.forEach((ls, ma) => { const r = rows.find(x => x.ma === ma); ls.forEach(l => all.push([r.ma, r.ho_ten, RULES.find(x => x.id === l.id).loi, l.chiTiet, S.ghi[l.id] || "", S.ten])); }); LAB.csv.download("bai5_ban_ghi_loi.csv", ["ma", "ho_ten", "loai_loi", "chi_tiet", "nguyen_nhan_cach_khac_phuc", "hoc_vien"], all); }, "sm"),
            ui.btn("Tải CSV bản đã làm sạch", () => LAB.csv.download("dan_cu_da_lam_sach.csv", LAB.dataHeaders("dan_cu"), banSach()), "sm pri")),
          ui.note("Bản đã làm sạch: loại bản ghi trùng số định danh (giữ bản ghi có mã nhỏ hơn), chuẩn hoá giới tính về Nam/Nữ, chuẩn hoá họ tên về dạng viết hoa đầu từ; các lỗi khác (ngày sinh, địa chỉ cũ, trường trống) phải đối chiếu giấy tờ gốc nên <b>không tự sửa</b> — đó là việc của cán bộ tạo lập dữ liệu. Còn " + (rows.length - banSach().length) + " bản ghi trùng đã được loại.", "mut"));
      }
      function vePhieu() {
        phieu.render(ui.title("Phiếu nhận xét của học viên", "ghi nguyên nhân và cách khắc phục cho từng loại lỗi; tự lưu trên máy"),
          ui.table(["Loại lỗi", "Chữ", "Số bản ghi", "Nguyên nhân / cách khắc phục (học viên ghi)"], RULES.map(r => {
            const f = ui.field({ id: "m5cl-ghi-" + r.id, type: "textarea", rows: 2, label: "", value: S.ghi[r.id] || "", placeholder: "ví dụ: gõ tay thay vì chọn lịch → bắt buộc chọn từ lịch", onInput: v => { S.ghi[r.id] = v; luu(); } });
            f.querySelector("label").remove(); f.style.minWidth = "260px";
            return [r.loi, ui.tag(r.chu, r.chu === "ĐÚNG" ? "pt" : r.chu === "ĐỦ" ? "key" : r.chu === "SẠCH" ? "ct" : "ok"), { html: String(K.dem[r.id]), cls: "r" }, f];
          }), { cls: "wrap" }));
      }
      draw(); pane.appendChild(root);
    } },

  /* ============================ TAB 4: Dữ liệu bẩn khi liên thông ============================ */
  /* Monte Carlo có mầm: tỉ lệ bản ghi lỗi × số hồ sơ/ngày × số CSDL đối chiếu → hồ sơ trả lại, giờ công, lan truyền lỗi. */
  { id: "lienthong", title: "Dữ liệu bẩn khi liên thông", intro: "Một bản ghi sai tưởng vô hại, nhưng khi hồ sơ phải đối chiếu với nhiều cơ sở dữ liệu thì xác suất bị trả lại tăng nhanh. Mô phỏng ngẫu nhiên (có mầm, bấm <b>Chạy lại</b> để đổi mầm) trên số hồ sơ thực tế của Phường Mẫu.",
    build(pane) {
      const hs = LAB.data.ho_so; const ngay = hs.map(r => r.ngay_nop).sort();
      const soNgayLV = Math.max(1, LAB.date.workdays(ngay[0], ngay[ngay.length - 1]) || 1);
      const hsNgayTB = hs.length / soNgayLV; const tyLeBoSung = 100 * LAB.stat.rate(hs, r => +r.so_lan_bo_sung > 0);
      const NGAY_THANG = 22, THANG = 12;
      const S = { p: shared.tyLeLoi != null ? Math.round(1000 * shared.tyLeLoi) / 10 : 12, hsNgay: Math.round(hsNgayTB * 10) / 10, k: 2, gio: 1.5, n: 4, seed: 11 };
      const { root, ctrl, view } = ui.sim();
      const rP = ui.range({ id: "m5lt-p", label: "Tỉ lệ bản ghi lỗi trong cơ sở dữ liệu", min: 0, max: 30, step: 0.5, value: S.p, fmt: v => LAB.pc(v), onInput: v => { S.p = v; draw(); }, hint: shared.tyLeLoi != null ? "Giá trị khởi tạo lấy từ tab 3 (" + LAB.pc(100 * shared.tyLeLoi) + ")." : "Mở tab 3 trước để lấy tỉ lệ thực đo được." });
      const rHS = ui.range({ id: "m5lt-hs", label: "Số hồ sơ tiếp nhận mỗi ngày làm việc", min: 1, max: 40, step: 0.5, value: S.hsNgay, fmt: v => LAB.num(v, 1) + " hồ sơ", onInput: v => { S.hsNgay = v; draw(); }, hint: "Sổ hồ sơ Phường Mẫu: " + LAB.num(hs.length) + " hồ sơ / " + LAB.num(soNgayLV) + " ngày làm việc ≈ " + LAB.num(hsNgayTB, 1) + " hồ sơ/ngày." });
      const rK = ui.range({ id: "m5lt-k", label: "Số cơ sở dữ liệu phải đối chiếu cho mỗi hồ sơ", min: 1, max: 5, step: 1, value: S.k, fmt: v => v + " CSDL", onInput: v => { S.k = v; draw(); } });
      const rG = ui.range({ id: "m5lt-gio", label: "Giờ công xử lý thêm cho một hồ sơ bị trả lại", min: 0.5, max: 4, step: 0.25, value: S.gio, fmt: v => LAB.num(v, 2) + " giờ", onInput: v => { S.gio = v; draw(); }, hint: "Đối chiếu thủ công, liên hệ nơi giữ dữ liệu gốc, giải thích cho người dân." });
      const rN = ui.range({ id: "m5lt-n", label: "Số hệ thống nhận dữ liệu từ cơ sở dữ liệu gốc", min: 1, max: 10, step: 1, value: S.n, fmt: v => v + " hệ thống", onInput: v => { S.n = v; draw(); } });
      const setAll = o => { Object.assign(S, o); rP.set(S.p); rHS.set(S.hsNgay); rK.set(S.k); rG.set(S.gio); rN.set(S.n); draw(); };
      ctrl.append(rP, rHS, rK, rG, rN,
        h("div", { class: "row" }, ui.btn("Chạy lại (đổi mầm)", () => { S.seed = (S.seed * 7 + 3) % 10007; draw(); }, "sm pri"), ui.btn("Lấy tỉ lệ từ tab 3", () => { if (shared.tyLeLoi == null) { S.canhBao = true; draw(); return; } setAll({ p: Math.round(1000 * shared.tyLeLoi) / 10 }); }, "sm"), ui.btn("Làm lại", () => setAll({ p: 12, hsNgay: Math.round(hsNgayTB * 10) / 10, k: 2, gio: 1.5, n: 4, seed: 11, canhBao: false }), "sm")),
        ui.presets([{ label: "Dữ liệu tốt (2 %, 1 CSDL)", apply: () => setAll({ p: 2, k: 1 }) }, { label: "Hiện trạng Phường Mẫu (tab 3, 3 CSDL)", apply: () => setAll({ p: shared.tyLeLoi != null ? Math.round(1000 * shared.tyLeLoi) / 10 : 14.5, k: 3 }) }, { label: "Liên thông sâu, dữ liệu bẩn (20 %, 5 CSDL)", apply: () => setAll({ p: 20, k: 5 }) }]),
        ui.cancu("Nghị định 278/2025/NĐ-CP ngày 22/10/2025, Điều 4 khoản 1 và 2", "Kết nối, chia sẻ dữ liệu phải kịp thời, đầy đủ, <b>đúng mục đích</b>, an toàn, bảo mật, <b>đúng phạm vi chức năng, nhiệm vụ, quyền hạn</b>; mọi hoạt động chia sẻ bắt buộc phải qua Nền tảng chia sẻ, điều phối dữ liệu để giám sát, truy vết, đánh giá hiệu quả. Khoản 7: dữ liệu phải cập nhật, chính xác."),
        ui.cancu("Nghị định 278/2025/NĐ-CP, Điều 13", "Giám sát liên tục, công khai, có truy vết hoạt động kết nối, chia sẻ dữ liệu; Điều 14 kiểm toán dữ liệu; Điều 15 xếp hạng cơ sở dữ liệu."));
      const ro = ui.slot(), canhBao = ui.slot(), lan = ui.slot();
      const boxThang = chart.box(b => chart.bars(b, S.cThang)), boxK = chart.box(b => chart.line(b, S.cK)), boxLan = chart.box(b => chart.bars(b, S.cLan));
      view.append(canhBao, ro, h("div", { class: "cols" }, h("div", { class: "stack" }, ui.title("Hồ sơ bị trả lại / yêu cầu bổ sung theo tháng", "mô phỏng 12 tháng, cột đứt = kỳ vọng lý thuyết"), boxThang), h("div", { class: "stack" }, ui.title("Xác suất một hồ sơ bị trả lại theo số CSDL phải đối chiếu", "P = 1 − (1 − p)^k"), boxK)),
        h("div", { class: "cols" }, h("div", { class: "stack" }, ui.title("Lan truyền lỗi: một bản ghi sai cấp cho n hệ thống", "số điểm phải sửa nếu sửa ở nơi nhận so với sửa tại nguồn"), boxLan), lan),
        ui.panel("Hệ quả của dữ liệu bẩn khi liên thông", ui.steps([
          { t: "<b>Với người dân:</b> hồ sơ bị trả lại vì thông tin không khớp giữa hai cơ sở dữ liệu; phải đi xin điều chỉnh ở nơi khác rồi mới quay lại nộp." },
          { t: "<b>Với cán bộ:</b> mất thời gian đối chiếu thủ công, phải giải thích và chịu phàn nàn." },
          { t: "<b>Với cơ quan:</b> số liệu báo cáo sai lệch, quyết định điều hành dựa trên nền không chắc; một bản ghi sai lan sang mọi hệ thống có kết nối." },
          { t: "<b>Quy tắc:</b> sửa dữ liệu phải sửa từ nơi tạo ra nó, không sửa ở nơi nhận về.", hi: true }])));
      function draw() {
        canhBao.render(S.canhBao ? ui.note("Chưa có tỉ lệ từ tab 3: hãy mở tab \"Làm sạch dữ liệu dân cư\" trước, rồi bấm lại.", "eve") : null);
        const p = S.p / 100, P = 1 - Math.pow(1 - p, S.k), N = Math.max(1, Math.round(S.hsNgay * NGAY_THANG));
        const rng = LAB.rng(S.seed); const traLai = [];
        for (let m = 0; m < THANG; m++) { let c = 0; for (let i = 0; i < N; i++) if (rng() < P) c++; traLai.push(c); }
        const tb = LAB.stat.mean(traLai), gioThem = tb * S.gio, ngayCong = gioThem / 8;
        ro.render(ui.readouts([
          { k: "Hồ sơ tiếp nhận mỗi tháng", v: LAB.num(N), kind: "pt" }, { k: "Xác suất một hồ sơ bị trả lại", v: LAB.pc(100 * P), kind: P > 0.2 ? "eve" : "key", big: true },
          { k: "Hồ sơ trả lại / tháng (trung bình mô phỏng)", v: LAB.num(tb, 1), kind: "eve", big: true }, { k: "Giờ công xử lý thêm / tháng", v: LAB.num(gioThem, 1) + " giờ ≈ " + LAB.num(ngayCong, 1) + " ngày công", kind: "eve" },
          { k: "Lượt đi lại thêm của người dân / năm", v: LAB.num(LAB.stat.sum(traLai)), kind: "eve" }, { k: "Tham chiếu sổ hồ sơ: hồ sơ từng phải bổ sung", v: LAB.pc(tyLeBoSung), kind: "mut" }]));
        S.cThang = { labels: traLai.map((_, i) => "T" + (i + 1)), series: [{ name: "Mô phỏng", color: "eve", values: traLai }, { name: "Kỳ vọng", color: "key", values: traLai.map(() => +(N * P).toFixed(1)) }], ylabel: "hồ sơ", intY: false, aspect: 0.5, fmtTip: v => LAB.num(v, 1) + " hồ sơ" };
        S.cK = { series: [{ name: "Tỉ lệ lỗi " + LAB.pc(S.p), color: "eve", marker: true, points: [1, 2, 3, 4, 5].map(k => [k, 100 * (1 - Math.pow(1 - p, k))]) }, { name: "Nếu tỉ lệ lỗi chỉ 2 %", color: "ok", dash: [4, 4], marker: true, points: [1, 2, 3, 4, 5].map(k => [k, 100 * (1 - Math.pow(0.98, k))]) }], xlabel: "số CSDL phải đối chiếu", ylabel: "% hồ sơ bị trả lại", xmin: 1, xmax: 5, ymin: 0, ymax: 100, xticks: [1, 2, 3, 4, 5], fmtX: v => v + " CSDL", fmtY: v => v + " %", fmtTip: v => LAB.pc(v), vlines: [{ x: S.k, label: "đang chọn", color: "var(--key)" }], aspect: 0.5 };
        const soSai = Math.round(p * LAB.data.dan_cu.length);
        S.cLan = { labels: ["Sửa ở nơi nhận", "Sửa tại nguồn, đồng bộ xuống"], series: [{ name: "Điểm phải sửa", color: "eve", values: [soSai * (S.n + 1), soSai], colors: ["eve", "ok"] }], ylabel: "bản ghi phải sửa", intY: true, aspect: 0.5, fmtTip: v => LAB.num(v) + " bản ghi" };
        lan.render(ui.readouts([{ k: "Bản ghi sai trong CSDL gốc (" + LAB.num(LAB.data.dan_cu.length) + " bản ghi × " + LAB.pc(S.p) + ")", v: LAB.num(soSai), kind: "eve" }, { k: "Bản sao sai đang tồn tại ở " + S.n + " hệ thống nhận", v: LAB.num(soSai * S.n), kind: "eve" }, { k: "Điểm phải sửa nếu sửa tại nguồn", v: LAB.num(soSai), kind: "ok" }]),
          ui.note("Sửa ở nơi nhận chỉ chữa triệu chứng: bản gốc vẫn sai, lần đồng bộ sau lại ghi đè. Vì vậy Nghị định 278/2025 yêu cầu mọi chia sẻ qua Nền tảng chia sẻ, điều phối dữ liệu để <b>truy vết</b> được nguồn gốc bản ghi và trách nhiệm người tạo lập.", "key"));
        boxThang.draw(); boxK.draw(); boxLan.draw();
      }
      draw(); pane.appendChild(root);
    } },

  /* ============================ TAB 5: Dữ liệu mở 5 sao ============================ */
  /* Đánh giá 4 bộ dữ liệu theo 5 sao Tim Berners-Lee và điều kiện NĐ 194/2025 Điều 27; dò cột dữ liệu cá nhân; đề xuất bộ dữ liệu công bố. */
  { id: "dulieumo", title: "Dữ liệu mở 5 sao", intro: "Đánh giá bộ dữ liệu mở mẫu <b>Điểm phục vụ công cộng Phường Mẫu</b> và ba bộ giả định theo <b>mô hình 5 sao của Tim Berners-Lee</b> và các điều kiện của <b>Nghị định 194/2025/NĐ-CP Điều 27</b>; dò cột dữ liệu cá nhân; rồi đề xuất một bộ dữ liệu đơn vị có thể công bố.",
    build(pane) {
      const KEY = "m5.dulieumo"; const dpv = LAB.data.diem_phuc_vu;
      const capNhatMoiNhat = dpv.map(r => LAB.date.parse(r.ngay_cap_nhat)).filter(Boolean).sort((a, b) => b - a)[0];
      const thangCapNhat = capNhatMoiNhat ? Math.max(0, Math.round((HOM_NAY - capNhatMoiNhat) / (30.44 * 86400000) * 10) / 10) : null;
      const coCongBoMo = dpv.length && dpv.every(r => /Công bố mở/i.test(r.dieu_kien_su_dung || ""));
      /* 5 sao + điều kiện NĐ 194/2025 Điều 27 */
      const SAO = [["s1", "1 sao: đưa lên mạng cho tự do sử dụng (dù chỉ PDF hay ảnh chụp)"], ["s2", "2 sao: có cấu trúc, thiết bị số xử lý được (ví dụ bảng tính Excel)"], ["s3", "3 sao: định dạng mở, không phụ thuộc phần mềm thương mại (ví dụ CSV)"], ["s4", "4 sao: mỗi đối tượng có địa chỉ (mã định danh) riêng để nơi khác trỏ tới"], ["s5", "5 sao: liên kết với dữ liệu của nơi khác để tạo ngữ cảnh"]];
      const DK = [["dactat", "Có dữ liệu đặc tả: nguồn, phạm vi, ý nghĩa từng cột (Điều 28)"], ["capnhat", "Cập nhật trong thời hạn không quá 03 tháng (Điều 27 khoản 2)"], ["canhan", "Không tiết lộ thông tin cá nhân (Điều 27 khoản 2)"], ["congbomo", "Có Công bố mở nêu điều kiện khai thác, sử dụng lại (Điều 26)"]];
      const BO = [
        { id: "dpv", ten: "Điểm phục vụ công cộng Phường Mẫu (CSV, " + dpv.length + " dòng)", cot: LAB.dataHeaders("diem_phuc_vu"), dinhDang: "CSV", mo: "Bộ dữ liệu mở mẫu trong website: trường học, trạm y tế, điểm Một cửa… có toạ độ, giờ mở cửa, tiếp cận người khuyết tật. Cập nhật gần nhất " + (capNhatMoiNhat ? LAB.date.vn(capNhatMoiNhat) : "—") + (thangCapNhat != null ? " (" + LAB.num(thangCapNhat, 1) + " tháng trước)" : "") + ".",
          chk: { s1: true, s2: true, s3: true, s4: true, s5: false, dactat: true, capnhat: thangCapNhat != null && thangCapNhat <= 3, canhan: true, congbomo: !!coCongBoMo } },
        { id: "pdf", ten: "Danh sách hộ nghèo năm 2025 (PDF quét từ bản giấy)", cot: ["stt", "ho_ten_chu_ho", "dia_chi", "so_nhan_khau", "muc_thu_nhap"], dinhDang: "PDF ảnh", mo: "Bản quét quyết định phê duyệt danh sách hộ nghèo đăng trên trang thông tin điện tử của phường.",
          chk: { s1: true, s2: false, s3: false, s4: false, s5: false, dactat: false, capnhat: false, canhan: false, congbomo: false } },
        { id: "xls", ten: "Số hồ sơ tiếp nhận theo tháng (Excel, không ghi điều kiện sử dụng)", cot: ["thang", "linh_vuc", "so_ho_so_tiep_nhan", "so_ho_so_dung_han", "so_ho_so_truc_tuyen"], dinhDang: "XLSX", mo: "Bảng tổng hợp do Văn phòng UBND lập hằng tháng, đăng kèm báo cáo; không có mô tả cột, không có Công bố mở.",
          chk: { s1: true, s2: true, s3: false, s4: false, s5: false, dactat: false, capnhat: true, canhan: true, congbomo: false } },
        { id: "csv", ten: "Trích xuất dân cư (CSV có số định danh, số điện thoại)", cot: LAB.dataHeaders("dan_cu"), dinhDang: "CSV", mo: "Tệp CSV đúng chuẩn kỹ thuật, nhưng mỗi dòng là một người cụ thể với số định danh, ngày sinh, số điện thoại.",
          chk: { s1: true, s2: true, s3: true, s4: true, s5: false, dactat: true, capnhat: true, canhan: false, congbomo: true } },
      ];
      const CA_NHAN = [[/so_dinh_danh|cccd|cmnd|ho_chieu/, "eve", "Số định danh, giấy tờ tuỳ thân: nhận ra một người ngay"], [/ngay_sinh|nam_sinh/, "eve", "Ngày sinh: ghép với tên, địa chỉ là nhận ra một người"], [/ho_ten|ten_chu_ho|ho_va_ten/, "eve", "Họ tên cá nhân"], [/thu_nhap|luong|tai_khoan|benh|suc_khoe|hon_nhan|ton_giao|dan_toc/, "eve", "Dữ liệu cá nhân nhạy cảm (thu nhập, sức khoẻ, hôn nhân…)"], [/dien_thoai|sdt|email/, "key", "Số điện thoại, thư điện tử: nếu là số cơ quan, điểm phục vụ thì được; nếu là số cá nhân thì không"], [/^dia_chi$/, "key", "Địa chỉ: địa chỉ cơ sở công cộng thì được; địa chỉ nhà riêng thì không"]];
      const saved = LAB.store.get(KEY, {});
      const S = { bo: "dpv", chk: Object.assign({}, BO[0].chk), de: Object.assign({ ten: "", hv: "", nguoiDung: "", nhuCau: "Cao", ruiRo: "Thấp", xuLy: "", capNhat: "", chuKy: "Hằng quý", dieuKhoan: "Công bố mở (dùng lại tự do, ghi nguồn)" }, saved.de || {}) };
      const { root, ctrl, view } = ui.sim();
      const tiles = ui.tiles({ items: BO.map(b => ({ id: b.id, title: b.ten, sub: b.dinhDang, kind: b.id === "csv" ? "eve" : "ct" })), value: S.bo, cls: "narrow", onChange: v => { S.bo = v; S.chk = Object.assign({}, BO.find(b => b.id === v).chk); veChecks(); draw(); } });
      const checksBox = h("div", { class: "stack" });
      function veChecks() {
        LAB.clear(checksBox); checksBox.append(ui.title("Thang 5 sao", "bật những mức bộ dữ liệu đạt"), ...SAO.map(s => ui.check({ id: "m5dm-" + s[0], label: s[1], value: !!S.chk[s[0]], onChange: v => { S.chk[s[0]] = v; draw(); } })),
          ui.title("Điều kiện Nghị định 194/2025, Điều 26–28"), ...DK.map(d => ui.check({ id: "m5dm-" + d[0], label: d[1], value: !!S.chk[d[0]], onChange: v => { S.chk[d[0]] = v; draw(); } })));
      }
      veChecks();
      ctrl.append(ui.title("Chọn bộ dữ liệu để đánh giá"), tiles, checksBox,
        h("div", { class: "row" }, ui.btn("Ví dụ mẫu: bộ điểm phục vụ", () => tiles.querySelector("[data-id=dpv]").click(), "sm"), ui.btn("Làm lại", () => { S.chk = Object.assign({}, BO.find(b => b.id === S.bo).chk); veChecks(); draw(); }, "sm")),
        ui.cancu("Nghị định 194/2025/NĐ-CP ngày 03/7/2025, Điều 27 khoản 1", "\"Dữ liệu mở được cung cấp phải bảo đảm chất lượng, có định dạng mở, có khả năng gửi, nhận, lưu trữ, xử lý bằng thiết bị số, bảo đảm khả năng tiếp cận của người sử dụng…\" Khoản 2: không tiết lộ thông tin cá nhân; danh mục dữ liệu mở rà soát định kỳ hằng năm; dữ liệu mở đã công bố phải cập nhật trong thời hạn không quá 03 tháng."),
        ui.cancu("Nghị định 194/2025/NĐ-CP, Điều 29 khoản 3", "\"Cổng dữ liệu quốc gia là đầu mối cung cấp dữ liệu mở trên phạm vi toàn quốc, kết nối với các cổng dữ liệu của các bộ, ngành, địa phương.\" Điều 26: dữ liệu mở được cung cấp theo Công bố mở; Điều 28: tập dữ liệu mở gồm dữ liệu đặc tả và nội dung."),
        ui.cancu("Luật Dữ liệu số 60/2024/QH15, Điều 3 khoản 4 và Điều 21 khoản 4", "Dữ liệu mở \"là dữ liệu mà mọi cơ quan, tổ chức, cá nhân có nhu cầu đều được tiếp cận, chia sẻ, khai thác, sử dụng\". \"Cơ quan nhà nước có trách nhiệm công bố danh mục dữ liệu mở và tổ chức công khai dữ liệu mở\"."));
      const kq = ui.slot(), cot = ui.slot(); view.append(kq, cot,
        h("div", { class: "note eve" }, ui.tag("Bãi bỏ từ 19/8/2025", "eve"), " Các Điều 17–21 (mục dữ liệu mở) của ", h("b", null, "Nghị định 47/2020/NĐ-CP"), " đã bị bãi bỏ bởi Nghị định 194/2025 (Điều 40 khoản 2), sớm hơn thời điểm toàn bộ nghị định hết hiệu lực (22/10/2025). Trích dẫn về dữ liệu mở phải theo Luật Dữ liệu và Nghị định 194/2025, 165/2025."),
        ui.note("Mô hình 5 sao của Tim Berners-Lee (5stardata.info), được Ngân hàng Thế giới dẫn lại trong báo cáo <i>Đánh giá mức độ sẵn sàng về Chính phủ số và Dữ liệu mở cho Việt Nam</i> (02/2019). Đa số cơ quan bắt đầu ở mức 1 sao; đạt 3 sao đã đủ để xã hội khai thác được. <b>Dữ liệu cá nhân không phải là dữ liệu mở</b> — chỉ công bố sau khi ẩn danh hoặc gộp nhóm đủ lớn (Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15, học kỹ ở buổi 8).", "mut"));
      function doCot(bo) { return bo.cot.map(c => { const m = CA_NHAN.find(x => x[0].test(c)); return { c, kind: m ? m[1] : "ok", ly: m ? m[2] : "Không nhận dạng cá nhân" }; }); }
      function draw() {
        const bo = BO.find(b => b.id === S.bo);
        let sao = 0; for (const s of SAO) { if (S.chk[s[0]]) sao++; else break; }
        const dk = DK.filter(d => S.chk[d[0]]).length; const thieu = DK.filter(d => !S.chk[d[0]]);
        const cotCN = doCot(bo); const do_ = cotCN.filter(x => x.kind === "eve"), vang = cotCN.filter(x => x.kind === "key");
        let ketLuan, kind;
        if (!S.chk.canhan || do_.length) { ketLuan = "Không được công bố ở dạng hiện tại: có thông tin cá nhân. Phải ẩn danh hoặc gộp nhóm (xử lý rồi công bố)."; kind = "eve"; }
        else if (sao < 3) { ketLuan = "Mới đạt " + sao + " sao: thiết bị số chưa xử lý được hoặc định dạng chưa mở. Chuyển sang CSV (3 sao) trước khi công bố."; kind = "eve"; }
        else if (thieu.length) { ketLuan = "Đạt " + sao + " sao về kỹ thuật nhưng chưa đủ điều kiện pháp lý: thiếu " + thieu.map(d => d[1].split(":")[0].split(" (")[0].toLowerCase()).join("; ") + "."; kind = "key"; }
        else { ketLuan = "Đủ điều kiện công bố làm dữ liệu mở (" + sao + " sao, đủ " + DK.length + " điều kiện). Đăng trên cổng dữ liệu của tỉnh và gửi Bộ Công an tổng hợp lên Cổng dữ liệu quốc gia (Nghị định 165/2025 Điều 10 khoản 2)."; kind = "ok"; }
        const sc = ui.score(sao, "sao", 5); sc.classList.add(sao >= 3 ? "ok" : "eve");
        kq.render(ui.title("Kết quả đánh giá: " + bo.ten), ui.note(bo.mo, "mut"),
          h("div", { class: "row" }, sc, h("div", { class: "stack", style: { flex: "1 1 220px" } }, ui.readouts([{ k: "Mức sao đạt được", v: "★".repeat(sao) + "☆".repeat(5 - sao), kind: sao >= 3 ? "ok" : "eve", big: true }, { k: "Điều kiện Nghị định 194/2025", v: dk + " / " + DK.length, kind: dk === DK.length ? "ok" : "key" }, { k: "Cột có dấu hiệu dữ liệu cá nhân", v: do_.length + " đỏ · " + vang.length + " vàng", kind: do_.length ? "eve" : "ok" }]), ui.bar({ label: "Mức độ mở", value: sao, max: 5, kind: sao >= 3 ? "ok" : "eve", text: sao + " / 5 sao" }))),
          ui.note("<b>Kết luận:</b> " + ketLuan, kind));
        cot.render(ui.title("Bộ dò cột dữ liệu cá nhân", "đỏ = không được công bố; vàng = phải kiểm tra là thông tin cơ quan hay cá nhân"),
          h("div", { class: "row" }, cotCN.map(x => ui.tag(x.c, x.kind === "ok" ? "mut" : x.kind))),
          ui.table(["Cột", "Đánh giá", "Lý do"], cotCN.filter(x => x.kind !== "ok").map(x => [{ text: x.c, cls: "mono" }, ui.tag(x.kind === "eve" ? "Dữ liệu cá nhân" : "Cần kiểm tra", x.kind), x.ly]).concat(cotCN.every(x => x.kind === "ok") ? [[{ text: "Không có cột nào nhận dạng cá nhân", colspan: 3 }]] : []), { cls: "wrap" }),
          ui.note("Ba câu hỏi trước khi công bố: bảng này có cột nào cho phép nhận ra một người cụ thể không? Ghép với một bộ dữ liệu công khai khác thì có nhận ra được không? Nhóm nhỏ nhất trong bảng có bao nhiêu người — quá ít thì phải gộp.", "key"));
      }
      /* bài tập đề xuất bộ dữ liệu */
      const O = [["Cao", "Thấp", "CÔNG BỐ NGAY", "Nhu cầu cao, rủi ro thấp: danh mục thủ tục, địa điểm dịch vụ công", "ok"], ["Cao", "Cao", "XỬ LÝ RỒI CÔNG BỐ", "Nhu cầu cao nhưng có rủi ro: phải ẩn danh, gộp nhóm trước khi công bố", "key"], ["Thấp", "Thấp", "CÔNG BỐ KHI CÓ NGUỒN LỰC", "Rủi ro thấp nhưng ít người dùng: xếp thứ tự ưu tiên sau", "pt"], ["Thấp", "Cao", "KHÔNG CÔNG BỐ", "Rủi ro cao, nhu cầu thấp: giữ trong phạm vi chia sẻ nội bộ", "eve"]];
      const luuDe = () => LAB.store.set(KEY, { de: S.de });
      const fld = (id, label, key, o = {}) => ui.field(Object.assign({ id: "m5dm-de-" + id, label, value: S.de[key], onInput: v => { S.de[key] = v; luuDe(); veQuad(); } }, o));
      const quad = ui.slot();
      function veQuad() {
        const o = O.find(x => x[0] === S.de.nhuCau && x[1] === S.de.ruiRo);
        quad.render(h("div", { class: "quad" }, [["Cao", "Thấp"], ["Cao", "Cao"], ["Thấp", "Thấp"], ["Thấp", "Cao"]].map(([nc, rr]) => { const c = O.find(x => x[0] === nc && x[1] === rr); const on = c === o; return h("div", { style: on ? { borderStyle: "solid", borderColor: "var(--" + c[4] + ")", background: "var(--" + c[4] + "-bg)" } : null }, h("div", { class: "qt" }, "Nhu cầu " + nc.toLowerCase() + " · rủi ro " + rr.toLowerCase()), h("b", null, c[2]), h("div", { class: "small" }, c[3]), on && S.de.ten ? h("div", { class: "small hl" }, "→ " + S.de.ten) : null); })),
          ui.note("Khuyến nghị cho bộ dữ liệu đề xuất: <b>" + o[2] + "</b>. " + o[3] + ".", o[4] === "eve" ? "eve" : o[4] === "ok" ? "ok" : "key"));
      }
      const segNC = ui.seg({ id: "m5dm-nhucau", label: "Nhu cầu của xã hội", options: [["Cao", "Cao"], ["Thấp", "Thấp"]], value: S.de.nhuCau, onChange: v => { S.de.nhuCau = v; luuDe(); veQuad(); } });
      const segRR = ui.seg({ id: "m5dm-ruiro", label: "Mức độ rủi ro (dữ liệu cá nhân, bí mật nhà nước)", options: [["Thấp", "Thấp"], ["Cao", "Cao"]], value: S.de.ruiRo, onChange: v => { S.de.ruiRo = v; luuDe(); veQuad(); } });
      const fTen = fld("ten", "Tên bộ dữ liệu đề xuất", "ten", { placeholder: "ví dụ: Danh mục điểm phục vụ công cộng" }), fHV = fld("hv", "Họ tên học viên", "hv"), fND = fld("nd", "Ai sẽ dùng, dùng làm gì, đơn vị được lợi gì", "nguoiDung", { type: "textarea", rows: 2 }), fXL = fld("xl", "Rủi ro phải xử lý trước khi công bố và cách xử lý", "xuLy", { type: "textarea", rows: 2 }), fCN = fld("cn", "Ai cập nhật", "capNhat"), fCK = ui.select({ id: "m5dm-de-ck", label: "Chu kỳ cập nhật", options: [["Hằng tháng", "Hằng tháng"], ["Hằng quý", "Hằng quý (tối đa 3 tháng theo Điều 27)"], ["Khi có thay đổi", "Ngay khi có thay đổi"]], value: S.de.chuKy, onChange: v => { S.de.chuKy = v; luuDe(); } }), fDK = fld("dk", "Điều khoản sử dụng (Công bố mở)", "dieuKhoan");
      view.append(ui.panel("Bài tập: đề xuất một bộ dữ liệu đơn vị có thể công bố",
        ui.note("Khung \"Cân nhắc trước khi công bố một bộ dữ liệu\": đặt bộ dữ liệu lên hai trục nhu cầu xã hội và mức độ rủi ro, chọn đúng một bộ ở ô nhu cầu cao, rủi ro thấp hoặc xử lý được. Bài làm tự lưu trên máy.", "mut"),
        h("div", { class: "cols" }, h("div", { class: "stack" }, fHV, fTen, segNC, segRR, fND, fXL, h("div", { class: "grp" }, fCN, fCK), fDK), quad),
        h("div", { class: "row" },
          ui.btn("Ví dụ mẫu", () => { Object.assign(S.de, { ten: "Danh mục điểm phục vụ công cộng Phường Mẫu", nguoiDung: "Người dân tìm trường, trạm y tế, điểm Một cửa gần nhà; doanh nghiệp làm bản đồ; phường giảm số câu hỏi qua điện thoại.", nhuCau: "Cao", ruiRo: "Thấp", xuLy: "Kiểm tra cột điện thoại liên hệ chỉ là số cơ quan; bỏ tên cá nhân phụ trách; ghi ngày cập nhật.", capNhat: "Văn phòng UBND phường", chuKy: "Hằng quý", dieuKhoan: "Công bố mở (dùng lại tự do, ghi nguồn)" }); luuDe(); fTen.input.value = S.de.ten; fND.input.value = S.de.nguoiDung; fXL.input.value = S.de.xuLy; fCN.input.value = S.de.capNhat; fCK.input.value = S.de.chuKy; fDK.input.value = S.de.dieuKhoan; segNC.querySelector(".seg").set("Cao"); segRR.querySelector(".seg").set("Thấp"); veQuad(); }, "sm"),
          ui.btn("Làm lại", () => { Object.assign(S.de, { ten: "", nguoiDung: "", nhuCau: "Cao", ruiRo: "Thấp", xuLy: "", capNhat: "", chuKy: "Hằng quý", dieuKhoan: "Công bố mở (dùng lại tự do, ghi nguồn)" }); luuDe(); [fTen, fND, fXL, fCN].forEach(f => { f.input.value = ""; }); fCK.input.value = S.de.chuKy; fDK.input.value = S.de.dieuKhoan; segNC.querySelector(".seg").set("Cao"); segRR.querySelector(".seg").set("Thấp"); veQuad(); }, "sm"),
          ui.btn("Tải CSV đề xuất", () => { const bo = BO.find(b => b.id === S.bo); let sao = 0; for (const s of SAO) { if (S.chk[s[0]]) sao++; else break; } const o = O.find(x => x[0] === S.de.nhuCau && x[1] === S.de.ruiRo);
            LAB.csv.download("bai5_de_xuat_du_lieu_mo_" + (LAB.khongDau(S.de.hv).replace(/\s+/g, "_") || "hoc_vien") + ".csv", ["muc", "noi_dung"], [["Học viên", S.de.hv], ["Bộ dữ liệu đã đánh giá", bo.ten], ["Số sao đánh giá", sao], ["Điều kiện NĐ 194/2025 đạt", DK.filter(d => S.chk[d[0]]).map(d => d[1]).join(" | ")], ["Bộ dữ liệu đề xuất công bố", S.de.ten], ["Ai dùng, dùng làm gì", S.de.nguoiDung], ["Nhu cầu xã hội", S.de.nhuCau], ["Mức độ rủi ro", S.de.ruiRo], ["Khuyến nghị theo khung", o[2]], ["Rủi ro phải xử lý", S.de.xuLy], ["Người cập nhật", S.de.capNhat], ["Chu kỳ cập nhật", S.de.chuKy], ["Điều khoản sử dụng", S.de.dieuKhoan]]); }, "sm pri"))));
      veQuad(); draw(); pane.appendChild(root);
    } },
  ]
});
})();
