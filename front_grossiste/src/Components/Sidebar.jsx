import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../Styles/Sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faChevronRight, 
  faChartLine,
  faUsers,
  faTruck,
  faTags,
  faShoppingCart,
  faBoxes,
  faBox,
  faHome,
  faBriefcase,
  faUserFriends,
  faTruckLoading,
  faChartBar
} from '@fortawesome/free-solid-svg-icons';

function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const location = useLocation(); // Obtient la localisation actuelle

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        if (isMobile) {
            setHidden(!hidden);
            setCollapsed(false);
        } else {
            setCollapsed(!collapsed);
        }
    };

    const buttons = [
        { path: "/admin", icon: faChartLine, text: "Tableau de bord" },
        { path: "/ChiffreAffaire", icon: faChartBar, text: "Chiffre d'affaire" },
        { path: "/personnel", icon: faUsers, text: "Personnels" },
        { path: "/fournisseur", icon: faTruck, text: "Fournisseur" },
        { path: "/produit", icon: faTags, text: "Article et produits" },
        { path: "/achat", icon: faShoppingCart, text: "Achat" },
        { path: "/stock", icon: faBoxes, text: "Gestion de stock" },
        { path: "/entrepot", icon: faHome, text: "Gestion des entrepôts" },
        { path: "/commerciale", icon: faBriefcase, text: "Gestion des commerciaux" },
        { path: "/Client", icon: faUserFriends, text: "Gestion des Clients" },
        { path: "/transfertAdmin", icon: faTruckLoading, text: "Gestion des Transferts" },
        { path: "/histovad", icon: faTags, text: "Historique des commandes" },
        { path: "/histocad", icon: "fa-tags", text: "Historique des paiements" },
        { path: "/HistoAcha", icon: "fa-tags", text: "Historique des achats" },
        { path: "/histomad", icon: "fa-tags", text: "Historique des Sorties des Produits" },
        { path: "/inventaire", icon: faBox , text: "Inventaire" },
    ];

    return (
        <aside className={`aside p-4 ${collapsed ? 'collapsed' : ''} ${hidden ? 'hidden' : ''}`}>
            <button 
                className="btn btn-light collapse-btn" 
                onClick={toggleSidebar}
            >
                <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronLeft} />
            </button>

            {!hidden && (
                <>
                    <h1 className='gradient text-center'>
                        {collapsed ? "" : "GROSSISTE"}
                    </h1>

                    <div className="menu">
                        {buttons.map((button, index) => (
                            <Link 
                                to={button.path} 
                                key={index} 
                                className={`btn btn-light p-3 d-flex align-items-center mb-2 sidebar-item ${location.pathname === button.path ? 'active' : ''}`} 
                            >
                                <FontAwesomeIcon icon={button.icon} className="text-success fw-bold" />
                                {!collapsed && <span className="ms-2">{button.text}</span>}
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </aside>
    );
}

export default Sidebar;
