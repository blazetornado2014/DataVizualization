import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function BarChart({ data, metric, gameFilter }) {
  const svgRef = useRef();
  const tooltipRef = useRef();
  
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Set up dimensions
    const margin = { top: 40, right: 30, bottom: 90, left: 60 };
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
    
    let processedData;
    
    if (gameFilter === 'all') {
      // Group data by game
      processedData = d3.rollups(
        data,
        v => d3.mean(v, d => d[metric] || 0),
        d => d.game
      ).map(([game, value]) => ({ category: game, value }));
    } else {
      // Group data by character/hero
      processedData = d3.rollups(
        data,
        v => d3.mean(v, d => d[metric] || 0),
        d => d.character || 'Unknown'
      ).map(([character, value]) => ({ category: character, value }));
    }
    
    // Sort data by value in descending order
    processedData.sort((a, b) => b.value - a.value);
    
    // Limit to top 10 if there are more than 10 categories
    if (processedData.length > 10) {
      processedData = processedData.slice(0, 10);
    }
    
    // Create scales
    const x = d3.scaleBand()
      .domain(processedData.map(d => d.category))
      .range([0, width])
      .padding(0.2);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d.value) * 1.1])
      .range([height, 0]);
    
    // Create color scale based on value
    const colorScale = d3.scaleSequential()
      .domain([0, d3.max(processedData, d => d.value)])
      .interpolator(d3.interpolateViridis);
    
    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
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
    
    // Add bars
    svg.selectAll(".bar")
      .data(processedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.category))
      .attr("width", x.bandwidth())
      .attr("y", height)
      .attr("height", 0)
      .attr("fill", d => colorScale(d.value))
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(100)
          .attr("opacity", 0.8);
        
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
            <div class="font-medium">${d.category}</div>
            <div>${metricName}: ${d.value.toFixed(2)}</div>
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 20) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(100)
          .attr("opacity", 1);
        
        d3.select(tooltipRef.current)
          .transition()
          .duration(200)
          .style("opacity", 0);
      })
      .transition()
      .duration(800)
      .attr("y", d => y(d.value))
      .attr("height", d => height - y(d.value))
      .delay((d, i) => i * 100);
    
    // Add value labels on top of bars
    svg.selectAll(".label")
      .data(processedData)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", d => x(d.category) + x.bandwidth() / 2)
      .attr("y", d => y(d.value) - 5)
      .attr("text-anchor", "middle")
      .style("fill", "#E5E7EB")
      .style("font-size", "12px")
      .style("opacity", 0)
      .text(d => d.value.toFixed(1))
      .transition()
      .duration(800)
      .style("opacity", 1)
      .delay((d, i) => i * 100 + 400);
    
    // Add chart title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("fill", "#A78BFA")
      .text(`${metric === 'kd_ratio' ? 'K/D Ratio' : metric === 'win_rate' ? 'Win Rate' : metric.charAt(0).toUpperCase() + metric.slice(1)} by ${gameFilter === 'all' ? 'Game' : 'Character'}`);
    
    // Add X axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#9CA3AF")
      .text(gameFilter === 'all' ? "Game" : "Character");
    
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

export default BarChart;
