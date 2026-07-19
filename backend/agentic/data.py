from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class QueryTemplate:
    id: str
    label: str
    query: str
    intent: str


@dataclass(frozen=True)
class LearnerRecord:
    id: str
    name: str
    department: str
    location: str
    manager: str
    required_course: str
    due_date: str
    days_past_due: int
    status: str
    escalation: str
    risk_score: int
    reason: str
    citations: tuple[str, ...]
    recommendation: str

    def to_json(self) -> dict[str, object]:
        return {
            "id": self.id,
            "name": self.name,
            "department": self.department,
            "location": self.location,
            "manager": self.manager,
            "requiredCourse": self.required_course,
            "dueDate": self.due_date,
            "daysPastDue": self.days_past_due,
            "status": self.status,
            "escalation": self.escalation,
            "riskScore": self.risk_score,
            "reason": self.reason,
            "citations": list(self.citations),
            "recommendation": self.recommendation,
        }


@dataclass(frozen=True)
class CourseRecommendation:
    course_id: str
    title: str
    match_reason: str
    audience: str
    duration: str
    confidence: int

    def to_json(self) -> dict[str, object]:
        return {
            "courseId": self.course_id,
            "title": self.title,
            "matchReason": self.match_reason,
            "audience": self.audience,
            "duration": self.duration,
            "confidence": self.confidence,
        }


QUERY_TEMPLATES = [
    QueryTemplate(
        id="missing-compliance",
        label="Missing compliance",
        intent="compliance",
        query="Who has not completed required compliance training this quarter?",
    ),
    QueryTemplate(
        id="high-risk",
        label="High risk employees",
        intent="risk",
        query="Show overdue learners with escalation risk and policy citations.",
    ),
    QueryTemplate(
        id="recommend",
        label="Course recommendations",
        intent="recommendations",
        query="Recommend replacement courses for overdue data privacy training.",
    ),
    QueryTemplate(
        id="notify",
        label="Draft reminders",
        intent="communications",
        query="Prepare manager-approved reminder drafts for overdue learners.",
    ),
]


LEARNER_RECORDS = [
    LearnerRecord(
        id="EMP-1024",
        name="Maya Chen",
        department="Finance Operations",
        location="Chicago, US",
        manager="Asha Mehta",
        required_course="Data Privacy and Records Handling",
        due_date="2026-07-10",
        days_past_due=9,
        status="overdue",
        escalation="manager",
        risk_score=87,
        reason="Course assigned by SOX policy group; no completion record after sync SLA window.",
        citations=("POL-DP-014", "LRN-88431", "SYNC-2026-07-19"),
        recommendation="Data Privacy Refresher for Finance Teams",
    ),
    LearnerRecord(
        id="EMP-1178",
        name="Jordan Patel",
        department="Customer Success",
        location="Austin, US",
        manager="Asha Mehta",
        required_course="Global Anti-Bribery Essentials",
        due_date="2026-07-15",
        days_past_due=4,
        status="due-soon",
        escalation="none",
        risk_score=54,
        reason="Deadline inside grace period; reminder permitted but escalation suppressed.",
        citations=("POL-ABC-008", "GRACE-7D", "LRN-77301"),
        recommendation="Anti-Bribery Essentials: Field Scenarios",
    ),
    LearnerRecord(
        id="EMP-1310",
        name="Elena Rossi",
        department="Supply Chain",
        location="Boston, US",
        manager="Asha Mehta",
        required_course="Workplace Safety Annual",
        due_date="2026-06-28",
        days_past_due=21,
        status="under-review",
        escalation="hrbp",
        risk_score=73,
        reason="Learner disputed roster eligibility after transfer; P2 freeze blocks notification escalation.",
        citations=("POL-SAFE-021", "DISP-5519", "XFER-2026-07"),
        recommendation="Workplace Safety for Distribution Teams",
    ),
    LearnerRecord(
        id="EMP-1442",
        name="Noah Williams",
        department="Product Engineering",
        location="Seattle, US",
        manager="Asha Mehta",
        required_course="Secure Development Lifecycle",
        due_date="2026-07-01",
        days_past_due=18,
        status="overdue",
        escalation="manager",
        risk_score=81,
        reason="Mandatory engineering control; completion missing in learningRecords projection.",
        citations=("POL-SEC-019", "LRN-66492", "HCM-PRJ-6F"),
        recommendation="Secure Development Lifecycle: Applied Controls",
    ),
    LearnerRecord(
        id="EMP-1505",
        name="Priya Nair",
        department="Human Resources",
        location="Dallas, US",
        manager="Asha Mehta",
        required_course="Employee Data Stewardship",
        due_date="2026-07-08",
        days_past_due=11,
        status="complete",
        escalation="none",
        risk_score=12,
        reason="Completion found in latest sync; excluded from outreach result set.",
        citations=("POL-HR-006", "LRN-44018", "SYNC-2026-07-19"),
        recommendation="People Data Stewardship Advanced",
    ),
]


RECOMMENDATIONS = [
    CourseRecommendation(
        course_id="LI-90441",
        title="Data Privacy Refresher for Finance Teams",
        match_reason="Vector B matched outcomes for SOX data retention, restricted PII, and audit evidence.",
        audience="Finance, HR, Operations",
        duration="38 min",
        confidence=94,
    ),
    CourseRecommendation(
        course_id="LI-81720",
        title="Anti-Bribery Essentials: Field Scenarios",
        match_reason="Fusion score favored scenario syllabus and policy keywords for customer-facing teams.",
        audience="Sales, Customer Success",
        duration="46 min",
        confidence=89,
    ),
    CourseRecommendation(
        course_id="LI-77113",
        title="Secure Development Lifecycle: Applied Controls",
        match_reason="Outcome vector aligned to secure coding, dependency review, and release gate evidence.",
        audience="Engineering",
        duration="55 min",
        confidence=91,
    ),
]


def template_to_json(template: QueryTemplate) -> dict[str, str]:
    return {
        "id": template.id,
        "label": template.label,
        "query": template.query,
        "intent": template.intent,
    }
