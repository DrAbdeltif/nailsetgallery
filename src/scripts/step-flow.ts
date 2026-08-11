// Step Flow Component Transformer (Editorial DIY Tutorials & Guides)

export function initStepFlow() {
  const preBlocks = document.querySelectorAll('.prose pre');
  preBlocks.forEach((pre) => {
    const text = pre.textContent || '';

    // Match horizontal step flow: [Step 1] ➔ [Step 2] ...
    if (text.includes('➔') || (text.includes('[') && text.includes(']'))) {
      const steps = text.split('➔').map((s) => s.trim().replace(/^\[|\]$/g, '')).filter(Boolean);
      if (steps.length > 1) {
        const container = document.createElement('div');
        container.className = 'step-flow-container';
        steps.forEach((stepText, idx) => {
          const stepCard = document.createElement('div');
          stepCard.className = 'step-flow-card';

          const badge = document.createElement('span');
          badge.className = 'step-flow-badge';
          badge.textContent = String(idx + 1);

          const content = document.createElement('span');
          content.className = 'step-flow-text';
          content.textContent = stepText;

          stepCard.append(badge, content);
          container.append(stepCard);

          if (idx < steps.length - 1) {
            const arrow = document.createElement('span');
            arrow.className = 'step-flow-arrow';
            arrow.textContent = '➔';
            arrow.setAttribute('aria-hidden', 'true');
            container.append(arrow);
          }
        });
        pre.replaceWith(container);
        return;
      }
    }

    // Match vertical step flow: Step 1 ... ↓ Step 2 ...
    if (text.includes('↓')) {
      const lines = text.split(/\n|↓/).map((s) => s.trim()).filter((s) => s && s !== '↓');
      if (lines.length > 1) {
        const container = document.createElement('div');
        container.className = 'step-flow-container step-flow-vertical';
        lines.forEach((lineText, idx) => {
          const stepCard = document.createElement('div');
          stepCard.className = 'step-flow-card';

          const badge = document.createElement('span');
          badge.className = 'step-flow-badge';
          badge.textContent = String(idx + 1);

          const content = document.createElement('span');
          content.className = 'step-flow-text';
          content.textContent = lineText.replace(/^Step \d+:\s*/i, '');

          stepCard.append(badge, content);
          container.append(stepCard);

          if (idx < lines.length - 1) {
            const arrow = document.createElement('span');
            arrow.className = 'step-flow-arrow step-flow-arrow--down';
            arrow.textContent = '↓';
            arrow.setAttribute('aria-hidden', 'true');
            container.append(arrow);
          }
        });
        pre.replaceWith(container);
      }
    }
  });
}

initStepFlow();
document.addEventListener('astro:page-load', initStepFlow);
