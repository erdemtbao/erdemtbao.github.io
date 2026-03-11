#!/usr/bin/env python3
# 在本地启动 HTTP 服务器。建议运行: py -3 start-server.py
"""用 Python 在本地启动 HTTP 服务器并打开浏览器。"""
import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)
    sys.stderr.reconfigure(line_buffering=True)
print("Python 脚本已启动...", flush=True)

import http.server
import socketserver
import webbrowser
import os

PORT = 8080
DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(DIR)

Handler = http.server.SimpleHTTPRequestHandler
for port in [PORT, 8888, 8000]:
    try:
        httpd = socketserver.TCPServer(("", port), Handler)
        break
    except OSError as e:
        if "address already in use" in str(e).lower() or "10048" in str(e):
            print("端口 %s 已被占用，尝试下一端口..." % port)
            continue
        raise
else:
    print("无法绑定端口，请关闭占用 8080/8888/8000 的程序后重试")
    sys.exit(1)

print("本地服务器已启动")
print("目录:", DIR)
print("地址: http://localhost:%s" % port)
print("地图页: http://localhost:%s/talkmap/map.html" % port)
print("按 Ctrl+C 停止\n")

webbrowser.open("http://localhost:%s" % port)

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\n已停止")
finally:
    httpd.shutdown()
