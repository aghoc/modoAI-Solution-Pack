import { Menu, PackageCheck, X } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  onLogoClick?: () => void;
}

export function Header({ onLogoClick }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (onLogoClick) {
      e.preventDefault();
      onLogoClick();
    }
  };

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="모두의창업 AI 솔루션팩 도우미" onClick={handleLogoClick}>
        <span className="brand__mark">
          <PackageCheck size={18} aria-hidden="true" />
        </span>
        <span>AI 솔루션팩</span>
      </a>

      {/* spacer for alignment since desktop-nav is removed */}
      <div style={{ flex: 1 }} />

      <div className="header-actions">
        <a className="header-cta" href="#picker" onClick={onLogoClick ? (e) => { e.preventDefault(); onLogoClick(); } : undefined}>
          솔루션팩 시작하기
        </a>
      </div>

      <button
        className="icon-button mobile-menu-button"
        type="button"
        aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
        style={{ display: 'none' }} // Hide mobile menu button since there are no nav items
      >
        {isOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>
    </header>
  );
}
