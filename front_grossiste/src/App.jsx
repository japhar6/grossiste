import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import Fournisseur from './Pages/Fournisseur';
import Dashboard from './Pages/Dashboard';
import PrivateRoute from './config/privateRoute.jsx';
import Personnel from './Pages/Personnels.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route path='/fournisseur' element={<Fournisseur />} />
          <Route path='/admin' element={<Dashboard />} />
          <Route path='/personnel' element={<Personnel />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
