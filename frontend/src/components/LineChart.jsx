import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function LineChart({ data, metric, gameFilter }) {
  const svgRef = useRef();
  const tooltipRef = useRef();
  
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Set up dimensions
    const margin = { top: 30, right: 30, bottom: 60, left: 60 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Create the svg element
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create tooltip div if it doesn't exist
    if (!tooltipRef.current) {
      tooltipRef.current = d3.select("body").append("div")
        .attr("class", "d3-tooltip")
        .style("opacity", 0);
    }
    
    // Group and process data by date
    const groupedData = d3.rollups(
      data,
      v => {
        // Calculate the average for the selected metric
        return {
          average: d3.mean(v, d => d[metric] || 0),
          games: Array.from(new Set(v.map(d => d.game))).join(', ')
        };
      },
      d => d.date
    );
    
    // Convert grouped data to array and sort by date
    let processedData = Array.from(groupedData, ([date, value]) => ({
      date: new Date(date),
      value: value.average,
      games: value.games
    })).sort((a, b) => a.date - b.date);
    
    // Create scales
    const x = d3.scaleTime()
      .domain(d3.extent(processedData, d => d.date))
      .range([0, width]);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d.value) * 1.1])
      .range([height, 0]);
    
    // Create line generator
    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);
    
    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%b %d")))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)")
      .attr("fill", "#9CA3AF");
    
    // Add Y axis
    svg.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .attr("fill", "#9CA3AF");
    
    // Add the line path
    const path = svg.append("path")
      .datum(processedData)
      .attr("fill", "none")
      .attr("stroke", "#8B5CF6") // Purple color
      .attr("stroke-width", 3)
      .attr("d", line);
    
    // Animate the line
    const pathLength = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", pathLength)
      .attr("stroke-dashoffset", pathLength)
      .transition()
      .duration(1000)
      .attr("stroke-dashoffset", 0);
    
    // Add data points
    svg.selectAll(".data-point")
      .data(processedData)
      .enter()
      .append("circle")
      .attr("class", "data-point")
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d.value))
      .attr("r", 5)
      .attr("fill", "#8B5CF6")
      .attr("stroke", "#F3F4F6")
      .attr("stroke-width", 2)
      .style("opacity", 0)
      .transition()
      .delay((d, i) => i * 100)
      .duration(500)
      .style("opacity", 1);
    
    // Add hover interaction to data points
    svg.selectAll(".data-point")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(100)
          .attr("r", 8);
        
        // Format metric name for display
        let metricName = metric === 'kd_ratio' ? 'K/D Ratio' : 
                         metric === 'win_rate' ? 'Win Rate' : 
                         metric.charAt(0).toUpperCase() + metric.slice(1);
        
        d3.select(tooltipRef.current)
          .transition()
          .duration(100)
          .style("opacity", 0.9);
        
        d3.select(tooltipRef.current)
          .html(`
            <div class="font-medium">${d.date.toLocaleDateString()}</div>
            <div>${metricName}: ${d.value.toFixed(2)}</div>
            ${gameFilter === 'all' ? `<div class="text-xs mt-1">Games: ${d.games}</div>` : ''}
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 20) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(100)
          .attr("r", 5);
        
        d3.select(tooltipRef.current)
          .transition()
          .duration(200)
          .style("opacity", 0);
      });
    
    // Add chart title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("fill", "#A78BFA")
      .text(`${metric === 'kd_ratio' ? 'K/D Ratio' : metric === 'win_rate' ? 'Win Rate' : metric.charAt(0).toUpperCase() + metric.slice(1)} Over Time`);
    
    // Add X axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#9CA3AF")
      .text("Date");
    
    // Add Y axis label
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
    
    // Add grid lines
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
    
    // Clean up on unmount
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
