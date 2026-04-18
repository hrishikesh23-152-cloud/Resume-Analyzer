import axios from "axios"


const api = axios.create({
    baseURL: "https://resume-analyzer-backend-3z1r.onrender.com",
    withCredentials: true
})

export async function register({ name, email, password }) {

    try {
        const response = await api.post('/api/auth/register', {
            name, email, password
        })
        console.log(response.data.user)
        return response.data


    } catch (err) {

        console.log(err.message)

    }

}

export async function login({ email, password }) {

    try {

        const response = await api.post("/api/auth/login", {
            email, password
        })
        // console.log(response.data.user)
        return response.data

    } catch (err) {
        console.log(err)
    }

}

export async function logout() {
    try {

        const response = await api.get("/api/auth/logout")

        return response.data

    } catch (err) {
        console.log(err)
    }
}

export async function getMe() {

    try {

        const response = await api.get("/api/auth/get-me")

        return response.data

    } catch (err) {
        console.log(err)
    }

}
