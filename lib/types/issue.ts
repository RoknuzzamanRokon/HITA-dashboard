/**
 * Issue management types
 */

export type IssueCategory = 'bug' | 'feature' | 'help' | 'other';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Issue {
    id: string;
    title: string;
    description: string;
    category: IssueCategory;
    priority: IssuePriority;
    status: IssueStatus;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    userEmail?: string;
    attachments?: string[];
    response?: string;
    respondedAt?: Date;
}

export interface CreateIssueInput {
    title: string;
    description: string;
    category: IssueCategory;
    priority: IssuePriority;
    userEmail?: string;
}
