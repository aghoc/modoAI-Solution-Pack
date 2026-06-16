import type { SolutionDetail, SolutionIndex } from "../types";

export async function fetchSolutionIndex(): Promise<SolutionIndex> {
  const response = await fetch("/data/index.min.json");

  if (!response.ok) {
    throw new Error("솔루션 인덱스를 불러오지 못했습니다.");
  }

  return response.json() as Promise<SolutionIndex>;
}

export async function fetchPack(fileName: string): Promise<string> {
  const response = await fetch(`/packs/${fileName}`);

  if (!response.ok) {
    throw new Error("솔루션팩을 불러오지 못했습니다.");
  }

  return response.text();
}

export async function fetchSolutionDetail(id: string): Promise<SolutionDetail> {
  const response = await fetch(`/data/details/${id}.json`);

  if (!response.ok) {
    throw new Error("솔루션 상세 정보를 불러오지 못했습니다.");
  }

  return response.json() as Promise<SolutionDetail>;
}

export async function copyText(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
}
