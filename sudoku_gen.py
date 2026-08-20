#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ADV9 數獨 9x9 產生器 — 輸出 JSON {board:[81], answer:[81]}（0=空格）"""
import json
import random
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def gen_full():
    base = list(range(1, 10))
    # 產生完整解
    board = [[0] * 9 for _ in range(9)]

    def fill():
        for i in range(9):
            for j in range(9):
                if board[i][j] == 0:
                    random.shuffle(base)
                    for v in base:
                        if ok(i, j, v):
                            board[i][j] = v
                            if fill():
                                return True
                            board[i][j] = 0
                    return False
        return True

    def ok(r, c, v):
        for k in range(9):
            if board[r][k] == v or board[k][c] == v:
                return False
        br, bc = r // 3 * 3, c // 3 * 3
        for i in range(br, br + 3):
            for j in range(bc, bc + 3):
                if board[i][j] == v:
                    return False
        return True

    fill()
    return board

def gen_puzzle(solution, clues=32):
    cells = [(r, c) for r in range(9) for c in range(9)]
    random.shuffle(cells)
    puzzle = [row[:] for row in solution]
    removed = 0
    for (r, c) in cells:
        if removed >= 81 - clues:
            break
        keep = puzzle[r][c]
        puzzle[r][c] = 0
        if count_solutions(puzzle) != 1:
            puzzle[r][c] = keep
        else:
            removed += 1
    return puzzle

def count_solutions(board, limit=2):
    cnt = [0]
    b = [row[:] for row in board]
    empty = [(r, c) for r in range(9) for c in range(9) if b[r][c] == 0]

    def ok(r, c, v):
        for k in range(9):
            if b[r][k] == v or b[k][c] == v:
                return False
        br, bc = r // 3 * 3, c // 3 * 3
        for i in range(br, br + 3):
            for j in range(bc, bc + 3):
                if b[i][j] == v:
                    return False
        return True

    def solve(idx):
        if cnt[0] >= limit:
            return
        if idx == len(empty):
            cnt[0] += 1
            return
        r, c = empty[idx]
        for v in range(1, 10):
            if ok(r, c, v):
                b[r][c] = v
                solve(idx + 1)
                b[r][c] = 0
                if cnt[0] >= limit:
                    return

    solve(0)
    return cnt[0]

def main():
    seed = int(sys.argv[1]) if len(sys.argv) > 1 else None
    if seed:
        random.seed(seed)
    solution = gen_full()
    puzzle = gen_puzzle(solution)
    print(json.dumps({
        "board": [x for row in puzzle for x in row],
        "answer": [x for row in solution for x in row],
    }, ensure_ascii=False))

if __name__ == '__main__':
    main()