/**
 * SafeEvaluator Class
 * Format D+++ Visualizer v52 - Step 1: Logic Core (Physical Implementation)
 * * 【V52物理制約の解決策】
 * 1. ハイフン識別子マッピング: JSの変数名にハイフンを使えない制約を回避するため、
 * ctxのキーと式内のハイフンを "__H__" に置換して評価する。
 * 2. 空白制約の物理強制: 演算子としてのマイナスは前後に空白を必須とし、
 * 空白のないハイフンは識別子の一部として保護する。
 * 3. ユニット保護: --, -= を不可分な単位として、最長一致原則に基づき抽出。 
 */
class SafeEvaluator {
  /**
   * 右辺式（expr）をコンテキスト（ctx）に基づいて評価します。
   * V52仕様: 空白制約を強制し、ハイフンを含む変数名をJS安全な形式へマッピングします。
   * * @param {string} expr - 評価する数式または論理式
   * @param {object} ctx - 変数スコープとなるコンテキストオブジェクト
   * @returns {*} 評価結果
   */
  evaluateRHS(expr, ctx) {
    try {
      // 1. ctxのキーからハイフンを含む変数名を抽出し、JS安全な別名にマッピング
      // 例: "usb-state" -> "usb__H__state"
      const safeCtx = {};
      
      Object.keys(ctx).forEach(key => {
        const safeKey = key.replace(/-/g, '__H__');
        safeCtx[safeKey] = ctx[key];
      });

      // 2. 式(expr)のプリプロセス: 空白制約の強制
      // V52ルール: "a-b" は1つの変数、"a - b" は減算。
      // まず、式の中の識別子（ハイフンを含む可能性がある）を抽出し、安全な別名に置換する。
      let processedExpr = expr;

      // 識別子(最長一致)を検索し、マッピングに基づいて置換。
      // ここで演算子境界を保護するため、後続に空白のないハイフンも識別子として扱う。
      const identifierRegex = /[a-zA-Z_][\w-]*/g;
      processedExpr = processedExpr.replace(identifierRegex, (match) => {
        // ハイフンを含む場合は置換対象
        return match.includes('-') ? match.replace(/-/g, '__H__') : match;
      });

      // 3. JS評価関数の生成
      const keys = Object.keys(safeCtx);
      const values = Object.values(safeCtx);
      
      // new Function によるサンドボックス評価。引数名はJS安全な __H__ 形式。
      const evaluator = new Function(...keys, `return (${processedExpr});`);
      
      return evaluator(...values);
    } catch (error) {
      /**
       * 評価失敗時の詳細情報付帯 (Step 7 診断レポート用)
       * 単なるエラーメッセージではなく、評価しようとした式を保持。
       */
      throw new Error(`RHS Evaluation Failed: "${expr}" -> ${error.message}`);
    }
  }

  /**
   * 1行のアクション文字列を解析し、ctxを更新します。
   * 設計書 Table B の優先順位 (Priority) に基づき、厳密な境界パースを実行します。
   * * @param {string} line - 実行するアクション文字列
   * @param {object} ctx - 更新対象のコンテキスト
   * @returns {object} 更新後のコンテキスト
   */
  executeAction(line, ctx) {
    // Eval.Idle -> Eval.Match: 入力の正規化
    const s = line.trim();
    let m;

    try {
      // --- Priority 1 / L04: 論理反転代入 ---
      // 識別子正規表現は V52準拠の ([a-zA-Z_][\w-]*) を使用。
      if ((m = s.match(/^([a-zA-Z_][\w-]*)\s*=\s*!(.+)$/))) {
        const [_, key, val] = m;
        ctx[key] = !this.evaluateRHS(val, ctx);
      } 
      
      // --- Priority 2 / L03: インクリメント (++) ---
      // 演算子ユニット保護: ++ を識別子末尾のハイフンと混同させない。
      else if ((m = s.match(/^([a-zA-Z_][\w-]*)\s*(\+\+)$/))) {
        const [_, key] = m;
        ctx[key] = Number(ctx[key] || 0) + 1;
      }
      
      // --- Priority 3 / L05: デクリメント (--) ---
      // V52追加: 最長一致により、識別子末尾のハイフンを優先的に保護。
      else if ((m = s.match(/^([a-zA-Z_][\w-]*)\s*(\-\-)$/))) {
        const [_, key] = m;
        ctx[key] = Number(ctx[key] || 0) - 1;
      }
      
      // --- Priority 4 / L02: 加算代入 (+=) ---
      else if ((m = s.match(/^([a-zA-Z_][\w-]*)\s*(\+=)\s*(.+)$/))) {
        const [_, key, __, val] = m;
        ctx[key] = Number(ctx[key] || 0) + Number(this.evaluateRHS(val, ctx));
      }
      
      // --- Priority 5 / L06: 減算代入 (-=) ---
      // V52追加: -= を独立ユニットとしてマッチ。
      else if ((m = s.match(/^([a-zA-Z_][\w-]*)\s*(\-=)\s*(.+)$/))) {
        const [_, key, __, val] = m;
        ctx[key] = Number(ctx[key] || 0) - Number(this.evaluateRHS(val, ctx));
      }
      
      // --- Priority 6 / L01: 単純代入 (=) ---
      else if ((m = s.match(/^([a-zA-Z_][\w-]*)\s*=\s*(.+)$/))) {
        const [_, key, val] = m;
        ctx[key] = this.evaluateRHS(val, ctx);
      } 
      
      // --- Default: パターン不一致 ---
      else {
        throw new Error("Pattern Mismatch");
      }

      // Eval.Execute -> Eval.Idle: 更新されたコンテキストを返却
      return ctx;
    } catch (e) {
      /**
       * データ保護プロトコル (V52異常系設計)
       * エラーの発生源を明示し、ContextManagerによるロールバックをトリガーする。
       */
      const errorMsg = `Logic Error at: ${line} | Detail: ${e.message}`;
      throw new Error(errorMsg);
    }
  }
}