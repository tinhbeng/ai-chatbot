import { formatTime, formatTimeToUtc, timeFormatLocal } from "@/lib/date";
import { formatPrice, isNumber } from "@/lib/number";
import { LucideTimerOff } from "lucide-react";
import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// ...data như trên...

export default function PriceAreaChart({
  data,
  timeFrame,
}: {
  data: any;
  timeFrame: string;
}) {

  const dateTimeFormatter = (time: number, timeFrame: string) => {
    let pattern;

    if (["15m", "1H", "4H"].includes(timeFrame)) {
      pattern = "dd, HH:mm";
    } else if (timeFrame === "12H") {
      pattern = "MM/dd HH:mm";
    } else {
      pattern = "MM/dd";
    }

    return formatTime(time, pattern);
  };

  const newData = useMemo(() => {
    if (data?.content?.[0]?.text) {
      const text = data.content[0].text;
      const startIndex = text.indexOf('{');
      const jsonString = text.slice(startIndex);
      const dataObj = JSON.parse(jsonString);
      // Nếu data là object chứa mảng, ví dụ: { data: [...] }
      const dataArray = dataObj.data;
      return dataArray?.items
    } else if (data?.data?.items) { 
      return data?.data?.items
    } else {
      return []
    }
  }, [data])
  return (
    <div className="p-4 rounded border">
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <AreaChart data={newData}>
            <defs>
              <linearGradient id="colorPriceChart" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="unixTime"
              minTickGap={30}
              tick={{ fontSize: 12 }}
              tickFormatter={(time) => dateTimeFormatter(time, timeFrame)}
            />
            <YAxis
              dataKey="value"
              tick={{ fontSize: 12 }}
              domain={["auto", "auto"]}
              tickFormatter={(val) => formatPrice(val)}
            />
            <Tooltip content={<ChartCustomTooltip />} />
            {/* <CartesianGrid strokeDasharray="3 3" /> */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="#82ca9d"
              fillOpacity={1}
              fill="url(#colorPriceChart)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const ChartCustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload?.length === 0) return null;
    return (
      <div className='w-60 flex flex-col gap-2 rounded bg-secondary p-2.5 text-xs'>
        <div className='text-zinc-500'>{formatTimeToUtc(payload[0]?.payload?.unixTime)}</div>
        <div className='flex gap-2'>
            <span className='text-zinc-500'>Price:</span>
            <span>${formatPrice(payload[0]?.value)}</span>
        </div>
      </div>
    );
  };