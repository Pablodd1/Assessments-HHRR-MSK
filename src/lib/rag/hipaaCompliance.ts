/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HIPAA COMPLIANCE MODULE — 45 CFR 164.312 Technical Safeguards
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Sources & Provenance:
 *   Regulation — 45 CFR 164.312 (HIPAA Security Rule, Technical Safeguards)
 *   Guidance — HHS Office for Civil Rights FAQ & Cybersecurity Newsletters
 *   Framework — NIST SP 800-66 (HIPAA Security Rule implementation guide)
 *
 * KEY REGULATORY FACTS:
 *   - The rule is technology-neutral (no specific stack mandated)
 *   - "Addressable" ≠ optional. Must implement OR document why equivalent/not needed.
 *   - Encryption is addressable but extremely difficult to justify NOT using in a cloud app.
 *   - Audit controls are REQUIRED (no opt-out), but HIPAA does not specify exact events to log.
 *   - Risk analysis is the foundation — all technical decisions flow from it.
 */

// ─── Safeguard Definitions per 45 CFR 164.312 ─────────────────────────

export type SafeguardStatus = 'required' | 'addressable';
export type ComplianceState = 'compliant' | 'partial' | 'non_compliant' | 'not_assessed';

export interface TechnicalSafeguard {
  id: string;
  section: string;
  title: string;
  status: SafeguardStatus;
  description: string;
  implementationGuidance: string[];
  commonControls: string[];
  regulatoryNote?: string;
}

export const TECHNICAL_SAFEGUARDS: TechnicalSafeguard[] = [
  // ─── §164.312(a) Access Control ───
  {
    id: 'ac_unique_user',
    section: '§164.312(a)(2)(i)',
    title: 'Unique User Identification',
    status: 'required',
    description: 'Assign a unique name and/or number for identifying and tracking user identity.',
    implementationGuidance: [
      'Implement unique user accounts (no shared credentials)',
      'Use email or employee ID as unique identifier',
      'Maintain user registry with creation/modification timestamps',
      'Disable accounts upon termination within 24 hours'
    ],
    commonControls: [
      'UUID-based user records in database',
      'OAuth/OIDC identity provider integration',
      'Employee ID linkage to access credentials',
      'Automated deprovisioning workflow'
    ]
  },
  {
    id: 'ac_emergency',
    section: '§164.312(a)(2)(ii)',
    title: 'Emergency Access Procedure',
    status: 'required',
    description: 'Establish procedures for obtaining necessary ePHI during an emergency.',
    implementationGuidance: [
      'Document break-glass procedures for system outages',
      'Define emergency access roles and authorization chain',
      'Log all emergency access events for post-incident review',
      'Test emergency procedures at least annually'
    ],
    commonControls: [
      'Break-glass admin accounts (sealed credentials)',
      'Emergency access audit trail',
      'Recovery procedures documented and tested',
      'On-call authorization chain'
    ]
  },
  {
    id: 'ac_auto_logoff',
    section: '§164.312(a)(2)(iii)',
    title: 'Automatic Logoff',
    status: 'addressable',
    description: 'Implement procedures that terminate an electronic session after a predetermined time of inactivity.',
    implementationGuidance: [
      'Set session timeout (recommended: 15-30 minutes for clinical apps)',
      'Implement idle detection with warning before logout',
      'Clear sensitive data from client on session expiry',
      'Consider role-based timeout (shorter for admin, longer for clinical workflow)'
    ],
    commonControls: [
      'JWT expiration with short-lived tokens (15-60 min)',
      'Refresh token rotation',
      'Client-side idle timer with automatic redirect to login',
      'Session invalidation on server side'
    ]
  },
  {
    id: 'ac_encryption',
    section: '§164.312(a)(2)(iv)',
    title: 'Encryption and Decryption',
    status: 'addressable',
    description: 'Implement a mechanism to encrypt and decrypt ePHI.',
    implementationGuidance: [
      'Encrypt ePHI at rest using AES-256 or equivalent',
      'Use database-level encryption (e.g., Supabase TDE, AWS RDS encryption)',
      'Encrypt application-level sensitive fields (SSN, clinical notes)',
      'Manage encryption keys with dedicated KMS (not in application code)'
    ],
    commonControls: [
      'AES-256 at-rest encryption for database storage',
      'Column-level encryption for high-sensitivity fields',
      'Key Management Service (AWS KMS, GCP KMS, Vault)',
      'Key rotation policy (annual minimum)'
    ],
    regulatoryNote: 'While addressable, it is extremely difficult to justify NOT encrypting stored ePHI in a modern cloud application. Document rationale if not implementing.'
  },

  // ─── §164.312(b) Audit Controls ───
  {
    id: 'audit_controls',
    section: '§164.312(b)',
    title: 'Audit Controls',
    status: 'required',
    description: 'Implement hardware, software, and/or procedural mechanisms that record and examine activity in information systems that contain or use ePHI.',
    implementationGuidance: [
      'Log all access to ePHI (who, what, when, from where)',
      'Log authentication events (success and failure)',
      'Log data modifications (create, update, delete) with before/after values',
      'Log administrative actions (user creation, permission changes)',
      'Implement log integrity protection (append-only, signed)',
      'Review logs regularly — HHS recommends regular review schedule',
      'Restrict access to audit trails (separate from operational access)'
    ],
    commonControls: [
      'Structured audit log table with immutable writes',
      'Application-level middleware logging all API calls',
      'Database trigger-based change tracking',
      'SIEM integration for automated alerting',
      'Log retention policy (minimum 6 years per HIPAA retention)',
      'Tamper-evident logging (hash chains or write-once storage)'
    ],
    regulatoryNote: 'HIPAA does not specify exactly which events or how often to review. HHS guidance says logs should support: inappropriate access detection, unauthorized disclosure tracking, intrusion detection, and forensic investigation.'
  },

  // ─── §164.312(c) Integrity ───
  {
    id: 'integrity',
    section: '§164.312(c)(1)',
    title: 'Integrity',
    status: 'required',
    description: 'Implement policies and procedures to protect ePHI from improper alteration or destruction.',
    implementationGuidance: [
      'Implement data validation on all ePHI inputs',
      'Use database constraints and referential integrity',
      'Implement version control / change tracking for clinical records',
      'Regular integrity checks (checksums, reconciliation)'
    ],
    commonControls: [
      'Database constraints (NOT NULL, CHECK, FK)',
      'Application-level input validation and sanitization',
      'Record versioning with immutable history',
      'Automated backup integrity verification'
    ]
  },
  {
    id: 'integrity_mechanism',
    section: '§164.312(c)(2)',
    title: 'Mechanism to Authenticate ePHI',
    status: 'addressable',
    description: 'Implement electronic mechanisms to corroborate that ePHI has not been altered or destroyed in an unauthorized manner.',
    implementationGuidance: [
      'Implement digital signatures or HMAC on critical records',
      'Use checksums for data transfer verification',
      'Consider blockchain-style hash chains for audit integrity',
      'Verify backup data integrity before restoration'
    ],
    commonControls: [
      'SHA-256 checksums on clinical assessment records',
      'HMAC-signed API responses for sensitive data',
      'Database row-level hash for tamper detection',
      'Automated integrity monitoring alerts'
    ]
  },

  // ─── §164.312(d) Person or Entity Authentication ───
  {
    id: 'authentication',
    section: '§164.312(d)',
    title: 'Person or Entity Authentication',
    status: 'required',
    description: 'Implement procedures to verify that a person or entity seeking access to ePHI is the one claimed.',
    implementationGuidance: [
      'Implement multi-factor authentication (MFA) for all ePHI access',
      'Use strong password policies (minimum 12 characters, complexity)',
      'Implement account lockout after failed attempts',
      'Verify identity before account recovery/password reset',
      'Consider biometric or hardware token for high-privilege access'
    ],
    commonControls: [
      'OAuth 2.0 / OIDC with certified identity provider',
      'TOTP-based MFA (Google Authenticator, Authy)',
      'SSO integration for enterprise deployments',
      'Certificate-based mutual TLS for system-to-system',
      'Rate limiting on authentication endpoints'
    ]
  },

  // ─── §164.312(e) Transmission Security ───
  {
    id: 'transmission_security',
    section: '§164.312(e)(1)',
    title: 'Transmission Security',
    status: 'required',
    description: 'Implement technical security measures to guard against unauthorized access to ePHI that is being transmitted over an electronic communications network.',
    implementationGuidance: [
      'Enforce TLS 1.2+ for all data in transit',
      'Implement HSTS headers to prevent downgrade attacks',
      'Use certificate pinning for mobile applications',
      'Encrypt email containing ePHI (S/MIME or portal-based)'
    ],
    commonControls: [
      'TLS 1.3 on all endpoints (Vercel/Cloudflare provides this)',
      'HSTS with max-age >= 31536000',
      'Certificate transparency monitoring',
      'VPN for administrative access to infrastructure'
    ]
  },
  {
    id: 'transmission_integrity',
    section: '§164.312(e)(2)(i)',
    title: 'Integrity Controls (Transmission)',
    status: 'addressable',
    description: 'Implement security measures to ensure that electronically transmitted ePHI is not improperly modified without detection until disposed of.',
    implementationGuidance: [
      'TLS provides integrity via MAC in the protocol',
      'Implement request signing for API-to-API communication',
      'Use Content-MD5 or similar for file transfers',
      'Verify data integrity on receipt (checksums)'
    ],
    commonControls: [
      'TLS MAC (built into protocol)',
      'API request signing (HMAC-SHA256)',
      'File upload checksum verification',
      'Message queue delivery receipts'
    ]
  },
  {
    id: 'transmission_encryption',
    section: '§164.312(e)(2)(ii)',
    title: 'Encryption (Transmission)',
    status: 'addressable',
    description: 'Implement a mechanism to encrypt ePHI whenever deemed appropriate.',
    implementationGuidance: [
      'Encrypt all ePHI in transit (TLS 1.2+ minimum)',
      'End-to-end encryption for messaging containing ePHI',
      'Encrypt database connections (SSL/TLS to database)',
      'Encrypt inter-service communication in microservices'
    ],
    commonControls: [
      'TLS 1.3 everywhere',
      'Database SSL connections enforced',
      'Encrypted message queues',
      'VPN tunnels for cross-region replication'
    ],
    regulatoryNote: 'Same as at-rest encryption: addressable but extremely difficult to justify NOT implementing for a web application handling ePHI.'
  }
];


// ─── Compliance Assessment Engine ──────────────────────────────────────

export interface ComplianceAssessmentItem {
  safeguardId: string;
  state: ComplianceState;
  implementedControls: string[];
  gaps: string[];
  remediationPlan?: string;
  targetDate?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ComplianceReport {
  assessmentDate: string;
  overallScore: number;          // 0-100
  overallStatus: 'compliant' | 'substantial_gaps' | 'critical_gaps';
  requiredSafeguards: { total: number; compliant: number; partial: number; nonCompliant: number };
  addressableSafeguards: { total: number; compliant: number; partial: number; nonCompliant: number; documented_na: number };
  criticalFindings: string[];
  prioritizedRemediation: string[];
  provenance: {
    regulation: string;
    guidance: string[];
    assessmentMethod: string;
  };
}

export function assessCompliance(items: ComplianceAssessmentItem[]): ComplianceReport {
  const required = items.filter(i => {
    const safeguard = TECHNICAL_SAFEGUARDS.find(s => s.id === i.safeguardId);
    return safeguard?.status === 'required';
  });
  const addressable = items.filter(i => {
    const safeguard = TECHNICAL_SAFEGUARDS.find(s => s.id === i.safeguardId);
    return safeguard?.status === 'addressable';
  });

  const reqCompliant = required.filter(i => i.state === 'compliant').length;
  const reqPartial = required.filter(i => i.state === 'partial').length;
  const reqNonCompliant = required.filter(i => i.state === 'non_compliant').length;

  const addrCompliant = addressable.filter(i => i.state === 'compliant').length;
  const addrPartial = addressable.filter(i => i.state === 'partial').length;
  const addrNonCompliant = addressable.filter(i => i.state === 'non_compliant').length;

  // Score: required safeguards weighted 2x
  const requiredScore = required.length > 0
    ? ((reqCompliant * 100 + reqPartial * 50) / (required.length * 100)) * 100
    : 100;
  const addressableScore = addressable.length > 0
    ? ((addrCompliant * 100 + addrPartial * 50) / (addressable.length * 100)) * 100
    : 100;
  const overallScore = Math.round((requiredScore * 0.7) + (addressableScore * 0.3));

  let overallStatus: ComplianceReport['overallStatus'];
  if (reqNonCompliant > 0) overallStatus = 'critical_gaps';
  else if (reqPartial > 0 || addrNonCompliant > 1) overallStatus = 'substantial_gaps';
  else overallStatus = 'compliant';

  const criticalFindings = items
    .filter(i => i.state === 'non_compliant' && i.riskLevel === 'critical')
    .map(i => {
      const sg = TECHNICAL_SAFEGUARDS.find(s => s.id === i.safeguardId);
      return `${sg?.section} ${sg?.title}: Non-compliant — ${i.gaps.join('; ')}`;
    });

  const prioritizedRemediation = items
    .filter(i => i.state !== 'compliant')
    .sort((a, b) => {
      const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    })
    .slice(0, 5)
    .map(i => {
      const sg = TECHNICAL_SAFEGUARDS.find(s => s.id === i.safeguardId);
      return `[${i.riskLevel.toUpperCase()}] ${sg?.title}: ${i.remediationPlan || 'Remediation plan needed'}`;
    });

  return {
    assessmentDate: new Date().toISOString().split('T')[0],
    overallScore,
    overallStatus,
    requiredSafeguards: { total: required.length, compliant: reqCompliant, partial: reqPartial, nonCompliant: reqNonCompliant },
    addressableSafeguards: { total: addressable.length, compliant: addrCompliant, partial: addrPartial, nonCompliant: addrNonCompliant, documented_na: 0 },
    criticalFindings,
    prioritizedRemediation,
    provenance: {
      regulation: '45 CFR 164.312 — HIPAA Security Rule, Technical Safeguards',
      guidance: [
        'HHS Office for Civil Rights FAQ on encryption',
        'HHS Cybersecurity Newsletter on audit controls',
        'NIST SP 800-66 — HIPAA Security Rule implementation guide'
      ],
      assessmentMethod: 'Self-assessment against enumerated safeguard specifications'
    }
  };
}


// ─── Current Platform Compliance Status (Honest Assessment) ────────────

export function getPlatformComplianceStatus(): ComplianceAssessmentItem[] {
  return [
    {
      safeguardId: 'ac_unique_user',
      state: 'partial',
      implementedControls: ['Role-based demo login', 'User context with role separation'],
      gaps: ['No real authentication system', 'No unique user ID persistence', 'No account management'],
      remediationPlan: 'Implement JWT/OAuth with Supabase Auth or Auth0',
      riskLevel: 'critical'
    },
    {
      safeguardId: 'ac_emergency',
      state: 'non_compliant',
      implementedControls: [],
      gaps: ['No emergency access procedures documented', 'No break-glass mechanism'],
      remediationPlan: 'Document emergency procedures, implement admin override with audit logging',
      riskLevel: 'medium'
    },
    {
      safeguardId: 'ac_auto_logoff',
      state: 'non_compliant',
      implementedControls: [],
      gaps: ['No session timeout implemented', 'No idle detection'],
      remediationPlan: 'Add JWT expiration (30 min) with refresh token rotation and client idle timer',
      riskLevel: 'high'
    },
    {
      safeguardId: 'ac_encryption',
      state: 'partial',
      implementedControls: ['Supabase provides at-rest encryption for database', 'HTTPS enforced by Vercel'],
      gaps: ['No application-level field encryption', 'No KMS integration', 'Env vars contain API keys'],
      remediationPlan: 'Add column-level encryption for clinical data, migrate secrets to vault',
      riskLevel: 'high'
    },
    {
      safeguardId: 'audit_controls',
      state: 'non_compliant',
      implementedControls: ['Basic server console logging'],
      gaps: ['No structured audit log', 'No access tracking', 'No log integrity protection', 'No review process'],
      remediationPlan: 'Implement audit_log table with immutable writes, API middleware logging, weekly review process',
      riskLevel: 'critical'
    },
    {
      safeguardId: 'integrity',
      state: 'partial',
      implementedControls: ['Database constraints', 'TypeScript type validation'],
      gaps: ['No record versioning', 'No change tracking', 'Limited input validation'],
      remediationPlan: 'Add record version history table, implement comprehensive input validation middleware',
      riskLevel: 'medium'
    },
    {
      safeguardId: 'integrity_mechanism',
      state: 'non_compliant',
      implementedControls: [],
      gaps: ['No checksums on clinical records', 'No tamper detection'],
      remediationPlan: 'Add SHA-256 hash column to clinical_assessments table, verify on read',
      riskLevel: 'medium'
    },
    {
      safeguardId: 'authentication',
      state: 'non_compliant',
      implementedControls: ['Demo role selection (not real auth)'],
      gaps: ['No real authentication', 'No MFA', 'No password policy', 'No account lockout'],
      remediationPlan: 'Implement Supabase Auth with MFA, SSO for enterprise, rate limiting on auth endpoints',
      riskLevel: 'critical'
    },
    {
      safeguardId: 'transmission_security',
      state: 'compliant',
      implementedControls: ['TLS 1.3 via Vercel edge network', 'HTTPS enforced', 'HSTS enabled'],
      gaps: [],
      riskLevel: 'low'
    },
    {
      safeguardId: 'transmission_integrity',
      state: 'compliant',
      implementedControls: ['TLS MAC provides transport integrity', 'HTTPS for all API calls'],
      gaps: [],
      riskLevel: 'low'
    },
    {
      safeguardId: 'transmission_encryption',
      state: 'compliant',
      implementedControls: ['TLS 1.3 for all data in transit', 'Supabase SSL connection'],
      gaps: [],
      riskLevel: 'low'
    }
  ];
}
