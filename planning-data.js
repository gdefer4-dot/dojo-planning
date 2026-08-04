const JOURS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche"
];

const FITNESS_SALLES = [
  { nom: "Grand Dojo", icone: "🥋" },
  { nom: "Petit Dojo", icone: "⛩️" },
  { nom: "Salle Kerkhove", icone: "🏢" }
];

const FITNESS_ACTIVITES = [
  { nom: "Stretching", duree: 45, intensite: 2, couleur: "#b9e9ff", couleurTexte: "#07111f" },
  { nom: "Pilates", duree: 45, intensite: 3, couleur: "#ffe28a", couleurTexte: "#111827" },
  { nom: "Yoga", duree: 60, intensite: 2, couleur: "#aee4ff", couleurTexte: "#07111f" },
  { nom: "Yogalate", duree: 45, intensite: 2, couleur: "#b9e9ff", couleurTexte: "#07111f" },

  { nom: "Biking", duree: 45, intensite: 4, couleur: "#ffaca6", couleurTexte: "#111827" },
  { nom: "Cardio Box", duree: 60, intensite: 4, couleur: "#ffaca6", couleurTexte: "#111827" },

  { nom: "Cross Training", duree: 60, intensite: 4, couleur: "#ffaca6", couleurTexte: "#111827" },
  { nom: "Circuit Training ADO 12-16 ans", duree: 45, intensite: 3, couleur: "#ffc475", couleurTexte: "#111827" },
  { nom: "Fit Rox / Crosstraining", duree: 60, intensite: 4, couleur: "#ffaca6", couleurTexte: "#111827" },

  { nom: "Body Sculpt", duree: 30, intensite: 3, couleur: "#ffc475", couleurTexte: "#111827" },
  { nom: "Abdos", duree: 30, intensite: 3, couleur: "#ffc475", couleurTexte: "#111827" },
  { nom: "Abdos Flash", duree: 30, intensite: 3, couleur: "#ffc475", couleurTexte: "#111827" },
  { nom: "Cuisses Fessiers", duree: 30, intensite: 3, couleur: "#ffc475", couleurTexte: "#111827" },
  { nom: "Cuisses Abdos Fessiers", duree: 45, intensite: 3, couleur: "#ffc475", couleurTexte: "#111827" },

  { nom: "Body Move", duree: 45, intensite: 3, couleur: "#d8c4ff", couleurTexte: "#111827" },
  { nom: "Body Move Kids", duree: 45, intensite: 2, couleur: "#d8c4ff", couleurTexte: "#111827" },
  { nom: "Body Move Seniors", duree: 30, intensite: 2, couleur: "#d8c4ff", couleurTexte: "#111827" },
  { nom: "Step", duree: 45, intensite: 3, couleur: "#d8c4ff", couleurTexte: "#111827" },
  { nom: "Zumba", duree: 60, intensite: 3, couleur: "#d8c4ff", couleurTexte: "#111827" },

  { nom: "Gym Douce", duree: 45, intensite: 1, couleur: "#c7f3b8", couleurTexte: "#111827" },
  { nom: "Gym Bien-être", duree: 45, intensite: 1, couleur: "#c7f3b8", couleurTexte: "#111827" },
  { nom: "Gym Ball", duree: 45, intensite: 1, couleur: "#c7f3b8", couleurTexte: "#111827" },
  { nom: "Mobilité / Bike", duree: 30, intensite: 1, couleur: "#c7f3b8", couleurTexte: "#111827" }
];

const FITNESS_PLANNING_DEFAUT = [
  { jour: "Lundi", debut: "17:15", fin: "18:00", activite: "Stretching", intensite: 2, salle: "Grand Dojo" },
  { jour: "Lundi", debut: "18:00", fin: "18:45", activite: "Biking", intensite: 4, salle: "Petit Dojo" },
  { jour: "Mardi", debut: "17:15", fin: "18:00", activite: "Body Move", intensite: 3, salle: "Salle Kerkhove" }
];


/* =========================================================
   V27 - SECOND PLANNING : ARTS MARTIAUX
   Le contenu est volontairement prêt à être complété.
   ========================================================= */

const MARTIAL_SALLES = [
  { nom: "Grand Dojo", icone: "🥋" },
  { nom: "Petit Dojo", icone: "⛩️" },
  { nom: "Salle Kerkhove", icone: "🏢" }
];

const MARTIAL_ACTIVITES = [
  { nom: "PPG Arts Martiaux + de 12 ans", duree: 60, intensite: 4, couleur: "#c9a7ff", couleurTexte: "#24123d" },

  { nom: "JUDO 6/12 ans", duree: 60, intensite: 3, couleur: "#a8dcff", couleurTexte: "#08233f" },
  { nom: "JUDO + 12 ans", duree: 90, intensite: 4, couleur: "#74c4f2", couleurTexte: "#06223a" },
  { nom: "Judo 6/8 ans", duree: 60, intensite: 2, couleur: "#bde7ff", couleurTexte: "#08233f" },
  { nom: "Judo Kata Technique", duree: 60, intensite: 2, couleur: "#8fd1f5", couleurTexte: "#08233f" },

  { nom: "Full Contact", duree: 60, intensite: 4, couleur: "#ff9f99", couleurTexte: "#3f0d0d" },

  { nom: "Éveil Kids 3/4 ans", duree: 45, intensite: 1, couleur: "#bdecae", couleurTexte: "#173617" },
  { nom: "Éveil Kids 15/36 mois", duree: 45, intensite: 1, couleur: "#d5f5c8", couleurTexte: "#173617" },
  { nom: "Éveil judo 4/5 ans", duree: 45, intensite: 1, couleur: "#c8efb8", couleurTexte: "#173617" },
  { nom: "Éveil Karaté 5/6 ans", duree: 45, intensite: 1, couleur: "#aee39d", couleurTexte: "#173617" },

  { nom: "Karaté 7/11 ans", duree: 60, intensite: 3, couleur: "#ffe08a", couleurTexte: "#3b2900" },
  { nom: "Karaté", duree: 60, intensite: 3, couleur: "#ffc86b", couleurTexte: "#3b2000" },
  { nom: "Karaté technique", duree: 60, intensite: 2, couleur: "#ffb85c", couleurTexte: "#3b2000" }
];

/* Planning vide au départ : les cours seront ajoutés depuis le menu. */
const MARTIAL_PLANNING_DEFAUT = [];

const PLANNING_CONFIGS = {
  fitness: {
    label: "Fitness & Bien-être",
    titre: "FITNESS",
    sousTitre: "& BIEN-ÊTRE",
    storageKey: "planning-fitness-dojo-v2",
    settingsKey: "planning-fitness-dojo-settings-v5",
    salles: FITNESS_SALLES,
    activites: FITNESS_ACTIVITES,
    planningDefaut: FITNESS_PLANNING_DEFAUT
  },
  martial: {
    label: "Arts martiaux",
    titre: "ARTS MARTIAUX",
    sousTitre: "& DISCIPLINES ASSOCIÉES",
    storageKey: "planning-arts-martiaux-dojo-v1",
    settingsKey: "planning-arts-martiaux-dojo-settings-v1",
    salles: MARTIAL_SALLES,
    activites: MARTIAL_ACTIVITES,
    planningDefaut: MARTIAL_PLANNING_DEFAUT
  }
};

/* Variables actives, remplacées lors du changement de planning. */
let SALLES = FITNESS_SALLES;
let ACTIVITES = FITNESS_ACTIVITES;
let PLANNING_DEFAUT = FITNESS_PLANNING_DEFAUT;
