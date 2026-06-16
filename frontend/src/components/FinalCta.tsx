import { Github, Sparkles } from "lucide-react";

export function FinalCta() {
  return (
    <section className="final-cta" aria-labelledby="final-cta-title">
      <span className="final-cta__symbol" aria-hidden="true">
        <Sparkles size={28} />
      </span>
      <h2 id="final-cta-title">
        귀중한 AI 솔루션,
        <br />
        나에게 꼭 맞는 곳에 쓰세요.
      </h2>
      <p>수많은 솔루션 속에서 헤매지 마세요. 지금 바로 내게 필요한 후보를 좁혀보세요.</p>
      <div className="final-cta__actions">
        <a 
          className="btn" 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ backgroundColor: "#24292e", color: "#fff", border: "none" }}
        >
          <Github size={18} aria-hidden="true" style={{ marginRight: "4px" }} />
          크롤링 스크립트
        </a>
        <a className="final-cta__link" href="/packs/all-summary.md" download>
          전체 요약본 다운로드
        </a>
      </div>
    </section>
  );
}
