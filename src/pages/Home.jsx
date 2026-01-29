import { useEffect } from "react";
import Categories from "../components/Categories";
import LatestCollection from "../components/LatestCollection";

const Home = () => {
  useEffect(() => {
    document.title = "Historich-Fleur";
  }, []);

  return (
    <div className="pt-36">
      <Categories />
      <LatestCollection />
    </div>
  );
};

export default Home;
