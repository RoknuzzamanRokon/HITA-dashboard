/**
 * Simple File-based Storage for Free Trial Requests
 * This is a temporary solution. Use a real database for production.
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const TRIAL_REQUESTS_FILE = path.join(DATA_DIR, 'trial-requests.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize file if it doesn't exist
if (!fs.existsSync(TRIAL_REQUESTS_FILE)) {
    fs.writeFileSync(TRIAL_REQUESTS_FILE, JSON.stringify([], null, 2));
}

export interface TrialRequest {
    id: string;
    username: string;
    business_name: string;
    email: string;
    phone_number: string;
    message?: string;
    status: string;
    request_date: string;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
}

/**
 * Read all trial requests from file
 */
export function getAllRequests(): TrialRequest[] {
    try {
        const data = fs.readFileSync(TRIAL_REQUESTS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading trial requests:', error);
        return [];
    }
}

/**
 * Save a new trial request
 */
export function saveRequest(request: TrialRequest): boolean {
    try {
        const requests = getAllRequests();
        requests.push(request);
        fs.writeFileSync(TRIAL_REQUESTS_FILE, JSON.stringify(requests, null, 2));
        console.log('✅ Trial request saved to file:', request.id);
        return true;
    } catch (error) {
        console.error('❌ Error saving trial request:', error);
        return false;
    }
}

/**
 * Find request by email
 */
export function findByEmail(email: string): TrialRequest | undefined {
    const requests = getAllRequests();
    return requests.find(req => req.email === email);
}

/**
 * Find request by username
 */
export function findByUsername(username: string): TrialRequest | undefined {
    const requests = getAllRequests();
    return requests.find(req => req.username === username);
}

/**
 * Find request by ID
 */
export function findById(id: string): TrialRequest | undefined {
    const requests = getAllRequests();
    return requests.find(req => req.id === id);
}

/**
 * Update request status
 */
export function updateStatus(id: string, status: string): boolean {
    try {
        const requests = getAllRequests();
        const index = requests.findIndex(req => req.id === id);

        if (index === -1) {
            return false;
        }

        requests[index].status = status;
        fs.writeFileSync(TRIAL_REQUESTS_FILE, JSON.stringify(requests, null, 2));
        console.log('✅ Request status updated:', id, status);
        return true;
    } catch (error) {
        console.error('❌ Error updating status:', error);
        return false;
    }
}

/**
 * Get statistics
 */
export function getStatistics() {
    const requests = getAllRequests();

    return {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        rejected: requests.filter(r => r.status === 'rejected').length,
        active: requests.filter(r => r.status === 'active').length,
        expired: requests.filter(r => r.status === 'expired').length,
    };
}
