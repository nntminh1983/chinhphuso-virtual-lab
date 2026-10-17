#!/bin/bash
# Dùng: _build/selftest.sh [rộng]  -> mở index.html#selftest bằng Chrome headless ở độ rộng cho trước (mặc định 1400)
# In "OK m5-chatluong" cho từng tab, "FAIL" nếu lỗi JS, "TRÀN" nếu có phần tử tràn ngang.
W=${1:-1400}
URL="file:///G:/A.%20Personal%20Data/3-IU%20Courses/3.7-Public%20Administration/KhoaHoc_ChienLuoc_CPS_10Buoi/CPS_VirtualLab/index.html#selftest"
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --window-size=$W,1000 --virtual-time-budget=8000 --dump-dom "$URL" 2>/dev/null | py -3.13 -X utf8 -c "import sys,re,html;d=sys.stdin.read();m=re.search(r'<pre id=\"selftest\">(.*?)</pre>',d,re.S);print(html.unescape(m.group(1)) if m else 'KHONG THAY selftest (loi cu phap JS? chay _build/jscheck.py)')"
