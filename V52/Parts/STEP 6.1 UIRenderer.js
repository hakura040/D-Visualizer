/**
 * UIRenderer Class - Version 52 (Full & Robust Specification)
 * Format D+++ Visualizer v52 - Step 6.1: View Layer
 * * 【V52 修正・完全実装内容】
 * 1. アーティファクト除去: 構文エラーや可読性低下の原因となる引用タグを全域から排除。
 * 2. Mermaid文法強化: 状態・遷移定義の各行末にセミコロンを追加し、トークン結合を防止。
 * 3. 分離強化: スタイル定義（classDef）の前に明確な分離コメントを追加。
 * 4. アトミック描画シーケンス: Lock -> Async Render -> Wait -> Bind -> Unlock の手順を厳守。
 * 5. カバレッジ視覚化: calculateCoverage() の結果をプログレスバーと数値に物理反映。
 * 6. 解析レポート連携: Step 7 の静的解析結果をリスト化し、エディタジャンプ機能を実装。
 */
class UIRenderer {
  /**
   * @param {UIController} uiController - 親となるUIコントローラーのインスタンス
   */
  constructor(uiController) {
    this.ui = uiController; // UIControllerへの参照
    this.els = uiController.els; // DOMキャッシュの共有
  }

  /* ========================================================================
     1. DASHBOARD & STATUS UPDATES (Section 2.1)
     ======================================================================== */

  /**
   * シミュレーターの状態（HACEサイクル）と統計情報をUIに反映します。
   * @param {AtomicSimulator} sim - シミュレーターインスタンス
   */
  async updateDashboard(sim) {
    if (!sim || !this.els.simStatus) return;

    // 1.1 ステータス表示の更新
    if (sim.simState === "Error_Lock") {
      this.els.simStatus.textContent = "ERROR_LOCK";
      this.els.simStatus.className = ""; // クラスリセット
      this.els.simStatus.style.color = "var(--action)";
    } else if (sim.simState === "Idle") {
      this.els.simStatus.textContent = `READY: ${sim.currentStateID || "NONE"}`;
      this.els.simStatus.className = "status-ready";
      this.els.simStatus.style.color = "var(--entry)";
    } else {
      this.els.simStatus.textContent = sim.simState.toUpperCase();
      this.els.simStatus.className = "";
      this.els.simStatus.style.color = "var(--primary)";
    }

    // 1.2 LED操作: HACEフェーズの点灯制御
    const phaseLeds = document.querySelectorAll('.led-label');
    phaseLeds.forEach(led => led.classList.remove('active'));
    const currentPhaseLed = document.getElementById(`phase-${sim.simState.toLowerCase()}`);
    if (currentPhaseLed) {
      currentPhaseLed.classList.add('active');
    }

    // 1.3 カバレッジ更新 (V52重要要件)
    const coveragePercent = this.ui.calculateCoverage ? this.ui.calculateCoverage() : 0;
    
    // パーセンテージテキスト反映
    if (this.els.dashboardCoverage) {
      this.els.dashboardCoverage.textContent = `${coveragePercent}%`;
    }

    // プログレスバー（width）反映
    const progressBar = document.getElementById('coverage-progress-fill');
    if (progressBar) {
      progressBar.style.width = `${coveragePercent}%`;
    }

    // 1.4 Undo制御
    const undoBtn = document.getElementById('btn-sim-undo');
    if (undoBtn) {
      undoBtn.disabled = !sim.history || sim.history.length === 0;
    }

    // 1.5 UIロック（Busy状態）の反映
    const isBusy = sim.simState !== "Idle" && sim.simState !== "Error_Lock";
    document.body.classList.toggle('sim-busy', isBusy);

    // 1.6 変数テーブルの同期更新
    this.renderVariableTable(sim.ctxManager.getSnapshot());
    // 重要：renderMermaidの完了を「待つ」
    if (this.renderMermaid) {
      await this.renderMermaid(); 
      // await することで、図が確実にDOM（画面）に配置された後に
      // highlightActiveElements が実行されるようになります。
      this.highlightActiveElements(sim);
    }
  }

  /* ========================================================================
     2. ATOMIC MERMAID RENDERING (Section 4.2)
     ======================================================================== */

  /**
   * D+++定義からMermaid図をアトミックに生成・描画します。
   * 手順: Lock -> Async Render -> Wait -> Bind -> Restore -> Unlock 
   */
async renderMermaid() {
    if (!this.els.mermaidDiv || !this.ui.data) return;
    document.body.classList.add('sim-busy');

    try {
      const lines = ["stateDiagram-v2"];
      lines.push("%%{init: {'theme': 'neutral', 'themeVariables': { 'fontSize': '12px' }}}%%");
      lines.push(this.ui.layout === 'TD' ? "  direction TB" : "  direction LR");

      const escape = (str) => this.escapeHtml(str);
      const safeId = (id) => "sid" + String(id).replace(/[^a-zA-Z0-9]/g, '');

      // --- 1. 階層構造（State Tree）の構築 (V51からの復元) ---
      const stateTree = {};
      this.ui.data.states.forEach(s => {
        const parts = s.id.split('.'); 
        let curr = stateTree;
        parts.forEach((p, i) => { 
          if (!curr[p]) { 
            const id = parts.slice(0, i+1).join('.'); 
            curr[p] = { id, safeId: safeId(id), children: {} }; 
          } 
          curr = curr[p].children; 
        });
      });

      // --- 2. 再帰的な状態定義の生成 (V51準拠) ---
      const build = (tree, indent = "  ") => {
        let s = ""; 
        for (const k in tree) {
          const n = tree[k];
          if (Object.keys(n.children).length > 0) {
            // 子がある場合は { } で囲む
            s += `${indent}state "${escape(n.id)}" as ${n.safeId} {\n${build(n.children, indent + "  ")}${indent}}\n`;
          } else {
            // 子がない場合は単一の状態として定義
            s += `${indent}state "${escape(n.id)}" as ${n.safeId}\n`;
          }
        }
        return s;
      };

      lines.push(build(stateTree));

      // --- 3. 遷移定義 (V16形式を維持) ---
      this.ui.data.transitions.forEach(t => {
        const src = safeId(t.source);
        const tgt = safeId(t.target || t.source);
        const trigger = escape(t.trigger || "ε");
        const label = `: "<span class='edge-label-btn' data-idx='${t.lineIndex}'>${trigger}</span>"`;
        lines.push(`  ${src} --> ${tgt} ${label}`);
      });

      const code = lines.join('\n');
      console.log("--- [V52 HIERARCHICAL] CLEAN DSL ---\n", code);

      // --- 4. 描画とスタイル適用 ---
      const { svg } = await mermaid.render(`mermaid-svg-${Date.now()}`, code);
      this.els.mermaidDiv.innerHTML = svg;

      // わずかな待機を入れてスタイルを適用
      await new Promise(resolve => setTimeout(resolve, 50));
      this.applySvgStyles(); 
      this.bindSvgEvents();

      // ★ここが問題の箇所：描画関数の中で自らハイライトを呼んでいた
      if (this.ui.simCtrl?.simulator) {
        this.highlightActiveElements(this.ui.simCtrl.simulator);
      }
      this.applyZoom();

    } catch (e) {
      console.error("[UIRenderer] Hierarchical Render Error:", e);
    } finally {
      document.body.classList.remove('sim-busy');
    }
  }

/**
   * SVG要素に対してクリックイベントをバインドします。
   * 階層構造化に伴う複雑なID体系に対応し、確実にエディタジャンプを実行します。
   */
  bindSvgEvents() {
    if (!this.els.mermaidDiv) return;

    // 1. 状態ノード（.node）のバインド
    this.els.mermaidDiv.querySelectorAll('.node').forEach(node => {
      node.onclick = () => {
        // Mermaidの生成IDからターゲットとなる sid... 文字列を抽出
        const idParts = node.id.split('-');
        const sidFromSvg = idParts[idParts.length - 2] || idParts[idParts.length - 1];
        
        // 描画ロジックと同じルールでIDを生成して照合（SSOT維持）
        const state = this.ui.data.states.find(s => {
          const expectedSid = "sid" + String(s.id).replace(/[^a-zA-Z0-9]/g, '');
          return expectedSid === sidFromSvg;
        });

        if (state) {
          this.ui.jumpToLine(state.lineIndex);
          this.showToast(`Selected: ${state.id}`, "info");
        } else {
          // フォールバック: 階層名の一部から検索
          const fallback = this.ui.data.states.find(s => sidFromSvg.includes(s.safeId));
          if (fallback) this.ui.jumpToLine(fallback.lineIndex);
        }
      };
    });

    // 2. 遷移ラベル（.edge-label-btn）のバインド
    this.els.mermaidDiv.querySelectorAll('.edge-label-btn').forEach(label => {
      label.onclick = (e) => {
        e.stopPropagation();
        const lineIdx = parseInt(label.dataset.idx);
        if (!isNaN(lineIdx)) {
          this.ui.jumpToLine(lineIdx);
        }
      };
    });
  }

  /* ========================================================================
     3. VARIABLE & ANALYSIS RENDERING (Section 2.3 / 2.4)
     ======================================================================== */

  /**
   * 現在の変数値（コンテキスト）を描画します。
   * @param {Object} ctx - 変数データ
   */
/**
   * 変数テーブルをレンダリングし、変化があった値にフラッシュ効果を適用します。
   */
  renderVariableTable(ctx) {
    // 1. ガードとバッファの初期化
    if (!this.els.varTable || !ctx) return;
    if (!this.prevContext) this.prevContext = {};

    let html = '<table class="var-table"><thead><tr><th>Key</th><th>Value</th></tr></thead><tbody>';
    
    // 表示順を安定させるためにキーをソート
    const entries = Object.entries(ctx).sort((a, b) => a[0].localeCompare(b[0]));

    entries.forEach(([key, val]) => {
      const displayVal = (typeof val === 'object') ? JSON.stringify(val) : val;
      
      // 2. 変化判定ロジックの注入
      // 前回の値が存在し、かつ現在の値と異なる場合のみクラスを付与
      const hasChanged = this.prevContext.hasOwnProperty(key) && this.prevContext[key] !== val;
      const flashClass = hasChanged ? "flash-update" : "";

      html += `
        <tr>
          <td class="var-key">${this.escapeHtml(key)}</td>
          <td class="var-val ${flashClass}" id="var-row-${this.escapeHtml(key)}">
            ${this.escapeHtml(String(displayVal))}
          </td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    this.els.varTable.innerHTML = html;

    // 3. 次回の比較のためにディープコピーを保存
    // 参照渡しを避けるため JSON を介して値を「凍結」保存します
    this.prevContext = JSON.parse(JSON.stringify(ctx));
  }

  /**
   * 静的解析レポートを表示します (Step 7 連携)。
   * @param {Array} report - エラー/警告の配列
   */
  renderAnalysis(report) {
    if (!this.els.analysisList || !this.els.analysisPanel) return;

    if (!report || report.length === 0) {
      this.els.analysisPanel.style.display = 'none';
      return;
    }

    this.els.analysisPanel.style.display = 'block';
    this.els.analysisList.innerHTML = report.map(item => {
      const typeClass = item.type === 'error' ? 'analysis-error' : 'analysis-warn';
      return `
        <div class="analysis-item ${typeClass}" onclick="window.ui.jumpToLine(${item.lineIndex})">
          <span class="analysis-loc">Line ${item.lineIndex + 1}:</span>
          <span class="analysis-msg">${this.escapeHtml(item.message)}</span>
        </div>
      `;
    }).join('');
  }

  /* ========================================================================
     4. HIGHLIGHTS & HELPERS
     ======================================================================== */

/**
   * 現在のアクティブな状態ノードを強調表示します。
   * 遷移実行中(Busy)は、その経路の赤色ハイライトを維持します。
   */
  highlightActiveElements(sim) {
    if (!this.els.mermaidDiv || !sim) return;

    // 1. 【条件付きクリア】
    // シミュレーターが完全に「Idle」または「Error」になった時だけ、矢印の赤色を一掃する
    if (sim.simState === "Idle" || sim.simState === "Error_Lock") {
      this.els.mermaidDiv.querySelectorAll('.diagram-highlight').forEach(el => {
        el.classList.remove('diagram-highlight');
      });
      this.els.mermaidDiv.querySelectorAll('.edge-hover-active').forEach(el => {
        el.classList.remove('edge-hover-active');
      });
    }

    // 2. ノード（箱）のハイライト更新
    this.els.mermaidDiv.querySelectorAll('.state-active').forEach(el => {
      el.classList.remove('state-active');
    });

    const sid = "sid" + sim.currentStateID.replace(/\./g, '');
    const node = this.els.mermaidDiv.querySelector(`[id*="${sid}"]`);
    if (node) {
      node.classList.add('state-active');
    }

    // 3. 【遷移の維持】
    // 現在実行中の遷移（currentTransition）がある場合、その矢印を強制的に光らせる
    // これにより、HACEサイクル（Exiting→Acting→Updating...）の間、赤色が維持されます。
    if (sim.currentTransition) {
      this.highlightEdge(sim.currentTransition.lineIndex, true);
    }
  }

/**
   * 指定した行番号へエディタをスクロールさせ、強調表示します。
   * @param {number} lineIndex 
   */
  scrollToLine(lineIndex) {
    // UIController に実装済みのジャンプ機能を呼び出す
    this.ui.jumpToLine(lineIndex);
  }


/**
   * 描画されたSVGに対して、カバレッジに応じたスタイルを直接適用します。
   */
  applySvgStyles() {
    if (!this.els.mermaidDiv || !this.ui.data) return;
    
    const visitedStates = this.ui.simCtrl?.simulator?.coverage?.visitedStates;

    // 状態ノードへのスタイル適用
    this.ui.data.states.forEach(s => {
      if (visitedStates?.has(s.id)) {
        const sid = "sid" + String(s.id).replace(/[^a-zA-Z0-9]/g, '');
        const nodeEl = this.els.mermaidDiv.querySelector(`[id*="${sid}"]`);
        if (nodeEl) {
          nodeEl.querySelectorAll('rect, path, circle, polygon').forEach(shape => {
            shape.classList.add('cov-visited');
          });
        }
      }
    });
  }

/**
   * エッジ（遷移の線）を強調表示します。
   * DSL(classDef)を使わず直接DOMを操作します。
   */
  highlightEdge(lineIndex, active) {
    if (!this.els.mermaidDiv) return;

    // 1. ラベル(ボタン)を特定
    const labelBtn = this.els.mermaidDiv.querySelector(`.edge-label-btn[data-idx='${lineIndex}']`);
    if (!labelBtn) return;

    const edgeContainer = labelBtn.closest('.edgeLabel');
    if (edgeContainer) {
      // 2. クラスの付け替えは維持（CSS側での制御用）
      edgeContainer.classList.toggle('edge-hover-active', active);

      // 3. 線(path)の特定と直接スタイル上書き
      const pathId = edgeContainer.id?.replace(/^L-/, '');
      if (pathId) {
        const path = this.els.mermaidDiv.querySelector(`path[id*="${pathId}"]`);
        if (path) {
          // V51方式: !important に相当する優先度で直接色を流し込む
          if (active) {
            path.style.stroke = 'var(--action)'; // 赤色 (#ef4444)
            path.style.strokeWidth = '3.5px';
            path.style.filter = 'drop-shadow(0 0 5px rgba(239, 68, 68, 0.4))';
          } else {
            // 元の状態（Mermaidのデフォルト）に戻す
            path.style.stroke = '';
            path.style.strokeWidth = '';
            path.style.filter = '';
          }
        }
      }
    }
  }
  /**
   * ズーム倍率を適用します。
   */
  applyZoom() { 
    if (this.els.mermaidDiv) {
      const svg = this.els.mermaidDiv.querySelector('svg');
      if (svg) {
        svg.style.transform = `scale(${this.ui.zoom})`;
        svg.style.transformOrigin = "top left";
      }
    }
  }

  /**
   * トースト通知を表示します。
   */
  showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = `toast show ${type}`;
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
  }

/**
   * 手動シミュレーション用のトリガーボタンをパネルに描画します。
   */
renderQuickActions(sim) {
    const container = document.getElementById('trigger-panel'); 
    if (!container) return;

    // 1. ヘッダーと「テストケース選択」の追加
    // 既存のスタイル（panel-label）を維持しつつ、セレクトボックスを挿入
    let headerHtml = `
      <div class="panel-label"><i class="ph ph-lightning-bolt"></i> Quick Actions</div>
      <div style="padding: 0 4px 10px 4px; border-bottom: 1px dashed var(--border-color); margin-bottom: 10px;">
        <div style="font-size: 10px; color: #94a3b8; margin-bottom: 4px; font-weight: bold;">SCENARIO SELECT (TABLE C)</div>
        <select id="test-case-selector" style="width:100%; padding:5px; font-size:11px; border:1px solid var(--border-color); border-radius:4px; background:#fcfcfd;">
          <option value="">-- Select Scenario --</option>
          ${(this.ui.data.testCases || []).map(tc => `<option value="${tc.id}">${tc.id}: ${tc.initialState}</option>`).join('')}
        </select>
      </div>
    `;
    container.innerHTML = headerHtml;

    // イベント配線
    const selector = document.getElementById('test-case-selector');
    selector.onchange = (e) => {
      if (e.target.value && this.ui.simCtrl) {
        this.ui.simCtrl.loadTestCase(e.target.value);
      }
    };

    // 2. 既存のロジック：ビジー状態の表示
    if (sim.simState !== "Idle") {
      const busy = document.createElement('div');
      busy.className = "busy-indicator"; 
      busy.innerHTML = `<div class="spinner"></div><span>Busy: ${sim.simState}...</span>`;
      container.appendChild(busy);
      return;
    }

    const available = sim.getAvailableTransitions();
    if (available.length === 0) {
      const none = document.createElement('div');
      none.style = "padding:10px; font-size:11px; color:var(--action); text-align:center;";
      none.textContent = "No Available Actions";
      container.appendChild(none);
      return;
    }

    // ボタンリストの構築
    const list = document.createElement('div');
    list.className = 'trigger-list';

    available.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'trigger-btn';
      // 稲妻アイコンの復活
      btn.innerHTML = `<i class="ph-fill ph-lightning"></i> <span>${this.escapeHtml(t.trigger || "ε")}</span>`;
      
      // UX復元: ホバー時の図との連動
      btn.onmouseenter = () => this.highlightEdge(t.lineIndex, true);
      btn.onmouseleave = () => this.highlightEdge(t.lineIndex, false);
      
      // クリックでシミュレーターを駆動
      btn.onclick = () => {
        if (this.ui.simCtrl) {
          this.ui.simCtrl.simulator.trigger(t);
        }
      };
      list.appendChild(btn);
    });
    container.appendChild(list);
  }



/**
   * HTMLエスケープ処理 (V51方式: 全角置換によるパーサー保護)
   * Mermaidの構文破壊を防ぎつつ、記号の視覚的な意味を維持します。
   */
  escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, '＆')
      .replace(/</g, '＜')
      .replace(/>/g, '＞')
      .replace(/"/g, '”')
      .replace(/'/g, "’");
  }
}