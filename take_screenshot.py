#!/usr/bin/env python3
import subprocess
import json
import time
import sys
import os
import websocket

PWD = '/home/wal3fo/Desktop/Sukoon'

def send_cmd(ws, cmd):
    msg = json.dumps({"id": 1, "method": cmd["method"], "params": cmd.get("params", {})})
    ws.send(msg)
    while True:
        resp = json.loads(ws.recv())
        if resp.get("id") == 1:
            return resp.get("result", {})

def take_screenshot(filename, width, height, url):
    ws = websocket.WebSocket()
    ws.connect("ws://127.0.0.1:9223/devtools/page/" + page_id)
    
    # Set viewport
    send_cmd(ws, {"method": "Emulation.setDeviceMetricsOverride", "params": {
        "width": width, "height": height, "deviceScaleFactor": 1, "mobile": False
    }})
    
    # Navigate
    send_cmd(ws, {"method": "Page.navigate", "params": {"url": url}})
    time.sleep(2)
    
    # Capture screenshot
    result = send_cmd(ws, {"method": "Page.captureScreenshot", "params": {"format": "png"}})
    if result:
        with open(filename, "wb") as f:
            import base64
            f.write(base64.b64decode(result["data"]))
        print(f"Saved: {filename}")

if __name__ == "__main__":
    # Get the page target
    import urllib.request
    tabs = json.loads(urllib.request.urlopen("http://127.0.0.1:9223/json").read())
    page_id = tabs[0]["id"]
    print(f"Page ID: {page_id}")
