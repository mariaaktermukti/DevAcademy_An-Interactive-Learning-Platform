import fs from 'fs';
import path from 'path';
import { Course, Challenge, Quiz, Submission, Job, ResumeProfile, Language, User } from './types';

const STORE_PATH = path.join(process.cwd(), 'data_store.json');

// --- RICH SEED DATA ---
const SEED_LANGUAGES: Language[] = [
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: 'Braces',
    description: 'The language of the web. Master closures, async await, and modern ES6+ concepts.',
    color: '#F7DF1E'
  },
  {
    id: 'python',
    name: 'Python',
    icon: 'Terminal',
    description: 'Vibrant, simple, and powerful. Excellent for automation, web backends, and AI models.',
    color: '#3776AB'
  },
  {
    id: 'htmlcss',
    name: 'HTML & CSS',
    icon: 'Layout',
    description: 'The visual skeleton of the internet. Flexbox, grid, typography, and responsive sheets.',
    color: '#E34F26'
  }
];

const SEED_COURSES: Course[] = [
  {
    id: 'js-fundamentals',
    title: 'JavaScript Modern Foundations',
    description: 'Go from syntax basics to mastering advanced closures, async programming, and scope structures.',
    languageId: 'javascript',
    level: 'Beginner',
    coverUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&auto=format&fit=crop&q=60',
    duration: '12 Hours',
    enrollments: 1240,
    rating: 4.8,
    modules: [
      {
        id: 'js-m1',
        title: 'Variables and Control Flow',
        description: 'Learn let/const scope, conditionals, and advanced loops.',
        challenges: [
          {
            id: 'js-c1',
            title: 'Is Palindrome Checker',
            description: 'Write a function `isPalindrome(str)` that checks whether a given string reads the same forwards and backwards (ignoring case and whitespace).',
            problemStatement: `// Implement checking function
function isPalindrome(str) {
  // Your code here
}`,
            initialCode: `// Implement checking function
function isPalindrome(str) {
  // Your code here
}`,
            solutionTemplate: `
function isPalindrome(str) {
  const clean = str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return clean === clean.split('').reverse().join('');
}
`,
            testCases: [
              { id: 't1', input: '"racecar"', expectedOutput: 'true', isPublic: true },
              { id: 't2', input: '"hello"', expectedOutput: 'false', isPublic: true },
              { id: 't3', input: '"A man, a plan, a canal. Panama"', expectedOutput: 'true', isPublic: false }
            ],
            language: 'javascript',
            points: 50,
            difficulty: 'Easy'
          }
        ]
      },
      {
        id: 'js-m2',
        title: 'Arrays and Higher-Order Functions',
        description: 'Master map, filter, reduce, and ES6 array methods.',
        challenges: [
          {
            id: 'js-c2',
            title: 'Sum of Two Elements (Two Sum)',
            description: 'Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`. You can assume each input has exactly one solution.',
            problemStatement: `// Return array of two indices [index1, index2]
function twoSum(nums, target) {
  // Your code here
}`,
            initialCode: `// Return array of two indices [index1, index2]
function twoSum(nums, target) {
  // Your code here
}`,
            solutionTemplate: `
function twoSum(nums, target) {
  const map = {};
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (diff in map) return [map[diff], i];
    map[nums[i]] = i;
  }
  return [];
}
`,
            testCases: [
              { id: 't4', input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]', isPublic: true },
              { id: 't5', input: '[3, 2, 4], 6', expectedOutput: '[1, 2]', isPublic: true },
              { id: 't6', input: '[3, 3], 6', expectedOutput: '[0, 1]', isPublic: false }
            ],
            language: 'javascript',
            points: 100,
            difficulty: 'Medium'
          }
        ]
      }
    ]
  },
  {
    id: 'python-core',
    title: 'Python for Developers',
    description: 'Fast-paced introduction to python data structures, list comprehensions, and robust scripts.',
    languageId: 'python',
    level: 'Intermediate',
    coverUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=60',
    duration: '15 Hours',
    enrollments: 890,
    rating: 4.9,
    modules: [
      {
        id: 'py-m1',
        title: 'Data Structures and Algorithms',
        description: 'Dictionaries, Sets, List Comprehensions, and fast queries.',
        challenges: [
          {
            id: 'py-c1',
            title: 'FizzBuzz Classic',
            description: 'Write a python function `fizz_buzz(n)` that returns a list of strings representation of numbers from 1 to n. For multiples of 3, output "Fizz", for multiples of 5, output "Buzz", and for both, output "FizzBuzz".',
            problemStatement: `def fizz_buzz(n):
    # Your code here
    pass`,
            initialCode: `def fizz_buzz(n):
    # Your code here
    pass`,
            solutionTemplate: `
def fizz_buzz(n):
    res = []
    for i in range(1, n + 1):
        if i % 3 == 0 and i % 5 == 0:
            res.append("FizzBuzz")
        elif i % 3 == 0:
            res.append("Fizz")
        elif i % 5 == 0:
            res.append("Buzz")
        else:
            res.append(str(i))
    return res
`,
            testCases: [
              { id: 't7', input: '5', expectedOutput: '["1", "2", "Fizz", "4", "Buzz"]', isPublic: true },
              { id: 't8', input: '15', expectedOutput: '["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"]', isPublic: false }
            ],
            language: 'python',
            points: 60,
            difficulty: 'Easy'
          }
        ]
      }
    ]
  },
  {
    id: 'responsive-layouts',
    title: 'Modern CSS Grid & Flexbox',
    description: 'Master advanced visual architecture, layouts, cards, grids, and fully custom animations.',
    languageId: 'htmlcss',
    level: 'Beginner',
    coverUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&auto=format&fit=crop&q=60',
    duration: '8 Hours',
    enrollments: 760,
    rating: 4.6,
    modules: [
      {
        id: 'css-m1',
        title: 'The Box Model & Grid Positioning',
        description: 'Understand sizing, centering, flex containers, and fluid columns.',
        challenges: [
          {
            id: 'css-c1',
            title: 'Center a Div elegantly',
            description: 'Write custom CSS classes inside the `<div class="...">` element to perfectly center a child block using Flexbox. Use Tailwind class terms like `flex`, `items-center`, `justify-center`, and set the container height to full h-screen.',
            problemStatement: `<div class="/* ADD CLASSES HERE */">
  <div class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg">
    Centered Box
  </div>
</div>`,
            initialCode: `<div class="/* ADD CLASSES HERE */">
  <div class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg">
    Centered Box
  </div>
</div>`,
            solutionTemplate: `flex items-center justify-center h-screen`,
            testCases: [
              { id: 't9', input: '"classes"', expectedOutput: '"flex items-center justify-center"', isPublic: true }
            ],
            language: 'htmlcss',
            points: 40,
            difficulty: 'Easy'
          }
        ]
      }
    ]
  }
];

const SEED_QUIZZES: Quiz[] = [
  {
    id: 'quiz-js-basics',
    title: 'Modern Javascript Quickfire',
    durationSeconds: 15,
    questions: [
      {
        id: 'q1',
        question: 'Which of the following is NOT a valid JavaScript data type?',
        options: ['String', 'Float', 'Symbol', 'Undefined'],
        correctAnswerIndex: 1,
        points: 10
      },
      {
        id: 'q2',
        question: 'What is the correct output of: typeof [] in standard JS?',
        options: ['"array"', '"object"', '"list"', '"undefined"'],
        correctAnswerIndex: 1,
        points: 10
      },
      {
        id: 'q3',
        question: 'Which array method inserts elements at the start of an array?',
        options: ['push()', 'shift()', 'unshift()', 'pop()'],
        correctAnswerIndex: 2,
        points: 10
      }
    ]
  },
  {
    id: 'quiz-python-speed',
    title: 'Python Performance Trivia',
    durationSeconds: 15,
    questions: [
      {
        id: 'pyq1',
        question: 'What is the output of len({1, 2, 2, 3, 3, 3})?',
        options: ['6', '3', '2', 'Error'],
        correctAnswerIndex: 1,
        points: 10
      },
      {
        id: 'pyq2',
        question: 'Which method adds an item to the end of a list in Python?',
        options: ['add()', 'append()', 'insert()', 'push()'],
        correctAnswerIndex: 1,
        points: 10
      }
    ]
  }
];

const SEED_JOBS: Job[] = [
  {
    id: 'job1',
    title: 'Frontend Developer (React)',
    company: 'InnovateTech Systems',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=60',
    location: 'San Francisco, CA / Remote',
    type: 'Full-time',
    salary: '$105,000 - $130,000',
    description: 'We are seeking an interactive React Engineer to craft modern bento grids, responsive panels, and smooth animations using Tailwind and Framer Motion.',
    requirements: [
      'Strong mastery of modern Javascript ES6+ and React Hooks',
      'Knowledge of responsive layout grids and modern web workflows',
      'Experience building stateful widgets and performance dashboards'
    ],
    matchScore: 92,
    status: 'Not Applied',
    datePosted: '2 days ago'
  },
  {
    id: 'job2',
    title: 'Python Backend Engineer (AI Core)',
    company: 'Cognitive Minds AI',
    logo: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=100&auto=format&fit=crop&q=60',
    location: 'New York, NY / Hybrid',
    type: 'Full-time',
    salary: '$125,000 - $155,000',
    description: 'Join our core modeling pipeline team to build, optimize, and serve machine learning queries and scalable backend Express/FastAPI servers.',
    requirements: [
      'Advanced knowledge of Python list comprehensions and OOP',
      'Familiarity with SQLite, PostgreSQL, and SQL query optimizations',
      'Experience deploying models and secure server endpoints'
    ],
    matchScore: 84,
    status: 'Not Applied',
    datePosted: '5 days ago'
  },
  {
    id: 'job3',
    title: 'Full Stack Web Associate',
    company: 'WebCraft Creative',
    logo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&auto=format&fit=crop&q=60',
    location: 'Austin, TX / Remote',
    type: 'Internship',
    salary: '$40 - $55 / hour',
    description: 'A rich hands-on development path for rising developers to build front-end layouts and sync them seamlessly to SQL/Express engines.',
    requirements: [
      'Basic knowledge of Javascript, CSS, and general web components',
      'Eagerness to design robust UIs and write unit test cases',
      'Good teamwork and technical writing capability'
    ],
    matchScore: 78,
    status: 'Applied',
    datePosted: '1 day ago'
  }
];

export interface DataStore {
  languages: Language[];
  courses: Course[];
  quizzes: Quiz[];
  submissions: Submission[];
  jobs: Job[];
  resumes: ResumeProfile[];
  learningPaths: { [key: string]: string[] }; // userEmail or 'anonymous' -> array of topics/moduleIDs completed
  userScores: { points: number; quizScores: { [quizId: string]: number } };
  users: User[];
}

const DEFAULT_STORE: DataStore = {
  languages: SEED_LANGUAGES,
  courses: SEED_COURSES,
  quizzes: SEED_QUIZZES,
  submissions: [],
  jobs: SEED_JOBS,
  resumes: [],
  learningPaths: {
    'student@devacademy.edu': ['js-m1']
  },
  userScores: {
    points: 120,
    quizScores: {
      'quiz-js-basics': 20
    }
  },
  users: [
    {
      id: 'usr-student',
      name: 'Suresh Kumar',
      email: 'student@devacademy.edu',
      password: 'student123',
      role: 'student',
      points: 120
    },
    {
      id: 'usr-instructor',
      name: 'Dr. Jane Dev',
      email: 'instructor@devacademy.edu',
      password: 'instructor123',
      role: 'instructor',
      points: 450
    },
    {
      id: 'usr-admin',
      name: 'Admin Chief',
      email: 'admin@devacademy.edu',
      password: 'admin123',
      role: 'admin',
      points: 1000
    }
  ]
};

export class DbStore {
  private static data: DataStore = { ...DEFAULT_STORE };

  static load() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const fileContent = fs.readFileSync(STORE_PATH, 'utf-8');
        DbStore.data = { ...DEFAULT_STORE, ...JSON.parse(fileContent) };
      } else {
        DbStore.save();
      }
    } catch (e) {
      console.error("Failed to load db data_store.json, resetting to seeds:", e);
      DbStore.save();
    }
  }

  static save() {
    try {
      fs.writeFileSync(STORE_PATH, JSON.stringify(DbStore.data, null, 2), 'utf-8');
    } catch (e) {
      console.error("Failed to save db data_store.json:", e);
    }
  }

  static getLanguages() {
    return DbStore.data.languages;
  }

  static getCourses() {
    return DbStore.data.courses;
  }

  static addCourse(course: Course) {
    DbStore.data.courses.push(course);
    DbStore.save();
  }

  static updateCourse(course: Course) {
    const idx = DbStore.data.courses.findIndex(c => c.id === course.id);
    if (idx !== -1) {
      DbStore.data.courses[idx] = course;
      DbStore.save();
    }
  }

  static removeCourse(courseId: string) {
    const originalLength = DbStore.data.courses.length;
    DbStore.data.courses = DbStore.data.courses.filter(c => c.id !== courseId);
    if (DbStore.data.courses.length !== originalLength) {
      DbStore.save();
      return true;
    }
    return false;
  }

  static getQuizzes() {
    return DbStore.data.quizzes;
  }

  static getSubmissions() {
    return DbStore.data.submissions;
  }

  static addSubmission(sub: Submission) {
    DbStore.data.submissions.push(sub);
    // Add points if passed
    if (sub.status === 'passed') {
      DbStore.data.userScores.points += 50;
    }
    DbStore.save();
  }

  static getJobs() {
    return DbStore.data.jobs;
  }

  static updateJobStatus(id: string, status: Job['status']) {
    const job = DbStore.data.jobs.find(j => j.id === id);
    if (job) {
      job.status = status;
      DbStore.save();
    }
  }

  static addJob(job: Job) {
    DbStore.data.jobs.push(job);
    DbStore.save();
  }

  static getResumes() {
    return DbStore.data.resumes;
  }

  static saveResume(profile: ResumeProfile) {
    const existingIdx = DbStore.data.resumes.findIndex(r => r.fullName === profile.fullName);
    if (existingIdx !== -1) {
      DbStore.data.resumes[existingIdx] = profile;
    } else {
      DbStore.data.resumes.push(profile);
    }
    DbStore.save();
    return profile;
  }

  static getUserScores() {
    return DbStore.data.userScores;
  }

  static addQuizScore(quizId: string, score: number) {
    DbStore.data.userScores.quizScores[quizId] = score;
    DbStore.data.userScores.points += score;
    DbStore.save();
  }

  static getUsers() {
    if (!DbStore.data.users) {
      DbStore.data.users = [];
    }
    return DbStore.data.users;
  }

  static addUser(user: User) {
    if (!DbStore.data.users) {
      DbStore.data.users = [];
    }
    DbStore.data.users.push(user);
    DbStore.save();
  }
}

// Initial boot load
DbStore.load();
