import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Database, FileText, Mic, Plus, Send, ShieldCheck } from "lucide-react";

interface HeroProps {
  total: number;
  generatedAtLabel: string;
}

const TYPING_TEXT = "내 사업 아이디어에 맞는 솔루션 3개를 추천해줘";

type AnimPhase =
  | "idle"
  | "cursor-to-plus"
  | "click-plus"
  | "file-appear"
  | "typing"
  | "type-done"
  | "cursor-to-send"
  | "click-send"
  | "sent";

export function Hero({ total, generatedAtLabel }: HeroProps) {
  const [phase, setPhase] = useState<AnimPhase>("idle");
  const [typedLen, setTypedLen] = useState(0);
  const [showFile, setShowFile] = useState(false);

  // Single-effect animation timeline that self-loops
  useEffect(() => {
    let cancelled = false;
    let currentCycle = 0;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let typingInterval: ReturnType<typeof setInterval> | null = null;

    const sched = (cycle: number, fn: () => void, ms: number) => {
      timeouts.push(
        setTimeout(() => {
          if (!cancelled && cycle === currentCycle) fn();
        }, ms)
      );
    };

    const runCycle = () => {
      currentCycle += 1;
      const cycle = currentCycle;

      if (typingInterval) {
        clearInterval(typingInterval);
        typingInterval = null;
      }

      setPhase("idle");
      setTypedLen(0);
      setShowFile(false);

      // Cursor moves to + button
      sched(cycle, () => setPhase("cursor-to-plus"), 600);

      // Click + button
      sched(cycle, () => setPhase("click-plus"), 1500);

      // File chip appears
      sched(cycle, () => {
        setPhase("file-appear");
        setShowFile(true);
      }, 1800);

      // Start typing
      sched(cycle, () => {
        setPhase("typing");
        let charIndex = 0;

        typingInterval = setInterval(() => {
          if (cancelled || cycle !== currentCycle) {
            if (typingInterval) clearInterval(typingInterval);
            return;
          }

          charIndex += 1;
          setTypedLen(charIndex);

          if (charIndex >= TYPING_TEXT.length) {
            if (typingInterval) clearInterval(typingInterval);
            typingInterval = null;

            // After typing done: move cursor → click send → pause → loop
            sched(cycle, () => setPhase("type-done"), 500);
            sched(cycle, () => setPhase("cursor-to-send"), 800);
            sched(cycle, () => setPhase("click-send"), 1700);
            sched(cycle, () => setPhase("sent"), 2000);
            sched(cycle, () => runCycle(), 3600);
          }
        }, 80);
      }, 2400);
    };

    runCycle();

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
      if (typingInterval) clearInterval(typingInterval);
    };
  }, []);

  const displayText = TYPING_TEXT.slice(0, typedLen);

  const showTypedText =
    phase === "typing" ||
    phase === "type-done" ||
    phase === "cursor-to-send" ||
    phase === "click-send" ||
    phase === "sent";

  const cursorAt =
    phase === "cursor-to-plus" || phase === "click-plus" || phase === "file-appear"
      ? "plus"
      : phase === "cursor-to-send" || phase === "click-send"
        ? "send"
        : null;

  const isClicking = phase === "click-plus" || phase === "click-send";

  return (
    <section className="hero" id="top">
      <div className="hero__copy">
        <p className="eyebrow">모두의 창업 1기 1라운드</p>
        <h1>
          수많은 AI 솔루션,
          <br />
          내 사업 고도화에 딱 맞는 건 뭘까?
        </h1>
        <p className="hero__description">
          AI 솔루션은 많은데, 지금 나에게 필요한게 뭔지 막막하시죠? 나에게 필요한 솔루션을 AI에게 물어볼 수 있게 해드립니다.
        </p>
        <div className="hero__actions">
          <a className="btn btn-primary" href="#picker">
            내게 맞는 솔루션 찾기
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="hero-visual" aria-label="AI 채팅에 솔루션팩 사용 예시">
        <div className="ai-chat-mock">
          {/* Animated cursor */}
          <div
            className={`anim-cursor${cursorAt ? ` anim-cursor--visible anim-cursor--at-${cursorAt}` : ""}${isClicking ? " anim-cursor--clicking" : ""}`}
            aria-hidden="true"
          >
            <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
              <path
                d="M2 1L2 18.5L6.5 14L10.5 21.5L13 20L9 12.5L15.5 11.5Z"
                fill="white"
                stroke="#333d4b"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Header */}
          <div className="ai-chat-mock__header">
            <span className="ai-chat-mock__title">오늘은 무슨 이야기를 할까요?</span>
          </div>

          {/* Input area */}
          <div className="ai-chat-mock__input-area">
            {/* Attached file chip — always render container to preserve space */}
            <div className="ai-chat-mock__attachment">
              {showFile && (
                <div className="ai-chat-mock__file-chip anim-slide-in">
                  <FileText size={16} aria-hidden="true" />
                  <span>goal-business-plan.md</span>
                </div>
              )}
            </div>

            {/* Input bar */}
            <div className="ai-chat-mock__input-bar">
              <button
                className={`ai-chat-mock__plus-btn${phase === "click-plus" ? " is-pressed" : ""}`}
                type="button"
                tabIndex={-1}
                aria-label="파일 추가"
              >
                <Plus size={20} aria-hidden="true" />
              </button>

              {showTypedText ? (
                <span className="ai-chat-mock__typed-text">
                  {displayText}
                  {phase === "typing" && <span className="typing-caret" />}
                </span>
              ) : (
                <span className="ai-chat-mock__placeholder">무엇이든 물어보세요</span>
              )}

              <div className="ai-chat-mock__right-actions">
                <button className="ai-chat-mock__icon-btn" type="button" tabIndex={-1} aria-label="음성 입력">
                  <Mic size={18} aria-hidden="true" />
                </button>
                <button
                  className={`ai-chat-mock__send-btn${phase === "click-send" ? " is-pressed" : ""}`}
                  type="button"
                  tabIndex={-1}
                  aria-label="전송"
                >
                  <Send size={18} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* Usage hint chips */}
          <div className="ai-chat-mock__hints">
            <span>📋 솔루션팩 복사 → AI에 붙여넣기</span>
            <span>📎 파일 다운로드 → AI에 업로드</span>
            <span>💬 내 아이디어 설명 → 추천 받기</span>
          </div>
        </div>

        <dl className="hero__stats" aria-label="데이터 현황">
          <div>
            <dt>솔루션</dt>
            <dd>{total.toLocaleString("ko-KR")}개</dd>
          </div>
          <div>
            <dt>데이터</dt>
            <dd>마크다운 파일</dd>
          </div>
          <div>
            <dt>갱신</dt>
            <dd>{generatedAtLabel}</dd>
          </div>
        </dl>

        <div className="hero-visual__checks">
          <span>
            <ShieldCheck size={16} aria-hidden="true" />
            2라운드 평가 대비
          </span>
          <span>
            <Database size={16} aria-hidden="true" />
            407개 등록 솔루션 압축
          </span>
          <span>
            <CheckCircle2 size={16} aria-hidden="true" />
            내 AI에 바로 질문
          </span>
        </div>
      </div>
    </section>
  );
}
