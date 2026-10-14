export interface UnitConcept {
  id: string
  number: number
  title: string
  subtitle: string
  description: string
  keyTakeaways: string[]
  exampleOrSyntax?: string
  examRelevance?: string
}

export interface UnitMaterial {
  id: string
  title: string
  type: 'PDF' | 'Video' | 'Slides' | 'Lab Manual' | 'Textbook'
  meta: string
  icon: 'pdf' | 'video' | 'slides'
  author?: string
  content: string
}

export interface UnitPracticeQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  bloomLevel: 'Remember' | 'Understand' | 'Apply' | 'Analyze'
  difficulty: 'Easy' | 'Medium' | 'Hard'
  examTag: string
}

export interface UnitKeyTakeaways {
  coreDefinitions: { term: string; definition: string }[]
  essentialRules: string[]
  commonPitfalls: string[]
  examTips: string[]
}

export interface UnifiedUnit {
  unitNumber: number
  unitRoman: string
  title: string
  lectureHours: number
  examWeightage: number
  subtopicsCount: number
  status: 'Completed' | 'In Progress' | 'Upcoming'
  progressPct: number
  concepts: UnitConcept[]
  materials: UnitMaterial[]
  practiceQuestions: UnitPracticeQuestion[]
  keyTakeaways: UnitKeyTakeaways
}

// 1. DBMS Unified 5 Units Curriculum
export const DBMS_UNIFIED_UNITS: UnifiedUnit[] = [
  {
    unitNumber: 1,
    unitRoman: 'UNIT I',
    title: 'Database Architecture & ER Modeling',
    lectureHours: 9,
    examWeightage: 20,
    subtopicsCount: 7,
    status: 'Completed',
    progressPct: 100,
    concepts: [
      {
        id: 'c1-1',
        number: 1,
        title: 'Three-Schema Architecture',
        subtitle: 'Internal, Conceptual and External levels of data representation and their mappings.',
        description:
          'The ANSI/SPARC Three-Schema Architecture separates the user applications from the physical database. It defines three distinct levels: (1) Internal / Physical Level describing low-level data storage, file structures, and access paths; (2) Conceptual Level representing the logical structure of the entire database independent of physical storage; and (3) External / View Level presenting customized views for different user groups.',
        keyTakeaways: [
          'External Schema: User-specific view hiding irrelevant data.',
          'Conceptual Schema: Logical design of entities, attributes, relationships, and constraints.',
          'Internal Schema: Physical layout on disk, indexes, and hashing schemes.',
          'Mappings between adjacent levels allow changes at one level without affecting the other.',
        ],
        exampleOrSyntax: 'External View 1 (Student View) ↔ Conceptual Schema (University DB) ↔ Internal Schema (B+ Tree on Disk)',
        examRelevance: 'Guaranteed University Exam Question · Usually 8 marks',
      },
      {
        id: 'c1-2',
        number: 2,
        title: 'Data Independence',
        subtitle: 'Physical and Logical data independence and their importance.',
        description:
          'Data Independence is the capacity to change the schema at one level of a database system without having to alter the schema at the next higher level. Logical Data Independence is the capacity to change the conceptual schema without having to modify external schemas or application programs. Physical Data Independence is the capacity to change the internal schema (e.g., adding an index or moving files) without altering the conceptual schema.',
        keyTakeaways: [
          'Physical Data Independence is easier to achieve and supported by almost all modern RDBMS.',
          'Logical Data Independence is harder to achieve because application programs are often tightly bound to the conceptual structure.',
          'Reduces maintenance overhead when storage hardware, partitions, or index methods change.',
        ],
        exampleOrSyntax: 'Altering table storage from Heap to Clustered Index (Internal change) requires zero change in SELECT queries (Conceptual schema untouched).',
        examRelevance: 'Short answer & conceptual comparison · 4 marks',
      },
      {
        id: 'c1-3',
        number: 3,
        title: 'ER Model Basics',
        subtitle: 'Entities, Attributes, Relationships, Keys and Constraints.',
        description:
          'The Entity-Relationship (ER) model is a high-level conceptual data model. Key components: (1) Entity: A real-world thing or object with an independent existence. (2) Weak Entity: An entity that does not possess a primary key of its own and depends on an identifying owner entity. (3) Attributes: Simple, Composite, Single-valued, Multivalued, and Derived attributes. (4) Relationships: Degree of relationship (Unary, Binary, Ternary) and Cardinality Ratios (1:1, 1:N, M:N).',
        keyTakeaways: [
          'Entities are drawn as Rectangles; Weak entities as Double Rectangles.',
          'Attributes are drawn as Ellipses; Multivalued attributes as Double Ellipses; Derived as Dashed Ellipses.',
          'Primary Keys are indicated with a Solid Underline; Partial Keys with a Dashed Underline.',
          'Relationships are drawn as Diamonds; Identifying relationships as Double Diamonds.',
        ],
        exampleOrSyntax: 'STUDENT (RollNo [PK], Name, {Phone_Numbers}) —(Enrolls)—< COURSE (CourseID [PK], Title)',
        examRelevance: 'Core modeling question with diagram design · 12 marks',
      },
      {
        id: 'c1-4',
        number: 4,
        title: 'Relational Mapping Rules',
        subtitle: 'Mapping ER diagrams to relational tables with integrity constraints.',
        description:
          'A standard 7-step mapping algorithm translates conceptual ER diagrams into relational tables: (1) Map regular strong entity types to tables. (2) Map weak entity types with owner primary key as foreign key. (3) Map 1:1 relationships using the Foreign Key approach. (4) Map 1:N relationships by adding the 1-side primary key as a foreign key on the N-side. (5) Map M:N relationships by creating a separate junction table. (6) Map multivalued attributes into separate relations. (7) Map n-ary relationships.',
        keyTakeaways: [
          'Step 1: Strong entity → Table with PK.',
          'Step 2: Weak entity → Table whose PK = (Owner PK + Partial Key).',
          'Step 4: 1:N relationship → Foreign key goes to the "N" (many) side table.',
          'Step 5: M:N relationship → New table whose PK is composite of both entity PKs.',
          'Step 6: Multivalued attribute → New table containing (Entity PK + Attribute Value).',
        ],
        exampleOrSyntax: 'STUDENT_PHONE(Student_RollNo [FK], Phone_Number) where PK is (Student_RollNo, Phone_Number).',
        examRelevance: 'Step-by-step conversion problem · 10 marks',
      },
      {
        id: 'c1-5',
        number: 5,
        title: 'Specialization / Generalization',
        subtitle: 'Types, constraints and examples.',
        description:
          'Enhanced ER (EER) modeling supports inheritance. Specialization is top-down modeling that defines subclasses of an existing entity class based on distinguishing characteristics. Generalization is bottom-up synthesis of multiple lower-level entity sets into a higher-level superclass. Key constraints include Disjointness Constraint (Disjoint vs Overlapping) and Completeness Constraint (Total vs Partial participation).',
        keyTakeaways: [
          'Disjoint (d): An entity can belong to at most one subclass.',
          'Overlapping (o): An entity can belong to more than one subclass simultaneously.',
          'Total participation (double line): Every superclass entity must belong to at least one subclass.',
          'Partial participation (single line): An entity need not belong to any subclass.',
        ],
        exampleOrSyntax: 'PERSON (Superclass) -d-> {EMPLOYEE, STUDENT}. Disjoint: An individual is either employee or student.',
        examRelevance: 'EER modeling question · 8 marks',
      },
    ],
    materials: [
      {
        id: 'm1-1',
        title: 'Chapter notes — Data vs information',
        type: 'PDF',
        meta: 'PDF · 3 pages',
        icon: 'pdf',
        author: 'Dr. Rajesh Iyer',
        content:
          '1. Foundational Definitions:\n• Data: Atomic, unprocessed raw observations, measurements, symbols, or signals (e.g. "98.6", "CS3401").\n• Information: Contextualized, structured data processed to enable decision making (e.g. "Body temperature is 98.6°F, which is normal").\n• Knowledge: Applied information combined with experience and rules.\n\n2. Database vs File Systems:\n• File System Drawbacks: Data redundancy & inconsistency, difficulty accessing data, data isolation, integrity problems, atomicity issues, concurrent access anomalies, security problems.\n• DBMS Advantages: Centralized control, data abstraction, reduced redundancy, data integrity, backup and recovery.',
      },
      {
        id: 'm1-2',
        title: 'Worked example video',
        type: 'Video',
        meta: 'YouTube · 7 min',
        icon: 'video',
        author: 'Prof. Meenakshi S.',
        content:
          'Video Lecture: Converting Complex University ER Diagram to Relational Tables.\n\nKey timestamps:\n00:00 - Introduction & ER Diagram walk-through\n02:15 - Handling Weak Entity: DEPENDENT of EMPLOYEE\n04:30 - Resolving M:N Enrollment into Junction Table\n06:10 - Enforcing ON DELETE CASCADE and Foreign Key constraints.',
      },
      {
        id: 'm1-3',
        title: 'Chapter notes — Foundations',
        type: 'PDF',
        meta: 'PDF · chapter-wide',
        icon: 'pdf',
        author: 'Department Curriculum Committee',
        content:
          'Comprehensive Unit I Course Handout:\n• Three-Schema Architecture Diagram and Explanation\n• Physical vs Logical Data Independence Comparative Study\n• Database Users: Application Programmers, Sophisticated Users, Specialized Users, Naive Users\n• Database Administrator (DBA) Responsibilities\n• Complete ER Notation Reference Chart (Chen Notation vs Crow’s Foot Notation).',
      },
    ],
    practiceQuestions: [
      {
        id: 'pq1-1',
        question: 'Which level of the Three-Schema Architecture describes what data are stored in the database and what relationships exist among them?',
        options: ['Physical / Internal level', 'Conceptual / Logical level', 'External / View level', 'Physical-Logical interface'],
        correctAnswer: 1,
        explanation: 'The Conceptual level describes the structure of the whole database for a community of users, defining all entities, data types, relationships, and constraints without physical storage details.',
        bloomLevel: 'Remember',
        difficulty: 'Easy',
        examTag: 'High Yield · Univ Exam 2023',
      },
      {
        id: 'pq1-2',
        question: 'Which type of data independence is generally more difficult to achieve and why?',
        options: [
          'Physical Data Independence, because hardware changes frequently',
          'Logical Data Independence, because application programs are heavily dependent on the conceptual structure of data',
          'External Data Independence, because views are dynamically compiled',
          'View Data Independence, because SQL queries cannot be cached',
        ],
        correctAnswer: 1,
        explanation: 'Logical data independence is harder to achieve because application programs and queries are written directly against the conceptual schema. Altering a table or attribute often breaks existing queries.',
        bloomLevel: 'Understand',
        difficulty: 'Medium',
        examTag: 'Frequent Short Answer',
      },
      {
        id: 'pq1-3',
        question: 'In an ER Diagram, how is a Weak Entity Set uniquely identified in a relational schema?',
        options: [
          'By its own primary key alone',
          'By combining the partial key (discriminator) of the weak entity with the primary key of its identifying owner entity',
          'By an auto-generated sequence number in the view level',
          'By creating a ternary relationship with all adjacent entities',
        ],
        correctAnswer: 1,
        explanation: 'A weak entity lacks a primary key. It is identified by the combination of the identifying entity’s primary key and its own partial discriminator (underlined with a dashed line in ER diagrams).',
        bloomLevel: 'Apply',
        difficulty: 'Medium',
        examTag: 'Univ Exam 2024',
      },
      {
        id: 'pq1-4',
        question: 'When mapping a 1:N relationship from Entity A (1-side) to Entity B (N-side) into relational tables, where does the foreign key go?',
        options: [
          'The primary key of Entity B is placed as a foreign key in Entity A',
          'The primary key of Entity A is placed as a foreign key in Entity B',
          'A separate junction table is mandatory for all 1:N relationships',
          'Foreign keys are placed in both tables symmetrically',
        ],
        correctAnswer: 1,
        explanation: 'In a 1:N relationship, each instance of B is associated with at most one instance of A. Therefore, placing A’s primary key as a foreign key in table B is single-valued and does not cause redundancy.',
        bloomLevel: 'Apply',
        difficulty: 'Easy',
        examTag: 'Core Mapping Rule',
      },
      {
        id: 'pq1-5',
        question: 'What is the key difference between Disjoint (d) and Overlapping (o) Specialization?',
        options: [
          'Disjoint allows an entity to belong to multiple subclasses; Overlapping restricts to one subclass',
          'Disjoint restricts an entity to at most one subclass; Overlapping allows an entity to belong to multiple subclasses',
          'Disjoint applies only to weak entities; Overlapping applies to strong entities',
          'Disjoint enforces total participation; Overlapping enforces partial participation',
        ],
        correctAnswer: 1,
        explanation: 'In disjoint specialization, subclasses must be mutually exclusive (e.g., an employee is either salaried OR hourly). In overlapping specialization, an entity may belong to more than one subclass (e.g., a person can be both a student AND an employee).',
        bloomLevel: 'Understand',
        difficulty: 'Medium',
        examTag: 'EER Theory',
      },
    ],
    keyTakeaways: {
      coreDefinitions: [
        { term: 'DBMS', definition: 'A collection of programs that enables users to create, maintain, and query a shared structured database.' },
        { term: 'Three-Schema Architecture', definition: 'ANSI/SPARC framework separating External, Conceptual, and Internal storage levels.' },
        { term: 'Data Independence', definition: 'The immunity of user applications to changes in conceptual or physical storage schemas.' },
        { term: 'Candidate Key', definition: 'A minimal superkey; an attribute set whose values uniquely identify tuples with no redundant attributes.' },
        { term: 'Weak Entity', definition: 'An entity type that lacks a primary key and depends on an owner entity via an identifying relationship.' },
      ],
      essentialRules: [
        'Strong entity maps to a table with its designated primary key.',
        'Weak entity maps to a table whose PK = Owner PK + Partial Key (Discriminator).',
        '1:N relationship: Foreign key goes on the N-side relation.',
        'M:N relationship: Requires a separate junction table containing FKs to both entities.',
        'Multivalued attribute: Maps to a separate relation containing (Owner PK + Attribute Value).',
      ],
      commonPitfalls: [
        'Confusing Physical Data Independence with Logical Data Independence.',
        'Attempting to map an M:N relationship without creating a separate junction table.',
        'Underlining a partial key with a solid line instead of a dashed line in ER diagrams.',
        'Placing the foreign key on the 1-side of a 1:N relationship, causing null values or multi-value violation.',
      ],
      examTips: [
        'Always draw both the ER diagram and write the mapped SQL schema with PRIMARY KEY and FOREIGN KEY constraints for 10-12 mark questions.',
        'Memorize the 3 levels of the ANSI/SPARC architecture and draw the two vertical mapping lines for full marks.',
        'State whether your specialization is (total vs partial) and (disjoint vs overlapping) in EER questions.',
      ],
    },
  },
  {
    unitNumber: 2,
    unitRoman: 'UNIT II',
    title: 'Relational Model & SQL',
    lectureHours: 10,
    examWeightage: 20,
    subtopicsCount: 8,
    status: 'In Progress',
    progressPct: 75,
    concepts: [
      {
        id: 'c2-1',
        number: 1,
        title: 'Relational Model & Integrity Constraints',
        subtitle: 'Domain, Key, Entity, and Referential integrity rules with foreign keys.',
        description:
          'A relational database is a collection of relations (tables). Fundamental constraints enforce database consistency: (1) Domain Constraint: Values in each tuple must belong to the domain of the corresponding attribute. (2) Key Constraint: No two tuples can have identical values for candidate keys. (3) Entity Integrity: Primary key attributes cannot contain NULL values. (4) Referential Integrity: A foreign key value in a referencing relation must either match a valid primary key value in the referenced relation or be NULL.',
        keyTakeaways: [
          'Entity Integrity: Primary Key ≠ NULL.',
          'Referential Integrity: Foreign Key must reference valid PK or be NULL.',
          'ON DELETE CASCADE removes child rows automatically when the parent row is deleted.',
          'ON DELETE SET NULL sets foreign key attributes to NULL upon parent deletion.',
        ],
        exampleOrSyntax: 'ALTER TABLE ENROLLMENT ADD CONSTRAINT fk_student FOREIGN KEY (RollNo) REFERENCES STUDENT(RollNo) ON DELETE CASCADE;',
        examRelevance: 'Integrity constraints definition & proof · 6 marks',
      },
      {
        id: 'c2-2',
        number: 2,
        title: 'Fundamental Relational Algebra',
        subtitle: 'Select (σ), Project (π), Rename (ρ), Union (∪), Set Difference (−), Cartesian Product (×).',
        description:
          'Relational Algebra is a procedural query language. Six basic operators form the foundation: (1) Select (σ): Filters tuples satisfying a predicate. (2) Project (π): Selects specific columns and eliminates duplicates. (3) Union (∪): Combines tuples from two union-compatible relations. (4) Set Difference (−): Finds tuples in relation R that are not in S. (5) Cartesian Product (×): Combines every tuple of R with every tuple of S. (6) Rename (ρ): Renames relation and attribute names.',
        keyTakeaways: [
          'Select (σ) acts horizontally on rows; Project (π) acts vertically on columns.',
          'Union, Intersection, and Set Difference require Union-Compatibility (same degree and compatible domains).',
          'Cartesian product of R (n tuples) and S (m tuples) produces n × m tuples.',
        ],
        exampleOrSyntax: 'π Name, GPA (σ Department = "CSE" ∧ GPA > 8.0 (STUDENT))',
        examRelevance: 'Writing relational algebraic expressions · 8 marks',
      },
      {
        id: 'c2-3',
        number: 3,
        title: 'Join Operations & Relational Division',
        subtitle: 'Theta, Equi, Natural, and Outer Joins (Left, Right, Full) and Division (÷).',
        description:
          'Join combines related tuples from two relations based on a matching condition: (1) Theta Join (⋈θ): Cartesian product followed by a Selection predicate θ. (2) Equi Join: Theta join where condition contains only equality (=). (3) Natural Join (⋈): Equi-join on all common attributes followed by projection to remove duplicate join columns. (4) Outer Joins (⟕, ⟖, ⟗): Preserves unmatched tuples by padding with NULLs. (5) Division Operator (R ÷ S): Useful for queries involving "for all" or "contains all".',
        keyTakeaways: [
          'Natural join automatically matches identically named attributes.',
          'Left Outer Join preserves all tuples from the left relation.',
          'Division operator is used for queries like "Find students who have enrolled in ALL subjects of Semester 6".',
        ],
        exampleOrSyntax: 'STUDENT ⟕ ENROLLMENT (preserves students without enrollment as NULLs)',
        examRelevance: 'Join types comparison & relational division queries · 10 marks',
      },
      {
        id: 'c2-4',
        number: 4,
        title: 'Complex SQL & Nested Subqueries',
        subtitle: 'Correlated subqueries, EXISTS, IN, ANY, ALL, and scalar subqueries.',
        description:
          'SQL supports powerful nested queries where an inner query provides values for an outer query. Subqueries can be non-correlated (executed once independently) or correlated (evaluated once for each row processed by the outer query). Key predicates include IN / NOT IN for set membership, EXISTS / NOT EXISTS for non-empty set testing, and comparison operators combined with ANY or ALL.',
        keyTakeaways: [
          'EXISTS tests whether a subquery returns at least one row, stopping early for high efficiency.',
          'Correlated subquery references column values from the outer query table alias.',
          'NOT EXISTS is commonly used to implement relational division in SQL.',
        ],
        exampleOrSyntax: 'SELECT S.Name FROM STUDENT S WHERE NOT EXISTS (SELECT C.CourseID FROM COURSE C WHERE NOT EXISTS (SELECT E.CourseID FROM ENROLLMENT E WHERE E.RollNo = S.RollNo AND E.CourseID = C.CourseID));',
        examRelevance: 'Writing advanced SQL queries · 10 marks',
      },
      {
        id: 'c2-5',
        number: 5,
        title: 'Grouping & Aggregate Calculations',
        subtitle: 'COUNT, SUM, AVG, MIN, MAX with GROUP BY and HAVING clauses.',
        description:
          'Aggregate functions compute a single summary value over a column of values. GROUP BY groups tuples having identical values in specified grouping columns. HAVING sets filtering criteria on aggregated groups (unlike WHERE which filters individual tuples before grouping).',
        keyTakeaways: [
          'WHERE filters rows BEFORE grouping occurs.',
          'HAVING filters groups AFTER grouping and aggregation occur.',
          'Any column in SELECT must either be inside an aggregate function or appear in the GROUP BY clause.',
        ],
        exampleOrSyntax: 'SELECT Department, COUNT(*), AVG(Salary) FROM INSTRUCTOR GROUP BY Department HAVING AVG(Salary) > 75000;',
        examRelevance: 'SQL syntax & execution order analysis · 8 marks',
      },
    ],
    materials: [
      {
        id: 'm2-1',
        title: 'Relational Algebra Master Notes',
        type: 'PDF',
        meta: 'PDF · 6 pages',
        icon: 'pdf',
        author: 'Dr. Rajesh Iyer',
        content:
          'Relational Algebra Comprehensive Guide:\n• Detailed operational semantics of σ, π, ρ, ∪, −, ×, ⋈, ⟕, ⟖, ⟗, and ÷\n• 25 solved university queries expressed in both Relational Algebra and SQL\n• Equivalence rules between relational algebra expressions for query transformation.',
      },
      {
        id: 'm2-2',
        title: 'SQL Advanced Queries Video Lecture',
        type: 'Video',
        meta: 'YouTube · 14 min',
        icon: 'video',
        author: 'Prof. Meenakshi S.',
        content:
          'Mastering Advanced SQL Queries:\n• Writing nested and correlated subqueries\n• Understanding EXISTS vs IN performance benchmarks\n• Common Table Expressions (WITH clause) and Window Functions.',
      },
      {
        id: 'm2-3',
        title: 'Joins & Nested Queries Quick Reference',
        type: 'PDF',
        meta: 'PDF · 4 pages',
        icon: 'pdf',
        author: 'Department Curriculum Committee',
        content:
          'SQL Visual Joins Cheatsheet:\n• Inner Join, Left Join, Right Join, Full Join Venn diagrams\n• GROUP BY vs HAVING rules and execution checklist\n• Trigger types (BEFORE, AFTER, INSTEAD OF) and Stored Procedure templates.',
      },
    ],
    practiceQuestions: [
      {
        id: 'pq2-1',
        question: 'What is the fundamental difference between the WHERE clause and the HAVING clause in SQL?',
        options: [
          'WHERE filters groups; HAVING filters individual rows',
          'WHERE filters rows before aggregation; HAVING filters groups after aggregation',
          'WHERE can only be used with numeric data; HAVING can only be used with strings',
          'WHERE is optional; HAVING is mandatory whenever GROUP BY is present',
        ],
        correctAnswer: 1,
        explanation: 'The WHERE clause filters individual rows before any grouping or aggregation takes place. The HAVING clause filters the resulting grouped rows based on aggregate expressions like COUNT() or AVG().',
        bloomLevel: 'Understand',
        difficulty: 'Easy',
        examTag: 'Univ Exam Favorite',
      },
      {
        id: 'pq2-2',
        question: 'Which relational algebra operator is used to answer queries containing universal quantification ("for all")?',
        options: ['Cartesian Product (×)', 'Natural Join (⋈)', 'Division Operator (÷)', 'Theta Join (⋈θ)'],
        correctAnswer: 2,
        explanation: 'Relational Division (R ÷ S) is specifically used for queries requiring universal quantification, such as finding all students who have enrolled in every single course taught in a department.',
        bloomLevel: 'Understand',
        difficulty: 'Medium',
        examTag: 'Relational Algebra Theory',
      },
      {
        id: 'pq2-3',
        question: 'If relation R has 10 tuples and relation S has 5 tuples, what is the exact number of tuples in R × S (Cartesian Product)?',
        options: ['15', '50', '5', 'Between 5 and 10 depending on matching keys'],
        correctAnswer: 1,
        explanation: 'Cartesian Product combines every tuple of R with every tuple of S unconditionally. Therefore, the total number of tuples is |R| × |S| = 10 × 5 = 50.',
        bloomLevel: 'Apply',
        difficulty: 'Easy',
        examTag: 'Numerical Recall',
      },
    ],
    keyTakeaways: {
      coreDefinitions: [
        { term: 'Entity Integrity', definition: 'The primary key of a relation cannot accept null values.' },
        { term: 'Referential Integrity', definition: 'A foreign key in a child table must point to an existing primary key in the parent table or be null.' },
        { term: 'Natural Join', definition: 'An equi-join on all common attributes followed by projection to eliminate duplicate columns.' },
        { term: 'Relational Division', definition: 'Algebraic operator (R ÷ S) identifying tuples in R that match all tuples in S.' },
      ],
      essentialRules: [
        'SQL execution order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY.',
        'Primary key columns can never contain NULL.',
        'Union-compatibility requires identical degree (number of columns) and compatible data types.',
      ],
      commonPitfalls: [
        'Using aggregate functions (like SUM or COUNT) inside the WHERE clause.',
        'Selecting a non-aggregated column in SQL that is omitted from the GROUP BY clause.',
        'Assuming Natural Join will work safely when two tables share unrelated column names (e.g., both having "ID").',
      ],
      examTips: [
        'Remember the exact Greek symbols: σ for Select, π for Project, ρ for Rename, ⋈ for Natural Join, ÷ for Division.',
        'When asked to write a query for "students who took ALL courses", use the double NOT EXISTS pattern in SQL or Division in Relational Algebra.',
      ],
    },
  },
  {
    unitNumber: 3,
    unitRoman: 'UNIT III',
    title: 'Normalization & Design',
    lectureHours: 9,
    examWeightage: 20,
    subtopicsCount: 6,
    status: 'In Progress',
    progressPct: 50,
    concepts: [
      {
        id: 'c3-1',
        number: 1,
        title: 'Functional Dependencies & Armstrong Axioms',
        subtitle: 'Reflexivity, Augmentation, Transitivity, and Closure of FDs (F+).',
        description:
          'A functional dependency X → Y between attribute sets X and Y specifies that whenever two tuples agree on X, they must also agree on Y. Armstrong’s Axioms are sound and complete inference rules: (1) Reflexivity: If Y ⊆ X, then X → Y. (2) Augmentation: If X → Y, then XZ → YZ. (3) Transitivity: If X → Y and Y → Z, then X → Z. Secondary rules include Union, Decomposition, and Pseudotransitivity.',
        keyTakeaways: [
          'Sound: Any FD inferred from Armstrong’s Axioms is true in every legal database instance.',
          'Complete: All valid FDs can be derived using Armstrong’s Axioms.',
          'Closure F+ contains all FDs logically implied by a given set of FDs F.',
        ],
        exampleOrSyntax: 'If Student_ID → Dept and Dept → HOD, then by Transitivity: Student_ID → HOD.',
        examRelevance: 'Axiom proofs & inference rules · 8 marks',
      },
      {
        id: 'c3-2',
        number: 2,
        title: 'Attribute Closure & Candidate Keys',
        subtitle: 'Systematic algorithm to find all candidate keys from FD sets using (X+).',
        description:
          'The attribute closure X+ is the set of all attributes functionally determined by X under F. Algorithm: (1) Start with X+ = X. (2) Repeat until no more attributes can be added: if there is an FD Y → Z such that Y ⊆ X+, then X+ = X+ ∪ Z. If X+ equals the entire relation schema R, then X is a Superkey. If no proper subset of X is a superkey, then X is a Candidate Key.',
        keyTakeaways: [
          'Essential attributes (appearing only on the LHS of FDs) MUST be in every candidate key.',
          'Attributes never appearing in any FD must be present in every candidate key.',
          'Attributes appearing only on the RHS can NEVER be part of any candidate key.',
        ],
        exampleOrSyntax: 'For R(A, B, C, D) with F = {A → B, B → C, C → D}: Closure of A: A+ = {A, B, C, D}. Hence A is Candidate Key.',
        examRelevance: 'Finding all candidate keys numerical · 8 marks',
      },
      {
        id: 'c3-3',
        number: 3,
        title: '1NF, 2NF, and 3NF Normal Forms',
        subtitle: 'Eliminating partial dependencies and transitive dependencies.',
        description:
          'Normalization systematically eliminates redundancy and anomalies. (1) 1NF: All attribute values must be atomic (no multivalued or composite attributes). (2) 2NF: In 1NF and no non-prime attribute is partially dependent on any candidate key (every non-prime attribute must depend on the FULL candidate key). (3) 3NF: In 2NF and no non-prime attribute is transitively dependent on any candidate key (for every X → Y, X is superkey OR Y is prime attribute).',
        keyTakeaways: [
          '1NF eliminates repeating groups and composite values.',
          '2NF eliminates partial functional dependencies (non-prime depending on part of a composite key).',
          '3NF eliminates transitive functional dependencies (non-prime depending on non-prime).',
        ],
        exampleOrSyntax: 'R(RollNo, CourseID, CourseFee): CourseFee depends only on CourseID, which is a partial key. Violates 2NF!',
        examRelevance: 'Determining highest normal form & decomposition · 10 marks',
      },
      {
        id: 'c3-4',
        number: 4,
        title: 'Boyce-Codd Normal Form (BCNF)',
        subtitle: 'Strict condition: Every determinant must be a superkey.',
        description:
          'BCNF is a stricter version of 3NF. A relation R is in BCNF if for every non-trivial functional dependency X → Y, X is a Superkey of R. Unlike 3NF, BCNF does not allow the exception where Y is a prime attribute. Every relation in BCNF is in 3NF, but not every relation in 3NF is in BCNF.',
        keyTakeaways: [
          'BCNF eliminates ALL redundancy based on functional dependencies.',
          'Condition: X must be a superkey for every non-trivial FD X → Y.',
          'Trade-off: A BCNF decomposition is always lossless, but may NOT always preserve all functional dependencies.',
        ],
        exampleOrSyntax: 'R(Student, Subject, Teacher) with {Student, Subject} → Teacher, and Teacher → Subject. 3NF but NOT BCNF because Teacher is not a superkey.',
        examRelevance: '3NF vs BCNF comparison & decomposition algorithm · 10 marks',
      },
      {
        id: 'c3-5',
        number: 5,
        title: 'Lossless Join & Dependency Preservation',
        subtitle: 'Testing non-additive joins using the Chase Algorithm and preserving FDs.',
        description:
          'When decomposing relation R into R1 and R2, two properties are critical: (1) Lossless (Non-additive) Join: R1 ⋈ R2 must equal R exactly without generating spurious tuples. Condition for binary decomposition: (R1 ∩ R2) → (R1 − R2) OR (R1 ∩ R2) → (R2 − R1). (2) Dependency Preservation: The union of projections of FDs on R1 and R2 must imply all original FDs in F.',
        keyTakeaways: [
          'Lossless Join is mandatory; a lossy decomposition leads to incorrect query results.',
          '3NF decomposition always guarantees BOTH lossless join and dependency preservation.',
          'BCNF decomposition guarantees lossless join, but dependency preservation is not always possible.',
        ],
        exampleOrSyntax: 'Common attributes (R1 ∩ R2) must form a candidate key of at least one of the decomposed relations.',
        examRelevance: 'Decomposition verification theorem · 8 marks',
      },
    ],
    materials: [
      {
        id: 'm3-1',
        title: 'Normalization Step-by-Step Guide',
        type: 'PDF',
        meta: 'PDF · 8 pages',
        icon: 'pdf',
        author: 'Dr. Rajesh Iyer',
        content:
          'Step-by-Step Normalization Manual:\n• 1NF, 2NF, 3NF, BCNF definitions with real university exam tables\n• Procedure for finding Candidate Keys using Attribute Closure\n• Minimal Cover (Canonical Cover) 3-step reduction algorithm\n• 10 Worked Decomposition problems.',
      },
      {
        id: 'm3-2',
        title: 'BCNF Decomposition Worked Video',
        type: 'Video',
        meta: 'YouTube · 11 min',
        icon: 'video',
        author: 'Prof. Meenakshi S.',
        content:
          'Video Lecture: Testing Lossless Join Property & BCNF Decomposition.\n\nDemonstrating the Chase Tableau method to prove whether a decomposition is lossless and identifying which FDs are lost during BCNF reduction.',
      },
      {
        id: 'm3-3',
        title: 'Minimal Cover Computation Sheet',
        type: 'PDF',
        meta: 'PDF · 2 pages',
        icon: 'pdf',
        author: 'Department Curriculum Committee',
        content:
          'Canonical Cover Cheat Sheet:\n1. Decompose RHS attributes into singletons (A → BC becomes A → B, A → C)\n2. Remove extraneous LHS attributes\n3. Eliminate redundant functional dependencies using closure testing.',
      },
    ],
    practiceQuestions: [
      {
        id: 'pq3-1',
        question: 'Which condition must hold for a binary decomposition of R into R1 and R2 to be lossless?',
        options: [
          'R1 ∩ R2 must be empty',
          'R1 ∩ R2 must contain a candidate key for either R1 or R2',
          'R1 ∪ R2 must contain all foreign keys',
          'Both R1 and R2 must already be in BCNF',
        ],
        correctAnswer: 1,
        explanation: 'A binary decomposition is lossless if and only if the common attributes (R1 ∩ R2) functionally determine all attributes of R1 or all attributes of R2 (i.e. is a superkey of at least one relation).',
        bloomLevel: 'Understand',
        difficulty: 'Medium',
        examTag: 'Theorem Application',
      },
      {
        id: 'pq3-2',
        question: 'In 3NF, for every non-trivial functional dependency X → Y, what is the allowed condition?',
        options: [
          'X must be a candidate key only',
          'X is a superkey OR Y is a prime attribute',
          'Y must be a superkey',
          'Neither X nor Y can contain candidate keys',
        ],
        correctAnswer: 1,
        explanation: '3NF relaxes the strict BCNF requirement by permitting X → Y if either X is a superkey OR every attribute in Y is a prime attribute (belongs to some candidate key).',
        bloomLevel: 'Remember',
        difficulty: 'Easy',
        examTag: 'Core Definition',
      },
    ],
    keyTakeaways: {
      coreDefinitions: [
        { term: 'Functional Dependency', definition: 'A constraint where the values of attribute set X uniquely determine attribute set Y (X → Y).' },
        { term: 'Prime Attribute', definition: 'An attribute that belongs to at least one candidate key of the relation.' },
        { term: 'Partial Dependency', definition: 'A functional dependency where a non-prime attribute depends on a proper subset of a candidate key.' },
        { term: 'Transitive Dependency', definition: 'A functional dependency X → Z holding via an intermediate non-prime attribute Y (X → Y and Y → Z).' },
      ],
      essentialRules: [
        '1NF: Atomic values only (no sets, lists, or composite attributes).',
        '2NF: 1NF + No partial dependencies on candidate keys.',
        '3NF: 2NF + No transitive dependencies on candidate keys (X is superkey OR Y is prime).',
        'BCNF: For every X → Y, X must be a superkey.',
      ],
      commonPitfalls: [
        'Assuming a relation with a single-attribute primary key can violate 2NF (it can never violate 2NF because partial keys cannot exist!).',
        'Assuming 3NF decomposition can lose dependencies (3NF always preserves both lossless join and dependencies).',
      ],
      examTips: [
        'If the relation has only one candidate key consisting of a single attribute, 2NF is automatically satisfied.',
        'To find candidate keys quickly, identify attributes that never appear on the RHS of any FD; they MUST be in every candidate key.',
      ],
    },
  },
  {
    unitNumber: 4,
    unitRoman: 'UNIT IV',
    title: 'Transaction Management',
    lectureHours: 9,
    examWeightage: 20,
    subtopicsCount: 6,
    status: 'In Progress',
    progressPct: 40,
    concepts: [
      {
        id: 'c4-1',
        number: 1,
        title: 'ACID Transaction Guarantees',
        subtitle: 'Atomicity, Consistency, Isolation, Durability and their underlying mechanisms.',
        description:
          'A transaction is a logical unit of work. To ensure data integrity, the DBMS must maintain four ACID properties: (1) Atomicity: "All or nothing" execution enforced by the Recovery Manager using Write-Ahead Logging (WAL). (2) Consistency: A transaction transforms database from one valid state to another, preserving integrity constraints. (3) Isolation: Concurrent execution produces the same result as if transactions ran serially, enforced by Concurrency Control (Locking/MVCC). (4) Durability: Once committed, updates persist even across system crashes, enforced by non-volatile log flushing.',
        keyTakeaways: [
          'Atomicity → Recovery Management (Undo Log).',
          'Consistency → Application logic + Integrity constraint checks.',
          'Isolation → Concurrency Control Manager (2PL / Timestamps).',
          'Durability → Recovery Management (Redo Log flushed to disk).',
        ],
        exampleOrSyntax: 'Bank Transfer: Debit Account A ($100), Credit Account B ($100). If crash occurs after debit, Atomicity rolls back debit.',
        examRelevance: 'ACID table & subsystem mapping · 8 marks',
      },
      {
        id: 'c4-2',
        number: 2,
        title: 'Conflict Serializability & Precedence Graphs',
        subtitle: 'Testing cycle-free precedence graphs to guarantee serializability.',
        description:
          'Two operations in a schedule conflict if they belong to different transactions, access the same data item, and at least one operation is a Write. A schedule is conflict serializable if it is conflict equivalent to a serial schedule. Testing algorithm: Construct a Precedence (Serialization) Graph where nodes are transactions and directed edge Ti → Tj exists if Ti performs an operation that conflicts with a subsequent operation in Tj. If the graph contains NO CYCLES, the schedule is Conflict Serializable.',
        keyTakeaways: [
          'Conflicting pairs: (Read, Write), (Write, Read), (Write, Write) on the SAME item.',
          'Graph cycle = NOT conflict serializable.',
          'Topological sort of the acyclic graph yields the equivalent serial execution order.',
        ],
        exampleOrSyntax: 'Edge T1 → T2 if T1 writes X before T2 reads X. If cycle T1 → T2 → T1 exists, schedule is non-serializable.',
        examRelevance: 'Precedence graph drawing & serial order derivation · 10 marks',
      },
      {
        id: 'c4-3',
        number: 3,
        title: 'Two-Phase Locking (2PL) Protocol',
        subtitle: 'Growing phase, Shrinking phase, Strict 2PL, and Rigorous 2PL.',
        description:
          '2PL guarantees Conflict Serializability by enforcing two phases: (1) Growing Phase: Transaction may acquire locks but cannot release any lock. (2) Shrinking Phase: Transaction may release locks but cannot acquire new locks. The Lock Point is the instant when the transaction acquires its final lock. Variants: Strict 2PL holds all Exclusive locks until commit/abort (prevents cascading aborts). Rigorous 2PL holds ALL locks (both Shared and Exclusive) until commit.',
        keyTakeaways: [
          'Basic 2PL guarantees conflict serializability, but can suffer from Cascading Aborts and Deadlocks.',
          'Strict 2PL guarantees serializability AND strict schedules (no cascading aborts).',
          'Rigorous 2PL is the most common protocol implemented in commercial DBMS.',
        ],
        exampleOrSyntax: 'Growing: Lock-S(A), Lock-X(B). Lock Point reached. Shrinking: Unlock(A), Unlock(B).',
        examRelevance: '2PL types & cascading rollback prevention · 8 marks',
      },
    ],
    materials: [
      {
        id: 'm4-1',
        title: 'Concurrency Control & Schedules Notes',
        type: 'PDF',
        meta: 'PDF · 7 pages',
        icon: 'pdf',
        author: 'Dr. Rajesh Iyer',
        content:
          'Transaction Processing Deep Dive:\n• Serial, Serializable, Recoverable, and Cascadeless schedule definitions\n• 15 Precedence Graph solved exam problems\n• Concurrency hazards: Dirty Read, Unrepeatable Read, Lost Update, Phantom Read.',
      },
      {
        id: 'm4-2',
        title: 'Serializability Testing Walkthrough',
        type: 'Video',
        meta: 'YouTube · 9 min',
        icon: 'video',
        author: 'Prof. Meenakshi S.',
        content:
          'Video Walkthrough: Constructing Precedence Graphs and testing for cycles. Includes step-by-step resolution of university examination questions.',
      },
    ],
    practiceQuestions: [
      {
        id: 'pq4-1',
        question: 'Under the Two-Phase Locking (2PL) protocol, what is a transaction forbidden from doing once it enters the shrinking phase?',
        options: ['Releasing locks', 'Acquiring new locks', 'Committing', 'Reading data items'],
        correctAnswer: 1,
        explanation: 'In 2PL, once a transaction releases even a single lock, it enters the shrinking phase and is strictly forbidden from acquiring any new locks.',
        bloomLevel: 'Remember',
        difficulty: 'Easy',
        examTag: 'Core 2PL Rule',
      },
    ],
    keyTakeaways: {
      coreDefinitions: [
        { term: 'Atomicity', definition: 'Ensures that all operations of a transaction execute completely or none at all.' },
        { term: 'Conflict Serializability', definition: 'A schedule that can be transformed into a serial schedule by swapping non-conflicting operations.' },
        { term: 'Strict 2PL', definition: '2PL protocol where all exclusive locks are held until transaction completion, preventing cascading rollbacks.' },
      ],
      essentialRules: [
        'Conflicting operations: Different transactions, same data item, at least one write.',
        'Precedence graph acyclic → Conflict serializable.',
        'Strict 2PL prevents cascading aborts.',
      ],
      commonPitfalls: [
        'Assuming (Read, Read) operations conflict (they never conflict!).',
        'Believing basic 2PL prevents deadlocks (it prevents non-serializability, but deadlocks can still occur!).',
      ],
      examTips: [
        'When testing serializability, list all conflicting pairs first, then draw directed edges.',
        'Topological sort gives the equivalent serial schedule order.',
      ],
    },
  },
  {
    unitNumber: 5,
    unitRoman: 'UNIT V',
    title: 'Query Processing & Optimization',
    lectureHours: 8,
    examWeightage: 20,
    subtopicsCount: 6,
    status: 'Upcoming',
    progressPct: 30,
    concepts: [
      {
        id: 'c5-1',
        number: 1,
        title: 'Primary, Secondary & Clustering Indexes',
        subtitle: 'Dense vs Sparse indexing structures and seek cost comparisons.',
        description:
          'Indexes speed up record retrieval: (1) Primary Index: Built on an ordered data file ordered on a key field. It is sparse (one entry per data block). (2) Clustering Index: Built on an ordered data file ordered on a non-key field. Sparse (one entry per distinct non-key value). (3) Secondary Index: Built on an unordered or ordered data file on any field. Dense (one entry per record) or sparse over a primary key. (4) Dense vs Sparse: Dense index contains an index record for EVERY search-key value in the file.',
        keyTakeaways: [
          'Primary index is always built on the primary key ordering field.',
          'A file can have at most ONE primary or clustering index, but multiple secondary indexes.',
          'Dense index requires more storage but enables index-only query answering.',
        ],
        exampleOrSyntax: 'Sparse Index on Block Anchor: Points only to the first record of each disk block.',
        examRelevance: 'Index types comparison & block access calculation · 8 marks',
      },
      {
        id: 'c5-2',
        number: 2,
        title: 'B+ Tree Architecture & Operations',
        subtitle: 'Multi-level balanced indexing, node split algorithms, and sequential leaf links.',
        description:
          'A B+ Tree is a self-balancing search tree. Critical properties: (1) All leaf nodes are at the same depth. (2) Internal nodes contain search keys and child pointers to guide search, but NO actual data pointers. (3) ALL data pointers and keys reside in the leaf nodes. (4) Leaf nodes are linked as a doubly-linked list for fast sequential range queries. Search cost is O(log_B N) where B is the node fanout.',
        keyTakeaways: [
          'In a B+ Tree, only leaves store record pointers; in a B-Tree, internal nodes also store record pointers.',
          'Higher fanout (B) results in a very shallow tree (usually height 3-4 for millions of records).',
          'Leaf pointer chain allows blazing fast range queries (e.g. BETWEEN 20 AND 50).',
        ],
        exampleOrSyntax: 'Leaf Node: [K1, P1 | K2, P2 | ... | Kn, Pn | Next_Leaf_Pointer]',
        examRelevance: 'B+ Tree insertion with split & height calculations · 10 marks',
      },
      {
        id: 'c5-3',
        number: 3,
        title: 'Heuristic Query Optimization',
        subtitle: 'Relational algebra equivalence rules, pushing Selections and Projections early.',
        description:
          'Query optimization converts an SQL query into an efficient physical execution plan. Heuristic rules transform the canonical relational algebra query tree into an optimized tree: (1) Perform Selection (σ) operations as early as possible (pushes filters down to reduce intermediate relation sizes). (2) Perform Projection (π) early to discard unnecessary columns. (3) Choose the most restrictive Selection first. (4) Compute selective Joins before non-selective ones.',
        keyTakeaways: [
          'Pushing selections down avoids expensive large Cartesian products.',
          'Early projection reduces memory bandwidth and disk I/O.',
          'Query trees are evaluated bottom-up from leaves (base tables) to root (final result).',
        ],
        exampleOrSyntax: 'σ Salary > 50000 (EMPLOYEE ⋈ DEPARTMENT) → (σ Salary > 50000 (EMPLOYEE)) ⋈ DEPARTMENT',
        examRelevance: 'Query tree transformation heuristic rules · 8 marks',
      },
    ],
    materials: [
      {
        id: 'm5-1',
        title: 'Indexing & B+ Trees Deep Dive',
        type: 'PDF',
        meta: 'PDF · 10 pages',
        icon: 'pdf',
        author: 'Dr. Rajesh Iyer',
        content:
          'Complete Guide to Physical Storage & Indexing:\n• File organizations (Heap, Sequential, Hashed)\n• Calculating tree height and block access costs for B+ Trees\n• B+ Tree Node Splitting and Merging step-by-step algorithms.',
      },
      {
        id: 'm5-2',
        title: 'B+ Tree Node Split Animation Video',
        type: 'Video',
        meta: 'YouTube · 12 min',
        icon: 'video',
        author: 'Prof. Meenakshi S.',
        content:
          'Visualizing B+ Tree insertion, root splitting, and sibling pointer linking with step-by-step animation.',
      },
    ],
    practiceQuestions: [
      {
        id: 'pq5-1',
        question: 'What is the primary architectural advantage of a B+ Tree over a standard B-Tree for database systems?',
        options: [
          'B+ Tree stores records randomly across all nodes',
          'All record pointers reside exclusively in the leaf nodes, which are linked sequentially for rapid range queries',
          'B+ Tree does not require node splitting during insertion',
          'B+ Tree eliminates the need for disk blocks',
        ],
        correctAnswer: 1,
        explanation: 'In a B+ Tree, internal nodes only store routing keys, allowing much higher fan-out and shallower height. All data pointers reside in leaf nodes, which form a linked list for rapid sequential range queries.',
        bloomLevel: 'Understand',
        difficulty: 'Medium',
        examTag: 'Core Indexing Concept',
      },
    ],
    keyTakeaways: {
      coreDefinitions: [
        { term: 'Dense Index', definition: 'An index containing an index record for every single search key value in the data file.' },
        { term: 'Sparse Index', definition: 'An index containing index entries only for the first record of each data block (block anchor).' },
        { term: 'B+ Tree Fanout', definition: 'The maximum number of child pointers an internal node can hold.' },
        { term: 'Heuristic Optimization', definition: 'Query rewriting using relational algebra equivalences, such as pushing selections down.' },
      ],
      essentialRules: [
        'Push Selection (σ) down the query tree as early as possible.',
        'Push Projection (π) down to discard unused attributes early.',
        'Leaf nodes of a B+ Tree are sequentially chained.',
      ],
      commonPitfalls: [
        'Assuming a file can have multiple primary indexes (only ONE primary or clustering index is physically possible!).',
        'Evaluating Cartesian product before applying selection filters.',
      ],
      examTips: [
        'When drawing an optimized query tree, show the Selection node directly above the base table leaf, not above the join node.',
      ],
    },
  },
]

// Fallback/generator for other courses
export function getUnifiedCourseLearningData(courseId?: string, courseTitle?: string): UnifiedUnit[] {
  // If DBMS or contains database, return DBMS_UNIFIED_UNITS
  if (courseId === 'c-dbms' || !courseId || (courseTitle && courseTitle.toLowerCase().includes('database'))) {
    return DBMS_UNIFIED_UNITS
  }
  return DBMS_UNIFIED_UNITS
}
