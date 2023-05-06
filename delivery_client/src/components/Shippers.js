import React, { useContext, useEffect, useState } from 'react'
import Sidebar from '../layouts/Sidebar';
import Header from '../layouts/Header';
import { UserContext } from '../configs/MyContext';
import API, { authAPI, endpoints } from '../configs/API';
import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';
import { Link } from 'react-router-dom';

function Shippers() {
    const [toggle, settoggle] = useState(true)
    const [user,] = useContext(UserContext)
    const [listUser, setListUser] = useState([])
    const [listShipper, setListShipper] = useState([])
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const loadingShipper = async () => {
            setLoading(true)
            try {
                let res = await API.get(endpoints['shippers'])
                setListShipper(res.data)
            } catch (ex) {
                console.log(ex)
            } finally {
                setLoading(false)
            }
        }
        loadingShipper()
    }, [])

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
    }, [])

    useEffect(() => {
        const loadRate = async () => {
            setLoading(true)
            try {
                let res = await authAPI().get(endpoints['rating'])
                setRates(res.data)
            } catch (ex) {
                console.log(ex)
            } finally {
                setLoading(false)
            }
        }
        loadRate()
    }, [])


    const getResult = (id) => {
        let result = 0
        let temp = []
        rates.filter(r => r.shipper === id).map(r => temp.push(r))
        result = temp.reduce((acc, rate) => acc = acc + rate.rate, 0) / temp.length;
        console.log(result)
        return result
    }
    const Toggle = () => {
        settoggle(!toggle);
    }

    const ShowHome = () => {
        return (
            <div className='row' >
                {toggle && <div className='col-4 col-md-2 vh-100 position-fixed bg-white'>
                    <Sidebar />
                </div>}
                {toggle && <div className='col-4 col-md-2'></div>}
                <div className='col vh-100' style={{backgroundColor: "#E0EAFC"}}>
                    <div className='px-3'>
                        <Header Toggle={Toggle} />
                        <div className="d-flex align-items-center flex-column">
                            <div className="text-center mb-3">
                                <h1 className='text-danger'>Danh Sách Shipper</h1>
                            </div>

                            <div className='mt-5' style={{ width: "80%"}} >
                                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
                                    {listShipper.filter(s => s.already_verify === true).map(s => {
                                        return (
                                            <div className="col" key={s.id}>
                                                <Link to={'/shippers/' + s.id } className="nav-link card h-100 rounded-4 shadow">
                                                    <img src={s.avatar} className="card-img-top p-3" alt={s.user} style={{ height: "300px" }} />
                                                    <div className="card-body text-center">
                                                        {listUser.filter(u => u.id === s.user).map(u => <h5 className="card-title">{u.last_name} {u.first_name}</h5>)}
                                                    </div>
                                                    <div className='card-footer text-center'>
                                                        <Box sx={{ '& > legend': { mt: 2 }, }}>
                                                            <Rating name="read-only" value={getResult(s.id)} readOnly />
                                                        </Box>
                                                    </div>
                                                </Link>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className='container-fluid bg-light min-vh-100'>
            {/* {user === null ? <ChooseLogin /> : <ShowHome />} */}
            <ShowHome />
        </div>
    )
}

export default Shippers