import { Navigate, Outlet, useLocation } from "react-router-dom";

const PrivateRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();

  // Mapping des rôles et de leurs pages autorisées
  const rolePaths = {
    admin: ["/admin", "/produit", "/fournisseur", "/personnel","/transfertAdmin", "/caisse", "/entrepot","/inventaire","/creerinventaire","/stock", "/commerciale", "/profil", "/commande", "/achat", "/SortieCommande","/histocad","/histovad","/PersonnelsList","/Client"],
    vendeur: ["/vendeur", "/profilv", "/histov"],
    caissier: ["/caissier", "/profilc", "/histoc", "/PaiementCom", "/FactureNormal","/FactureRemise"],
    magasinier: ["/magasinier", "/profilm", "/histom","/RetourStockCom","/stockma","/transfert"],
  };

  // Page d'accueil par rôle
  const defaultHomePage = {
    admin: "/admin",
    vendeur: "/vendeur",
    magasinier: "/magasinier",
    caissier: "/caissier",
    gestion_prix:"/gestionprix"
  };

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={defaultHomePage[role] || "/"} replace />;
  }

  // 🚨 Bloquer la modification de l'URL tayguihroizhuheu🚨
  if (!rolePaths[role]?.includes(location.pathname)) {
    return <Navigate to={defaultHomePage[role]} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
