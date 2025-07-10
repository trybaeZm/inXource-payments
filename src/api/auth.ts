import axios from 'axios'

class Auth{
    async signUp(){
        const res = await axios.post('/api/auth/signup');
        return res;
    }

    async login(){
        const res = await axios.post('/api/auth/login');
        return res;
    }

    async getDetails(){
        const res = await axios.post('/api/auth/details');
        return res;
    }
}

export default new Auth;