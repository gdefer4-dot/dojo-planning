'use strict';
<<<<<<< Updated upstream
const APP_VERSION='V45.3.0';
=======
const APP_VERSION='V45.4.0';
>>>>>>> Stashed changes
const JOURS=["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
let typeActif='fitness';
function echapper(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c];});}
function logoAccueil(){var d=DONNEES.fitness||DONNEES.martial;document.getElementById('homeLogo').innerHTML=d&&d.logo?'<img class="home-logo" src="'+d.logo+'" alt="Logo du Dojo">':'<div class="home-logo" style="display:grid;place-items:center;font-size:42px">🥋</div>';}
function ouvrirPlanning(type){typeActif=type;document.getElementById('home').classList.add('hidden');document.getElementById('view').classList.add('active');rendre(type);window.scrollTo(0,0);}
function retourAccueil(){fermerFiche();document.getElementById('view').classList.remove('active');document.getElementById('home').classList.remove('hidden');window.scrollTo(0,0);}
function iconeActivite(nom,type){if(type==='martial'){if(nom.indexOf('Judo')>=0)return '🥋';if(nom.indexOf('Karat')>=0)return '🥊';if(nom.indexOf('Full')>=0)return '🥊';return '🎯';}var n=nom.toLowerCase();if(n.indexOf('bike')>=0||n.indexOf('biking')>=0)return '🚴';if(n.indexOf('yoga')>=0||n.indexOf('pilates')>=0||n.indexOf('stretch')>=0)return '🧘';if(n.indexOf('box')>=0)return '🥊';if(n.indexOf('zumba')>=0||n.indexOf('move')>=0||n.indexOf('step')>=0)return '🎵';if(n.indexOf('cross')>=0||n.indexOf('rox')>=0)return '🔥';return '🏋️';}
function coachTexte(c){var l=Array.isArray(c&&c.intervenants)?c.intervenants:[];return l.join(' • ');}
function ouvrirFiche(type,index){var d=DONNEES[type];if(!d)return;var c=d.cours[index];if(!c)return;var fiche=d.fiches&&d.fiches[c.activite]?d.fiches[c.activite]:{};var a=(d.activites||[]).find(function(x){return x.nom===c.activite;})||{};var salle=(d.salles||[]).find(function(x){return x.nom===c.salle;})||{};var isMartial=type==='martial';document.getElementById('sheetTitle').textContent=c.activite;document.getElementById('sheetKicker').textContent=isMartial?'Art martial & discipline associée':'Fitness & bien-être';document.getElementById('sheetIcon').textContent=iconeActivite(c.activite,type);document.getElementById('sheetHero').className='sheet-hero'+(isMartial?' martial':'');var coach=coachTexte(c)||fiche.coach||'À renseigner';var quick='<div class="quick-card"><div class="quick-icon">👤</div><span class="sheet-label">Coach</span><div class="sheet-value">'+echapper(coach)+'</div></div><div class="quick-card"><div class="quick-icon">🕒</div><span class="sheet-label">Horaire</span><div class="sheet-value">'+echapper(c.debut)+' - '+echapper(c.fin)+'</div></div><div class="quick-card"><div class="quick-icon">'+echapper(salle.icone||'📍')+'</div><span class="sheet-label">Lieu</span><div class="sheet-value">'+echapper(c.salle)+'</div></div>';if(type==='fitness'){var n=Number(c.intensite||a.intensite||0);quick+='<div class="quick-card"><div class="quick-icon">🔥</div><span class="sheet-label">Intensité</span><div class="sheet-value intensity-large">'+'●'.repeat(n)+'○'.repeat(Math.max(0,4-n))+'</div></div>';}else{quick+='<div class="quick-card"><div class="quick-icon">📅</div><span class="sheet-label">Jour</span><div class="sheet-value">'+echapper(c.jour)+'</div></div>';}document.getElementById('sheetQuick').innerHTML=quick;var desc=document.getElementById('sheetDescription');desc.className='description-card'+(isMartial?' martial':'');desc.innerHTML='<div class="description-title">À propos du cours</div><div class="sheet-description">'+echapper(fiche.description||'Description à renseigner dans le logiciel avant le prochain export.')+'</div>';var slots=(d.cours||[]).filter(function(x){return x.activite===c.activite;}).sort(function(x,y){var a=JOURS.indexOf(x.jour),b=JOURS.indexOf(y.jour);return a-b||x.debut.localeCompare(y.debut);});document.getElementById('sheetTimes').innerHTML='<div class="all-times-title">Tous les créneaux de cette activité</div>'+slots.map(function(x){return '<div class="slot"><span class="slot-day">'+echapper(x.jour)+'</span><span class="slot-time">'+echapper(x.debut)+' - '+echapper(x.fin)+' · '+echapper(x.salle)+'</span></div>';}).join('');document.getElementById('sheetOverlay').classList.add('open');document.getElementById('sheetOverlay').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}
function fermerFiche(){document.getElementById('sheetOverlay').classList.remove('open');document.getElementById('sheetOverlay').setAttribute('aria-hidden','true');document.body.style.overflow='';}
function rendre(type){var d=DONNEES[type];if(!d)return;var activites={};(d.activites||[]).forEach(function(a){activites[a.nom]=a;});var salles={};(d.salles||[]).forEach(function(s){salles[s.nom]=s;});var logo=d.logo?'<img class="brand-logo" src="'+d.logo+'" alt="Logo du Dojo">':'<div class="brand-logo brand-placeholder">🥋</div>';var html='<header class="mobile-header"><div class="brand-row">'+logo+'<div class="brand-title"><h1>'+echapper(d.titre)+'</h1><h2>'+echapper(d.sousTitre)+'</h2><span class="season">SAISON 2026-2027</span></div></div></header>';html+='<section class="muscu-hours"><h3>🏋️ ESPACE MUSCULATION</h3><div class="subtitle">Horaires d’ouverture</div><div class="muscu-grid"><div class="muscu-line"><div class="muscu-day">Lundi</div><div class="muscu-time">13h45 à 20h45</div></div><div class="muscu-line"><div class="muscu-day">Mardi et jeudi</div><div class="muscu-time">08h30 à 20h45</div></div><div class="muscu-line"><div class="muscu-day">Mercredi et vendredi</div><div class="muscu-time">08h30 à 12h00<br>13h45 à 20h45</div></div><div class="muscu-line"><div class="muscu-day">Samedi</div><div class="muscu-time">08h30 à 12h00<br>13h45 à 16h30</div></div><div class="muscu-line"><div class="muscu-day">Dimanche</div><div class="muscu-time">09h00 à 12h00</div></div></div><div class="muscu-access">Accès libre pendant les horaires d’ouverture.</div></section>';JOURS.forEach(function(jour){var liste=[];(d.cours||[]).forEach(function(c,index){if(c.jour===jour){var copie=Object.assign({},c,{__index:index});liste.push(copie);}});liste.sort(function(a,b){return a.debut.localeCompare(b.debut);});if(!liste.length)return;html+='<section class="day"><h3>'+echapper(jour.toUpperCase())+'</h3>';liste.forEach(function(c){var a=activites[c.activite]||{},salle=salles[c.salle]||{},bg=a.couleur||'#e2e8f0',fg=a.couleurTexte||'#111827',intensite='';if(type==='fitness'){var n=Number(c.intensite||a.intensite||0);intensite='<span class="intensity" aria-label="Intensité '+n+' sur 4">'+'●'.repeat(n)+'○'.repeat(Math.max(0,4-n))+'</span>';}html+='<button type="button" class="course" data-type="'+echapper(type)+'" data-index="'+c.__index+'" style="background:'+echapper(bg)+';color:'+echapper(fg)+'"><span class="time">'+echapper(c.debut)+' - '+echapper(c.fin)+'</span><span class="name">'+echapper(c.activite)+'</span>'+(coachTexte(c)?'<span class="coaches">👤 '+echapper(coachTexte(c))+'</span>':'')+'<span class="meta"><span>'+echapper(salle.icone||'📍')+'</span><span>'+echapper(c.salle)+'</span></span>'+intensite+'</button>';});html+='</section>';});html+='<div class="footer-note">Planning susceptible d’évoluer. Consultez cette page pour la dernière version.</div>';document.getElementById('planning').innerHTML=html;}
document.addEventListener('click',function(event){var open=event.target.closest('[data-open]');if(open){ouvrirPlanning(open.getAttribute('data-open'));return;}var course=event.target.closest('.course');if(course){event.preventDefault();ouvrirFiche(course.getAttribute('data-type'),Number(course.getAttribute('data-index')));return;}if(event.target.id==='backButton'){retourAccueil();return;}if(event.target.id==='closeSheet'){fermerFiche();return;}if(event.target.id==='sheetOverlay'){fermerFiche();}});
document.addEventListener('keydown',function(event){if(event.key==='Escape')fermerFiche();});
logoAccueil();

let deferredInstallPrompt = null;

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches ||
         window.navigator.standalone === true;
}

function openInstallHelp() {
  const modal = document.getElementById("installModal");
  modal?.classList.remove("hidden");
  modal?.setAttribute("aria-hidden", "false");
}

function closeInstallHelp() {
  const modal = document.getElementById("installModal");
  modal?.classList.add("hidden");
  modal?.setAttribute("aria-hidden", "true");
}

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstallPrompt = event;
});

document.getElementById("installApp")?.addEventListener("click", async () => {
  if (isStandalone()) {
    alert("Planning Dojo Club est déjà installé.");
    return;
  }

  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    return;
  }

  if (isIOS()) {
    openInstallHelp();
    return;
  }

  alert("Ouvrez cette page dans Safari ou Chrome, puis choisissez « Ajouter à l’écran d’accueil ».");
});

document.getElementById("closeInstallModal")?.addEventListener("click", closeInstallHelp);
document.getElementById("installModal")?.addEventListener("click", event => {
  if (event.target.id === "installModal") closeInstallHelp();
});

window.addEventListener("appinstalled", () => {
  document.getElementById("installZone")?.classList.add("hidden");
});

window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("appSplash")?.classList.add("hide"), 850);

  if (isStandalone()) {
    document.getElementById("installZone")?.classList.add("hidden");
  }

  if ("serviceWorker" in navigator) {
<<<<<<< Updated upstream
    navigator.serviceWorker.register("./service-worker.js?v=4530")
=======
    navigator.serviceWorker.register("./service-worker.js?v=4540")
>>>>>>> Stashed changes
      .then(async registration => {
        await registration.update();
        registration.addEventListener("updatefound", () => {
          const nouveau = registration.installing;
          if (!nouveau) return;
          nouveau.addEventListener("statechange", () => {
            if (nouveau.state === "installed" && navigator.serviceWorker.controller) {
              nouveau.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      })
      .catch(error => console.warn("Service worker non enregistré :", error));

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!window.__dojoReloaded) {
        window.__dojoReloaded = true;
        location.reload();
      }
    });
  }
});
