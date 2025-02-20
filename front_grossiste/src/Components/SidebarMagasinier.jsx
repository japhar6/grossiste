import 'react';
import { Link } from 'react-router-dom';

function SidebarVendeur(){
    const buttons = [
  
       


        { path: "/magasinier", icon: "fa-cash-register", text: "Sortie des produits" },
        { path: "/histom", icon: "fa-tags", text: "Historique des Sorties" },
    
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
                            style={{fontSize:"0.6em !important"}}
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

export default SidebarVendeur;