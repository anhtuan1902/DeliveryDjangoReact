import { useContext, useState } from 'react'
import { Button, Form } from "react-bootstrap"
import cookies from "react-cookies"
import { Link, Navigate } from "react-router-dom"
import API, { authAPI, endpoints } from "../configs/API"
import { UserContext } from "../configs/MyContext"
import Loading from "../layouts/Loading"
import ErrorAlert from "../layouts/ErrorAlert"
import InputItem from "../layouts/InputItem"


const Login = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState()
    const [user, dispatch] = useContext(UserContext)


    const login = (evt) => {
        evt.preventDefault()

        const process = async () => {
            try {
                const info = await API.get(endpoints['oauth2-info']);
                let res = await API.post(endpoints['login'], {
                    username: username,
                    password: password,
                    client_id: info.data.client_id,
                    client_secret: info.data.client_secret,
                    grant_type: 'password'
                })

                cookies.save('access-token', res.data.access_token)

                let user = await authAPI().get(endpoints['current-user'])

                cookies.save('current-user', user.data)

                dispatch({
                    "type": "login", 
                    "payload": user.data
                })
            } catch (ex) {
                console.error(ex)
                setErr('Username hoặc Password không hợp lệ!')
            } finally {
                setLoading(false)
            }
        }

        if (username === "" || username === undefined || password === "" || password === undefined)
            setErr("username hoac password không được rỗng!")
        else {
            setLoading(true)
            process()
        }
    }

    if (user !== null)
        return <Navigate to="/" />

    return (
        <>
            <section className="vh-100 mt-5">
                <div className="container-fluid h-custom">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
                            <h1 className="text-center my-5">ĐĂNG NHẬP NGƯỜI DÙNG</h1>

                            {err ? <ErrorAlert err={err} /> : ""}


                            <Form onSubmit={login}>
                                <InputItem label="Tên đăng nhập" type="text" value={username} setValue={e => setUsername(e.target.value)} />
                                <InputItem label="Mật khẩu" type="password" value={password} setValue={e => setPassword(e.target.value)} />

                                {loading ? <Loading /> : <Button variant="dark" className='w-100' type="submit">Đăng nhập</Button>}
                            </Form>
                            <div className="text-center text-lg-start mt-3">
                                <p className="small fw-bold mt-2 pt-1 mb-0">Don't have an account? <Link to="/Register"
                                    className="link-danger">Register</Link></p>
                            </div>
                        </div>
                    </div>
                </div>
            </section >
        </>

    )
}

export default Login