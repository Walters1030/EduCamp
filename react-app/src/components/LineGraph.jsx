import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, TextField } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import axios from "axios";
import dayjs from "dayjs";
import config from "./config";

const LineGraphAnalytics = () => {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(dayjs().subtract(30, "day").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/analytics/daily-category`, {
        params: { startDate, endDate },
      });

      const rawData = response.data.data;
      const categorySet = new Set();

      const formattedData = rawData.reduce((acc, { date, categories }) => {
        if (!acc[date]) acc[date] = { date };
        Object.entries(categories).forEach(([category, count]) => {
          categorySet.add(category);
          acc[date][category] = count;
        });
        return acc;
      }, {});

      const processedData = Object.values(formattedData);
      const categoriesArray = Array.from(categorySet);

      processedData.forEach((entry) => {
        categoriesArray.forEach((category) => {
          if (!entry[category]) entry[category] = 0;
        });
      });

      setData(processedData);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const categoryColors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6384", "#36A2EB", "#9966FF", "#4BC0C0"];

  return (
    <Card sx={{ width: "100%", maxWidth: 1000, height: 615, p: 3, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", marginTop: 2.5 }}>
      <CardContent sx={{ width: "100%" }}>
        <Typography variant="h6" gutterBottom textAlign="center">Category Trends Over Time</Typography>
        
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2 }}>
          <TextField type="date" label="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} sx={{ width: 150 }} />
          <TextField type="date" label="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} sx={{ width: 150 }} />
        </Box>
        <ResponsiveContainer width="100%" height={450}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, "auto"]} />
            <Tooltip />
            <Legend />
            {data.length > 0 &&
              Object.keys(data[0])
                .filter((key) => key !== "date")
                .map((category, index) => (
                  <Line key={index} type="monotone" dataKey={category} stroke={categoryColors[index % categoryColors.length]} dot={{ r: 4 }} strokeWidth={2} />
                ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default LineGraphAnalytics;