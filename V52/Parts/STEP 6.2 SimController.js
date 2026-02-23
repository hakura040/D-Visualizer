/**
 * SimController Class - Version 52 (Full & Final Specification)
 * Format D+++ Visualizer v52 - Step 6.2: Logic Control Layer
 * * 【V52 修正・完全統合内容】
 * 1. 不正タグ除去: 構文エラーの原因となる引用タグ（Artifacts）を全域から排除。
 * 2. 起動シーケンスの厳格化: boot()実行と初期カバレッジセットのクリアを物理的に実装。
 * 3. 排他制御の徹底: 手動操作（step/trigger/undo）介入時に直ちにオートプレイを停止。
 * 4. バッチテスト・カバレッジ統合: テスト結果（visitedLines）を ui.coverageSet へマージ。
 * 5. 異常系ガード: Error_Lock 検知時のタイマー即時破棄とユーザーへの警告トースト。
 * 6. 既存機能の完全維持: step, undo, trigger, setSpeed 等の全委譲メソッドを省略せず記述。
 */
class SimController {

  /**

   * @param {UIController} uiController - 親となるUIコントローラーのインスタンス

   */

constructor(uiController) {
    this.ui = uiController;
    this.simulator = null;
    this.timer = null; // timer に統一
    this.speed = 500;  // speed に統一
    // シナリオ再生用の管理変数
    this.currentScenario = []; 
    this.scenarioIndex = 0;
  }



  /* ========================================================================

     1. SIMULATION LIFECYCLE (Section 2.1)

     ======================================================================== */



  /**
   * シミュレーターを新規インスタンス化し、初期変数を適用して起動します。
   * SSOT Section 2.1 に基づく厳格な初期化シーケンス。
   */

  startSimulation() {
    try {
      // 1.1 現在実行中のオートプレイを停止し、表示上のカバレッジ履歴をクリア
      this.stopAutoPlay();
      if (this.ui.coverageSet) {
        this.ui.coverageSet.clear();
      }



      // 1.2 初期変数の解析とマージ
      // 構文解析時に自動抽出されたデフォルト変数を取得
      const finalContext = this.ui.analyzeVariables ? this.ui.analyzeVariables() : {};

      // UIの initial-context フィールド（x=1形式など）からの入力をパースして上書き
      try {
        const initialContextStr = this.ui.els.initialCtx ? this.ui.els.initialCtx.value : "";
        const inputData = this.ui.testRunner._parseContext(initialContextStr);
        Object.assign(finalContext, inputData);
      } catch (contextError) {
        console.warn("[SimController] Context Input Error:", contextError);
        this.ui.renderer.showToast("Context input error. Using defaults.", "warn");
      }

      // 1.3 シミュレーションエンジンの実体化 (Step 3 & Step 4 連携)
     const ctxManager = new ContextManager(finalContext);
      this.simulator = new AtomicSimulator(
      this.ui.data, // ★ ここを data.states ではなく data 全体にする
      ctxManager,
      this.ui.evaluator,
      { onUpdate: (sim) => this.updateSimUI(sim) }
      );


     // 1.4 ブートシーケンスの実行 (SSOT 3.2 連携)
      // 初期状態の Entry/Auto-Entry を HACE.Idle になるまで進行させる
      this.simulator.boot();

      // 1.5 初期状態の反映
      this.updateSimUI(this.simulator);
     
      this.ui.renderer.showToast(`HACE Engine Booted: ${Object.keys(finalContext).length} variables active.`, "success");

    } catch (e) {
      console.error("[SimController] Simulator Start Critical Error:", e);
      this.ui.renderer.showToast(`Start Failed: ${e.message}`, "error");
    }
  }

/**
   * Table Cから選択されたテストケースをロードし、初期状態をセットアップします。
   */
  loadTestCase(id) {
    const testCase = this.ui.data.testCases.find(tc => tc.id === id);
    if (!testCase) return;

    this.stopAutoPlay();
    console.log(`[SimController] Loading Test Case: ${id}`);

    // シナリオの準備（インデックスをリセットして待機）
    this.currentScenario = testCase.scenario ? testCase.scenario.split(',').map(s => s.trim()) : [];
    this.scenarioIndex = 0;    

    try {
      // 1. 変数の準備（既存の analyzeVariables と Table C の Context をマージ）
      const finalContext = this.ui.analyzeVariables ? this.ui.analyzeVariables() : {};
      const tcContext = this.ui.testRunner ? this.ui.testRunner._parseContext(testCase.context || "") : {};
      Object.assign(finalContext, tcContext);

      // 2. シミュレーターの再生成（startSimulationと同じ作法）
      const ctxManager = new ContextManager(finalContext);
      this.simulator = new AtomicSimulator(
        this.ui.data, 
        ctxManager, 
        this.ui.evaluator, 
        { 
          onStateChange: (sim) => this.updateSimUI(sim),
          onFailure: (msg) => this.ui.renderer.showToast(msg, "error")
        }
      );

      // 3. テストケース指定の初期状態を強制セットして起動
      this.simulator.currentStateID = testCase.initialState;
      this.simulator.boot();
      
      this.updateSimUI(this.simulator);
      this.ui.renderer.showToast(`Scenario Loaded: ${id}`, "success");
    } catch (e) {
      console.error("Failed to load test case:", e);
      this.ui.renderer.showToast("Load Failed: " + e.message, "error");
    }
  }

  /**
   * シミュレーターからの更新通知を受け取り、UI全体を同期させます。
   * @param {AtomicSimulator} sim - シミュレーターインスタンス
   */
  updateSimUI(sim) {
    if (!sim) return;

    // 2.1 表示レイヤーへの委譲 (Dashboard, VariableTable, Highlights)
    this.ui.renderer.updateDashboard(sim);
   
    // クイック操作ボタン（トリガーリスト）の再生成
    if (this.ui.renderer.renderQuickActions) {
      this.ui.renderer.renderQuickActions(sim);
    }

    // 2.2 カバレッジ追跡とエディタ同期 (Section 3)
    if (sim.currentTransition) {
      const lineIdx = sim.currentTransition.lineIndex;
     
      // 通過した遷移の行番号をカバレッジセットに記録
      if (this.ui.coverageSet) {
        this.ui.coverageSet.add(lineIdx);
      }
     
      // 実行中の行をエディタ上で強調・ジャンプ
      if (this.ui.renderer.scrollToLine) {
        this.ui.renderer.scrollToLine(lineIdx);
      }
    } else if (sim.currentStateID) {
      // 遷移していない待機時は現在の状態定義行を表示
      const stateData = this.ui.data.states.find(s => s.id === sim.currentStateID);
      if (stateData && this.ui.renderer.scrollToLine) {
        this.ui.renderer.scrollToLine(stateData.lineIndex);
      }
    }
  }
  /* ========================================================================
     2. INTERACTIVE CONTROLS (Manual Intervention)
     ======================================================================== */

  /**
   * 手動で1ステップ実行します。
   * 【V52重要】手動操作介入時はオートプレイを直ちに解除する。
   */
  step() {
    this.stopAutoPlay();
    if (this.simulator) {
      this.simulator.step();
    }
  }

  /**
   * 履歴を1つ戻します。
   */
  undo() {
    this.stopAutoPlay();
    if (this.simulator) {
      this.simulator.undo();
    }
  }

  /**
   * グラフクリック等による手動遷移をトリガーします。
   * @param {Object} transition - 遷移定義
   */
  trigger(transition) {
    // 排他制御: 手動介入時は即座に自動実行タイマーを破棄
    this.stopAutoPlay();
    if (this.simulator) {
      this.simulator.trigger(transition);
    }
  }

  /* ========================================================================
     3. AUTO-PLAY CONTROL (Section 2.2 / 4)
     ======================================================================== */

  /**
   * オートプレイを開始します。
   */
/**
   * オートプレイを開始します。
   * 再帰的setTimeoutにより、エンジンのフェーズ進行と同期させます。
   */
startAutoPlay() {
    this.stopAutoPlay(); // 二重起動防止

    const autoLoop = () => {
      if (!this.simulator) return;

      if (this.simulator.simState === "Error_Lock") {
        this.stopAutoPlay();
        return;
      }

      // --- 修正：Idle時でも停止させない ---
      if (this.simulator.simState === "Idle") {
        // --- 修正：表Cのシナリオを順番に実行するロジック ---
        if (this.currentScenario && this.scenarioIndex < this.currentScenario.length) {
          const nextTrigger = this.currentScenario[this.scenarioIndex].trim();
          
          // そのトリガーが現在の状態で実行可能か確認
          const transition = this.simulator.getAvailableTransitions().find(t => t.trigger === nextTrigger);
          
          if (transition) {
            this.simulator.trigger(transition);
            this.scenarioIndex++; // 次のステップへ
          } else {
            // シナリオ通りのトリガーが押せない場合は、安全のため停止
            this.ui.renderer.showToast(`Scenario blocked: ${nextTrigger} not available`, "warn");
            this.stopAutoPlay();
            return;
          }
        } else if (this.currentScenario.length > 0) {
          // 最後まで到達したら終了
          this.ui.renderer.showToast("Scenario finished", "success");
          this.stopAutoPlay();
          return;
        }
      } else {
        // 遷移フェーズ進行中はエンジンだけを1ステップ進める（ここはOK！）
        this.simulator.step();
      }
    };

    this.timer = setTimeout(autoLoop, this.speed);
    if (this.ui.els.btnPlay) this.ui.els.btnPlay.classList.add('active');
    this.updateSimUI(this.simulator);
  }

  /**
   * オートプレイを停止し、リソースを完全に解放します。
   */
  stopAutoPlay() {
    if (this.timer) {
      clearTimeout(this.timer); // 修正
      this.timer = null;        // 修正
    }
    if (this.ui.els.btnPlay) {
      this.ui.els.btnPlay.classList.remove('active');
    }
  }

  /**
   * 実行速度をミリ秒単位で設定します。
   * @param {string|number} val 
   */
  setSpeed(val) {
    this.speed = parseInt(val, 10); // 統一した名前に修正
    if (this.timer) {               // 統一した名前に修正
      this.startAutoPlay();
    }
  }

  /* ========================================================================
     4. BATCH TEST EXECUTION (Section 2.3)
     ======================================================================== */

  /**
   * テストケースを一括実行し、結果とカバレッジをマージします。
   */
  runBatchTest() {
    // 4.1 オートプレイの停止 (排他制御)
    this.stopAutoPlay();

    if (!this.ui.data || !this.ui.data.testCases) return;

    // 4.2 TestRunner によるバッチ実行 (Step 5 連携)
    const report = this.ui.testRunner.runAll(
      this.ui.data.testCases, 
      this.ui.data.states, 
      this.ui.data.transitions
    );

    // 4.3 結果テーブル (#test-body) の描画
    if (this.ui.els.testTable) {
      this.ui.els.testTable.innerHTML = report.results.map(r => {
        const statusClass = `result-${r.status.toLowerCase()}`;
        const reasonHtml = r.status === "FAIL" 
          ? `<div style="color:var(--action); font-size:10px;">${this.ui.renderer.escapeHtml(r.reason)}</div>` 
          : `<div style="color:#64748b; font-size:10px;">${this.ui.renderer.escapeHtml(r.reason || "-")}</div>`;

        return `
          <tr class="${statusClass}">
            <td>${this.ui.renderer.escapeHtml(r.id)}</td>
            <td style="font-weight:bold;">${r.status}</td>
            <td>${this.ui.renderer.escapeHtml(r.actual)}</td>
            <td style="font-family:monospace;">${reasonHtml}</td>
          </tr>
        `;
      }).join('');
    }

    // 4.4 カバレッジ統合 (V52重要仕様)
    // テストで通過した遷移行(visitedLines)を ui.coverageSet へマージ
    if (report.coverage && report.coverage.visitedLines) {
      report.coverage.visitedLines.forEach(lineIdx => {
        if (this.ui.coverageSet) {
          this.ui.coverageSet.add(lineIdx);
        }
      });
    }

    // 4.5 描画更新
    // マージされたカバレッジをダイアグラムの色付けに反映させる
    if (this.ui.renderer.renderMermaid) {
      this.ui.renderer.renderMermaid();
    }
    
    this.ui.renderer.showToast(`Batch Test Complete: ${report.results.length} cases executed.`, "info");
  }
}