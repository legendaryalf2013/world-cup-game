async function savePrize() {
  const value = document.getElementById("prizeInput").value.trim();
  if (!value || isNaN(value)) {
    alert("Enter a number");
    return;
  }

  await db.collection("settings").doc("prizeMoney").set({
    value: Number(value)
  });

  document.getElementById("saveStatus").textContent = "Saved!";
}

db.collection("settings").doc("prizeMoney").get().then(doc => {
  if (doc.exists) {
    document.getElementById("prizeInput").value = doc.data().value;
  }
});
