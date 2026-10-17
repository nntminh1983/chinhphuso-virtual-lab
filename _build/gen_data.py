# -*- coding: utf-8 -*-
"""Sinh dữ liệu GIẢ LẬP cho môn Chiến lược xây dựng và phát triển Chính phủ số.
Bối cảnh hư cấu: UBND Phường Mẫu, Tỉnh Mẫu (chính quyền địa phương 2 cấp, từ 01/7/2025).
Kết quả:
  data/*.csv            — học viên tải về thực hành (UTF-8 có BOM để Excel đọc đúng tiếng Việt)
  assets/data.js        — cùng dữ liệu, nhúng vào website (window.CPS_DATA)
  _build/dapan/*.csv    — đáp án (lỗi đã gieo) — KHÔNG đưa lên web
Chạy: py -3.13 -X utf8 _build/gen_data.py
Mầm ngẫu nhiên cố định → sinh lại cho ra đúng cùng một bộ dữ liệu.
"""
import csv, json, random, pathlib, datetime as dt

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data"; DATA.mkdir(exist_ok=True)
DAPAN = ROOT / "_build" / "dapan"; DAPAN.mkdir(exist_ok=True)
rng = random.Random(20261017)

def write_csv(path, header, rows):
    with open(path, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f); w.writerow(header); w.writerows(rows)
    print(f"  {path.relative_to(ROOT)}  ({len(rows)} dòng)")

def pick(seq, weights=None):
    return rng.choices(seq, weights=weights, k=1)[0]

# ---------------------------------------------------------------- tên người
HO = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"]
DEM_NAM = ["Văn", "Hữu", "Đức", "Minh", "Quốc", "Thanh", "Công", "Xuân", "Ngọc", "Tấn"]
DEM_NU = ["Thị", "Ngọc", "Thanh", "Thu", "Kim", "Mỹ", "Hồng", "Phương", "Bích", "Thuý"]
TEN_NAM = ["An", "Bình", "Cường", "Dũng", "Hải", "Hùng", "Khoa", "Long", "Nam", "Phúc", "Quân", "Sơn", "Tâm", "Thành", "Trung", "Tuấn", "Vinh", "Khang", "Đạt", "Hiếu"]
TEN_NU = ["Anh", "Chi", "Dung", "Hà", "Hạnh", "Hoa", "Huệ", "Lan", "Linh", "Mai", "Nga", "Ngân", "Nhung", "Oanh", "Phượng", "Quỳnh", "Thảo", "Trang", "Vân", "Yến"]
def ten_nguoi(gioi=None):
    g = gioi or pick(["Nam", "Nữ"])
    if g == "Nam":
        return f"{pick(HO)} {pick(DEM_NAM)} {pick(TEN_NAM)}", g
    return f"{pick(HO)} {pick(DEM_NU)} {pick(TEN_NU)}", g

KHU_PHO = [f"Khu phố {i}" for i in range(1, 9)]
DUONG = ["Nguyễn Huệ", "Lê Lợi", "Trần Hưng Đạo", "Hai Bà Trưng", "Lý Thường Kiệt", "Phan Đình Phùng", "Nguyễn Trãi", "Võ Thị Sáu", "Điện Biên Phủ", "Cách Mạng Tháng Tám"]
def dia_chi(kieu_cu=False):
    so = rng.randint(1, 350)
    if kieu_cu:   # địa chỉ 3 cấp cũ (còn cấp huyện) — lỗi cần phát hiện
        return f"{so} {pick(DUONG)}, Phường {rng.randint(1, 15)}, Quận {pick(['Mẫu', 'Trung Tâm'])}, Tỉnh Mẫu"
    return f"{so} {pick(DUONG)}, {pick(KHU_PHO)}, Phường Mẫu, Tỉnh Mẫu"

# ---------------------------------------------------------------- ngày làm việc
NGHI_LE = {dt.date(2025, 1, 1), dt.date(2025, 1, 27), dt.date(2025, 1, 28), dt.date(2025, 1, 29), dt.date(2025, 1, 30), dt.date(2025, 1, 31),
           dt.date(2025, 4, 7), dt.date(2025, 4, 30), dt.date(2025, 5, 1), dt.date(2025, 9, 1), dt.date(2025, 9, 2),
           dt.date(2026, 1, 1), dt.date(2026, 2, 16), dt.date(2026, 2, 17), dt.date(2026, 2, 18), dt.date(2026, 2, 19), dt.date(2026, 2, 20),
           dt.date(2026, 4, 26), dt.date(2026, 4, 30), dt.date(2026, 5, 1), dt.date(2026, 9, 2)}
def la_ngay_lam_viec(d): return d.weekday() < 5 and d not in NGHI_LE
def cong_ngay_lam_viec(d, n):
    while n > 0:
        d += dt.timedelta(days=1)
        if la_ngay_lam_viec(d): n -= 1
    return d
def dem_ngay_lam_viec(a, b):
    n = 0; d = a
    while d < b:
        d += dt.timedelta(days=1)
        if la_ngay_lam_viec(d): n += 1
    return n
def ngay_ngau_nhien(a, b):
    while True:
        d = a + dt.timedelta(days=rng.randint(0, (b - a).days))
        if la_ngay_lam_viec(d): return d

# ================================================================ A. SỔ HỒ SƠ TTHC
# (mức độ DVC trực tuyến theo NĐ 42/2022: toàn trình / một phần; lệ phí là SỐ MÔ PHỎNG)
THU_TUC = [
    # mã, tên, lĩnh vực, mức độ, hạn (ngày làm việc), lệ phí (đ), trọng số phát sinh
    ("HT01", "Đăng ký khai sinh", "Hộ tịch", "Toàn trình", 1, 0, 14),
    ("HT02", "Đăng ký kết hôn", "Hộ tịch", "Một phần", 1, 0, 5),
    ("HT03", "Đăng ký khai tử", "Hộ tịch", "Toàn trình", 1, 0, 4),
    ("HT04", "Cấp bản sao trích lục hộ tịch", "Hộ tịch", "Toàn trình", 1, 8000, 10),
    ("CT01", "Chứng thực bản sao từ bản chính", "Chứng thực", "Một phần", 1, 2000, 16),
    ("CT02", "Chứng thực chữ ký", "Chứng thực", "Một phần", 1, 10000, 6),
    ("CT03", "Chứng thực hợp đồng, giao dịch", "Chứng thực", "Một phần", 2, 50000, 3),
    ("CR01", "Đăng ký thường trú", "Cư trú", "Toàn trình", 7, 7000, 7),
    ("CR02", "Đăng ký tạm trú", "Cư trú", "Toàn trình", 3, 5000, 6),
    ("CR03", "Xác nhận thông tin về cư trú", "Cư trú", "Toàn trình", 1, 0, 5),
    ("KD01", "Đăng ký hộ kinh doanh", "Kinh doanh", "Toàn trình", 3, 50000, 5),
    ("KD02", "Thay đổi nội dung đăng ký hộ kinh doanh", "Kinh doanh", "Toàn trình", 3, 50000, 2),
    ("DD01", "Đăng ký biến động đất đai (cấp xã tiếp nhận)", "Đất đai", "Một phần", 10, 0, 4),
    ("DD02", "Xác nhận tình trạng đất, nhà ở", "Đất đai", "Một phần", 5, 0, 3),
    ("XD01", "Cấp giấy phép xây dựng nhà ở riêng lẻ", "Xây dựng", "Một phần", 15, 75000, 2),
    ("AS01", "Hỗ trợ chi phí mai táng", "An sinh xã hội", "Toàn trình", 10, 0, 2),
    ("AS02", "Trợ cấp xã hội hằng tháng cho người cao tuổi", "An sinh xã hội", "Toàn trình", 7, 0, 3),
    ("TP01", "Đăng ký giám hộ", "Tư pháp", "Một phần", 3, 0, 1),
    ("GD01", "Xác nhận hồ sơ nhập học đúng tuyến", "Giáo dục", "Toàn trình", 2, 0, 2),
]
CAN_BO = [f"CB{i:02d}" for i in range(1, 9)]
NHOM_TUOI = ["18–30", "31–45", "46–60", "Trên 60"]

def xu_huong_truc_tuyen(d):
    """tỉ lệ nộp trực tuyến tăng dần theo thời gian (0,42 → 0,80); bước nhảy sau 01/7/2025 (2 cấp, Cổng DVCQG)."""
    t = (d - dt.date(2025, 1, 1)).days / 640
    base = 0.42 + 0.30 * t
    if d >= dt.date(2025, 7, 1): base += 0.06
    return min(0.82, base)

def sinh_ho_so(n=1500):
    rows, stt = [], 0
    bat_dau, ket_thuc = dt.date(2025, 1, 2), dt.date(2026, 9, 30)
    ws = [t[6] for t in THU_TUC]
    for _ in range(n):
        tt = pick(THU_TUC, ws)
        ma_tt, ten_tt, linh_vuc, muc_do, han, phi, _w = tt
        ngay_nop = ngay_ngau_nhien(bat_dau, ket_thuc)
        stt += 1
        ma_hs = f"{ngay_nop:%y%m%d}-{stt:04d}"
        p_online = xu_huong_truc_tuyen(ngay_nop)
        if muc_do == "Một phần": p_online *= 0.7
        if pick(NHOM_TUOI, [30, 40, 22, 8]) == "Trên 60": p_online *= 0.55
        r = rng.random()
        kenh = "Trực tuyến" if r < p_online else ("Bưu chính" if r < p_online + 0.04 else "Trực tiếp")
        tuoi = pick(NHOM_TUOI, [30, 40, 22, 8])
        so_bs = pick([0, 0, 0, 0, 1, 1, 2], None)
        if kenh == "Trực tuyến" and muc_do == "Toàn trình": so_bs = pick([0, 0, 0, 0, 0, 1])
        han_tra = cong_ngay_lam_viec(ngay_nop, han)
        # trạng thái
        ngay_nay = dt.date(2026, 10, 15)
        if ngay_nop > ngay_nay - dt.timedelta(days=12) and rng.random() < 0.5:
            trang_thai = pick(["Đang xử lý", "Chờ bổ sung"], [3, 1]); ngay_tra = ""
        else:
            trang_thai = pick(["Đã trả kết quả", "Từ chối"], [97, 3])
            tre = rng.random() < (0.05 if kenh == "Trực tuyến" else 0.09) + 0.04 * so_bs
            ngay_tra = cong_ngay_lam_viec(han_tra, rng.randint(1, 4)) if tre else cong_ngay_lam_viec(ngay_nop, max(0, han - rng.randint(0, han)))
        dung_han = "" if not ngay_tra else ("Có" if ngay_tra <= han_tra else "Không")
        if phi == 0: tt_tt = "Không thu"
        elif kenh == "Trực tuyến": tt_tt = pick(["Có", "Không"], [0.78 if ngay_nop >= dt.date(2025, 7, 1) else 0.6, 0.3])
        else: tt_tt = pick(["Có", "Không"], [0.25, 0.75])
        if ngay_tra and trang_thai == "Đã trả kết quả" and rng.random() < 0.62:
            hl = pick([5, 4, 3, 2, 1], [48, 32, 12, 5, 3] if dung_han == "Có" else [15, 25, 30, 18, 12])
            if so_bs >= 2: hl = max(1, hl - 1)
        else: hl = ""
        so_hoa = "Có" if (ngay_tra and (kenh == "Trực tuyến" or rng.random() < (0.55 if ngay_nop.year == 2025 else 0.85))) else ("" if not ngay_tra else "Không")
        rows.append([ma_hs, ma_tt, ten_tt, linh_vuc, muc_do, kenh, ngay_nop.isoformat(), han, han_tra.isoformat(),
                     ngay_tra.isoformat() if ngay_tra else "", trang_thai, dung_han, so_bs, phi, tt_tt, so_hoa, hl, tuoi, pick(CAN_BO)])
    rows.sort(key=lambda r: r[6])
    return rows
HS_HEADER = ["ma_ho_so", "ma_thu_tuc", "thu_tuc", "linh_vuc", "muc_do_dvctt", "kenh_nop", "ngay_nop", "han_ngay_lam_viec", "ngay_hen_tra",
             "ngay_tra", "trang_thai", "dung_han", "so_lan_bo_sung", "le_phi_vnd", "thanh_toan_truc_tuyen", "ket_qua_so_hoa", "hai_long_1_5", "nhom_tuoi_nguoi_nop", "can_bo_xu_ly"]

# ================================================================ B. DÂN CƯ MẪU (có gieo lỗi chất lượng)
def sinh_dan_cu(n=400):
    rows, loi = [], []
    ids = set()
    for i in range(n):
        ten, gioi = ten_nguoi()
        ns = dt.date(rng.randint(1945, 2007), rng.randint(1, 12), rng.randint(1, 28))
        while True:
            dd = "0" + str(rng.randint(79, 96)) + str(rng.randint(0, 9)) + f"{rng.randint(0, 99999999):08d}"
            if dd not in ids: ids.add(dd); break
        sdt = "0" + pick(["3", "5", "7", "8", "9"]) + f"{rng.randint(0, 99999999):08d}"
        hn = pick(["Độc thân", "Đã kết hôn", "Ly hôn", "Goá"], [30, 55, 8, 7])
        cap_nhat = dt.date(2025, 7, 1) + dt.timedelta(days=rng.randint(0, 460))
        rec = dict(ma=f"DC{i + 1:04d}", ho_ten=ten, ngay_sinh=ns.strftime("%d/%m/%Y"), gioi_tinh=gioi, so_dinh_danh=dd,
                   dia_chi=dia_chi(), so_dien_thoai=sdt, tinh_trang_hon_nhan=hn, ngay_cap_nhat=cap_nhat.strftime("%d/%m/%Y"))
        rows.append(rec)
    # gieo lỗi: ~12 % bản ghi, mỗi loại lỗi có số lượng rõ ràng để chấm
    def danh_dau(idx, loai, mo_ta): loi.append([rows[idx]["ma"], loai, mo_ta])
    chon = rng.sample(range(n), 56)
    k = 0
    for j in range(8):   # trùng bản ghi (đổi cách viết tên)
        src = rows[chon[k]]; k += 1
        dup = dict(src); dup["ma"] = f"DC{len(rows) + 1:04d}"; dup["ho_ten"] = src["ho_ten"].upper() if j % 2 else src["ho_ten"].lower()
        rows.append(dup); loi.append([dup["ma"], "Trùng", f"Trùng số định danh với {src['ma']} (tên viết khác kiểu chữ)"])
    for j in range(8):   # số định danh sai độ dài
        i = chon[k]; k += 1
        rows[i]["so_dinh_danh"] = rows[i]["so_dinh_danh"][:11] if j % 2 else rows[i]["so_dinh_danh"] + "7"
        danh_dau(i, "Định danh sai", "Số định danh không đủ 12 chữ số")
    for j in range(8):   # ngày sinh sai định dạng / không hợp lệ
        i = chon[k]; k += 1
        rows[i]["ngay_sinh"] = pick(["1985-03-12", "12/3/85", "31/02/1990", "15/13/1978", "07/1992", "00/00/0000"])
        danh_dau(i, "Ngày sai", "Ngày sinh sai định dạng dd/mm/yyyy hoặc không tồn tại")
    for j in range(8):   # thiếu trường
        i = chon[k]; k += 1
        f = pick(["so_dien_thoai", "dia_chi", "gioi_tinh", "tinh_trang_hon_nhan"])
        rows[i][f] = ""; danh_dau(i, "Thiếu", f"Bỏ trống trường {f}")
    for j in range(8):   # địa chỉ 3 cấp cũ (còn cấp huyện)
        i = chon[k]; k += 1
        rows[i]["dia_chi"] = dia_chi(kieu_cu=True); danh_dau(i, "Địa chỉ cũ", "Địa chỉ còn ghi cấp huyện/quận (chính quyền 2 cấp từ 01/7/2025)")
    for j in range(8):   # giới tính không chuẩn hoá
        i = chon[k]; k += 1
        rows[i]["gioi_tinh"] = pick(["nam", "NỮ", "1", "F", "Nu"]); danh_dau(i, "Mã không chuẩn", "Giới tính không theo danh mục Nam/Nữ")
    for j in range(8):   # dữ liệu không 'sống' (cập nhật quá cũ) + số điện thoại sai
        i = chon[k]; k += 1
        rows[i]["ngay_cap_nhat"] = pick(["14/05/2019", "02/11/2020", "20/01/2018"]); danh_dau(i, "Cũ", "Chưa cập nhật từ trước 2021")
        if j % 2: rows[i]["so_dien_thoai"] = rows[i]["so_dien_thoai"][:9]; danh_dau(i, "SĐT sai", "Số điện thoại không đủ 10 chữ số")
    rng.shuffle(rows)
    return rows, loi
DC_HEADER = ["ma", "ho_ten", "ngay_sinh", "gioi_tinh", "so_dinh_danh", "dia_chi", "so_dien_thoai", "tinh_trang_hon_nhan", "ngay_cap_nhat"]

# ================================================================ C. DỮ LIỆU MỞ: ĐIỂM PHỤC VỤ CÔNG CỘNG
LOAI_DIEM = [("Trường mầm non", 6), ("Trường tiểu học", 5), ("Trường THCS", 3), ("Trạm y tế", 2), ("Nhà văn hoá khu phố", 8),
             ("Điểm bưu điện tiếp nhận hồ sơ", 3), ("Điểm hỗ trợ dịch vụ công trực tuyến", 6), ("Thư viện/điểm đọc", 2), ("Chợ dân sinh", 4), ("Công viên, sân chơi", 7)]
def sinh_diem_phuc_vu():
    rows, i = [], 0
    for loai, so in LOAI_DIEM:
        for j in range(so):
            i += 1
            ten = f"{loai} {pick(KHU_PHO)}" if "khu phố" in loai.lower() or loai.startswith("Nhà") else f"{loai} {pick(['Hoa Sen', 'Bình Minh', 'Sao Mai', 'Hướng Dương', 'Tuổi Thơ', 'Hoà Bình', 'Thống Nhất', 'Đoàn Kết', 'Số ' + str(j + 1)])}"
            rows.append([f"DPV{i:03d}", ten, loai, dia_chi(), round(10.76 + rng.random() * 0.05, 6), round(106.66 + rng.random() * 0.06, 6),
                         pick(["07:00–17:00", "07:30–11:30; 13:30–17:00", "06:00–21:00", "Cả ngày"]),
                         "0" + pick(["28", "3", "9"]) + f"{rng.randint(0, 9999999):07d}", pick(["Có", "Có", "Không"]),
                         (dt.date(2026, 1, 1) + dt.timedelta(days=rng.randint(0, 280))).isoformat(), "Công bố mở (dùng lại tự do, ghi nguồn)"])
    return rows
DPV_HEADER = ["ma", "ten_diem", "loai", "dia_chi", "vi_do", "kinh_do", "gio_mo_cua", "dien_thoai_lien_he", "tiep_can_nguoi_khuyet_tat", "ngay_cap_nhat", "dieu_kien_su_dung"]

# ================================================================ D. KIỂM KÊ HỆ THỐNG THÔNG TIN CỦA ĐƠN VỊ
HE_THONG = [
    # mã, tên, nghiệp vụ, dữ liệu chính, loại, năm, đơn vị cung cấp, nơi đặt, cấp độ ATTT, kết nối nền tảng chia sẻ, chi phí/năm (triệu), tình trạng
    ("HT01", "Hệ thống thông tin giải quyết TTHC (một cửa điện tử) cấp tỉnh", "Tiếp nhận, xử lý, trả kết quả TTHC", "Hồ sơ TTHC", "Hệ thống của tỉnh", 2023, "Doanh nghiệp A", "Trung tâm dữ liệu tỉnh", 3, "Có", 0, "Đang dùng"),
    ("HT02", "Cổng Dịch vụ công quốc gia (kết nối)", "Nộp hồ sơ trực tuyến, thanh toán", "Hồ sơ TTHC, giao dịch", "Nền tảng dùng chung quốc gia", 2019, "Trung ương", "Trung ương", 4, "Có", 0, "Đang dùng"),
    ("HT03", "Hệ thống quản lý văn bản và điều hành", "Văn bản đi, đến, ký số, điều hành", "Văn bản điện tử", "Hệ thống của tỉnh", 2020, "Doanh nghiệp B", "Trung tâm dữ liệu tỉnh", 2, "Không", 0, "Đang dùng"),
    ("HT04", "Phần mềm hộ tịch điện tử dùng chung", "Đăng ký hộ tịch", "Hộ tịch", "Nền tảng dùng chung quốc gia", 2016, "Bộ Tư pháp", "Trung ương", 3, "Có", 0, "Đang dùng"),
    ("HT05", "Phần mềm chứng thực điện tử", "Chứng thực bản sao, chữ ký", "Chứng thực", "Nền tảng dùng chung quốc gia", 2021, "Trung ương", "Trung ương", 2, "Có", 0, "Đang dùng"),
    ("HT06", "Hệ thống thông tin đất đai (cấp xã truy cập)", "Biến động đất đai", "Thửa đất, chủ sử dụng", "Hệ thống của tỉnh", 2022, "Doanh nghiệp C", "Trung tâm dữ liệu tỉnh", 3, "Có", 0, "Đang dùng"),
    ("HT07", "Phần mềm quản lý hộ kinh doanh (tự mua)", "Đăng ký hộ kinh doanh", "Hộ kinh doanh", "Hệ thống đơn vị tự mua", 2019, "Doanh nghiệp D", "Máy chủ tại đơn vị", 0, "Không", 18, "Trùng chức năng"),
    ("HT08", "Phần mềm quản lý đối tượng bảo trợ xã hội", "Chi trả trợ cấp", "Đối tượng an sinh", "Hệ thống của tỉnh", 2021, "Doanh nghiệp B", "Trung tâm dữ liệu tỉnh", 2, "Không", 0, "Đang dùng"),
    ("HT09", "Bảng tính Excel theo dõi hồ sơ xây dựng", "Cấp phép xây dựng", "Giấy phép xây dựng", "Hệ thống đơn vị tự mua", 2017, "Tự làm", "Máy tính cá nhân", 0, "Không", 0, "Ít dùng"),
    ("HT10", "Cổng thông tin điện tử của phường", "Công khai thông tin", "Tin bài, văn bản công khai", "Hệ thống của tỉnh", 2024, "Doanh nghiệp A", "Trung tâm dữ liệu tỉnh", 2, "Không", 0, "Đang dùng"),
    ("HT11", "Hệ thống thư điện tử công vụ", "Trao đổi công việc", "Thư điện tử", "Hệ thống của tỉnh", 2015, "Doanh nghiệp B", "Trung tâm dữ liệu tỉnh", 2, "Không", 0, "Đang dùng"),
    ("HT12", "Hệ thống hội nghị trực tuyến", "Họp trực tuyến tỉnh – xã", "Video", "Hệ thống của tỉnh", 2020, "Doanh nghiệp E", "Đám mây", 1, "Không", 0, "Đang dùng"),
    ("HT13", "Phần mềm kế toán hành chính sự nghiệp", "Kế toán, ngân sách", "Tài chính kế toán", "Hệ thống đơn vị tự mua", 2018, "Doanh nghiệp F", "Máy chủ tại đơn vị", 0, "Không", 12, "Đang dùng"),
    ("HT14", "Phần mềm quản lý cán bộ, công chức (tự mua)", "Hồ sơ cán bộ", "Cán bộ, công chức", "Hệ thống đơn vị tự mua", 2019, "Doanh nghiệp D", "Máy chủ tại đơn vị", 0, "Không", 9, "Trùng chức năng"),
    ("HT15", "Hệ thống báo cáo điện tử của tỉnh", "Báo cáo định kỳ", "Số liệu báo cáo", "Hệ thống của tỉnh", 2022, "Doanh nghiệp A", "Trung tâm dữ liệu tỉnh", 2, "Không", 0, "Ít dùng"),
    ("HT16", "Nhóm Zalo điều hành nội bộ", "Trao đổi nhanh, chuyển hồ sơ", "Tin nhắn, ảnh hồ sơ", "Ứng dụng công cộng", 2019, "Công cộng", "Đám mây công cộng", 0, "Không", 0, "Đang dùng"),
    ("HT17", "Camera giám sát khu vực một cửa", "An ninh trật tự", "Hình ảnh", "Hệ thống đơn vị tự mua", 2021, "Doanh nghiệp G", "Máy chủ tại đơn vị", 0, "Không", 4, "Đang dùng"),
    ("HT18", "Ứng dụng phản ánh hiện trường của tỉnh", "Tiếp nhận phản ánh của người dân", "Phản ánh, kiến nghị", "Hệ thống của tỉnh", 2023, "Doanh nghiệp E", "Đám mây", 2, "Không", 0, "Đang dùng"),
]
HTTT_HEADER = ["ma", "ten_he_thong", "nghiep_vu_phuc_vu", "du_lieu_chinh", "loai", "nam_dua_vao_su_dung", "don_vi_cung_cap", "noi_dat", "cap_do_attt_da_xac_dinh", "ket_noi_nen_tang_chia_se", "chi_phi_nam_trieu_dong", "tinh_trang"]

# ================================================================ E. KPI THEO QUÝ 2024Q1–2026Q3
def sinh_kpi():
    rows = []
    quys = [(y, q) for y in (2024, 2025, 2026) for q in (1, 2, 3, 4)][:11]
    for idx, (y, q) in enumerate(quys):
        t = idx / 10
        buoc = 1 if (y, q) >= (2025, 3) else 0
        rows.append([f"{y}-Q{q}",
                     round(38 + 36 * t + 5 * buoc + rng.uniform(-1.5, 1.5), 1),      # tỉ lệ hồ sơ nộp trực tuyến
                     round(28 + 40 * t + 6 * buoc + rng.uniform(-1.5, 1.5), 1),      # tỉ lệ hồ sơ toàn trình
                     round(90 + 6 * t + rng.uniform(-1, 1), 1),                      # tỉ lệ đúng hạn
                     round(22 + 48 * t + 4 * buoc + rng.uniform(-2, 2), 1),          # thanh toán trực tuyến
                     round(45 + 50 * t + rng.uniform(-2, 2), 1),                     # kết quả được số hoá
                     round(3.9 + 0.7 * t + rng.uniform(-0.05, 0.05), 2),             # điểm hài lòng /5
                     round(55 + 43 * t + rng.uniform(-2, 2), 1),                     # cán bộ có chữ ký số
                     rng.randint(0, 3) if idx < 6 else rng.randint(0, 1),            # sự cố ATTT
                     round(20 + 70 * t + rng.uniform(-3, 3), 1),                     # cán bộ hoàn thành bồi dưỡng kỹ năng số
                     round(1.8 - 1.2 * t + rng.uniform(-0.1, 0.1), 2)])              # số lần đi lại trung bình/hồ sơ
    return rows
KPI_HEADER = ["quy", "ty_le_ho_so_truc_tuyen_pct", "ty_le_ho_so_toan_trinh_pct", "ty_le_dung_han_pct", "ty_le_thanh_toan_truc_tuyen_pct",
              "ty_le_ket_qua_so_hoa_pct", "diem_hai_long_tren_5", "ty_le_can_bo_co_chu_ky_so_pct", "so_su_co_attt", "ty_le_can_bo_hoan_thanh_boi_duong_pct", "so_lan_di_lai_tb_moi_ho_so"]

# ================================================================ F. KHẢO SÁT NĂNG LỰC SỐ CÁN BỘ
KY_NANG = ["su_dung_he_thong_mot_cua", "ky_so_van_ban", "xu_ly_van_ban_dien_tu", "khai_thac_csdl_quoc_gia", "bao_mat_thong_tin", "dung_tro_ly_ao_ai", "phan_tich_so_lieu", "huong_dan_nguoi_dan_dvctt"]
NHOM_CB = [("Lãnh đạo", 6), ("Chuyên trách CNTT", 2), ("Công chức chuyên môn", 24), ("Người hoạt động không chuyên trách", 10), ("Hợp đồng/hỗ trợ", 8)]
def sinh_khao_sat():
    rows, i = [], 0
    for nhom, so in NHOM_CB:
        for _ in range(so):
            i += 1
            ten, gioi = ten_nguoi()
            tuoi = pick(NHOM_TUOI[:3], [25, 50, 25])
            base = {"Lãnh đạo": 3.0, "Chuyên trách CNTT": 4.3, "Công chức chuyên môn": 3.3, "Người hoạt động không chuyên trách": 2.6, "Hợp đồng/hỗ trợ": 2.9}[nhom]
            if tuoi == "46–60": base -= 0.5
            diem = []
            for kn in KY_NANG:
                adj = {"dung_tro_ly_ao_ai": -0.9, "phan_tich_so_lieu": -0.7, "khai_thac_csdl_quoc_gia": -0.4, "bao_mat_thong_tin": -0.3, "ky_so_van_ban": 0.3 if nhom == "Lãnh đạo" else 0}.get(kn, 0)
                diem.append(max(1, min(5, round(base + adj + rng.gauss(0, 0.7)))))
            yeu = KY_NANG[diem.index(min(diem))]
            rows.append([f"CB{i:03d}", nhom, gioi, tuoi, *diem, pick(["Có", "Có", "Không"]), yeu])
    return rows
KS_HEADER = ["ma_can_bo", "nhom", "gioi_tinh", "nhom_tuoi", *KY_NANG, "san_sang_hoc_truc_tuyen", "ky_nang_can_boi_duong_nhat"]

# ================================================================ G. DANH MỤC VĂN BẢN (sự thật đã kiểm chứng trong _build/CANCU.md của khoá học)
VAN_BAN = [
    # ký hiệu, tên ngắn, tầng, cơ quan, ngày ban hành, hiệu lực, tình trạng, văn bản thay thế/sửa đổi, ghi chú
    ("NQ 52-NQ/TW", "Chủ động tham gia Cách mạng công nghiệp lần thứ tư", "Chủ trương", "Bộ Chính trị", "27/09/2019", "27/09/2019", "Còn hiệu lực", "", ""),
    ("NQ 57-NQ/TW", "Đột phá phát triển KHCN, ĐMST và chuyển đổi số quốc gia", "Chủ trương", "Bộ Chính trị", "22/12/2024", "22/12/2024", "Còn hiệu lực", "", "Chỉ tiêu 2030: kinh tế số ≥ 30 % GDP; chi ≥ 3 % ngân sách cho KHCN"),
    ("Luật 67/2006/QH11", "Luật Công nghệ thông tin", "Luật", "Quốc hội", "29/06/2006", "01/01/2007", "Còn hiệu lực", "", ""),
    ("Luật 86/2015/QH13", "Luật An toàn thông tin mạng", "Luật", "Quốc hội", "19/11/2015", "01/07/2016", "Hết hiệu lực 01/07/2026", "Luật 116/2025/QH15", "Nền móng khái niệm 5 cấp độ"),
    ("Luật 104/2016/QH13", "Luật Tiếp cận thông tin", "Luật", "Quốc hội", "06/04/2016", "01/07/2018", "Còn hiệu lực", "", ""),
    ("Luật 24/2018/QH14", "Luật An ninh mạng (cũ)", "Luật", "Quốc hội", "12/06/2018", "01/01/2019", "Hết hiệu lực 01/07/2026", "Luật 116/2025/QH15", ""),
    ("Luật 20/2023/QH15", "Luật Giao dịch điện tử", "Luật", "Quốc hội", "22/06/2023", "01/07/2024", "Còn hiệu lực", "", "Thay Luật 51/2005/QH11"),
    ("Luật 60/2024/QH15", "Luật Dữ liệu", "Luật", "Quốc hội", "30/11/2024", "01/07/2025", "Còn hiệu lực", "", "Trung tâm dữ liệu quốc gia; CSDL tổng hợp quốc gia; 5 chương 46 điều"),
    ("Luật 71/2025/QH15", "Luật Công nghiệp công nghệ số", "Luật", "Quốc hội", "14/06/2025", "01/01/2026", "Còn hiệu lực", "", ""),
    ("Luật 91/2025/QH15", "Luật Bảo vệ dữ liệu cá nhân", "Luật", "Quốc hội", "26/06/2025", "01/01/2026", "Còn hiệu lực", "", "Nâng cấp từ NĐ 13/2023/NĐ-CP"),
    ("Luật 116/2025/QH15", "Luật An ninh mạng (mới)", "Luật", "Quốc hội", "10/12/2025", "01/07/2026", "Còn hiệu lực", "", "Thay cả Luật 86/2015 và Luật 24/2018; 8 chương 45 điều"),
    ("NQ 36a/NQ-CP", "Về Chính phủ điện tử", "Chiến lược/chương trình", "Chính phủ", "14/10/2015", "14/10/2015", "Đã hoàn thành giai đoạn", "", ""),
    ("NQ 17/NQ-CP", "Nhiệm vụ, giải pháp phát triển CPĐT 2019–2020, định hướng 2025", "Chiến lược/chương trình", "Chính phủ", "07/03/2019", "07/03/2019", "Đã hoàn thành giai đoạn", "", ""),
    ("QĐ 749/QĐ-TTg", "Chương trình Chuyển đổi số quốc gia đến 2025, định hướng 2030", "Chiến lược/chương trình", "Thủ tướng Chính phủ", "03/06/2020", "03/06/2020", "Kết thúc giai đoạn 2025", "QĐ 1266/QĐ-TTg", ""),
    ("QĐ 942/QĐ-TTg", "Chiến lược phát triển CPĐT hướng tới CPS 2021–2025", "Chiến lược/chương trình", "Thủ tướng Chính phủ", "15/06/2021", "15/06/2021", "Kết thúc giai đoạn 2025", "QĐ 1266/QĐ-TTg", ""),
    ("QĐ 06/QĐ-TTg", "Đề án 06: dữ liệu dân cư, định danh và xác thực điện tử", "Chiến lược/chương trình", "Thủ tướng Chính phủ", "06/01/2022", "06/01/2022", "Còn hiệu lực", "", ""),
    ("NQ 03/NQ-CP", "Chương trình hành động thực hiện NQ 57-NQ/TW", "Chiến lược/chương trình", "Chính phủ", "09/01/2025", "09/01/2025", "Còn hiệu lực", "NQ 71/NQ-CP (sửa đổi, bổ sung)", ""),
    ("NQ 71/NQ-CP", "Sửa đổi, bổ sung Chương trình hành động thực hiện NQ 57", "Chiến lược/chương trình", "Chính phủ", "01/04/2025", "01/04/2025", "Còn hiệu lực", "", "DVC trực tuyến toàn trình đạt 90 % vào 2030"),
    ("QĐ 1266/QĐ-TTg", "Chiến lược quốc gia về chuyển đổi số 2026–2030, định hướng 2045", "Chiến lược/chương trình", "Thủ tướng Chính phủ", "14/07/2026", "14/07/2026", "Còn hiệu lực", "", "100 % hồ sơ số hoá; 99 % hài lòng; nhóm 50 nước dẫn đầu EGDI"),
    ("NĐ 45/2020/NĐ-CP", "Thực hiện TTHC trên môi trường điện tử", "Nghị định/thông tư", "Chính phủ", "08/04/2020", "22/05/2020", "Còn hiệu lực (đã sửa đổi)", "NĐ 310/2026/NĐ-CP (sửa đổi)", ""),
    ("NĐ 47/2020/NĐ-CP", "Quản lý, kết nối và chia sẻ dữ liệu số của cơ quan nhà nước", "Nghị định/thông tư", "Chính phủ", "09/04/2020", "25/05/2020", "Hết hiệu lực 22/10/2025", "NĐ 278/2025/NĐ-CP", "Phần dữ liệu mở (Điều 17–21) bị bãi bỏ sớm hơn, từ 19/8/2025 bởi NĐ 194/2025"),
    ("NĐ 42/2022/NĐ-CP", "Cung cấp thông tin và dịch vụ công trực tuyến", "Nghị định/thông tư", "Chính phủ", "24/06/2022", "15/08/2022", "Còn hiệu lực", "", "Phân loại toàn trình / một phần"),
    ("NĐ 13/2023/NĐ-CP", "Bảo vệ dữ liệu cá nhân", "Nghị định/thông tư", "Chính phủ", "17/04/2023", "01/07/2023", "Hết hiệu lực 01/01/2026", "NĐ 356/2025/NĐ-CP", ""),
    ("NĐ 69/2024/NĐ-CP", "Định danh và xác thực điện tử", "Nghị định/thông tư", "Chính phủ", "25/06/2024", "01/07/2024", "Còn hiệu lực (đã sửa đổi)", "NĐ 320/2026/NĐ-CP (sửa đổi)", ""),
    ("NĐ 47/2024/NĐ-CP", "Danh mục cơ sở dữ liệu quốc gia (10 CSDL)", "Nghị định/thông tư", "Chính phủ", "09/05/2024", "09/05/2024", "Bị bãi bỏ 19/08/2025", "QĐ 11/2026/QĐ-TTg", ""),
    ("NĐ 55/2025/NĐ-CP", "Chức năng, nhiệm vụ, cơ cấu tổ chức Bộ Khoa học và Công nghệ", "Nghị định/thông tư", "Chính phủ", "02/03/2025", "01/03/2025", "Còn hiệu lực", "", "Hợp nhất Bộ TT&TT vào Bộ KH&CN"),
    ("NĐ 118/2025/NĐ-CP", "Một cửa, một cửa liên thông tại Bộ phận Một cửa và Cổng DVC quốc gia", "Nghị định/thông tư", "Chính phủ", "09/06/2025", "01/07/2025", "Còn hiệu lực", "", ""),
    ("NĐ 165/2025/NĐ-CP", "Quy định chi tiết Luật Dữ liệu", "Nghị định/thông tư", "Chính phủ", "30/06/2025", "01/07/2025", "Còn hiệu lực", "", ""),
    ("NĐ 194/2025/NĐ-CP", "CSDL quốc gia, kết nối chia sẻ dữ liệu, dữ liệu mở (chi tiết Luật GDĐT)", "Nghị định/thông tư", "Chính phủ", "03/07/2025", "19/08/2025", "Còn hiệu lực", "", "Chương IV: dữ liệu mở"),
    ("NĐ 278/2025/NĐ-CP", "Kết nối, chia sẻ dữ liệu bắt buộc trong hệ thống chính trị", "Nghị định/thông tư", "Chính phủ", "22/10/2025", "22/10/2025", "Còn hiệu lực", "", "Thay NĐ 47/2020; qua Nền tảng chia sẻ, điều phối dữ liệu"),
    ("NĐ 356/2025/NĐ-CP", "Quy định chi tiết Luật Bảo vệ dữ liệu cá nhân", "Nghị định/thông tư", "Chính phủ", "31/12/2025", "01/01/2026", "Còn hiệu lực", "", "Thay NĐ 13/2023"),
    ("NĐ 45/2026/NĐ-CP", "Quản lý đầu tư ứng dụng CNTT dùng ngân sách nhà nước", "Nghị định/thông tư", "Chính phủ", "26/01/2026", "01/03/2026", "Còn hiệu lực", "", "Thay NĐ 73/2019; gồm thuê dịch vụ CNTT"),
    ("QĐ 11/2026/QĐ-TTg", "Danh mục cơ sở dữ liệu quốc gia (20 CSDL)", "Nghị định/thông tư", "Thủ tướng Chính phủ", "28/03/2026", "19/05/2026", "Còn hiệu lực", "", ""),
    ("NĐ 310/2026/NĐ-CP", "Sửa đổi NĐ 45/2020 về TTHC trên môi trường điện tử", "Nghị định/thông tư", "Chính phủ", "2026", "05/08/2026", "Còn hiệu lực", "", "Bộ Công an vận hành Cổng DVC quốc gia"),
    ("NĐ 320/2026/NĐ-CP", "Sửa đổi NĐ 69/2024 về định danh và xác thực điện tử", "Nghị định/thông tư", "Chính phủ", "13/08/2026", "28/09/2026", "Còn hiệu lực", "", "Không yêu cầu nộp giấy tờ khi dữ liệu đã tích hợp"),
    ("NĐ 331/2026/NĐ-CP", "Bảo vệ an ninh mạng đối với hệ thống thông tin (cấp độ)", "Nghị định/thông tư", "Chính phủ", "19/08/2026", "19/08/2026", "Còn hiệu lực", "", "Giữ mô hình 5 cấp độ"),
    ("QĐ 2323/QĐ-BTTTT", "Khung Kiến trúc Chính phủ điện tử Việt Nam 2.0", "Văn bản của Bộ", "Bộ Thông tin và Truyền thông", "31/12/2019", "31/12/2019", "Được thay thế", "QĐ 2568/QĐ-BTTTT", ""),
    ("QĐ 2568/QĐ-BTTTT", "Khung Kiến trúc Chính phủ điện tử Việt Nam 3.0", "Văn bản của Bộ", "Bộ Thông tin và Truyền thông", "29/12/2023", "29/12/2023", "Được thay thế", "QĐ 292/QĐ-BKHCN", ""),
    ("QĐ 292/QĐ-BKHCN", "Khung Kiến trúc Chính phủ số Việt Nam 4.0", "Văn bản của Bộ", "Bộ Khoa học và Công nghệ", "25/03/2025", "25/03/2025", "Còn hiệu lực", "", "5 mô hình tham chiếu; 5 kiến trúc thành phần"),
    ("QĐ 405/QĐ-BKHCN", "Bộ chỉ số đánh giá chuyển đổi số (DTI)", "Văn bản của Bộ", "Bộ Khoa học và Công nghệ", "03/04/2025", "03/04/2025", "Còn hiệu lực", "", "Thang 1.000 điểm; cấp tỉnh 3 trụ cột, 8 chỉ số chính"),
]
VB_HEADER = ["ky_hieu", "ten_ngan", "tang", "co_quan_ban_hanh", "ngay_ban_hanh", "hieu_luc_tu", "tinh_trang", "van_ban_thay_the_sua_doi", "ghi_chu"]

# ================================================================ H. EGDI VIỆT NAM (số liệu Liên Hợp Quốc, đã kiểm chứng)
EGDI = [[2014, 99, 0.4705, "Trung bình"], [2016, 89, 0.5143, "Trung bình"], [2018, 88, 0.5931, "Cao"], [2020, 86, 0.6667, "Cao"], [2022, 86, 0.6787, "Cao"], [2024, 71, 0.7709, "Rất cao"]]
EGDI_HEADER = ["ky_khao_sat", "thu_hang_tren_193", "diem_egdi", "nhom"]

# ================================================================ chạy
def main():
    print("Sinh dữ liệu giả lập …")
    hs = sinh_ho_so(); write_csv(DATA / "ho_so_tthc_phuong_mau.csv", HS_HEADER, hs)
    dc, loi = sinh_dan_cu(); dc_rows = [[r[k] for k in DC_HEADER] for r in dc]
    write_csv(DATA / "dan_cu_mau_can_lam_sach.csv", DC_HEADER, dc_rows)
    write_csv(DAPAN / "dan_cu_mau_dap_an_loi.csv", ["ma", "loai_loi", "mo_ta"], loi)
    dpv = sinh_diem_phuc_vu(); write_csv(DATA / "du_lieu_mo_diem_phuc_vu.csv", DPV_HEADER, dpv)
    write_csv(DATA / "kiem_ke_he_thong_thong_tin.csv", HTTT_HEADER, [list(r) for r in HE_THONG])
    kpi = sinh_kpi(); write_csv(DATA / "kpi_chuyen_doi_so_theo_quy.csv", KPI_HEADER, kpi)
    ks = sinh_khao_sat(); write_csv(DATA / "khao_sat_nang_luc_so_can_bo.csv", KS_HEADER, ks)
    write_csv(DATA / "danh_muc_van_ban_phap_ly.csv", VB_HEADER, [list(r) for r in VAN_BAN])
    write_csv(DATA / "egdi_viet_nam_2014_2024.csv", EGDI_HEADER, EGDI)
    # mô tả bộ dữ liệu (dữ liệu đặc tả) cho tab dữ liệu mở
    meta = {
        "ho_so": {"ten": "Sổ hồ sơ TTHC của UBND Phường Mẫu 01/2025–09/2026", "tep": "ho_so_tthc_phuong_mau.csv", "cot": HS_HEADER, "mo_ta": "Mỗi dòng một hồ sơ; ngày theo ISO yyyy-mm-dd; lệ phí là số mô phỏng; hạn tính theo ngày làm việc."},
        "dan_cu": {"ten": "Trích xuất dân cư mẫu cần làm sạch", "tep": "dan_cu_mau_can_lam_sach.csv", "cot": DC_HEADER, "mo_ta": "Toàn bộ là NHÂN THÂN HƯ CẤU; đã gieo khoảng 60 lỗi chất lượng thuộc 8 loại để học viên phát hiện."},
        "diem_phuc_vu": {"ten": "Dữ liệu mở: điểm phục vụ công cộng trên địa bàn Phường Mẫu", "tep": "du_lieu_mo_diem_phuc_vu.csv", "cot": DPV_HEADER, "mo_ta": "Bộ dữ liệu mở mẫu; toạ độ và số điện thoại hư cấu; điều kiện sử dụng: Công bố mở."},
        "he_thong": {"ten": "Kiểm kê hệ thống thông tin đang dùng tại đơn vị", "tep": "kiem_ke_he_thong_thong_tin.csv", "cot": HTTT_HEADER, "mo_ta": "18 hệ thống; cấp độ 0 = chưa xác định cấp độ an toàn hệ thống thông tin."},
        "kpi": {"ten": "KPI chuyển đổi số theo quý 2024Q1–2026Q3", "tep": "kpi_chuyen_doi_so_theo_quy.csv", "cot": KPI_HEADER, "mo_ta": "Số liệu mô phỏng của Phường Mẫu."},
        "khao_sat": {"ten": "Khảo sát năng lực số 50 cán bộ (thang 1–5)", "tep": "khao_sat_nang_luc_so_can_bo.csv", "cot": KS_HEADER, "mo_ta": "Tự đánh giá 8 kỹ năng; 5 nhóm cán bộ."},
        "van_ban": {"ten": "Danh mục văn bản pháp lý về Chính phủ số (đã kiểm chứng đến 24/9/2026)", "tep": "danh_muc_van_ban_phap_ly.csv", "cot": VB_HEADER, "mo_ta": "Trích từ CANCU.md của khoá học; tình trạng hiệu lực tính đến 10/2026."},
        "egdi": {"ten": "EGDI Việt Nam 2014–2024 (Liên Hợp Quốc)", "tep": "egdi_viet_nam_2014_2024.csv", "cot": EGDI_HEADER, "mo_ta": "Số liệu thật từ UN E-Government Survey."},
    }
    (DATA / "mo_ta_bo_du_lieu.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf-8")
    # dạng gọn {h: [cột], r: [[giá trị]]} — core.js (LAB.data) tự chuyển thành mảng object khi truy cập
    def tbl(header, rows): return {"h": list(header), "r": [list(r) for r in rows]}
    js = {
        "thu_tuc": tbl(["ma", "ten", "linh_vuc", "muc_do", "han_ngay", "le_phi", "trong_so"], THU_TUC),
        "ho_so": tbl(HS_HEADER, hs), "dan_cu": tbl(DC_HEADER, dc_rows), "diem_phuc_vu": tbl(DPV_HEADER, dpv),
        "he_thong": tbl(HTTT_HEADER, HE_THONG), "kpi": tbl(KPI_HEADER, kpi), "khao_sat": tbl(KS_HEADER, ks),
        "van_ban": tbl(VB_HEADER, VAN_BAN), "egdi": tbl(EGDI_HEADER, EGDI), "meta": meta,
        "ky_nang": KY_NANG,
    }
    out = "/* Dữ liệu GIẢ LẬP của website — sinh bởi _build/gen_data.py; đừng sửa tay. Bối cảnh hư cấu: UBND Phường Mẫu, Tỉnh Mẫu. */\nwindow.CPS_DATA = " + json.dumps(js, ensure_ascii=False, separators=(",", ":")) + ";\n"
    (ROOT / "assets" / "data.js").write_text(out, encoding="utf-8")
    print(f"  assets/data.js  ({len(out) // 1024} KB)")
    print("Xong.")

if __name__ == "__main__":
    main()
