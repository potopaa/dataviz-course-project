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
    x: { label: "Кількість вступників" },
    y: { domain: grouped.map(d => d.speciality), padding: 0.2 },
    marks: [
      Plot.barX(grouped, { x: "Ч", y: "speciality", fill: "steelblue", opacity: 0.6 }),
      Plot.barX(grouped, { x: "Ж", y: "speciality", fill: "red", opacity: 0.4 }),
      Plot.dot(grouped, { x: d => d.score_m * scoreScale, y: "speciality", fill: "navy", r: 4 }),
      Plot.dot(grouped, { x: d => d.score_f * scoreScale, y: "speciality", fill: "orange", r: 4 }),
      // Рисуем разделители верхней шкалы вручную
      Plot.ruleX(
        d3.range(0, maxApplicants * 0.5, maxApplicants * 0.5 / 6),
        { stroke: "#ccc", y1: -5, y2: grouped.length * 20 }
      )
    ],
    fx: {
      label: "Конкурсний бал",
      domain: [0, maxApplicants * 0.5],
      ticks: 6,
      tickFormat: d => Math.round(d / scoreScale)
    }
  });

  document.getElementById("chart").append(chart);

  const legend = document.createElement("div");
  legend.className = "legend";
  legend.innerHTML = `
    <p><span style="color: steelblue;">■</span> Кількість вступників (Чоловіки)</p>
    <p><span style="color: red;">■</span> Кількість вступників (Жінки)</p>
    <p><span style="color: navy;">●</span> Середній бал (Чоловіки)</p>
    <p><span style="color: orange;">●</span> Середній бал (Жінки)</p>
  `;
  document.body.append(legend);

  const note = document.createElement("div");
  note.className = "note";
  note.innerHTML = `
    <p>Навіть на "переважно чоловічі"<br/>
    спеціальності жінки часто набирають<br/>
    вищий конкурсний бал ніж чоловіки.</p>
    <p class="plot-source">Джерело даних: Вступ2024</p>
  `;
  document.body.append(note);

}).catch(err => console.error("Error:", err));
