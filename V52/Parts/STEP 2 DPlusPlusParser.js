/**
 * DPlusPlusParser Class (V52 Full Refactored Specification)
 * Format D+++ Visualizer v52 - Step 2: Parser Core
 * * 【V52 アップグレード要件】
 * 1. メソッド分割: Table A/B/C のパース処理を独立したメソッドへ抽出し、保守性を向上。
 * 2. 優先度に基づく安定ソート: High/Default/Low の重みで遷移を評価。
 * 3. 識別子規則の拡張: ケバブケース（ハイフンを含む変数名）を完全許可。
 * 4. 信頼性設計: 10,000行制限、Step 7 連携用の詳細な解析エラー/警告蓄積。
 * 5. アーティファクト除去: 構文エラーの原因となる引用タグを完全に排除。
 */
class DPlusPlusParser {
  constructor() {
    /**
     * Step 7 (Analyzer) と連携するための解析レポートオブジェクト。
     * 解析中に発生したエラーや警告を lineIndex と共に保持します。
     */
    this.report = {
      errors: [],   // { line: number, message: string }
      warnings: []  // { line: number, message: string }
    };
  }

  /**
   * Markdown形式のテキストを解析し、構造化データに変換します。
   * @param {string} text - ソーステキスト
   * @returns {object} { states, transitions, testCases, report }
   */
  parse(text) {
    // 解析レポートのリセット
    this.report = { errors: [], warnings: [] };

    const lines = text.split(/\r?\n/);
    const totalLines = lines.length;

    // --- Section 5: タイムアウト・負荷対策ガード ---
    if (totalLines > 10000) {
      this.report.errors.push({
        line: 0,
        message: "Input limit exceeded: Maximum 10,000 lines allowed."
      });
      return this._generateEmptyResult();
    }

    const result = {
      states: [],
      transitions: [],
      testCases: []
    };
    
    let currentMode = null; // 'A', 'B', 'C' または null

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const lineIndex = index;

      // 基本ガード: コメント行（//）および完全な空行を無視
      if (!trimmed || trimmed.startsWith('//')) return;

      // P-01: セクション検出
      if (/^#*\s*Table\s+A/i.test(trimmed)) { currentMode = 'A'; return; }
      if (/^#*\s*Table\s+B/i.test(trimmed)) { currentMode = 'B'; return; }
      if (/^#*\s*Table\s+C/i.test(trimmed)) { currentMode = 'C'; return; }

      // 区切り行・データ以外の判定
      if (/^[|:\-\s]+$/.test(trimmed)) return;
      if (!trimmed.includes('|')) return;

      const data = this._parseRow(trimmed);
      if (!data || data.length === 0) return;

      // ヘッダーキーワードの除外
      const firstCell = data[0].toLowerCase();
      if (["id", "state id", "priority", "case id"].includes(firstCell)) return;

      // 空データ・"-" セルの正規化
      const normalizedData = data.map(cell => (cell.trim() === '-' ? null : cell.trim()));
      if (normalizedData.every(cell => cell === null || cell === "")) return;

      // セクション未定義時の警告
      if (!currentMode) {
        this.report.warnings.push({
          line: lineIndex + 1,
          message: "Data row found outside of any Table section. Row ignored."
        });
        return;
      }

      // V52: メソッド分割によるパース実行
      if (currentMode === 'A') {
        const state = this._parseStateDef(normalizedData, lineIndex);
        if (state) result.states.push(state);
      } else if (currentMode === 'B') {
        const trans = this._parseTransitionDef(normalizedData, lineIndex);
        if (trans) result.transitions.push(trans);
      } else if (currentMode === 'C') {
        const testCase = this._parseTestCase(normalizedData, lineIndex);
        if (testCase) result.testCases.push(testCase);
      }
    });

    /**
     * Section 2: 優先度に基づく安定ソート (Stable Sort)
     */
    const priorityWeights = { "High": 3, "Default": 2, "Low": 1 };

    result.transitions.sort((a, b) => {
      const weightA = priorityWeights[a.priority] || 2;
      const weightB = priorityWeights[b.priority] || 2;
      if (weightA !== weightB) return weightB - weightA;
      return a.lineIndex - b.lineIndex; // lineIndex による順序維持
    });

    result.report = this.report;
    return result;
  }

  /**
   * Table A: States の解析
   * @private
   */
  _parseStateDef(data, lineIndex) {
    if (data.length < 4) {
      this.report.errors.push({ line: lineIndex + 1, message: "Invalid Table A: 4 columns required." });
      return null;
    }
    const stateId = data[0];
    return {
      id: stateId,
      safeId: this._makeSafeId(stateId),
      entry: data[1] || "",
      exit: data[2] || "",
      invariant: data[3] || "",
      lineIndex: lineIndex
    };
  }

  /**
   * Table B: Transitions の解析
   * @private
   */
  _parseTransitionDef(data, lineIndex) {
    if (data.length < 6) {
      this.report.errors.push({ line: lineIndex + 1, message: "Invalid Table B: 6 columns required." });
      return null;
    }
    const sourceId = data[1];
    const targetId = data[5];
    return {
      priority: data[0] || "Default",
      source: sourceId,
      sourceSafeId: this._makeSafeId(sourceId),
      trigger: data[2],
      guard: data[3] || "",
      action: data[4] || "",
      target: targetId,
      targetSafeId: this._makeSafeId(targetId),
      lineIndex: lineIndex
    };
  }

  /**
   * Table C: Test Cases の解析
   * @private
   */
  _parseTestCase(data, lineIndex) {
    if (data.length < 5) {
      this.report.errors.push({ line: lineIndex + 1, message: "Invalid Table C: 5 columns required (Scenario column added in V52)." });
      return null;
    }
    return {
      id: data[0],
      initialState: data[1],
      scenario: this._parseScenario(data[2]),
      context: data[3] || "",
      expectedTarget: data[4],
      lineIndex: lineIndex
    };
  }

  /**
   * Mermaid等の描画ライブラリで安全に扱えるIDを生成します。
   * @private
   */
  _makeSafeId(id) {
    if (!id) return null;
    if (id === "*") return "wildcard_ANY";
    return id
      .replace(/\./g, '_')           // ドットを置換
      .replace(/[^a-zA-Z0-9_-]/g, '') // 許可文字以外を排除（ハイフンは許可）
      .replace(/^(\d)/, '_$1');      // 先頭数字対策
  }

  /**
   * シナリオ文字列 [a, b, c] を配列に変換します。
   * @private
   */
  _parseScenario(str) {
    if (!str) return [];
    return str
      .replace(/[\[\]]/g, '')
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== "");
  }

  /**
   * パイプ区切りの行を配列に分解します。
   * @private
   */
  _parseRow(line) {
    const placeholder = "__ESCAPED_PIPE__";
    const protectedLine = line.replace(/\\\|/g, placeholder);
    return protectedLine
      .trim()
      .replace(/^\||\|$/g, '')
      .split('|')
      .map(cell => cell.trim().replace(new RegExp(placeholder, 'g'), '|'));
  }

  /**
   * 異常系用空オブジェクト生成
   * @private
   */
  _generateEmptyResult() {
    return { states: [], transitions: [], testCases: [], report: this.report };
  }
}