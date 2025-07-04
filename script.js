// Загрузка данных и построение Plot

d3.csv("vstup_2024.csv").then(raw => {
  // Группировка по спеціальності та статі
  const grouped = d3.rollups(
    raw,
    v => ({
      Ч: v.filter(d => d.Стать === "Ч").length,
      Ж: v.filter(d => d.Стать === "Ж").length,
      score_m: d3.mean(v.filter(d => d.Стать === "Ч"), d => +d["Конкурсний бал"]) || 0,
      score_f: d3.mean(v.filter(d => d.Стать === "Ж"), d => +d["Конкурсний бал"]) || 0
    }),
    d => d["Спеціальність"]
  ).map(([speciality, agg]) => ({
    speciality: speciality,
    Ч: agg.Ч,
    Ж: agg.Ж,
    score_m: agg.score_m,
    score_f: agg.score_f
  }));

  // Сортировка по количеству Чоловіків
  grouped.sort((a, b) => a.Ч - b.Ч);

  const maxApplicants = d3.max(grouped, d => d.Ч);
  const maxScore = d3.max(grouped, d => Math.max(d.score_m, d.score_f));
  const scoreScale = maxApplicants * 0.5 / maxScore;

  const chart = Plot.plot({
    width: 1000,
    height: grouped.length * 20,
    marginLeft: 350,
    marginRight: 80,
    x: {
      label: "Кількість вступників"
    },
    y: {
      domain: grouped.map(d => d.speciality),
      padding: 0.2
    },
    marks: [
      Plot.barX(grouped, {
        x: "Ч",
        y: "speciality",
        fill: "steelblue",
        opacity: 0.6
      }),
      Plot.barX(grouped, {
        x: "Ж",
        y: "speciality",
        fill: "red",
        opacity: 0.4
      }),
      Plot.dot(grouped, {
        x: d => d.score_m * scoreScale,
        y: "speciality",
        fill: "navy",
        r: 4
      }),
      Plot.dot(grouped, {
        x: d => d.score_f * scoreScale,
        y: "speciality",
        fill: "orange",
        r: 4
      }),
    ],
    fx: {
      label: "Конкурсний бал",
      domain: [0, maxApplicants * 0.5],
      ticks: 5,
      tickFormat: d => Math.round(d / scoreScale)
    }
  });

  document.getElementById("chart").append(chart);

}).catch(err => console.error("Помилка завантаження CSV:", err));
