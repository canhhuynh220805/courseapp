import { useState } from "react";
import Categories from "../../components/Categories";
import Courses from "../../components/Courses";

const Home = () => {
    const [cate, setCate] = useState();

    return (
        <>
            <Categories setCate={setCate} />
            <Courses cate={cate} />
        </>
    );
}

export default Home;