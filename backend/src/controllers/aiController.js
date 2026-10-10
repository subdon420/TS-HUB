export const polishBugReport = async (req, res) => {
  try {
    const { rawTitle, rawSteps, rawLogs, rawExpected, rawActual, environment } = req.body;

    // AI heuristic polish engine that structures messy tester notes into professional QA format
    let polishedTitle = rawTitle ? rawTitle.trim() : 'Unexpected system failure during operation';
    if (!polishedTitle.match(/^(Fix|Bug|Crash|Error|Failure|Anomaly|Regression|UI):/i)) {
      polishedTitle = `[Defect] ${polishedTitle}`;
    }

    // Polish reproduction steps into clean numbered markdown
    let cleanedSteps = '';
    if (rawSteps) {
      const rawLines = rawSteps.split(/[\n;]+/).map(s => s.trim()).filter(Boolean);
      cleanedSteps = rawLines.map((line, idx) => {
        const stripped = line.replace(/^\d+[\.\-\)]\s*/, '');
        return `${idx + 1}. ${stripped.charAt(0).toUpperCase() + stripped.slice(1)}`;
      }).join('\n');
    } else {
      cleanedSteps = `1. Navigate to target application view\n2. Trigger user action with specified payload\n3. Observe anomalous response or unhandled exception`;
    }

    // Extract stack traces or error logs
    let extractedLogs = '';
    if (rawLogs && rawLogs.trim()) {
      extractedLogs = `### 📋 Extracted Diagnostic Log & Stack Trace\n\`\`\`json\n${rawLogs.trim()}\n\`\`\``;
    }

    const polishedMarkdown = `## 🐞 Bug Summary\n**${polishedTitle}**\n\n### ⚙️ Environment Details\n- **OS:** ${environment?.os || 'Windows 11'}\n- **Browser:** ${environment?.browser || 'Chrome 128 (x86_64)'}\n- **Device:** ${environment?.device || 'Desktop Workstation'}\n- **Build Version:** ${environment?.buildVersion || 'v1.4.2-staging'}\n\n### 👣 Steps to Reproduce\n${cleanedSteps}\n\n### 🎯 Expected Behavior\n${rawExpected || 'System processes request successfully without visual or data degradation.'}\n\n### 💥 Actual Behavior\n${rawActual || 'System threw unhandled exception and failed to update state.'}\n\n${extractedLogs}`;

    res.json({
      success: true,
      polishedTitle,
      reproductionSteps: cleanedSteps,
      expectedBehavior: rawExpected || 'Expected smooth execution without runtime degradation.',
      actualBehavior: rawActual || 'Actual response halted with error condition.',
      fullMarkdown: polishedMarkdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

