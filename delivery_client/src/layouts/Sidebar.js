import React, { useContext } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { FaShippingFast, FaUserFriends, FaShoppingCart } from 'react-icons/fa';
import { BsNewspaper } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { UserContext } from '../configs/MyContext';
import { CiDiscount1 } from "react-icons/ci";
import { MdManageAccounts } from "react-icons/md";

function Sidebar() {
    const [user,] = useContext(UserContext)


    return (
        <div className='sidebar p-2 bg-white'>
            <div className='m-3'>
                <FaShippingFast className='me-3 fs-1 text-danger' />
                <span className='brand-name fs-3 text-danger'>Giao hàng TAT</span>
            </div>
            <hr className='text-black my-4' />
            <div className='list-group list-group-flush'>
                <Link className='list-group-item py-2 bg-white sidebar' to='/'>
                    <BsNewspaper className='fs-4 me-3' />
                    <span className='fs-4'>Trang chủ</span>
                </Link>
                <Link className='list-group-item py-2 bg-white sidebar' to='/shippers'>
                    <FaUserFriends className='fs-4 me-3' />
                    <span className='fs-4'>Nhân viên</span>
                </Link>
                <Link className='list-group-item py-2 bg-white sidebar' to='/orders'>
                    <FaShoppingCart className='fs-4 me-3' />
                    <span className='fs-4'>Đơn hàng</span>
                </Link>
                {user.user_role === 'ADMIN_ROLE' ? <><Link className='list-group-item py-2 bg-white sidebar' to='/admin/discounts'>
                    <CiDiscount1 className='fs-4 me-3' />
                    <span className='fs-4'>Quản trị mã giảm</span>
                </Link>
                    <Link className='list-group-item py-2 bg-white sidebar' to='/admin/shippers'>
                        <MdManageAccounts className='fs-4 me-3 ' />
                        <span className='fs-4'>Quản trị nhân viên</span>
                    </Link></> : <></>}
            </div>
        </div>
    )
}

export default Sidebar