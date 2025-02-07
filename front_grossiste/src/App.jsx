import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import Fournisseur from './Pages/Fournisseur';
import Dashboard from './Pages/Dashboard';


function App() {

  return (
    <BrowserRouter>
        <Routes>
          <Route path='/' element={<Login/>}/>
          <Route path='/fournisseur' element={<Fournisseur/>}/>
          <Route path='/admin' element={<Dashboard/>}/>
  
        </Routes>
    
    </BrowserRouter>
  )
}

export default App

