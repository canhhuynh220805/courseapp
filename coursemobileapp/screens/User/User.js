import { useContext } from "react";
import { Button } from "react-native-paper";
import { MyUserContext } from "../../utils/contexts/MyContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, View } from "react-native";
import MyStyles from "../../styles/MyStyles";

const User = () => {
    const [,dispatch] = useContext(MyUserContext);

    const logout = async () => {
        AsyncStorage.removeItem("token");
        dispatch({
            "type": "logout"
        });
    }

    return (
        <View style={MyStyles.padding}>
            <Text style={MyStyles.title}>PROFILE</Text>

            <Button mode="contained-tonal" icon="account" onPress={logout}>Đăng xuất</Button>
         </View>
    );
}

export default User;