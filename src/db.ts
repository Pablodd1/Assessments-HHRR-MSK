import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "app.db");

// Ensure data directory exists
import fs from "fs";
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db.pragma("journal_mode = WAL");

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    industry TEXT NOT NULL,
    size TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL,
    position TEXT NOT NULL,
    role TEXT DEFAULT 'Staff',
    hire_date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (company_id) REFERENCES companies(id)
  );

  CREATE TABLE IF NOT EXISTS clinical_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    data_json TEXT NOT NULL,
    risk_score REAL DEFAULT 0,
    risk_level TEXT DEFAULT 'Low',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
  );

  CREATE TABLE IF NOT EXISTS hr_risks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL UNIQUE,
    turnover_risk TEXT DEFAULT 'Low',
    motivation_level INTEGER DEFAULT 70,
    performance_score INTEGER DEFAULT 75,
    sick_days INTEGER DEFAULT 0,
    notes TEXT DEFAULT '',
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
  );

  CREATE TABLE IF NOT EXISTS interventions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
  );
`);

// Seed data function
export function seedDatabase() {
  const companyCount = db.prepare("SELECT COUNT(*) as count FROM companies").get() as { count: number };
  if (companyCount.count > 0) {
    return; // Already seeded
  }

  // Insert companies
  const insertCompany = db.prepare(
    "INSERT INTO companies (name, industry, size) VALUES (?, ?, ?)"
  );
  
  const company1 = insertCompany.run("Apex Healthcare Group", "Healthcare", "500-1000 employees");
  const company2 = insertCompany.run("Metro Sports & Wellness", "Fitness & Wellness", "200-500 employees");

  // Insert employees
  const insertEmployee = db.prepare(`
    INSERT INTO employees (company_id, name, email, department, position, role, hire_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const employees = [
    { name: "Robert Wilson", email: "rwilson@apexhealth.com", dept: "Operations", position: "Front Desk Lead", role: "Staff", hire: "2022-03-15" },
    { name: "Sarah Jenkins", email: "sjenkins@apexhealth.com", dept: "Housekeeping", position: "Area Supervisor", role: "Staff", hire: "2020-06-01" },
    { name: "Michael Chang", email: "mchang@apexhealth.com", dept: "Food & Beverage", position: "Server", role: "Staff", hire: "2023-01-10" },
    { name: "Emily Rodriguez", email: "erodriguez@apexhealth.com", dept: "HR", position: "HR Manager", role: "HR", hire: "2019-09-15" },
    { name: "James Thompson", email: "jthompson@apexhealth.com", dept: "Operations", position: "Warehouse Associate", role: "Staff", hire: "2021-11-20" },
    { name: "Maria Garcia", email: "mgarcia@apexhealth.com", dept: "Nursing", position: "Registered Nurse", role: "Staff", hire: "2018-04-02" },
    { name: "David Kim", email: "dkim@apexhealth.com", dept: "Operations", position: "Facilities Manager", role: "Management", hire: "2017-08-12" },
    { name: "Lisa Chen", email: "lchen@apexhealth.com", dept: "Administration", position: "Executive Assistant", role: "Staff", hire: "2020-01-15" },
    { name: "James Brown", email: "jbrown@apexhealth.com", dept: "Food & Beverage", position: "Head Chef", role: "Staff", hire: "2019-05-20" },
    { name: "Patricia Martinez", email: "pmartinez@apexhealth.com", dept: "Patient Services", position: "Patient Coordinator", role: "Staff", hire: "2021-09-01" },
    { name: "Christopher Lee", email: "clee@metrosports.com", dept: "Fitness", position: "Personal Trainer", role: "Staff", hire: "2022-02-14" },
    { name: "Amanda Johnson", email: "ajohnson@metrosports.com", dept: "Sales", position: "Membership Sales Lead", role: "Staff", hire: "2021-07-22" },
    { name: "Daniel Williams", email: "dwilliams@metrosports.com", dept: "Operations", position: "Gym Manager", role: "Management", hire: "2019-11-30" },
    { name: "Jennifer Davis", email: "jdavis@metrosports.com", dept: "Wellness", position: "Wellness Coordinator", role: "Staff", hire: "2020-03-08" },
    { name: "Matthew Anderson", email: "manderson@metrosports.com", dept: "Maintenance", position: "Maintenance Technician", role: "Staff", hire: "2022-06-15" },
    { name: "Elizabeth Taylor", email: "etaylor@metrosports.com", dept: "Admin", position: "Front Desk Associate", role: "Staff", hire: "2023-04-10" },
    { name: "Andrew Thomas", email: "athomas@metrosports.com", dept: "Fitness", position: "Group Fitness Instructor", role: "Staff", hire: "2021-12-01" },
    { name: "Michelle Jackson", email: "mjackson@apexhealth.com", dept: "HR", position: "HR Specialist", role: "HR", hire: "2020-08-25" },
    { name: "Joshua White", email: "jwhite@apexhealth.com", dept: "IT", position: "IT Support Specialist", role: "Staff", hire: "2019-02-18" },
  ];

  const empIds: number[] = [];
  for (const emp of employees) {
    const result = insertEmployee.run(
      emp.dept.includes("Apex") || emp.email.includes("apex") ? company1.lastInsertRowid : company2.lastInsertRowid,
      emp.name,
      emp.email,
      emp.dept,
      emp.position,
      emp.role,
      emp.hire
    );
    empIds.push(result.lastInsertRowid as number);
  }

  // Insert HR Risks
  const insertRisk = db.prepare(`
    INSERT INTO hr_risks (employee_id, turnover_risk, motivation_level, performance_score, sick_days, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const riskData = [
    { empIdx: 0, turnover: "High", motivation: 45, performance: 65, sick: 8, notes: "High burnout due to frequent double shifts. Motivation dropped 30% after restructuring." },
    { empIdx: 1, turnover: "Low", motivation: 88, performance: 92, sick: 1, notes: "Exceptional performance. Strong candidate for leadership training." },
    { empIdx: 2, turnover: "High", motivation: 30, performance: 55, sick: 4, notes: "Chronic lateness. Expressed desire for different career path. Motivation at all-time low." },
    { empIdx: 3, turnover: "Low", motivation: 82, performance: 88, sick: 2, notes: "Stable performer with good engagement metrics." },
    { empIdx: 4, turnover: "Medium", motivation: 58, performance: 72, sick: 6, notes: "Physical stress from warehouse work. MSK concerns noted." },
    { empIdx: 5, turnover: "Low", motivation: 75, performance: 85, sick: 3, notes: "Consistent performer with moderate engagement." },
    { empIdx: 6, turnover: "Low", motivation: 80, performance: 90, sick: 1, notes: "Excellent facilities management. Low risk profile." },
    { empIdx: 7, turnover: "Medium", motivation: 62, performance: 78, sick: 4, notes: "Administrative load creating some stress." },
    { empIdx: 8, turnover: "Medium", motivation: 65, performance: 80, sick: 2, notes: "Stable kitchen operations with good leadership potential." },
    { empIdx: 9, turnover: "Low", motivation: 72, performance: 82, sick: 2, notes: "Good patient interaction skills. Positive feedback from patients." },
    { empIdx: 10, turnover: "High", motivation: 38, performance: 58, sick: 7, notes: "Struggling with early morning shifts. High attrition risk." },
    { empIdx: 11, turnover: "Medium", motivation: 55, performance: 70, sick: 3, notes: "Sales targets creating pressure. Needs support." },
    { empIdx: 12, turnover: "Low", motivation: 85, performance: 88, sick: 1, notes: "Strong gym management skills. Team retention is good." },
    { empIdx: 13, turnover: "Low", motivation: 78, performance: 84, sick: 2, notes: "Wellness programs well-received by members." },
    { empIdx: 14, turnover: "Medium", motivation: 60, performance: 75, sick: 5, notes: "Maintenance workload increasing. Needs rotating schedule review." },
    { empIdx: 15, turnover: "High", motivation: 42, performance: 62, sick: 6, notes: "Customer-facing stress affecting motivation. High turnover risk." },
    { empIdx: 16, turnover: "Medium", motivation: 68, performance: 78, sick: 2, notes: "Good class feedback but schedule flexibility needed." },
    { empIdx: 17, turnover: "Low", motivation: 76, performance: 82, sick: 2, notes: "Stable HR support operations." },
    { empIdx: 18, turnover: "Medium", motivation: 65, performance: 80, sick: 3, notes: "IT infrastructure stress but manageable workload." },
  ];

  for (const risk of riskData) {
    insertRisk.run(
      empIds[risk.empIdx],
      risk.turnover,
      risk.motivation,
      risk.performance,
      risk.sick,
      risk.notes
    );
  }

  // Insert Clinical Assessments
  const insertAssessment = db.prepare(`
    INSERT INTO clinical_assessments (employee_id, type, data_json, risk_score, risk_level)
    VALUES (?, ?, ?, ?, ?)
  `);

  const assessmentData = [
    { empIdx: 0, type: "MSK_SCREEN", data: { regions: [{ name: "lower_back", painLevel: 8, stiffness: 7, limitedMotion: true }], totalRiskScore: 72, riskLevel: "High", workRiskFactors: ["Prolonged standing", "Repetitive lifting"] }, score: 72, level: "High" },
    { empIdx: 2, type: "3D_MOTION", data: { movementTests: [{ name: "Squat", symmetryScore: 58 }], overallMobilityScore: 63, asymmetryIndex: 22 }, score: 65, level: "Moderate" },
    { empIdx: 4, type: "MSK_SCREEN", data: { regions: [{ name: "shoulders", painLevel: 7, stiffness: 6, limitedMotion: true }, { name: "lower_back", painLevel: 9, stiffness: 8, limitedMotion: true }], totalRiskScore: 81, riskLevel: "High" }, score: 81, level: "High" },
    { empIdx: 10, type: "POSTURE", data: { overallPostureScore: 58, spinalAlignment: "MildDeviation", riskZones: ["neck", "lower_back"] }, score: 58, level: "Moderate" },
  ];

  for (const assess of assessmentData) {
    insertAssessment.run(
      empIds[assess.empIdx],
      assess.type,
      JSON.stringify(assess.data),
      assess.score,
      assess.level
    );
  }

  // Insert Interventions
  const insertIntervention = db.prepare(`
    INSERT INTO interventions (employee_id, type, description, status)
    VALUES (?, ?, ?, ?)
  `);

  const interventionData = [
    { empIdx: 0, type: "wellness", description: "Ergonomic workstation assessment and back pain management program", status: "active" },
    { empIdx: 0, type: "meeting", description: "Schedule one-on-one with manager to discuss workload concerns", status: "completed" },
    { empIdx: 2, type: "wellness", description: "Career development conversation and motivation coaching", status: "pending" },
    { empIdx: 4, type: "medical", description: "Physical therapy referral for lower back issues", status: "active" },
    { empIdx: 10, type: "schedule", description: "Adjust shift schedule to better suit personal circumstances", status: "pending" },
  ];

  for (const interv of interventionData) {
    insertIntervention.run(empIds[interv.empIdx], interv.type, interv.description, interv.status);
  }

  console.log("Database seeded successfully!");
}

// Run seed on import
seedDatabase();

export default db;
