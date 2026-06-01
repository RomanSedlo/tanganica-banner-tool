const _WEBHOOK_URL = "https://creative-automation-tool.marketing-e01.workers.dev/"

const btnGenerate = document.getElementById("btn-headline");
const spinner = document.getElementById("spinner-headline");

const btnButton = document.getElementById("btn-button");
const spinnerButton = document.getElementById("spinner-button");

const submitBtn = document.querySelector("button[type='submit']");
const requiredInputs = document.querySelectorAll("input[type='text']");
const bannerLoader = document.getElementById("banner-loader");
const submitBtnText = submitBtn.querySelector(".btn-text");


async function generateBanners(translations, campaign, ad_type) {
  const zip = new JSZip();

  const templateRes = await fetch("banner_template.html");
  const template = await templateRes.text();

  for (const [lang, texts] of Object.entries(translations)) {
    const html = template
      .replace("{{headline}}", texts.headline)
      .replace("{{cta_text}}", texts.cta);

    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    container.innerHTML = html;
    document.body.appendChild(container);

    const banner = container.querySelector(".banner");

    await document.fonts.ready;

    const canvas = await html2canvas(banner, {
      width: 1080,
      height: 1080,
      scale: 1,
      useCORS: true,
      allowTaint: false,
    });

    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
    zip.file(`${ad_type}_${campaign}_banner_${lang}_1080x1080.png`, blob);

    document.body.removeChild(container);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${ad_type}__${campaign}_banners.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

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

document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    submitBtn.classList.add("loading"); 
    submitBtnText.style.display = "none";
    bannerLoader.classList.add("active"); 

    try {
        const res = await fetch(_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "generate_banners",
                headline: document.getElementById("header_text").value.trim(),
                cta_text: document.getElementById("button_text").value.trim(),
                campaign: document.getElementById("function").value,
                ad_type: document.getElementById("ad_type").value,
            }),
        });

        const data = await res.json();
        await generateBanners(data, document.getElementById("function").value, document.getElementById("ad_type").value);
    } catch (err) {
        console.log("Chyba:", err);
    } finally {
        bannerLoader.classList.remove("active");
        submitBtnText.style.display = "inline";
        submitBtn.classList.remove("loading");
        checkForm();
    }
});