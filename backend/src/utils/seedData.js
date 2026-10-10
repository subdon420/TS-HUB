import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User.js';
import Workspace from '../models/Workspace.js';
import Project from '../models/Project.js';
import Bug from '../models/Bug.js';
import TestSuite from '../models/TestSuite.js';
import TestCase from '../models/TestCase.js';
import TestRun from '../models/TestRun.js';
import ActivityLog from '../models/ActivityLog.js';
import Comment from '../models/Comment.js';

dotenv.config({ path: path.resolve('.env') });

export const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/testers_home';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    console.log('[Seeder] Cleaning existing documents...');
    await Promise.all([
      User.deleteMany({}),
      Workspace.deleteMany({}),
      Project.deleteMany({}),
      Bug.deleteMany({}),
      TestSuite.deleteMany({}),
      TestCase.deleteMany({}),
      TestRun.deleteMany({}),
      ActivityLog.deleteMany({}),
      Comment.deleteMany({}),
    ]);

    console.log('[Seeder] Creating Workspace...');
    const workspace = await Workspace.create({
      name: 'Alpha QA Labs & Dev Core',
      code: 'ALPHA-QA',
      description: 'Primary workspace for Tester’s Home platform testing and development.',
    });

    console.log('[Seeder] Creating Users...');
    // Dedicated QA Tester Account
    const tester = await User.create({
      name: 'Alex Rivera (QA Lead)',
      email: 'tester@testers-home.io',
      password: 'tester123',
      role: 'tester',
      title: 'Senior QA Automation Architect',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlexRivera',
      workspace: workspace._id,
      status: 'online',
    });

    // Secondary QA Tester Account
    await User.create({
      name: 'Elena Rostova (QA Analyst)',
      email: 'alex.tester@testers-home.io',
      password: 'password123',
      role: 'tester',
      title: 'QA Functional Tester',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ElenaQA',
      workspace: workspace._id,
      status: 'online',
    });

    // Dedicated Developer Account
    const dev = await User.create({
      name: 'Samira Chen (Dev Lead)',
      email: 'dev@testers-home.io',
      password: 'dev123',
      role: 'developer',
      title: 'Principal Full-Stack Engineer',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SamiraDev',
      workspace: workspace._id,
      status: 'online',
    });

    // Secondary Developer Account
    await User.create({
      name: 'Marcus Brody (Backend Dev)',
      email: 'dev.sam@testers-home.io',
      password: 'password123',
      role: 'developer',
      title: 'Backend Systems Engineer',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MarcusDev',
      workspace: workspace._id,
      status: 'online',
    });

    // QA Admin Account
    const admin = await User.create({
      name: 'Sarah Connor (Admin)',
      email: 'admin@testers-home.io',
      password: 'admin123',
      role: 'admin',
      title: 'VP of Engineering & QA',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SarahAdmin',
      workspace: workspace._id,
      status: 'online',
    });

    workspace.owner = admin._id;
    workspace.members = [
      { user: tester._id, role: 'tester' },
      { user: dev._id, role: 'developer' },
      { user: admin._id, role: 'admin' },
    ];
    await workspace.save();

    console.log('[Seeder] Creating Projects...');
    const projectTHW = await Project.create({
      name: "Tester's Home Web App",
      key: 'THW',
      description: 'Unified QA & Developer cyber collaboration portal with real-time test execution.',
      workspace: workspace._id,
      owner: admin._id,
      members: [tester._id, dev._id, admin._id],
      healthScore: 94,
      repositoryUrl: 'https://github.com/testers-home/testers-home-web',
    });

    const projectPay = await Project.create({
      name: 'FinTech Secure Gateway',
      key: 'PAY',
      description: 'High-throughput payment processing engine with webhook idempotent delivery.',
      workspace: workspace._id,
      owner: admin._id,
      members: [tester._id, dev._id, admin._id],
      healthScore: 82,
      repositoryUrl: 'https://github.com/testers-home/fintech-gateway',
    });

    console.log('[Seeder] Creating Test Suites...');
    const suiteAuth = await TestSuite.create({
      title: 'Authentication & Dual-Portal RBAC',
      description: 'Validates tester vs developer login flows, JWT claims, and route guards.',
      project: projectTHW._id,
      creator: tester._id,
    });

    const suiteBugs = await TestSuite.create({
      title: 'Bug Lifecycle & Git Webhook Sync',
      description: 'Tests status progression from Draft to Closed, PR links, and auto-bug on failure.',
      project: projectTHW._id,
      creator: tester._id,
    });

    const suitePay = await TestSuite.create({
      title: 'Webhook Idempotency & HMAC Security',
      description: 'Verifies signature verification, rate limits, and replay attacks.',
      project: projectPay._id,
      creator: tester._id,
    });

    console.log('[Seeder] Creating Test Cases...');
    const tc1 = await TestCase.create({
      key: 'THW-TC-201',
      suite: suiteAuth._id,
      project: projectTHW._id,
      title: 'Verify Tester Login restricts Developer Bug Status modification',
      preconditions: 'User registered as QA Tester role and logged in with valid token.',
      steps: [
        { stepNumber: 1, action: 'Authenticate as alex.tester@testers-home.io', expectedOutcome: 'Auth token issued with role="tester"' },
        { stepNumber: 2, action: 'Attempt to mark bug status to "In Progress"', expectedOutcome: 'UI disables button & API returns HTTP 403 Forbidden' },
        { stepNumber: 3, action: 'Verify audit log records permission check', expectedOutcome: 'RBAC guard logged in audit stream' }
      ],
      testData: '{ "email": "alex.tester@testers-home.io", "role": "tester" }',
      expectedOutcome: 'Tester role is strictly barred from moving bugs to In Progress or Fixed.',
      severity: 'High',
      status: 'Active',
      lastExecutionStatus: 'Pass',
      creator: tester._id,
    });

    const tc2 = await TestCase.create({
      key: 'THW-TC-202',
      suite: suiteBugs._id,
      project: projectTHW._id,
      title: 'Verify Auto-Bug Generation when Test Case Execution fails',
      preconditions: 'Active test run cycle in progress.',
      steps: [
        { stepNumber: 1, action: 'Open Test Run Execution Drawer', expectedOutcome: 'Execution panel slides open with Pass/Fail buttons' },
        { stepNumber: 2, action: 'Click Fail button on test step', expectedOutcome: 'Auto-bug prompt opens pre-filled with failed step' },
        { stepNumber: 3, action: 'Confirm creation', expectedOutcome: 'Bug is created with linkedTestCase reference' }
      ],
      testData: '{ "runId": "active", "status": "Fail" }',
      expectedOutcome: 'Bug ticket created seamlessly referencing failed test case parameters.',
      severity: 'Critical',
      status: 'Active',
      lastExecutionStatus: 'Pass',
      creator: tester._id,
    });

    const tc3 = await TestCase.create({
      key: 'THW-TC-203',
      suite: suiteBugs._id,
      project: projectTHW._id,
      title: 'Verify GitHub Webhook PR merge transitions bug to Ready for QA',
      preconditions: 'Bug THW-BUG-103 in Open status.',
      steps: [
        { stepNumber: 1, action: 'Simulate GitHub PR webhook payload referencing THW-BUG-103', expectedOutcome: 'Webhook received on /api/webhooks/git' },
        { stepNumber: 2, action: 'Check bug status transition', expectedOutcome: 'Status changes immediately to "Ready for QA"' },
        { stepNumber: 3, action: 'Check socket event broadcast', expectedOutcome: 'All connected clients receive real-time status update' }
      ],
      testData: '{ "bugKey": "THW-BUG-103", "prUrl": "https://github.com/testers-home/pull/104" }',
      expectedOutcome: 'Webhook updates status to Ready for QA and emits real-time event.',
      severity: 'High',
      status: 'Active',
      lastExecutionStatus: 'Pass',
      creator: tester._id,
    });

    const tc4 = await TestCase.create({
      key: 'PAY-TC-301',
      suite: suitePay._id,
      project: projectPay._id,
      title: 'Verify Stripe webhook payload HMAC signature mismatch',
      preconditions: 'Gateway listening on /v1/webhooks/payments.',
      steps: [
        { stepNumber: 1, action: 'Send corrupted HMAC header in payload', expectedOutcome: 'Server rejects request with 401 Signature Verification Failed' },
        { stepNumber: 2, action: 'Check rate-limiter penalty', expectedOutcome: 'IP flagged for anomaly scoring' }
      ],
      testData: '{ "stripe-signature": "invalid_sig_abc123" }',
      expectedOutcome: 'Payload rejected and logged to security stream.',
      severity: 'Critical',
      status: 'Active',
      lastExecutionStatus: 'Pass',
      creator: tester._id,
    });

    console.log('[Seeder] Creating Bugs across all lifecycle states...');
    // Bug 1: Open Critical
    const bug1 = await Bug.create({
      key: 'THW-BUG-101',
      title: 'Memory leak in screen recorder stream during high-frame rate recording',
      description: 'When recording browser canvas for >60 seconds on high-DPI displays, memory spikes past 1.8GB.',
      project: projectTHW._id,
      status: 'Open',
      severity: 'Critical',
      priority: 'P1',
      environment: {
        os: 'Windows 11 Pro 64-bit',
        browser: 'Google Chrome 128.0',
        device: 'Workstation 32GB RAM',
        buildVersion: 'v2.1.0-nightly',
      },
      reproductionSteps: '1. Launch screen recorder drawer\n2. Select whole screen with 60fps recording\n3. Record for 90 seconds\n4. Observe Chrome task manager memory graph',
      expectedBehavior: 'MediaRecorder buffer chunks release periodically into blob storage without memory leak.',
      actualBehavior: 'Uncompressed chunk references retained in memory array causing browser tab crash.',
      reporter: tester._id,
      linkedTestCase: tc2._id,
    });

    // Bug 2: In Progress (Claimed by Dev)
    const bug2 = await Bug.create({
      key: 'THW-BUG-102',
      title: 'Command Palette (Ctrl+K) focus trap issue when modal is already visible',
      description: 'Triggering Ctrl+K while another modal is open causes key navigation focus to be trapped.',
      project: projectTHW._id,
      status: 'In Progress',
      severity: 'Medium',
      priority: 'P2',
      environment: {
        os: 'macOS Sonoma / Windows 11',
        browser: 'Firefox 129 / Chrome 128',
        device: 'Desktop',
        buildVersion: 'v2.1.0-nightly',
      },
      reproductionSteps: '1. Open bug creation modal\n2. Press Ctrl+K\n3. Try pressing Escape or Tab to navigate items',
      expectedBehavior: 'Command palette stacks properly on top with clear backdrop and handles keydown events.',
      actualBehavior: 'Underlying dialog captures enter and escape key events instead.',
      reporter: tester._id,
      assignee: dev._id,
    });

    // Bug 3: Ready for QA (Fixed by Dev with Git PR Link)
    const bug3 = await Bug.create({
      key: 'THW-BUG-103',
      title: 'Session token fails to clear in IndexedDB upon explicit user sign-out',
      description: 'Sign-out cleared localStorage but left auth token in IndexedDB cache.',
      project: projectTHW._id,
      status: 'Ready for QA',
      severity: 'High',
      priority: 'P1',
      environment: {
        os: 'Windows 11',
        browser: 'Edge 128',
        device: 'Desktop',
        buildVersion: 'v2.0.8',
      },
      reproductionSteps: '1. Sign in to Tester’s Home\n2. Click profile dropdown -> Sign Out\n3. Inspect IndexedDB storage in devtools',
      expectedBehavior: 'All storage engines (localStorage, sessionStorage, IndexedDB) purged completely.',
      actualBehavior: 'IndexedDB token cache still readable by script.',
      reporter: tester._id,
      assignee: dev._id,
      gitPrLink: 'https://github.com/testers-home/testers-home-web/pull/104',
      commitHash: 'f49b1a8',
      resolutionNotes: 'Purged auth context and wiped IndexedDB database store during onLogout event listener.',
      resolvedAt: new Date(Date.now() - 3600000 * 4),
    });

    // Bug 4: Verified & Closed
    const bug4 = await Bug.create({
      key: 'THW-BUG-104',
      title: 'Neo-glassmorphism background blur flickering on Safari 17.5',
      description: 'Backdrop blur CSS on glassmorphic cards produced visual stutter on scroll.',
      project: projectTHW._id,
      status: 'Verified & Closed',
      severity: 'Low',
      priority: 'P4',
      environment: {
        os: 'macOS 14.5',
        browser: 'Safari 17.5',
        device: 'MacBook Pro M2',
        buildVersion: 'v2.0.4',
      },
      reproductionSteps: '1. Open dashboard\n2. Scroll rapidly through project cards',
      expectedBehavior: 'Smooth 60fps GPU-accelerated scrolling with backdrop-filter.',
      actualBehavior: 'Occasional blank white rectangular flash behind glass card.',
      reporter: tester._id,
      assignee: dev._id,
      gitPrLink: 'https://github.com/testers-home/testers-home-web/pull/98',
      commitHash: '8a2b3c4',
      verifiedBy: tester._id,
      verifiedAt: new Date(Date.now() - 3600000 * 24),
      verificationNotes: 'Tested across Safari 17.5 and WebKit nightly. Confirmed hardware transform fixed the issue.',
    });

    // Bug 5: FinTech Bug
    const bug5 = await Bug.create({
      key: 'PAY-BUG-201',
      title: 'Webhook signature verification fails during multi-tenant retry dispatch',
      description: 'When webhook delivery retries with exponential backoff, raw body timestamp differs from header.',
      project: projectPay._id,
      status: 'Open',
      severity: 'Critical',
      priority: 'P1',
      environment: {
        os: 'Linux Ubuntu 22.04 LTS',
        browser: 'Backend Node 22',
        device: 'Cloud Runner',
        buildVersion: 'v3.4.1-rc',
      },
      reproductionSteps: '1. Trigger simulated failed webhook event\n2. Wait 30s for queue retry runner\n3. Inspect verification error log',
      expectedBehavior: 'Signature recomputed using actual payload dispatch timestamp.',
      actualBehavior: 'Original header timestamp retained causing signature check failure.',
      reporter: tester._id,
      assignee: dev._id,
    });

    console.log('[Seeder] Creating Test Runs...');
    const runSmoke = await TestRun.create({
      title: 'Regression Cycle 2026.10 - Core Experience',
      runNumber: 1,
      project: projectTHW._id,
      suite: suiteAuth._id,
      executedBy: tester._id,
      status: 'Completed',
      environment: 'Staging Environment',
      totalCases: 2,
      passedCount: 2,
      failedCount: 0,
      blockedCount: 0,
      skippedCount: 0,
      results: [
        { testCase: tc1._id, status: 'Pass', notes: 'RBAC rules verified correctly', executedAt: new Date() },
        { testCase: tc2._id, status: 'Pass', notes: 'Auto-bug generation verified', executedAt: new Date() }
      ],
      completedAt: new Date(),
    });

    console.log('[Seeder] Creating Discussion Comments...');
    await Comment.create({
      entityType: 'bug',
      entityId: bug1._id,
      entityTypeModel: 'Bug',
      author: dev._id,
      content: 'I reproduced this in Chrome devtools memory profile. We are retaining array buffers in the chunk accumulator. Working on a fix with stream piping.',
      codeSnippet: {
        language: 'javascript',
        code: `// Proposed fix in recorder stream pipeline\nmediaRecorder.ondataavailable = (event) => {\n  if (event.data.size > 0) {\n    fileStream.write(event.data);\n    // do not accumulate in unmanaged memory\n  }\n};`,
      },
    });

    await Comment.create({
      entityType: 'bug',
      entityId: bug1._id,
      entityTypeModel: 'Bug',
      author: tester._id,
      content: 'Awesome! Let me know as soon as the PR is pushed so I can run our high-DPI test suite.',
    });

    console.log('[Seeder] Creating Activity Logs...');
    await ActivityLog.create({
      project: projectTHW._id,
      user: tester._id,
      userRole: 'tester',
      action: 'LOGGED_BUG',
      entityType: 'bug',
      entityId: bug1._id.toString(),
      entityTitle: bug1.title,
      message: `${tester.name} reported [${bug1.key}] "${bug1.title}" (Critical)`,
      meta: { severity: bug1.severity, priority: bug1.priority },
    });

    await ActivityLog.create({
      project: projectTHW._id,
      user: tester._id,
      userRole: 'tester',
      action: 'CREATED_TEST_SUITE',
      entityType: 'testSuite',
      entityId: suiteAuth._id.toString(),
      entityTitle: suiteAuth.title,
      message: `${tester.name} created test suite "${suiteAuth.title}" (3 cases)`,
    });

    await ActivityLog.create({
      project: projectTHW._id,
      user: tester._id,
      userRole: 'tester',
      action: 'STARTED_TEST_RUN',
      entityType: 'testRun',
      entityId: runSmoke._id.toString(),
      entityTitle: runSmoke.title,
      message: `${tester.name} initiated test run "${runSmoke.title}" against Staging-v2.4.0`,
    });

    await ActivityLog.create({
      project: projectTHW._id,
      user: dev._id,
      userRole: 'developer',
      action: 'CLAIMED_BUG',
      entityType: 'bug',
      entityId: bug2._id.toString(),
      entityTitle: bug2.title,
      message: `${dev.name} claimed [${bug2.key}] "${bug2.title}" for resolution`,
    });

    await ActivityLog.create({
      project: projectTHW._id,
      user: dev._id,
      userRole: 'developer',
      action: 'STATUS_TRANSITION',
      entityType: 'bug',
      entityId: bug3._id.toString(),
      entityTitle: bug3.title,
      message: `${dev.name} pushed fix branch fix/csv-export-null & marked [${bug3.key}] "Ready for QA" with PR #104`,
      meta: { gitPrLink: bug3.gitPrLink, commitHash: bug3.commitHash },
    });

    await ActivityLog.create({
      project: projectTHW._id,
      user: dev._id,
      userRole: 'developer',
      action: 'COMMENT_ADDED',
      entityType: 'bug',
      entityId: bug1._id.toString(),
      entityTitle: bug1.title,
      message: `${dev.name} commented on [${bug1.key}]: "Identified race condition in Refresh Token lock. Hotfix in staging."`,
    });

    await ActivityLog.create({
      project: projectTHW._id,
      user: tester._id,
      userRole: 'tester',
      action: 'STATUS_TRANSITION',
      entityType: 'bug',
      entityId: bug4._id.toString(),
      entityTitle: bug4.title,
      message: `${tester.name} verified fix in build 2.4.1-rc & closed [${bug4.key}]`,
      meta: { verificationNotes: bug4.verificationNotes },
    });

    console.log('✅ [Seeder] Database seeding finished successfully!');
    console.log('👉 Open MongoDB Compass and connect to: mongodb://127.0.0.1:27017/testers_home');
    return true;
  } catch (error) {
    console.error('❌ [Seeder] Error seeding database:', error);
    throw error;
  }
};

// Allow running directly via "node src/utils/seedData.js"
if (process.argv[1]?.endsWith('seedData.js')) {
  seedDatabase().then(() => {
    process.exit(0);
  }).catch(() => {
    process.exit(1);
  });
}

