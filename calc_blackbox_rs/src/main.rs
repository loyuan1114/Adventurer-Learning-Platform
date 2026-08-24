/*
 * calc_blackbox — ADV9 計算黑盒（Rust 重寫版）
 * Copyright (C) 2026 loyuan1114
 * Licensed under the GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later).
 * ---------------------------------------------------------------------------
 * 用途：修練場的戰鬥模擬與掉落生成。計算邏輯封裝在編譯後的可執行檔內，
 *       對外只回傳結果 JSON，不揭露模擬內部細節（黑盒）。
 * 輸入：stdin 讀入 JSON
 * 輸出：stdout 輸出 JSON 結果。
 * 編譯：cargo build --release
 * ---------------------------------------------------------------------------
 */
use serde_json::{json, Value};
use std::io::{self, Read};

/* ── xorshift64* 偽隨機數生成器 ── */
struct Rng {
    s: u64,
}

impl Rng {
    fn new(seed: u64) -> Self {
        Rng {
            s: if seed == 0 {
                0x9E3779B97F4A7C15
            } else {
                seed
            },
        }
    }

    fn next(&mut self) -> u64 {
        self.s ^= self.s >> 12;
        self.s ^= self.s << 25;
        self.s ^= self.s >> 27;
        self.s.wrapping_mul(0x2545F4914F6CDD1D)
    }

    fn unit(&mut self) -> f64 {
        (self.next() >> 11) as f64 / (1u64 << 53) as f64
    }

    fn range(&mut self, lo: i64, hi: i64) -> i64 {
        if hi <= lo {
            return lo;
        }
        lo + (self.unit() * (hi - lo + 1) as f64) as i64
    }
}

/* ── 掉落稀有度 ── */
fn rarity_by(roll: i64) -> &'static str {
    if roll >= 97 {
        "UR"
    } else if roll >= 88 {
        "SSR"
    } else if roll >= 70 {
        "SR"
    } else if roll >= 40 {
        "R"
    } else {
        "N"
    }
}

fn slot_by(n: i64) -> &'static str {
    const SLOTS: [&str; 8] = ["武器", "護甲", "戒指", "項鏈", "護符", "鞋子", "頭盔", "盾牌"];
    SLOTS[(n % 8) as usize]
}

fn attr_by(n: i64) -> &'static str {
    const ATTRS: [&str; 6] = ["攻擊", "防禦", "生命", "魔力", "敏捷", "暴擊"];
    ATTRS[(n % 6) as usize]
}

/* ── 戰鬥模擬 ── */
fn handle_simulate(input: &Value) -> Value {
    let seed = input["seed"].as_u64().unwrap_or(1);
    let ticks = input["ticks"].as_i64().unwrap_or(1).clamp(1, 100000);
    let enemies = input["enemies"].as_i64().unwrap_or(0).clamp(0, 1000);

    let mut rng = Rng::new(seed);
    let mut total_damage: i64 = 0;
    let mut kills: i64 = 0;
    let mut tick_survived: i64 = 0;

    for _t in 0..ticks {
        for _e in 0..enemies {
            if rng.unit() < 0.72 {
                let dmg = rng.range(8, 26) + (rng.unit() * 12.0) as i64;
                total_damage += dmg;
                if rng.unit() < 0.38 {
                    kills += 1;
                }
            }
        }
        if rng.unit() < 0.02 {
            break;
        }
        tick_survived += 1;
    }

    json!({
        "totalDamage": total_damage,
        "kills": kills,
        "tickSurvived": tick_survived,
        "rounds": ticks
    })
}

/* ── 掉落生成 ── */
fn handle_loot(input: &Value) -> Value {
    let count = input["count"].as_i64().unwrap_or(1).clamp(1, 50);
    let tier = input["tier"].as_i64().unwrap_or(1).clamp(1, 10);
    let seed = input["seed"].as_u64().unwrap_or(1);

    let mut rng = Rng::new(seed);
    let mut items = Vec::with_capacity(count as usize);

    for _i in 0..count {
        let roll = rng.range(0, 99);
        let rar = rarity_by(roll + if tier >= 5 { 4 } else { 0 });
        let slot = slot_by(rng.range(0, 7));
        let attr = attr_by(rng.range(0, 5));
        let value = rng.range(3, 20) + tier * 4;

        items.push(json!({
            "slot": slot,
            "rarity": rar,
            "attr": attr,
            "value": value
        }));
    }

    Value::Array(items)
}

/* ── SM-2 間隔重複排程 ── */
fn handle_sm2(input: &Value) -> Value {
    let quality = input["quality"].as_i64().unwrap_or(0).clamp(0, 5) as i64;
    let mut reps = input["reps"].as_i64().unwrap_or(0);
    let mut interval = input["intervalDays"].as_f64().unwrap_or(1.0);
    let mut ease = input["ease"].as_f64().unwrap_or(2.5);
    let mut lapses = input["lapses"].as_i64().unwrap_or(0);

    if ease < 1.3 {
        ease = 2.5;
    }

    let status = if quality < 3 {
        reps = 0;
        interval = 1.0;
        if ease > 1.3 {
            ease -= 0.2;
        }
        lapses += 1;
        "again"
    } else {
        reps += 1;
        if reps == 1 {
            interval = 1.0;
        } else if reps == 2 {
            interval = 6.0;
        } else {
            interval *= ease;
        }
        if interval > 365.0 {
            interval = 365.0;
        }
        ease += 0.1 - (5 - quality) as f64 * (0.08 + (5 - quality) as f64 * 0.02);
        if ease < 1.3 {
            ease = 1.3;
        }
        if reps <= 2 {
            "learning"
        } else {
            "review"
        }
    };

    let due_days = (interval + 0.5) as i64;

    json!({
        "intervalDays": (interval * 10.0).round() / 10.0,
        "ease": (ease * 100.0).round() / 100.0,
        "reps": reps,
        "lapses": lapses,
        "dueInDays": due_days,
        "status": status
    })
}

/* ── Roguelike 路線生成 ── */
fn handle_rogue(input: &Value) -> Value {
    let seed = input["seed"].as_u64().unwrap_or(1);
    let stage = input["stage"].as_i64().unwrap_or(1).clamp(1, 50);
    let level = input["level"].as_i64().unwrap_or(1).clamp(1, 999);
    let flavor = input["flavor"].as_i64().unwrap_or(0).clamp(0, 2) as usize;

    let mut rng = Rng::new(seed.wrapping_mul(level as u64 * 2654435761));

    const TYPES: [&str; 4] = ["battle", "study", "event", "treasure"];
    const TITLES: [[&str; 6]; 3] = [
        ["迷霧森林", "古代遺跡", "星夜草原", "裂谷深淵", "暮色高塔", "寂靜冰原"],
        ["知識迷宮", "考場幻境", "課本之森", "錯題沼澤", "公式岩洞", "概念星河"],
        ["問題迴廊", "記憶試煉", "理解之橋", "反思秘境", "領悟聖殿", "超越之塔"],
    ];
    const CHOICES: [[&str; 4]; 3] = [
        ["正面迎戰", "繞道偷襲", "呼叫同伴", "專心冥想"],
        ["複習重點", "挑戰難題", "請教導師", "休息恢復"],
        ["仔細觀察", "大膽嘗試", "記錄筆記", "分享心得"],
    ];

    let mut route = Vec::with_capacity(stage as usize);

    for i in 0..stage {
        let mut t = rng.range(0, 3) as usize;
        if i % 5 == 4 {
            t = 1;
        }
        if i == stage - 1 {
            t = 1;
        }

        let title_idx = rng.range(0, 5) as usize;
        let nch = rng.range(2, 4);

        let mut choices = Vec::with_capacity(nch as usize);
        for _c in 0..nch {
            let ch_idx = rng.range(0, 3) as usize;
            let eff = rng.range(1, 4);
            choices.push(json!({
                "text": CHOICES[flavor][ch_idx],
                "effect": eff.to_string()
            }));
        }

        let reward = (level + 1) * rng.range(3, 8) * (i + 1);

        route.push(json!({
            "id": format!("s{}_{}", i, rng.range(10, 99)),
            "type": TYPES[t],
            "title": TITLES[flavor][title_idx],
            "choices": choices,
            "reward": reward
        }));
    }

    json!({ "route": route })
}

/* ── 個人化出題選擇（弱項優先）── */
fn handle_pick(input: &Value) -> Value {
    let seed = input["seed"].as_u64().unwrap_or(1);
    let count = input["count"].as_i64().unwrap_or(1).clamp(1, 200);
    let pool = input["pool"].as_array().cloned().unwrap_or_default();

    if pool.is_empty() {
        return json!([]);
    }

    let mut rng = Rng::new(seed);

    let mut items: Vec<(String, f64)> = pool
        .iter()
        .filter_map(|item| {
            let id = item["id"].as_str()?.to_string();
            let acc = item["acc"].as_f64().unwrap_or(0.0);
            Some((id, acc + rng.unit() * 0.15))
        })
        .collect();

    items.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal));

    let take = (count as usize).min(items.len());
    let result: Vec<&str> = items[..take].iter().map(|(id, _)| id.as_str()).collect();

    serde_json::to_value(&result).unwrap_or(json!([]))
}

fn main() {
    let mut input_str = String::new();
    io::stdin().read_to_string(&mut input_str).unwrap_or(0);

    let input: Value = serde_json::from_str(&input_str).unwrap_or(json!({}));

    let action = input["action"].as_str().unwrap_or("simulate");

    let output = match action {
        "loot" => handle_loot(&input),
        "sm2" => handle_sm2(&input),
        "rogue" => handle_rogue(&input),
        "pick" => handle_pick(&input),
        _ => handle_simulate(&input),
    };

    print!("{}", output);
}
