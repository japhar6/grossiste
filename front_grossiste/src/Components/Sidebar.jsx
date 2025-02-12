import 'react';
import { Link } from 'react-router-dom';

function Sidebar(){
    const buttons = [
        { path: "/admin", icon: "fa-chart-line", text: "Tableau de bord" },
        { path: "/personnel", icon: "fa-users", text: "Personnels" },
        { path: "/fournisseur", icon: "fa-truck", text: "Fournisseur " },
        { path: "/produit", icon: "fa-tags", text: "Article et produits" },
        { path: "/achat", icon: "fa-shopping-cart", text: " Achat" },
        { path: "/stock", icon: "fa-boxes", text: "Gestion de stock" },
        { path: "/entrepot", icon: "fa-home", text: "Gestion des entrepots" },
        { path: "/caisse", icon: "fa-cash-register", text: "Caisse" },
        { path: "/metier-magasinier", icon: "fa-warehouse", text: "Metier Magazinier" },

        { path: "/commande", icon: "fa-shopping-cart", text: "Vente et prise de commande" },

        { path: "/ventes", icon: "fa-shopping-bag", text: "Vente & prise de commande" },
        { path: "/commerciaux", icon: "fa-briefcase", text: "Gestion des commerciaux" },
        { 
          path: "/clients", 
          icon: "fa-user-friends", 
          text: (
            <>
              Client particulier <b className="text-success">(cousine)</b>
            </>
          ) 
        },
        { path: "/livraisons", icon: "fa-truck-loading", text: "Gestion des Livraisons" },
        { path: "/chiffre-affaire", icon: "fa-chart-bar", text: "Chiffre d'affaire" },
      ];
    return(
        <>
            <aside className='aside p-4'>
                <h1 className='gradient text-center'>GROSSISTE</h1>
                <div className="menu mt-3 p-3">
                    <div className='but'>
                        {buttons.map((button, index) => (
                            <Link 
                            to={button.path} 
                            key={index} 
                            className="btn btn-light p-3 d-flex align-items-center mb-2 btn-sm"
                            >
                            <i className={`fa ${button.icon} text-success fw-bold me-2`}></i>
                            {button.text}
                            </Link>
                        ))}
                    </div>
                </div>
            </aside>
        </>
    )
}

export default Sidebar;