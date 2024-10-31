"use client";
import { useState, useEffect } from "react";
import TodoForm from "@/components/TodoForm"; 
import { FaCheck, FaTrash } from "react-icons/fa"; 
import { CopilotPopup } from "@copilotkit/react-ui";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { v4 as uuidv4 } from "uuid"; 

export default function Home() {
  const now = new Date();
  now.setHours(now.getHours() + 8);
  
  const formattedNow = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const temp = {
    title: "Read Newspaper",
    description: "Write keypoints related to economics.",
    deadline: formattedNow,
    priority: "high",
    color: "red",
  };
  const [todos, setTodos] = useState([temp]);

  useCopilotReadable({
    description: "The current list of todos",
    value: JSON.stringify(todos),
  });

  useCopilotAction({
    name: "addtodo",
    description: "Add the todo from user response",
    parameters: [
      {
        name: "taskname",
        type: "string",
        description: "The name of the task to add",
        required: true,
      },
      {
        name: "taskinfo",
        type: "string",
        description: "The information about the task to add",
        required: true,
      },
      {
        name: "taskdate",
        type: "string",
        description: "The date of the task to add (YYYY-MM-DD format)",
        required: true,
      },
      {
        name: "tasktime",
        type: "string",
        description: "The time of the task to add (HH:MM format)",
        required: true,
      },
      {
        name: "taskpriority",
        type: "string",
        description: "The priority of the task to add (low, medium, high)",
        enum: ["low", "medium", "high"],
        required: true,
      },
      {
        name: "taskcomplete",
        type: "string",
        description: "The task is completed (true/false)",
        required: false,
      },
      {
        name: "taskdelete",
        type: "string",
        description: "Delete the task (true/false)",
        required: false,
      },
    ],
    handler: ({
      taskname,
      taskinfo,
      taskdate,
      tasktime,
      taskpriority,
      taskcomplete,
      taskdelete,
    }) => {
      const taskDeadline = `${taskdate} ${tasktime}`;
      const taskColor = getPriorityColor(taskpriority); 
      const newTodo = {
        title: taskname,
        description: taskinfo,
        deadline: taskDeadline,
        priority: taskpriority,
        color: taskColor,
      };

      const id = addTodo(newTodo); 

      // Mark task as complete if taskcomplete is provided
      if (taskcomplete === "true") {
        completeTodo(id); 
      }

      // Delete task if taskdelete is provided
      if (taskdelete === "true") {
        deleteTodo(id); 
      }
    },
  });

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-200";
      case "medium":
        return "bg-yellow-200";
      case "low":
        return "bg-green-200";
      default:
        return "bg-gray-200";
    }
  };

  const addTodo = (newTodo) => {
    const taskColor = getPriorityColor(newTodo.priority);
    const updatedTodo = {
      ...newTodo,
      color: taskColor,
      id: uuidv4(),
      completed: false,
      createdAt: new Date(),
    };
    const updatedTodos = [...todos, updatedTodo];
    sortTodos(updatedTodos); // Sort the todos after adding
  };

  const deleteTodo = (id) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
  };

  const completeTodo = (id) => {
    const updatedTodos = todos.map((todo) => {
      if (todo.id === id) {
        return { ...todo, completed: !todo.completed }; 
      }
      return todo;
    });
    sortTodos(updatedTodos);
  };

  const sortTodos = (updatedTodos) => {
    const priorityOrder = { High: 1, Medium: 2, Low: 3 };
    updatedTodos.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1; 
      if (priorityOrder[a.priority] === priorityOrder[b.priority]) {
        return new Date(a.deadline) - new Date(b.deadline);
      }
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    setTodos(updatedTodos);
  };

  const filterTodosByDateAndPriority = (daysFromNow) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysFromNow);

    const priorityOrder = { High: 1, Medium: 2, Low: 3 };

    return todos
      .filter((todo) => {
        const todoDate = new Date(todo.deadline);
        return todoDate.toDateString() === targetDate.toDateString();
      })
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  };

  const filterUpcomingTodos = () => {
    const today = new Date();
    return todos.filter((todo) => new Date(todo.deadline) > today);
  };

  const calculateRemainingTime = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;
    const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor(
      (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    return daysLeft >= 0 && hoursLeft >= 0
      ? `${daysLeft} days ${hoursLeft} hours left`
      : "Expired";
  };

  useEffect(() => {
    sortTodos(todos);
  }, [todos]);

  return (
<div className="container mx-auto p-8 bg-gradient-to-br from-indigo-200 via-indigo-300 to-blue-400 rounded-xl shadow-2xl" style={{ perspective: '1000px' }}>
  <h1 className="text-5xl font-bold mb-12 text-center text-slate-900 drop-shadow-md tracking-wide transform transition-transform duration-500 hover:rotate-x-3 hover:rotate-y-3">
    Task Manager
  </h1>

  {/* Add Todo Form */}
  <div className="flex justify-center mb-12">
    <TodoForm addTodo={addTodo} className="transform transition-transform duration-500 hover:scale-105 hover:rotate-2" />
  </div>

  {/* Section for Today's Tasks */}
  <div className="mb-12">
    <h2 className="text-4xl font-semibold text-slate-800 mb-6 border-b-2 border-slate-300 pb-2 transform transition-transform duration-500 hover:rotate-y-6">
      Today&apos;s Tasks
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {filterTodosByDateAndPriority(0).map((todo) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          completeTodo={completeTodo}
          deleteTodo={deleteTodo}
          calculateRemainingTime={calculateRemainingTime}
          className="bg-white p-6 rounded-lg shadow-3xl transition-transform transform hover:-rotate-y-6 hover:-rotate-x-3 hover:scale-105 hover:translate-z-5"
        />
      ))}
    </div>
  </div>

  {/* Section for Tomorrow's Tasks */}
  <div className="mb-12">
    <h2 className="text-4xl font-semibold text-slate-800 mb-6 border-b-2 border-slate-300 pb-2 transform transition-transform duration-500 hover:rotate-y-6">
      Tomorrow&apos;s Tasks
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {filterTodosByDateAndPriority(1).map((todo) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          completeTodo={completeTodo}
          deleteTodo={deleteTodo}
          calculateRemainingTime={calculateRemainingTime}
          className="bg-white p-6 rounded-lg shadow-3xl transition-transform transform hover:-rotate-y-6 hover:-rotate-x-3 hover:scale-105 hover:translate-z-5"
        />
      ))}
    </div>
  </div>

  {/* Section for Upcoming Tasks */}
  <div className="mb-12">
    <h2 className="text-4xl font-semibold text-slate-800 mb-6 border-b-2 border-slate-300 pb-2 transform transition-transform duration-500 hover:rotate-y-6">
      Upcoming Tasks
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {filterUpcomingTodos().map((todo) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          completeTodo={completeTodo}
          deleteTodo={deleteTodo}
          calculateRemainingTime={calculateRemainingTime}
          className="bg-white p-6 rounded-lg shadow-3xl transition-transform transform hover:-rotate-y-6 hover:-rotate-x-3 hover:scale-105 hover:translate-z-5"
        />
      ))}
    </div>
  </div>

  {/* Copilot Popup */}
  <CopilotPopup
    instructions="You are assisting the user as best as you can. Answer in the best way possible given the data you have."
    labels={{
      title: "Priority-Based TODO LIST",
      initial: "What's your plan?",
    }}
    // className="transform transition-transform duration-500 hover:scale-105 hover:rotate-2"
  />
</div>


  );
}

function TodoCard({ todo, completeTodo, deleteTodo, calculateRemainingTime }) {
  return (
    <div
      className={`border-2 border-blue-700 p-5 rounded-lg shadow-lg transition-transform transform hover:scale-105 ${todo.color} flex flex-col justify-between`}
    >
      <div>
        <h3
          className={`text-xl font-bold ${
            todo.completed ? "line-through text-gray-500" : "text-gray-900"
          }`}
        >
          {todo.title}
        </h3>
        <p
          className={`font-medium ${
            todo.completed ? "line-through text-gray-500" : "text-gray-700"
          }`}
        >
          {todo.description}
        </p>
        <p
          className={`font-semibold ${
            todo.completed ? "line-through text-gray-500" : "text-gray-700"
          }`}
        >
          <strong>Deadline:</strong> {todo.deadline}
        </p>
        <p
          className={`font-semibold ${
            todo.completed ? "line-through text-gray-500" : "text-gray-700"
          }`}
        >
          <strong>Remaining Time:</strong>{" "}
          {calculateRemainingTime(todo.deadline)}
        </p>
        <p
          className={`font-semibold ${
            todo.completed ? "line-through text-gray-500" : "text-gray-700"
          }`}
        >
          <strong>Priority:</strong> {todo.priority}
        </p>
      </div>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => completeTodo(todo.id)} // Use the unique id to complete the todo
          className={`px-3 py-2 rounded-md text-white ${
            todo.completed ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          } shadow-md transition-colors duration-200`}
        >
          <FaCheck />
        </button>
        <button
          onClick={() => deleteTodo(todo.id)} // Use the unique id to delete the todo
          className="px-3 py-2 bg-red-600 text-white rounded-md shadow-md hover:bg-red-700 transition-colors duration-200"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}
