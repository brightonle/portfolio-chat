/* ============================================================
   profile.js: your content lives here.
   Edit PROFILE to change what the chat says, SCRIPT to change the
   order of questions, and ROUTES to change how typed questions
   are matched to answers. No build step: save and refresh.
   ============================================================ */
const PROFILE = {
  name: "Brighton",
  email: "brightonle2016@gmail.com",
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/brighton-le/" },
    { label: "GitHub", href: "https://github.com/brightonle" },
    { label: "Atelo", href: "https://ateloai.com/" }
  ],
  about: "I work like a tech consultant / forward-deployed engineer. I sit down with a team, find the workflow that's costing them the most time, and ship an agentic AI product that fixes it. I scope it with the stakeholders, build the agents and data pipelines myself, and stay with it until people are actually using it. At EY I do this for top Fortune 500 companies modernizing their legacy systems. Here are the skills I've picked up along the way!",
  skills: [
    { group: "Languages", items: ["Python", "TypeScript", "SQL", "Java", "C/C++"] },
    { group: "Data & cloud", items: ["PostgreSQL", "Databricks", "Snowflake", "MongoDB", "Apache Spark", "AWS (S3, EC2, Lambda, DynamoDB)", "Azure"] },
    { group: "Tools", items: ["Docker", "Kubernetes", "Jenkins", "Git", "SQLAlchemy", "Prisma", "Neo4j", "Alteryx", "Tableau", "Power BI"] }
  ],
  // Company logos: drop square images into the logos/ folder using the file names below.
  // Until a file exists, a tile with the "mono" initials shows instead.
  now: [
    { years: "Jul 2026 — Now", role: "Technology Consultant", org: "Ernst & Young · San Antonio, TX",
      logo: "logos/ey.png", mono: "EY",
      text: "Advising global technology clients on modernizing legacy systems, including agentic AI solutions for IT assurance and access management.",
      metrics: ["Control coverage up to 80%"] },
    { years: "May — Jul 2026", role: "Data Analyst", org: "Bloomerang · Boston, MA",
      logo: "logos/bloomerang.png", mono: "B",
      text: "Mapped and migrated legacy CRM data for 80+ nonprofit clients using SQL transformation queries and Excel validation workflows.",
      metrics: ["−40% conversion time", "99% field-level accuracy"] }
  ],
  before: [
    { years: "Mar — Apr 2026", role: "AI Automation Engineer Extern", org: "Wayfair · Boston, MA",
      logo: "logos/wayfair.png", mono: "W",
      text: "Architected an AI market-intelligence system: 30+ agents benchmark competitor assortments across 500+ products and analyze 50+ social trends per run, then write market reports.",
      metrics: ["30+ agents", "500+ products per run"] },
    { years: "Jun — Aug 2025", role: "Data Engineer Intern", org: "Fidelity Investments · Boston, MA",
      logo: "logos/fidelity.png", mono: "F",
      text: "Built a metadata-driven Python framework so teams trigger PostgreSQL workflows from config instead of code. Designed a GenAI alerting system that classifies and summarizes errors for 15+ stakeholders.",
      metrics: ["−80% manual code updates", "~90% less monitoring time"] },
    { years: "May 2024 — Jun 2025", role: "Junior Data Architect & Data Engineer Co-op", org: "Boston After School & Beyond · Boston, MA",
      logo: "logos/basb.png", mono: "BA",
      text: "Worked with Fidelity engineers through the Common Impact Program to move a relational data ecosystem to NoSQL. Built reusable Alteryx macros that sped up ETL for Power BI reporting.",
      metrics: ["300+ client programs", "−90% processing time"] }
  ],
  projects: [
    { thumb: "drug", kicker: "Pfizer extern · Summer 2026", title: "Drug Intelligence", href: "",
      text: "OCR and RAG pipelines that turn clinical supply documents into structured data.",
      what: "Ingests and parses documents across 300+ drug-shortage scenarios and extracts structured JSON from them.",
      how: "Multi-engine OCR for messy scans, then LLM-based retrieval to classify clinical supply documents.",
      stack: "Python · SQL · Azure" },
    { thumb: "atelo", kicker: "Founder project · Spring 2026", title: "Atelo", href: "https://ateloai.com/", logo: "logos/atelo.svg", logoTheme: "dark",
      text: "An AI fashion design platform: reference images and plain-language direction in, factory-ready tech packs out.",
      what: "Takes a designer's mood images and notes and produces the technical spec a factory can manufacture from.",
      how: "Claude powers the generation, Supabase holds the data, and Stripe handles payments.",
      stack: "Python · TypeScript · SQL · Supabase · Stripe · Claude" }
  ],
  education: {
    school: "Northeastern University, Khoury College of Computer Sciences",
    degree: "B.S. Computer Science & Business Administration, concentration in Financial Technology",
    when: "Aug 2022 — May 2026 · Boston, MA",
    courses: ["Data Structures & Algorithms", "Object-Oriented Design", "Distributed Systems", "Machine Learning"],
    logo: "logos/northeastern.png", mono: "NU"
  }
};

/* The scripted conversation, in scroll order */
const SCRIPT = [
  { id: "about",      ask: "So what do you actually do?",       label: "What I do" },
  { id: "now",        ask: "Where are you working now?",         label: "Right now" },
  { id: "before",     ask: "And before that?",                   label: "Before that" },
  { id: "projects",   ask: "Show me something you've built.",    label: "Projects" },
  { id: "education",  ask: "Where did you study?",               label: "Education" },
  { id: "contact",    ask: "How can I reach you?",               label: "Get in touch" }
];

/* Keyword routing for typed questions (first match wins) */
const ROUTES = [
  { id: "contact",    re: /(contact|email|reach|hire|hiring|available|open to|touch|call|connect|linkedin)/i },
  { id: "projects",   re: /(project|built|build|atelo|pfizer|drug|rag|ocr|side|github|show me|case stud)/i },
  { id: "education",  re: /(school|study|studied|universit|northeastern|degree|educat|course|class|graduat|college)/i },
  { id: "now",        re: /(ey\b|ernst|current|now|today|working on|bloomerang|day job)/i },
  { id: "before",     re: /(fidelity|wayfair|intern|extern|previous|before|experience|worked|career|resume|job|boston after)/i },
  { id: "about",      re: /(what do you do|who are you|about|skill|tool|stack|language|python|sql|aws|azure|tech|agent|ai\b)/i }
];
const LIVE_INTRO = {
  about: "Here's the short version, plus my stack.", now: "These days I'm at EY, and I just wrapped a role at Bloomerang.",
  before: "Here's what came before that.",
  projects: "Two I'd point you to first.", education: "I studied at Northeastern, mixing computer science with business and fintech.",
  contact: "Email is the fastest way to reach me."
};

/* Words the sun cycles through while it "thinks" before an answer */
const THINKING_WORDS = [
  "Basking", "Brightening", "Soaking up rays", "Warming up", "Glowing", "Radiating",
  "Beaming", "Sunbathing", "Rising and shining", "Pondering", "Mulling it over",
  "Brewing", "Percolating", "Noodling", "Daydreaming", "Connecting the dots"
];

/* ...and the ones the moon uses in night mode */
const THINKING_WORDS_NIGHT = [
  "Stargazing", "Moonlighting", "Dreaming", "Counting sheep", "Burning the midnight oil",
  "Wishing on a star", "Moonwalking", "Orbiting", "Night owling", "Sleeping on it",
  "Charting the stars", "Howling"
];
