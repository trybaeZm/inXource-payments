import axios from 'axios'

// Define or import ContactSubmissionBody and ContactSubmissionResponse
export interface ContactSubmissionBody {
    // Add appropriate fields here, for example:
    name: string;
    email: string;
    message: string;
}

export interface ContactSubmissionResponse {
    // Add appropriate fields here, for example:
    success: boolean;
    message: string;
}

class Contact{
    async contactSubmission(body: ContactSubmissionBody): Promise<ContactSubmissionResponse> {
        const res = await axios.post<ContactSubmissionResponse>('https://paymentbackend.inxource.com/api/contact/send', body);
        return res.data;
    }
}

export default new Contact;