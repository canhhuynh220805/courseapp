import { useEffect, useState } from "react";
import Apis, { endpoints } from "../utils/Apis";
import { View } from "react-native";
import { Chip } from "react-native-paper";
import MyStyles from "../styles/MyStyles";

const Categories = () => {
  const [categories, setCategories] = useState([]);

  const loadCategories = async () => {
    let res = await Apis.get(endpoints["categories"]);
    setCategories(res.data);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <View>
      {categories.map((c) => (
        <Chip icon="label" style={MyStyles.margin} key={c.id}>
          {c.name}
        </Chip>
      ))}
    </View>
  );
};

export default Categories;
