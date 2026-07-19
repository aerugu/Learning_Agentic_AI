export type QueryTemplate = {
  id: string;
  label: string;
  query: string;
  intent: "compliance" | "risk" | "recommendations" | "communications";
};

export type LearnerStatus =
  | "overdue"
  | "due-soon"
  | "under-review"
  | "complete";

export type LearnerRecord = {
  id: string;
  name: string;
  department: string;
  location: string;
  manager: string;
  requiredCourse: string;
  dueDate: string;
  daysPastDue: number;
  status: LearnerStatus;
  escalation: "none" | "manager" | "hrbp" | "legal";
  riskScore: number;
  reason: string;
  citations: string[];
  recommendation: string;
};

export type CourseRecommendation = {
  courseId: string;
  title: string;
  matchReason: string;
  audience: string;
  duration: string;
  confidence: number;
};

export const managerProfile = {
  name: "Asha Mehta",
  role: "Regional Learning Compliance Manager",
  org: "Oracle Fusion HCM Learning Cloud",
  lastSync: "July 19, 2026, 5:10 PM CT",
};

export const queryTemplates: QueryTemplate[] = [
  {
    id: "missing-compliance",
    label: "Missing compliance",
    intent: "compliance",
    query: "Who has not completed required compliance training this quarter?",
  },
  {
    id: "high-risk",
    label: "High risk employees",
    intent: "risk",
    query: "Show overdue learners with escalation risk and policy citations.",
  },
  {
    id: "recommend",
    label: "Course recommendations",
    intent: "recommendations",
    query: "Recommend replacement courses for overdue data privacy training.",
  },
  {
    id: "notify",
    label: "Draft reminders",
    intent: "communications",
    query: "Prepare manager-approved reminder drafts for overdue learners.",
  },
];

export const learnerRecords: LearnerRecord[] = [
  {
    id: "EMP-1024",
    name: "Maya Chen",
    department: "Finance Operations",
    location: "Chicago, US",
    manager: "Asha Mehta",
    requiredCourse: "Data Privacy and Records Handling",
    dueDate: "2026-07-10",
    daysPastDue: 9,
    status: "overdue",
    escalation: "manager",
    riskScore: 87,
    reason: "Course assigned by SOX policy group; no completion record after sync SLA window.",
    citations: ["POL-DP-014", "LRN-88431", "SYNC-2026-07-19"],
    recommendation: "Data Privacy Refresher for Finance Teams",
  },
  {
    id: "EMP-1178",
    name: "Jordan Patel",
    department: "Customer Success",
    location: "Austin, US",
    manager: "Asha Mehta",
    requiredCourse: "Global Anti-Bribery Essentials",
    dueDate: "2026-07-15",
    daysPastDue: 4,
    status: "due-soon",
    escalation: "none",
    riskScore: 54,
    reason: "Deadline inside grace period; reminder permitted but escalation suppressed.",
    citations: ["POL-ABC-008", "GRACE-7D", "LRN-77301"],
    recommendation: "Anti-Bribery Essentials: Field Scenarios",
  },
  {
    id: "EMP-1310",
    name: "Elena Rossi",
    department: "Supply Chain",
    location: "Boston, US",
    manager: "Asha Mehta",
    requiredCourse: "Workplace Safety Annual",
    dueDate: "2026-06-28",
    daysPastDue: 21,
    status: "under-review",
    escalation: "hrbp",
    riskScore: 73,
    reason: "Learner disputed roster eligibility after transfer; P2 freeze blocks notification escalation.",
    citations: ["POL-SAFE-021", "DISP-5519", "XFER-2026-07"],
    recommendation: "Workplace Safety for Distribution Teams",
  },
  {
    id: "EMP-1442",
    name: "Noah Williams",
    department: "Product Engineering",
    location: "Seattle, US",
    manager: "Asha Mehta",
    requiredCourse: "Secure Development Lifecycle",
    dueDate: "2026-07-01",
    daysPastDue: 18,
    status: "overdue",
    escalation: "manager",
    riskScore: 81,
    reason: "Mandatory engineering control; completion missing in learningRecords projection.",
    citations: ["POL-SEC-019", "LRN-66492", "HCM-PRJ-6F"],
    recommendation: "Secure Development Lifecycle: Applied Controls",
  },
  {
    id: "EMP-1505",
    name: "Priya Nair",
    department: "Human Resources",
    location: "Dallas, US",
    manager: "Asha Mehta",
    requiredCourse: "Employee Data Stewardship",
    dueDate: "2026-07-08",
    daysPastDue: 11,
    status: "complete",
    escalation: "none",
    riskScore: 12,
    reason: "Completion found in latest sync; excluded from outreach result set.",
    citations: ["POL-HR-006", "LRN-44018", "SYNC-2026-07-19"],
    recommendation: "People Data Stewardship Advanced",
  },
];

export const recommendations: CourseRecommendation[] = [
  {
    courseId: "LI-90441",
    title: "Data Privacy Refresher for Finance Teams",
    matchReason: "Vector B matched outcomes for SOX data retention, restricted PII, and audit evidence.",
    audience: "Finance, HR, Operations",
    duration: "38 min",
    confidence: 94,
  },
  {
    courseId: "LI-81720",
    title: "Anti-Bribery Essentials: Field Scenarios",
    matchReason: "Fusion score favored scenario syllabus and policy keywords for customer-facing teams.",
    audience: "Sales, Customer Success",
    duration: "46 min",
    confidence: 89,
  },
  {
    courseId: "LI-77113",
    title: "Secure Development Lifecycle: Applied Controls",
    matchReason: "Outcome vector aligned to secure coding, dependency review, and release gate evidence.",
    audience: "Engineering",
    duration: "55 min",
    confidence: 91,
  },
];

export const guardrails = [
  "Eligibility pre-filter before LLM roster access",
  "Mandatory citations or response is dropped",
  "Dispute registry freezes escalation",
  "Semantic cache keyed by query vector and org scope",
  "Human approval gate before notifications",
  "PII masking, moderation, timeout, and retry budgets",
];
