import React, { useRef, useState } from 'react'
import { useNavigate } from "react-router-dom"
import InputItem from "../layouts/InputItem"
import { Button, Form } from 'react-bootstrap'
import Loading from '../layouts/Loading'
import API, { endpoints } from '../configs/API'
import ErrorAlert from '../layouts/ErrorAlert'

function Register() {
    const [user, setUser] = useState({
        "username": "",
        "password": "",
        "email": "",
        "first_name": "",
        "last_name": "",
        "user_role": ""
    })
    const [confirmPassword, setConfirmPassword] = useState('')
    const [CMND, setCMND] = useState("")
    const avatar = useRef()
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState("")
    const nav = useNavigate()

    const register = (evt) => {
        evt.preventDefault()

        const process = async () => {
            
            try {

                let formUser = new FormData()
                formUser.append("username", user.username)
                formUser.append("password", user.password)
                formUser.append("email", user.email)
                formUser.append("first_name", user.first_name)
                formUser.append("last_name", user.last_name)
                formUser.append("user_role", user.user_role)

                let res = await API.post(endpoints['users'], formUser)

                const userNew = res.data.id;

                if (user.user_role === 'SHIPPER_ROLE') {
                    let formShipper = new FormData()
                    formShipper.append("CMND", CMND)
                    formShipper.append("user", userNew)


                    if (avatar.current.files.length > 0)
                        formShipper.append("avatar", avatar.current.files[0])

                    await API.post(endpoints['shippers'], formShipper, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    })

                } else {
                    let formCustomer = new FormData()
                    formCustomer.append("user", userNew)

                    if (avatar.current.files.length > 0)
                        formCustomer.append("avatar", avatar.current.files[0])

                    await API.post(endpoints['customers'], formCustomer, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    })
                }

                if (res.status === 201)
                    nav("/login")
                else
                    setErr("Hệ thống đang có lỗi! Vui lòng quay lại sau!")
            } catch (ex) {
                let msg = ""
                for (let e of Object.values(ex.response.data))
                    msg += `${e} `

                setErr(msg)
            } finally {
                setLoading(false)
            }
        }

        if (user.username === "" || user.password === "")
            setErr("Username và password không được rỗng!")
        else if (user.password !== confirmPassword)
            setErr("Mật khẩu không khớp!")
        else {
            setLoading(true)
            process()
        }
    }

    const setValue = e => {
        const { name, value } = e.target
        setUser(current => ({ ...current, [name]: value }))
    }

    const hideLabel = (event) => {
        setValue(event);
        if (event.target.value === "SHIPPER_ROLE") {
            document.getElementById("CMND/CCCD").hidden = false;
        } else {
            document.getElementById("CMND/CCCD").hidden = true;
        }
    }

    return (
        <>
            <section className="vh-100 mt-5">
                <div className="container-fluid h-custom">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
                            <h1 className="text-center my-1 mb-5">ĐĂNG KÝ NGƯỜI DÙNG</h1>

                            {err ? <ErrorAlert err={err} /> : ""}

                            <Form onSubmit={register}>
                                <InputItem label="Tên người dùng" name="first_name"
                                    value={user.first_name} type="text"
                                    setValue={setValue} />

                                <InputItem label="Họ và chữ lót" name="last_name"
                                    value={user.last_name} type="text"
                                    setValue={setValue} />

                                <InputItem label="Email" name="email"
                                    value={user.email} type="text"
                                    setValue={setValue} />

                                <InputItem label="Tên đăng nhập" name="username"
                                    value={user.username} type="text"
                                    setValue={setValue} />

                                <InputItem label="Mật khẩu" name="password"
                                    value={user.password} type="password"
                                    setValue={setValue} />

                                <InputItem label="Xác nhận mật khẩu" value={confirmPassword} type="password"
                                    setValue={e => setConfirmPassword(e.target.value)} />
                                <Form.Label>Chọn vai trò</Form.Label>
                                <Form.Select onChange={hideLabel} name='user_role' value={user.user_role} className='mb-3' aria-label="Default select example">
                                    <option>Open this select menu</option>
                                    <option value="SHIPPER_ROLE">Shipper</option>
                                    <option value="CUSTOMER_ROLE">Customer</option>
                                </Form.Select>
                                <Form.Group className="mb-3" id="CMND/CCCD" hidden={true}>
                                    <Form.Label>CMND/CCCD</Form.Label>
                                    <Form.Control type="text" value={CMND} onChange={e => setCMND(e.target.value)} />
                                </Form.Group>
                                <InputItem label="Ảnh đại diện" type="file" ref={avatar} name="avatar" />

                                {loading ? <Loading /> : <Button type="submit" className='w-100' variant="dark">Đăng ký</Button>}
                            </Form>
                        </div>
                    </div>
                </div>
            </section >
        </>
    )
}

export default Register