import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { fetchPack, fetchSolutionIndex, copyText } from "./lib/api";
import { allPack, categoryPacks, goalPacks } from "./lib/catalog";
import type {
  ActivePack,
  ContextQuality,
  PackDefinition,
  PackMode,
  SolutionIndex,
  SolutionSummary
} from "./types";
import { FeatureCards } from "./components/FeatureCards";
import { FinalCta } from "./components/FinalCta";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { PackSelector } from "./components/PackSelector";
import { PackWorkspace } from "./components/PackWorkspace";

type CopyStatus = "idle" | "copying" | "copied" | "failed";
type ViewState = "main" | "detail";

function formatGeneratedAt(value?: string) {
  if (!value) {
    return "확인 중";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function countBy<T extends string>(items: T[]) {
  return items.reduce<Record<T, number>>((acc, item) => {
    acc[item] = (acc[item] ?? 0) + 1;
    return acc;
  }, {} as Record<T, number>);
}

function getQualityCounts(solutions: SolutionSummary[]): Record<ContextQuality, number> {
  return {
    sufficient: solutions.filter((solution) => solution.contextQuality === "sufficient").length,
    limited: solutions.filter((solution) => solution.contextQuality === "limited").length,
    insufficient: solutions.filter((solution) => solution.contextQuality === "insufficient").length
  };
}

export default function App() {
  const [index, setIndex] = useState<SolutionIndex | null>(null);
  const [indexError, setIndexError] = useState<string | null>(null);
  const [mode, setMode] = useState<PackMode>("goal");
  const [selectedGoalId, setSelectedGoalId] = useState(goalPacks[0].id);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryPacks[0].id);
  const [packText, setPackText] = useState("");
  const [packError, setPackError] = useState<string | null>(null);
  const [isPackLoading, setIsPackLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const [view, setView] = useState<ViewState>("main");

  useEffect(() => {
    let isMounted = true;

    fetchSolutionIndex()
      .then((nextIndex) => {
        if (isMounted) {
          setIndex(nextIndex);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setIndexError(error instanceof Error ? error.message : "데이터를 불러오지 못했습니다.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const counts = useMemo(() => {
    if (!index) {
      return {
        byGoal: {} as Record<string, number>,
        byCategory: {} as Record<string, number>
      };
    }

    return {
      byGoal: countBy(index.solutions.flatMap((solution) => solution.goals)),
      byCategory: countBy(index.solutions.map((solution) => solution.category))
    };
  }, [index]);

  const goalOptions = useMemo(
    () =>
      goalPacks.map((pack) => ({
        ...pack,
        solutionCount: counts.byGoal[pack.goalId ?? pack.id] ?? 0
      })),
    [counts.byGoal]
  );

  const categoryOptions = useMemo(
    () =>
      categoryPacks
        .map((pack) => ({
          ...pack,
          solutionCount: counts.byCategory[pack.categoryName ?? pack.title] ?? 0
        }))
        .filter((pack) => pack.solutionCount > 0),
    [counts.byCategory]
  );

  useEffect(() => {
    if (categoryOptions.length && !categoryOptions.some((option) => option.id === selectedCategoryId)) {
      setSelectedCategoryId(categoryOptions[0].id);
    }
  }, [categoryOptions, selectedCategoryId]);

  const activeDefinition: PackDefinition = useMemo(() => {
    if (mode === "all") {
      return allPack;
    }

    if (mode === "category") {
      return categoryOptions.find((pack) => pack.id === selectedCategoryId) ?? categoryOptions[0] ?? categoryPacks[0];
    }

    return goalPacks.find((pack) => pack.id === selectedGoalId) ?? goalPacks[0];
  }, [categoryOptions, mode, selectedCategoryId, selectedGoalId]);

  const activeSolutions = useMemo(() => {
    if (!index) {
      return [];
    }

    if (activeDefinition.mode === "all") {
      return index.solutions;
    }

    if (activeDefinition.mode === "category") {
      return index.solutions.filter((solution) => solution.category === activeDefinition.categoryName);
    }

    return index.solutions.filter((solution) => solution.goals.includes(activeDefinition.goalId ?? ""));
  }, [activeDefinition, index]);

  const activePack: ActivePack = useMemo(
    () => ({
      ...activeDefinition,
      solutionCount: activeSolutions.length
    }),
    [activeDefinition, activeSolutions.length]
  );

  const qualityCounts = useMemo(() => getQualityCounts(activeSolutions), [activeSolutions]);

  useEffect(() => {
    // Only fetch pack text when in detail view
    if (view !== "detail") {
      return;
    }

    let isMounted = true;
    setIsPackLoading(true);
    setPackText("");
    setPackError(null);
    setCopyStatus("idle");

    fetchPack(activePack.fileName)
      .then((text) => {
        if (isMounted) {
          setPackText(text);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setPackError(error instanceof Error ? error.message : "솔루션팩을 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsPackLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activePack.fileName, view]);

  const generatedAtLabel = formatGeneratedAt(index?.generatedAt);

  const selectorOptions =
    mode === "goal"
      ? goalOptions
      : mode === "category"
        ? categoryOptions
        : [{ ...allPack, solutionCount: index?.count ?? 0 }];

  const handleSelect = (id: string) => {
    if (mode === "goal") {
      setSelectedGoalId(id);
    } else if (mode === "category") {
      setSelectedCategoryId(id);
    }

    // Navigate to detail view
    setView("detail");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleModeChange = (nextMode: PackMode) => {
    setMode(nextMode);
  };

  const handleHome = () => {
    setView("main");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleBack = () => {
    setView("main");
    // Scroll to the pack selector section after a short delay
    window.setTimeout(() => {
      document.getElementById("picker")?.scrollIntoView({ behavior: "auto" });
    }, 50);
  };

  const handleCopy = async () => {
    if (!packText) {
      return;
    }

    setCopyStatus("copying");

    try {
      await copyText(packText);
      setCopyStatus("copied");
      window.setTimeout(() => setCopyStatus("idle"), 2200);
    } catch {
      setCopyStatus("failed");
    }
  };

  if (indexError) {
    return (
      <div className="app-shell">
        <Header onLogoClick={handleHome} />
        <main className="load-screen">
          <AlertTriangle size={24} aria-hidden="true" />
          <h1>데이터를 불러오지 못했습니다.</h1>
          <p>{indexError}</p>
        </main>
      </div>
    );
  }

  if (!index) {
    return (
      <div className="app-shell">
        <Header onLogoClick={handleHome} />
        <main className="load-screen">
          <Loader2 className="spin" size={24} aria-hidden="true" />
          <h1>솔루션 데이터를 준비하는 중</h1>
        </main>
      </div>
    );
  }

  // Detail page view
  if (view === "detail") {
    return (
      <div className="app-shell">
        <Header onLogoClick={handleHome} />
        <main>
          <PackWorkspace
            activePack={activePack}
            packText={packText}
            isLoading={isPackLoading}
            error={packError}
            copyStatus={copyStatus}
            onCopy={handleCopy}
            onBack={handleBack}
            qualityCounts={qualityCounts}
          />
        </main>
        <Footer generatedAtLabel={generatedAtLabel} />
      </div>
    );
  }

  // Main page view
  return (
    <div className="app-shell">
      <Header onLogoClick={handleHome} />
      <main>
        <Hero total={index.count} generatedAtLabel={generatedAtLabel} />
        <FeatureCards />
        <PackSelector
          mode={mode}
          onModeChange={handleModeChange}
          options={selectorOptions}
          onSelect={handleSelect}
        />
        <FinalCta />
      </main>
      <Footer generatedAtLabel={generatedAtLabel} />
    </div>
  );
}
