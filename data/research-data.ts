export interface Paper {
  year: number;
  venue: string;
  title: string;
  url: string;
}

export const papers: Paper[] = [
  {
    year: 2026,
    venue: "TMLR",
    title: "The Landscape of Agentic Reinforcement Learning for LLMs: A Survey",
    url: "https://openreview.net/forum?id=RY19y2RI1O",
  },
  {
    year: 2025,
    venue: "TMLR",
    title:
      "HoSNNs: Adversarially-Robust Homeostatic Spiking Neural Networks with Adaptive Firing Thresholds",
    url: "https://openreview.net/forum?id=UV58hNygne",
  },
  {
    year: 2025,
    venue: "EMNLP",
    title:
      "ReSo: A Reward-driven Self-organizing LLM-based Multi-Agent System for Reasoning Tasks",
    url: "https://doi.org/10.18653/v1/2025.emnlp-main.808",
  },
  {
    year: 2025,
    venue: "arXiv",
    title:
      "ReSo: A Reward-driven Self-organizing LLM-based Multi-Agent System for Reasoning Tasks",
    url: "https://doi.org/10.48550/arXiv.2503.02390",
  },
  {
    year: 2025,
    venue: "arXiv",
    title:
      "Khan-GCL: Kolmogorov-Arnold Network Based Graph Contrastive Learning with Hard Negatives",
    url: "https://doi.org/10.48550/arXiv.2505.15103",
  },
  {
    year: 2025,
    venue: "arXiv",
    title:
      "The Landscape of Agentic Reinforcement Learning for LLMs: A Survey",
    url: "https://doi.org/10.48550/arXiv.2509.02547",
  },
  {
    year: 2025,
    venue: "arXiv",
    title:
      "Diagnose, Localize, Align: A Full-Stack Framework for Reliable LLM Multi-Agent Systems under Instruction Conflicts",
    url: "https://doi.org/10.48550/arXiv.2509.23188",
  },
  {
    year: 2025,
    venue: "arXiv",
    title:
      "Beyond Magic Words: Sharpness-Aware Prompt Evolving for Robust Large Language Models with TARE",
    url: "https://doi.org/10.48550/arXiv.2509.24130",
  },
  {
    year: 2025,
    venue: "arXiv",
    title:
      "Scaling Behaviors of LLM Reinforcement Learning Post-Training: An Empirical Study in Mathematical Reasoning",
    url: "https://doi.org/10.48550/arXiv.2509.25300",
  },
  {
    year: 2025,
    venue: "arXiv",
    title:
      "LiveSearchBench: An Automatically Constructed Benchmark for Retrieval and Reasoning over Dynamic Knowledge",
    url: "https://doi.org/10.48550/arXiv.2511.01409",
  },
  {
    year: 2024,
    venue: "arXiv",
    title:
      "DS2TA: Denoising Spiking Transformer with Attenuated Spatiotemporal Attention",
    url: "https://doi.org/10.48550/arXiv.2409.15375",
  },
  {
    year: 2024,
    venue: "Frontiers in Neuroscience",
    title:
      "Composing Recurrent Spiking Neural Networks using Locally-Recurrent Motifs and Risk-Mitigating Architectural Optimization",
    url: "https://pubmed.ncbi.nlm.nih.gov/38966757/",
  },
  {
    year: 2023,
    venue: "arXiv",
    title:
      "HoSNN: Adversarially-Robust Homeostatic Spiking Neural Networks with Adaptive Firing Thresholds",
    url: "https://doi.org/10.48550/arXiv.2308.10373",
  },
  {
    year: 2023,
    venue: "arXiv",
    title:
      "UPAR: A Kantian-Inspired Prompting Framework for Enhancing Large Language Model Capabilities",
    url: "https://doi.org/10.48550/arXiv.2310.01441",
  },
  {
    year: 2023,
    venue: "arXiv",
    title:
      "DISTA: Denoising Spiking Transformer with intrinsic plasticity and spatiotemporal attention",
    url: "https://doi.org/10.48550/arXiv.2311.09376",
  },
];

export function groupByYear(items: Paper[]): Map<number, Paper[]> {
  const map = new Map<number, Paper[]>();
  for (const p of items) {
    const list = map.get(p.year) ?? [];
    list.push(p);
    map.set(p.year, list);
  }
  return new Map([...map.entries()].sort((a, b) => b[0] - a[0]));
}
