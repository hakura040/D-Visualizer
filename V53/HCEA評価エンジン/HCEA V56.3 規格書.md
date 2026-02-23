**HCEA V56.3規格書**

2026/2/23

[**0\. 導入部 (Introduction)	5**](#0.-導入部-\(introduction\))

[0.1 背景と目的	5](#0.1-背景と目的)

[0.1.1 分散可視化環境における非決定性の課題と v52 の教訓	5](#0.1.1-分散可視化環境における非決定性の課題と-v52-の教訓)

[0.1.2 クロスプラットフォーム（JS/Rust/C++）間のビット不整合リスクの排除	6](#0.1.2-クロスプラットフォーム（js/rust/c++）間のビット不整合リスクの排除)

[0.1.3 Oracle Determinism（神託的決定論）の定義とゴール	7](#0.1.3-oracle-determinism（神託的決定論）の定義とゴール)

[0.2 ターゲット環境と制約	7](#0.2-ターゲット環境と制約)

[0.2.1 Primary Target: JavaScript/WASM ランタイム	7](#0.2.1-primary-target:-javascript/wasm-ランタイム)

[0.2.2 Secondary Target: Rust/C++ ネイティブランタイム	8](#0.2.2-secondary-target:-rust/c++-ネイティブランタイム)

[0.2.3 物理的制約（メモリ消費、スタック深度、実行時間）	9](#0.2.3-物理的制約（メモリ消費、スタック深度、実行時間）)

[**1\. 適用範囲 (Scope)	10**](#1.-適用範囲-\(scope\))

[1.1 適用対象 (In-Scope)	10](#1.1-適用対象-\(in-scope\))

[1.1.1 HACE (High-Assurance Canonical Engine) 準拠ランタイムの実装要件	10](#1.1.1-hace-\(high-assurance-canonical-engine\)-準拠ランタイムの実装要件)

[1.1.2 グラフ構造の正規化およびシリアライズ手順	11](#1.1.2-グラフ構造の正規化およびシリアライズ手順)

[1.1.3 決定論的 ID 付与プロセスおよび参照解決	12](#1.1.3-決定論的-id-付与プロセスおよび参照解決)

[1.2 除外対象 (Out-of-Scope)	13](#1.2-除外対象-\(out-of-scope\))

[1.2.1 ユーザーインターフェース (UI) レイヤーおよび描画処理	13](#1.2.1-ユーザーインターフェース-\(ui\)-レイヤーおよび描画処理)

[1.2.2 ホストOS依存のファイルシステムおよびネットワークI/O	14](#1.2.2-ホストos依存のファイルシステムおよびネットワークi/o)

[1.2.3 非決定的なユーザー入力イベントの処理	14](#1.2.3-非決定的なユーザー入力イベントの処理)

[**2\. 引用規格 (Normative References)	15**](#2.-引用規格-\(normative-references\))

[2.1 IEEE 754-2019	15](#2.1-ieee-754-2019)

[2.2 The Unicode Standard, Version 15.0	15](#2.2-the-unicode-standard,-version-15.0)

[2.3 ISO/IEC 10646	16](#2.3-iso/iec-10646)

[2.4 RFC 2119	16](#2.4-rfc-2119)

[2.5 RFC 5234	16](#2.5-rfc-5234)

[**3\. 用語、定義、および適合性言語 (Terms, Definitions, and Conformance Language)	16**](#3.-用語、定義、および適合性言語-\(terms,-definitions,-and-conformance-language\))

[3.1 Determinism (決定論)	17](#3.1-determinism-\(決定論\))

[3.2 Canonicalization (正準化)	18](#3.2-canonicalization-\(正準化\))

[3.3 Atomic Halting (原子的停止)	18](#3.3-atomic-halting-\(原子的停止\))

[3.4 Safety Kernel (安全核)	19](#3.4-safety-kernel-\(安全核\))

[3.5 Structural Fingerprint (構造的指紋)	19](#3.5-structural-fingerprint-\(構造的指紋\))

[3.6 Immediate Value (即値)	20](#3.6-immediate-value-\(即値\))

[3.7 適合性キーワード (Conformance Keywords)	21](#3.7-適合性キーワード-\(conformance-keywords\))

[**4\. 抽象データモデル (Abstract Data Model)	22**](#4.-抽象データモデル-\(abstract-data-model\))

[4.1 グラフモデルの定義	22](#4.1-グラフモデルの定義)

[4.1.1 ノード (Node) とエッジ (Edge) の抽象定義	22](#4.1.1-ノード-\(node\)-とエッジ-\(edge\)-の抽象定義)

[4.1.2 ルートノード (Root Node) と到達可能性 (Reachability)	23](#4.1.2-ルートノード-\(root-node\)-と到達可能性-\(reachability\))

[4.2 型システム (Type System)	23](#4.2-型システム-\(type-system\))

[4.2.1 プリミティブ型 (Null, Boolean, Number, String, BigInt)	24](#4.2.1-プリミティブ型-\(null,-boolean,-number,-string,-bigint\))

[4.2.2 コンテナ型 (List, Map) と再帰構造	25](#4.2.2-コンテナ型-\(list,-map\)-と再帰構造)

[4.3 同一性と参照 (Identity and Reference)	26](#4.3-同一性と参照-\(identity-and-reference\))

[4.3.1 参照同一性 (Reference Identity) vs 構造的等価性 (Structural Equality)	26](#4.3.1-参照同一性-\(reference-identity\)-vs-構造的等価性-\(structural-equality\))

[4.3.2 循環参照 (Circular Reference) の意味論	27](#4.3.2-循環参照-\(circular-reference\)-の意味論)

[**5\. 抽象正準化意味論 (Abstract Canonicalization Semantics)	28**](#5.-抽象正準化意味論-\(abstract-canonicalization-semantics\))

[5.1 抽象操作 (Abstract Operations)	28](#5.1-抽象操作-\(abstract-operations\))

[5.1.1 Canonicalize(Node) \-\> Bytes	28](#5.1.1-canonicalize\(node\)--\>-bytes)

[5.1.2 Fingerprint(Node) \-\> UInt64	29](#5.1.2-fingerprint\(node\)--\>-uint64)

[5.1.3 Sort(Set) \-\> List	31](#5.1.3-sort\(set\)--\>-list)

[5.2 決定論の基本定理 (The Grand Theorem)	32](#5.2-決定論の基本定理-\(the-grand-theorem\))

[5.2.1 実装独立性公理 (Implementation Independence Axiom)	32](#5.2.1-実装独立性公理-\(implementation-independence-axiom\))

[5.2.2 時間・アドレス・言語独立性公理 (Time, Address, and Language Independence Axiom)	33](#5.2.2-時間・アドレス・言語独立性公理-\(time,-address,-and-language-independence-axiom\))

[5.3 有限エミッション原則 (Finite Emission Principle)	34](#5.3-有限エミッション原則-\(finite-emission-principle\))

[5.3.1 出力バイト列の有限性保証	34](#5.3.1-出力バイト列の有限性保証)

[5.3.2 循環参照および無限再帰の有限解決義務	35](#5.3.2-循環参照および無限再帰の有限解決義務)

[**6\. アーキテクチャと運用意味論 (Architecture and Operational Semantics)	36**](#6.-アーキテクチャと運用意味論-\(architecture-and-operational-semantics\))

[6.1 層構造 (Layered Architecture)	36](#6.1-層構造-\(layered-architecture\))

[6.1.1 L0: Safety Kernel (Invariant Layer)	36](#6.1.1-l0:-safety-kernel-\(invariant-layer\))

[6.1.2 L1: Canonical Encoders (Stateless Layer)	37](#6.1.2-l1:-canonical-encoders-\(stateless-layer\))

[6.1.3 L2: Traversal Engine (Stateful Logic Layer)	38](#6.1.3-l2:-traversal-engine-\(stateful-logic-layer\))

[6.1.4 L3: Facade & Runtime (Boundary Layer)	39](#6.1.4-l3:-facade-&-runtime-\(boundary-layer\))

[6.2 規範的ステートマシン (Normative State Machine)	40](#6.2-規範的ステートマシン-\(normative-state-machine\))

[6.2.1 状態定義: IDLE, ANALYZING (Phase 1), EMITTING (Phase 2), HALTED (Error)	40](#6.2.1-状態定義:-idle,-analyzing-\(phase-1\),-emitting-\(phase-2\),-halted-\(error\))

[6.2.2 入力イベント集合 (Input Event Set): Start, Abort, Step, Complete	41](#6.2.2-入力イベント集合-\(input-event-set\):-start,-abort,-step,-complete)

[6.2.3 状態遷移表 (Normative State Transition Table)	43](#6.2.3-状態遷移表-\(normative-state-transition-table\))

[6.3 エラーおよび失敗モデル (Error and Failure Model)	45](#6.3-エラーおよび失敗モデル-\(error-and-failure-model\))

[6.3.1 状態破棄とエラー処理原則 (No Partial Emission)	45](#6.3.1-状態破棄とエラー処理原則-\(no-partial-emission\))

[6.3.2 原子的停止機構 (Atomic Halting) と Error\_Lock への不可逆遷移	46](#6.3.2-原子的停止機構-\(atomic-halting\)-と-error_lock-への不可逆遷移)

[6.4 メモリ管理と並行性 (Memory Management and Concurrency)	47](#6.4-メモリ管理と並行性-\(memory-management-and-concurrency\))

[6.4.1 Arena / Slab Allocation の強制	47](#6.4.1-arena-/-slab-allocation-の強制)

[6.4.2 Worker 隔離と Global State の禁止	47](#6.4.2-worker-隔離と-global-state-の禁止)

[**7\. データ表現とエンコーディング (Data Representation)	48**](#7.-データ表現とエンコーディング-\(data-representation\))

[7.1 浮動小数点数 (Float64 Canonicalization)	48](#7.1-浮動小数点数-\(float64-canonicalization\))

[7.1.1 NaN 正規化 (Canonical NaN: 0x7ff8000000000000 固定)	48](#7.1.1-nan-正規化-\(canonical-nan:-0x7ff8000000000000-固定\))

[7.1.2 負のゼロ (-0.0) の保存義務 (Bitwise Exactness)	49](#7.1.2-負のゼロ-\(-0.0\)-の保存義務-\(bitwise-exactness\))

[7.1.3 非正規化数の扱い (Handling of Subnormal Numbers)	50](#7.1.3-非正規化数の扱い-\(handling-of-subnormal-numbers\))

[7.2 整数と時刻 (Integers & Timestamps)	51](#7.2-整数と時刻-\(integers-&-timestamps\))

[7.2.1 Int64 / Uint64 Big-Endian 固定長	51](#7.2.1-int64-/-uint64-big-endian-固定長)

[7.2.2 Varint 使用禁止と Epoch Time 表現	52](#7.2.2-varint-使用禁止と-epoch-time-表現)

[7.3 文字列 (String Encoding)	52](#7.3-文字列-\(string-encoding\))

[7.3.1 UTF-8 Strict Encoding (Atomic Halt on Error)	52](#7.3.1-utf-8-strict-encoding-\(atomic-halt-on-error\))

[7.3.2 サロゲートペア検証義務 (Mandatory Validation of Surrogate Pairs)	53](#7.3.2-サロゲートペア検証義務-\(mandatory-validation-of-surrogate-pairs\))

[**8\. 正準バイナリレイアウト (Canonical Binary Layout)	54**](#8.-正準バイナリレイアウト-\(canonical-binary-layout\))

[8.1 ストリーム構造 (Stream Structure)	54](#8.1-ストリーム構造-\(stream-structure\))

[8.1.1 ストリームヘッダ (Stream Header) 定義	54](#8.1.1-ストリームヘッダ-\(stream-header\)-定義)

[8.1.2 Status Byte 定義 (COMPLETE, PROCESSING, ERROR\_LOCK)	55](#8.1.2-status-byte-定義-\(complete,-processing,-error_lock\))

[8.2 TLV (Tag-Length-Value) エンコーディング	57](#8.2-tlv-\(tag-length-value\)-エンコーディング)

[8.2.1 Tag ID レジストリ割り当て	57](#8.2.1-tag-id-レジストリ割り当て)

[8.2.2 特殊値 (Null, Undefined, Holes) のバイト表現	59](#8.2.2-特殊値-\(null,-undefined,-holes\)-のバイト表現)

[8.3 形式文法 (Formal Binary Grammar)	60](#8.3-形式文法-\(formal-binary-grammar\))

[8.3.1 ABNF (Augmented BNF) によるストリーム定義	60](#8.3.1-abnf-\(augmented-bnf\)-によるストリーム定義)

[8.3.2 TLV 構造の形式的定義	63](#8.3.2-tlv-構造の形式的定義)

[**9\. 走査と構造決定ロジック (Traversal Logic)	65**](#9.-走査と構造決定ロジック-\(traversal-logic\))

[9.1 2フェーズ・コミットプロトコル	65](#9.1-2フェーズ・コミットプロトコル)

[9.1.1 Phase 1: Structure Analysis (CCS生成・ソート \- 出力禁止)	65](#9.1.1-phase-1:-structure-analysis-\(ccs生成・ソート---出力禁止\))

[9.1.2 Phase 2: Emission (ID付与・出力 \- ソート禁止)	66](#9.1.2-phase-2:-emission-\(id付与・出力---ソート禁止\))

[9.1.3 フェーズ間の状態汚染防止 (Phase Barrier)	68](#9.1.3-フェーズ間の状態汚染防止-\(phase-barrier\))

[9.2 比較用正規化スキーム (Canonical Comparison Schema: CCS)	68](#9.2-比較用正規化スキーム-\(canonical-comparison-schema:-ccs\))

[9.2.1 CCS Versioning と前方互換性	68](#9.2.1-ccs-versioning-と前方互換性)

[9.2.2 Structural Fingerprint v1 (Algorithm ID: 0x1)	69](#9.2.2-structural-fingerprint-v1-\(algorithm-id:-0x1\))

[9.2.3 算術演算モデル (Arithmetic Model)	71](#9.2.3-算術演算モデル-\(arithmetic-model\))

[9.2.3.1 64-bit Unsigned Integer Wrapping ($mod\\ 2^{64}$) の強制	72](#9.2.3.1-64-bit-unsigned-integer-wrapping-\($mod\\-2^{64}$\)-の強制)

[9.2.3.2 論理右シフト (Logical Right Shift) の強制と算術シフトの禁止	72](#9.2.3.2-論理右シフト-\(logical-right-shift\)-の強制と算術シフトの禁止)

[9.2.3.3 シフト量のマスク (& 63\) 処理義務	73](#9.2.3.3-シフト量のマスク-\(&-63\)-処理義務)

[9.2.4 即値の取得 (Immediate Value Definition)	74](#9.2.4-即値の取得-\(immediate-value-definition\))

[9.2.4.1 String: Lengthの上位ビットシフト混合とMSB左詰め配置	74](#9.2.4.1-string:-lengthの上位ビットシフト混合とmsb左詰め配置)

[9.2.4.2 BigInt: 絶対値 (Magnitude) と MSB符号ビットの配置	75](#9.2.4.2-bigint:-絶対値-\(magnitude\)-と-msb符号ビットの配置)

[9.2.4.3 Container: 再帰的Fingerprintと型IDの混合	77](#9.2.4.3-container:-再帰的fingerprintと型idの混合)

[9.3 循環参照と同一性 (Cycle & Identity)	78](#9.3-循環参照と同一性-\(cycle-&-identity\))

[9.3.1 帰りがけ順 (Post-order) 計算と仮値解決 (Mix TagID)	78](#9.3.1-帰りがけ順-\(post-order\)-計算と仮値解決-\(mix-tagid\))

[9.3.2 参照同一性 (Reference Identity) の定義と構造的等価性の禁止	79](#9.3.2-参照同一性-\(reference-identity\)-の定義と構造的等価性の禁止)

[9.3.3 安定ノードID (Stable Node ID) による代替実装の許可	80](#9.3.3-安定ノードid-\(stable-node-id\)-による代替実装の許可)

[9.4 決定論的タイブレーク (Deterministic Tie-break)	80](#9.4-決定論的タイブレーク-\(deterministic-tie-break\))

[9.4.1 優先順位: Fingerprint \> Tag \> Length \> Raw Bytes	80](#9.4.1-優先順位:-fingerprint-\>-tag-\>-length-\>-raw-bytes)

[9.4.2 Raw Bytes 比較規則: Unsigned Lexicographical Order と長さ規則	82](#9.4.2-raw-bytes-比較規則:-unsigned-lexicographical-order-と長さ規則)

[**10\. 境界防御と安全性 (Boundary Guards and Safety)	83**](#10.-境界防御と安全性-\(boundary-guards-and-safety\))

[10.1 境界防御機構	83](#10.1-境界防御機構)

[10.1.1 スタック深度ガード ($d\_{trav}$ / $d\_{cmp}$)	83](#10.1.1-スタック深度ガード-\($d_{trav}$-/-$d_{cmp}$\))

[10.1.2 ループ/複雑度ガード ($d\_{cmp}$ / Ancestors Stack)	83](#10.1.2-ループ/複雑度ガード-\($d_{cmp}$-/-ancestors-stack\))

[10.2 未定義動作の扱い (Treatment of Undefined Behavior)	85](#10.2-未定義動作の扱い-\(treatment-of-undefined-behavior\))

[10.2.1 実装未定義 (Implementation-Defined Behavior): メモリ戦略等	85](#10.2.1-実装未定義-\(implementation-defined-behavior\):-メモリ戦略等)

[10.2.2 禁止動作 (Prohibited Behavior): 規格外の拡張等	85](#10.2.2-禁止動作-\(prohibited-behavior\):-規格外の拡張等)

[10.2.3 未定義動作 (Undefined Behavior) の不存在宣言	86](#10.2.3-未定義動作-\(undefined-behavior\)-の不存在宣言)

[**11\. 国際化に関する考慮事項 (Internationalization Considerations)	87**](#11.-国際化に関する考慮事項-\(internationalization-considerations\))

[11.1 Unicode バージョン依存性	87](#11.1-unicode-バージョン依存性)

[11.2 正規化とロケール	88](#11.2-正規化とロケール)

[**12\. セキュリティに関する考慮事項 (Security Considerations)	89**](#12.-セキュリティに関する考慮事項-\(security-considerations\))

[12.1 正規化攻撃 (Canonicalization Attacks)	89](#12.1-正規化攻撃-\(canonicalization-attacks\))

[12.2 リソース枯渇攻撃 (Resource Exhaustion Attacks)	90](#12.2-リソース枯渇攻撃-\(resource-exhaustion-attacks\))

[**13\. IANA に関する考慮事項 (IANA Considerations)	91**](#13.-iana-に関する考慮事項-\(iana-considerations\))

[13.1 タグ空間レジストリ (Tag Space Registry)	91](#13.1-タグ空間レジストリ-\(tag-space-registry\))

[13.1.1 レジストリテンプレート (Registry Template)	91](#13.1.1-レジストリテンプレート-\(registry-template\))

[13.1.2 初期割り当てテーブル (Initial Values Table)	92](#13.1.2-初期割り当てテーブル-\(initial-values-table\))

[13.1.3 専門家レビュー規則 (Expert Review Rule)	94](#13.1.3-専門家レビュー規則-\(expert-review-rule\))

[13.1.4 更新手順 (Update Procedure)	95](#13.1.4-更新手順-\(update-procedure\))

[**14\. メンテナンスとガバナンス (Maintenance and Governance)	96**](#14.-メンテナンスとガバナンス-\(maintenance-and-governance\))

[14.1 変更管理ポリシー (Change Control Policy)	96](#14.1-変更管理ポリシー-\(change-control-policy\))

[14.2 凍結宣言 (Declaration of Freezing)	98](#14.2-凍結宣言-\(declaration-of-freezing\))

[14.3 エラータ処理 (Errata Policy)	99](#14.3-エラータ処理-\(errata-policy\))

[**15\. 検証及び適合性 (Verification & Conformance)	100**](#15.-検証及び適合性-\(verification-&-conformance\))

[15.1 適合性レベル (Conformance Levels)	100](#15.1-適合性レベル-\(conformance-levels\))

[15.1.1 Level I: 厳密適合 (Strict Conformance)	100](#15.1.1-level-i:-厳密適合-\(strict-conformance\))

[15.1.2 Level II: 神託適合 (Oracle Conformance)	100](#15.1.2-level-ii:-神託適合-\(oracle-conformance\))

[15.1.3 不適合 (Non-Conformance)	100](#15.1.3-不適合-\(non-conformance\))

[15.2 HDF (HACE Differential Fuzzer) 検証	101](#15.2-hdf-\(hace-differential-fuzzer\)-検証)

[15.2.1 ランダムグラフ生成仕様 (Cycle, Diamond, Float Edge)	101](#15.2.1-ランダムグラフ生成仕様-\(cycle,-diamond,-float-edge\))

[15.2.2 異種実装間 (JS vs Python/Rust) のビット完全一致確認	102](#15.2.2-異種実装間-\(js-vs-python/rust\)-のビット完全一致確認)

[15.2.3 許容誤差ゼロ基準 (Zero-Tolerance Policy)	103](#15.2.3-許容誤差ゼロ基準-\(zero-tolerance-policy\))

[15.3 Oracle Validator による静的証明	104](#15.3-oracle-validator-による静的証明)

[15.3.1 TLV 文法の数学的整合性チェック	104](#15.3.1-tlv-文法の数学的整合性チェック)

[15.3.2 ID 線形性と参照整合性の証明	105](#15.3.2-id-線形性と参照整合性の証明)

[15.4 HACE Conformance Test Suite (実装裁判所)	106](#15.4-hace-conformance-test-suite-\(実装裁判所\))

[15.4.1 Arithmetic Traps (演算境界・シフト・Overflowテスト)	106](#15.4.1-arithmetic-traps-\(演算境界・シフト・overflowテスト\))

[15.4.2 Immediate Value Table Verification	107](#15.4.2-immediate-value-table-verification)

[15.4.3 Cycle Topology Consistency (循環トポロジー整合性テスト)	109](#15.4.3-cycle-topology-consistency-\(循環トポロジー整合性テスト\))

[**附属書 A (規定): 実装禁止事項26選 (Normative Anti-Patterns)	110**](#附属書-a-\(規定\):-実装禁止事項26選-\(normative-anti-patterns\))

[A.1 アーキテクチャ違反 (Layer & Architecture Violations)	110](#a.1-アーキテクチャ違反-\(layer-&-architecture-violations\))

[A.2 決定論の破壊 (Destruction of Determinism)	113](#a.2-決定論の破壊-\(destruction-of-determinism\))

[A.2 決定論の破壊 (Destruction of Determinism)	117](#a.2-決定論の破壊-\(destruction-of-determinism\)-1)

[A.3 バイナリ・エンコーディング違反 (Binary & Encoding Violations)	117](#a.3-バイナリ・エンコーディング違反-\(binary-&-encoding-violations\))

[A.4 走査ロジック違反 (Traversal Logic Violations)	122](#a.4-走査ロジック違反-\(traversal-logic-violations\))

[A.5 非決定論的 API の利用 (Use of Nondeterministic APIs)	124](#a.5-非決定論的-api-の利用-\(use-of-nondeterministic-apis\))

[A.6 エラー処理違反 (Error Handling Violations)	127](#a.6-エラー処理違反-\(error-handling-violations\))

[A.7 正規化違反 (Normalization Violations)	128](#a.7-正規化違反-\(normalization-violations\))

[**附属書 B (規定): 実装不変条件チェックリスト (Normative Implementation Invariants Checklist)	129**](#附属書-b-\(規定\):-実装不変条件チェックリスト-\(normative-implementation-invariants-checklist\))

[B.1 算術演算 (Arithmetic): すべての演算が 64bit マスクされているか？	129](#b.1-算術演算-\(arithmetic\):-すべての演算が-64bit-マスクされているか？)

[B.2 シフト演算 (Shift): 論理右シフトのみを使用しているか？	130](#b.2-シフト演算-\(shift\):-論理右シフトのみを使用しているか？)

[B.3 文字列 (String): 不正な UTF-8 に対して Atomic Halt しているか？	131](#b.3-文字列-\(string\):-不正な-utf-8-に対して-atomic-halt-しているか？)

[B.4 比較 (Comparison): memcmp は符号なしバイトとして比較しているか？	131](#b.4-比較-\(comparison\):-memcmp-は符号なしバイトとして比較しているか？)

[B.5 フェーズ分離 (Phasing): Phase 1 で Phase 2 の状態（ID等）を参照していないか？	132](#b.5-フェーズ分離-\(phasing\):-phase-1-で-phase-2-の状態（id等）を参照していないか？)

[**附属書 C (規定): 規範的エンコーディング例 (Normative Encoding Examples)	133**](#附属書-c-\(規定\):-規範的エンコーディング例-\(normative-encoding-examples\))

[C.1 プリミティブ型 (Primitive Types)	133](#c.1-プリミティブ型-\(primitive-types\))

[C.2 コンテナ型 (Container Types)	138](#c.2-コンテナ型-\(container-types\))

[**附属書 D (参考): 実装ガイダンス (Implementation Guidance)	142**](#附属書-d-\(参考\):-実装ガイダンス-\(implementation-guidance\))

[D.1 TypeScript/JavaScript 実装リファレンス	142](#d.1-typescript/javascript-実装リファレンス)

[D.2 Rust/C++ 移植時の注意点とメモリモデル	148](#d.2-rust/c++-移植時の注意点とメモリモデル)

[D.3 HACE プロジェクト推奨ディレクトリ構成	150](#d.3-hace-プロジェクト推奨ディレクトリ構成)

---

### **0\. 導入部 (Introduction)** {#0.-導入部-(introduction)}

#### **0.1 背景と目的** {#0.1-背景と目的}

##### **0.1.1 分散可視化環境における非決定性の課題と v52 の教訓** {#0.1.1-分散可視化環境における非決定性の課題と-v52-の教訓}

従来の D+++ Visualizer (v52) アーキテクチャを用いた運用において、状態遷移のシミュレーション結果が実行環境（ブラウザの種類、JavaScriptエンジンのバージョン、OS）に依存して変動するという、検証ツールとして致命的な欠陥が確認された。特に、CI（継続的インテグレーション）環境とローカルの可視化環境で異なる挙動を示す事例が頻発し、信頼性が著しく損なわれる事態となった。

これらの問題は単なる実装上のバグではなく、当時のアーキテクチャが抱えていた以下の構造的な「非決定性要因」に起因するものである。本規格は、これらの教訓に基づき策定された。

**1\. ホストランタイムへの依存によるハッシュのゆらぎ (Runtime Dependency)** v52 エンジンは、オブジェクトの状態保存およびハッシュ計算において `JSON.stringify` や `Object.keys` といった言語標準機能に依存していた。しかし、これらの挙動は ECMAScript 仕様において長らく実装依存（Implementation-dependent）であり、プロパティの列挙順序や浮動小数点数の文字列表現が環境によって異なる。 この結果、論理的に等価な状態であっても、実行するブラウザやバージョンが異なれば生成されるハッシュ値（指紋）が一致せず、分散環境間での状態同一性の証明が不可能であった。

**2\. ロジックの二重管理による「二重の真実」 (The Double Truth Problem)** v52 では、UI用の「Simulator」と検証用の「TestRunner」が、それぞれ独立した遷移探索ロジックを実装していた。これにより、ワイルドカードの優先順位やガード条件の評価において微細な解釈のズレが生じ、「シミュレータ上では正常に遷移するが、自動テストでは失敗する（あるいはその逆）」という不整合が発生した。 この「二重の真実」状態は、検証エンジンの信頼性を根底から覆すものであり、論理コアの一元化（Single Source of Truth）が不可欠であることが明らかとなった。

**3\. 実行モデルの曖昧さと副作用 (Ambiguous Execution Model)** v52 のライフサイクル管理には、初期化（Boot）と同時に Entry アクションを強制実行する仕様が含まれていた。これにより、テスト実行前に初期コンテキストが副作用によって破壊され、特定の条件下での再現テストが不可能となるケースが存在した。また、自動遷移（auto）が時間経過（Tick）ではなく外部イベントとして扱われていたため、時間モデルの不整合を引き起こしていた。

**4\. 評価器の脆弱性とエラー隠蔽 (Evaluator Fragility)** アクションやガード条件を実行する `SafeEvaluator` は、例外発生時に `false` を返して処理を続行する設計となっていた。これにより、記述ミス（Typo）や未定義変数の参照といった重大な論理エラーが「遷移条件の不成立」として隠蔽され、バグの発見を遅らせる要因となった。また、JavaScript 特有の緩やかな型変換（Type Coercion）により、意図しない挙動が許容されていた。

これらの教訓から、次世代の HACE エンジンは、ホスト言語の挙動やメモリ管理（ガベージコレクション等）に一切依存せず、**「いつ、どこで、誰が実行してもビットレベルで完全に一致する」** 独自の正規化ルールと、エラー発生時には即座に停止する原子的安全性を持つ必要があるという結論に至った。

##### **0.1.2 クロスプラットフォーム（JS/Rust/C++）間のビット不整合リスクの排除** {#0.1.2-クロスプラットフォーム（js/rust/c++）間のビット不整合リスクの排除}

本規格は、JavaScript (TypeScript) による参照実装のみならず、将来的な Rust (WASM) や C++ によるネイティブ実装を見据えて設計されている。異なるプログラミング言語、コンパイラ、およびCPUアーキテクチャ間において、以下の要素は出力されるハッシュ値（指紋）のビットレベルの不整合を引き起こす主要因となる。

**1\. 浮動小数点数の表現揺らぎ (Floating-Point Representation)** IEEE 754 規格準拠であっても、NaN (Not-a-Number) のペイロードビット（エラーコード等を格納する領域）の扱いは、CPUや言語処理系によって異なる。また、負のゼロ（-0.0）と正のゼロ（+0.0）は、意味論的に等価とされる場合があるが、ビット列としては明確に異なる。 HACE v56.2 は、すべての NaN を単一の正準形式（`0x7ff8000000000000`）に強制置換し、符号付きゼロを厳密に区別することで、この揺らぎを排除する。

**2\. メモリレイアウトおよびガベージコレクションへの依存 (Memory Layout Dependency)** ポインタアドレスやメモリアドレスに基づくソートやID付与は、ASLR (Address Space Layout Randomization) やガベージコレクション（GC）によるオブジェクト移動の影響を受け、実行ごとに結果が変動する。 特に C++ や Rust におけるポインタ比較、あるいは JavaScript における WeakMap の列挙順序依存は、決定論的再現性を破壊する。本規格は、メモリアドレスの値をソートキーとして使用することを厳格に禁止する。

**3\. コンテナの反復順序 (Container Iteration Order)** ハッシュマップやセットの実装アルゴリズム（例: 線形プロービング vs チェイン法、ツリー vs ハッシュ）の違いにより、要素の取り出し順序は言語間で保証されない。また、JavaScript の `Map` は挿入順序を保持するが、他の言語のハッシュマップは保持しない場合が多い。 HACE v56.2 は、コンテナ内の要素順序を、その「内容（コンテンツ）の正規化バイト列」に基づく辞書順ソート（Canonical Sort）によって一意に決定することを要求する。

**4\. 文字エンコーディングと演算の差異 (Encoding and Arithmetic Divergence)** UTF-8 エンコーダの挙動（特に不正なサロゲートペアの扱い）や、ビットシフト演算（論理シフト vs 算術シフト）の仕様は言語によって微妙に異なる。 本規格は、不正な UTF-8 シーケンスに対しては置換文字（U+FFFD）を使用せず即座に停止（Atomic Halt）すること、および 64bit 整数演算におけるオーバーフロー挙動やシフト挙動を厳密に規定することで、これらの言語差を吸収する。

HACE v56.2 は、これらの「実装依存の挙動」を徹底的に排除し、数学的に定義された手順のみによって出力バイト列を決定することを要求する,,,,。

##### **0.1.3 Oracle Determinism（神託的決定論）の定義とゴール** {#0.1.3-oracle-determinism（神託的決定論）の定義とゴール}

本規格の究極的な目的は、 **Oracle Determinism（神託的決定論）** の確立である。これは、単なる「結果の類似性」や「互換性」を超えた、以下の3つの公理によって定義される絶対的な状態を指す。

**1\. Bit-Level Reproducibility (ビットレベル再現性)** 任意の論理的入力グラフ $G$ に対し、HACE準拠の実装 $I$ が生成する正規化バイト列 $B \= I(G)$ は、実装言語、ハードウェア、実行時刻、並行実行状態に関わらず、常にビット単位で唯一無二（Unique）でなければならない。 すなわち、JavaScriptによる参照実装と、RustやC++によるネイティブ実装の出力は、1ビットたりとも相違してはならない。

**2\. Atomic Halting (原子的停止)** 入力グラフが循環参照の制限超過や不正なエンコーディングを含む場合、システムは部分的出力（Partial Emission）を行うことなく、即座に状態 $\\bot$ (Bottom) へと遷移し、処理を停止しなければならない。 エラーの種類（スタックオーバーフロー、不正なUTF-8等）によって出力が変動することは許容されず、異常系においても決定論的な「無」を返さなければならない。

**3\. Implementation Independence (実装独立性)** 正規化の結果は、グラフの論理的構造のみに依存し、そのメモリ上の表現形式（ポインタアドレス、参照カウント、ガベージコレクションの世代など）には一切依存してはならない。 物理的なメモリ配置やオブジェクトの生成順序が異なっても、論理的に等価なグラフであれば、必ず同一のバイト列が生成されなければならない。

本規格書は、これらのゴールを達成するための「法（The Law）」であり、準拠するすべての実装者が遵守すべき絶対的な制約事項を規定するものである。

#### **0.2 ターゲット環境と制約** {#0.2-ターゲット環境と制約}

##### **0.2.1 Primary Target: JavaScript/WASM ランタイム** {#0.2.1-primary-target:-javascript/wasm-ランタイム}

本規格の主要な適用対象（Primary Target）は、ECMAScript 仕様に準拠した JavaScript 実行環境（V8, SpiderMonkey, JavaScriptCore 等を搭載した Web ブラウザおよび Node.js, Deno, Bun 等のサーバーサイドランタイム）、および WebAssembly (WASM) 実行環境である。

これらの環境は、動的型付け、ガベージコレクション (GC)、および Just-In-Time (JIT) コンパイルといった特性を持つが、これらは本質的に実行タイミングやメモリ配置の非決定性を内包している。したがって、HACE 準拠の実装は、ホストランタイムの機能に対して以下の「仮想的な制約レイヤー」を構築し、決定論的動作を強制しなければならない。

**1\. 数値表現の仮想化 (Virtualization of Numeric Representation)** JavaScript の `Number` 型は IEEE 754 倍精度浮動小数点数（Double）であるが、本規格においては、これを以下の2つの厳密な型として扱うためのバリデーションロジック（Safety Kernel）を実装しなければならない。

* **U53 整数:** 内部カウンタや ID 生成においては、`Number.MAX_SAFE_INTEGER` ($2^{53}-1$) 以下の非負整数のみを使用し、オーバーフローを即座に検知して停止する（U53 Geometry）。  
* **Canonical Float:** 浮動小数点数として扱う場合は、NaN のビットパターンを正規化し、負のゼロ（-0.0）を正のゼロと区別して保存・出力する,。

**2\. メモリ管理の抽象化 (Abstraction of Memory Management)** ガベージコレクション（GC）の実行タイミングによる停止時間やオブジェクト移動の影響を排除するため、実装はホスト言語の自動メモリ管理に依存せず、以下のいずれかの戦略を採用することが強く推奨される。

* **Binary Arena / Slab Allocation:** `ArrayBuffer` を用いたスラブアロケータを実装し、短命なオブジェクトの生成・破棄を明示的に管理する。  
* **論理的同一性管理:** `WeakMap` 等を使用する場合であっても、キーの列挙や生存確認（Liveness Check）に基づいたロジックを組んではならず、あくまでトラバーサル順序に基づいた一時 ID（TempID）によってオブジェクトを識別する,。

**3\. 文字列エンコーディングの厳格化 (Strict String Encoding)** JavaScript の文字列は UTF-16 ベースであるが、本規格の出力は UTF-8 である。実装は `TextEncoder` 等の標準 API が行う「不正なサロゲートペアの自動置換」を無効化または事前検出し、不正なシーケンスが含まれる場合は処理を停止（Atomic Halt）しなければならない,。

**4\. 実行モデルの制約 (Execution Model Constraints)** ブラウザのメインスレッド（UIスレッド）におけるブロッキングを防ぎ、かつ並行処理による競合状態（Race Condition）を排除するため、HACE エンジンは WebWorker などの隔離されたスレッド内で、シングルスレッドかつ同期的（Run-to-completion）に実行されることを前提とする。

##### **0.2.2 Secondary Target: Rust/C++ ネイティブランタイム** {#0.2.2-secondary-target:-rust/c++-ネイティブランタイム}

本規格の二次的な適用対象（Secondary Target）は、Rust および C++ によるネイティブ実装、あるいはそれらをソースとする WebAssembly (WASM) モジュールである。これらの環境は、大量のステートマシン検証を高速に行うために不可欠であるが、メモリ管理や数値表現において JavaScript とは根本的に異なる低レイヤーの制御能力を持つ。HACE の決定論的再現性を維持するため、これらの実装には以下の厳格な制約（Disciplines）が課される。

**1\. メモリアドレス依存の完全排除 (Memory Layout Independence)** C++ や Rust において、オブジェクトのポインタ値（メモリアドレス）をソートキーやハッシュ計算のシードとして使用することは、ASLR (Address Space Layout Randomization) やメモリアロケータの挙動により実行ごとに結果が変動するため、厳格に禁止される。 実装は、ポインタを「同一性判定（Equality Check）」のためにのみ使用し、順序決定には必ず正規化されたバイト列（Canonical Byte Sequence）またはトラバーサル順に発行された論理IDを使用しなければならない。

**2\. コンテナ反復の決定性 (Container Determinism)** Rust の `HashMap`（SipHashによるランダムシード）や C++ の `std::unordered_map`（未定義のイテレーション順序）は、そのまま使用すると非決定的な出力を生む。 HACE 準拠の実装は、これらのコンテナをイテレートする際、必ず「内容に基づく正準ソート（Canonical Sort）」を経由するか、挿入順序に依存しない決定論的なアルゴリズムを用いなければならない,。

**3\. 厳密な数値表現とエンディアン (Strict Numeric & Endianness)** 多くのホスト CPU はリトルエンディアン（Little-Endian）であるが、HACE のバイナリ仕様はビッグエンディアン（Big-Endian）で統一されている。ネイティブ実装は、メモリ上の数値を `memcpy` で直接書き込むことを禁じ、必ずエンディアン変換を行うレイヤーを介さなければならない。 また、浮動小数点数（Float64）においては、CPU の「Fast Math」最適化や FTZ (Flush-to-Zero) モードによる演算精度の揺らぎを排除し、IEEE 754 規格に準拠した厳密なビット操作を行わなければならない,。

**4\. 文字列エンコーディングの安全性 (String Safety)** Rust の `String` は UTF-8 が保証されるが、C++ の `std::string` は単なるバイト列でありエンコーディングを保証しない。 HACE 準拠の実装は、外部（特に FFI 経由）から文字列を受け取る際、必ず RFC 3629 に準拠した UTF-8 検証を行い、不正なシーケンスが含まれる場合は処理を停止（Atomic Halt）させなければならない,。

##### **0.2.3 物理的制約（メモリ消費、スタック深度、実行時間）** {#0.2.3-物理的制約（メモリ消費、スタック深度、実行時間）}

HACE エンジンは、リソースが有限な環境（モバイルブラウザや組み込みデバイスを含む）において、予測可能かつ安全に動作しなければならない。論理的な整合性を保ちつつ、システムクラッシュ（Out of Memory や Stack Overflow）を防ぐため、以下の物理的制約を **Safety Kernel (L0)** によって強制する。

**1\. スタック深度の制限 (Stack Depth Constraints)** ホスト言語（特に JavaScript エンジン）のコールスタック上限は環境によって異なり、これに依存することは非決定的なクラッシュを招く。したがって、実装はシステムスタックに依存せず、ヒープ上で管理される明示的なカウンタを用いて以下の二重深度ガード（Dual Depth Guards）を適用しなければならない。

* **比較深度 ($d\_{cmp} \\le 10$):** 構造解析フェーズ（Phase 1）におけるソートのための再帰比較は、深度 10 で打ち切られる。これを超過した場合はエラーではなく、`LimitTag (255)` を出力して比較を終了する。これにより、循環参照や超深度グラフにおけるソート処理の無限再帰を防止する。  
* **走査深度 ($d\_{trav} \\le 1000$):** 出力フェーズ（Phase 2）におけるグラフ走査は、深度 1000 を上限とする。これを超過した場合は、リソース枯渇攻撃やバグとみなし、即座に `Error_Lock` を発動して処理を停止（Atomic Halt）しなければならない。

**2\. メモリ消費とアロケーション (Memory Consumption & Allocation)** 正規化プロセス、特にソート処理においては $O(N \\log N)$ の一時オブジェクト生成が発生しうるが、これはガベージコレクション（GC）の停止時間（Stop-the-world）を引き起こす要因となる。

* **Binary Arena の強制:** 実装は、ノードごとの動的メモリ確保（`new Uint8Array` 等）を禁止し、事前に確保された固定長バッファ（Arena / Slab）を使用しなければならない。  
* **単一ノードサイズ:** TLV (Tag-Length-Value) 構造における Length フィールドは 32bit 符号なし整数であるため、単一ノード（文字列やバイナリペイロードを含む）の最大サイズは 4GB ($2^{32}-1$ bytes) 未満に制限される。これを超えるデータは `Error_Lock` とする。

**3\. 実行時間と停止性 (Execution Time & Termination)** HACE はハードリアルタイム性（物理的な応答時間の保証）は提供しないが、論理的な停止性（Termination）は保証する。

* **有限エミッション (Finite Emission):** 循環参照を含むグラフであっても、既出ノードの参照化（RefNode）により、出力されるトークン数は必ず有限に収束しなければならない。  
* **マイクロステップ制限:** 実行エンジン（Visualizer Runtime）においては、無限ループによるブラウザフリーズを防ぐため、1回の外部入力に対する内部遷移（Microstep）の連鎖回数に物理的上限（デフォルト 1000）を設け、超過時は強制停止しなければならない。

---

### **1\. 適用範囲 (Scope)** {#1.-適用範囲-(scope)}

#### **1.1 適用対象 (In-Scope)** {#1.1-適用対象-(in-scope)}

##### **1.1.1 HACE (High-Assurance Canonical Engine) 準拠ランタイムの実装要件** {#1.1.1-hace-(high-assurance-canonical-engine)-準拠ランタイムの実装要件}

本規格は、任意のオブジェクトグラフを入力とし、決定論的な正準化バイト列（Canonical Byte Stream）を出力する実行エンジン（以下、ランタイム）の実装要件を規定する。HACE準拠ランタイムは、以下の構造的および機能的制約を遵守しなければならない。

**1\. Safety Kernel (L0) の実装義務** ランタイムは、計算ロジックから独立した最小特権の監視モジュール「Safety Kernel」を実装しなければならない。Safety Kernel は以下の不変条件（Invariants）を物理的に強制する責務を負う。

* **原子的停止 (Atomic Halting):** エラー発生時、システム状態を直ちに `Error_Lock` (Bottom, $\\bot$) へ遷移させ、以降の全ての演算および出力を無効化すること。部分的出力（Partial Emission）の残留は許容されない。  
* **二重深度ガード (Dual Depth Guards):** 走査深度 ($d\_{trav} \\le 1000$) および比較深度 ($d\_{cmp} \\le 10$) を、システムコールスタックに依存せず、明示的なカウンタにより独立して監視すること。  
* **U53 算術境界:** 全ての内部カウンタおよびID生成において、演算結果が $0 \\le n \\le 2^{53}-1$ (JavaScript Safe Integer) の範囲内であることを保証すること。

**2\. メモリ管理とアロケーション戦略** ランタイムは、ホスト言語のガベージコレクション（GC）の挙動やタイミングによる非決定性を排除するため、独自のメモリ管理機構を備えなければならない。

* **Binary Arena / Slab Allocation:** 短命なバイナリ生成（特に比較用ストリーム）においては、事前に確保されたメモリプール（Arena）を使用し、ノードごとの動的なメモリアロケーションを抑制しなければならない。  
* **ゼロコピー参照:** データ操作は可能な限りスライス参照（Slice Reference）を用いて行い、不必要なメモリコピーを回避すること。

**3\. 実行モデルと隔離** ランタイムは、外部環境（UI、ネットワーク、システムクロック）からの副作用を完全に遮断した状態で動作しなければならない。

* **セッションスコープ:** エンジンインスタンス、Safety Kernel、およびメモリアリーナは、1回の正規化リクエスト（Session）ごとに生成・破棄されなければならない。グローバル変数やシングルトンパターンによる状態の共有は禁止される。  
* **Worker ランタイム:** ブラウザ環境においては、メインスレッドから隔離された WebWorker (またはそれに準ずる隔離スレッド) 内で動作し、通信はシリアライズされたメッセージ（Snapshot DTO）のみを介して行うこと。

**4\. 純粋関数性 (Functional Purity)** ランタイムが提供する主要エントリーポイント `CanonicalHash(Input)` は、数学的な純粋関数として振る舞わなければならない。同一の入力グラフ $G$ に対し、実行時刻、ハードウェア、並行実行状態に関わらず、常にビット単位で同一の出力 $B$ を返却すること。

##### **1.1.2 グラフ構造の正規化およびシリアライズ手順** {#1.1.2-グラフ構造の正規化およびシリアライズ手順}

本規格は、メモリ上のオブジェクトグラフを一意の正準化バイト列（Canonical Byte Stream）へ変換するプロセスとして、以下の **2フェーズ・コミットプロトコル（Two-Phase Commit Protocol）** の実装を義務付ける。実装者は、この手順を厳密に遵守し、各フェーズの責務を混同してはならない。

**1\. Phase 1: 構造解析と順序決定 (Structural Analysis & Canonical Sorting)** このフェーズの目的は、IDを付与することなくグラフ全体を解析し、コンテナ（Map, Set, Object）の子要素に対するトラバーサル順序（訪問順序）を一意に確定することである。

* **比較用正規化スキーム (CCS) の使用:** 実装は、要素間の順序を決定するために、一時的な比較用バイト列（Canonical Comparison Schema: CCS）を生成しなければならない。このバイト列は、**Structural Fingerprint**（構造的特徴ハッシュ）と正規化された値の組み合わせであり、永続的なオブジェクトID（メモリアドレスや生成順序に依存する値）を含んではならない。  
* **正準ソート (Canonical Sort):** 生成された比較用バイト列に対して、バイト単位の辞書順比較（memcmp）および定義されたタイブレーク・ルールに基づき、全順序（Total Order）を決定しなければならない。言語標準のソート（Array.prototype.sort 等）の使用は禁止される。  
* **順序の固定 (KeyOrderMap):** 決定された順序は `KeyOrderMap`（またはそれに準ずる不変構造）に保存され、Phase 2 におけるトラバーサルの唯一の指針として使用されなければならない。  
* **出力の禁止:** このフェーズにおいて、最終的な出力バッファへの書き込み、および永続的な定義ID（DefID）の発行を行ってはならない（参照: 附属書A NAP-01）。

**2\. Phase 2: 決定的出力とID付与 (Deterministic Emission & ID Assignment)** このフェーズの目的は、Phase 1 で確定した順序に従ってグラフを直列化し、永続的なIDを付与することである。

* **行きがけ順走査 (Pre-order DFS):** 実装は、Phase 1 で生成された `KeyOrderMap` に従い、深さ優先探索（DFS）を行わなければならない。この際、動的なキーの再取得や再ソートを行ってはならない。  
* **分離定理 (Separation Theorem) の適用:**  
  * **Atoms (値):** Number, String, Boolean, Date などのプリミティブ値は、IDを持たず（ID=0）、常に出現位置にその値を埋め込む形式で出力しなければならない。  
  * **Containers (参照):** Object, Array, Map, Set などの複合型は、初回訪問時に一意の連番ID（1以上の整数）を付与し、定義（Definition）を出力しなければならない。  
* **参照の出力 (Reference Emission):** 既出のコンテナ（Visited Mapに存在するオブジェクト）に再遭遇した場合、実装は直ちに参照タグ（Tag 99）と当該IDを出力し、その枝の走査を終了しなければならない。これにより、循環参照を含むグラフであっても有限ステップでの停止が保証される（有限エミッション原則）。

**3\. TLV (Tag-Length-Value) フォーマットの強制** シリアライズされたデータは、本規格の附属書Bで定義される正準バイナリレイアウト（Canonical Binary Layout）に準拠しなければならない。

* **Length の定義:** Length フィールドは常に「バイト長（Byte Count）」を表さなければならない。「要素数」や「文字数」の使用は禁止される。  
* **浮動小数点数の正規化:** IEEE 754 倍精度浮動小数点数は、出力直前に正規化されなければならない。特に NaN は `0x7ff8000000000000` に統一し、負のゼロ（-0.0）は正のゼロと区別してエンコードされなければならない。

##### **1.1.3 決定論的 ID 付与プロセスおよび参照解決** {#1.1.3-決定論的-id-付与プロセスおよび参照解決}

本規格は、オブジェクトグラフ内のノードに対する識別子（ID）の付与および参照解決について、以下のルールを強制する。実装は、メモリアドレスやガベージコレクションの挙動に依存せず、論理的なグラフ構造と Phase 1 で確定された正準順序のみに基づいて ID を決定しなければならない（参照: 附属書A NAP-23）。

**1\. アトムとコンテナの厳格な分離 (The Separation Theorem)** 実装は、データ型を以下の2種類に分類し、異なる同一性（Identity）戦略を適用しなければならない（参照: v55.3 Formal Closure）。

* **Atoms (値):** Null, Boolean, Number, String, BigInt, Date は「値そのもの」を同一性とみなす。これらに対して一意な参照IDを付与してはならず（IDフィールドは常に0）、何度出現しても常に即値（Value）として出力しなければならない。アトムに対する参照（REF）ノードの生成は禁止される。  
* **Containers (参照):** Object, Array, Map, Set は「インスタンスの参照」を同一性とみなす。これらに対してのみ、出現順に基づく一意な連番ID（1以上の整数）を付与し、構造的な共有および循環参照を管理しなければならない。

**2\. ID付与のタイミングと順序 (Assignment Timing and Order)** IDの割り当ては、必ず **Phase 2 (Emission)** における **行きがけ順 (Pre-order DFS)** の初回訪問時に行われなければならない。

* **Phase 1 での禁止:** 構造解析（Phase 1）段階で永続的なIDを割り当ててはならない（参照: 附属書A NAP-17）。  
* **順序の決定源:** 訪問順序は、Phase 1 で生成された KeyOrderMap（正準ソート済みキー）によって厳密に制御されなければならない。Object.keys や Map.iterator の順序に依存したID付与は禁止される。  
* **連番性:** IDはセッションごとに1から開始される連続した整数（$\\mathbb{U}\_{53}$）であり、スキップやランダムな値を許容しない。

**3\. 参照解決と循環の処理 (Reference Resolution)** コンテナノードの再訪問時における参照解決は、以下の手順に従わなければならない。

* **Visited Map:** 実装は、現在のセッション内で訪問済みのコンテナ（メモリアドレスまたは一意なインスタンス識別子）と付与されたIDのペアを保持する Visited Map を管理しなければならない。  
* **REFノードの出力:** 既出のコンテナに遭遇した場合、直ちに参照タグ（Tag 99）と、Visited Map から取得した当該ID（Target ID）を含む参照ノードを出力し、その枝の探索を打ち切らなければならない。これにより、循環参照を含むグラフの有限停止性が保証される（有限エミッション原則）。  
* **前方参照の禁止 (No Forward Reference):** 参照ノードが指す Target ID は、その時点において既に定義・出力が完了しているコンテナのID（$Target ID \< Current Next ID$）でなければならない。未定義のIDへの参照は、Pre-order DFS の原則により論理的に発生し得ないが、実装上もこれを防止しなければならない。

#### **1.2 除外対象 (Out-of-Scope)** {#1.2-除外対象-(out-of-scope)}

##### **1.2.1 ユーザーインターフェース (UI) レイヤーおよび描画処理** {#1.2.1-ユーザーインターフェース-(ui)-レイヤーおよび描画処理}

本規格は、HACEエンジンによって生成された正準化データ（Canonical Data）の視覚的表現、およびエンドユーザーとの対話的処理（Interactivity）を適用範囲外とする。HACE準拠の実装は、以下の処理をエンジン内部（Safety Kernel, Normalization Core, Serialization Layer）に含めてはならず、これらは上位の **Application Layer (L4)** の責務として隔離されなければならない。

**1\. 視覚的レンダリング (Visual Rendering)**

* DOM (Document Object Model) 操作、Canvas API、WebGL、またはコンソール出力を用いたグラフ構造の描画処理。  
* Mermaid.js、Graphviz 等の外部ライブラリを用いたグラフのレイアウト計算およびスタイル適用。  
* これらは実行環境（ブラウザのレンダリングエンジン、フォント設定、画面解像度）に依存し、ビット単位の再現性を保証できないため、正規化プロセスからは完全に排除される。

**2\. UI 状態の管理 (UI State Management)**

* 正規化対象となる論理的なグラフ構造（FSMの状態や変数）に含まれない、一時的な表示状態。  
* 具体例：ズームレベル、スクロール位置、ウィンドウサイズ、現在選択されているノード（Active Node Highlight）、アニメーションの進行度。  
* これらの状態は「データ境界（Data Boundary）」の外側にあり、HACEエンジンへの入力（Input Snapshot）に含まれてはならない。

**3\. 同期的イベントハンドリング (Synchronous Event Handling)**

* マウス操作、キーボード入力、タッチイベント等のユーザー入力の直接的な監視および処理。  
* UIスレッド（Main Thread）をブロックする可能性のある処理。HACEエンジンは、これらUIイベントから切り離された非同期環境（例: WebWorker）で動作し、メッセージパッシングを介してのみ結果を提供することが推奨される（参照: 5.2.3 Worker 隔離）。

##### **1.2.2 ホストOS依存のファイルシステムおよびネットワークI/O** {#1.2.2-ホストos依存のファイルシステムおよびネットワークi/o}

本規格は、HACEエンジンの計算プロセス内部における、ホストオペレーティングシステム（OS）または実行ランタイム（Browser, Node.js, WASI等）に依存した一切の入出力操作（I/O）を適用範囲外とし、これらをエンジン内部に実装することを禁止する。

**1\. 直接的なI/O操作の禁止 (Prohibition of Direct I/O)**

* **ファイルシステム:** `fs` モジュール、File API、またはそれに準ずる機能を用いたディスクへの読み書き、パス解決、ファイル属性の参照。  
* **ネットワーク通信:** `fetch`、`XMLHttpRequest`、`WebSocket`、またはソケット通信を用いた外部リソースへのアクセス。  
* これらの操作は、遅延、可用性、OSごとの挙動差異（パス区切り文字、エンコーディング、タイムアウト挙動）により非決定性を引き起こすため、Safety Kernel (L0) および Normalization Core (L2) 内での実行は固く禁じられる。

**2\. オンメモリ処理の原則 (In-Memory Processing Principle)**

* HACEエンジンへの入力は、全てメモリ上に展開された静的なデータ構造（Input Snapshot または Journal）として提供されなければならない。  
* 外部リソース（ファイル、URL）からのデータ取得は、エンジンを呼び出す上位の **Application Layer (L4)** の責務であり、エンジンはその結果として渡されたバイト列またはオブジェクトのみを処理対象とする。

**3\. 非同期解決への委譲 (Delegation to Async Resolution)**

* アクション実行中に外部データの取得が必要となった場合、エンジンは自らI/Oを行わず、**AsyncPending** 状態へ遷移し、外部システムからの解決（`resolve()`）を待機するアーキテクチャを採用しなければならない（参照: 6.2 Async Resolution Protocol）。これにより、I/Oの副作用をエンジンから隔離する。

##### **1.2.3 非決定的なユーザー入力イベントの処理** {#1.2.3-非決定的なユーザー入力イベントの処理}

本規格は、ヒューマン・インターフェース・デバイス（HID）やセンサーから発生する生（Raw）の入力イベントの直接的な監視および処理を適用範囲外とし、これらを HACE エンジンの演算ループ（Microstep / Settle Loop）に直接介入させることを禁止する。

**1\. 物理時間の排除 (Exclusion of Physical Time)**

* マウスの移動軌跡、キーストロークの押下間隔、タッチ圧力、およびそれらに付随するタイムスタンプ（Wall-clock Time）。  
* これらはOSのスケジューリング、ハードウェアのポーリングレート、および人間の物理的揺らぎに依存するため、HACE エンジンが管理する論理クロック（Tick）とは厳密に分離されなければならない,。

**2\. 正規化の責務 (Normalization Responsibility)**

* ユーザー入力は、上位の **Application Layer (L4)** において、決定論的な「トリガー（Trigger）」または「コマンド（Command）」へと変換・正規化されなければならない,。  
* HACE エンジンは、正規化された入力（例: `CLICK_BUTTON_A`）のみを **Event Queue** または **Journal** を介して受動的に受け取る設計とすること,,。

**3\. 非同期割り込みの禁止 (Prohibition of Async Interrupts)**

* エンジンが計算処理（Macrostep）を実行している最中に、ユーザー入力によって処理フローを強制的に分岐させたり、コンテキスト変数を書き換えたりする行為。  
* 入力イベントは必ずキューイングされ、エンジンが安定状態（Idle）に達した時点でのみ、決定論的な順序に従って取り込まれなければならない（参照: 7.2 Event Queue Modes）,,。

---

### **2\. 引用規格 (Normative References)** {#2.-引用規格-(normative-references)}

以下の文書は、本規格の条文において引用されることにより、本規格の規定の一部を構成する。日付付きの引用規格については、引用された版のみを適用する。日付なしの引用規格については、最新版（追補を含む）を適用する。

#### **2.1 IEEE 754-2019** {#2.1-ieee-754-2019}

**IEEE Standard for Floating-Point Arithmetic**

* **適用範囲:** 本規格におけるすべての浮動小数点数（Number型）のバイナリ表現および演算規則は、IEEE 754-2019 で定義される **binary64 (倍精度浮動小数点数)** 形式に準拠しなければならない。  
* **特記事項:** HACEエンジンは、特に以下の項目について当該規格のビットレベル表現を厳密に遵守することを要求する。  
  * **NaN (Not a Number):** 正準化プロセスにおける NaN のペイロードビットの扱いは、本規格 6.1.1 節で定義される単一の正準形式 (`0x7ff8000000000000`) に統一されなければならない。  
  * **Signed Zero:** 負のゼロ (`-0.0`) と正のゼロ (`+0.0`) は、当該規格に基づき異なるビット列として区別されなければならない。

#### **2.2 The Unicode Standard, Version 15.0** {#2.2-the-unicode-standard,-version-15.0}

**The Unicode Consortium. The Unicode Standard, Version 15.0.0**

* **適用範囲:** 本規格におけるすべての文字列（String型）およびプロパティキーのエンコーディングは、Unicode 15.0 で定義される **UTF-8 Encoding Form** に準拠しなければならない。  
* **特記事項:**  
  * **正規化:** 文字列の比較およびソートにおいて使用される正規化形式は、Unicode Standard Annex \#15 で定義される **Normalization Form C (NFC)** とする。  
  * **サロゲートペア:** 孤立サロゲート（Lone Surrogates）の扱いは、本規格のセキュリティ要件に従い、置換文字（U+FFFD）への変換ではなく、厳密な検証エラー（`Error_Lock`）として処理されなければならない。

#### **2.3 ISO/IEC 10646** {#2.3-iso/iec-10646}

**Information technology — Universal Coded Character Set (UCS)**

* **適用範囲:** 本規格は、文字集合の定義およびコードポイントの割り当てにおいて、ISO/IEC 10646 を参照する。特に、C0/C1制御文字および私用領域（Private Use Area）の定義については本規格に従うものとする。  
* **特記事項:** HACEエンジンが出力する正準化バイト列は、ISO/IEC 10646 で定義されるコードポイント範囲外の値を含んではならない。

#### **2.4 RFC 2119** {#2.4-rfc-2119}

**Key words for use in RFCs to Indicate Requirement Levels**

* **適用範囲:** 本規格書で使用されるキーワード「しなければならない (MUST)」、「してはならない (MUST NOT)」、「推奨される (SHOULD)」、「推奨されない (SHOULD NOT)」、「してもよい (MAY)」は、RFC 2119 の定義に従って解釈されるものとする。  
* **定義:**  
  * **MUST:** 規格への適合のために絶対的な要件である定義。  
  * **MUST NOT:** 規格への適合のために絶対的な禁止事項である定義。

#### **2.5 RFC 5234** {#2.5-rfc-5234}

**Augmented BNF for Syntax Specifications: ABNF**

* **適用範囲:** 本規格の「附属書 B (規定): バイナリ形式仕様」および「附属書 C (規定): 規範的エンコーディング例」において記述されるストリーム構造および字句規則（Lexical Grammar）は、RFC 5234 で定義される **ABNF (Augmented Backus-Naur Form)** 記法に従う。  
* **特記事項:** HACEが出力する正規化データストリームの構文的整合性は、このABNF定義に基づいて検証可能でなければならない。

---

### **3\. 用語、定義、および適合性言語 (Terms, Definitions, and Conformance Language)** {#3.-用語、定義、および適合性言語-(terms,-definitions,-and-conformance-language)}

#### **3.1 Determinism (決定論)** {#3.1-determinism-(決定論)}

本規格において「決定論」とは、正規化エンジンが満たすべき最も基本的かつ絶対的な性質であり、**「環境に依存しないビット単位の出力完全一致性 (Environment-Agnostic Bit-Level Exactness)」** と定義される。

具体的には、任意の論理的入力グラフ $G$ に対し、HACE準拠の任意の実装 $M$ が生成する正規化バイト列（Canonical Byte Stream） $B \= M(G)$ が、以下の条件を完全に満たす状態を指す。

**1\. ビットレベル再現性 (Bit-Level Reproducibility)** 出力 $B$ は、論理的な入力 $G$ のみに依存する純粋関数 $f(G)$ の結果であり、いつ、どこで、誰が実行しても、1ビットたりとも相違してはならない。これには以下の要素が含まれる。

* **浮動小数点数の厳密性:** IEEE 754 倍精度浮動小数点数における NaN のペイロードビットや、負のゼロ（-0.0）の符号ビットに至るまで、完全に一致しなければならない。  
* **エンコーディングの厳密性:** UTF-8 文字列のバイト列、整数のエンディアン（Big-Endian）、および可変長表現の排除（固定長強制）において、揺らぎが一切許容されない。

**2\. 実装独立性 (Implementation Independence)** 出力 $B$ は、計算プロセスを実行する物理的および論理的な「実装環境」に一切依存してはならない（参照: 4.1.1 実装独立性公理）。

* **ホスト言語:** JavaScript (Double精度)、Rust/C++ (u64精度)、Python 等の実装言語による演算精度の差異や、標準ライブラリ（ソートアルゴリズム等）の挙動差異が混入してはならない。  
* **ハードウェア:** CPUアーキテクチャ（x86 vs ARM）、エンディアン（Little vs Big）、ワードサイズ（32bit vs 64bit）の違いが影響してはならない。  
* **ランタイム状態:** ガベージコレクション（GC）の発生タイミング、JITコンパイルの最適化状況、スレッドスケジューリング等の動的な要因が出力に影響を与えてはならない。

**3\. 時間独立性 (Timestamp Independence)** 出力 $B$ は、演算が実行された物理的な時刻（Wall-clock Time）に対して不変でなければならない（参照: 4.1.2 時間独立性公理）。

* **物理時刻の排除:** `Date.now()` やシステムクロックへの依存は禁止され、論理的なステップ（Tick）または固定されたタイムスタンプのみが使用されなければならない。  
* **非同期の排除:** 非同期処理（Async/Await）の解決タイミングや順序の揺らぎが、結果を変えてはならない。

**4\. アドレス独立性 (Memory Layout Independence)** 出力 $B$ は、オブジェクトの物理的なメモリ配置（Memory Layout）およびアロケーションの履歴に対して不変でなければならない（参照: 4.1.3 アドレス独立性公理）。

* **ポインタ比較の禁止:** メモリアドレス（ポインタ値）の大小比較に基づくソートやID付与は、ASLR（アドレス空間配置のランダム化）やGCによるオブジェクト移動の影響を受けるため、厳格に禁止される。  
* **挿入順序の排除:** ハッシュマップやオブジェクトへのプロパティ挿入順序（Insertion Order）に依存せず、あくまで「内容（Content）」に基づく正準ソートによって順序が決定されなければならない。

本規格では、これらの性質を完全に満たす決定論を特に **Oracle Determinism（神託的決定論）** と呼称し、単なる「動作の安定性」とは区別する。Oracle Determinism においては、1ビットの差異も「許容誤差」ではなく「規格違反（Non-conformance）」として扱われる。

#### **3.2 Canonicalization (正準化)** {#3.2-canonicalization-(正準化)}

本規格において「正準化」とは、入力された任意のデータ構造（オブジェクトグラフ）を、その論理的な内容と構造の等価性（Logical Equivalence）のみに基づいて、**一意かつ決定論的なバイト列（Canonical Byte Stream）へと変換する一連の処理工程** を指す。

この工程は、以下の厳格な変換ルールによって構成され、計算機環境ごとの「表現のゆらぎ」を完全に排除することを目的とする：

* **構造的正準化 (Structural Canonicalization):** メモリアドレスや挿入順序（Insertion Order）に依存せず、要素の内容（正規化されたバイト列表現）に基づく辞書順比較によって、コンテナ（Map, Set, Object）内の要素順序を一意に決定すること（Canonical Sort）。  
* **値的正準化 (Value Canonicalization):** 浮動小数点数における NaN のペイロードビット統一（`0x7ff8000000000000`）や、負のゼロ（-0.0）と正のゼロ（+0.0）の区別など、IEEE 754 規格の許容範囲内で生じうるビット表現の揺らぎを単一の定義済みパターンへ固定すること。  
* **参照的正準化 (Referential Canonicalization):** オブジェクトの同一性（Identity）を物理的なメモリポインタではなく、トラバーサル順序（Pre-order DFS）に基づく論理的なID（$1, 2, 3...$）によって再定義すること。

**注記:** 単なるシリアライズ（直列化）が「データの保存・復元」を主目的とするのに対し、正準化は「データの同一性証明（Identity Verification）」を主目的とする。したがって、論理的に等価な2つのグラフ $G\_1, G\_2$ が与えられた場合、出力されるバイト列 $B\_1, B\_2$ はビット単位で完全に一致しなければならない ($G\_1 \\equiv G\_2 \\iff B\_1 \= B\_2$),。

#### **3.3 Atomic Halting (原子的停止)** {#3.3-atomic-halting-(原子的停止)}

本規格において「原子的停止」とは、Safety Kernel が不変条件（Invariant）の違反、物理的制約（スタック深度や演算精度）の超過、または不正なデータエンコーディングを検出した際、直ちに全ての演算プロセスを中断し、システム状態を不可逆的な **Bottom ($\\bot$)** 状態へ遷移させる挙動を指す。

この機構は、単なる例外処理（Exception Handling）ではなく、システムの整合性を保つための以下の特性を物理的に保証しなければならない：

* **部分的出力の完全排除 (No Partial Emission):** エラー発生時点までに生成された、またはバッファリングされた出力バイト列は全て破棄されなければならない。外部観測者（Application Layer）に対しては、「完全な正準化データ」か「完全な失敗（Null/Error）」の二値のみが提示され、中途半端に生成されたデータ（Corrupted Data）の流出は一切許容されない。

* **状態の凍結と不可逆性 (State Freeze & Irreversibility):** 一度 Error\_Lock ($\\bot$) 状態に遷移したセッションは、以降いかなる入力（TriggerやData）に対しても演算を行わず、拒絶またはエラーを返し続けなければならない。この状態からの復帰は、セッションの破棄および完全な再初期化（Reset）によってのみ達成される。

* **トランザクション的整合性 (Transactional Integrity):** 出力プロセスはトランザクションとして扱われ、完了（Commit）するまでは一時的なシャドウバッファへの書き込みに留め、エラー時は即座にロールバック（破棄）される実装戦略が要求される。

#### **3.4 Safety Kernel (安全核)** {#3.4-safety-kernel-(安全核)}

本規格において「Safety Kernel」とは、アーキテクチャの最下層 (L0) に位置し、計算ロジック（L2）やデータ表現（L1）から独立して、システムの物理的制約および不変条件（Invariants）を強制的に維持する **最小特権モジュール** を指す。

このモジュールは、他のいかなるコンポーネントにも依存せず（依存方向の終端）、以下の3つのリソース境界を物理的に監視・制御する責務を負う：

1. **深度監視 (Depth Guarding):** システムコールスタックに依存せず、明示的なカウンタを用いて走査深度 ($d\_{trav} \\le 1000$) および比較深度 ($d\_{cmp} \\le 10$) を独立して監視する。これにより、循環参照や悪意あるネストによるスタックオーバーフロー（非決定的なクラッシュ）を未然に防ぐ。

2. **演算精度保証 (U53 Enforcement):** 全てのID生成、内部カウンタ、および配列インデックスの操作において、演算結果が IEEE 754 倍精度浮動小数点の仮数部で表現可能な安全整数範囲 ($0 \\le n \\le 2^{53}-1$) に収まることを検証する。オーバーフローやラップアラウンドを検知した場合は、即座に処理を停止させる。

3. **原子的停止の執行 (Execution of Atomic Halting):** 上記の境界違反、不正なメモリアクセス、または不正なエンコーディングを検知した瞬間、直ちに `Error_Lock` フラグをセットし、システム全体を不可逆的な停止状態 ($\\bot$) へ遷移させる。この状態において、Safety Kernel は一切の部分的出力（Partial Emission）を遮断する。

#### **3.5 Structural Fingerprint (構造的指紋)** {#3.5-structural-fingerprint-(構造的指紋)}

本規格において「Structural Fingerprint」とは、構造解析フェーズ（Phase 1）において、IDを持たないオブジェクト（コンテナおよびアトム）の内容と構造を一意に識別し、全順序（Total Order）を決定するために算出される **64ビット符号なし整数（Uint64）** のハッシュ値である。

この値は、以下の公理的定義に基づき計算されなければならない：

1. **順序依存性 (Order Dependency):** 単純な XOR チェックサムとは異なり、子要素の出現順序を反映する非可換（Non-commutative）なアルゴリズムを使用する。具体的には、アキュムレータに対する **回転シフト (Rotate Left 5\)** と **素数乗算 (Prime Multiplication)** を組み合わせた Wyhash 変種アルゴリズム（Algorithm ID: `0x1`）を採用する。これにより、`{A, B}` と `{B, A}` は異なる Fingerprint を持つことが保証される。

2. **算術演算モデル (Arithmetic Model):** 全ての計算は、**64-bit Unsigned Integer ($\\mathbb{Z}/2^{64}\\mathbb{Z}$)** 空間におけるリング演算として定義される。

   * **オーバーフロー:** 加算および乗算におけるオーバーフロービットは常に切り捨て（Truncate）られる。  
   * **シフト演算:** 右シフトは常に論理右シフト（Logical Right Shift, `>>>`）とし、シフト量は `& 63` でマスクされる。  
   * **初期シード:** `0x4841434556353603` (ASCII "HACEv56.3") に固定される。  
3. **構成要素 (Composition):** Fingerprint は、ノード自身の **Type Tag** と、その正規化された値を表す **Immediate Value**（3.6節参照）を混合（Mix）して生成される。コンテナの場合、子要素の Fingerprint を再帰的に合成する。

4. **循環参照の仮値 (Cycle Provisional Value):** 計算中に循環参照（Cycle）が検出された場合、無限再帰を防ぐため、当該ノードの Fingerprint として `0` ではなく、**そのコンテナの Tag ID を Mix した仮の値** を使用して計算を続行する（参照: 9.3.1）。

**注記:** Structural Fingerprint は Phase 1 におけるソートのみに使用される一時的な値であり、最終的な出力バイト列（Phase 2）には含まれない。また、ハッシュ衝突（Collision）が発生した場合は、Raw Bytes 比較によるタイブレークが行われるため、Fingerprint の一意性は決定論の必要条件ではないが、ソート性能の安定化のために高い衝突耐性が要求される。

#### **3.6 Immediate Value (即値)** {#3.6-immediate-value-(即値)}

本規格において「Immediate Value」とは、Structural Fingerprint (3.5) の計算プロセス（Mix関数への入力）において使用される、各ノードの「内容」を **64ビット符号なし整数 ($\\mathbb{Z}/2^{64}\\mathbb{Z}$)** へと射影した正規化値を指す。

この値は、データの型ごとに以下の厳格な変換ルール（v56.3 Final Freeze）に基づいて生成されなければならない。いかなる場合も、ホスト言語のデフォルトのハッシュ関数や内部メモリ表現を直接使用してはならない。

1. **プリミティブ型のマッピング:**

   * **Null:** 常に `0x0000000000000000` とする。  
   * **Boolean:** `false` は `0`、`true` は `1` とする。  
   * **Reference:** Phase 1 段階ではIDが未確定であるため、参照ノードの即値は常に `0` とする（ポインタアドレスの使用は禁止される）。  
2. **数値型のビットキャスト (Bitwise Cast):**

   * **Float64 (Number):** NaN 正規化（`0x7ff8...`）および負のゼロ（`-0.0`）の保存を行った後の IEEE 754 binary64 ビット列を、`uint64` として解釈した値を使用する。  
   * **BigInt:** 2の補数表現ではなく、「符号ビットと絶対値」に分離した形式を使用する。具体的には、符号（正=0, 負=1）を最上位ビット（MSB, 63bit目）に配置し、絶対値の下位64ビットと論理和を取った値を Mix 関数への入力とする (`(Sign << 63) | MagnitudeLow64`)。  
3. **可変長データの畳み込み:**

   * **String:** 文字列の先頭8バイト（UTF-8）と、バイト長（Length）を合成した値を使用する。具体的には、長さ情報を32ビット左シフトし、先頭バイト列と XOR を取った値を Mix 関数への入力とする (`First8Bytes ⊕ (Length ≪ 32)`)。  
     * 8バイト未満の場合は LSB（下位）側をゼロパディングし、常に上位バイト（MSB）側から詰める（Big-Endian配置）。  
4. **コンテナの再帰:**

   * **List / Map / Set:** 直下の子要素から計算された Structural Fingerprint そのものを即値として使用する。循環参照が検出された場合は、そのコンテナの Tag ID を Mix した仮の値を使用する。

#### **3.7 適合性キーワード (Conformance Keywords)** {#3.7-適合性キーワード-(conformance-keywords)}

本規格書において使用される大文字のキーワード「しなければならない (MUST)」、「してはならない (MUST NOT)」、「推奨される (SHOULD)」、「推奨されない (SHOULD NOT)」、「してもよい (MAY)」は、**IETF RFC 2119** ("Key words for use in RFCs to Indicate Requirement Levels") の定義に従って解釈されるものとする。

これらのキーワードは、HACE準拠の実装における要件レベル（Requirement Levels）を以下のように規定する。

* **MUST** (しなければならない) / **REQUIRED** (要求される) / **SHALL** (するものとする) 規格への適合のために絶対的な要件である定義。このキーワードが示された項目に違反する実装は、いかなる理由があっても本規格に準拠しているとは認められない（Non-Conformant）。

* **MUST NOT** (してはならない) / **SHALL NOT** (しないものとする) 規格への適合のために絶対的な禁止事項である定義。このキーワードが示された操作や挙動を含む実装は、本規格に準拠しているとは認められない。

* **SHOULD** (推奨される) / **RECOMMENDED** (推奨される) 特定の状況下で正当な理由がある場合に限り、その項目の無視が許容される可能性があるが、実装者はその完全な含意を理解し、慎重に検討した上でなければ、異なる動作を選択すべきではない。HACEにおいては、パフォーマンス上の理由などで例外が認められるケースに用いられるが、決定論的再現性を維持するためには原則として従うことが強く求められる。

* **SHOULD NOT** (推奨されない) / **NOT RECOMMENDED** (推奨されない) 特定の状況下でその挙動が許容される、あるいは有用である場合が存在するかもしれないが、完全な含意を理解し、慎重に検討した上でなければ実装すべきではない事項。

* **MAY** (してもよい) / **OPTIONAL** (選択できる) この項目は真に選択可能（Optional）である。ある実装はこれを含めることを選択してもよく、別の実装は除外することを選択してもよい。ただし、この機能を含まない実装であっても、他の実装（この機能を含むもの）との相互運用性（Interoperability）を維持しなければならず、逆にこの機能を含む実装も、含まない実装と連携できなければならない。

---

### **4\. 抽象データモデル (Abstract Data Model)** {#4.-抽象データモデル-(abstract-data-model)}

#### **4.1 グラフモデルの定義** {#4.1-グラフモデルの定義}

##### **4.1.1 ノード (Node) とエッジ (Edge) の抽象定義** {#4.1.1-ノード-(node)-とエッジ-(edge)-の抽象定義}

本規格において、正規化の対象となる入力データは、有限の有向グラフ $G \= (V, E)$ としてモデル化される。ここで $V$ はノード（頂点）の集合、$E$ はエッジ（辺）の集合を表す。

**1\. ノードの分類 (Separation Theorem)** ノード集合 $V$ は、**分離定理 (The Separation Theorem)** に基づき、以下の2つの互いに素な部分集合に分割される ($V \= V\_{atom} \\cup V\_{container}, V\_{atom} \\cap V\_{container} \= \\emptyset$)。

* **アトム (Atoms, $V\_{atom}$):**  
  * **定義:** 内部構造を持たない、あるいは本規格において内部走査を行わない不可分なデータ単位。  
  * **構成要素:** Null, Boolean, Number (IEEE 754), String (UTF-8), BigInt, Date (Int64 Epoch)。  
  * **性質:** アトムはグラフの「葉 (Leaf)」であり、ここから出るエッジは存在しない。その同一性 (Identity) は「値 (Value)」そのものによって定義される（Value Identity）。  
* **コンテナ (Containers, $V\_{container}$):**  
  * **定義:** 他のノードへの参照（エッジ）を保持する複合データ構造。  
  * **構成要素:** Object, Array, Map, Set。  
  * **性質:** コンテナはグラフの「節 (Internal Node)」である。その同一性は、値ではなく「グラフ内での位相的な位置（参照）」によって定義される（Reference Identity）。

**2\. エッジの定義 (Labeled Edges)** エッジ集合 $E$ は、コンテナから子ノードへの有向リンクであり、識別ラベルを持つ3つ組 $(u, v, l)$ として定義される。 $$E \\subseteq V\_{container} \\times V \\times L$$ ここで、$u$ は親コンテナ、$v$ は子ノード、$l$ はエッジを一意に識別するラベル（Label）である。

* **ラベル ($L$):**  
  * **Object / Map:** プロパティキーまたはマップキーの正規化されたバイト列。  
  * **Array:** 0 から始まる整数インデックス。  
  * **Set:** Set は数学的にはラベルを持たないが、本モデルにおいては「正規化された値そのもの」を仮想的なラベルとして扱い、一意性を区別する。  
* **順序 ($O$):**  
  * コンテナ $u$ から出るエッジの集合 $E\_u$ は、挿入順序やメモリ配置ではなく、本規格が定める **正準順序関係 (Canonical Ordering Relation, $\\prec\_{canonical}$)** によって全順序付けられていなければならない。すなわち、論理グラフ $G$ において、子ノードの並び順は決定論的に固定される。

**注記:** この抽象モデルにおいて、メモリ上のアドレス（Pointer）やオブジェクトヘッダ等の実装詳細は捨象される。HACE は、この論理グラフ $G$ の構造的等価性（Isomorphism）のみを保存し、バイト列へと写像する。

##### **4.1.2 ルートノード (Root Node) と到達可能性 (Reachability)** {#4.1.2-ルートノード-(root-node)-と到達可能性-(reachability)}

本規格において、正規化プロセスによって生成されるバイト列は、単一の **ルートノード (Root Node)** を起点として到達可能な（Reachable）オブジェクトグラフのみを表現する。

**1\. ルートノードの定義 (The Root Definition)** ルートノード $R$ は、正規化エントリーポイント関数（例: `CanonicalHash(Input)`）の引数として渡された `Input` 値そのものとして定義される。

* **暗黙的ラッピングの禁止 (No Implicit Wrapping):** 実装は、入力値を `{"root": Input}` や `[Input]` のようなコンテナで包んだり、メタデータを付加した構造をルートとして扱ってはならない。入力値がそのままグラフの始点となる。  
* **プリミティブ・ルート (Primitive Root):** 入力 `Input` がアトム（数値、文字列、Null、Undefined等）である場合、グラフは単一の AtomNode のみで構成される。この場合、Undefined は Null (Tag 1\) として正規化され出力される。

**2\. 到達可能性 (Reachability)** 正規化の対象となるノード集合 $V\_{target}$ は、ルートノード $R$ から有向エッジ $E$ を辿って到達可能なノードの集合として定義される。

$$V\_{target} \= { v \\in V \\mid R \\xrightarrow{\*} v }$$

ここで $\\xrightarrow{\*}$ は、4.1.1 で定義されたエッジ（プロパティ、インデックス、Map/Setエントリ）による推移的な到達可能性を表す。

**3\. 到達不能オブジェクトの排除 (Exclusion of Unreachable Objects)** $R$ から到達不可能なオブジェクト（Unreachable Objects）は、たとえメモリ空間上に存在し、ガベージコレクション（GC）によって回収されていない状態であっても、論理グラフ $G$ の一部とはみなされず、正規化出力には一切含まれてはならない。 HACE の出力は、論理的な到達可能性のみに依存し、ホスト環境のヒープ状態（Liveness）には依存しない。

#### **4.2 型システム (Type System)** {#4.2-型システム-(type-system)}

##### **4.2.1 プリミティブ型 (Null, Boolean, Number, String, BigInt)** {#4.2.1-プリミティブ型-(null,-boolean,-number,-string,-bigint)}

本規格におけるプリミティブ型は、**「アトム (Atoms)」** として分類され、構造を持たない不可分なデータ単位として定義される。これらは **値同一性 (Value Identity)** を持ち、メモリ上のインスタンスや参照先に関わらず、その「値」が等しければ論理的に同一であるとみなされる。 正規化プロセスにおいて、プリミティブ型ノードには一意な参照IDが付与されず（ID=0）、何度出現しても常に即値として扱わなければならない。

**1\. Null (ヌル型)**

* **定義:** 値が存在しないこと、または無効な参照を表す単一の値 `null` を持つ型。  
* **対応:** JavaScript の `null`、Python の `None`、C++ の `nullptr` に相当する。  
* **制約:** JavaScript の `undefined` は本規格のデータモデルには存在せず、文脈に応じて `Null` に変換されるか、あるいは欠損として扱われる（参照: B.3.2）。

**2\. Boolean (論理型)**

* **定義:** 論理的真理値である `true` および `false` の2値のみからなる集合 $\\mathbb{B} \= {true, false}$。  
* **制約:** 数値の `1` / `0` とは厳密に区別され、相互変換は行われない。

**3\. Number (倍精度浮動小数点数型)**

* **定義:** IEEE 754-2019 規格で定義される **binary64 (倍精度浮動小数点数)** 形式の値集合 $\\mathbb{F}\_{64}$。  
* **特異点:** 本モデルにおいては、IEEE 754 規格が許容するビット表現の揺らぎを排除し、以下の論理的制約を課す。  
  * **NaN (非数):** 全ての `NaN` は、ペイロードビットに関わらず単一の正準値（Canonical NaN）として扱われる。  
  * **Signed Zero:** 正のゼロ ($+0$) と負のゼロ ($-0$) は、数学的には等価であっても、本データモデル上では **異なる値** として区別される。  
  * **Subnormal:** 非正規化数はゼロに丸められることなく、その微小な値を保持する。

**4\. String (文字列型)**

* **定義:** Unicode スカラー値の有限列。ただし、エンコーディングとしては **UTF-8** を正とし、不正なサロゲートペア（Lone Surrogate）を含まないものに限る。  
* **正規化:** 本モデルにおける文字列の同一性は、Unicode 正規化（NFC等）適用後の結果ではなく、入力された **「生のバイト列（Raw Bytes）」** の一致によって定義される。文字列に対して「気の利いた」正規化や修正を行うことは禁止される。  
* **長さ:** 文字列の長さは、文字数（Code Point Count）ではなく、UTF-8 エンコード後の **オクテット数（Byte Count）** として定義される。

**5\. BigInt (多倍長整数型)**

* **定義:** 任意の精度を持つ整数集合 $\\mathbb{Z}$。  
* **表現:** 符号（Sign）と絶対値（Magnitude）によって構成される。  
* **制約:** `Number` 型（$\\mathbb{F}\_{64}$）とは互換性を持たない独立した型であり、自動的な型変換は行われない。また、本規格の初版レビューにおける指摘に基づき、ASCII文字列表現ではなく、バイナリ表現（符号ビット＋ビッグエンディアン絶対値）を正準形式とする。

##### **4.2.2 コンテナ型 (List, Map) と再帰構造** {#4.2.2-コンテナ型-(list,-map)-と再帰構造}

本規格におけるコンテナ型は、他のノード（アトムまたはコンテナ）への有向エッジ（参照）を保持する複合データ構造であり、**「コンテナ (Containers)」** として分類される。これらは **参照同一性 (Reference Identity)** を持ち、メモリ上のインスタンスが一意であれば、たとえ保持する内容が同一であっても、論理的に異なるノードとして扱われる（IDが付与される）。

**1\. List型 (順序付きコレクション)** List型は、要素の有限列として定義される。

* **Array (配列):**  
  * **定義:** 0 から始まる連続した整数インデックスによって要素が識別される順序付きリスト。  
  * **順序:** インデックスの昇順（$0, 1, 2, \\dots$）によって一意に決定される。  
  * **疎配列 (Sparse Array):** インデックスの欠損（Hole）は、論理的には **Null (Tag 1\)** 値が存在するものとして扱われる。存在しない（Skip）という状態は認められない。  
* **Set (集合):**  
  * **定義:** 重複しない値の集合。数学的な集合は順序を持たないが、HACE のデータモデルにおいては、正規化プロセス（Phase 1）によって決定される **正準順序 (Canonical Order)** に従ったリストとして扱われる。  
  * **制約:** 正規化後のバイト列表現において完全に一致する要素（Canonical Duplicates）が含まれる場合、それはデータ構造の矛盾とみなし、`Error_Lock` となる。

**2\. Map型 (キー付きコレクション)** Map型は、キーと値のペア（エントリ）の集合として定義される。

* **Object (オブジェクト):**  
  * **定義:** 文字列をキーとするキーバリューペアの集合。  
  * **順序:** プロパティの作成順や挿入順ではなく、キーの UTF-8 バイト列としての辞書順昇順によって一意に決定される。プロトタイプチェーン上のプロパティは含まない。  
* **Map (マップ):**  
  * **定義:** 任意のノード（アトムまたはコンテナ）をキーとするキーバリューペアの集合。  
  * **順序:** エントリの挿入順ではなく、キーの正規化された比較用バイト列（Canonical Comparison Binary）に基づく全順序によって一意に決定される。  
  * **キーの同一性:** キーの等価性は、ホスト言語の標準（例: JSの `SameValueZero`）ではなく、正規化後のバイト列の完全一致によって判定される。したがって、`+0` と `-0` は異なるキーとして扱われる。

**3\. 再帰構造とグラフ性 (Recursion and Graph Topology)** コンテナ型は、自身を含む任意のノードへの参照を保持することが許可される。これにより、データモデルは木構造（Tree）ではなく、**有向グラフ（Directed Graph）** を形成する。

* **循環参照 (Circular Reference):** 自己参照（$A \\to A$）や相互参照（$A \\to B \\to A$）などの閉路（Cycle）は、データモデルとして許容される。  
* **有限表現への展開:** 論理的には無限の深さを持つ循環構造であっても、正規化プロセスにおいては、既出のコンテナを **参照ノード (RefNode)** に置換することで、必ず有限のバイト列として表現される。  
* **到達可能性:** ルートノードからエッジを辿って到達可能なコンテナのみがグラフの構成要素となり、ID付与の対象となる。孤立した循環コンポーネントは無視される。

#### **4.3 同一性と参照 (Identity and Reference)** {#4.3-同一性と参照-(identity-and-reference)}

##### **4.3.1 参照同一性 (Reference Identity) vs 構造的等価性 (Structural Equality)** {#4.3.1-参照同一性-(reference-identity)-vs-構造的等価性-(structural-equality)}

本規格は、オブジェクトの「等しさ」に関して、**参照同一性 (Reference Identity)** と **構造的等価性 (Structural Equality)** という2つの異なる概念を厳密に区別し、データ型および処理コンテキストに応じて以下のように適用することを強制する。

**1\. 参照同一性 (Reference Identity)** 参照同一性とは、メモリ上またはシステム上における「インスタンスの一意性」に基づく同一性である。

* **適用対象:** コンテナ型（Object, Array, Map, Set）。  
* **定義:** 2つのコンテナ $A, B$ は、それらがメモリ上で同一のアドレス（または一意なハンドル）を共有している場合にのみ、参照的に同一である ($A \\equiv\_{ref} B$) とみなされる。  
* **HACEにおける扱い:**  
  * **ID付与:** 正規化プロセス（Phase 2）において、一意な定義ID（DefID $\\ge 1$）は、この参照同一性に対してのみ付与される。  
  * **内容との独立性:** コンテナ $A, B$ が保持する内容（キーと値）が完全に同一であっても、それらが別個のインスタンスであるならば、論理的に異なるノードとして扱われ、それぞれ異なる ID が付与されなければならない。  
  * **循環検知:** 循環参照（Cycle）の判定は、構造的等価性ではなく、必ず参照同一性に基づいて行われなければならない（参照: 7.2.4.3 Cycle Identity）。

**2\. 構造的等価性 (Structural Equality)** 構造的等価性とは、ノードが保持する「値（バイト列としての表現）」に基づく等価性である。

* **適用対象:** アトム型（Null, Boolean, Number, String, BigInt, Date）および Phase 1 におけるソート比較。  
* **定義:** 2つのノード $A, B$ は、正規化されたバイト列表現（Canonical Byte Stream）がビット単位で完全一致する場合に、構造的に等価である ($A \\equiv\_{struct} B$) とみなされる。  
* **HACEにおける扱い:**  
  * **アトムの同一性:** アトム型において、構造的等価性は参照同一性と同義とみなされる。値が等しいアトムは、グラフ上で何度出現しても論理的に同一の「即値」として扱われ、固有のIDを持たない（ID=0）。  
  * **正準ソート:** Phase 1 におけるコンテナ要素の順序決定は、参照同一性（メモリアドレス）ではなく、純粋に構造的等価性（Comparison Binary の辞書順比較）に基づいて行われなければならない。

**3\. 分離定理の適用 (Application of The Separation Theorem)** 実装は、以下のマトリクスに従って同一性判定を行わなければならない。

| データ型分類 | 同一性の基準 | ID付与 | REF化の可否 |
| ----- | ----- | ----- | ----- |
| **Atoms** (値) | 構造的等価性 (Value) | なし (ID=0) | 不可 (常に即値出力) |
| **Containers** (参照) | 参照同一性 (Instance) | あり (ID $\\ge$ 1\) | 可 (再訪時はTag 99\) |

**注記:** 分散システムや永続化データなど、物理的なメモリアドレスが利用できない環境においては、セッション内で一意かつ不変な **「安定ノード識別子 (Stable Node ID)」** を用いて参照同一性を代替してもよい（MAY）。ただし、その識別子の大小関係を出力順序（ソート）に用いることは、アドレス独立性公理（4.1.3）により禁止される。

##### **4.3.2 循環参照 (Circular Reference) の意味論** {#4.3.2-循環参照-(circular-reference)-の意味論}

本規格のデータモデルは有向グラフ（Directed Graph）であり、ノードが自身、あるいは自身の祖先ノードへのエッジを持つ「循環参照（閉路）」を許容する。HACE エンジンは、この循環構造に対して以下の意味論を適用し、無限ループに陥ることなく有限の表現へ収束させなければならない（有限エミッション原則）。

**1\. 参照ベースの循環検知 (Reference-Based Detection)** 循環の判定は、ノードの内容（構造的等価性）ではなく、**参照同一性（Reference Identity）** に基づいて行われなければならない（参照: 附属書A NAP-19）。

* **定義:** 現在の探索パス（Recursion Stack）上に存在するコンテナインスタンスと同一のインスタンスに再遭遇した場合、それを「循環（Cycle）」とみなす。  
* **構造的循環の除外:** 内容が完全に同一であっても、別個のインスタンスであれば、それは循環ではなく「等価な別ノード」として扱われる。これにより、意図しない構造の畳み込み（Merge）を防止する。

**2\. フェーズごとの解決戦略 (Phase-Specific Resolution)** 実装は、処理フェーズに応じて異なる戦略で循環を解決しなければならない。

* **Phase 1 (構造解析): 仮値による切断 (Provisional Value Cut)**

  * 順序決定（ソート）のためにFingerprintを計算する際、循環を検知した時点で再帰を打ち切り、そのノードの値を **「仮のフィンガープリント（Provisional Fingerprint）」** として扱わなければならない。  
  * **仮値の定義:** 仮値は `0` 固定ではなく、そのコンテナの **Tag ID を Mix した値** を使用する（$Provisional \= Mix(TagID)$）。これにより、自己参照する List (Tag 16\) と Map (Tag 17\) が、ソート段階で区別されることを保証する（参照: v56.3 Final Freeze）。  
* **Phase 2 (出力): 参照ノードへの置換 (RefNode Substitution)**

  * ID付与を伴う出力プロセスにおいて、既出（Visited Mapに存在）のコンテナに再遭遇した場合、その枝の展開を直ちに停止し、**参照ノード (RefNode: Tag 99\)** に置換しなければならない。  
  * **Target ID:** 参照ノードのペイロードには、初回訪問時に付与された定義ID（DefID）が格納される。

**3\. 共有参照との区別 (Distinction from Shared References)** 循環参照（Cycle）と、DAG（有向非巡回グラフ）における共有参照（Shared Reference / Diamond dependency）は厳密に区別される。

* **Cycle:** 現在のスタック（祖先）に含まれるノードへの参照。無限再帰の原因となるため、仮値またはREFで切断される。  
* **Shared:** 訪問済み（Visited）ではあるが、現在のスタックには含まれない（兄弟や従兄弟にあたる）ノードへの参照。Phase 1 においては循環とはみなされず、深さ制限（$d\_{cmp} \\le 10$）の範囲内で正規に展開・比較される。

---

### **5\. 抽象正準化意味論 (Abstract Canonicalization Semantics)** {#5.-抽象正準化意味論-(abstract-canonicalization-semantics)}

#### **5.1 抽象操作 (Abstract Operations)** {#5.1-抽象操作-(abstract-operations)}

##### **5.1.1 `Canonicalize(Node) -> Bytes`** {#5.1.1-canonicalize(node)-->-bytes}

抽象操作 `Canonicalize` は、任意の入力ノード $N$ を起点とするオブジェクトグラフ $G$ を、決定論的な正準化バイト列 $B$ へと変換する純粋関数である。本操作は、以下の厳密な手順（2フェーズ・コミットプロトコル）に従って実行されなければならない。

**1\. 初期化 (Initialization)**

* 新しい正規化セッションコンテキスト $C\_{session}$ を生成する。これには、リソース監視のための **Safety Kernel**、一時的なメモリ管理のための **Binary Arena**、および状態管理のための各種マップが含まれる。  
* 大域的な ID カウンタ $ID\_{next}$ を $1$ に初期化する。  
* 出力バッファ $Buffer\_{out}$ を空の状態（またはヘッダのみの状態）で初期化する。

**2\. Phase 1: 構造解析 (Structure Analysis)**

* 入力ノード $N$ を起点にグラフを走査し、全てのコンテナノード（Map, Set, Object）について、その子要素の **正準順序 (Canonical Order)** を決定する。  
* **比較用正規化スキーム (CCS):** 順序決定には、各要素から生成した一時的な「比較用バイト列（Comparison Binary）」の辞書順比較（memcmp）を用いる。  
* **順序の固定:** 決定された順序は `KeyOrderMap` に記録され、凍結される。  
* **制約:** このフェーズにおいて、永続的な定義ID（DefID）の割り当て、および $Buffer\_{out}$ への書き込みを行ってはならない（参照: 9.1.1）。

**3\. Phase 2: 決定的出力 (Deterministic Emission)**

* Phase 1 で確定した `KeyOrderMap` を唯一の指針とし、グラフを **行きがけ順 (Pre-order DFS)** で再走査する。  
* 各ノード $n \\in G$ について、以下の **分離定理 (Separation Theorem)** に基づき処理を行う：  
  * **Atoms:** ID を付与せず（常に $ID=0$）、その正規化された即値ペイロードを含む **AtomNode** を出力する。  
  * **Containers (初回訪問):** 現在の $ID\_{next}$ を割り当て、$ID\_{next} \\leftarrow ID\_{next} \+ 1$ とする。このIDを持つ **ContainerDefNode** を出力し、子要素を再帰的に処理する。  
  * **Containers (再訪問):** 割り当て済みのIDを取得し、そのターゲットIDを含む **RefNode** を出力して、その枝の探索を終了する。  
* 全ての出力は、本規格の「8. 正準バイナリレイアウト」に準拠した TLV (Tag-Length-Value) 形式で $Buffer\_{out}$ に追記される。

**4\. 終了と検証 (Finalization)**

* **原子的停止 (Atomic Halting):** 処理中に Safety Kernel による `Error_Lock` が発生した場合、$Buffer\_{out}$ の内容は即座に破棄され、操作の結果は $\\bot$ (Bottom) となる。  
* **完了:** エラーなく全探索が終了した場合、$Buffer\_{out}$ のバイト列を結果 $B$ として返却する。

**数学的性質:** 本操作は、外部状態（時刻、メモリアドレス、乱数）に一切依存しない。論理的に等価な任意の2つのグラフ $G\_1, G\_2$ に対し、以下の等式が常に成立する。 $$ G\_1 \\equiv G\_2 \\implies Canonicalize(G\_1) \= Canonicalize(G\_2) $$

##### **5.1.2 `Fingerprint(Node) -> UInt64`** {#5.1.2-fingerprint(node)-->-uint64}

抽象操作 `Fingerprint` は、任意のノード $N$ の構造的特徴と値を、**64ビット符号なし整数 ($\\mathbb{U}\_{64}$)** へと射影する純粋関数である。この値は、Phase 1 におけるコンテナ要素の正準順序（Canonical Sort Order）を決定するための一次キーとして使用される。

実装は、以下の算術モデルおよびアルゴリズムに従って、ビット単位で正確に計算しなければならない。

**1\. 算術演算モデル (Arithmetic Model)** 全ての計算は、リング $\\mathbb{Z}/2^{64}\\mathbb{Z}$ 上で行われる。

* **Wrapping:** 加算 ($+$) および乗算 ($\\times$) におけるオーバーフロービットは常に切り捨てられる（Modulo $2^{64}$）。  
* **Logical Shift:** 右シフト ($\\ggg$) は常に論理右シフト（ゼロ埋め）とし、符号拡張を行ってはならない（参照: v56.3 Absolute Edition）。シフト量は常に `& 63` でマスクされる。

**2\. アルゴリズム定数 (Constants)**

* **Seed ($H\_0$):** `0x4841434556353603` (ASCII "HACEv56.3")  
* **Prime 1 ($P\_1$):** `0xff51afd7ed558ccd`  
* **Prime 2 ($P\_2$):** `0xc4ceb9fe1a85ec53`  
* **Prime 3 ($P\_3$):** `0x9e3779b97f4a7c15`

**3\. 混合関数 (Mix Function)** 入力 $v$ ($\\mathbb{U}\_{64}$) を拡散させるための可逆関数 $Mix(v)$ を以下の通り定義する（Wyhash系変種）。 $$ \\begin{aligned} v\_1 &= v \\oplus (v \\ggg 33\) \\ v\_2 &= v\_1 \\times P\_1 \\ v\_3 &= v\_2 \\oplus (v\_2 \\ggg 33\) \\ v\_4 &= v\_3 \\times P\_2 \\ result &= v\_4 \\oplus (v\_4 \\ggg 33\) \\end{aligned} $$

**4\. 即値の取得 (Immediate Value Extraction)** 各ノード $N$ から、型に応じた即値 $I(N)$ を生成する（参照: v56.3 Ultimate Edition）。

| ノード型 ($Type$) | 即値 $I(N)$ の生成ルール |
| ----- | ----- |
| **Null** | `0` |
| **Boolean** | `false` $\\to 0$, `true` $\\to 1$ |
| **Number** | 正規化された IEEE 754 64bit ビット列 (`NaN`\=`0x7ff8...`, `-0`維持) の `uint64` キャスト |
| **String** | $Mix(First8Bytes \\oplus (Length \\ll 32))$※ 8バイト未満はMSB側に詰め、LSB側を0パディングする。※ 文字列長 $Length$ を上位32ビットへシフトして混合する。 |
| **BigInt** | $Mix((Sign \\ll 63\) \\lor MagnitudeLow64)$※ 符号ビット(負=1)をMSBに配置し、絶対値の下位63ビットと合成する。 |
| **Container** | 再帰的に計算された子要素の合成ハッシュ（後述）。 |
| **Cycle** | $Mix(TagID)$※ 循環参照検出時は、そのコンテナの型タグIDを即値とする（`0`固定ではない）。 |

**5\. 構造ハッシュの計算 (Structural Hashing)** コンテナノード $C$ の Fingerprint $F(C)$ は、その直下の子要素集合 $E \= {e\_1, e\_2, \\dots, e\_n}$ （入力順序）に対して、以下のアキュムレータ更新を行うことで算出される。

1. **初期化:** アキュムレータ $H \\leftarrow H\_0$  
2. **反復:** 各要素 $e\_i$ について以下を実行：  
   * **回転:** $H \\leftarrow (H \\ll 5\) \\lor (H \\ggg 59)$ （順序依存性の確保）  
   * **合成:** $H \\leftarrow H \\oplus Mix(Tag(e\_i) \\oplus I(e\_i))$  
   * **拡散:** $H \\leftarrow H \\times P\_3$  
3. **終了:** $F(C) \\leftarrow H \\oplus Length(E)$

**注記:** このアルゴリズムにより、構造的に等価なグラフは同一のFingerprintを持つことが保証される一方、要素の順序が異なるグラフ（例: `{A, B}` vs `{B, A}`）は回転操作により異なるFingerprintを持つことが保証される。

##### **5.1.3 `Sort(Set) -> List`** {#5.1.3-sort(set)-->-list}

抽象操作 `Sort` は、順序を持たないノードの有限集合 $S \= {n\_1, n\_2, \\dots, n\_k}$ を入力とし、本規格が定める **正準順序関係 (Canonical Ordering Relation, $\\prec\_{canonical}$)** に基づいて整列されたリスト $L \= \[l\_1, l\_2, \\dots, l\_k\]$ を生成する純粋関数である。

本操作は、以下の厳密な手順に従って実行されなければならない。

**1\. 比較用トークンの生成 (Token Generation)** 集合 $S$ の各要素 $n \\in S$ に対し、Phase 1 の規則（Comparison Grammar）に従って一時的な比較用トークン $T\_n$ を生成する。トークンは以下のタプルで構成される。 $$T\_n \= \\langle Fingerprint(n), Tag(n), Length(n), Bytes(n) \\rangle$$

* **Fingerprint:** 5.1.2 で算出された64ビットハッシュ値。  
* **Bytes:** IDを含まない、再帰的な比較用バイト列（循環参照は `CycleMarker` で停止）。

**2\. 決定論的ソート (Deterministic Sorting)** 生成されたトークン集合に対し、以下の優先順位を持つ比較関数 $Compare(A, B)$ を適用して全順序を決定する（参照: 9.4 決定論的タイブレーク）。

1. **Fingerprint:** $A.Fingerprint \< B.Fingerprint \\implies A \\prec B$  
2. **Tag ID:** $A.Tag \< B.Tag \\implies A \\prec B$  
3. **Length:** $A.Length \< B.Length \\implies A \\prec B$  
4. **Raw Bytes:** バイト列の符号なし辞書順比較 (memcmp)。

**3\. 一意性検証 (Uniqueness Verification)** ソート後のリストにおいて、隣接する要素 $l\_i, l\_{i+1}$ の比較用トークンが完全に一致する場合 ($Compare(l\_i, l\_{i+1}) \= 0$)、これを **カノニカル重複 (Canonical Duplication)** と判定する。

* **Setの場合:** 論理的に「重複なし」であるはずの集合に、正規化結果が同一となる要素が含まれていることはデータ構造の矛盾とみなし、直ちに **Error\_Lock ($\\bot$)** を発動しなければならない。  
* **Mapの場合:** キーに対して同様の検証を行い、キーの重複があれば Error\_Lock とする。

**4\. 出力 (Output)** 検証を通過した場合、整列されたノードのリスト $L$ を結果として返す。 $$L \= Sort\_{\\prec\_{canonical}}(S)$$

#### **5.2 決定論の基本定理 (The Grand Theorem)** {#5.2-決定論の基本定理-(the-grand-theorem)}

##### **5.2.1 実装独立性公理 (Implementation Independence Axiom)** {#5.2.1-実装独立性公理-(implementation-independence-axiom)}

HACEに準拠する任意の正規化プロセス $P$ は、入力グラフ $G$ を正準化バイト列 $B$ へ写像する純粋関数として定義されなければならない。この写像において、生成されるバイト列 $B$ は、プロセスを実行する物理的および論理的な「実装環境（Environment）」に一切依存してはならない。

すなわち、異なる2つの実装環境 $E\_1, E\_2$ （異なるプログラミング言語、コンパイラ、CPUアーキテクチャ、OSを含む）において、論理的に等価な入力 $G$ が与えられた場合、出力されるバイト列 $B\_1, B\_2$ はビット単位で完全に一致しなければならない。

$$ \\forall G, \\forall E\_1, E\_2 : P(G, E\_1) \\equiv P(G, E\_2) $$

本公理を満たすため、実装は以下の要素への依存を完全に排除しなければならない（MUST NOT）：

1. **メモリアドレスおよび配置 (Memory Layout & Addresses):** オブジェクトのポインタ値、メモリアドレス、またはヒープ上の配置順序を、ソートキー、ID生成、あるいはハッシュ計算の入力として使用してはならない。ASLR (Address Space Layout Randomization) やアロケータの挙動差による非決定性を排除するため、同一性は「トラバーサル順序に基づく相対的な一意性（Relative Identity）」によってのみ確立されなければならない,。

2. **ランタイム固有の挙動 (Runtime-Specific Behaviors):** ホスト言語の標準ライブラリ（例: JavaScriptの `Array.prototype.sort` の不安定性、Pythonの `dict` の順序、Rustの `HashMap` のシード）の未定義動作や実装依存の挙動に依存してはならない。正規化ロジックは、本規格で定義されるアルゴリズムのみを用いて閉じていなければならない。

3. **ガベージコレクションの副作用 (GC Side-effects):** ガベージコレクション（GC）の発生タイミングや、オブジェクトの生存期間（Liveness）が、出力結果（特にWeakMapの列挙やID再利用など）に影響を与えてはならない。メモリ管理は、論理的なグラフ構造のトラバーサルとは直交していなければならない。

4. **並行実行およびスケジューリング (Concurrency & Scheduling):** スレッドのスケジューリング、競合状態（Race Condition）、または非同期処理の完了順序が出力に影響を与えてはならない。HACEエンジンは、外部からは単一の原子的操作（Atomic Operation）、あるいは厳密に順序付けられた（Serialized）操作列として振る舞わなければならない。

##### **5.2.2 時間・アドレス・言語独立性公理 (Time, Address, and Language Independence Axiom)** {#5.2.2-時間・アドレス・言語独立性公理-(time,-address,-and-language-independence-axiom)}

HACEエンジンによって生成される正準化バイト列 $B \= P(G)$ は、入力グラフ $G$ の論理的な構造と内容のみに依存する純粋関数であり、以下の3つの外部要因（時間、メモリ、言語）に対して完全に不変（Invariant）でなければならない。

**1\. 時間独立性 (Timestamp Independence)** 正規化結果は、処理が実行された物理的な時刻（Wall-clock Time） $t$ および経過時間に対して不変である。 $$ \\forall G, \\forall t\_1, t\_2 : P(G, t\_1) \\equiv P(G, t\_2) $$

この公理を満たすため、実装は以下の制約を遵守しなければならない（MUST）：

* **物理時刻参照の禁止:** 正規化ロジックの内部において、ホストシステムの現在時刻を取得するAPI（例: `Date.now()`, `System::time()`）を使用してはならない。時間経過が必要な場合は、外部から注入された固定の「論理クロック（Logical Tick）」のみを使用すること。  
* **Dateオブジェクトの静的化:** `Date` 型は動的なオブジェクトではなく、Unix Epoch (1970-01-01T00:00:00Z) からの経過ミリ秒を表す **符号付き64ビット整数 (Int64)** として扱い、タイムゾーン情報を排除して正規化しなければならない。  
* **非同期タイミングの排除:** 非同期処理の完了順序や `setTimeout` 等のタイマーによる遅延が、出力バイト列の順序や内容に影響を与えてはならない。

**2\. アドレス独立性 (Address Independence)** 正規化結果は、オブジェクトの物理的なメモリ配置（Memory Layout） $M$ およびアロケーションの履歴に対して不変である。 $$ \\forall G, \\forall M\_1, M\_2 : P(G, M\_1) \\equiv P(G, M\_2) $$

この公理を満たすため、実装は以下の制約を遵守しなければならない（MUST）：

* **ポインタ比較の禁止:** オブジェクトのメモリアドレス（ポインタ値）、参照ID、またはハンドル値を、ソートキー、ハッシュ計算のシード、あるいはID生成の入力として使用してはならない。ASLR（アドレス空間配置のランダム化）やGCによるオブジェクト移動の影響を受けるためである。  
* **挿入順序への依存排除:** コンテナ（Map, Set, Object）の要素順序として、メモリへの挿入順序（Insertion Order）や生成順序（Allocation Order）を使用してはならない。必ず Phase 1 で生成された内容ベースの比較バイナリ（Comparison Binary）によるソートを経由しなければならない。  
* **ガベージコレクション透過性:** ガベージコレクション（GC）の実行タイミングや回数が、出力結果（特にWeakMapの列挙やID再利用など）に影響を与えてはならない。

**3\. 言語独立性 (Language Independence)** 正規化結果は、処理を実行するプログラミング言語 $L$ やランタイム環境（コンパイラ、VM）の仕様差異に対して不変である。 $$ \\forall G, \\forall L\_1, L\_2 : P(G, L\_1) \\equiv P(G, L\_2) $$

この公理を満たすため、実装は以下の制約を遵守しなければならない（MUST）：

* **言語標準ソートの禁止:** 言語が提供する標準のソート関数（例: `Array.prototype.sort`, `std::sort`）を、比較関数を明示せずに使用してはならない。ロケール依存や安定性の違いを排除するため、本規格で定義される `memcmp` 相当のバイト比較ロジックを実装しなければならない。  
* **浮動小数点数の厳密化:** 言語ごとの浮動小数点演算の差異（例: `NaN` のペイロードビット、`-0.0` の扱い）を排除するため、IEEE 754 ビットパターンへの正規化（Canonicalization）を強制しなければならない。  
* **整数精度の統一:** JavaScript（Double精度）と Rust/C++（64bit整数）の差異を埋めるため、全てのIDおよび内部カウンタは $\\mathbb{U}\_{53}$ （$0 \\le n \\le 2^{53}-1$）の範囲内で演算され、かつバイナリ出力時は **Big-Endian 64bit** に統一されなければならない。

#### **5.3 有限エミッション原則 (Finite Emission Principle)** {#5.3-有限エミッション原則-(finite-emission-principle)}

##### **5.3.1 出力バイト列の有限性保証** {#5.3.1-出力バイト列の有限性保証}

HACE準拠の実装は、任意の入力グラフ $G$ に対し、生成される正規化バイト列 $B$ の長さ $|B|$ が有限整数（Finite Integer）に収束することを、以下の3つの物理的制約によって保証しなければならない。

**1\. 定義の単回性 (Singularity of Definition)** 単一の正規化セッションにおいて、同一のコンテナオブジェクト（Object, Array, Map, Set）に対する定義ノード（Definition Node: Tag 7-10）の出力は、最大で1回のみ行われなければならない。

* **彩度飽和 (Saturation):** 一度定義が出力されたコンテナは「飽和（Saturated）」状態とみなされる。  
* **参照への置換:** 飽和したコンテナに対する2回目以降のアクセスは、必ず参照ノード（REF Node: Tag 99）に置換されなければならない。REFノードはターゲットIDのみを持つ固定長（または対数オーダーの長さ）の構造であるため、これにより循環参照を含むグラフの出力発散は物理的に阻止される。

**2\. 物理的深度境界 (Physical Depth Boundary)** 実装は、グラフの論理的な深さが無限、あるいはリソースの許容量を超える場合に対し、以下の **Safety Kernel** による強制停止機構を備えなければならない。

* **トラバーサル深度 ($d\_{trav}$):** 出力フェーズにおける再帰深さが $d\_{trav} \> 1000$ に達した場合、実装は直ちに Error\_Lock 状態へ遷移し、出力を $\\bot$ (Bottom) として打ち切らなければならない。これにより、スタックオーバーフローや意図的な攻撃（Deeply Nested JSON Attack）によるリソース枯渇を防止する。  
* **比較深度 ($d\_{cmp}$):** 構造解析フェーズ（Phase 1）における比較深度が $d\_{cmp} \> 10$ に達した場合、実装は比較用ストリームに LimitTag (255) を注入し、その枝の探索を即座に終了しなければならない。これにより、ソート処理が無限再帰に陥ることを防ぐ。

**3\. ストリーム長の決定性 (Determinism of Length)** 出力される全ての TLV (Tag-Length-Value) 構造において、Length フィールドは有限のバイト長（Byte Count）でなければならない。

* 無限長ストリーム（Infinite Stream）や、終了条件がデータの内容に依存する「チャンク転送（Chunked Encoding）」のような形式の使用は禁止される。すべてのコンテナは、その内容の合計バイト長が確定した状態で出力されなければならない。

##### **5.3.2 循環参照および無限再帰の有限解決義務** {#5.3.2-循環参照および無限再帰の有限解決義務}

HACE準拠の実装は、入力グラフ $G$ が自己参照（Self-Reference）、相互参照（Mutual Recursion）、または過度な深さを持つ場合であっても、正規化プロセスが決して無限ループに陥らないことを、以下の3つのメカニズムによって保証しなければならない。

**1\. コンテナサイクルの参照置換 (Reference Substitution for Containers)** Phase 2（出力フェーズ）において、実装は現在の正規化セッション内で定義済み（Defined）のコンテナオブジェクトを追跡する `Visited Map` を維持しなければならない。

* **再訪時の置換:** トラバーサル中に `Visited Map` に登録済みのコンテナ（Object, Array, Map, Set）に再遭遇した場合、実装は直ちにその枝の探索を打ち切り、代わりに **参照ノード (REF Node: Tag 99\)** を出力しなければならない。  
* **展開の禁止:** 既出コンテナの再展開（プロパティの再出力）は厳格に禁止される。これにより、論理的な閉路を持つグラフは、有限個の定義ノードと有限個の参照ノードを持つ木構造へと変換される。

**2\. 比較フェーズにおける循環検知 (Cycle Detection in Phase 1\)** Phase 1（構造解析フェーズ）における比較用バイト列（Comparison Stream）の生成時においては、IDが未確定であるため、参照IDによる解決は不可能である。したがって、以下の手順で構造的に循環を検知し、特殊タグで打ち切らなければならない。

* **Ancestors Stack 監視:** 比較関数は、現在の探索ルートから現在地までの「祖先ノードの集合」を保持する。訪問しようとする子ノードがこのスタックに含まれる場合、それを「循環」と判定する。  
* **Cycle Tag (254):** 循環を検知した場合、子ノードのコンテンツを再帰的に展開する代わりに、**CycleMarker (Tag 254\)** を比較ストリームに出力し、直ちにその枝の探索を終了する。  
* **仮のフィンガープリント (Provisional Fingerprint):** 循環検知時のフィンガープリント計算においては、`0` 固定ではなく、そのコンテナの **Tag ID を Mix した値** ($Provisional \= Mix(TagID)$) を使用する。これにより、自己参照する List と Map がソート段階で区別されることを保証する。

**3\. 共有参照との区別 (Distinction from Shared References)** 実装は、循環参照（Cycle）と、DAG（有向非巡回グラフ）における共有参照（Shared Reference / Diamond dependency）を厳密に区別しなければならない（参照: 附属書A NAP-19）。

* **判定基準:** 循環検知は、構造的等価性（Structural Equality）ではなく、必ず **参照同一性（Reference Identity）** に基づいて行われなければならない。  
* **共有参照の扱い:** `Visited`（探索済み）ではあるが `Ancestors Stack`（現在の祖先）には含まれないノードは、循環ではなく共有参照である。これは CycleMarker としてはならず、そのまま内容を展開して比較を行う（ただし深さ制限 $d\_{cmp} \\le 10$ に従う）。

**4\. 物理的深度境界による強制停止 (Physical Depth Hard Limits)** 論理的な循環検知をすり抜ける病的なケース（例: 毎回異なるインスタンスを生成し続ける無限リスト）に対し、以下の物理的制約を最終防壁として適用しなければならない。

* **比較深度 ($d\_{cmp}$):** Phase 1 における再帰深度が $d\_{cmp} \> 10$ に達した場合、実装は **LimitTag (255)** を注入し、その枝を打ち切らなければならない。これはエラーではなく、ソートキーの長さを制限する正常な挙動とする。  
* **走査深度 ($d\_{trav}$):** Phase 2 における再帰深度が $d\_{trav} \> 1000$ に達した場合、実装はこれを「処理不能な複雑度」とみなし、直ちに `Error_Lock` を発動してセッション全体を **原子的停止（Atomic Halting）** させなければならない。

---

### **6\. アーキテクチャと運用意味論 (Architecture and Operational Semantics)** {#6.-アーキテクチャと運用意味論-(architecture-and-operational-semantics)}

#### **6.1 層構造 (Layered Architecture)** {#6.1-層構造-(layered-architecture)}

##### **6.1.1 L0: Safety Kernel (Invariant Layer)** {#6.1.1-l0:-safety-kernel-(invariant-layer)}

**Safety Kernel（安全核）** は、HACEアーキテクチャの最下層に位置し、計算ロジック（L2）やデータ表現（L1）から独立して、システムの物理的制約および不変条件（Invariants）を強制的に維持する **最小特権モジュール** である。本モジュールは他のいかなる層にも依存してはならず（依存方向の終端）、以下の4つの機能を実装しなければならない（MUST）。

**1\. 原子的停止機構 (Atomic Halting Mechanism)** Safety Kernel は、システムの健全性状態を管理する `Error_Lock` フラグを保持し、異常発生時の挙動を物理的に制御する。

* **状態遷移:** 不変条件の違反、リソース制限の超過、または不正なデータシーケンスを検知した場合、Kernel は直ちにシステム状態を正常から **Error\_Lock ($\\bot$)** へ不可逆的に遷移させなければならない。  
* **出力の遮断:** `Error_Lock` 状態において、Kernel は上位層からのいかなる出力要求も拒絶し、それまでに生成された一時バッファ（Shadow Buffer）を即座に破棄または無効化しなければならない。部分的出力（Partial Emission）の残留は許容されない。  
* **Bottom の伝播:** Kernel は例外送出（Throw）に依存せず、API の戻り値として明示的な「失敗（Bottom）」を返し、上位層での処理継続を物理的に不可能にしなければならない。

**2\. 二重深度ガード (Dual Depth Guards)** システムコールスタックに依存せず、以下の2つの独立したカウンタを用いて再帰深度を監視しなければならない（参照: 附属書A NAP-18）。

* **走査深度 ($d\_{trav}$):** 出力フェーズ（Phase 2）におけるグラフ探索の深さを監視する。$d\_{trav} \> 1000$ を検知した場合、Kernel はこれを「リソース枯渇の危険」とみなし、即座に `Error_Lock` を発動しなければならない。  
* **比較深度 ($d\_{cmp}$):** 構造解析フェーズ（Phase 1）におけるソート用比較の深さを監視する。$d\_{cmp} \> 10$ を検知した場合、Kernel はエラーではなく LimitTag (255) の注入を指示し、比較処理を安全に打ち切らなければならない（参照: 10.1.1）。

**3\. U53 算術エンフォーサー (U53 Arithmetic Enforcer)** 全ての ID 生成、カウンタ操作、および配列インデックス計算において、演算結果が IEEE 754 倍精度浮動小数点の仮数部で表現可能な安全整数範囲 $\\mathbb{U}\_{53} \= { n \\in \\mathbb{Z} \\mid 0 \\le n \\le 2^{53}-1 }$ の範囲内であることを検証しなければならない。

* **オーバーフロー阻止:** 加算およびインクリメント操作は `checked_add` 相当のラッパー関数を介して行い、範囲外となる演算は即座に `Error_Lock` を引き起こさなければならない。ラップアラウンド（巻き戻り）や精度喪失は禁止される。

**4\. セッション隔離 (Session Isolation)** Safety Kernel のインスタンスは、正規化セッション（CanonicalHash の1回の呼び出し）ごとに生成され、セッション終了とともに破棄されなければならない。

* **シングルトンの禁止:** グローバル変数や静的メンバとして Safety Kernel を実装してはならない（参照: 附属書A NAP-03）。これは並行実行時における `Error_Lock` 状態の汚染を防ぐためである。

##### **6.1.2 L1: Canonical Encoders (Stateless Layer)** {#6.1.2-l1:-canonical-encoders-(stateless-layer)}

**L1: Canonical Encoders** は、システムにおける「形式 (Format)」を司るステートレスなレイヤーである。この層は、プリミティブ値やタプル構造を入力とし、規定されたエンコーディング規則に従って一意のバイト列を返す **純粋関数 (Pure Functions)** のみで構成されなければならない。

本レイヤーは L0 (Safety Kernel) の提供する数値型検証機能のみに依存し、上位層である L2 (Traversal Engine) の状態（訪問済みマップや再帰深度など）には一切依存してはならない。

**1\. IEEE 754 Canonicalizer (浮動小数点正規化器)** すべての浮動小数点数 (Number型) の書き込みは、本モジュールを経由しなければならない。

* **NaN 正規化:** 入力が NaN である場合、そのペイロードビットやシグナリング状態に関わらず、強制的に `0x7ff8000000000000` (Canonical NaN) を出力しなければならない（参照: 7.1.1）。  
* **符号付きゼロ:** 負のゼロ (`-0.0`) と正のゼロ (`+0.0`) をビットレベルで区別し、それぞれ `0x8000000000000000` および `0x0000000000000000` としてエンコードしなければならない（参照: 7.1.2）。  
* **ビッグエンディアン:** 全ての数値書き込みは Big-Endian 形式でなければならない。

**2\. Strict UTF-8 Encoder (厳格UTF-8エンコーダ)** 文字列のエンコードにおいて、**RFC 3629** に準拠した厳格な検証を行わなければならない。

* **サロゲートペア検証:** 孤立サロゲート (Lone Surrogate) や不正なバイトシーケンスを検出した場合、置換文字 (U+FFFD) に変換するのではなく、直ちに L0 Kernel を通じて **Error\_Lock** を発動しなければならない（参照: 附属書A NAP-16）。  
* **正規化の禁止:** 文字列に対して `String.prototype.normalize()` 等の Unicode 正規化 (NFC/NFD) やケースフォールディングを適用してはならない。入力されたコードポイント列をそのままエンコードすることを原則とする（参照: 附属書A NAP-26）。  
* **BOMの禁止:** 出力バイト列の先頭に BOM (Byte Order Mark) を付与してはならない。

**3\. Integer & BigInt Encoder (整数エンコーダ)** 整数値は固定長または規定されたバイナリ形式でエンコードされなければならない。

* **Int64 / Uint64:** 常に 8バイト固定長の Big-Endian としてエンコードする。可変長整数 (Varint) の使用は禁止される。  
* **BigInt:** **「符号バイト \+ 絶対値バイト列」** の形式を使用する。  
  * **符号 (Sign):** 正(0)または負(1)を表す 1バイト。  
  * **絶対値 (Magnitude):** Big-Endian 形式のバイト列。先頭のゼロ (Leading Zeros) は除去しなければならない（参照: v56.3 Final Fix）。ASCII 10進数表現は廃止された。

**4\. Tuple Builder (タプル構築器)** データ構造を `[Tag, Length, Value]` 形式の TLV、または本規格で定義される正規化タプル表現へと変換する責務を負う。

* **Length の定義:** Length フィールドには、常に **「バイト長 (Byte Count)」** を記録しなければならない。「要素数」や「文字数」の使用は禁止される（参照: 附属書A NAP-11）。

##### **6.1.3 L2: Traversal Engine (Stateful Logic Layer)** {#6.1.3-l2:-traversal-engine-(stateful-logic-layer)}

**L2: Traversal Engine** は、入力グラフのトポロジー（接続構造）を解析し、決定論的な訪問順序と識別子（ID）を管理するステートフルなロジック層である。本レイヤーは、下位の **L1: Canonical Encoders** （データ変換）および **L0: Safety Kernel** （リソース監視）を利用して動作するが、上位の **L3: Facade** や外部環境（UI状態など）には一切依存してはならない。

実装は、以下の3つのサブコンポーネントを厳格に分離し、それぞれの責務と実行順序を遵守しなければならない。

**1\. Phase 1: 構造解析器 (Structural Analyzer)**

* **責務:** グラフ全体を走査し、コンテナ（Map, Set, Object）内の要素順序を「内容（Byte Content）」に基づいて一意に決定する。  
* **KeyOrderMap:** 解析の結果として、各コンテナの正準ソート済みキーリストを保持する `KeyOrderMap` を生成しなければならない。  
* **比較ストリーム:** ソートのための比較には、L2.5 (Comparison Infrastructure) が生成する一時的な「比較用バイナリ（Comparison Stream）」を使用する。このバイナリには永続的なIDを含めてはならず、また最終出力ストリームへ混入させてはならない（参照: 附属書A NAP-01）。  
* **制約:** このフェーズでは、永続的な定義ID（DefID）の割り当ておよび最終出力バッファへの書き込みを行ってはならない。

**2\. Phase 2: 定義送出器 (Definition Emitter)**

* **責務:** Phase 1 で確定した順序に従ってグラフを **行きがけ順 (Pre-order DFS)** で再走査し、IDを付与して L1 エンコーダへデータを渡す。  
* **順序の強制:** コンテナの子要素を訪問する際は、必ず `KeyOrderMap` に記録された順序を使用しなければならない。このフェーズでの再ソートや、`Object.keys` / `for..in` による動的なキー取得は厳格に禁止される（参照: 附属書A NAP-05）。  
* **出力:** 初回訪問時は定義ノード（DEF）を、再訪問時は参照ノード（REF）を出力する。

**3\. 同一性マネージャー (Identity Manager)**

* **責務:** オブジェクトの参照（メモリアドレスまたはインスタンス）と、HACE規格上の論理ID（$\\mathbb{U}\_{53}$）のマッピングを管理する。  
* **スコープ:** このマネージャーはセッションスコープ（1回の正規化処理の間のみ有効）であり、処理完了後は直ちに破棄されなければならない。グローバル変数や静的キャッシュとしての再利用は禁止される。  
* **抽象化:** 実装言語のメモリアドレス（Pointer）を直接ソートキーやハッシュとして使用してはならない。同一性はあくまで「トラバーサル順序に基づく相対的な一意性」として抽象化されなければならない（参照: 5.2.1 アドレス独立性公理）。

**4\. 状態管理要件 (State Management Requirements)** L2 レイヤーは、循環参照検知と無限再帰防止のために、以下の状態コンテナを保持する。これらは L0 Kernel の深度ガードと連携して動作する。

* **Visited Map:** Phase 2 用。`Map<ObjectRef, DefID>` 形式で既出判定に使用する。  
* **Recursion Stack:** Phase 1 用。現在の探索パスを追跡するセットであり、DAG上の合流（Shared Reference）と閉路（Cycle）の区別に使用する。

##### **6.1.4 L3: Facade & Runtime (Boundary Layer)** {#6.1.4-l3:-facade-&-runtime-(boundary-layer)}

**L3: Facade & Runtime** は、上位のアプリケーション層（L4: UI / TestRunner）と下位の正規化コア（L2 / L1 / L0）の間に位置する **界面層（Interface Layer）** である。本レイヤーは、外部からの入力データを「純粋な計算リクエスト」へと変換し、コアロジックを副作用（Side Effects）や並行実行の競合から隔離する責務を負う。

**1\. 純粋関数境界 (Pure Function Boundary)**

* **定義:** Facade が提供する主要エントリーポイント（例: `computeCanonicalBytes`）は、入力グラフ $G$ を引数とし、正規化バイト列 $B$ またはエラー状態 $\\bot$ を返す **純粋関数** として振る舞わなければならない。  
* **副作用の遮断:** 本レイヤーより内側（L2, L1, L0）において、以下の操作を行うことは厳格に禁止される。  
  * DOM (Document Object Model) へのアクセス。  
  * `console.log` 等の標準出力（内部バッファへの記録は除く）。  
  * `Date.now()` や `Math.random()` 等の非決定的な値の取得。  
  * ファイルシステムやネットワークへの I/O アクセス。

**2\. 責務の限定 (Limitation of Responsibility)**

* **ハッシュ計算の除外:** Facade の責務は「正準化されたバイト列（Canonical Byte Stream）」の生成までとする。SHA-256 等の暗号学的ハッシュ関数の適用は、バイト列を受け取った後の **Application Layer (L4)** の責務であり、Facade 内部で行ってはならない（参照: 附属書A NAP-02）。これは、ハッシュアルゴリズムの変更や選択の自由度を上位層に残すためである。  
* **データの複製:** 入力されたオブジェクトグラフは、原則として `structuredClone` 等を用いてディープコピーされたものを正規化プロセスに渡すことが推奨される。これにより、計算中に UI 側でデータが変更されることによる「ハッシュのゆらぎ（Hash Fluctuation）」を防止する。

**3\. ランタイム制御 (Runtime Control)**

* **Worker 統合:** ブラウザ環境において、HACE エンジンは WebWorker 内部で動作することが強く推奨される。Facade はメインスレッドからのメッセージ（RUN, ABORT）を受け取り、L0 Kernel のセッションライフサイクルを制御する。  
* **協調的停止 (Cooperative Abort):** ユーザーによるキャンセル操作（Abort）に対応するため、Facade は L0 Kernel に対して停止シグナルを伝播させる機構を持たなければならない。ただし、停止は常に原子的（Atomic）に行われ、不完全なデータが出力されることはない。

#### **6.2 規範的ステートマシン (Normative State Machine)** {#6.2-規範的ステートマシン-(normative-state-machine)}

##### **6.2.1 状態定義: `IDLE`, `ANALYZING` (Phase 1), `EMITTING` (Phase 2), `HALTED` (Error)** {#6.2.1-状態定義:-idle,-analyzing-(phase-1),-emitting-(phase-2),-halted-(error)}

HACEエンジンは、いかなる時点においても、以下に定義される4つの排他的な状態（State）のいずれか一つに属さなければならない。実装は、このステートマシンの遷移規則を厳守し、現在の状態において許可されていない操作が試みられた場合、直ちに `HALTED` 状態へ遷移しなければならない。

**1\. `IDLE` (待機状態)**

* **定義:** エンジンが正規化セッションを開始しておらず、外部からの入力（Start イベント）を待機している初期状態または正常終了後の状態。  
* **特性:**  
  * **Resource Free:** セッションスコープのリソース（Arena, Identity Map, Safety Kernel）は未割り当て、または解放済みである。  
  * **Ready:** 新規の正規化リクエストを受け入れ可能な唯一の状態である。  
* **許容される操作:** `Start` (入力グラフの受領とセッション初期化)。

**2\. `ANALYZING` (構造解析状態 / Phase 1\)**

* **定義:** 入力グラフのトポロジー解析および正準順序の決定を行っているアクティブな計算状態。  
* **主要タスク:**  
  * 再帰的な構造走査と循環検知（Cycle Detection）。  
  * 比較用ストリーム（CCS）の生成と `memcmp` によるカノニカルソート。  
  * `KeyOrderMap` の構築と固定。  
* **不変条件 (Invariants):**  
  * **Output Silence:** 出力バッファへの書き込みは一切行われてはならない（MUST NOT）。  
  * **ID-less:** 永続的な定義ID（DefID）の割り当てを行ってはならない。

**3\. `EMITTING` (出力生成状態 / Phase 2\)**

* **定義:** `ANALYZING` フェーズで確定した順序に従い、最終的な正規化バイト列を生成しているアクティブな計算状態。  
* **主要タスク:**  
  * `KeyOrderMap` に従った行きがけ順（Pre-order）DFS 走査。  
  * 定義ID（DefID）の連番付与および `Visited Map` の更新。  
  * TLV (Tag-Length-Value) 形式での出力バッファへの書き込み。  
* **不変条件 (Invariants):**  
  * **Fixed Order:** 要素の順序決定（ソート）や、キーの動的な再取得を行ってはならない（MUST NOT）。  
  * **Atomic Write:** 書き込みはトランザクションバッファに対して行われ、完了までコミットされない。

**4\. `HALTED` (異常停止状態 / Error\_Lock)**

* **定義:** 規格違反（深さ制限超過、U53オーバーフロー、不正UTF-8等）またはランタイムエラーを検知し、システムが原子的に停止した状態。数学的な「底 ($\\bot$)」に相当する。  
* **特性:**  
  * **Frozen:** 内部状態（IDカウンタ、バッファ）の更新は凍結される。  
  * **Irreversible:** この状態から `IDLE`, `ANALYZING`, `EMITTING` への復帰は不可能である。唯一の脱出経路は、エンジンの破棄と再生成（Reset）のみである。  
  * **Input Rejection:** 外部からのいかなるイベント（Start, Abort等）も拒絶または無視される。  
* **出力:** 常に $\\bot$ (Null/Error) を返し、部分的なバイト列を決して出力しない。

##### **6.2.2 入力イベント集合 (Input Event Set): `Start`, `Abort`, `Step`, `Complete`** {#6.2.2-入力イベント集合-(input-event-set):-start,-abort,-step,-complete}

HACEエンジンの状態遷移は、以下の4種類の入力イベントによってのみ引き起こされる。実装は、これらのイベント以外の操作（例：内部状態への直接アクセスや、定義されていないタイミングでのメソッド呼び出し）に対して、一切の副作用を発生させてはならず、無視またはエラーとして処理しなければならない。

**1\. `Start(InputGraph, Config)` \- セッション開始**

* **定義:** 正規化セッションの初期化および開始を要求するイベント。  
* **引数:**  
  * `InputGraph`: 正規化対象となるオブジェクトグラフのルートノード。  
  * `Config`: 実行パラメータ（`maxMicrosteps`、`strictTyping` 等）を含む不変の設定オブジェクト。  
* **前提条件:** エンジンが `IDLE` 状態であること。  
* **効果:**  
  * L0 Safety Kernel, L1 Arena, L2 Identity Map 等のセッションスコープリソースを新規に割り当てる。  
  * 状態を `ANALYZING` (Phase 1\) へ遷移させる。  
  * `InputGraph` のディープコピー（または所有権の移動）を行い、外部からの変更を遮断する。

**2\. `Abort(Reason)` \- 強制中断**

* **定義:** ユーザー操作（キャンセルボタン等）またはシステム要因（タイムアウト、リソース枯渇）により、処理の即時停止を要求するイベント。  
* **引数:**  
  * `Reason`: 中断理由を示すエラーコードまたはメッセージ。  
* **前提条件:** 任意の状態（`IDLE`, `ANALYZING`, `EMITTING`, `HALTED`）。  
* **効果:**  
  * L0 Safety Kernel に対して `Error_Lock` を要求する。  
  * 作成途中の出力バッファおよび一時データを破棄する。  
  * 状態を原子的に `HALTED` へ遷移させる。この遷移は不可逆である。

**3\. `Step()` \- 処理進行 (Tick)**

* **定義:** エンジンに対して計算リソースを供給し、論理的な処理単位（マイクロタスク）を1つ進行させるドライバイベント。  
* **前提条件:** `ANALYZING` または `EMITTING` 状態であること。  
* **効果:**  
  * **Safety Check:** `Abort` フラグおよびリソース制限（深さ、時間）を確認する。  
  * **Progress:** 現在のフェーズにおける処理（DFSの1ステップ、ソートの実行、またはトークンの出力）を実行する。  
  * **Transition:** 処理の進行状況に応じて、内部状態を更新する。Phase 1 が完了した場合は `EMITTING` へ、全ての出力が完了した場合は `Complete` イベントを内部的に発行する準備を行う。  
* **目的:** 長時間実行される正規化プロセスを細分化し、ホスト環境（UIスレッド等）へのブロッキング回避や、協調的な中断（Cooperative Abort）を可能にするために用いられる。

**4\. `Complete()` \- 完了とコミット**

* **定義:** 全ての正規化処理が正常に終了し、結果の確定（コミット）を要求するイベント（または内部状態からの遷移トリガー）。  
* **前提条件:** `EMITTING` 状態であり、かつルートノードからの全探索が完了していること。  
* **効果:**  
  * **Validation:** 最終的な整合性チェック（バッファ長の一致、未解決参照の不在等）を行う。  
  * **Commit:** シャドウバッファの内容を確定させ、正規化バイト列として出力可能にする。  
  * **Release:** セッションリソース（Arena等）を解放または再利用可能な状態へリセットする。  
  * 状態を `IDLE` へ遷移させる。

##### **6.2.3 状態遷移表 (Normative State Transition Table)** {#6.2.3-状態遷移表-(normative-state-transition-table)}

HACEエンジンは、以下の遷移表に従って動作しなければならない。表中の「現在状態 ($S\_{curr}$）」および「入力イベント ($E$)」の組み合わせに対し、定義された「次状態 ($S\_{next}$）」への遷移と「アクション ($A$)」のみが許可される。定義されていない組み合わせ（空欄）が発生した場合、それは不正な操作とみなし、直ちに `HALTED` 状態へ遷移しなければならない。

| 現在状態 ($S\_{curr}$) | 入力イベント ($E$) | ガード条件 / 判定 | 次状態 ($S\_{next}$) | 実行アクション ($A$) |
| ----- | ----- | ----- | ----- | ----- |
| **IDLE** | `Start(Input)` | \- | **ANALYZING** | \*\*\[Initialize\]\*\*1. セッションリソース (L0, L1, L2) の新規確保。2. 入力グラフのディープコピー。3. `d_cmp`, `d_trav` カウンタのリセット。 |
| **IDLE** | `Abort` | \- | **IDLE** | 無視 (No-op)。 |
| **ANALYZING** | `Step()` | 未完了 (Queue $\\ne \\emptyset$) | **ANALYZING** | \*\*\[Phase 1 Process\]\*\*1. ノード比較バイナリ生成。2. 循環検知 (Stack Check)。3. `KeyOrderMap` へのソート結果記録。 |
| **ANALYZING** | `Step()` | 完了 (Queue $= \\emptyset$) | **EMITTING** | \*\*\[Phase Barrier\]\*\*1. `KeyOrderMap` の凍結。2. `VisitedMap` (ID付与用) の初期化。3. `d_trav` のリセット。 |
| **ANALYZING** | `Abort` | \- | **HALTED** | \*\*\[Atomic Halt\]\*\*1. `Error_Lock` フラグの設定。2. 一時メモリの破棄。 |
| **EMITTING** | `Step()` | 未完了 (Stack $\\ne \\emptyset$) | **EMITTING** | \*\*\[Phase 2 Process\]\*\*1. Pre-order DFS によるノード訪問。2. 初回訪問時の ID 付与。3. `OutputBuffer` への TLV 書き込み。 |
| **EMITTING** | `Step()` | 完了 (Stack $= \\emptyset$) | **IDLE** | \*\*\[Commit\]\*\*1. `OutputBuffer` の確定。2. `Complete` イベントの発行。3. セッションリソースの解放。 |
| **EMITTING** | `Abort` | \- | **HALTED** | \*\*\[Atomic Halt\]\*\*1. `Error_Lock` フラグの設定。2. `OutputBuffer` の即時破棄 (Rollback)。 |
| **HALTED** | *Any* | \- | **HALTED** | \*\*\[Reject\]\*\*全ての入力を拒否し、$\\bot$ (Bottom) を返す。状態復帰は不可。セッション破棄のみが可能。 |
| *Any* | *Internal Error* | 深度超過 / U53違反 / UTF8不正 | **HALTED** | \*\*\[Atomic Halt\]\*\*Safety Kernel による強制介入。例外送出ではなく状態遷移として処理する。 |

**注記:**

1. **フェーズバリア (Phase Barrier):** `ANALYZING` から `EMITTING` への遷移は不可逆である。`EMITTING` 状態に入った後、再び比較やソート（`ANALYZING` の責務）を行うことは、決定論的順序を破壊するため厳格に禁止される（参照: 7.1.3）。  
2. **不可逆停止 (Irreversible Halt):** `HALTED` 状態からの脱出遷移は存在しない。この状態に陥ったエンジンインスタンスは「汚染された」とみなされ、再利用せずに破棄されなければならない。  
3. **ステップ実行:** `Step()` イベントは、長時間実行によるブロッキングを防ぐための論理的な刻みであり、実装内部ではループ処理として連続実行されてもよい（MAY）。ただし、各ステップ間での状態整合性は常に保たれなければならない。

#### **6.3 エラーおよび失敗モデル (Error and Failure Model)** {#6.3-エラーおよび失敗モデル-(error-and-failure-model)}

##### **6.3.1 状態破棄とエラー処理原則 (No Partial Emission)** {#6.3.1-状態破棄とエラー処理原則-(no-partial-emission)}

HACE準拠の実装は、正規化セッション中に `Error_Lock` 状態へ遷移した場合、それ以前にいかなる計算が行われていたとしても、外部観測可能な出力ストリームに対して1バイトたりともデータを生成・残留させてはならない。

出力は常に **All-or-Nothing（全か無か）** の原則に従い、以下の物理的制約を満たさなければならない。

**1\. トランザクション・バッファリング (Transactional Buffering)** 出力バイト列の生成は、必ず一時的な「シャドウバッファ（Shadow Buffer）」またはメモリ上の隔離領域に対して行わなければならない。

* **コミット条件:** 処理が正常に完了（Settle）し、全ての不変条件が満たされた時点でのみ、このバッファの内容を最終的な出力としてコミット（Commit）することが許可される。  
* **ストリーミングの制限:** ネットワークソケットやファイルへ直接書き込む「ストリーミング出力」を行う場合でも、エラー発生時に末尾を切り詰める（Truncate）か、あるいはストリーム全体を無効化するプロトコル（例: 末尾に Error Tag を付与し、受信側で破棄させる）を実装しなければならない。

**2\. 即時破棄 (Immediate Discard)** エラー検知（Safety Kernel による `Error_Lock` 発動）と同時に、シャドウバッファの内容は即座に破棄（Discard）または無効化されなければならない。

* **規格不適合:** 例外処理の不備により、書きかけのバイト列（Corrupted Data）が呼び出し元に返却されることは、規格不適合（Non-conformance）とみなされる。  
* **観測者への保証:** 外部観測者（Application Layer）に対しては、「完全な正準化データ」か「完全な失敗（Null/Error）」の二値のみが提示されなければならない。

**3\. 状態の巻き戻し (State Rollback)** エラー発生時は、出力バッファだけでなく、IDカウンタの進行や Visited Map の更新といった内部状態の変更もすべて破棄されなければならない。

* **底 ($\\bot$) への遷移:** システムはエラー発生前の状態、あるいは明確に定義された「底（Bottom, $\\bot$）」状態へと原子的に遷移し、副作用を残してはならない。  
* **再利用禁止:** エラーが発生したセッションのメモリ領域（Arena）やインスタンスを、次回の計算に再利用することは禁止される（参照: 6.3.2）。

##### **6.3.2 原子的停止機構 (Atomic Halting) と Error\_Lock への不可逆遷移** {#6.3.2-原子的停止機構-(atomic-halting)-と-error_lock-への不可逆遷移}

Safety Kernel は、セッションスコープ内に `Error_Lock` と呼ばれる内部フラグ（または状態変数）を保持しなければならない。このフラグは、HACE エンジンにおける「計算の健全性」が損なわれたことを示す最終的な指標であり、以下の厳格な振る舞いが規定される。

**1\. 不可逆性の法則 (Law of Irreversibility)** `Error_Lock` フラグは、初期状態（`false` / `Normal`）から異常状態（`true` / `Locked`）への単方向遷移のみが許可される。

* **復帰の禁止:** 一度 `true` に設定されたフラグを、同一セッション内で `false` に戻すことは、いかなる手段（リトライ、例外捕捉、状態のロールバック等）を用いても **厳格に禁止される** （MUST NOT）。  
* **汚染の封じ込め:** エラーが発生したセッションは「汚染された（Tainted）」とみなされる。復帰が必要な場合は、現在のセッション（および関連するメモリ領域、Arena）を完全に破棄し、新たなセッションを初期化（Reset）しなければならない。

**2\. 底（Bottom）としての意味論 (Semantics of Bottom)** `Error_Lock` が有効な状態において、関数 `CanonicalHash` および関連する全ての API の戻り値は、数学的な「底 ($\\bot$)」と等価でなければならない。

* **出力の不在:** 実装上は `null`、`undefined`、または明確なエラー型（`Result::Err`）を返し、**部分的なバイト列（Partial Byte Stream）や、エラー発生直前までの計算結果を決して出力してはならない**。これにより、不完全なデータが正規化データとして誤認されるリスク（Hash Collision の原因）を物理的に排除する。  
* **Status Byte:** バイナリ出力においては、ヘッダの Status Byte に `0xEE` (ERROR\_LOCK) を書き込み、ストリームの無効性を明示しなければならない（参照: 8.1.2）。

**3\. 入力の拒絶 (Input Rejection)** `Error_Lock` 状態にあるエンジンに対し、新たな入力（`Start`, `Step`）、非同期解決（`Resolve`）、またはスナップショットの取得（`GetSnapshot`）が試みられた場合、エンジンはこれらを即座に拒絶しなければならない。

* **凍結:** 内部状態の変更、Tick（論理クロック）の進行、およびジャーナルへの記録は一切行われてはならない。システムは凍結されたものとして振る舞う。

**4\. 状態の凍結 (State Freezing)** `Error_Lock` 発生と同時に、IDカウンタ、訪問済みマップ（Visited Map）、および出力バッファへの書き込み権限は剥奪される。

* **副作用の防止:** エラーハンドリング処理の過程で、ログ出力などを目的として内部状態（IDカウンタ等）を進めることは禁止される。エラー発生時点のコンテキストが、事後分析のために保存されることは許容されるが（Snapshot for Debugging）、それは正規化プロセスの一部として扱ってはならない。

#### **6.4 メモリ管理と並行性 (Memory Management and Concurrency)** {#6.4-メモリ管理と並行性-(memory-management-and-concurrency)}

##### **6.4.1 Arena / Slab Allocation の強制** {#6.4.1-arena-/-slab-allocation-の強制}

HACEに準拠する実装は、正規化プロセス（特に Phase 1 の比較ストリーム生成および Phase 2 の出力バッファ生成）において、ホスト言語の標準ヒープアロケータ（例: JavaScriptの `new Uint8Array()`、C++の `malloc/new`）をノード単位で呼び出すことを **厳格に禁止する** （MUST NOT）。

代わりに、以下の要件を満たす **Binary Arena** または **Slab Allocation** 機構を実装し、これを使用しなければならない。

**1\. スラブアロケーション (Slab Allocation)** 実装は、セッション開始時に連続した巨大なメモリ領域（スラブ、推奨サイズ: 16MB単位）を確保しなければならない。

* **シーケンシャル書き込み:** 個々のノードデータの書き込みは、このスラブ内へのシーケンシャルな書き込みと、内部オフセットポインタのインクリメントによって行われなければならない。  
* **アロケーション回数の抑制:** これにより、数万ノード規模のグラフ処理において $O(N)$ 回のメモリアロケーションが発生することを防ぎ、メモリアロケーション回数を $O(N / \\text{SlabSize})$ に抑制しなければならない。

**2\. ゼロコピー参照 (Slice Reference)** アリーナ内に書き込まれたデータへのアクセスは、データのコピーではなく、軽量な参照オブジェクトを介して行わなければならない。

* **SliceRef:** 構造体 `{ slabId, offset, length }` 相当の参照を用いること。  
* **コピー禁止:** 比較処理（memcmp）やソート処理において、バッファの実体を複製することは、メモリ帯域の枯渇を招くため禁止される。

**3\. 比較用プールの分離と再利用 (Transient Reuse)** Phase 1（構造解析）で使用される比較用バイナリプール（Comparison Binary Pool）は、Phase 2（出力）で使用される永続的な出力アリーナとは物理的に分離されていなければならない。

* **揮発性:** 比較用データは一時的なものであり、比較関数（CanonicalComparator）の実行終了後、ガベージコレクション（GC）に依存することなく、ポインタのリセット等によって即座に再利用可能（または破棄）な状態にされなければならない。  
* **汚染防止:** IDを含まない比較用データが、誤って最終出力ストリームに混入することを防ぐため、両者のメモリ領域は厳密に分離されなければならない（参照: 附属書A NAP-01）。

**注記:** 本規定は、特にメモリ制約の厳しい環境（モバイルブラウザ等）において、再帰的な比較ストリーム生成が引き起こす「GCストーム」によるシステムクラッシュ（OOM）を物理的に回避するために必須である。

##### **6.4.2 Worker 隔離と Global State の禁止** {#6.4.2-worker-隔離と-global-state-の禁止}

HACEエンジンの正規化プロセスは、ホストアプリケーションのメインスレッド（特に UI レンダリングスレッド）から物理的または論理的に隔離された実行コンテキスト（例: WebWorker, ServiceWorker, 別プロセス）内で行われなければならない。

この隔離は、以下のメモリ空間の独立性と純粋性を保証するために必須である。

**1\. シングルトンパターンの禁止 (Prohibition of Singletons)** 本規格に準拠する実装は、エンジンの実行状態（Mutable State）を管理するために、シングルトンパターン（Singleton Pattern）、静的クラスメンバ（Static Mutable Fields）、またはモジュールレベルのグローバル変数を **使用してはならない** （MUST NOT）。

* **セッションスコープ:** Safety Kernel、Identity Map、および Memory Arena は、正規化リクエストごとに新規にインスタンス化され、処理終了とともに破棄されなければならない。  
* **汚染の防止:** グローバル変数による状態管理は、並行実行時における `Error_Lock` 状態の混線（Cross-Talk）や、前の実行における残留データの混入を招くため、厳格に禁止される（参照: 附属書A NAP-03）。

**2\. 共有メモリの禁止 (Prohibition of Shared Memory)** 正規化エンジンと呼び出し元（UI層）の間で、ミュータブルなオブジェクトへの参照を共有してはならない。

* **Atoms:** `SharedArrayBuffer` や `Atomics` を用いた並行アクセスは、決定論的順序を破壊するリスクがあるため、同期制御が数学的に証明されたコンポーネント（L0 Safety Kernel 内部など）を除き、原則として使用してはならない。

**3\. 入力境界のサニタイズ (Input Boundary Sanitization)** Facade 層（L3）を介してエンジンに入力されるグラフデータは、処理開始前に必ず **ディープコピー（Deep Copy）** されなければならない。

* **structuredClone:** JavaScript 環境においては `structuredClone()` 等を使用し、UI 層が保持する「生きたオブジェクト（Live Objects）」への参照を完全に切断しなければならない。これにより、正規化計算中にユーザーが UI 上でデータを変更した場合でも、計算対象のスナップショットが変質しないこと（Hash Race の防止）を保証する。

**4\. グローバルスコープの汚染防止** Worker コンテキスト内であっても、複数の正規化リクエスト間での状態共有は禁止される。

* **再利用時のリセット:** Worker インスタンスを再利用（Pooling）する場合、各リクエストの完了（Done）または中断（Abort）時に、グローバル変数および静的プロパティ（特にメモリアリーナやキャッシュ）を確実に初期化または破棄し、前の実行状態が次の実行に影響を与える「状態汚染（State Pollution）」を物理的に防がなければならない。

---

### **7\. データ表現とエンコーディング (Data Representation)** {#7.-データ表現とエンコーディング-(data-representation)}

#### **7.1 浮動小数点数 (Float64 Canonicalization)** {#7.1-浮動小数点数-(float64-canonicalization)}

##### **7.1.1 NaN 正規化 (Canonical NaN: `0x7ff8000000000000` 固定)** {#7.1.1-nan-正規化-(canonical-nan:-0x7ff8000000000000-固定)}

IEEE 754-2019 倍精度浮動小数点数規格 (binary64) において、NaN (Not a Number) は「指数部 (Exponent) が全て 1 (`0x7FF`) かつ、仮数部 (Trailing Significand) が 0 以外」の値として定義される。この定義を満たすビットパターンは多数存在し（符号ビットやペイロードの違いにより $2^{53}-2$ 通り）、その生成規則は CPU アーキテクチャや算術ライブラリの実装に依存する。

HACE 準拠の実装は、決定論的出力（Oracle Determinism）を保証するため、以下の正規化手順を **義務（SHALL）** とする。

**1\. 入力検査 (Input Inspection)** エンコーダは、数値 $x$ が NaN であるか（$x \\neq x$、または指数部全1かつ仮数部非0）を検査しなければならない。

**2\. 強制置換 (Mandatory Substitution)** 入力 $x$ が NaN であると判定された場合、その元の符号ビット（Sign bit）、シグナリング状態（sNaN/qNaN）、およびペイロード（Payload）の内容に関わらず、出力されるビット列は以下の **Canonical NaN** に固定されなければならない。

$$ \\text{Canonical NaN} \= \\texttt{0x7ff8000000000000} $$

* **符号 (Sign):** `0` (正)  
* **指数 (Exponent):** `0x7FF` (全1)  
* **仮数 (Mantissa):** `0x8000000000000` (最上位ビットのみ1、他は0。すなわち Quiet NaN)

**3\. バイト列表現 (Byte Representation)** 上記の値は、**Big-Endian** 形式の8バイト列としてエンコードされなければならない。 `[ 0x7F, 0xF8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]`

**注記:**

* **情報消失の許容:** この正規化プロセスにより、元の NaN が保持していたペイロード情報（エラーコードなど）やシグナリングビットは意図的に破棄される。HACE はデータの保存よりも「同一性の証明」を優先するため、環境依存情報の混入を防ぐこの挙動は仕様として正しい。  
* **実装上の注意:** JavaScript の `Number.NaN` や `0/0` の結果、あるいは `DataView` への直接書き込み結果がこのビットパターンと一致する保証はない。実装者は必ず `Number.isNaN()` 等で検出し、ビットマスク操作または定数書き込みによってこの値を明示的に設定しなければならない（参照: 附属書A NAP-14）。

##### **7.1.2 負のゼロ (-0.0) の保存義務 (Bitwise Exactness)** {#7.1.2-負のゼロ-(-0.0)-の保存義務-(bitwise-exactness)}

IEEE 754-2019 規格において、正のゼロ ($+0.0$) と負のゼロ ($-0.0$) は数値比較演算において等価（equal）とされる場合があるが、ビット表現においては符号ビット（Sign bit）が異なる別個の実体である。HACE 準拠の実装は、この符号情報を「有意な情報」として保存し、正規化プロセスにおいて両者を **厳密に区別しなければならない（SHALL）**。

**1\. ビットパターン定義 (Bitwise Representation)** 実装は、ゼロの値を以下の規定されたビットパターン（Big-Endian 16進表記）へマッピングしなければならない。

* **正のゼロ (+0.0):** `0x0000000000000000` （符号ビット 0）  
* **負のゼロ (-0.0):** `0x8000000000000000` （符号ビット 1）

**2\. 同一性判定の厳格化 (Strict Identity)** 正規化ロジック内での等価判定において、ホスト言語の標準的な等価演算子（例: JavaScriptの `===`、Javaの `==`）を使用してはならない。これらは通常 $+0$ と $-0$ を同一視するためである。

* **判定手法:** 実装は、`Object.is(-0, +0)` 相当の厳密な判定、あるいは整数型にビットキャストした上での比較を用いなければならない。  
* **キーとしての区別:** Map や Set のキーとしてゼロが使用される場合、HACE エンジンは $+0$ と $-0$ を **異なるキー** として扱い、それぞれ別のエントリとして保存・出力しなければならない。

**3\. 情報消失の禁止 (No Information Loss)** 入力グラフに含まれる $-0$ を、意図的あるいは過失により $+0$ へ変換することは、情報の欠落（Loss of Information）とみなされ、**厳格に禁止される（MUST NOT）**。

* **JSON非互換:** HACE は JSON の数値モデル（$-0$ を $0$ に正規化することが多い）には従わない。アプリケーション層で JSON 互換が必要な場合は、HACE エンジンに入力する前にアプリケーション側で正規化を行わなければならない（参照: 6.1.4 Float64 の同一性哲学）。

**4\. 演算結果の保存** 算術演算の結果として $-0$ が生成された場合（例: `1.0 / -Infinity` や `-1.0 * 0.0`）、その符号ビットは維持され、出力されるバイト列に反映されなければならない。

##### **7.1.3 非正規化数の扱い (Handling of Subnormal Numbers)** {#7.1.3-非正規化数の扱い-(handling-of-subnormal-numbers)}

IEEE 754 規格において、絶対値が正規化数の最小値 ($2^{-1022} \\approx 2.225 \\times 10^{-308}$) よりも小さい非ゼロの数値は、非正規化数（Subnormal Number, 旧称 Denormalized Number）として定義される。

HACE 準拠の実装は、これらの数値を「有意な値」として扱い、そのビット列を **完全に保存しなければならない（SHALL）**。

**1\. ゼロへの丸め禁止 (Prohibition of Flush-to-Zero)** 実装は、パフォーマンス最適化を目的とした CPU の **FTZ (Flush-to-Zero)** モードや **DAZ (Denormals-Are-Zero)** モードの影響を受けてはならない。

* **規格違反:** 入力グラフに含まれる非正規化数を、意図せず $\\pm 0$ に変換してエンコードすることは、情報の欠落であり規格違反（Non-conformance）となる。  
* **ネイティブ実装の責務:** C++ / Rust 等のネイティブ実装においては、正規化プロセス中の浮動小数点演算設定が IEEE 754 準拠（厳密モード）であることを保証しなければならない。

**2\. ビット構成 (Bit Layout)** 非正規化数は、以下のビットパターン（Big-Endian）としてエンコードされなければならない。

* **符号 (Sign):** $0$ または $1$  
* **指数 (Exponent):** `0x000` (全ビット 0\)  
* **仮数 (Mantissa):** `0` 以外の値  
  * 正規化数と異なり、仮数部の最上位ビット（Hidden Bit）は $0$ とみなされる ($0.f \\times 2^{-1022}$)。

**3\. 最小値の表現 (Representation of Minimum Value)** 倍精度浮動小数点数における最小の正の非正規化数（JavaScript における `Number.MIN_VALUE`, $5 \\times 10^{-324}$）は、必ず以下のバイト列にシリアライズされなければならない。 `0x0000000000000001`

**注記:** 一部の環境や数値演算ライブラリでは、非正規化数の演算が極端に遅くなる場合があるが、HACEにおいては処理速度よりも「ビットレベルの再現性」が絶対的に優先される。

#### **7.2 整数と時刻 (Integers & Timestamps)** {#7.2-整数と時刻-(integers-&-timestamps)}

##### **7.2.1 Int64 / Uint64 Big-Endian 固定長** {#7.2.1-int64-/-uint64-big-endian-固定長}

HACEにおける64ビット整数（符号付き Int64 および 符号なし Uint64）のエンコーディングは、その値の大小に関わらず、必ず **8オクテット（64ビット）の固定長** でなければならない。

**1\. ビット順序 (Byte Order)** 全ての整数は **ビッグエンディアン (Big-Endian, Network Byte Order)** 形式で記録されなければならない。

* **配置:** 最上位バイト（MSB）をオフセット $0$、最下位バイト（LSB）をオフセット $7$ に配置する。  
* **禁止事項:** リトルエンディアン（x86/x64のネイティブ形式など）の使用は、プラットフォーム間でのバイト列不一致を招くため、厳格に禁止される。

**2\. 符号化方式 (Encoding Scheme)**

* **Uint64 (符号なし):** 単純な2進数表現としてエンコードする。  
* **Int64 (符号付き):** **2の補数 (Two's Complement)** 表現としてエンコードする。

**3\. ゼロパディング (Zero Padding)** 値が小さく、上位バイトが空になる場合であっても、省略せずに必ず `0x00`（正の場合）または `0xFF`（負の場合）で埋めなければならない。可変長整数（Varint / LEB128等）のような「値を詰める」最適化は、バイトオフセットの予測可能性を損なうため禁止される（参照: 附属書A NAP-13）。

* **例 (Uint64):** 数値 $1 \\rightarrow$ `00 00 00 00 00 00 00 01`  
* **例 (Int64):** 数値 $-1 \\rightarrow$ `FF FF FF FF FF FF FF FF`

**4\. JavaScript環境における扱い (U53 Projection)** JavaScript等の Number 型（倍精度浮動小数点数）から整数へ変換する場合、値が安全整数範囲（$\\pm 2^{53}-1$）に収まっていることを確認した上で、64ビット整数空間へ射影（Projection）しなければならない。

* **拡張:** 上位ビットは符号拡張（Int64）またはゼロ拡張（Uint64）によって埋められる。  
* **境界チェック:** BigInt 型を使用する場合は、64ビットの範囲（$-2^{63}$ ～ $2^{64}-1$）を超過していないことを検証し、超過している場合は Error\_Lock としなければならない。

##### **7.2.2 Varint 使用禁止と Epoch Time 表現** {#7.2.2-varint-使用禁止と-epoch-time-表現}

**1\. 可変長整数 (Varint) の使用禁止** HACE準拠の実装は、整数値（ID、Length、Timestamp等）のシリアライズにおいて、値の大きさによってバイト長が変動する **可変長エンコーディング（Variable-Length Integer / Varint / LEB128など）を使用してはならない** （MUST NOT）。

本規格においては、全ての整数フィールドは固定長（Fixed-width）でなければならず、以下の理由により Varint の使用は厳格に禁止される（参照: 附属書A NAP-13）。

* **非正規化表現の排除 (Elimination of Non-Canonical Representations):** Varint 形式（特に LEB128）では、同一の数値に対して複数のバイト列表現（ゼロパディングによる冗長表現）が許容される場合がある（例: `0x01` と `0x81 0x00` が共に `1` を表す）。HACE エンジンは「ビット単位の一意性」を絶対要件とするため、エンコーダの実装差異によって生じるこの揺らぎを許容しない。  
* **オフセット計算の決定性 (Determinism of Offset Calculation):** 固定長エンコーディングを採用することで、データの内容（値の大小）をスキャンすることなく、コンテナやフィールドのバイト境界（オフセット）を $O(1)$ で静的に計算可能とする。これにより、Phase 1（構造解析）で生成されたフィンガープリントが、Phase 2（出力）における実際のバイト配置と完全に一致することを保証する。

**2\. Epoch Time (ms) の符号付き64ビット表現** Date オブジェクトおよび時刻情報は、浮動小数点数や可変長文字列（ISO 8601等）としてではなく、必ず **協定世界時 (UTC) 1970年1月1日 00:00:00.000 からの経過ミリ秒** を表す符号付き64ビット整数（Int64）としてエンコードされなければならない。

* **ビット列表現 (Bitwise Representation):** 値は **ビッグエンディアン (Big-Endian)** の **2の補数 (Two's Complement)** 形式で記録される。`DataView.setBigInt64(offset, val, false)` 相当の操作を行い、リトルエンディアン（x86/x64ネイティブ）の混入を物理的に排除しなければならない。  
* **UTC正規化 (UTC Normalization):** 入力された時刻がローカルタイムゾーンの情報を持っていたとしても、正規化プロセスにおいてタイムゾーンオフセットは完全に除去され、UTCにおける絶対時刻（Timestamp）へと変換されなければならない。うるう秒（Leap Seconds）は考慮せず、Unix Time の定義に従う。  
* **不正な日付の禁止 (Prohibition of Invalid Date):** JavaScript の `new Date("Invalid")` のように、内部値が NaN となる「無効な日付（Invalid Date）」が入力された場合、実装はこれを特殊値としてシリアライズしてはならない。無効な日付は「計算不能な状態」とみなされ、直ちに **Error\_Lock** を発動しなければならない（参照: 附属書A NAP-22）。これは、NaN のタイムスタンプが実装によって異なるバイト列になるリスクを防ぐためである。

#### **7.3 文字列 (String Encoding)** {#7.3-文字列-(string-encoding)}

##### **7.3.1 UTF-8 Strict Encoding (Atomic Halt on Error)** {#7.3.1-utf-8-strict-encoding-(atomic-halt-on-error)}

HACE準拠の実装における文字列のバイナリ表現は、**ISO/IEC 10646** および **RFC 3629** に準拠した UTF-8 形式でなければならない。ただし、一般的な Web 標準の挙動とは異なり、以下の **厳格な検証（Strict Validation）** を通過したバイト列のみを出力として認め、不正なシーケンスを検出した場合は直ちに **原子的停止（Atomic Halt）** を発動しなければならない。

**1\. 置換文字へのフォールバック禁止 (Prohibition of Replacement Character)** エンコーダおよび検証器は、入力文字列に含まれる不正なコードポイント列（Ill-formed subsequences）に対し、置換文字（Replacement Character, U+FFFD, \`\`）を挿入して処理を続行してはならない（MUST NOT）。

* **TextEncoderの盲信禁止:** ブラウザ標準の `TextEncoder.encode()` 等は、デフォルトで不正シーケンスを U+FFFD に置換する仕様となっているため、HACE 実装においてはそのまま使用することは禁止される（参照: 附属書A NAP-16）。  
* **理由:** 「勝手に直す」挙動は、入力データの破損を隠蔽し、将来的なハッシュ不一致（修正ロジックの実装差）の原因となるためである。

**2\. Error\_Lock の即時発動 (Atomic Halt on Error)** 不正な UTF-8 シーケンス（孤立サロゲート、冗長エンコーディング等）が検出された場合、実装は例外なく **Atomic Halt (Error\_Lock)** を発動しなければならない（MUST）。

* 出力バッファには一切の書き込みを行わず、処理を原子的に停止させなければならない。これは、不正な文字データが含まれている時点で、そのグラフ構造全体の信頼性が損なわれていると判断するためである。

**3\. 検証すべき不正シーケンス (Targeted Malformations)** 実装は、エンコード処理の前段において、以下の不正パターンをスキャンし、排除しなければならない。

* **孤立サロゲート (Lone Surrogates):** UTF-16 形式の文字列から変換する場合、サロゲートペアを構成しない孤立したサロゲートコードポイント（High: U+D800–U+DBFF, Low: U+DC00–U+DFFF）の存在を許容してはならない。WTF-8（Wobbly Transformation Format）のような拡張形式の使用は禁止される。  
* **最短形式の強制 (Enforcement of Shortest Form):** 同一のコードポイントに対して複数のバイト列表現（冗長なエンコーディング／Overlong Encoding）が存在する場合、規格上定義された最短形式以外のバイト列を不正とみなさなければならない。

**4\. BOMの禁止 (Prohibition of Byte Order Mark)** 出力される UTF-8 バイトストリームの先頭に、バイト順マーク（BOM, `0xEF 0xBB 0xBF`）を含めてはならない（MUST NOT）。

* 入力文字列の先頭に BOM が含まれている場合、それは「文字列の一部」ではなく「不適切なメタデータ」とみなされ、Error\_Lock の対象となる（参照: 附属書A NAP-19）。

##### **7.3.2 サロゲートペア検証義務 (Mandatory Validation of Surrogate Pairs)** {#7.3.2-サロゲートペア検証義務-(mandatory-validation-of-surrogate-pairs)}

HACE準拠の実装は、JavaScript文字列（UTF-16コードユニット列）等の内部表現からUTF-8バイト列へエンコードする際、サロゲートペアを構成しない **孤立サロゲート（Lone Surrogate）** が含まれていないことを、エンコード処理の前に事前に検証しなければならない（MUST）。

**1\. 定義 (Definition)** 孤立サロゲートとは、以下のいずれかの状態を指す。これらは Unicode スカラー値ではないため、Well-formed な UTF-8 バイト列として表現することは不可能である。

* 上位サロゲート（High-surrogate: `0xD800`–`0xDBFF`）が、下位サロゲート（Low-surrogate: `0xDC00`–`0xDFFF`）を伴わずに現れる場合。  
* 下位サロゲートが、上位サロゲートを伴わずに現れる場合。

**2\. 自動置換の禁止 (Prohibition of Silent Replacement)** 多くの標準ライブラリ（例: ブラウザの `TextEncoder` や Python の `errors='replace'` モード）は、孤立サロゲートを検知すると自動的に **置換文字（Replacement Character, U+FFFD, ）** へ変換して処理を続行する仕様となっている（W3C Encoding Standard 準拠）。 HACE において、このような「情報の欠落を伴う黙示的な修復」は、ハッシュ値の衝突耐性を著しく低下させ、また置換ロジックの実装差異（1つの U+FFFD にまとめるか、個別に置換するか等）による非決定性を招くため、 **厳格に禁止される** （参照: 附属書A NAP-16）。

**3\. Error\_Lock の即時発動 (Atomic Halt)** 実装は、エンコード処理の前段において文字列全体をスキャンし、孤立サロゲートを検出した場合は直ちに **Error\_Lock** を発動しなければならない（MUST）。

* **処理の遮断:** 出力バッファには一切の書き込みを行わず、処理を原子的に停止（Atomic Halting）させなければならない。不正な文字データが含まれている時点で、そのグラフ構造全体の信頼性が損なわれていると判断するためである。

**4\. WTF-8 の禁止 (Prohibition of WTF-8)** 孤立サロゲートをそのまま3バイトのシーケンスとしてエンコードする「WTF-8（Wobbly Transformation Format）」や、それに類する非標準的な拡張形式の使用は禁止される。出力される正規化データは、必ず **RFC 3629** に準拠した Well-formed UTF-8 でなければならない。

---

### **8\. 正準バイナリレイアウト (Canonical Binary Layout)** {#8.-正準バイナリレイアウト-(canonical-binary-layout)}

#### **8.1 ストリーム構造 (Stream Structure)** {#8.1-ストリーム構造-(stream-structure)}

##### **8.1.1 ストリームヘッダ (Stream Header) 定義** {#8.1.1-ストリームヘッダ-(stream-header)-定義}

HACE エンジンが出力する正規化バイトストリームは、必ず以下の **9バイトの固定長ヘッダ** で開始されなければならない（MUST）。デコーダは、読み込み開始時にこのヘッダを検証し、1ビットでも不一致がある場合は処理を開始せずに即座に **Error\_Lock** としなければならない。

| オフセット | 長さ | フィールド名 | 値 (Hex) | 説明 / 期待値 |
| ----- | ----- | ----- | ----- | ----- |
| **\+0** | 4 | **Magic** | `48 41 43 45` | \*\*Magic Number ("HACE")\*\*ファイル形式識別子。ASCIIコードの "HACE" に相当する。 |
| **\+4** | 1 | **VerMaj** | `38` | \*\*Version Major (56)\*\*仕様のメジャーバージョン。互換性のない変更時にインクリメントされる。 |
| **\+5** | 1 | **VerMin** | `03` | \*\*Version Minor (3)\*\*仕様のマイナーバージョン（v56.3 Final Freeze）。 |
| **\+6** | 1 | **Status** | *(Variable)* | **ステータスバイト**ストリームの完了状態を示す（詳細は 8.1.2 参照）。`00`: COMPLETE, `01`: PROCESSING, `EE`: ERROR\_LOCK |
| **\+7** | 1 | **CCS Ver** | `01` | \*\*比較アルゴリズムバージョン (Fingerprint v1)\*\*Phase 1 のソートに使用された Fingerprint/Mix 関数のバージョンID。これが一致しない場合、ソート順序の互換性がないためリジェクトしなければならない。 |
| **\+8** | 1 | **Guard** | `0A` | \*\*Newline Guard (LF)\*\*テキストモードでの誤転送（改行変換）による破損を検知するためのガードシーケンス。 |

**注記:**

1. **ルートノードの開始:** 実際のデータ（ルートノードの TLV）は、このヘッダの直後（オフセット \+9）から開始される。  
2. **CCS Version Check:** オフセット \+7 の `CCS Ver` は、将来的なハッシュアルゴリズムの変更（v57以降）に対する防衛策である。v56.3 準拠のデコーダは、この値が `0x01` 以外の場合、たとえメジャーバージョンが一致していても読み込みを拒否しなければならない（参照: 12.3 ダウングレード攻撃への対策）。

##### **8.1.2 Status Byte 定義 (`COMPLETE`, `PROCESSING`, `ERROR_LOCK`)** {#8.1.2-status-byte-定義-(complete,-processing,-error_lock)}

ストリームヘッダのオフセット **\+6** に位置する **Status Byte** は、当該バイトストリームの「完全性（Completeness）」と「信頼性（Trustworthiness）」を示す状態フラグである。実装は以下の定義値を厳守し、それ以外の値が記録されたファイルを不正なデータとして拒絶しなければならない。

**1\. 定義値 (Defined Values)**

| ステータス名 | 値 (Hex) | 意味論 (Semantics) | デコーダの挙動 |
| ----- | ----- | ----- | ----- |
| **COMPLETE** | `0x00` | **正常終了**全データが正常に書き込まれ、整合性が保証されている状態。 | **読み込み許可**処理を開始してよい。 |
| **PROCESSING** | `0x01` | **処理中 / 書き込み中**エンコーダが現在ファイルを生成中であり、データが不完全である状態。 | \*\*読み込み禁止 (Busy)\*\*ファイルがロックされているとみなし、アクセスしてはならない。 |
| **ERROR\_LOCK** | `0xEE` | \*\*異常停止 (Atomic Halt)\*\*正規化プロセス中に `Error_Lock` が発動し、処理が中断された状態。内容は信頼できない。 | \*\*読み込み禁止 (Reject)\*\*即座にエラーとして処理を終了する。 |

**注記:** `ERROR_LOCK` の値は、v56.2 以前のドラフトで使用されていた `0xFF` から `0xEE` へ変更された。これはストリーム内部で使用される **EOS Tag (0xFF)** との衝突を避けるためである（参照: 附属書B.2）。

**2\. 状態遷移と書き込みプロトコル (State Transition Protocol)** HACE エンジン（エンコーダ）は、ファイル出力において以下の手順を義務付けられる（MUST）。

* **初期化 (Initialization):** 出力ストリームの作成直後、ヘッダを書き込む際は、Status Byte を必ず **`0x01` (PROCESSING)** に設定しなければならない。これにより、書き込み途中のデータが誤って読み込まれることを防ぐ。

* **完了時のコミット (Commit on Completion):** 全ての正規化プロセスが正常に終了し、末尾に EOS Tag (0xFF) を書き込んだ後、エンコーダはファイルポインタを先頭（オフセット \+6）にシークし、Status Byte を **`0x00` (COMPLETE)** に上書き（Overwrite）しなければならない。

* **エラー時の封鎖 (Lock on Error):** 処理中に `Error_Lock` 状態へ遷移した場合、エンコーダは可能な限りファイルポインタを先頭にシークし、Status Byte を **`0xEE` (ERROR\_LOCK)** に上書きしてファイルをクローズしなければならない。これにより、当該ファイルが「破損データ」であることを永続的にマークする。

**3\. ストリーミング配信における例外** ネットワークソケットや標準出力など、シーク（巻き戻し）が不可能なストリームへの出力においては、ヘッダの Status Byte は `0x01` (PROCESSING) のままとし、受信側はストリーム末尾の **EOS Tag (0xFF)** の有無をもって完全性を検証しなければならない（参照: 8.2.1）。

#### **8.2 TLV (Tag-Length-Value) エンコーディング** {#8.2-tlv-(tag-length-value)-エンコーディング}

##### **8.2.1 Tag ID レジストリ割り当て** {#8.2.1-tag-id-レジストリ割り当て}

HACE バイナリストリーム（出力用および比較用）において使用される型タグ（Type Tag）は、 **1バイトの符号なし整数 (`uint8`)** としてエンコードされる。実装者は、以下の表に定義された割り当てを厳守しなければならない（MUST）。

* **定義:** Tag 値は 0 から 255 までの範囲をとる。  
* **制約:** 本表で「予約（Reserved）」または「使用禁止（Forbidden）」とされている値を使用してはならない。未定義のタグを検出した場合、デコーダは直ちに `Error_Lock` 状態へ遷移しなければならない。

| Tag ID (Dec) | Tag ID (Hex) | 型名称 (Type Name) | ペイロード定義 / 備考 |
| ----- | ----- | ----- | ----- |
| **0** | `00` | **Reserved** | \*\*使用禁止 (Forbidden)\*\*C++ 等のデフォルト初期化値 (0) との混同を防ぐため、欠番とする。旧仕様の Undefined は廃止された。 |
| **1** | `01` | **Null** | **Length: 0**値 `null` (JS), `None` (Python), `nullptr` (C++) を表す。ペイロードは持たない。 |
| **2** | `02` | **True** | **Length: 0**ブール値 `true` を表す。ペイロードは持たない。 |
| **3** | `03` | **False** | **Length: 0**ブール値 `false` を表す。ペイロードは持たない。 |
| **4** | `04` | **Number** | **Length: 8**IEEE 754 Binary64 浮動小数点数。正規化された NaN (`0x7FF8...`) および \-0 の区別を含む（参照: 7.1.1）。 |
| **5** | `05` | **String** | \*\*Length: 可変 (Byte Count)\*\*UTF-8 文字列。BOM 禁止、不正シーケンス禁止（参照: 7.3.1）。 |
| **6** | `06` | **BigInt** | **Length: 可変**任意精度整数。「符号バイト(1) \+ 絶対値バイト列」形式（参照: v56.3 Final Fix）。 |
| **7** | `07` | **Date** | **Length: 8**Unix Epoch (ms) を表す符号付き64ビット整数 (`int64`, Big-Endian)。 |
| **8** | `08` | **Array** | \*\*Length: 可変 (Total Bytes)\*\*順序付きリスト。疎配列（Holes）は `Null` (Tag 1\) として埋める。 |
| **9** | `09` | **Object** | \*\*Length: 可変 (Total Bytes)\*\*文字列キーを持つキーバリュー構造。キーの UTF-8 バイト順でソート必須。 |
| **10** | `0A` | **Map** | \*\*Length: 可変 (Total Bytes)\*\*任意の型をキーとするキーバリュー構造。キーの比較バイナリ順でソート必須。 |
| **11** | `0B` | **Set** | \*\*Length: 可変 (Total Bytes)\*\*一意な値の集合。比較バイナリ順でソート必須。重複は `Error_Lock`。 |
| 12-98 | `0C`\-`62` | *Reserved* | 将来の拡張（Extended Types）のために予約。使用禁止。 |
| **99** | `63` | **Ref** | **Length: 8**定義済みコンテナへの参照ID (`uint64`, Big-Endian)。前方参照は禁止される。 |
| 100-253 | `64`\-`FD` | *Reserved* | アプリケーション固有拡張のために予約（Vendor Specific）。 |
| **254** | `FE` | **CycleMarker** | \*\*Length: 0 【比較ストリーム専用 (Phase 1 Only)】\*\*循環参照を検出した際に、無限再帰を防ぐためのマーカー。出力ストリームには含めてはならない。 |
| **255** | `FF` | **Control** | \*\*Length: 0 【コンテキスト依存】\*\*Phase 1 (比較): **DepthLimit** (深度制限打ち切り)Phase 2 (出力): **EOS** (End of Stream / ストリーム終端) |

**注記 (Normative Notes):**

1. **Undefined の廃止:** 旧バージョン（v55以前）で存在した `Undefined` タグは廃止された。JavaScript の `undefined` 値は、コンテキストに応じて `Null` (Tag 1\) に変換するか（配列要素の場合）、またはエントリ自体を削除（Objectプロパティの場合）しなければならない。  
2. **Comparison Only タグ:** Tag 254 (`CycleMarker`) および 255 (`DepthLimit`) は、Phase 1 の構造解析（ソート順序決定）のための内部的な比較ストリームにおいてのみ使用される。最終的な出力ストリーム（Phase 2 Output）の途中にこれらが含まれていた場合、検証器（Oracle Validator）はこれを不正なデータとみなし `Error_Lock` しなければならない。ただし、ストリームの完全な末尾を示す `EOS` (Tag 255\) は例外とする（参照: 8.1.2）。

##### **8.2.2 特殊値 (Null, Undefined, Holes) のバイト表現** {#8.2.2-特殊値-(null,-undefined,-holes)-のバイト表現}

本規格において、特殊な値（Null, Undefined）およびデータ構造上の欠損（Holes）は、以下の規則に従って正規化されなければならない。これにより、言語ごとの「未定義」の扱いの差異（例: JS の `undefined` vs Python の `None`）を吸収し、一意のバイト列表現を保証する。

**1\. Null (Tag 1\)** 値 `null`（または各言語における等価な値、例: Python `None`, C++ `nullptr`）は、 **Tag 1** を用いて表現される。

* **ヘッダ構成:**  
  * **Tag:** `0x01`  
  * **Length:** `0x00000000` (0バイト)  
* **ペイロード:** 存在しない（0バイト）。  
* **バイト列例:** `01 00 00 00 00`

**2\. Undefined の廃止とマッピング (Abolition and Mapping of Undefined)** HACE v56.2 以降において、`undefined` を表す固有のタグは **廃止された** （旧仕様の Tag 0 は「予約（Reserved）」となり使用禁止）。入力データに含まれる `undefined` 値は、コンテキストに応じて以下のいずれかの処理を行わなければならない（MUST）。

* **オブジェクトプロパティの値 (Object Values):** 値が `undefined` であるプロパティは、\*\*シリアライズ対象から除外（Ignore）\*\*しなければならない。キー自体を出力ストリームに含めてはならない。

  * 例: `{ "a": 1, "b": undefined }` → `[["a", 1]]` 相当のバイト列（"b" は消滅する）。  
* **配列の要素 (Array Elements):** 値が `undefined` である要素は、 **Null (Tag 1\)** に変換して出力しなければならない。

  * 例: `[1, undefined, 2]` → `[Number(1), Null, Number(2)]` 相当のバイト列。  
* **ルート値または単独の値 (Root/Atom):** `undefined` が単独で正規化対象となった場合、 **Null (Tag 1\)** として出力する。

**3\. 配列の欠損 (Array Holes)** 疎配列（Sparse Array）における「穴（Hole / Empty Slot）」は、存在しないものとして詰める（Skip）のではなく、明示的な値として埋めなければならない。

* **正規化ルール:** 配列の `length` プロパティの範囲内に存在する全ての欠損インデックスは、 **Null (Tag 1\)** ノードとして具象化（Materialize）される。

* **バイト列表現:** `[1, , 2]` （長さ3、インデックス1が欠損）の場合、出力される Array コンテナの Length は、3つの子要素（Number, Null, Number）の合計バイト長となる。

* **禁止事項:** 欠損を無視して \`\` （長さ2）として詰めたり、`undefined` タグを使用したりすることは、データの構造的同一性を破壊するため、規格違反（ **Error\_Lock** ）となる。

#### **8.3 形式文法 (Formal Binary Grammar)** {#8.3-形式文法-(formal-binary-grammar)}

##### **8.3.1 ABNF (Augmented BNF) によるストリーム定義** {#8.3.1-abnf-(augmented-bnf)-によるストリーム定義}

HACE エンジンが出力する正規化バイトストリームの構文規則は、以下の ABNF (RFC 5234\) によって定義される。なお、本定義における終端記号（Terminal Values）は、すべてオクテット（8ビットバイト）単位の数値として解釈される。

**1\. ストリーム全体構造 (Stream Structure)**

hace-stream    \= stream-header root-node eos-marker

stream-header  \= magic-number version-info status-byte ccs-version guard-byte

magic-number   \= %x48.41.43.45  ; "HACE"

version-info   \= ver-major ver-minor

ver-major      \= %x38           ; 56 (Decimal)

ver-minor      \= %x03           ; 03 (Decimal, v56.3)

status-byte    \= %x00 / %x01 / %xEE

                 ; 00=COMPLETE, 01=PROCESSING, EE=ERROR\_LOCK

ccs-version    \= %x01           ; Fingerprint v1 Algorithm

guard-byte     \= %x0A           ; LF (Newline Guard)

eos-marker     \= %xFF           ; End of Stream Tag

**2\. ノード構造 (Node Structure)**

root-node      \= node

node           \= atom-node / container-node / ref-node

; TLV Header Components

tag            \= OCTET

length         \= UINT32-BE      ; Payload Byte Count

; Primitives (Atoms)

atom-node      \= null-node / bool-node / number-node / string-node /

                 bigint-node / date-node

null-node      \= %x01 %x00.00.00.00          ; Tag 1, Len 0

bool-node      \= true-node / false-node

true-node      \= %x02 %x00.00.00.00          ; Tag 2, Len 0

false-node     \= %x03 %x00.00.00.00          ; Tag 3, Len 0

number-node    \= %x04 %x00.00.00.08 ieee64-be ; Tag 4, Len 8

string-node    \= %x05 length utf8-bytes      ; Tag 5

bigint-node    \= %x06 length bigint-payload  ; Tag 6

date-node      \= %x07 %x00.00.00.08 int64-be  ; Tag 7

; Containers (Recursive)

container-node \= array-node / object-node / map-node / set-node

array-node     \= %x08 length \*node           ; Tag 8

object-node    \= %x09 length \*node           ; Tag 9 (Sorted Properties)

map-node       \= %x0A length \*node           ; Tag 10 (Sorted Entries)

set-node       \= %x0B length \*node           ; Tag 11 (Sorted Elements)

; Reference

ref-node       \= %x63 %x00.00.00.08 ref-id   ; Tag 99, Len 8

**3\. 基本データ型定義 (Primitive Definitions)**

; Fixed-width Integers (Big-Endian)

UINT32-BE      \= 4OCTET

UINT64-BE      \= 8OCTET

INT64-BE       \= 8OCTET         ; Two's complement

; Payloads

ieee64-be      \= UINT64-BE      ; Canonicalized NaN (7ff8...) & Signed Zero

ref-id         \= UINT64-BE      ; Target DefID (1-based)

utf8-bytes     \= \*OCTET         ; RFC 3629 UTF-8 (No BOM, No Surrogate Halves)

bigint-payload \= sign-byte magnitude

sign-byte      \= %x00 / %x01    ; 00=Positive/Zero, 01=Negative

magnitude      \= 1\*OCTET        ; Big-Endian unsigned integer, no leading zeros

OCTET          \= %x00-FF

**注記:**

1. **Lengthの一貫性:** `length` ルールで示される値は、直後のペイロード（`utf8-bytes` や `*node` の連結など）の**総バイト数**と厳密に一致しなければならない。  
2. **再帰の停止:** `container-node` は再帰的に定義されているが、仕様上 `ref-node` の使用により循環参照は必ず有限の深さで停止する。  
3. **BigInt形式:** v56.3 より、BigInt は ASCII 文字列ではなく、符号バイトとバイナリ絶対値の組み合わせに変更された（Source 288, 292）。

##### **8.3.2 TLV 構造の形式的定義** {#8.3.2-tlv-構造の形式的定義}

HACE のバイナリストリームは、ルートノードを起点とする再帰的な **TLV (Tag-Length-Value)** 構造の密な結合（Concatenation）によって構成される。実装は、以下の構造定義を厳守し、定義されていないパディング（Padding）や区切り文字（Delimiter）を一切挿入してはならない。

**1\. ノードの基本構造 (Generic Node Structure)** 全てのノード（Atom, Container, Reference）は、以下の形式を持つ。

$$ \\text{Node} ::= \\text{Header} \\oplus \\text{Payload} $$

* **Header:** 5バイト固定。  
* **Payload:** 可変長（Header 内の Length フィールドにより定義）。

**2\. ヘッダ定義 (Header Definition)** ヘッダは、データの型とサイズを示す。

| オフセット | 長さ (Byte) | 型 | フィールド名 | 定義 / 制約 |
| ----- | ----- | ----- | ----- | ----- |
| **\+0** | 1 | `uint8` | **Tag** | **型タグ ID**値域: `0x01`～`0xFF` (`0x00` は禁止)参照: 8.2.1 Tag ID レジストリ |
| **\+1** | 4 | `uint32` | **Length** | \*\*ペイロード長 (Byte Count)\*\*エンディアン: **Big-Endian**単位: **オクテット数**（要素数や文字数ではない）範囲: $0 \\le L \< 2^{32}$ |

**3\. ペイロード定義 (Payload Definition by Type)** Tag の値に応じて、Payload の内部構造は以下のように分岐する。

* **Primitive Types (Tag 1-7)**

  * **Null / True / False (Tag 1-3):**  
    * Length: `0`  
    * Payload: $\\emptyset$ (存在しない)  
  * **Number (Tag 4):**  
    * Length: `8`  
    * Payload: `IEEE 754 Binary64` (Big-Endian, Canonical NaN, Signed Zero)  
  * **String (Tag 5):**  
    * Length: $N$ (UTF-8バイト数)  
    * Payload: `UTF-8 Bytes` (BOMなし, 終端文字なし)  
  * **BigInt (Tag 6):**  
    * Length: $1 \+ N$  
    * Payload: `[Sign: uint8] [Magnitude: uint8...]`  
      * Sign: `0x00` (+) / `0x01` (-)  
      * Magnitude: 絶対値の Big-Endian バイト列（先頭ゼロ禁止）  
  * **Date (Tag 7):**  
    * Length: `8`  
    * Payload: `int64` (Big-Endian, Epoch ms)  
* **Reference Type (Tag 99\)**

  * **Ref (Tag 99):**  
    * Length: `8`  
    * Payload: `TargetID` (uint64, Big-Endian)  
    * 制約: `TargetID` は、Pre-order DFS 順序で既に出現（定義）済みのコンテナIDでなければならない。  
* **Container Types (Tag 8-11)**

  * **Array / Object / Map / Set:**  
    * Length: $\\sum \\text{Size}(\\text{ChildNode}\_i)$ （子ノードの総バイト長）  
    * Payload: `ChildNode_1` $\\oplus$ `ChildNode_2` $\\oplus \\dots \\oplus$ `ChildNode_k`  
    * 構造: 子ノードの TLV が隙間なく連結される。  
    * 順序: Phase 1 で決定された正準順序（Canonical Order）に従う。

**4\. 構造的制約 (Structural Invariants)**

* **IDの暗黙的定義:** コンテナ定義（Definition）ノード自体には ID フィールドは存在しない。ID はストリームの先頭からの **Pre-order DFS（行きがけ順）** によるコンテナ出現順序（1, 2, 3...）として暗黙的に割り当てられる。  
* **完全消費 (Total Consumption):** コンテナの `Length` は、再帰的に含まれる全ての子孫ノードのバイト長の合計と厳密に一致しなければならない。デコーダは、`Header` 読了後に `CurrentOffset + Length` へジャンプすることで、コンテナ全体をスキップ可能でなければならない。

---

### **9\. 走査と構造決定ロジック (Traversal Logic)** {#9.-走査と構造決定ロジック-(traversal-logic)}

#### **9.1 2フェーズ・コミットプロトコル** {#9.1-2フェーズ・コミットプロトコル}

##### **9.1.1 Phase 1: Structure Analysis (CCS生成・ソート \- 出力禁止)** {#9.1.1-phase-1:-structure-analysis-(ccs生成・ソート---出力禁止)}

構造解析フェーズ（Phase 1）は、グラフのトポロジーを決定論的に確定させるための「読み取り専用（Read-Only）」の工程である。本フェーズの唯一の目的は、コンテナ（Object, Map, Set）が子要素を訪問すべき「正準順序（Canonical Order）」を決定し、それを `KeyOrderMap` に記録することにある。

実装は、以下の手順と制約を厳密に遵守しなければならない。

**1\. 出力の完全禁止 (Prohibition of Emission)** 本フェーズの実行中、実装はいかなるバイト列も最終出力ストリーム（Output Stream）へ書き込んではならない（参照: 附属書A NAP-01）。

* **ID付与の禁止:** コンテナに対する永続的な定義ID（DefID）の割り当てを行ってはならない。この段階でのID付与は、ソート結果によってIDが変動する非決定性（Hash Race）を招くため、厳格に禁止される（参照: 附属書A NAP-17）。

**2\. キー抽出とフィルタリング (Key Extraction)** 各コンテナ型に対し、以下のルールでソート対象となる要素を抽出する。

* **Object:** プロパティの列挙は、`Reflect.ownKeys()` 相当の操作を行い、`typeof key === "string"` かつ `propertyIsEnumerable` が真であるもののみを抽出対象としなければならない。プロトタイプチェーン上のプロパティや Symbol キーは無視される（参照: 附属書A NAP-07）。  
* **Map:** 全てのエントリ `[key, value]` を抽出対象とする。挿入順序（Insertion Order）は無視しなければならない（参照: 附属書A NAP-08）。  
* **Set:** 全ての要素 `value` を抽出対象とする。

**3\. CCS (Canonical Comparison Schema) の生成** 抽出された各要素について、ソート順序を決定するために一時的な「比較用正規化データ（CCS）」を生成しなければならない（参照: 9.2）。

* **文法の分離:** このデータ生成には、IDフィールドを持たず深さ制限タグを含む **Comparison Grammar** を使用しなければならない。出力用のエンコーダを流用することは禁止される。  
* **Structural Fingerprint:** コンテナ（List, Map）に対しては、その内容と順序を反映した 64-bit 構造ハッシュ（Fingerprint v1）を計算し、CCS のペイロードに含めなければならない（参照: 9.2.2）。  
* **深度制限:** CCS生成時の再帰深度 $d\_{cmp}$ が 10 に達した場合、それ以上の探索を打ち切り、即座に `LimitTag (255)` を生成しなければならない。これは無限再帰によるソート処理のクラッシュを防ぐためである（参照: 10.1.2）。  
* **循環検知:** 比較パス上の循環（Ancestors Stack内での再出現）を検知した場合、仮値（Provisional Fingerprint）または `CycleMarker` を使用して解決しなければならない（参照: 9.3.1）。

**4\. 正準ソート (Canonical Sort)** 生成された CCS に基づき、要素リストを決定論的にソートする。

* **優先順位:** 以下の優先順位（Priority）で比較を行う（参照: 9.4 決定論的タイブレーク）。  
  1. **Fingerprint:** $A.FP \< B.FP$  
  2. **Tag ID:** $A.Tag \< B.Tag$  
  3. **Length:** $A.Len \< B.Len$  
  4. **Raw Bytes:** `memcmp` による辞書順比較。  
* **実装制約:** 言語標準の `sort()` 関数（特にロケール依存のもの）を直接使用してはならない。必ず上記の比較ロジックに基づくカスタム比較関数を使用すること（参照: 附属書A NAP-06）。

**5\. KeyOrderMap の構築と固定** 確定した順序（ソート済みのキー配列、またはインデックス配列）は、当該コンテナを一意に識別するキー（TempID または WeakMapキー）に関連付けられ、`KeyOrderMap` に保存されなければならない。Phase 2（出力フェーズ）では、必ずこのマップに記録された順序に従ってトラバーサルを行わなければならない。

##### **9.1.2 Phase 2: Emission (ID付与・出力 \- ソート禁止)** {#9.1.2-phase-2:-emission-(id付与・出力---ソート禁止)}

出力フェーズ（Phase 2）は、Phase 1 で生成・凍結された `KeyOrderMap` に従い、グラフを再走査して最終的な正準化バイト列（Canonical Byte Stream）を生成する工程である。本フェーズの責務は、データの「シリアライズ（Serialization）」と「識別子割り当て（ID Assignment）」に限定され、構造の再評価や順序の変更を行ってはならない。

実装は、以下の手順と制約を厳密に遵守しなければならない（MUST）。

**1\. 決定論的走査 (Deterministic Traversal)**

* **順序の強制 (Enforcement of Order):** コンテナ（Object, Map, Set）の子要素を訪問する際は、必ず Phase 1 で構築された `KeyOrderMap` からソート済みのキーリストを取得し、その順序に従って反復処理を行わなければならない。  
* **再取得の禁止 (Prohibition of Re-fetch):** `Object.keys()`, `Map.prototype.entries()`, `for..in` ループ等を用いて、ランタイムから動的にキーを再取得することは、Phase 1 と異なる順序（挿入順やハッシュ順）になるリスクがあるため、 **厳格に禁止される** （参照: 附属書A NAP-05）。

**2\. ID 割り当て (ID Assignment)**

* **行きがけ順 (Pre-order):** 定義ID（DefID）は、DFS（深さ優先探索）の行きがけ順（Pre-order）、すなわちノードへの「初回訪問時（First Encounter）」に連番で付与されなければならない（参照: 9.3.2）。  
* **アトムとコンテナの分離:**  
  * **Atoms (Tag 1-6):** IDを持たない（ID=0）。Visited Map への登録も行わない。  
  * **Containers (Tag 7-11):** 参照同一性を持ち、一意の ID（$1$ 以上の整数）が付与される。  
* **Identity Map:** 訪問済みコンテナを追跡するために、`Map<ObjectRef, DefID>` 形式の Visited マップを使用する。このマップは Phase 2 開始時に空で初期化されなければならない。

**3\. 出力ロジック (Emission Logic)** トラバーサルエンジンは、ノード訪問時に以下のロジックで出力を行う。

* **定義ノード (Definition Node):** コンテナノードに初めて到達した場合、新規 ID を割り当て、Visited マップに登録した後、`[Tag, DefID, Payload]` 形式の定義ノードを出力する。その後、子要素への再帰探索を行う。  
* **参照ノード (Reference Node):** 既に Visited マップに存在するコンテナノードに到達した場合、その割り当て済み ID を取得し、`[Tag:99, Length:0, TargetID]` 形式の参照ノードを出力して、その枝の探索を直ちに終了する（参照: 8.2.1）。  
* **アトム (Atoms):** プリミティブ値は、常に即値として出力される。IDフィールドは `0` で埋められる。

**4\. 出力バッファの安全性 (Buffer Safety)**

* **トランザクション:** 書き込みは、L0 Safety Kernel が管理する一時的なトランザクションバッファ（Shadow Buffer）に対して行われなければならない。  
* **アトミック性:** 処理中に `Error_Lock` が発生した場合、バッファは即座に破棄され、不完全なデータ（Partial Emission）が外部に漏れることを物理的に防がなければならない（参照: 6.3.1）。

##### **9.1.3 フェーズ間の状態汚染防止 (Phase Barrier)** {#9.1.3-フェーズ間の状態汚染防止-(phase-barrier)}

HACE準拠の実装は、Phase 1（構造解析）と Phase 2（出力）の間に、厳格な **フェーズバリア（Phase Barrier）** を設けなければならない。このバリアは、Phase 1 で生成された一時的な計算状態（ソートのための訪問履歴やハッシュ計算値）が、Phase 2 の決定論的 ID 付与プロセスに干渉することを防ぐために存在する。

実装は以下の分離規則を遵守しなければならない（MUST）。

**1\. 情報の唯一の通路 (Sole Conduit of Information)** Phase 1 から Phase 2 へ受け渡してよい情報は、確定した構造順序を記録した **`KeyOrderMap`**（および付随する `SortedPlan`）のみに限定される。

* **再利用の禁止:** Phase 1 で計算されたフィンガープリント、一時的な深度情報、あるいは比較のために生成されたバイト列を、Phase 2 の出力ストリームに直接コピーしたり、ID 割り当ての判断材料として再利用したりしてはならない。

**2\. 訪問状態の分離 (Isolation of Visited State)** Phase 1 で使用される循環検知用の `RecursionStack`（または `VisitedSet`）と、Phase 2 で使用される ID 付与用の `VisitedMap<ObjectRef, DefID>` は、 **完全に独立したインスタンス** でなければならない。

* **Fresh Start:** Phase 2 の開始時、トラバーサルエンジンは「未訪問（Fresh）」な状態から開始し、Phase 1 の訪問履歴（「このノードは既に比較済みである」といった情報）を継承してはならない。これは、ソートのための訪問順序と、ID付与のための訪問順序（Pre-order）が論理的に異なるためである。

**3\. メモリ領域の不干渉 (Memory Disjointness)** Phase 1 で使用される **Comparison Binary Pool**（比較用バッファ）と、Phase 2 で使用される **Output Arena**（出力用バッファ）は、物理的に異なるメモリ領域、あるいは論理的に明確に区別されたライフサイクルを持つ領域でなければならない。

* **副作用の禁止:** Phase 1 の実行中に Output Arena への書き込みを行うこと（Side Effect）、および Phase 2 の実行中に Comparison Binary Pool を（ソート目的で）新たに確保することは、共に規格違反となる（参照: 附属書A NAP-01, NAP-05）。

**4\. エラー状態の波及防止** エラー（例外状態）の扱いもフェーズによって厳密に区別される。

* **Phase 1:** 深度制限超過（Comparison Depth \> 10）により `LimitTag (255)` が生成されたとしても、それは「比較のための値」としてのみ扱われ、Phase 2 のトラバーサルを停止させる `Error_Lock` として扱ってはならない（Phase 2 は `KeyOrderMap` に従って淡々と出力を行う）。  
* **Phase 2:** Phase 2 で発生した `Error_Lock`（走査深度超過やUTF-8不正など）は、直ちに全出力を無効化しなければならない。

#### **9.2 比較用正規化スキーム (Canonical Comparison Schema: CCS)** {#9.2-比較用正規化スキーム-(canonical-comparison-schema:-ccs)}

##### **9.2.1 CCS Versioning と前方互換性** {#9.2.1-ccs-versioning-と前方互換性}

**1\. CCSバージョンの定義と識別** Canonical Comparison Schema (CCS) は、グラフのトラバーサル順序（ID付与順序）を一意に決定するための比較ロジックおよびバイナリ形式の総称である。このロジックの変更は、出力される正規化バイト列（Canonical Byte Stream）の大幅な変更を意味するため、ストリームヘッダによって厳密にバージョン管理されなければならない。

* **識別子:** ストリームヘッダのオフセット **\+7** に位置する `CCS Ver` フィールド（1バイト）を使用する。  
* **現行バージョン:** 本規格（v56.3）に準拠する実装は、このフィールドに必ず **`0x01`** を設定しなければならない（Fingerprint v1 アルゴリズム）。

**2\. 検証と拒絶 (Verification and Rejection)** デコーダ（または検証器）は、ストリームの読み込み開始時に必ず `CCS Ver` を検証しなければならない。

* **一致:** 値が `0x01` である場合、処理を続行する。  
* **不一致:** 値が `0x01` 以外（例: 将来の `0x02` や過去のバージョン）である場合、実装はこれを「互換性のないデータ」とみなし、直ちに **Error\_Lock** を発動して処理を中断しなければならない。  
  * **前方互換性の制限:** HACE は、未知の CCS バージョンでソートされたデータを「なんとなく処理する」ことを許容しない。順序決定ロジックが異なれば、生成される ID も異なり、ハッシュ値の一貫性が損なわれるためである。

**3\. アルゴリズムの凍結 (Algorithm Freezing)** `CCS Ver = 0x01` が指定されている限り、実装者は以下のアルゴリズムを変更してはならない（MUST NOT）。

* **Fingerprint 計算式:** Rotate-XOR-Add 方式（参照: 9.2.2）。  
* **即値（Immediate Value）の定義:** 文字列のパディングや BigInt の符号配置など。  
* **タイブレーク・ルール:** Tag \> Length \> Raw Bytes の優先順位。

**4\. 将来の拡張 (Future Proofing)** 将来、ハッシュアルゴリズムの脆弱性が発見されたり、より効率的なソート手法が採用されたりする場合は、`CCS Ver` をインクリメント（`0x02` 等）した新しい規格を策定する。これにより、v56.3 準拠のエンジンは、自身が解釈できない新しい形式のデータを安全に拒絶（Fail-Fast）することが可能となる。

##### **9.2.2 Structural Fingerprint v1 (Algorithm ID: `0x1`)** {#9.2.2-structural-fingerprint-v1-(algorithm-id:-0x1)}

Structural Fingerprint（構造指紋）は、コンテナ（List, Map）の内容と順序を一意の 64-bit 整数に縮約する非暗号学的ハッシュ関数である。Phase 1 におけるソート順序の決定は、主としてこの値の大小比較（unsigned comparison）によって行われる。

実装は、以下の算術モデルとアルゴリズムを厳密に再現しなければならない（MUST）。

**1\. 算術演算モデル (Arithmetic Model)** 本アルゴリズムにおける全ての演算は、**64-bit 符号なし整数 ($\\text{uint64\_t}$)** の空間で行われる。

* **モジュロ演算:** 加算・乗算・ビットシフトの結果は、常に $2^{64}$ での剰余（wrapping）となる。オーバーフローした上位ビットは無視（truncate）される。  
* **論理シフト:** 右シフト演算は常に論理右シフト（logical right shift / zero-fill）でなければならない。算術右シフトの使用は禁止される。  
* **マスク:** シフト演算のシフト量は、実行前に必ず `& 63` でマスクされなければならない。

**2\. 定数定義 (Constants)**

* **Seed:** `0x4841434556353603` (ASCII "HACEv56.3" の一部)  
* **Prime1:** `0xff51afd7ed558ccd`  
* **Prime2:** `0xc4ceb9fe1a85ec53`  
* **Multiplier:** `0x9e3779b97f4a7c15`

**3\. Mix 関数 (Mixing Function)** 入力 `v` (uint64) を撹拌する関数 `Mix(v)` を以下のように定義する。これは Wyhash の拡散ロジックに由来する。

uint64\_t Mix(uint64\_t v) {

    v ^= v \>\> 33;

    v \*= 0xff51afd7ed558ccd; // Prime1

    v ^= v \>\> 33;

    v \*= 0xc4ceb9fe1a85ec53; // Prime2

    v ^= v \>\> 33;

    return v;

}

**4\. 算出アルゴリズム (Calculation Algorithm)** コンテナ $C$ が持つ子要素列 $E \= \[e\_1, e\_2, \\dots, e\_n\]$ に対し、フィンガープリント $H$ は以下の手順で計算される。なお、子要素列 $E$ は、Map/Set の場合は仮の順序（子の Fingerprint 等によるソート済み順序）でなければならない。

1. **初期化:** アキュムレータ $H$ を `Seed` で初期化する。  
2. **反復:** 各子要素 $e$ について以下を実行する。  
   * **回転 (Rotate):** $H$ を左に 5 ビット回転させる（順序依存性を確保するため）。 $$ H \= (H \\ll 5\) \\mid (H \\gg 59\) $$  
   * **合成 (Combine):** 子要素のタグ $Tag(e)$ と即値 $Immediate(e)$ を合成し、Mix したものを $H$ に XOR 加算する。 $$ H \\oplus= Mix(Tag(e) \\oplus Immediate(e)) $$  
   * **拡散 (Disperse):** $H$ に `Multiplier` を乗算する。 $$ H \\times= 0x9e3779b97f4a7c15 $$  
3. **終端処理 (Finalize):** 子要素の個数（Length）を XOR 合成する。 $$ H \\oplus= Length(E) $$  
4. **バージョン刻印 (Version Stamping):** 最上位 4bit を `0x1` (Algorithm ID) に固定する。 $$ H \= (H \\land \\text{0x0FFFFFFFFFFFFFFF}) \\mid \\text{0x1000000000000000} $$

**5\. 即値の取得 (Immediate Value Definition)** 計算式内の $Immediate(e)$ は、子要素 $e$ の型に応じ、以下のテーブルに従って生成された `uint64` 値でなければならない（MUST）。

| 型 (Type) | Immediate Value (u64) 生成ルール |
| ----- | ----- |
| **Null** | `0x0000000000000000` |
| **Bool** | False $\\rightarrow$ `0x00`, True $\\rightarrow$ `0x01` |
| **Float64** | `bitcast<u64>(Canonical(val))` ※ 正規化済み (NaN=`0x7ff8...`, \-0維持) のIEEEビット列。 |
| **String** | `Mix(First8Bytes ^ (Length << 32))` ※ `First8Bytes`: 文字列（UTF-8）の先頭8バイトを u64 (Big-Endian) として解釈。8バイト未満は下位ビットを0埋め（左詰め）。 |
| **BigInt** | \`Mix((Sign \<\< 63\) |
| **List / Map** | `Child.Fingerprint` (再帰計算済みの値) |
| **Limit / Cycle** | `Mix(ContainerTag)` ※ 循環検知時の仮値、または深度制限時の値として、自身のコンテナタグ（List=`0x10`, Map=`0x11`）を Mix した値を使用する。0 ではない。 |

**注記:** このアルゴリズムにより、構造的に等価なコンテナは必ず同一の Fingerprint を持ち、1ビットでも構造や値が異なれば（高い確率で）異なる Fingerprint を持つことが保証される。Fingerprint が衝突した場合は、9.4 節の決定論的タイブレークに従う。

##### **9.2.3 算術演算モデル (Arithmetic Model)** {#9.2.3-算術演算モデル-(arithmetic-model)}

###### **9.2.3.1 64-bit Unsigned Integer Wrapping ($mod\\ 2^{64}$) の強制** {#9.2.3.1-64-bit-unsigned-integer-wrapping-($mod\-2^{64}$)-の強制}

本規格における Fingerprint（構造ハッシュ）の計算、および CCS 生成に関わる全ての加算（Add）、減算（Sub）、乗算（Mul）は、 **64ビット符号なし整数空間 ($\\text{uint64\_t}$)** における **剰余環 $\\mathbb{Z}/2^{64}\\mathbb{Z}$** 上の演算として定義される。

実装は、ホスト言語の仕様に関わらず、以下の挙動を厳密に再現しなければならない（MUST）。

**1\. ラップアラウンド動作 (Wrapping Behavior)** 演算結果が $2^{64}-1$ を超える場合（オーバーフロー）、または $0$ を下回る場合（アンダーフロー）、上位ビットは単純に切り捨てられ（Truncate）、下位64ビットのみが結果として採用されなければならない。

* **定義式:** $$ Result \= (Operand\_A \\oplus Operand\_B) \\pmod{2^{64}} $$ ※ $\\oplus$ は加算、減算、乗算のいずれか。  
* **禁止事項:**  
  * **飽和演算 (Saturation):** 最大値や最小値で値を止める処理は禁止される。  
  * **例外送出:** オーバーフローをエラーとして扱い、処理を停止させてはならない（ID生成時の U53 制限とは異なる点に注意せよ）。  
  * **符号付き演算:** C/C++ 等における符号付き整数のオーバーフローは未定義動作（Undefined Behavior）を引き起こすため、必ず `unsigned` 型を使用しなければならない。

**2\. JavaScript 環境における実装義務** JavaScript (ECMAScript) の `Number` 型は IEEE 754 倍精度浮動小数点数であり、53ビットを超える整数の精度を保証しない。したがって、本算術モデルの実装に `Number` 型を使用してはならない（MUST NOT）。

* **BigInt の使用:** 実装者は必ず `BigInt` を使用しなければならない。  
* **マスク処理:** 各演算ステップ（特に乗算と加算の直後）ごとに、必ず `BigInt.asUintN(64, val)` または `val & 0xFFFFFFFFFFFFFFFFn` を適用し、強制的に64ビット境界へ丸め込まなければならない。

**3\. Rust/C++ 環境における実装義務**

* **Rust:** デバッグビルドにおけるオーバーフローチェック（Panic）を回避するため、必ず `wrapping_add`, `wrapping_mul` 等の明示的なラッピングメソッドを使用しなければならない。  
* **C++:** 必ず `uint64_t` (unsigned long long) を使用し、意図しない型昇格や符号拡張を防ぐため、演算結果を明示的にキャストまたはマスクすることが推奨される。

###### **9.2.3.2 論理右シフト (Logical Right Shift) の強制と算術シフトの禁止** {#9.2.3.2-論理右シフト-(logical-right-shift)-の強制と算術シフトの禁止}

本規格における Fingerprint 計算およびその他のビット操作において、右シフト演算が必要となる場合、実装は常に **論理右シフト（Logical Right Shift / Zero-fill Right Shift）** を使用しなければならない（MUST）。

**1\. 動作定義 (Definition of Behavior)** 論理右シフト操作において、シフトによって空いた最上位ビット（MSB）側には、元の値の符号ビットに関わらず、常に **`0`** が補填されなければならない。

* **禁止事項:** 符号ビットを維持・拡張する「算術右シフト（Arithmetic Shift / Sign-propagating Shift）」の使用は、負数のビット表現を破壊し、プラットフォーム間での非決定性を招くため、厳格に禁止される（MUST NOT）。

**2\. 実装上の強制 (Implementation Enforcement)** 各プログラミング言語において、以下の演算子または手順を使用すること。

* **JavaScript / Java:**

  * 必ず **`>>>` 演算子** を使用しなければならない。  
  * 通常の `>>` 演算子は算術シフト（符号維持）であるため、使用してはならない。  
* **C / C++ / Rust:**

  * シフト対象の変数は、必ず **`unsigned` 型（`uint64_t`, `u64` 等）** でなければならない。  
  * `signed` 型に対する `>>` 演算子の挙動は、処理系定義（Implementation-defined）または算術シフトとなることが一般的であるため、演算前に必ず `unsigned` 型へキャストしなければならない。

**3\. 理由 (Rationale)** HACE のハッシュアルゴリズム（Wyhash系）は、全ビットを「符号なしのビットパターン」として扱うことを前提としている。算術シフトによる符号拡張（1埋め）が混入すると、値の拡散特性が変化し、異なる言語実装間でハッシュ値の不一致（Divergence）が発生するためである。

###### **9.2.3.3 シフト量のマスク (`& 63`) 処理義務** {#9.2.3.3-シフト量のマスク-(&-63)-処理義務}

本規格におけるフィンガープリント計算（Rotate等）およびその他のビット操作において、ビットシフト演算（左シフト `<<`、論理右シフト `>>>`）を行う場合、シフト量（右オペランド）は演算実行前に必ず **`& 63` (`0x3F`)** でマスクされなければならない（MUST）。

**1\. 動作定義 (Definition of Behavior)** すべてのシフト演算は、以下の式に従って実行されるものと定義する。 $$ Result \= Value \\text{ shift\_op } (Amount \\land 63\) $$

* ここで `shift_op` は、左シフトまたは論理右シフトである。  
* このマスク処理により、シフト量は常に $0$ から $63$ の範囲（$\\pmod{64}$）に収まることが保証される。

**2\. 理由 (Rationale)** シフト量がデータ幅（64ビット）以上になった場合の挙動は、プログラミング言語仕様および CPU アーキテクチャによって異なり、ハッシュ値の不一致やシステムクラッシュの直接的な原因となるためである。

* **C/C++ の未定義動作:** シフト量が型幅以上（例: `x << 64`）の場合、C/C++ 標準では「未定義動作 (Undefined Behavior)」となり、コンパイラや CPU によって結果が不定（0 になる、そのまま残る、クラッシュするなど）となる。  
* **JavaScript / Java の仕様:** 一般に下位ビットのみを使用する（暗黙の `& 63`）仕様となっているが、HACE ではこれを「言語の仕様」に依存せず、「明示的な演算」として規定することで、全てのプラットフォームでの挙動を統一する。

**3\. 実装要件 (Implementation Requirement)** 実装者は、シフト演算を行う箇所において、コンパイラの最適化や言語の暗黙的な挙動に頼ることなく、明示的にビット論理積（AND）操作を記述しなければならない。

**例 (Rotate Leftの実装):**  
 // 安全な回転シフトの実装例

uint64\_t rotl(uint64\_t x, int k) {

    int n \= k & 63; // マスク処理を強制

    return (x \<\< n) | (x \>\> (64 \- n)); // 右オペランドも (64-n) & 63 となることが望ましいが、n=0のケースを除けば整合する

}

*  ※厳密には `(x >>> (64 - n & 63))` のように補数側もマスクすることが推奨される。

##### **9.2.4 即値の取得 (Immediate Value Definition)** {#9.2.4-即値の取得-(immediate-value-definition)}

###### **9.2.4.1 String: Lengthの上位ビットシフト混合とMSB左詰め配置** {#9.2.4.1-string:-lengthの上位ビットシフト混合とmsb左詰め配置}

文字列型（Tag 5）のフィンガープリント計算における $ImmediateValue$ は、文字列の「先頭バイト列」と「バイト長」を合成し、以下の式に従って算出された `uint64` 値でなければならない（MUST）。

$$ Immediate \= Mix(First8Bytes \\oplus (Length \\ll 32)) $$

**1\. First8Bytes の構成 (MSB Alignment)** 文字列の先頭8バイト（UTF-8）は、64ビット整数の上位ビット（MSB: Most Significant Byte）側から順に左詰めで配置されなければならない。

* **データソース:** 正規化および検証済みの UTF-8 バイト列 $B \= \[b\_0, b\_1, \\dots, b\_{n-1}\]$ を使用する。  
* **配置ルール:** バイト配列のインデックス $i$ ($0 \\le i \< 8$) に対し、各バイト $b\_i$ はビット位置 $64 \- 8(i+1)$ に配置される。 $$ First8Bytes \= \\sum\_{i=0}^{\\min(n,8)-1} (b\_i \\ll (56 \- 8i)) $$  
* **パディング (Zero Padding):** 文字列長 $n$ が 8バイト未満の場合、残りの下位ビット（LSB側）はすべて $0$ で埋めなければならない。ガベージデータの混入は禁止される。  
* **切り捨て (Truncation):** 文字列長 $n$ が 8バイト以上の場合、先頭8バイトのみを使用し、9バイト目以降は $ImmediateValue$ の生成には使用しない（これらは後続のハッシュ連鎖で考慮されるため）。

**2\. Length の混合 (Length Mixing)** 文字列のバイト長 $Length$ ($n$) を `uint64` として扱い、32ビット左シフト（$\\ll 32$）した上で、$First8Bytes$ と排他的論理和（XOR, $\\oplus$）を取らなければならない,。

* **目的:** $Length$ 情報を上位32ビット側に配置することで、文字列データ（多くの場合、ASCII文字は下位ビットに情報を持つ）とのビット干渉を避け、Mix関数の拡散効率を最大化するためである。  
* **共通プレフィックス対策:** この操作により、"KeyA" と "KeyB" のような共通の先頭を持つ文字列や、長い共通プレフィックスを持つ文字列同士のハッシュ衝突耐性が向上する。

**3\. 実装例 (Reference Logic)**

uint64\_t calcStringImmediate(const uint8\_t\* data, size\_t length) {

    uint64\_t first8 \= 0;

    size\_t copy\_len \= length \< 8 ? length : 8;

    // MSB左詰め配置 (Big-Endian Loadに相当)

    for (size\_t i \= 0; i \< copy\_len; i++) {

        first8 |= (uint64\_t)data\[i\] \<\< (56 \- i \* 8);

    }

    // Lengthを上位へシフトして混合

    uint64\_t input \= first8 ^ ((uint64\_t)length \<\< 32);

    return Mix(input);

}

###### **9.2.4.2 BigInt: 絶対値 (Magnitude) と MSB符号ビットの配置** {#9.2.4.2-bigint:-絶対値-(magnitude)-と-msb符号ビットの配置}

BigInt型（Tag 6）のフィンガープリント計算における $ImmediateValue$ は、値の「符号」と「絶対値」を分離し、以下の式に従って符号ビットを最上位（MSB）へ配置した `uint64` 値でなければならない（MUST）。

$$ Immediate \= Mix((Sign \\ll 63\) \\mid MagnitudeLow64) $$

**1\. 符号ビットの MSB 配置 (Sign Bit at MSB)** 値の正負を示す符号ビット $Sign$ は、64ビット整数空間の最上位ビット（第63ビット）に配置されなければならない。

* **定義:**  
  * **正 (Positive) および ゼロ (Zero):** $Sign \= 0$  
  * **負 (Negative):** $Sign \= 1$  
  * **シフト:** $Sign$ 値を 63ビット左シフト（$\\ll 63$）する。これにより、符号情報は `0x0000...` または `0x8000...` となる。  
* **理由:** 以前のドラフト（LSB側でのXOR合成）では、符号の違いが最下位ビットの変化にしかならず、絶対値の偶奇と干渉してハッシュ分布に偏りが生じるリスクがあったため、これを物理的に分離・回避する（参照: Source 276, 279）。

**2\. 絶対値の取得 (Absolute Magnitude)** 値の大きさ（Magnitude）は、**2の補数表現ではなく、必ず絶対値（Absolute Value）** として取得し、その下位64ビットを使用しなければならない。

* **定義:** $$ MagnitudeLow64 \= \\text{abs}(Value) \\pmod{2^{64}} $$  
* **マスク処理:** 実装においては、`BigInt` の絶対値に対し、ビットマスク `0xFFFFFFFFFFFFFFFF` を適用して下位64ビットを抽出する。  
* **2の補数の禁止:** 負数であっても、2の補数（Two's Complement）形式に変換してはならない。これは、正数と負数が同じ「絶対値」のビットパターンを持つようにし、符号ビットのみで区別するためである（参照: Source 272）。

**3\. 合成 (Composition)** シフトされた符号ビットと、絶対値の下位64ビットは、ビット論理和（OR, $\\mid$）によって合成される。

* **衝突の許容:** もし絶対値の最上位ビット（第63ビット）が $1$ であった場合、負数の符号ビットと衝突するが、Mix関数による拡散工程を経るため、ハッシュの衝突耐性としては許容される。重要なのは、符号情報がLSB（最下位）ではなくMSB（最上位）側のビットパターンに影響を与えることである（参照: Source 280）。

**4\. 実装例 (Reference Logic)**

// JavaScript (BigInt) Implementation

function calcBigIntImmediate(val: bigint): bigint {

    const sign \= val \< 0n ? 1n : 0n;

    const absVal \= val \< 0n ? \-val : val;

    // 下位64bitの抽出 (Wrapping)

    const magnitude \= absVal & 0xFFFFFFFFFFFFFFFFn;

    // 符号をMSBへ配置し合成

    const immediate \= (sign \<\< 63n) | magnitude;

    return Mix(immediate);

}

###### **9.2.4.3 Container: 再帰的Fingerprintと型IDの混合** {#9.2.4.3-container:-再帰的fingerprintと型idの混合}

コンテナ型（List, Map, Object, Set）のフィンガープリント計算における $ImmediateValue$ は、そのコンテナが保持する**すべての子要素の Fingerprint を、順序依存のローリングハッシュ（Rolling Hash）によって合成した値**でなければならない（MUST）。

これにより、コンテナの内容（Values）や構造（Structure）が1ビットでも異なれば、上位のコンテナのハッシュも連鎖的に変化（Avalanche Effect）することが保証される。

**1\. 入力シーケンスの定義 (Input Sequence)** 計算の入力となる「子要素列 $E \= \[e\_1, e\_2, \\dots, e\_n\]$」は、コンテナの種類に応じて以下のように定義される。

* **Array (Tag 8):** インデックス順（Index Order）に並んだ要素列。疎配列の欠損（Hole）は Null (Tag 1\) として含める。  
* **Set (Tag 11):** **正準ソート（Canonical Sort）済み** の要素列。  
* **Object (Tag 9\) / Map (Tag 10):** **キーによって正準ソート済み** のエントリ列。各エントリのキーと値は、フラットなシーケンスとして、あるいはエントリノードとしてハッシュ計算に組み込まれる。

**2\. 計算アルゴリズム (Calculation Algorithm)** コンテナの $ImmediateValue$ は、以下の手順で計算されるアキュムレータ $H$ の最終状態とする。

1. **初期化:** $H$ を `Seed` (`0x4841434556353603`) で初期化する。  
2. **反復:** 各子要素 $e$ について、以下の演算を順次適用する。  
   * **順序依存回転 (Order-Dependent Rotate):** $H$ を左に5ビット回転させる。これにより、要素の出現順序が結果に影響を与える（`[A, B]` と `[B, A]` を区別する）。 $$ H \= (H \\ll 5\) \\mid (H \\gg 59\) $$  
   * **子要素の混合 (Child Mixing):** 子要素自身のタグ $Tag(e)$ と、再帰的に計算された即値 $Immediate(e)$ を合成し、Mix 関数を通したものを $H$ に XOR 加算する。 $$ H \\oplus= Mix(Tag(e) \\oplus Immediate(e)) $$  
   * **拡散 (Dispersion):** $H$ に定数 `Multiplier` (`0x9e3779b97f4a7c15`) を乗算する。 $$ H \\times= Multiplier $$  
3. **長さの混合 (Length Mixing):** 最後に、子要素数（バイト長ではない）を XOR 合成する。 $$ H \\oplus= Count(E) $$

**3\. 再帰と循環の制御 (Recursion and Cycle Control)** コンテナの Fingerprint 計算は定義上「再帰的」であるが、無限ループを防ぐために以下の停止条件を適用しなければならない（MUST）。

* **深度制限 (Depth Limit):** 比較深度 $d\_{cmp}$ が 10 に達した場合、それ以上の子要素計算を行わず、直ちに `LimitTag (255)` のハッシュ値を合成して打ち切る。  
* **循環参照 (Cycle Detection):** 計算パス上に自身の祖先ノード（Ancestors）が出現した場合（循環検知）、その再帰呼び出しは直ちに停止し、**仮の値（Provisional Value）** を使用しなければならない。  
  * **仮の値の定義:** 単なる 0 ではなく、**循環しているコンテナ自身の Tag ID を Mix したもの** を使用する（参照: Source 301, 303）。  
  * $$ Immediate\_{cycle} \= Mix(ContainerTag) $$  
  * これにより、`List` の自己参照と `Map` の自己参照が区別され、ハッシュの衝突耐性が向上する。

**4\. 参照透過性 (Referential Transparency)** この計算プロセスにおいて、コンテナのメモリアドレス（ポインタ値）や生成時刻、ガベージコレクションの状態を使用してはならない。結果は常にグラフの「構造」のみによって決定されなければならない。

#### **9.3 循環参照と同一性 (Cycle & Identity)** {#9.3-循環参照と同一性-(cycle-&-identity)}

##### **9.3.1 帰りがけ順 (Post-order) 計算と仮値解決 (Mix TagID)** {#9.3.1-帰りがけ順-(post-order)-計算と仮値解決-(mix-tagid)}

コンテナ（List, Map, Set, Object）の Fingerprint 計算は、子要素のハッシュ値を必要とするため、グラフ探索における **帰りがけ順（Post-order Traversal）** で実行されなければならない。循環参照（Cycle）が存在する場合、計算が完了していないノードへの再帰が発生するため、実装は以下のロジックを用いて「仮の値（Provisional Value）」による解決を行わなければならない（MUST）。

**1\. 計算ステート管理 (Calculation State)** Fingerprint 計算プロセスにおいて、各コンテナノードは以下の3つの状態のいずれかを持つ。

* **Unvisited:** まだ計算が開始されていない。  
* **Solving (On Stack):** 現在計算中であり、再帰スタック（Ancestors）上に存在する。  
* **Computed:** 計算が完了し、Fingerprint が確定している。

**2\. 循環検知と仮値の適用 (Cycle Detection & Provisional Value)** 計算ルーチンがノード $N$ を訪問した際、その状態に応じて以下の処理を行う。

* **Case A: Computed** 既に計算済みの Fingerprint をキャッシュから返し、再処理は行わない（DAGにおける合流の高速化）。  
* **Case B: Solving (循環検知)** ノード $N$ が `Solving` 状態である場合、これは「循環参照（Cycle）」である。この場合、無限再帰を防ぐために直ちに探索を打ち切り、以下の式で定義される **仮値（Provisional Fingerprint）** を返さなければならない。 $$ Provisional \= Mix(TagID(N)) $$  
  * **定義:** ここで $TagID(N)$ は、当該コンテナの型タグ（例: List=`0x08`, Map=`0x0A`）である。  
  * **Mix関数:** 9.2.2 で定義された `Mix(uint64)` 関数を使用する。  
  * **理由:** 単なる定数 `0` を仮値とすると、自己参照する List (`[self]`) と自己参照する Map (`{key: self}`) の構造ハッシュが衝突しやすくなるため、コンテナ自身の型情報をエントロピーとして混入させる（Source 277, 301）。  
* **Case C: Unvisited** ノード $N$ を `Solving` 状態にマークし、子要素の Fingerprint 計算（再帰）を開始する。全ての子要素の計算が完了した後、自身の Fingerprint を確定させ、状態を `Computed` に変更する。

**3\. 決定論的切断 (Deterministic Cut)** 循環構造におけるハッシュ値は「サイクルのどこを切断して仮値を適用したか」に依存するが、HACE では以下の要因により、この切断位置が常に一意に定まることが保証される。

* **入力順序の保存:** List はインデックス順に走査される。  
* **辞書順ソート:** Map/Set/Object は、キー（または要素）の内容に基づく正準ソート（Phase 1 の主要目的）順に走査される。  
* **結論:** したがって、同じ構造を持つグラフであれば、常に同じ経路で循環が検知され、同じ仮値が適用されるため、最終的な Fingerprint は決定論的となる。

##### **9.3.2 参照同一性 (Reference Identity) の定義と構造的等価性の禁止** {#9.3.2-参照同一性-(reference-identity)-の定義と構造的等価性の禁止}

HACE エンジンは、グラフ内のノードが「同一であるか」を判定する際、データ型に応じて異なる同一性戦略（Identity Strategy）を適用しなければならない。特にコンテナ型において、内容が同じであることをもって同一とみなす「構造的等価性」の採用は、厳格に禁止される。

**1\. コンテナの参照同一性 (Reference Identity for Containers)** コンテナ型（List, Map, Object, Set）のノード同一性は、メモリ上に確保された **「インスタンスの一意性（Instance Uniqueness）」** によってのみ定義される。

* **定義:** 2つのコンテナ変数 $A$ と $B$ があるとき、それらがメモリ上の同一のアドレス（または同一のオブジェクト参照）を指している場合のみ、 $A \\equiv B$ と判定する。  
* **実装要件:**  
  * **JavaScript:** 厳密等価演算子 `===` (Strict Equality) を使用する。  
  * **C++ / Rust:** ポインタのアドレス値の一致を確認する（ただし、アドレスの大小比較は禁止。参照: 9.4）。  
* **構造的等価性の禁止 (Prohibition of Structural Equality):**  
  * 内容が完全に同一であっても、別々のインスタンスとして生成されたコンテナは、**異なるノード** として扱わなければならない（MUST）。  
  * 例: `a = {x: 1}; b = {x: 1};` の場合、`a` と `b` は正規化グラフ上で別々の ID を持つ異なるノードとなる。これらを同一視して `b` を `a` への参照（Ref Node）として出力することは、グラフのトポロジー（木構造 vs DAG）を勝手に改変する行為であり、規格違反となる（参照: 附属書A NAP-19）。

**2\. アトムの値同一性 (Value Identity for Atoms)** プリミティブ型（Null, Boolean, Number, String, BigInt, Date）のノード同一性は、その **「値（Value）」** 自体によって定義される。

* **定義:** 値のビット表現が正規化後に一致する場合、それらは同一とみなされる。  
* **IDの非適用:** 「分離定理（Separation Theorem）」に基づき、アトムは参照同一性を持たないため、一意な ID（DefID）は付与されず、Visited Map への登録も行わない（参照: 9.1.2）。  
* **注記:** これにより、同じ文字列 "hello" がグラフ中に100回出現しても、それらは共有参照（Tag 99）ではなく、100個の即値として出力される。

**3\. 理由 (Rationale)** 構造的等価性（Structural Equality）に基づく同一性判定（Memoizationによる共有化など）を禁止する理由は以下の通りである。

* **計算量の爆発回避:** 巨大なグラフにおいて、全てのノード間で内容の完全一致を確認することは $O(N^2)$ 以上のコストを要し、正規化処理のパフォーマンスを著しく低下させるため。  
* **意図の保存:** ユーザーが「同じ値を持つ別のオブジェクト」として定義したものを、エンジンが勝手に「同じオブジェクト」として結合することは、データの意味論（Semantics）を変更するリスクがあるため。

##### **9.3.3 安定ノードID (Stable Node ID) による代替実装の許可** {#9.3.3-安定ノードid-(stable-node-id)-による代替実装の許可}

分散システム、データベース上の永続化データ、あるいはメモリアドレスの概念が希薄な環境において HACE を実装する場合、9.3.2 で規定された「メモリアドレスによる参照同一性（Reference Identity）」の厳密な適用が困難なケースが存在する。このような環境に限り、実装は以下の規定に従って **「安定したノード識別子（Stable Node Instance ID）」** を用いて参照同一性を代替してもよい（**MAY**）。

**1\. 定義と許可 (Definition and Permission)** 実装は、オブジェクトのメモリアドレス（ポインタ）の代わりに、そのオブジェクトインスタンスに紐付いた「安定したノード識別子」を、同一性判定（Visited Check）および循環検知（Cycle Detection）のキーとして使用することができる。

**2\. 制約事項 (Constraints)** この代替手段を採用する場合、使用される識別子は以下の要件を完全に満たさなければならない。

* **セッション内一意性 (Session Uniqueness):** 当該識別子は、少なくとも1回の正規化セッション（CanonicalHash計算の開始から終了まで）の間、対象となるグラフ内のすべてのノードにおいて一意でなければならない。  
* **不変性 (Immutability):** 当該識別子は、正規化プロセスの実行中に決して変更されてはならない。  
* **非依存性 (Independence):** この安定IDは、HACEが出力する正規化ID（DefID）とは異なる内部的な識別子であり、最終的な出力バイト列の内容や順序に影響を与えてはならない（あくまで「どのノードとどのノードが同一インスタンスか」を識別するためだけに使用される）。

**3\. 用途例 (Use Cases)**

* **分散オブジェクト:** UUID や URI を持つリモートオブジェクト。  
* **データベース:** プライマリキー（PK）を持つレコード。  
* **永続化データ構造:** 挿入順やメモリ配置に依存しない内部IDを持つイミュータブルなデータ構造。

#### **9.4 決定論的タイブレーク (Deterministic Tie-break)** {#9.4-決定論的タイブレーク-(deterministic-tie-break)}

##### **9.4.1 優先順位: Fingerprint \> Tag \> Length \> Raw Bytes** {#9.4.1-優先順位:-fingerprint->-tag->-length->-raw-bytes}

Phase 1 の構造解析において、2つのノード $A$ と $B$ の順序関係を決定する比較関数 `CanonicalCompare(A, B)` は、以下の 4段階の優先順位（Priority Hierarchy） に従って評価を行わなければならない（MUST）。 実装は、上位の基準で差がついた時点で比較を終了し、結果を確定させる。全ての基準において一致した場合のみ、両者は「トポロジー的に等価」とみなされる。

**1\. Primary Key: Structural Fingerprint** 最初に、9.2.2 で算出された **Structural Fingerprint (uint64)** を比較する。

* 比較は **符号なし整数 (Unsigned Integer)** として行う。  
* 判定:  
  * $A.Fingerprint \< B.Fingerprint \\implies A \\prec B$  
  * $A.Fingerprint \> B.Fingerprint \\implies A \\succ B$  
  * 一致する場合、次項（Tag）へ進む。

**2\. Secondary Key: Tag ID** Fingerprint が衝突した場合（ハッシュ衝突、または構造が類似している場合）、**Tag ID (uint8)** を比較する。これにより、例えば `Numeric(1)` と `String("1")` のような、値の表現が似ていても型が異なるノードの順序を一意に定める。

* 比較は **符号なし整数** として行う。  
* 判定:  
  * $A.Tag \< B.Tag \\implies A \\prec B$  
  * $A.Tag \> B.Tag \\implies A \\succ B$  
  * 一致する場合、次項（Length）へ進む。

**3\. Tertiary Key: Payload Length** Tag ID も一致した場合、比較用バイナリ（CCS）におけるペイロードの **バイト長 (uint32)** を比較する。

* 比較は **符号なし整数** として行う。  
* 判定:  
  * $A.Length \< B.Length \\implies A \\prec B$ （短い方が先）  
  * $A.Length \> B.Length \\implies A \\succ B$  
  * 一致する場合、次項（Raw Bytes）へ進む。

**4\. Quaternary Key: Raw Bytes** 長さまでもが一致した場合、ペイロードの **バイト列そのもの (Raw Bytes)** を比較する。

* 比較規則: 9.4.2 で定義される辞書順比較（Lexicographical Comparison）に従う。  
* 判定:  
  * $A.Bytes \\prec\_{lex} B.Bytes \\implies A \\prec B$  
  * $A.Bytes \\succ\_{lex} B.Bytes \\implies A \\succ B$  
  * 一致する場合、両者は **「トポロジー的に同一（Topologically Identical）」** であると結論付ける。

**同一性公理 (Identity Axiom):** 上記 1〜4 すべてが一致する場合、ノード $A$ と $B$ は正規化の観点において区別不可能である。この場合、実装はこれらを同一順位として扱い、入力順（Input Order）または実装依存の安定ソート（Stable Sort）によって相対位置を維持することを許容する。ただし、出力される正規化バイト列（Canonical Byte Stream）の内容には影響を与えてはならない（参照: 7.2.5）。

##### **9.4.2 Raw Bytes 比較規則: Unsigned Lexicographical Order と長さ規則** {#9.4.2-raw-bytes-比較規則:-unsigned-lexicographical-order-と長さ規則}

Phase 1 のソートにおけるタイブレーク（優先順位4）で使用されるバイト列比較、および HACE エンジン内部で行われる全てのバイナリ比較は、以下の規則に従う **「符号なし辞書順比較 (Unsigned Lexicographical Comparison)」** でなければならない（MUST）。

**1\. 符号なしバイト解釈 (Unsigned Byte Interpretation)** バイト列を構成する各オクテット（8ビット）は、必ず **符号なし整数 (Unsigned 8-bit Integer, 0～255)** として解釈し、比較しなければならない。

* **定義:** ビットパターン `11111111` (`0xFF`) は、数値 255 として扱われる。  
* **大小関係:** `0xFF` (255) は `0x00` (0) よりも **大きい** ($255 \> 0$)。  
* **言語依存の罠の回避:**  
  * **Java 等:** `byte` 型が符号付き（-128～127）である環境では、`0xFF` が `-1` と解釈され `0x00` より小さいと判定されるリスクがある。実装者は必ず `(b & 0xFF)` 等のマスク処理を行い、符号なし整数へ昇格させてから比較を行わなければならない。

**2\. 辞書順比較アルゴリズム (Lexicographical Comparison Algorithm)** 2つのバイト列 $A$ と $B$ の比較は、以下のアルゴリズムに従って実行される。

* **手順:**  
  1. 両者の長さの最小値 $L\_{min} \= \\min(Length(A), Length(B))$ を求める。  
  2. インデックス $i$ を $0$ から $L\_{min} \- 1$ まで走査し、各バイト $A\[i\]$ と $B\[i\]$ を比較する。  
  3. 不一致 ($A\[i\] \\neq B\[i\]$) が見つかった時点で、そのバイト同士の大小関係（符号なし）を全体の大小関係として決定し、比較を終了する。

**3\. 接頭辞と長さ規則 (Prefix and Length Rule)** 一方のバイト列が他方の「接頭辞（Prefix）」となっている場合（すなわち、長さ $L\_{min}$ までの全バイトが一致する場合）、**「長さが短い方」を小さい (Smaller)** と判定しなければならない。

* **定義:**  
  * $A$ が $B$ の接頭辞であり、かつ $Length(A) \< Length(B)$ ならば、$A \\prec B$。  
* **例:**  
  * `[0xAA]` と `[0xAA, 0x00]` を比較する場合、`[0xAA]` の方が小さい。  
  * `[0xAA]` \< `[0xAA, 0x00]`  
* **注記:** 9.4.1 の優先順位により、通常は「Length」の比較が先に行われるためこのケースは稀であるが、`memcmp` 相当の関数として単体で利用される場合や、将来的な拡張においても一貫性を保つため、この長さ規則は絶対的なものとする。

**4\. 完全一致 (Identity)** 長さが等しく、かつ全てのバイトが一致する場合のみ、両者は **「等価 (Equal)」** とみなされる。

---

### **10\. 境界防御と安全性 (Boundary Guards and Safety)** {#10.-境界防御と安全性-(boundary-guards-and-safety)}

#### **10.1 境界防御機構** {#10.1-境界防御機構}

##### **10.1.1 スタック深度ガード ($d\_{trav}$ / $d\_{cmp}$)** {#10.1.1-スタック深度ガード-($d_{trav}$-/-$d_{cmp}$)}

Safety Kernel は、グラフ走査における再帰深度を監視するために、 **トラバーサル深度 (** $d\_{trav}$ **)** と **比較深度 (** $d\_{cmp}$ **)** という2つの独立したカウンタを管理しなければならない。

これらのガード機構は、ホスト言語のコールスタック制限（例: JavaScript エンジンの再帰上限）に依存してはならず、必ず Safety Kernel 内の明示的な整数カウンタによって制御されなければならない（参照: 附属書A NAP-18）。

**1\. トラバーサル深度 ($d\_{trav}$)**

* **定義:** 正規化セッション全体（Phase 2 出力フェーズ）における、ルートノードからのノード遷移（Node Transitions）の深さ。  
* **制限値:** **1000** (固定)。  
* **動作:** カウンタが制限値を超過した場合、Safety Kernel はこれを「リソース枯渇の危険」と判断し、直ちに **Error\_Lock** を発動しなければならない（SHALL）。  
* **スコープ:** 正規化セッション（CanonicalHash呼び出し）全体で維持され、再帰呼び出し毎にインクリメント、復帰時にデクリメントされる。  
* **目的:** 悪意ある深いネストや、検出漏れの循環参照によるシステムクラッシュ（Crash）を物理的に防ぐため。

**2\. 比較深度 ($d\_{cmp}$)**

* **定義:** Phase 1（構造解析）において、2つのノードの大小関係を判定するために一時的に生成される比較ストリームの再帰深さ。  
* **制限値:** **10** (固定)。  
* **動作:** カウンタが制限値を超過した場合、比較ストリームビルダーは直ちに **LimitTag (255)** を出力し、その枝の探索を打ち切らなければならない（SHALL）。この場合、Error\_Lock は発動せず、LimitTag を含んだバイト列として比較・ソートが継続される。  
* **スコープ:** 比較関数（CanonicalCompare）の呼び出し毎に **0 にリセット** される。  
* **目的:** 循環参照や極端に深い構造を持つグラフに対しても、有限時間内でのソート完了（全順序の決定）を数学的に保証するため。

**3\. 深度の計測単位**

* **ノード遷移:** 深度は「コンテナ（Object, Array, Map, Set）の入れ子レベル」によって計測される。  
* **除外対象:** オブジェクトのプロパティ数や配列の要素数（幅）は深度に影響を与えない。  
* **ルート:** ルートノードの深度は 0 とする。

##### **10.1.2 ループ/複雑度ガード ($d\_{cmp}$ / Ancestors Stack)** {#10.1.2-ループ/複雑度ガード-($d_{cmp}$-/-ancestors-stack)}

Phase 1（構造解析・ソート）においては、ノードに永続的な ID がまだ割り当てられていないため、Phase 2 で使用される `VisitedMap` による参照解決（Tag 99）を使用することができない。この状態で循環参照や過度に深い構造を持つグラフを比較・ソートしようとすると、無限再帰や指数関数的な計算時間の爆発（Complexity Explosion）を招くリスクがある。

これを防ぐため、Safety Kernel は比較処理（CanonicalCompare）および比較ストリーム生成に対して、以下の **ループ検知** および **複雑度制限** を強制しなければならない（SHALL）。

**1\. 比較ループガード (Comparison Loop Guard)**

* **定義:** 比較ストリーム生成中の「現在の再帰スタック（Ancestors Stack）」上に、同一のオブジェクトインスタンスが再度出現すること（循環参照）を検知する機構。  
* **検出時の動作:** 循環が検出された場合、それ以上の深掘り（子要素の展開）を直ちに停止し、比較ストリームに **CycleMarker (Tag 254\)** を出力しなければならない。  
  * **CycleMarker:** `[Tag: 254, Length: 0]` の形式を持つ（参照: 8.2.1）。  
* **制約:** この検知は「現在の比較パス」内でのみ有効であり、永続的な Visited 状態としては記録されない（Phase 1 は ID を持たないため）。これにより、無限ループを防ぎつつ、循環構造自体を「比較可能な値（固定のマーカー）」として決定論的に扱うことが可能となる。

**2\. 比較複雑度ガード (Comparison Complexity Guard)**

* **定義:** 比較再帰深度 ($d\_{cmp}$) に対する物理的な上限。  
* **制限値:** **10** (固定)。  
* **超過時の動作:** $d\_{cmp}$ が制限値に達した場合、それ以上の構造探索を打ち切り、比較ストリームに **DepthLimit (Tag 255\)** を出力しなければならない。  
  * **DepthLimit:** `[Tag: 255, Length: 0]` の形式を持つ（参照: 8.2.1）。  
* **目的:** 悪意ある深いネストや、ソート時の $O(N \\log N)$ の定数倍率が悪化することによる CPU リソースの枯渇（DoS）を防ぐため。  
* **非エラー性:** この制限による打ち切りは `Error_Lock` ではなく、正規の比較結果（「非常に深い構造」を表す一種の値）として扱われる。これにより、深い構造を持つグラフ同士でも、比較処理が中断することなく決定論的な順序付けが可能となる。

**3\. 総計算量リミット (Total Complexity Budget)**

* **推奨事項:** 実装は、1回の正規化セッションにおける総ノード訪問数や総ステップ数に対して、システムリソースに合わせた上限（例: 1,000,000 ステップ）を設けることが **推奨される** （SHOULD）。  
* **動作:** この上限を超過した場合は、リソース保護のために直ちに **Error\_Lock** を発動しなければならない。これはアルゴリズム的な停止性（Tag 254/255）とは異なり、物理的なリソース枯渇を防ぐための安全装置である。

**注記:** Tag 254 (CycleMarker) および Tag 255 (DepthLimit) は、Phase 1 の比較用ストリーム（Comparison Stream）専用のタグであり、Phase 2 で生成される最終的な出力ストリーム（Output Stream）には **絶対に出現してはならない** （MUST NOT）。

#### **10.2 未定義動作の扱い (Treatment of Undefined Behavior)** {#10.2-未定義動作の扱い-(treatment-of-undefined-behavior)}

##### **10.2.1 実装未定義 (Implementation-Defined Behavior): メモリ戦略等** {#10.2.1-実装未定義-(implementation-defined-behavior):-メモリ戦略等}

以下の項目は、本規格において特定の動作や数値を規定せず、実装者の裁量に委ねられる（Implementation-Defined）。ただし、実装者がいかなる戦略を採用した場合であっても、生成される正規化バイト列の内容（Content）、IDの割り当て順序、およびエラー発生条件（Safety Guards）は、参照実装（Oracle）とビット単位で完全に一致しなければならない（MUST）。

すなわち、ここで許可されるのは「副作用のない内部最適化」のみである。

**1\. メモリ管理および割り当て戦略 (Memory Management Strategy)**

* **Arena のパラメータ:** Binary Arena / Slab Allocation（参照: 6.4.1）におけるスラブ（Slab）のブロックサイズ（例: 4KB, 16MB）、成長係数、およびメモリプールの再利用ロジック。  
* **GC との相互作用:** ホスト言語のガベージコレクタ（GC）をトリガーするタイミングや頻度。ただし、GC の実行が出力結果や ID 付与順序（WeakMap の反復順序など）に影響を与えることは、決定論の破壊となるため厳格に禁止される（参照: 4.1.3）。  
* **内部バッファの管理:** 出力ストリーム生成時における中間バッファのサイズや、フラッシュ（Flush）の粒度。ただし、最終的な出力においてはアトミックな書き込み（全か無か）が保証されなければならない。

**2\. 内部データ構造の物理表現 (Internal Data Structures)**

* **KeyOrderMap:** Phase 1 で決定された順序を保持するデータ構造の実装詳細（配列、連結リスト、平衡二分木など）。  
* **Visited Map:** 同一性判定に用いるハッシュマップの実装アルゴリズム（オープンアドレス法、チェイン法など）や、ハッシュ衝突時の解決策。  
* **スタックの実装:** トラバーサルにおける再帰制御を、ホスト言語のコールスタック（再帰関数）で行うか、ヒープ上に確保した明示的なスタック構造（ループ処理）で行うか。ただし、実装方法に関わらず、規定された深度制限（$d\_{trav} \\le 1000$）は正確に計測・遵守されなければならない。

**3\. キャッシュおよび最適化 (Caching and Optimization)**

* **メモ化 (Memoization):** Fingerprint 計算や部分的なシリアライズ結果をキャッシュするか否か、およびそのキャッシュの生存期間（Eviction Policy）。  
* **遅延評価 (Lazy Evaluation):** 観測可能な副作用（エラーの発火順序や出力バイト列）を変更しない範囲での、計算の遅延やパイプライン化。  
* **並行処理の粒度:** Worker 内でのタスク分割やスケジューリングの詳細（ただし、論理的な実行順序は直列でなければならない）。

##### **10.2.2 禁止動作 (Prohibited Behavior): 規格外の拡張等** {#10.2.2-禁止動作-(prohibited-behavior):-規格外の拡張等}

本規格（HACE v56.3）への適合性を主張する実装は、以下の動作を行ってはならない（MUST NOT）。これらの禁止動作を含む実装によって生成されたデータは、たとえ部分的に解析可能であっても、正当な HACE ストリームとは認められない。

**1\. 予約領域および未定義タグの使用 (Use of Reserved Tags)** 実装は、附属書 B.2 で定義された「予約（Reserved）」または「使用禁止（Forbidden）」のタグ ID を出力ストリームに使用してはならない。

* **将来の予約:** 将来の規格拡張のために確保されている領域（Tag 12-98, 100-253 等）を、ベンダー独自機能や実験的な型のために勝手に割り当ててはならない。  
* **制御タグの混入:** Phase 1 専用の制御タグ（CycleMarker: 254, DepthLimit: 255）を、最終的な出力ストリーム（Phase 2 Output）に混入させてはならない。

**2\. 挙動変更オプションの実装 (Behavior-Altering Options)** 実装は、本規格で定められた決定論的挙動（Canonical Sort, IEEE 754 正規化, UTF-8 厳密検証など）を緩和、変更、または無効化するような「実行時オプション」や「互換モード」を提供してはならない。

* **例（禁止）:**  
  * `fastMode: true` （ソートをスキップするモード）  
  * `allowInvalidUTF8: true` （不正シーケンスを置換するモード）  
  * `jsonCompatible: true` （-0 を \+0 に正規化するモード）  
* **理由:** HACE の出力は環境によらず一意でなければならない（Oracle Determinism）。設定によって出力が変わる実装は、この公理に違反する。

**3\. エラー処理の緩和 (Relaxation of Error Handling)** Safety Kernel が `Error_Lock` すべき状況（深さ制限超過、U53 オーバーフロー、不正なエンコーディング等）において、警告（Warning）のみで処理を続行したり、代替値（Fallback Value）を出力して隠蔽したりすることは、厳格に禁止される。

* **不完全なデータの排除:** エラー発生時は必ず `Error_Lock` （底状態 $\\bot$）へ遷移し、一切の出力を生成してはならない。

**4\. 規格外の拡張メカニズム (Non-Standard Extensions)** 本規格で定義された IANA レジストリ手順（参照: 13章）を経ずに、独自の型定義やメタデータをストリーム構造レベルで追加してはならない。アプリケーション固有のデータが必要な場合は、既存のコンテナ（Map, List）や文字列（String）のペイロード内部で表現し、HACE エンジンの正規化ロジックを変更することなく対応しなければならない。

##### **10.2.3 未定義動作 (Undefined Behavior) の不存在宣言** {#10.2.3-未定義動作-(undefined-behavior)-の不存在宣言}

本規格（HACE v56.3）は、あらゆる入力および内部状態に対して、エンジンの挙動が完全に定義されていることを宣言する。すなわち、本規格において「未定義動作（Undefined Behavior）」は存在しない。

実装は、ホスト言語やハードウェア仕様に起因する未定義動作を物理的に封じ込め、以下の規則に従って決定論的な結果（正規化されたバイト列、または `Error_Lock`）に収束させなければならない（MUST）。

**1\. 全域関数性の保証 (Guarantee of Total Function)** HACE エンジンは、入力空間 $\\mathbb{I}$ （あらゆるバイト列およびオブジェクトグラフ）から出力空間 $\\mathbb{O} \\cup {\\bot}$ （正規化バイト列または底）への全域関数（Total Function）として振る舞わなければならない。

* **定義:** どのような「不正な入力」、「リソース枯渇」、「演算例外」が発生した場合でも、システムは「何が起こるかわからない」状態に陥ってはならず、必ず **`Error_Lock` ($\\bot$)** という「定義された停止状態」へ遷移しなければならない（参照: 8.1.1）。

**2\. ホスト言語の未定義動作の排除** 実装言語（特に C/C++）の仕様上で「未定義」とされる操作は、HACE の論理層において以下のように厳密に定義（または回避）されなければならない。

* **符号付き整数オーバーフロー:**  
  * **ホスト言語:** 未定義動作（C/C++）。  
  * **HACE仕様:** 9.2.3.1 に従い、**符号なし64ビット整数におけるラップアラウンド（$mod\\ 2^{64}$）** として定義する。または、U53 領域外の演算として `Error_Lock` させる。  
* **ビットシフトの範囲外操作:**  
  * **ホスト言語:** 未定義動作（型幅以上のシフト）。  
  * **HACE仕様:** 9.2.3.3 に従い、シフト量を **`& 63` でマスクした結果** として定義する。  
* **不正なメモリアクセス:**  
  * **ホスト言語:** セグメンテーション違反、未定義の読み取り。  
  * **HACE仕様:** 参照（RefID）の正当性は 9.3.2 および附属書 A (NAP-13) に従い検証され、不正な参照は **`Error_Lock`（ダングリングポインタ検知）** として処理される。

**3\. プラットフォーム依存の不定性の排除**

* **エンディアン:** 全ての数値出力は **ビッグエンディアン** に固定される（参照: 6.2.1）。ホストCPUのエンディアンに依存してはならない。  
* **アライメント:** パディングバイト（詰め物）の内容が不定となることを防ぐため、全てのバイナリ出力は **Packed**（詰め物なし）または **明示的なゼロパディング** でなければならない。

**4\. 結論** したがって、HACE エンジンがいかなるクラッシュ、ハングアップ、あるいはランダムなデータ出力を起こした場合、それは「環境のせい」ではなく、明確な **「規格不適合（実装バグ）」** とみなされる。

---

### **11\. 国際化に関する考慮事項 (Internationalization Considerations)** {#11.-国際化に関する考慮事項-(internationalization-considerations)}

#### **11.1 Unicode バージョン依存性** {#11.1-unicode-バージョン依存性}

HACE エンジンは、ホストランタイム（JavaScript エンジン、OS ライブラリ等）が準拠する Unicode Standard のバージョン（例: 14.0 vs 15.1）の差異によって、出力される正規化バイト列が変動することを防ぐため、以下の戦略を採用しなければならない（MUST）。

**1\. ホスト環境による正規化の禁止 (Prohibition of Host Normalization)** 実装は、正規化プロセスの一部として、ホスト環境が提供する Unicode 正規化 API（例: `String.prototype.normalize()`, `unorm`, OS の正規化サービス）を使用してはならない。

* **理由:** Unicode 規格のバージョンアップに伴い、文字の正規化ルール（Decomposition mapping）や結合クラスが変更される可能性がある。ホスト環境のバージョンに依存して正規化を行うと、同一の入力文字列であっても、実行環境によって異なるバイト列が出力される（決定論の破壊）リスクがあるためである。

**2\. Raw UTF-8 バイト列としての扱い (Treatment as Raw UTF-8)** HACE エンジンは、入力された文字列を「意味を持つ文字の並び」としてではなく、**「検証済みの UTF-8 バイト列（Raw Octet Sequence）」** として透過的に扱わなければならない。

* **意味論の排除:** 文字の意味的な等価性（例: Å と A+˚ の同一視）や、結合文字の並び替え（Canonical Ordering）は、HACE エンジンの責務ではない。これらはアプリケーション層（L4）で解決されるべき問題であり、HACE は入力されたバイト列の物理的な同一性のみを保証する（参照: 附属書A NAP-26）。

**3\. RFC 3629 準拠の構文的検証のみの実施** Unicode バージョンに依存しない唯一の処理として、**RFC 3629** に基づく UTF-8 エンコーディングの構文的妥当性（Well-formedness）の検証のみを行わなければならない。

* **検証対象:** 不正なバイトシーケンス、冗長なエンコーディング（Overlong Encoding）、および孤立サロゲート（Lone Surrogate）の検出。  
* **バージョン独立性:** UTF-8 のビットパターン生成規則自体は Unicode バージョンによらず不変であるため、この検証は将来にわたって決定論的である。

#### **11.2 正規化とロケール** {#11.2-正規化とロケール}

HACE エンジンは、実行環境の「ロケール（Locale）」設定、言語設定、および地域固有の慣習（Collation rules）に対して、**完全な独立性（Locale Independence）** を保たなければならない。いかなる言語環境においても、同一の入力バイト列からは、ビット単位で同一の正規化結果が得られなければならない。

**1\. 言語依存の正規化および変換の禁止** 実装は、正規化プロセスの一部として、文字列の内容を意味的に変更する以下の操作を行ってはならない（MUST NOT）。

* **Unicode 正規化 (Normalization):** `NFC`, `NFD`, `NFKC`, `NFKD` などの正規化形式への変換を行ってはならない（参照: 附属書A NAP-15）。これは、Unicode 規格のバージョンアップに伴う変換ルールの変更が、ハッシュ値の安定性を損なうためである。  
* **ケースフォールディング (Case Folding):** `toLowerCase()`, `toUpperCase()`, `casefold()` 等を用いた大文字・小文字の変換を行ってはならない。特定の言語（例: トルコ語の `I` と `ı`）において、ケース変換は可逆でなく、かつロケールに依存するためである。  
* **意味的な加工:** トリミング（空白除去）、全角・半角変換、あるいは `IgnorePunctuation`（句読点無視）のような処理を行ってはならない（参照: 附属書A NAP-26）。

**2\. ロケール依存照合 (Collation) の禁止** 文字列およびコンテナキーのソート順序を決定する際、人間にとっての自然言語順序（Natural Language Sort）を使用してはならない（MUST NOT）。

* **禁止される API:** `String.prototype.localeCompare()`, `Intl.Collator` (JavaScript), `std::locale` (C++), `strcoll` (C) 等の使用は厳格に禁止される（参照: 附属書A NAP-06）。  
* **理由:** 例えば、スウェーデン語では `z < ö` であるが、ドイツ語では `ö < z` となる場合がある。このような環境依存性は、クロスプラットフォームでの決定論的再現性（Oracle Determinism）と矛盾する。

**3\. バイナリ比較によるロケール独立性の保証** HACE における全ての順序決定は、**「符号なしバイト列としての辞書順比較（Unsigned Lexicographical Comparison）」** によってのみ行われなければならない（参照: 9.4.2）。

* **定義:** 文字列 `A` と `B` の大小関係は、それらを構成する UTF-8 バイト列に対する `memcmp` 相当の比較結果によって一意に定まる。  
* **効果:** これにより、実行環境の言語設定に関わらず、常に物理的に一意のソート結果（Canonical Sort Order）が保証される。

**4\. アプリケーション層への責務委譲** もしアプリケーション要件として「大文字・小文字を区別しない（Case-insensitive）」や「表記揺れの吸収」が必要な場合、それらの正規化処理は HACE エンジンに入力される **前** の段階（L4 アプリケーション層）で完了していなければならない。HACE エンジンは、入力されたバイト列の「物理的な同一性」のみを保証するものであり、意味的な解釈を行ってはならない。

---

### **12\. セキュリティに関する考慮事項 (Security Considerations)** {#12.-セキュリティに関する考慮事項-(security-considerations)}

#### **12.1 正規化攻撃 (Canonicalization Attacks)** {#12.1-正規化攻撃-(canonicalization-attacks)}

正規化攻撃とは、攻撃者が意図的に「正規化後のハッシュ値（Structural Fingerprint）」が衝突するような特殊なデータ構造を大量に入力し、HACE エンジン内部のソート処理や同一性判定ロジックを最悪計算量（Worst-case Complexity）に陥れ、CPU リソースを枯渇させる（DoS: Denial of Service）試みを指す。

HACE v56.3 は、これらの攻撃に対して以下の多層的な防御機構を備えなければならない。

**1\. 強固な構造ハッシュ (Robust Structural Fingerprinting)** Phase 1 のソート順序決定に使用される Fingerprint（9.2.2）は、単なる XOR 合成ではなく、**順序依存の回転（Rotate）と非線形な混合（Mix）** を組み合わせた Wyhash ベースのアルゴリズムを採用している。

* **衝突困難性:** 文字列の長さ情報の上位ビットシフト混合（9.2.4.1）や、BigInt の符号ビット分離（9.2.4.2）により、単純なパターン（例: "A" と "B" の入れ替え、0 と \-0 の混同）によるハッシュ衝突を数学的に困難にしている。  
* **浅い計算 (Shallow Computation):** コンテナのハッシュ計算は、直下の子要素の情報のみを使用し、深い再帰を行わない（Source 247）。これにより、攻撃者が深くネストされた構造を用いてハッシュ計算コストを指数関数的に増大させることを防ぐ。

**2\. 決定論的タイブレークによる最悪ケースの回避 (Deterministic Tie-break)** 万が一、攻撃者が Fingerprint の衝突（Collision）を引き起こすことに成功したとしても、HACE の比較ロジックは 9.4 節で規定された「決定論的タイブレーク」により、必ず一意の順序を決定する。

* **フォールバック:** Fingerprint が一致した場合でも、`Tag` $\\to$ `Length` $\\to$ `Raw Bytes` の順で比較が行われる。  
* **Raw Bytes 比較:** 最終的にはメモリ上のバイト列比較（memcmp）により順序が定まるため、ソートアルゴリズムが「順序不定」による不安定な挙動や無限ループに陥ることはない。これにより、ソート処理の計算量は常に予測可能な範囲に収まる。

**3\. アルゴリズムのバージョニング (Algorithm Versioning)** 将来的に現在の Fingerprint アルゴリズム（v1）に対する効率的な衝突生成手法が発見された場合に備え、ヘッダ（8.1.1）および Fingerprint の上位ビット（9.2.2）に **バージョン識別子（Algorithm ID）** を含めている。

* **ダウングレード防止:** 実装は、自身がサポートする最新のアルゴリズムバージョンを強制し、攻撃者が意図的に古い（脆弱な）アルゴリズムを指定して処理させる「ダウングレード攻撃」を拒否しなければならない（MUST）。

#### **12.2 リソース枯渇攻撃 (Resource Exhaustion Attacks)** {#12.2-リソース枯渇攻撃-(resource-exhaustion-attacks)}

リソース枯渇攻撃とは、正規化エンジンに対して極端に深いネスト構造、循環参照、あるいは指数関数的に要素が増加するデータ構造を入力し、システムのコールスタック、ヒープメモリ、または CPU サイクルを消費し尽くさせる攻撃手法である。

HACE エンジンは、信頼できない入力（Untrusted Input）を処理する可能性があるため、ホスト言語の制限に依存するのではなく、Safety Kernel (L0) レイヤーにおいて以下の物理的なリソース境界を強制しなければならない。

**1\. 二重深度ガードによるスタック保護 (Dual Depth Guards)** 攻撃者が JSON 等のネスト構造を利用してスタックオーバーフロー（Stack Overflow）を引き起こすことを防ぐため、実装はシステムコールスタックに依存せず、以下の明示的なカウンタを用いて深度を制限しなければならない（参照: 10.1.1）。

* **トラバーサル深度 ($d\_{trav}$):** 出力フェーズ（Phase 2）における再帰深さが上限（**1000**）に達した場合、Safety Kernel はこれを「処理不能な複雑度」とみなし、直ちに **Error\_Lock** を発動して処理を停止しなければならない。これにより、プロセス自体のクラッシュ（Segfault/Panic）を未然に防ぐ。  
* **比較深度 ($d\_{cmp}$):** 構造解析フェーズ（Phase 1）におけるソート用比較の再帰深さが上限（**10**）に達した場合、実装はエラーとするのではなく **LimitTag (255)** を注入してその枝の探索を打ち切らなければならない。これにより、ソート処理が無限再帰に陥ることを防ぎつつ、決定論的な順序付けを完遂させる（Algorithmic Termination）。

**2\. 有限エミッションとメモリ保護 (Finite Emission & Memory Protection)** 攻撃者が循環参照やオブジェクト共有（Diamond structure）を悪用して、出力サイズを爆発させる攻撃（Billion Laughs Attack の変種）に対し、以下の防御を行う。

* **参照への強制置換:** Phase 2 において既出のコンテナ（Visited Map に登録済み）に再遭遇した場合、実装は直ちにその内容の展開を停止し、固定長の **REF ノード (Tag 99\)** を出力しなければならない。これにより、論理的に無限の深さを持つグラフであっても、出力されるバイト列の長さはノード数に比例する有限サイズに収束することが数学的に保証される（参照: 5.3.1）。  
* **Arena Allocation:** 一時オブジェクトの大量生成によるガベージコレクション（GC）の負荷増大（GC Storm DoS）を防ぐため、実装は固定サイズのメモリアリーナ（Slab Allocation）を使用し、メモリ消費量の上限を物理的に制御することが強く推奨される（参照: 6.4.1）。

**3\. 総計算量バジェット (Complexity Budget)** 特定の入力（例えば、ハッシュ衝突を誘発するような多数の要素を持つ Map）に対して、ソート処理の計算量が $O(N^2)$ に劣化するリスクがある。 これに対し、実装は 1回の正規化セッションにおける総ステップ数（訪問ノード数や比較回数）に上限（例: 1,000,000 ステップ）を設け、これを超過した場合は **Error\_Lock** によって処理を強制終了させる安全装置を備えるべきである（SHOULD）。

---

### **13\. IANA に関する考慮事項 (IANA Considerations)** {#13.-iana-に関する考慮事項-(iana-considerations)}

#### **13.1 タグ空間レジストリ (Tag Space Registry)** {#13.1-タグ空間レジストリ-(tag-space-registry)}

##### **13.1.1 レジストリテンプレート (Registry Template)** {#13.1.1-レジストリテンプレート-(registry-template)}

将来の拡張のために HACE Tag ID 空間（特に 0x20-0x7F の Extended Types 領域）への新規割り当てを申請する場合、申請者は以下のテンプレートを使用し、必要な情報を網羅しなければならない（MUST）。

**1\. Tag ID (タグID)**

* **Requested Value:** 申請するタグの数値（16進数）。  
* **Range:** 割り当て可能な範囲は `0x20` から `0x7F` までとする（Core Types `0x00-0x1F` および Vendor Specific `0x80-0xFE` への登録は不可）。

**2\. Type Name (型名称)**

* **Name:** 識別するための短く一意な名称（ASCII英数字のみ）。  
* **Description:** 型の用途および意味論の簡潔な説明。

**3\. Payload Specification (ペイロード仕様)**

* **Length:** 固定長（バイト数）か、可変長か。可変長の場合は長さの決定ロジック。  
* **Binary Layout:** ペイロード内部のバイト構造（Big-Endian等のエンディアン規定を含む）。  
* **Canonicalization Rules:** 入力値を一意のバイト列に正規化するための手順（例：正規化形式、禁止される値、パディング規則）。

**4\. Determinism Statement (決定論的保証)**

* **Assertion:** 当該型が「同一の論理的値に対して常に同一のバイト列を生成すること」の宣言。  
* **Platform Independence:** 特定のCPUアーキテクチャ、OS、プログラミング言語の実装に依存しないことの証明。

**5\. Comparison Logic (比較ロジック)**

* **Sort Order:** Phase 1 におけるソート順序決定のために、当該型がどのように `memcmp` されるかの説明。または、Comparison Stream 生成時のペイロード変換ルール。

**6\. Reference (参照規格)**

* **Specification:** 当該型の詳細な仕様が記述された恒久的なドキュメント（RFC、ISO規格、または安定したURL）への参照。

---

**テンプレート記入例:**

**Tag ID:** 0x20 **Type Name:** UUID **Payload Specification:** 固定長16バイト。UUIDのバイナリ表現（Big-Endian / Network Byte Order）。文字列表現（ハイフン付き）からの変換時は、必ず正規化してバイナリとして格納する。 **Determinism Statement:** 128ビットの整数値として一意性が保証される。生成時刻やMACアドレスに依存するVersion 1 UUIDの場合でも、バイナリ値が同一であれば同一とみなす。 **Comparison Logic:** 16バイトの unsigned byte 列として辞書順比較を行う。 **Reference:** RFC 4122

---

##### **13.1.2 初期割り当てテーブル (Initial Values Table)** {#13.1.2-初期割り当てテーブル-(initial-values-table)}

IANA は、以下の初期値を HACE Tag Registry に登録する。これらの値は「Core Types」として固定され、将来にわたり変更されることはない（Immutable）。

**レジストリ名:** HACE Type Tags **登録手順:** 13.1.4 参照 **参照:** \[HACE v56.3 Specification\]

| Value (Hex) | Value (Dec) | Name | Description / Reference |
| ----- | ----- | ----- | ----- |
| **0x00** | 0 | **Reserved** | \*\*使用禁止 (Forbidden)\*\*C++ 等のデフォルト初期化値との混同を防ぐため欠番とする。 |
| **0x01** | 1 | **Null** | 値 `null` (None, nullptr) を表す。ペイロードなし (Length=0)。参照: 6.2.1, B.3.1 |
| **0x02** | 2 | **True** | ブール値 `true` を表す。ペイロードなし (Length=0)。参照: 6.2.1 |
| **0x03** | 3 | **False** | ブール値 `false` を表す。ペイロードなし (Length=0)。参照: 6.2.1 |
| **0x04** | 4 | **Number** | IEEE 754 Binary64 浮動小数点数。NaN正規化および負のゼロ(-0)の保存が必須。参照: 6.1 |
| **0x05** | 5 | **String** | UTF-8 文字列。BOM禁止、不正シーケンス禁止。参照: 6.3 |
| **0x06** | 6 | **BigInt** | 任意精度整数。バイナリエンコーディング（Sign \+ Magnitude）。参照: 7.2.4.2 |
| **0x07** | 7 | **Date** | 64ビット符号付き整数 (Epoch Milliseconds)。参照: 6.2.3 |
| **0x08** | 8 | **Array** | 順序付きリスト。疎配列の欠損は Null (0x01) として埋める。参照: B.3.3 |
| **0x09** | 9 | **Object** | 文字列キーを持つキーバリュー構造。キーのUTF-8バイト順ソート必須。参照: 7.2.1 |
| **0x0A** | 10 | **Map** | 任意の型をキーとするキーバリュー構造。キーの比較バイナリ順ソート必須。参照: 7.2.1 |
| **0x0B** | 11 | **Set** | 一意な値の集合。比較バイナリ順ソート必須。参照: 7.2.1 |
| **0x0C \- 0x1F** | 12-31 | *Unassigned* | 将来の Core Types 拡張のために予約 (Standards Action)。 |
| **0x20 \- 0x62** | 32-98 | *Unassigned* | Extended Types (UUID, Geo等) のために予約 (Specification Required)。 |
| **0x63** | 99 | **Ref** | 参照ノード。定義済みコンテナへの参照ID (uint64) を保持する。参照: 7.3.2 |
| **0x64 \- 0xFE** | 100-254 | *Unassigned* | Vendor / Application Specific 用途 (Private Use)。互換性は保証されない。 |
| **0xFF** | 255 | **EOS** | **End of Stream**ストリームの正常終了を示すマーカー。ペイロードなし。参照: B.3 |

**注記:**

* **Comparison Tags:** Phase 1（構造解析）でのみ使用される内部タグ `0xFE (CycleMarker)` および `0xFF (DepthLimit)`（※文脈によりEOSと共有または別空間）は、出力ストリーム（本レジストリの対象）には出現しないため、ここには登録されない。  
* **Undefined:** 旧仕様の `Undefined (0x00)` は廃止された。`Null (0x01)` へのマッピングまたはエントリ削除にて対応すること（参照: B.3.2）。

##### **13.1.3 専門家レビュー規則 (Expert Review Rule)** {#13.1.3-専門家レビュー規則-(expert-review-rule)}

IANA は、HACE Tag Registry への新規割り当てリクエスト（特に Extended Types 領域 `0x20-0x62`）を受け取った際、**指名された専門家（Designated Expert）** によるレビューを必須とする。専門家は、申請された型定義が以下の基準を満たしているかを厳格に審査し、承認または拒否を勧告する。

**1\. 決定論の証明 (Proof of Determinism)** 申請者は、提案する型が「同一の論理的値に対して、いかなる環境（言語、CPU、OS、時刻）においても常にビット単位で同一の正規化バイト列を生成すること」を証明しなければならない。

* **拒否基準:** 内部ハッシュマップの順序、メモリアドレス、システムクロック、または浮動小数点の非正規化表現に依存する型定義は、即座に却下される。

**2\. バイナリ形式の明確性 (Binary Clarity)** 提案されるペイロードのバイナリ構造は、曖昧さなく定義されていなければならない。

* **要件:** エンディアン（Big-Endian 必須）、パディング規則、および正規化アルゴリズム（Canonicalization）が明記されていること。可変長整数（Varint）の使用や、パーサーの実装依存を引き起こす複雑な構造は推奨されない。

**3\. 比較ロジックの提供 (Comparison Logic)** Phase 1（構造解析）におけるソート順序を決定するため、当該型の比較ロジック（`memcmp` 相当）が明確に定義されていなければならない。

* **要件:** 比較はバイト列としての辞書順、または明確に定義された数値的順序に基づくものでなければならない。

**4\. 既存の Core Types との整合性** 提案される型が、既存の Core Types（Tag 0-11, 99）と機能的に重複していないか、または HACE の設計哲学（Atomic Halting, Finite Emission）に違反していないかが審査される。

* **Standards Action:** Core Types 領域（`0x0C-0x1F`）への追加は、本規格自体の改訂（Standards Action）を必要とし、単なる専門家レビューでは承認されない。

**5\. 拒否権の発動** 専門家は、提案された型が HACE エコシステムの互換性やセキュリティを脅かすと判断した場合（例：無限ループのリスクがある構造、巨大なメモリ消費を強制する構造）、理由を付してリクエストを拒否する権限を持つ。

##### **13.1.4 更新手順 (Update Procedure)** {#13.1.4-更新手順-(update-procedure)}

HACE Type Tags レジストリへの変更および追加は、対象となるタグIDの範囲（Range）に応じて、以下の IANA 登録ポリシー（RFC 8126）に従って処理されなければならない（MUST）。

**1\. Core Types (0x00 \- 0x1F)**

* **登録ポリシー:** **Standards Action (標準化アクション)**  
* **手順:** この領域への変更または新規割り当ては、本規格書（ISO-HACE-56.3）自体の改訂、または IETF/ISO 等の標準化団体による新たな正式規格の発行を必要とする。  
* **制約:** 単なる専門家レビューやリクエストのみでは変更できない。これは、HACE エコシステムの基盤となる型（Null, Number, String, Container等）の安定性を永続的に保証するためである。

**2\. Extended Types (0x20 \- 0x62)**

* **登録ポリシー:** **Specification Required (仕様書必須) AND Expert Review (専門家レビュー)**  
* **手順:**  
  1. **申請:** 申請者は、13.1.1 で規定された「レジストリテンプレート」に必要事項を記入し、IANA（または指定されたレジストリ管理者）へ提出する。この際、提案する型のバイナリ構造と決定論的挙動を定義した、恒久的かつ一般に公開された仕様書（RFC, ISO, 公的ドキュメント等）を参照しなければならない。  
  2. **審査:** 指名された専門家（Designated Expert）は、13.1.3 の「専門家レビュー規則」に基づき、提案内容が HACE の決定論的公理（Oracle Determinism）に違反していないかを審査する。  
  3. **登録:** 専門家が承認した場合、IANA は当該タグID、名称、および仕様書への参照をレジストリに追記する。  
* **却下:** 専門家は、決定論の証明が不十分な場合、または既存の Core Types で表現可能な場合、申請を却下する権限を持つ。

**3\. Vendor / Application Specific (0x64 \- 0xFE)**

* **登録ポリシー:** **Private Use (私用)**  
* **手順:** 登録不要。  
* **制約:** この領域は、アプリケーション固有の拡張や実験的な実装のために開放されている。IANA はこの範囲の割り当てを追跡しない。実装者は、この領域のタグが異なるアプリケーション間で衝突する可能性があることを理解した上で使用しなければならない。公的な交換フォーマットとしての使用は推奨されない（SHOULD NOT）。

**4\. 予約済みおよび固定値**

* **0x63 (Ref):** Core Types に準ずる扱いとし、変更不可（Immutable）。  
* **0xFF (EOS):** ストリーム構造の終端定義であり、変更不可（Immutable）。

---

### **14\. メンテナンスとガバナンス (Maintenance and Governance)** {#14.-メンテナンスとガバナンス-(maintenance-and-governance)}

#### **14.1 変更管理ポリシー (Change Control Policy)** {#14.1-変更管理ポリシー-(change-control-policy)}

本規格（HACE v56.3）は、発行時点をもって **「不変のモノリス（Frozen Monolith）」** と定義される。したがって、本規格に対するいかなる変更も、本節で規定される厳格な変更管理ポリシーに従わなければならない（MUST）。

本ポリシーの主目的は、異なる時期、異なる実装によって生成された正規化データ間の **「ビットレベルの互換性と完全一致（Bit-Level Determinism）」** を永続的に保証することにある。

**1\. 変更の分類と許容範囲 (Classification of Changes)**

本規格への変更提案は、以下の3つのクラスに分類され、それぞれ異なる扱いを受ける。

* **Class 1: 破壊的変更 (Breaking Changes)**

  * **定義:** 同一の入力グラフに対して、生成される正規化バイト列（Canonical Byte Stream）の内容、長さ、またはハッシュ値が変化するあらゆる変更。  
  * **例:**  
    * Phase 1 におけるソートアルゴリズム（Fingerprint 計算式、タイブレーク規則）の変更。  
    * 浮動小数点数（NaN, \-0）のビット表現規則の変更。  
    * Core Types（Tag 0x00-0x1F）の定義変更または新規追加。  
    * TLV 構造やヘッダフォーマットの変更。  
  * **ポリシー:** **HACE v56.x 系列においては、いかなる理由があっても厳格に禁止される（MUST NOT）。**  
  * **対応:** これらが必要な場合は、メジャーバージョンアップ（v57.0）を行い、ストリームヘッダの `Version Major` をインクリメントしなければならない。  
* **Class 2: 拡張的変更 (Additive Changes)**

  * **定義:** 既存の正規化結果に影響を与えず、かつ既存のデコーダがエラーとして拒絶する範囲内での定義追加。  
  * **例:**  
    * Extended Types（Tag 0x20-0x7F）領域への新規型定義の追加（IANA登録手順を経たものに限る）。  
  * **ポリシー:** **制限付きで許可される（MAY）。** ただし、新規追加されたタグを使用するストリームは、古いバージョンのデコーダでは読み取れない（前方互換性がない）ことを許容しなければならない。マイナーバージョン（v56.x）のインクリメントを推奨する。  
* **Class 3: 編集的変更 (Editorial Changes)**

  * **定義:** 技術的な挙動や出力結果に一切の影響を与えない、文書上の修正。  
  * **例:**  
    * 誤字脱字の修正。  
    * 説明の明確化、図解の追加。  
    * 参考実装（Non-normative）のバグ修正。  
  * **ポリシー:** **許可される（SHALL）。** これらは エラータ（Errata） として管理され、規格のパッチバージョン（v56.3.x）として反映される。

**2\. 規格の優先順位 (Normative Hierarchy)**

仕様の解釈に疑義が生じた場合、または実装間で挙動の不一致が発生した場合、以下の優先順位に従って正当性を判断する。

1. **本規格書 (v56.3 Normative Text):** 最上位の法規範。  
2. **公理系 (Axioms):** 数学的な定義（全順序性、有限停止性など）。  
3. **Oracle Validator:** 静的検証器による判定。  
4. **参照実装 (Executable Spec):** Python 等による動作モデル。

もし参照実装の挙動が本規格書の記述と矛盾する場合、**規格書の記述が優先され、参照実装はバグとして修正されなければならない**。

**3\. 将来の互換性 (Forward Compatibility)**

HACE v56.3 は、将来のバージョン（v57.0以降）が策定されたとしても、その仕様の下位互換セットとして機能し続けることを保証する。

* **CCS Versioning:** ヘッダに含まれる `CCS Ver` (Comparison Algorithm ID) により、将来のソートアルゴリズム変更時も、v56.3 準拠のパーサーは「非対応バージョン」として安全に拒絶（Error\_Lock）できる設計とする（参照: 9.2.1）。

#### **14.2 凍結宣言 (Declaration of Freezing)** {#14.2-凍結宣言-(declaration-of-freezing)}

本規格書（ISO-HACE-56.3）の発行をもって、HACE エンジンの仕様策定プロセスは **完全かつ不可逆的に終了** したことをここに宣言する。本規格はこれより **「不変のモノリス（Frozen Monolith）」** として扱われ、以下の原則に従って管理される。

**1\. 規範的凍結 (Normative Freeze)** 本規格で定義された以下の要素は、将来にわたっていかなる理由があっても変更されてはならない（MUST NOT）。これらは恒久的な固定値として扱われる。

* **公理系:** 決定論、有限エミッション、実装独立性に関する数学的定義。  
* **バイナリ形式:** ストリームヘッダのマジックナンバー、TLV構造、タグIDの割り当て。  
* **アルゴリズム:** Fingerprint 計算式（v1）、カノニカルソートの手順、IEEE 754 正規化ロジック。  
* **禁止事項:** 附属書 A (NAP) に記載された全26項目の禁止パターン。

**2\. 10年間の安定性保証 (10-Year Stability Guarantee)** 本宣言により、HACE v56.3 に準拠して作成された正規化データおよびハッシュ値は、少なくとも今後10年間、または計算機アーキテクチャが根本的に変化しない限り、有効かつ検証可能であり続けることが保証される。

* **実装者の権利:** 実装者は、本規格書（v56.3）のみを参照してデコーダや検証器を作成することができ、将来のマイナーアップデートによって既存のデータが読み取れなくなる（後方互換性が失われる）ことを恐れる必要はない。

**3\. 将来の変更 (Future Modifications)** 万が一、暗号学的脆弱性の発見や、現在の計算モデル（IEEE 754等）の廃止といった不可抗力により、本規格の「挙動（Behavior）」を変更する必要が生じた場合、それは本規格の改訂ではなく、 **新しい規格（HACE v57.0 以降）** の策定として扱われなければならない。

* **定義:** 「同一の入力に対して異なるビット列が出力される」ような変更は、すべてメジャーバージョンアップを必要とする破壊的変更とみなされる。既存の v56.x 系列の仕様書を書き換えることは許されない。

**結論:** HACE v56.3 は、これ以上「改善」されることはない。それは「完成」したのである。

#### **14.3 エラータ処理 (Errata Policy)** {#14.3-エラータ処理-(errata-policy)}

本規格（HACE v56.3）は発行と同時に凍結されるが、文書としての品質を維持するために、技術的な挙動を変更しない範囲での誤記訂正（Errata）のみが認められる。エラータの処理は以下のポリシーに従って厳格に管理されなければならない（MUST）。

**1\. エラータの定義 (Definition of Errata)** エラータとして認められる修正は、以下の「編集的誤り（Editorial Errors）」に限られる。

* **誤字・脱字:** スペルミス、文法的な誤り、明白なタイプミス。  
* **フォーマット:** 図表のレイアウト崩れ、フォントの誤り、ページ番号の不整合。  
* **参照:** リンク切れ、引用文献の書誌情報の訂正。  
* **明白な矛盾:** 文脈から明らかに意図が読み取れるが、記述が誤っている箇所（例: "0x00" と書くべきところを "0x000" と書いている等）。ただし、技術的な解釈に複数の可能性が生じる場合は、エラータではなく仕様の欠陥（Defect）として扱われる。

**2\. 禁止事項 (Prohibitions)** 以下の事項は、いかに微細であってもエラータとして処理してはならない（MUST NOT）。これらは「仕様変更」にあたり、新規規格（v57.0）の策定を必要とする。

* **アルゴリズムの変更:** Fingerprint 計算式、ソート順序、正規化ロジックの修正。  
* **バイナリ値の変更:** Tag ID、ヘッダのマジックナンバー、定数値の変更。  
* **制約の緩和・強化:** 禁止事項（NAP）の追加または削除、制限値（Depth Limit等）の変更。

**3\. 公開とバージョン管理 (Publication and Versioning)**

* **正誤表 (Errata List):** 発見されたエラータは、公式の「正誤表」として即座に公開される。実装者は定期的にこれを参照することが推奨される。  
* **パッチバージョン:** 累積したエラータが文書の可読性を著しく損なう場合、または重要な誤記（例: 定数のタイプミス）が修正された場合、規格書の **パッチバージョン（v56.3.x）** をインクリメントし、訂正版を発行することができる。  
  * **互換性保証:** パッチバージョンが異なっていても、技術的な仕様（Normative Content）は同一であり、準拠する実装の出力結果（Canonical Byte Stream）はビット単位で完全に一致しなければならない。

**4\. 優先順位 (Precedence)** 万が一、規格書本文と正誤表の間に矛盾が生じた場合、または正誤表の適用によって技術的な挙動に変化が生じるという疑義が発生した場合、**「発行時点のオリジナル規格書（v56.3.0）」の記述が、技術的な正（Original Truth）として優先される**。エラータはあくまで補足的な修正であり、規範（Normative）を覆す力を持たない。

---

### **15\. 検証及び適合性 (Verification & Conformance)** {#15.-検証及び適合性-(verification-&-conformance)}

#### **15.1 適合性レベル (Conformance Levels)** {#15.1-適合性レベル-(conformance-levels)}

HACE 規格への適合性は、静的なテストベクタへの準拠だけでなく、動的なランダムグラフに対する挙動の一貫性によって評価される。実装は、以下のいずれかの適合性レベルを満たさなければならない。本規格においては、「部分的適合（Partial Conformance）」は認められず、Level I の要件を満たさない実装はすべて「不適合（Non-Conformant）」とみなされる。

##### **15.1.1 Level I: 厳密適合 (Strict Conformance)** {#15.1.1-level-i:-厳密適合-(strict-conformance)}

Level I は、HACE エンジンとして最低限満たすべき要件であり、静的な入出力の一貫性が保証されている状態を指す。 Level I 適合を主張する実装は、以下の条件をすべて満たさなければならない（SHALL）。

**1\. CCS (Canonical Compliance Suite) の完全通過:** 規格附属のテストスイート（最低150ケース以上の境界値テストベクタ）に対し、全ての入力について期待されるバイト列（Canonical Output）と **ビット単位で完全に一致** する出力を生成すること。これには NaN の正規化、-0 の区別、不正な UTF-8 シーケンスに対する `Error_Lock` の発動が含まれる。

**2\. 文法の遵守:** 出力されるバイナリデータが、附属書 B で規定される Canonical Node Grammar (TLV構造) に完全に準拠していること。

**3\. 原子的停止の保証:** エラー発生時（深さ制限超過、U53オーバーフロー等）に、部分的出力を行わず、確実に `null` または `⊥` (Bottom) を返すこと。

##### **15.1.2 Level II: 神託適合 (Oracle Conformance)** {#15.1.2-level-ii:-神託適合-(oracle-conformance)}

Level II は、異種環境間での完全な移植性と堅牢性が実証された状態を指す。産業用途および高信頼性が求められる環境（Visualizer のバックエンド等）においては、Level II 適合が強く推奨される（RECOMMENDED）。 Level I の要件に加え、以下の条件を満たさなければならない。

**1\. HDF (Differential Fuzzer) による検証:** 規格で定められた参照実装（Executable Spec / Python版等）に対し、ランダム生成されたグラフ（循環、共有参照、Unicodeエッジケースを含む）を入力とした際、少なくとも 1,000,000 回の試行において出力バイト列が完全に一致すること。

**2\. 環境独立性の証明:** メモリアドレス配置のランダム化（ASLR）、ガベージコレクション（GC）の強制実行、またはプロパティ挿入順序のシャッフル（Chaos Mode）を行った状態でも、出力ハッシュが不変であることを実証すること。

##### **15.1.3 不適合 (Non-Conformance)** {#15.1.3-不適合-(non-conformance)}

以下のいずれかに該当する実装は、たとえ一部の出力が HACE 形式に類似していたとしても、本規格には適合しない。

* JSON.stringify などの言語標準シリアライザに依存し、キー順序の正規化を行っていないもの。  
* Math.random などの非決定的な要素を排除できていないもの。  
* 循環参照を検知できず、スタックオーバーフローや無限ループを引き起こすもの。  
* エラー発生時に、例外をスローするだけで内部状態をクリーンアップ（Session Reset）しないもの。

#### **15.2 HDF (HACE Differential Fuzzer) 検証** {#15.2-hdf-(hace-differential-fuzzer)-検証}

##### **15.2.1 ランダムグラフ生成仕様 (Cycle, Diamond, Float Edge)** {#15.2.1-ランダムグラフ生成仕様-(cycle,-diamond,-float-edge)}

適合性検証に使用される入力グラフ生成器（Generator）は、単なる一様乱数データではなく、HACE の公理（Axioms）と境界条件を標的とした **Spec-Aware（仕様認識型）** な構造を生成しなければならない。 生成器は、シード固定された決定論的 PRNG（PCG64 または Xoshiro256\*\* 推奨）により駆動され、以下の 3つのカテゴリに属するエッジケースを所定の確率で混入させなければならない（SHALL）。

**1\. トポロジー攻撃パターン (Topological Stress)** グラフの接続構造を利用して、トラバーサルロジックの不備（無限ループ、ID割り当てミス、スタックオーバーフロー）を誘発する。

* **Diamond Graph (菱形共有参照):** 同一のオブジェクトインスタンスに対して、異なるパスから複数の参照を持つ構造（例: `root.a = shared; root.b = shared`）。  
  * **検証目的:** 参照 ID（RefID）が「初回訪問時（First Encounter）」に正しく割り当てられ、2回目以降の訪問で正しく `Tag 99 (Ref)` として正規化されるかを検証する。  
* **Cyclic Graph (循環参照):** 自己参照（`a.x = a`）および相互参照（`a.x = b; b.y = a`）を含む構造。  
  * **検証目的:**  
    * **Phase 1:** `CycleMarker (Tag 254)` が適切に出力され、無限再帰せずにソート順序が決定されるか。  
    * **Phase 2:** `Visited Map` が機能し、有限ステップで `REF` ノードが出力され停止するか。  
* **Deep Nesting (深層構造):** 再帰深度制限（$d\_{trav}=1000$, $d\_{cmp}=10$）の境界値（999, 1000, 1001）を攻めるネスト構造。  
  * **検証目的:** Safety Kernel の Stack Depth Guard が正確に機能し、制限超過時に `LimitTag` (Phase 1\) または `Error_Lock` (Phase 2\) が原子的に発動するかを検証する。

**2\. 数値表現攻撃パターン (Float Edge Storm)** JavaScript の number 型（IEEE 754 Double）や他の数値型が取りうる特殊なビットパターンを網羅的に注入し、正規化漏れを暴く。

* **Signaling NaN / Quiet NaN:** ペイロードビットが異なる複数の NaN（例: `0x7FF0000000000001` vs `0x7FF8000000000000`）。これらが全て正規化された単一のバイト列（`0x7ff8000000000000`）に変換されるかを確認する。  
* **Signed Zero:** `+0` と `-0`。これらが明確に区別され、異なるハッシュ値となるかを確認する（JSON互換実装の誤検知）。  
* **Subnormal Numbers:** 非正規化数（極小値）。Flush-to-Zero されずにビットが保存されるかを確認する。  
* **BigInt Boundaries:** `2^64`, `-2^64`, `0` などの境界値において、符号と絶対値のエンコーディング（v56.3 仕様）が正しく機能するかを確認する。

**3\. 正準衝突攻撃パターン (Canonical Collision Strategy)** メモリ上の表現や生成順序は異なるが、論理的（Canonical）には等価となる構造を生成し、ソートロジックをテストする。

* **Property Shuffle:** Object のプロパティ定義順序をランダムに入れ替えたもの（例: `{a:1, b:2}` vs `{b:2, a:1}`）。  
* **Map Re-insertion:** Map のエントリ挿入順序を入れ替えたもの。  
* **検証目的:** 実装がメモリ配置や挿入順序に依存せず、Phase 1 の Canonical Sort によって完全に同一のバイト列を出力するかを検証する。

##### **15.2.2 異種実装間 (JS vs Python/Rust) のビット完全一致確認** {#15.2.2-異種実装間-(js-vs-python/rust)-のビット完全一致確認}

HACE の適合性検証においては、単一の実装内での整合性確認のみならず、**異なるプログラミング言語およびアーキテクチャによる独立した実装間での出力完全一致（Cross-Implementation Exact Match）** が義務付けられる。これにより、言語仕様や標準ライブラリの差異に起因する「隠れた非決定性」を排除する。

検証プロセスは、以下の規定に従って実施されなければならない（SHALL）。

**1\. オラクル（神託）の定義** 本規格書に基づき、最適化を排して記述された **Python 参照実装 (Executable Spec / `hace_ref.py`)** を、動作の正当性を判定する絶対的な基準（Oracle）と定義する。

* **義務:** JavaScript (Production), Rust/C++ (Native/WASM) 等の他実装は、いかなる入力グラフ $G$ に対しても、このオラクルとビット単位で完全に同一のバイト列を出力しなければならない。  
* **信頼の源泉:** オラクルは速度よりも可読性と仕様との 1:1 対応を最優先して記述されており、仕様書の「実行可能な定義」として機能する。

**2\. 比較手法 (Comparison Method)** 出力の比較は、構造的な等価性（JSONとしての値の一致など）ではなく、**生成されたバイトストリームに対する `memcmp` 相当のバイナリ比較** によって行われなければならない。

* **不適合判定:** 1バイト、あるいは1ビットでも差異が生じた場合、たとえそれが意味論的に等価（例: JSONにおけるキー順序の違い、浮動小数点の最下位ビットの揺らぎ）であったとしても、実装は **不適合 (Non-Conformant)** と判定される。これは、HACE がデータフォーマット規格としての側面を持つためである。

**3\. 乱数シードの同期 (PRNG Synchronization)** 比較を行う際は、全ての実装に対して同一の乱数シード（固定値: `0xCAFEBABE` 推奨）を与え、内部で使用される決定論的乱数生成器（PCG64 または Xoshiro256\*\*）の状態を完全に同期させなければならない（参照: 14.1 Configuration Parameters）。

* **目的:** これにより、Map のハッシュシードや、もし存在するならばランダムな決定要素が、全実装で同一の挙動を示すことを保証する。実行環境（OS, 時刻, スレッド数）によるエントロピー混入は厳禁とする。

**4\. 言語固有特性の排除確認** 本検証により、以下の言語依存の挙動が完全に正規化されていることを証明しなければならない。

* **浮動小数点数:** JS の `number` (Double) と Rust の `f64` 間での NaN ペイロードおよび \-0 のビット表現の一致（IEEE 754 Canonicalization）。  
* **コンテナ順序:** JS の挿入順序依存 (Map) と、Rust/Python のハッシュ値依存の順序が、Phase 1 の正規化ソートによって統一されていること。  
* **文字エンコーディング:** 言語ごとの UTF-8 エンコーダの挙動差異（サロゲートペアの自動置換など）が排除され、不正シーケンスに対して一律に `Error_Lock` していること。

##### **15.2.3 許容誤差ゼロ基準 (Zero-Tolerance Policy)** {#15.2.3-許容誤差ゼロ基準-(zero-tolerance-policy)}

HACE 規格への適合性判定において、実装が生成する正規化バイト列（Canonical Byte Stream）と、オラクル（参照実装）が生成するバイト列との間に生じる差異は、その規模、原因、あるいは発生頻度に関わらず **一切許容されない** （MUST NOT be tolerated）。

従来の数値計算やレンダリングエンジンに見られる「許容誤差（Epsilon）」や「プラットフォーム固有のゆらぎ」という概念は、HACE には存在しない。すべての適合実装は以下の基準を絶対的に遵守しなければならない。

**1\. ビット完全一致の原則 (Principle of Bit-Exactness)** いかなる入力グラフ $G$ に対しても、実装 $I$ が生成する出力 $O\_I(G)$ は、参照実装 $O\_{ref}(G)$ と **全ビットが完全に一致** しなければならない（$O\_I(G) \\equiv O\_{ref}(G)$）。

* **不適合判定:** 1バイト、あるいは1ビットでも差異が生じた場合、たとえそれが意味論的に等価なデータ（例：JSONにおけるキー順序の違い、NaN のペイロードの僅かな差）であっても、その実装は **規格不適合 (Non-Conformant)** と判定される。

**2\. 環境起因の免責事項の無効化** 以下の要因を理由とした出力の不一致は、正当な理由として認められず、すべて「実装上のバグ」として扱われる。

* **浮動小数点演算:** CPU アーキテクチャやコンパイラの最適化による最下位ビット（LSB）のゆらぎ。HACE では IEEE 754 正規化（6.1）によりこれを排除しているため、不一致は正規化漏れを意味する。  
* **時刻精度:** OS やランタイムによるタイマー精度の差異（そもそも物理時刻への依存が禁止されている）。  
* **ハッシュマップ実装:** 言語標準ライブラリのハッシュアルゴリズムの違いによる要素順序の変動。  
* **未定義動作:** 言語仕様上の未定義動作（Undefined Behavior）に依存した結果の変動。

**3\. エラー挙動の決定性** 「許容誤差ゼロ」は正常系のみならず、準正常系（Error Case）にも適用される。

* **同期:** ある入力が参照実装において `Error_Lock` を引き起こす場合、被験実装もまた **正確に同一の論理ステップ** で `Error_Lock` に遷移しなければならない。  
* **原子性:** いかなるエラーであっても、一切の部分出力（Partial Emission）を行ってはならない。エラーメッセージの内容（文字列）は実装依存でもよいが、「出力なし（Bottom）」という結果（バイナリの不在）は完全に一致しなければならない。

**4\. 検証の合否判定** HDF (Differential Fuzzer) によるランダムテスト（1,000,000 ケース以上）において、一度でも不一致（Divergence）が検出された場合、その実装は「不安定（Unstable）」ではなく **「不適合（Non-Conformant）」** と判定され、リリースや認証の対象から除外される。

#### **15.3 Oracle Validator による静的証明** {#15.3-oracle-validator-による静的証明}

##### **15.3.1 TLV 文法の数学的整合性チェック** {#15.3.1-tlv-文法の数学的整合性チェック}

Oracle Validator は、入力されたバイトストリーム $S$ が、附属書 B で定義される **Canonical Node Grammar** の集合に属することを、以下の数学的制約条件（Constraints）の検証を通じて証明しなければならない。この検証は、データの意味論（Semantics）を解釈する前段階として、構文論（Syntax）レベルでの完全性を保証するものである。

**1\. タグ定義域の閉包性 (Tag Domain Closure)** ストリーム内に出現する全ての Type Tag $T$ は、出力用タグ集合 $T\_{out} \= {0, 1, \\dots, 10, 99}$ に属さなければならない。

* **禁止タグ:** 比較演算専用のタグ（$T \= 255$ LimitTag, $T \= 254$ CycleMarker）および予約領域のタグの出現は、内部状態の漏洩（Leakage of Internal State）または規格外の拡張とみなされ、即座に **規格不適合 (Non-Conformance)** と判定される。

**2\. 長さ整合性の公理 (Length Consistency Axiom)** 任意のノード $N$ について、Length フィールドの値 $L\_N$ は、Payload フィールドの実バイト数と完全に一致しなければならない。

* **Primitive Node:** 文字列や数値などのアトム型において、$L\_N$ は UTF-8 バイト数または固定長バイト数（Int64なら8）と等しくなければならない。  
* **Container Node:** コンテナ型（Tag 7～10）において、その Payload は 1つ以上の子ノード $C\_1, C\_2, \\dots, C\_k$ の密な結合（Concatenation）で構成される。したがって、以下の等式が成立しなければならない。 $$L\_N \= \\sum\_{i=1}^{k} (Size(Header\_{C\_i}) \+ L\_{C\_i})$$  
* **余剰の禁止:** この計算において、1バイトでも余剰（Padding）や不足が生じた場合、そのストリームは **不正 (Malformed)** である。

**3\. 完全消費の原則 (Total Consumption Principle)** ルートノードの解析が完了した時点で、読み取りポインタはストリームの終端（EOF）と完全に一致しなければならない。

* **トレーリングガベージの禁止:** 正当な TLV 構造の後ろに続く「ゴミデータ（Trailing Garbage）」や、JSON におけるホワイトスペース等の余剰バイトの存在は一切許容されない。

**4\. 再帰深度の有限性検証** Validator はパース時にノードのネスト深度を計測し、規格上の上限（$d\_{trav} \\le 1000$）を超過していないことを確認しなければならない。これは、スタックオーバーフロー攻撃に対する静的な安全証明となる。

##### **15.3.2 ID 線形性と参照整合性の証明** {#15.3.2-id-線形性と参照整合性の証明}

Oracle Validator は、TLV 文法チェックを通過したストリームに対し、さらに意味論的な検証（Semantic Verification）を行い、識別子（ID）の付与規則と参照構造が HACE の公理系に違反していないことを証明しなければならない。この検証は、バイトストリームを先頭から順次読み進めるワンパス（One-pass）の走査によって行われる。

**1\. コンテナIDの強単調増加性 (Strict Monotonicity of Container IDs)** HACE におけるコンテナ型（Object, Array, Map, Set）の定義ノード（DefNode）に付与される ID は、ストリーム上の出現順において、 **1 から始まる隙間のない連番** でなければならない（参照: 7.3.1）。

* **検証アルゴリズム:** Validator は内部カウンタ $C\_{expected}$ を保持する（初期値 1）。ストリーム解析中にコンテナの定義ノード $N\_{def}$ に遭遇した際、その ID 値 $ID(N\_{def})$ を検証する。  
  * **正当:** $ID(N\_{def}) \= C\_{expected}$ である場合、正当とみなし、$C\_{expected}$ を $+1$ インクリメントする。  
  * **不正:** $ID(N\_{def}) \\neq C\_{expected}$ である場合（重複、欠番、または順序の逆転）、Validator はこれを **ID非線形違反 (Non-Linearity Violation)** と判定し、即座に検証を失敗させなければならない。  
* **アトムの除外:** プリミティブ型（Tag 1-6, 99を除く）のノードは、ID フィールドが常に 0 であることが義務付けられているため（参照: 5.5.3 Separation Theorem）、このカウンタの進行には影響を与えない。もしアトムノードが $ID \\neq 0$ を持っていた場合、即座に **規格不適合** と判定される。

**2\. 参照整合性と前方参照の禁止 (Reference Integrity & Prohibition of Forward References)** 参照ノード（Ref Node: Tag 99）が保持するターゲットID（TargetID）は、ストリーム上のその時点において **既に定義が完了しているコンテナのID** でなければならない。

* **定義済み集合:** Validator は、現在の時点で正当に定義された最大ID $ID\_{max}$ （すなわち $C\_{expected} \- 1$）を把握している。  
* **検証条件:** 任意の参照ノード $N\_{ref}$ について、そのターゲット $TargetID(N\_{ref})$ は以下の条件を満たさなければならない。 $$1 \\le TargetID(N\_{ref}) \\le ID\_{max}$$  
* **違反判定:**  
  * $TargetID(N\_{ref}) \> ID\_{max}$ の場合： **前方参照 (Forward Reference)** とみなし、エラーとする。これは Pre-order Traversal 規則への違反を意味する（参照: 附属書A NAP-17）。  
  * $TargetID(N\_{ref}) \= 0$ の場合： **Null参照 (Null Reference)** とみなし、エラーとする（Tag 99 はコンテナ参照専用であり、ID 0 はアトム専用であるため）。  
  * $TargetID(N\_{ref})$ が定義済みIDの範囲外（存在しないID）を指す場合： **ダングリングポインタ (Dangling Pointer)** とみなし、エラーとする。

**3\. 定義と参照の排他性** 同一の ID が複数の定義ノード（DefNode）によって使用されてはならない。これは項目1の強単調増加性チェックにより数学的に保証されるが、Validator はこれを明示的に監視する。また、参照ノード（Tag 99）自体が ID を持つこと（ID \> 0）は禁止される。参照ノードの自身の ID フィールドは常に 0 でなければならない。

#### **15.4 HACE Conformance Test Suite (実装裁判所)** {#15.4-hace-conformance-test-suite-(実装裁判所)}

##### **15.4.1 Arithmetic Traps (演算境界・シフト・Overflowテスト)** {#15.4.1-arithmetic-traps-(演算境界・シフト・overflowテスト)}

本テストカテゴリは、HACE エンジンの内部で使用される算術演算（特に Fingerprint 計算および Safety Kernel のカウンタ制御）が、言語や CPU アーキテクチャの違いを超えて完全に統一された挙動を示すことを検証する。実装者は、以下のトラップケースを通過することを証明しなければならない（MUST）。

**1\. 64-bit Unsigned Wrapping (Modulo $2^{64}$) の検証** Fingerprint 計算（Wyhash系）において、加算および乗算が「符号なし64ビット整数」として正しくラップアラウンド（切り捨て）されるかを確認する。

* **目的:** JavaScript の `BigInt`（無限精度）や Python の `int`（任意精度）が、上位ビットを保持し続けてハッシュ値を破壊するのを防ぐ。また、C/C++ における符号付き整数のオーバーフロー（未定義動作）を排除する。  
* **Test Vector 1 (Addition Overflow):**  
  * Input: `0xFFFFFFFFFFFFFFFF` \+ `0x0000000000000001`  
  * Expected: `0x0000000000000000` (Not `0x10000000000000000`)  
* **Test Vector 2 (Multiplication Truncation):**  
  * Input: `0xFFFFFFFFFFFFFFFF` \* `0x0000000000000002`  
  * Expected: `0xFFFFFFFFFFFFFFFE`

**2\. 論理右シフトと符号拡張の排除 (Logical Shift & Sign Extension)** ビットシフト操作において、最上位ビット（MSB）の扱いが「論理シフト（0埋め）」であることを確認する。

* **目的:** Java の `>>` や C/C++ の signed 型に対するシフトが「算術シフト（符号維持）」となり、負数のシフト結果が `1` で埋め尽くされるバグを防ぐ。  
* **Test Vector 3 (MSB Retention):**  
  * Input: `0x8000000000000000` (MSB=1)  
  * Operation: Right Shift by 1 (`>>> 1`)  
  * Expected: `0x4000000000000000` (MSB=0)  
  * Trap Result (Arithmetic Shift): `0xC000000000000000` (MSB=1 propagates) \-\> **Fail**

**3\. シフト量のマスク処理 (Shift Amount Masking)** シフト量（RHS）が 64 以上の場合の挙動が、`amount & 0x3F` (mod 64\) に統一されているかを確認する。

* **目的:** Intel x86/64 (mod 64\) と ARM や JS エンジン、および C++ の未定義動作（Undefined Behavior）による差異を吸収する（参照: 7.2.4.1）。  
* **Test Vector 4 (Oversized Shift):**  
  * Input: `0xFFFFFFFFFFFFFFFF`  
  * Operation: Right Shift by 65 (`>>> 65`)  
  * Logic: Effectively `>>> (65 & 63)` \= `>>> 1`  
  * Expected: `0x7FFFFFFFFFFFFFFF`  
  * Trap Result (0 or No-op): `0x00...00` or `Exception` \-\> **Fail**

**4\. U53 境界と Error\_Lock (Safety Kernel)** Fingerprint 以外の内部カウンタ（ID, Depth）が、JavaScript の安全整数範囲（Safe Integer）を超えた際の挙動を確認する。

* **目的:** ID生成において `Number.MAX_SAFE_INTEGER` を超えた場合、精度落ちによる ID 重複（`N` と `N+1` が同じ値になる）が発生する前に、システムが停止することを保証する。  
* **Test Vector 5 (U53 Overflow):**  
  * Internal State: NextID \= `9007199254740991` (`2^53 - 1`)  
  * Operation: `AllocID()`  
  * Expected: **Error\_Lock** ($\\bot$)  
  * Trap Result: `9007199254740992` (Silent precision loss) \-\> **Fail**

**5\. BigInt の絶対値と符号分離** BigInt のハッシュ計算において、2の補数表現（Two's Complement）ではなく、絶対値（Magnitude）と符号（Sign）が分離されているかを確認する。

* **Test Vector 6 (Negative One):**  
  * Input: BigInt `-1`  
  * Internal Logic: Sign=`1`, Magnitude=`1`  
  * Calculation: `Mix((1 << 63) | 1)` \-\> `Mix(0x8000000000000001)`  
  * Trap Result (Two's Comp): `Mix(0xFFFFFFFFFFFFFFFF)` \-\> **Fail**

##### **15.4.2 Immediate Value Table Verification** {#15.4.2-immediate-value-table-verification}

本テストカテゴリは、7.2.4.2 で定義された **「即値（Immediate Value）」** の生成ロジックが、言語やアーキテクチャに依存せずビット単位で正確に実装されていることを検証する。 実装者は、以下の入力に対して生成される `Pre-Mix Value`（Mix関数に通す前の生ビット列）および `Post-Mix Value`（Mix関数適用後の最終的な即値）が、期待値と完全に一致することを証明しなければならない（MUST）。

**1\. String 型のビット配置とシフト (MSB Alignment & Length Mix)** 文字列の先頭8バイト（MSB詰め）と長さ情報（32bit左シフト）が正しく合成されているかを検証する（参照: v56.3 Ultimate Edition）。

* **Test Vector 1-A (Short String):**  
  * Input: `"A"` (UTF-8: `0x41`, Length: 1\)  
  * Logic:  
    * `First8Bytes`: `0x4100000000000000` (Left-justified / Zero-padded)  
    * `Length << 32`: `0x0000000100000000`  
    * `XOR`: `0x4100000100000000`  
  * Expected Pre-Mix: **`0x4100000100000000`**  
* **Test Vector 1-B (Exact 8 Bytes):**  
  * Input: `"12345678"` (ASCII)  
  * Expected Pre-Mix: `0x3132333435363738` $\\oplus$ `(8 << 32)` \= **`0x3132333c35363738`**  
* **Test Vector 1-C (Long String Truncation):**  
  * Input: `"123456789"` (9 Bytes)  
  * Logic: 先頭8バイト `"12345678"` のみ使用。長さは 9。  
  * Expected Pre-Mix: `0x3132333435363738` $\\oplus$ `(9 << 32)` \= **`0x3132333d35363738`**

**2\. BigInt 型の符号と絶対値 (Sign & Magnitude)** 2の補数表現ではなく、絶対値（Magnitude）と符号ビット（MSB）が正しく分離されているかを検証する。

* **Test Vector 2-A (Negative One):**  
  * Input: BigInt `-1`  
  * Logic:  
    * `Sign`: Negative $\\to$ `1`  
    * `Sign << 63`: `0x8000000000000000`  
    * `Abs(-1)`: `1` (`0x00...01`)  
    * `OR`: `0x8000000000000001`  
  * Expected Pre-Mix: **`0x8000000000000001`**  
  * *Trap:* 2の補数 (`0xFF...FF`) を使用している実装はここで失敗する。  
* **Test Vector 2-B (Max Int64 Boundary):**  
  * Input: `9223372036854775807` (`2^63 - 1`, Positive)  
  * Expected Pre-Mix: **`0x7FFFFFFFFFFFFFFF`** (Sign bit 0\)  
* **Test Vector 2-C (Min Int64 Boundary):**  
  * Input: `-9223372036854775808` (`-2^63`)  
  * Logic: Abs is `2^63` (`0x8000...`). Sign is `1`.  
  * Expected Pre-Mix: `0x8000...` | `0x8000...` \= **`0x8000000000000000`**

**3\. Float64 型の正規化 (Canonicalization)** NaN の正規化と \-0 の保存が正しく行われているかを検証する。

* **Test Vector 3-A (Negative Zero):**  
  * Input: `-0.0`  
  * Expected Pre-Mix: **`0x8000000000000000`**  
* **Test Vector 3-B (Signaling NaN):**  
  * Input: ビット列 `0x7FF0000000000001` を持つ NaN  
  * Expected Pre-Mix: **`0x7FF8000000000000`** (Canonical NaN)

**4\. 循環参照の仮値 (Cycle Provisional Value)** 循環検知時に、単なる 0 ではなくタグ情報が混合されているかを検証する。

* **Test Vector 4 (Map Cycle):**  
  * Input: Map (Tag 0x0A) が自己参照している箇所  
  * Logic: `Mix(TagID)` を使用。  
  * Expected Pre-Mix: **`0x000000000000000A`** (Tag ID of Map)

**注記:** `Post-Mix Value` の期待値については、使用する Mix 関数（Wyhash系）の仕様に基づき、別途提供される `02_immediate_values.json` の値を正とする。

##### **15.4.3 Cycle Topology Consistency (循環トポロジー整合性テスト)** {#15.4.3-cycle-topology-consistency-(循環トポロジー整合性テスト)}

本テストカテゴリは、グラフ理論における「閉路（Cycle）」と「合流（Join/Shared Reference）」の取り扱いが、HACE の公理（有限エミッション、参照同一性）に従って正しく実装されているかを検証する。 実装者は、以下のトポロジーパターンに対し、期待される Fingerprint および出力構造が完全に一致することを証明しなければならない（MUST）。

**1\. 循環検知の仮値混合 (Provisional Value Mixing) の検証** Phase 1 の Fingerprint 計算において、循環検知時に単なる `0` ではなく、**`Mix(TagID)`** が正しく仮値として使用されているかを確認する（参照: 7.2.4.3）。

* **目的:** 自己参照する Array (Tag 8\) と 自己参照する Map (Tag 10\) が、構造が同じ「自己ループ」であっても、型タグの違いにより異なる Fingerprint を生成することを保証する。  
* **Test Vector 1-A (Self-Referencing Array):**  
  * Input: `var a = []; a = a;`  
  * Logic: `ListFP = Mix(Tag8) ^ ...` (仮値に Tag 8 を使用)  
* **Test Vector 1-B (Self-Referencing Map):**  
  * Input: `var m = new Map(); m.set("x", m);`  
  * Logic: `MapFP = Mix(Tag10) ^ ...` (仮値に Tag 10 を使用)  
* **Pass Criteria:** Vector 1-A と 1-B の Fingerprint が **不一致** であること。もし仮値を単に `0` としている実装の場合、これらは衝突（Collision）する可能性がある。

**2\. 共有参照と循環の区別 (Diamond vs Cycle)** DAG（有向非巡回グラフ）における「共有（Diamond）」構造を、誤って「循環」として処理していないかを検証する（参照: 附属書A NAP-19）。

* **Test Vector 2 (Diamond Structure):**  
  * Input: `root = {a: shared, b: shared}; shared = {val: 1};`  
  * Logic:  
    * `root.a` 探索時: `shared` の Fingerprint を計算・確定。  
    * `root.b` 探索時: `shared` は計算済み（Visited）だが、現在のスタック（Ancestors）には存在しないため、循環（仮値）ではなく、**確定した Fingerprint** を使用しなければならない。  
* **Pass Criteria:** Phase 1 において `CycleMarker (Tag 254)` が出力されず、Phase 2 において 2回目の `shared` 出力が `Ref (Tag 99)` となること。

**3\. 相互再帰の決定論 (Mutual Recursion Determinism)** 複数ノードにまたがるループ（A $\\to$ B $\\to$ A）において、スタック管理と仮値解決が正しく機能するかを検証する。

* **Test Vector 3 (Ping-Pong):**  
  * Input: `objA.next = objB; objB.next = objA;`  
  * Validation:  
    * `A` から開始した場合と、`B` から開始した場合で、それぞれ計算が有限ステップで停止すること。  
    * Fingerprint 計算において、再帰呼び出しが `SolvingStack` を正しく参照し、無限ループ（Stack Overflow）が発生しないこと。

**4\. 参照IDの出現順序性 (RefID Sequencing)** Phase 2 における ID 付与が、メモリ配置ではなく「Pre-order Traversal（行きがけ順）」に従っているかを検証する。

* **Test Vector 4 (Reference Order):**  
  * Input: `root = [a, b, a];` (a が 2回出現)  
  * Validation:  
    1. `root` (ID: 1\)  
    2. `a` (ID: 2, Definition)  
    3. `b` (ID: 3, Definition)  
    4. `a` (Ref to ID 2\)  
* **Trap Result:** もし `b` の定義前に `a` の2回目が処理されたり、ID が飛び地になったりしている場合、不適合とする。

---

### **附属書 A (規定): 実装禁止事項26選 (Normative Anti-Patterns)** {#附属書-a-(規定):-実装禁止事項26選-(normative-anti-patterns)}

#### **A.1 アーキテクチャ違反 (Layer & Architecture Violations)** {#a.1-アーキテクチャ違反-(layer-&-architecture-violations)}

**NAP-01: Phase 1 (構造解析) での出力エンコーダ呼び出し**

* **定義:** 実装者は、グラフの構造解析および順序決定を行う **Phase 1** の実行中において、最終的な正規化バイト列を生成するための **Output Encoder** （L1 Serialization Layer）を呼び出してはならない（MUST NOT）。また、出力用の Output Arena や Tuple Builder への書き込みを行ってはならない。

* **禁止理由:**

  1. **文法の混同 (Grammar Mismatch):** Phase 1 で使用される「比較用バイナリ（Comparison Binary）」は、IDを持たず、循環検知用の特殊タグ（LimitTag/CycleMarker）を含む独自の文法（Comparison Grammar）に従う。これに対し、出力用エンコーダはIDを含み、参照解決（RefTag）を行う文法（Output Grammar）を持つ。これらを混同すると、ソート判定に不適切なデータ（例：未確定のIDやメモリアドレス依存の順序）が混入し、正規化結果が非決定的となるため。  
  2. **循環依存による決定論崩壊 (Circular Dependency):** Output Encoder は通常、ノードへの ID 付与や Visited Map の更新といった副作用を伴う。ソート順序を決定する前にこれらを実行すると、「ソート結果がIDに依存し、IDがソート結果（訪問順）に依存する」という循環が発生し、ハッシュ値が安定しなくなるため。  
  3. **状態汚染 (State Pollution):** Phase 1 は「読み取り専用（Read-Only）」の試行的な探索であるべきだが、出力エンコーダの呼び出しは NextID カウンタの増加や出力バッファへの書き込みといった不可逆な状態変更を引き起こし、Phase 2 の正しい実行を妨げるため。

**NAP-02: Facade 層内部でのハッシュ計算 (SHA-256等)**

* **定義:** HACE エンジンの公開インターフェースである **Facade 層（L3）** は、入力グラフを正規化されたバイト列（Canonical Byte Stream）へ変換する処理のみを行い、そのバイト列に対する暗号学的ハッシュ関数（SHA-256, BLAKE3 等）の適用を内部で行ってはならない（MUST NOT）。Facade の戻り値は、必ず生の `Uint8Array`（またはそれに準ずるバイナリ型）でなければならない。

* **禁止理由:**

  1. **責務の混同 (Conflation of Responsibilities):** HACE の核心的機能は「一意なバイト列の生成（Canonicalization）」であり、ハッシュ化（Fingerprinting）はアプリケーション層（L4）のポリシー（アルゴリズムの選択、長さ、エンコーディング等）に依存する責務であるため。エンジンが特定のハッシュアルゴリズムを強制することは、将来的なアルゴリズム変更（例: SHA-256 から BLAKE3 への移行）を阻害する。  
  2. **検証のブラックボックス化 (Verification Opacity):** エンジンがハッシュ値のみを返却する場合、Differential Fuzzing や Oracle 検証において不一致が発生した際、具体的にどのバイトオフセットで差異が生じたかを特定（Diff）することが不可能となり、デバッグが著しく困難になるため。  
  3. **非同期境界の汚染 (Async Pollution):** ブラウザ環境の `crypto.subtle.digest` など、高性能なハッシュ計算は非同期 API (Promise) であることが多い。これを Facade 内部に抱え込むと、本来 CPU バウンドで同期的に完結すべき正規化ロジックに不要な非同期制約が波及し、アーキテクチャを複雑化させるため（参照: NAP-20）。

**NAP-03: Safety Kernel のシングルトン実装 (グローバル変数化)**

* **定義:** 実装者は、Safety Kernel（L0）をモジュールレベルのシングルトン、静的クラス（Static Class）、あるいはグローバル変数として実装してはならない（MUST NOT）。Safety Kernel のインスタンスは、必ず正規化セッション（CanonicalHash 関数の呼び出し、または Worker への RUN メッセージ）ごとに新規に生成され、セッション終了とともに破棄される「セッションスコープ（Session-Scoped）」で管理されなければならない。

* **禁止理由:**

  1. **状態汚染による非決定性 (State Pollution):** Safety Kernel が保持する Error\_Lock フラグや深度カウンタ（$d\_{trav}, d\_{cmp}$）がグローバルスコープに存在すると、あるセッションで発生したエラーやカウンタの進行状態が、後続のセッションや並行実行中の別セッションに残留・波及する。これにより、入力データが正しくても「前の実行が失敗していたから（あるいはカウンタが上限に近いため）失敗する」という非決定的な挙動を引き起こすため。  
  2. **競合状態の誘発 (Race Conditions):** Visualizer 等において、現在の状態と過去の状態を比較するために複数の正規化プロセスを（Worker等を用いて）並行して走らせる際、グローバル状態が存在するとリソースの競合が発生し、計算結果が破壊されるため。  
  3. **テスト独立性の喪失:** ユニットテストにおいて、前のテストケースでの Error\_Lock が解除されずに次のテストに持ち越されると、テスト結果の信頼性が損なわれるため。

**NAP-04: `session.abort()` を使用しない直接的な例外送出 (`throw`)**

* **定義:** 実装者は、規格違反（例：深さ制限超過、不正なUTF-8シーケンス、U53オーバーフロー）やランタイムエラーを検知した際、Safety Kernel が提供する `session.abort()`（または `SafetyKernel.triggerErrorLock()`）を経由せず、単にホスト言語の例外送出機構（`throw`, `raise`, `panic` 等）のみを使用して制御フローを中断してはならない（MUST NOT）。

* **禁止理由:**

  1. **部分的出力の残留リスク (Risk of Partial Emission):** 言語標準の例外は、上位の呼び出し元（UI層やテストランナー）で不用意に `catch` される可能性がある。この際、Safety Kernel が明示的にロック（Error\_Lock）されていないと、出力バッファに「書きかけの不正なバイト列」が残存したまま、正常な結果として誤認・処理される恐れがあるため。  
  2. **原子的停止の欠如 (Violation of Atomic Halting):** HACE におけるエラーは、処理の一時中断ではなく、計算状態の「底（Bottom, $\\bot$）」への不可逆な遷移でなければならない。`throw` だけでは内部状態（IDカウンタやVisited Map）が汚染されたまま保持される可能性があり、セッションの純粋性が損なわれるため。  
  3. **クロス言語互換性の欠如:** 例外処理のコストや挙動（スタック巻き戻しの有無、デストラクタ呼び出し）は言語（JS, Rust, C++）間で異なる。決定論的動作を保証するためには、言語機能ではなく、明示的な状態フラグ（`Error_Lock`）によって制御されなければならない。  
* **正しい実装:** エラー検知時は、必ず以下の手順を踏まなければならない（MUST）。

  1. `session.abort()` を呼び出し、`Error_Lock` フラグを `true` にする。  
  2. 出力バッファを無効化（破棄）する。  
  3. その上で、制御フローを脱出するために例外を投げるか、または `null` / `Result::Err` を返却して上位へ伝播させる（例外の使用自体は否定しないが、abort なしの例外は禁止される）。

**NAP-05: Phase 2 (出力) でのキー再取得および再ソート**

* **定義:** 実装者は、正規化されたバイト列を出力し ID を付与する **Phase 2** の実行中において、対象コンテナ（Object, Map, Set）の要素やキーを元のオブジェクトから再取得（Re-fetch）したり、それらに対して再度ソート処理（Re-sort）を実行したりしてはならない（MUST NOT）。

* **禁止理由:**

  1. **ランタイム状態による順序変動リスク:** Phase 1 と Phase 2 の間に発生するガベージコレクション（GC）やハッシュマップの内部リサイズにより、`Object.keys` や `Map.prototype.entries` が返すイテレーション順序が変化する可能性があるため。  
  2. **決定論の崩壊 (Collapse of Determinism):** HACE においては Phase 1 で決定された順序のみが「正準（Canonical）」であり、Phase 2 で異なる順序（例：再ソート時の不安定性や状態変化）が混入すると、IDの付与順序が変わり、最終的なハッシュ値が非決定的となるため。  
  3. **計算資源の浪費:** ソートは $O(N \\log N)$ のコストを伴う操作であり、一度確定した順序を再計算することはパフォーマンス上の損失であるため。  
* **正しい実装:** Phase 2 の走査ループは、必ず Phase 1 で生成・固定された **KeyOrderMap** （7.2.3参照）から取得したソート済みキーリストのみに基づいて駆動されなければならない。元のオブジェクトへのアクセスは、そのキーを使って値を取り出す目的にのみ限定される。

#### **A.2 決定論の破壊 (Destruction of Determinism)** {#a.2-決定論の破壊-(destruction-of-determinism)}

**NAP-06: 言語標準 `sort()` 関数の直接使用 (ロケール依存回避)**

* **定義:** 実装者は、キーや要素の順序を決定する際、ホスト言語や標準ライブラリが提供するソート関数（例: JavaScriptの `Array.prototype.sort()`、C++の `std::sort`、Pythonの `list.sort`）を、 **比較関数（Comparator）を明示的に指定せずに** 使用してはならない（MUST NOT）。また、比較関数を指定する場合であっても、それが文字列のロケール依存比較（例: `String.prototype.localeCompare`）や、単純な数値減算に基づくものであってはならない。

* **禁止理由:**

  1. **環境依存の順序 (Implementation-Dependent Order):** 標準ソートの挙動（特に文字列比較）は、実行環境のロケール設定、ブラウザの種類（V8, SpiderMonkey, JSC）、あるいはランタイムのバージョンによって異なる場合があるため、クロスプラットフォームでの一致が保証できない。  
  2. **安定性の欠如 (Lack of Stability):** 言語仕様によってはソートの安定性（Stable Sort: 同値の要素の順序保存）が保証されていない場合があり、これによりハッシュ値が揺らぐリスクがあるため。  
  3. **比較基準の曖昧さ:** デフォルトのソートはしばしば「人間にとって自然な順序（Natural Order）」を採用するが、HACEにおいては「バイト列としての順序（Lexicographical Order）」のみが正解であるため。  
* **必須実装:** ソートを行う際は、必ず以下の要件を満たすカスタム比較関数を使用しなければならない。

  1. 比較対象を正規化されたバイト列（Comparison Binary）に変換する。  
  2. C言語の `memcmp` 相当のロジックで、バイト単位の大小比較を行う。  
  3. 比較結果が等価（Equal）である場合、指紋（Fingerprint）やタグID、最終的にはRaw Bytesによるタイブレークを行い、決定論的な全順序を保証する（参照: 9.4 決定論的タイブレーク）。

**NAP-07: `Object.keys` / `for..in` ループ順序への依存**

* **定義:** 実装者は、オブジェクトのプロパティを走査、シリアライズ、またはハッシュ計算の入力とする際、`Object.keys()`, `Object.values()`, `Object.entries()`, あるいは `for..in` ループ構文によって得られるデフォルトの順序を、正規化された順序として採用してはならない（MUST NOT）。

* **禁止理由:**

  1. **挿入順序への依存 (Insertion Order Dependence):** 多くのランタイムにおいて、非整数の文字列キーは「プロパティが作成された順序」で列挙される。これにより、論理的に等価なオブジェクト `{a:1, b:2}` と `{b:2, a:1}` が異なるバイト列を出力してしまい、Canonicalization の公理に違反するため。  
  2. **整数インデックスの特異挙動:** ECMAScript 仕様では「整数インデックス（Integer Indices）」は数値の昇順で並び、その他の文字列キーより前に来るというルールがあるが、HACE では全てのキーを「UTF-8 バイト列」として扱うため、"10" が "2" より前に来る（辞書順）べきであり、エンジンの挙動と一致しない。  
  3. **プロトタイプ汚染 (Prototype Pollution):** `for..in` ループはプロトタイプチェーン上の列挙可能プロパティも含めて走査するため、実行環境（ライブラリによる `Object.prototype` 拡張など）によって出力が変化するリスクがあるため。  
* **必須実装:** プロパティの順序決定は、以下の手順で厳密に行われなければならない（参照: v56.2 §1.1）。

  1. `Reflect.ownKeys(obj)` または `Object.getOwnPropertyNames(obj)` を使用して、そのオブジェクト自身のキーのみを取得する。  
  2. `Object.getOwnPropertyDescriptor` 等を用い、列挙可能（Enumerable）でないプロパティを除外する。  
  3. 取得したキーを、 **UTF-8 バイト列としての辞書順（Lexicographical Order）** でソートする（`memcmp` 相当）。数値としての解釈は一切行わない。  
  4. このソート済みキーリストに従って値にアクセスする。

**NAP-08: `Map` オブジェクトの挿入順序 (Insertion Order) への依存**

* **定義:** 実装者は、`Map` オブジェクトの内容をシリアライズ、トラバース、またはハッシュ化する際、`Map.prototype.entries()`, `Map.prototype.keys()`, `Map.prototype.forEach()`, あるいは `for..of` ループによって得られるイテレーション順序（挿入順序）を、そのまま正規化された出力順序として採用してはならない（MUST NOT）。

* **禁止理由:**

  1. **生成履歴への依存 (History Dependence):** JavaScript の `Map` は仕様上「挿入順序」を保持するが、これは「どの順番でデータが追加されたか」という実行時の履歴情報を含んでいることを意味する。論理的に等価なデータセット `{a:1, b:2}` であっても、「aを追加→bを追加」した場合と「bを追加→aを追加」した場合でバイト列が異なってしまい、HACE の「アドレス・時間・実装独立性公理（4.1）」に違反するため。  
  2. **クロス言語互換性の欠如:** Rust の `HashMap` や C++ の `std::unordered_map` は、通常、ハッシュ関数やメモリ配置に依存した順序を持ち、挿入順序を保証しない。JS の挙動（挿入順）に合わせようとすると、他言語での実装コストが跳ね上がるか、互換性が維持できなくなるため。  
  3. **JSON変換の非対称性:** 多くの JSON シリアライザは `Map` をサポートしないか、配列の配列 `[[k,v], ...]` に変換するが、この際の順序が不定であることが多いため。  
* **必須実装:** `Map` の処理は以下の手順で厳密に行われなければならない（参照: v56.2 §1.2, §7.2.3）。

  1. `Map` からすべてのエントリ `[Key, Value]` を取得し、一時的なリスト（配列）に格納する。  
  2. 取得したエントリを、キーの **正規化された比較用バイト列（Canonical Comparison Binary）** に基づいて決定論的にソートする（`memcmp` 相当）。  
     * **注記:** 単なる文字列比較や数値比較ではなく、HACEの正規化ルール（NaN, \-0, UTF-8等）を適用したバイト列での比較でなければならない。  
  3. ソートされた順序に従って、ID付与および出力を行う。これにより、入力時の挿入順序情報は完全に破棄（Normalization）されなければならない。

**NAP-09: `Set` オブジェクトのイテレーション順序への依存**

* **定義:** 実装者は、`Set` オブジェクトの内容をシリアライズ、トラバース、またはハッシュ化する際、`Set.prototype.values()`, `Set.prototype.forEach()`, あるいは `for..of` ループによって得られるイテレーション順序（挿入順序）を、そのまま正規化された出力順序として採用してはならない（MUST NOT）。

* **禁止理由:**

  1. **挿入順序への依存 (History Dependence):** JavaScript の `Set` は仕様上「挿入順序」を保持する。これは `{A, B}` と `{B, A}` という論理的に等価な集合に対し、要素の追加順序（生成履歴）によって異なるバイト列を出力してしまうことを意味し、HACE の正規化公理（Canonicalization Axiom）に違反するため。  
  2. **クロス言語互換性の欠如:** C++ の `std::set`（値によるソート順）や Rust の `HashSet`（ハッシュ値による順序、または不定）など、言語によって `Set` のイテレーション順序の仕様は根本的に異なる。JS の挿入順序に依存した実装は、他言語への移植時に再現性を失う。  
  3. **カノニカル衝突の隠蔽:** `Set` 内に「参照（ポインタ）は異なるが、正規化後の内容（Canonical Binary）は同一」であるオブジェクトが存在する場合（Canonical Collision）、単純なイテレーションではこれを見逃す可能性がある。ソートを行うことでこれらが隣接し、重複検知が可能となる。  
* **必須実装:** `Set` の処理は以下の手順で厳密に行われなければならない（参照: v56.2 §1.3）。

  1. `Set` からすべての要素を取得し、一時的なリスト（配列）に格納する。  
  2. 取得した要素を、 **正規化された比較用バイト列（Canonical Comparison Binary）** に基づいて決定論的にソートする（`memcmp` 相当）。  
  3. ソート後、隣接する要素がバイト単位で完全一致していないか検証する（Uniqueness Check）。一致する場合は「カノニカル重複（Canonical Duplicate）」として `Error_Lock` させる。  
  4. 検証を通過したソート済み順序に従って、ID付与および出力を行う。

#### **A.2 決定論の破壊 (Destruction of Determinism)** {#a.2-決定論の破壊-(destruction-of-determinism)-1}

**NAP-10: `WeakMap` のイテレーションや存在確認による順序決定**

* **定義:** 実装者は、正規化ロジックの制御フロー、出力されるノードの選定、あるいは出力順序を決定するために、`WeakMap` に対するキーの存在確認（`WeakMap.prototype.has`）の結果を利用したり、もし将来的に言語仕様やデバッグ拡張で許可されたとしても `WeakMap` の内部イテレーション順序に依存したりしてはならない（MUST NOT）。`WeakMap` は、純粋にアルゴリズム内部の一時的なデータキャッシュ（例: `TraversalIdentityAllocator` や `ComparisonCache`）としてのみ使用が許可される。

* **禁止理由:**

  * **GCタイミングへの依存 (GC Dependence):** `WeakMap` 内のエントリが保持されるか否かは、JavaScript エンジンのガベージコレクション（GC）の実行タイミングに依存する。GC は非決定的なバックグラウンドプロセスであり、実行環境（ブラウザ、Node.js）、メモリ圧迫状況、あるいはユーザーの操作によって挙動が変わるため、`has()` の結果に依存すると出力ハッシュがランダムに変動する（Flaky Hash）。  
  * **観測者効果の発生 (Observer Effect):** `WeakMap` のキーの有無を確認する行為自体が、オブジェクトの生存期間（Liveness）に影響を与えたり、デバッガの有無によって挙動が変わったりする可能性があるため、厳密な決定論を保証できない。  
  * **クロスプラットフォーム非互換:** 弱参照（Weak Reference）の実装やGCアルゴリズムは言語（JS, Rust, C++）やランタイム（V8, SpiderMonkey, JSC）によって大きく異なるため、GC挙動に依存したロジックは移植性が損なわれる。  
* **必須実装:** `WeakMap` を使用する場合は、以下の用途に限定しなければならない。

  * **Identity 管理:** オブジェクトインスタンスに関連付けられたメタデータ（TempID 等）の保存。ただし、この ID の付与順序や走査順序自体は、`WeakMap` の内容ではなく、Phase 1 の正規化ソートによって決定されたグラフ構造に基づいていなければならない（参照: NAP-20）。  
  * **キャッシュ:** 計算結果のメモ化。ただし、キャッシュミスが発生した場合（GCで消えた場合）でも、再計算によってビット単位で完全に同一の結果が得られることが保証されていなければならない。

#### **A.3 バイナリ・エンコーディング違反 (Binary & Encoding Violations)** {#a.3-バイナリ・エンコーディング違反-(binary-&-encoding-violations)}

**NAP-11: TLV Length フィールドへの「要素数」の記録**

* **定義:** 実装者は、TLV (Tag-Length-Value) 構造の Length フィールドに対し、そのコンテナ（Array, Object, Map, Set）が保持する「要素の個数（Item Count）」を記録してはならない（MUST NOT）。Length フィールドには、必ず Payload 部分の **総バイト長（Byte Count）** を記録しなければならない。

* **禁止理由:**

  1. **パーサーの複雑化とパフォーマンス低下:** Length がバイト長であれば、パーサーは Payload の内容を解釈せずに次の Tag の先頭アドレスへ即座にジャンプ（Skip）できる。しかし、要素数が記録されている場合、パーサーは子要素をすべて再帰的に読み込み、それぞれのサイズを計算しなければ次のフィールドへ移動できず、ストリーミング処理や部分読み込み（Lazy Loading）が不可能となるため。  
  2. **メモリ割り当ての不確定性:** デコード時に必要なバッファサイズを事前に確定できず、動的なメモリ再割り当て（Reallocation）が頻発する原因となるため。  
* **必須実装:** コンテナ型の Length 値は、再帰的にシリアライズされた全ての子ノード（Header \+ Payload）のバイトサイズの合計値（Sum of Bytes）でなければならない。

**NAP-12: コンテナ Length の未設定 (0) または動的変更**

* **定義:** 実装者は、コンテナ型（Object, Array, Map, Set）の TLV (Tag-Length-Value) ヘッダを出力する際、Length フィールドに対して一時的なプレースホルダーとして 0 や Undefined を設定し、後続のペイロード書き込み後にシークして値を書き戻す（Back-patching）手法、あるいは「終端マーカー（End Tag）」に依存して Length を不定とする手法を採用してはならない（MUST NOT）。Length フィールドは、その TLV の先頭バイトが出力される時点で、ペイロードの正確な総バイト長として確定していなければならない。

* **禁止理由:**

  1. **ストリーミングデコードの阻害:** Length が正確であれば、デコーダは不要なコンテナの中身を解析することなく、現在のポインタ \+ Length へジャンプすることで即座にスキップできる。Length が 0 や不定の場合、デコーダは中身を逐次解析しなければ次の要素へ進めず、部分読み込み（Partial Loading）や並列処理が不可能となるため。  
  2. **メモリ割り当ての予測不能性:** デコーダが事前に必要なバッファサイズを知ることができないため、動的なメモリ再割り当て（Reallocation）が頻発し、パフォーマンス低下やメモリフラグメンテーション、最悪の場合は DoS（Denial of Service）脆弱性につながるリスクがあるため。  
* **必須実装:** コンテナの Length は、再帰的にエンコードされた全ての子要素（Header \+ Payload）のバイトサイズの厳密な合計値（Sum of Bytes）でなければならない。実装は、バッファへの書き込み前にサイズ計算を行うか、あるいは固定サイズのバッファ（Arena）を用いてサイズを確定させてからヘッダを出力する構成をとらなければならない。

**NAP-13: 参照ID (RefID) への可変長整数 (Varint) の使用**

* **定義:** 実装者は、参照ノード（Tag 99）のペイロードである参照先ID（Target ID）をエンコードする際、Protocol Buffers 等で採用されている **可変長整数（Variable-length Integer / Varint / LEB128）** を使用してはならない（MUST NOT）。IDの値の大小に関わらず、必ず規格で定められた固定長フォーマットを使用しなければならない。

* **禁止理由:**

  * **オフセット計算の整合性破壊:** Varint は値の大きさによってバイト長（1〜10バイト）が変動するため、ストリームの特定位置へのランダムアクセスや、デコード前のデータサイズ予測（Lookahead）が困難になり、パーサーの実装を不必要に複雑化させるため。  
  * **一貫性の欠如:** HACE における他の数値型（Number は IEEE754 64bit、Date は Int64）はすべて固定長で統一されており、ID のみが可変長であることは設計の一貫性を損ない、ハードウェアレベルでの最適化（アライメント等）を阻害するため。  
  * **実装依存リスクの排除:** Varint の実装（特に負数の扱いやオーバーフロー時の挙動）はライブラリや言語によって微妙な差異が生じやすく、ビットレベルの完全一致（Oracle Determinism）を脅かす潜在的なリスクとなるため。  
* **必須実装:** 参照IDは、常に **符号なし64ビット整数 (Uint64)** として扱い、 **ビッグエンディアン (Big-Endian)** の固定長 **8バイト** で書き込まなければならない。

  * **例:** ID 1 の場合、`01` (Varint) ではなく `00 00 00 00 00 00 00 01` とパディングして記録する。  
  * **制約:** 上位ビットがすべてゼロであっても、省略（Compaction）は許されない。

**NAP-14: 浮動小数点数の正規化を経ない `DataView` への直接書き込み**

* **定義:** 実装者は、浮動小数点数（JavaScript の `number` 型 / IEEE 754 Double Precision）をバイナリバッファに出力する際、正規化ロジック（Canonicalizer）を通さずに、`DataView.prototype.setFloat64` などのメソッドや、ポインタキャスト（`reinterpret_cast` / `memcpy`）を用いて直接値を書き込んではならない（MUST NOT）。書き込みの直前に、必ず NaN のビットパターン統一および負のゼロ（-0）の厳密な判定を行わなければならない。

* **禁止理由:**

  1. **NaN のビットパターンの非決定性 (NaN Indeterminacy):** IEEE 754 規格において NaN（非数）は、符号ビットや仮数部のペイロードによって $2^{51}-2$ 通り以上の異なるビット表現を持つことが許容されている。計算の履歴、CPU アーキテクチャ、あるいは JavaScript エンジンの実装（V8 vs SpiderMonkey）によって生成される NaN のビット列が異なるため、直接書き込むとハッシュ値が一致しなくなる（参照: 6.1.1）。  
  2. **符号付きゼロの扱い (Signed Zero Consistency):** JavaScript の等価比較（`===`）では `+0` と `-0` は等しいと判定されるが、ビット表現は異なる（`0x0000...` vs `0x8000...`）。直接書き込むと、論理的に等価な 0 が異なるバイト列として出力されるリスク、あるいは逆に \-0 の情報が意図せず失われるリスクがある（参照: NAP-25）。  
* **必須実装:** 数値の書き込みは、以下のロジックを持つラッパー関数（StrictEncoder）経由で行わなければならない（参照: 6.1, C.1.3）。

  1. **NaN 正規化:** 値が `Number.isNaN(value)` である場合、その元のビット列に関わらず、強制的に **Canonical NaN** (`0x7ff8000000000000`) を書き込む。  
  2. **負のゼロ判定:** 値が `0` である場合、`Object.is(value, -0)` または `(1 / value) === -Infinity` を用いて符号を判定する。負のゼロであれば `0x8000000000000000` を書き込む。  
  3. **Big-Endian:** 正規化された値を、ビッグエンディアン形式でバッファに書き込む。

**NAP-15: `String.prototype.normalize()` の使用**

* **定義:** 実装者は、入力文字列を正規化またはエンコードする過程において、ホスト環境が提供する `String.prototype.normalize()` メソッド（またはそれに準ずる言語標準の Unicode 正規化 API）を使用してはならない（MUST NOT）。文字列は、入力された状態のままの「生の UTF-8 バイト列（Raw UTF-8 Byte Sequence）」として扱わなければならない。

* **禁止理由:**

  1. **Unicode バージョン依存性 (Unicode Version Dependence):** `normalize()` の挙動は、実行環境（ブラウザ、Node.js、OS）が準拠している Unicode のバージョンに依存する。新しい Unicode バージョンで正規化ルールが追加・変更された場合、同じ入力文字列であっても、古いランタイムと新しいランタイムで出力されるバイト列が異なる可能性があるため。  
  2. **クロスプラットフォーム非互換 (Cross-Platform Incompatibility):** 異なるブラウザ（Chrome, Firefox, Safari）や異なる言語ランタイム（V8, SpiderMonkey, JSC）間で、正規化の実装詳細や対応バージョンが完全に同期している保証がない。これにより、環境によってハッシュ値が変わる非決定的な挙動を引き起こすため。  
  3. **情報の不可逆な損失 (Irreversible Loss of Information):** 正規化（特に NFKC/NFKD）は、互換文字を置換したり結合文字を並べ替えたりするため、オリジナルのバイト列情報を不可逆的に変更してしまう。HACE では「入力されたバイト列の同一性」を重視するため、暗黙的な正規化はデータの改変とみなされる。  
* **必須実装:** 文字列処理は以下の原則に従わなければならない。

  1. **Raw UTF-8:** 文字列は正規化せず、そのまま UTF-8 エンコードする。  
  2. **Validation Only:** `TextEncoder` 等でエンコードする前に、不正なサロゲートペア（Lone Surrogate）や非文字（Non-characters）が含まれていないかの「検証（Validation）」のみを行い、不正なシーケンスが含まれる場合は `Error_Lock` とする。正規化による「修正」は行ってはならない。

**NAP-16: `TextEncoder` の盲信 (サロゲートペア検証なしでの使用)**

* **定義:** 実装者は、UTF-8 バイト列を生成する際、入力文字列の正当性を検証することなく、ホスト環境が提供する `TextEncoder.prototype.encode()` メソッド（または各言語の標準 UTF-8 エンコーダ）に直接データを渡してはならない（MUST NOT）。必ずエンコード処理の前に、文字列内に孤立サロゲート（Lone Surrogate）などの不正な UTF-16 シーケンスが含まれていないかを検証しなければならない。

* **禁止理由:**

  1. **サイレント置換による情報の喪失 (Silent Replacement):** 多くの標準エンコーダ（特にブラウザの `TextEncoder`）は、エンコード不可能な不正シーケンス（例: `\uD800` 単体）を検出した際、エラーを発生させずに自動的に「置換文字（U+FFFD: ）」のバイト列 (`EF BF BD`) に置き換えて処理を続行する仕様となっている（W3C Encoding Standard 準拠）。これにより、異なる不正入力が同一の正規化バイト列として出力され、ハッシュ値の衝突（Collision）を招くため。  
  2. **クロス言語互換性の欠如:** 言語やライブラリによって、不正シーケンスに対する挙動（置換、無視、パニック、エラーコード返却）は統一されていない。Rust の `CString` や C++ の厳密なエンコーダと比較した際、JS 側で勝手に置換が行われると、ビットレベルでの完全一致（Oracle Determinism）が保証できなくなるため。  
  3. **原子的停止の原則違反:** HACE において、不正なデータ構造は「修正」されるべきではなく、即座に `Error_Lock`（原子的停止）を引き起こさなければならない。置換処理はこの原則に違反し、潜在的なバグを隠蔽する副作用を持つ。  
* **必須実装:** 文字列のエンコードは以下の手順で行わなければならない（参照: 6.3.2）。

  1. **Pre-validation:** 文字列全体を走査し、ペアになっていないサロゲートコードポイント（`0xD800`〜`0xDBFF` の後に `0xDC00`〜`0xDFFF` が続かない、またはその逆）が存在しないか確認する。  
  2. **Atomic Halting:** 不正シーケンスが検出された場合、エンコードを行わずに即座に `session.abort()` を呼び出し、`Error_Lock` 状態へ遷移する。  
  3. **Encoding:** 検証を通過した文字列のみを `TextEncoder`（または同等のバイト変換器）に渡す。

#### **A.4 走査ロジック違反 (Traversal Logic Violations)** {#a.4-走査ロジック違反-(traversal-logic-violations)}

**NAP-17: Phase 1 (ソート前) 段階での確定 ID 付与**

* **定義:** 実装者は、グラフの構造解析およびソート順序の決定を行う **Phase 1** の実行中において、ノードに対する最終的な出力用識別子（Definition ID）の割り当ておよび固定を行ってはならない（MUST NOT）。ID の付与は、必ず **Phase 2** （Emission Phase）における Pre-order DFS トラバーサル中に、確定した正規化順序に従って行われなければならない。

* **禁止理由:**

  1. **出現順連番ルールの破綻:** HACE における ID は「正規化された順序での出現順」に 1 から順に付与される（Pre-order ID Assignment）。ソートが完了する前の段階（入力順、メモリアドレス順、あるいはハッシュマップのイテレーション順）で ID を固定してしまうと、ソートによってノードの出力順序が変わった際に、ID の順序と出力順序が一致しなくなり、生成されるバイト列が非決定的となるため。  
  2. **アドレス依存性の永続化:** Phase 1 での走査順序は、しばしば実装言語の内部挙動（メモリ配置や挿入順）に依存している。この段階で ID を振ることは、これらの一時的かつ非決定的な要素を「ID」という形で永続化し、ハッシュ値に焼き込んでしまうことを意味する。これはクロスプラットフォームでの完全一致（Oracle Determinism）を不可能にする。  
  3. **比較ロジックの汚染:** Phase 1 は本来「IDを持たない純粋な構造」としてノードを比較すべきフェーズである。ここに未確定の ID を持ち込むと、比較結果が ID（＝非決定的な値）に依存する循環が発生し、正当なソートが行えなくなる。  
* **正しい実装:** Phase 1 では、`WeakMap` 等を用いた一時的なマーカー（TempID）の使用は許容されるが、これはあくまで同一性判定や循環検知のための内部的なものであり、最終的な出力 ID として使用したり、ソート順序の決定に使用したりしてはならない。最終 ID は、Phase 1 で生成された `KeyOrderMap`（または SortedPlan）に従って再走査する瞬間にのみ発行される。

**NAP-18: 再帰呼び出し回数のみによる深度チェック**

* **定義:** 実装者は、グラフの深さ制限（Depth Limit）を実装する際、プログラミング言語のコールスタック（Call Stack）や、再帰呼び出しの回数のみに依存してはならない（MUST NOT）。また、スタックオーバーフロー例外（RangeError: Maximum call stack size exceeded 等）を `try-catch` で捕捉して深さ制限の代用とすることを禁ずる。

* **禁止理由:**

  * **環境依存の不確定性:** コールスタックの上限サイズは、JavaScript エンジン（V8, SpiderMonkey, JavaScriptCore）やそのバージョン、実行環境（ブラウザ、Node.js、WASM）、さらにはコンパイラの最適化状況によって大きく異なる。これに依存すると、「ある環境では成功し、別の環境ではクラッシュする」という非決定的な挙動を招くため。  
  * **論理深度と物理深度の乖離:** 実装によっては、1つの論理ノードを処理するために複数の関数呼び出し（ヘルパー関数、`Array.prototype.map` 等）を経由する場合がある。この場合、論理的な深さが制限内（例: 1000）であっても、物理スタックが先に枯渇し、正当なデータを処理できなくなるリスクがある。  
  * **原子的停止の阻害:** スタックオーバーフローは、ランタイムによっては回復不能な致命的エラー（クラッシュ）として扱われる場合があり、HACE が保証すべき「制御された `Error_Lock` への遷移」と「バッファの安全な破棄」が実行できない恐れがある。  
* **必須実装:** 深さの管理は、必ず Safety Kernel が提供する **明示的なカウンタ（Explicit Counter）** を用いて行わなければならない。

  * **Traversal Depth ($d\_{trav}$):** グラフ全体の探索深さを管理するカウンタ。上限 1000。  
  * **Comparison Depth ($d\_{cmp}$):** 比較処理時の再帰深さを管理する独立したカウンタ。上限 10。  
* これらは関数呼び出しのたびにインクリメント/デクリメントされ、上限を超えた瞬間に論理的なエラー処理（`Error_Lock` または `LimitTag` 出力）をトリガーしなければならない。

**NAP-19: 単純な `Visited` フラグのみによるサイクル検知**

* **定義:** 実装者は、グラフの循環参照（Cycle）を検出する際、単一の `Visited` 集合（訪問済みフラグ）のみに依存して判定を行ってはならない（MUST NOT）。循環検知には、必ず「現在の再帰スタック（Current Recursion Stack / Ancestors）」にあるノードとの照合を用いなければならない。

* **禁止理由:**

  * **DAG の誤検知 (False Positive on DAGs):** 有向非巡回グラフ（DAG）において、ダイヤモンド構造（例: A→B→D, A→C→D）のように複数の経路から同一ノード D に到達する場合がある。単純な `Visited` フラグだけでは、2回目の到達（C→D）を「循環」と誤認してしまい、正当な共有参照構造を不正なループとして処理（打ち切りやエラー）してしまうため。  
  * **比較結果の歪曲:** Phase 1 の構造比較において、共有参照を循環（`CycleMarker`）として扱ってしまうと、本来等価であるべき構造が「循環の有無」によって異なるバイト列となり、ソート順序が狂う（決定論が崩壊する）ため。  
* **正しい実装:** 探索には以下の2つの状態管理を併用しなければならない。

  * **Stack (Ancestors):** 現在探索中のパス上に存在するノード集合。ここに一致があれば「真の循環（Cycle）」である。  
  * **Visited (Completed):** 探索が完了したノード集合。ここに一致があり、かつ `Stack` になければ「共有参照（Shared Reference）」である。

#### **A.5 非決定論的 API の利用 (Use of Nondeterministic APIs)** {#a.5-非決定論的-api-の利用-(use-of-nondeterministic-apis)}

**NAP-20: `computeCanonicalBytes` メソッドの非同期化 (`async/await`)**

* **定義:** 実装者は、HACE エンジンのコアエントリポイントである `computeCanonicalBytes` 関数（およびそこから呼び出される L2/L1 の内部ロジック）を `async function` として定義したり、処理の途中で `await` を用いてイベントループへ制御を戻したりしてはならない（MUST NOT）。正規化プロセスは、入力を受け取ってから結果を返すまで、単一の同期的な実行コンテキスト内で完結しなければならない。

* **禁止理由:**

  * **競合状態（Race Condition）の発生:** 非同期実行中に `await` で処理が中断している間、メインスレッドや他のイベントハンドラが入力オブジェクトグラフ（context）を変更してしまうリスクがある。これにより、グラフの前半は変更前、後半は変更後の状態でハッシュ化される「テアリング（Tearing）」が発生し、決定論的出力が破壊されるため。  
  * **スナップショット整合性の喪失:** HACE は「ある瞬間の静的なスナップショット」を正規化することを前提としている。非同期処理を許容すると、計算中に時間が経過し、外部状態（DOMやグローバル変数）が変化する可能性が生まれるため、厳密な再現性が保証できなくなる。  
  * **アトミック性の欠如:** エラー発生時の `Error_Lock` 遷移は原子的（Atomic）でなければならないが、非同期処理が含まれると、エラー処理中に別のイベントが割り込む余地が生まれ、状態管理が複雑化・破綻するため。  
* **正しい実装:**

  * **Worker 内での同期実行:** UI のフリーズを防ぐためには、関数自体を非同期にするのではなく、HACE エンジン全体を **WebWorker** 内に隔離し、Worker スレッド内部では同期的に処理を実行する（参照: 5.2.3 Worker 隔離）。  
  * **事前クローン:** エンジンにデータを渡す前に `structuredClone` 等でディープコピーを作成し、計算対象を外部の変更から物理的に切り離す。  
  * **非同期アクションの分離:** FSM として非同期処理（APIコール等）が必要な場合は、正規化ロジックの中で `await` するのではなく、エンジンを `AsyncPending` 状態へ遷移させ、正規化処理自体はそこで一旦終了させる（参照: v56.0 §6.1）。

**NAP-21: `Crypto.randomUUID` / `Math.random` の使用**

* **定義:** 実装者は、正規化コア（L2）、アクション実行（Action）、およびガード条件評価（Guard）の内部において、ホスト環境が提供する非決定的な乱数生成 API（例: JavaScript の `Math.random()`, `crypto.getRandomValues()`, `crypto.randomUUID()`、または他言語の `rand()`, `uuid.new_v4()` 等）を直接呼び出してはならない（MUST NOT）。

* **禁止理由:**

  * **再現性の完全喪失 (Loss of Reproducibility):** これらの API は、実行時の時刻、CPU の熱ノイズ、OS のエントロピーなど、外部の予測不可能な要素に依存して値を生成する。これにより、入力グラフとロジックが完全に同一であっても、実行のたびに異なる ID や値が生成され、出力バイト列の一致（Oracle Determinism）が不可能となるため。  
  * **リプレイ検証の阻害:** エラー発生時の状況を再現（Replay）しようとした際、乱数シードの制御ができない標準 API を使用していると、分岐条件や生成データが再現できず、デバッグや形式検証が破綻するため。  
  * **クロスプラットフォーム非互換:** 乱数生成アルゴリズム（例: Xorshift128+ vs Mersenne Twister）やその実装詳細は言語やランタイムによって異なり、同じシードを与えたとしても異なる乱数列を生成する可能性があるため（標準APIはアルゴリズムを規定していないことが多い）。  
* **必須実装:** 乱数が必要な場合は、必ず以下の要件を満たす **決定論的 PRNG (Deterministic Pseudo-Random Number Generator)** を使用しなければならない。

  * **アルゴリズムの固定:** PCG64, Xoshiro256\*\* 等、仕様が公開され、全言語でビットレベルの互換実装が可能なアルゴリズムを採用する。  
  * **シード注入:** 実行開始時に外部（Input Journal 等）から明示的にシード値（Seed）を受け取り、その値のみに基づいて初期化する。  
  * **サンドボックス化:** ユーザーコード（DSL）に対しては、`Math.random` をオーバーライドするか、専用の `sys.random()` 関数を提供し、標準 API へのアクセスを物理的に遮断する。

**NAP-22: `Date.now()` (現在時刻) の使用**

* **定義:** 実装者は、正規化プロセス（L2 Logic）、Safety Kernel、およびエンコーダの内部において、`Date.now()`、`new Date()`（引数なしのコンストラクタ）、`performance.now()`、`process.hrtime()`、あるいはホストOSのシステムクロックを参照するいかなる API も呼び出してはならない（MUST NOT）,。時刻情報は、必ずエンジンの外部（Application Layer）から固定された引数（Context または Journal Header）として渡されなければならない。

* **禁止理由:**

  * **時間独立性公理の違反 (Violation of Timestamp Independence):** HACE の正規化出力は純粋関数 $f(Graph) \\to Bytes$ でなければならない。システム時刻を内部で参照すると、関数が $f(Graph, Time)$ となり、同一の入力グラフに対しても実行タイミングによって異なるハッシュ値が生成されるため、再現性（Reproducibility）が完全に失われる,。  
  * **リプレイ検証の破綻:** 過去の不具合を調査するために Journal を用いてリプレイを行う際、エンジンがその時点の「現在時刻」を勝手に取得してしまうと、過去の状態（当時の時刻に基づいた計算結果）と現在の計算結果が一致せず、デバッグが不可能となる,。  
  * **環境差による非決定性:** システムクロックの精度（ミリ秒 vs マイクロ秒）、タイムゾーンの設定、あるいは NTP による時刻補正のタイミングは実行環境ごとに異なるため、クロスプラットフォームでのビット一致を阻害する要因となる,。  
* **必須実装:** 時刻データが必要な場合は、以下のいずれかの方法を採用しなければならない,。

  * **Fixed Timestamp:** 入力コンテキスト内に明示的な `timestamp` フィールドを持たせ、エンジンはそれを単なる数値（Int64 Atom）として扱う。  
  * **Logical Tick:** 時間経過が必要な場合は、エンジンのステップ数（Tick）を論理時刻として使用する。

**NAP-23: メモリアドレスやオブジェクト参照 ID による比較・ソート**

* **定義:** 実装者は、コンテナ内の要素の順序決定（ソート）や、出力用 ID の生成ロジックにおいて、オブジェクトのメモリアドレス（Pointer Value）、言語ランタイムが提供する内部オブジェクト ID（例: Python の `id()`、Java の `System.identityHashCode`、Ruby の `object_id`）、またはハッシュコードのデフォルト実装を使用してはならない（MUST NOT）。順序は常にオブジェクトの「内容（Content）」または「グラフ構造上の位置（Topology）」のみによって決定されなければならない。

* **禁止理由:**

  1. **ASLR によるランダム化 (Address Space Layout Randomization):** 現代の OS はセキュリティ対策としてプログラム実行ごとにメモリ配置をランダム化するため、ポインタ値の大小関係は実行のたびに変動し、ハッシュ値の再現性が完全に失われる。  
  2. **GC によるアドレス移動 (Compacting GC):** 実行中にガベージコレクションが発生すると、オブジェクトがメモリ上で移動（リロケーション）する場合がある。ソート中に GC が走ると比較結果が一貫性を失い、ソートの契約違反（Contract Violation）によるクラッシュや不正な順序を引き起こすリスクがある。  
  3. **クロス言語・クロスアーキテクチャ非互換:** ポインタのサイズ（32bit vs 64bit）やアロケータの挙動は環境によって異なるため、JS での実装と Rust/C++ での実装の間でビットレベルの一致（Oracle Determinism）を保証することが不可能となる。  
* **必須実装:** 順序と同一性は以下の公理に基づいて決定しなければならない（参照: v55.4 §2.1）。

  1. **Canonical Sort:** 兄弟ノード間の順序は、Phase 1 で生成された「比較用バイト列（Comparison Binary）」の `memcmp` 結果（全順序）のみによって決定する。  
  2. **Traversal Identity:** 出力 ID は、正規化された順序での「Pre-order DFS（行きがけ順）」による初回到達順に 0 から連番を付与することで決定する。メモリアドレスは Visited マップのキー（同一性判定）としてのみ使用し、大小比較には一切使用してはならない。

#### **A.6 エラー処理違反 (Error Handling Violations)** {#a.6-エラー処理違反-(error-handling-violations)}

**NAP-24: 不完全な `try-catch` によるエラー隠蔽と処理続行**

* **定義:** 実装者は、正規化プロセス（L2）、エンコーディング（L1）、およびアクション評価（L3/Evaluator）の内部において、発生した例外（Exception）やエラーを `try-catch` ブロックで捕捉した際、システムを **Error\_Lock** 状態へ遷移させずに、`null` や `false` などのデフォルト値を返却して処理を続行させてはならない（MUST NOT）。また、エラーを単なるログ出力（`console.error` 等）のみで済ませ、制御フローを維持することも厳禁とする。

* **禁止理由:**

  1. **内部状態の不整合 (Inconsistent Internal State):** 例外が発生した時点で、書き込み中のバッファ、スタック深度カウンタ、あるいは一時的なIDマップなどの内部状態は、論理的に破損している可能性が高い。この状態で処理を続行すると、破損したデータに基づいた不正なバイト列が出力され、決定論が崩壊するため。  
  2. **部分的出力の発生 (Partial Emission Risk):** エラー発生前のデータと、エラー隠蔽後のデータが結合されると、ハッシュ値は計算可能だが無意味な値となり、検証ツールとしての信頼性を失うため。HACE におけるエラーは「底（Bottom, $\\bot$）」であり、出力なし（No Output）と等価でなければならない。  
  3. **v52の教訓 (Silent Failure):** 旧バージョンではガード条件の評価エラー（未定義変数へのアクセス等）を `catch { return false; }` で握りつぶしていたため、ユーザーが記述ミス（Typos）に気づけず、デバッグが極めて困難であった。これを防ぐため、エラーは即座に顕在化させなければならない。  
* **必須実装:** `try-catch` を使用する場合は、以下のフローを厳守しなければならない（参照: 8.1）。

  1. **Catch:** 例外を捕捉する。  
  2. **Abort:** 直ちに `session.abort()` または `SafetyKernel.triggerErrorLock()` を呼び出し、システム状態を `Error_Lock` へ不可逆的に遷移させる。  
  3. **Discard:** 現在作成中のバッファ（Shadow Buffer）を破棄（Rollback）する。  
  4. **Return Bottom:** 上位層へは正規化結果ではなく、明確なエラー型（`null`, `Result.Err` 等）を伝播させる。

**NAP-25: 負のゼロ (`-0`) の無視および正のゼロ (`+0`) との同一視**

* **定義:** 実装者は、浮動小数点数（Number型）の正規化およびエンコードプロセスにおいて、負のゼロ（`-0`）を正のゼロ（`+0`）と同一の値として扱ったり、`-0` の符号ビットを破棄して単なる `0` として出力したりしてはならない（MUST NOT）。JavaScript の厳密等価演算子 (`===`) は両者を区別しないため、これに依存せず、必ずビットレベルでの区別を行わなければならない。

* **禁止理由:**

  1. **ビット表現の不一致 (Bitwise Mismatch):** IEEE 754 倍精度浮動小数点数規格において、`+0` は `0x0000000000000000`、`-0` は `0x8000000000000000` という明確に異なるビット列を持つ。HACE はビットレベルの完全一致（Oracle Determinism）を保証するため、これらを同一視することはデータの改変にあたり、ハッシュ値の不整合を引き起こす。  
  2. **数学的意味の欠落 (Semantic Loss):** `-0` は、「負の方向からの極限」や「アンダーフローの結果」といった数学的な文脈情報を持つ場合がある。例えば `1 / -0` は `-Infinity` となり、`1 / +0` の `+Infinity` とは計算結果が異なる。符号情報を破棄することは、この不可逆的な情報の損失を招く。  
  3. **クロスプラットフォーム互換性の欠如:** C++ や Rust などのシステム言語では、メモリ上のビット表現を直接扱うことが一般的であり、`-0` は明確に区別される。JS 実装側で勝手に正規化してしまうと、他言語実装との間でハッシュ不一致（Divergence）が発生する。  
* **必須実装:** ゼロの処理は、以下の手順で厳密に行われなければならない（参照: v56.0 §1.1, v56.2 §6.1）。

  1. 値が `0` である場合、`Object.is(value, -0)` または `(1 / value) === -Infinity` を用いて、符号付きゼロの判定を行う。  
  2. **負のゼロ (`-0`)** と判定された場合、ペイロードとして必ず `0x8000000000000000` (Big-Endian) を書き込む。  
  3. **正のゼロ (`+0`)** の場合、必ず `0x0000000000000000` (Big-Endian) を書き込む。

#### **A.7 正規化違反 (Normalization Violations)** {#a.7-正規化違反-(normalization-violations)}

**NAP-26: キーおよび文字列の事前正規化 (Implicit Semantic Normalization)**

* **定義:** 実装者は、Fingerprint 計算、比較用バイナリ生成、または最終的な出力バイト列生成の直前において、入力された文字列キーや値に対して、Unicode 正規化（NFC/NFD/NFKC/NFKD）、ケースフォールディング（大文字・小文字変換）、トリミング（空白削除）、あるいは言語依存の照合（Collation）などの「意味的な加工」を暗黙的に行ってはならない（MUST NOT）。

* **禁止理由:**

  1. **バイト列同一性の保証 (Guarantee of Byte Sequence Identity):** HACE は「入力されたバイト列の物理的な同一性」を保証する規格であり、意味的な同一性（Semantic Equivalence）を判定するものではない。勝手な正規化は、入力データの不可逆な改変となり、ハッシュ値の信頼性を損なうため。  
  2. **ライブラリ依存の非決定性:** Unicode 正規化やケースフォールディングの挙動は、ライブラリのバージョン（ICU等）やホスト環境のロケール設定に依存する場合がある。これらをエンジン内部で行うと、クロスプラットフォームでのビット完全一致（Oracle Determinism）が脅かされるため。  
  3. **JSON/言語仕様との衝突:** JSON や一部の言語仕様では、文字列の正規化を行わないのが一般的である一方、特定のライブラリが「親切心」で正規化を行う場合がある。この差異がハッシュ不一致の温床となる。  
* **必須実装:** 文字列は「生の UTF-8 バイト列（Raw UTF-8 Byte Sequence）」として扱い、そのまま処理しなければならない。もし正規化が必要な場合は、HACE エンジンに入力する前の「アプリケーション層（Application Layer）」で明示的に行うべきである。

---

### **附属書 B (規定): 実装不変条件チェックリスト (Normative Implementation Invariants Checklist)** {#附属書-b-(規定):-実装不変条件チェックリスト-(normative-implementation-invariants-checklist)}

#### **B.1 算術演算 (Arithmetic): すべての演算が 64bit マスクされているか？** {#b.1-算術演算-(arithmetic):-すべての演算が-64bit-マスクされているか？}

実装者は、Fingerprint 計算および内部ハッシュ演算の実装コードに対し、以下の項目がすべて満たされていることを確認しなければならない（MUST）。

* **\[ \] 演算モデルの閉包性 (Modulo 2^64 Closure):** 加算 (`+`)、減算 (`-`)、乗算 (`*`) の各演算ステップ直後に、結果に対して必ず **`& 0xFFFFFFFFFFFFFFFF`** （64bit ビットマスク）を適用しているか？

  * **注記:** オーバーフローは例外ではなく「切り捨て（Truncate）」として処理されなければならない（参照: v56.3 §7.2.4.1）。  
* **\[ \] JavaScript における `BigInt` の強制:** JavaScript (TypeScript) 実装において、Fingerprint 計算に `Number` 型（倍精度浮動小数点数）を使用していないか？

  * **必須:** 必ず `BigInt` 型を使用し、演算ごとに `n & 0xFFFFFFFFFFFFFFFFn` または `BigInt.asUint64(n)` を適用して 64bit 境界を強制しなければならない。`Number` 型は $2^{53}$ を超える整数を正確に表現できないため使用禁止である。  
* **\[ \] シフト量のマスク (Shift Amount Masking):** ビットシフト演算 (`<<`, `>>`, `>>>`) の右オペランド（シフト量）に対し、実行前に必ず **`& 63` (0x3F)** のマスク処理を行っているか？

  * **理由:** 言語やCPUアーキテクチャによって、64ビット以上のシフト動作（0になるか、回転するか）が異なる未定義動作を防ぐため。  
* **\[ \] 論理右シフトの強制 (Logical Right Shift):** 右シフト演算において、符号維持シフト（算術シフト）ではなく、必ず **ゼロ埋め右シフト（論理シフト）** を使用しているか？

  * **実装:** JavaScript/Java では `>>>` 演算子、C/C++ では `unsigned` 型に対する `>>` 演算子を使用すること。

#### **B.2 シフト演算 (Shift): 論理右シフトのみを使用しているか？** {#b.2-シフト演算-(shift):-論理右シフトのみを使用しているか？}

実装者は、Fingerprint 計算（Mix関数等）および内部ロジックにおけるビットシフト操作に対し、以下の項目がすべて満たされていることを確認しなければならない（MUST）。

* **\[ \] 論理右シフトの強制 (Logical Right Shift Only):** 右シフト演算において、符号ビットを維持・複製する「算術右シフト（Arithmetic Shift / Sign-propagating）」ではなく、常に上位ビットに 0 を補填する **「論理右シフト（Logical Right Shift / Zero-fill）」** を使用しているか？

  * **JavaScript/Java:** `>>` 演算子の使用は禁止である。必ず **`>>>`** 演算子を使用していること。  
  * **C/C++/Rust:** 符号付き整数（`int64_t`, `i64`）に対する `>>` は算術シフトとなる場合があるため禁止する。必ず **`unsigned` 型（`uint64_t`, `u64`）** にキャストしてから `>>` を適用していること。  
* **\[ \] シフト量のマスク (Shift Amount Masking):** すべてのシフト演算（`<<`, `>>>`）において、右オペランド（シフト量）に対し、演算実行の直前に必ず **`& 63` (0x3F)** のビットマスクを適用しているか？

  * **理由:** x86/ARM 等の CPU アーキテクチャや言語仕様（特に JS vs C++）において、レジスタ幅（64bit）以上のシフト動作（0になるか、回転するか、モジュロをとるか）は未定義動作または挙動不一致の原因となるため、明示的に `amount % 64` の挙動を強制する必要がある。

### 

#### **B.3 文字列 (String): 不正な UTF-8 に対して Atomic Halt しているか？** {#b.3-文字列-(string):-不正な-utf-8-に対して-atomic-halt-しているか？}

実装者は、文字列エンコーディングロジック（L1 Strict Encoder）に対し、以下の項目がすべて満たされていることを確認しなければならない（MUST）。

* **\[ \] 自動置換の完全禁止 (Prohibition of Silent Replacement):** 入力文字列に不正なシーケンスが含まれていた場合、それを **置換文字（U+FFFD: ）** に変換して処理を続行する挙動が、物理的に排除されているか？

  * **JavaScript:** `TextEncoder` はデフォルトで置換を行うため、エンコード前の事前検証（Pre-validation）なしで使用することは禁止である（参照: NAP-16）。  
  * **その他言語:** ライブラリの `replace` オプションが確実に無効化されているか？  
* **\[ \] 孤立サロゲートの検出 (Lone Surrogate Detection):** UTF-16 文字列（JavaScript string 等）から変換する際、ペアになっていないサロゲートコードポイント（`0xD800`〜`0xDBFF` 単体、または `0xDC00`〜`0xDFFF` 単体）を検出し、即座にエラーとしているか？

* **\[ \] 原子的停止の発動 (Execution of Atomic Halt):** 不正なシーケンス（孤立サロゲート、冗長エンコーディング等）を検出した瞬間、例外（Exception）を投げるだけでなく、Safety Kernel を通じて **`Error_Lock`** 状態へ遷移し、出力バッファへの書き込みを一切行わずに停止しているか？

  * **必須:** 部分的な出力（破損データ）が後続の処理に渡ることは許されない。  
* **\[ \] 最短形式の強制 (Shortest Form Enforcement):** UTF-8 エンコーディングにおいて、冗長な表現（Overlong Encoding）を不正データとして拒絶しているか？

#### **B.4 比較 (Comparison): memcmp は符号なしバイトとして比較しているか？** {#b.4-比較-(comparison):-memcmp-は符号なしバイトとして比較しているか？}

実装者は、Phase 1 の正規化ソートおよびタイブレークに使用されるバイト列比較関数（`memcmp` 相当）に対し、以下の項目がすべて満たされていることを確認しなければならない（MUST）。

* **\[ \] 符号なし辞書順比較 (Unsigned Lexicographical Comparison):** バイト値の大小比較において、各バイトを **符号なし8ビット整数 (uint8 / unsigned char)** として扱っているか？

  * **検証:** バイト `0xFF` (255) と `0x00` (0) を比較した際、必ず `0xFF > 0x00` と判定されなければならない。  
  * **Java/Go等の注意:** `byte` 型が符号付き（signed）である言語では、`0xFF` が `-1` と解釈され `0x00` より小さいと判定される事故が多発する。必ず `(b & 0xFF)` 等のマスク処理を行い、正の整数として比較すること。  
* **\[ \] 接頭辞の長さ規則 (Prefix Length Rule):** 一方のバイト列が他方の「接頭辞（Prefix）」となっている場合（例: `[0xAA]` と `[0xAA, 0x00]`）、**「長さが短い方」を小さい（Smaller）** と判定しているか？

  * **必須:** `Length` フィールドの比較だけでなく、Raw Bytes の比較においてもこの原則が貫かれていること。  
* **\[ \] 言語標準ソートの排除:** 比較ロジックにおいて、`String.prototype.localeCompare`（JS）や `std::string::compare`（C++、ロケール依存の場合がある）などの言語標準機能を使用せず、純粋なバイト単位のループ（または `memcmp`）を使用しているか？

#### **B.5 フェーズ分離 (Phasing): Phase 1 で Phase 2 の状態（ID等）を参照していないか？** {#b.5-フェーズ分離-(phasing):-phase-1-で-phase-2-の状態（id等）を参照していないか？}

実装者は、正規化プロセスにおける「構造解析（Phase 1）」と「出力生成（Phase 2）」の間に厳格な **フェーズバリア（Phase Barrier）** が存在し、情報漏洩がないことを確認しなければならない（MUST）。

* **\[ \] IDレス比較の徹底 (ID-less Comparison):** Phase 1 のソートおよび比較ロジックにおいて、最終的な出力用 ID（DefID）を参照したり、割り当てたりしていないか？

  * **必須:** 比較は「コンテンツ（値と構造）」のみに基づいて行わなければならない。同一性判定が必要な場合は、Phase 1 専用の **TempID**（TraversalIdentityAllocator 由来）を使用し、決して永続的な DefID を使用してはならない（参照: NAP-17）。  
* **\[ \] 出力バッファへの書き込み禁止 (No Emission in Phase 1):** Phase 1 の実行中に、最終出力ストリーム（Output Arena / Buffer）への書き込みが発生していないか？

  * **検証:** Phase 1 は「読み取り専用（Read-only）」の解析フェーズであり、副作用として生成してよいのは `KeyOrderMap`（ソート済み順序計画）のみである（参照: NAP-01）。  
* **\[ \] 訪問状態の分離 (Isolation of Visited State):** Phase 1 で使用する循環検知用の `RecursionStack` (または `VisitedSet`) と、Phase 2 で使用する ID 付与用の `VisitedMap` は、物理的に異なるインスタンスとして管理されているか？

  * **必須:** Phase 2 開始時に、Phase 1 の訪問履歴を引き継いではならない。Phase 2 は真っ新な状態から、確定した順序に従って再訪問しなければならない。  
* **\[ \] 順序の固定と再ソート禁止 (Frozen Order in Phase 2):** Phase 2 のループ処理において、`Object.keys()` や `Map.keys()` を再度呼び出してキーを取得していないか？

  * **必須:** Phase 2 は、必ず Phase 1 で生成された `KeyOrderMap` に記録されたキー順序のみに従ってトラバーサルを行わなければならない（参照: NAP-05）。

---

### **附属書 C (規定): 規範的エンコーディング例 (Normative Encoding Examples)** {#附属書-c-(規定):-規範的エンコーディング例-(normative-encoding-examples)}

本附属書は、HACE v56.2 規格に準拠したエンコーダが出力すべき正規化バイト列（Canonical Byte Stream）の具体例を示す。これらの例は規範的（Normative）であり、実装の単体テストにおける期待値（Expected Value）として使用されなければならない。

注記: バイト列はすべて 16進数（Hexadecimal）表記であり、左から右へアドレスが増加する順序（Big-Endian）で記載されている。ヘッダ部分（Tag \+ Length）とペイロード部分の境界には、可読性のためにスペースを挿入しているが、実際のストリームには含まれない。

#### **C.1 プリミティブ型 (Primitive Types)** {#c.1-プリミティブ型-(primitive-types)}

プリミティブ型は、参照同一性を持たない値（Atoms）であり、常に即値としてエンコードされる。IDフィールドを持たず、Tag と Length によって構造が定義される。

**C.1.1 Null (Tag 1\)**

* **値:** `null` (JavaScript), `None` (Python), `nullptr` (C++)  
* **解説:** ペイロードを持たないため、Length は常に 0 である。

**Hex Dump:**  
 01 00 00 00 00

|  |          |

|  \+-- Length: 0 (0x00000000)

\+----- Tag: 1 (Null)

* 

**C.1.2 Boolean (Tag 2, 3\)**

* **値:** `true`

* **解説:** `true` は Tag 2 で表現される。Length は 0。

**Hex Dump:**

 02 00 00 00 00

|  |          |

|  \+-- Length: 0

\+----- Tag: 2 (True)

*   
* **値:** `false`

* **解説:** `false` は Tag 3 で表現される。Length は 0。

**Hex Dump:**

 03 00 00 00 00

|  |          |

|  \+-- Length: 0

\+----- Tag: 3 (False)

* 

**C.1.3 Number (Tag 4\)**

すべての数値は IEEE 754 Binary64 形式、Big-Endian でエンコードされる。

* **値:** `1.0`

**Hex Dump:**

 04 00 00 00 08 3F F0 00 00 00 00 00 00

|  |          |                        |

|  |          \+-- Payload: 1.0 (IEEE 754 BE)

|  \+-- Length: 8

\+----- Tag: 4 (Number)

*   
* **値:** `0` (Positive Zero, `+0`)

**Hex Dump:**

 04 00 00 00 08 00 00 00 00 00 00 00 00

|             |                        |

|             \+-- Payload: \+0.0

\+----- Tag: 4

*   
* **値:** `-0` (Negative Zero, `-0`)

* **解説:** 符号ビット（MSB）が立っていることを確認すること。NAP-25 により `+0` と区別される。

**Hex Dump:**

 04 00 00 00 08 80 00 00 00 00 00 00 00

|             |                        |

|             \+-- Payload: \-0.0 (Sign bit set)

\+----- Tag: 4

*   
* **値:** `NaN` (任意の Not-a-Number)

* **解説:** 入力が `sNaN` やカスタムペイロードを持つ `qNaN` であっても、必ず **Canonical NaN** に正規化される（NAP-14）。

**Hex Dump:**

 04 00 00 00 08 7F F8 00 00 00 00 00 00

|             |                        |

|             \+-- Payload: Canonical NaN

\+----- Tag: 4

* 

**C.1.4 String (Tag 5\)**

文字列は UTF-8 バイト列としてエンコードされる。Length はバイト数である。

* **値:** `""` (空文字)

**Hex Dump:**

 05 00 00 00 00

|  |          |

|  \+-- Length: 0

\+----- Tag: 5 (String)

*   
* **値:** `"A"` (U+0041)

**Hex Dump:**

 05 00 00 00 01 41

|  |          |  |

|  |          \+-- Payload: "A" (0x41)

|  \+-- Length: 1

\+----- Tag: 5

*   
* **値:** `"あ"` (U+3042)

* **解説:** Length は 3（UTF-8 バイト長）であり、1（文字数）ではない。

**Hex Dump:**

 05 00 00 00 03 E3 81 82

|  |          |        |

|  |          \+-- Payload: "あ" (0xE3 0x81 0x82)

|  \+-- Length: 3

\+----- Tag: 5

*   
* **値:** `"😀"` (U+1F600, Emoji)

* **解説:** サロゲートペア（UTF-16）から変換された 4バイト UTF-8 シーケンス。

**Hex Dump:**

 05 00 00 00 04 F0 9F 98 80

|  |          |           |

|  |          \+-- Payload: "😀"

|  \+-- Length: 4

\+----- Tag: 5

* 

**C.1.5 BigInt (Tag 6\)**

任意精度整数は ASCII 10進文字列としてエンコードされる。

* **値:** `0n`

**Hex Dump:**

 06 00 00 00 01 30

|  |          |  |

|  |          \+-- Payload: "0" (0x30)

|  \+-- Length: 1

\+----- Tag: 6 (BigInt)

*   
* **値:** `-123n`

**Hex Dump:**

 06 00 00 00 04 2D 31 32 33

|  |          |           |

|  |          \+-- Payload: "-123" (0x2D 0x31 0x32 0x33)

|  \+-- Length: 4

\+----- Tag: 6

* 

**C.1.6 Date (Tag 7\)**

時刻は Unix Epoch からの経過ミリ秒（Int64 Big-Endian）としてエンコードされる。

* **値:** `1970-01-01T00:00:00.000Z` (Epoch 0\)

**Hex Dump:**

 07 00 00 00 08 00 00 00 00 00 00 00 00

|  |          |                        |

|  |          \+-- Payload: 0 (Int64 BE)

|  \+-- Length: 8

\+----- Tag: 7 (Date)

*   
* **値:** `2023-01-01T00:00:00.000Z` (Epoch 1672531200000\)

**Hex Dump:**

 07 00 00 00 08 00 00 01 85 6E F0 14 00

|             |                        |

|             \+-- Payload: 1672531200000 (0x000001856EF01400)

\+----- Tag: 7

* 

#### **C.2 コンテナ型 (Container Types)** {#c.2-コンテナ型-(container-types)}

コンテナ型（Object, Array, Map, Set）は、参照同一性を持ち、定義ID（DefID）が付与される。 コンテナのペイロードは、**「DefID (8バイト)」** と **「子要素のTLVシーケンス」** の結合であり、Length フィールドはこれら全ての合計バイト長を示す。

**C.2.1 Array (Tag 8\)**

配列はインデックス順に出力される。IDは出現順に 1 から付与される。

* **入力:** `[]` (空配列, Root Node)

* **構造:** `[Tag:8] [Len:8] [DefID:1] (要素なし)`

**Hex Dump:**

 08 00 00 00 08 00 00 00 00 00 00 00 01

|  |           |

|  |           \+-- DefID: 1 (Root, 8 bytes)

|  \+-- Length: 8 (DefIDのみ)

\+----- Tag: 8 (Array)

*   
* **入力:** `[null]`

* **構造:** `[Tag:8] [Len:13] [DefID:1] [Null Atom]`

**Hex Dump:**

 08 00 00 00 0D 00 00 00 00 00 00 00 01 01 00 00 00 00

|  |           |                       |

|  |           |                       \+-- Child: Null (Tag 1, Len 0\)

|  |           \+-- DefID: 1

|  \+-- Length: 13 (8 bytes DefID \+ 5 bytes Null Node)

\+----- Tag: 8

* 

**C.2.2 Object (Tag 9\)**

オブジェクトのプロパティは、キー（UTF-8）の辞書順（memcmp）でソートされなければならない。

* **入力:** `{"b": 2, "a": 1}`  
* **解説:** キー "a" (0x61) \< "b" (0x62) であるため、`a` が先に出力される。

**Hex Dump:**  
 09 00 00 00 2E 00 00 00 00 00 00 00 01

|  |           |

|  |           \+-- DefID: 1

|  \+-- Length: 46 (0x2E)

\+----- Tag: 9 (Object)

\-- Property "a": 1 \--

05 00 00 00 01 61                       (Key "a": Tag 5, Len 1\)

04 00 00 00 08 3F F0 00 00 00 00 00 00  (Val 1.0: Tag 4, IEEE754)

\-- Property "b": 2 \--

05 00 00 00 01 62                       (Key "b": Tag 5, Len 1\)

04 00 00 00 08 40 00 00 00 00 00 00 00  (Val 2.0: Tag 4, IEEE754)

* 

**C.2.3 Map (Tag 10\)**

Map はキーの型が異なっていても、比較バイナリ（Comparison Binary）の辞書順でソートされる。

* **入力:** `Map { "1" => "B", 1 => "A" }`  
* **解説:**  
  * キー `1` (Number) の比較バイナリ先頭は Tag `04`。  
  * キー `"1"` (String) の比較バイナリ先頭は Tag `05`。  
  * `04 < 05` であるため、数値の `1` が先頭に来る（型の種類によるソート）。

**Hex Dump:**  
 0A 00 00 00 2E 00 00 00 00 00 00 00 01  (Map Header, DefID 1\)

\-- Entry 1: Key 1 (Number) \=\> "A" \--

04 00 00 00 08 3F F0 00 00 00 00 00 00  (Key: 1.0)

05 00 00 00 01 41                       (Val: "A")

\-- Entry 2: Key "1" (String) \=\> "B" \--

05 00 00 00 01 31                       (Key: "1")

05 00 00 00 01 42                       (Val: "B")

* 

**C.2.4 循環参照 (Tag 99\)**

循環構造は、既出の DefID を指す参照ノード（Tag 99）によって表現される。

**入力:**  
 let root \= {};

let child \= { parent: root };

root.child \= child;

// root(ID 1\) \-\> child(ID 2\) \-\> root(Ref 1\)

*   
* **解説:**  
  1. `root` を訪問。ID `1` を付与。定義を出力開始。  
  2. プロパティ `child` を処理。値は `child` オブジェクト。  
  3. `child` を訪問。ID `2` を付与。定義を出力開始。  
  4. プロパティ `parent` を処理。値は `root` オブジェクト。  
  5. `root` は訪問済み（ID 1）。**Ref Node (Tag 99\)** を出力して停止。

**Hex Dump:**  
 \-- Root Object (DefID 1\) \--

09 00 00 00 2A 00 00 00 00 00 00 00 01  (Len: 42 bytes)

    \-- Key "child" \--

    05 00 00 00 05 63 68 69 6C 64       ("child")

    \-- Value (Child Object, DefID 2\) \--

    09 00 00 00 1B 00 00 00 00 00 00 00 02 (Len: 27 bytes)

        \-- Key "parent" \--

        05 00 00 00 06 70 61 72 65 6E 74   ("parent")

        \-- Value (Ref to Root, ID 1\) \--

        63 00 00 00 08 00 00 00 00 00 00 00 01

        |  |           |

        |  |           \+-- TargetID: 1 (Uint64 BE)

        |  \+-- Length: 8

        \+----- Tag: 99 (Ref)

* 

---

### **附属書 D (参考): 実装ガイダンス (Implementation Guidance)** {#附属書-d-(参考):-実装ガイダンス-(implementation-guidance)}

本附属書は、HACE v56.3 の実装者が、特定のプログラミング言語において遭遇する可能性が高い課題に対する推奨解決策を示すものである。本項の内容は参考（Informative）であるが、ここに示されたパターンに従うことで、附属書 A（規定）の禁止事項への抵触を効果的に防ぐことができる。

#### **D.1 TypeScript/JavaScript 実装リファレンス** {#d.1-typescript/javascript-実装リファレンス}

JavaScript (ECMAScript) および TypeScript 環境において HACE を実装する場合、言語の動的な特性や標準ライブラリの非決定的な挙動を封じ込めるため、以下の実装パターンを採用することを強く推奨する。

**D.1.1 コンパイラ設定と環境 (Compiler Options)**

意図しない型変換や暗黙の `any` を防ぎ、コードの安全性を静的に保証するため、`tsconfig.json` には以下の設定を必須とすべきである。

{

  "compilerOptions": {

    "target": "ES2022",

    "lib": \["ES2022", "DOM"\],

    "strict": true,

    "noImplicitReturns": true,

    "noFallthroughCasesInSwitch": true,

    "useUnknownInCatchVariables": true,

    "exactOptionalPropertyTypes": true,

    "noImplicitOverride": true

  }

}

**D.1.2 安全なプロパティアクセス (Safe Property Access)**

NAP-24（Getter発火の禁止）および NAP-25（プロトタイプ汚染対策）を遵守するため、`obj[key]` による直接アクセスを行ってはならない。必ずディスクリプタを経由して値を取得するヘルパー関数を使用する。

/\*\*

 \* Getter を起動せずにオブジェクトのプロパティ値を取得する。

 \* NAP-24, NAP-25 準拠

 \*/

function getSafeValue(target: object, key: string): unknown {

  // プロトタイプチェーンを遡らず、Own Property のみを確認

  const desc \= Object.getOwnPropertyDescriptor(target, key);

  if (\!desc) {

    return undefined; // プロパティが存在しない

  }

  // データディスクリプタ（valueを持つ）場合のみ値を返す

  if ('value' in desc) {

    return desc.value;

  }

  // アクセサディスクリプタ（get/set）の場合は無視（仕様により副作用防止のため）

  // 必要に応じて Error\_Lock をトリガーする設計も可

  return undefined;

}

**D.1.3 浮動小数点数の正規化書き込み (Canonical Float Encoding)**

NAP-14（NaN非正規化の禁止）および NAP-25（-0の同一視禁止）に対処するため、`DataView` への書き込み前にビット操作による正規化を行う。

const CANONICAL\_NAN\_HI \= 0x7ff80000;

const CANONICAL\_NAN\_LO \= 0x00000000;

/\*\*

 \* IEEE 754 Binary64 として正規化して書き込む。

 \* Big-Endian 固定。

 \*/

function writeCanonicalFloat64(view: DataView, offset: number, value: number): void {

  // 1\. NaN の正規化 (NAP-14)

  if (Number.isNaN(value)) {

    view.setUint32(offset, CANONICAL\_NAN\_HI, false);     // Big-Endian

    view.setUint32(offset \+ 4, CANONICAL\_NAN\_LO, false); // Big-Endian

    return;

  }

  // 2\. 負のゼロ (-0) の保存 (NAP-25)

  if (value \=== 0 && (1 / value) \=== \-Infinity) {

    view.setFloat64(offset, \-0.0, false); // \-0.0 を明示

    return;

  }

  // 3\. 通常の数値

  view.setFloat64(offset, value, false);

}

**D.1.4 UTF-8 厳密検証 (Strict UTF-8 Validation)**

NAP-16（TextEncoderの盲信禁止）に対処するため、エンコード前に孤立サロゲート（Lone Surrogate）を検出する。`TextEncoder` は不正シーケンスを置換文字（）に置き換えてしまうため、これを使用する前に検証が必要である。

/\*\*

 \* 文字列が正当な Unicode スカラー値のみで構成されているか検証する。

 \* 孤立サロゲートが含まれる場合は false を返す。

 \*/

function validateString(str: string): boolean {

  for (let i \= 0; i \< str.length; i++) {

    const code \= str.charCodeAt(i);

    // High Surrogate (0xD800 \- 0xDBFF)

    if (code \>= 0xD800 && code \<= 0xDBFF) {

      const next \= str.charCodeAt(i \+ 1);

      // 次が Low Surrogate (0xDC00 \- 0xDFFF) でなければエラー

      if (next \>= 0xDC00 && next \<= 0xDFFF) {

        i++; // ペアをスキップ

      } else {

        return false; // 孤立した High Surrogate

      }

    }

    // Low Surrogate が単独で出現 (0xDC00 \- 0xDFFF)

    else if (code \>= 0xDC00 && code \<= 0xDFFF) {

      return false;

    }

  }

  return true;

}

**D.1.5 決定論的ソート (Deterministic Sort)**

NAP-06（sort()の直接使用禁止）に対処するため、バイト列比較（`memcmp` 相当）を用いた比較関数を実装する。

/\*\*

 \* 2つの Uint8Array を辞書順で比較する。

 \* \-1: a \< b, 0: a \== b, 1: a \> b

 \*/

function compareBytes(a: Uint8Array, b: Uint8Array): number {

  const len \= Math.min(a.length, b.length);

  for (let i \= 0; i \< len; i++) {

    if (a\[i\] \< b\[i\]) return \-1;

    if (a\[i\] \> b\[i\]) return 1;

  }

  // 長さによる比較（短い方が小さい）

  if (a.length \< b.length) return \-1;

  if (a.length \> b.length) return 1;

  return 0;

}

// 使用例:

// keys.sort((a, b) \=\> compareBytes(a.canonicalBinary, b.canonicalBinary));

**D.1.6 バイナリアリーナによるメモリ管理 (Binary Arena)**

大量の `Uint8Array` 生成による GC ストームを防ぐため（参照: 5.3.1）、固定長バッファを用いたアロケータを使用する。

class BinaryArena {

  private buffer: Uint8Array;

  private offset: number \= 0;

  constructor(size: number \= 16 \* 1024 \* 1024\) { // デフォルト 16MB

    this.buffer \= new Uint8Array(size);

  }

  /\*\*

   \* バッファの一部を切り出す（コピーは発生しない）。

   \* 返却されるのはビュー（Subarray）であり、書き込み可能。

   \*/

  alloc(length: number): Uint8Array {

    if (this.offset \+ length \> this.buffer.length) {

      throw new Error("Arena Overflow: Use Error\_Lock");

    }

    const slice \= this.buffer.subarray(this.offset, this.offset \+ length);

    this.offset \+= length;

    return slice;

  }

  /\*\* セッション終了時にリセットして再利用する \*/

  reset(): void {

    this.offset \= 0;

  }

}

#### **D.2 Rust/C++ 移植時の注意点とメモリモデル** {#d.2-rust/c++-移植時の注意点とメモリモデル}

HACE エンジンを Rust や C++ などのシステムプログラミング言語へ移植する場合、JavaScript ランタイムでは隠蔽されていた低レイヤーの非決定性要因（メモリアドレス、エンディアン、未定義動作）が表面化する。実装者は以下の指針に従い、ハードウェアやコンパイラに依存しない決定論的動作を保証しなければならない。

**D.2.1 メモリアドレス非依存性 (Memory Address Independence)**

NAP-23（メモリアドレスによる比較禁止）は、ASLR（Address Space Layout Randomization）が標準化された現代の OS 上で動作するネイティブアプリにおいて、最も違反しやすい項目である。

* **ポインタの扱い:** ポインタ（`*const T` / `void*`）や参照のアドレス値は、**「同一性判定（Equality Check）」**（そのオブジェクトを既に訪問したか？）のためにのみ使用が許可される。  
  * **禁止:** `std::set<Node*>` (C++) や `BTreeMap<*const Node, ...>` (Rust) のように、ポインタの大小比較（`<`）をキーの順序決定に使用すること。ポインタのアドレスは実行ごとに異なるため、出力順序が非決定的となる。  
  * **推奨:** ポインタをキー、一意の整数 ID（TempID）を値とするハッシュマップ（Rust: `HashMap`, C++: `std::unordered_map`）を使用し、順序決定にはこの ID または正規化されたコンテンツを使用する。

**D.2.2 コンテナの決定論的走査 (Deterministic Container Traversal)**

標準ライブラリのコンテナは、HACE が要求する「正規化順序（Canonical Sort Order）」とは異なる順序で要素を保持・列挙する場合がある。

* **ハッシュマップ (Rust `HashMap`, C++ `std::unordered_map`):** 内部ハッシュ関数やシード値（Rust の `RandomState` 等）により、イテレーション順序は非決定的である。

  * **対策:** Phase 1 において、必ず全エントリをベクタに抽出し、HACE の比較ロジック（`memcmp` 相当）でソートしてから処理を行うこと。  
* **順序付きマップ (C++ `std::map`, Rust `BTreeMap`):** これらはキーの `operator<` や `Ord` トレイトに基づいてソートするが、キーが「比較用バイナリ（Canonical Comparison Binary）」でない限り、HACE の順序とは一致しない可能性がある。

  * **対策:** コンテナのデフォルトソートに依存せず、常に明示的な正規化ソート工程を経ること。

**D.2.3 数値型の厳密な扱いとエンディアン (Strict Numeric Handling)**

HACE のバイナリ仕様は **Big-Endian** で統一されているが、多くのホスト CPU（x86\_64, AArch64）は Little-Endian である。

* **エンディアン変換:** 数値の書き込み時は、必ずホストのエンディアンから Big-Endian への変換を行うこと。

  * **Rust:** `val.to_be_bytes()` を使用する。  
  * **C++:** `htobe64()` (Linux/BSD) や `_byteswap_uint64` (MSVC)、または C++20 `std::endian` を用いた手動変換を行う。  
* **浮動小数点数のビットキャスト:** NAP-14 および NAP-25 準拠のため、浮動小数点数は一度整数型（`u64` / `uint64_t`）にビットキャストし、マスク処理を行ってから書き込む必要がある。

  * **Rust:** `f64::to_bits()` を使用し、正規化ロジックを通す。  
  * **C++:** `std::bit_cast<uint64_t>(double)` (C++20) または `memcpy` を使用する。`reinterpret_cast` は Type Punning による未定義動作（Undefined Behavior）のリスクがあるため避けることが望ましい。  
* **シフト演算の符号:** C++ において符号付き整数に対する右シフト（`>>`）は実装依存（算術シフトが多い）である。必ず `unsigned` 型にキャストしてからシフトを行い、論理シフト（ゼロ埋め）を保証すること（参照: B.2）,。

**D.2.4 安全な再帰とエラー処理 (Safe Recursion & Error Handling)**

システム言語ではスタックオーバーフローはプロセスのアボート（Segfault / Panic）を招き、HACE が求める「制御された `Error_Lock` への遷移」を阻害する。

* **手動スタック管理:** NAP-18 に従い、再帰呼び出しの深さは物理スタックではなく、ヒープ上のカウンタで管理する。C++ や Rust のコンパイラ最適化（末尾再帰最適化など）に依存してはならない。

* **Result / Optional の活用:** エラー発生時、C++ の例外（Exception）や Rust の `panic!` は、デストラクタの実行やリソースのクリーンアップにおいて複雑性を生む。可能な限り `Result<T, ErrorLock>` (Rust) や `std::optional<T>` / `std::expected` (C++) を用いて、エラー状態を値として伝播させ、最上位の Facade で原子的停止を処理することを推奨する。

**D.2.5 文字列エンコーディング (String Encoding)**

* **Rust:** Rust の `String` および `str` は常に有効な UTF-8 であることが保証されているため、追加の検証コストは低い。ただし、FFI (Foreign Function Interface) 経由で外部から文字列を受け取る場合は検証が必要である。

* **C++:** `std::string` は単なるバイト列であり、エンコーディングを保証しない。入力された文字列が UTF-8 として妥当か、不正なサロゲートペアを含んでいないかを、NAP-16 に従い自前で検証（スキャン）する必要がある。ライブラリ（ICU等）を使用する場合でも、その挙動が HACE の仕様（置換せず `Error_Lock`）と一致するか確認すること。

#### **D.3 HACE プロジェクト推奨ディレクトリ構成** {#d.3-hace-プロジェクト推奨ディレクトリ構成}

HACE v56.2 準拠の実装を行う際、アーキテクチャ上の責務分離（Layered Architecture）と検証基盤（Verification Infrastructure）を物理的なファイル構成に反映させることが推奨される。以下に、TypeScript/JavaScript 実装における標準的なディレクトリ構成を示す。

この構成は、Safety Kernel の独立性、レイヤー間の依存方向の強制、および Chaos Determinism Suite (CDS) などの検証ツールの統合を容易にするよう設計されている。

/project-root  
├── /spec                     \# 規格・仕様書関連（Source of Truth）  
│   ├── normative\_anti\_patterns.md  \# 実装禁止事項26選 (NAP)  
│   ├── v56\_3\_axioms.md             \# 公理定義 (The Frozen Monolith)  
│   └── /reference\_impl             \# Executable Spec (Python参照実装)  
│       └── hace\_ref.py             \# 最適化なしの「動く仕様書」  
│  
├── /src  
│   └── /hace                 \# HACE エンジン本体  
│       ├── /kernel           \# L0: Safety Kernel (依存なし・最重要)  
│       │   ├── session.ts    \# HACESession, Error\_Lock管理  
│       │   ├── limits.ts     \# U53, Depth Guards定数  
│       │   └── arithmetic.ts \# Checked Add/Inc (U53境界チェック)  
│       │  
│       ├── /l1\_codec         \# L1: Serialization (Format Definition)  
│       │   ├── float.ts      \# IEEE754 Canonicalizer (NaN/-0正規化)  
│       │   ├── utf8.ts       \# Strict UTF-8 Validator (Atomic Halt)  
│       │   ├── bigint.ts     \# ASCII Decimal Encoder  
│       │   └── tlv.ts        \# Tuple Builder (Tag-Length-Value)  
│       │  
│       ├── /l2\_5\_infra       \# L2.5: Comparison Infra (Determinism Logic)  
│       │   ├── comparator.ts \# memcmp, Canonical Comparison  
│       │   ├── grammar.ts    \# Comparison Stream Grammar (CCS)  
│       │   └── identity.ts   \# TraversalIdentityAllocator (WeakMap隠蔽)  
│       │  
│       ├── /l2\_core          \# L2: Normalization Logic (The Algorithms)  
│       │   ├── phase1.ts     \# Structural Analyzer (Sort & Cycle Check)  
│       │   └── phase2.ts     \# Definition Emitter (DFS & ID Assign)  
│       │  
│       ├── /runtime          \# 実行環境アダプタ (Visualizer/Worker/Memory)  
│       │   ├── worker.ts     \# Worker Entry Point  
│       │   ├── arena.ts      \# Binary Arena / Slab Allocator  
│       │   ├── abort.ts      \# AbortControllerHACE  
│       │   └── protocol.ts   \# Worker Message Types  
│       │  
│       └── facade.ts         \# L3: Public API Boundary (Pure Function)  
│  
├── /tests  
│   ├── /unit                 \# 単体テスト (Kernel, Encoders)  
│   ├── /ccs                  \# Canonical Compliance Suite (JSON Vectors)  
│   │   ├── nan\_edges.json  
│   │   ├── cycles.json  
│   │   └── unicode\_boundaries.json  
│   │  
│   ├── /cds                  \# Chaos Determinism Suite (破壊的テスト)  
│   │   ├── /mutators         \# Property Shuffle, GC Timing Injection  
│   │   └── runner.ts         \# Chaos Runner  
│   │  
│   └── /differential         \# Differential Fuzzer (vs RefImpl)  
│       ├── generator.ts      \# Spec-Aware Graph Generator  
│       └── oracle.ts         \# Bitwise Comparison Oracle  
│  
└── tsconfig.json             \# strict: true, target: ES2022

**構成のポイント:**

1. **/kernel の独立性:** `kernel` ディレクトリは他のディレクトリからのインポートを一切持ってはならない。これにより、循環参照と状態汚染を物理的に防ぎ、Safety Kernel が「最小特権」で動作することを保証する。

2. **/l2\_5\_infra の分離:** 比較ロジック（Phase 1 用）と出力ロジック（Phase 2 用）の混同を防ぐため、比較専用のコンポーネント（Comparator, CCS Grammar）を独立させている。ここにあるコードは `l2_core` からのみ参照され、`l1_codec` の出力用エンコーダとは区別される。

3. **/runtime の明示:** メモリ管理（Arena）や非同期制御（Worker）、Abort処理といった「物理的な制約・副作用」を扱うコードを、純粋な論理コア（`/l2_core`）から分離している。これにより、論理の正しさと実行基盤の堅牢性を個別に検証可能とする。

4. **検証基盤の統合:** `/tests` 配下に CCS (適合性テスト), CDS (カオス・決定性テスト), Differential Fuzzer (差分検証) を配置し、CI パイプラインでの自動検証を前提とした構成としている。これにより、「仕様変更によるデグレ」を即座に検知する。

