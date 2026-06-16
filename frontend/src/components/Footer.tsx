import { PackageCheck } from "lucide-react";

interface FooterProps {
  generatedAtLabel: string;
}

const footerColumns = [
  {
    heading: "솔루션팩",
    links: [
      { label: "목표별 / 카테고리별", href: "#picker" },
      { label: "전체 요약본 다운로드", href: "/packs/all-summary.md", download: true }
    ]
  },
  {
    heading: "원본 자료",
    links: [
      { label: "모두의창업 솔루션 목록", href: "https://www.modoo.or.kr/ai-solution/list", external: true }
    ]
  }
];

export function Footer({ generatedAtLabel }: FooterProps) {
  return (
    <footer className="site-footer" id="policy">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-mark">
              <PackageCheck size={18} aria-hidden="true" />
              AI 솔루션팩
            </span>
            <p>
              모두의창업 1라운드 선정자가 솔루션 탐색의 막막함을 해결하고자 직접 만든 도구입니다.
              어떠한 상업적 목적(수익 창출, 홍보, 광고 등) 없이 다른 대표님들께 순수하게 도움을 드리기 위해 제작되었습니다.
            </p>
          </div>

          <div className="footer-columns">
            {footerColumns.map((column) => (
              <div className="footer-group" key={column.heading}>
                <p className="footer-heading">{column.heading}</p>
                {column.links.map((link) => (
                  <a
                    key={link.label}
                    className="footer-link"
                    href={link.href}
                    {...("download" in link && link.download ? { download: true } : {})}
                    {...("external" in link && link.external
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="footer-meta">
          <span>
            Developed by Eunho Choi · <a href="mailto:aghochoi@gmail.com">aghochoi@gmail.com</a>
            <br />
            © {new Date().getFullYear()} Eunho Choi. All rights reserved.
          </span>
          <span>데이터 갱신: {generatedAtLabel}</span>
        </div>
      </div>
    </footer>
  );
}
