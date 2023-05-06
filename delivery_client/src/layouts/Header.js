import React, { useContext, useEffect, useState } from 'react'
import { AiOutlineUnorderedList } from 'react-icons/ai'
import { Navbar, Container, Dropdown, Nav } from 'react-bootstrap'
import { UserContext } from "../configs/MyContext"
import { Link } from 'react-router-dom';
import { authAPI, endpoints } from '../configs/API';

function Header({ Toggle }) {
    const [user, dispatch] = useContext(UserContext)
    const [info, setInfo] = useState([]);

    useEffect(() => {
        const loadUserInfo = async () => {
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
            }
        }

        loadUserInfo()
    }, [user.id, user.user_role])
    const logout = () => {
        dispatch({
            "type": "logout"
        })
    }
    return (
        <Navbar expand="sm" className='py-4'>
            <Container fluid>
                <AiOutlineUnorderedList className='navbar-brand fs-1' onClick={Toggle} />
                <Navbar.Toggle aria-controls="navbarScroll" />
                <Navbar.Collapse id="navbarScroll" >
                    <Nav className="ms-auto my-2 my-lg-0" style={{ maxHeight: '100px' }} navbarScroll>
                        <Dropdown className="d-inline ms-2 bg-dark rounded-4">
                            <Dropdown.Toggle id="dropdown-autoclose-true" className='bg-dark rounded-4'>
                                <img src={info.avatar} alt="avatar" className="rounded-circle me-2" style={{ width: "48px", height: "48px", objectFit: "cover" }}/>
                                {user.username}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className='mt-1'>
                                <Dropdown.Item><Link className="nav-link text-secondary text-center" to="/">
                                    Chào {user.first_name} {user.last_name}
                                </Link></Dropdown.Item>
                                <Dropdown.Item><Link to='/' onClick={logout} className="nav-link text-secondary text-center"> Đăng xuất</Link></Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default Header