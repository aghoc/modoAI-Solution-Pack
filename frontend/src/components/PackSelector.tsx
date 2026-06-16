import {
  Boxes,
  FileStack,
  FolderKanban,
  HelpCircle,
  Lightbulb,
  Megaphone,
  MonitorUp,
  Presentation,
  Rocket,
  SearchCheck,
  ShieldCheck,
  Target,
  Video
} from "lucide-react";
import { useEffect, useRef } from "react";
import type { PackDefinition, PackMode } from "../types";

interface PackOption extends PackDefinition {
  solutionCount: number;
}

interface PackSelectorProps {
  mode: PackMode;
  onModeChange: (mode: PackMode) => void;
  options: PackOption[];
  onSelect: (id: string) => void;
}

const modeTabs: Array<{ id: PackMode; label: string; icon: typeof Target }> = [
  { id: "goal", label: "목표별", icon: Target },
  { id: "category", label: "카테고리별", icon: FolderKanban },
  { id: "all", label: "종합", icon: FileStack }
];

const iconMap: Record<string, typeof Target> = {
  "business-plan": Lightbulb,
  "market-research": SearchCheck,
  "mvp-landing": Rocket,
  branding: Megaphone,
  "ir-pitchdeck": Presentation,
  "patent-ip": ShieldCheck,
  "video-content": Video,
  "not-sure": HelpCircle,
  "planning-research": SearchCheck,
  "marketing-content": Megaphone,
  "management-backoffice": Boxes,
  "db-solution-design": MonitorUp,
  productivity: Target,
  etc: HelpCircle,
  all: FileStack
};

export function PackSelector({
  mode,
  onModeChange,
  options,
  onSelect
}: PackSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 스크롤로 탭이 변경되는 로직 제거 (클릭으로만 변경)
  const handleTabClick = (tabId: PackMode) => {
    onModeChange(tabId);
  };

  return (
    <section className="section-block pack-showcase-section" id="picker" aria-labelledby="picker-title">
      <div 
        className="pack-scroll-container" 
        ref={containerRef}
        style={{ height: "150vh", position: "relative" }}
      >
        <div className="pack-sticky-content">
          <div className="section-heading">
            <p className="eyebrow">Solution Pack</p>
            <h2 id="picker-title">지금 해결하고 싶은 문제를 골라주세요.</h2>
          </div>

          <div className="segmented-control" role="tablist" aria-label="솔루션팩 유형">
            {modeTabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  className={mode === tab.id ? "is-active" : ""}
                  type="button"
                  role="tab"
                  aria-selected={mode === tab.id}
                  onClick={() => handleTabClick(tab.id)}
                >
                  <Icon size={17} aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className={`pack-grid pack-grid--${mode}`}>
            {options.map((option) => {
              const Icon = iconMap[option.id] ?? Target;

              return (
                <button
                  key={option.id}
                  className={`pack-card accent-${option.accent}`}
                  type="button"
                  onClick={() => onSelect(option.id)}
                >
                  <span className="pack-card__icon">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="pack-card__title">{option.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
