import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/Sidebar.css'; // Fichier CSS externe

function Sidebar() {
    const [collapsed, setCollapsed] = useState(false); // État pour gérer le collapse

    const buttons = [
        { path: "/admin", icon: "fa-chart-line", text: "Tableau de bord" },
        { path: "/personnel", icon: "fa-users", text: "Personnels" },
        { path: "/fournisseur", icon: "fa-truck", text: "Fournisseur" },
        { path: "/produit", icon: "fa-tags", text: "Article et produits" },
        { path: "/achat", icon: "fa-shopping-cart", text: "Achat" },
        { path: "/stock", icon: "fa-boxes", text: "Gestion de stock" },
        { path: "/entrepot", icon: "fa-home", text: "Gestion des entrepôts" },
        { path: "/commerciale", icon: "fa-briefcase", text: "Gestion des commerciaux" },
        { path: "/clients", icon: "fa-user-friends", text: "Client particulier (cousine)" },
        { path: "/livraisons", icon: "fa-truck-loading", text: "Gestion des Livraisons" },
        { path: "/chiffre-affaire", icon: "fa-chart-bar", text: "Chiffre d'affaire" },
    ];

    return (
        <aside className={`aside p-4 ${collapsed ? 'collapsed' : ''}`}>
            <h1 className='gradient text-center'>
                {collapsed ? "" : "GROSSISTE"}
            </h1>

            {/* Bouton de collapse */}
            <button className="btn btn-light w-100 mb-3" onClick={() => setCollapsed(!collapsed)}>
                <i className={`fa ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
            </button>

            <div className="menu mt-2 p-2 pt-1">
                {buttons.map((button, index) => (
                    <Link 
                        to={button.path} 
                        key={index} 
                        className="btn btn-light p-3 d-flex align-items-center mb-2 sidebar-item"
                    >
                        <i className={`fa ${button.icon} text-success fw-bold`}></i>
                        {!collapsed && <span className="ms-2">{button.text}</span>}
                    </Link>
                ))}
            </div>
        </aside>
    );
}

export default Sidebar;
