import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import Fournisseur from './Pages/Fournisseur';
import Dashboard from './Pages/Dashboard';
import PrivateRoute from './config/privateRoute.jsx';
import Personnel from './Pages/Personnels.jsx';
import Profil from './Pages/Profil.jsx';
import ProfilV from './Pages/ProfilVendeur.jsx';
import ProfilC from './Pages/ProfilCaissier.jsx';
import ProfilM from './Pages/ProfilMagasinier.jsx';
import ProfilG from './Pages/ProfilG.jsx';
import ListeProduits from './Pages/Produits.jsx';
import AchatProduits from './Pages/Achat.jsx';
import Entrepot from './Pages/Entrepot.jsx';
import PriseCommande from './Pages/PriseCommande.jsx';

import SortieCommande from './Pages/SortieCommande.jsx';
import Stock from './Pages/Stock.jsx';
import StockMaga from './Pages/Stockmaga.jsx';
import Commerciale from './Pages/Commerciale.jsx';
import Vendeur from './Pages/Vendeur.jsx';
import Magasinier from './Pages/Magasinier.jsx';
import HistoV from './Pages/HistoventeVendeur.jsx';
import Invetaire from './Pages/Inventaire.jsx'
import CreerInventaire from './Pages/CreerInvetaire.jsx';
import HistoC from './Pages/Histopaiement.jsx';
import Caissier from './Pages/Caissier.jsx';
import PaiementCom from './Pages/PaiementCom.jsx';
import ForbiddenPage from './Pages/ForbiddenPage.jsx';
import RetourStockCom from './Pages/RetourStockCom.jsx';
import FactureNormal from './Components/FactureNormal.jsx';
import Gestion from './Pages/Gestion_Prix.jsx';
import HistoCA from './Pages/HistoC.jsx';
import HistoVA from './Pages/HistoV.jsx';
import HistoSortir from './Pages/HistoMaga.jsx';
import Transfert from './Pages/Transfert.jsx';
import TransfertAdmin from './Pages/TransfertAdmin.jsx';
import PersonnelsList from './Pages/PersonnelsList.jsx';
import Client from './Pages/Client.jsx';
import Notification from './Components/Notifications.jsx';
import HistoAcha from './Pages/HistoAcha.jsx';
import PayerCredit from './Pages/PayerClientcredi.jsx';
import FactureRem from './Pages/FactRemise.jsx';
import Facture from "./Pages/Fact.jsx";
import FactureAdmin from "./Pages/FactAdmin.jsx";
import FactureCom  from "./Pages/FactPaiement.jsx";
import FactureSans  from "./Pages/FactsansPrix.jsx";
import ChiffreAffaire from './Pages/ChiffreAffaire.jsx';
import FactureRemAd from "./Pages/FactureRemiseAdmin.jsx";
import AchatGest from "./Pages/AchatGest.jsx";
import Deccaisement from "./Pages/Decaissement.jsx";
import Histodecaisse from "./Pages/HistoDecaisse.jsx";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route publique */}
        <Route path='/' element={<Login />} />
        <Route path='/forbiddenpage' element={<ForbiddenPage />} />

        {/* Routes ADMIN */}
        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
          <Route path='/admin' element={<Dashboard />} />
          <Route path='/produit' element={<ListeProduits />} />
          <Route path='/fournisseur' element={<Fournisseur />} />
          <Route path='/personnel' element={<Personnel />} />
        
          <Route path='/entrepot' element={<Entrepot />} />
          <Route path='/stock' element={<Stock />} />
          <Route path='/transfertAdmin' element={<TransfertAdmin />} />
          <Route path='/commerciale' element={<Commerciale />} />
          <Route path='/profil' element={<Profil />} />
          <Route path='/commande' element={<PriseCommande />} />
          <Route path='/achat' element={<AchatProduits />} />
          <Route path='/SortieCommande' element={<SortieCommande />} />
          <Route path='/histovad' element={<HistoVA />} />
          <Route path='/histocad' element={<HistoCA />} />
          <Route path='/histomad' element={<HistoSortir />} />
          <Route path='/PersonnelsList' element={<PersonnelsList />} />
          <Route path='/Client' element={<Client />} />
          <Route path='/inventaire' element={<Invetaire />} />
          <Route path='/creerinventaire' element={<CreerInventaire />} />
          <Route path='/notif' element={<Notification />} />
          <Route path='/HistoAcha' element={<HistoAcha />} />
          <Route path="/histodecaisse" element={<Histodecaisse />} />
        
          <Route path="/factureadmin" element={<FactureAdmin />} />
        
          <Route path='/factureremisead' element={<FactureRemAd />} />
          <Route path='/ChiffreAffaire' element={<ChiffreAffaire />} />
          



        </Route>

{/* Routes VENDEUR */}
<Route element={<PrivateRoute allowedRoles={["gestion_prix"]} />}>
<Route path='/gestionprix' element={<Gestion />} />
<Route path='/achatgest' element={<AchatGest />} />
        </Route>
        {/* Routes VENDEUR */}
        <Route element={<PrivateRoute allowedRoles={["vendeur"]} />}>
          <Route path='/vendeur' element={<Vendeur />} />
          <Route path='/profilv' element={<ProfilV />} />
          <Route path='/histov' element={<HistoV />} />
        </Route>

        {/* Routes MAGASINIER */}
        <Route element={<PrivateRoute allowedRoles={["magasinier"]} />}>
          <Route path='/magasinier' element={<Magasinier />} />
          <Route path='/profilm' element={<ProfilM />} />
          <Route path='/RetourStockCom' element={<RetourStockCom />} />
          <Route path='/stockma' element={<StockMaga />} />

          <Route path='/transfert' element={<Transfert />} />

        </Route>

        {/* Routes CAISSIER */}
        <Route element={<PrivateRoute allowedRoles={["caissier"]} />}>
          <Route path='/caissier' element={<Caissier />} />
          <Route path='/profilc' element={<ProfilC />} />
          <Route path='/histoc' element={<HistoC />} />
          <Route path='/payerCredit' element={<PayerCredit />} />
          <Route path='/decaisser' element={<Deccaisement />} />
          <Route path='/PaiementCom' element={<PaiementCom />} />
          <Route path='/FactureNormal' element={<FactureNormal />} />
          <Route path='/FactureRemise' element={<FactureRem />} />
          <Route path="/facture" element={<Facture />} />
          <Route path="/facturepaiement" element={<FactureCom />} />
          <Route path="/facturesansprix" element={<FactureSans />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
