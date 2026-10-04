import { FormEvent, ReactNode, useMemo, useState } from "react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

type CourseLesson = { id: string; title: string; duration: string };
type CourseModule = { id: string; title: string; description: string; lessons: CourseLesson[] };
type AICourse = {
  title: string;
  summary: string;
  level: string;
  goal: string;
  estimatedHours: number;
  modules: CourseModule[];
};
type AILesson = {
  title: string;
  duration: string;
  introduction: string;
  objectives: string[];
  sections: { heading: string; body: string; formula?: string; example?: string }[];
  interactive: { title: string; instruction: string; type: "map" | "sequence" | "comparison" | "cycle"; nodes: string[] };
  exercise: { prompt: string; hint: string; solution: string };
  quiz: { question: string; options: string[]; correctIndex: number; explanation: string };
  mentorNote: string;
};

const apiUrl = import.meta.env.DEV
  ? "/api/tangent"
  : `https://${projectId}.supabase.co/functions/v1/make-server-32df79af`;

async function callAI<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${apiUrl}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(import.meta.env.DEV ? {} : { Authorization: `Bearer ${publicAnonKey}` }),
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "The AI request failed.");
  return payload;
}

type IconName =
  | "spark"
  | "home"
  | "book"
  | "progress"
  | "settings"
  | "search"
  | "arrow"
  | "play"
  | "check"
  | "lock"
  | "clock"
  | "target"
  | "chevron"
  | "menu";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    spark: <path d="M12 2l1.35 5.15L18.5 8.5l-5.15 1.35L12 15l-1.35-5.15L5.5 8.5l5.15-1.35L12 2zM19 14l.7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14z" />,
    home: <path d="M3 10.5L12 3l9 7.5V21h-6v-6H9v6H3V10.5z" />,
    book: <path d="M4 4.5A2.5 2.5 0 016.5 2H11v18H6.5A2.5 2.5 0 004 22V4.5zm16 0A2.5 2.5 0 0017.5 2H13v18h4.5a2.5 2.5 0 012.5 2V4.5z" />,
    progress: <><path d="M4 19V9m6 10V5m6 14v-7m4 7V3" /><path d="M2 21h20" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0015 19.4a1.7 1.7 0 00-1 .6 1.7 1.7 0 00-.4 1.1V21H9.6v-.1a1.7 1.7 0 00-1.06-1.56 1.7 1.7 0 00-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 004.2 15a1.7 1.7 0 00-.6-1 1.7 1.7 0 00-1.1-.4H2.4V9.6h.1a1.7 1.7 0 001.56-1.06 1.7 1.7 0 00-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 008.4 4.2a1.7 1.7 0 001-1.6V2.5h4v.1a1.7 1.7 0 001.06 1.56 1.7 1.7 0 001.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0019.8 8.5c.25.62.85 1.02 1.5 1.02h.1v4h-.1c-.65 0-1.25.4-1.5 1.02z" /></>,
    search: <><circle cx="10.8" cy="10.8" r="7.3" /><path d="M16 16l5 5" /></>,
    arrow: <><path d="M5 12h14" /><path d="M14 7l5 5-5 5" /></>,
    play: <path d="M8 5l11 7-11 7V5z" />,
    check: <path d="M5 12.5l4 4L19 7" />,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 018 0v3" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><path d="M12 3v3m9 6h-3" /></>,
    chevron: <path d="M9 6l6 6-6 6" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={name === "spark" || name === "home" || name === "play" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function Button({
  children,
  className = "",
  onClick,
  type = "button",
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  ariaLabel?: string;
}) {
  return <button type={type} aria-label={ariaLabel} className={className} onClick={onClick}>{children}</button>;
}

const calculusModules = [
  { n: "01", title: "Limits & continuity", meta: "6 lessons · 45 min", state: "done" },
  { n: "02", title: "The derivative", meta: "8 lessons · 1h 20m", state: "active" },
  { n: "03", title: "Applications of derivatives", meta: "7 lessons · 1h 10m", state: "open" },
  { n: "04", title: "Riemann sums & area", meta: "9 lessons · 1h 35m", state: "open" },
  { n: "05", title: "Antiderivatives & FTC", meta: "7 lessons · 1h 15m", state: "locked" },
];

const physicsModules = [
  { n: "01", title: "Vectors & kinematics", meta: "7 lessons · 1h 05m", state: "done" },
  { n: "02", title: "Forces & Newton's laws", meta: "9 lessons · 1h 30m", state: "active" },
  { n: "03", title: "Work, energy & power", meta: "8 lessons · 1h 20m", state: "open" },
  { n: "04", title: "Momentum & collisions", meta: "7 lessons · 1h 10m", state: "open" },
  { n: "05", title: "Rotation & gravitation", meta: "10 lessons · 1h 50m", state: "locked" },
];

const generalModules = [
  { n: "01", title: "The big picture", meta: "5 lessons · 40 min", state: "done" },
  { n: "02", title: "Core ideas & vocabulary", meta: "8 lessons · 1h 15m", state: "active" },
  { n: "03", title: "Guided practice", meta: "7 lessons · 1h 10m", state: "open" },
  { n: "04", title: "Real-world applications", meta: "6 lessons · 55 min", state: "open" },
  { n: "05", title: "Mastery project", meta: "4 lessons · 1h 20m", state: "locked" },
];

function interpretRequest(request: string) {
  const clean = request
    .trim()
    .replace(/^(please\s+)?(i('| a)?m\s+trying\s+to|i\s+want\s+to|help\s+me|teach\s+me\s+to?|learn)\s+/i, "")
    .replace(/[.!?]+$/, "");
  const compact = clean
    .replace(/\s+(from scratch|as a beginner|at an? (beginner|intermediate|advanced|college) level).*$/i, "")
    .replace(/\s+(so that|so i can|because i want).*/i, "")
    .trim();
  const words = compact.split(/\s+/).filter(Boolean);
  const subject = (words.length > 9 ? words.slice(0, 9).join(" ") : compact) || "New subject";
  const title = subject.replace(/\b\w/g, (character) => character.toUpperCase());
  const level = /advanced|ap |college|university|professional/i.test(request)
    ? "Advanced"
    : /beginner|from scratch|no experience|new to/i.test(request)
      ? "Beginner"
      : "Adaptive";
  const goal = /exam|test|ap |sat|certif/i.test(request)
    ? "Exam preparation"
    : /project|build|create|make/i.test(request)
      ? "Project-based"
      : /problem|practice|solve/i.test(request)
        ? "Practice-heavy"
        : "Deep understanding";
  const paceMatch = request.match(/(\d+)\s*(day|week|month)s?/i);
  const pace = paceMatch ? `${paceMatch[1]} ${paceMatch[2]} plan` : "Self-paced";
  const ignored = new Set(["want", "learn", "understand", "about", "from", "scratch", "beginner", "advanced", "course", "teach", "with", "that", "this", "into", "using", "for", "the", "and", "how", "what"]);
  const keywords = clean
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !ignored.has(word))
    .filter((word, index, all) => all.indexOf(word) === index)
    .slice(0, 4)
    .map((word) => word.replace(/\b\w/g, (character) => character.toUpperCase()));
  while (keywords.length < 4) keywords.push(["Foundations", "Core Ideas", "Application", "Synthesis"][keywords.length]);
  return { title, level, goal, pace, keywords };
}

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [courseTitle, setCourseTitle] = useState("Calculus I");
  const [generating, setGenerating] = useState(false);
  const [activeNav, setActiveNav] = useState("home");
  const [xValue, setXValue] = useState(63);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizChecked, setQuizChecked] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [courseMode, setCourseMode] = useState<"calculus" | "physics" | "general">("general");
  const [angle, setAngle] = useState(30);
  const [hasCourse, setHasCourse] = useState(false);
  const [generationPhase, setGenerationPhase] = useState("Reading your request");
  const [courseMeta, setCourseMeta] = useState({ level: "Adaptive", goal: "Deep understanding", pace: "Self-paced" });
  const [alumMode, setAlumMode] = useState(true);
  const [focusIdeas, setFocusIdeas] = useState(["Foundations", "Core Ideas", "Application", "Synthesis"]);
  const [courseModules, setCourseModules] = useState(generalModules);
  const [aiCourse, setAiCourse] = useState<AICourse | null>(null);
  const [currentLesson, setCurrentLesson] = useState<AILesson | null>(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [lessonCache, setLessonCache] = useState<Record<string, AILesson>>({});
  const [lessonLoading, setLessonLoading] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [showSolution, setShowSolution] = useState(false);
  const [selectedNode, setSelectedNode] = useState(0);

  const point = useMemo(() => {
    const x = (xValue - 50) / 15;
    const px = 255 + x * 54;
    const py = 145 - x * x * 18;
    return { x, px, py, slope: 2 * x };
  }, [xValue]);

  async function generateCourse(event: FormEvent) {
    event.preventDefault();
    if (!prompt.trim()) return;
    setGenerating(true);
    setGenerationError("");
    setGenerationPhase("Reading your request");
    const phases = ["Finding the right starting point", "Building a rigorous curriculum", "Writing your first lesson", "Adding practice and assessment"];
    let phaseIndex = 0;
    const phaseTimer = window.setInterval(() => {
      setGenerationPhase(phases[Math.min(phaseIndex, phases.length - 1)]);
      phaseIndex += 1;
    }, 1700);
    try {
      const result = await callAI<{ course: AICourse; firstLesson: AILesson; courseId: string }>("generate-course", {
        request: prompt,
        alumMode,
      });
      const interpretation = interpretRequest(prompt);
      const modules = result.course.modules.map((module, index) => ({
        n: String(index + 1).padStart(2, "0"),
        title: module.title,
        meta: `${module.lessons.length} lessons · ${module.lessons.reduce((total, lesson) => total + (parseInt(lesson.duration) || 15), 0)} min`,
        state: index === 0 ? "active" : "open",
      }));
      setCourseMode("general");
      setCourseTitle(result.course.title);
      setCourseMeta({ level: result.course.level, goal: result.course.goal, pace: interpretation.pace });
      setFocusIdeas(result.firstLesson.interactive.nodes);
      setCourseModules(modules);
      setAiCourse(result.course);
      setCurrentLesson(result.firstLesson);
      setLessonCache({ [result.course.modules[0].lessons[0].id]: result.firstLesson });
      setActiveModuleIndex(0);
      setActiveLessonIndex(0);
      setQuizAnswer(null);
      setQuizChecked(false);
      setHasCourse(true);
      setActiveNav("home");
      setPrompt("");
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Course generation failed.");
    } finally {
      window.clearInterval(phaseTimer);
      setGenerating(false);
    }
  }

  async function openLesson(moduleIndex: number, lessonIndex: number) {
    if (!aiCourse) return;
    const module = aiCourse.modules[moduleIndex];
    const lesson = module.lessons[lessonIndex];
    const cached = lessonCache[lesson.id];
    setActiveModuleIndex(moduleIndex);
    setActiveLessonIndex(lessonIndex);
    setQuizAnswer(null);
    setQuizChecked(false);
    setShowSolution(false);
    setSelectedNode(0);
    if (cached) {
      setCurrentLesson(cached);
      return;
    }
    setLessonLoading(true);
    try {
      const result = await callAI<{ lesson: AILesson }>("generate-lesson", {
        courseTitle: aiCourse.title,
        moduleTitle: module.title,
        lessonTitle: lesson.title,
        alumMode,
      });
      setCurrentLesson(result.lesson);
      setLessonCache((cache) => ({ ...cache, [lesson.id]: result.lesson }));
      setFocusIdeas(result.lesson.interactive.nodes);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Lesson generation failed.");
    } finally {
      setLessonLoading(false);
    }
  }

  function continueLesson() {
    if (!aiCourse) return;
    const module = aiCourse.modules[activeModuleIndex];
    if (activeLessonIndex < module.lessons.length - 1) {
      void openLesson(activeModuleIndex, activeLessonIndex + 1);
    } else if (activeModuleIndex < aiCourse.modules.length - 1) {
      void openLesson(activeModuleIndex + 1, 0);
    }
  }

  if (!hasCourse) {
    return (
      <main className={`onboarding ${generating ? "is-generating" : ""}`}>
        <div className="onboarding-brand"><span className="brand-mark"><Icon name="spark" size={18} /></span><span>Tangent</span></div>
        <div className="onboarding-inner">
          <div className="eyebrow"><span></span> BUILD A COURSE AROUND YOU</div>
          <div className="onboarding-title">What do you want<br />to <em>understand?</em></div>
          <p>Anything at all. Tell us the subject, your goal, or the thing that has never quite clicked.</p>
          {generating ? (
            <div className="analysis-card" role="status" aria-live="polite">
              <div className="analysis-orbit"><Icon name="spark" size={21} /></div>
              <div>
                <span>TANGENT IS THINKING</span>
                <strong key={generationPhase}>{generationPhase}</strong>
                <p>“{prompt}”</p>
              </div>
              <div className="analysis-progress"><i></i></div>
            </div>
          ) : (
            <form className="onboarding-prompt" onSubmit={generateCourse}>
              <textarea autoFocus value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="I want to understand..." aria-label="What do you want to understand?" />
              <Button type="submit" className="generate-button">
                <span>Build my course</span><Icon name="arrow" />
              </Button>
            </form>
          )}
          {generationError && <div className="generation-error" role="alert">{generationError} Check the model key and try again.</div>}
          <div className="onboarding-foot">A real curriculum, made from scratch · Lessons · Practice · Interactive models</div>
        </div>
        <div className="onboarding-doodle">?</div>
      </main>
    );
  }

  return (
    <div className="app-shell app-enter">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark"><Icon name="spark" size={18} /></span>
          <span>Tangent</span>
        </div>
        <div className="topbar-center">
          <span className="workspace-label">LEARNING SPACE</span>
          <span className="slash">/</span>
          <span className="course-label">{courseTitle}</span>
        </div>
        <div className="topbar-actions">
          <Button className="icon-button mobile-menu" ariaLabel="Toggle menu" onClick={() => setMobileOpen(!mobileOpen)}><Icon name="menu" /></Button>
          <Button className="search-button"><Icon name="search" size={16} /><span>Search</span><kbd>⌘ K</kbd></Button>
          <Button className="avatar" ariaLabel="Open profile">AM</Button>
        </div>
      </header>

      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <nav className="primary-nav" aria-label="Main navigation">
          {[
            ["home", "Home"],
            ["book", "My courses"],
            ["progress", "Progress"],
          ].map(([icon, label]) => (
            <Button key={label} className={`nav-item ${activeNav === icon ? "active" : ""}`} onClick={() => { setActiveNav(icon); setMobileOpen(false); }}>
              <Icon name={icon as IconName} size={19} /><span>{label}</span>
            </Button>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="streak-card">
            <div className="streak-top"><span className="mini-label">WEEKLY GOAL</span><strong>4/5</strong></div>
            <div className="week-dots">
              {["M", "T", "W", "T", "F"].map((day, i) => <span key={`${day}${i}`} className={i < 4 ? "filled" : ""}>{i < 4 ? "✓" : day}</span>)}
            </div>
            <p>One more day to keep your streak.</p>
          </div>
          <Button className={`nav-item ${activeNav === "settings" ? "active" : ""}`} onClick={() => { setActiveNav("settings"); setMobileOpen(false); }}><Icon name="settings" size={19} /><span>Settings</span></Button>
        </div>
      </aside>

      <main className="main">
        {activeNav === "book" ? (
          <section className="workspace-page">
            <div className="page-eyebrow">YOUR LEARNING SHELF</div>
            <div className="page-title">My courses</div>
            <p className="page-subtitle">Everything you are learning, all in one place.</p>
            <div className="course-library">
              <Button className="library-card" onClick={() => setActiveNav("home")}>
                <span className="library-art"><span>{courseMode === "physics" ? "F = ma" : courseMode === "calculus" ? "∫ f(x)dx" : "01 → 05"}</span></span>
                <span className="library-body">
                  <small>JUST CREATED</small>
                  <strong>{courseTitle}</strong>
                  <span>{aiCourse?.modules.length || 5} modules · {aiCourse?.modules.reduce((total, module) => total + module.lessons.length, 0) || 20} lessons · {courseMeta.level}</span>
                  <i><b></b></i>
                  <em>Continue course <Icon name="arrow" size={15} /></em>
                </span>
              </Button>
              <Button className="empty-library-card" onClick={() => { setHasCourse(false); setPrompt(""); }}><span>+</span><strong>Build another course</strong><p>Your next curiosity can start here.</p></Button>
            </div>
          </section>
        ) : activeNav === "progress" ? (
          <section className="workspace-page">
            <div className="page-eyebrow">YOUR MOMENTUM</div>
            <div className="page-title">Progress</div>
            <p className="page-subtitle">Small steps add up. Here is what you have built so far.</p>
            <div className="progress-layout">
              <div className="progress-hero-card"><span>COURSE PROGRESS</span><strong>22%</strong><p>{courseTitle}</p><div><i></i></div></div>
              <div className="progress-stat"><span>Current lesson</span><strong>{activeLessonIndex + 1}</strong><small>module {activeModuleIndex + 1}</small></div>
              <div className="progress-stat"><span>Study time</span><strong>2.4</strong><small>hours</small></div>
              <div className="progress-stat warm"><span>Current streak</span><strong>4</strong><small>days</small></div>
            </div>
          </section>
        ) : activeNav === "settings" ? (
          <section className="workspace-page settings-page">
            <div className="page-eyebrow">HOW TANGENT TEACHES YOU</div>
            <div className="page-title">Settings</div>
            <p className="page-subtitle">Choose the kind of learning experience you want.</p>
            <div className="settings-panel">
              <div className="setting-copy">
                <div className="setting-title"><span>ALUM MODE</span><i>RECOMMENDED</i></div>
                <strong>Learn it properly, not just comfortably.</strong>
                <p>Alum mode keeps the full terminology, derivations, difficult problem sets, and cumulative assessments. Explanations stay clear, but the material is not simplified past the point of rigor.</p>
                <ul>
                  <li>First-principles explanations and formal vocabulary</li>
                  <li>Multi-step problems without excessive hints</li>
                  <li>Spaced retrieval and cumulative mastery checks</li>
                  <li>Real proofs, derivations, and edge cases when relevant</li>
                </ul>
              </div>
              <Button className={`mode-toggle ${alumMode ? "enabled" : ""}`} ariaLabel="Toggle Alum mode" onClick={() => setAlumMode(!alumMode)}>
                <span></span><strong>{alumMode ? "ON" : "OFF"}</strong>
              </Button>
            </div>
            <div className={`mode-status ${alumMode ? "rigorous" : ""}`}>
              <span>{alumMode ? "Alum mode is active" : "Guided mode is active"}</span>
              <p>{alumMode ? "New courses will favor depth, precision, and productive struggle." : "New courses will use shorter lessons, more hints, and gentler assessments."}</p>
            </div>
          </section>
        ) : (<>
        <section className="hero">
            <div className="hero-copy">
            <div className="eyebrow"><span></span> AI COURSE STUDIO</div>
            <div className="display-title">What do you want<br />to <em>understand?</em></div>
            <p className="hero-subtitle">Your course is tuned for <strong>{courseMeta.level.toLowerCase()}</strong> learning, with a focus on <strong>{courseMeta.goal.toLowerCase()}</strong>. {alumMode && "Alum mode keeps it rigorous—no watered-down shortcuts."}</p>
          </div>
          <form className="prompt-card" onSubmit={generateCourse}>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe a different course, goal, or level…" aria-label="Describe what you want to learn" />
            <div className="prompt-footer">
              <div className="prompt-options">
                <span><Icon name="target" size={15} /> Adaptive depth</span>
                <span><Icon name="clock" size={15} /> Self-paced</span>
              </div>
              <Button type="submit" className="generate-button">
                {generating ? <span className="loader"></span> : <><span>Build my course</span><Icon name="arrow" /></>}
              </Button>
            </div>
          </form>
        </section>

        <section className="course-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow"><span></span> CONTINUE LEARNING</div>
              <div className="section-title">{courseTitle}</div>
            </div>
            <div className="course-progress">
              <span><strong>22%</strong> complete</span>
              <div><i></i></div>
            </div>
          </div>

          <div className="learning-grid">
            <div className="module-panel">
              <div className="panel-label">COURSE OUTLINE <span>5 MODULES</span></div>
              <div className="module-list">
                {courseModules.map((module, index) => (
                  <Button key={module.n} className={`module-row ${index === activeModuleIndex ? "active" : ""}`} onClick={() => void openLesson(index, 0)}>
                    <span className="module-number">{index < activeModuleIndex ? <Icon name="check" size={16} /> : module.n}</span>
                    <span className="module-copy"><strong>{module.title}</strong><small>{module.meta}</small></span>
                    <span className="module-icon"><Icon name="chevron" size={17} /></span>
                  </Button>
                ))}
              </div>
            </div>

            <article className={`lesson-card ${lessonLoading ? "is-loading" : ""}`}>
              {lessonLoading && <div className="lesson-loader"><span className="loader"></span><strong>Writing this lesson for you…</strong></div>}
              {currentLesson && <>
                <div className="lesson-top">
                  <div>
                    <span className="lesson-kicker">MODULE {String(activeModuleIndex + 1).padStart(2, "0")} · LESSON {activeLessonIndex + 1}</span>
                    <div className="lesson-title">{currentLesson.title}</div>
                  </div>
                  <span className="lesson-time"><Icon name="clock" size={15} /> {currentLesson.duration.toUpperCase()}</span>
                </div>
                <p className="lesson-intro">{currentLesson.introduction}</p>
                <div className="objective-strip"><span>BY THE END</span>{currentLesson.objectives.map((objective) => <p key={objective}>{objective}</p>)}</div>
                <div className="lesson-sections">
                  {currentLesson.sections.map((section, index) => (
                    <section key={`${section.heading}-${index}`} className="lesson-section">
                      <span>{String(index + 1).padStart(2, "0")}</span><div><strong>{section.heading}</strong><p>{section.body}</p>
                      {section.formula && <div className="lesson-formula">{section.formula}</div>}
                      {section.example && <div className="worked-example"><small>WORKED EXAMPLE</small>{section.example}</div>}</div>
                    </section>
                  ))}
                </div>
                <div className="interactive-heading"><span>INTERACTIVE MODEL</span><strong>{currentLesson.interactive.title}</strong><p>{currentLesson.interactive.instruction}</p></div>
                <div className="graph-wrap">
                  <svg viewBox="0 0 510 250" role="img" aria-label={currentLesson.interactive.title}>
                    <defs><pattern id="ai-grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="currentColor" strokeWidth=".45" /></pattern></defs>
                    <rect width="510" height="250" fill="url(#ai-grid)" className="grid-pattern" />
                    <path d="M255 125L110 63M255 125L402 61M255 125L98 194M255 125L412 193" className="concept-lines" />
                    <g className="concept-center"><rect x="188" y="95" width="134" height="60" rx="9" /><text x="255" y="121">{currentLesson.interactive.type.toUpperCase()}</text><text x="255" y="139">{focusIdeas[selectedNode]?.slice(0, 19)}</text></g>
                    {[[110,63],[402,61],[98,194],[412,193]].map(([cx,cy], index) => <g key={index} className={`concept-node ${selectedNode === index ? "selected" : ""}`}><circle cx={cx} cy={cy} r="40" /><text x={cx} y={cy + 4}>{(focusIdeas[index] || "").toUpperCase().slice(0, 11)}</text></g>)}
                  </svg>
                  <div className="equation-pill">Explore <span>{focusIdeas[selectedNode]}</span></div>
                </div>
                <div className="node-controls">{focusIdeas.slice(0, 4).map((idea, index) => <Button key={idea} className={selectedNode === index ? "active" : ""} onClick={() => setSelectedNode(index)}>{idea}</Button>)}</div>
                <div className="practice-block"><span>YOUR TURN</span><strong>{currentLesson.exercise.prompt}</strong><details><summary>Need a hint?</summary><p>{currentLesson.exercise.hint}</p></details><Button className="solution-button" onClick={() => setShowSolution(!showSolution)}>{showSolution ? "Hide solution" : "Reveal solution"}</Button>{showSolution && <p className="solution-copy">{currentLesson.exercise.solution}</p>}</div>
                <div className="mentor-note"><span>Professor's margin</span>{currentLesson.mentorNote}</div>
                <Button className="continue-button" onClick={continueLesson}><span><span className="play-circle"><Icon name="play" size={12} /></span> Next lesson</span><Icon name="arrow" /></Button>
              </>}
            </article>

            <aside className="right-rail">
              <div className="stat-card">
                <div className="panel-label">TODAY'S FOCUS</div>
                <div className="focus-ring"><svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="33" /><circle cx="40" cy="40" r="33" className="ring-progress" /></svg><span><strong>32</strong><small>MIN</small></span></div>
                <div><strong>Keep the momentum</strong><p>18 minutes left to hit your daily goal.</p></div>
              </div>
              <div className="quiz-card">
                <div className="quiz-label"><span>QUICK CHECK</span><span>1 OF 3</span></div>
                <p>{currentLesson?.quiz.question}</p>
                <div className="answers">
                  {currentLesson?.quiz.options.map((answer, index) => (
                    <Button key={`${answer}-${index}`} className={`${quizAnswer === index ? "selected" : ""} ${quizChecked && index === currentLesson.quiz.correctIndex ? "correct" : ""}`} onClick={() => { setQuizAnswer(index); setQuizChecked(false); }}>
                      <span>{String.fromCharCode(65 + index)}.</span> {answer}
                    </Button>
                  ))}
                </div>
                {quizChecked && <div className="quiz-result">
                  <strong>{quizAnswer === currentLesson?.quiz.correctIndex ? "Correct. " : "Not quite. "}</strong>{currentLesson?.quiz.explanation}
                </div>}
                <Button className="check-button" onClick={() => quizAnswer !== null && setQuizChecked(true)}>Check answer</Button>
              </div>
            </aside>
          </div>
        </section>
        </>)}
      </main>
    </div>
  );
}
