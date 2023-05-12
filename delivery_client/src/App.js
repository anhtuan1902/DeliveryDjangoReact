import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Login from './components/Login';
import { UserContext } from './configs/MyContext';
import myUserReducer from './reducers/UserReducer';
import { useReducer } from 'react';
import cookies from 'react-cookies';
import Register from './components/Register';
import Discount from './components/Discount';
import Shippers from './components/Shippers';
import ShipperAdmin from './components/ShipperAdmin';
import ShipperDetail from './components/ShipperDetail';
import Orders from './components/Orders';

function App() {
  const [user, dispatch] = useReducer(myUserReducer, cookies.load('current-user') || null)
  return (
    <UserContext.Provider value={[user, dispatch]}>
      <BrowserRouter>
        <Routes >
          <Route path='/login' element={<Login />} />
          <Route path='/' element={<Home />} />
          <Route path='/register' element={<Register />} />
          <Route path='/admin/discounts' element={<Discount />} />
          <Route path='/shippers' element={<Shippers />} />
          <Route path='/admin/shippers' element={<ShipperAdmin />} />
          <Route path='/shippers/:shipperId' element={<ShipperDetail />} />
          <Route path='/orders' element={<Orders />} />
          <Route path='*' element={<div className='alert alert-info m-1'>Comming soon...</div>} />
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
