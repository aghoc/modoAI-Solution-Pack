import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const features = [
  {
    image: "/images/step1.png",
    title: "공급업체 리스트 자동 압축",
    description: "400개가 넘는 공급업체를 일일이 찾아볼 필요 없이, 목표와 카테고리별로 쓸만한 후보만 골라드립니다."
  },
  {
    image: "/images/step2.png",
    title: "요약된 솔루션팩 바로 복사",
    description: "어떤 솔루션인지 파악하기도 벅차시죠? 요약된 '솔루션팩'을 한 번에 복사하세요."
  },
  {
    image: "/images/step3.png",
    title: "내 AI에게 묻고 최종 결정",
    description: "복사한 팩을 평소 쓰는 ChatGPT나 Claude에 붙여넣고, 내 사업 아이디어를 설명하세요. 나에게 가장 유리한 선택을 AI가 찾아줍니다."
  }
];

export function FeatureCards() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // 화면 중앙(또는 약간 위)을 기준으로 어느 섹션에 있는지 계산
      const scrollProgress = -rect.top + (viewportHeight * 0.4);
      const totalScrollable = rect.height;
      
      if (scrollProgress < 0) {
        setActiveIndex(0);
      } else if (scrollProgress >= totalScrollable) {
        setActiveIndex(features.length - 1);
      } else {
        const step = totalScrollable / features.length;
        const index = Math.floor(scrollProgress / step);
        setActiveIndex(Math.min(Math.max(index, 0), features.length - 1));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="section-block feature-showcase-section" aria-labelledby="feature-title">
      {/* 스크롤을 발생시키기 위한 빈 공간(트랙) */}
      <div 
        className="feature-scroll-container" 
        ref={containerRef}
        style={{ height: `${features.length * 80}vh`, position: "relative" }}
      >
        {/* 스크롤 시 화면에 고정되는 영역 */}
        <div className="feature-sticky-content">
          <div className="section-heading">
            <p className="eyebrow">How it works</p>
            <h2 id="feature-title">솔루션 탐색의 막막함, 이렇게 해결하세요.</h2>
          </div>

          <div className="feature-showcase">
            <div className="feature-accordion">
              {features.map((feature, index) => {
                const isActive = index === activeIndex;
                return (
                  <div 
                    key={index} 
                    className={`accordion-item ${isActive ? "is-active" : ""}`}
                  >
                    <button 
                      className="accordion-header" 
                      onClick={() => {
                        if (containerRef.current) {
                          // 브라우저 절대 좌표 계산 후 스크롤 이동
                          const absoluteTop = window.scrollY + containerRef.current.getBoundingClientRect().top;
                          const stepHeight = containerRef.current.offsetHeight / features.length;
                          window.scrollTo({ 
                            top: absoluteTop + (index * stepHeight), 
                            behavior: 'smooth' 
                          });
                        }
                        setActiveIndex(index);
                      }}
                      aria-expanded={isActive}
                    >
                      <div className="accordion-title-row">
                        <span className="accordion-step">STEP {index + 1}</span>
                        <h3 className="accordion-title">{feature.title}</h3>
                      </div>
                      <ChevronDown className="accordion-icon" size={24} />
                    </button>
                    {isActive && (
                      <div className="accordion-content">
                        <p>{feature.description}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="feature-image-panel">
              <img 
                src={features[activeIndex].image} 
                alt={`STEP ${activeIndex + 1}`} 
                className="feature-active-img" 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
