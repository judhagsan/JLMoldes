import Mcontent from "./components/M/Mcontent.js";
import NavBar from "./components/NavBar.js";
import cadastro from "./components/Cadastro.js";
import Rcontent from "./components/R/RContent.js";
import Ccontent from "./components/C/Ccontent.js";
import Gastos from "./components/Gastos/Gastos.js";

const Home = () => {
  return (
    <div>
      <NavBar
        Rcontent={Rcontent}
        MContent={Mcontent}
        Ccontent={Ccontent}
        Cadastro={cadastro}
        Gastos={Gastos}
      />
      {/* <Footer /> */}
    </div>
  );
};

export default Home;
