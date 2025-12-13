import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './index.css';
import * as d3 from 'd3';

function Slider() {
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState('');
    const [frequency, setFrequency] = useState(0.5);
    const [output, setOutput] = useState('');

    useEffect(() => {
        // Fetch the list of available CSV files from the server
        const fetchFiles = async () => {
            try {
                const response = await axios.get('http://localhost:5000/files');
                setFiles(response.data.files);
                if (response.data.files.length > 0) {
                    setSelectedFile(response.data.files[0]);
                }
            } catch (error) {
                console.error('Error fetching files:', error);
            }
        };

        fetchFiles();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedFile) {
            setOutput('Please select a CSV file.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/run-octave', {
                file: selectedFile,
                frequency
            });
            const parsedData = d3.csvParseRows(response.data.data);
            const times = parsedData.map(d => +d[0]);
            const values = parsedData.map(d => +d[1]);
            plotWaveform(times, values);
            setOutput('Waveform generated successfully.');
        } catch (error) {
            setOutput(`Error: ${error.response ? error.response.data.error : error.message}`);
        }
    };

    const plotWaveform = (times, values) => {
        const margin = { top: 10, right: 30, bottom: 30, left: 60 },
              width = 800 - margin.left - margin.right,
              height = 400 - margin.top - margin.bottom;

        d3.select("#waveform").html(""); // Clear previous waveform

        const svg = d3.select("#waveform")
                      .append("svg")
                      .attr("width", width + margin.left + margin.right)
                      .attr("height", height + margin.top + margin.bottom)
                      .append("g")
                      .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear()
                    .domain(d3.extent(times))
                    .range([0, width]);
        const y = d3.scaleLinear()
                    .domain([d3.min(values), d3.max(values)])
                    .range([height, 0]);

        svg.append("g")
           .attr("transform", `translate(0,${height})`)
           .call(d3.axisBottom(x));

        svg.append("g")
           .call(d3.axisLeft(y));

        svg.append("path")
           .datum(times.map((t, i) => ({ t, value: values[i] })))
           .attr("fill", "none")
           .attr("stroke", "steelblue")
           .attr("stroke-width", 1.5)
           .attr("d", d3.line()
                        .x(d => x(d.t))
                        .y(d => y(d.value)));
    };

    return (
        <div className=" flex flex-col items-center justify-center p-2 bg-blue-hover ">
            <header className="App-header">
                <p className="text-2xl font-bold mb-4">GNU Octave Runner</p>
                <form onSubmit={handleSubmit} className="flex flex-col items-center">
                    <div className="mb-4">
                        <label htmlFor="file" className="block text-sm font-medium text-gray-700">Select CSV File</label>
                        <select
                            id="file"
                            value={selectedFile}
                            onChange={(e) => setSelectedFile(e.target.value)}
                            className="mt-1 p-2 border rounded"
                        >
                            {files.map(file => (
                                <option key={file} value={file}>{file}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">Frequency: {frequency}</label>
                        <input
                            type="range"
                            id="frequency"
                            min="0"
                            max="1"
                            step="0.01"
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            className="mt-1"
                        />
                    </div>
                    <button type="submit" className="p-2 bg-green-500 text-white rounded-md">Run Script</button>
                </form>
                <h2 className="text-xl font-semibold mt-6">Output:</h2>
                <p className="text-red-500">{output}</p>
                <div id="waveform" className="mt-6"></div>
            </header>
        </div>
    );
}

export default Slider;
