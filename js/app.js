/* ============================================================
   PromptGenAI — Local Prompt Engine (Zero API, Zero Internet)
   ============================================================ */

// ===== STATE =====
let selectedTone = 'professional';
let isGenerating  = false;
const MAX_CHARS   = 500;

// ===== ON LOAD =====
document.addEventListener('DOMContentLoaded', () => {
  initToneButtons();
  initCharCounter();
  checkNavScroll();
});

// ===== NAVBAR SCROLL =====
window.addEventListener('scroll', checkNavScroll);
function checkNavScroll() {
  const nav = document.getElementById('navbar');
  nav.style.background = window.scrollY > 20
    ? 'rgba(8, 11, 20, 0.97)'
    : 'rgba(8, 11, 20, 0.85)';
}

// ===== MOBILE NAV TOGGLE =====
function toggleMobileNav() {
  const btn = document.getElementById('hamburger-btn');
  const nav = document.getElementById('mobile-nav');
  btn.classList.toggle('open');
  nav.classList.toggle('open');
}
function closeMobileNav() {
  document.getElementById('hamburger-btn').classList.remove('open');
  document.getElementById('mobile-nav').classList.remove('open');
}
// Close mobile nav when clicking outside
document.addEventListener('click', (e) => {
  const btn = document.getElementById('hamburger-btn');
  const nav = document.getElementById('mobile-nav');
  if (nav?.classList.contains('open') && !nav.contains(e.target) && !btn.contains(e.target)) {
    closeMobileNav();
  }
});

// ===== TONE BUTTONS =====
function initToneButtons() {
  document.querySelectorAll('.tone-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tone-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedTone = btn.dataset.tone;
    });
  });
}

// ===== CHARACTER COUNTER =====
function initCharCounter() {
  const textarea = document.getElementById('user-idea');
  const counter  = document.getElementById('char-count');
  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    if (len > MAX_CHARS) textarea.value = textarea.value.slice(0, MAX_CHARS);
    counter.textContent = Math.min(len, MAX_CHARS);
    counter.style.color = len > MAX_CHARS * 0.85 ? 'var(--warning)' : 'var(--text-muted)';
  });
}

/* ============================================================
   ✦ LOCAL SMART PROMPT ENGINE
   Builds a structured, professional-grade prompt entirely
   in JavaScript — no network call, no API key needed.
   ============================================================ */

const TONE_CONFIG = {
  professional: {
    label: 'Professional',
    voice: 'with a formal, authoritative, and polished tone',
    rolePrefix: 'You are a seasoned expert and senior professional',
    languageNote: 'Use clear, precise, business-appropriate language. Avoid jargon unless necessary and define technical terms when used.',
    closingInstruction: 'Ensure the output maintains a professional standard suitable for corporate or business use.',
  },
  creative: {
    label: 'Creative',
    voice: 'with an imaginative, vivid, and expressive tone',
    rolePrefix: 'You are a highly creative expert and innovative thinker',
    languageNote: 'Use rich, evocative language. Explore unconventional angles and original ideas. Embrace storytelling where appropriate.',
    closingInstruction: 'Push beyond the obvious. The output should surprise, inspire, and stand out.',
  },
  technical: {
    label: 'Technical',
    voice: 'with a precise, structured, and technical tone',
    rolePrefix: 'You are a highly experienced technical specialist and systems expert',
    languageNote: 'Use accurate technical terminology. Structure the response logically with clear steps or code examples where appropriate.',
    closingInstruction: 'Prioritize accuracy, completeness, and technical correctness above all else.',
  },
  academic: {
    label: 'Academic',
    voice: 'with a scholarly, analytical, and rigorous tone',
    rolePrefix: 'You are a subject-matter expert with deep academic knowledge',
    languageNote: 'Follow academic writing conventions. Support claims with reasoning. Use formal language and a logical argument structure.',
    closingInstruction: 'The output should be suitable for an academic paper, research report, or scholarly discussion.',
  },
  casual: {
    label: 'Casual',
    voice: 'with a friendly, conversational, and approachable tone',
    rolePrefix: 'You are a knowledgeable friend explaining things in a simple way',
    languageNote: 'Use everyday language. Keep it conversational and easy to understand. Avoid heavy jargon.',
    closingInstruction: 'The output should feel natural and relatable, as if talking to a smart friend.',
  },
  persuasive: {
    label: 'Persuasive',
    voice: 'with a compelling, action-oriented, and emotionally engaging tone',
    rolePrefix: 'You are a master communicator and persuasive writer',
    languageNote: 'Use strong, convincing language. Appeal to both logic and emotion. Build a clear case for the desired outcome.',
    closingInstruction: 'Every sentence should drive the reader toward a specific action or belief.',
  },
};

const FORMAT_CONFIG = {
  detailed: {
    label: 'Detailed Narrative',
    instruction: 'Write your response as a well-structured, flowing narrative. Use paragraphs with smooth transitions. Cover the topic comprehensively from introduction through conclusion.',
    structure: '',
  },
  structured: {
    label: 'Structured with Sections',
    instruction: 'Organize your response with clearly labeled sections and headings. Each section should address a specific aspect of the topic.',
    structure: 'Use the following structure:\n## Overview\n## Key Points\n## Deep Dive\n## Examples\n## Conclusion & Next Steps',
  },
  bullet: {
    label: 'Bullet Points',
    instruction: 'Present your response using well-organized bullet points and numbered lists. Group related items together under clear headings.',
    structure: 'Format:\n- Use bullet points for parallel items\n- Use numbered lists for sequential steps\n- Use sub-bullets for additional detail',
  },
  roleplay: {
    label: 'Role-Play Style',
    instruction: 'You are playing the role described. Stay fully in character throughout the entire response. Address the user directly and immersively.',
    structure: 'Begin with: "As [your role], here is how I approach this..."\nMaintain persona throughout. Speak from first-person experience.',
  },
  chain: {
    label: 'Chain-of-Thought',
    instruction: 'Think step-by-step, showing your reasoning at each stage before reaching a conclusion. Clearly label each reasoning step.',
    structure: 'Format:\nStep 1: [Reasoning]\nStep 2: [Analysis]\nStep 3: [Supporting Evidence]\nStep 4: [Conclusion]\nFinal Answer: [Summary]',
  },
};

const DETAIL_CONFIG = {
  concise: {
    label: 'Concise',
    lengthGuide: 'Keep the output short and to the point — 100 to 150 words maximum. Every word must carry weight. No filler.',
    depthGuide: 'Cover only the essential points. Prioritize clarity over depth.',
    extras: '',
  },
  standard: {
    label: 'Standard',
    lengthGuide: 'Aim for a well-rounded response of 200 to 300 words.',
    depthGuide: 'Cover the main points with sufficient explanation and one or two supporting examples.',
    extras: '',
  },
  comprehensive: {
    label: 'Comprehensive',
    lengthGuide: 'Provide a thorough response of 400 to 500 words. Leave no important angle unexplored.',
    depthGuide: 'Include background context, detailed analysis, multiple examples, and practical applications.',
    extras: 'Address potential counterpoints or limitations where relevant.',
  },
  expert: {
    label: 'Expert-Level',
    lengthGuide: 'Deliver an exhaustive, expert-grade response of 500 to 700+ words. This should be a definitive resource on the topic.',
    depthGuide: 'Include historical context, technical depth, nuanced analysis, real-world case studies, and forward-looking insights.',
    extras: 'Anticipate follow-up questions and address them proactively. Note edge cases, exceptions, and best practices.',
  },
};

// ===== TOPIC INTELLIGENCE =====
// Detect topic category for smarter role assignment
function detectTopicCategory(idea) {
  const text = idea.toLowerCase();
  if (/\b(code|program|api|function|algorithm|javascript|python|react|database|sql|app|software|bug|debug|deploy|server|html|css|git|loop|class|object)\b/.test(text))
    return 'tech';
  if (/\b(blog|article|write|essay|story|content|post|newsletter|copy|headline|caption|book|chapter|script)\b/.test(text))
    return 'writing';
  if (/\b(market|brand|product|customer|sales|campaign|audience|social media|seo|ad|advertis|email|funnel|launch)\b/.test(text))
    return 'marketing';
  if (/\b(teach|learn|explain|student|course|lesson|tutorial|educate|training|curriculum|quiz|assess)\b/.test(text))
    return 'education';
  if (/\b(design|ui|ux|color|layout|graphic|illustrat|logo|wireframe|prototype|figma|font|visual)\b/.test(text))
    return 'design';
  if (/\b(data|analysis|chart|statistic|insight|report|metric|dashboard|survey|research|study|trend)\b/.test(text))
    return 'data';
  if (/\b(business|strategy|startup|finance|investor|revenue|growth|plan|model|pitch|goal|okr|kpi)\b/.test(text))
    return 'business';
  if (/\b(health|medical|fitness|diet|nutrition|exercise|wellness|mental|therapy|symptom|diagnos)\b/.test(text))
    return 'health';
  return 'general';
}

// Category-specific role boosters
function getCategoryRole(category, tone) {
  const map = {
    tech: {
      professional: 'specializing in software engineering and systems architecture',
      creative: 'with a talent for innovative and elegant technical solutions',
      technical: 'with deep expertise in computer science and software development',
      academic: 'with expertise in computer science theory and applied research',
      casual: 'who loves explaining complex tech in plain English',
      persuasive: 'who can make even complex technology feel exciting and essential',
    },
    writing: {
      professional: 'specializing in professional content creation and editorial strategy',
      creative: 'with a gift for storytelling, voice, and original narrative',
      technical: 'with expertise in technical writing and precise documentation',
      academic: 'specializing in academic writing and research communication',
      casual: 'who writes in an engaging, easy-to-read style',
      persuasive: 'specializing in high-conversion copywriting and persuasive content',
    },
    marketing: {
      professional: 'with extensive experience in brand strategy and go-to-market execution',
      creative: 'specializing in creative campaigns and breakthrough brand storytelling',
      technical: 'with expertise in growth hacking, SEO, and data-driven marketing',
      academic: 'with deep knowledge of consumer psychology and market research',
      casual: 'who understands modern audiences and speaks their language',
      persuasive: 'who creates marketing messages that move people to action',
    },
    education: {
      professional: 'with expertise in instructional design and curriculum development',
      creative: 'who transforms learning into an engaging, memorable experience',
      technical: 'specializing in technical training and skills-based education',
      academic: 'with a rigorous academic approach to knowledge transfer',
      casual: 'who makes complex topics simple and fun to learn',
      persuasive: 'who motivates students and makes learning feel meaningful',
    },
    design: {
      professional: 'specializing in user-centered design and visual communication',
      creative: 'with a bold aesthetic sense and a passion for innovative design',
      technical: 'with deep expertise in UX principles and design systems',
      academic: 'with grounding in design theory, history, and research',
      casual: 'who makes great design feel accessible and intuitive',
      persuasive: 'who creates designs that guide users toward a clear desired outcome',
    },
    data: {
      professional: 'with expertise in data analysis, reporting, and business intelligence',
      creative: 'who turns raw data into compelling visual stories and insights',
      technical: 'specializing in statistical analysis, machine learning, and data pipelines',
      academic: 'with rigorous training in research methodology and statistical science',
      casual: 'who explains data and insights in a way anyone can understand',
      persuasive: 'who uses data to build airtight, convincing arguments',
    },
    business: {
      professional: 'with senior-level expertise in business strategy and operations',
      creative: 'who brings fresh, disruptive thinking to business problems',
      technical: 'specializing in financial modeling, operations, and process optimization',
      academic: 'deeply versed in business theory, case studies, and strategic frameworks',
      casual: 'who makes business concepts approachable and actionable',
      persuasive: 'who can sell ideas, inspire teams, and drive organizational change',
    },
    health: {
      professional: 'with deep expertise in health, medicine, and wellness best practices',
      creative: 'who makes health and wellness feel inspiring and achievable',
      technical: 'with expertise in clinical research, physiology, and evidence-based medicine',
      academic: 'grounded in peer-reviewed health science and clinical evidence',
      casual: 'who gives practical, easy-to-follow health advice',
      persuasive: 'who motivates people to take meaningful steps toward better health',
    },
    general: {
      professional: 'with broad expertise and a track record of delivering high-quality insights',
      creative: 'with an imaginative and original approach to any challenge',
      technical: 'with a methodical, precise, and thorough analytical approach',
      academic: 'with scholarly depth and rigorous analytical thinking',
      casual: 'who can discuss complex topics in a clear and friendly way',
      persuasive: 'with the ability to present any idea in the most compelling way possible',
    },
  };
  return map[category]?.[tone] || map.general[tone];
}

// Generate output format instruction block
function getOutputBlock(format, detail) {
  const f = FORMAT_CONFIG[format];
  const d = DETAIL_CONFIG[detail];
  let block = `OUTPUT REQUIREMENTS:\n`;
  block += `• Length: ${d.lengthGuide}\n`;
  block += `• Depth: ${d.depthGuide}\n`;
  block += `• Format: ${f.instruction}\n`;
  if (f.structure) block += `• Structure:\n${f.structure}\n`;
  if (d.extras)    block += `• Additional: ${d.extras}\n`;
  return block;
}

// Build constraints block
function getConstraintsBlock(tone, context) {
  const t = TONE_CONFIG[tone];
  let block = `STYLE & CONSTRAINTS:\n`;
  block += `• Tone: Write ${t.voice}.\n`;
  block += `• Language: ${t.languageNote}\n`;
  block += `• Quality Bar: ${t.closingInstruction}\n`;
  if (context) block += `• Context: ${context}\n`;
  return block;
}

// ===== MAIN GENERATOR FUNCTION =====
function buildLocalPrompt(idea, tone, format, detail, context) {
  const t        = TONE_CONFIG[tone];
  const f        = FORMAT_CONFIG[format];
  const d        = DETAIL_CONFIG[detail];
  const category = detectTopicCategory(idea);
  const catRole  = getCategoryRole(category, tone);

  // ── Role ──
  const roleBlock = `ROLE:\n${t.rolePrefix} ${catRole}.`;

  // ── Task ──
  const taskBlock = `TASK:\nYour task is to provide an outstanding, ${d.label.toLowerCase()}-level response about the following topic:\n"${idea}"`;

  // ── Output requirements ──
  const outputBlock = getOutputBlock(format, detail);

  // ── Constraints ──
  const constraintsBlock = getConstraintsBlock(tone, context);

  // ── Goal ──
  const goalBlock = `GOAL:\nDeliver a response that is immediately useful, insightful, and ${f.label.toLowerCase()} — one that goes beyond the obvious and provides genuine value to the reader.`;

  // ── Assemble ──
  const sections = [roleBlock, taskBlock, outputBlock, constraintsBlock, goalBlock];
  return sections.join('\n\n');
}

// ===== GENERATE (no API) =====
async function generatePrompt() {
  if (isGenerating) return;

  const idea    = document.getElementById('user-idea').value.trim();
  const format  = document.getElementById('output-format').value;
  const detail  = document.getElementById('detail-level').value;
  const context = document.getElementById('additional-context').value.trim();

  if (!idea) {
    showToast('⚠️ Please describe your idea first!', '#f59e0b');
    document.getElementById('user-idea').focus();
    return;
  }

  isGenerating = true;
  setGeneratingState(true);
  showLoadingState();
  animateLoadingSteps();

  // Simulate a brief build delay so the UI feels alive
  await new Promise(r => setTimeout(r, 1800));

  try {
    const result = buildLocalPrompt(idea, selectedTone, format, detail, context);
    showOutput(result, selectedTone, format, detail);
  } catch (err) {
    showError('Something went wrong while building your prompt. Please try again.');
  } finally {
    isGenerating = false;
    setGeneratingState(false);
  }
}

// ===== UI STATE HELPERS =====
function setGeneratingState(generating) {
  const btn     = document.getElementById('generate-btn');
  const spinner = document.getElementById('btn-spinner');
  const icon    = btn.querySelector('.btn-icon');
  const text    = document.getElementById('btn-text');
  btn.disabled  = generating;
  spinner.classList.toggle('spinning', generating);
  icon.classList.toggle('hidden', generating);
  text.textContent = generating ? 'Building Prompt...' : 'Generate Expert Prompt';
}

function showLoadingState() {
  document.getElementById('empty-state').style.display      = 'none';
  document.getElementById('error-state').style.display      = 'none';
  document.getElementById('output-container').style.display = 'none';
  document.getElementById('loading-state').style.display    = 'flex';
  document.getElementById('output-actions').style.opacity   = '0';
  document.getElementById('output-actions').style.pointerEvents = 'none';
}

let loadingStepInterval = null;
function animateLoadingSteps() {
  const steps  = ['lstep-1', 'lstep-2', 'lstep-3', 'lstep-4'];
  const labels = ['Analyzing topic...', 'Building role & context...', 'Crafting expert structure...', 'Finalizing output...'];
  let current  = 0;
  steps.forEach(id => document.getElementById(id).classList.remove('active', 'done'));
  document.getElementById('lstep-1').classList.add('active');
  document.getElementById('loading-sub').textContent = labels[0];

  loadingStepInterval = setInterval(() => {
    if (current < steps.length - 1) {
      document.getElementById(steps[current]).classList.replace('active', 'done');
      current++;
      document.getElementById(steps[current]).classList.add('active');
      document.getElementById('loading-sub').textContent = labels[current];
    }
  }, 400);
}

function showOutput(text, tone, format, detail) {
  clearInterval(loadingStepInterval);
  document.getElementById('loading-state').style.display    = 'none';
  document.getElementById('output-container').style.display = 'flex';
  document.getElementById('output-actions').style.opacity   = '1';
  document.getElementById('output-actions').style.pointerEvents = 'auto';

  // Meta tags
  document.getElementById('output-meta').innerHTML = `
    <div class="meta-tag">${TONE_CONFIG[tone]?.label || tone}</div>
    <div class="meta-tag">${FORMAT_CONFIG[format]?.label || format}</div>
    <div class="meta-tag">${DETAIL_CONFIG[detail]?.label || detail}</div>
    <div class="meta-tag">✓ No API Used</div>
  `;
  document.getElementById('output-text').textContent = text;
}

function showError(message) {
  clearInterval(loadingStepInterval);
  document.getElementById('loading-state').style.display = 'none';
  document.getElementById('error-state').style.display   = 'flex';
  document.getElementById('error-title').textContent     = 'Generation Failed';
  document.getElementById('error-message').textContent   = message;
}

function resetOutput() {
  document.getElementById('error-state').style.display  = 'none';
  document.getElementById('empty-state').style.display  = 'flex';
  document.getElementById('output-actions').style.opacity = '0';
  document.getElementById('output-actions').style.pointerEvents = 'none';
}

// ===== COPY TO CLIPBOARD =====
async function copyPrompt() {
  const text = document.getElementById('output-text').textContent;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    showToast('✅ Prompt copied to clipboard!', 'var(--success)');
    const btn = document.getElementById('copy-btn');
    btn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg> Copied!`;
    setTimeout(() => {
      btn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg> Copy`;
    }, 2500);
  } catch {
    showToast('❌ Could not copy. Please select and copy manually.', 'var(--error)');
  }
}

// ===== EXPORT AS TXT =====
function exportPrompt() {
  const text = document.getElementById('output-text').textContent;
  if (!text) return;
  const idea     = document.getElementById('user-idea').value.slice(0, 40).replace(/\s+/g, '_');
  const date     = new Date().toISOString().slice(0, 10);
  const filename = `PromptGenAI_${idea}_${selectedTone}_${date}.txt`;
  const blob     = new Blob([
    `PromptGenAI — Expert Prompt (No API Required)\n`,
    `Generated : ${new Date().toLocaleString()}\n`,
    `Tone      : ${TONE_CONFIG[selectedTone]?.label}\n`,
    `Format    : ${FORMAT_CONFIG[document.getElementById('output-format').value]?.label}\n`,
    `Detail    : ${DETAIL_CONFIG[document.getElementById('detail-level').value]?.label}\n`,
    `${'═'.repeat(50)}\n\n`,
    text
  ], { type: 'text/plain; charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a   = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
  showToast('📄 Prompt exported as TXT!', 'var(--accent-primary)');
}

// ===== TOAST =====
let toastTimeout = null;
function showToast(message, color = 'var(--success)') {
  const toast = document.getElementById('toast');
  document.getElementById('toast-message').textContent = message;
  toast.style.background = color;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
}
