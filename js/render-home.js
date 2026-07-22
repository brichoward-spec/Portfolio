(async function () {
  try {
    const data = await CMS.loadJSON("/content/home.json");
    CMS.setText("tagline", data.tagline);
    CMS.setText("professional-desc", data.professional_desc);
    CMS.setText("creative-desc", data.creative_desc);
  } catch (e) {
    console.error("Content load failed, showing built-in defaults.", e);
  }
})();
