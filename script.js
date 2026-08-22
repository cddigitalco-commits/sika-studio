// IMPORTANT : remplace ce numéro par ton numéro WhatsApp au format international,
// sans le +, sans espaces et sans le premier 0.
// Exemple Bénin : 229XXXXXXXX
const WHATSAPP_NUMBER = "22957733365";

const form = document.getElementById("orderForm");
const pack = document.getElementById("pack");
const summary = document.getElementById("summary");

document.querySelectorAll(".choose").forEach(btn => {
  btn.addEventListener("click", () => {
    pack.value = btn.dataset.pack;
    document.getElementById("commander").scrollIntoView({behavior:"smooth"});
    updateSummary();
  });
});

function updateSummary(){
  const value = pack.value;
  if(!value){ summary.textContent = "Votre récapitulatif apparaîtra ici."; return; }
  let deposit = "";
  if(value.includes("25 000")) deposit = "12 500 FCFA";
  if(value.includes("45 000")) deposit = "22 500 FCFA";
  if(value.includes("80 000")) deposit = "40 000 FCFA";
  summary.innerHTML = `<strong>${value}</strong><br>Acompte de 50 % : <strong>${deposit}</strong><br>Solde à la livraison.`;
}
pack.addEventListener("change", updateSummary);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if(!WHATSAPP_NUMBER){
    alert("Configure d'abord ton numéro WhatsApp dans le fichier script.js.");
    return;
  }

  const data = new FormData(form);
  const message = `🚀 *NOUVELLE COMMANDE — SIKA STUDIO*

*Nom :* ${data.get("name")}
*WhatsApp :* ${data.get("phone")}
*Produit :* ${data.get("product")}
*Type :* ${data.get("type")}
*Objectif :* ${data.get("goal")}
*Pack :* ${data.get("pack")}
*Lien produit :* ${data.get("link") || "Non fourni"}

*BRIEF :*
${data.get("brief")}

*Paiement :* 50 % à la commande / 50 % à la livraison`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
});
