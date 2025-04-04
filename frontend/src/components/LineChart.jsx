import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function LineChart({ data, metric, gameFilter }) {
  const svgRef = useRef();
  const tooltipRef = useRef();
  
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    d3.select(svgRef.current).selectAll("*").remove();
    
    const margin = { top: 30, right: 30, bottom: 60, left: 60 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    if (!tooltipRef.current) {
      tooltipRef.current = d3.select("body").append("div")
        .attr("class", "d3-tooltip")
        .style("opacity", 0);
    }
    
    const groupedData = d3.rollups(
      data,
      v => {
        return {
          average: d3.mean(v, d => d[metric] || 0),
          games: Array.from(new Set(v.map(d => d.game))).join(', ')
        };
      },
      d => d.date
    );
    
    let processedData = Array.from(groupedData, ([date, value]) => ({
      date: new Date(date),
      value: value.average,
      games: value.games
    })).sort((a, b) => a.date - b.date);
    
    const x = d3.scaleTime()
      .domain(d3.extent(processedData, d => d.date))
      .range([0, width]);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d.value) * 1.1])
      .range([height, 0]);
    
    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);
    
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%Y"))) // Only show year
      .selectAll("text")
      .style("text-anchor", "middle")
      .attr("fill", "#9CA3AF");
    
    svg.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .attr("fill", "#9CA3AF");
    
    const path = svg.append("path")
      .datum(processedData)
      .attr("fill", "none")
      .attr("stroke", "#8B5CF6")
      .attr("stroke-width", 3)
      .attr("d", line);
    
    const pathLength = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", pathLength)
      .attr("stroke-dashoffset", pathLength)
      .transition()
      .duration(1000)
      .attr("stroke-dashoffset", 0);
    
    const overlay = svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("pointer-events", "all");
    
    const verticalLine = svg.append("line")
      .attr("class", "hover-line")
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#A78BFA")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5")
      .style("opacity", 0);
    
    const hoverCircle = svg.append("circle")
      .attr("r", 6)
      .attr("fill", "#8B5CF6")
      .attr("stroke", "#F3F4F6")
      .attr("stroke-width", 2)
      .style("opacity", 0);
    
    overlay.on("mousemove", function(event) {
      const [mouseX] = d3.pointer(event);
      const x0 = x.invert(mouseX);
      
      const bisect = d3.bisector(d => d.date).left;
      const i = bisect(processedData, x0, 1);
      const d0 = processedData[i - 1];
      const d1 = processedData[i];
      
      if (!d0 || !d1) return;
      
      const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
      
      verticalLine
        .attr("x1", x(d.date))
        .attr("x2", x(d.date))
        .style("opacity", 1);
      
      hoverCircle
        .attr("cx", x(d.date))
        .attr("cy", y(d.value))
        .style("opacity", 1);
      
      let metricName = metric === 'kd_ratio' ? 'K/D Ratio' : 
                      metric === 'win_rate' ? 'Win Rate' : 
                      metric.charAt(0).toUpperCase() + metric.slice(1);
      
      d3.select(tooltipRef.current)
        .transition()
        .duration(100)
        .style("opacity", 0.9);
      
      d3.select(tooltipRef.current)
        .html(`
          <div class="font-medium">${d.date.getFullYear()}</div>
          <div>${metricName}: ${d.value.toFixed(2)}</div>
          ${gameFilter === 'all' ? `<div class="text-xs mt-1">Games: ${d.games}</div>` : ''}
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 20) + "px");
    })
    .on("mouseout", function() {
      verticalLine.style("opacity", 0);
      hoverCircle.style("opacity", 0);
      
      d3.select(tooltipRef.current)
        .transition()
        .duration(200)
        .style("opacity", 0);
    });
    
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("fill", "#A78BFA")
      .text(`${metric === 'kd_ratio' ? 'K/D Ratio' : metric === 'win_rate' ? 'Win Rate' : metric.charAt(0).toUpperCase() + metric.slice(1)} by Year`);
    
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#9CA3AF")
      .text("Year");
    
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -(height / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#9CA3AF")
      .text(metric === 'kd_ratio' ? 'K/D Ratio' : 
           metric === 'win_rate' ? 'Win Rate (%)' : 
           metric.charAt(0).toUpperCase() + metric.slice(1));
    
    svg.selectAll("xGrid")
      .data(x.ticks().slice(1))
      .join("line")
      .attr("x1", d => x(d))
      .attr("x2", d => x(d))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#374151")
      .attr("stroke-width", 0.5);
    
    svg.selectAll("yGrid")
      .data(y.ticks())
      .join("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", d => y(d))
      .attr("y2", d => y(d))
      .attr("stroke", "#374151")
      .attr("stroke-width", 0.5);
    
    return () => {
      if (tooltipRef.current) {
        d3.select(tooltipRef.current).remove();
        tooltipRef.current = null;
      }
    };
  }, [data, metric, gameFilter]);
  
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg">
        <p className="text-gray-400">No data available for the selected filters</p>
      </div>
    );
  }
  
  return (
    <div className="chart-container">
      <svg ref={svgRef} width="100%" height="400"></svg>
    </div>
  );
}

export default LineChart;
