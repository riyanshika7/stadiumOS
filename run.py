import os
import sys
import subprocess
import time

def run_command_in_background(cmd, cwd):
    """Starts a subprocess in the specified working directory."""
    print(f"Executing: {' '.join(cmd)} in {cwd}")
    shell_val = sys.platform == "win32"
    return subprocess.Popen(cmd, cwd=cwd, shell=shell_val)

def main():
    print("=" * 60)
    print("       StadiumOS: FIFA World Cup 2026 Volunteer Co-Pilot")
    print("               Startup Launcher & Dependency Checker")
    print("=" * 60)

    project_root = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(project_root, "backend")
    frontend_dir = os.path.join(project_root, "frontend")

    # 1. Check Python dependencies
    print("\n[1/3] Checking backend dependencies...")
    try:
        import fastapi
        import uvicorn
        import sqlalchemy
        import dotenv
        print("[OK] Python backend dependencies are present.")
    except ImportError:
        print("Backend dependencies missing. Installing requirements.txt...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", os.path.join(backend_dir, "requirements.txt")])
            print("[OK] Backend dependencies installed successfully.")
        except Exception as e:
            print(f"Error installing backend dependencies: {e}")
            print("Please run manually: pip install -r backend/requirements.txt")

    # 2. Check Node dependencies
    print("\n[2/3] Checking frontend node_modules...")
    node_modules_dir = os.path.join(frontend_dir, "node_modules")
    if not os.path.exists(node_modules_dir):
        print("node_modules folder not found. Running npm install...")
        try:
            npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
            subprocess.check_call([npm_cmd, "install"], cwd=frontend_dir, shell=sys.platform == "win32")
            print("[OK] Frontend packages installed successfully.")
        except Exception as e:
            print(f"Error running npm install: {e}")
            print(f"Please run manually in folder {frontend_dir}: npm install")
    else:
        print("[OK] Frontend node_modules are present.")

    # 3. Spin up servers
    print("\n[3/3] Launching servers concurrently...")
    
    processes = []
    try:
        # Start Backend: FastAPI (uvicorn)
        backend_cmd = [sys.executable, "-m", "uvicorn", "backend.app.main:app", "--host", "127.0.0.1", "--port", "8000"]
        env = os.environ.copy()
        env["PYTHONPATH"] = project_root
        
        backend_proc = subprocess.Popen(
            backend_cmd,
            cwd=project_root,
            env=env,
            shell=False   # Must be False: shell=True on Windows causes "Terminate batch job" on Uvicorn reloads
        )
        processes.append(backend_proc)
        print("[OK] FastAPI backend launched at: http://127.0.0.1:8000")

        # Wait a moment for backend to initialize database
        time.sleep(1.5)

        # Start Frontend: React (Vite)
        npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
        frontend_proc = subprocess.Popen(
            [npm_cmd, "run", "dev"],
            cwd=frontend_dir,
            shell=sys.platform == "win32"
        )
        processes.append(frontend_proc)
        print("[OK] Vite React frontend launched at: http://127.0.0.1:5173")

        print("\n" + "="*50)
        print("StadiumOS is now RUNNING!")
        print("-> Frontend: http://127.0.0.1:5173")
        print("-> Backend API Documentation: http://127.0.0.1:8000/docs")
        print("Press Ctrl+C to stop both servers.")
        print("="*50 + "\n")

        # Keep launcher alive
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("\nShutting down servers...")
        for p in processes:
            try:
                if sys.platform == "win32":
                    subprocess.call(["taskkill", "/F", "/T", "/PID", str(p.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                else:
                    p.terminate()
            except Exception:
                pass
        print("Servers stopped. Thank you for using StadiumOS!")

if __name__ == "__main__":
    main()
