import { Outlet } from "react-router-dom";
import Navbar from "../common/Navbar";
import Footer from "../common/Footer";
import GrievanceWidget from "../common/GrievanceWidget";

function ConsumerLayout() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <GrievanceWidget />
      <Footer />
    </>
  );
}

export default ConsumerLayout;
