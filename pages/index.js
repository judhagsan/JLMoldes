import M1content from "./components/Mcontent.js";
import NavBar from "./components/NavBar.js";
import cadastro from "./components/Cadastro.js";
import R1content from "./components/R1Content.js";

const Home = () => {
  return (
    <div>
      <NavBar R1={R1content} MContent={M1content} Cadastro={cadastro} />
      {/* <Footer /> */}
    </div>
  );
};

export default Home;
