import React, { useContext, useState } from 'react'
import Header from '../layouts/Header'
import Poster from './Poster'
import { Link } from 'react-router-dom'
import Sidebar from '../layouts/Sidebar';
import { UserContext } from "../configs/MyContext"


function Home() {

  const [toggle, settoggle] = useState(true)
  const [user,] = useContext(UserContext)


  const Toggle = () => {
    settoggle(!toggle);
  }

  const ChooseLogin = () => {
    return (
    <div>
      <div className='container card' style={{marginTop: "150px"}}>
        <h3 className='text-center mt-3'>Chào mừng đến với hệ thống quản lí giao hàng</h3>
        <div className="d-grid gap-2 m-4">
          <Link to='/login' className='btn btn-secondary my-2 mx-5' size="lg">
            Đăng nhập
          </Link>
          <Link to='/register' className='btn btn-secondary my-2 mx-5' size="lg">
            Đăng kí
          </Link>
        </div>
      </div>
    </div>
    )

}

const ShowHome = () => {
  return (<>
    <div className='row vh-100'>
      {toggle && <div className='col-4 col-md-2 position-fixed bg-white'>
        <Sidebar />
      </div>}
      {toggle && <div className='col-4 col-md-2'></div>}
      <div className='col' style={{backgroundColor: "#E0EAFC"}}>
        <div className='px-3'>
          <Header Toggle={Toggle} />
          <div className="d-flex align-items-center flex-column">
            <Poster />
          </div>
        </div>
      </div>
    </div>
  </>);
}

return (
  <div className='container-fluid'>
    {user === null ? <ChooseLogin /> : <ShowHome />}
  </div>
)
}

export default Home