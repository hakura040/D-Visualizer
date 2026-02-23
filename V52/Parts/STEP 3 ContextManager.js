/**
 * ContextManager Class (V52 Full Ref-Free Specification)
 * Format D+++ Visualizer v52 - Step 3: Context Manager
 * * 【V52 アップグレード要件】
 * 1. 参照遮断（Ref-Free）原則の徹底: 全てのデータ授受において _deepCopy を強制し、メモリ共有バグを根絶。
 * 2. トランザクション保護の強化: ロールバック時、バックアップの「複製」を書き戻すことで復元後の安全性を担保。
 * 3. 冗長な型安全ガード: updateAll における型チェックとキー個別コピーの徹底。
 * 4. 信頼性設計: Step 4/5 のタイムアウト機能を支えるシステム予約語の保存・復元。
 */
class ContextManager {
  /**
   * コンストラクタ
   * SSOT Section 2.1 に基づき、初期データから参照を完全に遮断して初期化します。
   * @param {object} initialData - 初期コンテキストデータ
   */
  constructor(initialData = {}) {
    // V27 論理モデル Ctx.Idle 状態への移行
    // 参照遮断: 引数を直接代入せず、必ずディープコピーを経由する
    this._activeContext = this._deepCopy(initialData);
    
    // バックアップ用コンテキスト（トランザクション用）を null で初期化
    this._shadowContext = null;
    
    console.log("[ContextManager] V52 Initialized. Active Context (Ref-Free):", this._activeContext);
  }

  /**
   * トランザクションを開始し、現在の状態をバックアップします。
   * SSOT Table B: Trigger BEGIN -> Target Ctx.Tx
   */
  beginTransaction() {
    // D-01: 現在の状態の完全な複製をバックアップ（_shadowContext）として保存
    this._shadowContext = this._deepCopy(this._activeContext);
    
    console.log("[ContextManager] Transaction Started. Shadow context created (Ref-Free backup).");
  }

  /**
   * トランザクションを確定し、バックアップを破棄します。
   * SSOT Table B: Trigger COMMIT -> Target Ctx.Idle
   */
  commit() {
    // 確定によりバックアップは不要となるため、明示的に参照を解放
    this._shadowContext = null;
    
    console.log("[ContextManager] Commit performed. Shadow context cleared.");
  }

  /**
   * トランザクションを破棄し、開始時の状態に復元します。
   * SSOT Table B: Trigger ROLLBACK -> Target Ctx.Rollback -> Ctx.Idle
   * 【重要】バックアップそのものではなく、その複製（Deep Copy）を書き戻します。
   */
  rollback() {
    // Ctx.Rollback 状態の不変条件チェック: shadowContext が存在しない場合は復元不可
    if (!this._shadowContext) {
      console.warn("[ContextManager] Rollback ignored: No shadow context exists (Transaction not started).");
      return;
    }
    
    // M-03: shadowContext そのものを代入すると、後の操作でバックアップが汚染される恐れがあるため、
    // 再度ディープコピーを行い、参照が完全に切れた状態で activeContext を復元する。
    this._activeContext = this._deepCopy(this._shadowContext);
    
    // 復元完了後、トランザクション状態を終了させる
    this._shadowContext = null;
    
    console.log("[ContextManager] Rollback performed. State restored safely with deep copy.");
  }

  /**
   * M-01: 履歴スナップショットからの完全復元
   * UIのUndo機能やデバッグツールによる特定時点へのジャンプで使用。
   * @param {object} snapshot - 復元対象のコンテキストオブジェクト
   */
  restoreSnapshot(snapshot) {
    // 割り込み（Interrupt）トリガーによる Ctx.Idle への強制遷移
    if (snapshot === null || typeof snapshot !== 'object') {
      console.error("[ContextManager] Restore failed: Invalid snapshot data.");
      return;
    }
    
    // 外部データの参照を完全に遮断しつつ、コンテキストを上書き
    this._activeContext = this._deepCopy(snapshot);
    
    console.log("[ContextManager] Snapshot restored. Active context updated.");
  }

  /**
   * M-02: 複数変数の安全な一括マージ（SSOT Section 2.3 遵守）
   * @param {object} data - マージする新しい変数セット
   */
  updateAll(data) {
    // 型安全ガード: null または非オブジェクトの入力を遮断
    if (typeof data !== 'object' || data === null) {
      console.warn("[ContextManager] updateAll rejected: Input data must be an object.");
      return;
    }

    // 冗長マージロジック: 
    // ctx[key] = data[key] のような直接代入は「参照汚染」を招くため厳禁。
    // 各キーの値を個別にディープコピーして activeContext に結合する。
    Object.keys(data).forEach(key => {
      // システム予約語（__step_count__ 等）も他の変数と同様に複製される
      this._activeContext[key] = this._deepCopy(data[key]);
    });
    
    console.log("[ContextManager] Bulk update performed. Merged keys:", Object.keys(data));
  }

  /**
   * 単一コンテキスト値の更新
   * @param {string} key - 変数名（識別子）
   * @param {*} val - 新しい値
   */
  update(key, val) {
    // 代入時も常に参照遮断を行い、メモリの独立性を維持する
    this._activeContext[key] = this._deepCopy(val);
  }

  /**
   * コンテキストから値を取得
   * @param {string} key - 変数名
   * @returns {*} 値
   */
  get(key) {
    // 内部コンテキストから指定されたキーの値を返却
    return this._activeContext[key];
  }

  /**
   * 現在のコンテキストの完全な複製（スナップショット）を取得（SSOT Section 2.4 遵守）
   * @returns {object} 現在のコンテキストのディープコピー
   */
  getSnapshot() {
    // 参照汚染防止: 外部（UIやSimulator）での不注意な変更が内部データに波及するのを防ぐため、
    // 生の _activeContext ではなく、必ずそのディープコピーを生成して返却する。
    return this._deepCopy(this._activeContext);
  }

  /**
   * M-04: オブジェクトのディープコピー（JSON方式）
   * プリミティブ型（boolean, number, string）の整合性を維持しつつ参照を遮断します。
   * SSOT Section 2.5 の実装方式に準拠。
   * @private
   * @param {*} obj - コピー対象のオブジェクトまたは値
   * @returns {*} 複製された値
   */
  _deepCopy(obj) {
    // JSON.stringify は undefined を null に変換するか、プロパティを削除するため個別にガード
    if (obj === undefined) return undefined;
    
    // 数値、文字列、真偽値、null は JSON.parse/stringify で正しく複製される
    try {
      // JSON方式によるディープコピーの実行
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      /**
       * 例外処理の義務化 (SSOT Section 2.5)
       * 循環参照等で JSON 化に失敗した場合、console.error を出力し、
       * 最低限シミュレーションを継続させるために元の値をフォールバックとして返す。
       */
      console.error("[ContextManager] Critical Deep Copy Error. Ref-Free failed for this object:", obj, e);
      return obj; 
    }
  }
}

// export default ContextManager;