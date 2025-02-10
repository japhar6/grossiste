import React from "react";
import "../Styles/Achat.css";
function HistoriqueAchats({ historiqueAchats, searchTerm, typeFiltre, dateFiltre }) {
  const filteredHistorique = historiqueAchats.filter((achat) => {
    const matchesFournisseur = achat.fournisseur.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFiltre ? achat.produits.some((p) => p.type === typeFiltre) : true;
    const matchesDate = dateFiltre ? achat.date.includes(dateFiltre) : true;
    return matchesFournisseur && matchesType && matchesDate;
  });

  return (
    <div className="historique-section mt-3">
      <h6>Historique des Achats</h6>
      <div className="filtrage bg-light p-3 mt-3">
        <h6 className="fw-bold">
          <i className="fa fa-search"></i> Filtrage
        </h6>
        <form className="center">
          <input
            type="text"
            className="form-control p-2 mt-3 m-2"
            placeholder="Recherche par fournisseur"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-control mt-3 m-2 p-2"
            value={typeFiltre}
            onChange={(e) => setTypeFiltre(e.target.value)}
          >
            {/* Options du filtre */}
          </select>
          <input
            type="date"
            className="form-control mt-3 m-2 p-2"
            value={dateFiltre}
            onChange={(e) => setDateFiltre(e.target.value)}
          />
        </form>
      </div>

      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>Fournisseur</th>
            <th>Date</th>
            <th>Produit</th>
            <th>Type</th>
            <th>Quantité</th>
            <th>Total</th>
            <th>Détails</th>
          </tr>
        </thead>
        <tbody>
          {filteredHistorique.map((achat, index) => (
            achat.produits.map((produit, idx) => (
              <tr key={`${index}-${idx}`}>
                {idx === 0 && (
                  <td rowSpan={achat.produits.length}>{achat.fournisseur}</td>
                )}
                {idx === 0 && (
                  <td rowSpan={achat.produits.length}>{achat.date}</td>
                )}
                <td>{produit.produit}</td>
                <td>{produit.type || "Non défini"}</td>
                <td>{produit.quantite}</td>
                <td>{produit.total} Ar</td>
                {idx === 0 && (
                  <td rowSpan={achat.produits.length}>
                    <button className="btn btn-info">Voir Détails</button>
                  </td>
                )}
              </tr>
            ))
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HistoriqueAchats;
