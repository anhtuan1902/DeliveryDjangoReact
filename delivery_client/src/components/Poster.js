import React, { useContext, useEffect, useRef, useState } from 'react'
import { Button, Form, Modal, FloatingLabel, Collapse, Dropdown, InputGroup } from 'react-bootstrap'
import API, { authAPI, endpoints } from '../configs/API'
import { UserContext } from '../configs/MyContext'
import Loading from '../layouts/Loading'
import { VscEllipsis, VscIndent } from "react-icons/vsc";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"

const Poster = () => {
    const [show, setShow] = useState(false);
    const [posters, setPosters] = useState([]);
    const [listUsers, setListUsers] = useState([]);
    const [user,] = useContext(UserContext);
    const [infoUser, setInfoUser] = useState([]);
    const [listCustomer, setListCustomer] = useState([]);
    const [listShipper, setListShipper] = useState([]);
    const [loading, setLoading] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [open, setOpen] = useState(false);
    const [auctions, setAuctions] = useState([]);
    const [content, setContent] = useState("");
    const [price, setPrice] = useState("");
    const [postId, setPostId] = useState();
    const product_img = useRef()
    const [post, setPost] = useState({
        "product_name": "",
        "from_address": "",
        "to_address": "",
        "description": "",
        "discount": null
    })
    const [status, setStatus] = useState('')

    const [discounts, setDiscounts] = useState([]);

    useEffect(() => {
        const loadListUsers = async () => {
            setLoading(true)
            try {
                let resUser = await authAPI().get(endpoints['users'])
                let resShippers = await API.get(endpoints['shippers'])
                let resCustomer = await authAPI().get(endpoints['customers'])
                setListUsers(resUser.data)
                setListCustomer(resCustomer.data)
                setListShipper(resShippers.data)
            } catch (ex) {
                console.error(ex)
            } finally {
                setLoading(false)
            }
        }


        loadListUsers()
    }, [])

    useEffect(() => {
        const loadListDiscounts = async () => {
            setLoading(true)
            try {
                let res = await authAPI().get(endpoints['discounts'])
                setDiscounts(res.data)
            } catch (ex) {
                console.error(ex)
            } finally {
                setLoading(false)
            }
        }
        loadListDiscounts()
    }, [])


    useEffect(() => {
        const loadPoster = async () => {
            setLoading(true)
            try {
                let res = await authAPI().get(endpoints['post'])
                setPosters(res.data)
            } catch (ex) {
                console.error(ex)
            } finally {
                setLoading(false)
            }
        }

        loadPoster()
    }, [status])

    useEffect(() => {
        const loadUserInfo = async () => {
            setLoading(true)
            try {
                if (user.user_role === 'SHIPPER_ROLE') {
                    let res = await API.get(`${endpoints['shippers']}?userid=${user.id}`)
                    setInfoUser(res.data[0])
                } else if (user.user_role === 'CUSTOMER_ROLE') {
                    let res = await authAPI().get(`${endpoints['customers']}?userid=${user.id}`)
                    setInfoUser(res.data[0])
                } else {
                    let res = await authAPI().get(`${endpoints['admins']}?userid=${user.id}`)
                    setInfoUser(res.data[0])
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
        const loadAuction = async () => {
            setLoading(true)
            try {
                let res = await authAPI().get(endpoints['auctions'])
                setAuctions(res.data)
            } catch (ex) {
                console.log(ex)
            } finally {
                setLoading(false)
            }
        }
        loadAuction()
    }, [status])


    const addAuction = (evt) => {
        evt.preventDefault()

        const process = async () => {
            setStatus('')
            try {
                let form = new FormData()
                form.append('content', content)
                form.append('price', price)
                let res = await authAPI().post(endpoints['add-auction'](postId), form)
                setStatus(res.status)
            } catch (ex) {
                alert("Bạn đã đấu giá rồi!!!")
            } finally {
                setContent('')
                setPrice('')
                setLoading(false)
            }

        }

        setLoading(true)
        process()
    }

    const addPost = (evt) => {
        evt.preventDefault()
        const process = async () => {
            try {
                let form = new FormData()
                form.append('product_name', post.product_name)
                form.append('from_address', post.from_address)
                form.append('to_address', post.to_address)
                form.append('description', post.description)
                form.append('discount', post.discount)
                form.append('active', true)
                if (product_img.current.files.length > 0)
                    form.append("product_img", product_img.current.files[0])
                form.append('customer', infoUser.id)
                let res = await authAPI().post(endpoints['post'], form)
                setPosters(current => ([res.data, ...current]))
                post.product_name = ''
                post.from_address = ''
                post.to_address = ''
                post.description = ''
                post.discount = ''
            } catch (ex) {
                alert(ex)
            } finally {
                setLoading(false)
            }

        }

        setLoading(true)
        process()
    }

    const setValue = (e) => {
        const { name, value } = e.target
        setPost(current => ({ ...current, [name]: value }))
    }

    const deletePost = async (id) => {
        setStatus('')
        if (window.confirm("Bạn có chắc chắn xóa?") === true) {
            try {
                setLoading(true)
                let form = new FormData()
                form.append('active', false)
                let res = await authAPI().patch(endpoints['action-post'](id), form)
                setStatus(res.status)
            } catch (error) {
                alert(error);
            } finally {
                setLoading(false)
            }
        }
    }

    const deleteAuction = async (id) => {
        setStatus('')
        if (window.confirm("Bạn có chắc chắn xóa?") === true) {
            try {
                setLoading(true)
                let form = new FormData()
                form.append('active', false)
                let res = await authAPI().patch(endpoints['action-auction'](id), form)
                setStatus(res.status)
            } catch (error) {
                alert(error);
            } finally {
                setLoading(false)
            }
        }
    }

    const addOrders = (p, a) => {

        const process = async () => {
            setStatus('')

            try {
                let formOrder = new FormData()
                formOrder.append('delivery', a.delivery)
                formOrder.append('customer', p.customer)
                let amount = a.price - (a.price * discounts.filter(d => d.id === p.discount).map(d => { return d.discount_percent })) / 100
                formOrder.append('amount', amount)
                let res = await authAPI().post(endpoints['add-order'](a.id), formOrder)
                let formAuction = new FormData()
                formAuction.append('had_accept', true)
                await authAPI().patch(endpoints['action-auction'](a.id), formAuction)
                let formPost = new FormData()
                formPost.append('active', false)
                await authAPI().patch(endpoints['action-post'](p.id), formPost)
                document.getElementById(`close${a.id}`).click()
                setStatus(res.status)
            } catch (ex) {
                alert(ex)
            } finally {
                setLoading(false)
            }

        }

        setLoading(true)
        process()
    }

    return (
        <>
            {user.user_role === 'CUSTOMER_ROLE' ? <h2 className='py-3 text-danger'>Bạn muốn giao những gì</h2> : <h2 className='py-3 text-danger'>Những món hàng cần bạn giao</h2>}
            {user.user_role === 'CUSTOMER_ROLE' ?
                <div className="bg-white p-3 mt-3 rounded border shadow" style={{ width: "80%" }} >
                    <div className="d-flex" type="button">
                        <div className="p-1">
                            <img src={infoUser.avatar} alt="avatar"
                                className="rounded-circle me-2"
                                style={{ width: "38px", height: "38px", objectFit: 'cover' }} />
                        </div>
                        <input type='text' variant="gray" className="form-control rounded-pill border-0 d-flex" onClick={handleShow} placeholder=' Bạn muốn đăng gì ngay bây giờ?' />
                    </div>

                    <Modal show={show} onHide={handleClose}>
                        <Form onSubmit={addPost}>
                            <Modal.Header closeButton>
                                <Modal.Title>Tạo bài đăng</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <div className="my-1 p-1">
                                    <div className="d-flex flex-column">
                                        <div className="d-flex align-items-center">
                                            <div className="p-2">
                                                <img src={infoUser.avatar}
                                                    alt="avatar"
                                                    className="rounded-circle"
                                                    style={{ width: "38px", height: "38px", objectFit: "cover" }} />
                                            </div>
                                            <div>
                                                <p className="m-0 fw-bold">{user.first_name} {user.last_name}</p>
                                            </div>
                                        </div>

                                        <Form.Group className="my-3">
                                            <FloatingLabel
                                                controlId="floatingInput"
                                                label="Tên sản phẩm"
                                                className="mb-3"
                                            >
                                                <Form.Control type="text" placeholder="Tên sản phẩm" name='product_name' onChange={setValue} value={post.product_name} />
                                            </FloatingLabel>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <FloatingLabel
                                                controlId="floatingInput"
                                                label="Địa chỉ nhận"
                                                className="mb-3"
                                            >
                                                <Form.Control type="text" placeholder="Địa chỉ nhận" name='from_address' value={post.from_address} onChange={setValue} />
                                            </FloatingLabel>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <FloatingLabel label="Địa chỉ đến" className="mb-3">
                                                <Form.Control type="text" placeholder="Địa chỉ đến" name='to_address' value={post.to_address} onChange={setValue} />
                                            </FloatingLabel>
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                            <Form.Select aria-label="Default select example" name='discount' value={post.discount} onChange={setValue} >
                                                <option>Chọn mã giảm giá</option>
                                                {discounts.map(d => <option key={d.id} value={d.id}>{d.discount_title} {d.discount_percent}%</option>)}
                                            </Form.Select>
                                        </Form.Group>
                                        <Form.Group controlId="formFile" className="mb-3">
                                            <Form.Label>Ảnh sản phẩm</Form.Label>
                                            <Form.Control type="file" ref={product_img} />
                                        </Form.Group>
                                        <Form.Group
                                            className="mb-3"
                                            controlId="exampleForm.ControlTextarea1"
                                        >
                                            <FloatingLabel controlId="floatingTextarea2" label="Chi tiết sản phẩm" >
                                                <Form.Control as="textarea" placeholder="Chi tiết sản phẩm" style={{ height: '100px' }} name='description' value={post.description} onChange={setValue} />
                                            </FloatingLabel>
                                        </Form.Group>

                                    </div>
                                </div>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleClose}>
                                    Trở lại
                                </Button>
                                <Button variant="outline-secondary" type='submit' onClick={handleClose}>
                                    Đăng bài
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>
                </div> : <></>}
            {posters.filter(p => p.active === true).map(p => {
                return (
                    <div className="bg-white p-4 rounded shadow my-5" key={p.id} style={{ width: "80%" }}>
                        <div className="d-flex justify-content-between">
                            <div className="d-flex">
                                {listCustomer.filter(c => c.id === p.customer).map(c => <img src={c.avatar} alt="avatar" className="rounded-circle me-2" style={{ width: "38px", height: "38px", objectFit: "cover" }} />)}
                                <div>

                                    {listCustomer.filter(c => c.id === p.customer).map(c => listUsers.filter(u => u.id === c.user).map(u => <p className="m-0 fw-bold">{u.last_name} {u.first_name}</p>))}

                                    <span className="text-muted fs-7">{p.updated_date}</span>
                                </div>
                            </div>
                            {infoUser.id === p.customer ?
                                <Dropdown>
                                    <Dropdown.Toggle variant="white" >
                                        <VscEllipsis className='fs-5' />
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item className="dropdown-item d-flex justify-content-around align-items-center fs-7" onClick={() => deletePost(p.id)}>Xóa</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown> : <></>
                            }

                        </div>
                        <div className="mt-4">
                            <div>
                                <p>{p.product_name}</p>
                                <p>Vận chuyển từ: {p.from_address} <VscIndent /> {p.to_address}</p>
                                {discounts.filter(d => d.id === p.discount).map(d => <p>Sẽ giảm giá: {d.discount_percent}%</p>)}
                                {p.description ? <p>{p.description}</p> : <p></p>}
                                <p>Các bạn hãy ra giá $$$ </p>
                                <img src={p.product_img} alt={p.product_name}
                                    className="img-fluid rounded align-items-center w-100" style={{ height: "600px" }} />
                            </div>
                            <div className="post__comment mt-3 position-relative">
                                <div className="accordion" id="accordionExample">
                                    <div className="accordion-item border-0">
                                        <hr />
                                        <div className="d-flex justify-content-around">
                                            <div className="dropdown-item rounded d-flex justify-content-center align-items-center pointer text-muted p-1"
                                                onClick={() => setOpen(!open)}
                                                aria-controls={"example-collapse-text" + p.id}
                                                aria-expanded={open}
                                            >
                                                <i className="fas fa-comment-alt me-3"></i>
                                                <p className="m-0">Đấu giá</p>
                                            </div>
                                        </div>
                                        <Collapse in={open}>
                                            <div id={"example-collapse-text" + p.id}>
                                                <hr />
                                                <div className="accordion-body">
                                                    {user.user_role !== 'SHIPPER_ROLE' ?
                                                        auctions.filter(a => a.post === p.id).map(a => {
                                                            return (
                                                                <div className="d-flex align-items-center my-1" key={a.id}>
                                                                    {listShipper.filter(s => s.id === a.delivery).map(s => <img src={s.avatar} alt="avatar" className="rounded-circle me-2"
                                                                        style={{ width: "38px", height: "38px", objectFit: "cover" }} />)}
                                                                    <div className="p-3 rounded comment__input w-100">
                                                                        {listShipper.filter(s => s.id === a.delivery).map(s => listUsers.filter(u => u.id === s.user).map(u => <p className="m-0 fw-bold">{u.last_name} {u.first_name}</p>))}
                                                                        <p className="m-0 fs-7 bg-gray p-2 rounded d-flex">
                                                                            {a.content}<br />
                                                                            Giá đưa ra: {a.price}
                                                                        </p>
                                                                    </div>
                                                                    {p.customer === infoUser.id ? <>
                                                                    
                                                                        <button type="button" class="btn mt-4 btn-secondary py-2" data-bs-toggle="modal" data-bs-target={`#exampleModal${a.id}`}>
                                                                            Chọn
                                                                        </button>
                                                                        <div class="modal fade" id={`exampleModal${a.id}`} tabindex={`-${a.id}`} aria-labelledby="exampleModalLabel" aria-hidden="true">
                                                                            <div class="modal-dialog">
                                                                                <div class="modal-content">
                                                                                    <div class="modal-header">
                                                                                        <h1 class="modal-title fs-5" id="exampleModalLabel">Thanh Toán</h1>
                                                                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                                                                    </div>
                                                                                    <div class="modal-body">
                                                                                        <PayPalScriptProvider options={{ "client-id": "AV_tj3MtCi-9oFzwmx4QnYo0pPOLBsmSsVUplLqr-psv9-u6sZ57XOVOuZqetAgDx5v-I5mC5cKiw4wH" }}>
                                                                                            <PayPalButtons
                                                                                                createOrder={(data, actions) => {
                                                                                                    return actions.order.create({
                                                                                                        purchase_units: [
                                                                                                            {
                                                                                                                amount: {
                                                                                                                    value: `${parseInt(a.price) * 0.00004}`,
                                                                                                                },
                                                                                                            },
                                                                                                        ],
                                                                                                    });
                                                                                                }}
                                                                                                onApprove={async (data, actions) => {
                                                                                                    addOrders(p, a);
                                                                                                    alert("Transaction completed");
                                                                                                    
                                                                                                }} />
                                                                                        </PayPalScriptProvider>
                                                                                    </div>
                                                                                    <div class="modal-footer">
                                                                                        <button type="button" id={`close${a.id}`} class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </> : <></>}
                                                                </div>
                                                            )
                                                        }) :
                                                        auctions.filter(a => a.post === p.id && a.delivery === infoUser.id).map(a => {
                                                            return (
                                                                <div className="d-flex align-items-center my-1" key={a.id}>
                                                                    {listShipper.filter(s => s.id === a.delivery).map(s => <img src={s.avatar} alt="avatar" className="rounded-circle me-2"
                                                                        style={{ width: "38px", height: "38px", objectFit: "cover" }} />)}
                                                                    <div className="p-3 rounded comment__input w-100">
                                                                        {listShipper.filter(s => s.id === a.delivery).map(s => listUsers.filter(u => u.id === s.user).map(u => <p className="m-0 fw-bold">{u.last_name} {u.first_name}</p>))}
                                                                        <p className="m-0 fs-7 bg-gray p-2 rounded d-flex">
                                                                            {a.content}<br />
                                                                            Giá đưa ra: {a.price}
                                                                        </p>
                                                                    </div>
                                                                    <Dropdown>
                                                                        <Dropdown.Toggle variant="white">
                                                                            <VscEllipsis className='fs-5' />
                                                                        </Dropdown.Toggle>
                                                                        <Dropdown.Menu>
                                                                            <Dropdown.Item className="dropdown-item d-flex justify-content-around align-items-center fs-7" onClick={() => deleteAuction(a.id)}>Xóa</Dropdown.Item>
                                                                        </Dropdown.Menu>
                                                                    </Dropdown> : <></>
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                    {user.user_role === 'SHIPPER_ROLE' ?
                                                        <Form onSubmit={addAuction} className="d-flex mt-3">
                                                            <div>
                                                                <img
                                                                    src={infoUser.avatar}
                                                                    alt="avatar"
                                                                    className="rounded-circle me-2"
                                                                    style={{ width: "38px", height: "38px", objectFit: "cover" }}
                                                                />
                                                            </div>
                                                            <InputGroup className="mb-3">
                                                                <Form.Control value={content} onChange={e => setContent(e.target.value)} placeholder="Nội dung đấu giá..." />
                                                                <Form.Control value={price} onChange={e => setPrice(e.target.value)} placeholder="Giá..." />
                                                                {loading ? <Loading /> : <Button variant="outline-secondary" onClick={() => setPostId(p.id)} type="submit">Đấu giá</Button>}
                                                            </InputGroup>
                                                        </Form> : <></>}
                                                </div>
                                            </div>
                                        </Collapse>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </>
    )
}

export default Poster