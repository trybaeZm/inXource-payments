import axios from 'axios'

class Contact{
    async contactSubmission(body){
        const res = await axios.post('http://localhost:4455/api/contact/send', body);
        return res;
    }
}

export default new Contact;