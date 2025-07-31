import Head from 'next/head';
import "../styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "../components/layout";
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import LoginPage from "../components/login";

function MyApp({ Component, pageProps }: AppProps) {

  const [Token, setToken]: any = useState(null);

  //hook useEffect
  useEffect(() => {
    { Cookies.get('auth') ? setToken(true) : setToken(false) }
  }, []);

  if (Token === null) {
  } else if (Token === false) {
    return (
      <LoginPage />
    )
  } else {
    return (
      <Layout>
        <Head>
          <title>401SNKRS</title>
          <link rel="shortcut icon" href="/401ico.png" />
        </Head>
        <Component {...pageProps} />
      </Layout>
    )
  }
}
export default MyApp;
