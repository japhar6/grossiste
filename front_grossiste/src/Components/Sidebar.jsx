import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Variables pour gérer le swipe
    let touchStartX = 0;
    let touchEndX = 0;

    useEffect(() => {
        const handleTouchStart = (e) => {
            touchStartX = e.touches[0].clientX;
            console.log("Touch Start:", touchStartX);
        };

        const handleTouchMove = (e) => {
            touchEndX = e.touches[0].clientX;
        };

        const handleTouchEnd = () => {
            const swipeDistance = touchEndX - touchStartX;
            console.log("Swipe Distance:", swipeDistance);

            // On vérifie que le swipe commence bien à gauche (moins de 30px)
            if (touchStartX > 30) {
                console.log("Swipe ignoré (pas assez à gauche)");
                return;
            }

            if (swipeDistance > 50) {
                console.log("Ouvrir sidebar");
                setHidden(false);
            } else if (swipeDistance < -50) {
                console.log("Fermer sidebar");
                setHidden(true);
            }
        };

        document.addEventListener("touchstart", handleTouchStart);
        document.addEventListener("touchmove", handleTouchMove);
        document.addEventListener("touchend", handleTouchEnd);

        return () => {
            document.removeEventListener("touchstart", handleTouchStart);
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
        };
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
        { path: "/personnel", icon: faUsers, text: "Personnels" },
        { path: "/fournisseur", icon: faTruck, text: "Fournisseur" },
        { path: "/produit", icon: faTags, text: "Article et produits" },
        { path: "/achat", icon: faShoppingCart, text: "Achat" },
        { path: "/stock", icon: faBoxes, text: "Gestion de stock" },
        { path: "/entrepot", icon: faHome, text: "Gestion des entrepôts" },
        { path: "/commerciale", icon: faBriefcase, text: "Gestion des commerciaux" },
      
        { path: "/chiffre-affaire", icon: faChartBar, text: "Chiffre d'affaire" },
                { path: "/histovad", icon: faTags, text: "Historique des commandes" },
                { path: "/histocad", icon: "fa-tags", text: "Historique des paiements" },
    ];

    return (
      <>
          <aside className={`aside p-4 ${collapsed ? 'collapsed' : ''} ${hidden ? 'hidden' : ''}`} >
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

                      <div className="menu ">
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
