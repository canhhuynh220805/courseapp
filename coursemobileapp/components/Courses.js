import { useEffect, useState } from "react";
import { ActivityIndicator, Image, TouchableOpacity, View } from "react-native";
import { FlatList } from "react-native";
import Apis, { endpoints } from "../utils/Apis";
import MyStyles from "../styles/MyStyles";
import { List, Searchbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const Courses = ({ cate }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const nav = useNavigation();

    const loadCourses = async () => {
        try {
            setLoading(true);

            let url = `${endpoints['courses']}?page=${page}`;

            if (q) {
                url = `${url}&q=${q}`;
            }

            if (cate) {
                url = `${url}&category_id=${cate}`;
            }

            console.info(url);

            let res = await Apis.get(url);

            if (res.data.next === null)
                setPage(0);

            if (page === 1)
                setCourses(res.data.results);
            else if (page > 1)
                setCourses([...courses, ...res.data.results]);

        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let timer = setTimeout(() => {
            if (page > 0)
                loadCourses();
        }, 500);

        return () => clearTimeout(timer);
    }, [q, page, cate]);

    useEffect(() => {
        setPage(1);
    }, [q, cate]);

    const loadMore = () => {
        if (page > 0 && !loading)
            setPage(page + 1);
    }

    return (
        <View style={MyStyles.padding}>
            <Searchbar placeholder="Tìm khóa học..." value={q} onChangeText={setQ} />
            <FlatList ListFooterComponent={loading && <ActivityIndicator size="large" />}
                onEndReached={loadMore} data={courses} renderItem={({ item }) => <List.Item
                    title={item.subject}
                    description={item.created_date}
                    left={() => <TouchableOpacity onPress={() => nav.navigate("Lesson", { "courseId": item.id })}>
                        <Image source={{ uri: item.image }} style={MyStyles.avatar} />
                    </TouchableOpacity>}
                />} />

        </View>
    );
}

export default Courses;