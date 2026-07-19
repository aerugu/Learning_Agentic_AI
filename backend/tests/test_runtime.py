from __future__ import annotations

import unittest

from agentic.runtime import run_agentic_compliance_query


class AgenticRuntimeTests(unittest.TestCase):
    def test_high_risk_query_returns_oracle_cohere_metadata(self) -> None:
        result = run_agentic_compliance_query(
            {
                "query": "Show overdue learners with escalation risk and policy citations.",
                "templateId": "high-risk",
                "managerEmail": "asha.mehta@example.com",
            }
        )

        self.assertEqual(result["runtimeMode"], "mock")
        self.assertEqual(result["supervisorModel"], "cohere.command-r-plus")
        self.assertEqual(result["embeddingModel"], "cohere.embed-english-v3.0")
        self.assertEqual(result["evaluation"]["deploymentGate"], "pass")
        self.assertGreaterEqual(len(result["records"]), 2)
        self.assertGreaterEqual(len(result["recommendations"]), 1)
        self.assertIn("Oracle Database 23ai AI Vector Search", str(result["trace"]))


if __name__ == "__main__":
    unittest.main()
