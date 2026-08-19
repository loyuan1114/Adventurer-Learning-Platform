/*
 * calc_blackbox.cpp — ADV9 C++ 計算黑盒
 * Copyright (C) 2026 loyuan1114
 * Licensed under the GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later).
 * ---------------------------------------------------------------------------
 * 用途：修練場的戰鬥模擬與掉落生成。計算邏輯封裝在編譯後的可執行檔內，
 *       對外只回傳結果 JSON，不揭露模擬內部細節（黑盒）。
 * 輸入：stdin 讀入 JSON：{action:"simulate|loot", seed, ticks, players, enemies,
 *                         count, tier}
 * 輸出：stdout 輸出 JSON 結果。
 * 編譯：g++ -O2 -std=c++17 calc_blackbox.cpp -o calc_blackbox
 * ---------------------------------------------------------------------------
 */
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <cstdint>
#include <string>
#include <vector>
#include <cmath>

/* ── 簡單可攜式偽隨機（xorshift64*）── */
struct Rng {
    uint64_t s;
    explicit Rng(uint64_t seed) { s = seed ? seed : 0x9E3779B97F4A7C15ULL; }
    uint64_t next() {
        s ^= s >> 12; s ^= s << 25; s ^= s >> 27;
        return s * 0x2545F4914F6CDD1DULL;
    }
    double unit() { return (double)(next() >> 11) / (double)(1ULL << 53); }
    int range(int lo, int hi) { if (hi <= lo) return lo; return lo + (int)(unit() * (hi - lo + 1)); }
};

/* ── 從 JSON 字串中粗略取值（黑盒不需完整 JSON parser，專案量級足夠）── */
static double num_field(const std::string& s, const char* key) {
    std::string k = std::string("\"") + key + "\"";
    size_t p = s.find(k);
    if (p == std::string::npos) return 0;
    p = s.find(':', p + k.size());
    if (p == std::string::npos) return 0;
    p++;
    while (p < s.size() && (s[p] == ' ' || s[p] == '\t')) p++;
    if (p < s.size() && s[p] == '"') { p++; }
    std::string v;
    while (p < s.size() && ((s[p] >= '0' && s[p] <= '9') || s[p] == '.' || s[p] == '-')) v += s[p++];
    return atof(v.c_str());
}
static std::string str_field(const std::string& s, const char* key) {
    std::string k = std::string("\"") + key + "\"";
    size_t p = s.find(k);
    if (p == std::string::npos) return "";
    p = s.find(':', p + k.size());
    if (p == std::string::npos) return "";
    p++;
    while (p < s.size() && s[p] != '"') p++;
    p++;
    std::string v;
    while (p < s.size() && s[p] != '"') v += s[p++];
    return v;
}

/* ── 掉落稀有度（黑盒內部的機率表）── */
static const char* rarity_by(int roll) {
    if (roll >= 97) return "UR";
    if (roll >= 88) return "SSR";
    if (roll >= 70) return "SR";
    if (roll >= 40) return "R";
    return "N";
}
static const char* slot_by(int n) {
    static const char* slots[] = {"武器","護甲","戒指","項鏈","護符","鞋子","頭盔","盾牌"};
    return slots[n % 8];
}
static const char* attr_by(int n) {
    static const char* attrs[] = {"攻擊","防禦","生命","魔力","敏捷","暴擊"};
    return attrs[n % 6];
}

static void handle_simulate(const std::string& in) {
    uint64_t seed   = (uint64_t)num_field(in, "seed");
    long     ticks  = (long)num_field(in, "ticks");
    long     players= (long)num_field(in, "players");
    long     enemies= (long)num_field(in, "enemies");
    if (ticks < 1) ticks = 1; if (ticks > 100000) ticks = 100000;
    if (enemies < 0) enemies = 0; if (enemies > 1000) enemies = 1000;
    Rng rng(seed);
    long totalDamage = 0, kills = 0, tickSurvived = 0;
    // 黑盒：模擬每回合我方/敵方交戰，僅輸出聚合結果
    for (long t = 0; t < ticks; t++) {
        for (long e = 0; e < enemies; e++) {
            if (rng.unit() < 0.72) { // 命中
                int dmg = rng.range(8, 26) + (int)(rng.unit() * 12);
                totalDamage += dmg;
                if (rng.unit() < 0.38) kills++;
            }
        }
        if (rng.unit() < 0.02) break; // 遭遇失敗提前結束
        tickSurvived++;
    }
    printf("{\"totalDamage\":%ld,\"kills\":%ld,\"tickSurvived\":%ld,\"rounds\":%ld}",
           totalDamage, kills, tickSurvived, ticks);
}

static void handle_loot(const std::string& in) {
    long count = (long)num_field(in, "count");
    long tier  = (long)num_field(in, "tier");
    uint64_t seed = (uint64_t)num_field(in, "seed");
    if (count < 1) count = 1; if (count > 50) count = 50;
    if (tier < 1) tier = 1; if (tier > 10) tier = 10;
    Rng rng(seed);
    printf("[");
    for (long i = 0; i < count; i++) {
        int roll = rng.range(0, 99);
        const char* rar = rarity_by(roll + (tier >= 5 ? 4 : 0));
        const char* slot = slot_by(rng.range(0, 7));
        const char* attr = attr_by(rng.range(0, 5));
        int value = rng.range(3, 20) + tier * 4;
        printf("%s{\"slot\":\"%s\",\"rarity\":\"%s\",\"attr\":\"%s\",\"value\":%d}",
               (i ? "," : ""), slot, rar, attr, value);
    }
    printf("]");
}

int main() {
    std::string in;
    char buf[1024];
    while (std::fgets(buf, sizeof(buf), stdin)) in += buf;

    std::string action = str_field(in, "action");
    if (action == "loot") { handle_loot(in); }
    else { handle_simulate(in); }
    return 0;
}
