import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import Fournisseur from './Pages/Fournisseur';
import Dashboard from './Pages/Dashboard';
import PrivateRoute from './config/privateRoute.jsx';
import Personnels from './Pages/Personnels.jsx';
import Personnel from './Pages/Personnels.jsx';
import Profil from './Pages/Profil.jsx';
import ListeProduits from './Pages/Produits.jsx';
import  AchatProduits from './Pages/Achat.jsx';
import  Entrepot from './Pages/Entrepot.jsx';
import  PriseCommande from './Pages/PriseCommande.jsx';
import Caisse from './Pages/Caisse.jsx';
import Commerciale from './Pages/Commerciale.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route path='/fournisseur' element={<Fournisseur />} />
          <Route path='/admin' element={<Dashboard />} />
          <Route path='/produit' element={<ListeProduits />} />
          <Route path='/personnels' element={<Personnels />} />
          <Route path='/personnel' element={<Personnel />} />
          <Route path='/achat' element={<AchatProduits />} />
          <Route path='/entrepot' element={<Entrepot />} />
          <Route path='/commande' element={<  PriseCommande/>} />
          <Route path='/caisse' element={<  Caisse/>} />
          <Route path='/profil' element={<Profil />} />
          <Route path='/commerciale' element={<Commerciale />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
