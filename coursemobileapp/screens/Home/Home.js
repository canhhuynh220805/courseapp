import {useState} from "react";
import Categories from "../../components/Categories";
import Courses from "../../components/Courses";

const Home = () => {
  const [cate, setCate] = useState(null);

  return (
    <>
      <Categories setCate={setCate} activeCate={cate} />
      <Courses cate={cate} />
    </>
  );
};

export default Home;
