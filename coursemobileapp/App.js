import Home from "./screens/Home/Home";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Lesson from "./screens/Home/Lesson";
import { NavigationContainer } from "@react-navigation/native";
import Register from "./screens/User/Register";
import Login from "./screens/User/Login";
import { Icon } from "react-native-paper";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MyUserContext } from "./utils/contexts/MyContext";
import { useContext, useReducer } from "react";
import MyUserReducer from "./utils/reducers/MyUserReducer";
import User from "./screens/User/User";

const Stack = createNativeStackNavigator();

const StackNavigatior = () => {
  
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Course" component={Home} options={{title: "Khóa học"}} />
      <Stack.Screen name="Lesson" component={Lesson} options={{title: "Bài học"}} />
    </Stack.Navigator>
  );
}

const Tab = createBottomTabNavigator();
const TabNavigator = () => {
  const [user, ] = useContext(MyUserContext);
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={StackNavigatior} options={{title: "Màn hình chính", tabBarIcon: () => <Icon color="blue" source="home" size={30} />}} />
      {user===null?<>
        <Tab.Screen name="Register" component={Register} options={{title: "Đăng ký", tabBarIcon: () => <Icon color="blue" source="account" size={30} />}} />
        <Tab.Screen name="Login" component={Login} options={{title: "Đăng nhập", tabBarIcon: () => <Icon color="blue" source="login" size={30} />}} />
      </>:<>
        <Tab.Screen name="Profile" component={User} options={{title: "Profile", tabBarIcon: () => <Icon color="blue" source="account" size={30} />}} />
      </>}
      
    </Tab.Navigator>
  );
}

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <MyUserContext.Provider value={[user, dispatch]}>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </MyUserContext.Provider>
  );
}

export default App;