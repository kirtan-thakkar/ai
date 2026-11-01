"""
CineMind AI - One-Command Launcher
Launches:
  1. Python FastAPI AI Engine on port 8001
  2. Node.js API Gateway & React UI on port 4000
Usage: python start.py
"""

import subprocess
import sys
import os
import time

def start_all():
    print("================================================================")
    print("   CineMind AI: Intelligent Movie Discovery & Planning Agent")
    print("================================================================")
    
    root_dir = os.path.dirname(os.path.abspath(__file__))
    ai_dir = os.path.join(root_dir, "apps", "ai-service")
    api_dir = os.path.join(root_dir, "apps", "api")

    print("\n[1/2] Starting Python FastAPI AI Engine (port 8001)...")
    ai_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8001"],
        cwd=ai_dir
    )

    print("[2/2] Starting Node.js API Gateway & React Frontend (port 4000)...")
    api_proc = subprocess.Popen(
        ["node", "src/server.js"],
        cwd=api_dir,
        shell=True
    )

    print("\n----------------------------------------------------------------")
    print("  Application successfully started!")
    print("  Web Application:   http://localhost:4000")
    print("  REST API Gateway:  http://localhost:4000/api/v1")
    print("  AI FastAPI Docs:   http://127.0.0.1:8001/docs")
    print("  Academic Viva:     http://localhost:4000/viva")
    print("----------------------------------------------------------------")
    print("Press Ctrl+C to terminate all services.\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down services...")
        ai_proc.terminate()
        api_proc.terminate()
        print("Done.")

if __name__ == "__main__":
    start_all()
