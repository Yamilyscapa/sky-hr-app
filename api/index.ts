class Api {
    private baseUrl: string;

    constructor() {
        this.baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

        if (!this.baseUrl) {
            throw new Error('API URL is not set');
        }
    }

    private async getAuthHeaders(): Promise<HeadersInit> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        const { authClient } = await import('@/lib/auth-client');
        const cookies = authClient.getCookie();

        if (cookies) {
            headers['Cookie'] = cookies;
        }

        return headers;
    }

    public async get(url: string) {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${this.baseUrl}/${url}`, {
            headers,
            credentials: "omit"
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
            credentials: "omit",
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
            credentials: "omit",
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }
        return response.json();
    }

    public async postFormData(url: string, formData: FormData) {
        const { authClient } = await import('@/lib/auth-client');
        const cookies = authClient.getCookie();

        const headers: HeadersInit = {};
        if (cookies) {
            headers['Cookie'] = cookies;
        }

        const response = await fetch(`${this.baseUrl}/${url}`, {
            method: 'POST',
            headers,
            credentials: "omit",
            body: formData,
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }
        return response.json();
    }

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
        return this.postFormData('attendance/check-out', formData)
    }

    /**
     * Register the user's biometric face data for future verification
     * @param imageUri - Local URI of the captured face image
     * @returns API response with registration status
     */
    public async registerFace(imageUri: string) {
        if (!imageUri) {
            throw new Error('No se recibió una imagen válida para registrar.');
        }

        const formData = new FormData();
        const fileName = this.getFileNameFromUri(imageUri);
        const mimeType = this.getMimeTypeFromFileName(fileName);

        formData.append('image', {
            uri: imageUri,
            name: fileName,
            type: mimeType,
        } as unknown as Blob);

        return this.postFormData('biometrics/register', formData);
    }

    /**
     * Fetch an invitation by organization and email to let users confirm it was sent
     * @param organizationId - ID provided by the manager
     * @param email - Email address tied to the current session
     */
    public async getInvitationStatus(organizationId: string, email: string) {
        if (!organizationId || !email) {
            throw new Error('Se requieren el ID de la organización y el correo para consultar la invitación.');
        }
        const query = new URLSearchParams({ email });
        return this.get(`organizations/${organizationId}/invitations/by-email?${query.toString()}`);
    }

    /**
     * Public invitation lookup that only needs the email, used before joining an organization
     * @param email - Email tied to the pending invitation
     */
    public async getPublicInvitationStatus(email: string) {
        if (!email) {
            throw new Error('Ingresa un correo válido para consultar la invitación.');
        }
        const query = new URLSearchParams({ email });
        return this.get(`organizations/invitations/status?${query.toString()}`);
    }

    private getFileNameFromUri(uri: string) {
        const segments = uri.split('/');
        const lastSegment = segments[segments.length - 1];
        if (lastSegment && lastSegment.includes('.')) {
            return lastSegment.split('?')[0];
        }
        return `face-${Date.now()}.jpg`;
    }

    private getMimeTypeFromFileName(fileName: string) {
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'png':
                return 'image/png';
            case 'webp':
                return 'image/webp';
            case 'heic':
                return 'image/heic';
            case 'heif':
                return 'image/heif';
            case 'gif':
                return 'image/gif';
            case 'jpg':
            case 'jpeg':
            default:
                return 'image/jpeg';
        }
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

    /**
     * Get today's attendance event for a user
     * Organization is automatically determined from the authenticated session context
     * @param userId - User ID to get attendance for
     * @returns Response object with status and data. Status 404 is valid (no event today).
     */
    public async getTodayAttendanceEvent(userId: string): Promise<{ status: number; data: any }> {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${this.baseUrl}/attendance/today/${userId}`, {
            headers,
            credentials: "omit",
        });
        
        // 404 is a valid state (no attendance event today)
        if (response.status === 404) {
            return { status: 404, data: null };
        }
        
        // For other non-ok responses, throw an error
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP ${response.status}: ${text}`);
        }
        
        const data = await response.json();
        return { status: response.status, data };
    }
}

// Create and export a singleton instance
const apiClient = new Api();

export default apiClient;
export { Api };
