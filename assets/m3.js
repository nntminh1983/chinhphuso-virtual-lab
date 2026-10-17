/* Mô-đun m3 — Buổi 3: Kinh nghiệm quốc tế và các khung đánh giá (Bài 3)
   Tab: congthuc (công thức EGDI), vietnam (chặng đường 2014–2024), tucham (tự chấm cổng theo OSI rút gọn),
   oecd (sáu chiều khung OECD), baihoc (bốn bài học quốc tế và giới hạn sao chép).
   Số liệu thật chỉ lấy từ CANCU.md mục F (EGDI Việt Nam) và LAB.data.egdi; mọi số liệu của Phường Mẫu là hư cấu. */
(function () {
"use strict";
const { h, ui, chart } = LAB;

/* ---------- tiện ích dùng chung trong mô-đun ---------- */
const f4 = v => LAB.num(v, 4);
/* nhóm EGDI theo ngưỡng của Liên Hợp Quốc: Rất cao ≥ 0,75; Cao 0,50–0,75; Trung bình 0,25–0,50; Thấp < 0,25 */
const NGUONG = [[0.75, "Rất cao", "ok"], [0.5, "Cao", "pt"], [0.25, "Trung bình", "key"], [0, "Thấp", "eve"]];
const nhomEGDI = v => NGUONG.find(n => v >= n[0]) || NGUONG[3];
const nguongKe = v => { const n = NGUONG.find(x => v >= x[0]); const i = NGUONG.indexOf(n); return i > 0 ? NGUONG[i - 1][0] : null; };
const clamp01 = v => Math.max(0, Math.min(1, +v || 0));
const rowBtns = (...b) => h("div", { class: "row" }, ...b);
const ol = items => h("ul", { class: "small", style: { margin: "0", paddingLeft: "18px" } }, items.map(t => h("li", { html: t })));

LAB.module({
  id: "m3",
  tabs: [

  /* ===================================================== TAB 1: CÔNG THỨC EGDI ===================================================== */
  { id: "congthuc", title: "Công thức EGDI",
    intro: "EGDI là trung bình cộng của ba chỉ số thành phần OSI, TII, HCI (mỗi chỉ số từ 0 đến 1, trọng số bằng nhau). EPI được công bố kèm nhưng <b>không</b> nằm trong công thức. Kéo ba thanh trượt để xem EGDI, nhóm xếp loại và độ nhạy (Khảo sát Chính phủ điện tử 2024 của Liên Hợp Quốc, trang 5).",
    build(pane) {
      /* Ba thanh trượt OSI/TII/HCI → EGDI, nhóm, sơ đồ, bảng độ nhạy. Preset Việt Nam 2024 chỉ biết EGDI nên đặt ba chân bằng nhau (minh hoạ). */
      const S = { osi: 0.5, tii: 0.5, hci: 0.5, ghichu: "" };
      const { root, ctrl, view } = ui.sim();
      const mk = (k, label, hint) => ui.range({ id: "m3ct-" + k, label, min: 0, max: 1, step: 0.0001, value: S[k], fmt: f4, hint, onInput: v => { S[k] = v; S.ghichu = ""; draw(); } });
      const rO = mk("osi", "OSI – Dịch vụ trực tuyến", "Chuyên gia vào cổng quốc gia, thử từng thao tác rồi chấm. Chỉ số có thể cải thiện nhanh nhất.");
      const rT = mk("tii", "TII – Hạ tầng viễn thông", "Người dùng internet, thuê bao di động, băng rộng, giá cước so với thu nhập. Đổi chậm.");
      const rH = mk("hci", "HCI – Nguồn nhân lực", "Biết chữ, nhập học, số năm đi học; từ kỳ 2024 thêm hiểu biết về chính phủ số. Đổi chậm.");
      const set = (a, b, c, gc) => { S.osi = a; S.tii = b; S.hci = c; S.ghichu = gc || ""; rO.set(a); rT.set(b); rH.set(c); draw(); };
      ctrl.append(rO, rT, rH,
        ui.presets([
          { label: "Việt Nam 2024: EGDI 0,7709", apply: () => set(0.7709, 0.7709, 0.7709, "Minh hoạ: kỳ 2024 Việt Nam đạt EGDI 0,7709 (CANCU mục F). Ba thanh được đặt <b>bằng nhau</b> cho ra đúng EGDI này; <b>không</b> phải giá trị OSI/TII/HCI thật của Việt Nam.") },
          { label: "Ngưỡng Rất cao 0,75", apply: () => set(0.75, 0.75, 0.75, "Ba chỉ số cùng bằng 0,75 thì EGDI vừa chạm ngưỡng nhóm Rất cao.") },
          { label: "Một chân yếu", apply: () => set(0.9, 0.9, 0.45, "Hai chỉ số rất cao nhưng một chỉ số yếu kéo trung bình cộng xuống: muốn nâng EGDI phải nâng cả ba chân.") },
        ]),
        rowBtns(ui.btn("Làm lại", () => set(0.5, 0.5, 0.5))),
        ui.cancu("Quyết định 1266/QĐ-TTg ngày 14/7/2026 của Thủ tướng Chính phủ", "Đến 2030 Việt Nam thuộc nhóm 50 nước dẫn đầu thế giới về chính phủ điện tử theo đánh giá của Liên Hợp Quốc; tầm nhìn 2045 thuộc nhóm 30 nước dẫn đầu về chính phủ số."),
        ui.cancu("Nghị quyết 57-NQ/TW ngày 22/12/2024 của Bộ Chính trị", "Đến 2030 thuộc nhóm 50 nước đứng đầu thế giới về năng lực cạnh tranh số; nhóm 3 nước dẫn đầu Đông Nam Á."));

      const out = ui.slot(), sodo = ui.slot(), bang = ui.slot();
      view.append(out, sodo, bang,
        ui.panel("Mỗi chỉ số đo gì — nói bằng việc của một phường",
          ui.table(["Chỉ số", "Đo cái gì (theo Liên Hợp Quốc)", "Nhìn từ Phường Mẫu"], [
            [{ html: "<b>OSI</b> – dịch vụ trực tuyến", cls: "pt-c" }, "Khung thể chế; nội dung đầy đủ, dễ tìm, cập nhật; dịch vụ nộp hồ sơ, tra cứu, thanh toán, nhận kết quả; kỹ thuật (tốc độ, bảo mật, dùng trên điện thoại).", "Người dân có nộp được hồ sơ khai sinh trên mạng, tra cứu được tiến độ, trả lệ phí trực tuyến không? Hướng dẫn có dễ hiểu không?"],
            [{ html: "<b>TII</b> – hạ tầng viễn thông", cls: "aqua-c" }, "Tỉ lệ người dùng internet; thuê bao di động và băng rộng không dây; chi phí băng rộng so với thu nhập.", "Hộ dân trong phường có mạng để nộp hồ sơ không? Giá cước có vừa túi tiền? Phường không tự quyết được, nhưng có thể bố trí điểm truy cập hỗ trợ."],
            [{ html: "<b>HCI</b> – nguồn nhân lực", cls: "key-c" }, "Biết chữ; nhập học các cấp; số năm đi học kỳ vọng và bình quân; từ 2024 thêm hiểu biết về chính phủ số.", "Người cao tuổi có đọc được hướng dẫn, dùng được điện thoại nộp hồ sơ không? Cán bộ hướng dẫn tại Bộ phận Một cửa chính là góp phần vào chỉ số này."],
            [{ html: "<b>EPI</b> – tham gia điện tử", cls: "ct-c" }, "Ba mức: cung cấp thông tin → tham vấn → cùng ra quyết định. <b>Công bố kèm, không trong công thức EGDI.</b>", "Lấy ý kiến dự thảo kế hoạch của phường trên mạng chính là mức tham vấn (Luật Tiếp cận thông tin 104/2016/QH13)."],
          ], { cls: "wrap" })));

      function soDo(egdi) {
        const svg = LAB.svg, W = 640, Hh = 250;
        const g = svg("svg", { class: "diag", viewBox: "0 0 " + W + " " + Hh, role: "img", "aria-label": "Sơ đồ cấu trúc EGDI" });
        const box = (x, y, w, hh, col, l1, l2, val, dashed) => {
          g.append(svg("rect", { x, y, width: w, height: hh, rx: 8, fill: "var(--" + col + "-bg)", stroke: "var(--" + col + ")", "stroke-width": 1.5, "stroke-dasharray": dashed ? "5 4" : null }));
          g.append(svg("text", { x: x + w / 2, y: y + 20, "text-anchor": "middle", "font-weight": "700" }, l1));
          g.append(svg("text", { x: x + w / 2, y: y + 37, "text-anchor": "middle", class: "lbl" }, l2));
          if (val != null) { g.append(svg("rect", { x: x + 12, y: y + hh - 16, width: w - 24, height: 7, rx: 3, fill: "var(--sunk)" })); g.append(svg("rect", { x: x + 12, y: y + hh - 16, width: (w - 24) * clamp01(val), height: 7, rx: 3, fill: "var(--" + col + ")" })); g.append(svg("text", { x: x + w / 2, y: y + hh - 22, "text-anchor": "middle" }, f4(val))); }
        };
        const line = (x1, y1, x2, y2) => g.append(svg("path", { d: "M" + x1 + " " + y1 + " C " + x1 + " " + (y1 + 30) + ", " + x2 + " " + (y2 - 30) + ", " + x2 + " " + y2, fill: "none", stroke: "var(--line)", "stroke-width": 2 }));
        box(170, 10, 240, 86, nhomEGDI(egdi)[2], "EGDI = " + f4(egdi), "(OSI + TII + HCI) ÷ 3 · nhóm " + nhomEGDI(egdi)[1], egdi);
        [[20, "pt", "OSI", "Dịch vụ trực tuyến", S.osi], [230, "aqua", "TII", "Hạ tầng viễn thông", S.tii], [440, "key", "HCI", "Nguồn nhân lực", S.hci]].forEach(b => { line(290, 96, b[0] + 90, 150); box(b[0], 150, 180, 86, b[1], b[2], b[3], b[4]); });
        box(430, 10, 200, 60, "ct", "EPI – Tham gia điện tử", "công bố kèm, KHÔNG trong công thức", null, true);
        return g;
      }
      function draw() {
        const egdi = (S.osi + S.tii + S.hci) / 3, nh = nhomEGDI(egdi), ke = nguongKe(egdi);
        const arr = [["OSI", S.osi, "pt"], ["TII", S.tii, "aqua"], ["HCI", S.hci, "key"]];
        const yeu = arr.slice().sort((a, b) => a[1] - b[1])[0];
        out.render(
          ui.readouts([
            { k: "EGDI", v: f4(egdi), kind: nh[2], big: true },
            { k: "Nhóm xếp loại", v: nh[1], kind: nh[2] },
            { k: ke == null ? "Khoảng cách tới 0,75" : "Còn thiếu để lên nhóm kế tiếp", v: ke == null ? "Đã trong nhóm Rất cao" : "+" + f4(ke - egdi) + " (ngưỡng " + LAB.num(ke, 2) + ")", kind: "key" },
            { k: "Chỉ số yếu nhất", v: yeu[0] + " = " + f4(yeu[1]), kind: "eve" },
          ]),
          S.ghichu ? ui.note(S.ghichu, "key") : null);
        sodo.render(soDo(egdi));
        const d = 0.05;
        bang.render(ui.panel("Phân tích độ nhạy: tăng từng chỉ số thêm 0,05 thì EGDI đổi bao nhiêu?",
          ui.table(["Chỉ số", "Hiện tại", "Sau khi +0,05", "EGDI mới", "EGDI tăng", ke == null ? "Để giữ nhóm Rất cao" : "Tăng riêng chỉ số này bao nhiêu để lên nhóm " + NGUONG.find(n => n[0] === ke)[1] + "?"],
            arr.map(a => {
              const moi = clamp01(a[1] + d), egdiMoi = egdi + (moi - a[1]) / 3;
              const can = ke == null ? null : 3 * (ke - egdi);
              return [{ html: "<b>" + a[0] + "</b>", cls: a[2] + "-c" }, f4(a[1]), f4(moi), f4(egdiMoi), { html: "+" + f4(egdiMoi - egdi), cls: "ok-c" },
                ke == null ? "Có thể giảm tối đa " + f4(Math.min(a[1], 3 * (egdi - 0.75))) + " trước khi rớt nhóm"
                  : (a[1] + can <= 1 ? "+" + f4(can) + " → " + f4(a[1] + can) : { html: "Không đủ: cần +" + f4(can) + " nhưng tối đa chỉ là 1,0000", cls: "eve-c" })];
            }), { cls: "tight" }),
          ui.note("Vì ba chỉ số có <b>trọng số bằng nhau</b>, mỗi 0,05 tăng thêm ở bất kỳ chỉ số nào cũng chỉ làm EGDI tăng 0,0167. Bài học: hãy dồn lực vào chỉ số <b>cải thiện được nhanh nhất</b> — với cấp xã đó là chất lượng cổng và dịch vụ (OSI); TII và HCI phụ thuộc giáo dục và đầu tư hạ tầng nên đổi chậm.", "mut")));
      }
      draw(); pane.appendChild(root);
    } },

  /* ===================================================== TAB 2: CHẶNG ĐƯỜNG 2014–2024 ===================================================== */
  { id: "vietnam", title: "Chặng đường 2014–2024",
    intro: "Sáu kỳ khảo sát của Liên Hợp Quốc (dữ liệu thật, <code>LAB.data.egdi</code>): thứ hạng và điểm EGDI của Việt Nam, đặt cạnh các mốc chính sách lớn và các mức trung bình để so sánh. Kỳ 2024 (công bố 17/9/2024) Việt Nam xếp 71/193, điểm 0,7709, lần đầu vào nhóm Rất cao.",
    build(pane) {
      /* Hai biểu đồ (hạng — trục đảo; điểm — kèm ngưỡng và trung bình), bảng sáu kỳ, mốc chính sách, thảo luận "cái bẫy chạy theo thứ hạng". */
      const rows = LAB.data.egdi.sort((a, b) => a.ky_khao_sat - b.ky_khao_sat);
      const S = { moc: true, tb: true, traloi: LAB.store.get("m3.vietnam", "") };
      const { root, view } = ui.sim({ wide: true });
      const C = () => LAB.colors();
      const MOC = [
        { x: 2020 + 5 / 12, nhan: "QĐ 749", vb: "Quyết định 749/QĐ-TTg ngày 03/6/2020", nd: "Chương trình Chuyển đổi số quốc gia đến 2025, định hướng 2030" },
        { x: 2021 + 5.5 / 12, nhan: "QĐ 942", vb: "Quyết định 942/QĐ-TTg ngày 15/6/2021", nd: "Chiến lược phát triển Chính phủ điện tử hướng tới Chính phủ số giai đoạn 2021–2025, định hướng 2030" },
        { x: 2022, nhan: "", vb: "Quyết định 06/QĐ-TTg ngày 06/01/2022", nd: "Đề án 06 – dữ liệu dân cư, định danh và xác thực điện tử (một trong các lý do 2024 bật lên)" },
        { x: 2024 + 11.7 / 12, nhan: "NQ 57", vb: "Nghị quyết 57-NQ/TW ngày 22/12/2024", nd: "Đột phá phát triển khoa học, công nghệ, đổi mới sáng tạo và chuyển đổi số quốc gia" },
        { x: null, nhan: "", vb: "Quyết định 1266/QĐ-TTg ngày 14/7/2026", nd: "Chiến lược quốc gia về chuyển đổi số 2026–2030: mục tiêu nhóm 50 nước dẫn đầu về chính phủ điện tử đến 2030" },
      ];
      const TB = [[0.75, "Ngưỡng Rất cao 0,75", "ok"], [0.6382, "Trung bình thế giới 0,6382", "key"], [0.6990, "Châu Á 0,6990", "ct"], [0.6928, "", "aqua"]];
      const last = rows[rows.length - 1], prev = rows[rows.length - 2];
      const xt = rows.map(r => r.ky_khao_sat);
      const vl = () => S.moc ? MOC.filter(m => m.x != null).map(m => ({ x: m.x, label: m.nhan, color: C().key })) : [];
      const boxHang = chart.box(b => chart.line(b, { title: "Thứ hạng EGDI của Việt Nam (trục đảo: hạng 1 ở trên)", series: [{ name: "Thứ hạng/193", color: "pt", points: rows.map(r => [r.ky_khao_sat, -r.thu_hang_tren_193]), marker: true }],
        xmin: 2013.5, xmax: 2025.5, xticks: xt, fmtX: v => String(Math.round(v)), ymin: -105, ymax: -65, fmtY: v => "hạng " + Math.round(-v), fmtTip: v => "hạng " + Math.round(-v) + "/193", ylabel: "Thứ hạng (càng cao càng tốt)", vlines: vl(), legend: false, aspect: 0.6 }));
      const boxDiem = chart.box(b => chart.line(b, { title: "Điểm EGDI của Việt Nam qua sáu kỳ", series: [{ name: "EGDI", color: "pt", points: rows.map(r => [r.ky_khao_sat, r.diem_egdi]), marker: true, area: true }],
        xmin: 2013.5, xmax: 2025.5, xticks: xt, fmtX: v => String(Math.round(v)), ymin: 0.4, ymax: 1, fmtY: v => LAB.num(v, 2), fmtTip: f4, ylabel: "Điểm EGDI (0–1)", vlines: vl(), hlines: S.tb ? TB.map(t => ({ y: t[0], label: t[1], color: C()[t[2]] })) : [], legend: false, aspect: 0.6 }));

      const top = ui.slot(), goiy = ui.slot();
      view.append(top,
        rowBtns(ui.check({ id: "m3vn-moc", label: "Hiện mốc chính sách", value: true, onChange: v => { S.moc = v; boxHang.draw(); boxDiem.draw(); } }),
          ui.check({ id: "m3vn-tb", label: "Hiện ngưỡng và các mức trung bình 2024", value: true, onChange: v => { S.tb = v; boxDiem.draw(); } })),
        h("div", { class: "cols" }, boxHang, boxDiem),
        h("div", { class: "cols" },
          ui.panel("Sáu kỳ khảo sát (nguồn: CANCU.md mục F)",
            ui.table(["Kỳ", "Thứ hạng", "Đổi hạng", "Điểm EGDI", "Đổi điểm", "Nhóm"], rows.map((r, i) => {
              const p = rows[i - 1]; const dh = p ? p.thu_hang_tren_193 - r.thu_hang_tren_193 : null; const dd = p ? r.diem_egdi - p.diem_egdi : null; const nh = nhomEGDI(r.diem_egdi);
              return [String(r.ky_khao_sat), r.thu_hang_tren_193 + "/193", dh == null ? "—" : { html: (dh > 0 ? "▲ +" + dh : dh < 0 ? "▼ " + dh : "= 0") + " bậc", cls: dh > 0 ? "ok-c" : dh < 0 ? "eve-c" : "" }, f4(r.diem_egdi), dd == null ? "—" : { html: "+" + f4(dd), cls: "ok-c" }, ui.tag(r.nhom, nh[2])];
            }), { cls: "tight", rowCls: r => r[0] === String(last.ky_khao_sat) ? "hi" : "" }),
            ui.note("Điểm tăng đều qua mọi kỳ, nhưng phải tới 2024 mới vượt ngưỡng 0,75. Hai kỳ 2020 và 2022 điểm tăng mà hạng đứng yên ở 86: <b>các nước khác cũng tiến</b>, nên giữ hạng khó hơn tăng hạng.", "mut")),
          ui.panel("Mốc chính sách đặt cạnh biểu đồ",
            h("ul", { class: "timeline" }, MOC.map(m => h("li", { class: m.x == null ? "ok" : "key" }, h("span", { class: "d" }, m.vb), h("div", null, m.nd)))),
            ui.cancu("Khảo sát Chính phủ điện tử 2024 của Liên Hợp Quốc (công bố 17/9/2024)", "Việt Nam 71/193, EGDI 0,7709, tăng 15 bậc, lần đầu vào nhóm Rất cao; thứ 5/11 Đông Nam Á (tăng 1 bậc). Cao hơn trung bình thế giới 0,6382, châu Á 0,6990, Đông Nam Á 0,6928."))),
        ui.panel("Vì sao 2024 bật lên nhóm Rất cao — và vì sao phải thận trọng",
          h("div", { class: "cols" },
            h("div", null, h("b", null, "Ba việc lớn cùng chín một lúc"), ol(["<b>Hạ tầng (TII):</b> băng rộng và di động phủ rộng, giá dịch vụ giảm.", "<b>Dịch vụ (OSI):</b> cổng dịch vụ công tập trung, dữ liệu dân cư dùng chung (Đề án 06, Quyết định 06/QĐ-TTg ngày 06/01/2022).", "<b>Con người (HCI):</b> định danh điện tử phổ cập tới từng người dân."])),
            h("div", null, h("b", null, "Điều cần thận trọng"), ol(["Điểm 0,7709 chỉ vừa vượt ngưỡng 0,75 — một kỳ chững lại là rớt nhóm.", "Còn cách xa nhóm dẫn đầu; muốn vào nhóm 50 (Quyết định 1266/QĐ-TTg) phải tiến thêm " + (last.thu_hang_tren_193 - 50) + " bậc.", "Chỉ số đo <b>cổng quốc gia</b>, chưa đo tới từng xã, phường. Thứ hạng cao không đồng nghĩa người dân đã hài lòng."])))),
        ui.panel("Thảo luận nhóm: cái bẫy chạy theo thứ hạng (15 phút)",
          ui.note("<b>Tình huống:</b> lãnh đạo giao anh/chị đưa đơn vị vào nhóm dẫn đầu tỉnh về chuyển đổi số trong 12 tháng. Có ý kiến đề nghị tập trung <i>làm đẹp giao diện cổng thông tin</i> và <i>tăng số lượng dịch vụ công bố là toàn trình</i>.", "key"),
          ol(["Cách làm đó tăng điểm, nhưng có giúp gì cho người dân?", "Ba chỉ số OSI, TII, HCI gợi ý việc gì thực chất hơn?", "Đề xuất hai việc vừa tăng điểm vừa có ích thật cho dân."]),
          ui.field({ id: "m3vn-traloi", label: "Ghi ý kiến của nhóm (lưu trên máy này)", type: "textarea", rows: 4, value: S.traloi, placeholder: "Câu 1… Câu 2… Câu 3…", onInput: v => { S.traloi = v; LAB.store.set("m3.vietnam", v); } }),
          rowBtns(ui.btn("Xem gợi ý hướng trả lời", () => goiy.render(ui.steps([
            { t: "<b>Phân biệt đầu ra và kết quả.</b> Số dịch vụ công bố là đầu ra; tỉ lệ dân dùng mới là kết quả. Giao diện đẹp mà nộp hồ sơ vẫn khó thì điểm cũng không bền." },
            { t: "<b>Soi từng chỉ số thành phần.</b> OSI: rà lại hướng dẫn thủ tục, viết lại bằng lời dễ hiểu. HCI: tập huấn cán bộ và hướng dẫn dân dùng dịch vụ." },
            { t: "<b>Hai việc nên chọn.</b> Cho tra cứu tiến độ hồ sơ và nhắn tin báo kết quả; bố trí người hướng dẫn tại Bộ phận Một cửa cho người cao tuổi.", hi: true },
          ]), ui.note("Ba nguyên tắc dùng xếp hạng cho đúng: <b>xếp hạng là nhiệt kế, không phải thuốc chữa bệnh</b>; luôn đọc kèm chỉ số thành phần; đối chiếu với mức hài lòng thật của người dân.", "ok")), "pri"),
            ui.btn("Làm lại", () => { S.traloi = ""; LAB.store.del("m3.vietnam"); root.querySelector("#m3vn-traloi").value = ""; goiy.render(); })),
          goiy));
      top.render(ui.readouts([
        { k: "Kỳ " + last.ky_khao_sat, v: last.thu_hang_tren_193 + "/193", kind: "pt", big: true },
        { k: "Điểm EGDI", v: f4(last.diem_egdi), kind: "ok", big: true },
        { k: "So với kỳ " + prev.ky_khao_sat, v: "▲ " + (prev.thu_hang_tren_193 - last.thu_hang_tren_193) + " bậc", kind: "ok" },
        { k: "Nhóm", v: last.nhom + " (lần đầu)", kind: "ok" },
        { k: "Đông Nam Á", v: "5/11 (▲ 1)", kind: "aqua" },
        { k: "Trung bình thế giới · châu Á · ĐNA", v: "0,6382 · 0,6990 · 0,6928", kind: "key" },
      ]));
      pane.appendChild(root);
    } },

  /* ===================================================== TAB 3: TỰ CHẤM CỔNG THEO OSI RÚT GỌN ===================================================== */
  { id: "tucham", title: "Tự chấm cổng thông tin theo OSI rút gọn",
    intro: "Bài thực hành chính của buổi 3: mở trang thông tin điện tử của đơn vị và Cổng Dịch vụ công quốc gia (dichvucong.gov.vn), chọn một thủ tục hay tiếp nhận (ví dụ đăng ký khai sinh) rồi chấm 20 tiêu chí rút gọn từ bốn nhóm của OSI. <b>Có + Dễ tìm = 2 điểm, Có + Khó tìm = 1 điểm, Không = 0 điểm</b>; tối đa 40 điểm. Ghi chứng cứ ngắn (đường dẫn hoặc thao tác) cho từng tiêu chí.",
    build(pane) {
      /* 20 tiêu chí × (Có/Không, Dễ/Khó, chứng cứ) → điểm/40, radar 4 nhóm, 3 cải thiện ưu tiên; lưu LAB.store "m3.tucham"; tải CSV. */
      const NHOM = ["Nội dung", "Dịch vụ", "Kỹ thuật & tiếp cận", "Thể chế & tham gia"];
      /* [nhóm, tiêu chí, trọng số 1–3, việc cần làm nếu thiếu] */
      const TC = [
        [0, "Có thông tin liên hệ của Bộ phận Một cửa (địa chỉ, điện thoại, giờ tiếp nhận)", 2, "Đưa địa chỉ, số điện thoại, giờ tiếp nhận lên ngay trang chủ"],
        [0, "Có danh mục thủ tục hành chính thuộc thẩm quyền cấp xã, chia theo lĩnh vực", 3, "Đăng danh mục thủ tục theo lĩnh vực, mỗi thủ tục dẫn tới trang tương ứng trên Cổng Dịch vụ công quốc gia"],
        [0, "Hướng dẫn thủ tục viết bằng ngôn ngữ dễ hiểu, câu ngắn", 3, "Viết lại hướng dẫn bằng lời thường; nhờ một người dân đọc thử trước khi đăng"],
        [0, "Mỗi thủ tục nêu rõ thời hạn, lệ phí, thành phần hồ sơ", 3, "Bổ sung ba thông tin bắt buộc cho từng thủ tục hay dùng"],
        [0, "Nội dung có ghi ngày cập nhật và được cập nhật thường xuyên", 2, "Phân công người cập nhật; ghi ngày cập nhật dưới mỗi trang"],
        [1, "Biểu mẫu, tờ khai tải được và điền được (không phải ảnh chụp)", 2, "Đăng tệp biểu mẫu điền được cho từng thủ tục"],
        [1, "Nộp được hồ sơ trực tuyến (hoặc dẫn đúng tới thủ tục trên Cổng Dịch vụ công quốc gia)", 3, "Gắn nút “Nộp trực tuyến” dẫn thẳng tới thủ tục trên dichvucong.gov.vn"],
        [1, "Thanh toán trực tuyến được lệ phí, nghĩa vụ tài chính", 2, "Kết nối thanh toán trực tuyến cho các thủ tục có thu phí"],
        [1, "Tra cứu được tiến độ giải quyết hồ sơ bằng mã hồ sơ", 3, "Cho tra cứu tiến độ bằng mã hồ sơ ngay trên trang chủ"],
        [1, "Có báo tin (tin nhắn, thư điện tử) khi hồ sơ có kết quả", 2, "Bật nhắn tin báo kết quả; ghi số điện thoại người nộp khi tiếp nhận"],
        [2, "Có ô tìm kiếm thủ tục hành chính", 2, "Thêm ô tìm kiếm ở đầu trang, tìm được cả khi gõ không dấu"],
        [2, "Tìm được một thủ tục trong ba lần bấm", 2, "Rút gọn trình đơn: Trang chủ → Lĩnh vực → Thủ tục"],
        [2, "Dùng tốt trên màn hình điện thoại", 3, "Yêu cầu đơn vị vận hành sửa giao diện cho điện thoại; thử trên máy của cán bộ"],
        [2, "Người khuyết tật tiếp cận được (phóng chữ, tương phản, đọc màn hình, mô tả hình)", 2, "Thêm nút phóng chữ, chế độ tương phản cao; mô tả chữ cho hình ảnh"],
        [2, "Trang tải nhanh và dùng kết nối an toàn (biểu tượng ổ khoá trên trình duyệt)", 2, "Đề nghị đơn vị vận hành bật kết nối an toàn, nén hình ảnh"],
        [3, "Có kênh phản ánh, kiến nghị trực tuyến và công khai thời hạn trả lời", 3, "Mở mục phản ánh, kiến nghị; công khai thời hạn và người trả lời"],
        [3, "Có mục hỏi đáp hoặc câu hỏi thường gặp", 1, "Tổng hợp 10 câu người dân hay hỏi tại Một cửa thành mục hỏi đáp"],
        [3, "Lấy ý kiến dự thảo văn bản, kế hoạch của đơn vị trên mạng", 2, "Đăng dự thảo kèm mẫu góp ý và thời hạn góp ý"],
        [3, "Công khai dữ liệu mở (ngân sách, quy hoạch, danh mục dịch vụ) dạng tệp tải được", 2, "Công bố ít nhất ba tập dữ liệu dạng bảng tải được, ghi ngày cập nhật"],
        [3, "Công khai kế hoạch chuyển đổi số và đầu mối phụ trách của đơn vị", 1, "Đăng kế hoạch chuyển đổi số và tên, số điện thoại người phụ trách"],
      ];
      const MAU = { donvi: "UBND Phường Mẫu, Tỉnh Mẫu (ví dụ)", co: [1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1], de: [1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
        cc: ["Trang chủ, chân trang", "Mục Thủ tục hành chính, phải cuộn 3 trang", "Hướng dẫn khai sinh còn dẫn điều luật, chưa diễn giải", "Có trong từng trang thủ tục", "Tin mới nhất từ 2024", "Tệp tờ khai điền được", "Chỉ có đường dẫn chung tới dichvucong.gov.vn", "", "", "", "Ô tìm kiếm đầu trang", "Phải qua 5 lần bấm", "Chữ nhỏ, bảng tràn trên điện thoại", "", "Có ổ khoá, tải nhanh", "Mục Hỏi đáp, không ghi thời hạn", "", "Dự thảo kế hoạch 2026 trong mục Tin tức", "", "Kế hoạch CĐS trong mục Văn bản"] };
      const rong = () => ({ donvi: "", hoten: "", co: TC.map(() => -1), de: TC.map(() => 1), cc: TC.map(() => "") });
      const S = Object.assign(rong(), LAB.store.get("m3.tucham", {}));
      if (!Array.isArray(S.co) || S.co.length !== TC.length) Object.assign(S, rong());
      const { root, ctrl, view } = ui.sim();
      const diem = i => S.co[i] === 1 ? (S.de[i] === 1 ? 2 : 1) : 0;
      const tong = () => TC.reduce((s, _, i) => s + diem(i), 0);
      const theoNhom = () => NHOM.map((_, g) => TC.reduce((s, t, i) => s + (t[0] === g ? diem(i) : 0), 0));
      const luu = () => LAB.store.set("m3.tucham", S);

      const fDonvi = ui.field({ id: "m3tc-donvi", label: "Tên đơn vị / trang được chấm", value: S.donvi, placeholder: "UBND Phường …", onInput: v => { S.donvi = v; luu(); } });
      const fHoten = ui.field({ id: "m3tc-hoten", label: "Họ tên học viên", value: S.hoten, placeholder: "Nguyễn Văn A", onInput: v => { S.hoten = v; luu(); } });
      const trangThai = ui.slot();
      ctrl.append(fDonvi, fHoten,
        ui.presets([{ label: "Cổng thông tin Phường Mẫu (ví dụ)", apply: () => { S.donvi = MAU.donvi; S.co = MAU.co.slice(); S.de = MAU.de.slice(); S.cc = MAU.cc.slice(); fDonvi.input.value = S.donvi; luu(); dungLai(); } }]),
        rowBtns(ui.btn("Gợi ý 3 cải thiện ưu tiên", () => goiY(), "pri"), ui.btn("Lưu bài làm", () => { luu(); trangThai.render(ui.note("Đã lưu trên máy này (" + LAB.date.vn(new Date()) + ").", "ok")); }),
          ui.btn("Tải CSV bảng điểm", taiCSV), ui.btn("Làm lại", () => { Object.assign(S, rong()); fDonvi.input.value = ""; fHoten.input.value = ""; LAB.store.del("m3.tucham"); dungLai(); })),
        trangThai,
        ui.cancu("Nghị định 42/2022/NĐ-CP ngày 24/6/2022 của Chính phủ", "Quy định việc cung cấp thông tin và dịch vụ công trực tuyến của cơ quan nhà nước trên môi trường mạng — căn cứ cho các tiêu chí về nội dung, dịch vụ và kỹ thuật."),
        ui.cancu("Nghị định 118/2025/NĐ-CP ngày 09/6/2025 của Chính phủ", "Thực hiện thủ tục hành chính theo cơ chế một cửa, một cửa liên thông tại Bộ phận Một cửa và Cổng Dịch vụ công quốc gia. Từ 01/7/2025 không duy trì Cổng Dịch vụ công cấp tỉnh; Cổng quốc gia là điểm một cửa số duy nhất."),
        ui.note("Thang điểm 40 và trọng số là của phòng mô phỏng, rút gọn từ bốn nhóm tiêu chí OSI (Bảng 1.1, Khảo sát 2024); không phải thang chấm chính thức.", "mut"));

      const out = ui.slot(), goiy = ui.slot();
      const radar = chart.box(b => chart.radar(b, { title: "Điểm theo bốn nhóm (tối đa 10 mỗi nhóm)", axes: NHOM, series: [{ name: S.donvi || "Đơn vị", color: "pt", values: theoNhom() }], max: 10, levels: 5, aspect: 0.62 }));
      const bangSlot = ui.slot();
      view.append(out, h("div", { class: "cols" }, radar, h("div", { class: "stack" }, ...NHOM.map((n, g) => { const s = ui.slot(); s.g = g; return s; }).map(s => { s.render(); return s; }))), goiy, bangSlot);
      const barSlots = [...view.querySelectorAll(".cols > .stack > .stack")];

      const cells = [];
      function dungBang() {
        cells.length = 0;
        const rowsEl = TC.map((t, i) => {
          const sDiem = h("b", { class: "mono" }, "0");
          const segCo = ui.seg({ id: "m3tc-co" + i, options: [[1, "Có"], [0, "Không"]], value: S.co[i], onChange: v => { S.co[i] = +v; luu(); capNhat(); } });
          const segDe = ui.seg({ id: "m3tc-de" + i, options: [[1, "Dễ tìm"], [0, "Khó tìm"]], value: S.de[i], onChange: v => { S.de[i] = +v; luu(); capNhat(); } });
          const inp = h("input", { id: "m3tc-cc" + i, type: "text", placeholder: "đường dẫn / thao tác", style: { minWidth: "160px" } }); inp.value = S.cc[i];
          inp.addEventListener("input", () => { S.cc[i] = inp.value; luu(); });
          cells.push({ sDiem, segDe });
          return [String(i + 1), ui.tag(NHOM[t[0]], ["pt", "ok", "aqua", "ct"][t[0]]), { html: t[1] + (t[2] === 3 ? " <span class='small key-c'>(trọng số 3)</span>" : ""), cls: "wrap" }, segCo, segDe, sDiem, inp];
        });
        bangSlot.render(ui.panel("Bảng chấm 20 tiêu chí", ui.table(["#", "Nhóm", "Tiêu chí", "Có / Không", "Dễ tìm / Khó tìm", "Điểm", "Chứng cứ"], rowsEl, { cls: "tight", rowCls: (r, i) => S.co[i] === 0 ? "bad" : S.co[i] === 1 && S.de[i] === 1 ? "good" : "" })));
      }
      function capNhat() {
        const t = tong(), chua = S.co.filter(v => v === -1).length, tn = theoNhom();
        cells.forEach((c, i) => { c.sDiem.textContent = String(diem(i)); c.segDe.style.opacity = S.co[i] === 1 ? "1" : "0.35"; });
        bangSlot.querySelectorAll("tbody tr").forEach((tr, i) => { tr.className = S.co[i] === 0 ? "bad" : S.co[i] === 1 && S.de[i] === 1 ? "good" : ""; });
        const loai = t >= 30 ? ["Tốt", "ok"] : t >= 20 ? ["Khá", "pt"] : t >= 10 ? ["Trung bình", "key"] : ["Yếu", "eve"];
        const sc = ui.score(t, "/ 40 điểm", 40); sc.classList.add(loai[1]);
        out.render(h("div", { class: "row", style: { alignItems: "center", gap: "16px" } }, sc, h("div", { style: { flex: "1 1 240px" } }, ui.readouts([
          { k: "Xếp loại (thang minh hoạ)", v: loai[0], kind: loai[1] },
          { k: "Tiêu chí đạt 2 điểm", v: TC.filter((_, i) => diem(i) === 2).length + "/20", kind: "ok" },
          { k: "Tiêu chí 0 điểm", v: TC.filter((_, i) => S.co[i] === 0).length, kind: "eve" },
          { k: "Chưa chấm", v: String(chua), kind: chua ? "key" : "mut" }]))),
          chua ? ui.note("Còn " + chua + " tiêu chí chưa chọn Có/Không — đang tính 0 điểm.", "eve") : null);
        barSlots.forEach((s, g) => s.render(ui.bar({ label: NHOM[g], value: tn[g], max: 10, kind: ["pt", "ok", "aqua", "ct"][g], text: tn[g] + "/10" })));
        radar.draw();
      }
      function dungLai() { dungBang(); goiy.render(); capNhat(); }
      function goiY() {
        const uuTien = TC.map((t, i) => ({ i, t, d: diem(i) })).filter(x => x.d < 2).sort((a, b) => a.d - b.d || b.t[2] - a.t[2] || a.i - b.i).slice(0, 3);
        if (!uuTien.length) { goiy.render(ui.note("Mọi tiêu chí đều đạt 2 điểm — hãy kiểm tra lại bằng mắt người dân, rồi chuyển sang đo mức hài lòng.", "ok")); return; }
        goiy.render(ui.panel("Ba cải thiện ưu tiên (tiêu chí 0 điểm, trọng số cao xếp trước) — làm được trong 6 tháng, ghi rõ ai chịu trách nhiệm",
          ui.steps(uuTien.map(x => ({ t: "<b>" + x.t[1] + "</b> · hiện " + x.d + " điểm, trọng số " + x.t[2], r: (x.d === 1 ? "Đã có nhưng khó tìm → đưa lên vị trí dễ thấy. " : "") + x.t[3], hi: x.d === 0 })))));
      }
      function taiCSV() {
        const rows = TC.map((t, i) => [i + 1, NHOM[t[0]], t[1], S.co[i] === 1 ? "Có" : S.co[i] === 0 ? "Không" : "Chưa chấm", S.co[i] === 1 ? (S.de[i] === 1 ? "Dễ tìm" : "Khó tìm") : "", diem(i), t[2], S.cc[i]]);
        rows.push(["", "", "TỔNG", "", "", tong(), "", "Đơn vị: " + S.donvi + " · Học viên: " + S.hoten + " · Ngày: " + LAB.date.vn(new Date())]);
        TC.map((t, i) => ({ i, t, d: diem(i) })).filter(x => x.d < 2).sort((a, b) => a.d - b.d || b.t[2] - a.t[2] || a.i - b.i).slice(0, 3).forEach((x, k) => rows.push(["", "", "Đề xuất " + (k + 1), "", "", "", "", x.t[3]]));
        LAB.csv.download("bai3_tu_cham_cong_OSI.csv", ["STT", "Nhóm", "Tiêu chí", "Có/Không", "Dễ tìm/Khó tìm", "Điểm", "Trọng số", "Chứng cứ / ghi chú"], rows);
      }
      dungLai(); pane.appendChild(root);
    } },

  /* ===================================================== TAB 4: SÁU CHIỀU KHUNG OECD ===================================================== */
  { id: "oecd", title: "Sáu chiều của khung OECD",
    intro: "Khung chính sách Chính phủ số của OECD (2020) nêu sáu chiều: bốn chiều đầu là <b>nền móng</b>, hai chiều sau là <b>chuyển hoá</b> — chỉ làm được khi nền móng vững. Với mỗi chiều, tự đánh giá đơn vị theo hai phát biểu (1 = chưa có gì, 5 = đã thành nền nếp).",
    build(pane) {
      /* 6 chiều × 2 phát biểu (1–5) → radar, bảng, chiều yếu nhất và việc nên bắt đầu; kiểm tra quy tắc nền móng/chuyển hoá. */
      const CHIEU = [
        { ten: "Số hoá từ gốc", en: "digital by design", loai: 0, pb: ["Khi sửa một quy trình, đơn vị nghĩ tới cách làm trên môi trường số ngay từ đầu", "Thủ tục đưa lên mạng đã được rà soát, cắt bớt giấy tờ, không bê nguyên quy trình giấy"], vd: "Sửa quy trình hộ tịch rồi mới đưa lên mạng", bd: "Chọn một thủ tục hay dùng, vẽ lại quy trình trên giấy, bỏ bước thừa, rồi mới đề nghị số hoá." },
        { ten: "Dựa trên dữ liệu", en: "data-driven public sector", loai: 0, pb: ["Lãnh đạo dùng số liệu hồ sơ (trễ hạn, kênh nộp, hài lòng) khi họp giao ban", "Dữ liệu của đơn vị có người phụ trách, có quy tắc cập nhật và chia sẻ"], vd: "Dùng số liệu hồ sơ trễ hạn để bố trí cán bộ", bd: "Mỗi tuần lập một bảng: số hồ sơ, tỉ lệ trễ hạn theo lĩnh vực; đem ra bàn tại giao ban." },
        { ten: "Nhà nước nền tảng", en: "government as a platform", loai: 0, pb: ["Đơn vị dùng nền tảng dùng chung (định danh điện tử, thanh toán, Cổng Dịch vụ công quốc gia) thay vì tự mua phần mềm riêng", "Cán bộ chỉ cần một tài khoản để làm việc trên các hệ thống"], vd: "Định danh điện tử và thanh toán dùng chung", bd: "Rà danh sách phần mềm đang dùng; cái nào trùng chức năng với nền tảng dùng chung thì dừng." },
        { ten: "Mở mặc định", en: "open by default", loai: 0, pb: ["Thông tin không thuộc diện mật được công khai mà không cần ai yêu cầu", "Số liệu ngân sách, quy hoạch, danh mục dịch vụ công khai dưới dạng tệp tải được"], vd: "Công khai dữ liệu quy hoạch, giá đất, ngân sách", bd: "Chọn ba tập dữ liệu người dân hay hỏi, công khai dạng bảng tải được kèm ngày cập nhật." },
        { ten: "Lấy người dùng làm gốc", en: "user-driven", loai: 1, pb: ["Đơn vị hỏi ý kiến người dân trước khi thay đổi biểu mẫu, quy trình", "Có đo mức hài lòng và dùng kết quả đó để sửa dịch vụ"], vd: "Khảo sát người đến Bộ phận Một cửa rồi sửa biểu mẫu", bd: "Hỏi 20 người dân tại Một cửa trong một tuần về một biểu mẫu; sửa theo góp ý." },
        { ten: "Chủ động phục vụ", en: "proactiveness", loai: 1, pb: ["Đơn vị nhắc người dân trước khi giấy tờ hết hạn hoặc đến kỳ hưởng chế độ", "Có dịch vụ tự khởi tạo theo sự kiện đời người (khai sinh kéo theo thường trú, bảo hiểm y tế)"], vd: "Nhắc hạn đổi giấy tờ trước khi hết hạn", bd: "Lập danh sách người sắp đến tuổi hưởng trợ cấp từ dữ liệu dân cư; chủ động liên hệ." },
      ];
      const MAU = [[3, 2], [2, 2], [4, 3], [2, 1], [3, 2], [1, 1]];
      const rong = () => ({ hoten: "", d: CHIEU.map(() => [0, 0]) });
      const S = Object.assign(rong(), LAB.store.get("m3.oecd", {}));
      if (!Array.isArray(S.d) || S.d.length !== 6) Object.assign(S, rong());
      const { root, ctrl, view } = ui.sim();
      const luu = () => LAB.store.set("m3.oecd", S);
      const diemChieu = i => (S.d[i][0] + S.d[i][1]) / 2;
      const segs = [];
      const fHoten = ui.field({ id: "m3oe-hoten", label: "Họ tên học viên", value: S.hoten, onInput: v => { S.hoten = v; luu(); } });
      ctrl.append(fHoten,
        ui.presets([{ label: "UBND Phường Mẫu (ví dụ)", apply: () => { S.d = MAU.map(x => x.slice()); luu(); dongBo(); } }]),
        rowBtns(ui.btn("Tải CSV", () => LAB.csv.download("bai3_sau_chieu_OECD.csv", ["Chiều", "Tên quốc tế", "Loại", "Phát biểu 1", "Điểm 1", "Phát biểu 2", "Điểm 2", "Điểm chiều", "Học viên"],
          CHIEU.map((c, i) => [c.ten, c.en, c.loai ? "Chuyển hoá" : "Nền móng", c.pb[0], S.d[i][0] || "", c.pb[1], S.d[i][1] || "", diemChieu(i) || "", S.hoten]))),
          ui.btn("Làm lại", () => { Object.assign(S, rong()); fHoten.input.value = ""; LAB.store.del("m3.oecd"); dongBo(); })),
        ui.cancu("OECD, Recommendation on Digital Government Strategies, 15/7/2014", "Văn kiện quốc tế đầu tiên riêng về chính phủ số. Chính phủ điện tử: dùng công nghệ để làm việc tốt hơn; chính phủ số: dùng công nghệ như một phần của cải cách, tạo giá trị công. Việt Nam không phải thành viên OECD nhưng tham khảo được."),
        ui.cancu("Luật Dữ liệu 60/2024/QH15 (hiệu lực 01/7/2025); Nghị định 278/2025/NĐ-CP ngày 22/10/2025", "Căn cứ trong nước cho hai chiều “dựa trên dữ liệu” và “mở mặc định”: quản trị dữ liệu, dữ liệu mở và kết nối, chia sẻ dữ liệu bắt buộc giữa các cơ quan."),
        ui.cancu("Quyết định 1266/QĐ-TTg ngày 14/7/2026", "“Người dân và doanh nghiệp là trung tâm, là chủ thể và là đối tượng thụ hưởng chính của chuyển đổi số” — tinh thần của hai chiều chuyển hoá."));

      const out = ui.slot(), phanTich = ui.slot();
      const radar = chart.box(b => chart.radar(b, { title: "Sáu chiều — tự đánh giá (1–5)", axes: CHIEU.map(c => c.ten), series: [{ name: "Đơn vị", color: "pt", values: CHIEU.map((_, i) => diemChieu(i)) }], max: 5, aspect: 0.66 }));
      const form = h("div", { class: "cols" }, CHIEU.map((c, i) => ui.panel(null,
        h("div", null, h("b", null, (i + 1) + ". " + c.ten), " ", h("span", { class: "small" }, "(" + c.en + ")"), " ", ui.tag(c.loai ? "Chuyển hoá" : "Nền móng", c.loai ? "ct" : "aqua")),
        h("div", { class: "small" }, "Ví dụ trong bài: " + c.vd),
        ...c.pb.map((p, j) => { const sg = ui.seg({ id: "m3oe-d" + i + "-" + j, label: p, options: [1, 2, 3, 4, 5].map(v => [v, String(v)]), value: S.d[i][j] || null, onChange: v => { S.d[i][j] = +v; luu(); capNhat(); } }); segs.push({ i, j, sg: sg.querySelector(".seg") }); return sg; }))));
      view.append(out, h("div", { class: "cols" }, radar, phanTich), form);

      function capNhat() {
        const vals = CHIEU.map((_, i) => diemChieu(i)), chua = S.d.flat().filter(v => !v).length;
        const nenMong = LAB.stat.mean(vals.slice(0, 4)), chuyenHoa = LAB.stat.mean(vals.slice(4));
        const minI = vals.indexOf(Math.min(...vals)), maxI = vals.indexOf(Math.max(...vals));
        out.render(ui.readouts([
          { k: "Trung bình sáu chiều", v: LAB.num(LAB.stat.mean(vals), 2) + " / 5", kind: "pt", big: true },
          { k: "Nền móng (chiều 1–4)", v: LAB.num(nenMong, 2), kind: "aqua" },
          { k: "Chuyển hoá (chiều 5–6)", v: LAB.num(chuyenHoa, 2), kind: "ct" },
          { k: "Chiều yếu nhất", v: CHIEU[minI].ten, kind: "eve" },
          { k: "Chiều mạnh nhất", v: CHIEU[maxI].ten, kind: "ok" }]),
          chua ? ui.note("Còn " + chua + " phát biểu chưa chấm (đang tính 0).", "eve") : null,
          !chua && chuyenHoa > nenMong + 0.5 ? ui.note("<b>Kiểm tra lại cách chấm:</b> hai chiều chuyển hoá đang cao hơn nền móng. Theo khung OECD, chủ động phục vụ và lấy người dùng làm gốc chỉ bền khi dữ liệu, nền tảng và mở mặc định đã vững.", "eve") : null);
        phanTich.render(ui.panel("Bảng điểm và việc nên bắt đầu",
          ui.table(["Chiều", "Điểm", "Mức"], CHIEU.map((c, i) => [c.ten, { html: LAB.num(vals[i], 1), cls: "mono" }, ui.bar({ value: vals[i], max: 5, kind: c.loai ? "ct" : "aqua", text: "" })]), { cls: "tight", rowCls: (r, i) => i === minI ? "bad" : i === maxI ? "good" : "" }),
          ui.note("<b>Chiều yếu nhất: " + CHIEU[minI].ten + " (" + LAB.num(vals[minI], 1) + ").</b> Nên bắt đầu từ: " + CHIEU[minI].bd + (CHIEU[minI].loai && nenMong < 3 ? " <i>Nhưng nền móng mới đạt " + LAB.num(nenMong, 1) + " — hãy ưu tiên chiều nền móng thấp nhất (" + CHIEU[vals.slice(0, 4).indexOf(Math.min(...vals.slice(0, 4)))].ten + ") trước.</i>" : ""), "key")));
        radar.draw();
      }
      function dongBo() { segs.forEach(s => s.sg.set(S.d[s.i][s.j] || "")); capNhat(); }
      capNhat(); pane.appendChild(root);
    } },

  /* ===================================================== TAB 5: BỐN BÀI HỌC QUỐC TẾ ===================================================== */
  { id: "baihoc", title: "Bốn bài học quốc tế",
    intro: "Estonia, Hàn Quốc, Singapore, Đan Mạch — mỗi nước mạnh ở một điều. Chọn một thẻ để đọc nội dung, rồi đánh dấu các điều kiện tiên quyết đã có / chưa có ở đơn vị để xem mức sẵn sàng vận dụng. Nhớ: <b>học nguyên lý, không sao chép nguyên giải pháp</b>.",
    build(pane) {
      /* Thẻ 4 nước (định tính theo slide), ma trận điều kiện tiên quyết × bài học → mức sẵn sàng; giới hạn sao chép; 6 bài học cho Việt Nam. */
      const DK = [["phaply", "Khung pháp lý"], ["dulieu", "Dữ liệu nền"], ["hatang", "Hạ tầng"], ["nhanluc", "Nhân lực"], ["niemtin", "Niềm tin người dân"]];
      const BH = [
        { id: "ee", ten: "Estonia", kind: "ct", tieude: "X-Road và nguyên tắc chỉ hỏi một lần",
          nd: ["<b>X-Road</b> là nền tảng chia sẻ dữ liệu giữa các cơ quan: không gom dữ liệu về một chỗ, mỗi cơ quan giữ dữ liệu của mình; cơ quan này hỏi cơ quan kia khi cần, có nhật ký. An toàn nhờ định danh điện tử, phân quyền và mã hoá.", "<b>Chỉ hỏi một lần (once-only):</b> thông tin đã nộp cho một cơ quan, cơ quan khác không hỏi lại. Dịch vụ “vô hình” theo sự kiện đời người (sinh con, đi học, nghỉ hưu) — nhà nước tự làm, dân không phải nộp đơn."],
          lienhe: "Việt Nam có cách làm tương đương (nền tảng tích hợp, chia sẻ dữ liệu; Nghị định 278/2025/NĐ-CP về kết nối, chia sẻ dữ liệu bắt buộc). Hành lang pháp lý đã có, cái thiếu là <b>thói quen làm việc</b>: nhiều nơi vẫn yêu cầu dân nộp lại bản sao giấy tờ đã có.",
          w: { phaply: 3, dulieu: 3, hatang: 2, nhanluc: 2, niemtin: 2 } },
        { id: "kr", ten: "Hàn Quốc", kind: "key", tieude: "Bền bỉ hơn hai mươi năm; chính phủ nền tảng số",
          nd: ["Luật Chính phủ điện tử ban hành từ năm 2001; chính sách giữ <b>liên tục qua nhiều nhiệm kỳ</b>, không đổi hướng. Kết quả đo bằng mức hài lòng và tỉ lệ sử dụng của người dân, không chỉ bằng số dịch vụ.", "<b>Chiến lược chính phủ nền tảng số (9/2022):</b> một nền tảng chung cho cơ quan, người dân và doanh nghiệp; mọi dịch vụ dưới dạng số; đưa dịch vụ đến trước khi dân đi tìm; dùng dữ liệu để ra chính sách; mở dữ liệu cho khu vực tư cùng khai thác."],
          lienhe: "Bài học lớn nhất: <b>tính liên tục của chính sách quan trọng hơn tiền</b>. Ở cấp xã: kế hoạch chuyển đổi số không làm lại từ đầu mỗi khi đổi lãnh đạo; giữ chỉ tiêu đo được qua các năm.",
          w: { phaply: 3, dulieu: 2, hatang: 2, nhanluc: 3, niemtin: 1 } },
        { id: "sg", ten: "Singapore", kind: "pt", tieude: "Quốc gia thông minh (Smart Nation) và khoảnh khắc cuộc đời",
          nd: ["Chương trình Quốc gia thông minh khởi động 2014, lấy đổi mới dịch vụ công làm trọng tâm, có chỉ tiêu rõ. <b>Một tài khoản duy nhất</b> (Singpass) cho người dân dùng mọi dịch vụ.", "<b>Khoảnh khắc cuộc đời (Moments of Life, nay là LifeSG):</b> gom dịch vụ theo việc của người dân (khai sinh, chăm sóc người cao tuổi), không theo cơ quan. Người dân không cần biết việc đó thuộc cơ quan nào; một lần khai, hệ thống tự chuyển cho các cơ quan liên quan."],
          lienhe: "Ở Việt Nam, tài khoản định danh điện tử dùng chung trên Cổng Dịch vụ công quốc gia là bước đi tương tự. Cấp xã có thể bắt đầu bằng việc <b>gom hướng dẫn theo việc của dân</b> (sinh con, mất người thân, mở hộ kinh doanh) thay vì theo phòng ban.",
          w: { phaply: 2, dulieu: 3, hatang: 2, nhanluc: 2, niemtin: 2 } },
        { id: "dk", ten: "Đan Mạch", kind: "ok", tieude: "Bắt buộc số hoá có hỗ trợ; dẫn đầu nhiều kỳ liên tiếp",
          nd: ["Dẫn đầu thế giới nhiều kỳ khảo sát liên tiếp. Ba cổng lớn chia theo <b>đối tượng phục vụ</b> (người dân, doanh nghiệp, y tế) và một cổng để người dân gửi kiến nghị chính sách. Chiến lược số quốc gia 2022–2025 phối hợp liên ngành, đi kèm chiến lược an ninh mạng.", "<b>Bắt buộc dùng kênh số chỉ công bằng khi có hỗ trợ:</b> người không dùng được mạng phải có điểm hỗ trợ hoặc quyền chọn kênh giao tiếp (kinh nghiệm Bồ Đào Nha, Tây Ban Nha, Na Uy trong khung OECD)."],
          lienhe: "Nếu đơn vị muốn đẩy tỉ lệ hồ sơ trực tuyến, phải <b>đi kèm cơ chế hỗ trợ người yếu thế</b>: người hướng dẫn tại Bộ phận Một cửa, điểm truy cập có cán bộ trực, giữ kênh trực tiếp cho người cao tuổi.",
          w: { phaply: 3, dulieu: 2, hatang: 3, nhanluc: 2, niemtin: 3 } },
      ];
      const MAU = { ee: ["phaply", "hatang"], kr: ["phaply", "hatang", "nhanluc"], sg: ["phaply", "hatang"], dk: ["phaply", "hatang", "nhanluc"] };
      const rong = () => ({ hoten: "", chon: "ee", co: {} });
      const S = Object.assign(rong(), LAB.store.get("m3.baihoc", {}));
      if (!S.co || typeof S.co !== "object") S.co = {};
      const { root, ctrl, view } = ui.sim();
      const luu = () => LAB.store.set("m3.baihoc", S);
      const daCo = (b, k) => !!(S.co[b] && S.co[b][k]);
      const sanSang = b => { const bh = BH.find(x => x.id === b); const tong = DK.reduce((s, d) => s + bh.w[d[0]], 0); const co = DK.reduce((s, d) => s + (daCo(b, d[0]) ? bh.w[d[0]] : 0), 0); return Math.round(100 * co / tong); };
      const mucSS = p => p >= 80 ? ["Sẵn sàng thí điểm nhỏ", "ok"] : p >= 50 ? ["Cần chuẩn bị thêm", "key"] : ["Chưa nên áp dụng", "eve"];

      const fHoten = ui.field({ id: "m3bh-hoten", label: "Họ tên học viên", value: S.hoten, onInput: v => { S.hoten = v; luu(); } });
      const tiles = ui.tiles({ items: BH.map(b => ({ id: b.id, title: b.ten, sub: b.tieude, kind: b.kind })), value: S.chon, cls: "narrow", onChange: v => { S.chon = v; luu(); veThe(); } });
      ctrl.append(h("div", { class: "fld" }, h("label", null, h("b", null, "Chọn bài học")), tiles), fHoten,
        ui.presets([{ label: "UBND Phường Mẫu (ví dụ)", apply: () => { S.co = {}; Object.keys(MAU).forEach(b => { S.co[b] = {}; MAU[b].forEach(k => { S.co[b][k] = true; }); }); luu(); veMaTran(); } }]),
        rowBtns(ui.btn("Tải CSV", () => LAB.csv.download("bai3_bon_bai_hoc_san_sang.csv", ["Bài học", ...DK.map(d => d[1]), "Mức sẵn sàng (%)", "Kết luận", "Học viên"],
          BH.map(b => [b.ten + " – " + b.tieude, ...DK.map(d => daCo(b.id, d[0]) ? "Đã có" : "Chưa có"), sanSang(b.id), mucSS(sanSang(b.id))[0], S.hoten]))),
          ui.btn("Làm lại", () => { S.co = {}; luu(); veMaTran(); })),
        ui.cancu("Nghị định 278/2025/NĐ-CP ngày 22/10/2025 của Chính phủ", "Kết nối, chia sẻ dữ liệu bắt buộc giữa các cơ quan trong hệ thống chính trị — căn cứ trong nước để vận dụng nguyên tắc “chỉ hỏi một lần”."),
        ui.cancu("Kết luận 160-KL/TW (Bộ Chính trị); Nghị định 118/2025/NĐ-CP ngày 09/6/2025", "Chính quyền địa phương 2 cấp từ 01/7/2025; cấp xã tiếp nhận 1.060 nhiệm vụ, quyền hạn được phân cấp, phân quyền — bối cảnh thể chế khiến không thể bê nguyên mô hình nước ngoài."));

      const the = ui.slot(), matran = ui.slot();
      view.append(the, matran,
        h("div", { class: "cols" },
          ui.panel("Giới hạn của việc sao chép mô hình",
            ol(["<b>Dân số:</b> Estonia hơn một triệu dân, Việt Nam trên trăm triệu.", "<b>Thể chế:</b> Việt Nam vận hành chính quyền địa phương hai cấp; cấp xã tiếp nhận 1.060 nhiệm vụ, quyền hạn.", "<b>Hạ tầng:</b> vùng sâu, vùng xa còn chênh lệch lớn về kết nối.", "<b>Văn hoá hành chính:</b> thói quen giấy tờ, tâm lý sợ trách nhiệm."]),
            ui.steps([{ t: "<b>Hiểu bối cảnh</b> — vì sao nước đó làm được" }, { t: "<b>Tách nguyên lý</b> — bỏ phần gắn với bối cảnh riêng" }, { t: "<b>Đối chiếu Việt Nam</b> — pháp lý, hạ tầng, con người" }, { t: "<b>Thí điểm nhỏ</b> — đo kết quả rồi mới nhân rộng", hi: true }]),
            ui.note("Sao chép nguyên mô hình nước ngoài là cách làm rủi ro nhất. Điều đáng học là nguyên lý và cách tổ chức, không phải bản sao của một hệ thống.", "eve")),
          ui.panel("Sáu bài học rút ra cho Việt Nam",
            ui.steps(["Giữ chính sách liên tục còn quan trọng hơn tăng ngân sách", "Chia sẻ dữ liệu trước, rồi mới bàn tới dịch vụ hay", "Một tài khoản dùng chung thay vì mỗi nơi một tài khoản", "Gom dịch vụ theo việc của dân, không theo cơ quan", "Bắt buộc số hoá phải đi kèm cơ chế hỗ trợ người yếu thế", "Đo bằng mức hài lòng và tỉ lệ sử dụng, không chỉ đo số lượng"].map(t => ({ t }))),
            ui.note("Sáu bài học này đều nằm trong tầm làm được của một đơn vị cấp sở, cấp xã (Nghị quyết 57-NQ/TW; Quyết định 1266/QĐ-TTg).", "ok"))));

      function veThe() {
        const b = BH.find(x => x.id === S.chon) || BH[0]; tiles.set(b.id);
        the.render(h("div", { class: "panel stack", style: { borderLeft: "4px solid var(--" + b.kind + ")" } },
          h("div", null, ui.tag(b.ten, b.kind), " ", h("b", null, b.tieude)),
          ...b.nd.map(t => h("p", { class: "small", style: { margin: "0" }, html: t })),
          ui.note("<b>Liên hệ Việt Nam:</b> " + b.lienhe, "key"),
          h("div", { class: "small" }, "Điều kiện tiên quyết quan trọng nhất (trọng số 3): " + DK.filter(d => b.w[d[0]] === 3).map(d => d[1]).join(", ") + ".")));
      }
      function veMaTran() {
        const rows = BH.map(b => {
          const p = sanSang(b.id), m = mucSS(p);
          const thieu = DK.filter(d => b.w[d[0]] === 3 && !daCo(b.id, d[0])).map(d => d[1]);
          return [h("b", { style: { cursor: "pointer" }, onclick: () => { S.chon = b.id; luu(); veThe(); } }, b.ten),
            ...DK.map(d => h("span", { class: "pill" + (daCo(b.id, d[0]) ? " on" : ""), id: "m3bh-" + b.id + "-" + d[0], role: "button", tabindex: 0, title: "Trọng số " + b.w[d[0]], onclick: () => { S.co[b.id] = S.co[b.id] || {}; S.co[b.id][d[0]] = !daCo(b.id, d[0]); luu(); veMaTran(); } }, (daCo(b.id, d[0]) ? "Đã có" : "Chưa có") + (b.w[d[0]] === 3 ? " ★" : ""))),
            ui.bar({ value: p, max: 100, kind: m[1], text: p + " %" }),
            h("div", null, ui.tag(m[0], m[1]), thieu.length ? h("div", { class: "small eve-c" }, "Thiếu điều kiện then chốt: " + thieu.join(", ")) : null)];
        });
        matran.render(ui.panel("Có thể vận dụng ở Phường Mẫu không? — bấm vào từng ô để đánh dấu điều kiện đã có / chưa có",
          ui.table(["Bài học", ...DK.map(d => d[1]), "Mức sẵn sàng", "Kết luận"], rows, { cls: "tight" }),
          ui.note("★ = điều kiện then chốt cho bài học đó (trọng số 3). Mức sẵn sàng = tổng trọng số các điều kiện đã có / tổng trọng số. Ngưỡng 80 % và 50 % là của phòng mô phỏng để gợi mở thảo luận, không phải chuẩn quốc tế.", "mut")));
      }
      veThe(); veMaTran(); pane.appendChild(root);
    } },
  ]
});
})();
