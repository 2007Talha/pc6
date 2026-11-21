import type { GuidanceResult } from '../types/index.ts';

/**
 * Formats structured guidance result into clean plain-text for clipboard copying.
 * @param r - The complete guidance result payload
 * @returns Plain text representation
 */
export function formatResultsAsText(r: GuidanceResult): string {
  let text = `VayuShield Guidance\n${'='.repeat(40)}\n\n${r.summary}\n\n`;
  text += `Daily Routine\n${'-'.repeat(20)}\n`;
  for (const b of r.dailyRoutine) {
    text += `${b.icon} ${b.time} — ${b.activity}: ${b.reason}\n`;
  }
  text += `\nIndoor Air Quality Hacks\n${'-'.repeat(20)}\n`;
  for (const h of r.iaqHacks) {
    text += `[${h.priority.toUpperCase()}] ${h.title}\n`;
    for (const s of h.steps) text += `  • ${s}\n`;
  }
  text += `\nSustainable Alternatives\n${'-'.repeat(20)}\n`;
  for (const a of r.sustainableAlternatives) {
    text += `${a.icon} ${a.category}: ${a.current} → ${a.alternative} (${a.benefit})\n`;
  }
  text += `\nImpact\n${'-'.repeat(20)}\n`;
  text += `PM2.5 Reduction: ~${r.impactMetrics.pm25ReductionPercent}%\n`;
  text += `Weekly CO₂e Avoided: ~${r.impactMetrics.weeklyCo2eAvoidedKg} kg\n`;
  text += `Health: ${r.impactMetrics.healthBenefit}\n`;
  text += `Community: ${r.impactMetrics.communityBenefit}\n`;
  return text;
}

/**
 * Formats structured guidance result into GitHub-Flavored Markdown for file export.
 * @param r - The complete guidance result payload
 * @returns Markdown document string
 */
export function formatResultsAsMarkdown(r: GuidanceResult): string {
  let md = `# VayuShield Guidance\n\n> ${r.summary}\n\n`;
  md += `## 🕐 Low-Emission Daily Routine\n\n`;
  md += `| Time | Activity | Why |\n|------|----------|-----|\n`;
  for (const b of r.dailyRoutine) {
    md += `| ${b.icon} ${b.time} | ${b.activity} | ${b.reason} |\n`;
  }
  md += `\n## 🏠 Indoor Air Quality Hacks\n\n`;
  for (const h of r.iaqHacks) {
    md += `### ${h.title} (${h.priority} priority)\n\n`;
    for (const s of h.steps) md += `- ${s}\n`;
    md += '\n';
  }
  md += `## 🌱 Sustainable Alternatives\n\n`;
  for (const a of r.sustainableAlternatives) {
    md += `- ${a.icon} **${a.category}**: ${a.current} → ${a.alternative} — *${a.benefit}*\n`;
  }
  md += `\n## 📊 Quantified Impact\n\n`;
  md += `- **PM2.5 Reduction**: ~${r.impactMetrics.pm25ReductionPercent}%\n`;
  md += `- **Weekly CO₂e Avoided**: ~${r.impactMetrics.weeklyCo2eAvoidedKg} kg\n`;
  md += `- **Health**: ${r.impactMetrics.healthBenefit}\n`;
  md += `- **Community**: ${r.impactMetrics.communityBenefit}\n\n`;
  md += `> ${r.impactMetrics.explanation}\n`;
  return md;
}
