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
#include <algorithm>
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

/* ── SM-2 間隔重複排程（閃卡複習）──
   輸入：{action:"sm2", quality:0-5, reps, intervalDays, ease, lapses}
   輸出：{intervalDays, ease, reps, lapses, dueTs(提示), status} */
static void handle_sm2(const std::string& in) {
    int quality = (int)num_field(in, "quality");
    long reps   = (long)num_field(in, "reps");
    double interval = num_field(in, "intervalDays");
    double ease = num_field(in, "ease");
    long lapses = (long)num_field(in, "lapses");
    if (ease < 1.3) ease = 2.5;
    if (quality < 0) quality = 0; if (quality > 5) quality = 5;
    if (quality < 3) {
        // 失敗：重記，間隔回到 1 天
        reps = 0; interval = 1;
        if (ease > 1.3) ease -= 0.2;
        lapses++;
    } else {
        reps++;
        if (reps == 1) interval = 1;
        else if (reps == 2) interval = 6;
        else interval = interval * ease;
        if (interval > 365) interval = 365;
        ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (ease < 1.3) ease = 1.3;
    }
    int dueDays = (int)(interval + 0.5);
    printf("{\"intervalDays\":%.1f,\"ease\":%.2f,\"reps\":%ld,\"lapses\":%ld,\"dueInDays\":%d,\"status\":\"%s\"}",
           interval, ease, reps, lapses, dueDays, (quality < 3 ? "again" : (reps <= 2 ? "learning" : "review")));
}

/* ── roguelike 個人化路線生成（每人後期不同）──
   輸入：{action:"rogue", seed, stage(章節數), level(玩家等級), flavor(風格0-2)}
   輸出：{route:[{id,type,title,choices:[{text,effect}],reward}]}
   type: battle/study/boss/event/treasure 隨機組合；seed 綁定玩家 → 同人同路線、人人不同 */
static void handle_rogue(const std::string& in) {
    uint64_t seed = (uint64_t)num_field(in, "seed");
    long stage = (long)num_field(in, "stage");
    long level = (long)num_field(in, "level");
    long flavor = (long)num_field(in, "flavor");
    if (stage < 1) stage = 1; if (stage > 50) stage = 50;
    if (level < 1) level = 1; if (level > 999) level = 999;
    if (flavor < 0) flavor = 0; if (flavor > 2) flavor = 2;
    Rng rng(seed ^ (uint64_t)(level * 2654435761ULL));
    static const char* types[] = {"battle","study","event","treasure"};
    static const char* titles[][6] = {
        {"迷霧森林","古代遺跡","星夜草原","裂谷深淵","暮色高塔","寂靜冰原"},
        {"知識迷宮","考場幻境","課本之森","錯題沼澤","公式岩洞","概念星河"},
        {"問題迴廊","記憶試煉","理解之橋","反思秘境","領悟聖殿","超越之塔"},
    };
    static const char* choices[][4] = {
        {"正面迎戰","繞道偷襲","呼叫同伴","專心冥想"},
        {"複習重點","挑戰難題","請教導師","休息恢復"},
        {"仔細觀察","大膽嘗試","記錄筆記","分享心得"},
    };
    printf("{\"route\":[");
    for (long i = 0; i < stage; i++) {
        int t = rng.range(0, 3);
        if (i % 5 == 4) t = 1; /* 每 5 關固定學習關 */
        if (i == stage - 1) t = 1; /* 尾關：學習/評量 */
        const char* ts = types[t];
        const char* title = titles[flavor][rng.range(0, 5)];
        int nch = rng.range(2, 4);
        printf("%s{\"id\":\"s%ld_%d\",\"type\":\"%s\",\"title\":\"%s\",\"choices\":[",
               (i ? "," : ""), i, rng.range(10, 99), ts, title);
        for (int c = 0; c < nch; c++) {
            const char* ch = choices[flavor][rng.range(0, 3)];
            int eff = rng.range(1, 4);
            printf("%s{\"text\":\"%s\",\"effect\":\"%d\"}", (c ? "," : ""), ch, eff);
        }
        int reward = (level + 1) * (rng.range(3, 8)) * (i + 1);
        printf("],\"reward\":%d}", reward);
    }
    printf("]}");
}

/* ── 個人化出題選擇（弱項優先，每人後期題目不同）──
   輸入：{action:"pick", seed, pool:[{id,acc,lastTs}...], count, perMissBonus}
   acc=近期答對率 0~1；越低越優先。輸出選中的 id 清單 */
static void handle_pick(const std::string& in) {
    uint64_t seed = (uint64_t)num_field(in, "seed");
    long count = (long)num_field(in, "count");
    if (count < 1) count = 1; if (count > 200) count = 200;
    // 擷取 pool 陣列中的 id/acc 配對（簡易解析）
    std::vector<std::string> ids;
    std::vector<double> accs;
    size_t p = in.find("\"pool\"");
    if (p != std::string::npos) {
        p = in.find('[', p);
        size_t depth = 0;
        size_t i = p;
        while (i < in.size()) {
            char c = in[i];
            if (c == '[') depth++;
            else if (c == ']') { depth--; if (depth == 0) break; }
            else if (c == '{') {
                std::string sub = in.substr(i, in.find('}', i) - i + 1);
                size_t q = sub.find("\"id\"");
                std::string idv;
                if (q != std::string::npos) {
                    q = sub.find(':', q);
                    q = sub.find('"', q);
                    size_t e = sub.find('"', q + 1);
                    idv = sub.substr(q + 1, e - q - 1);
                }
                double acc = num_field(sub.c_str(), "acc");
                if (!idv.empty()) { ids.push_back(idv); accs.push_back(acc); }
            }
            i++;
        }
    }
    if (ids.empty()) { printf("[]"); return; }
    Rng rng(seed);
    // 依答對率排序（弱項優先），再加少量隨機擾動 → 同人穩定、人人不同
    std::vector<size_t> order(ids.size());
    for (size_t i = 0; i < order.size(); i++) order[i] = i;
    std::sort(order.begin(), order.end(), [&](size_t a, size_t b) {
        double wa = accs[a] + rng.unit() * 0.15;
        double wb = accs[b] + rng.unit() * 0.15;
        return wa < wb;
    });
    long take = count < (long)order.size() ? count : (long)order.size();
    printf("[");
    for (long i = 0; i < take; i++) {
        printf("%s\"%s\"", (i ? "," : ""), ids[order[i]].c_str());
    }
    printf("]");
}

int main() {
    std::string in;
    char buf[1024];
    while (std::fgets(buf, sizeof(buf), stdin)) in += buf;

    std::string action = str_field(in, "action");
    if (action == "loot") { handle_loot(in); }
    else if (action == "sm2") { handle_sm2(in); }
    else if (action == "rogue") { handle_rogue(in); }
    else if (action == "pick") { handle_pick(in); }
    else { handle_simulate(in); }
    return 0;
}
