async function makeFakeCardImageBuffer(page) {
  const dataUrl = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 840;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, 600, 840);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 8;
    ctx.strokeRect(30, 30, 540, 780);
    ctx.fillStyle = "#000";
    ctx.font = "bold 40px sans-serif";
    ctx.fillText("Pikachu", 70, 100);
    ctx.font = "20px sans-serif";
    ctx.fillText("58/102", 70, 780);
    return canvas.toDataURL("image/jpeg", 0.9);
  });
  return Buffer.from(dataUrl.split(",")[1], "base64");
}

module.exports = { makeFakeCardImageBuffer };
