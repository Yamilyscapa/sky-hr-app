class Api {
    private baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    /**
     * Get authentication headers including session cookies
     */
    private async getAuthHeaders(): Promise<HeadersInit> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        
        // Get session cookies from Better Auth Expo client
        const { authClient } = await import('@/lib/auth-client');
        const cookies = authClient.getCookie();
        
        if (cookies) {
            headers['Cookie'] = cookies;
        }
        
        return headers;
    }

    // Generic HTTP methods
    public async get(url: string) {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${this.baseUrl}/${url}`, {
            headers,
            credentials: "omit", // Prevent interference with manual Cookie header
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }
        return response.json();
    }

    public async post(url: string, data: any) {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${this.baseUrl}/${url}`, {
            method: 'POST',
            headers,
            credentials: "omit", // Prevent interference with manual Cookie header
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }
        return response.json();
    }

    public async put(url: string, data: any) {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${this.baseUrl}/${url}`, {
            method: 'PUT',
            headers,
            credentials: "omit", // Prevent interference with manual Cookie header
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }
        return response.json();
    }

    public async postFormData(url: string, formData: FormData) {
        // Get session cookies for FormData requests
        const { authClient } = await import('@/lib/auth-client');
        const cookies = authClient.getCookie();
        
        const headers: HeadersInit = {};
        if (cookies) {
            headers['Cookie'] = cookies;
        }
        
        // Don't set Content-Type for FormData - let the browser set it with boundary
        const response = await fetch(`${this.baseUrl}/${url}`, {
            method: 'POST',
            headers,
            credentials: "omit", // Prevent interference with manual Cookie header
            body: formData,
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }
        return response.json();
    }

    // Attendance API methods

    /**
     * Validate QR code data
     * @param qrData - Hex-encoded obfuscated QR data
     * @returns Validation result with location_id and organization_id
     */
    public async validateQR(qrData: string) {
        return this.post('attendance/qr/validate', { qr_data: qrData }) as Promise<{ data: { location_id: string, organization_id: string } }>;
    }

    /**
     * Record attendance check-in with multi-factor verification
     * @param data - Check-in data including organization, location, face image, and GPS coordinates
     * @returns Attendance event with verification results
     */
    public async checkIn(data: {
        organization_id: string;
        location_id: string;
        image: string; // base64 encoded image
        latitude: string;
        longitude: string;
    }) {
        return this.post('attendance/check-in', data);
    }

    /**
     * Record attendance check-out
     * @param data - Check-out data including optional event ID, face image, and GPS coordinates
     * @returns Updated attendance event with check-out time
     */
    public async checkOut(data?: {
        attendanceEventId?: string;
        image?: File | Blob;
        latitude?: string;
        longitude?: string;
    }) {
        const formData = new FormData();
        if (data?.attendanceEventId) {
            formData.append('attendance_event_id', data.attendanceEventId);
        }
        if (data?.image) {
            formData.append('image', data.image);
        }
        if (data?.latitude) {
            formData.append('latitude', data.latitude);
        }
        if (data?.longitude) {
            formData.append('longitude', data.longitude);
        }
        return this.postFormData('attendance/check-out', formData);
    }

    /**
     * Mark users as absent (Admin only)
     * @param data - User IDs, date, and optional notes
     * @returns Count of marked absences and created events
     */
    public async markAbsences(data: {
        userIds: string[];
        date: string;
        notes?: string;
    }) {
        return this.post('attendance/admin/mark-absences', {
            user_ids: data.userIds,
            date: data.date,
            notes: data.notes,
        });
    }

    /**
     * Update attendance event status (Admin only)
     * @param eventId - Attendance event ID
     * @param data - Status and optional notes
     * @returns Updated attendance event
     */
    public async updateAttendanceStatus(
        eventId: string,
        data: {
            status: 'on_time' | 'late' | 'early' | 'absent' | 'out_of_bounds';
            notes?: string;
        }
    ) {
        return this.put(`attendance/admin/update-status/${eventId}`, data);
    }

    /**
     * Generate attendance report
     * @param params - Optional filters for date range, user, and status
     * @returns Attendance report with events and summary statistics
     */
    public async getAttendanceReport(params?: {
        startDate?: string;
        endDate?: string;
        userId?: string;
        status?: string;
    }) {
        const queryParams = new URLSearchParams();
        if (params?.startDate) {
            queryParams.append('start_date', params.startDate);
        }
        if (params?.endDate) {
            queryParams.append('end_date', params.endDate);
        }
        if (params?.userId) {
            queryParams.append('user_id', params.userId);
        }
        if (params?.status) {
            queryParams.append('status', params.status);
        }
        const queryString = queryParams.toString();
        const url = queryString ? `attendance/report?${queryString}` : 'attendance/report';
        return this.get(url);
    }
}

// Create and export a singleton instance
const apiClient = new Api(process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080');

export default apiClient;
export { Api };
