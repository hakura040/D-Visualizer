/**
 * TestRunner Class (V52 Full Specification)
 * Format D+++ Visualizer v52 - Step 5: Batch Runner
 * * 【V52 アップグレード内容】
 * 1. シナリオベーステスト: 指定された実行手順（シナリオトリガー）に基づく決定論的テストに対応。
 * 2. 統合カバレッジ集計: 全テストケース実行後、全Simulatorの状態/遷移カバレッジをマージ。
 * 3. 階層的 整合性判定 (Fuzzy Match): 親子関係（USB ⇔ USB.Connected）を考慮した合否判定の厳密化。
 * 4. 信頼性ガード: MAX_CHAIN(50), MAX_STEPS(500), SCENARIO_LIMIT(100) による無限ループ検知。
 */
class TestRunner {
  /**
   * @param {Object} evaluator - SafeEvaluator インスタンス (Step 1)
   */
  constructor(evaluator) {
    this.evaluator = evaluator;
  }

  /**
   * Section 2.1: 全テストケースを実行し、結果とマージされたカバレッジを返します。
   * @param {Array} testCases - パース済みのテストケースリスト
   * @param {Array} states - 状態定義
   * @param {Array} transitions - 遷移定義
   * @returns {Object} { results, totalCoverage }
   */
  runAll(testCases, states, transitions) {
    console.log(`[TestRunner] Starting V52 Batch Runner for ${testCases.length} cases.`);
    
    const results = [];
    // 全ケース統合用のカバレッジコンテナを初期化
    const totalCoverage = {
      visitedStates: new Set(),    // ユニークな訪問状態ID
      firedTransitions: new Set()  // ユニークな実行遷移キー (src->tgt:trig)
    };

    if (!testCases || testCases.length === 0) {
      return { results: [], totalCoverage };
    }

    // 各テストケースを順次実行
    testCases.forEach(tc => {
      // 単一ケースの実行
      const caseResult = this._runSingleCase(tc, states, transitions);
      results.push(caseResult);

      // ケース実行後に使用された Simulator インスタンスからカバレッジを抽出してマージ
      if (caseResult._coverage) {
        // visitedStates のマージ
        caseResult._coverage.visitedStates.forEach(s => totalCoverage.visitedStates.add(s));
        // firedTransitions のマージ
        caseResult._coverage.firedTransitions.forEach(t => totalCoverage.firedTransitions.add(t));
        // 内部用の一時データを削除
        delete caseResult._coverage;
      }
    });

    return { results, totalCoverage };
  }

  /**
   * Section 2.2: 単一テストケースの実行エンジン（シナリオ vs オートチェーン）
   * @private
   */
  _runSingleCase(testCase, states, transitions) {
    // 信頼性設計: 物理定数の定義
    const MAX_CHAIN = 50;      // autoトリガー連鎖上限
    const MAX_STEPS = 500;      // 1遷移内のステップ上限
    const SCENARIO_LIMIT = 100; // 投入シナリオ数上限

    try {
      // 1. Setup: 初期化とBoot
      const initialCtx = this._parseContext(testCase.context);
      const ctxManager = new ContextManager(initialCtx); // Step 3 連携
      const simulator = new AtomicSimulator(
        { states, transitions }, 
        ctxManager, 
        this.evaluator, 
        { onUpdate: () => {} }
      );
      // シミュレーターを初期状態に設定し、Boot（Auto-Entry chain）を実行
      simulator.currentStateID = testCase.initialState;
      simulator.boot(); // 初期状態の不変条件チェックと自動突入

      // 2. 実行フェーズの分岐（シナリオの有無）
      const hasScenario = testCase.scenario && testCase.scenario.length > 0;

      if (hasScenario) {
        /**
         * モードA: シナリオベーステスト (V52新規)
         * 指定されたトリガー配列を順次 simulator.trigger() に投入します。
         */
        const scenario = [...testCase.scenario].slice(0, SCENARIO_LIMIT); // 上限ガード
        
        for (const trigName of scenario) {
          // 現在の状態とトリガー名に合致する遷移を検索（優先度ソート済みを前提）
// 遷移検索条件を「厳密一致」から「階層一致」に変更
const t = transitions.find(trans => {
  const src = trans.source;
  const cur = simulator.currentStateID;
  
  // 階層一致の判定プロトコル
  const isSourceMatch = (src === "*" || src === cur || cur.startsWith(src + "."));
  
  return isSourceMatch &&
         trans.trigger === trigName &&
         (!trans.guard || trans.guard === "-" || this.evaluator.evaluateRHS(trans.guard, ctxManager.getSnapshot()));
});

          if (t) {
            simulator.trigger(t);
            // 遷移が安定（Idle）するまでステップ実行
            let steps = 0;
            while (simulator.simState !== "Idle" && simulator.simState !== "Error_Lock") {
              simulator.step();
              if (++steps > MAX_STEPS) throw new Error(`Simulator Infinite loop at trigger "${trigName}"`);
            }
          }
          if (simulator.simState === "Error_Lock") break;
        }
      } else {
        /**
         * モードB: オートチェーンテスト (V51互換)
         * 最初の有効な遷移を発火させた後、auto遷移が尽きるまで連鎖させます。
         */
        let currentTrigger = transitions.find(t => 
          (t.source === simulator.currentStateID || t.source === "*") && 
          t.trigger !== "auto" && // 最初は明示的または暗黙のトリガー
          (!t.guard || t.guard === "-" || this.evaluator.evaluateRHS(t.guard, ctxManager.getSnapshot()))
        );

        if (!currentTrigger && (!testCase.scenario || testCase.scenario.length === 0)) {
          // 遷移も見つからず、シナリオも空の場合は SKIP 判定
          return { id: testCase.id, status: "SKIP", actual: simulator.currentStateID, reason: "No valid initial transition found." };
        }

        let chainCount = 0;
        while (currentTrigger) {
          simulator.trigger(currentTrigger);
          let steps = 0;
          while (simulator.simState !== "Idle" && simulator.simState !== "Error_Lock") {
            simulator.step();
            if (++steps > MAX_STEPS) throw new Error("Simulator Infinite loop in auto-chain");
          }

          if (simulator.simState === "Error_Lock") break;
          if (++chainCount > MAX_CHAIN) throw new Error("Infinite auto-trigger loop detected");

          // 次の "auto" 遷移を検索
          currentTrigger = transitions.find(t => 
            (t.source === simulator.currentStateID || t.source === "*") &&
            t.trigger === "auto" &&
            (!t.guard || t.guard === "-" || this.evaluator.evaluateRHS(t.guard, ctxManager.getSnapshot()))
          );
        }
      }

      // 3. Verdict: 階層的整合性判定 (Fuzzy Match)
      const actual = simulator.currentStateID;
      const expected = testCase.expectedTarget;

      /**
       * Fuzzy Match 論理実装 (Section 2.2.4)
       * a) 完全一致
       * b) 親状態指定による子孫マッチ: 期待が "USB" で実際が "USB.Connected" 等
       * c) 子状態指定による親マッチ: 期待が "USB.Connected" で実際が "USB" 等 (抽象化の許容)
       */
      const isMatch = (actual === expected) || 
                      (actual && actual.startsWith(expected + ".")) || 
                      (expected && expected.startsWith(actual + "."));

      const isSuccess = (simulator.simState === "Idle") && isMatch;

      return {
        id: testCase.id,
        status: isSuccess ? "PASS" : "FAIL",
        actual: actual,
        reason: simulator.lastError || (isSuccess ? "" : `Match failed: Expected ${expected}, got ${actual}`),
        // 集計用にカバレッジデータを一時保持
        _coverage: {
          visitedStates: simulator.coverage.visitedStates,
          firedTransitions: simulator.coverage.firedTransitions
        }
      };

    } catch (e) {
      console.error(`[TestRunner] Critical Error in Case ${testCase.id}:`, e);
      return { id: testCase.id, status: "FAIL", actual: "ERROR", reason: e.message };
    }
  }

  /**
   * コンテキスト文字列（JSON または key=val 形式）をオブジェクトに変換します。
   * @private
   */
  _parseContext(ctxStr) {
    if (!ctxStr || ctxStr === "-" || ctxStr === "{}") return {};
    const trimmed = ctxStr.trim();

    // JSON 形式の試行
    if (trimmed.startsWith('{')) {
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        console.warn("[TestRunner] Context JSON parse failed, falling back to comma-separated format.");
      }
    }

    // カンマ区切り形式のパース (key=val, key=val)
    const obj = {};
    trimmed.split(',').forEach(pair => {
      const parts = pair.split('=');
      if (parts.length >= 2) {
        const k = parts[0].trim();
        const v = parts.slice(1).join('=').trim();
        if (k) {
          if (v === 'true') obj[k] = true;
          else if (v === 'false') obj[k] = false;
          else if (!isNaN(v) && v !== "") obj[k] = Number(v);
          else obj[k] = v.replace(/^["']|["']$/g, '');
        }
      }
    });
    return obj;
  }
}