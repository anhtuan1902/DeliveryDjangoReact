import React, { useContext, useEffect, useState } from 'react'
import Sidebar from '../layouts/Sidebar';
import Header from '../layouts/Header';
import API, { authAPI, endpoints } from '../configs/API';
import { VscCheck, VscChromeClose } from "react-icons/vsc";
import { UserContext } from '../configs/MyContext';
import { Button, Table } from 'react-bootstrap';

function ShipperAdmin() {
    const [loading, setLoading] = useState(false)
    const [toggle, settoggle] = useState(true)
    const [user,] = useContext(UserContext)
    const [listShipper, setListShipper] = useState([])
    const [listUser, setListUser] = useState([])
    const [status, setStatus] = useState('')


    useEffect(() => {
        const loadListShipper = async () => {
            try {
                let res = await API.get(endpoints['shippers'])
                setListShipper(res.data)
            } catch (ex) {
                alert(ex)
            } finally {
                setLoading(false)
            }
        }
        loadListShipper()
    }, [status])

    useEffect(() => {
        const loadingUsers = async () => {
            setLoading(true)
            try {
                let res = await authAPI().get(endpoints['users'])
                setListUser(res.data)
            } catch (ex) {
                console.log(ex)
            } finally {
                setLoading(false)
            }
        }
        loadingUsers()
    }, [status])

    const verify = async (id) => {
        setStatus('')
        if (window.confirm("Bạn chắc chắn xác nhận?") === true) {
            try {
                setLoading(true)
                let form = new FormData()
                form.append('already_verify', true)
                let res = await authAPI().patch(endpoints['action-shippers'](id), form)
                setStatus(res.status)
            } catch (error) {
                setStatus(error)
            } finally {
                setLoading(false)
            }
        }
    }

    const unVerify = async (id) => {
        setStatus('')
        if (window.confirm("Bạn chắc chắn xác nhận?") === true) {
            try {
                setLoading(true)
                let form = new FormData()
                form.append('already_verify', false)
                let res = await authAPI().patch(endpoints['action-shippers'](id), form)
                setStatus(res.status)
            } catch (err) {
                setStatus(err)
            } finally {
                setLoading(false)
            }
        }
    }


    const Toggle = () => {
        settoggle(!toggle);
    }

    const ShowHome = () => {
        return (<>
            <div className='row'>
                {toggle && <div className='col-4 col-md-2 vh-100 position-fixed bg-white'>
                    <Sidebar />
                </div>}
                {toggle && <div className='col-4 col-md-2'></div>}
                <div className='col vh-100' style={{backgroundColor: "#E0EAFC"}}>
                    <div className='px-3'>
                        <Header Toggle={Toggle} />
                        <div className="d-flex align-items-center flex-column">
                            <h1 className="text-danger text-center">QUẢN TRỊ NHÂN VIÊN GIAO HÀNG</h1>
                            <div className="bg-white p-4 rounded shadow mt-4" style={{ width: "70%" }}>
                                <h3 class="text-center pb-4">Nhân viên giao hàng chưa được xác nhận</h3>
                                <Table striped bordered hover>
                                    <thead className='text-center'>
                                        <tr>
                                            <th>Id</th>
                                            <th>Tên nhân viên</th>
                                            <th>Hình ảnh</th>
                                            <th>CMND</th>
                                            <th>Verify</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody className='text-center'>
                                        {listShipper.filter(s => s.already_verify === false).map(s =>
                                            <tr key={s.id}>
                                                <td className='pt-3'>{s.id}</td>
                                                {listUser.filter(u => u.id === s.user).map(u => <td className='pt-3'>{u.last_name} {u.first_name}</td>)}
                                                <td>
                                                    <img src={s.avatar} alt="avatar" class="rounded-circle me-2" style={{ width: "50px", height: "50px", objectFit: "cover" }} />
                                                </td>
                                                <td className='pt-3'>{s.CMND}</td>
                                                <td className='pt-3'>{s.already_verify ? <VscCheck /> : <VscChromeClose />}</td>
                                                <td className='pt-3'>
                                                    <Button variant="outline-success" onClick={() => verify(s.id)} >Xác nhận</Button>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                            <div className="bg-white p-4 rounded shadow mt-4" style={{ width: "70%" }}>
                                <h3 class="text-center pb-4">Danh sách tất cả nhân viên giao hàng</h3>
                                <Table striped bordered hover>
                                    <thead className='text-center'>
                                        <tr>
                                            <th>Id</th>
                                            <th>Tên nhân viên</th>
                                            <th>Hình ảnh</th>
                                            <th>CMND</th>
                                            <th>Verify</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody className='text-center'>
                                        {listShipper.map(s =>
                                            <tr key={s.id}>
                                                <td className='pt-3'>{s.id}</td>
                                                {listUser.filter(u => u.id === s.user).map(u => <td className='pt-3'>{u.last_name} {u.first_name}</td>)}
                                                <td>
                                                    <img src={s.avatar} alt="avatar" class="rounded-circle me-2" style={{ width: "50px", height: "50px", objectFit: "cover" }} />
                                                </td>
                                                <td className='pt-3'>{s.CMND}</td>
                                                <td className='pt-3'>{s.already_verify ? <VscCheck /> : <VscChromeClose />}</td>
                                                <td className='pt-3'>
                                                    {s.already_verify ? <Button variant="outline-danger" onClick={() => unVerify(s.id)} >Bỏ xác nhận</Button> : <Button variant="outline-success" onClick={() => verify(s.id)} >Xác nhận</Button>}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>);
    }

    const Authenticated = () => {
        return (
            <h1 className='text-center'>Ban khong co quyen truy cap o trang nay</h1>
        )
    }

    return (
        <div className='container-fluid bg-light min-vh-100'>
            {user.user_role === 'ADMIN_ROLE' && !loading ? <ShowHome />  : <Authenticated />}
        </div>
    )
}

export default ShipperAdmin