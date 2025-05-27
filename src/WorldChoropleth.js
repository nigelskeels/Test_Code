import React, { useEffect, useRef } from "react"
import * as d3 from "d3"
import * as topojson from "topojson-client"
import worldData from "./data/world-110m.json"
import { regionData } from "./data"

const WorldChoropleth = () => {
  const svgRef = useRef()

  useEffect(() => {
    const width = 960
    const height = 500

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .style("font", "10px sans-serif")

    svg.selectAll("*").remove() // Clear old content

    const projection = d3
      .geoNaturalEarth1()
      .scale(160)
      .translate([width / 2, height / 2])
    const path = d3.geoPath().projection(projection)

    const countries = topojson.feature(
      worldData,
      worldData.objects.countries
    ).features
    const borders = topojson.mesh(
      worldData,
      worldData.objects.countries,
      (a, b) => a !== b
    )

    const colorScale = d3
      .scaleSequential()
      .domain([0, d3.max([0, 1, 2, 3])])
      .interpolator(d3.interpolateBlues)

    const g = svg.append("g") // Group for all zoomable content

    // Country shapes
    g.append("g")
      .selectAll("path")
      .data(countries)
      .join("path")
      .attr("d", path)
      .attr("fill", (d) => {
        const value = regionData.filter((element) =>
          element.country.includes(d.properties.name)
        )[0]?.value

        return value ? colorScale(value) : "#ff0"
      })
      .attr("stroke", "#ccc")
      .attr("stroke-width", 0.5)

    // Borders
    g.append("path")
      .datum(borders)
      .attr("fill", "none")
      .attr("stroke", "#333")
      .attr("stroke-width", 0.5)
      .attr("d", path)

    // Country Labels
    const labels = g
      .append("g")
      .selectAll("text")
      .data(countries)
      .join("text")
      .attr("transform", (d) => `translate(${path.centroid(d)})`)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("font-size", "7px")
      .attr("fill", "#222")
      .text((d) => d.properties.name)

    // Zoom behavior
    svg.call(
      d3
        .zoom()
        .scaleExtent([1, 8]) // zoom range
        .on("zoom", (event) => {
          g.attr("transform", event.transform)
          labels.attr("font-size", `${7 / event.transform.k}px`) // Scale labels down
        })
    )
  }, [])

  return <svg ref={svgRef} width="100%" height="500"></svg>
}

export default WorldChoropleth
