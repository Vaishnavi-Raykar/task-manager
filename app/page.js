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
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const addTodo = (newTodo) => {
    const updatedTodo = {
      ...newTodo,
      color: getPriorityColor(newTodo.priority),
      id: uuidv4(),
      completed: false,
      createdAt: new Date(),
    };
    const updatedTodos = [...todos, updatedTodo];
    sortTodos(updatedTodos);
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

  return (
    <div className="container mx-auto p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700  shadow-2xl " style={{ perspective: '1000px' }}>
      <h1 className="text-5xl font-bold mb-12 text-center text-slate-100 drop-shadow-md tracking-wide transform transition-transform duration-500 hover:rotate-x-6 hover:rotate-y-3">
        Task Manager
      </h1>

      <div className="flex justify-center mb-12">
        <TodoForm addTodo={addTodo} className="transition-transform duration-500 hover:scale-105" />
      </div>

      <div className="mb-12">
        <h2 className="text-4xl font-semibold text-slate-300 mb-6 border-b border-slate-500 pb-2">
          Tasks
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {todos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              completeTodo={completeTodo}
              deleteTodo={deleteTodo}
            />
          ))}
        </div>
      </div>

      <CopilotPopup
        instructions="You are assisting the user as best as you can. Answer in the best way possible given the data you have."
        labels={{
          title: "Priority-Based TODO LIST",
          initial: "What's your plan?",
        }}
      />
    </div>
  );
}

function TodoCard({ todo, completeTodo, deleteTodo }) {
  return (
    <div
      className={`relative p-6 rounded-xl shadow-2xl transition-transform transform hover:scale-105 ${todo.color} flex flex-col justify-between`}
      style={{
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.7)',
        background: 'linear-gradient(145deg, #2d2d2d, #3e3e3e)',
      }}
    >
      <div>
        <h3 className={`text-2xl font-bold ${todo.completed ? "line-through text-gray-400" : "text-white"}`}>
          {todo.title}
        </h3>
        <p className={`font-medium ${todo.completed ? "line-through text-gray-400" : "text-gray-300"}`}>
          {todo.description}
        </p>
        <p className={`font-semibold ${todo.completed ? "line-through text-gray-400" : "text-gray-400"}`}>
          <strong>Deadline:</strong> {todo.deadline}
        </p>
        <p className={`font-semibold ${todo.completed ? "line-through text-gray-400" : "text-gray-400"}`}>
          <strong>Priority:</strong> {todo.priority}
        </p>
      </div>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => completeTodo(todo.id)}
          className={`px-3 py-2 rounded-md text-white ${todo.completed ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"} shadow-md transition-transform transform hover:scale-110`}
        >
          <FaCheck />
        </button>
        <button
          onClick={() => deleteTodo(todo.id)}
          className="px-3 py-2 bg-red-600 text-white rounded-md shadow-md hover:bg-red-700 transition-transform transform hover:scale-110"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}

