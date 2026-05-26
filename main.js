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

// spustit hned při načtení
checkForm();

btnGenerate.addEventListener("click", async () => {
  spinner.classList.add("active");
  btnGenerate.querySelector(".btn-text").style.display = "none";
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  spinner.classList.remove("active");
  btnGenerate.querySelector(".btn-text").style.display = "inline";
});

btnButton.addEventListener("click", async () => {
  spinnerButton.classList.add("active");
  btnButton.querySelector(".btn-text").style.display = "none";
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  spinnerButton.classList.remove("active");
  btnButton.querySelector(".btn-text").style.display = "inline";
});

