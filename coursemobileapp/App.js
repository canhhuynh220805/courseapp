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
import LecturerHome from "./screens/Lecturer/LecturerHome";
import StudentProgress from "./screens/Lecturer/StudentProgress";
import AddCourse from "./screens/Lecturer/AddCourse";

const Stack = createNativeStackNavigator();

const CourseStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CourseHome" component={Home} options={{ title: "Danh sách khóa học" }} />
      <Stack.Screen name="Lesson" component={Lesson} options={{ title: "Chi tiết bài học" }} />
    </Stack.Navigator>
  );
}

const LecturerStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="LecturerHome" component={LecturerHome} options={{ title: "Quản lý khóa học" }} />
    <Stack.Screen name="StudentProgress" component={StudentProgress} options={{ title: "Tiến độ sinh viên" }} />
    <Stack.Screen name="AddCourse" component={AddCourse} options={{ title: "Tạo khóa học" }} />
  </Stack.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="Register" component={Register} />
  </Stack.Navigator>
);

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const [user] = useContext(MyUserContext);

  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: "blue" }}>
      <Tab.Screen 
        name="Main" 
        component={CourseStack} 
        options={{ 
          title: "Khóa học", 
          headerShown: false,
          tabBarIcon: ({ color }) => <Icon color={color} source="home" size={26} /> 
        }} 
      />

      {user?.role === "LECTURER" && (
        <Tab.Screen 
          name="Manage" 
          component={LecturerStack} 
          options={{ 
            title: "Giảng dạy", 
            headerShown: false,
            tabBarIcon: ({ color }) => <Icon color={color} source="school" size={26} /> 
          }} 
        />
      )}
      
      {user === null ? (
        <Tab.Screen 
          name="Auth" 
          component={AuthStack} 
          options={{ 
            title: "Đăng nhập", 
            headerShown: false,
            tabBarIcon: ({ color }) => <Icon color={color} source="login" size={26} /> 
          }} 
        />
      ) : (
        <Tab.Screen 
          name="Profile" 
          component={User} 
          options={{ 
            title: "Cá nhân", 
            tabBarIcon: ({ color }) => <Icon color={color} source="account" size={26} /> 
          }} 
        />
      )}
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