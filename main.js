const _WEBHOOK_URL = "https://creative-automation-tool.marketing-e01.workers.dev/"

const btnGenerate = document.getElementById("btn-headline");
const spinner = document.getElementById("spinner-headline");

const btnButton = document.getElementById("btn-button");
const spinnerButton = document.getElementById("spinner-button");

const submitBtn = document.querySelector("button[type='submit']");
const requiredInputs = document.querySelectorAll("input[type='text']");

function checkForm() {
  const allFilled = [...requiredInputs].every(input => input.value.trim() !== "");
  submitBtn.disabled = !allFilled;
}
requiredInputs.forEach(input => input.addEventListener("input", checkForm));
checkForm();

btnGenerate.addEventListener("click", async () => {
  btnGenerate.disabled = true;
  submitBtn.disabled = true;
  spinner.classList.add("active");
  btnGenerate.querySelector(".btn-text").style.display = "none";

  try {
    const res = await fetch(_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate_text",
        field: "headline",
        type: document.getElementById("ad_type").value,
        campaign: document.getElementById("function").value,
        currentHeadline: document.getElementById("header_text").value.trim(),
        currentCTA: document.getElementById("button_text").value.trim(),
      }),
    });

    const data = await res.json();
    if (data.text) {
      document.getElementById("header_text").value = data.text;
    }
  } catch (err) {
    console.log("Chyba:", err);
  } finally {
    spinner.classList.remove("active");
    btnGenerate.querySelector(".btn-text").style.display = "inline";
    btnGenerate.disabled = false;
    submitBtn.disabled = false;
    checkForm();
  }
});

btnButton.addEventListener("click", async () => {
  btnButton.disabled = true;
  submitBtn.disabled = true;
  spinnerButton.classList.add("active");
  btnButton.querySelector(".btn-text").style.display = "none";

  try {
    const res = await fetch(_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate_text",
        field: "button_text",
        type: document.getElementById("ad_type").value,
        campaign: document.getElementById("function").value,
        currentHeadline: document.getElementById("header_text").value.trim(),
        currentCTA: document.getElementById("button_text").value.trim(),
      }),
    });

    const data = await res.json();
    if (data.text) {
      document.getElementById("button_text").value = data.text;
    }
  } catch (err) {
    console.log("Chyba:", err);
  } finally {
    spinnerButton.classList.remove("active");
    btnButton.querySelector(".btn-text").style.display = "inline";
    btnButton.disabled = false;
    submitBtn.disabled = false;
    checkForm();
  }
});

