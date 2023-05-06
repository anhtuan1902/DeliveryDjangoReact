import React, { useContext, useEffect, useState } from 'react'
import Loading from '../layouts/Loading'
import Sidebar from '../layouts/Sidebar'
import Header from '../layouts/Header'
import { useParams } from 'react-router-dom'
import { UserContext } from '../configs/MyContext'
import { endpoints } from '../configs/API'
import API from '../configs/API'
import { authAPI } from '../configs/API'
import { Badge, Button, Dropdown, Form, InputGroup } from 'react-bootstrap'
import { FcRating } from "react-icons/fc";
import Rating from "react-rating"
import { VscEllipsis } from "react-icons/vsc";

function ShipperDetail() {
    const [loading, setLoading] = useState(false)
    const [toggle, settoggle] = useState(true)
    const { shipperId } = useParams()
    const [user,] = useContext(UserContext)
    const [customer, setCustomer] = useState([])
    const [shipper, setShipper] = useState([])
    const [userinfo, setUserInfo] = useState([])
    const [rates, setRates] = useState([])
    const [content, setContent] = useState()
    const [comments, setComments] = useState([])
    const [info, setInfo] = useState([])
    const [status, setStatus] = useState('')

    const Toggle = () => {
        settoggle(!toggle);
    }

    useEffect(() => {
        const loadingShipper = async () => {
            try {
                setLoading(true)
                let res = await API.get(endpoints['action-shippers'](shipperId))
                setShipper(res.data)
            } catch (err) {
                alert(err)
            } finally {
                setLoading(false)
            }
        }
        loadingShipper()
    }, [shipperId])

    useEffect(() => {
        const loadUserInfo = async () => {
            setLoading(true)
            try {
                if (user.user_role === 'SHIPPER_ROLE') {
                    let res = await authAPI().get(`${endpoints['shippers']}?userid=${user.id}`)
                    setInfo(res.data[0])
                } else if (user.user_role === 'CUSTOMER_ROLE') {
                    let res = await authAPI().get(`${endpoints['customers']}?userid=${user.id}`)
                    setInfo(res.data[0])
                } else {
                    let res = await authAPI().get(`${endpoints['admins']}?userid=${user.id}`)
                    setInfo(res.data[0])
                }
            } catch (ex) {
                console.error(ex)
            } finally {
                setLoading(false)
            }
        }

        loadUserInfo()
    }, [user.id, user.user_role])

    useEffect(() => {
        const loadingUserInfo = async () => {
            try {
                setLoading(true)
                let res = await authAPI().get(endpoints['users'])
                setUserInfo(res.data)
            } catch (err) {
                alert(err)
            } finally {
                setLoading(false)
            }
        }
        loadingUserInfo()
    }, [])

    useEffect(() => {
        const loadingCustomer = async () => {
            try {
                setLoading(true)
                let res = await authAPI().get(endpoints['customers'])
                setCustomer(res.data)
            } catch (err) {
                alert(err)
            } finally {
                setLoading(false)
            }
        }
        loadingCustomer()
    }, [])

    useEffect(() => {
        const loadingComments = async () => {
            try {
                setLoading(true)
                let res = await authAPI().get(endpoints['get-comment-by-shipper'](shipperId))
                setComments(res.data)
            } catch (err) {
                alert(err)
            } finally {
                setLoading(false)
            }
        }
        loadingComments()
    }, [shipperId, status])

    useEffect(() => {
        const loadingRate = async () => {
            try {
                setLoading(true)
                let res = await authAPI().get(endpoints['get-rate-by-shipper'](shipperId))
                setRates(res.data)
            } catch (err) {
                alert(err)
            } finally {
                setLoading(false)
            }
        }
        loadingRate()

    }, [status, shipperId])

    const saveRating = (r) => {
        const process = async () => {
            if (window.confirm("Bạn có muốn lưu đánh giá của mình?") === true) {
                setStatus('')
                try {
                    setLoading(true)
                    let form = new FormData()
                    form.append('rate', r)
                    let res = await authAPI().post(endpoints['rate'](shipperId), form)
                    setStatus(res.status)
                } catch (ex) {
                    console.error(ex)
                } finally {
                    setLoading(false)
                }
            }

        }

        process()
    }

    const addComment = (evt) => {
        evt.preventDefault()

        const process = async () => {

            setStatus('')
            try {
                setLoading(true)
                let form = new FormData()
                form.append('content', content)
                let res = await authAPI().post(endpoints['comment'](shipperId), form)
                setStatus(res.status)
            } catch (ex) {
                console.error(ex)
            } finally {
                setContent('')
                setLoading(false)
            }

        }

        process()
    }

    const deleteComment = async (id) => {
        setStatus('')
        if (window.confirm("Bạn có chắc chắn xóa?") === true) {
            try {
                setLoading(true)
                let form = new FormData()
                form.append('active', false)
                let res = await authAPI().patch(endpoints['action-comment'](id), form)
                setStatus(res.status)
            } catch (error) {
                alert(error);
            } finally {
                setLoading(false)
            }
        }
    }

    let avgRate = rates.reduce((acc, rate) => acc = acc + rate.rate, 0) / rates.length
    let r = rates.filter(r => r.creator === info.id).map(r => { return r.rate })

    return (
        <div className='container-fluid bg-light min-vh-100' style={{backgroundColor: "#E0EAFC"}}>
            {loading ? <Loading /> :
                <>
                    <div className='row'>
                        {toggle && <div className='col-4 col-md-2 vh-100 position-fixed bg-white'>
                            <Sidebar />
                        </div>}
                        {toggle && <div className='col-4 col-md-2'></div>}
                        <div className='col vh-100' style={{backgroundColor: "#E0EAFC", paddingLeft: 0, paddingRight: 0}}>
                            <div className='px-3' style={{backgroundColor: "#E0EAFC"}}>
                                <Header Toggle={Toggle} />
                                <div className="d-flex align-items-center flex-column">
                                    <h1 className="text-center text-danger m-4">Chi tiết người giao hàng</h1>
                                    <div className="bg-white p-3 my-4 rounded border shadow" style={{ width: "80%" }}>
                                        <div className="row m-3">
                                            <div className="col">
                                                <img className="rounded-circle" src={shipper.avatar} alt={shipper.user} style={{ height: "400px", width: "90%" }} />
                                            </div>
                                            <div className="col">
                                                <h4 className="text-uppercase text-black-50 my-3">
                                                    Shipper
                                                </h4>
                                                {userinfo.filter(u => u.id === shipper.user).map(u => <h1 className='display-5'>{u.last_name} {u.first_name}</h1>)}
                                                <h4><span className="badge bg-secondary my-4">CCCD: {shipper.CMND}</span></h4>
                                                {userinfo.filter(u => u.id === shipper.user).map(u => <h4><span className="badge bg-secondary me-2">Email: {u.email}</span></h4>)}
                                                <h4 className="mt-4"><Badge bg="secondary">{avgRate} <FcRating className='fs-3' /></Badge></h4>
                                                {user.user_role === 'CUSTOMER_ROLE' ? <Rating className='fs-3 mt-3' emptySymbol="fa fa-star-o fa-2x" fullSymbol="fa fa-star fa-2x" onClick={saveRating} initialRating={r ? r : 0} /> : <></>}
                                            </div>
                                        </div>
                                        <hr className='my-5'/>
                                        <nav className="mx-2">
                                            <div className="nav nav-tabs" id="nav-tab" role="tablist">
                                                <button className="nav-link active" id="nav-home-tab" data-bs-toggle="tab" data-bs-target="#nav-home" type="button" role="tab" aria-controls="nav-home" aria-selected="true">Đánh giá</button>
                                            </div>
                                        </nav>
                                        <div className="m-4 tab-content" id="nav-tabContent">
                                            <div className="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab" tabindex="0">
                                                {user.user_role === 'CUSTOMER_ROLE' ?
                                                    <>
                                                        <Form onSubmit={addComment} className="d-flex mt-3 my-1">
                                                            <div>
                                                                <img
                                                                    src={info.avatar}
                                                                    alt="avatar"
                                                                    className="rounded-circle me-2"
                                                                    style={{ width: "38px", height: "38px", objectFit: "cover" }}
                                                                />
                                                            </div>
                                                            <InputGroup className="mb-3">
                                                                <Form.Control value={content} onChange={e => setContent(e.target.value)} placeholder="Nội dung bình luận..." />
                                                                {loading ? <Loading /> : <Button variant="outline-secondary" type="submit">Bình luận</Button>}
                                                            </InputGroup>
                                                        </Form>
                                                        <hr />
                                                    </>
                                                    : <></>}

                                                {comments.map(c => {
                                                    return (
                                                        <div className="accordion-body" key={c.id}>
                                                            <div className="d-flex align-items-center my-1">
                                                                {customer.filter(cus => cus.id === c.creator).map(cus => <img src={cus.avatar}
                                                                    alt="avatar" className="rounded-circle me-2"
                                                                    style={{ width: "38px", height: "38px", objectFit: "cover" }} />)}
                                                                <div className="p-3 rounded comment__input w-100">
                                                                    {customer.filter(cus => cus.id === c.creator).map(cus => userinfo.filter(u => u.id === cus.user).map(u => <p className="fw-bold m-0">{u.first_name} {u.last_name}</p>))}
                                                                    <div className="row">
                                                                        <div className="col-11">
                                                                            <p className="m-0 fs-7 bg-gray p-2 rounded">
                                                                                {c.content}
                                                                            </p>
                                                                            <p className="card-text"><small className="text-muted">{c.updated_date}</small></p>
                                                                        </div>
                                                                        <div className="col">
                                                                            {c.creator === info.id || user.user_role === 'ADMIN_ROLE' ?
                                                                                <Dropdown>
                                                                                    <Dropdown.Toggle variant="white" >
                                                                                        <VscEllipsis className='fs-5' />
                                                                                    </Dropdown.Toggle>
                                                                                    <Dropdown.Menu>
                                                                                        <Dropdown.Item className="d-flex justify-content-around" onClick={() => deleteComment(c.id)}>Xóa</Dropdown.Item>
                                                                                    </Dropdown.Menu>
                                                                                </Dropdown> : <></>
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            }
        </div>
    )
}

export default ShipperDetail