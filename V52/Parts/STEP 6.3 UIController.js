/**
 * UIController Class (Main Orchestrator)
 * Format D+++ Visualizer v52 - Step 6.3: Main Integration
 * * 【V52 修正・完全実装内容】
 * 1. 初期化順序の修正: this.data を最優先で初期化し、Analyzer に参照を渡すことで実行時エラーを防止。
 * 2. 不正タグ除去: 構文エラーの原因となる引用タグ（Artifacts）を全域から排除。
 * 3. 二重起動バグ修正: クラス外部の重複した初期化コードを削除。
 * 4. Step 7 Analyzer 統合: 構文解析直後に静的解析を実行し、不備を即座にレポート。
 * 5. 破壊的操作保護: ファイルインポート等のデータ上書き時にユーザー承認（Confirm）を強制。
 * 6. セッション管理: localStorage からの復旧と、新規セッション時のデフォルトテンプレート展開。
 * 7. 冗長な変数解析: 演算子や比較式から変数の型（数値/真偽値）を精密に抽出。
 */
class UIController {
  constructor() {
    // 1. システム状態管理プロパティ (SSOT Section 3) - 最優先で初期化
    this.data = { states: [], transitions: [], testCases: [] };
    this.varMeta = {};        // 変数型情報のキャッシュ
    this.varConfigs = {};     // スライダー設定 (min/max/step)
    this.coverageSet = new Set(); // 通過した行番号 (lineIndex) の集約
    this.zoom = 1.0;
    this.layout = 'TD';
    this.debounceTimer = null;

    // 2. 依存ロジックエンジンのインスタンス化 (SSOT 準拠)
    this.evaluator = new SafeEvaluator();      // Step 1
    this.parser = new DPlusPlusParser();        // Step 2
    this.testRunner = new TestRunner(this.evaluator); // Step 5
    this.analyzer = new DPlusPlusAnalyzer(this.data); // Step 7 (V52 新規統合 / 引数にthis.dataを渡す)
    
    // 3. DOM要素キャッシュの取得 (全サブクラス共有)
    this.els = this._cacheElements();

    // 4. サブコントローラーの初期化
    this.renderer = new UIRenderer(this);    // Step 6.1
    this.simCtrl = new SimController(this);  // Step 6.2

    // グローバル公開 (HTML内イベントハンドラからのアクセス用)
    window.ui = this;
    console.log("UIController V52: Orchestrator instance created with correct initialization order.");
  }

  /**
   * システムで使用する全ての DOM 要素をキャッシュします。
   * Optional Chaining 用に、存在しない場合も構造を維持します。
   * @private
   */
  _cacheElements() {
    return {
      editor: document.getElementById('editor'),
      gutter: document.getElementById('gutter'),
      mermaidDiv: document.getElementById('diagram'),
      varTable: document.getElementById('var-body'),
      testTable: document.getElementById('test-body'),
      tabs: document.querySelectorAll('.tab-btn'),
      panes: document.querySelectorAll('.tab-pane'),
      initialCtx: document.getElementById('initial-context'),
      analysisPanel: document.getElementById('analysis-panel'),
      analysisList: document.getElementById('analysis-list'),
      toast: document.getElementById('toast'),
      modal: document.getElementById('code-modal'),
      cppOutput: document.getElementById('cpp-output'),
      simStatus: document.getElementById('sim-status'),
      dashboardState: document.getElementById('dashboard-state'),
      dashboardStep: document.getElementById('dashboard-step'),
      dashboardCoverage: document.getElementById('dashboard-coverage'),
      coverageProgress: document.getElementById('coverage-progress-fill'),
      quickActions: document.getElementById('trigger-panel'),
      btnPlay: document.getElementById('btn-play'),
      btnPause: document.getElementById('btn-pause'),
      speedRange: document.getElementById('speed-range'),
      btnAiExport: document.getElementById('btn-ai-export')
    };
  }

  /**
   * アプリケーションの初期化とイベントリスナーの登録を行います。
   * SSOT Section 2.1 / 3.1 遵守。
   */
  init() {
    console.log("UIController V52: Initializing System...");

    // 1. セッション復旧または新規セッション生成
    const savedData = localStorage.getItem('dplus_model_v52');
    if (savedData && this.els.editor) {
      this.els.editor.value = savedData;
    } else if (this.els.editor) {
      // 新規セッション用のデフォルトテンプレート (Section 3.1.1)
      this.els.editor.value = `// Format D+++ V52 New Session\n\nTable A: States\n| ID | Entry | Exit | Invariant |\n|:---|:---|:---|:---|\n| Idle | - | - | - |\n\nTable B: Transitions\n| Priority | Source | Trigger | Guard | Action | Target |\n|:---|:---|:---|:---|:---|:---|\n\nTable C: Test Cases\n| ID | Initial | Scenario | Context | Expected |\n|:---|:---|:---|:---|:---|\n`;
    }

    // 2. エディタ監視 (Debounce 500ms)
    this.els.editor?.addEventListener('input', () => {
      this.onEditorInput();
      // 永続化プロトコル: 入力ごとに localStorage へ保存 (Section 3.1.4)
      localStorage.setItem('dplus_model_v52', this.els.editor.value);
    });

    // 3. エディタとガターのスクロール同期
    this.els.editor?.addEventListener('scroll', () => {
      if (this.els.gutter && this.els.editor) {
        this.els.gutter.scrollTop = this.els.editor.scrollTop;
      }
    });

    // 4. シミュレーション制御ボタンの配線
    document.getElementById('btn-start')?.addEventListener('click', () => this.simCtrl.startSimulation());
    document.getElementById('btn-step')?.addEventListener('click', () => this.simCtrl.step());
    document.getElementById('btn-sim-undo')?.addEventListener('click', () => this.simCtrl.undo());
    this.els.btnPlay?.addEventListener('click', () => this.simCtrl.startAutoPlay());
    this.els.btnPause?.addEventListener('click', () => this.simCtrl.stopAutoPlay());
    this.els.speedRange?.addEventListener('input', (e) => this.simCtrl.setSpeed(e.target.value));

    // 5. テスト実行ボタンの配線 (Section 2.1.4)
    document.getElementById('btn-run-test')?.addEventListener('click', () => {
      this.renderer.showToast("Batch Runner starting...", "info");
      setTimeout(() => this.simCtrl.runBatchTest(), 50);
    });

    // 6. 表示・レイアウト制御の配線
    document.getElementById('btn-layout-td')?.addEventListener('click', () => { this.layout = 'TD'; this._parseAndRender(); });
    document.getElementById('btn-layout-lr')?.addEventListener('click', () => { this.layout = 'LR'; this._parseAndRender(); });
    document.getElementById('btn-zoom-in')?.addEventListener('click', () => { this.zoom += 0.1; this.renderer.applyZoom(); });
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => { this.zoom = Math.max(0.1, this.zoom - 0.1); this.renderer.applyZoom(); });
    document.getElementById('btn-zoom-reset')?.addEventListener('click', () => { this.zoom = 1.0; this.renderer.applyZoom(); });

    // 7. エクスポート・モーダル関連
    document.getElementById('btn-gen-cpp')?.addEventListener('click', () => {
      const exporter = new DPlusPlusExporter(this);
      exporter.showCodeModal('cpp');
    });
    this.els.btnAiExport?.addEventListener('click', () => {
      const exporter = new DPlusPlusExporter(this);
      exporter.exportAIContext();
    });
    document.getElementById('btn-download')?.addEventListener('click', () => {
      const exporter = new DPlusPlusExporter(this);
      exporter.exportSvg();
    });
    document.getElementById('btn-close-modal')?.addEventListener('click', () => {
      if (this.els.modal) this.els.modal.style.display = 'none';
    });
    document.getElementById('btn-copy-code')?.addEventListener('click', () => {
      this.els.cppOutput?.select();
      document.execCommand('copy');
      this.renderer.showToast("Copied to clipboard!", "success");
    });

    // 8. タブ切り替え
    this.els.tabs.forEach(tab => {
      tab.addEventListener('click', (e) => this._switchTab(e.target.dataset.target));
    });

    // 9. 初回レンダリングの実行
    this._parseAndRender();
    console.log("UIController V52: System Online.");
  }

  /**
   * エディタ入力を検知し、指定時間経過後に解析を実行します。
   */
  onEditorInput() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this._parseAndRender(), 500);
  }

/**
   * テキストを解析し、Mermaid図と解析レポートを更新します。
   */
  async _parseAndRender() {
    try {
      const code = this.els.editor?.value || "";
      
      // 1. DPlusPlusParser による構造化
      this.data = this.parser.parse(code);

      // 【重要：追加】Analyzer の内部データを最新のパース結果で更新する
      if (this.analyzer) {
        this.analyzer.states = this.data.states;
        this.analyzer.transitions = this.data.transitions;
      }

      // 2. DPlusPlusAnalyzer による静的解析を実行
      this.analyzer.analyzeAll();

      // 3. Renderer による描画（V51回帰プラン適用済み）
      await this.renderer.renderMermaid();

      // 4. 解析結果のUI表示
      this.renderer.renderAnalysis(this.analyzer.report);

    } catch (e) {
      console.error("[UIController] Parse/Render Pipeline Failure:", e);
    }
  }

  /**
   * ファイルを読み込む際、既存データの上書きを確認します。
   * SSOT Section 3.1.2 遵守。
   */
  importFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 破壊的操作の保護
    if (this.els.editor && this.els.editor.value.trim().length > 0) {
      if (!window.confirm("Current editor content will be overwritten. Are you sure?")) {
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (this.els.editor) {
        this.els.editor.value = e.target.result;
        this.onEditorInput();
      }
    };
    reader.readAsText(file);
  }

  /**
   * 現在のコンテキスト（変数のスナップショット）を取得します。
   */
analyzeVariables() {
    const vars = {}; 
    const meta = {};
    const keywords = new Set(['true', 'false', 'null', 'undefined', 'NaN', 'Math', 'OR', 'AND']);

    // スキャナー本体（ここは変更なし）
    const scan = (str) => {
      if (!str || str === '-') return;

      // 数値型の推定
      const rangeMatch = str.match(/([a-zA-Z_][\w-]*)\s*(<|>|<=|>=)/g);
      if (rangeMatch) {
        rangeMatch.forEach(m => {
          const v = m.match(/([a-zA-Z_][\w-]*)/)[1];
          if (!keywords.has(v)) meta[v] = 'number';
        });
      }

      // 真偽値型の推定
      const boolMatch = str.match(/([a-zA-Z_][\w-]*)\s*(==|!=|=)\s*(true|false)|!([a-zA-Z_][\w-]*)/g);
      if (boolMatch) {
        boolMatch.forEach(m => {
          const v = m.match(/([a-zA-Z_][\w-]*)/)?.[1] || m.match(/!([a-zA-Z_][\w-]*)/)?.[1];
          if (v && !keywords.has(v)) meta[v] = 'boolean';
        });
      }

      // 識別子の抽出
      const allMatch = str.match(/\b[a-zA-Z_][\w-]*\b/g);
      if (allMatch) {
        allMatch.forEach(v => {
          if (!keywords.has(v) && !/^\d+$/.test(v)) {
            if (!vars.hasOwnProperty(v)) vars[v] = 0; 
          }
        });
      }
    };

    // --- 修正箇所 ---
    // Table A: 全ての要素が変数に関係する（Entry, Exit, Invariant）
    this.data.states.forEach(s => { 
      scan(s.entry); 
      scan(s.exit); 
      scan(s.invariant); 
    });

    // Table B: Guard と Action のみをスキャンし、Trigger（イベント名）は除外する
    this.data.transitions.forEach(t => { 
      // scan(t.trigger); // ← ここを削除
      scan(t.guard); 
      scan(t.action); 
    });

    this.varMeta = meta; 
    return vars;
}

  /**
   * カバレッジ率を計算します。
   * @returns {number} 0-100 の整数
   */
  calculateCoverage() {
    if (!this.data.transitions || this.data.transitions.length === 0) return 0;
    
    // 現在のセッションまたはテストで通過したユニークな遷移をカウント
    const visited = this.data.transitions.filter(t => this.coverageSet.has(t.lineIndex)).length;
    return Math.round((visited / this.data.transitions.length) * 100);
  }

  /**
   * 指定した行番号へジャンプ（フォーカス）します。
   * @param {number} lineIndex 
   */
  jumpToLine(lineIndex) {
    if (!this.els.editor) return;
    const text = this.els.editor.value;
    const lines = text.split('\n');
    let startPos = 0;
    for (let i = 0; i < lineIndex; i++) {
      startPos += (lines[i]?.length || 0) + 1;
    }
    this.els.editor.focus();
    this.els.editor.setSelectionRange(startPos, startPos + (lines[lineIndex]?.length || 0));
    
    // スクロール同期 (line-height 21px 想定)
    this.els.editor.scrollTop = (lineIndex * 21) - (this.els.editor.clientHeight / 2);
  }

  /**
   * タブパネルを切り替えます。
   * @private
   */
  _switchTab(targetId) {
    if (!this.els.panes || !this.els.tabs) return;
    this.els.panes.forEach(p => p.style.display = p.id === targetId ? 'flex' : 'none');
    this.els.tabs.forEach(t => t.classList.toggle('active', t.dataset.target === targetId));
  }
}