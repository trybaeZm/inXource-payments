import React from "react";
import { Helmet } from "react-helmet-async";

import Hero from "../Components/Hero";
import About from "../Components/About";
import Footer from "../Components/Footer";
import NavBar from "../Components/Navbar";
import Pricing from "../Components/Pricing";
import Contact from "../Components/Contact";
import Services from "../Components/Services";
import Portfolio from "../Components/Portfolio";

const HomePage = () => {
  return (
    <>
      {/* <NavBar /> */}
      <Hero />
      {/* <About />
      <Services />
      <Portfolio />
      <Pricing />
      <Contact /> */}
      {/* <Footer /> */}
    </>
  );
};

export default HomePage;
