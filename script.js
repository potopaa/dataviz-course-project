d3.csv("vstup_2024.csv").then(data => {
  const grouped = data.map(d => ({
    speciality: d["Спеціальність"],
    Ч: +d.Ч,
    Ж: +d.Ж,
    score_m: +d.score_m,
    score_f: +d.score_f
  }));

  grouped.sort((a,b) => b.Ч - a.Ч);

  const maxApplicants = d3.max(grouped, d => d.Ч);
  const maxScore = d3.max(grouped, d => Math.max(d.score_m, d.score_f));
  const scoreScale = maxApplicants * 0.5 / maxScore;

  const chart = Plot.plot({
    width: 1000,
    height: grouped.length * 20,
    marginLeft: 350,
    marginRight: 80,
    x: { label: "Кількість вступників" },
    y: { domain: grouped.map(d => d.speciality), padding: 0.2 },
    marks: [
      Plot.barX(grouped, { x: "Ч", y: "speciality", fill: "steelblue", opacity: 0.6 }),
      Plot.barX(grouped, { x: "Ж", y: "speciality", fill: "red", opacity: 0.4 }),
      Plot.dot(grouped, { x: d => d.score_m * scoreScale, y: "speciality", fill: "navy", r: 4 }),
      Plot.dot(grouped, { x: d => d.score_f * scoreScale, y: "speciality", fill: "orange", r: 4 }),
    ],
    fx: {
      label: "Конкурсний бал",
      domain: [0, maxApplicants * 0.5],
      ticks: 5,
      tickFormat: d => Math.round(d / scoreScale)
    }
  });

  document.getElementById("chart").append(chart);

  // Легенда
  const legend = document.createElement("div");
  legend.innerHTML = `
    <p><span style="color: steelblue;">■</span> Чоловіки</p>
    <p><span style="color: red;">■</span> Жінки</p>
    <p><span style="color: navy;">●</span> Середній бал (Чоловіки)</p>
    <p><span style="color: orange;">●</span> Середній бал (Жінки)</p>
  `;
  legend.style.fontSize = "14px";
  document.getElementById("chart").append(legend);

}).catch(err => console.error("Error:", err));
