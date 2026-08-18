"""Sudoku Server with PK Matchmaking (port 8083)
GET /sudoku?size=9|12|16  -> puzzle + solution
POST /pk/join   -> join PK queue (body: {name, token})
GET  /pk/status?token=X  -> poll for match status + leaderboard
POST /pk/progress -> submit progress (body: {token, filled, total, solved})
POST /pk/start    -> force start match with current players (admin)
"""
import json, random, time, math, threading, hashlib
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from collections import OrderedDict

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

def _ok(board, n, br, bc, r, c, v):
    for i in range(n):
        if board[r][i] == v: return False
        if board[i][c] == v: return False
    r0, c0 = (r // br) * br, (c // bc) * bc
    for rr in range(r0, r0 + br):
        for cc in range(c0, c0 + bc):
            if board[rr][cc] == v: return False
    return True

def _solve(board, n, br, bc):
    for r in range(n):
        for c in range(n):
            if board[r][c] == 0:
                nums = list(range(1, n + 1))
                random.shuffle(nums)
                for v in nums:
                    if _ok(board, n, br, bc, r, c, v):
                        board[r][c] = v
                        if _solve(board, n, br, bc):
                            return True
                        board[r][c] = 0
                return False
    return True

def _fill(board, n, br, bc):
    _solve(board, n, br, bc)

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

# ─── PK Matchmaking ───
PK_QUEUE = []
PK_MATCHES = {}
PK_LOCK = threading.Lock()
PK_MATCH_TIMEOUT = 10

def _gen_token(name):
    return hashlib.md5((name + str(time.time()) + str(random.random())).encode()).hexdigest()[:12]

class PKPlayer:
    def __init__(self, name, token):
        self.name = name
        self.token = token
        self.progress = 0
        self.filled = 0
        self.total = 0
        self.solved = False
        self.finish_time = None
        self.join_time = time.time()

class PKMatch:
    def __init__(self, match_id):
        self.id = match_id
        self.players = {}
        self.puzzle_data = None
        self.started = False
        self.start_time = None
        self.duration = 30 * 60
        self.created_at = time.time()

    def to_dict(self):
        players = []
        for t, p in self.players.items():
            players.append({
                "name": p.name,
                "progress": round(p.progress, 1),
                "solved": p.solved,
                "finish_time": round(p.finish_time, 1) if p.finish_time else None
            })
        elapsed = 0
        if self.start_time:
            elapsed = time.time() - self.start_time
        return {
            "match_id": self.id,
            "started": self.started,
            "elapsed": round(elapsed, 1),
            "duration": self.duration,
            "puzzle": self.puzzle_data["puzzle"] if self.puzzle_data and self.started else None,
            "size": 12,
            "players": sorted(players, key=lambda x: (-x["solved"], -x["progress"])),
            "time_left": max(0, self.duration - elapsed) if self.started else 0
        }

def _cleanup_queue():
    now = time.time()
    PK_QUEUE[:] = [p for p in PK_QUEUE if now - p.join_time < 300]

def _try_start_match():
    _cleanup_queue()
    if len(PK_QUEUE) >= 2:
        match_id = "pk_" + str(int(time.time() * 1000))
        match = PKMatch(match_id)
        players_in = list(PK_QUEUE[:10])
        PK_QUEUE[:] = PK_QUEUE[len(players_in):]
        for p in players_in:
            match.players[p.token] = p
        match.puzzle_data = generate(12)
        match.started = True
        match.start_time = time.time()
        with PK_LOCK:
            PK_MATCHES[match_id] = match
        return match
    return None

class Handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        qs = parse_qs(parsed.query)

        if path == "/sudoku":
            self._handle_sudoku(qs)
        elif path == "/pk/status":
            self._handle_pk_status(qs)
        else:
            self.send_response(404)
            self.send_header("Content-Type", "text/plain")
            self._cors()
            self.end_headers()
            self.wfile.write(b"not found")

    def do_POST(self):
        parsed = urlparse(self.path)
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length)) if length > 0 else {}

        if parsed.path == "/pk/join":
            self._handle_pk_join(body)
        elif parsed.path == "/pk/progress":
            self._handle_pk_progress(body)
        elif parsed.path == "/pk/leave":
            self._handle_pk_leave(body)
        else:
            self.send_response(404)
            self.send_header("Content-Type", "text/plain")
            self._cors()
            self.end_headers()
            self.wfile.write(b"not found")

    def _handle_sudoku(self, qs):
        size_str = qs.get("size", ["9"])[0]
        try:
            size = int(size_str)
        except ValueError:
            size = 9
        if size not in (9, 12, 16):
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self._cors()
            self.end_headers()
            self.wfile.write(json.dumps({"error": "size must be 9, 12, or 16"}).encode())
            return
        t0 = time.time()
        data = generate(size)
        elapsed = time.time() - t0
        body = json.dumps(data).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._cors()
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
        print(f"[sudoku] size={size} generated in {elapsed:.2f}s")

    def _handle_pk_join(self, body):
        name = str(body.get("name", "Player"))[:20].strip() or "Player"
        token = _gen_token(name)
        player = PKPlayer(name, token)

        with PK_LOCK:
            _cleanup_queue()
            PK_QUEUE.append(player)

        match = _try_start_match()

        resp = {"token": token, "name": name, "queue_pos": len(PK_QUEUE)}
        if match:
            resp["match_id"] = match.id
            resp["started"] = True
            resp["puzzle"] = match.puzzle_data["puzzle"]
            resp["solution"] = match.puzzle_data["solution"]
            resp["duration"] = match.duration
        else:
            resp["started"] = False
            resp["message"] = "已加入匹配隊列，等待其他玩家..."

        body = json.dumps(resp).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._cors()
        self.end_headers()
        self.wfile.write(body)

    def _handle_pk_status(self, qs):
        token = qs.get("token", [""])[0]
        if not token:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self._cors()
            self.end_headers()
            self.wfile.write(json.dumps({"error": "token required"}).encode())
            return

        match = None
        with PK_LOCK:
            for m in PK_MATCHES.values():
                if token in m.players:
                    match = m
                    break

        if not match:
            in_queue = any(p.token == token for p in PK_QUEUE)
            resp = {"in_queue": in_queue, "started": False}
            if in_queue:
                pos = next((i + 1 for i, p in enumerate(PK_QUEUE) if p.token == token), 0)
                resp["queue_pos"] = pos
                resp["queue_size"] = len(PK_QUEUE)
        else:
            resp = match.to_dict()
            resp["in_queue"] = False
            if token in match.players:
                me = match.players[token]
                resp["my_progress"] = round(me.progress, 1)
                resp["my_solved"] = me.solved

        body = json.dumps(resp).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._cors()
        self.end_headers()
        self.wfile.write(body)

    def _handle_pk_progress(self, body):
        token = body.get("token", "")
        filled = int(body.get("filled", 0))
        total = int(body.get("total", 144))
        solved = bool(body.get("solved", False))

        with PK_LOCK:
            for m in PK_MATCHES.values():
                if token in m.players:
                    p = m.players[token]
                    p.filled = filled
                    p.total = total
                    p.progress = (filled / total * 100) if total > 0 else 0
                    if solved and not p.solved:
                        p.solved = True
                        p.finish_time = time.time() - m.start_time
                    break

        body = json.dumps({"ok": True}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self._cors()
        self.end_headers()
        self.wfile.write(body)

    def _handle_pk_leave(self, body):
        token = body.get("token", "")
        with PK_LOCK:
            PK_QUEUE[:] = [p for p in PK_QUEUE if p.token != token]
            for m in list(PK_MATCHES.values()):
                if token in m.players:
                    del m.players[token]
        body = json.dumps({"ok": True}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self._cors()
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        pass

def _match_cleanup_thread():
    while True:
        time.sleep(30)
        now = time.time()
        with PK_LOCK:
            to_del = [mid for mid, m in PK_MATCHES.items()
                      if (now - m.created_at > 3600) or (m.started and m.start_time and now - m.start_time > m.duration + 60)]
            for mid in to_del:
                del PK_MATCHES[mid]

if __name__ == "__main__":
    port = 8083
    t = threading.Thread(target=_match_cleanup_thread, daemon=True)
    t.start()
    server = HTTPServer(("0.0.0.0", port), Handler)
    print(f"[sudoku_server] listening on 0.0.0.0:{port}")
    server.serve_forever()
