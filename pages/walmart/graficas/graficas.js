import React from 'react'
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
)

const getOptions = (text) => {
	const options =	{
		responsive: true,
		plugins: {
			legend: {
				position: 'top'
			},
			title: {
				display: true,
				text
			}
		}
	}
	return options
}

const getData = (d, labels, dataSetTitle) => {
	const data = {
		labels,
		datasets: [
			{
				label: dataSetTitle,
				data: d,
				borderColor: 'rgb(255, 99, 132)',
				backgroundColor: 'rgba(255, 99, 132, 0.5)'
			}
		]
	}
	return data
}

export default function Graficas ({ chartsTitle, dataSetTitle, data, labels }) {
	const dataFormatter = getData(data, labels, dataSetTitle)
	return <Line options={getOptions(chartsTitle)} data={dataFormatter} />
}
