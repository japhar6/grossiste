import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/Sidebar.css'; // Fichier CSS externe
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
  faHome,
  faBriefcase,
  faUserFriends,
  faTruckLoading,
  faChartBar
} from '@fortawesome/free-solid-svg-icons';

function Sidebar() {
    const [collapsed, setCollapsed] = useState(false); // Gestion du mode collapsed
    const [hidden, setHidden] = useState(false); // Gestion de la disparition totale sur mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Détecter le mobile

    // Vérifier la taille de l'écran pour basculer en mode mobile
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fonction pour gérer le collapse/déploiement
    const toggleSidebar = () => {
        if (isMobile) {
            setHidden(!hidden);
            setCollapsed(false); // Toujours revenir à collapsed sur mobile
        } else {
            setCollapsed(!collapsed);
        }
    };

    // Gestion du swipe
    const handleTouchStart = (e) => {
        const touchStartX = e.touches[0].clientX;
        const handleTouchMove = (e) => {
            const touchEndX = e.touches[0].clientX;
            if (touchEndX - touchStartX > 50) {
                setHidden(false); // Ouvrir la sidebar si le mouvement est vers la droite
                document.removeEventListener('touchmove', handleTouchMove);
            } else if (touchStartX - touchEndX > 50) {
                setHidden(true); // Fermer la sidebar si le mouvement est vers la gauche
                document.removeEventListener('touchmove', handleTouchMove);
            }
        };
        document.addEventListener('touchmove', handleTouchMove);
    };

    const buttons = [
        { path: "/admin", icon: faChartLine, text: "Tableau de bord" },
        { path: "/personnel", icon: faUsers, text: "Personnels" },
        { path: "/fournisseur", icon: faTruck, text: "Fournisseur" },
        { path: "/produit", icon: faTags, text: "Article et produits" },
        { path: "/achat", icon: faShoppingCart, text: "Achat" },
        { path: "/stock", icon: faBoxes, text: "Gestion de stock" },
        { path: "/entrepot", icon: faHome, text: "Gestion des entrepôts" },
        { path: "/commerciale", icon: faBriefcase, text: "Gestion des commerciaux" },
        { path: "/clients", icon: faUserFriends, text: "Client particulier (cousine)" },
        { path: "/livraisons", icon: faTruckLoading, text: "Gestion des Livraisons" },
        { path: "/chiffre-affaire", icon: faChartBar, text: "Chiffre d'affaire" },
    ];

    return (
      <>
          <aside 
              className={`aside p-4 ${collapsed ? 'collapsed' : ''} ${hidden ? 'hidden' : ''}`}
              onTouchStart={handleTouchStart} // Ajouter le gestionnaire de touch
          >
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

                      <div className="menu mt-2 p-2 pt-1">
                          {buttons.map((button, index) => (
                              <Link 
                                  to={button.path} 
                                  key={index} 
                                  className="btn btn-light p-3 d-flex align-items-center mb-2 sidebar-item"
                              >
                                  <FontAwesomeIcon icon={button.icon} className="text-success fw-bold" />
                                  {!collapsed && <span className="ms-2">{button.text}</span>}
                              </Link>
                          ))}
                      </div>
                  </>
              )}
          </aside>
      </>
  );
}

export default Sidebar;
