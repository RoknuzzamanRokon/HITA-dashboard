/**
 * View Free Trial Data - Simple HTML Interface
 * Access at: http://localhost:3001/api/v1/free-trial/view-data
 */

import { NextRequest, NextResponse } from "next/server";
import { getAllRequests, getStatistics } from "@/lib/db/file-storage";

export async function GET(request: NextRequest) {
    try {
        const requests = getAllRequests();
        const stats = getStatistics();

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Free Trial Requests - Data Viewer</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            margin-bottom: 20px;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            font-size: 14px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .stat-label {
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: #333;
        }
        .stat-card.total .stat-value { color: #667eea; }
        .stat-card.pending .stat-value { color: #f59e0b; }
        .stat-card.approved .stat-value { color: #10b981; }
        .stat-card.rejected .stat-value { color: #ef4444; }
        .requests {
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        .requests-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px 30px;
        }
        .requests-body {
            padding: 20px;
        }
        .request-card {
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
            transition: all 0.3s;
        }
        .request-card:hover {
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transform: translateY(-2px);
        }
        .request-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
        }
        .request-id {
            font-family: monospace;
            font-size: 12px;
            color: #666;
        }
        .status-badge {
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-pending {
            background: #fef3c7;
            color: #92400e;
        }
        .status-approved {
            background: #d1fae5;
            color: #065f46;
        }
        .status-rejected {
            background: #fee2e2;
            color: #991b1b;
        }
        .request-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
        }
        .detail-item {
            display: flex;
            flex-direction: column;
        }
        .detail-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        .detail-value {
            font-size: 14px;
            color: #333;
            font-weight: 500;
        }
        .message-box {
            margin-top: 15px;
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .message-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        .message-text {
            color: #333;
            line-height: 1.6;
        }
        .no-data {
            text-align: center;
            padding: 60px 20px;
            color: #666;
        }
        .no-data-icon {
            font-size: 64px;
            margin-bottom: 20px;
        }
        .refresh-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 20px;
            transition: all 0.3s;
        }
        .refresh-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        .links {
            margin-top: 20px;
            text-align: center;
        }
        .link {
            display: inline-block;
            margin: 0 10px;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            background: rgba(255,255,255,0.2);
            border-radius: 8px;
            transition: all 0.3s;
        }
        .link:hover {
            background: rgba(255,255,255,0.3);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Free Trial Requests</h1>
            <p class="subtitle">Real-time data from data/trial-requests.json</p>
        </div>

        <div class="stats">
            <div class="stat-card total">
                <div class="stat-label">Total Requests</div>
                <div class="stat-value">${stats.total}</div>
            </div>
            <div class="stat-card pending">
                <div class="stat-label">Pending</div>
                <div class="stat-value">${stats.pending}</div>
            </div>
            <div class="stat-card approved">
                <div class="stat-label">Approved</div>
                <div class="stat-value">${stats.approved}</div>
            </div>
            <div class="stat-card rejected">
                <div class="stat-label">Rejected</div>
                <div class="stat-value">${stats.rejected}</div>
            </div>
        </div>

        <div class="requests">
            <div class="requests-header">
                <h2>All Requests (${requests.length})</h2>
            </div>
            <div class="requests-body">
                ${requests.length === 0
                ? `
                    <div class="no-data">
                        <div class="no-data-icon">📭</div>
                        <h3>No trial requests yet</h3>
                        <p>Submit your first request to see it here</p>
                        <a href="/free-trial" class="refresh-btn">Submit Request</a>
                    </div>
                `
                : requests
                    .map(
                        (req: any) => `
                    <div class="request-card">
                        <div class="request-header">
                            <span class="request-id">${req.id}</span>
                            <span class="status-badge status-${req.status}">${req.status}</span>
                        </div>
                        <div class="request-details">
                            <div class="detail-item">
                                <span class="detail-label">Username</span>
                                <span class="detail-value">${req.username}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Business Name</span>
                                <span class="detail-value">${req.business_name}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Email</span>
                                <span class="detail-value">${req.email}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Phone</span>
                                <span class="detail-value">${req.phone_number}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Request Date</span>
                                <span class="detail-value">${new Date(req.request_date).toLocaleString()}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">IP Address</span>
                                <span class="detail-value">${req.ip_address || "unknown"}</span>
                            </div>
                        </div>
                        ${req.message
                                ? `
                        <div class="message-box">
                            <div class="message-label">Message</div>
                            <div class="message-text">${req.message}</div>
                        </div>
                        `
                                : ""
                            }
                    </div>
                `
                    )
                    .join("")
            }
                <button class="refresh-btn" onclick="location.reload()">🔄 Refresh Data</button>
            </div>
        </div>

        <div class="links">
            <a href="/free-trial" class="link">📝 Submit New Request</a>
            <a href="/dashboard/admin/free-trials" class="link">👨‍💼 Admin Dashboard</a>
            <a href="/" class="link">🏠 Home</a>
        </div>
    </div>
</body>
</html>
    `;

        return new NextResponse(html, {
            headers: {
                "Content-Type": "text/html",
            },
        });
    } catch (error: any) {
        return new NextResponse(
            `<html><body><h1>Error</h1><pre>${error.message}</pre></body></html>`,
            {
                status: 500,
                headers: {
                    "Content-Type": "text/html",
                },
            }
        );
    }
}
