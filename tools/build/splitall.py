#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
splitall.py — ADV9 前端「全畫面懶載入」拆分工具
=================================================
把 index.html 主腳本拆成：
  - 外殼（shell）：登入、核心工具、共用資料、被外殼程式碼引用的函式 → 留在 index.html
  - 每個畫面一個模組：public/js/views/<畫面名>.js（進入畫面才載）
  - 共用模組：public/js/shared.js（被多個畫面模組共用、但畫面沒用到就不載）

進入畫面時包裝函式 async function vX(){ await needJs(...) } 才載入所需模組。
用法：python3 tools/build/splitall.py
前置：node tools/build/analyze.js 可執行（用 acorn）
"""
import re, io, sys, os, json, subprocess

try:
    sys.stdout.reconfigure(errors="replace")
except Exception:
    pass

ROOT = __file__.replace("\\", "/").rsplit("/", 3)[0]
HTML = ROOT + "/public/index.html"
VIEWS = ROOT + "/public/js/views"
SHARED = ROOT + "/public/js/shared.js"
SHARED_SRC = "js/shared.js"
SHARED_FANIN = 4       # 被 ≥4 個不同模組引用 → 共用模組
ROOT_RE = re.compile(r"^v[A-Z]")   # 畫面函式命名

LOADER = """/* ════════════════════════════════════════════════════════════
   模組懶載入（由 tools/build/splitall.py 產生，勿手動改）
   每個畫面一個 js/views/ 模組：用到才載入，沒用到的完全不載
   ════════════════════════════════════════════════════════════ */
const JSLOAD={};
async function needJs(list){
  if(typeof list==='string')list=[list];
  const out=await Promise.all(list.map(src=>new Promise(res=>{
    if(JSLOAD[src])return res(true);
    const t=document.createElement('script');
    t.src=src;t.onload=()=>{JSLOAD[src]=1;res(true)};t.onerror=()=>res(false);
    document.head.appendChild(t);
  })));
  return out.every(Boolean);
}"""

TOKEN_RE = re.compile(r"\b([\w$]+)\b")
CALL_RE = re.compile(r"\b([\w$]+)\s*\(")
TYPEOF_RE = re.compile(r"\btypeof\s+([\w$]+)")


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, cwd=ROOT,
                          encoding="utf-8", errors="replace")


def main():
    lines = io.open(HTML, encoding="utf-8").read().split("\n")
    n = len(lines)

    # ---- 1) acorn 分析（全部 script）----
    r = run(["node", "tools/build/analyze.js"])
    if r.returncode != 0:
        raise SystemExit("analyze 失敗：\n" + r.stderr)
    A = json.loads(r.stdout)

    funcs = {}
    consts = {}
    f_crefs = {}
    c_crefs = {}
    for f in A["funcs"]:
        funcs[f["name"]] = (f["start"], f["end"])
        f_crefs[f["name"]] = set(f["codeRefs"])
    for c in A["consts"]:
        consts[c["name"]] = (c["start"], c["end"])
        c_crefs[c["name"]] = set(c["codeRefs"])
    units = dict(funcs); units.update(consts)
    allnames = set(units)

    others_crefs = set()
    for o in A["others"]:
        others_crefs |= set(o["codeRefs"])

    is_view = lambda nm: bool(ROOT_RE.match(nm))

    def text_of(start, end):
        return "\n".join(lines[start - 1:end])

    # 原始掃描引用（程式碼 + 字串文字）：單遍 token 掃描
    def scan_refs(txt):
        refs = set()
        for m in CALL_RE.finditer(txt):
            nm = m.group(1)
            if nm in funcs:
                refs.add(nm)
        for m in TYPEOF_RE.finditer(txt):
            nm = m.group(1)
            if nm in funcs:
                refs.add(nm)
        for m in TOKEN_RE.finditer(txt):
            nm = m.group(1)
            if nm in consts:
                refs.add(nm)
        return refs

    # ---- 2) 引用統計 ----
    unit_refs = {}    # 原始掃描引用（程式碼 + 字串）
    unit_crefs = {}   # 真實程式碼引用（僅頂層單位名）
    for nm, (s, e) in units.items():
        rs = scan_refs(text_of(s, e))
        rs.discard(nm)
        unit_refs[nm] = rs
        cr = (set(f_crefs.get(nm, set())) | set(c_crefs.get(nm, set()))) & allnames
        cr.discard(nm)
        unit_crefs[nm] = cr

    html_txt = "\n".join(lines[: min(u[0] for u in units.values()) - 1])
    html_refs = scan_refs(html_txt)
    top_refs = set(others_crefs)

    # 需要的引用 = 程式碼引用 ∪（字串引用 ∩ 非畫面函式）
    needed_cache = {}
    def needed_refs(nm):
        if nm not in needed_cache:
            needed_cache[nm] = unit_crefs[nm] | (unit_refs[nm] - unit_crefs[nm] - set(
                x for x in unit_refs[nm] if is_view(x)))
        return needed_cache[nm]

    # ---- 3) 歸屬：從每個畫面根 BFS 認領非畫面函式 ----
    roots = sorted((nm for nm in funcs if is_view(nm)), key=lambda x: units[x][0])
    owner = {}
    for root in roots:
        seen = set()
        frontier = [root]
        while frontier:
            cur = frontier.pop(0)
            for tgt in needed_refs(cur):
                if tgt in funcs and not is_view(tgt) and tgt not in seen and tgt not in owner:
                    owner[tgt] = root
                    seen.add(tgt)
                    frontier.append(tgt)

    # ---- 4) 外殼判定（可把已歸屬的拉回外殼；畫面函式永不外殼）----
    shell = set()
    for nm in funcs:
        if not is_view(nm) and (nm in html_refs or nm in top_refs):
            shell.add(nm)
    changed = True
    while changed:
        changed = False
        for nm in funcs:
            if is_view(nm) or nm in shell:
                continue
            if needed_refs(nm) & shell:
                shell.add(nm); changed = True
    for nm in consts:
        if nm in html_refs or nm in top_refs:
            shell.add(nm)
    changed = True
    while changed:
        changed = False
        for nm in allnames:
            if is_view(nm) or nm in shell:
                continue
            if needed_refs(nm) & shell:
                shell.add(nm); changed = True
    # 外殼單位引用的單位 → 也留在外殼（外殼先載入，不能依賴懶載入模組）
    changed = True
    while changed:
        changed = False
        for nm in list(shell):
            if is_view(nm):
                continue
            for r in needed_refs(nm):
                if r in allnames and not is_view(r) and r not in shell:
                    shell.add(r); changed = True

    # ---- 5) 模組引用表（單遍）：target -> 引用它的模組集合 ----
    mods_map = {}
    for u in allnames:
        mo = None
        if is_view(u):
            mo = u
        elif u in owner and u not in shell:
            mo = owner[u]
        if mo:
            for ref in needed_refs(u):
                mods_map.setdefault(ref, set()).add(mo)
    for t in html_refs | top_refs:
        mods_map.setdefault(t, set()).add("__shell__")

    def ref_mods_of(target):
        return mods_map.get(target, set())

    # ---- 6) 共用模組：被 ≥4 個不同模組引用、且未進外殼 ----
    shared = set()
    for nm in funcs:
        if is_view(nm) or nm in shell:
            continue
        mods = ref_mods_of(nm)
        mods.discard("__shell__")
        mods.discard(owner.get(nm))
        if len(mods) >= SHARED_FANIN:
            shared.add(nm)
    for nm in consts:
        if nm in shell:
            continue
        mods = ref_mods_of(nm)
        mods.discard("__shell__")
        if len(mods) >= SHARED_FANIN:
            shared.add(nm)
    # 被共用函式引用的非畫面函式 → 共用（fixpoint）
    changed = True
    while changed:
        changed = False
        for nm in funcs:
            if is_view(nm) or nm in shell or nm in shared:
                continue
            if needed_refs(nm) & shared:
                shared.add(nm); changed = True
    for nm in consts:
        if nm in shell or nm in shared:
            continue
        if needed_refs(nm) & shared:
            shared.add(nm)

    # ---- 7) 模組內容 ----
    modules = {rt: {rt} for rt in roots}
    for nm, rt in owner.items():
        if nm not in shell and nm not in shared:
            modules[rt].add(nm)
    for nm in consts:
        if nm in shell or nm in shared:
            continue
        mods = ref_mods_of(nm)
        mods.discard("__shell__")
        if len(mods) == 1:
            rt = next(iter(mods))
            if rt in modules:
                modules[rt].add(nm)
    for nm in funcs:
        if not is_view(nm) and nm not in shell and nm not in shared and nm not in owner:
            shell.add(nm)
    for nm in consts:
        if nm not in shell and nm not in shared and not any(nm in us for us in modules.values()):
            shell.add(nm)

    # ---- 8) 模組依賴 ----
    def mod_of(u):
        if u in funcs:
            if is_view(u): return u
            if u in shared: return "__shared__"
            if u in owner and u not in shell: return owner[u]
            return None
        if u in consts:
            if u in shared: return "__shared__"
            for rt, us in modules.items():
                if u in us: return rt
            return None
        return None

    module_deps = {}
    for rt in roots:
        deps = set()
        for u in modules[rt]:
            for ref in needed_refs(u):
                m2 = mod_of(ref)
                if m2 and m2 != rt:
                    deps.add(m2)
        module_deps[rt] = deps
    for rt in list(module_deps):
        stack = list(module_deps[rt]); all_d = set(module_deps[rt])
        while stack:
            d = stack.pop()
            for d2 in module_deps.get(d, ()):
                if d2 not in all_d and d2 != rt:
                    all_d.add(d2); stack.append(d2)
        module_deps[rt] = all_d

    # ---- 9) 完整性檢查 ----
    shell_units = set(funcs) | set(consts)
    for us in modules.values():
        shell_units -= us
    errs = []
    for rt, us in modules.items():
        deps_units = set()
        for d in module_deps[rt]:
            if d == "__shared__":
                deps_units |= shared
            else:
                deps_units |= modules[d]
        for u in us:
            for ref in needed_refs(u):
                if ref in us or ref in shell_units or ref in deps_units:
                    continue
                errs.append("%s 引用 %s 無法解析（模組 %s）" % (u, ref, rt))
    if errs:
        print("✖ 完整性檢查失敗，%d 個問題：" % len(errs))
        for e in errs[:40]:
            print("   ", e)
        raise SystemExit(1)

    # ---- 10) 寫模組檔 ----
    os.makedirs(VIEWS, exist_ok=True)
    for f in os.listdir(VIEWS):
        os.remove(os.path.join(VIEWS, f))
    # 同一行含多個宣告（const a=…,b=…）→ 同一範圍可能有多個單位名，寫入時去重
    def dedupe_by_range(us):
        seen = set()
        out = []
        for u in sorted(us, key=lambda x: units[x][0]):
            if units[u][0] not in seen:
                seen.add(units[u][0])
                out.append(u)
        return out

    for rt in roots:
        us = dedupe_by_range(modules[rt])
        body = "\n\n".join(text_of(*units[u]) for u in us)
        header = ("/* ════════════════════════════════════════════\n"
                  "   %s 畫面模組（splitall.py 自動拆分，懶載入：進入此畫面才載入）\n"
                  "   含 %d 個單位：%s\n"
                  "   ════════════════════════════════════════════ */\n"
                  % (rt, len(us), ", ".join(us[:12]) + ("…" if len(us) > 12 else "")))
        with io.open(os.path.join(VIEWS, rt + ".js"), "w", encoding="utf-8") as f:
            f.write(header + body + "\n")
    if shared:
        us = dedupe_by_range(shared)
        body = "\n\n".join(text_of(*units[u]) for u in us)
        header = ("/* ════════════════════════════════════════════\n"
                  "   共用模組（splitall.py 自動拆分）：被多個畫面共用，任一畫面用到才載入\n"
                  "   含 %d 個單位：%s\n"
                  "   ════════════════════════════════════════════ */\n"
                  % (len(us), ", ".join(us[:12]) + ("…" if len(us) > 12 else "")))
        with io.open(SHARED, "w", encoding="utf-8") as f:
            f.write(header + body + "\n")
    else:
        if os.path.exists(SHARED):
            os.remove(SHARED)

    # ---- 11) 重寫 index.html ----
    removed = set()
    for us in modules.values():
        removed |= us
    removed |= shared
    keep = set(funcs) | set(consts) - removed

    out = []
    inserted = False
    first_shell_line = min(units[u][0] for u in keep)
    root_pos = {units[rt][0]: rt for rt in roots}
    i = 0
    while i < n:
        ln = i + 1
        if not inserted and ln >= first_shell_line:
            out.append(LOADER)
            inserted = True
        skip_to = None
        for nm in removed:
            s, e = units[nm]
            if s == ln:
                skip_to = e
                break
        if skip_to is not None:
            root = root_pos.get(ln)
            if root:
                dep_files = []
                if "__shared__" in module_deps[root]:
                    dep_files.append(SHARED_SRC)
                dep_files += sorted(("js/views/%s.js" % d for d in module_deps[root] if d != "__shared__"),
                                    key=lambda x: x)
                dep_files.append("js/views/%s.js" % root)
                dep_s = "[" + ", ".join("'%s'" % d for d in dep_files) + "]"
                out.append("async function %s(){\n"
                           "  if(!await needJs(%s))return toast('模組載入失敗，請重新整理頁面','bad');\n"
                           "  %s();\n}" % (root, dep_s, root))
            i = skip_to
            continue
        out.append(lines[i])
        i += 1

    io.open(HTML, "w", encoding="utf-8").write("\n".join(out))

    # ---- 12) 統計 ----
    print("✓ 拆分完成：%d 個畫面模組 → %s" % (len(roots), "public/js/views/"))
    if shared:
        print("  ＋ 共用模組 public/js/shared.js（%d 行）" %
              len(open(SHARED, encoding="utf-8").read().split("\n")))
    print("  外殼 %d 行 / 總 %d 行（外殼佔 %.1f%%，其餘畫面用到才載）" %
          (len(out), n, 100.0 * len(out) / n))
    tot = 0
    for rt in roots:
        sz = len(open(os.path.join(VIEWS, rt + ".js"), encoding="utf-8").read().split("\n"))
        tot += sz
        dl = []
        if "__shared__" in module_deps[rt]:
            dl.append("shared")
        dl += sorted(module_deps[rt] - {"__shared__"})
        print("   %-16s %5d 行  依賴: %s" % (rt + ".js", sz,
              ",".join(dl) if dl else "-"))
    print("  模組合計 %d 行（外殼未載入時完全不傳輸）" % tot)


if __name__ == "__main__":
    main()