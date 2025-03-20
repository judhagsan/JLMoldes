import M1content from "./components/Mcontent.js";
import NavBar from "./components/NavBar.js";
import cadastro from "./components/Cadastro.js";

const Home = () => {
  return (
    <div>
      <NavBar MContent={M1content} Cadastro={cadastro} />
      {/* <Footer /> */}
    </div>
  );
};

export default Home;
