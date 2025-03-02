import React, { useState, useEffect } from "react";
import "../Styles/Achat.css";
import Sidebar from "../Components/Sidebar";

import Header from "../Components/Navbar";
import Swal from "sweetalert2";
import Select from 'react-select';
import HistoriqueAchats from "../Components/HistoriqueAchats";

import axios from '../api/axios';

function AchatProduits() {
    const [fournisseur, setFournisseur] = useState("");
    const [fournisseurs, setFournisseurs] = useState([]);
    const [entrepots, setEntrepots] = useState([]);
    const [entrepot, setEntrepot] = useState([]);
    const [unitesOptions, setUnitesOptions] = useState([]); // État pour les options d'unités
    const [unite, setUnite] = useState(null); // État pour l'unité sélectionnée
    const [prixAchatInitial, setPrixAchatInitial] = useState(0); // Ajoutez cette ligne

    const [panier, setPanier] = useState([]);
    const [panierCreer, setPanierCreer] = useState(false);
    const [produit, setProduit] = useState("");
    const [produite, setProduite] = useState("");
    const [quantite, setQuantite] = useState("");
    const [prixAchat, setPrixAchat] = useState("");
    const [historiqueAchats, setHistoriqueAchats] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [categories, setCategories] = useState([]);
    const [nouvelleCategorie, setNouvelleCategorie] = useState("");
    const [ajouterCategorie, setAjouterCategorie] = useState(false);
    const [panierId, setPanierId] = useState(null);
    const [fourID, setFourID] = useState(null);
    const [achats, setAchats] = useState([]);
    const [typeFiltre, setTypeFiltre] = useState("");
    const [dateFiltre, setDateFiltre] = useState("");
    const [nouveauProduit, setNouveauProduit] = useState({
        nom: "",
        categorie: "",
        description: "",
        prixDachat: "", // Prix d'achat du produit

        fournisseur: fourID,
        unites: [{ nom: "", conversion: 1, prixdevente: 0 }] // Initialiser avec une unité par défaut
    });

    const [afficherFormulaireProduit, setAfficherFormulaireProduit] = useState(false);
    const [produitId, setProduitId] = useState("");
    const [fournisseurInfo, setFournisseurInfo] = useState(null);

    const [pourcentageManuel, setPourcentageManuel] = useState(0);
    const [modePaiement, setModePaiement] = useState('');
    const [dateLimiteCredit, setDateLimiteCredit] = useState('');
    const [referencePaiement, setReferencePaiement] = useState('');


    const handleFournisseurChange = (e) => {
        const selectedFournisseurId = e.target.value;
        setFournisseur(selectedFournisseurId);
        setFourID(selectedFournisseurId);
        console.log("id du fournisseur ", selectedFournisseurId);

        // Trouver les informations du fournisseur sélectionné
        const selectedFournisseur = fournisseurs.find(item => item._id === selectedFournisseurId);
        setFournisseurInfo(selectedFournisseur); // Mettre à jour l'état avec les informations du fournisseur

        setNouveauProduit({ ...nouveauProduit, fournisseur: selectedFournisseurId });
    };
    const quantiteNumerique = Number(quantite); // Assure-toi que quantite est un nombre
    const produitsOfferts = fournisseurInfo && fournisseurInfo.type === "ristourne"
        ? fournisseurInfo.conditions.typeRistourne === "par_produit"
            ? Math.floor((quantiteNumerique * pourcentageManuel) / 100) // Utilise le pourcentage manuel
            : Math.floor((quantiteNumerique * fournisseurInfo.conditions.ristourne) / 100)
        : 0;


    const quantiteTotale = quantiteNumerique + produitsOfferts; // Utiliser quantiteNumerique ici




    const handleProduitChange = async (selectedOption) => {
        if (!selectedOption) return;
        if (selectedOption.value === 'add-new-product') {
            setAfficherFormulaireProduit(true);
            return;
        }
        const produitId = selectedOption.value; // Récupérer l'ID du produit
        console.log("produit", produitId);
        if (!produitId) {
            console.error("ID du produit manquant");
            return;
        }

        setProduitId(produitId);
        setProduit(selectedOption);

        try {
            // Récupérer les détails du produit avec Axios
            const response = await axios.get(`/api/produits/recuperer/${produitId}`);

            if (response.data) {
                setPrixAchatInitial(response.data.prixDachat); // Stocker le prix d'achat initial
                setPrixAchat(response.data.prixDachat);
                // Assurez-vous de récupérer toutes les unités correctement
                const unitOptions = response.data.unites.map(unit => ({
                    label: unit.nom,
                    value: unit.nom,
                    conversion: unit.conversion
                }));
                setUnitesOptions(unitOptions);
                setProduite(response.data);
                // Initialiser la première unité
                setUnite(unitOptions[0]); // Afficher la première unité par défaut
            }
        } catch (error) {
            console.error("Erreur lors de la récupération du produit:", error);
            setPrixAchat(""); // Réinitialiser en cas d'erreur
        }
    };
    const handleUniteChange = (selectedUnit) => {
        console.log("Changement d'unité détecté:", selectedUnit);

        if (!selectedUnit) return;

        // Mettre à jour l'état de l'unité sélectionnée
        setUnite(selectedUnit);

        const factor = selectedUnit.conversion; // Facteur de conversion
        console.log("Prix d'achat initial:", prixAchatInitial);
        console.log("Facteur de conversion:", factor);

        // Vérifiez si l'unité sélectionnée est la plus grande
        if (factor === 1) {
            setPrixAchat(prixAchatInitial); // Si c'est l'unité la plus grande, réinitialisez au prix d'achat initial
        } else {
            const nouveauPrixAchat = prixAchatInitial / factor; // Calculer le nouveau prix d'achat
            setPrixAchat(nouveauPrixAchat);
        }

        console.log("Nouveau prix d'achat:", prixAchat);
    };


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('/api/produits/categories');
                setCategories(response.data); // Mettre à jour l'état avec les données récupérées
            } catch (error) {
                console.error("Erreur lors de la récupération des catégories", error);
            }
        };

        fetchCategories();
    }, []);

    const [produitsOptions, setProduitsOptions] = useState([]);

    const handleAjoutProduit = async (e) => {
        e.preventDefault();

        // Vérifier si toutes les unités ont les champs requis
        const isValidUnits = nouveauProduit.unites.every(unite =>
            unite.nom && unite.conversion > 0
        );

        if (!isValidUnits) {
            Swal.fire({
                icon: 'warning',
                title: 'Erreur de données',
                text: 'Chaque unité doit avoir un nom, un facteur de conversion et un prix de vente.',
            });
            return; // Ne pas continuer si les unités sont invalides
        }

        // Ajouter la nouvelle catégorie si nécessaire
        const categorieFinale = ajouterCategorie ? nouvelleCategorie : nouveauProduit.categorie;

        // Préparer l'objet produit avec les bonnes propriétés
        const produit = {
            nom: nouveauProduit.nom,
            description: nouveauProduit.description,
            categorie: categorieFinale,
            fournisseur: fourID,

            prixDachat: parseFloat(nouveauProduit.prixDachat), // Assurez-vous que c'est un nombre
            unites: nouveauProduit.unites, // Assurez-vous que c'est un tableau d'unités
        };

        console.log("Produit à ajouter:", JSON.stringify(produit, null, 2));

        try {
            // Envoi du produit à l'API pour ajout avec Axios
            const response = await axios.post("/api/produits/ajouter", produit);

            Swal.fire({
                icon: 'success',
                title: 'Produit ajouté avec succès',
                showConfirmButton: true,
                timer: 2000 // Optionnel, pour fermer l'alerte après 2 secondes
            });

            // Réinitialiser le formulaire ici
            setNouveauProduit({
                nom: "",
                description: "",
                prixDachat: "",

                unites: [] // Réinitialiser les unités
            });
            setNouvelleCategorie("");
            setAjouterCategorie(false);
            setAfficherFormulaireProduit(false);

            // Récupérer les produits du fournisseur
            if (fournisseur) {
                const produitsResponse = await axios.get(`/api/produits/fournisseur/${fournisseur}`);
                const data = produitsResponse.data;

                if (Array.isArray(data) && data.length > 0) {
                    const options = data.map((produit) => ({
                        label: `${produit.nom} - ${produit.categorie}`,  // Afficher nom et catégorie
                        value: produit._id,  // Utiliser l'ID comme valeur
                    }));

                    setProduitsOptions(options);
                } else {
                    setProduitsOptions([]);
                    Swal.fire({
                        title: "Erreur",
                        text: "Ce fournisseur n'a pas encore de produit.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                }
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout du produit:", error.response?.data || error.message);
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Une erreur est survenue lors de l\'ajout du produit',
            });
        }
    };






    const handleCategorieChange = (e) => {
        const selectedCategorie = e.target.value;
        setNouveauProduit({ ...nouveauProduit, categorie: selectedCategorie });

        if (selectedCategorie === "ajouter") {
            setAjouterCategorie(true);
        } else {
            setAjouterCategorie(false);
        }
    };

    const fetchAchats = async () => {
        try {
            const response = await axios.get(`/api/achats/panier/${panierId}`);
            const data = response.data;

            // Vérification du statut de la réponse
            if (response.status !== 200) {
                throw new Error(data.message || "Erreur lors de la récupération des achats.");
            }

            setAchats(data.achats);
        } catch (error) {
            console.error("Erreur lors de la récupération des achats :", error);

            // Vérifiez si error.response existe pour obtenir des détails supplémentaires
            const errorMessage = error.response ? error.response.data.message : "Une erreur est survenue.";

            Swal.fire({
                title: "Erreur",
                text: errorMessage,
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };



    useEffect(() => {
        if (fournisseur) {
            const fetchProduits = async () => {
                try {
                    const response = await axios.get(`/api/produits/fournisseur/${fournisseur}`);
                    const data = response.data;

                    if (Array.isArray(data) && data.length > 0) {
                        const options = data.map((produit) => ({
                            label: `${produit.nom} - ${produit.categorie}`,
                            value: produit._id,
                        }));
                        setProduitsOptions(options);
                    } else {
                        // Si la réponse est valide mais qu'il n'y a pas de produits
                        setProduitsOptions([]);
                        Swal.fire({
                            title: "Erreur",
                            text: "Ce fournisseur n'a pas encore de produit.",
                            icon: "error",
                            confirmButtonText: "OK",
                        });
                    }
                } catch (error) {
                    // Vérifie si l'erreur provient d'une réponse 404
                    if (error.response && error.response.status === 404) {
                        Swal.fire({
                            title: "Erreur",
                            text: "Fournisseur non trouvé ou aucun produit disponible.",
                            icon: "error",
                            confirmButtonText: "OK",
                        });
                    } else {
                        // Gérer d'autres types d'erreurs ici
                        Swal.fire({
                            title: "Erreur",
                            text: "Une erreur est survenue lors de la récupération des produits.",
                            icon: "error",
                            confirmButtonText: "OK",
                        });
                    }
                    setProduitsOptions([]);
                    console.error("Erreur lors de la récupération des produits:", error);
                }
            };

            fetchProduits(); // Appeler la fonction asynchrone pour récupérer les produits
        } else {
            setProduitsOptions([]);
        }
    }, [fournisseur]);





    useEffect(() => {
        const fetchFournisseurs = async () => {
            try {
                const response = await axios.get("/api/fournisseurs/tous");
                const data = response.data;

                if (Array.isArray(data) && data.length > 0) {
                    setFournisseurs(data);
                } else {
                    Swal.fire({
                        title: "Erreur",
                        text: "Impossible de récupérer les fournisseurs.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                }
            } catch (error) {
                Swal.fire({
                    title: "Erreur",
                    text: "Une erreur est survenue lors de la récupération des fournisseurs.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        };

        fetchFournisseurs();
    }, []);



    useEffect(() => {
        const fetchEntrepots = async () => {
            try {
                const response = await axios.get("/api/entrepot");
                const data = response.data;

                if (Array.isArray(data) && data.length > 0) {
                    setEntrepots(data);
                } else {
                    Swal.fire({
                        title: "Erreur",
                        text: "Impossible de récupérer les entrepôts.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                }
            } catch (error) {
                Swal.fire({
                    title: "Erreur",
                    text: "Une erreur est survenue lors de la récupération des entrepôts.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        };

        fetchEntrepots();
    }, []);


    const handleEntrepotChange = (e) => {
        const selectedEntrepot = e.target.value;
        setEntrepot(selectedEntrepot);
        console.log("lid de lentreopt", selectedEntrepot);

    };
    const creerNouveauPanier = async () => {
        setPanierCreer(true);
        const panierData = {
            fournisseur,
            produits: panier,
        };

        try {
            const response = await axios.post("/api/paniers/ajouter", panierData);

            const data = response.data;
            console.log("Réponse API complète :", data);

            if (data?.message === "Panier créé avec succès" && data.panier?._id) {
                setPanierId(data.panier._id);

                setPanier([]);
                setFournisseur("");

                Swal.fire({
                    title: "Succès",
                    text: "Votre panier a été créé avec succès !",
                    icon: "success",
                    confirmButtonText: "OK",
                });
            } else {
                throw new Error(data.message || "Impossible de créer le panier.");
            }
        } catch (error) {
            console.error("Erreur lors de la requête :", error);
            Swal.fire({
                title: "Erreur",
                text: error.message || "Une erreur est survenue lors de la création du panier.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };
    const handlePrixAchatChange = (e) => {
        const newPrixAchat = e.target.value;
        setPrixAchat(newPrixAchat);
    };



    const ajouterAuPanier = async () => {
        const quantiteNumerique = Number(quantite);

        // Vérification que la quantité est un nombre valide
        if (isNaN(quantiteNumerique) || quantiteNumerique <= 0) {
            Swal.fire({
                title: "Erreur",
                text: "La quantité doit être un nombre valide et supérieur à 0.",
                icon: "warning",
                confirmButtonText: "OK",
            });
            return;
        }

        console.log("Produit avant l'accès aux unités :", produite);


        // Vérifiez si le prix d'achat a été modifié manuellement
        if (prixAchat !== prixAchatInitial) {
            try {
                const uniT = unite.value;
                // Mettez à jour le produit avec le nouveau prix d'achat
                await axios.put(`/api/produits/produits/maodi/${produitId}`, { prixDachat: prixAchat, uniteNom: uniT });
                console.log("Prix d'achat mis à jour :", prixAchat);


            } catch (error) {
                console.error("Erreur lors de la mise à jour du prix d'achat :", error);
                Swal.fire({
                    title: "Erreur",
                    text: "Erreur lors de la mise à jour du prix d'achat.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
                return; // Sortir de la fonction si la mise à jour échoue
            }
        }

        console.log("ID du panier avant envoi :", panierId);

        // Assurez-vous d'envoyer le nom de l'unité sous forme de chaîne
        const achatData = {
            fournisseur: fournisseur,
            panierId: panierId,
            produit: produitId,
            quantite: quantiteNumerique,
            prixAchat: prixAchat,
            dateAchat: new Date().toISOString(),
            ristourneAppliquee: pourcentageManuel,
            unite: unite.value || unite.label, // Changez ici pour envoyer le nom de l'unité
        };

        try {
            const response = await axios.post("/api/achats/ajouter", achatData);
            const data = response.data;

            // Vérifier si la réponse contient un achat
            if (data.achat) {
                console.log("Données envoyées pour création de l'achat :", data);

                // Afficher les produits offerts si disponible
                if (data.achat.produitsOfferts > 0) {
                    Swal.fire({
                        title: "Succès",
                        text: `Achat ajouté avec succès. 🎁 Vous avez reçu ${data.achat.produitsOfferts} produits offerts !`,
                        icon: "success",
                        confirmButtonText: "OK",
                    });
                } else {
                    Swal.fire({
                        title: "Succès",
                        text: "Achat ajouté avec succès.",
                        icon: "success",
                        confirmButtonText: "OK",
                    });
                }

                fetchAchats();

                // Réinitialisation des champs après succès
                setFournisseur("");
                setQuantite("");
                setPrixAchat("");
                setProduit("");
                setUnite(""); // Réinitialisez également l'unité
            } else {
                throw new Error("Erreur lors de la création de l'achat");
            }

        } catch (error) {
            console.error("Erreur lors de la création de l'achat :", error);
            // Affichage des détails de l'erreur si disponibles
            if (error.response) {
                Swal.fire({
                    title: "Erreur",
                    text: error.response.data.message || "Une erreur est survenue.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            } else {
                Swal.fire({
                    title: "Erreur",
                    text: error.message || "Une erreur est survenue.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        }
    };
    const handleModePaiementChange = (e) => {
        setModePaiement(e.target.value);
        if (e.target.value !== 'a crédit') {
            setDateLimiteCredit(''); // Réinitialiser la date limite de crédit si le mode de paiement n'est pas à crédit
        }
        if (e.target.value !== 'virement bancaire' && e.target.value !== 'mobile money') {
            setReferencePaiement(''); // Réinitialiser la référence de paiement si le mode de paiement n'est pas virement ou mobile money
        }
    };

    const handleDateLimiteCreditChange = (e) => {
        setDateLimiteCredit(e.target.value);
    };

    const handleReferencePaiementChange = (e) => {
        setReferencePaiement(e.target.value);
    };



    const validerPanier = async () => {
        if (!entrepot || !modePaiement) {
            Swal.fire({
                title: "Erreur",
                text: "L'entrepôt et le mode de paiement sont obligatoires.",
                icon: "error",
                confirmButtonText: "OK",
            });
            return;
        }
    
        // Si modePaiement est à crédit, vérifier la date limite
        if (modePaiement === 'a crédit' && !dateLimiteCredit) {
            Swal.fire({
                title: "Erreur",
                text: "La date limite de crédit est obligatoire pour un paiement à crédit.",
                icon: "error",
                confirmButtonText: "OK",
            });
            return;
        }
    
        // Si modePaiement est virement bancaire ou mobile money, vérifier la référence
        if ((modePaiement === 'virement bancaire' || modePaiement === 'mobile money') && !referencePaiement) {
            Swal.fire({
                title: "Erreur",
                text: "La référence du paiement est obligatoire pour ce mode de paiement.",
                icon: "error",
                confirmButtonText: "OK",
            });
            return;
        }
    
        try {
            const response = await axios.post(`/api/achats/valider/${panierId}`, {
                entrepotId: entrepot, // Envoie des données ici
                modePaiement: modePaiement,
                dateLimiteCredit: dateLimiteCredit,
                referencePaiement: referencePaiement,
            });
    
            if (response.status !== 200) {
                throw new Error(response.data.message || "Erreur lors de la validation de l'achat");
            }
    
            Swal.fire({
                title: "Panier validé",
                text: "Votre achat a été effectué avec succès. Les produits sont stockés dans l'entrepôt choisi.",
                icon: "success",
                confirmButtonText: "OK",
            }).then(() => {
                window.location.reload();
            });
        } catch (error) {
            console.error("Erreur lors de la validation de l'achat :", error);
            Swal.fire({
                title: "Erreur",
                text: error.response ? error.response.data.message : "Une erreur est survenue.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };
    
    


    const filteredHistorique = historiqueAchats.filter((achat) => {
        const matchesFournisseur = achat.fournisseur.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFiltre ? achat.produits.some((p) => p.type === typeFiltre) : true;
        const matchesDate = dateFiltre ? achat.date.includes(dateFiltre) : true;
        return matchesFournisseur && matchesType && matchesDate;
    });




    const getFilteredAndSortedProducts = () => {
        const filteredProducts = nomsProduits.filter((product) =>
            product.nom.toLowerCase().includes(searchTerm.toLowerCase())
        );


        return filteredProducts.sort((a, b) => {
            const matchA = a.nom.toLowerCase().startsWith(searchTerm.toLowerCase()) ? 0 : 1;
            const matchB = b.nom.toLowerCase().startsWith(searchTerm.toLowerCase()) ? 0 : 1;
            return matchA - matchB;
        });
    };



    const customNoOptionMessage = (
        <button
            className="btn btn-link mt-1"
            onClick={() => setAfficherFormulaireProduit(true)}
        >
            Ajouter un Nouveau Produit
        </button>
    );
    const produitsOptionsWithAddOption = [
        ...produitsOptions,
        { label: 'Ajouter un Nouveau Produit', value: 'add-new-product' }
    ];






    return (
        <>
            <header></header>
            <main className="center">
                <Sidebar />
                <section className="contenue">
                    <Header />
                    <div className="p-3 content center">
                        <div className="mini-stat p-3">
                            <h6 className="alert alert-success">
                                <i className="fa fa-shopping-cart"></i> Achat Fournisseur
                            </h6>
                            {!panierCreer && (
                                <div className="filtrage bg-light p-3 mt-3">
                                    <button className="btn btn-success btn-lg" onClick={creerNouveauPanier}>
                                        Créer un Nouveau Panier
                                    </button>

                                </div>
                            )}

                            {!panierCreer && (
                                <HistoriqueAchats
                                    historiqueAchats={historiqueAchats}
                                    searchTerm={searchTerm}
                                    typeFiltre={typeFiltre}
                                    dateFiltre={dateFiltre}
                                />
                            )}

                            {panierCreer && (
                                <div className="achat-container">
                                    <div className="fournisseur-section">
                                        <h6><i className="fa fa-truck"></i> Sélection du Fournisseur</h6>
                                        <select
                                            className="form-control mt-3"
                                            value={fournisseur}
                                            onChange={handleFournisseurChange}
                                        >
                                            <option value="">Choisir un fournisseur</option>
                                            {fournisseurs.map((fournisseurItem) => (
                                                <option key={fournisseurItem._id} value={fournisseurItem._id}>
                                                    {fournisseurItem.nom}
                                                </option>
                                            ))}
                                        </select>

                                        {fournisseurInfo && (
                                            <div className="fournisseur-info mt-3">
                                                {fournisseurInfo.type === "ristourne" ? (
                                                    <>
                                                        <p className="alert alert-info">Fournisseur avec ristourne disponible</p>
                                                        <p>
                                                            Type de Ristourne : <strong>{fournisseurInfo.conditions.typeRistourne === "par_produit" ? "Ristourne par produit" : fournisseurInfo.conditions.typeRistourne === "générale" ? "Ristourne Générale" : fournisseurInfo.conditions.typeRistourne}</strong>
                                                        </p>

                                                        {fournisseurInfo.conditions.typeRistourne === "par_produit" && (
                                                            <div className="input-pourcentage">
                                                                <label>Pourcentage de Ristourne Manuelle :</label>
                                                                <input
                                                                    type="number"
                                                                    className="form-control mt-2 small-input" // Ajoute une classe CSS personnalisée
                                                                    value={pourcentageManuel}
                                                                    onChange={(e) => setPourcentageManuel(Number(e.target.value))}
                                                                    placeholder="%"
                                                                />

                                                            </div>
                                                        )}

                                                        {fournisseurInfo.conditions.ristourne > 0 && (
                                                            <p>Pourcentage de Ristourne : <strong>{fournisseurInfo.conditions.ristourne} %</strong></p>
                                                        )}

                                                        {quantiteNumerique > 0 && (
                                                            <>
                                                                <p>Quantité achetée : <strong>{quantiteNumerique}</strong></p>
                                                                <p>Produits offerts : <strong>{produitsOfferts}</strong></p>
                                                                <p>Quantité totale : <strong>{quantiteTotale}</strong></p>
                                                            </>
                                                        )}
                                                    </>
                                                ) : (
                                                    <p className="alert alert-warning">Fournisseur sans ristourne</p>
                                                )}
                                            </div>
                                        )}
                                    </div>


                                    {/* Formulaire d'ajout de produit visible après avoir cliqué sur "Ajouter un Nouveau Produit" */}
                                    {afficherFormulaireProduit ? (
                                        <div className="produit-section mt-3 p-4 border rounded shadow">
                                            <h6 className="mb-3"><i className="fa fa-box"></i> Ajouter un Nouveau Produit</h6>

                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    className="form-control mt-2"
                                                    placeholder="Nom du produit"
                                                    value={nouveauProduit.nom}
                                                    onChange={(e) => setNouveauProduit({ ...nouveauProduit, nom: e.target.value })}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    className="form-control mt-2"
                                                    placeholder="Description du produit"
                                                    value={nouveauProduit.description}
                                                    onChange={(e) => setNouveauProduit({ ...nouveauProduit, description: e.target.value })}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <select
                                                    className="form-control mt-3"
                                                    value={nouveauProduit.categorie}
                                                    onChange={handleCategorieChange}
                                                >
                                                    <option value="">Choisir une catégorie</option>
                                                    {categories.map((categorie, index) => (
                                                        <option key={index} value={categorie}>{categorie}</option>
                                                    ))}
                                                    <option value="ajouter">Ajouter une nouvelle catégorie</option>
                                                </select>
                                            </div>

                                            {ajouterCategorie && (
                                                <div className="form-group">
                                                    <input
                                                        type="text"
                                                        className="form-control mt-2"
                                                        placeholder="Ajouter une nouvelle catégorie"
                                                        value={nouvelleCategorie}
                                                        onChange={(e) => setNouvelleCategorie(e.target.value)}
                                                    />
                                                </div>
                                            )}

                                            <div className="form-group">
                                                <input
                                                    type="number"
                                                    className="form-control mt-2"
                                                    placeholder="Prix d'achat du produit"
                                                    value={nouveauProduit.prixDachat}
                                                    onChange={(e) => setNouveauProduit({ ...nouveauProduit, prixDachat: e.target.value })}
                                                />
                                            </div>


                                            {/* Gestion des unités */}
                                            <h6 className="mt-3">Unités</h6>
                                            {nouveauProduit.unites.map((unite, index) => (
                                                <div key={index} className="unite-section mt-2 border rounded p-3">
                                                    <div className="form-group">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Nom de l'unité"
                                                            value={unite.nom}
                                                            onChange={(e) => {
                                                                const updatedUnites = [...nouveauProduit.unites];
                                                                updatedUnites[index].nom = e.target.value;
                                                                setNouveauProduit({ ...nouveauProduit, unites: updatedUnites });
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <input
                                                            type="number"
                                                            className="form-control mt-2"
                                                            placeholder="Conversion"
                                                            value={unite.conversion}
                                                            onChange={(e) => {
                                                                const updatedUnites = [...nouveauProduit.unites];
                                                                updatedUnites[index].conversion = e.target.value;
                                                                setNouveauProduit({ ...nouveauProduit, unites: updatedUnites });
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <input
                                                            type="number"
                                                            className="form-control mt-2"
                                                            placeholder="Prix de vente"
                                                            value={unite.prixdevente}
                                                            onChange={(e) => {
                                                                const updatedUnites = [...nouveauProduit.unites];
                                                                updatedUnites[index].prixdevente = e.target.value;
                                                                setNouveauProduit({ ...nouveauProduit, unites: updatedUnites });
                                                            }}
                                                        />
                                                    </div>
                                                    <button
                                                        className="btn btn-danger mt-2"
                                                        onClick={() => {
                                                            const updatedUnites = nouveauProduit.unites.filter((_, i) => i !== index);
                                                            setNouveauProduit({ ...nouveauProduit, unites: updatedUnites });
                                                        }}
                                                    >
                                                        Supprimer cette unité
                                                    </button>
                                                </div>
                                            ))}

                                            {/* Affichage des conversions */}
                                            <div className="conversion-display mt-3">
                                                {nouveauProduit.unites.length > 0 && (
                                                    <p>
                                                        {nouveauProduit.unites.reduce((acc, unite, index) => {
                                                            if (index === 0) {
                                                                return `1 ${unite.nom}`;
                                                            }
                                                            const conversionValue = unite.conversion || 0;
                                                            return `${acc} = ${conversionValue} ${unite.nom}`;
                                                        }, '')}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="button-group mt-3" style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => setNouveauProduit({ ...nouveauProduit, unites: [...nouveauProduit.unites, { nom: '', conversion: 0, prixdevente: 0 }] })}
                                                >
                                                    Ajouter une unité
                                                </button>

                                                <button
                                                    className="btn btn-primary"
                                                    onClick={handleAjoutProduit}
                                                >
                                                    Ajouter
                                                </button>

                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() => setAfficherFormulaireProduit(false)}
                                                >
                                                    Annuler
                                                </button>
                                            </div>



                                        </div>



                                    ) : (
                                        <div className="produit-section mt-3">
                                            <h6><i className="fa fa-box"></i> Choisir un Produit</h6>
                                            <Select
                                                className="form-control mt-3"
                                                value={produit ? { label: produit.label, value: produit.label } : null}
                                                onChange={handleProduitChange}
                                                options={produitsOptionsWithAddOption}
                                                placeholder="Choisir un produit"
                                                isSearchable
                                                noOptionsMessage={() => customNoOptionMessage}
                                                isDisabled={!fournisseur}
                                            />

                                            <div className="quantite-section mt-3 d-flex align-items-center">
                                                <input
                                                    type="number"
                                                    className="form-control me-2"
                                                    placeholder="Quantité"
                                                    value={quantite}
                                                    onChange={(e) => setQuantite(e.target.value)}
                                                />
                                            </div>

                                            {/* Sélection de l'unité */}
                                            <div className="unite-section mt-3">
                                                <Select
                                                    className="form-control"
                                                    value={unite} // Assurez-vous que unite a la bonne structure
                                                    onChange={handleUniteChange} // Gère le changement d'unité
                                                    options={unitesOptions} // Options des unités récupérées du produit
                                                    placeholder="Choisir une unité"
                                                    isSearchable
                                                    isDisabled={!fournisseur || !unitesOptions.length} // Désactiver si aucun produit n'est sélectionné
                                                />

                                            </div>

                                            <input
                                                type="number"
                                                className="form-control mt-3"
                                                placeholder="Prix d'achat"
                                                value={prixAchat !== undefined && prixAchat !== null ? prixAchat : ''}
                                                onChange={handlePrixAchatChange}
                                                disabled={!fournisseur}
                                            />

                                            <button className="btn btn-primary mt-3" onClick={ajouterAuPanier}>Ajouter au Panier</button>
                                        </div>








                                    )}
                                </div>








                            )}

                            {panierCreer && (
                                <div className="consultationL mt-3">
                                    <h6><i className="fa fa-shopping-basket"></i> Panier</h6>
                                    <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
                                        <table id="table-to-export" className="tableSo table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Produit</th>
                                                    <th>Quantité Initiale</th>
                                                    {fournisseurInfo?.type === "ristourne" && (
                                                        <>
                                                            <th>Produits offerts</th>
                                                            <th>Quantité Finale</th>
                                                        </>
                                                    )}
                                                    <th>Unité</th>
                                                    <th>Prix d'Achat</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {achats.map((achat) => (
                                                    <tr key={achat._id}>
                                                        <td>{achat.produit?.nom || "Produit inconnu"}</td>
                                                        <td>{achat.quantite}</td>
                                                        {fournisseurInfo?.type === "ristourne" && (
                                                            <>
                                                                <td>{achat.quantiteTotale - achat.quantite}</td>
                                                                <td>{achat.quantiteTotale}</td>
                                                            </>
                                                        )}
                                                        <td>{achat.unite || "Unité"}</td>
                                                        <td>{achat.prixAchat} Ar</td>
                                                        <td>{achat.total} Ar</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="total-validation-container">
                                        <h6 className="total-text" >Total: {achats.reduce((acc, achat) => acc + achat.total, 0)} Ar</h6>
                                        <div className="fournisseur-section">
                                            <h6><i className="fa fa-truck"></i> Sélection de l'entrepôt</h6>
                                            <select
                                                className="form-control custom-select"
                                                value={entrepot}
                                                onChange={handleEntrepotChange}
                                            >
                                                <option value="">Choisir un entrepôt</option>
                                                {entrepots.map((entrepotItem) => (
                                                    <option key={entrepotItem._id} value={entrepotItem._id}>
                                                        {entrepotItem.nom}
                                                    </option>
                                                ))}
                                            </select>

                                            {/* Sélectionner le mode de paiement */}
                                            <select
                                                className="form-control custom-select"
                                                value={modePaiement}
                                                onChange={handleModePaiementChange}
                                            >
                                                <option value="">Choisir mode de paiement</option>
                                                <option value="crédit">A crédit</option>
                                                <option value="virement bancaire">Virement bancaire</option>
                                                <option value="mobile money">Mobile Money</option>
                                                <option value="espèce">Espèce</option>
                                            </select>

                                            {/* Date limite de crédit (afficher uniquement si modePaiement est à crédit) */}
                                            {modePaiement === 'crédit' && (
                                                <input
                                                    type="date"
                                                    placeholder="Entrer la date limite"
                                                    className="form-control"
                                                    value={dateLimiteCredit}
                                                    onChange={handleDateLimiteCreditChange}
                                                />
                                            )}

                                            {/* Référence de paiement (afficher si modePaiement est virement ou mobile money) */}
                                            {(modePaiement === 'virement bancaire' || modePaiement === 'mobile money') && (
                                                <input
                                                    type="text"
                                                    placeholder="Entrer la référence du paiement"
                                                    className="form-control"
                                                    value={referencePaiement}
                                                    onChange={handleReferencePaiementChange}
                                                />
                                            )}
                                        </div>

                                        <div className="button-group" style={{ display: 'flex', gap: '10px' }}>
                                            <button className="btn7" onClick={validerPanier}>
                                                Valider l'Achat
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                </section>
            </main>
        </>
    );
}

export default AchatProduits;
