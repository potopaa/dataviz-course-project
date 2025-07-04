d3.csv("vstup_2024_agg.csv").then(data => {

  const grouped = data.map(d => ({
    speciality: d["Спеціальність"],
    Ч: +d.Ч,
    Ж: +d.Ж,
    score_m: +d.score_m,
    score_f: +d.score_f
  }));

  grouped.sort((a,b) => b.Ч - a.Ч);

  const maxApplicants = d3.max(grouped, d => d.Ч);
  const scoreScale = maxApplicants * 0.5 / 200;  // фикс до 200

  const ticks = [0, 50, 100, 150, 200];
  const tickPos = ticks.map(d => d * scoreScale);

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
      Plot.barX(grouped, { x: "Ч", y: "speciality", fill: "steelblue", opacity: 0.6 }),
      Plot.barX(grouped, { x: "Ж", y: "speciality", fill: "red", opacity: 0.4 }),
      Plot.dot(grouped, { x: d => d.score_m * scoreScale, y: "speciality", fill: "navy", r: 4 }),
      Plot.dot(grouped, { x: d => d.score_f * scoreScale, y: "speciality", fill: "orange", r: 4 }),

      // Верхняя шкала — вручную рисуем деления
      Plot.ruleX(tickPos, { stroke: "#000", strokeOpacity: 0.2, y1: -20, y2: grouped.length * 20 }),
      Plot.text(tickPos, {
        text: ticks.map(String),
        y: -30,
        fill: "#000",
        textAnchor: "middle"
      }),
      // Заголовок верхней шкалы
      Plot.text([maxApplicants * 0.25], {
        text: ["Конкурсний бал"],
        y: -50,
        fontWeight: "bold",
        textAnchor: "middle"
      })
    ]
  });

  document.getElementById("chart").append(chart);

}).catch(err => console.error("❌ Error:", err));
