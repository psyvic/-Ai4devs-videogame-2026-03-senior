#!/usr/bin/env python3
"""Run a local static server for the Minesweeper project."""

from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

HOST = "127.0.0.1"
PORT = 8000


def main() -> None:
    project_dir = Path(__file__).resolve().parent
    handler = lambda *args, **kwargs: SimpleHTTPRequestHandler(  # noqa: E731
        *args, directory=str(project_dir), **kwargs
    )

    server = ThreadingHTTPServer((HOST, PORT), handler)
    print(f"Serving {project_dir} at http://{HOST}:{PORT}")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
