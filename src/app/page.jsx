"use client";

import D3JS from "./components/D3";

import Head from "next/head";

export default function Home() {
  return (
    <div>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
        <meta property="og:title" content="My new title" key="title" />
      </Head>
      {/* <ChartComponent /> */}

      {/* <TradingChart /> */}

      <div>
        {/* <Chartleft /> */}
        <D3JS />
        {/* <ChartContents />
                <Chartright /> */}
      </div>
    </div>
  );
}
