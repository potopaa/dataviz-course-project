d3.csv("vstup_2024.csv").then(data => {

  const grouped = data.map(d => ({
    speciality: d["Спеціальність"],
    Ч: +d.Ч,
    Ж: +d.Ж,
    score_m: +d.score_m,
    score_f: +d.score_f
  }));

  // Сортируем по количеству Чоловіків (по убыванию)
  grouped.sort((a,b) => b.Ч - a.Ч);

  // Максимум для расчёта масштаба
  const maxApplicants = d3.max(grouped, d => d.Ч);
  const maxScore = d3.max(grouped, d => Math.max(d.score_m, d.score_f));
  const scoreScale = maxApplicants * 0.5 / maxScore; // 50% ширины под баллы

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
      // ✅ Бары Чоловіки
      Plot.barX(grouped, { x: "Ч", y: "speciality", fill: "steelblue", opacity: 0.6 }),
      // ✅ Бары Жінки
      Plot.barX(grouped, { x: "Ж", y: "speciality", fill: "red", opacity: 0.4 }),
      // ✅ Точки Чоловіки (баллы)
      Plot.dot(grouped, { x: d => d.score_m * scoreScale, y: "speciality", fill: "navy", r: 4 }),
      // ✅ Точки Жінки (баллы)
      Plot.dot(grouped, { x: d => d.score_f * scoreScale, y: "speciality", fill: "orange", r: 4 }),
      // ✅ Верхняя шкала — строим реальную ось поверх
      Plot.axisX({
        anchor: "top",
        ticks: 6,
        tickFormat: d => Math.round(d / scoreScale),
        label: "Конкурсний бал"
      })
    ]
  });

  document.getElementById("chart").append(chart);

}).catch(err => console.error("❌ Error:", err));
