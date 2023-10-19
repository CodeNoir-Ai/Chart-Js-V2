"use client";

import D3JS from "./components/D3";
import Head from "next/head";
import Nav from "./components/Navbar.js"
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
   
    {/* <Nav /> */}



    <D3JS />

      <div>
       
      </div>
    </div>
  );
}
