function normaliserUnites(unitesDisponibles) {
    // Trouver l'unité avec la conversion la plus petite (celle qui sera définie comme référence)
    const uniteDeReference = [...unitesDisponibles].sort((a, b) => a.conversion - b.conversion)[0];
    
    // Mettre la conversion de cette unité de référence à 1
    return unitesDisponibles.map(u => ({
        ...u,
        conversion: u.conversion / uniteDeReference.conversion
    }));
}

function convertirToutesLesUnites(quantite, uniteSource, unitesDisponibles) {
    // Normaliser les unités pour que la plus grande unité ait une conversion = 1
    const unitesNormalisees = normaliserUnites(unitesDisponibles);

    // Trouver l'unité source dans la liste normalisée
    const uniteSourceObj = unitesNormalisees.find(u => u.nom === uniteSource);

    if (!uniteSourceObj) {
        console.error("❌ Erreur: Unité source introuvable !");
        return;
    }

    // Calculer les quantités pour toutes les unités disponibles
    return unitesNormalisees.map(u => ({
        unite: u.nom,
        quantite: quantite * (u.conversion / uniteSourceObj.conversion)
    }));
}

// Exemple d'utilisation
const unites = [
    { nom: "carton", conversion: 1 },  // 1 carton
    { nom: "cartouche", conversion: 10 },  // 1 carton = 10 cartouches
    { nom: "paquet", conversion: 100 }   // 1 carton = 100 paquets
];

// Exemple d'entrée : 2 cartons
const quantite = 1;  
const uniteSource = "cartouche";  // Unité source : carton

// Calculer toutes les conversions
const resultats = convertirToutesLesUnites(quantite, uniteSource, unites);

// Afficher les résultats
resultats.forEach(result => {
    console.log(`${quantite} ${uniteSource} = ${result.quantite} ${result.unite}`);
});
