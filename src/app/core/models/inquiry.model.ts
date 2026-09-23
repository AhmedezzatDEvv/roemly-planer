export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'New' | 'In Review' | 'Resolved';
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}
