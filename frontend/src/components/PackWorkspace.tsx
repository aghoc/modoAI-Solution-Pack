import { ArrowLeft, CheckCircle2, Clipboard, Download, FileText, Loader2 } from "lucide-react";
import type { ActivePack, ContextQuality } from "../types";

type CopyStatus = "idle" | "copying" | "copied" | "failed";

interface PackWorkspaceProps {
  activePack: ActivePack;
  packText: string;
  isLoading: boolean;
  error: string | null;
  copyStatus: CopyStatus;
  onCopy: () => void;
  onBack: () => void;
  qualityCounts: Record<ContextQuality, number>;
}

function formatBytes(text: string) {
  const bytes = new Blob([text]).size;

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function PackWorkspace({
  activePack,
  packText,
  isLoading,
  error,
  copyStatus,
  onCopy,
  onBack,
  qualityCounts
}: PackWorkspaceProps) {
  const downloadHref = `/packs/${activePack.fileName}`;

  return (
    <section className="detail-page" aria-labelledby="workspace-title">
      <div className="detail-page__header">
        <button className="back-button" type="button" onClick={onBack}>
          <ArrowLeft size={18} aria-hidden="true" />
          솔루션팩 목록으로
        </button>
      </div>

      <div className="workspace-panel">
        {/* Left: Pack info + preview */}
        <div className="workspace-panel__main">
          <div className="workspace-panel__summary">
            <p className="eyebrow">{activePack.eyebrow}</p>
            <h2 id="workspace-title">{activePack.title}</h2>
            <p>{activePack.description}</p>

            <div className="workspace-metrics" aria-label="선택한 솔루션팩 정보">
              <div>
                <span>후보</span>
                <strong>{activePack.solutionCount.toLocaleString("ko-KR")}개</strong>
              </div>
              <div>
                <span>파일</span>
                <strong>{packText ? formatBytes(packText) : "-"}</strong>
              </div>
              <div>
                <span>판단 가능</span>
                <strong>{qualityCounts.sufficient.toLocaleString("ko-KR")}개</strong>
              </div>
            </div>
          </div>

          <div className="pack-preview" aria-label="솔루션팩 내용 미리보기">
            <div className="pack-preview__header">
              <span>
                <FileText size={17} aria-hidden="true" />
                {activePack.fileName}
              </span>
              <span>{activePack.solutionCount.toLocaleString("ko-KR")} solutions</span>
            </div>
            {isLoading ? (
              <div className="preview-state">
                <Loader2 className="spin" size={18} aria-hidden="true" />
                솔루션팩을 불러오는 중
              </div>
            ) : error ? (
              <div className="preview-state preview-state--error">{error}</div>
            ) : (
              <pre>{packText}</pre>
            )}
          </div>
        </div>

        {/* Right: Always-visible action sidebar */}
        <aside className="workspace-panel__sidebar">
          <div className="sidebar-actions">
            <h3 className="sidebar-actions__title">내 AI에 붙여넣기</h3>
            <p className="sidebar-actions__desc">
              아래 버튼으로 솔루션팩을 복사하거나 다운로드하세요.
            </p>

            <button
              className="btn btn-primary sidebar-btn"
              type="button"
              onClick={onCopy}
              disabled={isLoading || !packText}
            >
              {copyStatus === "copying" ? (
                <Loader2 className="spin" size={18} aria-hidden="true" />
              ) : copyStatus === "copied" ? (
                <CheckCircle2 size={18} aria-hidden="true" />
              ) : (
                <Clipboard size={18} aria-hidden="true" />
              )}
              {copyStatus === "copied" ? "복사 완료!" : "AI 입력팩 복사"}
            </button>

            <a className="btn btn-secondary sidebar-btn" href={downloadHref} download>
              <Download size={18} aria-hidden="true" />
              Markdown 다운로드
            </a>

            {copyStatus === "failed" ? (
              <p className="inline-alert">복사에 실패했습니다. 다운로드 버튼으로 파일을 받아주세요.</p>
            ) : null}
          </div>

          <div className="sidebar-info">
            <h4>사용 방법</h4>
            <ol>
              <li>위 버튼으로 팩을 복사하세요</li>
              <li>ChatGPT, Claude 등 AI에 붙여넣기</li>
              <li>내 사업 아이디어를 AI에게 직접 설명</li>
            </ol>
          </div>
        </aside>
      </div>
    </section>
  );
}
