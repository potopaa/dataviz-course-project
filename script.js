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
    width: 1200,
    height: grouped.length * 20,
    marginLeft: 350,
    marginRight: 300,
    x: {
      label: "Кількість вступників",
      labelAnchor: "center",
      labelOffset: 40 
    },
    y: { domain: grouped.map(d => d.speciality), padding: 0.2 },
    marks: [
      Plot.barX(grouped, { x: "Ч", y: "Спеціальність", fill: "blue", opacity: 0.6 }),
      Plot.barX(grouped, { x: "Ж", y: "Спеціальність", fill: "rose", opacity: 0.4 }),
      Plot.dot(grouped, { x: d => d.score_m * scoreScale, y: "speciality", fill: "navy", r: 4 }),
      Plot.dot(grouped, { x: d => d.score_f * scoreScale, y: "speciality", fill: "orange", r: 4 }),

      Plot.axisX({
        anchor: "top",
        ticks: 6,
        tickFormat: d => Math.round(d / scoreScale),
        label: "Конкурсний бал"
      }),
      Plot.ruleX(d3.range(0, maxApplicants * 0.5, maxApplicants * 0.5 / 6))
    ]
  });

  document.getElementById("chart").append(chart);

}).catch(err => console.error("Error:", err));
