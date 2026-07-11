export interface Language {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isPublic: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  problemStatement: string;
  initialCode: string;
  solutionTemplate: string; // Used to help evaluate Python or JS simulated executions
  testCases: TestCase[];
  language: string;
  points: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Module {
  id: string;
  title: string;
  description: string;
  challenges: Challenge[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  languageId: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  coverUrl: string;
  duration: string;
  enrollments: number;
  rating: number;
  modules: Module[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  durationSeconds: number;
  questions: QuizQuestion[];
}

export interface Submission {
  id: string;
  challengeId: string;
  code: string;
  status: 'passed' | 'failed' | 'error';
  output: string;
  timestamp: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  matchScore?: number;
  status?: 'Applied' | 'Interviewing' | 'Selected' | 'Rejected' | 'Not Applied';
  datePosted: string;
}

export type Role = 'student' | 'instructor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  points: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'interviewer';
  text: string;
  timestamp: string;
  voiceUrl?: string; // Base64 or URL audio if generated
}

export interface InterviewSession {
  id: string;
  role: string;
  topic: string;
  status: 'ongoing' | 'completed';
  messages: ChatMessage[];
  code?: string;
  feedback?: {
    overallScore: number;
    technicalScore: number;
    communicationScore: number;
    strengths: string[];
    improvements: string[];
    detailedAnalysis: string;
  };
}

export interface ResumeProfile {
  id?: string;
  fullName: string;
  email: string;
  github: string;
  linkedin: string;
  role: string;
  summary: string;
  skills: string[];
  experience: {
    id: string;
    title: string;
    company: string;
    duration: string;
    bullets: string[];
  }[];
  projects: {
    id: string;
    name: string;
    description: string;
    tech: string[];
    link?: string;
  }[];
  theme: 'modern' | 'minimalist' | 'tech' | 'serif';
}

export interface LiveStreamState {
  streaming: boolean;
  viewers: number;
  title: string;
  instructorName: string;
  chat: { id: string; user: string; text: string; time: string; avatar?: string }[];
  whiteboardPoints: { x: number; y: number; drawing: boolean; color: string }[];
}

export interface LiveQuizState {
  active: boolean;
  quizId: string;
  currentQuestionIndex: number;
  secondsLeft: number;
  participants: { name: string; score: number; answered: boolean; lastCorrect: boolean }[];
  isHosting: boolean;
}

declare module 'html2pdf.js';
