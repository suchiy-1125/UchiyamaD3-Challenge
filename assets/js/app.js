// SVG definitions
var svgWidth = 960;
var svgHeight = 620;

// Borders in svg
var margin = {
    top: 20,
    right: 40,
    bottom: 200,
    left: 100
};

// scale of the boarder
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// append a div class to the scatter element
var chart = d3
    .select("#scatter")
    .append("div")
    .classed("chart", true);

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select(".chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
        d3.max(censusData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
        d3.max(censusData, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);
    return yLinearScale
}

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));
    return textGroup
}
//function to stylize x-axis values for tooltips
function styleX(value, chosenXAxis) {

    //style based on variable
    //poverty
    if (chosenXAxis === 'poverty') {
        return `${value}%`;
    }
    //household income
    else if (chosenXAxis === 'income') {
        return `${value}`;
    }
    else {
        return `${value}`;
    }
}


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    if (chosenXAxis === "poverty") {
        var xLabel = "Poverty(%):";
    }


    else if ((chosenXAxis === "age")) {
        var xLabel = "Age(median):";
    }

    else {
        var xLabel = "Median Income:";
    }

    if (chosenYAxis === "healthcare") {
        var yLabel = "Lacks Healthcare (%):";
    }

    else if ((chosenYAxis === "smokes")) {
        var yLabel = "Smokes (%):";
    }

    else {
        var yLabel = 'Obesity:';
    }

    console.log(xLabel, yLabel);

    //create tooltip
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br>${xLabel} ${styleX(d[chosenXAxis], chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}%`);
        });

    circlesGroup.call(toolTip);

    //mouse on and over action
    circlesGroup.on("mouseover", toolTip.show)
        .on("mouseout", toolTip.hide);

    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function (censusData) {

    // 1- parse data
    //=============================
    censusData.forEach(function (data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.smokes = +data.smokes;
    });

    console.log(censusData)
    //2- Create Scale function 
    //=============================
    // xLinearScale function above csv import
    var xLinearScale = xScale(censusData, chosenXAxis);

    // Create y scale function
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(censusData, d => d.healthcare)])
        .range([height, 0]);

    // 3- Create initial axis functions
    //=============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //4- Append Axis to the chart
    //=============================
    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    //5- create circles
    //=============================
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", 12)
        .attr("fill", "lightblue")
        .attr("opacity", ".5");

    // 6- Create Texts inside circles
    //=============================    
    var textGroup = chartGroup.selectAll(".stateText")
        .append("text")
        .data(censusData)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("dx", -8)
        .attr("dy", 3)
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .attr("fill", "white")
        .text(function (d) {
            return d.abbr
        });

    var xLabelsGroup = chartGroup.append('g')
        .attr('transform', `translate(${width / 2}, ${height + 10 + margin.top})`);

    var povertyLabel = xLabelsGroup.append('text')
        .classed('aText', true)
        .classed('active', true)
        .attr('x', 0)
        .attr('y', 20)
        .attr('value', 'poverty')
        .text('In Poverty (%)');

    var ageLabel = xLabelsGroup.append('text')
        .classed('aText', true)
        .classed('inactive', true)
        .attr('x', 0)
        .attr('y', 40)
        .attr('value', 'age')
        .text('Age (Median)');

    var incomeLabel = xLabelsGroup.append('text')
        .classed('aText', true)
        .classed('inactive', true)
        .attr('x', 0)
        .attr('y', 60)
        .attr('value', 'income')
        .text('Household Income (Median)')

    var yLabelsGroup = chartGroup.append('g')
        .attr('transform', `translate(${0 - margin.left / 4}, ${height / 2})`);

    var healthcareLabel = yLabelsGroup.append('text')
        .classed('aText', true)
        .classed('active', true)
        .attr('x', 0)
        .attr('y', 0 - 20)
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .attr('value', 'healthcare')
        .text('Without Healthcare (%)');

    var smokesLabel = yLabelsGroup.append('text')
        .classed('aText', true)
        .classed('inactive', true)
        .attr('x', 0)
        .attr('y', 0 - 40)
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .attr('value', 'smokes')
        .text('Smoker (%)');

    var obesityLabel = yLabelsGroup.append('text')
        .classed('aText', true)
        .classed('inactive', true)
        .attr('x', 0)
        .attr('y', 0 - 60)
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .attr('value', 'obesity')
        .text('Obese (%)');
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function () {

            // get value of selection
            var value = d3.select(this).attr("value");
            if (value != chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(censusData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderXAxis(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                //update text
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                //change of classes changes text
                if (chosenXAxis === 'poverty') {
                    povertyLabel.classed('active', true).classed('inactive', false);
                    ageLabel.classed('active', false).classed('inactive', true);
                    incomeLabel.classed('active', false).classed('inactive', true);
                }
                else if (chosenXAxis === 'age') {
                    povertyLabel.classed('active', false).classed('inactive', true);
                    ageLabel.classed('active', true).classed('inactive', false);
                    incomeLabel.classed('active', false).classed('inactive', true);
                }
                else {
                    povertyLabel.classed('active', false).classed('inactive', true);
                    ageLabel.classed('active', false).classed('inactive', true);
                    incomeLabel.classed('active', true).classed('inactive', false);
                }
            }
        });

    // y axis labels event listener
    yLabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");

            if (value != chosenYAxis) {

                // replaces chosenXAxis with value
                chosenYAxis = value;

                //console.log(chosenYAxis)

                // functions here found above csv import
                // updates y scale for new data
                yLinearScale = yScale(censusData, chosenYAxis);

                // updates y axis with transition
                yAxis = renderYAxis(yLinearScale, yAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                //update text
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                if (chosenYAxis === 'obesity') {
                    obesityLabel.classed('active', true).classed('inactive', false);
                    smokesLabel.classed('active', false).classed('inactive', true);
                    healthcareLabel.classed('active', false).classed('inactive', true);
                }
                else if (chosenYAxis === 'smokes') {
                    obesityLabel.classed('active', false).classed('inactive', true);
                    smokesLabel.classed('active', true).classed('inactive', false);
                    healthcareLabel.classed('active', false).classed('inactive', true);
                }
                else {
                    obesityLabel.classed('active', false).classed('inactive', true);
                    smokesLabel.classed('active', false).classed('inactive', true);
                    healthcareLabel.classed('active', true).classed('inactive', false);
                }
            }
        });

}).catch(function (error) {
    console.log(error);
});
