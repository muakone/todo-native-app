import {
  Appearance,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import React, { useState, useContext, useEffect } from "react";
import { Colors } from "@/constants/Colors";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ThemeContext } from "@/context/ThemeContext";
import { Inter_500Medium, useFonts } from "@expo-google-fonts/inter";
import { Octicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import Animated, { LinearTransition } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = () => {
  const [todoInput, setTodoInput] = useState("");
  const [todo, setTodo] = useState([]);

  const [loaded, error] = useFonts({
    Inter_500Medium,
  });


  useEffect(() => {
    const fetchData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("TodoApp");
        const storageTodo = jsonValue != null ? JSON.parse(jsonValue) : null;
        if (storageTodo && storageTodo.length) {
          setTodo(storageTodo.sort((a, b) => b.id - a.id));
        } else {
          setTodo([]);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const storeData = async () => {
      try {
        const jsonValue = JSON.stringify(todo);
        await AsyncStorage.setItem("TodoApp", jsonValue);
      } catch (e) {
        console.error(e);
      }
    };

    storeData();
  }, [todo]);

  if (!loaded && !error) {
    return null;
  }

  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);
  // const colorScheme = Appearance.getColorScheme();
  // const theme = colorScheme === "dark" ? Colors.dark : Colors.light;
  const styles = createStyles(theme, colorScheme);

  const Container = Platform.OS === "web" ? ScrollView : SafeAreaView;

  const handleSubmit = (event) => {
    // Add a new item with an `updated` status
    event.preventDefault();
    if (todoInput.trim()) {
      const newTodo = {
        id: Date.now().toString(), // Unique id for each item
        text: todoInput,
        updated: false,
      };
      setTodo([newTodo, ...todo]);
      setTodoInput("");
    }
  };

  // Toggle the `updated` status for an individual todo
  const toggleUpdate = (id) => {
    setTodo(
      todo.map((item, index) =>
        index === id ? { ...item, updated: !item.updated } : item
      )
    );
  };

  // Delete an individual todo
  const deleTodo = (id) => {
    setTodo(todo.filter((_item, index) => index !== id));
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.row}>
      <TouchableOpacity
        style={{ width: "80%" }}
        onPress={() => toggleUpdate(index)}
      >
        <Text
          style={[
            styles.todoText,
            item.updated
              ? { textDecorationLine: "line-through", color: "gray" }
              : { textDecorationLine: "none" },
          ]}
        >
          {item.text}
        </Text>
      </TouchableOpacity>
      <MaterialCommunityIcons
        name="delete"
        size={24}
        color={theme.icon}
        onPress={() => deleTodo(index)}
      />
    </View>
  );

  // const footerComp = <Text style={{color: theme.text}}>End of menu</Text>;

  return (
    <Container style={styles.container}>
      <View style={styles.textInputContainer}>
        <TextInput
          placeholder="Enter a todo to add"
          placeholderTextColor={theme.text}
          style={styles.textInput}
          value={todoInput}
          onChangeText={(newText) => setTodoInput(newText)}
          onSubmitEditing={handleSubmit}
        />
        <Pressable
          onPress={() =>
            setColorScheme(colorScheme === "light" ? "dark" : "light")
          }
          style={{ marginLeft: 10 }}
        >
          {colorScheme === "dark" ? (
            <Octicons
              name="moon"
              size={36}
              color={theme.text}
              selectable={undefined}
              style={{ width: 36 }}
            />
          ) : (
            <Octicons
              name="sun"
              size={36}
              color={theme.text}
              selectable={undefined}
              style={{ width: 36 }}
            />
          )}
        </Pressable>
      </View>
      <Animated.FlatList
        data={todo}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        contentContainerStyle={styles.todoContainer}
        ListEmptyComponent={
          <Text style={[styles.text, styles.notFound]}>No items Found</Text>
        }
        itemLayoutAnimation={LinearTransition}
        keyboardDismissMode="on-drag"
      />
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark' } />
    </Container>
  );
};

export default HomeScreen;

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: 20,
      paddingTop: 30,
    },
    text: {
      color: theme.text,
    },
    todoContainer: {
      flexDirection: "column",
      marginHorizontal: "auto",
      marginBottom: 10,
      width: "100%",
      flexGrow: 1,
    },
    notFound: {
      fontSize: 20,
      marginHorizontal: "auto",
      fontFamily: "Inter_500Medium",
    },
    textInputContainer: {
      marginVertical: 30,
      marginHorizontal: "auto",
      width: "100%",
      flexDirection: "row",
    },
    textInput: {
      borderColor: theme.text,
      color: theme.text,
      borderStyle: "solid",
      borderWidth: 1,
      width: "90%",
      maxWidth: 600,
      marginHorizontal: "auto",
      padding: 10,
      fontSize: 18,
      fontFamily: "Inter_500Medium",
    },
    row: {
      width: "100%",
      maxWidth: 600,
      flexDirection: "row",
      marginVertical: 10,
      padding: 10,
      borderColor: theme.text,
      borderStyle: "solid",
      borderBottomWidth: 1,
      justifyContent: "space-between",
      marginHorizontal: "auto",
      overflow: "hidden",
    },
    todoText: {
      color: theme.text,
      fontSize: 18,
      fontFamily: "Inter_500Medium",
    },
  });
}
