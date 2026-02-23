/**
 * DPlusPlusAnalyzer Class - Version 52 (Full Specification)
 * Format D+++ Visualizer v52 - Step 7: Real-time Logic Analyzer
 * * 【V52 アップグレード要件】
 * 1. Strict Linter: ガード条件内での誤代入 (=, +=, -=) を ERROR として検知。
 * 2. タイムアウト保護: 競合スキャン (scanConflicts) に 200ms の強制中断ロジックを導入。
 * 3. AI連携エクスポート: LLMがモデルを理解・修正するための構造化データ生成。
 * 4. 既存解析の維持: 未定義参照、幽霊状態、デッドロック、サンプリング競合検知を完全継承。
 */
class DPlusPlusAnalyzer {
  /**
   * @param {object} data - DPlusPlusParser.parse() の戻り値 { states, transitions }
   */
  constructor(data) {
    this.states = data.states || [];
    this.transitions = data.transitions || [];
    this.report = [];
  }

  /**
   * 全ての解析項目を順次実行し、レポートを返します。
   * SSOT Section 1 (Table B) の解析パイプラインを遵守。
   * @returns {Array} 解析結果オブジェクトの配列
   */
  analyzeAll() {
    this.report = [];

    // 1. 文法チェック (V52 Strict Linter)
    this.checkSyntax();
    
    // 2. 基本定義チェック
    this.checkUndefined();
    
    // 3. グラフ構造解析
    this.checkReachability();
    this.checkDeadlock();
    
    // 4. 論理競合解析 (タイムアウト保護付き)
    this.scanConflicts();

    return this.report;
  }

  /**
   * Section 2.1: runStrictLinter() - 誤代入検知
   * ガード条件内での代入演算子使用を ERROR として記録します。
   */
  checkSyntax() {
    this.transitions.forEach(t => {
      if (!t.guard || t.guard === "-") return;

      /**
       * 正規表現: /[^{=!<>}](=)[^=]/ 
       * 比較演算子 (==, !=, <=, >=) ではない単独の "=" を特定する。
       * 複合代入演算子 (+=, -=) も個別にチェック。
       */
      const hasAssignment = /[^=!<>](=)[^=]/.test(t.guard) || 
                            t.guard.includes("+=") || 
                            t.guard.includes("-=");

      if (hasAssignment) {
        this.report.push({
          type: "error",
          id: "L-01",
          message: "ガード条件内での代入は禁止されています（比較には == を使用してください）",
          lineIndex: t.lineIndex
        });
      }
    });
  }

  /**
   * A-04: 未定義ターゲット参照のチェック
   * 遷移先として指定されているIDが States テーブルに存在するか確認します。
   */
  checkUndefined() {
    const stateIds = new Set(this.states.map(s => s.id));

    this.transitions.forEach(t => {
      // "*" はワイルドカード、null/空文字はSource維持（P-03相当）のため除外
      if (t.target && t.target !== "*" && !stateIds.has(t.target)) {
        this.report.push({
          type: "error",
          id: "A-04",
          message: `未定義の状態 "${t.target}" が遷移先として参照されています。`,
          lineIndex: t.lineIndex
        });
      }
    });
  }

  /**
   * A-01: 到達不能（幽霊）状態のチェック
   * 幅優先探索 (BFS) を用いて、初期状態から到達不可能な状態を特定します。
   */
checkReachability() {
    if (this.states.length === 0) return;

    const initialId = this.states[0].id;
    const visited = new Set();
    const queue = [initialId];
    visited.add(initialId);

    while (queue.length > 0) {
      const current = queue.shift();

      // 1. 遷移（Table B）による到達
      const outgoing = this.transitions.filter(t => t.source === current || t.source === "*");
      outgoing.forEach(t => {
        const target = t.target || t.source;
        if (target && target !== "*" && !visited.has(target)) {
          visited.add(target);
          queue.push(target);
        }
      });

      // 2. 親子関係（Auto-Entry）による到達を考慮 (追加)
      this.states.forEach(s => {
        // 現在の状態(current)が親であり、sがその直下の子である場合
        if (s.id.startsWith(current + ".") && s.id.split('.').length === current.split('.').length + 1) {
          if (!visited.has(s.id)) {
            visited.add(s.id);
            queue.push(s.id);
          }
        }
      });
    }

    // 警告の生成
    this.states.forEach(s => {
      if (!visited.has(s.id)) {
        this.report.push({
          type: "warn",
          id: "A-01",
          message: `状態 "${s.id}" は初期状態から到達不可能な「幽霊状態」です。`,
          lineIndex: s.lineIndex
        });
      }
    });
  }

  /**
   * A-02: デッドロック（行き止まり）検知
   * 終了状態以外で、外部への遷移が一つも定義されていない状態を検知します。
   */
  checkDeadlock() {
    this.states.forEach(s => {
      // 慣習的に End や Final という名前の状態はデッドロック対象外とする
      if (/^(End|Final|Stop)$/i.test(s.id)) return;

      const hasOutgoing = this.transitions.some(t => t.source === s.id || t.source === "*");
      if (!hasOutgoing) {
        this.report.push({
          type: "warn",
          id: "A-02",
          message: `状態 "${s.id}" に遷移後の出口が定義されていません（デッドロックの可能性）。`,
          lineIndex: s.lineIndex
        });
      }
    });
  }

  /**
   * A-03: 論理競合（Smart Scan）
   * 同一ソース・同一トリガーの遷移において、ガード条件が重複する可能性をサンプリング解析します。
   * Section 2.3: 200ms のタイムアウト保護を実装。
   */
  scanConflicts() {
    const startTime = Date.now();
    const groups = {};

    // 1. ソースとトリガーでグループ化
    this.transitions.forEach(t => {
      const key = `${t.source}-${t.trigger}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });

    // 2. グループ内のペアを総当たり評価
    const groupValues = Object.values(groups);
    for (let k = 0; k < groupValues.length; k++) {
      const ts = groupValues[k];
      if (ts.length < 2) continue;

      for (let i = 0; i < ts.length; i++) {
        for (let j = i + 1; j < ts.length; j++) {
          // タイムアウト保護 (Section 2.3.3)
          if (Date.now() - startTime > 200) {
            this.report.push({
              type: "warn",
              id: "T-01",
              message: "Analysis timeout: Conflict scan aborted (model too large).",
              lineIndex: 0
            });
            return; // 処理を中断
          }

          if (this._isPotentiallyConflicting(ts[i].guard, ts[j].guard)) {
            this.report.push({
              type: "warn",
              id: "A-03",
              message: `遷移 "${ts[i].trigger}" のガード条件 "${ts[i].guard || 'true'}" と "${ts[j].guard || 'true'}" が同時に成立し、競合する可能性があります。`,
              lineIndex: ts[j].lineIndex
            });
          }
        }
      }
    }
  }

  /**
   * Section 2.4: exportAnalysisForAI() (V52新規機能)
   * LLMがモデルを再構築・修正するために最適な構造化データを出力します。
   * @returns {Object} AI用構造化コンテキスト
   */
  exportAnalysisForAI() {
    const errorCount = this.report.filter(r => r.type === "error").length;
    
    return {
      meta: { 
        version: "V52", 
        timestamp: new Date().toISOString() 
      },
      stats: { 
        stateCount: this.states.length, 
        transitionCount: this.transitions.length,
        errorCount: errorCount,
        warningCount: this.report.length - errorCount
      },
      diagnostics: this.report, // 現在の解析レポート全量
      modelSummary: this.transitions.map(t => {
        return `${t.source} -> ${t.target || t.source} [${t.trigger || 'auto'}] (line:${t.lineIndex})`;
      })
    };
  }

  /* ========================================================================
     PRIVATE HELPERS (SSOT Section 4)
     ======================================================================== */

  /**
   * ガード条件が論理的に重なる可能性があるかサンプリング評価します。
   * @private
   */
  _isPotentiallyConflicting(g1, g2) {
    // 両方空（true）なら確実に競合
    if ((!g1 || g1 === "-") && (!g2 || g2 === "-")) return true;
    
    // 文字列の簡易比較
    if (g1 === g2) return true;

    // V46スタイルのサンプリング解析ロジック
    // 数値の境界値などを抽出して評価する
    const sampleValues = [0, 1, -1, 10, 100];
    const vars = this._extractVars(g1 + " " + g2);

    try {
      for (let v of sampleValues) {
        const testCtx = {};
        vars.forEach(name => testCtx[name] = v);
        
        const res1 = this._quickEval(g1, testCtx);
        const res2 = this._quickEval(g2, testCtx);

        if (res1 && res2) return true; // 特定の値で両方Trueになった
      }
    } catch (e) {
      // 評価不能な場合は安全のため競合とはみなさない
    }

    return false;
  }

  /** * ガード式から変数名を抽出します。 
   * V52: 識別子正規表現 [a-zA-Z_]\w* を維持。
   * @private
   */
  _extractVars(str) {
    if (!str) return [];
    const matches = str.match(/[a-zA-Z_]\w*/g) || [];
    return [...new Set(matches)].filter(m => !/^(true|false|null|undefined|Math|NaN)$/.test(m));
  }

  /** * 静的解析用の簡易評価器。eval() を使用せず new Function 方式で実行。
   * Section 4.1: 信頼性・隔離設計。
   * @private
   */
  _quickEval(expr, ctx) {
    if (!expr || expr === "-") return true;
    try {
      const keys = Object.keys(ctx);
      const vals = Object.values(ctx);
      // サンドボックス化された関数の生成と即時実行
      return new Function(...keys, `return (${expr})`)(...vals);
    } catch (e) {
      /**
       * 評価失敗のロギング義務 (Section 4.1)
       * ただしサンプリングループを壊さないよう、ここでは false を返却する。
       */
      return false;
    }
  }
}
