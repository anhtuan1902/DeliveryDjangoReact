import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../configs/MyContext'
import { authAPI, endpoints } from '../configs/API'
import Sidebar from '../layouts/Sidebar'
import Header from '../layouts/Header'
import Loading from '../layouts/Loading';
import { Button, Form, Table } from 'react-bootstrap'


function Orders() {
  const [loading, setLoading] = useState(false)
  const [toggle, settoggle] = useState(true)
  const [user,] = useContext(UserContext)
  const [listOrder, setListOrder] = useState([])
  const [status, setStatus] = useState('')
  const [statusOrder, setStatusOrder] = useState('')
  const [info, setInfo] = useState([])
  const [posters, setPosters] = useState([]);
  const [auctions, setAuctions] = useState([]);

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
    const loadListOrder = async () => {
      try {
        setLoading(true)
        let res = await authAPI().get(endpoints['orders'])
        setListOrder(res.data)
      } catch (ex) {
        alert(ex)
      } finally {
        setLoading(false)
      }
    }
    loadListOrder()
  }, [])

  useEffect(() => {
    const loadPoster = async () => {
      setLoading(true)
      try {
        let res = await authAPI().get(endpoints['post'])
        setPosters(res.data)
      } catch (ex) {
        alert(ex)
      } finally {
        setLoading(false)
      }
    }

    loadPoster()
  }, [])

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

  const changeStatus = (orderId) => {
    const process = async () => {
      setStatus('')
      if (window.confirm("Bạn chắc chắn xác nhận?") === true) {
        try {
          let formOrder = new FormData()
          formOrder.append('status_order', statusOrder)
          let res = await authAPI().patch(endpoints['action-order'](orderId), formOrder)
          setStatus(res.status)
        } catch (ex) {
          alert(ex)
        } finally {
          setLoading(false)

        }
      }
    }

    process()
  }

  const Toggle = () => {
    settoggle(!toggle);
  }

  const ShowShipper = () => {
    return (<>
      <div className='row'>
        {toggle && <div className='col-4 col-md-2 vh-100 position-fixed bg-white'>
          <Sidebar />
        </div>}
        {toggle && <div className='col-4 col-md-2'></div>}
        <div className='col vh-100' style={{ backgroundColor: "#E0EAFC" }}>
          <div className='px-3'>
            <Header Toggle={Toggle} />
            <div className="d-flex align-items-center flex-column">
              <h1 className="text-danger text-center">QUẢN LÍ CÁC ĐƠN HÀNG</h1>
              <div className="bg-white p-4 rounded shadow mt-4" style={{ width: "70%" }}>
                <h3 className="text-center pb-4">Những đơn hàng chưa được giao thành công</h3>
                <Table striped bordered hover>
                  <thead className='text-center'>
                    <tr>
                      <th>Mã đơn hàng</th>
                      <th>Mã sản phẩm</th>
                      <th>Số tiền</th>
                      <th>Địa chỉ nhận</th>
                      <th>Địa chỉ giao</th>
                      <th>Trạng thái đơn hàng</th>
                      <th>Ngày cập nhật</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className='text-center'>
                    {listOrder.filter(o => o.status_order === 'DELIVERING' || o.status_order === 'CONFIRM').map(o => {
                      return (
                        o.shipper === info.id ? <tr key={o.id}>
                          <td className='pt-3'>{o.id}</td>
                          {auctions.filter(a => a.id === o.auction).map(a => <td className='pt-3'>{a.post}</td>)}
                          <td className='pt-3'>
                            {o.amount}
                          </td>
                          {auctions.filter(a => a.id === o.auction).map(a => posters.filter(p => p.id === a.post).map(p => <td className='pt-3'>{p.from_address}</td>))}
                          {auctions.filter(a => a.id === o.auction).map(a => posters.filter(p => p.id === a.post).map(p => <td className='pt-3'>{p.to_address}</td>))}
                          <td className='pt-3'>
                            <Form.Select onChange={(evt) => setStatusOrder(evt.target.value)}>
                              {o.status_order === 'CONFIRM' ? <option>Xác nhận</option> : <option>Đang giao hàng</option>}
                              <option value="CANCEL">Hủy</option>
                              <option value="CONFIRM">Xác nhận</option>
                              <option value="DELIVERING">Đang giao hàng</option>
                              <option value="RECEIVED">Đã giao hàng</option>
                            </Form.Select>
                          </td>
                          <td className='pt-3'>
                            {o.updated_date}
                          </td>
                          <td className='pt-3'>
                            <Button variant="outline-success" onClick={() => changeStatus(o.id)}>Xác nhận</Button>
                          </td>
                        </tr> : <></>
                      )
                    }
                    )}
                  </tbody>
                </Table>
              </div>
              <div className="bg-white p-4 rounded shadow mt-4" style={{ width: "70%" }}>
                <h3 className="text-center pb-4">Những đơn hàng đã được hoàn tất</h3>
                <Table striped bordered hover>
                  <thead className='text-center'>
                    <tr>
                      <th>Mã đơn hàng</th>
                      <th>Mã sản phẩm</th>
                      <th>Số tiền</th>
                      <th>Địa chỉ nhận</th>
                      <th>Địa chỉ giao</th>
                      <th>Trạng thái đơn hàng</th>
                      <th>Ngày cập nhật</th>
                    </tr>
                  </thead>
                  <tbody className='text-center'>
                    {listOrder.filter(o => o.status_order === 'CANCEL' || o.status_order === 'RECEIVED').map(o => {
                      return (
                        o.shipper === info.id ? <tr key={o.id}>
                          {console.log(o.shipper)}
                          <td className='pt-3'>{o.id}</td>
                          {auctions.filter(a => a.id === o.auction).map(a => <td className='pt-3'>{a.post}</td>)}
                          <td className='pt-3'>
                            {o.amount}
                          </td>
                          {auctions.filter(a => a.id === o.auction).map(a => posters.filter(p => p.id === a.post).map(p => <td className='pt-3'>{p.from_address}</td>))}
                          {auctions.filter(a => a.id === o.auction).map(a => posters.filter(p => p.id === a.post).map(p => <td className='pt-3'>{p.to_address}</td>))}
                          <td className='pt-3'>
                            {o.status_order === 'RECEIVED' ? <option>Đã giao hàng</option> : <option>Hủy</option>}
                          </td>
                          <td className='pt-3'>
                            {o.updated_date}
                          </td>

                        </tr> : <></>)
                    }
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

  const ShowCustomer = () => {
    return (<>
      <div className='row'>
        {toggle && <div className='col-4 col-md-2 vh-100 position-fixed bg-white'>
          <Sidebar />
        </div>}
        {toggle && <div className='col-4 col-md-2'></div>}
        <div className='col vh-100' style={{ backgroundColor: "#E0EAFC" }}>
          <div className='px-3'>
            <Header Toggle={Toggle} />
            <div className="d-flex align-items-center flex-column" >
              <h1 className="text-danger text-center">QUẢN LÍ CÁC ĐƠN HÀNG</h1>
              <div className="bg-white p-4 rounded shadow mt-4" style={{ width: "70%" }}>
                <h3 className="text-center pb-4">Những đơn hàng của bạn</h3>
                <Table striped bordered hover>
                  <thead className='text-center'>
                    <tr>
                      <th>Mã đơn hàng</th>
                      <th>Mã sản phẩm</th>
                      <th>Số tiền</th>
                      <th>Địa chỉ nhận</th>
                      <th>Địa chỉ giao</th>
                      <th>Trạng thái đơn hàng</th>
                      <th>Ngày cập nhật</th>
                    </tr>
                  </thead>
                  <tbody className='text-center'>
                    {listOrder.map(o => {
                      return (
                        o.customer === info.id ? <tr key={o.id}>
                          <td className='pt-3'>{o.id}</td>
                          {auctions.filter(a => a.id === o.auction).map(a => <td className='pt-3'>{a.post}</td>)}
                          <td className='pt-3'>
                            {o.amount}
                          </td>
                          {auctions.filter(a => a.id === o.auction).map(a => posters.filter(p => p.id === a.post).map(p => <td className='pt-3'>{p.from_address}</td>))}
                          {auctions.filter(a => a.id === o.auction).map(a => posters.filter(p => p.id === a.post).map(p => <td className='pt-3'>{p.to_address}</td>))}

                          {o.status_order === 'CONFIRM' ? <td className='pt-3'>Xác nhận</td> : o.status_order === 'DELIVERING' ? <td className='pt-3'>Đang giao hàng</td> :
                            o.status_order === 'RECEIVED' ? <td className='pt-3'>Đã giao hàng</td> : <td className='pt-3'>Hủy</td>}

                          <td className='pt-3'>
                            {o.updated_date}
                          </td>
                        </tr> : <></>
                      )
                    }
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

  const ShowAdmin = () => {
    return (<>
      <div className='row'>
        {toggle && <div className='col-4 col-md-2 vh-100 position-fixed bg-white'>
          <Sidebar />
        </div>}
        {toggle && <div className='col-4 col-md-2'></div>}
        <div className='col vh-100' style={{ backgroundColor: "#E0EAFC" }} >
          <div className='px-3'>
            <Header Toggle={Toggle} />
            <div className="d-flex align-items-center flex-column">
              <h1 className="text-info text-center">QUẢN TRỊ ĐƠN HÀNG</h1>
              <div className="bg-white p-4 rounded shadow mt-4" style={{ width: "70%" }}>
                <h3 className="text-center pb-4">Tất cả đơn hàng</h3>
                <Table striped bordered hover>
                  <thead className='text-center'>
                    <tr>
                      <th>Mã đơn hàng</th>
                      <th>Mã sản phẩm</th>
                      <th>Số tiền</th>
                      <th>Địa chỉ nhận</th>
                      <th>Địa chỉ giao</th>
                      <th>Trạng thái đơn hàng</th>
                      <th>Ngày cập nhật</th>
                    </tr>
                  </thead>
                  <tbody className='text-center'>
                    {listOrder.map(o =>
                      <tr key={o.id}>
                        <td className='pt-3'>{o.id}</td>
                        {auctions.filter(a => a.id === o.auction).map(a => <td className='pt-3'>{a.post}</td>)}
                        <td className='pt-3'>
                          {o.amount}
                        </td>
                        {auctions.filter(a => a.id === o.auction).map(a => posters.filter(p => p.id === a.post).map(p => <td className='pt-3'>{p.from_address}</td>))}
                        {auctions.filter(a => a.id === o.auction).map(a => posters.filter(p => p.id === a.post).map(p => <td className='pt-3'>{p.to_address}</td>))}
                        <td className='pt-3'>
                          <Form.Select onChange={(evt) => setStatusOrder(evt.target.value)}>
                            {o.status_order === 'CONFIRM' ? <option>Xác nhận</option> : o.status_order === 'DELIVERING' ? <option >Đang giao hàng</option> :
                              o.status_order === 'RECEIVED' ? <option >Đã giao hàng</option> : <option >Hủy</option>}
                            <option value="CANCEL">Hủy</option>
                            <option value="CONFIRM">Xác nhận</option>
                            <option value="DELIVERING">Đang giao hàng</option>
                            <option value="RECEIVED">Đã giao hàng</option>
                          </Form.Select>
                        </td>
                        <td className='pt-3'>
                          {o.updated_date}
                        </td>
                        <td className='pt-3'>
                          <Button variant="outline-success" onClick={() => changeStatus(o.id)}>Xác nhận</Button>
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

  return (
    <div className='container-fluid bg-light min-vh-100'>

      {!loading && user.user_role === "SHIPPER_ROLE" ? <ShowShipper /> : !loading && user.user_role === "CUSTOMER_ROLE" ? <ShowCustomer /> : !loading && user.user_role === "ADMIN_ROLE" ? <ShowAdmin /> : <Loading />}
    </div>
  )
}

export default Orders