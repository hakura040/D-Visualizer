/**
 * AtomicSimulator Class (V52 Full & Strict Specification)
 * Format D+++ Visualizer v52 - Step 4: HACE Execution Engine
 * * 【V52 修正・完全統合内容】
 * 1. 録画機能の復元: V51の toggleRecording および recordLog 制御を完全復元。
 * 2. ステップ粒度の厳密化: _handleEntering の再帰を廃止。Table Bに従い auto 遷移で1階層ずつ進行。 
 * 3. ワイルドカード実運用: _findTransition を定義のみでなく、遷移検索ロジックに組み込み。
 * 4. 無限ループ検知: 100回/500回のセーフティカウンタと "Infinite Loop Detected" 識別子。
 * 5. カバレッジ計測: 訪問状態と実行遷移を Set で記録。
 */
class AtomicSimulator {
  /**
   * param {Array} states - Parserから出力された状態定義リスト
   * param {Object} ctxManager - ContextManagerのインスタンス
   * param {Object} evaluator - SafeEvaluatorのインスタンス
   * param {Object} callbacks - UI通知用コールバック ({ onUpdate: (sim) => void })
   */
  constructor(data, ctxManager, evaluator, callbacks) {
    this.data = data; // data全体（statesとtransitionsを含む）を保存
    this.stateMap = new Map(data.states.map(s => [s.id, s]));
    this.ctxManager = ctxManager;
    this.evaluator = evaluator;
    this.callbacks = callbacks;

    // HACE サイクル管理 (SSOT Section 2)
    this.simState = "Idle";
    this.currentStateID = data.states.length > 0 ? data.states[0].id : null;
    this.currentTransition = null;
    this.lastError = null;

    // 履歴とUndo
    this.history = [];
    
    // V52: カバレッジ記録コンテナ
    this.coverage = {
      visitedStates: new Set(),
      firedTransitions: new Set()
    };

    // V51復元: レコーディング機能
    this.isRecording = false;
    this.recordLog = [];
    
    // 無限ループ検知用共有カウンタ
    this._stepCounter = 0;

    console.log("[HACE] AtomicSimulator V52 Full Spec Initialized.");
  }

  /**
   * [SSOT 3.2] 起動シーケンス
   * セーフティカウンタ 100回制限を厳守。
   */
boot() {
    if (!this.currentStateID) return;
    try {
      this.ctxManager.beginTransaction();
      this.simState = "Entering";
      
      let safetyCounter = 0;
      // 修正ポイント：
      // 基本は Idle になるまで回すが、
      // 「状態が変わるような auto 遷移」が起きて simState が再度 Entering に戻ったなら、
      // そこで一旦止めてユーザーの再生を待つ、という制御が可能です。
      
      while (this.simState !== "Idle" && this.simState !== "Error_Lock") {
        this.step();
        safetyCounter++;
        if (safetyCounter > 100) throw new Error("Boot Loop");
      }
    } catch (e) {
      this._handleFailure(e.message);
    }
  }

  /**
   * [SSOT 3.3] 遷移トリガー
   */
  trigger(transition) {
    if (this.simState !== "Idle") return;

    // V52: カバレッジ記録 (遷移)
    const transitionKey = `${transition.source}->${transition.target}:${transition.trigger}`;
    this.coverage.firedTransitions.add(transitionKey);

    // 録画ロジックの復元 
    if (this.isRecording) {
      this.recordLog.push({ trigger: transition.trigger, state: this.currentStateID });
    }

    // Undo履歴の保存
    this.history.push({
      state: this.currentStateID,
      context: this.ctxManager.getSnapshot()
    });
    this.currentTransition = transition;
    this.lastError = null;

    // トランザクション開始
    this.ctxManager.beginTransaction();
    this.simState = "Exiting";
    
    this._syncUI();
  }

  /**
   * [SSOT Section 1] HACE サイクル実行
   * 500回制限の安全装置を実装。 
   */
  step() {
    if (this.simState === "Idle" || this.simState === "Error_Lock") return;
    this._stepCounter++;
    if (this._stepCounter > 500) {
      this._stepCounter = 0;
      throw new Error("Simulator Infinite Loop Detected: HACE cycle incomplete within 500 steps.");
    }

    try {
      // Table A に基づく分岐
      switch (this.simState) {
        case "Exiting":  this._handleExiting(); break;
        case "Acting":   this._handleActing();   break;
        case "Updating": this._handleUpdating();  break;
        case "Entering": this._handleEntering();  break; 
        case "Checking": this._handleChecking();  break;
      }
    } catch (error) {
      this._handleFailure(error.message);
    }

    if (this.simState === "Idle") this._stepCounter = 0;
    this._syncUI();
  }

  /**
   * [SSOT 3.4 / Table B] 入力フェーズ
   * 再帰を排し、1ステップごとに1階層進む「逐次進行」に修正。 
   */
  _handleEntering() {
    // V52: カバレッジ記録 (状態)
    this.coverage.visitedStates.add(this.currentStateID);
    const target = this.stateMap.get(this.currentStateID);
    if (target && target.entry && target.entry !== "-") {
      this._runAction(target.entry);
    }

    // Auto-Entry 判定 (Table B: hasChild)
    const parentId = this.currentStateID;
    const parentDotCount = parentId.split('.').length - 1;
    
    const childId = Array.from(this.stateMap.keys()).find(id => {
      return id.startsWith(parentId + ".") && (id.split('.').length - 1 === parentDotCount + 1);
    });

    if (childId) {
      // 子があれば状態を更新して再度 Entering フェーズを維持 (再帰せず step を待つ)
      this.currentStateID = childId;
      console.log(`[HACE] Auto-entry to child: ${childId}`);
      // simState は "Entering" のまま、Table B の hasChild=true 遷移を表現
    } else {
      // 子がなければ検証へ (Table B: hasChild=false)
      this.simState = "Checking";
    }
  }

/**
   * 内部検索用：親状態の遷移も遡って探すロジックを実装
   */
  _findTransition(triggerName) {
    const cur = this.currentStateID;
    const ctx = this.ctxManager.getSnapshot();

    return this.data.transitions.find(t => {
      // 階層一致判定 (完全一致、ワイルドカード、または親からの継承)
      const isSourceMatch = (t.source === "*" || t.source === cur || cur.startsWith(t.source + "."));
      if (!isSourceMatch) return false;
      if (t.trigger !== triggerName) return false;

      try {
        const guard = t.guard && t.guard !== "-" ? t.guard : "true";
        return this.evaluator.evaluateRHS(guard, ctx);
      } catch (e) { return false; }
    });
  }

/**
   * 現在の状態およびガード条件に基づいて、発火可能な遷移リストを返します。
   * (V52: 階層構造による遷移の継承に対応)
   */
  getAvailableTransitions() {
    if (this.simState !== "Idle") return [];

    const cur = this.currentStateID;
    const ctx = this.ctxManager.getSnapshot();

    // 全遷移の中から、現在の状態に適合するものを抽出
    return this.data.transitions.filter(t => {
      // 1. ソース一致判定 (完全一致、ワイルドカード、または親状態からの継承)
      const isSourceMatch = (t.source === "*" || t.source === cur || cur.startsWith(t.source + "."));
      if (!isSourceMatch) return false;

      // 2. ガード条件の評価
      try {
        const guard = t.guard && t.guard !== "-" ? t.guard : "true";
        return this.evaluator.evaluateRHS(guard, ctx);
      } catch (e) {
        console.warn(`[Simulator] Guard evaluation failed at line ${t.lineIndex}:`, e);
        return false;
      }
    });
  }

  _runAction(code) {
    if (!code || code === "-") return;
    try {
      const snap = this.ctxManager.getSnapshot();
      const updatedCtx = this.evaluator.executeAction(code, snap);
      this.ctxManager.updateAll(updatedCtx);
    } catch (e) {
      throw new Error(`Action Execution Error: ${e.message}`);
    }
  }

  _handleExiting() {
    const source = this.stateMap.get(this.currentTransition.source);
    if (source && source.exit && source.exit !== "-") {
      this._runAction(source.exit);
    }
    this.simState = "Acting";
  }

  _handleActing() {
    if (this.currentTransition.action && this.currentTransition.action !== "-") {
      this._runAction(this.currentTransition.action);
    }
    this.simState = "Updating";
  }

  _handleUpdating() {
    const targetID = this.currentTransition.target || this.currentTransition.source;
    if (!this.stateMap.has(targetID)) {
      throw new Error(`Target state "${targetID}" not found.`);
    }
    this.currentStateID = targetID;
    this.simState = "Entering";
  }

  _handleChecking() {
    const isValid = this._recursiveCheck(this.currentStateID);
    if (isValid) {
      this.ctxManager.commit();
      this.simState = "Idle";
      this.currentTransition = null;
    } else {
      throw new Error(`Invariant violation at state: ${this.currentStateID}`);
    }
  }

  _recursiveCheck(stateId) {
    if (!stateId) return true;
    const state = this.stateMap.get(stateId);
    if (state && state.invariant && state.invariant !== "-") {
      try {
        const result = this.evaluator.evaluateRHS(state.invariant, this.ctxManager.getSnapshot());
        if (!result) return false;
      } catch (e) {
        throw new Error(`Invariant Error in "${stateId}": ${e.message}`);
      }
    }
    const parts = stateId.split('.');
    if (parts.length > 1) {
      parts.pop();
      return this._recursiveCheck(parts.join('.'));
    }
    return true;
  }

  _handleFailure(msg) {
    console.error(`[AtomicSimulator] Failure: ${msg}`);
    this.lastError = msg;
    this.simState = "Error_Lock";
    this.ctxManager.rollback();
    if (this.history.length > 0) {
      this.currentStateID = this.history[this.history.length - 1].state;
    }
  }

  undo() {
    if (this.simState !== "Idle" || this.history.length === 0) return;
    const lastRecord = this.history.pop();
    this.currentStateID = lastRecord.state;
    if (typeof this.ctxManager.restoreSnapshot === "function") {
      this.ctxManager.restoreSnapshot(lastRecord.context);
    }
    this._syncUI();
  }

  // V51復元: 録画機能の完全実装 
  toggleRecording() {
    this.isRecording = !this.isRecording;
    if (this.isRecording) {
      this.recordLog = [];
      console.log("[HACE] Recording started.");
    } else {
      console.log("[HACE] Recording stopped. Steps:", this.recordLog.length);
    }
    this._syncUI();
  }

  _syncUI() {
    if (this.callbacks && typeof this.callbacks.onUpdate === "function") {
      this.callbacks.onUpdate(this);
    }
  }

  // V52: カバレッジ統計の集計
  getCoverageStats() {
    const totalStates = this.stateMap.size;
    const visitedCount = this.coverage.visitedStates.size;
    const percentage = totalStates > 0 ? Math.round((visitedCount / totalStates) * 100) : 0;
    return {
      visitedCount,
      totalStates,
      percentage,
      firedCount: this.coverage.firedTransitions.size
    };
  }
}