import { useEffect, useState } from "react";
import Apis, { endpoints } from "../utils/Apis";
import { Chip } from "react-native-paper";
import { TouchableOpacity, View } from "react-native";
import MyStyles from "../styles/MyStyles";

const Categories = ({ setCate }) => {
    const [categories, setCategories] = useState([]);

    const loadCategories = async () => {
        let res = await Apis.get(endpoints['categories']);
        setCategories(res.data);
    }

    useEffect(() => {
        loadCategories();
    }, []);

    return (
        <View style={MyStyles.row}>
            <TouchableOpacity  onPress={() => setCate(null)}>
                <Chip icon="label" style={MyStyles.margin}>Tất cả</Chip>
            </TouchableOpacity>

            {categories.map(c => <TouchableOpacity  key={c.id} onPress={() => setCate(c.id)}>
                <Chip icon="label" style={MyStyles.margin}>{c.name}</Chip>
            </TouchableOpacity>)}
        </View>
    );
}

export default Categories;