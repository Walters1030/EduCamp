import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend,ResponsiveContainer } from "recharts";
import {Box, TextField, Card, CardContent, Typography } from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import config from "./config";

const PieChartAnalytics = () => {
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
      const categoryCounts = {};

      rawData.forEach(({ categories }) => {
        Object.entries(categories).forEach(([category, count]) => {
          categoryCounts[category] = (categoryCounts[category] || 0) + count;
        });
      });

      setData(Object.entries(categoryCounts).map(([category, count]) => ({ name: category, value: count })));
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6384", "#36A2EB", "#9966FF", "#4BC0C0"];

  return (
<Card sx={{ maxWidth: 500, margin: "auto", mt: 3, p: 2 }}>
  <CardContent sx={{ padding: 3 }}>
    {/* <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>Category Distribution</Typography> */}
                  <Typography variant="h6" sx={{ textAlign: "center", mt: 2, mb: 2, fontWeight: "bold" }}>
                  Category Distribution
                  </Typography>
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      <TextField
        type="date"
        label="Start Date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />
      <TextField
        type="date"
        label="End Date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />
    </Box>
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie 
          data={data} 
          dataKey="value" 
          cx="50%" 
          cy="50%" 
          outerRadius={120}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend 
          wrapperStyle={{ paddingTop: 20 }}
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center"
        />
      </PieChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
  );
};

export default PieChartAnalytics;
