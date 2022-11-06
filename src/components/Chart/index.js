import { AdvancedChart } from "react-tradingview-embed";

export default function Chart() {
  return (
    <>
      <AdvancedChart
        widgetProps={{
          width: "100%",
          height: "100%",
          // autosize: true,
          symbol: "UNISWAP3POLYGON:WBTCUSDC",
          interval: "1H",
          range: "1D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          allow_symbol_change: false,
          container_id: "uniswap-v3-pair",
        }}
      />
    </>
  );
}
