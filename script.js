let chartData = null;

d3.csv("vstup_2024.csv").then(function(raw) {
  chartData = raw.map(function(d) {
    return {
      spec:    d["Спеціальність"],
      ch:      +d["Ч"],
      zh:      +d["Ж"],
      score_m: +d["score_m"],
      score_f: +d["score_f"]
    };
  });

  // Descending by male count → largest specialty at top,
  // matching Python's barh with ascending sort (first item at bottom in matplotlib).
  chartData.sort(function(a, b) { return b.ch - a.ch; });

  drawChart();
}).catch(function(err) {
  console.error("CSV load error:", err);
});

window.addEventListener("load", function() {
  if (chartData) drawChart();
});

function drawChart() {
  if (!chartData) return;

  var el = document.getElementById("bars-scroll");
  var totalWidth = el.clientWidth || el.getBoundingClientRect().width;

  if (totalWidth <= 0) {
    // Layout not ready yet — retry shortly
    setTimeout(drawChart, 60);
    return;
  }

  var mobile = window.innerWidth <= 700;

  var marginLeft  = mobile ? 155 : 268;
  var marginRight = 14;
  var innerWidth  = Math.max(totalWidth - marginLeft - marginRight, 80);
  var rowH  = mobile ? 17 : 20;
  var barH  = mobile ? 11 : 14;
  var fs    = mobile ? 9.5 : 11;

  var maxCh = d3.max(chartData, function(d) { return d.ch; });
  var maxScore = Math.max(
    d3.max(chartData, function(d) { return d.score_m; }),
    d3.max(chartData, function(d) { return d.score_f; })
  );

  // Score dots sit at score * scoreRatio in applicant-count space,
  // so maxScore maps to exactly 50 % of the bar axis width.
  // Matches Python: score_scale = max_applicants * 0.5 / max_score
  var scoreRatio = maxCh * 0.5 / maxScore;

  // X scale: applicant count (full inner width)
  var xCount = d3.scaleLinear()
    .domain([0, maxCh])
    .range([marginLeft, marginLeft + innerWidth]);

  // X scale: score (half inner width) — same pixel positions as the dots
  var xScore = d3.scaleLinear()
    .domain([0, maxScore])
    .range([marginLeft, marginLeft + innerWidth / 2]);

  // ── Top axis (score) ──────────────────────────────────────

  var topH = mobile ? 32 : 38;

  var svgTop = d3.select("#axis-top")
    .attr("width", totalWidth)
    .attr("height", topH);
  svgTop.selectAll("*").remove();

  svgTop.append("g")
    .attr("transform", "translate(0," + (topH - 2) + ")")
    .call(
      d3.axisTop(xScore)
        .ticks(mobile ? 4 : 6)
        .tickSize(4)
    )
    .call(function(g) { g.select(".domain").remove(); })
    .call(function(g) {
      g.selectAll("text").style("font-size", fs + "px").attr("fill", "#444");
    });

  svgTop.append("text")
    .attr("x", marginLeft + innerWidth / 4)
    .attr("y", mobile ? 11 : 13)
    .attr("text-anchor", "middle")
    .style("font-size", (fs + 1) + "px")
    .attr("fill", "#333")
    .text("Конкурсний бал");

  // ── Bars ─────────────────────────────────────────────────

  var totalBarsH = chartData.length * rowH;

  var svgBars = d3.select("#bars-svg")
    .attr("width", totalWidth)
    .attr("height", totalBarsH);
  svgBars.selectAll("*").remove();

  // Alternating row stripes
  chartData.forEach(function(d, i) {
    if (i % 2 === 0) {
      svgBars.append("rect")
        .attr("x", 0).attr("y", i * rowH)
        .attr("width", totalWidth).attr("height", rowH)
        .attr("fill", "#f7f7f7");
    }
  });

  // Baseline
  svgBars.append("line")
    .attr("x1", marginLeft).attr("x2", marginLeft)
    .attr("y1", 0).attr("y2", totalBarsH)
    .attr("stroke", "#ccc").attr("stroke-width", 0.8);

  chartData.forEach(function(d, i) {
    var cy = i * rowH + rowH / 2;

    // Specialty label
    svgBars.append("text")
      .attr("x", marginLeft - 5)
      .attr("y", cy)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .style("font-size", fs + "px")
      .attr("fill", "#333")
      .text(d.spec);

    // Male bar
    var wCh = Math.max(0, xCount(d.ch) - marginLeft);
    if (wCh > 0) {
      svgBars.append("rect")
        .attr("x", marginLeft).attr("y", cy - barH / 2)
        .attr("width", wCh).attr("height", barH)
        .attr("fill", "steelblue").attr("opacity", 0.6);
    }

    // Female bar (overlaid)
    var wZh = Math.max(0, xCount(d.zh) - marginLeft);
    if (wZh > 0) {
      svgBars.append("rect")
        .attr("x", marginLeft).attr("y", cy - barH / 2)
        .attr("width", wZh).attr("height", barH)
        .attr("fill", "red").attr("opacity", 0.4);
    }

    // Score dots
    var r = mobile ? 2.5 : 3.5;
    if (d.score_m > 0) {
      svgBars.append("circle")
        .attr("cx", xScore(d.score_m)).attr("cy", cy)
        .attr("r", r).attr("fill", "navy");
    }
    if (d.score_f > 0) {
      svgBars.append("circle")
        .attr("cx", xScore(d.score_f)).attr("cy", cy)
        .attr("r", r).attr("fill", "orange");
    }
  });

  // ── Bottom axis (count) ───────────────────────────────────

  var botH = mobile ? 32 : 38;

  var svgBot = d3.select("#axis-bottom")
    .attr("width", totalWidth)
    .attr("height", botH);
  svgBot.selectAll("*").remove();

  svgBot.append("g")
    .attr("transform", "translate(0,2)")
    .call(
      d3.axisBottom(xCount)
        .ticks(mobile ? 4 : 6)
        .tickSize(4)
    )
    .call(function(g) { g.select(".domain").remove(); })
    .call(function(g) {
      g.selectAll("text").style("font-size", fs + "px").attr("fill", "#444");
    });

  svgBot.append("text")
    .attr("x", marginLeft + innerWidth / 2)
    .attr("y", botH - 3)
    .attr("text-anchor", "middle")
    .style("font-size", (fs + 1) + "px")
    .attr("fill", "#333")
    .text("Кількість вступників");
}

// Redraw on resize
var _resizeTimer;
window.addEventListener("resize", function() {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(drawChart, 200);
});
