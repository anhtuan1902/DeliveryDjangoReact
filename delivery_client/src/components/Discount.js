import React, { useContext, useEffect, useState } from 'react'
import Sidebar from '../layouts/Sidebar';
import Header from '../layouts/Header';
import { UserContext } from '../configs/MyContext';
import { Button, Form, Table } from 'react-bootstrap'
import { authAPI, endpoints } from '../configs/API';
import Loading from '../layouts/Loading';
import ErrorAlert from '../layouts/ErrorAlert';

function Discount() {
  const [loading, setLoading] = useState(false)
  const [toggle, settoggle] = useState(true)
  const [user,] = useContext(UserContext)
  const [admin, setAdmin] = useState([])
  const [adminId, setAdminId] = useState()
  const [listDiscount, setListDiscount] = useState([])
  const [discountTitle, setDiscountTitle] = useState("")
  const [discountPercent, setDiscountPercent] = useState("")
  const [err, setErr] = useState()
  const [status, setStatus] = useState('')


  useEffect(() => {
    const loadDiscounts = async () => {
      setLoading(true)
      try {
        let res = await authAPI().get(endpoints['discounts'])
        setListDiscount(res.data)
      } catch (ex) {
        alert(ex)
      } finally {
        setLoading(false)
      }
    }
    loadDiscounts()
  }, [status])

  useEffect(() => {
    const loadAdmin = async () => {
      setLoading(true)
      try {
        let res = await authAPI().get(endpoints['admins'])
        setAdmin(res.data)
      } catch (ex) {
        alert(ex)
      } finally {
        setLoading(false)
      }
    }
    loadAdmin()
  }, [status])

  const Toggle = () => {
    settoggle(!toggle);
  }

  const addDiscount = (evt) => {
    evt.preventDefault()
    const process = async () => {
      setStatus('')
      try {
        setLoading(true)
        let form = new FormData()
        form.append('discount_title', discountTitle)
        form.append('discount_percent', discountPercent)
        form.append('admin', adminId)
        form.append('active', true)
        let r = await authAPI().post(endpoints['discounts'], form)
        setListDiscount(current => ([r.data, ...current]))
        setStatus(r.status)
      } catch (ex) {
        console.error(ex)
        setErr("Thông tin không hợp lệ")
      } finally {
        setDiscountTitle('')
        setDiscountPercent('')
        setLoading(false)
      }
    }
    process()
  }

  const delDiscount = async (id) => {
    setStatus('')
    if (window.confirm("Bạn có chắc chắn xóa?") === true) {
      try {
        setLoading(true)
        let form = new FormData()
        form.append('active', false)
        let res = await authAPI().patch(endpoints['action-discount'](id), form)
        setStatus(res.status)
      } catch (error) {
        alert(error);
      } finally {
        setLoading(false)
      }
    }
  }

  const Authenticated = () => {
    return (
      <h1 className='text-center'>Ban khong co quyen truy cap o trang nay</h1>
    )
  }

  return (
    <div className='container-fluid bg-light min-vh-100'>
      {user.user_role === 'ADMIN_ROLE' && !loading ?
        <>
          <div className='row'>
            {toggle && <div className='col-4 col-md-2 vh-100 position-fixed bg-white'>
              <Sidebar />
            </div>}
            {toggle && <div className='col-4 col-md-2'></div>}
            <div className='col vh-100' style={{backgroundColor: "#E0EAFC"}}>
              <div className='px-3'>
                <Header Toggle={Toggle} />
                <div className="d-flex align-items-center flex-column">
                  <h1 className="text-info text-center">QUẢN TRỊ MÃ GIẢM GIÁ</h1>
                  <div className="bg-white p-3 mt-3 rounded border shadow" style={{ width: "80%" }}>
                    {err ? <ErrorAlert err={err} /> : ""}
                    <Form className='m-4' onSubmit={addDiscount}>
                      <Form.Group className="mb-3" >
                        <Form.Label>Tên mã giảm giá</Form.Label>
                        <Form.Control type="text" tabIndex={0} value={discountTitle} onChange={(event) => setDiscountTitle(event.target.value)} placeholder="Nhập tên mã giảm giá" />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Phần trăm giảm giá</Form.Label>
                        <Form.Control type="number" value={discountPercent} onChange={(event) => setDiscountPercent(event.target.value)} placeholder="Nhập phần trăm giảm giá" />
                      </Form.Group>
                      {loading ? <Loading /> : <Button type="submit" variant="secondary" onClick={() => admin.filter(a => a.user === user.id).map(a => setAdminId(a.id))}>Thêm sản phẩm</Button>}
                    </Form>
                  </div>
                  <div className="bg-white p-4 rounded shadow mt-4" style={{ width: "80%" }}>
                    <Table striped bordered hover>
                      <thead className='text-center'>
                        <tr>
                          <th>Id</th>
                          <th>Tên mã giảm giá</th>
                          <th>Phần trăm giảm giá</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody className='text-center'>
                        {listDiscount.map(d =>
                          <tr key={d.id}>
                            <td className='pt-3'>{d.id}</td>
                            <td className='pt-3'>{d.discount_title}</td>
                            <td className='pt-3'>{d.discount_percent}%</td>
                            <td>
                              <Button variant="outline-success" onClick={() => delDiscount(d.id)} >Xóa</Button>
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
        </> : <Authenticated />
      }
    </div>
  )
}

export default Discount