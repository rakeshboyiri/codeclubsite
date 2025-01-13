export interface Notice {
  _id: string;
  title: string;
  content: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  scheduledFor?: string;
  expiresAt?: string;
  author: string;
  tags: string[];
  attachments: {
    type: 'image' | 'pdf' | 'document';
    url: string;
    filename: string;
  }[];
  views: number;
  bookmarks?: number; // Make bookmarks optional,
  isVisible: boolean; // Add this line,
}
  
  export interface Comment {
    _id: string;
    noticeId: string;
    userId: string;
    content: string;
    createdAt: string;
  }
  
  export interface PaginatedNotices {
    notices: Notice[];
    totalPages: number;
    currentPage: number;
  }
  
  