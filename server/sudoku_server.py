"""Sudoku Puzzle Generator HTTP Server (port 8083)
GET /sudoku?size=9  →  {"puzzle": [[...]], "solution": [[...]], "size": 9}
GET /sudoku?size=12 →  12x12 with 4x3 boxes
GET /sudoku?size=16 →  16x16 with 4x4 boxes
"""
import json, random, time, math
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

def _box_dims(n):
    if n == 9:  return (3, 3)
    if n == 12: return (4, 3)
    if n == 16: return (4, 4)
    sr = int(math.isqrt(n))
    if sr * sr == n:
        return (sr, sr)
    for r in range(2, n):
        if n % r == 0:
            return (r, n // r)
    return (1, n)

def _candidates(board, row, col, n, br, bc):
    used = set()
    for i in range(n):
        if board[row][i] != 0: used.add(board[row][i])
        if board[i][col] != 0: used.add(board[i][col])
    r0 = (row // br) * br
    c0 = (col // bc) * bc
    for r in range(r0, r0 + br):
        for c in range(c0, c0 + bc):
            v = board[r][c]
            if v != 0: used.add(v)
    nums = list(range(1, n + 1))
    random.shuffle(nums)
    return [x for x in nums if x not in used]

def _fill(board, n, br, bc):
    for r in range(n):
        for c in range(n):
            if board[r][c] == 0:
                for v in _candidates(board, r, c, n, br, bc):
                    board[r][c] = v
                    if _fill(board, n, br, bc):
                        return True
                    board[r][c] = 0
                return False
    return True

def _solve(board, n, br, bc):
    for r in range(n):
        for c in range(n):
            if board[r][c] == 0:
                for v in range(1, n + 1):
                    ok = True
                    for i in range(n):
                        if board[r][i] == v or board[i][c] == v:
                            ok = False; break
                    if ok:
                        r0, c0 = (r // br) * br, (c // bc) * bc
                        for rr in range(r0, r0 + br):
                            for cc in range(c0, c0 + bc):
                                if board[rr][cc] == v:
                                    ok = False; break
                            if not ok: break
                    if ok:
                        board[r][c] = v
                        if _solve(board, n, br, bc):
                            return True
                        board[r][c] = 0
                return False
    return True

def generate(n=9):
    br, bc = _box_dims(n)
    board = [[0] * n for _ in range(n)]
    _fill(board, n, br, bc)
    solution = [row[:] for row in board]
    total = n * n
    remove_pct = {9: 0.40, 12: 0.35, 16: 0.30}.get(n, 0.35)
    remove_count = int(total * remove_pct)
    cells = [(r, c) for r in range(n) for c in range(n)]
    random.shuffle(cells)
    for r, c in cells[:remove_count]:
        val = board[r][c]
        board[r][c] = 0
        test = [row[:] for row in board]
        if _solve(test, n, br, bc):
            pass
        else:
            board[r][c] = val
    return {"puzzle": board, "solution": solution, "size": n}

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path != "/sudoku":
            self.send_response(404)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b"not found")
            return
        qs = parse_qs(parsed.query)
        size_str = qs.get("size", ["9"])[0]
        try:
            size = int(size_str)
        except ValueError:
            size = 9
        if size not in (9, 12, 16):
            self.send_response(400)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b"size must be 9, 12, or 16")
            return
        t0 = time.time()
        data = generate(size)
        elapsed = time.time() - t0
        body = json.dumps(data).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
        print(f"[sudoku] size={size} generated in {elapsed:.2f}s")
    def log_message(self, fmt, *args):
        pass

if __name__ == "__main__":
    port = 8083
    server = HTTPServer(("0.0.0.0", port), Handler)
    print(f"[sudoku_server] listening on 0.0.0.0:{port}")
    server.serve_forever()
