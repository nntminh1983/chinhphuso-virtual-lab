/* Mô-đun m1 — Buổi 1: Tổng quan về Chính phủ số (Bài 1).
   Năm tab: bảy nấc phát triển (kèm bài tập xếp tình huống), CPĐT và CPS (bảy điểm khác biệt trên một hành trình hồ sơ),
   năm yếu tố cấu thành (tự soi, radar), Việt Nam trên bản đồ EGDI (biểu đồ + máy tính EGDI), hồ sơ giấy và hồ sơ số (từ sổ hồ sơ Phường Mẫu).
   Căn cứ: NQ 57-NQ/TW, QĐ 942/QĐ-TTg, QĐ 1266/QĐ-TTg, NĐ 118/2025/NĐ-CP, NĐ 320/2026/NĐ-CP, Luật TCTT 104/2016/QH13, QĐ 292/QĐ-BKHCN; số liệu EGDI theo CANCU.md mục F. */
(function () { "use strict";
const { h, ui, chart } = LAB;

/* ============================================================ dữ liệu dùng chung ============================================================ */
/* Bảy nấc phát triển — theo slide "Bảy nấc phát triển, không bỏ nấc nào" (Bài 1, phần 2) */
const NAC = [
  { n: 1, ten: "Số hoá", en: "digitisation", kind: "ct",
    mota: "Chuyển tài liệu, hồ sơ từ bản giấy sang bản điện tử.",
    vidu: "Quét sổ hộ tịch cũ thành tệp ảnh lưu trên máy; chụp giấy tờ người dân nộp, lưu vào thư mục hồ sơ điện tử.",
    gioihan: "Cách làm việc không đổi, chỉ đổi phương tiện ghi chép. Tệp quét khó tìm lại, chưa thành dữ liệu có cấu trúc.",
    thuocdo: "Số trang, số hồ sơ đã quét.",
    hoi: "Hồ sơ giấy của đơn vị đã được quét lưu điện tử chưa? Tìm lại một hồ sơ cũ mất bao lâu?" },
  { n: 2, ten: "Tin học hoá", en: "computerisation", kind: "ct",
    mota: "Đưa quy trình nghiệp vụ đang có lên phần mềm.",
    vidu: "Phần mềm ghi sổ tiếp nhận thay cho sổ viết tay; bảng tính theo dõi hộ nghèo thay sổ giấy.",
    gioihan: "Dữ liệu vẫn nằm trong từng phần mềm, khó dùng lại; quy trình cũ được giữ nguyên.",
    thuocdo: "Số quy trình đã có phần mềm.",
    hoi: "Phần mềm của đơn vị có trao đổi được dữ liệu với nhau không, hay mỗi phần mềm một sổ riêng?" },
  { n: 3, ten: "Chính phủ điện tử", en: "e-government", kind: "aqua",
    mota: "Chính phủ ứng dụng công nghệ thông tin và truyền thông để nâng hiệu lực, hiệu quả; công khai, minh bạch. Trọng tâm là cung cấp dịch vụ công trực tuyến cho dân.",
    vidu: "Quy trình cũ được tin học hoá, hồ sơ nhận qua mạng; người dân nộp hồ sơ trên cổng rồi cán bộ tải về xử lý như cũ.",
    gioihan: "Mỗi hệ thống giữ dữ liệu riêng, người dân vẫn khai lại thông tin nhiều lần.",
    thuocdo: "Số lượng dịch vụ công trực tuyến.",
    hoi: "Bao nhiêu phần trăm hồ sơ của đơn vị được nộp trực tuyến? Người dân có còn phải khai lại thông tin đã có?",
    cancu: ["Quyết định 942/QĐ-TTg ngày 15/6/2021 của Thủ tướng Chính phủ", "Chiến lược phát triển Chính phủ điện tử hướng tới Chính phủ số giai đoạn 2021–2025, định hướng đến 2030."] },
  { n: 4, ten: "Chính phủ mở", en: "open government", kind: "key",
    mota: "Chủ động công khai thông tin để người dân giám sát; người dân có quyền tiếp cận thông tin của cơ quan.",
    vidu: "Công khai dự toán, quyết toán ngân sách, lịch tiếp công dân, kết quả giải quyết thủ tục hành chính trên trang thông tin điện tử.",
    gioihan: "Thông tin công khai ở dạng để đọc (văn bản, bản quét), chưa phải dữ liệu để máy xử lý lại.",
    thuocdo: "Số loại thông tin được công khai đúng quy định.",
    hoi: "Danh mục thông tin phải công khai của đơn vị đã đủ chưa, cập nhật lần cuối khi nào?",
    cancu: ["Luật Tiếp cận thông tin số 104/2016/QH13, hiệu lực 01/7/2018", "Công dân có quyền tiếp cận thông tin của cơ quan nhà nước theo quy định của Luật."] },
  { n: 5, ten: "Chính phủ dữ liệu mở", en: "open data government", kind: "key",
    mota: "Công bố dữ liệu ở dạng máy đọc được, ai cũng dùng lại được; doanh nghiệp dựa vào đó tạo dịch vụ mới cho xã hội.",
    vidu: "Dữ liệu quy hoạch, giá đất, cơ sở khám chữa bệnh; danh sách điểm phục vụ kèm toạ độ dạng bảng CSV.",
    gioihan: "Ranh giới phải giữ: không mở dữ liệu cá nhân, dữ liệu thuộc bí mật nhà nước.",
    thuocdo: "Số bộ dữ liệu mở và số lượt dùng lại.",
    hoi: "Đơn vị có bộ dữ liệu nào người ngoài tải về dùng lại được không (không phải tệp để đọc)?",
    cancu: ["Luật Tiếp cận thông tin số 104/2016/QH13, hiệu lực 01/7/2018", "Mở dữ liệu nhưng không mở dữ liệu cá nhân và dữ liệu thuộc bí mật nhà nước."] },
  { n: 6, ten: "Chính phủ số", en: "digital government", kind: "pt",
    mota: "Chính phủ có toàn bộ hoạt động an toàn trên môi trường số; mô hình vận hành được thiết kế lại dựa trên dữ liệu và công nghệ số.",
    vidu: "Dữ liệu dân cư, hộ tịch, cư trú điền sẵn vào tờ khai; ký số, trả kết quả điện tử; cắt giảm giấy tờ phải nộp; lãnh đạo quyết định dựa trên bảng theo dõi tính từ dữ liệu.",
    gioihan: "Bốn kết quả kỳ vọng: dịch vụ chất lượng hơn, quyết định kịp thời hơn, chính sách tốt hơn, nguồn lực dùng tối ưu hơn.",
    thuocdo: "Số thủ tục cắt giảm, số dịch vụ mới, mức độ mở dữ liệu — khác hẳn Chính phủ điện tử.",
    hoi: "Năm qua đơn vị đã cắt được giấy tờ, bước nào nhờ dùng lại dữ liệu đã có?",
    cancu: ["Quyết định 942/QĐ-TTg ngày 15/6/2021 của Thủ tướng Chính phủ", "Chính phủ số bao hàm Chính phủ điện tử, là mức độ trưởng thành cao hơn, không thay thế."] },
  { n: 7, ten: "Chính phủ thông minh", en: "smart government", kind: "ok",
    mota: "Dịch vụ chủ động, có tính dự báo, được tối ưu liên tục.",
    vidu: "Cơ quan nhắc trước khi giấy tờ công dân hết hạn; dự báo số hồ sơ an sinh quý tới để bố trí cán bộ.",
    gioihan: "Chỉ đạt được khi sáu nấc dưới đã vững: dữ liệu đúng, đủ, sạch, sống và chia sẻ được.",
    thuocdo: "Tỉ lệ dịch vụ được cung cấp chủ động, không cần người dân đề nghị.",
    hoi: "Đơn vị có biết trước người dân nào sắp cần một thủ tục (đủ tuổi, hết hạn giấy tờ) để chủ động phục vụ không?" },
];
/* Bài tập xếp tình huống ở Phường Mẫu vào nấc (hư cấu) */
const TINHHUONG = [
  { th: "Quét toàn bộ sổ hộ tịch giấy giai đoạn 1990–2010 thành tệp PDF lưu trên máy chủ của phường.", nac: 1, gt: "Chỉ đổi phương tiện lưu trữ từ giấy sang tệp; cách tra cứu, xử lý không đổi." },
  { th: "Dùng phần mềm một cửa để ghi nhận hồ sơ thay cho sổ viết tay; quy trình xử lý giữ nguyên như trước.", nac: 2, gt: "Đưa quy trình sẵn có lên phần mềm, dữ liệu nằm trong phần mềm đó." },
  { th: "Người dân nộp hồ sơ đăng ký tạm trú qua Cổng Dịch vụ công quốc gia; cán bộ tải về, in ra và xử lý như hồ sơ giấy.", nac: 3, gt: "Có dịch vụ công trực tuyến nhưng quy trình phía sau vẫn là quy trình cũ được tin học hoá." },
  { th: "Phường đăng dự toán, quyết toán ngân sách và lịch tiếp công dân lên trang thông tin điện tử dưới dạng văn bản để người dân đọc.", nac: 4, gt: "Chủ động công khai thông tin để dân giám sát; thông tin ở dạng để đọc, chưa phải dữ liệu máy đọc được." },
  { th: "Công khai danh sách điểm phục vụ hành chính công kèm toạ độ, giờ mở cửa dưới dạng bảng CSV cho ai cũng tải về dùng lại.", nac: 5, gt: "Dữ liệu ở dạng máy đọc được, không chứa dữ liệu cá nhân, xã hội khai thác lại được." },
  { th: "Hồ sơ khai sinh: dữ liệu cha mẹ điền sẵn từ cơ sở dữ liệu dân cư, ký số, trả kết quả điện tử; phường bỏ được hai giấy tờ phải nộp.", nac: 6, gt: "Thiết kế lại cách phục vụ dựa trên dữ liệu dùng lại; thước đo là số giấy tờ, thủ tục cắt giảm." },
  { th: "Hệ thống tự nhắc công dân sắp đủ tuổi hưởng trợ cấp người cao tuổi và dự báo số hồ sơ an sinh quý tới để bố trí cán bộ.", nac: 7, gt: "Dịch vụ chủ động, có tính dự báo — đặc trưng của Chính phủ thông minh." },
  { th: "Cán bộ dùng bảng tính thay sổ theo dõi hộ nghèo; mỗi kỳ báo cáo lại nhập số liệu từ đầu.", nac: 2, gt: "Tin học hoá việc ghi chép; dữ liệu không dùng lại được nên vẫn nhập lại." },
  { th: "Phường đăng báo cáo kết quả giải quyết thủ tục hành chính hằng tháng (tệp PDF) để người dân theo dõi.", nac: 4, gt: "Công khai để giám sát; tệp PDF là để đọc, chưa phải dữ liệu mở." },
  { th: "Chụp ảnh giấy tờ người dân nộp tại quầy rồi lưu vào thư mục hồ sơ điện tử của từng người.", nac: 1, gt: "Số hoá tài liệu: ảnh chụp chưa thành dữ liệu có cấu trúc để hệ thống khác dùng." },
];
/* Bảy điểm khác biệt — theo slide "Bảy điểm khác biệt: bảng tra nhanh" và bài viết 7diemkhacbiet */
const DIEM7 = [
  { tc: "Vai trò", ten: "Chính phủ như một nền tảng", cu: "Cung cấp dịch vụ để quản lý; mỗi dịch vụ một hệ thống riêng lẻ", moi: "Nền tảng kiến tạo phát triển; mọi dịch vụ chạy trên nền tảng dùng chung",
    kb: (t, m) => m === "cpdt" ? "Phường tự mua phần mềm riêng để tiếp nhận «" + t.ten + "»; dữ liệu nằm lại trong phần mềm đó." : "«" + t.ten + "» được cung cấp trên Cổng Dịch vụ công quốc gia và nền tảng dùng chung; phường không xây hệ thống riêng." },
  { tc: "Kênh phục vụ", ten: "Tích hợp đa kênh trực tuyến và trực tiếp", cu: "Trực tuyến và trực tiếp là hai quy trình tách rời", moi: "Tích hợp đa kênh, liền mạch; nộp kênh này, nhận kênh khác",
    kb: (t, m) => m === "cpdt" ? "Nộp kênh nào thì nhận kết quả kênh đó; nộp trực tuyến vẫn phải đến quầy đối chiếu bản giấy." : "Nộp trực tuyến ở bất cứ đâu, nhận bản điện tử hoặc qua bưu chính; nộp tại quầy vẫn tra cứu được tiến độ trực tuyến." },
  { tc: "Tốc độ", ten: "Linh hoạt, nhanh chóng cung cấp dịch vụ mới", cu: "Ra dịch vụ mới sau vài tháng", moi: "Ra dịch vụ mới sau vài ngày",
    kb: (t, m) => m === "cpdt" ? "Thêm một dịch vụ mới phải viết phần mềm mới, mất vài tháng." : "Cấu hình thêm dịch vụ trên nền tảng sẵn có, mất vài ngày." },
  { tc: "Sự tham gia", ten: "Người dân, doanh nghiệp cùng tham gia", cu: "Người dân nhận kết quả thụ động", moi: "Dân, doanh nghiệp cùng tạo; góp ý, phản ánh là một phần quy trình",
    kb: (t, m) => m === "cpdt" ? "Người dân nhận kết quả, không có kênh đánh giá." : "Người dân chấm điểm hài lòng từng hồ sơ (cột hai_long_1_5 trong sổ hồ sơ); doanh nghiệp dùng dữ liệu mở làm dịch vụ gia tăng." },
  { tc: "Ra quyết định", ten: "Dữ liệu là trung tâm", cu: "Dựa trên báo cáo giấy", moi: "Dựa trên dữ liệu phân tích, tổng hợp tự động từ nhiều nguồn",
    kb: (t, m) => m === "cpdt" ? "Cán bộ nhập lại thông tin từ giấy tờ vào từng hệ thống; lãnh đạo xem báo cáo giấy cuối tháng." : "Thông tin điền sẵn từ cơ sở dữ liệu quốc gia về dân cư, hộ tịch, cư trú; lãnh đạo xem bảng theo dõi tính từ dữ liệu hồ sơ." },
  { tc: "Kỹ năng cán bộ", ten: "Phát triển kỹ năng số", cu: "Biết dùng phần mềm", moi: "Thêm kỹ năng đọc, phân tích, dùng dữ liệu; phối hợp giữa các bộ phận",
    kb: (t, m) => m === "cpdt" ? "Cán bộ biết thao tác trên phần mềm một cửa." : "Cán bộ đọc được dữ liệu: hồ sơ nào trễ hạn, vì sao phải bổ sung, khâu nào cần sửa." },
  { tc: "Công nghệ", ten: "Ứng dụng công nghệ mới", cu: "Đáp ứng yêu cầu nghiệp vụ; nâng cấp theo chu kỳ nhiều năm", moi: "Dẫn dắt, thích ứng liên tục; trợ lý ảo, phân tích dữ liệu lớn",
    kb: (t, m) => m === "cpdt" ? "Phần mềm nâng cấp vài năm một lần theo dự án." : "Trợ lý ảo hướng dẫn kê khai; Cổng quốc gia kiểm tra tự động thành phần hồ sơ và phản hồi ngay." },
];
/* Giả định mô phỏng về thành phần hồ sơ theo lĩnh vực (hư cấu, để minh hoạ "khai một lần"): nhóm giấy tờ đã có trong CSDL quốc gia và nhóm đặc thù */
const GIAYTO_CSDL = ["Căn cước / tài khoản định danh", "Giấy xác nhận cư trú", "Giấy tờ hộ tịch (khai sinh, kết hôn)"];
const GIAYTO_LV = {
  "Hộ tịch": { csdl: 3, dt: ["Giấy chứng sinh / giấy báo tử / giấy tờ gốc"] },
  "Chứng thực": { csdl: 1, dt: ["Bản chính để đối chiếu"] },
  "Cư trú": { csdl: 3, dt: ["Giấy tờ chứng minh chỗ ở hợp pháp"] },
  "Kinh doanh": { csdl: 2, dt: ["Giấy tờ về địa điểm kinh doanh"] },
  "Đất đai": { csdl: 3, dt: ["Giấy chứng nhận quyền sử dụng đất", "Hợp đồng, văn bản giao dịch", "Bản vẽ, sơ đồ thửa đất"] },
  "Xây dựng": { csdl: 3, dt: ["Giấy tờ về quyền sử dụng đất", "Bản vẽ thiết kế", "Cam kết an toàn công trình lân cận", "Giấy tờ khác theo quy định"] },
  "An sinh xã hội": { csdl: 3, dt: ["Giấy tờ chứng minh điều kiện hưởng", "Giấy tờ liên quan khác"] },
  "Tư pháp": { csdl: 3, dt: ["Văn bản cử, đề nghị giám hộ"] },
  "Giáo dục": { csdl: 2, dt: ["Giấy tờ liên quan khác"] },
};
/* Năm yếu tố cấu thành — bảng "Năm yếu tố: câu hỏi tự soi cho đơn vị" (slide) và gợi ý ưu tiên từ slide "Gợi ý hướng trả lời" */
const YEUTO = [
  { id: "dulieu", ten: "Dữ liệu", kind: "ct", hoi: "Dữ liệu của đơn vị đang nằm ở đâu, ai chịu trách nhiệm?", goiy: "Làm sạch dữ liệu đang có; thống nhất một đầu mối nhập liệu; xác định người chịu trách nhiệm từng bộ dữ liệu. Dữ liệu phải đúng, đủ, sạch, sống và chia sẻ được." },
  { id: "congnghe", ten: "Công nghệ", kind: "aqua", hoi: "Các hệ thống đang dùng có kết nối được với nhau không?", goiy: "Không xây thêm hệ thống riêng lẻ; dùng nền tảng dùng chung quốc gia và của tỉnh; chọn công nghệ theo bài toán nghiệp vụ, không theo trào lưu." },
  { id: "dichvu", ten: "Dịch vụ", kind: "pt", hoi: "Người dân mất bao nhiêu bước để xong một thủ tục?", goiy: "Rà soát, công khai đủ thông tin thủ tục trên Cổng quốc gia; đo bằng số bước, thời gian chờ, số lần đi lại; hỏi 'thông tin nào cơ quan đã có, không cần hỏi lại?'." },
  { id: "connguoi", ten: "Con người", kind: "ok", hoi: "Bao nhiêu cán bộ tự tin xử lý hồ sơ hoàn toàn trên mạng?", goiy: "Tập huấn nội bộ cho cán bộ tiếp nhận hồ sơ; người đứng đầu trực tiếp vào cuộc; bố trí cán bộ chuyên trách." },
  { id: "quantri", ten: "Quản trị", kind: "key", hoi: "Ai theo dõi tiến độ và đo bằng chỉ tiêu cụ thể nào?", goiy: "Giao một đầu mối theo dõi; ban hành quy chế nội bộ, phân công rõ ai quyết định, ai làm, ai kiểm tra; đo bằng tỉ lệ hồ sơ trực tuyến, thời gian xử lý, mức hài lòng." },
];
const MUC5 = ["", "Rất yếu", "Yếu", "Trung bình", "Khá", "Tốt"];
/* Nhóm EGDI theo ngưỡng điểm */
function nhomEGDI(v) { return v >= 0.75 ? ["Rất cao", "ok"] : v >= 0.5 ? ["Cao", "pt"] : v >= 0.25 ? ["Trung bình", "key"] : ["Thấp", "eve"]; }
const safeName = s => String(s || "").slice(0, 80);
const mix = (varName, pct) => "color-mix(in srgb, var(--" + varName + ") " + pct + "%, var(--sunk))";

LAB.module({
  id: "m1",
  tabs: [
    /* ============================================================ TAB 1: BẢY NẤC ============================================================ */
    { id: "baynac", title: "Bảy nấc phát triển",
      intro: "Thang bảy nấc từ <b>số hoá</b> tới <b>Chính phủ thông minh</b> (slide \"Bảy nấc phát triển, không bỏ nấc nào\"). Bấm từng nấc để xem đặc trưng, ví dụ hành chính và câu hỏi tự soi; sau đó xếp 10 tình huống ở Phường Mẫu vào đúng nấc.",
      build(pane) {
        /* Chú thích: thang nấc dựng bằng DOM (lưới 7 cột, chiều cao tăng dần); bài tập dùng ô chọn, chấm đúng/sai, lưu LAB.store, tải CSV. */
        const saved = LAB.store.get("m1.baynac", {}) || {};
        const S = { nac: saved.nac || 3, ten: saved.ten || "", chon: Array.isArray(saved.chon) && saved.chon.length === TINHHUONG.length ? saved.chon.slice() : TINHHUONG.map(() => 0), cham: !!saved.cham };
        const save = () => LAB.store.set("m1.baynac", { nac: S.nac, ten: S.ten, chon: S.chon, cham: S.cham });
        const { root, view } = ui.sim({ wide: true });
        /* --- thang nấc --- */
        const ladder = h("div", { style: { display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "6px", alignItems: "end" } });
        const stepBtns = NAC.map((nc, i) => h("button", { type: "button", id: "m1bn-nac" + nc.n, title: nc.ten,
          style: { minWidth: 0, height: (64 + i * 20) + "px", display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start", gap: "2px", padding: "6px 6px", border: "1px solid var(--line)", borderRadius: "6px 6px 0 0", cursor: "pointer", color: "var(--ink)", textAlign: "left", background: mix(nc.kind, 18 + i * 6) },
          onclick: () => { S.nac = nc.n; paint(); save(); } },
          h("b", { style: { fontFamily: "var(--f-mono)", fontSize: "13px" } }, String(nc.n)),
          h("span", { style: { fontSize: "11.5px", lineHeight: "1.25", wordBreak: "break-word", color: "var(--soft)" } }, nc.ten)));
        stepBtns.forEach(b => ladder.appendChild(b));
        const detail = ui.slot();
        function paint() {
          stepBtns.forEach((b, i) => { const on = NAC[i].n === S.nac; b.style.boxShadow = on ? "inset 0 0 0 2px var(--key)" : "none"; b.style.borderColor = on ? "var(--key)" : "var(--line)"; });
          const nc = NAC.find(x => x.n === S.nac);
          const kv = h("dl", { class: "kv" },
            h("dt", null, "Đặc trưng"), h("dd", { style: { fontFamily: "var(--f-body)" } }, nc.mota),
            h("dt", null, "Ví dụ hành chính"), h("dd", { style: { fontFamily: "var(--f-body)" } }, nc.vidu),
            h("dt", null, nc.n >= 4 && nc.n <= 6 ? "Kết quả / ranh giới" : "Giới hạn"), h("dd", { style: { fontFamily: "var(--f-body)" } }, nc.gioihan),
            h("dt", null, "Thước đo"), h("dd", { style: { fontFamily: "var(--f-body)" } }, nc.thuocdo));
          detail.render(
            ui.title("Nấc " + nc.n + ". " + nc.ten, nc.en),
            h("div", { class: "row" }, ui.tag(nc.n <= 2 ? "Đổi phương tiện, chưa đổi cách làm" : nc.n === 3 ? "Tin học hoá quy trình cũ, thêm kênh trực tuyến" : nc.n <= 5 ? "Công khai, mở để xã hội giám sát và dùng lại" : nc.n === 6 ? "Thiết kế lại cách vận hành dựa trên dữ liệu" : "Chủ động, dự báo", nc.kind)),
            kv,
            ui.note("<b>Câu hỏi tự soi:</b> " + nc.hoi, "key"),
            nc.cancu ? ui.cancu(nc.cancu[0], nc.cancu[1]) : null,
            nc.n === 6 ? ui.note("Chính phủ số <b>bao hàm</b> Chính phủ điện tử, không thay thế và không tách rời; nấc sau kế thừa kết quả của nấc trước, không bỏ qua nấc nào. Nhiều đơn vị đang đứng ở nấc 2 và nấc 3, chưa phải nấc 6.", "mut") : null);
        }
        /* --- bài tập xếp tình huống --- */
        const nameF = ui.field({ id: "m1bn-ten", label: "Họ tên học viên", value: S.ten, placeholder: "Nguyễn Văn A", onInput: v => { S.ten = safeName(v); save(); } });
        const selects = TINHHUONG.map((t, i) => ui.select({ id: "m1bn-th" + (i + 1), label: "Chọn nấc", options: [[0, "— chưa chọn —"], ...NAC.map(n => [n.n, n.n + ". " + n.ten])], value: S.chon[i], onChange: v => { S.chon[i] = +v; S.cham = false; save(); drawEx(); } }));
        const exOut = ui.slot();
        function drawEx() {
          const rows = TINHHUONG.map((t, i) => { const c = S.chon[i]; const ok = c === t.nac;
            return [{ html: String(i + 1), cls: "c" }, h("div", { style: { whiteSpace: "normal", minWidth: "260px" } }, t.th), selects[i],
              S.cham ? (c ? ui.tag(ok ? "Đúng" : "Sai — nấc " + t.nac, ok ? "ok" : "eve") : ui.tag("Bỏ trống", "mut")) : ui.tag("Chưa chấm", "mut"),
              h("div", { class: "small", style: { whiteSpace: "normal", minWidth: "220px" } }, S.cham ? t.gt : "")]; });
          const dung = TINHHUONG.filter((t, i) => S.chon[i] === t.nac).length, daChon = S.chon.filter(Boolean).length;
          exOut.render(
            ui.table(["#", "Tình huống ở Phường Mẫu", "Nấc anh/chị chọn", "Kết quả", "Giải thích"], rows, { cls: "wrap", rowCls: (r, i) => S.cham ? (S.chon[i] === TINHHUONG[i].nac ? "good" : "bad") : null }),
            h("div", { class: "row" },
              ui.readouts([{ k: "Đã chọn", v: daChon + "/" + TINHHUONG.length, kind: "pt" }, S.cham ? { k: "Số câu đúng", v: dung + "/" + TINHHUONG.length, kind: dung >= 8 ? "ok" : dung >= 5 ? "key" : "eve", big: true } : null].filter(Boolean))),
            S.cham ? ui.note(dung === TINHHUONG.length ? "Rất tốt: anh/chị phân biệt rõ bảy nấc. Lưu ý thực tế: một đơn vị thường đứng ở nhiều nấc cùng lúc tuỳ từng việc." : dung >= 7 ? "Khá. Hay nhầm nhất là nấc 4 với nấc 5 (công khai để đọc khác với dữ liệu để máy dùng lại) và nấc 3 với nấc 6 (có cổng trực tuyến chưa phải là Chính phủ số)." : "Hãy đọc lại phần đặc trưng của từng nấc ở trên: hỏi \"cách làm việc có đổi không?\" (nấc 1–3) và \"dữ liệu có được dùng lại không?\" (nấc 5–7).", dung >= 7 ? "ok" : "eve") : null);
        }
        const cham = () => { if (S.chon.some(c => !c)) { exOut.prepend(ui.note("Còn tình huống chưa chọn nấc; vẫn chấm nhưng ô trống tính là sai.", "eve")); } S.cham = true; save(); drawEx(); };
        const lamlai = () => { S.chon = TINHHUONG.map(() => 0); S.cham = false; selects.forEach(s => { s.input.value = "0"; }); save(); drawEx(); };
        const vidu = () => { const mau = [1, 2, 3, 4, 5, 6, 7, 2, 5, 1]; S.chon = mau.slice(); selects.forEach((s, i) => { s.input.value = String(mau[i]); }); S.cham = true; save(); drawEx(); };
        const taiCSV = () => { const rows = TINHHUONG.map((t, i) => [S.ten, i + 1, t.th, S.chon[i] ? S.chon[i] + ". " + NAC[S.chon[i] - 1].ten : "", t.nac + ". " + NAC[t.nac - 1].ten, S.chon[i] === t.nac ? "Đúng" : "Sai", t.gt]);
          LAB.csv.download("m1_bay_nac_" + (LAB.khongDau(S.ten).replace(/\s+/g, "_") || "hoc_vien") + ".csv", ["ho_ten", "tt", "tinh_huong", "nac_chon", "nac_dung", "ket_qua", "giai_thich"], rows); };
        view.append(
          ui.panel("Thang bảy nấc — bấm vào từng nấc", h("div", { class: "small" }, "Đọc từ trái sang phải, từ thấp lên cao: nấc sau kế thừa kết quả của nấc trước."), ladder, detail),
          ui.panel("Bài tập: xếp 10 tình huống ở Phường Mẫu vào đúng nấc",
            h("div", { class: "cols" }, nameF, h("div", { class: "fld" }, h("label", null, h("b", null, "Thao tác")), h("div", { class: "row" }, ui.btn("Chấm bài", cham, "pri"), ui.btn("Làm lại", lamlai), ui.btn("Tải CSV kết quả", taiCSV)))),
            ui.presets([{ label: "Ví dụ mẫu (một bài làm có 1 lỗi)", apply: vidu }], "Ví dụ mẫu"),
            exOut,
            ui.warn("Các tình huống là hư cấu, dùng để luyện cách phân loại. Bài làm được lưu trên máy này và có thể tải về để nộp.")));
        paint(); drawEx(); pane.appendChild(root);
      } },

    /* ============================================================ TAB 2: CPĐT VÀ CPS ============================================================ */
    { id: "haimohinh", title: "Chính phủ điện tử và Chính phủ số",
      intro: "Bảy điểm khác biệt (slide \"Bảy điểm khác biệt: bảng tra nhanh\") đặt lên <b>một hành trình hồ sơ</b> cụ thể của Phường Mẫu. Gạt công tắc CPĐT ↔ CPS để thấy cách làm cũ, cách làm mới và các con số thay đổi.",
      build(pane) {
        /* Chú thích: số giấy tờ, số lần nhập lại, số kênh, số lần đi lại tính từ bảng thủ tục (LAB.data.thu_tuc) và giả định mô phỏng theo lĩnh vực. */
        const TT = LAB.data.thu_tuc;
        const S = { ma: "HT01", mode: "cpdt" };
        const { root, ctrl, view } = ui.sim();
        const kpi = LAB.data.kpi; const kq = kpi[kpi.length - 1];
        const seg = ui.seg({ id: "m1hm-mode", label: "Mô hình", options: [["cpdt", "Chính phủ điện tử"], ["cps", "Chính phủ số"]], value: S.mode, onChange: v => { S.mode = v; draw(); } });
        const sel = ui.select({ id: "m1hm-tt", label: "Thủ tục (kịch bản hành trình hồ sơ)", options: TT.map(t => [t.ma, t.ma + " · " + t.ten]), value: S.ma, onChange: v => { S.ma = v; draw(); } });
        const setTT = (ma, mode) => { S.ma = ma; S.mode = mode; sel.input.value = ma; seg.querySelector(".seg").set(mode); draw(); };
        ctrl.append(seg, sel,
          ui.presets([{ label: "Khai sinh — cách cũ", apply: () => setTT("HT01", "cpdt") }, { label: "Khai sinh — cách mới", apply: () => setTT("HT01", "cps") }, { label: "Biến động đất đai (một phần)", apply: () => setTT("DD01", "cps") }, { label: "Chứng thực bản sao", apply: () => setTT("CT01", "cps") }]),
          ui.btn("Làm lại", () => setTT("HT01", "cpdt")),
          ui.cancu("Quyết định 942/QĐ-TTg ngày 15/6/2021 của Thủ tướng Chính phủ", "Chính phủ số bao hàm Chính phủ điện tử; là mức độ trưởng thành cao hơn, không thay thế."),
          ui.cancu("Nghị định 320/2026/NĐ-CP ngày 13/8/2026 (hiệu lực 28/9/2026), sửa Nghị định 69/2024/NĐ-CP", "Không được yêu cầu nộp giấy tờ khi dữ liệu đã được tích hợp trong hệ thống định danh và xác thực điện tử."),
          ui.note("Thành phần hồ sơ trong tab này là <b>giả định mô phỏng</b> theo lĩnh vực, không phải danh mục pháp lý của thủ tục.", "mut"));
        const out = ui.slot();
        function tinh(t, mode) {
          const g = GIAYTO_LV[t.linh_vuc] || { csdl: 2, dt: ["Giấy tờ liên quan khác"] }; const toan = t.muc_do === "Toàn trình";
          const csdl = GIAYTO_CSDL.slice(0, g.csdl);
          const gt = [{ ten: "Tờ khai theo mẫu", nhom: "khai" }, ...csdl.map(x => ({ ten: x, nhom: "csdl" })), ...g.dt.map(x => ({ ten: x, nhom: "dt" }))];
          const nop = gt.map(x => ({ ...x, nop: mode === "cpdt" ? true : x.nhom !== "csdl", cach: mode === "cpdt" ? (x.nhom === "khai" ? "Khai tay / điền lại toàn bộ" : "Nộp bản giấy hoặc bản quét") : (x.nhom === "khai" ? "Điền sẵn từ dữ liệu, chỉ ký số xác nhận" : x.nhom === "csdl" ? "Không nộp — cơ quan tra cứu từ CSDL quốc gia" : "Đính kèm bản điện tử" + (toan ? "" : "; bản chính đối chiếu khi nhận")) }));
          return { gt: nop, soGiayTo: nop.filter(x => x.nop).length, nhapLai: mode === "cpdt" ? 1 + g.csdl : 1, kenh: mode === "cpdt" ? 1 : 3, diLai: mode === "cpdt" ? 2 : (toan ? 0 : 1), raDV: mode === "cpdt" ? "vài tháng" : "vài ngày", toan };
        }
        function draw() {
          const t = TT.find(x => x.ma === S.ma) || TT[0]; const cu = tinh(t, "cpdt"), moi = tinh(t, "cps"); const cur = S.mode === "cpdt" ? cu : moi; const isNew = S.mode === "cps";
          const delta = (a, b) => a === b ? "" : (b < a ? " (−" + (a - b) + ")" : " (+" + (b - a) + ")");
          const hanhtrinh = [
            { t: "<b>Chọn thủ tục</b>", r: isNew ? "Tra một địa chỉ duy nhất: Cổng Dịch vụ công quốc gia (dichvucong.gov.vn)" : "Tìm trên trang của từng cơ quan; mỗi nơi một mẫu, một cách" },
            { t: "<b>Xác thực</b>", r: isNew ? "Đăng nhập bằng tài khoản định danh điện tử; thông tin cá nhân điền sẵn" : "Đăng ký tài khoản riêng cho từng cổng; tự gõ lại thông tin" },
            { t: "<b>Nộp hồ sơ</b>", r: isNew ? "Nộp " + moi.soGiayTo + " loại giấy tờ (bản điện tử), ký số; " + (moi.toan ? "không phải đến quầy" : "đến quầy 1 lần khi nhận kết quả để đối chiếu") + "; phí " + LAB.vnd(t.le_phi) + (t.le_phi ? " thanh toán trực tuyến" : "") : "Nộp " + cu.soGiayTo + " loại giấy tờ; nộp trực tuyến vẫn phải đến quầy đối chiếu bản giấy; phí " + LAB.vnd(t.le_phi) + (t.le_phi ? " nộp tiền mặt" : "") },
            { t: "<b>Theo dõi</b>", r: isNew ? "Xem tiến độ theo mã hồ sơ; Cổng kiểm tra tự động thành phần và phản hồi ngay (NĐ 310/2026)" : "Gọi điện hoặc đến hỏi; khó biết hồ sơ đang ở khâu nào" },
            { t: "<b>Nhận kết quả</b>", r: isNew ? "Bản điện tử có giá trị pháp lý, hoặc bưu chính, hoặc tại quầy — tuỳ chọn; hạn " + t.han_ngay + " ngày làm việc" : "Đến quầy đúng giờ hành chính lần thứ hai; hạn " + t.han_ngay + " ngày làm việc" },
          ];
          out.render(
            h("div", { class: "row" }, ui.tag(t.linh_vuc, "aqua"), ui.tag(t.muc_do, t.muc_do === "Toàn trình" ? "ok" : "key"), ui.tag("Hạn " + t.han_ngay + " ngày làm việc", "mut"), ui.tag("Lệ phí " + LAB.vnd(t.le_phi), "mut")),
            ui.readouts([
              { k: "Giấy tờ phải nộp", v: cur.soGiayTo + (isNew ? delta(cu.soGiayTo, moi.soGiayTo) : ""), kind: isNew ? "ok" : "eve", big: true },
              { k: "Số lần nhập lại dữ liệu", v: cur.nhapLai + (isNew ? delta(cu.nhapLai, moi.nhapLai) : ""), kind: isNew ? "ok" : "eve", big: true },
              { k: "Kênh tiếp cận tích hợp", v: cur.kenh + (isNew ? " (trực tuyến, trực tiếp, bưu chính)" : " (tách rời)"), kind: isNew ? "pt" : "mut" },
              { k: "Số lần đi lại của người dân", v: String(cur.diLai), kind: cur.diLai === 0 ? "ok" : cur.diLai === 1 ? "key" : "eve" },
              { k: "Thời gian ra dịch vụ mới", v: cur.raDV, kind: isNew ? "ok" : "mut" },
              { k: "Phường Mẫu " + kq.quy + " (KPI)", v: LAB.num(kq.so_lan_di_lai_tb_moi_ho_so, 2) + " lần đi lại / hồ sơ", kind: "aqua" }]),
            ui.title("Hành trình hồ sơ «" + t.ten + "» — " + (isNew ? "Chính phủ số" : "Chính phủ điện tử")),
            ui.steps(hanhtrinh),
            ui.title("Thành phần hồ sơ: ai phải mang gì?", "giả định mô phỏng theo lĩnh vực " + t.linh_vuc),
            ui.table(["Giấy tờ", "Nhóm", "Cách làm — " + (isNew ? "Chính phủ số" : "Chính phủ điện tử")], cur.gt.map(x => [x.ten, ui.tag(x.nhom === "khai" ? "Tờ khai" : x.nhom === "csdl" ? "Đã có trong CSDL quốc gia" : "Đặc thù", x.nhom === "csdl" ? "ct" : "mut"), { html: x.cach, cls: x.nop ? null : "mono" }]), { cls: "wrap", rowCls: r => (isNew && !cur.gt.find(x => x.ten === r[0]).nop) ? "good" : null }),
            ui.title("Bảy điểm khác biệt trên kịch bản này"),
            ui.table(["#", "Tiêu chí", "Chính phủ điện tử", "Chính phủ số", "Trong kịch bản « " + t.ten + " »"], DIEM7.map((d, i) => [{ html: String(i + 1), cls: "c" }, h("b", null, d.tc), { html: d.cu, cls: isNew ? null : "mono" }, { html: d.moi, cls: isNew ? "mono" : null }, h("div", { style: { whiteSpace: "normal", minWidth: "240px" } }, d.kb(t, S.mode))]), { cls: "wrap" }),
            ui.note("Chỉ có hai điểm (6 và 7) liên quan tới công nghệ; năm điểm còn lại là chuyện quản lý: tư duy nền tảng, cách phục vụ, tốc độ, sự tham gia và dữ liệu.", "key"));
        }
        view.append(out); draw(); pane.appendChild(root);
      } },

    /* ============================================================ TAB 3: NĂM YẾU TỐ ============================================================ */
    { id: "namyeuto", title: "Năm yếu tố cấu thành",
      intro: "Dữ liệu – Công nghệ – Dịch vụ – Con người – Quản trị (slide \"Năm yếu tố: câu hỏi tự soi cho đơn vị\"). Tự chấm đơn vị mình 1–5 theo từng câu hỏi; biểu đồ radar chỉ ra <b>mắt xích yếu nhất</b> và gợi ý việc nên ưu tiên. Kết quả dùng cho đồ án nhóm ở buổi cuối.",
      build(pane) {
        /* Chú thích: 5 thanh trượt → radar + thanh mức độ + gợi ý ưu tiên theo yếu tố thấp nhất; lưu LAB.store, tải CSV. */
        const saved = LAB.store.get("m1.namyeuto", {}) || {};
        const S = { ten: saved.ten || "", donvi: saved.donvi || "UBND Phường Mẫu", v: Array.isArray(saved.v) && saved.v.length === 5 ? saved.v.slice() : [3, 3, 3, 3, 3], ghi: saved.ghi || "" };
        const MUCTIEU = [4, 4, 5, 4, 4];
        const save = () => LAB.store.set("m1.namyeuto", { ten: S.ten, donvi: S.donvi, v: S.v, ghi: S.ghi });
        const { root, ctrl, view } = ui.sim();
        const nameF = ui.field({ id: "m1ny-ten", label: "Họ tên học viên", value: S.ten, placeholder: "Nguyễn Văn A", onInput: v => { S.ten = safeName(v); save(); } });
        const dvF = ui.field({ id: "m1ny-donvi", label: "Đơn vị tự soi", value: S.donvi, onInput: v => { S.donvi = safeName(v); save(); draw(); } });
        const ranges = YEUTO.map((y, i) => ui.range({ id: "m1ny-" + y.id, label: y.ten, min: 1, max: 5, step: 1, value: S.v[i], fmt: v => v + " — " + MUC5[v], hint: y.hoi, onInput: v => { S.v[i] = v; save(); draw(); } }));
        const setAll = arr => { S.v = arr.slice(); ranges.forEach((r, i) => r.set(arr[i])); save(); draw(); };
        const ghiF = ui.field({ id: "m1ny-ghi", label: "Ghi chú căn cứ chấm điểm (tuỳ chọn)", type: "textarea", value: S.ghi, placeholder: "Ví dụ: dữ liệu hộ tịch còn ở sổ giấy trước 2015; 3/8 cán bộ chưa có chữ ký số…", onInput: v => { S.ghi = String(v || "").slice(0, 600); save(); } });
        ctrl.append(nameF, dvF, ...ranges, ghiF,
          ui.presets([{ label: "Phường Mẫu hiện nay (3,2,3,2,2)", apply: () => setAll([3, 2, 3, 2, 2]) }, { label: "Mục tiêu 2030 (4,4,5,4,4)", apply: () => setAll(MUCTIEU) }], "Ví dụ mẫu"),
          h("div", { class: "row" }, ui.btn("Làm lại", () => setAll([3, 3, 3, 3, 3])), ui.btn("Tải CSV bản tự soi", () => {
            LAB.csv.download("m1_nam_yeu_to_" + (LAB.khongDau(S.ten).replace(/\s+/g, "_") || "hoc_vien") + ".csv", ["ho_ten", "don_vi", "yeu_to", "cau_hoi_tu_soi", "diem_1_5", "muc", "muc_tieu_2030", "goi_y_uu_tien", "ghi_chu"],
              YEUTO.map((y, i) => [S.ten, S.donvi, y.ten, y.hoi, S.v[i], MUC5[S.v[i]], MUCTIEU[i], y.goiy, S.ghi]));
          }, "pri")),
          ui.cancu("Quyết định 1266/QĐ-TTg ngày 14/7/2026 của Thủ tướng Chính phủ", "Đến 2030: 99% người dân, doanh nghiệp hài lòng khi dùng dịch vụ công trực tuyến; 100% bộ, ngành, địa phương dùng thống nhất các nền tảng số dùng chung quốc gia."),
          ui.cancu("Quyết định 292/QĐ-BKHCN ngày 25/3/2025 của Bộ Khoa học và Công nghệ", "Khung Kiến trúc Chính phủ số Việt Nam 4.0: \"Dữ liệu là tài nguyên mới\"; \"Nền tảng là giải pháp đột phá\"."));
        const out = ui.slot(); const bars = ui.slot();
        const box = chart.box(b => chart.radar(b, { axes: YEUTO.map(y => y.ten), series: [{ name: S.donvi || "Đơn vị", color: "pt", values: S.v }, { name: "Mục tiêu 2030", color: "key", values: MUCTIEU }], max: 5, title: "Năm yếu tố cấu thành — " + (S.donvi || "đơn vị") }));
        function draw() {
          const tb = LAB.stat.mean(S.v); const minV = Math.min(...S.v); const yeu = YEUTO.filter((y, i) => S.v[i] === minV); const maxV = Math.max(...S.v);
          const khoang = maxV - minV;
          out.render(ui.readouts([
            { k: "Điểm trung bình", v: LAB.num(tb, 1) + " / 5", kind: tb >= 4 ? "ok" : tb >= 3 ? "key" : "eve", big: true },
            { k: "Mắt xích yếu nhất", v: yeu.map(y => y.ten).join(", ") + " (" + minV + ")", kind: "eve", big: true },
            { k: "Chênh lệch cao – thấp", v: String(khoang), kind: khoang >= 2 ? "eve" : "pt" },
            { k: "Khoảng cách tới mục tiêu 2030", v: LAB.num(LAB.stat.sum(MUCTIEU.map((m, i) => Math.max(0, m - S.v[i]))), 0) + " điểm", kind: "key" }]));
          bars.render(
            ...YEUTO.map((y, i) => ui.bar({ label: y.ten + " — " + y.hoi, value: S.v[i], max: 5, kind: S.v[i] === minV ? "eve" : y.kind, text: S.v[i] + "/5 · " + MUC5[S.v[i]] + (S.v[i] < MUCTIEU[i] ? " · còn thiếu " + (MUCTIEU[i] - S.v[i]) : " · đạt mục tiêu") })),
            ui.note("<b>Mắt xích yếu nhất quyết định kết quả.</b> Thiếu một yếu tố thì bốn yếu tố còn lại khó phát huy. " + (khoang >= 2 ? "Chênh lệch giữa yếu tố cao nhất và thấp nhất là " + khoang + " điểm: đầu tư đang lệch, nên dồn nguồn lực cho yếu tố thấp trước." : "Năm yếu tố khá đồng đều; nâng dần cả năm theo lộ trình."), "key"),
            ...yeu.map(y => ui.note("<b>Ưu tiên cho yếu tố " + y.ten + ":</b> " + y.goiy, "eve")),
            ui.table(["Yếu tố", "Câu hỏi tự soi", "Điểm", "Mức", "Mục tiêu 2030"], YEUTO.map((y, i) => [h("b", null, y.ten), h("div", { style: { whiteSpace: "normal", minWidth: "220px" } }, y.hoi), { html: String(S.v[i]), cls: "c mono" }, ui.tag(MUC5[S.v[i]], S.v[i] <= 2 ? "eve" : S.v[i] === 3 ? "key" : "ok"), { html: String(MUCTIEU[i]), cls: "c mono" }]), { cls: "wrap", rowCls: (r, i) => S.v[i] === minV ? "bad" : null }));
          box.draw();
        }
        view.append(out, box, bars); draw(); pane.appendChild(root);
      } },

    /* ============================================================ TAB 4: EGDI ============================================================ */
    { id: "egdi", title: "Việt Nam trên bản đồ EGDI",
      intro: "Chỉ số phát triển Chính phủ điện tử (EGDI) của Liên Hợp Quốc, khảo sát 193 quốc gia, hai năm một lần. Thứ hạng và điểm của Việt Nam 2014–2024 từ <code>egdi_viet_nam_2014_2024.csv</code> (dữ liệu thật); kèm máy tính EGDI = (OSI + TII + HCI) / 3.",
      build(pane) {
        /* Chú thích: hai biểu đồ (hạng đảo chiều — hạng nhỏ ở trên; điểm kèm các đường tham chiếu), máy tính EGDI với 3 thanh trượt, nhóm và mục tiêu nhóm 50 (QĐ 1266). */
        const E = LAB.data.egdi.slice().sort((a, b) => a.ky_khao_sat - b.ky_khao_sat);
        const last = E[E.length - 1], prev = E[E.length - 2];
        const S = { osi: 0.5, tii: 0.5, hci: 0.5 };
        const { root, ctrl, view } = ui.sim();
        const rOSI = ui.range({ id: "m1eg-osi", label: "OSI — dịch vụ trực tuyến", min: 0, max: 1, step: 0.01, value: S.osi, fmt: v => LAB.num(v, 2), hint: "Mức độ và chất lượng dịch vụ trực tuyến", onInput: v => { S.osi = v; calc(); } });
        const rTII = ui.range({ id: "m1eg-tii", label: "TII — hạ tầng viễn thông", min: 0, max: 1, step: 0.01, value: S.tii, fmt: v => LAB.num(v, 2), hint: "Hạ tầng viễn thông", onInput: v => { S.tii = v; calc(); } });
        const rHCI = ui.range({ id: "m1eg-hci", label: "HCI — nguồn nhân lực", min: 0, max: 1, step: 0.01, value: S.hci, fmt: v => LAB.num(v, 2), hint: "Nguồn nhân lực và giáo dục", onInput: v => { S.hci = v; calc(); } });
        const setAll = (a, b, c) => { S.osi = a; S.tii = b; S.hci = c; rOSI.set(a); rTII.set(b); rHCI.set(c); calc(); };
        const calcOut = ui.slot();
        function calc() {
          const egdi = (S.osi + S.tii + S.hci) / 3; const [nhom, kind] = nhomEGDI(egdi); const minC = Math.min(S.osi, S.tii, S.hci);
          const yeu = [["OSI", S.osi], ["TII", S.tii], ["HCI", S.hci]].filter(x => x[1] === minC).map(x => x[0]).join(", ");
          calcOut.render(
            ui.readouts([{ k: "EGDI = (OSI + TII + HCI) / 3", v: LAB.num(egdi, 4), kind: "pt", big: true }, { k: "Nhóm", v: nhom, kind, big: true }]),
            ui.bar({ label: "Khoảng cách tới ngưỡng Rất cao (0,75)", value: egdi, max: 1, kind, text: egdi >= 0.75 ? "đã vượt ngưỡng" : "còn thiếu " + LAB.num(0.75 - egdi, 2) }),
            ui.note("Thành phần thấp nhất: <b>" + yeu + "</b> (" + LAB.num(minC, 2) + "). Vì ba chỉ số có trọng số bằng nhau, nâng thành phần thấp nhất thêm 0,1 cũng làm EGDI tăng đúng 0,033 như nâng thành phần cao nhất — nhưng thường rẻ hơn và dễ hơn.", "mut"),
            egdi < 0.75 ? ui.note("Mục tiêu quốc gia đến 2030 là <b>nhóm 50 nước dẫn đầu</b> về chính phủ điện tử (QĐ 1266/QĐ-TTg). Các nước nhóm 50 đều ở nhóm Rất cao, nên giữ EGDI ≥ 0,75 là điều kiện cần.", "key") : ui.note("Điểm này thuộc nhóm Rất cao — điều kiện cần cho mục tiêu nhóm 50 nước dẫn đầu (QĐ 1266/QĐ-TTg). Thứ hạng cụ thể còn phụ thuộc điểm của các nước khác, không suy ra được từ điểm số.", "ok"));
        }
        ctrl.append(ui.title("Máy tính EGDI"), rOSI, rTII, rHCI, calcOut,
          ui.presets([{ label: "Ba thành phần bằng điểm Việt Nam 2024 (0,7709)", apply: () => setAll(0.77, 0.77, 0.77) }, { label: "Đúng ngưỡng Rất cao (0,75)", apply: () => setAll(0.75, 0.75, 0.75) }, { label: "Hạ tầng yếu", apply: () => setAll(0.8, 0.45, 0.8) }], "Ví dụ mẫu"),
          ui.btn("Làm lại", () => setAll(0.5, 0.5, 0.5)),
          ui.note("Căn cứ chỉ có điểm EGDI tổng hợp của Việt Nam, không có điểm từng thành phần OSI, TII, HCI; các ví dụ trên là <b>giả định để tập tính</b>, không phải số liệu công bố.", "mut"),
          ui.cancu("Quyết định 1266/QĐ-TTg ngày 14/7/2026 của Thủ tướng Chính phủ", "Đến 2030: Việt Nam thuộc nhóm 50 nước dẫn đầu thế giới về chính phủ điện tử (đánh giá của Liên Hợp Quốc). Tầm nhìn 2045: nhóm 30 nước dẫn đầu về chính phủ số."),
          ui.cancu("Nghị quyết 57-NQ/TW ngày 22/12/2024 của Bộ Chính trị", "Đến 2030: thuộc nhóm 50 nước đứng đầu thế giới về năng lực cạnh tranh số; nhóm 3 dẫn đầu Đông Nam Á."));
        const tangBac = prev.thu_hang_tren_193 - last.thu_hang_tren_193;
        const boxRank = chart.box(b => { const C = LAB.colors(); chart.line(b, { title: "Thứ hạng EGDI của Việt Nam trong 193 quốc gia (hạng nhỏ ở trên)", series: [{ name: "Thứ hạng", color: "pt", points: E.map(r => [r.ky_khao_sat, -r.thu_hang_tren_193]), marker: true }], xticks: E.map(r => r.ky_khao_sat), fmtX: v => String(v), xmin: 2013, xmax: 2025, ymin: -105, ymax: -45, fmtY: v => String(-v), fmtTip: v => "hạng " + (-v) + "/193", hlines: [{ y: -50, label: "Mục tiêu 2030: nhóm 50 (QĐ 1266)", color: C.key }], ylabel: "Thứ hạng", aspect: 0.42 }); });
        const boxScore = chart.box(b => { const C = LAB.colors(); chart.line(b, { title: "Điểm EGDI của Việt Nam và các mức tham chiếu kỳ 2024", series: [{ name: "Điểm EGDI", color: "pt", points: E.map(r => [r.ky_khao_sat, r.diem_egdi]), marker: true, area: true }], xticks: E.map(r => r.ky_khao_sat), fmtX: v => String(v), xmin: 2013, xmax: 2025, ymin: 0.4, ymax: 0.85, fmtY: v => LAB.num(v, 2), fmtTip: v => LAB.num(v, 4), hlines: [{ y: 0.75, label: "Ngưỡng Rất cao 0,75", color: C.ok }, { y: 0.699, label: "TB châu Á 0,6990", color: C.aqua }, { y: 0.6928, color: C.aqua }, { y: 0.6382, label: "TB thế giới 0,6382", color: C.faint }], ylabel: "Điểm EGDI (0–1)", aspect: 0.42 }); });
        view.append(
          ui.readouts([
            { k: "Kỳ " + last.ky_khao_sat + " — thứ hạng", v: last.thu_hang_tren_193 + "/193", kind: "pt", big: true },
            { k: "Điểm EGDI", v: LAB.num(last.diem_egdi, 4), kind: "pt", big: true },
            { k: "Nhóm", v: last.nhom, kind: "ok", big: true },
            { k: "So với kỳ " + prev.ky_khao_sat, v: (tangBac > 0 ? "tăng " : "giảm ") + Math.abs(tangBac) + " bậc", kind: tangBac > 0 ? "ok" : "eve" },
            { k: "Đông Nam Á", v: "5/11", kind: "aqua" },
            { k: "Công bố", v: "17/9/2024", kind: "mut" }]),
          h("div", { class: "cols" }, boxRank, boxScore),
          ui.note("Kỳ 2024 (ấn bản thứ 13, công bố 17/9/2024): Việt Nam <b>lần đầu</b> vào nhóm Rất cao, tăng 15 bậc, xếp 5/11 Đông Nam Á (tăng 1 bậc so với 2022). Điểm 0,7709 cao hơn trung bình thế giới (0,6382), châu Á (0,6990) và Đông Nam Á (0,6928 — đường tham chiếu không ghi nhãn, sát đường châu Á).", "ok"),
          ui.table(["Kỳ khảo sát", "Thứ hạng", "Điểm EGDI", "Nhóm", "Thay đổi hạng", "Thay đổi điểm"], E.map((r, i) => { const p = E[i - 1]; return [{ html: String(r.ky_khao_sat), cls: "mono" }, { html: r.thu_hang_tren_193 + "/193", cls: "mono" }, { html: LAB.num(r.diem_egdi, 4), cls: "mono" }, ui.tag(r.nhom, nhomEGDI(r.diem_egdi)[0] === r.nhom ? nhomEGDI(r.diem_egdi)[1] : "mut"), { html: p ? (p.thu_hang_tren_193 - r.thu_hang_tren_193 > 0 ? "+" : "") + (p.thu_hang_tren_193 - r.thu_hang_tren_193) + " bậc" : "—", cls: "mono r" }, { html: p ? (r.diem_egdi - p.diem_egdi >= 0 ? "+" : "") + LAB.num(r.diem_egdi - p.diem_egdi, 4) : "—", cls: "mono r" }]; }), { rowCls: (r, i) => i === E.length - 1 ? "hi" : null }),
          ui.note("<b>Ngưỡng nhóm dùng trong máy tính:</b> Rất cao ≥ 0,75; Cao 0,50–0,75; Trung bình 0,25–0,50; Thấp &lt; 0,25. Nhóm ghi trong bảng là nhóm được công bố ở từng kỳ khảo sát (cách phân nhóm của các kỳ đầu có khác). Chỉ số EPI (tham gia điện tử) được công bố kèm nhưng không nằm trong công thức EGDI. Tính đến nay, kỳ khảo sát mới nhất đã kiểm chứng là 2024; không có số liệu nước khác trong căn cứ nên không so sánh từng nước.", "mut"));
        calc(); pane.appendChild(root);
      } },

    /* ============================================================ TAB 5: GIẤY VÀ SỐ ============================================================ */
    { id: "giayvaso", title: "Hồ sơ giấy và hồ sơ số",
      intro: "So sánh hai kênh <b>Trực tiếp</b> và <b>Trực tuyến</b> trên sổ hồ sơ của Phường Mẫu (<code>ho_so_tthc_phuong_mau.csv</code>, 1.500 hồ sơ giả lập): số hồ sơ, tỉ lệ đúng hạn, số lần bổ sung, thời gian xử lý, điểm hài lòng. Kèm máy tính chi phí đi lại của người dân — lý do dịch vụ công trực tuyến toàn trình đáng làm.",
      build(pane) {
        /* Chú thích: thống kê tính trực tiếp từ LAB.data.ho_so (thời gian xử lý = LAB.date.workdays(ngay_nop, ngay_tra)); máy tính chi phí đi lại tham số kéo được. */
        const HS = LAB.data.ho_so; const TT = LAB.data.thu_tuc;
        const S = { ma: "Tất cả", dilaiTT: 2, dilaiOL: 0, gio: 2, chiphi: 30000, giagio: 25000 };
        const { root, ctrl, view } = ui.sim();
        const sel = ui.select({ id: "m1gs-tt", label: "Thủ tục", options: [["Tất cả", "Tất cả 19 thủ tục"], ...TT.map(t => [t.ma, t.ma + " · " + t.ten])], value: S.ma, onChange: v => { S.ma = v; draw(); } });
        const rTT = ui.range({ id: "m1gs-dilai-tt", label: "Số lần đi lại khi nộp trực tiếp", min: 1, max: 4, step: 1, value: S.dilaiTT, fmt: v => v + " lần", hint: "Thường ít nhất hai lần: một lần nộp, một lần nhận", onInput: v => { S.dilaiTT = v; draw(); } });
        const rOL = ui.range({ id: "m1gs-dilai-ol", label: "Số lần đi lại khi nộp trực tuyến", min: 0, max: 2, step: 1, value: S.dilaiOL, fmt: v => v + " lần", hint: "Toàn trình: 0; một phần: thường 1 lần đối chiếu/nhận", onInput: v => { S.dilaiOL = v; draw(); } });
        const rGio = ui.range({ id: "m1gs-gio", label: "Thời gian mỗi lần đi (cả đi lại, chờ)", min: 0.5, max: 6, step: 0.5, value: S.gio, fmt: v => LAB.num(v, 1) + " giờ", onInput: v => { S.gio = v; draw(); } });
        const rCP = ui.range({ id: "m1gs-chiphi", label: "Chi phí đi lại mỗi lần (xe, gửi xe)", min: 0, max: 200000, step: 5000, value: S.chiphi, fmt: v => LAB.vnd(v), onInput: v => { S.chiphi = v; draw(); } });
        const rGia = ui.range({ id: "m1gs-giagio", label: "Giá trị một giờ của người dân", min: 0, max: 100000, step: 5000, value: S.giagio, fmt: v => LAB.vnd(v), hint: "Thu nhập hoặc công việc bị bỏ dở quy ra tiền", onInput: v => { S.giagio = v; draw(); } });
        const setP = (a, b, c, d, e) => { S.dilaiTT = a; S.dilaiOL = b; S.gio = c; S.chiphi = d; S.giagio = e; rTT.set(a); rOL.set(b); rGio.set(c); rCP.set(d); rGia.set(e); draw(); };
        ctrl.append(sel, ui.title("Máy tính chi phí đi lại", "tham số giả định"), rTT, rOL, rGio, rCP, rGia,
          ui.presets([{ label: "Người đi làm trong phường", apply: () => setP(2, 0, 2, 30000, 30000) }, { label: "Người cao tuổi ở xa", apply: () => setP(3, 1, 3, 50000, 15000) }, { label: "Chủ hộ kinh doanh", apply: () => setP(2, 0, 1.5, 40000, 60000) }], "Ví dụ mẫu"),
          ui.btn("Làm lại", () => { S.ma = "Tất cả"; sel.input.value = "Tất cả"; setP(2, 0, 2, 30000, 25000); }),
          ui.cancu("Nghị định 118/2025/NĐ-CP ngày 09/6/2025 của Chính phủ", "Thực hiện thủ tục hành chính theo cơ chế một cửa, một cửa liên thông tại Bộ phận Một cửa và Cổng Dịch vụ công quốc gia. Từ 01/7/2025 không duy trì Cổng Dịch vụ công cấp tỉnh; từ 01/3/2026 không duy trì Cổng Dịch vụ công cấp bộ. Cổng Dịch vụ công quốc gia (dichvucong.gov.vn) là điểm \"một cửa số\" tập trung, duy nhất."),
          ui.cancu("Nghị định 42/2022/NĐ-CP ngày 24/6/2022 của Chính phủ", "Dịch vụ công trực tuyến toàn trình và dịch vụ công trực tuyến một phần."));
        const out = ui.slot(); const cost = ui.slot();
        const KENH = ["Trực tiếp", "Trực tuyến"];
        const st = rows => {
          const tra = rows.filter(r => r.trang_thai === "Đã trả kết quả" && r.ngay_tra);
          const dh = rows.filter(r => r.dung_han !== "");
          const hl = rows.filter(r => r.hai_long_1_5 !== "" && r.hai_long_1_5 != null).map(r => +r.hai_long_1_5);
          const wd = tra.map(r => LAB.date.workdays(r.ngay_nop, r.ngay_tra)).filter(v => v != null);
          return { n: rows.length, dungHan: 100 * LAB.stat.rate(dh, r => r.dung_han === "Có"), boSung: LAB.stat.mean(rows.map(r => +r.so_lan_bo_sung)), xuLy: LAB.stat.mean(wd), haiLong: LAB.stat.mean(hl), nHL: hl.length, soHoa: 100 * LAB.stat.rate(rows, r => r.ket_qua_so_hoa === "Có"), ttOnline: 100 * LAB.stat.rate(rows.filter(r => r.thanh_toan_truc_tuyen !== "Không thu"), r => r.thanh_toan_truc_tuyen === "Có"), tuChoi: 100 * LAB.stat.rate(rows, r => r.trang_thai === "Từ chối") };
        };
        let CH = {};
        const mk = (key, title, fmtY, fmtTip, ymax) => chart.box(b => chart.bars(b, { title, labels: KENH, series: [{ name: key, color: "pt", values: KENH.map(k => (CH[k] && isFinite(CH[k][key])) ? +CH[k][key] : 0), colors: ["eve", "ok"] }], fmtY, fmtTip, ymax, aspect: 0.62, intY: false }));
        const b1 = mk("dungHan", "Tỉ lệ đúng hạn (%)", v => LAB.num(v, 0), v => LAB.pc(v), 100);
        const b2 = mk("xuLy", "Thời gian xử lý trung bình (ngày làm việc)", v => LAB.num(v, 1), v => LAB.num(v, 2) + " ngày");
        const b3 = mk("boSung", "Số lần bổ sung trung bình / hồ sơ", v => LAB.num(v, 2), v => LAB.num(v, 2) + " lần");
        const b4 = mk("haiLong", "Điểm hài lòng trung bình (1–5)", v => LAB.num(v, 1), v => LAB.num(v, 2) + " / 5", 5);
        function draw() {
          const rows = S.ma === "Tất cả" ? HS : HS.filter(r => r.ma_thu_tuc === S.ma); const t = TT.find(x => x.ma === S.ma);
          CH = {}; KENH.forEach(k => { CH[k] = st(rows.filter(r => r.kenh_nop === k)); }); const bc = st(rows.filter(r => r.kenh_nop === "Bưu chính"));
          const A = CH["Trực tiếp"], B = CH["Trực tuyến"];
          if (!rows.length) { out.render(ui.note("Không có hồ sơ nào cho thủ tục này trong sổ hồ sơ.", "eve")); cost.render(); return; }
          const f = (v, d, suf) => isFinite(v) ? LAB.num(v, d) + (suf || "") : "—";
          const better = (a, b, lowIsGood) => !isFinite(a) || !isFinite(b) ? "mut" : (lowIsGood ? b < a : b > a) ? "ok" : (b === a ? "mut" : "eve");
          out.render(
            h("div", { class: "row" }, t ? [ui.tag(t.linh_vuc, "aqua"), ui.tag(t.muc_do, t.muc_do === "Toàn trình" ? "ok" : "key"), ui.tag("Hạn " + t.han_ngay + " ngày làm việc", "mut")] : ui.tag("19 thủ tục · 9 lĩnh vực", "aqua"), ui.tag(LAB.num(rows.length) + " hồ sơ", "pt")),
            ui.readouts([
              { k: "Hồ sơ trực tiếp", v: LAB.num(A.n), kind: "eve" }, { k: "Hồ sơ trực tuyến", v: LAB.num(B.n), kind: "ok" },
              { k: "Tỉ lệ trực tuyến", v: LAB.pc(100 * B.n / rows.length), kind: "pt", big: true },
              { k: "Đúng hạn: trực tiếp → trực tuyến", v: f(A.dungHan, 1, " %") + " → " + f(B.dungHan, 1, " %"), kind: better(A.dungHan, B.dungHan, false) },
              { k: "Xử lý TB (ngày làm việc)", v: f(A.xuLy, 2) + " → " + f(B.xuLy, 2), kind: better(A.xuLy, B.xuLy, true) },
              { k: "Hài lòng TB (1–5)", v: f(A.haiLong, 2) + " → " + f(B.haiLong, 2), kind: better(A.haiLong, B.haiLong, false) }]),
            ui.table(["Chỉ số (tính từ sổ hồ sơ)", "Trực tiếp", "Trực tuyến", "Bưu chính", "Cách tính"], [
              ["Số hồ sơ", { html: LAB.num(A.n), cls: "mono r" }, { html: LAB.num(B.n), cls: "mono r" }, { html: LAB.num(bc.n), cls: "mono r" }, "đếm dòng theo kenh_nop"],
              ["Tỉ lệ đúng hạn", { html: f(A.dungHan, 1, " %"), cls: "mono r" }, { html: f(B.dungHan, 1, " %"), cls: "mono r" }, { html: f(bc.dungHan, 1, " %"), cls: "mono r" }, "dung_han = Có / hồ sơ đã có kết quả"],
              ["Số lần bổ sung trung bình", { html: f(A.boSung, 2), cls: "mono r" }, { html: f(B.boSung, 2), cls: "mono r" }, { html: f(bc.boSung, 2), cls: "mono r" }, "trung bình so_lan_bo_sung"],
              ["Thời gian xử lý trung bình (ngày làm việc)", { html: f(A.xuLy, 2), cls: "mono r" }, { html: f(B.xuLy, 2), cls: "mono r" }, { html: f(bc.xuLy, 2), cls: "mono r" }, "ngày làm việc từ ngay_nop đến ngay_tra, bỏ T7–CN"],
              ["Điểm hài lòng trung bình (1–5)", { html: f(A.haiLong, 2) + " (n=" + A.nHL + ")", cls: "mono r" }, { html: f(B.haiLong, 2) + " (n=" + B.nHL + ")", cls: "mono r" }, { html: f(bc.haiLong, 2), cls: "mono r" }, "trung bình hai_long_1_5 của hồ sơ có đánh giá"],
              ["Kết quả được số hoá", { html: f(A.soHoa, 1, " %"), cls: "mono r" }, { html: f(B.soHoa, 1, " %"), cls: "mono r" }, { html: f(bc.soHoa, 1, " %"), cls: "mono r" }, "ket_qua_so_hoa = Có"],
              ["Thanh toán trực tuyến (hồ sơ có thu phí)", { html: f(A.ttOnline, 1, " %"), cls: "mono r" }, { html: f(B.ttOnline, 1, " %"), cls: "mono r" }, { html: f(bc.ttOnline, 1, " %"), cls: "mono r" }, "thanh_toan_truc_tuyen = Có"],
              ["Tỉ lệ từ chối", { html: f(A.tuChoi, 1, " %"), cls: "mono r" }, { html: f(B.tuChoi, 1, " %"), cls: "mono r" }, { html: f(bc.tuChoi, 1, " %"), cls: "mono r" }, "trang_thai = Từ chối"]], { cls: "wrap" }),
            h("div", { class: "grp" }, b1, b2), h("div", { class: "grp" }, b3, b4));
          /* máy tính chi phí đi lại */
          const cpLan = S.gio * S.giagio + S.chiphi; const cpTT = S.dilaiTT * cpLan, cpOL = S.dilaiOL * cpLan; const tiet = cpTT - cpOL;
          const gioTT = S.dilaiTT * S.gio, gioOL = S.dilaiOL * S.gio;
          cost.render(
            ui.title("Chi phí đi lại của người dân cho một bộ hồ sơ", "số lần đi lại × (giờ × giá trị giờ + chi phí mỗi lần)"),
            ui.readouts([
              { k: "Nộp trực tiếp", v: LAB.vnd(cpTT) + " · " + LAB.num(gioTT, 1) + " giờ", kind: "eve", big: true },
              { k: "Nộp trực tuyến", v: (cpOL ? LAB.vnd(cpOL) : "0 đ") + " · " + LAB.num(gioOL, 1) + " giờ", kind: "ok", big: true },
              { k: "Tiết kiệm mỗi hồ sơ", v: LAB.vnd(tiet), kind: tiet > 0 ? "ok" : "mut" },
              { k: "Nếu " + LAB.num(A.n) + " hồ sơ trực tiếp này chuyển sang trực tuyến", v: LAB.vnd(tiet * A.n) + " · " + LAB.num((gioTT - gioOL) * A.n, 0) + " giờ của dân", kind: "pt", big: true }]),
            ui.bar({ label: "Chi phí đi lại: trực tuyến so với trực tiếp", value: cpTT ? 100 * cpOL / cpTT : 0, max: 100, kind: "ok", text: cpTT ? LAB.pc(100 * cpOL / cpTT, 0) + " của cách cũ" : "—" }),
            ui.note("Lợi ích <b>toàn trình</b> không nằm ở phần mềm mà ở số lần người dân không phải đến trụ sở: không phụ thuộc giờ hành chính, không khai lại thông tin đã có, theo dõi tiến độ theo mã hồ sơ, kết quả điện tử có giá trị pháp lý. Với dịch vụ <b>một phần</b>, người dân thường vẫn phải đến một lần — hãy kéo thanh \"số lần đi lại khi nộp trực tuyến\" lên 1 để thấy phần lợi ích mất đi.", "key"),
            ui.warn());
          [b1, b2, b3, b4].forEach(b => b.draw());
        }
        view.append(out, cost); draw(); pane.appendChild(root);
      } },
  ]
});
})();
