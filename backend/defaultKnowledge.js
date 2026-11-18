export const defaultKnowledgeItems = [
  // ================= P1 BATCH (Pre-University 1st Year) ================= //
  {
    title: 'P1 Examination Schedule & Quarterly Tests',
    category: 'exams',
    targetBatches: ['P1'],
    queryPatterns: [
      'when are exams', 'exam schedule', 'exam timetable', 'quarterly exam',
      'p1 exams', 'p1 timetable', 'mid term test', 'half yearly exam'
    ],
    answer: `### 📅 P1 Batch Examination Schedule (Pre-University 1st Year)

- **Quarterly Assessment Tests (QAT):** October 12 to October 18, 2026 (Timing: 09:30 AM – 12:30 PM)
- **Half-Yearly Preparatory Examinations:** December 08 to December 18, 2026
- **Annual Board Preparatory Examination:** February 15 to February 26, 2027
- **Mandatory Evening Study Hours:** 06:30 PM to 08:30 PM in academic classrooms.
- **Hall Ticket Release:** Issued by Class Mentors 3 days before exams upon clearing 75% attendance.`,
    tags: ['exams', 'p1', 'schedule', 'quarterly', 'pu1'],
    sourceDocument: 'PUC Academic Directorate - P1 Exam Schedule 2026'
  },
  {
    title: 'P1 Academic & Hostel Fee Structure',
    category: 'fee',
    targetBatches: ['P1'],
    queryPatterns: [
      'fee', 'how much is fee', 'p1 fee', 'p1 tuition fee', 'hostel fee', 'p1 fee structure', 'fee payment'
    ],
    answer: `### 💳 P1 Batch Fee Details (Academic Year 2026-27)

- **Tuition Fee:** ₹38,000 / year (Fully reimbursed for eligible state scholarship students)
- **Hostel & Mess Charges:** ₹42,000 / year (Includes breakfast, lunch, snacks & dinner)
- **One-time Refundable Caution Deposit:** ₹3,000 (Paid at admission)
- **Payment Deadline:** Odd Semester: August 20, 2026 | Even Semester: January 10, 2027
- **Online Payment:** Via Student ERP Portal or Indian Overseas Bank Challan.`,
    tags: ['fee', 'p1', 'tuition', 'hostel', 'cost'],
    sourceDocument: 'Accounts Division - P1 Fee Circular 2026'
  },

  // ================= P2 BATCH (Pre-University 2nd Year) ================= //
  {
    title: 'P2 Final Board Exams & Engineering Branch Allotment Schedule',
    category: 'exams',
    targetBatches: ['P2'],
    queryPatterns: [
      'when are exams', 'exam schedule', 'exam timetable', 'p2 exams', 'board exam dates',
      'branch allotment', 'engineering branch selection', 'p2 timetable'
    ],
    answer: `### 📅 P2 Batch Board Examination & Branch Counseling (Pre-University 2nd Year)

1. **Pre-Final / Mock Board Examinations:** January 05 to January 16, 2027
2. **State Board Final Examinations:** March 02 to March 22, 2027
3. **Engineering Branch Allotment (Into E1):**
   - Branch preference submission opens: **April 15, 2027**
   - Branches offered: CSE, ECE, AI&DS, IT, Mechanical, Civil, Chemical
   - Allotment strictly based on **P1 + P2 Cumulative CGPA** and reservation quota.`,
    tags: ['exams', 'p2', 'board', 'branch allotment', 'pu2'],
    sourceDocument: 'PUC Examination Board & Admissions Committee'
  },
  {
    title: 'P2 Academic & Board Exam Fee Structure',
    category: 'fee',
    targetBatches: ['P2'],
    queryPatterns: [
      'fee', 'p2 fee', 'p2 tuition fee', 'board exam fee', 'how much is fee', 'fee deadline'
    ],
    answer: `### 💳 P2 Batch Fee & Board Exam Charges

- **Annual Academic Tuition Fee:** ₹40,000 / year
- **State Board Examination Registration Fee:** ₹850 (Due by November 25, 2026)
- **Hostel & Mess Maintenance Fee:** ₹42,000 / year
- **Late Payment Fine:** ₹100 per week after deadline.`,
    tags: ['fee', 'p2', 'board fee', 'tuition'],
    sourceDocument: 'Accounts Office - P2 Notification'
  },

  // ================= E1 BATCH (Engineering 1st Year) ================= //
  {
    title: 'E1 Semester Examination Timetable (Engineering 1st Year)',
    category: 'exams',
    targetBatches: ['E1'],
    queryPatterns: [
      'when are exams', 'exam schedule', 'exam timetable', 'e1 exams', 'mid 1 dates', 'e1 timetable',
      'first year engineering exams', 'iat dates'
    ],
    answer: `### 📅 E1 Batch Examination Schedule (1st Year B.Tech)

- **Continuous Assessment Test 1 (IAT-1 / Mid-1):** September 21 to September 26, 2026
- **Continuous Assessment Test 2 (IAT-2 / Mid-2):** October 26 to October 31, 2026
- **Practical & Laboratory Model Exams:** November 16 to November 21, 2026
- **End Semester Theory Examinations:** **December 01 to December 16, 2026**
- **Session Timing:** **Forenoon Session (09:30 AM to 12:30 PM)**
- **Hall Tickets:** Download from ERP from November 25 upon clearing attendance.`,
    tags: ['exams', 'e1', 'mid1', 'semester', 'first year'],
    sourceDocument: 'Office of COE - E1 Academic Calendar Circular'
  },
  {
    title: 'E1 Engineering Tuition Fee & Laptop Issuance Details',
    category: 'fee',
    targetBatches: ['E1'],
    queryPatterns: [
      'fee', 'e1 fee', 'how much is fee', 'first year fee', 'laptop fee', 'e1 tuition fee'
    ],
    answer: `### 💳 E1 Batch Fee Structure & Laptop Facility

1. **Tuition Fee (Annual):**
   - Government Quota / Merit: ₹45,000 / year
   - Management Quota: ₹1,10,000 / year
2. **First Year Engineering Kit & Lab Charges:** ₹5,500 (one-time for physics, chemistry, workshop tools)
3. **Institutional Laptop Issuance Deposit:** ₹4,000 (Refundable upon course completion)
   - Laptops configured with Ubuntu & Windows dual boot, VS Code, Python, GCC compiler.
4. **Hostel & Food Court Package:** ₹75,000 / year.`,
    tags: ['fee', 'e1', 'tuition', 'laptop', 'first year'],
    sourceDocument: 'Finance & Academic Equipment Cell'
  },

  // ================= E2 BATCH (Engineering 2nd Year) ================= //
  {
    title: 'E2 Semester Examination Timetable (Engineering 2nd Year)',
    category: 'exams',
    targetBatches: ['E2'],
    queryPatterns: [
      'when are exams', 'exam schedule', 'exam timetable', 'e2 exams', 'e2 timetable',
      'second year exams', 'iat dates'
    ],
    answer: `### 📅 E2 Batch Examination Schedule (2nd Year B.Tech)

- **Mid-1 Internal Assessment:** September 28 to October 03, 2026
- **Mid-2 Internal Assessment:** November 02 to November 07, 2026
- **Department Practical Exams (DSA / OOP / DLD):** November 18 to November 24, 2026
- **End Semester Theory Examinations:** **November 28 to December 14, 2026**
- **Session Timing:** **Afternoon Session (01:30 PM to 04:30 PM)**
- **Attendance Requirement:** Minimum 75% in each theory and lab course.`,
    tags: ['exams', 'e2', 'timetable', 'second year', 'afternoon shift'],
    sourceDocument: 'Controller of Examinations - E2 Schedule 2026'
  },
  {
    title: 'E2 Tuition Fee & Department Specialized Lab Fees',
    category: 'fee',
    targetBatches: ['E2'],
    queryPatterns: [
      'fee', 'e2 fee', 'how much is fee', 'second year fee', 'e2 tuition fee', 'lab fee'
    ],
    answer: `### 💳 E2 Batch Fee Details (2nd Year B.Tech)

- **Academic Tuition Fee:** ₹45,000 (Govt) / ₹1,10,000 (Mgmt)
- **Specialized Department Lab & Software License Fee:** ₹4,200 (MATLAB, Cadence, Oracle DB licenses)
- **Hostel Fee:** ₹75,000 (Non-AC) | ₹1,15,000 (AC)
- **Odd Semester Due Date:** August 15, 2026 | Even Semester Due: January 15, 2027.`,
    tags: ['fee', 'e2', 'tuition', 'second year', 'labs'],
    sourceDocument: 'Accounts Division - E2 Circular'
  },

  // ================= E3 BATCH (Engineering 3rd Year) ================= //
  {
    title: 'E3 Semester Examination Schedule & Mini-Project Viva',
    category: 'exams',
    targetBatches: ['E3'],
    queryPatterns: [
      'when are exams', 'exam schedule', 'exam timetable', 'e3 exams', 'e3 timetable',
      'mini project viva', 'third year exams', 'internship viva'
    ],
    answer: `### 📅 E3 Batch Examination Schedule (3rd Year B.Tech)

- **Mid-1 Examination:** October 05 to October 10, 2026
- **Mid-2 Examination:** November 09 to November 14, 2026
- **End Semester Theory Examinations:** **November 25 to December 12, 2026**
- **Timing:** **Forenoon Session (09:30 AM to 12:30 PM)**
- **Mandatory Mini-Project Evaluation Viva:** December 15 to December 18, 2026
  - Each batch must submit the project report signed by their Faculty Guide.`,
    tags: ['exams', 'e3', 'mini project', 'third year', 'timetable'],
    sourceDocument: 'Dean Academics & Head of Department - E3 Circular'
  },
  {
    title: 'E3 Tuition Fee & Mandatory Summer Internship Regulations',
    category: 'fee',
    targetBatches: ['E3'],
    queryPatterns: [
      'fee', 'e3 fee', 'internship', 'how much is fee', 'summer internship', 'e3 tuition fee'
    ],
    answer: `### 💳 E3 Batch Fee & Internship Guidelines

- **Academic Tuition Fee:** ₹45,000 / year (Govt) | ₹1,10,000 / year (Mgmt)
- **Certification & Skill Development Fee:** ₹3,500 (Covers AWS Cloud / Salesforce / RedHat exam voucher)
- **Summer Internship Requirement:**
  - All E3 students must complete an **8-week industrial internship** or research fellowship during summer.
  - NOC requests can be submitted via the Training & Placement portal by November 30.`,
    tags: ['fee', 'e3', 'internship', 'tuition', 'third year'],
    sourceDocument: 'Career Development Cell & Accounts Division'
  },

  // ================= E4 BATCH (Engineering 4th / Final Year) ================= //
  {
    title: 'E4 Fast-Track Final Exam Schedule & Major Project Viva',
    category: 'exams',
    targetBatches: ['E4'],
    queryPatterns: [
      'when are exams', 'exam schedule', 'exam timetable', 'e4 exams', 'final year exams',
      'major project viva', 'thesis defense', 'e4 timetable'
    ],
    answer: `### 📅 E4 Batch Fast-Track Final Examination Schedule (Final Year B.Tech)

- **E4 Fast-Track End-Semester Theory Exams:** **November 16 to November 28, 2026**
  *(Conducted on fast-track schedule to enable full-semester corporate internships in Semester 8)*
- **Major Project Phase-1 Presentation & Viva:** December 02 to December 05, 2026
- **Final Comprehensive Viva Voce:** December 09, 2026
- **Timing:** 09:30 AM to 12:30 PM
- **Degree No-Dues Clearance:** To be completed between January 05 and January 15, 2027.`,
    tags: ['exams', 'e4', 'final year', 'major project', 'fast track'],
    sourceDocument: 'Office of COE & Dean Academics - E4 Final Notification'
  },
  {
    title: 'E4 Graduation Fee, No-Dues Clearance & Placement Drives',
    category: 'placement',
    targetBatches: ['E4'],
    queryPatterns: [
      'fee', 'e4 fee', 'placement', 'placements', 'highest package', 'convocation fee',
      'no dues', 'job drives', 'placement schedule'
    ],
    answer: `### 💼 E4 Batch Placements & Convocation Fee Details

1. **On-Campus Placement Drives:**
   - Active Recruiters: Zoho, TCS, Infosys, Cognizant, Wipro, Kaar Tech, Bosch, Hexaware.
   - Highest Package (Current Batch): **₹14.5 LPA** | Average Package: **₹4.8 LPA**
   - Daily interview slots announced on the Placement Notice Board.

2. **Convocation & Degree Processing Fee:**
   - ₹2,800 (Due before December 20, 2026) for Consolidated Marksheet & Provisional Certificate.
3. **Hostel & Library No-Dues Form:** Available on ERP from January 02, 2027.`,
    tags: ['fee', 'e4', 'placement', 'convocation', 'no dues'],
    sourceDocument: 'Training & Placement Division & Accounts'
  },

  // ================= ALL BATCHES (Universal Campus Information) ================= //
  {
    title: 'Central Library Timings & Reading Room Rules (All Batches)',
    category: 'facilities',
    targetBatches: ['All', 'P1', 'P2', 'E1', 'E2', 'E3', 'E4'],
    queryPatterns: [
      'library timings', 'what are the library timings', 'library open time', 'library hours', 'digital library'
    ],
    answer: `### 📚 Central Library Working Hours & Access (All Batches)

- **Working Hours (Monday to Saturday):** **08:00 AM to 08:00 PM**
- **Sundays & Institutional Holidays:** 09:00 AM to 04:00 PM
- **During Semester Examination Months:** Extended hours up to **10:00 PM**
- **Digital Library:** 60 terminals with IEEE Xplore, DELNET, ScienceDirect access.
- **Book Issue Quota:**
  - P1 & P2: 2 books for 14 days
  - E1 & E2: 4 books for 14 days
  - E3 & E4: 6 books for 21 days`,
    tags: ['facilities', 'library', 'timings', 'all batches', 'books'],
    sourceDocument: 'Chief Librarian Manual & Library Guidelines 2026'
  },
  {
    title: 'Official Holiday Calendar & Semester Vacation (All Batches)',
    category: 'holidays',
    targetBatches: ['All', 'P1', 'P2', 'E1', 'E2', 'E3', 'E4'],
    queryPatterns: [
      'holidays', 'holiday period', 'vacation', 'when is vacation', 'semester break',
      'diwali holiday', 'pongal holidays', 'winter vacation', 'summer vacation'
    ],
    answer: `### 🌴 Official Academic Holiday Calendar (2026-2027)

1. **Upcoming Festival Holidays:**
   - **Independence Day:** August 15, 2026
   - **Vinayagar Chaturthi:** September 14, 2026
   - **Gandhi Jayanti:** October 02, 2026
   - **Ayutha Pooja & Vijaya Dasami:** October 19 – 20, 2026
   - **Diwali Festival Holidays:** November 06 to November 10, 2026 (5 Days)
   - **Christmas & New Year:** December 25, 2026 & January 01, 2027
   - **Pongal Festival Holidays:** January 13 to January 18, 2027 (6 Days)
   - **Republic Day:** January 26, 2027

2. **Vacation Periods:**
   - **Winter Semester Break:** December 19, 2026 to January 04, 2027
   - **Even Semester Reopening Date:** **January 05, 2027**`,
    tags: ['holidays', 'vacation', 'calendar', 'pongal', 'diwali', 'semester break'],
    sourceDocument: 'Dean Academic Affairs - Academic Calendar 2026'
  },
  {
    title: 'Hostel Curfew & Campus Discipline Regulations (All Batches)',
    category: 'facilities',
    targetBatches: ['All', 'P1', 'P2', 'E1', 'E2', 'E3', 'E4'],
    queryPatterns: [
      'hostel timings', 'curfew time', 'hostel gate rules', 'girls hostel', 'boys hostel', 'outing rules'
    ],
    answer: `### 🏢 Hostel Gate Timings & Curfew Policy (All Batches)

- **Girls Hostel In-Time:** Strictly **07:30 PM**
- **Boys Hostel In-Time:** Strictly **08:30 PM**
- **Weekend Outing Pass:** Digital e-Pass generated via the ERP app approved by the Warden.
- **Campus Ambulance / Health Clinic:** Open 24/7 with on-duty physician and medical staff.`,
    tags: ['facilities', 'hostel', 'curfew', 'rules', 'timings'],
    sourceDocument: 'Hostel Discipline & Student Welfare Handbook'
  },
  {
    title: 'Attendance Policy & Minimum Percentage Rule (All Batches)',
    category: 'rules',
    targetBatches: ['All', 'P1', 'P2', 'E1', 'E2', 'E3', 'E4'],
    queryPatterns: [
      'attendance rule', 'minimum attendance', 'attendance percentage', 'condonation', 'medical leave'
    ],
    answer: `### 📋 Institutional Attendance Regulation (75% Minimum Requirement)

- **Mandatory Attendance:** Students across all batches (P1 to E4) must maintain a minimum of **75% overall attendance** to sit for examinations.
- **Medical Condonation:** Shortage between 65% and 74% may be condoned by the Principal with genuine medical certificates.
- **Detention:** Below 65% attendance results in semester detention without exception.`,
    tags: ['rules', 'attendance', 'policies', 'all batches'],
    sourceDocument: 'Anna University / Institutional Academic Regulations 2026'
  }
];

export const defaultNotices = [
  {
    title: 'Fast-Track Exam Schedule & Major Project Phase-1 Submission',
    content: 'All E4 final year engineering students must submit their Major Project Phase-1 report signed by their faculty advisor before November 10, 2026. Theory examinations commence on November 16, 2026.',
    category: 'exams',
    targetBatches: ['E4'],
    priority: 'urgent',
    postedBy: 'Controller of Examinations',
    isPinned: true,
    createdAt: new Date('2026-11-10T09:00:00Z')
  },
  {
    title: 'Day-1 MNC Campus Recruitment Drive & Resume Registration',
    content: 'TCS, Infosys, and Zoho on-campus drives commence next week for eligible E4 students with 0 active backlogs. Submit your updated resume to the Placement Portal by 5:00 PM today.',
    category: 'placement',
    targetBatches: ['E4'],
    priority: 'urgent',
    postedBy: 'Head, Training & Placement Cell',
    isPinned: true,
    createdAt: new Date('2026-11-09T14:30:00Z')
  },
  {
    title: 'Summer Internship NOC & Mini-Project Evaluation Guidelines',
    content: 'E3 students planning for summer industrial internships must apply for institutional NOC through the Department Academic Cell. Mini-project model presentation will be evaluated between December 15-18.',
    category: 'academic',
    targetBatches: ['E3'],
    priority: 'important',
    postedBy: 'Dean of Academics',
    isPinned: true,
    createdAt: new Date('2026-11-08T11:00:00Z')
  },
  {
    title: 'Mid-2 Assessment & Afternoon Shift Exam Timetable Released',
    content: 'The detailed timetable for E2 2nd Year End-Semester examinations (Afternoon Session 01:30 PM - 04:30 PM) is now available on the student ERP portal. Hall ticket generation starts November 20.',
    category: 'exams',
    targetBatches: ['E2'],
    priority: 'important',
    postedBy: 'Office of COE',
    isPinned: false,
    createdAt: new Date('2026-11-07T10:15:00Z')
  },
  {
    title: 'Institutional Laptop Distribution & Lab Orientation Session',
    content: 'All E1 1st year engineering students must visit the Central Computing Centre to collect their configured institutional laptops and attend the Python/GCC environment setup orientation.',
    category: 'academic',
    targetBatches: ['E1'],
    priority: 'normal',
    postedBy: 'Director, IT Infrastructure',
    isPinned: false,
    createdAt: new Date('2026-11-06T15:00:00Z')
  },
  {
    title: 'Mock Board Exam Timetable & Engineering Preference Form',
    content: 'P2 students must submit their engineering branch preference choices (CSE, AI&DS, ECE, Mech, Civil) to their class teachers by November 25. Mock board examinations start on January 05, 2027.',
    category: 'academic',
    targetBatches: ['P2'],
    priority: 'important',
    postedBy: 'PUC Academic Coordinator',
    isPinned: true,
    createdAt: new Date('2026-11-05T09:30:00Z')
  },
  {
    title: 'Quarterly Test Marks Publication & Evening Study Hours',
    content: 'P1 quarterly test marks are published on the student notice board. Mandatory evening study hours from 6:30 PM to 8:30 PM in academic classrooms will be monitored by hostel resident mentors.',
    category: 'exams',
    targetBatches: ['P1'],
    priority: 'normal',
    postedBy: 'PUC Chief Warden & Mentor',
    isPinned: false,
    createdAt: new Date('2026-11-04T16:00:00Z')
  },
  {
    title: 'Diwali & Pongal Cultural Festival Holidays Notification',
    content: 'The college campus will remain closed for the Diwali Festival from November 06 to November 10, 2026. Winter vacation starts December 19, 2026, and even semester classes reopen January 05, 2027.',
    category: 'holidays',
    targetBatches: ['All'],
    priority: 'important',
    postedBy: 'Principal & Registrar',
    isPinned: true,
    createdAt: new Date('2026-11-03T10:00:00Z')
  },
  {
    title: 'Central Library Extended Working Hours During Examinations (8 AM - 10 PM)',
    content: 'In view of the upcoming semester examinations, the Central Library and Digital Research Lab will remain open with extended hours until 10:00 PM for all students from P1 to E4.',
    category: 'general',
    targetBatches: ['All'],
    priority: 'normal',
    postedBy: 'Chief Librarian',
    isPinned: false,
    createdAt: new Date('2026-11-02T11:30:00Z')
  }
];

export const defaultUsers = [
  {
    id: '721821IT045',
    name: 'Abinila V',
    role: 'student',
    batch: 'E3',
    department: 'Department of Information Technology',
    degree: 'B.Tech Information Technology',
    semester: 'Semester V',
    email: 'abinila.it21@rathinam.ac.in',
    phone: '+91 98421 78901',
    password: 'password123',
    attendance: '88%',
    cgpa: '8.92',
    avatar: 'AV',
    avatarBg: 'bg-indigo-600',
    advisor: 'Dr. Shanthi Victoria',
    hostelRoom: 'Block B - Room 204'
  },
  {
    id: '721820IT012',
    name: 'Vaishnav K',
    role: 'student',
    batch: 'E4',
    department: 'Department of Information Technology',
    degree: 'B.Tech Information Technology',
    semester: 'Semester VII',
    email: 'vaishnav.it20@rathinam.ac.in',
    phone: '+91 98421 65432',
    password: 'password123',
    attendance: '92%',
    cgpa: '9.15',
    avatar: 'VK',
    avatarBg: 'bg-emerald-600',
    advisor: 'Dr. Shanthi Victoria',
    hostelRoom: 'Block A - Room 410'
  },
  {
    id: '721822CS089',
    name: 'Roobini M',
    role: 'student',
    batch: 'E2',
    department: 'Computer Science & Engineering',
    degree: 'B.E Computer Science & Engineering',
    semester: 'Semester III',
    email: 'roobini.cse22@rathinam.ac.in',
    phone: '+91 98421 11223',
    password: 'password123',
    attendance: '84%',
    cgpa: '8.75',
    avatar: 'RM',
    avatarBg: 'bg-purple-600',
    advisor: 'Prof. Ramesh Kumar',
    hostelRoom: 'Block B - Room 112'
  },
  {
    id: '721823AI034',
    name: 'Caterine Veronica',
    role: 'student',
    batch: 'E1',
    department: 'Artificial Intelligence & Data Science',
    degree: 'B.Tech AI & Data Science',
    semester: 'Semester I',
    email: 'caterine.ai23@rathinam.ac.in',
    phone: '+91 98421 99887',
    password: 'password123',
    attendance: '94%',
    cgpa: '9.30',
    avatar: 'CV',
    avatarBg: 'bg-rose-600',
    advisor: 'Dr. Priya Murugan',
    hostelRoom: 'Block C - Room 105'
  },
  {
    id: 'PUC-2025-067',
    name: 'Siddharth Raman',
    role: 'student',
    batch: 'P2',
    department: 'Pre-University Course (MPC Stream)',
    degree: 'PUC 2nd Year (Pre-Board)',
    semester: 'Pre-Board Session',
    email: 'siddharth.puc25@rathinam.ac.in',
    phone: '+91 98421 44556',
    password: 'password123',
    attendance: '89%',
    cgpa: '9.10',
    avatar: 'SR',
    avatarBg: 'bg-amber-600',
    advisor: 'Prof. Balaji S',
    hostelRoom: 'PUC Hostel Block - Room 302'
  },
  {
    id: 'PUC-2026-102',
    name: 'Kavya Krishnan',
    role: 'student',
    batch: 'P1',
    department: 'Pre-University Course (MPC Stream)',
    degree: 'PUC 1st Year (Foundation)',
    semester: 'Quarterly Assessment',
    email: 'kavya.puc26@rathinam.ac.in',
    phone: '+91 98421 77665',
    password: 'password123',
    attendance: '95%',
    cgpa: '9.45',
    avatar: 'KK',
    avatarBg: 'bg-sky-600',
    advisor: 'Mrs. Jayanthi R',
    hostelRoom: 'PUC Girls Hostel - Room 108'
  },
  {
    id: 'EMP-IT-008',
    name: 'Mrs. Shanthi Victoria',
    role: 'admin',
    batch: 'All',
    designation: 'Associate Professor & Controller of Examinations',
    department: 'Department of Information Technology, Rathinam Technical Campus',
    email: 'shanthi.victoria@rathinam.ac.in',
    phone: '+91 94432 04812',
    password: 'admin123',
    accessScope: 'Master Administrator (All Batches: P1, P2, E1, E2, E3, E4)',
    officeLocation: 'Academic Administrative Block, Room 204',
    avatar: 'SV',
    avatarBg: 'bg-slate-900'
  }
];
