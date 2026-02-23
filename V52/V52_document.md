### 1. モジュール間 依存関係マップ（アーキテクチャ俯瞰）

V52のパイプラインは、以下の順序でデータが処理・蓄積される単方向フローを基本とします。

1. **入力・解析層 (Step 0 → 1 → 2 → 3 → 7)**
* ユーザー入力をトリガーに、パーサーがデータを構造化し、アナライザーが静的解析（Strict Linter）を行います 。




2. **実行・計測層 (Step 4 → 5)**
* 解析済みのロジックに基づき、シミュレーターまたはバッチランナーが動作し、実行履歴とカバレッジを記録します 。




3. **統括・描画層 (Step 6.1 〜 6.3)**
* シミュレーション結果を受け取り、Mermaid図の更新、変数テーブルの表示、UIフィードバックを行います。


4. **外部連携層 (Step 8)**
* 蓄積された解析データと実行統計から、AI向けJSONやC++コードを生成します 。





---

### 2. D+++によるツール内部ロジックの定義（SSOT）

安定版V27で動作検証を行うための、V52内部オーケストレーションの論理モデルです 。

#### **Table A: V52 Internal System States**

| State ID | Entry (初期化/データ準備) | Exit (終了処理) | Invariant (保持条件) |
| --- | --- | --- | --- |
| **App.Idle** | `status="READY"` | - | - |
| **App.Parsing** | `clearBuffer(); Step1.preprocess()` | `Step2.parse(); Step3.initCtx()` | `isParserRunning == true` |
| **App.Analyzing** | `Step7.runLinter()` | `updateReport()` | `reportCount >= 0` |
| **App.Ready** | `unlockUI(); showStatus("Safe")` | - | `errorCount == 0` |
| **App.Simulating** | `Step4.boot(); timer = 0` | `stopTimer()` | <br>`timer < 5000` (Timeout )

 |
| **App.Testing** | `Step5.initSuite()` | `summarize()` | `isBatchRunning == true` |
| **App.Exporting** | `Step8.prepare()` | `copyToClipboard()` | `json.isValid == true` |

#### **Table B: V52 Sequence Transitions**

| Priority | Source | Trigger | Guard (条件) | Action (データ授受) | Target |
| --- | --- | --- | --- | --- | --- |
| **High** | `App.Idle` | `EV_INPUT` | - | `rawCode = editor.val` | **App.Parsing** |
| **Default** | `App.Parsing` | `auto` | `parseOK == true` | `data = parser.result` | **App.Analyzing** |
| **Default** | `App.Analyzing` | `auto` | `errorCount == 0` | `model = analyzer.model` | **App.Ready** |
| **High** | `App.Analyzing` | `auto` | `errorCount > 0` | `showErrorLine()` | **App.Idle** |
| **Default** | `App.Ready` | `btn_start` | - | `ctx = Step3.getSnapshot()` | **App.Simulating** |
| **Default** | `App.Ready` | `btn_test` | - | `cases = Step2.testCases` | **App.Testing** |
| **Default** | `App.Ready` | `btn_ai` | - | `data = Step7.report` | **App.Exporting** |
| **Interrupt** | `*` | `EV_ERROR` | - | `forceStop(); toast("Error")` | **App.Idle** |

---

### 3. データ授受プロトコル（モジュール間引数仕様）

AIが実装時にデータの受け渡しを簡略化しないよう、主要なデータ構造を定義します。

#### **A. 解析データ構造 (Step 2 → Step 3/4/7/8)**

パーサーが生成する「共通の真実」となるオブジェクトです。

* `states`: `Array<{id, entry, exit, invariant, lineIndex}>`
* 
`transitions`: `Array<{priority, source, trigger, guard, action, target, lineIndex}>` 


* 
`testCases`: `Array<{id, initial, context, expected, scenario}>` 



#### **B. コンテキスト・スナップショット (Step 3 ↔ Step 4/5)**

変数の値をやり取りする際の整合性を保護します。

* 授受データは必ず**JSON.parse(JSON.stringify(obj))**によるディープコピーを行い、参照渡しを禁止します。

#### **C. 解析レポート (Step 7 → Step 0/8)**

AIエクスポートおよびUI表示に使用される診断データです 。

* 
`diagnostics`: `Array<{id, type: "error"|"warn", msg, lineIndex}>` 


* 
`modelSummary`: 状態数、遷移数、依存関係の文字列リスト 。



---

### 4. 異常系・信頼性設計（タイムアウトの組み込み）

AIによる無限ループ実装を防ぐため、以下のガード条件を詳細設計に義務付けます 。

* 
**実行ループ保護:** `Step 4` および `Step 5` において、`auto` 遷移が連続して発生する場合、100回（任意設定可能）を超える連鎖は「無限ループ」と判定し、強制的に `App.Idle` へ戻すガードを `Table B` に実装することを必須とします 。


* 
**タイムアウト監視:** 1回のトリガー処理が指定時間（例：5秒）を超えて完了しない場合、プロセスの実行を遮断するタイムアウトフラグを状態遷移のガードに含めます 。


## 【フェーズ2】Step別 詳細設計書

### **Step 0: Base (HTML/CSS) 詳細設計仕様書**

本ドキュメントは、**D+++ Visualizer V52** の基盤となるUI構造およびスタイリングを定義する。V51で欠落していたUI要素（カバレッジ表示、オートプレイ制御、AI出力ボタン）を完全に復元・追加し、実装担当AIが「推測」でコードを簡略化することを防ぐためのSSOT（単一の真実の源）として機能する。

---

### **1. 内部ロジックモデル (V27形式 D+++定義)**

UIの状態遷移およびDOMイベントの受付可否を定義する。

**Table A: UI Component States**
| State ID | Entry (初期表示設定) | Exit (非表示化) | Invariant (制約条件) |
| :--- | :--- | :--- | :--- |
| **UI.Idle** | `body.sim-busy=false` | - | `editor.readonly=false` |
| **UI.Simulating** | `body.sim-busy=true` | - | `editor.readonly=true` |
| **UI.Testing** | `tab-btn[test].active=true` | - | `manual-layout.hidden=true` |
| **UI.ModalOpen** | `code-modal.display="flex"` | `code-modal.display="none"` | `overlay.active=true` |

**Table B: UI Interaction Transitions**
| Priority | Source | Trigger | Guard (条件) | Action (DOM操作) | Target |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **High** | `UI.Idle` | `btn_start` | `parseOK==true` | `lockEditor(); clearCoverage()` | `UI.Simulating` |
| **High** | `UI.Simulating` | `EV_ERROR` | - | `unlockEditor(); toast("Error")` | `UI.Idle` |
| **Default** | `*` | `tab_click` | - | `switchPane(); updateTabStyle()` | `*` |
| **Default** | `UI.Simulating` | `btn_ai` | `simState=="Idle"` | `Step8.export(); showModal()` | `UI.ModalOpen` |

---

### **2. HTML 構造仕様 (DOM Tree)**

V51をベースに、V52で必要な要素を追加・整理した階層構造を定義する。

#### **2.1 Header (Toolbar & Telemetry)**

ヘッダー右側にAI連携用ボタンおよびカバレッジ統計表示を追加する。

* **Header Toolbar:**
* 
`button#btn-ai-export`: AI連携用JSON出力 (新規) 




* **Led Panel:**
* 
`div#sim-status`: シミュレーター状態表示 (Offline/Ready/Busy) 


* `div#coverage-panel`: (新規) カバレッジ統計
* 
`span#dashboard-coverage`: テキスト表示 ("0%") 


* `div#coverage-progress-bg`: 進捗バー背景
* 
`div#coverage-progress-fill`: 進捗バー（CSS `width` で操作） 







#### **2.2 Workspace (3-Pane Layout)**

* 
**Pane Left:** `#gutter` (行番号) と `#editor` (テキスト入力領域) 


* **Pane Right (Top):** `#diagram-container` 内に `#diagram` (Mermaid描画先)
* **Pane Right (Bottom):** `#bottom-panel` (タブ切り替え構造)

#### **2.3 Bottom Panel: Manual Sim (HACE) Tab**

オートプレイ操作系を復元する。

* **Manual Toolbar:**
* 
`button#btn-play`: 自動実行開始 


* 
`button#btn-pause`: 自動実行停止 


* 
`input#speed-range`: 実行速度調整 (100ms - 2000ms) 





---

### **3. CSS スタイル仕様 (Design Tokens & Classes)**

#### **3.1 V52 拡張スタイル**

AIが視覚的なフィードバックを実装漏れしないよう、詳細に定義する。

* **カバレッジ可視化 (Mermaid連動):**
* 
`.cov-visited`: 通過済み要素。 `fill: #eff6ff !important; stroke: var(--primary) !important; stroke-width: 2.5px !important;` 


* 
`.cov-unvisited`: 未通過パス（遷移）。 `stroke: #fca5a5 !important; stroke-dasharray: 5, 5 !important;` (新規) 




* **変数更新フラッシュアニメーション:**
* `@keyframes flash-yellow`: 0% `{ background-color: #fef08a; }` 100% `{ background-color: transparent; [cite_start]}` 


* 
`.flash-update`: 1秒の `ease-out` アニメーションを適用 





#### **3.2 Z-Index 管理**

* `header`: 100
* `#bottom-panel`: 50
* 
`#code-modal`: 1000 (最前面) 


* `#toast`: 2000

---

### **4. DOM バインディング定義表 (SSOT)**

JavaScript(Step 6)から参照・操作されるIDと用途の一覧。

| 要素ID | 種類 | 用途・機能 | V52における変更点 |
| --- | --- | --- | --- |
| `editor` | Textarea | ソースコード入力 | <br>`sim-busy` 時に `pointer-events: none` でロック 

 |
| `sim-status` | Div | エンジン状態表示 | テキストと色の動的変更 

 |
| `dashboard-coverage` | Span | カバレッジ率表示 | <br>**V52で完全復元** 

 |
| `coverage-progress-fill` | Div | プログレスバー | <br>**V52で完全復元**（width制御） 

 |
| `btn-play` | Button | オートプレイ | <br>**V52で完全復元**（クリックイベント紐付け） 

 |
| `btn-ai-export` | Button | AI連携 | <br>**V52新規追加**（Exporter呼び出し） 

 |
| `code-modal` | Div | 解析結果モーダル | <br>`Step 8` のJSON/C++表示用 

 |

---

### **5. 信頼性・タイムアウト設計**

* **UIロック機能:** シミュレーション実行中 (`isSimulating == true`) は、エディタおよび「Reset & Start」以外のボタンへの入力を物理的に遮断するCSS `sim-busy` クラスの適用を必須とする。
* **トースト通知タイムアウト:** すべてのユーザー通知 (`#toast`) は、表示後 **2500ms** で自動的に非表示 (`opacity: 0`) になるようCSS遷移を定義する。


---
### **Step 1: Logic Core (SafeEvaluator) 詳細設計仕様書**

本ドキュメントは、**D+++ Visualizer V52** における数式評価およびアクション実行の核心ロジックを定義する 。V51で不足していた減算系演算子の追加、ハイフンを含む変数名への対応、および実行時の信頼性確保を目的とし、実装担当AIが慣習的なコードに逃げないよう、**V27形式のD+++モデル**をSSOT（単一の真実の源）として提示する 。

---

### **1. 内部ロジックモデル (V27形式 D+++定義)**

`executeAction` メソッド内部における、アクション文字列のパースと実行順序を定義する 。AIは各正規表現の判定順序（Priority）をこの表の通りに実装しなければならない 。

**Table A: Action Execution States**
| State ID | Entry (初期化) | Exit (後処理) | Invariant (制約条件) |
| :--- | :--- | :--- | :--- |
| **Eval.Idle** | `m = null; result = null` | - | - | 
| **Eval.Match** | `status = "Matching Patterns"` | - | `line != null` | 
| **Eval.Execute** | `beginTransaction()` | `commit()` | `targetVar != null` | 
| **Eval.Error** | `status = "Logic Error"` | `rollback()` | `errorMessage != null` | 

**Table B: Action Execution Transitions**
| Priority | Source | Trigger | Guard (条件) | Action (具体的な実装手順) | Target |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **High** | `Eval.Idle` | `EXEC` | - | `s = line.trim()` | **Eval.Match** | 
| **1 (High)** | `Eval.Match` | `auto` | `s.match(/^([a-zA-Z_][\w-]*)\s*=\s*!(.+)$/)` | `L04: 論理反転代入を実行` | **Eval.Execute** | 
| **2** | `Eval.Match` | `auto` | `s.match(/^([a-zA-Z_][\w-]*)\s*(\+\+)$/)` | `L03: インクリメントを実行` | **Eval.Execute** | 
| **3** | `Eval.Match` | `auto` | `s.match(/^([a-zA-Z_][\w-]*)\s*(\-\-)$/)` | **L05: デクリメントを実行** | **Eval.Execute** | 
| **4** | `Eval.Match` | `auto` | `s.match(/^([a-zA-Z_][\w-]*)\s*(\+=)\s*(.+)$/)` | `L02: 加算代入を実行` | **Eval.Execute** | 
| **5** | `Eval.Match` | `auto` | `s.match(/^([a-zA-Z_][\w-]*)\s*(\-=)\s*(.+)$/)` | **L06: 減算代入を実行** | **Eval.Execute** | 
| **6** | `Eval.Match` | `auto` | `s.match(/^([a-zA-Z_][\w-]*)\s*=\s*(.+)$/)` | `L01: 単純代入を実行` | **Eval.Execute** | 
| **Default** | `Eval.Match` | `auto` | `else` | `lastErr = "Pattern Mismatch"` | **Eval.Error** | 
| **Default** | `Eval.Execute` | `auto` | - | `return updatedCtx` | **Eval.Idle** | 

---

### **2. メソッド詳細仕様**

**2.1 evaluateRHS(expr, ctx)** 

* 
**役割**: 右辺式（expr）をコンテキスト（ctx）に基づいて評価する 。


* **実装手順**:
1. 
`Object.keys(ctx)` および `Object.values(ctx)` を取得する 。


2. 
`new Function(...keys, "return (" + expr + ");")` を用いて、サンドボックス化された評価関数を作成する 。


3. 
`ctx` 内の変数を引数として渡し、結果を返す 。




* **信頼性/タイムアウト**:
* 式の評価に失敗した場合は、直ちに呼び出し元にエラーを再スローする 。


* 無限ループを伴うような複雑な式の入力は、後のStep 4/7で検知するため、ここでは純粋な評価に徹する 。





**2.2 executeAction(line, ctx)** 

* 
**役割**: アクション文字列を解析し、コンテキスト `ctx` を更新する 。


* **V52における必須変更点**:
* 
**識別子正規表現の更新**: すべてのパターンにおいて、変数名マッチングを `([a-zA-Z_]\w*)` から **`([a-zA-Z_][\w-]*)`** に変更し、ケバブケース（例: `usb-state`）を許可する 。


* 
**ハイフンとマイナス演算子の多義性排除（V52重要ルール）**: Step 2 (Parser) で定義された**「最長一致原則」**と**「演算子境界の空白制約」**を、評価器レベルの正規表現マッチングにおいても厳密に適用する 。AIは、アクション行のパース時に、識別子の一部としてのハイフンを優先的に抽出し、減算演算子としての `-` は前後に空白が存在する場合のみ演算子として解釈するロジックを死守しなければならない 。


* 
**トークナイズ境界の厳密保護**: 識別子 `([a-zA-Z_][\w-]*)` の直後に続くハイフンが、誤ってデクリメント（`--`）や減算代入（`-=`）の一部として貪欲（Greedy）に結合されないよう、正規表現に適切な境界設計（空白の有無の明示）を行う 。


* **減算系演算子の追加**:
* 
**L05: デクリメント (`--`)**: `ctx[key] = Number(ctx[key] || 0) - 1` を実行 。


* 
**L06: 減算代入 (`-=`)**: `ctx[key] = Number(ctx[key] || 0) - Number(this.evaluateRHS(val, ctx))` を実行 。




* 
**型安全性の確保**: 演算前に `Number()` キャストを明示的に行い、未定義変数は `0` として扱う 。





---

### **3. 演算パターン・ホワイトリスト (SSOT)**

AIはこの表に定義された順序とロジックを1ステップずつ実装しなければならない 。

| ID | 演算種類 | 正規表現 (V52準拠) | 実行ロジック |
| --- | --- | --- | --- |
| **L04** | 論理反転 | `/^([a-zA-Z_][\w-]*)\s*=\s*!(.+)$/` | <br>`ctx[key] = !evaluateRHS(val, ctx)` |
| **L03** | 増加 | `/^([a-zA-Z_][\w-]*)\s*(\+\+)$/` | `ctx[key] = Number(ctx[key]

 |
| **L05** | **減少** | `/^([a-zA-Z_][\w-]*)\s*(\-\-)$/` | <br>**(V52追加)** `ctx[key] = Number(ctx[key] |
| **L02** | 加算代入 | `/^([a-zA-Z_][\w-]*)\s*(\+=)\s*(.+)$/` | `ctx[key] = Number(ctx[key]

 |
| **L06** | **減算代入** | `/^([a-zA-Z_][\w-]*)\s*(\-=)\s*(.+)$/` | <br>**(V52追加)** `ctx[key] = Number(ctx[key] |
| **L01** | 単純代入 | `/^([a-zA-Z_][\w-]*)\s*=\s*(.+)$/` | <br>`ctx[key] = evaluateRHS(val, ctx)` |

**【補足：ハイフン識別のための正規表現制約（冗長記述）】** 減算演算子を含むアクション（L06）の右辺（RHS）を評価する際、または評価器内部でマイナス記号を処理する際、AIは Step 2 の定義に基づき「演算子のマイナスは空白を伴う（例: `a - b`）」ことを前提として実装を行う 。

具体的には以下の**識別子境界の誤判定防止策**を実装に含めること：

1. **演算子のユニット保護**: `--` および `-=` は、それ自体を不可分な最小単位（ユニット）としてマッチさせる。
2. **空白による強制分離**: 識別子 `([a-zA-Z_][\w-]*)` がハイフンで終わる場合、それが次に続く演算子（`-` や `--`）の開始と混同されないよう、正規表現マッチングにおいて「演算子記号の前には空白が必要である」という Step 2.5.4 の文法を逆用して境界を特定する。
3. **誤判定の排除**: 例えば `usb-state--` という記述がある場合、正規表現の最長一致により `usb-state` が識別子として抽出され、残りの `--` が演算子として正しくマッチされなければならない。もし `usb-stat` が識別子、`e--` が不明なトークンとして抽出されるような実装は誤りである。識別子 `[a-zA-Z_][\w-]*` は、後続に空白を挟まないハイフンを自身の構成要素として優先的に取り込む。

---

### **4. 異常系・信頼性設計**

* 
**エラー情報の詳細化**: 評価失敗時、単に "Logic Error" とするのではなく、失敗したアクション行 `line` を含めたメッセージ `new Error("Logic Error at: " + line)` をスローすることを義務付ける 。


* 
**未定義変数の防御**: 演算子 (`++`, `--`, `+=`, `-=`) を適用する際、変数が未定義 (`undefined` / `null`) の場合は `0` として初期化処理を行う 。これにより、実行時エラーによるシミュレーション停止を防ぐ 。

---

#### **5. 評価失敗時の挙動**

シミュレーション実行中、または解析中に JavaScript レベルの例外（Runtime Error）や論理エラーが発生した場合、以下の**「データ保護プロトコル」**を最優先で実行しなければならない。

1. **状態（State ID）の凍結**:
* 遷移中にエラーが発生した場合、`AtomicSimulator.currentStateID` は**遷移前の状態を維持**しなければならない。
* 勝手に `Error` 状態へ自動遷移させるのではなく、現在の ID を保持したまま `simState` を `Error_Lock` に移行させること。


2. **コンテキストの完全ロールバック**:
* `SafeEvaluator` での評価に失敗した場合、直ちに `ContextManager.rollback()` を呼び出さなければならない。
* 破壊的な代入（`count++` 等）が実行の途中で失敗した場合でも、変数の状態を「遷移開始直前のスナップショット」へ **1bit の狂いもなく復元**することを義務付ける。


3. **遷移の不成立処理**:
* エラーが発生した遷移（Transition）は、ガード条件が `false` であった場合と同様に「不成立」として扱い、副作用を一切残してはならない。


4. **エラー情報の詳細化**:
* 評価失敗時、単に "Logic Error" とするのではなく、失敗したアクション行 `line` を含めたメッセージ `new Error("Logic Error at: " + line)` をスローし、Step 7 の診断レポートへ引き渡すこと。

---


### **Step 2: DPlusPlusParser 詳細設計仕様書**

本ドキュメントは、**D+++ Visualizer V52** における構文解析モジュールの詳細仕様を定義する 。V51で顕在化した「優先順位（Priority）の無視」および「識別子制約（ハイフン不可）」を解消し、AIが生成したモデルを決定論的に構造化することを目的とする 。本設計は安定版**V27形式のD+++モデル**をロジックの正解（SSOT）として採用し、実装担当AIによる勝手な簡略化を構造的に排除する 。

---

### **1. 内部ロジックモデル (V27形式 D+++定義)**

パーサー内部における行処理とデータ格納のシーケンスを定義する 。

**Table A: Parser Execution States**
| State ID | Entry (初期化/前処理) | Exit (クリーンアップ) | Invariant (制約条件) |
| :--- | :--- | :--- | :--- |
| **Parse.Idle** | `result={s:[], t:[], c:[]}` | - | - |
| **Parse.Scan** | `status="Scanning Line"` | - | `currentLineIndex < totalLines` |
| **Parse.Extract** | `status="Extracting Cells"` | - | `row.length > 0` |
| **Parse.Finalize** | `status="Sorting Transitions"` | `return result` | `result.transitions.isSorted == true` |

**Table B: Parser Logic Transitions**
| Priority | Source | Trigger | Guard (条件) | Action (具体的な実装手順) | Target |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **High** | `Parse.Idle` | `START` | - | `lines = text.split(/\r?\n/)` | **Parse.Scan** |
| **Default** | `Parse.Scan` | `NEXT` | `isSectionHeader == true` | `updateCurrentMode(A/B/C)` | **Parse.Scan** |
| **Default** | `Parse.Scan` | `NEXT` | `isDataRow == true` | `row = _parseRow(trimmed)` | **Parse.Extract** |
| **High** | `Parse.Extract` | `auto` | `mode == "B"` | `pushTransition(); // 暫定格納` | **Parse.Scan** |
| **Default** | `Parse.Scan` | `COMPLETE` | `index == totalLines` | `executeStableSort(); // 優先度順` | **Parse.Finalize** |

---

### **2. 優先度（Priority）に基づく安定ソート仕様**

V51における「記述順依存」を排除するため、Table B解析後に明示的なソートを実行する 。

#### **2.1 重み付け定義**

各優先度文字列に対し、以下の数値（Weight）を割り当てる ：

| 優先度文字列 | 重み (Weight) | 備考 |
| --- | --- | --- |
| **High** | 3 | 最優先 |
| **Default** | 2 | 指定なしの場合もこれに該当 |
| **(Undefined)** | 2 | 記述がない場合 |
| **Low** | 1 | 最低優先 |

#### **2.2 ソートアルゴリズム**

* 
**手法**: `Array.prototype.sort()` を使用。ECMAScript 2019以降の仕様に基づき、**安定ソート（Stable Sort）**であることを保証する 。


* **比較関数**:
1. 遷移 `a` と `b` の重みを比較。
2. 結果（降順）でソートする 。


3. 重みが等しい場合は、元の記述順（`lineIndex`）が維持される 。





---

### **3. 識別子規則の拡張（ハイフン許可）**

AIが好んで生成する「ケバブケース」を許容し、パースエラーを防止する 。

#### **3.1 正規表現の更新**

* 
**変更前**: `/[a-zA-Z_]\w*/` 


* 
**変更後**: **`/[a-zA-Z_][\w-]*/`** 


* 
**適用範囲**: `_getSafeId` メソッドおよび全セクションのID抽出処理 。



#### **3.2 IDサニタイズ処理 (`_getSafeId`)**

Mermaid.jsでの描画エラーを防ぐため、以下の手順を厳密に実行する ：

1. ドット `.` をアンダースコア `_` に置換。
2. ハイフン `-` は**置換せず維持**する（CSSクラス名として有効なため） 。


3. 英数字、アンダースコア、ハイフン以外の記号を削除。
4. 先頭が数字の場合は、先頭に `_` を付与。

---

### **4. Table C (Test Cases) のスキーマ拡張**

V52の新機能「シナリオベーステスト」に対応するため、Table Cの解析構造を更新する 。

| プロパティ | 格納元 (V27形式列) | 説明 |
| --- | --- | --- |
| `id` | Case ID | テストケースの一意識別子。 |
| `initialState` | Initial | 開始状態。 |
| `scenario` | **Scenario (新設)** | <br>**[init, click, auto]** のようなトリガー配列 。

 |
| `context` | Context | 初期変数セット（JSONまたは `x=1` 形式）。 |
| `expectedTarget` | Expected | 最終的な期待到達状態 。

 |

* 
**Scenarioのパースロジック**: 文字列 `[a, b]` を `["a", "b"]` の配列に変換する。カンマ区切りも許容する 。



---

### **5. 異常系・信頼性設計**

* 
**セクション未定義保護**: `currentMode` が `null` の状態でデータ行が出現した場合、その行を無視し、解析レポート（Step 7用）に警告を記録する 。


* 
**不正なパイプ構造**: セル数が不足している行（例：Table Bで6セル未満）はスキップし、`lineIndex` と共にエラーを保持する 。


* 
**タイムアウト対策**: 入力テキストが10,000行を超える場合、1,000行ごとに非同期処理（`setTimeout` 等）を挟むか、警告を出して処理を中断するガード条件を検討する 。



#### **5.4 ハイフン（-）とマイナス演算子の多義性排除（V52重要ルール）**

変数名にハイフンを許可することによる、減算式（`a-b`）との解釈の曖昧性を以下の「遊びのない」規則で根絶する。

1. **最長一致原則 (Longest Match Principle)**:
* トークナイザー（`_parseRow` および各抽出処理）は、文字列をスキャンする際、識別子正規表現 `/[a-zA-Z_][\w-]*/` に合致する**最も長い連続した文字列**を一つの識別子（トークン）として切り出す。
* 例：入力 `usb-state` に対し、`usb`, `-`, `state` の 3 つに分解することは厳禁とし、必ず単一のトークン `usb-state` として抽出する。


2. **演算子境界の空白制約 (Whitespace Constraint for Operators)**:
* 減算（マイナス）演算子として `-` を使用する場合、その**前後に必ず 1 文字以上の空白（スペース、タブ等）を設けること**を D+++ V52 の「厳密文法（Strict Grammar）」として定義する。
* **正（減算）**: `count - 1`, `a - b`
* **正（識別子）**: `usb-state`, `retry-count`
* **誤（曖昧な記述）**: `count-1` → これは「`count-1` という名前の変数」としてパースされ、数式としては評価されない。


3. **Linterによる強制**:
* Step 7 (Analyzer) において、識別子の中にマイナス記号が含まれ、かつその識別子が未定義変数である場合、「空白不足による減算式の記述ミス」の可能性があるとして警告を出すロジックを実装する。



---

### **Step 3: Context Manager 詳細設計仕様書**

本ドキュメントは、**D+++ Visualizer V52** における変数管理モジュール（Context Manager）の詳細仕様を定義する。V51の実装を基盤とし、実行時の副作用を完全に排除するための「参照遮断（Ref-Free）」原則を徹底する。実装担当AIが「浅いコピー（Shallow Copy）」によるメモリ共有バグを誘発しないよう、**V27形式のD+++モデル**をSSOT（単一の真実の源）として定義し、ロジックを固定する。

---

### **1. 内部ロジックモデル (V27形式 D+++定義)**

Context Managerの内部状態と、トランザクション保護のシーケンスを定義する。

**Table A: Context Management States**
| State ID | Entry (初期化/準備) | Exit (後処理) | Invariant (制約条件) |
| :--- | :--- | :--- | :--- |
| **Ctx.Idle** | `shadow = null; status = "READY"` | - | `_activeContext != null` |
| **Ctx.Busy** | `status = "Processing"` | - | - |
| **Ctx.Tx** | `status = "In Transaction"` | - | `_shadowContext != null` |
| **Ctx.Rollback** | `status = "Rolling Back"` | `shadow = null` | - |

**Table B: Context Management Transitions**
| Priority | Source | Trigger | Guard (条件) | Action (具体的な実装手順) | Target |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **High** | `Ctx.Idle` | `BEGIN` | - | `_shadowContext = _deepCopy(_activeContext)` | **Ctx.Tx** |
| **High** | `Ctx.Tx` | `COMMIT` | - | `_shadowContext = null` | **Ctx.Idle** |
| **High** | `Ctx.Tx` | `ROLLBACK` | `_shadowContext != null` | `_activeContext = _deepCopy(_shadowContext)` | **Ctx.Rollback** |
| **Default** | `Ctx.Rollback` | `auto` | - | - | **Ctx.Idle** |
| **Default** | `Ctx.Idle` | `UPDATE` | - | `_activeContext[key] = _deepCopy(val)` | **Ctx.Busy** |
| **Default** | `Ctx.Busy` | `auto` | - | - | **Ctx.Idle** |
| **Interrupt**| `*` | `RESTORE`| `snapshot != null` | `_activeContext = _deepCopy(snapshot)` | **Ctx.Idle** |

---

### **2. メソッド詳細仕様**

AIは以下のアルゴリズムを忠実にJavaScriptへ変換しなければならない。簡略化は一切禁止する。

#### **2.1 constructor(initialData)**

* **初期化手順**:
1. 引数 `initialData` を `_deepCopy` し、`_activeContext` に格納する。
2. `_shadowContext` を `null` で初期化する。



#### **2.2 beginTransaction() / commit() / rollback()**

* **トランザクション保護**:
* `beginTransaction`: 現在の `_activeContext` を完全に複製してバックアップ（`_shadowContext`）を作成する。
* `rollback`: バックアップが存在する場合、バックアップ**そのものではなく、その複製**を `_activeContext` に書き戻す。これにより、復元後も参照が完全に切れていることを保証する。



#### **2.3 updateAll(data) / update(key, val)**

* **一括更新ロジック**:
1. 引数 `data` の全キーをループする。
2. 各値を個別に `_deepCopy` してから `_activeContext` にマージする。`ctx[key] = data[key]` のような直接代入は厳禁とする。



#### **2.4 getSnapshot()**

* **役割**: 外部（UIやSimulator）へ現在の変数値を提供する。
* **制約**: 必ず `_deepCopy(_activeContext)` を返すこと。外部での変更が内部データに影響を及ぼす（参照汚染）のを防ぐため、生データを返してはならない。

#### **2.5 _deepCopy(obj)**

* **実装方式**: `JSON.parse(JSON.stringify(obj))` 方式を採用する。
* **例外処理**: `undefined` が渡された場合は `undefined` を返し、JSON化エラー時は元の値を安全にフォールバックするガードを入れる。

---

### **3. データ構造の定義**

| プロパティ名 | 型 | 説明 |
| --- | --- | --- |
| `_activeContext` | `Object` | 現在実行中のシミュレーションで使用される動的な変数セット。 |
| `_shadowContext` | `Object | null` | トランザクション開始時のバックアップ。ロールバック用。 |

---

### **4. 異常系・信頼性設計（タイムアウト/ループへの対応）**

Step 3 自体は純粋なデータ管理に徹するが、Step 4/5 のタイムアウト機能を支えるための以下の運用ルールを設ける。

* **タイムアウト用変数の予約**: `_activeContext` 内の変数名として、システム予約語（例: `__step_count__`）がセットされた場合も、他の変数と同様に複製・保存を行う。
* **ディープコピーの堅牢化**: シミュレーションが高速に実行される場合、`_deepCopy` がボトルネックにならないよう、プリミティブ型（数値、文字列、真偽値）のみを扱うことを設計上の前提とする。複雑なネスト構造を持つオブジェクトが `_activeContext` に混入した場合は、Step 7（Analyzer）にて事前に警告を出す。


---
### **Step 4: HACE Simulator (AtomicSimulator) 詳細設計仕様書**

本ドキュメントは、**D+++ Visualizer V52** における実行エンジン（HACE Simulator）の詳細仕様を定義する 。V51の「起動時ループ対策」を継承しつつ、V52の目玉機能である「カバレッジ計測」および「実行タイムアウト（無限ループ検知）」、さらに**「階層構造を考慮した厳密なワイルドカード判定」**を実装するためのSSOT（単一の真実の源）として機能する 。

---

### **1. 内部ロジックモデル (V27形式 D+++定義)**

シミュレーター内部の状態遷移（HACEサイクル）をD+++で定義する 。実装担当AIは、`step()` メソッド内の分岐および状態遷移をこの表に従って実装しなければならない 。

**Table A: HACE Cycle States**
| State ID | Entry (処理内容) | Exit (後処理) | Invariant (監視条件) |
| :--- | :--- | :--- | :--- |
| **HACE.Idle** | `simState="Idle"` | `beginTransaction()` | - |
| **HACE.Exiting** | `runExitAction()` | - | - |
| **HACE.Acting** | `runTransitionAction()`| - | - |
| **HACE.Updating**| `updateCurrentState()` | - | `stateExists == true` |
| **HACE.Entering**| `runEntryAction(); recordVisited()` | - | `depth < 10` |
| **HACE.Checking**| `checkInvariants()` | `commit()` | `invOK == true` |
| **HACE.Error** | `rollback(); status="LOCK"` | - | - |

**Table B: HACE Cycle Transitions**
| Priority | Source | Trigger | Guard (条件) | Action (データ処理) | Target |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **High** | `HACE.Idle` | `EV_TRIG` | - | `currentTransition = t` | **HACE.Exiting** |
| **Default** | `HACE.Exiting` | `auto` | - | - | **HACE.Acting** |
| **Default** | `HACE.Acting` | `auto` | - | - | **HACE.Updating** |
| **Default** | `HACE.Updating`| `auto` | - | - | **HACE.Entering** |
| **Default** | `HACE.Entering`| `auto` | `hasChild == true` | `currentState = childId` | **HACE.Entering** |
| **Default** | `HACE.Entering`| `auto` | `hasChild == false`| - | **HACE.Checking** |
| **Default** | `HACE.Checking`| `auto` | `invOK == true` | - | **HACE.Idle** |
| **High** | `HACE.Checking`| `auto` | `invOK == false`| `lastError = "Inv"` | **HACE.Error** |
| **Interrupt**| `*` | `EV_FAIL` | - | `rollback()` | **HACE.Error** |

---

### **2. データ構造の定義**

V52で追加されるカバレッジ記録用プロパティを含む 。

| プロパティ名 | 型 | 説明 |
| --- | --- | --- |
| `this.simState` | `String` | HACEサイクルの現在のフェーズ（"Idle", "Exiting"等） 。

 |
| `this.coverage` | `Object` | <br>**(V52追加)** カバレッジ記録コンテナ 。

 |
| `├ visitedStates` | `Set<String>` | 通過したState IDの集合 。

 |
| `└ firedTransitions` | `Set<String>` | 実行された遷移のユニークキー（`src->tgt:trig`）の集合 。

 |
| `this.history` | `Array` | Undo用の履歴。StateIDとContextのスナップショットを保持 。

 |

---

### **3. メソッド詳細仕様**

#### **3.1 constructor(states, ctxManager, evaluator, callbacks)**

* 
**初期化手順**: 


1. V51の基本プロパティを初期化 。


2. 
**V52追加**: `this.coverage` オブジェクトを初期化し、`visitedStates` と `firedTransitions` を空の `Set` で作成する 。





#### **3.2 boot() - 起動シーケンス**

* 
**役割**: 初期状態（RootからLeafまでの自動突入）を完了させ、`Idle` にする 。


* 
**タイムアウト実装**: 


1. 
`safetyCounter = 0` で開始 。


2. 
`while` ループ内で `step()` を呼び出す 。


3. 
`safetyCounter` が **100** を超えた場合、`Error("Boot Infinite Loop")` をスローする 。





#### **3.3 trigger(transition)**

* 
**カバレッジ記録**: 


1. 遷移実行直前に `this.coverage.firedTransitions.add(key)` を実行 。


2. キー形式は `src->tgt:trigger` とする 。





#### **3.4 _handleEntering() - 入力・自動突入**

* 
**カバレッジ記録**: 


1. 現在の `currentStateID` を `this.coverage.visitedStates` に追加する 。




* 
**階層突入（Auto-Entry）**: 


1. 現在の状態に子状態が存在するか `stateMap` を走査 。


2. 子状態（例: `Parent.Child`）があれば `currentStateID` を更新し、再帰的に自身を呼び出す 。


3. 
**再帰深度制限**: 深度（depth）が **10** を超えた場合は無限ループとみなしエラーをスローする 。





#### **3.5 _findTransition() - 階層型ワイルドカード判定 (V52重要修正)**

AIは以下の接頭辞一致ロジックを**省略せずに**実装しなければならない 。

* 
**判定条件**: `srcPattern` が `.*` で終わる場合、以下の論理式を用いてマッチングを判定する 。


1. `prefix = srcPattern.slice(0, -2)`
2. 
**境界条件**: `cleanCur === prefix || cleanCur.startsWith(prefix + ".")` 




* これにより、`USB.*` が `USB` 自体、および `USB.Connected` 等のすべての子状態に正しくマッチすることを保証する 。





#### **3.6 _recursiveCheck(stateId) - インバリアント検証**

* 
**役割**: 現在の状態からRoot状態まで遡り、すべての `invariant` を評価する 。


* 
**手順**: 


1. 
`evaluator.evaluateRHS` を使用 。


2. 1つでも `false` があれば `false` を返し、`Checking` フェーズから `Error` 状態へ遷移させる 。





---

### **4. 異常系・信頼性設計（タイムアウトと安全装置）**

実装担当AIは以下の制約を「簡略化せず」にコードへ組み込まなければならない 。

* 
**無限ステップ保護**: `step()` メソッドが同一トリガー内で意図せずループするのを防ぐため、`Checking` フェーズ到達までに必要なステップ数が異常に多い場合は強制停止するロジックを検討する 。


* 
**トランザクション整合性**: エラー発生（`_handleFailure`）時には、必ず `ctxManager.rollback()` を呼び出し、変数の状態を遷移開始前に戻す 。


* 
**ターゲット不在の検証**: `_handleUpdating()` において、遷移先状態 ID が `stateMap` に存在しない場合は、即座に例外をスローし `Error_Lock` へ移行させる 。



---



### **Step 5: Batch Runner (TestRunner) 詳細設計仕様書**

本ドキュメントは、**D+++ Visualizer V52** におけるテスト実行エンジン（Batch Runner）の詳細仕様を定義する。V51の「自動遷移任せ（Auto-Chain）」のテスト方式を刷新し、V52の目玉である**「シナリオベーステスト（実行手順の分離）」**と**「カバレッジ集計」**を厳密に実装するためのSSOT（単一の真実の源）として機能する。

---

### **1. 内部ロジックモデル (V27形式 D+++定義)**

テストスイート全体の実行フローをD+++で定義する。実装担当AIは、`runAll` および `_runSingleCase` メソッドの制御構造をこの表に従って実装しなければならない。

**Table A: Test Suite Execution States**
| State ID | Entry (初期化/集計準備) | Exit (後処理) | Invariant (監視条件) |
| :--- | :--- | :--- | :--- |
| **Test.Idle** | `results = []; totalCoverage = new Set()` | - | - |
| **Test.Setup** | `sim.reset(); parseScenario(tc)` | `beginTransaction()` | `tc != null` |
| **Test.Scenario** | `executeNextTrigger()` | - | `scenarioDepth < 100` |
| **Test.AutoChain** | `findAndFireAutoTrigger()` | - | `chainCount < 50` |
| **Test.Verify** | `compareActualWithExpected()` | `commit(); pushResult()` | - |
| **Test.Summary** | `aggregateCoverage(); updateUI()` | - | - |

**Table B: Test Suite Transitions**
| Priority | Source | Trigger | Guard (条件) | Action (データ処理) | Target |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **High** | `Test.Idle` | `RUN_ALL` | `testCases.length > 0` | `tc = testCases[0]` | **Test.Setup** |
| **Default** | `Test.Setup` | `auto` | `hasScenario == true` | `trig = scenario.shift()` | **Test.Scenario** |
| **Default** | `Test.Setup` | `auto` | `hasScenario == false`| - | **Test.AutoChain** |
| **Default** | `Test.Scenario`| `auto` | `scenario.length > 0` | `trig = scenario.shift()` | **Test.Scenario** |
| **Default** | `Test.Scenario`| `auto` | `scenario.length == 0` | - | **Test.Verify** |
| **Default** | `Test.AutoChain`| `auto` | `foundAuto == true` | `simulator.trigger(t)` | **Test.AutoChain** |
| **Default** | `Test.AutoChain`| `auto` | `foundAuto == false`| - | **Test.Verify** |
| **Default** | `Test.Verify` | `auto` | `hasNextCase == true` | `tc = testCases.next()` | **Test.Setup** |
| **Default** | `Test.Verify` | `auto` | `hasNextCase == false`| - | **Test.Summary** |
| **Interrupt**| `*` | `EV_TIMEOUT`| `depth > MAX` | `status = "TIMEOUT"` | **Test.Verify** |

---

### **2. メソッド詳細仕様**

#### **2.1 runAll(testCases, states, transitions)**

* **役割**: 全テストケースを順次実行し、結果とカバレッジを返す。
* **実装手順**:

1. 結果格納用配列 `results` と、全ケース統合用カバレッジ `totalCoverage` を初期化する。
2. `testCases` をループし、`_runSingleCase` を呼び出す。
3. 各ケース実行後、`simulator.coverage` から得られた通過State/遷移を `totalCoverage` にマージ（Setの結合）する。
4. 最終的な `results` と `totalCoverage` をオブジェクトとして返す。

#### **2.2 _runSingleCase(testCase, states, transitions)**

* **役割**: 単一のテストケースを「シナリオベース」または「オートチェーン」で実行する。
* **V52における必須ロジック**:

1. **初期化**: `Step 4 Simulator` をインスタンス化し、`testCase.initialState` から `boot()` を実行する。
2. **シナリオ解析**: `testCase.scenario`（配列/文字列）をパースする。
3. **実行エンジン選択**:

* **シナリオあり**: シナリオ配列のトリガーを順次 `simulator.trigger()` に投入する。各トリガー後、Simulatorが `Idle` になるまで `step()` をループさせる。
* **シナリオなし (互換モード)**: V51同様、最初の有効な遷移を発火させた後、"auto" トリガーが尽きるまで連鎖実行する。

4. **検証 (Verdict)**:

* 実行後の `currentStateID` と `testCase.expectedTarget` を比較する。
* **Fuzzy Match (階層的整合性判定の厳密定義)**:
状態IDの階層構造（ドット区切り）を考慮し、実装担当AIは以下の**3つの境界条件すべて**を網羅する論理式を「省略せず」に実装しなければならない。
* **a) 完全一致**: `actual === expected` である場合。これは最も基本的な成功条件である。
* **b) 親状態指定による子孫マッチ (Parent-to-Child)**: 期待される状態（expected）が親であり、実際の到達状態（actual）がその直下の子、または孫以下の孫状態である場合。
* **具体例**: `expected: "USB"` に対し、`actual: "USB.Connected"` または `actual: "USB.Connected.Ready"` は **PASS** と判定する。
* **判定ロジック**: `actual.startsWith(expected + ".")` が真であること。


* **c) 子状態指定による親マッチ (Child-to-Parent)**: 期待される状態（expected）が具体的（子）であり、実際の到達状態（actual）がその包含関係にある親状態である場合。これは、抽象化されたエラー状態や上位の待機状態への到達を許容するために実装する。
* **具体例**: `expected: "USB.Connected"` に対し、`actual: "USB"` は **PASS** と判定する。
* **判定ロジック**: `expected.startsWith(actual + ".")` が真であること。




* **判定結果の確定**: 上記 (a), (b), (c) のいずれかが真であり、かつシミュレーターが `Idle` 状態（正常停止）であれば `status: "PASS"` とし、それ以外を `status: "FAIL"` とする。

---

### **3. タイムアウト・無限ループ検知 (信頼性設計)**

AIが「無限に待ち続ける」実装をすることを防ぐため、以下の数値制限を設計書で固定する。

* **MAX_CHAIN (連鎖制限)**: 「auto」トリガーの連続発火回数は最大 **50回** とする。これを超えた場合は `Infinite auto-trigger loop` としてエラーをスローする。
* **MAX_STEPS (ステップ制限)**: 1つの遷移（HACEサイクル）が完了するまでの `step()` 呼び出し回数は最大 **500回** とする。これを超えた場合は `Simulator Infinite loop` として強制遮断する。
* **SCENARIO_LIMIT**: シナリオとして投入できるトリガー数は最大 **100個** とする。

---

### **4. カバレッジ集計仕様**

* **集計対象**:

1. `visitedStates`: Simulatorが `Entering` フェーズで記録したState ID。
2. `firedTransitions`: Simulatorが `trigger()` 時に記録した遷移キー。

* **UIControllerへの返却**:
* 集計された `Set` オブジェクトをそのまま返し、Step 6（UI）でのハイライト描画に利用可能とする。

---

### **5. 異常系処理**

* **SKIP判定**: 初期状態からの遷移が一切見つからず、かつシナリオも空の場合は `status: "SKIP"` を返し、理由を `reason` に明記する。
* **ERROR_LOCK対応**: Simulatorが実行中に `Error_Lock` 状態になった場合、その時点での状態を `actual` とし、`status: "FAIL"` と判定、`simulator.lastError` を理由に添付する。

---

### **Step 6.1: UI Controller (UIRenderer) 詳細設計仕様書**

本ドキュメントは、**D+++ Visualizer V52** における表示レイヤー（UIRenderer）の詳細仕様を定義する。V51で発生していた「ViewとControllerの結合不全」および「UI要素の非表示」を完全に解消し、V52の主要機能である**「カバレッジの視覚化」**と**「リアルタイム・ダッシュボード更新」**を厳密に実装するためのSSOT（単一の真実の源）として機能する。

---

### **1. 内部ロジックモデル (V27形式 D+++定義)**

UIの描画更新サイクルをD+++で定義する。AIは、シミュレーターからの通知（Callback）を受けて実行される描画処理をこのロジックに忠実に実装しなければならない。

**Table A: Rendering Pipeline States**
| State ID | Entry (描画準備) | Exit (DOM反映) | Invariant (保持条件) |
| :--- | :--- | :--- | :--- |
| **Render.Idle** | `isDrawing = false` | - | - |
| **Render.Dashboard** | `status = "Updating Metrics"` | `refreshCounters()` | `sim != null` |
| **Render.Mermaid** | `status = "Generating SVG"` | `bindSvgEvents()` | `data.states.length > 0` |
| **Render.Coverage** | `status = "Applying Styles"` | `updateProgressBar()` | `coverageSet != null` |
| **Render.Vars** | `status = "Syncing Variables"` | `applyFlashEffect()` | `ctx != null` |
| **Render.Locked** | `status = "Awaiting Render"` | `unlockUI()` | `awaitingAsync == true` |

**Table B: Rendering Sequence Transitions**
| Priority | Source | Trigger | Guard (条件) | Action (具体的な描画手順) | Target |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **High** | `Render.Idle` | `EV_SIM_UPDATE` | - | `updateLEDs(); updateStatusText()` | **Render.Dashboard** |
| **Default** | `Render.Dashboard` | `auto` | `hasCoverage == true` | `colorNodes(); colorEdges()` | **Render.Coverage** |
| **Default** | `Render.Coverage` | `auto` | - | `updateVariableTable()` | **Render.Vars** |
| **Default** | `Render.Vars` | `auto` | - | - | **Render.Idle** |
| **High** | `Render.Idle` | `EV_DATA_PARSED`| - | `lockUI(); buildMermaidCode()` | **Render.Locked** |
| **High** | `Render.Locked` | `EV_RENDER_READY`| - | `renderSvg(); // await含む` | **Render.Mermaid** |
| **Default** | `Render.Mermaid` | `auto` | - | `bindJumpToLine()` | **Render.Idle** |

---

### **2. メソッド詳細仕様**

#### **2.1 updateDashboard(sim)**

* **役割**: シミュレーターの状態（HACEサイクル）と統計情報をUIに反映する。
* **実装手順**:

1. **ステータス表示**: `#sim-status` のテキストを `sim.simState` に応じて更新し、色を変更する（Error_Lock時は赤、Idle時は緑、Busy時は青）。
2. **LED操作**: `.led-label` の全 `active` クラスを削除し、`#phase-[simState]` にのみ付与する。
3. 
**カバレッジ更新 (V52重要)**: `this.ui.calculateCoverage()` を呼び出し、結果（%）を `#dashboard-coverage` と `#coverage-progress`（width）に反映する 。


4. **Undo制御**: `sim.history` の有無に基づき、`#btn-sim-undo` の `disabled` 属性を切り替える。
5. **Busyロック**: `sim-busy` クラスを `body` にトグルし、実行中のエディタ操作を制限する。

#### **2.2 renderMermaid()**

* **役割**: D+++定義からMermaid図を生成・描画する。
* **カバレッジ視覚化ロジック (V52拡張)**:

1. **Node生成**: `data.states` を走査。通過済み（`visitedStates` に存在）なら `.cov-visited` クラスを、現在地なら `.state-active` クラスを付与する。
2. **Edge生成**: `data.transitions` を走査。通過済み（`firedTransitions` に存在）なら強調表示、未通過なら `.cov-unvisited`（赤・点線）を適用するためのメタデータをラベルに埋め込む。
3. **非同期描画**: `mermaid.render` を `await` で呼び出し、生成されたSVGを `#diagram` に注入する。
4. **イベント束縛**: 描画後のSVG要素に対し、クリックで該当行へジャンプする `bindSvgEvents` を実行する。

#### **2.3 renderVariableTable(ctx)**

* **役割**: 現在の変数値と操作用入力フォームを描画する。
* **V52の信頼性設計**:
* **型判定**: `this.ui.varMeta` に基づき、`boolean`（チェックボックス）、`number`（スライダー＋数値入力）、`text` を出し分ける。
* 
**スライダー同期**: `oninput` イベントでリアルタイムに値をシミュレーターへ送り、変更があった行には `flashVariableRow` を適用して視覚的に強調する 。



---

### **3. UI/DOM バインディング仕様 (SSOT)**

AIがID名やクラス名を間違えないよう、操作対象を固定する 。

| 操作対象ID | プロパティ/クラス | タイミング | 視覚効果 |
| --- | --- | --- | --- |
| `#dashboard-coverage` | `textContent` | シミュレーション毎ステップ | パーセンテージ表示 |
| `#coverage-progress` | `style.width` | シミュレーション毎ステップ | プログレスバー伸長 |
| `#phase-[phase]` | `.active` | HACEサイクル毎 | LED点灯 |
| `[id*="node-id"]` | `.state-active` | 状態遷移完了時 | 背景：エメラルド色 |
| `.edgeLabel` | `.edge-hover-active` | クイックアクションHover時 | 枠線：オレンジ色 |
| `tr.result-FAIL` | `background` | テスト完了時 | 背景：薄赤色 |

---

### **4. 異常系・フィードバック設計**

* **描画タイムアウト**: Mermaidの描画が一定時間（3秒）以上完了しない場合、エラーをコンソールに出力し、UI上に「Render Error」のトーストを表示して無限待機を防ぐ。
* **サニタイズ**: ラベル表示時のHTMLエスケープ（`escapeHtml`）を徹底し、D+++定義内の記号によるUI崩れを防止する。
* 
**参照不全の回避**: `document.getElementById` の戻り値が `null` の場合に備え、すべてのDOM操作前に存在チェック（Optional Chaining）を行うことを義務付ける 。



#### **4.2 Mermaid描画とイベント束縛の完全同期手順 (V52重要修正：SSOT)**

シミュレーションの進行とSVGの描画完了タイミングの不一致によるイベント配線失敗を根絶するため、AIは以下の**「アトミック描画シーケンス」**を一切の省略なく実装しなければならない。

1. **描画前ロック (Pre-render Lock)**:
* `_renderMermaid` メソッドの開始直後に、シミュレーターの状態に関わらず `body` に `sim-busy` クラスを付与し、UI 操作を物理的にロックする。


2. **非同期描画の待機 (Awaiting async render)**:
* `const { svg } = await mermaid.render(...)` の実行を必ず `await` し、Promise が解決されるまで以降のステップへ進ませない。


3. **DOM注入後の即時配線 (Post-injection Binding)**:
* `this.els.mermaidDiv.innerHTML = svg` を実行した**直後の行**で、必ず `this._bindSvgEvents()` を呼び出す。
* この際、SVG が DOM 内に存在することを `querySelector` で確認し、存在しない場合は再試行（最大3回、100ms間隔）するガードロジックを含める。


4. **ハイライトの復元 (Highlight Restoration)**:
* イベント束縛完了後に `this._highlightActiveElements(this.simulator)` を実行し、描画されたばかりの新しい SVG 要素に対して現在の状態を反映させる。


5. **描画後ロック解除 (Post-render Unlock)**:
* 上記の「SVG生成 → DOM注入 → イベント束縛 → ハイライト反映」がすべて例外なく完了した後にのみ、`Render.Idle` への遷移（または `sim-busy` の解除）を許可する。



AIがこの順序を入れ替えたり、`await` を削除して「バックグラウンドで描画させる」といった簡略化を行うことは、V52の品質基準に照らして契約違反（仕様不備）とみなす。

---

### **Step 6.2: Sim Controller (Logic Control Layer) 詳細設計仕様書**

本ドキュメントは、**D+++ Visualizer V52** におけるシミュレーション制御レイヤー（SimController）の詳細仕様を定義する。V51で実装されていたオートプレイ制御やバッチテスト実行ロジックを整理し、**「手動操作と自動実行の完全な排他制御（SSOT）」**および**「カバレッジ情報の集約」**を厳密に実装するためのSSOT（単一の真実の源）として機能する。

---

### **1. 内部ロジックモデル (V27形式 D+++定義)**

シミュレーション制御のライフサイクルと、UIイベントのハンドリングロジックを定義する。

**Table A: Simulation Control States**
| State ID | Entry (初期化/タイマー設定) | Exit (停止処理) | Invariant (保持条件) |
| :--- | :--- | :--- | :--- |
| **SimCtrl.Idle** | `stopAutoPlay()` | - | `playInterval == null` |
| **SimCtrl.Booting** | `sim.boot()` | - | `sim != null` |
| **SimCtrl.Ready** | `status = "READY"` | - | - |
| **SimCtrl.AutoRunning** | `playInterval = setInterval()` | `clearInterval()` | `playSpeed >= 100` |
| **SimCtrl.BatchTesting** | `stopAutoPlay(); runAll()` | - | `testTable.updating == true` |

**Table B: Simulation Control Transitions**
| Priority | Source | Trigger | Guard (条件) | Action (具体的な制御手順) | Target |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **High** | `SimCtrl.Idle` | `btn_start` | - | `initSimulator(); mergeContext()` | **SimCtrl.Booting** |
| **Default** | `SimCtrl.Booting` | `auto` | `bootComplete == true` | `updateUI()` | **SimCtrl.Ready** |
| **High** | `SimCtrl.Ready` | `btn_play` | `simState != "Error_Lock"` | `startTimer()` | **SimCtrl.AutoRunning** |
| **High** | `SimCtrl.AutoRunning`| `btn_pause` | - | `stopTimer()` | **SimCtrl.Ready** |
| **Interrupt**| **SimCtrl.AutoRunning**| **btn_manual_trig**| - | **this.stopAutoPlay(); // 強制停止** | **SimCtrl.Ready** |
| **Default** | `SimCtrl.AutoRunning`| `EV_TICK` | `simState == "Idle"` | `simulator.step()` | **SimCtrl.AutoRunning** |
| **High** | `SimCtrl.AutoRunning`| `EV_ERROR` | `simState == "Error_Lock"` | `stopTimer(); toast("Locked")` | **SimCtrl.Idle** |
| **High** | `*` | `btn_test` | - | `runBatchTest()` | **SimCtrl.BatchTesting** |
| **Default** | `SimCtrl.BatchTesting`| `auto` | `complete == true` | `renderCoverage()` | **SimCtrl.Ready** |

---

### **2. メソッド詳細仕様**

#### **2.1 startSimulation()**

* **役割**: シミュレーターを新規インスタンス化し、初期変数を適用して起動する。
* **実装手順**:
1. 現在実行中のオートプレイを停止する（`stopAutoPlay()`）。
2. UI上のカバレッジ履歴をクリアする（`ui.coverageSet.clear()`）。
3. ソースコードから抽出した変数デフォルト値と、UIの `initial-context` 入力値をマージする。
4. `AtomicSimulator` を作成し、コールバックとして `updateSimUI` を登録する。
5. `simulator.boot()` を実行し、定常状態（Idle）になるまで初期化を進める。



#### **2.2 startAutoPlay() / stopAutoPlay()**

* **役割**: 一定間隔での自動ステップ実行を制御する。
* 
**排他制御の厳格化 (V52重要)**: 


* 
**手動介入ルール**: **オートプレイ実行中にユーザーがクイックアクション（手動トリガー）やステップ実行ボタンをクリックした場合、実装は直ちに `this.stopAutoPlay()` を呼び出し、自動実行を解除しなければならない** 。これを無視して自動と手動を並行させることは、状態の不整合を招くため厳禁とする 。


* **自動停止条件**: シミュレーターが `Error_Lock` 状態に陥った場合、または次の遷移先が存在しない（Deadlock状態の）場合、タイマーを自動的に破棄しなければならない。



#### **2.3 runBatchTest()**

* **役割**: 全テストケースを一括実行し、結果をUIに反映する。
* **実装詳細**:
1. 実行前にオートプレイを停止する。
2. `TestRunner.runAll()` を呼び出し、全ケースの成否とカバレッジデータを取得する。
3. **UI反映**: `#test-body` に結果テーブルを描画し、FAILしたケースの `reason` を詳細に表示する。
4. **カバレッジ同期**: テスト結果から得られた `visitedLines` を `ui.coverageSet` に統合し、レンダラーにMermaid図の再描画を依頼する。



---

### **3. インターフェース定義 (Simulator ↔ UI)**

* **updateSimUI(sim)**: シミュレーターからの更新通知を受けて実行される。
* 状態情報のレンダラーへの委譲（Dashboard, QuickActions, VariableTable, Highlights）。
* **カバレッジ追跡**: 実行された遷移の `lineIndex` を `ui.coverageSet` に追加し、エディタを該当行へスクロールさせる（`jumpToLine`）。



---

### **4. 異常系・信頼性設計（タイムアウトと排他）**

* **操作ロック**: シミュレーションが `Idle` 以外のフェーズ（Exiting/Acting等）にある間、新たな `trigger` や `step` 命令を受け付けないガード条件をメソッド先頭に実装する。
* **オートプレイ・タイムアウト**: 万が一シミュレーターのステップ処理が応答しなくなった場合に備え、`setInterval` 内で実行時間を監視し、異常に長い処理時間を要した場合はオートプレイを強制終了する。
* **メモリリーク防止**: `stopAutoPlay` 時には必ず `playInterval` が `null` であることを確認し、タイマーの二重起動やリソースの未開放を防止する。

---
#### **5. 無限ループ検知時の UI フィードバック**

万が一シミュレーターのステップ処理が応答しなくなった場合、または安全装置が働いた場合に備え、以下の手順を実装しなければならない。

1. **視覚的警告（トースト通知）**:
* Step 4 や 5 で定義した `safetyCounter` によって実行が遮断された際、単に停止するのではなく、**「無限ループが検知されたため実行を強制停止しました」**という警告トーストを `#toast` に表示すること。


2. **問題箇所のハイライト**:
* ループが発生した際、最後に実行されていた遷移（`currentTransition.lineIndex`）をエディタ上で強調表示（`jumpToLine`）し、ユーザーが即座に論理ミスを修正できるように計らうこと。


3. **オートプレイの物理遮断**:
* 検知と同時に `stopAutoPlay()` を強制実行し、`playInterval` を確実に `null` に戻すこと。


---

### **Step 6.3: UI Controller (Main Orchestrator) 詳細設計仕様書**

本ドキュメントは、**D+++ Visualizer V52** における全体統括モジュール（UIController）の詳細仕様を定義する。各サブコントローラー（Renderer, SimController）およびコアロジック（Parser, Evaluator, TestRunner）のライフサイクルを管理し、システム全体の整合性を保証する「真実の源（SSOT）」として機能する。実装担当AIがモジュール間の責務を混同したり、イベント配線を省略したりすることを防ぐため、**V27形式のD+++モデル**を用いて動作を厳密に定義する。

---

### **1. 内部ロジックモデル (V27形式 D+++定義)**

UIControllerが管理するアプリケーション全体の高レベルな状態遷移を定義する。

**Table A: Application Lifecycle States**
| State ID | Entry (初期化/ブート) | Exit (後処理) | Invariant (保持条件) |
| :--- | :--- | :--- | :--- |
| **App.Boot** | `this._cacheElements();` | `this.init();` | `window.ui != null` |
| **App.Ready** | `status = "READY"` | - | - |
| **App.Idle** | `this.onEditorInput()` | `clearTimeout(debounce)` | `editor.value != null` |
| **App.Syncing** | `this._parseAndRender()` | `this.renderer.render()` | `data.isSynchronized == true` |
| **App.Error** | `console.error(); toast("Error")` | - | - |

**Table B: Application Control Transitions**
| Priority | Source | Trigger | Guard (条件) | Action (具体的な指示手順) | Target |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **High** | `App.Boot` | `DOM_LOADED` | - | `new UIRenderer(); new SimController();` | **App.Ready** |
| **Default** | `App.Ready` | `EV_INPUT` | - | `setDebounce(500ms)` | **App.Idle** |
| **Default** | `App.Idle` | `EV_TIMEOUT`| - | `this.data = parser.parse()` | **App.Syncing** |
| **High** | `App.Syncing`| `auto` | `analyzerExists == true` | `analyzer.analyzeAll()` | **App.Ready** |
| **Default** | `App.Ready` | `btn_start` | `parseOK == true` | `simCtrl.startSimulation()` | **App.Ready** |
| **Interrupt**| `*` | `EV_EXCEPTION` | - | `this.showToast("Internal Error")` | **App.Error** |

---

### **2. メソッド詳細仕様**

#### **2.1 init()**

* **役割**: アプリケーション起動時のイベントリスナーの一括登録。
* **実装手順**:
1. **エディタ監視**: `els.editor` の `input` イベントに `onEditorInput` を紐付ける。
2. **シミュレーション制御の委譲**:
* `btn-start` → `simCtrl.startSimulation()`
* `btn-step` → `simCtrl.step()`
* `btn-sim-undo` → `simCtrl.undo()`


3. **表示制御の委譲**:
* `btn-layout-td/lr` → `layout` プロパティ更新後 `renderer.renderMermaid()`
* `btn-zoom-*` → `zoom` 値更新後 `renderer.applyZoom()`


4. **バッチテスト**: `btn-run-test` クリック時にトーストを表示し、描画時間を確保するため **50ms** の `setTimeout` を経て `simCtrl.runBatchTest()` を実行する。
5. **エクスポート**: `btn-gen-cpp` / `btn-download` をそれぞれのクラス（Step 8）へ配線する。



#### **2.2 analyzeVariables()**

* **役割**: D+++定義内のすべての式を静的にスキャンし、変数値の初期化用オブジェクトを生成する。
* **解析アルゴリズム**:
1. `states` (Entry/Exit/Invariant) および `transitions` (Guard/Action) の文字列を抽出する。
2. 正規表現を用いて以下を特定する：
* **数値型**: 比較演算子（`<`, `>`, `<=`, `>=`）で使用されている変数。
* **真偽値型**: 等価比較（`==`）や論理反転（`!`）で使用されている変数。
* 
**一般変数**: その他、識別子正規表現 `/[a-zA-Z_][\w-]*/` にマッチし、予約語でないもの 。




3. 結果を `varMeta` に格納し、すべての変数を初期値 `0` または `false` で持つ `vars` オブジェクトを返す。



#### **2.3 _parseAndRender()**

* **役割**: テキストからデータ構造への変換と、解析結果の表示をトリガーする。
* **V52拡張仕様**:
1. `parser.parse()` を呼び出し、結果を `this.data` に保持する。
2. `renderer.renderMermaid()` を実行し、図を更新する。
3. 
**Strict Linter連携**: `DPlusPlusAnalyzer` が存在する場合、解析を実行し、`renderer.renderAnalysis()` を通じてガード条件内の代入（`=`）などの不備を画面に表示する 。





---

### **3. データ構造・プロパティ定義 (SSOT)**

| プロパティ名 | 型 | 説明 |
| --- | --- | --- |
| `this.data` | `Object` | 現在パース済みの `states`, `transitions`, `testCases` の集合。 |
| `this.els` | `Object` | <br>`#cacheElements` で取得されたDOM要素のキャッシュ。全サブクラスが参照する 。

 |
| `this.coverageSet` | `Set<Number>` | 現在のシミュレーションまたはバッチテストで通過した行番号（lineIndex）の集合。 |
| `this.varConfigs` | `Object` | 各変数のUI表示設定（スライダーのmin/max/step）。 |


#### **3.1. データ構造・プロパティ定義：セッション管理と破壊的操作ルール**

ユーザーの作成したモデルデータや設定（localStorage）を保護し、意図しないデータ消失事故を防ぐため、以下の規則を実装しなければならない。

1. **新規セッションの自動生成**:
* 起動時に指定されたセッションキー（またはデータ）が存在しない場合、AIは既存データを検索・復旧しようとせず、速やかに「新規セッション」として空のテンプレート（Table A/B/C の初期値）を作成しなければならない。


2. **上書き操作の明示的確認**:
* すでにデータが存在するセッションを外部ファイルのインポート等で上書きする場合、ブラウザの `window.confirm` 等を用いてユーザーの承認を得るロジックを必須とする。AIが確認なしに `localStorage.setItem` を実行することは「データ破壊」とみなす。


3. **不正フォーマットデータの救済**:
* `JSON.parse` 失敗や D+++ 定義が著しく破損している場合でも、AIは対象となる `localStorage` キーを消去（`removeItem`）してはならない。
* 「読み込み失敗」としてエラーを表示し、破損したデータはそのままに、別途「新規セッション」としてエディタを立ち上げる「退避・隔離」ロジックを実装すること。


4. **自動保存の信頼性（永続化プロトコル）**:
* エディタ入力時、デバウンス（500ms）を経て保存を行う際、パースエラーがある状態でも**テキストデータとしての保存は継続**し、ユーザーが修正作業を中断せずに済む状態を維持すること。



---

### **4. 信頼性・例外ハンドリング仕様**

* **デバウンス制御**: エディタ入力ごとに解析を走らせるとパフォーマンスが低下するため、**500ms** の待機時間を設け、連続入力中は解析をスキップする。
* **エラー隔離**: `_parseAndRender` 内で発生した例外は `try-catch` で捕捉し、コンソールに詳細を出力する。これにより、パースエラーが原因でUI全体の操作が不能になることを防ぐ。
* **DOM安全性**: `_cacheElements` において要素が存在しない場合でも、以降のメソッドで `?.` (Optional Chaining) を使用することを義務付け、ヌル参照によるクラッシュを根絶する。

---

### **Step 7: Real-time Logic Analyzer 詳細設計仕様書**

本ドキュメントは、**D+++ Visualizer V52** における静的解析モジュール（Real-time Logic Analyzer）の詳細仕様を定義する。V51の基本解析機能に加え、V52の目玉である**「Strict Linter（誤代入検知）」**および**「AI連携用コンテキスト抽出」**を厳密に実装することを目的とする。実装担当AIが推論でロジックを簡略化することを防ぐため、**V27形式のD+++モデル**をSSOT（単一の真実の源）として定義する。

---

### **1. 内部ロジックモデル (V27形式 D+++定義)**

解析実行のパイプラインと、AI連携データの生成プロセスを定義する。

**Table A: Analyzer Execution States**
| State ID | Entry (初期化/解析準備) | Exit (後処理) | Invariant (保持条件) |
| :--- | :--- | :--- | :--- |
| **Anlz.Idle** | `report = []; status = "READY"` | - | - |
| **Anlz.Linting** | `status = "Strict Linting..."` | `collectSyntaxErrors()` | `isScanningGuard == true` |
| **Anlz.Logic** | `status = "Graph Analysis..."` | `runBFS(); checkDeadlocks()` | `modelReady == true` |
| **Anlz.Conflicts** | `status = "Conflict Sampling..."` | `runSampling()` | `safetyTimeout < 200ms` |
| **Anlz.AIContext** | `status = "Building AI Data"` | `return structuredData` | `jsonSchemaReady == true` |

**Table B: Analyzer Sequence Transitions**
| Priority | Source | Trigger | Guard (条件) | Action (具体的な解析手順) | Target |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **High** | `Anlz.Idle` | `ANALYZE` | - | `this.report = []` | **Anlz.Linting** |
| **Default** | `Anlz.Linting` | `auto` | - | `checkOperatorMisuse();` | **Anlz.Logic** |
| **Default** | `Anlz.Logic` | `auto` | - | `checkReachability(); checkDeadlocks();` | **Anlz.Conflicts** |
| **Default** | `Anlz.Conflicts`| `auto` | - | `scanPotentialConflicts();` | **Anlz.Idle** |
| **High** | `Anlz.Idle` | `EXPORT_AI`| - | `data = exportAnalysisForAI()` | **Anlz.AIContext** |
| **Default** | `Anlz.AIContext`| `auto` | - | - | **Anlz.Idle** |

---

### **2. メソッド詳細仕様**

#### **2.1 runStrictLinter() (V52新規機能)**

* **役割**: ガード条件内での比較演算子（`==`）と代入演算子（`=`）の混同を検知する。
* **実装手順**:
1. 全遷移の `guard` 文字列を走査する。
2. 文字列リテラル（`"..."` や `'...'`）を除外したコード部分に対し、正規表現 **`/[^=!<>](=)[^=]/`** を適用する。
3. マッチした場合、`type: "error"`, `message: "ガード条件内での代入は禁止されています（==を使用してください）"` としてレポートに追加する。



#### **2.2 checkReachability() (幽霊状態検知)**

* **アルゴリズム**: 幅優先探索（BFS）
1. `visited` セットと探索キューを初期化し、初期状態を投入する。
2. キューから状態を取り出し、そこから遷移可能なターゲット（`target` が空なら `source`）を走査する。
3. すべての遷移（`source === "*"` を含む）を辿り、一度も訪問されなかった状態を「幽霊状態（到達不能）」として警告する。



#### **2.3 scanConflicts() (論理競合検知)**

* **サンプリング評価**:
1. 同一 `source` かつ同一 `trigger` の遷移ペアを抽出する。
2. 境界値サンプリング（`-1`, `0`, `1`, `10` 等）を用いたコンテキストを作成し、両方の `guard` が `true` になるケースを試行する。
3. **タイムアウト保護**: 1ペアの評価時間が **10ms** を超える、または全体の評価時間が **200ms** を超える場合は解析を打ち切り、解析中断の警告を出す。



#### **2.4 exportAnalysisForAI() (V52新規機能)**

* **役割**: AI（LLM）がモデルを再構築・修正するために最適な構造化データを出力する。
* **出力オブジェクト構造**:
* `meta`: ツールバージョン、生成日時。
* `stats`: 状態数、遷移数、エラー/警告数。
* `diagnostics`: 現在の解析レポート（`this.report`）。
* `modelSummary`: AIが理解しやすい `ID: Source -> Target [Trigger]` 形式の遷移リスト。



---

### **3. データインターフェース仕様 (SSOT)**

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| `this.report` | `Array<Object>` | `{ type, id, message, lineIndex }` の配列。 |
| `exportData` | `Object` | **Step 8 (Exporter)** に渡されるAI用コンテキストデータ。 |

---

### **4. 信頼性・異常系設計**

* **無限再帰保護**: 到達可能性チェックや階層構造の解析において、親が自分自身を指すなどの循環参照がある場合、探索深度が **50** を超えた時点で例外をスローし、解析を中断する。
* **評価器の隔離**: `scanConflicts` における `_quickEval` は、`eval()` を使用せず `Step 1 (SafeEvaluator)` の設計に基づき `new Function` 方式で実行し、不正なコードによるツール全体のクラッシュを防ぐ。
* **メモリ消費抑制**: 大規模な遷移表（1000行超）の場合、競合スキャンは全ペアではなく、同一ステート内のグループに限定して実行することを義務付ける。

#### **4.1. 信頼性・異常系設計：診断レポートへの強制記録義務**

1. **評価失敗のロギング**:
* `SafeEvaluator` で例外が発生した場合、その内容を `diagnostics` に `error` レベルとして **1 件以上必ず記録**しなければならない。


2. **記録内容の冗長化**:
* 記録には、失敗した行番号（`lineIndex`）と、JavaScript エンジンが返したエラーメッセージの全文（例: `ReferenceError: x is not defined`）をそのまま含めること。


3. **不備の可能性（警告）**:
* 識別子の中にマイナス記号が含まれ、かつその識別子が未定義変数である場合、「空白不足による減算式の記述ミス」の可能性があるとして警告を出すロジックを実装すること。



---

### **Step 8: Export & Integration 詳細設計仕様書**

本ドキュメントは、**D+++ Visualizer V52** における外部出力および統合モジュール（DPlusPlusExporter）の詳細仕様を定義する。V51の「C++出力」「SVG保存」に加え、V52の最重要機能である**「AI専用解析レポート（JSON）出力」**を厳密に実装することを目的とする。

「関心の分離」に基づき、Step 7（Analyzer）が生成した解析データを、本モジュールが適切なフォーマットへ変換する責務を負う。実装担当AIがロジックを簡略化しないよう、**V27形式のD+++モデル**をSSOT（単一の真実の源）として定義する。

---

### **1. 内部ロジックモデル (V27形式 D+++定義)**

出力処理のセレクターと、各フォーマット生成のシーケンスを定義する。

**Table A: Export Logic States**
| State ID | Entry (出力準備) | Exit (完了通知) | Invariant (保持条件) |
| :--- | :--- | :--- | :--- |
| **Export.Idle** | `status = "READY"` | - | - |
| **Export.JSON** | `status = "Generating AI Context"` | `copyToClipboard()` | `json.isValid == true` |
| **Export.CPP** | `status = "Generating C++ Code"` | `showModal()` | `cpp.isComplete == true` |
| **Export.SVG** | `status = "Serializing SVG"` | `triggerDownload()` | `svgElement != null` |
| **Export.Finish** | `showToast("Export Complete")` | - | - |

**Table B: Export Action Transitions**
| Priority | Source | Trigger | Guard (条件) | Action (具体的な出力手順) | Target |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **High** | `Export.Idle` | `EV_AI_REQ` | `data != null` | **generateAiJson(data, report)** | **Export.JSON** |
| **Default** | `Export.Idle` | `EV_CPP_REQ` | - | `generateCpp(data)` | **Export.CPP** |
| **Default** | `Export.Idle` | `EV_SVG_REQ` | - | `downloadSvg()` | **Export.SVG** |
| **Default** | `Export.JSON` | `auto` | - | `toast("JSON Copied")` | **Export.Finish** |
| **Default** | `Export.CPP` | `auto` | - | `toast("C++ Generated")` | **Export.Finish** |
| **Default** | `Export.Finish`| `auto` | - | - | **Export.Idle** |
| **Interrupt**| `*` | `EV_ERROR` | - | `toast("Export Failed")` | **Export.Idle** |

---

### **2. メソッド詳細仕様**

#### **2.1 generateAiJson(data, report) (V52新規機能)**

* **役割**: AI（LLM）がモデルを自律修正するための詳細な文脈を生成する。
* **実装手順**:

1. `meta` 情報（ツール名、日時）をセットする。
2. `stats` 情報（状態数、遷移数、エラー数）を算出する。
3. Step 7 から受け取った `report`（診断結果）を `diagnostics` キーに格納する。
4. `modelSummary` として、状態IDのリストと、`source -> target [trigger]` 形式の遷移文字列配列を生成する。
5. 結果を `JSON.stringify(obj, null, 2)` で整形し、クリップボードへコピーする。

#### **2.2 generateCpp(data)**

* **役割**: 状態遷移モデルをプロダクションレベルの C++17 コードに変換する。
* **コード生成ロジック**:

1. **Enumクラス生成**: 階層化された状態IDを `_flattenState`（`.`を`_`に置換）して列挙型を作成する。
2. **ハンドラ生成**: `handleEvent` メソッド内に `switch (m_currentState)` 文を構築する。
3. **ガード・アクション反映**: `if (event == "trigger" && checkGuard("guard"))` の形式で、各遷移条件とアクション（コメント形式）を記述する。
4. **Entry/Exit呼び出し**: 遷移発生時に、遷移元の `onExit` および遷移先の `onEntry` メソッド呼び出しコードを挿入する。

#### **2.3 downloadSvg()**

* **役割**: Mermaid.js が生成した現在のSVG図面をファイルとして保存する。
* **実装手順**:

1. DOM上の `#diagram svg` 要素を取得する。
2. `XMLSerializer` を用いて文字列化し、XML宣言 `<?xml...?>` を付与する。
3. `Blob` オブジェクトを作成し、`URL.createObjectURL` を経由して疑似的なダウンロードリンクをクリック実行する。

---

### **3. AI Context JSON スキーマ定義 (SSOT)**

AIが解釈を誤らないよう、出力JSONの構造を以下の通り固定する。

```json
{
  "meta": {
    "tool": "D+++ Visualizer V52",
    "timestamp": "ISO8601"
  },
  "stats": {
    "states": "number",
    "transitions": "number",
    "issues": "number"
  },
  "diagnostics": [
    { "type": "error|warn", "msg": "string", "line": "number" }
  ],
  "modelSummary": {
    "states": ["string"],
    "transitions": ["source -> target [trigger]"]
  }
}

```

---

### **4. データインターフェース仕様 (SSOT)**

| プロパティ/メソッド | 接続先 | 用途 |
| --- | --- | --- |
| `this.ui.data` | **Step 2 (Parser)** | パース済みの生モデルデータを参照。 |
| `this.ui.analyzer` | **Step 7 (Analyzer)** | `analyzeAll()` による診断レポートの取得元。 |
| `copyToClipboard()` | `navigator.clipboard` | AI用JSONをユーザーに提供する手段。 |
| `_flattenState(id)` | 内部メソッド | `A.B.C` を `A_B_C` へ変換（C++用）。 |

---

### **5. 信頼性・異常系設計**

* **クリップボード権限**: `navigator.clipboard` が利用不可（非セキュアなコンテキスト等）な場合は、フォールバックとして `alert` または `console.log` に結果を出力し、データの紛失を防ぐ。
* **要素存在チェック**: SVG出力時に `#diagram svg` が存在しない場合は、トーストで「描画が完了していません」と警告し、処理を中断する。
* **C++生成の安全性**: 状態IDにC++の予約語（`class`, `switch` 等）が含まれている可能性を考慮し、IDの先頭にプレフィックスを付与する、あるいは無効な文字をサニタイズする処理を `_flattenState` に含める。

#### **5.4 強制的フォールバック・ロジックの義務化 (V52重要修正：AI Context消失防止)**

ブラウザのセキュリティ制限（非HTTPS環境、オリジン権限、ユーザーインタラクションの欠如）により `navigator.clipboard.writeText` が拒絶された場合、AIは以下の**「三段構えのフォールバック・シーケンス」**を「オプション」ではなく「必須の標準機能」として実装しなければならない。

1. **第一段階：Promiseの異常検知 (Rejection Handling)**:
* `navigator.clipboard.writeText(text)` は必ず `try-catch` または `.catch()` で囲み、失敗を明示的に捕捉すること。


2. **第二段階：緊急ダイアログ表示 (Modal/Alert Fallback)**:
* 書き込みに失敗した場合、直ちに `window.alert("クリップボードへの書き込みに失敗しました。コンソール出力、または以下のテキストを手動でコピーしてください。")` を表示し、生成された JSON テキストの冒頭 200 文字をダイアログに含めること。
* 可能であれば、Step 0 の `code-modal` を開き、そこに JSON 文字列を流し込むことで、ユーザーが直接 `Ctrl+A` でコピーできるように計らうこと。


3. **第三段階：開発者コンソールへのダンプ (Console Dump)**:
* 失敗した例外オブジェクト（Error object）と共に、生成された JSON 全体を `console.log("--- AI CONTEXT DUMP START ---")`, `console.log(jsonStr)`, `console.log("--- AI CONTEXT DUMP END ---")` の形式で出力すること。
* これにより、UI上で何らかの問題が発生しても、F12キー（開発者ツール）を叩けば必ず AI 用の文脈データが救出できる状態を維持する。



AIが `navigator.clipboard` の成否を確認せずに処理を終えたり、失敗時に何も通知しないコードを生成することは、V52の「AIネイティブ開発環境」としての信頼性を損なう重大な仕様不備とみなす。


#### **5.1. 信頼性・異常系設計：破壊的出力の防止**

* 
**上書きの承認**: C++ コードのエクスポートや AI Context の生成において、既存の出力バッファを破壊する可能性がある操作は、UI Controller の承認ルール（`window.confirm` 等）を遵守し、ユーザーの意図しないデータ消失を徹底的に回避すること 。


* **強制的フォールバック・ロジックの義務化**: （中略：既存の三段階フォールバック手順を維持）

---
