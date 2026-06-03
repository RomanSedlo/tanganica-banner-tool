const _WEBHOOK_URL = "https://creative-automation-tool.marketing-e01.workers.dev/"

const btnHeadlineImprove = document.getElementById("btn-headline-improve");
const btnHeadlineGenerate = document.getElementById("btn-headline-generate");
const btnCtaImprove = document.getElementById("btn-cta-improve");
const btnCtaGenerate = document.getElementById("btn-cta-generate");

const submitBtn = document.querySelector("button[type='submit']");
const requiredInputs = document.querySelectorAll("input[type='text']");
const bannerLoader = document.getElementById("banner-loader");
const submitBtnText = submitBtn.querySelector(".btn-text");

document.querySelector('input[name="banner_size"]:checked').addEventListener("change", () => {
  const is1920 = document.querySelector('input[name="banner_size"]:checked').value === "1080x1920";
  document.getElementById("image-upload-wrap").style.display = is1920 ? "block" : "none";
});

async function generateBanners(translations, campaign, ad_type, size) {
  const zip = new JSZip();

  const templateUrl = size === "1080x1080" ? "templates/banner_template_1080h.html" : "templates/banner_template_1920h.html";
  const templateRes = await fetch(templateUrl);
  const template = await templateRes.text();

  const webinarLabels = {
    cz: 'Webinář pro e-shopy', en: 'Webinar for e-shops', de: 'Webinar für Online-Shops',
    it: 'Webinar per e-commerce', es: 'Webinar para e-commerce', fr: 'Webinaire pour e-commerce',
    pl: 'Webinar dla e-sklepów', ro: 'Webinar pentru magazine online', hu: 'Webinár e-shopoknak',
    pt: 'Webinar para e-commerce', nl: 'Webinar voor webshops',
  };
  const badgeLabels = {
    cz: 'ZDARMA', en: 'FOR FREE', de: 'KOSTENLOS', it: 'GRATIS', es: 'GRATIS', fr: 'GRATUIT',
    pl: 'ZA DARMO', ro: 'GRATUIT', hu: 'INGYENES', pt: 'GRÁTIS', nl: 'GRATIS',
  };

  let imageDataUrl = null;
  if (size === "1080x1920") {
    const file = document.getElementById("banner_image").files[0];
    if (file) {
      imageDataUrl = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    }
  };

  for (const [lang, texts] of Object.entries(translations)) {
    const html = template
      .replace('class="banner type-normal"', `class="banner type-${ad_type.replace('_ad', '').replace(/_/g, '-')}"`)
      .replace("{{headline}}", texts.headline)
      .replace("{{subheadline}}", texts.subheadline || "")
      .replace("{{cta_text}}", texts.cta)
      .replace("{{badge}}", badgeLabels[lang] || badgeLabels.en)
      .replace("{{webinar_label}}", webinarLabels[lang] || webinarLabels.en)
      .replace('src="https://placehold.co/720"', imageDataUrl ? `src="${imageDataUrl}"` : 'src="https://placehold.co/720"');

    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    container.innerHTML = html;
    document.body.appendChild(container);

    const banner = container.querySelector(".banner");

    await document.fonts.ready;

    const [w, h] = size.split("x").map(Number);
    const blob = await htmlToImage.toBlob(banner, {
      width: w,
      height: h,
      pixelRatio: 1,
      cacheBust: true,
    });

    zip.file(`${ad_type}_[${campaign}]_banner_<${lang}>_${size}.png`, blob);

    document.body.removeChild(container);
  }

  const currentTime = `${new Date().getHours().toString().padStart(2, 0)}-${new Date().getMinutes().toString().padStart(2, 0)}`;

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${ad_type}__[${campaign}]_banners__${size}_${currentTime}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

function checkForm() {
  const allFilled = [...requiredInputs].every(input => input.value.trim() !== "");
  submitBtn.disabled = !allFilled;
}
requiredInputs.forEach(input => input.addEventListener("input", checkForm));
checkForm();

async function callGenerateText(field, currentHeadline, currentCTA, targetInputId, btn) {
  const allBtns = [btnHeadlineImprove, btnHeadlineGenerate, btnCtaImprove, btnCtaGenerate];
  allBtns.forEach(b => b.disabled = true);
  submitBtn.disabled = true;
  btn.querySelector(".spinner").classList.add("active");
  btn.querySelector(".btn-text").style.display = "none";

  try {
    const res = await fetch(_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: btn === btnHeadlineImprove || btn === btnCtaImprove ? "improve_text" : "generate_text",
        field,
        type: document.getElementById("ad_type").value,
        campaign: document.getElementById("function").value,
        currentHeadline,
        currentCTA,
      }),
    });

    const data = await res.json();
    if (data.text) {
      const input = document.getElementById(targetInputId);
      input.value = data.text;
      input.dataset.aiGenerated = "true";
      updateImproveButtons();
      checkForm();
    }
  } catch (err) {
    console.log("Chyba:", err);
  } finally {
    btn.querySelector(".spinner").classList.remove("active");
    btn.querySelector(".btn-text").style.display = "inline";
    allBtns.forEach(b => b.disabled = false);
    updateImproveButtons();
    submitBtn.disabled = false;
    checkForm();
  }
}

function updateImproveButtons() {
  btnHeadlineImprove.disabled = document.getElementById("header_text").value.trim() === "";
  btnCtaImprove.disabled      = document.getElementById("button_text").value.trim() === "";
}

btnHeadlineGenerate.addEventListener("click", () => {
  callGenerateText("headline", document.getElementById("header_text").value.trim(),
  document.getElementById("button_text").value.trim(), "header_text", btnHeadlineGenerate);
});

btnHeadlineImprove.addEventListener("click", () => {
  callGenerateText(
    "headline",
    document.getElementById("header_text").value.trim(),
    document.getElementById("button_text").value.trim(),
    "header_text",
    btnHeadlineImprove
  );
});

btnCtaGenerate.addEventListener("click", () => {
  callGenerateText(
    "button_text",
    document.getElementById("header_text").value.trim(),
    "",
    "button_text",
    btnCtaGenerate
  );
});

btnCtaImprove.addEventListener("click", () => {
  callGenerateText(
    "button_text",
    document.getElementById("header_text").value.trim(),
    document.getElementById("button_text").value.trim(),
    "button_text",
    btnCtaImprove
  );
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
    const size = document.querySelector('input[name="banner_size"]:checked').value;
    await generateBanners(data, document.getElementById("function").value, document.getElementById("ad_type").value, size);
  } catch (err) {
    console.log("Chyba:", err);
  } finally {
    bannerLoader.classList.remove("active");
    submitBtnText.style.display = "inline";
    submitBtn.classList.remove("loading");
    checkForm();
  }
});

document.getElementById("header_text").addEventListener("input", () => {
  document.getElementById("header_text").dataset.aiGenerated = "false";
  updateImproveButtons();
});
document.getElementById("button_text").addEventListener("input", () => {
  document.getElementById("button_text").dataset.aiGenerated = "false";
  updateImproveButtons();
});
document.getElementById("function").addEventListener("change", () => {
  const headline = document.getElementById("header_text");
  const cta = document.getElementById("button_text");
  if (headline.dataset.aiGenerated === "true") headline.value = "";
  if (cta.dataset.aiGenerated === "true") cta.value = "";
  checkForm();
});