# Brief cho subagent — viết một mô-đun của "Phòng mô phỏng Chính phủ số"

Bạn viết **một tệp JavaScript duy nhất** `assets/mN.js` (N do nhiệm vụ giao) cho website tĩnh tại
`G:\A. Personal Data\3-IU Courses\3.7-Public Administration\KhoaHoc_ChienLuoc_CPS_10Buoi\CPS_VirtualLab\`.
Không sửa `index.html`, `assets/core.js`, `assets/style.css`, `assets/data.js` hay tệp của mô-đun khác. Nếu core thiếu gì, tự viết hàm riêng trong tệp của bạn.

## Bối cảnh
- Môn **Chiến lược xây dựng và phát triển Chính phủ số** (chương trình Thạc sĩ, giảng viên TS. Nguyễn Ngọc Trường Minh). Học viên là **cán bộ, công chức, viên chức**, **không giả định kỹ năng công nghệ**: không mã lệnh, không thuật ngữ tiếng Anh chưa giải thích, mọi khái niệm kỹ thuật diễn giải bằng ví dụ hành chính quen thuộc. Giao diện **tiếng Việt có dấu**, thuật ngữ đúng như slide.
- Khoá học thực tế dạy trong **8 buổi**; website có 8 mô-đun `m1`…`m8` (m7 gộp Bài 7 + 8, m8 gộp Bài 9 + 10 của bộ slide 10 bài).
- Bối cảnh mô phỏng xuyên suốt: **UBND Phường Mẫu, Tỉnh Mẫu** (đơn vị cấp xã hư cấu, chính quyền địa phương 2 cấp từ 01/7/2025). Mọi tên người, địa danh, mức phí, số liệu của Phường Mẫu là hư cấu. Chỉ văn bản pháp luật và số liệu xếp hạng quốc tế là thật.
- **Nguồn nội dung bắt buộc đọc trước khi viết:**
  - `..\_build\CANCU.md` (thư mục `_build` của khoá học, cạnh `CPS_VirtualLab`): căn cứ pháp lý và số liệu **đã kiểm chứng**. **Chỉ được nêu văn bản, điều khoản, con số có trong tệp này.** Chú ý mục I0 và các dòng "HẾT HIỆU LỰC": Luật ATTT mạng 86/2015 và Luật An ninh mạng 24/2018 hết hiệu lực 01/7/2026 (thay bằng Luật 116/2025/QH15); NĐ 47/2020 hết hiệu lực 22/10/2025 (thay bằng NĐ 278/2025); NĐ 13/2023 hết hiệu lực 01/01/2026 (thay bằng NĐ 356/2025); NĐ 73/2019 thay bằng NĐ 45/2026; Bộ TT&TT đã hợp nhất vào **Bộ Khoa học và Công nghệ** từ 01/3/2025; Cổng DVC quốc gia là điểm một cửa số duy nhất; không còn Cổng DVC cấp tỉnh (từ 01/7/2025) và cấp bộ (từ 01/3/2026).
  - `..\_build\DECUONG.md`: đề cương; đọc mục BUỔI tương ứng với mô-đun của bạn.
  - `..\_build\baiN.py`: **nội dung chi tiết từng slide** của bài bạn phụ trách (các lời gọi `d.bullet`, `d.bang`, `d.khung_vn`, `d.so_sanh`, `d.thuc_hanh`, `d.thao_luan`, `d.trac_nghiem`…). Đây là nguồn chính: tên gọi, cách phân loại, bảng, ví dụ, bài thực hành của tab phải **bám đúng slide**. Đọc bằng `cat` hoặc Read (tệp 650–800 dòng).
  - `..\_build\nguon\khung40.txt` (Khung Kiến trúc CPS 4.0) nếu được giao m4.
- Mọi thứ hiển thị phải **được tính từ dữ liệu/tham số**, không phải hình tĩnh. Đổi tham số → bảng, hình, biểu đồ cập nhật ngay.

## Dữ liệu giả lập dùng chung (`assets/data.js`, truy cập qua `LAB.data`)
Mỗi thuộc tính trả về **bản sao** mảng object (mỗi dòng một object, khoá = tên cột). Đừng sửa tại chỗ rồi mong mô-đun khác thấy.
| Thuộc tính | Dòng | Cột chính |
|---|---|---|
| `LAB.data.thu_tuc` | 19 | `ma, ten, linh_vuc, muc_do ("Toàn trình"/"Một phần"), han_ngay, le_phi, trong_so` |
| `LAB.data.ho_so` | 1500 | `ma_ho_so, ma_thu_tuc, thu_tuc, linh_vuc, muc_do_dvctt, kenh_nop ("Trực tuyến"/"Trực tiếp"/"Bưu chính"), ngay_nop (yyyy-mm-dd), han_ngay_lam_viec, ngay_hen_tra, ngay_tra ("" nếu chưa), trang_thai ("Đã trả kết quả"/"Từ chối"/"Đang xử lý"/"Chờ bổ sung"), dung_han ("Có"/"Không"/""), so_lan_bo_sung, le_phi_vnd, thanh_toan_truc_tuyen ("Có"/"Không"/"Không thu"), ket_qua_so_hoa, hai_long_1_5 (1–5 hoặc ""), nhom_tuoi_nguoi_nop, can_bo_xu_ly` |
| `LAB.data.dan_cu` | 408 | `ma, ho_ten, ngay_sinh (dd/mm/yyyy), gioi_tinh, so_dinh_danh (12 số), dia_chi, so_dien_thoai, tinh_trang_hon_nhan, ngay_cap_nhat` — đã gieo ~60 lỗi 8 loại: trùng (8, cùng số định danh, tên khác kiểu chữ), định danh sai độ dài (8), ngày sinh sai định dạng/không tồn tại (8), thiếu trường (8), địa chỉ còn cấp quận/huyện (8), giới tính không chuẩn (8), cập nhật trước 2021 (8), số điện thoại 9 số (4) |
| `LAB.data.diem_phuc_vu` | 46 | `ma, ten_diem, loai, dia_chi, vi_do, kinh_do, gio_mo_cua, dien_thoai_lien_he, tiep_can_nguoi_khuyet_tat, ngay_cap_nhat, dieu_kien_su_dung` |
| `LAB.data.he_thong` | 18 | `ma, ten_he_thong, nghiep_vu_phuc_vu, du_lieu_chinh, loai ("Nền tảng dùng chung quốc gia"/"Hệ thống của tỉnh"/"Hệ thống đơn vị tự mua"/"Ứng dụng công cộng"), nam_dua_vao_su_dung, don_vi_cung_cap, noi_dat, cap_do_attt_da_xac_dinh (0 = chưa xác định), ket_noi_nen_tang_chia_se, chi_phi_nam_trieu_dong, tinh_trang ("Đang dùng"/"Ít dùng"/"Trùng chức năng")` |
| `LAB.data.kpi` | 11 quý | `quy ("2024-Q1"…"2026-Q3"), ty_le_ho_so_truc_tuyen_pct, ty_le_ho_so_toan_trinh_pct, ty_le_dung_han_pct, ty_le_thanh_toan_truc_tuyen_pct, ty_le_ket_qua_so_hoa_pct, diem_hai_long_tren_5, ty_le_can_bo_co_chu_ky_so_pct, so_su_co_attt, ty_le_can_bo_hoan_thanh_boi_duong_pct, so_lan_di_lai_tb_moi_ho_so` |
| `LAB.data.khao_sat` | 50 | `ma_can_bo, nhom (5 nhóm), gioi_tinh, nhom_tuoi, 8 cột kỹ năng (tên trong LAB.data.ky_nang, thang 1–5), san_sang_hoc_truc_tuyen, ky_nang_can_boi_duong_nhat` |
| `LAB.data.van_ban` | 40 | `ky_hieu, ten_ngan, tang ("Chủ trương"/"Luật"/"Chiến lược/chương trình"/"Nghị định/thông tư"/"Văn bản của Bộ"), co_quan_ban_hanh, ngay_ban_hanh (dd/mm/yyyy), hieu_luc_tu, tinh_trang, van_ban_thay_the_sua_doi, ghi_chu` — dữ liệu thật |
| `LAB.data.egdi` | 6 | `ky_khao_sat, thu_hang_tren_193, diem_egdi, nhom` — dữ liệu thật |
| `LAB.data.meta` | — | mô tả từng bộ dữ liệu `{ten, tep, cot, mo_ta}` ; `LAB.dataHeaders("ho_so")` → mảng tên cột |
Tệp CSV tương ứng nằm ở `data/*.csv` (học viên tải về); trong tab, nếu phù hợp, có nút `LAB.csv.download(...)` để học viên xuất kết quả bài làm.

## Cách một mô-đun đăng ký (API bắt buộc)
```js
(function(){ "use strict";
const { h, ui, chart } = LAB;
LAB.module({
  id: "m5",                       // đúng id section trong index.html
  tabs: [
    { id: "chatluong", title: "Chất lượng dữ liệu",
      intro: "Một–hai câu giới thiệu tab (HTML được phép), nêu slide/căn cứ liên quan.",
      build(pane) { /* dựng DOM vào pane; chạy lười khi tab mở lần đầu */ } },
    // 5–6 tab cho mỗi mô-đun, theo đúng danh sách trong nhiệm vụ
  ]
});
})();
```
Deep link `#m5-chatluong` mở đúng tab. **id tab chỉ gồm chữ thường không dấu/số, không gạch ngang.** Dùng đúng id tab mà nhiệm vụ giao (slide/tài liệu sẽ dẫn link theo id đó).

## Thư viện lõi `assets/core.js` (đọc tệp này để biết chi tiết)
- `h(tag, attrs, ...children)` tạo phần tử; attrs: `class`, `html`, `style:{}`, `onclick`, `dataset:{}`, `title`. `LAB.svg(tag, attrs, ...children)` cho SVG. `LAB.clear(el)`.
- `ui.sim({wide})` → `{root, ctrl, view}`: khung chuẩn, `ctrl` cột trái (điều khiển, rộng ≤ 340px), `view` cột phải (kết quả). `pane.appendChild(root)`. Với tab dạng bảng/biểu đồ rộng dùng `{wide:true}` (chỉ có `view`).
- Điều khiển: `ui.field({id,label,value,type:'text'|'number'|'textarea',min,max,step,hint,placeholder,onInput,onChange})` (`.input`), `ui.range({id,label,min,max,step,value,fmt,onInput})` (`.set(v)`, `.get()`), `ui.select({id,label,options:[[val,label]],value,onChange})`, `ui.check({id,label,value,onChange})`, `ui.seg({id,label,options,value,onChange})` (`.get()/.set()`), `ui.btn(label,onClick,'pri'|'sm'|'sm pri')`, `ui.presets([{label,apply}], 'Ví dụ trong bài giảng')`, `ui.tiles({items:[{id,title,sub,kind}], value, onChange, multi, cls:'narrow'})` (lưới thẻ bấm chọn; `.get()/.set()`).
  **Mọi id điều khiển phải duy nhất toàn trang → tiền tố theo mô-đun và tab, ví dụ `m5cl-rule1`.**
- Hiển thị: `ui.readouts([{k,v,kind:'pt'|'key'|'ct'|'eve'|'ok'|'aqua',big}])`, `ui.note(html,'key'|'eve'|'ok'|'mut')`, `ui.warn(text)` (dải cảnh báo mô phỏng), `ui.cancu("Luật Dữ liệu 60/2024/QH15, Điều 11 khoản 2 điểm b", "nguyên văn…")` (khung trích dẫn văn bản QPPL — dùng ở mọi tab có quy tắc pháp lý), `ui.title(text, small)`, `ui.steps([{t: html, r: html, hi}])`, `ui.table(headers, rows, {mono, cls:'tight'|'grid'|'wrap', rowCls:(row,i)=>'hi'|'bad'|'good'})` (ô: chuỗi, Node, hoặc `{html, cls:'c'|'r'|'mono', colspan}`), `ui.bar({label,value,max,kind,text})` (thanh mức độ), `ui.score(v,label,max)` (vòng điểm; thêm class `ok/eve/pt` nếu cần), `ui.tag(text, kind)`, `ui.panel(title, ...kids)`, `ui.slot()` → phần tử có `.render(...kids)` để vẽ lại một vùng.
- Lớp CSS có sẵn: `.stack` (cột, gap 12), `.row` (hàng wrap), `.cols` (lưới tự động 240px), `.grp`/`.grp3` (2/3 cột), `.kv` (dl), `.small`, `.err`, `.hl`, `.pt-c .key-c .ct-c .eve-c .ok-c`, `.timeline` (ul: `li.pt|eve|ok|ct|aqua` với `span.d` ngày), `.wizard` (`span.st.on|done` các bước), `.quad` (lưới 2×2 cho ma trận, `div > .qt` tiêu đề góc), `.pill(.on)` (nhãn bấm chọn), `.docform` (lưới form; `.fld.auto` tô kiểu "điền tự động"), `.heat` + `.hc` (ô nhiệt; đặt `style.background` bằng `color-mix(in srgb, var(--ct) X%, var(--sunk))`), `svg.diag` (SVG rộng 100%, text tự lấy màu chủ đề; `class="lbl"` cho nhãn).
- Số liệu: `LAB.vnd(n)` ("8.000 đ"/"Không thu"), `LAB.num(n,d)`, `LAB.pc(v,d)` ("72,5 %"), `LAB.fmt(v,d)`, `LAB.pct(0.725)`. Ngày: `LAB.date.parse(s)` (ISO hoặc dd/mm/yyyy → Date hoặc null), `LAB.date.vn(s)`, `LAB.date.iso(d)`, `LAB.date.quy(s)` ("2025-Q3"), `LAB.date.thang(s)`, `LAB.date.days(a,b)`, `LAB.date.workdays(a,b)`. Thống kê: `LAB.stat.sum/mean/median/groupBy(rows,key)/count(rows,key)/rate(rows,pred)/uniq(rows,key)`. `LAB.khongDau(s)` để tìm kiếm không dấu. `LAB.rng(seed)` → PRNG có mầm (kết quả tái lập; luôn có nút "Chạy lại" đổi mầm).
- Lưu bài làm: `LAB.store.get(k, dflt)/set(k, v)/del(k)` (localStorage, tiền tố `cps.`; khoá theo mô-đun-tab, ví dụ `m2.bando`). Xuất: `LAB.csv.download("ten.csv", headers, rows)` (rows: mảng mảng hoặc mảng object), `LAB.csv.downloadText("ten.md", text)`.
- Biểu đồ: `const box = chart.box(b => chart.line(b, {...}))` rồi gắn `box` vào DOM; gọi `box.draw()` khi dữ liệu đổi.
  `chart.line(box, {series:[{name,color:'pt'|'key'|'ct'|'eve'|'ok'|'aqua',points:[[x,y]],dash:[4,4],marker,markerOnly,area}], xlabel,ylabel,xmin,xmax,ymin,ymax,fmtX,fmtY,title,vlines:[{x,label,color}],hlines:[{y,label}],aspect,xticks})`
  `chart.bars(box, {labels, series:[{name,color,values,colors:[per-bar]}], ylabel, ymax, fmtY, fmtTip, hi:index, title, aspect, intY})`
  `chart.radar(box, {axes:[tên], series:[{name,color,values}], max:5, title})`. Tối đa 3–4 chuỗi, màu theo vai trò.
- Màu CSS theo **vai trò**: `var(--pt)` người dân / dịch vụ (xanh dương), `var(--key)` văn bản pháp luật / chỉ tiêu (đồng thau), `var(--ct)` dữ liệu (tím), `var(--eve)` rủi ro / lỗi / cảnh báo (đỏ), `var(--ok)` đạt / đúng (lục), `var(--aqua)` cơ quan nhà nước / hạ tầng (lam ngọc); nền nhạt `var(--pt-bg)` … ; chữ `var(--ink)`, `var(--soft)`, `var(--faint)`; viền `var(--line)`; nền `var(--sunk)`, `var(--panel)`. Trong SVG dùng `fill="var(--pt)"`; trong canvas dùng `LAB.colors().pt`. **Không viết mã màu hex cứng** (trang có chế độ sáng/tối).

## Mẫu một tab (sao chép cấu trúc này)
```js
{ id: "kenh", title: "Kênh nộp theo quý", intro: "Tỉ lệ hồ sơ nộp trực tuyến của Phường Mẫu theo quý, tính từ sổ hồ sơ (dữ liệu giả lập).",
  build(pane) {
    const S = { linhvuc: "Tất cả" };
    const { root, ctrl, view } = ui.sim();
    const rows = LAB.data.ho_so;
    const lvs = ["Tất cả", ...LAB.stat.uniq(rows, "linh_vuc").sort()];
    ctrl.append(ui.select({ id: "m6kn-lv", label: "Lĩnh vực", options: lvs.map(x => [x, x]), value: S.linhvuc, onChange: v => { S.linhvuc = v; draw(); } }),
      ui.cancu("Nghị định 42/2022/NĐ-CP", "Dịch vụ công trực tuyến toàn trình và một phần."));
    const out = ui.slot(); const box = chart.box(b => chart.bars(b, S.chart)); view.append(out, box);
    function draw() {
      const sel = S.linhvuc === "Tất cả" ? rows : rows.filter(r => r.linh_vuc === S.linhvuc);
      const byQ = LAB.stat.groupBy(sel, r => LAB.date.quy(r.ngay_nop)); const labels = [...byQ.keys()].sort();
      const vals = labels.map(q => 100 * LAB.stat.rate(byQ.get(q), r => r.kenh_nop === "Trực tuyến"));
      S.chart = { labels, series: [{ name: "Trực tuyến", color: "pt", values: vals }], ylabel: "%", ymax: 100, fmtY: v => v + " %", fmtTip: v => LAB.pc(v) };
      out.render(ui.readouts([{ k: "Số hồ sơ", v: LAB.num(sel.length), kind: "pt" }, { k: "Trực tuyến quý gần nhất", v: LAB.pc(vals[vals.length - 1]), kind: "ok", big: true }]));
      box.draw();
    }
    draw(); pane.appendChild(root);
  } }
```

## Yêu cầu chất lượng
1. **Bám slide và căn cứ.** Tên gọi, phân loại, bảng tiêu chí, ví dụ, câu hỏi trong tab lấy từ `baiN.py`; mọi văn bản/điều khoản/con số lấy từ `CANCU.md`. Mỗi tab có quy tắc pháp lý phải có ít nhất một `ui.cancu(...)`. Khi nhắc văn bản đã hết hiệu lực, phải hiện cảnh báo (`ui.note(..., 'eve')` hoặc `ui.tag('Hết hiệu lực', 'eve')`).
2. **Tương tác có ý nghĩa cho cán bộ**: bật/tắt, kéo tham số, chọn thẻ, đánh dấu có/không, kéo điểm, xếp loại, chọn phương án; thấy ngay hệ quả (điểm, chi phí, số hồ sơ, cảnh báo). Có nút "Ví dụ mẫu" (preset) và nút "Làm lại".
3. **Bài thực hành có đầu ra.** Tab thực hành (bản đồ căn cứ, bảng tự chấm, KPI, kế hoạch…) phải lưu bằng `LAB.store` và có nút **Tải CSV / Tải bản ghi** để học viên nộp; có ô "Họ tên học viên" khi phù hợp.
4. **Giải thích bằng ngôn ngữ hành chính**, câu ngắn; chú thích tiếng Việt ngắn trong mã ở đầu mỗi tab.
5. **Xử lý đầu vào sai** bằng `ui.note(..., 'eve')`, không ném lỗi. Không `alert/confirm/prompt`, không fetch, không thư viện ngoài, không `innerHTML` với chuỗi người dùng nhập (dùng `h()`/textContent).
6. **Hiệu năng**: lọc 1.500 dòng là nhẹ; mô phỏng ngẫu nhiên ≤ 20.000 mẫu, dùng `LAB.rng`.
7. **Kích thước**: 500–1000 dòng. Viết tệp bằng công cụ Write (không heredoc bash).
8. Bố cục không được tràn ngang ở 1400px và 1000px (bảng rộng bọc trong `ui.table` đã có cuộn ngang).

## Kiểm tra trước khi báo cáo
```
cd "G:/A. Personal Data/3-IU Courses/3.7-Public Administration/KhoaHoc_ChienLuoc_CPS_10Buoi/CPS_VirtualLab"
py -3.13 -X utf8 _build/jscheck.py assets/mN.js      # lỗi cú pháp / lỗi nạp (in "OK assets/mN.js")
bash _build/selftest.sh 1400                         # dựng mọi tab: mỗi tab của bạn phải "OK", không "TRÀN"
bash _build/selftest.sh 1000
```
Các mô-đun khác có thể chưa tồn tại (404) — không sao. Khi xong, báo cáo ngắn: danh sách tab (id, tên), những căn cứ pháp lý đã dùng, bộ dữ liệu đã dùng, hạn chế còn lại.
