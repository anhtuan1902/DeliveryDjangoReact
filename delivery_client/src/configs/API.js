import axios from "axios"
import cookies from "react-cookies"

export const endpoints = {
    'login': '/o/token/',
    'current-user': '/users/current-user/',
    'users': '/users/',
    'customers': '/customers/',
    'shippers': '/shippers/',
    'action-shippers': (id) => `/shippers/${id}/`,
    'get-rate-by-shipper': (id) => `/shippers/${id}/get-rate/`,
    'rate': (id) => `/shippers/${id}/rating/`, 
    'get-comment-by-shipper': (id) => `/shippers/${id}/get-comment/`,
    'comment': (id) => `/shippers/${id}/comments/`,
    'rating': '/rate/',
    "oauth2-info": "/oauth2-info/",
    'post': '/posts/',
    'action-post': (id) => `/posts/${id}/`,
    'auctions': '/auctions/',
    'add-auction': (id) => `/posts/${id}/auctions/`,
    'action-auction':(id) => `/auctions/${id}/`,
    "admins": '/admins/',
    'discounts': '/discounts/',
    'action-discount': (id) => `/discounts/${id}/`,
    'action-comment':(id) => `/comments/${id}/`,
    'orders': '/orders/',
    'add-order': (id) => `/auctions/${id}/orders/`,
    'action-order': (id) => `/orders/${id}/`
}

// "http://anhtuan190201.pythonanywhere.com/"
export const authAPI = () => axios.create({
    baseURL: "http://127.0.0.1:8000/",
    headers: {
        "Authorization": `Bearer ${cookies.load("access-token")}`
    }
})

export default axios.create({
    baseURL: "http://127.0.0.1:8000/"
})