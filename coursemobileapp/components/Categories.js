import { useEffect, useState } from "react";
import Apis, { endpoints } from "../utils/Apis";
import { Chip } from "react-native-paper";
import { ScrollView, TouchableOpacity, View } from "react-native";
import styles from "../screens/Home/styles";

const Categories = ({ setCate, activeCate = null }) => {
  const [categories, setCategories] = useState([]);

  const loadCategories = async () => {
    let res = await Apis.get(endpoints["categories"]);
    setCategories(res.data);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <View style={styles.categoriesContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContent}
      >
        <TouchableOpacity onPress={() => setCate(null)}>
          <Chip
            selected={activeCate === null}
            style={[
              styles.categoryChip,
              activeCate === null && styles.categoryChipActive,
            ]}
            textStyle={[
              styles.categoryText,
              activeCate === null && styles.categoryTextActive,
            ]}
            showSelectedOverlay
          >
            Tất cả
          </Chip>
        </TouchableOpacity>

        {categories.map((c) => (
          <TouchableOpacity key={c.id} onPress={() => setCate(c.id)}>
            <Chip
              selected={activeCate === c.id}
              style={[
                styles.categoryChip,
                activeCate === c.id && styles.categoryChipActive,
              ]}
              textStyle={[
                styles.categoryText,
                activeCate === c.id && styles.categoryTextActive,
              ]}
            >
              {c.name}
            </Chip>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default Categories;
