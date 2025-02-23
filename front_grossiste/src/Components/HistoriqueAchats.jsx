import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Assurez-vous d'importer le CSS de Bootstrap

const HistoriqueAchats = () => {
  const [historique, setHistorique] = useState([]);
  const [filteredHistorique, setFilteredHistorique] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFiltre, setTypeFiltre] = useState("");
  const [dateFiltre, setDateFiltre] = useState("");
  const [categories, setCategories] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFournisseur, setSelectedFournisseur] = useState("");

  useEffect(() => {
    const fetchHistorique = async () => {
      const response = await fetch("http://localhost:5000/api/achats/afficher");
      const data = await response.json();
      setHistorique(data);
      setFilteredHistorique(data);

      // Extraire les catégories et les fournisseurs
      const uniqueCategories = [...new Set(data.map((achat) => achat.produit.categorie))];
      const uniqueFournisseurs = [...new Set(data.map((achat) => achat.fournisseur.nom))];

      setCategories(uniqueCategories);
      setFournisseurs(uniqueFournisseurs);
    };

    fetchHistorique();
  }, []);

  useEffect(() => {
    const filteredData = historique.filter((achat) => {
      const matchesSearchTerm = achat.produit.nom.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTypeFiltre = typeFiltre ? achat.produit.categorie === typeFiltre : true;
      const matchesDateFiltre = dateFiltre ? new Date(achat.dateAchat).toLocaleDateString() === new Date(dateFiltre).toLocaleDateString() : true;
      const matchesCategory = selectedCategory ? achat.produit.categorie === selectedCategory : true;
      const matchesFournisseur = selectedFournisseur ? achat.fournisseur.nom === selectedFournisseur : true;

      return matchesSearchTerm && matchesTypeFiltre && matchesDateFiltre && matchesCategory && matchesFournisseur;
    });

    setFilteredHistorique(filteredData);
  }, [searchTerm, typeFiltre, dateFiltre, selectedCategory, selectedFournisseur, historique]);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Historique des Achats</h1>
      <div className="mb-3 row">
  
  <div className="col-12 col-md-3 mb-2">
    <input
      type="text"
      className="form-control"
      placeholder="Rechercher par nom de produit"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
  <div className="col-12 col-md-3 mb-2">
    <select
      className="form-select"
      onChange={(e) => setSelectedCategory(e.target.value)}
      value={selectedCategory}
    >
      <option value="">Sélectionner une catégorie</option>
      {categories.map((category, index) => (
        <option key={index} value={category}>
          {category}
        </option>
      ))}
    </select>
  </div>
  <div className="col-12 col-md-3 mb-2">
    <select
      className="form-select"
      onChange={(e) => setSelectedFournisseur(e.target.value)}
      value={selectedFournisseur}
    >
      <option value="">Sélectionner un fournisseur</option>
      {fournisseurs.map((fournisseur, index) => (
        <option key={index} value={fournisseur}>
          {fournisseur}
        </option>
      ))}
    </select>
  </div>
  <div className="col-12 col-md-3 mb-2">
    <input
      type="date"
      className="form-control"
      value={dateFiltre}
      onChange={(e) => setDateFiltre(e.target.value)}
    />
  </div>
</div>


      <div className="table-container" style={{ overflowX: 'auto',overflowY:'auto' }}>
      <table className="tableA table-striped">
        <thead>
          <tr>
  
            <th>Produit</th>
            <th>Fournisseur</th>
            <th>Quantité</th>
            <th>Prix d'Achat</th>
            <th>Total</th>
            <th>Date d'Achat</th>
          </tr>
        </thead>
        <tbody>
          {filteredHistorique.map((achat) => (
            <tr key={achat._id}>
    
              <td>{achat.produit.nom}</td>
              <td>{achat.fournisseur.nom}</td>
              <td>{achat.quantite}</td>
              <td>{achat.prixAchat}</td>
              <td>{achat.total}</td>
              <td>{new Date(achat.dateAchat).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default HistoriqueAchats;
