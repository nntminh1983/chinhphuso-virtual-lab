# Phòng mô phỏng Chính phủ số

Website mô phỏng tương tác và bộ dữ liệu giả lập cho môn **Chiến lược xây dựng và phát triển Chính phủ số**
(chương trình Thạc sĩ, 8 buổi). Biên soạn: TS. Nguyễn Ngọc Trường Minh.

**Truy cập:** https://nntminh1983.github.io/chinhphuso-virtual-lab/

> Môi trường đào tạo. Mọi tên người, địa danh, mức phí, số liệu của "UBND Phường Mẫu, Tỉnh Mẫu" đều hư cấu
> và không có giá trị pháp lý. Chỉ phần văn bản pháp luật và số liệu xếp hạng quốc tế là dữ liệu thật,
> đã kiểm chứng đến 24/9/2026.

## Tám buổi học, tám mô-đun

| Buổi | Mô-đun | Bài trong bộ slide | Đường dẫn |
|---|---|---|---|
| 1 | Tổng quan về Chính phủ số | Bài 1 | `#m1` |
| 2 | Khung chính sách và pháp luật | Bài 2 | `#m2` |
| 3 | Kinh nghiệm quốc tế và khung đánh giá | Bài 3 | `#m3` |
| 4 | Kiến trúc Chính phủ số 4.0 | Bài 4 | `#m4` |
| 5 | Dữ liệu số và dữ liệu mở | Bài 5 | `#m5` |
| 6 | Dịch vụ công trực tuyến | Bài 6 | `#m6` |
| 7 | Hạ tầng, công nghệ và an toàn thông tin | Bài 7 + 8 | `#m7` |
| 8 | Quản trị thực thi và chiến lược tại đơn vị | Bài 9 + 10 | `#m8` |

Mỗi tab có đường dẫn riêng dạng `#m5-chatluong` để dán vào slide hoặc gửi cho lớp.

## Dữ liệu thực hành (`data/`)

| Tệp | Nội dung | Dùng ở buổi |
|---|---|---|
| `ho_so_tthc_phuong_mau.csv` | 1.500 hồ sơ TTHC 01/2025–09/2026 | 1, 6, 8 |
| `dan_cu_mau_can_lam_sach.csv` | 408 bản ghi dân cư hư cấu, gieo ~60 lỗi 8 loại | 5 |
| `du_lieu_mo_diem_phuc_vu.csv` + `mo_ta_bo_du_lieu.json` | bộ dữ liệu mở mẫu | 5 |
| `kiem_ke_he_thong_thong_tin.csv` | 18 hệ thống thông tin của đơn vị | 4, 7 |
| `kpi_chuyen_doi_so_theo_quy.csv` | 10 chỉ số theo quý 2024Q1–2026Q3 | 8 |
| `khao_sat_nang_luc_so_can_bo.csv` | 50 cán bộ × 8 kỹ năng | 8 |
| `danh_muc_van_ban_phap_ly.csv` | 40 văn bản, tình trạng hiệu lực (thật) | 2 |
| `egdi_viet_nam_2014_2024.csv` | EGDI Việt Nam (thật) | 1, 3 |

Dữ liệu được sinh bằng `_build/gen_data.py` với mầm ngẫu nhiên cố định (`py -3.13 -X utf8 _build/gen_data.py`).
Đổi mầm trong tệp để ra bộ đề mới. Đáp án lỗi của bộ dân cư nằm ở `_build/dapan/` (không đưa lên web).

## Cấu trúc mã nguồn

```
index.html            trang duy nhất, 8 section #m1…#m8
assets/core.js        thư viện lõi: điều khiển, bảng, biểu đồ, LAB.data, LAB.csv, LAB.store
assets/data.js        dữ liệu giả lập dạng gọn (sinh tự động, đừng sửa tay)
assets/m1.js … m8.js  mỗi buổi một tệp, đăng ký bằng LAB.module({id, tabs})
assets/style.css      giao diện sáng/tối, màu theo vai trò
data/                 CSV cho học viên tải
_build/               gen_data.py, AGENT.md (brief viết mô-đun), jscheck.py, selftest.sh, build_artifact.py
```

Kiểm tra sau khi sửa: `py -3.13 -X utf8 _build/jscheck.py assets/m5.js` (cú pháp) và `bash _build/selftest.sh 1400`
(dựng mọi tab bằng Chrome headless, báo FAIL/TRÀN). Không cần máy chủ: mở `index.html` trực tiếp cũng chạy.

## Xuất bản

Thư mục này là working tree của repo `nntminh1983/chinhphuso-virtual-lab`; GitHub Pages phục vụ nhánh `main`, thư mục gốc.
Cập nhật: `git add -A && git commit -m "..." && git push`. Pages dựng lại trong khoảng một phút.
