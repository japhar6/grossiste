import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/Sidebar.css'; // Fichier CSS externe
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
      faChevronLeft, 
    faChevronRight, faTruck,
    faCashRegister, faRotateLeft,faBoxes ,faBox 
} from '@fortawesome/free-solid-svg-icons';


function SidebarVendeur(){
   
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
                     if (touchStartX > 40) {
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
         
       
    const buttons = [
  
        { path: "/magasinier", icon: faCashRegister, text: "Sortie des produits" },
        { path: "/RetourStockCom", icon: faRotateLeft, text: "Retour des produits" },

        { path: "/stockma", icon: faBoxes, text: "Gestion de stock" },

        { path: "/transfert", icon: faTruck , text: "Transfert" },
    
      ];
    return(
        <>
          <aside 
                                 className={`aside p-4 ${collapsed ? 'collapsed' : ''} ${hidden ? 'hidden' : ''}`}
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
                                             {collapsed ? " " : "GROSSISTE"}
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
    )
}

export default SidebarVendeur;