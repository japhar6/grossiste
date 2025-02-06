import 'react';
import '../Styles/Dashboard.css';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Navbar';
import LineChart from '../Components/LineChart';
import DonutChart from '../Components/DonutChart';

function Dashboard() {
  return (
    <>
      <header></header>
      <main className='center'>
        <Sidebar />
        <section className='contenue'>
          <Header />
          <div className="p-3 content">
            <div className="stats p-3">
              <h5 className='alert alert-success'>
                <i className='fa fa-line-chart'></i> Statistique générale
              </h5>
              <div className='center'>
                <div className="one p-4 center">
                  <div>
                    <h1><i className='fa fa-bar-chart'></i> 152</h1>
                  </div>
                  <div>
                    <h6>Clients</h6>
                  </div>
                </div>
                <div className="one center">
                  <div>
                    <h1><i className='fa fa-bar-chart'></i> 45</h1>
                  </div>
                  <div>
                    <h6>Fournisseurs</h6>
                  </div>
                </div>
                <div className="one center">
                  <div>
                    <h1><i className='fa fa-bar-chart'></i> 300</h1>
                  </div>
                  <div>
                    <h6>Commandes</h6>
                  </div>
                </div>
                <div className="one center">
                  <div>
                    <h1><i className='fa fa-bar-chart'></i> 120</h1>
                  </div>
                  <div>
                    <h6>Produits</h6>
                  </div>
                </div>
              </div>
            </div>
            <div className='mt-3 center'>
              <div className="chart center p-3">
                <div className="chart1">
                  <LineChart />
                </div>
                <div className="chart2">
                  <DonutChart />
                </div>
              </div>
              <div className="profil">
                {/* Vous pouvez ajouter ici une section profil utilisateur */}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Dashboard;
