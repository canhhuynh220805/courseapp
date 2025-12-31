import Home from "./screens/Home/Home";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import Lesson from "./screens/Home/Lesson";
import {NavigationContainer} from "@react-navigation/native";
import Register from "./screens/User/Register";
import Login from "./screens/User/Login";
import {Icon} from "react-native-paper";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {MyUserContext} from "./utils/contexts/MyContext";
import {useContext, useReducer} from "react";
import MyUserReducer from "./utils/reducers/MyUserReducer";
import User from "./screens/User/User";
<<<<<<< HEAD
=======
import LecturerHome from "./screens/Lecturer/LecturerHome";
>>>>>>> fe19560e1ab6043edbeade9524f5c8eb2b548eff
import StudentProgress from "./screens/Lecturer/StudentProgress";
import LecturerHome from "./screens/Lecturer/LecturerHome";
import AddCourse from "./screens/Lecturer/AddCourse";
<<<<<<< HEAD
import LessonDetail from "./screens/Home/LessonDetail";
=======
import AddLesson from "./screens/Lecturer/AddLesson";
>>>>>>> fe19560e1ab6043edbeade9524f5c8eb2b548eff

const Stack = createNativeStackNavigator();

const CourseStack = () => {
  return (
<<<<<<< HEAD
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="Course"
        component={Home}
        options={{title: "Khóa học"}}
      />
      <Stack.Screen
        name="Lesson"
        component={Lesson}
        options={{title: "Bài học"}}
      />
      <Stack.Screen
        name="LessonDetail"
        component={LessonDetail}
        options={{title: "Chi tiết Bài học"}}
      />
=======
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CourseHome" component={Home} options={{ title: "Danh sách khóa học" }} />
      <Stack.Screen name="Lesson" component={Lesson} options={{ title: "Chi tiết bài học" }} />
>>>>>>> fe19560e1ab6043edbeade9524f5c8eb2b548eff
    </Stack.Navigator>
  );
};

const LecturerStack = () => (
  <Stack.Navigator>
<<<<<<< HEAD
    <Stack.Screen
      name="LecturerHome"
      component={LecturerHome}
      options={{title: "Quản lý khóa học"}}
    />
    <Stack.Screen
      name="StudentProgress"
      component={StudentProgress}
      options={{title: "Tiến độ sinh viên"}}
    />
    <Stack.Screen
      name="AddCourse"
      component={AddCourse}
      options={{title: "Tạo khóa học"}}
    />
=======
    <Stack.Screen name="LecturerHome" component={LecturerHome} options={{ title: "Quản lý khóa học" }} />
    <Stack.Screen name="StudentProgress" component={StudentProgress} options={{ title: "Tiến độ sinh viên" }} />
    <Stack.Screen name="AddCourse" component={AddCourse} options={{ title: "Tạo khóa học" }} />
    <Stack.Screen name="AddLesson" component={AddLesson} options={{ title: "Thêm bài học mới" }} />
  </Stack.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="Register" component={Register} />
>>>>>>> fe19560e1ab6043edbeade9524f5c8eb2b548eff
  </Stack.Navigator>
);

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const [user] = useContext(MyUserContext);

  return (
<<<<<<< HEAD
    <Tab.Navigator>
      <Tab.Screen
        name="Main"
        component={StackNavigator}
        options={{
          title: "Trang chủ",
          tabBarIcon: () => <Icon color="blue" source="home" size={26} />,
=======
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: "blue" }}>
      <Tab.Screen
        name="Main"
        component={CourseStack}
        options={{
          title: "Khóa học",
          headerShown: false,
          tabBarIcon: ({ color }) => <Icon color={color} source="home" size={26} />
>>>>>>> fe19560e1ab6043edbeade9524f5c8eb2b548eff
        }}
      />

      {user?.role === "LECTURER" && (
        <Tab.Screen
          name="Manage"
          component={LecturerStack}
          options={{
            title: "Giảng dạy",
<<<<<<< HEAD
            tabBarIcon: () => <Icon color="blue" source="school" size={26} />,
=======
            headerShown: false,
            tabBarIcon: ({ color }) => <Icon color={color} source="school" size={26} />
>>>>>>> fe19560e1ab6043edbeade9524f5c8eb2b548eff
          }}
        />
      )}

      {user === null ? (
<<<<<<< HEAD
        <>
          <Tab.Screen
            name="Login"
            component={Login}
            options={{
              title: "Đăng nhập",
              tabBarIcon: () => <Icon color="blue" source="login" size={26} />,
            }}
          />
          <Tab.Screen
            name="Register"
            component={Register}
            options={{
              title: "Đăng ký",
              tabBarIcon: () => (
                <Icon color="blue" source="account-plus" size={26} />
              ),
            }}
          />
        </>
=======
        <Tab.Screen
          name="Auth"
          component={AuthStack}
          options={{
            title: "Đăng nhập",
            headerShown: false,
            tabBarIcon: ({ color }) => <Icon color={color} source="login" size={26} />
          }}
        />
>>>>>>> fe19560e1ab6043edbeade9524f5c8eb2b548eff
      ) : (
        <Tab.Screen
          name="Profile"
          component={User}
          options={{
            title: "Cá nhân",
<<<<<<< HEAD
            tabBarIcon: () => <Icon color="blue" source="account" size={26} />,
=======
            tabBarIcon: ({ color }) => <Icon color={color} source="account" size={26} />
>>>>>>> fe19560e1ab6043edbeade9524f5c8eb2b548eff
          }}
        />
      )}
    </Tab.Navigator>
  );
};

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <MyUserContext.Provider value={[user, dispatch]}>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </MyUserContext.Provider>
  );
};

export default App;
